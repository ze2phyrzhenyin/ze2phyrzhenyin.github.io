// Builds /guides/circular-africa/ (report, source directory, prompt) in English, Spanish and Chinese.
//   node resources/circular-africa/build.mjs            build into public/guides/circular-africa/
//   node resources/circular-africa/build.mjs --merge    first merge translate/<lang>/*.json into content/strings.<lang>.json
// Inputs: content/structure.json + content/strings.<lang>.json (parse.mjs), ui.mjs, assets/.
import { readFile, writeFile, mkdir, copyFile, readdir, rm } from 'node:fs/promises';
import { LOCALES, ui, parts, version, formatDate } from './ui.mjs';
import { FIELD, EXTRA_UI, PLAN_TASKS, PHASES } from './fieldui.mjs';
import { VIEW_OF, PARENT, CHILDREN, CHIPS, MARKERS, BLOCKS, EVENTS, REGION, SEARCH, NAMES, ROLES, FIGURES, EXPLORE_UI } from './places.mjs';

const here = new URL('./', import.meta.url);
const outRoot = new URL('../../public/guides/circular-africa/', here);
const ROUTE = '/guides/circular-africa';
const ORIGIN = 'https://zhaoyang.fr';
const ASSET_V = `v${version.n}-${version.iso.replace(/\D/g, '').slice(0, 12)}`;
const json = async path => JSON.parse(await readFile(new URL(path, here), 'utf8'));

// ---------- strings ----------
if (process.argv.includes('--merge')) {
  const st = await json('content/structure.json'), sourceEn = await json('content/strings.en.json');
  const overrides = await json('translate/overrides.json').catch(() => ({}));
  const keepEnglish = new Set(st.report.chapters.find(c => c.id === 'search').blocks.filter(b => b.t === 'table').flatMap(b => b.rows.map(r => r[0])));
  const pb = st.prompt.blocks;
  for (let i = 0; i < pb.length - 1; i++) {
    const t = pb[i].t === 'p' ? sourceEn[pb[i].s] : '';
    if (/^(Examples include:|Actively search for counterexamples)/.test(t) && pb[i + 1].t === 'ul') pb[i + 1].items.forEach(id => keepEnglish.add(id));
  }
  for (const lang of ['zh', 'es']) {
    const dir = new URL(`translate/${lang}/`, here);
    const merged = {};
    for (const f of (await readdir(dir)).filter(f => f.endsWith('.json')).sort()) Object.assign(merged, JSON.parse(await readFile(new URL(f, dir), 'utf8')));
    // Search queries are typed into a search engine: they stay exactly as in the English source.
    for (const id of keepEnglish) merged[id] = sourceEn[id];
    // One spelling across the chunks translated separately.
    const normalise = { es: [[/\bcostes\b/g, 'costos'], [/\bCostes\b/g, 'Costos'], [/\bcoste\b/g, 'costo'], [/\bCoste\b/g, 'Costo'], [/^Observado:/, 'Observada:']], zh: [] }[lang];
    for (const id of Object.keys(merged)) for (const [re, to] of normalise) merged[id] = merged[id].replace(re, to);
    for (const [id, text] of Object.entries(overrides[lang] || {})) merged[id] = text;
    await writeFile(new URL(`content/strings.${lang}.json`, here), JSON.stringify(merged, null, 1));
    console.log(`merged ${lang}: ${Object.keys(merged).length} strings`);
  }
}
const structure = await json('content/structure.json');
const strings = {};
for (const lang of LOCALES) strings[lang] = await json(`content/strings.${lang}.json`).catch(() => ({}));
const en = strings.en;
const draft = process.argv.includes('--draft');
for (const lang of LOCALES) {
  const missing = Object.keys(en).filter(id => !strings[lang][id]);
  if (missing.length && draft) { console.warn(`${lang}: ${missing.length} strings missing, English used (draft build)`); for (const id of missing) strings[lang][id] = en[id]; continue; }
  if (missing.length) throw new Error(`${lang}: ${missing.length} strings missing, e.g. ${missing.slice(0, 3).join(', ')}`);
}
const map = await json('assets/map.json');

// ---------- helpers ----------
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const attr = esc;
function inline(text, ctx = {}) {
  if (text == null) return '';
  const links = [];
  let t = String(text).replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => { links.push([label, url]); return `\u0000${links.length - 1}\u0000`; });
  t = esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  if (ctx.sid) t = t.replace(/\b(S\d{3})(?:-\d{2})?\b/g, m => `<a class="sid" href="${ctx.sid}#${m.slice(0, 4)}">${m}</a>`);
  return t.replace(/\u0000(\d+)\u0000/g, (_, i) => {
    const [label, url] = links[i];
    const inner = esc(label).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    if (url.startsWith('#')) return `<a href="${attr((ctx.anchorBase ?? '') + url.replace(/_\d+$/, ''))}">${inner}</a>`;
    return `<a href="${attr(url)}" target="_blank" rel="noopener">${inner}</a>`;
  });
}
const T = (lang, id) => (id ? strings[lang][id] : '');
const I = (lang, id, ctx) => inline(T(lang, id), ctx);
const plainText = s => String(s ?? '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*/g, '');
function runIn(lang, id, ctx) {
  // A paragraph that opens with a bold phrase becomes a small heading plus text.
  const text = T(lang, id);
  const m = text.match(/^\*\*([^*]{1,140}?)\*\*\s*([\s\S]*)$/);
  if (!m || !m[2]) return `<p data-s="${id}">${inline(text, ctx)}</p>`;
  const head = m[1].replace(/[.。:：]\s*$/, '');
  return `<h3 class="runin">${inline(head, ctx)}</h3><p data-s="${id}">${inline(m[2], ctx)}</p>`;
}
const fmt = (n, d = 0) => Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

function table(lang, block, ctx, cls = '') {
  const head = block.head.map(id => plainText(T(lang, id)));
  return `<div class="table-wrap"><table class="${cls}"><thead><tr>${block.head.map(id => `<th scope="col">${I(lang, id, ctx)}</th>`).join('')}</tr></thead><tbody>${block.rows.map(r => `<tr>${r.map((id, i) => `<td data-label="${attr(head[i])}" data-s="${id}">${I(lang, id, ctx)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

// ---------- map explorer ----------
const enIds = Object.keys(en);
function byPrefix(prefix) {
  const ids = enIds.filter(id => en[id].startsWith(prefix));
  if (ids.length < 1) throw new Error(`no English string starts with «${prefix}»`);
  return ids[0];
}
const chap = id => structure.report.chapters.find(c => c.id === id);
const tableOf = id => chap(id).blocks.find(b => b.t === 'table');
const dirById = new Map([...structure.directory.events, ...structure.directory.research].map(e => [e.id, e]));
const oppById = new Map(structure.directory.opportunities.map(o => [o.id, o]));
const compById = new Map(structure.directory.companies.map(c => [c.id, c]));
const entryById = new Map(structure.directory.entries.map(e => [e.id, e]));
const regionCount = r => structure.directory.entries.filter(e => e.regions.includes(r)).length;
const searchCount = q => structure.directory.entries.filter(e => [e.name, e.title, en[e.question], en[e.geo], en[e.topics]].join(' ').includes(q)).length;

function placePanel(lang, id) {
  const x = EXPLORE_UI[lang], d = ui[lang].dir;
  const name = NAMES[id][lang];
  const crumbs = [];
  for (let p = PARENT[id]; p; p = PARENT[p]) crumbs.unshift(p);
  const crumbHtml = `<nav class="pl-crumbs" aria-label="${attr(x.onMap)}"><button type="button" data-go="">${esc(lang === 'zh' ? '非洲' : lang === 'es' ? 'África' : 'Africa')}</button>${crumbs.map(p => `<span aria-hidden="true">/</span><button type="button" data-go="${p}">${esc(NAMES[p][lang])}</button>`).join('')}</nav>`;
  const figs = FIGURES[id]?.[lang] || [];
  const figHtml = figs.length ? `<dl class="pl-figs">${figs.map(([v, l]) => `<div><dd>${esc(v)}</dd><dt>${esc(l)}</dt></div>`).join('')}</dl>` : '';
  const chapters = new Set();
  const blocks = (BLOCKS[id] || []).map(b => {
    if (b.chapter) chapters.add(b.chapter);
    if (b.p) {
      const sid = byPrefix(b.p);
      const text = T(lang, sid);
      const m = text.match(/^\*\*([^*]{1,140}?)\*\*\s*([\s\S]*)$/);
      const head = m ? m[1].replace(/[.。:：]\s*$/, '') : plainText(T(lang, chap(b.chapter).title));
      return `<section class="pl-block"><h3>${inline(head)}</h3><p>${inline(m ? m[2] : text)}</p></section>`;
    }
    if (b.cells) {
      const [cid, row, cols] = b.cells, t = tableOf(cid);
      return cols.map(c => `<section class="pl-block"><h3>${I(lang, t.head[c])}</h3><p>${I(lang, t.rows[row][c])}</p></section>`).join('');
    }
    if (b.row) {
      const [cid, row] = b.row, t = tableOf(cid), r = t.rows[row];
      return `<section class="pl-block"><h3>${I(lang, r[0])}</h3><p>${I(lang, r[2])}</p><p class="pl-small"><em>${I(lang, t.head[1])}</em> ${I(lang, r[1])}</p></section>`;
    }
    if (b.opp) {
      const o = oppById.get(b.opp);
      return `<section class="pl-block"><h3>${esc(o.title)}</h3><p class="pl-status">${I(lang, o.status)}</p><dl class="fields">${[['eligibility', o.eligibility], ['fee', o.fee], ['date', o.date], ['next', o.next]].map(([k, v]) => `<div><dt>${esc(d.fields[k])}</dt><dd>${I(lang, v)}</dd></div>`).join('')}</dl><p><a href="${attr(o.url)}" target="_blank" rel="noopener">${esc(d.links.official)}</a></p></section>`;
    }
    if (b.company) {
      const c = compById.get(b.company);
      return `<section class="pl-block"><h3>${esc(c.name)}</h3><dl class="fields">${[['customers', c.customers], ['charges', c.charges], ['evidence', c.evidence], ['lesson', c.lesson], ['limit', c.limit]].map(([k, v]) => `<div><dt>${esc(d.fields[k])}</dt><dd>${I(lang, v)}</dd></div>`).join('')}</dl><p><a href="${attr(c.url)}" target="_blank" rel="noopener">${esc(d.links.caseSource)}</a></p></section>`;
    }
    if (b.entry) {
      const e = entryById.get(b.entry);
      return `<section class="pl-block"><h3>${esc(e.name)}</h3><p>${I(lang, e.question)}</p><p class="pl-small"><em>${esc(d.fields.limit)}</em> ${I(lang, e.limit)}</p><p><a href="${attr(e.url)}" target="_blank" rel="noopener">${esc(e.title)}</a></p></section>`;
    }
    return '';
  }).join('');
  const kids = CHILDREN[id] ? `<section class="pl-block"><h3>${esc(x.inside)}</h3><ul class="pl-kids">${CHILDREN[id].map(k => `<li><button type="button" data-go="${k}"><span>${esc(NAMES[k][lang])}</span><small>${esc(ROLES[k][lang])}</small></button></li>`).join('')}</ul></section>` : '';
  const evs = (EVENTS[id] || []).map(e => dirById.get(e));
  const evHtml = evs.length ? `<section class="pl-block"><h3>${esc(x.events)}</h3><ol class="pl-events">${evs.map(e => `<li><a href="sources/?view=news#${e.id}"><span class="pl-when">${esc(plainText(T(lang, e.period)).replace(/\.$/, ''))}</span><span>${esc(plainText(T(lang, e.topic)))}</span></a></li>`).join('')}</ol></section>` : '';
  const links = [];
  if (REGION[id]) links.push(`<a href="sources/?region=${REGION[id]}">${esc(x.inDirectory(regionCount(REGION[id])))}</a>`);
  if (SEARCH[id] && searchCount(SEARCH[id])) links.push(`<a href="sources/?q=${encodeURIComponent(SEARCH[id])}">${esc(x.search(SEARCH[id]))}</a>`);
  const chapterLinks = [...chapters].map(c => `<a href="#${c}" data-close-panel>${esc(ui[lang].chapters[c])}</a>`);
  const linkHtml = links.length || chapterLinks.length ? `<div class="pl-links">${links.length ? `<p>${links.join('')}</p>` : ''}${chapterLinks.length ? `<p><span>${esc(x.report)}</span>${chapterLinks.join('')}</p>` : ''}</div>` : '';
  return `<template data-place="${id}" data-view="${VIEW_OF[id]}">${crumbHtml}<header class="pl-head"><h2>${esc(name)}</h2><p class="pl-role">${esc(ROLES[id][lang])}</p></header>${figHtml}${kids}${blocks}${evHtml}${linkHtml}</template>`;
}

function explorerMap(lang) {
  const x = EXPLORE_UI[lang];
  const P = map.points;
  const countries = Object.entries(map.countries).map(([id, dd]) => `<path class="m-c${id === 'ghana' ? ' m-gh' : ''}" d="${dd}" data-go="${id}" data-tip="${attr(`${NAMES[id][lang]} · ${ROLES[id][lang]}`)}"/>`).join('');
  const [ex, ey] = P.enchi, [kx, ky] = P.kumasi, [ax, ay] = P.accra;
  const route = (id, dd, cls) => `<g class="m-route ${cls}" data-go="${id}" data-tip="${attr(`${NAMES[id][lang]} · ${ROLES[id][lang]}`)}"><path class="hit" d="${dd}"/><path class="line" d="${dd}"/></g>`;
  const routes = `<g class="m-routes" data-views="ghana">${route('parcel', `M${ax} ${ay} L${kx} ${ky}`, 'parcel')}${route('enchi', `M${ex} ${ey} Q${(ex + kx) / 2 - 2} ${(ey + ky) / 2 - 6} ${kx} ${ky}`, 'trip')}</g>`;
  const marks = MARKERS.map(m => {
    const [mx, my] = P[m.pt];
    const label = NAMES[m.pt]?.[lang] || NAMES[m.go][lang];
    const text = m.pt === 'enchi' ? 'Enchi' : label;
    return `<g class="mk${m.primary ? ' primary' : ''}" data-go="${m.go}" data-views="${m.views.join(' ')}" data-x="${mx}" data-y="${my}" transform="translate(${mx} ${my})" tabindex="0" role="button" aria-label="${attr(`${label} · ${ROLES[m.go][lang]}`)}" data-tip="${attr(`${label} · ${ROLES[m.go][lang]}`)}"><circle class="hit" r="13"/><circle class="dot" r="${m.primary ? 4.6 : 3.6}"/><text x="${m.dx}" y="${m.dy}" text-anchor="${m.anchor || 'start'}">${esc(text)}</text></g>`;
  }).join('');
  const boxes = Object.fromEntries(Object.entries(map.boxes).map(([k, v]) => [k, v]));
  return `<div class="map-wrap" data-map data-boxes="${attr(JSON.stringify(boxes))}" data-km="${map.kmPerUnit}">
  <svg class="africa-map" viewBox="${map.viewBox.join(' ')}" role="group" aria-label="${attr(x.mapLabel)}">
  <path class="m-land" d="${map.base}"/><g class="m-countries">${countries}</g><path class="m-lakes" d="${map.lakes}"/><path class="m-rivers" d="${map.rivers}"/>${routes}<g class="m-marks">${marks}</g></svg>
  <button type="button" class="map-all" data-go="" hidden>${esc(x.all)}</button>
  <div class="map-scale" aria-hidden="true"><i></i><span></span></div>
  </div>`;
}
function placeChips(lang) {
  const x = EXPLORE_UI[lang];
  return `<div class="chips"><p>${esc(x.onMap)}</p><ul>${CHIPS.map(id => `<li><button type="button" data-go="${id}">${esc(NAMES[id][lang])}</button></li>`).join('')}</ul></div>`;
}

// ---------- components ----------
function slider(id, label, unit, min, max, step, value) {
  return `<div class="ctl"><label for="${id}">${esc(label)}</label><div class="ctl-row"><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${value}" data-default="${value}"><output for="${id}" data-unit="${attr(unit)}"></output></div></div>`;
}
function checkCalc(lang) {
  const u = ui[lang].check;
  return `<figure class="tool" data-tool="check" aria-labelledby="check-title"><figcaption id="check-title">${esc(u.title)}</figcaption>
  <div class="tool-grid"><div class="tool-controls">${slider('c-fee', u.fee, 'GHS', 5, 60, 1, 25)}${slider('c-tech', u.tech, 'GHS', 0, 40, 1, 12)}${slider('c-cons', u.consumables, 'GHS', 0, 10, 0.5, 2)}${slider('c-gate', u.gateway, '%', 0, 5, 0.05, 1.95)}${slider('c-disp', u.dispute, 'GHS', 10, 200, 5, 70)}<button type="button" class="btn-text" data-reset>${esc(u.reset)}</button></div>
  <div class="tool-out"><div class="segbar" data-segbar role="img" aria-label="${attr(u.fee)}"><span class="seg s1" data-part="tech"></span><span class="seg s2" data-part="cons"></span><span class="seg s3" data-part="pay"></span><span class="seg s4" data-part="left"></span></div>
  <ul class="seg-legend"><li><i class="k s1"></i>${esc(u.tech)} <b data-v="tech"></b></li><li><i class="k s2"></i>${esc(u.consumables)} <b data-v="cons"></b></li><li><i class="k s3"></i>${esc(u.paymentCost)} <b data-v="pay"></b></li><li><i class="k s4"></i>${esc(u.left)} <b data-v="left"></b></li></ul>
  <div class="figures"><div class="figure"><span class="f-label">${esc(u.left)}</span><span class="f-value" data-v="left-big"></span></div><div class="figure"><span class="f-label">${esc(u.breakEven)}</span><span class="f-value" data-v="be"></span></div></div>
  <p class="tool-warn" data-warn hidden>${esc(u.negative)}</p></div></div>
  <p class="tool-note">${esc(u.note)}</p></figure>`;
}
function routeCalc(lang) {
  const u = ui[lang].route;
  return `<figure class="tool" data-tool="route" aria-labelledby="route-title"><figcaption id="route-title">${esc(u.title)}</figcaption>
  <div class="tool-grid"><div class="tool-controls">${slider('r-m', u.margin, 'GHS', 0.5, 8, 0.5, 3)}${slider('r-cost', u.cost, 'GHS', 20, 150, 5, 60)}<button type="button" class="btn-text" data-reset>${esc(u.reset)}</button></div>
  <div class="tool-out"><div class="figure"><span class="f-label">${esc(u.needed)}</span><span class="f-value" data-v="fills"></span></div><div class="bottles" data-bottles aria-hidden="true"></div></div></div>
  <p class="tool-note">${esc(u.note)}</p></figure>`;
}
function estimator(lang) {
  const u = ui[lang].estimate;
  return `<figure class="tool" data-tool="estimate" aria-labelledby="est-title"><figcaption id="est-title">${esc(u.title)}</figcaption>
  <div class="tool-grid"><div class="tool-controls">${slider('e-shops', u.shops, '', 10, 25, 1, 15)}${slider('e-hand', u.handovers, '', 8, 20, 1, 12)}${slider('e-take', u.takeup, '%', 20, 40, 1, 30)}${slider('e-fee', u.fee, 'GHS', 15, 30, 1, 25)}<button type="button" class="btn-text" data-reset>${esc(u.reset)}</button></div>
  <div class="tool-out funnel"><div class="figure"><span class="f-label">${esc(u.eligible)}</span><span class="f-value" data-v="eligible"></span></div><div class="figure"><span class="f-label">${esc(u.checks)}</span><span class="f-value" data-v="checks"></span></div><div class="figure accent"><span class="f-label">${esc(u.revenue)}</span><span class="f-value" data-v="revenue"></span></div></div></div>
  <p class="tool-note">${esc(u.note)}</p></figure>`;
}
function flowFigure(lang) {
  const u = ui[lang].flow;
  return `<figure class="flow" aria-label="${attr(u.title)}"><figcaption>${esc(u.title)}</figcaption><ol>${u.steps.map(([a, b], i) => `<li class="${i === u.steps.length - 1 ? 'return' : ''}"><span class="n">${i + 1}</span><strong>${esc(a)}</strong><span>${esc(b)}</span></li>`).join('')}</ol></figure>`;
}
function baleFigure(lang) {
  const u = ui[lang].bale;
  const pieces = [];
  u.legend.forEach(([label, n], k) => { for (let j = 0; j < n; j++) pieces.push([k, label, n]); });
  // The bale as opened: the 193 counted pieces in a fixed shuffled order (the counts are the report's; the order is not data).
  let seed = 193;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = pieces.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [pieces[i], pieces[j]] = [pieces[j], pieces[i]]; }
  const cells = pieces.map(([k, label, n], i) => `<i class="b${k}" data-i="${i}" data-tip="${attr(`${label}: ${n}`)}"></i>`).join('');
  return `<figure class="bale" data-bale><figcaption>${esc(u.title)}<span>${esc(u.units)}</span></figcaption>
  <button type="button" class="btn-small" data-bale-sort aria-pressed="false" data-sort="${attr(u.sort)}" data-unsort="${attr(u.unsort)}">${esc(u.sort)}</button>
  <div class="bale-grid" role="img" aria-label="${attr(u.legend.map(([l, n]) => `${l}: ${n}`).join(', '))}">${cells}</div>
  <ul class="legend">${u.legend.map(([l, n], k) => `<li><i class="k b${k}"></i>${esc(l)} <b>${n}</b></li>`).join('')}</ul>
  <dl class="bale-sums"><div><dt>${esc(u.paid)}</dt><dd>GHS 2,200</dd></div><div><dt>${esc(u.best)}</dt><dd>GHS 1,522–1,609</dd></div><div class="neg"><dt>${esc(u.gap)}</dt><dd>GHS 591–678</dd></div></dl>
  <p class="fig-source">${esc(u.source)}</p></figure>`;
}
const EVENT_DATES = { E02: '2024-05-20', E04: '2025-01-01', E05: '2025-01-02', E06: '2025-01-06', E07: '2025-03-12', E09: '2025-04-02', E10: '2025-07-15', E11: '2025-11-20', E12: '2026-01-07', E13: '2026-01-31', E14: '2026-03-30', E16: '2026-05-11', E18: '2026-06-15', E20: '2026-09-29', E21: '2026-10-07', E17: '2026-10-15', E22: '2026-11-16' };
const eventCode = cellId => (en[cellId].match(/\[(E\d{2})\]/) || [])[1];
function eventsAxis(lang) {
  const u = ui[lang].axis;
  const rows = ['events-2024', 'events-2026'].flatMap(c => tableOf(c).rows);
  const W = 760, H = 132, x0 = 24, x1 = W - 24, base = 92;
  const t0 = Date.parse('2024-04-01'), t1 = Date.parse('2026-12-31');
  const X = iso => x0 + (Date.parse(iso) - t0) / (t1 - t0) * (x1 - x0);
  const items = rows.map(r => { const code = eventCode(r[2]); return { code, x: X(EVENT_DATES[code]), ghana: /^Ghana/.test(en[dirById.get(code).topic]), tip: `${plainText(T(lang, r[0]))} · ${plainText(T(lang, dirById.get(code).topic))}` }; }).sort((a, b) => a.x - b.x);
  let lastX = -99, level = 0;
  for (const it of items) { level = it.x - lastX < 15 ? level + 1 : 0; it.y = base - 14 - level * 17; lastX = it.x; }
  const years = ['2025', '2026'].map(y => `<line class="ax-tick" x1="${X(y + '-01-01')}" x2="${X(y + '-01-01')}" y1="${base - 70}" y2="${base + 6}"/><text class="ax-year" x="${X(y + '-01-01') + 4}" y="${base + 22}">${y}</text>`).join('') + `<text class="ax-year" x="${x0}" y="${base + 22}">2024</text>`;
  const cut = X('2026-11-28');
  const dots = items.map(it => `<g class="ax-dot${it.ghana ? ' gh' : ''}" data-event="${it.code}" tabindex="0" role="button" aria-label="${attr(it.tip)}" data-tip="${attr(it.tip)}"><line x1="${it.x}" x2="${it.x}" y1="${it.y + 6}" y2="${base}"/><circle class="hit" cx="${it.x}" cy="${it.y}" r="10"/><circle cx="${it.x}" cy="${it.y}" r="6"/></g>`).join('');
  return `<figure class="axis" data-axis><figcaption>${esc(u.title)}</figcaption><svg viewBox="0 0 ${W} ${H}" role="group" aria-label="${attr(u.title)}"><line class="ax-base" x1="${x0}" x2="${x1}" y1="${base}" y2="${base}"/>${years}<line class="ax-cut" x1="${cut}" x2="${cut}" y1="${base - 70}" y2="${base + 6}"/><text class="ax-cut-l" x="${cut - 4}" y="${base - 74}" text-anchor="end">${esc(u.cutoff)}</text>${dots}</svg><ul class="legend"><li><i class="k ax-gh"></i>${esc(u.ghana)}</li><li><i class="k ax-other"></i>${esc(u.other)}</li></ul></figure>`;
}
function columnChart({ title, unit, source, values, labels, gapAfter = null, gapLabel = '', decimals = 0, id }) {
  const W = 520, H = 260, pad = { l: 8, r: 8, t: 34, b: 42 };
  const max = Math.max(...values) * 1.12;
  const n = values.length, slot = (W - pad.l - pad.r) / (n + (gapAfter != null ? 0.6 : 0));
  const bw = Math.min(64, slot * 0.5);
  let x = pad.l, bars = '';
  values.forEach((v, i) => {
    const h = (v / max) * (H - pad.t - pad.b), cx = x + slot / 2, y = H - pad.b - h;
    bars += `<g class="col" tabindex="0" data-tip="${attr(`${labels[i]}: ${fmt(v, decimals)} ${unit}`)}"><rect class="hit" x="${cx - slot / 2}" y="${pad.t - 10}" width="${slot}" height="${H - pad.t - pad.b + 10}"/><path d="M${cx - bw / 2},${H - pad.b} V${y + 4} q0,-4 4,-4 H${cx + bw / 2 - 4} q4,0 4,4 V${H - pad.b} Z"/><text class="val" x="${cx}" y="${y - 8}" text-anchor="middle">${fmt(v, decimals)}</text><text class="lab" x="${cx}" y="${H - pad.b + 22}" text-anchor="middle">${esc(labels[i])}</text></g>`;
    x += slot;
    if (gapAfter === i) { bars += `<text class="gap" x="${x + slot * 0.3}" y="${H - pad.b + 22}" text-anchor="middle">⋯</text>`; x += slot * 0.6; }
  });
  return `<figure class="chart" id="${id}"><figcaption>${esc(title)}<span>${esc(unit)}${gapLabel ? ` · ${esc(gapLabel)}` : ''}</span></figcaption><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${attr(`${title}: ${values.map((v, i) => `${labels[i]} ${fmt(v, decimals)}`).join(', ')}`)}"><line class="base" x1="0" x2="${W}" y1="${H - pad.b}" y2="${H - pad.b}"/>${bars}</svg><p class="fig-source">${esc(source)}</p></figure>`;
}
function badiliFigure(lang) {
  const u = ui[lang].badili;
  // Widths by time: 7 days of a 365-day year, then months 1–6 (minus the first week), months 7–12.
  const days = [7, 182 - 7, 183];
  return `<figure class="badili"><figcaption>${esc(u.title)}</figcaption><div class="segbar tall">${u.segments.map(([a, b], i) => `<span class="seg w${i}" style="flex:${days[i]}" tabindex="0" data-tip="${attr(`${a}: ${b}`)}"></span>`).join('')}</div><div class="axis">${u.axis.map(t => `<span>${esc(t)}</span>`).join('')}</div><ul class="legend vertical">${u.segments.map(([a, b], i) => `<li><i class="k w${i}"></i><b>${esc(a)}</b> ${esc(b)}</li>`).join('')}</ul></figure>`;
}
function planFigure(lang) {
  const u = ui[lang].planBar;
  const days = [5, 7, 10, 8];
  return `<figure class="planbar"><figcaption>${esc(u.title)}</figcaption><ol>${u.phases.map(([a, b], i) => `<li style="flex:${days[i]}"><span class="bar p${i}"></span><b>${esc(a)}</b><span>${esc(b)}</span></li>`).join('')}</ol></figure>`;
}
function deadlines(lang) {
  const u = ui[lang].deadlines;
  return `<figure class="deadlines"><figcaption>${esc(u.title)}</figcaption><ul>${u.items.map(([iso, text, conflict]) => `<li><time datetime="${iso}">${esc(formatDate(iso + 'T12:00:00Z', lang))}</time><span class="d-text">${esc(text)}</span><span class="d-left" data-days="${iso}"${conflict ? ` data-conflict="${attr(u.conflict)}"` : ''}></span></li>`).join('')}</ul></figure>`;
}

// ---------- report ----------
function renderChapter(lang, ch, index) {
  const sid = 'sources/';
  const ctx = { sid: ch.id.startsWith('sources-') ? sid : null, anchorBase: sid };
  const blocks = ch.blocks;
  let body = '';
  const P = b => runIn(lang, b.s, ctx);
  if (ch.id === 'summary') {
    const [lead, h2, ...rest] = blocks;
    const findings = rest.slice(0, 5), tail = rest.slice(5);
    body += `<p class="lead" data-s="${lead.s}">${I(lang, lead.s, ctx)}</p>`;
    body += `<h3 class="sub">${I(lang, h2.s)}</h3><ol class="findings">${findings.map(b => {
      const m = T(lang, b.s).match(/^\*\*\s*(\d)\s*[·.、]\s*([^*]+?)\*\*\s*([\s\S]*)$/);
      if (!m) return `<li>${I(lang, b.s, ctx)}</li>`;
      return `<li><span class="fn">${m[1]}</span><h4>${inline(m[2].replace(/[.。]\s*$/, ''))}</h4><p data-s="${b.s}">${inline(m[3], ctx)}</p></li>`;
    }).join('')}</ol>`;
    body += tail.map(b => `<p class="callout" data-s="${b.s}">${I(lang, b.s, ctx)}</p>`).join('');
  } else if (ch.id.startsWith('sources-')) {
    let cards = '', other = '';
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (b.t === 'h2' && blocks[i + 1]?.t === 'p') {
        const head = T(lang, b.s), m = head.match(/^(\d{2})\s+(.+)$/);
        const text = T(lang, blocks[i + 1].s);
        const sidm = text.match(/\b(S\d{3})\b/);
        const link = text.match(/\[([^\]]+)\]\(([^)]+)\)\s*$/);
        cards += `<li class="src-card"><span class="src-n">${m ? m[1] : ''}</span><h3>${esc(m ? m[2] : head)}</h3><p>${inline(link ? text.slice(0, link.index).trim() : text, { sid })}</p><div class="src-links">${link ? `<a class="btn-link" href="${attr(link[2])}" target="_blank" rel="noopener">${esc(link[1])}</a>` : ''}${sidm ? `<a class="btn-quiet" href="${sid}#${sidm[1]}">${esc(ui[lang].sourcesCard.inDirectory)} · ${sidm[1]}</a>` : ''}</div></li>`;
        i++;
      } else if (b.t === 'p' && i === 0 && ch.id === 'sources-1') other += `<p class="callout">${I(lang, b.s, { sid })}</p>`;
      else if (b.t === 'p') other += `<p>${I(lang, b.s, { sid })}</p>`;
    }
    body += (ch.id === 'sources-1' ? other : '') + `<ol class="src-cards">${cards}</ol>` + (ch.id !== 'sources-1' ? other : '');
  } else if (ch.id === 'events-2024' || ch.id === 'events-2026') {
    const t = blocks.find(b => b.t === 'table');
    const heads = t.head.map(id => plainText(T(lang, id)));
    if (ch.id === 'events-2024') body += eventsAxis(lang);
    body += `<div class="tl-head"><span>${esc(heads[0])}<em>${esc(heads[1])}</em></span><span>${esc(heads[2])}</span></div><ol class="timeline">${t.rows.map(r => `<li id="ev-${eventCode(r[2])}"><div class="tl-when"><span class="tl-date">${I(lang, r[0], ctx)}</span><span class="tl-pub">${I(lang, r[1], ctx)}</span></div><div class="tl-what"><p data-s="${r[2]}">${I(lang, r[2], ctx)}</p></div></li>`).join('')}</ol>`;
  } else {
    let tableCount = 0;
    for (const [i, b] of blocks.entries()) {
      if (b.t === 'h2') { body += `<h3 class="sub">${I(lang, b.s, ctx)}</h3>`; }
      else if (b.t === 'table') {
        tableCount++;
        if (ch.id === 'plan') {
          body += `<div class="decisions">${b.rows.map(r => `<article class="decision"><h4>${I(lang, r[0], ctx)}</h4><div class="go"><h5>${esc(ui[lang].decision.cont)}</h5><p data-s="${r[1]}">${I(lang, r[1], ctx)}</p></div><div class="stop"><h5>${esc(ui[lang].decision.stop)}</h5><p data-s="${r[2]}">${I(lang, r[2], ctx)}</p></div></article>`).join('')}</div>`;
        } else if (ch.id === 'search') {
          body += `<div class="queries">${b.rows.map(r => `<div class="query"><div class="q-text"><code>${esc(plainText(T(lang, r[0])))}</code><button type="button" class="copy" data-copy-text="${attr(plainText(T(lang, r[0])))}">${esc(ui[lang].copy.query)}</button></div><p>${I(lang, r[1], ctx)}</p></div>`).join('')}</div>`;
        } else body += table(lang, b, ctx, `t-${ch.id}`);
      } else if (ch.id === 'questions' && /^\*\*\d\.\*\*/.test(T('en', b.s))) {
        const prev = blocks[i - 1];
        if (!prev || !/^\*\*\d\.\*\*/.test(T('en', prev.s))) body += `<ol class="questions" data-copy-list>`;
        body += `<li><span data-s="${b.s}">${inline(T(lang, b.s).replace(/^\*\*\d\.\*\*\s*/, ''))}</span></li>`;
        const next = blocks[i + 1];
        if (!next || !/^\*\*\d\.\*\*/.test(T('en', next.s))) body += `</ol><button type="button" class="copy wide" data-copy-list-btn>${esc(ui[lang].copy.questions)}</button>`;
      } else body += P(b);
      // Inserted figures, anchored to the English text so all languages get them in the same place.
      const e = b.t === 'p' ? T('en', b.s) : '';
      if (ch.id === 'handset' && e.startsWith('**Follow the handset.**')) body += flowFigure(lang);
      if (ch.id === 'handset' && e.startsWith('Service sensitivity')) body += checkCalc(lang);
      if (ch.id === 'bale' && e.startsWith('**An observed loss.**')) body += baleFigure(lang);
      if (ch.id === 'refill' && e.startsWith('**A route threshold')) body += routeCalc(lang);
      if (ch.id === 'denominators' && b.t === 'table') body += columnChart({ id: 'chart-imports', title: ui[lang].imports.title, unit: ui[lang].imports.unit, source: ui[lang].imports.source, values: [92.88, 98.35, 115.28], labels: ['2023', '2024', '2025'], decimals: 2 });
      if (ch.id === 'denominators' && e.startsWith('For a **pilot catchment**')) body += estimator(lang);
      if (ch.id === 'comparison' && e.startsWith('**Kenya · Nairobi.**')) body += `<div class="fig-pair">${badiliFigure(lang)}${columnChart({ id: 'chart-kenya', title: ui[lang].kenya.title, unit: ui[lang].kenya.unit, gapLabel: ui[lang].kenya.gap, source: ui[lang].kenya.source, values: [183830, 230535, 250527], labels: ['2021', '2024', '2025'], gapAfter: 0 })}</div>`;
      if (ch.id === 'plan' && i === 0) body += planFigure(lang);
    }
    if (ch.id === 'continental') body = `<div class="chips inline"><p>${esc(EXPLORE_UI[lang].onMap)}</p><ul>${['cote-divoire', 'nigeria', 'kenya', 'south-africa', 'morocco', 'cameroon'].map(id => `<li><button type="button" data-go="${id}" data-to-map>${esc(NAMES[id][lang])}</button></li>`).join('')}</ul></div>` + body;
    if (ch.id === 'partners') body = deadlines(lang) + body;
  }
  const num = String(index + 1).padStart(2, '0');
  return `<section class="chapter" id="${ch.id}" aria-labelledby="h-${ch.id}"><header class="ch-head"><span class="ch-num" aria-hidden="true">${num}</span><h2 id="h-${ch.id}">${I(lang, ch.title)}</h2>${ch.deck ? `<p class="deck" data-s="${ch.deck}">${I(lang, ch.deck)}</p>` : ''}${CHAPTER_PLACE[ch.id] ? `<button type="button" class="ch-map" data-go="${CHAPTER_PLACE[ch.id]}" data-to-map>${esc(EXTRA_UI[lang].onMap)}: ${esc(NAMES[CHAPTER_PLACE[ch.id]][lang])}</button>` : ''}</header>${body}</section>`;
}

const CHAPTER_PLACE = { 'where-to-start': 'ghana', fieldwork: 'adum', handset: 'circle', bale: 'kantamanto', refill: 'accra', comparison: 'kenya' };
function toc(lang, chapters) {
  const u = ui[lang];
  const idx = Object.fromEntries(chapters.map((c, i) => [c.id, i]));
  const orig = lang === 'en' ? '' : `<button type="button" class="orig-toggle" data-orig aria-pressed="false" data-on="${attr(EXTRA_UI[lang].originalOff)}" data-off="${attr(EXTRA_UI[lang].original)}">${esc(EXTRA_UI[lang].original)}</button>`;
  return `<nav class="toc" id="toc" aria-label="${attr(u.contents)}"><div class="toc-scroll">${orig}${parts.map(p => `<div class="toc-part"><p class="toc-label">${esc(u.parts[p.key])}</p><ol>${p.chapters.map(id => `<li><a href="#${id}" data-toc="${id}"><span class="toc-n">${String(idx[id] + 1).padStart(2, '0')}</span><span>${esc(u.chapters[id])}</span></a></li>`).join('')}</ol></div>`).join('')}</div></nav>`;
}

// ---------- page frame ----------
function alternates(view) {
  const path = view === 'report' ? '' : `${view}/`;
  return LOCALES.map(l => `<link rel="alternate" hreflang="${ui[l].hreflang}" href="${ORIGIN}${ROUTE}/${l}/${path}">`).join('') + `<link rel="alternate" hreflang="x-default" href="${ORIGIN}${ROUTE}/en/${path}">`;
}
function frame(lang, view, { title, description, body, toc: tocHtml = '', scripts = '' }) {
  const u = ui[lang];
  const path = view === 'report' ? '' : `${view}/`;
  const up = view === 'report' ? '' : '../';
  const navItem = (v, label) => `<a href="${up}${v === 'report' ? '' : v + '/'}"${v === view ? ' aria-current="page"' : ''}>${esc(label)}</a>`;
  const langLinks = LOCALES.map(l => `<a href="${ROUTE}/${l}/${path}" hreflang="${ui[l].hreflang}" lang="${ui[l].htmlLang}"${l === lang ? ' aria-current="true"' : ''}>${esc(ui[l].short)}</a>`).join('');
  const versionLine = u.versionLine(version.n, formatDate(version.iso, lang, true));
  return `<!doctype html>
<html lang="${u.htmlLang}" data-locale="${lang}" data-view="${view}" data-guide="circular-africa">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="/guides/theme.js?v=20260924c"></script>
<title>${esc(title)}</title>
<meta name="description" content="${attr(description)}">
<meta name="robots" content="noindex, follow">
<meta name="theme-color" content="#14110f">
<link rel="canonical" href="${ORIGIN}${ROUTE}/${lang}/${path}">
${alternates(view)}
<meta property="og:title" content="${attr(title)}">
<meta property="og:description" content="${attr(description)}">
<meta property="og:type" content="article">
<meta property="og:url" content="${ORIGIN}${ROUTE}/${lang}/${path}">
<link rel="icon" href="/guides/favicon.svg" type="image/svg+xml"><link rel="icon" href="/guides/favicon-32.png" sizes="32x32" type="image/png"><link rel="apple-touch-icon" href="/guides/apple-touch-icon.png">
<link rel="preload" href="${ROUTE}/assets/archivo-latin-wdth.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${ROUTE}/assets/styles.css?${ASSET_V}">
<script defer src="${ROUTE}/assets/app.js?${ASSET_V}"></script>${scripts}
<link rel="manifest" href="${ROUTE}/manifest.${lang}.webmanifest">
</head>
<body data-asset-v="${ASSET_V}" data-route="${ROUTE}">
<a class="skip" href="#main">${esc(u.skip)}</a>
<header class="topbar">
  <div class="topbar-row">
    <a class="back-link" id="all-guides" data-guide-home href="/guides/${lang}/">${esc(u.allGuides)}</a>
    <a class="brand" href="${up}"><span class="brand-mark" aria-hidden="true"></span><span>${esc(u.title)}</span></a>
    <nav class="views" aria-label="${attr(u.title)}">${navItem('report', u.nav.report)}${navItem('field', FIELD[lang].nav)}${navItem('sources', u.nav.sources)}${navItem('prompt', u.nav.prompt)}</nav>
    <div class="tools"><button type="button" class="search-open" data-search-open aria-label="${attr(EXTRA_UI[lang].searchLabel)}" title="${attr(EXTRA_UI[lang].searchLabel)}"><span>${esc(EXTRA_UI[lang].search)}</span><kbd>/</kbd></button><nav class="langs" aria-label="${attr(u.language)}">${langLinks}</nav><button type="button" class="theme-toggle" data-theme-toggle data-label-dark="${attr(u.theme.toDark)}" data-label-light="${attr(u.theme.toLight)}" data-text-dark="${attr(u.theme.dark)}" data-text-light="${attr(u.theme.light)}"></button></div>
  </div>
  ${tocHtml ? `<div class="mobile-bar"><button type="button" class="toc-open" aria-controls="toc" aria-expanded="false"><span class="toc-open-label">${esc(u.contents)}</span><span class="toc-current" data-toc-current></span></button></div>` : ''}
</header>
${body}
<footer class="site-footer"><div class="foot-inner">
  <p class="foot-method">${esc(u.footer.method)}</p>
  <p class="foot-version">${esc(versionLine)}</p>
  <details class="foot-history"><summary>${esc(u.history)}</summary><ul>${u.historyItems.map(h => `<li><b>v${h.n}</b> ${esc(formatDate(h.n === version.n ? version.iso : { 1: '2026-11-28T01:12:00Z', 2: '2026-11-28T01:38:00Z' }[h.n], lang, true))} · ${esc(h.text)}</li>`).join('')}</ul></details>
  ${u.translated ? `<p class="foot-translated">${esc(u.translated)} <a href="${ROUTE}/en/${path}" hreflang="en" lang="en">English</a></p>` : ''}
  <p><a href="#top">${esc(u.footer.top)}</a></p>
</div></footer>
<div class="tooltip" role="tooltip" hidden></div>
<dialog class="palette" data-palette aria-label="${attr(EXTRA_UI[lang].searchLabel)}" data-index="${ROUTE}/assets/search.${lang}.json?${ASSET_V}" data-empty="${attr(EXTRA_UI[lang].searchEmpty)}" data-kinds="${attr(JSON.stringify(EXTRA_UI[lang].kinds))}"><form method="dialog" class="pal-form"><input type="search" class="pal-input" placeholder="${attr(EXTRA_UI[lang].searchLabel)}" aria-label="${attr(EXTRA_UI[lang].searchLabel)}" autocomplete="off" spellcheck="false"><button type="submit" class="pal-close" aria-label="×">Esc</button></form><ol class="pal-results" role="listbox"></ol></dialog>
</body>
</html>
`;
}

function downloads(lang) {
  const u = ui[lang].downloads;
  const loc = lang;
  const items = [
    [`${ROUTE}/files/Manna_Circular_Consumption_Africa_EN-v${version.n}.docx`, u.report],
    [`${ROUTE}/files/Manna_Source_Directory_EN-v${version.n}.docx`, u.directory],
    [`${ROUTE}/files/circular-africa-sources-${loc}-v${version.n}.csv`, u.csv],
    [`${ROUTE}/files/circular-africa-sources-${loc}-v${version.n}.json`, u.json],
    [`${ROUTE}/files/research-prompt-${loc}-v${version.n}.md`, u.prompt],
  ];
  return `<section class="downloads" id="downloads" aria-labelledby="dl-title"><h2 id="dl-title">${esc(u.title)}</h2><ul>${items.map(([href, label]) => `<li><a href="${href}" download>${esc(label)}<span>${esc(href.split('/').pop())}</span></a></li>`).join('')}</ul></section>`;
}

function reportPage(lang) {
  const u = ui[lang];
  const r = structure.report;
  const chapters = r.chapters;
  const x = EXPLORE_UI[lang];
  const statHref = ['sources/', 'sources/', 'sources/?view=companies', 'sources/?view=news', 'sources/?view=opportunities'];
  const hero = `<section class="hero" id="top" data-explorer><div class="hero-inner">
    <div class="hero-text" data-intro><h1>${esc(u.title)}</h1><p class="hero-lead">${esc(u.lead)}</p>
    <p class="hero-meta">${esc(u.versionLine(version.n, formatDate(version.iso, lang)))}</p>
    <div class="hero-actions"><a class="btn solid" href="#summary">${esc(u.heroActions.report)}</a><a class="btn line" href="sources/">${esc(u.heroActions.sources)}</a><a class="btn line" href="#plan">${esc(u.heroActions.plan)}</a></div>
    ${placeChips(lang)}</div>
  <aside class="place-panel" data-panel hidden tabindex="-1" aria-live="polite"><button type="button" class="pl-close" data-go="" aria-label="${attr(x.close)}" title="${attr(x.close)}">×</button><div data-panel-body></div></aside>
  <div class="hero-map">${explorerMap(lang)}</div>
  </div><nav class="stats" aria-label="${attr(ui[lang].dir.title)}">${u.stats.map(([n, l], i) => `<a href="${statHref[i]}"><strong>${n}</strong><span>${esc(l)}</span></a>`).join('')}</nav></section>
  <div class="place-templates" hidden>${Object.keys(VIEW_OF).map(id => placePanel(lang, id)).join('')}</div>`;
  const body = `${hero}<div class="layout">${toc(lang, chapters)}<main id="main" class="doc">${chapters.map((c, i) => renderChapter(lang, c, i)).join('')}${downloads(lang)}</main></div>`;
  return frame(lang, 'report', { title: `${u.title} · Manna AI`, description: u.meta.report, body, toc: true });
}

// ---------- directory ----------
function entryCard(lang, e) {
  const d = ui[lang].dir;
  const f = (k, id) => id && T(lang, id) ? `<div><dt>${esc(d.fields[k])}</dt><dd>${I(lang, id)}</dd></div>` : '';
  return `<article class="entry" id="${e.id}" data-mode="${e.mode}" data-priority="${e.priority}" data-regions="${e.regions.join(' ')}" data-category="${e.category}">
  <div class="entry-top"><span class="pill mode-${e.mode}">${esc(d.modes[e.mode])}</span><span class="pill pri-${e.priority}">${esc(d.priorities[e.priority])}</span><span class="eid">${e.id}</span><span class="elang">${esc(e.lang)}</span><button type="button" class="watch" data-watch="${e.id}" aria-pressed="false" aria-label="${attr(EXTRA_UI[lang].watch)}" title="${attr(EXTRA_UI[lang].watch)}" data-on="${attr(EXTRA_UI[lang].unwatch)}" data-off="${attr(EXTRA_UI[lang].watch)}">☆</button></div>
  <h4><a href="${attr(e.url)}" target="_blank" rel="noopener">${esc(e.title)}</a></h4>
  <p class="question">${I(lang, e.question)}</p>
  <p class="meta">${[e.geo, e.type, e.topics].map(id => `<span>${I(lang, id)}</span>`).join('')}</p>
  <dl class="fields">${f('access', e.access)}${f('last', e.last)}${f('frequency', e.frequency)}${f('limit', e.limit)}</dl>
  </article>`;
}
function orgGroups(lang, entries) {
  const groups = [];
  for (const e of entries) { const g = groups.at(-1); if (g && g.org === e.org) g.items.push(e); else groups.push({ org: e.org, name: e.name, items: [e] }); }
  return groups.map(g => `<section class="org" id="${g.org}" data-org="${g.org}"><header class="org-head"><h3>${esc(g.name)}</h3><span class="oid">${g.org}</span></header><div class="org-entries">${g.items.map(e => entryCard(lang, e)).join('')}</div></section>`).join('');
}
function select(id, label, options, all) {
  return `<div class="ctl"><label for="${id}">${esc(label)}</label><select id="${id}" data-filter="${id.replace('f-', '')}"><option value="">${esc(all)}</option>${options.map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join('')}</select></div>`;
}
function directoryPage(lang) {
  const u = ui[lang], d = u.dir, dir = structure.directory;
  const tabs = [['sources', d.tabs.sources, 178], ['top', d.tabs.top, 15], ['companies', d.tabs.companies, 25], ['news', d.tabs.news, 32], ['opportunities', d.tabs.opportunities, 12], ['pending', d.tabs.pending, 5], ['mine', EXTRA_UI[lang].myList, 0]];
  const regionOrder = ['ghana', 'pan-africa', 'kenya', 'cote-divoire', 'south-africa', 'nigeria', 'morocco', 'cameroon', 'global'];
  const catOrder = ['government', 'media', 'research', 'company', 'network', 'capital'];
  const filters = `<div class="filters" role="search"><div class="ctl search"><label for="f-q">${esc(d.search)}</label><input type="search" id="f-q" data-filter="q" placeholder="${attr(d.searchPlaceholder)}" autocomplete="off"></div>
  ${select('f-mode', d.filters.mode, ['subscribe', 'follow', 'query'].map(m => [m, d.modes[m]]), d.filters.all)}
  ${select('f-priority', d.filters.priority, ['high', 'medium'].map(m => [m, d.priorities[m]]), d.filters.all)}
  ${select('f-region', d.filters.region, regionOrder.map(m => [m, d.regions[m]]), d.filters.all)}
  ${select('f-category', d.filters.category, catOrder.map(m => [m, d.categories[m]]), d.filters.all)}
  <button type="button" class="btn-text" data-clear>${esc(d.filters.clear)}</button></div>
  <p class="result-count" aria-live="polite" data-count data-template-n="${attr(d.showing('{n}', '{m}'))}"></p><p class="no-results" data-none hidden>${esc(d.none)}</p>`;
  const all = dir.entries;
  const cnt = (k, v) => all.filter(e => (k === 'region' ? e.regions.includes(v) : e[k] === v)).length;
  const bars = (key, values, label) => { const max = Math.max(...values.map(v => cnt(key, v))); return `<div class="dc"><p class="dc-title">${esc(d.filters[key])}</p><ul class="dc-bars">${values.map(v => `<li><button type="button" data-set="${key}" data-value="${v}" aria-pressed="false"><span class="dc-l">${esc(label(v))}</span><span class="dc-b"><i style="width:${(cnt(key, v) / max * 100).toFixed(1)}%"></i></span><b>${cnt(key, v)}</b></button></li>`).join('')}</ul></div>`; };
  const modeKey = `<div class="dir-charts"><div class="dc"><p class="dc-title">${esc(d.filters.mode)}</p><div class="dc-seg">${['subscribe', 'follow', 'query'].map(m => `<button type="button" class="seg-${m}" data-set="mode" data-value="${m}" aria-pressed="false" style="flex:${cnt('mode', m)}" data-tip="${attr(`${d.modes[m]}: ${d.modeHelp[m]}`)}"><span>${esc(d.modes[m])}</span><b>${cnt('mode', m)}</b></button>`).join('')}</div>
  <p class="dc-title second">${esc(d.filters.priority)}</p><div class="dc-seg">${['high', 'medium'].map(m => `<button type="button" class="seg-${m}" data-set="priority" data-value="${m}" aria-pressed="false" style="flex:${cnt('priority', m)}"><span>${esc(d.priorities[m])}</span><b>${cnt('priority', m)}</b></button>`).join('')}</div></div>
  ${bars('region', regionOrder, v => d.regions[v])}${bars('category', catOrder, v => d.categories[v])}</div>`;
  const sources = `<section class="panel" id="panel-sources" data-panel="sources" role="tabpanel" aria-labelledby="tab-sources"><p class="panel-intro">${I(lang, dir.verifiedIntro, { anchorBase: '' })}</p>${modeKey}${filters}<div class="orgs">${orgGroups(lang, dir.entries)}</div></section>`;
  const top = `<section class="panel" id="panel-top" data-panel="top" role="tabpanel" aria-labelledby="tab-top" hidden><ol class="top-list">${dir.top.map(t => `<li class="top-item"><span class="top-n">${t.n}</span><div><div class="entry-top"><span class="pill mode-${t.mode}">${esc(d.modes[t.mode])}</span><a class="eid" href="#${t.anchor.replace(/_\d+$/, '')}" data-goto-source>${t.id}</a></div><h3>${esc(t.name)}</h3><h4><a href="${attr(t.url)}" target="_blank" rel="noopener">${esc(t.title)}</a></h4><p>${I(lang, t.text)}</p></div></li>`).join('')}</ol></section>`;
  const fld = (k, id) => id ? `<div><dt>${esc(d.fields[k])}</dt><dd>${I(lang, id)}</dd></div>` : '';
  const companies = `<section class="panel" id="panel-companies" data-panel="companies" role="tabpanel" aria-labelledby="tab-companies" hidden><p class="panel-intro">${I(lang, dir.companiesIntro)}</p><div class="cards">${dir.companies.map(c => `<article class="card" id="${c.id}"><div class="entry-top"><span class="eid">${c.id}</span><a class="eid" href="#${c.org}" data-goto-source>${esc(d.related)} ${c.org}</a></div><h3>${esc(c.name)}</h3><p class="place">${I(lang, c.place)}</p><dl class="fields">${fld('customers', c.customers)}${fld('charges', c.charges)}${fld('evidence', c.evidence)}${fld('latest', c.latest)}${fld('lesson', c.lesson)}${fld('limit', c.limit)}</dl><a class="btn-link" href="${attr(c.url)}" target="_blank" rel="noopener">${esc(d.links.caseSource)}</a></article>`).join('')}</div></section>`;
  const ev = list => `<ol class="timeline records">${list.map(e => `<li id="${e.id}"><div class="tl-when"><span class="eid">${e.id}</span><span class="tl-date">${I(lang, e.period)}</span><span class="tl-pub"><em>${esc(d.fields.publication)}</em> ${I(lang, e.publication)}</span></div><div class="tl-what"><h4>${I(lang, e.topic)}</h4><p>${I(lang, e.text)}</p><p class="proof"><em>${esc(d.fields.proof)}</em> ${I(lang, e.evidence)}</p><p class="rec-links"><a class="btn-link" href="${attr(e.url)}" target="_blank" rel="noopener">${esc(d.links.openSource)}</a><a class="eid" href="#${e.org}" data-goto-source>${esc(d.related)} ${e.org}</a></p></div></li>`).join('')}</ol>`;
  const news = `<section class="panel" id="panel-news" data-panel="news" role="tabpanel" aria-labelledby="tab-news" hidden><p class="panel-intro">${I(lang, dir.newsIntro)}</p><h3 class="sub">${esc(d.events)}</h3>${ev(dir.events)}<h3 class="sub">${esc(d.research)}</h3>${ev(dir.research)}</section>`;
  const opportunities = `<section class="panel" id="panel-opportunities" data-panel="opportunities" role="tabpanel" aria-labelledby="tab-opportunities" hidden><p class="panel-intro">${I(lang, dir.opportunitiesIntro)}</p><div class="cards">${dir.opportunities.map(o => `<article class="card opp" id="${o.id}"><div class="entry-top"><span class="eid">${o.id}</span><a class="eid" href="#${o.org}" data-goto-source>${esc(d.related)} ${o.org}</a></div><h3>${esc(o.title)}</h3><p class="status">${I(lang, o.status)}</p><dl class="fields">${fld('eligibility', o.eligibility)}${fld('fee', o.fee)}${fld('date', o.date)}${fld('next', o.next)}</dl><a class="btn-link" href="${attr(o.url)}" target="_blank" rel="noopener">${esc(d.links.official)}</a></article>`).join('')}</div></section>`;
  const mine = `<section class="panel" id="panel-mine" data-panel="mine" role="tabpanel" aria-labelledby="tab-mine" hidden><p class="empty" data-mine-empty>${esc(EXTRA_UI[lang].myListEmpty)}</p><div class="mine-actions"><button type="button" class="btn-small" data-mine-export hidden>${esc(EXTRA_UI[lang].listExport)}</button></div><div class="orgs" data-mine-list></div></section>`;
  const pending = `<section class="panel" id="panel-pending" data-panel="pending" role="tabpanel" aria-labelledby="tab-pending" hidden><p class="panel-intro">${I(lang, dir.pendingIntro)}</p><div class="orgs">${orgGroups(lang, dir.pending)}</div></section>`;
  const head = `<section class="dir-head" id="top"><div class="dir-head-inner"><h1>${esc(d.title)}</h1><p class="hero-sub">${I(lang, dir.intro, { anchorBase: '' }).replace(/<a href="#[^"]*">[^<]*<\/a>( · )?/g, '')}</p><dl class="stats compact">${d.counts.map(([n, l]) => `<div><dt>${esc(l)}</dt><dd>${n}</dd></div>`).join('')}</dl></div></section>`;
  const tabBar = `<div class="tabs" role="tablist" aria-label="${attr(d.title)}">${tabs.map(([k, l, n], i) => `<button type="button" role="tab" id="tab-${k}" aria-controls="panel-${k}" aria-selected="${i === 0}" data-tab="${k}">${esc(l)}<span>${n}</span></button>`).join('')}</div>`;
  const body = `${head}<main id="main" class="dir">${tabBar}${sources}${top}${companies}${news}${opportunities}${pending}${mine}${downloads(lang)}</main>`;
  return frame(lang, 'sources', { title: `${d.title} · ${u.title}`, description: u.meta.sources, body });
}

// ---------- prompt ----------
function promptMarkdown(lang) {
  const out = [];
  for (const b of structure.prompt.blocks) {
    if (b.t === 'hr') out.push('---');
    else if (/^h\d$/.test(b.t)) out.push('#'.repeat(Number(b.t[1])) + ' ' + T(lang, b.s));
    else if (b.t === 'p') out.push(T(lang, b.s));
    else if (b.t === 'ul') out.push(b.items.map(id => '- ' + T(lang, id)).join('\n'));
    else if (b.t === 'ol') out.push(b.items.map((id, i) => `${i + 1}. ` + T(lang, id)).join('\n'));
    else if (b.t === 'table') out.push(['| ' + b.head.map(id => T(lang, id)).join(' | ') + ' |', '|' + b.head.map(() => '---').join('|') + '|', ...b.rows.map(r => '| ' + r.map(id => T(lang, id)).join(' | ') + ' |')].join('\n'));
  }
  return out.join('\n\n') + '\n';
}
function promptPage(lang) {
  const u = ui[lang];
  let html = '', tocItems = [], n = 0;
  structure.prompt.blocks.forEach((b, k) => {
    if (b.t === 'hr') { html += '<hr>'; return; }
    if (k === 0 && b.t === 'h1') { html += `<h2 class="prompt-title">${I(lang, b.s)}</h2>`; return; }
    // The source mixes levels: "# 2. …" but "## 1. Research Mission". Numbered top-level sections all go to the contents.
    if (b.t === 'h1' || (b.t === 'h2' && /^\d+\. /.test(T('en', b.s)))) { n++; const id = `p-${n}`; tocItems.push([id, plainText(T(lang, b.s))]); html += `<h2 id="${id}">${I(lang, b.s)}</h2>`; return; }
    if (b.t === 'h2') { html += `<h3>${I(lang, b.s)}</h3>`; return; }
    if (b.t === 'h3') { html += `<h4>${I(lang, b.s)}</h4>`; return; }
    if (b.t === 'p') { html += `<p>${I(lang, b.s)}</p>`; return; }
    if (b.t === 'ul' || b.t === 'ol') { html += `<${b.t}>${b.items.map(id => `<li>${I(lang, id)}</li>`).join('')}</${b.t}>`; return; }
    if (b.t === 'table') html += table(lang, b, {});
  });
  const md = promptMarkdown(lang);
  const tocHtml = `<nav class="toc" id="toc" aria-label="${attr(u.contents)}"><div class="toc-scroll"><ol class="toc-plain">${tocItems.map(([id, t]) => `<li><a href="#${id}" data-toc="${id}"><span>${esc(t)}</span></a></li>`).join('')}</ol></div></nav>`;
  const head = `<section class="dir-head" id="top"><div class="dir-head-inner"><h1>${esc(u.prompt.title)}</h1><div class="hero-actions"><button type="button" class="btn solid" data-copy-prompt>${esc(u.prompt.copy)}</button><a class="btn line" href="${ROUTE}/files/research-prompt-${lang}-v${version.n}.md" download>${esc(u.prompt.download)}</a>${lang !== 'en' ? `<a class="btn line" href="${ROUTE}/en/prompt/" hreflang="en" lang="en">${esc(u.prompt.original)}</a>` : ''}</div></div></section>`;
  const body = `${head}<div class="layout">${tocHtml}<main id="main" class="doc prompt-doc">${html}<textarea class="visually-hidden" id="prompt-md" aria-hidden="true" tabindex="-1" readonly>${esc(md)}</textarea></main></div>`;
  return { html: frame(lang, 'prompt', { title: `${u.prompt.title} · ${u.title}`, description: u.meta.prompt, body, toc: true }), md };
}


// ---------- field kit ----------
function templated(v) {
  // Interface strings that are functions become "{0} of {1}" templates for the browser.
  if (typeof v === 'function') return v('{0}', '{1}', '{2}');
  if (Array.isArray(v)) return v.map(templated);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, templated(x)]));
  return v;
}
function fieldPage(lang) {
  const u = ui[lang], F = FIELD[lang];
  const qch = chap('questions');
  const questions = qch.blocks.filter(b => b.t === 'p' && /^\*\*\d\.\*\*/.test(en[b.s])).map(b => ({
    en: inline(en[b.s].replace(/^\*\*\d\.\*\*\s*/, '')),
    local: lang === 'en' ? '' : inline(T(lang, b.s).replace(/^\*\*\d\.\*\*\s*/, '')),
  }));
  const plan = tableOf('plan');
  const thresholds = plan.rows.map(r => ({ cont: I(lang, r[1]), stop: I(lang, r[2]) }));
  const trail = qch.blocks.filter(b => b.t === 'p' && !/^\*\*\d\.\*\*/.test(en[b.s])).map(b => `<p>${I(lang, b.s)}</p>`).join('');
  const locale = { en: 'en-GB', es: 'es', zh: 'zh-CN' }[lang];
  const config = { locale, strings: templated(F), tasks: PLAN_TASKS, phases: PHASES, questions, thresholds };
  const tabs = ['plan', 'interview', 'cases', 'board', 'data'];
  const head = `<section class="dir-head field-head" id="top"><div class="dir-head-inner"><h1>${esc(F.title)}</h1><p class="day-now" data-day hidden></p>
    <div class="start-row"><label for="f-start">${esc(F.start)}</label><p class="hint">${esc(F.startHint)}</p><input type="date" id="f-start"></div>
    <p class="local-note">${esc(F.local)} <span data-offline hidden>${esc(F.offline)}</span></p><p class="warn" data-storage-warning hidden>localStorage ×</p></div></section>`;
  const tabBar = `<div class="tabs" role="tablist" aria-label="${attr(F.title)}">${tabs.map((k, i) => `<button type="button" role="tab" id="ftab-${k}" aria-controls="fpanel-${k}" aria-selected="${i === 0}" data-ftab="${k}">${esc(F.tabs[k])}${k === 'cases' ? '<span data-case-count>0</span>' : ''}</button>`).join('')}</div>`;
  const panels = `
  <section class="panel" id="fpanel-plan" data-fpanel="plan" role="tabpanel" aria-labelledby="ftab-plan"><div class="plan" data-plan></div></section>
  <section class="panel" id="fpanel-interview" data-fpanel="interview" role="tabpanel" aria-labelledby="ftab-interview" hidden>
    <p class="panel-intro">${esc(F.interview.adapt)}</p><button type="button" class="btn-solid big" data-interview-start>${esc(F.interview.start)}</button>
    <ol class="questions">${questions.map(q => `<li>${q.local || q.en}${q.local ? `<span class="q-en" lang="en">${q.en}</span>` : ''}</li>`).join('')}</ol>
    <h3 class="sub">${I(lang, qch.blocks.find(b => b.t === 'h2').s)}</h3><div class="trail">${trail}</div>
    <div class="interview" data-interview hidden role="dialog" aria-modal="true" aria-label="${attr(F.tabs.interview)}"><div class="iv-top"><span data-q-count></span><button type="button" class="iv-close" data-q-close>${esc(F.interview.close)}</button></div>
      <div class="iv-body"><p class="iv-en" data-q-en lang="en"></p><p class="iv-local" data-q-local hidden></p></div>
      <div class="iv-nav"><button type="button" data-q-prev>${esc(F.interview.prev)}</button><button type="button" data-q-log class="iv-log">${esc(F.interview.log)}</button><button type="button" data-q-next class="iv-next">${esc(F.interview.next)}</button></div></div>
  </section>
  <section class="panel" id="fpanel-cases" data-fpanel="cases" role="tabpanel" aria-labelledby="ftab-cases" hidden><button type="button" class="btn-solid" data-case-add>${esc(F.cases.add)}</button><div class="case-form-box" data-case-form hidden></div><div class="cases" data-cases></div></section>
  <section class="panel" id="fpanel-board" data-fpanel="board" role="tabpanel" aria-labelledby="ftab-board" hidden><p class="panel-intro">${esc(F.board.intro)}</p><div class="board" data-board></div></section>
  <section class="panel" id="fpanel-data" data-fpanel="data" role="tabpanel" aria-labelledby="ftab-data" hidden><p class="panel-intro">${esc(F.local)}</p><div class="data-actions"><button type="button" class="btn-solid" data-export-csv>${esc(F.data.export)}</button><button type="button" class="btn-ghost" data-export-json>${esc(F.data.exportJson)}</button><label class="btn-ghost file"><input type="file" accept="application/json,.json" data-import hidden>${esc(F.data.import)}</label><button type="button" class="btn-danger" data-clear-all>${esc(F.data.clear)}</button></div><p class="import-msg" data-import-msg aria-live="polite"></p></section>`;
  const body = `${head}<main id="main" class="dir field" data-field>${tabBar}${panels}<noscript><p class="panel-intro">JavaScript</p></noscript><script type="application/json" id="field-config">${JSON.stringify(config).replace(/</g, '\\u003c')}</script></main>`;
  return frame(lang, 'field', { title: `${F.title} · ${u.title}`, description: u.meta.report, body, scripts: `\n<script defer src="${ROUTE}/assets/field.js?${ASSET_V}"></script>` });
}

// ---------- search index ----------
function searchIndex(lang) {
  const R = `${ROUTE}/${lang}`, d = ui[lang].dir, items = [];
  structure.report.chapters.forEach((c, i) => items.push({ k: 'chapter', t: `${String(i + 1).padStart(2, '0')} ${ui[lang].chapters[c.id]}`, s: plainText(T(lang, c.title)), h: `${R}/#${c.id}` }));
  for (const id of Object.keys(VIEW_OF)) items.push({ k: 'place', t: NAMES[id][lang], s: ROLES[id][lang], h: `${R}/?place=${id}` });
  for (const e of [...structure.directory.entries, ...structure.directory.pending]) items.push({ k: 'source', t: `${e.name} · ${e.title}`, s: plainText(T(lang, e.question)), h: `${R}/sources/#${e.id}`, x: `${e.id} ${plainText(en[e.geo])} ${plainText(T(lang, e.geo))} ${plainText(T(lang, e.topics))}` });
  for (const c of structure.directory.companies) items.push({ k: 'company', t: c.name, s: plainText(T(lang, c.place)), h: `${R}/sources/?view=companies#${c.id}`, x: c.id });
  for (const e of [...structure.directory.events, ...structure.directory.research]) items.push({ k: 'event', t: plainText(T(lang, e.topic)), s: plainText(T(lang, e.period)), h: `${R}/sources/?view=news#${e.id}`, x: `${e.id} ${plainText(T(lang, e.text))}` });
  for (const o of structure.directory.opportunities) items.push({ k: 'opportunity', t: o.title, s: plainText(T(lang, o.status)), h: `${R}/sources/?view=opportunities#${o.id}`, x: o.id });
  for (const [k, l] of Object.entries(FIELD[lang].tabs)) items.push({ k: 'field', t: l, s: FIELD[lang].title, h: `${R}/field/${k === 'plan' ? '' : `?tab=${k}`}` });
  return JSON.stringify(items);
}
const reportStringIds = () => { const ids = new Set(); const walk = v => { if (typeof v === 'string' && /^x[0-9a-f]{10}$/.test(v)) ids.add(v); else if (v && typeof v === 'object') Object.values(v).forEach(walk); }; walk(structure.report); return ids; };

// ---------- exports ----------
function csvCell(v) { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }
function directoryExport(lang) {
  const dir = structure.directory, d = ui[lang].dir;
  const rows = [...dir.entries, ...dir.pending].map(e => ({
    id: e.id, organisation_id: e.org, organisation: e.name, channel: e.title, url: e.url,
    access_method: d.modes[e.mode], priority: d.priorities[e.priority], verified: e.pending ? 'no' : 'yes',
    question: plainText(T(lang, e.question)), geography: plainText(T(lang, e.geo)), type: plainText(T(lang, e.type)), topics: plainText(T(lang, e.topics)), language: e.lang,
    access: plainText(T(lang, e.access)), last_signal: plainText(T(lang, e.last)), frequency: plainText(T(lang, e.frequency)), limit: plainText(T(lang, e.limit)),
    regions: e.regions.map(r => d.regions[r] || r).join('; '), category: d.categories[e.category] || e.category, checked: '2026-11-28',
  }));
  const cols = Object.keys(rows[0]);
  const csv = '﻿' + [cols.join(','), ...rows.map(r => cols.map(c => csvCell(r[c])).join(','))].join('\r\n') + '\r\n';
  const full = {
    title: ui[lang].dir.title, version: version.n, checked: '2026-11-28', sources: rows,
    companies: dir.companies.map(c => ({ id: c.id, name: c.name, organisation_id: c.org, place: plainText(T(lang, c.place)), customers: plainText(T(lang, c.customers)), charges: plainText(T(lang, c.charges)), evidence_of_use: plainText(T(lang, c.evidence)), latest_signal: plainText(T(lang, c.latest)), field_lesson: plainText(T(lang, c.lesson)), limit: plainText(T(lang, c.limit)), url: c.url })),
    events: [...dir.events, ...dir.research].map(e => ({ id: e.id, topic: plainText(T(lang, e.topic)), organisation_id: e.org, period: plainText(T(lang, e.period)), publication: plainText(T(lang, e.publication)), text: plainText(T(lang, e.text)), evidence: plainText(T(lang, e.evidence)), url: e.url })),
    opportunities: dir.opportunities.map(o => ({ id: o.id, title: o.title, organisation_id: o.org, status: plainText(T(lang, o.status)), eligibility: plainText(T(lang, o.eligibility)), fee_or_funding: plainText(T(lang, o.fee)), date: plainText(T(lang, o.date)), next_use: plainText(T(lang, o.next)), url: o.url })),
    top15: dir.top.map(t => ({ rank: t.n, id: t.id, organisation: t.name, access_method: d.modes[t.mode], channel: t.title, url: t.url, why: plainText(T(lang, t.text)) })),
  };
  return { csv, json: JSON.stringify(full, null, 1) };
}

// ---------- write ----------
async function put(rel, content) { const url = new URL(rel, outRoot); await mkdir(new URL('./', url), { recursive: true }); await writeFile(url, content); }
await rm(outRoot, { recursive: true, force: true });
for (const lang of LOCALES) {
  await put(`${lang}/index.html`, reportPage(lang));
  await put(`${lang}/sources/index.html`, directoryPage(lang));
  const p = promptPage(lang);
  await put(`${lang}/prompt/index.html`, p.html);
  await put(`${lang}/field/index.html`, fieldPage(lang));
  await put(`assets/search.${lang}.json`, searchIndex(lang));
  await put(`manifest.${lang}.webmanifest`, JSON.stringify({ name: `${FIELD[lang].title} · ${ui[lang].title}`, short_name: FIELD[lang].title, lang: ui[lang].htmlLang, start_url: `${ROUTE}/${lang}/field/`, scope: `${ROUTE}/`, display: 'standalone', background_color: '#14110f', theme_color: '#14110f', icons: [{ src: '/guides/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/guides/icon-512.png', sizes: '512x512', type: 'image/png' }] }, null, 1));
  await put(`files/research-prompt-${lang}-v${version.n}.md`, p.md);
  const x = directoryExport(lang);
  await put(`files/circular-africa-sources-${lang}-v${version.n}.csv`, x.csv);
  await put(`files/circular-africa-sources-${lang}-v${version.n}.json`, x.json);
}
const entry = (sub, title) => `<!doctype html><html lang="en" data-guide-entry="${sub}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>${title}</title><link rel="icon" href="/guides/favicon.svg" type="image/svg+xml"><link rel="canonical" href="${ORIGIN}${ROUTE}/en/${sub}"><script src="${ROUTE}/entry.js?${ASSET_V}"></script><noscript><meta http-equiv="refresh" content="0;url=${ROUTE}/en/${sub}"></noscript></head><body><p><a href="${ROUTE}/en/${sub}" hreflang="en">English</a> · <a href="${ROUTE}/es/${sub}" hreflang="es">Español</a> · <a href="${ROUTE}/zh/${sub}" hreflang="zh-Hans">中文</a></p></body></html>\n`;
await put('index.html', entry('', 'Circular consumption in Africa'));
await put('sources/index.html', entry('sources/', 'Source directory'));
await put('prompt/index.html', entry('prompt/', 'Research prompt'));
await put('field/index.html', entry('field/', 'Field kit'));
await put('assets/strings.en.json', JSON.stringify(Object.fromEntries([...reportStringIds()].map(id => [id, en[id]]))));
await put('sw.js', `// Offline copy of the guide: pages are fetched from the network first and kept for offline use;
// versioned assets are served from the cache.
const VERSION = '${ASSET_V}';
const CACHE = 'circular-africa-' + VERSION;
const BASE = '${ROUTE}/';
const LANG = new URL(location.href).searchParams.get('lang') || 'en';
const PRECACHE = [BASE + LANG + '/field/', BASE + LANG + '/', BASE + 'assets/styles.css?' + VERSION, BASE + 'assets/app.js?' + VERSION, BASE + 'assets/field.js?' + VERSION, BASE + 'assets/archivo-latin-wdth.woff2', BASE + 'assets/search.' + LANG + '.json?' + VERSION, '/guides/theme.js?v=20260924c'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('circular-africa-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  if (!url.pathname.startsWith(BASE) && url.pathname !== '/guides/theme.js') return;
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(url.pathname, copy)); return r; }).catch(() => caches.match(url.pathname).then(r => r || caches.match(BASE + LANG + '/field/'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r.ok && !url.pathname.includes('/files/')) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; })));
});
`);
await put('entry.js', `// /guides/circular-africa/ without a language: ?lang= first, then ?from= (the guides index the reader came from, if that language exists), then the browser language, then English.\n(() => {\n  const url = new URL(location.href);\n  const locales = ['en', 'es', 'zh'];\n  const nav = (navigator.languages || [navigator.language || '']).map(l => l.slice(0, 2).toLowerCase());\n  const locale = [url.searchParams.get('lang'), url.searchParams.get('from'), ...nav].find(v => locales.includes(v)) || 'en';\n  const target = new URL(\`${ROUTE}/\${locale}/\${document.documentElement.dataset.guideEntry || ''}\`, url);\n  target.search = url.search;\n  target.searchParams.delete('lang');\n  if (locales.includes(url.searchParams.get('from'))) target.searchParams.delete('from');\n  target.hash = url.hash;\n  location.replace(target.href);\n})();\n`);
for (const f of ['styles.css', 'app.js', 'field.js']) await copyFile(new URL(`assets/${f}`, here), new URL(`assets/${f}`, outRoot)).catch(async e => { await mkdir(new URL('assets/', outRoot), { recursive: true }); await copyFile(new URL(`assets/${f}`, here), new URL(`assets/${f}`, outRoot)); });
await copyFile(new URL('../../public/guides/rex-pitch/fonts/archivo-latin-wdth.woff2', here), new URL('assets/archivo-latin-wdth.woff2', outRoot));
await copyFile(new URL('../../public/guides/rex-pitch/fonts/OFL.txt', here), new URL('assets/OFL-Archivo.txt', outRoot));
await mkdir(new URL('files/', outRoot), { recursive: true });
await copyFile(new URL('source/Manna_Circular_Consumption_Africa_EN.docx', here), new URL(`files/Manna_Circular_Consumption_Africa_EN-v${version.n}.docx`, outRoot));
await copyFile(new URL('source/Manna_Source_Directory_EN.docx', here), new URL(`files/Manna_Source_Directory_EN-v${version.n}.docx`, outRoot));
console.log(`built ${LOCALES.length} × 3 pages into public${ROUTE}/ (${ASSET_V})`);
