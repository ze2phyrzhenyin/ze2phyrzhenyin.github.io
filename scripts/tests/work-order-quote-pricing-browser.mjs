import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {compute,MODEL,defaultPrices} from '../../public/guides/work-order-quote/engine.js';
const {chromium}=await import(process.env.GUIDE_PLAYWRIGHT_MODULE||'playwright');
const origin=process.env.GUIDE_URL||'http://127.0.0.1:4336',out=process.env.GUIDE_ARTIFACTS||'/tmp/rex-quote-audit/custom-prices';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const ctx=await browser.newContext({viewport:{width:390,height:844},hasTouch:true});
const page=await ctx.newPage(),errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(origin)&&r.status()>=400)errors.push(r.status()+' '+r.url());});
const amount=(n,l)=>new Intl.NumberFormat({zh:'zh-CN',en:'en-IE',fr:'fr-FR'}[l],{style:'currency',currency:'EUR',maximumFractionDigits:2,minimumFractionDigits:Number.isInteger(n)?0:2}).format(n);
const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('rex-quote-config-v2')));
const total=async lang=>{const s=await state(),q=compute(s);assert.equal(await page.locator('#project').innerText(),amount(s.billing==='subscription'?q.subMonthly:q.project,lang));return q;};
const overflow=async label=>assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),label+' no overflow');
const downloadText=async name=>{const promise=page.waitForEvent('download');await page.locator('#download').click();const d=await promise;await d.saveAs(out+'/'+name+'.md');return readFile(out+'/'+name+'.md','utf8');};
try{
 for(const lang of ['zh','en','fr']){
  await page.goto(`${origin}/guides/work-order-quote/${lang}/`);await page.locator('#project').waitFor();await page.locator('#reset').click();
  assert.equal(await page.locator('h1').textContent(),{zh:'工单平台报价单',en:'Work-order platform quotation',fr:'Devis de plateforme SAV'}[lang]);
  assert.equal(await page.locator('.intro,.tax-note,#discount-result,#discount-help').count(),0,'Removed verbose copy stays removed');
  if(lang==='zh'){assert.equal(await page.locator('label[for="discount"]').textContent(),'折扣');assert((await page.locator('#start-title').textContent()).includes('选择方案'));}
  assert(await page.locator('#panel-running').isVisible(),'Operations are in the main list');
  assert.equal(await page.locator('[data-price]').count(),Object.keys(defaultPrices).length);
  await page.locator('#price-M01').fill('999.99');assert(await page.locator('#mod-1').isChecked());await total(lang);
  const before=(await state()).requested;await page.locator('#price-M15').fill('123.45');assert.deepEqual((await state()).requested,before,'Editing a price does not select the module');
  await page.locator('#mod-15').check();await page.locator('#price-M12').fill('0');assert(await page.locator('#mod-12').isDisabled());await total(lang);
  await page.locator('#price-M15').fill('');await page.locator('#search').fill('M01');assert(await page.locator('#download').isDisabled());await page.locator('#quote-error').click();assert.equal(await page.locator('#price-M15').inputValue(),'','Invalid price survives filtering');await page.locator('[data-reset-price="M15"]').click();assert(!await page.locator('#download').isDisabled());
  await page.locator('#price-M15').fill('-1');assert(await page.locator('#download').isDisabled());await page.locator('#price-M15').fill('12.345');assert(await page.locator('#download').isDisabled());await page.locator('#price-M15').fill('123.45');
  await page.locator('#tab-delivery').click();
  for(const [code,value]of [['S01','0'],['S02','1.25'],['S03','2.50'],['S06','3.75'],['S07','40.25'],['S08','5.50']])await page.locator('#price-'+code).fill(value);
  await page.locator('#migration').selectOption('750');await page.locator('#price-S04').fill('6.25');await page.locator('#migration').selectOption('1500');await page.locator('#price-S05').fill('7.50');await page.locator('#media').check();await page.locator('#source').check();await page.locator('#training').fill('2');await page.locator('.extra-group>summary').click();
  for(const [i,x]of MODEL.extensions.entries()){await page.locator('#price-'+x.code).fill(String(i+1.25));await page.locator('#x-'+x.code).fill('2');}
  await page.locator('#tab-running').click();await page.locator('[name="maintenance"][value="1800"]').check();await page.locator('#price-care-basic').fill('120.50');await page.locator('#price-care-plus').fill('250.75');await page.locator('#discount').fill('80');const q=await total(lang);assert.equal(await page.locator('#annual-maintenance').textContent(),amount(120.5,lang));
  const md=await downloadText('custom-'+lang);for(const v of [999.99,40.25,7.5,q.project])assert(md.includes(amount(v,lang)));await page.evaluate(()=>dispatchEvent(new Event('beforeprint')));assert((await page.locator('#print-document').textContent()).includes(amount(999.99,lang)));
  await page.locator('[data-language="'+(lang==='fr'?'en':'fr')+'"]').click();await page.locator('#project').waitFor();assert.equal((await state()).prices.M01,999.99);await page.goto(`${origin}/guides/work-order-quote/${lang}/`);await page.locator('#project').waitFor();await total(lang);
  await page.locator('[data-package="base"]').click();assert.equal((await state()).prices.M01,999.99,'Package switch preserves price edits');await page.locator('#reset').click();assert.deepEqual((await state()).prices,{});
  await page.locator('[name="billing"][value="subscription"]').check();assert.equal(await page.locator('#project').textContent(),amount(280,lang));assert.equal(await page.locator('#sub-start').textContent(),amount(2400,lang));assert.equal(await page.locator('#subHours').inputValue(),'0');assert(!await page.locator('.maintenance').isVisible());assert.equal(await page.locator('#sub-budget').textContent(),amount(340,lang));
  await page.locator('#subHours').fill('2');assert.equal(await page.locator('#sub-dev').textContent(),amount(160,lang));assert.equal(await page.locator('#project').textContent(),amount(280,lang),'Development is not added to monthly fee');assert.equal(await page.locator('#three').textContent(),amount(14800,lang));
  await page.locator('#price-dev-hour').fill('75');await page.locator('#price-sub-ops').fill('99');await total(lang);
  await page.locator('#activationPayment').selectOption('spread');for(const term of ['12','24','36']){await page.locator('#subMonths').selectOption(term);await total(lang);assert.equal(await page.locator('#sub-start').textContent(),amount(150,lang),'Only this request is charged upfront when setup is spread');}
  await page.locator('#discount').fill('80');await total(lang);const saved=await state();await page.reload();await page.locator('#project').waitFor();assert.equal((await state()).activationPayment,'spread');assert.equal((await state()).subMonths,36);assert.equal((await state()).prices['sub-ops'],99);await total(lang);
  const rentalMD=await downloadText('subscription-'+lang);const rentalQ=compute(saved);assert(rentalMD.includes(amount(rentalQ.subMonthly,lang)));assert(rentalMD.includes(amount(rentalQ.subThree,lang)));assert(!rentalMD.includes('| S07 |'));assert(!rentalMD.includes('40%'));
  await page.evaluate(()=>dispatchEvent(new Event('beforeprint')));assert(!(await page.locator('#print-document').textContent()).includes('undefined'));await page.pdf({path:`${out}/subscription-${lang}.pdf`,format:'A4',printBackground:true});
  for(const width of [320,390,768,1024,1440]){await page.setViewportSize({width,height:900});await page.locator('#tab-running').click();await overflow(`${lang} monthly ${width}`);if(width===390||width===1440)await page.screenshot({path:`${out}/${lang}-operations-${width}.png`});await page.evaluate(()=>scrollTo(0,0));if(width===390||width===1440)await page.screenshot({path:`${out}/${lang}-top-${width}.png`});}
  await page.setViewportSize({width:390,height:844});await page.locator('#theme-toggle').click();await page.locator('#tab-running').click();await page.screenshot({path:`${out}/${lang}-operations-dark.png`});await overflow(lang+' monthly dark');await page.locator('#theme-toggle').click();
  await page.locator('#tab-features').click();await page.locator('#price-M01').fill('9999999.99');await page.setViewportSize({width:320,height:800});await overflow(lang+' large editable price');await page.locator('#price-M01').fill('');await page.locator('#reset').click();assert(!await page.locator('#download').isDisabled());assert.equal((await state()).billing,'oneoff');assert.equal(await page.locator('#project').textContent(),amount(6950,lang));
  await page.locator('[name="billing"][value="subscription"]').check();await page.locator('#tab-running').click();await page.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));const content=(await page.locator('body').innerText()).replaceAll('中文','');assert(!content.includes('undefined'));if(lang!=='zh')assert(!/[\u3400-\u9fff]/u.test(content));
  checks.push(lang+': custom module/service/maintenance prices, price reset/validation, exports, locale/storage continuity, monthly rental, separate on-demand development, setup payment modes, responsive layouts');
 }
 const privateCtx=await browser.newContext();await privateCtx.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError');}});});const p=await privateCtx.newPage();await p.goto(`${origin}/guides/work-order-quote/en/`);await p.locator('#project').waitFor();await p.locator('#price-M01').fill('0');await p.locator('[name="billing"][value="subscription"]').check();await p.locator('[data-language="fr"]').click();await p.locator('#project').waitFor();assert.equal(await p.locator('#price-M01').inputValue(),'0');assert(await p.locator('[name="billing"][value="subscription"]').isChecked());await privateCtx.close();
 assert.deepEqual(errors,[]);await writeFile(out+'/report.json',JSON.stringify({origin,checks,errors},null,2));console.log(checks.map(x=>'PASS '+x).join('\n'));
} finally {await browser.close();}
