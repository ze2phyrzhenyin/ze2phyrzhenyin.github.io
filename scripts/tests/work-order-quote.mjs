import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {MODEL,compute,clean,defaults} from '../../public/guides/work-order-quote/engine.js';
import {moduleText,groups,packages} from '../../public/guides/work-order-quote/catalog.js';
import {copy,serviceText,extensionText} from '../../public/guides/work-order-quote/copy.js';
const original=JSON.parse(await readFile(new URL('../../resources/work-order-quote/source-model.json',import.meta.url)));
assert.deepEqual(MODEL,original,'All source prices, package sets, dependencies and scope preserved');
const totals=[6950,8050,13900,24750,27400];
for(const [i,pack]of MODEL.packages.entries()){
 const q=compute({...defaults(),requested:pack.ids});
 assert.equal(q.original,totals[i]);assert.equal(q.software,pack.software);assert.deepEqual(q.ids,pack.ids);
 const discounted=compute({...defaults(),requested:pack.ids,discount:80});
 assert.equal(discounted.project,totals[i]*.8);assert.equal(discounted.saving,totals[i]*.2);
 assert.equal(discounted.vat,Math.round(totals[i]*.8*.2*100)/100);
}
const base=compute(defaults());assert.equal(base.project,6950);assert.equal(base.first,7670);assert.equal(base.three,9110);
assert.deepEqual(compute({requested:[15]}).auto,[12,13,14,16]);
assert.equal(compute({requested:[15]}).project,10750);
assert.deepEqual(compute({requested:[9,11]}).auto,[8,10]);
assert.equal(compute({requested:[9,11]}).software,8950);
assert.deepEqual(compute({requested:[20]}).auto,[17,19]);
assert.deepEqual(compute({extras:{X01:2}}).auto,[8,10,11]);
assert.equal(compute({extras:{X01:2}}).additional,600);
assert.deepEqual(compute({extras:{X02:1}}).auto,[21]);
assert.deepEqual(compute({requested:[22],extras:{X02:1}}).auto,[]);
assert.deepEqual(compute({extras:{X04:1}}).auto,[8]);
assert.deepEqual(compute({migration:1500}).auto,[],'Migration does not force M23');
assert.equal(compute({requested:[15,14,12,13,16]}).software,compute({requested:[15]}).software,'No double charge for explicit dependencies');
assert.deepEqual(compute({requested:[]}).auto,[],'No leftover dependencies');
const rich=compute({requested:MODEL.packages[4].ids,migration:1500,media:true,source:true,training:2,extras:{X01:2,X02:3,X03:4,X04:1,X05:1,X06:1},maintenance:1800,hosting:60,thirdparty:120,discount:80});
assert.equal(rich.additional,5910);assert.equal(rich.original,41810);assert.equal(rich.project,33448);assert.equal(rich.saving,8362);assert.equal(rich.vat,6689.6);assert.equal(rich.ttc,40137.6);assert.equal(rich.recurring,2280);assert.equal(rich.first,35728);assert.equal(rich.three,40288);
assert.equal(compute({discount:0}).project,0);assert.equal(compute({discount:0}).first,720,'Only supplier costs remain at a 0% payable rate');
const weird=clean({requested:[999,15,'15',-1],tax:NaN,discount:Infinity,migration:1,training:1.7,extras:{X01:-1,X02:1000,bad:3},maintenance:1,hosting:-5,company:'x\ny'});
assert.deepEqual(weird.requested,[15]);assert.equal(weird.tax,20);assert.equal(weird.discount,100);assert.equal(weird.training,1);assert.equal(weird.extras.X01,0);assert.equal(weird.extras.X02,100);assert.equal(weird.hosting,0);assert.equal(weird.company,'x y');
assert.equal(clean(null).discount,100);assert.equal(clean({discount:-10}).discount,0);assert.equal(clean({discount:150}).discount,100);
assert.equal(compute({discount:83.33,tax:5.5}).project,5791.44);assert.equal(compute({discount:83.33,tax:5.5}).vat,318.53);
for(const lang of ['zh','en','fr']){
 assert.deepEqual(Object.keys(copy[lang]).sort(),Object.keys(copy.en).sort(),lang+' UI parity');
 assert.equal(moduleText[lang].length,30);assert.equal(groups[lang].length,7);assert.equal(packages[lang].length,5);assert.equal(serviceText[lang].length,8);assert.equal(extensionText[lang].length,6);
 for(const item of [...moduleText[lang],...serviceText[lang],...extensionText[lang]])for(const val of Object.values(item))assert(val?.length>0);
 if(lang!=='zh')assert(!/[\u3400-\u9fff]/u.test(JSON.stringify([copy[lang],moduleText[lang],serviceText[lang],extensionText[lang]])),lang+' no untranslated Chinese');
 const html=await readFile(new URL(`../../public/guides/work-order-quote/${lang}/index.html`,import.meta.url),'utf8');
 assert(html.includes(`href="/guides/${lang}/"`));assert(html.includes(`https://zhaoyang.fr/guides/work-order-quote/${lang}/`));
}
console.log('PASS source-model parity, 5 packages, dependency closure/deduplication/removal, service totals, 80%/0%/fractional discounts, VAT, recurring-cost separation, invalid data and 3 complete locales.');

// Price overrides must change every billed line, without changing selections or rates in the source model.
const {defaultPrices,priceFor,MAX_PRICE}=await import('../../public/guides/work-order-quote/engine.js');
const {subscriptionCopy}=await import('../../public/guides/work-order-quote/subscription-copy.js');
for(const m of MODEL.modules)assert.equal(compute({requested:MODEL.packages[4].ids,prices:{[m.code]:0}}).original,27400-m.price,m.code+' accepts a free price');
for(const s of MODEL.services.filter(s=>s.required))assert.equal(compute({prices:{[s.code]:0}}).setup,2400-s.price,s.code+' setup override');
for(const [choice,code]of [[750,'S04'],[1500,'S05']])assert.equal(compute({migration:choice,prices:{[code]:12.34}}).additional,12.34);
const ones=compute({requested:MODEL.packages[4].ids,prices:Object.fromEntries(Object.keys(defaultPrices).map(k=>[k,1.11])),migration:1500,media:true,source:true,training:2,extras:Object.fromEntries(MODEL.extensions.map(x=>[x.code,2])),maintenance:1800,hosting:10,thirdparty:1,discount:80});
assert.equal(ones.original,55.5);assert.equal(ones.project,44.4);assert.equal(ones.vat,8.88);assert.equal(ones.recurring,121.89);
assert.equal(priceFor(clean({prices:{M01:0}}),'M01'),0);
assert.deepEqual(clean({prices:{M01:'',M02:null,M03:-2,M04:Infinity,M05:MAX_PRICE+1,unknown:1}}).prices,{});
assert.equal(priceFor(clean({prices:{M01:'12.35'}}),'M01'),12.35);
const rental=compute({billing:'subscription'});
assert.equal(rental.subLicense,130);assert.equal(rental.subMonthly,280);assert.equal(rental.subStart,2400);assert.equal(rental.subDev,0);assert.equal(rental.subBudget,340);assert.equal(rental.subFirst,6480);assert.equal(rental.subThree,14640);assert.equal(rental.subTtc,336);
assert.equal(compute({billing:'subscription',maintenance:3600}).subMonthly,280,'No duplicate annual maintenance');
assert.equal(compute({billing:'subscription',source:true,prices:{S07:99999}}).subMonthly,280,'Rental does not include source-code licence');
const demand=compute({billing:'subscription',subHours:4});assert.equal(demand.subMonthly,280);assert.equal(demand.subDev,320);assert.equal(demand.subFirst,6800);assert.equal(demand.subThree,14960,'On-demand development counted once, not every month');
for(const subMonths of [12,24,36]){
 const q=compute({billing:'subscription',activationPayment:'spread',subMonths});
 assert.equal(q.subStart,0);assert.equal(q.subThree,14640);assert.equal(Math.round((q.subInstallment*(subMonths-1)+q.subLastInstallment)*100),240000,'Final instalment reconciles cents');
}
const spread=compute({activationPayment:'spread',subMonths:12});assert.equal(spread.subMonthly,480);assert.equal(spread.subFirst,6480);
const discountedRent=compute({discount:80});assert.equal(discountedRent.subMonthly,224);assert.equal(discountedRent.subActivation,1920);assert.equal(discountedRent.subThree,12144);
assert.equal(compute({discount:0}).subMonthly,0,'Operations follow the discount');
assert.equal(compute({prices:{'sub-ops':0,'dev-hour':0},subHours:4}).subMonthly,130);
for(const lang of ['zh','en','fr']){assert.deepEqual(Object.keys(subscriptionCopy[lang]).sort(),Object.keys(subscriptionCopy.en).sort());if(lang!=='zh')assert(!/[\u3400-\u9fff]/u.test(JSON.stringify(subscriptionCopy[lang])));}
console.log('PASS all editable rates, zero/cents, invalid override sanitization, rental/operations split, upfront/12/24/36 instalments, one-time development estimates, source exclusion and subscription locale parity.');

// Regression: the screenshot's 40% payable rate must discount rental, operations and development.
for (const [discount,monthly,activation,ops,rate,care] of [[0,0,0,0,0,0],[40,112,960,60,32,720],[80,224,1920,120,64,1440],[100,280,2400,150,80,1800]]) {
 const q=compute({billing:'subscription',discount,maintenance:1800,subHours:4,hosting:60,thirdparty:120});
 assert.equal(q.subLicenseOriginal,130,'Round the undiscounted rental first');
 assert.equal(q.subLicense,130*discount/100);assert.equal(q.subMonthly,monthly);assert.equal(q.subOps,ops);assert.equal(q.subRate,rate);assert.equal(q.subDev,4*rate);
 assert.equal(q.subActivation,activation);assert.equal(q.maintenance,care);assert.equal(q.external,840,'External budgets never receive the discount');
 assert.equal(q.subFirst,monthly*12+activation+840+4*rate);assert.equal(q.subThree,monthly*36+activation+2520+4*rate,'Development stays a single purchase');
 assert.equal(q.recurring,care+840);assert.equal(q.first,q.project+care+840);assert.equal(q.three,q.project+3*(care+840));
 assert.equal(q.subTtc,Math.round(monthly*120)/100);assert.equal(q.subStart,activation+4*rate);
 for(const subMonths of [12,24,36]){
  const spread=compute({billing:'subscription',discount,subHours:4,activationPayment:'spread',subMonths,thirdparty:120});
  assert.equal(spread.subStart,4*rate);assert.equal(spread.subThree,q.subThree,'Setup schedules preserve total cost');
  assert.equal(Math.round((spread.subInstallment*(subMonths-1)+spread.subLastInstallment)*100),Math.round(activation*100),'Discounted instalments reconcile cents');
 }
}
const customDiscount=compute({discount:40,subHours:2.5,maintenance:3600,prices:{'sub-ops':99.99,'dev-hour':79.95,'care-plus':1234.56}});
assert.equal(customDiscount.subOps,40);assert.equal(customDiscount.subRate,31.98);assert.equal(customDiscount.subDev,79.95);assert.equal(customDiscount.maintenance,493.82);
const a=compute({discount:40}),b=compute({discount:41});assert.equal(Math.round((b.subMonthly-a.subMonthly)*100),280,'Rental changes without a €10 post-discount staircase');
assert.equal(compute({discount:0,maintenance:3600,subHours:99,thirdparty:120}).subThree,2520,'At 0%, only external costs remain');
console.log('PASS 0/40/80/100% on all in-house charges, original rate preservation, fractional custom rates, unchanged supplier budgets, exact instalment settlement and one-time development.');
