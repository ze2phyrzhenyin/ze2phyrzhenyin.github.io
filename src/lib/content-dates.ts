import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { CollectionEntry } from 'astro:content';

type TimedEntry = CollectionEntry<'blog'> | CollectionEntry<'essays'>;
type TimedCollection = 'blog' | 'essays';

interface ContentDates {
  uploadedAt: Date;
  updatedAt: Date;
}

function getEntryPath(entry: TimedEntry, collection: TimedCollection): string | undefined {
  const contentDir = join(process.cwd(), 'src', 'content', collection);
  const entryId = 'id' in entry && typeof entry.id === 'string' ? entry.id : `${entry.slug}.md`;
  const candidates = Array.from(new Set([
    entryId,
    `${entry.slug}.md`,
    `${entry.slug}.mdx`,
  ]));

  return candidates
    .map((candidate) => join(contentDir, candidate))
    .find((candidate) => existsSync(candidate));
}

function getGitDates(filePath: string): ContentDates | undefined {
  try {
    const relativePath = relative(process.cwd(), filePath);
    const output = execFileSync(
      'git',
      ['log', '--follow', '--format=%cI', '--', relativePath],
      { cwd: process.cwd(), encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    );
    const dates = output.trim().split('\n').filter(Boolean);

    if (dates.length === 0) return undefined;

    return {
      uploadedAt: new Date(dates[dates.length - 1]),
      updatedAt: new Date(dates[0]),
    };
  } catch {
    return undefined;
  }
}

export function getContentDates(entry: TimedEntry, collection: TimedCollection): ContentDates {
  const frontmatterUpdated = 'updated' in entry.data ? entry.data.updated : undefined;
  const fallback = {
    uploadedAt: entry.data.date,
    updatedAt: frontmatterUpdated ?? entry.data.date,
  };

  const entryPath = getEntryPath(entry, collection);
  if (!entryPath) return fallback;

  return getGitDates(entryPath) ?? fallback;
}
