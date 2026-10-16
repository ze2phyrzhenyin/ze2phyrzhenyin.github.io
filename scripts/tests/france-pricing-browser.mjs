import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {currency} from '../../public/guides/france-pricing/engine.js';
const {chromium}=await import(process.env.GUIDE_PLAYWRIGHT_MODULE||'playwright');
const origin=process.env.GUIDE_URL||'http://127.0.0.1:4336',out=process.env.GUIDE_ARTIFACTS||'/tmp/rex-market-audit/browser';await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true}),ctx=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,colorScheme:'light'}),page=await ctx.newPage(),errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(origin)&&r.status()>=400)errors.push(r.status()+' '+r.url());});
const visit=(l,r='')=>page.goto(`${origin}/guides/france-pricing/${l}/${r}`,{waitUntil:'networkidle'});
const overflow=async label=>assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),label+' overflow');
try{
 for(const l of ['zh','en','fr']){
  await page.goto(origin+`/guides/${l}/`);assert.equal(await page.locator('a.card').count(),15);await page.locator(`a.card[href="/guides/france-pricing/${l}/"]`).click();await page.locator('.market-nav').waitFor();
  for(const r of ['','products/','modules/','compare/','sources/']){
   await visit(l,r);assert.equal(await page.locator('h1').count(),1);assert.equal(await page.locator('.market-nav a').count(),5);assert.equal(await page.locator('.market-nav [aria-current]').count(),1);
   for(const width of [320,390,768,1024,1440]){await page.setViewportSize({width,height:900});await overflow(l+'/'+r+'/'+width);if([390,1440].includes(width))await page.screenshot({path:`${out}/${l}-${r.replace('/','')||'overview'}-${width}.png`,fullPage:true});}
   const internal=await page.locator('.market-nav a,.languages a,.footer a,.return').evaluateAll(as=>as.map(a=>a.getAttribute('href')));for(const href of internal){const res=await ctx.request.get(origin+href);assert.equal(res.status(),200,href);}
   if(l!=='zh'){const body=(await page.locator('body').innerText()).replaceAll('中文','');assert(!/[\u3400-\u9fff]/u.test(body),l+' untranslated text on '+r);}
  }
  await page.setViewportSize({width:390,height:844});await visit(l,'modules/');await page.locator('#module-search').fill('M15');assert.equal(await page.locator('[data-module]:visible').count(),1);await page.locator('#module-search').fill('zzzzzz');assert(await page.locator('#empty-search').isVisible());await page.locator('#module-search').fill('');await page.locator('#module-group').selectOption('0');assert.equal(await page.locator('[data-module]:visible').count(),3);
  await visit(l,'compare/');await page.locator('#reset').click();assert.equal(await page.locator('#rex-once-total').innerText(),currency(14510,l)+'\n3 '+({zh:'年',en:'years',fr:'ans'}[l])+' · '+({zh:'未税',en:'Excl. VAT',fr:'HT'}[l]));
  await page.locator('#users').fill('10');await page.locator('[data-plan="glpi"]').selectOption('private');await page.locator('[data-plan="dolicloud"]').selectOption('premium');await page.locator('[data-plan="synchroteam"]').selectOption('standard-m');
  assert.equal(await page.locator('[data-result="glpi"] b').innerText(),currency(18900,l));assert.equal(await page.locator('[data-result="dolicloud"] b').innerText(),currency(6480,l));assert.equal(await page.locator('[data-result="synchroteam"] b').innerText(),currency(17640,l));
  await page.locator('.vendor-options').first().locator('summary').click();await page.locator('#setup-gosuivi').fill('1000');await page.locator('#extra-gosuivi').fill('120');assert.equal(await page.locator('[data-result="gosuivi"] b').innerText(),currency(2980,l));
  await page.locator('#users').fill('0');assert(await page.locator('#results').isHidden());assert(await page.locator('#export').isDisabled());await page.locator('#users').fill('10');
  const download=page.waitForEvent('download');await page.locator('#export').click();const d=await download,path=out+'/'+d.suggestedFilename();await d.saveAs(path);const md=await readFile(path,'utf8');assert(md.includes(currency(2980,l)));assert(md.includes('https://www.gosuivi.fr/'));
  await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('#users').inputValue(),'10');assert.equal(await page.locator('[data-plan="glpi"]').inputValue(),'private');
  const other=l==='fr'?'en':'fr';await page.locator(`.languages a[lang="${other}"]`).click();await page.locator('#results').waitFor();assert.equal(await page.locator('#users').inputValue(),'10');assert.equal(await page.locator('[data-plan="glpi"]').inputValue(),'private');
  await visit(l,'compare/');await page.locator('#reset').click();await page.evaluate(()=>localStorage.removeItem('rex-quote-config-v2'));await page.locator('#load-quote').click();assert(await page.locator('#load-status').innerText());
  await page.evaluate(()=>localStorage.setItem('rex-quote-config-v2',JSON.stringify({requested:[],discount:40,maintenance:1800,hosting:60,subHours:4})));await page.locator('#load-quote').click();assert(await page.locator('#care').isDisabled());assert((await page.locator('#rex-rental-total').innerText()).includes(currency(7280,l)));assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('rex-quote-config-v2')).discount),40);
  await page.locator('#theme-toggle').click();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');await overflow(l+' dark');await page.screenshot({path:`${out}/${l}-compare-dark.png`,fullPage:true});await page.locator('#theme-toggle').click();await page.pdf({path:`${out}/${l}-compare.pdf`,format:'A4',printBackground:true});
  await page.locator('#reset').click();await page.locator('#users').fill('1000');await page.locator('#years').fill('10');await page.locator('.vendor-options').evaluateAll(ds=>ds.forEach(d=>d.open=true));for(const el of await page.locator('[id^="setup-"],[id^="extra-"]').all())await el.fill('1000000');await page.setViewportSize({width:320,height:900});await overflow(l+' max budget');
  checks.push(l+': 5 routes × 5 widths, links, no locale leaks, filters, vendor units/cycles/minima, quote import, validation, export, print, theme, persistence');
 }
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),staticPage=await nojs.newPage();await staticPage.goto(origin+'/guides/france-pricing/en/products/');assert.equal(await staticPage.locator('.vendor-card').count(),6);await staticPage.goto(origin+'/guides/france-pricing/en/modules/');assert.equal(await staticPage.locator('[data-module]').count(),30);await nojs.close();
 assert.deepEqual(errors,[]);await writeFile(out+'/results.json',JSON.stringify({origin,checks,errors},null,2));console.log(checks.join('\n'));console.log('PASS no-JS content and zero browser errors');
}finally{await browser.close();}
