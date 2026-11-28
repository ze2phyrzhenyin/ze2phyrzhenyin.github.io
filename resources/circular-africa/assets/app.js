// Circular consumption in Africa: navigation, calculators, directory filters, copy buttons, tooltips.
(() => {
  'use strict';
  const doc = document.documentElement;
  const locale = doc.dataset.locale || 'en';
  const view = doc.dataset.view;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
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
    const el = e.target.closest?.('[data-tip]');
    if (el) showTip(el, e.clientX, e.clientY); else if (tip) tip.hidden = true;
  });
  document.addEventListener('focusin', e => {
    const el = e.target.closest?.('[data-tip]');
    if (el) { const r = el.getBoundingClientRect(); showTip(el, r.left + r.width / 2, r.bottom); }
  });
  document.addEventListener('focusout', () => { if (tip) tip.hidden = true; });
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
    copy($$('li', list).map((li, i) => `${i + 1}. ${li.textContent.trim()}`).join('\n'), b);
  });
  for (const b of $$('[data-copy-prompt]')) b.addEventListener('click', () => copy($('#prompt-md').value, b));

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
