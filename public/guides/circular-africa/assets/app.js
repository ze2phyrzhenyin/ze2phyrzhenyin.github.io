// Circular consumption in Africa: navigation, calculators, directory filters, copy buttons, tooltips.
(() => {
  'use strict';
  const doc = document.documentElement;
  const locale = doc.dataset.locale || 'en';
  const view = doc.dataset.view;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const escH = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const nf = (n, d = 0) => Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

  // ---------- back link: a reader sent here from the French guides index keeps ?from=fr ----------
  const params = new URLSearchParams(location.search);
  const from = params.get('from');
  if (['en', 'fr', 'zh'].includes(from)) {
    for (const a of $$('[data-guide-home]')) a.href = `/guides/${from}/`;
    for (const a of $$('a[href]')) {
      const u = new URL(a.href, location.href);
      if (u.origin === location.origin && u.pathname.startsWith('/guides/circular-africa/') && !u.pathname.includes('/files/')) { u.searchParams.set('from', from); a.href = u.pathname + u.search + u.hash; }
    }
  }

  // Keep the current view visible in a scrolled top bar on phones.
  const currentView = $('.views a[aria-current="page"]');
  if (currentView && currentView.parentElement.scrollWidth > currentView.parentElement.clientWidth) currentView.parentElement.scrollLeft = currentView.offsetLeft - 8;

  // ---------- theme ----------
  const themeBtn = $('[data-theme-toggle]');
  function paintTheme() {
    if (!themeBtn) return;
    const dark = doc.dataset.theme === 'dark';
    const next = dark ? 'light' : 'dark';
    themeBtn.textContent = themeBtn.dataset[`text${next === 'dark' ? 'Dark' : 'Light'}`];
    themeBtn.dataset.icon = next === 'dark' ? '☾' : '☀';
    themeBtn.setAttribute('aria-label', themeBtn.dataset[`label${next === 'dark' ? 'Dark' : 'Light'}`]);
    themeBtn.title = themeBtn.getAttribute('aria-label');
  }
  themeBtn?.addEventListener('click', () => window.GuideTheme?.toggle());
  document.addEventListener('guide-theme-change', paintTheme);
  paintTheme();

  // ---------- language links keep the place ----------
  for (const a of $$('.langs a')) {
    a.addEventListener('click', () => {
      const t = new URL(a.href, location.href);
      t.search = location.search; t.hash = location.hash;
      a.href = t.href;
      try { sessionStorage.setItem('ca-pos', JSON.stringify({ path: t.pathname, y: scrollY, hash: location.hash })); } catch { /* fine */ }
    });
  }
  try {
    const saved = JSON.parse(sessionStorage.getItem('ca-pos') || 'null');
    if (saved && saved.path === location.pathname && !location.hash) {
      addEventListener('load', () => { scrollTo({ top: saved.y, behavior: 'instant' }); }, { once: true });
    }
    sessionStorage.removeItem('ca-pos');
  } catch { /* fine */ }

  // ---------- tooltip ----------
  const tip = $('.tooltip');
  function showTip(el, x, y) {
    if (!tip) return;
    tip.textContent = el.dataset.tip; tip.hidden = false;
    const r = tip.getBoundingClientRect();
    let left = x + 14, top = y + 14;
    if (left + r.width > innerWidth - 8) left = x - r.width - 14;
    if (top + r.height > innerHeight - 8) top = y - r.height - 14;
    tip.style.left = Math.max(8, left) + 'px'; tip.style.top = Math.max(8, top) + 'px';
  }
  document.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const el = e.target.closest?.('[data-tip]');
    if (el) showTip(el, e.clientX, e.clientY); else if (tip) tip.hidden = true;
  });
  document.addEventListener('focusin', e => {
    const el = e.target.closest?.('[data-tip]');
    if (el) { const r = el.getBoundingClientRect(); showTip(el, r.left + r.width / 2, r.bottom); }
  });
  document.addEventListener('focusout', () => { if (tip) tip.hidden = true; });
  document.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' && tip) tip.hidden = true; });
  addEventListener('scroll', () => { if (tip) tip.hidden = true; }, { passive: true });

  // ---------- table of contents: active chapter, frozen scroll, mobile sheet ----------
  const toc = $('#toc');
  if (toc) {
    const links = $$('[data-toc]', toc);
    const byId = new Map(links.map(a => [a.dataset.toc, a]));
    const targets = links.map(a => document.getElementById(a.dataset.toc)).filter(Boolean);
    const current = $('[data-toc-current]');
    const scroller = $('.toc-scroll', toc);
    let active = null;
    function setActive(id) {
      if (id === active) return;
      active = id;
      for (const a of links) { const on = a.dataset.toc === id; a.classList.toggle('active', on); if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); }
      const a = byId.get(id);
      if (a && scroller) {
        const ar = a.getBoundingClientRect(), sr = scroller.getBoundingClientRect();
        if (ar.top < sr.top + 40 || ar.bottom > sr.bottom - 40) scroller.scrollTop += ar.top - sr.top - sr.height / 3;
      }
      if (current) current.textContent = a ? a.textContent.replace(/^\d{2}/, '').trim() : '';
    }
    function onScroll() {
      const line = innerHeight * 0.28;
      let id = targets[0]?.id;
      for (const t of targets) { if (t.getBoundingClientRect().top - line <= 0) id = t.id; else break; }
      if (targets[0] && targets[0].getBoundingClientRect().top > innerHeight) id = null;
      setActive(id);
    }
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    onScroll();
    if (location.hash) {
      setActive(location.hash.slice(1));
      // Fonts and figures can move the target after the browser's first jump.
      addEventListener('load', () => { const t = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (t) { t.scrollIntoView({ behavior: 'instant' }); onScroll(); } }, { once: true });
    }
    // Keep the chapter in the address bar without adding history entries.
    let hashTimer;
    addEventListener('scroll', () => {
      clearTimeout(hashTimer);
      hashTimer = setTimeout(() => { if (active && location.hash.slice(1) !== active && byId.has(active)) history.replaceState(null, '', `#${active}`); }, 400);
    }, { passive: true });
    const openBtn = $('.toc-open');
    const close = () => { toc.classList.remove('open'); openBtn?.setAttribute('aria-expanded', 'false'); };
    openBtn?.addEventListener('click', () => {
      const open = !toc.classList.contains('open');
      toc.classList.toggle('open', open); openBtn.setAttribute('aria-expanded', String(open));
      const a = byId.get(active);
      if (open && a && scroller) scroller.scrollTop = a.offsetTop - scroller.clientHeight / 3;
    });
    for (const a of links) a.addEventListener('click', () => { setActive(a.dataset.toc); close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  // ---------- calculators ----------
  function bindTool(root, compute) {
    const inputs = $$('input[type=range]', root);
    const show = () => {
      for (const i of inputs) {
        const o = root.querySelector(`output[for="${i.id}"]`);
        const unit = o.dataset.unit, v = Number(i.value);
        const text = unit === '%' ? `${nf(v, i.step.includes('.') ? 2 : 0)} %` : unit ? `${unit} ${nf(v, i.step.includes('.') ? 1 : 0)}` : nf(v);
        o.textContent = text;
      }
      compute(Object.fromEntries(inputs.map(i => [i.id, Number(i.value)])));
    };
    for (const i of inputs) i.addEventListener('input', show);
    $('[data-reset]', root)?.addEventListener('click', () => { for (const i of inputs) i.value = i.dataset.default; show(); });
    show();
  }
  const set = (root, key, text, neg = false) => { for (const el of $$(`[data-v="${key}"]`, root)) { el.textContent = text; el.classList.toggle('neg', neg); } };
  const check = $('[data-tool="check"]');
  if (check) bindTool(check, v => {
    const fee = v['c-fee'], tech = v['c-tech'], cons = v['c-cons'], pay = fee * v['c-gate'] / 100, disp = v['c-disp'];
    const left = fee - tech - cons - pay;
    const parts = { tech, cons, pay, left: Math.max(left, 0) };
    const total = Math.max(fee, tech + cons + pay);
    for (const seg of $$('[data-part]', check)) seg.style.flexGrow = String(parts[seg.dataset.part] / total || 0);
    set(check, 'tech', `GHS ${nf(tech, 2)}`); set(check, 'cons', `GHS ${nf(cons, 2)}`); set(check, 'pay', `GHS ${nf(pay, 2)}`);
    set(check, 'left', `GHS ${nf(left, 2)}`, left < 0); set(check, 'left-big', `GHS ${nf(left, 2)}`, left < 0);
    set(check, 'be', left > 0 ? `${nf(left / disp * 100, 1)} %` : '0 %', left <= 0);
    $('[data-warn]', check).hidden = left > 0;
  });
  const route = $('[data-tool="route"]');
  if (route) bindTool(route, v => {
    const n = Math.ceil(v['r-cost'] / v['r-m']);
    set(route, 'fills', nf(n));
    const box = $('[data-bottles]', route);
    const shown = Math.min(n, 60);
    box.innerHTML = '<i></i>'.repeat(shown) + (n > shown ? `<i class="more">+${n - shown}</i>` : '');
  });
  const est = $('[data-tool="estimate"]');
  if (est) bindTool(est, v => {
    const eligible = v['e-shops'] * v['e-hand'];
    const checks = eligible * v['e-take'] / 100;
    set(est, 'eligible', nf(eligible));
    set(est, 'checks', nf(checks, checks % 1 ? 1 : 0));
    set(est, 'revenue', `GHS ${nf(checks * v['e-fee'])}`);
  });

  // ---------- deadlines ----------
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const daysWords = { en: [n => n === 1 ? 'tomorrow' : `in ${n} days`, 'today', 'passed'], es: [n => n === 1 ? 'mañana' : `dentro de ${n} días`, 'hoy', 'ya pasó'], zh: [n => n === 1 ? '明天' : `还有 ${n} 天`, '今天', '已过'] }[locale];
  for (const el of $$('[data-days]')) {
    const d = new Date(el.dataset.days + 'T00:00:00'); const n = Math.round((d - today) / 864e5);
    el.textContent = n > 0 ? daysWords[0](n) : n === 0 ? daysWords[1] : daysWords[2];
    el.classList.toggle('passed', n < 0);
  }

  // ---------- copy ----------
  const doneText = { en: 'Copied', es: 'Copiado', zh: '已复制' }[locale];
  async function copy(text, btn) {
    try { await navigator.clipboard.writeText(text); }
    catch { const t = document.createElement('textarea'); t.value = text; document.body.append(t); t.select(); document.execCommand('copy'); t.remove(); }
    const old = btn.textContent; btn.textContent = doneText; btn.classList.add('done');
    setTimeout(() => { btn.textContent = old; btn.classList.remove('done'); }, 1600);
  }
  for (const b of $$('[data-copy-text]')) b.addEventListener('click', () => copy(b.dataset.copyText, b));
  for (const b of $$('[data-copy-list-btn]')) b.addEventListener('click', () => {
    const list = b.previousElementSibling;
    copy($$('li', list).map((li, i) => `${i + 1}. ${($('[data-s]', li) || li).textContent.trim()}`).join('\n'), b);
  });
  for (const b of $$('[data-copy-prompt]')) b.addEventListener('click', () => copy($('#prompt-md').value, b));

  // ---------- map explorer ----------
  const explorer = $('[data-explorer]');
  if (explorer) {
    const wrap = $('[data-map]', explorer), svg = $('svg.africa-map', wrap);
    const FULL = [0, 0, 600, 640];
    const focus = JSON.parse(wrap.dataset.focus), kmPerUnit = Number(wrap.dataset.km);
    const panel = $('[data-panel]', explorer), panelBody = $('[data-panel-body]', panel), intro = $('[data-intro]', explorer);
    const allBtn = $('.map-all', wrap), scaleBar = $('.map-scale', wrap), locator = $('.locator', wrap), locRect = $('.loc-view', wrap), hint = $('.map-hint', wrap);
    const marks = $$('.mk', svg), shapes = $$('.m-c', svg);
    let labels = $$('.lbl', svg), layers = [];
    const templates = new Map($$('.place-templates template').map(t => [t.dataset.place, t]));
    const narrow = matchMedia('(max-width: 960px)');
    const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    let cx = 300, cy = 320, w = 600, place = null, frame = null, mode = null, active = false;
    let target = null, path = null, t0 = 0, dur = 0, vel = [0, 0], detailLoaded = false, settleTimer = null;

    const size = () => { const r = svg.getBoundingClientRect(); return [r.width || 600, r.height || 640]; };
    // Zoom level relative to the whole continent in this frame: 1 at the start, about 10 for Ghana, over 100 for a city.
    const kOf = ww => fit(FULL)[2] / ww;
    function fit(b) { const [ew, eh] = size(); const pad = 1.04; return [b[0] + b[2] / 2, b[1] + b[3] / 2, Math.max(b[2], b[3] * ew / eh) * pad]; }
    function clampState() {
      w = Math.min(Math.max(w, 0.18), fit(FULL)[2] * 1.6);
      cx = Math.min(Math.max(cx, -60), 660); cy = Math.min(Math.max(cy, -60), 700);
    }
    function apply() {
      clampState();
      const [ew, eh] = size(), h = w * eh / ew, k = kOf(w), s = w / ew;
      svg.setAttribute('viewBox', `${(cx - w / 2).toFixed(4)} ${(cy - h / 2).toFixed(4)} ${w.toFixed(4)} ${h.toFixed(4)}`);
      for (const m of marks) {
        const on = k >= Number(m.dataset.kmin) && k < Number(m.dataset.kmax);
        m.classList.toggle('off', !on); m.setAttribute('tabindex', on ? '0' : '-1');
        if (on) m.setAttribute('transform', `translate(${m.dataset.x} ${m.dataset.y}) scale(${s.toFixed(5)})`);
      }
      for (const l of labels) {
        const on = k >= Number(l.dataset.kmin || 0) && k < Number(l.dataset.kmax || 1e6);
        l.classList.toggle('off', !on);
        if (on) l.setAttribute('transform', `translate(${l.dataset.x} ${l.dataset.y}) scale(${s.toFixed(5)})`);
      }
      for (const g of layers) g.classList.toggle('off', !(k >= Number(g.dataset.kmin || 0) && k < Number(g.dataset.kmax || 1e6)));
      wrap.dataset.level = k < 3 ? 'continent' : k < 14 ? 'country' : 'city';
      // Scale bar: a round number of kilometres close to 90 px.
      const kmPerPx = kmPerUnit * w / ew, want = 90 * kmPerPx, pow = 10 ** Math.floor(Math.log10(want)), nice = [5, 2, 1].map(m => m * pow).find(v => v <= want) || pow;
      scaleBar.querySelector('i').style.width = `${(nice / kmPerPx).toFixed(1)}px`;
      scaleBar.querySelector('span').textContent = `${nice >= 1 ? nf(nice) : nice} km`;
      locator.hidden = k < 2.2;
      if (!locator.hidden) { locRect.setAttribute('x', cx - w / 2); locRect.setAttribute('y', cy - h / 2); locRect.setAttribute('width', w); locRect.setAttribute('height', h); }
      allBtn.hidden = !place && k < 1.25;
      svg.style.touchAction = k < 1.25 ? 'pan-y' : 'none';
      if (k > 2.6 && !detailLoaded) loadDetail();
      clearTimeout(settleTimer); settleTimer = setTimeout(declutter, 140);
    }
    // Hide labels that collide with a higher-priority one (markers first, then the order in the DOM).
    function declutter() {
      const boxes = [];
      const hit = r => boxes.some(b => r.left < b.right && r.right > b.left && r.top < b.bottom && r.bottom > b.top);
      for (const m of marks) if (!m.classList.contains('off')) { const t = $('text', m); if (t) boxes.push(t.getBoundingClientRect()); }
      const frameBox = svg.getBoundingClientRect();
      for (const l of labels) {
        l.classList.remove('clash');
        if (l.classList.contains('off')) continue;
        const r = l.getBoundingClientRect();
        const outside = r.left < frameBox.left + 4 || r.right > frameBox.right - 4 || r.top < frameBox.top + 4 || r.bottom > frameBox.bottom - 4;
        if (outside || hit(r)) l.classList.add('clash'); else boxes.push(r);
      }
    }
    // ---- motion: fly (smooth zoom path), ease (wheel and buttons), glide (inertia) ----
    function zoomPath(p0, p1) {
      const rho = Math.SQRT2, [ux0, uy0, w0] = p0, [ux1, uy1, w1] = p1, dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy;
      let f, S;
      if (d2 < 1e-12) { S = Math.log(w1 / w0) / rho; f = t => [ux0 + t * dx, uy0 + t * dy, w0 * Math.exp(rho * t * S)]; }
      else {
        const d1 = Math.sqrt(d2), b0 = (w1 * w1 - w0 * w0 + 4 * d2) / (4 * w0 * d1), b1 = (w1 * w1 - w0 * w0 - 4 * d2) / (4 * w1 * d1);
        const r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0), r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
        S = (r1 - r0) / rho;
        f = t => { const s = t * S, c0 = Math.cosh(r0), u = w0 / (2 * d1) * (c0 * Math.tanh(rho * s + r0) - Math.sinh(r0)); return [ux0 + u * dx, uy0 + u * dy, w0 * c0 / Math.cosh(rho * s + r0)]; };
      }
      f.duration = Math.min(1600, Math.max(500, Math.abs(S) * 900));
      return f;
    }
    const easeInOut = t => (t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
    function loop(now) {
      if (mode === 'fly') {
        const k = Math.min(1, (now - t0) / dur);
        [cx, cy, w] = path(easeInOut(k));
        if (k >= 1) mode = null;
      } else if (mode === 'ease') {
        cx += (target[0] - cx) * 0.2; cy += (target[1] - cy) * 0.2;
        w = Math.exp(Math.log(w) + (Math.log(target[2]) - Math.log(w)) * 0.2);
        if (Math.abs(Math.log(w / target[2])) < 0.002 && Math.hypot(target[0] - cx, target[1] - cy) < w * 0.0005) { [cx, cy, w] = target; mode = null; }
      } else if (mode === 'glide') {
        cx -= vel[0]; cy -= vel[1]; vel = [vel[0] * 0.9, vel[1] * 0.9];
        if (Math.hypot(vel[0], vel[1]) < w * 0.0003) mode = null;
      }
      apply();
      frame = mode ? requestAnimationFrame(loop) : null;
    }
    function run(m) { mode = m; if (!frame) frame = requestAnimationFrame(loop); }
    function flyTo(state) {
      if (reduce.matches) { [cx, cy, w] = state; mode = null; apply(); return; }
      path = zoomPath([cx, cy, w], state); dur = path.duration; t0 = performance.now(); run('fly');
    }
    function easeTo(state) { if (reduce.matches) { [cx, cy, w] = state; apply(); return; } target = state; run('ease'); }
    function zoomAt(factor, px, py) {
      // Keep the map point under (px, py) fixed while zooming.
      const [ew, eh] = size(), base = mode === 'ease' && target ? target : [cx, cy, w];
      const h = base[2] * eh / ew, mx = base[0] - base[2] / 2 + px / ew * base[2], my = base[1] - h / 2 + py / eh * h;
      const nw = Math.min(Math.max(base[2] / factor, 0.18), fit(FULL)[2] * 1.6), nh = nw * eh / ew;
      easeTo([mx - (px / ew - 0.5) * nw, my - (py / eh - 0.5) * nh, nw]);
    }

    // ---- detail layers (Ghana, Accra, Kumasi), loaded once on first zoom ----
    async function loadDetail() {
      detailLoaded = true;
      let d;
      try { d = await fetch(wrap.dataset.detail).then(r => r.json()); } catch { detailLoaded = false; return; }
      const regionNames = JSON.parse(wrap.dataset.regions), routeTips = JSON.parse(wrap.dataset.routeTips);
      const p = (cls, dd) => (dd ? `<path class="${cls}" d="${dd}"/>` : '');
      const city = (id, c) => `<g class="d-city d-${id}" data-kmin="14">${p('c-land', c.coast?.land)}${p('c-sea', c.coast?.sea)}${p('c-water', c.water)}${p('c-waterway', c.waterways)}${p('c-campus', c.campus)}${p('c-airport', c.airport)}${p('c-landfill', c.landfill)}${p('c-road tertiary', c.roads.tertiary)}${p('c-road secondary', c.roads.secondary)}${p('c-road primary', c.roads.primary)}${p('c-road trunk', c.roads.trunk)}${p('c-road motorway', c.roads.motorway)}${p('c-rail', c.rail)}${p('c-market', c.markets)}${p('c-coast', c.coast?.line)}</g>`;
      const route = (id, dd) => `<g class="m-route ${id}" data-go="${id}" data-tip="${escH(routeTips[id])}"><path class="hit" d="${dd}"/><path class="line" d="${dd}"/></g>`;
      $('.m-detail', svg).innerHTML = `<g class="d-ghana" data-kmin="3">${p('d-neigh', d.ghana.neighbours)}${p('d-gh', d.ghana.outline)}${p('d-regions', d.ghana.regions)}${p('d-rivers', d.ghana.rivers)}${p('d-lakes', d.ghana.lakes)}${p('d-road primary', d.ghana.roads.primary)}${p('d-road trunk', d.ghana.roads.trunk)}${p('d-road motorway', d.ghana.roads.motorway)}</g>
        ${city('accra', d.accra)}${city('kumasi', d.kumasi)}<g class="m-routes" data-kmin="3" data-kmax="40">${route('parcel', d.ghana.routes.parcel)}${route('enchi', d.ghana.routes.enchi)}</g>`;
      const lbl = (cls, x, y, text, kmin, kmax, dot = false) => `<g class="lbl ${cls}" data-x="${x}" data-y="${y}" data-kmin="${kmin}" data-kmax="${kmax}" transform="translate(${x} ${y})">${dot ? '<circle r="2.5"/>' : ''}<text${dot ? ' x="5" y="4"' : ' text-anchor="middle"'}>${escH(text)}</text></g>`;
      const towns = new Set(['Accra', 'Kumasi', 'Sunyani']);
      const extra = d.ghana.regionLabels.map(r => lbl('region', r.x, r.y, regionNames[r.name] || r.name, 5, 22)).join('')
        + d.ghana.towns.filter(t => !towns.has(t.name)).map(t => lbl('town', t.x, t.y, t.name, 4.5, 30, true)).join('')
        + [...d.accra.labels, ...d.kumasi.labels].map(l => lbl('suburb', l.x, l.y, l.name, 30, 1e6)).join('');
      $('.m-labels', svg).insertAdjacentHTML('afterbegin', extra);
      labels = $$('.lbl', svg);
      layers = $$('.m-detail [data-kmin]', svg);
      for (const r of $$('.m-route', svg)) r.classList.toggle('on', r.dataset.go === place);
      apply();
    }

    // ---- places ----
    function select(id, { push = true, animate = true } = {}) {
      if (id && !templates.has(id)) id = null;
      place = id;
      const tpl = id && templates.get(id);
      const parentView = tpl ? tpl.dataset.view : null;
      for (const sh of shapes) sh.classList.toggle('on', !!id && (sh.dataset.go === id || sh.dataset.go === parentView || (parentView && ['accra', 'kumasi', 'ghana'].includes(parentView) && sh.dataset.go === 'ghana')));
      for (const m of marks) m.classList.toggle('on', m.dataset.go === id);
      for (const r of $$('.m-route', svg)) r.classList.toggle('on', r.dataset.go === id);
      for (const c of $$('.chips [data-go]')) c.setAttribute('aria-pressed', String(c.dataset.go === id));
      if (tpl) {
        panelBody.replaceChildren(tpl.content.cloneNode(true));
        panel.hidden = false; intro.classList.add('behind'); explorer.classList.add('has-place');
        panel.scrollTop = 0;
        if (!narrow.matches && push) panel.focus({ preventScroll: true });
        if (narrow.matches && push) { const r = wrap.getBoundingClientRect(), top = $('.topbar').getBoundingClientRect().height; if (r.top < top || r.bottom > innerHeight) scrollTo({ top: scrollY + r.top - top - 8, behavior: reduce.matches ? 'instant' : 'smooth' }); }
      } else {
        panel.hidden = true; intro.classList.remove('behind'); explorer.classList.remove('has-place');
      }
      const state = fit(id && focus[id] ? focus[id] : FULL);
      if (animate) flyTo(state); else { [cx, cy, w] = state; apply(); }
      if (push) {
        const u = new URL(location.href);
        if (id) u.searchParams.set('place', id); else u.searchParams.delete('place');
        u.hash = '';
        history.pushState({ place: id }, '', u.pathname + u.search);
      }
    }

    // ---- pointer: drag to pan with inertia, pinch to zoom, click to select ----
    const pointers = new Map();
    let dragged = false, last = null, pinch = null, downTarget = null, samples = [];
    svg.addEventListener('pointerdown', e => {
      active = true;
      pointers.set(e.pointerId, [e.clientX, e.clientY]);
      if (pointers.size === 1) { dragged = false; last = [e.clientX, e.clientY]; downTarget = e.target.closest('[data-go]'); samples = []; if (mode === 'glide' || mode === 'ease') mode = null; }
      if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), w }; dragged = true; }
    });
    svg.addEventListener('pointermove', e => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, [e.clientX, e.clientY]);
      const [ew, eh] = size(), rect = svg.getBoundingClientRect();
      if (pointers.size === 2 && pinch) {
        const [a, b] = [...pointers.values()], dnow = Math.hypot(a[0] - b[0], a[1] - b[1]);
        const mx = (a[0] + b[0]) / 2 - rect.left, my = (a[1] + b[1]) / 2 - rect.top;
        const h = w * eh / ew, px = cx - w / 2 + mx / ew * w, py = cy - h / 2 + my / eh * h;
        w = Math.min(Math.max(pinch.w * pinch.d / dnow, 0.18), fit(FULL)[2] * 1.6);
        cx = px - (mx / ew - 0.5) * w; cy = py - (my / eh - 0.5) * (w * eh / ew);
        mode = null; apply(); return;
      }
      const dx = e.clientX - last[0], dy = e.clientY - last[1];
      if (!dragged && Math.hypot(e.clientX - last[0], e.clientY - last[1]) < 4) return;
      if (!dragged) { dragged = true; wrap.classList.add('dragging'); svg.setPointerCapture(e.pointerId); }
      last = [e.clientX, e.clientY];
      const u = w / ew;
      cx -= dx * u; cy -= dy * u; mode = null;
      samples.push([performance.now(), dx * u, dy * u]); if (samples.length > 6) samples.shift();
      apply();
    });
    const end = e => {
      if (!pointers.has(e.pointerId)) return;
      pointers.delete(e.pointerId);
      if (pointers.size === 1) { last = [...pointers.values()][0]; pinch = null; return; }
      if (pointers.size) return;
      wrap.classList.remove('dragging');
      pinch = null;
      if (!dragged) { if (downTarget) select(downTarget.dataset.go || null); return; }
      const recent = samples.filter(s => performance.now() - s[0] < 80);
      if (recent.length && !reduce.matches) { vel = [recent.reduce((a, s) => a + s[1], 0) / recent.length, recent.reduce((a, s) => a + s[2], 0) / recent.length]; run('glide'); }
    };
    svg.addEventListener('pointerup', end);
    svg.addEventListener('pointercancel', end);
    svg.addEventListener('dblclick', e => { const r = svg.getBoundingClientRect(); zoomAt(2.4, e.clientX - r.left, e.clientY - r.top); });
    wrap.addEventListener('pointerleave', () => { active = false; });
    let hintTimer;
    svg.addEventListener('wheel', e => {
      if (!(e.ctrlKey || e.metaKey || active)) {
        hint.textContent = isMac ? wrap.dataset.hintMac : wrap.dataset.hint; hint.hidden = false;
        clearTimeout(hintTimer); hintTimer = setTimeout(() => { hint.hidden = true; }, 1400);
        return;
      }
      e.preventDefault();
      const r = svg.getBoundingClientRect();
      const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      zoomAt(Math.exp(-delta * (e.ctrlKey ? 0.012 : 0.0025)), e.clientX - r.left, e.clientY - r.top);
    }, { passive: false });
    for (const b of $$('[data-zoom]', wrap)) b.addEventListener('click', () => { const [ew, eh] = size(); zoomAt(b.dataset.zoom === 'in' ? 2 : 0.5, ew / 2, eh / 2); active = true; });
    wrap.addEventListener('keydown', e => {
      const t = e.target.closest('.mk');
      if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); select(t.dataset.go); return; }
      if (e.target !== wrap) return;
      const [ew, eh] = size(), step = w * 0.12;
      const keys = { '+': () => zoomAt(1.6, ew / 2, eh / 2), '=': () => zoomAt(1.6, ew / 2, eh / 2), '-': () => zoomAt(1 / 1.6, ew / 2, eh / 2), ArrowLeft: () => easeTo([cx - step, cy, w]), ArrowRight: () => easeTo([cx + step, cy, w]), ArrowUp: () => easeTo([cx, cy - step, w]), ArrowDown: () => easeTo([cx, cy + step, w]), '0': () => select(null) };
      if (keys[e.key]) { e.preventDefault(); keys[e.key](); }
    });
    locator.addEventListener('click', () => select(null));
    explorer.addEventListener('click', e => {
      if (e.target.closest('svg.africa-map')) return; // handled by pointer events
      const t = e.target.closest('[data-go]');
      if (t) { e.preventDefault(); select(t.dataset.go || null); return; }
      if (e.target.closest('[data-close-panel]') && narrow.matches) select(null, { push: false, animate: false });
    });
    explorer.addEventListener('keydown', e => { if (e.key === 'Escape' && place) select(null); });
    for (const b of $$('[data-to-map]')) b.addEventListener('click', () => { select(b.dataset.go); scrollTo({ top: 0, behavior: reduce.matches ? 'instant' : 'smooth' }); });
    addEventListener('popstate', () => select(new URLSearchParams(location.search).get('place'), { push: false }));
    new ResizeObserver(() => apply()).observe(svg);
    const initial = new URLSearchParams(location.search).get('place');
    if (initial) select(initial, { push: false, animate: false }); else { [cx, cy, w] = fit(FULL); apply(); }
  }

  // ---------- bale: sort the opened bale by price ----------
  for (const fig of $$('[data-bale]')) {
    const grid = $('.bale-grid', fig), btn = $('[data-bale-sort]', fig);
    const pieces = $$('i', grid);
    const opened = pieces.slice();
    const sorted = pieces.slice().sort((a, b) => a.className.localeCompare(b.className));
    btn.addEventListener('click', () => {
      const toSorted = btn.getAttribute('aria-pressed') !== 'true';
      const before = new Map(pieces.map(p => [p, p.getBoundingClientRect()]));
      grid.append(...(toSorted ? sorted : opened));
      btn.setAttribute('aria-pressed', String(toSorted));
      btn.textContent = toSorted ? btn.dataset.unsort : btn.dataset.sort;
      if (reduce.matches) return;
      for (const p of pieces) {
        const a = before.get(p), b = p.getBoundingClientRect();
        const dx = a.left - b.left, dy = a.top - b.top;
        if (!dx && !dy) continue;
        p.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 650, easing: 'cubic-bezier(.65,0,.35,1)', delay: (p.dataset.i % 40) * 6 });
      }
    });
  }

  // ---------- events axis ----------
  for (const axis of $$('[data-axis]')) {
    axis.addEventListener('click', e => {
      const dot = e.target.closest('[data-event]');
      if (!dot) return;
      const row = document.getElementById(`ev-${dot.dataset.event}`);
      if (!row) return;
      row.scrollIntoView({ behavior: reduce.matches ? 'instant' : 'smooth', block: 'center' });
      row.classList.remove('flash'); void row.offsetWidth; row.classList.add('flash');
    });
  }

  // ---------- small markdown for English originals ----------
  const md = s => escH(s).replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, u) => `<a href="${u.replace(/"/g, '&quot;')}" target="_blank" rel="noopener">${t}</a>`).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  const base = document.body.dataset.route;

  // ---------- English original next to the translation ----------
  const origBtn = $('[data-orig]');
  if (origBtn) {
    let originals = null;
    origBtn.addEventListener('click', async () => {
      const on = origBtn.getAttribute('aria-pressed') !== 'true';
      if (on && !originals) {
        try { originals = await fetch(`${base}/assets/strings.en.json?${document.body.dataset.assetV}`).then(r => r.json()); } catch { return; }
        for (const el of $$('[data-s]')) {
          const text = originals[el.dataset.s];
          if (!text) continue;
          const o = document.createElement(el.tagName === 'TD' ? 'span' : 'p');
          o.className = 'orig'; o.lang = 'en'; o.innerHTML = md(text);
          if (el.tagName === 'TD') el.append(o); else el.after(o);
        }
      }
      document.body.classList.toggle('show-orig', on);
      origBtn.setAttribute('aria-pressed', String(on));
      origBtn.textContent = on ? origBtn.dataset.on : origBtn.dataset.off;
    });
  }

  // ---------- search palette ----------
  const pal = $('[data-palette]');
  if (pal) {
    const input = $('.pal-input', pal), list = $('.pal-results', pal), kinds = JSON.parse(pal.dataset.kinds);
    let index = null, sel = 0, shown = [];
    const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    function search(q) {
      const words = norm(q).split(/\s+/).filter(Boolean);
      if (!words.length) return index.filter(i => i.k === 'chapter' || i.k === 'field').slice(0, 30);
      const scored = [];
      for (const it of index) {
        const t = norm(it.t), hay = `${t} ${norm(it.s || '')} ${norm(it.x || '')}`;
        if (!words.every(w => hay.includes(w))) continue;
        let score = words.reduce((a, w) => a + (t.startsWith(w) ? 6 : t.includes(w) ? 3 : 1), 0);
        if (it.k === 'chapter' || it.k === 'place') score += 1;
        scored.push([score, it]);
      }
      return scored.sort((a, b) => b[0] - a[0]).slice(0, 40).map(s => s[1]);
    }
    function draw() {
      shown = search(input.value);
      sel = 0;
      list.innerHTML = shown.length ? shown.map((it, i) => `<li role="option" aria-selected="${i === 0}"><a href="${it.h}"><span class="pal-kind">${escH(kinds[it.k])}</span><span class="pal-t">${escH(it.t)}</span>${it.s ? `<span class="pal-s">${escH(it.s)}</span>` : ''}</a></li>`).join('') : `<li class="pal-none">${escH(pal.dataset.empty)}</li>`;
    }
    function move(d) {
      const items = $$('li[role="option"]', list);
      if (!items.length) return;
      items[sel]?.setAttribute('aria-selected', 'false');
      sel = (sel + d + items.length) % items.length;
      items[sel].setAttribute('aria-selected', 'true');
      items[sel].scrollIntoView({ block: 'nearest' });
    }
    async function openPal() {
      if (!index) { try { index = await fetch(pal.dataset.index).then(r => r.json()); } catch { index = []; } }
      if (!pal.open) pal.showModal();
      input.value = ''; draw(); input.focus();
    }
    for (const b of $$('[data-search-open]')) b.addEventListener('click', openPal);
    document.addEventListener('keydown', e => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing && !pal.open)) { e.preventDefault(); openPal(); }
    });
    input.addEventListener('input', draw);
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      if (e.key === 'Enter') { e.preventDefault(); const a = $$('li[role="option"] a', list)[sel]; if (a) { pal.close(); a.click(); } }
    });
    list.addEventListener('click', e => { if (e.target.closest('a')) pal.close(); });
    pal.addEventListener('click', e => { if (e.target === pal) pal.close(); });
  }

  // ---------- my list (directory) ----------
  const WKEY = 'circular-africa-watch-v1';
  let watched = new Set();
  try { watched = new Set(JSON.parse(localStorage.getItem(WKEY) || '[]')); } catch { /* fine */ }
  const watchButtons = $$('[data-watch]');
  function paintWatch() {
    for (const b of watchButtons) {
      const on = watched.has(b.dataset.watch);
      b.setAttribute('aria-pressed', String(on)); b.textContent = on ? '★' : '☆';
      b.setAttribute('aria-label', on ? b.dataset.on : b.dataset.off); b.title = b.getAttribute('aria-label');
    }
    const mineTab = $('[data-tab="mine"] span');
    if (mineTab) mineTab.textContent = watched.size;
    const box = $('[data-mine-list]');
    if (!box) return;
    $('[data-mine-empty]').hidden = watched.size > 0;
    $('[data-mine-export]').hidden = watched.size === 0;
    box.innerHTML = '';
    for (const org of $$('#panel-sources .org')) {
      const picked = $$('.entry', org).filter(e => watched.has(e.id));
      if (!picked.length) continue;
      const copy = org.cloneNode(false); copy.removeAttribute('id'); copy.hidden = false;
      copy.append($('.org-head', org).cloneNode(true));
      const wrapE = document.createElement('div'); wrapE.className = 'org-entries';
      for (const e of picked) { const c = e.cloneNode(true); c.removeAttribute('id'); c.hidden = false; wrapE.append(c); }
      copy.append(wrapE); box.append(copy);
    }
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-watch]');
    if (!b) return;
    const id = b.dataset.watch;
    if (watched.has(id)) watched.delete(id); else watched.add(id);
    try { localStorage.setItem(WKEY, JSON.stringify([...watched])); } catch { /* fine */ }
    paintWatch();
  });
  $('[data-mine-export]')?.addEventListener('click', () => {
    const lines = [`# ${document.title}`, ''];
    for (const org of $$('#panel-sources .org')) for (const e of $$('.entry', org).filter(x => watched.has(x.id))) {
      const a = $('h4 a', e);
      lines.push(`- ${$('.org-head h3', org).textContent} · [${a.textContent}](${a.href}) (${e.id})`, `  ${$('.question', e).textContent.trim()}`);
    }
    const blob = new Blob([lines.join('\n') + '\n'], { type: 'text/markdown' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `circular-africa-my-list-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.append(link); link.click(); setTimeout(() => { URL.revokeObjectURL(link.href); link.remove(); }, 1000);
  });
  paintWatch();

  // ---------- earlier versions installed an offline worker: remove it ----------
  if ('serviceWorker' in navigator) navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => { if (r.scope.includes('/guides/circular-africa/')) r.unregister(); })).catch(() => {});


  // ---------- directory ----------
  if (view === 'sources') {
    const tabs = $$('[data-tab]'), panels = $$('[data-panel]');
    const tabNames = tabs.map(t => t.dataset.tab);
    const fields = $$('[data-filter]');
    const entries = $$('#panel-sources .entry');
    const orgs = $$('#panel-sources .org');
    const index = new Map(entries.map(e => [e, (e.closest('.org').querySelector('.org-head').textContent + ' ' + e.textContent).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')]));
    const count = $('[data-count]'), none = $('[data-none]');
    function state() { return new URLSearchParams(location.search); }
    function write(mutator) {
      const p = state(); mutator(p);
      for (const [k, v] of [...p]) if (!v) p.delete(k);
      const qs = p.toString();
      history.replaceState(null, '', location.pathname + (qs ? `?${qs}` : '') + location.hash);
    }
    function showTab(name, focus) {
      if (!tabNames.includes(name)) name = 'sources';
      for (const t of tabs) t.setAttribute('aria-selected', String(t.dataset.tab === name));
      for (const p of panels) p.hidden = p.dataset.panel !== name;
      if (focus) $(`[data-tab="${name}"]`).focus();
    }
    function applyFilters() {
      const p = state();
      const q = (p.get('q') || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
      const words = q.split(/\s+/).filter(Boolean);
      const mode = p.get('mode'), pri = p.get('priority'), region = p.get('region'), cat = p.get('category');
      let n = 0;
      for (const e of entries) {
        const ok = (!mode || e.dataset.mode === mode) && (!pri || e.dataset.priority === pri) && (!region || e.dataset.regions.split(' ').includes(region)) && (!cat || e.dataset.category === cat) && words.every(w => index.get(e).includes(w));
        e.hidden = !ok; if (ok) n++;
      }
      let m = 0;
      for (const o of orgs) { const vis = $$('.entry', o).some(e => !e.hidden); o.hidden = !vis; if (vis) m++; }
      count.textContent = count.dataset.templateN.replace('{n}', n).replace('{m}', m);
      none.hidden = n > 0;
      for (const b of $$('[data-set]')) b.setAttribute('aria-pressed', String(p.get(b.dataset.set) === b.dataset.value));
    }
    function readControls() {
      const p = state();
      for (const f of fields) f.value = p.get(f.dataset.filter) || '';
      showTab(p.get('view') || 'sources');
      applyFilters();
    }
    for (const t of tabs) t.addEventListener('click', () => { write(p => p.set('view', t.dataset.tab === 'sources' ? '' : t.dataset.tab)); history.replaceState(null, '', location.pathname + location.search); showTab(t.dataset.tab); scrollTo({ top: Math.min(scrollY, $('.tabs').offsetTop), behavior: 'instant' }); });
    $('.tabs').addEventListener('keydown', e => {
      if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      const i = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true');
      const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
      next.click(); next.focus();
    });
    let typing;
    for (const f of fields) f.addEventListener(f.tagName === 'INPUT' ? 'input' : 'change', () => {
      clearTimeout(typing);
      typing = setTimeout(() => { write(p => p.set(f.dataset.filter, f.value)); applyFilters(); }, f.tagName === 'INPUT' ? 140 : 0);
    });
    for (const b of $$('[data-set]')) b.addEventListener('click', () => {
      const key = b.dataset.set, on = state().get(key) === b.dataset.value;
      write(p => p.set(key, on ? '' : b.dataset.value));
      readControls();
    });
    $('[data-clear]')?.addEventListener('click', () => { write(p => { for (const f of fields) p.delete(f.dataset.filter); }); readControls(); });
    function goToAnchor(hash, smooth) {
      const id = decodeURIComponent(hash.slice(1));
      const el = document.getElementById(id);
      if (!el) return;
      const panel = el.closest('[data-panel]');
      if (panel && panel.hidden) { write(p => p.set('view', panel.dataset.panel === 'sources' ? '' : panel.dataset.panel)); showTab(panel.dataset.panel); }
      if (el.hidden || el.closest('.org')?.hidden) { write(p => { for (const f of fields) p.delete(f.dataset.filter); }); readControls(); }
      const target = el.classList.contains('org') ? el : el.closest('.org') || el;
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant', block: 'start' });
        target.classList.add('flash'); setTimeout(() => target.classList.remove('flash'), 1800);
      });
    }
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || a.getAttribute('href') === '#top' || a.classList.contains('skip')) return;
      const id = a.getAttribute('href');
      if (!document.getElementById(id.slice(1))) return;
      e.preventDefault();
      history.pushState(null, '', location.pathname + location.search + id);
      goToAnchor(id, true);
    });
    addEventListener('popstate', () => { readControls(); if (location.hash) goToAnchor(location.hash, false); });
    readControls();
    if (location.hash) goToAnchor(location.hash, false);
  }
})();
