#!/bin/zsh
# Publish the site bundle through a real CDN with a moving pointer.
#
#   default mode      stamp a build id into lrw_bundle.txt, commit everything,
#                     move the pointer, push, purge the pointer at jsDelivr.
#   --pointer-only    the caller already committed its data file (wire.json…);
#                     keep the current build id, just move the pointer to HEAD.
#
# version.txt = "<build-id> <commit>". Pages read it with cache:'no-store'
# (purged here on every push), then load lrw_bundle.txt / lrft.js / data
# pinned to that commit: immutable at the CDN, cached a year in browsers.
set -e
cd /Users/peterbauman/.lr-cache/lr-media
MODE=full
if [[ "$1" == "--pointer-only" ]]; then MODE=pointer; shift; fi
MSG="${1:-bundle update}"

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
git add -A
git reset -q -- version.txt 2>/dev/null || true
git commit -q -m "$MSG"
else
STAMP=$(cut -d' ' -f1 version.txt)
[[ -n "$STAMP" ]] || { echo "version.txt has no build id"; exit 1; }
fi

# two writers now (this Mac + the wire Action): rebase onto the remote first so
# the pointer names a commit that contains everything published so far
git pull -q --rebase --autostash origin main
H=$(git rev-parse HEAD)
# third token: which hosts may render the overlay (suffix match). The launch
# switch lives here, not in Webflow. Override with LRW_HOSTS=... or set_hosts.sh
HOSTS="${LRW_HOSTS:-$(cut -d' ' -f3 version.txt 2>/dev/null)}"
HOSTS="${HOSTS:-webflow.io,localhost}"
print -r -- "$STAMP $H $HOSTS" > version.txt
git add version.txt
git commit -q -m "pointer -> ${H:0:12}" -- version.txt
git push -q

# purge the pointer at the CDN and make sure the edge really re-read GitHub
WANT="$STAMP $H $HOSTS"
ok=0
for i in {1..12}; do
  curl -s -m 20 "https://purge.jsdelivr.net/gh/monkantony/lr-media@main/version.txt" >/dev/null || true
  sleep 3
  GOT=$(curl -s -m 20 "https://cdn.jsdelivr.net/gh/monkantony/lr-media@main/version.txt" | tr -d '\n' || true)
  if [[ "$GOT" == "$WANT" ]]; then ok=1; break; fi
done
if (( ! ok )); then echo "WARNING: CDN pointer still '$GOT' (want '$WANT') — pages fall back to raw until it moves"; exit 2; fi
for i in {1..10}; do
  code=$(curl -s -o /dev/null -w '%{http_code}' -m 30 "https://cdn.jsdelivr.net/gh/monkantony/lr-media@$H/lrw_bundle.txt")
  [[ "$code" == "200" ]] && break
  sleep 3
done
[[ "$code" == "200" ]] || { echo "WARNING: pinned bundle not yet served ($code)"; exit 2; }
echo "published: build $STAMP @ ${H:0:12} hosts=$HOSTS (pointer live at CDN)"
