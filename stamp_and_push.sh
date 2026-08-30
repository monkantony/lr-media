#!/bin/zsh
# Stamp a build id into the bundle + a tiny version file, then push.
# Pages check the version file on load and refresh themselves when it moves.
set -e
cd /Users/peterbauman/.lr-cache/lr-media
STAMP=$(date +%Y%m%d%H%M%S)
python3 - "$STAMP" <<'PY'
import json, sys, re
stamp=sys.argv[1]
B='/Users/peterbauman/.lr-cache/lr-media/lrw_bundle.txt'
b=json.load(open(B)); j=b['js']
j=re.sub(r'var LRW_BUILD = "[0-9]*";\n', '', j)
j=re.sub(r'/\* -+ self-healing cache:.*?\}\)\(\);\n', '', j, flags=re.S)
CHECK = '''var LRW_BUILD = "%s";
/* ---------- self-healing cache: a moved build id refreshes the page once ---------- */
(function(){
  var V = 'https://raw.githubusercontent.com/monkantony/lr-media/main/version.txt';
  try {
    fetch(V, { cache: 'no-store' }).then(function(r){ return r.text(); }).then(function(t){
      t = (t || '').trim();
      if (!t || t === LRW_BUILD) return;
      if (sessionStorage.getItem('lrw-refreshed') === t) return;   /* never loop */
      fetch('https://raw.githubusercontent.com/monkantony/lr-media/main/lrw_bundle.txt', { cache: 'reload' })
        .then(function(){ sessionStorage.setItem('lrw-refreshed', t); location.reload(); })
        .catch(function(){});   /* a failed refresh must not disarm the check */
    }).catch(function(){});
  } catch (e) {}
})();
''' % stamp
j = CHECK + j
b['js']=j
json.dump(b, open(B,'w'), ensure_ascii=False, separators=(',',':'))
open('/Users/peterbauman/.lr-cache/lr-media/version.txt','w').write(stamp)
print("stamped build", stamp)
PY
python3 -c "
import json; open('/tmp/bc.js','w').write(json.load(open('/Users/peterbauman/.lr-cache/lr-media/lrw_bundle.txt'))['js'])"
node --check /tmp/bc.js
git add -A && git commit -q -m "${1:-bundle update}" && git push -q
echo "pushed: $STAMP"
