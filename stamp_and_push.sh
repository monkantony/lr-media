#!/bin/zsh
# Publish the site bundle through a real CDN with a moving pointer.
#
#   default mode      stamp a build id into lrw_bundle.txt, commit the publish
#                     files, move the pointer, push, purge the pointer at
#                     jsDelivr, and refuse to say "published" until the CDN
#                     really serves it.
#   --pointer-only    the caller already committed its data file; keep the
#                     current build id, just move the pointer to HEAD.
#
# version.txt = "<build-id> <commit> <hosts>". Pages read it with cache:'no-store'
# (purged here on every push), then load lrw_bundle.txt / lrft.js / data pinned
# to that commit. <hosts> is the launch switch (comma list, suffix match, or *);
# it is NEVER defaulted: set it with LRW_HOSTS=... or ./set_hosts.sh.
# Env: LRW_HOSTS (override the hosts token), LRW_INCLUDE_UNTRACKED=1 (publish
# untracked files outside the known publish areas).
set -e
# The repo is wherever this script lives (or LR_MEDIA_REPO); nothing here assumes Peter's Mac.
REPO="${LR_MEDIA_REPO:-$(cd "$(dirname "$0")" && pwd)}"
export LR_MEDIA_REPO="$REPO"
cd "$REPO"
MODE=full
if [[ "$1" == "--pointer-only" ]]; then MODE=pointer; shift; fi
MSG="${1:-bundle update}"

# ---- the hosts token: strict, never silently defaulted -----------------------
OLD_STAMP=""; OLD_COMMIT=""; OLD_HOSTS=""
[[ -f version.txt ]] && read -r OLD_STAMP OLD_COMMIT OLD_HOSTS < version.txt || true
HOSTS="${LRW_HOSTS:-$OLD_HOSTS}"
HOSTS="${HOSTS//[[:space:]]/}"; HOSTS="${HOSTS:l}"
for _h in ${(s:,:)HOSTS}; do [[ -e "$_h" ]] && { echo "REFUSING: host '$_h' is a file in this directory (an unquoted * ?)"; exit 1; }; done
if [[ ! "$HOSTS" =~ '^(\*|[a-z0-9.-]+(,[a-z0-9.-]+)*)$' ]]; then
  echo "REFUSING: hosts token is '$HOSTS' (version.txt was '$OLD_STAMP $OLD_COMMIT $OLD_HOSTS')."
  echo "version.txt must be '<build> <commit> <hosts>'. Set it explicitly: LRW_HOSTS=\"webflow.io,localhost\" $0 ..."
  exit 1
fi

if [[ $MODE == full ]]; then
# ---- 17 Oct 2026 audit (A5-01): never sweep up another session's edits ----------
# Twice in two days a publish shipped files the publisher never meant to: a whole-file copy from a
# stage folder rolled back approved features (16 Oct), and uncommitted edits another session had left
# in this shared clone went out inside an unrelated publish (17 Oct). Core site code may only ship when
# the caller names it: LR_EXPECT="lrft.js,native/" (comma list of paths or path prefixes).
# Changes outside LR_EXPECT refuse the publish. Data-only publishes (json/txt data) are unaffected.
CORE_RX='^(lrft\.js|lrw_bundle\.txt|cmdk\.js|native/|subjects/.*\.js|people/.*\.js|stamp_and_push\.sh|set_hosts\.sh)'
CHANGED=$(git status --porcelain | awk '{print $NF}')
CORE_CHANGED=$(print -r -- "$CHANGED" | grep -E "$CORE_RX" || true)
if [[ -n "$LR_EXPECT" ]]; then
  for _f in ${(f)CHANGED}; do
    _ok=0; for _e in ${(s:,:)LR_EXPECT}; do [[ "$_f" == "$_e" || "$_f" == "$_e"* ]] && _ok=1; done
    [[ $_ok == 1 ]] || { echo "REFUSING: '$_f' is modified but not in LR_EXPECT ($LR_EXPECT). Someone else's edit? Nothing was published."; exit 1; }
  done
elif [[ -n "$CORE_CHANGED" ]]; then
  echo "REFUSING: core site code is modified in this clone and LR_EXPECT is not set:"
  print -r -- "$CORE_CHANGED"
  echo "If these are YOUR changes, re-run with LR_EXPECT=\"<files>\" $0 \"msg\". If not, they belong to another session: stop and ask. Nothing was published."
  exit 1
fi
# ---- 17 Oct 2026 /security-review (infra, 8/10): new untracked files are vetted BEFORE any git add ----
# The extension globs below stage untracked files in every subdirectory before the untracked-files guard runs,
# so that guard never saw them (proved with scratch/webflow_token.json + notes.txt in a throwaway clone).
# Now every untracked file is checked first: secret-shaped names always refuse; a new top-level file needs
# LR_EXPECT; a new file elsewhere is allowed only where that folder already publishes that file type.
if [[ "$LRW_INCLUDE_UNTRACKED" != 1 ]]; then
  for _f in ${(f)"$(git status --porcelain --untracked-files=all | grep '^??' | cut -c4-)"}; do
    [[ -z "$_f" ]] && continue
    _named=0; for _e in ${(s:,:)LR_EXPECT}; do [[ -n "$_e" && ( "$_f" == "$_e" || "$_f" == "$_e"* ) ]] && _named=1; done
    if print -r -- "$_f" | grep -qiE '(\.env|secret|token|credential|password|apikey|api_key|\.pem|\.key|id_rsa|client_secret)'; then
      echo "REFUSING: '$_f' looks like a secret and must never reach the public repo. Nothing was published."; exit 1
    fi
    [[ $_named == 1 ]] && continue
    if [[ "$_f" != */* ]]; then
      echo "REFUSING: new top-level file '$_f'. Name it in LR_EXPECT if it really should be public. Nothing was published."; exit 1
    fi
    _dir=${_f%%/*}; _ext=${_f##*.}
    if [[ -z "$(git ls-files -- "$_dir/*.$_ext" | head -1)" ]]; then
      echo "REFUSING: new file '$_f': $_dir/ has never published .$_ext files. Name it in LR_EXPECT if intended. Nothing was published."; exit 1
    fi
  done
fi
STAMP=$(date +%Y%m%d%H%M%S)
python3 - "$STAMP" <<'PY'
import json, sys, re, os
stamp=sys.argv[1]
B=os.path.join(os.environ['LR_MEDIA_REPO'], 'lrw_bundle.txt')
b=json.load(open(B)); j=b['js']
j=re.sub(r'var LRW_BUILD = "[0-9]*";\n', '', j)
j=re.sub(r'var LRWB = \(window\.LRW_RAW[^\n]*\n', '', j)
j=re.sub(r'/\* -+ self-healing cache:.*?\}\)\(\);\n', '', j, flags=re.S)
assert not re.search(r'/\* -+ self-healing cache', j) and 'var LRWB' not in j, 'old header not fully stripped'
assert j.count('LRWB+') + j.count('LRWB +') >= 10, 'bundle no longer references LRWB — refusing to stamp'
CHECK = '''var LRW_BUILD = "%s";
var LRWB = (window.LRW_RAW || 'https://raw.githubusercontent.com/monkantony/lr-media/main/');
/* ---------- self-healing cache: a moved build id refreshes the page once (raw path only; the CDN path reads a fresh pointer every load) ---------- */
(function(){
  if (window.LRW_COMMIT) return;
  var V = 'https://cdn.jsdelivr.net/gh/monkantony/lr-media@main/version.txt';
  try {
    fetch(V, { cache: 'no-store' }).then(function(r){ return r.ok ? r.text() : ''; }).then(function(t){
      t = (t || '').trim().split(/\\s+/)[0];
      if (!t || t === LRW_BUILD) return;
      if (sessionStorage.getItem('lrw-refreshed') === t) return;   /* never loop */
      fetch(LRWB + 'lrw_bundle.txt', { cache: 'reload' })
        .then(function(){ sessionStorage.setItem('lrw-refreshed', t); location.reload(); })
        .catch(function(){});   /* a failed refresh must not disarm the check */
    }).catch(function(){});
  } catch (e) {}
})();
''' % stamp
b['js'] = CHECK + j
json.dump(b, open(B,'w'), ensure_ascii=False, separators=(',',':'))
print("stamped build", stamp)
PY
python3 -c "
import json; open('/tmp/bc.js','w').write(json.load(open('$REPO/lrw_bundle.txt'))['js'])"
node --check /tmp/bc.js
# the Webflow-native /editorials runs the same modules from native/lrn.js, generated from this bundle (5 Oct 2026).
# A failure here never blocks the publish: live is unaffected; the native page keeps its last good lrn.js.
if [[ -f native/build.py ]]; then
  if python3 native/build.py && node --check native/lrn.js; then git add -- native 2>/dev/null || true
  else echo "!! native/lrn.js NOT rebuilt: native/build.py failed (the native /editorials keeps the previous build)"; git checkout -q -- native/lrn.js 2>/dev/null || true; fi
fi
# lrft.js ships the article header, footer and player, and it is a template literal: a single
# stray backtick in the CSS ends the sheet and takes all three with it (20 Sep 2026).
node --check lrft.js

# ---- the publish gate: render what is about to ship, at five widths ------------
# Peter, 20 Sep 2026: "Every fix this week was proved by a throwaway script I wrote and abandoned,
# which is why the same class of bug kept coming back." The suite lives in ~/lr-harness and fails
# this publish if the two floating headers have drifted, the window is opening on the wrong frame,
# the calendar is painting the wrong rows red, search misses the archive, the page has lost its
# title, or any module died. About 90 seconds. Full publishes only — the hourly pointer moves do
# not re-render the site. LR_SKIP_GATE=1 to publish anyway; it says loudly that you did.
GATE="${LR_GATE:-$HOME/lr-harness/publish_gate.js}"
if [[ "$LR_SKIP_GATE" == 1 ]]; then
  echo "!! publish gate SKIPPED (LR_SKIP_GATE=1)"
elif [[ -f "$GATE" ]]; then
  echo "-- publish gate"
  node "$GATE" || { echo "REFUSING: the publish gate failed. Nothing was committed or pushed."; exit 1; }
else
  # 17 Oct 2026 audit (A5-08): fail closed. A missing gate used to publish unchecked.
  echo "REFUSING: publish gate not found at $GATE. Set LR_GATE, or LR_SKIP_GATE=1 to publish unchecked on purpose."
  exit 1
fi

# ---- stage only publish files; jsDelivr keeps commit-pinned files forever ------
git add -u
git add -- ann pod idents audio 2>/dev/null || true
git add -- '*.json' '*.txt' '*.mp4' '*.jpg' '*.png' '*.m4a' '*.mp3' '*.xml' '*.js' '*.sh' 2>/dev/null || true
git reset -q -- version.txt 2>/dev/null || true
LEFT=$(git status --porcelain | grep '^??' || true)
if [[ -n "$LEFT" && "$LRW_INCLUDE_UNTRACKED" != 1 ]]; then
  echo "REFUSING: unexpected untracked files would be published to the public repo (permanent at the CDN):"
  print -r -- "$LEFT"
  echo "Move them out, or re-run with LRW_INCLUDE_UNTRACKED=1 to publish them."
  git reset -q
  exit 1
fi
if [[ -n "$LEFT" && "$LRW_INCLUDE_UNTRACKED" == 1 ]]; then
  git add -A && git reset -q -- version.txt 2>/dev/null || true   # the override really stages them (6 Sep: calendar.json was left behind)
fi
git commit -q -m "$MSG"
else
STAMP="$OLD_STAMP"
[[ -n "$STAMP" ]] || { echo "version.txt has no build id"; exit 1; }
fi

# two writers (this Mac + the wire Action): rebase onto the remote first so the
# pointer names a commit that contains everything published so far
git pull -q --rebase --autostash origin main
# the other writer may have moved the pointer meanwhile: unless the hosts token
# was given explicitly, take stamp/hosts from the REBASED version.txt so a race
# can never regress the launch switch or the build id
if [[ -f version.txt ]]; then
  read -r R_STAMP R_COMMIT R_HOSTS < version.txt || true
  if [[ -z "$LRW_HOSTS" && -n "$R_HOSTS" ]]; then HOSTS="${R_HOSTS//[[:space:]]/}"; HOSTS="${HOSTS:l}"; fi
  if [[ $MODE == pointer && -n "$R_STAMP" ]]; then STAMP="$R_STAMP"; fi
  [[ "$HOSTS" =~ '^(\*|[a-z0-9.-]+(,[a-z0-9.-]+)*)$' ]] || { echo "REFUSING after rebase: hosts token '$HOSTS' is invalid"; exit 1; }
fi
# ---- content first, pointer last (14 Oct 2026) ---------------------------------
# At ~18:15 the pointer reached jsDelivr before the commit's files did: jsDelivr cached a 404 for
# search_index.json at the new SHA and www ⌘K hung on "Opening the archive…" until it was purged.
# So: push the content alone, fetch EVERY file changed since the commit the pointer names at the
# new SHA until jsDelivr and raw both answer 200 (purging any 404), and only then move the pointer.
# Same rule as ~/lr-people/lrm_publish.sh. Files over jsDelivr's 20 MB limit are checked on raw only.
REPO_GH=monkantony/lr-media
served() {   # $1 = path at $H; 0 when the CDNs serve it, otherwise purges a jsDelivr miss
  local j r sz
  sz=$(git cat-file -s "$H:$1" 2>/dev/null || echo 0)
  r=$(curl -s -o /dev/null -w '%{http_code}' -m 60 "https://raw.githubusercontent.com/$REPO_GH/$H/$1")
  (( sz > 20000000 )) && { [[ $r == 200 ]]; return; }
  j=$(curl -s -o /dev/null -w '%{http_code}' -m 60 "https://cdn.jsdelivr.net/gh/$REPO_GH@$H/$1")
  [[ $j == 200 && $r == 200 ]] && return 0
  [[ $j != 200 ]] && curl -s -o /dev/null -m 20 "https://purge.jsdelivr.net/gh/$REPO_GH@$H/$1"
  return 1
}
for _sync in 1 2 3; do
  H=$(git rev-parse HEAD)
  if [[ -n "$(git rev-list origin/main..HEAD 2>/dev/null)" ]]; then
    for _try in 1 2 3; do
      git push -q origin HEAD:main && break
      if [[ $_try == 3 ]]; then echo "REFUSING: git push failed three times. The commits are local; nothing was published. Run again."; exit 1; fi
      echo "content push failed (attempt $_try); retrying in 20s"; sleep 20
    done
  fi
  read -r _B_STAMP BASE _B_HOSTS < version.txt || true
  git cat-file -e "${BASE}^{commit}" 2>/dev/null || BASE="HEAD~1"
  FILES=(${(f)"$(git diff --name-only --diff-filter=d "$BASE" "$H" -- . ':!version.txt')"})
  pending=($FILES)
  (( ${#pending} )) && echo "content ${H:0:12}: waiting until the CDNs serve ${#pending} changed files"
  for round in {1..24}; do
    (( ${#pending} == 0 )) && break
    left=()
    for f in $pending; do served "$f" || left+=("$f"); done
    pending=($left)
    (( ${#pending} == 0 )) && break
    echo "  round $round: ${#pending} not served yet (e.g. ${pending[1]}); retrying in 15s"
    sleep 15
  done
  (( ${#pending} == 0 )) || { echo "REFUSING: ${#pending} files still not served at ${H:0:12} (e.g. ${pending[1]}). The content is pushed; the POINTER WAS NOT MOVED. Re-run: ./stamp_and_push.sh --pointer-only"; exit 1; }
  # the other writer may have pushed while we waited: fold it in and warm its files too
  git pull -q --rebase --autostash origin main
  [[ "$(git rev-parse HEAD)" == "$H" ]] && break
  echo "origin moved while warming; checking the new commits too"
  read -r R_STAMP R_COMMIT R_HOSTS < version.txt || true
  if [[ -z "$LRW_HOSTS" && -n "$R_HOSTS" ]]; then HOSTS="${R_HOSTS//[[:space:]]/}"; HOSTS="${HOSTS:l}"; fi
  if [[ $MODE == pointer && -n "$R_STAMP" ]]; then STAMP="$R_STAMP"; fi
  [[ "$HOSTS" =~ '^(\*|[a-z0-9.-]+(,[a-z0-9.-]+)*)$' ]] || { echo "REFUSING after rebase: hosts token '$HOSTS' is invalid"; exit 1; }
  [[ $_sync == 3 ]] && { echo "REFUSING: origin kept moving; content is pushed, pointer not moved. Re-run: ./stamp_and_push.sh --pointer-only"; exit 1; }
done
print -r -- "$STAMP $H $HOSTS" > version.txt
git add version.txt
git commit -q -m "pointer -> ${H:0:12}" -- version.txt
# 21 Sep 2026: GitHub answered a push with a 504 and the publish stopped here with the commits
# made and the pointer unmoved. A transient gateway error gets three tries; a real failure says
# plainly that the commits are local and nothing was published.
for _try in 1 2 3; do
  git push -q && break
  if [[ $_try == 3 ]]; then echo "REFUSING: git push failed three times. The content is served; only the pointer commit is local. Run again: ./stamp_and_push.sh --pointer-only"; exit 1; fi
  echo "pointer push failed (attempt $_try); retrying in 20s"; sleep 20
done

# the native /editorials falls back to @main/native/lrn.js while jsDelivr still answers 403 for a just-pushed commit:
# purge that one file every time so the fallback is never an old build (single-file purges are not throttled like the pointer)
curl -s -m 20 'https://purge.jsdelivr.net/gh/monkantony/lr-media@main/native/lrn.js' >/dev/null 2>&1 || true

# ---- purge the pointer at the CDN and prove the edge serves it ----------------
WANT="$STAMP $H $HOSTS"
POINTER="https://cdn.jsdelivr.net/gh/monkantony/lr-media@main/version.txt"
PURGE="https://purge.jsdelivr.net/gh/monkantony/lr-media@main/version.txt"
jget() { python3 -c 'import sys,json
try: print(json.load(sys.stdin).get(sys.argv[1],""))
except Exception: print("")' "$1"; }
ok=0; GOT=""
for round in 1 2 3 4; do
  RESP=$(curl -s -m 20 "$PURGE" || true)
  PID=$(print -r -- "$RESP" | jget id); PST=$(print -r -- "$RESP" | jget status)
  t=0
  while [[ -n "$PID" && "$PST" != "finished" && $t -lt 60 ]]; do
    sleep 5; t=$((t+5))
    PST=$(curl -s -m 20 "https://purge.jsdelivr.net/status/$PID" | jget status)
  done
  for i in 1 2 3 4 5 6; do
    GOT=$(curl -s -m 20 "$POINTER" | tr -d '\n' || true)
    if [[ "$GOT" == "$WANT" ]]; then ok=1; break; fi
    sleep 5
  done
  (( ok )) && break
  echo "CDN still serves '$GOT' after purge round $round; waiting before purging again (jsDelivr throttles repeat purges)"
  sleep 45
done
if (( ! ok )); then
  echo "FAILED: the CDN still serves '$GOT' (wanted '$WANT')."
  echo "GitHub has the new pointer; browsers on the CDN path keep the OLD pointer for up to 12h; the raw path is unaffected."
  echo "Re-run later:  ./stamp_and_push.sh --pointer-only"
  exit 2
fi
for i in {1..10}; do
  code=$(curl -s -o /dev/null -w '%{http_code}' -m 30 "https://cdn.jsdelivr.net/gh/monkantony/lr-media@$H/lrw_bundle.txt")
  [[ "$code" == "200" ]] && break
  sleep 3
done
[[ "$code" == "200" ]] || { echo "FAILED: pinned bundle not served yet ($code); pages fall back to raw until it is. Re-run: ./stamp_and_push.sh --pointer-only"; exit 2; }
echo "published: build $STAMP @ ${H:0:12} hosts=$HOSTS (pointer verified at the CDN)"
