// Browser checks for /guides/rex-pitch/ in Chinese, English and French, at 360 px and 1440 px, light and dark.
//   GUIDE_PLAYWRIGHT_MODULE=<playwright module> node resources/rex-pitch/browser-check.mjs
// Serves public/ on a free local port unless GUIDE_URL names a running site. GUIDE_ARTIFACTS=<folder> keeps screenshots.
// The repository has no Playwright of its own. On the Mac, point GUIDE_PLAYWRIGHT_MODULE at a small module that re-exports an
// installed Playwright's `chromium` with `executablePath` set to the cached headless Chromium, because the Chromium build a
// project's Playwright asks for is often not the one in ~/Library/Caches/ms-playwright (see /guides/deck-methods/ notes).
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdir, readFile, stat} from 'node:fs/promises';
import {extname, join, normalize} from 'node:path';
import {fileURLToPath} from 'node:url';
import {base, demo, demoQuery, downloads, hreflang, links, locales, slideCount} from './content.mjs';
import {readChineseDraft, readScript} from './build.mjs';
const {chromium} = await import(process.env.GUIDE_PLAYWRIGHT_MODULE || 'playwright');

const publicRoot = fileURLToPath(new URL('../../public', import.meta.url));
const types = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.pdf': 'application/pdf', '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'};
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

const script = await readScript(), draft = await readChineseDraft();
const clicks = script.flatMap(slide => slide.lines).filter(line => line.click).length;
const player = `${base}${demo}${demoQuery}`;
const sizes = [{width: 360, height: 780}, {width: 1440, height: 900}];
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
    const open = async () => {
      await page.goto(`${origin}${base}${locale}/`, {waitUntil: 'load'});
      await page.waitForFunction(() => { try { return !!document.getElementById('player').contentDocument.getElementById('clock'); } catch { return false; } });
    };
    const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    const clock = () => page.evaluate(() => document.getElementById('player').contentDocument.getElementById('clock').textContent);
    // The player loads paused (autoplay=0) and later plays straight through: wait until its clock (whole seconds) holds for 1.5 s.
    const settled = async () => {
      let last = await clock(), since = Date.now();
      for (let tries = 0; tries < 80; tries++) {
        await page.waitForTimeout(250);
        const now = await clock();
        if (now !== last) { last = now; since = Date.now(); } else if (Date.now() - since >= 1500) return now;
      }
      throw new Error(`${where}: the player clock never settles (${last})`);
    };
    const advances = async (before, what) => {
      await page.waitForFunction(text => document.getElementById('player').contentDocument.getElementById('clock').textContent !== text, before, {timeout: 4000})
        .catch(() => { throw new Error(`${where}: ${what} does not reach the player (clock stays at ${before})`); });
    };

    await open();
    assert.equal(await page.locator('html').getAttribute('data-theme'), scheme, `${where}: theme follows the device`);
    assert(await overflow() <= 0, `${where}: horizontal page scroll ${await overflow()} px`);
    assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex,follow', `${where}: robots`);
    assert(await page.evaluate(() => document.fonts.check('800 40px Archivo')), `${where}: the self-hosted font is loaded`);
    const expected = ['stage', 'deck', 'downloads', 'script', 'full', ...(locale === 'en' ? [] : ['aid']), 'versions', 'sources'];
    assert.deepEqual(await page.evaluate(() => [...document.querySelectorAll('main > section')].map(item => item.id)), expected, `${where}: sections`);

    // Language switch, alternates, return link.
    const switcher = await page.locator('.languages a').evaluateAll(items => items.map(item => ({lang: item.dataset.language, href: item.getAttribute('href'), current: item.getAttribute('aria-current')})));
    assert.deepEqual(switcher, locales.map(other => ({lang: other, href: `${base}${other}/`, current: other === locale ? 'page' : null})), `${where}: language links`);
    for (const other of locales) assert.equal(await page.locator(`link[rel="alternate"][hreflang="${hreflang[other]}"]`).getAttribute('href'), `https://zhaoyang.fr${base}${other}/`, `${where}: ${other} alternate`);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), `https://zhaoyang.fr${base}${locale}/`);
    assert.equal(await page.locator('[data-guide-home]').getAttribute('href'), `/guides/${locale}/`, `${where}: return link`);

    // The player: in the frame, 16:9 plus its control bar, the same address in the new-tab link.
    const frame = page.locator('#player');
    assert.equal(await frame.getAttribute('src'), player, `${where}: player address`);
    assert.equal(await page.locator('.newtab').getAttribute('href'), player);
    const box = await frame.boundingBox();
    assert(Math.abs(box.height - (box.width * 9 / 16 + 34)) < 1.5, `${where}: player ${box.width} x ${box.height}`);
    assert(box.x >= 0 && box.x + box.width <= viewport.width + 0.5, `${where}: player outside the page`);
    // The player's own 16:9 stage fills the frame's width, with its 34 px control bar under it (deckkit layout).
    const stage = await page.evaluate(() => { const item = document.getElementById('player').contentDocument.getElementById('stage').getBoundingClientRect(); return [item.width, item.height]; });
    assert(Math.abs(stage[0] - box.width) < 1.5 && Math.abs(stage[1] + 34 - box.height) < 1.5, `${where}: player stage ${stage} in frame ${box.width} x ${box.height}`);
    assert(await page.locator('#fullscreen').isVisible(), `${where}: full screen button`);

    // Downloads: every link is a file on disk, served whole; the page's size is the file's size.
    const files = await page.locator('a[download]').evaluateAll(items => items.map(item => item.getAttribute('href')));
    assert.deepEqual([...new Set(files)].sort(), downloads.map(item => `${base}files/${item.file}`).sort(), `${where}: download links`);
    for (const href of new Set(files)) {
      const local = (await stat(join(publicRoot, href))).size;
      const response = await page.request.get(origin + href);
      assert.equal(response.status(), 200, href);
      if (!process.env.GUIDE_URL) assert.equal((await response.body()).length, local, `${where}: ${href} served whole`);
    }
    assert.equal(await page.locator('.files li').count(), downloads.length);

    // Script: ten slides, the English lines exactly as in SCRIPT-FINAL.md, one marker per click, every picture loaded.
    assert.equal(await page.locator('.slide').count(), slideCount, `${where}: slides`);
    const lines = await page.locator('.slide').evaluateAll(items => items.map(item => [...item.querySelectorAll('.line')].map(line => ({click: !!line.querySelector('.click'), text: [...line.childNodes].filter(node => node.nodeType === 3).map(node => node.textContent).join('')}))));
    assert.deepEqual(lines, script.map(slide => slide.lines), `${where}: script lines differ from SCRIPT-FINAL.md`);
    assert.equal(await page.locator('.slide .click').count(), clicks, `${where}: click markers`);
    for (let index = 0; index < slideCount; index++) {
      const image = page.locator('.slide img').nth(index);
      await image.scrollIntoViewIfNeeded();
      await page.waitForFunction(i => { const item = document.querySelectorAll('.slide img')[i]; return item.complete && item.naturalWidth > 0; }, index, {timeout: 4000})
        .catch(() => { throw new Error(`${where}: slide picture ${index + 1} does not load`); });
    }
    // Narrow: picture above the lines. Wide: picture beside them.
    const layout = await page.locator('.slide').first().evaluate(item => { const pic = item.querySelector('img').getBoundingClientRect(), text = item.querySelector('.lines').getBoundingClientRect(); return {picRight: pic.right, picBottom: pic.bottom, textLeft: text.left, textTop: text.top}; });
    if (viewport.width < 900) assert(layout.picBottom <= layout.textTop + 0.5, `${where}: the picture must sit above the lines`);
    else assert(layout.picRight <= layout.textLeft + 0.5, `${where}: the picture must sit beside the lines`);

    // Reading aid: the Chinese draft as written on the Chinese page, the French translation on the French page.
    if (locale === 'zh') assert.deepEqual(await page.locator('#aid .draft p').evaluateAll(items => items.map(item => item.textContent)), draft.map(line => line.replace(/\*\*/g, '')), `${where}: Chinese draft`);
    if (locale === 'fr') assert.equal(await page.locator('#aid .translation li').count(), slideCount, `${where}: translation`);

    // Sources: the France Num report, opened in a new tab.
    const outside = await page.locator('a[href^="http"]').evaluateAll(items => items.map(item => ({href: item.getAttribute('href'), rel: item.rel, target: item.target})));
    assert.deepEqual([...new Set(outside.map(item => item.href))], Object.values(links), `${where}: external links`);
    for (const item of outside) assert(item.rel.split(' ').includes('noopener') && item.target === '_blank', `${where}: ${item.href} needs rel="noopener"`);
    assert(await overflow() <= 0, `${where}: horizontal page scroll after loading the pictures`);

    // Full screen: the frame fills the screen and takes the keyboard; keys pressed on the page are passed on; leaving gives focus back.
    if (scheme === 'light') {
      await page.locator('#deck').scrollIntoViewIfNeeded();
      let before = await settled();
      await page.locator('#fullscreen').click();
      await page.waitForFunction(() => document.fullscreenElement === document.getElementById('player'), null, {timeout: 3000}).catch(() => { throw new Error(`${where}: the player does not go full screen`); });
      await page.waitForFunction(() => document.activeElement === document.getElementById('player'), null, {timeout: 2000}).catch(() => { throw new Error(`${where}: the player does not take the keyboard in full screen`); });
      const filled = await page.evaluate(() => { const item = document.getElementById('player').getBoundingClientRect(); return [item.width, item.height, innerWidth, innerHeight]; });
      assert(filled[0] === filled[2] && filled[1] === filled[3], `${where}: full-screen frame ${filled}`);
      await page.keyboard.press('ArrowRight');
      await advances(before, 'ArrowRight in full screen');
      before = await settled();
      await page.evaluate(() => document.activeElement.blur());
      await page.keyboard.press('Space');
      await advances(before, 'Space pressed on the page in full screen');
      await page.evaluate(() => document.exitFullscreen());
      await page.waitForFunction(() => !document.fullscreenElement && document.activeElement === document.getElementById('fullscreen'), null, {timeout: 3000}).catch(() => { throw new Error(`${where}: leaving full screen does not return focus to the button`); });
      assert(await overflow() <= 0, `${where}: horizontal page scroll after full screen`);
    }

    // Language change keeps the slide being read.
    if (scheme === 'light') {
      const other = locales[(locales.indexOf(locale) + 1) % locales.length];
      await open();
      await page.evaluate(() => document.getElementById('s-7').scrollIntoView({block: 'start', behavior: 'instant'}));
      await page.waitForTimeout(80);
      await page.locator(`.languages a[data-language="${other}"]`).click();
      await page.waitForURL(url => url.pathname === `${base}${other}/`);
      assert.equal(new URL(page.url()).hash, '#s-7', `${where}: language change from slide 7 lands on ${new URL(page.url()).hash}`);
    }

    // Theme button: label, switch, kept after a reload.
    await open();
    const opposite = scheme === 'dark' ? 'light' : 'dark';
    const button = page.locator('#theme-toggle');
    assert.equal(await button.textContent(), labels[locale][opposite], `${where}: theme label`);
    await button.click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), opposite);
    await open();
    assert.equal(await page.locator('html').getAttribute('data-theme'), opposite, `${where}: theme kept after a reload`);
    assert(await overflow() <= 0, `${where}: horizontal page scroll in ${opposite}`);
    await page.locator('#theme-toggle').click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), scheme);

    if (out) {
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({path: `${out}/${locale}-${viewport.width}-${scheme}.png`, fullPage: true});
      await page.screenshot({path: `${out}/${locale}-${viewport.width}-${scheme}-top.png`});
    }
    assert.deepEqual(errors, [], `${where}: ${errors.join('; ')}`);
    await context.close();
    report.push(where);
  }

  // Without scripts: the page reads in full, the player is in the frame, the full screen button stays hidden, the new-tab link works.
  {
    const context = await browser.newContext({viewport: sizes[0], javaScriptEnabled: false});
    const page = await context.newPage();
    await page.goto(`${origin}${base}fr/`, {waitUntil: 'load'});
    assert.equal(await page.locator('#fullscreen:visible').count(), 0);
    assert.equal(await page.locator('.newtab').isVisible(), true);
    assert.equal(await page.locator('#player').getAttribute('src'), player);
    assert.equal(await page.locator('.slide').count(), slideCount);
    await context.close();
  }
  // The player page itself stays out of search results.
  {
    const context = await browser.newContext({viewport: sizes[1]});
    const page = await context.newPage();
    await page.goto(`${origin}${player}`, {waitUntil: 'load'});
    assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex', 'player page: noindex');
    // The address without a language goes to English, or to ?lang=, and keeps the rest.
    for (const [suffix, target] of [['', 'en/'], ['?lang=zh', 'zh/'], ['?lang=fr#script', 'fr/#script']]) {
      await page.goto(`${origin}${base}${suffix}`, {waitUntil: 'load'});
      await page.waitForURL(`${origin}${base}${target}`);
    }
    // The guides index links to the page in each language.
    for (const locale of locales) {
      await page.goto(`${origin}/guides/${locale}/`, {waitUntil: 'load'});
      assert.equal(await page.locator(`a.card[href="${base}${locale}/"]`).count(), 1, `guides index ${locale}: card`);
      assert.equal(await page.locator('a.card').count(), Number(await page.locator('.stat strong').first().textContent()), `guides index ${locale}: page count`);
    }
    await context.close();
  }
} finally {
  await browser.close();
  if (server) await new Promise(done => server.close(done));
}
console.log(`PASS ${report.length} runs (${locales.join(', ')} × 360 and 1440 px × light and dark): no horizontal scroll; player in the frame at 16:9; full screen takes the keyboard and hands it back; ${downloads.length} downloads served from disk; ${slideCount} slides with the script as written and ${clicks} click markers; reading aids; language links and alternates; theme; no console errors or third-party requests; no scripts; player noindex; entry redirect; guides index cards.`);
