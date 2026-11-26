// Static checks for /guides/deck-methods/ : node scripts/tests/deck-methods.mjs
// The browser checks are in resources/deck-methods/browser-check.mjs.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFile, stat} from 'node:fs/promises';
import {base, fileKinds, hreflang, htmlLang, links, locales, origin, sections, works} from '../../resources/deck-methods/content.mjs';

const root = new URL('../../public/', import.meta.url);
const read = path => readFile(new URL(path.replace(/^\//, ''), root), 'utf8');
const attr = (tag, name) => tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`))?.[1];

// The generator output is current.
const before = await Promise.all(locales.map(locale => read(`${base}${locale}/index.html`)));
execFileSync(process.execPath, [new URL('../../resources/deck-methods/build.mjs', import.meta.url).pathname], {stdio: 'ignore'});
const pages = await Promise.all(locales.map(locale => read(`${base}${locale}/index.html`)));
pages.forEach((html, i) => assert.equal(html, before[i], `${locales[i]}: page differs from the generator output, run node resources/deck-methods/build.mjs`));

const shape = html => ({
  ids: [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]),
  external: [...new Set([...html.matchAll(/<a\b[^>]*href="(https?:[^"]+)"/g)].map(m => m[1].replaceAll('&amp;', '&')))].sort(),
  rows: [...html.matchAll(/<tbody\b[^>]*>([\s\S]*?)<\/tbody>/g)].map(m => (m[1].match(/<tr\b/g) || []).length),
  local: [...html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)].map(m => m[1]).filter(path => !path.startsWith(`${base}zh/`) && !path.startsWith(`${base}en/`) && !path.startsWith(`${base}fr/`)).sort(),
});
const reference = shape(pages[0]);
let localLinks = 0;
for (const [i, locale] of locales.entries()) {
  const html = pages[i], here = shape(html), where = `${locale}`;
  assert(html.includes(`<html lang="${htmlLang[locale]}"`), `${where}: lang`);
  assert(html.includes('data-guide="deck-methods"'), `${where}: theme scope`);
  const tags = html.match(/<link\b[^>]*>/g) || [];
  assert(tags.some(tag => attr(tag, 'rel') === 'canonical' && attr(tag, 'href') === `${origin}${base}${locale}/`), `${where}: canonical`);
  for (const other of locales) assert(tags.some(tag => attr(tag, 'rel') === 'alternate' && attr(tag, 'hreflang') === hreflang[other] && attr(tag, 'href') === `${origin}${base}${other}/`), `${where}: ${other} alternate`);
  assert(html.includes(`href="/guides/${locale}/"`), `${where}: return link`);
  for (const id of sections) assert(here.ids.includes(id), `${where}: section ${id}`);
  assert.deepEqual(here.ids, reference.ids, `${where}: same ids as zh`);
  assert.deepEqual(here.rows, [works.length, 4, 8], `${where}: table rows`);
  assert.deepEqual(here.external, Object.values(links).sort(), `${where}: external links`);
  const same = (paths, own) => paths.map(path => path.replace(`/guides/${own}/`, '/guides/@/').replace(`/demo/${own}/`, '/demo/@/')).sort();
  assert.deepEqual(same(here.local, locale), same(reference.local, 'zh'), `${where}: same local links as zh`);
  for (const tag of html.match(/<a\b[^>]*href="https?:[^>]*>/g) || []) assert(/rel="[^"]*noopener/.test(tag), `${where}: ${tag} needs rel="noopener"`);
  // No third-party script, style or font.
  for (const tag of html.match(/<(?:script|link|img|iframe)\b[^>]*>/g) || []) {
    const value = attr(tag, 'src') || (attr(tag, 'rel') === 'canonical' || attr(tag, 'rel') === 'alternate' ? null : attr(tag, 'href'));
    if (value) assert(!/^(?:https?:)?\/\//.test(value), `${where}: third-party resource ${value}`);
  }
  assert(!/@import|url\(\s*["']?https?:/i.test(html), `${where}: third-party CSS`);
  // English and French carry no Chinese except the names of works and the language switch.
  if (locale !== 'zh') {
    const text = html.replace(/<script\b[\s\S]*?<\/script>/g, '').replace(/<style\b[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replaceAll('中文', '').replaceAll('ACE哔哩', '');
    const cjk = text.match(/[㐀-鿿]+/g);
    assert(!cjk, `${where}: Chinese text ${cjk}`);
  }
  for (const path of new Set(here.local)) {
    const file = path.endsWith('/') ? `${path}index.html` : path;
    await stat(new URL(file.replace(/^\//, ''), root)).catch(() => { throw new Error(`${where}: missing ${path}`); });
    localLinks++;
  }
}

// The reel and the downloads exist; the player pages stay out of the sitemap.
for (const locale of locales) {
  const demo = await read(`${base}demo/${locale}/index.html`);
  assert(demo.includes('<meta name="robots" content="noindex">'), `demo/${locale}: noindex`);
  assert(demo.includes('window.DECK='), `demo/${locale}: player data`);
  for (const kind of fileKinds) {
    const size = (await stat(new URL(`${base.slice(1)}files/deck-methods-${locale}${kind.suffix}`, root))).size;
    assert(size > 1e6, `deck-methods-${locale}${kind.suffix}: ${size} bytes`);
  }
}
const entry = await read(`${base}index.html`);
assert(entry.includes('/guides/entry.js') && entry.includes('noindex'), 'root entry page');

console.log(`PASS deck-methods in ${locales.join(', ')}: generator output current; canonical and hreflang; ${sections.length} sections with the same ids; tables of ${works.length}, 4 and 8 rows; ${Object.keys(links).length} external links with rel="noopener"; ${localLinks} local links; no third-party resources; no Chinese on en/fr pages except names; ${locales.length * fileKinds.length} downloads; player pages noindex.`);
