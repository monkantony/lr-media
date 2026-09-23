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
.lrft-tl { grid-template-columns:84px minmax(0,1fr) 72px 64px; }
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

.lrft-ln .ln-sh { grid-column:2 / -1; font-family:var(--lr-serif); font-style:italic; font-size:13.5px; color:rgba(1,16,21,.5); margin-top:2px; }
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
  #lrtopbar .util nav a { flex:0 0 auto; }
  #lrtopbar .util .right { order:1; flex:0 0 auto; margin-left:0; gap:10px; }
  /* the winning width on the editorials bar at this size is #lrw .topbar .tb-search{width:96px};
     every narrower rule here loses to it there, so 96 is the number to match */
  #lrtopbar .tb-search { width:96px; }
  #lrtopbar .tb-search input { font-style:normal; font-family:'Rules',Arial,sans-serif; font-size:16px;
    font-weight:400; letter-spacing:.02em; text-transform:none; text-overflow:ellipsis; }
  #lrtopbar .tb-search input::placeholder { opacity:.72; }
}
`;document.head.appendChild(st);var TOPBAR = "<header class=\"topbar\" id=\"lrtopbar\"><span class=\"tb-prog\" aria-hidden=\"true\"></span> <div class=\"wrap util\"> <nav> <a href=\"/editorials#latest\">Latest</a> <a href=\"/editorials#calendar\">Calendar</a> <a href=\"/editorials#interviews\">Interviews</a> <a href=\"/editorials#essays\">Essays</a> <a href=\"/editorials#dossiers\">Sets</a> <a href=\"/editorials#register\">Archive</a> <a href=\"/editorials#subjects\">Subjects</a> <a href=\"/editorials#contributors\">Contributors</a> </nav> <div class=\"right\"> <label class=\"tb-search\"><input id=\"lrtb-q\" type=\"search\" placeholder=\"Search archive\" aria-label=\"Search the archive: editorials and episodes\"></label> <a class=\"die-btn js-die\" href=\"/editorials\" target=\"_blank\" rel=\"noopener\" aria-label=\"Open a random editorial\"><span class=\"die-wrap\"><svg class=\"die-svg\" width=\"26\" height=\"26\" viewBox=\"0 0 44 44\" aria-hidden=\"true\"> <rect class=\"die-body\" x=\"1\" y=\"1\" width=\"42\" height=\"42\" rx=\"9\"/> <g class=\"die-face\" data-f=\"1\"><circle class=\"die-pip\" cx=\"22\" cy=\"22\" r=\"4\"/></g> <g class=\"die-face\" data-f=\"2\"><circle class=\"die-pip\" cx=\"13\" cy=\"13\" r=\"4\"/><circle class=\"die-pip\" cx=\"31\" cy=\"31\" r=\"4\"/></g> <g class=\"die-face\" data-f=\"3\"><circle class=\"die-pip\" cx=\"12\" cy=\"12\" r=\"3.7\"/><circle class=\"die-pip\" cx=\"22\" cy=\"22\" r=\"3.7\"/><circle class=\"die-pip\" cx=\"32\" cy=\"32\" r=\"3.7\"/></g> <g class=\"die-face\" data-f=\"4\"><circle class=\"die-pip\" cx=\"13\" cy=\"13\" r=\"3.7\"/><circle class=\"die-pip\" cx=\"31\" cy=\"13\" r=\"3.7\"/><circle class=\"die-pip\" cx=\"13\" cy=\"31\" r=\"3.7\"/><circle class=\"die-pip\" cx=\"31\" cy=\"31\" r=\"3.7\"/></g> <g class=\"die-face is-on\" data-f=\"5\"><circle class=\"die-pip\" cx=\"13\" cy=\"13\" r=\"3.5\"/><circle class=\"die-pip\" cx=\"31\" cy=\"13\" r=\"3.5\"/><circle class=\"die-pip\" cx=\"22\" cy=\"22\" r=\"3.5\"/><circle class=\"die-pip\" cx=\"13\" cy=\"31\" r=\"3.5\"/><circle class=\"die-pip\" cx=\"31\" cy=\"31\" r=\"3.5\"/></g> <g class=\"die-face\" data-f=\"6\"><circle class=\"die-pip\" cx=\"13\" cy=\"11\" r=\"3.4\"/><circle class=\"die-pip\" cx=\"31\" cy=\"11\" r=\"3.4\"/><circle class=\"die-pip\" cx=\"13\" cy=\"22\" r=\"3.4\"/><circle class=\"die-pip\" cx=\"31\" cy=\"22\" r=\"3.4\"/><circle class=\"die-pip\" cx=\"13\" cy=\"33\" r=\"3.4\"/><circle class=\"die-pip\" cx=\"31\" cy=\"33\" r=\"3.4\"/></g> </svg><span class=\"die-shadow\"></span></span><span class=\"die-lbl\">Roll for<br>editorial</span></a> </div> </div> </header>";
var AUDIO = {"a-a-murakami-on-existence-as-medium":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/152.m4a?v=fe3cc30f",870],"a-mean-defense":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/083.m4a?v=f1ed3cf4",750],"a-michael-noll-on-when-it-all-started":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/078.m4a?v=d523559b",1035],"aa-cavia-on-summoning-worlds":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/104.m4a?v=7a70e426",933],"aaron-hertzmann-on-caring-about-people":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/131.m4a?v=e793562d",958],"agh-on-glorifying-the-computer":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/024.m4a?v=8b14fadb",1073],"agnieszka-kurant-on-alien-thoughts":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/155.m4a?v=6bd52977",872],"ana-maria-caballeros-paperwork":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/020.m4a?v=f13369fb",149],"analivia-cordeiro-on-perpetual-motion":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/053.m4a?v=19ea824d",826],"artificial-and-human-intelligence":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/048.m4a?v=27bcda62",594],"avery-singer-on-the-dopamine-blowout":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/136.m4a?v=390bb2da",987],"barbara-london-on-new-territory":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/074.m4a?v=ee1ae7c4",1560],"beeple-on-infinite-creation-machines":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/087.m4a?v=12a918f2",1369],"beeple-on-robot-dogs-as-canvas":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/112.m4a?v=9bccd5f8",929],"bright-moments-on-prioritizing-the-personal":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/041.m4a?v=433febe1",1188],"can-art-replace-religion":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/055.m4a?v=ef8e79e5",1175],"casey-reas-lauren-lee-mccarthy-chandler-mcwilliams-on-expanding-software":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/058.m4a?v=0a441255",814],"casey-reas-on-the-history-of-generative-art-part-2":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/003.m4a?v=569efab0",863],"christiane-paul-on-curating-cohens-aaron":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/029.m4a?v=37f6c4b8",1343],"christiane-paul-on-defining-ai-art":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/079.m4a?v=9a6f66c3",1026],"claudia-hart-on-land-of-the-dead":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/105.m4a?v=946e194b",646],"cognitive-technologies":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/094.m4a?v=a8d3a1aa",539],"colette-bangert-on-growing-visually":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/044.m4a?v=def40c17",546],"commentary-by-mark-wilson":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/036.m4a?v=b1705d1b",356],"concrete-to-generative-real-space-explorations-in-south-america":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/019.m4a?v=56429921",567],"copper-giloth-on-video-games-to-video-art":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/100.m4a?v=6cbe0f56",737],"deafbeef-on-impermanence":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/013.m4a?v=23a9df2a",1029],"deafbeef-on-vernacular-in-a-standardized-age":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/090.m4a?v=223754b9",536],"decoupling-generative-art-with-philip-galanter":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/009.m4a?v=61f25bc4",658],"demystifying-generative-aesthetics":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/037.m4a?v=5feeea93",1612],"demystifying-generative-art":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/005.m4a?v=a0d185b3",1241],"demystifying-generative-autonomy":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/070.m4a?v=d52660e6",1463],"demystifying-generative-systems":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/049.m4a?v=135647ab",1471],"dmitri-cherniak-on-strictly-for-art":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/084.m4a?v=7392b913",1090],"drifella-iii-room-for-complexity":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/102.m4a?v=4bb512de",1516],"dx-research-group-on-the-agent-arena":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/124.m4a?v=058a17dd",1346],"ed-fornieles-on-art-as-human-sacrifice":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/132.m4a?v=20cb0752",529],"eli-scheinman-on-amplifying-the-digital":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/111.m4a?v=87445d61",667],"embodying-ai-at-neurips-2025-creative-ai-track":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/117.m4a?v=717cbfcd",1091],"emily-xie-on-textile-as-personal-canvas":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/038.m4a?v=78670986",1064],"eva-and-franco-mattes-on-mega-eliza":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/146.m4a?v=e85938f8",542],"evil-biscuit-on-card-nft-2-destruction-rebirth":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/139.m4a?v=6d3e67a1",1151],"feels-like-home-a-curatorial-statement":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/002.m4a?v=bc88a5c5",189],"frieder-nake-on-machinic-miracles":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/052.m4a?v=7c9e6cce",1063],"gendering-systems":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/057.m4a?v=09b337ea",754],"generations-of-verse":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/004.m4a?v=3dad388e",651],"golan-levin-on-the-potentiality-of-blobs":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/026.m4a?v=6b684908",1355],"gottfried-jager-on-a-new-kind-of-being":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/125.m4a?v=4535e03a",774],"hans-ulrich-obrist-on-exhibitions-as-living-organisms":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/097.m4a?v=9ccc2e36",848],"hito-steyerl-on-how-it-uses-us":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/091.m4a?v=14363856",442],"holly-herndon-mat-dryhurst-on-artificial-psychedelia":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/110.m4a?v=1b174624",1215],"ian-cheng-on-composing-with-systems":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/118.m4a?v=c9de265c",836],"ian-goodfellow-on-inventing-gans":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/107.m4a?v=7d517fcc",1420],"illuminating-marfa":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/017.m4a?v=9bf1b13d",542],"infinite-images-finite-control":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/092.m4a?v=07b3d868",783],"inside-qubibis-shinjuku-studio":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/071.m4a?v=c530840d",1800],"jakob-kudsk-steensen-on-non-human-pathways":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/137.m4a?v=f01ae35f",1102],"jane-veeder-on-loving-change":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/133.m4a?v=1be7769a",991],"jared-madere-and-fairybaby-on-vvv-and-the-world-as-material":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/149.m4a?v=be91a10d",1333],"jason-bailey-georg-bak-kate-vass-on-the-art-form-of-our-generation":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/046.m4a?v=d3aa81a6",896],"jen-lowe-and-patricio-gonzalez-vivo-on-democratizing-knowledge":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/045.m4a?v=4cf40cd0",831],"jess-tucker-on-longing-for-a-face":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/108.m4a?v=b86b411b",819],"joan-heemskerk-on-quantum-web4":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/059.m4a?v=34461618",1184],"john-gerrard-on-ecology-technology-power":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/140.m4a?v=27f941f5",906],"john-maeda-on-computational-evolution":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/054.m4a?v=1d713188",652],"john-provencher-and-raster-on-generative-identity":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/154.m4a?v=5e38a005",589],"juan-rodriguez-garcia-on-inhabiting-the-moment":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/096.m4a?v=71047c2e",616],"julia-kaganskiy-on-generativitys-deeper-consideration":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/088.m4a?v=5ae02de6",989],"justin-aversano-on-heart-and-light":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/144.m4a?v=9c0ab237",662],"karl-sims-alexander-mordvintsev-on-merging-technology-and-biology":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/109.m4a?v=51791278",1085],"kate-vass-on-rethinking-art-collecting":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/008.m4a?v=e854495d",795],"keiken-on-the-worldbuilding-lens":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/130.m4a?v=be4a55bf",846],"kevin-mccoy-on-bridging-net-art-and-blockchain":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/043.m4a?v=c551a4a4",993],"kim-asendorf-on-breaking-his-own-rules":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/126.m4a?v=e29fe45a",912],"kim-asendorf-on-elegant-symbiosis":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/073.m4a?v=81966161",1149],"kyle-mcdonald-on-computer-softness":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/129.m4a?v=69a96877",1123],"larry-cuba-on-choreographing-form":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/051.m4a?v=e003b466",1209],"larva-labs-on-computations-strangeness":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/101.m4a?v=56e8d2ab",989],"lauren-lee-mccarthy-on-software-values":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/030.m4a?v=1b3a09e7",987],"lawrence-lek-on-ai-reinventing-place":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/069.m4a?v=e6ce2136",1622],"le-random-an-origin-story":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/000.m4a?v=22075f3e",516],"let-the-barbarians-in":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/142.m4a?v=d15468a4",676],"linda-dounia-on-memory-machines":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/031.m4a?v=e0a06c58",1010],"living-aesthetics-a-grammar-of-protocol-art-and-worldbuilding":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/151.m4a?v=75bb01c3",2506],"london-digital-art-guide":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/103.m4a?v=783fc50e",1642],"lowbie-and-duc-de-berry-on-log-and-the-nft-to-zine-pipeline":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/153.m4a?v=a111eb3f",736],"lu-yang-on-art-as-the-perfect-cloak":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/121.m4a?v=7bb3b9a3",1530],"machine-reverie":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/032.m4a?v=fd959402",730],"machinic-taste":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/143.m4a?v=8d6163ef",337],"marina-abramovic-on-new-possibilities":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/085.m4a?v=fffcb4bd",356],"mario-klingemann-a-i-c-c-a-on-alien-perspective":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/076.m4a?v=63940dce",1723],"marlene-wenger-on-bringing-magic-back":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/148.m4a?v=d5118ff6",686],"mat-dryhurst-on-becoming-infinite":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/064.m4a?v=a4794f71",1032],"matt-deslauriers-on-a-generative-world":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/067.m4a?v=6d4712f6",1384],"matt-deslauriers-on-challenging-the-image":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/040.m4a?v=2a8d6843",924],"matt-hall-and-john-watkinson-on-beginning-a-movement":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/061.m4a?v=c9d3f9b0",1360],"maya-lin-on-systematic-naturalism":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/027.m4a?v=1b711628",686],"maya-man-on-generative-meaning":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/012.m4a?v=25c7b560",884],"meandering-with-ai":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/080.m4a?v=15659ee3",508],"memo-akten-on-rituals-as-algorithms":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/145.m4a?v=216d892c",1148],"michael-kozlowski-on-exploration-as-practice":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/042.m4a?v=925b6ec8",664],"micky-malka-becky-kleiner-on-the-birth-of-node":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/119.m4a?v=aa79304c",1230],"mika-ben-amar-brennan-wojtyla-on":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/113.m4a?v=11e6ef2a",1000],"minne-atairu-on-shaping-our-own-image":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/095.m4a?v=c65106c2",1034],"molnars-paris":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/033.m4a?v=19697353",441],"mona-lisa-to-monogrid":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/034.m4a?v=ba2b3d8d",863],"neural-unconscious":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/075.m4a?v=163a0c08",679],"new-histories-previewing-autumn-2026-in-art-and-technology":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/156.m4a?v=ca918a57",843],"new-york-city-digital-art-guide":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/081.m4a?v=d4fa7ec8",1429],"node-fast-art-slow-looking":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/120.m4a?v=14eb9d1f",799],"object-misrecognition":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/082.m4a?v=73c24339",616],"on-craft-art-programming":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/015.m4a?v=3d037c95",449],"operator-human-unreadable":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/022.m4a?v=7afc3d5e",1143],"operator-profiles-rebecca-allen":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/056.m4a?v=5d8b1d06",1406],"parker-ito-and-evil-biscuit-on-possessed-spirits":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/106.m4a?v=c8d15fcb",630],"post-generative-language-games":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/123.m4a?v=0b2dc5c0",664],"post-human--ai-art":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/093.m4a?v=f64f2799",988],"rafael-rozendaal-on-a-liquid-canvas":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/072.m4a?v=f1754288",1449],"reas-history-1":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/001.m4a?v=dd35417f",556],"reprogramming-sensory-habits":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/086.m4a?v=7110d137",1029],"rhea-myers-on-code-as-cultural-material":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/014.m4a?v=54ad0a6a",505],"robbie-fitzpatrick-on-basel-social-club-welcoming-the-barbarians":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/150.m4a?v=73456253",1050],"samia-halaby-on-different-brushes":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/065.m4a?v=1d76b903",494],"sarah-meyohas-on-irreducibly-human":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/089.m4a?v=e114f9d2",471],"sasha-stiles-and-martha-joseph-on-language-as-technology":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/098.m4a?v=47fe79e1",1248],"sasha-stiles-on-writing-poets":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/028.m4a?v=71ff9db0",1085],"seams-and-synthesis-schizocollage-and-ai-aesthetics":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/122.m4a?v=4c64767f",781],"seeing-machines-luba-elliott-on-the-2026-cvpr-art-gallery":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/138.m4a?v=c5c61c11",1623],"shohei-fujimoto-on-remembering-space":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/134.m4a?v=d8657ef8",775],"simon-denny-on-society-technology-and-art":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/060.m4a?v=cb76cf9a",957],"snowfro-and-ciphrd-on-a-symbiotic-relationship":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/023.m4a?v=ec9cdd80",1773],"sougwen-chung-on-aggregated-abandon":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/128.m4a?v=ef72c5f4",474],"sougwen-chung-on-us-in-another-form":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/016.m4a?v=bfa0a892",524],"sputniko-on-activism-multitasking":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/066.m4a?v=abde5e07",1206],"standout-artwork-of-2025":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/114.m4a?v=7df1bba5",753],"suzanne-treister-on-critical-futurism":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/068.m4a?v=3a1157ab",849],"ten-moments-in-south-american-generative-art-history":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/021.m4a?v=57385407",589],"the-algorithmic-gaze-representations-of-women-in-ai-art":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/047.m4a?v=22945dae",727],"the-cerebral-samba-protocol-art-worldbuilding-our-two-brains":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/135.m4a?v=2d225e47",660],"the-evolving-platform-ecosystem":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/006.m4a?v=f90ac62f",554],"the-memoir-of-a-net-art-memoir":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/039.m4a?v=543455bb",2106],"the-people-are-in-the-computer--part-i":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/077.m4a?v=ee82bcf9",1707],"the-ultraintelligent-machine-and-gaberbocchus-common-room":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/099.m4a?v=6c4a60ac",354],"the-zach-lieberman-commission-2":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/010.m4a?v=c723b8fe",654],"then-and-now":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/050.m4a?v=089115b2",313],"thoma-foundation-on-collecting-curiosity-conversation":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/141.m4a?v=2efe4217",677],"timeline-chapter-1-ten-top-moments":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/011.m4a?v=0fc0272c",774],"travess-smalley-profiles-mark-wilson":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/035.m4a?v=e912bffa",1722],"trevor-paglen-trevor-paglen-on-technological-points-of-view":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/062.m4a?v=9bfce2ba",568],"tyler-hobbs-on-algorithmic-aesthetics":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/025.m4a?v=9546a752",1282],"val-ravaglia-on-electric-dreams":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/063.m4a?v=631f087b",1351],"wendi-yan-karyn-nakamura-on-the-artifice-of-knowledge":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/127.m4a?v=8cdec63d",1062],"what-was-the-ai-psychosis-summit":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/147.m4a?v=73ca3101",1191],"william-mapan-on-breaking-the-medium":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/018.m4a?v=bf9a707d",874],"zach-lieberman":["https://raw.githubusercontent.com/monkantony/lr-audio-1/main/007.m4a?v=c3a7cf1c",889],"zero-10-part-1-beeple-casts-a-spell":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/115.m4a?v=835f9117",517],"zero-10-part-2-fair-transparency":["https://raw.githubusercontent.com/monkantony/lr-audio-2/main/116.m4a?v=63aca3a0",524]};

  /* the editorials header, carried onto the article pages */
  (function(){
    if (document.getElementById('lrtopbar')) return;
    var host = document.querySelector('.navbar_component');
    var bar = document.createElement('div');
    bar.innerHTML = TOPBAR;
    bar = bar.firstElementChild;
    document.documentElement.classList.add('lr-bar');   /* lr-reserve: releases the head embed's toolbar space */
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
  var box = document.getElementById('lrft');
  /* the player first, from the map inside this file: no wait for the footer data */
  try { if (typeof AUDIO !== 'undefined' && AUDIO[slug]) player(AUDIO[slug][0], AUDIO[slug][1], ((document.querySelector('h1') || {}).textContent || '').replace(/\s+/g, ' ').trim()); } catch (e) {}
  /* a piece with no audio edition gets no player: give its reserved space back at once */
  if (!document.getElementById('lrap')) document.documentElement.classList.add('lr-player');
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
                            'description': 'AI-generated audio edition' };
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

    if (me.au) { try { player(me.au[0], me.au[1], (data.arts && data.arts[slug] && data.arts[slug][2]) || ''); } catch (e) { /* no player beats a broken page */ } }
  }).catch(function(){ /* no footer beats a broken footer */ });
  function player(url, secs, title) {
    var host = document.querySelector('.text-garamond');
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
      + '<span class="lrap-lbl">Listen<span class="lrap-lbl-x"> to this editorial</span></span>'
      + '<span class="lrap-ai">AI generated audio | LR Pod theme by Rami Awad</span></span>'
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

  /* ---------- staging-only features: column, paths, resume, lightbox, rail, book ---------- */
  if (/(^|\.)webflow\.io$/.test(location.hostname.toLowerCase())||/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) (function(){
  (function(){var gs=document.createElement('style');gs.id='lrft-staging';gs.textContent=`
@media (min-width:992px) {
  .blog-post5-header_title-wrapper-2 { max-height:calc(100vh - 96px); overflow-y:auto; overflow-x:hidden;
    overscroll-behavior:contain; scrollbar-width:thin; scrollbar-color:rgba(1,16,21,.28) transparent; }
  .blog-post5-header_title-wrapper-2::-webkit-scrollbar { width:6px; }
  .blog-post5-header_title-wrapper-2::-webkit-scrollbar-thumb { background:rgba(1,16,21,.28); border-radius:3px; }
}

#lrft .lrft-path-h { font-family:var(--lr-sans); font-size:19px; font-weight:500; letter-spacing:-.01em; margin:0 0 4px; color:var(--lr-ink); }
#lrft .lrft-path-h span { font-size:11px; font-weight:500; letter-spacing:.13em; text-transform:uppercase; color:var(--lr-ink70); margin-left:10px; }
#lrft .lrft-path-sub { font-family:var(--lr-serif); font-style:italic; font-size:16px; color:var(--lr-ink70); margin:0 0 14px; }
#lrft .lrft-path + .lrft-path { margin-top:-12px; }
#lrft .lrft-path-all { font-family:var(--lr-sans); font-size:11px; font-weight:500; letter-spacing:.13em; text-transform:uppercase; color:var(--lr-ink); text-decoration:none; }
#lrft .lrft-path-all:hover { color:var(--lr-or); }

.lrt-toast { position:fixed; left:50%; bottom:22px; transform:translateX(-50%); z-index:70; display:flex; align-items:center; gap:14px;
  background:#011015; color:#EFE9D8; padding:12px 16px; font:400 14px/1.3 'Rules',Arial,sans-serif; box-shadow:0 10px 30px rgba(1,16,21,.3); }
.lrt-toast button { font:500 12px/1 'Rules',Arial,sans-serif; letter-spacing:.06em; text-transform:uppercase; color:#011015; background:#EFE9D8; border:0; padding:9px 12px; cursor:pointer; }
.lrt-toast .x { background:transparent; color:#EFE9D8; padding:6px; }

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

.lrr { display:none; }
html.lrr-on.lrr-folded .lrr { display:flex; flex-direction:column; gap:18px; margin-top:22px; animation:lrrIn .35s ease; }
@keyframes lrrIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
html.lrr-on .lrr-fold { overflow:hidden; transition:max-height .45s cubic-bezier(.3,.1,.2,1), opacity .3s; }
html.lrr-on.lrr-folded .lrr-fold { opacity:0; }
.lrr { --lrr-ink:#011015; --lrr-i2:rgba(1,16,21,.62); --lrr-i3:rgba(1,16,21,.45); --lrr-rule:rgba(1,16,21,.14);
  font-family:'Rules',Arial,sans-serif; color:var(--lrr-ink); }
.lrr p { margin:0; }
.lrr .lrr-lbl { font:500 11px/1.3 'Rules',Arial,sans-serif; letter-spacing:.13em; text-transform:uppercase; color:var(--lrr-i2); }
.lrr .lrr-rail { display:flex; flex-direction:column; gap:10px; }
.lrr .lrr-dots { display:flex; flex-wrap:wrap; gap:6px; }
.lrr .lrr-dots a { display:grid; place-items:center; width:30px; height:30px; border-radius:50%; border:1px solid var(--lrr-rule);
  font:500 12px/1 'Rules',Arial,sans-serif; text-decoration:none; color:var(--lrr-i2); }
.lrr .lrr-dots a:hover { border-color:var(--lrr-ink); color:var(--lrr-ink); }
.lrr .lrr-dots a.done { background:rgba(1,16,21,.07); color:var(--lrr-ink); }
.lrr .lrr-dots a.on { background:var(--lrr-ink); border-color:var(--lrr-ink); color:#EFE9D8; }
.lrr .lrr-cur { font:400 15px/1.45 'Rules',Arial,sans-serif; color:var(--lrr-ink); min-height:3em; }
.lrr .lrr-note { border-top:1px solid var(--lrr-ink); padding-top:12px; display:flex; flex-direction:column; gap:6px; transition:opacity .25s; }
.lrr .lrr-note.swap { opacity:0; }
.lrr .lrr-note.gone { display:none; }
.lrr .lrr-note .nm { font:500 22px/1.15 'Rules',Arial,sans-serif; letter-spacing:-.015em; text-decoration:none; color:var(--lrr-ink); }
.lrr .lrr-note .nm:hover { text-decoration:underline; text-underline-offset:3px; }
.lrr .lrr-note .ty { font:400 13px/1.4 'Rules',Arial,sans-serif; color:var(--lrr-i2); }
.lrr .lrr-note .also { font:400 15px/1.45 'Ebgaramond','EB Garamond',Garamond,Georgia,serif; }
.lrr .lrr-note .also a { color:inherit; text-decoration:underline; text-decoration-color:rgba(1,16,21,.3); text-underline-offset:2px; }
.lrr .lrr-note .prev { font:400 13px/1.4 'Rules',Arial,sans-serif; color:var(--lrr-i3); }
.lrr .lrr-note .prev a { color:var(--lrr-i2); }
html.lrr-tight .lrr .lrr-note .also, html.lrr-tight .lrr .lrr-note .prev { display:none; }
html.lrr-nonote .lrr .lrr-note { display:none; }
html.lrr-on span.lr-fm.now { text-decoration:underline; text-decoration-color:#FF4C00; text-decoration-thickness:2px; text-underline-offset:3px; }
html.lrr-on a.lr-sl.lr-fm.now { border-bottom:2px solid #FF4C00; }
@media (max-width:1159px) { .lrr .lrr-note .also { display:none; } .lrr .lrr-dots a { width:26px; height:26px; font-size:11px; } }
@media (max-width:991px) { .lrr { display:none !important; } .lrr-fold { max-height:none !important; opacity:1 !important; } }
@media (prefers-reduced-motion:reduce) { html.lrr-on .lrr-fold { transition:none; } html.lrr-on.lrr-folded .lrr { animation:none; } }
/* Book measure for the live article page (test lab, 23 Sep 2026), against the Webflow classes as measured
   on the 8799 proxy. Everything is scoped under html.lrbk so it can ship behind a flag and be switched off.
   The paper card (div.article) stays: it becomes the page. Its left padding is the book margin, computed in
   CSS from the card's own width (padding percentages resolve against the grid area), so the text block
   sits toward the outer edge with the note column in the card's outer margin.
   Side notes from 1240 px; 992 to 1239 px: the text is centered in the card and notes stay in the sticky
   column (lrr-note, as today); below 992 px nothing here applies. */
html.lrbk {
  --bk-L: clamp(232px, 21vw, 320px);     /* sticky title column (445 today) */
  --bk-g1: 48px;                         /* grid gap, as today */
  --bk-T: 576px;                         /* the measure: 64 to 71 characters at 21/32 in Ebgaramond */
  --bk-g2: clamp(28px, 2.8vw, 44px);     /* text to notes */
  --bk-S: clamp(200px, 15vw, 232px);     /* note column */
  --bk-pR: clamp(28px, 3.2vw, 48px);     /* card padding right of the notes */
  --bk-pL: 40px;                         /* the smallest left margin inside the card */
}
@media (min-width: 992px) {
  html.lrbk .blog-post5-header_component { grid-template-columns: var(--bk-L) minmax(0, 1fr) !important; column-gap: var(--bk-g1) !important; }
  html.lrbk div.article {
    position: relative;
    /* 992 to 1239: the measure centered in the card */
    padding: 40px max(var(--bk-pL), calc((100% - var(--bk-T)) / 2)) 56px !important;
  }
  /* one measure for the player, the text and the end zones */
  html.lrbk div.article > .lrap-home,
  html.lrbk div.article > .text-garamond,
  html.lrbk div.article > .w-embed.w-script { width: var(--bk-T) !important; max-width: 100% !important; align-self: flex-start; }
  html.lrbk div.article > .lrap-home #lrap { width: 100% !important; }
  html.lrbk div.article > .w-embed.w-script #lrft { width: 100% !important; }

  /* the text: book size and leading, a little more air between paragraphs */
  html.lrbk .text-garamond.padding-article { font-size: 21px !important; line-height: 32px !important; font-feature-settings: 'kern', 'liga', 'onum'; }
  html.lrbk .text-garamond.padding-article p { margin-bottom: 14px; }
  /* Webflow's own p rule sets 24px leading on the paragraphs themselves, so the container's 32px never reached
     them (live measurement, 23 Sep 2026): the book leading is set on the text elements directly */
  html.lrbk .text-garamond.padding-article p, html.lrbk .text-garamond.padding-article li,
  html.lrbk .text-garamond.padding-article blockquote { line-height: 32px !important; }
  html.lrbk .text-garamond.padding-article .lrmg-in { width: 100%; }

  /* plates: JS marks each image figure lrbk-wide (ratio 1.25 or more) or lrbk-tall and sets --r.
     Portraits and squares keep the measure and stop at 78% of the window height by WIDTH (never a
     height cap: that is the stretch bug). Captions keep the measure. */
  html.lrbk .text-garamond figure.lrbk-tall { width: min(100%, calc(78vh * var(--r, 1))) !important; max-width: 100% !important; }
  html.lrbk .text-garamond figure figcaption { max-width: var(--bk-T); text-align: left; }   /* Webflow centers captions; under an 800 px plate a centered 576 px caption floats */
}
@media (min-width: 1240px) {
  html.lrbk div.article {
    /* the text block toward the outer edge; what is left of the card is the left margin */
    padding-left: max(var(--bk-pL), calc(100% - var(--bk-T) - var(--bk-g2) - var(--bk-S) - var(--bk-pR))) !important;
    padding-right: calc(var(--bk-g2) + var(--bk-S) + var(--bk-pR)) !important;
  }
  /* landscape plates run into the note column, up to 800 px */
  html.lrbk .text-garamond figure.lrbk-wide { width: min(800px, calc(100% + var(--bk-g2) + var(--bk-S))) !important; max-width: none !important; }
  /* the note leaves the sticky column: it lives beside its line */
  html.lrbk .lrr .lrr-note { display: none !important; }
}
/* unfolded and still too tall (a long title, standfirst and bio): smaller title, bios to two lines, then
   bios hidden and the standfirst clamped */
html.lrbk.lrbk-ut .blog-post5-header_title-wrapper-2 h1 { font-size: 30px !important; line-height: 1.08 !important; }
html.lrbk.lrbk-ut .blog-post5-header_title-wrapper-2 .author-about { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
html.lrbk.lrbk-ut2 .blog-post5-header_title-wrapper-2 .author-about { display: none; }
html.lrbk.lrbk-ut2 .blog-post5-header_title-wrapper-2 .lrr-fold.text-size-regular { display: -webkit-box; -webkit-line-clamp: 7; -webkit-box-orient: vertical; overflow: hidden; }

/* side notes */
.lrbk-side { position: absolute; top: 0; width: var(--bk-S); pointer-events: none; }
.lrbk-sn { position: absolute; left: 0; right: 0; display: flex; flex-direction: column; gap: 3px; padding-top: 7px; border-top: 1px solid rgba(1,16,21,.16); pointer-events: auto; transition: border-color .25s, opacity .25s; }
.lrbk-sn .nm { font: 500 16px/1.2 'Rules', Arial, sans-serif; letter-spacing: -.01em; color: #011015; text-decoration: none; }
.lrbk-sn .nm:hover { text-decoration: underline; text-underline-offset: 3px; }
.lrbk-sn .ty { font: 400 12px/1.35 'Rules', Arial, sans-serif; color: #4A5251; }
.lrbk-sn .also { font: 400 14px/1.38 'Ebgaramond Regular', 'Ebgaramond', 'EB Garamond', Garamond, Georgia, serif; color: #011015; }
.lrbk-sn .also a { color: inherit; text-decoration: underline; text-decoration-color: rgba(1,16,21,.28); text-underline-offset: 2px; }
.lrbk-sn.compact .also { display: none; }
.lrbk-sn.now, .lrbk-sn.hot { border-top: 2px solid #FF4C00; padding-top: 6px; }
.lrbk-sn.past { opacity: .72; }
html.lrbk span.lr-fm.hot { text-decoration: underline; text-decoration-color: #FF4C00; text-decoration-thickness: 2px; text-underline-offset: 3px; }
html.lrbk a.lr-sl.lr-fm.hot { border-bottom: 2px solid #FF4C00; }
@media (max-width: 1239px) { .lrbk-side { display: none; } }
`;document.head.appendChild(gs);})();



  /* ---------- paths (23 Sep 2026): its place in any reading path, from the hub's own sets ---------- */
  (function(){
    var pslug = location.pathname.replace(/\/+$/, '').split('/').pop();
    function pesc(s){ return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
    function href(p){ return /^pod:/.test(p[1]) ? '/editorials#pod=' + p[1].slice(4) : '/editorial/' + p[1]; }
    fetch((window.LRW_RAW || 'https://raw.githubusercontent.com/monkantony/lr-media/main/') + 'footer_data.txt')
      .then(function(r){ return r.text(); }).then(function(t){
        var d = JSON.parse(t), me = d.foot && d.foot[pslug]; if (!me || !me.st || !d.sets) return;
        var html = me.st.slice(0, 2).map(function(x){
          var s = d.sets[x[0]]; if (!s) return '';
          var parts = s[2], i = x[1], pv = parts[i - 1], nx = parts[i + 1];
          return '<section class="lrft-zone lrft-path"><h2 class="lrft-lbl">Reading path</h2>'
            + '<p class="lrft-path-h">' + pesc(s[0]) + '<span>Part ' + (i + 1) + ' of ' + parts.length + '</span></p>'
            + (s[1] ? '<p class="lrft-path-sub">' + pesc(s[1]) + '</p>' : '')
            + '<nav class="lrft-pn">'
            + (pv ? '<a href="' + href(pv) + '"><span class="lrft-dir">&#8592; Before this</span><span class="lrft-t">' + pesc(pv[0]) + '</span></a>' : '<span></span>')
            + (nx ? '<a href="' + href(nx) + '"><span class="lrft-dir">After this &#8594;</span><span class="lrft-t">' + pesc(nx[0]) + '</span></a>'
                  : '<a href="/editorials#dossiers"><span class="lrft-dir">The end of the path</span><span class="lrft-t">All reading paths</span></a>')
            + '</nav></section>';
        }).join('');
        if (!html) return;
        var t0 = Date.now();
        (function place(){
          var box = document.getElementById('lrft'), zones = box ? box.querySelectorAll('.lrft-zone') : [];
          var rn = null; [].forEach.call(zones, function(z){ var h = z.querySelector('.lrft-lbl'); if (!rn && h && h.textContent === 'Read next') rn = z; });
          if (box && box.querySelector('.lrft-path')) return;
          if (rn) rn.insertAdjacentHTML('beforebegin', html);
          else if (box && box.querySelector('.lrft-pn') && !box.querySelector('.lrft-path')) box.querySelector('.lrft-pn').insertAdjacentHTML('beforebegin', html);
          else if (Date.now() - t0 < 10000) setTimeout(place, 200);
        })();
      }).catch(function(){});
  })();


  /* ---------- resume (23 Sep 2026): continue where you left off ---------- */
  (function(){
    var body = document.querySelector('.text-garamond.w-richtext') || document.querySelector('.text-garamond');
    if (!body) return;
    var tslug = location.pathname.replace(/\/+$/, '').split('/').pop();
    function st(v){ try { if (v === undefined) return JSON.parse(localStorage.getItem('lr-read') || '{}'); localStorage.setItem('lr-read', JSON.stringify(v)); } catch (e) { return {}; } }
    function frac(){ var r = body.getBoundingClientRect(); return Math.min(1, Math.max(0, (innerHeight * .35 - r.top) / Math.max(1, r.height - innerHeight * .3))); }
    var tm = 0;
    addEventListener('scroll', function(){ clearTimeout(tm); tm = setTimeout(function(){ var s = st() || {}; s.pos = s.pos || {}; s.pos[tslug] = Math.round(frac() * 1000) / 1000; st(s); }, 500); }, { passive: true });
    var p = ((st() || {}).pos || {})[tslug];
    if (p > .06 && p < .95 && !location.hash) {
      var toast = document.createElement('div'); toast.className = 'lrt-toast'; toast.setAttribute('role', 'status');
      toast.innerHTML = '<span>Continue where you left off, ' + Math.round(p * 100) + '% in</span><button type="button" class="go">Resume</button><button type="button" class="x" aria-label="Dismiss">&#10005;</button>';
      document.body.appendChild(toast);
      var gone = function(){ if (toast.parentNode) toast.parentNode.removeChild(toast); };
      toast.querySelector('.go').addEventListener('click', function(){ var r = body.getBoundingClientRect(); scrollTo({ top: scrollY + r.top + r.height * p - innerHeight * .35, behavior: 'smooth' }); gone(); });
      toast.querySelector('.x').addEventListener('click', gone);
      setTimeout(gone, 12000);
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


  /* ---------- lr-rail (23 Sep 2026): questions and first-mention notes in the sticky title column ---------- */
  (function(){
    var W = document.querySelector('.blog-post5-header_title-wrapper-2');
    var body = document.querySelector('.text-garamond.w-richtext') || document.querySelector('.text-garamond');
    if (!W || !body || !window.fetch || !document.createTreeWalker) return;
    var root = document.documentElement, MINW = 992, rslug = location.pathname.replace(/\/+$/, '').split('/').pop();
    var HOUSE = { 'peter bauman': 1, 'monk antony': 1, 'conrad house': 1, 'le random': 1 };
    var TYPE = { people: 'Person', works: 'Work', orgs: 'Organization', exhibitions: 'Exhibition' };
    function esc(s){ return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
    function key(s){ return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ''); }
    /* the mockup session's sentence tools, as ported: sentence ends ignore initialisms and titles */
    function sentences(t){
      t = String(t || '').trim();
      var out = [], re = /[.?!]+["”’)]*\s+(?=[A-Z“"(])/g, last = 0, m;
      while ((m = re.exec(t))) {
        var before = t.slice(last, m.index + 1).trim();
        if (/(?:^|[\s(])(?:[A-Z]\.){2,}$/.test(before) || /(?:^|\s)(?:Dr|Mr|Mrs|Ms|St|vs|Prof|No|Jr|Sr)\.$/.test(before)) continue;
        var end = m.index + m[0].length; out.push(t.slice(last, end).trim()); last = end;
      }
      if (last < t.length) out.push(t.slice(last).trim());
      return out.filter(Boolean);
    }
    function firstSentence(t){ var s = sentences(t); return s.length ? s[0] : String(t || '').trim(); }
    function questionOf(t){ var s = sentences(t); for (var i = 0; i < s.length; i++) if (/\?["”’)]*$/.test(s[i])) return s[i]; return firstSentence(t); }

    var BLOCKS = 'p, h1, h2, h3, h4, h5, h6, li, blockquote';
    function skip(el){ return !!(el.closest && el.closest('.lrmg-in, figure, figcaption, #lrft')); }
    /* the question's block in the live body: the first block at or after `from` whose letters contain the
       locator's letters; a zero-size marker goes in front of the text node where it starts */
    function locate(loc, blocks, from){
      var lk = key(loc).slice(0, 30); if (lk.length < 8) return -1;
      for (var i = from; i < blocks.length; i++) {
        var b = blocks[i]; if (skip(b)) continue;
        var bk = key(b.textContent); var at = bk.indexOf(lk); if (at < 0) continue;
        var w = document.createTreeWalker(b, NodeFilter.SHOW_TEXT, null), n, acc = 0;
        while ((n = w.nextNode())) {
          var nk = key(n.nodeValue); if (acc + nk.length > at) break; acc += nk.length;
        }
        var mk = document.createElement('span'); mk.className = 'lrr-at'; mk.setAttribute('data-i', String(LOCI));
        if (n && n.parentNode) n.parentNode.insertBefore(mk, n); else b.insertBefore(mk, b.firstChild);
        return i;
      }
      return -1;
    }

    var D = null, marks = [], fms = [], box = null, folds = [], FOLDED = null, CURK = null, PREVK = null, NT = {}, FIRSTP = null, LOCI = 0;
    /* ---- the book measure + side notes (test lab, 23 Sep 2026, feature "book") ---- */

    var card = document.querySelector('div.article'), SIDEQ = matchMedia('(min-width:1240px)'), side = null, SN = [], lq = 0;
    function bookOn(){ return root.classList.contains('lrbk') && !!card; }
    function sideOn(){ return bookOn() && SIDEQ.matches; }
    /* plates: landscape (ratio 1.25 or more) runs to 800 px into the note column; portraits and squares
       keep the measure and stop at 78vh BY WIDTH (a height cap would stretch them) */
    function plate(fig){
      var im = fig.querySelector('img'); if (!im) return;
      var set = function(){
        var w = im.naturalWidth || +im.getAttribute('width') || 0, h = im.naturalHeight || +im.getAttribute('height') || 0; if (!w || !h) return;
        var r = w / h; fig.classList.toggle('lrbk-wide', r >= 1.25); fig.classList.toggle('lrbk-tall', r < 1.25); fig.style.setProperty('--r', r.toFixed(4));
        layoutSide();
      };
      if (im.complete && im.naturalWidth) set(); else im.addEventListener('load', set, { once: true });
    }
    function sideNoteHtml(k){   /* noteHtml with at most two "Also in" */
      var e = NT[k]; if (!e) return '';
      var also = (e[5] || []).slice(0, 2);
      return '<a class="nm" href="/editorials#subject=' + encodeURIComponent(k) + '">' + esc(e[1]) + '</a>'
        + '<span class="ty">' + TYPE[e[2]] + ' · in ' + e[3] + ' editorials' + (e[4] ? ', featured in ' + e[4] : '') + '</span>'
        + (also.length ? '<span class="also">Also in ' + also.map(function(x){ return '<a href="/editorial/' + esc(x[1]) + '">' + esc(x[2]) + '</a>'; }).join('; ') + '</span>' : '');
    }
    function buildSide(){
      if (!bookOn()) return;
      [].forEach.call(body.querySelectorAll('figure.w-richtext-figure-type-image'), plate);
      side = document.createElement('div'); side.className = 'lrbk-side'; side.setAttribute('aria-label', 'Notes');
      card.appendChild(side); SN = [];
      fms.forEach(function(el){
        var k = el.getAttribute('data-k'); if (!NT[k]) return;
        var sn = document.createElement('div'); sn.className = 'lrbk-sn'; sn.innerHTML = sideNoteHtml(k);
        side.appendChild(sn); SN.push({ el: el, sn: sn });
        var hot = function(on){ el.classList.toggle('hot', on); sn.classList.toggle('hot', on); };
        [el, sn].forEach(function(x){ x.addEventListener('mouseenter', function(){ hot(true); }); x.addEventListener('mouseleave', function(){ hot(false); }); });
      });
      if (window.ResizeObserver) new ResizeObserver(layoutSide).observe(body);   /* lazy images, fonts, the player */
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutSide);
      SIDEQ.addEventListener('change', layoutSide);
      addEventListener('resize', layoutSide, { passive: true });
      layoutSide();
    }
    /* each note starts level with the line that names it (top minus 8 px); it never overlaps the note
       above (16 px gap) or a plate that runs into the note column (it moves below); pushed more than
       120 px, it drops its "Also in" and keeps name and count */
    function layoutSide(){
      if (!side) return;
      cancelAnimationFrame(lq);
      lq = requestAnimationFrame(function(){
        if (!sideOn()) return;
        var cr = card.getBoundingClientRect(), br = body.getBoundingClientRect();
        var g2 = parseFloat(getComputedStyle(root).getPropertyValue('--bk-g2')) || 40, sl = br.right + g2, top0 = cr.top;
        side.style.left = Math.round(br.right - cr.left + g2) + 'px';
        var figs = [].map.call(body.querySelectorAll('figure'), function(f){ var r = f.getBoundingClientRect(); return r.right > sl + 2 ? { t: r.top - top0 - 10, b: r.bottom - top0 + 18 } : null; }).filter(Boolean);
        var y = -1e9;
        SN.forEach(function(o){
          var lr = o.el.getClientRects()[0] || o.el.getBoundingClientRect();
          var want = lr.top - top0 - 8, t = Math.max(want, y + 16);
          o.sn.classList.remove('compact');
          for (var pass = 0; pass < 2; pass++) {
            var h = o.sn.offsetHeight, moved = true, guard = 0;
            while (moved && guard++ < 12) { moved = false; figs.forEach(function(f){ if (t < f.b && t + h > f.t) { t = f.b; moved = true; } }); }
            if (pass === 0 && t - want > 120) { o.sn.classList.add('compact'); t = Math.max(want, y + 16); } else break;
          }
          var top = Math.round(t) + 'px'; if (o.sn.style.top !== top) o.sn.style.top = top;   /* write only on change */
          y = t + o.sn.offsetHeight;
        });
      });
    }

    function fold(on){
      if (FOLDED === on) return; FOLDED = on;
      folds.forEach(function(f){
        if (on) { f.style.maxHeight = f.scrollHeight + 'px'; void f.offsetHeight; f.style.maxHeight = '0px'; }
        else { f.style.maxHeight = f.scrollHeight + 'px'; setTimeout(function(){ if (!FOLDED) f.style.maxHeight = ''; }, 480); }
      });
      root.classList.toggle('lrr-folded', on);
      setTimeout(fit, 500);
    }
    function fit(){
      if (!box) return;
      var over = function(){ return W.getBoundingClientRect().bottom > innerHeight - 12; };
      if (!FOLDED) {
        root.classList.remove('lrbk-ut', 'lrbk-ut2');
        if (bookOn() && over()) { root.classList.add('lrbk-ut'); if (over()) root.classList.add('lrbk-ut2'); }
        return;
      }
      root.classList.remove('lrr-tight', 'lrr-nonote', 'lrbk-ut', 'lrbk-ut2');
      if (!over()) return;
      root.classList.add('lrr-tight');
      if (over()) root.classList.add('lrr-nonote');
    }
    function noteHtml(k){
      var e = NT[k]; if (!e) return '';
      return '<a class="nm" href="/editorials#subject=' + encodeURIComponent(k) + '">' + esc(e[1]) + '</a>'
        + '<span class="ty">' + TYPE[e[2]] + ' · in ' + e[3] + ' editorials' + (e[4] ? ', featured in ' + e[4] : '') + '</span>'
        + (e[5] && e[5].length ? '<span class="also">Also in ' + e[5].map(function(x){ return '<a href="/editorial/' + esc(x[1]) + '">' + esc(x[2]) + '</a>'; }).join('; ') + '</span>' : '');
    }
    var ticking = false;
    function onScroll(){ if (!ticking) { ticking = true; requestAnimationFrame(function(){ ticking = false; tick(); }); } }
    function tick(){
      if (!box) return;
      if (innerWidth < MINW) { root.classList.remove('lrr-on'); fold(false); return; }
      root.classList.add('lrr-on');
      /* the fold waits for the TEXT: the body opens with the hero image and the player (the mock lab's rule:
         the first paragraph passing 20 px above the 42% reading line) */
      var fp = FIRSTP || (FIRSTP = [].filter.call(body.querySelectorAll('p'), function(x){ return (x.textContent || '').trim().length > 40; })[0] || body);
      var line = innerHeight * .42, y = fp.getBoundingClientRect().top;
      if (y < line - 20) fold(true); else if (y > line + 80) fold(false);
      if (marks.length) {
        /* at the very bottom every head still on screen counts, so a short-tailed page can reach its last
           question (mock lab, 23 Sep 2026: No. 154's last head stayed below the line at maximum scroll) */
        var cur = 0, atEnd = scrollY + innerHeight >= document.documentElement.scrollHeight - 4;
        marks.forEach(function(m, i){ var t = m.getBoundingClientRect().top; if (t < line || (atEnd && t < innerHeight - 40)) cur = i + 1; });
        [].forEach.call(box.querySelectorAll('.lrr-dots a'), function(d){ var k = +d.getAttribute('data-q'); d.classList.toggle('on', k === cur); d.classList.toggle('done', k < cur); });
        var qn = box.querySelector('.lrr-qn'), want = String(Math.max(1, cur));
        if (qn && qn.textContent !== want) qn.textContent = want;
        var qc = box.querySelector('.lrr-cur'), mk0 = marks[Math.max(0, cur - 1)], it = mk0 ? D.it[+mk0.getAttribute('data-i')] : null;
        /* the editor's line when there is one (rail_lines.json), else the sentence that asks */
        if (qc && it) { var s = it[2] || (D.k === 'q' ? questionOf(it[0]) : firstSentence(it[0])); if (qc.textContent !== s) qc.textContent = s; }
      }
      var now = null;
      fms.forEach(function(el){ if (el.getBoundingClientRect().top < line) now = el; });
      if (now && line - now.getBoundingClientRect().top > innerHeight) now = null;   /* the reader has moved on */
      fms.forEach(function(el){ el.classList.toggle('now', el === now); });
      if (SN.length) { var nowTop = now ? now.getBoundingClientRect().top : 0;
        SN.forEach(function(o){ var on = o.el === now, past = !!now && !on && o.el.getBoundingClientRect().top < nowTop;
          if (o.sn.classList.contains('now') !== on) o.sn.classList.toggle('now', on);
          if (o.sn.classList.contains('past') !== past) o.sn.classList.toggle('past', past); }); }
      if (sideOn()) { if (CURK !== null) { CURK = null; var nb0 = box.querySelector('.lrr-note'); if (nb0) { nb0.className = 'lrr-note gone'; nb0.innerHTML = ''; } } return; }

      var k = now ? now.getAttribute('data-k') : null;
      if (k !== CURK) {
        PREVK = CURK; CURK = k;
        var nb = box.querySelector('.lrr-note'); nb.classList.add('swap');
        setTimeout(function(){
          if (CURK !== k) return;
          if (!k) { nb.className = 'lrr-note gone'; nb.innerHTML = ''; fit(); return; }
          nb.className = 'lrr-note';
          nb.innerHTML = '<p class="lrr-lbl">Just mentioned</p>' + noteHtml(k)
            + (PREVK && NT[PREVK] ? '<span class="prev">Before that: <a href="#" data-back="' + esc(PREVK) + '">' + esc(NT[PREVK][1]) + '</a></span>' : '');
          var bk = nb.querySelector('[data-back]');
          if (bk) bk.addEventListener('click', function(ev){ ev.preventDefault(); var t = null; fms.forEach(function(el){ if (!t && el.getAttribute('data-k') === bk.getAttribute('data-back')) t = el; }); if (t) scrollTo({ top: scrollY + t.getBoundingClientRect().top - innerHeight * .4, behavior: 'smooth' }); });
          fit();
        }, 160);
      }
    }
    function firstMentions(){
      var cand = (D.nt || []).filter(function(e){ return !HOUSE[e[0]] && TYPE[e[2]] && e[1].length > 3 && e[3] >= 2; })
        .sort(function(a, b){ return b[1].length - a[1].length; });
      cand.forEach(function(e){ NT[e[0]] = e; });
      var done = {}, count = 0, L = 'A-Za-z0-9À-ɏ';
      [].forEach.call(body.querySelectorAll('p, li, blockquote'), function(p){
        if (count >= 28 || skip(p)) return;
        /* Webflow joins several visible paragraphs into one <p> with <br><br>: the two-notes cap is per visible paragraph */
        var found = 0, cap = 2 * (1 + Math.floor(p.querySelectorAll('br').length / 2));
        cand.forEach(function(e){
          if (done[e[0]] || found >= cap || count >= 28) return;
          var fs_ = (e[6] && e[6].length ? e[6] : [e[1]]).slice().sort(function(a, b){ return b.length - a.length; });
          var re = new RegExp('(^|[^' + L + '])(' + fs_.map(function(f){ return f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') + ')(?![' + L + '])');
          var w = document.createTreeWalker(p, NodeFilter.SHOW_TEXT, { acceptNode: function(nd){
            var a = nd.parentNode.closest('a'); if (a && !a.classList.contains('lr-sl')) return NodeFilter.FILTER_REJECT;
            var lb = nd.parentNode.closest('strong, b'); if (lb && lb.textContent.length <= 60 && /:\s*$/.test(lb.textContent)) return NodeFilter.FILTER_REJECT;   /* a speaker label: a SHORT bold run ending in a colon (Webflow often bolds a whole question together with the next label) */
            if (nd.parentNode.closest('.lr-fm')) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT; } }), nd;
          while ((nd = w.nextNode())) {
            var m = re.exec(nd.nodeValue); if (!m) continue;
            var sl = nd.parentNode.closest('a.lr-sl'), el;
            if (sl) { el = sl; el.classList.add('lr-fm'); }
            else {
              var st = m.index + m[1].length, r = document.createRange(); r.setStart(nd, st); r.setEnd(nd, st + m[2].length);
              el = document.createElement('span'); el.className = 'lr-fm'; r.surroundContents(el);
            }
            el.setAttribute('data-k', e[0]);
            fms.push(el); done[e[0]] = 1; found++; count++; break;
          }
        });
      });
      fms.sort(function(a, b){ return a.compareDocumentPosition(b) & 4 ? -1 : 1; });
    }
    function build(){
      /* the fold: the standfirst and the author box give their room to the rail once reading starts */
      var auth = W.querySelector('.blog-post5-content_contributers');
      var dek = [].filter.call(W.querySelectorAll('.text-size-regular'), function(el){ return !(auth && auth.contains(el)); })[0];
      [dek, auth].forEach(function(el){ if (el) { el.classList.add('lrr-fold'); folds.push(el); } });
      box = document.createElement('div'); box.className = 'lrr'; box.setAttribute('aria-label', 'Reading guide');
      var html = '';
      if (D.it && D.it.length) {
        var blocks = [].slice.call(body.querySelectorAll(BLOCKS)), at = 0, ok = 0;
        D.it.forEach(function(it, j){ LOCI = j; var i = locate(it[1], blocks, at); if (i >= 0) { at = i; ok++; } });
        marks = [].slice.call(body.querySelectorAll('.lrr-at'));
        if (ok >= Math.max(2, Math.ceil(D.it.length * .6)) && marks.length === ok) {
          html += '<section class="lrr-rail"><p class="lrr-lbl">' + (D.k === 'q' ? 'The questions' : 'Sections') + ' · <span class="lrr-qn">1</span> of ' + marks.length + '</p>'
            + '<div class="lrr-dots">' + marks.map(function(m, i){ return '<a href="#" data-q="' + (i + 1) + '" aria-label="' + (D.k === 'q' ? 'Question ' : 'Section ') + (i + 1) + '">' + (i + 1) + '</a>'; }).join('') + '</div>'
            + '<p class="lrr-cur"></p></section>';
        } else { marks.forEach(function(m){ m.remove(); }); marks = []; }
      }
      html += '<section class="lrr-note gone"></section>';
      box.innerHTML = html;
      W.appendChild(box);
      [].forEach.call(box.querySelectorAll('.lrr-dots a'), function(d){ d.addEventListener('click', function(ev){ ev.preventDefault(); var t = marks[+d.getAttribute('data-q') - 1]; if (t) scrollTo({ top: scrollY + t.getBoundingClientRect().top - 120, behavior: 'smooth' }); }); });
      addEventListener('scroll', onScroll, { passive: true });
      addEventListener('resize', function(){ onScroll(); fit(); }, { passive: true });
      tick();
    }
    function whenLinked(fn){   /* after the smart links have been drawn, or 2.5 s, whichever comes first */
      var t0 = Date.now();
      (function wait(){ if (body.querySelector('a.lr-sl') || Date.now() - t0 > 2500) fn(); else setTimeout(wait, 150); })();
    }
    if (innerWidth && innerWidth < MINW) return;   /* phones and small tablets: nothing is fetched (0 = not laid out yet: decide later) */
    fetch((window.LRW_RAW || 'https://raw.githubusercontent.com/monkantony/lr-media/main/') + 'rail/' + rslug + '.json')
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(d){ if (!d) return; D = d; root.classList.add('lrbk'); whenLinked(function(){ firstMentions(); build(); buildSide(); fit(); }); })
      .catch(function(){});
  })();


  })();
})();