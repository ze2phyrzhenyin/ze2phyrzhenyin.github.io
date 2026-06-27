import { getCollection } from 'astro:content';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const contentRoot = join(process.cwd(), 'src', 'content');

function hasMarkdownContent(dir: string): boolean {
  if (!existsSync(dir)) return false;

  return readdirSync(dir, { withFileTypes: true }).some((entry) => {
    if (entry.name.startsWith('.') || entry.name.startsWith('_')) return false;

    const entryPath = join(dir, entry.name);
    if (entry.isDirectory()) return hasMarkdownContent(entryPath);

    return entry.isFile() && /\.(md|mdx)$/.test(entry.name);
  });
}

function hasCollectionContent(collection: 'blog' | 'essays' | 'projects'): boolean {
  return hasMarkdownContent(join(contentRoot, collection));
}

/** Sort posts by date descending */
export function sortByDate<T extends { data: { date: Date } }>(items: T[]): T[] {
  return items.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Format date to readable string */
export function formatDate(date: Date, opts?: Intl.DateTimeFormatOptions): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...opts,
  });
}

/** Format date and time in the site's primary timezone */
export function formatDateTime(date: Date, locale = 'en-US', opts?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Europe/Paris',
    ...opts,
  }).format(date);
}

/** Group items by a key */
export function groupBy<T>(items: T[], key: (item: T) => string): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const k = key(item);
    (acc[k] ??= []).push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

/** Get all published blog posts sorted by date */
export async function getAllPosts() {
  if (!hasCollectionContent('blog')) return [];
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return sortByDate(posts);
}

/** Get all published essays sorted by date */
export async function getAllEssays() {
  if (!hasCollectionContent('essays')) return [];
  const essays = await getCollection('essays', ({ data }) => !data.draft);
  return sortByDate(essays);
}

/** Get all projects sorted by date */
export async function getAllProjects() {
  if (!hasCollectionContent('projects')) return [];
  const projects = await getCollection('projects');
  return projects.sort((a, b) => {
    if (a.data.featured && !b.data.featured) return -1;
    if (!a.data.featured && b.data.featured) return 1;
    return b.data.date.valueOf() - a.data.date.valueOf();
  });
}

/** Get all publications sorted by year */
export async function getAllPublications() {
  const pubs = await getCollection('publications');
  return pubs.sort((a, b) => b.data.year - a.data.year);
}
