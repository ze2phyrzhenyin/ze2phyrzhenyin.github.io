import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const root = new URL('../../public/guides/rex-opportunities/',import.meta.url);
const read = path => readFile(new URL(path,root),'utf8');
const data=JSON.parse(await read('events.json')), html=await read('index.html'), report=await read('report.md'), prompt=await read('prompt.txt');
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
for(const match of html.matchAll(/href="#([^"]+)"/g)) assert(html.includes(`id="${match[1]}"`),`broken anchor ${match[1]}`);
const archive=JSON.parse(await read('archive/2026-11-15/events.json'));
assert.equal(archive.reportDate,'2026-11-15');
assert((await read('archive/2026-11-15/prompt.txt')).includes('约 300 公里'));
console.log(`PASS ${ids.size} opportunity records, ${data.notices.length} reminders, all anchors, eligibility boundaries and historical snapshot.`);
