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
.lrft-ln { display:grid; grid-template-columns:44px minmax(0,1fr) 72px 64px; column-gap:16px; align-items:baseline; padding:13px 0; border-bottom:1px solid rgba(1,16,21,.08); }
.lrft-ln .ln-no { font-family:var(--lr-sans); font-size:10px; font-weight:500; letter-spacing:.1em; color:var(--lr-or); }
.lrft-ln .ln-t { min-width:0; font-family:var(--lr-sans); font-weight:500; letter-spacing:-.02rem; font-size:16.5px; line-height:1.25; }
.lrft-ln .ln-badge { justify-self:start; }
.lrft-ln .ln-len { justify-self:end; }
.lrft-ln:hover .ln-t { color:var(--lr-or); }
.lrft-ln .ln-len, .lrft-ln .ln-badge { font-family:var(--lr-sans); font-size:9.5px; font-weight:500; letter-spacing:.13em; text-transform:uppercase; color:rgba(1,16,21,.38); white-space:nowrap; }
.lrft-ln .ln-badge { border:1px solid var(--lr-or); color:var(--lr-or); border-radius:999px; padding:2px 8px 1px; }
.lrft-tl { grid-template-columns:84px minmax(0,1fr) 72px 64px; }
.lrmg-in { display:block; width:100%; margin:34px 0; box-sizing:border-box;
  border:1px solid var(--lr-ink) !important; box-shadow:6px 7px 0 rgba(1,16,21,.1) !important;
  background:#F7F4EA !important; padding:20px 24px 18px !important; font-family:var(--lr-serif); }
.lr-sl { color:inherit; text-decoration:none; border-bottom:1px solid rgba(2,176,244,.5); transition:border-color .2s ease, color .2s ease; }
.lr-sl:hover { color:var(--lr-or); border-bottom-color:var(--lr-or); }
.lrmg-in a { display:block; text-decoration:none; }
.lrmg-in .lrmg-lbl { display:block; font-family:var(--lr-sans); font-size:8.5px; font-weight:500; letter-spacing:.18em;
  text-transform:uppercase; color:var(--lr-or); margin-bottom:6px; }
.lrmg-in .lrmg-q { display:block; font-size:17px; line-height:1.5; color:var(--lr-ink); max-width:64ch; transition:color .2s; }
.lrmg-in .lrmg-s { display:block; font-family:var(--lr-sans); font-size:11px; font-weight:500; letter-spacing:.12em;
  text-transform:uppercase; color:var(--lr-ink); margin-top:12px; padding-top:10px; border-top:1px solid rgba(1,16,21,.15); transition:color .2s; }
.lrmg-in .lrmg-s::after { content:' →'; }
.lrmg-in a:hover .lrmg-q, .lrmg-in a:hover .lrmg-s { color:#02B0F4; }

.lrft-ln .ln-sh { grid-column:2 / -1; font-family:var(--lr-serif); font-style:italic; font-size:13.5px; color:rgba(1,16,21,.5); margin-top:2px; }
.lrft-tl .tl-y { grid-column:1; }
@media(max-width:640px){ .lrft-ln { grid-template-columns:44px minmax(0,1fr); } .lrft-ln .ln-badge, .lrft-ln .ln-len { grid-column:2; justify-self:start; } }

/* ---------- the editorials utility bar, carried onto the article pages ---------- */
@font-face { font-family:'Rules'; src:url('https://cdn.prod.website-files.com/640f56f772eeb36cc6880d91/640f62c343c4c811e1a8e5c6_Rules-Regular.woff') format('woff'); font-weight:400; font-display:swap; }
@font-face { font-family:'Rules'; src:url('https://cdn.prod.website-files.com/640f56f772eeb36cc6880d91/640f62c34eb91d0ed0988906_Rules-Medium.woff') format('woff'); font-weight:500; font-display:swap; }
@font-face { font-family:'Rules'; src:url('https://cdn.prod.website-files.com/640f56f772eeb36cc6880d91/640f62c327b0745f3329c484_Rules-Bold.woff') format('woff'); font-weight:700; font-display:swap; }
#lrtopbar *, #lrtopbar *::before, #lrtopbar *::after { margin:0; padding:0; box-sizing:border-box; }
#lrtopbar { box-sizing:border-box; color:#011015; font-family:'Ebgaramond','Ebgaramond','EB Garamond',Garamond,Georgia,serif; font-size:18px;
  line-height:1.5; -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility; }
#lrtopbar a { color:inherit; text-decoration:none; }
#lrtopbar :focus-visible { outline:2px solid #FF4C00; outline-offset:3px; }
#lrtopbar .wrap { max-width:1580px; margin:0 auto; padding-inline:clamp(20px,4.4vw,80px); }

/* .topbar */
#lrtopbar { position:sticky; top:var(--lrw-navh,0px); z-index:60; background:#EFE9D8;
  border-bottom:1px solid transparent; transition:border-color .25s ease, background .25s ease; }
/* one bar: on wide screens the toolbar rises into the navbar band, between logo and burger */
@media(min-width:1160px){
  #lrtopbar { position:fixed; top:0; left:0; right:0; height:var(--lrw-navh,70px); z-index:900;
    display:flex; align-items:center; padding-left:215px; padding-right:64px; }
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
`;document.head.appendChild(st);var TOPBAR = "<header class=\"topbar\" id=\"lrtopbar\"><span class=\"tb-prog\" aria-hidden=\"true\"></span> <div class=\"wrap util\"> <nav> <a href=\"/editorials#latest\">Latest</a> <a href=\"/editorials#calendar\">Upcoming</a> <a href=\"/editorials#interviews\">Interviews</a> <a href=\"/editorials#essays\">Essays</a> <a href=\"/editorials#dossiers\">Sets</a> <a href=\"/editorials#register\">Archive</a> <a href=\"/editorials#subjects\">Subjects</a> <a href=\"/editorials#contributors\">Contributors</a> </nav> <div class=\"right\"> <label class=\"tb-search\"><input id=\"lrtb-q\" type=\"search\" placeholder=\"Search everything\u2026\" aria-label=\"Search editorials and episodes\"></label> <a class=\"die-btn js-die\" href=\"/editorials\" target=\"_blank\" rel=\"noopener\" aria-label=\"Open a random editorial\"><span class=\"die-wrap\"><svg class=\"die-svg\" width=\"26\" height=\"26\" viewBox=\"0 0 44 44\" aria-hidden=\"true\"> <rect class=\"die-body\" x=\"1\" y=\"1\" width=\"42\" height=\"42\" rx=\"9\"/> <g class=\"die-face\" data-f=\"1\"><circle class=\"die-pip\" cx=\"22\" cy=\"22\" r=\"4\"/></g> <g class=\"die-face\" data-f=\"2\"><circle class=\"die-pip\" cx=\"13\" cy=\"13\" r=\"4\"/><circle class=\"die-pip\" cx=\"31\" cy=\"31\" r=\"4\"/></g> <g class=\"die-face\" data-f=\"3\"><circle class=\"die-pip\" cx=\"12\" cy=\"12\" r=\"3.7\"/><circle class=\"die-pip\" cx=\"22\" cy=\"22\" r=\"3.7\"/><circle class=\"die-pip\" cx=\"32\" cy=\"32\" r=\"3.7\"/></g> <g class=\"die-face\" data-f=\"4\"><circle class=\"die-pip\" cx=\"13\" cy=\"13\" r=\"3.7\"/><circle class=\"die-pip\" cx=\"31\" cy=\"13\" r=\"3.7\"/><circle class=\"die-pip\" cx=\"13\" cy=\"31\" r=\"3.7\"/><circle class=\"die-pip\" cx=\"31\" cy=\"31\" r=\"3.7\"/></g> <g class=\"die-face is-on\" data-f=\"5\"><circle class=\"die-pip\" cx=\"13\" cy=\"13\" r=\"3.5\"/><circle class=\"die-pip\" cx=\"31\" cy=\"13\" r=\"3.5\"/><circle class=\"die-pip\" cx=\"22\" cy=\"22\" r=\"3.5\"/><circle class=\"die-pip\" cx=\"13\" cy=\"31\" r=\"3.5\"/><circle class=\"die-pip\" cx=\"31\" cy=\"31\" r=\"3.5\"/></g> <g class=\"die-face\" data-f=\"6\"><circle class=\"die-pip\" cx=\"13\" cy=\"11\" r=\"3.4\"/><circle class=\"die-pip\" cx=\"31\" cy=\"11\" r=\"3.4\"/><circle class=\"die-pip\" cx=\"13\" cy=\"22\" r=\"3.4\"/><circle class=\"die-pip\" cx=\"31\" cy=\"22\" r=\"3.4\"/><circle class=\"die-pip\" cx=\"13\" cy=\"33\" r=\"3.4\"/><circle class=\"die-pip\" cx=\"31\" cy=\"33\" r=\"3.4\"/></g> </svg><span class=\"die-shadow\"></span></span><span class=\"die-lbl\">Roll for an editorial</span></a> </div> </div> </header>";
var AUDIO = {"a-a-murakami-on-existence-as-medium":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/152.m4a",870],"a-mean-defense":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/083.m4a",750],"a-michael-noll-on-when-it-all-started":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/078.m4a",1035],"aa-cavia-on-summoning-worlds":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/104.m4a",933],"aaron-hertzmann-on-caring-about-people":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/131.m4a",956],"agh-on-glorifying-the-computer":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/024.m4a",1073],"agnieszka-kurant-on-alien-thoughts":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/155.m4a",872],"ana-maria-caballeros-paperwork":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/020.m4a",149],"analivia-cordeiro-on-perpetual-motion":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/053.m4a",826],"artificial-and-human-intelligence":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/048.m4a",594],"avery-singer-on-the-dopamine-blowout":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/136.m4a",987],"barbara-london-on-new-territory":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/074.m4a",1559],"beeple-on-infinite-creation-machines":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/087.m4a",1369],"beeple-on-robot-dogs-as-canvas":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/112.m4a",929],"bright-moments-on-prioritizing-the-personal":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/041.m4a",1188],"can-art-replace-religion":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/055.m4a",1175],"casey-reas-lauren-lee-mccarthy-chandler-mcwilliams-on-expanding-software":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/058.m4a",814],"casey-reas-on-the-history-of-generative-art-part-2":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/003.m4a",863],"christiane-paul-on-curating-cohens-aaron":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/029.m4a",1343],"christiane-paul-on-defining-ai-art":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/079.m4a",1026],"claudia-hart-on-land-of-the-dead":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/105.m4a",646],"cognitive-technologies":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/094.m4a",539],"colette-bangert-on-growing-visually":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/044.m4a",546],"commentary-by-mark-wilson":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/036.m4a",356],"concrete-to-generative-real-space-explorations-in-south-america":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/019.m4a",567],"copper-giloth-on-video-games-to-video-art":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/100.m4a",737],"deafbeef-on-impermanence":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/013.m4a",1030],"deafbeef-on-vernacular-in-a-standardized-age":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/090.m4a",536],"decoupling-generative-art-with-philip-galanter":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/009.m4a",658],"demystifying-generative-aesthetics":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/037.m4a",1599],"demystifying-generative-art":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/005.m4a",1241],"demystifying-generative-autonomy":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/070.m4a",1463],"demystifying-generative-systems":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/049.m4a",1471],"dmitri-cherniak-on-strictly-for-art":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/084.m4a",1090],"drifella-iii-room-for-complexity":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/102.m4a",1516],"dx-research-group-on-the-agent-arena":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/124.m4a",1346],"ed-fornieles-on-art-as-human-sacrifice":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/132.m4a",528],"eli-scheinman-on-amplifying-the-digital":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/111.m4a",666],"embodying-ai-at-neurips-2025-creative-ai-track":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/117.m4a",1091],"emily-xie-on-textile-as-personal-canvas":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/038.m4a",1064],"eva-and-franco-mattes-on-mega-eliza":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/146.m4a",542],"evil-biscuit-on-card-nft-2-destruction-rebirth":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/139.m4a",1151],"feels-like-home-a-curatorial-statement":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/002.m4a",189],"frieder-nake-on-machinic-miracles":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/052.m4a",1063],"gendering-systems":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/057.m4a",754],"generations-of-verse":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/004.m4a",651],"golan-levin-on-the-potentiality-of-blobs":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/026.m4a",1355],"gottfried-jager-on-a-new-kind-of-being":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/125.m4a",774],"hans-ulrich-obrist-on-exhibitions-as-living-organisms":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/097.m4a",848],"hito-steyerl-on-how-it-uses-us":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/091.m4a",442],"holly-herndon-mat-dryhurst-on-artificial-psychedelia":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/110.m4a",1215],"ian-cheng-on-composing-with-systems":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/118.m4a",836],"ian-goodfellow-on-inventing-gans":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/107.m4a",1420],"illuminating-marfa":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/017.m4a",542],"infinite-images-finite-control":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/092.m4a",783],"inside-qubibis-shinjuku-studio":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/071.m4a",1800],"jakob-kudsk-steensen-on-non-human-pathways":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/137.m4a",1102],"jane-veeder-on-loving-change":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/133.m4a",991],"jared-madere-and-fairybaby-on-vvv-and-the-world-as-material":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/149.m4a",1333],"jason-bailey-georg-bak-kate-vass-on-the-art-form-of-our-generation":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/046.m4a",896],"jen-lowe-and-patricio-gonzalez-vivo-on-democratizing-knowledge":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/045.m4a",831],"jess-tucker-on-longing-for-a-face":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/108.m4a",819],"joan-heemskerk-on-quantum-web4":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/059.m4a",1184],"john-gerrard-on-ecology-technology-power":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/140.m4a",906],"john-maeda-on-computational-evolution":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/054.m4a",652],"john-provencher-and-raster-on-generative-identity":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/154.m4a",589],"juan-rodriguez-garcia-on-inhabiting-the-moment":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/096.m4a",616],"julia-kaganskiy-on-generativitys-deeper-consideration":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/088.m4a",989],"justin-aversano-on-heart-and-light":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/144.m4a",662],"karl-sims-alexander-mordvintsev-on-merging-technology-and-biology":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/109.m4a",1085],"kate-vass-on-rethinking-art-collecting":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/008.m4a",795],"keiken-on-the-worldbuilding-lens":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/130.m4a",846],"kevin-mccoy-on-bridging-net-art-and-blockchain":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/043.m4a",993],"kim-asendorf-on-breaking-his-own-rules":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/126.m4a",912],"kim-asendorf-on-elegant-symbiosis":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/073.m4a",1149],"kyle-mcdonald-on-computer-softness":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/129.m4a",1123],"larry-cuba-on-choreographing-form":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/051.m4a",1209],"larva-labs-on-computations-strangeness":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/101.m4a",989],"lauren-lee-mccarthy-on-software-values":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/030.m4a",987],"lawrence-lek-on-ai-reinventing-place":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/069.m4a",1622],"le-random-an-origin-story":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/000.m4a",517],"let-the-barbarians-in":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/142.m4a",676],"linda-dounia-on-memory-machines":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/031.m4a",1010],"living-aesthetics-a-grammar-of-protocol-art-and-worldbuilding":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/151.m4a",1518],"london-digital-art-guide":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/103.m4a",1639],"lowbie-and-duc-de-berry-on-log-and-the-nft-to-zine-pipeline":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/153.m4a",736],"lu-yang-on-art-as-the-perfect-cloak":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/121.m4a",1530],"machine-reverie":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/032.m4a",730],"machinic-taste":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/143.m4a",337],"marina-abramovic-on-new-possibilities":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/085.m4a",356],"mario-klingemann-a-i-c-c-a-on-alien-perspective":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/076.m4a",1723],"marlene-wenger-on-bringing-magic-back":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/148.m4a",686],"mat-dryhurst-on-becoming-infinite":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/064.m4a",1032],"matt-deslauriers-on-a-generative-world":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/067.m4a",1384],"matt-deslauriers-on-challenging-the-image":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/040.m4a",924],"matt-hall-and-john-watkinson-on-beginning-a-movement":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/061.m4a",1360],"maya-lin-on-systematic-naturalism":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/027.m4a",686],"maya-man-on-generative-meaning":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/012.m4a",884],"meandering-with-ai":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/080.m4a",508],"memo-akten-on-rituals-as-algorithms":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/145.m4a",1147],"michael-kozlowski-on-exploration-as-practice":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/042.m4a",664],"micky-malka-becky-kleiner-on-the-birth-of-node":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/119.m4a",1230],"mika-ben-amar-brennan-wojtyla-on":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/113.m4a",1000],"minne-atairu-on-shaping-our-own-image":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/095.m4a",1035],"molnars-paris":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/033.m4a",441],"mona-lisa-to-monogrid":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/034.m4a",847],"neural-unconscious":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/075.m4a",679],"new-york-city-digital-art-guide":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/081.m4a",1429],"node-fast-art-slow-looking":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/120.m4a",799],"object-misrecognition":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/082.m4a",616],"on-craft-art-programming":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/015.m4a",449],"operator-human-unreadable":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/022.m4a",1143],"operator-profiles-rebecca-allen":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/056.m4a",1406],"parker-ito-and-evil-biscuit-on-possessed-spirits":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/106.m4a",630],"post-generative-language-games":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/123.m4a",664],"post-human--ai-art":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/093.m4a",988],"rafael-rozendaal-on-a-liquid-canvas":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/072.m4a",1449],"reas-history-1":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/001.m4a",556],"reprogramming-sensory-habits":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/086.m4a",1029],"rhea-myers-on-code-as-cultural-material":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/014.m4a",505],"robbie-fitzpatrick-on-basel-social-club-welcoming-the-barbarians":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/150.m4a",1050],"samia-halaby-on-different-brushes":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/065.m4a",494],"sarah-meyohas-on-irreducibly-human":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/089.m4a",471],"sasha-stiles-and-martha-joseph-on-language-as-technology":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/098.m4a",1248],"sasha-stiles-on-writing-poets":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/028.m4a",1085],"seams-and-synthesis-schizocollage-and-ai-aesthetics":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/122.m4a",781],"seeing-machines-luba-elliott-on-the-2026-cvpr-art-gallery":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/138.m4a",1623],"shohei-fujimoto-on-remembering-space":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/134.m4a",775],"simon-denny-on-society-technology-and-art":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/060.m4a",957],"snowfro-and-ciphrd-on-a-symbiotic-relationship":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/023.m4a",1773],"sougwen-chung-on-aggregated-abandon":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/128.m4a",474],"sougwen-chung-on-us-in-another-form":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/016.m4a",524],"sputniko-on-activism-multitasking":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/066.m4a",1206],"standout-artwork-of-2025":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/114.m4a",752],"suzanne-treister-on-critical-futurism":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/068.m4a",849],"ten-moments-in-south-american-generative-art-history":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/021.m4a",589],"the-algorithmic-gaze-representations-of-women-in-ai-art":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/047.m4a",727],"the-cerebral-samba-protocol-art-worldbuilding-our-two-brains":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/135.m4a",660],"the-evolving-platform-ecosystem":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/006.m4a",554],"the-memoir-of-a-net-art-memoir":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/039.m4a",1320],"the-people-are-in-the-computer--part-i":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/077.m4a",1707],"the-ultraintelligent-machine-and-gaberbocchus-common-room":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/099.m4a",354],"the-zach-lieberman-commission-2":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/010.m4a",654],"then-and-now":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/050.m4a",313],"thoma-foundation-on-collecting-curiosity-conversation":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/141.m4a",677],"timeline-chapter-1-ten-top-moments":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/011.m4a",774],"travess-smalley-profiles-mark-wilson":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/035.m4a",1722],"trevor-paglen-trevor-paglen-on-technological-points-of-view":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/062.m4a",568],"tyler-hobbs-on-algorithmic-aesthetics":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/025.m4a",1282],"val-ravaglia-on-electric-dreams":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/063.m4a",1351],"wendi-yan-karyn-nakamura-on-the-artifice-of-knowledge":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/127.m4a",1062],"what-was-the-ai-psychosis-summit":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/147.m4a",1191],"william-mapan-on-breaking-the-medium":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/018.m4a",874],"zach-lieberman":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/007.m4a",889],"zero-10-part-1-beeple-casts-a-spell":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/115.m4a",517],"zero-10-part-2-fair-transparency":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/116.m4a",524]};

(function () {
  var DATA_URL = (window.LRW_RAW || 'https://raw.githubusercontent.com/monkantony/lr-media/main/') + 'footer_data.txt';
  var GROUPS = [['p','People'],['w','Works'],['x','Exhibitions'],['o','Organisations'],['pl','Places'],['t','Techniques'],['th','Themes']];
  var slug = location.pathname.replace(/\/+$/,'').split('/').pop();
  var box = document.getElementById('lrft');
  /* the player first, from the map inside this file: no wait for the footer data */
  try { if (typeof AUDIO !== 'undefined' && AUDIO[slug]) player(AUDIO[slug][0], AUDIO[slug][1]); } catch (e) {}
  /* lr-selfplace: the footer belongs directly below the article body. If the Embed was
     dropped above it (or anywhere else), move the whole embed wrapper there before rendering. */
  (function(){
    var b = document.querySelector('.text-garamond.w-richtext') || document.querySelector('.text-garamond');
    if (!box || !b || !b.parentNode) return;
    var n = box.parentNode && box.parentNode.classList && box.parentNode.classList.contains('w-embed') ? box.parentNode : box;
    if (n === b || n.contains(b)) return;
    var after = b.nextElementSibling;
    if (after === n) return;                      /* already in place */
    b.parentNode.insertBefore(n, b.nextSibling);
  })();
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
        + names.map(function(n){ return n[1] ? '<a class="lrft-chip on" href="/editorials#subject=' + encodeURIComponent(String(n[0]).toLowerCase()) + '">' + esc(n[0]) + '</a>' : '<span class="lrft-chip">' + esc(n[0]) + '</span>'; }).join('')
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
    var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
    /* sticky bar: show its rule only after scrolling, exactly as on the editorials page */
    (function(){
      /* lr-prog: the rule doubles as the article's reading-progress bar (see TOPBAR_CSS).
         0 while the bar's bottom edge is above the article text, 1 when it reaches the
         text's bottom. Both rects are read before any write, so it costs one layout per
         frame; the body is re-measured on viewport resize and whenever it changes size. */
      var lrBody = document.querySelector('.text-garamond.w-richtext') || document.querySelector('.text-garamond');
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
    if (back && back.getAttribute('href') === '/editorials') back.style.marginTop = '30px';
    /* the arrow returns the reader to the edition and position they left, like the browser's Back */
    if (back && back.getAttribute('href') === '/editorials') {
      try {
        var lp = JSON.parse(sessionStorage.getItem('lrw-pos') || 'null');
        if (lp && lp.seed && Date.now() - lp.t < 6 * 3600 * 1000) back.setAttribute('href', '/editorials#e=' + lp.seed);
      } catch (e) {}
    }
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
      function pick(){
        var keys = Object.keys(data.arts);
        if (keys.length) el.href = '/editorial/' + keys[Math.floor(Math.random()*keys.length)];
      }
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
          notes.push({ q: m[1], s: m[2] || 'The timeline', href: 'https://timeline.lerandom.art/#/chapter-' + m[3], lbl: 'Deep history', ext: 1 });
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
          at.parentNode.insertBefore(el, at);
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
        var armed = {}, cyc = {}, blockIdx = 0, lastBlock = null;
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
            cyc[key] = cyc[key] || 0;
            var tgt = ts[cyc[key] % ts.length]; cyc[key]++;
            /* a subject-page link fires once; article/episode links rest three blocks */
            armed[form] = tgt[0] === 's' ? 1e9 : blockIdx + 3;
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
      function go(){ location.href = href; }
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

  /* ---------- Article structured data, built from the payload already fetched ---------- */
  (function(){
    var r = data.arts[slug]; if (!r) return;
    var ORIGIN = location.origin;
    var ld = {
      '@context': 'https://schema.org', '@type': 'Article',
      'headline': r[2], 'datePublished': r[3],
      'author': (r[6] && r[6].length ? r[6] : [r[4]]).map(function(n){ return { '@type': 'Person', 'name': n }; }),
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
})();