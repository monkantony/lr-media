/* lr-cmdk loader begin */
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
  var ROWS = Object.create(null), MX = -1, MY = -1, EVOCAB = [], MVOCAB = [];
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
      .replace(/[øØ]/g, 'o').replace(/[łŁ]/g, 'l').replace(/[đĐðÐ]/g, 'd').replace(/ı/g, 'i')
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
    return out.map(function (x) { x[1]._s = x[0]; return x[1]; });
  }

  /* Timeline moments (6 Oct 2026, Peter: "ksearch must now be fully integrative of the TL and its new individual moments"):
     the title and year first, then the people named in the moment, then anything the moment page says */
  function searchMoms(q, qt) {
    var bodies = qt.map(function (t) { return bodyHits(t, IDX.mw, MVOCAB); }), fq = fold(q).trim(), out = [];
    IDX.m.forEach(function (m) {
      var score = 0, ok = true, fz = false;
      qt.forEach(function (t, i) {
        var h = hit(t, m.T), s = 0;
        if (h === 0) s = 10; else if (h === 1) { s = 6; fz = true; }
        else if ((h = hit(t, m.P)) >= 0) { s = h ? 5 : 8; if (h) fz = true; }
        else if (bodies[i][m.i]) s = 1;
        if (!s) ok = false; score += s;
      });
      if (!ok) return;
      if (fq.length > 2 && m.F.indexOf(fq) >= 0) score += 15;
      out.push([score, m, fz]);
    });
    var exact = out.filter(function (x) { return !x[2]; }); if (exact.length) out = exact;   /* "bjorn" must not list "... Is Born" */
    out.sort(function (x, y) { return y[0] - x[0] || x[1][6] - y[1][6]; });
    return out.map(function (x) { x[1]._s = x[0]; return x[1]; });
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
        d.m = d.m || []; d.mw = d.mw || {}; MVOCAB = Object.keys(d.mw).sort();
        d.m.forEach(function (m, i) { m.i = i; m.T = toks(m[1] + ' ' + m[2]); m.P = toks((m[5] || []).join(' ')); m.F = fold(m[1]); });
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
    var bits = []; if (s[2]) bits.push('in ' + s[2] + ' editorial' + (s[2] > 1 ? 's' : '')); if (s[3]) bits.push(s[3] + ' episode' + (s[3] > 1 ? 's' : '')); if (s[5]) bits.push(s[5] + ' Timeline moment' + (s[5] > 1 ? 's' : ''));
    return { href: '/subjects/' + s[4], t: s[0], s: s[1] + (bits.length ? ' · ' + bits.join(', ') : ''), icon: '<span class="lrk-ic">' + esc(s[0].charAt(0).toUpperCase()) + '</span>' };
  }
  function epItem(e) { return { href: '/episodes/' + e[4], t: e[1], s: 'Le Random Podcast · Episode ' + e[0] + ' · ' + e[2], icon: '<span class="lrk-ic lrk-ep">' + e[0] + '</span>' }; }
  function momItem(m) { return { href: 'https://timeline.lerandom.art/m/' + m[0], t: m[1], s: 'Generative Art Timeline · ' + m[2] + (m[4] ? ' · ' + m[4] : ''), icon: '<span class="lrk-ic">◷</span>' }; }
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
    root.innerHTML = '<div class="lrk-top">' + GLASS + '<input type="search" autocomplete="off" spellcheck="false" placeholder="Search editorials, episodes, people and the Timeline" aria-label="Search Le Random" role="combobox" aria-expanded="true" aria-controls="lrk-list">' +
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
      /* people and subjects first (Peter, 30 Sep 2026); then Editorials and Episodes, whichever holds the more direct
         match leads (Peter, 2 Oct 2026: episodes must not sit below editorials regardless of match); a tie keeps Editorials first */
      groups.push(['People and subjects', searchList(IDX.s, qt, fq, true).slice(0, 5).map(subItem)]);
      var ar = searchArts(q, qt).slice(0, 8), ep = searchEps(q, qt).slice(0, 5), mo = IDX.m && IDX.m.length ? searchMoms(q, qt).slice(0, 6) : [],
          cg = [[ar, ['Editorials', ar.map(artItem)]], [ep, ['Episodes', ep.map(epItem)]], [mo, ['Timeline', mo.map(momItem)]]];
      /* 6 Oct 2026: Editorials, Episodes and Timeline lead by their best direct match; a tie keeps this order (stable sort) */
      cg.sort(function (x, y) { return (y[0].length ? y[0][0]._s : -1) - (x[0].length ? x[0][0]._s : -1); });
      cg.forEach(function (g) { groups.push(g[1]); });
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
    var k0 = lab && lab.querySelector('.lrk-kbd');   /* lr-bar-baked: a baked hint says ⌘K; off a Mac it says Ctrl K, on touch it goes */
    if (k0 && TOUCH) k0.remove();
    else if (k0 && !MAC) { k0.textContent = 'Ctrl K'; besideWord(el, k0); }
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
    if (!bar) return; var b0 = bar.querySelector('.lrk-btn'); if (b0 && b0.__lrk) return;   /* lr-bar-baked: a baked glass is bound, not skipped */
    var right = bar.querySelector('.right') || bar;
    var b = b0 || document.createElement('button'); b.__lrk = 1; if (!b0) { b.type = 'button'; b.className = 'lrk-btn'; b.setAttribute('aria-label', 'Search Le Random'); b.innerHTML = GLASS; }
    b.addEventListener('touchstart', function () { load().catch(function () {}); }, { passive: true });
    var box = right.querySelector('.tb-search'); if (RO && box) RO.observe(box);
    b.addEventListener('click', function () { open(''); });
    if (!b0) right.insertBefore(b, right.firstChild);
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
/* lr-cmdk loader end */
(function(){var st=document.createElement('style');st.textContent=`
#lrft { --lr-ink:#011015; --lr-ink70:rgba(1,16,21,.62); --lr-ink40:rgba(1,16,21,.38);
  --lr-hair:rgba(1,16,21,.17); --lr-or:#FF4C00;
  --lr-sans:'Rules',Arial,sans-serif; --lr-serif:'Ebgaramond','EB Garamond',Garamond,Georgia,serif;
  font-family:var(--lr-serif); color:var(--lr-ink); font-size:18px; line-height:1.55; margin-top:56px; }
#lrft a { color:inherit; text-decoration:none; }
#lrft .lrft-lbl { font-family:var(--lr-sans); font-size:11px; font-weight:500; letter-spacing:.22em; text-transform:uppercase; }
#lrft .lrft-meta { font-family:var(--lr-sans); font-size:10px; font-weight:500; letter-spacing:.13em; text-transform:uppercase; color:var(--lr-ink40); }
#lrft .lrft-meta em { font-style:normal; color:var(--lr-or); margin-right:8px; }
#lrft .lrft-zone { border-top:1px solid var(--lr-ink); padding:26px 0 30px; }
#lrft .lrft-zone h2 { margin:0 0 18px; }
#lrft .lrft-grp { display:flex; gap:16px; align-items:baseline; padding:9px 0; border-bottom:1px solid rgba(1,16,21,.07); }
#lrft .lrft-grp b { flex:0 0 108px; font-family:var(--lr-sans); font-size:9.5px; font-weight:500; letter-spacing:.16em; text-transform:uppercase; color:var(--lr-ink40); }
#lrft .lrft-chips { display:flex; flex-wrap:wrap; gap:7px 6px; }
#lrft .lrft-chip { font-size:15px; line-height:1.1; padding:5px 11px 4px; border:1px solid var(--lr-hair); border-radius:999px; color:var(--lr-ink70); }
#lrft .lrft-chip.on { border-color:rgba(1,16,21,.45); color:var(--lr-ink); }
#lrft a.lrft-chip.on:hover { border-color:var(--lr-or); color:var(--lr-or); }
#lrft .lrft-rn { display:grid; grid-template-columns:1fr 1fr; gap:clamp(18px,3vw,36px); }
#lrft .lrft-card figure { aspect-ratio:16/9; overflow:hidden; margin:0 0 12px; border:1px solid var(--lr-hair); background:#F7F4EA; }
#lrft .lrft-card img { width:100%; height:100%; object-fit:cover; }
#lrft .lrft-card h3 { font-family:var(--lr-serif); font-weight:500; font-size:clamp(19px,2vw,25px); line-height:1.12; margin:7px 0 6px; }
#lrft .lrft-card:hover h3 { text-decoration:underline; text-underline-offset:5px; }
#lrft .lrft-by { font-family:var(--lr-sans); font-size:9.5px; letter-spacing:.13em; text-transform:uppercase; color:var(--lr-ink70); display:block; }
#lrft .lrft-pn { display:grid; grid-template-columns:1fr 1fr; border-top:1px solid var(--lr-ink); }
#lrft .lrft-pn a { padding:18px 0 42px; }
#lrft .lrft-pn a + a { text-align:right; border-left:1px solid var(--lr-hair); padding-left:18px; }
#lrft .lrft-dir { font-family:var(--lr-sans); font-size:9.5px; letter-spacing:.18em; text-transform:uppercase; color:var(--lr-ink40); display:block; margin-bottom:7px; }
#lrft .lrft-t { font-weight:500; font-size:17px; line-height:1.2; }
#lrft .lrft-pn a:hover .lrft-t { color:var(--lr-or); }
@media (max-width:640px){ #lrft .lrft-rn { grid-template-columns:1fr; } #lrft .lrft-grp { flex-direction:column; gap:7px; } }
#lrap { --lr-ink:#011015; --lr-ink40:rgba(1,16,21,.38); --lr-or:#FF4C00; --lr-sans:'Rules',Arial,sans-serif;
  display:flex; flex-wrap:wrap; align-items:center; column-gap:16px; row-gap:10px; padding:15px 0;
  margin:40px 0 34px;   /* clear air under the hero image (Peter, 20 Sep 2026) */
  border-top:1px solid var(--lr-ink); border-bottom:1px solid rgba(1,16,21,.17);
  font-family:var(--lr-sans); color:var(--lr-ink); }
/* 17 Sep 2026 (Peter): no "N min" in the label (the time is right below); desktop reads "Listen" + the
   piece's title, phones read "Listen to this editorial"; the credit is one plain line under the player */
#lrap .lrap-lbl-x { display:none; }
#lrap .lrap-title { font-size:15px; font-weight:500; line-height:1.25; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
#lrap .lrap-btn { width:44px; height:44px; flex:0 0 44px; border-radius:999px; border:1px solid var(--lr-ink);
  background:none; color:var(--lr-ink); cursor:pointer; display:grid; place-items:center; padding:0; }
#lrap .lrap-btn:hover { border-color:var(--lr-or); color:var(--lr-or); }
#lrap .lrap-btn svg { width:15px; height:15px; fill:currentColor; display:block; }
#lrap.on .lrap-ic-play { display:none; }
#lrap:not(.on) .lrap-ic-pause { display:none; }
#lrap .lrap-meta { flex:1; min-width:0; display:flex; flex-direction:column; gap:7px; }
#lrap .lrap-lbl { font-size:10px; font-weight:500; letter-spacing:.18em; text-transform:uppercase; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
#lrap .lrap-bar { height:2px; background:rgba(1,16,21,.12); position:relative; cursor:pointer; }
#lrap .lrap-bar::before { content:""; position:absolute; inset:-8px 0; }
#lrap .lrap-fill { position:absolute; top:0; bottom:0; left:0; width:0%; background:var(--lr-or); }
/* 20 Sep 2026: the credit rides on the label's line, greyed back, and the separating rule and the
   whole third row go away with it ("it doesnt need it's own damn dedicated line"). */
#lrap .lrap-top { display:flex; align-items:baseline; column-gap:12px; min-width:0; }
#lrap .lrap-ai { min-width:0; font-size:11px; letter-spacing:0; text-transform:none;
  color:rgba(1,16,21,.45); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
/* phones: the label keeps the room, the credit takes what is left and ellipsises rather than wrapping */
@media (max-width:640px){ #lrap .lrap-ai { font-size:10px; } #lrap .lrap-rate { flex-basis:48px; width:48px; padding:6px 6px; } #lrap.float .lrap-rate { flex-basis:58px; width:58px; padding:7px 11px; } }
#lrap.float::after { display:none; }
#lrap .lrap-time { font-size:9.5px; letter-spacing:.08em; color:rgba(1,16,21,.38); font-variant-numeric:tabular-nums; }
#lrap .lrap-skip { width:36px; height:36px; flex:0 0 36px; border-radius:999px; border:1px solid rgba(1,16,21,.4);
  background:none; color:var(--lr-ink); cursor:pointer; font-family:var(--lr-sans); font-size:8.5px; font-weight:500; letter-spacing:.04em; padding:0; }
#lrap .lrap-rate { flex:0 0 58px; width:58px; text-align:center; align-self:center; border:1px solid rgba(1,16,21,.4); border-radius:999px; background:none;
  color:var(--lr-ink); cursor:pointer; font-family:var(--lr-sans); font-size:9.5px; font-weight:500; letter-spacing:.08em;
  padding:7px 11px; font-variant-numeric:tabular-nums; }
#lrap .lrap-skip:hover, #lrap .lrap-rate:hover { border-color:var(--lr-or); color:var(--lr-or); }
/* the player floats while it plays and its home is off screen (Peter, 8 Sep 2026) */
.lrap-home { position:relative; }
#lrap.float { position:fixed; left:50%; bottom:18px; transform:translateX(-50%); width:min(760px,calc(100vw - 32px)); margin:0; padding:10px 16px;
  background:#F7F4EA; border:1px solid var(--lr-ink); border-radius:14px; box-shadow:0 12px 32px rgba(1,16,21,.18); z-index:950; gap:12px; }
#lrap.float .lrap-ai { display:none; }
#lrap.float .lrap-lbl { font-size:9px; }
@media (max-width:640px){ #lrap.float { bottom:10px; width:calc(100vw - 20px); padding:8px 10px; gap:8px; } #lrap.float .lrap-skip { display:none; } }
/* phones (after every base rule so these win): tighter gaps and smaller skips give the label its whole line */
@media (max-width:640px){ #lrap { column-gap:12px; } #lrap .lrap-skip { width:32px; height:32px; flex-basis:32px; } #lrap .lrap-lbl-x { display:inline; } #lrap .lrap-title { display:none; } #lrap .lrap-lbl { font-size:9.5px; letter-spacing:.1em; } }
.lrft-ln { display:grid; grid-template-columns:44px minmax(0,1fr) 72px 64px; column-gap:16px; align-items:baseline; padding:13px 0; border-bottom:1px solid rgba(1,16,21,.08); }
.lrft-ln .ln-no { font-family:var(--lr-sans); font-size:10px; font-weight:500; letter-spacing:.1em; color:var(--lr-or); }
.lrft-ln .ln-t { min-width:0; font-family:var(--lr-sans); font-weight:500; letter-spacing:-.02rem; font-size:16.5px; line-height:1.25; }
.lrft-ln .ln-badge { justify-self:start; }
.lrft-ln .ln-len { justify-self:end; }
.lrft-ln:hover .ln-t { color:var(--lr-or); }
.lrft-ln .ln-len, .lrft-ln .ln-badge { font-family:var(--lr-sans); font-size:9.5px; font-weight:500; letter-spacing:.13em; text-transform:uppercase; color:rgba(1,16,21,.38); white-space:nowrap; }
.lrft-ln .ln-badge { border:1px solid var(--lr-or); color:var(--lr-or); border-radius:999px; padding:2px 8px 1px; }
.lrft-tl { grid-template-columns:44px minmax(0,1fr) 72px 64px; }   /* 2 Oct 2026 (Peter): timeline titles on the Listen next title edge; badges stay in one column */
.lrmg-in { --lr-ink:#011015; --lr-or:#FF4C00; --lr-ink40:rgba(1,16,21,.38); --lr-sans:'Rules',Arial,sans-serif; --lr-serif:'Ebgaramond','EB Garamond',Garamond,Georgia,serif;
  display:block; width:100%; margin:34px 0; box-sizing:border-box;
  border:1px solid var(--lr-ink) !important; box-shadow:6px 7px 0 rgba(1,16,21,.1) !important;
  background:#F7F4EA !important; padding:20px 24px 18px !important; font-family:var(--lr-serif); }
.lr-sl { color:inherit; text-decoration:none; border-bottom:1px solid rgba(2,176,244,.5); transition:border-color .2s ease, color .2s ease; }
.lr-sl:hover { color:var(--lr-or); border-bottom-color:var(--lr-or); }
.lrmg-in a, .lrmg-in a * { text-decoration:none !important; }
.lrmg-in a { display:block; }
.lrmg-in .lrmg-lbl { display:block; font-family:var(--lr-sans); font-size:8.5px; font-weight:500; letter-spacing:.18em;
  text-transform:uppercase; color:var(--lr-or); margin-bottom:6px; }
.lrmg-in .lrmg-q { display:block; font-size:17px; line-height:1.5; color:var(--lr-ink); max-width:64ch; transition:color .2s; }
.lrmg-in .lrmg-s { display:block; font-family:var(--lr-sans); font-size:11px; font-weight:500; letter-spacing:.12em;
  text-transform:uppercase; color:var(--lr-ink); margin-top:12px; padding-top:10px; border-top:1px solid rgba(1,16,21,.15); transition:color .2s; }
.lrmg-in .lrmg-s::after { content:' →'; }
.lrmg-in a:hover .lrmg-q, .lrmg-in a:hover .lrmg-s { color:#02B0F4; }

.lrft-tl .tl-y { grid-column:1; }
@media(max-width:640px){ .lrft-ln { grid-template-columns:44px minmax(0,1fr); } .lrft-ln .ln-badge, .lrft-ln .ln-len { grid-column:2; justify-self:start; } }

/* ---------- the editorials utility bar, carried onto the article pages ---------- */
@font-face { font-family:'Rules'; src:url('https://cdn.prod.website-files.com/640f56f772eeb36cc6880d91/640f62c343c4c811e1a8e5c6_Rules-Regular.woff') format('woff'); font-weight:400; font-display:swap; }
@font-face { font-family:'Rules'; src:url('https://cdn.prod.website-files.com/640f56f772eeb36cc6880d91/640f62c34eb91d0ed0988906_Rules-Medium.woff') format('woff'); font-weight:500; font-display:swap; }
@font-face { font-family:'Rules'; src:url('https://cdn.prod.website-files.com/640f56f772eeb36cc6880d91/640f62c327b0745f3329c484_Rules-Bold.woff') format('woff'); font-weight:700; font-display:swap; }
/* 18 Sep 2026 (Peter, repeatedly: "individual header is aligned incorrectly to the left"): the
   editorials page carries --frame and --maxw on :root from the bundle and the article page does
   not, so every rule here that read clamp(20px,4.4vw,80px) was invalid and silently dropped — that is why
   the article bar sat at a flat 215px while the editorials bar sat at 254px, and why the brand
   never took its matching shift. Declare the same two measurements, then the two bars agree. */
:root { --frame:clamp(20px,4.4vw,80px); --maxw:1580px; }
#lrtopbar *, #lrtopbar *::before, #lrtopbar *::after { margin:0; padding:0; box-sizing:border-box; }
/* 3 Oct 2026 (Peter: the dark-mode button "looks shitty and cheap" on editorial, episode and subject pages): the reset
   above outranks the theme menu's own class rules (site head lr_theme.js), so its frame and item padding fell to 0.
   Give them back here so the menu matches the one in the /editorials header exactly. */
#lrtopbar .lr-thm-menu { padding:6px; }
#lrtopbar .lr-thm-it { padding:8px 10px; }
/* 3 Oct 2026 (Peter: article text ran ~170 characters a line on wide screens; "it should be text (same width as this
   text in claude) centered in the middle but the images can stay large and fill screen"): the article's words sit in
   one centred reading column about as wide as Claude's (610px, the same as the episode transcripts; Peter 3 Oct: "make it 610 for eds too"); figures, video and embeds keep
   the full column. Narrower screens are unaffected (the column is already narrower than this). */
.article > .w-richtext > :not(figure):not(.w-embed):not(.w-richtext-figure-type-video) { max-width:610px; margin-left:auto; margin-right:auto; }
/* 3 Oct 2026 (Peter): embeds sit centred in the column: tweets (before and after the widget renders), Instagram, TikTok, fixed-width iframes */
.text-garamond.w-richtext .twitter-tweet, .text-garamond.w-richtext .twitter-tweet-rendered,
.text-garamond.w-richtext .instagram-media, .text-garamond.w-richtext .tiktok-embed { margin-left:auto !important; margin-right:auto !important; }
.text-garamond.w-richtext .w-embed > iframe, .text-garamond.w-richtext .w-embed > div > iframe { display:block; margin-left:auto; margin-right:auto; }
.article > .lrap-home { width:100%; max-width:610px; margin-left:auto; margin-right:auto; }   /* the Listen player sits on the same column */
#lrtopbar { box-sizing:border-box; color:#011015; font-family:'Ebgaramond','Ebgaramond','EB Garamond',Garamond,Georgia,serif; font-size:18px;
  line-height:1.5; -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility; }
#lrtopbar a { color:inherit; text-decoration:none; }
#lrtopbar :focus-visible { outline:2px solid #FF4C00; outline-offset:3px; }
#lrtopbar .wrap { max-width:1580px; margin:0 auto; padding-inline:clamp(20px,4.4vw,80px); }

/* the editorials page nudges the Webflow brand by the same frame measure; without it the logo
   sits 39px left of where it sits on the main page and the whole band reads misaligned */
@media(min-width:1001px){ .w-nav-brand { margin-left:max(0px, calc(clamp(20px,4.4vw,80px) - 24px)); } }

/* .topbar */
#lrtopbar { position:sticky; top:var(--lrw-navh,0px); z-index:60; background:#EFE9D8;
  border-bottom:1px solid transparent; transition:border-color .25s ease, background .25s ease; }
/* one bar: on wide screens the toolbar rises into the navbar band, between logo and burger */
@media(min-width:1160px){
  #lrtopbar { position:fixed; top:0; left:0; right:0; height:var(--lrw-navh,70px); z-index:900;
    display:flex; align-items:center;
    /* the same figure the editorials bar uses, so the nav starts on the same pixel */
    padding-left:calc(215px + max(0px, calc(clamp(20px,4.4vw,80px) - 24px))); padding-right:64px; }
  #lrtopbar > * { flex:1 1 auto; min-width:0; }
  /* the Webflow navbar keeps only its two real controls; its invisible full-width
     hit plane must not sit over the merged toolbar */
  .navbar_component { pointer-events:none; background:transparent !important;
    backdrop-filter:none !important; -webkit-backdrop-filter:none !important; }
  .navbar_component .menu-button, .navbar_component .side-menu_component,
  .navbar_component .side-menu_component *, .navbar_component .close-button { pointer-events:auto; }
  /* the brand anchor stretches invisibly across the band; only its logo image takes clicks */
  .navbar_component .w-nav-brand { pointer-events:none; }
  .navbar_component .w-nav-brand img { pointer-events:auto; }
}
#lrtopbar.stuck { border-bottom-color:rgba(1,16,21,.17); background:rgba(244,241,230,.94); -webkit-backdrop-filter:blur(8px) saturate(1.1); backdrop-filter:blur(8px) saturate(1.1); }

/* .util */
#lrtopbar .util { display:flex; align-items:center; justify-content:space-between; gap:30px; padding:17px 0 16px; }
#lrtopbar .util nav { display:flex; gap:26px; flex:1 1 auto; min-width:0; overflow-x:auto;
  scrollbar-width:none; -ms-overflow-style:none; justify-content:flex-end; }
#lrtopbar .util nav::-webkit-scrollbar { display:none; }
#lrtopbar .util nav a { font-family:'Rules',Arial,sans-serif; font-size:11.5px; letter-spacing:.04em; padding-bottom:2px; border-bottom:1px solid transparent; white-space:nowrap; }
#lrtopbar .util nav a:hover { border-color:#011015; }
#lrtopbar .util nav a.on { border-color:#011015; }
#lrtopbar .util .right { display:flex; align-items:center; gap:18px; }
@media(max-width:1180px){ #lrtopbar .util { flex-wrap:wrap; } #lrtopbar .util nav { order:9; flex:1 1 100%; justify-content:flex-start; gap:18px; margin-top:9px; } }
#lrtopbar .util nav { gap:20px; }

/* ---------- the die ---------- */
#lrtopbar .die-btn { display:inline-flex; align-items:center; gap:11px; cursor:pointer; }
#lrtopbar .die-wrap { display:inline-block; position:relative; line-height:0; will-change:transform;
  transform-origin:50% 60%; }
#lrtopbar .die-btn:hover .die-wrap { animation:lrDieShake .62s ease-in-out infinite; }
#lrtopbar .die-btn.rolling .die-wrap { animation:lrDieRoll 1.15s cubic-bezier(.28,.82,.3,1) both; }
#lrtopbar .die-svg { display:block; overflow:visible; }
#lrtopbar .die-face { display:none; }
#lrtopbar .die-face.is-on { display:block; }
#lrtopbar .die-body { fill:#F7F4EA; stroke:#011015; stroke-width:1.6; transition:fill .2s; }
#lrtopbar .die-pip { fill:#011015; transition:fill .2s; }
#lrtopbar .die-btn:hover .die-body, #lrtopbar .die-btn.rolling .die-body { fill:#FF4C00; stroke:#FF4C00; }
#lrtopbar .die-btn:hover .die-pip, #lrtopbar .die-btn.rolling .die-pip { fill:#F7F4EA; }
#lrtopbar .die-shadow { position:absolute; left:50%; bottom:-7px; width:76%; height:4px; translate:-50% 0;
  background:rgba(1,16,21,.26); border-radius:50%; filter:blur(2.5px); }
#lrtopbar .die-btn.rolling .die-shadow { animation:lrDieShadow 1.15s cubic-bezier(.28,.82,.3,1) both; }
#lrtopbar .die-lbl { font-family:'Rules',Arial,sans-serif; font-size:10px; font-weight:500; letter-spacing:.16em; text-transform:uppercase; }
#lrtopbar .die-btn:hover .die-lbl { color:#FF4C00; }
@keyframes lrDieShake {
  0%,100% { transform:rotate(-6deg); }
  50%     { transform:rotate(6deg); }
}
@keyframes lrDieRoll {
  0%   { transform:rotate(0deg)     translateY(0)     scale(1,1); }
  5%   { transform:rotate(-16deg)   translateY(2px)   scale(1.08,.92); }
  10%  { transform:rotate(18deg)    translateY(2px)   scale(1.08,.92); }
  15%  { transform:rotate(-14deg)   translateY(3px)   scale(1.12,.88); }
  26%  { transform:rotate(190deg)   translateY(-28px) scale(.88,1.14); }
  44%  { transform:rotate(455deg)   translateY(-36px) scale(1,1); }
  62%  { transform:rotate(720deg)   translateY(-20px) scale(1,1); }
  78%  { transform:rotate(915deg)   translateY(0)     scale(1.24,.76); }
  87%  { transform:rotate(1015deg)  translateY(-9px)  scale(.93,1.09); }
  95%  { transform:rotate(1068deg)  translateY(0)     scale(1.07,.93); }
  100% { transform:rotate(1080deg)  translateY(0)     scale(1,1); }
}
@keyframes lrDieShadow {
  0%   { transform:translate(-50%,0) scaleX(1);   opacity:.28; }
  15%  { transform:translate(-50%,0) scaleX(1.24);opacity:.34; }
  44%  { transform:translate(-50%,0) scaleX(.42); opacity:.08; }
  78%  { transform:translate(-50%,0) scaleX(1.26);opacity:.36; }
  100% { transform:translate(-50%,0) scaleX(1);   opacity:.28; }
}
@media (prefers-reduced-motion:reduce) {
  #lrtopbar .die-btn:hover .die-wrap, #lrtopbar .die-btn.rolling .die-wrap, #lrtopbar .die-btn.rolling .die-shadow { animation:none; }
}

/* top bar: more presence, harder landing when stuck */
#lrtopbar .util { padding:20px 0 18px; }
#lrtopbar .util nav a { font-size:10.5px; font-weight:500; letter-spacing:.15em; text-transform:uppercase; }
#lrtopbar.stuck { border-bottom:2px solid #011015; }
/* mirror of the editorials bar (lr-topbar-v2): centred links, one-line die label, narrow search, laptop density */
#lrtopbar .util nav { justify-content:center; gap:10px; transform:translateY(3px); }
#lrtopbar .util nav a { flex:0 0 auto; font-size:11px; }
#lrtopbar .tb-search { width:84px; }
#lrtopbar .tb-search:focus-within { width:160px; }
#lrtopbar .die-lbl { white-space:nowrap; }
#lrtopbar .util .right { gap:14px; }
@media(max-width:1440px){ #lrtopbar .tb-search { width:64px; } #lrtopbar .tb-search:focus-within { width:150px; } #lrtopbar .util nav { gap:9px; } #lrtopbar .util nav a { font-size:10.5px; letter-spacing:.1em; } #lrtopbar .util .right { gap:10px; } }
/* lr-prog: the rule under the bar doubles as the article's reading-progress bar.
   Same 2px height. With an article body on the page the bar carries .lr-prog: the
   stuck rule fades to the hairline track and an ink fill laid exactly over it scales
   from the bar's left edge to its right (the viewport's edges where the bar is fixed).
   No transition on the fill: it tracks the scroll position exactly. */
#lrtopbar.lr-prog.stuck { border-bottom-color:rgba(1,16,21,.17); }
#lrtopbar .tb-prog { display:none; position:absolute; left:0; right:0; bottom:-2px; height:2px;
  background:#011015; transform:scaleX(0); transform-origin:0 50%; will-change:transform;
  transition:none; pointer-events:none; }
#lrtopbar.lr-prog.stuck .tb-prog { display:block; }

/* secondary editorials bar: slim, nav left, die right (brand + Subscribe live in the native navbar) */
#lrtopbar .util { padding:11px clamp(20px,4.4vw,80px) 10px; }
#lrtopbar .util nav { justify-content:flex-start; }   /* same specificity as the flex-end above, so source order decides, exactly as on the editorials page */

/* brandless topbar: never wrap - the anchor nav scrolls, the die keeps the right edge */
@media(max-width:1180px){
  #lrtopbar .util { flex-wrap:nowrap; }
  #lrtopbar .util nav { order:0; flex:1 1 auto; margin-top:0; }
}

/* ---------- search ---------- */
#lrtopbar .tb-search { display:flex; align-items:center; border-bottom:1px solid rgba(1,16,21,.3); padding:3px 2px; width:190px; transition:border-color .2s ease; }
#lrtopbar .tb-search:focus-within { border-color:#011015; }
/* Webflow's own label{margin-bottom:5px} outranks the overlay's * reset, so on the
   editorials page the right-hand group measures 31.5px and the search field sits
   2.5px above centre. The id-scoped reset here would win, so put the 5px back and
   the two bars line up to the pixel. */
#lrtopbar .tb-search { margin-bottom:5px; }
#lrtopbar .tb-search input { border:0; background:none; outline:none; width:100%; font-family:'Ebgaramond','Ebgaramond','EB Garamond',Garamond,Georgia,serif; font-style:italic; font-size:13px; line-height:1.5; height:auto; min-height:0; color:#011015; }
#lrtopbar .tb-search input::-webkit-search-cancel-button { -webkit-appearance:none; }
@media(max-width:860px){ #lrtopbar .tb-search { width:110px; } #lrtopbar .tb-search:focus-within { width:150px; } }
@media(max-width:640px){ #lrtopbar .tb-search { display:none; } }
/* iOS zoom guard - inputs never below 16px on touch screens */
@media (pointer:coarse){ #lrtopbar .tb-search input { font-size:16px; } }

/* merged bar (mirrors the bundle, 5 Sep): util shrinks to the band, nav fits from 1160 up */
@media(min-width:1160px){
  #lrtopbar .util { box-sizing:border-box; width:100%; max-width:none; margin:0; padding-left:0; padding-right:0; gap:22px; }
  #lrtopbar .util nav { gap:18px; }
  #lrtopbar .util .right { gap:14px; }
}
@media(min-width:1160px) and (max-width:1300px){
  #lrtopbar .util nav { gap:13px; }
  #lrtopbar .tb-search { width:120px; }
  #lrtopbar .tb-search:focus-within { width:150px; }
}
/* the article page's own furniture, unrelated to the bar */
/* the hand-curated Suggested Reading cards are retired: the footer handles related reading */
a.read-next, .w-layout-grid.grid-16 { display:none !important; }
.footer8_component [data="year"], .footer8_component .div-block-107 { font-size:inherit !important; line-height:inherit !important; display:inline !important; font-family:inherit !important; }
/* one bar from tablet width up, mirrored from the bundle topbar (Peter, 14 Sep) */
@media(min-width:761px) and (max-width:1159px){
  #lrtopbar { position:fixed; top:0; left:0; right:0; height:var(--lrw-navh,70px); z-index:900; display:flex; align-items:center; padding-left:calc(215px + max(0px, calc(clamp(20px,4.4vw,80px) - 24px))); padding-right:64px; }
  #lrtopbar > * { flex:1 1 auto; min-width:0; }
  #lrtopbar .util { box-sizing:border-box; width:100%; max-width:none; margin:0; padding:0; gap:14px; flex-wrap:nowrap; display:flex; align-items:center; }
  #lrtopbar .util nav { order:0; flex:1 1 auto; min-width:0; margin-top:0; transform:none; gap:12px; justify-content:flex-start; overflow-x:auto; scrollbar-width:none; -webkit-mask-image:linear-gradient(90deg,#000 calc(100% - 26px),transparent); mask-image:linear-gradient(90deg,#000 calc(100% - 26px),transparent); }
  #lrtopbar .util nav::-webkit-scrollbar { display:none; }
  #lrtopbar .util nav a { flex:0 0 auto; }
  #lrtopbar .util .right { order:1; flex:0 0 auto; gap:10px; margin-left:0; }
  /* search keeps its full 'SEARCH ARCHIVE' width (lr-bar-fit); the nav is the part that scrolls */
  /* the Webflow navbar's cream plane sits above the bar (z 1000 over 900): as at 1160 and up it
     keeps only its two real controls and lets the bar paint through */
  .navbar_component { pointer-events:none; background:transparent !important;
    backdrop-filter:none !important; -webkit-backdrop-filter:none !important; }
  .navbar_component .menu-button, .navbar_component .side-menu_component,
  .navbar_component .side-menu_component *, .navbar_component .close-button { pointer-events:auto; }
  .navbar_component .w-nav-brand { pointer-events:none; }
  .navbar_component .w-nav-brand img { pointer-events:auto; }
}
/* lr-bar-fit, mirrored from the bundle topbar (Peter, 12 Sep 2026): the roll label on two
   lines even with the die, and a search that always reads "SEARCH ARCHIVE" in full. */
#lrtopbar .die-btn { gap:9px; }
#lrtopbar .die-lbl { display:block; white-space:normal; font-size:10px; line-height:13px; letter-spacing:.13em; }
@media(min-width:761px){
  #lrtopbar .tb-search { width:126px; }
  #lrtopbar .tb-search:focus-within { width:196px; }
  #lrtopbar .tb-search input { font-family:'Rules',Arial,sans-serif; font-style:normal; font-weight:500;
    font-size:10.5px; letter-spacing:.1em; text-transform:uppercase; text-overflow:clip; }
  #lrtopbar .tb-search input::placeholder { opacity:.62; }
}

/* 19 Sep 2026 — the article bar MUST match the editorials bar, measured on the live pages rather
   than argued from the rules: at 1440 and at 1280 the editorials nav CENTRES its links with a 9px
   gap and the bar runs at 19px, while this bar was flush left at 18px with an 18px gap, which is
   what Peter kept seeing as "aligned to the left". Last in the file, so these win over every
   earlier rule; below 1160 both bars scroll their nav from the left and are left alone. */
@media(min-width:1160px){
  #lrtopbar { font-size:19px; }
  /* the bundle sets gap:10px from 1160 and narrows it to 9px only below 1440; mirrored exactly,
     because a single unscoped 9px made the two bars disagree above 1440 (audit, 20 Sep) */
  #lrtopbar .util nav { justify-content:center; gap:10px; }
  #lrtopbar .util .right { gap:10px; }
}
@media(min-width:1160px) and (max-width:1440px){ #lrtopbar .util nav { gap:9px; } }

/* 20 Sep 2026, found by publish_gate.js on its first run: at 1440, 1280 and 1160 the two bars are
   identical to the pixel, but below 761 they were two different headers. The editorials bar wraps
   its nav onto a second row (order 2, full width, 8px down) and reads its search in 16px Rules; this
   bar kept everything on one row in 13px Garamond italic and stood 54px tall against the other's 85.
   Mirrored from the bundle below, last in the file so it wins. The gate now compares both bars at
   1440/1280/1160/760/390 on every publish, which is what stops this drifting again.

   The three unscoped rules first: the bar's own type size (the editorials bar inherits 19px from
   #lrw; this one sits outside every wrapper and so has to say it) and the search field's typeface,
   which the bundle sets unscoped and overrides at 761 and up — the same shape is kept here. */
#lrtopbar { font-size:19px; }
@media(max-width:760px){
  /* 21 Sep 2026 (Peter): one row on phones — the die and its label sit on the nav's row at the
     right edge and the nav scrolls sideways behind a fade, so the second row is gone. This is the
     bundle's lr-bar-onerow block (apply_bar_onerow.py), rule for rule. No backticks in this file:
     the CSS ships inside a JS template literal and one backtick ends it mid-sheet. */
  #lrtopbar .util { flex-wrap:nowrap; gap:14px; align-items:center; }
  #lrtopbar .util nav { order:0; flex:1 1 auto; min-width:0; margin-top:0; transform:none; gap:12px;
    justify-content:flex-start; overflow-x:auto; scrollbar-width:none; -ms-overflow-style:none;
    -webkit-mask-image:linear-gradient(90deg,#000 calc(100% - 26px),transparent);
    mask-image:linear-gradient(90deg,#000 calc(100% - 26px),transparent); }
  #lrtopbar .util nav::-webkit-scrollbar { display:none; }
/* lr-rails-x (29 Sep 2026): the rail scrolls sideways only (the phone freeze) */
#lrtopbar .util nav { overflow-y:hidden; overscroll-behavior-x:contain; touch-action:pan-x pan-y; }
  #lrtopbar .util nav a { flex:0 0 auto; }
  #lrtopbar .util .right { order:1; flex:0 0 auto; margin-left:0; gap:10px; }
  /* the winning width on the editorials bar at this size is #lrw .topbar .tb-search{width:96px};
     every narrower rule here loses to it there, so 96 is the number to match */
  #lrtopbar .tb-search { width:96px; }
  #lrtopbar .tb-search input { font-style:normal; font-family:'Rules',Arial,sans-serif; font-size:16px;
    font-weight:400; letter-spacing:.02em; text-transform:none; text-overflow:ellipsis; }
  #lrtopbar .tb-search input::placeholder { opacity:.72; }
}

@media (min-width:992px) {
  .blog-post5-header_title-wrapper-2 { max-height:calc(100vh - 96px); overflow-y:auto; overflow-x:hidden;
    overscroll-behavior:contain; scrollbar-width:thin; scrollbar-color:rgba(1,16,21,.28) transparent; }
  .blog-post5-header_title-wrapper-2::-webkit-scrollbar { width:6px; }
  .blog-post5-header_title-wrapper-2::-webkit-scrollbar-thumb { background:rgba(1,16,21,.28); border-radius:3px; }
}

.text-garamond.w-richtext figure img.lrlb-on { cursor:zoom-in; }
.lrlb { position:fixed; inset:0; z-index:9999; background:rgba(1,16,21,.96); display:none; flex-direction:column; align-items:center; justify-content:center; color:#EFE9D8; }
.lrlb.on { display:flex; }
.lrlb img { max-width:calc(100vw - 140px); max-height:calc(100vh - 170px); width:auto; height:auto; object-fit:contain; box-shadow:0 20px 60px rgba(0,0,0,.4); }
.lrlb figcaption { max-width:min(900px, calc(100vw - 48px)); margin-top:16px; text-align:center; font:400 14px/1.45 'Rules',Arial,sans-serif; color:rgba(239,233,216,.85); }
.lrlb .lrlb-n { position:absolute; top:22px; left:24px; font:500 12px/1 'Rules',Arial,sans-serif; letter-spacing:.13em; text-transform:uppercase; color:rgba(239,233,216,.7); }
.lrlb button { position:absolute; background:transparent; border:1px solid rgba(239,233,216,.35); color:#EFE9D8; width:46px; height:46px; border-radius:50%;
  font:400 20px/1 'Rules',Arial,sans-serif; cursor:pointer; }
.lrlb button:hover { border-color:#EFE9D8; }
.lrlb .lrlb-x { top:14px; right:18px; }
.lrlb .lrlb-p { left:24px; top:50%; margin-top:-23px; }
.lrlb .lrlb-q { right:24px; top:50%; margin-top:-23px; }
@media (max-width:700px) { .lrlb img { max-width:calc(100vw - 24px); max-height:calc(100vh - 190px); } .lrlb .lrlb-p, .lrlb .lrlb-q { top:auto; bottom:22px; margin:0; } }
html.lrlb-lock, html.lrlb-lock body { overflow:hidden; }

/* ---------- lr-props (5 Oct 2026, Peter: navbar B): Le Random's three sites beside the logo, then the tabs of the
   site you are on. The current site is underlined in orange; colours come from the bar's own text so dark mode follows. */
#lrtopbar .util { gap:14px; }
#lrtopbar .tb-props { display:flex; align-items:center; gap:12px; flex:0 0 auto; min-width:0; margin:0; padding:0 14px 0 0;
  border-right:1px solid color-mix(in srgb, currentColor 32%, transparent); line-height:1; }
#lrtopbar .tb-props a { font-family:'Rules',Arial,sans-serif; font-size:10.5px; font-weight:500; letter-spacing:.1em;
  text-transform:uppercase; white-space:nowrap; color:inherit; opacity:.5; padding:0 0 2px; border-bottom:1px solid transparent;
  transition:opacity .15s ease; }
#lrtopbar .tb-props a:hover { opacity:1; }
#lrtopbar .tb-props a.on { opacity:1; border-bottom-color:#FF4C00; }
@media(max-width:760px){
  #lrtopbar .tb-props { gap:10px; padding-right:10px; }
  #lrtopbar .tb-props a { font-size:10px; letter-spacing:.08em; }
}

/* lr-props: the site names share the tabs' baseline; on phones the tabs take their own row under the switcher */
@media(min-width:1160px){ #lrtopbar .tb-props { transform:translateY(3px); } }
@media(max-width:600px){
  #lrtopbar .util { flex-wrap:wrap !important; row-gap:6px; }
  #lrtopbar .tb-props { order:0; flex:1 1 100%; border-right:0; padding:2px 0 0; }
  #lrtopbar .util nav { order:1 !important; flex:1 1 0 !important; min-width:0 !important; margin-top:0 !important; }
  #lrtopbar .util .right { flex:0 0 auto !important; }
  #lrtopbar .util .right { order:2; }
}

/* lr-navprops (6 Oct 2026, Peter): on phones the site switcher sits in the navbar under the logo, as on the Timeline,
   and the bar below keeps one row. The links copy the bar's switcher, so the current site stays underlined. */
.lr-navprops { display:none; }
@media(max-width:600px){
  html.lr-navprops-on .navbar_component .mobile-logo { transform:translateY(-7px); }
  .lr-navprops { display:flex; position:absolute; z-index:2; align-items:center; gap:14px; margin:0; padding:0; line-height:1; }
  .lr-navprops a { font-family:'Rules',Arial,sans-serif; font-size:10px; font-weight:500; letter-spacing:.1em;
    text-transform:uppercase; white-space:nowrap; color:inherit; text-decoration:none; opacity:.55; padding:0 0 2px;
    border-bottom:1px solid transparent; }
  .lr-navprops a.on { opacity:1; border-bottom-color:#FF4C00; }
  html.lr-navprops-on #topbar .tb-props, html.lr-navprops-on #lrtopbar .tb-props { display:none !important; }
}
`;document.head.appendChild(st);var TOPBAR = "<header class=\"topbar\" id=\"lrtopbar\"><span class=\"tb-prog\" aria-hidden=\"true\"></span> <div class=\"wrap util\"> <div class=\"tb-props\" role=\"navigation\" aria-label=\"Le Random\"><a href=\"/editorials\" class=\"on\" aria-current=\"page\">Editorials</a><a href=\"/podcast\">Podcast</a><a href=\"https://timeline.lerandom.art\">Timeline</a></div> <nav> <a href=\"/editorials#latest\">Latest</a> <a href=\"/editorials#calendar\">Calendar</a> <a href=\"/editorials#interviews\">Interviews</a> <a href=\"/editorials#register\">Archive</a> <a href=\"/editorials#subjects\">Subjects</a> <a href=\"/editorials#contributors\">Contributors</a> </nav> <div class=\"right\"> <label class=\"tb-search\"><input id=\"lrtb-q\" type=\"search\" placeholder=\"Search archive\" aria-label=\"Search the archive: editorials and episodes\"></label> <a class=\"die-btn js-die\" href=\"/editorials\" target=\"_blank\" rel=\"noopener\" aria-label=\"Open a random editorial\"><span class=\"die-wrap\"><svg class=\"die-svg\" width=\"26\" height=\"26\" viewBox=\"0 0 44 44\" aria-hidden=\"true\"> <rect class=\"die-body\" x=\"1\" y=\"1\" width=\"42\" height=\"42\" rx=\"9\"/> <g class=\"die-face\" data-f=\"1\"><circle class=\"die-pip\" cx=\"22\" cy=\"22\" r=\"4\"/></g> <g class=\"die-face\" data-f=\"2\"><circle class=\"die-pip\" cx=\"13\" cy=\"13\" r=\"4\"/><circle class=\"die-pip\" cx=\"31\" cy=\"31\" r=\"4\"/></g> <g class=\"die-face\" data-f=\"3\"><circle class=\"die-pip\" cx=\"12\" cy=\"12\" r=\"3.7\"/><circle class=\"die-pip\" cx=\"22\" cy=\"22\" r=\"3.7\"/><circle class=\"die-pip\" cx=\"32\" cy=\"32\" r=\"3.7\"/></g> <g class=\"die-face\" data-f=\"4\"><circle class=\"die-pip\" cx=\"13\" cy=\"13\" r=\"3.7\"/><circle class=\"die-pip\" cx=\"31\" cy=\"13\" r=\"3.7\"/><circle class=\"die-pip\" cx=\"13\" cy=\"31\" r=\"3.7\"/><circle class=\"die-pip\" cx=\"31\" cy=\"31\" r=\"3.7\"/></g> <g class=\"die-face is-on\" data-f=\"5\"><circle class=\"die-pip\" cx=\"13\" cy=\"13\" r=\"3.5\"/><circle class=\"die-pip\" cx=\"31\" cy=\"13\" r=\"3.5\"/><circle class=\"die-pip\" cx=\"22\" cy=\"22\" r=\"3.5\"/><circle class=\"die-pip\" cx=\"13\" cy=\"31\" r=\"3.5\"/><circle class=\"die-pip\" cx=\"31\" cy=\"31\" r=\"3.5\"/></g> <g class=\"die-face\" data-f=\"6\"><circle class=\"die-pip\" cx=\"13\" cy=\"11\" r=\"3.4\"/><circle class=\"die-pip\" cx=\"31\" cy=\"11\" r=\"3.4\"/><circle class=\"die-pip\" cx=\"13\" cy=\"22\" r=\"3.4\"/><circle class=\"die-pip\" cx=\"31\" cy=\"22\" r=\"3.4\"/><circle class=\"die-pip\" cx=\"13\" cy=\"33\" r=\"3.4\"/><circle class=\"die-pip\" cx=\"31\" cy=\"33\" r=\"3.4\"/></g> </svg><span class=\"die-shadow\"></span></span><span class=\"die-lbl\">Roll for<br>editorial</span></a> </div> </div> </header>";
var AUDIO = {"a-a-murakami-on-existence-as-medium":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/152.m4a?v=fe3cc30f",870],"a-mean-defense":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/083.m4a?v=f1ed3cf4",750],"a-michael-noll-on-when-it-all-started":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/078.m4a?v=d523559b",1035],"aa-cavia-on-summoning-worlds":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/104.m4a?v=7a70e426",933],"aaron-hertzmann-on-caring-about-people":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/131.m4a?v=e793562d",958],"agh-on-glorifying-the-computer":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/024.m4a?v=8b14fadb",1073],"agnieszka-kurant-on-alien-thoughts":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/155.m4a?v=6bd52977",872],"ana-maria-caballeros-paperwork":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/020.m4a?v=f13369fb",149],"analivia-cordeiro-on-perpetual-motion":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/053.m4a?v=19ea824d",826],"artificial-and-human-intelligence":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/048.m4a?v=27bcda62",594],"avery-singer-on-the-dopamine-blowout":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/136.m4a?v=390bb2da",987],"barbara-london-on-new-territory":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/074.m4a?v=ee1ae7c4",1560],"beeple-on-infinite-creation-machines":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/087.m4a?v=12a918f2",1369],"beeple-on-robot-dogs-as-canvas":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/112.m4a?v=9bccd5f8",929],"bright-moments-on-prioritizing-the-personal":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/041.m4a?v=433febe1",1188],"can-art-replace-religion":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/055.m4a?v=ef8e79e5",1175],"casey-reas-lauren-lee-mccarthy-chandler-mcwilliams-on-expanding-software":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/058.m4a?v=0a441255",814],"casey-reas-on-the-history-of-generative-art-part-2":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/003.m4a?v=569efab0",863],"christiane-paul-on-curating-cohens-aaron":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/029.m4a?v=37f6c4b8",1343],"christiane-paul-on-defining-ai-art":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/079.m4a?v=9a6f66c3",1026],"claudia-hart-on-land-of-the-dead":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/105.m4a?v=946e194b",646],"cognitive-technologies":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/094.m4a?v=a8d3a1aa",539],"colette-bangert-on-growing-visually":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/044.m4a?v=def40c17",546],"commentary-by-mark-wilson":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/036.m4a?v=b1705d1b",356],"concrete-to-generative-real-space-explorations-in-south-america":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/019.m4a?v=56429921",567],"copper-giloth-on-video-games-to-video-art":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/100.m4a?v=6cbe0f56",737],"deafbeef-on-impermanence":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/013.m4a?v=23a9df2a",1029],"deafbeef-on-vernacular-in-a-standardized-age":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/090.m4a?v=223754b9",536],"decoupling-generative-art-with-philip-galanter":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/009.m4a?v=a47d8776",657],"demystifying-generative-aesthetics":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/037.m4a?v=5feeea93",1612],"demystifying-generative-art":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/005.m4a?v=a0d185b3",1241],"demystifying-generative-autonomy":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/070.m4a?v=d52660e6",1463],"demystifying-generative-systems":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/049.m4a?v=135647ab",1471],"dmitri-cherniak-on-strictly-for-art":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/084.m4a?v=7392b913",1090],"drifella-iii-room-for-complexity":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/102.m4a?v=4bb512de",1516],"dx-research-group-on-the-agent-arena":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/124.m4a?v=058a17dd",1346],"ed-fornieles-on-art-as-human-sacrifice":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/132.m4a?v=20cb0752",529],"eli-scheinman-on-amplifying-the-digital":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/111.m4a?v=87445d61",667],"embodying-ai-at-neurips-2025-creative-ai-track":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/117.m4a?v=717cbfcd",1091],"emily-xie-on-textile-as-personal-canvas":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/038.m4a?v=78670986",1064],"eva-and-franco-mattes-on-mega-eliza":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/146.m4a?v=e85938f8",542],"evil-biscuit-on-card-nft-2-destruction-rebirth":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/139.m4a?v=6d3e67a1",1151],"feels-like-home-a-curatorial-statement":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/002.m4a?v=bc88a5c5",189],"frieder-nake-on-machinic-miracles":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/052.m4a?v=7c9e6cce",1063],"gendering-systems":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/057.m4a?v=09b337ea",754],"generations-of-verse":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/004.m4a?v=3dad388e",651],"golan-levin-on-the-potentiality-of-blobs":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/026.m4a?v=6b684908",1355],"gottfried-jager-on-a-new-kind-of-being":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/125.m4a?v=4535e03a",774],"hans-ulrich-obrist-on-exhibitions-as-living-organisms":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/097.m4a?v=9ccc2e36",848],"hito-steyerl-on-how-it-uses-us":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/091.m4a?v=14363856",442],"holly-herndon-mat-dryhurst-on-artificial-psychedelia":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/110.m4a?v=1b174624",1215],"ian-cheng-on-composing-with-systems":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/118.m4a?v=c9de265c",836],"ian-goodfellow-on-inventing-gans":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/107.m4a?v=7d517fcc",1420],"illuminating-marfa":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/017.m4a?v=9bf1b13d",542],"infinite-images-finite-control":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/092.m4a?v=07b3d868",783],"inside-qubibis-shinjuku-studio":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/071.m4a?v=c530840d",1800],"jakob-kudsk-steensen-on-non-human-pathways":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/137.m4a?v=f01ae35f",1102],"jane-veeder-on-loving-change":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/133.m4a?v=1be7769a",991],"jared-madere-and-fairybaby-on-vvv-and-the-world-as-material":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/149.m4a?v=be91a10d",1333],"jason-bailey-georg-bak-kate-vass-on-the-art-form-of-our-generation":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/046.m4a?v=d3aa81a6",896],"jen-lowe-and-patricio-gonzalez-vivo-on-democratizing-knowledge":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/045.m4a?v=4cf40cd0",831],"jess-tucker-on-longing-for-a-face":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/108.m4a?v=b86b411b",819],"joan-heemskerk-on-quantum-web4":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/059.m4a?v=34461618",1184],"john-gerrard-on-ecology-technology-power":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/140.m4a?v=27f941f5",906],"john-maeda-on-computational-evolution":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/054.m4a?v=1d713188",652],"john-provencher-and-raster-on-generative-identity":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/154.m4a?v=5e38a005",589],"juan-rodriguez-garcia-on-inhabiting-the-moment":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/096.m4a?v=71047c2e",616],"julia-kaganskiy-on-generativitys-deeper-consideration":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/088.m4a?v=5ae02de6",989],"justin-aversano-on-heart-and-light":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/144.m4a?v=9c0ab237",662],"karl-sims-alexander-mordvintsev-on-merging-technology-and-biology":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/109.m4a?v=51791278",1085],"kate-vass-on-rethinking-art-collecting":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/008.m4a?v=e854495d",795],"keiken-on-the-worldbuilding-lens":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/130.m4a?v=be4a55bf",846],"kevin-mccoy-on-bridging-net-art-and-blockchain":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/043.m4a?v=c551a4a4",993],"kim-asendorf-on-breaking-his-own-rules":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/126.m4a?v=e29fe45a",912],"kim-asendorf-on-elegant-symbiosis":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/073.m4a?v=81966161",1149],"kyle-mcdonald-on-computer-softness":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/129.m4a?v=69a96877",1123],"larry-cuba-on-choreographing-form":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/051.m4a?v=e003b466",1209],"larva-labs-on-computations-strangeness":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/101.m4a?v=56e8d2ab",989],"lauren-lee-mccarthy-on-software-values":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/030.m4a?v=1b3a09e7",987],"lawrence-lek-on-ai-reinventing-place":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/069.m4a?v=e6ce2136",1622],"le-random-an-origin-story":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/000.m4a?v=22075f3e",516],"let-the-barbarians-in":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/142.m4a?v=d15468a4",676],"linda-dounia-on-memory-machines":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/031.m4a?v=e0a06c58",1010],"living-aesthetics-a-grammar-of-protocol-art-and-worldbuilding":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/151.m4a?v=fb4ca6ed",1520],"london-digital-art-guide":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/103.m4a?v=783fc50e",1642],"lowbie-and-duc-de-berry-on-log-and-the-nft-to-zine-pipeline":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/153.m4a?v=a111eb3f",736],"lu-yang-on-art-as-the-perfect-cloak":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/121.m4a?v=7bb3b9a3",1530],"machine-reverie":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/032.m4a?v=fd959402",730],"machinic-taste":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/143.m4a?v=8d6163ef",337],"marina-abramovic-on-new-possibilities":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/085.m4a?v=fffcb4bd",356],"mario-klingemann-a-i-c-c-a-on-alien-perspective":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/076.m4a?v=63940dce",1723],"marlene-wenger-on-bringing-magic-back":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/148.m4a?v=d5118ff6",686],"mat-dryhurst-on-becoming-infinite":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/064.m4a?v=a4794f71",1032],"matt-deslauriers-on-a-generative-world":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/067.m4a?v=6d4712f6",1384],"matt-deslauriers-on-challenging-the-image":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/040.m4a?v=2a8d6843",924],"matt-hall-and-john-watkinson-on-beginning-a-movement":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/061.m4a?v=c9d3f9b0",1360],"maya-lin-on-systematic-naturalism":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/027.m4a?v=1b711628",686],"maya-man-on-generative-meaning":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/012.m4a?v=25c7b560",884],"meandering-with-ai":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/080.m4a?v=15659ee3",508],"memo-akten-on-rituals-as-algorithms":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/145.m4a?v=216d892c",1148],"michael-kozlowski-on-exploration-as-practice":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/042.m4a?v=925b6ec8",664],"micky-malka-becky-kleiner-on-the-birth-of-node":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/119.m4a?v=aa79304c",1230],"mika-ben-amar-brennan-wojtyla-on":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/113.m4a?v=11e6ef2a",1000],"minne-atairu-on-shaping-our-own-image":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/095.m4a?v=c65106c2",1034],"molnars-paris":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/033.m4a?v=19697353",441],"mona-lisa-to-monogrid":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/034.m4a?v=ba2b3d8d",863],"neural-unconscious":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/075.m4a?v=163a0c08",679],"new-histories-previewing-autumn-2026-in-art-and-technology":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/156.m4a?v=ca918a57",843],"new-york-city-digital-art-guide":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/081.m4a?v=d4fa7ec8",1429],"node-fast-art-slow-looking":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/120.m4a?v=14eb9d1f",799],"object-misrecognition":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/082.m4a?v=73c24339",616],"on-craft-art-programming":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/015.m4a?v=3d037c95",449],"operator-human-unreadable":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/022.m4a?v=7afc3d5e",1143],"operator-profiles-rebecca-allen":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/056.m4a?v=5d8b1d06",1406],"parker-ito-and-evil-biscuit-on-possessed-spirits":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/106.m4a?v=c8d15fcb",630],"post-generative-language-games":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/123.m4a?v=0b2dc5c0",664],"post-human--ai-art":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/093.m4a?v=f64f2799",988],"rafael-rozendaal-on-a-liquid-canvas":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/072.m4a?v=f1754288",1449],"reas-history-1":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/001.m4a?v=dd35417f",556],"reprogramming-sensory-habits":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/086.m4a?v=7110d137",1029],"rhea-myers-on-code-as-cultural-material":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/014.m4a?v=54ad0a6a",505],"robbie-fitzpatrick-on-basel-social-club-welcoming-the-barbarians":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/150.m4a?v=73456253",1050],"ryan-murdock-on-hacking-ai":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/157.m4a?v=1f129a33",990],"samia-halaby-on-different-brushes":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/065.m4a?v=1d76b903",494],"sarah-meyohas-on-irreducibly-human":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/089.m4a?v=e114f9d2",471],"sasha-stiles-and-martha-joseph-on-language-as-technology":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/098.m4a?v=47fe79e1",1248],"sasha-stiles-on-writing-poets":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/028.m4a?v=71ff9db0",1085],"seams-and-synthesis-schizocollage-and-ai-aesthetics":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/122.m4a?v=4c64767f",781],"seeing-machines-luba-elliott-on-the-2026-cvpr-art-gallery":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/138.m4a?v=c5c61c11",1623],"shohei-fujimoto-on-remembering-space":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/134.m4a?v=d8657ef8",775],"simon-denny-on-society-technology-and-art":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/060.m4a?v=cb76cf9a",957],"snowfro-and-ciphrd-on-a-symbiotic-relationship":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/023.m4a?v=ec9cdd80",1773],"sougwen-chung-on-aggregated-abandon":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/128.m4a?v=ef72c5f4",474],"sougwen-chung-on-us-in-another-form":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/016.m4a?v=bfa0a892",524],"sputniko-on-activism-multitasking":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/066.m4a?v=abde5e07",1206],"standout-artwork-of-2025":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/114.m4a?v=7df1bba5",753],"suzanne-treister-on-critical-futurism":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/068.m4a?v=3a1157ab",849],"ten-moments-in-south-american-generative-art-history":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/021.m4a?v=57385407",589],"the-algorithmic-gaze-representations-of-women-in-ai-art":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/047.m4a?v=22945dae",727],"the-cerebral-samba-protocol-art-worldbuilding-our-two-brains":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/135.m4a?v=2d225e47",660],"the-evolving-platform-ecosystem":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/006.m4a?v=f90ac62f",554],"the-memoir-of-a-net-art-memoir":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/039.m4a?v=0735cf7e",1370],"the-people-are-in-the-computer--part-i":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/077.m4a?v=ee82bcf9",1707],"the-ultraintelligent-machine-and-gaberbocchus-common-room":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/099.m4a?v=6c4a60ac",354],"the-zach-lieberman-commission-2":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/010.m4a?v=c723b8fe",654],"then-and-now":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/050.m4a?v=089115b2",313],"thoma-foundation-on-collecting-curiosity-conversation":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/141.m4a?v=2efe4217",677],"timeline-chapter-1-ten-top-moments":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/011.m4a?v=0fc0272c",774],"travess-smalley-profiles-mark-wilson":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/035.m4a?v=e912bffa",1722],"trevor-paglen-trevor-paglen-on-technological-points-of-view":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/062.m4a?v=9bfce2ba",568],"tyler-hobbs-on-algorithmic-aesthetics":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/025.m4a?v=9546a752",1282],"val-ravaglia-on-electric-dreams":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/063.m4a?v=631f087b",1351],"wendi-yan-karyn-nakamura-on-the-artifice-of-knowledge":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/127.m4a?v=8cdec63d",1062],"what-was-the-ai-psychosis-summit":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/147.m4a?v=75d13b09",1026,"Narrated by the author | AI generated intro"],"william-mapan-on-breaking-the-medium":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/018.m4a?v=bf9a707d",874],"zach-lieberman":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/007.m4a?v=c3a7cf1c",889],"zero-10-part-1-beeple-casts-a-spell":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/115.m4a?v=835f9117",517],"zero-10-part-2-fair-transparency":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/116.m4a?v=63aca3a0",524]};

  /* the editorials header, carried onto the article pages */
  (function(){
    /* lr-bar-baked (6 Oct 2026, Peter: the header "native to webflow"): a template that bakes the bar keeps it; this only
       binds it. Pages without one still get it built here. */
    var bakedBar = document.getElementById('lrtopbar');
    if (bakedBar && bakedBar.__lrBar) return;
    var host = document.querySelector('.navbar_component');
    var bar = bakedBar;
    if (!bar) { bar = document.createElement('div'); bar.innerHTML = TOPBAR; bar = bar.firstElementChild; }
    bar.__lrBar = 1;
    /* lr-props: on /podcast and the episode pages the current site is Podcast and the tabs are its sections */
    (function(){
      var pth = location.pathname.replace(/\/+$/, '');
      if (!/^\/(podcast|episodes)(\/|$)/.test(pth)) return;
      var base = pth === '/podcast' ? '' : '/podcast';
      [].forEach.call(bar.querySelectorAll('.tb-props a'), function(a){
        var on = a.textContent === 'Podcast';
        a.classList.toggle('on', on);
        if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
      });
      var nv = bar.querySelector('.util nav');
      if (nv) nv.innerHTML = [['latest', 'Latest'], ['dossiers', 'Sets'], ['history', 'Timeline Talks'], ['register', 'Every episode']]
        .map(function(t){ return '<a href="' + base + '#' + t[0] + '">' + t[1] + '</a>'; }).join(' ');
    })();
    /* lr-subjects-nav (8 Oct 2026, Peter): Subjects is the fourth site, a peer of Editorials, Podcast and Timeline.
       Current on /subjects and /subjects/*; the editorials section tabs drop their own Subjects tab. LIVE (launched with
       /subjects on www, 8 Oct 2026; build_footer_embed.py SUBJECTS_NAV = "live"). */
    (function(){
      if (!(true)) return;   /* LIVE since the /subjects launch, 8 Oct 2026 */
      var props = bar.querySelector('.tb-props'); if (!props) return;
      var dup = bar.querySelector('.util nav a[href$="#subjects"]'); if (dup) dup.remove();
      var sub = /^\/subjects(\/|$)/.test(location.pathname);
      [props, document.querySelector('.lr-navprops-baked')].forEach(function(box){   /* + the phone switcher a template bakes */
        if (!box) return;
        var t = box.querySelector('a[href="/subjects"]');
        if (!t) { t = document.createElement('a'); t.href = '/subjects'; t.textContent = 'Subjects'; box.appendChild(t); }
        if (sub) [].forEach.call(box.querySelectorAll('a'), function(a){
          var on = a === t; a.classList.toggle('on', on);
          if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
        });
      });
    })();
    document.documentElement.classList.add('lr-bar');   /* lr-reserve: releases the head embed's toolbar space */
    if (!bakedBar) {
      if (host && host.parentNode) host.parentNode.insertBefore(bar, host.nextSibling);
      else document.body.insertBefore(bar, document.body.firstChild);
    }
    var nav = document.querySelector('.navbar_component');
    function navh(){
      if (nav && getComputedStyle(nav).position === 'fixed')
        document.documentElement.style.setProperty('--lrw-navh', nav.getBoundingClientRect().height + 'px');
    }
    navh(); addEventListener('resize', navh, {passive:true});

    /* lr-navprops: copy the bar's site switcher into the navbar under the logo (shown on phones only, see CSS) */
    (function(){
      function place(c, logo){
        var op = c.offsetParent; if (!op) return;
        var r = logo.getBoundingClientRect(), o = op.getBoundingClientRect();
        c.style.left = (r.left - o.left) + 'px'; c.style.top = (r.bottom - o.top + 7) + 'px';
      }
      function mount(){
        var bar = document.querySelector('#topbar,#lrtopbar'), src = bar && bar.querySelector('.tb-props');
        var nav = document.querySelector('.navbar_component'), logo = nav && nav.querySelector('.mobile-logo');
        if (!src || !logo) return false;
        if (nav.querySelector('.lr-navprops')) return true;
        var c = document.querySelector('.lr-navprops-baked');   /* the native /editorials page bakes one for first paint: adopt it */
        if (c) c.classList.remove('lr-navprops-baked'); else { c = src.cloneNode(true); c.className = 'lr-navprops'; }
        logo.parentNode.insertBefore(c, logo.nextSibling);
        document.documentElement.classList.add('lr-navprops-on');
        var go = function(){ place(c, logo); };
        go(); requestAnimationFrame(go); addEventListener('resize', go, {passive:true});
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
        return true;
      }
      if (!mount()) { var n = 0, t = setInterval(function(){ if (mount() || ++n > 60) clearInterval(t); }, 250); }
    })();
    var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
    /* sticky bar: show its rule only after scrolling, exactly as on the editorials page */
    (function(){
      /* lr-prog: the rule doubles as the article's reading-progress bar (see TOPBAR_CSS).
         0 while the bar's bottom edge is above the article text, 1 when it reaches the
         text's bottom. Both rects are read before any write, so it costs one layout per
         frame; the body is re-measured on viewport resize and whenever it changes size. */
      /* 29 Sep 2026 (Peter): the episode pages (/episodes/) get the same reading bar, over the transcript */
      var lrBody = document.querySelector('.text-garamond.w-richtext') || document.querySelector('.text-garamond') || document.querySelector('.ep-tr');
      var lrFill = bar.querySelector('.tb-prog');
      if (lrBody && lrFill) bar.classList.add('lr-prog');
      function lrProg(){
        if (!lrBody || !lrFill) return;
        var r = lrBody.getBoundingClientRect(), b = bar.getBoundingClientRect().bottom;
        var p = r.height > 0 ? (b - r.top) / r.height : 0;
        lrFill.style.transform = 'scaleX(' + (p < 0 ? 0 : p > 1 ? 1 : p) + ')';
      }
      function lrRefresh(){ if (!tick) { tick = true; requestAnimationFrame(upd); } }
      addEventListener('resize', lrRefresh, {passive:true});
      if (lrBody && window.ResizeObserver) new ResizeObserver(lrRefresh).observe(lrBody);
      var tick = false;
      function upd(){ lrProg(); bar.classList.toggle('stuck', window.scrollY > 6); tick = false; }
      addEventListener('scroll', function(){
        if (!tick) { tick = true; requestAnimationFrame(upd); }
      }, {passive:true});
      upd();
    })();
    /* the nav scroller starts at Latest, never mid-list */
    (function(){ var n = bar.querySelector('nav'); if (n) n.scrollLeft = 0; })();
    /* the site's own side menu: Webflow's close interaction does not fire on these pages, so close it ourselves */
    (function(){
      var sm = document.querySelector('.side-menu_component'); if (!sm) return;
      function isOpen(){ return getComputedStyle(sm).display !== 'none' && getComputedStyle(sm).opacity !== '0'; }
      function close(){ sm.style.display = 'none'; sm.style.opacity = '0'; }
      var cb = document.querySelector('.close-button'); if (cb) cb.addEventListener('click', function(){ setTimeout(function(){ if (isOpen()) close(); }, 450); });
      document.addEventListener('click', function(e){
        if (!isOpen()) return;
        if (sm.contains(e.target) || (e.target.closest && e.target.closest('.menu-button'))) return;
        close();
      }, true);
      document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && isOpen()) close(); });
      var mb = document.querySelector('.menu-button'); if (mb) mb.addEventListener('click', function(){ if (sm.style.display === 'none') { sm.style.display = ''; sm.style.opacity = ''; } });
    })();
    /* the site's footer year: match the credit text beside it at every breakpoint */
    (function(){
      var y = document.querySelector('.footer8_component [data="year"]'), c = document.querySelector('.footer8_component .footer8_credit-text');
      if (!y || !c) return;
      function fit(){ var cs = getComputedStyle(c); y.style.fontSize = cs.fontSize; y.style.lineHeight = cs.lineHeight; y.style.fontFamily = cs.fontFamily; }
      fit(); addEventListener('resize', fit, {passive:true});
    })();
    var back = document.querySelector('a.button.is-link.is-icon');
    document.documentElement.classList.add('lr-back');   /* lr-reserve: the head embed already lifted the button by 30px */
    if (back && back.getAttribute('href') === '/editorials') back.style.marginTop = '30px';
    /* lr-hub-name (22 Sep 2026): the arrow is an icon-only link; it gets the hub's one name as hidden
       link text, so every article points at /editorials with the word "Editorials" */
    if (back && back.getAttribute('href') === '/editorials' && !back.querySelector('.lr-vh')) {
      var vh = document.createElement('span'); vh.className = 'lr-vh'; vh.textContent = 'Editorials';
      vh.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap';
      back.appendChild(vh); back.setAttribute('title', 'Editorials');
    }
    /* the arrow returns the reader to the edition and position they left, like the browser's Back */
    if (back && back.getAttribute('href') === '/editorials') {
      try {
        var lp = JSON.parse(sessionStorage.getItem('lrw-pos') || 'null');
        if (lp && lp.seed && Date.now() - lp.t < 6 * 3600 * 1000) back.setAttribute('href', '/editorials#e=' + lp.seed);
      } catch (e) {}
    }
    /* lr-authors (23 Sep 2026, Peter): Webflow's label above the author cards is a fixed string,
       "About the Author", whatever the template lists beneath it. When two or more people are
       listed it becomes "About the Authors"; written once, only on change (lre-observer rule). */
    try {
      var abox = document.querySelector('.blog-post5-content_contributers');
      if (abox) {
        var alab = null, als = abox.querySelectorAll('.text-size-small');
        for (var ai = 0; ai < als.length; ai++) { if (/^\s*about the author\s*$/i.test(als[ai].textContent)) { alab = als[ai]; break; } }
        var acount = abox.querySelectorAll('.blog-post5-content_author-wrapper [role="listitem"]').length;
        if (alab && acount > 1) alab.textContent = alab.textContent.replace(/author/i, function(m){ return m + 's'; });
      }
    } catch (e) {}
    /* search: the editorials page filters in place, an article page hands the term over */
    var q = document.getElementById('lrtb-q');
    if (q) {
      var go = function(){
        var v = q.value.trim();
        if (v) location.href = '/editorials#q=' + encodeURIComponent(v);
      };
      q.addEventListener('keydown', function(e){
        if (e.key === 'Enter') { go(); q.blur(); }
        if (e.key === 'Escape') { q.value = ''; q.blur(); }
      });
      q.addEventListener('search', go);
    }
    /* the die: an anchor, so the article opens in a new tab natively */
    [].forEach.call(bar.querySelectorAll('.js-die'), function(el){
      var faces = [].slice.call(el.querySelectorAll('.die-face'));
      function face(n){ faces.forEach(function(g,i){ g.classList.toggle('is-on', i === n-1); }); }
      function pick(){ var arts = window.__lrftArts; if (!arts) { el.href = '/editorials'; return; } var keys = Object.keys(arts); if (keys.length) el.href = '/editorial/' + keys[Math.floor(Math.random()*keys.length)]; }
      face(5); pick();
      el.addEventListener('pointerdown', pick);
      el.addEventListener('click', function(){
        if (reduce) return;
        el.classList.remove('rolling'); void el.offsetWidth; el.classList.add('rolling');
        var spin = setInterval(function(){ face(1 + Math.floor(Math.random()*6)); }, 62);
        setTimeout(function(){
          clearInterval(spin);
          face(1 + Math.floor(Math.random()*6));
          el.classList.remove('rolling');
        }, 1150);
      });
    });
  })();


(function () {
  var DATA_URL = (window.LRW_RAW || 'https://raw.githubusercontent.com/monkantony/lr-media/main/') + 'footer_data.txt';
  var GROUPS = [['p','People'],['w','Works'],['x','Exhibitions'],['o','Organisations'],['pl','Places'],['t','Techniques'],['th','Themes']];
  var slug = location.pathname.replace(/\/+$/,'').split('/').pop();
  /* 6 Oct 2026: an episode can share its slug with an editorial (ian-goodfellow-on-inventing-gans); the editorial's footer,
     audio and Article data belong on /editorial/ pages only */
  var isEditorial = /^\/editorial\//.test(location.pathname);
  var box = document.getElementById('lrft');
  /* 6 Oct 2026 (Peter: "all links (for seo's sake correct?) should be a static/webflow html link"): the Editorials
     Template renders the footer itself, from CMS fields, into #lrft[data-static]. When that has content, the footer
     drawn below goes into a detached box and never reaches the page. When the item's footer fields are still empty
     (a new editorial before its footer import), the static block hides and the drawn footer stands in, as before. */
  var lrStatic = document.querySelector('#lrft[data-static]');
  var lrStaticFull = !!(lrStatic && lrStatic.querySelector('.lrft-chip, .lrft-card, .lrft-ln, .lrft-tlrt a'));
  if (lrStatic) {
    if (lrStaticFull) box = document.createElement('div');
    else {
      lrStatic.style.display = 'none';
      box = document.querySelector('#lrft:not([data-static])');
      if (!box) { box = document.createElement('div'); box.id = 'lrft'; lrStatic.parentNode.insertBefore(box, lrStatic.nextSibling); }
    }
  }
  /* the player first, from the map inside this file: no wait for the footer data */
  /* 29 Sep 2026 (Peter): an episode page (/episodes/) plays its episode at the top, with the same player.
     The page's Code Embed carries <div id="ep-player" data-audio data-min>; the player sits in it. */
  try {
    var epP = document.getElementById('ep-player');
    if (epP && epP.getAttribute('data-audio')) player(epP.getAttribute('data-audio'), (parseFloat(epP.getAttribute('data-min')) || 0) * 60,
      ((document.querySelector('h1') || {}).textContent || '').replace(/\s+/g, ' ').trim(), null, epP, 'Listen to this episode');
  } catch (e) {}
  try { if (isEditorial && typeof AUDIO !== 'undefined' && AUDIO[slug]) player(AUDIO[slug][0], AUDIO[slug][1], ((document.querySelector('h1') || {}).textContent || '').replace(/\s+/g, ' ').trim(), AUDIO[slug][2]); } catch (e) {}
  /* a piece with no audio edition gets no player: give its reserved space back at once */
  if (!document.getElementById('lrap')) document.documentElement.classList.add('lr-player');
  /* lr-selfplace: the footer belongs directly below the article body. If the Embed was
     dropped above it (or anywhere else), move the whole embed wrapper there before rendering. */
  (function(){
    var b = document.querySelector('.text-garamond.w-richtext') || document.querySelector('.text-garamond');
    if (!box || !b || !b.parentNode || lrStatic) return;        /* the static footer is placed by the template */
    var n = box.parentNode && box.parentNode.classList && box.parentNode.classList.contains('w-embed') ? box.parentNode : box;
    if (n === b || n.contains(b)) return;
    var after = b.nextElementSibling;
    if (after === n) return;                      /* already in place */
    b.parentNode.insertBefore(n, b.nextSibling);
  })();
  /* ---------- alt text (SEO memo, 22 Sep 2026): the CMS ships every body image with alt="". The
     caption under it already says what it is, so the caption becomes the alt; the author photo
     takes the author's name. Nothing visible changes. ---------- */
  (function(){
    var b = document.querySelector('.text-garamond.w-richtext') || document.querySelector('.text-garamond');
    if (b) [].forEach.call(b.querySelectorAll('figure'), function(f){
      var img = f.querySelector('img'), cap = f.querySelector('figcaption');
      if (!img || !cap || (img.getAttribute('alt') || '').trim()) return;
      var t = String(cap.textContent || '').replace(/\s+/g, ' ').trim();
      if (t) img.setAttribute('alt', t.slice(0, 250));
    });
    [].forEach.call(document.querySelectorAll('.blog-post5-content_author-image'), function(img){
      if ((img.getAttribute('alt') || '').trim()) return;
      var w = img.closest('.w-dyn-item') || img.parentElement.parentElement, nm = w && w.querySelector('.text-weight-semibold');
      if (nm && nm.textContent.trim()) img.setAttribute('alt', nm.textContent.replace(/‍/g, '').trim());
    });
  })();
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); }
  function art(s){ return '/editorial/' + s; }
  var SUBJ = '/editorials#subject={n}';
  /* 20 Sep 2026 audit: one un-fallback'd fetch carried the footer, the smart links and the audio
     player. jsDelivr answers 403 for a moment after every fresh commit, and that was enough to lose
     all three; the editorials bundle already retries from raw main, so this does the same. */
  fetch(DATA_URL).then(function(r){ if (!r.ok) throw new Error('http ' + r.status); return r.text(); })
    .catch(function(){
      return fetch('https://raw.githubusercontent.com/monkantony/lr-media/main/footer_data.txt?t='
                   + Math.floor(Date.now() / 60000)).then(function(r){ return r.text(); });
    })
    .then(function(t){
    var data = JSON.parse(t);
    window.__lrftArts = data.arts;          /* the header's die reads this; the header is built before this fetch */
    var me = isEditorial && data.foot[slug]; if (!me) return;
    var A = data.arts, mine = A[slug];
    var bySlugN = {}; for (var s in A) bySlugN[A[s][0]] = s;
    /* the static Next link is a CMS reference: until the newest piece's predecessor gets its Next editorial field,
       it says "the newest". The data knows better, so the link is completed here. */
    if (lrStaticFull && mine) (function(){
      var nx = lrStatic.querySelector('.lrft-pn .nx'), nxt = bySlugN[mine[0] + 1];
      if (!nx || !nxt || nx.getAttribute('href') !== '/editorial/') return;
      nx.setAttribute('href', art(nxt));
      nx.innerHTML = '<span class="lrft-dir">Next &#183; ' + ('000' + A[nxt][0]).slice(-3) + ' &#8594;</span><span class="lrft-t">' + esc(A[nxt][2]) + '</span>';
    })();
    var html = '';
    var grps = '';
    GROUPS.forEach(function(g){
      var names = me.m[g[0]]; if (!names || !names.length) return;
      grps += '<div class="lrft-grp"><b>' + g[1] + '</b><span class="lrft-chips">'
        /* 1 Oct 2026 (Peter: "the links in the subjects section are not linking to the new subjects pages"): every
           chip is a link now. n[1] marked only the subjects that had a page before 30 Sep; the bridge below turns
           each #subject= link into its /subjects/ page (3,355 of them), and one without a page opens its index entry */
        + names.map(function(n){ return '<a class="lrft-chip on" href="/editorials#subject=' + encodeURIComponent(String(n[0]).toLowerCase()) + '">' + esc(n[0]) + '</a>'; }).join('')
        + '</span></div>';
    });
    /* 3 Oct 2026 (Peter: "maximum static html to html links"): the Editorials Template now renders every subject
       featured in or mentioned by the piece into #lrft-ssr (Webflow collection lists, hidden, kept in the HTML), so
       crawlers get real /subjects/ links in the page source. When it is there, the chips ARE those anchors: they move
       into the groups below, grouped by their data-kind, featured first, then A-Z. Without it, the old chips stay. */
    var ssr = document.getElementById('lrft-ssr'), ssrGroups = null;
    if (ssr) {
      var KIND = {Person:'p', Work:'w', Exhibition:'x', Organisation:'o', Place:'pl', Technique:'t', Theme:'th'};
      var lists = [].slice.call(ssr.querySelectorAll('.w-dyn-list')).reverse();      /* featured list sits second */
      var seen = {}; ssrGroups = {};
      lists.forEach(function(l, li){
        var as = [].slice.call(l.querySelectorAll('a[href*="/subjects/"]'));
        if (li > 0) as.sort(function(a, b){ return a.textContent.localeCompare(b.textContent); });
        as.forEach(function(a){
          var h = a.getAttribute('href'); if (seen[h]) return; seen[h] = 1;
          var k = KIND[(a.getAttribute('data-kind') || '').trim()] || 'th';
          (ssrGroups[k] = ssrGroups[k] || []).push(a);
        });
      });
      if (!Object.keys(ssrGroups).length) ssrGroups = null;
      else grps = GROUPS.map(function(g){ return ssrGroups[g[0]] ? '<div class="lrft-grp"><b>' + g[1] + '</b><span class="lrft-chips" data-ssr="' + g[0] + '"></span></div>' : ''; }).join('');
    }
    if (grps) html += '<section class="lrft-zone"><h2 class="lrft-lbl">Mentioned in this editorial</h2>' + grps + '</section>';
    var cards = me.rn.map(function(p){
      var r = A[p[0]]; if (!r) return '';
      var fig = r[5] ? '<figure><img src="' + esc(r[5]) + '" alt="' + esc(r[2]) + '" loading="lazy"></figure>' : '';
      return '<a class="lrft-card" href="' + art(p[0]) + '">' + fig
        + '<span class="lrft-meta"><em>' + ('000' + r[0]).slice(-3) + '</em>' + esc(r[1]) + ' · ' + esc(r[3]) + '</span>'
        + '<h3>' + esc(r[2]) + '</h3><span class="lrft-by">By ' + esc(r[4]) + '</span></a>';   /* 3 Oct 2026 (Peter): no "Shared subjects" line */
    }).join('');
    if (cards) html += '<section class="lrft-zone"><h2 class="lrft-lbl">Read next</h2><div class="lrft-rn">' + cards + '</div></section>';
    var lnRows = (me.ln || []).map(function(l){
      return '<a class="lrft-ln" href="/editorials#pod=' + l[0] + '">'
        + '<span class="ln-no">' + ('0' + l[0]).slice(-2) + '</span>'
        + '<span class="ln-t">' + esc(l[1]) + '</span>'
        + '<span class="ln-badge">Listen</span>'
        + '<span class="ln-len">' + Math.round((l[2] || 0) / 60) + ' min</span></a>';
    }).join('');
    /* 3 Oct 2026: episodes whose "Read next" holds this editorial are rendered into #lrft-ssr by the template (data-n,
       data-min); when present they ARE the Listen next rows (real links in the page source), else the old rows stay.
       At most LN_MAX are shown (Peter, 3 Oct: the Autumn preview sat in 30 episodes' Read next and listed all 30) */
    var LN_MAX = 3;
    var ssrEps = ssr ? [].slice.call(ssr.querySelectorAll('a[href*="/episodes/"]')) : [];
    if (ssrEps.length) lnRows = '<div data-ssr-ln></div>';
    if (lnRows) html += '<section class="lrft-zone"><h2 class="lrft-lbl">Listen next</h2>' + lnRows + '</section>';
    var tlRows = (me.tl || []).map(function(m){
      return '<a class="lrft-ln lrft-tl" href="https://timeline.lerandom.art/' + (m[5] ? 'm/' + m[5] : 'chapter/' + m[3]) + '" target="_blank" rel="noopener">'
        + '<span class="ln-no tl-y">' + esc(m[2]) + '</span>'
        + '<span class="ln-t">' + esc(m[1]) + '</span>'
        + '<span class="ln-badge">Timeline</span></a>';
    }).join('');
    if (tlRows) html += '<section class="lrft-zone"><h2 class="lrft-lbl">From the timeline</h2>' + tlRows + '</section>';
    var prv = bySlugN[mine[0] - 1], nxt = bySlugN[mine[0] + 1];
    html += '<nav class="lrft-pn">'
      + (prv ? '<a href="' + art(prv) + '"><span class="lrft-dir">&#8592; Previous · ' + ('000' + A[prv][0]).slice(-3) + '</span><span class="lrft-t">' + esc(A[prv][2]) + '</span></a>' : '<span></span>')
      + (nxt ? '<a href="' + art(nxt) + '"><span class="lrft-dir">Next · ' + ('000' + A[nxt][0]).slice(-3) + ' &#8594;</span><span class="lrft-t">' + esc(A[nxt][2]) + '</span></a>'
             : '<a href="/editorials"><span class="lrft-dir">Next · the newest</span><span class="lrft-t">You are reading the latest editorial. Browse the archive</span></a>')
      + '</nav>';
    box.innerHTML = html;
    var lnBox = box.querySelector('[data-ssr-ln]');
    if (lnBox) {
      var seenEp = {};
      /* 3 Oct 2026 (Peter: "order relevance"): an episode whose title names a person FEATURED in this piece comes first
         (Kate Vass's own Ch 2 episode on her interview), then by how many mentioned names its title carries */
      var fold = function(t){ return String(t || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); };
      var featNames = [], mentNames = [];
      if (ssr) {
        var wl = [].slice.call(ssr.querySelectorAll('.w-dyn-list'));
        wl.forEach(function(l, i){ [].forEach.call(l.querySelectorAll('a[href*="/subjects/"]'), function(a){
          var n = fold(a.textContent).trim(); if (n.length > 3) (i === 1 ? featNames : mentNames).push(n); }); });
      }
      var epScore = function(a){ var t = fold(a.textContent), sc = 0;
        featNames.forEach(function(n){ if (t.indexOf(n) >= 0) sc += 10; });
        mentNames.forEach(function(n){ if (t.indexOf(n) >= 0) sc += 1; });
        return sc; };
      ssrEps = ssrEps.map(function(a, i){ return { a: a, s: epScore(a), i: i }; })
        .sort(function(x, y){ return (y.s - x.s) || (x.i - y.i); }).map(function(o){ return o.a; });
      var shown = 0;
      ssrEps.forEach(function(a){
        var h = a.getAttribute('href'); if (seenEp[h] || shown >= LN_MAX) return; seenEp[h] = 1; shown++;
        var n = parseInt(a.getAttribute('data-n'), 10), mn = parseInt(a.getAttribute('data-min'), 10), t = a.textContent;
        a.className = 'lrft-ln'; a.removeAttribute('data-n'); a.removeAttribute('data-min');
        a.innerHTML = '<span class="ln-no">' + (isNaN(n) ? '' : ('0' + n).slice(-2)) + '</span>'
          + '<span class="ln-t">' + esc(t) + '</span><span class="ln-badge">Listen</span>'
          + '<span class="ln-len">' + (isNaN(mn) ? '' : mn + ' min') + '</span>';
        lnBox.parentNode.insertBefore(a, lnBox);
      });
      lnBox.parentNode.removeChild(lnBox);
    }
    if (ssrGroups) {
      [].forEach.call(box.querySelectorAll('[data-ssr]'), function(sp){
        (ssrGroups[sp.getAttribute('data-ssr')] || []).forEach(function(a){
          a.className = 'lrft-chip on'; a.removeAttribute('data-kind'); sp.appendChild(a);
        });
      });
    }
    if (ssr && ssr.parentNode && (ssrGroups || lnBox)) ssr.parentNode.removeChild(ssr);     /* only duplicates are left in it */


  /* ---------- marginalia: the archive whispers inside the column ---------- */
  (function(){
    function mount(){
    var body = document.querySelector('.text-garamond.w-richtext') || document.querySelector('.text-garamond');
    if (!body) return;
    fetch((window.LRW_RAW || 'https://raw.githubusercontent.com/monkantony/lr-media/main/') + 'reading.json')
      .then(function(r){ return r.json(); }).then(function(deck){
        var byslug = {}, byep = {};
        deck.articles.forEach(function(a){ (byslug[a[0]] = byslug[a[0]] || []).push(a); });
        deck.moments.forEach(function(m){ (byep[m[0]] = byep[m[0]] || []).push(m); });
        var notes = [];
        (me.rn || []).forEach(function(p){
          var qs = byslug[p[0]];
          if (qs) { var q = qs[Math.floor(Math.random() * qs.length)];
            var src_ = q[1].toLowerCase().indexOf(q[5].toLowerCase()) === 0 ? q[1] : q[5] + ' \u00b7 ' + q[1];
            notes.push({ q: q[4], s: src_, href: '/editorial/' + q[0], lbl: 'Elsewhere in the archive' }); }
        });
        (me.ln || []).forEach(function(l){
          var ms = byep[l[0]];
          if (ms) { var m = ms[Math.floor(Math.random() * ms.length)];
            notes.push({ q: m[2], s: m[3] + ' \u00b7 ' + String(m[1] || '').split(' with ')[0], href: '/editorials#pod=' + m[0], lbl: 'Said on the podcast' }); }
        });
        (me.tl || []).slice(0, 1).forEach(function(m){
          notes.push({ q: m[1], s: m[2] || 'The timeline', href: 'https://timeline.lerandom.art/' + (m[5] ? 'm/' + m[5] : 'chapter/' + m[3]), lbl: 'Deep history', ext: 1 });
        });
        notes = notes.slice(0, 3);
        if (!notes.length) return;
        var paras = [].filter.call(body.children, function(el){
          return el.tagName === 'P' && (el.textContent || '').length > 150;
        });
        if (paras.length < 6) return;
        var stops = [0.22, 0.55, 0.82];
        notes.forEach(function(n, i){
          var at = paras[Math.min(paras.length - 1, Math.round(stops[i] * paras.length))];
          if (!at || at.dataset.lrmgUsed) return;
          at.dataset.lrmgUsed = '1';
          var el = document.createElement('aside');
          el.className = 'lrmg-in';
          el.innerHTML = '<a ' + (n.ext ? 'target="_blank" rel="noopener" ' : '')
            + 'href="' + n.href.replace(/"/g, '&quot;') + '">'
            + '<span class="lrmg-lbl">' + n.lbl + '</span>'
            + '<span class="lrmg-q">\u201C' + String(n.q).replace(/&/g,'&amp;').replace(/</g,'&lt;') + '\u201D</span>'
            + '<span class="lrmg-s">' + String(n.s).replace(/&/g,'&amp;').replace(/</g,'&lt;') + '</span></a>';
          /* never directly under a heading (Peter, 17 Sep 2026: "it's confusing"): when the chosen
             paragraph opens a section, the box goes ABOVE the heading and closes the section before;
             a heading that opens the article has nothing before it, so the box goes below the paragraph */
          var ref = at;
          while (ref.previousElementSibling && /^H[1-6]$/.test(ref.previousElementSibling.tagName)) ref = ref.previousElementSibling;
          if (ref !== at && !ref.previousElementSibling) ref = at.nextElementSibling || at;
          ref.parentNode.insertBefore(el, ref);
        });
      }).catch(function(){});
    }
    /* wait for layout so paragraph measurement is stable */
    if (document.readyState === 'complete') setTimeout(mount, 300);
    else addEventListener('load', function(){ setTimeout(mount, 300); }, { once: true });
  })();

  /* ---------- staging-only: pages absent from this Webflow copy open on the live site ---------- */
  (function(){
    if (/(^|\.)lerandom\.art$/.test(location.hostname)) return;
    var MISS = {'beeple-on-robot-dogs-as-canvas':1,
      'robbie-fitzpatrick-on-basel-social-club-welcoming-the-barbarians':1,
      'living-aesthetics-a-grammar-of-protocol-art-and-worldbuilding':1};
    document.addEventListener('click', function(ev){
      var a = ev.target.closest('a[href*="/editorial/"]'); if (!a) return;
      var m = /\/editorial\/([a-z0-9-]+)/.exec(a.getAttribute('href') || '');
      if (m && MISS[m[1]] && a.hostname !== 'www.lerandom.art')
        a.href = 'https://www.lerandom.art/editorial/' + m[1];
    }, true);
  })();

  /* ---------- smart links: every mention knows its own article ---------- */
  (function(){
    var body = document.querySelector('.text-garamond.w-richtext') || document.querySelector('.text-garamond');
    if (!body) return;
    /* 29 Sep 2026: links baked into the CMS body (bake_editorial_smartlinks.py) lose their class on import;
       subject and episode pages are only ever reached by smart links, so they get the smart-link look back */
    var baked = body.querySelectorAll('a[href*="/subjects/"], a[href*="/episodes/"]');
    [].forEach.call(baked, function(a){ a.classList.add('lr-sl'); });
    /* 30 Sep 2026: a body with baked links is already linked in full (bake_links2.py, a wider map than
       smartlinks.json). Linking it again here put a second link on the next mention ("HyperCard ... HyperCard"),
       because this pass cannot see which subjects the bake has used. Only unbaked bodies are linked here. */
    if (baked.length) return;
    /* 6 Oct 2026 (Peter: "there shouldnt be any more smart links"): every body bake_links2.py could import is baked and
       stops here. The 13 it left alone (bodies with embeds, video or tables, which the rich-text import could damage)
       are still linked here until they are baked by hand. */
    fetch((window.LRW_RAW || 'https://raw.githubusercontent.com/monkantony/lr-media/main/') + 'smartlinks.json')
      .then(function(r){ return r.json(); })
      .then(function(SL){
        var forms = [], byForm = {};
        Object.keys(SL).forEach(function(k){
          var e = SL[k];
          e[1].forEach(function(f){
            var rec = [f, k, e[3] === 'people' && f.indexOf(' ') < 0 && e[0].indexOf(' ') > 0];
            forms.push(rec); byForm[f] = rec;
          });
        });
        forms.sort(function(a, b){ return b[0].length - a[0].length; });
        var rx = new RegExp('(' + forms.map(function(f){
          return f[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }).join('|') + ')');
        function hrefFor(t){
          return t[0] === 'a' ? '/editorial/' + t[1]
               : t[0] === 'p' ? '/editorials#pod=' + t[1]
               : '/editorials#subject=' + encodeURIComponent(t[1]);
        }
        var armed = {}, cyc = {}, blockIdx = 0, lastBlock = null, subjDone = {};
        var walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, { acceptNode: function(n){
          if (!n.nodeValue || n.nodeValue.length < 3) return NodeFilter.FILTER_REJECT;
          for (var el = n.parentElement; el && el !== body; el = el.parentElement){
            var tg = el.tagName;
            if (tg === 'A' || tg === 'SCRIPT' || tg === 'STYLE' || tg === 'BUTTON' || /^H[1-6]$/.test(tg))
              return NodeFilter.FILTER_REJECT;
            if (el.classList && el.classList.contains('lbl')) return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }});
        var nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
        nodes.forEach(function(node){
          var blk = node.parentElement.closest('p,li,blockquote,figcaption') || node.parentElement;
          if (blk !== lastBlock){ lastBlock = blk; blockIdx++; }
          var txt = node.nodeValue, at = 0, m, hits = [];
          while ((m = rx.exec(txt.slice(at)))){
            var form = m[1], rec = byForm[form], key = rec[1], ent = SL[key];
            var s = at + m.index, e = s + form.length;
            at = e;
            var okB = s === 0 || /[^A-Za-z0-9À-ɏ]/.test(txt[s - 1]);
            var okA = e === txt.length || /[^A-Za-z0-9À-ɏ]/.test(txt[e]);
            if (!okB || !okA) continue;
            if (rec[2]){   /* bare surname: refuse beside another capitalized word (Paul Klee) */
              if (/[A-Z][\wÀ-ɏ'’-]*\s+$/.test(txt.slice(0, s))) continue;
              if (/^\s+[A-Z][a-z]/.test(txt.slice(e))) continue;
            }
            if (armed[form] != null && blockIdx < armed[form]) continue;
            var ts = ent[2].filter(function(t){ return !(t[0] === 'a' && t[1] === slug); });
            if (!ts.length) continue;
            /* 23 Sep 2026 (Peter): a subject page is linked ONCE per article, from its first mention in any
               form ("Mark Zuckerberg" then "Zuckerberg" used to link twice) */
            if (ts[0][0] === 's' && subjDone[key]) continue;
            cyc[key] = cyc[key] || 0;
            var tgt = ts[cyc[key] % ts.length]; cyc[key]++;
            /* a subject-page link fires once; article/episode links rest three blocks */
            armed[form] = tgt[0] === 's' ? 1e9 : blockIdx + 3;
            if (tgt[0] === 's') subjDone[key] = 1;
            hits.push([s, e, hrefFor(tgt), SL[key][0]]);
          }
          if (!hits.length) return;
          var frag = document.createDocumentFragment(), pos = 0;
          hits.forEach(function(h){
            if (h[0] > pos) frag.appendChild(document.createTextNode(txt.slice(pos, h[0])));
            var a = document.createElement('a');
            a.className = 'lr-sl'; a.href = h[2];
            a.setAttribute('aria-label', 'More on ' + h[3] + ' at Le Random');
            a.textContent = txt.slice(h[0], h[1]);
            frag.appendChild(a); pos = h[1];
          });
          if (pos < txt.length) frag.appendChild(document.createTextNode(txt.slice(pos)));
          node.parentNode.replaceChild(frag, node);
        });
      }).catch(function(){});
  })();

  /* ---------- each author box links to that person's own page ----------
     Webflow renders one .w-dyn-item per credited author; a multi-author piece gets one
     link per person (r[6], the credited people; r[4] is the readable byline). */
  (function(){
    var r = data.arts[slug]; if (!r || !r[4]) return;
    var people = (r[6] && r[6].length ? r[6] : [r[4]]).map(function(n){ return String(n).replace(/\u200d/g, '').trim(); });
    var byKey = {}; people.forEach(function(n){ byKey[n.toLowerCase()] = n; });
    function link(el, name){
      if (el.closest('a') || el.dataset.lrWriter) return;
      el.dataset.lrWriter = '1';
      var href = '/editorials#writer=' + encodeURIComponent(name.toLowerCase());
      el.style.cursor = 'pointer';
      el.setAttribute('role', 'link');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', 'All editorials by ' + name);
      function go(){ location.href = window.__lrBridgeHref ? window.__lrBridgeHref(href) : href; }
      el.addEventListener('click', go);
      el.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      el.addEventListener('mouseenter', function(){ el.style.opacity = '.72'; });
      el.addEventListener('mouseleave', function(){ el.style.opacity = ''; });
    }
    var items = document.querySelectorAll('.blog-post5-content_author-wrapper .w-dyn-item');
    if (!items.length) {
      if (people.length === 1)
        [].forEach.call(document.querySelectorAll('.blog-post5-content_author-wrapper'), function(el){ link(el, people[0]); });
      return;
    }
    [].forEach.call(items, function(it){
      var nm = it.querySelector('.text-weight-semibold');
      var name = nm ? String(nm.textContent).replace(/\u200d/g, '').trim() : '';
      var hit = byKey[name.toLowerCase()];
      if (!hit && items.length === 1 && people.length === 1) hit = people[0];
      if (hit) link(it, hit);
    });
  })();

  /* ---------- structured data: ONE Article node, completed in place (SEO memo, 22 Sep 2026) ----------
     The Webflow head embed already ships an Article node in the static HTML. This used to add a
     second, disagreeing one (a different date format, no description). Now it completes the node
     that is there: ISO 8601 dates, every credited author, the audio edition, the subjects (about),
     and a BreadcrumbList beside it. A page whose node is missing or unparseable gets a whole one. */
  (function(){
    var r = data.arts[slug]; if (!r) return;
    var ORIGIN = location.origin;
    var MON = { jan:1, feb:2, mar:3, apr:4, may:5, jun:6, jul:7, aug:8, sep:9, oct:10, nov:11, dec:12 };
    function iso(s){
      s = String(s || '').trim();
      if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
      var m = s.match(/^([A-Za-z]{3})[A-Za-z]*\.?\s+(\d{1,2}),?\s+(\d{4})$/);
      if (!m || !MON[m[1].toLowerCase()]) return '';
      return m[3] + '-' + ('0' + MON[m[1].toLowerCase()]).slice(-2) + '-' + ('0' + m[2]).slice(-2);
    }
    var node = null, ld = null;
    [].some.call(document.querySelectorAll('script[type="application/ld+json"]'), function(s){
      try { var j = JSON.parse(s.textContent); if (j && j['@type'] === 'Article') { node = s; ld = j; return true; } } catch (e) {}
      return false;
    });
    var old = document.getElementById('lrft-ld'); if (old && old !== node) old.parentNode.removeChild(old);
    if (!ld) ld = { '@context': 'https://schema.org', '@type': 'Article', 'headline': r[2],
                    'publisher': { '@type': 'Organization', 'name': 'Le Random', 'url': ORIGIN },
                    'mainEntityOfPage': { '@type': 'WebPage', '@id': ORIGIN + '/editorial/' + slug } };
    var dp = iso(ld.datePublished) || iso(r[3]); if (dp) ld.datePublished = dp;
    if (ld.dateModified) { var dm = iso(ld.dateModified); if (dm) ld.dateModified = dm; else delete ld.dateModified; }
    if (!ld.description) { var md = document.querySelector('meta[name="description"]'); if (md && md.content) ld.description = md.content; }
    ld.author = (r[6] && r[6].length ? r[6] : [r[4]]).map(function(n){ return { '@type': 'Person', 'name': n }; });
    ld.url = ORIGIN + '/editorial/' + slug;
    ld.isPartOf = { '@type': 'CollectionPage', 'name': 'Le Random Editorials', 'url': ORIGIN + '/editorials' };
    if (r[5] && !ld.image) ld.image = r[5];
    if (me.au) ld.audio = { '@type': 'AudioObject', 'name': 'Audio edition: ' + r[2], 'contentUrl': me.au[0],
                            'encodingFormat': 'audio/mp4', 'duration': 'PT' + Math.round(me.au[1] / 60) + 'M',
                            'description': me.au[2] ? me.au[2].replace(' | ', '; ') : 'AI-generated audio edition' };
    var m = me.m || {}, subj = [];
    ['p','w','o','pl','t','th'].forEach(function(k){
      (m[k] || []).forEach(function(n){ if (subj.length < 24) subj.push(n[0]); });
    });
    if (subj.length) ld.about = subj.map(function(n){ return { '@type': 'Thing', 'name': n }; });
    if (node) node.textContent = JSON.stringify(ld);
    else { var el = document.createElement('script'); el.type = 'application/ld+json'; el.id = 'lrft-ld'; el.textContent = JSON.stringify(ld); document.head.appendChild(el); }
    if (!document.getElementById('lrft-bc')) {
      var bc = document.createElement('script'); bc.type = 'application/ld+json'; bc.id = 'lrft-bc';
      bc.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Le Random', 'item': ORIGIN + '/' },
        { '@type': 'ListItem', 'position': 2, 'name': 'Editorials', 'item': ORIGIN + '/editorials' },
        { '@type': 'ListItem', 'position': 3, 'name': r[2] } ] });
      document.head.appendChild(bc);
    }
    /* the visible date becomes a <time> with a machine-readable datetime; the words do not change */
    var dv = document.querySelector('.text-block-25');
    if (dv && dp && !dv.querySelector('time') && dv.children.length === 0) {
      var tm = document.createElement('time'); tm.dateTime = dp; tm.textContent = dv.textContent; dv.textContent = ''; dv.appendChild(tm);
    }
  })();

    if (me.au) { try { player(me.au[0], me.au[1], (data.arts && data.arts[slug] && data.arts[slug][2]) || '', me.au[2]); } catch (e) { /* no player beats a broken page */ } }
  }).catch(function(){ /* no footer beats a broken footer */ });
  function player(url, secs, title, credit, slot, label) {
    var host = slot ? slot.appendChild(document.createElement('div')) : document.querySelector('.text-garamond');
    if (!host || document.getElementById('lrap')) return;
    var el = document.createElement('div'); el.id = 'lrap';
    el.innerHTML = '<button class="lrap-skip lrap-b15" type="button" aria-label="Back 15 seconds">&#8722;15</button>'
      + '<button class="lrap-btn" type="button" aria-label="Play audio">'
      + '<svg class="lrap-ic-play" viewBox="0 0 16 16"><path d="M3 1.5 14 8 3 14.5z"/></svg>'
      + '<svg class="lrap-ic-pause" viewBox="0 0 16 16"><path d="M3 1.5h3.6v13H3zM9.4 1.5H13v13H9.4z"/></svg></button>'
      + '<button class="lrap-skip lrap-f15" type="button" aria-label="Forward 15 seconds">+15</button>'
      /* 20 Sep 2026 (Peter): the credit sits BESIDE the label, quiet, and gives back the line and the
         rule it used to occupy under the player. */
      + '<span class="lrap-meta"><span class="lrap-top">'
      + '<span class="lrap-lbl">Listen<span class="lrap-lbl-x">' + (label ? label.replace(/^Listen/, '') : ' to this editorial') + '</span></span>'
      + (slot ? '' : '<span class="lrap-ai">' + String(credit || 'AI generated audio').replace(/&/g, '&amp;').replace(/</g, '&lt;') + ' | LR Pod theme by Rami Awad</span>') + '</span>'
      + (title ? '<span class="lrap-title">' + String(title).replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</span>' : '')
      + '<span class="lrap-bar"><span class="lrap-fill"></span></span>'
      + '<span class="lrap-time">0:00 / ' + fmt(secs) + '</span></span>'
      + '<button class="lrap-rate" type="button" aria-label="Playback speed">1&#215;</button>';
    /* lr-reserve: the head embed holds the player's space open until this class arrives (same task, no frame between) */
    document.documentElement.classList.add('lr-player');
    host.parentNode.insertBefore(el, host);
    var a = new Audio(); a.preload = 'none'; a.src = url;
    /* floating: the player's home is a box of constant height that stays in the article; the player
       leaves it for the body while playing off screen (a transformed Webflow ancestor would otherwise
       pin position:fixed to itself). Two thresholds, so a slow scroll never flickers: it floats only
       once the home is fully out of view, and docks only once the home is nearly all back. */
    var home = document.createElement('div'); home.className = 'lrap-home'; host.parentNode.insertBefore(home, el); home.appendChild(el);
    function settle(){ if (!el.classList.contains('float')) home.style.height = el.offsetHeight + 'px'; }
    settle(); addEventListener('resize', settle, { passive: true }); if (document.fonts && document.fonts.ready) document.fonts.ready.then(settle);
    var homeRatio = 1;
    function dock(on) {
      if (on === el.classList.contains('float')) return;
      if (on) { el.classList.add('float'); document.body.appendChild(el); }
      else { el.classList.remove('float'); home.appendChild(el); settle(); }
    }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
      homeRatio = es[0].intersectionRatio;
      if (homeRatio === 0 && !a.paused) dock(true);
      else if (homeRatio >= 0.85) dock(false);
    }, { threshold: [0, 0.85, 1] }).observe(home);
    var fill = el.querySelector('.lrap-fill'), time = el.querySelector('.lrap-time');
    function fmt(t) { t = Math.max(0, Math.round(t)); var mm = Math.floor(t / 60), ss = t % 60; return mm + ':' + (ss < 10 ? '0' : '') + ss; }
    function dur() { return a.duration && isFinite(a.duration) ? a.duration : secs; }
    function seekBy(d) {
      var go = function () { a.currentTime = Math.min(dur(), Math.max(0, a.currentTime + d)); };
      if (a.readyState >= 1) { go(); } else { a.addEventListener('loadedmetadata', go, { once: true }); a.load(); }
    }
    /* 29 Sep 2026: an episode page's chapter and quote times play from that moment */
    window.__lrapSeek = function (t, play) {
      var go = function () { a.currentTime = Math.min(dur(), Math.max(0, t)); if (play) a.play(); };
      if (a.readyState >= 1) { go(); } else { a.addEventListener('loadedmetadata', go, { once: true }); a.load(); }
    };
    el.querySelector('.lrap-b15').addEventListener('click', function () { seekBy(-15); });
    el.querySelector('.lrap-f15').addEventListener('click', function () { seekBy(15); });
    var RATES = [1, 1.25, 1.5, 1.75, 2], ri = 0, rateBtn = el.querySelector('.lrap-rate');
    rateBtn.addEventListener('click', function () {
      ri = (ri + 1) % RATES.length; a.playbackRate = RATES[ri];
      rateBtn.innerHTML = String(RATES[ri]).replace('.25','.25').replace('.75','.75') + '&#215;';
    });
    el.querySelector('.lrap-btn').addEventListener('click', function () {
      if (a.paused) { a.play(); } else { a.pause(); }
    });
    a.addEventListener('play', function () { el.classList.add('on'); if (homeRatio === 0) dock(true); });
    a.addEventListener('pause', function () { el.classList.remove('on'); dock(false); });
    a.addEventListener('ended', function () { el.classList.remove('on'); a.currentTime = 0; dock(false); });
    a.addEventListener('timeupdate', function () {
      fill.style.width = (a.currentTime / dur() * 100) + '%';
      time.textContent = fmt(a.currentTime) + ' / ' + fmt(dur());
    });
    el.querySelector('.lrap-bar').addEventListener('click', function (e) {
      var r = e.currentTarget.getBoundingClientRect();
      var ratio = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      var go = function () { a.currentTime = ratio * dur(); };
      if (a.readyState >= 1) { go(); } else { a.addEventListener('loadedmetadata', go, { once: true }); a.load(); }
    });
  }
})();



  /* ---------- lightbox (23 Sep 2026): the body's images, full screen, in order ---------- */
  (function(){
    var body = document.querySelector('.text-garamond.w-richtext') || document.querySelector('.text-garamond');
    if (!body) return;
    var imgs = [].filter.call(body.querySelectorAll('figure img'), function(im){ return !im.closest('a') && !im.closest('.lrmg-in'); });
    if (!imgs.length) return;
    function big(im){   /* the smallest Webflow size that is sharp full screen on this display (originals run to 5760 px) */
      var need = Math.min(2600, Math.round(Math.max(innerWidth, innerHeight * 1.5) * (window.devicePixelRatio || 1)));
      var cs = String(im.getAttribute('srcset') || '').split(',').map(function(c){ var p = c.trim().split(/\s+/); return { u: p[0], w: parseInt(p[1], 10) || 0 }; })
        .filter(function(c){ return c.u && c.w; }).sort(function(a, b){ return a.w - b.w; });
      for (var i = 0; i < cs.length; i++) if (cs[i].w >= need) return cs[i].u;
      return cs.length ? cs[cs.length - 1].u : (im.currentSrc || im.src);
    }
    var box = document.createElement('div'); box.className = 'lrlb'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Image viewer');
    box.innerHTML = '<span class="lrlb-n"></span><button type="button" class="lrlb-x" aria-label="Close">&#10005;</button>'
      + '<button type="button" class="lrlb-p" aria-label="Previous image">&#8592;</button><button type="button" class="lrlb-q" aria-label="Next image">&#8594;</button>'
      + '<img alt=""><figcaption></figcaption>';
    document.body.appendChild(box);
    var cur = 0, last = null, IM = box.querySelector('img'), CAP = box.querySelector('figcaption'), N = box.querySelector('.lrlb-n');
    function show(i){
      cur = (i + imgs.length) % imgs.length; var im = imgs[cur], fc = im.closest('figure') && im.closest('figure').querySelector('figcaption');
      IM.src = big(im); IM.alt = im.alt || ''; CAP.textContent = fc ? fc.textContent.trim() : ''; CAP.style.display = fc ? '' : 'none';
      N.textContent = imgs.length > 1 ? (cur + 1) + ' of ' + imgs.length : '';
      box.querySelector('.lrlb-p').style.display = box.querySelector('.lrlb-q').style.display = imgs.length > 1 ? '' : 'none';
    }
    function open(i){ last = document.activeElement; show(i); box.classList.add('on'); document.documentElement.classList.add('lrlb-lock'); box.querySelector('.lrlb-x').focus(); }
    function close(){ box.classList.remove('on'); document.documentElement.classList.remove('lrlb-lock'); IM.removeAttribute('src'); if (last && last.focus) last.focus(); }
    imgs.forEach(function(im, i){
      im.classList.add('lrlb-on'); im.setAttribute('tabindex', '0'); im.setAttribute('role', 'button'); im.setAttribute('aria-label', 'Open image full screen' + (im.alt ? ': ' + im.alt : ''));
      im.addEventListener('click', function(){ open(i); });
      im.addEventListener('keydown', function(ev){ if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); open(i); } });
    });
    box.querySelector('.lrlb-x').addEventListener('click', close);
    box.querySelector('.lrlb-p').addEventListener('click', function(ev){ ev.stopPropagation(); show(cur - 1); });
    box.querySelector('.lrlb-q').addEventListener('click', function(ev){ ev.stopPropagation(); show(cur + 1); });
    box.addEventListener('click', function(ev){ if (ev.target === box) close(); });
    addEventListener('keydown', function(ev){
      if (!box.classList.contains('on')) return;
      if (ev.key === 'Escape') close(); else if (ev.key === 'ArrowRight') show(cur + 1); else if (ev.key === 'ArrowLeft') show(cur - 1);
    });
    var x0 = null;
    box.addEventListener('touchstart', function(ev){ x0 = ev.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function(ev){ if (x0 == null) return; var dx = ev.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1)); x0 = null; });
  })();
})();

/* ---------- the bridge (Peter, 29 Sep 2026): old in-page routes -> the real CMS pages ----------
   "will all the links on main site be correct with the new links ... including the author links on all
   the pages and contributor links". #pod=N -> /episodes/<slug>, #subject=<key> -> /subjects/<slug>,
   #writer=<name> -> /subjects/<slug>, from bridge_map.json (built from the same data as the CMS import).
   1. every <a> whose href is one of those routes gets the real URL (compare first, write only on change;
      rotating cards reset their href, so href changes are watched too);
   2. on /editorials, a route that would open an overlay is forwarded to the page instead (old bookmarks,
      shared links, chips and buttons that set the hash). Anything without a page keeps its overlay.
   v2 (Peter: "the old pages flash before the new one loads"): this module runs FIRST in the bundle; while
   a forwardable route is in the address the page stays hidden, and its hashchange handler runs before the
   overlay's and stops it. A 2.5 s failsafe always shows the page again. */
(function(){
  if (window.__lrBridge) return; window.__lrBridge = 1;
  var BASE = window.LRW_RAW || 'https://raw.githubusercontent.com/monkantony/lr-media/main/';
  var RX = /(?:^|\/editorials\/?)#(pod|subject|writer)=([^&]+)$/;
  var HX = /^#(pod|subject|writer)=([^&]+)$/;
  var ON_ED = /^\/editorials\/?$/.test(location.pathname);
  var M = null, root = document.documentElement, fail = 0;
  function hide(){ root.style.visibility = 'hidden'; clearTimeout(fail); fail = setTimeout(show, 2500); }
  function show(){ clearTimeout(fail); if (root.style.visibility === 'hidden') root.style.visibility = ''; }
  function target(kind, val){
    if (!M) return null;
    try { val = decodeURIComponent(val); } catch (e) {}
    if (kind === 'pod') { var s = M.p[String(parseInt(val, 10))]; return s ? '/episodes/' + s : null; }
    if (kind === 'subject') { var k = M.s[val] || M.s[val.toLowerCase()]; return k ? '/subjects/' + k : null; }
    var w = M.w[val.replace(/‍/g, '').trim().toLowerCase()]; return w ? '/subjects/' + w : null;
  }
  function fromHref(h){ var m = RX.exec(h || ''); return m ? target(m[1], m[2]) : null; }
  /* for code that navigates by script (lrft.js's author box): the page, or the old route while the map loads */
  window.__lrBridgeHref = function(h){ return fromHref(h) || h; };
  /* the answer for the current address: a URL, false (no page: let the overlay open), or null (map not here yet) */
  function routeNow(){
    var m = HX.exec(location.hash || ''); if (!m) return false;
    if (!M) return null;
    return target(m[1], m[2]) || false;
  }
  if (ON_ED && HX.test(location.hash || '')) hide();          /* before the overlay code reads the hash */
  if (ON_ED) addEventListener('hashchange', function(ev){
    var t = routeNow();
    if (t === false) return show();
    ev.stopImmediatePropagation();                           /* the overlay never opens */
    hide();
    if (t) location.replace(t);                              /* null: the map's arrival forwards it */
  });
  function rewrite(){
    var as = document.querySelectorAll('a[href*="#pod="], a[href*="#subject="], a[href*="#writer="]');
    for (var i = 0; i < as.length; i++) {
      var t = fromHref(as[i].getAttribute('href'));
      if (t && as[i].getAttribute('href') !== t) as[i].setAttribute('href', t);
      else if (!t && as[i].classList.contains('lrft-chip')) {     /* 1 Oct 2026: a subject with no page stays plain text */
        var sp = document.createElement('span'); sp.className = 'lrft-chip'; sp.textContent = as[i].textContent; as[i].replaceWith(sp);
      }
    }
  }
  document.addEventListener('click', function(ev){
    if (!M) return;
    var a = ev.target.closest && ev.target.closest('a[href*="#pod="], a[href*="#subject="], a[href*="#writer="]');
    if (a) { var t = fromHref(a.getAttribute('href')); if (t) { ev.preventDefault(); ev.stopImmediatePropagation(); location.assign(t); } }
  }, true);
  fetch(BASE + 'bridge_map.json').then(function(r){ return r.json(); }).then(function(map){
    M = map;
    if (ON_ED) { var t = routeNow(); if (t) { location.replace(t); return; } show(); }
    var start = function(){
      rewrite();
      var queued = false;
      new MutationObserver(function(){
        if (queued) return; queued = true;
        setTimeout(function(){ queued = false; rewrite(); }, 30);   /* not rAF: a tab opened in the background pauses rAF and the queue stuck */
      }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });
    };
    if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
  }).catch(show);
})();

/* ---- lr-subject-words (2 Oct 2026): on a subject page, the archive's own line about the term, under its definition.
   Data: subject_words.json (Editorials Entity Index/definitions/build_definitions.py). ---- */
(function () {
  var m = location.pathname.match(/^\/subjects\/([^\/?#]+)/); if (!m) return;
  var slug = decodeURIComponent(m[1]), BASE = window.LRW_RAW || 'https://raw.githubusercontent.com/monkantony/lr-media/main/';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  fetch(BASE + 'subject_words.json').then(function (r) { return r.json(); }).then(function (W) {
    var w = W[slug]; if (!w || !w.q || document.querySelector('.sj-words')) return;
    var bio = document.querySelector('.sj-bio'); if (!bio || bio.classList.contains('w-dyn-bind-empty')) return;
    var css = document.createElement('style');
    css.textContent = '.sj-words{margin:0 0 22px;max-width:58ch;padding-left:16px;border-left:2px solid var(--orange,#FF4C00)}' +
      '.sj-words p{font-family:var(--serif,Georgia,serif);font-size:16px;line-height:1.45;color:var(--ink,#011015);margin:0}' +
      '.sj-words .sj-src{margin-top:8px;font-family:var(--sans,Arial,sans-serif);font-size:10px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-40,rgba(1,16,21,.55))}' +
      '.sj-words .sj-src span{color:var(--ink,#011015)}.sj-words a{color:inherit;text-decoration:none}' +
      '.sj-words a:hover{color:var(--orange,#FF4C00)}';
    document.head.appendChild(css);
    var f = document.createElement('figure'); f.className = 'sj-words';
    f.innerHTML = '<p>“' + esc(w.q) + '”</p><div class="sj-src">' + (w.qs ? '<span>' + esc(w.qs) + '</span> · ' : '') +
      '<a href="' + esc(w.qu) + '">' + esc(w.qt) + ' →</a></div>';   /* v2: who says it, then where (Peter, 2 Oct) */
    bio.parentNode.insertBefore(f, bio.nextSibling);
  }).catch(function () {});
})();

/* 3 Oct 2026 (SEO, Peter: "type each page"): subject pages ship WebPage JSON-LD whose "about" is a bare Thing. Give it
   the subject's real type from its Kind line (Person / Organization / Place / CreativeWork / Event), and for people add
   sameAs to their Le Random artist page when the template shows one. Search engines read rendered JSON-LD. */
(function(){
  try {
    if (!/^\/subjects\//.test(location.pathname)) return;
    var k = document.querySelector('.sj-kind'); if (!k) return;
    var T = {Person:'Person', Organisation:'Organization', Place:'Place', Work:'CreativeWork', Exhibition:'ExhibitionEvent'};
    var type = T[(k.textContent || '').trim()]; if (!type) return;
    [].forEach.call(document.querySelectorAll('script[type="application/ld+json"]'), function(s){
      var d; try { d = JSON.parse(s.textContent); } catch(e) { return; }
      if (!d || d['@type'] !== 'WebPage' || !d.about) return;
      d.about['@type'] = type;
      var also = document.querySelector('a.sj-also[href]');
      if (type === 'Person' && also && also.offsetParent !== null) d.about.sameAs = [also.href];
      if (type === 'Person') d['@type'] = 'ProfilePage', d.mainEntity = d.about;
      s.textContent = JSON.stringify(d);
    });
  } catch (e) {}
})();
