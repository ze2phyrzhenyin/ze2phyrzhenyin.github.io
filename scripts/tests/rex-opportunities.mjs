import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { render, languages, cjk, frenchSpacing } from '../../resources/rex-opportunities/build.mjs';
import { locales, issue } from '../../resources/rex-opportunities/locales.mjs';
const root = new URL('../../public/guides/rex-opportunities/',import.meta.url);
const read = path => readFile(new URL(path,root),'utf8');
const site = 'https://zhaoyang.fr/guides/rex-opportunities/';
const data=JSON.parse(await read('events.json')), prompt=await read('prompt.txt');
const memory=JSON.parse(await readFile(new URL('../../resources/rex-opportunities/translations.json',import.meta.url),'utf8'));
const html=await read('zh/index.html'), report=await read('report.md');

// Source data.
const ids=new Set();
for(const e of data.events) {
  assert(!ids.has(e.id),`duplicate ${e.id}`);ids.add(e.id);
  assert(e.country && e.sectors.length && e.sources.length,`missing metadata ${e.id}`);
  assert(['A','B','C','A/B'].includes(e.priority));
  if(e.date) assert(e.date>=data.period[0] && e.date<=data.period[1],`outside coverage ${e.id}`);
  assert(html.includes(`id="${e.id}"`) && report.includes(e.name),`missing output ${e.id}`);
  for(const [,url] of e.sources) assert.equal(new URL(url).protocol,'https:');
}
for(const n of data.notices) {
  assert(ids.has(n.event),`unknown reminder ${n.event}`);
  assert(!isNaN(Date.parse(n.date)),`invalid reminder date ${n.date}`);
}
const byID=Object.fromEntries(data.events.map(e=>[e.id,e]));
assert.equal(byID.medfel.priority,'A/B');
assert(byID['tech-retail'].fee.includes('330 € TTC'));
assert(data.notices.every(n => n.date >= data.revisedDate));
assert.equal(byID.frames.deadline,'2026-11-17');
assert.equal(byID.ise.deadline,'2027-02-02');
assert(byID.ise.eligibility.includes('VAT') && byID.ise.eligibility.includes('一般受托软件开发'));
assert(byID.engage.eligibility.includes('不是 REX 股东'));
assert(byID['startup-world'].fee.includes('税别不明确'));
assert(byID.sitl.status.includes('待开放'));
assert(!prompt.includes('约 300 公里') && prompt.includes('荷兰'));
assert(html.includes('2026.11.16') && report.includes('2027-05-16'));
const archive=JSON.parse(await read('archive/2026-11-15/events.json'));
assert.equal(archive.reportDate,'2026-11-15');
assert((await read('archive/2026-11-15/prompt.txt')).includes('约 300 公里'));

// The published files are exactly what the generator writes from the current sources.
const built=await render();
assert.deepEqual(built.problems,[],'generator problems');
assert.deepEqual(built.unused,[],'translations.json holds strings that events.json no longer uses');
for(const [path,content] of built.files) assert.equal(await read(path),content,`${path} is stale: run node resources/rex-opportunities/build.mjs`);

// Translation memory: complete, no Chinese left, amounts and times carried over.
const numbers=(text,lang)=>{
  const euro=lang==='en'?/€\s?(\d[\d,]*(?:\.\d+)?)/g:lang==='fr'?/(\d[\d\u202f\u00a0 ]*(?:,\d+)?)[\u202f\u00a0 ]?€/g:/(\d[\d,]*(?:\.\d+)?)\s*€/g;
  const amount=raw=>lang==='fr'?Number(raw.replace(/[\u202f\u00a0 ]/g,'').replace(',','.')):Number(raw.replaceAll(',',''));
  return {euro:[...text.matchAll(euro)].map(m=>amount(m[1])),percent:[...text.matchAll(/(\d+)[\u202f\u00a0 ]?%/g)].map(m=>Number(m[1])),time:[...text.matchAll(/\b\d{2}:\d{2}(?::\d{2})?\b/g)].map(m=>m[0])};
};
const carried=(source,target,where)=>{for(const kind of ['euro','percent','time']){const left=[...target[kind]];for(const value of source[kind]){const at=left.indexOf(value);assert(at>=0,`${where}: ${kind} ${value} missing`);left.splice(at,1);}}};
for(const entry of memory.strings) for(const lang of ['en','fr']) {
  assert(entry[lang]?.trim(),`translations.json: empty ${lang} for ${entry.at}`);
  assert(!cjk.test(entry[lang]),`translations.json: Chinese left in ${lang} for ${entry.at}`);
  carried(numbers(entry.zh,'zh'),numbers(entry[lang],lang),`translations.json ${entry.at} ${lang}`);
}
for(const [group,rows] of Object.entries(memory.terms)) for(const row of rows) for(const lang of ['en','fr']) assert(row.key && row[lang] && !cjk.test(row[lang]),`terms.${group}.${row.zh}`);
for(const group of ['actions','plans','conflicts','materials','archive']) for(const [index,item] of issue[group].entries()) {
  for(const lang of languages) assert.equal(item[lang].length,item.zh.length,`issue.${group}[${index}].${lang}`);
  for(const lang of ['en','fr']) item.zh.forEach((source,part)=>carried(numbers(source,'zh'),numbers(item[lang][part],lang),`issue.${group}[${index}].${lang}`));
}

// Interface text: the three languages define the same keys, and nothing is left in Chinese.
const shape=(value,path='ui')=>typeof value==='function'?[`${path}()`]:Array.isArray(value)?value.flatMap((item,index)=>shape(item,`${path}[${index}]`)):value&&typeof value==='object'?Object.entries(value).flatMap(([key,item])=>shape(item,`${path}.${key}`)):[path];
const leaves=(value)=>typeof value==='string'?[value]:Array.isArray(value)?value.flatMap(leaves):value&&typeof value==='object'?Object.values(value).flatMap(leaves):[];
for(const lang of ['en','fr']) {
  assert.deepEqual(shape(locales[lang].ui),shape(locales.zh.ui),`${lang}: interface keys differ from zh`);
  assert.deepEqual(Object.keys(locales[lang].date),Object.keys(locales.zh.date));
  for(const value of leaves(locales[lang].ui)) assert(!cjk.test(value),`${lang} interface text still in Chinese: ${value}`);
  for(const key of ['promptOriginal','chineseOnly']) assert(locales[lang].ui[key],`${lang}.${key} must label the Chinese-only files`);
}

// Rendered pages and reports.
const attr=(source,name)=>[...source.matchAll(new RegExp(`\\b${name}="([^"]*)"`,'g'))].map(m=>m[1]);
const eventTags=source=>[...source.matchAll(/<details class="event"[^>]*>/g)].map(m=>m[0]);
const strip=source=>source.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replace(/<[^>]+>/g,'\n').replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&quot;','"');
const sourceURLs=data.events.flatMap(e=>e.sources.map(([,url])=>url));
const pages={},reports={},prompts={zh:prompt};
for(const lang of languages) {
  const page=pages[lang]=await read(`${lang}/index.html`), text=reports[lang]=await read(lang==='zh'?'report.md':`report.${lang}.md`);
  if(lang!=='zh') prompts[lang]=await read(`prompt.${lang}.txt`);
  const tags=eventTags(page);
  assert.deepEqual(tags.map(tag=>attr(tag,'id')[0]),data.events.map(e=>e.id),`${lang}: event ids`);
  assert.deepEqual(tags.map(tag=>attr(tag,'data-date')[0]),data.events.map(e=>/^\d{4}-\d{2}-\d{2}$/.test(e.date??'')?e.date:''),`${lang}: event dates`);
  assert.deepEqual(tags.map(tag=>attr(tag,'data-deadline')[0]),data.events.map(e=>e.deadline),`${lang}: deadlines`);
  assert.deepEqual(tags.map(tag=>attr(tag,'data-priority')[0]),data.events.map(e=>e.priority),`${lang}: priorities`);
  assert.deepEqual([...page.matchAll(/<a href="(https:[^"]+)" target="_blank"/g)].map(m=>m[1].replaceAll('&amp;','&')),sourceURLs,`${lang}: source links`);
  const notices=[...page.matchAll(/<li data-days="(-?\d+)"><time datetime="([^"]+)"><strong>[^<]+<\/strong>(?:<small>([^<]+)<\/small>)?<\/time><div><a href="#([^"]+)">/g)];
  assert.deepEqual(notices.map(m=>[m[2],m[3],m[4]]),data.notices.map(n=>[n.date,n.time,n.event]),`${lang}: notices`);
  for(const key of ['data-city','data-country','data-sectors','data-goals','data-update','data-days']) assert.deepEqual(attr(page,key),attr(pages.zh,key),`${lang}: ${key}`);
  for(const select of ['country','sector','goal','city','priority','month']) {
    const values=source=>attr(source.match(new RegExp(`<select id="${select}">.*?</select>`))[0],'value');
    assert.deepEqual(values(page),values(pages.zh),`${lang}: ${select} filter values`);
  }
  // Head, navigation and local files.
  assert(page.includes(`<html lang="${locales[lang].htmlLang}" data-guide="rex-opportunities" data-locale="${lang}">`),`${lang}: html lang`);
  assert(page.includes(`<link rel="canonical" href="${site}${lang}/">`)&&page.includes(`<meta property="og:url" content="${site}${lang}/">`),`${lang}: canonical`);
  for(const [code,target] of [['zh-Hans','zh'],['en','en'],['fr','fr'],['x-default','en']]) assert(page.includes(`<link rel="alternate" hreflang="${code}" href="${site}${target}/">`),`${lang}: alternate ${code}`);
  assert(page.includes(`<a class="back-link" href="/guides/${lang}/">`),`${lang}: return link`);
  for(const other of languages) assert(page.includes(`<a href="../${other}/" lang="${other}" hreflang="${locales[other].hreflang}" data-language="${other}"${other===lang?' aria-current="page"':''}>`),`${lang}: language link ${other}`);
  for(const match of page.matchAll(/href="#([^"]+)"/g)) assert(page.includes(`id="${match[1]}"`),`${lang}: broken anchor ${match[1]}`);
  for(const match of page.matchAll(/(?:href|src)="(\.\.\/[^"?#]*)/g)) await access(new URL(match[1],new URL(`${lang}/`,root))).catch(()=>{throw new Error(`${lang}: missing ${match[1]}`)});
  assert(!/&(?!amp;|lt;|gt;|quot;)/.test(page.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'')),`${lang}: unescaped ampersand`);
  assert.equal(strip(page.match(/<pre id="prompt-text"[^>]*>([\s\S]*?)<\/pre>/)[1]),prompts[lang],`${lang}: embedded prompt equals the download`);
  // Report: same records, links and reminder dates; anchors point at the page of the same language.
  for(const url of sourceURLs) assert(text.includes(`(${url})`),`${lang} report: ${url}`);
  for(const n of data.notices) assert(text.includes(`- ${n.date}${n.time?' '+n.time:''} · `)&&text.includes(`(${site}${lang}/#${n.event})`),`${lang} report: reminder ${n.event}`);
  assert.equal(text.match(/^### /gm).length,data.events.length+issue.materials.length,`${lang} report: record count`);
  assert(text.includes(data.period[1])&&text.endsWith(prompts[lang]),`${lang} report: period and prompt`);
}
// English and French: no Chinese left except the language switch; Chinese-only files are labelled.
for(const lang of ['en','fr']) {
  const ui=locales[lang].ui, page=pages[lang];
  const visible=page.replaceAll(`data-language="zh">${locales.zh.languageName}</a>`,'data-language="zh"></a>');
  for(const [name,text] of [['page',visible],['report',reports[lang]],['prompt',prompts[lang]]]) {
    const leak=text.match(new RegExp(`.{0,40}${cjk.source}.{0,40}`,'u'));
    assert(!leak,`${lang} ${name}: Chinese left: ${leak?.[0]}`);
  }
  const translated=id=>memory.strings.find(entry=>entry.zh===byID[id].name)[lang];
  for(const e of data.events) assert(reports[lang].includes(`### ${cjk.test(e.name)?frenchSpacing(translated(e.id)):e.name}\n`),`${lang} report: ${e.id}`);
  assert.equal([...page.matchAll(/<a href="\.\.\/archive\/[^"]+" download hreflang="zh-Hans">[^<]+<\/a>/g)].filter(m=>m[0].includes(ui.chineseOnly)).length,issue.archive.filter(row=>!row.current).length,`${lang}: archive links say Chinese only`);
  assert(page.includes(`<a href="../prompt.txt" download hreflang="zh-Hans">`)&&page.includes(`href="../prompt.${lang}.txt"`)&&page.includes(`href="../report.${lang}.md"`),`${lang}: downloads`);
  assert(reports[lang].includes(`${site}archive/2026-11-16/report.md`),`${lang} report: link to the original`);
}
const translation=(id,field,lang)=>memory.strings.find(entry=>entry.zh===byID[id][field])[lang];
assert(translation('engage','eligibility','en').includes('not currently a REX shareholder')&&translation('engage','eligibility','fr').includes('pas actionnaire de REX'));
assert(translation('ise','eligibility','en').includes('VAT number')&&translation('ise','eligibility','fr').includes('numéro de TVA'));
assert(pages.en.includes('€330 incl. VAT')&&pages.fr.includes('330\u202f€ TTC'));
// French typography in what the reader sees: no-break spaces before ; : ? ! and inside « », 1 234,5 €.
for(const [name,text] of [['page',strip(pages.fr)],['report',reports.fr],['prompt',prompts.fr]]) {
  const prose=text.replace(/https?:\/\/[^\s)]+/g,'').replace(/\S+@\S+/g,'');
  for(const [rule,pattern] of [['; ? !',/[^\u202f][;?!]/u],[':',/[^\u00a0\d]:(?!\d)/u],['«',/«[^\u00a0]/u],['»',/[^\u00a0]»/u],['€ and %',/\d[ ]?[€%]/u],['thousands',/\d[, ]\d{3}(?!\d)/u]]) {
    const hit=prose.match(new RegExp(`.{0,30}${pattern.source}.{0,10}`,'u'));
    assert(!hit,`fr ${name}: spacing before ${rule}: ${JSON.stringify(hit?.[0])}`);
  }
}
assert(!/\d\s?€/.test(strip(pages.en))&&!/\d\s?€/.test(reports.en),'en: the euro sign goes before the amount');

// Legacy root URL and saved filter links.
const entry=await read('index.html');
assert(entry.includes('<script src="/guides/entry.js"></script>')&&entry.includes('<meta name="robots" content="noindex,follow">')&&entry.includes(`<link rel="canonical" href="${site}en/">`));
for(const lang of languages) assert(entry.includes(`<a href="${lang}/">`));
const aliases=JSON.parse(await read('filter-aliases.json'));
assert.equal(aliases.country['法国'],'FR');assert.equal(aliases.country.Allemagne,'DE');assert.equal(aliases.sector['仓储与物流'],'logistics');assert.equal(aliases.city['图卢兹'],'toulouse');
assert(pages.zh.includes('<option value="DE">德国</option>')&&pages.en.includes('<option value="DE">Germany</option>')&&pages.fr.includes('<option value="DE">Allemagne</option>'));
console.log(`PASS ${ids.size} opportunity records and ${data.notices.length} reminders in ${languages.join(', ')}: same ids, links, dates and filter keys; anchors, alternates, eligibility boundaries, French spacing, generator freshness and historical snapshot.`);
