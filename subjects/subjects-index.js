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
    var CALM = !!getComputedStyle(box).getPropertyValue('--map').trim();
    fr.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;display:block;opacity:0' + (CALM ? '' : ';transition:opacity .5s');
    var shown = false, show = function () { if (shown) return; shown = true; fr.style.opacity = '1'; box.classList.add('is-live'); };
    get(P_BASE, P_RAW, 'embed.html').then(inlineCode).then(function (h) {
      var head = '<base href="' + TL + '"><script>window.LR_EMBED=1;window.LR_FRAMED=true;window.LR_PEOPLE_HOME="main";window.LR_SUBJECTS_INDEX=1;' +
        (CALM ? 'window.LR_SL_CALM=1;' : '') + 'window.LR_DATA=' + JSON.stringify(P_RAW) + ';window.LR_SL_DATA=' + JSON.stringify(RAW) + ';window.LR_PARAMS={"token":""};' +
        (kindOf() != null ? 'window.LR_SL_TAB=' + kindOf() + ';' : '') + (sortOf() ? 'window.LR_SL_SORT="az";' : '') + '<\/script>';
      // the subjects layout from the frame's first paint (the engine would add it only once it starts)
      if (CALM) h = h.replace('<main id="pp" class="pp ', '<main id="pp" class="pp sl-on ');
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
  // after first paint: the poster holds the box until then
  var idle = window.requestIdleCallback || function (f) { return setTimeout(f, 200); };
  if (document.readyState === 'complete') idle(mount, { timeout: 1500 }); else addEventListener('load', function () { idle(mount, { timeout: 1500 }); });
})();
