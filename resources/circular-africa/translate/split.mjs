// Splits content/strings.en.json into translation chunks by group and word count.
//   node resources/circular-africa/translate/split.mjs
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
const here = new URL('./', import.meta.url);
const strings = JSON.parse(await readFile(new URL('../content/strings.en.json', here), 'utf8'));
const groups = JSON.parse(await readFile(new URL('../content/string-groups.json', here), 'utf8'));
const plan = { report: 2, directory: 2, prompt: 1 };
await rm(new URL('chunks/', here), { recursive: true, force: true });
await mkdir(new URL('chunks/', here), { recursive: true });
const words = t => t.replace(/\]\([^)]+\)/g, ']').split(/\s+/).length;
for (const [group, parts] of Object.entries(plan)) {
  const ids = Object.keys(strings).filter(id => groups[id] === group);
  const total = ids.reduce((n, id) => n + words(strings[id]), 0);
  let part = 1, acc = 0, chunk = {};
  const flush = async () => { await writeFile(new URL(`chunks/${group}-${part}.json`, here), JSON.stringify(chunk, null, 1)); console.log(`${group}-${part}: ${Object.keys(chunk).length} strings, ${acc} words`); };
  for (const id of ids) {
    if (part < parts && acc >= total / parts) { await flush(); part++; acc = 0; chunk = {}; }
    chunk[id] = strings[id]; acc += words(strings[id]);
  }
  await flush();
}
