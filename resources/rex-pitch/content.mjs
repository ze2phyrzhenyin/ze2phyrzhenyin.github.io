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
export const demoQuery = '?autoplay=0&loop=0';
export const slideCount = 10;
export const slideName = n => `slide-${String(n).padStart(2, '0')}`;
export const fontFile = 'fonts/archivo-latin-wdth.woff2';

// Version of the kit. Owner 2026-11-26: the page shows which upload it is. Raise `n` with every upload,
// add a line to `history`, rename the [[f:rex-pitch-v<n>...]] links in the copy (the build fails on a stale one),
// and set VERSION in ppt-studio decks/rex-pitch/deck.py: the cover slide carries the same number.
export const version = {n: 3, uploaded: '2026-11-26 07:55'};
// Length of files/rex-pitch-v<n>.mp4 in seconds (the build checks it against the file when ffprobe is available).
export const mp4Seconds = 155.5;
export const history = [
  {n: 1, uploaded: '2026-11-26 07:18', zh: '第一版，10 页。', en: 'First version, 10 slides.', fr: 'Première version, 10 diapositives.'},
  {n: 2, uploaded: '2026-11-26 07:41',
    zh: '新开场白；「off-the-shelf」；加载条更慢，停在 16%；新增可删的第 9 页（INSEE 数据）。',
    en: 'New opening; "off-the-shelf"; slower loading bar that stops at 16%; optional slide 9 with Insee data.',
    fr: 'Nouvelle ouverture ; « off-the-shelf » ; barre de chargement plus lente qui s’arrête à 16 % ; diapositive 9 facultative avec les chiffres de l’Insee.'},
  {n: 3, uploaded: '2026-11-26 07:55',
    zh: '每一页里的动画自己播完，不用点，翻页仍然点一下（图片版 PPTX 也一样）；去掉第 9 页 INSEE 数据；第 2 页改为「traditional businesses」；封面加 rex31.com；网页加英文讲稿全文。',
    en: 'Animations inside each slide play by themselves, one click per slide (also in the picture-only .pptx); Insee slide removed; slide 2 now says "traditional businesses"; rex31.com on the cover; full English script on this page.',
    fr: 'Les animations de chaque diapositive se jouent seules, un clic par diapositive (aussi dans le .pptx en images) ; diapositive Insee retirée ; la diapositive 2 dit « traditional businesses » ; rex31.com sur la couverture ; texte anglais complet sur cette page.'}
];
const v = `-v${version.n}`;

// Downloads, in the order of the list. Paths are relative to public/guides/rex-pitch/.
export const downloads = [
  {id: 'animated', file: `rex-pitch${v}.pptx`, format: 'PPTX'},
  {id: 'compat', file: `rex-pitch${v}-compat.pptx`, format: 'PPTX'},
  {id: 'staticPptx', file: `rex-pitch${v}-static.pptx`, format: 'PPTX'},
  {id: 'staticPdf', file: `rex-pitch${v}-static.pdf`, format: 'PDF'},
  {id: 'video', file: `rex-pitch${v}.mp4`, format: 'MP4'}
];

export const links = {
  franceNum: 'https://www.francenum.gouv.fr/files/2026-09/Barom%C3%A8tre%20France%20Num%202026%20-%20Rapport%20final.pdf'
};

// Sections in page order. The reading aid (`aid`) exists on the Chinese and French pages only.
export const sections = ['stage', 'deck', 'downloads', 'script', 'full', 'aid', 'sources'];

export const copy = {
  zh: {
    title: 'REX 路演备份',
    versionLine: '第 {n} 版 · {uploaded} 上传（巴黎时间）',
    historyHeading: '版本记录',
    historyItem: '第 {n} 版 · {uploaded}',
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
        '在这一页的浏览器里放动画版：点「全屏」，按 {{空格}} 开始，整段连续播放，页与页之间不停；再按 {{空格}} 暂停，{{→}} 跳到下一页，{{←}} 回到上一页。播放条右边的「1×」可以切换倍速（0.75× 到 2×）。',
        '有 PowerPoint：[[f:rex-pitch-v3.pptx]]，每一页里的动画自己播完，翻页时点一下。Keynote 或旧版 PowerPoint：[[f:rex-pitch-v3-compat.pptx]]。',
        '其他电脑：[[f:rex-pitch-v3-static.pdf]] 或 [[f:rex-pitch-v3-static.pptx]]。只有图片，没有动画，哪里都能打开。PPTX 里同一页的几张图按讲稿节奏自己切换，翻到下一页要点一下；PDF 全部手动翻。'
      ],
      video: '什么都点不了时：[[f:rex-pitch-v3.mp4]] 自己播放，节奏对着讲稿。',
      untested: 'PowerPoint 里的播放还没在我们的电脑上测过。到会场先在那台电脑上走一遍。'
    },
    deck: {heading: '动画版', frame: 'REX 路演动画版', fullscreen: '全屏', newTab: '在新标签页打开'},
    downloads: {
      heading: '下载',
      kinds: {
        animated: '动画版，PowerPoint 用',
        compat: 'Keynote 和旧版 PowerPoint 用',
        staticPptx: '只有图片，24 张；同一页的几张自己切换，翻页点一下；备注里是台词',
        staticPdf: '同样的 24 张图',
        video: '自动播放，节奏对着讲稿'
      },
      mb: 'MB', kb: 'KB'
    },
    script: {
      heading: '讲稿',
      meta: '限时 3 分钟。{words} 个英文词，语速平缓约 2 分 35 秒；MP4 连续播放 {mp4}。{click} 表示动画在这里自己进到下一步。',
      slide: '第 {n} 页',
      click: '下一步'
    },
    full: {heading: '英文讲稿全文', note: '最终英文讲稿连成段落，一页一段，方便通读和背稿。'},
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
    versionLine: 'Version {n} · uploaded {uploaded} (Paris time)',
    historyHeading: 'Versions',
    historyItem: 'Version {n} · {uploaded}',
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
        'Animated deck in this browser, below: press Full screen, then {{Space}} to start. It plays straight through without stopping between slides; {{Space}} again pauses, {{→}} jumps to the next slide, {{←}} goes back one. The “1×” button on the right of the bar changes the speed (0.75× to 2×).',
        'With PowerPoint: [[f:rex-pitch-v3.pptx]]. Each slide plays its animation by itself; one click moves to the next slide. With Keynote or an older PowerPoint: [[f:rex-pitch-v3-compat.pptx]].',
        'Any other computer: [[f:rex-pitch-v3-static.pdf]] or [[f:rex-pitch-v3-static.pptx]]. Pictures only, no animation; they open anywhere. In the .pptx the pictures of one slide follow each other on the speech timing and one click moves to the next slide; the PDF is turned by hand.'
      ],
      video: 'If nothing can be clicked: [[f:rex-pitch-v3.mp4]] plays by itself, timed to the speech.',
      untested: 'Playback in PowerPoint has not been tested on our machines. Rehearse once on the venue computer.'
    },
    deck: {heading: 'Animated deck', frame: 'REX pitch, animated deck', fullscreen: 'Full screen', newTab: 'Open in a new tab'},
    downloads: {
      heading: 'Downloads',
      kinds: {
        animated: 'Animated, for PowerPoint',
        compat: 'For Keynote and older PowerPoint',
        staticPptx: 'Pictures only, 24 pages; pages of one slide change by themselves, one click per slide; script in the notes',
        staticPdf: 'The same 24 pictures',
        video: 'Plays by itself, timed to the speech'
      },
      mb: 'MB', kb: 'kB'
    },
    script: {
      heading: 'Script',
      meta: '3-minute limit. {words} words, about 2 min 35 s at a calm pace; the MP4 runs {mp4} straight through. {click} marks where the animation moves on by itself.',
      slide: 'Slide {n}',
      click: 'Next step'
    },
    full: {heading: 'Full script', note: 'The final script as running text, one paragraph per slide, for reading through and rehearsing.'},
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
    versionLine: 'Version {n} · mise en ligne le {uploaded} (heure de Paris)',
    historyHeading: 'Versions',
    historyItem: 'Version {n} · {uploaded}',
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
        'Version animée dans ce navigateur, ci-dessous : bouton Plein écran, puis {{Espace}} pour lancer. Elle se déroule d’un bout à l’autre sans pause entre les diapositives ; {{Espace}} met en pause, {{→}} passe à la suivante, {{←}} revient à la précédente. Le bouton « 1× » à droite de la barre change la vitesse (de 0,75× à 2×).',
        'Avec PowerPoint : [[f:rex-pitch-v3.pptx]]. Chaque diapositive joue son animation toute seule ; un clic passe à la suivante. Avec Keynote ou un ancien PowerPoint : [[f:rex-pitch-v3-compat.pptx]].',
        "Sur tout autre ordinateur : [[f:rex-pitch-v3-static.pdf]] ou [[f:rex-pitch-v3-static.pptx]]. Images seules, sans animation ; ils s'ouvrent partout. Dans le .pptx, les images d’une même diapositive s’enchaînent seules au rythme du texte et un clic passe à la diapositive suivante ; le PDF se tourne à la main."
      ],
      video: 'Si rien ne peut être cliqué : [[f:rex-pitch-v3.mp4]] se lit tout seul, calé sur le texte.',
      untested: "La lecture dans PowerPoint n'a pas été testée sur nos machines. Prévoir une répétition sur l'ordinateur de la salle."
    },
    deck: {heading: 'Version animée', frame: 'Pitch REX, version animée', fullscreen: 'Plein écran', newTab: 'Ouvrir dans un nouvel onglet'},
    downloads: {
      heading: 'Téléchargements',
      kinds: {
        animated: 'Animé, pour PowerPoint',
        compat: 'Pour Keynote et les anciennes versions de PowerPoint',
        staticPptx: 'Images seules, 24 pages ; celles d’une même diapositive s’enchaînent seules, un clic par diapositive ; texte dans les notes',
        staticPdf: 'Les mêmes 24 images',
        video: 'Se lit tout seul, calé sur le texte'
      },
      mb: 'Mo', kb: 'ko'
    },
    script: {
      heading: 'Texte du pitch',
      meta: 'Limite : 3 minutes. {words} mots en anglais, environ 2 min 35 s à un rythme posé ; la vidéo MP4 dure {mp4} d’une traite. {click} marque le moment où l’animation passe seule à l’étape suivante.',
      slide: 'Diapositive {n}',
      click: 'Étape suivante'
    },
    full: {heading: 'Texte anglais en entier', note: 'Le texte final en continu, un paragraphe par diapositive, pour le relire et le répéter.'},
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
  ["Bonjour à tous. Je m'appelle Zhaoyang, je suis cofondateur de REX Digital & AI."],
  ["Même à l'heure de l'IA, beaucoup d'entreprises des secteurs traditionnels travaillent encore avec Excel et des tâches faites à la main,",
    'parce que les logiciels du marché ne correspondent pas à leurs besoins.',
    "C'est pour cela que nous sommes là. Nous aidons ces entreprises à moderniser leur fonctionnement grâce au numérique et à l'IA."],
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
