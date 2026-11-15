(() => {
  'use strict';
  const form = document.querySelector('#filters');
  const fields = ['search', 'goal', 'city', 'priority'].map(id => document.getElementById(id));
  const [search, goal, city, priority] = fields;
  const events = [...document.querySelectorAll('#event-list .event')];
  const expand = document.querySelector('#expand');
  const searchable = new Map(events.map(event => [event, event.textContent.toLocaleLowerCase()]));
  const normalize = value => value.normalize('NFKD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase();
  const updateExpand = () => { expand.textContent = events.filter(event => !event.hidden).every(event => event.open) ? '收起当前活动' : '展开当前活动'; };
  function filter() {
    const query = normalize(search.value.trim());
    let count = 0;
    for (const event of events) {
      event.hidden = !((!query || normalize(searchable.get(event)).includes(query)) && (!goal.value || event.dataset.goals.split(' ').includes(goal.value)) && (!city.value || event.dataset.city === city.value) && (!priority.value || event.dataset.priority === priority.value));
      if (!event.hidden) count++;
    }
    document.querySelector('#result-count').textContent = `显示 ${count} / ${events.length} 项活动`;
    document.querySelector('#empty').hidden = count !== 0;
    expand.hidden = count === 0;
    updateExpand();
  }
  form.hidden = false;
  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('input', filter);
  form.addEventListener('change', filter);
  form.addEventListener('reset', () => setTimeout(filter, 0));
  expand.addEventListener('click', () => {
    const visible = events.filter(event => !event.hidden);
    const open = !visible.every(event => event.open);
    visible.forEach(event => { event.open = open; });
    updateExpand();
  });
  events.forEach(event => event.addEventListener('toggle', updateExpand));
  function revealHash() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target?.classList.contains('event')) return;
    if (target.hidden) { form.reset(); fields.forEach(field => { field.value = ''; }); filter(); }
    target.open = true;
    requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
  }
  window.addEventListener('hashchange', revealHash);
  filter();
  revealHash();

  const copy = document.querySelector('#copy-prompt');
  const select = document.querySelector('#select-prompt');
  const prompt = document.querySelector('#prompt-text');
  const status = document.querySelector('#copy-status');
  function selectPrompt() {
    prompt.closest('details').open = true;
    const range = document.createRange();
    range.selectNodeContents(prompt);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    prompt.focus();
    status.textContent = '已选中全文，可使用系统复制命令。';
  }
  select.hidden = false;
  copy.hidden = false;
  select.addEventListener('click', selectPrompt);
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(prompt.textContent);
      status.textContent = '完整提示词已复制。';
    } catch {
      selectPrompt();
      status.textContent = '浏览器未允许自动复制，已选中全文。请使用系统复制命令，或下载 TXT。';
    }
  });
  const print = document.querySelector('#print');
  print.hidden = false;
  let priorDetails;
  let priorVisibility;
  window.addEventListener('beforeprint', () => {
    priorDetails = [...document.querySelectorAll('details')].map(element => [element, element.open]);
    priorVisibility = events.map(element => [element, element.hidden]);
    priorDetails.forEach(([element]) => { element.open = true; });
    priorVisibility.forEach(([element]) => { element.hidden = false; });
  });
  window.addEventListener('afterprint', () => {
    priorDetails?.forEach(([element, open]) => { element.open = open; });
    priorVisibility?.forEach(([element, hidden]) => { element.hidden = hidden; });
  });
  print.addEventListener('click', () => window.print());
})();
