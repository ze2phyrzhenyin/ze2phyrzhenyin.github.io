// Chinese is the source text. The tool and case entries stay in ../catalog.mjs.
export default {
  htmlLang: 'zh-CN',
  title: 'Claude 3D 视频制作指南',
  description: '用 Blender 相机工程学习三维镜头制作，查阅工具、案例与渲染估算。',
  titleJoin: ' | ',
  descriptionJoin: '。',
  chrome: {
    skip: '跳到正文', hub: '攻略总览', brand: '影像制作手册', nav: '指南栏目', languages: '语言',
    theme: '切换配色', themeLabel: '配色', references: '参考资料'
  },
  pages: {
    home: {nav: '制作路线', title: '制作路线'},
    tools: {nav: '工具比较', title: '工具比较'},
    cases: {nav: '案例库', title: '案例库'},
    estimate: {nav: '用量估算', title: '用量估算'},
    handbook: {nav: '项目手册', title: '项目手册'}
  },
  common: {download: '下载 Blender 工程', study: '双镜头相机习作'},
  home: {
    h1: 'Claude 与<br> 3D 视频制作',
    intro: '从这台双镜头相机入手。打开场景，可以移动机位、换一组灯光，看它们怎样改变同一个镜头。',
    sample: '看 3 秒样片',
    alt: '深绿色双镜头相机的 Blender 材质渲染',
    viewsLabel: '切换渲染视图',
    views: {studio: '材质', clay: '灰模', detail: '镜头细节'},
    routesTitle: '按交付物选路线',
    routesLabel: '交付物',
    routes: {
      native: ['可编辑场景', 'Blender 场景', '把模型、镜头和材质留在同一个工程里。客户要调整焦距或反光时，可以重渲对应镜头。'],
      code: ['视频模板', 'Remotion 模板', '把文案、颜色和画幅设为参数。片头时间线可以复用，多个语言版本各自导出。'],
      video: ['生成片段', '参考图生成视频', '固定主体参考图，为每个镜头分别写动作和构图。保留候选片段，在剪辑软件里排列。']
    },
    related: '查看相关工具',
    adviser: '按题材和设备细选',
    subject: '拍摄题材',
    subjects: {product: '实体产品', ui: '软件界面', scene: '建筑或环境', story: '人物或叙事'},
    machine: '制作设备',
    machines: {laptop: '普通笔记本', mac: 'Apple Silicon Mac', gpu: '独显或渲染机'}
  },
  tools: {
    search: '搜索工具', searchPlaceholder: '名称、用途或搭配', category: '类别', allCategories: '全部类别',
    viewComparison: '查看对比', compare: '对比', compareAria: '对比 {name}', details: '使用条件',
    limit: '使用限制', setup: '搭配方式', none: '没有找到符合条件的工具。', reset: '清除筛选',
    selected: '已选工具', clear: '清空对比', hint: '勾选列表中的工具，最多可比较三项。'
  },
  cases: {
    videoLabel: '双镜头相机环绕镜头，无声，3 秒',
    spec: 'Blender 5.2 · 24 fps · 72 帧',
    text: '拍摄机位绕机身转过 48 度。暂停在镜片高光最明显的一帧，打开工程，移动左前方的面光源，对照镜片上的反射。',
    openVideo: '打开视频',
    exercise: '用 Claude 改这一镜',
    exerciseIntro: '把这段要求和工程文件名交给能操作 Blender 的 Claude。',
    exercisePrompt: '打开 twin-66.blend，定位到第 48 帧。把 Key strip 面光源向左移动半个 Blender 单位，保持灯光朝向机身中央。渲染修改前后两张图，比较上方镜片的高光。把修改后的场景另存为 twin-light.blend。',
    worksTitle: '作品与技术示例',
    type: '案例类型',
    allTypes: '全部类型'
  },
  estimate: {
    index: '估算方式',
    pricePlaceholder: '填写单价',
    calculators: {
      render: {
        title: '渲染时间',
        intro: '输入一帧在目标设备上的实测耗时。',
        fields: {seconds: '时长（秒）', fps: '帧率（fps）', per: '每帧耗时（秒）'},
        note: '总帧数向上取整，再乘以每帧耗时。结果按一台设备连续渲染计算。',
        source: 'Blender 动画输出'
      },
      quota: {
        title: '订阅额度',
        intro: '从同一额度窗口记录一次试做前后的用量差。',
        fields: {percent: '试做用量（%）', tested: '试做镜头数', shots: '计划镜头数'},
        note: '试做用量 × 计划镜头数 ÷ 试做镜头数。仅适用于模型、上下文和复杂度相近的任务。',
        source: 'Claude 使用限制'
      },
      api: {
        title: 'API 费用',
        intro: '从所用模型的价格表填写单价，金额单位为美元。',
        fields: {input: '输入 token 数', output: '输出 token 数', inprice: '输入单价（美元 / 百万 token）', outprice: '输出单价（美元 / 百万 token）'},
        note: '输入和输出分别乘以单价，再除以一百万。缓存、批处理折扣和外部视频积分另计。',
        source: 'Anthropic 价格表'
      }
    }
  },
  handbook: {
    index: '手册章节',
    workflow: '从分镜到交付',
    prompt: '开发包提示词',
    sources: '参考资料',
    steps: [
      ['写下交付要求', '记下片长、帧率、画幅和声音要求。要交三维源文件的项目，还要约定软件版本和外部素材的打包方式。'],
      ['画出主镜头', '为每个镜头留一行，写清起止帧、主体运动和相机运动。把产品尺寸、参考图和商标文件放进资产清单。'],
      ['试做最难的一段', '取最难的 3 至 5 秒做小样。灰模检查轮廓和遮挡，材质预览检查反光。记录一帧的渲染时间和峰值显存。'],
      ['逐帧输出', '把各镜头渲染成编号连续的图片。失败时补算缺失帧，合成时沿用工程帧率。字幕换行和声音切点在最终画幅中检查。'],
      ['回看并交付', '看一遍完整视频，留意闪烁、穿模和切镜后的响度。用另一目录打开源工程，核对贴图、字体、资产授权和输出设置。']
    ],
    assemble: '把示例工程的图像序列合成 MP4',
    assembleText: '在 Blender 中选择「渲染动画」。工程旁会生成 frames 目录，从工程所在目录运行下列命令。',
    ffmpegDocs: 'FFmpeg 图像序列文档',
    modelsTitle: 'Claude 的分工',
    modelsText: '需要同时安排多个镜头、查找渲染错误时，可以用 Opus 拆解；模板定下来以后，换字幕、改参数和整理脚本可以交给 Sonnet。先用同一个镜头试做一次，再按实测耗时与用量决定模型。',
    promptIntro: '把本次拍摄条件写在提示词开头，连同分镜、素材、渲染和交付要求一起交给 Claude。',
    brief: [
      ['项目内容', '双镜头相机展示'],
      ['设备与系统', 'MacBook Pro，18 GB'],
      ['项目预算', '外部服务不超过 10 欧元'],
      ['交付要求', '20 秒、1080p，附可编辑工程']
    ],
    copy: '复制提示词',
    download: '下载 TXT',
    fullPrompt: '查看提示词全文',
    original: '下载原始提示词',
    references: ['Blender 动画输出', 'Remotion 的 ThreeCanvas', 'FFmpeg 图像序列', 'Poly Haven 素材许可', 'Claude 订阅使用限制', 'Anthropic API 价格', 'Claude 模型说明'],
    elsewhere: '制作插件的源码和作者演示分别收在{tools}和{cases}。'
  },
  // Strings guide.js needs after the page has loaded.
  runtime: {
    common: {
      theme: {light: '浅色', dark: '深色', toLight: '切换为浅色模式', toDark: '切换为深色模式'}
    },
    home: {
      views: {clay: '同一机位和灯光下的相机灰模', detail: '相机的镜片和金属镜筒近景'},
      subjects: {
        product: '先量机身比例，给镜头边缘留出高光，便于检查轮廓。',
        ui: '录制原始界面，把界面文字与画面分层，方便替换语言。',
        scene: '用灰模确定建筑比例和机位，按镜头能看见的范围放置细节。',
        story: '画出人物进出画面的位置，给相邻镜头各留一张连续性参考图。'
      },
      devices: {
        laptop: '本地先做低分辨率预览，记录一帧的耗时。',
        mac: '在同一帧比较 CPU 与可用的 Metal 渲染设置，记录耗时和内存。',
        gpu: '用纹理最多的一帧检查显存，再排整段渲染。'
      },
      codeAdvice: '在本机逐帧导出一段，检查字体、画布尺寸和动画节奏。',
      videoAdvice: '生成耗时与积分以服务端记录为准，本地设备主要用于剪辑。',
      adviceJoin: ''
    },
    tools: {
      found: {other: '显示 {n} 项工具'},
      picked: '（{n}）',
      chosen: {other: '已选 {n} 项，共可选三项。'},
      shortcut: '对比已选工具（{n}）',
      tableLabel: '所选工具的用途、限制和搭配',
      tool: '工具',
      remove: '移除',
      removeAria: '移除 {name}',
      rows: ['用途', '使用限制', '搭配方式']
    },
    cases: {},
    estimate: {
      frames: {other: '{n} 帧'},
      minutes: {other: '约 {n} 分钟'},
      renderJoin: '，',
      quota: '约占该额度窗口的 {n}%',
      cost: '{n} 美元',
      invalid: '请填写有效的{label}。',
      range: '数值超出计算范围。'
    },
    handbook: {
      briefJoin: '：',
      copied: '已复制提示词。',
      selectedAll: '已选中全文，请使用系统复制命令。',
      fileName: 'claude-3d-项目提示词.txt'
    }
  }
};
