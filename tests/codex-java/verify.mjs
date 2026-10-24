import { chromium, webkit } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { commandsFor, detectSystem } from '../../public/guides/codex-java/content.js';
const base=process.env.TUTORIAL_URL || 'http://127.0.0.1:44327/guides/codex-java/index.html';
const out=process.env.TUTORIAL_EVIDENCE || new URL('../../.artifacts/codex-java/',import.meta.url).pathname;
await mkdir(out,{recursive:true});
const fakeKey='sk-'+'fixture_only_not_a_real_credential_'.repeat(2);
const report={copies:0,layoutChecks:0,axe:[],checks:[]};
const browser=await chromium.launch();
const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'});
await context.route('**/guides/codex-java/access-key',route=>route.fulfill({json:{key:fakeKey,expiresAt:'2099-10-31T00:00:00Z'}}));
const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(base);await page.waitForSelector('#step-title');
assert.equal(await page.locator('input,textarea,form').count(),0);
await page.locator('#start').click();assert.equal(await page.locator('[aria-current=step]').getAttribute('data-step'),'0');
for(const os of ['windows','macos','linux']){
 await page.locator(`[data-os=${os}]`).click();const c=commandsFor(os);
 for(let step=0;step<5;step++){
  await page.locator(`[data-step="${step}"]`).click();
  assert.equal(await page.locator('[data-os][aria-pressed=true]').getAttribute('data-os'),os);
  if(step===0) assert((await page.locator('#panel').innerText()).includes(c.npm));
  if(step===1) assert((await page.locator('#panel').innerText()).includes(c.install));
  if(step===2){await page.waitForFunction(()=>!document.querySelector('#copy-key').disabled);await page.locator('#copy-key').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),fakeKey);await page.locator('#reveal-key').click();assert.equal(await page.locator('#key-value').innerText(),fakeKey);await page.locator('#reveal-key').click();assert.equal(await page.locator('#key-value').textContent(),'');report.copies++;}
  if(step===3) assert((await page.locator('#panel').innerText()).includes(c.start));
  await page.locator('#panel details').evaluateAll(items=>items.forEach(x=>x.open=true));
  for(const button of await page.locator('#panel [data-copy]').all()){
   const id=await button.getAttribute('data-copy');const expected=await page.locator(`#${id}`).textContent();
   await button.click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),expected);report.copies++;
  }
 }
 await page.locator('#faq-items details').evaluateAll(items=>items.forEach(x=>x.open=true));
 for(const button of await page.locator('#faq-items [data-copy]').all()){
  const id=await button.getAttribute('data-copy');const expected=await page.locator(`#${id}`).textContent();await button.click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),expected);report.copies++;
 }
}
// Completion is an explicit acknowledgement, isolated per selected OS.
await page.locator('[data-os=windows]').click();await page.locator('[data-step="0"]').click();
assert.equal(await page.locator('#progress-count').innerText(),'0 / 5');
for(let i=0;i<5;i++) await page.locator('#next').click();
assert.equal(await page.locator('#progress-count').innerText(),'5 / 5');assert(await page.locator('.completion').isVisible());
await page.locator('[data-os=linux]').click();assert.equal(await page.locator('#progress-count').innerText(),'0 / 5');
await page.locator('[data-os=windows]').click();assert.equal(await page.locator('#progress-count').innerText(),'5 / 5');
assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);
assert.equal((await context.cookies()).length,0);
report.checks.push('OS commands, all copy buttons, private key copy/reveal/hide, honest progress, empty browser storage');
for(const width of [320,375,768,1440]){
 await page.setViewportSize({width,height:950});
 for(const os of ['windows','macos','linux']){
  await page.locator(`[data-os=${os}]`).click();
  for(let step=0;step<5;step++){
   await page.locator(`[data-step="${step}"]`).click();
   await page.locator('#panel details').evaluateAll(items=>items.forEach(x=>x.open=true));
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
   assert(!overflow,`page overflow ${width}/${os}/${step}`);report.layoutChecks++;
   if(width===375&&os==='windows'&&[0,2,4].includes(step)){
    await page.locator('#guide').scrollIntoViewIfNeeded();await page.screenshot({path:`${out}mobile-step-${step+1}.png`,fullPage:true});
   }
  }
 }
}
await page.setViewportSize({width:1440,height:1000});await page.locator('[data-os=windows]').click();
for(let step=0;step<5;step++){
 await page.locator(`[data-step="${step}"]`).click();
 const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
 report.axe.push({step:step+1,violations:axe.violations.map(x=>({id:x.id,impact:x.impact,nodes:x.nodes.map(n=>n.target)}))});
}
// Clipboard denial offers selected text instead of a false success message.
await page.locator('[data-step="0"]').click();
await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(new Error('denied'))}}));
await page.locator('#panel [data-copy]').first().click();
assert((await page.locator('#toast').innerText()).includes('手动复制'));
assert.equal(await page.evaluate(()=>getSelection().toString()),'node --version');
// Key retrieval failures and expiry do not expose or enable a stale key.
await context.unroute('**/guides/codex-java/access-key');
await context.route('**/guides/codex-java/access-key',route=>route.fulfill({status:404,body:''}));
await page.locator('[data-step="2"]').click();await page.waitForFunction(()=>document.querySelector('#key-status').textContent.includes('暂不可用'));assert(await page.locator('#copy-key').isDisabled());
await context.unroute('**/guides/codex-java/access-key');
await context.route('**/guides/codex-java/access-key',route=>route.fulfill({json:{key:fakeKey,expiresAt:'2020-01-01T00:00:00Z'}}));
await page.locator('[data-step="1"]').click();await page.locator('[data-step="2"]').click();await page.waitForFunction(()=>document.querySelector('#key-status').textContent.includes('到期'));assert(await page.locator('#copy-key').isDisabled());
report.checks.push('clipboard denial, missing key, expired key, 320–1440 px all systems/all steps');
assert.deepEqual(errors,[]);report.checks.push('no uncaught browser errors');
await browser.close();
for(const [platform,agent,expected] of [['Win32','Windows NT','windows'],['MacIntel','Mac OS','macos'],['Linux x86_64','Linux','linux'],['Linux','Android Mobile',null],['MacIntel','iPhone Mobile',null],['','',null]]) assert.equal(detectSystem(platform,agent),expected);
const safari=await webkit.launch();const safariPage=await safari.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await safariPage.goto(base);await safariPage.waitForSelector('#step-title');await safariPage.locator('[data-os=macos]').click();await safariPage.locator('[data-step="3"]').click();assert((await safariPage.locator('#panel').innerText()).includes(commandsFor('macos').start));
assert(!await safariPage.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1));await safari.close();report.checks.push('WebKit mobile navigation and OS autodetection');
await writeFile(`${out}verification.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
assert.equal(report.axe.flatMap(x=>x.violations).length,0,'Accessibility violations');
