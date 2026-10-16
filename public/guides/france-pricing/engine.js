import {DATA} from './data.js?v=20261016a';
import {MODEL,defaults,clean,compute} from '../work-order-quote/engine.js?v=20261016-discount-all';
export {MODEL};
export const round=n=>Math.round((n+Number.EPSILON)*100)/100;
export const currency=(n,lang)=>new Intl.NumberFormat({zh:'zh-CN',en:'en-IE',fr:'fr-FR'}[lang],{style:'currency',currency:'EUR',minimumFractionDigits:Number.isInteger(n)?0:2,maximumFractionDigits:2}).format(n);
export function vendorBudget(vendor,planId,users,years,setup=0,annualExtra=0){
 const p=vendor.plans.find(p=>p.id===planId)||vendor.plans[0];
 const paidUsers=p.unit==='package'?1:Math.max(p.minimum||1,users);
 const monthly=round(p.fixed+p.price*paidUsers);
 return {plan:p,paidUsers,monthly,total:round(monthly*12*years+setup+annualExtra*years)};
}
export function rexBudget({packageId='base',years=3,care=1800,hosting=60,snapshot=null}={}){
 const p=MODEL.packages.find(p=>p.id===packageId)||MODEL.packages[0];
 const s=snapshot?clean(snapshot):{...defaults(),requested:p.ids,maintenance:1800,hosting};
 // The reference calculator can vary annual care independently; saved quotes keep their exact rates.
 if(!snapshot){s.prices={...s.prices,'care-basic':care};s.maintenance=1800;}
 const q=compute(s),months=years*12;
 const installments=s.activationPayment==='spread'?Math.min(months,s.subMonths):0;
 const activation=s.activationPayment!=='spread'||months>=s.subMonths?q.subActivation:round(q.subInstallment*installments);
 return {state:s,q,once:round(q.project+q.recurring*years),rental:round(q.subRenew*months+activation+q.external*years+q.subDev)};
}
export const initialState=()=>({users:5,years:3,packageId:'base',care:1800,hosting:60,snapshot:null,plans:Object.fromEntries(DATA.vendors.map(v=>[v.id,v.plans[0].id])),setup:{},extras:{}});
export function cleanState(x){
 const d=initialState();if(!x||typeof x!=='object')return d;
 const number=(v,min,max,def,integer=false)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max&&(!integer||Number.isInteger(v))?v:def;
 d.users=number(x.users,1,1000,5,true);d.years=number(x.years,1,10,3,true);d.care=number(x.care,0,1000000,1800);d.hosting=number(x.hosting,0,1000000,60);
 if(MODEL.packages.some(p=>p.id===x.packageId))d.packageId=x.packageId;
 if(x.snapshot&&typeof x.snapshot==='object')d.snapshot=clean(x.snapshot);
 for(const v of DATA.vendors){if(v.plans.some(p=>p.id===x.plans?.[v.id]))d.plans[v.id]=x.plans[v.id];d.setup[v.id]=number(x.setup?.[v.id],0,1000000,0);d.extras[v.id]=number(x.extras?.[v.id],0,1000000,0);}
 return d;
}
