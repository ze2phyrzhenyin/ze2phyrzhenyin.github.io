import type { Lang } from '@/i18n/ui';

export type NewsItem = {
  id: string;
  title: string | Record<Lang, string>;
  titleLang?: 'en' | 'fr';
  url?: string;
  startDate: string;
  endDate: string;
  venue?: Record<Lang, string>;
  audience?: Record<Lang, string>;
  summary?: Record<Lang, string>;
  location?: Record<Lang, { country: string; city: string }>;
  award?: string;
  role?: 'lightning-talk-speaker';
};

// Newest first. Dates and links refer to the events' official pages.
export const newsItems: NewsItem[] = [
  {
    id: 'enac-vibe-coding-2026',
    startDate: '2026-11-19',
    endDate: '2026-11-19',
    title: {
      zh: '小型 Vibe Coding 分享会',
      en: 'Small-group vibe coding meetup',
      fr: 'Rencontre en petit comité autour du vibe coding',
    },
    venue: {
      zh: '法国国立民航大学（ENAC）',
      en: 'École nationale de l’aviation civile (ENAC)',
      fr: 'École nationale de l’aviation civile (ENAC)',
    },
    summary: {
      zh: '演讲者',
      en: 'Speaker',
      fr: 'Intervenant',
    },
  },
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
    id: 'ut-capitole-entrepreneurship-2026',
    title: "Entreprendre à UT Capitole : lancement de la communauté d’entrepreneur",
    titleLang: 'fr',
    url: 'https://www.ut-capitole.fr/accueil/international/engage-eu-universite-europeenne/engagement-dans-la-societe/lab-engage/entreprendre-a-ut-capitole-lancement-de-la-communaute-dentrepreneur',
    startDate: '2026-09-23',
    endDate: '2026-09-23',
    role: 'lightning-talk-speaker',
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
      en: { country: 'Denmark', city: 'Copenhagen' },
      zh: { country: '丹麦', city: '哥本哈根' },
      fr: { country: 'Danemark', city: 'Copenhague' },
    },
  },
  {
    id: 'shnu-computer-science-2026',
    startDate: '2026-03-01',
    endDate: '2026-03-01',
    title: {
      zh: '线上分享会',
      en: 'Online sharing session',
      fr: 'Rencontre en ligne',
    },
    audience: {
      zh: '面向上海师范大学商学院中法计算机项目的学生。',
      en: 'For students in the Sino-French computer science programme at Shanghai Normal University Business School.',
      fr: 'Pour les étudiants du programme franco-chinois d’informatique de l’école de commerce de l’Université normale de Shanghai.',
    },
    summary: {
      zh: '演讲者·分享计算机学习方法',
      en: 'Speaker · Approaches to studying computer science',
      fr: 'Intervenant · Méthodes de travail en informatique',
    },
  },
];
