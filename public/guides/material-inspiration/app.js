/* 材料与界面：参考库交互。无依赖、无网络请求。界面文字、分组说明和补充来源来自 data/locale.<lang>.js（window.ATLAS_LOCALE）。 */
(() => {
  'use strict';

  const items = Array.isArray(window.ATLAS_CASES) ? window.ATLAS_CASES : [];
  const prompt = typeof window.ATLAS_PROMPT === 'string' ? window.ATLAS_PROMPT : '';
  const L = window.ATLAS_LOCALE;
  const T = L.ui;
  const { groups, groupDescriptions, categoryCaveats, exactLooks, additionalSources } = L;
  const $ = (id) => document.getElementById(id);

  const STORE_SAVED = 'atlas:saved';
  const PAGE_SIZE = 24;
  const COMPARE_MAX = 3;

  /* ---------- 工具 ---------- */
  const byId = new Map(items.map((x) => [x.id, x]));
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const clean = (s) => String(s ?? '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase().trim();
  const safeUrl = (url) => { try { const u = new URL(url); return (u.protocol === 'https:' || u.protocol === 'http:') ? u.href : '#'; } catch { return '#'; } };
  const lookFor = (c) => exactLooks[c.id] || T.lookForFallback(groupDescriptions[c.category] || '');
  const groupName = (key) => (groups.find((g) => g[0] === key) || [key, key])[1];
  const splitMarket = (m) => String(m || '').split(/\s*·\s*/);
  const tagText = (c) => (c.tags || []).join(T.tagSeparator);
  const newWin = `<span class="vh">${esc(T.newWindow)}</span>`;
  const ext = (href, label, cls = '') => `<a${cls ? ` class="${cls}"` : ''} href="${esc(safeUrl(href))}" target="_blank" rel="noopener noreferrer">${label}${newWin}</a>`;
  const searchText = new Map(items.map((c) => [c.id, clean([c.id, c.title, c.market, c.categoryLabel, c.insight, c.application, ...(c.tags || []), c.dating, exactLooks[c.id] || ''].join(' '))]));

  function readStored(key) {
    try {
      const a = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(a) ? a.filter((id) => typeof id === 'string' && byId.has(id)) : [];
    } catch { return []; }
  }
  function writeStored(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* 隐私模式可能禁止存储 */ }
  }

  let toastTimer = 0;
  function toast(message) {
    const el = $('toast');
    // 模态对话框在顶层，提示放进打开的对话框里才不会被遮罩挡住
    const host = document.querySelector('dialog[open]') || document.body;
    if (el.parentNode !== host) host.appendChild(el);
    el.textContent = message;
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-on'), 3200);
  }

  /* ---------- 状态 ---------- */
  const state = {
    category: 'all', facet: 'all', query: '', sort: 'featured', visible: PAGE_SIZE,
    saves: new Set(readStored(STORE_SAVED)),
    compare: []
  };
  let filtered = [];

  /* ---------- 过滤与排序 ---------- */
  function matchesFacet(c) {
    switch (state.facet) {
      case 'featured': return !!c.featured;
      case 'new': return !!c.isNew;
      case 'saved': return state.saves.has(c.id);
      default: return true;
    }
  }
  function applyFilters() {
    const q = clean(state.query);
    const terms = q ? q.split(/\s+/).filter(Boolean) : [];
    const list = items.filter((c) =>
      (state.category === 'all' || c.category === state.category) &&
      matchesFacet(c) &&
      terms.every((t) => searchText.get(c.id).includes(t)));
    if (state.sort === 'name') list.sort((a, b) => a.title.localeCompare(b.title, L.collation));
    else if (state.sort === 'category') list.sort((a, b) => items.indexOf(a) - items.indexOf(b));
    else list.sort((a, b) => Number(b.featured) - Number(a.featured) || items.indexOf(a) - items.indexOf(b));
    return list;
  }

  /* ---------- 渲染 ---------- */
  function drawCategories() {
    const counts = {};
    items.forEach((c) => { counts[c.category] = (counts[c.category] || 0) + 1; });
    const all = [['all', T.allTopics, items.length], ...groups.map(([k, n]) => [k, n, counts[k] || 0])];
    $('catList').innerHTML = all.map(([key, name, n]) =>
      `<li><button type="button" class="cat" data-cat="${esc(key)}" aria-pressed="${key === state.category}"><span class="cat-name">${esc(name)}</span><span class="cat-n">${n}</span></button></li>`).join('');
  }
  function syncControls() {
    document.querySelectorAll('[data-cat]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cat === state.category)));
    document.querySelectorAll('[data-facet]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.facet === state.facet)));
    const n = state.saves.size;
    $('savedCountNav').textContent = n;
    $('savedCountFacet').textContent = n;
    if ($('q').value !== state.query) $('q').value = state.query;
    $('sort').value = state.sort;
  }
  function dateClass(c) {
    if (c.isConcept) return 'date is-concept';
    if (c.isNew) return 'date is-new';
    return 'date';
  }
  function marks(c) {
    return `${c.featured ? `<span class="pick">${esc(T.pick)}</span>` : ''}<span class="${dateClass(c)}">${esc(c.dating)}</span>`;
  }
  function entry(c) {
    const [place, trade] = splitMarket(c.market);
    const saved = state.saves.has(c.id);
    const compared = state.compare.includes(c.id);
    return `<li class="entry" data-id="${esc(c.id)}">
  <p class="entry-meta"><span class="entry-id">${esc(c.id)}</span><span class="entry-cat">${esc(c.categoryLabel)}</span><span class="entry-marks">${marks(c)}</span></p>
  <h3 class="entry-title"><a href="#case-${esc(c.id)}" data-detail="${esc(c.id)}">${esc(c.title)}</a></h3>
  <p class="entry-market"><span>${esc(place)}</span>${trade ? `<span>${esc(trade)}</span>` : ''}</p>
  <p class="entry-insight">${esc(c.insight)}</p>
  <p class="entry-use"><span class="entry-use-label">${esc(T.borrow)}</span>${esc(c.application)}</p>
  <p class="entry-tags">${esc(tagText(c))}</p>
  <div class="entry-actions">
    ${ext(c.url, esc(T.visit), 'act act-link')}
    <button type="button" class="act act-toggle" data-save="${esc(c.id)}" aria-pressed="${saved}">${esc(T.save)}<span class="vh"> ${esc(c.title)}</span></button>
    <button type="button" class="act act-toggle" data-compare="${esc(c.id)}" aria-pressed="${compared}">${esc(T.compare)}<span class="vh"> ${esc(c.title)}</span></button>
  </div>
</li>`;
  }
  function statusText() {
    const total = filtered.length;
    const shown = Math.min(state.visible, total);
    if (!total) return T.noMatchStatus;
    return shown < total ? T.showing(shown, total) : T.total(total);
  }
  function drawGroupNote() {
    const note = $('groupNote');
    if (state.category === 'all') { note.hidden = true; note.innerHTML = ''; return; }
    note.innerHTML = `<p class="group-desc">${esc(T.groupNote(groupName(state.category), groupDescriptions[state.category] || ''))}</p><p class="group-caveat"><span>${esc(T.limits)}</span>${esc(categoryCaveats[state.category] || '')}</p>`;
    note.hidden = false;
  }
  function drawEmpty() {
    const empty = $('emptyState');
    if (filtered.length) { empty.hidden = true; return; }
    const savedOnly = state.facet === 'saved' && state.saves.size === 0;
    $('emptyText').textContent = savedOnly ? T.emptySaved : T.emptyFiltered;
    $('resetFilters').textContent = savedOnly ? T.showAll : T.clearFilters;
    empty.hidden = false;
  }
  function render() {
    filtered = applyFilters();
    syncControls();
    drawGroupNote();
    $('caseList').innerHTML = filtered.slice(0, state.visible).map(entry).join('');
    $('resultStatus').textContent = statusText();
    const remaining = filtered.length - Math.min(state.visible, filtered.length);
    const more = $('loadMore');
    more.hidden = remaining <= 0;
    more.textContent = T.loadMore(remaining);
    drawEmpty();
  }
  function resetAndRender() { state.visible = PAGE_SIZE; render(); }
  function loadMore() {
    const start = Math.min(state.visible, filtered.length);
    state.visible += PAGE_SIZE;
    const next = filtered.slice(start, state.visible);
    $('caseList').insertAdjacentHTML('beforeend', next.map(entry).join(''));
    $('resultStatus').textContent = statusText();
    const remaining = filtered.length - Math.min(state.visible, filtered.length);
    $('loadMore').hidden = remaining <= 0;
    $('loadMore').textContent = T.loadMore(remaining);
    const first = next[0] && document.querySelector(`#caseList [data-detail="${CSS.escape(next[0].id)}"]`);
    if (first) first.focus();
  }

  /* ---------- 收藏 ---------- */
  function syncToggles(id) {
    const saved = state.saves.has(id);
    const compared = state.compare.includes(id);
    document.querySelectorAll(`[data-save="${CSS.escape(id)}"]`).forEach((b) => b.setAttribute('aria-pressed', String(saved)));
    document.querySelectorAll(`[data-compare="${CSS.escape(id)}"]`).forEach((b) => b.setAttribute('aria-pressed', String(compared)));
  }
  function toggleSave(id) {
    const c = byId.get(id);
    if (!c) return;
    if (state.saves.has(id)) state.saves.delete(id); else state.saves.add(id);
    writeStored(STORE_SAVED, items.filter((x) => state.saves.has(x.id)).map((x) => x.id));
    const saved = state.saves.has(id);
    toast(saved ? T.saved(c.title) : T.unsaved(c.title));
    if (state.facet === 'saved' && !saved) {
      const inList = document.activeElement && document.activeElement.closest && document.activeElement.closest('#caseList');
      render();
      syncToggles(id);
      if (inList) $('resultStatus').focus({ preventScroll: true });
    } else {
      syncControls();
      syncToggles(id);
    }
  }

  /* ---------- 对比 ---------- */
  function drawDock() {
    const dock = $('compareDock');
    const n = state.compare.length;
    dock.hidden = n === 0;
    document.body.classList.toggle('has-dock', n > 0);
    $('compareCount').textContent = T.compareCount(n, COMPARE_MAX);
    $('compareItems').innerHTML = state.compare.map((id) => {
      const c = byId.get(id);
      return `<li><span class="dock-name">${esc(c.title)}</span><button type="button" class="dock-remove" data-uncompare="${esc(id)}" aria-label="${esc(T.removeFromCompare(c.title))}">${esc(T.remove)}</button></li>`;
    }).join('');
    const open = $('openCompare');
    open.disabled = n < 2;
    open.textContent = n < 2 ? T.pickOneMore : T.startCompare;
  }
  function toggleCompare(id) {
    const c = byId.get(id);
    if (!c) return;
    const i = state.compare.indexOf(id);
    if (i >= 0) {
      state.compare.splice(i, 1);
      toast(T.removedFromCompare(c.title));
    } else if (state.compare.length >= COMPARE_MAX) {
      toast(T.compareFull(COMPARE_MAX, c.title));
      return;
    } else {
      state.compare.push(id);
      toast(T.addedToCompare(c.title, state.compare.length, COMPARE_MAX));
    }
    syncToggles(id);
    drawDock();
    if ($('compareDialog').open) drawCompare();
  }
  function removeCompare(id) {
    const i = state.compare.indexOf(id);
    if (i < 0) return;
    const c = byId.get(id);
    state.compare.splice(i, 1);
    syncToggles(id);
    drawDock();
    if ($('compareDialog').open) {
      if (state.compare.length < 2) {
        $('compareDialog').close();
        toast(T.removedNeedTwo(c.title));
      } else {
        drawCompare();
        toast(T.removedFromCompare(c.title));
      }
    } else {
      toast(T.removedFromCompare(c.title));
      const next = document.querySelector('#compareItems .dock-remove') || $('openCompare');
      if (!$('compareDock').hidden && next) next.focus();
      else $('resultStatus').focus({ preventScroll: true });
    }
  }
  function drawCompare() {
    const selected = state.compare.map((id) => byId.get(id)).filter(Boolean);
    const R = T.compareRows;
    const row = (label, fn) => `<tr><th scope="row">${esc(label)}</th>${selected.map((c) => `<td data-case="${esc(c.title)}">${fn(c)}</td>`).join('')}</tr>`;
    $('compareBody').innerHTML = `<h2 id="compareTitle" class="sheet-title">${esc(T.compareTitle)}</h2>
<div class="compare-wrap">
<table class="compare-table" data-n="${selected.length}">
  <thead><tr><td></td>${selected.map((c) => `<th scope="col"><span class="cmp-id">${esc(c.id)}${esc(T.idSeparator)}${esc(c.categoryLabel)}</span><span class="cmp-name">${esc(c.title)}</span><button type="button" class="btn btn-quiet cmp-remove" data-uncompare="${esc(c.id)}">${esc(T.remove)}<span class="vh"> ${esc(c.title)}</span></button></th>`).join('')}</tr></thead>
  <tbody>
    ${row(R.market, (c) => esc(c.market))}
    ${row(R.insight, (c) => esc(c.insight))}
    ${row(R.look, (c) => esc(exactLooks[c.id] || groupDescriptions[c.category]))}
    ${row(R.application, (c) => esc(c.application))}
    ${row(R.tags, (c) => esc(tagText(c)))}
    ${row(R.dating, (c) => esc(c.dating) + (c.featured ? esc(T.pickSuffix) : ''))}
    ${row(R.caveat, (c) => esc(categoryCaveats[c.category]))}
    ${row(R.link, (c) => ext(c.url, esc(T.visit)))}
  </tbody>
</table>
</div>`;
  }
  function openCompare() {
    if (state.compare.length < 2) { toast(T.needTwo); return; }
    drawCompare();
    $('compareDialog').showModal();
  }

  /* ---------- 详情 ---------- */
  let openDetailId = null;
  function detailActions(c) {
    const saved = state.saves.has(c.id);
    const compared = state.compare.includes(c.id);
    return `${ext(c.url, esc(T.visit), 'btn btn-solid')}
<button type="button" class="btn btn-line act-toggle" data-save="${esc(c.id)}" aria-pressed="${saved}">${esc(T.save)}</button>
<button type="button" class="btn btn-line act-toggle" data-compare="${esc(c.id)}" aria-pressed="${compared}">${esc(T.compare)}</button>`;
  }
  function showDetail(id) {
    const c = byId.get(id);
    if (!c) return false;
    const refs = additionalSources[c.id] || [];
    const [place, trade] = splitMarket(c.market);
    const D = T.detailRows;
    $('detailBody').innerHTML = `<p class="entry-meta"><span class="entry-id">${esc(c.id)}</span><span class="entry-cat">${esc(c.categoryLabel)}</span><span class="entry-marks">${marks(c)}</span></p>
<h2 id="detailTitle" class="sheet-title">${esc(c.title)}</h2>
<p class="entry-market"><span>${esc(place)}</span>${trade ? `<span>${esc(trade)}</span>` : ''}</p>
<p class="detail-lead">${esc(c.insight)}</p>
<div class="detail-actions">${detailActions(c)}</div>
<dl class="detail-list">
  <div><dt>${esc(D.look)}</dt><dd>${esc(lookFor(c))}</dd></div>
  <div><dt>${esc(D.application)}</dt><dd>${esc(c.application)}</dd></div>
  <div><dt>${esc(D.tags)}</dt><dd>${esc(tagText(c))}</dd></div>
  <div><dt>${esc(D.dating)}</dt><dd>${esc(c.dating)}${c.isConcept ? esc(T.conceptNote) : ''}</dd></div>
  <div><dt>${esc(D.caveat)}</dt><dd>${esc(categoryCaveats[c.category])}</dd></div>
  <div><dt>${esc(D.sources)}</dt><dd><ul class="detail-sources"><li>${ext(c.url, esc(c.url), 'url')}</li>${refs.map(([label, url]) => `<li>${ext(url, esc(label))}</li>`).join('')}</ul></dd></div>
</dl>
<p class="detail-note">${esc(T.researchDate)}</p>`;
    openDetailId = id;
    const d = $('detailDialog');
    if (!d.open) d.showModal();
    d.querySelector('.sheet-body').scrollTop = 0;
    d.scrollTop = 0;
    return true;
  }
  function caseFromHash() {
    const m = /^#case-([A-Za-z0-9]+)$/.exec(window.location.hash || '');
    return m && byId.has(m[1]) ? m[1] : null;
  }
  function clearCaseHash() {
    if (caseFromHash()) {
      try { history.replaceState(null, '', window.location.pathname + window.location.search); } catch { /* ignore */ }
    }
  }

  /* ---------- 导出收藏（原格式） ---------- */
  const X = T.txtLabels;
  const txtCase = (c) => `${c.id} | ${c.title}\n${X.category}${c.categoryLabel}\n${X.market}${c.market}\n${X.link}${c.url}\n${X.look}${exactLooks[c.id] || groupDescriptions[c.category]}\n${X.insight}${c.insight}\n${X.application}${c.application}\n${X.tags}${tagText(c)}\n${X.dating}${c.dating}\n${X.caveat}${categoryCaveats[c.category]}\n${(additionalSources[c.id] || []).map(([label, url]) => `${X.source}${label} — ${url}`).join('\n')}`;
  function makeReport(cases) {
    const byGroup = groups.map(([key, name]) => {
      const inGroup = cases.filter((c) => c.category === key);
      return inGroup.length ? `\n==================== ${name} ====================\n\n${inGroup.map(txtCase).join('\n\n---\n\n')}` : '';
    }).join('\n');
    return `${T.reportHead(cases.length, new Date().toLocaleDateString(L.lang))}${byGroup}\n`;
  }
  function download(text, filename) {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(href), 2500);
  }

  /* ---------- 提示词 ---------- */
  async function copyPrompt() {
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('no clipboard');
      await navigator.clipboard.writeText(prompt);
      toast(T.copied);
    } catch {
      const pre = $('promptText');
      $('promptDetails').open = true;
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(pre);
      sel.removeAllRanges(); sel.addRange(range);
      pre.focus({ preventScroll: true });
      pre.scrollIntoView({ block: 'nearest' });
      toast(T.copyFallback);
    }
  }

  /* ---------- 跳转到参考库的快捷操作 ---------- */
  function showLibraryWith(facet) {
    state.category = 'all';
    state.facet = facet;
    state.query = '';
    resetAndRender();
    const lib = $('library');
    lib.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    $('resultStatus').focus({ preventScroll: true });
  }

  /* ---------- 章节导航高亮 ---------- */
  function setupNavHighlight() {
    if (!('IntersectionObserver' in window)) return;
    const links = [...document.querySelectorAll('.section-nav a')];
    const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    const visible = new Map();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));
      let best = null; let bestRatio = 0;
      visible.forEach((r, id) => { if (r > bestRatio) { best = id; bestRatio = r; } });
      links.forEach((a) => a.removeAttribute('aria-current'));
      if (best && map.has(best)) map.get(best).setAttribute('aria-current', 'true');
    }, { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.01, 0.2, 0.5] });
    map.forEach((_, id) => { const s = $(id); if (s) io.observe(s); });
  }

  /* ---------- 切换语言时带上当前打开的条目 ---------- */
  function syncLanguageLinks() {
    const hash = window.location.hash;
    document.querySelectorAll('[data-language]').forEach((a) => {
      const base = a.getAttribute('href').split('#')[0];
      a.setAttribute('href', /^#case-[A-Za-z0-9]+$/.test(hash) ? base + hash : base);
    });
  }

  /* ---------- 事件 ---------- */
  function bind() {
    document.addEventListener('click', (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      const detail = t.closest('[data-detail]');
      if (detail) {
        const id = detail.dataset.detail;
        if (byId.has(id)) {
          e.preventDefault();
          showDetail(id);
          try { history.replaceState(null, '', `#case-${id}`); } catch { /* ignore */ }
          syncLanguageLinks();
        }
        return;
      }
      const save = t.closest('[data-save]');
      if (save) { toggleSave(save.dataset.save); return; }
      const cmp = t.closest('[data-compare]');
      if (cmp) { toggleCompare(cmp.dataset.compare); return; }
      const uncmp = t.closest('[data-uncompare]');
      if (uncmp) { removeCompare(uncmp.dataset.uncompare); return; }
      const cat = t.closest('[data-cat]');
      if (cat) { state.category = cat.dataset.cat; resetAndRender(); return; }
      const facet = t.closest('[data-facet]');
      if (facet) { state.facet = facet.dataset.facet; resetAndRender(); return; }
      const quick = t.closest('[data-quick]');
      if (quick) { showLibraryWith(quick.dataset.quick); return; }
      const close = t.closest('[data-close]');
      if (close) { const d = close.closest('dialog'); if (d) d.close(); }
    });

    let qTimer = 0;
    $('q').addEventListener('input', (e) => {
      const v = e.target.value;
      clearTimeout(qTimer);
      qTimer = setTimeout(() => { state.query = v; resetAndRender(); }, 120);
    });
    $('q').addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && $('q').value) { e.preventDefault(); $('q').value = ''; state.query = ''; resetAndRender(); }
    });
    $('sort').addEventListener('change', (e) => { state.sort = e.target.value; resetAndRender(); });
    $('loadMore').addEventListener('click', loadMore);
    $('resetFilters').addEventListener('click', () => {
      state.category = 'all'; state.facet = 'all'; state.query = ''; state.sort = 'featured';
      resetAndRender();
      $('resultStatus').focus();
    });
    $('savedJump').addEventListener('click', () => showLibraryWith('saved'));
    $('clearCompare').addEventListener('click', () => {
      const ids = state.compare.slice();
      state.compare = [];
      ids.forEach(syncToggles);
      drawDock();
      toast(T.compareCleared);
      $('resultStatus').focus({ preventScroll: true });
    });
    $('openCompare').addEventListener('click', openCompare);
    $('exportSaved').addEventListener('click', () => {
      const cases = items.filter((x) => state.saves.has(x.id));
      if (!cases.length) { toast(T.nothingToExport); return; }
      download(makeReport(cases), T.exportFile);
      toast(T.exported(cases.length));
    });
    $('copyPrompt').addEventListener('click', copyPrompt);

    ['detailDialog', 'compareDialog'].forEach((id) => {
      const d = $(id);
      d.addEventListener('click', (e) => { if (e.target === d) d.close(); });
    });
    $('detailDialog').addEventListener('close', () => {
      const id = openDetailId;
      openDetailId = null;
      clearCaseHash();
      syncLanguageLinks();
      const back = id && document.querySelector(`#caseList [data-detail="${CSS.escape(id)}"], .visual-index [data-detail="${CSS.escape(id)}"]`);
      if (back) back.focus({ preventScroll: true });
    });
    $('compareDialog').addEventListener('close', () => {
      const target = $('compareDock').hidden ? $('resultStatus') : $('openCompare');
      target.focus({ preventScroll: true });
    });

    window.addEventListener('hashchange', () => {
      const id = caseFromHash();
      if (id) showDetail(id);
      else if ($('detailDialog').open) $('detailDialog').close();
      syncLanguageLinks();
    });

    // 外部存储变化（另一个标签页）
    window.addEventListener('storage', (e) => {
      if (e.key !== STORE_SAVED) return;
      state.saves = new Set(readStored(STORE_SAVED));
      render();
    });
  }

  /* ---------- 启动 ---------- */
  function init() {
    if (!items.length) {
      $('resultStatus').textContent = T.dataMissing;
      return;
    }
    document.querySelectorAll('[data-count="featured"]').forEach((el) => { el.textContent = items.filter((c) => c.featured).length; });
    document.querySelectorAll('[data-count="new"]').forEach((el) => { el.textContent = items.filter((c) => c.isNew).length; });
    drawCategories();
    bind();
    render();
    drawDock();
    if (prompt) {
      $('promptText').textContent = prompt;
      $('promptLength').textContent = T.promptLength(prompt.length.toLocaleString(L.lang));
    } else {
      $('copyPrompt').disabled = true;
      $('promptLength').textContent = T.promptMissing;
    }
    setupNavHighlight();
    const id = caseFromHash();
    if (id) showDetail(id);
    syncLanguageLinks();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
