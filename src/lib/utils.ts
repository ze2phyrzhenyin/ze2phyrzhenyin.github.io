import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

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

/** Estimate reading time */
export function readingTime(body: string): string {
  const wpm = 200;
  const words = body.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wpm);
  return `${minutes} min read`;
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
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return sortByDate(posts);
}

/** Get all published essays sorted by date */
export async function getAllEssays() {
  const essays = await getCollection('essays', ({ data }) => !data.draft);
  return sortByDate(essays);
}

/** Get all projects sorted by date */
export async function getAllProjects() {
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

/** Badge class by category */
export function categoryBadge(cat: string): string {
  const map: Record<string, string> = {
    logic: 'badge-logic',
    math: 'badge-math',
    ai: 'badge-ai',
    cs: 'badge-cs',
    essay: 'badge-essay',
  };
  return map[cat] ?? 'tag';
}
