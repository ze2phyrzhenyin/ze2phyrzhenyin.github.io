import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {compute} from '../../public/guides/work-order-quote/engine.js';
const {chromium}=await import(process.env.GUIDE_PLAYWRIGHT_MODULE||'playwright');
const origin=process.env.GUIDE_URL||'http://127.0.0.1:4336',out=process.env.GUIDE_ARTIFACTS||'/tmp/rex-quote-audit';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const ctx=await browser.newContext({viewport:{width:390,height:844},hasTouch:true});
const page=await ctx.newPage(),errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(origin)&&r.status()>=400)errors.push(r.status()+' '+r.url());});
const visit=async lang=>{await page.goto(`${origin}/guides/work-order-quote/${lang}/`,{waitUntil:'domcontentloaded'});await page.locator('#project').waitFor();};
const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('rex-quote-config-v2')));
const amount=(n,l)=>new Intl.NumberFormat({zh:'zh-CN',en:'en-IE',fr:'fr-FR'}[l],{style:'currency',currency:'EUR',maximumFractionDigits:2,minimumFractionDigits:Number.isInteger(n)?0:2}).format(n);
const checkTotal=async(lang,expected)=>assert.equal(await page.locator('#project').innerText(),amount(expected,lang));
const overflow=async label=>assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),label+' no horizontal overflow');
try{
 for(const lang of ['zh','en','fr']){
  await page.goto(`${origin}/guides/${lang}/`);const card=page.locator(`a[href="/guides/work-order-quote/${lang}/"]`);await card.click();await page.locator('#project').waitFor();
  assert.equal(await page.locator('.return').getAttribute('href'),`/guides/${lang}/`);
  await page.locator('#reset').click();await checkTotal(lang,6950);assert.equal(await page.locator('[data-id]').count(),30);
  for(const [id,total]of [['essential',8050],['atelier',13900],['operations',24750],['complete',27400],['base',6950]]){await page.locator(`[data-package="${id}"]`).click();await checkTotal(lang,total);assert.equal(await page.locator(`[data-package="${id}"]`).getAttribute('aria-pressed'),'true');}
  await page.locator('#mod-15').check();await checkTotal(lang,10750);
  for(const id of [12,13,14,16]){assert(await page.locator('#mod-'+id).isChecked());assert(await page.locator('#mod-'+id).isDisabled());}
  assert(await page.locator('#reason-14').innerText());
  await page.locator('#mod-15').uncheck();await checkTotal(lang,6950);for(const id of [12,13,14,16])assert(!await page.locator('#mod-'+id).isChecked());
  await page.locator('#mod-12').check();await page.locator('#mod-15').check();await page.locator('#mod-15').uncheck();assert(await page.locator('#mod-12').isChecked());await page.locator('#mod-12').uncheck();
  await page.locator('label[for="mod-6"] strong').tap();assert(await page.locator('#mod-6').isChecked());await page.locator('label[for="mod-6"] strong').tap();
  await page.locator('#search').fill('M15');assert.equal(await page.locator('[data-id]').count(),1);await page.locator('#mod-15').check();await page.locator('#search').fill('');await page.locator('#selected-filter').click();assert.equal(await page.locator('[data-id]').count(),12);await page.locator('#selected-filter').click();
  await page.locator('#search').fill('no-such-module');assert(await page.locator('#clear-search').isVisible());await page.locator('#clear-search').click();assert.equal(await page.locator('[data-id]').count(),30);
  await page.locator('#tab-delivery').click();await page.locator('#migration').selectOption('1500');await page.locator('#media').check();await page.locator('#source').check();await page.locator('#training').fill('2');await page.locator('.extra-group>summary').click();await page.locator('#x-X01').fill('2');await page.locator('#x-X02').fill('1');
  await page.locator('#tab-running').click();await page.locator('[name="maintenance"][value="1800"]').check();await page.locator('#hosting').fill('80');await page.locator('#thirdparty').fill('120');
  await page.locator('#discount').fill('80');await page.locator('#tax').fill('20');
  const s=await state(),q=compute(s);assert.equal(s.discount,80);await checkTotal(lang,q.project);assert.equal(await page.locator('#ttc').innerText(),amount(q.ttc,lang));assert.equal(q.recurring,2520);
  assert.equal(await page.locator('#three').innerText(),amount(q.three,lang));
  await page.locator('.customer-details>summary').click();await page.locator('#company').fill('Atelier <test> & associés');
  await page.reload();await page.locator('#project').waitFor();assert.equal((await state()).company,'Atelier <test> & associés');await checkTotal(lang,q.project);assert.equal(await page.locator('#discount').inputValue(),'80');
  await page.locator('#discount').fill('101');assert.equal(await page.locator('#discount').getAttribute('aria-invalid'),'true');assert(await page.locator('#download').isDisabled());assert(await page.locator('#print').isDisabled());
  await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));assert.equal(await page.locator('#print-document table').count(),0,'Invalid input cannot produce a stale printed quote');
  await page.locator('#discount').fill('');assert(await page.locator('#download').isDisabled());await page.locator('#discount').fill('80');assert(!await page.locator('#download').isDisabled());
  const downloadEvent=page.waitForEvent('download');await page.locator('#download').click();const download=await downloadEvent;const target=out+'/'+download.suggestedFilename();await download.saveAs(target);const md=await readFile(target,'utf8');assert(md.includes(amount(q.project,lang)));assert(md.includes(amount(q.three,lang)));assert(md.includes('S07'));assert(md.includes('X01'));assert(md.includes('80'));assert(!md.includes('| M24 |'));
  await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));assert((await page.locator('#print-document').textContent()).includes('Atelier <test> & associés'));assert.equal(await page.locator('#print-document img').count(),0);await page.pdf({path:`${out}/quote-${lang}.pdf`,format:'A4',printBackground:true});
  await page.locator('.languages [data-language="'+(lang==='zh'?'fr':'zh')+'"]').click();await page.locator('#project').waitFor();assert.equal((await state()).discount,80);assert.deepEqual((await state()).requested,s.requested);
  await visit(lang);await page.locator('#reset').click();
  for(const width of [320,360,390,430,768,820,1024,1440]){
   await page.setViewportSize({width,height:900});
   for(const tab of ['features','delivery','running']){await page.locator('#tab-'+tab).click();await overflow(`${lang} ${width}px ${tab}`);}
   if(width===320||width===390||width===1440){
    await page.locator('#tab-features').click();await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`${out}/${lang}-${width}.png`});
   }
  }
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(100);await page.locator('#mobile-action').click();await page.waitForTimeout(100);assert(await page.locator('#quote').evaluate(e=>e.getBoundingClientRect().top<100),'mobile quote jump');await page.locator('#discount').fill('80');await page.screenshot({path:`${out}/${lang}-mobile-discount.png`});
  await page.locator('#mobile-action').click();await page.waitForTimeout(100);assert(await page.evaluate(()=>scrollY<100),'mobile return position');
  await page.locator('#theme-toggle').click();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');await page.screenshot({path:`${out}/${lang}-mobile-dark.png`});await overflow(`${lang} dark`);await page.locator('#theme-toggle').click();
  await page.locator('#tab-features').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#tab-delivery').getAttribute('aria-selected'),'true');await page.keyboard.press('End');assert.equal(await page.locator('#tab-delivery').getAttribute('aria-selected'),'true');
  await page.locator('#tab-features').click();await page.evaluate(()=>document.querySelectorAll('details').forEach(e=>e.open=true));await overflow(`${lang} all disclosures`);
  const content=(await page.locator('body').innerText()).replaceAll('中文','');if(lang!=='zh')assert(!/[\u3400-\u9fff]/u.test(content),lang+' no Chinese leak');
  checks.push(lang+': navigation, 5 packages, whole-row selection, dependencies, search/selected, delivery/maintenance, 80% discount, tax, storage, locale switching, validation, export/PDF, 8 widths × 3 tabs, mobile jump/return, themes and keyboard');
 }
 // External budgets remain separate even at upper input bounds and on narrow screens.
 await visit('fr');await page.locator('#reset').click();await page.setViewportSize({width:320,height:700});await page.locator('#tab-running').click();await page.locator('#hosting').fill('1000000');await page.locator('#thirdparty').fill('10000000');await overflow('Maximum budgets at 320px');
 // No-storage/private browsing must keep in-memory behaviour and locale switching usable.
 const privateCtx=await browser.newContext({viewport:{width:390,height:844}});await privateCtx.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError');}});});const p=await privateCtx.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(`${origin}/guides/work-order-quote/en/`);await p.locator('#project').waitFor();await p.locator('[data-package="atelier"]').click();await p.locator('#discount').fill('80');await p.locator('[data-language="fr"]').click();await p.locator('#project').waitFor();assert.equal(await p.locator('#discount').inputValue(),'80');assert.equal(await p.locator('#project').innerText(),amount(11120,'fr'));assert(!p.url().includes('#config='));await privateCtx.close();checks.push('Maximum budgets, blocked storage and language continuity');
 assert.deepEqual(errors,[]);await writeFile(`${out}/browser-report.json`,JSON.stringify({origin,checks,errors},null,2));console.log(checks.map(c=>'PASS '+c).join('\n'));
} finally {await browser.close();}
