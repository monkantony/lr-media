/* Le Random calendar map (5 Oct 2026, Peter: "the calendar in general could have a map view").
   One self-contained module for the calendar on the editorials homepage (the Webflow build places it):
     LRCalMap.mount(el, { calendar: 'calendar.json', venues: 'venues.json', land: 'land-50m.json', countries: 'countries-50m.json' })
   Needs d3 (geo + zoom) and topojson-client. The calendar's shows and events that are on view now or still to come are
   drawn as dots, one per city at world scale, sized by how many shows it has; a click on a city zooms to its venues and
   lists its shows beside the map. Venues come from venues.json (geocode.py: each "Venue, City" looked up once). */
(function () {
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const title = s => esc(s).replace(/&lt;(\/?)i&gt;/g, '<$1i>');
  const day = iso => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${MON[m - 1]}${y !== new Date().getFullYear() ? ' ' + y : ''}`; };
  const get = x => (typeof x === 'string' ? fetch(x).then(r => r.json()) : Promise.resolve(x));

  // mount(el, opt) -> { destroy() }. Safe to call again on the same element: the earlier map is destroyed first.
  // Sizes come from the container whenever it has one (a map mounted while hidden fits itself when it is shown).
  function mount(root, opt) {
    if (root.__lrcm) root.__lrcm.destroy();
    let alive = true, ro = null, svgSel = null;
    const onClick = e => clickHandler && clickHandler(e);
    let clickHandler = null;
    const api = { destroy() {
      alive = false; if (ro) ro.disconnect(); root.removeEventListener('click', onClick);
      if (svgSel) { svgSel.interrupt(); svgSel.on('.zoom', null); }
      root.innerHTML = ''; root.classList.remove('lrcm'); delete root.dataset.state; delete root.__lrcm;
    } };
    root.__lrcm = api;
    root.addEventListener('click', onClick);
    root.classList.add('lrcm');
    root.dataset.state = 'loading';
    root.innerHTML = `<div class="lrcm-map"><svg class="lrcm-svg" role="img" aria-label="Map of the shows on the calendar"></svg>
        <div class="lrcm-tip" hidden></div>
        <div class="lrcm-ctl"><button type="button" class="lrcm-b" data-z="in" aria-label="Zoom in">+</button><button type="button" class="lrcm-b" data-z="out" aria-label="Zoom out">&minus;</button><button type="button" class="lrcm-b lrcm-world" data-z="world">World</button></div></div>
      <aside class="lrcm-side" aria-live="polite"></aside>`;
    const svgEl = root.querySelector('svg'), side = root.querySelector('.lrcm-side'), tip = root.querySelector('.lrcm-tip');
    Promise.all([get(opt.calendar), get(opt.venues), get(opt.land), get(opt.countries)]).then(([cal, ven, land, countries]) => {
      if (!alive) return;
      const today = new Date().toISOString().slice(0, 10);
      // a show the calendar gives no end date counts as on view for 60 days after it opens (NODE's, from 19 Sep)
      const endOf = i => i.e || (i.k === 'exhibition' ? new Date(Date.parse(i.s) + 60 * 864e5).toISOString().slice(0, 10) : i.s);
      const shows = (cal.items || []).filter(i => (i.k === 'exhibition' || i.k === 'event') && i.p && ven[i.p] && ven[i.p].lat != null && endOf(i) >= today)
        .map(i => Object.assign({}, i, { now: i.s <= today, at: ven[i.p] }));
      // venues (one dot each when zoomed in) and cities (one dot each at world scale)
      const vmap = new Map(), cmap = new Map();
      shows.forEach(i => {
        const v = i.at, vk = v.lat.toFixed(4) + ',' + v.lon.toFixed(4);
        if (!vmap.has(vk)) vmap.set(vk, { lat: v.lat, lon: v.lon, name: v.venue || v.city, city: v.city, shows: [] });
        vmap.get(vk).shows.push(i);
        const ck = (v.city || '').replace(/\s*\(.*\)/, '');
        if (!cmap.has(ck)) cmap.set(ck, { name: ck, venues: new Set(), shows: [] });
        cmap.get(ck).shows.push(i); cmap.get(ck).venues.add(vmap.get(vk));
      });
      const cities = Array.from(cmap.values()).map(c => {
        const vs = Array.from(c.venues), n = c.shows.length;
        return Object.assign(c, { venues: vs, lat: d3.mean(vs, v => v.lat), lon: d3.mean(vs, v => v.lon), n, now: c.shows.filter(s => s.now).length });
      }).sort((a, b) => b.n - a.n);
      const venues = Array.from(vmap.values()).sort((a, b) => b.shows.length - a.shows.length);

      const W = () => svgEl.clientWidth || 800, H = () => svgEl.clientHeight || 480;
      const proj = d3.geoNaturalEarth1(), path = d3.geoPath(proj);
      const svg = d3.select(svgEl), g = svg.append('g'); svgSel = svg;
      const landF = topojson.feature(land, land.objects.land), borders = topojson.mesh(countries, countries.objects.countries, (a, b) => a !== b);
      g.append('path').attr('class', 'lrcm-sphere').datum({ type: 'Sphere' });
      g.append('path').attr('class', 'lrcm-land').datum(landF);
      g.append('path').attr('class', 'lrcm-borders').datum(borders);
      // the city itself under its venues: water, parks, main roads (plates/<city>.json, city_plates.py, from OpenStreetMap)
      // (no soft-edged mask: a blurred mask breaks up at city zoom in Chrome; the city fills the frame instead)
      const gp = g.append('g').attr('class', 'lrcm-plate').style('opacity', 0);
      const gc = g.append('g'), gv = g.append('g');
      const credit = d3.select(root.querySelector('.lrcm-map')).append('p').attr('class', 'lrcm-credit').html('Map data &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors').style('opacity', 0);
      const plates = new Map(), drawn = new Map(), base = opt.plates || 'plates/';
      const slugOf = c => c.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const dOf = (list, close) => (list || []).map(r => r.map((p, i) => { const q = proj(p); return (i ? 'L' : 'M') + q[0].toFixed(3) + ' ' + q[1].toFixed(3); }).join('') + (close ? 'Z' : '')).join('');
      const getPlate = slug => { if (!plates.has(slug)) plates.set(slug, fetch(base + slug + '.json').then(r => (r.ok ? r.json() : null)).catch(() => null)); return plates.get(slug); };
      // a city's own plate, or the region it belongs to (plates/san-jose.json = {"ref": "bay-area"})
      const plateOf = c => getPlate(slugOf(c.name)).then(pl => (pl && pl.ref ? getPlate(pl.ref) : pl));
      function drawPlate(c) {
        return plateOf(c).then(pl => {
          if (!pl || !alive) return pl;
          const id = pl.city || c.name;
          if (!drawn.has(id)) {
            const gx = gp.append('g');
            if (pl.land && pl.land.length) {        // a coastal city: the box is sea, its land drawn on top
              gx.append('path').attr('class', 'lrcm-sea').attr('d', dOf([[[pl.bbox[0], pl.bbox[1]], [pl.bbox[2], pl.bbox[1]], [pl.bbox[2], pl.bbox[3]], [pl.bbox[0], pl.bbox[3]]]], true));
              gx.append('path').attr('class', 'lrcm-cland').attr('d', dOf(pl.land, true));
            }
            gx.append('path').attr('class', 'lrcm-park').attr('d', dOf(pl.parks, true));
            gx.append('path').attr('class', 'lrcm-water').attr('d', dOf(pl.water, true));
            if (pl.holes && pl.holes.length) gx.append('path').attr('class', 'lrcm-cland').attr('d', dOf(pl.holes, true));
            gx.append('path').attr('class', 'lrcm-river').attr('d', dOf(pl.rivers, false));
            gx.append('path').attr('class', 'lrcm-coast').attr('d', dOf(pl.coast, false));
            if (pl.buildings && pl.buildings.length) gx.append('path').attr('class', 'lrcm-bldg').attr('d', dOf(pl.buildings, true));
            gx.append('path').attr('class', 'lrcm-road').attr('d', dOf(pl.minor, false));
            gx.append('path').attr('class', 'lrcm-road lrcm-major').attr('d', dOf(pl.major, false));
            if (pl.rail && pl.rail.length) gx.append('path').attr('class', 'lrcm-rail').attr('d', dOf(pl.rail, false));
            const a = proj([pl.bbox[0], pl.bbox[3]]), b = proj([pl.bbox[2], pl.bbox[1]]);
            gx.datum({ w: Math.max(b[0] - a[0], b[1] - a[1]) }).style('opacity', 0).style('transition', 'opacity .6s');
            drawn.set(id, gx);
            root.dataset.plates = [...drawn.keys()].join(' ');
          }
          plateFade();
          return pl;
        });
      }
      // each city's map fades in as it grows to fill the frame (a small patch at a regional zoom would look like a sticker)
      function plateFade() {
        let any = 0; const fw = Math.min(W(), H());
        drawn.forEach(gx => { const f = Math.max(0, Math.min(1, (gx.datum().w * k / fw - 0.25) / 0.25)); gx.style('opacity', f); any = Math.max(any, f); });
        gp.style('opacity', 1); credit.style('opacity', any > 0.2 ? 1 : 0);
      }
      // 5 Oct 2026, Peter: "maps dont show up unless a place is clicked on from world view". Zoomed in by hand (scroll,
      // pinch, drag, + and -), the cities in or near the frame load their maps too.
      function platesInView() {
        root.dataset.zoom = Math.round(k);
        if (!alive || k < 12) return;
        const t = d3.zoomTransform(svgEl), mx = W() * 0.25, my = H() * 0.25;
        let n = 0;
        cities.forEach(c => {
          if (n >= 4) return;
          const p = proj([c.lon, c.lat]), x = t.applyX(p[0]), y = t.applyY(p[1]);
          if (x > -mx && x < W() + mx && y > -my && y < H() + my) { n++; drawPlate(c); }
        });
      }
      let k = 1, focus = null;

      function fit() {
        // the inhabited world, not Antarctica: fit from 57 S to 78 N
        proj.fitExtent([[12, 12], [W() - 12, H() - 12]], { type: 'MultiPoint', coordinates: [[-168, -56], [179.5, -56], [-168, 78], [179.5, 78], [0, -56], [0, 78], [90, 78], [-90, 78], [90, -56], [-90, -56]] });
        g.selectAll('path').attr('d', path);
        place();
      }
      const R = n => 3.2 + 2.6 * Math.sqrt(n);
      function place() {
        const cs = gc.selectAll('g.lrcm-c').data(cities, d => d.name);
        const ce = cs.enter().append('g').attr('class', 'lrcm-c').attr('tabindex', 0).attr('role', 'button')
          .attr('aria-label', d => `${d.name}: ${d.n} ${d.n === 1 ? 'show' : 'shows'}`);
        ce.append('circle'); ce.append('text');
        ce.on('click', (e, d) => openCity(d)).on('keydown', (e, d) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCity(d); } })
          .on('pointerenter', (e, d) => showTip(e, `<b>${esc(d.name)}</b><span>${d.n} ${d.n === 1 ? 'show' : 'shows'}${d.now && d.now < d.n ? `, ${d.now} on view now` : ''}</span>`)).on('pointerleave', hideTip);
        const all = ce.merge(cs);
        all.attr('transform', d => { const p = proj([d.lon, d.lat]); return `translate(${p[0]},${p[1]})`; })
          .classed('is-on', d => d === focus).style('display', d => (k > 6 ? 'none' : null));
        all.select('circle').attr('r', d => R(d.n) / Math.sqrt(k));
        // names, biggest city first, only where they do not collide (on screen, at this zoom)
        const t = d3.zoomTransform(svgEl), boxes = [];
        cities.forEach(d => { const p = proj([d.lon, d.lat]), r = R(d.n) * Math.sqrt(k); d.sx = t.applyX(p[0]); d.sy = t.applyY(p[1]); d.sr = r; });
        cities.forEach(d => {
          d.lab = false; if (k > 6) return;
          const w = d.name.length * 6.6 + 4, b = [d.sx + d.sr + 3, d.sy - 8, d.sx + d.sr + 3 + w, d.sy + 8];
          if (b[2] > W() - 4) return;
          const hit = boxes.some(o => !(b[2] < o[0] || b[0] > o[2] || b[3] < o[1] || b[1] > o[3])) || cities.some(o => o !== d && o.n >= d.n && o.sx + o.sr > b[0] && o.sx - o.sr < b[2] && o.sy + o.sr > b[1] && o.sy - o.sr < b[3]);
          if (!hit) { boxes.push(b); d.lab = true; }
        });
        all.filter(d => d.lab).raise();
        all.select('text').text(d => (d.lab ? d.name : '')).attr('x', d => (R(d.n) + 4) / Math.sqrt(k)).attr('y', '0.35em').style('font-size', 11.5 / k + 'px');
        const vs = gv.selectAll('g.lrcm-v').data(k > 6 ? venues : [], d => d.lat + ',' + d.lon);
        vs.exit().remove();
        const ve = vs.enter().append('g').attr('class', 'lrcm-v').attr('tabindex', 0).attr('role', 'button');
        ve.append('circle'); ve.append('text');
        ve.on('click', (e, d) => openVenue(d)).on('pointerenter', (e, d) => showTip(e, `<b>${esc(d.name)}</b><span>${d.shows.length} ${d.shows.length === 1 ? 'show' : 'shows'}</span>`)).on('pointerleave', hideTip);
        const va = ve.merge(vs);
        va.attr('transform', d => { const p = proj([d.lon, d.lat]); return `translate(${p[0]},${p[1]})`; });
        va.select('circle').attr('r', d => (4 + 2 * Math.sqrt(d.shows.length)) / k);
        const vb = [];
        venues.forEach(d => {
          d.lab = false; if (k <= 6) return;
          const p = proj([d.lon, d.lat]), x = t.applyX(p[0]), y = t.applyY(p[1]), w = d.name.length * 6.3 + 4;
          d.left = x + 9 + w > W() - 6;
          const b = d.left ? [x - 9 - w, y - 8, x - 9, y + 8] : [x + 9, y - 8, x + 9 + w, y + 8];
          const dots = venues.some(o => { if (o === d) return false; const q = proj([o.lon, o.lat]), ox = t.applyX(q[0]), oy = t.applyY(q[1]); return ox + 6 > b[0] && ox - 6 < b[2] && oy + 6 > b[1] && oy - 6 < b[3]; });
          if (!dots && !vb.some(o => !(b[2] < o[0] || b[0] > o[2] || b[3] < o[1] || b[1] > o[3]))) { vb.push(b); d.lab = true; }
        });
        va.select('text').text(d => (d.lab ? d.name : '')).attr('text-anchor', d => (d.left ? 'end' : 'start')).attr('x', d => (d.left ? -9 : 9) / k).attr('y', '0.35em').style('font-size', 11 / k + 'px');
        plateFade();
        g.select('.lrcm-borders').style('stroke-width', 0.6 / k);
        g.select('.lrcm-land').style('stroke-width', 0.7 / k);
      }
      const zoom = d3.zoom().scaleExtent([1, 6000]).on('zoom', e => { k = e.transform.k; g.attr('transform', e.transform); place(); hideTip(); }).on('end', platesInView);
      svg.call(zoom).on('dblclick.zoom', null);
      const slow = () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 900);
      function zoomTo(lonlat, scale) {
        const p = proj(lonlat), t = d3.zoomIdentity.translate(W() / 2, H() / 2).scale(scale).translate(-p[0], -p[1]);
        svg.transition().duration(slow()).call(zoom.transform, t);
      }
      function zoomToXY(x, y, scale) {
        svg.transition().duration(slow() ? 1500 : 0).ease(d3.easeCubicInOut).call(zoom.transform, d3.zoomIdentity.translate(W() / 2, H() / 2).scale(scale).translate(-x, -y));
      }
      function openCity(c) {
        focus = c;
        // zoom so all its venues fit, but never closer than a neighbourhood
        const ps = c.venues.map(v => proj([v.lon, v.lat])), xs = ps.map(p => p[0]), ys = ps.map(p => p[1]);
        const span = Math.max(d3.max(xs) - d3.min(xs), d3.max(ys) - d3.min(ys), 0.08);
        const cx = (d3.min(xs) + d3.max(xs)) / 2, cy = (d3.min(ys) + d3.max(ys)) / 2;
        const byVenues = () => zoomToXY(cx, cy, Math.min(2500, Math.max(12, 0.62 * Math.min(W(), H()) / span)));
        listShows(c.name, c.shows, `${c.venues.length} ${c.venues.length === 1 ? 'venue' : 'venues'}`);
        // with its plate: the city fills the frame (its venues are inside it by construction)
        drawPlate(c).then(pl => {
          if (focus !== c) return;
          if (!pl || pl.region) return byVenues();      // a region (the Bay Area): open on this city's own venues
          const a = proj([pl.bbox[0], pl.bbox[3]]), b = proj([pl.bbox[2], pl.bbox[1]]);
          const cover = Math.max(W() / (b[0] - a[0]), H() / (b[1] - a[1])), fitV = 0.8 * Math.min(W() / Math.max(1e-6, d3.max(xs) - d3.min(xs)), H() / Math.max(1e-6, d3.max(ys) - d3.min(ys)));
          zoomToXY(cx, cy, Math.min(4000, cover, fitV));
        });
        return;
      }
      function openVenue(v) { listShows(v.name, v.shows, v.city || ''); }
      function world() { focus = null; svg.transition().duration(slow() ? 700 : 0).call(zoom.transform, d3.zoomIdentity); overview(); }
      function row(i) {
        return `<li class="lrcm-row"><p class="lrcm-k">${i.now ? 'On view' : 'Opens ' + day(i.s)}${i.e ? ` &middot; until ${day(i.e)}` : ''}</p>
          <a class="lrcm-t" href="${esc(i.u || '#')}" target="_blank" rel="noopener">${title(i.t)}<span aria-hidden="true"> &#8599;</span></a><p class="lrcm-p">${esc(i.p)}</p></li>`;
      }
      function listShows(name, list, sub) {
        const key = i => (i.now ? '0' + (i.e || '9') : '1' + i.s);
        const l = list.slice().sort((a, b) => (key(a) < key(b) ? -1 : 1));
        side.innerHTML = `<button type="button" class="lrcm-back" data-z="world">&larr; Every city</button><p class="lrcm-lab">${esc(sub)}</p><h3 class="lrcm-h">${esc(name)}</h3><ul class="lrcm-list">${l.map(row).join('')}</ul>`;
        side.scrollTop = 0;
      }
      function overview() {
        const nowN = shows.filter(s => s.now).length;
        side.innerHTML = `<p class="lrcm-lab">On the calendar</p><h3 class="lrcm-h">${nowN} on view now, ${shows.length - nowN} to come</h3>
          <ul class="lrcm-cities">${cities.map(c => `<li><button type="button" data-city="${esc(c.name)}"><span>${esc(c.name)}</span><small>${c.n}</small></button></li>`).join('')}</ul>`;
      }
      function showTip(e, html) {
        tip.innerHTML = html; tip.hidden = false;
        const r = root.querySelector('.lrcm-map').getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        tip.style.transform = `translate(${Math.max(8, Math.min(x + 14, r.width - tip.offsetWidth - 8))}px,${Math.max(8, y - tip.offsetHeight - 10)}px)`;
      }
      function hideTip() { tip.hidden = true; }
      clickHandler = (e => {
        const z = e.target.closest('[data-z]'), c = e.target.closest('[data-city]');
        if (z) { const a = z.dataset.z; if (a === 'world') world(); else svg.transition().duration(350).call(zoom.scaleBy, a === 'in' ? 2 : 0.5); }
        else if (c) { const city = cities.find(x => x.name === c.dataset.city); if (city) openCity(city); }
      });
      let lastW = svgEl.clientWidth || 0, W0 = W(), H0 = H();     // the first observation of an unchanged size does nothing
      ro = new ResizeObserver(() => {
        if (!alive || !svgEl.clientWidth) return;          // hidden: wait until it is shown
        if (Math.abs(svgEl.clientWidth - lastW) < 2) return;
        const first = !lastW; lastW = svgEl.clientWidth;
        // a resize keeps the place in view (the middle of the frame) at the same zoom; drawn plates are redrawn
        const t0 = d3.zoomTransform(svgEl), mid = first || t0.k === 1 ? null : proj.invert(t0.invert([W0 / 2, H0 / 2])), k0 = t0.k;
        fit(); W0 = W(); H0 = H();
        drawn.forEach(gx => gx.remove()); drawn.clear();
        if (!mid) { svg.call(zoom.transform, d3.zoomIdentity); if (first) { focus = null; overview(); } return; }
        const p = proj(mid); svg.call(zoom.transform, d3.zoomIdentity.translate(W() / 2, H() / 2).scale(k0).translate(-p[0], -p[1]));
        if (focus) drawPlate(focus); platesInView();
      });
      ro.observe(svgEl);
      fit(); overview();
      root.dataset.state = 'ready';
    }).catch(() => { if (!alive) return; root.dataset.state = 'error'; side.innerHTML = '<p class="lrcm-lab">The map could not load. The list has every date.</p>'; });
    return api;
  }
  window.LRCalMap = { mount };
})();
