// Field kit: 30-day plan with dates, interview cards, case log, day-30 thresholds, export.
// Everything stays in this browser (localStorage); nothing is sent anywhere.
(() => {
  'use strict';
  const root = document.querySelector('[data-field]');
  if (!root) return;
  const cfg = JSON.parse(document.getElementById('field-config').textContent);
  const S = cfg.strings, L = S.cases, B = S.board;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const fmt = (t, ...a) => String(t).replace(/\{(\d)\}/g, (_, i) => a[i]);
  const nf = (n, d = 0) => Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const KEY = 'circular-africa-field-v1';
  const DAY = 864e5;

  // ---------- state ----------
  let state = { start: '', tasks: {}, cases: [], manual: {} };
  let stored = true;
  try { const raw = localStorage.getItem(KEY); if (raw) state = Object.assign(state, JSON.parse(raw)); } catch { stored = false; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { stored = false; } render(); }

  // ---------- derived numbers ----------
  const num = v => (v === '' || v == null || Number.isNaN(Number(v)) ? null : Number(v));
  const mean = a => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
  function derive() {
    const by = t => state.cases.filter(c => c.type === t);
    const H = by('handset'), F = by('fault'), Bl = by('bale'), R = by('route');
    const offers = H.filter(c => c.f.offered === 'yes').length;
    const paidC = H.filter(c => c.f.paid === 'yes');
    const shops = new Set(paidC.map(c => (c.f.shop || '').trim().toUpperCase()).filter(Boolean)).size;
    const again = new Set(H.filter(c => c.f.again === 'yes').map(c => (c.f.shop || c.id).trim().toUpperCase())).size;
    const perCheck = paidC.filter(c => num(c.f.fee) != null).map(c => num(c.f.fee) - (num(c.f.tech) || 0) - (num(c.f.cons) || 0) - num(c.f.fee) * 0.0195);
    const disputed = paidC.filter(c => c.f.disputed === 'yes');
    const disputeCost = mean(disputed.map(c => num(c.f.disputeCost)).filter(v => v != null)) || 0;
    const contrib = perCheck.length ? mean(perCheck) - (paidC.length ? disputed.length / paidC.length : 0) * disputeCost : null;
    const payers = { buyer: 0, shop: 0, other: 0 };
    for (const c of paidC) { if (c.f.payer === 'buyer') payers.buyer++; else if (c.f.payer === 'shop') payers.shop++; else if (c.f.payer === 'other') payers.other++; }
    const batches = Bl.filter(c => num(c.f.extra) != null && num(c.f.labour) != null);
    const positive = batches.filter(c => num(c.f.extra) - num(c.f.labour) > 0).length;
    const repeat = new Set(Bl.filter(c => c.f.repeat === 'yes').map(c => (c.f.trader || c.id).trim().toUpperCase())).size;
    const routeDays = R.filter(c => [c.f.fills, c.f.m, c.f.round].every(v => num(v) != null)).map(c => num(c.f.fills) * num(c.f.m) - num(c.f.round));
    return { H, F, Bl, R, offers, paid: paidC.length, shops, again, contrib, payers, batches: batches.length, positive, repeat, routeContrib: mean(routeDays), auto: { handset: H.length, fault: F.length, bale: Bl.length, offer: offers, route: R.length } };
  }

  // ---------- tabs ----------
  const tabs = $$('[data-ftab]', root), panels = $$('[data-fpanel]', root);
  function showTab(name, write = true) {
    if (!panels.some(p => p.dataset.fpanel === name)) name = 'plan';
    for (const t of tabs) t.setAttribute('aria-selected', String(t.dataset.ftab === name));
    for (const p of panels) p.hidden = p.dataset.fpanel !== name;
    if (write) { const u = new URL(location.href); if (name === 'plan') u.searchParams.delete('tab'); else u.searchParams.set('tab', name); history.replaceState(null, '', u.pathname + u.search); }
  }
  for (const t of tabs) t.addEventListener('click', () => showTab(t.dataset.ftab));
  addEventListener('popstate', () => showTab(new URLSearchParams(location.search).get('tab') || 'plan', false));

  // ---------- plan ----------
  const startInput = $('#f-start');
  startInput.value = state.start || '';
  startInput.addEventListener('change', () => { state.start = startInput.value; save(); });
  const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const startDate = () => (state.start ? new Date(state.start + 'T00:00:00') : null);
  const dayNumber = () => { const s = startDate(); return s ? Math.floor((today() - s) / DAY) + 1 : null; };
  const dateLabel = d => d.toLocaleDateString(cfg.locale, { day: 'numeric', month: 'short' });
  function renderDay() {
    const el = $('[data-day]'), d = dayNumber();
    if (d == null) { el.hidden = true; return; }
    el.hidden = false;
    el.textContent = d < 1 ? fmt(S.before, 1 - d) : d > 30 ? S.after : fmt(S.dayOf, d, 30);
  }
  function renderPlan(x) {
    const s = startDate(), d = dayNumber();
    $('[data-plan]', root).innerHTML = cfg.phases.map(([a, b], i) => {
      const range = s ? ` · ${dateLabel(new Date(+s + (a - 1) * DAY))}–${dateLabel(new Date(+s + (b - 1) * DAY))}` : '';
      const current = d != null && d >= a && d <= b;
      const rows = cfg.tasks.filter(t => t.phase === i).map(t => {
        const v = t.auto ? x.auto[t.auto] : (state.tasks[t.id] || 0);
        const pct = t.target ? Math.min(100, v / t.target * 100) : 0;
        const done = t.target && v >= t.target;
        const control = t.auto ? `<span class="t-auto">${esc(S.fromCases)}</span>`
          : t.number ? `<input type="number" inputmode="numeric" min="0" class="t-num" data-task-num="${t.id}" value="${state.tasks[t.id] ?? ''}" aria-label="${esc(S.tasks[t.id])}">`
          : `<span class="t-ctl"><button type="button" data-task="${t.id}" data-step="-1" aria-label="${esc(S.less)}">−</button><button type="button" data-task="${t.id}" data-step="1" aria-label="${esc(S.more)}">+</button></span>`;
        return `<li class="task${done ? ' done' : ''}"><div class="t-main"><span class="t-label">${esc(S.tasks[t.id])}</span>${t.number ? '' : `<span class="t-count"><b>${v}</b>${t.target ? ` / ${t.target}` : ''}</span>`}${control}</div>${t.target ? `<span class="t-bar"><i style="width:${pct}%"></i></span>` : ''}</li>`;
      }).join('');
      return `<section class="phase${current ? ' current' : ''}"><h3>${esc(S.phases[i])}<span>${esc(range)}</span></h3><ul>${rows}</ul></section>`;
    }).join('');
  }
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-task]');
    if (!b) return;
    const id = b.dataset.task;
    state.tasks[id] = Math.max(0, (state.tasks[id] || 0) + Number(b.dataset.step));
    save();
  });
  root.addEventListener('change', e => {
    const n = e.target.closest('[data-task-num]');
    if (n) { state.tasks[n.dataset.taskNum] = num(n.value); save(); }
    const m = e.target.closest('[data-manual]');
    if (m) { state.manual[m.dataset.manual] = m.value; save(); }
  });

  // ---------- interview ----------
  const overlay = $('[data-interview]', root);
  let qi = 0;
  function showQuestion(i) {
    qi = Math.max(0, Math.min(cfg.questions.length - 1, i));
    const q = cfg.questions[qi];
    $('[data-q-count]', overlay).textContent = fmt(S.interview.of, qi + 1, cfg.questions.length);
    $('[data-q-en]', overlay).innerHTML = q.en;
    const local = $('[data-q-local]', overlay);
    local.hidden = !q.local; local.innerHTML = q.local || '';
    $('[data-q-prev]', overlay).disabled = qi === 0;
    $('[data-q-next]', overlay).disabled = qi === cfg.questions.length - 1;
  }
  $('[data-interview-start]', root)?.addEventListener('click', () => { overlay.hidden = false; document.body.classList.add('no-scroll'); showQuestion(0); $('[data-q-next]', overlay).focus(); });
  const closeInterview = () => { overlay.hidden = true; document.body.classList.remove('no-scroll'); };
  $('[data-q-prev]', overlay).addEventListener('click', () => showQuestion(qi - 1));
  $('[data-q-next]', overlay).addEventListener('click', () => showQuestion(qi + 1));
  $('[data-q-close]', overlay).addEventListener('click', closeInterview);
  $('[data-q-log]', overlay).addEventListener('click', () => { closeInterview(); showTab('cases'); openForm(null, 'note'); });
  document.addEventListener('keydown', e => {
    if (overlay.hidden) return;
    if (e.key === 'ArrowRight') showQuestion(qi + 1);
    if (e.key === 'ArrowLeft') showQuestion(qi - 1);
    if (e.key === 'Escape') closeInterview();
  });

  // ---------- cases ----------
  const FIELDS = {
    handset: [['shop', 'text', 'shopHint'], ['offered', 'yn'], ['paid', 'yn'], ['payer', 'payer'], ['fee', 'num'], ['tech', 'num'], ['cons', 'num'], ['disputed', 'yn'], ['disputeCost', 'num'], ['again', 'yn']],
    fault: [['shop', 'text', 'shopHint'], ['resolvedFree', 'yn'], ['cost', 'num'], ['visits', 'num'], ['payer', 'payer']],
    bale: [['trader', 'text', 'traderHint'], ['category', 'text'], ['pieces', 'num'], ['extra', 'num'], ['labour', 'num'], ['serviceFee', 'num'], ['repeat', 'yn']],
    route: [['route', 'text'], ['fills', 'num'], ['rejected', 'num'], ['missed', 'num'], ['m', 'num'], ['round', 'num']],
    note: [],
  };
  const formBox = $('[data-case-form]', root);
  let editing = null;
  const isoToday = () => { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
  function options(map, value) { return Object.entries(map).map(([k, v]) => `<option value="${k}"${k === value ? ' selected' : ''}>${esc(v)}</option>`).join(''); }
  function fieldHtml([key, kind, hint], value) {
    const id = `cf-${key}`, label = L.f[key];
    const hintHtml = hint ? `<p class="hint" id="${id}-h">${esc(L.f[hint])}</p>` : '';
    if (kind === 'yn') return `<fieldset class="fld yn"><legend>${esc(label)}</legend><div class="seg">${['yes', 'no', 'unknown'].map(v => `<label><input type="radio" name="${key}" value="${v}"${(value || 'unknown') === v ? ' checked' : ''}><span>${esc(L[v])}</span></label>`).join('')}</div></fieldset>`;
    if (kind === 'payer') return `<div class="fld"><label for="${id}">${esc(label)}</label><select id="${id}" name="${key}">${options(L.payers, value || 'unknown')}</select></div>`;
    if (kind === 'num') return `<div class="fld"><label for="${id}">${esc(label)}</label><input id="${id}" name="${key}" type="number" inputmode="decimal" step="any" min="0" value="${value ?? ''}"></div>`;
    return `<div class="fld"><label for="${id}">${esc(label)}</label>${hintHtml}<input id="${id}" name="${key}" type="text" autocomplete="off" value="${esc(value ?? '')}"${hint ? ` aria-describedby="${id}-h"` : ''}></div>`;
  }
  function openForm(id, type) {
    const c = id ? state.cases.find(x => x.id === id) : null;
    editing = c ? c.id : null;
    const t = c ? c.type : type || 'handset';
    formBox.hidden = false;
    formBox.innerHTML = `<form class="case-form" novalidate>
      <div class="fld"><label for="cf-type">${esc(L.type)}</label><select id="cf-type" name="type">${options(L.types, t)}</select></div>
      <div class="fld-row"><div class="fld"><label for="cf-date">${esc(L.date)}</label><input id="cf-date" name="date" type="date" value="${c ? c.date : isoToday()}" required></div>
      <div class="fld"><label for="cf-place">${esc(L.place)}</label><select id="cf-place" name="place">${options(L.places, c ? c.place : t === 'bale' ? 'kantamanto' : 'circle')}</select></div></div>
      <div class="fld"><label for="cf-evidence">${esc(L.evidence)}</label><select id="cf-evidence" name="evidence">${options(L.evidenceTypes, c ? c.evidence : 'observation')}</select></div>
      <p class="hint">${esc(L.unknownHint)}</p>
      <div class="fld-grid" data-type-fields>${FIELDS[t].map(f => fieldHtml(f, c?.f[f[0]])).join('')}</div>
      <div class="fld"><label for="cf-note">${esc(L.note)} <span class="opt">${esc(L.optional)}</span></label><textarea id="cf-note" name="note" rows="3">${esc(c?.note || '')}</textarea></div>
      <div class="form-actions"><button type="submit" class="btn-solid">${esc(L.save)}</button><button type="button" class="btn-ghost" data-form-cancel>${esc(L.cancel)}</button></div></form>`;
    const form = $('form', formBox);
    $('#cf-type', form).addEventListener('change', e => { $('[data-type-fields]', form).innerHTML = FIELDS[e.target.value].map(f => fieldHtml(f)).join(''); });
    $('[data-form-cancel]', form).addEventListener('click', () => { formBox.hidden = true; formBox.innerHTML = ''; });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const data = new FormData(form), type = data.get('type');
      const f = {};
      for (const [key, kind] of FIELDS[type]) f[key] = kind === 'num' ? num(data.get(key)) : (data.get(key) ?? '').toString().trim();
      const rec = { type, date: data.get('date') || isoToday(), place: data.get('place'), evidence: data.get('evidence'), f, note: (data.get('note') || '').toString().trim() };
      if (editing) Object.assign(state.cases.find(x => x.id === editing), rec);
      else { const n = state.cases.reduce((m, x) => Math.max(m, Number(x.id.slice(2)) || 0), 0) + 1; state.cases.push({ id: `C-${String(n).padStart(3, '0')}`, created: new Date().toISOString(), ...rec }); }
      formBox.hidden = true; formBox.innerHTML = '';
      save();
    });
    formBox.scrollIntoView({ block: 'start', behavior: 'instant' });
    $('#cf-type', form).focus({ preventScroll: true });
  }
  $('[data-case-add]', root).addEventListener('click', () => openForm(null));
  function caseSummary(c) {
    const f = c.f, yn = v => (v === 'yes' ? L.yes : v === 'no' ? L.no : L.unknown);
    const money = v => (v == null ? L.unknown : `GHS ${nf(v, v % 1 ? 2 : 0)}`);
    if (c.type === 'handset') return [`${L.f.shop} ${f.shop || '–'}`, `${L.f.offered}: ${yn(f.offered)}`, `${L.f.paid}: ${yn(f.paid)}`, `${L.f.fee.replace(/ \(GHS\)|（GHS）/, '')}: ${money(f.fee)}`];
    if (c.type === 'fault') return [`${L.f.shop} ${f.shop || '–'}`, `${L.f.resolvedFree}: ${yn(f.resolvedFree)}`, `${L.f.cost.replace(/ \(GHS\)|（GHS）/, '')}: ${money(f.cost)}`];
    if (c.type === 'bale') return [`${L.f.trader} ${f.trader || '–'}`, `${L.f.pieces}: ${f.pieces ?? L.unknown}`, `${L.f.extra.replace(/ \(GHS\)|（GHS）/, '')}: ${money(f.extra)}`, `${L.f.labour.replace(/ \(GHS\)|（GHS）/, '')}: ${money(f.labour)}`];
    if (c.type === 'route') return [`${L.f.route} ${f.route || '–'}`, `${L.f.fills}: ${f.fills ?? L.unknown}`, `${L.f.round.replace(/ \(GHS\)|（GHS）/, '')}: ${money(f.round)}`];
    return [];
  }
  function renderCases() {
    const list = $('[data-cases]', root);
    $('[data-case-count]', root).textContent = state.cases.length;
    if (!state.cases.length) { list.innerHTML = `<p class="empty">${esc(L.empty)}</p>`; return; }
    list.innerHTML = state.cases.slice().reverse().map(c => `<article class="case" id="${c.id}"><header><span class="c-id">${c.id}</span><span class="c-type">${esc(L.types[c.type])}</span><span class="c-date">${esc(c.date)}</span></header>
      <p class="c-meta">${esc(L.places[c.place] || '')} · ${esc(L.evidenceTypes[c.evidence] || '')}</p>
      ${caseSummary(c).length ? `<p class="c-sum">${caseSummary(c).map(esc).join(' · ')}</p>` : ''}${c.note ? `<p class="c-note">${esc(c.note)}</p>` : ''}
      <div class="c-actions"><button type="button" data-case-edit="${c.id}">${esc(L.edit)}</button><button type="button" data-case-del="${c.id}">${esc(L.del)}</button></div></article>`).join('');
  }
  root.addEventListener('click', e => {
    const ed = e.target.closest('[data-case-edit]'); if (ed) openForm(ed.dataset.caseEdit);
    const del = e.target.closest('[data-case-del]');
    if (del && confirm(L.confirmDel)) { state.cases = state.cases.filter(c => c.id !== del.dataset.caseDel); save(); }
  });

  // ---------- day 30 board ----------
  function chip(status) { const t = { met: B.met, not: B.notYet, stop: B.stop, none: B.noData }[status]; return `<span class="chip ${status}">${esc(t)}</span>`; }
  function row(label, value, threshold, status) { return `<tr><th scope="row">${esc(label)}</th><td class="v">${esc(value)}</td><td class="t">${esc(threshold || '')}</td><td>${status ? chip(status) : ''}</td></tr>`; }
  function manualSelect(key) { const v = state.manual[key] || 'unknown'; return `<select data-manual="${key}" aria-label="${esc(B.rows[key])}">${['unknown', 'yes', 'no'].map(o => `<option value="${o}"${o === v ? ' selected' : ''}>${esc(L[o])}</option>`).join('')}</select>`; }
  function renderBoard(x) {
    const r = B.rows, money = v => (v == null ? '–' : `GHS ${nf(v, 2)}`);
    const paidStatus = x.paid >= 6 ? 'met' : x.offers >= 30 && x.paid === 0 ? 'stop' : x.offers ? 'not' : 'none';
    const batchStatus = x.positive >= 3 ? 'met' : x.batches >= 4 && x.positive === 0 ? 'stop' : x.batches ? 'not' : 'none';
    const dir = (i, rows, note = '') => `<section class="dir-card"><h3>${esc(B.dirs[i])}</h3><details><summary>${esc(B.reportSays)}</summary><p>${cfg.thresholds[i].cont}</p><p class="stop-text">${cfg.thresholds[i].stop}</p></details><div class="board-table"><table><tbody>${rows}</tbody></table></div>${note}</section>`;
    $('[data-board]', root).innerHTML =
      dir(0, row(r.paid, fmt(r.paidV, x.paid, x.offers), r.paidT, paidStatus)
        + row(r.shops, String(x.shops), r.shopsT, x.shops >= 3 ? 'met' : x.paid ? 'not' : 'none')
        + row(r.again, String(x.again), r.againT, x.again >= 2 ? 'met' : x.H.length ? 'not' : 'none')
        + row(r.contrib, money(x.contrib), r.contribT, x.contrib == null ? 'none' : x.contrib > 0 ? 'met' : 'not')
        + row(r.payers, fmt(r.payersV, x.payers.buyer, x.payers.shop, x.payers.other), '', null),
        `${paidStatus === 'stop' ? `<p class="stop-line">${esc(B.stopPaid)}</p>` : ''}<p class="note">${esc(B.gateway)}</p>`)
      + dir(1, row(r.repeat, String(x.repeat), r.repeatT, x.repeat >= 2 ? 'met' : x.Bl.length ? 'not' : 'none')
        + row(r.batches, fmt(r.batchesV, x.positive, x.batches), r.batchesT, batchStatus),
        batchStatus === 'stop' ? `<p class="stop-line">${esc(B.stopBatches)}</p>` : '')
      + dir(2, row(r.records, String(x.R.length), r.recordsT, x.R.length ? 'met' : 'none')
        + row(r.routeContrib, money(x.routeContrib), r.routeContribT, x.routeContrib == null ? 'none' : x.routeContrib > 0 ? 'met' : 'not')
        + `<tr><th scope="row">${esc(r.fewer)}</th><td class="v" colspan="2">${manualSelect('fewer')}</td><td>${chip(state.manual.fewer === 'yes' ? 'met' : state.manual.fewer === 'no' ? 'not' : 'none')}</td></tr>`
        + `<tr><th scope="row">${esc(r.distributor)}</th><td class="v" colspan="2">${manualSelect('distributor')}</td><td>${chip(state.manual.distributor === 'yes' ? 'met' : state.manual.distributor === 'no' ? 'not' : 'none')}</td></tr>`);
  }

  // ---------- data ----------
  function download(name, text, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name; document.body.append(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  const stamp = () => new Date().toISOString().slice(0, 10);
  $('[data-export-csv]', root).addEventListener('click', () => {
    const keys = [...new Set(Object.values(FIELDS).flat().map(f => f[0]))];
    const cols = ['id', 'type', 'date', 'place', 'evidence', ...keys, 'note', 'created'];
    const cell = v => { const s = v == null ? '' : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    const rows = state.cases.map(c => cols.map(k => cell(k in c ? c[k] : c.f[k])).join(','));
    download(`circular-africa-field-${stamp()}.csv`, '﻿' + [cols.join(','), ...rows].join('\r\n') + '\r\n', 'text/csv');
  });
  $('[data-export-json]', root).addEventListener('click', () => download(`circular-africa-field-${stamp()}.json`, JSON.stringify(state, null, 1), 'application/json'));
  $('[data-import]', root).addEventListener('change', async e => {
    const file = e.target.files[0]; if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data.cases)) throw new Error('no cases');
      const ids = new Set(state.cases.map(c => c.id));
      let n = 0;
      for (const c of data.cases) { if (!c || !c.type || !c.f) continue; if (ids.has(c.id)) { const max = state.cases.reduce((m, x) => Math.max(m, Number(x.id.slice(2)) || 0), 0) + 1; c.id = `C-${String(max).padStart(3, '0')}`; } state.cases.push(c); ids.add(c.id); n++; }
      if (data.start && !state.start) state.start = data.start;
      for (const [k, v] of Object.entries(data.tasks || {})) state.tasks[k] = Math.max(state.tasks[k] || 0, v || 0);
      save();
      $('[data-import-msg]', root).textContent = fmt(S.data.imported, n);
    } catch { $('[data-import-msg]', root).textContent = '×'; }
    e.target.value = '';
  });
  $('[data-clear-all]', root).addEventListener('click', () => { if (confirm(S.data.confirmClear)) { state = { start: '', tasks: {}, cases: [], manual: {} }; startInput.value = ''; save(); } });

  // ---------- render ----------
  function render() {
    const x = derive();
    renderDay(); renderPlan(x); renderCases(); renderBoard(x);
    $('[data-storage-warning]').hidden = stored;
  }
  showTab(new URLSearchParams(location.search).get('tab') || 'plan', false);
  render();
})();
