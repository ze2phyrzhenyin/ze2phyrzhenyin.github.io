import { chromium, webkit } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { commands } from '../../public/guides/codex-java/content.js';
const base=process.env.TUTORIAL_URL || 'http://127.0.0.1:44327/guides/codex-java/index.html';
const out=process.env.TUTORIAL_EVIDENCE || new URL('../../.artifacts/codex-java/',import.meta.url).pathname;
await mkdir(out,{recursive:true});
const fakeKey='sk-'+'fixture_only_not_a_real_credential_'.repeat(2);
const report={copies:0,layoutChecks:0,axe:[],checks:[]};
const browser=await chromium.launch();
const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce',colorScheme:'light'});
await context.route('**/guides/codex-java/access-key',route=>route.fulfill({json:{key:fakeKey,expiresAt:'2099-10-31T00:00:00Z'}}));
const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(base);await page.waitForSelector('#step-5');
assert.equal(await page.locator('input,textarea,[data-step],[data-os],#next').count(),0);
assert.equal(await page.locator('.step').count(),5);
assert(!(await page.locator('body').innerText()).match(/macOS|Linux|开启|赋能|轻松掌握/));
for(const section of await page.locator('.step').all())assert(await section.isVisible());
for(const c of Object.values(commands))assert((await page.locator('body').textContent()).includes(c));
await page.waitForFunction(()=>!document.querySelector('#copy-key').disabled);
await page.locator('#copy-key').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),fakeKey);report.copies++;
await page.locator('#reveal-key').click();assert.equal(await page.locator('#key-value').innerText(),fakeKey);
await page.locator('#reveal-key').click();assert.equal(await page.locator('#key-value').textContent(),'');
await page.locator('details').evaluateAll(items=>items.forEach(x=>x.open=true));
for(const button of await page.locator('[data-copy]').all()){
 const id=await button.getAttribute('data-copy');const expected=await page.locator(`#${id}`).textContent();
 await button.click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),expected);report.copies++;
}
await page.evaluate(()=>navigator.clipboard.writeText(''));
assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);
for(const theme of ['light','dark']){
 if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('[data-theme-toggle]').click();
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:950});
  assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),`overflow ${width}/${theme}`);report.layoutChecks++;
  if([390,1440].includes(width)){
   const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
   report.axe.push({width,theme,violations:axe.violations.map(x=>({id:x.id,nodes:x.nodes.map(n=>n.target)}))});
   await page.locator('details').evaluateAll(items=>items.forEach(x=>x.open=false));
   await page.screenshot({path:`${out}tutorial-${theme}-${width}.png`,fullPage:true});
   await page.locator('details').evaluateAll(items=>items.forEach(x=>x.open=true));
  }
 }
}
await page.reload();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
assert.equal(await page.evaluate(()=>localStorage.getItem('codex-java-theme')),'dark');
assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),1);
report.checks.push('five visible Windows steps, all command/prompt copies, key copy/show/hide, light/dark preference persists');
await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(new Error('denied'))}}));
await page.locator('[data-copy]').first().click();assert((await page.locator('#toast').innerText()).includes('手动复制'));
assert.equal(await page.evaluate(()=>getSelection().toString()),commands.check);
await context.unroute('**/guides/codex-java/access-key');
await context.route('**/guides/codex-java/access-key',route=>route.fulfill({status:401,body:''}));
await page.reload();await page.waitForFunction(()=>document.querySelector('#key-status').textContent.includes('暂不可用'));assert(await page.locator('#copy-key').isDisabled());
await context.unroute('**/guides/codex-java/access-key');
await context.route('**/guides/codex-java/access-key',route=>route.fulfill({json:{key:fakeKey,expiresAt:'2020-01-01T00:00:00Z'}}));
await page.reload();await page.waitForFunction(()=>document.querySelector('#key-status').textContent.includes('到期'));assert(await page.locator('#copy-key').isDisabled());
assert.deepEqual(errors,[]);await browser.close();
const safari=await webkit.launch();const mobile=await safari.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await mobile.goto(base);await mobile.waitForSelector('#step-5');assert((await mobile.locator('#step-4').innerText()).includes(commands.start));
await mobile.locator('[data-theme-toggle]').click();assert(!await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1));
await safari.close();report.checks.push('clipboard denial, missing/expired key, no uncaught errors, WebKit mobile');
await writeFile(`${out}verification.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
assert.equal(report.axe.flatMap(x=>x.violations).length,0,'Accessibility violations');
