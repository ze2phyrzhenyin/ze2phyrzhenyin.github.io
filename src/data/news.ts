import type { Lang } from '@/i18n/ui';

export type NewsItem = {
  id: string;
  title: string;
  titleLang: 'en' | 'fr';
  url: string;
  startDate: string;
  endDate: string;
  location: Record<Lang, { country: string; city: string }>;
  award?: string;
};

// Newest first. Dates and links refer to the events' official pages.
export const newsItems: NewsItem[] = [
  {
    id: 'ia-for-impact-2026',
    title: 'Hackathon IA for Impact 2026',
    titleLang: 'fr',
    url: 'https://lamelee.com/hackathon-ia-for-impact-2026/',
    startDate: '2026-10-09',
    endDate: '2026-10-10',
    award: 'Prix Coup de Cœur',
    location: {
      en: { country: 'France', city: 'Toulouse' },
      zh: { country: '法国', city: '图卢兹' },
      fr: { country: 'France', city: 'Toulouse' },
    },
  },
  {
    id: 'esslli-2026',
    title: '37th European Summer School in Logic, Language and Information (ESSLLI 2026)',
    titleLang: 'en',
    url: 'https://2026.esslli.eu/',
    startDate: '2026-08-03',
    endDate: '2026-08-14',
    location: {
      en: { country: 'Czech Republic', city: 'Prague' },
      zh: { country: '捷克', city: '布拉格' },
      fr: { country: 'République tchèque', city: 'Prague' },
    },
  },
  {
    id: 'imprecise-probabilities-2026',
    title: 'Summer School on Imprecise Probabilities 2026',
    titleLang: 'en',
    url: 'https://www.ifi.lmu.de/kiml/en/school26/',
    startDate: '2026-07-27',
    endDate: '2026-07-31',
    location: {
      en: { country: 'Germany', city: 'Munich' },
      zh: { country: '德国', city: '慕尼黑' },
      fr: { country: 'Allemagne', city: 'Munich' },
    },
  },
  {
    id: 'epistemic-game-theory-2026',
    title: 'Eleventh Introductory Workshop on Epistemic Game Theory 2026',
    titleLang: 'en',
    url: 'https://www.epicenter.name/summercourse/',
    startDate: '2026-07-06',
    endDate: '2026-07-17',
    location: {
      en: { country: 'Netherlands', city: 'Maastricht' },
      zh: { country: '荷兰', city: '马斯特里赫特' },
      fr: { country: 'Pays-Bas', city: 'Maastricht' },
    },
  },
  {
    id: 'learning-theory-2026',
    title: 'Learning Theory Summer School 2026',
    titleLang: 'en',
    url: 'https://ltsscopenhagen.github.io/',
    startDate: '2026-06-22',
    endDate: '2026-06-25',
    location: {
      en: { country: 'Denmark', city: 'Copenhagen' },
      zh: { country: '丹麦', city: '哥本哈根' },
      fr: { country: 'Danemark', city: 'Copenhague' },
    },
  },
  {
    id: 'strings-privacy-2026',
    title: 'Summer School on Strings & Privacy 2026',
    titleLang: 'en',
    url: 'https://cpm2026.compute.dtu.dk/p/summer_school',
    startDate: '2026-06-13',
    endDate: '2026-06-14',
    location: {
      en: { country: 'Denmark', city: 'Kongens Lyngby' },
      zh: { country: '丹麦', city: '孔恩斯灵比' },
      fr: { country: 'Danemark', city: 'Kongens Lyngby' },
    },
  },
];
