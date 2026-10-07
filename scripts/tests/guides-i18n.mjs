import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.GUIDE_PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.GUIDE_URL || 'http://127.0.0.1:4328';
const out = process.env.GUIDE_ARTIFACTS || '/tmp/siteweb-guide-audit';
await mkdir(out, {recursive:true});
const routes = {
  guides: '.card',
  'francophone-sport-careers': '#results article',
  'logic-agents': '#catalogue tbody tr',
  'man-city-ucl-away-guide-2026-27': '#calc-amount',
  medvedin: 'h1',
  'musee-prague': 'tbody tr',
  'pyrenees-guide': '#routes section',
  randonnee: 'h1',
  recruit: 'h1',
  'summer-schools-religion': '.programme-card',
  'toulouse-bars': '#directory-table-body tr',
  'toulouse-events': '.event-row',
};
const browser = await chromium.launch({channel:'chrome',headless:true});
const context = await browser.newContext({viewport:{width:390,height:844},locale:'en-GB'});
const page = await context.newPage();
const report = {origin, pages:[], failures:[], checks:[]};
let current = '';
page.on('pageerror', e => report.failures.push({page:current,type:'script',message:e.message}));
page.on('response', r => {
  if (r.url().startsWith(origin) && r.status() >= 400) report.failures.push({page:current,type:'http',url:r.url(),status:r.status()});
});
async function visit(route,lang,suffix='') {
  current=`/${route}/${lang}/${suffix}`;
  const response = await page.goto(origin+current,{waitUntil:'domcontentloaded'});
  assert.equal(response.status(),200,current);
  await page.locator(routes[route]).first().waitFor({state:'attached',timeout:15000});
}
try {
  for (const [route,selector] of Object.entries(routes)) for (const lang of ['en','fr','zh']) {
    try {
      await visit(route,lang);
      assert((await page.locator('html').getAttribute('lang')).startsWith(lang));
      assert.equal(await page.evaluate(()=>document.compatMode),'CSS1Compat',current+' document mode');
      if (route!=='guides') assert.equal(await page.locator('.guide-navigation [data-guide-home]').getAttribute('href'),`/guides/${lang}/`);
      const text=await page.evaluate(()=>{
        const body=document.body.cloneNode(true);
        body.querySelectorAll('script,style').forEach(e=>e.remove());
        return body.textContent.replaceAll('中文','')+' '+Array.from(body.querySelectorAll('[aria-label],[title],[placeholder],[data-label]')).map(el=>['aria-label','title','placeholder','data-label'].map(k=>el.getAttribute(k)||'').join(' ')).join(' ');
      });
      const leaks=lang==='zh'?[]:[...text.matchAll(/[^\n]{0,60}[\u3400-\u9fff][^\n]{0,90}/gu)].map(m=>m[0].trim());
      if(leaks.length) report.failures.push({page:current,type:'translation',leaks:[...new Set(leaks)]});
      const overflow=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
      if(overflow.scroll>overflow.width+1) report.failures.push({page:current,type:'overflow',...overflow});
      const links=await page.locator('.guide-navigation a[hreflang]').count();assert.equal(links,3);
      report.pages.push({path:current,lang,items:await page.locator(selector).count(),title:await page.title()});
      await page.screenshot({animations:'disabled',path:`${out}/${route}-${lang}-390.png`});
      console.log('PAGE',current);
    } catch(e) {report.failures.push({page:current,type:'page',message:e.message});}
  }
  for(const lang of ['en','fr','zh']){
    current=`/toulouse-bars/${lang}/sources.html`;
    await page.goto(origin+current,{waitUntil:'domcontentloaded'});
    await page.locator('#source-list h2').first().waitFor();
    const text=await page.locator('main').innerText();
    if(lang!=='zh' && /[\u3400-\u9fff]/u.test(text))report.failures.push({page:current,type:'source-translation',text:text.match(/[^\n]*[\u3400-\u9fff][^\n]*/gu)});
  }
  async function check(name, run) {
    try { await run(); report.checks.push(name); console.log('PASS',name); }
    catch(e) { report.failures.push({type:'interaction',name,message:e.message}); }
  }
  async function switchTo(locale, ready) {
    await page.locator(`.guide-navigation a[hreflang="${locale === 'zh' ? 'zh-Hans' : locale}"]`).click();
    await page.waitForFunction(l => document.documentElement.lang.startsWith(l),locale);
    if(ready) await page.locator(ready).first().waitFor({state:'attached'});
  }
  await check('Explicit light and dark themes work on every page and persist between pages and languages',async()=>{
    for(const scheme of ['dark','light']){
      await page.emulateMedia({colorScheme:scheme});
      await page.evaluate(()=>localStorage.removeItem('guide-color-theme'));
      await visit('guides','en');
      assert.equal(await page.locator('html').getAttribute('data-theme'),scheme);
      await page.locator('.guide-theme-toggle').click();
      const selected=scheme==='dark'?'light':'dark';
      for(const route of Object.keys(routes)){
        await visit(route,'fr');
        assert.equal(await page.locator('html').getAttribute('data-theme'),selected);
        const palette=await page.evaluate(()=>{
          const s=getComputedStyle(document.body),root=getComputedStyle(document.documentElement);
          const brightness=color=>{const n=color.match(/[\d.]+/g).map(Number);return (n[0]+n[1]+n[2])/3};
          const bg=s.backgroundColor==='rgba(0, 0, 0, 0)'?root.backgroundColor:s.backgroundColor;
          return {background:brightness(bg),text:brightness(s.color),scheme:root.colorScheme};
        });
        assert.equal(palette.scheme,selected,route);
        assert(selected==='light'?palette.background>220&&palette.text<100:palette.background<65&&palette.text>200,JSON.stringify({route,selected,palette}));
        assert.equal(await page.locator('.guide-theme-toggle').getAttribute('aria-label'),selected==='dark'?'Passer au mode clair':'Passer au mode sombre');
        await page.screenshot({animations:'disabled',path:`${out}/${route}-fr-${selected}-390.png`});
      }
      await visit('francophone-sport-careers','en');
      await switchTo('zh','#results article');
      await page.reload({waitUntil:'domcontentloaded'});
      assert.equal(await page.locator('html').getAttribute('data-theme'),selected);
      assert.equal(await page.locator('.guide-theme-toggle').getAttribute('aria-label'),selected==='dark'?'切换到亮色模式':'切换到深色模式');
    }
    await page.locator('.guide-theme-toggle').click();
    await page.emulateMedia({colorScheme:'light'});
  });
  await check('Sports directory section tabs respond in every language',async()=>{
    for(const lang of ['en','fr','zh']){
      await visit('francophone-sport-careers',lang);
      for(const section of ['clubs','jobs','resources','internships']){
        await page.locator(`#main-nav a[href^="#${section}"]`).click();
        await page.waitForFunction(s=>location.hash.split('?')[0]===`#${s}`,section);
        await page.waitForFunction(s=>document.querySelector(`#main-nav a[href^="#${s}"]`)?.getAttribute('aria-current')==='page',section);
        if(section==='resources')assert(await page.locator('main details').count()>0);
        else assert(await page.locator('#results article').count()>0);
      }
    }
  });
  await check('Prague museum, architecture and bookshop tabs retain their own destinations',async()=>{
    for(const lang of ['en','fr','zh']){
      await visit('musee-prague',lang);
      for(const section of ['architecture','bookstores','venues']){
        await page.locator(`.page-nav a[href="#${section}"]`).click();
        await page.locator(`#${section}`).waitFor({state:'visible'});
        assert(await page.locator(`#${section}`).isVisible());
        assert.equal(new URL(page.url()).hash,`#${section}`);
      }
      const row=page.locator('#venues tbody tr').first();
      assert((await row.boundingBox()).width>300,'mobile venue card must use the available width');
      assert((await row.locator('td').first().boundingBox()).width>300,'mobile cells must not collapse to one-letter columns');
    }
  });
  await check('All index cards open their localized or bilingual guides', async()=>{
    for(const lang of ['en','fr','zh']){
      await visit('guides',lang);
      const links=await page.locator('a.card').evaluateAll(as=>as.map(a=>a.getAttribute('href')));
      assert.equal(links.length,13);assert.equal(new Set(links).size,13);
      for(const href of links){
        if(href==='/construction-hotel-sql/'){
          await page.goto(origin+href,{waitUntil:'domcontentloaded'});
          await page.locator('a[href="/guides/zh/"]').first().click();
          await page.waitForURL(origin+'/guides/zh/');
          continue;
        }
        if(href.startsWith('/guides/java/')){
          assert.equal(new URL(href,origin).searchParams.get('from'),lang);
          await page.goto(origin+href,{waitUntil:'domcontentloaded'});
          await page.locator('.guide-return-mobile').click();
          await page.waitForURL(origin+`/guides/${lang}/`);
          continue;
        }
        assert(href.endsWith(`/${lang}/`));
        await page.goto(origin+href,{waitUntil:'domcontentloaded'});
        await page.locator('.guide-navigation [data-guide-home]').click();
        await page.waitForURL(origin+`/guides/${lang}/`);
      }
    }
  });
  await check('Bar search, category and sort survive switching and refresh',async()=>{
    await visit('toulouse-bars','en');
    await page.locator('[data-filter=cocktails]').click();
    await page.locator('#search-input').fill('Kodomo');
    await page.locator('#sort-select').selectOption('lounge');
    assert.equal(await page.locator('#directory-table-body tr').count(),1);
    for(const lang of ['fr','zh','en']){
      await switchTo(lang,'#directory-table-body tr');
      assert.equal(await page.locator('#search-input').inputValue(),'Kodomo');
      assert.equal(await page.locator('#directory-table-body tr').count(),1);
      assert.equal(await page.locator('#sort-select').inputValue(),'lounge');
      await page.reload({waitUntil:'domcontentloaded'});
      await page.locator('#directory-table-body tr').first().waitFor();
      assert.equal(await page.locator('#directory-table-body tr').count(),1);
    }
  });
  await check('Event categories, bookmarks, details and localized calendar export',async()=>{
    await visit('toulouse-events','en');
    await page.locator('[data-month=all]').click();
    await page.locator('[data-category=sport]').click();
    const ids=await page.locator('.event-row').evaluateAll(es=>es.map(e=>e.dataset.event));
    assert.equal(ids.length,40);
    const id=ids[0];
    await page.locator(`.event-row [data-save="${id}"]`).click();
    await switchTo('fr','.event-row');
    assert.deepEqual(await page.locator('.event-row').evaluateAll(es=>es.map(e=>e.dataset.event)),ids);
    assert.equal(await page.locator(`.event-row [data-save="${id}"]`).getAttribute('aria-pressed'),'true');
    await page.locator(`.event-row [data-detail="${id}"]`).click();
    const download=page.waitForEvent('download');
    await page.locator(`[data-calendar="${id}"]`).click();
    const file=await download;await file.saveAs(`${out}/event-fr.ics`);
    await page.locator('#show-saved').click();
    assert.equal(await page.locator('.event-row').count(),1);
    await switchTo('zh','.event-row');
    assert.equal(await page.locator('.event-row').count(),1);
    await page.locator('#search').fill('no-match-7353');
    assert(await page.locator('#empty-state').isVisible());
  });
  await check('School search and expanded programme survive switching and refresh',async()=>{
    await visit('summer-schools-religion','en');
    await page.locator('#search-input').fill('Buddhism');
    assert.equal(await page.locator('.programme-card').count(),1);
    await page.locator('.card-header').click();
    await switchTo('fr','.programme-card');
    assert.equal(await page.locator('#search-input').inputValue(),'Buddhism');
    assert.equal(await page.locator('.programme-card.expanded').count(),1);
    assert.equal(await page.locator('[data-guide-home]').first().getAttribute('href'),'/guides/fr/');
    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator('.programme-card.expanded').waitFor();
    assert.equal(await page.locator('.programme-card').count(),1);
  });
  await check('Football team view and budget values survive language switching',async()=>{
    await visit('man-city-ucl-away-guide-2026-27','en');
    for (const input of await page.locator('.calculator input[name=match]').all()) await input.uncheck();
    await page.locator('.calculator input[value="mci-psg"]').check();
    await page.locator('.calculator input[value="avl-psg"]').check();
    await page.locator('input[name=mode][value=mid]').check();
    await page.locator('#hasUkVisa').uncheck();
    const amount=await page.locator('#calc-amount').innerText();
    assert.equal(amount.replace(/\s/g,''),'€1620–2630');
    for(const lang of ['fr','zh']){
      await switchTo(lang,'#calc-amount');
      assert.equal(await page.locator('.calculator input[name=match]:checked').count(),2);
      assert.equal(await page.locator('#calc-amount').innerText(),amount);
    }
  });
  await check('Legacy links preserve explicit language, query and section',async()=>{
    await page.goto(origin+'/man-city-ucl-away-guide-2026-27/?lang=fr&team=city#schedule');
    await page.waitForURL(u=>u.pathname.endsWith('/fr/') && u.searchParams.get('team')==='city');
    assert.equal(new URL(page.url()).hash,'#schedule');
  });
  await check('Desktop layouts in all three languages',async()=>{
    await page.setViewportSize({width:1440,height:1000});
    for(const route of Object.keys(routes))for(const lang of ['en','fr','zh']){
      await visit(route,lang);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),current);
      if(lang==='fr')await page.screenshot({animations:'disabled',path:`${out}/${route}-fr-1440.png`});
    }
  });
  await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));
  assert.deepEqual(report.failures,[],`See ${out}/report.json`);
} finally {
  await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));
  await browser.close();
}
console.log(`PASS ${report.pages.length} guide pages and 3 bibliographies`);
