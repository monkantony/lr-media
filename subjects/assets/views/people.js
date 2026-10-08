/* The Living Timeline: People.
   A planisphere of every person the Timeline names. Rings are the ten chapters (the cave at the centre, 2025 at the
   rim), the rim is a zodiac of the idea regions, each star is a person placed at the middle of their own moments in
   time (those whose titles name them, else all that name them) and pulled toward the people they share moments with. At the centre sits the pupil: a window onto the live
   scene of the era in focus, which dilates to fill the stage when you look through it. */
(function () {
  'use strict';
  const S = window.LRSite;
  S.mountNav();

  // ── helpers ──────────────────────────────────────────────────────────────
  const RM = S.reducedMotion;
  const TAU = Math.PI * 2;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = S.esc;
  const fmt = n => Number(n).toLocaleString('en-US');
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const E = {
    out3: t => 1 - Math.pow(1 - t, 3),
    inOut3: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    inOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
    outBack: t => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  };
  const norm = s => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const slugify = s => (S.slugify ? S.slugify(s) : norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
  const hexRgb = h => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const rgbStr = c => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
  function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  const angDiff = d => ((d + Math.PI) % TAU + TAU) % TAU - Math.PI;
  const now = () => performance.now();
  const phoneMQ = matchMedia('(max-width:860px)');
  const isPhone = () => phoneMQ.matches;
  const finePointer = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const wordRe = w => new RegExp('(^|[^a-z0-9])' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^a-z0-9]|$)');

  const INK = '#011015', CREAM_RGB = [239, 233, 216], ORANGE_RGB = [255, 76, 0], BLUE_RGB = [2, 176, 244], GREY_RGB = [118, 128, 132];
  const CH_HEX = [], CH_INK = []; for (let c = 1; c <= 10; c++) { CH_HEX[c] = S.chapterColor(c); CH_INK[c] = S.chapterInk ? S.chapterInk(c) : CH_HEX[c]; }
  const CH_RGB = CH_HEX.map(h => h && hexRgb(h));

  // geometry of the chart in world units (outer rim at radius 1)
  const R0 = 0.268;   // the pupil
  const RB = 0.336;   // inner edge of the first ring
  const R1 = 0.918;   // outer edge of the last ring
  const RIM_IN = R1 + 0.012, RIM_OUT = R1 + 0.034, RIM_LAB = R1 + 0.058;
  const NOMINAL = 390; // px per world unit the layout is solved for
  // the year slot: a straight channel down the bottom meridian where the scale of years is printed, like the date
  // window of a planisphere. No star or moment sits in it, and no orbit crosses it: the dial reads from one side of it
  // round to the other.
  const SLOT = 0.09, SLOT_GAP = 2 * Math.asin(SLOT / R1);
  const dialU = a => ((a - Math.PI) % TAU + TAU) % TAU;   // 0 and TAU are the slot; the idea regions fill the rest

  // ── DOM ──────────────────────────────────────────────────────────────────
  const root = $('#pp'), stage = $('#pp-stage'), cv = $('#pp-sky'), ctx = cv.getContext('2d');
  // 9 Oct 2026: an eased radius can dip below 0 for a frame (arc() then throws); clamp it for every arc on our canvases
  const arcSafe = c => { const A = c.arc; c.arc = function (x, y, r, s, e, cc) { return A.call(this, x, y, r > 0 ? r : 0, s, e, cc); }; return c; };
  arcSafe(ctx);
  { const arc0 = ctx.arc.bind(ctx); ctx.arc = (x, y, r, a, b, ccw) => arc0(x, y, r > 0 ? r : 0, a, b, ccw); }
  const pupil = $('#pp-pupil'), ground = $('#pp-ground'), tip = $('#pp-tip'), panel = $('#pp-panel'), scroller = $('#pp-scroll');
  const qIn = $('#pp-q'), qRes = $('#pp-results'), filterEl = $('#pp-filter'), keyEl = $('#pp-key');
  const throughEl = $('#pp-through'), handle = $('#pp-handle');

  let PROFILES = {};
  const TITLE = 'People · Le Random';
  /* LR-PEOPLE: the archive side of each person (editorials with the sentence naming them, episodes, nearest people,
     subjects), built by build_lr_people.py. The chart does not wait for it. */
  const ARCH = {}, SHARDS = {}; let LAYOUT = null;
  const shardOf = k => { let h = 0; for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) >>> 0; return h % 64; };
  const shard = (dir, k) => { const n = shardOf(k), key = dir + n; return SHARDS[key] || (SHARDS[key] = fetch((window.LR_DATA || '') + 'data/' + dir + '/' + n + '.json').then(r => (r.ok ? r.json() : {})).catch(() => ({}))); };
  const archFor = k => shard('arch', k).then(a => { if (a[k]) ARCH[k] = a[k]; return ARCH; });
  const LRWEB = 'https://www.lerandom.art';
  function statsOf(p, detail) {
    const B = n => `<b>${fmt(n)}</b>`, pl = (n, a, b) => (n === 1 ? a : b), rc = p.rc;
    const w = rc[0], f = rc[1], em = Math.max(0, p.ad.length - w - f), g = rc[2], H = rc[3], gh = rc[4], pm = Math.max(0, p.pd.length - g - H - gh);
    const cap = s => s.charAt(0).toUpperCase() + s.slice(1), join = a => (a.length > 1 ? a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1] : a[0] || '');
    const ed = [], pod = [], out = [];
    if (w) ed.push(`wrote ${B(w)} ${pl(w, 'editorial', 'editorials')}`);
    if (f) ed.push(`${w ? 'is ' : ''}featured in ${B(f)}${w ? '' : ' ' + pl(f, 'editorial', 'editorials')}`);
    if (em) ed.push(`${w ? 'is ' : ''}mentioned in ${B(em)}${w || f ? ' more' : ' ' + pl(em, 'editorial', 'editorials')}`);
    if (H) pod.push(`hosts the podcast, ${B(H)} episodes`);
    if (gh) pod.push(`guest host of ${B(gh)} podcast ${pl(gh, 'episode', 'episodes')}`);
    if (g) pod.push(`a guest on ${B(g)} podcast ${pl(g, 'episode', 'episodes')}`);
    if (pm) pod.push(`mentioned in ${B(pm)}${g || H || gh ? ' more' : ' podcast ' + pl(pm, 'episode', 'episodes')}`);
    const rel = (detail && detail.relationships) || {}, about = p.m.filter(m => rel[m.s] === 'about').length, other = p.m.length - about;
    const tl = p.m.length ? `<a href="#pv-mom">${about ? `The subject of ${B(about)} Timeline ${pl(about, 'moment', 'moments')}${other ? ` and mentioned in ${B(other)} more` : ''}` : `Mentioned in ${B(p.m.length)} Timeline ${pl(p.m.length, 'moment', 'moments')}`}</a> (${span(p)}).` : '';
    const es = ed.length ? `<a href="#pv-aeds">${cap(join(ed))}</a>.` : '', ps = pod.length ? `<a href="#pv-apods">${cap(join(pod))}</a>.` : '';
    const lead = (window.LR_LEAD || {})[p.tok];
    if (lead) out.push(lead, es, ps);
    else if (HOME === 'main') out.push(es, ps, tl); else out.push(tl, es, ps);
    if (p.co.size) out.push(`Appears alongside ${B(p.co.size)} other ${pl(p.co.size, 'person', 'people')}.`);
    return out.filter(Boolean).join(' ');
  }
  const HOME = window.LR_PEOPLE_HOME || (/[?&]home=main\b/.test(location.search) ? 'main' : 'timeline');
  const nTimes = (n, one, many) => (n === 1 ? 'one ' + one : fmt(n) + ' ' + many);
  const countsOf = p => [p.m.length ? nTimes(p.m.length, 'moment', 'moments') : '', p.ad.length ? nTimes(p.ad.length, 'editorial', 'editorials') : '', p.pd.length ? nTimes(p.pd.length, 'episode', 'episodes') : ''].filter(Boolean).join(' &middot; ');

  // ── state ────────────────────────────────────────────────────────────────
  let IX, BY, P = [], PK = new Map(), PT = new Map(), CH, SCN, SC_BY, CL = [], EDS, PODS, THREADS, THREAD_SET;
  let RANKED = [], BYSIZE = [], EDGES = []; const NAMES = new Set();
  const ringIn = [], ringOut = [], ringPeople = [], chMoments = [], chWomen = [];
  let SECT = []; // [{id, a0, a1, ac, label, n}]
  const st = {
    sel: null, selT0: 0, selA: 0, hover: null, hoverMoment: null, hoverPerson: null, panelRing: 0,
    era: 0, region: -1, min: 1, src: '',
    lens: false, lensT0: -1e9, lensDir: 0,
    through: false, thP: 0, thFrom: 0, thT0: 0, pupilHot: 0,
    introT0: 0, started: false, watch: null,
  };
  const cam = { k: 1, x: 0, y: 0 }, camT = { k: 1, x: 0, y: 0, anchor: null, tau: 90 };
  let W = 0, H = 0, dpr = 1, SC = 300, CX = 0, CY = 0, sheetTop = 0, starScale = 1, labelScale = 1, railH = 0;
  const V = { K: 1, ox: 0, oy: 0, hole: 0 };
  let uiRects = [];

  // ── load ─────────────────────────────────────────────────────────────────
  Promise.all([S.data.index(), S.data.people(), S.data.chapters(), S.data.scenes(), S.data.latent(), S.data.editorials(), S.data.pods(), S.data.threads(), S.data.bySlug(), S.data.personProfiles(), fetch((window.LR_DATA || '') + 'data/layout.json').then(r => (r.ok ? r.json() : null)).catch(() => null)])
    .then(a => { LAYOUT = a[10]; return init(a); }).catch(err => {
      console.warn('people: data failed', err);
      $('#pp-loading').innerHTML = '<span class="lab">The people data could not be loaded.</span>';
    });

  function init([ix, people, chapters, scenes, latent, eds, pods, threads, bySlug, profiles]) {
    PROFILES = profiles;
    // work on copies: the cached index records are shared with the rest of the runtime
    IX = ix.map((r, i) => Object.assign({}, r, { i, people: [] })); BY = new Map(IX.map(r => [r.s, r]));
    CH = chapters; SCN = scenes; SC_BY = new Map(scenes.map(s => [s.id, s])); EDS = eds; PODS = pods; THREADS = threads;
    THREAD_SET = new Map(threads.map(t => [norm(t.mv), t]));
    CL = latent.clusters;
    const t0 = now();
    buildModel(people);
    buildRings();
    buildSectors();
    placeMoments();
    runLayout();
    buildEdges();
    try { performance.measure('people-layout', { start: t0, end: now() }); } catch (e) { /* older engines */ }
    resize();
    bindUI();
    const fontsReady = Promise.race([
      Promise.all([document.fonts.load('italic 400 16px "EB Garamond"'), document.fonts.load('500 10px Rules'), document.fonts.load('400 10px Rules')]),
      new Promise(r => setTimeout(r, 1400)),
    ]).catch(() => {});
    fontsReady.then(start);
  }

  function buildModel(people) {
    // moments: chapter quantile (for radius) and counts
    for (let c = 1; c <= 10; c++) { chMoments[c] = []; chWomen[c] = 0; }
    IX.forEach(m => { chMoments[m.c].push(m); if (m.f.includes('women')) chWomen[m.c]++; });
    for (let c = 1; c <= 10; c++) {
      const a = chMoments[c].slice().sort((x, y) => x.yn - y.yn || x.i - y.i);
      a.forEach((m, i) => { m.q = a.length > 1 ? i / (a.length - 1) : 0.5; });
    }
    const used = new Set();
    P = people.map((raw, idx) => {
      const ms = raw.m.map(s => BY.get(s)).filter(Boolean).sort((a, b) => a.yn - b.yn || a.i - b.i);
      const ctxAnc = !ms.length && raw.anc ? BY.get(raw.anc) : null;   // LR-PEOPLE: placed by context
      if (!ms.length && !ctxAnc) return null;
      let tok = slugify(raw.k) || 'person-' + idx; if (used.has(tok)) { let n = 2; while (used.has(tok + '-' + n)) n++; tok += '-' + n; } used.add(tok);
      const chN = new Array(10).fill(0), clN = new Map();
      ms.forEach(m => { chN[m.c - 1]++; clN.set(m.cl, (clN.get(m.cl) || 0) + 1); });
      const med = ms.length ? ms[Math.floor((ms.length - 1) / 2)] : ctxAnc;
      // where a person sits: the middle of the moments whose titles name them (their own moments), or, when no
      // title does, the middle of every moment that names them. Leonardo sits in 1509, not among those who cite him.
      const nn = norm(raw.n), words = nn.split(/\s+/), sur = words[words.length - 1];
      const reFull = nn.length >= 4 ? wordRe(nn) : null, reSur = sur.length >= 4 && words.length > 1 ? wordRe(sur) : null;
      let own = reFull ? ms.filter(m => reFull.test((m.nt || (m.nt = norm(m.t))))) : [];
      if (!own.length && reSur) own = ms.filter(m => reSur.test((m.nt || (m.nt = norm(m.t)))));
      const anc = own.length ? own[Math.floor((own.length - 1) / 2)] : med;
      let cl = anc.cl, best = -1; clN.forEach((n, k) => { if (n > best || (n === best && k === anc.cl)) { best = n; cl = k; } });
      if (ctxAnc) { cl = raw.hcl != null ? raw.hcl : anc.cl; clN.set(cl, 1); }
      // moments flagged as women artists’ whose titles carry this full name (a fact about the moments, not a record of gender)
      const wt = reFull ? ms.filter(m => m.f.includes('women') && reFull.test((m.nt || (m.nt = norm(m.t))))).length : 0;
      const p = { i: 0, k: raw.k, n: raw.n, g: raw.g || '', wt, tok, nn, m: ms, cnt: ms.length, med, anc, own, c: anc.c, cl, chN, clN,
        first: ms[0] || anc, last: ms[ms.length - 1] || anc, co: new Map(), coW: new Map(), vis: 1, visT: 1,
        ad: raw.ad || [], pd: raw.pd || [], ctx: !!ctxAnc, yrs: raw.yrs || '', self: !!raw.self, rc: raw.rc || [0, 0, 0, 0, 0], coBy: { m: new Map(), a: new Map(), p: new Map() } };
      p.tot = raw.self ? p.cnt + Math.max(0, p.ad.length - (raw.rc || [0])[0]) + Math.max(0, p.pd.length - (raw.rc || [0, 0, 0, 0])[3]) : p.cnt + p.ad.length + p.pd.length;   // every time Le Random names them
      p.sz = 1.15 + 1.22 * Math.sqrt(p.tot);
      ms.forEach(m => m.people.push(p));
      return p;
    }).filter(Boolean);
    P.forEach((p, i) => { p.i = i; PK.set(p.k, p); PT.set(p.tok, p); NAMES.add(p.nn); NAMES.add(norm(p.k)); });
    // co-appearance: shared counts for everything, softened weights for the layout
    IX.forEach(m => {
      const ps = m.people, k = ps.length; if (k < 2) return;
      const w = 1 / (k - 1);
      for (let a = 0; a < k; a++) for (let b = a + 1; b < k; b++) {
        const A = ps[a], B = ps[b];
        A.co.set(B, (A.co.get(B) || 0) + 1); B.co.set(A, (B.co.get(A) || 0) + 1);
        A.coW.set(B, (A.coW.get(B) || 0) + w); B.coW.set(A, (B.coW.get(A) || 0) + w);
        A.coBy.m.set(B, (A.coBy.m.get(B) || 0) + 1); B.coBy.m.set(A, (B.coBy.m.get(A) || 0) + 1);
      }
    });
    // LR-PEOPLE: named together in an editorial or an episode counts too (a long list of names counts for less each)
    const docs = new Map();
    P.forEach(p => { if (p.self) return; p.ad.forEach(n => { const k = 'a' + n; if (!docs.has(k)) docs.set(k, []); docs.get(k).push(p); }); p.pd.forEach(n => { const k = 'p' + n; if (!docs.has(k)) docs.set(k, []); docs.get(k).push(p); }); });
    docs.forEach((ps, key) => {
      const k = ps.length, kind = key[0]; if (k < 2) return;
      const w = 0.6 / (k - 1);
      for (let a = 0; a < k; a++) for (let b = a + 1; b < k; b++) {
        const A = ps[a], B = ps[b];
        A.co.set(B, (A.co.get(B) || 0) + 1); B.co.set(A, (B.co.get(A) || 0) + 1);
        A.coW.set(B, (A.coW.get(B) || 0) + w); B.coW.set(A, (B.coW.get(A) || 0) + w);
        A.coBy[kind].set(B, (A.coBy[kind].get(B) || 0) + 1); B.coBy[kind].set(A, (B.coBy[kind].get(A) || 0) + 1);
      }
    });
    RANKED = P.slice().sort((a, b) => b.tot - a.tot || (a.nn < b.nn ? -1 : 1));
    RANKED.forEach((p, i) => { p.rank = i; });
    BYSIZE = P.slice().sort((a, b) => a.tot - b.tot);
    P.forEach(p => {
      let L = null, T = null, S0 = null;
      Object.defineProperty(p, 'coList', { configurable: true, get: () => L || (L = Array.from(p.co, ([q, n]) => ({ q, n })).sort((a, b) => b.n - a.n || a.q.rank - b.q.rank)) });
      Object.defineProperty(p, 'coSet', { configurable: true, get: () => S0 || (S0 = new Set(p.co.keys())) });
      Object.defineProperty(p, 'coTop', { configurable: true, get: () => T || (T = new Set(p.coList.slice(0, 28).map(x => x.q))) });
    });
  }

  // ring radii: area shared between an even split and the number of people whose middle falls in each chapter
  function buildRings() {
    for (let c = 1; c <= 10; c++) ringPeople[c] = 0;
    P.forEach(p => ringPeople[p.c]++);
    const N = P.length; let cum = 0; const r0 = RB * RB, r1 = R1 * R1;
    for (let c = 1; c <= 10; c++) {
      ringIn[c] = Math.sqrt(r0 + (r1 - r0) * cum);
      cum += 0.5 / 10 + 0.5 * ringPeople[c] / N;
      ringOut[c] = Math.sqrt(r0 + (r1 - r0) * Math.min(1, cum));
    }
    ringOut[10] = R1;
  }
  const rOf = m => ringIn[m.c] + (ringOut[m.c] - ringIn[m.c]) * (0.1 + 0.8 * m.q);

  // sectors: the idea regions around the rim, in the order of their direction on the map of ideas, so neighbours on
  // the dial are neighbours in idea space. Their widths share out the people and the moments that live in them.
  // The circle has to be cut somewhere for the year slot: it is cut where the fewest lives cross, so that almost every
  // orbit can travel between two ideas the short way round.
  function buildSectors() {
    const n = new Map(), nm = new Map();
    P.forEach(p => n.set(p.cl, (n.get(p.cl) || 0) + 1));
    IX.forEach(m => nm.set(m.cl, (nm.get(m.cl) || 0) + 1));
    const cls = CL.slice().sort((a, b) => Math.atan2(a.y, a.x) - Math.atan2(b.y, b.x));
    const N = P.length, M = IX.length, K = cls.length, T = TAU - SLOT_GAP;
    const wOf = c => T * (0.22 / K + 0.46 * (n.get(c.id) || 0) / N + 0.32 * (nm.get(c.id) || 0) / M);
    const at = new Map(cls.map((c, i) => [c.id, i]));
    const b = [0]; cls.forEach((c, i) => b.push(b[i] + wOf(c)));
    const ctr = cls.map((c, i) => (b[i] + b[i + 1]) / 2), cross = new Float64Array(K);
    P.forEach(p => {
      const ms = p.m.slice().sort((x, y) => x.c - y.c || x.q - y.q);
      for (let j = 1; j < ms.length; j++) {
        const i1 = at.get(ms[j - 1].cl), i2 = at.get(ms[j].cl); if (i1 === undefined || i2 === undefined || i1 === i2) continue;
        const d = ((ctr[i2] - ctr[i1]) % T + T) % T, fwd = d <= T / 2, from = fwd ? ctr[i1] : ctr[i2], len = fwd ? d : T - d;
        for (let k = 0; k < K; k++) if (((b[k] - from) % T + T) % T < len) cross[k]++;
      }
    });
    let cut = 0; for (let k = 1; k < K; k++) if (cross[k] < cross[cut]) cut = k;
    let a = Math.PI + SLOT_GAP / 2;
    SECT = cls.slice(cut).concat(cls.slice(0, cut)).map(c => {
      const w = wOf(c), s = { id: c.id, a0: a, a1: a + w, ac: a + w / 2, label: c.label, terms: c.terms || [], n: n.get(c.id) || 0, nm: nm.get(c.id) || 0 };
      a += w; return s;
    });
    const byId = new Map(SECT.map(s => [s.id, s])); P.forEach(p => { p.sect = byId.get(p.cl) || SECT[0]; });
    SECT.byId = byId;
  }

  // the sky: every moment has a fixed place, its date giving the radius and its idea region the bearing. Within a
  // region the moments step round by the golden angle in time order, so they spread evenly without clumping.
  function placeMoments() {
    const by = new Map();
    IX.forEach(m => { const s = SECT.byId.get(m.cl) || SECT[0]; if (!by.has(s)) by.set(s, []); by.get(s).push(m); });
    by.forEach((list, s) => {
      list.sort((x, y) => x.c - y.c || x.q - y.q);
      list.forEach((m, j) => {
        const f = (j * 0.6180339887 + (hashStr(m.s) % 1000) / 1000 * 0.08) % 1;
        const a = s.a0 + (s.a1 - s.a0) * (0.06 + 0.88 * f), r = rOf(m);
        let x = r * Math.sin(a), y = -r * Math.cos(a);
        if (y > 0 && Math.abs(x) < SLOT + 0.006) x = (x < 0 ? -1 : 1) * (SLOT + 0.006);
        m.px = x; m.py = y; m.pr = Math.hypot(x, y); m.pu = dialU(Math.atan2(x, -y));
      });
    });
  }

  // ── layout: a polar force simulation, deterministic ──────────────────────
  function runLayout() {
    if (LAYOUT && LAYOUT.n === P.length && P.every(p => LAYOUT.xy[p.k])) { P.forEach(p => { const v = LAYOUT.xy[p.k]; p.x = v[0]; p.y = v[1]; p.r = Math.hypot(p.x, p.y); p.a = Math.atan2(p.x, -p.y); }); return; }
    const N = P.length, rnd = rng(1083);
    const X = new Float64Array(N), Y = new Float64Array(N), VX = new Float64Array(N), VY = new Float64Array(N);
    const RT = new Float64Array(N), LO = new Float64Array(N), HI = new Float64Array(N), RAD = new Float64Array(N), AC = new Float64Array(N), AH = new Float64Array(N), DEG = new Float64Array(N);
    P.forEach((p, i) => {
      RT[i] = rOf(p.anc);
      RAD[i] = (p.sz + 1.3) / NOMINAL;
      const pad = Math.min(RAD[i] + 0.003, (ringOut[p.c] - ringIn[p.c]) / 2 - 0.001);
      LO[i] = ringIn[p.c] + pad; HI[i] = ringOut[p.c] - pad;
      AC[i] = p.sect.ac; AH[i] = (p.sect.a1 - p.sect.a0) / 2;
      const a = p.sect.a0 + (p.sect.a1 - p.sect.a0) * (0.08 + 0.84 * rnd());
      X[i] = RT[i] * Math.sin(a); Y[i] = -RT[i] * Math.cos(a);
      DEG[i] = p.co.size || 1;
    });
    const LI = [], LJ = [], LS = [];
    P.forEach(p => p.coW.forEach((w, q) => { if (q.i > p.i) { LI.push(p.i); LJ.push(q.i); LS.push(Math.min(1, w * 1.4 / Math.min(DEG[p.i], DEG[q.i]))); } }));
    const L = LI.length;
    const CELL = 0.032, G = Math.ceil(2.2 / CELL), heads = new Int32Array(G * G), next = new Int32Array(N);
    const ITER = 320;
    for (let it = 0; it < ITER; it++) {
      const alpha = Math.max(0.03, Math.pow(1 - it / ITER, 1.6));
      for (let l = 0; l < L; l++) {
        const i = LI[l], j = LJ[l];
        const dx = X[j] - X[i], dy = Y[j] - Y[i], d = Math.sqrt(dx * dx + dy * dy) || 1e-6;
        const rest = RAD[i] + RAD[j] + 0.006;
        const f = (d - rest) / d * LS[l] * alpha * 0.5;
        const bi = DEG[i] / (DEG[i] + DEG[j]);
        VX[i] += dx * f * (1 - bi); VY[i] += dy * f * (1 - bi);
        VX[j] -= dx * f * bi; VY[j] -= dy * f * bi;
      }
      for (let i = 0; i < N; i++) {
        const r = Math.sqrt(X[i] * X[i] + Y[i] * Y[i]) || 1e-6, a = Math.atan2(X[i], -Y[i]);
        const dr = (RT[i] - r) * 0.1;
        VX[i] += Math.sin(a) * dr; VY[i] += -Math.cos(a) * dr;
        const off = angDiff(a - AC[i]), lim = AH[i] * 0.94;
        if (Math.abs(off) > lim) { const push = -(off - Math.sign(off) * lim) * r * 0.12; VX[i] += Math.cos(a) * push; VY[i] += Math.sin(a) * push; }
      }
      for (let i = 0; i < N; i++) {
        VX[i] *= 0.58; VY[i] *= 0.58; X[i] += VX[i]; Y[i] += VY[i];
        const r = Math.sqrt(X[i] * X[i] + Y[i] * Y[i]) || 1e-6, rc = clamp(r, LO[i], HI[i]);
        if (rc !== r) { X[i] *= rc / r; Y[i] *= rc / r; }
      }
      // collisions on a grid, position based
      heads.fill(-1);
      for (let i = 0; i < N; i++) { const gx = clamp(((X[i] + 1.1) / CELL) | 0, 0, G - 1), gy = clamp(((Y[i] + 1.1) / CELL) | 0, 0, G - 1), h = gy * G + gx; next[i] = heads[h]; heads[h] = i; }
      const cs = it < ITER * 0.3 ? 0.5 : 0.85;
      for (let i = 0; i < N; i++) {
        const gx = clamp(((X[i] + 1.1) / CELL) | 0, 0, G - 1), gy = clamp(((Y[i] + 1.1) / CELL) | 0, 0, G - 1);
        for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
          const cx = gx + ox, cy = gy + oy; if (cx < 0 || cy < 0 || cx >= G || cy >= G) continue;
          for (let j = heads[cy * G + cx]; j !== -1; j = next[j]) {
            if (j <= i) continue;
            const dx = X[j] - X[i], dy = Y[j] - Y[i], min = RAD[i] + RAD[j];
            const d2 = dx * dx + dy * dy; if (d2 >= min * min) continue;
            const d = Math.sqrt(d2) || 1e-6, o = (min - d) / d * 0.5 * cs;
            const wi = RAD[j] / (RAD[i] + RAD[j]), wj = 1 - wi;
            X[i] -= dx * o * wi * 2; Y[i] -= dy * o * wi * 2; X[j] += dx * o * wj * 2; Y[j] += dy * o * wj * 2;
          }
        }
      }
      // the year slot stays empty
      for (let i = 0; i < N; i++) { const lim = SLOT + RAD[i] + 0.003; if (Y[i] > 0 && Math.abs(X[i]) < lim) { X[i] = (X[i] < 0 ? -1 : 1) * lim; VX[i] = 0; } }
    }
    P.forEach((p, i) => { p.x = X[i]; p.y = Y[i]; p.r = Math.hypot(X[i], Y[i]); p.a = Math.atan2(X[i], -Y[i]); });
    window.__LR_LAYOUT_OUT = { n: P.length, xy: Object.fromEntries(P.map(p => [p.k, [+p.x.toFixed(5), +p.y.toFixed(5)]])) };
  }

  // polar quadratic: a curve that bends around the pupil instead of crossing it
  function ctrl(ax, ay, bx, by) {
    const ra = Math.hypot(ax, ay), rb = Math.hypot(bx, by), aa = Math.atan2(ax, -ay), ab = Math.atan2(bx, -by);
    const d = angDiff(ab - aa), am = aa + d / 2, rm = (ra + rb) / 2;
    const mx = rm * Math.sin(am), my = -rm * Math.cos(am);
    return [2 * mx - (ax + bx) / 2, 2 * my - (ay + by) / 2];
  }
  function buildEdges() {
    // the faint web: pairs who share a moment naming ten people or fewer (big exhibition lists would only add a hairball)
    const seen = new Map();
    IX.forEach(m => {
      const ps = m.people; if (ps.length < 2 || ps.length > 10) return;
      for (let a = 0; a < ps.length; a++) for (let b = a + 1; b < ps.length; b++) {
        const A = ps[a].i < ps[b].i ? ps[a] : ps[b], B = A === ps[a] ? ps[b] : ps[a], key = A.i * 4096 + B.i;
        seen.set(key, (seen.get(key) || 0) + 1);
      }
    });
    EDGES = Array.from(seen, ([key, w]) => { const A = P[Math.floor(key / 4096)], B = P[key % 4096]; const c = ctrl(A.x, A.y, B.x, B.y); return { A, B, w, cx: c[0], cy: c[1] }; });
  }

  // ── scenes ───────────────────────────────────────────────────────────────
  function sceneFor(m) {
    if (S.pickScene) { const sc = S.pickScene(SCN, m); if (sc) return sc; }
    let sc = SC_BY.get(m.sc);
    if (!sc || sc.status !== 'live') sc = SC_BY.get(CH[m.c - 1].scene);
    return sc;
  }
  function signature(p) {
    const full = p.nn, words = full.split(/\s+/), sur = words[words.length - 1];
    const reFull = full.length >= 4 ? wordRe(full) : null, reSur = sur.length >= 4 ? wordRe(sur) : null;
    const mid = (p.m.length - 1) / 2; let best = p.med, bs = -1e9;
    p.m.forEach((m, i) => {
      const t = (m.nt || (m.nt = norm(m.t))); let s = 0;
      if (reFull && reFull.test(t)) s += 4; else if (reSur && reSur.test(t)) s += 2.5;
      if (m.f.includes('allTime')) s += 2; if (m.f.includes('top')) s += 1;
      if (m.sf > 0) s += 0.3;
      s -= Math.abs(i - mid) * 0.01;
      if (s > bs) { bs = s; best = m; }
    });
    return best;
  }

  // the pupil: at most one live scene, crossfaded by overlaying a second layer only while it arrives
  let sceneOK = null, layers = [], mountSeq = 0, mountTimer = 0, win = null;
  const sceneProbe = fetch('moment.html', { cache: 'no-cache' }).then(r => r.ok).catch(() => false).then(ok => { sceneOK = ok; root.classList.toggle('can-look', !!ok); if (st.started) { renderWindowCards(); kick(); } return ok; });
  // 9 Oct 2026 (Peter): the Subjects split view (map + index side by side, wide screens). Its pupil keeps the era's still
  // plate: no live scene (the on-chain scene's simulated mint bar) next to the index
  function slSplit() { return !!window.LR_SL_HERO && root.classList.contains('sl-split') && window.matchMedia('(min-width:1100px)').matches; }
  function wantsLive() { return sceneOK && !slSplit() && (!isPhone() || st.through); }
  function showScene(m, opts) {
    opts = opts || {};
    const sc = sceneFor(m); if (!sc) return;
    win = { m, sc };
    setGround(m, sc);
    renderWindowCards();
    fillThrough();
    kick();
    sceneProbe.then(() => {
      if (!wantsLive() || win.m !== m) return;
      const top = layers[layers.length - 1];
      if (top && top.sceneId === sc.id) { top.slug = m.s; return; }
      clearTimeout(mountTimer);
      // a scene boots on this page's main thread (same-origin frame): start it once the chart has stopped moving
      const quietAt = Math.max(st.introT0 + 2600, st.sel ? st.selT0 + lifeDur(st.sel) + 650 : 0);
      mountTimer = setTimeout(() => mount(m, sc), opts.now || RM ? 0 : Math.max(380, quietAt - now()));
    });
  }
  async function mount(m, sc) {
    const my = ++mountSeq;
    // one scene at a time: drop anything still loading and keep only the newest scene on show for the crossfade
    const shown = layers.filter(L => L.revealed && L.alive), keep = shown[shown.length - 1];
    layers.forEach(L => { if (L !== keep) kill(L); });
    layers = keep ? [keep] : [];
    const el = document.createElement('div'); el.className = 'pp-layer'; pupil.appendChild(el);
    let h;
    try { h = await S.frameScene(el, m.s, { interactive: true, title: 'Live scene: ' + sc.title }); }
    catch (e) { el.remove(); return; }
    const L = { el, h, sceneId: sc.id, slug: m.s, alive: true, revealed: false };
    if (my !== mountSeq) { kill(L); return; }
    h.iframe.tabIndex = st.through && st.thP >= 1 ? 0 : -1;
    if (!pupilSeen && h.pause) h.pause();
    layers.push(L);
    // Esc works from inside the scene too (the frame is same-origin): someone playing it can still step back out
    if (h.ready && h.ready.then) h.ready.then(() => {
      try { h.iframe.contentWindow.addEventListener('keydown', e => { if (e.key === 'Escape' && st.through && L.alive) { setThrough(false); try { h.iframe.blur(); } catch (err) { /* ignore */ } } }); } catch (e) { /* not reachable */ }
    });
    let fired = false;
    const reveal = () => {
      if (fired || !L.alive || my !== mountSeq) return; fired = true;
      L.revealed = true; el.classList.add('is-in'); root.classList.add('has-live');
      fillThrough();
      // once the new scene has faded in, the one beneath it is destroyed
      setTimeout(() => { if (!L.alive) return; layers.filter(x => x !== L).forEach(kill); layers = [L]; fillThrough(); kick(); }, RM ? 60 : 1150);
      kick();
    };
    if (h.ready && h.ready.then) h.ready.then(() => setTimeout(reveal, RM ? 0 : 250)); else h.iframe.addEventListener('load', () => setTimeout(reveal, 700));
    setTimeout(reveal, 7000);
  }
  function kill(L) { if (!L.alive) return; L.alive = false; try { L.h.destroy(); } catch (e) { /* already gone */ } L.el.remove(); }
  function killAll() { clearTimeout(mountTimer); mountSeq++; layers.forEach(kill); layers = []; root.classList.remove('has-live'); kick(); }
  const liveNow = () => layers.some(L => L.revealed && L.alive);
  // is the scene the window promises the one actually showing?
  const liveWin = () => !!win && layers.some(L => L.revealed && L.alive && L.sceneId === win.sc.id);

  // the window's ground, under any live scene: the era plate of the moment in the window (a small generic study in the
  // medium of its scene's chapter, from the site runtime), so the window is never an empty disc. It is all a phone shows
  // until someone taps to look through, and what a desktop shows while a scene tunes in.
  const plates = $$('.pp-plate', ground), groundTxt = $('.pp-ground-txt', ground);
  let plateKey = '', plateOn = null;
  function setGround(m, sc) {
    const c = m.c;
    ground.style.setProperty('--era', CH_HEX[c]);
    $('.pp-ground-y', ground).textContent = CH[c - 1].years;
    $('.pp-ground-e', ground).textContent = CH[c - 1].era;
    const pc = (sc && sc.chapter) || c, key = m.s + '|' + pc;
    if (!S.plate || plates.length < 2 || key === plateKey) return;
    plateKey = key;
    const cv = plates[0] === plateOn ? plates[1] : plates[0], old = plateOn;
    try { S.plate(cv, { s: m.s, c: pc }, { w: 360, h: 360 }); } catch (e) { return; }
    ground.insertBefore(cv, groundTxt);   // the newest plate paints on top and fades in over the last one
    cv.classList.remove('is-in'); void cv.offsetWidth; cv.classList.add('is-in');
    plateOn = cv;
    if (old) setTimeout(() => { if (plateOn !== old) old.classList.remove('is-in'); }, RM ? 0 : 750);
  }
  let lastPupil = '', pupilSeen = true;
  // the pupil box stops above the caption rail; it is centred on the window, and as the window opens (ex 0 to 1) it
  // settles into place above the rail, so the scene inside never changes its own size. When the chart is zoomed so far
  // that the window outgrows the box, the box is magnified with it (a compositor transform), so the round window never
  // shows the square edge of the scene behind it.
  function placePupil(ox, oy, hole, ex) {
    ex = ex || 0;
    const k = 1 - ex, Hp = Math.max(1, H - railH), bx = W / 2 + (ox - W / 2) * k, by = Hp / 2 + (oy - Hp / 2) * k;
    const x0 = Math.max(0, ox - hole), x1 = Math.min(W, ox + hole), y0 = Math.max(0, oy - hole), y1 = Math.min(H - railH * ex, oy + hole);
    let s = 1;
    if (x1 > x0 && y1 > y0) s = Math.max(1, Math.max(bx - x0, x1 - bx) / (W / 2), Math.max(by - y0, y1 - by) / (Hp / 2));
    s = s > 1.002 ? Math.min(6, Math.ceil(s * 200) / 200 + 0.01) : 1;
    const tx = Math.round(bx - W / 2), ty = Math.round(by - Hp / 2), key = tx + ',' + ty + ',' + Math.round(hole) + ',' + s;
    if (key === lastPupil) return; lastPupil = key;
    pupil.style.transform = `translate3d(${tx}px,${ty}px,0)` + (s > 1 ? ` scale(${s})` : '');
    ground.style.setProperty('--hole', Math.round(hole / s) + 'px');
    // zoomed or panned so far that the window is off the stage: let the scene rest
    const cx = clamp(ox, 0, W), cy = clamp(oy, 0, H), seen = hole > 1 && (cx - ox) ** 2 + (cy - oy) ** 2 < hole * hole;
    if (seen !== pupilSeen) { pupilSeen = seen; layers.forEach(L => { try { seen ? L.h.resume && L.h.resume() : L.h.pause && L.h.pause(); } catch (e) { /* ignore */ } }); }
  }

  // look through: the pupil dilates until the scene fills the stage
  let railTimer = 0;
  function setThrough(on) {
    if (on === st.through) return;
    if (on && sceneOK === false) return;
    st.through = on; st.thFrom = st.thP; st.thT0 = now();
    hideTip();
    if (on) {
      root.classList.add('is-through');
      clearTimeout(railTimer); throughEl.classList.remove('is-out'); throughEl.hidden = false; fillThrough();
      if (win && !liveNow() && !layers.length) { const m = win.m; mountSeq++; mount(m, win.sc); }
    } else {
      // the rail slides away as the window closes
      throughEl.classList.add('is-out'); clearTimeout(railTimer);
      railTimer = setTimeout(() => { if (!st.through) throughEl.hidden = true; throughEl.classList.remove('is-out'); }, RM ? 0 : 360);
      root.classList.remove('is-open');
      layers.forEach(L => { L.h.iframe.tabIndex = -1; });
    }
    kick();
  }
  function fillThrough() {
    if (!win) return;
    $('#pp-th-t').textContent = win.sc.title;
    throughEl.style.setProperty('--era', CH_HEX[win.m.c]);
    $('#pp-th-m').innerHTML = `<a href="${S.href('moment', { slug: win.m.s })}" data-moment="${esc(win.m.s)}">${win.m.th}</a>, ${esc(win.m.y)}`;
    $('#pp-th-m').title = win.m.t + ', ' + win.m.y;
    const o = $('#pp-th-open'); o.href = S.href('moment', { slug: win.m.s }); o.dataset.moment = win.m.s;
    $('#pp-th-k').textContent = liveWin() ? 'Live scene' : 'Tuning in';
  }

  // ── sizing ───────────────────────────────────────────────────────────────
  function resize() {
    const r = stage.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    railH = Math.round(parseFloat(getComputedStyle(root).getPropertyValue('--rail-h')) || 0);
    if (window.LR_SL_HERO && isPhone()) {
      // 9 Oct 2026 (direction D): the Subjects page hero on a phone: no sheet; the chart sits between the masthead and the controls
      sheetTop = 0; root.style.removeProperty('--sheet-top');
      const top = 150, bot = H - 136;
      SC = Math.min(W / 2 - 4, (bot - top) / 2) / 1.075; CX = W / 2; CY = (top + bot) / 2;
    } else if (isPhone()) {
      // the sheet's handle always stays on screen, even on a phone held sideways
      sheetTop = Math.round(Math.min(H - 120, Math.max(280, Math.min(H * 0.6, W + 60))));
      root.style.setProperty('--sheet-top', sheetTop + 'px');
      const top = 56, bot = sheetTop - 6;
      SC = Math.min(W / 2, (bot - top) / 2) / 1.075; CX = W / 2; CY = (top + bot) / 2;
    } else {
      sheetTop = 0; root.style.removeProperty('--sheet-top');
      SC = Math.min(W / 2 - 18, H / 2 - 20) / 1.08; CX = W / 2; CY = H / 2 + 4;
    }
    starScale = clamp(SC / NOMINAL, 0.55, 1.25);
    labelScale = clamp(0.72 + 0.3 * starScale, 0.84, 1.05);
    lastPupil = '';
    if (st.sel && life) buildLife(st.sel);
    measureUI();
    clampCam(camT); clampCam(cam);
    kick();
  }
  function measureUI() {
    const sr = stage.getBoundingClientRect();
    uiRects = ['#pp-tools', '#pp-zoom', '#pp-key', '#pp-hint', '#pp-filter'].map(s => $(s)).filter(el => el && !el.hidden && el.offsetParent !== null)
      .map(el => { const b = el.getBoundingClientRect(); return [b.left - sr.left - 6, b.top - sr.top - 6, b.right - sr.left + 6, b.bottom - sr.top + 6]; })
      .filter(b => b[2] > b[0] && b[3] > b[1]);
  }
  function clampCam(c) {
    const lim = Math.max(0, SC * c.k * 1.05 - Math.min(W, H) * 0.28);
    c.x = clamp(c.x, -lim, lim); c.y = clamp(c.y, -lim, lim);
  }

  // ── frame loop ───────────────────────────────────────────────────────────
  let raf = 0, lastT = 0;
  function kick() { if (!raf && st.started) { lastT = now(); raf = requestAnimationFrame(frame); } }
  function frame() {
    // one clock for everything: state timestamps come from performance.now(), which can run ahead of the rAF stamp
    const t = now();
    raf = 0;
    const dt = Math.min(64, t - lastT || 16); lastT = t;
    let busy = false;
    // camera
    const f = 1 - Math.exp(-dt / (camT.tau || 90));
    const lk = Math.log(cam.k), lt = Math.log(camT.k);
    if (Math.abs(lk - lt) > 1e-4 || Math.abs(cam.x - camT.x) > 0.25 || Math.abs(cam.y - camT.y) > 0.25) {
      cam.k = Math.exp(lerp(lk, lt, f));
      if (camT.anchor) { const A = camT.anchor; cam.x = A.px - CX - A.wx * SC * cam.k; cam.y = A.py - CY - A.wy * SC * cam.k; }
      else { cam.x = lerp(cam.x, camT.x, f); cam.y = lerp(cam.y, camT.y, f); }
      busy = true;
    } else { cam.k = camT.k; cam.x = camT.x; cam.y = camT.y; camT.anchor = null; }
    // star visibility tweens
    const fv = 1 - Math.exp(-dt / 110); let fm = false;
    for (let i = 0; i < P.length; i++) { const p = P[i]; if (p.vis !== p.visT) { p.vis = RM || Math.abs(p.vis - p.visT) < 0.01 ? p.visT : lerp(p.vis, p.visT, fv); fm = true; } }
    filterMoving = fm; if (fm) busy = true;
    // selection dim
    const sa = st.sel ? 1 : 0;
    if (st.selA !== sa) { st.selA = RM ? sa : (Math.abs(st.selA - sa) < 0.01 ? sa : lerp(st.selA, sa, 1 - Math.exp(-dt / 90))); busy = true; }
    // pupil hover
    const ph = st.hover && st.hover.type === 'pupil' ? 1 : 0;
    if (st.pupilHot !== ph) { st.pupilHot = Math.abs(st.pupilHot - ph) < 0.01 ? ph : lerp(st.pupilHot, ph, 1 - Math.exp(-dt / 90)); busy = true; }
    // look through
    const thTarget = st.through ? 1 : 0;
    if (st.thP !== thTarget) {
      const d = RM ? 1 : clamp((t - st.thT0) / 950, 0, 1);
      st.thP = lerp(st.thFrom, thTarget, d);
      if (d >= 1) {
        st.thP = thTarget;
        if (st.through) { root.classList.add('is-open'); layers.forEach(L => { L.h.iframe.tabIndex = 0; }); }
        else { root.classList.remove('is-through'); if (isPhone()) killAll(); }
      }
      busy = true;
    }
    draw(t);
    const I = t - st.introT0;
    if (!RM && I < 2600) busy = true;
    if (st.sel && t - st.selT0 < lifeDur(st.sel) + 900) busy = true;
    if (st.subj && t - st.subj.t0 < 2400) busy = true;
    if (t - st.lensT0 < 1100) busy = true;
    if (slMoving) busy = true;
    if (busy) raf = requestAnimationFrame(frame);
  }
  const lifeDur = p => RM ? 0 : Math.min(1900, 800 + p.cnt * 16);

  // ── drawing ──────────────────────────────────────────────────────────────
  // g is the context being drawn: the cached static layer (ground, rings, rim, web, links, stars) or the screen (overlays)
  const buf = document.createElement('canvas'), bctx = buf.getContext('2d');
  arcSafe(bctx);
  let g = ctx, bufKey = '';
  const charCache = new Map();
  function charW(ch) { const k = g.font + '|' + ch; let w = charCache.get(k); if (w === undefined) { w = g.measureText(ch).width; charCache.set(k, w); } return w; }
  function textW(s) { let w = 0; for (const ch of s) w += charW(ch); return w; }
  // letters set along a circle, centred on angle ac (clockwise from 12 o'clock), flipped to read left to right below the equator
  function arcText(str, ox, oy, r, ac, sp, flip, halo) {
    let total = 0; for (const ch of str) total += charW(ch) + sp; total -= sp;
    const dir = flip ? -1 : 1; let a = ac - dir * total / 2 / r;
    for (const ch of str) {
      const w = charW(ch), am = a + dir * (w / 2) / r, x = ox + r * Math.sin(am), y = oy - r * Math.cos(am), rot = flip ? am + Math.PI : am;
      const c = Math.cos(rot), s = Math.sin(rot);
      g.setTransform(dpr * c, dpr * s, -dpr * s, dpr * c, dpr * x, dpr * y);
      if (halo) g.strokeText(ch, -w / 2, 0);
      g.fillText(ch, -w / 2, 0);
      a += dir * (w + sp) / r;
    }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    return total;
  }
  const fits = (s, max, sp) => textW(s) + sp * (s.length - 1) <= max;
  const SHORT = {
    'SCREENS, STAGES AND IMMERSION': ['SCREENS AND STAGES', 'SCREENS'], 'INFORMATION AESTHETICS': ['INFORMATION'], 'VIDEO, GRAPHICS AND THE INTERFACE': ['VIDEO AND GRAPHICS', 'VIDEO'],
    'MODERNIST ABSTRACTION': ['MODERNISM'], 'OWNERSHIP ON CHAIN': ['ON CHAIN'], 'MATHEMATICS, CHANCE AND MUSIC': ['CHANCE AND MUSIC', 'CHANCE'],
    'CODE AS SKETCHBOOK': ['CODE'], 'LEARNING MACHINES': ['MACHINES'], 'GENERATIVE TEXT': ['TEXT'], 'KINETIC, OPTICAL AND CYBERNETIC': ['KINETIC AND OPTICAL', 'KINETIC'],
    'GAMES AND THE DEMOSCENE': ['GAMES'], 'ART MEETS TECHNOLOGY': ['ART AND TECH'], 'ARTIFICIAL LIFE AND EVOLUTION': ['ARTIFICIAL LIFE', 'A-LIFE'],
    'PLOTTERS, GRIDS AND DISORDER': ['PLOTTERS AND GRIDS', 'PLOTTERS'], 'ANIMATION AND 3D': ['ANIMATION', '3D'], 'THE NETWORKED WEB': ['THE WEB', 'WEB'],
    'SURVEYS OF THE FIELD': ['SURVEYS'], 'BAUHAUS AND DESIGN REFORM': ['BAUHAUS'],
    'SHOWS, SCENES AND INSTITUTIONS': ['SHOWS AND INSTITUTIONS', 'SHOWS'], 'LANGUAGES AND TOOLS OF CODE': ['TOOLS OF CODE', 'CODE'],
    'CRYPTO ART BEFORE THE BOOM': ['CRYPTO ART', 'CRYPTO'], 'PERFORMANCE, AVATARS AND VIRTUAL WORLDS': ['PERFORMANCE AND AVATARS', 'PERFORMANCE'],
    'HOME COMPUTERS AND THE CRACKING SCENE': ['HOME COMPUTERS'], 'LIGHT AND KINETIC ART': ['KINETIC ART', 'KINETIC'],
    'LOGIC, CALCULATION AND THE FIRST COMPUTERS': ['LOGIC AND CALCULATION', 'LOGIC'], 'EARLY COMPUTER DRAWING AND PLOTTERS': ['COMPUTER DRAWING', 'PLOTTERS'],
    'GENERATIVE TEXT AND POETRY': ['TEXT AND POETRY', 'POETRY'], 'CRAFT, WEAVING AND THE BAUHAUS': ['CRAFT AND WEAVING', 'BAUHAUS'],
    'RULES, INSTRUCTIONS AND CHANCE': ['RULES AND CHANCE', 'CHANCE'], '3D GRAPHICS AND VISUALIZATION': ['3D GRAPHICS', '3D'],
    'DEEP LEARNING AND IMAGE GENERATION': ['DEEP LEARNING'], 'INTERFACES AND HUMAN-COMPUTER INTERACTION': ['INTERFACES'],
    'THE WEB, NET ART AND FLASH': ['NET ART AND FLASH', 'NET ART', 'WEB'], 'LONG-FORM AND ON-CHAIN GENERATIVE ART': ['ON-CHAIN ART', 'ON CHAIN'],
    'INFORMATION AESTHETICS AND CYBERNETICS': ['INFORMATION AESTHETICS', 'CYBERNETICS'], 'GATEKEEPERS AND LEGITIMACY': ['GATEKEEPERS'],
    'MUSIC AND SOUND': ['MUSIC'], 'ANALOG ELECTRONICS AND OSCILLOSCOPES': ['OSCILLOSCOPES', 'ANALOG'], 'VIDEO AND TELEVISION': ['VIDEO'],
  };
  // shorter forms of a region name for a narrow arc, longest first: the curated ones, then a generic ladder
  // (the regions are regenerated from the text, so a name this list has never seen still gets a sensible short form)
  const FN = /^(AND|OF|THE|BEFORE|A|AN|IN|ON|FOR|TO|WITH|MEETS)$/;
  function shortForms(str) {
    const out = (SHORT[str] || []).slice();
    const parts = str.split(/,\s*| AND /).map(s => s.trim()).filter(Boolean);
    if (parts.length >= 3) out.push(parts[0] + ' AND ' + parts[1]);
    const lead = str.split(/,| AND | OF | BEFORE | MEETS /)[0].trim(); out.push(lead);
    const lw = lead.replace(/^THE /, '').split(/\s+/);
    if (lw.length === 1 || !FN.test(lw[lw.length - 1])) out.push(lw.join(' '));
    if (lw.length === 1 && lw[0].length >= 3) out.push(lw[0]);
    return out.filter((s, i, a) => s && s !== str && a.indexOf(s) === i);
  }
  const shortCache = new Map();
  function fitArc(str, r, span, sp) {
    const max = r * span - 14; if (max < 18) return '';
    if (fits(str, max, sp)) return str;
    let alts = shortCache.get(str); if (!alts) { alts = shortForms(str); shortCache.set(str, alts); }
    for (const alt of alts) if (fits(alt, max, sp)) return alt;
    return '';
  }
  const glowCache = new Map();
  function glow(c) {
    const k = c.join(','); let gl = glowCache.get(k); if (gl) return gl;
    gl = document.createElement('canvas'); gl.width = gl.height = 64; const x = gl.getContext('2d');
    const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, `rgba(${k},.55)`); gr.addColorStop(0.35, `rgba(${k},.16)`); gr.addColorStop(1, `rgba(${k},0)`);
    x.fillStyle = gr; x.fillRect(0, 0, 64, 64); glowCache.set(k, gl); return gl;
  }
  const lensRGB = p => (p.g === 'f' ? ORANGE_RGB : p.g === 'm' ? BLUE_RGB : GREY_RGB);
  // the colour a star shows right now: its ring's, or under the lens its recorded gender's
  function starRGB(p) {
    const c = CH_RGB[p.c]; if (!st.lens && !st.lensDir) return c;
    const lm = lensMix(p); if (lm <= 0) return c; const lc = lensRGB(p);
    return [lerp(c[0], lc[0], lm), lerp(c[1], lc[1], lm), lerp(c[2], lc[2], lm)];
  }
  function lensMix(p) {
    if (!st.lens && st.lensDir === 0) return 0;
    if (RM) return st.lens ? 1 : 0;
    const wave = RB + (1.05 - RB) * E.inOutSine(clamp((now() - st.lensT0) / 900, 0, 1));
    const passed = clamp((wave - p.r) / 0.07, 0, 1);
    return st.lens ? passed : 1 - passed;
  }
  function lensP() {
    if (!st.lens && !st.lensDir) return 0;
    const lt = clamp((now() - st.lensT0) / 1000, 0, 1);
    return RM ? (st.lens ? 1 : 0) : st.lens ? E.out3(lt) : 1 - E.out3(lt);
  }

  let filterVer = 0, filterMoving = false;
  const DBG = {};   // verification only: parts of the static layer a timing probe may skip
  function draw(t) {
    const I = RM ? 1e9 : t - st.introT0;
    const ex = E.inOut3(st.thP);
    const K = SC * cam.k * (1 + 1.25 * ex), ox = CX + cam.x * (1 - ex), oy = CY + cam.y * (1 - ex);
    let hole = R0 * K * E.out3(clamp(I / 750, 0, 1)) * (1 + 0.035 * st.pupilHot);
    if (ex > 0) hole = lerp(hole, Math.hypot(W, H) * 1.02, ex);
    V.K = K; V.ox = ox; V.oy = oy; V.hole = hole;
    placePupil(ox, oy, hole, ex);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (st.thP >= 0.999) return;
    const fade = 1 - ex, kz = (1 + 0.3 * Math.log2(cam.k)) * starScale;
    // the static layer is redrawn only when something in it moves
    // (a selection's links and its people are drawn over this layer, so while they grow it stays put)
    const moving = I < 2700 || st.lensDir !== 0 || ex > 0 || filterMoving;
    const hr = st.hover && st.hover.type === 'ring' ? st.hover.c : st.panelRing, hs = st.hover && st.hover.type === 'sector' ? st.hover.s.id : -1;
    const key = [W, H, dpr, cam.k.toFixed(5), cam.x.toFixed(2), cam.y.toFixed(2), filterVer, st.lens, st.sel ? st.sel.i : -1, st.selA.toFixed(3), hr, hs, Math.round(hole * 4), win ? win.m.c : 0, st.yrT.toFixed(3), Array.from(SL.kinds).join('')].join('|');
    if (moving || key !== bufKey) {
      if (buf.width !== cv.width || buf.height !== cv.height) { buf.width = cv.width; buf.height = cv.height; }
      g = bctx; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H); g.globalAlpha = 1;
      g.fillStyle = INK; g.beginPath(); g.rect(0, 0, W, H);
      if (hole > 0.5) { g.moveTo(ox + hole, oy); g.arc(ox, oy, hole, 0, TAU, true); }
      g.fill();
      if (!DBG.rings) drawRings(I, K, ox, oy, fade, hr);
      if (!DBG.rim) drawRim(I, K, ox, oy, fade, hs);
      if (!DBG.dust) drawDust(I, K, ox, oy, fade, hr);
      if (!DBG.web) drawWeb(I, K, ox, oy, fade);
      if (!DBG.stars) drawStars(I, K, ox, oy, fade, kz, BYSIZE, true);
      g.globalAlpha = 1;
      bufKey = moving ? '' : key;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(buf, 0, 0); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    g = ctx;
    drawDocs(K, ox, oy, fade); drawSL(K, ox, oy, fade); if (st.subj) drawSubj(t, I, K, ox, oy, fade, kz);
    if (st.sel && life) { drawCoLinks(t, K, ox, oy, fade); drawStars(I, K, ox, oy, fade, kz, life.stars, false); }
    if (slDim < 0.5) {                                 // LR-SUBJECTS-MAP: the chart's own overlays belong to Time
      drawHoverLinks(K, ox, oy, fade);
      drawThread(t, K, ox, oy, fade);
      drawHighlights(t, K, ox, oy, fade, kz);
      drawLabels(I, K, ox, oy, fade, kz);
    }
    if (SL.ready && st.thP <= 0) { slLabels(K, ox, oy, fade); slPathDraw(K, ox, oy, fade); }
    drawBezel(I, K, ox, oy, hole, fade * (1 - slDim));
    ctx.globalAlpha = 1;
  }

  function drawRings(I, K, ox, oy, fade, hr) {
    for (let c = 1; c <= 10; c++) {
      const e = E.out3(clamp((I - 200 - c * 55) / 650, 0, 1)); if (e <= 0) continue;
      let a = 0.05; if (st.era) a = st.era === c ? 0.16 : 0.02; if (hr === c) a += 0.08;
      g.globalAlpha = fade * e; g.fillStyle = `rgba(${CH_RGB[c].join(',')},${a})`;
      g.beginPath(); g.arc(ox, oy, ringOut[c] * K, 0, TAU); g.arc(ox, oy, ringIn[c] * K, 0, TAU, true); g.fill();
      g.strokeStyle = st.era === c || hr === c ? 'rgba(239,233,216,.45)' : 'rgba(239,233,216,.15)'; g.lineWidth = 1;
      g.beginPath(); g.arc(ox, oy, ringIn[c] * K, -Math.PI / 2, -Math.PI / 2 + TAU * e); g.stroke();
      // the last ring closes the chart; a hovered or chosen ring is drawn with both its edges
      if (c === 10 || st.era === c || hr === c) { g.beginPath(); g.arc(ox, oy, ringOut[c] * K, -Math.PI / 2, -Math.PI / 2 + TAU * e); g.stroke(); }
    }
    // women lens: an arc on each ring, its length the share of that chapter's moments flagged as women artists’
    const lp = lensP();
    if (lp > 0.001) {
      g.globalAlpha = fade * lp; g.lineCap = 'round';
      for (let c = 1; c <= 10; c++) {
        const share = chWomen[c] / chMoments[c].length, r = ringOut[c] * K - 2.5, a1 = -Math.PI / 2 + TAU * share * lp;
        g.strokeStyle = 'rgba(1,16,21,.9)'; g.lineWidth = 5; g.beginPath(); g.arc(ox, oy, r, -Math.PI / 2, a1); g.stroke();
        g.strokeStyle = '#FF4C00'; g.lineWidth = 2.4; g.beginPath(); g.arc(ox, oy, r, -Math.PI / 2, a1); g.stroke();
      }
      g.lineCap = 'butt';
    }
    // the year ruler down the bottom meridian (its plates are kept clear of names)
    rulerBoxes.length = 0;
    const le = clamp((I - 900) / 700, 0, 1); if (le <= 0) return;
    const fs = clamp(8.6 * Math.sqrt(cam.k) * starScale, 7.5, 11);
    g.font = `500 ${fs.toFixed(1)}px Rules, "Helvetica Neue", Arial, sans-serif`; g.textBaseline = 'middle'; g.textAlign = 'center';
    const yl = ['71,000 BCE', '1850', '1950', '1960', '1970', '1980', '1990', '2000', '2010', '2020'];
    let lastY = -1e9;
    for (let c = 1; c <= 11; c++) {
      const r = (c <= 10 ? ringIn[c] : R1) * K, s = c <= 10 ? yl[c - 1] : '2025', y = oy + r;
      if (y - lastY < fs + 2 || y > H - 4) continue; lastY = y;
      const w = textW(s) + 8;
      rulerBoxes.push([ox - w / 2 - 2, y - fs * 0.62 - 1, ox + w / 2 + 2, y + fs * 0.62 + 1]);
      // the first year steps aside while the window's "look through" line is written along its lower edge
      const yield1 = c === 1 ? 1 - st.pupilHot : 1;
      g.globalAlpha = fade * le * 0.92; g.fillStyle = INK; g.fillRect(ox - w / 2, y - fs * 0.62, w, fs * 1.24);
      g.globalAlpha = fade * le * yield1; g.fillStyle = hr === c || st.era === c ? 'rgba(252,251,247,.95)' : 'rgba(239,233,216,.62)'; g.fillText(s, ox, y + 0.5);
    }
    g.textAlign = 'left';
  }

  function drawRim(I, K, ox, oy, fade, hs) {
    const e = clamp((I - 800) / 800, 0, 1); if (e <= 0) return;
    g.globalAlpha = fade * e;
    const ri = RIM_IN * K, ro = RIM_OUT * K;
    g.strokeStyle = 'rgba(239,233,216,.32)'; g.lineWidth = 1;
    g.beginPath(); g.arc(ox, oy, ri, 0, TAU); g.stroke();
    g.strokeStyle = 'rgba(239,233,216,.13)'; g.beginPath(); g.arc(ox, oy, ro, 0, TAU); g.stroke();
    // ticks every 2 degrees, like the limb of an astrolabe
    g.strokeStyle = 'rgba(239,233,216,.22)'; g.beginPath();
    for (let d = 0; d < 180; d++) {
      const a = d / 180 * TAU, s = Math.sin(a), c = -Math.cos(a), l = (ro - ri) * (d % 5 === 0 ? 0.62 : 0.32);
      g.moveTo(ox + s * ri, oy + c * ri); g.lineTo(ox + s * (ri + l), oy + c * (ri + l));
    }
    g.stroke();
    // region boundaries: faint meridians into the rings, long ticks on the limb
    g.beginPath(); g.strokeStyle = 'rgba(239,233,216,.07)';
    SECT.forEach(s => { const sn = Math.sin(s.a0), cs = -Math.cos(s.a0); g.moveTo(ox + sn * RB * K, oy + cs * RB * K); g.lineTo(ox + sn * ri, oy + cs * ri); });
    g.stroke();
    g.beginPath(); g.strokeStyle = 'rgba(239,233,216,.55)';
    SECT.forEach(s => { const sn = Math.sin(s.a0), cs = -Math.cos(s.a0); g.moveTo(ox + sn * (ri - 3), oy + cs * (ri - 3)); g.lineTo(ox + sn * (ro + 7), oy + cs * (ro + 7)); });
    g.stroke();
    SECT.forEach(s => {
      if (s.id !== hs && s.id !== st.region) return;
      g.strokeStyle = s.id === st.region ? '#FF4C00' : 'rgba(239,233,216,.6)'; g.lineWidth = ro - ri;
      g.beginPath(); g.arc(ox, oy, (ri + ro) / 2, s.a0 - Math.PI / 2, s.a1 - Math.PI / 2); g.stroke(); g.lineWidth = 1;
    });
    // idea regions set around the outside
    const fs = clamp(8.4 * Math.pow(cam.k, 0.35) * starScale, 7, 10.5), sp = fs * 0.2;
    g.font = `500 ${fs.toFixed(1)}px Rules, "Helvetica Neue", Arial, sans-serif`; g.textBaseline = 'middle'; g.textAlign = 'left';
    const rl = RIM_LAB * K + (starScale < 0.8 ? 1 : 3);
    SECT.forEach(s => {
      const ac = (s.a0 + s.a1) / 2, flip = Math.cos(ac) < -0.05;
      const txt = fitArc(s.label.toUpperCase(), rl, s.a1 - s.a0, sp); if (!txt) return;
      g.fillStyle = s.id === st.region ? '#FF4C00' : s.id === hs ? 'rgba(252,251,247,1)' : 'rgba(239,233,216,.58)';
      arcText(txt, ox, oy, rl, ac, sp, flip);
    });
  }

  // the moments themselves, as dust: 1,083 points of light, one per moment, lit by the wave that brings the stars in
  function drawDust(I, K, ox, oy, fade, hr) {
    const wave = RM ? 9 : RB - 0.02 + (R1 + 0.08 - RB) * E.inOutSine(clamp((I - 250) / 1500, 0, 1));
    const s = clamp(1.25 * Math.pow(cam.k, 0.35) * Math.sqrt(starScale), 0.9, 2.6), h = s / 2;
    const dim = 1 - 0.55 * st.selA;
    for (let c = 1; c <= 10; c++) {
      const list = chMoments[c]; let a = st.subj && st.subj.ms.length ? 0.13 : 0.42;
      if (st.era) a = st.era === c ? 0.75 : 0.14; else if (hr === c) a = 0.7;
      g.globalAlpha = fade * a * dim; g.fillStyle = CH_HEX[c]; g.beginPath();
      for (let i = 0; i < list.length; i++) {
        const m = list[i]; if (m.pr > wave || (st.yrT < 0.999 && m.yn > yrOf(st.yrT))) continue;
        const x = ox + m.px * K, y = oy + m.py * K; if (x < -4 || y < -4 || x > W + 4 || y > H + 4) continue;
        g.rect(x - h, y - h, s, s);
      }
      g.fill();
    }
    if (st.subj && st.subj.ms.length) {           // LR-SUBJECTS: the subject's own moments, lit
      const s2 = s * 2.6, h2 = s2 / 2; g.globalAlpha = fade;
      st.subj.ms.forEach(m => { if (m.pr > wave) return; const x = ox + m.px * K, y = oy + m.py * K;
        if (x < -6 || y < -6 || x > W + 6 || y > H + 6) return; g.fillStyle = CH_HEX[m.c]; g.fillRect(x - h2, y - h2, s2, s2); });
    }
  }

  // a star hovered on the chart, or a person hovered in the panel
  const hoverStar = () => (st.hover && st.hover.type === 'star' ? st.hover.p : st.hoverPerson);
  function vis(p) { return p.vis * (st.sel && p !== st.sel && !(life ? life.starSet : st.sel.coTop).has(p) ? 1 - 0.8 * st.selA : 1) * (st.sel && st.src && p.visT < 1 && p !== st.sel ? 0.35 : 1) * (SL.kinds.has(0) ? 1 : 0.05) * (st.sel === p ? 1 : yrA(p.first && p.first.yn)); }

  function drawWeb(I, K, ox, oy, fade) {
    const e = RM ? 1 : clamp((I - 1500) / 800, 0, 1); if (e <= 0) return;
    const dim = 1 - 0.75 * st.selA;
    for (let pass = 0; pass < 2; pass++) {
      g.beginPath(); let any = false;
      for (let i = 0; i < EDGES.length; i++) {
        const ed = EDGES[i]; if ((ed.w > 1) !== (pass === 1)) continue;
        if (ed.A.vis < 0.5 || ed.B.vis < 0.5) continue;
        const ax = ox + ed.A.x * K, ay = oy + ed.A.y * K, bx = ox + ed.B.x * K, by = oy + ed.B.y * K;
        if ((ax < 0 && bx < 0) || (ax > W && bx > W) || (ay < 0 && by < 0) || (ay > H && by > H)) continue;
        g.moveTo(ax, ay); g.quadraticCurveTo(ox + ed.cx * K, oy + ed.cy * K, bx, by); any = true;
      }
      if (!any) continue;
      g.globalAlpha = fade * e * dim;
      g.strokeStyle = pass ? 'rgba(239,233,216,.16)' : 'rgba(239,233,216,.065)'; g.lineWidth = pass ? 0.9 : 0.6;
      g.stroke();
    }
  }

  // a person's constellation: their star joined to every moment that names them by the shortest set of lines that
  // reaches them all (a minimum spanning tree, the way star charts draw their figures). It grows out from the star
  // along its branches, so a name spreads across the eras and ideas it touches. Lines that would cross the window bend
  // round it.
  const segNear = (ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy || 1e-9, t = clamp(-(ax * dx + ay * dy) / l2, 0, 1); return Math.hypot(ax + dx * t, ay + dy * t); };
  const figures = new Map();
  function figureOf(p) {
    let o = figures.get(p); if (o) return o;
    const pos = p.m.slice().sort((a, b) => a.pr - b.pr || a.i - b.i).map(m => ({ m, x: m.px, y: m.py, d: 0 }));
    const nodes = [{ x: p.x, y: p.y, d: 0 }].concat(pos), n = nodes.length;
    const cost = (a, b) => { const d = Math.hypot(a.x - b.x, a.y - b.y); return segNear(a.x, a.y, b.x, b.y) < R0 * 1.12 ? d * 1.7 : d; };
    const inT = new Uint8Array(n), best = new Float64Array(n).fill(Infinity), from = new Int32Array(n).fill(-1), edges = [];
    best[0] = 0;
    for (let it = 0; it < n; it++) {
      let u = -1; for (let i = 0; i < n; i++) if (!inT[i] && (u < 0 || best[i] < best[u])) u = i;
      inT[u] = 1;
      if (from[u] >= 0) {
        const A = nodes[from[u]], B = nodes[u], bend = segNear(A.x, A.y, B.x, B.y) < R0 * 1.12;
        const c = bend ? ctrl(A.x, A.y, B.x, B.y) : [(A.x + B.x) / 2, (A.y + B.y) / 2];
        const len = bend ? Math.hypot(c[0] - A.x, c[1] - A.y) + Math.hypot(B.x - c[0], B.y - c[1]) : Math.hypot(B.x - A.x, B.y - A.y);
        B.d = A.d + len;
        edges.push({ A, B, cx: c[0], cy: c[1], bend, d0: A.d, d1: B.d });
      }
      for (let v = 0; v < n; v++) if (!inT[v]) { const c = cost(nodes[u], nodes[v]); if (c < best[v]) { best[v] = c; from[v] = u; } }
    }
    const maxD = Math.max(1e-6, ...nodes.map(q => q.d));
    o = { pos, edges, maxD, idx: new Map(pos.map((q, i) => [q.m.s, i])) };
    figures.set(p, o); return o;
  }
  // the selected person: their constellation, and links to everyone they share a moment with
  let life = null;
  // the people beside someone: everyone, or only those named with them in the source the filter is on
  function coOf(p) { return st.src ? Array.from(p.coBy[st.src], ([q, n]) => ({ q, n })).sort((a, b) => b.n - a.n || a.q.rank - b.q.rank) : p.coList; }
  const NOFIG = { pos: [], edges: [], maxD: 1e-6, idx: new Map() };
  function buildLife(p) {
    life = Object.assign({ p, co: coOf(p).slice(0, 28).map(({ q, n }) => { const c = ctrl(p.x, p.y, q.x, q.y); return { q, n, cx: c[0], cy: c[1] }; }) }, !st.src || st.src === 'm' ? figureOf(p) : NOFIG);
    // the selected person and everyone they share a moment with are drawn above their links, smallest first
    life.stars = coOf(p).slice(0, 28).map(x => x.q).concat([p]).sort((a, b) => a.cnt - b.cnt); life.starSet = new Set(life.stars);
  }
  function lifeProgress(t) { if (!st.sel || !life) return 0; const d = lifeDur(st.sel); return d ? E.out3(clamp((t - st.selT0 - 200) / d, 0, 1)) : 1; }
  // draw a figure's lines, each grown up to distance upto along the tree
  function strokeFigure(f, K, ox, oy, upto) {
    g.beginPath();
    for (let i = 0; i < f.edges.length; i++) {
      const e = f.edges[i]; if (e.d0 >= upto) continue;
      const tt = e.d1 <= upto ? 1 : (upto - e.d0) / (e.d1 - e.d0 || 1);
      const ax = ox + e.A.x * K, ay = oy + e.A.y * K, bx = ox + e.B.x * K, by = oy + e.B.y * K;
      g.moveTo(ax, ay);
      if (e.bend) quadTo(ax, ay, ox + e.cx * K, oy + e.cy * K, bx, by, tt);
      else g.lineTo(lerp(ax, bx, tt), lerp(ay, by, tt));
    }
  }

  function quadTo(ax, ay, cx, cy, bx, by, tt) {
    if (tt >= 1) { g.quadraticCurveTo(cx, cy, bx, by); return; }
    const qx = lerp(ax, cx, tt), qy = lerp(ay, cy, tt), u = 1 - tt;
    g.quadraticCurveTo(qx, qy, u * u * ax + 2 * u * tt * cx + tt * tt * bx, u * u * ay + 2 * u * tt * cy + tt * tt * by);
  }
  function drawCoLinks(t, K, ox, oy, fade) {
    if (!st.sel || !life) return;
    const p = st.sel, el = Math.max(0, t - st.selT0), ax = ox + p.x * K, ay = oy + p.y * K;
    // three weights, drawn outward from the star: one shared moment, a few, many
    for (let tier = 0; tier < 3; tier++) {
      g.beginPath(); let any = false;
      life.co.forEach((l, i) => {
        const tr = i < 4 ? 2 : i < 12 ? 1 : 0; if (tr !== tier || l.q.vis < 0.5) return;
        const gr = RM ? 1 : E.out3(clamp((el - 60 - Math.min(i, 40) * 14) / 520, 0, 1)); if (gr <= 0) return;
        g.moveTo(ax, ay); quadTo(ax, ay, ox + l.cx * K, oy + l.cy * K, ox + l.q.x * K, oy + l.q.y * K, gr); any = true;
      });
      if (!any) continue;
      g.globalAlpha = fade * [0.12, 0.36, 0.78][tier]; g.strokeStyle = '#FF4C00'; g.lineWidth = [0.6, 1, 1.7][tier];
      g.stroke();
    }
  }
  function drawHoverLinks(K, ox, oy, fade) {
    // a moment under the pointer (a point of light, a diamond, or a row in the panel): lines to every person it names
    const hm = st.hover && st.hover.type === 'moment' ? st.hover.m : st.hoverMoment ? BY.get(st.hoverMoment) : null;
    if (hm && hm.px !== undefined) {
      const mx = ox + hm.px * K, my = oy + hm.py * K;
      g.globalAlpha = fade; g.lineCap = 'round';
      if (hm.people.length) {
        g.beginPath(); hm.people.forEach(q => { g.moveTo(mx, my); g.lineTo(ox + q.x * K, oy + q.y * K); });
        g.strokeStyle = 'rgba(1,16,21,.8)'; g.lineWidth = 3; g.stroke(); g.strokeStyle = 'rgba(252,251,247,.85)'; g.lineWidth = 1; g.stroke();
        hm.people.forEach(q => { const r = q.sz * starScale * (1 + 0.3 * Math.log2(cam.k)) + 3.5; g.strokeStyle = '#FCFBF7'; g.lineWidth = 1.2; g.beginPath(); g.arc(ox + q.x * K, oy + q.y * K, r, 0, TAU); g.stroke(); });
      }
      g.fillStyle = CH_HEX[hm.c]; g.strokeStyle = INK; g.lineWidth = 1.5; g.beginPath(); g.arc(mx, my, 4, 0, TAU); g.fill(); g.stroke();
      g.strokeStyle = '#FCFBF7'; g.lineWidth = 1.2; g.beginPath(); g.arc(mx, my, 7.5, 0, TAU); g.stroke();
      g.lineCap = 'butt';
    }
    const hp = hoverStar();
    if (!hp || hp === st.sel) return;
    const ax = ox + hp.x * K, ay = oy + hp.y * K;
    if (st.sel && st.sel.coSet.has(hp)) {
      // hovering someone the selected person shares moments with: light the one link between them
      const q = st.sel, c = ctrl(hp.x, hp.y, q.x, q.y);
      g.globalAlpha = fade; g.lineCap = 'round';
      g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo(ox + c[0] * K, oy + c[1] * K, ox + q.x * K, oy + q.y * K);
      g.strokeStyle = 'rgba(1,16,21,.85)'; g.lineWidth = 4.5; g.stroke(); g.strokeStyle = '#FCFBF7'; g.lineWidth = 1.8; g.stroke();
      g.lineCap = 'butt';
    }
    // a preview of their constellation
    const f = figureOf(hp);
    g.globalAlpha = fade * (st.sel ? 0.75 : 0.95); g.lineJoin = 'round'; g.lineCap = 'round';
    strokeFigure(f, K, ox, oy, Infinity);
    g.strokeStyle = 'rgba(1,16,21,.8)'; g.lineWidth = 3.4; g.stroke();
    g.strokeStyle = 'rgba(239,233,216,.88)'; g.lineWidth = 1.2; g.stroke();
    g.lineCap = 'butt'; g.globalAlpha = fade;
    f.pos.forEach(q => { const x = ox + q.x * K, y = oy + q.y * K; g.fillStyle = CH_HEX[q.m.c]; g.beginPath(); g.arc(x, y, 2.6, 0, TAU); g.fill(); g.strokeStyle = INK; g.lineWidth = 1; g.stroke(); });
  }
  function drawThread(t, K, ox, oy, fade) {
    if (!st.sel || !life) return;
    const pr = lifeProgress(t), upto = pr >= 1 ? Infinity : pr * life.maxD;
    if (life.edges.length) {
      g.globalAlpha = fade; g.lineJoin = 'round'; g.lineCap = 'round';
      strokeFigure(life, K, ox, oy, upto);
      g.strokeStyle = 'rgba(1,16,21,.9)'; g.lineWidth = 4.6; g.stroke();
      g.strokeStyle = '#FCFBF7'; g.lineWidth = 1.5; g.stroke();
      g.lineCap = 'butt';
    }
    // the moments, as diamonds that land as the lines reach them
    const span = life.maxD * 0.04 + 1e-6, base = clamp(3.2 * Math.pow(cam.k, 0.3) * starScale, 2.4, 6);
    life.pos.forEach(q => {
      const m = q.m, e = upto === Infinity ? 1 : clamp((upto - q.d) / span, 0, 1); if (e <= 0) return;
      const hot = st.hoverMoment === m.s || (st.hover && st.hover.type === 'moment' && st.hover.m === m) || (win && win.m === m);
      const s = base * (m.f.includes('allTime') ? 1.35 : 1) * (hot ? 1.8 : 1) * E.outBack(e);
      const x = ox + q.x * K, y = oy + q.y * K;
      g.globalAlpha = fade;
      g.beginPath(); g.moveTo(x, y - s * 1.35); g.lineTo(x + s, y); g.lineTo(x, y + s * 1.35); g.lineTo(x - s, y); g.closePath();
      g.fillStyle = CH_HEX[m.c]; g.fill(); g.strokeStyle = INK; g.lineWidth = 1.3; g.stroke();
      if (hot) { g.strokeStyle = win && win.m === m ? '#FF4C00' : 'rgba(239,233,216,.95)'; g.lineWidth = 1.2; g.beginPath(); g.arc(x, y, s * 2.1, 0, TAU); g.stroke(); }
    });
  }

  function drawStars(I, K, ox, oy, fade, kz, list, skipLinked) {
    const wave = RM ? 9 : RB + (R1 + 0.06 - RB) * E.inOutSine(clamp((I - 420) / 1500, 0, 1));
    const lensOn = st.lens || st.lensDir, skip = skipLinked && st.sel && life ? life.starSet : null;
    for (let n = 0; n < list.length; n++) {
      const p = list[n]; if (skip && skip.has(p)) continue;
      let al = vis(p); if (al < 0.02) continue;
      const ap = clamp((wave - p.r) / 0.06, 0, 1); if (ap <= 0) continue;
      const sx = ox + p.x * K, sy = oy + p.y * K;
      if (sx < -30 || sy < -30 || sx > W + 30 || sy > H + 30) continue;
      const r = p.sz * kz * (ap < 1 ? E.outBack(ap) : 1);
      al *= ap < 1 ? ap : 1;
      let col = CH_RGB[p.c], hollow = 0;
      if (lensOn) { const lm = lensMix(p); if (lm > 0) { const lc = lensRGB(p); col = [lerp(col[0], lc[0], lm), lerp(col[1], lc[1], lm), lerp(col[2], lc[2], lm)]; if (!p.g) hollow = lm; } }
      if (p.sz >= 3.6 && al > 0.25) {
        const gs = r * 3.4; g.globalAlpha = fade * al * (0.75 - 0.6 * hollow);
        g.drawImage(glow(hollow > 0.5 ? GREY_RGB : col.map(v => v | 0)), sx - gs, sy - gs, gs * 2, gs * 2);
      }
      g.beginPath(); g.arc(sx, sy, r, 0, TAU);
      if (hollow < 1) { g.globalAlpha = fade * al * (1 - 0.8 * hollow); g.fillStyle = rgbStr(col); g.fill(); }
      if (hollow > 0) { g.globalAlpha = fade * al * (0.35 + 0.35 * hollow); g.strokeStyle = 'rgba(160,170,174,.9)'; g.lineWidth = 0.9; g.stroke(); }
      if (p.cnt >= 8 && hollow < 0.5) { g.globalAlpha = fade * al * 0.8; g.fillStyle = '#FCFBF7'; g.beginPath(); g.arc(sx, sy, r * 0.34, 0, TAU); g.fill(); }
      // no gender recorded, but named in the title of a moment flagged as a woman artist’s: an orange ring
      if (lensOn && p.wt && !p.g) { const lm = lensMix(p); if (lm > 0) { g.globalAlpha = fade * al * lm; g.strokeStyle = '#FF4C00'; g.lineWidth = 1.4; g.beginPath(); g.arc(sx, sy, r + 2.2, 0, TAU); g.stroke(); } }
    }
  }
  function drawHighlights(t, K, ox, oy, fade, kz) {
    const hp = hoverStar();
    g.globalAlpha = fade;
    if (hp) { const sx = ox + hp.x * K, sy = oy + hp.y * K, r = hp.sz * kz; g.strokeStyle = 'rgba(239,233,216,.9)'; g.lineWidth = 1.2; g.beginPath(); g.arc(sx, sy, r + 4, 0, TAU); g.stroke(); }
    if (st.sel) {
      const p = st.sel, sx = ox + p.x * K, sy = oy + p.y * K, r = p.sz * kz, el = Math.max(0, t - st.selT0);
      g.fillStyle = rgbStr(starRGB(p)); g.beginPath(); g.arc(sx, sy, r, 0, TAU); g.fill();
      g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(sx, sy, r + 4.5, 0, TAU); g.stroke();
      g.strokeStyle = '#FCFBF7'; g.lineWidth = 1.5; g.beginPath(); g.arc(sx, sy, r + 4.5, 0, TAU); g.stroke();
      g.strokeStyle = '#FF4C00'; g.lineWidth = 1.5; g.beginPath(); g.arc(sx, sy, r + 8.5, 0, TAU); g.stroke();
      if (!RM && el < 900) { const e = E.out3(el / 900); g.globalAlpha = fade * (1 - e) * 0.9; g.strokeStyle = '#FF4C00'; g.lineWidth = 2; g.beginPath(); g.arc(sx, sy, r + 8 + 60 * e, 0, TAU); g.stroke(); }
    }
  }

  const placed = [], rulerBoxes = [];
  const overlaps = (x0, y0, x1, y1, list) => { for (let i = 0; i < list.length; i++) { const b = list[i]; if (x0 < b[2] && x1 > b[0] && y0 < b[3] && y1 > b[1]) return true; } return false; };
  const onPupil = (x0, y0, x1, y1) => { const cx = clamp(V.ox, x0, x1), cy = clamp(V.oy, y0, y1); return (cx - V.ox) ** 2 + (cy - V.oy) ** 2 < (V.hole + 22) ** 2; };
  function freeBox(x0, y0, x1, y1, rim) {
    if (x0 < 4 || y0 < 4 || x1 > W - 4 || y1 > H - 4) return false;
    if (overlaps(x0, y0, x1, y1, placed) || overlaps(x0, y0, x1, y1, uiRects) || overlaps(x0, y0, x1, y1, rulerBoxes)) return false;
    if (onPupil(x0, y0, x1, y1)) return false;
    if (rim) {   // keep the quieter names off the ring of region names
      const dx = Math.max(x0 - V.ox, 0, V.ox - x1), dy = Math.max(y0 - V.oy, 0, V.oy - y1), near = Math.hypot(dx, dy);
      const far = Math.hypot(Math.max(Math.abs(x0 - V.ox), Math.abs(x1 - V.ox)), Math.max(Math.abs(y0 - V.oy), Math.abs(y1 - V.oy)));
      const r0 = (RIM_LAB - 0.012) * V.K, r1 = (RIM_LAB + 0.03) * V.K;
      if (far > r0 && near < r1) return false;
    }
    return true;
  }
  function drawLabels(I, K, ox, oy, fade, kz) {
    const e = RM ? 1 : clamp((I - 1650) / 650, 0, 1);
    placed.length = 0;
    // a hovered or filtered ring names its era along its top
    const ec = st.hover && st.hover.type === 'ring' ? st.hover.c : st.panelRing || st.era;
    if (ec) {
      const fs = clamp(9.5 * Math.sqrt(cam.k) * starScale, 8.5, 12.5);
      g.font = `500 ${fs.toFixed(1)}px Rules, "Helvetica Neue", Arial, sans-serif`; g.textBaseline = 'middle'; g.textAlign = 'left';
      g.globalAlpha = fade; g.lineWidth = 4; g.lineJoin = 'round'; g.strokeStyle = 'rgba(1,16,21,.95)'; g.fillStyle = '#FCFBF7';
      const r = (ringIn[ec] + ringOut[ec]) / 2 * K, txt = `${CH[ec - 1].years} · ${CH[ec - 1].era}`.toUpperCase();
      const w = arcText(txt, ox, oy, r, 0, fs * 0.2, false, true);
      placed.push([ox - w / 2 - 4, oy - r - fs, ox + w / 2 + 4, oy - r + fs]);
    }
    // names keep off the selected person's diamonds; the orbit's two ends carry their years once it is drawn
    if (st.sel && life) {
      life.pos.forEach(q => { const x = ox + q.x * K, y = oy + q.y * K; placed.push([x - 6, y - 7, x + 6, y + 7]); });
      const pr = lifeProgress(now());
      if (pr > 0.3 && life.pos.length > 1) {
        g.font = '500 10px Rules, "Helvetica Neue", Arial, sans-serif'; g.textBaseline = 'middle'; g.lineJoin = 'round';
        [[life.pos[0], 'First '], [life.pos[life.pos.length - 1], 'Last ']].forEach(([q, pre]) => {
          const s = (pre + q.m.y).toUpperCase(), w = textW(s) + s.length * 1.2, x = ox + q.x * K, y = oy + q.y * K;
          const opts = [[x + 10, y], [x - 10 - w, y], [x - w / 2, y - 15], [x - w / 2, y + 15], [x + 8, y + 15], [x - 8 - w, y + 15], [x + 8, y - 15], [x - 8 - w, y - 15]];
          // near the rim every side can touch the region names: then step in toward the center until it is clear
          const dr = Math.hypot(x - ox, y - oy) || 1, ux = (ox - x) / dr, uy = (oy - y) / dr;
          [22, 34, 48, 62].forEach(d => opts.push([x + ux * d - w / 2, y + uy * d]));
          // off the ring of region names when it can be, anywhere free when it cannot
          const boxes = opts.map(o => [o[0] - 4, o[1] - 8, o[0] + w + 4, o[1] + 8]);
          let k = boxes.findIndex(b => freeBox(...b, true)); if (k < 0) k = boxes.findIndex(b => freeBox(...b));
          for (const o of k < 0 ? [] : [opts[k]]) {
            const b = boxes[k];
            placed.push(b); g.globalAlpha = fade * clamp((pr - 0.3) * 4, 0, 1);
            g.fillStyle = 'rgba(1,16,21,.9)'; g.fillRect(b[0], b[1], b[2] - b[0], b[3] - b[1]);
            g.fillStyle = CH_HEX[q.m.c]; g.fillRect(b[0], b[1], 2, b[3] - b[1]);
            g.fillStyle = '#FCFBF7'; let cx = o[0]; for (const ch of s) { g.fillText(ch, cx, o[1] + 0.5); cx += charW(ch) + 1.2; }
            break;
          }
        });
        g.textBaseline = 'alphabetic';
      }
    }
    const cands = [];
    const hp = hoverStar();
    if (st.sel) cands.push([st.sel, 3]);
    if (hp && hp !== st.sel) cands.push([hp, 3]);
    if (st.sel && life && (now() - st.selT0 > 250 || RM)) st.sel.coList.slice(0, 16).forEach(({ q }) => cands.push([q, 2]));
    if (st.lens) RANKED.forEach(p => { if (p.g === 'f' && p.vis > 0.5) cands.push([p, 1.5]); });
    if (e > 0 && st.selA < 0.5) {
      const minCnt = cam.k < 1.4 ? 7 : cam.k < 2.2 ? 4 : cam.k < 3.5 ? 2 : 1;
      for (let i = 0; i < RANKED.length; i++) { const p = RANKED[i]; if (p.tot < minCnt * 1.6) break; if (p.vis > 0.5) cands.push([p, 1]); }
    }
    g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round';
    const seen = new Set();
    for (let n = 0; n < cands.length; n++) {
      const [p, pri] = cands[n]; if (seen.has(p)) continue; seen.add(p);
      const fs = Math.round((pri >= 3 ? 19 : pri >= 2 ? 15 : p.cnt >= 12 ? 15 : 13.5) * labelScale * 2) / 2;
      g.font = `italic 400 ${fs}px "EB Garamond", Georgia, serif`;
      const w = textW(p.n), extra = pri >= 3 ? 26 : 0;
      const sx = ox + p.x * K, sy = oy + p.y * K, r = p.sz * kz + (p === st.sel ? 11 : 4);
      // right of the star, then left, then above, then below; quiet names only try the sides
      const opts = [[sx + r, sy + fs * 0.32], [sx - r - w - extra, sy + fs * 0.32], [sx - (w + extra) / 2, sy - r - fs * 0.3], [sx - (w + extra) / 2, sy + r + fs * 0.9]];
      // a star near the edge of the stage: above or below it, slid along so a long name stays whole on screen
      if (pri >= 2) { const cx = clamp(sx - (w + extra) / 2, 8, W - 10 - w - extra); if (Math.abs(cx - opts[2][0]) > 1) opts.push([cx, sy - r - fs * 0.3], [cx, sy + r + fs * 0.9]); }
      const boxOf = o => [o[0] - 2, o[1] - fs * 0.78, o[0] + w + 3 + extra, o[1] + fs * 0.28];
      // every name keeps off the ring of region names when it can; a chosen name may sit on it when nothing else is free
      let pick = -1, backed = false; const tries = pri >= 2 ? opts.length : 2;
      for (let o = 0; o < tries && pick < 0; o++) if (freeBox(...boxOf(opts[o]), true)) pick = o;
      if (pri >= 2) for (let o = 0; o < tries && pick < 0; o++) if (freeBox(...boxOf(opts[o]), false)) pick = o;
      if (pick < 0) {
        if (pri < 3) continue;
        // the selected or hovered name always shows: on screen and off the window, even over another name
        // otherwise the side where it covers least: the year ruler and the controls count most, other names least
        const onStage = b => b[0] >= 4 && b[2] <= W - 4 && b[1] >= 4 && b[3] <= H - 4 && !onPupil(...b);
        const cover = (b, list) => { let a = 0; for (const c of list) a += Math.max(0, Math.min(b[2], c[2]) - Math.max(b[0], c[0])) * Math.max(0, Math.min(b[3], c[3]) - Math.max(b[1], c[1])); return a; };
        // on a narrow stage the window can block both sides of a star at its own height: then the name slides further
        // above or below, still whole on screen, and a name that must cross the year ruler is set on its own dark plate
        const cx = clamp(sx - (w + extra) / 2, 8, W - 10 - w - extra);
        for (let k = 1; k <= 8; k++) { const d = k * fs * 0.7; opts.push([cx, sy + r + fs * 0.9 + d], [cx, sy - r - fs * 0.3 - d]); }
        let best = Infinity;
        for (let o = 0; o < opts.length; o++) {
          const b = boxOf(opts[o]); if (!onStage(b)) continue;
          const far = Math.max(0, Math.abs(opts[o][1] - sy) - r - fs);
          const sc = 3 * cover(b, rulerBoxes) + 3 * cover(b, uiRects) + cover(b, placed) + o + far * 30;
          if (sc < best) { best = sc; pick = o; }
        }
        if (pick < 0) pick = 0; else backed = overlaps(...boxOf(opts[pick]), rulerBoxes) || overlaps(...boxOf(opts[pick]), placed);
      }
      const x = opts[pick][0], y = opts[pick][1], box = boxOf(opts[pick]);
      placed.push(box);
      g.globalAlpha = (pri >= 2 ? 1 : e) * fade;
      if (backed) { g.fillStyle = 'rgba(1,16,21,.9)'; g.fillRect(box[0] - 3, box[1] - 2, box[2] - box[0] + 6, box[3] - box[1] + 4); }
      if (pri >= 3 && Math.abs(y - sy) - r - fs > 2) {   // a name set away from its star keeps a leader line to it
        const tx = clamp(sx, box[0] + 6, box[2] - 6), ty = y < sy ? box[3] + 2 : box[1] - 2, d = Math.hypot(tx - sx, ty - sy) || 1;
        g.strokeStyle = 'rgba(252,251,247,.75)'; g.lineWidth = 1; g.beginPath(); g.moveTo(sx + (tx - sx) / d * (r + 2), sy + (ty - sy) / d * (r + 2)); g.lineTo(tx, ty); g.stroke();
      }
      g.strokeStyle = 'rgba(1,16,21,.92)'; g.lineWidth = 3.5; g.strokeText(p.n, x, y);
      g.fillStyle = pri >= 3 ? '#FCFBF7' : pri >= 2 ? 'rgba(239,233,216,.95)' : p.cnt >= 12 ? 'rgba(239,233,216,.88)' : 'rgba(239,233,216,.7)';
      if (st.lens && p.g === 'f' && pri < 3) g.fillStyle = '#FF9A70';
      g.fillText(p.n, x, y);
      if (pri >= 3) {
        g.font = '500 10.5px Rules, "Helvetica Neue", Arial, sans-serif';
        const s = String(p.tot); g.strokeText(s, x + w + 6, y - 1); g.fillStyle = '#FF4C00'; g.fillText(s, x + w + 6, y - 1);
      }
    }
    // a moment hovered in the panel gets its year and title beside its diamond
    const hm = st.hoverMoment && life ? life.idx.get(st.hoverMoment) : undefined;
    if (hm !== undefined) {
      const q = life.pos[hm], m = q.m, x = ox + q.x * K, y = oy + q.y * K, title = m.t.length > 46 ? m.t.slice(0, 44) + '…' : m.t;
      g.globalAlpha = fade; g.font = 'italic 400 15px "EB Garamond", Georgia, serif';
      const w = Math.max(textW(title), 40); let lx = x + 14; if (lx + w > W - 10) lx = x - 14 - w;
      g.fillStyle = 'rgba(1,16,21,.92)'; g.fillRect(lx - 7, y - 27, w + 14, 36);
      g.strokeStyle = CH_HEX[m.c]; g.lineWidth = 2; g.beginPath(); g.moveTo(lx - 7, y - 27); g.lineTo(lx - 7, y + 9); g.stroke();
      g.fillStyle = '#FCFBF7'; g.fillText(title, lx, y + 3);
      g.font = '500 9.5px Rules, "Helvetica Neue", Arial, sans-serif'; g.fillStyle = 'rgba(239,233,216,.7)'; g.fillText(String(m.y).toUpperCase(), lx, y - 13);
    }
  }

  function drawBezel(I, K, ox, oy, hole, fade) {
    if (hole < 2) return;
    const e = RM ? 1 : clamp((I - 350) / 700, 0, 1);
    const c = win ? win.m.c : 1;
    g.globalAlpha = fade * e;
    g.strokeStyle = 'rgba(239,233,216,.7)'; g.lineWidth = 1; g.beginPath(); g.arc(ox, oy, hole + 0.5, 0, TAU); g.stroke();
    g.strokeStyle = CH_HEX[c]; g.lineWidth = 2 + st.pupilHot; g.beginPath(); g.arc(ox, oy, hole + 4, -Math.PI / 2, -Math.PI / 2 + TAU * e); g.stroke();
    const gap = RB * K - hole;
    if (gap < 20) return;
    g.strokeStyle = 'rgba(239,233,216,.3)'; g.lineWidth = 1; g.beginPath();
    for (let d = 0; d < 72; d++) { const a = d / 72 * TAU, s = Math.sin(a), cc = -Math.cos(a), r1 = hole + 7, r2 = hole + (d % 6 === 0 ? 11 : 9); g.moveTo(ox + s * r1, oy + cc * r1); g.lineTo(ox + s * r2, oy + cc * r2); }
    g.stroke();
    if (!win) return;
    const fs = clamp(8 * starScale * Math.pow(cam.k, 0.2), 7, 10);
    g.font = `500 ${fs.toFixed(1)}px Rules, "Helvetica Neue", Arial, sans-serif`; g.textBaseline = 'middle'; g.textAlign = 'left';
    const live = liveWin();
    // "tuning in" only while a scene is actually on its way (a phone waits for a tap before it loads one)
    const title = win.sc.title, pre = live ? (/\blive\b/i.test(title) ? '' : 'Live · ') : wantsLive() ? 'Tuning in · ' : '';
    const cap = (pre + (sceneOK ? title : CH[c - 1].years + ' · ' + CH[c - 1].era)).toUpperCase();
    const r = hole + 16 + fs * 0.1;
    const txt = fitArc(cap, r, Math.PI * 0.95, fs * 0.22) || '';
    g.fillStyle = live ? 'rgba(252,251,247,.95)' : 'rgba(239,233,216,.7)';
    const tw = arcText(txt, ox, oy, r, 0, fs * 0.22, false);
    if (live && txt) { const a = -tw / 2 / r - 7 / r; g.fillStyle = '#FF4C00'; g.beginPath(); g.arc(ox + r * Math.sin(a), oy - r * Math.cos(a), 2.4, 0, TAU); g.fill(); }
    if (sceneOK && (st.pupilHot > 0.05 || isPhone())) {
      g.globalAlpha = fade * e * (isPhone() ? 0.8 : st.pupilHot); g.fillStyle = 'rgba(239,233,216,.85)';
      arcText(((isPhone() ? 'Tap' : 'Click') + ' to look through').toUpperCase(), ox, oy, r, Math.PI, fs * 0.22, true);
    }
  }

  // ── hit testing and pointer input ────────────────────────────────────────
  function hit(x, y, touch) {
    const K = V.K, ox = V.ox, oy = V.oy, kz = (1 + 0.3 * Math.log2(cam.k)) * starScale, tol = touch ? 11 : 4;
    let best = null, bd = Infinity;
    if (st.sel && life) life.pos.forEach(q => {
      const dx = ox + q.x * K - x, dy = oy + q.y * K - y, d = Math.sqrt(dx * dx + dy * dy), rr = (touch ? 13 : 7);
      if (d < rr && d / rr < bd) { bd = d / rr; best = { type: 'moment', m: q.m }; }
    });
    // 8 Oct 2026: an editorial mark, a subject and a person's star under the pointer: the nearest to the pointer wins
    // (editorial marks used to come first, so Holly Herndon's star could open Discord); within a pixel, the person,
    // then the subject, then the editorial
    if (best) return best;
    const hd0 = hitDoc(x, y, touch), hs0 = hitSL(x, y, touch); let sd2 = Infinity;
    for (let i = 0; i < P.length; i++) {
      const p = P[i]; if (p.vis < 0.5 || slDim > 0.5) continue;
      const dx = ox + p.x * K - x, dy = oy + p.y * K - y, rr = p.sz * kz + tol, d2 = dx * dx + dy * dy;
      if (d2 < rr * rr) { const s = Math.sqrt(d2) / rr - (p === st.sel ? 0.1 : 0) - Math.min(0.2, p.cnt * 0.004); if (s < bd) { bd = s; best = { type: 'star', p }; sd2 = d2; } }
    }
    const near = [best && [sd2, 0, best], hs0 && [hs0.d2, 1, hs0], hd0 && [hd0.d2, 2, hd0]].filter(Boolean).sort((a, b) => (Math.abs(a[0] - b[0]) <= 1 ? a[1] - b[1] : a[0] - b[0]));
    if (near.length) return near[0][2];
    if (slDim > 0.5) return null;
    const dx = x - ox, dy = y - oy, dr = Math.hypot(dx, dy);
    if (dr < V.hole) return { type: 'pupil' };
    // the points of light: every moment answers to a fine pointer (a touch aims at people, not dust)
    if (!touch && st.thP === 0) {
      const tolM = 4.5 + 1.5 * Math.min(1, Math.log2(cam.k)); let bm = null, bdm = tolM * tolM;
      for (let i = 0; i < IX.length; i++) {
        const m = IX[i]; if (st.era && m.c !== st.era) continue;
        const ddx = ox + m.px * K - x, ddy = oy + m.py * K - y, d2 = ddx * ddx + ddy * ddy;
        if (d2 < bdm) { bdm = d2; bm = m; }
      }
      if (bm) return { type: 'moment', m: bm, dust: true };
    }
    const wr = dr / K;
    if (wr >= RB && wr <= R1) { for (let c = 1; c <= 10; c++) if (wr >= ringIn[c] && wr < ringOut[c]) return { type: 'ring', c }; }
    if (wr > R1 && wr < RIM_LAB + 0.06) {
      let a = Math.atan2(dx, -dy); const s = SECT.find(s => { const d = angDiff(a - s.ac); return Math.abs(d) <= (s.a1 - s.a0) / 2; });
      if (s) return { type: 'sector', s };
    }
    return null;
  }
  const sameHit = (a, b) => a === b || (a && b && a.type === b.type && a.p === b.p && a.d === b.d && a.m === b.m && a.c === b.c && a.s === b.s);

  function setHover(h, x, y) {
    if (!sameHit(h, st.hover)) { st.hover = h; kick(); }
    cv.classList.toggle('is-hot', !!h);
    if (!h || !finePointer) { hideTip(); return; }
    let html = '';
    if (h.type === 'star') {
      const p = h.p, span = p.first === p.last ? esc(p.first.y) : `${esc(p.first.y)} to ${esc(p.last.y)}`;
      const shared = st.sel && p !== st.sel ? st.sel.co.get(p) || 0 : 0;
      html = `<p class="t-k"><i style="background:${CH_HEX[p.c]}"></i><span class="lab">${esc(CH[p.c - 1].years)} ring</span></p><p class="t-n">${esc(p.n)}</p>
        <p class="t-m">${countsOf(p)}${p.m.length ? ', ' + span : ''}</p>
        ${p.ctx ? `<p class="t-m">${p.yrs ? 'Placed by their dates, ' + esc(p.yrs) : 'Placed by context'}: no Timeline moment names them</p>` : ''}
        ${p.co.size ? `<p class="t-m">Mentioned with ${fmt(p.co.size)} other ${p.co.size === 1 ? 'person' : 'people'}</p>` : ''}
        ${shared ? `<p class="t-m t-sh">Mentioned with ${esc(st.sel.n)} ${shared === 1 ? 'once' : fmt(shared) + ' times'}</p>` : ''}
        ${st.lens ? `<p class="t-m">${p.g === 'f' ? 'Recorded as a woman' : p.g === 'm' ? 'Recorded as a man' : 'No gender recorded'}${!p.g && p.wt ? `; named in the title of ${p.wt === 1 ? 'a moment' : fmt(p.wt) + ' moments'} flagged as women artists’` : ''}</p>` : ''}
        <p class="t-a">${p === st.sel ? 'Selected' : 'Click for their constellation'}</p>`;
    } else if (h.type === 'moment') {
      const m = h.m, ps = m.people.slice().sort((a, b) => a.rank - b.rank), nm = ps.slice(0, 4).map(q => esc(q.n));
      const names = !ps.length ? 'Names no one on the chart' : 'Names ' + (ps.length <= 4 ? (nm.length > 1 ? nm.slice(0, -1).join(', ') + ' and ' + nm[nm.length - 1] : nm[0]) : nm.join(', ') + ` and ${fmt(ps.length - 4)} more`);
      html = `<p class="t-k"><i style="background:${CH_HEX[m.c]}"></i><span class="lab">${esc(m.y)} &middot; ${esc(CH[m.c - 1].years)} ring</span></p><p class="t-n">${m.th}</p>
        <p class="t-m">${names}</p>${bridgeTip(m)}<p class="t-a">Click to open the moment</p>`;
    } else if (h.type === 'doc') {
      html = docTip(h.d);
    } else if (h.type === 'sl') {
      html = slTip(h.s); slWake();
      if (!h.s.W) slW(h.s.slug).then(w => { h.s.W = w; if (st.hover && st.hover.s === h.s && !tip.hidden) { const t = tip.querySelector('.t-a'); if (t && w.w[0]) { tip.querySelectorAll('.t-w').forEach(x => x.remove()); t.insertAdjacentHTML('beforebegin', slWhy(h.s)); } } });
    } else if (h.type === 'pupil') {
      if (!win) return hideTip();
      html = `<p class="t-k"><span class="lab">In the window</span></p><p class="t-n">${esc(win.sc.title)}</p><p class="t-m">${esc(win.sc.blurb)}</p>
        <p class="t-m">For ${win.m.th}, ${esc(win.m.y)}</p>${sceneOK ? '<p class="t-a">Click to look through</p>' : ''}`;
    } else if (h.type === 'ring') {
      const c = h.c, ch = CH[c - 1];
      html = `<p class="t-k"><i style="background:${CH_HEX[c]}"></i><span class="lab">Chapter ${c} &middot; ${esc(ch.years)}</span></p><p class="t-n">${esc(ch.era)}</p>
        <p class="t-m">${fmt(ringPeople[c])} people sit in this ring &middot; ${fmt(ch.count)} moments</p>
        ${st.lens ? `<p class="t-m">${fmt(chWomen[c])} of its moments (${Math.round(100 * chWomen[c] / chMoments[c].length)}%) are flagged as women artists’</p>` : ''}
        <p class="t-a">${st.era === c ? 'Click to show everyone again' : 'Click to show who appears in the ' + esc(ch.years)}</p>`;
    } else if (h.type === 'sector') {
      const s = h.s;
      html = `<p class="t-k"><span class="lab">Idea region</span></p><p class="t-n">${esc(s.label)}</p>
        <p class="t-m">${fmt(s.n)} people sit in this region${s.terms.length ? ' &middot; ' + s.terms.slice(0, 3).map(esc).join(', ') : ''}</p>
        <p class="t-a">${st.region === s.id ? 'Click to show everyone again' : 'Click to show who touches it'}</p>`;
    }
    tip.innerHTML = html; tip.hidden = false;
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    let tx = x + 18, ty = y + 18; if (tx + tw > W - 10) tx = x - tw - 14; if (ty + th > H - 10) ty = y - th - 14;
    tip.style.transform = `translate(${Math.max(8, tx)}px,${Math.max(8, ty)}px)`;
  }
  function hideTip() { if (!tip.hidden) tip.hidden = true; }

  function onTap(x, y, touch) {
    const h = hit(x, y, touch); hideTip();
    if (HERO && !h && st.slSel) return slSelect(null);
    if (HERO && h) {                                    // the hero opens pages; the page below holds the reading
      // one shared selection with the page below: a first click selects (and lights its row), a second opens the page
      if (h.type === 'sl') return st.slSel === h.s ? slOpen(h.s.slug) : slSelect(h.s, x, y);
      if (h.type === 'star') { const q = SL.p2s && SL.by.get(SL.p2s.get(h.p)); if (q) return st.slSel === q ? slOpen(q.slug) : slSelect(q, x, y); return; }
      if (h.type === 'doc') { const u = h.d.u || (h.d.k === 'a' && h.d.s ? LRWEB + '/editorial/' + h.d.s : ''); if (u) try { window.parent.postMessage({ lrembed: 'open', url: u }, '*'); } catch (e) {} return; }
      if (h.type === 'moment') { try { window.parent.postMessage({ lrsite: 'go', page: 'moment', params: { slug: h.m.s } }, '*'); } catch (e) {} return; }
    }
    if (!h) { if (st.sel) select(null); return; }
    if (h.type === 'star') { select(h.p === st.sel ? null : h.p); if (isPhone() && h.p) setSheet(false); }
    else if (h.type === 'doc') enterDoc(h.d);
    else if (h.type === 'sl') enterSL(h.s);
    else if (h.type === 'moment') S.go('moment', { slug: h.m.s });
    else if (h.type === 'pupil') { if (sceneOK) setThrough(true); }
    else if (h.type === 'ring') setEra(st.era === h.c ? 0 : h.c);
    else if (h.type === 'sector') setRegion(st.region === h.s.id ? -1 : h.s.id);
  }

  function zoomAt(px, py, f, tau) {
    const k0 = camT.k, k1 = clamp(k0 * f, 1, 14);
    const wx = (px - CX - camT.x) / (SC * k0), wy = (py - CY - camT.y) / (SC * k0);
    camT.k = k1; camT.x = px - CX - wx * SC * k1; camT.y = py - CY - wy * SC * k1;
    const before = camT.x; clampCam(camT);
    camT.anchor = before === camT.x ? { px, py, wx, wy } : null; camT.tau = tau || 90;
    kick();
  }
  function resetCam() { camT.k = 1; camT.x = 0; camT.y = 0; camT.anchor = null; camT.tau = 240; kick(); }
  function ensureVisible(p) {
    // only move the chart when the star is actually out of view
    const sx = V.ox + p.x * V.K, sy = V.oy + p.y * V.K, m = 24, r = p.sz * starScale + 10;
    const top = isPhone() ? 56 : 24, bot = isPhone() ? sheetTop - 12 : H - 24;
    if (sx < m || sx > W - m || sy < top || sy > bot || overlaps(sx - r, sy - r, sx + r, sy + r, uiRects)) {
      camT.anchor = null; camT.tau = 260;
      camT.x = -p.x * SC * camT.k + (isPhone() ? 0 : 0); camT.y = -p.y * SC * camT.k; clampCam(camT); kick();
    }
  }

  function bindPointer() {
    const ptrs = new Map(); let drag = null, pinch = null;
    const pos = e => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    cv.addEventListener('pointerdown', e => {
      if (e.button > 0) return;
      try { cv.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      const p = pos(e); ptrs.set(e.pointerId, p);
      if (ptrs.size === 1) drag = { x0: p.x, y0: p.y, cx: camT.x, cy: camT.y, moved: false, t: now(), touch: e.pointerType !== 'mouse' };
      else if (ptrs.size === 2) {
        const [a, b] = Array.from(ptrs.values());
        pinch = { d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, k0: camT.k, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, x0: camT.x, y0: camT.y };
        if (drag) drag.moved = true;
      }
    });
    cv.addEventListener('pointermove', e => {
      const p = pos(e);
      if (ptrs.has(e.pointerId)) ptrs.set(e.pointerId, p);
      if (pinch && ptrs.size >= 2) {
        const [a, b] = Array.from(ptrs.values()), d = Math.hypot(a.x - b.x, a.y - b.y), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        const k1 = clamp(pinch.k0 * d / pinch.d0, 1, 14);
        const wx = (pinch.mx - CX - pinch.x0) / (SC * pinch.k0), wy = (pinch.my - CY - pinch.y0) / (SC * pinch.k0);
        camT.k = k1; camT.x = mx - CX - wx * SC * k1; camT.y = my - CY - wy * SC * k1; camT.anchor = null; clampCam(camT);
        cam.k = camT.k; cam.x = camT.x; cam.y = camT.y; kick(); return;
      }
      if (drag && ptrs.has(e.pointerId)) {
        const dx = p.x - drag.x0, dy = p.y - drag.y0;
        if (!drag.moved && Math.hypot(dx, dy) > (drag.touch ? 8 : 4)) { drag.moved = true; cv.classList.add('is-drag'); hideTip(); }
        if (drag.moved) { camT.x = drag.cx + dx; camT.y = drag.cy + dy; camT.anchor = null; clampCam(camT); cam.x = camT.x; cam.y = camT.y; kick(); }
        return;
      }
      if (e.pointerType === 'mouse') setHover(hit(p.x, p.y, false), p.x, p.y);
    });
    const end = e => {
      const p = pos(e); ptrs.delete(e.pointerId);
      if (pinch) { if (ptrs.size < 2) pinch = null; if (!ptrs.size) drag = null; return; }
      if (drag && !drag.moved && e.type === 'pointerup' && now() - drag.t < 700) onTap(p.x, p.y, drag.touch);
      drag = null; cv.classList.remove('is-drag');
    };
    cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
    cv.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && !drag) { setHover(null); } });
    cv.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' && slSplit()) slHintOnce(); });
    cv.addEventListener('wheel', e => {
      // 9 Oct 2026 (Peter): in the split view a plain scroll over the map zooms it, as Google Maps does (the page
      // scrolls from anywhere else); elsewhere an embedded map leaves a plain scroll to the page
      if (window.LR_EMBED && !e.ctrlKey && !e.metaKey && !slSplit()) return;
      e.preventDefault();
      const p = pos(e); const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      zoomAt(p.x, p.y, Math.exp(-dy * (e.ctrlKey ? 0.01 : 0.0022)), e.ctrlKey ? 40 : 110);
      hideTip();
    }, { passive: false });
    cv.addEventListener('dblclick', e => { const p = pos(e); if (!hit(p.x, p.y) || hit(p.x, p.y).type === 'ring') zoomAt(p.x, p.y, 2, 200); });
  }

  // ── selection, filters, lens ─────────────────────────────────────────────
  function select(p, opts) {
    opts = opts || {};
    if (st.subj) { st.subj = null; applyFilters(); }   // LR-SUBJECTS: choosing anyone leaves the subject
    if (p) {
      const destination = S.href('people', {token:p.tok});
      /* on www the chart is the subject page: no hand-off */
    }
    if (p === st.sel && !opts.force) return;
    st.sel = p || null; st.selT0 = now();
    const canonical = document.querySelector('link[rel=canonical]');
    if (canonical) canonical.href = S.CANON + 'people' + (p ? '/' + p.tok : '');
    document.title = p ? `${p.n} · ${TITLE}` : TITLE;
    st.hoverMoment = null; st.hoverPerson = null; st.panelRing = 0;
    // a person chosen from inside the panel with the keyboard: focus follows to their name, not back to the page top
    const fromPanel = !!(document.activeElement && document.activeElement !== scroller && scroller.contains(document.activeElement));
    if (p) {
      buildLife(p);
      showScene(signature(p));
      renderPerson(p);
      if (fromPanel) { const h1 = $('.pv-name', scroller); if (h1) { h1.tabIndex = -1; h1.focus({ preventScroll: true }); } }
      try { performance.measure('people-select', { start: st.selT0, end: now() }); } catch (e) { /* older engines */ }
      if (isPhone() && root.classList.contains('sheet-full')) setSheet(false);
      requestAnimationFrame(() => ensureVisible(p));
    } else {
      life = null;
      renderOverview();
      renderWindowCards();
      if (fromPanel) { const h1 = $('.pv-title', scroller); if (h1) { h1.tabIndex = -1; h1.focus({ preventScroll: true }); } }
    }
    if (!opts.fromHash) writeHash(p ? p.tok : (st.lens ? 'women' : ''), true);
    kick();
  }
  function step(d) {
    const cur = st.sel ? st.sel.rank : (d > 0 ? -1 : 0);
    const n = RANKED.length; select(RANKED[((cur + d) % n + n) % n]);
  }
  function applyFilters() {
    filterVer++;
    const inSrc = p => !st.src || (st.src === 'm' ? p.m.length : st.src === 'a' ? p.ad.length : p.pd.length) > 0;
    P.forEach(p => { p.visT = (p.tot >= st.min && inSrc(p) && (!st.era || p.chN[st.era - 1] > 0 || (p.ctx && p.c === st.era)) && (st.region < 0 || p.clN.has(st.region)) && (!st.subj || !st.subj.ps || st.subj.ps.has(p))) ? 1 : 0.1; });
    const shown = P.filter(p => p.visT === 1).length, parts = [];
    if (st.era) parts.push(`${esc(CH[st.era - 1].years)} ring`);
    if (st.region >= 0) parts.push(esc(SECT.byId.get(st.region).label));
    if (st.min > 1) parts.push(`named ${st.min}+ times`);
    if (st.src) parts.push({ m: 'in the Timeline', a: 'in the editorials', p: 'on the podcast' }[st.src]);
    // with someone open and a source chosen, the banner counts the people beside THEM there, not the whole chart
    const selSrc = st.sel && st.src ? coOf(st.sel).length : -1;
    if (parts.length) { filterEl.hidden = false; filterEl.innerHTML = selSrc >= 0
      ? `<span><b>${fmt(selSrc)}</b> ${selSrc === 1 ? 'person appears' : 'people appear'} alongside ${esc(st.sel.n)} ${{ m: 'in Timeline moments', a: 'in the editorials', p: 'on the podcast' }[st.src]}</span><button type="button" data-act="clear">Show all</button>`
      : `<span><b>${fmt(shown)}</b> of ${fmt(P.length)} &middot; ${parts.join(' &middot; ')}</span><button type="button" data-act="clear">Show all</button>`; }
    else filterEl.hidden = true;
    // a hovered star the filter has just put out loses its tooltip and preview
    if (st.hover && st.hover.type === 'star' && st.hover.p.visT < 1) setHover(null);
    $$('[data-min]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.min === st.min)));
    $$('[data-src]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.src === st.src)));
    $$('[data-era]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.era === st.era)));
    $$('[data-region]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.region === st.region)));
    if (st.sel && st.src !== (applyFilters.last || "")) {
      const p = st.sel, to = { m: '#pv-mom', a: '#pv-aeds', p: '#pv-apods' }[st.src];
      buildLife(p); st.selT0 = now(); renderPerson(p);
      if (to) archFor(p.k).then(() => requestAnimationFrame(() => { const el = $(to, scroller); if (el && st.sel === p) scroller.scrollTo({ top: Math.max(0, el.offsetTop - 64), behavior: RM ? 'auto' : 'smooth' }); }));
    }
    applyFilters.last = st.src;
    measureUI(); kick();
  }
  function setEra(c) {
    st.era = c; applyFilters();
    if (c && !st.sel) { const sc = SC_BY.get(CH[c - 1].scene), m = sc && BY.get(sc.home); if (m) showScene(m); }
  }
  function setRegion(id) { st.region = id; applyFilters(); }
  function setMin(n) { st.min = n; applyFilters(); }
  // Legacy #women URLs open the ordinary People view.
  function setLens() {}

  // hash: #person-token, or #women for the lens
  // a person is a history entry (back and forward walk through the people you opened); the lens only rewrites it
  let curTok = null;
  function writeHash(tok, push) {
    if (S.framed) { if (window.LR_EMBED && tok !== curTok) { curTok = tok; parent.postMessage({ lrembed: 'at', tok: tok, title: document.title }, '*'); } return; }
    if (tok === curTok) return;
    curTok = tok;
    try { history[push ? 'pushState' : 'replaceState'](null, '', new URL(S.href('people', tok ? { token: tok } : {}), document.baseURI).href); } catch (e) { /* ignore */ }
  }
  function readHash(first) {
    const t = S.params.token || S.params.slug || '';
    curTok = t;
    if (t === 'women') { setLens(true); if (st.sel) select(null, { fromHash: true }); return; }
    const p = PT.get(t);
    if (p) { if (p !== st.sel) select(p, { fromHash: true }); return; }
    if (st.sel) select(null, { fromHash: true });
    if (t) showMissing(t);
  }
  // a link to someone the Timeline does not name: say so, and offer the finder with their name in it
  function showMissing(t) {
    renderOverview(t.replace(/-+/g, ' ').trim());
    qIn.value = t.replace(/-\d+$/, '').replace(/-+/g, ' ').trim(); runSearch();
  }

  // ── panel ────────────────────────────────────────────────────────────────
  const EYE = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="3.4" fill="currentColor"/><path d="M12 1.8v2.4M12 19.8v2.4M1.8 12h2.4M19.8 12h2.4" stroke="currentColor" stroke-width="1.3"/></svg>';
  const ARROW_L = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
  const ALL = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="3.5" cy="4" r="1.6" fill="currentColor"/><circle cx="12" cy="3" r="1.2" fill="currentColor"/><circle cx="8" cy="8.5" r="2" fill="currentColor"/><circle cx="3" cy="12.5" r="1.1" fill="currentColor"/><circle cx="12.5" cy="12.5" r="1.5" fill="currentColor"/><path d="M3.5 4L8 8.5 12 3M8 8.5l4.5 4" fill="none" stroke="currentColor" stroke-width=".9"/></svg>';
  const ARROW_R = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
  const personLink = (q, extra) => `<a class="pv-chip is-person" href="${S.href('people', { token: q.tok })}" data-person="${esc(q.tok)}"><i style="background:${CH_INK[q.c]}"></i>${esc(q.n)}${extra != null ? ` <small>${extra}</small>` : ''}</a>`;
  const span = p => p.first === p.last ? esc(p.first.y) : `${esc(p.first.y)} to ${esc(p.last.y)}`;
  const mins = s => { const m = Math.round(s / 60); return m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`; };

  function windowCard() {
    if (!win) return '';
    const live = sceneOK !== false;
    return `<div class="pv-window" style="--era:${CH_HEX[win.m.c]}">
      <div class="pvw-eye" aria-hidden="true"><canvas data-plate="${esc(win.m.s)}" data-c="${win.sc.chapter || win.m.c}"></canvas></div>
      <div class="pvw-txt"><p class="lab">${live ? '<span class="pp-live-dot" aria-hidden="true"></span>In the window' : 'In the window'}</p>
        <p class="pvw-scene">${live ? esc(win.sc.title) : esc(CH[win.m.c - 1].years + ', ' + CH[win.m.c - 1].era)}</p>
        <p class="pvw-m"><a href="${S.href('moment', { slug: win.m.s })}" data-moment="${esc(win.m.s)}">${win.m.th}</a>, ${esc(win.m.y)}</p>
        <button class="pvw-go" type="button" data-act="through"${live ? '' : ' hidden'}>Look through the window</button></div></div>`;
  }
  function renderWindowCards() { $$('.pv-window', scroller).forEach(el => { el.outerHTML = windowCard(); }); $$('.pvw-eye canvas', scroller).forEach(drawEye); $$('.pm-w', scroller).forEach(b => b.classList.toggle('is-on', !!(win && win.m.s === b.dataset.watch))); }

  function renderOverview(missing) {
    if (SLON && !missing) return renderIndex();
    const total = P.length, f = P.filter(p => p.g === 'f'), m = P.filter(p => p.g === 'm'), u = total - f.length - m.length;
    const wTotal = IX.filter(x => x.f.includes('women')).length;
    const ringedP = RANKED.filter(p => !p.g && p.wt), ringed = ringedP.length;
    // examples: those named in the most such titles (a single shared title is too thin to put a name forward)
    const rn = ringedP.filter(p => p.wt >= 2).sort((a, b) => b.wt - a.wt || a.rank - b.rank).slice(0, 3).map(p => `<a class="pv-inl" href="${S.href('people', { token: p.tok })}" data-person="${esc(p.tok)}">${esc(p.n)}</a>`);
    const ringedNames = rn.length > 1 ? rn.slice(0, -1).join(', ') + ' and ' + rn[rn.length - 1] : rn.join('');
    const maxShare = Math.max(...CH.map(c => chWomen[c.n] / chMoments[c.n].length));
    const letters = new Map(); RANKED.forEach(p => { const L = /[a-z]/.test(p.nn[0]) ? p.nn[0].toUpperCase() : '#'; if (!letters.has(L)) letters.set(L, []); letters.get(L).push(p); });
    const abc = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    scroller.innerHTML = `<div class="pv pv-over">
      <p class="lab pv-kicker">People <span>&middot; ${fmt(total)} across the Timeline, the editorials and the podcast</span></p>
      <h1 class="pv-title">Everyone Le Random names</h1>
      <p class="pv-lede">Each star is a person, sized by how often Le Random names them: in a Timeline moment, an editorial or a podcast episode. Time runs outward in ten rings, one per chapter, from ${esc(IX[0].y)} at the center to ${esc(IX[IX.length - 1].y)} at the rim, and the ${fmt(SECT.length)} idea regions are lettered around the edge. People who share moments are pulled together; the fine dust is the ${fmt(IX.length)} moments themselves. Pick anyone to draw their constellation.</p>
      ${missing ? `<p class="pv-miss" role="status">No one here goes by <b>${esc(missing)}</b>. The finder above may know them by another spelling.</p>` : ''}
      <section class="pv-sec"><h2 class="lab">Rings <small>people in each</small></h2>
        <div class="pv-eras">${CH.map(c => `<button class="pv-era" type="button" data-era="${c.n}" data-ch="${c.n}" aria-pressed="${st.era === c.n}" style="--c:${CH_INK[c.n]}"><i></i><span>${esc(c.years)}<small>${esc(c.era)}</small></span><b>${fmt(ringPeople[c.n])}</b></button>`).join('')}</div>
        <div class="pp-seg pv-seg-panel" role="group" aria-label="Minimum number of times named">${[1, 2, 5, 10].map(n => `<button type="button" data-min="${n}" aria-pressed="${st.min === n}">${n === 1 ? 'All' : n + '+'}</button>`).join('')}</div>
        <div class="pp-seg pv-seg-panel" role="group" aria-label="Where they are named" style="margin-top:8px">${[['m', 'Timeline', P.filter(p => p.m.length).length], ['a', 'Editorials', P.filter(p => p.ad.length).length], ['p', 'Podcast', P.filter(p => p.pd.length).length]].map(x => `<button type="button" data-src="${x[0]}" aria-pressed="${st.src === x[0]}">${x[1]} <small>${fmt(x[2])}</small></button>`).join('')}</div>
        <p class="pv-note" style="font-size:14px"><b>${fmt(P.filter(p => p.ctx).length)}</b> people appear only in editorials or episodes. No dated moment places them, so each sits in the ring and idea region of the people and ideas nearest to them in meaning.</p>
      </section>
      ${recentPeople()}
      <section class="pv-sec"><h2 class="lab">Most named <small>times</small></h2>
        <ol class="pv-top">${RANKED.slice(0, 20).map((p, i) => `<li><button type="button" data-person="${esc(p.tok)}" style="--c:${CH_INK[p.c]}"><span class="r">${i + 1}</span><span><span class="nm">${esc(p.n)}</span><span class="bar" style="width:${100 * p.tot / RANKED[0].tot}%"></span></span><span class="c">${p.tot}</span></button></li>`).join('')}</ol>
      </section>
      <section class="pv-sec"><h2 class="lab">Around the rim <small>idea regions</small></h2>
        <div class="pv-chips">${SECT.map(s => `<button class="pv-chip" type="button" data-region="${s.id}" aria-pressed="${st.region === s.id}">${esc(s.label)} <small>${s.n}</small></button>`).join('')}</div>
      </section>
      <section class="pv-sec"><h2 class="lab">Everyone, A to Z</h2>
        <div class="pv-az-l">${abc.map(L => `<button type="button" data-letter="${L}"${letters.has(L) ? '' : ' disabled'} aria-pressed="false">${L}</button>`).join('')}</div>
        <div class="pv-az" id="pv-az"><p class="pv-empty">Pick a letter to list everyone whose name starts with it.</p></div>
      </section>
      ${windowCard()}
      <p class="pv-foot">People are those Le Random names: in the text and tags of the Timeline’s moments, in the editorials and in the podcast transcripts. A person named in a moment is not always its maker: many are quoted, cited or credited, which is why the chart places each person by the moments that carry their name in the title first.</p>
    </div>`;
    scroller.__letters = letters;
    scroller.scrollTop = 0;
    $$('.pvw-eye canvas', scroller).forEach(drawEye);
  }

  // the people of the moments this viewer opened lately (kept in this browser only by the site runtime)
  function recentPeople() {
    let rec = []; try { rec = (S.recent ? S.recent() : []).map(sl => BY.get(sl)).filter(Boolean).slice(0, 8); } catch (e) { rec = []; }
    if (!rec.length) return '';
    const seen = new Map(); rec.forEach(m => m.people.forEach(q => seen.set(q, (seen.get(q) || 0) + 1)));
    const ps = Array.from(seen, ([q, n]) => ({ q, n })).sort((a, b) => b.n - a.n || a.q.rank - b.q.rank).slice(0, 12);
    if (!ps.length) return '';
    const t = rec[0];
    return `<section class="pv-sec"><h2 class="lab">From moments you opened <small>this browser</small></h2>
      <p class="pv-note" style="margin:0 0 10px">Lately you opened <a class="pv-inl" href="${S.href('moment', { slug: t.s })}" data-moment="${esc(t.s)}">${t.th}</a>${rec.length > 1 ? ` and ${rec.length === 2 ? 'one other moment' : fmt(rec.length - 1) + ' others'}` : ''}. The people they name:</p>
      <div class="pv-chips">${ps.map(({ q }) => personLink(q, q.cnt)).join('')}</div></section>`;
  }

  function renderPerson(p) {
    const detail = PROFILES[p.k] || {relationships:{}};
    const n = RANKED.length, prev = RANKED[(p.rank - 1 + n) % n], next = RANKED[(p.rank + 1) % n];
    const all = p.m.filter(m => m.f.includes('allTime')).length, top = p.m.filter(m => m.f.includes('top')).length, wo = p.m.filter(m => m.f.includes('women')).length;
    const sect = p.sect, ownSet = new Set(p.own);
    const ringY = esc(CH[p.c - 1].years);
    const place = p.own.length
      ? `Placed in the ${ringY} ring by ${p.own.length === 1 ? 'the moment whose title names them' : `the ${fmt(p.own.length)} moments whose titles name them`}${p.own.length < p.cnt ? ', marked with a dot' : ''}.`
      : p.ctx ? ''   /* 5 Oct 2026: no explanatory note of ours (Peter's standing rule) */
      : p.cnt > 1 ? `Placed in the ${ringY} ring, the middle of the moments that name or cite them.` : '';
    // barcode: chapters as ten equal columns, each moment at its place within its chapter
    const strip = `<div class="pv-strip" aria-label="Connected moments across the ten chapters">${CH.map((c, i) => `<div class="pv-strip-ch" style="left:${i * 10}%;width:10%"><span>${i === 0 ? '&lt;1850' : i === 1 ? '1850' : esc(c.years.replace('s', ''))}</span></div>`).join('')}<div class="pv-strip-axis"></div>
      ${p.m.map(m => `<a href="${S.href('moment', { slug: m.s })}" data-moment="${esc(m.s)}" data-slug="${esc(m.s)}" class="${m.f.includes('allTime') ? 'is-all' : ''}${ownSet.has(m) ? ' is-own' : ''}" style="left:${(m.c - 1) * 10 + 0.6 + 8.8 * m.q}%;--c:${CH_INK[m.c]}" title="${esc(m.y + ', ' + m.t)}" aria-label="${esc(m.y + ', ' + m.t)}"></a>`).join('')}</div>`;
    // the moment list, grouped by chapter
    let rows = '';
    /* 30 Sep 2026, Peter: the panel also lists editorials and episodes, so the moment groups say they are Timeline moments */
    const tlOther = p.m.some(m => (detail.relationships[m.s] || 'mentioned') !== 'mentioned');
    for (const [kind,label] of [['wrote', 'Timeline moments written by ' + p.n], ['about', 'Timeline moments about ' + p.n], ['cited', 'Cited as a source in the Timeline'], ['mentioned', (tlOther ? 'Also mentioned or credited in ' : 'Mentioned or credited in ') + 'Timeline moments']]) {
      const group = p.m.filter(m => (detail.relationships[m.s] || 'mentioned') === kind);
      if (!group.length) continue;
      let lastC = 0;
      rows += `<section class="pv-sec" data-relationship="${kind}"><h2 class="lab">${esc(label)} <small>${group.length}</small></h2>${kind === 'about' ? '<p class="pv-note">Named in the title or a reviewed biographical series.</p>' : ''}`;
      group.forEach(m => {
      if (m.c !== lastC) { if (lastC) rows += '</ol>'; lastC = m.c; const cc = group.filter(x => x.c === m.c).length; rows += `<p class="lab pv-chh" data-ch="${m.c}" style="--c:${CH_INK[m.c]}"><i></i>Chapter ${m.c} &middot; ${esc(CH[m.c - 1].years)} &middot; ${esc(CH[m.c - 1].era)}${cc > 1 ? ` &middot; ${cc}` : ''}</p><ol class="pv-ms">`; }
      const st2 = m.f.includes('allTime') ? '<span class="st">All-Time</span>' : m.f.includes('top') ? '<span class="st">Top</span>' : '';
      rows += `<li class="pm" data-slug="${esc(m.s)}" style="--c:${CH_INK[m.c]}">
        ${thumb(m)}
        <span class="pm-tx"><span class="pm-y">${esc(m.y)}${st2}</span><a class="pm-t" href="${S.href('moment', { slug: m.s })}" data-moment="${esc(m.s)}">${m.th}</a>${bridgeOf(m)}</span>
        <button class="pm-w${win && win.m === m ? ' is-on' : ''}" type="button" data-watch="${esc(m.s)}" aria-label="Show the live scene for ${esc(m.t)} in the window" title="Show its live scene in the window">${EYE}</button></li>`;
    });
      rows += '</ol></section>';
    }
    const coAll = coOf(p), coTop = coAll.slice(0, 30), SRCW = { m: 'in Timeline moments', a: 'in the editorials', p: 'on the podcast' };
    const regions = Array.from(p.clN, ([id, c]) => ({ s: SECT.byId.get(id), c })).filter(x => x.s).sort((a, b) => b.c - a.c);
    const mv = new Map(); p.m.forEach(m => (m.mv || []).forEach(x => { const k = norm(x); const e = mv.get(k) || { name: x, n: 0 }; e.n++; mv.set(k, e); }));
    const mvs = Array.from(mv.values()).sort((a, b) => b.n - a.n).slice(0, 14);
    const topMv = mvs.find(x => THREAD_SET.has(norm(x.name)));
    const sig = signature(p);
    // in Chronology, start where they start in their own name: a person a 71,000 BCE moment only cites begins later
    const f0 = p.own.length ? p.own[0] : p.first;

    const archSec = `${p.ad.length ? `<section class="pv-sec" id="pv-aeds"><h2 class="lab">In the editorials <small>${fmt(p.ad.length)}</small></h2><p class="pv-empty">Gathering the editorials that name them.</p></section>` : ''}
      ${p.pd.length ? `<section class="pv-sec" id="pv-apods"><h2 class="lab">On the podcast <small>${fmt(p.pd.length)}</small></h2><p class="pv-empty">Gathering the episodes that name them.</p></section>` : ''}`;
    const momSec = `<span id="pv-mom"></span>${rows}`;
    scroller.innerHTML = `<div class="pv pv-person">
      <div class="pv-bar"><button class="pv-ib pv-all" type="button" data-act="all" aria-label="Back to everyone">${ALL}<span>Everyone</span></button>
        <span class="lab">No. ${fmt(p.rank + 1)} of ${fmt(n)}</span>
        <button class="pv-ib" type="button" data-person="${esc(prev.tok)}" aria-label="Previous person: ${esc(prev.n)}" title="Previous (${'['})">${ARROW_L}</button>
        <button class="pv-ib" type="button" data-person="${esc(next.tok)}" aria-label="Next person: ${esc(next.n)}" title="Next (])">${ARROW_R}</button></div>
      <p class="lab pv-kicker"><span class="dot" style="background:${CH_INK[p.c]}"></span>${esc(CH[p.c - 1].years)} ring &middot; ${esc(sect.label)}${p.ctx ? (p.yrs ? ' &middot; placed by their dates' : ' &middot; placed by context') : ''}</p>
      <h1 class="pv-name">${esc(p.n)}</h1>
      ${detail.bio ? `<p class="pv-bio">${esc(detail.bio)}</p>` : '<p class="pv-bio" id="pv-bio" hidden></p>'}
      ${detail.portrait ? `<figure class="pv-portrait"><img src="${esc(detail.portrait)}" alt="Portrait of ${esc(p.n)}" width="160" height="180"><figcaption>Le Random subject archive</figcaption></figure>` : ''}
      <p class="pv-stats">${statsOf(p, detail)}
        ${all || top ? `<span class="pv-flags">${all ? `<span class="pv-flag">${all} All-Time</span>` : ''}${top ? `<span class="pv-flag">${top} Top</span>` : ''}</span>` : ''}</p>
      ${p.m.length ? strip : ''}
      ${place ? `<p class="pv-place">${place}</p>` : ''}
      ${HOME === 'main' ? archSec + momSec : momSec + archSec}
      ${coTop.length ? `<section class="pv-sec" id="pv-cosec"><h2 class="lab">Appears alongside <small>${fmt(coAll.length)}${st.src ? ' ' + SRCW[st.src] : ''}</small></h2>
        <div class="pv-chips" id="pv-co">${coTop.map(({ q, n }) => personLink(q, n > 1 ? n : null)).join('')}</div>
        ${coAll.length > coTop.length ? `<button class="pv-ib pv-more" type="button" data-act="more-co">All ${fmt(coAll.length)}</button>` : ''}</section>` : ''}
      <section class="pv-sec" id="pv-near"><h2 class="lab">Nearest in meaning</h2><p class="pv-empty">Finding the people described most like them.</p></section>
      ${p.m.length ? `<section class="pv-sec" id="pv-rel"><h2 class="lab">Related moments</h2><p class="pv-empty">Gathering related moments.</p></section>
      <section class="pv-sec" id="pv-eds"><h2 class="lab">Related reading</h2><p class="pv-empty">Gathering the editorials linked to these moments.</p></section>
      <section class="pv-sec" id="pv-pods"><h2 class="lab">Related listening</h2><p class="pv-empty">Gathering the episodes.</p></section>` : ''}
      <section class="pv-sec"><h2 class="lab">Idea regions</h2>
        <div class="pv-chips">${regions.map(({ s, c }) => `<a class="pv-chip" href="${S.href('ideas', { token: 'cl-' + s.id })}" data-go="ideas" data-token="cl-${s.id}">${esc(s.label)} <small>${c}</small></a>`).join('')}</div></section>
      ${mvs.length ? `<section class="pv-sec"><h2 class="lab">Movements</h2><div class="pv-chips">${mvs.map(x => THREAD_SET.has(norm(x.name))
        ? `<a class="pv-chip" href="${S.href('threads', { token: slugify(x.name) })}" data-go="threads" data-token="${slugify(x.name)}">${esc(x.name)} <small>${x.n}</small></a>`
        : `<button type="button" class="pv-chip is-tag" data-q="${esc(x.name)}" title="Search the Timeline for ${esc(x.name)}">${esc(x.name)} <small>${x.n}</small></button>`).join('')}</div></section>` : ''}
      <section class="pv-sec" id="pv-tags"><h2 class="lab">Subjects</h2><p class="pv-empty">Gathering the subjects of their moments.</p></section>
      ${windowCard()}
      <section class="pv-sec"><h2 class="lab">Keep exploring</h2><div class="pv-go">
        ${p.ctx ? `<a href="${S.href('chronology', { slug: sig.s })}" data-go="chronology" data-slug="${esc(sig.s)}"><span class="lab">Chronology</span><span>Enter the ${ringY} where their ideas sit</span></a>
        <a href="${S.href('ideas', { token: 'cl-' + sect.id })}" data-go="ideas" data-token="cl-${sect.id}"><span class="lab">Ideas</span><span>${esc(sect.label)}</span></a>`
        : `<a href="${S.href('moment', { slug: sig.s })}" data-moment="${esc(sig.s)}"><span class="lab">Open the moment</span><span>${sig.th}</span></a>
        <a href="${S.href('chronology', { slug: f0.s })}" data-go="chronology" data-slug="${esc(f0.s)}"><span class="lab">Chronology</span><span>${f0 === p.first ? `Start at their first moment, ${esc(f0.y)}` : `Start in ${esc(f0.y)}, the first moment whose title names them`}</span></a>
        <a href="${S.href('ideas', { slug: sig.s })}" data-go="ideas" data-slug="${esc(sig.s)}"><span class="lab">Ideas</span><span>Find it on the map of ideas</span></a>`}
        ${topMv ? `<a href="${S.href('threads', { token: slugify(topMv.name) })}" data-go="threads" data-token="${slugify(topMv.name)}"><span class="lab">Threads</span><span>Follow ${esc(topMv.name)}</span></a>`
          : `<a href="${S.href('tour')}" data-go="tour"><span class="lab">Tour</span><span>Sit back and watch the Timeline</span></a>`}
      </div></section>
      <nav class="pv-pn" aria-label="Previous and next person">
        <button type="button" data-person="${esc(prev.tok)}"><span class="lab">Previous &middot; ${prev.tot}</span><span class="n">${esc(prev.n)}</span></button>
        <button type="button" data-person="${esc(next.tok)}"><span class="lab">Next &middot; ${next.tot}</span><span class="n">${esc(next.n)}</span></button></nav>
      <div class="pv-share"><button class="pv-ib" type="button" data-act="copy">Copy link</button><span class="ok" id="pv-ok">Link copied</span></div>
      <p class="pv-foot">Ranked by how often Le Random names them. A person named in a moment, an editorial or an episode is not always its maker: many are quoted, cited or credited. Small plates stand in where a moment has no archival image here: generic studies drawn in the medium of each chapter, not the works.</p>
    </div>`;
    scroller.scrollTop = 0;
    thumbs(scroller);
    $$('.pvw-eye canvas', scroller).forEach(drawEye);
    fillText(p);
    fillArchive(p);
  }

  /* LR-PEOPLE: the archive side of the panel. Editorials each carry the sentence that names the person. */
  function fillArchive(p) {
    archFor(p.k).then(() => {
      if (st.sel !== p) return;
      const A = (ARCH && ARCH[p.k]) || { a: [], p: [], near: [] };
      const bio = $('#pv-bio'); if (bio && A.bio) { bio.textContent = A.bio; bio.hidden = false; }
      const edRow = x => `<li class="pv-ed pv-aed"><a class="t" href="${LRWEB}/editorial/${esc(x[1])}" target="_blank" rel="noopener">${esc(x[2])}</a><p>No. ${x[0]} &middot; ${esc(x[3])}</p></li>`;
      const podRow = x => `<li class="pv-pod"><p class="lab">Episode ${x[0]}${x[4] === 'H' ? ' &middot; <b>host</b>' : x[4] === 'h' ? ' &middot; <b>guest host</b>' : x[4] === 'g' ? ' &middot; <b>guest</b>' : ' &middot; mentioned in the conversation'}</p><p class="t"><a href="${LRWEB}/episodes/${esc(x[1])}" target="_blank" rel="noopener">${esc(x[2])}</a></p><p class="m">${esc(x[3])}</p></li>`;
      const list = (rows, f, n) => `<ul class="pv-list">${rows.slice(0, n).map(f).join('')}</ul>${rows.length > n ? `<details class="pv-more"><summary class="pv-ib" style="display:inline-grid;list-style:none">${rows.length - n} more</summary><ul class="pv-list">${rows.slice(n).map(f).join('')}</ul></details>` : ''}`;
      const eEl = $('#pv-aeds'), pEl = $('#pv-apods'), nEl = $('#pv-near');
      /* 30 Sep 2026, Peter: the list is worded like the sentence above it: Wrote, Featured in, Mentioned in */
      const eG = [['w', 'Wrote'], ['f', 'Featured in'], ['m', 'Mentioned in']].map(([k, l]) => [l, A.a.filter(x => (k === 'm' ? x[4] !== 'w' && x[4] !== 'f' : x[4] === k))]).filter(g => g[1].length);
      if (eEl) eEl.innerHTML = `<h2 class="lab">In the editorials <small>${fmt(A.a.length)}</small></h2>` + (eG.length > 1 ? eG.map(([l, rows]) => `<h3 class="pv-sub">${l} <small>${fmt(rows.length)}</small></h3>${list(rows, edRow, 6)}`).join('') : list(A.a, edRow, 6));
      if (pEl) pEl.innerHTML = `<h2 class="lab">On the podcast <small>${fmt(A.p.length)}</small></h2>${list(A.p, podRow, 4)}`;
      if (nEl) {
        const near = (A.near || []).map(k => PK.get(k)).filter(q => q && q !== p).slice(0, 10);
        nEl.innerHTML = near.length ? `<h2 class="lab">Nearest in meaning</h2><div class="pv-chips">${near.map(q => personLink(q, q.tot)).join('')}</div>` : '';
        if (!near.length) nEl.remove();
      }
      // subjects beside them in editorials and episodes join those of their moments
      p.__asub = A.s || [];
      const tEl = $('#pv-tags'); if (tEl && tEl.dataset.ready) mergeSubjects(p, tEl);
    });
  }
  function mergeSubjects(p, tEl) {
    const extra = p.__asub || []; if (!extra.length) return;
    const have = new Map($$('[data-subject]', tEl).map(b => [b.dataset.subject, b]));
    const add = extra.filter(x => x[2] !== 'people' && !have.has(x[0]) && !NAMES.has(norm(x[1]))).slice(0, 24);
    if (!add.length) return;
    const wrap = document.createElement('div'); wrap.className = 'pv-sg';
    wrap.innerHTML = `<p class="lab">Beside them in editorials and episodes <small>${add.length}</small></p><div class="pv-chips">${add.map(x => `<button type="button" class="pv-chip is-tag" data-q="${esc(x[1])}" title="${x[3] ? nTimes(x[3], 'editorial', 'editorials') : ''}${x[3] && x[4] ? ', ' : ''}${x[4] ? nTimes(x[4], 'episode', 'episodes') : ''}">${x[2] === 'works' || x[2] === 'exhibitions' ? `<em>${esc(x[1])}</em>` : esc(x[1])}${x[3] + x[4] > 1 ? ` <small>${x[3] + x[4]}</small>` : ''}</button>`).join('')}</div>`;
    tEl.appendChild(wrap);
  }

  // a moment without an archival image gets its era plate: a small generic study in its chapter's medium
  // drawn in the medium of the scene in the window, which is not always the moment's own chapter
  function drawEye(el) { const m = BY.get(el.dataset.plate); if (m && S.plate) { try { S.plate(el, { s: m.s, c: +el.dataset.c || m.c }, { w: 58, h: 58 }); } catch (e) { /* decoration */ } } }
  // a moment's thumbnail: its era plate at once, and its archival image faded in over it once the chart has stopped
  // moving (the archive files are full size: decoding a screenful of them mid-choreography costs frames)
  const thumb = m => `<span class="pm-th"><canvas class="pm-plate" data-plate="${esc(m.s)}" aria-hidden="true"></canvas>${m.img ? `<img data-src="img/${esc(m.img)}" alt="" decoding="async">` : ''}</span>`;
  let thumbIO = null, imgTimer = 0; const pendingImgs = [];
  function thumbs(root) {
    const els = $$('.pm-th', root);
    if (!('IntersectionObserver' in window)) { els.forEach(queueThumb); return; }
    if (!thumbIO) thumbIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { thumbIO.unobserve(e.target); queueThumb(e.target); } }), { root: scroller, rootMargin: '240px 0px' });
    if (root === scroller) thumbIO.disconnect();   // a fresh panel: forget the rows it replaced
    els.forEach(el => thumbIO.observe(el));
  }
  function queueThumb(el) {
    const c = el.querySelector('canvas[data-plate]'); if (c && !c.dataset.drawn) { c.dataset.drawn = '1'; drawPlate(c); }
    const im = el.querySelector('img[data-src]'); if (!im) return;
    pendingImgs.push(im); if (!imgTimer) imgTimer = setTimeout(pumpImgs, 0);
  }
  // a few at a time, so their decoding is spread out rather than landing in one frame
  function pumpImgs() {
    imgTimer = 0;
    const wait = st.sel ? st.selT0 + lifeDur(st.sel) + 350 - now() : 0;
    if (wait > 0) { imgTimer = setTimeout(pumpImgs, wait); return; }
    let n = 0;
    if (archGone()) { pendingImgs.forEach(im => im.remove()); pendingImgs.length = 0; return; }
    while (pendingImgs.length && n < 3) { const im = pendingImgs.shift(); if (im.isConnected && im.dataset.src) { loadImg(im); n++; } }
    if (pendingImgs.length) imgTimer = setTimeout(pumpImgs, 140);
  }
  // the archive files are full size (a few are several megabytes): each is decoded off the main thread straight to a
  // small bitmap and cropped into a 40 px canvas, so a long list never holds dozens of full-size images in memory.
  // Cropped thumbnails are kept (small) for the next person who shares the moment. SVGs, and browsers that cannot
  // resize while decoding, fall back to a plain <img>; a missing file leaves the era plate showing.
  const picCache = new Map();
  // the archive may be absent altogether (the Artifact copy has no img/ folder): after two misses and no hit, the
  // plates stay and no more files are asked for, rather than a request (and a console line) for every row
  const arch = { ok: 0, miss: 0 };
  const archGone = () => arch.miss >= 2 && !arch.ok;
  async function loadImg(im) {
    if (!im.isConnected || !im.dataset.src) return;
    if (archGone()) { im.remove(); return; }
    const src = im.dataset.src; im.removeAttribute('data-src');
    const n = Math.round(40 * Math.min(2, window.devicePixelRatio || 1));
    let pic = picCache.get(src);
    if (!pic && window.createImageBitmap && !/\.svg$/i.test(src)) {
      try {
        const r = await fetch(src);
        if (!r.ok) { arch.miss++; im.remove(); return; }
        arch.ok++;
        const bm = await createImageBitmap(await r.blob(), { resizeWidth: n * 2, resizeQuality: 'medium' });
        pic = document.createElement('canvas'); pic.width = pic.height = n;
        const k = Math.max(n / bm.width, n / bm.height), w = bm.width * k, h = bm.height * k;
        pic.getContext('2d').drawImage(bm, (n - w) / 2, (n - h) / 2, w, h); bm.close();
        picCache.set(src, pic); if (picCache.size > 240) picCache.delete(picCache.keys().next().value);
      } catch (e) { pic = null; }
    }
    if (!im.isConnected) return;
    if (pic) {
      const cv = document.createElement('canvas'); cv.width = cv.height = n; cv.className = 'pm-pic'; cv.setAttribute('aria-hidden', 'true');
      cv.getContext('2d').drawImage(pic, 0, 0); im.replaceWith(cv);
      requestAnimationFrame(() => cv.classList.add('is-in'));
      return;
    }
    im.addEventListener('load', () => { arch.ok++; im.classList.add('is-in'); }, { once: true });
    im.addEventListener('error', () => { arch.miss++; }, { once: true });
    im.src = src;
  }
  function drawPlate(el) { const m = BY.get(el.dataset.plate); if (m && S.plate) { try { S.plate(el, m, { w: 40, h: 40 }); } catch (e) { /* plate is decoration */ } } }
  // tags, editorials and podcast episodes live in the chapter text files: fetch only the chapters this person touches
  function fillText(p) {
    const chs = Array.from(new Set(p.m.map(m => m.c)));
    Promise.all([shard('ptext', p.k), archFor(p.k)]).then(([PT0]) => { const ts = chs.map(() => PT0);
      if (st.sel !== p) return;
      const tm = now();
      const T = new Map(chs.map((c, i) => [c, ts[i]]));
      const texts = p.m.map(m => (T.get(m.c) || {})[m.s] || {});
      const nameRe = p.nn.length >= 5 ? wordRe(p.nn) : null;
      // every subject their moments are filed under, typed, minus people (they are the stars of this chart)
      const subj = new Map();
      texts.forEach(t => (t.subjects || []).forEach(x => {
        if (!x || !x.k || x.t === 'people' || NAMES.has(norm(x.n))) return;
        const e = subj.get(x.k) || { k: x.k, n: x.n, t: x.t || 'other', c: 0 }; e.c++; subj.set(x.k, e);
      }));
      // older text files carry plain tags only
      const tagC = new Map();
      if (!subj.size) texts.forEach(t => (t.tags || []).forEach(tag => { const k = norm(tag); if (NAMES.has(k) || k === p.nn) return; const e = tagC.get(k) || { tag, n: 0 }; e.n++; tagC.set(k, e); }));
      const tags = Array.from(tagC.values()).sort((a, b) => b.n - a.n).slice(0, 24);
      // editorials: linked from their moments (best first), with pieces that name them in the title on top
      const edS = new Map();
      texts.forEach(t => (t.eds || []).forEach((e, j) => { if (EDS[e]) edS.set(e, (edS.get(e) || 0) + 1 / (1 + j * 0.6)); }));
      const named = new Set();
      if (nameRe) Object.keys(EDS).forEach(k => { if (nameRe.test(norm(EDS[k].title))) { edS.set(k, (edS.get(k) || 0) + 50); named.add(k); } });
      const exact = new Set(((ARCH && ARCH[p.k]) || { a: [] }).a.map(x => x[1]));
      const eds = Array.from(edS, ([k, s]) => ({ k, s, e: EDS[k] })).filter(x => !exact.has(x.k)).sort((a, b) => b.s - a.s);
      const podS = new Map(), namedPod = new Set();
      texts.forEach(t => (t.pods || []).forEach((e, j) => { if (PODS[e]) podS.set(String(e), (podS.get(String(e)) || 0) + 1 / (1 + j * 0.6)); }));
      if (nameRe) Object.keys(PODS).forEach(k => { if (nameRe.test(norm(PODS[k].title))) { podS.set(k, (podS.get(k) || 0) + 50); namedPod.add(k); } });
      const pods = Array.from(podS, ([k, s]) => ({ k, s, e: PODS[k] })).sort((a, b) => b.s - a.s);
      const chOf = ep => { const c = CH.find(c => (c.pods || []).map(String).includes(String(ep))); return c ? c.n : 0; };
      const own = new Set(p.m.map(m => m.s)), rel = new Map();
      texts.forEach(t => {
        (t.linked || []).forEach((sl, j) => { if (own.has(sl) || !BY.has(sl)) return; const e = rel.get(sl) || { s: sl, k: 'Linked', v: 0 }; e.v += 3 / (1 + j * 0.3); rel.set(sl, e); });
        (t.echoes || []).forEach((sl, j) => { if (own.has(sl) || !BY.has(sl)) return; const e = rel.get(sl) || { s: sl, k: 'Echo', v: 0 }; e.v += 1 / (1 + j * 0.5); rel.set(sl, e); });
      });
      const rels = Array.from(rel.values()).sort((a, b) => (a.k === b.k ? 0 : a.k === 'Linked' ? -1 : 1) || b.v - a.v).slice(0, 8);
      const rEl = $('#pv-rel');
      if (rEl) {
        rEl.innerHTML = `<h2 class="lab">Related moments <small>linked and echoed</small></h2>${rels.length ? `<ol class="pv-ms">${rels.map(x => { const m = BY.get(x.s); return `<li class="pm" style="--c:${CH_INK[m.c]}">
          ${thumb(m)}
          <span class="pm-tx"><span class="pm-y">${esc(m.y)} &middot; ${x.k === 'Linked' ? 'Linked from their moments' : 'Echo, Chapter ' + m.c}</span><a class="pm-t" href="${S.href('moment', { slug: m.s })}" data-moment="${esc(m.s)}">${m.th}</a>${bridgeOf(m)}</span>
          <button class="pm-w${win && win.m === m ? ' is-on' : ''}" type="button" data-watch="${esc(m.s)}" aria-label="Show the live scene for ${esc(m.t)} in the window" title="Show its live scene in the window">${EYE}</button></li>`; }).join('')}</ol>
          <p class="pv-note" style="font-size:14px">Echoes are the nearest moments in idea space at least two chapters away.</p>` : '<p class="pv-empty">No related moments beyond their own.</p>'}`;
        thumbs(rEl);
      }
      const tEl = $('#pv-tags'), eEl = $('#pv-eds'), pEl = $('#pv-pods');
      if (tEl) {
        const TYPES = (S.SUBJECT_TYPES || [['themes', 'Ideas'], ['tech', 'Technologies'], ['works', 'Works'], ['exhibitions', 'Exhibitions'], ['orgs', 'Organisations'], ['places', 'Places'], ['other', 'Other subjects']]).filter(x => x[0] !== 'people');
        const all = Array.from(subj.values()), SHOW = 12;
        const groups = TYPES.map(([t, label]) => ({ t, label, list: all.filter(x => (TYPES.some(y => y[0] === x.t) ? x.t : 'other') === t).sort((a, b) => b.c - a.c || (a.n.toLowerCase() < b.n.toLowerCase() ? -1 : 1)) })).filter(g => g.list.length);
        // works and exhibitions are titles: set in italics, as everywhere in the Timeline
        const chip = (x, i) => `<button type="button" class="pv-chip is-tag${i >= SHOW ? ' is-extra' : ''}" data-subject="${esc(x.k)}" title="Every moment filed under ${esc(x.n)}">${x.t === 'works' || x.t === 'exhibitions' ? `<em>${esc(x.n)}</em>` : esc(x.n)}${x.c > 1 ? ` <small>${x.c}</small>` : ''}</button>`;
        const lead = all.slice().sort((a,b) => b.c-a.c || a.n.localeCompare(b.n)).slice(0,8);
        tEl.innerHTML = subj.size
          ? `<h2 class="lab">Subjects <small>${fmt(all.length)} across their moments</small></h2><div class="pv-chips">${lead.map((x,i)=>chip(x,i)).join('')}</div>${all.length > 8 ? `<details class="pv-subject-more"><summary>Show all ${fmt(all.length)} subjects</summary>${groups.map(g=>`<div class="pv-sg"><p class="lab">${esc(g.label)} <small>${g.list.length}</small></p><div class="pv-chips">${g.list.map(x=>chip(x,0)).join('')}</div></div>`).join('')}</details>` : ''}`
          : `<h2 class="lab">${tags.length ? 'Tags' : 'Subjects'}</h2><div class="pv-chips">${tags.slice(0,8).map(x=>`<span class="pv-chip">${esc(x.tag)}</span>`).join('')}</div>`;
        tEl.dataset.ready = '1'; mergeSubjects(p, tEl);
      }
      const edRow = x => `<li class="pv-ed"><a class="t" href="${esc(x.e.url)}" target="_blank" rel="noopener">${esc(x.e.title)}</a><p>${named.has(x.k) ? '<span class="nm">Names them</span> &middot; ' : ''}${esc(x.e.type)} &middot; ${esc(x.e.author)} &middot; ${esc(x.e.date)}</p></li>`;
      if (eEl) eEl.innerHTML = `<h2 class="lab">Related reading <small>${eds.length || ''}</small></h2>${eds.length ? `<ul class="pv-list">${eds.slice(0, 6).map(edRow).join('')}</ul>${eds.length > 6 ? `<details class="pv-more"><summary class="pv-ib" style="display:inline-grid;list-style:none">${eds.length - 6} more</summary><ul class="pv-list">${eds.slice(6).map(edRow).join('')}</ul></details>` : ''}` : '<p class="pv-empty">No Le Random editorial is linked to these moments yet.</p>'}`;
      const podRow = x => { const c = chOf(x.k); return `<li class="pv-pod"><p class="lab">Episode ${esc(x.k)}${c ? ` &middot; <b>the Chapter ${c} episode</b>` : ''}${namedPod.has(x.k) ? ' &middot; <b>names them</b>' : ''}</p>
        <p class="t">${esc(x.e.title)}</p><p class="m">${esc(x.e.date)} &middot; ${mins(x.e.secs)}</p>
        <p class="l">${x.e.lr ? `<a href="${esc(x.e.lr)}" target="_blank" rel="noopener">Listen with transcript</a>` : ''}${x.e.apple ? `<a href="${esc(x.e.apple)}" target="_blank" rel="noopener">Apple Podcasts</a>` : ''}${x.e.spotify ? `<a href="${esc(x.e.spotify)}" target="_blank" rel="noopener">Spotify</a>` : ''}</p></li>`; };
      if (pEl) pEl.innerHTML = `<h2 class="lab">Related listening <small>${pods.length || ''}</small></h2>${pods.length ? `<ul class="pv-list">${pods.slice(0, 4).map(podRow).join('')}</ul>${pods.length > 4 ? `<details class="pv-more"><summary class="pv-ib" style="display:inline-grid;list-style:none">${pods.length - 4} more</summary><ul class="pv-list">${pods.slice(4).map(podRow).join('')}</ul></details>` : ''}` : '<p class="pv-empty">No episode is linked to these moments yet.</p>'}`;
      try { performance.measure('people-text', { start: tm, end: now() }); } catch (e) { /* older engines */ }
    }).catch(() => {
      ['#pv-tags', '#pv-eds', '#pv-pods', '#pv-rel'].forEach(s => { const el = $(s), e2 = el && el.querySelector('.pv-empty'); if (e2) e2.textContent = 'This could not be loaded.'; });
    });
  }

  // copy a link to the person: framed in the Artifact the page has no http address of its own (about:srcdoc), so the
  // launched site's address is used; if the clipboard is refused the link is shown selected, ready to copy by hand
  function copyLink(btn) {
    const rel = S.href('people', { token: st.sel.tok });
    let url = ''; try { url = new URL(rel, document.baseURI).href; } catch (e) { /* no base */ }
    if (!/^https?:/.test(url)) url = (S.CANON || 'https://timeline.lerandom.art/') + rel;
    const legacy = () => { try { const t = document.createElement('textarea'); t.value = url; t.setAttribute('readonly', ''); t.style.cssText = 'position:fixed;left:-9999px;top:0'; document.body.appendChild(t); t.select(); const ok = document.execCommand('copy'); t.remove(); return ok; } catch (e) { return false; } };
    let settled = false;
    const done = ok => {
      if (settled) return; settled = true;
      const box = btn.parentElement, old = box.querySelector('.pv-linkbox'); if (old) old.remove();
      const o = $('#pv-ok', box);
      if (ok) { if (o) { o.classList.add('is-on'); setTimeout(() => o.classList.remove('is-on'), 1800); } return; }
      const inp = document.createElement('input'); inp.className = 'pv-linkbox'; inp.readOnly = true; inp.value = url; inp.setAttribute('aria-label', 'Link to ' + st.sel.n);
      box.appendChild(inp); inp.focus({ preventScroll: true }); inp.select();
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => done(true), () => done(legacy()));
      setTimeout(() => { if (!settled) done(legacy()); }, 1200);   // a clipboard that never answers
    } else done(legacy());
  }

  // ── search ───────────────────────────────────────────────────────────────
  let results = [], active = 0;
  function runSearch() {
    const v = norm(qIn.value.trim());
    if (!v) { qRes.hidden = true; qIn.setAttribute('aria-expanded', 'false'); results = []; return; }
    // whole name, then any word, then anywhere, then every typed word starting one of theirs ("molnar vera")
    const qw = v.split(/[\s.-]+/).filter(Boolean);
    const score = p => { if (p.nn.startsWith(v)) return 0; const ws = p.nn.split(/[\s.-]+/); if (ws.some(w => w.startsWith(v))) return 1; if (p.nn.includes(v)) return 2;
      return qw.length > 1 && qw.every(q => ws.some(w => w.startsWith(q))) ? 3 : 9; };
    if (HERO && SL.ready) {                           // the hero finds any subject and opens its page
      results = SL.list.map(q => { if (!q.nn) q.nn = norm(q.n); return [q, score(q)]; }).filter(x => x[1] < 9).sort((a, b) => a[1] - b[1] || b[0].tot - a[0].tot).slice(0, 8).map(x => x[0]);
      active = 0;
      qRes.innerHTML = results.length ? results.map((q, i) => `<li role="option" id="pp-r${i}" aria-selected="${i === 0}" data-i="${i}"><span class="r-dot" style="background:${SLK_HEX[q.k] || '#EFE9D8'}"></span><span class="r-n">${esc(q.n)}</span><span class="r-c">${SLK_ONE[q.k]}${q.tot ? ' &middot; ' + fmt(q.tot) : ''}</span><a class="r-go" href="${LRWEB}/subjects/${esc(q.slug)}" target="_top" aria-label="Open ${esc(q.n)}">&#8599;</a></li>`).join('')
        : '<li class="r-none" aria-disabled="true">No subject by that name</li>';
      qRes.hidden = false; qIn.setAttribute('aria-expanded', 'true'); return;
    }
    results = P.map(p => [p, score(p)]).filter(x => x[1] < 9).sort((a, b) => a[1] - b[1] || a[0].rank - b[0].rank).slice(0, 8).map(x => x[0]);
    active = 0;
    qRes.innerHTML = results.length ? results.map((p, i) => `<li role="option" id="pp-r${i}" aria-selected="${i === 0}" data-i="${i}"><span class="r-dot" style="background:${CH_HEX[p.c]}"></span><span class="r-n">${esc(p.n)}</span><span class="r-c">${p.tot}</span></li>`).join('')
      : '<li class="r-none" aria-disabled="true">Nobody by that name</li>';
    qRes.hidden = false; qIn.setAttribute('aria-expanded', 'true');
  }
  function pickResult(i) {
    const p = results[i]; if (!p) return;
    if (HERO && p.slug) { qRes.hidden = true; qIn.setAttribute('aria-expanded', 'false'); if (st.slSel === p) return slOpen(p.slug); qIn.value = p.n; slSelect(p); return; }
    qIn.value = ''; qRes.hidden = true; qIn.setAttribute('aria-expanded', 'false'); qIn.blur();
    if (p.visT < 1) { st.era = 0; st.region = -1; st.min = 1; st.src = ''; applyFilters(); }
    select(p);
    if (isPhone()) setSheet(false);
  }

  // ── phone sheet ──────────────────────────────────────────────────────────
  function setSheet(full) {
    root.classList.toggle('sheet-full', full);
    handle.setAttribute('aria-expanded', String(full)); handle.setAttribute('aria-label', full ? 'Lower the panel' : 'Raise the panel');
    panel.style.transform = '';
  }

  // ── UI wiring ────────────────────────────────────────────────────────────
  function bindUI() {
    bindPointer();
    addEventListener('resize', () => { resize(); });
    // 8 Oct 2026: the stage can change size while the window does not (on the Subjects index the panel takes its width
    // after the first measure), which left the chart drawn 0.74x across while the pointer read it at full width.
    // Re-measure whenever the stage's box or the screen's pixel ratio changes (browser zoom, a move between screens).
    if (window.ResizeObserver) new ResizeObserver(() => { const r = stage.getBoundingClientRect(); if (Math.round(r.width) !== W || Math.round(r.height) !== H) resize(); }).observe(stage);
    (function watchDpr() { if (!window.matchMedia) return; const mq = matchMedia('(resolution: ' + (window.devicePixelRatio || 1) + 'dppx)'); if (mq.addEventListener) mq.addEventListener('change', () => { resize(); watchDpr(); }, { once: true }); })();
    phoneMQ.addEventListener && phoneMQ.addEventListener('change', () => { resize(); if (!isPhone() && !layers.length && win) showScene(win.m, { now: true }); if (isPhone() && !st.through) killAll(); });

    // the key: a chip that opens into the legend (hover or focus on a desktop, a tap anywhere)
    const keyChip = $('#pp-key-chip');
    const setKey = open => { keyEl.classList.toggle('is-open', open); keyChip.setAttribute('aria-expanded', String(open)); };
    keyChip.addEventListener('click', e => { e.stopPropagation(); setKey(!keyEl.classList.contains('is-open')); });
    document.addEventListener('pointerdown', e => { if (keyEl.classList.contains('is-open') && !keyEl.contains(e.target)) setKey(false); });
    keyEl.addEventListener('keydown', e => { if (e.key === 'Escape' && keyEl.classList.contains('is-open')) { e.stopPropagation(); setKey(false); keyChip.focus(); } });
    $('#pp-zoom').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.zoom === 'in') zoomAt(CX + (isPhone() ? 0 : 0), CY, 1.6, 200); else if (b.dataset.zoom === 'out') zoomAt(CX, CY, 1 / 1.6, 200); else resetCam();
    });
    $('#pp-th-back').addEventListener('click', () => setThrough(false));
    // delegated clicks for stage chips and the panel
    document.addEventListener('click', e => {
      const t = e.target; if (!t.closest) return;
      const dc = t.closest('[data-doc]');
      if (dc && !e.metaKey && !e.ctrlKey && !e.shiftKey) { const d = DOCS.by.get(dc.dataset.doc); if (d && d.hm) { e.preventDefault(); enterDoc(d); return; } }
      const pa = t.closest('[data-person]');
      if (pa && !e.metaKey && !e.ctrlKey && !e.shiftKey) { e.preventDefault(); const p = PT.get(pa.dataset.person); if (p) { if (p.visT < 1) { st.era = 0; st.region = -1; st.min = 1; st.src = ''; applyFilters(); } select(p); } return; }
      const tg = t.closest('[data-subject],[data-tag],[data-q]');
      if (tg && scroller.contains(tg)) { S.search.open(tg.dataset.subject ? { subject: tg.dataset.subject } : tg.dataset.tag ? { tag: tg.dataset.tag } : tg.dataset.q); return; }
      const w = t.closest('[data-watch]');
      if (w) { const m = BY.get(w.dataset.watch); if (m) { showScene(m, { now: true }); $$('.pm-w', scroller).forEach(b => b.classList.toggle('is-on', b === w)); if (isPhone() && sceneOK) setThrough(true); } return; }
      const mn = t.closest('[data-min]'); if (mn) { setMin(+mn.dataset.min); return; }
      const sr = t.closest('[data-src]'); if (sr) { st.src = st.src === sr.dataset.src ? '' : sr.dataset.src; applyFilters(); return; }
      const er = t.closest('[data-era]'); if (er) { setEra(st.era === +er.dataset.era ? 0 : +er.dataset.era); return; }
      const rg = t.closest('[data-region]'); if (rg) { setRegion(st.region === +rg.dataset.region ? -1 : +rg.dataset.region); return; }
      const lt = t.closest('[data-letter]');
      if (lt) {
        const L = lt.dataset.letter, list = (scroller.__letters && scroller.__letters.get(L)) || [];
        $$('[data-letter]', scroller).forEach(b => b.setAttribute('aria-pressed', String(b === lt)));
        const az = $('#pv-az'); if (az) az.innerHTML = list.slice().sort((a, b) => a.nn < b.nn ? -1 : 1).map(p => `<button type="button" data-person="${esc(p.tok)}">${esc(p.n)}<small>${p.cnt}</small></button>`).join('');
        return;
      }
      const act = t.closest('[data-act]'); if (!act) return;
      const a = act.dataset.act;
      if (a === 'clear') { st.era = 0; st.region = -1; st.min = 1; st.src = ''; applyFilters(); }
      else if (a === 'all') select(null);
      else if (a === 'docback') docBack();
      else if (a === 'lens') setLens(!st.lens);
      else if (a === 'through') setThrough(true);
      else if (a === 'more-subj') { const box = act.parentNode; box.classList.add('is-all'); act.remove(); }
      else if (a === 'more-co' && st.sel) { const box = $('#pv-co'); if (box) box.innerHTML = coOf(st.sel).map(({ q, n }) => personLink(q, n > 1 ? n : null)).join(''); act.remove(); }
      else if (a === 'copy' && st.sel) copyLink(act);
    });
    // hovering a moment in the panel lights it on the chart
    // (a moment row lights its diamond, a person lights their star, a chapter heading lights its ring)
    scroller.addEventListener('pointerover', e => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      const t = e.target.closest ? e.target : null; if (!t) return;
      const r = t.closest('[data-slug]'), s = r ? r.dataset.slug : null;
      const pe = t.closest('[data-person]'), hp = pe ? PT.get(pe.dataset.person) || null : null;
      const ce = t.closest('[data-ch]'), pr = ce ? +ce.dataset.ch : 0;
      if (s !== st.hoverMoment || hp !== st.hoverPerson || pr !== st.panelRing) { st.hoverMoment = s; st.hoverPerson = hp; st.panelRing = pr; kick(); }
    });
    scroller.addEventListener('pointerleave', () => { if (st.hoverMoment || st.hoverPerson || st.panelRing) { st.hoverMoment = null; st.hoverPerson = null; st.panelRing = 0; kick(); } });
    scroller.addEventListener('scroll', () => { const b = $('.pv-bar', scroller); if (b) b.classList.toggle('is-stuck', scroller.scrollTop > 4); }, { passive: true });
    scroller.addEventListener('error', e => {
      const im = e.target; if (!im || im.tagName !== 'IMG') return;
      im.remove();   // the era plate beneath it stays
    }, true);
    // search
    qIn.addEventListener('input', runSearch);
    qIn.addEventListener('focus', () => { if (qIn.value) runSearch(); });
    qIn.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (!results.length) return; e.preventDefault();
        active = (active + (e.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length;
        $$('li', qRes).forEach((li, i) => li.setAttribute('aria-selected', String(i === active)));
        qIn.setAttribute('aria-activedescendant', 'pp-r' + active);
      } else if (e.key === 'Enter') { e.preventDefault(); pickResult(active); }
      else if (e.key === 'Escape') { qIn.value = ''; runSearch(); qIn.blur(); }
    });
    qRes.addEventListener('pointerdown', e => { if (e.target.closest('.r-go')) return; const li = e.target.closest('li[data-i]'); if (li) { e.preventDefault(); pickResult(+li.dataset.i); } });
    qIn.addEventListener('blur', () => setTimeout(() => { qRes.hidden = true; qIn.setAttribute('aria-expanded', 'false'); }, 150));
    // keyboard
    addEventListener('keydown', e => {
      const t = e.target, field = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
      if (e.key === 'Escape' && !field) {
        if (st.through) setThrough(false); else if (st.sel) select(null);
        else if (slSplit() && (st.slSel || cam.k > 1.01)) { slSelect(null); resetCam(); }
        else if (st.era || st.region >= 0 || st.min > 1 || st.src) { st.era = 0; st.region = -1; st.min = 1; st.src = ''; applyFilters(); }
        return;
      }
      if (field || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === ']') { e.preventDefault(); step(1); }
      else if (e.key === '[') { e.preventDefault(); step(-1); }
      else if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomAt(CX, CY, 1.5, 200); }
      else if (e.key === '-' || e.key === '_') { e.preventDefault(); zoomAt(CX, CY, 1 / 1.5, 200); }
      else if (e.key === '0') { e.preventDefault(); resetCam(); }
    });
    // the phone sheet: tap or drag the handle
    let hd = null;
    handle.addEventListener('pointerdown', e => { hd = { y: e.clientY, t: now(), full: root.classList.contains('sheet-full') }; try { handle.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } panel.style.transition = 'none'; });
    handle.addEventListener('pointermove', e => { if (!hd) return; const dy = e.clientY - hd.y, base = hd.full ? 0 : sheetTop; panel.style.transform = `translateY(${clamp(base + dy, 0, sheetTop + 120)}px)`; });
    const hEnd = e => { if (!hd) return; const dy = e.clientY - hd.y; panel.style.transition = ''; const full = Math.abs(dy) < 6 ? !hd.full : dy < -40 ? true : dy > 40 ? false : hd.full; hd = null; setSheet(full); };
    handle.addEventListener('pointerup', hEnd); handle.addEventListener('pointercancel', hEnd);
    addEventListener('lrsite:params', () => readHash(false));
    document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });
  }

  // read-only hook for the verification scripts: where a person's star is on screen, and what is showing
  window.__people = {
    at: tok => { const p = PT.get(tok); return p ? [Math.round(stage.getBoundingClientRect().left + V.ox + p.x * V.K), Math.round(stage.getBoundingClientRect().top + V.oy + p.y * V.K)] : null; },
    replay: () => { st.introT0 = now(); bufKey = ''; kick(); return 'replaying'; },
    bench: (n, skip) => { n = n || 20; Object.keys(DBG).forEach(k => delete DBG[k]); (skip || '').split(',').filter(Boolean).forEach(k => { DBG[k] = 1; }); ctx.getImageData(0, 0, 1, 1); const t0 = now(); for (let i = 0; i < n; i++) { bufKey = ''; draw(now()); ctx.getImageData(0, 0, 1, 1); } Object.keys(DBG).forEach(k => delete DBG[k]); bufKey = ''; kick(); return +((now() - t0) / n).toFixed(1); },
    boxes: () => ({ ruler: rulerBoxes.map(b => b.map(Math.round)), placed: placed.filter(b => b[2] - b[0] > 40).map(b => b.map(Math.round)), ui: uiRects.map(b => b.map(Math.round)) }),
    counts: () => ({ people: P.length, edges: EDGES.length, moments: IX.length }),
    mAt: slug => { const m = BY && BY.get(slug), b = stage.getBoundingClientRect(); return m ? [Math.round(b.left + V.ox + m.px * V.K), Math.round(b.top + V.oy + m.py * V.K)] : null; },
    // 8 Oct 2026: any subject on the Subjects index map by slug (its mark where it is drawn now, through the
    // Time / Meaning / Kind glide); null when it has no place or its kind is switched off
    sAt: slug => { const q = typeof SL !== 'undefined' && SL.ready && SL.by.get(slug), b = stage.getBoundingClientRect(); return q && q.cx != null && SL.kinds.has(q.k) ? [Math.round(b.left + V.ox + q.cx * V.K), Math.round(b.top + V.oy + q.cy * V.K)] : null; },
    sl: () => (typeof SL !== 'undefined' && SL.ready ? { K: +V.K.toFixed(3), ox: Math.round(V.ox), oy: Math.round(V.oy), n: SL.list.length, calm: !!st.slCalm, mode: st.slMode, tab: st.slTab, sort: st.slSort, yr: yrOf(st.yrT), path: (st.slPath || []).map(x => x.slug) } : null),
    center: () => { const b = stage.getBoundingClientRect(); return [Math.round(b.left + V.ox), Math.round(b.top + V.oy)]; },
    state: () => ({ sel: st.sel && st.sel.tok, lens: st.lens, era: st.era, region: st.region, min: st.min, through: st.through, k: +cam.k.toFixed(2), win: win && win.sc.id, layers: layers.length, live: liveNow(), sceneOK }),
  };

  // ── start: the chart assembles outward from the pupil, as history does ──
  // ── LR-SUBJECTS + LR-DOCS (5 Oct 2026), inserted into people.js by build_embed.py ──
  // A subject page that is not a person opens the chart on its subject (places, works, exhibitions, organisations,
  // themes, techniques). Editorials and podcast episodes are marks on the chart, set beside the moment they are about
  // (data/docs.json, build_docs.py); a mark opens its own constellation. A Timeline moment lists the pieces that talk
  // about it. Peter: "how can editorials and podcast be integrated into the view? after all, it's really about
  // marrying those 3".
  const ED_HEX = '#FF4C00', EP_HEX = '#02B0F4';
  const DOCS = { list: [], by: new Map(), key: new Map(), byMoment: new Map(), ready: false };
  function loadDocs() {
    fetch((window.LR_DATA || '') + 'data/docs.json', { cache: 'default' }).then(r => (r.ok ? r.json() : null)).then(j => {
      if (!j) return;
      const at = new Map();
      j.d.forEach(d => {
        d.hm = BY.get(d.home) || null;
        d.pp = (d.ppl || []).map(t => PT.get(t)).filter(Boolean);
        d.gs = new Set((d.gu || []).map(t => PT.get(t)).filter(Boolean));
        d.lkm = (d.lk || []).map(s => BY.get(s)).filter(Boolean);
        const lk = new Set(d.lkm);
        d.relm = (d.rel || []).map(s => BY.get(s)).filter(m => m && !lk.has(m));
        d.ancm = (d.anc || []).map(s => BY.get(s)).filter(Boolean);
        DOCS.list.push(d); DOCS.by.set(d.id, d); DOCS.key.set(d.k + ':' + (d.k === 'a' ? d.s : d.no), d);
        if (d.hm) { const g = at.get(d.hm) || []; g.push(d); at.set(d.hm, g); }
        // a moment is written about in a piece that sits beside it, or that links to it among its strongest moments
        const strong = new Set([d.hm].concat(d.ancm.slice(0, 3).filter(m => lk.has(m))));
        new Set(d.lkm.concat([...strong])).forEach(m => { if (!m) return; const l = DOCS.byMoment.get(m) || []; l.push({ d, w: strong.has(m) }); DOCS.byMoment.set(m, l); });
      });
      // pieces beside the same moment fan out around it
      at.forEach((list, m) => list.forEach((d, i) => {
        const a = (m.i * 2.39996 + i * 2.39996) % TAU, r = 0.0105 * (1 + 0.55 * Math.floor(i / 6));
        d.x = m.px + r * Math.cos(a); d.y = m.py + r * Math.sin(a);
      }));
      DOCS.byMoment.forEach(l => l.sort((a, b) => (b.w - a.w) || (a.d.k < b.d.k ? -1 : a.d.k > b.d.k ? 1 : 0) || (b.d.no - a.d.no)));
      DOCS.ready = true;
      if (st.subj && !st.subj.doc) st.subj.docs = docsOfDef(st.subj.def);
      if (st.subj) { if (st.subj.doc) renderDoc(); else renderSubject(); }
      else if (st.sel) $$('.pm[data-slug]', scroller).forEach(addBridge);
      kick();
    }).catch(() => {});
  }
  const docName = d => (d.k === 'a' ? 'Editorial' : 'Podcast episode');
  const docLink = d => `<a class="pm-doc" href="${LRWEB}/${d.k === 'a' ? 'editorial' : 'episodes'}/${esc(d.s)}" data-doc="${esc(d.id)}">${esc(d.t)}</a>`;
  const andMore = (l, n) => l.slice(0, n).map(x => docLink(x.d)).join(', ') + (l.length > n ? ` and ${fmt(l.length - n)} more` : '');
  function bridgeOf(m) {
    const cur = st.subj && st.subj.doc, l = (DOCS.byMoment.get(m) || []).filter(x => x.d !== cur); if (!l.length) return '';
    const wa = l.filter(x => x.w && x.d.k === 'a'), pod = l.filter(x => x.d.k === 'p'), ma = l.filter(x => !x.w && x.d.k === 'a'), out = [];
    if (wa.length) out.push(`Written about in ${andMore(wa, 2)}`);
    if (pod.length) out.push(`On the podcast: ${andMore(pod, 2)}`);
    if (ma.length) out.push(`Mentioned in ${andMore(ma, 2)}`);
    return `<span class="pm-br">${out.join('<br>')}</span>`;
  }
  function addBridge(row) {
    if (row.querySelector('.pm-br')) return;
    const m = BY.get(row.dataset.slug), tx = row.querySelector('.pm-tx'); if (!m || !tx) return;
    const h = bridgeOf(m); if (h) tx.insertAdjacentHTML('beforeend', h);
  }
  function bridgeTip(m) {
    const l = DOCS.byMoment.get(m); if (!l || !l.length) return '';
    const a = l.filter(x => x.d.k === 'a').length, p = l.length - a;
    return `<p class="t-m t-br">${[a ? `${fmt(a)} ${a === 1 ? 'editorial' : 'editorials'}` : '', p ? `${fmt(p)} podcast ${p === 1 ? 'episode' : 'episodes'}` : ''].filter(Boolean).join(' &middot; ')}</p>`;
  }
  // the marks that light with what is open: a piece, a subject's pieces, a person's pieces
  function docsLit() {
    const sj = st.subj;
    if (sj && sj.doc) return new Set([sj.doc]);
    if (sj) return sj.docs;
    if (st.sel) { const p = st.sel, s = new Set(); p.ad.forEach(n => { const d = DOCS.by.get('a' + n); if (d) s.add(d); }); p.pd.forEach(n => { const d = DOCS.by.get('p' + n); if (d) s.add(d); }); return s; }
    return null;
  }
  function markSize() { return clamp(3.1 * Math.pow(cam.k, 0.32) * starScale, 2.6, 7); }
  function drawDocs(K, ox, oy, fade) {
    if (!DOCS.ready || st.thP > 0) return;
    const lit = docsLit(), s = markSize(), hd = st.hover && st.hover.type === 'doc' ? st.hover.d : null;
    const one = (d, on) => {
      const x = ox + d.x * K, y = oy + d.y * K; if (x < -8 || y < -8 || x > W + 8 || y > H + 8) return;
      if (st.era && d.hm.c !== st.era && !on) g.globalAlpha = fade * 0.12;
      else g.globalAlpha = fade * (lit ? (on ? 1 : 0.13) : 0.82);
      g.fillStyle = d.k === 'a' ? ED_HEX : EP_HEX; g.strokeStyle = INK; g.lineWidth = 1;
      g.beginPath(); if (d.k === 'a') g.rect(x - s, y - s, 2 * s, 2 * s); else g.arc(x, y, s * 1.12, 0, TAU);
      g.fill(); g.stroke();
      if (on && lit || d === hd) { g.globalAlpha *= d === hd ? 1 : 0.55; g.strokeStyle = '#FCFBF7'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, s * 2.2, 0, TAU); g.stroke(); }
    };
    DOCS.list.forEach(d => { if (d.hm && !(lit && lit.has(d))) one(d, false); });
    if (lit) lit.forEach(d => { if (d.hm) one(d, true); });
    if (hd && !(st.subj && st.subj.doc === hd)) {      // a piece under the pointer: a light preview of what it names
      const x = ox + hd.x * K, y = oy + hd.y * K; g.globalAlpha = fade * 0.9; g.lineCap = 'round';
      g.beginPath(); hd.pp.forEach(q => { if (q.vis < 0.3) return; g.moveTo(x, y); g.lineTo(ox + q.x * K, oy + q.y * K); });
      hd.lkm.forEach(m => { g.moveTo(x, y); g.lineTo(ox + m.px * K, oy + m.py * K); });
      g.strokeStyle = 'rgba(1,16,21,.8)'; g.lineWidth = 2.6; g.stroke(); g.strokeStyle = 'rgba(252,251,247,.8)'; g.lineWidth = 0.9; g.stroke();
      g.lineCap = 'butt';
    }
    g.globalAlpha = 1;
  }
  function hitDoc(x, y, touch) {
    if (!DOCS.ready) return null;
    const K = V.K, ox = V.ox, oy = V.oy, rr = markSize() + (touch ? 9 : 3), lit = docsLit();
    let best = null, bd = rr * rr;
    DOCS.list.forEach(d => {
      if (!d.hm || (lit && !lit.has(d) && st.subj && st.subj.doc)) return;
      const dx = ox + d.x * K - x, dy = oy + d.y * K - y, d2 = dx * dx + dy * dy;
      if (d2 < bd) { bd = d2; best = d; }
    });
    return best ? { type: 'doc', d: best, d2: bd } : null;
  }
  function docTip(d) {
    const m = d.hm, n = d.pp.length, k = d.lkm.length;
    return `<p class="t-k"><i style="background:${d.k === 'a' ? ED_HEX : EP_HEX}"></i><span class="lab">${docName(d)} &middot; ${esc(d.d)}</span></p><p class="t-n">${esc(d.t)}</p>
      <p class="t-m">${[n ? `Mentions ${fmt(n)} ${n === 1 ? 'person' : 'people'}` : '', k ? `${fmt(k)} Timeline ${k === 1 ? 'moment' : 'moments'}` : ''].filter(Boolean).join(' and ')}</p>
      <p class="t-m">Beside ${m.th}, ${esc(m.y)}</p><p class="t-a">Click for its constellation</p>`;
  }

  function docsOfDef(def) {
    const docs = new Set();
    (def.a || []).forEach(x => { const d = DOCS.key.get('a:' + x[1]); if (d) docs.add(d); });
    (def.p || []).forEach(x => { const d = DOCS.key.get('p:' + x[0]); if (d) docs.add(d); });
    return docs;
  }
  window.LR_DOC_OK = id => { const d = DOCS.by.get(id); return !!(d && d.hm); };
  // ── a subject ──
  function enterSubject(def) {
    const ms = (def.m || []).map(s => BY.get(s)).filter(Boolean).sort((a, b) => a.yn - b.yn || a.i - b.i);
    const cnt = new Map(); ms.forEach(m => (m.people || []).forEach(q => cnt.set(q, (cnt.get(q) || 0) + 1)));
    // its constellation: the people it brings together, joined where they share one of its moments
    // (a moment naming many people counts for less, or an exhibition list becomes a hairball)
    const top = Array.from(cnt, ([q, n]) => ({ q, n })).sort((a, b) => b.n - a.n || a.q.rank - b.q.rank).slice(0, 24).map(x => x.q), topS = new Set(top), ew = new Map();
    ms.forEach(m => {
      const ps = (m.people || []).filter(q => topS.has(q)), w = 1 / Math.max(1, (m.people || []).length - 1);
      for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
        const a = ps[i].i < ps[j].i ? ps[i] : ps[j], b = a === ps[i] ? ps[j] : ps[i], k = a.i + ':' + b.i, e = ew.get(k) || { a, b, w: 0 };
        e.w += w; ew.set(k, e);
      }
    });
    const edges = Array.from(ew.values()).sort((x, y) => y.w - x.w).slice(0, 48).map(e => { const c = ctrl(e.a.x, e.a.y, e.b.x, e.b.y); return Object.assign(e, { cx: c[0], cy: c[1] }); });
    const docs = docsOfDef(def);
    st.subj = { def, ms, cnt, ps: ms.length ? new Set(cnt.keys()) : null, edges, stars: top.slice().sort((a, b) => a.cnt - b.cnt), docs, t0: now() };
    if (SLON && def.slug && SL.ready) st.subj.sl = SL.by.get(def.slug) || null;
    st.sel = null; life = null; st.selT0 = now(); st.hoverMoment = null; st.hoverPerson = null;
    document.title = `${def.n} · ${TITLE}`;
    applyFilters();
    if (ms.length) showScene(ms[Math.floor((ms.length - 1) / 2)]);
    renderSubject();
    kick();
  }
  // ── a piece (editorial or episode) ──
  function enterDoc(d) {
    const sj = st.subj, from = sj ? (sj.doc ? sj.from : { def: sj.def }) : st.sel ? { p: st.sel } : null;
    const ms = d.lkm.concat(d.relm).sort((a, b) => a.yn - b.yn || a.i - b.i);
    const cnt = new Map(); d.pp.forEach(q => cnt.set(q, d.gs.has(q) ? 2 : 1));
    st.subj = { doc: d, def: { n: d.t }, ms, cnt, ps: new Set(d.pp), from, docs: new Set([d]), stars: d.pp.slice().sort((a, b) => a.cnt - b.cnt), t0: now() };
    st.sel = null; life = null; st.selT0 = now(); st.hoverMoment = null; st.hoverPerson = null;
    document.title = `${d.t} · ${TITLE}`;
    applyFilters();
    if (d.hm) showScene(d.hm);
    renderDoc();
    if (isPhone()) setSheet(false);
    kick();
  }
  function docBack() {
    const f = st.subj && st.subj.from;
    if (f && f.def) enterSubject(f.def); else if (f && f.p) select(f.p); else select(null);
  }
  // the lines: a piece to everyone and every moment it names; a subject's people to each other
  function drawSubj(t, I, K, ox, oy, fade, kz) {
    const sj = st.subj; if (!sj || st.thP > 0) return;
    const el = Math.max(0, t - sj.t0);
    if (sj.doc && sj.doc.hm) {
      const d = sj.doc, ax = ox + d.x * K, ay = oy + d.y * K, ends = d.pp.map(q => [q, d.gs.has(q) ? 2 : 1]).concat(d.lkm.map(m => [m, 1])).concat(d.relm.map(m => [m, 0]));
      for (let tier = 0; tier < 3; tier++) {
        g.beginPath(); let any = false;
        ends.forEach(([o, tr], i) => {
          if (tr !== tier) return;
          const bx = o.px !== undefined ? o.px : o.x, by = o.px !== undefined ? o.py : o.y, c = ctrl(d.x, d.y, bx, by);
          const gr = RM ? 1 : E.out3(clamp((el - 60 - Math.min(i, 40) * 14) / 520, 0, 1)); if (gr <= 0) return;
          g.moveTo(ax, ay); quadTo(ax, ay, ox + c[0] * K, oy + c[1] * K, ox + bx * K, oy + by * K, gr); any = true;
        });
        if (!any) continue;
        g.globalAlpha = fade * [0.32, 0.6, 0.9][tier]; g.strokeStyle = d.k === 'a' ? ED_HEX : EP_HEX; g.lineWidth = [0.7, 1.1, 1.8][tier];
        g.stroke();
      }
    } else if (sj.edges && sj.edges.length) {
      for (let tier = 0; tier < 3; tier++) {
        g.beginPath(); let any = false;
        sj.edges.forEach((e, i) => {
          const tr = i < 8 ? 2 : i < 22 ? 1 : 0; if (tr !== tier) return;
          const gr = RM ? 1 : E.out3(clamp((el - 200 - Math.min(i, 40) * 18) / 620, 0, 1)); if (gr <= 0) return;
          const ax = ox + e.a.x * K, ay = oy + e.a.y * K;
          g.moveTo(ax, ay); quadTo(ax, ay, ox + e.cx * K, oy + e.cy * K, ox + e.b.x * K, oy + e.b.y * K, gr); any = true;
        });
        if (!any) continue;
        g.globalAlpha = fade * [0.2, 0.42, 0.8][tier]; g.strokeStyle = '#FF4C00'; g.lineWidth = [0.6, 1, 1.6][tier];
        g.stroke();
      }
    }
    g.globalAlpha = 1;
    if (sj.stars && sj.stars.length) drawStars(I, K, ox, oy, fade, kz, sj.stars, false);
  }

  // ── panels ──
  const moreList = (list, f, n) => `<ul class="pv-list">${list.slice(0, n).map(f).join('')}</ul>${list.length > n ? `<details class="pv-more"><summary class="pv-ib" style="display:inline-grid;list-style:none">${list.length - n} more</summary><ul class="pv-list">${list.slice(n).map(f).join('')}</ul></details>` : ''}`;
  const edRow = x => { const d = DOCS.key.get('a:' + x[1]); return `<li class="pv-ed pv-aed"><a class="t" href="${LRWEB}/editorial/${esc(x[1])}" ${d ? `data-doc="${esc(d.id)}"` : 'target="_blank" rel="noopener"'}>${esc(x[2])}</a><p>${esc(x[3] || '')}</p></li>`; };
  const podRow = x => { const d = DOCS.key.get('p:' + x[0]); return `<li class="pv-pod"><p class="t"><a href="${LRWEB}/episodes/${esc(x[1])}" ${d ? `data-doc="${esc(d.id)}"` : 'target="_blank" rel="noopener"'}>${esc(x[2])}</a></p><p class="m">${esc(x[3] || '')}</p></li>`; };
  const yrsOf = ms => (ms.length ? (ms[0].y === ms[ms.length - 1].y ? esc(ms[0].y) : `${esc(ms[0].y)} to ${esc(ms[ms.length - 1].y)}`) : '');
  const stripOf = ms => (ms.length ? `<div class="pv-strip" aria-label="Its moments across the ten chapters">${CH.map((c, i) => `<div class="pv-strip-ch" style="left:${i * 10}%;width:10%"><span>${i === 0 ? '&lt;1850' : i === 1 ? '1850' : esc(c.years.replace('s', ''))}</span></div>`).join('')}<div class="pv-strip-axis"></div>
      ${ms.map(m => `<a href="${S.href('moment', { slug: m.s })}" data-moment="${esc(m.s)}" data-slug="${esc(m.s)}" class="${m.f.includes('allTime') ? 'is-all' : ''}" style="left:${(m.c - 1) * 10 + 0.6 + 8.8 * m.q}%;--c:${CH_INK[m.c]}" title="${esc(m.y + ', ' + m.t)}" aria-label="${esc(m.y + ', ' + m.t)}"></a>`).join('')}</div>` : '');
  function momentRows(ms) {
    let rows = '', lastC = 0;
    ms.forEach(m => {
      if (m.c !== lastC) { if (lastC) rows += '</ol>'; lastC = m.c; const cc = ms.filter(x => x.c === m.c).length; rows += `<p class="lab pv-chh" data-ch="${m.c}" style="--c:${CH_INK[m.c]}"><i></i>Chapter ${m.c} &middot; ${esc(CH[m.c - 1].years)} &middot; ${esc(CH[m.c - 1].era)}${cc > 1 ? ` &middot; ${cc}` : ''}</p><ol class="pv-ms">`; }
      const st2 = m.f.includes('allTime') ? '<span class="st">All-Time</span>' : m.f.includes('top') ? '<span class="st">Top</span>' : '';
      rows += `<li class="pm" data-slug="${esc(m.s)}" style="--c:${CH_INK[m.c]}">
        ${thumb(m)}
        <span class="pm-tx"><span class="pm-y">${esc(m.y)}${st2}</span><a class="pm-t" href="${S.href('moment', { slug: m.s })}" data-moment="${esc(m.s)}">${m.th}</a>${bridgeOf(m)}</span>
        <button class="pm-w${win && win.m === m ? ' is-on' : ''}" type="button" data-watch="${esc(m.s)}" aria-label="Show the live scene for ${esc(m.t)} in the window" title="Show its live scene in the window">${EYE}</button></li>`;
    });
    if (lastC) rows += '</ol>';
    return rows;
  }
  const subjChip = x => `<a class="pv-chip is-tag" href="${LRWEB}/subjects/${esc(x[0])}">${x[2] === 'Work' || x[2] === 'Exhibition' ? `<em>${esc(x[1])}</em>` : esc(x[1])}</a>`;
  function finishPanel() {
    scroller.scrollTop = 0;
    thumbs(scroller);
    $$('.pvw-eye canvas', scroller).forEach(drawEye);
  }
  function renderSubject() {
    const sj = st.subj; if (!sj || sj.doc) return;
    const d = sj.def, ms = sj.ms, A = d.a || [], Pd = d.p || [];
    const people = Array.from(sj.cnt, ([q, n]) => ({ q, n })).sort((a, b) => b.n - a.n || a.q.rank - b.q.rank);
    const B = n => `<b>${fmt(n)}</b>`, pl = (n, a, b) => (n === 1 ? a : b);
    const stats = [];
    if (A.length) stats.push(`Mentioned in ${B(A.length)} ${pl(A.length, 'editorial', 'editorials')}.`);
    if (Pd.length) stats.push(`Mentioned in ${B(Pd.length)} podcast ${pl(Pd.length, 'episode', 'episodes')}.`);
    if (ms.length) stats.push(`Mentioned in ${B(ms.length)} Timeline ${pl(ms.length, 'moment', 'moments')} (${yrsOf(ms)}).`);
    if (people.length) stats.push(`${B(people.length)} ${pl(people.length, 'person appears', 'people appear')} in its moments.`);
    const mid = ms.length ? ms[Math.floor((ms.length - 1) / 2)] : null, R = d.r || [];
    scroller.innerHTML = `<div class="pv pv-person pv-subject">
      <div class="pv-bar"><button class="pv-ib pv-all" type="button" data-act="all" aria-label="Back to everyone">${ALL}<span>Everyone</span></button></div>
      <p class="lab pv-kicker">${mid ? `<span class="dot" style="background:${CH_INK[mid.c]}"></span>` : ''}${esc(d.k || 'Subject')}</p>
      <h1 class="pv-name">${esc(d.n)}</h1>
      ${d.b ? `<p class="pv-bio">${esc(d.b)}</p>` : ''}
      <p class="pv-stats">${stats.join(' ')}</p>
      ${stripOf(ms)}
      ${sj.sl ? slNearHTML(sj.sl) : ''}
      ${d.v ? '<section class="pv-sec" id="pv-onview" hidden></section>' : ''}
      ${A.length ? `<section class="pv-sec" id="pv-aeds"><h2 class="lab">In the editorials <small>${fmt(A.length)}</small></h2>${moreList(A, edRow, 6)}</section>` : ''}
      ${Pd.length ? `<section class="pv-sec" id="pv-apods"><h2 class="lab">On the podcast <small>${fmt(Pd.length)}</small></h2>${moreList(Pd, podRow, 4)}</section>` : ''}
      ${ms.length ? `<span id="pv-mom"></span><section class="pv-sec"><h2 class="lab">Timeline moments <small>${ms.length}</small></h2>${momentRows(ms)}</section>` : ''}
      ${people.length ? `<section class="pv-sec" id="pv-cosec"><h2 class="lab">People in its moments <small>${fmt(people.length)}</small></h2>
        <div class="pv-chips">${people.slice(0, 40).map(({ q, n }) => personLink(q, n > 1 ? n : null)).join('')}</div>
        ${people.length > 40 ? `<details class="pv-more"><summary class="pv-ib" style="display:inline-grid;list-style:none">${people.length - 40} more</summary><div class="pv-chips">${people.slice(40).map(({ q, n }) => personLink(q, n > 1 ? n : null)).join('')}</div></details>` : ''}</section>` : ''}
      ${R.length ? `<section class="pv-sec" id="pv-rel"><h2 class="lab">Related subjects</h2><div class="pv-chips">${R.map(subjChip).join('')}</div></section>` : ''}
      ${windowCard()}
      ${mid ? `<section class="pv-sec"><h2 class="lab">Keep exploring</h2><div class="pv-go">
        <a href="${S.href('chronology', { slug: ms[0].s })}" data-go="chronology" data-slug="${esc(ms[0].s)}"><span class="lab">Chronology</span><span>Start at its first moment, ${esc(ms[0].y)}</span></a>
        <a href="${S.href('ideas', { slug: mid.s })}" data-go="ideas" data-slug="${esc(mid.s)}"><span class="lab">Ideas</span><span>Find it on the map of ideas</span></a>
        <a href="${S.href('moment', { slug: mid.s })}" data-moment="${esc(mid.s)}"><span class="lab">Open the moment</span><span>${mid.th}</span></a></div></section>` : ''}
    </div>`;
    finishPanel();
    if (d.v) onView(d);
  }
  // its six nearest subjects by shared pages, each with the archive sentence naming both (or the page they share);
  // any filled in from the embedding say so
  function slNearHTML(q) {
    const nb = q.nb.map(k => SL.by.get(k)).filter(Boolean); if (!nb.length) return '';
    if (!q.W) slW(q.slug).then(w => { q.W = w; const el = document.getElementById('pv-near'); if (el && st.subj && st.subj.sl === q) el.outerHTML = slNearHTML(q); });
    const why = (n, i) => {
      if (i >= q.nk) return '<p class="nr-w"><span class="lab">Related by meaning</span></p>';
      const w = q.W && q.W.w.find(x => x[0] === n.slug); if (!w) return '';
      return w[1] ? `<p class="nr-w">&ldquo;${esc(w[1])}&rdquo; <span class="lab">${esc(w[2])}</span></p>` : `<p class="nr-w"><span class="lab">Both in</span> ${esc(w[2])}</p>`;
    };
    return `<section class="pv-sec" id="pv-near"><h2 class="lab">Nearest <small>${nb.length}</small></h2><ol class="pv-near">${nb.map((n, i) =>
      `<li><a href="${LRWEB}/subjects/${esc(n.slug)}" data-sl="${esc(n.slug)}"><i style="background:${SLK_HEX[n.k] || '#EFE9D8'}"></i><span class="nm">${esc(n.n)}</span><span class="lab">${SLK_ONE[n.k]}</span></a>${why(n, i)}</li>`).join('')}</ol></section>`;
  }
  function renderDoc() {
    const sj = st.subj; if (!sj || !sj.doc) return;
    const d = sj.doc, f = sj.from, ms = sj.ms, B = n => `<b>${fmt(n)}</b>`, pl = (n, a, b) => (n === 1 ? a : b);
    const ppl = d.pp.slice().sort((a, b) => (d.gs.has(b) - d.gs.has(a)) || a.rank - b.rank);
    const stats = [];
    if (ppl.length) stats.push(`Mentions ${B(ppl.length)} ${pl(ppl.length, 'person', 'people')}`);
    if (d.lkm.length) stats.push(`${B(d.lkm.length)} Timeline ${pl(d.lkm.length, 'moment', 'moments')}`);
    const back = f && (f.def || f.p) ? `<button class="pv-ib pv-all" type="button" data-act="docback"><span>&larr; ${esc(f.def ? f.def.n : f.p.n)}</span></button>` : '';
    scroller.innerHTML = `<div class="pv pv-person pv-subject pv-doc">
      <div class="pv-bar">${back}<button class="pv-ib pv-all" type="button" data-act="all" aria-label="Back to everyone">${ALL}<span>Everyone</span></button></div>
      <p class="lab pv-kicker"><span class="dot" style="background:${d.k === 'a' ? ED_HEX : EP_HEX};${d.k === 'a' ? 'border-radius:1px' : ''}"></span>${docName(d)} &middot; ${esc(d.d)}</p>
      <h1 class="pv-name pv-doc-t">${esc(d.t)}</h1>
      ${d.by ? `<p class="pv-bio">By ${esc(d.by)}</p>` : ''}
      ${stats.length ? `<p class="pv-stats">${stats.join(' and ')}.${d.hm ? ` It sits beside ${d.hm.th}, ${esc(d.hm.y)}.` : ''}</p>` : ''}
      <p><a class="pv-ib pv-cta" href="${LRWEB}/${d.k === 'a' ? 'editorial' : 'episodes'}/${esc(d.s)}">${d.k === 'a' ? 'Read the editorial' : 'Listen to the episode'} &#8599;</a></p>
      ${stripOf(ms)}
      ${d.lkm.length ? `<span id="pv-mom"></span><section class="pv-sec"><h2 class="lab">Timeline moments it mentions <small>${d.lkm.length}</small></h2>${momentRows(d.lkm.slice().sort((a, b) => a.yn - b.yn || a.i - b.i))}</section>` : ''}
      ${d.relm.length ? `<section class="pv-sec"><h2 class="lab">Related on the Timeline <small>${d.relm.length}</small></h2>${momentRows(d.relm.slice().sort((a, b) => a.yn - b.yn || a.i - b.i))}</section>` : ''}
      ${ppl.length ? `<section class="pv-sec" id="pv-cosec"><h2 class="lab">People it mentions <small>${fmt(ppl.length)}</small></h2>
        <div class="pv-chips">${ppl.map(q => personLink(q, null)).join('')}</div></section>` : ''}
      ${d.sj && d.sj.length ? `<section class="pv-sec"><h2 class="lab">Subjects <small>${fmt(d.sj.length)}</small></h2><div class="pv-chips">${d.sj.map(subjChip).join('')}</div></section>` : ''}
    </div>`;
    finishPanel();
  }
  // on view now: the calendar's current shows in this place (its city) or at this organisation (its venue)
  let CAL = null;
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const untilOf = e => { const [y, m, d] = e.split('-').map(Number); return `${d} ${MON[m - 1]}${y !== new Date().getFullYear() ? ' ' + y : ''}`; };
  function onView(d) {
    const box = $('#pv-onview', scroller); if (!box) return;
    (CAL || (CAL = fetch((window.LR_DATA || '') + '../calendar.json', { cache: 'default' }).then(r => (r.ok ? r.json() : { items: [] })).catch(() => ({ items: [] })))).then(c => {
      if (!st.subj || st.subj.def !== d || !box.isConnected) return;
      const nm = x => (x || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      const today = new Date().toISOString().slice(0, 10), keys = d.v.n;
      const hits = (c.items || []).filter(i => (i.k === 'exhibition' || i.k === 'event') && i.p && i.s && i.s <= today && (i.e || i.s) >= today).filter(i => {
        const p = i.p, cut = p.lastIndexOf(', '), city = nm(cut > 0 ? p.slice(cut + 2) : p), venue = nm(cut > 0 ? p.slice(0, cut).split(', ')[0].replace(/\([^)]*\)/g, '') : '');
        return keys.some(k => d.v.t === 'c' ? city === k || city.startsWith(k + ' ') : venue && (venue === k || (k.length >= 4 && venue.startsWith(k + ' ')) || (k.length >= 10 && (' ' + venue + ' ').includes(' ' + k + ' '))));
      });
      if (!hits.length) return;
      hits.sort((a, b) => (a.e || '9') < (b.e || '9') ? -1 : 1);
      box.innerHTML = `<h2 class="lab">On view now <small>${fmt(hits.length)}</small></h2><ul class="pv-list">${hits.slice(0, 8).map(i => `<li class="pv-ed pv-onv"><a class="t" href="${esc(i.u || LRWEB + '/editorials')}" target="_blank" rel="noopener">${esc(i.t).replace(/&lt;(\/?)i&gt;/g, '<$1i>')}</a><p>${esc(i.p)}${i.e ? ` &middot; Until ${untilOf(i.e)}` : ''}</p></li>`).join('')}</ul>`;
      box.hidden = false;
    });
  }

  // ── LR-SUBJECTS-MAP (7 Oct 2026 mockup): every subject on the people view ──
  // Peter: the index map is built ON the people view. Works, organisations, places, exhibitions, themes and techniques
  // join the people as marks of their own shape: set at the middle of their Timeline moments, or beside their nearest
  // subjects in meaning (test lab's EmbeddingGemma space) when no moment names them. Time scrubber, kind filters,
  // neighbours with one archive sentence on hover, and the Subjects index in the panel.
  const SLK_HEX = { 1: '#EFE9D8', 2: '#F2B233', 3: '#C9A0FF', 4: '#5FCB93', 5: '#FCFBF7', 6: '#FF8A70' };
  const SLK_NAME = ['People', 'Organisations', 'Works', 'Exhibitions', 'Places', 'Techniques', 'Themes'];
  const SLK_ONE = ['Person', 'Organisation', 'Work', 'Exhibition', 'Place', 'Technique', 'Theme'];
  // inert unless the Subjects index page asks for it (its loader sets LR_SUBJECTS_INDEX; ?subjects=1 locally)
  const SLON = !!(window.LR_SUBJECTS_INDEX || /[?&]subjects=1\b/.test(location.search));
  // 9 Oct 2026 (direction D): the Subjects page's hero: the map alone, full width in the Window's box; the index, paths and
  // lists live on the page below and drive the map through window.LR_SL_API
  const HERO = SLON && !!window.LR_SL_HERO;
  function slOpen(slug) { if (slug) try { window.parent.postMessage({ lrembed: 'open', url: LRWEB + '/subjects/' + slug }, '*'); } catch (e) {} }
  const SL = { list: [], by: new Map(), ready: false, kinds: new Set([0, 1, 2, 3, 4, 5, 6]) };
  const YB = [-71000, 1850, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020, 2025];
  st.yrT = 1;                                          // scrubber position, 0 (71,000 BCE) to 1 (2025)
  // the index opens calm, like the people view: subjects dimmed and unlabelled until someone hovers one, picks a kind,
  // scrubs or rearranges (review, 8 Oct 2026)
  st.slCalm = true;
  function slWake() { if (st.slCalm) { st.slCalm = false; kick(); } }
  function slChain(ch) {
    return Promise.all(ch.map(x => x.W ? 0 : slW(x.slug).then(w => { x.W = w; }))).then(() => ch.map((x, i) => { const nx = ch[i + 1], w = nx && x.W && x.W.t && x.W.t[nx.slug]; return { slug: x.slug, n: x.n, k: x.k, why: w ? (w[1] || '') : '', src: w ? w[2] : '' }; }));
  }
  function slHeroLabel() {
    const d = $('#sl-kinds'); if (!d || $('#sl-hk')) return;
    const p = document.createElement('p'); p.id = 'sl-hk'; p.className = 'lab sl-hk'; p.textContent = `Seven kinds \u00b7 ${fmt(SL.list.length)} subjects`; d.insertBefore(p, d.firstChild);
    const kc = $('#pp-key .pp-key-chip'); if (kc) { const q = kc.querySelector('.q'); kc.textContent = 'How to read the map'; if (q) kc.prepend(q); }
  }
  // the page below the hero reads the subjects and drives the map: hover and leave a name, find and draw a path
  window.LR_SL_API = {
    ready: () => !!SL.ready,
    kinds: () => SLK_NAME.slice(),
    list: () => SL.list.map(s => ({ slug: s.slug, n: s.n, k: s.k, e: s.e, p: s.p, t: s.t, tot: s.tot, yr: s.yr })),
    on: (n, f) => { (SLEV[n] || (SLEV[n] = [])).push(f); },
    select: slug => slSelect(slug ? SL.by.get(slug) || null : null), selected: () => st.slSel ? st.slSel.slug : null,
    kindsOn: () => Array.from(SL.kinds),
    setKinds: ks => { SL.kinds = new Set(ks); slKindsSync(); slWake(); if (slSplit() && !st.sel && !st.subj) renderIndex(); },
    year: () => (st.yrT >= 0.999 ? null : Math.round(yrOf(st.yrT))),
    da: () => SL.da,
    hover: slug => slListHover(slug), leave: () => slListLeave(),
    // a path through shared pages: route() only reads it, path() also draws it on the map
    route: (a, b) => { const A = SL.by.get(a), B = SL.by.get(b), ch = A && B ? slFindPath(A, B) || [] : []; return slChain(ch); },
    path: (a, b) => { const A = SL.by.get(a), B = SL.by.get(b); st.slPath = A && B ? slFindPath(A, B) || [] : []; slWake(); kick(); return slChain(st.slPath); },
    clearPath: () => { st.slPath = []; kick(); },
    sky: () => cv, ground: () => $('#pp-ground'), view: () => ({ K: V.K, ox: V.ox, oy: V.oy, W, H, hole: V.hole }),
    pos: slug => { const q = SL.by.get(slug); return q && q.cx != null ? [V.ox + q.cx * V.K, V.oy + q.cy * V.K] : null; },
  };
  // the Subjects page shares one state between this map and its index: kinds, selection, year (events out, setters in)
  const SLEV = {};
  function slEmit(n, v) { (SLEV[n] || []).forEach(f => { try { f(v); } catch (e) {} }); }
  function slReveal(q) {                             // where q sits now, easing it into view first if it is outside
    let x = V.ox + q.cx * V.K, y = V.oy + q.cy * V.K; const M = 48;
    if (!RM && (x < M || y < M || x > W - M || y > H - M)) {
      camT.anchor = null; camT.k = cam.k; camT.x = cam.x + CX - x; camT.y = cam.y + CY - y; clampCam(camT);
      x += camT.x - cam.x; y += camT.y - cam.y; kick();
    }
    return [Math.max(48, Math.min(W - 48, x)), Math.max(48, Math.min(H - 48, y))];
  }
  // 9 Oct 2026 (Peter: zoom in the split view "more intuitive and easy"). A name in the index flies the map to its
  // subject (zoomed in, centred, lit with its ties and card); the buttons, pinch, ⌘/Ctrl + scroll, double-click and drag
  // all zoom or move (a plain scroll over the map zooms it); a one-time hint says so the first time the pointer enters
  function slFly(q) {
    if (!q || q.cx == null) return;
    if (!SL.kinds.has(q.k)) { SL.kinds.add(q.k); slKindsSync(); slEmit('kinds', Array.from(SL.kinds)); }
    slLCam = null; clearTimeout(slLT);
    const k = Math.max(cam.k, 2.6), wx = (V.ox + q.cx * V.K - CX - cam.x) / (SC * cam.k), wy = (V.oy + q.cy * V.K - CY - cam.y) / (SC * cam.k);
    camT.anchor = null; camT.tau = RM ? 1 : 420; camT.k = k; camT.x = -wx * SC * k; camT.y = -wy * SC * k; clampCam(camT); kick();
    slSelect(q, CX + camT.x + wx * SC * k, CY + camT.y + wy * SC * k);
  }
  let slHintT = 0;
  function slZoomHint(msg, ms) {
    let el = $('#sl-zhint'); if (!el) { el = document.createElement('div'); el.id = 'sl-zhint'; el.setAttribute('role', 'status'); stage.appendChild(el); }
    el.textContent = msg; el.classList.add('is-on'); clearTimeout(slHintT); slHintT = setTimeout(() => el.classList.remove('is-on'), ms);
  }
  function slHintOnce() {
    try { if (localStorage.getItem('lr-sl-zoomhint')) return; localStorage.setItem('lr-sl-zoomhint', '1'); } catch (e) { if (slHintOnce.done) return; }
    slHintOnce.done = true;
    slZoomHint('Scroll or pinch to zoom \u00b7 drag to move \u00b7 click a name to fly to it', 3000);
    const off = () => { clearTimeout(slHintT); slHintT = setTimeout(() => { const el = $('#sl-zhint'); if (el) el.classList.remove('is-on'); }, 600); };
    cv.addEventListener('pointerdown', off, { once: true }); cv.addEventListener('wheel', off, { once: true, passive: true });
  }
  function slSelect(q, x, y) {
    if (q && (q.cx == null || !SL.kinds.has(q.k))) { if (q.cx == null) q = null; else { SL.kinds.add(q.k); slKindsSync(); } }
    st.slSel = q || null; slWake();
    if (q) { const p = x == null ? slReveal(q) : [x, y]; setHover({ type: 'sl', s: q }, p[0], p[1]); } else setHover(null);
    kick(); slEmit('select', q ? q.slug : null);
  }
  function slKindsSync() { $$('#sl-kinds [data-slk]').forEach(b => b.setAttribute('aria-pressed', String(SL.kinds.has(+b.dataset.slk)))); kick(); }
  let slLH = null, slLT = 0, slLCam = null;
  function slListHover(slug) {
    if (!window.LR_SL_CALM) return;
    const q = slug && SL.ready && SL.by.get(slug);
    if (!q || q.cx == null || st.sel || st.subj) return;
    clearTimeout(slLT);
    let x = V.ox + q.cx * V.K, y = V.oy + q.cy * V.K; const M = 48;
    if (!RM && (x < M || y < M || x > W - M || y > H - M)) {
      if (!slLCam) slLCam = { x: cam.x, y: cam.y, k: cam.k };
      // take the camera as it is (a zoom still easing around its anchor would otherwise ignore the pan)
      camT.anchor = null; camT.k = cam.k; camT.x = cam.x + CX - x; camT.y = cam.y + CY - y; clampCam(camT);
      x += camT.x - cam.x; y += camT.y - cam.y; kick();   // where it will settle
      x = Math.max(M, Math.min(W - M, x)); y = Math.max(M, Math.min(H - M, y));
    }
    slLH = q; setHover({ type: 'sl', s: q }, x, y);
  }
  function slListLeave() {
    if (!slLH) return; clearTimeout(slLT);
    slLT = setTimeout(() => {
      if (st.hover && st.hover.s === slLH) setHover(null);
      if (HERO && st.slSel) { const p = [V.ox + st.slSel.cx * V.K, V.oy + st.slSel.cy * V.K]; setHover({ type: 'sl', s: st.slSel }, p[0], p[1]); }   // back to the selection's card
      if (slLCam) { camT.anchor = null; camT.x = slLCam.x; camT.y = slLCam.y; slLCam = null; kick(); }
      slLH = null;
    }, 150);
  }
  // the window in the middle shows the chapter the scrubber stands in
  let slWinC = 10;
  function slWindowFor(t) {
    const y = yrOf(t); let c = 1; while (c < 10 && y > YB[c]) c++;
    if (c === slWinC || st.sel || st.subj) return; slWinC = c;
    const sc = SC_BY.get(CH[c - 1].scene), m0 = (sc && BY.get(sc.home)) || IX[0]; if (m0) showScene(m0);
  }
  const yrOf = t => { const c = Math.min(9, Math.floor(t * 10)), f = t * 10 - c; return YB[c] + (YB[c + 1] - YB[c]) * f; };
  const yrLab = y => (y < 0 ? fmt(Math.round(-y)) + ' BCE' : String(Math.round(y)));
  function yrA(y) { return st.yrT >= 0.999 || y == null || y <= yrOf(st.yrT) ? 1 : 0.06; }
  function loadSL() {
    // slc.json: the precomputed cut (build_ship.py); sentences and shared pages load per shard (slw/) on hover or path
    fetch(SLB() + 'data/slc.json', { cache: 'default' }).then(r => (r.ok ? r.json() : null)).then(j => {
      if (!j) return;
      j.s.forEach(r => {
        const s = { slug: r[0], n: r[1], k: r[2], e: r[3], p: r[4], t: r[5], yr: r[6], x: r[7], y: r[8], ux: r[9], uy: r[10], era: r[11], nbi: r[12], ti: r[13], nk: r[14] == null ? r[12].length : r[14] };
        s.tot = s.e + s.p + s.t; s.person = s.k === 0 ? PK.get(norm(s.n)) || PK.get(s.n.toLowerCase()) || PT.get(s.slug) || null : null;
        if (s.person) { s.x = s.person.x; s.y = s.person.y; }
        SL.list.push(s); SL.by.set(s.slug, s);
      });
      SL.list.forEach(s => { s.nb = s.nbi.map(i => SL.list[i] && SL.list[i].slug).filter(Boolean); });
      slArrange(j.r || []);
      SL.da = j.da || null; SL.p2s = new Map(SL.list.filter(s => s.person).map(s => [s.person, s.slug])); SL.ready = true;
      if (HERO) slHeroLabel();
      if (st.subj && !st.subj.doc && st.subj.def.slug && !st.subj.sl) { st.subj.sl = SL.by.get(st.subj.def.slug) || null; if (st.subj.sl) renderSubject(); }
      // the page shows this frame in place of its poster once the subjects are drawn on it (two frames on)
      requestAnimationFrame(() => requestAnimationFrame(() => { try { if (window.parent !== window) window.parent.postMessage({ lrembed: 'ready' }, '*'); } catch (e) {} }));
      if (!st.sel && !st.subj) renderIndex();
      kick();
    }).catch(() => {});
  }
  window.__LR_MOM_OUT = () => IX.map(m => [m.s, +(+m.px).toFixed(5), +(+m.py).toFixed(5), m.c, m.yn]);   // build_positions.py reads this once
  // the map's own data lives beside it (lr-media/subjects/), the people data where the subject pages read it
  const SLB = () => window.LR_SL_DATA || window.LR_DATA || '';
  const SLW = {};
  const slW = slug => { const n = shardOf(slug); return (SLW[n] || (SLW[n] = fetch(SLB() + 'data/slw/' + n + '.json').then(r => (r.ok ? r.json() : {})).catch(() => ({})))).then(sh => sh[slug] || { w: [], t: {} }); };
  function slSize(s) { return clamp(markSize() * (0.62 + 0.16 * Math.sqrt(s.tot)), 2.2, 11); }
  function slShape(x, y, s, k) {
    g.beginPath();
    if (k === 2) { g.moveTo(x, y - s * 1.25); g.lineTo(x + s * 1.25, y); g.lineTo(x, y + s * 1.25); g.lineTo(x - s * 1.25, y); g.closePath(); }
    else if (k === 4) { g.moveTo(x, y - s * 1.3); g.lineTo(x + s * 1.15, y + s * 0.8); g.lineTo(x - s * 1.15, y + s * 0.8); g.closePath(); }
    else if (k === 3) { g.arc(x, y, s * 1.15, 0, TAU); }
    else if (k === 1) { g.rect(x - s, y - s, 2 * s, 2 * s); }
    else if (k === 5) { const w = s * 0.42; g.rect(x - s * 1.2, y - w, s * 2.4, 2 * w); g.rect(x - w, y - s * 1.2, 2 * w, s * 2.4); }
    else { for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; g.moveTo(x, y); g.lineTo(x + Math.cos(a) * s * 1.3, y + Math.sin(a) * s * 1.3); } }
  }
  function drawSL(K, ox, oy, fade) {
    if (!SL.ready || st.thP > 0) return;
    slStep();
    const hs = st.hover && st.hover.type === 'sl' ? st.hover.s : null, F = slFocus();
    if (slDim > 0.01) { g.globalAlpha = 0.9 * slDim; g.fillStyle = INK; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
    SL.list.forEach(s => {
      if (s.x == null || !SL.kinds.has(s.k)) return;
      if (s.k === 0) { if (slDim < 0.02) return; const x = ox + s.cx * K, y = oy + s.cy * K; if (x < -10 || y < -10 || x > W + 10 || y > H + 10) return;
        g.globalAlpha = fade * slDim * yrA(s.yr) * 0.9; g.fillStyle = '#EFE9D8'; g.beginPath(); g.arc(x, y, slSize(s) * 0.8, 0, TAU); g.fill(); return; }
      const x = ox + s.cx * K, y = oy + s.cy * K; if (x < -10 || y < -10 || x > W + 10 || y > H + 10) return;
      const sz = slSize(s), a = yrA(s.yr) * (st.era && s.era && s.era !== st.era ? 0.15 : 1) * (st.sel || st.subj ? (F && F.has(s) ? 1 : 0.25) : 1) * (st.slCalm && s !== hs && s !== st.slSel ? 0.3 : 1);
      g.globalAlpha = fade * a * (s === hs ? 1 : 0.85);
      const c = SLK_HEX[s.k];
      if (s.k === 6) { g.strokeStyle = c; g.lineWidth = 1.4; slShape(x, y, sz, s.k); g.stroke(); }
      else if (s.k === 1 || s.k === 3) { g.strokeStyle = c; g.lineWidth = 1.5; slShape(x, y, sz, s.k); g.stroke(); }
      else { g.fillStyle = c; g.strokeStyle = INK; g.lineWidth = 1; slShape(x, y, sz, s.k); g.fill(); g.stroke(); }
    });
    if (slDim > 0.01) slFrame(K, ox, oy, fade);
    if (F) slRays(st.subj.sl, K, ox, oy, fade);      // a subject page: its subject and its nearest, always drawn
    if (HERO && st.slSel && st.slSel !== hs) slRays(st.slSel, K, ox, oy, fade);   // the Subjects page's selected subject
    if (hs && (!F || hs !== st.subj.sl)) slRays(hs, K, ox, oy, fade);
    // the scrubber's edge: the ring of the year it stands on
    if (st.yrT < 0.999 && st.slMode !== 1) {
      const t = st.yrT * 10, c = Math.min(10, Math.floor(t) + 1), f = t - (c - 1), r = (ringIn[c] + (ringOut[c] - ringIn[c]) * f) * K;
      g.globalAlpha = fade; g.strokeStyle = '#FF4C00'; g.lineWidth = 1.6; g.beginPath(); g.arc(ox, oy, r, 0, TAU); g.stroke();
    }
    g.globalAlpha = 1;
  }
  // 9 Oct 2026 (option A): on a subject's own page the map holds that subject and its six nearest lit
  function slFocus() { const q = SLON && st.subj && st.subj.sl; if (!q) return null; if (!q.F) q.F = new Set([q].concat(q.nb.map(k => SL.by.get(k)).filter(Boolean))); return q.F; }
  function slRays(hs, K, ox, oy, fade) {             // a subject's lines to its nearest
    {
      const x = ox + hs.cx * K, y = oy + hs.cy * K; g.globalAlpha = fade * 0.95; g.lineCap = 'round';
      g.beginPath(); hs.nb.forEach(k => { const q = SL.by.get(k); if (!q || q.x == null) return; g.moveTo(x, y); g.lineTo(ox + q.cx * K, oy + q.cy * K); });
      g.strokeStyle = 'rgba(1,16,21,.85)'; g.lineWidth = 2.8; g.stroke(); g.strokeStyle = 'rgba(252,251,247,.85)'; g.lineWidth = 1; g.stroke();
      hs.nb.forEach(k => { const q = SL.by.get(k); if (!q || q.x == null) return; g.fillStyle = '#FCFBF7'; g.beginPath(); g.arc(ox + q.cx * K, oy + q.cy * K, 2.6, 0, TAU); g.fill(); });
      g.lineCap = 'butt'; g.strokeStyle = '#FCFBF7'; g.lineWidth = 1.2; g.beginPath(); g.arc(x, y, slSize(hs) * 2.4, 0, TAU); g.stroke();
    }
    g.globalAlpha = 1;
  }
  function hitSL(x, y, touch) {
    const F = slFocus();
    if (!SL.ready || st.sel || (st.subj && !F)) return null;
    const K = V.K, ox = V.ox, oy = V.oy; let best = null, bd = Infinity;
    SL.list.forEach(s => {
      if (F && !F.has(s)) return;
      if ((s.k === 0 && slDim < 0.5) || s.x == null || !SL.kinds.has(s.k) || yrA(s.yr) < 1) return;
      const rr = slSize(s) * 1.3 + (touch ? 8 : 3), dx = ox + s.cx * K - x, dy = oy + s.cy * K - y, d2 = dx * dx + dy * dy;
      // nearest to the pointer; within a pixel of each other, a person first, then the more mentioned
      if (d2 < rr * rr && (d2 < bd - 1 || (d2 <= bd + 1 && best && ((s.k === 0) - (best.k === 0) || s.tot - best.tot) > 0))) { bd = Math.min(bd, d2); best = s; }
    });
    return best ? { type: 'sl', s: best, d2: bd } : null;
  }
  function slTip(s) {
    // the first nk neighbours share pages with s; any after them are the embedding's, shown as related by meaning
    const nb = [], mb = [], w = s.W && s.W.w[0];
    s.nb.slice(0, 4).forEach((k, i) => { const q = SL.by.get(k); if (q) (i < s.nk ? nb : mb).push(esc(q.n)); });
    const counts = [s.e ? `${fmt(s.e)} ${s.e === 1 ? 'editorial' : 'editorials'}` : '', s.p ? `${fmt(s.p)} ${s.p === 1 ? 'episode' : 'episodes'}` : '', s.t ? `${fmt(s.t)} Timeline ${s.t === 1 ? 'moment' : 'moments'}` : ''].filter(Boolean).join(' &middot; ');
    return `<p class="t-k"><i style="background:${SLK_HEX[s.k]}"></i><span class="lab">${SLK_ONE[s.k]}${s.yr != null ? ' &middot; ' + yrLab(s.yr) : ''}</span></p><p class="t-n">${esc(s.n)}</p>
      <p class="t-m">${counts}</p>${nb.length ? `<p class="t-m">Nearest: ${nb.join(', ')}</p>` : ''}${mb.length ? `<p class="t-m">Related by meaning: ${mb.join(', ')}</p>` : ''}
      ${w ? slWhy(s) : ''}<p class="t-a">${s.k === 0 ? 'Click for their constellation' : 'Click to open it on the map'}</p>`;
  }
  function slWhy(s) {
    const w = s.W && (s.W.w.find(x => x[1]) || s.W.w[0]), wq = w && SL.by.get(w[0]); if (!w) return '';
    // (.t-w: one line only; the card may be redrawn while the sentence loads, which used to stack it)
    if (!w[1]) return `<p class="t-m t-w"><span class="lab">Both in</span> ${esc(w[2])}${wq ? ' &middot; with ' + esc(wq.n) : ''}</p>`;
    return `<p class="t-m t-why t-w">&ldquo;${esc(w[1])}&rdquo;<br><span class="lab">${esc(w[2])}${wq ? ' &middot; with ' + esc(wq.n) : ''}</span></p>`;
  }
  function enterSL(s) {
    if (st.slMode) slMode(0);
    if (s.person) { select(s.person); return; }
    shard('subj', s.slug).then(sh => { const d = sh[s.slug]; if (d) { d.slug = s.slug; enterSubject(d); } });
  }
  // three arrangements of the same marks: Time (the chart), Meaning (test lab's EmbeddingGemma map), Kind (a wedge per
  // kind, each subject at the ring of the year it enters history). Marks glide between them; the chart dims behind.
  st.slMode = 0; st.slPath = null; let slDim = 0, slMoving = false;
  const yrR = y => {
    if (y == null) return ringOut[10] * 0.98;
    y = clamp(y, YB[0], YB[10]); let c = 1; while (c < 10 && y > YB[c]) c++;
    const f = (y - YB[c - 1]) / (YB[c] - YB[c - 1] || 1); return ringIn[c] + (ringOut[c] - ringIn[c]) * clamp(f, 0.04, 0.96);
  };
  const KW = [0, 2, 1, 4, 3, 6, 5];                    // wedge order around the disc
  function slArrange(regions) {
    const R = ringOut[10] * 0.86, hs = k => { let h = 7; for (let i = 0; i < k.length; i++) h = (h * 33 + k.charCodeAt(i)) >>> 0; return (h % 10007) / 10007; };
    SL.list.forEach(s => {
      s.mx = (s.ux || 0) * R; s.my = -(s.uy || 0) * R;
      if (s.x == null) { s.x = s.mx; s.y = s.my; s.ctx = true; }
      const w = TAU / 7, a = -Math.PI / 2 + KW.indexOf(s.k) * w + (hs(s.slug) - 0.5) * w * 0.82, r = yrR(s.yr) + (hs(s.slug + '.') - 0.5) * 0.01;
      s.kx = Math.sin(a + Math.PI / 2) * r; s.ky = -Math.cos(a + Math.PI / 2) * r;
      s.cx = s.x; s.cy = s.y;
    });
    SL.regions = regions.map(r => ({ n: r[0], x: (r[1] || 0) * R, y: -(r[2] || 0) * R, c: r[4] }));
    SL.rank = SL.list.slice().sort((a, b) => b.tot - a.tot);
    // the path graph: two subjects are joined only by real shared pages (editorials, episodes, moments naming both)
    // carrying a sentence that names both or real weight (build_paths.py, build_ship.py)
    SL.adj = new Map(); const add = (a, b, sc) => { if (!SL.adj.has(a)) SL.adj.set(a, new Map()); if (!SL.adj.get(a).has(b)) SL.adj.get(a).set(b, sc); };
    SL.list.forEach(a => a.ti.forEach(([i, sc]) => { const b = SL.list[i]; if (b) { add(a, b, sc / 100); add(b, a, sc / 100); } }));
  }
  function slStep() {
    const m = st.slMode, f = RM ? 1 : 0.13; let mv = false;
    SL.list.forEach(s => {
      const tx = m === 1 ? s.mx : m === 2 ? s.kx : s.x, ty = m === 1 ? s.my : m === 2 ? s.ky : s.y;
      if (Math.abs(s.cx - tx) + Math.abs(s.cy - ty) > 0.0004) { s.cx += (tx - s.cx) * f; s.cy += (ty - s.cy) * f; mv = true; } else { s.cx = tx; s.cy = ty; }
    });
    const dt = m ? 1 : 0; if (Math.abs(slDim - dt) > 0.01) { slDim += (dt - slDim) * f; mv = true; } else slDim = dt;
    slMoving = mv;
  }
  function slFrame(K, ox, oy, fade) {
    g.save(); g.globalAlpha = fade * slDim; g.textAlign = 'center'; g.textBaseline = 'middle';
    if (st.slMode === 1) {
      g.font = '500 10px "Rules", "Helvetica Neue", sans-serif'; g.fillStyle = 'rgba(239,233,216,.62)';
      g.strokeStyle = 'rgba(1,16,21,.9)'; g.lineWidth = 3; g.lineJoin = 'round';
      const rb = SL.rbox = [];                                   // regions too close to name both: the bigger keeps its name
      SL.regions.slice().sort((a, b) => (b.c || 0) - (a.c || 0)).forEach(r => {
        const t = r.n.toUpperCase().split('').join(String.fromCharCode(8202)), w = g.measureText(t).width, x = ox + r.x * K, y = oy + r.y * K, bx = [x - w / 2 - 6, y - 9, x + w / 2 + 6, y + 9];
        if (rb.some(o => bx[0] < o[2] && bx[2] > o[0] && bx[1] < o[3] && bx[3] > o[1])) return; rb.push(bx);
        g.strokeText(t, x, y); g.fillText(t, x, y); });
    } else if (st.slMode === 2) {
      const R = ringOut[10] * K; g.strokeStyle = 'rgba(239,233,216,.14)'; g.lineWidth = 1;
      [1, 4, 6, 8, 10].forEach(c => { g.beginPath(); g.arc(ox, oy, ringOut[c] * K, 0, TAU); g.stroke(); });
      for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 0.5) * TAU / 7; g.beginPath(); g.moveTo(ox + Math.cos(a) * ringIn[1] * K, oy + Math.sin(a) * ringIn[1] * K); g.lineTo(ox + Math.cos(a) * R, oy + Math.sin(a) * R); g.stroke(); }
      g.font = '500 10px "Rules", "Helvetica Neue", sans-serif';
      KW.forEach((k, i) => { const a = -Math.PI / 2 + i * TAU / 7; g.fillStyle = SLK_HEX[k] || '#EFE9D8'; g.fillText(SLK_NAME[k].toUpperCase(), ox + Math.cos(a) * (R + 16), oy + Math.sin(a) * (R + 16)); });
      g.fillStyle = 'rgba(239,233,216,.5)'; g.font = '400 9px "Rules", "Helvetica Neue", sans-serif';
      [[1, '1850'], [4, '1970'], [6, '1990'], [8, '2010'], [10, '2025']].forEach(([c, t]) => g.fillText(t, ox + 4, oy - ringOut[c] * K - 6));
    }
    g.restore();
  }
  // semantic zoom: the closer you look, the more subjects carry their names (the most-mentioned first)
  function slLabels(K, ox, oy, fade) {
    if (st.slCalm && st.slMode === 0 && cam.k < 1.6) return;
    const n = clamp(Math.round((st.slMode ? 22 : 9) * Math.pow(cam.k, 1.7)), 6, 220), boxes = st.slMode === 1 && SL.rbox ? SL.rbox.slice() : [], pathSet = new Set(st.slPath || []);
    let shown = 0; g.save(); g.font = 'italic 13px "EB Garamond", Georgia, serif'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    for (const s of SL.rank) {
      if (shown >= n) break;
      if (s.x == null || !SL.kinds.has(s.k) || yrA(s.yr) < 1 || pathSet.has(s)) continue;
      if (s.k === 0 && (slDim < 0.5 || st.slMode === 0)) continue;
      const x = ox + s.cx * K + slSize(s) + 4, y = oy + s.cy * K; if (x < 0 || y < 8 || x > W - 40 || y > H - 8) continue;
      const w = g.measureText(s.n).width, b = [x - 2, y - 8, x + w + 2, y + 8];
      if (boxes.some(o => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1])) continue;
      boxes.push(b); shown++;
      g.globalAlpha = fade * (st.sel || st.subj ? 0.3 : 0.92); g.strokeStyle = 'rgba(1,16,21,.9)'; g.lineWidth = 3; g.strokeText(s.n, x, y);
      g.fillStyle = s.k ? SLK_HEX[s.k] : '#EFE9D8'; g.fillText(s.n, x, y);
    }
    g.restore();
  }
  // a path between two subjects, stepping only where one sentence in the archive names both
  function slFindPath(a, b) {
    // at most four steps; never through a place or a byline; busy hubs and thin ties cost more
    if (!a || !b || a === b) return null;
    const dist = new Map([[a, 0]]), prev = new Map([[a, null]]), hops = new Map([[a, 0]]), open = [a], done = new Set();
    while (open.length) {
      let bi = 0; for (let i = 1; i < open.length; i++) if (dist.get(open[i]) < dist.get(open[bi])) bi = i;
      const s = open.splice(bi, 1)[0]; if (s === b) break; if (done.has(s)) continue; done.add(s);
      if (hops.get(s) >= 4) continue; const nb = SL.adj.get(s); if (!nb) continue;
      nb.forEach((sc, t) => {
        if (t !== b && (t.k === 4 || t.slug === 'peter-bauman' || (t.k === 6 && t.tot > 60))) return;
        const c = dist.get(s) + 1 + (1 - sc) * 2 + 0.25 * Math.log2((SL.adj.get(t) || new Map()).size || 1);
        if (c < (dist.has(t) ? dist.get(t) : Infinity)) { dist.set(t, c); prev.set(t, s); hops.set(t, hops.get(s) + 1); open.push(t); }
      });
    }
    if (!prev.has(b)) return [];
    const out = []; for (let s = b; s; s = prev.get(s)) out.unshift(s); return out;
  }
  function slPathDraw(K, ox, oy, fade) {
    const P2 = st.slPath; if (!P2 || P2.length < 2) return;
    g.save(); g.globalAlpha = fade; g.lineCap = g.lineJoin = 'round';
    g.beginPath(); P2.forEach((s, i) => { const x = ox + s.cx * K, y = oy + s.cy * K; if (i) g.lineTo(x, y); else g.moveTo(x, y); });
    g.strokeStyle = 'rgba(1,16,21,.9)'; g.lineWidth = 5; g.stroke(); g.strokeStyle = '#FF4C00'; g.lineWidth = 2.2; g.stroke();
    g.font = '500 13px "EB Garamond", Georgia, serif'; g.textBaseline = 'middle';
    P2.forEach((s, i) => { const x = ox + s.cx * K, y = oy + s.cy * K;
      g.fillStyle = '#FF4C00'; g.strokeStyle = INK; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, i === 0 || i === P2.length - 1 ? 6 : 4.5, 0, TAU); g.fill(); g.stroke();
      const t = (i + 1) + '  ' + s.n; g.strokeStyle = 'rgba(1,16,21,.92)'; g.lineWidth = 3.5; g.strokeText(t, x + 9, y); g.fillStyle = '#FCFBF7'; g.fillText(t, x + 9, y); });
    g.restore();
  }
  function slMode(m) {
    if (m) slWake();
    st.slMode = m; $$('#sl-mode [data-slm]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.slm === m)));
    root.classList.toggle('sl-arranged', m !== 0); slMoving = true; kick();
  }
  // kind filters and the time scrubber on the chart
  function slTools() {
    const tools = $('#pp-tools'); if (!tools || $('#sl-kinds')) return;
    const d = document.createElement('div'); d.id = 'sl-kinds'; d.className = 'pp-src sl-kinds'; d.setAttribute('role', 'group'); d.setAttribute('aria-label', 'Kinds of subject');
    d.innerHTML = SLK_NAME.map((n, k) => `<button class="pp-chip" type="button" data-slk="${k}" aria-pressed="true"><i class="k${k}" style="--c:${k ? SLK_HEX[k] : '#EFE9D8'}"></i>${n}</button>`).join('');
    tools.appendChild(d);
    const md = document.createElement('div'); md.id = 'sl-mode'; md.className = 'pp-src sl-mode'; md.setAttribute('role', 'group'); md.setAttribute('aria-label', 'Arrange by');
    md.innerHTML = '<span class="lab">Arrange by</span>' + ['Time', 'Meaning', 'Kind'].map((n, i) => `<button class="pp-chip" type="button" data-slm="${i}" aria-pressed="${i === 0}">${n}</button>`).join('');
    tools.insertBefore(md, d);
    md.addEventListener('click', e => { const b = e.target.closest('[data-slm]'); if (b) slMode(+b.dataset.slm); });
    scroller.addEventListener('submit', e => { if (!e.target.closest('.sl-pathf')) return; e.preventDefault();
      const f = e.target, by = n => SL.list.find(q => q.n.toLowerCase() === String(n).trim().toLowerCase());
      st.slPathQ = [f.a.value, f.b.value]; const a = by(f.a.value), b = by(f.b.value); st.slPath = a && b ? slFindPath(a, b) : [];
      Promise.all((st.slPath || []).map(x => x.W ? 0 : slW(x.slug).then(w => { x.W = w; }))).then(() => { renderIndex(); kick(); }); });
    scroller.addEventListener('click', e => {
      const t = e.target.closest('[data-sltab]');
      if (t && slSplit()) { const k = +t.dataset.sltab; if (SL.kinds.has(k)) SL.kinds.delete(k); else SL.kinds.add(k); st.slOff = 0; slKindsSync(); slWake(); kick(); slEmit('kinds', Array.from(SL.kinds)); renderIndex(); return; }
      if (t) { st.slTab = +t.dataset.sltab; st.slLetter = ''; st.slOff = 0; renderIndex(); return; }
      // a letter opens A-Z on the page where that letter starts
      const z = e.target.closest('[data-slaz]'); if (z) { st.slSort = 'az'; st.slLetter = z.dataset.slaz; renderIndex(); return; }
      const so = e.target.closest('[data-slsort]'); if (so) { st.slSort = so.dataset.slsort; st.slOff = 0; renderIndex(); return; }
      if (e.target.closest('[data-slshuf]')) { if (slSplit()) st.slKeys = slSplitKeys(); else st.slDeal[st.slTab] = slDeal(st.slTab); renderIndex(); return; }
      const pg = e.target.closest('[data-slpg]'); if (pg) { st.slOff = Math.max(0, st.slOff + +pg.dataset.slpg * SL_ROWS); renderIndex(); return; }
      const a = e.target.closest('[data-sl]'); if (!a) return; const q = SL.by.get(a.dataset.sl); if (!q) return;
      e.preventDefault(); if (q.k === 0 && q.person) select(q.person); else enterSL(q);
    });
    // 9 Oct 2026: in the split view a name in the index flies the map to it (a second click opens its page, ⌘/Ctrl-click
    // a new tab). Caught at the window's capture phase, ahead of the embed's link bridge, which opens every site link.
    addEventListener('click', e => {
      if (!slSplit() || e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest && e.target.closest('.sl-list a[data-sl]'); if (!a || !scroller.contains(a)) return;
      const q = SL.by.get(a.dataset.sl); if (!q) return;
      e.preventDefault(); e.stopPropagation();
      if (st.slSel === q) slOpen(q.slug); else slFly(q);
    }, true);
    // 8 Oct 2026 (Peter): a name in the list lights its subject on the map exactly as hovering its mark does (its
    // neighbours, its ties, the card). A mark out of view is eased in and back on leaving (not with reduced motion).
    // Leaving waits 150 ms so running down the list does not flicker; a touch is a tap, never a hover.
    // (pages with the older head keep the earlier behaviour: a quiet highlight of non-person marks, no card)
    scroller.addEventListener('pointerover', e => { if (e.pointerType === 'touch') return; const a = e.target.closest('[data-sl]');
      if (!window.LR_SL_CALM) { const q = a && SL.by.get(a.dataset.sl), h = q && q.k && q.x != null ? { type: 'sl', s: q } : null; if ((st.hover && st.hover.s) !== (h && h.s)) { st.hover = h; kick(); } return; }
      if (a) slListHover(a.dataset.sl); else slListLeave(); });
    scroller.addEventListener('pointerleave', e => { if (e.pointerType !== 'touch') slListLeave(); });
    scroller.addEventListener('focusin', e => { const a = e.target.closest('[data-sl]'); if (a) slListHover(a.dataset.sl); });
    scroller.addEventListener('focusout', () => slListLeave());
    const sc = document.createElement('div'); sc.id = 'sl-time'; sc.className = 'sl-time';
    sc.innerHTML = `<span class="lab">In history by</span><input id="sl-yr" type="range" min="0" max="1000" value="1000" aria-label="Show subjects as they enter history"><b id="sl-yl">2025</b>`;
    stage.appendChild(sc);
    $('#sl-yr').addEventListener('input', e => { st.yrT = +e.target.value / 1000; $('#sl-yl').textContent = yrLab(yrOf(st.yrT)); slWake(); slWindowFor(st.yrT); kick(); slEmit('year', st.yrT >= 0.999 ? null : Math.round(yrOf(st.yrT)));
      if (slSplit() && !st.sel && !st.subj) { cancelAnimationFrame(st.slIxRaf); st.slIxRaf = requestAnimationFrame(renderIndex); } });
    d.addEventListener('click', e => { const b = e.target.closest('[data-slk]'); if (!b) return; const k = +b.dataset.slk;
      if (SL.kinds.has(k)) SL.kinds.delete(k); else SL.kinds.add(k); b.setAttribute('aria-pressed', String(SL.kinds.has(k))); slWake(); kick(); slEmit('kinds', Array.from(SL.kinds)); });
  }
  function slPathHTML() {
    const q = st.slPathQ || ['', ''], P2 = st.slPath;
    let res = '';
    if (P2 && !P2.length) res = '<p class="sl-pnone">No short path through shared pages.</p>';
    else if (P2) res = '<ol class="sl-psteps">' + P2.map((s, i) => {
      const q = i ? P2[i - 1] : null, e = q && ((q.W && q.W.t[s.slug]) || (s.W && s.W.t[q.slug]));
      return `${e ? `<li class="sl-pwhy">${e[1] ? `&ldquo;${esc(e[1])}&rdquo; <span class="lab">${esc(e[2])}</span>` : `<span class="lab">Both in</span> ${esc(e[2])}`}</li>` : ''}<li class="sl-pnode"><a href="${LRWEB}/subjects/${esc(s.slug)}" data-sl="${esc(s.slug)}">${esc(s.n)}</a> <span class="lab">${SLK_ONE[s.k]}</span></li>`;
    }).join('') + '</ol>';
    return `<form class="sl-pathf" autocomplete="off"><p class="lab">Path between two subjects</p>
      <div class="sl-pin"><input name="a" list="sl-names" value="${esc(q[0])}" aria-label="From"><span aria-hidden="true">&rarr;</span><input name="b" list="sl-names" value="${esc(q[1])}" aria-label="To"><button class="pv-chip" type="submit">Find</button></div>
      <datalist id="sl-names">${SL.rank.slice(0, 1200).map(s => `<option value="${esc(s.n)}">`).join('')}</datalist>${res}</form>`;
  }
  // the panel at rest: the Subjects index, by kind. 8 Oct 2026 (Peter): it opens on a random deal, not the most mentioned:
  // weighted sampling without replacement (Efraimidis-Spirakis, key = u^(1/w), the top 40), w = mentions^A with A set per
  // kind by build_ship.py so the most-mentioned lands about 90% of the time. Shuffle deals again; A-Z lists every one.
  // The host is in the counts and A-Z, never in the deal.
  st.slTab = Math.max(0, Math.min(6, +window.LR_SL_TAB || 0)); st.slSort = window.LR_SL_SORT === 'az' ? 'az' : 'rand'; st.slOff = 0; st.slDeal = {};
  // the page's #people / #works … (&sort=az) opens the index on that kind and order (subjects-index.js, on load and on change)
  window.LR_SL_TAB_SET = (k, sort) => { st.slTab = k; st.slLetter = ''; st.slOff = 0; if (sort) st.slSort = sort === 'az' ? 'az' : 'rand'; if (SL.ready && !st.sel && !st.subj) renderIndex(); };
  const SL_ROWS = 40;
  function slDeal(k) {
    const A = slA(k);
    return SL.list.filter(s => s.k === k && s.slug !== 'peter-bauman').map(s => [Math.log(Math.random()) / Math.pow(slW8(s), A), s])
      .sort((a, b) => b[0] - a[0]).slice(0, SL_ROWS).map(x => x[1]);
  }
  // the page keeps the kind and order in its address (#works&sort=az), so a shared link opens the same list
  function slState() { if (HERO) return; try { if (window.parent !== window && window.parent.__lrSlState) window.parent.__lrSlState(st.slTab, st.slSort); } catch (e) {} }
  // split view: the index follows the map's kinds and year; Random = one stable key per subject, log(u) / mentions^a (the
  // per-kind exponent), so the most written-about are much more likely near the top; a filter change keeps the order
  function slSplitPool() { const Y = st.yrT >= 0.999 ? null : yrOf(st.yrT); return SL.list.filter(s => SL.kinds.has(s.k) && s.slug !== 'peter-bauman' && (Y == null || s.yr == null || s.yr <= Y)); }
  function slSplitKeys() { const K = new Map(); SL.list.forEach(s => K.set(s.slug, Math.log(Math.random()) / Math.pow(slW8(s), slA(s.k)))); return K; }
  // 9 Oct 2026 (Peter): a Random list weighs each subject by the count its row shows (every time Le Random names it:
  // editorials, episodes and Timeline moments), at one steepness for every list ("w" in the data: about 7/10 of the first
  // 20 rows from the 150 most-named subjects)
  function slW8(s) { return Math.max(s.tot || 0, 1); }
  function slA(k) { return (SL.da && (SL.da.w || SL.da[k])) || 1.2; }
  function renderIndex() {
    if (!SL.ready) { scroller.innerHTML = '<div class="pv pv-over"><p class="lab pv-kicker">Subjects</p><h1 class="pv-title">Subjects</h1></div>'; return; }
    const cnt = k => SL.list.filter(s => s.k === k).length, SPL = slSplit();
    const order = [0, 2, 1, 4, 3, 6, 5], fold = n => norm(n).replace(/^(the|a|an) /, ''), L0 = n => { const c = fold(n).charAt(0); return /[a-z]/.test(c) ? c.toUpperCase() : '#'; };
    const az = (SPL ? slSplitPool() : SL.list.filter(s => s.k === st.slTab)).sort((a, b) => fold(a.n).localeCompare(fold(b.n)) || a.n.localeCompare(b.n)), letters = new Set(az.map(s => L0(s.n)));
    // A-Z pages 40 at a time from st.slOff; a letter starts the page at its first name
    if (st.slSort === 'az' && st.slLetter) { const i = az.findIndex(s => L0(s.n) === st.slLetter); if (i >= 0) st.slOff = i; st.slLetter = ''; }
    st.slOff = Math.max(0, Math.min(Math.max(0, az.length - 1), st.slOff));
    if (SPL && !st.slKeys) st.slKeys = slSplitKeys();
    const rows = st.slSort === 'az' ? az.slice(st.slOff, st.slOff + SL_ROWS) : SPL ? az.slice().sort((a, b) => st.slKeys.get(b.slug) - st.slKeys.get(a.slug)).slice(0, SL_ROWS)
      : (st.slDeal[st.slTab] || (st.slDeal[st.slTab] = slDeal(st.slTab)));
    const from = st.slOff + 1, to = Math.min(az.length, from + SL_ROWS - 1), name = SLK_NAME[st.slTab].toLowerCase();
    slState();
    scroller.innerHTML = `<div class="pv pv-over sl-index">
      <div class="pv-bar sl-bar"><span class="pv-ib sl-all">&#10035; All subjects</span><span class="lab sl-nof">${fmt(SL.list.length)} subjects</span></div>
      <p class="lab pv-kicker"><span class="dot"></span>Le Random subject archive</p>
      <h1 class="pv-title">Subjects</h1>
      ${slPathHTML()}
      <div class="pv-chips sl-tabs">${order.map(k => `<button class="pv-chip" type="button" data-sltab="${k}" aria-pressed="${SPL ? SL.kinds.has(k) : st.slTab === k}">${SLK_NAME[k]} <small>${fmt(cnt(k))}</small></button>`).join('')}</div>
      <div class="sl-sort" role="group" aria-label="Order"><button type="button" data-slsort="rand" aria-pressed="${st.slSort === 'rand'}">Random</button><button type="button" data-slsort="az" aria-pressed="${st.slSort === 'az'}">A&ndash;Z</button>${st.slSort === 'rand' ? '<button type="button" class="sl-shuf" data-slshuf>Shuffle</button>' : `<span class="lab sl-pos">${fmt(from)}&ndash;${fmt(to)} of ${fmt(az.length)}</span>`}</div>
      ${SPL && st.slSort !== 'az' ? '' : `<div class="sl-az" role="group" aria-label="By letter">`}${SPL && st.slSort !== 'az' ? '' : `${'#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(c => `<button type="button" data-slaz="${c}"${letters.has(c) ? '' : ' disabled'}>${c}</button>`).join('')}</div>`}
      <ol class="sl-list">${rows.map(s => `<li><a href="${LRWEB}/subjects/${esc(s.slug)}" data-sl="${esc(s.slug)}"><span class="nm">${esc(s.n)}</span><span class="dots"></span><span class="c">${s.tot || ''}</span></a></li>`).join('')}</ol>
      ${st.slSort === 'az' ? (az.length > SL_ROWS ? `<p class="sl-more sl-pager"><button type="button" data-slpg="-1"${st.slOff ? '' : ' disabled'}>&larr; Previous</button><button type="button" data-slpg="1"${st.slOff + SL_ROWS < az.length ? '' : ' disabled'}>Next &rarr;</button></p>` : '')
        : `<p class="sl-more"><button type="button" data-slsort="az">All ${fmt(SPL ? az.length : cnt(st.slTab))} ${SPL ? 'subjects' : name} A&ndash;Z &rarr;</button></p>`}
    </div>`;
    scroller.scrollTop = 0;
    if (SPL) { const tb = $('.sl-tabs', scroller); if (tb) tb.classList.toggle('is-over', tb.scrollWidth > tb.clientWidth + 1); }
  }

  function start() {
    window.LR_SUBJECT = def => enterSubject(def);
    loadDocs(); if (SLON) { root.classList.add('sl-on'); if (window.LR_SL_FOCUS) root.classList.add('sl-focus'); if (HERO) { root.classList.add('sl-hero'); qIn.placeholder = 'Find a subject'; qIn.setAttribute('aria-label', 'Find a subject'); } loadSL(); slTools(); }
    window.LR_SELECT = tok => { const p = PT.get(tok); if (p && p !== st.sel) select(p, { fromHash: true }); };
    root.classList.remove('is-loading');
    const mm = $('[data-n="mm"]', keyEl); if (mm) mm.textContent = fmt(IX.length);
    const wr = $('[data-n="w"]', keyEl); if (wr) wr.textContent = fmt(P.filter(p => !p.g && p.wt).length);
    ['f', 'm', 'u'].forEach(k => { const el = $(`[data-n="${k}"]`, keyEl); if (el) el.textContent = fmt(k === 'u' ? P.filter(p => !p.g).length : P.filter(p => p.g === k).length); });
    const tools = $('#pp-tools');
    if (tools && !$('#pp-src')) { const d = document.createElement('div'); d.id = 'pp-src'; d.className = 'pp-src'; d.setAttribute('role', 'group'); d.setAttribute('aria-label', 'Where they are named');
      d.innerHTML = [['m', 'Timeline'], ['a', 'Editorials'], ['p', 'Podcast']].map(x => `<button class="pp-chip" type="button" data-src="${x[0]}" aria-pressed="false">${x[1]}</button>`).join(''); tools.appendChild(d); measureUI(); }
    // 8 Oct 2026: the Subjects index opens on its calm frame at once (no assembly from the pupil), so the page's poster,
    // made from that same frame, hands over without a visible change (__people.replay() still plays the assembly)
    st.started = true; st.introT0 = SLON && window.LR_SL_CALM ? now() - 1e6 : now();
    // the window opens on a chapter's own machine, chosen by chance, unless a person is asked for
    const c = SLON ? 10 : 1 + Math.floor(Math.random() * 10), sc = SC_BY.get(CH[c - 1].scene), m0 = (sc && BY.get(sc.home)) || IX[0];   // the index opens on the scrubber's year (2025)
    const tok = S.params.token || S.params.slug || '';
    const asked = PT.get(tok); curTok = asked || tok === 'women' ? tok : null;
    if (!asked) { win = { m: m0, sc: sceneFor(m0) }; setGround(m0, win.sc); if (tok && tok !== 'women') showMissing(tok); else renderOverview(); }
    if (tok === 'women') setLens(true);
    if (asked) { select(asked, { fromHash: true }); } else if (window.LR_SUBJ) { enterSubject(window.LR_SUBJ); }
    else showScene(m0);
    kick();
    warmText();
  }
  // the chapter texts (editorials, episodes, subjects of a person's moments) are parsed ahead, one chapter per idle
  // moment once the chart and its scene have settled, so the first person someone picks opens without a hitch
  function warmText() {
    if (window.LR_EMBED) return;
    const idle = window.requestIdleCallback || (f => setTimeout(() => f({ timeRemaining: () => 8 }), 60));
    let c = 0;
    const next = () => { if (++c > 10) return; S.data.text(c).then(() => idle(next, { timeout: 2500 }), () => idle(next, { timeout: 2500 })); };
    setTimeout(() => idle(next, { timeout: 3000 }), RM ? 400 : 4200);
  }
})();
