import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DATA} from '../../public/guides/france-pricing/data.js';
import {COPY} from '../../public/guides/france-pricing/copy.js';
import {vendorBudget,rexBudget,initialState,cleanState} from '../../public/guides/france-pricing/engine.js';
import {defaults,compute} from '../../public/guides/work-order-quote/engine.js';
const vendor=id=>DATA.vendors.find(v=>v.id===id);
assert.equal(vendorBudget(vendor('gosuivi'),'premium',100,3).monthly,45);
assert.equal(vendorBudget(vendor('glpi'),'private',5,3).monthly,525);
assert.equal(vendorBudget(vendor('glpi'),'private',30,3).monthly,630);
assert.equal(vendorBudget(vendor('dolicloud'),'premium',10,3).monthly,180);
assert.equal(vendorBudget(vendor('freshdesk'),'pro',10,3).total,18720);
assert.equal(vendorBudget(vendor('zendesk'),'suite-a',10,3).monthly,550);
assert.equal(vendorBudget(vendor('zendesk'),'suite-m',10,3).monthly,690);
assert.equal(vendorBudget(vendor('synchroteam'),'standard-a',5,3).monthly,195);
assert.equal(vendorBudget(vendor('synchroteam'),'standard-m',5,3).monthly,245);
assert.equal(vendorBudget(vendor('gosuivi'),'premium',5,3,1000,120).total,2980);
assert.equal(rexBudget().once,14510);assert.equal(rexBudget().rental,14640);
for(const discount of [0,40,80,100])for(const subMonths of [12,24,36])for(const activationPayment of ['upfront','spread']){
 const snapshot={...defaults(),discount,subMonths,activationPayment,subHours:4,maintenance:1800,prices:{M01:350.42,S01:600.47,'care-basic':1800.01,'sub-ops':150.05,'dev-hour':80.99}};
 const q=compute(snapshot),one=rexBudget({snapshot,years:1}),three=rexBudget({snapshot,years:3});
 assert.equal(one.once,q.first);assert.equal(one.rental,q.subFirst);assert.equal(three.once,q.three);assert.equal(three.rental,q.subThree);
}
assert.equal(cleanState({users:NaN,years:0,care:-1}).users,5);assert.equal(cleanState({plans:{glpi:'fake'}}).plans.glpi,'public');assert.equal(cleanState({users:2.5}).users,5);
assert.deepEqual(Object.values(DATA.effort).reduce((a,b)=>a.map((n,i)=>n+b[i]),[0,0]),[102,170]);
for(const l of ['zh','en','fr']){
 assert.deepEqual(Object.keys(COPY[l]),Object.keys(COPY.zh));assert(!JSON.stringify(COPY[l]).includes('undefined'));
 for(const route of ['','products/','modules/','compare/','sources/']){
  const html=await readFile(new URL(`../../public/guides/france-pricing/${l}/${route}index.html`,import.meta.url),'utf8');
  assert(html.includes(`href="https://zhaoyang.fr/guides/france-pricing/${l}/${route}"`));
  assert(!html.includes('undefined'));assert(!html.includes('[object Object]'));
 }
}
console.log('PASS market pricing units, minimum seats, annual cycles, extras, quote parity incl. cent rounding, translations and 15 routes');
