/* 材料与界面：参考库交互。无依赖、无网络请求。 */
(() => {
  'use strict';

  const items = Array.isArray(window.ATLAS_CASES) ? window.ATLAS_CASES : [];
  const prompt = typeof window.ATLAS_PROMPT === 'string' ? window.ATLAS_PROMPT : '';
  const $ = (id) => document.getElementById(id);

  const STORE_SAVED = 'atlas:saved';
  const PAGE_SIZE = 24;
  const COMPARE_MAX = 3;

  /* ---------- 原研究的分组、说明与补充来源（保持原文） ---------- */
  const groups = [
    ['industry', '瓷砖 / 家具'], ['product', '产品信息'], ['contact', '联系 / 表单'],
    ['assistant', 'AI 助手'], ['hero', '首屏体验'], ['visualizer', '照片换材质'],
    ['3d', '3D / 制作过程'], ['homepage', '整个首页']
  ];
  const groupDescriptions = {
    industry: '品牌设计、空间案例、系列与材料目录',
    product: '筛选、规格、组件、对比与项目清单',
    contact: '预约、预算、附件、项目咨询与转化',
    assistant: '对话、商品解释、偏好识别与任务型导购',
    hero: '首屏视觉语言、镜头与首次交互',
    visualizer: '真实空间照片、表面识别与商品预览',
    '3d': '产品配置、实时模型、AR 与制作序列',
    homepage: '整页的视觉节奏、内容层级与转化路径'
  };
  const categoryCaveats = {
    industry: '这些案例用于研究品牌设计与实体商品的表达。官方首页可能已经改版，系列信息、商品数量与视觉效果请以实时官网为准。',
    product: '参数页表现与真实业务规则必须分开。瓷砖规格、适用位置、检测等级与配件兼容需要商家可验证的 SKU 数据。',
    contact: '本资料研究了公开表单的结构和视觉方法，未实际向企业提交表单；任何隐私、反垃圾、文件上传和通知能力需独立开发。',
    assistant: '官方发布或公开入口不等于当前地区已开放，也不证明回答准确。上线时应使用可信商品数据、必要的引用与人工接管机制。',
    hero: '首屏视觉容易受屏幕、网络和硬件影响；历史版本和获奖年份不是现站性能证据。动效需要低性能与减少动效模式。',
    visualizer: 'AI 风格图、照片表面分割、精确 SKU 贴图、AR 和 3D 是不同能力。单张照片缺少尺度时不能准确测量面积或自动产生正式报价。',
    '3d': '不同案例可能使用实时 3D、图片序列、预渲染视频或 AR；没有制作方或代码证据时不推断底层技术。',
    homepage: '本组研究从首屏到页尾的信息推进，不能仅凭首页截图断定转化率、速度或所有设备的交互质量。'
  };
  const exactLooks = {
    I01: '优先进入 Interiors；观察完整空间、材料近景、系列、设计师和相关产品之间的跳转。',
    I02: '从一个完整房间出发，查看材料、台面、家具与配件怎样形成成套选择。',
    I07: '进入 Gallery 和 Samples 路径，研究实景照片如何与可售色系、样品和咨询连接。',
    I11: '研究产品专题的场景、动效与一般商品目录如何分工。Paper Play 是历史专题。',
    I13: '进入定制家具流程，观察调整尺寸和模块后的可视化反馈。',
    I15: '打开 Case Studies，关注空间项目与具体家具系列的交叉索引。',
    I16: '查看 Studio 与产品搭配，观察颜色、摄影与家居场景的整体系统。',
    I17: '进入 Products 与不同场景类别，研究品牌主线和专业目录如何保持一致。',
    P01: '进入 Colors，使用材质纹理、色系、表面与技术规格的筛选组合。',
    P02: '打开照明产品分类，比较产品卡中的关键参数、项目清单和选型动作。',
    P03: '在同一页面选择不同机型，以相同字段向下逐项比较。',
    P06: '进入 Components，研究模块编号、图片与系统关系的层次。',
    C01: '沿空间规划／咨询路径查看问题顺序，以及用户为什么愿意提供资料。',
    C04: '查看项目描述、预算范围、时间、文件附件与联系方式的字段组织。',
    A02: '重点阅读 Magic Apron 官方说明，研究 AI 如何以当前商品为问题背景；并非声称本次完整测通对话。',
    A03: '研究 2026 年更新的 Alexa for Shopping 功能和购物对比入口，避免继续把原 Rufus 页面误作当前版本。',
    A04: '查看 Assistant 官方介绍中的图片输入、负面偏好和对话内商品对比。',
    H04: '查看 Watches & Wonders 2026 的首屏与主题世界，重点看镜头、产品焦点和分区转场。',
    H05: '查看农产品主画面、字体和色彩，研究普通实体商品如何成为鲜明的艺术指导。',
    H09: '看微距、揭示与概念化产品发布；作品为讽刺性概念，不把名称中的 AI 当作真实功能。',
    V01: '打开 Roomvo 提供的公开实例，关注房间照片上传、选真实商品与预览的连续步骤。',
    V02: '打开 Tilesview 的房间选择与材质配置入口，观察墙地、规格、铺贴方式及缝色。',
    V05: '在 Best Tile 实例中研究地面、墙面、淋浴壁龛等多个施工区域如何分开修改。',
    V10: '观察生成式装修的风格变化；它与准确应用商家指定纹理和尺寸是不同的任务。',
    D01: '优先研究 Muuble 空间旋转、家具摆放、墙地设置、测距及 2D/3D 状态共享。',
    D07: '观察 3D 空间和主题切换如何服务于珠宝展览，而非只停留在技术效果。',
    D08: '按时间顺序阅读工艺或产品揭示；这是设计机构历史案例，非客户现站的保证。',
    D09: '观察工业设备与原料、工艺过程之间的 3D 分镜，区分视频与实时交互。',
    W01: '沿首页滚动观察品牌故事、产品场景、制造和目录入口怎样形成完整路径。',
    W05: '观察每个章节如何解释下一步工作任务，以及复杂概念如何逐屏展开。',
    W06: '研究功能、客户类型、实例与行动入口的多层组织。'
  };
  const additionalSources = {
    I17: [['European Design Awards · Floema 作品说明', 'https://awards.europeandesign.org/winner/263020']],
    W01: [['European Design Awards · Floema 作品说明', 'https://awards.europeandesign.org/winner/263020']],
    I16: [['Creative Circle · Pedestal 2026', 'https://creativecircle.dk/arbejder/pedestal/']],
    A02: [['The Home Depot · Magic Apron 官方说明', 'https://corporate.homedepot.com/news/company/unveiling-magic-apron-home-depots-smartest-tool-yet']],
    A03: [['Amazon · Alexa for Shopping 2026', 'https://www.aboutamazon.com/news/retail/alexa-for-shopping-ai-assistant']],
    A04: [['Zalando · 2026 功能说明', 'https://blog.zalando.com/en/technology/conversational-tool-lifestyle-agent-how-zalando-assistant-has-grown']],
    H04: [['CSS Design Awards · Cartier 2026', 'https://www.cssdesignawards.com/wotm/cartier-watches-and-wonders-2026/49382/']],
    D07: [['CSS Design Awards · Cartier 2026', 'https://www.cssdesignawards.com/wotm/cartier-watches-and-wonders-2026/49382/']],
    H09: [['Lusion · Oryzo AI 概念说明', 'https://lusion.co/projects/oryzo_ai/']],
    D01: [['Muuble · 创作者的技术说明', 'https://thomasgertenbach.com/work/muuble']],
    D09: [['IST · 制作机构案例', 'https://chipsa.design/works/ist']]
  };

  /* ---------- 工具 ---------- */
  const byId = new Map(items.map((x) => [x.id, x]));
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const clean = (s) => String(s ?? '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase().trim();
  const safeUrl = (url) => { try { const u = new URL(url); return (u.protocol === 'https:' || u.protocol === 'http:') ? u.href : '#'; } catch { return '#'; } };
  const lookFor = (c) => exactLooks[c.id] || `打开所列功能入口，重点观察：${groupDescriptions[c.category] || ''}。不要只看一张静态截图，留意信息层级、可操作状态和最终行动入口。`;
  const groupName = (key) => (groups.find((g) => g[0] === key) || [key, key])[1];
  const splitMarket = (m) => String(m || '').split(/\s*·\s*/);
  const newWin = '<span class="vh">（新窗口打开）</span>';
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

  /* ---------- 返回指南首页 ---------- */
  function setupBackLink() {
    const link = $('all-guides');
    if (!link) return;
    let from = null;
    try { from = new URLSearchParams(window.location.search).get('from'); } catch { from = null; }
    const labels = { zh: ['攻略总览', 'zh-CN'], en: ['All guides', 'en'], fr: ['Tous les guides', 'fr'] };
    if (from && Object.prototype.hasOwnProperty.call(labels, from)) {
      link.href = `/guides/${from}/`;
      if (from !== 'zh') { link.textContent = labels[from][0]; link.lang = labels[from][1]; }
    }
  }

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
    if (state.sort === 'name') list.sort((a, b) => a.title.localeCompare(b.title, 'zh-Hans'));
    else if (state.sort === 'category') list.sort((a, b) => items.indexOf(a) - items.indexOf(b));
    else list.sort((a, b) => Number(b.featured) - Number(a.featured) || items.indexOf(a) - items.indexOf(b));
    return list;
  }

  /* ---------- 渲染 ---------- */
  function drawCategories() {
    const counts = {};
    items.forEach((c) => { counts[c.category] = (counts[c.category] || 0) + 1; });
    const all = [['all', '全部主题', items.length], ...groups.map(([k, n]) => [k, n, counts[k] || 0])];
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
    return `${c.featured ? '<span class="pick">精选</span>' : ''}<span class="${dateClass(c)}">${esc(c.dating)}</span>`;
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
  <p class="entry-use"><span class="entry-use-label">借鉴</span>${esc(c.application)}</p>
  <p class="entry-tags">${esc((c.tags || []).join('、'))}</p>
  <div class="entry-actions">
    ${ext(c.url, '访问网站', 'act act-link')}
    <button type="button" class="act act-toggle" data-save="${esc(c.id)}" aria-pressed="${saved}">收藏<span class="vh"> ${esc(c.title)}</span></button>
    <button type="button" class="act act-toggle" data-compare="${esc(c.id)}" aria-pressed="${compared}">对比<span class="vh"> ${esc(c.title)}</span></button>
  </div>
</li>`;
  }
  function statusText() {
    const total = filtered.length;
    const shown = Math.min(state.visible, total);
    if (!total) return '没有符合条件的参考';
    return shown < total ? `显示 ${shown} 条，共 ${total} 条` : `共 ${total} 条`;
  }
  function drawGroupNote() {
    const note = $('groupNote');
    if (state.category === 'all') { note.hidden = true; note.innerHTML = ''; return; }
    note.innerHTML = `<p class="group-desc">${esc(groupName(state.category))}：${esc(groupDescriptions[state.category] || '')}</p><p class="group-caveat"><span>限制</span>${esc(categoryCaveats[state.category] || '')}</p>`;
    note.hidden = false;
  }
  function drawEmpty() {
    const empty = $('emptyState');
    if (filtered.length) { empty.hidden = true; return; }
    const savedOnly = state.facet === 'saved' && state.saves.size === 0;
    $('emptyText').textContent = savedOnly
      ? '还没有收藏。在条目上按“收藏”，它会出现在这里。'
      : '没有符合条件的参考。换个关键词，或清除筛选。';
    $('resetFilters').textContent = savedOnly ? '查看全部参考' : '清除筛选';
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
    more.textContent = `显示更多（还有 ${remaining} 条）`;
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
    $('loadMore').textContent = `显示更多（还有 ${remaining} 条）`;
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
    toast(saved ? `已收藏 ${c.title}` : `已取消收藏 ${c.title}`);
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
    $('compareCount').textContent = `对比 ${n} / ${COMPARE_MAX}`;
    $('compareItems').innerHTML = state.compare.map((id) => {
      const c = byId.get(id);
      return `<li><span class="dock-name">${esc(c.title)}</span><button type="button" class="dock-remove" data-uncompare="${esc(id)}" aria-label="从对比中移除 ${esc(c.title)}">移除</button></li>`;
    }).join('');
    const open = $('openCompare');
    open.disabled = n < 2;
    open.textContent = n < 2 ? '再选 1 个可对比' : '开始对比';
  }
  function toggleCompare(id) {
    const c = byId.get(id);
    if (!c) return;
    const i = state.compare.indexOf(id);
    if (i >= 0) {
      state.compare.splice(i, 1);
      toast(`已移出对比：${c.title}`);
    } else if (state.compare.length >= COMPARE_MAX) {
      toast(`最多对比 ${COMPARE_MAX} 个。先在底部对比栏移除一个，再加入 ${c.title}。`);
      return;
    } else {
      state.compare.push(id);
      toast(`已加入对比：${c.title}（${state.compare.length} / ${COMPARE_MAX}）`);
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
        toast(`已移出对比：${c.title}。至少选 2 个才能对比。`);
      } else {
        drawCompare();
        toast(`已移出对比：${c.title}`);
      }
    } else {
      toast(`已移出对比：${c.title}`);
      const next = document.querySelector('#compareItems .dock-remove') || $('openCompare');
      if (!$('compareDock').hidden && next) next.focus();
      else $('resultStatus').focus({ preventScroll: true });
    }
  }
  function drawCompare() {
    const selected = state.compare.map((id) => byId.get(id)).filter(Boolean);
    const row = (label, fn) => `<tr><th scope="row">${label}</th>${selected.map((c) => `<td data-case="${esc(c.title)}">${fn(c)}</td>`).join('')}</tr>`;
    $('compareBody').innerHTML = `<h2 id="compareTitle" class="sheet-title">并排对比</h2>
<div class="compare-wrap">
<table class="compare-table" data-n="${selected.length}">
  <thead><tr><td></td>${selected.map((c) => `<th scope="col"><span class="cmp-id">${esc(c.id)}　${esc(c.categoryLabel)}</span><span class="cmp-name">${esc(c.title)}</span><button type="button" class="btn btn-quiet cmp-remove" data-uncompare="${esc(c.id)}">移除<span class="vh"> ${esc(c.title)}</span></button></th>`).join('')}</tr></thead>
  <tbody>
    ${row('地区／行业', (c) => esc(c.market))}
    ${row('核心机制', (c) => esc(c.insight))}
    ${row('具体看哪里', (c) => esc(exactLooks[c.id] || groupDescriptions[c.category]))}
    ${row('瓷砖项目借鉴', (c) => esc(c.application))}
    ${row('标签', (c) => esc((c.tags || []).join('、')))}
    ${row('性质／时间', (c) => esc(c.dating) + (c.featured ? '，精选' : ''))}
    ${row('风险与限制', (c) => esc(categoryCaveats[c.category]))}
    ${row('原始链接', (c) => ext(c.url, '访问网站'))}
  </tbody>
</table>
</div>`;
  }
  function openCompare() {
    if (state.compare.length < 2) { toast('至少选 2 个才能对比。'); return; }
    drawCompare();
    $('compareDialog').showModal();
  }

  /* ---------- 详情 ---------- */
  let openDetailId = null;
  function detailActions(c) {
    const saved = state.saves.has(c.id);
    const compared = state.compare.includes(c.id);
    return `${ext(c.url, '访问网站', 'btn btn-solid')}
<button type="button" class="btn btn-line act-toggle" data-save="${esc(c.id)}" aria-pressed="${saved}">收藏</button>
<button type="button" class="btn btn-line act-toggle" data-compare="${esc(c.id)}" aria-pressed="${compared}">对比</button>`;
  }
  function showDetail(id) {
    const c = byId.get(id);
    if (!c) return false;
    const refs = additionalSources[c.id] || [];
    const [place, trade] = splitMarket(c.market);
    $('detailBody').innerHTML = `<p class="entry-meta"><span class="entry-id">${esc(c.id)}</span><span class="entry-cat">${esc(c.categoryLabel)}</span><span class="entry-marks">${marks(c)}</span></p>
<h2 id="detailTitle" class="sheet-title">${esc(c.title)}</h2>
<p class="entry-market"><span>${esc(place)}</span>${trade ? `<span>${esc(trade)}</span>` : ''}</p>
<p class="detail-lead">${esc(c.insight)}</p>
<div class="detail-actions">${detailActions(c)}</div>
<dl class="detail-list">
  <div><dt>重点看哪里</dt><dd>${esc(lookFor(c))}</dd></div>
  <div><dt>瓷砖项目借鉴</dt><dd>${esc(c.application)}</dd></div>
  <div><dt>标签</dt><dd>${esc((c.tags || []).join('、'))}</dd></div>
  <div><dt>版本与性质</dt><dd>${esc(c.dating)}${c.isConcept ? '。此条为概念作品，不应作为真实在售产品或技术能力的证明。' : ''}</dd></div>
  <div><dt>适用限制</dt><dd>${esc(categoryCaveats[c.category])}</dd></div>
  <div><dt>研究来源</dt><dd><ul class="detail-sources"><li>${ext(c.url, esc(c.url), 'url')}</li>${refs.map(([label, url]) => `<li>${ext(url, esc(label))}</li>`).join('')}</ul></dd></div>
</dl>
<p class="detail-note">原研究日期：2026 年 11 月 21 日。</p>`;
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
  const txtCase = (c) => `${c.id} | ${c.title}\n类别：${c.categoryLabel}\n地区 / 行业：${c.market}\n链接：${c.url}\n推荐看：${exactLooks[c.id] || groupDescriptions[c.category]}\n核心机制：${c.insight}\n瓷砖项目可借鉴：${c.application}\n标签：${c.tags.join('、')}\n版本 / 类型：${c.dating}\n核验限制：${categoryCaveats[c.category]}\n${(additionalSources[c.id] || []).map(([label, url]) => `补充来源：${label} — ${url}`).join('\n')}`;
  function makeReport(cases) {
    const byGroup = groups.map(([key, name]) => {
      const inGroup = cases.filter((c) => c.category === key);
      return inGroup.length ? `\n==================== ${name} ====================\n\n${inGroup.map(txtCase).join('\n\n---\n\n')}` : '';
    }).join('\n');
    return `材料与界面 — 我的收藏\n${cases.length} 条 · 研究日期 2026-11-21 · 导出于 ${new Date().toLocaleDateString('zh-CN')}\n以下每条均含研究入口、核心机制、瓷砖项目借鉴、分类标签和验证限制。\n${byGroup}\n`;
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
      toast('已复制完整提示词');
    } catch {
      const pre = $('promptText');
      $('promptDetails').open = true;
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(pre);
      sel.removeAllRanges(); sel.addRange(range);
      pre.focus({ preventScroll: true });
      pre.scrollIntoView({ block: 'nearest' });
      toast('无法直接写入剪贴板。提示词已选中，按 Ctrl+C 或 ⌘C 复制。');
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
      toast('已清空对比');
      $('resultStatus').focus({ preventScroll: true });
    });
    $('openCompare').addEventListener('click', openCompare);
    $('exportSaved').addEventListener('click', () => {
      const cases = items.filter((x) => state.saves.has(x.id));
      if (!cases.length) { toast('还没有收藏。先在参考库里收藏条目，再导出。'); return; }
      download(makeReport(cases), 'material-inspiration-favorites.txt');
      toast(`已导出 ${cases.length} 条收藏`);
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
    setupBackLink();
    if (!items.length) {
      $('resultStatus').textContent = '案例数据没有载入。可以下载完整研究文本或案例 CSV 查看全部 90 条。';
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
      $('promptLength').textContent = `全文 ${prompt.length.toLocaleString('zh-CN')} 字符，Markdown 格式`;
    } else {
      $('copyPrompt').disabled = true;
      $('promptLength').textContent = '提示词没有载入，可以直接下载 TXT。';
    }
    setupNavHighlight();
    const id = caseFromHash();
    if (id) showDetail(id);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
