/* LR-EMBED shim: inside the subject page's frame (its <base> is the live Timeline).
   5 Oct 2026, Peter: "if you click on things the subject page opens the timeline in lerandom.art/subjects and things get
   weird. it should new tab to the timeline right?" and "mentioned in 1 timeline moment ... is a broken link".
   - an in-panel anchor (#pv-mom, "Mentioned in 1 Timeline moment") scrolls the panel; against the <base> it used to load
     the Timeline's home page inside the frame
   - every Timeline destination (moments, ideas, threads, chronology...) opens the Timeline in a NEW TAB, straight from the
     click (no popup blocker), moments at their canonical /m/<slug>
   - a person in the chart is chosen in place; a link to the main site (subjects, episodes, editorials) opens in this tab */
(function () {
  var S = window.LRSite; if (!S || !window.LR_EMBED) return;
  S.mountNav = function () {};
  var TL = 'https://timeline.lerandom.art/';
  function canon(u) {
    return u.replace(/^(https:\/\/timeline\.lerandom\.art\/)moment(?:\.html)?#([a-z0-9][a-z0-9-]*)$/, '$1m/$2')
            .replace(/^(https:\/\/timeline\.lerandom\.art\/m\/[a-z0-9-]+)\.html$/, '$1');
  }
  function newTab(u) {   // ('noopener' would make window.open return null, so the opener is cut by hand)
    var w = window.open(u, '_blank');
    if (w) { try { w.opener = null; } catch (e) {} } else parent.postMessage({ lrembed: 'open', url: u, newtab: true }, '*');
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href],a[data-go],[data-moment]');
    if (!a || e.defaultPrevented || e.button > 0) return;
    var h = a.getAttribute('href') || '', pg = a.getAttribute('data-go') || '', mo = a.getAttribute('data-moment');
    if (a.hasAttribute('data-person')) return;                                   // people.js chooses them
    if (!mo && !pg && h.charAt(0) === '#') {                                     // an anchor in the panel
      e.preventDefault();
      var el = h.length > 1 && document.getElementById(h.slice(1));
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (/^(javascript|mailto|tel):/i.test(h)) return;
    var pm = !mo && h.match(/^(?:\.\/)?people(?:\.html)?(?:\/|#)([a-z0-9][a-z0-9-]*)(?:\.html)?$/);
    if (pm && window.LR_SELECT) { e.preventDefault(); e.stopPropagation(); window.LR_SELECT(pm[1]); return; }
    if (pg === 'people') return;                                                 // site.js: a person, chosen in place
    var url = mo ? TL + 'm/' + mo
      : pg && S.href ? new URL(S.href(pg, { slug: a.dataset.slug, token: a.dataset.token }), document.baseURI).href
      : new URL(h, document.baseURI).href;
    url = canon(url);
    e.preventDefault(); e.stopPropagation();
    if (url.indexOf(TL) === 0 || !/^https:\/\/(www\.)?lerandom\.art\//.test(url)) newTab(url);
    else parent.postMessage({ lrembed: 'open', url: url, newtab: !!(e.metaKey || e.ctrlKey || a.target === '_blank') }, '*');
  }, true);
  // what the view opens by itself (Open the moment, Look through the window, a scene's own links): S.go in framed mode
  // posts to the page; Timeline pages go to a new tab here instead, while the click that caused them is still live
  var go0 = S.go;
  S.go = function (page, params) {
    params = params || {};
    if (page === 'people' || !S.href) return go0.apply(this, arguments);
    newTab(canon(page === 'moment' && params.slug ? TL + 'm/' + params.slug : new URL(S.href(page, params), document.baseURI).href));
  };
})();
