// Browser checks for the three language pages of the REX opportunity guide.
//   GUIDE_URL=http://127.0.0.1:4328 GUIDE_PLAYWRIGHT_MODULE=<playwright module> node resources/rex-opportunities/browser-check.mjs
// GUIDE_URL serves the repository's public/ folder. Screenshots go to GUIDE_ARTIFACTS when it is set.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.GUIDE_PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.GUIDE_URL || 'http://127.0.0.1:4328';
const shots = process.env.GUIDE_ARTIFACTS;
const base = `${origin}/guides/rex-opportunities/`;
const languages = ['zh', 'en', 'fr'];
const cjk = /[⺀-〿぀-ヿ㈀-㏿㐀-鿿豈-﫿︰-﹏＀-￯]/u;
if (shots) await mkdir(shots, { recursive: true });

const browser = await chromium.launch({ headless: true });
const checks = [], errors = [];
const ok = (name, value, detail = '') => { assert(value, `${name} ${detail}`); checks.push(name); };
async function open(context, path) {
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(`${path}: ${error.message}`));
  page.on('response', response => { if (response.url().startsWith(origin) && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.goto(base + path, { waitUntil: 'load' });
  await page.locator('#filters').waitFor({ state: 'visible' });
  return page;
}
const visible = page => page.evaluate(() => [...document.querySelectorAll('#event-list .event')].filter(e => !e.hidden).map(e => e.id));
const overflow = page => page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
const setField = (page, id, value) => page.evaluate(([id, value]) => { const field = document.getElementById(id); field.value = value; field.dispatchEvent(new Event('input', { bubbles: true })); }, [id, value]);
// `inPlace` activates the link without the automation's own scroll-into-view, as a reader's click would.
const switchTo = async (page, lang, { inPlace = false } = {}) => {
  const link = page.locator(`.languages a[data-language="${lang}"]`);
  await (inPlace ? link.evaluate(element => element.click()) : link.click());
  await page.waitForFunction(l => document.documentElement.dataset.locale === l && !document.querySelector('#filters').hidden, lang);
};

try {
  // Layout at phone and desktop widths, in both themes.
  for (const width of [390, 1280]) for (const lang of languages) {
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, colorScheme: 'light' });
    const page = await open(context, `${lang}/`);
    ok(`${lang} ${width}: 46 events`, (await visible(page)).length === 46);
    ok(`${lang} ${width}: html lang`, (await page.locator('html').getAttribute('lang')).startsWith(lang));
    ok(`${lang} ${width}: no horizontal overflow`, await overflow(page) <= 1, String(await overflow(page)));
    ok(`${lang} ${width}: topbar fits`, await page.evaluate(() => { const bar = document.querySelector('.topbar'); return bar.scrollWidth <= bar.clientWidth + 1 && [...bar.querySelectorAll('a,button')].every(e => { const box = e.getBoundingClientRect(); return box.width === 0 || (box.left >= 0 && box.right <= innerWidth + 0.5); }); }));
    ok(`${lang} ${width}: language controls`, await page.evaluate(lang => [...document.querySelectorAll('.languages a')].map(a => `${a.dataset.language}${a.getAttribute('aria-current') || ''}`).join() === ['zh', 'en', 'fr'].map(l => l === lang ? `${l}page` : l).join(), lang));
    if (lang !== 'zh') {
      const text = await page.evaluate(() => { const body = document.body.cloneNode(true); body.querySelectorAll('script,style').forEach(e => e.remove()); return body.textContent.replaceAll('中文', '') + [...document.querySelectorAll('[aria-label],[title],[placeholder]')].map(e => ['aria-label', 'title', 'placeholder'].map(k => e.getAttribute(k) || '').join(' ')).join(' ') + document.title; });
      ok(`${lang} ${width}: no Chinese in the rendered page`, !cjk.test(text), text.match(new RegExp(`.{0,30}${cjk.source}.{0,30}`, 'u'))?.[0]);
    }
    if (shots) await page.screenshot({ path: `${shots}/rex-${lang}-${width}.png`, animations: 'disabled' });
    await page.locator('#expand').click();
    ok(`${lang} ${width}: all events open`, await page.evaluate(() => [...document.querySelectorAll('.event')].every(e => e.open)));
    ok(`${lang} ${width}: no overflow with every event open`, await overflow(page) <= 1, String(await overflow(page)));
    await page.evaluate(() => document.querySelectorAll('details').forEach(e => { e.open = true; }));
    ok(`${lang} ${width}: no overflow with prompt and notes open`, await overflow(page) <= 1, String(await overflow(page)));
    if (shots) { await page.locator('#vinitech').scrollIntoViewIfNeeded(); await page.screenshot({ path: `${shots}/rex-${lang}-${width}-event.png`, animations: 'disabled' }); }
    // Theme toggle: switches, relabels in the page's language, persists after a reload.
    const toggle = page.locator('#theme-toggle');
    const before = await toggle.textContent();
    await toggle.click();
    ok(`${lang} ${width}: dark theme`, await page.locator('html').getAttribute('data-theme') === 'dark' && await toggle.textContent() !== before);
    ok(`${lang} ${width}: dark palette`, await page.evaluate(() => { const n = getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g).map(Number); return (n[0] + n[1] + n[2]) / 3 < 65; }));
    if (shots && width === 390) await page.screenshot({ path: `${shots}/rex-${lang}-${width}-dark.png`, animations: 'disabled' });
    await page.reload({ waitUntil: 'load' });
    ok(`${lang} ${width}: theme persists`, await page.locator('html').getAttribute('data-theme') === 'dark');
    await page.locator('#theme-toggle').click();
    ok(`${lang} ${width}: back to light`, await page.locator('html').getAttribute('data-theme') === 'light' && await page.locator('#theme-toggle').textContent() === before);
    await context.close();
  }

  // Filters, search, favourites and reminders behave the same in each language.
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  for (const lang of languages) {
    const page = await open(context, `${lang}/`);
    for (const grade of ['A', 'B']) { await setField(page, 'priority', grade); ok(`${lang}: medFEL listed under ${grade}`, (await visible(page)).includes('medfel')); }
    await page.locator('#filters button[type=reset]').click();
    await setField(page, 'country', 'DE'); await setField(page, 'sector', 'logistics');
    ok(`${lang}: combined filters`, (await visible(page)).length === 4);
    await setField(page, 'search', 'fruit');
    ok(`${lang}: keyword with filters`, (await visible(page)).length === 2);
    await page.locator('#filters button[type=reset]').click();
    await setField(page, 'search', 'proteinees');
    ok(`${lang}: accent-insensitive search`, (await visible(page)).join() === 'proteinees');
    await setField(page, 'search', 'zzzz-not-found');
    ok(`${lang}: empty state`, await page.evaluate(() => !document.querySelector('#empty').hidden && document.querySelector('#event-list').hidden));
    await page.locator('#empty-reset').click();
    ok(`${lang}: reset`, (await visible(page)).length === 46);
    await page.locator('[data-view="new"]').click();
    ok(`${lang}: 24 additions`, (await visible(page)).length === 24);
    await page.locator('[data-view="all"]').click();
    await page.locator('[data-window="7"]').click();
    ok(`${lang}: 7-day reminders`, await page.locator('.deadline-list li:not([hidden])').count() === 4);
    await page.locator('[data-window="30"]').click();
    ok(`${lang}: 30-day reminders`, await page.locator('.deadline-list li:not([hidden])').count() === 7 && new URL(page.url()).searchParams.get('due') === '30');
    await page.locator('[data-window="7"]').click();
    const file = lang === 'zh' ? 'prompt.txt' : `prompt.${lang}.txt`;
    ok(`${lang}: embedded prompt equals the download`, await page.evaluate(async file => document.querySelector('#prompt-text').textContent === await (await fetch(`../${file}`)).text(), file));
    ok(`${lang}: report download exists`, await page.evaluate(async () => (await fetch(document.querySelector('.report-download').href)).ok));
    await page.close();
  }

  // A language switch keeps filters, sort, reminder range, anchor, open events, favourites and reading position.
  let page = await open(context, 'en/?country=DE&sector=logistics&sort=deadline&due=30#logimat');
  await page.locator('#logimat .save-event').click();
  await page.locator('#fruit-logistica summary').click();
  await page.waitForFunction(() => document.querySelector('#fruit-logistica').open);
  await page.waitForTimeout(900);
  const english = { ids: await visible(page), top: await page.evaluate(() => Math.round(document.querySelector('#fruit-logistica').getBoundingClientRect().top)) };
  ok('en: deep link applies filters', english.ids.length === 4 && await page.evaluate(() => document.querySelector('#logimat').open));
  ok('en: filter summary in English', (await page.locator('#filter-summary').textContent()) === 'Germany · Warehousing & logistics');
  for (const [lang, summary, saved] of [['fr', 'Allemagne · Entreposage et logistique', 'Dans les favoris'], ['zh', '德国 · 仓储与物流', '已收藏']]) {
    await switchTo(page, lang, { inPlace: true });
    const url = new URL(page.url());
    ok(`${lang}: switch keeps query and anchor`, url.pathname.endsWith(`/rex-opportunities/${lang}/`) && url.search === '?country=DE&sector=logistics&sort=deadline&due=30' && url.hash === '#logimat', page.url());
    ok(`${lang}: switch keeps the filtered list`, (await visible(page)).join() === english.ids.join());
    ok(`${lang}: switch keeps select values`, await page.evaluate(() => ['country', 'sector', 'sort'].map(id => document.getElementById(id).value).join()) === 'DE,logistics,deadline');
    ok(`${lang}: filter summary translated`, (await page.locator('#filter-summary').textContent()) === summary);
    ok(`${lang}: switch keeps reminder range`, await page.locator('[data-window="30"]').getAttribute('aria-pressed') === 'true' && await page.locator('.deadline-list li:not([hidden])').count() === 7);
    ok(`${lang}: switch keeps open events`, await page.evaluate(() => document.querySelector('#logimat').open && document.querySelector('#fruit-logistica').open));
    ok(`${lang}: switch keeps favourites`, (await page.locator('#saved-count').textContent()) === '1' && (await page.locator('#logimat .save-event span').textContent()) === saved);
    await page.waitForTimeout(150);
    // The event at the top of the view before the switch is at the same height after it.
    const top = await page.evaluate(() => Math.round(document.querySelector('#fruit-logistica').getBoundingClientRect().top));
    ok(`${lang}: switch keeps the reading position`, Math.abs(top - english.top) <= 4 && top > 0 && top < 844, `${top} vs ${english.top}`);
  }
  await page.locator('#logimat .save-event').click();
  await page.close();

  // The search text travels too. Official names and place names match in every language.
  page = await open(context, 'fr/');
  await setField(page, 'search', 'LogiMAT');
  const named = await visible(page);
  ok('fr: search by event name', named.length >= 2 && named.includes('logimat'));
  await switchTo(page, 'zh');
  ok('zh: search text and result kept', (await visible(page)).join() === named.join() && await page.locator('#search').inputValue() === 'LogiMAT' && new URL(page.url()).searchParams.get('search') === 'LogiMAT');
  await switchTo(page, 'en');
  ok('en: search text and result kept', (await visible(page)).join() === named.join());
  await setField(page, 'search', 'Perpignan');
  ok('en: search by city', (await visible(page)).join() === 'medfel');
  await switchTo(page, 'zh');
  ok('zh: Latin city name still matches', (await visible(page)).join() === 'medfel');
  await switchTo(page, 'en');
  await setField(page, 'search', 'Allemagne');
  ok('en: French country name matches', (await visible(page)).length === 5);
  await page.close();

  // The former single-page URL redirects and keeps query and anchor; label values from old links still filter.
  page = await context.newPage();
  await page.goto(`${base}?country=${encodeURIComponent('德国')}&sector=${encodeURIComponent('仓储与物流')}#logimat`);
  await page.waitForURL(url => url.pathname.endsWith('/rex-opportunities/en/'));
  await page.waitForFunction(() => document.getElementById('country')?.value === 'DE');
  ok('legacy URL: redirects to English with query and anchor', new URL(page.url()).hash === '#logimat');
  ok('legacy URL: label values resolve to filter keys', (await visible(page)).length === 4 && new URL(page.url()).searchParams.get('sector') === 'logistics');
  await page.goto(`${base}?lang=zh&view=new#sival`);
  await page.waitForURL(url => url.pathname.endsWith('/rex-opportunities/zh/'));
  await page.locator('#filters').waitFor({ state: 'visible' });
  ok('legacy URL: lang=zh opens Chinese', page.url().endsWith('/zh/?view=new#sival') && (await visible(page)).length === 24);
  await page.close();
  await context.close();

  // Without JavaScript the list and the language links remain usable.
  const plain = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  page = await plain.newPage();
  await page.goto(`${base}fr/`);
  ok('no JS: events readable', await page.locator('#event-list .event').count() === 46 && await page.locator('#filters').isHidden());
  await page.locator('.languages a[data-language="en"]').click();
  await page.waitForURL(url => url.pathname.endsWith('/rex-opportunities/en/'));
  ok('no JS: language link', await page.locator('html').getAttribute('lang') === 'en');
  await plain.close();

  assert.deepEqual(errors, [], 'page errors or failed requests');
  console.log(`PASS ${checks.length} browser checks at 390 and 1280 px in ${languages.join(', ')}.`);
} finally {
  await browser.close();
}
