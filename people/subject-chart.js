/* Le Random people view on a subject page (www.lerandom.art/subjects/<slug>). 30 Sep 2026.
   Loaded by the Subjects template's embed from lr-media at the pinned commit (data-base = this folder).
   Person pages only, and only when config.json says "enabled" (the switch: Monday 5 Oct 2026, with the Timeline).
   The Timeline's people view (chart + panel) fills the screen under the site's nav, opened on this person, inside a
   frame that shares this page's origin. Its <base> is the live Timeline (images, live scenes, moment pages); the LR
   data (people, archive, editorials, podcast) comes from lr-media. Choosing someone else in the view changes this
   page's address to their subject page. The page's own text stays below: it is what search engines read. */
(function () {
  var me = document.currentScript, BASE = me && me.getAttribute('data-base');
  var m = location.pathname.match(/\/subjects\/([^\/?#]+)/); if (!BASE || !m) return;
  var slug = decodeURIComponent(m[1]), TL = 'https://timeline.lerandom.art/';
  // 5 Oct 2026: lr-media is past jsDelivr's 50 MB limit for GitHub repos, so right after a push jsDelivr answers some
  // of a new commit's files with 403/503 ("Package size exceeded") and the view hung on "Charting the people".
  // GitHub's own file server has no size limit and a commit URL never changes: data and code are read from there
  // (code inlined, since it is served as text/plain), with jsDelivr as the fallback.
  var RAW = BASE.replace(/^https:\/\/cdn\.jsdelivr\.net\/gh\/([^@\/]+\/[^@\/]+)@([0-9a-f]{7,40})\//, 'https://raw.githubusercontent.com/$1/$2/');
  function get(f, as) {
    var one = function (b) { return fetch(b + f, { cache: 'force-cache' }).then(function (r) { if (!r.ok) throw f + ' ' + r.status; return as === 'json' ? r.json() : r.text(); }); };
    return RAW !== BASE ? one(RAW).catch(function () { return one(BASE); }) : one(BASE);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', begin); else begin();

  function begin() {
    var kind = document.querySelector('.sj-kind'); if (!kind) return;
    var isPerson = /person/i.test(kind.textContent);
    var j = function (f) { return get(f, 'json'); };
    Promise.all([j('subject-slugs.json'), j('config.json')]).then(function (a) {
      var tok2sub = a[0], cfg = a[1], sub2tok = {};
      if (!cfg.enabled && !window.LR_PEOPLE_FORCE) return;
      for (var t in tok2sub) sub2tok[tok2sub[t]] = t;
      if (sub2tok[slug]) mount(sub2tok[slug], tok2sub, sub2tok, cfg);
      // LR-SUBJECTS (5 Oct 2026): every other subject page opens the chart on its subject (config "subjects": true)
      else if (!isPerson && cfg.subjects) get('data/subj/' + shardOf(slug) + '.json', 'json').then(function (sh) {
        var d = sh && sh[slug]; if (d && (d.m.length || d.a.length || d.p.length)) { d.slug = slug; mount(null, tok2sub, sub2tok, cfg, d); }
      }).catch(function () {});
    }).catch(function () {});
  }

  // the frame's own code and styles, inlined from the same commit (a <script src> on the file server would be refused:
  // it serves text/plain). Anything that cannot be fetched keeps its tag and loads from jsDelivr as before.
  function inlineCode(h) {
    h = h.replace(/<script src="assets\/theme\.js[^"]*"><\/script>|<link rel="stylesheet" href="assets\/theme\.css[^"]*">/g, '');   // never shipped (404)
    var tags = [], re = /<script src="assets\/([^"?]+\.js)"><\/script>|<link rel="stylesheet" href="assets\/([^"?]+\.css)">/g, mm;
    while ((mm = re.exec(h))) tags.push({ tag: mm[0], file: 'assets/' + (mm[1] || mm[2]), js: !!mm[1] });
    return Promise.all(tags.map(function (t) {
      return get(t.file).then(function (code) {
        if (t.js) return '<script>' + code.replace(/<\/script/gi, '<\\/script') + '\n<\/script>';
        return '<style>' + code.replace(/url\(\.\.\/fonts\//g, 'url(' + RAW + 'fonts/') + '</style>';
      }).catch(function () { return null; });
    })).then(function (out) {
      tags.forEach(function (t, i) { if (out[i] != null) h = h.split(t.tag).join(out[i]); });
      return h;
    });
  }

  function headerBottom() {
    var b = 0;
    ['.navbar_component', '#lrtopbar', '#topbar'].forEach(function (s) {
      var el = document.querySelector(s); if (!el) return;
      // measured from its style, not its box: the nav may still be sliding in when this runs
      var cs = getComputedStyle(el), top = parseFloat(cs.top) || 0;
      if (/fixed|sticky|absolute/.test(cs.position) && cs.display !== 'none' && top <= 1 && el.offsetHeight < 240) b = Math.max(b, top + el.offsetHeight);
    });
    return Math.round(b);
  }

  function shardOf(k) { var h = 0; for (var i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) >>> 0; return h % 64; }

  function mount(tok, tok2sub, sub2tok, cfg, subj) {
    var home = tok, homeTitle = document.title;
    var css = document.createElement('style');
    css.textContent = '.lr-pp{position:relative;width:100%;background:#011015;height:calc(100vh - var(--lr-pp-top,64px));height:calc(100svh - var(--lr-pp-top,64px));min-height:520px}' +
      '.lr-pp iframe{position:absolute;inset:0;width:100%;height:100%;border:0;display:block}' +
      '.lr-pp-wait{position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);margin:0;text-align:center;color:#EFE9D8;opacity:.6;' +
      'font:500 10px/1 Rules,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase}' +
      '.lr-pp-on .ent-inner{padding-top:44px!important}' +
      '.lr-pp-away .ent-inner{display:none}';
    document.head.appendChild(css);
    var box = document.createElement('section'); box.className = 'lr-pp'; box.setAttribute('aria-label', 'People map');
    box.innerHTML = '<p class="lr-pp-wait">Charting the people</p>';
    var inner = document.querySelector('.ent-inner'); if (!inner) return;
    // a real block of the header's height above the view (a margin would collapse through <body> and carry the
    // nav, whose top is auto, down with it)
    var pad = document.createElement('div'); pad.className = 'lr-pp-pad'; pad.setAttribute('aria-hidden', 'true');
    inner.parentNode.insertBefore(pad, inner); inner.parentNode.insertBefore(box, inner);
    document.documentElement.classList.add('lr-pp-on');
    function place() { var t = headerBottom(); pad.style.height = t + 'px'; document.documentElement.style.setProperty('--lr-pp-top', t + 'px'); }
    place(); setTimeout(place, 800); setTimeout(place, 2500); addEventListener('load', place); addEventListener('resize', place);

    var fr = document.createElement('iframe'); fr.title = 'People map'; fr.setAttribute('allow', 'fullscreen; autoplay');
    get('embed.html').then(inlineCode).then(function (h) {
      var assets = cfg.assets_base || TL;
      var head = '<base href="' + assets + '"><script>window.LR_EMBED=1;window.LR_FRAMED=true;window.LR_PEOPLE_HOME="main";' +
        'window.LR_DATA=' + JSON.stringify(RAW) + ';window.LR_LEAD=' + JSON.stringify(cfg.lead || {}) + ';' +
        'window.LR_PARAMS=' + JSON.stringify({ token: tok || '' }) + ';' +
        'window.LR_SUBJ=' + JSON.stringify(subj || null).replace(/</g, '\\u003c') + ';<\/script>';
      // the page's own code and styles come from lr-media, not from the Timeline the <base> points at
      h = h.replace('<!--LR-EMBED-HEAD-->', head).replace(/(href|src)="assets\//g, '$1="' + BASE + 'assets/');
      fr.srcdoc = h;
      box.appendChild(fr);
      fr.addEventListener('load', function () { var w = box.querySelector('.lr-pp-wait'); if (w) w.remove(); });
    });

    function tlUrl(page, p) {
      p = p || {};
      if (page === 'moment' && p.slug) return TL + 'm/' + p.slug;
      var u = TL + (page && page !== 'home' ? page + '.html' : '');
      if (p.slug) u += '#' + p.slug; else if (p.token) u += '#' + p.token;
      return u;
    }
    function open(url, newtab) {
      url = url.replace(/^(https:\/\/timeline\.lerandom\.art\/m\/[a-z0-9-]+)\.html/, '$1');
      if (newtab) { var w = window.open(url, '_blank'); if (w) { try { w.opener = null; } catch (e) {} } else location.href = url; } else location.href = url;
    }
    function at(t, title) {
      var s = tok2sub[t]; if (!s) return;
      var path = '/subjects/' + s;
      if (location.pathname !== path) history.pushState({ lrpp: t }, '', path);
      document.documentElement.classList.toggle('lr-pp-away', t !== home);
      document.title = t === home ? homeTitle : String(title || '').replace(/ · People · Le Random$/, '') + ' — Le Random Editorials';
    }
    addEventListener('message', function (e) {
      if (e.source !== fr.contentWindow || !e.data) return;
      var d = e.data;
      if (d.lrembed === 'at') at(d.tok, d.title);
      else if (d.lrembed === 'open') open(d.url, d.newtab);
      else if (d.lrsite === 'go') {
        if (d.page === 'people' && (d.params && (d.params.token || d.params.slug))) { var w = fr.contentWindow; if (w.LR_SELECT) w.LR_SELECT(d.params.token || d.params.slug); }
        else open(tlUrl(d.page, d.params), true);   // 5 Oct 2026, Peter: the Timeline opens in a new tab
      }
    });
    addEventListener('popstate', function () {
      var mm = location.pathname.match(/\/subjects\/([^\/?#]+)/);
      if (subj && mm && decodeURIComponent(mm[1]) === subj.slug) {   // back to this subject page's own subject
        document.documentElement.classList.remove('lr-pp-away'); document.title = homeTitle;
        var ws = fr.contentWindow; if (ws && ws.LR_SUBJECT) ws.LR_SUBJECT(subj); return;
      }
      var t = mm && sub2tok[decodeURIComponent(mm[1])];
      if (!t) return;
      document.documentElement.classList.toggle('lr-pp-away', t !== home);
      if (t === home) document.title = homeTitle;
      var w = fr.contentWindow; if (w && w.LR_SELECT) w.LR_SELECT(t);
    });
  }
})();
