import assert from 'node:assert/strict';
import {mkdir,readFile} from 'node:fs/promises';
const {chromium} = await import(process.env.GUIDE_PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.GUIDE_URL || 'http://127.0.0.1:49431';
const base = origin + '/guides/claude-3d/';
const out = process.env.GUIDE_ARTIFACTS;
if (out) await mkdir(out,{recursive:true});
const browser = await chromium.launch({channel:'chrome',headless:true});
try {
  const context = await browser.newContext({viewport:{width:1400,height:900},locale:'zh-CN',colorScheme:'light',permissions:['clipboard-read','clipboard-write']});
  const p = await context.newPage();
  const errors = [];
  const waitForGuide = () => p.locator('html.enhanced').waitFor({state:'attached'});
  p.on('pageerror',e=>errors.push(e.message));
  p.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)errors.push(r.url()+' '+r.status());});
  for (const locale of ['en','fr','zh']) {
    await p.goto(origin+'/guides/'+locale+'/',{waitUntil:'domcontentloaded'});
    await p.locator('a.card[href*="/guides/claude-3d/"]').click();
    await waitForGuide();
    assert.equal(await p.locator('#all-guides').getAttribute('href'),'/guides/'+locale+'/');
  }
  const shot=async name=>{if(out)await p.screenshot({path:out+'/'+name+'.png'});};
  const locator=id=>p.locator('#'+id);
  await locator('study').evaluate(img=>img.decode());
  await shot('desktop');
  for (const view of ['clay','detail','studio']) {
    await p.locator('[data-view="'+view+'"]').click();
    await locator('study').evaluate(img=>img.decode());
    assert((await locator('study').getAttribute('src')).endsWith(view+'.webp'));
  }
  await p.locator('[data-route="code"]').click();
  assert(await locator('route-code').isVisible());
  await p.locator('[data-route="video"]').click();
  await p.goBack();
  assert(await locator('route-code').isVisible());
  await p.locator('.adviser summary').click();
  await locator('subject').selectOption('ui');
  assert.match(await locator('advice').innerText(),/录制原始界面/);
  await locator('route-code').locator('a').click();
  await waitForGuide();
  assert.equal(await locator('category').inputValue(),'code');
  assert.equal(await p.locator('[data-tool]:visible').count(),4);
  await locator('category').selectOption('all');
  await locator('search').fill('不存在的条目');
  assert(await locator('no-tools').isVisible());
  await locator('reset-filter').click();
  assert.equal(await p.locator('[data-tool]:visible').count(),22);
  await p.locator('.compare-choice input').nth(0).check();
  await locator('search').fill('remotion');
  await p.getByRole('checkbox',{name:'对比 Remotion',exact:true}).check();
  await locator('search').fill('ffmpeg');
  await p.getByRole('checkbox',{name:'对比 FFmpeg',exact:true}).check();
  await p.reload();
  assert.equal(await p.locator('.compare-choice input:checked').count(),3);
  assert.equal(await p.locator('.compare-choice input:disabled').count(),19);
  await p.locator('.toolbar a').click();
  assert.match(await locator('compare-table').innerText(),/Blender.*Remotion.*FFmpeg/s);
  await p.getByRole('button',{name:'移除 Remotion',exact:true}).click();
  assert.equal(await p.locator('.compare-choice input:checked').count(),2);
  await locator('clear').click();
  assert.equal(await p.locator('.compare-choice input:checked').count(),0);
  await p.goto(base+'estimate/');
  assert.match(await locator('render-result').innerText(),/480 帧，约 80 分钟/);
  await locator('per').fill('0'); assert.equal(await locator('render-result').getAttribute('data-invalid'),'true');
  assert.match(await locator('quota-result').innerText(),/20%/);
  await locator('tested').fill('0'); assert.equal(await locator('quota-result').getAttribute('data-invalid'),'true');
  await locator('inprice').fill('3'); await locator('outprice').fill('15');
  assert.match(await locator('api-result').innerText(),/2.25 美元/);
  await p.goto(base+'cases/');
  await locator('case-type').selectOption('film');
  assert.equal(await p.locator('[data-case]:visible').count(),3);
  const duration=await p.locator('video').evaluate(async video=>{
    await video.play(); video.pause(); return video.duration;
  });
  assert.equal(duration,3);
  const blend=await p.request.get(base+'media/twin-66.blend');
  assert(blend.ok()); assert((await blend.body()).length>100000);
  await p.goto(base+'handbook/#prompt');
  await p.locator('[data-brief]').first().fill('镜头试拍');
  await locator('copy').click();
  const clip=await p.evaluate(()=>navigator.clipboard.readText());
  assert(clip.startsWith('项目内容：镜头试拍'));
  const file=p.waitForEvent('download'); await locator('download').click();
  assert.equal(await readFile(await (await file).path(),'utf8'),clip);
  await locator('theme').click();
  await p.goto(base);
  assert.equal(await p.locator('html').getAttribute('data-theme'),'dark');
  await shot('desktop-dark');
  await locator('theme').click();
  for (const width of [390,320]) {
    await p.setViewportSize({width,height:844});
    for (const route of ['','tools/','cases/','estimate/','handbook/']){
      await p.goto(base+route);
      const overflow=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
      assert(overflow<2,route+' overflows at '+width);
      for (const link of await p.locator('.main-nav a').all()) assert(await link.isVisible());
      if(width===390) await shot('mobile-'+(route.replace('/','')||'home'));
    }
  }
  assert.deepEqual(errors,[]);
  console.log('PASS guide entry and return links, render views, routes, tool filters and comparison, calculators, video, downloads, clipboard, theme and mobile layouts.');
} finally { await browser.close(); }
