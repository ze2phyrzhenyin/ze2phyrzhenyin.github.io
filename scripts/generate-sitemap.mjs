import { readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_ORIGIN = 'https://zhaoyang.fr';
const DIST_DIR = fileURLToPath(new URL('../dist/', import.meta.url));
const STATUS_PAGE_PATTERN = /^(?:404|500)\.html$/;

async function listHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? listHtmlFiles(path) : [path];
  }));

  return files.flat().filter((path) => path.endsWith('.html'));
}

function getAttribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'));
  return match?.[2];
}

function getCanonical(html) {
  const linkTags = html.match(/<link\b[^>]*>/gi) ?? [];
  const canonicalTag = linkTags.find((tag) => {
    const rel = getAttribute(tag, 'rel') ?? '';
    return rel.toLowerCase().split(/\s+/).includes('canonical');
  });

  return canonicalTag ? getAttribute(canonicalTag, 'href') : undefined;
}

function isNoindex(html) {
  const metaTags = html.match(/<meta\b[^>]*>/gi) ?? [];
  return metaTags.some((tag) => {
    if ((getAttribute(tag, 'name') ?? '').toLowerCase() !== 'robots') return false;
    const directives = (getAttribute(tag, 'content') ?? '').toLowerCase().split(/[\s,]+/);
    return directives.includes('noindex');
  });
}

function routeForHtml(path) {
  const outputPath = relative(DIST_DIR, path).split(sep).join('/');
  if (outputPath === 'index.html') return '/';
  if (basename(outputPath) === 'index.html') {
    return `/${outputPath.slice(0, -'index.html'.length)}`;
  }
  return `/${outputPath}`;
}

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

async function removeStaleSitemaps() {
  const entries = await readdir(DIST_DIR, { withFileTypes: true });
  const staleFiles = entries
    .filter((entry) => entry.isFile() && /^sitemap-(?:index|\d+)\.xml$/.test(entry.name))
    .map((entry) => rm(join(DIST_DIR, entry.name)));
  await Promise.all(staleFiles);
}

async function generateSitemap() {
  const htmlFiles = await listHtmlFiles(DIST_DIR);
  const urls = [];

  for (const path of htmlFiles) {
    if (STATUS_PAGE_PATTERN.test(basename(path))) continue;

    const html = await readFile(path, 'utf8');
    if (isNoindex(html)) continue;

    const canonical = getCanonical(html);
    if (!canonical) {
      throw new Error(`Missing canonical URL in ${relative(DIST_DIR, path)}`);
    }

    const url = new URL(canonical);
    const route = routeForHtml(path);
    if (url.origin !== SITE_ORIGIN) {
      throw new Error(`Canonical URL uses the wrong origin in ${relative(DIST_DIR, path)}: ${canonical}`);
    }
    if (url.pathname !== route || url.search || url.hash) {
      throw new Error(`Canonical URL does not match its built route in ${relative(DIST_DIR, path)}: ${canonical}`);
    }

    urls.push(url.href);
  }

  const uniqueUrls = [...new Set(urls)].sort();
  if (uniqueUrls.length === 0) {
    throw new Error('Sitemap generation found no indexable canonical pages.');
  }

  const urlEntries = uniqueUrls
    .map((url) => `  <url>\n    <loc>${escapeXml(url)}</loc>\n  </url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`;

  await removeStaleSitemaps();
  await writeFile(join(DIST_DIR, 'sitemap.xml'), xml, 'utf8');
  console.log(`Generated sitemap.xml with ${uniqueUrls.length} canonical page URLs.`);
}

await generateSitemap();
