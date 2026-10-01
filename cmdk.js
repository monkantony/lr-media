/* Le Random ⌘K search (30 Sep 2026). Peter: "i want the new command-k search added and replacing this glitchy
   current shit ... every time i search results land somewhere you cant even see them ... no ai implementation".
   One file for both headers: the editorials page (bundle #topbar: #tb-q, #hero-q) and every page that carries the
   article bar (lrft #lrtopbar: #lrtb-q). The panel opens over the page, so results are always in view.
   Data: search_index.json (build_search_index.py), fetched the first time search opens. No AI, no network
   beyond that one file. Source: Editorials Entity Index/cmdk.js (build_search_index.py copies it to lr-media). */
(function () {
  if (window.__lrk) return;
  window.__lrk = 1;
  var BASE = window.LRW_RAW || 'https://raw.githubusercontent.com/monkantony/lr-media/main/';
  var ROWS = Object.create(null), MX = -1, MY = -1, EVOCAB = [];
  /* every search box on the site opens this one panel: the two headers, under Latest, the Archive, the Subjects
     section (Peter, 1 Oct 2026: "the subject search also needs to integrated ... like the archive was") */
  var BOXES = ['tb-q', 'hero-q', 'rg-q', 'sx-q', 'lrtb-q'];
  var IDX = null, LOADING = null, ITEMS = [], SEL = 0, OPEN = false, LASTFOCUS = null, VOCAB = null;
  var TOUCH = window.matchMedia && matchMedia('(pointer:coarse)').matches;
  var MAC = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

  var PAGES = [
    ['Latest', 'The newest editorials', 'latest'], ['Calendar', 'What is on view and coming up', 'calendar'],
    ['Interviews', 'Every conversation', 'interviews'], ['Essays', 'Every essay', 'essays'],
    ['Sets', 'Editorials read in order', 'dossiers'], ['Archive', 'Every editorial, filterable', 'register'],
    ['Subjects', 'People, works, places and ideas', 'subjects'], ['Contributors', 'The writers', 'contributors'],
    ['Guides', 'City guides', 'guides'], ['Issues', 'Every monthly issue', 'issues']];

  /* ---------- text ---------- */
  function fold(s) {
    return String(s == null ? '' : s).normalize('NFKD').replace(/[̀-ͯ]/g, '')
      .replace(/[‘’ʼ]/g, "'").toLowerCase();
  }
  function toks(s) { return fold(s).split(/[^a-z0-9']+/).map(function (t) { return t.replace(/^'+|'+$/g, ''); }).filter(Boolean); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function lev(a, b, cap) {
    if (Math.abs(a.length - b.length) > cap) return cap + 1;
    var prev = [], cur, i, j, mn;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur = [i]; mn = i;
      for (j = 1; j <= b.length; j++) { cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); if (cur[j] < mn) mn = cur[j]; }
      if (mn > cap) return cap + 1;
      prev = cur;
    }
    return prev[b.length];
  }
  function cap(t) { return t.length >= 8 ? 2 : t.length >= 4 ? 1 : 0; }
  /* does token t match one of these words: exact prefix (0) or a near miss (1)? -1 = no */
  function hit(t, words) {
    for (var i = 0; i < words.length; i++) if (words[i].indexOf(t) === 0) return 0;
    var c = cap(t); if (!c) return -1;
    for (i = 0; i < words.length; i++) if (words[i].length >= 3 && (lev(t, words[i], c) <= c || lev(t, words[i].slice(0, t.length), c) <= c)) return 1;
    return -1;
  }
  /* body words: articles holding a word that starts with t; else holding a near miss of t */
  function lower(arr, t) { var lo = 0, hi = arr.length; while (lo < hi) { var m = (lo + hi) >> 1; if (arr[m] < t) lo = m + 1; else hi = m; } return lo; }
  function bodyHits(t, map, vocab) {
    map = map || IDX.w; vocab = vocab || VOCAB;
    var set = Object.create(null), n = 0, i = lower(vocab, t);
    for (; i < vocab.length && vocab[i].indexOf(t) === 0 && n < 400; i++, n++) map[vocab[i]].forEach(function (a) { set[a] = 1; });
    if (!n && cap(t)) {
      var c = cap(t);
      vocab.forEach(function (w) { if (Math.abs(w.length - t.length) <= c && lev(t, w, c) <= c) map[w].forEach(function (a) { set[a] = 1; }); });
    }
    return set;
  }
  /* episodes: the title first, then who speaks, then anything said in the transcript */
  function searchEps(q, qt) {
    var bodies = qt.map(function (t) { return bodyHits(t, IDX.ew, EVOCAB); }), fq = fold(q).trim(), out = [];
    IDX.e.forEach(function (e) {
      var score = 0, ok = true;
      qt.forEach(function (t, i) {
        var h = hit(t, e.T), s = 0;
        if (h === 0) s = 10; else if (h === 1) s = 6;
        else if ((h = hit(t, e.P)) >= 0) s = h ? 5 : 8;
        else if (bodies[i][e[0]]) s = 1;
        if (!s) ok = false; score += s;
      });
      if (!ok) return;
      if (fq.length > 2 && e.F.indexOf(fq) >= 0) score += 15;
      out.push([score, e]);
    });
    out.sort(function (x, y) { return y[0] - x[0] || y[1][0] - x[1][0]; });
    return out.map(function (x) { return x[1]; });
  }

  /* ---------- data ---------- */
  function load() {
    if (IDX) return Promise.resolve(IDX);
    if (LOADING) return LOADING;
    LOADING = fetch(BASE + 'search_index.json', { credentials: 'omit' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) {
        d.a.forEach(function (a) {
          a.T = toks(a[3]); a.P = toks((a[7] || []).join(' ') + ' ' + a[5]).concat([String(a[0]), ('00' + a[0]).slice(-3)]); a.N = toks((a[8] || []).join(' ')); a.F = fold(a[3]);
        });
        d.s.forEach(function (s) { s.T = toks(s[0]); s.F = fold(s[0]); });
        d.e.forEach(function (e) { e.T = toks(e[1]).concat(['episode', 'ep', 'podcast', String(e[0]), ('0' + e[0]).slice(-2)]); if (/\bCh\b/.test(e[1])) e.T.push('chapter'); e.P = toks(e[3]); e.F = fold(e[1]); });
        EVOCAB = Object.keys(d.ew || {}).sort(); d.ew = d.ew || {};
        d.t.forEach(function (t) { t.T = toks(t[0] + ' ' + t[1]); });
        VOCAB = Object.keys(d.w).sort();
        IDX = d; return d;
      });
    LOADING.catch(function () { LOADING = null; });
    return LOADING;
  }

  /* ---------- search ---------- */
  function searchArts(q, qt) {
    var fq = fold(q).trim(), bodies = qt.map(function (t) { return bodyHits(t); }), out = [];
    IDX.a.forEach(function (a) {
      var score = 0, ok = true;
      qt.forEach(function (t, i) {
        var h = hit(t, a.T), s = 0;
        if (h === 0) s = 10; else if (h === 1) s = 6;
        else if ((h = hit(t, a.P)) >= 0) s = h ? 5 : 8;
        else if ((h = hit(t, a.N)) >= 0) s = h ? 2 : 4;
        else if (bodies[i][a[0]]) s = 1;
        if (!s) ok = false; score += s;
      });
      if (!ok) return;
      if (fq.length > 2 && a.F.indexOf(fq) >= 0) score += 15;
      out.push([score, a]);
    });
    out.sort(function (x, y) { return y[0] - x[0] || y[1][0] - x[1][0]; });
    return out.map(function (x) { x[1]._s = x[0]; return x[1]; });
  }
  function searchList(list, qt, fq, full) {
    var out = [];
    list.forEach(function (x) {
      var score = 0, ok = qt.every(function (t) { var h = hit(t, x.T); if (h < 0) return false; score += h ? 1 : 3; return true; });
      if (!ok) return;
      if (full && x.F === fq) score += 20; else if (full && x.F.indexOf(fq) === 0) score += 8;
      out.push([score, x]);
    });
    out.sort(function (a, b) { return b[0] - a[0]; });   /* stable: the list's own order breaks ties */
    return out.map(function (x) { return x[1]; });
  }

  /* ---------- items ---------- */
  function artItem(a) {
    return { href: '/editorial/' + a[1], t: a[3], s: 'No. ' + ('00' + a[0]).slice(-3) + ' · ' + a[2] + ' · ' + a[4],
      icon: a[6] ? '<img class="lrk-th" alt="" decoding="async" src="' + esc(a[6]) + '">' : '<span class="lrk-ic">' + a[0] + '</span>' };
  }
  function subItem(s) {
    var bits = []; if (s[2]) bits.push('in ' + s[2] + ' editorial' + (s[2] > 1 ? 's' : '')); if (s[3]) bits.push(s[3] + ' episode' + (s[3] > 1 ? 's' : ''));
    return { href: '/subjects/' + s[4], t: s[0], s: s[1] + (bits.length ? ' · ' + bits.join(', ') : ''), icon: '<span class="lrk-ic">' + esc(s[0].charAt(0).toUpperCase()) + '</span>' };
  }
  function epItem(e) { return { href: '/episodes/' + e[4], t: e[1], s: 'Le Random Podcast · Episode ' + e[0] + ' · ' + e[2], icon: '<span class="lrk-ic lrk-ep">' + e[0] + '</span>' }; }
  function setItem(t) { return { href: '/editorials#dossiers', t: t[0], s: t[1] + ' · ' + t[2].length + ' editorials', icon: '<span class="lrk-ic">≡</span>' }; }
  function pageItem(p) { return { href: '/editorials#' + p[2], t: p[0], s: p[1], icon: '<span class="lrk-ic">#</span>' }; }

  /* ---------- panel ---------- */
  var CSS = [
    '#lrk-scrim{position:fixed;inset:0;z-index:2147483000;background:rgba(1,16,21,.42);opacity:0;transition:opacity .16s ease;}',
    '#lrk-scrim.on{opacity:1;}',
    '#lrk{opacity:0;transition:opacity .14s ease,margin-top .14s ease;margin-top:8px;}',
    '#lrk.on{opacity:1;margin-top:0;}',
    '#lrk{position:fixed;z-index:2147483001;left:50%;top:12vh;transform:translateX(-50%);width:min(680px,calc(100vw - 32px));max-height:72vh;display:flex;flex-direction:column;',
    ' background:#F7F4EA;color:#011015;border:1px solid #011015;box-shadow:0 24px 70px rgba(1,16,21,.28);font-family:\'Ebgaramond\',\'EB Garamond\',Garamond,Georgia,serif;}',
    '#lrk *{box-sizing:border-box;}',
    '#lrk .lrk-top{display:flex;align-items:center;gap:12px;padding:16px 18px;border-bottom:1px solid rgba(1,16,21,.18);}',
    '#lrk .lrk-top svg{flex:0 0 auto;}',
    '#lrk input{flex:1;min-width:0;border:0;outline:none;background:none;font:italic 22px/1.3 \'Ebgaramond\',\'EB Garamond\',Garamond,Georgia,serif;color:#011015;padding:0;margin:0;height:auto;}',
    '#lrk input::placeholder{color:rgba(1,16,21,.45);}',
    '#lrk input::-webkit-search-cancel-button{-webkit-appearance:none;}',
    '#lrk .lrk-esc{font:500 10px/1 \'Rules\',Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;border:1px solid rgba(1,16,21,.3);padding:5px 7px 4px;background:none;color:#011015;cursor:pointer;}',
    '#lrk .lrk-list{overflow-y:auto;overscroll-behavior:contain;padding:6px 0 10px;}',
    '#lrk .lrk-grp{font:500 10px/1 \'Rules\',Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#FF4C00;padding:14px 18px 6px;}',
    '#lrk a.lrk-it{display:flex;align-items:center;gap:14px;padding:8px 18px;text-decoration:none;color:#011015;border-left:3px solid transparent;}',
    '#lrk a.lrk-it[aria-selected=true]{background:#EFE9D8;border-left-color:#FF4C00;}',
    '#lrk .lrk-th{object-fit:cover;padding:0;margin:0;}',
    '#lrk .lrk-th,#lrk .lrk-ic{flex:0 0 44px;width:44px;height:44px;background:#EFE9D8 center/cover no-repeat;display:flex;align-items:center;justify-content:center;',
    ' font:500 13px/1 \'Rules\',Arial,sans-serif;color:#011015;border:1px solid rgba(1,16,21,.12);}',
    '#lrk .lrk-ep{background:#011015;color:#F7F4EA;border-color:#011015;}',
    '#lrk .lrk-tx{min-width:0;flex:1;}',
    '#lrk .lrk-t{display:block;font-size:18px;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
    '#lrk .lrk-s{display:block;font:400 11px/1.4 \'Rules\',Arial,sans-serif;letter-spacing:.04em;color:rgba(1,16,21,.62);margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
    '#lrk .lrk-t mark{background:none;color:#FF4C00;}',
    '#lrk .lrk-msg{padding:22px 18px;font-style:italic;font-size:17px;color:rgba(1,16,21,.7);}',
    '#lrk .lrk-foot{display:flex;gap:18px;padding:9px 18px;border-top:1px solid rgba(1,16,21,.18);font:400 10px/1 \'Rules\',Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:rgba(1,16,21,.55);}',
    '#lrk .lrk-foot b{font-weight:500;color:#011015;}',
    '@media (max-width:640px){#lrk{top:0;left:0;transform:none;width:100vw;height:100%;max-height:none;border:0;}',
    ' #lrk input{font-size:20px;} #lrk .lrk-foot{display:none;} #lrk a.lrk-it{padding:10px 16px;} #lrk .lrk-top{padding:14px 16px;}}',
    '@media (pointer:coarse){#lrk input{font-size:20px;} #lrk .lrk-foot{display:none;}}',
    'html.lrk-lock,html.lrk-lock body{overflow:hidden !important;}',
    '#lrk .lrk-foot b,.lrk-kbd{font-family:-apple-system,BlinkMacSystemFont,\'Rules\',Arial,sans-serif;}',
    '.tb-search .lrk-kbd,.hero-search .lrk-kbd,.lrk-kbd{font:400 10px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif !important;letter-spacing:.02em !important;text-transform:none !important;color:rgba(1,16,21,.42) !important;border:1px solid rgba(1,16,21,.2) !important;border-radius:3px !important;padding:2px 4px 1px !important;margin:0 0 0 6px !important;white-space:nowrap !important;pointer-events:none !important;flex:0 0 auto !important;width:auto !important;height:auto !important;background:none !important;}',
    '#tb-q,#hero-q,#lrtb-q,#tb-q::placeholder,#hero-q::placeholder,#lrtb-q::placeholder{font-family:\'Rules\',Arial,sans-serif !important;font-size:10.5px !important;font-weight:500 !important;font-style:normal !important;letter-spacing:.1em !important;text-transform:uppercase !important;cursor:pointer;}',
    '#tb-q::placeholder,#hero-q::placeholder,#lrtb-q::placeholder{color:rgba(1,16,21,.45) !important;}',
    '.lrk-besideword{position:relative !important;}',
    '.lrk-besideword .lrk-kbd{position:absolute !important;top:50% !important;transform:translateY(-50%) !important;margin:0 !important;}',
    '.lrk-btn{display:none;align-items:center;justify-content:center;width:34px;height:34px;border:0;background:none;color:inherit;cursor:pointer;padding:0;}',
    '.lrk-btn.lrk-need{display:flex;}'
  ].join('\n');
  var GLASS = '<svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M13 13l5 5" stroke="currentColor" stroke-width="1.6"/></svg>';
  var root, scrim, input, list;

  function build() {
    if (root) return;
    scrim = document.createElement('div'); scrim.id = 'lrk-scrim';
    root = document.createElement('div'); root.id = 'lrk'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Search Le Random');
    root.innerHTML = '<div class="lrk-top">' + GLASS + '<input type="search" autocomplete="off" spellcheck="false" placeholder="Search editorials, people, episodes" aria-label="Search Le Random" role="combobox" aria-expanded="true" aria-controls="lrk-list">' +
      '<button type="button" class="lrk-esc" aria-label="Close search">' + (TOUCH ? 'Close' : 'Esc') + '</button></div>' +
      '<div class="lrk-list" id="lrk-list" role="listbox"></div>' +
      '<div class="lrk-foot"><span><b>↑↓</b> to move</span><span><b>Enter</b> to open</span><span><b>' + (MAC ? '⌘' : 'Ctrl') + ' Enter</b> new tab</span><span><b>Esc</b> to close</span></div>';
    root.style.display = 'none'; scrim.style.display = 'none';
    document.body.appendChild(scrim); document.body.appendChild(root);
    input = root.querySelector('input'); list = root.querySelector('.lrk-list');
    input.addEventListener('input', draw);
    input.addEventListener('keydown', key);
    scrim.addEventListener('click', close);
    root.querySelector('.lrk-esc').addEventListener('click', close);
    list.addEventListener('mousemove', function (e) { if (e.clientX === MX && e.clientY === MY) return; MX = e.clientX; MY = e.clientY; var a = e.target.closest('a.lrk-it'); if (a) sel(+a.getAttribute('data-i'), true); });
    list.addEventListener('click', function (e) { var a = e.target.closest('a.lrk-it'); if (a && !(e.metaKey || e.ctrlKey || e.shiftKey || e.button)) { e.preventDefault(); go(+a.getAttribute('data-i'), false); } });
  }

  function open(q) {
    build();
    if (!OPEN) {
      LASTFOCUS = document.activeElement;
      root.style.display = ''; scrim.style.display = ''; OPEN = true;
      requestAnimationFrame(function () { scrim.classList.add('on'); root.classList.add('on'); });
      document.documentElement.classList.add('lrk-lock');
    }
    input.value = q || ''; draw();
    input.focus(); try { input.setSelectionRange(input.value.length, input.value.length); } catch (e) {}
    load().then(draw, function () { if (OPEN) list.innerHTML = '<p class="lrk-msg">Search could not load. Check the connection and try again.</p>'; });
  }
  function close() {
    if (!OPEN) return;
    OPEN = false; root.style.display = 'none'; scrim.style.display = 'none'; scrim.classList.remove('on'); root.classList.remove('on');
    document.documentElement.classList.remove('lrk-lock');
    if (LASTFOCUS && LASTFOCUS.focus && BOXES.indexOf(LASTFOCUS.id || '') < 0) try { LASTFOCUS.focus(); } catch (e) {}
  }

  function mark(t, qt) {
    var s = esc(t); if (!qt.length) return s;
    var words = qt.filter(function (x) { return x.length > 1; }).map(function (x) { return x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); });
    if (!words.length) return s;
    /* mark on the folded text, map back by position (folding keeps one character per character here) */
    var f = fold(t), out = '', i = 0, re = new RegExp('(^|[^a-z0-9])(' + words.join('|') + ')', 'g'), m;
    if (f.length !== t.length) return s;
    while ((m = re.exec(f))) { var a = m.index + m[1].length, b = a + m[2].length; out += esc(t.slice(i, a)) + '<mark>' + esc(t.slice(a, b)) + '</mark>'; i = b; }
    return out + esc(t.slice(i));
  }

  function draw() {
    if (!OPEN) return;
    var q = input.value.trim(), qt = toks(q), fq = fold(q), groups = [];
    if (!q) {
      var go0 = [{ href: '#', rnd: 1, t: 'An editorial at random', s: 'Roll the die', icon: '<span class="lrk-ic">⚄</span>' }];
      groups.push(['Go', go0]);
      if (IDX) groups.push(['Latest', IDX.a.slice(0, 5).map(artItem)]);
      groups.push(['Pages', PAGES.slice(0, 8).map(pageItem)]);
    } else if (!IDX) {
      ITEMS = []; clearTimeout(draw.t); draw.t = setTimeout(function () { if (!IDX && OPEN) list.innerHTML = '<p class="lrk-msg">Opening the archive…</p>'; }, 250); return;
    } else if (qt.length) {
      /* one fixed order (Peter, 30 Sep 2026: "put people and subject first"); groups never swap while typing */
      groups.push(['People and subjects', searchList(IDX.s, qt, fq, true).slice(0, 5).map(subItem)]);
      groups.push(['Editorials', searchArts(q, qt).slice(0, 8).map(artItem)]);
      groups.push(['Episodes', searchEps(q, qt).slice(0, 5).map(epItem)]);
      groups.push(['Sets', searchList(IDX.t, qt, fq).slice(0, 3).map(setItem)]);
      groups.push(['Pages', PAGES.filter(function (p) { return qt.every(function (t) { return hit(t, toks(p[0] + ' ' + p[1])) === 0; }); }).slice(0, 3).map(pageItem)]);
    }
    ITEMS = [];
    var frag = document.createDocumentFragment(), keep = Object.create(null);
    groups.forEach(function (g) {
      if (!g[1].length) return;
      var h = document.createElement('div'); h.className = 'lrk-grp'; h.setAttribute('role', 'presentation'); h.textContent = g[0]; frag.appendChild(h);
      g[1].forEach(function (x) {
        var i = ITEMS.length; ITEMS.push(x);
        var key = x.href + (x.rnd ? '#rnd' : ''), a = ROWS[key];
        if (!a) {
          a = document.createElement('a'); a.className = 'lrk-it'; a.setAttribute('role', 'option'); a.href = x.href;
          a.innerHTML = x.icon + '<span class="lrk-tx"><span class="lrk-t"></span><span class="lrk-s"></span></span>';
          a.querySelector('.lrk-s').textContent = x.s; ROWS[key] = a;
        }
        a.id = 'lrk-o' + i; a.setAttribute('data-i', i); a.setAttribute('aria-selected', 'false');
        var t = a.querySelector('.lrk-t'), m = mark(x.t, qt); if (t.innerHTML !== m) t.innerHTML = m;
        keep[key] = 1; frag.appendChild(a);
      });
    });
    list.textContent = '';
    if (ITEMS.length) list.appendChild(frag);
    else list.innerHTML = q ? '<p class="lrk-msg">Nothing matches “' + esc(q) + '”.</p>' : '';
    list.scrollTop = 0; sel(0);
  }
  function sel(i, quiet) {
    if (!ITEMS.length) { input.removeAttribute('aria-activedescendant'); return; }
    SEL = Math.max(0, Math.min(ITEMS.length - 1, i));
    [].forEach.call(list.querySelectorAll('a.lrk-it'), function (a) { a.setAttribute('aria-selected', +a.getAttribute('data-i') === SEL ? 'true' : 'false'); });
    input.setAttribute('aria-activedescendant', 'lrk-o' + SEL);
    if (!quiet) { var el = document.getElementById('lrk-o' + SEL); if (el) el.scrollIntoView({ block: 'nearest' }); }
  }
  function go(i, tab) {
    var x = ITEMS[i]; if (!x) return;
    var href = x.href;
    if (x.rnd) { if (!IDX) return; href = '/editorial/' + IDX.a[Math.floor(Math.random() * IDX.a.length)][1]; }
    if (tab) { window.open(href, '_blank', 'noopener'); return; }
    close();
    var u = new URL(href, location.href);
    if (u.pathname === location.pathname && u.hash) {
      if (location.hash === u.hash) { var t = document.getElementById(u.hash.slice(1)); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      else location.hash = u.hash;
    } else location.assign(u.href);
  }
  function key(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); sel(SEL + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel(SEL - 1); }
    else if (e.key === 'Enter') { e.preventDefault(); go(SEL, e.metaKey || e.ctrlKey); }
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'Tab') { e.preventDefault(); sel(SEL + (e.shiftKey ? -1 : 1)); }
  }

  /* ---------- every search box opens the panel: the two headers, the box under Latest and the Archive's own box
     (Peter, 30 Sep 2026: the archive search "is not integrated"). The Archive's chips still filter its list. ---------- */
  function hook(el) {
    if (!el || el.__lrk) return; el.__lrk = 1;
    el.setAttribute('readonly', ''); el.setAttribute('aria-haspopup', 'dialog');
    el.setAttribute('placeholder', 'Search');
    var lab = el.closest('label, .tb-search, .hero-search, .rg-search, .sx-search') || el.parentNode;
    if (!TOUCH && lab && !lab.querySelector('.lrk-kbd')) {
      var k = document.createElement('span'); k.className = 'lrk-kbd'; k.textContent = MAC ? '⌘K' : 'Ctrl K'; k.setAttribute('aria-hidden', 'true'); lab.appendChild(k);
      /* the wide box under Latest (Peter, 30 Sep 2026): the hint sits right after the word "Search", not at the far edge */
      /* every box: the hint floats after the word and takes no room, so the two header bars keep identical
         measurements (the publish gate compares them to the pixel) */
      lab.classList.add('lrk-besideword'); besideWord(el, k); window.addEventListener('resize', function () { besideWord(el, k); });
    }
    function fire(e) { e.preventDefault(); e.stopPropagation(); var v = el.value; if (v) { el.value = ''; } el.blur(); open(v); }
    el.addEventListener('mouseenter', function () { load().catch(function () {}); });   /* warm the index before the click */
    el.addEventListener('touchstart', function () { load().catch(function () {}); }, { passive: true });
    el.addEventListener('mousedown', fire, true); el.addEventListener('touchend', fire, true);
    el.addEventListener('focus', fire, true);
    el.addEventListener('keydown', function (e) { if (e.key.length === 1) { e.preventDefault(); el.blur(); open(e.key); } }, true);
  }
  function besideWord(el, k) {
    /* measured by a hidden twin in the page's own fonts (a canvas misses web fonts such as the italic Garamond) */
    var cs = getComputedStyle(el, '::placeholder'), m = document.createElement('span');
    ['fontFamily', 'fontSize', 'fontStyle', 'fontWeight', 'letterSpacing', 'textTransform'].forEach(function (p) { m.style[p] = cs[p]; });
    m.style.cssText += ';position:absolute;visibility:hidden;white-space:pre;left:0;top:0;pointer-events:none;';
    m.textContent = el.getAttribute('placeholder') || ''; (el.parentNode || document.body).appendChild(m);   /* measured in the box's own context */
    var left = el.offsetLeft + (parseFloat(getComputedStyle(el).paddingLeft) || 0) + m.getBoundingClientRect().width + 10;
    m.remove();
    k.style.setProperty('left', Math.round(left) + 'px', 'important');
  }
  /* re-measure when a web font lands: this code runs before the Garamond loads, and the fallback is wider */
  function remeasure() {
    BOXES.forEach(function (id) { var el = document.getElementById(id), lab = el && el.closest('.lrk-besideword'); if (lab) besideWord(el, lab.querySelector('.lrk-kbd')); });
  }
  if (document.fonts) {
    if (document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', remeasure);
    if (document.fonts.ready) document.fonts.ready.then(remeasure);
  }
  window.addEventListener('load', function () { remeasure(); setTimeout(remeasure, 1500); });
  function phoneButton(bar) {
    if (!bar || bar.querySelector('.lrk-btn')) return;
    var right = bar.querySelector('.right') || bar;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'lrk-btn'; b.setAttribute('aria-label', 'Search Le Random'); b.innerHTML = GLASS;
    b.addEventListener('touchstart', function () { load().catch(function () {}); }, { passive: true });
    var box = right.querySelector('.tb-search'); if (RO && box) RO.observe(box);
    b.addEventListener('click', function () { open(''); });
    right.insertBefore(b, right.firstChild);
  }
  function glassNeeded() {
    [].forEach.call(document.querySelectorAll('.lrk-btn'), function (b) {
      var box = b.parentNode && b.parentNode.querySelector('.tb-search');
      var hidden = !box || box.offsetWidth === 0 || getComputedStyle(box).display === 'none';
      b.classList.toggle('lrk-need', hidden);
    });
  }
  window.addEventListener('resize', function () { clearTimeout(glassNeeded.t); glassNeeded.t = setTimeout(glassNeeded, 120); });
  /* the check must follow the layout: this code now runs before the header is laid out (inlined, 30 Sep 2026),
     so a box that is still 0 px wide at that instant would wrongly show the glass on desktop */
  var RO = window.ResizeObserver ? new ResizeObserver(function () { glassNeeded(); }) : null;
  function hookAll() {
    if (!document.getElementById('lrk-css')) { var st = document.createElement('style'); st.id = 'lrk-css'; st.textContent = CSS; document.head.appendChild(st); }
    BOXES.forEach(function (id) { hook(document.getElementById(id)); });
    phoneButton(document.getElementById('topbar')); phoneButton(document.getElementById('lrtopbar')); glassNeeded();
  }
  hookAll();
  new MutationObserver(function () {
    if (BOXES.some(function (id) { var el = document.getElementById(id); return el && !el.__lrk; })) hookAll();
  }).observe(document.documentElement, { childList: true, subtree: true });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Meta' || e.key === 'Control') load().catch(function () {});
    if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); if (OPEN) close(); else open(''); }
    else if (OPEN && e.key === 'Escape') { e.preventDefault(); close(); }
  }, true);
  window.LRK = { open: open, close: close };
})();
