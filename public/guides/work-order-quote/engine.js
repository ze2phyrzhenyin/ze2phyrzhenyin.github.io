import { MODEL } from './model.js';
export { MODEL };
export const byId = new Map(MODEL.modules.map(m => [m.id, m]));
const required = new Set(MODEL.required);
export const defaults = () => ({requested:[],company:'',tax:20,discount:100,migration:0,media:false,source:false,training:0,extras:{},maintenance:0,hosting:60,thirdparty:0});
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
    hosting: bound(s.hosting,1000000,60), thirdparty: bound(s.thirdparty,10000000)
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
  const software = ids.reduce((sum,id)=>sum+byId.get(id).price,0);
  const extension = s.training*190 + MODEL.extensions.reduce((sum,x)=>sum+s.extras[x.code]*x.price,0);
  const additional = s.migration+(s.media?400:0)+extension, source = s.source?8500:0;
  const original = software+MODEL.setup+additional+source;
  const project = round(original*s.discount/100), saving = round(original-project);
  const vat = round(project*s.tax/100), ttc = round(project+vat);
  const external = round(s.hosting*12+s.thirdparty), recurring = round(s.maintenance+external);
  return {ids,auto,reasons:Object.fromEntries(Object.entries(reasons).map(([id,v])=>[id,[...v]])),software,extension,additional,source,original,project,saving,vat,ttc,external,recurring,first:round(project+recurring),three:round(project+3*recurring)};
}
