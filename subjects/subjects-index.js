/* Le Random Subjects index: the map (8 Oct 2026). The people view the subject pages show, with every subject on it
   (works, organisations, places, exhibitions, themes, techniques), a time scrubber, Time / Meaning / Kind arrangements,
   paths through shared pages and the Subjects index as its panel. Built on lr-media/people (same engine, same data);
   only the engine copy with the subjects layer and the map's data live here, in lr-media/subjects/.
   Loaded by the Subjects index page from the commit version.txt names (data-base = this folder at that commit).
   The page reserves the box (#lr-subjects-map, height set in its head) and shows a poster in it, so nothing shifts;
   the map is drawn after first paint, in a frame that shares the page's origin. The plain lists below stay what
   search engines read. */
(function () {
  var me = document.currentScript, BASE = me && me.getAttribute('data-base');
  var box = document.getElementById('lr-subjects-map'); if (!BASE || !box) return;
  var TL = 'https://timeline.lerandom.art/';
  var RAW = BASE.replace(/^https:\/\/cdn\.jsdelivr\.net\/gh\/([^@\/]+\/[^@\/]+)@([0-9a-f]{7,40})\//, 'https://raw.githubusercontent.com/$1/$2/');
  var P_BASE = BASE.replace(/subjects\/$/, 'people/'), P_RAW = RAW.replace(/subjects\/$/, 'people/');
  function get(base, raw, f) {
    var one = function (b) { return fetch(b + f, { cache: 'force-cache' }).then(function (r) { if (!r.ok) throw f + ' ' + r.status; return r.text(); }); };
    return raw !== base ? one(raw).catch(function () { return one(base); }) : one(base);
  }
  // the frame's code and styles inlined from the same commit (GitHub's file server sends text/plain: never <script src>
  // it); the people view's engine and styles from this folder, everything else from lr-media/people
  // #people, #works … : the index opens on that kind
  // &sort=az (8 Oct 2026): the list opens in A-Z order instead of the random deal
  var KINDS = { people: 0, organisations: 1, organizations: 1, works: 2, exhibitions: 3, places: 4, techniques: 5, themes: 6 };
  var KN = ['people', 'organisations', 'works', 'exhibitions', 'places', 'techniques', 'themes'];
  function hashParts() { return (location.hash || '').replace(/^#(subjects=)?/, '').toLowerCase().split('&'); }
  function kindOf() { var h = hashParts()[0]; return h in KINDS ? KINDS[h] : null; }
  function sortOf() { return hashParts().indexOf('sort=az') > 0 ? 'az' : null; }
  // the frame reports its kind and order; the address follows without a new history entry (people at random = no hash)
  window.__lrSlState = function (k, sort) {
    var h = k === 0 && sort !== 'az' ? '' : '#' + KN[k] + (sort === 'az' ? '&sort=az' : '');
    if (h !== (location.hash || '')) try { history.replaceState(history.state, '', location.pathname + location.search + h); } catch (e) {}
  };
  var OWN = { 'assets/views/people.js': 1, 'assets/views/people.css': 1 };
  function inlineCode(h) {
    h = h.replace(/<script src="assets\/theme\.js[^"]*"><\/script>|<link rel="stylesheet" href="assets\/theme\.css[^"]*">/g, '');
    var tags = [], re = /<script src="assets\/([^"?]+\.js)"><\/script>|<link rel="stylesheet" href="assets\/([^"?]+\.css)">/g, mm;
    while ((mm = re.exec(h))) tags.push({ tag: mm[0], file: 'assets/' + (mm[1] || mm[2]), js: !!mm[1] });
    return Promise.all(tags.map(function (t) {
      var own = OWN[t.file];
      return get(own ? BASE : P_BASE, own ? RAW : P_RAW, t.file).then(function (code) {
        if (t.js) return '<script>' + code.replace(/<\/script/gi, '<\\/script') + '\n<\/script>';
        return '<style>' + code.replace(/url\(\.\.\/fonts\//g, 'url(' + P_RAW + 'fonts/') + '</style>';
      }).catch(function () { return null; });
    })).then(function (out) {
      tags.forEach(function (t, i) { if (out[i] != null) h = h.split(t.tag).join(out[i]); });
      return h;
    });
  }
  function open(url, newtab) {
    url = url.replace(/^(https:\/\/timeline\.lerandom\.art\/m\/[a-z0-9-]+)\.html/, '$1');
    if (newtab) { var w = window.open(url, '_blank'); if (w) { try { w.opener = null; } catch (e) {} } else location.href = url; } else location.href = url;
  }
  function tlUrl(page, p) {
    p = p || {};
    if (page === 'moment' && p.slug) return TL + 'm/' + p.slug;
    var u = TL + (page && page !== 'home' ? page + '.html' : '');
    if (p.slug) u += '#' + p.slug; else if (p.token) u += '#' + p.token;
    return u;
  }
  function mount() {
    var fr = document.createElement('iframe'); fr.title = 'Map of every subject'; fr.setAttribute('allow', 'fullscreen; autoplay');
    // hidden until its calm frame is drawn, then shown at once over the poster made from that frame (no fade, no dip).
    // Only where the page's head paints that poster (its box defines --map); a page with the older head keeps the fade.
    var HERO = box.hasAttribute('data-hero'), CALM = HERO || !!getComputedStyle(box).getPropertyValue('--map').trim();
    fr.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;display:block;opacity:0' + (CALM ? '' : ';transition:opacity .5s');
    var shown = false, show = function () { if (shown) return; shown = true; fr.style.opacity = '1'; box.classList.add('is-live');
      if (HERO) try { var api = fr.contentWindow.LR_SL_API; if (api && api.ready()) sxPage(api, fr); } catch (e) {} };
    get(P_BASE, P_RAW, 'embed.html').then(inlineCode).then(function (h) {
      var head = '<base href="' + TL + '"><script>window.LR_EMBED=1;window.LR_FRAMED=true;window.LR_PEOPLE_HOME="main";window.LR_SUBJECTS_INDEX=1;' +
        (CALM ? 'window.LR_SL_CALM=1;' : '') + (HERO ? 'window.LR_SL_HERO=1;' : '') + 'window.LR_DATA=' + JSON.stringify(P_RAW) + ';window.LR_SL_DATA=' + JSON.stringify(RAW) + ';window.LR_PARAMS={"token":""};' +
        (kindOf() != null ? 'window.LR_SL_TAB=' + kindOf() + ';' : '') + (sortOf() ? 'window.LR_SL_SORT="az";' : '') + '<\/script>';
      // the subjects layout from the frame's first paint (the engine would add it only once it starts)
      if (CALM) h = h.replace('<main id="pp" class="pp ', '<main id="pp" class="pp sl-on ' + (HERO ? 'sl-hero ' : ''));
      h = h.replace('<!--LR-EMBED-HEAD-->', head).replace(/(href|src)="assets\//g, '$1="' + P_BASE + 'assets/');
      fr.srcdoc = h;
      box.appendChild(fr);
      fr.addEventListener('load', function () { if (CALM) setTimeout(show, 8000); else show(); });   // (in case the frame never says it is ready)
    }).catch(function () {});
    addEventListener('hashchange', function () { var k = kindOf(), w = fr.contentWindow; if (k != null && w && w.LR_SL_TAB_SET) w.LR_SL_TAB_SET(k, sortOf() || 'rand'); });
    // a person stays on this page (their constellation opens in the map); links out open as on the subject pages
    addEventListener('message', function (e) {
      if (e.source !== fr.contentWindow || !e.data) return;
      var d = e.data;
      if (d.lrembed === 'ready') { if (CALM) show(); }
      else if (d.lrembed === 'open') open(d.url, d.newtab);
      else if (d.lrsite === 'go') {
        if (d.page === 'people' && d.params && (d.params.token || d.params.slug)) { var w = fr.contentWindow; if (w.LR_SELECT) w.LR_SELECT(d.params.token || d.params.slug); }
        else open(tlUrl(d.page, d.params), true);
      }
    });
  }
  // ── 9 Oct 2026 (direction D, Peter): the Subjects page below its hero. 01 Index, 02 Paths, 03 By kind, 04 Every subject
  // (the page's own Webflow lists, drawn as a register), then the Timeline plate. Every name lights itself on the map in the
  // hero; once the hero has scrolled away a framed mini-map (a Map pill on phones) shows it. Data comes from the map (no
  // extra fetch); styles are the /editorials zone heads and the /podcast register.
  function sxPage(api, fr) {
    if (document.getElementById('sx-zones')) return;
    var si = document.querySelector('.lr-si'); if (!si) return;
    var L = api.list(), K = api.kinds(), DA = api.da() || {}, byS = {}, N = L.length;
    L.forEach(function (s) { byS[s.slug] = s; });
    var ORDER = [0, 2, 1, 4, 3, 6, 5], PLUR = K, ONE = ['Person', 'Organisation', 'Work', 'Exhibition', 'Place', 'Technique', 'Theme'];
    var cnt = function (k) { return L.filter(function (s) { return k == null || s.k === k; }).length; };
    var fmt = function (n) { return Number(n).toLocaleString('en-US'); };
    var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var fold = function (n) { return n.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/^(the|a|an) /, ''); };
    var L0 = function (n) { var c = fold(n).charAt(0); return /[a-z]/.test(c) ? c.toUpperCase() : '#'; };
    var href = function (s) { return '/subjects/' + encodeURIComponent(s.slug); };
    var mentions = function (s) { return s.e || ''; };
    var st = document.createElement('style'); st.textContent = SX_CSS; document.head.appendChild(st);
    var zone = function (id, no, h, more, body) { return '<section class="sx-zone" id="' + id + '"><div class="sx-zh"><span class="sx-no">' + no + '</span><div class="sx-x"><h2>' + h + '</h2><span class="sx-more">' + more + '</span></div></div>' + body + '</section>'; };
    var row = function (s, n, d) { return '<a class="sx-row" href="' + href(s) + '" data-sl="' + esc(s.slug) + '"><span class="n">' + (n || '') + '</span><span class="t">' + esc(s.n) + '</span><span class="d">' + (d || '') + '</span></a>'; };
    var chips = function (sel, attr) { return '<button type="button" class="sx-chip" ' + attr + '="all" aria-pressed="' + (sel === 'all') + '">All <i>' + fmt(N) + '</i></button>' + ORDER.map(function (k) { return '<button type="button" class="sx-chip" ' + attr + '="' + k + '" aria-pressed="' + (sel === k) + '">' + PLUR[k] + ' <i>' + fmt(cnt(k)) + '</i></button>'; }).join(''); };

    // 01 Index: a weighted random deal (Efraimidis-Spirakis, w = mentions^A, A set per kind by the build so the most
    // mentioned lands about 90% of the time) or A to Z; 28 at a time
    // one state shared with the map in the hero: kind (or several), order, year, selection; mirrored in the address
    var IX = { k: 'all', sort: 'rand', shown: 28, deal: {}, yr: null, sel: null };
    var hk = (location.hash || '').replace(/^#/, '').toLowerCase().split('&'), KH = { people: 0, organisations: 1, organizations: 1, works: 2, exhibitions: 3, places: 4, techniques: 5, themes: 6 };
    if (hk[0] in KH) IX.k = KH[hk[0]]; if (hk.indexOf('sort=az') > -1) IX.sort = 'az';
    hk.forEach(function (p) { if (p.indexOf('s=') === 0 && byS[p.slice(2)]) IX.sel = p.slice(2); });
    var inK = function (s, k) { return k === 'all' || (k instanceof Set ? k.has(s.k) : s.k === k); };
    var pool = function (k, all) { return L.filter(function (s) { return inK(s, k) && (all || IX.yr == null || s.yr == null || s.yr <= IX.yr); }); };
    var dkey = function (k) { return k instanceof Set ? Array.from(k).sort().join(',') : String(k); };
    var deal = function (k) { var A = typeof k === 'number' ? (DA[k] || 1.2) : (DA.o || 1.3); return pool(k).filter(function (s) { return s.slug !== 'peter-bauman'; }).map(function (s) { return [Math.log(Math.random()) / Math.pow(Math.max(s.tot, 1), A), s]; }).sort(function (a, b) { return b[0] - a[0]; }).map(function (x) { return x[1]; }); };
    var az = function (k, all) { return pool(k, all).slice().sort(function (a, b) { return fold(a.n).localeCompare(fold(b.n)) || a.n.localeCompare(b.n); }); };
    function ixRows() {
      var key = dkey(IX.k) + '|' + IX.yr, all = IX.sort === 'az' ? az(IX.k) : (IX.deal[key] || (IX.deal[key] = deal(IX.k))), rows = all.slice(0, IX.shown);
      var sel = IX.sel && byS[IX.sel], selRow = sel && rows.indexOf(sel) < 0 ? '<div class="sx-selrow"><span class="sx-lbl">Selected on the map</span>' + row(sel, mentions(sel)) + '</div>' : '';
      return selRow + '<div class="sx-reg">' + rows.map(function (s) { return row(s, mentions(s)); }).join('') + '</div>' +
        '<div class="sx-foot">' + (IX.shown < all.length ? '<button type="button" class="sx-chip" data-ixmore>Show ' + Math.min(28, all.length - IX.shown) + ' more</button>' : '') + '<span class="sx-count">Showing <b>' + fmt(Math.min(IX.shown, all.length)) + '</b> of ' + fmt(all.length) + (IX.yr != null ? ' &middot; in history by ' + (IX.yr < 0 ? fmt(-IX.yr) + ' BCE' : IX.yr) : '') + '</span></div>';
    }
    function ixTools() {
      return '<div class="sx-tools">' + chips(IX.k instanceof Set ? 'some' : IX.k, 'data-ixk') + '</div><div class="sx-tools sx-tools2"><button type="button" class="sx-chip" data-ixsort="rand" aria-pressed="' + (IX.sort === 'rand') + '">Random</button><button type="button" class="sx-chip" data-ixsort="az" aria-pressed="' + (IX.sort === 'az') + '">A&ndash;Z</button>' + (IX.sort === 'rand' ? '<button type="button" class="sx-chip" data-ixshuf>Shuffle</button>' : '') + '</div>';
    }
    var mini = '<aside class="sx-mini" aria-label="On the map"><div class="sx-minicard"><span class="sx-lbl">On the map</span><canvas width="652" height="510" aria-hidden="true"></canvas><p>Hover a name to light it on the map. Click to open the subject.</p><a href="#lr-subjects-map" data-top>Back to the full map &uarr;</a></div></aside>';
    var idx = '<div class="sx-ixgrid"><div class="sx-ixmain"><div class="sx-ixtools">' + ixTools() + '</div><div class="sx-ixrows">' + ixRows() + '</div></div>' + mini + '</div>';

    // 02 Paths: any two subjects joined through the pages they share
    var paths = '<div class="sx-paths"><form class="sx-path" autocomplete="off"><input name="a" list="sx-names" placeholder="Vera Molnár" aria-label="From"><span class="sx-arrow">&rarr;</span><input name="b" list="sx-names" placeholder="Tyler Hobbs" aria-label="To"><button type="submit" class="sx-chip">Find</button></form>' +
      '<datalist id="sx-names">' + L.slice().sort(function (a, b) { return b.tot - a.tot; }).slice(0, 1500).map(function (s) { return '<option value="' + esc(s.n) + '">'; }).join('') + '</datalist><div class="sx-chain"><span class="sx-lbl">Example</span></div></div>';

    // 03 By kind: the most written about of each kind
    var kinds = '<div class="sx-kgrid">' + ORDER.map(function (k) { var top = pool(k).slice().sort(function (a, b) { return b.tot - a.tot || a.n.localeCompare(b.n); }).slice(0, 5);
      return '<div class="sx-kcol"><h3>' + PLUR[k] + ' <i>' + fmt(cnt(k)) + '</i></h3>' + top.map(function (s) { return row(s, s.tot); }).join('') + '<a class="sx-more2" href="#index" data-ixgo="' + k + '">All ' + fmt(cnt(k)) + ' ' + PLUR[k].toLowerCase() + ' &rarr;</a></div>'; }).join('') + '</div>';

    var box = document.createElement('div'); box.id = 'sx-zones'; box.className = 'sx';
    box.innerHTML = zone('index', '01', 'Index', 'Every subject, at random or A to Z', idx) + zone('paths', '02', 'Paths', 'From any subject to any other, through the archive', paths) + zone('by-kind', '03', 'By kind', 'Seven kinds, most written about first', kinds);
    si.parentNode.insertBefore(box, si);

    // 04 Every subject: the page's own lists (two Webflow Collection Lists, what search engines read) drawn as one register
    si.classList.add('sx', 'sx-every'); si.id = 'every-subject';
    var EV = { k: 'all', all: false };
    // 9 Oct 2026 (review): on a phone the register opens at its first 60 rows (all 3,200 made the page 130,000px tall);
    // "Show all" or any letter in the A to Z draws the rest. Desktop keeps the full register
    var EVCAP = 60, evPhone = function () { return window.matchMedia('(max-width:860px)').matches; };
    function everyHTML() {
      var all = az(EV.k, true), letters = {}, html = '', cur = '', cap = !EV.all && evPhone() ? EVCAP : Infinity;
      all.forEach(function (s, i) { var l = L0(s.n); letters[l] = 1; if (i >= cap) return; if (l !== cur) { cur = l; html += '<div class="sx-letter" id="sx-l-' + (l === '#' ? 'num' : l) + '">' + l + '</div>'; } html += row(s, s.tot, ONE[s.k]); });
      if (all.length > cap) html += '</div><button type="button" class="sx-showall">Show all ' + fmt(all.length) + ' subjects</button><div>';
      return '<div class="sx-tools">' + chips(EV.k, 'data-evk') + '<span class="sx-count">Showing <b>' + fmt(all.length) + '</b> of ' + fmt(N) + '</span></div>' +
        '<nav class="sx-az" aria-label="By letter">' + '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(function (c) { return letters[c] ? '<a href="#sx-l-' + (c === '#' ? 'num' : c) + '">' + c + '</a>' : '<span>' + c + '</span>'; }).join('') + '</nav><div class="sx-reg sx-c3">' + html + '</div>';
    }
    var ev = document.createElement('div'); ev.className = 'sx-evbody';
    var head = document.createElement('div'); head.innerHTML = '<div class="sx-zh"><span class="sx-no">04</span><div class="sx-x"><span class="sx-h2">Every subject</span><span class="sx-more">All ' + fmt(N) + ', A to Z</span></div></div>';
    si.insertBefore(head.firstChild, si.firstChild); si.appendChild(ev); ev.innerHTML = everyHTML();
    Array.prototype.forEach.call(si.querySelectorAll('.w-dyn-list'), function (l) { l.hidden = true; });   // still in the page for crawlers
    var oldh = si.querySelector('.lr-si-h'); if (oldh) oldh.classList.add('sx-sr');

    // the closing plate
    var plate = document.createElement('div'); plate.className = 'sx sx-platewrap';
    plate.innerHTML = '<div class="sx-plate"><span class="sx-k">The Living Timeline</span><h2>Every subject has a place in history.</h2><p>Open any subject on the Timeline to see the moments it belongs to, from 71,000 BCE to 2026.</p><div class="sx-btns"><a href="https://timeline.lerandom.art/" target="_blank" rel="noopener">Open the Timeline &#8599;</a><a href="/editorials">Editorials</a><a href="/podcast">Podcast</a></div></div>';
    si.parentNode.insertBefore(plate, si.nextSibling);
    var pill = document.createElement('a'); pill.className = 'sx-pill'; pill.href = '#lr-subjects-map'; pill.setAttribute('data-top', ''); pill.innerHTML = '<canvas width="128" height="128" aria-hidden="true"></canvas><span>Map</span>';
    document.body.appendChild(pill);

    // the example path, read (not drawn) from the map
    api.route('vera-molnar', 'tyler-hobbs').then(function (ch) { var c = box.querySelector('.sx-chain'); if (c && ch.length) c.innerHTML = '<span class="sx-lbl">Example</span>' + chainHTML(ch); });
    function chainHTML(ch) { return ch.map(function (x, i) { return (i ? '<span class="sx-hop" title="' + esc(ch[i - 1].why || ('Both in ' + ch[i - 1].src)) + '">&rarr;</span>' : '') + '<a class="sx-node" href="' + href(x) + '" data-sl="' + esc(x.slug) + '">' + esc(x.n) + '</a>'; }).join(''); }

    // names light the map: hover or keyboard focus; the mini-map mirrors the hero's canvas while one is lit
    var heroBox = document.getElementById('lr-subjects-map'), heroIn = true, lit = null, mirrorUntil = 0;
    if (window.IntersectionObserver) new IntersectionObserver(function (es) { heroIn = es[0].isIntersecting; document.documentElement.classList.toggle('sx-hero-out', !heroIn); }, { threshold: 0.15 }).observe(heroBox);
    var miniC = box.querySelector('.sx-minicard canvas'), pillC = pill.querySelector('canvas');
    function mirror() {
      try {
        var sky = api.sky(), v = api.view(); if (!sky || !v.K) return;
        // the whole chart at rest; around the lit subject (its neighbours in reach) while a name is lit
        var cx0 = v.ox, cy0 = v.oy, half = 1.12 * v.K, p = lit && api.pos(lit);
        if (p) { half = 0.62 * v.K; cx0 = Math.max(v.ox - 1.12 * v.K + half, Math.min(v.ox + 1.12 * v.K - half, p[0])); cy0 = Math.max(v.oy - 1.12 * v.K + half, Math.min(v.oy + 1.12 * v.K - half, p[1])); }
        var r = sky.width / v.W, sx = (cx0 - half) * r, sy = (cy0 - half) * r, sw = 2 * half * r;
        // the pupil's era plate sits in its own element over the canvas: draw it into the hole too
        var gr = api.ground(), pl = gr ? Array.prototype.slice.call(gr.querySelectorAll('canvas')).sort(function (a, b) { return (+getComputedStyle(b).opacity) - (+getComputedStyle(a).opacity); })[0] : null;
        [miniC, pillC].forEach(function (c) { if (!c) return; var g = c.getContext('2d'), ar = c.height / c.width, m = c.width / (2 * half); g.fillStyle = '#011015'; g.fillRect(0, 0, c.width, c.height);
          g.drawImage(sky, sx, sy + sw * (1 - ar) / 2, sw, sw * ar, 0, 0, c.width, c.height);
          if (pl && pl.width && v.hole > 2) { var cx = c.width / 2 + (v.ox - cx0) * m, cy = c.height / 2 + (v.oy - cy0) * m, rr = v.hole * m; g.save(); g.beginPath(); g.arc(cx, cy, rr, 0, Math.PI * 2); g.clip(); g.drawImage(pl, cx - rr, cy - rr, 2 * rr, 2 * rr); g.restore(); }
        });
      } catch (e) {}
    }
    (function loop() { if (performance.now() < mirrorUntil) mirror(); requestAnimationFrame(loop); })();
    setTimeout(function () { mirrorUntil = performance.now() + 600; }, 400);
    function on(slug) { if (!slug) return; lit = slug; api.hover(slug); mirrorUntil = performance.now() + 1500; }
    function off() { if (!lit) return; lit = null; api.leave(); mirrorUntil = performance.now() + 900; }
    [box, si].forEach(function (z) {
      z.addEventListener('click', function (e) {
        var a = e.target.closest('a[data-sl]'); if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
        var slug = a.getAttribute('data-sl'); if (IX.sel === slug) return;   // the second click follows the link to the page
        e.preventDefault(); api.select(slug);
      });
      z.addEventListener('pointerover', function (e) { if (e.pointerType === 'touch') return; var a = e.target.closest('[data-sl]'); if (a) on(a.getAttribute('data-sl')); else off(); });
      z.addEventListener('pointerleave', function (e) { if (e.pointerType !== 'touch') off(); });
      z.addEventListener('focusin', function (e) { var a = e.target.closest('[data-sl]'); if (a) on(a.getAttribute('data-sl')); });
      z.addEventListener('focusout', off);
    });

    // controls
    box.addEventListener('click', function (e) {
      var t = e.target.closest('[data-ixk],[data-ixsort],[data-ixshuf],[data-ixmore],[data-ixgo],[data-top]'); if (!t) return;
      if (t.hasAttribute('data-top')) { e.preventDefault(); window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); return; }
      if (t.hasAttribute('data-ixgo')) { e.preventDefault(); IX.k = +t.getAttribute('data-ixgo'); IX.sort = 'rand'; IX.shown = 28; api.setKinds([IX.k]); redrawIx(); document.getElementById('index').scrollIntoView({ behavior: 'smooth' }); return; }
      if (t.hasAttribute('data-ixk')) { var v = t.getAttribute('data-ixk'); IX.k = v === 'all' ? 'all' : +v; IX.shown = 28; api.setKinds(v === 'all' ? [0, 1, 2, 3, 4, 5, 6] : [+v]); }
      if (t.hasAttribute('data-ixsort')) { IX.sort = t.getAttribute('data-ixsort'); IX.shown = 28; }
      if (t.hasAttribute('data-ixshuf')) IX.deal[IX.k] = deal(IX.k);
      if (t.hasAttribute('data-ixmore')) IX.shown += 28;
      redrawIx();
    });
    pill.addEventListener('click', function (e) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    function redrawIx() {
      box.querySelector('.sx-ixtools').innerHTML = ixTools(); box.querySelector('.sx-ixrows').innerHTML = ixRows(); markSel(false);
      var KN2 = ['people', 'organisations', 'works', 'exhibitions', 'places', 'techniques', 'themes'], parts = [];
      if (typeof IX.k === 'number') parts.push(KN2[IX.k]); else if (IX.sort === 'az' || IX.sel) parts.push('all');
      if (IX.sort === 'az') parts.push('sort=az'); if (IX.sel) parts.push('s=' + IX.sel);
      var h = parts.length ? '#' + parts.join('&') : '';
      try { history.replaceState(history.state, '', location.pathname + location.search + (h || '')); } catch (e) {}
    }
    si.addEventListener('click', function (e) {
      if (e.target.closest('.sx-showall')) { EV.all = true; ev.innerHTML = everyHTML(); return; }
      var az0 = e.target.closest('.sx-az a');
      if (az0 && !EV.all && !document.getElementById(az0.getAttribute('href').slice(1))) { e.preventDefault(); EV.all = true; ev.innerHTML = everyHTML(); var tg = document.getElementById(az0.getAttribute('href').slice(1)); if (tg) tg.scrollIntoView(); return; }
      var t = e.target.closest('[data-evk]'); if (!t) return; var v = t.getAttribute('data-evk'); EV.k = v === 'all' ? 'all' : +v; ev.innerHTML = everyHTML(); });
    box.querySelector('.sx-path').addEventListener('submit', function (e) {
      e.preventDefault(); var f = e.target, by = function (n) { n = String(n || '').trim().toLowerCase(); return L.find(function (s) { return s.n.toLowerCase() === n; }); };
      var a = by(f.a.value || f.a.placeholder), b = by(f.b.value || f.b.placeholder), c = box.querySelector('.sx-chain');
      if (!a || !b) { c.innerHTML = '<span class="sx-lbl">Path</span><span class="sx-none">Pick two subjects from the list</span>'; return; }
      api.path(a.slug, b.slug).then(function (ch) { c.innerHTML = '<span class="sx-lbl">Path</span>' + (ch.length ? chainHTML(ch) : '<span class="sx-none">No path within four steps</span>'); mirrorUntil = performance.now() + 1500; });
    });
    api.on('kinds', function (ks) { IX.k = ks.length >= 7 ? 'all' : ks.length === 1 ? ks[0] : new Set(ks); IX.shown = 28; redrawIx(); });
    api.on('year', function (y) { IX.yr = y; IX.shown = 28; redrawIx(); });
    api.on('select', function (slug) { IX.sel = slug; redrawIx(); markSel(true); mirrorUntil = performance.now() + 1500; });
    function markSel(scroll) {
      Array.prototype.forEach.call(document.querySelectorAll('.sx-row.is-sel'), function (r) { r.classList.remove('is-sel'); });
      if (!IX.sel) return; var rows = document.querySelectorAll('.sx-row[data-sl="' + IX.sel.replace(/"/g, '') + '"]'), first = null;
      Array.prototype.forEach.call(rows, function (r) { r.classList.add('is-sel'); if (!first && box.contains(r)) first = r; });
      // the index scrolls to it only while the index is on screen (never pulls the page away from the map)
      var ixz = document.getElementById('index'), rb = ixz.getBoundingClientRect();
      if (scroll && first && rb.top < innerHeight && rb.bottom > 0) first.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
    // a shared link restores both sides
    if (typeof IX.k === 'number') api.setKinds([IX.k]);
    if (IX.sel) api.select(IX.sel);
    addEventListener('hashchange', function () { var h = (location.hash || '').replace(/^#/, '').toLowerCase().split('&'); if (h[0] in KH) { IX.k = KH[h[0]]; IX.sort = h.indexOf('sort=az') > 0 ? 'az' : 'rand'; IX.shown = 28; redrawIx(); } });
  }

  var SX_CSS = ".sx{--paper:#EFE9D8;--ink:#011015;--ink55:rgba(1,16,21,.55);--ink62:rgba(1,16,21,.62);--hair:rgba(1,16,21,.17);--hair08:rgba(1,16,21,.08);--or:#FF4C00;--or-t:#C93D00;--card:#FCFBF7;--shadow:rgba(1,16,21,.10);\n  --fr:clamp(20px,4.4vw,80px);color:var(--ink)}\nhtml.lr-dark .sx{--paper:#011015;--ink:#EFE9D8;--ink55:rgba(239,233,216,.55);--ink62:rgba(239,233,216,.62);--hair:rgba(239,233,216,.17);--hair08:rgba(239,233,216,.08);--or:#FF7A45;--or-t:#FF7A45;--card:#0A1B21;--shadow:rgba(0,0,0,.45)}\n#sx-zones,.sx.sx-every{max-width:1580px;margin:0 auto;padding:64px var(--fr) 0;box-sizing:border-box}\n.sx.sx-every{padding-top:0;padding-bottom:16px}\n.sx-zone{margin-bottom:64px;scroll-margin-top:90px}\n.sx-every{scroll-margin-top:90px}\n.sx-zh{display:flex;align-items:flex-end;gap:0 22px;border-bottom:1px solid var(--ink);padding-bottom:20px;margin:0 0 26px}\n.sx-no{font:500 69.12px/51.15px \"EB Garamond\",Garamond,Georgia,serif;color:transparent;-webkit-text-stroke:1.3px var(--or);letter-spacing:.01em}\n.sx-x{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 18px}\n.sx-x h2,.sx-x .sx-h2{margin:20px 0 4px;font:500 12px/13.2px Rules,Arial,sans-serif;letter-spacing:.22em;text-transform:uppercase;color:var(--ink)}\n.sx-more{font:italic 400 16px/23px \"EB Garamond\",Garamond,Georgia,serif;color:var(--ink55)}\n.sx-lbl{font:500 10.5px/1 Rules,Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--ink62)}\n.sx-tools{display:flex;flex-wrap:wrap;gap:9px;align-items:center;border-bottom:1px solid var(--hair);padding:16px 0 12px}\n.sx-tools2{border-bottom:0;padding-bottom:6px}\n.sx-chip{display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 14px;border:1px solid var(--hair);background:transparent;font:500 11px/23px Rules,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--ink);white-space:nowrap;cursor:pointer;border-radius:0}\n.sx-chip:hover{border-color:var(--ink)}\n.sx-chip[aria-pressed=true]{background:var(--ink);color:var(--paper);border-color:var(--ink)}\n.sx-chip i{font-style:normal;font-weight:400;letter-spacing:.06em;color:var(--ink55)}\n.sx-chip[aria-pressed=true] i{color:inherit;opacity:.7}\n.sx-count{font:400 11px/23px Rules,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--ink55);margin-left:auto}\n.sx-count b{color:var(--ink);font-weight:500}\n.sx-foot{display:flex;align-items:center;gap:12px;margin-top:18px}\n.sx-reg{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:28px}\n.sx-reg.sx-c3{grid-template-columns:repeat(3,minmax(0,1fr))}\n.sx-row{display:grid;grid-template-columns:34px minmax(0,1fr) auto;gap:10px;align-items:baseline;border-bottom:1px solid var(--hair08);padding:7px 0 8px;color:inherit;text-decoration:none}\n.sx-row .n{font:400 11px/23px Rules,Arial,sans-serif;color:var(--or-t);font-variant-numeric:tabular-nums}\n.sx-row .t{font:500 17px/22.1px Rules,Arial,sans-serif;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.sx-row .d{font:400 11px/23px Rules,Arial,sans-serif;letter-spacing:.02em;color:var(--ink55);white-space:nowrap}\n.sx-row:hover,.sx-row:focus-visible{background:linear-gradient(90deg,rgba(255,76,0,.10),transparent 70%);outline:0}\n.sx-row:hover .t,.sx-row:focus-visible .t{color:var(--or-t)}\n.sx-letter{grid-column:1/-1;font:500 22px/26px Rules,Arial,sans-serif;letter-spacing:-.01em;padding:18px 0 6px;border-bottom:1px solid var(--ink);scroll-margin-top:90px}\n.sx-az{display:flex;flex-wrap:wrap;gap:2px 0;padding:10px 0 4px;font:500 11px/26px Rules,Arial,sans-serif;letter-spacing:.06em}\n.sx-showall{display:block;width:100%;margin:22px 0 0;padding:15px 0;background:transparent;border:1px solid var(--ink);border-radius:0;font:500 11px/1 Rules,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--ink);cursor:pointer}\n.sx-showall:hover{border-color:#FF4C00;color:#FF4C00}\n.sx-az a,.sx-az span{width:26px;text-align:center;color:var(--ink);text-decoration:none}\n.sx-az span{color:var(--ink55);opacity:.5}\n.sx-az a:hover{color:var(--or-t)}\n.sx-ixgrid{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:44px;align-items:start}\n.sx-mini{position:sticky;top:96px}\n.sx-minicard{border:1px solid var(--ink);background:var(--card);padding:16px;box-shadow:10px 11px 0 var(--shadow);display:grid;gap:10px}\n.sx-minicard canvas{width:326px;height:255px;background:#011015;display:block}\n.sx-minicard p{margin:0;font:italic 400 17px/23px \"EB Garamond\",Garamond,serif;color:var(--ink62)}\n.sx-minicard a{font:400 14px/1 Rules,Arial,sans-serif;color:var(--ink);border-bottom:1px solid var(--hair);padding-bottom:6px;justify-self:start;text-decoration:none}\n.sx-paths{display:grid;gap:22px;max-width:900px}\n.sx-path{display:grid;grid-template-columns:minmax(0,1fr) 22px minmax(0,1fr) auto;gap:10px;align-items:center;margin:0}\n.sx-path input{height:38px;border:0;border-bottom:1px solid var(--ink);background:transparent;font:italic 400 17px/38px \"EB Garamond\",Garamond,serif;color:var(--ink);padding:0 2px;border-radius:0;outline:0;min-width:0}\n.sx-path input::placeholder{color:var(--ink55)}\n.sx-path input:focus{border-bottom-color:var(--or)}\n.sx-arrow{text-align:center;color:var(--ink)}\n.sx-chain{display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px;min-height:30px}\n.sx-chain .sx-lbl{margin-right:6px}\n.sx-node{font:400 24px/1.1 \"EB Garamond\",Garamond,serif;border-bottom:1px solid var(--ink);padding-bottom:2px;color:var(--ink);text-decoration:none}\n.sx-node:hover{color:var(--or-t);border-bottom-color:var(--or)}\n.sx-hop{color:var(--or-t);cursor:help}\n.sx-none{font:italic 400 17px/1.3 \"EB Garamond\",Garamond,serif;color:var(--ink55)}\n.sx-kgrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:40px 28px}\n.sx-kcol h3{margin:0 0 6px;font:500 22px/26px Rules,Arial,sans-serif;letter-spacing:-.01em;border-bottom:1px solid var(--ink);padding-bottom:10px;color:var(--ink)}\n.sx-kcol h3 i{font-style:normal;font-size:12px;letter-spacing:.08em;color:var(--ink55);font-weight:400}\n.sx-kcol .sx-row{grid-template-columns:30px minmax(0,1fr)}\n.sx-kcol .sx-row .d{display:none}\n.sx-more2{display:inline-block;margin-top:12px;font:italic 400 16px/23px \"EB Garamond\",Garamond,serif;color:var(--ink55);text-decoration:none}\n.sx-more2:hover{color:var(--or-t)}\n.sx-platewrap{max-width:1580px;margin:48px auto 64px;padding:0 var(--fr);box-sizing:border-box}\n.sx-plate{background:#011015;color:#EFE9D8;border:1px solid #011015;padding:66px 57.6px;text-align:center;box-shadow:10px 11px 0 var(--shadow)}\nhtml.lr-dark .sx-plate{background:#0A1B21;border-color:rgba(239,233,216,.17)}\n.sx-plate .sx-k{font:500 10.5px/1 Rules,Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#FF4C00}\n.sx-plate h2{margin:14px 0 12px;font:500 51.84px/54.4px Rules,Arial,sans-serif;letter-spacing:-.012em;color:#EFE9D8}\n.sx-plate p{margin:0 auto 24px;max-width:470px;font:italic 400 18px/24px \"EB Garamond\",Garamond,serif;color:rgba(239,235,222,.88)}\n.sx-btns{display:flex;justify-content:center;gap:10px;flex-wrap:wrap}\n.sx-btns a{display:inline-flex;align-items:center;height:44px;padding:0 20px;border:1px solid rgba(239,235,222,.55);font:400 14px/1 Rules,Arial,sans-serif;color:#EFE9D8;text-decoration:none}\n.sx-btns a:hover{border-color:#FF4C00}\n.sx-sr{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}\n.sx-pill{display:none}\n@media (max-width:860px){\n  #sx-zones,.sx.sx-every{padding:44px 18px 0}\n  .sx-no{font-size:52px;line-height:40px}\n  .sx-reg,.sx-reg.sx-c3{grid-template-columns:minmax(0,1fr)}\n  .sx-ixgrid{grid-template-columns:minmax(0,1fr)}\n  .sx-mini{display:none}\n  .sx-kgrid{grid-template-columns:minmax(0,1fr)}\n  .sx-node{font-size:19px}\n  .sx-path{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:\"a a\" \"b f\"}\n  .sx-path .sx-arrow{display:none}\n  .sx-platewrap{padding:0 18px}\n  .sx-plate{padding:40px 22px}.sx-plate h2{font-size:34px;line-height:37px}\n  .sx-pill{position:fixed;right:16px;bottom:16px;z-index:50;display:flex;flex-direction:column;align-items:center;gap:4px;text-decoration:none;opacity:0;pointer-events:none;transition:opacity .25s}\n  html.sx-hero-out .sx-pill{opacity:1;pointer-events:auto}\n  .sx-pill canvas{width:64px;height:64px;border-radius:50%;border:2px solid #FF4C00;box-shadow:0 4px 0 rgba(1,16,21,.1);background:#011015}\n  .sx-pill span{font:500 9.5px/1 Rules,Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase;background:#011015;color:#F7F4EA;padding:4px 8px}\n}\n@media (prefers-reduced-motion:reduce){.sx-pill{transition:none}}\n.sx-row.is-sel{background:linear-gradient(90deg,rgba(255,76,0,.16),transparent 75%)}\n.sx-row.is-sel .t{color:var(--or-t)}\n.sx-selrow{display:grid;gap:4px;margin:0 0 14px;padding:8px 0 0;border-top:1px solid var(--ink)}\n.sx-selrow .sx-row{border-bottom:1px solid var(--ink)}\n";
  // after first paint: the poster holds the box until then
  var idle = window.requestIdleCallback || function (f) { return setTimeout(f, 200); };
  if (document.readyState === 'complete') idle(mount, { timeout: 1500 }); else addEventListener('load', function () { idle(mount, { timeout: 1500 }); });
})();
