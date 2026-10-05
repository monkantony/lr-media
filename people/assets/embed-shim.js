/* LR-EMBED shim: inside the subject page's frame. The Timeline's own links (data-go, data-moment) already become
   messages to the page (site.js, framed mode); a plain link would load inside the frame, so it becomes one too. */
(function () {
  var S = window.LRSite; if (!S || !window.LR_EMBED) return;
  S.mountNav = function () {};
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.defaultPrevented || a.hasAttribute('data-go') || a.hasAttribute('data-moment') || a.hasAttribute('data-person')) return;
    var h = a.getAttribute('href') || '';
    if (!h || h.charAt(0) === '#' || /^(javascript|mailto|tel):/i.test(h)) return;
    var m = h.match(/^(?:\.\/)?people\/([a-z0-9][a-z0-9-]*)(?:\.html)?$/);
    e.preventDefault();
    if (m && window.LR_SELECT) { window.LR_SELECT(m[1]); return; }
    parent.postMessage({ lrembed: 'open', url: new URL(h, document.baseURI).href, newtab: !!(e.metaKey || e.ctrlKey || a.target === '_blank') }, '*');
  }, true);
})();
