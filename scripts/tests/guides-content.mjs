import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import vm from 'node:vm';

const root = new URL('../../public/',import.meta.url);
const locales = ['en','fr','zh'];
const routes = ['guides','francophone-sport-careers','logic-agents','man-city-ucl-away-guide-2026-27','medvedin','musee-prague','pyrenees-guide','randonnee','recruit','summer-schools-religion','toulouse-bars','toulouse-events'];
const read = path => readFile(new URL(path,root),'utf8');
const json = async path => JSON.parse(await read(path));
const attr = (tag,name) => tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`))?.[1];
let pageCount=0;
for(const route of routes)for(const locale of locales){
  const files=[`${route}/${locale}/index.html`];
  if(route==='toulouse-bars')files.push(`${route}/${locale}/sources.html`);
  for(const file of files){
    const html=await read(file),path=`/${file.replace(/index\.html$/,'')}`;
    assert(html.includes(`data-guide="${route}"`),`${file}: theme scope`);
    assert(html.includes('/guides/theme.js?')&&html.includes('/guides/theme.css?'),`${file}: theme assets`);
    assert(html.includes(`lang="${locale==='zh'?'zh-CN':locale}"`),file);
    const links=html.match(/<link\b[^>]*>/g)||[];
    assert(links.some(tag=>attr(tag,'rel')==='canonical'&&attr(tag,'href')===`https://zhaoyang.fr${path}`),`${file}: canonical`);
    for(const other of locales)assert(links.some(tag=>attr(tag,'hreflang')===(other==='zh'?'zh-Hans':other)),`${file}: ${other} alternate`);
    if(route!=='guides')assert(html.includes(`href="/guides/${locale}/"`),`${file}: return link`);
    const markup=html.replace(/(<script\b[^>]*>)[\s\S]*?<\/script>/gi,'$1</script>').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'');
    for(const tag of markup.match(/<(?:img|script|link|a)\b[^>]*>/gi)||[]){
      const value=attr(tag,'src')||attr(tag,'href');
      if(!value||value.startsWith('#')||/^(?:https?:|data:|mailto:|tel:)/.test(value)||['/','/en/','/zh/','/fr/'].includes(value))continue;
      const url=new URL(value,`https://zhaoyang.fr${path}`);
      const local=url.pathname.endsWith('/')?url.pathname+'index.html':url.pathname;
      await access(new URL('.'+local,root)).catch(()=>{throw new Error(`${file}: missing local link ${value}`)});
    }
    pageCount++;
  }
}

function unchanged(source,target,path=''){
  if(typeof source==='number'||typeof source==='boolean'||source===null){assert.deepEqual(target,source,path);return;}
  if(typeof source==='string'){
    // Preserve identifiers, official URLs, exact dates/times and all non-Chinese source strings.
    if(!/[\u3400-\u9fff]/u.test(source))assert.equal(target,source,path);
    return;
  }
  if(Array.isArray(source)){assert.equal(target.length,source.length,path);source.forEach((v,i)=>unchanged(v,target[i],`${path}[${i}]`));return;}
  for(const [key,value]of Object.entries(source))unchanged(value,target[key],`${path}.${key}`);
}
const events=await json('toulouse-events/events.json');
for(const l of ['en','fr']){
  const localized=await json(`toulouse-events/events.${l}.json`);
  unchanged(events,localized,`events.${l}`);
  for(const [i,event]of localized.entries())for(const key of ['domain','category','price','status'])assert.equal(event._classification[key],events[i][key]);
  unchanged(await json('pyrenees-guide/routes.json'),await json(`pyrenees-guide/routes.${l}.json`),`routes.${l}`);
}
async function bars(file){const context={window:{}};vm.runInNewContext(await read(file),context);return JSON.parse(JSON.stringify(context.window.BAR_GUIDE_DATA));}
const sourceBars=await bars('toulouse-bars/data.js');
unchanged(sourceBars,await bars('toulouse-bars/data.fr.js'),'bars.fr');
const englishBars=await bars('toulouse-bars/data.en.js');
assert.deepEqual(englishBars.bars.map(b=>b.id),sourceBars.bars.map(b=>b.id));
for(const [i,bar] of sourceBars.bars.entries())for(const key of ['schedule','dateOverrides','reopenDate','eventOnly','website','sourceUrl'])assert.deepEqual(englishBars.bars[i][key],bar[key],`bars.en.${bar.id}.${key}`);
const schools=await json('summer-schools-religion/data.json'),schoolContext={};
vm.runInNewContext(await read('summer-schools-religion/translations.js'),schoolContext);
for(const programme of schools.programmes)for(const l of ['en','fr']){
  for(const field of ['summary','admission','learning','caution','fee','dates','deadline','language','credit','host']){
    if(!/[\u3400-\u9fff]/u.test(programme[field]||''))continue;
    const text=schoolContext.TRANSLATIONS.programmes[programme.id]?.[l]?.[field];
    assert(text&&!/[\u3400-\u9fff]/u.test(text),`schools.${programme.id}.${l}.${field}`);
  }
}
console.log(`PASS ${pageCount} pages, all local links, ${events.length} events, ${sourceBars.bars.length} bars, 3 hiking routes and ${schools.programmes.length} school records.`);
