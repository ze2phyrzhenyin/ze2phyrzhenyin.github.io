// Browser checks for /guides/deck-methods/ in Chinese, English and French, at 390 px and 1280 px, light and dark.
//   GUIDE_PLAYWRIGHT_MODULE=<playwright module> node resources/deck-methods/browser-check.mjs
// Serves public/ on a free local port unless GUIDE_URL names a running site. GUIDE_ARTIFACTS=<folder> keeps screenshots.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdir, readFile, stat} from 'node:fs/promises';
import {extname, join, normalize} from 'node:path';
import {fileURLToPath} from 'node:url';
import {base, chapters, fileKinds, links, locales, sections, works} from './content.mjs';
const {chromium} = await import(process.env.GUIDE_PLAYWRIGHT_MODULE || 'playwright');

const publicRoot = fileURLToPath(new URL('../../public', import.meta.url));
const types = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'};
const server = process.env.GUIDE_URL ? null : createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://local');
    let file = join(publicRoot, normalize(decodeURIComponent(url.pathname)));
    if (!file.startsWith(publicRoot)) throw new Error('outside');
    if ((await stat(file)).isDirectory()) {
      if (!url.pathname.endsWith('/')) { response.writeHead(301, {location: url.pathname + '/' + url.search}); response.end(); return; }
      file = join(file, 'index.html');
    }
    const body = await readFile(file);
    response.writeHead(200, {'content-type': types[extname(file)] || 'application/octet-stream', 'content-length': body.length, 'cache-control': 'no-store'});
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch { response.writeHead(404, {'content-type': 'text/plain'}); response.end('not found'); }
});
if (server) await new Promise(done => server.listen(0, '127.0.0.1', done));
const origin = process.env.GUIDE_URL || `http://127.0.0.1:${server.address().port}`;
const out = process.env.GUIDE_ARTIFACTS;
if (out) await mkdir(out, {recursive: true});

const sizes = [{width: 390, height: 844}, {width: 1280, height: 900}];
const labels = {zh: {dark: '深色', light: '浅色'}, en: {dark: 'Dark', light: 'Light'}, fr: {dark: 'Sombre', light: 'Clair'}};
const report = [];
const browser = await chromium.launch({headless: true});
try {
  for (const locale of locales) for (const viewport of sizes) for (const scheme of ['light', 'dark']) {
    const where = `${locale} ${viewport.width} ${scheme}`;
    const context = await browser.newContext({viewport, colorScheme: scheme, deviceScaleFactor: 1});
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    page.on('request', request => { if (!request.url().startsWith(origin) && !request.url().startsWith('data:')) errors.push(`third-party request ${request.url()}`); });
    const open = async (suffix = '') => { await page.goto(`${origin}${base}${locale}/${suffix}`, {waitUntil: 'load'}); await page.locator('html.reel-ready').waitFor({state: 'attached'}); };
    // What the player in the frame shows: slide number, seconds on its clock, seconds from its scrubber.
    const reel = () => page.evaluate(() => {
      const frame = document.getElementById('player'), inner = frame.contentDocument;
      const clock = inner.getElementById('clock').textContent, [, slide, minutes, seconds] = clock.match(/^(\d+) \/ \d+ · (\d+):(\d+)/);
      return {slide: Number(slide), clock: Number(minutes) * 60 + Number(seconds), time: inner.getElementById('scrub').value / 1000 * frame.contentWindow.__deck.total,
        starts: frame.contentWindow.__deck.slides.map(item => item.start + item.trd), marked: frame.dataset.slide,
        playing: [...document.querySelectorAll('.method.is-playing')].map(item => item.dataset.chapter)};
    });
    const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - innerWidth);

    await open();
    assert.equal(await page.locator('html').getAttribute('data-theme'), scheme, `${where}: theme follows the device`);
    assert(await overflow() <= 0, `${where}: horizontal page scroll ${await overflow()} px`);
    assert.deepEqual(await page.evaluate(() => [...document.querySelectorAll('section[id], div.methods[id]')].map(item => item.id)), ['reel', 'methods', ...sections.slice(1)], `${where}: sections`);
    assert(await page.evaluate(() => document.fonts.check('900 40px Archivo')), `${where}: the self-hosted font is loaded`);

    // The reel plays in the frame and fills it.
    const before = await reel();
    await page.waitForTimeout(1300);
    const after = await reel();
    assert(after.time > before.time + 0.8, `${where}: the reel does not advance (${before.time} to ${after.time})`);
    const fit = await page.evaluate(() => {
      const frame = document.getElementById('player'), stage = frame.contentDocument.getElementById('stage').getBoundingClientRect(), box = frame.getBoundingClientRect();
      return {frame: [box.width, box.height], stage: [stage.width, stage.height]};
    });
    assert(Math.abs(fit.stage[0] - fit.frame[0]) < 1.5 && Math.abs(fit.stage[1] + 34 - fit.frame[1]) < 1.5, `${where}: player ${fit.stage} in frame ${fit.frame}`);

    // Each cue jumps the player to the first slide of its method, marks it and writes it in the address.
    for (const chapter of chapters) {
      await page.locator(`#m-${chapter.id} .cue`).click();
      const now = await reel(), start = now.starts[chapter.slides[0] - 1];
      assert.equal(now.slide, chapter.slides[0], `${where}: ${chapter.id} shows slide ${now.slide}`);
      assert(now.time >= start - 0.07 && now.time < start + 0.9, `${where}: ${chapter.id} at ${now.time}s, start ${start}s`);
      assert.equal(now.clock, Math.floor(now.time), `${where}: ${chapter.id} clock`);
      assert.deepEqual(now.playing, [chapter.id], `${where}: ${chapter.id} marked`);
      assert.equal(now.marked, String(chapter.slides[0]));
      assert.equal(new URL(page.url()).searchParams.get('m'), chapter.id, `${where}: ${chapter.id} in the address`);
      // The page may scroll smoothly to bring the reel into view.
      await page.waitForFunction(height => { const box = document.querySelector('.screen').getBoundingClientRect(); return box.top >= 51 && box.bottom <= height + 1; }, viewport.height, {timeout: 3000})
        .catch(async () => { const box = await page.locator('.screen').boundingBox(); throw new Error(`${where}: the reel is not on screen after the ${chapter.id} cue (${Math.round(box.y)} to ${Math.round(box.y + box.height)})`); });
    }
    // Slide 15 belongs to no method.
    await page.evaluate(() => { const deck = document.getElementById('player').contentWindow.__deck; deck.pause(); deck.seek(deck.slides[14].start + deck.slides[14].trd); });
    await page.waitForFunction(() => document.getElementById('player').dataset.slide === '15');
    assert.deepEqual((await reel()).playing, [], `${where}: slide 15`);

    // A reload returns to the chosen method.
    await open('?m=cuts');
    const reloaded = await reel();
    assert.equal(reloaded.slide, 6, `${where}: reload at ?m=cuts shows slide ${reloaded.slide}`);
    assert.deepEqual(reloaded.playing, ['cuts']);

    // A language change keeps the method and the item being read.
    const other = locales[(locales.indexOf(locale) + 1) % locales.length];
    for (const target of ['w-smoke', 'm-layout', 'status']) {
      await open('?m=cuts');
      await page.evaluate(id => document.getElementById(id).scrollIntoView({block: 'start', behavior: 'instant'}), target);
      await page.waitForTimeout(80);
      await page.locator(`.languages a[data-language="${other}"]`).click();
      await page.waitForURL(url => url.pathname === `${base}${other}/`);
      await page.locator('html.reel-ready').waitFor({state: 'attached'});
      const landed = new URL(page.url());
      assert.equal(landed.hash, `#${target}`, `${where}: language change from ${target} lands on ${landed.hash}`);
      assert.equal(landed.searchParams.get('m'), 'cuts', `${where}: language change keeps the method`);
      assert.equal(await page.locator('html').getAttribute('data-locale'), other);
      await page.waitForFunction(id => { const box = document.getElementById(id).getBoundingClientRect(); return box.top >= 52 && box.top < innerHeight * 0.6; }, target, {timeout: 4000}).catch(() => { throw new Error(`${where}: ${target} is not in view after the language change`); });
      assert.equal((await reel()).slide, 6);
    }
    // At the top of the page no anchor is added.
    await open();
    await page.locator(`.languages a[data-language="${other}"]`).click();
    await page.waitForURL(url => url.pathname === `${base}${other}/`);
    assert.equal(new URL(page.url()).hash, '', `${where}: language change at the top adds no anchor`);

    // Theme button: label, switch, kept after a reload and in the other languages.
    await open();
    const opposite = scheme === 'dark' ? 'light' : 'dark';
    const button = page.locator('#theme-toggle');
    assert.equal(await button.textContent(), labels[locale][opposite], `${where}: theme label`);
    await button.click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), opposite);
    assert.equal(await button.textContent(), labels[locale][scheme]);
    await open();
    assert.equal(await page.locator('html').getAttribute('data-theme'), opposite, `${where}: theme kept after a reload`);
    assert(await overflow() <= 0, `${where}: horizontal page scroll in ${opposite}`);
    await button.click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), scheme);

    // Return link, external links, downloads.
    assert.equal(await page.locator('[data-guide-home]').getAttribute('href'), `/guides/${locale}/`);
    const outside = await page.locator('a[href^="http"]').evaluateAll(items => items.map(item => ({href: item.getAttribute('href'), rel: item.rel, target: item.target})));
    assert.deepEqual([...new Set(outside.map(item => item.href))].sort(), Object.values(links).sort(), `${where}: external links`);
    for (const item of outside) assert(item.rel.split(' ').includes('noopener') && item.target === '_blank', `${where}: ${item.href} needs rel="noopener"`);
    const downloads = await page.locator('.files a').evaluateAll(items => items.map(item => item.getAttribute('href')));
    assert.deepEqual(downloads, [locale, ...locales.filter(item => item !== locale)].flatMap(version => fileKinds.map(kind => `${base}files/deck-methods-${version}${kind.suffix}`)), `${where}: downloads, own language first`);
    for (const href of downloads) {
      const response = await page.request.get(origin + href);
      const local = process.env.GUIDE_URL ? null : (await stat(join(publicRoot, href))).size;
      assert.equal(response.status(), 200, href);
      const length = (await response.body()).length;
      assert(length > 1e6 && (local === null || length === local), `${where}: ${href} is ${length} bytes`);
    }
    // Tables read as cards at 390 px and as tables at 1280 px; no cell is wider than the page.
    const tables = await page.locator('table').evaluateAll(items => items.map(item => ({rows: item.tBodies[0].rows.length, display: getComputedStyle(item).display, right: Math.max(...[...item.querySelectorAll('th,td')].map(cell => cell.getBoundingClientRect().right))})));
    assert.deepEqual(tables.map(item => item.rows), [works.length, 4, 8], `${where}: table rows`);
    for (const item of tables) { assert.equal(item.display, viewport.width < 820 ? 'block' : 'table'); assert(item.right <= viewport.width + 0.5, `${where}: a table cell ends at ${item.right}px`); }

    if (out) {
      // Hold the reel on one frame so that the screenshots can be compared.
      await page.evaluate(() => { const deck = document.getElementById('player').contentWindow.__deck; deck.pause(); deck.seek(9); });
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({path: `${out}/${locale}-${viewport.width}-${scheme}.png`, fullPage: true});
      await page.screenshot({path: `${out}/${locale}-${viewport.width}-${scheme}-top.png`});
    }
    assert.deepEqual(errors, [], `${where}: ${errors.join('; ')}`);
    await context.close();
    report.push(where);
  }

  // Reduced motion: the reel waits; a cue still plays it.
  {
    const context = await browser.newContext({viewport: sizes[1], reducedMotion: 'reduce'});
    const page = await context.newPage();
    await page.goto(`${origin}${base}en/`, {waitUntil: 'load'});
    await page.locator('html.reel-ready').waitFor({state: 'attached'});
    const time = () => page.evaluate(() => { const frame = document.getElementById('player'); return frame.contentDocument.getElementById('scrub').value / 1000 * frame.contentWindow.__deck.total; });
    const first = await time();
    await page.waitForTimeout(700);
    assert.equal(await time(), first, 'reduced motion: the reel must wait');
    await page.locator('#m-kinetic .cue').click();
    await page.waitForTimeout(700);
    assert(await time() > 5.6, 'reduced motion: a cue plays the reel');
    await context.close();
  }
  // Without scripts: the page reads in full, the reel is in the frame, the inert buttons are hidden.
  {
    const context = await browser.newContext({viewport: sizes[0], javaScriptEnabled: false});
    const page = await context.newPage();
    await page.goto(`${origin}${base}fr/`, {waitUntil: 'load'});
    assert.equal(await page.locator('.cue:visible').count(), 0);
    assert.equal(await page.locator('.method').count(), chapters.length);
    assert.equal(await page.locator('#player').getAttribute('src'), `${base}demo/fr/index.html`);
    await context.close();
  }
  // The address without a language goes to English, or to ?lang=, and keeps the rest.
  {
    const context = await browser.newContext({viewport: sizes[1]});
    const page = await context.newPage();
    for (const [suffix, expected] of [['', 'en/'], ['?lang=zh', 'zh/'], ['?lang=fr&m=crop#works', 'fr/?m=crop#works']]) {
      await page.goto(`${origin}${base}${suffix}`, {waitUntil: 'load'});
      await page.waitForURL(`${origin}${base}${expected}`);
    }
    await context.close();
  }
} finally {
  await browser.close();
  if (server) await new Promise(done => server.close(done));
}
console.log(`PASS ${report.length} runs (${locales.join(', ')} × 390 and 1280 px × light and dark): no horizontal scroll; the reel plays; ${chapters.length} cues reach their slides; reload and language change keep the method and the place; theme; ${Object.keys(links).length} external links with rel="noopener"; ${locales.length * fileKinds.length} downloads; reduced motion; no scripts; entry redirect.`);
