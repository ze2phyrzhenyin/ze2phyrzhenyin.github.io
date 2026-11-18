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
  image?: { src: string; width: number; height: number; alt: Record<Lang, string> };
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
    venue: {
      en: 'Denmark · Copenhagen · University of Copenhagen',
      zh: '丹麦 · 哥本哈根 · 哥本哈根大学',
      fr: 'Danemark · Copenhague · Université de Copenhague',
    },
    image: {
      src: '/images/news/learning-theory-copenhagen.webp',
      width: 1179,
      height: 878,
      alt: {
        en: 'A lecturer writes on the board at the University of Copenhagen summer school.',
        zh: '哥本哈根大学暑校课堂上，讲师正在黑板上板书。',
        fr: 'Un enseignant écrit au tableau pendant l’école d’été à l’Université de Copenhague.',
      },
    },
  },
  {
    id: 'strings-privacy-2026',
    title: 'Summer School on Strings & Privacy 2026',
    titleLang: 'en',
    url: 'https://cpm2026.compute.dtu.dk/p/summer_school',
    startDate: '2026-06-13',
    endDate: '2026-06-14',
    venue: {
      en: 'Denmark · Copenhagen · Technical University of Denmark (DTU)',
      zh: '丹麦 · 哥本哈根 · 丹麦技术大学（DTU）',
      fr: 'Danemark · Copenhague · Université technique du Danemark (DTU)',
    },
    image: {
      src: '/images/news/strings-privacy-dtu.webp',
      width: 1179,
      height: 1578,
      alt: {
        en: 'Portrait at the summer school, wearing a DTU name badge.',
        zh: '暑校现场，佩戴 DTU 姓名牌的照片。',
        fr: 'Portrait à l’école d’été, avec un badge de la DTU.',
      },
    },
  },
  {
    id: 'cinderella-toulouse-2026',
    image: {
      src: '/images/news/cinderella-curtain-call.webp',
      width: 1600,
      height: 1200,
      alt: {
        zh: '《灰姑娘》谢幕时，演员们在紫色舞台灯光下鼓掌，一人手捧鲜花。',
        en: 'The Cinderella cast applauds under purple stage lights at the curtain call, one member holding a bouquet.',
        fr: 'Au salut de Cendrillon, les comédiens applaudissent sous les projecteurs violets. L’un d’eux tient un bouquet.',
      },
    },
    startDate: '2026-05-21',
    endDate: '2026-05-21',
    title: {
      zh: '话剧《灰姑娘》',
      en: 'Cinderella',
      fr: 'Cendrillon',
    },
    venue: {
      zh: '法国 · 图卢兹 · Théâtre du Chien Blanc',
      en: 'France · Toulouse · Théâtre du Chien Blanc',
      fr: 'France · Toulouse · Théâtre du Chien Blanc',
    },
    summary: {
      zh: '饰演国王',
      en: 'Played the King',
      fr: 'Rôle du roi',
    },
  },
  {
    id: 'shnu-computer-science-2026',
    image: {
      src: '/images/news/shnu-online-session.jpg',
      width: 882,
      height: 665,
      alt: {
        zh: '线上分享会的演示封面，标题为「中法计算机专业毕业生信息分享」',
        en: 'Opening slide of the online session for graduates of the Sino-French computer science programme',
        fr: 'Diapositive d’ouverture de la rencontre en ligne pour les diplômés du programme franco-chinois d’informatique',
      },
    },
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
