#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = process.env.SUMMER_SCHOOLS_SOURCE_MD
  ?? '/Users/zephyrsui/Developer/md-writing/title-body-example.md';
const targetPath = resolve(repoRoot, 'src/content/essays/my-summer-schools-in-2026-overview.md');

const defaultFrontmatter = `---
title: "My Summer Schools in 2026 Overview (Work in Progress)"
description: ""
date: 2026-06-27
draft: false
---`;

const imageMap = new Map([
  [
    'assets/IMG_5514.jpg',
    'https://ze2phyrzhenyin.github.io/images/essays/my-summer-schools-2026/strings-privacy.webp',
  ],
  [
    'assets/7396.png',
    'https://ze2phyrzhenyin.github.io/images/essays/my-summer-schools-2026/learning-theory.webp',
  ],
]);

const greek = {
  alpha: 'α',
  beta: 'β',
  gamma: 'γ',
  delta: 'δ',
  epsilon: 'ε',
};

function readExistingFrontmatter() {
  if (!existsSync(targetPath)) return defaultFrontmatter;

  const target = readFileSync(targetPath, 'utf8').replace(/\r\n/g, '\n');
  return target.match(/^---\n[\s\S]*?\n---/)?.[0] ?? defaultFrontmatter;
}

function normalizeBody(sourceMarkdown) {
  let body = sourceMarkdown.replace(/\r\n/g, '\n').trim();

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

if (!existsSync(sourcePath)) {
  console.error(`Source Markdown not found: ${sourcePath}`);
  process.exit(1);
}

const frontmatter = readExistingFrontmatter();
const sourceMarkdown = readFileSync(sourcePath, 'utf8');
const nextMarkdown = `${frontmatter}\n\n${normalizeBody(sourceMarkdown)}\n`;
const currentMarkdown = existsSync(targetPath) ? readFileSync(targetPath, 'utf8') : '';

if (currentMarkdown === nextMarkdown) {
  console.log('Summer schools essay is already in sync.');
} else {
  writeFileSync(targetPath, nextMarkdown);
  console.log(`Synced ${sourcePath}`);
  console.log(` -> ${targetPath}`);
}
