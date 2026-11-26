// Builds the Claude 3D guide in Chinese, English and French from one catalogue.
// Run from the repository root: node resources/claude-3d/build.mjs
// Text lives in locales/{zh,en,fr}.mjs (zh tool and case entries in catalog.mjs); the English and French
// prompts are in prompts/. Media, guide.css, guide.js and entry.js are shared by the three languages.
// scripts/tests/claude-3d.mjs imports `files` to check that public/ holds exactly what this file generates.
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {tools, cases, categories, caseTypes, urls} from './catalog.mjs';
import zh from './locales/zh.mjs';
import en from './locales/en.mjs';
import fr from './locales/fr.mjs';

const origin = 'https://zhaoyang.fr';
const base = '/guides/claude-3d/';
const output = new URL('../../public' + base, import.meta.url);
const assetVersion = '2';
const slugs = ['', 'tools', 'cases', 'estimate', 'handbook'];
const languages = [['zh', 'zh-Hans', '中文', '中文'], ['en', 'en', 'EN', 'English'], ['fr', 'fr', 'FR', 'Français']];

const esc = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const toolId = name => name.toLowerCase().replaceAll(/[^a-z0-9]+/g,'-').replace(/-$/, '');
const link = (href,label) => `<a href="${esc(href)}">${esc(label)}</a>`;
const options = items => Object.entries(items).map(([key,value]) => `<option value="${key}">${esc(value)}</option>`).join('');
const src = name => base + 'media/' + name;
const pagePath = (locale,slug) => base + locale + '/' + (slug ? slug + '/' : '');
const fill = (template,values) => template.replace(/\{(\w+)\}/g, (match,key) => values[key]);

// Typography applied to the written text, so the locale files can be typed with plain spaces and apostrophes.
const apostrophes = text => text.replace(/(?<=\p{L})'(?=\p{L}|\s|[.,;:)]|$)/gu, '’');
const french = text => apostrophes(text)
  .replace(/« /g, '«\u00a0').replace(/ »/g, '\u00a0»')
  .replace(/(?<=\S|^) (?=[;!?])/g, '\u202f')
  .replace(/(?<=\S|^) (?=:(?:\s|$))/g, '\u00a0')
  .replace(/(?<=[\d}]) (?=[\p{L}€$%°])/gu, '\u00a0');
const typography = {zh: text => text, en: apostrophes, fr: french};
function mapText(value,change) {
  if (typeof value === 'string') return change(value);
  if (Array.isArray(value)) return value.map(item => mapText(item,change));
  return Object.fromEntries(Object.entries(value).map(([key,item]) => [key,mapText(item,change)]));
}

// A translation must have the same entries as the Chinese source. Plural forms may differ by language.
const pluralKeys = new Set(['zero','one','two','few','many','other']);
const isPlural = value => typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length > 0 && Object.keys(value).every(key => pluralKeys.has(key));
function sameShape(source,target,where) {
  if (typeof source === 'string') {
    if (typeof target !== 'string' || (source !== '' && target === '')) throw new Error(`Missing text: ${where}`);
    return;
  }
  if (target === undefined || target === null || typeof target !== 'object') throw new Error(`Missing entry: ${where}`);
  if (isPlural(source)) { if (!isPlural(target) || !target.other) throw new Error(`Missing plural form: ${where}`); return; }
  const sourceKeys = Object.keys(source).sort(), targetKeys = Object.keys(target).sort();
  if (sourceKeys.join() !== targetKeys.join()) throw new Error(`Different entries at ${where}: ${sourceKeys} / ${targetKeys}`);
  for (const key of sourceKeys) sameShape(source[key],target[key],`${where}.${key}`);
}
const zhCatalog = {
  categories, caseTypes,
  tools: Object.fromEntries(tools.map(([name,,,use,limit,setup]) => [name,[use,limit,setup]])),
  cases: cases.map(([name,,,description]) => [name,description])
};
const locales = {};
for (const [code,source] of [['zh',{...zh,catalog:zhCatalog}],['en',en],['fr',fr]]) {
  sameShape({...zh,catalog:zhCatalog},source,code);
  locales[code] = mapText(source,typography[code]);
}

// Generated files, by path under public/guides/claude-3d/.
export const files = new Map();

// The Chinese prompt is the original and stays where readers already download it.
const kit = {zh: await readFile(new URL('developer-kit-prompt.txt',output),'utf8')};
const kitFile = {zh: 'developer-kit-prompt.txt'};
for (const code of ['en','fr']) {
  kitFile[code] = `developer-kit-prompt.${code}.txt`;
  kit[code] = typography[code](await readFile(new URL('prompts/' + kitFile[code],import.meta.url),'utf8'));
  files.set(kitFile[code],kit[code]);
}

const calculators = [
  ['render','three',[['seconds',20,0.001],['fps',24,0.001],['per',10,0.001]],urls.frames],
  ['quota','three',[['percent',8,0.001,100],['tested',2,1],['shots',5,1]],urls.limits],
  ['api','two',[['input',500000,0],['output',50000,0],['inprice','',0],['outprice','',0]],urls.pricing]
];
const referenceUrls = [urls.frames,urls.threeCanvas,urls.ffmpeg,urls.poly,urls.limits,urls.pricing,'https://platform.claude.com/docs/en/models/overview'];

function home({t,path}) {
  const h = t.home;
  return `<section class="cover">
    <div class="cover-copy"><h1>${h.h1}</h1>
      <p>${esc(h.intro)}</p>
      <div class="actions">${download(t)}<a class="text-link" href="${path('cases')}#studio">${esc(h.sample)}</a></div>
    </div>
    <figure class="viewer"><img id="study" src="${src('studio.webp')}" width="1100" height="724" fetchpriority="high" alt="${esc(h.alt)}">
      <figcaption><span>${esc(t.common.study)}</span><div class="segmented only-js" aria-label="${esc(h.viewsLabel)}" role="group">
      ${Object.entries(h.views).map(([key,label],i)=>`<button type="button" data-view="${key}" aria-pressed="${i===0}">${esc(label)}</button>`).join('')}</div></figcaption>
    </figure>
  </section>
  <section class="section"><h2>${esc(h.routesTitle)}</h2>
    <div class="route-layout"><div class="route-options" aria-label="${esc(h.routesLabel)}">
    ${Object.entries(h.routes).map(([key,route],i)=>`<a href="#route-${key}" data-route="${key}" ${i===0?'aria-current="true"':''}>${esc(route[0])}<span class="chevron" aria-hidden="true"></span></a>`).join('')}</div>
    <div class="route-reading">${Object.entries(h.routes).map(([key,route])=>`<article id="route-${key}"><h3>${esc(route[1])}</h3><p>${esc(route[2])}</p><a class="text-link" href="${path('tools')}?category=${key}">${esc(h.related)}</a></article>`).join('')}
    <details class="adviser only-js"><summary>${esc(h.adviser)}</summary>
    <div class="fields two"><label>${esc(h.subject)}<select id="subject">${options(h.subjects)}</select></label>
    <label>${esc(h.machine)}<select id="machine">${options(h.machines)}</select></label></div><p id="advice" role="status"></p></details></div></div>
  </section>`;
}
function download(t) {
  return `<a class="button primary" href="${src('twin-66.blend')}" download>${esc(t.common.download)}</a>`;
}
function toolsPage({t}) {
  const c = t.tools, text = t.catalog;
  return `<header class="page-title"><h1>${esc(t.pages.tools.title)}</h1></header>
  <div class="toolbar only-js"><label>${esc(c.search)}<input type="search" id="search" placeholder="${esc(c.searchPlaceholder)}"></label>
  <label>${esc(c.category)}<select id="category">${options({all:c.allCategories,...text.categories})}</select></label><a class="button" href="#comparison">${esc(c.viewComparison)}<span id="picked"></span></a></div>
  <p id="found" class="status only-js" role="status"></p>
  <div id="tools-list" class="catalog">${tools.map(([name,category,key])=>{
    const [use,limit,setup] = text.tools[name];
    return `
    <article data-category="${category}" data-tool="${toolId(name)}">
      <div class="tool-description"><h2>${link(urls[key],name)}</h2><p>${esc(use)}</p></div><span class="type">${esc(text.categories[category])}</span>
      <label class="compare-choice only-js"><input type="checkbox" value="${toolId(name)}" aria-label="${esc(fill(c.compareAria,{name}))}">${esc(c.compare)}</label>
      <details><summary>${esc(c.details)}</summary><dl><dt>${esc(c.limit)}</dt><dd data-limit>${esc(limit)}</dd><dt>${esc(c.setup)}</dt><dd data-setup>${esc(setup)}</dd></dl></details>
    </article>`;}).join('')}</div><div id="no-tools" hidden><p>${esc(c.none)}</p><button id="reset-filter" type="button">${esc(c.reset)}</button></div>
  <section class="section only-js" id="comparison" tabindex="-1"><div class="section-head"><h2>${esc(c.selected)}</h2><button type="button" class="quiet" id="clear" hidden>${esc(c.clear)}</button></div><p class="status" id="compare-hint">${esc(c.hint)}</p><div id="compare-table"></div></section><a href="#comparison" id="compare-shortcut" class="button primary" hidden>${esc(c.viewComparison)}</a>`;
}
function casesPage({t}) {
  const c = t.cases, text = t.catalog;
  return `<header class="page-title"><h1>${esc(t.pages.cases.title)}</h1></header>
  <section class="sample" id="studio"><video playsinline controls preload="none" width="720" height="474" aria-label="${esc(c.videoLabel)}" poster="${src('studio.webp')}" src="${src('twin-66.mp4')}"></video>
  <div><h2>${esc(t.common.study)}</h2><p class="spec">${esc(c.spec)}</p>
  <p>${esc(c.text)}</p>
  <div class="actions">${download(t)}${link(src('twin-66.mp4'),c.openVideo)}</div><details class="shot-exercise"><summary>${esc(c.exercise)}</summary><p>${esc(c.exerciseIntro)}</p><pre>${esc(c.exercisePrompt)}</pre></details></div></section>
  <section class="section"><div class="section-head"><h2>${esc(c.worksTitle)}</h2><label class="inline-label only-js">${esc(c.type)}<select id="case-type">${options({all:c.allTypes,...text.caseTypes})}</select></label></div>
  <div class="works">${cases.map(([,type,author,,url],i)=>{
    const [name,description] = text.cases[i];
    return `<article data-case="${type}"><div><span class="byline">${esc(author)}</span><h3>${link(url,name)}</h3></div><p>${esc(description)}</p><span class="type">${esc(text.caseTypes[type])}</span></article>`;}).join('')}</div></section>`;
}
function estimate({t}) {
  const c = t.estimate;
  return `<header class="page-title"><h1>${esc(t.pages.estimate.title)}</h1></header><div class="desk-layout"><nav class="section-index" aria-label="${esc(c.index)}">${calculators.map(([key])=>link('#'+key,c.calculators[key].title)).join('')}</nav><div>${calculators.map(([key,columns,fields,url])=>{
    const copy = c.calculators[key];
    return `<section class="worksheet" id="${key}"><h2>${esc(copy.title)}</h2><p>${esc(copy.intro)}</p>
    <div class="fields ${columns}">${fields.map(([id,value,min,max])=>`<label>${esc(copy.fields[id])}<input type="number" id="${id}" min="${min}" ${max?'max="'+max+'"':''} step="${['tested','shots','input','output'].includes(id)?'1':'any'}" value="${value}" ${value===''?'placeholder="'+esc(c.pricePlaceholder)+'"':''} required></label>`).join('')}</div>
    <output class="only-js" id="${key}-result" aria-live="polite"></output><p class="formula">${esc(copy.note)}</p>${link(url,copy.source)}</section>`;}).join('')}</div></div>`;
}
function handbook({t,path,locale}) {
  const c = t.handbook;
  const elsewhere = fill(esc(c.elsewhere),{tools:link(path('tools'),t.pages.tools.title),cases:link(path('cases'),t.pages.cases.title)});
  return `<header class="page-title"><h1>${esc(t.pages.handbook.title)}</h1></header><div class="desk-layout"><nav class="section-index" aria-label="${esc(c.index)}">${[['#workflow',c.workflow],['#prompt',c.prompt],['#sources',c.sources]].map(pair=>link(...pair)).join('')}</nav><div>
  <section class="chapter" id="workflow"><h2>${esc(c.workflow)}</h2><ol class="steps">${c.steps.map(([title,description])=>`<li><h3>${esc(title)}</h3><p>${esc(description)}</p></li>`).join('')}</ol>
  <details><summary>${esc(c.assemble)}</summary><p>${esc(c.assembleText)}</p><pre><code>ffmpeg -framerate 24 -start_number 1 -i frames/twin-%04d.png -c:v libx264 -pix_fmt yuv420p twin.mp4</code></pre>${link(urls.ffmpeg,c.ffmpegDocs)}</details></section>
  <aside class="model-note"><h3>${esc(c.modelsTitle)}</h3><p>${esc(c.modelsText)}</p></aside>
  <section class="chapter" id="prompt"><h2>${esc(c.prompt)}</h2><p>${esc(c.promptIntro)}</p><div class="only-js"><div class="fields two">${c.brief.map(([label,example])=>`<label>${esc(label)}<input data-brief="${esc(label)}" placeholder="${esc(example)}"></label>`).join('')}</div>
  <div class="actions"><button class="button primary" id="copy" type="button">${esc(c.copy)}</button><button class="button" id="download" type="button">${esc(c.download)}</button></div><p id="copy-status" role="status"></p></div>
  <details id="prompt-details"><summary>${esc(c.fullPrompt)}</summary><pre id="prompt-text">${esc(kit[locale])}</pre></details><a href="${base}${kitFile[locale]}" download>${esc(c.original)}</a></section>
  <section class="chapter" id="sources"><h2>${esc(c.sources)}</h2><div class="references">${referenceUrls.map((url,i)=>`<div>${link(url,c.references[i])}<span>${new URL(url).hostname}</span></div>`).join('')}</div>
  <p>${elsewhere}</p></section></div></div>`;
}

const contents = [['home',home],['tools',toolsPage],['cases',casesPage],['estimate',estimate],['handbook',handbook]];
const pageTitle = (t,name) => name === 'home' ? t.title : t.pages[name].title + t.titleJoin + t.title;

for (const [locale] of languages) {
  const t = locales[locale], c = t.chrome;
  const path = slug => pagePath(locale,slug);
  for (const [index,slug] of slugs.entries()) {
    const [name,render] = contents[index];
    const title = pageTitle(t,name);
    const description = (name === 'home' ? '' : t.pages[name].title + t.descriptionJoin) + t.description;
    // guide.js reads its text from this block. The cover's first image description is the one already on the page.
    const runtime = {...t.runtime.common,...t.runtime[name]};
    if (name === 'home') runtime.views = {studio:t.home.alt,...runtime.views};
    files.set(locale + '/' + (slug ? slug + '/' : '') + 'index.html',`<!doctype html>
<html lang="${t.htmlLang}" data-locale="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title>
<meta name="description" content="${esc(description)}"><link rel="canonical" href="${origin}${path(slug)}">
${languages.map(([code,hreflang])=>`<link rel="alternate" hreflang="${hreflang}" href="${origin}${pagePath(code,slug)}">`).join('')}<link rel="alternate" hreflang="x-default" href="${origin}${pagePath('en',slug)}">
<link rel="icon" href="${base}media/studio.webp" type="image/webp"><meta property="og:title" content="${esc(title)}"><meta property="og:image" content="${origin}${src('studio.webp')}">
<script src="/guides/theme.js?v=20260924c"></script><link rel="stylesheet" href="${base}guide.css?v=${assetVersion}"><script defer src="${base}guide.js?v=${assetVersion}"></script></head>
<body><a class="skip" href="#main">${esc(c.skip)}</a><header class="mast"><div class="mast-inner"><div class="identity"><a id="all-guides" href="/guides/${locale}/"><span class="hub-arrow" aria-hidden="true">←</span><span class="hub-label">${esc(c.hub)}</span></a><span aria-hidden="true">/</span><a class="brand" href="${path('')}">${esc(c.brand)}</a></div><nav class="main-nav" aria-label="${esc(c.nav)}">${slugs.map((item,i)=>`<a href="${path(item)}" ${item===slug?'aria-current="page"':''}>${esc(t.pages[contents[i][0]].nav)}</a>`).join('')}</nav>
<div class="mast-tools"><div class="languages" aria-label="${esc(c.languages)}">${languages.map(([code,hreflang,label])=>`<a href="${pagePath(code,slug)}" lang="${code}" hreflang="${hreflang}" data-language="${code}" ${code===locale?'aria-current="page"':''}>${label}</a>`).join('')}</div><button id="theme" class="only-js" type="button" aria-label="${esc(c.theme)}"><span aria-hidden="true" class="theme-symbol"></span><span id="theme-label">${esc(c.themeLabel)}</span></button></div></div></header>
<main id="main" class="shell">${render({t,path,locale})}</main><footer class="shell foot"><a href="${path('')}">${esc(t.title)}</a><a href="${path('handbook')}#sources">${esc(c.references)}</a></footer>
<script type="application/json" id="guide-copy">${JSON.stringify(runtime).replaceAll('<','\\u003c')}</script></body></html>\n`);
  }
}

// The addresses used before the guide had languages. entry.js sends them to a language, English by default.
for (const [index,slug] of slugs.entries()) {
  files.set((slug ? slug + '/' : '') + 'index.html',`<!doctype html><html lang="en" data-guide-entry="${slug ? slug + '/' : ''}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><link rel="icon" href="${base}media/studio.webp" type="image/webp"><title>${esc(pageTitle(locales.en,contents[index][0]))}</title><link rel="canonical" href="${origin}${pagePath('en',slug)}"><script src="${base}entry.js?v=${assetVersion}"></script><noscript><meta http-equiv="refresh" content="0;url=${pagePath('en',slug)}"></noscript></head><body><p>${languages.map(([code,hreflang,,name])=>`<a href="${pagePath(code,slug)}" lang="${code}" hreflang="${hreflang}">${name}</a>`).join(' · ')}</p></body></html>\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  for (const [path,content] of files) {
    const target = new URL(path,output);
    await mkdir(new URL('.',target),{recursive:true});
    await writeFile(target,content);
  }
  console.log(`Built ${languages.length * slugs.length} Claude 3D guide pages in ${languages.length} languages, ${slugs.length} entry pages and 2 translated prompts.`);
}
