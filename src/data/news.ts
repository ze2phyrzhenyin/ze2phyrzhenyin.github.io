export type NewsItem = {
  id: string;
  title: string;
  titleLang: 'en' | 'fr';
  url: string;
  startDate: string;
  endDate: string;
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
  },
  {
    id: 'esslli-2026',
    title: '37th European Summer School in Logic, Language and Information (ESSLLI 2026)',
    titleLang: 'en',
    url: 'https://2026.esslli.eu/',
    startDate: '2026-08-03',
    endDate: '2026-08-14',
  },
  {
    id: 'imprecise-probabilities-2026',
    title: 'Summer School on Imprecise Probabilities 2026',
    titleLang: 'en',
    url: 'https://www.ifi.lmu.de/kiml/en/school26/',
    startDate: '2026-07-27',
    endDate: '2026-07-31',
  },
  {
    id: 'epistemic-game-theory-2026',
    title: 'Eleventh Introductory Workshop on Epistemic Game Theory 2026',
    titleLang: 'en',
    url: 'https://www.epicenter.name/summercourse/',
    startDate: '2026-07-06',
    endDate: '2026-07-17',
  },
  {
    id: 'learning-theory-2026',
    title: 'Learning Theory Summer School 2026',
    titleLang: 'en',
    url: 'https://ltsscopenhagen.github.io/',
    startDate: '2026-06-22',
    endDate: '2026-06-25',
  },
  {
    id: 'strings-privacy-2026',
    title: 'Summer School on Strings & Privacy 2026',
    titleLang: 'en',
    url: 'https://cpm2026.compute.dtu.dk/p/summer_school',
    startDate: '2026-06-13',
    endDate: '2026-06-14',
  },
];
