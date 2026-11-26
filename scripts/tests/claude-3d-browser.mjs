// Browser checks for the Claude 3D guide in Chinese, English and French.
//   GUIDE_PLAYWRIGHT_MODULE=<playwright module> node scripts/tests/claude-3d-browser.mjs
// Serves public/ on a free local port unless GUIDE_URL names a running site. GUIDE_ARTIFACTS=<folder> keeps screenshots.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdir, readFile, stat} from 'node:fs/promises';
import {extname, join, normalize} from 'node:path';
import {fileURLToPath} from 'node:url';
const {chromium} = await import(process.env.GUIDE_PLAYWRIGHT_MODULE || 'playwright');

const publicRoot = fileURLToPath(new URL('../../public', import.meta.url));
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.txt':'text/plain; charset=utf-8','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.mp4':'video/mp4'};
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
    response.end(body);
  } catch { response.writeHead(404, {'content-type': 'text/plain'}); response.end('not found'); }
});
if (server) await new Promise(done => server.listen(0, '127.0.0.1', done));
const origin = process.env.GUIDE_URL || `http://127.0.0.1:${server.address().port}`;
const base = '/guides/claude-3d/';
const out = process.env.GUIDE_ARTIFACTS;
if (out) await mkdir(out, {recursive: true});

const locales = ['zh', 'en', 'fr'];
const slugs = ['', 'tools/', 'cases/', 'estimate/', 'handbook/'];
const pageName = slug => slug.replace('/', '') || 'home';
const chinese = /[⺀-⿟　-ヿ㐀-䶿一-鿿豈-﫿＀-￯]/u;
// What a reader sees in each language. \u00a0 and \u202f are the French non-breaking spaces.
const expected = {
  zh: {
    lang: 'zh-CN', nav: ['制作路线', '工具比较', '案例库', '用量估算', '项目手册'], hub: '攻略总览',
    dark: '深色', light: '浅色', toLight: '切换为浅色模式', toDark: '切换为深色模式', advice: /^录制原始界面.*。在本机逐帧导出一段/,
    compare: '对比 Remotion', remove: '移除 Remotion', found: '显示 4 项工具', chosen: '已选 3 项，共可选三项。', rows: ['用途', '使用限制', '搭配方式'],
    render: '480 帧，约 80 分钟', decimal: '375 帧，约 46.25 分钟', single: '1 帧，约 1 分钟', large: '108,000 帧，约 180,000 分钟',
    quota: '约占该额度窗口的 20%', cost: '2.25 美元', invalid: '请填写有效的每帧耗时（秒）。',
    brief: '项目内容：', file: 'claude-3d-项目提示词.txt', prompt: 'developer-kit-prompt.txt', copied: '已复制提示词。'
  },
  en: {
    lang: 'en', nav: ['Routes', 'Tools', 'Examples', 'Estimates', 'Handbook'], hub: 'All guides',
    dark: 'Dark', light: 'Light', toLight: 'Switch to light mode', toDark: 'Switch to dark mode', advice: /^Record the original interface.*\. Export a section frame by frame/,
    compare: 'Compare Remotion', remove: 'Remove Remotion', found: '4 tools shown', chosen: '3 of three selected.', rows: ['Use', 'Limits', 'Setup'],
    render: '480 frames, about 80 minutes', decimal: '375 frames, about 46.25 minutes', single: '1 frame, about 1 minute', large: '108,000 frames, about 180,000 minutes',
    quota: 'About 20% of that limit window', cost: '$2.25', invalid: 'Time per frame (seconds): enter a valid number.',
    brief: 'Project: ', file: 'claude-3d-project-prompt.txt', prompt: 'developer-kit-prompt.en.txt', copied: 'Prompt copied.'
  },
  fr: {
    lang: 'fr', nav: ['Méthodes', 'Outils', 'Exemples', 'Estimations', 'Manuel'], hub: 'Tous les guides',
    dark: 'Sombre', light: 'Clair', toLight: 'Passer au mode clair', toDark: 'Passer au mode sombre', advice: /^Enregistrez l’interface d’origine.*\. Exportez un passage image par image/,
    compare: 'Comparer Remotion', remove: 'Retirer Remotion', found: '4\u00a0outils affichés', chosen: '3\u00a0outils sélectionnés sur trois.', rows: ['Usage', 'Limites', 'Mise en œuvre'],
    render: '480\u00a0images, environ 80\u00a0minutes', decimal: '375\u00a0images, environ 46,25\u00a0minutes', single: '1\u00a0image, environ 1\u00a0minute', large: '108\u202f000\u00a0images, environ 180\u202f000\u00a0minutes',
    quota: 'Environ 20\u00a0% de cette fenêtre de limite', cost: '2,25\u00a0$', invalid: 'Temps par image (secondes)\u00a0: saisissez un nombre valide.',
    brief: 'Projet\u00a0: ', file: 'claude-3d-prompt-projet.txt', prompt: 'developer-kit-prompt.fr.txt', copied: 'Prompt copié.'
  }
};

const browser = await chromium.launch({channel: 'chrome', headless: true});
try {
  const context = await browser.newContext({viewport: {width: 1280, height: 900}, colorScheme: 'light', permissions: ['clipboard-read', 'clipboard-write']});
  const p = await context.newPage();
  const errors = [];
  p.on('pageerror', error => errors.push(error.message));
  p.on('response', response => { if (response.url().startsWith(origin) && response.status() >= 400) errors.push(response.url() + ' ' + response.status()); });
  const byId = id => p.locator('#' + id);
  const ready = () => p.locator('html.enhanced').waitFor({state: 'attached'});
  const open = async address => { const response = await p.goto(origin + address, {waitUntil: 'domcontentloaded'}); await ready(); return response; };
  const address = () => { const url = new URL(p.url()); return url.pathname + url.search + url.hash; };
  const shot = async name => { if (out) await p.screenshot({path: `${out}/${name}.png`, animations: 'disabled'}); };
  const overflow = () => p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  async function switchTo(locale, slug) {
    const before = new URL(p.url());
    await p.locator(`.languages a[data-language="${locale}"]`).click();
    await p.waitForURL(url => url.pathname === `${base}${locale}/${slug}`);
    await ready();
    const after = new URL(p.url());
    assert.equal(after.search, before.search, `query kept from ${before.pathname} to ${locale}`);
    assert.equal(after.hash, before.hash, `section kept from ${before.pathname} to ${locale}`);
    assert.equal(await p.locator('html').getAttribute('lang'), expected[locale].lang);
  }

  // Every page of every language on a desktop screen.
  for (const locale of locales) for (const [index, slug] of slugs.entries()) {
    const response = await open(`${base}${locale}/${slug}`);
    assert.equal(response.status(), 200);
    assert.equal(await p.locator('html').getAttribute('lang'), expected[locale].lang);
    assert.equal(await p.evaluate(() => document.compatMode), 'CSS1Compat');
    assert(await overflow() < 2, `${locale}/${slug} overflows at 1280`);
    assert.deepEqual(await p.locator('.main-nav a').allInnerTexts(), expected[locale].nav);
    assert.equal(await p.locator('.main-nav a[aria-current="page"]').innerText(), expected[locale].nav[index]);
    assert.equal(await byId('all-guides').innerText(), expected[locale].hub);
    assert.equal(await byId('all-guides').getAttribute('href'), `/guides/${locale}/`);
    assert.equal(await p.locator('.languages a[aria-current="page"]').getAttribute('data-language'), locale);
    assert.equal((await p.locator('.mast').boundingBox()).height < 80, true, `${locale}/${slug}: one-row header at 1280`);
    if (locale !== 'zh') {
      const visible = (await p.locator('body').innerText()).replaceAll('中文', '');
      assert(!chinese.test(visible), `${locale}/${slug}: ${visible.match(new RegExp(`.{0,20}${chinese.source}.{0,20}`, 'u'))?.[0]}`);
    }
    if (slug === '') await byId('study').evaluate(image => image.decode());
    await shot(`${locale}-${pageName(slug)}-1280`);
  }

  // The guide index opens the guide in its own language, and the guide returns to that index.
  for (const locale of locales) {
    await p.goto(`${origin}/guides/${locale}/`, {waitUntil: 'domcontentloaded'});
    await p.locator('a.card[href*="/guides/claude-3d/"]').click();
    await p.waitForURL(url => url.pathname === `${base}${locale}/`);
    await ready();
    await byId('all-guides').click();
    await p.waitForURL(`${origin}/guides/${locale}/`);
  }

  // Addresses from before the guide had languages.
  for (const [from, to] of [
    [base, `${base}en/`], [`${base}?from=zh`, `${base}zh/`], [`${base}?from=fr`, `${base}fr/`], [`${base}?lang=zh`, `${base}zh/`],
    [`${base}tools/?from=fr&category=code`, `${base}fr/tools/?category=code`], [`${base}cases/?from=zh#studio`, `${base}zh/cases/#studio`],
    [`${base}estimate/`, `${base}en/estimate/`], [`${base}handbook/?lang=fr#sources`, `${base}fr/handbook/#sources`]
  ]) {
    await p.goto(origin + from, {waitUntil: 'domcontentloaded'});
    await p.waitForURL(url => url.pathname.startsWith(new URL(to, origin).pathname));
    await ready();
    assert.equal(address(), to, from);
  }
  await open(`${base}fr/tools/?category=code`);
  assert.equal(await p.locator('[data-tool]:visible').count(), 4);

  const results = {};
  for (const locale of locales) {
    const t = expected[locale], home = `${base}${locale}/`;
    const record = results[locale] = {};

    // Cover: render views, routes and the adviser.
    await open(home);
    for (const view of ['clay', 'detail', 'studio']) {
      await p.locator(`[data-view="${view}"]`).click();
      await byId('study').evaluate(image => image.decode());
      assert((await byId('study').getAttribute('src')).endsWith(view + '.webp'));
      const alt = await byId('study').getAttribute('alt');
      assert(alt && (locale === 'zh') === chinese.test(alt), `${locale}: image description ${alt}`);
    }
    await p.locator('[data-route="code"]').click();
    assert(await byId('route-code').isVisible());
    await p.locator('[data-route="video"]').click();
    await p.goBack();
    assert(await byId('route-code').isVisible());
    await p.locator('.adviser summary').click();
    await byId('subject').selectOption('ui');
    assert.match(await byId('advice').innerText(), t.advice);
    // Switching language keeps the chosen route.
    for (const other of locales.filter(item => item !== locale)) {
      await switchTo(other, '');
      assert.equal(new URL(p.url()).hash, '#route-code');
      assert(await byId('route-code').isVisible() && !await byId('route-native').isVisible());
      await switchTo(locale, '');
    }

    // Tools: filter, search, comparison, and the same view in the other languages.
    await byId('route-code').locator('a').click();
    await p.waitForURL(url => url.pathname === `${home}tools/`);
    await ready();
    assert.equal(await byId('category').inputValue(), 'code');
    assert.equal(await p.locator('[data-tool]:visible').count(), 4);
    assert.equal(await byId('found').innerText(), t.found);
    await byId('category').selectOption('all');
    await byId('search').fill('zzz-no-such-tool');
    assert(await byId('no-tools').isVisible());
    await byId('reset-filter').click();
    assert.equal(await p.locator('[data-tool]:visible').count(), 22);
    record.search = {};
    for (const query of ['blender', 'remotion', 'ffmpeg', 'three.js', 'claude', 'hdri']) {
      await byId('search').fill(query);
      record.search[query] = await p.locator('[data-tool]:visible').count();
    }
    await byId('search').fill('');
    await p.locator('.compare-choice input').nth(0).check();
    await byId('search').fill('remotion');
    await p.getByRole('checkbox', {name: t.compare, exact: true}).check();
    await byId('search').fill('ffmpeg');
    await p.getByRole('checkbox', {name: t.compare.replace('Remotion', 'FFmpeg'), exact: true}).check();
    await p.reload();
    await ready();
    assert.equal(await p.locator('.compare-choice input:checked').count(), 3);
    assert.equal(await p.locator('.compare-choice input:disabled').count(), 19);
    assert.equal(await byId('compare-hint').innerText(), t.chosen);
    for (const other of [...locales.filter(item => item !== locale), locale]) {
      await switchTo(other, 'tools/');
      assert.equal(await byId('search').inputValue(), 'ffmpeg');
      assert.equal(await p.locator('.compare-choice input:checked').count(), 3);
      assert.equal(await p.locator('#compare-table tbody tr').count(), 3);
    }
    await p.locator('.toolbar a').click();
    assert.match(await byId('compare-table').innerText(), /Blender.*Remotion.*FFmpeg/s);
    assert.deepEqual(await p.locator('#compare-table tbody th').allInnerTexts(), t.rows);
    record.table = await p.locator('#compare-table tr').evaluateAll(rows => rows.map(row => row.children.length));
    assert.deepEqual(record.table, [4, 4, 4, 4]);
    await p.getByRole('button', {name: t.remove, exact: true}).click();
    assert.equal(await p.locator('.compare-choice input:checked').count(), 2);
    await byId('clear').click();
    assert.equal(await p.locator('.compare-choice input:checked').count(), 0);

    // Estimates.
    await open(`${home}estimate/`);
    const figures = async () => Object.fromEntries(await Promise.all(['render', 'quota', 'api'].map(async key => [key, await byId(key + '-result').innerText()])));
    assert.equal((await figures()).render, t.render);
    assert.equal((await figures()).quota, t.quota);
    await byId('inprice').fill('3'); await byId('outprice').fill('15');
    assert.equal((await figures()).api, t.cost);
    await byId('seconds').fill('12.5'); await byId('fps').fill('30'); await byId('per').fill('7.4');
    assert.equal((await figures()).render, t.decimal);
    // The values follow the reader into the other languages.
    for (const other of [...locales.filter(item => item !== locale), locale]) {
      await switchTo(other, 'estimate/');
      assert.equal(await byId('per').inputValue(), '7.4');
      assert.equal((await figures()).render, expected[other].decimal);
      assert.equal((await figures()).api, expected[other].cost);
    }
    await byId('seconds').fill('1'); await byId('fps').fill('1'); await byId('per').fill('60');
    assert.equal((await figures()).render, t.single);
    await byId('seconds').fill('3600'); await byId('fps').fill('30'); await byId('per').fill('100');
    assert.equal((await figures()).render, t.large);
    await byId('per').fill('0');
    assert.equal(await byId('render-result').getAttribute('data-invalid'), 'true');
    assert.equal((await figures()).render, t.invalid);
    await byId('tested').fill('0');
    assert.equal(await byId('quota-result').getAttribute('data-invalid'), 'true');
    // The same inputs give the same numbers whatever the language.
    await open(`${home}estimate/?seconds=47&fps=25&per=3.7&percent=6.5&tested=3&shots=11&input=1234567&output=89012&inprice=2.5&outprice=12.5`);
    record.figures = Object.values(await figures()).map(text => {
      const plain = text.replace(/[\u00a0\u202f]/g, ' ');
      const numbers = locale === 'fr' ? plain.replace(/(\d) (?=\d{3})/g, '$1').replaceAll(',', '.') : plain.replace(/(\d),(?=\d{3})/g, '$1');
      return numbers.match(/\d+(?:\.\d+)?/g).map(Number);
    });

    // Examples: filter, video, downloadable Blender file.
    await open(`${home}cases/`);
    assert.equal(await p.locator('[data-case]:visible').count(), 14);
    await byId('case-type').selectOption('film');
    assert.equal(await p.locator('[data-case]:visible').count(), 3);
    for (const other of [...locales.filter(item => item !== locale), locale]) {
      await switchTo(other, 'cases/');
      assert.equal(await byId('case-type').inputValue(), 'film');
      assert.equal(await p.locator('[data-case]:visible').count(), 3);
    }
    const video = await p.locator('video').evaluate(async element => {
      await element.play();
      await new Promise(done => setTimeout(done, 400));
      element.pause();
      return {duration: element.duration, played: element.currentTime, width: element.videoWidth};
    });
    assert.equal(video.duration, 3);
    assert(video.played > 0 && video.width === 720, `${locale}: the sample video plays`);
    const blend = await p.request.get(`${origin}${base}media/twin-66.blend`);
    assert(blend.ok()); assert((await blend.body()).length > 100000);
    assert.equal(await p.locator('.sample a[download]').getAttribute('href'), `${base}media/twin-66.blend`);

    // Handbook: the prompt is in the page's language, with the reader's brief on top.
    await open(`${home}handbook/#prompt`);
    const original = await (await p.request.get(origin + base + t.prompt)).text();
    assert.equal(await p.locator('#prompt + a, #prompt a[download]').last().getAttribute('href'), base + t.prompt);
    assert.equal((locale === 'zh'), chinese.test(original));
    await p.locator('[data-brief]').first().fill('twin-66');
    await byId('copy').click();
    await p.waitForFunction(() => document.getElementById('copy-status').textContent);
    assert.equal(await byId('copy-status').innerText(), t.copied);
    const clip = await p.evaluate(() => navigator.clipboard.readText());
    assert.equal(clip, `${t.brief}twin-66\n\n${original}`);
    const download = p.waitForEvent('download');
    await byId('download').click();
    const file = await download;
    assert.equal(file.suggestedFilename(), t.file);
    assert.equal(await readFile(await file.path(), 'utf8'), clip);
    for (const other of locales.filter(item => item !== locale)) {
      await switchTo(other, 'handbook/');
      assert.equal(new URL(p.url()).hash, '#prompt');
      await switchTo(locale, 'handbook/');
    }

    // Theme: the choice holds on other pages and in other languages, with the label in the page's language.
    assert.equal(await p.locator('html').getAttribute('data-theme'), 'light');
    assert.equal(await byId('theme-label').innerText(), t.dark);
    assert.equal(await byId('theme').getAttribute('aria-label'), t.toDark);
    await byId('theme').click();
    assert.equal(await p.locator('html').getAttribute('data-theme'), 'dark');
    assert.equal(await byId('theme-label').innerText(), t.light);
    assert.equal(await byId('theme').getAttribute('aria-label'), t.toLight);
    for (const slug of slugs) {
      await open(home + slug);
      assert.equal(await p.locator('html').getAttribute('data-theme'), 'dark');
      const colours = await p.evaluate(() => {
        const mean = colour => colour.match(/[\d.]+/g).slice(0, 3).reduce((sum, value) => sum + Number(value), 0) / 3;
        return {paper: mean(getComputedStyle(document.body).backgroundColor), ink: mean(getComputedStyle(document.body).color)};
      });
      assert(colours.paper < 70 && colours.ink > 200, `${locale}/${slug}: dark colours ${JSON.stringify(colours)}`);
    }
    await open(home);
    await byId('study').evaluate(image => image.decode());
    await shot(`${locale}-home-1280-dark`);
    const other = locales[(locales.indexOf(locale) + 1) % 3];
    await switchTo(other, '');
    assert.equal(await p.locator('html').getAttribute('data-theme'), 'dark');
    assert.equal(await byId('theme-label').innerText(), expected[other].light);
    await byId('theme').click();
    assert.equal(await p.locator('html').getAttribute('data-theme'), 'light');
    assert.equal(await byId('theme-label').innerText(), expected[other].dark);
  }
  for (const locale of ['en', 'fr']) {
    assert.deepEqual(results[locale].figures, results.zh.figures, `${locale}: calculator numbers differ from Chinese`);
    assert.deepEqual(results[locale].search, results.zh.search, `${locale}: searches find different tools`);
    assert.deepEqual(results[locale].table, results.zh.table);
  }

  // Phone widths: nothing wider than the screen, navigation and language links in reach.
  for (const width of [390, 320]) {
    await p.setViewportSize({width, height: 844});
    for (const locale of locales) for (const slug of slugs) {
      await open(`${base}${locale}/${slug}`);
      assert(await overflow() < 2, `${locale}/${slug} overflows at ${width}`);
      for (const link of await p.locator('.main-nav a').all()) {
        const box = await link.boundingBox();
        assert(box && box.x >= 0 && box.x + box.width <= width + 1, `${locale}/${slug}: navigation fits at ${width}`);
      }
      assert(await byId('all-guides').isVisible() && await byId('theme').isVisible() && await p.locator('.brand').isVisible());
      assert.equal(await p.locator('.languages a:visible').count(), width === 390 ? 3 : 2);
      const tools = await p.locator('.mast-tools').boundingBox(), brand = await p.locator('.brand').boundingBox();
      assert(Math.abs(tools.y + tools.height / 2 - (brand.y + brand.height / 2)) < 12, `${locale}/${slug}: languages share the first header row at ${width}`);
      if (slug === '') await byId('study').evaluate(image => image.decode());
      if (width === 390) await shot(`${locale}-${pageName(slug)}-390`);
      if (width === 390 && slug === '') {
        // Navigation and language switching by touch-sized targets.
        for (const [next, target] of slugs.entries()) {
          await p.locator('.main-nav a').nth(next).click();
          await p.waitForURL(url => url.pathname === `${base}${locale}/${target}`);
          await ready();
        }
        const other = locales[(locales.indexOf(locale) + 1) % 3];
        await switchTo(other, 'handbook/');
        await byId('all-guides').click();
        await p.waitForURL(`${origin}/guides/${other}/`);
      }
    }
  }
  assert.deepEqual(errors, []);
  console.log(`PASS Claude 3D guide in ${locales.join(', ')}: ${locales.length * slugs.length} pages at 1280, 390 and 320 px; guide index entry and return; former addresses; navigation; language switch keeps page, query and section; cover views, routes, tool filters and comparison; calculators give ${JSON.stringify(results.zh.figures)} in every language; video; downloads; clipboard; theme.`);
} finally {
  await browser.close();
  if (server) await new Promise(done => server.close(done));
}
