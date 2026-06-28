#!/usr/bin/env node
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const writingRoot = process.env.SITEWEB_WRITING_ROOT
  ?? '/Users/zephyrsui/Developer/md-writing/personal-site';
const collections = ['blog', 'essays'];

const knownTargets = new Map([
  [
    'blog/differentiql-privacy-CPM2026-intro.md',
    'src/content/blog/differential-privacy-cpm-2026-intro.md',
  ],
  [
    'essays/my-summer-schools-in-2026-overview.md',
    'src/content/essays/my-summer-schools-in-2026-overview.md',
  ],
]);

const greek = {
  alpha: 'α',
  beta: 'β',
  gamma: 'γ',
  delta: 'δ',
  epsilon: 'ε',
};

const imageMap = new Map([
  [
    'assets/IMG_5514.jpg',
    'https://ze2phyrzhenyin.github.io/images/essays/my-summer-schools-2026/strings-privacy.webp',
  ],
  [
    '../assets/essays/my-summer-schools-2026/strings-privacy.jpg',
    'https://ze2phyrzhenyin.github.io/images/essays/my-summer-schools-2026/strings-privacy.webp',
  ],
  [
    'assets/7396.png',
    'https://ze2phyrzhenyin.github.io/images/essays/my-summer-schools-2026/learning-theory.webp',
  ],
  [
    '../assets/essays/my-summer-schools-2026/learning-theory.png',
    'https://ze2phyrzhenyin.github.io/images/essays/my-summer-schools-2026/learning-theory.webp',
  ],
]);

function walkMarkdown(dir) {
  if (!existsSync(dir)) return [];

  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith('.') || entry.name.startsWith('_')) return [];

    const entryPath = join(dir, entry.name);
    if (entry.isDirectory()) return walkMarkdown(entryPath);
    if (entry.isFile() && /\.mdx?$/.test(entry.name)) return [entryPath];
    return [];
  });
}

function slugify(input) {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'untitled';
}

function stripFrontmatter(markdown) {
  const normalized = markdown.replace(/\r\n/g, '\n');
  const match = normalized.match(/^---\n[\s\S]*?\n---\n*/);
  return match ? normalized.slice(match[0].length) : normalized;
}

function firstHeading(markdown, fallback) {
  const body = stripFrontmatter(markdown);
  const match = body.match(/^#\s+(.+?)\s*$/m);
  if (!match) return fallback;

  return match[1]
    .replaceAll('（', '(')
    .replaceAll('）', ')')
    .trim();
}

function buildDefaultFrontmatter(collection, sourcePath, sourceMarkdown) {
  const title = firstHeading(sourceMarkdown, basename(sourcePath, extname(sourcePath)));
  const date = new Date().toISOString().slice(0, 10);
  const common = [
    '---',
    `title: ${JSON.stringify(title)}`,
    'description: ""',
    `date: ${date}`,
  ];

  if (collection === 'blog') {
    common.push('category: cs');
    common.push('draft: false');
    common.push('math: true');
  } else {
    common.push('draft: false');
  }

  common.push('---');
  return common.join('\n');
}

function readFrontmatter(targetPath, collection, sourcePath, sourceMarkdown) {
  if (!existsSync(targetPath)) {
    return buildDefaultFrontmatter(collection, sourcePath, sourceMarkdown);
  }

  const targetMarkdown = readFileSync(targetPath, 'utf8').replace(/\r\n/g, '\n');
  return targetMarkdown.match(/^---\n[\s\S]*?\n---/)?.[0]
    ?? buildDefaultFrontmatter(collection, sourcePath, sourceMarkdown);
}

function targetForSource(collection, sourcePath) {
  const relativeSource = relative(writingRoot, sourcePath).replaceAll('\\', '/');
  const known = knownTargets.get(relativeSource);
  if (known) return resolve(repoRoot, known);

  const collectionRoot = join(writingRoot, collection);
  const relativeToCollection = relative(collectionRoot, sourcePath).replaceAll('\\', '/');
  const parsed = relativeToCollection.split('/');
  const fileName = parsed.pop();
  const stem = basename(fileName, extname(fileName));
  const slug = slugify(stem);
  return resolve(repoRoot, 'src/content', collection, ...parsed, `${slug}.md`);
}

function normalizeBody(sourceMarkdown) {
  let body = stripFrontmatter(sourceMarkdown).trim();

  body = body.replace(/^#\s+.*\n+/, '');
  body = body.replace(/^\*?Last updated:.*\*?\s*$/gim, '');
  body = body.replace(/^##\s+\$\\(alpha|beta|gamma|delta|epsilon)\$\.\s*/gm, (_, key) => {
    return `## ${greek[key]}. `;
  });

  for (const [from, to] of imageMap.entries()) {
    body = body.replaceAll(`](${from})`, `](${to})`);
  }

  body = body.replace(/^(## .+)\n(?!\n)/gm, '$1\n\n');
  body = body.replace(/\n{3,}/g, '\n\n');

  return body.trim();
}

function syncOne(collection, sourcePath) {
  const sourceMarkdown = readFileSync(sourcePath, 'utf8');
  const targetPath = targetForSource(collection, sourcePath);
  const frontmatter = readFrontmatter(targetPath, collection, sourcePath, sourceMarkdown);
  const nextMarkdown = `${frontmatter}\n\n${normalizeBody(sourceMarkdown)}\n`;
  const currentMarkdown = existsSync(targetPath) ? readFileSync(targetPath, 'utf8') : '';

  if (currentMarkdown === nextMarkdown) {
    console.log(`Already in sync: ${relative(writingRoot, sourcePath)}`);
    return false;
  }

  mkdirSync(dirname(targetPath), { recursive: true });
  writeFileSync(targetPath, nextMarkdown);
  console.log(`Synced ${sourcePath}`);
  console.log(` -> ${targetPath}`);
  return true;
}

if (!existsSync(writingRoot) || !statSync(writingRoot).isDirectory()) {
  console.error(`Writing root not found: ${writingRoot}`);
  process.exit(1);
}

let changed = false;
for (const collection of collections) {
  const sourceDir = join(writingRoot, collection);
  for (const sourcePath of walkMarkdown(sourceDir)) {
    changed = syncOne(collection, sourcePath) || changed;
  }
}

if (!changed) {
  console.log('Personal site writing is already in sync.');
}
