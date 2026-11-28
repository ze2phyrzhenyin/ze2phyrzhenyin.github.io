// Turns the two English source documents (pandoc GFM exports of the .docx files) and the research
// prompt into one structure file plus a table of English strings to translate.
//   node resources/circular-africa/parse.mjs
// Writes content/structure.json and content/strings.en.json. Strings are keyed by a hash of the
// English text, so a repeated phrase (for example an access note shared by several channels) is
// translated once.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const here = new URL('./', import.meta.url);
const read = name => readFile(new URL(name, here), 'utf8');
const strings = {};
const order = [];

function clean(text) {
  return text
    .replace(/<span id="[^"]+" class="anchor"><\/span>/g, '')
    .replace(/<\/?u>/g, '')
    .replace(/\[\*\*([^\]]+?)\*\*\]\(/g, '[$1](')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\\([$*_#\[\]])/g, '$1')
    .replace(/ {2,}$/gm, '')
    .trim();
}
function s(text, group) {
  const value = clean(text);
  if (!value) return null;
  const id = 'x' + createHash('sha1').update(value).digest('hex').slice(0, 10);
  if (!(id in strings)) { strings[id] = value; order.push({ id, group }); }
  return id;
}
const plain = text => clean(text).replace(/\*\*/g, '');

function splitTableRow(line) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split(' | ').map(c => c.trim());
}
function paragraphs(md) {
  // Blocks separated by blank lines; tables kept together.
  return md.split(/\n\s*\n/).map(b => b.replace(/\s+$/, '')).filter(Boolean);
}
const isKicker = b => /^[A-Z0-9 &·,'’/-]+$/.test(b) && b.length < 40 && !b.startsWith('|');

// ---------- Report ----------
const CHAPTER_IDS = ['summary', 'where-to-start', 'goods', 'fieldwork', 'handset', 'bale', 'refill', 'denominators',
  'comparison', 'continental', 'handover', 'cases', 'events-2024', 'events-2026', 'rules', 'impact', 'technology',
  'partners', 'sources-1', 'sources-2', 'sources-3', 'plan', 'questions', 'unknowns', 'search'];

function parseTable(block, group) {
  const lines = block.split('\n').filter(l => l.startsWith('|'));
  const head = splitTableRow(lines[0]).map(c => s(c.replace(/\*\*/g, ''), group));
  const rows = lines.slice(2).map(l => splitTableRow(l).map(c => s(c, group)));
  return { t: 'table', head, rows };
}

async function parseReport() {
  const md = await read('source/report.en.md');
  const blocks = paragraphs(md);
  const report = { intro: null, chapters: [] };
  let chapter = null, kicker = null, expectDeck = false;
  for (const block of blocks) {
    if (!report.intro && !block.startsWith('#')) { report.intro = s(block, 'report'); continue; }
    if (isKicker(block)) { kicker = block; continue; }
    if (block.startsWith('# ')) {
      chapter = { id: CHAPTER_IDS[report.chapters.length], kicker: kicker ? s(kicker.charAt(0) + kicker.slice(1).toLowerCase(), 'report') : null, title: s(block.slice(2), 'report'), deck: null, blocks: [] };
      report.chapters.push(chapter); kicker = null; expectDeck = true; continue;
    }
    if (expectDeck) {
      expectDeck = false;
      if (block.length < 200 && !block.includes('](') && !block.includes('**') && !block.startsWith('|') && !block.startsWith('#')) { chapter.deck = s(block, 'report'); continue; }
    }
    if (block.startsWith('## ')) { chapter.blocks.push({ t: 'h2', s: s(block.slice(3), 'report') }); continue; }
    if (block.startsWith('|')) { chapter.blocks.push(parseTable(block, 'report')); continue; }
    chapter.blocks.push({ t: 'p', s: s(block, 'report') });
  }
  if (report.chapters.length !== CHAPTER_IDS.length) throw new Error(`report: ${report.chapters.length} chapters, expected ${CHAPTER_IDS.length}`);
  return report;
}

// ---------- Directory ----------
const LINK = /\[([^\]]+)\]\(([^)]+)\)/;
function firstLink(text) { const m = clean(text).match(LINK); return m ? { title: m[1], url: m[2] } : null; }
function fields(text, names) {
  // "**Access** foo. **Last signal** bar." -> {Access:'foo.', 'Last signal':'bar.'}
  const out = {};
  const re = new RegExp(`\\*\\*(${names.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\*\\*`, 'g');
  const parts = [...text.matchAll(re)];
  parts.forEach((m, i) => {
    const start = m.index + m[0].length, end = i + 1 < parts.length ? parts[i + 1].index : text.length;
    out[m[1]] = text.slice(start, end).trim();
  });
  return out;
}

const REGION_RULES = [
  ['ghana', /Ghana|Accra|Kumasi|Tema|Legon|Sunyani|Kpone/],
  ['kenya', /Kenya|Nairobi/],
  ['nigeria', /Nigeria|Lagos/],
  ['south-africa', /South Africa/],
  ['cote-divoire', /Côte d|Abidjan|Ivoire/],
  ['morocco', /Morocco|Maroc|Casablanca/],
  ['cameroon', /Cameroon|Cameroun|Douala/],
  ['pan-africa', /Pan-Africa|Africa(?!n)|sub-Saharan|East\/Southern|West Africa|Cross-country/],
  ['global', /Global|International|World|Cross-border|EU|UK|Europe|^Country ×/],
];
function regions(geo) {
  const found = REGION_RULES.filter(([, re]) => re.test(geo)).map(([k]) => k);
  return found.length ? found : ['other'];
}
const CATEGORY_RULES = [
  ['pending', /Verification lead/i],
  ['capital', /Capital|Investor|Venture|Accelerat|Incubat|Finance(?! \/ research)|Fund\b|Funding \/ public|Public fund|Grant/i],
  ['government', /Regulator|Government|Municipal|Procurement|Official|Ministry|Customs|Central bank|Statistic|Court|Legal|Parliament|Public authority|Agency|Standards|Law|Gazette/i],
  ['research', /Research(?! \/ company)|Data|University|Academic|Study|Survey|Think tank|Repository|Trade data|Discovery/i],
  ['media', /Media|News|Podcast|Radio|Journal|Newsletter|Magazine|Video|Reporting|writer/i],
  ['network', /Network|Ecosystem|Events|Association|Alliance|Coalition|Worker|Cooperative|Union|Chamber|Federation|Community|Redistribution|Civil society|Foundation|NGO|Organisation/i],
  ['company', /Company|Retailer|Marketplace|Franchis|Logistics|Payment|Platform|Operator|Brand|Repair|Hire|Shop|Recycler/i],
];
function category(type) { return (CATEGORY_RULES.find(([, re]) => re.test(type)) || ['other'])[0]; }

function parseEntry(block, pending) {
  const lines = clean(block).split('\n');
  const h = lines[0].match(/^\*\*(.+?)\*\* · (S(\d{3})-(\d{2})) · (Query|Follow|Subscribe|Pending) · (High|Medium|Low) priority$/);
  if (!h) throw new Error('bad entry header: ' + lines[0]);
  const link = lines[1].match(/^\[([^\]]+)\]\(([^)]+)\)\s*(.*)$/);
  if (!link) throw new Error('bad entry link line: ' + lines[1]);
  const meta = lines[2].split(' · ');
  const f = fields(lines.slice(3).join(' '), ['Access', 'Last signal', 'Frequency', 'Limit']);
  const [geo, type, topics, lang] = meta.length === 4 ? meta : [meta[0], meta[1], meta.slice(2, -1).join(' · '), meta.at(-1)];
  return {
    id: h[2], org: 'S' + h[3], channel: h[4], name: h[1], mode: h[5].toLowerCase(), priority: h[6].toLowerCase(), pending,
    title: link[1], url: link[2], question: s(link[3], 'directory'),
    geo: s(geo, 'directory'), regions: regions(geo), type: s(type, 'directory'), category: category(type),
    topics: s(topics, 'directory'), lang,
    access: s(f['Access'] || '', 'directory'), last: s(f['Last signal'] || '', 'directory'),
    frequency: s(f['Frequency'] || '', 'directory'), limit: s(f['Limit'] || '', 'directory'),
  };
}

function parseTop(block) {
  const lines = clean(block).split('\n');
  const h = lines[0].match(/^\*\*(\d{2}) (.+?)\*\* · (Query|Follow|Subscribe) \[(S\d{3}-\d{2})\]\(#([^)]+)\)$/);
  if (!h) throw new Error('bad top header: ' + lines[0]);
  const link = lines[1].match(/^\[([^\]]+)\]\(([^)]+)\)\s*(.*)$/);
  return { n: h[1], name: h[2], mode: h[3].toLowerCase(), id: h[4], anchor: h[5], title: link[1], url: link[2], text: s(link[3], 'directory') };
}

function parseCompany(block) {
  const lines = clean(block).split('\n');
  const h = lines[0].match(/^\*\*(.+?)\*\* · (C\d{2}) · (.+?) \[(S\d{3})\]\(#[^)]+\)$/);
  if (!h) throw new Error('bad company header: ' + lines[0]);
  const body = lines.slice(1).join(' ');
  const url = body.match(/\[Case source\]\(([^)]+)\)/)[1];
  const f = fields(body.replace(/\[Case source\]\([^)]+\)/, ''), ['Customers', 'Charges', 'Evidence of use', 'Latest signal', 'Field lesson', 'Limit']);
  return { id: h[2], name: h[1], place: s(h[3], 'directory'), org: h[4], url,
    customers: s(f['Customers'], 'directory'), charges: s(f['Charges'], 'directory'), evidence: s(f['Evidence of use'], 'directory'),
    latest: s(f['Latest signal'], 'directory'), lesson: s(f['Field lesson'], 'directory'), limit: s(f['Limit'], 'directory') };
}

function parseEvent(block) {
  const lines = clean(block).split('\n');
  const h = lines[0].match(/^\*\*(.+?)\*\* · ([ER]\d{2}) \[(S\d{3})\]\(#[^)]+\)$/);
  if (!h) throw new Error('bad event header: ' + lines[0]);
  const f1 = fields(lines[1], ['Event or data period', 'Publication']);
  const evidenceLine = lines.at(-1);
  const url = evidenceLine.match(/\[Open source\]\(([^)]+)\)/)[1];
  const evidence = evidenceLine.replace(/^\*\*Evidence\*\*/, '').replace(/\[Open source\]\([^)]+\)/, '').trim();
  return { id: h[2], topic: s(h[1], 'directory'), org: h[3], url, period: s(f1['Event or data period'], 'directory'),
    publication: s(f1['Publication'], 'directory'), text: s(lines.slice(2, -1).join(' '), 'directory'), evidence: s(evidence, 'directory') };
}

function parseOpportunity(block) {
  const lines = clean(block).split('\n');
  const h = lines[0].match(/^\*\*(.+?)\*\* · (O\d{2}) \[(S\d{3})\]\(#[^)]+\)$/);
  if (!h) throw new Error('bad opportunity header: ' + lines[0]);
  const status = lines[1].replace(/^\*\*|\*\*$/g, '');
  const rest = lines.slice(2).join(' ');
  const url = rest.match(/\[Official entry\]\(([^)]+)\)/)[1];
  const f = fields(rest.replace(/\[Official entry\]\([^)]+\)/, ''), ['Eligibility', 'Fee or funding', 'Date', 'Next use']);
  return { id: h[2], title: h[1], org: h[3], url, status: s(status, 'directory'),
    eligibility: s(f['Eligibility'], 'directory'), fee: s(f['Fee or funding'], 'directory'), date: s(f['Date'], 'directory'), next: s(f['Next use'], 'directory') };
}

async function parseDirectory() {
  const md = await read('source/directory.en.md');
  const sections = {};
  let current = 'head';
  for (const block of paragraphs(md)) {
    if (block.startsWith('# ')) { current = block.slice(2).trim(); sections[current] = []; continue; }
    if (block.startsWith('## ')) { const sub = block.slice(3).trim(); if (current === 'head' || current === 'Ten more sources to add') { current = sub; sections[current] = []; continue; } if (current.startsWith('Verified') || current.startsWith('Organisations')) { current = 'Verified sources by organisation'; continue; } if (sub === 'Research and data records') { current = sub; sections[current] = []; continue; } }
    (sections[current] ||= []).push(block);
  }
  const head = sections.head || [];
  const verified = sections['Verified sources by organisation'];
  const dir = {
    intro: s(head[0], 'directory'),
    top: [...sections['Five sources to open first'], ...sections['Ten more sources to add']].map(parseTop),
    verifiedIntro: s(verified[0], 'directory'),
    entries: verified.filter(b => /^(<span[^>]*><\/span>)?\*\*.+\*\* · S\d{3}-\d{2} · /.test(b)).map(b => parseEntry(b, false)),
    pendingIntro: s(sections['Entries awaiting verification'][0], 'directory'),
    pending: sections['Entries awaiting verification'].slice(1).map(b => parseEntry(b, true)),
    companiesIntro: s(sections['Companies and local alternatives'][0], 'directory'),
    companies: sections['Companies and local alternatives'].slice(1).map(parseCompany),
    newsIntro: s(sections['News and research'][0], 'directory'),
    events: sections['News and research'].slice(1).map(parseEvent),
    research: sections['Research and data records'].map(parseEvent),
    opportunitiesIntro: s(sections['Opportunities and potential partners'][0], 'directory'),
    opportunities: sections['Opportunities and potential partners'].slice(1).map(parseOpportunity),
  };
  const counts = { entries: dir.entries.length, pending: dir.pending.length, companies: dir.companies.length, events: dir.events.length, research: dir.research.length, opportunities: dir.opportunities.length, top: dir.top.length, orgs: new Set(dir.entries.map(e => e.org)).size };
  const expect = { entries: 178, pending: 5, companies: 25, events: 23, research: 9, opportunities: 12, top: 15, orgs: 135 };
  for (const [k, v] of Object.entries(expect)) if (counts[k] !== v) throw new Error(`directory ${k}: ${counts[k]}, expected ${v}`);
  return { dir, counts };
}

// ---------- Prompt ----------
async function parsePrompt() {
  const md = await read('source/prompt.en.md');
  const blocks = [];
  for (const block of paragraphs(md)) {
    if (block === '---') { blocks.push({ t: 'hr' }); continue; }
    const heading = block.match(/^(#{1,3}) (.+)$/);
    if (heading && !block.includes('\n')) { blocks.push({ t: 'h' + heading[1].length, s: s(heading[2], 'prompt') }); continue; }
    if (block.startsWith('|')) { blocks.push(parseTable(block, 'prompt')); continue; }
    if (/^(- |\d+\. )/.test(block)) {
      const ordered = /^\d+\. /.test(block);
      blocks.push({ t: ordered ? 'ol' : 'ul', items: block.split('\n').map(l => s(l.replace(/^(- |\d+\. )/, ''), 'prompt')) });
      continue;
    }
    blocks.push({ t: 'p', s: s(block, 'prompt') });
  }
  return { blocks };
}

const report = await parseReport();
const { dir, counts } = await parseDirectory();
const prompt = await parsePrompt();
await mkdir(new URL('content/', here), { recursive: true });
await writeFile(new URL('content/structure.json', here), JSON.stringify({ report, directory: dir, prompt }, null, 1));
const ordered = Object.fromEntries(order.map(o => [o.id, strings[o.id]]));
await writeFile(new URL('content/strings.en.json', here), JSON.stringify(ordered, null, 1));
await writeFile(new URL('content/string-groups.json', here), JSON.stringify(Object.fromEntries(order.map(o => [o.id, o.group])), null, 0));
const words = group => order.filter(o => o.group === group).reduce((n, o) => n + strings[o.id].replace(/\]\([^)]+\)/g, ']').split(/\s+/).length, 0);
const cat = {}; for (const e of [...dir.entries, ...dir.pending]) cat[e.category] = (cat[e.category] || 0) + 1;
const reg = {}; for (const e of dir.entries) for (const r of e.regions) reg[r] = (reg[r] || 0) + 1;
console.log(JSON.stringify({ chapters: report.chapters.length, ...counts, strings: order.length, words: { report: words('report'), directory: words('directory'), prompt: words('prompt') }, categories: cat, regions: reg }));
