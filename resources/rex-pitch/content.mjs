// Content of /guides/rex-pitch/ : one structure, three languages.
// The spoken script is English and is read from SCRIPT-FINAL.md as written. SCRIPT.md holds the owner's Chinese draft.
// Inline marks in the copy: [[f:file]] download link, [[l:key|label]] external link (address in `links`),
// *title* a cited title, {{key}} a key on the keyboard, {click} the click marker, {words} the script's word count.

export const origin = 'https://zhaoyang.fr';
export const base = '/guides/rex-pitch/';
export const locales = ['zh', 'en', 'fr'];
export const htmlLang = {zh: 'zh-CN', en: 'en', fr: 'fr'};
export const hreflang = {zh: 'zh-Hans', en: 'en', fr: 'fr'};
export const languageNames = {zh: '中文', en: 'EN', fr: 'FR'};

// The deck is English only: every page shows the same player and the same files.
export const demo = 'demo/en/index.html';
export const demoQuery = '?mode=click&loop=0';
export const slideCount = 10;
export const slideName = n => `slide-${String(n).padStart(2, '0')}`;
export const fontFile = 'fonts/archivo-latin-wdth.woff2';

// Downloads, in the order of the list. Paths are relative to public/guides/rex-pitch/.
export const downloads = [
  {id: 'animated', file: 'rex-pitch.pptx', format: 'PPTX'},
  {id: 'compat', file: 'rex-pitch-compat.pptx', format: 'PPTX'},
  {id: 'staticPptx', file: 'rex-pitch-static.pptx', format: 'PPTX'},
  {id: 'staticPdf', file: 'rex-pitch-static.pdf', format: 'PDF'},
  {id: 'video', file: 'rex-pitch.mp4', format: 'MP4'}
];

export const links = {
  franceNum: 'https://www.francenum.gouv.fr/files/2026-09/Barom%C3%A8tre%20France%20Num%202026%20-%20Rapport%20final.pdf'
};

// Sections in page order. The reading aid (`aid`) exists on the Chinese and French pages only.
export const sections = ['stage', 'deck', 'downloads', 'script', 'aid', 'sources'];

export const copy = {
  zh: {
    title: 'REX 路演备份',
    description: 'REX Digital & AI 3 分钟英文路演的讲稿、静态幻灯片和动画版，会场电脑出问题时用。',
    lead: '3 分钟英文路演的讲稿、静态幻灯片和动画版。会场电脑出问题时，从这一页放。',
    skip: '跳到正文',
    back: '攻略总览',
    topbar: '攻略导航',
    languages: '语言',
    theme: {dark: '深色', light: '浅色', toDark: '切换为深色模式', toLight: '切换为浅色模式'},
    stage: {
      heading: '现场放映',
      ways: [
        '在这一页的浏览器里放动画版：点「全屏」。{{空格}}、{{→}} 或翻页笔前进一步，{{←}} 退回上一页。',
        '有 PowerPoint：[[f:rex-pitch.pptx]]。Keynote 或旧版 PowerPoint：[[f:rex-pitch-compat.pptx]]。',
        '其他电脑：[[f:rex-pitch-static.pdf]] 或 [[f:rex-pitch-static.pptx]]。只有图片，没有动画，哪里都能打开；每点一下翻一页，和动画版的点击一一对应。'
      ],
      video: '什么都点不了时：[[f:rex-pitch.mp4]] 自己播放，节奏对着讲稿。',
      untested: 'PowerPoint 里的播放还没在我们的电脑上测过。到会场先在那台电脑上走一遍。'
    },
    deck: {heading: '动画版', frame: 'REX 路演动画版', fullscreen: '全屏', newTab: '在新标签页打开'},
    downloads: {
      heading: '下载',
      kinds: {
        animated: '动画版，PowerPoint 用',
        compat: 'Keynote 和旧版 PowerPoint 用',
        staticPptx: '只有图片，23 页，一次点击一页，备注里是台词',
        staticPdf: '同样的 23 张图',
        video: '自动播放，节奏对着讲稿'
      },
      mb: 'MB', kb: 'KB'
    },
    script: {
      heading: '讲稿',
      meta: '限时 3 分钟。{words} 个英文词，语速平缓约 2 分 20 秒。{click} 表示点一下。',
      slide: '第 {n} 页',
      click: '点击'
    },
    aid: {
      heading: '中文原稿',
      note: '讲稿最初的中文版，原文照录。英文讲稿后来又改过几处，两者不完全对应。'
    },
    sources: {
      heading: '数据来源',
      report: '[[l:franceNum|*Baromètre France Num 2026*]]，法国企业总局（Direction générale des Entreprises），报告日期 2026 年 10 月 2 日，PDF，法文。',
      items: [
        '报告第 6 页：法国约有 240 万家中小微企业（TPE PME），9655 家企业参与调查。',
        '报告第 72 页：26% 的企业把「acquérir ou améliorer mes solutions numériques (logiciels)」（购买或改进软件）列为未来两年的数字化优先事项之一。基数：全部 9655 家受访企业。',
        '幻灯片第 8 页的 60 万是我们的估算（26% × 240 万），不是 France Num 公布的数字。',
        '幻灯片第 3 页的数字来自客户的生产数据库，2026 年 11 月 26 日读取：7971 张工单，7203 次手机检测，近 30 天 2182 张工单。页面上不写客户名称。'
      ]
    },
    footer: '2026-11-26 整理。'
  },

  en: {
    title: 'REX pitch: backup kit',
    description: 'Script, static slides and animated deck for the 3-minute English pitch of REX Digital & AI, for use when the venue computer fails.',
    lead: 'Script, static slides and animated deck for the 3-minute English pitch of REX Digital & AI. If the venue computer fails, present from this page.',
    skip: 'Skip to content',
    back: 'All guides',
    topbar: 'Guide navigation',
    languages: 'Language',
    theme: {dark: 'Dark', light: 'Light', toDark: 'Switch to dark mode', toLight: 'Switch to light mode'},
    stage: {
      heading: 'On stage',
      ways: [
        'Animated deck in this browser, below: press Full screen. {{Space}}, {{→}} or the clicker moves one step; {{←}} goes back one slide.',
        'With PowerPoint: [[f:rex-pitch.pptx]]. With Keynote or an older PowerPoint: [[f:rex-pitch-compat.pptx]].',
        'Any other computer: [[f:rex-pitch-static.pdf]] or [[f:rex-pitch-static.pptx]]. Pictures only, no animation; they open anywhere. One page per click, so the clicks match the animated deck.'
      ],
      video: 'If nothing can be clicked: [[f:rex-pitch.mp4]] plays by itself, timed to the speech.',
      untested: 'Playback in PowerPoint has not been tested on our machines. Rehearse once on the venue computer.'
    },
    deck: {heading: 'Animated deck', frame: 'REX pitch, animated deck', fullscreen: 'Full screen', newTab: 'Open in a new tab'},
    downloads: {
      heading: 'Downloads',
      kinds: {
        animated: 'Animated, for PowerPoint',
        compat: 'For Keynote and older PowerPoint',
        staticPptx: 'Pictures only, 23 slides, one per click, script in the notes',
        staticPdf: 'The same 23 pictures',
        video: 'Plays by itself, timed to the speech'
      },
      mb: 'MB', kb: 'kB'
    },
    script: {
      heading: 'Script',
      meta: '3-minute limit. {words} words, about 2 min 20 s at a calm pace. {click} marks one click.',
      slide: 'Slide {n}',
      click: 'Click'
    },
    aid: null,
    sources: {
      heading: 'Sources',
      report: "[[l:franceNum|*Baromètre France Num 2026*]], Direction générale des Entreprises, report dated 2 October 2026, PDF in French.",
      items: [
        'Report page 6: about 2.4 million SMEs (TPE PME) in France; 9,655 businesses answered the survey.',
        'Report page 72: 26% list « acquérir ou améliorer mes solutions numériques (logiciels) » (acquire or improve their software) among their digital priorities for the next two years. Base: all 9,655 respondents.',
        'Slide 8: 600,000 is our estimate, 26% × 2.4 million. France Num does not publish this figure.',
        "Slide 3: figures from the client's production database, read on 26 November 2026: 7,971 work orders, 7,203 phone tests, 2,182 work orders in the last 30 days. The client is not named."
      ]
    },
    footer: 'Updated 26 November 2026.'
  },

  fr: {
    title: 'Pitch REX : kit de secours',
    description: "Texte, diapositives fixes et version animée du pitch de 3 minutes en anglais de REX Digital & AI, en cas de panne de l'ordinateur de la salle.",
    lead: "Texte, diapositives fixes et version animée du pitch de 3 minutes en anglais de REX Digital & AI. Si l'ordinateur de la salle ne marche pas, la présentation se fait depuis cette page.",
    skip: 'Aller au contenu',
    back: 'Tous les guides',
    topbar: 'Navigation du guide',
    languages: 'Langue',
    theme: {dark: 'Sombre', light: 'Clair', toDark: 'Passer en mode sombre', toLight: 'Passer en mode clair'},
    stage: {
      heading: 'Sur scène',
      ways: [
        'Version animée dans ce navigateur, ci-dessous : bouton Plein écran. {{Espace}}, {{→}} ou la télécommande avancent d’une étape ; {{←}} revient à la diapositive précédente.',
        'Avec PowerPoint : [[f:rex-pitch.pptx]]. Avec Keynote ou un ancien PowerPoint : [[f:rex-pitch-compat.pptx]].',
        "Sur tout autre ordinateur : [[f:rex-pitch-static.pdf]] ou [[f:rex-pitch-static.pptx]]. Images seules, sans animation ; ils s'ouvrent partout. Une page par clic : les clics suivent ceux de la version animée."
      ],
      video: 'Si rien ne peut être cliqué : [[f:rex-pitch.mp4]] se lit tout seul, calé sur le texte.',
      untested: "La lecture dans PowerPoint n'a pas été testée sur nos machines. Prévoir une répétition sur l'ordinateur de la salle."
    },
    deck: {heading: 'Version animée', frame: 'Pitch REX, version animée', fullscreen: 'Plein écran', newTab: 'Ouvrir dans un nouvel onglet'},
    downloads: {
      heading: 'Téléchargements',
      kinds: {
        animated: 'Animé, pour PowerPoint',
        compat: 'Pour Keynote et les anciennes versions de PowerPoint',
        staticPptx: 'Images seules, 23 diapositives, une par clic, texte dans les notes',
        staticPdf: 'Les mêmes 23 images',
        video: 'Se lit tout seul, calé sur le texte'
      },
      mb: 'Mo', kb: 'ko'
    },
    script: {
      heading: 'Texte du pitch',
      meta: 'Limite : 3 minutes. {words} mots en anglais, environ 2 min 20 s à un rythme posé. {click} marque un clic.',
      slide: 'Diapositive {n}',
      click: 'Clic'
    },
    aid: {heading: 'Traduction française', note: null},
    sources: {
      heading: 'Sources',
      report: '[[l:franceNum|*Baromètre France Num 2026*]], Direction générale des Entreprises, rapport daté du 02/10/2026, PDF.',
      items: [
        'Rapport, page 6 : environ 2,4 millions de TPE PME en France ; 9 655 entreprises ont répondu.',
        'Rapport, page 72 : 26 % citent « acquérir ou améliorer mes solutions numériques (logiciels) » parmi leurs priorités numériques des deux prochaines années. Base : les 9 655 répondants.',
        'Diapositive 8 : 600 000 est notre estimation (26 % × 2,4 millions), pas un chiffre publié par France Num.',
        "Diapositive 3 : chiffres tirés de la base de production du client le 26 novembre 2026 : 7 971 bons de travail, 7 203 tests de téléphones, 2 182 bons de travail sur les 30 derniers jours. Le client n'est pas nommé."
      ]
    },
    footer: 'Mis à jour le 26 novembre 2026.'
  }
};

// French translation of SCRIPT-FINAL.md, slide by slide. Written as French, not word for word.
export const translationFr = [
  ["Nous aidons les entreprises des secteurs traditionnels à moderniser leur fonctionnement grâce au numérique et à l'IA."],
  ["Aujourd'hui, beaucoup d'entre elles tournent encore avec Excel, des e-mails et des tâches faites à la main.",
    'Les logiciels standard répondent rarement à leurs besoins précis.'],
  ["Par exemple, nous avons développé un système de gestion intelligent pour une société internationale d'entreposage de produits électroniques.",
    'Il réunit sur une seule plateforme les bons de travail, le stock, les tests de smartphones et la facturation.',
    'Nous leur avons même fait leur propre agenda et leur propre messagerie.',
    'Le système sert déjà tous les jours.'],
  ['Mais chaque entreprise est différente,',
    "en particulier dans l'industrie, l'agriculture et la logistique.",
    'À chaque projet, nous comprenons plus vite des besoins complexes et nous en faisons des outils simples, faciles à prendre en main.'],
  ["Et pourtant, même avec ce système, une partie des clients de notre client trouvent encore long et pénible d'apprendre un nouveau logiciel."],
  ['Nous voulons donc aller plus loin.',
    "Et si les gens n'avaient plus à s'adapter au logiciel ?",
    "Et si c'était le logiciel qui s'adaptait à eux ?"],
  ['Imaginez un commerçant qui passe commande en parlant à un assistant IA.',
    "Une entreprise de logistique reçoit la commande sur son tableau de bord.",
    'Et le comptable continue de travailler dans Excel.',
    'Trois interfaces différentes. Un seul système connecté. Chacun travaille à sa façon, et tout le monde travaille ensemble.',
    "C'est l'idée du nouveau produit que nous développons en ce moment."],
  ["D'après l'enquête 2026 de France Num, environ une TPE PME française sur quatre considère l'achat ou la mise à niveau de logiciels comme une priorité pour les deux prochaines années.",
    'Cela fait à peu près 600 000 entreprises.'],
  ['Nous voulons rendre la transformation numérique facile pour toutes les entreprises, quels que soient leur secteur et leurs compétences numériques.'],
  ["Parce que nous pensons que c'est au logiciel de s'adapter aux gens, et pas l'inverse."]
];
