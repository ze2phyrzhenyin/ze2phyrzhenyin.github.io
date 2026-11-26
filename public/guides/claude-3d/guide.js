'use strict';
const base = '/guides/claude-3d/';
const byId = id => document.getElementById(id);
const all = (selector, root = document) => Array.from(root.querySelectorAll(selector));
// The text for this page and language is written into the page by resources/claude-3d/build.mjs.
const lang = document.documentElement.lang;
const copy = JSON.parse(byId('guide-copy').textContent);
const fill = (template, values) => template.replace(/\{(\w+)\}/g, (match, key) => values[key]);
const plurals = new Intl.PluralRules(lang);
const counted = (forms, n, shown = n) => fill(forms[plurals.select(n)] || forms.other, {n: shown});

function keepViewAcrossLanguages() {
  // The other languages open the same page with the same filters and section.
  for (const link of all('.languages a')) link.addEventListener('click',() => {
    const target = new URL(link.href);
    target.search = location.search;
    target.hash = location.hash;
    link.href = target.href;
  });
}
function themeLabel() {
  const dark = document.documentElement.dataset.theme === 'dark';
  byId('theme-label').textContent = dark ? copy.theme.light : copy.theme.dark;
  byId('theme').setAttribute('aria-label',dark ? copy.theme.toLight : copy.theme.toDark);
}
function setParams(values) {
  const url = new URL(location.href);
  for (const [key,value] of Object.entries(values)) {
    if (value) url.searchParams.set(key,value);
    else url.searchParams.delete(key);
  }
  history.replaceState(null,'',url);
}
function setupCover() {
  const buttons = all('[data-view]');
  for (const button of buttons) button.addEventListener('click',() => {
    byId('study').src = base + 'media/' + button.dataset.view + '.webp';
    byId('study').alt = copy.views[button.dataset.view];
    for (const item of buttons) item.setAttribute('aria-pressed',String(item === button));
  });
  const links = all('[data-route]');
  function update() {
    const active = links.find(a => a.hash === location.hash) || links[0];
    for (const a of links) {
      byId(a.hash.slice(1)).hidden = a !== active;
      if (a === active) a.setAttribute('aria-current','true');
      else a.removeAttribute('aria-current');
    }
    const goal = active.dataset.route;
    const deviceAdvice = goal === 'native' ? copy.devices[byId('machine').value]
      : goal === 'code' ? copy.codeAdvice
      : copy.videoAdvice;
    byId('advice').textContent = copy.subjects[byId('subject').value] + copy.adviceJoin + deviceAdvice;
  }
  for (const a of links) a.addEventListener('click',event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (location.hash !== a.hash) history.pushState(null,'',a.hash);
    update();
  });
  addEventListener('hashchange',update);
  addEventListener('popstate',update);
  byId('subject').addEventListener('change',update);
  byId('machine').addEventListener('change',update);
  update();
}
function setupTools() {
  const rows = all('[data-tool]');
  const checkboxes = rows.map(row=>row.querySelector('input'));
  const search = byId('search'), category = byId('category');
  const params = new URLSearchParams(location.search);
  // Accents are ignored, so "eclairage" finds "éclairage".
  const norm = value => value.normalize('NFKC').normalize('NFD').replace(/\p{M}/gu,'').trim().toLowerCase();
  const hint = byId('compare-hint').textContent;
  search.value = params.get('q') || '';
  if (Array.from(category.options).some(o=>o.value === params.get('category'))) category.value = params.get('category');
  const requested = (params.get('compare') || '').split(',').filter(Boolean);
  for (const key of [...new Set(requested)].filter(k=>checkboxes.some(c=>c.value===k)).slice(0,3))
    checkboxes.find(c=>c.value===key).checked = true;
  function filter() {
    const query = norm(search.value);
    for (const row of rows)
      row.hidden = (category.value !== 'all' && row.dataset.category !== category.value) || !norm(row.textContent).includes(query);
    const found = rows.filter(row=>!row.hidden).length;
    byId('found').textContent = found ? counted(copy.found,found) : '';
    byId('no-tools').hidden = found !== 0;
    setParams({q:search.value.trim(), category:category.value==='all'?'':category.value});
  }
  function compare() {
    const selected = rows.filter(row=>row.querySelector('input').checked);
    for (const c of checkboxes) c.disabled = !c.checked && selected.length === 3;
    byId('picked').textContent = selected.length ? fill(copy.picked,{n:selected.length}) : '';
    byId('clear').hidden = !selected.length;
    byId('compare-hint').textContent = selected.length ? counted(copy.chosen,selected.length) : hint;
    const bar = byId('compare-shortcut');
    bar.hidden = !selected.length;
    bar.textContent = fill(copy.shortcut,{n:selected.length});
    setParams({compare:selected.map(row=>row.dataset.tool).join(',')});
    const target = byId('compare-table');
    target.replaceChildren();
    if (!selected.length) return;
    const table = document.createElement('table');
    table.style.setProperty('--columns',selected.length);
    table.setAttribute('aria-label',copy.tableLabel);
    const head = table.createTHead().insertRow();
    function heading(row,label,scope) {
      const cell = document.createElement('th');
      cell.scope = scope; cell.textContent = label; row.append(cell);
      return cell;
    }
    heading(head,copy.tool,'col');
    for (const row of selected) {
      const name = row.querySelector('h2').textContent;
      const cell = heading(head,name,'col');
      const remove = document.createElement('button');
      remove.type = 'button'; remove.textContent = copy.remove;
      remove.setAttribute('aria-label',fill(copy.removeAria,{name}));
      remove.addEventListener('click',() => {
        row.querySelector('input').checked = false;
        compare();
        (target.querySelector('button') || byId('comparison')).focus();
      });
      cell.append(remove);
    }
    const body = table.createTBody();
    for (const [index,selector] of ['.tool-description p','[data-limit]','[data-setup]'].entries()) {
      const tr = body.insertRow(); heading(tr,copy.rows[index],'row');
      for (const row of selected) tr.insertCell().textContent = row.querySelector(selector).textContent;
    }
    target.append(table);
  }
  search.addEventListener('input',filter);
  category.addEventListener('change',filter);
  byId('reset-filter').addEventListener('click',() => { search.value=''; category.value='all'; filter(); search.focus(); });
  for (const checkbox of checkboxes) checkbox.addEventListener('change',compare);
  byId('clear').addEventListener('click',() => {
    for (const c of checkboxes) c.checked=false;
    compare(); byId('comparison').focus();
  });
  new IntersectionObserver(([entry]) => {
    byId('compare-shortcut').classList.toggle('in-view',entry.isIntersecting);
  }).observe(byId('comparison'));
  filter(); compare();
}
function setupCases() {
  const select = byId('case-type'), requested = new URLSearchParams(location.search).get('type');
  if (Array.from(select.options).some(o=>o.value===requested)) select.value=requested;
  function filter() {
    for (const row of all('[data-case]')) row.hidden = select.value!=='all' && select.value!==row.dataset.case;
    setParams({type:select.value==='all'?'':select.value});
  }
  select.addEventListener('change',filter); filter();
}
function setupEstimates() {
  const format = (n,precision=2) => n.toLocaleString(lang,{maximumFractionDigits:precision});
  // The wording follows the number as displayed: "1 minute", "1.5 minutes", « 1,5 minute ».
  const amount = (forms,n,precision=2) => {
    const shown = Number(n.toFixed(precision));
    return counted(forms,shown,format(shown,precision));
  };
  const calculators = {
    render:([sec,fps,per]) => {
      const frames=Math.ceil(sec*fps), time=frames*per;
      return Number.isFinite(time) && amount(copy.frames,frames,0)+copy.renderJoin+amount(copy.minutes,time/60);
    },
    quota:([pct,tested,shots]) => {
      const estimate=pct*shots/tested;
      return Number.isFinite(estimate) && fill(copy.quota,{n:format(estimate)});
    },
    api:([input,output,inprice,outprice]) => {
      const cost=(input*inprice+output*outprice)/1e6;
      return Number.isFinite(cost) && fill(copy.cost,{n:format(cost,6)});
    }
  };
  // Changed values go into the address, so they follow the reader to another language or a reload.
  const params = new URLSearchParams(location.search);
  for (const [key,calculate] of Object.entries(calculators)) {
    const inputs=all('input',byId(key)), result=byId(key+'-result');
    for (const input of inputs) if (params.has(input.id)) input.value = params.get(input.id);
    function update() {
      const invalid = inputs.find(input=>!input.validity.valid);
      const answer = !invalid && calculate(inputs.map(input=>input.valueAsNumber));
      result.dataset.invalid=String(!answer);
      result.textContent=answer || (invalid ? fill(copy.invalid,{label:invalid.parentElement.firstChild.textContent}) : copy.range);
      setParams(Object.fromEntries(inputs.map(input=>[input.id,input.value===input.defaultValue ? '' : input.value])));
    }
    for (const input of inputs) input.addEventListener('input',update);
    update();
  }
}
function setupPrompt() {
  const preview=byId('prompt-text'), original=preview.textContent, fields=all('[data-brief]');
  function update() {
    const parts=fields.filter(field=>field.value.trim()).map(field=>field.dataset.brief+copy.briefJoin+field.value.trim());
    preview.textContent=parts.length ? parts.join('\n')+'\n\n'+original : original;
    byId('copy-status').textContent='';
  }
  for (const field of fields) field.addEventListener('input',update);
  byId('copy').addEventListener('click',async() => {
    try {
      await navigator.clipboard.writeText(preview.textContent);
      byId('copy-status').textContent=copy.copied;
    } catch {
      byId('prompt-details').open=true;
      const range=document.createRange(); range.selectNodeContents(preview);
      const selection=getSelection(); selection.removeAllRanges(); selection.addRange(range);
      byId('copy-status').textContent=copy.selectedAll;
    }
  });
  byId('download').addEventListener('click',() => {
    const url=URL.createObjectURL(new Blob([preview.textContent],{type:'text/plain;charset=utf-8'}));
    const save=document.createElement('a');
    save.href=url; save.download=copy.fileName;
    document.body.append(save); save.click(); save.remove();
    setTimeout(()=>URL.revokeObjectURL(url),2000);
  });
  update();
}

keepViewAcrossLanguages();
themeLabel();
byId('theme').addEventListener('click',()=>window.GuideTheme.toggle());
document.addEventListener('guide-theme-change',themeLabel);
if (byId('study')) setupCover();
if (byId('tools-list')) setupTools();
if (byId('case-type')) setupCases();
if (byId('render-result')) setupEstimates();
if (byId('prompt-text')) setupPrompt();
document.documentElement.classList.add('enhanced');
