#!/usr/bin/env node
// Builds the ThesisForma invitation assets:
//   1. public/thesisforma/fonts/tf-serif-{400,600}.woff2 — Noto Serif SC Regular and SemiBold,
//      subset to the glyphs used by the web page and the share card (only when TF_SERIF_DIR
//      holds NotoSerifSC-Regular.otf and NotoSerifSC-SemiBold.otf; needs pyftsubset).
//   2. public/thesisforma/og.png — 1200×630 share card.
//   3. A one-page PDF replica of the web page (not published on the site), written to --out
//      or ./out/. The page is A4-wide and as tall as the letter.

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const publicRoot = resolve(here, '../../public');
const publicDir = join(publicRoot, 'thesisforma');
const outArg = process.argv.indexOf('--out');
const pdfPath = resolve(outArg > -1 ? process.argv[outArg + 1] : join(here, 'out', 'ThesisForma-测试与合作邀请.pdf'));

if (process.env.TF_SERIF_DIR) {
  const sources = await Promise.all([join(publicDir, 'index.html'), join(here, 'og.html')].map((file) => readFile(file, 'utf8')));
  const textFile = join(here, 'out', 'glyphs.txt');
  await mkdir(dirname(textFile), { recursive: true });
  const glyphs = [...new Set(sources.join(''))].filter((c) => c.codePointAt(0) > 0x7f).join('');
  await writeFile(textFile, glyphs);
  for (const [weight, name] of [[400, 'Regular'], [600, 'SemiBold']]) {
    execFileSync(process.env.PYFTSUBSET || 'pyftsubset', [
      join(process.env.TF_SERIF_DIR, `NotoSerifSC-${name}.otf`),
      `--text-file=${textFile}`,
      '--unicodes=U+0020-007E,U+00A0-00FF,U+2010-2027,U+3000-303F,U+FF01-FF5E',
      '--layout-features=*',
      '--flavor=woff2',
      `--output-file=${join(publicDir, 'fonts', `tf-serif-${weight}.woff2`)}`,
    ], { stdio: 'inherit' });
  }
  console.log(`Subset ${glyphs.length} non-ASCII glyphs into tf-serif-400/600.woff2`);
}

// The page uses root-relative asset URLs, so serve public/ instead of opening it as a file.
const types = { '.html': 'text/html; charset=utf-8', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png' };
const server = createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (path.endsWith('/')) path += 'index.html';
  try {
    const body = await readFile(join(publicRoot, path));
    res.writeHead(200, { 'content-type': types[extname(path)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end();
  }
}).listen(0, '127.0.0.1');

const { chromium } = await import(process.env.GUIDE_PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch();

async function open(url, viewport) {
  const tab = await browser.newPage({ viewport });
  await tab.goto(url);
  await tab.evaluate(() => document.fonts.ready);
  const loaded = await tab.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.weight));
  assert(loaded.includes('400') && loaded.includes('600'), `${url}: serif fonts did not load (${loaded})`);
  return tab;
}

try {
  const og = await open(pathToFileURL(join(here, 'og.html')).href, { width: 1200, height: 630 });
  await og.screenshot({ path: join(publicDir, 'og.png') });
  console.log(`Wrote ${join(publicDir, 'og.png')}`);

  const width = 794; // A4 width at 96 dpi
  const page = await open(`http://127.0.0.1:${server.address().port}/thesisforma/`, { width, height: 1123 });
  await page.emulateMedia({ media: 'screen' });
  const height = await page.evaluate(() => Math.ceil(document.documentElement.scrollHeight));
  await mkdir(dirname(pdfPath), { recursive: true });
  const pdf = await page.pdf({ path: pdfPath, width: `${width}px`, height: `${height + 1}px`, printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  const pages = pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g)?.length;
  assert.equal(pages, 1, `PDF should be a single page, got ${pages}`);
  console.log(`Wrote ${pdfPath} (1 page, ${width}×${height}px)`);
} finally {
  await browser.close();
  server.close();
}
