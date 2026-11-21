// Each tool lists a practical use, a constraint and its place in a production setup.
export const categories = {native:'三维软件与连接器', code:'代码动画', skill:'制作 Skills', asset:'素材与输出', video:'生成视频'};
export const urls = {
  blender:'https://docs.blender.org/manual/en/latest/', blenderMcp:'https://www.blender.org/lab/mcp-server/',
  community:'https://github.com/ahujasid/mcp-for-blender', film:'https://github.com/mromidev/claude-blender-skills',
  skills:'https://github.com/EL4CTEO/blender-skills', harness:'https://github.com/MAX-786/claude-3d-harness',
  remotion:'https://www.remotion.dev/docs/ai/claude-code-plugin', r3f:'https://www.remotion.dev/templates/three',
  three:'https://threejs.org/', threeSkills:'https://github.com/CloudAI-X/threejs-skills',
  hyper:'https://github.com/heygen-com/hyperframes', cinematic:'https://github.com/cumalibilgic/cinematic-3d-video',
  c4d:'https://www.maxon.net/en/cinema-4d/features/mcp-server',
  unreal:'https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-mcp-in-unreal-editor',
  meshy:'https://github.com/meshy-dev/meshy-3d-agent', poly:'https://polyhaven.com/license',
  runway:'https://runway.com/mcp/claude',
  flow:'https://labs.google/fx/tools/flow', kling:'https://kling.ai/quickstart/kling-4-model-user-guide',
  ffmpeg:'https://ffmpeg.org/ffmpeg-formats.html#image2', frames:'https://docs.blender.org/manual/en/latest/render/output/animation.html',
  threeCanvas:'https://www.remotion.dev/docs/three-canvas', pricing:'https://platform.claude.com/docs/en/about-claude/pricing',
  limits:'https://support.claude.com/en/articles/11647753-how-do-usage-and-length-limits-work'
};
export const tools = [
  ['Blender','native','blender','建模、布光和渲染，交付可继续修改的 .blend 文件。','逐帧渲染耗时取决于场景、采样和设备。','用 Python 设置相机和关键帧，输出图像序列。'],
  ['Blender MCP','native','blenderMcp','从 Claude 检查或修改打开的 Blender 场景。','镜头设计和渲染参数仍要写进工程。','在 Blender 中启用对应扩展，再连接 MCP 客户端。'],
  ['mcp-for-blender','native','community','社区维护的 Blender 连接器，含模型和环境素材的接入示例。','连接器可以执行代码，使用前要核对工具权限。','将社区插件与它对应的服务端配对使用。'],
  ['Cinema 4D MCP','native','c4d','在已有的 Cinema 4D 工程中调整对象和动态图形。','制作端需要可用的 Cinema 4D 环境。','沿用项目已有的 MoGraph 和渲染设置。'],
  ['Unreal Engine MCP','native','unreal','在 Unreal Editor 中调用编辑器工具、查看场景。','插件能力和项目使用的引擎版本有关。','在 Sequencer 中管理镜头，使用 Movie Render Queue 输出。'],
  ['Remotion','code','remotion','用 React 排列镜头、字幕与音轨。','复杂三维场景需要额外的渲染组件。','用参数替换产品名称、语言或画幅。'],
  ['React Three Fiber','code','r3f','把 Three.js 场景写成 React 组件。','导出视频时，动画应当能按指定帧重复计算。','在 Remotion 的 ThreeCanvas 中渲染。'],
  ['Three.js','code','three','在浏览器里控制模型、材质、相机和光照。','录音、时间线和视频编码需要另行安排。','配合 Remotion 或逐帧导出工具。'],
  ['HyperFrames','code','hyper','用网页元素编排界面演示、文字和媒体。','需要模型和灯光的镜头要另做三维场景。','把已有网页动效与录屏放进同一条时间线。'],
  ['blender-film','skill','film','夜间城市穿越镜头，附飞行路径、灯光和声音制作脚本。','飞行速度和机位需要按场景比例调整。','配合 Blender，参看作者的城市夜航成片。'],
  ['blender-forest','skill','film','拆解森林布景、植被散布和汽车运动。','树木密度和材质会影响显存占用。','用代表帧检查植被、车身反射和投影。'],
  ['blender-car-film','skill','film','雪夜汽车短片的分镜、降雪与多机位制作脚本。','车辆模型及外部素材要按项目替换。','分镜使用同一套资产，分别输出再剪辑。'],
  ['EL4CTEO / blender-skills','skill','skills','按任务查找建模、UV、材质、绑定和烘焙说明。','每项技能对 Blender 版本的要求可能不同。','按当前镜头需要选用对应技能。'],
  ['claude-3d-harness','skill','harness','管理制作阶段、技能版本和中间产物。','接管已有工程前要核对其目录约定。','对照仓库中的场景阶段和检查点使用。'],
  ['CloudAI-X / threejs-skills','skill','threeSkills','查阅 Three.js 的动画、着色器和性能示例。','视频时间线和导出需要另外实现。','配合 Three.js 场景或 R3F 组件。'],
  ['cinematic-3d-video','skill','cinematic','以 Three.js 场景、浏览器截图和 FFmpeg 制作短片。','先检查模板在目标浏览器中的逐帧输出。','适合可用几何体描述的片头或标志动画。'],
  ['Meshy 3D Agent','asset','meshy','从文字或参考图生成模型，再导入场景。','模型尺寸、拓扑和轮廓需要人工核对。','导入 Blender 后对照产品参考图检查。'],
  ['Poly Haven','asset','poly','检索 CC0 环境光贴图、纹理和模型。','下载分辨率影响工程大小和渲染内存。','用 HDRI 布光，按实际画面尺寸选择纹理。'],
  ['FFmpeg','asset','ffmpeg','把连续帧合成视频，编码并封装音轨。','序列编号和输入帧率要与渲染设置一致。','读取 Blender 或浏览器导出的帧序列。'],
  ['Runway MCP','video','runway','从 Claude 调用 Runway 的图像和视频工具。','需要 Runway 账号，生成用量单独核算。','用分镜和主体图生成候选片段，再剪辑。'],
  ['Google Flow','video','flow','以参考素材生成和编排视频镜头。','可用模型与输入形式取决于当前产品设置。','先比较同一主体在相邻镜头中的外观。'],
  ['Kling AI','video','kling','用可灵的参考图、提示词和关键帧控制生成镜头。','局部几何尺寸难以逐项指定。','保留参考图和生成参数，剪辑时检查连续性。']
];
export const caseTypes = {film:'作者成片',template:'模板与样例',demo:'技术演示'};
export const cases = [
  ['城市夜航','film','mromidev / Blender','10 秒第一人称飞行。对照相机路径，观察近景建筑掠过画面时的速度。','https://www.youtube.com/watch?v=ZN-Ugd-4HDM'],
  ['林间行车','film','mromidev / Blender','车辆经过密林。留意树木重复的间距和车身反射的变化。','https://www.youtube.com/watch?v=Udahf4a0UwQ'],
  ['雪夜汽车短片','film','mromidev / Blender','20 秒、六个机位。观察切换机位后，车灯、雪和汽车方向如何衔接。','https://www.youtube.com/watch?v=BagZ55ac4xs'],
  ['教室场景与 Blender MCP','demo','Blender Lab','查看官方连接器如何读取场景、调用 Blender 工具。',urls.blenderMcp],
  ['社区插件的场景示例','demo','ahujasid','作者展示建模指令与外部素材导入，仓库附插件源码。',urls.community],
  ['雨夜屋顶房间','demo','claude-3d-harness','对照灰模和成图，辨认哪些细节来自几何、材质和后期。',urls.harness],
  ['三维手机模板','template','Remotion / React Three Fiber','打开 Studio 预览，按帧拖动，再对照模板里的相机和产品模型。',urls.r3f],
  ['网页动效与发布片','template','HeyGen / HyperFrames','查看不同模板如何安排标题、界面录屏和转场。','https://hyperframes.heygen.com/examples'],
  ['Cinema 4D 场景编辑','demo','Maxon','查看官方演示中的对象选择和场景修改操作。',urls.c4d],
  ['Unreal 编辑器连接示例','demo','Epic Games','查阅插件启用条件、连接方法和编辑器内可调用的工具。',urls.unreal],
  ['三维道具生成','demo','Meshy','查看模型生成、贴图、绑定和资产导出的示例。',urls.meshy],
  ['在 Claude 中调用 Runway','demo','Runway','官方连接示例说明了如何在对话中请求图像或视频。',urls.runway],
  ['Flow TV 作品选','template','Google Flow','按频道观看短片，对照镜头之间的主体一致性。','https://labs.google/flow/tv/channels'],
  ['参考图与关键帧','template','Kling AI','从官方示例比较参考图、动作描述和输出片段。',urls.kling]
];
