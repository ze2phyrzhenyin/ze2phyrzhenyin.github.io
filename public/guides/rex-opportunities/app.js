(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const form = $('#filters');
  const fieldIDs = ['search','country','sector','goal','city','priority','month'];
  const fields = Object.fromEntries(fieldIDs.map(id => [id,document.getElementById(id)]));
  const events = [...document.querySelectorAll('#event-list .event')];
  const normalize = value => value.normalize('NFKD').replace(/\p{Diacritic}/gu,'').toLocaleLowerCase();
  const textIndex = new Map(events.map(e => [e,normalize(e.textContent)]));
  const validIDs = new Set(events.map(e => e.id));
  const expand = $('#expand');
  const sort = $('#sort');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new WeakMap();
  let view = 'all', saved = new Set(), toastTimer;
  try {
    const stored = JSON.parse(localStorage.getItem('rex-opportunities-saved') || '[]');
    if (Array.isArray(stored)) saved = new Set(stored.filter(id=>validIDs.has(id)));
  } catch { /* Browsing remains available when storage is blocked. */ }
  const query = new URLSearchParams(location.search);
  for (const [id,field] of Object.entries(fields)) if (query.has(id)) field.value = query.get(id);
  if (['all','new','priority','saved'].includes(query.get('view'))) view = query.get('view');
  if (['date','priority','deadline'].includes(query.get('sort'))) sort.value = query.get('sort');
  function toast(message) {
    clearTimeout(toastTimer); $('#toast').textContent = message;
    toastTimer = setTimeout(() => { $('#toast').textContent = ''; },2600);
  }
  function syncURL() {
    const url = new URL(location.href);
    for (const [id,field] of Object.entries(fields)) field.value ? url.searchParams.set(id,field.value) : url.searchParams.delete(id);
    view==='all' ? url.searchParams.delete('view') : url.searchParams.set('view',view);
    sort.value==='date' ? url.searchParams.delete('sort') : url.searchParams.set('sort',sort.value);
    try { history.replaceState(null,'',url); } catch { /* File previews can forbid history writes. */ }
  }
  function updateExpand() {
    const visible = events.filter(e => !e.hidden);
    expand.hidden = !visible.length;
    expand.textContent = visible.length && visible.every(e=>e.open) ? '收起当前活动' : '展开当前活动';
  }
  function filter({sync=true}={}) {
    const terms = normalize(fields.search.value.trim()).split(/\s+/).filter(Boolean);
    let count = 0;
    for (const e of events) {
      e.hidden = !(
        terms.every(term => textIndex.get(e).includes(term)) &&
        (!fields.country.value || e.dataset.country === fields.country.value) &&
        (!fields.sector.value || e.dataset.sectors.split('|').includes(fields.sector.value)) &&
        (!fields.goal.value || e.dataset.goals.split('|').includes(fields.goal.value)) &&
        (!fields.city.value || e.dataset.city === fields.city.value) &&
        (!fields.priority.value || e.dataset.priority === fields.priority.value) &&
        (!fields.month.value || e.dataset.date.startsWith(fields.month.value)) &&
        (view!=='new' || e.dataset.update === '本期新增') &&
        (view!=='priority' || e.dataset.priority === 'A') &&
        (view!=='saved' || saved.has(e.id))
      );
      if (!e.hidden) count++;
    }
    $('#result-count').textContent = `${count} / ${events.length} 项活动`;
    $('#empty').hidden = count !== 0;
    $('#event-list').hidden = count === 0;
    const selected = Object.entries(fields).filter(([,field])=>field.value).map(([id,field])=>id==='search'?`“${field.value}”`:field.value);
    if(view!=='all') selected.unshift({new:'本期新增',priority:'优先行动',saved:'我的收藏'}[view]);
    $('#filter-summary').textContent = selected.join(' · ') || '全部地区与行业';
    document.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.view===view)));
    updateExpand();
    if(sync) syncURL();
  }
  function sortEvents() {
    const key = sort.value;
    [...events].sort((a,b) => {
      if(key==='priority') return a.dataset.priority.localeCompare(b.dataset.priority) || (a.dataset.date||'9999').localeCompare(b.dataset.date||'9999');
      if(key==='deadline') return (a.dataset.deadline||'9999').localeCompare(b.dataset.deadline||'9999') || (a.dataset.date||'9999').localeCompare(b.dataset.date||'9999');
      return (a.dataset.date||'9999').localeCompare(b.dataset.date||'9999');
    }).forEach(e=>$('#event-list').append(e));
  }
  function resetFilters() {
    for(const field of Object.values(fields)) field.value = '';
    view = 'all'; sort.value = 'date'; sortEvents(); filter();
  }
  form.hidden=false; $('.sort-label').hidden=false;
  form.addEventListener('submit',e=>e.preventDefault());
  form.addEventListener('input',()=>filter());
  form.addEventListener('change',()=>filter());
  form.addEventListener('reset',e=>{e.preventDefault();resetFilters();});
  $('#empty-reset').addEventListener('click',resetFilters);
  document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{view=button.dataset.view;filter();}));
  sort.addEventListener('change',()=>{sortEvents();syncURL();});
  const more = $('#more-filters');
  function setMore(open) { more.setAttribute('aria-expanded',String(open)); $('#filter-extra').hidden=!open; }
  more.addEventListener('click',()=>setMore(more.getAttribute('aria-expanded')!=='true'));
  if(['goal','city','priority','month'].some(id=>fields[id].value)) setMore(true);

  function stopAnimation(e) {
    const active = animations.get(e);
    if(active) { active.animation.cancel(); animations.delete(e); }
    e.style.height=''; e.style.overflow='';
  }
  for(const e of events) {
    e.addEventListener('toggle',updateExpand);
    e.querySelector('summary').addEventListener('click',event=>{
      if(reducedMotion.matches || !e.animate || event.ctrlKey || event.metaKey || event.shiftKey) return;
      event.preventDefault();
      const previous = animations.get(e);
      const open = previous ? !previous.open : !e.open;
      const start = e.getBoundingClientRect().height;
      stopAnimation(e);
      e.open = true;
      const end = open ? e.getBoundingClientRect().height : e.querySelector('summary').getBoundingClientRect().height + 1;
      e.style.overflow='hidden';
      const animation = e.animate([{height:`${start}px`},{height:`${end}px`}],{duration:200,easing:'cubic-bezier(.2,.7,.2,1)'});
      animations.set(e,{animation,open});
      animation.onfinish=()=>{ e.open=open; e.style.overflow=''; animations.delete(e); updateExpand(); };
    });
  }
  expand.addEventListener('click',()=>{
    const visible=events.filter(e=>!e.hidden), open=!visible.every(e=>e.open);
    visible.forEach(e=>{stopAnimation(e);e.open=open;});updateExpand();
  });
  function renderSaved() {
    $('#saved-count').textContent=String(saved.size);
    for(const e of events) {
      const button=e.querySelector('.save-event'), active=saved.has(e.id);
      button.hidden=false;button.setAttribute('aria-pressed',String(active));
      button.querySelector('span').textContent=active?'已收藏':'收藏活动';
      e.querySelector('.saved-mark').hidden=!active;
    }
  }
  document.querySelectorAll('.save-event').forEach(button=>button.addEventListener('click',()=>{
    const id=button.dataset.id;
    saved.has(id)?saved.delete(id):saved.add(id);
    let persisted=true;
    try {localStorage.setItem('rex-opportunities-saved',JSON.stringify([...saved]));}catch{persisted=false;}
    renderSaved(); filter();
    if(button.closest('.event').hidden) $('[data-view="saved"]').focus({preventScroll:true});
    toast(persisted?(saved.has(id)?'已收藏，保存在当前浏览器':'已取消收藏'):'浏览器存储不可用，收藏仅保留在本次页面中');
  }));
  function revealHash() {
    let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}
    const target=document.getElementById(id);
    if(!target?.classList.contains('event'))return;
    if(target.hidden)resetFilters();
    stopAnimation(target);target.open=true;
    requestAnimationFrame(()=>target.scrollIntoView({block:'start',behavior:reducedMotion.matches?'instant':'smooth'}));
  }
  window.addEventListener('hashchange',revealHash);
  document.addEventListener('click',e=>{
    const a=e.target.closest('a[href^="#"]');
    if(a && a.hash===location.hash)revealHash();
  });
  sortEvents();renderSaved();filter({sync:false});revealHash();

  const deadlineButtons=[...document.querySelectorAll('[data-window]')];
  $('.deadline-tabs').hidden=false;
  function filterDeadlines(window) {
    deadlineButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.window===window)));
    document.querySelectorAll('.deadline-list li').forEach(li=>{li.hidden=window!=='all' && Number(li.dataset.days)>Number(window);});
  }
  deadlineButtons.forEach(b=>b.addEventListener('click',()=>filterDeadlines(b.dataset.window)));
  filterDeadlines('7');

  const theme=$('#theme-toggle');
  function updateTheme() {
    const dark=document.documentElement.dataset.theme==='dark';
    theme.textContent=dark?'亮色':'深色';theme.setAttribute('aria-label',dark?'切换到亮色模式':'切换到深色模式');
    $('meta[name="theme-color"]').content=dark?'#151d23':'#f5f7f8';
  }
  if(window.GuideTheme) {theme.hidden=false;theme.addEventListener('click',()=>window.GuideTheme.toggle());document.addEventListener('guide-theme-change',updateTheme);updateTheme();}
  const sections=[...document.querySelectorAll('main>section')];
  let frame;
  function updateNav() {
    frame=null;
    const current=[...sections].reverse().find(s=>s.getBoundingClientRect().top<180)?.id || sections[0].id;
    document.querySelectorAll('.sidebar nav a,.mobile-nav a').forEach(a=>{a.hash===`#${current}`?a.setAttribute('aria-current','location'):a.removeAttribute('aria-current');});
  }
  window.addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(updateNav);},{passive:true});updateNav();

  const prompt=$('#prompt-text'),status=$('#copy-status');
  function selectPrompt() {
    prompt.closest('details').open=true;
    const range=document.createRange();range.selectNodeContents(prompt);
    const selection=getSelection();selection.removeAllRanges();selection.addRange(range);prompt.focus();
    status.textContent='已选中全文，可使用系统复制命令。';
  }
  $('#copy-prompt').hidden=false;$('#select-prompt').hidden=false;
  $('#select-prompt').addEventListener('click',selectPrompt);
  $('#copy-prompt').addEventListener('click',async()=>{
    try {await navigator.clipboard.writeText(prompt.textContent);status.textContent='完整提示词已复制。';toast('提示词已复制');}
    catch {selectPrompt();status.textContent='浏览器未允许自动复制，已选中全文。可使用系统复制或下载 TXT。';}
  });
  let printState;
  window.addEventListener('beforeprint',()=>{
    printState={details:[...document.querySelectorAll('details')].map(e=>[e,e.open]),visibility:[...events,...document.querySelectorAll('.deadline-list li'),$('#event-list')].map(e=>[e,e.hidden])};
    printState.details.forEach(([e])=>{stopAnimation(e);e.open=true;});printState.visibility.forEach(([e])=>{e.hidden=false;});
  });
  window.addEventListener('afterprint',()=>{
    printState?.details.forEach(([e,open])=>{e.open=open;});printState?.visibility.forEach(([e,hidden])=>{e.hidden=hidden;});printState=null;
  });
  $('#print').hidden=false;$('#print').addEventListener('click',()=>window.print());
})();
