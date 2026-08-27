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
#lrft .lrft-sh { font-style:italic; font-size:13.5px; color:var(--lr-ink40); display:block; margin-top:7px; }
#lrft .lrft-pn { display:grid; grid-template-columns:1fr 1fr; border-top:1px solid var(--lr-ink); }
#lrft .lrft-pn a { padding:18px 0 42px; }
#lrft .lrft-pn a + a { text-align:right; border-left:1px solid var(--lr-hair); padding-left:18px; }
#lrft .lrft-dir { font-family:var(--lr-sans); font-size:9.5px; letter-spacing:.18em; text-transform:uppercase; color:var(--lr-ink40); display:block; margin-bottom:7px; }
#lrft .lrft-t { font-weight:500; font-size:17px; line-height:1.2; }
#lrft .lrft-pn a:hover .lrft-t { color:var(--lr-or); }
@media (max-width:640px){ #lrft .lrft-rn { grid-template-columns:1fr; } #lrft .lrft-grp { flex-direction:column; gap:7px; } }
#lrap { --lr-ink:#011015; --lr-ink40:rgba(1,16,21,.38); --lr-or:#FF4C00; --lr-sans:'Rules',Arial,sans-serif;
  display:flex; align-items:center; gap:16px; padding:15px 0; margin:26px 0 34px;
  border-top:1px solid var(--lr-ink); border-bottom:1px solid rgba(1,16,21,.17);
  font-family:var(--lr-sans); color:var(--lr-ink); }
#lrap .lrap-btn { width:44px; height:44px; flex:0 0 44px; border-radius:999px; border:1px solid var(--lr-ink);
  background:none; color:var(--lr-ink); cursor:pointer; display:grid; place-items:center; padding:0; }
#lrap .lrap-btn:hover { border-color:var(--lr-or); color:var(--lr-or); }
#lrap .lrap-btn svg { width:15px; height:15px; fill:currentColor; display:block; }
#lrap.on .lrap-ic-play { display:none; }
#lrap:not(.on) .lrap-ic-pause { display:none; }
#lrap .lrap-meta { flex:1; min-width:0; display:flex; flex-direction:column; gap:7px; }
#lrap .lrap-lbl { font-size:10px; font-weight:500; letter-spacing:.18em; text-transform:uppercase; }
#lrap .lrap-bar { height:2px; background:rgba(1,16,21,.12); position:relative; cursor:pointer; }
#lrap .lrap-bar::before { content:""; position:absolute; inset:-8px 0; }
#lrap .lrap-fill { position:absolute; top:0; bottom:0; left:0; width:0%; background:var(--lr-or); }
#lrap .lrap-ai { font-size:9px; letter-spacing:.14em; text-transform:uppercase; color:var(--lr-ink40); }
#lrap .lrap-time { font-size:9.5px; letter-spacing:.08em; color:rgba(1,16,21,.38); font-variant-numeric:tabular-nums; }
#lrap .lrap-skip { width:36px; height:36px; flex:0 0 36px; border-radius:999px; border:1px solid rgba(1,16,21,.4);
  background:none; color:var(--lr-ink); cursor:pointer; font-family:var(--lr-sans); font-size:8.5px; font-weight:500; letter-spacing:.04em; padding:0; }
#lrap .lrap-rate { flex:0 0 auto; align-self:center; border:1px solid rgba(1,16,21,.4); border-radius:999px; background:none;
  color:var(--lr-ink); cursor:pointer; font-family:var(--lr-sans); font-size:9.5px; font-weight:500; letter-spacing:.08em;
  padding:7px 11px; font-variant-numeric:tabular-nums; }
#lrap .lrap-skip:hover, #lrap .lrap-rate:hover { border-color:var(--lr-or); color:var(--lr-or); }
.lrft-ln { display:flex; align-items:baseline; gap:16px; padding:13px 0; border-bottom:1px solid rgba(1,16,21,.08); }
.lrft-ln .ln-no { flex:0 0 34px; font-family:var(--lr-sans); font-size:10px; font-weight:500; letter-spacing:.1em; color:var(--lr-or); }
.lrft-ln .ln-t { flex:1 1 auto; min-width:0; font-family:var(--lr-sans); font-weight:500; letter-spacing:-.02rem; font-size:16.5px; line-height:1.25; }
.lrft-ln:hover .ln-t { color:var(--lr-or); }
.lrft-ln .ln-len, .lrft-ln .ln-badge { font-family:var(--lr-sans); font-size:9.5px; font-weight:500; letter-spacing:.13em; text-transform:uppercase; color:rgba(1,16,21,.38); white-space:nowrap; }
.lrft-ln .ln-badge { border:1px solid var(--lr-or); color:var(--lr-or); border-radius:999px; padding:2px 8px 1px; }
.lrft-tl .tl-y { flex:0 0 84px; }
#lrmg { position:absolute; top:0; pointer-events:none; }
#lrmg .lrmg-note { position:absolute; display:block; width:100%; pointer-events:auto; text-decoration:none;
  border-left:2px solid var(--lr-or); padding:2px 0 2px 14px; opacity:0; transform:translateY(6px);
  animation:lrmg-in .7s ease forwards; }
#lrmg .lrmg-note:nth-child(2) { animation-delay:.15s; } #lrmg .lrmg-note:nth-child(3) { animation-delay:.3s; }
#lrmg .lrmg-note:nth-child(4) { animation-delay:.45s; }
@keyframes lrmg-in { to { opacity:1; transform:none; } }
#lrmg .lrmg-lbl { display:block; font-family:var(--lr-sans); font-size:8.5px; font-weight:500; letter-spacing:.18em;
  text-transform:uppercase; color:var(--lr-or); margin-bottom:6px; }
#lrmg .lrmg-q { display:block; font-family:var(--lr-serif); font-size:14.5px; line-height:1.45; color:var(--lr-ink); }
#lrmg .lrmg-note:hover .lrmg-q { color:var(--lr-or); }
#lrmg .lrmg-s { display:block; font-family:var(--lr-sans); font-size:8.5px; font-weight:500; letter-spacing:.12em;
  text-transform:uppercase; color:rgba(1,16,21,.4); margin-top:7px; }
@media(max-width:1180px){ #lrmg { display:none; } }

.lrft-ln .ln-sh { flex:1 1 100%; font-family:var(--lr-serif); font-style:italic; font-size:13.5px; color:rgba(1,16,21,.38); margin-top:2px; }
@media(max-width:640px){ .lrft-ln { flex-wrap:wrap; } }
#lrtopbar { position:sticky; top:var(--lrw-navh,0px); z-index:60; background:#EFE9D8;
  border-bottom:1px solid transparent; transition:border-color .25s ease, background .25s ease; }
#lrtopbar.stuck { border-bottom-color:rgba(1,16,21,.17); background:rgba(244,241,230,.94); backdrop-filter:blur(8px) saturate(1.1); }
#lrtopbar .util { display:flex; align-items:center; justify-content:space-between; gap:30px; padding:17px 0 16px; }
#lrtopbar .util nav { display:flex; gap:26px; flex:1 1 auto; min-width:0; overflow-x:auto;
  scrollbar-width:none; -ms-overflow-style:none; justify-content:flex-end; }
#lrtopbar .util nav::-webkit-scrollbar { display:none; }
#lrtopbar .util nav a { font-family:'Rules',Helvetica,Arial,sans-serif; font-size:11.5px; letter-spacing:.04em; padding-bottom:2px; border-bottom:1px solid transparent; white-space:nowrap; }
#lrtopbar .util nav a:hover { border-color:#011015; }
#lrtopbar .util .right { display:flex; align-items:center; gap:18px; }
.die-btn { display:inline-flex; align-items:center; gap:11px; cursor:pointer; }
.die-wrap { display:inline-block; position:relative; line-height:0; will-change:transform;
  transform-origin:50% 60%; }
.die-svg { display:block; overflow:visible; }
.die-body { fill:#F7F4EA; stroke:#011015; stroke-width:1.6; transition:fill .2s; }
.die-pip { fill:#011015; transition:fill .2s; }
.die-face { display:none; }
.die-face.is-on { display:block; }
.die-lbl { font-family:'Rules',Helvetica,Arial,sans-serif; font-size:10px; font-weight:500; letter-spacing:.16em; text-transform:uppercase; }
.die-shadow { position:absolute; left:50%; bottom:-7px; width:76%; height:4px; translate:-50% 0;
  background:rgba(1,16,21,.26); border-radius:50%; filter:blur(2.5px); }
#lrtopbar .tb-search { display:flex; align-items:center; border-bottom:1px solid rgba(1,16,21,.3); padding:3px 2px; width:150px; transition:width .2s ease, border-color .2s ease; }
#lrtopbar .tb-search:focus-within { width:230px; border-color:#011015; }
#lrtopbar .tb-search input { border:0; background:none; outline:none; width:100%; font-family:'Ebgaramond','EB Garamond',Garamond,Georgia,serif; font-style:italic; font-size:13px; color:#011015; }
#lrtopbar #lrtopbar .util { padding:11px clamp(20px,4.4vw,80px) 10px; }
#lrtopbar nav { justify-content:flex-start; }
#lrtopbar { position:sticky; top:var(--lrw-navh,0px); z-index:60; background:#EFE9D8; }
#lrtopbar .util { max-width:1580px; margin:0 auto; padding:11px clamp(20px,4.4vw,80px) 10px; display:flex; align-items:center; justify-content:space-between; gap:22px; }
#lrtopbar nav { display:flex; gap:24px; flex:1 1 auto; min-width:0; overflow-x:auto; justify-content:flex-start; scrollbar-width:none; }
#lrtopbar nav::-webkit-scrollbar { display:none; }
@media(max-width:640px){ #lrtopbar .tb-search { display:none; } }
#lrtopbar { background:#EFE9D8; border-bottom:1px solid rgba(1,16,21,.17); }
#lrtopbar.stuck { background:rgba(239,233,216,.94); backdrop-filter:blur(8px) saturate(1.1); }
#lrtopbar a { color:#011015; text-decoration:none; }
#lrtopbar nav a { font-family:'Rules',Helvetica,Arial,sans-serif; font-size:11.5px; letter-spacing:.04em; padding-bottom:2px; border-bottom:1px solid transparent; white-space:nowrap; }
#lrtopbar nav a:hover { border-color:#011015; }
#lrtopbar .die-body { fill:none; stroke:#011015; stroke-width:2; }
#lrtopbar .die-pip { fill:#011015; }
#lrtopbar .die-lbl { font-family:'Rules',Helvetica,Arial,sans-serif; font-size:10px; font-weight:500; letter-spacing:.16em; text-transform:uppercase; color:#011015; }`;document.head.appendChild(st);var TOPBAR = "<header class=\"topbar\" id=\"lrtopbar\"> <div class=\"wrap util\"> <nav> <a href=\"/editorials#latest\">Latest</a> <a href=\"/editorials#interviews\">Interviews</a> <a href=\"/editorials#essays\">Essays</a> <a href=\"/editorials#dossiers\">Dossiers</a> <a href=\"/editorials#register\">Register</a> <a href=\"/editorials#register-pod\">Podcast</a> <a href=\"/editorials#subjects\">Subjects</a> <a href=\"/editorials#contributors\">Contributors</a> </nav> <div class=\"right\"> <label class=\"tb-search\"><input id=\"lrtb-q\" type=\"search\" placeholder=\"Search everything\u2026\" aria-label=\"Search editorials and episodes\"></label> <a class=\"die-btn js-die\" href=\"/editorials\" target=\"_blank\" rel=\"noopener\" aria-label=\"Open a random editorial\"><span class=\"die-wrap\"><svg class=\"die-svg\" width=\"26\" height=\"26\" viewBox=\"0 0 44 44\" aria-hidden=\"true\"> <rect class=\"die-body\" x=\"1\" y=\"1\" width=\"42\" height=\"42\" rx=\"9\"/> <g class=\"die-face\" data-f=\"1\"><circle class=\"die-pip\" cx=\"22\" cy=\"22\" r=\"4\"/></g> <g class=\"die-face\" data-f=\"2\"><circle class=\"die-pip\" cx=\"13\" cy=\"13\" r=\"4\"/><circle class=\"die-pip\" cx=\"31\" cy=\"31\" r=\"4\"/></g> <g class=\"die-face\" data-f=\"3\"><circle class=\"die-pip\" cx=\"12\" cy=\"12\" r=\"3.7\"/><circle class=\"die-pip\" cx=\"22\" cy=\"22\" r=\"3.7\"/><circle class=\"die-pip\" cx=\"32\" cy=\"32\" r=\"3.7\"/></g> <g class=\"die-face\" data-f=\"4\"><circle class=\"die-pip\" cx=\"13\" cy=\"13\" r=\"3.7\"/><circle class=\"die-pip\" cx=\"31\" cy=\"13\" r=\"3.7\"/><circle class=\"die-pip\" cx=\"13\" cy=\"31\" r=\"3.7\"/><circle class=\"die-pip\" cx=\"31\" cy=\"31\" r=\"3.7\"/></g> <g class=\"die-face is-on\" data-f=\"5\"><circle class=\"die-pip\" cx=\"13\" cy=\"13\" r=\"3.5\"/><circle class=\"die-pip\" cx=\"31\" cy=\"13\" r=\"3.5\"/><circle class=\"die-pip\" cx=\"22\" cy=\"22\" r=\"3.5\"/><circle class=\"die-pip\" cx=\"13\" cy=\"31\" r=\"3.5\"/><circle class=\"die-pip\" cx=\"31\" cy=\"31\" r=\"3.5\"/></g> <g class=\"die-face\" data-f=\"6\"><circle class=\"die-pip\" cx=\"13\" cy=\"11\" r=\"3.4\"/><circle class=\"die-pip\" cx=\"31\" cy=\"11\" r=\"3.4\"/><circle class=\"die-pip\" cx=\"13\" cy=\"22\" r=\"3.4\"/><circle class=\"die-pip\" cx=\"31\" cy=\"22\" r=\"3.4\"/><circle class=\"die-pip\" cx=\"13\" cy=\"33\" r=\"3.4\"/><circle class=\"die-pip\" cx=\"31\" cy=\"33\" r=\"3.4\"/></g> </svg><span class=\"die-shadow\"></span></span><span class=\"die-lbl\">Random</span></a> </div> </div> </header>";

(function () {
  var DATA_URL = 'https://raw.githubusercontent.com/monkantony/lr-media/main/footer_data.txt';
  var GROUPS = [['p','People'],['w','Works'],['x','Exhibitions'],['o','Organisations'],['pl','Places'],['t','Techniques'],['th','Themes']];
  var slug = location.pathname.replace(/\/+$/,'').split('/').pop();
  var box = document.getElementById('lrft');
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); }
  function art(s){ return '/editorial/' + s; }
  var SUBJ = '/editorials#subject={n}';
  fetch(DATA_URL).then(function(r){ return r.text(); }).then(function(t){
    var data = JSON.parse(t);
    var me = data.foot[slug]; if (!me) return;
    var A = data.arts, mine = A[slug];
    var bySlugN = {}; for (var s in A) bySlugN[A[s][0]] = s;
    var html = '';
    var grps = '';
    GROUPS.forEach(function(g){
      var names = me.m[g[0]]; if (!names || !names.length) return;
      grps += '<div class="lrft-grp"><b>' + g[1] + '</b><span class="lrft-chips">'
        + names.map(function(n){ return n[1] ? '<a class="lrft-chip on" href="' + SUBJ.replace('{n}', esc(String(n[0]).toLowerCase())) + '">' + esc(n[0]) + '</a>' : '<span class="lrft-chip">' + esc(n[0]) + '</span>'; }).join('')
        + '</span></div>';
    });
    if (grps) html += '<section class="lrft-zone"><h2 class="lrft-lbl">Mentioned in this editorial</h2>' + grps + '</section>';
    var cards = me.rn.map(function(p){
      var r = A[p[0]]; if (!r) return '';
      var fig = r[5] ? '<figure><img src="' + esc(r[5]) + '" alt="' + esc(r[2]) + '" loading="lazy"></figure>' : '';
      return '<a class="lrft-card" href="' + art(p[0]) + '">' + fig
        + '<span class="lrft-meta"><em>' + ('000' + r[0]).slice(-3) + '</em>' + esc(r[1]) + ' · ' + esc(r[3]) + '</span>'
        + '<h3>' + esc(r[2]) + '</h3><span class="lrft-by">By ' + esc(r[4]) + '</span>'
        + '<span class="lrft-sh">Shared subjects: ' + esc(p[1].join(', ')) + '</span></a>';
    }).join('');
    if (cards) html += '<section class="lrft-zone"><h2 class="lrft-lbl">Read next</h2><div class="lrft-rn">' + cards + '</div></section>';
    var lnRows = (me.ln || []).map(function(l){
      return '<a class="lrft-ln" href="/editorials#pod=' + l[0] + '">'
        + '<span class="ln-no">' + ('0' + l[0]).slice(-2) + '</span>'
        + '<span class="ln-t">' + esc(l[1]) + '</span>'
        + '<span class="ln-badge">Listen</span>'
        + '<span class="ln-len">' + Math.round((l[2] || 0) / 60) + ' min</span>'
        + '<span class="ln-sh">Shared subjects: ' + esc((l[3] || []).join(', ')) + '</span></a>';
    }).join('');
    if (lnRows) html += '<section class="lrft-zone"><h2 class="lrft-lbl">Listen next</h2>' + lnRows + '</section>';
    var tlRows = (me.tl || []).map(function(m){
      return '<a class="lrft-ln lrft-tl" href="https://timeline.lerandom.art/#/chapter-' + m[3] + '" target="_blank" rel="noopener">'
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
  /* the editorials header, carried onto the article pages */
  (function(){
    if (document.getElementById('lrtopbar')) return;
    var host = document.querySelector('.navbar_component');
    var bar = document.createElement('div');
    bar.innerHTML = TOPBAR;
    bar = bar.firstElementChild;
    if (host && host.parentNode) host.parentNode.insertBefore(bar, host.nextSibling);
    else document.body.insertBefore(bar, document.body.firstChild);
    var nav = document.querySelector('.navbar_component');
    function navh(){
      if (nav && getComputedStyle(nav).position === 'fixed')
        document.documentElement.style.setProperty('--lrw-navh', nav.getBoundingClientRect().height + 'px');
    }
    navh(); addEventListener('resize', navh, {passive:true});
    var back = document.querySelector('a.button.is-link.is-icon');
    if (back && back.getAttribute('href') === '/editorials') back.style.marginTop = '30px';
    var q = document.getElementById('lrtb-q');
    if (q) {
      var go = function(){
        var v = q.value.trim();
        if (v) location.href = '/editorials#q=' + encodeURIComponent(v);
      };
      q.addEventListener('keydown', function(e){ if (e.key === 'Enter') go(); });
      q.addEventListener('search', go);
    }
    var SLUGS = null;
    [].forEach.call(bar.querySelectorAll('.js-die'), function(el){
      var faces = [].slice.call(el.querySelectorAll('.die-face'));
      function face(n){ faces.forEach(function(g,i){ g.classList.toggle('is-on', i === n-1); }); }
      face(5);
      el.addEventListener('pointerdown', function(){
        var keys = Object.keys(data.arts);
        el.href = '/editorial/' + keys[Math.floor(Math.random()*keys.length)];
      });
    });
  })();



  /* ---------- marginalia: the archive whispers alongside the text ---------- */
  (function(){
    function mount(){
    if (innerWidth < 1180) return;
    var body = document.querySelector('.text-garamond.w-richtext') || document.querySelector('.text-garamond');
    if (!body) return;
    var host = body.closest('div') || body.parentElement;
    var br = body.getBoundingClientRect();
    /* the article template is sidebar-left / body-right: the room is usually LEFT of the text */
    var gr = innerWidth - br.right, gl = br.left;
    var side = gl > gr ? 'left' : 'right';
    var gutter = Math.max(gl, gr);
    if (gutter < 250) return;
    var w = Math.min(300, gutter - 56);
    fetch('https://raw.githubusercontent.com/monkantony/lr-media/main/reading.json')
      .then(function(r){ return r.json(); }).then(function(deck){
        var byslug = {}, byep = {};
        deck.articles.forEach(function(a){ (byslug[a[0]] = byslug[a[0]] || []).push(a); });
        deck.moments.forEach(function(m){ (byep[m[0]] = byep[m[0]] || []).push(m); });
        var notes = [];
        (me.rn || []).forEach(function(p){
          var qs = byslug[p[0]];
          if (qs) { var q = qs[Math.floor(Math.random() * qs.length)];
            notes.push({ q: q[4], s: q[5] + ' \u00b7 ' + q[1], href: '/editorial/' + q[0], lbl: 'Elsewhere in the archive' }); }
        });
        (me.ln || []).forEach(function(l){
          var ms = byep[l[0]];
          if (ms) { var m = ms[Math.floor(Math.random() * ms.length)];
            notes.push({ q: m[2], s: m[3] + ' \u00b7 Episode ' + ('0' + m[0]).slice(-2), href: '/editorials#pod=' + m[0], lbl: 'Said on the podcast' }); }
        });
        (me.tl || []).slice(0, 1).forEach(function(m){
          notes.push({ q: m[1], s: m[2] || 'The timeline', href: 'https://timeline.lerandom.art/#/chapter-' + m[3], lbl: 'Deep history', ext: 1 });
        });
        notes = notes.slice(0, 4);
        if (!notes.length) return;
        var wrap = document.createElement('div');
        wrap.id = 'lrmg';
        wrap.style.width = w + 'px';
        wrap.style[side] = -(w + 36) + 'px';
        host.style.position = host.style.position || 'relative';
        var bTop = body.offsetTop, bH = body.offsetHeight;
        /* left side carries the author sidebar up top — start the notes below it */
        var stops = side === 'left' ? [0.3, 0.5, 0.7, 0.88] : [0.14, 0.42, 0.68, 0.88];
        wrap.innerHTML = notes.map(function(n, i){
          return '<a class="lrmg-note" ' + (n.ext ? 'target="_blank" rel="noopener" ' : '')
            + 'href="' + n.href.replace(/"/g, '&quot;') + '" style="top:' + Math.round(bTop + bH * stops[i]) + 'px">'
            + '<span class="lrmg-lbl">' + n.lbl + '</span>'
            + '<span class="lrmg-q">\u201C' + String(n.q).replace(/&/g,'&amp;').replace(/</g,'&lt;') + '\u201D</span>'
            + '<span class="lrmg-s">' + String(n.s).replace(/&/g,'&amp;').replace(/</g,'&lt;') + '</span></a>';
        }).join('');
        host.appendChild(wrap);
      }).catch(function(){});
    }
    /* measure only once layout is settled (fonts + images move the column) */
    if (document.readyState === 'complete') setTimeout(mount, 300);
    else addEventListener('load', function(){ setTimeout(mount, 300); }, { once: true });
  })();

  /* ---------- the author box links to the author's page ---------- */
  (function(){
    var r = data.arts[slug]; if (!r || !r[4]) return;
    var href = '/editorials#writer=' + encodeURIComponent(String(r[4]).toLowerCase());
    ['.blog-post5-content_author-wrapper', '.author-about'].forEach(function(sel){
      [].forEach.call(document.querySelectorAll(sel), function(el){
        if (el.closest('a') || el.dataset.lrWriter) return;
        el.dataset.lrWriter = '1';
        el.style.cursor = 'pointer';
        el.setAttribute('role', 'link');
        el.setAttribute('tabindex', '0');
        el.setAttribute('aria-label', 'All editorials by ' + r[4]);
        function go(){ location.href = href; }
        el.addEventListener('click', go);
        el.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
        el.addEventListener('mouseenter', function(){ el.style.opacity = '.72'; });
        el.addEventListener('mouseleave', function(){ el.style.opacity = ''; });
      });
    });
  })();

  /* ---------- Article structured data, built from the payload already fetched ---------- */
  (function(){
    var r = data.arts[slug]; if (!r) return;
    var ORIGIN = location.origin;
    var ld = {
      '@context': 'https://schema.org', '@type': 'Article',
      'headline': r[2], 'datePublished': r[3],
      'author': { '@type': 'Person', 'name': r[4] },
      'publisher': { '@type': 'Organization', 'name': 'Le Random', 'url': ORIGIN },
      'mainEntityOfPage': { '@type': 'WebPage', '@id': ORIGIN + '/editorial/' + slug },
      'url': ORIGIN + '/editorial/' + slug,
      'isPartOf': { '@type': 'CollectionPage', 'name': 'Le Random Editorials', 'url': ORIGIN + '/editorials' }
    };
    if (r[5]) ld.image = r[5];
    if (me.au) ld.audio = { '@type': 'AudioObject', 'contentUrl': me.au[0],
                            'duration': 'PT' + Math.round(me.au[1] / 60) + 'M',
                            'description': 'AI-generated audio edition' };
    var m = me.m || {}, subj = [];
    ['p','w','o','pl','t','th'].forEach(function(k){
      (m[k] || []).forEach(function(n){ if (subj.length < 24) subj.push(n[0]); });
    });
    if (subj.length) ld.about = subj.map(function(n){ return { '@type': 'Thing', 'name': n }; });
    var el = document.createElement('script');
    el.type = 'application/ld+json'; el.id = 'lrft-ld';
    el.textContent = JSON.stringify(ld);
    document.head.appendChild(el);
  })();

    if (me.au) { try { player(me.au[0], me.au[1]); } catch (e) { /* no player beats a broken page */ } }
  }).catch(function(){ /* no footer beats a broken footer */ });
  function player(url, secs) {
    var host = document.querySelector('.text-garamond');
    if (!host || document.getElementById('lrap')) return;
    var el = document.createElement('div'); el.id = 'lrap';
    el.innerHTML = '<button class="lrap-skip lrap-b15" type="button" aria-label="Back 15 seconds">&#8722;15</button>'
      + '<button class="lrap-btn" type="button" aria-label="Play audio">'
      + '<svg class="lrap-ic-play" viewBox="0 0 16 16"><path d="M3 1.5 14 8 3 14.5z"/></svg>'
      + '<svg class="lrap-ic-pause" viewBox="0 0 16 16"><path d="M3 1.5h3.6v13H3zM9.4 1.5H13v13H9.4z"/></svg></button>'
      + '<button class="lrap-skip lrap-f15" type="button" aria-label="Forward 15 seconds">+15</button>'
      + '<span class="lrap-meta"><span class="lrap-lbl">Listen to this editorial &#183; ' + Math.round(secs / 60) + ' min</span>'
      + '<span class="lrap-ai">AI-generated components &#183; LR Pod theme by Rami Awad</span>'
      + '<span class="lrap-bar"><span class="lrap-fill"></span></span>'
      + '<span class="lrap-time">0:00 / ' + fmt(secs) + '</span></span>'
      + '<button class="lrap-rate" type="button" aria-label="Playback speed">1&#215;</button>';
    host.parentNode.insertBefore(el, host);
    var a = new Audio(); a.preload = 'none'; a.src = url;
    var fill = el.querySelector('.lrap-fill'), time = el.querySelector('.lrap-time');
    function fmt(t) { t = Math.max(0, Math.round(t)); var mm = Math.floor(t / 60), ss = t % 60; return mm + ':' + (ss < 10 ? '0' : '') + ss; }
    function dur() { return a.duration && isFinite(a.duration) ? a.duration : secs; }
    function seekBy(d) {
      var go = function () { a.currentTime = Math.min(dur(), Math.max(0, a.currentTime + d)); };
      if (a.readyState >= 1) { go(); } else { a.addEventListener('loadedmetadata', go, { once: true }); a.load(); }
    }
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
    a.addEventListener('play', function () { el.classList.add('on'); });
    a.addEventListener('pause', function () { el.classList.remove('on'); });
    a.addEventListener('ended', function () { el.classList.remove('on'); a.currentTime = 0; });
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
})();