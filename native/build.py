#!/usr/bin/env python3
"""native/build.py: native/lrn.js, the behaviour of the Webflow-native /editorials page (5 Oct 2026).

The native page is the live page's finished HTML, built in Webflow (no hidden page, no injected HTML, no
flash). What it still needs is everything the bundle DOES: dice and editions, the Window programme, the
podcast player, YouTube, roll-call hovers, Archive search, ⌘K, Wire, calendar, radio, subject overlay ...
Rewriting that would fork it, so this file is generated from lrw_bundle.txt on every publish
(stamp_and_push.sh), and the native page always runs the same modules as live, with three native changes:

  1. the edition seed: with no #e= in the URL, the page's own baked edition (".ed-mini" No.) is the seed,
     so the first deal reproduces exactly what is already painted. A re-roll deals a new one as on live.
  2. elements the bundle CREATES and binds only on creation (the Re-roll stamp) are already baked: bind them;
     the self-healing reload never runs (the native page has no stale bundle to refresh)
  2b. the "live inside the site's own chrome" module does not move #lrw: the page already has it in place
     (moving it put the About text above the page).
  3. the Timeline moment of the day reads tl/daily/YYYY-MM.json (tl_daily.py): one moment a day for
     everyone from ALL the Timeline's moments, and "One of N moments" (Peter: "it's always fetter").

The data payload rides inside lrn.js (as live's loader would put it in <script id="lr-data">). The page
loads lrn.js after the load event, pinned to the pointer's commit, so none of it touches first paint.
Every patch is asserted: if the bundle changes under it, this build fails loudly instead of shipping a
page that half works.
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
b = json.load(open(os.path.join(REPO, 'lrw_bundle.txt'), encoding='utf-8'))
js, data, tmpl = b['js'], b['data'], b['html']

# Zones dealt FROM the DOM (Sets builds its deck from the cards on the page; Readers shuffles the cards in place)
# would re-deal differently on a page that is already dealt. lrn.js puts back what live's template starts from, so
# the first deal with the baked seed reproduces exactly what is painted.
i = tmpl.find('class="dz-grid'); assert i > 0, 'native build: no Sets grid in the template'
DZ = re.findall(r'<article class="dz">.*?</article>', tmpl[i:tmpl.find('</section>', i)], re.S)
assert DZ, 'native build: no Sets cards in the template'
i = tmpl.find('class="rd-grid'); assert i > 0, 'native build: no Readers grid in the template'
RD = re.findall(r'<article class="reader[^"]*"[^>]*>\s*<h3 class="rd-word">([^<]+)</h3>', tmpl[i:tmpl.find('</section>', i)])
assert len(RD) >= 2, 'native build: Readers words not found'


def patch(src, old, new, what):
    n = src.count(old)
    assert n == 1, 'native build: %s anchor found %d times (expected 1); the bundle changed under it' % (what, n)
    return src.replace(old, new)


js = patch(js, "var s = m ? +m[1] : (1 + Math.floor(Math.random() * 999999));",
           "var s = m ? +m[1] : (window.__LRN_SEED || (1 + Math.floor(Math.random() * 999999)));", 'edition seed')
js = patch(js, "var baked = [].map.call(grid.querySelectorAll('article.dz'), function(a){ return { html: a.outerHTML }; });",
           "var baked = window.__LRN_DZ ? window.__LRN_DZ.map(function(h){ return { html: h }; }) : [].map.call(grid.querySelectorAll('article.dz'), function(a){ return { html: a.outerHTML }; });",
           'Sets deck')
js = patch(js, "if (host && !document.getElementById('ed-stamp')) {\n        var el = document.createElement('span');",
           "if (host && (window.__LRN || !document.getElementById('ed-stamp'))) { if (!document.getElementById('ed-stamp')) {\n        var el = document.createElement('span');",
           'Re-roll stamp (baked: bind it, do not skip it)')
js = patch(js, "host.appendChild(el);\n        document.getElementById('ed-roll').addEventListener('click', function(){",
           "host.appendChild(el); }\n        document.getElementById('ed-roll').addEventListener('click', function(){", 'Re-roll stamp close')
js = patch(js, "(function(){\n  if (window.LRW_COMMIT) return;", "(function(){\n  if (window.LRW_COMMIT || window.__LRN) return;   /* native: never reload the page */",
           'self-healing reload')
js = patch(js, "if (!bar || bar.querySelector('.lrk-btn')) return;\n    var right = bar.querySelector('.right') || bar;\n    var b = document.createElement('button'); b.type = 'button'; b.className = 'lrk-btn'; b.setAttribute('aria-label', 'Search Le Random'); b.innerHTML = GLASS;",
           "if (!bar) return; var b0 = bar.querySelector('.lrk-btn'); if (b0 && (!window.__LRN || b0.__lrk)) return;   /* native: the phone glass is baked; bind it */\n    var right = bar.querySelector('.right') || bar;\n    var b = b0 || document.createElement('button'); b.__lrk = 1; if (!b0) { b.type = 'button'; b.className = 'lrk-btn'; b.setAttribute('aria-label', 'Search Le Random'); b.innerHTML = GLASS; }",
           'phone search glass')
js = patch(js, "b.addEventListener('click', function () { open(''); });\n    right.insertBefore(b, right.firstChild);",
           "b.addEventListener('click', function () { open(''); });\n    if (!b0) right.insertBefore(b, right.firstChild);", 'phone search glass insert')
js = patch(js, "if (!sec || !img) return;\n    var bg = document.createElement('div');",
           "if (!sec || !img) return;\n    var bg = sec.querySelector('.rc-bg') || document.createElement('div');   /* native: the layer is baked; reuse it */",
           'interviews background layer')
js = patch(js, "var tag = btn.previousElementSibling;\n      if (!tag || !tag.classList || !tag.classList.contains('ed-mini')){",
           "var tag = btn.previousElementSibling;\n      if (!tag || !tag.classList || !tag.classList.contains('ed-mini')) tag = btn.parentNode.querySelector(':scope > .ed-mini') || tag;   /* native: a baked label one step further left (Contributors: label, A-Z, die) */\n      if (!tag || !tag.classList || !tag.classList.contains('ed-mini')){",
           'edition label reuse')
js = patch(js, "var b = document.createElement('button'); b.type = 'button'; b.className = 'rc-order cb-sort'; b.textContent = 'A–Z'; b.setAttribute('aria-pressed', 'false');\n      zh.insertBefore(b, q('.zone-roll', zh) || null);",
           "var b = q('.cb-sort', zh);   /* native: the A-Z button is baked; bind it */\n      if (!b) { b = document.createElement('button'); b.type = 'button'; b.className = 'rc-order cb-sort'; b.textContent = 'A–Z'; b.setAttribute('aria-pressed', 'false');\n      zh.insertBefore(b, q('.zone-roll', zh) || null); }", 'Contributors A-Z button')
# 6 Oct 2026 (Peter: "the window title/links dont change when you skip around"): the native page bakes the masthead and
# the headline (.win-mast, .win-piece) and has no .win-top, so the hero module returned before binding its sync. It now
# reuses what is baked and only builds them on a page that lacks them.
js = patch(js, "if (!top || !type || !title || !sub) return;\n\n    var mast = document.createElement('div'); mast.className = 'win-mast';\n    mast.appendChild(title); mast.appendChild(sub);\n    inner.insertBefore(mast, inner.firstChild);\n    top.remove();",
           "var bakedPiece = type && type.querySelector('.win-piece');   /* native: masthead and headline are baked */\n    if (!bakedPiece) { if (!top || !type || !title || !sub) return;\n\n    var mast = document.createElement('div'); mast.className = 'win-mast';\n    mast.appendChild(title); mast.appendChild(sub);\n    inner.insertBefore(mast, inner.firstChild);\n    top.remove(); }",
           'Window headline: baked masthead')
js = patch(js, "var piece = document.createElement('div'); piece.className = 'win-piece';\n    piece.innerHTML =",
           "var piece = bakedPiece; if (!piece) { piece = document.createElement('div'); piece.className = 'win-piece';\n    piece.innerHTML =",
           'Window headline: baked piece')
js = patch(js, "type.insertBefore(piece, type.firstChild);\n\n    var link = document.getElementById('win-link');",
           "type.insertBefore(piece, type.firstChild); }\n\n    var link = document.getElementById('win-link');",
           'Window headline: baked piece close')
js = patch(js, "if (lrw && foot && foot.parentNode && foot.parentNode !== lrw) foot.parentNode.insertBefore(lrw, foot);",
           "if (!window.__LRN && lrw && foot && foot.parentNode && foot.parentNode !== lrw) foot.parentNode.insertBefore(lrw, foot);",
           'chrome mover')

PROLOGUE = r'''/* Le Random Editorials, native page behaviour. GENERATED by native/build.py from lrw_bundle.txt: do not edit. */
(function(){
  window.__LRN = 1;
  var d = document.createElement('script'); d.id = 'lr-data'; d.type = 'application/json';
  d.textContent = %s; document.body.appendChild(d);
  var ed = document.querySelector('#lrw .ed-mini'), m = ed && ed.textContent.match(/(\d{3,})/);
  window.__LRN_SEED = m ? +m[1] : 0;
  window.__LRN_DZ = %s;
  var g = document.querySelector('#readers .rd-grid'), order = %s;
  if (g) order.forEach(function(w){ [].forEach.call(g.querySelectorAll('article.reader'), function(a){
    var h = a.querySelector('.rd-word'); if (h && h.textContent.trim() === w) g.appendChild(a); }); });
})();
''' % (json.dumps(data, ensure_ascii=False), json.dumps(DZ, ensure_ascii=False), json.dumps(RD, ensure_ascii=False))

EPILOGUE = r'''
/* ---------- native: the Timeline moment of the day, from every moment (tl/daily, tl_daily.py) ---------- */
(function(){
  var y = document.getElementById('tl-year'), t = document.getElementById('tl-title'), b = document.getElementById('tl-body');
  if (!y || !t || !b) return;
  var now = new Date(), key = now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2);
  fetch(LRWB + 'tl/daily/' + key + '.json').then(function(r){ if (!r.ok) throw new Error(r.status); return r.json(); }).then(function(j){
    var e = j.d && j.d[String(now.getDate())]; if (!e) return;
    y.textContent = e.y; t.textContent = e.t; b.textContent = e.b;
    var a = y.closest('a'); if (a && e.s) a.href = 'https://timeline.lerandom.art/m/' + e.s;
    var meta = document.querySelector('.tl-wrap .tl-meta');
    if (meta && j.n) meta.textContent = 'One of ' + Number(j.n).toLocaleString('en-US') + ' moments across ten chapters, from 73,000 years ago to now, edited by Peter Bauman.';
  }).catch(function(){});
})();
'''

EPILOGUE += r'''
/* ---------- native: the calendar MAP (calmap/, built by the people-view session, 5 Oct 2026): List · Map ----------
   The switch sits in the Calendar head; nothing of the map (d3, topojson, the module, its data) loads until Map is
   first chosen. The map draws in its own #pl-map after #pl; the list's refresh only ever replaces #pl's contents. */
(function(){
  var cal = document.getElementById('calendar'), pl = document.getElementById('pl');
  var head = cal && cal.querySelector('.zone-head'); if (!cal || !pl || !head || document.getElementById('pl-map')) return;
  /* 6 Oct 2026 (Peter: "the map view is not loading", "why does it take so long"): LRWB names the pointer's commit,
     which moves ~40 times a day, so every move left the map's 1 MB cold at jsDelivr (1.6-3.2 s a file, three scripts in
     a row: ~8 s) and a just-pushed commit can answer 403 (the map failed). The map files are read from the commit that
     last CHANGED calmap/ (stamped by build.py): one URL across publishes, warm at the CDN and in the browser's cache.
     LRWB's copy is the fallback. */
  var B = '__CALMAP_BASE__' || LRWB + 'calmap/', B2 = LRWB + 'calmap/', css = document.createElement('link');
  css.rel = 'stylesheet'; css.href = B + 'lr-calmap.css'; document.head.appendChild(css);
  var st = document.createElement('style');   /* the zone head orders its parts (title 1, tools 3): the switch is a tool, on the right */
  st.textContent = '#lrw .zone-head.zh .lrcm-seg{order:3;flex:0 0 auto;margin:0;align-self:center}';
  document.head.appendChild(st);
  var seg = document.createElement('div'); seg.className = 'lrcm-seg'; seg.setAttribute('role', 'group'); seg.setAttribute('aria-label', 'Calendar view');
  seg.innerHTML = '<button type="button" aria-pressed="true" data-v="list">List</button><button type="button" aria-pressed="false" data-v="map">Map</button>';
  var x = head.querySelector('.zh-x'); head.insertBefore(seg, x ? x.nextSibling : null);
  var box = document.createElement('div'); box.id = 'pl-map'; box.hidden = true; pl.parentNode.insertBefore(box, pl.nextSibling);
  var loading = null, base = B;
  /* the three scripts download together and run in order (async=false) */
  function script(src){ return new Promise(function(ok, no){ var s = document.createElement('script'); s.src = src; s.async = false;
    s.onload = ok; s.onerror = function(){ s.remove(); no(new Error('could not load ' + src)); }; document.body.appendChild(s); }); }
  /* a failure says why in the console, tries LRWB's copy once, and otherwise leaves the next Map click to try again */
  function fail(e){
    if (window.console) console.warn('LR calendar map:', (e && e.message) || e, base);
    loading = null;
    if (base !== B2) { base = B2; if (!box.hidden) load(); return; }
    if (box.dataset.state !== 'error') box.textContent = 'The map could not load. The list has every date.';
  }
  function load(){
    if (!loading) loading = Promise.all([window.d3 ? 0 : script(base + 'd3.min.js'),
        window.topojson ? 0 : script(base + 'topojson-client.min.js'), window.LRCalMap ? 0 : script(base + 'lr-calmap.js')])
      .then(function(){ window.LRCalMap.mount(box, { calendar: LRWB + 'calendar.json', venues: base + 'venues.json',
        land: base + 'land-50m.json', countries: base + 'countries-50m.json', plates: base + 'plates/' }); })
      .catch(fail);
    return loading;
  }
  /* the module reports a data failure as data-state="error" (its own message beside the map) */
  new MutationObserver(function(){ if (box.dataset.state === 'error' && loading) fail(new Error('map data did not load')); })
    .observe(box, { attributes: true, attributeFilter: ['data-state'] });
  function show(v){
    [].forEach.call(seg.querySelectorAll('button'), function(b){ b.setAttribute('aria-pressed', b.dataset.v === v ? 'true' : 'false'); });
    pl.hidden = v === 'map'; box.hidden = v !== 'map';
    if (v === 'map') load();
  }
  seg.addEventListener('click', function(e){ var b = e.target.closest('button'); if (b) show(b.dataset.v); });
  /* pointing at the switch warms everything the first Map click needs */
  seg.addEventListener('pointerenter', function(){ if (window.LRCalMap) return;
    ['d3.min.js', 'topojson-client.min.js', 'lr-calmap.js', 'venues.json', 'land-50m.json', 'countries-50m.json'].forEach(function(f){
      var l = document.createElement('link'); l.rel = 'prefetch'; l.href = B + f; document.head.appendChild(l); }); }, { once: true });
})();
'''
# the calendar map's files, pinned to the commit that last changed calmap/ (an uncommitted change: LRWB's copy, as before)
import subprocess
def _git(*a): return subprocess.run(['git', '-C', REPO] + list(a), capture_output=True, text=True).stdout.strip()
_cm = _git('log', '-1', '--format=%H', '--', 'calmap')
_cm = '' if not re.fullmatch(r'[0-9a-f]{40}', _cm) or _git('status', '--porcelain', '--', 'calmap') else _cm
EPILOGUE = EPILOGUE.replace("'__CALMAP_BASE__'", repr('https://cdn.jsdelivr.net/gh/monkantony/lr-media@%s/calmap/' % _cm if _cm else ''))
assert '__CALMAP_BASE__' not in EPILOGUE, 'native build: calendar map base not stamped'
DARK = ''.join(re.findall(r'html\.lr-dark[^{}]*\{[^}]*\}', b['css']))
assert DARK, 'native build: no html.lr-dark rules in the bundle css'
DARK += ('html.lr-dark #lrw #iss-jump{background-color:#0A1B21;color:#EFE9D8;border-color:rgba(239,233,216,.55);'
         'background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'14\' height=\'9\' viewBox=\'0 0 14 9\'%3E%3Cpath d=\'M1 1l6 6 6-6\' fill=\'none\' stroke=\'%23EFE9D8\' stroke-width=\'1.4\'/%3E%3C/svg%3E")}'
         'html.lr-dark #lrw #iss-jump option{background:#0A1B21;color:#EFE9D8}')
EPILOGUE += r'''
/* ---------- native: dark-mode rules the baked CSS cannot carry (6 Oct 2026, Peter: "the dark image bug is back on 08
   popular", "the 13 issues dropdown is unreadable"). The pruner never sees html.lr-dark, so the bundle's dark rules are
   added here; data-lr-dark keeps the theme engine from twinning them. The Issues select's shorthand
   (background:var(--paper)url(...)) is one the engine cannot remap: its dark colours are set outright. ---------- */
(function(){
  var s = document.createElement('style'); s.setAttribute('data-lr-dark', ''); s.id = 'lrn-dark';
  s.textContent = %s; document.head.appendChild(s);
})();
''' % json.dumps(DARK)
EPILOGUE += r'''
/* ---------- native: films baked as data-src (the Featured trailer) start as they near the screen ----------
   The page bakes below-the-fold films without a src so nothing downloads at load; this gives them one when they come
   within a screen of view, plays them muted on loop, and pauses them off screen. Peter, 5 Oct 2026: the Goodfellow
   trailer never played on the native page because nothing ever set its src. */
(function(){
  function arm(v){
    if (v.__lrnFilm) return; v.__lrnFilm = 1;
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){
      if (e.isIntersecting) {
        if (!v.getAttribute('src') && v.dataset.src) { v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto'; v.src = v.dataset.src; }
        var p = v.play(); if (p && p.catch) p.catch(function(){});
      } else if (!v.paused) v.pause();
    }); }, { rootMargin: '100% 0px' });
    io.observe(v);
  }
  function scan(){ [].forEach.call(document.querySelectorAll('#lrw video[data-src]'), arm); }
  scan();
  new MutationObserver(function(ms){ for (var i = 0; i < ms.length; i++) if (ms[i].addedNodes.length) { scan(); break; } })
    .observe(document.getElementById('lrw') || document.body, { childList: true, subtree: true });
})();
'''
# ---------- lrn-native-lists (7 Oct 2026, the fully native /editorials, M1) ----------
# On a page where Webflow Collection Lists draw a section (the noindex test page first), the script only enhances:
# it never rewrites what the server rendered. Every guard is keyed to the native markup (.w-dyn-list/.w-dyn-item inside
# the section), so the baked live page runs exactly as before.
js = patch(js, "if (!lead || secs.length < 4) return;",
           "if (!lead || secs.length < 4 || document.querySelector('#latest .w-dyn-list')) return;   /* lrn-native: Latest is drawn by Webflow */",
           'native Latest deal')
js = patch(js, "if (!lead || !window.fetch || !window.DOMParser) return;",
           "if (!lead || !window.fetch || !window.DOMParser || document.querySelector('#latest .w-dyn-list')) return;   /* lrn-native: the CMS is the newest */",
           'native live-newest')
js = patch(js, "var link = document.getElementById('win-link');\n    function sync(){\n      var href = link ? (link.getAttribute('href') || '') : '';",
           "var link = document.getElementById('win-link'); var lrnHome = link ? link.getAttribute('href') : '';\n    function sync(){\n      var href = link ? (link.getAttribute('href') || '') : '';\n"
           "      if (piece.closest && piece.closest('.w-dyn-item') && !piece.__lrnMoved) { if (href === lrnHome) return; piece.__lrnMoved = 1; }   /* lrn-native: the first piece is server-rendered */",
           'native Window piece')
js = patch(js, "if (p.src) { vid.src = p.src; }",
           "if (p.src) { if ((vid.getAttribute('src') || '').split('?')[0] !== p.src.split('?')[0]) vid.src = p.src; }   /* lrn-native: the same film does not reload */",
           'native Window film')
js = patch(js, "var h = q('#featured .cover-h'); if (!h || q('br', h)) return;",
           "var h = q('#featured .cover-h'); if (!h || q('br', h) || h.querySelector('.lr-tl')) return;   /* lrn-native: Title lines carries the break */",
           'native cover break')
js = patch(js, "var cpool = POOLS.ed.picks.filter(function(x){ return CANON.indexOf(x[0]) >= 0; });",
           "var cpool = window.__lrnDeck ? window.__lrnDeck() : POOLS.ed.picks.filter(function(x){ return CANON.indexOf(x[0]) >= 0; });   /* lrn-native: deal from the Featured deck Webflow renders */",
           'native Featured pool')
js = patch(js, "var fz = document.getElementById('featured');\n    if (fz && p) {",
           "var fz = document.getElementById('featured');\n    if (fz && p && !(window.__lrnFeature && window.__lrnFeature(fz, p[0]))) {",
           'native Featured deal')
js = r"""/* lrn-native: the deck's slugs are the cover pool (every piece with "Editorials featured" on) */
window.__lrnDeck = function(){
  var box = document.querySelector('#featured .w-dyn-items'); if (!box) return null;
  var out = [].map.call(box.children, function(it){ var a = it.querySelector('a[href*="/editorial/"]');
    return [a ? ((a.getAttribute('href') || '').split('/editorial/')[1] || '').split(/[?#]/)[0] : '']; }).filter(function(x){ return x[0]; });
  return out.length ? out : null;
};
/* lrn-native: Featured is a deck Webflow renders whole (Editorials featured = on); the edition only chooses which story shows */
window.__lrnFeature = function(fz, slug){
  var box = fz.querySelector('.w-dyn-items'); if (!box) return false;
  var hit = null;
  [].forEach.call(box.children, function(it){
    var a = it.querySelector('a[href*="/editorial/"]');
    var s = a ? ((a.getAttribute('href') || '').split('/editorial/')[1] || '').split(/[?#]/)[0] : '';
    var on = s === slug; it.classList.toggle('lrn-on', on); if (on) hit = it;
  });
  box.classList.toggle('lrn-picked', !!hit);
  return true;
};
""" + js

EPILOGUE += r'''
/* ---------- lrn-bylines (7 Oct 2026, native lists): names in Webflow-drawn bylines become the same writer links the
   bundle draws (span[data-w], opened by its document-level click handler). The text is identical, checked before
   writing, so nothing moves; only the names gain their link. ---------- */
(function(){
  function go(){
    var B = window.LRW_BY; if (!B) return false;
    [].forEach.call(document.querySelectorAll('#latest .w-dyn-item .tw-lead .by, #latest .w-dyn-item .tw-sec-body .meta, #featured .w-dyn-item .who .wn'), function(el){
      if (el.querySelector('[data-w]')) return;
      var t = el.textContent, h = B.line(t), d = document.createElement('span'); d.innerHTML = h;
      if (d.textContent === t) el.innerHTML = h;
    });
    return true;
  }
  if (!go()) setTimeout(go, 0);
})();
'''
out = PROLOGUE + js + EPILOGUE
p = os.path.join(HERE, 'lrn.js')
open(p, 'w', encoding='utf-8').write(out)
print('native/lrn.js %d KB' % (len(out.encode('utf-8')) // 1024))
