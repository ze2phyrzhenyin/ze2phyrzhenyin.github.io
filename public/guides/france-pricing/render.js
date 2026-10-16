import {DATA} from './data.js?v=20261016a';
import {COPY} from './copy.js?v=20261016a';
import {packages} from '../work-order-quote/catalog.js';
import {currency,vendorBudget,rexBudget,MODEL} from './engine.js?v=20261016a';
export const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const sourceFor=v=>DATA.sources.find(s=>s.id===v.source);
export const taxLabel=(s,t)=>s.tax==='HT'?t.taxHT:t.taxUnknown;
export const planLabel=(p,t)=>p.name+' · '+t[p.period];
export function allResults(state){
 const products=DATA.vendors.map(v=>({vendor:v,...vendorBudget(v,state.plans[v.id],state.users,state.years,state.setup[v.id]||0,state.extras[v.id]||0)}));
 return {products,rex:rexBudget(state)};
}
export function renderResults(state,lang){
 const t=COPY[lang],money=n=>currency(n,lang),{products,rex}=allResults(state),q=rex.q;
 const rows=products.map(p=>({name:p.vendor.name,detail:planLabel(p.plan,t)+' · '+taxLabel(sourceFor(p.vendor),t)+' · '+(p.plan.unit==='package'?t.package:p.paidUsers+' '+t.userUnit),extras:[state.setup[p.vendor.id]?t.setup+': '+money(state.setup[p.vendor.id]):'',state.extras[p.vendor.id]?t.annualExtra+': '+money(state.extras[p.vendor.id]):''].filter(Boolean).join(' · '),total:p.total,monthly:p.monthly,id:p.vendor.id}));
 rows.push({name:'REX · '+t.once,detail:t.taxHT,total:rex.once,id:'rex-once',rex:true},{name:'REX · '+t.rental,detail:t.taxHT,total:rex.rental,id:'rex-rental',rex:true});
 const max=Math.max(...rows.map(r=>r.total),1);
 return `<div class="result-grid"><section class="market-card"><h3>${t.once}</h3><p class="metric" id="rex-once-total">${money(rex.once)}<small>${state.years} ${t.yearUnit} · ${t.taxHT}</small></p><p class="hint">${t.initialCost}: ${money(q.project)}<br>${t.recurring}: ${money(q.recurring)}</p></section><section class="market-card dark-card"><h3>${t.rental}</h3><p class="metric" id="rex-rental-total">${money(rex.rental)}<small>${state.years} ${t.yearUnit} · ${t.taxHT}</small></p><p class="hint">${t.careIncluded}: ${money(q.subRenew)} ${t.perMonth}<br>${t.setup}: ${money(q.subActivation)}<br>${t.externalYear}: ${money(q.external)}${q.subDev?'<br>'+t.development+': '+money(q.subDev):''}</p></section></div><p class="market-note">${t.rexBudgetNote}</p><div class="compare-summary"><h2>${t.total}</h2><p>${state.users} ${t.userUnit} · ${state.years} ${t.yearUnit}</p></div><div class="budget-chart">${rows.map(r=>`<div class="budget-row ${r.rex?'rex-row':''}" data-result="${r.id}"><div><strong>${esc(r.name)}</strong><small>${esc(r.detail)}${r.monthly!==undefined?'<br>'+money(r.monthly)+' '+t.perMonth:''}${r.extras?'<br>'+esc(r.extras):''}</small></div><div class="bar-track" aria-hidden="true"><div class="bar-fill" style="width:${Math.max(.5,r.total/max*100).toFixed(2)}%"></div></div><b class="money">${money(r.total)}</b></div>`).join('')}</div><p class="market-note">${t.budgetDisclaimer} ${t.unchanged}</p>`;
}
export function comparisonMarkdown(state,lang){
 const t=COPY[lang],{products,rex}=allResults(state),money=n=>currency(n,lang);
 const lines=[`# ${t.titles[3]}`,`${t.checked}: ${DATA.date}`,`${state.users} ${t.userUnit} · ${state.years} ${t.yearUnit}`,t.compareNote,'',`| ${t.plan} | ${t.monthlyTotal} | ${t.setup} | ${t.annualExtra} | ${t.total} | ${t.source} |`,'|---|---:|---:|---:|---:|---|'];
 for(const p of products){const v=p.vendor,s=sourceFor(v);lines.push(`| ${v.name} · ${planLabel(p.plan,t)} · ${taxLabel(s,t)} | ${money(p.monthly)} | ${money(state.setup[v.id]||0)} | ${money(state.extras[v.id]||0)} | ${money(p.total)} | ${s.url} |`);}
 lines.push('',`## ${t.rexBudget} · ${t.taxHT}`,`${t.selection}: ${state.snapshot?t.currentQuote:packages[lang][MODEL.packages.findIndex(p=>p.id===state.packageId)][0]}`,`- ${t.once}: ${money(rex.once)}`,`- ${t.rental}: ${money(rex.rental)}`,t.rexBudgetNote,t.budgetDisclaimer,t.unchanged,'',`https://zhaoyang.fr/guides/france-pricing/${lang}/sources/`);
 return lines.join('\n');
}
