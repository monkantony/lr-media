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
cd /Users/peterbauman/.lr-cache/lr-media
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
STAMP=$(date +%Y%m%d%H%M%S)
python3 - "$STAMP" <<'PY'
import json, sys, re
stamp=sys.argv[1]
B='/Users/peterbauman/.lr-cache/lr-media/lrw_bundle.txt'
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
import json; open('/tmp/bc.js','w').write(json.load(open('/Users/peterbauman/.lr-cache/lr-media/lrw_bundle.txt'))['js'])"
node --check /tmp/bc.js

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
H=$(git rev-parse HEAD)
print -r -- "$STAMP $H $HOSTS" > version.txt
git add version.txt
git commit -q -m "pointer -> ${H:0:12}" -- version.txt
git push -q

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
