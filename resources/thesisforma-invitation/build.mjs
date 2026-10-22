#!/usr/bin/env node
// Builds the ThesisForma invitation assets:
//   1. public/thesisforma/fonts/tf-serif.woff2 — Noto Serif SC Medium subset to the
//      glyphs used by the web page, the PDF and the share card (only when
//      TF_SERIF_SOURCE points at NotoSerifSC-Medium.otf; needs fontTools' pyftsubset).
//   2. public/thesisforma/og.png — 1200×630 share card.
//   3. The A4 PDF (not published on the site), written to --out or ./out/.
// The document figure is copied from public/thesisforma/index.html so the three
// outputs never drift apart.

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const pagePath = resolve(here, '../../public/thesisforma/index.html');
const fontPath = resolve(here, '../../public/thesisforma/fonts/tf-serif.woff2');
const ogPath = resolve(here, '../../public/thesisforma/og.png');
const outArg = process.argv.indexOf('--out');
const pdfPath = resolve(outArg > -1 ? process.argv[outArg + 1] : join(here, 'out', 'ThesisForma-测试与合作邀请.pdf'));

const page = await readFile(pagePath, 'utf8');
const pdfTemplate = await readFile(join(here, 'invitation.html'), 'utf8');
const ogTemplate = await readFile(join(here, 'og.html'), 'utf8');

const figure = page.match(/<svg viewBox="0 0 560 300"[\s\S]*?<\/svg>/)?.[0];
assert(figure, 'figure SVG not found in public/thesisforma/index.html');

if (process.env.TF_SERIF_SOURCE) {
  const textFile = join(here, 'out', 'glyphs.txt');
  await mkdir(dirname(textFile), { recursive: true });
  const glyphs = [...new Set(page + pdfTemplate + ogTemplate)].filter((c) => c.codePointAt(0) > 0x7f).join('');
  await writeFile(textFile, glyphs);
  await mkdir(dirname(fontPath), { recursive: true });
  execFileSync(process.env.PYFTSUBSET || 'pyftsubset', [
    process.env.TF_SERIF_SOURCE,
    `--text-file=${textFile}`,
    '--unicodes=U+0020-007E,U+00A0-00FF,U+2010-2027,U+3000-303F,U+FF01-FF5E',
    '--layout-features=*',
    '--flavor=woff2',
    `--output-file=${fontPath}`,
  ], { stdio: 'inherit' });
  console.log(`Subset ${glyphs.length} non-ASCII glyphs into ${fontPath}`);
}

const { chromium } = await import(process.env.GUIDE_PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch();

async function open(template, name, viewport) {
  const file = join(here, `.${name}.build.html`);
  await writeFile(file, template.replace('<!--FIGURE-->', figure));
  const tab = await browser.newPage({ viewport });
  await tab.goto(pathToFileURL(file).href);
  await tab.evaluate(() => document.fonts.ready);
  const fonts = await tab.evaluate(() => [...document.fonts].map((f) => `${f.family}:${f.status}`));
  assert(fonts.includes('"TF Serif":loaded') || fonts.includes('TF Serif:loaded'), `${name}: serif font did not load (${fonts})`);
  return { tab, cleanup: () => rm(file, { force: true }) };
}

try {
  const og = await open(ogTemplate, 'og', { width: 1200, height: 630 });
  await og.tab.screenshot({ path: ogPath });
  await og.cleanup();
  console.log(`Wrote ${ogPath}`);

  const pdf = await open(pdfTemplate, 'invitation', { width: 900, height: 1200 });
  await pdf.tab.emulateMedia({ media: 'print' });
  // Every sheet must fit its A4 box, and the content must stay clear of the running footer.
  const sheets = await pdf.tab.evaluate(() => [...document.querySelectorAll('.page')].map((sheet) => {
    const mm = 96 / 25.4;
    const sections = sheet.querySelectorAll('section');
    const gap = sheet.querySelector('.runfoot').getBoundingClientRect().top - sections[sections.length - 1].getBoundingClientRect().bottom;
    return { overflow: sheet.scrollHeight - sheet.clientHeight, freeMm: +(gap / mm).toFixed(1) };
  }));
  sheets.forEach(({ overflow, freeMm }, i) => {
    console.log(`page ${i + 1}: ${freeMm}mm free above the footer`);
    assert(overflow <= 1, `page ${i + 1} overflows by ${overflow}px`);
    assert(freeMm >= 6, `page ${i + 1} content runs into the footer`);
  });
  await mkdir(dirname(pdfPath), { recursive: true });
  await pdf.tab.pdf({ path: pdfPath, preferCSSPageSize: true, printBackground: true });
  await pdf.cleanup();
  console.log(`Wrote ${pdfPath}`);
} finally {
  await browser.close();
}
