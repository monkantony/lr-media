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
js = patch(js, "var lead = document.querySelector('.es-lead'); if (!lead || !ESSAYS.length) return;",
           "if (window.__lrnEssays && window.__lrnEssays(rng)) return;   /* native: the CMS pool (Excerpt set) is the deck */\n    var lead = document.querySelector('.es-lead'); if (!lead || !ESSAYS.length) return;",
           'native Essays deal')
js = patch(js, "q.innerHTML = EPS.map(function(e, i){",
           "if (window.__lrnEPS) EPS = window.__lrnEPS;   /* native: the queue is Webflow's Episodes list */\n    else q.innerHTML = EPS.map(function(e, i){",
           'native podcast queue')
js = patch(js, "f.title = 'AI Psychosis Summit with Peter Bauman';",
           "f.title = (thumb && thumb.getAttribute('alt')) || 'Le Random on YouTube';",
           'native YouTube title')
js = patch(js, "  document.getElementById('iss-jump').value = String(latest);",
           "  (function(){ var sel = document.getElementById('iss-jump'); if (!sel) return;   /* native: the options follow the data, not the bake */\n"
           "    var opts = DATA.issues.slice().reverse().map(function(i){ return '<option value=\"' + i[0] + '\">No. ' + ('0' + i[0]).slice(-2) + ' \\u00b7 ' + i[1] + ' \\u00b7 ' + i[3].length + ' piece' + (i[3].length === 1 ? '' : 's') + '</option>'; }).join('');\n"
           "    var div = document.createElement('div'); div.innerHTML = '<select>' + opts + '</select>';\n"
           "    if (div.firstChild.textContent !== sel.textContent) sel.innerHTML = opts; })();\n"
           "  document.getElementById('iss-jump').value = String(latest);",
           'native Issues jump options')
js = patch(js, "  function sxDealCol(col, t, rng){\n    var pool = DATA.entities.filter(function(e){ return e[2] === t; });",
           "  function sxDealCol(col, t, rng){\n    if (window.__lrnSxDeal && window.__lrnSxDeal(col, rng, __lrN)) return;   /* native: deal among Webflow's links */\n    var pool = DATA.entities.filter(function(e){ return e[2] === t; });",
           'native Subjects deal')
js = patch(js, "  (function(){ var mo = document.querySelector('#subjects .zh-x .more'); if (mo && window.__LRW_SP_K",
           "  (function(){ var mo = document.querySelector('#subjects .zh-x .more'); if (mo && !document.querySelector('#subjects .w-dyn-item') && window.__LRW_SP_K",
           'native Subjects kicker (the line is static copy)')
js = patch(js, "    var b = e.target.closest('.sx-item');\n    if (b) {",
           "    var b = e.target.closest('.sx-item');\n    if (b && b.tagName === 'A' && b.getAttribute('href')) return;   /* native: a real subject link is followed */\n    if (b) {",
           'native Subjects links')
js = patch(js, "'Connected by <button type=\"button\" class=\"sx-item gg-viab\" data-k=\"' + esc(e[0]) + '\">' + esc(e[1]) + '</button>';",
           "'Connected by <button type=\"button\" class=\"sx-item gg-viab\" data-k=\"' + esc(e[0]) + '\">' + esc(e[1]) + '</button>'; if (window.__lrnSubLinks) window.__lrnSubLinks(via);",
           'native Timeline connections link')
js = patch(js, "<span class=\"gg-sub-c\">' + n + ' editorial' + (n === 1 ? '' : 's') + '</span></button>'; }).join('');",
           "<span class=\"gg-sub-c\">' + n + ' editorial' + (n === 1 ? '' : 's') + '</span></button>'; }).join(''); if (window.__lrnSubLinks) window.__lrnSubLinks(subs);",
           'native Timeline connections subjects')
js = r"""window.__lrnHash0 = location.hash;
/* lrn-native M4: subject buttons the bundle draws (Timeline connections "Connected by" + its subject chips) become real
   <a href="/subjects/slug"> links once the subject map can name the page; a subject without a page keeps its button. */
window.__lrnSubLinks = function(root){
  if (!root || !window.__lrBridgeHref) return 0; var n = 0;
  [].forEach.call(root.querySelectorAll('button.sx-item[data-k]'), function(b){
    var h = window.__lrBridgeHref('#subject=' + encodeURIComponent(b.getAttribute('data-k')));
    if (!h || h.indexOf('/subjects/') !== 0) return;
    var a = document.createElement('a'); a.href = h; a.className = b.className; a.setAttribute('data-k', b.getAttribute('data-k'));
    a.innerHTML = b.innerHTML; b.parentNode.replaceChild(a, b); n++;
  });
  return n;
};
(function(){ var tries = 0, iv = setInterval(function(){   /* the subject map loads after the grid is drawn: upgrade then */
  var c = document.getElementById('curation'); if (c) window.__lrnSubLinks(c);
  if (++tries > 40 || (c && !c.querySelector('button.sx-item[data-k]'))) clearInterval(iv);
}, 500); })();
/* lrn-native M3: the Subjects zone is six Webflow lists (one per Kind, Robots without noindex, Editorials desc then
   Name asc, 20 each); CSS shows the first 10. The edition deal picks up to 10 of the 20, weighted by mentions, with the
   same text budget as before, and only toggles and reorders the server-rendered links: nothing is drawn. */
window.__lrnSxDeal = function(col, rng, lrN){
  var items = [].slice.call(col.querySelectorAll('.w-dyn-item')); if (!items.length) return false;
  var D = window.LRW_DATA, by = {};
  if (D && D.entities) D.entities.forEach(function(e){ by[e[0]] = e; });
  var keyed = items.map(function(it){
    var a = it.querySelector('a.sx-item'), k = a ? (a.getAttribute('data-k') || '') : '', e = by[k];
    var w = (e && lrN ? lrN(e) : 0) || 1;
    return { it: it, k: Math.pow(rng(), 1 / w), len: ((it.textContent || '').trim().length + 2) };
  }).sort(function(a, b){ return b.k - a.k; });
  var out = [], used = 0, budget = 240;
  for (var i = 0; i < keyed.length && out.length < 10; i++) {
    if (out.length >= 5 && used + keyed[i].len > budget) break;
    used += keyed[i].len; out.push(keyed[i].it);
  }
  var box = items[0].parentNode, grid = col.parentNode;
  /* the zone keeps the height the server-rendered top 10 gave it: the first deal records it, and a deal that would make
     the zone taller drops its last picks (never below 5), so dealing can neither shrink nor grow it (peer review, M3) */
  if (grid && !grid.__lrnH) { grid.__lrnH = grid.getBoundingClientRect().height; grid.style.minHeight = grid.__lrnH + 'px';
    addEventListener('resize', function(){ grid.style.minHeight = ''; }, { once: true }); }
  items.forEach(function(it){ it.classList.remove('lrn-on'); });
  out.forEach(function(it){ it.classList.add('lrn-on'); box.appendChild(it); });
  items.forEach(function(it){ if (out.indexOf(it) < 0) box.appendChild(it); });
  col.classList.add('lrn-dealt');
  while (grid && grid.style.minHeight && out.length > 5 && grid.getBoundingClientRect().height > grid.__lrnH + 0.5) out.pop().classList.remove('lrn-on');
  return true;
};
/* lrn-native M3: Contributors is a Webflow list (Contributor editorials desc, then Name). Lift the cards out of
   Webflow's wrappers so the bundle's order, deal and A-Z (children of one grid) work unchanged. */
(function(){ try {
  var g = document.querySelector('#contributors .contrib'); if (!g || !g.querySelector('.w-dyn-item')) return;
  var cards = [].slice.call(g.querySelectorAll('a.cb'));
  cards.forEach(function(c){ g.appendChild(c); });
  [].slice.call(g.children).forEach(function(c){ if (!(c.tagName === 'A' && c.classList.contains('cb'))) c.remove(); });
} catch (e) {} })();
/* lrn-native M2: the podcast queue is Webflow's Episodes list (Episode number desc). Each row carries its number
   (Folio), title, duration and a hidden audio URL; hand them to the player as its episode list, then lift the rows out
   of Webflow's wrappers so the player's own child logic (q.children) sees exactly the rows it used to draw. */
(function(){ try {
  var q = document.getElementById('podQueue'); if (!q || !q.querySelector('.w-dyn-item')) return;
  var rows = [].slice.call(q.querySelectorAll('.pod-ep'));
  window.__lrnEPS = rows.map(function(r, i){
    var t = function(c){ var e = r.querySelector('.' + c); return e ? e.textContent.trim() : ''; };
    r.setAttribute('data-i', i); if (i === 0) r.classList.add('on');
    var tx = r.querySelector('.pod-tx'); if (tx) tx.dataset.n = parseInt(t('pod-ep-n'), 10);
    var u = r.querySelector('.pod-u'), url = u ? u.textContent.trim() : ''; if (u) u.remove();
    return { n: t('pod-ep-n'), t: t('pod-ep-t'), u: url, d: t('pod-ep-d') };
  });
  rows.forEach(function(r){ q.appendChild(r); });
  [].slice.call(q.children).forEach(function(c){ if (!c.classList.contains('pod-ep')) c.remove(); });
  q.addEventListener('keydown', function(e){ var b = e.target.closest && e.target.closest('.pod-ep');
    if (b && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); b.click(); } });
} catch (e) {} })();
/* lrn-native M2: the Essays lead is a Webflow list of every essay with an Excerpt (newest first, CSS shows the first).
   Until a die is rolled (or a shared #e= link arrives) the painted lead stays; a roll deals one from the CMS pool. */
/* lrn-native M2: the Essays lead and the six beside it are dealt from the CMS pool (every essay with an Excerpt) with
   the edition's seed, at load and on every roll, like www. Never a piece Latest already shows, never the lead twice,
   one piece per series (Zero 10 Part 1/2 ...), and at least three writers among the six (Peter, 7 Oct 2026).
   Without JS the CSS shows the 7th-newest essay as lead and the 8th-13th beside it: none can be in Latest's six. */
window.__lrnSeries = function(t){
  t = (t || '').toLowerCase().replace(/\s+/g, ' ').trim();
  if (/demystifying generative/.test(t)) return 'demystifying generative';
  return t.replace(/\s*[-—:]?\s*(part|pt\.?)\s*[\divx]+\b.*$/, '').replace(/:.*$/, '').trim();
};
window.__lrnLatest = function(){
  var s = {}; [].forEach.call(document.querySelectorAll('#latest a[href*="/editorial/"]'), function(a){ s[a.getAttribute('href')] = 1; }); return s;
};
window.__lrnEssays = function(rng){
  var box = document.querySelector('#essays .es-lead-col .w-dyn-items'); if (!box) return false;
  var latest = window.__lrnLatest();
  var all = [].slice.call(box.children), kids = all.filter(function(k){ var a = k.querySelector('a.es-lead'); return a && !latest[a.getAttribute('href')]; });
  if (!kids.length) kids = all;
  if (kids.length) {
    var pick = kids[Math.floor(rng() * kids.length)];
    all.forEach(function(k){ k.classList.toggle('lrn-on', k === pick); });
    box.classList.add('lrn-picked');
  }
  window.__lrnEssayList && window.__lrnEssayList(rng);
  return true;
};
window.__lrnEssayList = function(rng){
  var box = document.querySelector('#essays .es-list .w-dyn-items'); if (!box) return;
  var latest = window.__lrnLatest(), S = window.__lrnSeries;
  var on = document.querySelector('#essays .es-lead-col .w-dyn-items.lrn-picked > .lrn-on');
  var la = on && on.querySelector('a.es-lead'), lead = la ? la.getAttribute('href') : '';
  var leadSeries = on ? S((on.querySelector('.es-lead h3') || {}).textContent) : '';
  var who = function(it){ var b = it.querySelector('.es-m .by'); return b ? b.textContent.split(/,| and | with /)[0].trim().toLowerCase() : ''; };
  var ser = function(it){ return S((it.querySelector('.es-t') || {}).textContent); };
  var pool = [].slice.call(box.children).filter(function(it){ var a = it.querySelector('a.es-item'), h = a && a.getAttribute('href'); return h && h !== lead && !latest[h]; });
  for (var i = pool.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)), t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
  var picked = [], used = {}; used[leadSeries] = 1;
  pool.forEach(function(it){ if (picked.length < 6 && !used[ser(it)]) { picked.push(it); used[ser(it)] = 1; } });
  var rest = pool.filter(function(it){ return picked.indexOf(it) < 0 && !used[ser(it)]; });
  var count = function(){ var m = {}; picked.forEach(function(it){ m[who(it)] = (m[who(it)] || 0) + 1; }); return m; };
  for (var guard = 0; guard < 6 && Object.keys(count()).length < 3; guard++) {
    var m = count(), k = rest.findIndex(function(it){ return !m[who(it)]; }); if (k < 0) break;
    var top = Object.keys(m).sort(function(a, b){ return m[b] - m[a]; })[0];
    for (var x = picked.length - 1; x >= 0; x--) if (who(picked[x]) === top) { picked[x] = rest.splice(k, 1)[0]; break; }
  }
  [].forEach.call(box.children, function(it){ it.classList.remove('lrn-on'); });
  picked.forEach(function(it){ it.classList.add('lrn-on'); box.appendChild(it); });
  box.classList.add('lrn-picked');
};
/* lrn-native M2: the Interviews roll call is drawn by Webflow (Category = Interview, two lists of up to 100). Each item
   carries its title, number, date and image as hidden bound children; the roll-call code reads data-*, so copy them first. */
(function(){ try {
  [].forEach.call(document.querySelectorAll('#rc-list .w-dyn-item'), function(w){
    var a = w.querySelector('a.rc-item'), d = w.querySelector('.rc-d'); if (!a || !d || a.dataset.t) return;
    function t(c){ var e = d.querySelector('.' + c); return e ? e.textContent.trim() : ''; }
    var im = d.querySelector('img'), src = '';
    if (im) { (im.getAttribute('srcset') || '').split(',').forEach(function(p){ var m = p.trim().split(/\s+/); if (m[0] && parseInt(m[1], 10) <= 800) src = m[0]; }); src = src || im.getAttribute('src') || ''; }
    a.dataset.img = src; a.dataset.t = t('rc-d-t'); a.dataset.n = t('rc-d-n'); a.dataset.d = t('rc-d-d');
  });
  /* the plate image is Webflow's responsive <img>: its srcset would outrank the src the hover sets, so pin what it shows first */
  var ri = document.getElementById('rc-img'), rl = document.getElementById('rc-list');
  if (ri && rl && ri.hasAttribute('srcset')) rl.addEventListener('mouseover', function(){
    if (ri.currentSrc) ri.setAttribute('src', ri.currentSrc); ri.removeAttribute('srcset'); ri.removeAttribute('sizes');
  }, { capture: true, once: true });
} catch (e) {} })();
/* lrn-native: the deck's slugs are the cover pool (every piece with "Editorials featured" on) */
window.__lrnDeck = function(){
  var box = document.querySelector('#featured .w-dyn-items'); if (!box) return null;
  var out = [].map.call(box.children, function(it){ var a = it.querySelector('a[href*="/editorial/"]');
    return [a ? ((a.getAttribute('href') || '').split('/editorial/')[1] || '').split(/[?#]/)[0] : '']; }).filter(function(x){ return x[0]; });
  if (!out.length) return null;
  /* until a die is rolled, deals keep the piece Webflow already painted (no swap after load); dice and shared #e= links deal the deck */
  if (!window.__lrnRolled && !/^#e=\d+$/.test(window.__lrnHash0 || '')) return out.slice(0, 1);   /* the hash as the visitor arrived: the bundle writes #e= itself */
  return out;
};
document.addEventListener('click', function(e){ if (e.target.closest && e.target.closest('#ed-roll, .zone-roll, .cur-roll, .zone-die, .die-hero')) window.__lrnRolled = 1; }, true);
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
    [].forEach.call(document.querySelectorAll('#latest .w-dyn-item .tw-lead .by, #latest .w-dyn-item .tw-sec-body .meta, #featured .w-dyn-item .who .wn, #essays .w-dyn-item .es-lead .by'), function(el){
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
