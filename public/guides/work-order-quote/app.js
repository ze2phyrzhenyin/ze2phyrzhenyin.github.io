import { MODEL, byId, clean, compute, defaults } from './engine.js';
import { moduleText, groups, packages } from './catalog.js';
import { copy, serviceText, extensionText } from './copy.js';
const lang=document.documentElement.dataset.locale || 'en', t=copy[lang], names=moduleText[lang], services=serviceText[lang], extras=extensionText[lang];
const locale={zh:'zh-CN',en:'en-IE',fr:'fr-FR'}[lang];
const money=n=>new Intl.NumberFormat(locale,{style:'currency',currency:'EUR',maximumFractionDigits:2,minimumFractionDigits:Number.isInteger(n)?0:2}).format(n);
const num=n=>new Intl.NumberFormat(locale,{maximumFractionDigits:2}).format(n);
const text=(key,values={})=>Object.entries(values).reduce((s,[k,v])=>s.replaceAll('{'+k+'}',v),t[key]);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=id=>document.getElementById(id), storeKey='rex-quote-config-v2';
let state=clean(), query='', onlySelected=false, tab='features', last, statusTimer, storageOK=true;
try { const saved=localStorage.getItem(storeKey); if(saved)state=clean(JSON.parse(saved)); } catch { storageOK=false; }
const input=(id,label,max,value,help='',step='0.01')=>`<div class="field"><label for="${id}">${label}</label><input id="${id}" name="${id}" type="number" inputmode="decimal" min="0" max="${max}" step="${step}" value="${value}" ${help?`aria-describedby="${id}-help ${id}-error"`:`aria-describedby="${id}-error"`}>${help?`<p id="${id}-help" class="hint">${help}</p>`:''}<p class="field-error" id="${id}-error" hidden></p></div>`;
const detail=(body,title=t.scope)=>`<details class="scope"><summary>${title}</summary><p>${esc(body)}</p></details>`;
$('app').innerHTML=`
<section class="starting" aria-labelledby="start-title"><div class="section-heading"><h2 id="start-title"><span class="step">01</span>${t.start}</h2><p>${t.packHint}</p></div><div class="packages" id="packages">${MODEL.packages.map((p,i)=>`<button type="button" class="package" data-package="${p.id}" aria-pressed="false"><span class="package-top"><span class="mono">0${i+1}</span><span class="package-check" aria-hidden="true">↗</span></span><strong>${packages[lang][i][0]}</strong><span class="pack-desc">${packages[lang][i][1]}</span><b>${money(p.project)}</b><span class="hint">${text('moduleCount',{n:p.ids.length})}</span></button>`).join('')}</div></section>
<div class="workspace"><section class="configuration" id="configuration" aria-labelledby="configuration-title"><h2 class="configuration-title" id="configuration-title"><span class="step">02</span>${t.features}</h2>
<div class="tabs" role="tablist" aria-label="${t.pageTitle}">${['features','delivery','running'].map((id,i)=>`<button type="button" role="tab" id="tab-${id}" data-tab="${id}" aria-controls="panel-${id}" aria-selected="${i===0}" tabindex="${i===0?0:-1}">${t[id]}</button>`).join('')}</div>
<section id="panel-features" role="tabpanel" aria-labelledby="tab-features" tabindex="0"><div class="panel-intro"><h3>${t.featureTitle}</h3><p>${t.featureHint}</p></div><div class="filters"><label class="search"><span aria-hidden="true">⌕</span><input type="search" id="search" placeholder="${t.search}" aria-label="${t.search}"></label><button type="button" id="selected-filter" aria-pressed="false">${t.selected} <span id="selection-count">7</span></button></div><div id="modules"></div></section>
<section id="panel-delivery" role="tabpanel" aria-labelledby="tab-delivery" tabindex="0" hidden><div class="panel-intro"><h3>${t.deliveryTitle}</h3><p>${t.deliveryHint}</p></div>
<div class="service-group"><div class="group-heading"><h3>${t.setup}</h3><span>${money(MODEL.setup)}</span></div>${MODEL.services.filter(s=>s.required).map((s,i)=>`<article class="service-row"><div class="service-title"><h4><span class="code">${s.code}</span>${services[i].name}</h4><b>${money(s.price)}</b></div>${detail(services[i].scope)}<span class="micro">${t.included}</span></article>`).join('')}</div>
<div class="service-group"><div class="field"><label for="migration">${t.migration}</label><select id="migration"><option value="0">${t.migrationNone} · ${money(0)}</option><option value="750">${t.migrationSmall} · ${money(750)}</option><option value="1500">${t.migrationStandard} · ${money(1500)}</option></select><p class="hint">${t.migrationHint}</p><p id="migration-scope" class="hint"></p></div>
${[5,6].map(i=>`<article class="service-row"><label class="service-choice" for="${i===5?'media':'source'}"><input id="${i===5?'media':'source'}" type="checkbox"><span><span class="code">S0${i+1}</span><strong>${services[i].name}</strong></span><b>${money(MODEL.services[i].price)}</b></label>${detail(services[i].scope)}</article>`).join('')}
<div class="service-row">${input('training',`<span class="code">S08</span>${services[7].name} · ${money(190)} / ${t.sessions}`,100,0,services[7].scope,'1')}</div></div>
<details class="extra-group"><summary>${t.extraTitle}</summary><p class="hint">${t.extraHint}</p>${MODEL.extensions.map((x,i)=>`<div class="extra-row">${input('x-'+x.code,`<span class="code">${x.code}</span>${extras[i].name} · ${money(x.price)}`,100,0,extras[i].scope,'1')}</div>`).join('')}</details></section>
<section id="panel-running" role="tabpanel" aria-labelledby="tab-running" tabindex="0" hidden><div class="panel-intro"><h3>${t.runningTitle}</h3><p>${t.runningHint}</p></div><fieldset class="maintenance"><legend>${t.maintenance}</legend>${[0,1800,3600].map((price,i)=>`<label class="maintenance-choice"><input type="radio" name="maintenance" value="${price}" ${i===0?'checked':''}><span>${[t.maintenanceNone,t.maintenanceBase,t.maintenancePlus][i]}</span><b>${money(price)} <small>/ ${t.perYear}</small></b></label>`).join('')}</fieldset><p id="maintenance-note" class="info-note"></p>
${input('hosting',t.hosting+' · € / '+t.perMonth,1000000,60,t.hostingHint)}${input('thirdparty',t.thirdparty+' · € / '+t.perYear,10000000,0,t.thirdpartyHint)}<p class="info-note">${t.externalHint}</p></section>
<div class="config-footer"><button type="button" id="reset" class="text-button">↺ ${t.reset}</button><span id="saved" class="hint">${t.saved}</span></div></section>
<aside class="quote" id="quote" aria-labelledby="quote-title"><div class="quote-head"><span class="mono">03 / ${t.yourQuote}</span><span class="quote-dot" aria-hidden="true"></span></div><h2 id="quote-title" tabindex="-1">${t.oneOff}</h2><p class="grand" id="project">—</p><div class="quote-sub"><span id="active-package"></span><span id="quote-count"></span></div>
<details class="breakdown"><summary>${t.original} <b id="original"></b></summary>${[['software',t.software],['setup-total',t.setup],['additional',t.additional],['source-total',t.source]].map(([id,label])=>`<div class="cost-row"><span>${label}</span><b id="${id}"></b></div>`).join('')}<p class="hint">${t.original}</p></details>
<div class="discount-box">${input('discount',t.discount,100,100,t.discountHelp)}<p id="discount-result" class="discount-result"></p><p class="hint">${t.discountScope}</p></div>
<div class="cost-row savings"><span>${t.saving}</span><b id="saving"></b></div><div class="tax-row">${input('tax',t.tax,100,20)}<b id="vat"></b></div><p class="hint tax-note">${t.taxHelp}</p><div class="cost-row ttc"><span>${t.ttc}</span><b id="ttc"></b></div>
<details class="budget"><summary>${t.budget}</summary><div class="cost-row"><span>${t.maintenance}</span><b id="annual-maintenance"></b></div><div class="cost-row"><span>${t.external}</span><b id="external"></b></div><div class="cost-row"><span>${t.year1}</span><b id="first"></b></div><div class="cost-row"><span>${t.yearly}</span><b id="recurring"></b></div><div class="cost-row"><span>${t.threeYears}</span><b id="three"></b></div><p class="hint">${t.budgetHint}</p></details>
<details class="customer-details"><summary>${t.customer}</summary><div class="field customer"><label for="company">${t.customer}</label><input id="company" type="text" maxlength="100" placeholder="${t.customerPlaceholder}" autocomplete="organization"></div></details><div class="quote-actions"><button type="button" id="download" class="primary">${t.download} <span aria-hidden="true">↓</span></button><button type="button" id="print">${t.print}</button></div><p class="quote-note">${t.quoteNote}</p></aside></div>
<div class="footnotes"><details class="terms"><summary>${t.terms}</summary>${t.legal.map(p=>`<p>${esc(p)}</p>`).join('')}</details><details class="market"><summary>${t.market}</summary><p class="mono">${t.marketDate}</p><p>${t.marketIntro}</p><div class="market-prices"><strong>Freshdesk</strong><span>Growth <b>17</b> · Pro <b>52</b> · Enterprise <b>84</b></span><small>${t.marketUnit}</small><a href="https://www.freshworks.com/fr/freshdesk/pricing/" target="_blank" rel="noopener noreferrer">${t.marketLink} ↗</a></div><p><strong>Odoo</strong> — ${t.marketOdoo} <a href="https://www.odoo.com/pricing" target="_blank" rel="noopener noreferrer">${t.marketLink} ↗</a></p><p>${t.marketNote}</p></details></div>
<div class="mobile-bar"><div><small>${t.oneOff}</small><strong id="mobile-total">—</strong></div><button type="button" id="mobile-action" class="primary">${t.viewQuote} ↑</button></div><div id="status" class="toast" role="status" aria-live="polite"></div><span id="price-live" class="sr-only" aria-live="polite" aria-atomic="true"></span>`;
function notify(message) { $('status').textContent=message; $('status').classList.add('show');clearTimeout(statusTimer);statusTimer=setTimeout(()=>$('status').classList.remove('show'),3500); }
function save() { try { localStorage.setItem(storeKey,JSON.stringify(state));storageOK=true; } catch { storageOK=false; } $('saved').textContent=storageOK?t.saved:t.saveFailed; }
function activePackage() { return MODEL.packages.find(p=>p.ids.length===last.ids.length&&p.ids.every((id,i)=>id===last.ids[i])); }
function moduleRows() {
 const open=new Set([...$('modules').querySelectorAll('details[open]')].map(d=>d.dataset.scope));
 const focus=document.activeElement?.id;
 const matches=MODEL.modules.filter(m=>(!onlySelected||last.ids.includes(m.id))&&(!query||[m.code,names[m.id-1].name,names[m.id-1].short,names[m.id-1].scope].join(' ').toLocaleLowerCase(locale).includes(query)));
 $('modules').innerHTML=groups[lang].map((group,i)=>{
  const modules=matches.filter(m=>m.group===i); if(!modules.length)return '';
  return `<section class="module-group"><div class="group-heading"><h3><span class="mono">${String(i+1).padStart(2,'0')}</span>${group}</h3><span>${last.ids.filter(id=>byId.get(id).group===i).length} / ${MODEL.modules.filter(m=>m.group===i).length}</span></div>${modules.map(m=>{
   const n=names[m.id-1],selected=last.ids.includes(m.id),auto=last.auto.includes(m.id),reason=auto?text('addedFor',{codes:last.reasons[m.id].join(', ')}):m.required?t.requiredHint:'';
   return `<article class="module ${selected?'is-selected':''}" data-module="${m.id}"><label for="mod-${m.id}" class="module-choice"><input type="checkbox" id="mod-${m.id}" data-id="${m.id}" ${selected?'checked':''} ${m.required||auto?'disabled':''} aria-describedby="desc-${m.id}${reason?' reason-'+m.id:''}"><span class="module-content"><span class="module-title"><span class="code">${m.code}</span><strong>${esc(n.name)}</strong></span><span class="module-description" id="desc-${m.id}">${esc(n.short)}</span>${m.required||auto?`<span class="badge ${auto?'automatic':''}">${m.required?t.base:t.auto}</span>`:''}</span><span class="module-price">${money(m.price)}</span></label><details class="scope" data-scope="${m.id}" ${open.has(String(m.id))?'open':''}><summary>${t.scope}</summary><p>${esc(n.scope)}</p><p><b>${t.requires}:</b> ${m.deps.length?m.deps.map(id=>byId.get(id).code+' '+names[id-1].name).join(' · '):t.baseDep}</p></details>${reason?`<p class="reason ${auto?'':'sr-only'}" id="reason-${m.id}">${esc(reason)}</p>`:''}</article>`;
  }).join('')}</section>`;
 }).join('') || `<div class="empty"><p>${t.empty}</p><button type="button" id="clear-search">${t.clearSearch}</button></div>`;
 if(focus?.startsWith('mod-'))$(focus)?.focus({preventScroll:true});
 $('clear-search')?.addEventListener('click',()=>{query='';onlySelected=false;$('search').value='';$('selected-filter').setAttribute('aria-pressed','false');moduleRows();$('search').focus();});
}
function syncInputs() {
 for(const id of ['company','tax','discount','migration','training','hosting','thirdparty'])$(id).value=state[id];
 for(const id of ['media','source'])$(id).checked=state[id];
 for(const x of MODEL.extensions)$('x-'+x.code).value=state.extras[x.code];
 document.querySelector(`input[name="maintenance"][value="${state.maintenance}"]`).checked=true;
}
function update(render=true,announce=false) {
 state=clean(state);last=compute(state);
 const values={project:last.project,software:last.software,'setup-total':MODEL.setup,additional:last.additional,'source-total':last.source,original:last.original,saving:last.saving?-last.saving:0,vat:last.vat,ttc:last.ttc,'annual-maintenance':state.maintenance,external:last.external,first:last.first,recurring:last.recurring,three:last.three,'mobile-total':last.project};
 for(const [id,value]of Object.entries(values))$(id).textContent=money(value);
 $('discount-result').textContent=text('discountResult',{n:num(state.discount),off:num(100-state.discount)});
 $('quote-count').textContent=text('moduleCount',{n:last.ids.length});$('selection-count').textContent=last.ids.length;
 const pack=activePackage();$('active-package').textContent=pack?packages[lang][MODEL.packages.indexOf(pack)][0]:t.custom;
 for(const b of document.querySelectorAll('[data-package]')){const active=b.dataset.package===pack?.id;b.setAttribute('aria-pressed',String(active));b.querySelector('.package-check').textContent=active?'✓':'↗';}
 $('maintenance-note').textContent=t.maintenanceNotes[[0,1800,3600].indexOf(state.maintenance)];
 $('migration-scope').textContent=state.migration?services[state.migration===750?3:4].scope:'';
 if(render)moduleRows();save(); if(announce)$('price-live').textContent=t.updated+' · '+money(last.project);
}
function changeTab(next,focus=false) {
 tab=next;
 for(const b of document.querySelectorAll('[data-tab]')){const active=b.dataset.tab===tab;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;$('panel-'+b.dataset.tab).hidden=!active;}
 if(focus)$('tab-'+tab).focus();
}
for(const b of document.querySelectorAll('[data-tab]')){
 b.addEventListener('click',()=>changeTab(b.dataset.tab));
 b.addEventListener('keydown',e=>{const ids=['features','delivery','running'],i=ids.indexOf(tab);let next;if(e.key==='ArrowRight')next=ids[(i+1)%3];if(e.key==='ArrowLeft')next=ids[(i+2)%3];if(e.key==='Home')next=ids[0];if(e.key==='End')next=ids[2];if(next){e.preventDefault();changeTab(next,true);}});
}
$('modules').addEventListener('change',e=>{if(!e.target.matches('[data-id]'))return;const id=Number(e.target.dataset.id),set=new Set(state.requested);e.target.checked?set.add(id):set.delete(id);state.requested=[...set];update(true,true);});
for(const b of document.querySelectorAll('[data-package]'))b.addEventListener('click',()=>{const pack=MODEL.packages.find(p=>p.id===b.dataset.package);state.requested=pack.ids.filter(id=>!MODEL.required.includes(id));query='';onlySelected=false;$('search').value='';$('selected-filter').setAttribute('aria-pressed','false');update(true,true);notify(t.packDone);});
$('search').addEventListener('input',e=>{query=e.target.value.trim().toLocaleLowerCase(locale);moduleRows();});
$('selected-filter').addEventListener('click',()=>{onlySelected=!onlySelected;$('selected-filter').setAttribute('aria-pressed',String(onlySelected));moduleRows();});
const invalid=new Set();
function validation(el) {
 const valid=el.value.trim()!==''&&el.validity.valid;
 el.setAttribute('aria-invalid',String(!valid));const error=$(el.id+'-error');error.hidden=valid;error.textContent=valid?'':t[el.id==='discount'?'discountInvalid':'numberInvalid'];
 valid?invalid.delete(el.id):invalid.add(el.id);
 $('download').disabled=$('print').disabled=invalid.size>0;
 return valid;
}
for(const el of document.querySelectorAll('input[type="number"]'))el.addEventListener('input',()=>{
 if(!validation(el))return;
 if(el.id.startsWith('x-'))state.extras[el.id.slice(2)]=Number(el.value);else state[el.id]=Number(el.value);
 update(el.id.startsWith('x-'),true);
});
$('company').addEventListener('input',e=>{state.company=e.target.value;save();});
$('migration').addEventListener('change',e=>{state.migration=Number(e.target.value);update(false,true);});
for(const id of ['media','source'])$(id).addEventListener('change',e=>{state[id]=e.target.checked;update(false,true);});
for(const radio of document.querySelectorAll('[name="maintenance"]'))radio.addEventListener('change',()=>{state.maintenance=Number(radio.value);update(false,true);});
$('reset').addEventListener('click',()=>{state=clean(defaults());syncInputs();query='';onlySelected=false;$('search').value='';$('selected-filter').setAttribute('aria-pressed','false');for(const el of document.querySelectorAll('input[type="number"]'))validation(el);update(true,true);notify(t.resetDone);});
function selectedServices() {
 const list=MODEL.services.map((s,i)=>({...s,...services[i],qty:1})).filter(s=>s.required);
 if(state.migration){const i=state.migration===750?3:4;list.push({...MODEL.services[i],...services[i],qty:1});}
 if(state.media)list.push({...MODEL.services[5],...services[5],qty:1});
 if(state.source)list.push({...MODEL.services[6],...services[6],qty:1});
 if(state.training)list.push({...MODEL.services[7],...services[7],qty:state.training});
 MODEL.extensions.forEach((x,i)=>{if(state.extras[x.code])list.push({...x,...extras[i],qty:state.extras[x.code]});});
 return list;
}
function totalRows() {return [[t.original,last.original],[text('discountResult',{n:num(state.discount),off:num(100-state.discount)}),last.saving?-last.saving:0],[t.oneOff,last.project],[t.vat+' ('+num(state.tax)+'%)',last.vat],[t.ttc,last.ttc],[t.maintenance,state.maintenance],[t.hosting+' / '+t.perMonth,state.hosting],[t.thirdparty+' / '+t.perYear,state.thirdparty],[t.external,last.external],[t.year1,last.first],[t.yearly,last.recurring],[t.threeYears,last.three]];}
function method(id) { return byId.get(id).required?t.base:last.auto.includes(id)?t.auto:t.selected; }
const safeMD=s=>String(s).replace(/[\r\n|]/g,' ').replace(/[\\`*_{}\[\]<>#]/g,'\\$&');
function exportMarkdown() {
 const lines=['# '+t.quoteDoc,'',t.date+': '+MODEL.date,t.generated+': '+new Date().toISOString(),t.customer+': '+safeMD(state.company||t.noCustomer),'',t.quoteNote,'','## '+t.features,'',`| ${t.code} | ${t.module} | ${t.unitPrice} HT | ${t.method} |`,'|---|---|---:|---|'];
 for(const id of last.ids){const m=byId.get(id);lines.push(`| ${m.code} | ${names[id-1].name} | ${money(m.price)} | ${method(id)} |`);}
 lines.push('','## '+t.delivery,'',`| ${t.code} | ${t.module} | ${t.quantity} | ${t.unitPrice} HT | ${t.amount} HT |`,'|---|---|---:|---:|---:|');
 for(const s of selectedServices())lines.push(`| ${s.code} | ${s.name} | ${s.qty} | ${money(s.price)} | ${money(s.price*s.qty)} |`);
 lines.push('','## '+t.totals,'',`| ${t.module} | EUR |`,'|---|---:|',...totalRows().map(([name,value])=>`| ${name} | ${money(value)} |`),'',t.discountScope,t.budgetHint,t.externalHint,t.taxHelp,'','## '+t.scopeDoc,'');
 for(const id of last.ids)lines.push('### '+byId.get(id).code+' '+names[id-1].name,names[id-1].scope,last.auto.includes(id)?text('addedFor',{codes:last.reasons[id].join(', ')}):'','');
 for(const s of selectedServices())lines.push('### '+s.code+' '+s.name,s.scope,'');
 lines.push('## '+t.maintenance,'',t.maintenanceNotes[[0,1800,3600].indexOf(state.maintenance)],'','## '+t.terms,'',...t.legal.flatMap(p=>[p,'']));return lines.join('\n');
}
$('download').addEventListener('click',()=>{if(invalid.size)return;const url=URL.createObjectURL(new Blob([exportMarkdown()],{type:'text/markdown;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=`REX-quote-${lang}-${MODEL.date}.md`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);notify(t.downloaded);});
function renderPrint() {
 if(invalid.size){$('print-document').innerHTML=`<h1>${t.quoteDoc}</h1><p>${t.numberInvalid}</p>`;return;}
 const table=(heads,rows)=>`<table><thead><tr>${heads.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(v=>`<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
 $('print-document').innerHTML=`<header><p class="mono">REX / ${MODEL.date}</p><h1>${t.quoteDoc}</h1><p>${t.customer}: ${esc(state.company||t.noCustomer)}</p><p>${t.quoteNote}</p></header><h2>${t.totals}</h2>${table([t.module,'EUR'],totalRows().map(([name,value])=>[name,money(value)]))}<p>${t.discountScope} ${t.budgetHint} ${t.externalHint} ${t.taxHelp}</p><h2>${t.features}</h2>${table([t.code,t.module,t.unitPrice+' HT',t.method],last.ids.map(id=>[byId.get(id).code,names[id-1].name,money(byId.get(id).price),method(id)]))}<h2>${t.delivery}</h2>${table([t.code,t.module,t.quantity,t.unitPrice+' HT',t.amount+' HT'],selectedServices().map(s=>[s.code,s.name,s.qty,money(s.price),money(s.price*s.qty)]))}<h2>${t.scopeDoc}</h2>${last.ids.map(id=>`<section><h3>${byId.get(id).code} ${names[id-1].name}</h3><p>${esc(names[id-1].scope)}</p></section>`).join('')}${selectedServices().map(s=>`<section><h3>${s.code} ${s.name}</h3><p>${esc(s.scope)}</p></section>`).join('')}<h2>${t.maintenance}</h2><p>${t.maintenanceNotes[[0,1800,3600].indexOf(state.maintenance)]}</p><h2>${t.terms}</h2>${t.legal.map(p=>`<p>${esc(p)}</p>`).join('')}`;
}
$('print').addEventListener('click',()=>{if(!invalid.size){renderPrint();window.print();}});
window.addEventListener('beforeprint',renderPrint);
let quoteVisible=false,returnY=0;
new IntersectionObserver(entries=>{quoteVisible=entries[0].isIntersecting;$('mobile-action').textContent=quoteVisible?t.continue+' ↑':t.viewQuote+' ↑';},{threshold:0,rootMargin:'-10px 0px -90px 0px'}).observe($('quote'));
$('mobile-action').addEventListener('click',()=>{
 const behavior='instant';
 if(quoteVisible){window.scrollTo({top:returnY,behavior});$('configuration-title').setAttribute('tabindex','-1');$('configuration-title').focus({preventScroll:true});}
 else {returnY=window.scrollY;$('quote').scrollIntoView({behavior,block:'start'});$('quote-title').focus({preventScroll:true});}
});
$('theme-toggle').addEventListener('click',()=>window.GuideTheme?.toggle());
for(const link of document.querySelectorAll('[data-language]'))link.addEventListener('click',e=>{
 // Preserve the current configuration even when browser storage is unavailable.
 if(!storageOK){const target=new URL(link.href);target.hash='config='+encodeURIComponent(JSON.stringify(state));link.href=target.href;}
});
if(location.hash.startsWith('#config=')){
 try{state=clean(JSON.parse(decodeURIComponent(location.hash.slice(8))));history.replaceState(null,'',location.pathname+location.search);}catch{/* Invalid shared data must not stop the calculator. */}
}
syncInputs();update();
