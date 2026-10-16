import { MODEL, byId, clean, compute, defaults, priceFor, defaultPrices, MAX_PRICE } from './engine.js?v=20261016-custom';
import { moduleText, groups, packages } from './catalog.js';
import { copy, serviceText, extensionText } from './copy.js?v=20261016-custom';
import { subscriptionCopy } from './subscription-copy.js?v=20261016-custom';
const lang=document.documentElement.dataset.locale || 'en', t={...copy[lang],...subscriptionCopy[lang]}, names=moduleText[lang], services=serviceText[lang], extras=extensionText[lang];
const locale={zh:'zh-CN',en:'en-IE',fr:'fr-FR'}[lang];
const money=n=>new Intl.NumberFormat(locale,{style:'currency',currency:'EUR',maximumFractionDigits:2,minimumFractionDigits:Number.isInteger(n)?0:2}).format(n);
const num=n=>new Intl.NumberFormat(locale,{maximumFractionDigits:2}).format(n);
const text=(key,values={})=>Object.entries(values).reduce((s,[k,v])=>s.replaceAll('{'+k+'}',v),t[key]);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=id=>document.getElementById(id), storeKey='rex-quote-config-v2';
let state=clean(), query='', onlySelected=false, tab='features', last, statusTimer, storageOK=true;
try { const saved=localStorage.getItem(storeKey); if(saved)state=clean(JSON.parse(saved)); } catch { storageOK=false; }
const invalid=new Set(), priceDrafts=new Map();
const price=code=>priceFor(state,code);
const priceEditor=(code,suffix='')=>{
 const id='price-'+code, bad=invalid.has(id), value=priceDrafts.has(code)?priceDrafts.get(code):price(code);
 return `<div class="price-editor"><label for="${id}" class="sr-only">${code} · ${t.unitPrice} (€)${suffix?' / '+suffix:''}</label><div class="price-control"><span aria-hidden="true">€</span><input id="${id}" data-price="${code}" type="number" inputmode="decimal" min="0" max="${MAX_PRICE}" step="0.01" value="${esc(value)}" aria-describedby="${id}-error" aria-invalid="${bad}"><button type="button" data-reset-price="${code}" aria-label="${code} · ${t.restorePrice}" title="${t.restorePrice}" ${price(code)===defaultPrices[code]&&!priceDrafts.has(code)?'disabled':''}>↺</button></div>${suffix?`<span class="hint price-unit">/ ${suffix}</span>`:''}<p class="field-error" id="${id}-error" ${bad?'':'hidden'}>${bad?t.priceInvalid:''}</p></div>`;
};
const input=(id,label,max,value,help='',step='0.01')=>`<div class="field"><label for="${id}">${label}</label><input id="${id}" name="${id}" type="number" inputmode="decimal" min="0" max="${max}" step="${step}" value="${value}" ${help?`aria-describedby="${id}-help ${id}-error"`:`aria-describedby="${id}-error"`}>${help?`<p id="${id}-help" class="hint">${help}</p>`:''}<p class="field-error" id="${id}-error" hidden></p></div>`;
const detail=(body,title=t.scope)=>`<details class="scope"><summary>${title}</summary><p>${esc(body)}</p></details>`;
$('app').innerHTML=`
<section class="starting" aria-labelledby="start-title"><div class="section-heading"><h2 id="start-title"><span class="step">01</span>${t.start}</h2><p id="pack-hint">${t.packHint}</p></div><div class="packages" id="packages">${MODEL.packages.map((p,i)=>`<button type="button" class="package" data-package="${p.id}" aria-pressed="false"><span class="package-top"><span class="mono">0${i+1}</span><span class="package-check" aria-hidden="true">↗</span></span><strong>${packages[lang][i][0]}</strong><span class="pack-desc">${packages[lang][i][1]}</span><b>${money(p.project)}</b><span class="hint">${text('moduleCount',{n:p.ids.length})}</span></button>`).join('')}</div></section>
<fieldset class="billing-options"><legend>${t.billing}</legend>${['oneoff','subscription'].map(mode=>`<label class="billing-option"><input type="radio" name="billing" value="${mode}"><span><strong>${mode==='oneoff'?t.oneoffPlan:t.monthlyPlan}</strong><b id="billing-${mode}"></b><small id="billing-${mode}-note"></small></span></label>`).join('')}</fieldset>
<div class="workspace"><section class="configuration" id="configuration" aria-labelledby="configuration-title"><h2 class="configuration-title" id="configuration-title"><span class="step">02</span>${t.features}</h2>
<div class="config-nav"><div class="tabs" role="tablist" aria-label="${t.pageTitle}">${['features','delivery'].map((id,i)=>`<button type="button" role="tab" id="tab-${id}" data-tab="${id}" aria-controls="panel-${id}" aria-selected="${i===0}" tabindex="${i===0?0:-1}">${t[id]}</button>`).join('')}</div><a id="tab-running" href="#panel-running">${t.running} ↓</a></div>
<section id="panel-features" role="tabpanel" aria-labelledby="tab-features" tabindex="0"><div class="panel-intro"><h3>${t.featureTitle}</h3><p id="feature-hint">${t.featureHint}</p></div><div class="filters"><label class="search"><span aria-hidden="true">⌕</span><input type="search" id="search" placeholder="${t.search}" aria-label="${t.search}"></label><button type="button" id="selected-filter" aria-pressed="false">${t.selected} <span id="selection-count">7</span></button></div><div id="modules"></div></section>
<section id="panel-delivery" role="tabpanel" aria-labelledby="tab-delivery" tabindex="0" hidden><div class="panel-intro"><h3>${t.deliveryTitle}</h3><p id="delivery-hint">${t.deliveryHint}</p></div>
<div class="service-group"><div class="group-heading"><h3>${t.setup}</h3><span id="setup-heading">${money(MODEL.setup)}</span></div>${MODEL.services.filter(s=>s.required).map((s,i)=>`<article class="service-row"><div class="service-title"><h4><span class="code">${s.code}</span>${services[i].name}</h4>${priceEditor(s.code)}</div>${detail(services[i].scope)}<span class="micro">${t.included}</span></article>`).join('')}</div>
<div class="service-group"><div class="field"><label for="migration">${t.migration}</label><select id="migration"><option value="0">${t.migrationNone} · ${money(0)}</option><option value="750">${t.migrationSmall} · ${money(750)}</option><option value="1500">${t.migrationStandard} · ${money(1500)}</option></select><p class="hint">${t.migrationHint}</p><p id="migration-scope" class="hint"></p></div>${[3,4].map(i=>`<div class="migration-price" data-migration-price="${MODEL.services[i].price}" hidden>${priceEditor(MODEL.services[i].code)}</div>`).join('')}
${[5,6].map(i=>`<article class="service-row" ${i===6?'data-oneoff':''}><div class="service-main"><label class="service-choice" for="${i===5?'media':'source'}"><input id="${i===5?'media':'source'}" type="checkbox"><span><span class="code">S0${i+1}</span><strong>${services[i].name}</strong></span></label>${priceEditor(MODEL.services[i].code)}</div>${detail(services[i].scope)}</article>`).join('')}
<div class="service-row"><div class="service-title"><h4><span class="code">S08</span>${services[7].name}</h4>${priceEditor('S08',t.sessions)}</div>${input('training',t.quantity,100,0,services[7].scope,'1')}</div></div>
<details class="extra-group"><summary>${t.extraTitle}</summary><p class="hint">${t.extraHint}</p>${MODEL.extensions.map((x,i)=>`<div class="extra-row"><div class="service-title"><h4><span class="code">${x.code}</span>${extras[i].name}</h4>${priceEditor(x.code)}</div>${input('x-'+x.code,t.quantity,100,0,extras[i].scope,'1')}</div>`).join('')}</details></section>
<section id="panel-running" class="operations-section" aria-labelledby="operations-title"><div class="panel-intro"><h2 id="operations-title"><span class="step">03</span>${t.runningTitle}</h2><p>${t.runningHint}</p></div><div data-oneoff><fieldset class="maintenance"><legend>${t.maintenance}</legend>${[0,1800,3600].map((price,i)=>`<div class="maintenance-row"><label class="maintenance-choice"><input type="radio" name="maintenance" value="${price}" ${i===0?'checked':''}><span><strong>${[t.maintenanceNone,t.maintenanceBase,t.maintenancePlus][i]}</strong><small>${t.careDetails[i]}</small></span>${i===0?`<b>${money(0)}</b>`:''}</label>${i?priceEditor(i===1?'care-basic':'care-plus',t.perYear):''}</div>`).join('')}</fieldset><details class="maintenance-details"><summary>${t.scope}</summary><p id="maintenance-note" class="info-note"></p></details></div>
<div data-subscription hidden class="subscription-settings"><p class="subscription-intro">${t.subHint}</p><div class="subscription-fields"><div class="field"><label for="activationPayment">${t.subPayment}</label><select id="activationPayment"><option value="upfront">${t.payUpfront}</option><option value="spread">${t.paySpread}</option></select></div><div class="field" id="instalment-setting"><label for="subMonths">${t.subTerm}</label><select id="subMonths">${[12,24,36].map(n=>`<option value="${n}">${n} ${t.months}</option>`).join('')}</select></div>${input('subHours',t.subHours,100,0,'','0.25')}</div>${[['sub-ops',t.subOps,t.perMonth],['dev-hour',t.subRate,t.perHour]].map(([code,label,unit])=>`<div class="subscription-rate"><h3>${label}</h3>${priceEditor(code,unit)}</div>`).join('')}<p class="info-note">${t.subOpsHint}</p><details class="subscription-rules"><summary>${t.subScope}</summary>${t.subRules.map(p=>`<p>${p}</p>`).join('')}</details><div class="subscription-math"><h3>${t.subMath}</h3>${[['sub-license',t.subLicense],['sub-ops-total',t.subOps],['sub-instalment',t.subInstallment],['sub-monthly',t.monthlyTotal],['sub-activation',t.subActivation],['sub-dev',t.subDevelopment]].map(([id,label])=>`<div class="cost-row"><span>${label}</span><b id="${id}"></b></div>`).join('')}<p class="hint">${t.subMathHint}</p><p class="hint">${t.sourceSubscription}</p><p id="sub-renew-note" class="hint"></p></div></div>
${input('hosting',t.hosting+' · € / '+t.perMonth,MAX_PRICE,60,t.hostingHint)}${input('thirdparty',t.thirdparty+' · € / '+t.perYear,MAX_PRICE,0,t.thirdpartyHint)}<p class="hint">${t.externalHint}</p><div class="budget operations-budget"><h3>${t.budget}</h3><div class="cost-row"><span id="annual-maintenance-label">${t.maintenance}</span><b id="annual-maintenance"></b></div><div class="cost-row"><span>${t.external}</span><b id="external"></b></div><div class="cost-row"><span>${t.year1}</span><b id="first"></b></div><div class="cost-row"><span id="recurring-label">${t.yearly}</span><b id="recurring"></b></div><div class="cost-row"><span>${t.threeYears}</span><b id="three"></b></div><div class="cost-row" data-subscription hidden><span>${t.subMonthlyBudget}</span><b id="sub-budget"></b></div><div class="cost-row" data-subscription hidden><span>${t.subFirstMonth}</span><b id="sub-first-month"></b></div><p class="hint" id="budget-hint">${t.budgetHint}</p></div></section>
<div class="config-footer"><button type="button" id="reset" class="text-button">↺ ${t.reset}</button><span id="saved" class="hint">${t.saved}</span></div></section>
<aside class="quote" id="quote" aria-labelledby="quote-title"><div class="quote-head"><span class="mono">04 / ${t.yourQuote}</span><span class="quote-dot" aria-hidden="true"></span></div><h2 id="quote-title" tabindex="-1">${t.oneOff}</h2><p class="grand" id="project">—</p><p id="quote-term" class="quote-term" data-subscription hidden></p><div class="cost-row" data-subscription hidden><span>${t.subStartup}</span><b id="sub-start"></b></div><a href="#panel-running" class="quote-term" data-subscription hidden>${t.subMath} ↓</a><div class="quote-sub"><span id="active-package"></span><span id="quote-count"></span></div>
<details class="breakdown"><summary><span id="breakdown-title">${t.original}</span> <b id="original"></b></summary>${[['software',t.software],['setup-total',t.setup],['additional',t.additional],['source-total',t.source]].map(([id,label])=>`<div class="cost-row"><span>${label}</span><b id="${id}"></b></div>`).join('')}<p class="hint">${t.original}</p></details>
<div class="discount-box">${input('discount',t.discount,100,100)}</div>
<div class="cost-row savings"><span id="saving-label">${t.saving}</span><b id="saving"></b></div><div class="tax-row">${input('tax',t.tax,100,20)}<b id="vat"></b></div><div class="cost-row ttc"><span id="ttc-label">${t.ttc}</span><b id="ttc"></b></div>

<details class="customer-details"><summary>${t.customer}</summary><div class="field customer"><label for="company">${t.customer}</label><input id="company" type="text" maxlength="100" placeholder="${t.customerPlaceholder}" autocomplete="organization"></div></details><button type="button" id="quote-error" class="quote-error" hidden>${t.checkInputs} ↑</button><div class="quote-actions"><button type="button" id="download" class="primary">${t.download} <span aria-hidden="true">↓</span></button><button type="button" id="print">${t.print}</button></div><p class="quote-note">${t.quoteNote}</p></aside></div>
<div class="footnotes"><details class="terms"><summary>${t.terms}</summary><div id="legal-body"></div></details><details class="market"><summary>${t.market}</summary><p class="mono">${t.marketDate}</p><p>${t.marketIntro}</p><div class="market-prices"><strong>Freshdesk</strong><span>Growth <b>17</b> · Pro <b>52</b> · Enterprise <b>84</b></span><small>${t.marketUnit}</small><a href="https://www.freshworks.com/fr/freshdesk/pricing/" target="_blank" rel="noopener noreferrer">${t.marketLink} ↗</a></div>${[['Zendesk',t.marketZendesk,'https://www.zendesk.fr/pricing/'],['Odoo',t.marketOdooScope,'https://www.odoo.com/pricing'],['Malt',t.marketMalt,'https://www.malt.fr/t/barometre-tarifs/tech/developpeur-backend'],['Zoho Desk',t.marketZoho,'https://www.zoho.com/fr/desk/pricing.html']].map(([name,body,url])=>`<p><strong>${name}</strong> — ${body} <a href="${url}" target="_blank" rel="noopener noreferrer">${t.marketLink} ↗</a></p>`).join('')}<p>${t.marketOur}</p></details></div>
<div class="mobile-bar"><div><small id="mobile-label">${t.oneOff}</small><strong id="mobile-total">—</strong></div><button type="button" id="mobile-action" class="primary">${t.viewQuote} ↑</button></div><div id="status" class="toast" role="status" aria-live="polite"></div><span id="price-live" class="sr-only" aria-live="polite" aria-atomic="true"></span>`;
function notify(message) { $('status').textContent=message; $('status').classList.add('show');clearTimeout(statusTimer);statusTimer=setTimeout(()=>$('status').classList.remove('show'),3500); }
function save() { try { localStorage.setItem(storeKey,JSON.stringify(state));storageOK=true; } catch { storageOK=false; } $('saved').textContent=storageOK?t.saved:t.saveFailed; }
function legalCopy(){return state.billing==='subscription'?t.legal.filter((_,i)=>![1,3,4,7].includes(i)):t.legal;}
function activePackage() { return MODEL.packages.find(p=>p.ids.length===last.ids.length&&p.ids.every((id,i)=>id===last.ids[i])); }
function moduleRows() {
 const open=new Set([...$('modules').querySelectorAll('details[open]')].map(d=>d.dataset.scope));
 const focus=document.activeElement?.id;
 const matches=MODEL.modules.filter(m=>(!onlySelected||last.ids.includes(m.id))&&(!query||[m.code,names[m.id-1].name,names[m.id-1].short,names[m.id-1].scope].join(' ').toLocaleLowerCase(locale).includes(query)));
 $('modules').innerHTML=groups[lang].map((group,i)=>{
  const modules=matches.filter(m=>m.group===i); if(!modules.length)return '';
  return `<section class="module-group"><div class="group-heading"><h3><span class="mono">${String(i+1).padStart(2,'0')}</span>${group}</h3><span>${last.ids.filter(id=>byId.get(id).group===i).length} / ${MODEL.modules.filter(m=>m.group===i).length}</span></div>${modules.map(m=>{
   const n=names[m.id-1],selected=last.ids.includes(m.id),auto=last.auto.includes(m.id),reason=auto?text('addedFor',{codes:last.reasons[m.id].join(', ')}):m.required?t.requiredHint:'';
   return `<article class="module ${selected?'is-selected':''}" data-module="${m.id}"><div class="module-main"><label for="mod-${m.id}" class="module-choice"><input type="checkbox" id="mod-${m.id}" data-id="${m.id}" ${selected?'checked':''} ${m.required||auto?'disabled':''} aria-describedby="desc-${m.id}${reason?' reason-'+m.id:''}"><span class="module-content"><span class="module-title"><span class="code">${m.code}</span><strong>${esc(n.name)}</strong></span><span class="module-description" id="desc-${m.id}">${esc(n.short)}</span>${m.required||auto?`<span class="badge ${auto?'automatic':''}">${m.required?t.base:t.auto}</span>`:''}</span></label>${priceEditor(m.code)}</div><details class="scope" data-scope="${m.id}" ${open.has(String(m.id))?'open':''}><summary>${t.scope}</summary><p>${esc(n.scope)}</p><p><b>${t.requires}:</b> ${m.deps.length?m.deps.map(id=>byId.get(id).code+' '+names[id-1].name).join(' · '):t.baseDep}</p></details>${reason?`<p class="reason ${auto?'':'sr-only'}" id="reason-${m.id}">${esc(reason)}</p>`:''}</article>`;
  }).join('')}</section>`;
 }).join('') || `<div class="empty"><p>${t.empty}</p><button type="button" id="clear-search">${t.clearSearch}</button></div>`;
 if(focus?.startsWith('price-'))$(focus)?.focus({preventScroll:true});
 if(focus?.startsWith('mod-'))$(focus)?.focus({preventScroll:true});
 $('clear-search')?.addEventListener('click',()=>{query='';onlySelected=false;$('search').value='';$('selected-filter').setAttribute('aria-pressed','false');moduleRows();$('search').focus();});
}
function syncInputs() {
 for(const id of ['company','tax','discount','migration','training','hosting','thirdparty','subMonths','subHours','activationPayment'])$(id).value=state[id];
 for(const id of ['media','source'])$(id).checked=state[id];
 for(const x of MODEL.extensions)$('x-'+x.code).value=state.extras[x.code];
 document.querySelector(`input[name="maintenance"][value="${state.maintenance}"]`).checked=true;
 for(const el of document.querySelectorAll('[data-price]'))el.value=price(el.dataset.price);
 document.querySelector(`[name="billing"][value="${state.billing}"]`).checked=true;
}
function update(render=true,announce=false) {
 state=clean(state);last=compute(state);const monthly=state.billing==='subscription';
 const values={project:monthly?last.subMonthly:last.project,software:last.software,'setup-total':last.setup,'setup-heading':last.setup,additional:last.additional,'source-total':last.source,original:last.original,saving:last.saving?-last.saving:0,vat:monthly?last.subVat:last.vat,ttc:monthly?last.subTtc:last.ttc,'annual-maintenance':monthly?last.subOps*12:last.maintenance,external:last.external,first:monthly?last.subFirst:last.first,recurring:monthly?last.subRenew*12+last.external:last.recurring,three:monthly?last.subThree:last.three,'mobile-total':monthly?last.subMonthly:last.project,'billing-oneoff':last.project,'billing-subscription':last.subMonthly,'sub-license':last.subLicense,'sub-ops-total':last.subOps,'sub-dev':last.subDev,'sub-instalment':last.subInstallment,'sub-monthly':last.subMonthly,'sub-activation':last.subActivation,'sub-start':last.subStart,'sub-first-month':last.subFirstMonth,'sub-budget':last.subBudget};
 for(const [id,value]of Object.entries(values))$(id).textContent=money(value);
 $('quote-title').textContent=$('mobile-label').textContent=monthly?t.monthlyTotal:t.oneOff;
 $('quote-term').textContent=$('billing-subscription-note').textContent=t.subTermNote;
 $('pack-hint').textContent=monthly?(state.activationPayment==='spread'?t.subPackSpreadHint:t.subPackHint):t.packHint;
 $('feature-hint').textContent=monthly?t.subFeatureHint:t.featureHint;
 $('delivery-hint').textContent=monthly?t.subDeliveryHint:t.deliveryHint;
 $('billing-oneoff-note').textContent=t.oneOff;
 $('sub-renew-note').textContent=state.activationPayment==='spread'?text('subRenewNote',{price:money(last.subRenew)}):'';
 $('instalment-setting').hidden=state.activationPayment!=='spread';
 $('annual-maintenance-label').textContent=monthly?t.subMaintenance:t.maintenance;
 $('recurring-label').textContent=monthly&&state.activationPayment==='spread'?t.subRenewAnnual:t.yearly;
 $('budget-hint').textContent=monthly?t.subBudgetHint:t.budgetHint;
 $('saving-label').textContent=monthly?t.subSaving:t.saving;
 document.querySelector('.savings').hidden=monthly;
 $('breakdown-title').textContent=monthly?t.oneoffPlan:t.original;
 document.querySelector('label[for="tax"]').textContent=monthly?t.monthlyTax:t.tax;
 $('ttc-label').textContent=monthly?t.monthlyTtc:t.ttc;
 for(const el of document.querySelectorAll('[data-oneoff]'))el.hidden=monthly;
 for(const el of document.querySelectorAll('[data-subscription]'))el.hidden=!monthly;
 $('legal-body').innerHTML=legalCopy().map(p=>`<p>${esc(p)}</p>`).join('');
 $('quote-count').textContent=text('moduleCount',{n:last.ids.length});$('selection-count').textContent=last.ids.length;
 const pack=activePackage();$('active-package').textContent=pack?packages[lang][MODEL.packages.indexOf(pack)][0]:t.custom;
 for(const b of document.querySelectorAll('[data-package]')){const active=b.dataset.package===pack?.id;b.setAttribute('aria-pressed',String(active));b.querySelector('.package-check').textContent=active?'✓':'↗';const p=MODEL.packages.find(p=>p.id===b.dataset.package);const preview=compute({...state,requested:p.ids,migration:0,media:false,source:false,training:0,extras:{}});b.querySelector('b').textContent=money(monthly?preview.subMonthly:preview.original);b.querySelector('.hint').textContent=text('moduleCount',{n:p.ids.length})+(monthly?' · / '+t.perMonth:'');}
 $('maintenance-note').textContent=t.maintenanceNotes[[0,1800,3600].indexOf(state.maintenance)];
 $('migration-scope').textContent=state.migration?services[state.migration===750?3:4].scope:'';
 for(const box of document.querySelectorAll('[data-migration-price]'))box.hidden=Number(box.dataset.migrationPrice)!==state.migration;
 for(const [i,code]of [[1,'S04'],[2,'S05']])$('migration').options[i].textContent=[t.migrationSmall,t.migrationStandard][i-1]+' · '+money(price(code));
 for(const b of document.querySelectorAll('[data-reset-price]'))b.disabled=price(b.dataset.resetPrice)===defaultPrices[b.dataset.resetPrice]&&!priceDrafts.has(b.dataset.resetPrice);
 if(render)moduleRows();save(); if(announce)$('price-live').textContent=t.updated+' · '+money(monthly?last.subMonthly:last.project);
}
function changeTab(next,focus=false) {
 tab=next;
 for(const b of document.querySelectorAll('[data-tab]')){const active=b.dataset.tab===tab;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;$('panel-'+b.dataset.tab).hidden=!active;}
 if(focus)$('tab-'+tab).focus();
}
for(const b of document.querySelectorAll('[data-tab]')){
 b.addEventListener('click',()=>changeTab(b.dataset.tab));
 b.addEventListener('keydown',e=>{const ids=['features','delivery'],i=ids.indexOf(tab);let next;if(e.key==='ArrowRight')next=ids[(i+1)%ids.length];if(e.key==='ArrowLeft')next=ids[(i+ids.length-1)%ids.length];if(e.key==='Home')next=ids[0];if(e.key==='End')next=ids.at(-1);if(next){e.preventDefault();changeTab(next,true);}});
}
$('modules').addEventListener('change',e=>{if(!e.target.matches('[data-id]'))return;const id=Number(e.target.dataset.id),set=new Set(state.requested);e.target.checked?set.add(id):set.delete(id);state.requested=[...set];update(true,true);});
for(const b of document.querySelectorAll('[data-package]'))b.addEventListener('click',()=>{const pack=MODEL.packages.find(p=>p.id===b.dataset.package);state.requested=pack.ids.filter(id=>!MODEL.required.includes(id));query='';onlySelected=false;$('search').value='';$('selected-filter').setAttribute('aria-pressed','false');update(true,true);notify(t.packDone);});
$('search').addEventListener('input',e=>{query=e.target.value.trim().toLocaleLowerCase(locale);moduleRows();});
$('selected-filter').addEventListener('click',()=>{onlySelected=!onlySelected;$('selected-filter').setAttribute('aria-pressed',String(onlySelected));moduleRows();});
function validation(el) {
 const valid=el.value.trim()!==''&&el.validity.valid;
 el.setAttribute('aria-invalid',String(!valid));const error=$(el.id+'-error');error.hidden=valid;error.textContent=valid?'':t[el.dataset.price?'priceInvalid':el.id==='discount'?'discountInvalid':'numberInvalid'];
 valid?invalid.delete(el.id):invalid.add(el.id);
 $('download').disabled=$('print').disabled=invalid.size>0;$('quote-error').hidden=!invalid.size;
 return valid;
}
$('app').addEventListener('input',e=>{
 const el=e.target;if(!el.matches('input[type="number"]'))return;
 if(el.dataset.price){priceDrafts.set(el.dataset.price,el.value);document.querySelector(`[data-reset-price="${el.dataset.price}"]`).disabled=false;}
 if(!validation(el))return;
 if(el.dataset.price){state.prices[el.dataset.price]=Number(el.value);priceDrafts.delete(el.dataset.price);update(false,true);return;}
 if(el.id.startsWith('x-'))state.extras[el.id.slice(2)]=Number(el.value);else state[el.id]=Number(el.value);
 update(el.id.startsWith('x-'),true);
});
$('company').addEventListener('input',e=>{state.company=e.target.value;save();});
$('activationPayment').addEventListener('change',e=>{state.activationPayment=e.target.value;update(false,true);});
$('subMonths').addEventListener('change',e=>{state.subMonths=Number(e.target.value);update(false,true);});
for(const radio of document.querySelectorAll('[name="billing"]'))radio.addEventListener('change',()=>{state.billing=radio.value;update(false,true);});
$('migration').addEventListener('change',e=>{state.migration=Number(e.target.value);update(false,true);});
for(const id of ['media','source'])$(id).addEventListener('change',e=>{state[id]=e.target.checked;update(false,true);});
for(const radio of document.querySelectorAll('[name="maintenance"]'))radio.addEventListener('change',()=>{state.maintenance=Number(radio.value);update(false,true);});
$('app').addEventListener('click',e=>{
 const button=e.target.closest('[data-reset-price]');if(!button)return;
 const code=button.dataset.resetPrice;delete state.prices[code];priceDrafts.delete(code);const el=$('price-'+code);el.value=defaultPrices[code];validation(el);update(false,true);el.focus({preventScroll:true});
});
$('quote-error').addEventListener('click',()=>{
 const id=[...invalid][0];if(id.startsWith('price-M')){changeTab('features');query='';onlySelected=false;$('search').value='';$('selected-filter').setAttribute('aria-pressed','false');moduleRows();}
 else if(id.startsWith('price-S')||id.startsWith('price-X')||id==='training'||id.startsWith('x-'))changeTab('delivery');
 const el=$(id);if(!el)return;if(el.closest('[data-oneoff]')||el.closest('[data-subscription]')){state.billing=el.closest('[data-oneoff]')?'oneoff':'subscription';document.querySelector(`[name="billing"][value="${state.billing}"]`).checked=true;update(false);}
 const migration=el.closest('[data-migration-price]');if(migration){state.migration=Number(migration.dataset.migrationPrice);$('migration').value=state.migration;update(false);}
 for(let parent=el.parentElement;parent;parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true;
 el.scrollIntoView({block:'center',behavior:'instant'});el.focus({preventScroll:true});
});
$('reset').addEventListener('click',()=>{state=clean(defaults());priceDrafts.clear();invalid.clear();syncInputs();query='';onlySelected=false;$('search').value='';$('selected-filter').setAttribute('aria-pressed','false');for(const el of document.querySelectorAll('input[type="number"]'))validation(el);update(true,true);notify(t.resetDone);});
function selectedServices() {
 const list=MODEL.services.map((s,i)=>({...s,...services[i],qty:1})).filter(s=>s.required);
 if(state.migration){const i=state.migration===750?3:4;list.push({...MODEL.services[i],...services[i],qty:1});}
 if(state.media)list.push({...MODEL.services[5],...services[5],qty:1});
 if(state.source&&state.billing!=='subscription')list.push({...MODEL.services[6],...services[6],qty:1});
 if(state.training)list.push({...MODEL.services[7],...services[7],qty:state.training});
 MODEL.extensions.forEach((x,i)=>{if(state.extras[x.code])list.push({...x,...extras[i],qty:state.extras[x.code]});});
 return list.map(s=>({...s,price:price(s.code)}));
}
function totalRows() {
 const discount=[text('discountResult',{n:num(state.discount),off:num(100-state.discount)}),last.saving?-last.saving:0];
 if(state.billing==='subscription')return [[t.subSelectedCost,Math.round(last.software*state.discount)/100],[t.subLicense,last.subLicense],[t.subOps,last.subOps],[t.subActivation,last.subActivation],[t.subInstallment,last.subInstallment],[t.monthlyTotal,last.subMonthly],[t.monthlyVat+' ('+num(state.tax)+'%)',last.subVat],[t.monthlyTtc,last.subTtc],[t.subRate,price('dev-hour')],[t.subDevelopment,last.subDev],[t.subStartup,last.subStart],[t.subStartupVat,last.subStartVat],[t.subStartupTtc,last.subStartTtc],[t.hosting+' / '+t.perMonth,state.hosting],[t.thirdparty+' / '+t.perYear,state.thirdparty],[t.subMonthlyBudget,last.subBudget],[t.subFirstMonth,last.subFirstMonth],[t.year1,last.subFirst],[t.threeYears,last.subThree]];

 return [[t.original,last.original],discount,[t.oneOff,last.project],[t.vat+' ('+num(state.tax)+'%)',last.vat],[t.ttc,last.ttc],[t.maintenance,last.maintenance],[t.hosting+' / '+t.perMonth,state.hosting],[t.thirdparty+' / '+t.perYear,state.thirdparty],[t.external,last.external],[t.year1,last.first],[t.yearly,last.recurring],[t.threeYears,last.three]];
}
function quoteTerms(){return state.billing==='subscription'?[t.subTermNote,t.subPayment+': '+(state.activationPayment==='spread'?t.paySpread+' · '+state.subMonths+' '+t.months:t.payUpfront),t.discount+': '+num(state.discount)+'%',t.subHours+': '+num(state.subHours),...(state.activationPayment==='spread'?[text('subRenewNote',{price:money(last.subRenew)})]:[]),...t.subRules]:[];}
function maintenanceDescription(){return state.billing==='subscription'?t.subOpsHint:t.maintenanceNotes[[0,1800,3600].indexOf(state.maintenance)];}

function method(id) { return byId.get(id).required?t.base:last.auto.includes(id)?t.auto:t.selected; }
const safeMD=s=>String(s).replace(/[\r\n|]/g,' ').replace(/[\\`*_{}\[\]<>#]/g,'\\$&');
function exportMarkdown() {
 const lines=['# '+t.quoteDoc,'',t.billing+': '+(state.billing==='subscription'?t.monthlyPlan:t.oneoffPlan),'',...quoteTerms(),' ',t.date+': '+MODEL.date,t.generated+': '+new Date().toISOString(),t.customer+': '+safeMD(state.company||t.noCustomer),'',t.quoteNote,'','## '+t.features,'',`| ${t.code} | ${t.module} | ${state.billing==='subscription'?t.subReference:t.unitPrice} HT | ${t.method} |`,'|---|---|---:|---|'];
 for(const id of last.ids){const m=byId.get(id);lines.push(`| ${m.code} | ${names[id-1].name} | ${money(price(m.code))} | ${method(id)} |`);}
 lines.push('','## '+t.delivery,'',`| ${t.code} | ${t.module} | ${t.quantity} | ${t.unitPrice} HT | ${t.amount} HT |`,'|---|---|---:|---:|---:|');
 for(const s of selectedServices())lines.push(`| ${s.code} | ${s.name} | ${s.qty} | ${money(s.price)} | ${money(Math.round(s.price*s.qty*100)/100)} |`);
 lines.push('','## '+t.totals,'',`| ${t.module} | EUR |`,'|---|---:|',...totalRows().map(([name,value])=>`| ${name} | ${money(value)} |`),'',state.billing==='subscription'?t.subMathHint:t.discountScope,state.billing==='subscription'?t.subBudgetHint:t.budgetHint,t.externalHint,'','## '+t.scopeDoc,'');
 for(const id of last.ids)lines.push('### '+byId.get(id).code+' '+names[id-1].name,names[id-1].scope,last.auto.includes(id)?text('addedFor',{codes:last.reasons[id].join(', ')}):'','');
 for(const s of selectedServices())lines.push('### '+s.code+' '+s.name,s.scope,'');
 lines.push('## '+t.maintenance,'',maintenanceDescription(),'','## '+t.terms,'',...legalCopy().flatMap(p=>[p,'']));return lines.join('\n');
}
$('download').addEventListener('click',()=>{if(invalid.size)return;const url=URL.createObjectURL(new Blob([exportMarkdown()],{type:'text/markdown;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=`REX-quote-${lang}-${MODEL.date}.md`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);notify(t.downloaded);});
function renderPrint() {
 if(invalid.size){$('print-document').innerHTML=`<h1>${t.quoteDoc}</h1><p>${t.numberInvalid}</p>`;return;}
 const table=(heads,rows)=>`<table><thead><tr>${heads.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(v=>`<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
 $('print-document').innerHTML=`<header><p class="mono">REX / ${MODEL.date}</p><h1>${t.quoteDoc}</h1><p>${t.customer}: ${esc(state.company||t.noCustomer)}</p><p>${t.quoteNote}</p><p>${t.billing}: ${state.billing==='subscription'?t.monthlyPlan:t.oneoffPlan}</p></header>${quoteTerms().map(p=>`<p>${esc(p)}</p>`).join('')}<h2>${t.totals}</h2>${table([t.module,'EUR'],totalRows().map(([name,value])=>[name,money(value)]))}<p>${state.billing==='subscription'?t.subMathHint:t.discountScope} ${state.billing==='subscription'?t.subBudgetHint:t.budgetHint} ${t.externalHint}</p><h2>${t.features}</h2>${table([t.code,t.module,(state.billing==='subscription'?t.subReference:t.unitPrice)+' HT',t.method],last.ids.map(id=>[byId.get(id).code,names[id-1].name,money(price(byId.get(id).code)),method(id)]))}<h2>${t.delivery}</h2>${table([t.code,t.module,t.quantity,t.unitPrice+' HT',t.amount+' HT'],selectedServices().map(s=>[s.code,s.name,s.qty,money(s.price),money(Math.round(s.price*s.qty*100)/100)]))}<h2>${t.scopeDoc}</h2>${last.ids.map(id=>`<section><h3>${byId.get(id).code} ${names[id-1].name}</h3><p>${esc(names[id-1].scope)}</p></section>`).join('')}${selectedServices().map(s=>`<section><h3>${s.code} ${s.name}</h3><p>${esc(s.scope)}</p></section>`).join('')}<h2>${t.maintenance}</h2><p>${maintenanceDescription()}</p><h2>${t.terms}</h2>${legalCopy().map(p=>`<p>${esc(p)}</p>`).join('')}`;
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
