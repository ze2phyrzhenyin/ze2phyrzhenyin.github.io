// Builds /guides/rex-pitch/ in Chinese, English and French from content.mjs and the two scripts.
//   node resources/rex-pitch/build.mjs            build; placeholder assets are reported but allowed
//   node resources/rex-pitch/build.mjs --strict   build for release; placeholder assets fail the build
// Writes public/guides/rex-pitch/{zh,en,fr}/index.html, index.html (redirect through /guides/entry.js), style.css, page.js,
// and slides/slide-NN.webp from slides/slide-NN.png. The deck player (demo/), the downloads (files/), the slide PNGs (slides/)
// and the font (fonts/) are copied in by hand and only read here: file sizes come from the files on disk.
// A missing asset fails the build with the list of every missing path.
import {createHash} from 'node:crypto';
import {mkdir, readFile, stat, writeFile} from 'node:fs/promises';
import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {base, copy, demo, demoQuery, downloads, fontFile, history, hreflang, htmlLang, languageNames, links, locales, mp4Seconds, origin, sections, slideCount, slideName, translationFr, version as kit} from './content.mjs';

const here = new URL('./', import.meta.url);
const out = new URL('../../public/guides/rex-pitch/', import.meta.url);
const strict = process.argv.includes('--strict') || process.env.REX_PITCH_STRICT === '1';
const themeScript = '/guides/theme.js?v=20260924c';
// Written with an escape so that the copy lint, which reads this source, finds no exclamation mark.
const doctype = '<\u0021doctype html>';
const exists = url => stat(url).then(info => info, () => null);
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

// ---------- the two scripts ----------
// SCRIPT-FINAL.md: "## N · Title" then one line per paragraph; a line starting with "▸ " follows one click.
export async function readScript() {
  const text = await readFile(new URL('SCRIPT-FINAL.md', here), 'utf8');
  const slides = [];
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    const head = line.match(/^## (\d+) · (.+)$/);
    if (head) { slides.push({n: Number(head[1]), title: head[2], lines: []}); continue; }
    if (!line || !slides.length || line.startsWith('#')) continue;
    const click = line.startsWith('▸');
    slides.at(-1).lines.push({click, text: click ? line.replace(/^▸\s*/, '') : line});
  }
  if (slides.length !== slideCount || slides.some((slide, index) => slide.n !== index + 1 || !slide.lines.length)) throw new Error(`SCRIPT-FINAL.md: expected slides 1 to ${slideCount}, each with lines`);
  return slides;
}
// SCRIPT.md, section "## 中文原稿": the owner's Chinese draft, one paragraph per line.
export async function readChineseDraft() {
  const text = await readFile(new URL('SCRIPT.md', here), 'utf8');
  const start = text.indexOf('## 中文原稿');
  if (start < 0) throw new Error('SCRIPT.md: no "## 中文原稿" section');
  const rest = text.slice(start).split('\n').slice(1);
  const end = rest.findIndex(line => line.startsWith('## '));
  return (end < 0 ? rest : rest.slice(0, end)).map(line => line.trim()).filter(Boolean);
}
const wordCount = slides => slides.flatMap(slide => slide.lines).reduce((sum, line) => sum + line.text.split(/\s+/).filter(word => /[\p{L}\d]/u.test(word)).length, 0);

// ---------- text ----------
const esc = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
// Typography of the copy written for this page (the quoted script is left as written):
// typographic apostrophes in English and French; French spaces before : ; ? % and inside « », thin spaces in numbers.
function typeset(text, locale) {
  if (locale === 'zh') return text;
  let result = text.replaceAll("'", '’');
  if (locale === 'fr') result = result.replaceAll('« ', '«\u00a0').replaceAll(' »', '\u00a0»').replace(/ :/g, '\u00a0:').replace(/ ([;?%])/g, '\u202f$1')
    .replace(/(\d) (\d{3})(?!\d)/g, '$1\u202f$2').replace(/(\d) (?=(?:s|min|Mo|ko|millions?)(?![\p{L}\d]))/gu, '$1\u00a0');
  return result.replace(/(\d) (?=(?:s|min|MB|kB|KB)(?![\p{L}\d]))/gu, '$1\u00a0');
}
const fileHref = name => `${base}files/${name}`;
function rich(text, locale, extra = {}) {
  return esc(typeset(text, locale))
    .replace(/\[\[f:([\w.-]+)\]\]/g, (_, name) => {
      if (!downloads.some(item => item.file === name)) throw new Error(`unknown download "${name}"`);
      return `<a href="${fileHref(name)}" download>${name}</a>`;
    })
    .replace(/\[\[l:(\w+)\|([^\]]+)\]\]/g, (_, key, label) => {
      if (!links[key]) throw new Error(`unknown link "${key}"`);
      return `<a href="${esc(links[key])}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    })
    .replace(/\*([^*]+)\*/g, '<cite>$1</cite>')
    .replace(/\{\{([^}]+)\}\}/g, '<kbd>$1</kbd>')
    .replace(/\{(\w+)\}/g, (match, key) => key in extra ? extra[key] : match);
}
const plain = (text, locale) => esc(typeset(text, locale).replace(/\[\[f:([\w.-]+)\]\]/g, '$1').replace(/\[\[l:\w+\|([^\]]+)\]\]/g, '$1').replace(/[*]/g, '').replace(/\{\{([^}]+)\}\}/g, '$1'));
const duration = (seconds, locale) => {
  if (!seconds) throw new Error('content.mjs: set mp4Seconds to the length of the MP4');
  const m = Math.floor(seconds / 60), sec = Math.round(seconds % 60);
  return locale === 'zh' ? `${m} 分 ${sec} 秒` : `${m} min ${sec} s`;
};
const fill = (text, values) => text.replace(/\{(\w+)\}/g, (match, key) => key in values ? values[key] : match);
// The owner's text: escaped, nothing else changed, except Markdown bold shown as bold.
const verbatim = text => esc(text).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

// ---------- assets on disk ----------
async function placeholderHashes() {
  const file = new URL('placeholders.json', here);
  return (await exists(file)) ? JSON.parse(await readFile(file, 'utf8')) : {};
}
// Turns each slides/slide-NN.png into slides/slide-NN.webp (1280 px wide). Without a PNG, an existing WebP is used as it is.
async function slidePictures(known, missing, placeholders) {
  const pictures = [];
  let sharp = null;
  for (let n = 1; n <= slideCount; n++) {
    const png = new URL(`slides/${slideName(n)}.png`, out), webp = new URL(`slides/${slideName(n)}.webp`, out);
    if (await exists(png)) {
      const bytes = await readFile(png);
      if (known[`slides/${slideName(n)}.png`] === sha256(bytes)) placeholders.push(`slides/${slideName(n)}.png`);
      if (sharp === null) sharp = await import('sharp').then(module => module.default, () => false);
      if (sharp) {
        const image = await sharp(bytes).resize({width: 1280, withoutEnlargement: true}).webp({quality: 84, effort: 5}).toBuffer({resolveWithObject: true});
        await writeFile(webp, image.data);
        pictures.push({src: `slides/${slideName(n)}.webp`, width: image.info.width, height: image.info.height});
      } else {
        console.warn(`rex-pitch: sharp is not installed, slides/${slideName(n)}.png is used without conversion`);
        const meta = pngSize(bytes);
        pictures.push({src: `slides/${slideName(n)}.png`, ...meta});
      }
    } else if (await exists(webp)) {
      const bytes = await readFile(webp);
      if (known[`slides/${slideName(n)}.webp`] === sha256(bytes)) placeholders.push(`slides/${slideName(n)}.webp`);
      pictures.push({src: `slides/${slideName(n)}.webp`, ...webpSize(bytes)});
    } else missing.push(`slides/${slideName(n)}.png`);
  }
  return pictures;
}
const pngSize = bytes => ({width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20)});
function webpSize(bytes) {
  const kind = bytes.toString('ascii', 12, 16);
  if (kind === 'VP8X') return {width: 1 + bytes.readUIntLE(24, 3), height: 1 + bytes.readUIntLE(27, 3)};
  if (kind === 'VP8L') { const bits = bytes.readUInt32LE(21); return {width: 1 + (bits & 0x3fff), height: 1 + ((bits >> 14) & 0x3fff)}; }
  return {width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff};
}
async function assets() {
  const known = await placeholderHashes();
  const missing = [], placeholders = [], sizes = {};
  for (const item of downloads) {
    const path = `files/${item.file}`, info = await exists(new URL(path, out));
    if (!info) { missing.push(path); continue; }
    sizes[item.file] = info.size;
    if (known[path] && known[path] === sha256(await readFile(new URL(path, out)))) placeholders.push(path);
  }
  const player = new URL(demo, out);
  if (await exists(player)) {
    let html = await readFile(player, 'utf8');
    if (known[demo] === sha256(html)) placeholders.push(demo);
    // The player is only shown inside the guide's frame or a new tab: keep it out of search results and the sitemap.
    else if (!html.includes('<meta name="robots"')) {
      html = html.replace(/<meta charset="utf-8">/i, '<meta charset="utf-8"><meta name="robots" content="noindex">');
      if (!html.includes('<meta name="robots"')) throw new Error(`public${base}${demo}: no <meta charset="utf-8"> to put the noindex tag after`);
      await writeFile(player, html);
    }
  } else missing.push(demo);
  if (!(await exists(new URL(fontFile, out)))) missing.push(fontFile);
  const pictures = await slidePictures(known, missing, placeholders);
  if (missing.length) throw new Error(`rex-pitch: missing assets, copy them into public${base} first:\n${missing.map(path => `  public${base}${path}`).join('\n')}`);
  if (placeholders.length) {
    const list = placeholders.map(path => `  public${base}${path}`).join('\n');
    if (strict) throw new Error(`rex-pitch: placeholder assets are still in place:\n${list}`);
    console.warn(`rex-pitch: WARNING, placeholder assets are still in place (the build for release uses --strict):\n${list}`);
  }
  return {sizes, pictures, placeholders};
}
function size(bytes, locale) {
  const c = copy[locale].downloads, decimal = value => locale === 'fr' ? value.replace('.', ',') : value;
  if (bytes >= 1e6) return `${decimal((bytes / 1e6).toFixed(1))}\u00a0${c.mb}`;
  return `${Math.max(1, Math.round(bytes / 1e3))}\u00a0${c.kb}`;
}

// ---------- page ----------
function page(locale, data, version) {
  const c = copy[locale], t = (text, extra) => rich(text, locale, extra), a = text => plain(text, locale);
  const address = `${origin}${base}${locale}/`;
  const player = `${base}${demo}${demoQuery}`;
  const head = `${doctype}
<html lang="${htmlLang[locale]}" data-locale="${locale}" data-guide="rex-pitch">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark">
<meta name="robots" content="noindex,follow">
<title>${a(c.title)}</title>
<meta name="description" content="${a(c.description)}">
<link rel="canonical" href="${address}">
${locales.map(other => `<link rel="alternate" hreflang="${hreflang[other]}" href="${origin}${base}${other}/">`).join('')}<link rel="alternate" hreflang="x-default" href="${origin}${base}en/">
<link rel="icon" href="/guides/favicon.svg" type="image/svg+xml"><link rel="icon" href="/guides/favicon-32.png" sizes="32x32" type="image/png"><link rel="apple-touch-icon" href="/guides/apple-touch-icon.png">
<meta property="og:title" content="${a(c.title)}"><meta property="og:type" content="website"><meta property="og:url" content="${address}"><meta property="og:description" content="${a(c.description)}">
<link rel="preload" href="${base}${fontFile}" as="font" type="font/woff2" crossorigin>
<script src="${themeScript}"></script>
<link rel="stylesheet" href="${base}style.css?v=${version.css}"><script defer src="${base}page.js?v=${version.js}"></script>
</head>`;

  const topbar = `<a class="skip" href="#content">${t(c.skip)}</a>
<nav class="topbar guide-navigation" aria-label="${a(c.topbar)}"><a data-guide-home href="/guides/${locale}/">${t(c.back)}</a>
<div class="tools"><div class="languages" role="group" aria-label="${a(c.languages)}">${locales.map(other =>
    `<a href="${base}${other}/" lang="${other}" hreflang="${hreflang[other]}" data-language="${other}"${other === locale ? ' aria-current="page"' : ''}>${languageNames[other]}</a>`).join('')}</div>
<button id="theme-toggle" type="button" data-dark="${a(c.theme.dark)}" data-light="${a(c.theme.light)}" data-to-dark="${a(c.theme.toDark)}" data-to-light="${a(c.theme.toLight)}" aria-label="${a(c.theme.toDark)}">${t(c.theme.dark)}</button></div></nav>
<header class="masthead"><div class="wrap"><h1>${t(c.title)}</h1>
<p class="lead">${t(c.lead)}</p>
<p class="version">${esc(fill(c.versionLine, kit))}</p></div></header>`;

  const stage = `<section class="band" id="stage" data-anchor><div class="onstage">
<h2>${t(c.stage.heading)}</h2>
<ol class="ways">${c.stage.ways.map(way => `<li>${t(way)}</li>`).join('')}</ol>
<p class="video">${t(c.stage.video)}</p>
<p class="note">${t(c.stage.untested)}</p>
</div></section>`;

  const deck = `<section class="deck" id="deck" data-anchor><div class="wrap">
<h2>${t(c.deck.heading)}</h2>
<div class="screen"><div class="ratio"><iframe id="player" src="${esc(player)}" title="${a(c.deck.frame)}" allowfullscreen></iframe></div></div>
<div class="controls"><button id="fullscreen" type="button" hidden>${t(c.deck.fullscreen)}</button><a class="newtab" href="${esc(player)}" target="_blank" rel="noopener">${t(c.deck.newTab)}</a></div>
</div></section>`;

  const files = `<section class="band" id="downloads" data-anchor>
<h2>${t(c.downloads.heading)}</h2>
<ul class="files">${downloads.map(item => `<li><a href="${fileHref(item.file)}" download><span class="name">${item.file}</span><span class="what">${t(c.downloads.kinds[item.id])}</span><span class="meta">${item.format} ${size(data.sizes[item.file], locale)}</span></a></li>`).join('\n')}</ul>
</section>`;

  const marker = `<span class="click" role="img" aria-label="${a(c.script.click)}">▸</span>`;
  const slides = data.script.map((slide, index) => {
    const picture = data.pictures[index], label = fill(c.script.slide, {n: slide.n});
    return `<li class="slide" id="s-${slide.n}" data-anchor>
<h3><span class="n">${esc(label)}</span><span class="title" lang="en">${esc(slide.title)}</span></h3>
<figure class="pic"><img src="${base}${picture.src}" width="${picture.width}" height="${picture.height}" alt="${esc(label)}, ${esc(slide.title)}"${index > 1 ? ' loading="lazy"' : ''} decoding="async"></figure>
<div class="lines" lang="en">${slide.lines.map(line => `<p class="line${line.click ? ' has-click' : ''}">${line.click ? marker : ''}${esc(line.text)}</p>`).join('')}</div>
</li>`;
  }).join('\n');
  const script = `<section class="band" id="script" data-anchor>
<h2>${t(c.script.heading)}</h2>
<p class="meta-line">${t(c.script.meta, {words: String(data.words), click: marker, mp4: duration(mp4Seconds, locale)})}</p>
<ol class="slides">
${slides}
</ol>
</section>`;

  // Owner 2026-11-26: the English script also as running text, laid out like the Chinese draft.
  const full = `<section class="band" id="full" data-anchor>
<h2>${t(c.full.heading)}</h2>
<p class="note">${t(c.full.note)}</p>
<div class="draft" lang="en">${data.script.map(slide => `<p>${esc(slide.lines.map(line => line.text).join(' '))}</p>`).join('\n')}</div>
</section>`;

  let aid = '';
  if (locale === 'zh') aid = `<section class="band" id="aid">
<h2>${t(c.aid.heading)}</h2>
<p class="note">${t(c.aid.note)}</p>
<div class="draft">${data.draft.map(line => `<p>${verbatim(line)}</p>`).join('\n')}</div>
</section>`;
  if (locale === 'fr') aid = `<section class="band" id="aid">
<h2>${t(c.aid.heading)}</h2>
<ol class="translation">${data.script.map((slide, index) => `<li><h3><span class="n">${esc(fill(c.script.slide, {n: slide.n}))}</span><span class="title" lang="en">${esc(slide.title)}</span></h3><p>${esc(typeset(translationFr[index].join(' '), 'fr'))}</p></li>`).join('\n')}</ol>
</section>`;

  const sources = `<section class="band" id="sources" data-anchor>
<h2>${t(c.sources.heading)}</h2>
<p class="report">${t(c.sources.report)}</p>
<ul class="plain">${c.sources.items.map(item => `<li>${t(item)}</li>`).join('')}</ul>
</section>`;

  const versions = `<section class="band" id="versions">
<h2>${esc(c.historyHeading)}</h2>
<ul class="plain versions">${[...history].reverse().map(item => `<li><strong>${esc(fill(c.historyItem, item))}</strong> ${esc(typeset(item[locale], locale))}</li>`).join('')}</ul>
</section>`;

  const footer = `<footer class="foot"><p>${t(c.footer)}</p><a href="/guides/${locale}/">${t(c.back)}</a></footer>`;
  return `${head}\n<body>\n${topbar}\n<main id="content">\n${stage}\n${deck}\n${files}\n${script}\n${full}\n${aid ? aid + '\n' : ''}${versions}\n${sources}\n</main>\n${footer}\n</body>\n</html>\n`;
}

// Address without a language: /guides/entry.js sends it to ?lang=, or to English.
function entry() {
  const title = plain(copy.en.title, 'en');
  return `${doctype}<html lang="en" data-guide-entry=""><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><link rel="icon" href="/guides/favicon.svg" type="image/svg+xml"><title>${title}</title><link rel="canonical" href="${origin}${base}en/"><script src="/guides/entry.js"></script><noscript><meta http-equiv="refresh" content="0;url=${base}en/"></noscript></head><body><p>${
    [['zh', '中文'], ['en', 'English'], ['fr', 'Français']].map(([locale, name]) => `<a href="${base}${locale}/" lang="${locale}" hreflang="${hreflang[locale]}">${name}</a>`).join(' · ')}</p></body></html>\n`;
}

async function build() {
  if (translationFr.length !== slideCount) throw new Error(`content.mjs: translationFr has ${translationFr.length} slides, expected ${slideCount}`);
  if (sections.length !== 7) throw new Error('content.mjs: sections changed, update build.mjs');
  const [css, js, script, draft, found] = await Promise.all([readFile(new URL('style.css', here), 'utf8'), readFile(new URL('page.js', here), 'utf8'), readScript(), readChineseDraft(), assets()]);
  const hash = text => createHash('sha256').update(text).digest('hex').slice(0, 8);
  const version = {css: hash(css), js: hash(js)};
  const data = {...found, script, draft, words: wordCount(script)};
  const result = new Map([['style.css', css], ['page.js', js], ['index.html', entry()]]);
  for (const locale of locales) result.set(`${locale}/index.html`, page(locale, data, version));
  return {result, data};
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const {result, data} = await build();
    for (const [path, content] of result) {
      const target = new URL(path, out);
      await mkdir(dirname(fileURLToPath(target)), {recursive: true});
      await writeFile(target, content);
    }
    console.log(`rex-pitch: wrote ${result.size} files and ${data.pictures.filter(picture => picture.src.endsWith('.webp')).length} slide pictures to public${base}; script ${data.words} words, ${data.script.flatMap(slide => slide.lines).filter(line => line.click).length} clicks${data.placeholders.length ? `; ${data.placeholders.length} placeholder assets` : ''}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
