// Static checks for the Claude 3D guide in Chinese, English and French. No browser needed:
//   node scripts/tests/claude-3d.mjs
// The browser checks are in claude-3d-browser.mjs.
import assert from 'node:assert/strict';
import {access, readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {tools, cases} from '../../resources/claude-3d/catalog.mjs';

const root = new URL('../../public', import.meta.url).href;
const origin = 'https://zhaoyang.fr';
const base = '/guides/claude-3d/';
const locales = ['zh', 'en', 'fr'];
const hreflang = {zh: 'zh-Hans', en: 'en', fr: 'fr'};
const htmlLang = {zh: 'zh-CN', en: 'en', fr: 'fr'};
const slugs = ['', 'tools/', 'cases/', 'estimate/', 'handbook/'];
// The only Chinese allowed on English and French pages: the name of the language in the language control.
const allowedChinese = ['中文'];
const chinese = /[⺀-⿟　-ヿ㐀-䶿一-鿿豈-﫿＀-￯]/u;
// Units that are written differently in French.
const frenchUnits = {gb: 'go'};

const read = path => readFile(new URL(root + path), 'utf8');
const exists = path => access(new URL(root + path)).then(() => true, () => false);
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
const decode = text => text.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&amp;', '&');
const localFile = value => { const path = new URL(value, origin).pathname; return path.endsWith('/') ? path + 'index.html' : path; };

// 1. public/ holds exactly what the generator produces, and the generator gives the same result twice.
const first = (await import('../../resources/claude-3d/build.mjs')).files;
const second = (await import('../../resources/claude-3d/build.mjs?again')).files;
assert.deepEqual([...second], [...first], 'the generator is not deterministic');
for (const [path, content] of first) assert.equal(await read(base + path), content, `${path} is stale: run node resources/claude-3d/build.mjs`);

function parse(html) {
  const copy = JSON.parse(html.match(/<script type="application\/json" id="guide-copy">(.*?)<\/script>/s)[1]);
  const markup = html.replace(/(<script\b[^>]*>)[\s\S]*?<\/script>/g, '$1</script>');
  const tagList = [], texts = [];
  for (const [piece] of markup.matchAll(/<[^>]+>|[^<]+/g)) {
    if (!piece.startsWith('<')) { if (piece.trim()) texts.push(decode(piece.trim())); continue; }
    if (piece.startsWith('</') || piece.startsWith('<!')) continue;
    tagList.push(piece);
    for (const name of ['alt', 'aria-label', 'placeholder', 'content', 'data-brief']) {
      const value = attr(piece, name);
      if (value && !(name === 'content' && /^(?:width=|noindex|https:)/.test(value))) texts.push(decode(value));
    }
  }
  const links = tagList.flatMap(tag => ['href', 'src', 'poster'].map(name => attr(tag, name)).filter(Boolean));
  // Canonical, alternates and language controls name the languages themselves; they are checked one by one below.
  const shared = tagList.filter(tag => !/rel="(?:canonical|alternate)"|data-language=/.test(tag)).flatMap(tag => ['href', 'src', 'poster'].map(name => attr(tag, name)).filter(Boolean));
  return {copy, tagList, texts, links, shared};
}
// What must be the same in every language once the language itself is taken out.
const shape = (tag) => tag
  .replace(/\s(alt|aria-label|placeholder|content|data-brief|href|lang|data-locale)="[^"]*"/g, ' $1')
  .replace(/(data-language="\w+") aria-current="page"/, '$1').replace(/(data-language="\w+") (?=>)/, '$1');
const neutral = (link, locale) => link
  .replace(`${base}${locale}/`, `${base}{L}/`).replace(`/guides/${locale}/`, '/guides/{L}/')
  .replace(/developer-kit-prompt(?:\.(?:en|fr))?\.txt/, 'developer-kit-prompt{L}.txt');
const numbers = texts => (texts.join(' ').replace(/\b3d\b/gi, ' ').match(/\d+(?:\.\d+)?/g) || []).sort();
const latinWords = text => (text.match(/[A-Za-z][A-Za-z0-9]*(?:[.-][A-Za-z0-9]+)*/g) || []).filter(word => word.length > 1);
function keepsNames(source, target, locale, where) {
  // Product names, file names, units and identifiers written in Latin letters in the Chinese text stay in the translation.
  const haystack = target.toLowerCase();
  for (const word of latinWords(source)) {
    const wanted = locale === 'fr' && frenchUnits[word.toLowerCase()] || word.toLowerCase();
    assert(haystack.includes(wanted), `${where}: "${word}" from the Chinese text is missing in ${JSON.stringify(target.slice(0, 120))}`);
  }
}
function leaves(value, path = '', out = []) {
  if (typeof value === 'string') out.push([path, value]);
  else for (const [key, item] of Object.entries(value)) leaves(item, `${path}.${key}`, out);
  return out;
}

const pages = {};
let localLinks = 0;
for (const locale of locales) for (const slug of slugs) {
  const file = `${base}${locale}/${slug}index.html`, path = `${base}${locale}/${slug}`;
  assert(await exists(file), `missing page ${file}`);
  const html = await read(file), page = pages[locale + slug] = parse(html);
  // 2. Language, canonical address and alternates.
  assert(html.includes(`<html lang="${htmlLang[locale]}" data-locale="${locale}">`), `${file}: lang`);
  const head = page.tagList.filter(tag => tag.startsWith('<link'));
  assert.deepEqual(head.filter(tag => attr(tag, 'rel') === 'canonical').map(tag => attr(tag, 'href')), [origin + path], `${file}: canonical`);
  assert.deepEqual(head.filter(tag => attr(tag, 'rel') === 'alternate').map(tag => [attr(tag, 'hreflang'), attr(tag, 'href')]),
    [...locales.map(other => [hreflang[other], `${origin}${base}${other}/${slug}`]), ['x-default', `${origin}${base}en/${slug}`]], `${file}: alternates`);
  assert(!html.includes('noindex'), `${file}: must be indexable`);
  // 3. Return link, language controls on the same sub-page, navigation inside the language.
  assert(html.includes(`<a id="all-guides" href="/guides/${locale}/">`), `${file}: return link`);
  const controls = page.tagList.filter(tag => attr(tag, 'data-language'));
  assert.deepEqual(controls.map(tag => [attr(tag, 'data-language'), attr(tag, 'href'), attr(tag, 'hreflang'), attr(tag, 'aria-current') || '']),
    locales.map(other => [other, `${base}${other}/${slug}`, hreflang[other], other === locale ? 'page' : '']), `${file}: language controls`);
  const nav = html.match(/<nav class="main-nav"[^>]*>(.*?)<\/nav>/s)[1];
  assert.deepEqual([...nav.matchAll(/href="([^"]+)"/g)].map(match => match[1]), slugs.map(item => `${base}${locale}/${item}`), `${file}: navigation`);
  assert.equal(nav.match(/aria-current="page"/g).length, 1);
  // 4. Every local address on the page exists; internal page links stay in the language.
  for (const link of page.links) {
    if (!link.startsWith('/')) { assert(link.startsWith('#') || link.startsWith('https://'), `${file}: ${link}`); continue; }
    assert(await exists(localFile(link)), `${file}: missing ${link}`);
    localLinks++;
  }
  // 5. No Chinese left on English and French pages.
  if (locale !== 'zh') {
    const rest = allowedChinese.reduce((text, name) => text.replaceAll(name, ''), html);
    assert(!chinese.test(rest), `${file}: untranslated ${JSON.stringify(rest.match(new RegExp(`.{0,30}${chinese.source}.{0,30}`, 'u'))?.[0])}`);
  } else assert(chinese.test(html));
}

// 6. The same content in every language: structure and row counts, links, media, numbers, names.
for (const slug of slugs) {
  const zh = pages['zh' + slug];
  for (const locale of ['en', 'fr']) {
    const page = pages[locale + slug], where = `${locale}/${slug}`;
    assert.deepEqual(page.tagList.map(shape), zh.tagList.map(shape), `${where}: page structure differs from Chinese`);
    assert.deepEqual(page.shared.map(link => neutral(link, locale)), zh.shared.map(link => neutral(link, 'zh')), `${where}: links and media`);
    assert.deepEqual(numbers(page.texts), numbers(zh.texts), `${where}: numbers`);
    assert.equal(page.texts.length, zh.texts.length, `${where}: number of text passages`);
    zh.texts.forEach((text, i) => keepsNames(text, page.texts.slice(Math.max(0, i - 1), i + 2).join(' '), locale, `${where} passage ${i}`));
    const source = leaves(zh.copy), target = new Map(leaves(page.copy));
    for (const [path, text] of source) {
      const forms = path.endsWith('.other') ? [...target].filter(([key]) => key.startsWith(path.slice(0, -5))).map(([, value]) => value) : [target.get(path)];
      assert(forms.length && forms.every(Boolean), `${where}: runtime text ${path}`);
      for (const form of forms) { keepsNames(text, form, locale, `${where} runtime${path}`); assert.deepEqual(form.match(/\{\w+\}/g), text.match(/\{\w+\}/g), `${where}: placeholders in ${path}`); }
    }
  }
  assert(zh.links.some(link => link.includes('/media/')), `${slug}: media`);
  for (const locale of locales) {
    const tagList = pages[locale + slug].tagList, count = pattern => tagList.filter(tag => pattern.test(tag)).length;
    if (slug === 'tools/') assert.equal(count(/^<article data-category/), tools.length, `${locale}: tool rows`);
    if (slug === 'cases/') { assert.equal(count(/^<article data-case/), cases.length, `${locale}: case rows`); assert.equal(count(/^<video /), 1); }
    if (slug === 'estimate/') { assert.equal(count(/^<section class="worksheet"/), 3); assert.equal(count(/^<input type="number"/), 10); }
    if (slug === 'handbook/') { assert.equal(count(/^<li>/), 5); assert.equal(count(/^<input data-brief/), 4); }
  }
}
// Shared files are not copied per language, and the shared scripts carry no language of their own.
for (const locale of locales) for (const name of ['media', 'guide.css', 'guide.js']) assert(!await exists(`${base}${locale}/${name}`), `${locale}/${name} must not be copied`);
for (const name of ['guide.js', 'entry.js']) assert(!chinese.test(await read(base + name)), `${name} must take its text from the page`);
// The prompt readers copy: the Chinese original keeps its address, English and French have their own file.
const prompts = {zh: await read(base + 'developer-kit-prompt.txt'), en: await read(base + 'developer-kit-prompt.en.txt'), fr: await read(base + 'developer-kit-prompt.fr.txt')};
for (const locale of ['en', 'fr']) {
  assert(!chinese.test(prompts[locale]), `${locale} prompt: untranslated text`);
  assert.equal(prompts[locale].split('\n').length, prompts.zh.split('\n').length, `${locale} prompt: line count`);
  prompts.zh.split('\n').forEach((line, i) => keepsNames(line, prompts[locale].split('\n')[i], locale, `${locale} prompt line ${i + 1}`));
  assert.deepEqual(numbers([prompts[locale]]), numbers([prompts.zh]), `${locale} prompt: numbers`);
  assert(pages[locale + 'handbook/'].texts.includes(prompts[locale].trim()), `${locale}: the handbook shows its own prompt`);
}
// French typography: no plain space before ; : ? ! or inside « ».
for (const text of [...slugs.flatMap(slug => [...pages['fr' + slug].texts, ...leaves(pages['fr' + slug].copy).map(([, value]) => value)]), prompts.fr])
  assert(!/(?:^|\S) [;:?!](?:\s|$)|« | »/.test(text), `French spacing: ${JSON.stringify(text.match(/.{0,20}(?: [;:?!]|« | »).{0,10}/)?.[0])}`);

// 7. Every address from before the guide had languages resolves to a language.
const entry = await read(base + 'entry.js');
function resolve(address, guideEntry) {
  let target;
  vm.runInNewContext(entry, {URL, location: {href: origin + address, replace: href => { target = href; }}, document: {documentElement: {dataset: {guideEntry}}}});
  return target.slice(origin.length);
}
for (const slug of slugs) {
  const file = base + slug + 'index.html', html = await read(file);
  assert(html.includes(`data-guide-entry="${slug}"`) && html.includes(`<script src="${base}entry.js?`), `${file}: entry script`);
  assert(html.includes('<meta name="robots" content="noindex,follow">'), `${file}: noindex`);
  assert(html.includes(`<link rel="canonical" href="${origin}${base}en/${slug}">`), `${file}: canonical`);
  assert(html.includes(`<meta http-equiv="refresh" content="0;url=${base}en/${slug}">`), `${file}: fallback without scripts`);
  for (const locale of locales) assert(html.includes(`<a href="${base}${locale}/${slug}"`), `${file}: link to ${locale}`);
  const routes = [
    ['', `en/${slug}`], ['?from=zh', `zh/${slug}`], ['?from=en', `en/${slug}`], ['?from=fr', `fr/${slug}`],
    ['?lang=zh', `zh/${slug}`], ['?lang=fr&from=zh', `fr/${slug}`], ['?lang=xx', `en/${slug}`],
    ['?from=fr&category=code&q=remotion#comparison', `fr/${slug}?category=code&q=remotion#comparison`], ['#studio', `en/${slug}#studio`]
  ];
  for (const [suffix, expected] of routes) {
    const target = resolve(base + slug + suffix, slug);
    assert.equal(target, base + expected, `${base}${slug}${suffix}`);
    assert(await exists(localFile(target)), `${target} does not exist`);
  }
}

console.log(`PASS ${locales.length * slugs.length} pages (${slugs.length} × ${locales.join(', ')}): generator output current and deterministic; canonical and hreflang; ${localLinks} local links; structure, links, media, numbers and Latin names equal across languages (${tools.length} tools, ${cases.length} cases); no Chinese on en/fr pages except ${allowedChinese.join(', ')}; ${slugs.length} former addresses resolve.`);
