import { MODEL } from './model.js';
export { MODEL };
export const byId = new Map(MODEL.modules.map(m => [m.id, m]));
const required = new Set(MODEL.required);
export const MAX_PRICE = 999999999.99;
export const defaultPrices = Object.fromEntries([...MODEL.modules,...MODEL.services,...MODEL.extensions,{code:'care-basic',price:1800},{code:'care-plus',price:3600},{code:'sub-ops',price:150},{code:'dev-hour',price:80}].map(x=>[x.code,x.price]));
export const priceFor = (state,code) => state.prices?.[code] ?? defaultPrices[code];
export const defaults = () => ({requested:[],company:'',tax:20,discount:100,migration:0,media:false,source:false,training:0,extras:{},prices:{},maintenance:0,hosting:60,thirdparty:0,billing:'oneoff',subMonths:12,subHours:0,activationPayment:'upfront'});
const round = n => Math.round((n + Number.EPSILON) * 100) / 100;
function bound(value, max, fallback=0) {
  const n = Number(value);
  return round(Math.min(max, Math.max(0, Number.isFinite(n) ? n : fallback)));
}
export function clean(raw={}) {
  const s = {...defaults(), ...(raw && typeof raw === 'object' ? raw : {})};
  return {
    requested: Array.isArray(s.requested) ? [...new Set(s.requested.map(Number).filter(id => byId.has(id) && !required.has(id)))] : [],
    company: String(s.company || '').replace(/[\r\n]/g,' ').slice(0,100),
    tax: bound(s.tax,100,20), discount: bound(s.discount,100,100),
    migration: [0,750,1500].includes(Number(s.migration)) ? Number(s.migration) : 0,
    media: s.media === true, source: s.source === true, training: Math.floor(bound(s.training,100)),
    extras: Object.fromEntries(MODEL.extensions.map(x => [x.code, Math.floor(bound(s.extras?.[x.code],100))])),
    maintenance: [0,1800,3600].includes(Number(s.maintenance)) ? Number(s.maintenance) : 0,
    billing: s.billing==='subscription'?'subscription':'oneoff',
    subMonths: [12,24,36].includes(Number(s.subMonths))?Number(s.subMonths):12,
    activationPayment: s.activationPayment==='spread'?'spread':'upfront',
    subHours: bound(s.subHours,100,0),
    prices: Object.fromEntries(Object.keys(defaultPrices).flatMap(code=>{
      const raw=s.prices?.[code], n=Number(raw);
      return raw!==null && raw!==undefined && String(raw).trim()!=='' && Number.isFinite(n) && n>=0 && n<=MAX_PRICE && round(n)!==defaultPrices[code] ? [[code,round(n)]] : [];
    })),
    hosting: bound(s.hosting,MAX_PRICE,60), thirdparty: bound(s.thirdparty,MAX_PRICE)
  };
}
export function compute(raw) {
  const s = clean(raw), requested = new Set(s.requested), selected = new Set([...required,...requested]);
  const reasons = {};
  const add = (id, reason) => { selected.add(id); (reasons[id] ??= new Set()).add(reason); };
  for (const x of MODEL.extensions) if (s.extras[x.code]) for (const id of x.deps) add(id,x.code);
  if (s.extras.X02 && !selected.has(21) && !selected.has(22)) add(21,'X02');
  let changed = true;
  while (changed) {
    const before = selected.size;
    for (const id of [...selected]) for (const dep of byId.get(id).deps) add(dep,byId.get(id).code);
    changed = before !== selected.size;
  }
  const ids = [...selected].sort((a,b)=>a-b), auto = ids.filter(id => !required.has(id) && !requested.has(id));
  const price = code => priceFor(s,code);
  const software = round(ids.reduce((sum,id)=>sum+price(byId.get(id).code),0));
  const setup = round(MODEL.services.filter(x=>x.required).reduce((sum,x)=>sum+price(x.code),0));
  const extension = round(s.training*price('S08') + MODEL.extensions.reduce((sum,x)=>sum+s.extras[x.code]*price(x.code),0));
  const additional = round((s.migration?price(s.migration===750?'S04':'S05'):0)+(s.media?price('S06'):0)+extension), source = s.source?price('S07'):0;
  const original = round(software+setup+additional+source);
  const project = round(original*s.discount/100), saving = round(original-project);
  const vat = round(project*s.tax/100), ttc = round(project+vat);
  const discounted = amount => round(amount*s.discount/100);
  const maintenanceOriginal = s.maintenance?price(s.maintenance===1800?'care-basic':'care-plus'):0;
  const maintenance = discounted(maintenanceOriginal);
  const external = round(s.hosting*12+s.thirdparty), recurring = round(maintenance+external);
  // Rental is benchmarked against a 36-month software recovery horizon, not a 36-month commitment.
  // Establish the list rental first, then apply the discount once to every in-house charge.
  // Supplier budgets remain unchanged; custom rate inputs always store undiscounted prices.
  const subLicenseOriginal = Math.ceil(round(software/36)/10)*10;
  const subLicense = discounted(subLicenseOriginal);
  const subActivation = discounted(setup+additional), subOps = discounted(price('sub-ops'));
  const subRate = discounted(price('dev-hour')), subDev = round(s.subHours*subRate);
  const subRenew = round(subLicense+subOps), subInstallment = s.activationPayment==='spread'?round(subActivation/s.subMonths):0;
  const subLastInstallment = s.activationPayment==='spread'?round(subActivation-subInstallment*(s.subMonths-1)):0;
  const subUpfront = s.activationPayment==='upfront'?subActivation:0, subMonthly = round(subRenew+subInstallment);
  const subVat = round(subMonthly*s.tax/100), subTtc = round(subMonthly+subVat);
  const activationYear1 = s.activationPayment==='upfront'||s.subMonths===12?subActivation:round(subInstallment*12);
  const subFirst = round(12*subRenew+activationYear1+external+subDev), subThree = round(36*subRenew+subActivation+3*external+subDev);
  const subStart = round(subUpfront+subDev), subStartVat = round(subStart*s.tax/100), subStartTtc = round(subStart+subStartVat);

  return {ids,auto,reasons:Object.fromEntries(Object.entries(reasons).map(([id,v])=>[id,[...v]])),software,setup,extension,additional,source,original,project,saving,vat,ttc,maintenanceOriginal,maintenance,external,recurring,first:round(project+recurring),three:round(project+3*recurring),subLicenseOriginal,subLicense,subActivation,subOps,subRate,subDev,subRenew,subInstallment,subLastInstallment,subUpfront,subMonthly,subVat,subTtc,subFirst,subThree,subBudget:round(subMonthly+external/12),subStart,subStartVat,subStartTtc,subFirstMonth:round(subStart+subMonthly+external/12)};
}
