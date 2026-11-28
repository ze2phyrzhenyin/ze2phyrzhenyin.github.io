// Browser check for /guides/circular-africa/.
//   GUIDE_URL=http://127.0.0.1:4391 node resources/circular-africa/browser-check.mjs
// Serve public/ first (python3 -m http.server 4391 --directory public). Uses the installed Chrome.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { version } from './ui.mjs';
const { chromium } = await import(process.env.GUIDE_PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.GUIDE_URL || 'http://127.0.0.1:4391';
const base = `${origin}/guides/circular-africa`;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const failures = [], passes = [];
async function check(name, fn) { try { await fn(); passes.push(name); console.log('PASS', name); } catch (e) { failures.push(name); console.log('FAIL', name, '\n  ', e.message.split('\n')[0]); } }
async function settle(page) {
  // Wait until smooth scrolling has stopped.
  let last = -1;
  for (let i = 0; i < 40; i++) { const y = await page.evaluate(() => scrollY); if (y === last) return; last = y; await page.waitForTimeout(150); }
}
async function open(width, path, scheme = 'light') {
  const page = await browser.newPage({ viewport: { width, height: width < 600 ? 844 : 900 }, colorScheme: scheme });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.url().startsWith(origin) && r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  await page.goto(base + path, { waitUntil: 'networkidle' });
  return { page, errors };
}
const pages = ['en', 'es', 'zh'].flatMap(l => [`/${l}/`, `/${l}/sources/`, `/${l}/prompt/`]);

await check('all nine pages load without errors or horizontal scroll at 390 and 1440 px', async () => {
  for (const w of [390, 1440]) for (const p of pages) {
    const { page, errors } = await open(w, p);
    const o = await page.evaluate(() => ({ w: innerWidth, sw: document.documentElement.scrollWidth }));
    assert.deepEqual(errors, [], p);
    assert(o.sw <= o.w + 1, `${p} at ${w}: scrollWidth ${o.sw}`);
    await page.close();
  }
});
await check('English and Spanish pages contain no Chinese outside the language switch', async () => {
  for (const p of pages.filter(p => !p.startsWith('/zh/'))) {
    const { page } = await open(1440, p);
    const text = await page.evaluate(() => { const b = document.body.cloneNode(true); b.querySelectorAll('script,style,.langs,textarea').forEach(e => e.remove()); return b.textContent; });
    const leak = text.match(/[^\n]{0,40}[㐀-鿿][^\n]{0,40}/u);
    assert(!leak, `${p}: ${leak?.[0]}`);
    await page.close();
  }
});
await check('a deep link opens the chapter, marks it in the sidebar and keeps it in view', async () => {
  const { page } = await open(1440, '/en/#bale');
  await page.waitForTimeout(500);
  assert.equal(await page.locator('.toc a.active').getAttribute('data-toc'), 'bale');
  const top = await page.evaluate(() => document.getElementById('bale').getBoundingClientRect().top);
  assert(top >= 40 && top < 140, `chapter top ${top}`);
  await page.close();
});
await check('the sidebar keeps its own scroll position when a chapter is chosen', async () => {
  const { page } = await open(1440, '/en/');
  await page.setViewportSize({ width: 1440, height: 620 });
  await page.locator('.toc-scroll').evaluate(s => { s.scrollTop = 400; });
  const before = await page.locator('.toc-scroll').evaluate(s => s.scrollTop);
  await page.locator('[data-toc="plan"]').click();
  await settle(page);
  const after = await page.locator('.toc-scroll').evaluate(s => s.scrollTop);
  assert(Math.abs(after - before) < 260, `sidebar jumped from ${before} to ${after}`);
  assert.equal(await page.locator('.toc a.active').getAttribute('data-toc'), 'plan');
  const box = await page.locator('[data-toc="plan"]').boundingBox();
  assert(box.y > 56 && box.y + box.height < 620, 'active item visible');
  assert.equal(new URL(page.url()).hash, '#plan');
  await page.close();
});
await check('the mobile contents sheet opens, scrolls and closes on a choice', async () => {
  const { page } = await open(390, '/zh/');
  await page.click('.toc-open');
  await page.locator('[data-toc="search"]').click();
  await settle(page);
  assert.equal(await page.locator('.toc').evaluate(t => t.classList.contains('open')), false);
  assert.equal(new URL(page.url()).hash, '#search');
  assert.match(await page.textContent('[data-toc-current]'), /检索/);
  await page.close();
});
await check('calculators start at the report values', async () => {
  const { page } = await open(1440, '/en/');
  assert.equal(await page.textContent('[data-v="left-big"]'), 'GHS 10.51');
  assert.equal(await page.textContent('[data-v="be"]'), '15.0 %');
  assert.equal(await page.textContent('[data-v="fills"]'), '20');
  assert.equal(await page.textContent('[data-v="revenue"]'), 'GHS 1,350');
  await page.locator('#r-m').fill('2');
  assert.equal(await page.textContent('[data-v="fills"]'), '30');
  await page.close();
});
await check('directory filters and tabs live in the address and survive a reload', async () => {
  const { page } = await open(1440, '/es/sources/');
  await page.selectOption('#f-region', 'kenya');
  await page.selectOption('#f-mode', 'query');
  await page.waitForTimeout(100);
  const url = new URL(page.url());
  assert.equal(url.searchParams.get('region'), 'kenya');
  assert.equal(url.searchParams.get('mode'), 'query');
  const shown = await page.locator('#panel-sources .entry:not([hidden])').count();
  assert(shown > 0 && shown < 178, `shown ${shown}`);
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.inputValue('#f-region'), 'kenya');
  assert.equal(await page.locator('#panel-sources .entry:not([hidden])').count(), shown);
  await page.click('[data-tab="companies"]');
  assert.equal(new URL(page.url()).searchParams.get('view'), 'companies');
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.getAttribute('[data-tab="companies"]', 'aria-selected'), 'true');
  assert(await page.locator('#panel-companies').isVisible());
  await page.close();
});
await check('a filtered directory hides organisations without matching entries', async () => {
  const { page } = await open(1440, '/en/sources/?region=kenya');
  const visibleOrgs = await page.locator('#panel-sources .org:visible').count();
  const n = await page.locator('#panel-sources .entry:visible').count();
  assert(n > 0 && visibleOrgs > 0 && visibleOrgs <= n, `orgs ${visibleOrgs}, entries ${n}`);
  assert.equal(await page.locator('#S132').isVisible(), false, 'Accra Brewery is not a Kenyan source');
  await page.click('[data-set="region"][data-value="ghana"]');
  assert.equal(new URL(page.url()).searchParams.get('region'), 'ghana');
  assert.equal(await page.inputValue('#f-region'), 'ghana');
  assert.equal(await page.getAttribute('[data-set="region"][data-value="ghana"]', 'aria-pressed'), 'true');
  await page.close();
});
await check('the map opens a place, flies to it, loads street detail and goes back', async () => {
  const { page, errors } = await open(1440, '/en/');
  const vbw = async () => Number((await page.getAttribute('.hero .africa-map', 'viewBox')).split(' ')[2]);
  const start = await vbw();
  await page.click('.chips [data-go="ghana"]');
  await page.waitForTimeout(1900);
  assert(await page.locator('[data-panel]').isVisible(), 'panel visible');
  assert.equal(await page.textContent('.pl-head h2'), 'Ghana');
  assert.equal(new URL(page.url()).searchParams.get('place'), 'ghana');
  assert(await vbw() < start / 6, 'zoomed to Ghana');
  await page.waitForSelector('.d-ghana .d-regions', { state: 'attached' });
  assert.equal(await page.getAttribute('[data-map]', 'data-level'), 'country');
  assert(await page.locator('.lbl.region:not(.off):not(.clash)').count() >= 8, 'region names shown');
  await page.click('.pl-kids [data-go="accra"]');
  await page.waitForTimeout(1900);
  assert.equal(await page.getAttribute('[data-map]', 'data-level'), 'city');
  assert(await page.locator('.d-accra .c-road.primary').isVisible(), 'Accra streets drawn');
  await page.click('.mk[data-go="kantamanto"]');
  await page.waitForTimeout(1500);
  assert.equal(await page.textContent('.pl-head h2'), 'Kantamanto');
  assert.match(await page.textContent('.place-panel'), /GHS 2,200/);
  await page.goBack(); await page.waitForTimeout(1600);
  assert.equal(await page.textContent('.pl-head h2'), 'Accra');
  await page.keyboard.press('Escape'); await page.waitForTimeout(1600);
  assert.equal(await page.locator('[data-panel]').isVisible(), false);
  assert(await page.locator('[data-intro]').isVisible());
  assert.deepEqual(errors, []);
  await page.close();
});
await check('the map pans by dragging and zooms with Ctrl + wheel, the buttons and a double click', async () => {
  const { page } = await open(1440, '/en/');
  const vb = async () => (await page.getAttribute('.hero .africa-map', 'viewBox')).split(' ').map(Number);
  const box = await page.locator('.hero .africa-map').boundingBox();
  const a = await vb();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down(); await page.mouse.move(box.x + box.width / 2 - 120, box.y + box.height / 2, { steps: 8 }); await page.mouse.up();
  await page.waitForTimeout(900);
  const b = await vb();
  assert(b[0] > a[0] + 20, `panned ${a[0]} -> ${b[0]}`);
  assert(!(await page.locator('[data-panel]').isVisible()), 'a drag does not select');
  await page.keyboard.down('Control'); await page.mouse.wheel(0, -400); await page.keyboard.up('Control');
  await page.waitForTimeout(900);
  const c = await vb();
  assert(c[2] < b[2] * 0.7, `wheel zoom ${b[2]} -> ${c[2]}`);
  await page.click('[data-zoom="out"]'); await page.waitForTimeout(900);
  assert((await vb())[2] > c[2] * 1.5, 'zoom-out button');
  await page.mouse.dblclick(box.x + box.width * 0.4, box.y + box.height * 0.45); await page.waitForTimeout(900);
  assert((await vb())[2] < c[2] * 1.5, 'double click zooms in');
  await page.click('.map-all'); await page.waitForTimeout(1600);
  assert(Math.abs((await vb())[2] - a[2]) < 1, 'back to Africa');
  await page.close();
});
await check('a shared map link opens the same place in every language', async () => {
  for (const [l, name] of [['en', 'Kenya'], ['es', 'Kenia'], ['zh', '肯尼亚']]) {
    const { page } = await open(390, `/${l}/?place=kenya`);
    assert.equal(await page.textContent('.pl-head h2'), name);
    assert(await page.locator('.mk[data-go="kenya"]:not(.off)').count() === 1);
    const o = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    assert(o <= 1, `overflow ${o}`);
    await page.close();
  }
});
await check('the bale sorts by price and back', async () => {
  const { page } = await open(1440, '/en/#bale');
  const first = () => page.evaluate(() => [...document.querySelectorAll('.bale-grid i')].slice(0, 46).every(i => i.classList.contains('b0')));
  assert.equal(await first(), false);
  await page.click('[data-bale-sort]');
  assert.equal(await first(), true);
  await page.click('[data-bale-sort]');
  assert.equal(await first(), false);
  await page.close();
});
await check('a dot on the events axis brings its row into view', async () => {
  const { page } = await open(1440, '/en/#events-2024');
  await page.waitForTimeout(400);
  await page.click('[data-event="E16"] .hit');
  await page.waitForTimeout(1200);
  const top = await page.evaluate(() => document.getElementById('ev-E16').getBoundingClientRect().top);
  assert(top > 100 && top < 800, `row top ${top}`);
  await page.close();
});
await check('search finds sources, places and chapters from any page', async () => {
  const { page } = await open(1440, '/en/prompt/');
  await page.keyboard.press('/');
  await page.waitForSelector('dialog[open] .pal-input');
  await page.waitForTimeout(200);
  await page.fill('.pal-input', 'jibu refill');
  await page.waitForTimeout(100);
  assert((await page.locator('.pal-results li[role="option"]').count()) > 0);
  await page.fill('.pal-input', 'kantamanto');
  const kinds = await page.locator('.pal-kind').allTextContents();
  assert(kinds.includes('Map') && kinds.includes('Source'), kinds.join(','));
  await page.keyboard.press('Enter');
  await page.waitForLoadState('networkidle');
  assert.match(page.url(), /\/en\//);
  await page.close();
});
await check('starred sources gather in My list and survive a reload', async () => {
  const { page } = await open(1440, '/en/sources/');
  await page.evaluate(() => localStorage.removeItem('circular-africa-watch-v1'));
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('[data-watch="S016-01"]');
  await page.click('[data-watch="S032-01"]');
  assert.equal(await page.textContent('[data-tab="mine"] span'), '2');
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('[data-tab="mine"]');
  assert.equal(await page.locator('[data-mine-list] .entry').count(), 2);
  assert(await page.locator('[data-mine-export]').isVisible());
  await page.evaluate(() => localStorage.removeItem('circular-africa-watch-v1'));
  await page.close();
});
await check('the Spanish and Chinese report can show the English original under each paragraph', async () => {
  const { page } = await open(1440, '/es/#summary');
  await page.click('[data-orig]');
  await page.waitForSelector('.show-orig .orig');
  assert.match(await page.locator('#summary .orig').first().textContent(), /Start at Kwame Nkrumah Circle/);
  await page.click('[data-orig]');
  assert.equal(await page.locator('#summary .orig').first().isVisible(), false);
  await page.close();
});
await check('a source ID from the report opens that organisation in the directory', async () => {
  const { page } = await open(1440, '/en/#sources-1');
  await page.locator('#sources-1 a.btn-quiet').first().click();
  await page.waitForURL(/sources\/#S016$/);
  await page.waitForTimeout(600);
  const top = await page.evaluate(() => document.getElementById('S016').getBoundingClientRect().top);
  assert(top > 50 && top < 300, `S016 top ${top}`);
  await page.close();
});
await check('search finds Kantamanto sources in Chinese', async () => {
  const { page } = await open(1440, '/zh/sources/');
  await page.fill('#f-q', 'kantamanto');
  await page.waitForTimeout(300);
  const n = await page.locator('#panel-sources .entry:not([hidden])').count();
  assert(n >= 3, `found ${n}`);
  assert.equal(new URL(page.url()).searchParams.get('q'), 'kantamanto');
  await page.close();
});
await check('switching language keeps the chapter', async () => {
  const { page } = await open(1440, '/en/#refill');
  await page.waitForTimeout(400);
  await page.click('.langs a[hreflang="es"]');
  await page.waitForURL(/\/es\/#refill$/);
  await page.close();
});
await check('the French guides index sends readers back to the French index', async () => {
  const { page } = await open(1440, '/en/?from=fr');
  assert.equal(await page.getAttribute('#all-guides', 'href'), '/guides/fr/');
  assert.match(await page.getAttribute('.views a[href*="sources"]', 'href'), /from=fr/);
  await page.close();
});
await check('the prompt copy text equals the downloadable Markdown', async () => {
  for (const l of ['en', 'es', 'zh']) {
    const { page } = await open(1440, `/${l}/prompt/`);
    const md = await page.inputValue('#prompt-md');
    const file = await readFile(new URL(`../../public/guides/circular-africa/files/research-prompt-${l}-v${version.n}.md`, import.meta.url), 'utf8');
    assert.equal(md, file);
    assert(md.length > (l === 'zh' ? 9000 : 20000), `${l} prompt length ${md.length}`);
    await page.close();
  }
});
await check('dark mode follows the saved guides preference', async () => {
  const { page } = await open(1440, '/en/', 'light');
  await page.click('[data-theme-toggle]');
  assert.equal(await page.getAttribute('html', 'data-theme'), 'dark');
  await page.goto(base + '/zh/sources/', { waitUntil: 'networkidle' });
  assert.equal(await page.getAttribute('html', 'data-theme'), 'dark');
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  assert.match(bg, /rgb\((1[0-9]|2[0-9]|[0-9]), /);
  await page.click('[data-theme-toggle]');
  await page.close();
});
await browser.close();
console.log(`${passes.length} passed, ${failures.length} failed`);
process.exit(failures.length ? 1 : 0);
