import type { CollectionEntry } from 'astro:content';
import type { Lang } from '@/i18n/ui';

export function getProjectText(project: CollectionEntry<'projects'>, lang: Lang) {
  return project.data.i18n[lang] ?? project.data.i18n.en;
}
