import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {tools, cases, categories, caseTypes, urls} from './catalog.mjs';

const base = '/guides/claude-3d/';
const output = new URL('../../public' + base, import.meta.url);
const pages = [['','制作路线'],['tools','工具比较'],['cases','案例库'],['estimate','用量估算'],['handbook','项目手册']];
const esc = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const toolId = name => name.toLowerCase().replaceAll(/[^a-z0-9]+/g,'-').replace(/-$/, '');
const path = key => key ? base + key + '/' : base;
const link = (href,label) => `<a href="${esc(href)}">${esc(label)}</a>`;
const options = items => Object.entries(items).map(([key,value]) => `<option value="${key}">${value}</option>`).join('');
const src = name => base + 'media/' + name;
const download = `<a class="button primary" href="${src('twin-66.blend')}" download>下载 Blender 工程</a>`;
const routes = {
  native: ['可编辑场景','Blender 场景','把模型、镜头和材质留在同一个工程里。客户要调整焦距或反光时，可以重渲对应镜头。','Blender','native'],
  code: ['视频模板','Remotion 模板','把文案、颜色和画幅设为参数。片头时间线可以复用，多个语言版本各自导出。','Remotion','code'],
  video: ['生成片段','参考图生成视频','固定主体参考图，为每个镜头分别写动作和构图。保留候选片段，在剪辑软件里排列。','Runway','video']
};
function home() {
  return `<section class="cover">
    <div class="cover-copy"><h1>Claude 与<br> 3D 视频制作</h1>
      <p>从这台双镜头相机入手。打开场景，可以移动机位、换一组灯光，看它们怎样改变同一个镜头。</p>
      <div class="actions">${download}<a class="text-link" href="${path('cases')}#studio">看 3 秒样片</a></div>
    </div>
    <figure class="viewer"><img id="study" src="${src('studio.webp')}" width="1100" height="724" fetchpriority="high" alt="深绿色双镜头相机的 Blender 材质渲染">
      <figcaption><span>双镜头相机习作</span><div class="segmented only-js" aria-label="切换渲染视图" role="group">
      ${[['studio','材质'],['clay','灰模'],['detail','镜头细节']].map(([key,label],i)=>`<button type="button" data-view="${key}" aria-pressed="${i===0}">${label}</button>`).join('')}</div></figcaption>
    </figure>
  </section>
  <section class="section"><h2>按交付物选路线</h2>
    <div class="route-layout"><div class="route-options" aria-label="交付物">
    ${Object.entries(routes).map(([k,r],i)=>`<a href="#route-${k}" data-route="${k}" ${i===0?'aria-current="true"':''}>${r[0]}<span class="chevron" aria-hidden="true"></span></a>`).join('')}</div>
    <div class="route-reading">${Object.entries(routes).map(([k,r])=>`<article id="route-${k}"><h3>${r[1]}</h3><p>${r[2]}</p><a class="text-link" href="${path('tools')}?category=${r[4]}">查看相关工具</a></article>`).join('')}
    <details class="adviser only-js"><summary>按题材和设备细选</summary>
    <div class="fields two"><label>拍摄题材<select id="subject">${options({product:'实体产品',ui:'软件界面',scene:'建筑或环境',story:'人物或叙事'})}</select></label>
    <label>制作设备<select id="machine">${options({laptop:'普通笔记本',mac:'Apple Silicon Mac',gpu:'独显或渲染机'})}</select></label></div><p id="advice" role="status"></p></details></div></div>
  </section>`;
}
function toolsPage() {
  return `<header class="page-title"><h1>工具比较</h1></header>
  <div class="toolbar only-js"><label>搜索工具<input type="search" id="search" placeholder="名称、用途或搭配"></label>
  <label>类别<select id="category">${options({all:'全部类别',...categories})}</select></label><a class="button" href="#comparison">查看对比<span id="picked"></span></a></div>
  <p id="found" class="status only-js" role="status"></p>
  <div id="tools-list" class="catalog">${tools.map(([name,category,key,use,limit,setup])=>`
    <article data-category="${category}" data-tool="${toolId(name)}">
      <div class="tool-description"><h2>${link(urls[key],name)}</h2><p>${esc(use)}</p></div><span class="type">${categories[category]}</span>
      <label class="compare-choice only-js"><input type="checkbox" value="${toolId(name)}" aria-label="对比 ${esc(name)}">对比</label>
      <details><summary>使用条件</summary><dl><dt>使用限制</dt><dd data-limit>${esc(limit)}</dd><dt>搭配方式</dt><dd data-setup>${esc(setup)}</dd></dl></details>
    </article>`).join('')}</div><div id="no-tools" hidden><p>没有找到符合条件的工具。</p><button id="reset-filter" type="button">清除筛选</button></div>
  <section class="section only-js" id="comparison" tabindex="-1"><div class="section-head"><h2>已选工具</h2><button type="button" class="quiet" id="clear" hidden>清空对比</button></div><p class="status" id="compare-hint">勾选列表中的工具，最多可比较三项。</p><div id="compare-table"></div></section><a href="#comparison" id="compare-shortcut" class="button primary" hidden>查看对比</a>`;
}
function casesPage() {
  return `<header class="page-title"><h1>案例库</h1></header>
  <section class="sample" id="studio"><video playsinline controls preload="none" width="720" height="474" aria-label="双镜头相机环绕镜头，无声，3 秒" poster="${src('studio.webp')}" src="${src('twin-66.mp4')}"></video>
  <div><h2>双镜头相机习作</h2><p class="spec">Blender 5.2 · 24 fps · 72 帧</p>
  <p>拍摄机位绕机身转过 48 度。暂停在镜片高光最明显的一帧，打开工程，移动左前方的面光源，对照镜片上的反射。</p>
  <div class="actions">${download}${link(src('twin-66.mp4'),'打开视频')}</div><details class="shot-exercise"><summary>用 Claude 改这一镜</summary><p>把这段要求和工程文件名交给能操作 Blender 的 Claude。</p><pre>打开 twin-66.blend，定位到第 48 帧。把 Key strip 面光源向左移动半个 Blender 单位，保持灯光朝向机身中央。渲染修改前后两张图，比较上方镜片的高光。把修改后的场景另存为 twin-light.blend。</pre></details></div></section>
  <section class="section"><div class="section-head"><h2>作品与技术示例</h2><label class="inline-label only-js">案例类型<select id="case-type">${options({all:'全部类型',...caseTypes})}</select></label></div>
  <div class="works">${cases.map(([name,type,author,desc,url])=>`<article data-case="${type}"><div><span class="byline">${esc(author)}</span><h3>${link(url,name)}</h3></div><p>${desc}</p><span class="type">${caseTypes[type]}</span></article>`).join('')}</div></section>`;
}
const calculators = [
  ['render','渲染时间','输入一帧在目标设备上的实测耗时。', [['seconds','时长（秒）',20,0.001],['fps','帧率（fps）',24,0.001],['per','每帧耗时（秒）',10,0.001]],'总帧数向上取整，再乘以每帧耗时。结果按一台设备连续渲染计算。',urls.frames,'Blender 动画输出'],
  ['quota','订阅额度','从同一额度窗口记录一次试做前后的用量差。', [['percent','试做用量（%）',8,0.001,100],['tested','试做镜头数',2,1],['shots','计划镜头数',5,1]],'试做用量 × 计划镜头数 ÷ 试做镜头数。仅适用于模型、上下文和复杂度相近的任务。',urls.limits,'Claude 使用限制'],
  ['api','API 费用','从所用模型的价格表填写单价，金额单位为美元。', [['input','输入 token 数',500000,0],['output','输出 token 数',50000,0],['inprice','输入单价（美元 / 百万 token）','',0],['outprice','输出单价（美元 / 百万 token）','',0]],'输入和输出分别乘以单价，再除以一百万。缓存、批处理折扣和外部视频积分另计。',urls.pricing,'Anthropic 价格表']
];
function estimate() {
  return `<header class="page-title"><h1>用量估算</h1></header><div class="desk-layout"><nav class="section-index" aria-label="估算方式">${calculators.map(([key,title])=>link('#'+key,title)).join('')}</nav><div>${calculators.map(([key,title,intro,fields,note,url,source])=>`<section class="worksheet" id="${key}"><h2>${title}</h2><p>${intro}</p>
    <div class="fields ${key==='api'?'two':'three'}">${fields.map(([id,label,value,min,max])=>`<label>${label}<input type="number" id="${id}" min="${min}" ${max?'max="'+max+'"':''} step="${['tested','shots','input','output'].includes(id)?'1':'any'}" value="${value}" ${value===''?'placeholder="填写单价"':''} required></label>`).join('')}</div>
    <output class="only-js" id="${key}-result" aria-live="polite"></output><p class="formula">${note}</p>${link(url,source)}</section>`).join('')}</div></div>`;
}
const notes = [
 ['写下交付要求','记下片长、帧率、画幅和声音要求。要交三维源文件的项目，还要约定软件版本和外部素材的打包方式。'],
 ['画出主镜头','为每个镜头留一行，写清起止帧、主体运动和相机运动。把产品尺寸、参考图和商标文件放进资产清单。'],
 ['试做最难的一段','取最难的 3 至 5 秒做小样。灰模检查轮廓和遮挡，材质预览检查反光。记录一帧的渲染时间和峰值显存。'],
 ['逐帧输出','把各镜头渲染成编号连续的图片。失败时补算缺失帧，合成时沿用工程帧率。字幕换行和声音切点在最终画幅中检查。'],
 ['回看并交付','看一遍完整视频，留意闪烁、穿模和切镜后的响度。用另一目录打开源工程，核对贴图、字体、资产授权和输出设置。']
];
const kit = await readFile(new URL('developer-kit-prompt.txt', output), 'utf8');
function handbook(){
  const sources = [['Blender 动画输出',urls.frames],['Remotion 的 ThreeCanvas',urls.threeCanvas],['FFmpeg 图像序列',urls.ffmpeg],['Poly Haven 素材许可',urls.poly],['Claude 订阅使用限制',urls.limits],['Anthropic API 价格',urls.pricing],['Claude 模型说明','https://platform.claude.com/docs/en/models/overview']];
  return `<header class="page-title"><h1>项目手册</h1></header><div class="desk-layout"><nav class="section-index" aria-label="手册章节">${[['#workflow','从分镜到交付'],['#prompt','开发包提示词'],['#sources','参考资料']].map(pair=>link(...pair)).join('')}</nav><div>
  <section class="chapter" id="workflow"><h2>从分镜到交付</h2><ol class="steps">${notes.map(([title,desc])=>`<li><h3>${title}</h3><p>${desc}</p></li>`).join('')}</ol>
  <details><summary>把示例工程的图像序列合成 MP4</summary><p>在 Blender 中选择「渲染动画」。工程旁会生成 frames 目录，从工程所在目录运行下列命令。</p><pre><code>ffmpeg -framerate 24 -start_number 1 -i frames/twin-%04d.png -c:v libx264 -pix_fmt yuv420p twin.mp4</code></pre>${link(urls.ffmpeg,'FFmpeg 图像序列文档')}</details></section>
  <aside class="model-note"><h3>Claude 的分工</h3><p>需要同时安排多个镜头、查找渲染错误时，可以用 Opus 拆解；模板定下来以后，换字幕、改参数和整理脚本可以交给 Sonnet。先用同一个镜头试做一次，再按实测耗时与用量决定模型。</p></aside>
  <section class="chapter" id="prompt"><h2>开发包提示词</h2><p>把本次拍摄条件写在提示词开头，连同分镜、素材、渲染和交付要求一起交给 Claude。</p><div class="only-js"><div class="fields two">${[['项目内容','双镜头相机展示'],['设备与系统','MacBook Pro，18 GB'],['项目预算','外部服务不超过 10 欧元'],['交付要求','20 秒、1080p，附可编辑工程']].map(([label,example])=>`<label>${label}<input data-brief="${label}" placeholder="${example}"></label>`).join('')}</div>
  <div class="actions"><button class="button primary" id="copy" type="button">复制提示词</button><button class="button" id="download" type="button">下载 TXT</button></div><p id="copy-status" role="status"></p></div>
  <details id="prompt-details"><summary>查看提示词全文</summary><pre id="prompt-text">${esc(kit)}</pre></details><a href="${base}developer-kit-prompt.txt" download>下载原始提示词</a></section>
  <section class="chapter" id="sources"><h2>参考资料</h2><div class="references">${sources.map(([title,url])=>`<div>${link(url,title)}<span>${new URL(url).hostname}</span></div>`).join('')}</div>
  <p>制作插件的源码和作者演示分别收在${link(path('tools'),'工具比较')}和${link(path('cases'),'案例库')}。</p></section></div></div>`;
}
const contents = [home,toolsPage,casesPage,estimate,handbook];
for (const [index,[key,title]] of pages.entries()){
  const pageTitle = key ? title+' | Claude 3D 视频制作指南' : 'Claude 3D 视频制作指南';
  const dir = new URL(key ? key + '/' : './', output);
  await mkdir(dir,{recursive:true});
  await writeFile(new URL('index.html',dir),`<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${pageTitle}</title>
<meta name="description" content="${key?title+'。':''}用 Blender 相机工程学习三维镜头制作，查阅工具、案例与渲染估算。"><link rel="canonical" href="https://zhaoyang.fr${path(key)}">
<link rel="icon" href="/guides/favicon.svg" type="image/svg+xml"><link rel="icon" href="/guides/favicon-32.png" sizes="32x32" type="image/png"><link rel="apple-touch-icon" href="/guides/apple-touch-icon.png"><meta property="og:title" content="${pageTitle}"><meta property="og:image" content="https://zhaoyang.fr${src('studio.webp')}">
<script src="/guides/theme.js?v=20260924c"></script><link rel="stylesheet" href="${base}guide.css?v=1"><script defer src="${base}guide.js?v=1"></script></head>
<body><a class="skip" href="#main">跳到正文</a><header class="mast"><div class="mast-inner"><div class="identity"><a id="all-guides" href="/guides/zh/">攻略总览</a><span aria-hidden="true">/</span><a class="brand" href="${base}">影像制作手册</a></div><nav class="main-nav" aria-label="指南栏目">${pages.map(([slug,label])=>`<a href="${path(slug)}" ${slug===key?'aria-current="page"':''}>${label}</a>`).join('')}</nav>
<button id="theme" class="only-js" type="button" aria-label="切换配色"><span aria-hidden="true" class="theme-symbol"></span><span id="theme-label">配色</span></button></div></header>
<main id="main" class="shell">${contents[index]()}</main><footer class="shell foot"><a href="${base}">Claude 3D 视频制作指南</a><a href="${path('handbook')}#sources">参考资料</a></footer></body></html>\n`);
}
