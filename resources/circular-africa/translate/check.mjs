// Checks a translated chunk against its English source.
//   node resources/circular-africa/translate/check.mjs <zh|es> <chunk-name>
//   node resources/circular-africa/translate/check.mjs <zh|es> --all      (every chunk, plus the merged file)
// A chunk source is translate/chunks/<name>.json; the translation is translate/<lang>/<name>.json.
// Errors: missing or extra ids, empty text, different link URLs, a source number missing from the
// translation, left-over English (zh only), straight double quotes in zh, or mismatched ** pairs.
import { readFile, readdir } from 'node:fs/promises';

const [lang, name] = process.argv.slice(2);
if (!['zh', 'es'].includes(lang) || !name) { console.error('usage: check.mjs <zh|es> <chunk-name|--all>'); process.exit(2); }
const here = new URL('./', import.meta.url);
const load = async path => JSON.parse(await readFile(new URL(path, here), 'utf8'));

const urls = text => [...text.matchAll(/\]\(([^)]+)\)/g)].map(m => m[1]).sort();
const numbers = text => text
  .replace(/\]\([^)]+\)/g, ']')
  .replace(/\b[SCERO]\d{2,3}(?:-\d{2})?\b/g, '')
  .match(/\d+(?:[.,]\d+)*/g) || [];
const normaliseNumber = n => n.replace(/,(?=\d{3}\b)/g, '');

// Search-query cells and the prompt's example queries stay in their original language on purpose;
// build.mjs --merge copies them from the English source.
const structure = JSON.parse(await readFile(new URL('../content/structure.json', here), 'utf8'));
const sourceEn = JSON.parse(await readFile(new URL('../content/strings.en.json', here), 'utf8'));
const keepEnglish = new Set(structure.report.chapters.find(c => c.id === 'search').blocks.filter(b => b.t === 'table').flatMap(b => b.rows.map(r => r[0])));
structure.prompt.blocks.forEach((b, i, all) => { if (b.t === 'p' && /^(Examples include:|Actively search for counterexamples)/.test(sourceEn[b.s]) && all[i + 1]?.t === 'ul') all[i + 1].items.forEach(id => keepEnglish.add(id)); });

function checkPair(id, en, out, problems) {
  if (keepEnglish.has(id)) return;
  if (typeof out !== 'string' || !out.trim()) { problems.push(`${id}: empty or missing`); return; }
  const a = urls(en), b = urls(out);
  if (a.join(' ') !== b.join(' ')) problems.push(`${id}: link URLs differ\n    en: ${a.join(' ')}\n    ${lang}: ${b.join(' ')}`);
  const have = new Set(numbers(out).map(normaliseNumber));
  const missing = numbers(en).map(normaliseNumber).filter(n => !have.has(n));
  if (missing.length) problems.push(`${id}: numbers missing in translation: ${[...new Set(missing)].join(', ')}`);
  const boldEn = (en.match(/\*\*/g) || []).length, boldOut = (out.match(/\*\*/g) || []).length;
  if (boldEn !== boldOut) problems.push(`${id}: ** markers ${boldEn} in English, ${boldOut} in translation`);
  if (lang === 'zh') {
    const stripped = out.replace(/\[[^\]]*\]\([^)]+\)/g, '').replace(/[A-Za-z0-9][A-Za-z0-9.&’'\- /]*[A-Za-z0-9]/g, m => m.split(/\s+/).length > 6 ? m : '');
    const longLatin = stripped.match(/(?:[A-Za-z’'-]+[ ,]+){7,}[A-Za-z’'-]+/g);
    if (longLatin) problems.push(`${id}: long English run left in Chinese text: «${longLatin[0].slice(0, 80)}»`);
    if (/"/.test(out.replace(/\]\([^)]+\)/g, ']'))) problems.push(`${id}: straight double quote in Chinese text (use “” or 「」)`);
  }
  if (out.trim() === en.trim() && en.replace(/\]\([^)]+\)/g, ']').split(/\s+/).filter(w => /^[a-z]{3,}/.test(w)).length > 3) problems.push(`${id}: identical to English`);
}

async function checkChunk(chunk) {
  const source = await load(`chunks/${chunk}.json`);
  let target;
  try { target = await load(`${lang}/${chunk}.json`); }
  catch (e) { return [`${chunk}: cannot read ${lang}/${chunk}.json (${e.message})`]; }
  const problems = [];
  for (const id of Object.keys(source)) checkPair(id, source[id], target[id], problems);
  for (const id of Object.keys(target)) if (!(id in source)) problems.push(`${id}: not in the source chunk`);
  return problems;
}

const chunks = name === '--all'
  ? (await readdir(new URL('chunks/', here))).filter(f => f.endsWith('.json')).map(f => f.replace(/\.json$/, '')).sort()
  : [name];
let total = 0;
for (const chunk of chunks) {
  const problems = await checkChunk(chunk);
  total += problems.length;
  const count = Object.keys(await load(`chunks/${chunk}.json`)).length;
  console.log(`${problems.length ? 'FAIL' : 'PASS'} ${lang}/${chunk}: ${count} strings, ${problems.length} problems`);
  for (const p of problems.slice(0, 60)) console.log('  - ' + p);
  if (problems.length > 60) console.log(`  … ${problems.length - 60} more`);
}
process.exit(total ? 1 : 0);
