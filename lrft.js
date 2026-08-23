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
`;document.head.appendChild(st);
(function () {
  var DATA_URL = 'https://raw.githubusercontent.com/monkantony/lr-media/main/footer_data.txt';
  var GROUPS = [['p','People'],['w','Works'],['o','Organisations'],['pl','Places'],['t','Techniques'],['th','Themes']];
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
    var prv = bySlugN[mine[0] - 1], nxt = bySlugN[mine[0] + 1];
    html += '<nav class="lrft-pn">'
      + (prv ? '<a href="' + art(prv) + '"><span class="lrft-dir">&#8592; Previous · ' + ('000' + A[prv][0]).slice(-3) + '</span><span class="lrft-t">' + esc(A[prv][2]) + '</span></a>' : '<span></span>')
      + (nxt ? '<a href="' + art(nxt) + '"><span class="lrft-dir">Next · ' + ('000' + A[nxt][0]).slice(-3) + ' &#8594;</span><span class="lrft-t">' + esc(A[nxt][2]) + '</span></a>'
             : '<a href="/editorials"><span class="lrft-dir">Next · the newest</span><span class="lrft-t">You are reading the latest editorial. Browse the archive</span></a>')
      + '</nav>';
    box.innerHTML = html;
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