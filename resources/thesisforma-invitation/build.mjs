#!/usr/bin/env node
// Builds the ThesisForma invitation assets:
//   1. public/thesisforma/fonts/tf-serif-{400,600}.woff2 — Noto Serif SC Regular and SemiBold,
//      subset to the glyphs used by the web page, the PDF and the share card (only when
//      TF_SERIF_DIR holds NotoSerifSC-Regular.otf and NotoSerifSC-SemiBold.otf; needs pyftsubset).
//   2. public/thesisforma/og.png — 1200×630 share card.
//   3. The A4 PDF letter (not published on the site), written to --out or ./out/.

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(here, '../../public/thesisforma');
const outArg = process.argv.indexOf('--out');
const pdfPath = resolve(outArg > -1 ? process.argv[outArg + 1] : join(here, 'out', 'ThesisForma-测试与合作邀请.pdf'));

if (process.env.TF_SERIF_DIR) {
  const sources = await Promise.all(['../../public/thesisforma/index.html', 'invitation.html', 'og.html'].map((file) => readFile(join(here, file), 'utf8')));
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

const { chromium } = await import(process.env.GUIDE_PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch();

async function open(file, viewport) {
  const tab = await browser.newPage({ viewport });
  await tab.goto(pathToFileURL(join(here, file)).href);
  await tab.evaluate(() => document.fonts.ready);
  const loaded = await tab.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.weight));
  assert(loaded.includes('400') && loaded.includes('600'), `${file}: serif fonts did not load (${loaded})`);
  return tab;
}

try {
  const og = await open('og.html', { width: 1200, height: 630 });
  await og.screenshot({ path: join(publicDir, 'og.png') });
  console.log(`Wrote ${join(publicDir, 'og.png')}`);

  const letter = await open('invitation.html', { width: 900, height: 1200 });
  await mkdir(dirname(pdfPath), { recursive: true });
  const pdf = await letter.pdf({ path: pdfPath, preferCSSPageSize: true, printBackground: true });
  const pages = pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g)?.length;
  console.log(`Wrote ${pdfPath} (${pages} pages)`);
} finally {
  await browser.close();
}
