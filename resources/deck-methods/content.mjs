// Content of /guides/deck-methods/ : one structure, three languages.
// Chinese is the source (ppt-studio docs/METHODS.md). English and French are written, not translated word for word.
// Inline marks in the copy: [[key|label]] external link (address in `links`), *title* a work's title, `code`.

export const origin = 'https://zhaoyang.fr';
export const base = '/guides/deck-methods/';
export const locales = ['zh', 'en', 'fr'];
export const htmlLang = {zh: 'zh-CN', en: 'en', fr: 'fr'};
export const hreflang = {zh: 'zh-Hans', en: 'en', fr: 'fr'};
export const languageNames = {zh: '中文', en: 'EN', fr: 'FR'};
export const sections = ['methods', 'works', 'checklist', 'better', 'status', 'downloads'];

export const links = {
  fujiFilm: 'https://vimeo.com/407652583',
  fujiFile: 'https://note.com/yoshifujidesign/n/nbea8b9ce928e',
  montauk: 'https://slamdance.com/wp-content/uploads/2024/07/Stranger_Things_-_Pitch-Deck.pdf',
  hyperloop: 'https://www.slidor.fr/productions/hyperloop-transportation-technologies',
  monument: 'https://media.gdcvault.com/gdcchina14/presentations/833764_KenWong_KeynoteMonumentValley_BI.pdf#page=14',
  smoke: 'https://www.slideshare.net/slideshow/smoke-the-convenient-truth-5602255/5602255#54',
  pitchDeck: 'https://pitch.com/presentations/Series-B-pitch-deck-55EVgG5xwWBf4QTimp4asXQk',
  pitchBlog: 'https://pitch.com/blog/how-we-built-the-pitch-deck-for-our-85m-series-b',
  bilibili: 'https://www.bilibili.com/video/BV1EE41197TW/',
  puma: 'https://www.slidor.fr/productions/puma',
  wittens: 'https://acko.net/files/fullfrontal/fullfrontal/wdcode/online.html',
  pptMaster: 'https://github.com/hugohe3/ppt-master',
  officeCli: 'https://github.com/iOfficeAI/OfficeCLI',
  slidev: 'https://sli.dev/guide/exporting',
  domToPptx: 'https://www.npmjs.com/package/dom-to-pptx',
  hyperframes: 'https://github.com/heygen-com/hyperframes',
  remotion: 'https://www.remotion.dev/docs/license/pricing.md',
  reveal: 'https://github.com/hakimel/reveal.js/releases/tag/6.0.0'
};

// The reel: seven methods, the slides that show each one, and the work each method comes from.
export const chapters = [
  {id: 'cover', slides: [1, 1], work: 'montauk'},
  {id: 'kinetic', slides: [2, 2], work: 'fuji'},
  {id: 'frames', slides: [3, 3], work: 'fuji'},
  {id: 'pattern', slides: [4, 5], work: 'pitch'},
  {id: 'cuts', slides: [6, 10], work: 'smoke'},
  {id: 'layout', slides: [11, 13], work: 'monument'},
  {id: 'crop', slides: [14, 14], work: 'hyperloop'}
];

export const works = [
  {id: 'fuji', links: ['fujiFilm', 'fujiFile']},
  {id: 'montauk', links: ['montauk']},
  {id: 'hyperloop', links: ['hyperloop']},
  {id: 'monument', links: ['monument']},
  {id: 'smoke', links: ['smoke']},
  {id: 'pitch', links: ['pitchDeck', 'pitchBlog']},
  {id: 'bilibili', links: ['bilibili']},
  {id: 'puma', links: ['puma']},
  {id: 'wittens', links: ['wittens']}
];

// Downloads: three files per language. The page's own language is listed first.
export const fileKinds = [
  {id: 'keyframed', suffix: '.pptx', format: 'PPTX'},
  {id: 'stock', suffix: '-compat.pptx', format: 'PPTX'},
  {id: 'video', suffix: '.mp4', format: 'MP4'}
];

export const copy = {
  zh: {
    title: 'PPT 手法总表',
    description: '看不出是 PPT 的演示文稿用了哪些手法、怎么做、现在有什么更好的路线。附可播放的样片，.pptx 和 MP4 可下载。',
    skip: '跳到正文',
    back: '攻略总览',
    topbar: '攻略导航',
    languages: '语言',
    theme: {dark: '深色', light: '浅色', toDark: '切换为深色模式', toLight: '切换为浅色模式'},
    reel: '手法样片',
    credits: '浏览器预览，和 .pptx 出自同一个 Python 脚本：15 页、254 个形状、428 个动画行为，生成用 5 秒。地球照片：阿波罗 17 号，NASA，1972。第 6 到 10 页的数字来自 FUJI《PowerPoint Motion Graphics 2020》的原始文件。',
    nav: {label: '本页内容', methods: '手法', works: '作品', checklist: '做法清单', better: '更好的办法', status: '本项目进度', downloads: '下载'},
    methods: {
      heading: '手法', seen: '观众看到', built: '做法', from: '出处',
      items: {
        cover: {
          name: '道具封面', play: '播放第 1 页',
          seen: '文件本身是故事里的一件东西。《Montauk》是一本磨损的旧平装书，样片是一张幻灯片卡纸。',
          built: '纸张、灰尘、暗角用程序算成透明图。PowerPoint 没有混合模式：纹理烤进图里，或者做成半透明图盖在上面。照片级的旧书、旧海报要实拍或生成的素材。'
        },
        kinetic: {
          name: '字演字义', play: '播放第 2 页',
          seen: '一页一个镜头，整页是一条时间轴。三个词各按字义动：重、散、对齐成行。',
          built: '全部设成「与上一动画同时」，靠延迟排时间。字要逐字动，先转成形状：合并形状里的「拆分」。FUJI 的 19 页里有 2 063 个动画行为。'
        },
        frames: {
          name: '逐帧', play: '播放第 3 页',
          seen: '手绘的旋涡在动，每一帧是另画的一张。',
          built: '一组形状，每个只出现 0.05 秒：每 0.05 秒出现一个、消失一个。'
        },
        pattern: {
          name: '规律与例外', play: '播放第 4、5 页',
          seen: '同一张格子出现两次，第二次变了状态。Pitch 的第 2 页是四个老工具各配两个新工具；第 3 页同一张格子变灰，多出一列彩色的 PowerPoint 和 Pitch。',
          built: '两页用平滑（Morph）接起来。平滑靠名字配对：两页里的对象用同一个名字，名字以两个感叹号开头，类型相同，每页唯一。'
        },
        cuts: {
          name: '硬切', play: '播放第 6 到 10 页',
          seen: '翻页当剪辑。《SMOKE》把一句 15 个词的话拆成 15 次点击：黑底 1 到 3 个词，白底一张照片，交替。',
          built: '没有转场。文字锚点固定在左 5%、上 28%，每点一下补完一个分句。要自动播放，换页设成 0 秒。'
        },
        layout: {
          name: '固定版式', play: '播放第 11 到 13 页',
          seen: '版式固定，只换画。《纪念碑谷》演讲第 14 到 18 页：画板在左侧，占宽 42%，上下出血；右侧标题、细线、一句话，五页里标题坐标不变。',
          built: '版式固定下来，连续几页只换一个元素。字只放在白底上，不压在画上。样片的三页用平滑接续，等距图形是代码画的。'
        },
        crop: {
          name: '裁切', play: '播放第 14 页',
          seen: '主体被页面边缘裁掉一截。HyperloopTT 把同一个对象放在三页里看：车外、剖面、车内。',
          built: '让主体碰到页面边缘，被边缘裁掉；居中放在框里的东西像贴上去的。把图片裁成窗口，两页窗口位置不同，平滑会做出推拉和视差。'
        }
      }
    },
    works: {
      heading: '作品',
      columns: ['作品', '看哪里', '手法', '做法'],
      items: {
        fuji: {
          name: 'FUJI《PowerPoint Motion Graphics 2020》', short: 'FUJI《PowerPoint Motion Graphics 2020》',
          where: '成片；原始 .pptx 的动画窗格',
          method: '一页一个镜头，整页是一条时间轴',
          how: '19 页，2 063 个动画行为，1.37 MB。每个效果都设「与上一动画同时」加绝对延迟；页面 0 秒自动换页，换页就是切镜头；字拆成单字母形状；手绘旋涡是一组形状，每 0.05 秒出现一个、消失一个；页间用平滑（Morph）接续。',
          links: {fujiFilm: '看成片', fujiFile: '取原始 .pptx'}
        },
        montauk: {
          name: '《怪奇物语》早期提案《Montauk》', short: '《Montauk》',
          where: '第 1 到 5 页，然后整本',
          method: '文件本身是故事里的一件东西',
          how: '23 页，3:4 竖版，每页是一张图。封面是磨损的旧平装书。正文 11 页、剧照 10 页严格交替。正文页用同一张泛黄纸扫描图，页眉、细线、只标奇数页码。剧照印在折过的黑纸上，下面固定三行：片名、导演、年份和片厂。全书一种衬线字，不加粗，不用列表。',
          links: {montauk: '打开 PDF'}
        },
        hyperloop: {
          name: 'HyperloopTT × Slidor', short: 'HyperloopTT × Slidor',
          where: '黑底剖面页；Passenger Journey 页',
          method: '同一个对象换三个位置看',
          how: '车外、剖面、车内各一页。每页一条竖细线，同时当页边、坐标轴、时间线和轨道。主体被页面边缘裁掉一截。红底车头那张是网页横幅，幻灯片里是黑底。',
          links: {hyperloop: '看 Slidor 页面'}
        },
        monument: {
          name: '《纪念碑谷》主设计师 GDC 演讲', short: '《纪念碑谷》GDC 演讲',
          where: '第 14 到 18 页',
          method: '版式固定，只换画',
          how: '41 页。画板在左侧，占宽 42%，上下出血；右侧标题、细线、一句话，五页里标题坐标不变。字只放在白底上，从不压在画上。每页英文词数中位数 6。',
          links: {monument: '打开 PDF 第 14 页'}
        },
        smoke: {
          name: '《SMOKE - The Convenient Truth》', short: '《SMOKE - The Convenient Truth》',
          where: '第 54 到 68 页',
          method: '翻页当剪辑',
          how: '78 页，4:3，没有转场。一句 15 个词的话拆成 15 次点击：黑底 1 到 3 个词，白底一张照片，交替。文字锚点固定在左 5%、上 28%。七张照片是七张不同的图库照片，共同点是白底、机位贴地朝脚。全稿每页词数中位数 5。',
          links: {smoke: '从第 54 页看'}
        },
        pitch: {
          name: 'Pitch 8 500 万美元 B 轮融资稿', short: 'Pitch B 轮融资稿',
          where: '第 2、3 页',
          method: '同一张格子出现两次，第二次变了状态',
          how: '第 2 页：四个老工具各配两个新工具。第 3 页：同一张格子变灰，多出一列彩色的 PowerPoint 和 Pitch。标题是一句话，其中一段上色，只读上色的部分也成文。团队先开工作坊定故事，再做页面；讲的一份和给数据的一份分开。',
          links: {pitchDeck: '打开融资稿', pitchBlog: '读制作说明'}
        },
        bilibili: {
          name: 'ACE 哔哩用 PPT 复刻苹果 2019 发布会动画', short: 'ACE 哔哩',
          where: 'P2 对比，P3 工程拆解',
          method: '逐帧对着原片还原',
          how: '作者自述约 80 小时，PowerPoint 365。视频本身没看，只核对了简介和分 P。',
          links: {bilibili: '在 B 站看'}
        },
        puma: {
          name: 'PUMA 年度大会 × Slidor', short: 'PUMA × Slidor',
          where: 'A$AP Rocky、Fenty × Puma、Speedcat 三组',
          method: '杂志版式搬上大屏',
          how: '21 张图里 16 张是 3.75:1 超宽幅，推测对应会场的拼接屏。页边距等于栏间距，内容不跨屏缝。一种字体，字号从页高的 2% 到 30%。实心标题后面叠几层描边的同一个词。',
          links: {puma: '看 Slidor 页面'}
        },
        wittens: {
          name: 'Steven Wittens《Making things with Maths》', short: 'Steven Wittens',
          where: 'Math Machines 一节',
          method: '页面里是一个一步步变化的三维场景',
          how: '2013 年，deck.js 加 MathBox（WebGL）。每个场景由一段步骤脚本驱动，点一下改一次场景状态，线段长成曲线不用换页。按住 Shift 全局放慢到五分之一。',
          links: {wittens: '打开演示'}
        }
      },
      note: '三份 Slidor 和 Pitch 的版面本身只是矩形、线和字。HyperloopTT 靠三维渲染图，PUMA 靠广告大片，Pitch 靠定制插画和真实产品界面：没有这些素材，版式做对了也出不来那个效果。'
    },
    checklist: {
      heading: '做法清单',
      groups: [
        {title: '内容', items: [
          '先写故事，再开页面。一页一件事，观众 3 秒内能看完。',
          '标题写成一句结论，页面其余部分是它的证据。',
          '一句话可以跨好几页，每点一下补完一个分句。',
          '讲的稿和发给人看的稿分开做。'
        ]},
        {title: '版式', items: [
          '版式固定下来，连续几页只换一个元素。',
          '一种字体，五六个差得很远的字号。',
          '让主体碰到页面边缘，被边缘裁掉。居中放在框里的东西像贴上去的。',
          '字和图分开放。要压图就垫一块纯色底。',
          '一页只有一处强调色。'
        ]},
        {title: '动画（PowerPoint 里手工做）', items: [
          '全部设成「与上一动画同时」，靠延迟排时间。这就是时间轴。',
          '换页设 0 秒自动，换页当切镜头用。',
          '平滑（Morph）靠名字配对：两页里的对象用同一个名字，名字以两个感叹号开头，类型相同，每页唯一。',
          '把图片裁成窗口，两页窗口位置不同，平滑会做出推拉和视差。',
          '字要逐字动，先转成形状：合并形状里的「拆分」。',
          '逐帧：一组形状，每个只出现 0.05 秒。',
          '循环：平滑开始和结束设 0，重复到幻灯片末尾。'
        ]},
        {title: '出了自己电脑会坏的地方', items: [
          '平滑在旧版 PowerPoint、Google Slides、LibreOffice 里变成淡入淡出。图表不参与平滑。',
          '超过一个孔的形状，平滑不会做形变（B、8 这类字母转成形状以后）。',
          '网页版 PowerPoint 不用嵌入字体。可变字体只显示默认字重。',
          'Google Slides 会丢掉延迟、路径和大部分效果。',
          'Keynote 打开 .pptx：版面在，关键帧写法的动画只剩出现和消失；改用 PowerPoint 自带效果的写法（路径、放大缩小、陀螺旋）就能播放（本项目实测）。',
          '视频用 MP4，H.264 加 AAC。'
        ]}
      ]
    },
    better: {
      heading: '更好的办法',
      pipeline: {
        heading: '按用途选路线',
        columns: ['用途', '路线', '原因'],
        rows: [
          ['自己电脑上现场讲', '网页演示（[[reveal|reveal.js]]、[[slidev|Slidev]]，加 GSAP、three.js）', '没有格式上限，全是代码'],
          ['发给客户、对方要改', '原生 .pptx：文字保持可编辑，字体嵌入，平滑加少量预设动画', '能改，能套模板'],
          ['自动播放的 40 秒动态片', '网页逐帧渲染成 MP4', '逐帧准确；在 .pptx 里做更费时，效果更差'],
          ['当 PDF 看的提案', 'HTML 排版，Chromium 导出 PDF', '字体和版面完全可控']
        ]
      },
      tools: {
        heading: '开源工具',
        items: [
          '[[pptMaster|ppt-master]]（MIT）：SVG 转原生形状，带 PowerPoint 203 个预设动画和 48 种转场。',
          '[[officeCli|OfficeCLI]]（Apache-2.0）：命令行读写 Office 文件，有动画、平滑名字检查、内置渲染。',
          '[[slidev|Slidev]] `--format pptx-editable`、[[domToPptx|dom-to-pptx]]：网页转可编辑的 .pptx。',
          '[[hyperframes|HyperFrames]]（Apache-2.0）、[[remotion|Remotion]]（3 人以内的个人和公司免费）：网页逐帧渲染成 MP4。'
        ],
        note: '仓库在 2026-11-26 核对过。'
      },
      code: {
        heading: '代码能做到的',
        items: [
          {term: '缓动曲线', text: 'PowerPoint 界面里只有平滑开始、平滑结束、弹跳结束。文件格式允许给属性动画写关键帧，PowerPoint 自带的「中心旋转」预设就用了 21 个关键帧。把任意曲线采样成关键帧，就能写进去。手工做不到，代码可以。'},
          {term: '字转成轮廓', text: 'HarfBuzz 排字，Skia 去重叠，每个字、每个部件都是一个形状。任何电脑上都一样，可以逐字、逐笔画动。代价是不能再改字。'},
          {term: '程序生成的纹理', text: '纸张、灰尘、暗角都是算出来的透明图，不用图库。PowerPoint 没有混合模式，纹理要么烤进图里，要么做成半透明图盖在上面。'},
          {term: '同一个脚本', text: '一个 Python 脚本描述场景和时间轴，生成原生 .pptx、浏览器里可拖动的预览、MP4。'}
        ]
      },
      ai: {
        heading: '现成的 AI 生成工具',
        text: 'Copilot、Gamma、Canva、Kimi 等能出干净的商务页。没找到任何独立来源显示它们做出过设计公司水平的作品。画面强的那几个，导出 .pptx 时会丢动画或者变成图片。'
      }
    },
    status: {
      heading: '本项目进度',
      columns: ['手法', '样片里', '状态'],
      rows: [
        ['时间轴动画、逐字、逐帧', '第 2、3 页', '做出来了，全部是原生形状和原生动画'],
        ['道具封面', '第 1 页', '幻灯片卡纸，纹理是程序生成的。照片级的旧书、旧海报需要实拍或生成的素材'],
        ['规律与例外', '第 4、5 页', '做出来了，用平滑'],
        ['硬切', '第 6 到 10 页', '做出来了'],
        ['固定版式', '第 11 到 13 页', '做出来了，等距图形是代码画的'],
        ['裁切', '第 14 页', '做出来了，照片是 NASA 公有领域图片'],
        ['广告大片、三维渲染', '没做', '版式能做，素材要另外拍、渲染或生成'],
        ['WebGL 连续场景', '没做', '网页输出还只有 SVG 预览']
      ],
      verified: {heading: '已验证', items: [
        '三个语言版本都通过 Office 文件结构校验，也通过 ppt-master 的动画校验（默认模式）。',
        'LibreOffice、WPS、Keynote 三个程序都能打开，静态画面和预览一致。',
        'Keynote 打开两份 .pptx 版面都对。自带效果版的动画能播放，有一处瑕疵：从偏移位置进场的形状，会先在落点上出现一帧。关键帧缓动版只剩出现和消失。',
        '动画用的属性名和公式写法，和 PowerPoint 自带预设的 XML 一致。'
      ]},
      unverified: {heading: '没验证', items: [
        '两份 .pptx 在 PowerPoint 桌面版里的播放。制作用的 Mac 和服务器都没装 PowerPoint。',
        '两份 .pptx 在 WPS 放映模式里的播放。只验证了 WPS 能打开、画面正确。',
        '浏览器预览是本项目自己的渲染，平滑的插值和 PowerPoint 的不会完全一样。'
      ]}
    },
    downloads: {
      heading: '下载',
      versions: {zh: '中文版', en: '英文版', fr: '法文版'},
      kinds: {
        keyframed: {name: '关键帧缓动版', text: '运动写成关键帧属性动画，缓动曲线完整。'},
        stock: {name: '自带效果版', text: '同一份样片，只用 PowerPoint 自带的效果：出现、淡化、擦除、动作路径、放大/缩小、陀螺旋。缓动只有平滑开始和平滑结束。'},
        video: {name: '成片', text: '浏览器预览渲染的 MP4，1280×720，65 秒。'}
      },
      unit: 'MB',
      note: '两份 .pptx 在 PowerPoint 桌面版和 WPS 放映模式里的播放都还没验证。'
    },
    footer: '2026-11-26 整理。来源：逐份打开核对过的九份作品，FUJI 原始 .pptx 的拆解，PowerPoint 自带 203 个动画预设的 XML，对现有工具的检索。'
  },

  en: {
    title: 'Deck methods',
    description: 'The methods behind decks that do not look like PowerPoint, how to build them, and the better pipelines available now. With a playable reel, .pptx files and an MP4.',
    skip: 'Skip to content',
    back: 'All guides',
    topbar: 'Guide navigation',
    languages: 'Language',
    theme: {dark: 'Dark', light: 'Light', toDark: 'Switch to dark mode', toLight: 'Switch to light mode'},
    reel: 'Method reel',
    credits: "Browser preview, built by the same Python script as the .pptx. The Chinese version has 15 slides, 254 shapes and 428 animation behaviours, and builds in about 5 seconds. Earth photo: Apollo 17, NASA, 1972. Figures on slides 6 to 10 come from FUJI's original file, *PowerPoint Motion Graphics 2020*.",
    nav: {label: 'On this page', methods: 'Methods', works: 'Works', checklist: 'Checklist', better: 'Better ways', status: 'Project status', downloads: 'Downloads'},
    methods: {
      heading: 'Methods', seen: 'On screen', built: 'Build', from: 'From',
      items: {
        cover: {
          name: 'Prop cover', play: 'Play slide 1',
          seen: 'The file is an object from the story. *Montauk* is a worn paperback; the reel opens on a slide mount.',
          built: 'Paper, dust and vignette are computed as transparent images. PowerPoint has no blend modes: a texture is baked into the picture or laid over it as a semi-transparent image. A photographic old book or poster needs a real photo or a generated plate.'
        },
        kinetic: {
          name: 'Kinetic type', play: 'Play slide 2',
          seen: 'One shot per slide, and the whole slide runs on one timeline. Three words, each moving the way it reads: heavy, scatter, aligned.',
          built: "Every effect starts With Previous and is placed by its delay. For letter-by-letter motion, turn the text into shapes first with Merge Shapes > Fragment. FUJI's 19 slides hold 2,063 animation behaviours."
        },
        frames: {
          name: 'Frame by frame', play: 'Play slide 3',
          seen: 'A hand-drawn swirl moves, and every frame is a separate drawing.',
          built: 'A set of shapes, each visible for 0.05 s: every 0.05 s one appears and one disappears.'
        },
        pattern: {
          name: 'Pattern and exception', play: 'Play slides 4 and 5',
          seen: "The same grid appears twice, and the second time its state has changed. Pitch's slide 2 pairs four old tools with two new ones each; on slide 3 the grid turns grey and gains a coloured column with PowerPoint and Pitch.",
          built: 'Morph joins the two slides. It pairs objects by name: the same name on both slides, starting with two exclamation marks, same object type, used once per slide.'
        },
        cuts: {
          name: 'Hard cut', play: 'Play slides 6 to 10',
          seen: 'The click is the cut. *SMOKE* spreads a 15-word sentence over 15 clicks: one to three words on black, then a photo on white, alternating.',
          built: 'No transitions. The text anchor stays 5% from the left and 28% from the top, and each click finishes a clause. For a self-running sequence, set the slide to advance after 0 seconds.'
        },
        layout: {
          name: 'Fixed layout', play: 'Play slides 11 to 13',
          seen: 'The layout holds and only the art changes. *Monument Valley* talk, slides 14 to 18: art on the left at 42% of the width, bleeding top and bottom; headline, hairline and one sentence on the right; the headline keeps its coordinates on all five.',
          built: 'Lock the layout and change one element from slide to slide. Text sits on white, never on the art. In the reel, Morph links the three slides and the isometric shapes are drawn in code.'
        },
        crop: {
          name: 'The crop', play: 'Play slide 14',
          seen: 'The subject runs off the slide. HyperloopTT shows one object from three positions: outside, cutaway, inside.',
          built: 'Let the subject touch the slide edge and be cut by it; something centred in a box looks pasted on. Crop a picture into a window, move the window on the next slide, and Morph gives a push-in or parallax.'
        }
      }
    },
    works: {
      heading: 'Works',
      columns: ['Work', 'Where to look', 'Method', 'How it is made'],
      items: {
        fuji: {
          name: 'FUJI, *PowerPoint Motion Graphics 2020*', short: 'FUJI, *PowerPoint Motion Graphics 2020*',
          where: 'The film; the Animation Pane of the original .pptx',
          method: 'One shot per slide, the whole slide on one timeline',
          how: '19 slides, 2,063 animation behaviours, 1.37 MB. Every effect starts With Previous with an absolute delay. Slides advance after 0 seconds, so a slide change is a cut. Type is split into one shape per letter. The hand-drawn swirl is a set of shapes: every 0.05 s one appears and one disappears. Morph carries the picture from slide to slide.',
          links: {fujiFilm: 'Watch the film', fujiFile: 'Get the original .pptx'}
        },
        montauk: {
          name: '*Montauk*, the early pitch for *Stranger Things*', short: '*Montauk*',
          where: 'Pages 1 to 5, then the whole book',
          method: 'The file is an object from the story',
          how: '23 pages, 3:4 portrait, each page a single image. The cover is a worn paperback. 11 text pages and 10 film stills alternate strictly. Text pages share one scan of yellowed paper, with a running head, a hairline and odd page numbers only. Stills are printed on folded black paper above three fixed lines: title, director, year and studio. One serif throughout, no bold, no lists.',
          links: {montauk: 'Open the PDF'}
        },
        hyperloop: {
          name: 'HyperloopTT × Slidor', short: 'HyperloopTT × Slidor',
          where: 'The black cutaway slide; the Passenger Journey slide',
          method: 'One object seen from three positions',
          how: 'Outside, cutaway and inside, one slide each. Every slide has one thin vertical rule that works as margin, axis, timeline and track. The subject is cut off by the slide edge. The red picture of the capsule nose is a web banner; the slide itself is black.',
          links: {hyperloop: 'See the Slidor page'}
        },
        monument: {
          name: "*Monument Valley*, the lead designer's GDC talk", short: '*Monument Valley* GDC talk',
          where: 'Slides 14 to 18',
          method: 'Fixed layout, only the art changes',
          how: '41 slides. Art panel on the left at 42% of the width, bleeding top and bottom; on the right a headline, a hairline and one sentence, with the headline at the same coordinates on all five slides. Text sits on white only, never on the art. Median of 6 English words per slide.',
          links: {monument: 'Open the PDF at page 14'}
        },
        smoke: {
          name: '*SMOKE - The Convenient Truth*', short: '*SMOKE - The Convenient Truth*',
          where: 'Slides 54 to 68',
          method: 'The click is the cut',
          how: '78 slides, 4:3, no transitions. A 15-word sentence takes 15 clicks: one to three words on black, a photo on white, alternating. The text anchor stays 5% from the left and 28% from the top. The seven photos are seven different stock pictures with two things in common: a white background and a camera on the floor at the feet. Median of 5 words per slide across the deck.',
          links: {smoke: 'Open at slide 54'}
        },
        pitch: {
          name: 'Pitch, US$85M Series B deck', short: 'Pitch Series B deck',
          where: 'Slides 2 and 3',
          method: 'The same grid twice, the second time in a new state',
          how: 'Slide 2: four old tools, each with two new ones. Slide 3: the same grid in grey, plus a coloured column with PowerPoint and Pitch. Each title is a sentence with one coloured phrase, and the coloured phrases read as the story on their own. The team settled the story in a workshop before making slides, and kept the spoken deck separate from the data deck.',
          links: {pitchDeck: 'Open the deck', pitchBlog: 'Read the write-up'}
        },
        bilibili: {
          name: "ACE哔哩, Apple's 2019 event animation rebuilt in PowerPoint", short: 'ACE哔哩',
          where: 'Part 2, the comparison; part 3, the project file walkthrough',
          method: 'Matching the original frame by frame',
          how: "About 80 hours by the author's account, in PowerPoint 365. The video itself was not watched; only its description and part list were checked.",
          links: {bilibili: 'Watch on Bilibili'}
        },
        puma: {
          name: 'PUMA annual keynote × Slidor', short: 'PUMA × Slidor',
          where: 'The A$AP Rocky, Fenty × Puma and Speedcat sets',
          method: 'Magazine layout on a giant screen',
          how: "16 of the 21 images are 3.75:1 ultra-wide, probably matching the venue's joined screens. Margins equal gutters, and nothing crosses a screen seam. One typeface, from 2% to 30% of slide height. Behind each solid title, the same word repeated in outline.",
          links: {puma: 'See the Slidor page'}
        },
        wittens: {
          name: 'Steven Wittens, *Making things with Maths*', short: 'Steven Wittens',
          where: 'The Math Machines section',
          method: 'A 3D scene that changes step by step inside the slide',
          how: '2013, deck.js with MathBox (WebGL). Each scene runs from a step script: one click changes the scene state, and a segment grows into a curve without leaving the slide. Holding Shift slows everything to one fifth.',
          links: {wittens: 'Open the deck'}
        }
      },
      note: 'In the two Slidor decks and the Pitch deck, the layout itself is rectangles, lines and type. HyperloopTT depends on 3D renders, PUMA on campaign photography, Pitch on custom illustration and real product UI: without those assets, a correct layout does not produce the effect.'
    },
    checklist: {
      heading: 'Checklist',
      groups: [
        {title: 'Content', items: [
          'Write the story before opening a slide. One thing per slide, readable in 3 seconds.',
          'Make the title a conclusion; the rest of the slide is its evidence.',
          'A sentence can run over several slides, one clause per click.',
          'Build the deck you present and the deck you send as two files.'
        ]},
        {title: 'Layout', items: [
          'Lock the layout and change one element across consecutive slides.',
          'One typeface, five or six sizes set far apart.',
          'Let the subject touch the slide edge and be cut by it. Something centred in a box looks pasted on.',
          'Keep type and pictures apart. To put type on a picture, give it a solid panel.',
          'One spot of accent colour per slide.'
        ]},
        {title: 'Animation, by hand in PowerPoint', items: [
          'Start everything With Previous and time it with delays. That is the timeline.',
          'Set slides to advance after 0 seconds and use the slide change as a cut.',
          'Morph pairs objects by name: the same name on both slides, starting with two exclamation marks, same type, once per slide.',
          'Crop a picture into a window; with the window in a different place on the next slide, Morph produces a push-in or parallax.',
          'For letter-by-letter motion, convert the text to shapes first: Merge Shapes > Fragment.',
          'Frame by frame: a set of shapes, each shown for 0.05 s.',
          'Loops: Smooth Start and Smooth End at 0, Repeat set to Until End of Slide.'
        ]},
        {title: 'What breaks off your machine', items: [
          'Morph becomes a fade in older PowerPoint, Google Slides and LibreOffice. Charts take no part in Morph.',
          'Morph will not reshape a form with more than one hole, such as B or 8 once converted to shapes.',
          'PowerPoint for the web ignores embedded fonts. Variable fonts show their default weight only.',
          'Google Slides drops delays, motion paths and most effects.',
          "Keynote opens the .pptx with the layout intact. Animation written as keyframes is reduced to appear and disappear; the same motion written with PowerPoint's own effects (motion paths, Grow/Shrink, Spin) plays (tested in this project).",
          'Video: MP4 with H.264 and AAC.'
        ]}
      ]
    },
    better: {
      heading: 'Better ways',
      pipeline: {
        heading: 'Pipeline by use',
        columns: ['Use', 'Pipeline', 'Why'],
        rows: [
          ['Presenting live on your own laptop', 'A web deck: [[reveal|reveal.js]] or [[slidev|Slidev]], with GSAP and three.js', 'No format ceiling; everything is code'],
          ['A file the client will edit', 'Native .pptx: live text, embedded fonts, Morph and a few preset animations', 'Editable, and it takes a template'],
          ['A self-running 40-second motion piece', 'A web page rendered frame by frame to MP4', 'Frame-accurate; the same piece in .pptx takes longer and looks worse'],
          ['A proposal read as a PDF', 'HTML layout, exported to PDF with Chromium', 'Full control of type and layout']
        ]
      },
      tools: {
        heading: 'Open-source tools',
        items: [
          "[[pptMaster|ppt-master]] (MIT): SVG to native shapes, with PowerPoint's 203 preset animations and 48 transitions.",
          '[[officeCli|OfficeCLI]] (Apache-2.0): reads and writes Office files from the command line, with animations, a Morph name check and a built-in renderer.',
          '[[slidev|Slidev]] `--format pptx-editable` and [[domToPptx|dom-to-pptx]]: web page to editable .pptx.',
          '[[hyperframes|HyperFrames]] (Apache-2.0) and [[remotion|Remotion]] (free for individuals and companies of up to 3 people): web page rendered frame by frame to MP4.'
        ],
        note: 'Repositories checked on 26 November 2026.'
      },
      code: {
        heading: 'What code makes possible',
        items: [
          {term: 'Easing curves', text: "PowerPoint's interface offers Smooth Start, Smooth End and Bounce End. The file format accepts keyframes on a property animation: PowerPoint's own Center Revolve preset uses 21. Sample any curve into keyframes and it can be written in. Not possible by hand; possible in code."},
          {term: 'Type as outlines', text: 'HarfBuzz shapes the text and Skia removes overlaps, so each glyph and each of its parts is a shape. It looks the same on every machine and can move by glyph or by stroke. The text can no longer be edited.'},
          {term: 'Computed textures', text: 'Paper, dust and vignette are computed as transparent images, with no stock library. PowerPoint has no blend modes: bake the texture into the picture or lay it on top as a semi-transparent image.'},
          {term: 'One script', text: 'One Python script describes the scenes and the timeline, and writes a native .pptx, a scrubbable browser preview and an MP4.'}
        ]
      },
      ai: {
        heading: 'AI deck generators',
        text: 'Copilot, Gamma, Canva, Kimi and similar tools produce clean business slides. No independent source was found showing agency-level work from any of them. The ones with stronger visuals lose animation, or turn slides into images, when exporting to .pptx.'
      }
    },
    status: {
      heading: 'Project status',
      columns: ['Method', 'In the reel', 'State'],
      rows: [
        ['Timeline animation, per-letter type, frame by frame', 'Slides 2 and 3', 'Built, all native shapes and native animation'],
        ['Prop cover', 'Slide 1', 'A slide mount with computed texture. A photographic old book or poster needs a real photo or a generated plate'],
        ['Pattern and exception', 'Slides 4 and 5', 'Built, with Morph'],
        ['Hard cut', 'Slides 6 to 10', 'Built'],
        ['Fixed layout', 'Slides 11 to 13', 'Built; the isometric shapes are drawn in code'],
        ['The crop', 'Slide 14', 'Built; the photo is a NASA public-domain image'],
        ['Campaign photography, 3D renders', 'Not built', 'The layout is doable; the assets have to be shot, rendered or generated'],
        ['Continuous WebGL scene', 'Not built', 'The web output is still an SVG preview only']
      ],
      verified: {heading: 'Verified', items: [
        "All three language versions pass Office file-structure validation and ppt-master's animation validator in its default mode.",
        'LibreOffice, WPS and Keynote all open the files, and the static frames match the preview.',
        'Keynote opens both .pptx files with the correct layout. It plays the motion of the stock-effects file, with one artefact: a shape that enters from an offset shows for one frame at its rest position. From the keyframed file it keeps only appear and disappear.',
        "Animation attribute names and formula syntax match the XML of PowerPoint's own presets."
      ]},
      unverified: {heading: 'Not verified', items: [
        'Playback of either .pptx in PowerPoint desktop. Neither the Mac nor the server used for this has PowerPoint installed.',
        'Playback of either .pptx in WPS slideshow mode. Only checked that WPS opens the file and the frames are right.',
        "The browser preview is this project's own renderer; its Morph interpolation will not match PowerPoint's exactly."
      ]}
    },
    downloads: {
      heading: 'Downloads',
      versions: {zh: 'Chinese', en: 'English', fr: 'French'},
      kinds: {
        keyframed: {name: 'Keyframed easing', text: 'Motion written as keyframed property animation, with full easing curves.'},
        stock: {name: 'Stock effects', text: "The same reel written only with PowerPoint's own effects: Appear, Fade, Wipe, motion paths, Grow/Shrink, Spin. Easing is reduced to Smooth Start and Smooth End."},
        video: {name: 'Video', text: 'MP4 rendered from the browser preview, 1280×720, 65 s.'}
      },
      unit: 'MB',
      note: 'Playback of the two .pptx files in PowerPoint desktop and in WPS slideshow mode has not been verified yet.'
    },
    footer: "Compiled on 26 November 2026 from the nine works, each opened and checked, a teardown of FUJI's original .pptx, the XML of PowerPoint's 203 built-in animation presets, and a survey of current tools."
  },

  fr: {
    title: 'Méthodes de présentation',
    description: "Les méthodes des présentations qui ne ressemblent pas à du PowerPoint, leur fabrication et les filières plus efficaces aujourd'hui. Avec une bande d'essai à lire, les .pptx et un MP4.",
    skip: 'Aller au contenu',
    back: 'Tous les guides',
    topbar: 'Navigation des guides',
    languages: 'Langue',
    theme: {dark: 'Sombre', light: 'Clair', toDark: 'Passer au mode sombre', toLight: 'Passer au mode clair'},
    reel: "Bande d'essai",
    credits: "Aperçu dans le navigateur, produit par le même script Python que le .pptx. La version chinoise compte 15 diapositives, 254 formes et 428 comportements d'animation ; elle se génère en 5 secondes environ. Photo de la Terre : Apollo 17, NASA, 1972. Les chiffres des diapositives 6 à 10 viennent du fichier original de FUJI, *PowerPoint Motion Graphics 2020*.",
    nav: {label: 'Sur cette page', methods: 'Méthodes', works: 'Références', checklist: 'Aide-mémoire', better: 'Meilleures méthodes', status: 'État du projet', downloads: 'Téléchargements'},
    methods: {
      heading: 'Méthodes', seen: "À l'écran", built: 'Fabrication', from: 'Source',
      items: {
        cover: {
          name: 'Couverture-accessoire', play: 'Lire la diapositive 1',
          seen: "Le fichier est un objet de l'histoire. *Montauk* est un vieux livre de poche usé ; la bande d'essai s'ouvre sur un cadre de diapositive en carton.",
          built: "Papier, poussière et vignettage sont calculés en images transparentes. PowerPoint n'a pas de modes de fusion : la texture est incrustée dans l'image ou posée dessus en image semi-transparente. Un vieux livre ou une affiche d'un rendu photographique demande une prise de vue ou une image générée."
        },
        kinetic: {
          name: 'Typographie animée', play: 'Lire la diapositive 2',
          seen: 'Un plan par diapositive, et toute la diapositive tient sur une ligne de temps. Trois mots, chacun bouge selon son sens : lourd, éclats, aligné.',
          built: "Tous les effets démarrent « Avec la précédente » et se placent par leur délai. Pour animer lettre par lettre, convertir d'abord le texte en formes : Fusionner les formes > Fragmenter. Les 19 diapositives de FUJI contiennent 2 063 comportements d'animation."
        },
        frames: {
          name: 'Image par image', play: 'Lire la diapositive 3',
          seen: "Un tourbillon dessiné à la main s'anime ; chaque image est un dessin à part.",
          built: 'Une série de formes, chacune visible 0,05 s : toutes les 0,05 s, une apparaît et une disparaît.'
        },
        pattern: {
          name: "La règle et l'exception", play: 'Lire les diapositives 4 et 5',
          seen: 'La même grille revient deux fois, la seconde dans un autre état. Chez Pitch, la diapositive 2 associe à quatre anciens outils deux nouveaux chacun ; à la diapositive 3, la grille passe au gris et gagne une colonne en couleur, PowerPoint et Pitch.',
          built: "La transition Morphose relie les deux diapositives. Elle apparie les objets par leur nom : le même nom sur les deux diapositives, précédé de deux points d'exclamation, même type d'objet, une seule fois par diapositive."
        },
        cuts: {
          name: 'Coupe franche', play: 'Lire les diapositives 6 à 10',
          seen: 'Le clic fait la coupe. *SMOKE* étale une phrase de 15 mots sur 15 clics : un à trois mots sur fond noir, puis une photo sur fond blanc, en alternance.',
          built: "Aucune transition. L'ancrage du texte reste à 5 % du bord gauche et 28 % du haut, et chaque clic termine une proposition. Pour un défilement automatique, régler le passage à la diapositive suivante sur 0 seconde."
        },
        layout: {
          name: 'Grille fixe', play: 'Lire les diapositives 11 à 13',
          seen: "La mise en page ne bouge pas, seule l'image change. Conférence *Monument Valley*, diapositives 14 à 18 : l'image à gauche sur 42 % de la largeur, à fond perdu en haut et en bas ; à droite un titre, un filet, une phrase ; le titre garde ses coordonnées sur les cinq.",
          built: "Figer la mise en page et ne changer qu'un élément d'une diapositive à l'autre. Le texte reste sur fond blanc, jamais sur l'image. Dans la bande d'essai, Morphose relie les trois diapositives et les volumes isométriques sont dessinés en code."
        },
        crop: {
          name: 'Le cadrage', play: 'Lire la diapositive 14',
          seen: 'Le sujet sort du cadre. HyperloopTT montre le même objet depuis trois positions : extérieur, coupe, intérieur.',
          built: "Laisser le sujet toucher le bord de la diapositive et s'y faire couper ; un élément centré dans un cadre a l'air collé. Rogner une image en fenêtre, déplacer la fenêtre sur la diapositive suivante : Morphose produit un travelling ou une parallaxe."
        }
      }
    },
    works: {
      heading: 'Références',
      columns: ['Référence', 'Où regarder', 'Méthode', 'Fabrication'],
      items: {
        fuji: {
          name: 'FUJI, *PowerPoint Motion Graphics 2020*', short: 'FUJI, *PowerPoint Motion Graphics 2020*',
          where: 'Le film ; le volet Animation du .pptx original',
          method: 'Un plan par diapositive, toute la diapositive sur une ligne de temps',
          how: "19 diapositives, 2 063 comportements d'animation, 1,37 Mo. Chaque effet démarre « Avec la précédente » avec un délai absolu. Les diapositives défilent après 0 seconde : le changement de diapositive sert de coupe. Le texte est découpé en une forme par lettre. Le tourbillon dessiné à la main est une série de formes : toutes les 0,05 s, une apparaît et une disparaît. Morphose assure la continuité d'une diapositive à l'autre.",
          links: {fujiFilm: 'Voir le film', fujiFile: 'Récupérer le .pptx original'}
        },
        montauk: {
          name: '*Montauk*, première présentation de *Stranger Things*', short: '*Montauk*',
          where: 'Pages 1 à 5, puis tout le livre',
          method: "Le fichier est un objet de l'histoire",
          how: "23 pages, format portrait 3:4, une image par page. La couverture est un livre de poche usé. 11 pages de texte et 10 photogrammes alternent strictement. Les pages de texte reprennent le même scan de papier jauni, avec titre courant, filet et folios impairs seulement. Les photogrammes sont imprimés sur un papier noir plié, au-dessus de trois lignes fixes : titre, réalisateur, année et studio. Une seule police à empattements, sans gras ni listes.",
          links: {montauk: 'Ouvrir le PDF'}
        },
        hyperloop: {
          name: 'HyperloopTT × Slidor', short: 'HyperloopTT × Slidor',
          where: 'La diapositive en coupe sur fond noir ; la diapositive Passenger Journey',
          method: 'Un même objet vu depuis trois positions',
          how: "Extérieur, coupe, intérieur : une diapositive chacun. Chaque diapositive porte un filet vertical qui sert de marge, d'axe, de frise chronologique et de rail. Le sujet est coupé par le bord de la diapositive. L'image du nez de la capsule sur fond rouge est une bannière web ; la diapositive, elle, est sur fond noir.",
          links: {hyperloop: 'Voir la page Slidor'}
        },
        monument: {
          name: '*Monument Valley*, conférence GDC du designer principal', short: 'Conférence GDC *Monument Valley*',
          where: 'Diapositives 14 à 18',
          method: "Mise en page fixe, seule l'image change",
          how: "41 diapositives. L'image occupe la gauche sur 42 % de la largeur, à fond perdu en haut et en bas ; à droite, un titre, un filet et une phrase, le titre aux mêmes coordonnées sur les cinq diapositives. Le texte n'est posé que sur du blanc, jamais sur l'image. Médiane de 6 mots anglais par diapositive.",
          links: {monument: 'Ouvrir le PDF page 14'}
        },
        smoke: {
          name: '*SMOKE - The Convenient Truth*', short: '*SMOKE - The Convenient Truth*',
          where: 'Diapositives 54 à 68',
          method: 'Le clic fait la coupe',
          how: "78 diapositives, 4:3, aucune transition. Une phrase de 15 mots prend 15 clics : un à trois mots sur fond noir, une photo sur fond blanc, en alternance. L'ancrage du texte reste à 5 % du bord gauche et 28 % du haut. Les sept photos viennent de sept images de banque différentes ; elles ont en commun le fond blanc et l'appareil au ras du sol, côté pieds. Médiane de 5 mots par diapositive sur l'ensemble.",
          links: {smoke: 'Ouvrir à la diapositive 54'}
        },
        pitch: {
          name: 'Pitch, présentation de la série B de 85 millions de dollars', short: 'Présentation de série B de Pitch',
          where: 'Diapositives 2 et 3',
          method: 'La même grille deux fois, la seconde dans un autre état',
          how: "Diapositive 2 : quatre anciens outils, chacun avec deux nouveaux. Diapositive 3 : la même grille en gris, plus une colonne en couleur avec PowerPoint et Pitch. Chaque titre est une phrase dont un segment est en couleur ; lus seuls, les segments colorés racontent l'histoire. L'équipe a fixé le récit en atelier avant de faire les diapositives, et séparé le support présenté du dossier de chiffres.",
          links: {pitchDeck: 'Ouvrir la présentation', pitchBlog: 'Lire le récit de fabrication'}
        },
        bilibili: {
          name: "ACE哔哩, l'animation de la keynote Apple 2019 refaite dans PowerPoint", short: 'ACE哔哩',
          where: 'Partie 2, la comparaison ; partie 3, la visite du fichier de travail',
          method: "Reproduire l'original image par image",
          how: "Environ 80 heures selon l'auteur, dans PowerPoint 365. La vidéo n'a pas été visionnée ; seuls son descriptif et son découpage en parties ont été vérifiés.",
          links: {bilibili: 'Voir sur Bilibili'}
        },
        puma: {
          name: 'Keynote annuelle PUMA × Slidor', short: 'PUMA × Slidor',
          where: 'Les séries A$AP Rocky, Fenty × Puma et Speedcat',
          method: 'La mise en page magazine sur écran géant',
          how: "16 des 21 images sont au format ultra-large 3,75:1, sans doute celui du mur d'écrans de la salle. Les marges égalent les gouttières, et rien ne franchit une jointure d'écran. Une seule police, de 2 % à 30 % de la hauteur de diapositive. Derrière chaque titre plein, le même mot répété en contour.",
          links: {puma: 'Voir la page Slidor'}
        },
        wittens: {
          name: 'Steven Wittens, *Making things with Maths*', short: 'Steven Wittens',
          where: 'La section Math Machines',
          method: 'Une scène 3D qui évolue pas à pas dans la diapositive',
          how: "2013, deck.js et MathBox (WebGL). Chaque scène suit un script d'étapes : un clic modifie l'état de la scène, et un segment devient courbe sans changer de diapositive. Maintenir Maj ralentit tout au cinquième.",
          links: {wittens: 'Ouvrir la présentation'}
        }
      },
      note: "Dans les deux présentations de Slidor et dans celle de Pitch, la mise en page se réduit à des rectangles, des filets et du texte. HyperloopTT repose sur des rendus 3D, PUMA sur des photos de campagne, Pitch sur des illustrations dédiées et de vraies captures du produit : sans ces images, une mise en page juste ne produit pas le même effet."
    },
    checklist: {
      heading: 'Aide-mémoire',
      groups: [
        {title: 'Contenu', items: [
          "Écrire l'histoire avant d'ouvrir une diapositive. Une idée par diapositive, lisible en 3 secondes.",
          'Rédiger le titre comme une conclusion ; le reste de la diapositive en est la preuve.',
          'Une phrase peut courir sur plusieurs diapositives, une proposition par clic.',
          "Faire deux fichiers : celui qu'on présente et celui qu'on envoie."
        ]},
        {title: 'Mise en page', items: [
          "Figer la mise en page et ne changer qu'un élément sur plusieurs diapositives de suite.",
          'Une seule police, cinq ou six corps très écartés.',
          "Laisser le sujet toucher le bord de la diapositive et s'y faire couper. Un élément centré dans un cadre a l'air collé.",
          "Séparer le texte et l'image. Pour écrire sur une image, poser un aplat de couleur dessous.",
          "Une seule touche de couleur d'accent par diapositive."
        ]},
        {title: 'Animation, à la main dans PowerPoint', items: [
          "Tout démarrer « Avec la précédente » et régler le temps par les délais. C'est la ligne de temps.",
          'Passer à la diapositive suivante après 0 seconde : le changement de diapositive sert de coupe.',
          "Morphose apparie les objets par leur nom : le même nom sur les deux diapositives, précédé de deux points d'exclamation, même type, une seule fois par diapositive.",
          'Rogner une image en fenêtre ; si la fenêtre change de place sur la diapositive suivante, Morphose produit un travelling ou une parallaxe.',
          "Pour animer lettre par lettre, convertir d'abord le texte en formes : Fusionner les formes > Fragmenter.",
          'Image par image : une série de formes, chacune affichée 0,05 s.',
          "Boucle : Début fluide et Fin fluide à 0, Répéter réglé sur « Jusqu'à la fin de la diapositive »."
        ]},
        {title: 'Ce qui casse ailleurs que sur votre machine', items: [
          'Morphose devient un fondu dans les anciennes versions de PowerPoint, dans Google Slides et dans LibreOffice. Les graphiques ne participent pas à Morphose.',
          "Morphose ne déforme pas une forme à plus d'un trou, comme B ou 8 une fois convertis en formes.",
          "PowerPoint pour le web n'utilise pas les polices incorporées. Les polices variables n'affichent que leur graisse par défaut.",
          'Google Slides supprime les délais, les trajectoires et la plupart des effets.',
          'Keynote ouvre le .pptx avec la bonne mise en page. Une animation écrite en images clés se réduit à apparaître et disparaître ; écrite avec les effets de PowerPoint (trajectoires, Agrandir/Rétrécir, Rotation), elle est lue (testé dans ce projet).',
          'Vidéo : MP4, H.264 et AAC.'
        ]}
      ]
    },
    better: {
      heading: 'Meilleures méthodes',
      pipeline: {
        heading: "La filière selon l'usage",
        columns: ['Usage', 'Filière', 'Raison'],
        rows: [
          ['Présenter soi-même, sur son ordinateur', 'Présentation web : [[reveal|reveal.js]] ou [[slidev|Slidev]], avec GSAP et three.js', 'Aucune limite de format, tout est du code'],
          ['Envoyer au client, qui modifiera', '.pptx natif : texte modifiable, polices incorporées, Morphose et quelques animations prédéfinies', 'Modifiable, et compatible avec un modèle'],
          ['Film animé de 40 secondes en lecture automatique', 'Page web rendue image par image en MP4', "Exact à l'image près ; dans un .pptx, c'est plus long et moins bon"],
          ['Proposition lue en PDF', 'Mise en page HTML, export PDF avec Chromium', 'Polices et mise en page entièrement maîtrisées']
        ]
      },
      tools: {
        heading: 'Outils open source',
        items: [
          '[[pptMaster|ppt-master]] (MIT) : du SVG aux formes natives, avec les 203 animations prédéfinies de PowerPoint et 48 transitions.',
          '[[officeCli|OfficeCLI]] (Apache-2.0) : lit et écrit les fichiers Office en ligne de commande, avec animations, contrôle des noms pour Morphose et moteur de rendu intégré.',
          "[[slidev|Slidev]] `--format pptx-editable` et [[domToPptx|dom-to-pptx]] : d'une page web à un .pptx modifiable.",
          '[[hyperframes|HyperFrames]] (Apache-2.0) et [[remotion|Remotion]] (gratuit pour les particuliers et les entreprises de 3 personnes au plus) : page web rendue image par image en MP4.'
        ],
        note: 'Dépôts vérifiés le 26 novembre 2026.'
      },
      code: {
        heading: 'Ce que le code permet',
        items: [
          {term: "Courbes d'accélération", text: "L'interface de PowerPoint ne propose que Début fluide, Fin fluide et Fin avec rebond. Le format de fichier accepte des images clés sur une animation de propriété : l'effet prédéfini Center Revolve de PowerPoint (nom de l'interface anglaise) en compte 21. On échantillonne n'importe quelle courbe en images clés et on l'écrit dans le fichier. Impossible à la main, faisable en code."},
          {term: 'Texte vectorisé', text: "HarfBuzz compose le texte et Skia supprime les chevauchements : chaque caractère, chaque élément devient une forme. Le rendu est identique sur toutes les machines, et l'animation peut se faire caractère par caractère ou trait par trait. En contrepartie, le texte n'est plus modifiable."},
          {term: 'Textures calculées', text: "Papier, poussière et vignettage sont des images transparentes calculées, sans banque d'images. PowerPoint n'a pas de modes de fusion : la texture est incrustée dans l'image ou posée dessus en semi-transparence."},
          {term: 'Un seul script', text: "Un script Python décrit les scènes et la ligne de temps, puis produit un .pptx natif, un aperçu navigateur que l'on parcourt au curseur et un MP4."}
        ]
      },
      ai: {
        heading: 'Générateurs IA',
        text: "Copilot, Gamma, Canva, Kimi et les outils du même type produisent des diapositives d'entreprise propres. Aucune source indépendante trouvée ne montre un travail du niveau d'une agence. Ceux dont le rendu est le plus fort perdent les animations à l'export .pptx, ou transforment les diapositives en images."
      }
    },
    status: {
      heading: 'État du projet',
      columns: ['Méthode', "Dans la bande d'essai", 'État'],
      rows: [
        ['Animation sur ligne de temps, lettre par lettre, image par image', 'Diapositives 2 et 3', 'Fait, entièrement en formes et animations natives'],
        ['Couverture-accessoire', 'Diapositive 1', "Un cadre de diapositive à texture calculée. Un vieux livre ou une affiche d'un rendu photographique demande une prise de vue ou une image générée"],
        ["La règle et l'exception", 'Diapositives 4 et 5', 'Fait, avec Morphose'],
        ['Coupe franche', 'Diapositives 6 à 10', 'Fait'],
        ['Grille fixe', 'Diapositives 11 à 13', 'Fait ; les volumes isométriques sont dessinés en code'],
        ['Le cadrage', 'Diapositive 14', 'Fait ; la photo est une image NASA du domaine public'],
        ['Photos de campagne, rendus 3D', 'Non réalisé', 'La mise en page est faisable ; les images restent à photographier, à rendre ou à générer'],
        ['Scène WebGL continue', 'Non réalisé', 'La sortie web se limite encore à un aperçu SVG']
      ],
      verified: {heading: 'Vérifié', items: [
        "Les trois versions linguistiques passent la validation de structure des fichiers Office et le validateur d'animation de ppt-master dans son mode par défaut.",
        "LibreOffice, WPS et Keynote ouvrent les fichiers ; l'image fixe correspond à l'aperçu.",
        "Keynote ouvre les deux .pptx avec la bonne mise en page. Il lit le mouvement de la version « Effets standard », avec un défaut : une forme qui entre depuis une position décalée s'affiche pendant une image à sa position finale. De la version par images clés, il ne garde que l'apparition et la disparition.",
        "Les noms d'attributs et l'écriture des formules d'animation sont ceux du XML des effets prédéfinis de PowerPoint."
      ]},
      unverified: {heading: 'Non vérifié', items: [
        "La lecture des deux .pptx dans PowerPoint pour ordinateur. Ni le Mac ni le serveur utilisés n'ont PowerPoint.",
        "La lecture des deux .pptx dans le mode diaporama de WPS. Seules l'ouverture et l'image fixe ont été vérifiées.",
        "L'aperçu du navigateur est le rendu propre à ce projet ; son interpolation de Morphose ne sera pas exactement celle de PowerPoint."
      ]}
    },
    downloads: {
      heading: 'Téléchargements',
      versions: {zh: 'Version chinoise', en: 'Version anglaise', fr: 'Version française'},
      kinds: {
        keyframed: {name: 'Courbes par images clés', text: "Le mouvement est écrit en animation de propriété par images clés, avec les courbes d'accélération complètes."},
        stock: {name: 'Effets standard', text: "La même bande d'essai, écrite uniquement avec les effets de PowerPoint : Apparaître, Estomper, Balayer, trajectoires, Agrandir/Rétrécir, Rotation. L'accélération se limite à Début fluide et Fin fluide."},
        video: {name: 'Vidéo', text: "MP4 rendu depuis l'aperçu navigateur, 1280×720, 65 s."}
      },
      unit: 'Mo',
      note: "La lecture des deux .pptx dans PowerPoint pour ordinateur et dans le mode diaporama de WPS n'a pas encore été vérifiée."
    },
    footer: "Établi le 26 novembre 2026 à partir des neuf références, ouvertes et vérifiées une à une, du démontage du .pptx original de FUJI, du XML des 203 animations prédéfinies de PowerPoint et d'un recensement des outils actuels."
  }
};
