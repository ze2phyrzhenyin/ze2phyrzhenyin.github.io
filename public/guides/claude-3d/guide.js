'use strict';
const base = '/guides/claude-3d/';
const byId = id => document.getElementById(id);
const all = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function rememberLocale() {
  const url = new URL(location.href);
  const source = url.searchParams.get('from');
  let locale = ['en','fr','zh'].includes(source) ? source : null;
  try {
    if (locale) sessionStorage.setItem('film-guide-locale', locale);
    else locale = sessionStorage.getItem('film-guide-locale');
  } catch { /* The entry link also works without storage. */ }
  if (!['en','fr','zh'].includes(locale)) return;
  byId('all-guides').href = '/guides/' + locale + '/';
  // Preserve the return route even with session storage disabled.
  for (const anchor of all('a[href^="/guides/claude-3d/"]')) {
    const next = new URL(anchor.href);
    if (!next.pathname.endsWith('/') || locale === 'zh') continue;
    next.searchParams.set('from', locale);
    anchor.href = next.href;
  }
}
function themeLabel() {
  const next = document.documentElement.dataset.theme === 'dark' ? '浅色' : '深色';
  byId('theme-label').textContent = next;
  byId('theme').setAttribute('aria-label','切换为' + next + '模式');
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
  const views = {studio:'深绿色双镜头相机的 Blender 材质渲染',clay:'同一机位和灯光下的相机灰模',detail:'相机的镜片和金属镜筒近景'};
  const buttons = all('[data-view]');
  for (const button of buttons) button.addEventListener('click',() => {
    byId('study').src = base + 'media/' + button.dataset.view + '.webp';
    byId('study').alt = views[button.dataset.view];
    for (const item of buttons) item.setAttribute('aria-pressed',String(item === button));
  });
  const links = all('[data-route]');
  const subjects = {
    product:'先量机身比例，给镜头边缘留出高光，便于检查轮廓。',
    ui:'录制原始界面，把界面文字与画面分层，方便替换语言。',
    scene:'用灰模确定建筑比例和机位，按镜头能看见的范围放置细节。',
    story:'画出人物进出画面的位置，给相邻镜头各留一张连续性参考图。'
  };
  const devices = {
    laptop:'本地先做低分辨率预览，记录一帧的耗时。',
    mac:'在同一帧比较 CPU 与可用的 Metal 渲染设置，记录耗时和内存。',
    gpu:'用纹理最多的一帧检查显存，再排整段渲染。'
  };
  function update() {
    const active = links.find(a => a.hash === location.hash) || links[0];
    for (const a of links) {
      byId(a.hash.slice(1)).hidden = a !== active;
      if (a === active) a.setAttribute('aria-current','true');
      else a.removeAttribute('aria-current');
    }
    const goal = active.dataset.route;
    const deviceAdvice = goal === 'native' ? devices[byId('machine').value]
      : goal === 'code' ? '在本机逐帧导出一段，检查字体、画布尺寸和动画节奏。'
      : '生成耗时与积分以服务端记录为准，本地设备主要用于剪辑。';
    byId('advice').textContent = subjects[byId('subject').value] + deviceAdvice;
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
  const norm = value => value.normalize('NFKC').trim().toLowerCase();
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
    byId('found').textContent = found ? '显示 ' + found + ' 项工具' : '';
    byId('no-tools').hidden = found !== 0;
    setParams({q:search.value.trim(), category:category.value==='all'?'':category.value});
  }
  function compare() {
    const selected = rows.filter(row=>row.querySelector('input').checked);
    for (const c of checkboxes) c.disabled = !c.checked && selected.length === 3;
    byId('picked').textContent = selected.length ? '（' + selected.length + '）' : '';
    byId('clear').hidden = !selected.length;
    byId('compare-hint').textContent = selected.length ? '已选 ' + selected.length + ' 项，共可选三项。' : '勾选列表中的工具，最多可比较三项。';
    const bar = byId('compare-shortcut');
    bar.hidden = !selected.length;
    bar.textContent = '对比已选工具（' + selected.length + '）';
    setParams({compare:selected.map(row=>row.dataset.tool).join(',')});
    const target = byId('compare-table');
    target.replaceChildren();
    if (!selected.length) return;
    const table = document.createElement('table');
    table.style.setProperty('--columns',selected.length);
    table.setAttribute('aria-label','所选工具的用途、限制和搭配');
    const head = table.createTHead().insertRow();
    function heading(row,label,scope) {
      const cell = document.createElement('th');
      cell.scope = scope; cell.textContent = label; row.append(cell);
      return cell;
    }
    heading(head,'工具','col');
    for (const row of selected) {
      const name = row.querySelector('h2').textContent;
      const cell = heading(head,name,'col');
      const remove = document.createElement('button');
      remove.type = 'button'; remove.textContent = '移除';
      remove.setAttribute('aria-label','移除 ' + name);
      remove.addEventListener('click',() => {
        row.querySelector('input').checked = false;
        compare();
        (target.querySelector('button') || byId('comparison')).focus();
      });
      cell.append(remove);
    }
    const body = table.createTBody();
    for (const [label,selector] of [['用途','.tool-description p'],['使用限制','[data-limit]'],['搭配方式','[data-setup]']]) {
      const tr = body.insertRow(); heading(tr,label,'row');
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
  const format = (n,precision=2) => n.toLocaleString('zh-CN',{maximumFractionDigits:precision});
  const calculators = {
    render:([sec,fps,per]) => {
      const frames=Math.ceil(sec*fps), time=frames*per;
      return Number.isFinite(time) && format(frames,0)+' 帧，约 '+format(time/60)+' 分钟';
    },
    quota:([pct,tested,shots]) => {
      const estimate=pct*shots/tested;
      return Number.isFinite(estimate) && '约占该额度窗口的 '+format(estimate)+'%';
    },
    api:([input,output,inprice,outprice]) => {
      const cost=(input*inprice+output*outprice)/1e6;
      return Number.isFinite(cost) && format(cost,6)+' 美元';
    }
  };
  for (const [key,calculate] of Object.entries(calculators)) {
    const inputs=all('input',byId(key)), result=byId(key+'-result');
    function update() {
      const invalid = inputs.find(input=>!input.validity.valid);
      const answer = !invalid && calculate(inputs.map(input=>input.valueAsNumber));
      result.dataset.invalid=String(!answer);
      result.textContent=answer || (invalid ? '请填写有效的'+invalid.parentElement.firstChild.textContent+'。' : '数值超出计算范围。');
    }
    for (const input of inputs) input.addEventListener('input',update);
    update();
  }
}
function setupPrompt() {
  const preview=byId('prompt-text'), original=preview.textContent, fields=all('[data-brief]');
  function update() {
    const parts=fields.filter(field=>field.value.trim()).map(field=>field.dataset.brief+'：'+field.value.trim());
    preview.textContent=parts.length ? parts.join('\n')+'\n\n'+original : original;
    byId('copy-status').textContent='';
  }
  for (const field of fields) field.addEventListener('input',update);
  byId('copy').addEventListener('click',async() => {
    try {
      await navigator.clipboard.writeText(preview.textContent);
      byId('copy-status').textContent='已复制提示词。';
    } catch {
      byId('prompt-details').open=true;
      const range=document.createRange(); range.selectNodeContents(preview);
      const selection=getSelection(); selection.removeAllRanges(); selection.addRange(range);
      byId('copy-status').textContent='已选中全文，请使用系统复制命令。';
    }
  });
  byId('download').addEventListener('click',() => {
    const url=URL.createObjectURL(new Blob([preview.textContent],{type:'text/plain;charset=utf-8'}));
    const save=document.createElement('a');
    save.href=url; save.download='claude-3d-项目提示词.txt';
    document.body.append(save); save.click(); save.remove();
    setTimeout(()=>URL.revokeObjectURL(url),2000);
  });
  update();
}

rememberLocale();
themeLabel();
byId('theme').addEventListener('click',()=>window.GuideTheme.toggle());
document.addEventListener('guide-theme-change',themeLabel);
if (byId('study')) setupCover();
if (byId('tools-list')) setupTools();
if (byId('case-type')) setupCases();
if (byId('render-result')) setupEstimates();
if (byId('prompt-text')) setupPrompt();
document.documentElement.classList.add('enhanced');
