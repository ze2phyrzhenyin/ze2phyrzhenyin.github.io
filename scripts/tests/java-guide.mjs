import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const { chromium } = await import(process.env.GUIDE_PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.GUIDE_URL || 'http://127.0.0.1:4332';
const out = process.env.GUIDE_ARTIFACTS || '/tmp/siteweb-java-audit';
await mkdir(out, {recursive:true});
const data = JSON.parse(await readFile(new URL('../../resources/java-revision-site/source/data.json', import.meta.url)));
const routes = ['home','learn','algorithms','api','vocabulary','cards','practice','wrong','mock','errors','checklist','records','sources',
  ...data.chapters.map(x=>'chapter/'+x.id), ...data.lessons.map(x=>'lesson/'+x.id),
  ...data.algorithms.map(x=>'algo/'+x.id), ...data.apis.map(x=>'api/'+x.id), ...data.questions.map(x=>'question/'+x.id)];
const browser = await chromium.launch({channel:'chrome',headless:true});
const context = await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
const page = await context.newPage();
const report = {origin, layouts:[], checks:[], errors:[]};
page.on('pageerror', e=>report.errors.push(e.message));
page.on('response', r=>{if(r.url().startsWith(origin)&&r.status()>=400)report.errors.push(`${r.status()} ${r.url()}`);});
page.on('dialog', d=>d.accept());
const visit = async hash=>{
  await page.goto(`${origin}/guides/java/?from=zh#${hash}`,{waitUntil:'domcontentloaded'});
  await page.locator('#main').filter({has:page.locator('h1,h3')}).waitFor();
};
const screenshot = name=>page.screenshot({path:`${out}/${name}.png`,animations:'disabled'});
try {
  for(const lang of ['en','fr','zh']){
    await page.goto(`${origin}/guides/${lang}/`,{waitUntil:'domcontentloaded'});
    assert.equal(await page.locator('a.card').count(),13);
    const card=page.locator(`a.card[href="/guides/java/?from=${lang}"]`);
    await card.scrollIntoViewIfNeeded();
    await screenshot(`directory-${lang}-390`);
    await card.tap();
    assert.equal(await page.locator('.guide-return-mobile').getAttribute('href'),`/guides/${lang}/`);
    await page.locator('.guide-return-mobile').tap();
    await page.waitForURL(`${origin}/guides/${lang}/`);
  }
  report.checks.push('Java cards and same-language return links in all three directories');
  await visit('home');
  assert.deepEqual(await page.locator('#site-data').evaluate(el=>JSON.parse(el.textContent)),data);
  for(const width of process.env.JAVA_SKIP_LAYOUTS==='1'?[]:[320,390,760,768,844,1440]){
    await page.setViewportSize({width,height:width===844?390:900});
    const failures=await page.evaluate(async routes=>{
      const failures=[];
      for(const route of routes){
        location.hash=route;
        await new Promise(resolve=>setTimeout(resolve,0));
        const scroll=document.documentElement.scrollWidth;
        if(scroll>innerWidth+1)failures.push({route,scroll,width:innerWidth});
        if(!document.querySelector('#main h1,#main h3'))failures.push({route,empty:true});
      }
      return failures;
    },routes);
    assert.deepEqual(failures,[],`${width}px layouts`);
    report.layouts.push({width,routes:routes.length,overflow:0});
    console.log(`PASS ${routes.length} routes at ${width}px`);
  }
  await page.setViewportSize({width:390,height:844});
  await visit('home');
  await screenshot('home-390');
  await page.locator('.menu-button').tap();
  assert.equal(await page.locator('#sidebar').getAttribute('aria-modal'),'true');
  assert(await page.locator('.workspace').evaluate(el=>el.inert));
  await screenshot('menu-390');
  await page.keyboard.press('Shift+Tab');
  assert(await page.locator('#sidebar a').last().evaluate(el=>el===document.activeElement));
  await page.keyboard.press('Tab');
  assert(await page.locator('.close-menu').evaluate(el=>el===document.activeElement));
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.menu-button').getAttribute('aria-expanded'),'false');
  await page.locator('.menu-button').tap();
  await page.locator('#nav a[href="#practice"]').tap();
  await page.waitForURL('**#practice');
  assert.equal(await page.locator('.menu-button').getAttribute('aria-expanded'),'false');
  await page.locator('.menu-button').tap();
  await page.locator('#shade').tap({position:{x:370,y:100}});
  assert.equal(await page.locator('.menu-button').getAttribute('aria-expanded'),'false');
  report.checks.push('Touch menu, focus trap, Escape, backdrop and navigation close');
  await page.locator('.search-trigger').tap();
  await page.locator('#globalSearch').fill('hashCode');
  assert(await page.locator('.search-result').count()>0);
  await screenshot('search-390');
  await page.locator('.search-result').first().tap();
  assert(!(await page.locator('#searchDialog').evaluate(el=>el.open)));
  report.checks.push('Mobile search opens results and closes its dialog');
  await visit('lesson/'+data.lessons[0].id);
  await page.locator('[data-act="learned"]').tap();
  await page.locator('[data-note]').fill('移动端测试笔记');
  await page.reload();
  assert.equal(await page.locator('[data-note]').inputValue(),'移动端测试笔记');
  assert(await page.locator('[data-act="learned"]').evaluate(el=>el.classList.contains('selected')));
  await screenshot('lesson-390');
  const q=data.questions.find(q=>q.kind==='qcm');
  await visit('question/'+q.id);
  for(const choice of q.correct)await page.locator(`input[data-option="${q.id}"][value="${choice}"]`).check();
  await page.locator('[data-act="grade"]').tap();
  assert(await page.evaluate(id=>JSON.parse(localStorage.getItem('miage-java-review-v1')).answers[id].ok,q.id));
  await screenshot('answer-390');
  await visit('mock');
  await page.locator('[data-act="start-mock"]').tap();
  const deadline=await page.evaluate(()=>JSON.parse(localStorage.getItem('miage-java-review-v1')).mock.end);
  await page.reload();
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('miage-java-review-v1')).mock.end),deadline);
  await screenshot('mock-390');
  await page.locator('[data-act="submit-mock"]').first().tap();
  assert(await page.evaluate(()=>JSON.parse(localStorage.getItem('miage-java-review-v1')).history.length===1));
  report.checks.push('Notes, learned state, answer grading and mock deadline persist after refresh');
  await visit('records');
  const downloading=page.waitForEvent('download');
  await page.locator('[data-act="export"]').tap();
  const download=await downloading;
  const backupPath=`${out}/records.json`;
  await download.saveAs(backupPath);
  assert.equal(JSON.parse(await readFile(backupPath,'utf8')).state.notes['lesson:'+data.lessons[0].id],'移动端测试笔记');
  await page.locator('#importFile').setInputFiles(backupPath);
  report.checks.push('Study records export and import');
  await page.locator('[data-act="theme"]').tap();
  await page.reload();
  assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
  await screenshot('records-dark-390');
  await context.setOffline(true);
  await page.locator('.menu-button').tap();
  await page.locator('#nav a[href="#vocabulary"]').tap();
  await page.locator('#vocabResults').waitFor();
  await context.setOffline(false);
  report.checks.push('Theme persists and study navigation works without network after loading');
  assert.deepEqual(report.errors,[]);
  console.log(`PASS ${report.checks.length} interaction groups; ${report.layouts.length*routes.length} layout checks; no script or HTTP errors.`);
} finally {
  await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));
  await browser.close();
}
