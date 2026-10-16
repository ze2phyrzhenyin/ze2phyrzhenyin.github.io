import {DATA} from './data.js?v=20261016a';
import {COPY} from './copy.js?v=20261016a';
import {initialState,cleanState} from './engine.js?v=20261016a';
import {renderResults,comparisonMarkdown} from './render.js?v=20261016a';
const lang=document.documentElement.dataset.locale,t=COPY[lang],$=s=>document.querySelector(s);
$('#theme-toggle')?.addEventListener('click',()=>window.GuideTheme?.toggle());
if($('#module-search')){
 const filter=()=>{const query=$('#module-search').value.trim().toLocaleLowerCase(lang),group=$('#module-group').value;let count=0;document.querySelectorAll('[data-module]').forEach(el=>{el.hidden=!(el.dataset.search.includes(query)&&(group==='all'||el.dataset.group===group));if(!el.hidden)count++;});$('#module-count').textContent=count+' / 30';$('#empty-search').hidden=count>0;};
 $('#module-search').addEventListener('input',filter);$('#module-group').addEventListener('change',filter);
}
if($('#results')){
 const key='rex-market-reference-v1';let state=initialState();
 try{state=cleanState(JSON.parse(localStorage.getItem(key)));}catch{}
 if(location.hash.startsWith('#comparison='))try{state=cleanState(JSON.parse(decodeURIComponent(location.hash.slice(12))));history.replaceState(null,'',location.pathname+location.search);}catch{}
 const controls=[...document.querySelectorAll('[data-number]')];
 const save=()=>{try{localStorage.setItem(key,JSON.stringify(state));}catch{}};
 const populate=()=>{
  for(const id of ['users','years','care','hosting'])$('#'+id).value=state[id];
  $('#rex-package').value=state.packageId;
  for(const v of DATA.vendors){$(`[data-plan="${v.id}"]`).value=state.plans[v.id];$('#setup-'+v.id).value=state.setup[v.id]||0;$('#extra-'+v.id).value=state.extras[v.id]||0;}
  for(const id of ['rex-package','care','hosting'])$('#'+id).disabled=!!state.snapshot;
  $('#snapshot-name').textContent=state.snapshot?t.currentQuote:t.preset;
 };
 const valid=()=>{let good=true;for(const el of controls){const ok=el.disabled||el.validity.valid&&el.value.trim()!=='';el.setAttribute('aria-invalid',String(!ok));if(!ok)good=false;}$('#form-error').hidden=good;$('#results').hidden=!good;$('#results-error').hidden=good;$('#export').disabled=!good;$('#print').disabled=!good;return good;};
 const update=()=>{if(!valid())return;for(const id of ['users','years','care','hosting'])state[id]=Number($('#'+id).value);state.packageId=$('#rex-package').value;for(const v of DATA.vendors){state.plans[v.id]=$(`[data-plan="${v.id}"]`).value;state.setup[v.id]=Number($('#setup-'+v.id).value);state.extras[v.id]=Number($('#extra-'+v.id).value);}save();$('#results').innerHTML=renderResults(state,lang);};
 for(const el of controls)el.addEventListener('input',update);
 document.querySelectorAll('[data-plan],#rex-package').forEach(el=>el.addEventListener('change',update));
 $('#reset').addEventListener('click',()=>{state=initialState();populate();$('#load-status').textContent='';update();});
 $('#load-quote').addEventListener('click',()=>{try{const snapshot=JSON.parse(localStorage.getItem('rex-quote-config-v2'));if(!snapshot||typeof snapshot!=='object'||!Array.isArray(snapshot.requested))throw new Error('missing');state.snapshot=cleanState({snapshot}).snapshot;state.snapshot.company='';populate();update();$('#load-status').textContent=t.loaded;}catch{$('#load-status').textContent=t.noQuote;}});
 $('#export').addEventListener('click',()=>{if(!valid())return;const url=URL.createObjectURL(new Blob([comparisonMarkdown(state,lang)],{type:'text/markdown;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='france-pricing-'+lang+'-'+DATA.date+'.md';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
 $('#print').addEventListener('click',()=>{if(valid())window.print();});
 window.addEventListener('beforeprint',valid);
 document.querySelectorAll('.languages a').forEach(a=>a.addEventListener('click',e=>{if(!valid()){e.preventDefault();document.querySelector('[aria-invalid=true]')?.focus();return;}let stored=false;try{stored=localStorage.getItem(key)===JSON.stringify(state);}catch{}if(!stored)a.hash='comparison='+encodeURIComponent(JSON.stringify(state));}));
 populate();update();
}
