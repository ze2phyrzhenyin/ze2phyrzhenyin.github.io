import type { CollectionEntry } from 'astro:content';
import type { Lang } from '@/i18n/ui';

export function getProjectText(project: CollectionEntry<'projects'>, lang: Lang) {
  const text = project.data.i18n[lang] ?? project.data.i18n.en;
  return { ...text, cover: text.cover ?? project.data.cover };
}
