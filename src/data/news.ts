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
    venue: {
      en: 'France · Toulouse · Toulouse INP–ENSEEIHT (N7)',
      zh: '法国 · 图卢兹 · Toulouse INP–ENSEEIHT（N7）',
      fr: 'France · Toulouse · Toulouse INP–ENSEEIHT (N7)',
    },
    image: {
      src: '/images/news/ia-for-impact-n7.webp',
      width: 1179,
      height: 660,
      alt: {
        zh: '黑客松的五位队员手持奖牌和奖金支票合影。',
        en: 'Five hackathon teammates pose with their award plaque and prize cheque.',
        fr: 'Les cinq membres de l’équipe posent avec leur trophée et leur chèque.',
      },
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
    venue: {
      en: 'France · Toulouse · Toulouse Capitole University',
      zh: '法国 · 图卢兹 · 图卢兹第一大学（UT Capitole）',
      fr: 'France · Toulouse · Université Toulouse Capitole',
    },
    image: {
      src: '/images/news/ut-capitole-talk.webp',
      width: 1174,
      height: 2082,
      alt: {
        zh: '创业活动现场，演讲者站在听众面前作三分钟分享。',
        en: 'A speaker addresses the audience during a three-minute talk at the entrepreneurship event.',
        fr: 'Un intervenant présente son pitch de trois minutes devant le public lors de la rencontre entrepreneuriale.',
      },
    },
  },
  {
    id: 'nwafu-recruitment-toulouse-2026',
    startDate: '2026-08-21',
    endDate: '2026-08-21',
    title: {
      zh: '西北农林科技大学动物科技学院人才招聘巡回宣讲',
      en: 'Recruitment tour of the College of Animal Science and Technology, Northwest A&F University',
      fr: 'Tournée de recrutement de la faculté des sciences et technologies animales de la Northwest A&F University',
    },
    venue: {
      zh: '法国 · 图卢兹 · 图卢兹医学院',
      en: 'France · Toulouse · Toulouse Faculty of Medicine',
      fr: 'France · Toulouse · Faculté de médecine de Toulouse',
    },
    image: {
      src: '/images/news/nwafu-recruitment-toulouse.webp',
      width: 1179,
      height: 890,
      alt: {
        zh: '蓝天下，一座红砖建筑的绿色穹顶高出树梢。',
        en: 'The green dome of a red-brick building rises above the trees against a blue sky.',
        fr: 'Le dôme vert d’un bâtiment en briques rouges se détache au-dessus des arbres sur un ciel bleu.',
      },
    },
    summary: {
      zh: '观众 · 交流智慧牧业与计算机',
      en: 'Attendee · Discussed computing in smart livestock farming',
      fr: 'Dans le public · Échanges sur l’informatique appliquée à l’élevage de précision',
    },
  },
  {
    id: 'esslli-2026',
    title: '37th European Summer School in Logic, Language and Information (ESSLLI 2026)',
    titleLang: 'en',
    url: 'https://2026.esslli.eu/',
    startDate: '2026-08-03',
    endDate: '2026-08-14',
    venue: {
      en: 'Czech Republic · Prague · Czech Technical University in Prague (CTU)',
      zh: '捷克 · 布拉格 · 布拉格捷克理工大学（CTU）',
      fr: 'Tchéquie · Prague · Université technique tchèque de Prague (CTU)',
    },
    image: {
      src: '/images/news/esslli-prague.webp',
      width: 1179,
      height: 870,
      alt: {
        zh: 'ESSLLI 暑校期间的聚餐合照，大家围坐在圆桌旁。',
        en: 'Group photo around a dinner table during ESSLLI in Prague.',
        fr: 'Photo de groupe autour d’une table lors d’un dîner pendant ESSLLI à Prague.',
      },
    },
  },
  {
    id: 'imprecise-probabilities-2026',
    title: 'Summer School on Imprecise Probabilities 2026',
    titleLang: 'en',
    url: 'https://www.ifi.lmu.de/kiml/en/school26/',
    startDate: '2026-07-27',
    endDate: '2026-07-31',
    venue: {
      en: 'Germany · Munich · Ludwig Maximilian University of Munich (LMU)',
      zh: '德国 · 慕尼黑 · 慕尼黑大学（LMU）',
      fr: 'Allemagne · Munich · Université Louis-et-Maximilien de Munich (LMU)',
    },
    image: {
      src: '/images/news/imprecise-probabilities-lmu.webp',
      width: 1179,
      height: 904,
      alt: {
        zh: '教室前方投影着关于实践理性与认识理性的手写讲义。',
        en: 'Handwritten notes on practical and epistemic rationality projected at the front of the classroom.',
        fr: 'Des notes manuscrites sur la rationalité pratique et la rationalité épistémique sont projetées devant la classe.',
      },
    },
  },
  {
    id: 'epistemic-game-theory-2026',
    title: 'Eleventh Introductory Workshop on Epistemic Game Theory 2026',
    titleLang: 'en',
    url: 'https://www.epicenter.name/summercourse/',
    startDate: '2026-07-06',
    endDate: '2026-07-17',
    venue: {
      en: 'Netherlands · Maastricht · Maastricht University',
      zh: '荷兰 · 马斯特里赫特 · 马斯特里赫特大学',
      fr: 'Pays-Bas · Maastricht · Université de Maastricht',
    },
    image: {
      src: '/images/news/maastricht-game-theory.webp',
      width: 1179,
      height: 860,
      alt: {
        en: 'Participants at the workshop, with a game theory textbook and a course mug in the foreground.',
        zh: '研讨班学员围桌而坐，前方桌上放着博弈论教材和印有课程名称的马克杯。',
        fr: 'Des participants à l’atelier, avec au premier plan un manuel de théorie des jeux et une tasse au nom du cours.',
      },
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
    id: 'toulouse-urban-trail-2026',
    title: 'Kinetik Toulouse Urban Trail 2026',
    titleLang: 'fr',
    url: 'https://toulouse-urbantrail.fr/',
    startDate: '2026-04-19',
    endDate: '2026-04-19',
    location: {
      zh: { country: '法国', city: '图卢兹' },
      en: { country: 'France', city: 'Toulouse' },
      fr: { country: 'France', city: 'Toulouse' },
    },
    summary: {
      zh: '参加 14 公里组',
      en: 'Ran the 14 km race',
      fr: 'Participation au 14 km',
    },
    image: {
      src: '/images/news/toulouse-urban-trail.webp',
      width: 1179,
      height: 879,
      alt: {
        zh: '两位跑者在赛事现场的树荫下合影。',
        en: 'Two runners pose together under the trees at the race.',
        fr: 'Deux coureurs posent ensemble à l’ombre des arbres sur le site de la course.',
      },
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
      zh: '面向上海师范大学商学院中法计算机项目的学生',
      en: 'For students in the Sino-French computer science programme at Shanghai Normal University Business School.',
      fr: 'Pour les étudiants du programme franco-chinois d’informatique de l’école de commerce de l’Université normale de Shanghai.',
    },
    summary: {
      zh: '演讲者 · 分享计算机学习方法',
      en: 'Speaker · Approaches to studying computer science',
      fr: 'Intervenant · Méthodes de travail en informatique',
    },
  },
  {
    id: 'epita-ski-andorra-2026',
    startDate: '2026-01-09',
    endDate: '2026-01-10',
    title: {
      zh: '安道尔滑雪之行',
      en: 'Ski trip to Andorra',
      fr: 'Séjour au ski en Andorre',
    },
    venue: { zh: '安道尔', en: 'Andorra', fr: 'Andorre' },
    summary: {
      zh: '参加 EPITA 学生会（BDE）组织的滑雪活动',
      en: 'Joined the ski trip organised by EPITA’s student association (BDE)',
      fr: 'Participation au séjour organisé par le BDE de l’EPITA',
    },
    image: {
      src: '/images/news/epita-ski-andorra.webp',
      width: 1179,
      height: 1587,
      alt: {
        zh: '安道尔雪夜的自拍，头发和外套上落着雪。',
        en: 'A nighttime selfie in Andorra, with snow on the hair and coat.',
        fr: 'Selfie de nuit en Andorre, avec de la neige sur les cheveux et le manteau.',
      },
    },
  },
];
