/* Static browsing directory. Source data is maintained in data/catalog.json. */
(async () => {
  'use strict';
  const Source = window.HORS_JEU_DATA;
  const I = window.SportI18n;
  await I.ready;
  const {t, date} = I;
  let D, T, clubs, jobs, sources;
  const searchIndex = {};
  const validSource = ['clubs','opportunities','sources'].every(key => Array.isArray(Source?.[key]));
  if (validSource) for (const collection of ['clubs','opportunities','sources']) {
    searchIndex[collection] = new Map(Source[collection].map(row => [row.id,
      [row, ...I.languages.map(locale => I.content(locale)[collection][row.id])].map(value => JSON.stringify(value)).join(' ')
    ]));
  }
  function localizeCatalog() {
    const content = I.content();
    D = {...Source, ...content};
    for (const collection of ['clubs','opportunities','sources']) {
      D[collection] = Source[collection].map(row => ({...row,...content[collection][row.id]}));
    }
    T = D.taxonomies;
    clubs = new Map(D.clubs.map(c => [c.id,c]));
    jobs = new Map(D.opportunities.map(o => [o.id,o]));
    sources = new Map(D.sources.map(s => [s.id,s]));
  }
  const $ = id => document.getElementById(id);
  if (!validSource) {
    $('main').innerHTML = `<h2>${t('load.title')}</h2><p>${t('load.body')}</p><button class="button" onclick="location.reload()">${t('load.reload')}</button>`;
    document.addEventListener('click',async event => {
      const language = event.target.closest('[data-language]')?.dataset.language;
      if (language) { await I.changeLanguage(language); location.reload(); }
    });
    return;
  }
  localizeCatalog();
  const routes = {internships:'nav.internships',clubs:'nav.clubs',jobs:'nav.jobs',resources:'nav.resources'};
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const matches = (q, values) => norm(q).trim().split(/\s+/).every(word => norm(values.join(' ')).includes(word));
  const url = value => {
    try { const u = new URL(value); return ['https:', 'http:', 'mailto:', 'tel:'].includes(u.protocol) ? esc(u.href) : ''; }
    catch { return ''; }
  };
  const ext = (href, label, cls = '') => url(href) ? `<a href="${url(href)}" target="_blank" rel="noopener noreferrer" class="${cls}">${esc(label)} <span aria-hidden="true">↗</span></a>` : '';
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const expired = o => ['expired','historical'].includes(o.status) || Boolean(o.deadline && o.deadline < today);
  const statusBadge = o => {
    const [label, cls] = expired(o) ? [t('status.expired'), 'expired'] : o.status === 'listed' ? [t('status.listed'), 'listed'] : o.status === 'detail-limited' ? [t('status.limited'), 'limited'] : [t('status.program'), ''];
    return `<span class="badge ${cls}">${label}</span>`;
  };
  const payBadge = o => `<span class="badge">${esc(T.pay[o.payStatus])}</span>`;
  const activeClubs = Source.clubs.filter(c => c.kind === 'club' && c.status === 'active');
  const internRows = Source.opportunities.filter(o => ['internship','program'].includes(o.type));
  const otherRows = Source.opportunities.filter(o => ['job','volunteer'].includes(o.type));
  const navCounts = {internships: internRows.length, clubs: activeClubs.length, jobs: otherRows.length, resources: D.sources.length};
  const state = {
    route: 'internships',
    internships: {tab:'specific', q:'', geo:'', pay:''},
    clubs: {tab:'active', q:'', geo:'', sport:'', tier:''},
    jobs: {tab:'job', q:'', geo:'', pay:''},
    resources: {q:''},
    returnHash: '#internships', detail: null, expandedFilters: new Set()
  };
  const categoryItems = page => page === 'internships' ? [
    ['specific',t('category.specific'),internRows.filter(o => o.type === 'internship' && !expired(o)).length],
    ['program',t('category.program'),internRows.filter(o => o.type === 'program' && !expired(o)).length],
    ['expired',t('category.expired'),internRows.filter(expired).length],
    ['all',t('category.all'),internRows.length]
  ] : page === 'clubs' ? [
    ['active',t('category.active'),activeClubs.length],
    ['employer',t('category.employer'),D.clubs.filter(c => c.kind === 'employer').length],
    ['inactive',t('category.inactive'),D.clubs.filter(c => c.status === 'inactive').length]
  ] : [
    ['job',t('category.job'),otherRows.filter(o => o.type === 'job').length],
    ['volunteer',t('category.volunteer'),otherRows.filter(o => o.type === 'volunteer').length]
  ];
  function pageHash(page = state.route) {
    const params = new URLSearchParams();
    for (const [key,value] of Object.entries(state[page])) if (value) params.set(key,value);
    return `#${page}${params.size ? '?' + params : ''}`;
  }
  function saveFilters() { history.replaceState(null, '', pageHash()); }
  function readFilters(page, query) {
    const params = new URLSearchParams(query);
    const defaults = page === 'resources' ? {q:''} : Object.fromEntries(Object.keys(state[page]).map(k => [k, k === 'tab' ? categoryItems(page)[0][0] : '']));
    for (const key of Object.keys(defaults)) {
      const value = params.get(key) ?? defaults[key];
      const tax = {geo:T.geography, pay:T.pay, sport:T.sport, tier:T.tier}[key];
      state[page][key] = key === 'tab' ? (categoryItems(page).some(t => t[0] === value) ? value : defaults[key]) : tax ? (Object.hasOwn(tax,value) ? value : '') : value.slice(0,200);
    }
  }
  function renderNav() {
    $('main-nav').innerHTML = Object.entries(routes).map(([id,label]) => `<a href="${esc(pageHash(id))}" ${id === state.route ? 'aria-current="page"' : ''}>${t(label)}<span class="nav-count">${navCounts[id]}</span></a>`).join('');
  }
  function tabs(page) {
    return `<div class="tabs" role="group" aria-label="${esc(t('category.label',{section:t(routes[page])}))}">${categoryItems(page).map(([id,label,count]) => `<button class="tab" data-tab="${id}" aria-pressed="${state[page].tab === id}">${label}<small>${count}</small></button>`).join('')}</div>`;
  }
  function select(key, taxonomy) {
    const labelKey = {geo:'Geo',sport:'Sport',tier:'Tier',pay:'Pay'}[key];
    const label = t('filter.' + key);
    return `<label class="filter-field"><span>${esc(label)}</span><select data-filter="${key}" aria-label="${esc(label)}"><option value="">${esc(t('filter.all' + labelKey))}</option>${Object.entries(taxonomy).map(([id,text]) => `<option value="${esc(id)}" ${state[state.route][key] === id ? 'selected' : ''}>${esc(text)}</option>`).join('')}</select></label>`;
  }
  function filters(page) {
    const placeholder = t(page === 'clubs' ? 'filter.clubsPlaceholder' : page === 'resources' ? 'filter.sourcesPlaceholder' : 'filter.jobsPlaceholder');
    const count = Object.entries(state[page]).filter(([k,v]) => !['q','tab'].includes(k) && v).length;
    const expanded = state.expandedFilters.has(page) || count > 0;
    return `<div class="filter-bar ${expanded ? 'expanded' : ''}"><label class="filter-field search"><span>${t('filter.search')}</span><input id="directory-search" type="search" enterkeyhint="search" maxlength="200" value="${esc(state[page].q)}" placeholder="${esc(placeholder)}" aria-label="${esc(t('filter.searchLabel',{section:t(routes[page])}))}"></label>${page !== 'resources' ? `<button class="filter-toggle" data-action="filters" aria-expanded="${expanded}" aria-controls="filter-options">${t('filter.label')}${count ? ' · ' + count : ''} <span aria-hidden="true">${expanded ? '−' : '+'}</span></button><div id="filter-options" class="filter-options">${select('geo',T.geography)}${page === 'clubs' ? select('sport',T.sport) + select('tier',T.tier) : select('pay',T.pay)}<button class="reset" data-action="reset">${t('filter.reset')}</button></div>` : `<button class="reset" data-action="reset">${t('filter.reset')}</button>`}</div>`;
  }
  function heading(title, note) { return `<div class="section-heading"><h2>${title}</h2><p>${note}</p></div>`; }
  function render() {
    renderNav();
    const page = state.route;
    $('main').innerHTML = page === 'resources' ? resourcesPage() : `${heading(t('heading.'+page),t('heading.'+page+'Note'))}${tabs(page)}${filters(page)}<div class="results-meta"><span id="result-count" role="status" aria-live="polite"></span><span>${page === 'clubs' ? t('results.clubMeta') : t('site.snapshot',{date:date(D.meta.verifiedAt)})}</span></div><div id="results"></div><p class="section-note">${t(page === 'clubs' ? 'note.clubs' : 'note.jobs')}</p>`;
    renderResults();
    document.title = t('site.pageTitle',{section:t(routes[page])});
  }
  function filteredRows() {
    const page = state.route, f = state[page];
    if (page === 'resources') return D.sources.filter(s => matches(f.q,[searchIndex.sources.get(s.id)]));
    if (page === 'clubs') return D.clubs.filter(c => {
      const tab = f.tab === 'active' ? c.kind === 'club' && c.status === 'active' : f.tab === 'employer' ? c.kind === 'employer' : c.status === 'inactive';
      return tab && (!f.geo || c.geography === f.geo) && (!f.sport || c.sport === f.sport) && (!f.tier || c.tier === f.tier) && matches(f.q,[searchIndex.clubs.get(c.id),...I.languages.map(l=>I.content(l).taxonomies.sport[c.sport])]);
    });
    return D.opportunities.filter(o => (page === 'internships' ? ['internship','program'] : ['job','volunteer']).includes(o.type)).filter(o => {
      const c = clubs.get(o.clubId);
      const tab = page === 'jobs' ? o.type === f.tab : f.tab === 'all' ? true : f.tab === 'expired' ? expired(o) : f.tab === 'program' ? o.type === 'program' && !expired(o) : o.type === 'internship' && !expired(o);
      return tab && (!f.geo || c.geography === f.geo) && (!f.pay || o.payStatus === f.pay) && matches(f.q,[searchIndex.opportunities.get(o.id),c.name,Source.clubs.find(row=>row.id===c.id).nameZh,c.city,...I.languages.map(l=>I.content(l).taxonomies.geography[c.geography])]);
    }).sort((a,b) => b.priority - a.priority);
  }
  function renderResults() {
    const rows = filteredRows(), page = state.route;
    $('result-count').textContent = t('results.'+(page === 'clubs' ? 'club' : page === 'resources' ? 'source' : 'opportunity'),{count:rows.length});
    $('results').innerHTML = rows.length ? `<div class="results-list">${rows.map(page === 'clubs' ? clubRow : page === 'resources' ? sourceRow : jobRow).join('')}</div>` : `<div class="empty"><h3>${t('results.emptyTitle')}</h3><p>${t('results.emptyBody')}</p><button class="button" data-action="reset">${t('filter.clear')}</button></div>`;
  }
  function jobRow(o) {
    const c = clubs.get(o.clubId);
    return `<article class="result-row" data-opportunity="${esc(o.id)}"><div><h3><button class="title-button" data-detail="opportunity" data-id="${esc(o.id)}">${esc(o.displayTitle)}</button></h3><p class="original-title">${esc(o.title)}</p><p class="employer"><a href="#club/${esc(c.id)}">${esc(c.name)}</a></p></div><div class="row-meta"><p class="city">${esc(c.city)}</p><p>${esc(o.period)}</p><p>${esc(o.duration)}</p></div><div class="row-status">${statusBadge(o)}${payBadge(o)}</div><div class="row-actions"><button data-detail="opportunity" data-id="${esc(o.id)}" aria-label="${esc(t('action.detailsLabel',{title:o.displayTitle}))}">${t('action.details')} →</button>${ext(expired(o) ? c.careerUrl || c.website : o.sourceUrl, t(expired(o) ? 'action.latest' : 'action.posting'))}</div></article>`;
  }
  function siteLabel(c) {
    if (c.status === 'inactive') return t('action.closure');
    if (c.tier === 'junior' && c.id !== '67s') return t('action.league');
    if (c.id === 'manotick') return t('action.leagueDirectory');
    if (c.id === '67s') return t('action.group');
    if (c.id === 'groupech') return t('action.company');
    return t('action.website');
  }
  const clubWebsite = c => c.status === 'inactive' ? sources.get('blackbears-closed')?.url || c.website : c.website;
  function clubRow(c) {
    return `<article class="result-row club-row" data-club="${esc(c.id)}"><div><h3><button class="title-button" data-detail="club" data-id="${esc(c.id)}">${esc(c.name)}</button></h3>${c.alias ? `<p class="original-title">${esc(c.alias)}</p>` : ''}<p class="description">${esc(c.description)}</p></div><div class="row-meta"><p class="city">${esc(c.city)}</p><p>${esc(c.league)}</p></div><div class="row-status"><span class="badge">${esc(T.sport[c.sport])}</span><span class="badge ${c.status === 'inactive' ? 'expired' : ''}">${esc(c.status === 'inactive' ? t('status.inactive') : T.tier[c.tier])}</span></div><div class="row-actions"><button data-detail="club" data-id="${esc(c.id)}" aria-label="${esc(t('action.profileLabel',{name:c.name}))}">${t('action.profile')} →</button>${ext(c.careerUrl || clubWebsite(c), c.careerUrl && c.status !== 'inactive' ? t('action.careers') : siteLabel(c))}</div></article>`;
  }
  function resourcesPage() {
    return `${heading(t('sources.heading'),t('sources.date',{date:date(D.meta.verifiedAt)}))}<div class="portal-grid">${D.resources.map(r => `<article class="portal"><h3>${ext(r.url,r.title)}</h3><p>${esc(r.note)}</p></article>`).join('')}</div><details class="method"><summary>${t('sources.coverage')}</summary><div class="method-body">${D.coverage.map(c => `<section><h4>${esc(c.name)}</h4><p>${esc(c.description)}</p></section>`).join('')}<ul>${D.cautions.map(p => `<li>${esc(p)}</li>`).join('')}</ul>${D.history.map(h => `<section class="history"><h4>${esc(h.name)}</h4><p>${esc(h.text)} ${ext(sources.get(h.sourceId)?.url,t('action.originalEvidence'))}</p></section>`).join('')}</div></details>${heading(t('sources.records'),t('sources.searchNote'))}${filters('resources')}<div class="results-meta"><span id="result-count" role="status" aria-live="polite"></span><span>${t('sources.statusNote')}</span></div><div id="results"></div>`;
  }
  function sourceRow(s) {
    return `<article class="source-row"><span class="number">${String(D.sources.indexOf(s)+1).padStart(2,'0')}</span><div><h3>${ext(s.url,s.title)}</h3><p>${esc(s.publisher)}${s.notes ? ' · ' + esc(s.notes) : ''}</p><p>${esc(new URL(s.url).hostname)}</p></div><div class="source-meta"><time datetime="${esc(s.checkedAt)}">${date(s.checkedAt)}</time><span class="badge ${s.access === 'full' ? 'listed' : 'limited'}">${t('sources.'+s.access)}</span></div></article>`;
  }
  const fields = items => `<dl class="detail-grid">${items.map(([label,value]) => `<div class="detail-cell"><dt>${esc(t('field.'+label))}</dt><dd>${esc(value || t('detail.unknown'))}</dd></div>`).join('')}</dl>`;
  const list = (key, items) => items?.length ? `<section class="detail-block"><h3>${esc(t(key))}</h3><ul>${items.map(i => `<li>${esc(i)}</li>`).join('')}</ul></section>` : '';
  function evidence(checkedAt, text, ids) {
    return `<section class="detail-block detail-evidence"><h3><time datetime="${esc(checkedAt)}">${esc(t('detail.evidence',{date:date(checkedAt)}))}</time></h3><p>${esc(text)}</p><div class="link-row">${[...new Set(ids)].map(id => sources.get(id)).filter(Boolean).map(s => ext(s.url,s.title)).join('')}</div></section>`;
  }
  function detailTop(label) {
    return `<div class="dialog-top"><span>${esc(label)}</span><div class="dialog-tools"><select class="language-select" data-language-select aria-label="${esc(t('nav.language'))}"><option value="fr" lang="fr">Français</option><option value="en" lang="en">English</option><option value="zh" lang="zh-CN">中文</option></select><button class="close" data-action="close">${t('detail.close')} ×</button></div></div>`;
  }
  function opportunityDetail(o) {
    const c = clubs.get(o.clubId);
    return `${detailTop(T.type[o.type])}<div class="dialog-body"><h2 id="dialog-title">${esc(o.displayTitle)}</h2><p class="original-title">${esc(o.title)}</p><a class="detail-company" href="#club/${esc(c.id)}">${esc(c.name)} · ${esc(c.city)} →</a><div class="row-status">${statusBadge(o)}${payBadge(o)}</div>${expired(o) ? `<p class="notice">${t('detail.expiredNote')}</p>` : ''}${fields([['department',o.department],['workMode',o.workMode],['period',o.period],['duration',o.duration],['pay',o.payText],['contract',o.contract],['deadline',date(o.deadline)],['posted',date(o.postedAt)]])}${list('detail.responsibilities',o.responsibilities)}${list('detail.requirements',o.requirements)}<section class="detail-block"><h3>${t(expired(o) ? 'detail.oldApplication' : 'detail.application')}</h3><p>${esc(o.applyInstructions)}</p>${o.applyEmail ? `<p class="muted">${t('detail.email')} ${ext('mailto:' + o.applyEmail,o.applyEmail)}</p>` : ''}</section>${list('detail.unknowns',o.unknowns)}${evidence(o.verifiedAt,o.evidence,o.sourceIds)}</div><div class="detail-footer">${ext(expired(o) ? c.careerUrl || c.website : o.applyUrl,t(expired(o) ? 'detail.latest' : 'detail.apply'),'button primary')}${ext(o.sourceUrl,t('detail.original'),'button')}</div>`;
  }
  function clubDetail(c) {
    const related = D.opportunities.filter(o => o.clubId === c.id);
    return `${detailTop(t(c.kind === 'employer' ? 'detail.employer' : 'detail.club'))}<div class="dialog-body"><h2 id="dialog-title">${esc(c.name)}</h2>${c.alias ? `<p class="original-title">${esc(c.alias)}</p>` : ''}<div class="row-status"><span class="badge">${esc(T.sport[c.sport])}</span><span class="badge ${c.status === 'inactive' ? 'expired' : ''}">${esc(c.status === 'inactive' ? t('status.inactive') : T.tier[c.tier])}</span></div><p class="detail-description">${esc(c.description)}</p>${fields([['city',c.city],['region',T.geography[c.geography]],['league',c.league],['venue',c.venue],['email',c.email],['phone',c.phone]])}<section class="detail-block"><h3>${t('detail.socials')}</h3><div class="link-row">${ext(clubWebsite(c),siteLabel(c),'button')}${c.careerUrl && c.status !== 'inactive' ? ext(c.careerUrl,t('action.careers'),'button') : ''}${c.socials.map(s => ext(s.url,s.platform,'button')).join('')}</div></section><section class="detail-block"><h3>${t('detail.related',{count:related.length})}</h3>${related.length ? `<div class="related-list">${related.map(o => `<a class="related" href="#opportunity/${esc(o.id)}"><span>${esc(o.displayTitle)}<small class="muted"> · ${esc(T.type[o.type])}</small></span>${statusBadge(o)}</a>`).join('')}</div>` : `<p class="muted">${t('detail.noRelated')}</p>`}</section>${evidence(c.verifiedAt,c.notes || t('detail.defaultEvidence'),[...c.sourceIds,...c.socials.map(s => s.sourceId)])}</div><div class="detail-footer">${ext(c.status === 'inactive' ? clubWebsite(c) : c.careerUrl || c.website,c.status === 'inactive' ? t('action.closure') : c.careerUrl ? t('action.careers') : siteLabel(c),'button primary')}</div>`;
  }
  function openDetail(kind,id) {
    const item = (kind === 'club' ? clubs : jobs).get(id);
    if (!item) return false;
    state.detail = {kind,id};
    $('dialog-content').innerHTML = kind === 'club' ? clubDetail(item) : opportunityDetail(item);
    I.applyDocument();
    if (!$('detail-dialog').open) $('detail-dialog').showModal();
    document.documentElement.classList.add('dialog-open');
    $('detail-dialog').scrollTop = 0;
    $('detail-dialog').querySelector('.dialog-body').scrollTop = 0;
    $('detail-dialog').querySelector('.close').focus({preventScroll:true});
    return true;
  }
  function dismissDetail(updateUrl = true) {
    const previous = state.detail;
    state.detail = null;
    $('detail-dialog').close();
    document.documentElement.classList.remove('dialog-open');
    if (updateUrl) history.replaceState(null,'',state.returnHash);
    if (previous) {
      const trigger = Array.from(document.querySelectorAll('main [data-detail]')).find(el => el.dataset.detail === previous.kind && el.dataset.id === previous.id);
      (trigger || $('main')).focus({preventScroll:true});
    }
  }
  function handleRoute() {
    const hash = location.hash.slice(1);
    if (hash === 'main') { if (!$('results')) render(); $('main').focus(); return; }
    const [route,query = ''] = hash.split('?');
    if (/^(club|opportunity)\//.test(route)) {
      const [kind,id] = route.split('/');
      if (!$('results')) {
        const item = jobs.get(id);
        state.route = kind === 'club' ? 'clubs' : item && ['job','volunteer'].includes(item.type) ? 'jobs' : 'internships';
        if (kind === 'club') { const club = clubs.get(id); state.clubs.tab = club?.status === 'inactive' ? 'inactive' : club?.kind === 'employer' ? 'employer' : 'active'; }
        else if (item && state.route === 'internships') state.internships.tab = expired(item) ? 'expired' : item.type === 'program' ? 'program' : 'specific';
        else if (item) state.jobs.tab = item.type;
        state.returnHash = pageHash();
        render();
      } else if (!state.detail) state.returnHash = pageHash();
      if (!openDetail(kind,id)) { history.replaceState(null,'',state.returnHash); dismissDetail(false); }
      return;
    }
    if (state.detail) dismissDetail(false);
    state.route = Object.hasOwn(routes,route) ? route : 'internships';
    readFilters(state.route,query);
    render();
    window.scrollTo(0,0);
  }
  function reset() {
    for (const key of Object.keys(state[state.route])) if (key !== 'tab') state[state.route][key] = '';
    state.expandedFilters.delete(state.route);
    saveFilters(); render(); $('directory-search').focus({preventScroll:true});
  }
  async function switchLanguage(locale) {
    if (!I.languages.includes(locale) || locale === I.language) return;
    const y = window.scrollY;
    const detail = state.detail ? {...state.detail} : null;
    const body = document.querySelector('.dialog-body');
    const ratio = body && body.scrollHeight > body.clientHeight ? body.scrollTop / (body.scrollHeight-body.clientHeight) : 0;
    const openMethod = Boolean(document.querySelector('.method[open]'));
    const search = $('directory-search');
    const selection = document.activeElement === search ? [search.selectionStart,search.selectionEnd] : null;
    await I.changeLanguage(locale);
    localizeCatalog();
    render();
    if (openMethod) document.querySelector('.method')?.setAttribute('open','');
    if (detail) {
      openDetail(detail.kind,detail.id);
      const newBody = document.querySelector('.dialog-body');
      newBody.scrollTop = ratio * (newBody.scrollHeight-newBody.clientHeight);
      document.querySelector('[data-language-select]').focus({preventScroll:true});
    }
    window.scrollTo(0,y);
    if (selection) $('directory-search').focus({preventScroll:true});
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.language) { switchLanguage(button.dataset.language); return; }
    if (button.dataset.tab) {
      state[state.route].tab = button.dataset.tab;
      saveFilters(); render();
      Array.from(document.querySelectorAll('[data-tab]')).find(el => el.dataset.tab === button.dataset.tab)?.focus({preventScroll:true});
    } else if (button.dataset.detail) {
      state.returnHash = pageHash();
      location.hash = `${button.dataset.detail}/${button.dataset.id}`;
    } else if (button.dataset.action === 'filters') {
      const expanded = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded',String(expanded));
      button.querySelector('span').textContent = expanded ? '−' : '+';
      button.closest('.filter-bar').classList.toggle('expanded',expanded);
      if (expanded) state.expandedFilters.add(state.route); else state.expandedFilters.delete(state.route);
    } else if (button.dataset.action === 'reset') reset();
    else if (button.dataset.action === 'close') dismissDetail();
  });
  document.addEventListener('input', event => {
    if (event.target.id !== 'directory-search') return;
    state[state.route].q = event.target.value;
    saveFilters(); renderResults(); renderNav();
  });
  document.addEventListener('change', event => {
    if (event.target.hasAttribute('data-language-select')) { switchLanguage(event.target.value); return; }
    const key = event.target.dataset.filter;
    if (!key) return;
    state[state.route][key] = event.target.value;
    const count = Object.entries(state[state.route]).filter(([k,v]) => !['q','tab'].includes(k) && v).length;
    const toggle = document.querySelector('.filter-toggle');
    if (toggle) toggle.innerHTML = `${t('filter.label')}${count ? ' · ' + count : ''} <span aria-hidden="true">−</span>`;
    saveFilters(); renderResults(); renderNav();
  });
  document.addEventListener('keydown', event => {
    if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName) && !$('detail-dialog').open) {
      event.preventDefault(); $('directory-search')?.focus();
    }
  });
  $('detail-dialog').addEventListener('cancel', event => { event.preventDefault(); dismissDetail(); });
  $('detail-dialog').addEventListener('click', event => {
    if (event.target !== $('detail-dialog')) return;
    const rect = event.target.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dismissDetail();
  });
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
})();
