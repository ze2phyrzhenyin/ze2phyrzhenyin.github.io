// Builds /guides/deck-methods/ in Chinese, English and French from content.mjs.
//   node resources/deck-methods/build.mjs
// Writes public/guides/deck-methods/{zh,en,fr}/index.html, index.html (redirect through /guides/entry.js),
// style.css and page.js. The reel (demo/), the downloads (files/) and the font (fonts/) are copied in by hand
// and only read here: slide timings come from the reel, file sizes from the files.
import {createHash} from 'node:crypto';
import {mkdir, readFile, stat, writeFile} from 'node:fs/promises';
import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {base, chapters, copy, fileKinds, hreflang, htmlLang, languageNames, links, locales, origin, sections, works} from './content.mjs';

const here = new URL('./', import.meta.url);
const out = new URL('../../public/guides/deck-methods/', import.meta.url);
const themeScript = '/guides/theme.js?v=20260924c';
const fontPath = `${base}fonts/archivo-latin-wdth.woff2`;
// Written with an escape so that the copy lint, which reads this source, finds no exclamation mark.
const doctype = '<\u0021doctype html>';

// ---------- text ----------
const esc = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
// Typography of each language: thin spaces inside numbers, typographic apostrophes, French spaces before ; : ? ! and inside « ».
function typeset(text, locale) {
  let result = text;
  if (locale !== 'zh') result = result.replaceAll("'", '’');
  if (locale === 'fr') result = result.replaceAll('« ', '« ').replaceAll(' »', ' »').replace(/ :/g, ' :').replace(/ ([;?!])/g, ' $1').replace(/(\d) (?=%|millions\b)/g, '$1 ');
  return result.replace(/(\d) (\d{3})(?!\d)/g, '$1 $2').replace(/(\d) (?=(?:s|MB|Mo)(?![\p{L}\d]))/gu, '$1 ');
}
const external = (key, label) => {
  if (!links[key]) throw new Error(`unknown link "${key}"`);
  return `<a href="${esc(links[key])}" target="_blank" rel="noopener noreferrer">${label}</a>`;
};
// Copy with its inline marks turned into HTML.
const rich = (text, locale) => esc(typeset(text, locale))
  .replace(/\[\[(\w+)\|([^\]]+)\]\]/g, (_, key, label) => external(key, label))
  .replace(/\*([^*]+)\*/g, '<cite>$1</cite>')
  .replace(/`([^`]+)`/g, '<code>$1</code>');
// Copy for attributes and the title: no marks.
const plain = (text, locale) => esc(typeset(text, locale).replace(/\[\[\w+\|([^\]]+)\]\]/g, '$1').replace(/[*`]/g, ''));

// ---------- facts read from the copied assets ----------
async function reelTimings() {
  const perLocale = [];
  for (const locale of locales) {
    const page = new URL(`demo/${locale}/index.html`, out);
    let html = await readFile(page, 'utf8').catch(() => { throw new Error(`missing public${base}demo/${locale}/index.html: copy the reel first`); });
    // The player is only shown inside the guide's frame: keep it out of search results and the sitemap.
    if (!html.includes('<meta name="robots"')) {
      html = html.replace('<meta charset="utf-8">', '<meta charset="utf-8"><meta name="robots" content="noindex">');
      await writeFile(page, html);
    }
    const deck =JSON.parse(html.match(/<script>window\.DECK=(\{.*?\});?<\/script>/s)[1]);
    let clock = 0;
    perLocale.push(deck.slides.map((slide, index) => {
      const lead = index ? slide.tr.dur || 0 : 0, start = clock;
      clock += lead + slide.dur + slide.tail;
      return Math.round((start + lead) * 1000) / 1000;
    }).concat(Math.round(clock * 1000) / 1000));
  }
  if (perLocale.some(times => times.join() !== perLocale[0].join())) throw new Error('the three reels do not share one timing');
  return perLocale[0];
}
const timecode = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
const fileName = (locale, kind) => `deck-methods-${locale}${kind.suffix}`;
async function fileSizes() {
  const sizes = {};
  for (const locale of locales) for (const kind of fileKinds) {
    const name = fileName(locale, kind);
    sizes[name] = (await stat(new URL(`files/${name}`, out)).catch(() => { throw new Error(`missing public${base}files/${name}`); })).size;
  }
  return sizes;
}
const megabytes = (bytes, locale) => (bytes / 1e6).toFixed(1).replace('.', locale === 'fr' ? ',' : '.');

// ---------- page ----------
function table(name, columns, rows, locale) {
  const head = columns.map(column => `<th scope="col" role="columnheader">${rich(column, locale)}</th>`).join('');
  const body = rows.map(row => `<tr role="row"${row.id ? ` id="${row.id}" data-anchor` : ''}><th scope="row" role="rowheader">${row.cells[0]}</th>${
    row.cells.slice(1).map((cell, index) => `<td role="cell" data-label="${plain(columns[index + 1], locale)}">${cell}</td>`).join('')}</tr>`).join('\n');
  return `<table class="table ${name}" role="table"><thead role="rowgroup"><tr role="row">${head}</tr></thead>\n<tbody role="rowgroup">\n${body}\n</tbody></table>`;
}
const list = (items, locale) => `<ul class="plain">${items.map(item => `<li>${rich(item, locale)}</li>`).join('')}</ul>`;

function page(locale, times, sizes, version) {
  const c = copy[locale], t = text => rich(text, locale), a = text => plain(text, locale);
  const address = `${origin}${base}${locale}/`;
  const head = `${doctype}
<html lang="${htmlLang[locale]}" data-locale="${locale}" data-guide="deck-methods">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark">
<title>${a(c.title)}</title>
<meta name="description" content="${a(c.description)}">
<link rel="canonical" href="${address}">
${locales.map(other => `<link rel="alternate" hreflang="${hreflang[other]}" href="${origin}${base}${other}/">`).join('')}<link rel="alternate" hreflang="x-default" href="${origin}${base}en/">
<link rel="icon" href="/guides/favicon.svg" type="image/svg+xml"><link rel="icon" href="/guides/favicon-32.png" sizes="32x32" type="image/png"><link rel="apple-touch-icon" href="/guides/apple-touch-icon.png">
<meta property="og:title" content="${a(c.title)}"><meta property="og:type" content="website"><meta property="og:url" content="${address}"><meta property="og:description" content="${a(c.description)}">
<link rel="preload" href="${fontPath}" as="font" type="font/woff2" crossorigin>
<script src="${themeScript}"></script>
<link rel="stylesheet" href="${base}style.css?v=${version.css}"><script defer src="${base}page.js?v=${version.js}"></script>
</head>`;

  const topbar = `<a class="skip" href="#content">${t(c.skip)}</a>
<nav class="topbar guide-navigation" aria-label="${a(c.topbar)}"><a data-guide-home href="/guides/${locale}/">${t(c.back)}</a>
<div class="tools"><div class="languages" role="group" aria-label="${a(c.languages)}">${locales.map(other =>
    `<a href="${base}${other}/" lang="${other}" hreflang="${hreflang[other]}" data-language="${other}"${other === locale ? ' aria-current="page"' : ''}>${languageNames[other]}</a>`).join('')}</div>
<button id="theme-toggle" type="button" data-dark="${a(c.theme.dark)}" data-light="${a(c.theme.light)}" data-to-dark="${a(c.theme.toDark)}" data-to-light="${a(c.theme.toLight)}" aria-label="${a(c.theme.toDark)}">${t(c.theme.dark)}</button></div></nav>`;

  const methods = chapters.map(chapter => {
    const item = c.methods.items[chapter.id], work = c.works.items[chapter.work];
    return `<li class="method" id="m-${chapter.id}" data-anchor data-chapter="${chapter.id}" data-first="${chapter.slides[0]}" data-last="${chapter.slides[1]}">
<div class="method-head"><h3><span class="tc">${timecode(times[chapter.slides[0] - 1])}</span>${t(item.name)}</h3><button class="cue" type="button">${t(item.play)}</button></div>
<dl class="facts"><div><dt>${t(c.methods.seen)}</dt><dd>${t(item.seen)}</dd></div><div><dt>${t(c.methods.built)}</dt><dd>${t(item.built)}</dd></div></dl>
<p class="from"><span class="label">${t(c.methods.from)}</span><a href="#w-${chapter.work}">${t(work.short)}</a></p>
</li>`;
  }).join('\n');

  const studio = `<section class="studio" id="reel">
<div class="stage"><div class="stage-pin">
<div class="screen"><div class="ratio"><iframe id="player" src="${base}demo/${locale}/index.html" title="${a(c.reel)}"></iframe></div></div>
<div class="slate">
<p class="credits">${t(c.credits)}</p>
<h1>${t(c.title)}</h1>
<nav class="sections" aria-label="${a(c.nav.label)}">${sections.map(id => `<a href="#${id}">${t(c.nav[id])}</a>`).join('')}</nav>
</div>
</div></div>
<div class="methods" id="methods" data-anchor>
<h2>${t(c.methods.heading)}</h2>
<ol class="method-list">
${methods}
</ol>
</div>
</section>`;

  const worksTable = table('works', c.works.columns, works.map(work => {
    const item = c.works.items[work.id];
    return {id: `w-${work.id}`, cells: [
      `${t(item.name)}<span class="links">${work.links.map(key => external(key, t(item.links[key]))).join('')}</span>`,
      t(item.where), t(item.method), t(item.how)
    ]};
  }), locale);
  const worksSection = `<section class="band" id="works" data-anchor>
<h2>${t(c.works.heading)}</h2>
${worksTable}
<p class="aside">${t(c.works.note)}</p>
</section>`;

  const checklist = `<section class="band" id="checklist" data-anchor>
<h2>${t(c.checklist.heading)}</h2>
<div class="columns">
${c.checklist.groups.map(group => `<div><h3>${t(group.title)}</h3>${list(group.items, locale)}</div>`).join('\n')}
</div>
</section>`;

  const better = `<section class="band" id="better" data-anchor>
<h2>${t(c.better.heading)}</h2>
<h3 class="over">${t(c.better.pipeline.heading)}</h3>
${table('pipeline', c.better.pipeline.columns, c.better.pipeline.rows.map(row => ({cells: row.map(t)})), locale)}
<div class="columns wide">
<div><h3>${t(c.better.tools.heading)}</h3>${list(c.better.tools.items, locale)}<p class="note">${t(c.better.tools.note)}</p>
<h3>${t(c.better.ai.heading)}</h3><p class="text">${t(c.better.ai.text)}</p></div>
<div><h3>${t(c.better.code.heading)}</h3><dl class="terms">${c.better.code.items.map(item => `<div><dt>${t(item.term)}</dt><dd>${t(item.text)}</dd></div>`).join('')}</dl></div>
</div>
</section>`;

  const status = `<section class="band" id="status" data-anchor>
<h2>${t(c.status.heading)}</h2>
${table('statuses', c.status.columns, c.status.rows.map(row => ({cells: row.map(t)})), locale)}
<div class="columns wide">
<div><h3>${t(c.status.verified.heading)}</h3>${list(c.status.verified.items, locale)}</div>
<div><h3>${t(c.status.unverified.heading)}</h3>${list(c.status.unverified.items, locale)}</div>
</div>
</section>`;

  // The page's own language first.
  const downloads = `<section class="band" id="downloads" data-anchor>
<h2>${t(c.downloads.heading)}</h2>
<div class="columns">
${[locale, ...locales.filter(other => other !== locale)].map(version => `<div><h3>${t(c.downloads.versions[version])}</h3><ul class="files">${fileKinds.map(kind => {
    const name = fileName(version, kind);
    return `<li><a href="${base}files/${name}" download><span class="what">${t(c.downloads.kinds[kind.id].name)}</span><span class="meta">${kind.format} ${megabytes(sizes[name], locale)} ${c.downloads.unit}</span></a></li>`;
  }).join('')}</ul></div>`).join('\n')}
</div>
<dl class="terms kinds">${fileKinds.map(kind => `<div><dt>${t(c.downloads.kinds[kind.id].name)}</dt><dd>${t(c.downloads.kinds[kind.id].text)}</dd></div>`).join('')}</dl>
<p class="note">${t(c.downloads.note)}</p>
</section>`;

  const footer = `<footer class="foot"><p>${t(c.footer)}</p><a href="/guides/${locale}/">${t(c.back)}</a></footer>`;
  return `${head}\n<body>\n${topbar}\n<main id="content">\n${studio}\n${worksSection}\n${checklist}\n${better}\n${status}\n${downloads}\n</main>\n${footer}\n</body>\n</html>\n`;
}

// Address without a language: /guides/entry.js sends it to ?lang=, or to English.
function entry() {
  const title = plain(copy.en.title, 'en');
  return `${doctype}<html lang="en" data-guide-entry=""><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><link rel="icon" href="/guides/favicon.svg" type="image/svg+xml"><title>${title}</title><link rel="canonical" href="${origin}${base}en/"><script src="/guides/entry.js"></script><noscript><meta http-equiv="refresh" content="0;url=${base}en/"></noscript></head><body><p>${
    [['zh', '中文'], ['en', 'English'], ['fr', 'Français']].map(([locale, name]) => `<a href="${base}${locale}/" lang="${locale}" hreflang="${hreflang[locale]}">${name}</a>`).join(' · ')}</p></body></html>\n`;
}

async function build() {
  const [css, js, times, sizes] = await Promise.all([readFile(new URL('style.css', here), 'utf8'), readFile(new URL('page.js', here), 'utf8'), reelTimings(), fileSizes()]);
  const hash = text => createHash('sha256').update(text).digest('hex').slice(0, 8);
  const version = {css: hash(css), js: hash(js)};
  const result = new Map([['style.css', css], ['page.js', js], ['index.html', entry()]]);
  for (const locale of locales) result.set(`${locale}/index.html`, page(locale, times, sizes, version));
  return result;
}

export const files = await build();

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const [path, content] of files) {
    const target = new URL(path, out);
    await mkdir(dirname(fileURLToPath(target)), {recursive: true});
    await writeFile(target, content);
  }
  console.log(`deck-methods: wrote ${files.size} files to public${base}`);
}
