import { readFile, writeFile } from 'node:fs/promises';

// Static content: run this after editing events.json or prompt.txt.
const root = new URL('../../public/guides/rex-opportunities/', import.meta.url);
const data = JSON.parse(await readFile(new URL('events.json', root), 'utf8'));
const prompt = await readFile(new URL('prompt.txt', root), 'utf8');
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const main = data.events.filter(event => !event.watch);
const watch = data.events.filter(event => event.watch);
const labels = { value: '参与价值', who: '身份与分工', entry: '入口与截止', fee: '费用', eligibility: '资格条件', action: '下一步', contacts: '建议接触', demo: '演示案例', question: '交流问题', pilot: '试点方向', checked: '本次复核' };
const priorities = { A: '优先行动', B: '有条件参加', C: '持续观察' };

function eventHTML(event) {
  return `<details class="event" id="${esc(event.id)}" data-priority="${event.priority}" data-city="${esc(event.city)}" data-goals="${esc(event.goals.join(' '))}">
<summary><span class="event-date">${esc(event.when)}</span><span class="event-name">${esc(event.name)}<span class="event-meta">${esc(event.city)}${event.venue ? ' · ' + esc(event.venue) : ''} · ${esc(event.goals.join(' / '))}</span></span><span class="event-status">${esc(event.status)}</span><span class="priority priority-${event.priority}">${event.priority}<span class="sr-only"> ${priorities[event.priority]}</span></span></summary>
<div class="event-body"><dl>${Object.entries(labels).filter(([key]) => event[key]).map(([key,label]) => `<div><dt>${label}</dt><dd>${esc(event[key])}</dd></div>`).join('')}</dl>
<p class="sources">${event.sources.map(([label,url]) => `<a href="${esc(url)}" rel="noopener noreferrer" target="_blank">${esc(label)}<span class="sr-only">（新窗口）</span></a>`).join('')}</p><a class="permalink" href="#${event.id}">此活动链接</a></div></details>`;
}

const html = `<!doctype html>
<html lang="zh-CN" data-guide="rex-opportunities">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>REX 创业活动与商业机会｜2026–2027</title>
<meta name="description" content="图卢兹、法国南部与巴塞罗那的行业展会、演讲、创业合作和融资机会。含报名入口、资格、截止提醒及可复用检索提示词。">
<meta name="theme-color" content="#f8f8f7">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="canonical" href="https://zhaoyang.fr/guides/rex-opportunities/">
<meta property="og:title" content="REX 创业活动与商业机会">
<meta property="og:description" content="2026 年 11 月至 2027 年 5 月：活动清单、申请条件、行动安排与检索提示词。">
<meta property="og:type" content="article"><meta property="og:url" content="https://zhaoyang.fr/guides/rex-opportunities/">
<script src="/guides/theme.js?v=20260924c"></script>
<link rel="stylesheet" href="/guides/navigation.css?v=20260924c">
<link rel="stylesheet" href="./style.css?v=20261115">
<script defer src="/guides/navigation.js?v=20260924c"></script>
<script defer src="./app.js?v=20261115"></script>
</head>
<body>
<a class="skip" href="#main">跳到正文</a>
<nav class="guide-navigation" aria-label="攻略导航"><a href="/guides/zh/">返回攻略总览</a><span class="guide-navigation-languages"><a href="#prompt">检索提示词</a></span></nav>
<main id="main" class="shell">
<header>
<h1>REX 创业活动与商业机会</h1>
<p class="report-date">资料日期 <time datetime="2026-11-15">2026 年 11 月 15 日</time> · Europe/Paris</p>
<p>覆盖 2026 年 11 月 15 日至 2027 年 5 月 15 日。优先图卢兹及周边，同时纳入波尔多、巴塞罗那、马赛和里昂。</p>
<p class="source-note">依据本次提供的首轮报告整理，发布前复核了部分重点入口，各项内注明复核范围。原报告未记录检索截止时刻；报名状态和价格是本期资料快照，行动前请查看对应官方入口。</p>
<div class="downloads"><a href="./report.md" download="REX-创业活动-2026-11-15.md">下载活动清单</a><a href="./prompt.txt" download="REX-活动研究提示词.txt">下载提示词</a><button type="button" id="print" hidden>打印攻略</button></div>
</header>
<nav class="contents" aria-label="页内目录"><a href="#priorities">优先行动</a><a href="#events">活动清单</a><a href="#deadlines">截止提醒</a><a href="#schedule">出行安排</a><a href="#materials">准备材料</a><a href="#watch">观察名单</a><a href="#prompt">完整提示词</a></nav>

<section id="priorities" class="reading">
<h2>优先行动</h2>
<ol class="actions">
<li><a href="#transfo">11 月 17 日：Transfo Digitale Day</a>。本人优先交流企业数字化问题；合伙人有时间可分头参加 MEETT 的企业展。带一个能在电脑上操作的业务系统。</li>
<li><a href="#vinitech">12 月 1–3 日：Vinitech-Sifel</a>。农业获客优先考虑两人一起去，围绕订单、库存、出库与单据展示完整流程。</li>
<li><a href="#engage">12 月 3 日前：ENGAGE／4YFN</a>。先向学校确认内部孵化条件，再决定申请产品并准备使用证据。</li>
<li><a href="#advanced-factories">2027 年 2 月 7 日前：Advanced Factories</a>。准备一份有实际使用结果的案例演讲，分别说明业务软件、自动化和 AI 的作用。</li>
<li><a href="#ise">11 月 18 日起：ISE 技术挑战</a>。检查发布的真实需求，优先匹配现有产品；有明确问题和会谈对象后再安排出行。</li>
</ol>
<p>这些优先级是根据 REX 的业务匹配、投入和参与机制作出的建议。行业匹配与演示方向不表示相关企业已提出采购需求。</p>
</section>

<section id="profile" class="reading">
<h2>身份与参与方式</h2>
<p>背景来自本人提供的信息：UT Capitole MIAGE M1 学生、法国 SAS 公司 REX，合伙人具有法国国籍及农业、海外仓储经验。数字业务包括定制软件、网站与应用、库存、检测、工单、文档自动化、系统集成和企业流程中的 AI 应用。</p>
<div class="table-scroll" role="region" aria-label="身份与参与方式对照" tabindex="0"><table><thead><tr><th>身份</th><th>适合寻找的入口</th><th>分工</th></tr></thead><tbody>
<tr><td>法国企业与软件服务商</td><td>行业展、技术挑战、企业对接、合作交付</td><td>本人讲软件；合伙人讲经营场景</td></tr>
<tr><td>农业、海外仓储业务参与者</td><td>农业、包装、物流、供应链与设备交流</td><td>合伙人切入业务，两人共同演示</td></tr>
<tr><td>大学学生与创业参与者</td><td>学生日、大学联盟、校内创业支持</td><td>本人按真实学籍和创业身份申请</td></tr>
<tr><td>有实际产品的团队</td><td>案例演讲、路演、孵化和投资交流</td><td>以一个具体产品和使用证据申请</td></tr>
</tbody></table></div>
<p>国籍、公司注册地、学生资格、法定职务和孵化经历分别核验。只有确有采购职责和需求时才使用专业买家渠道；营收、股份和融资条件未确认的部分保持未知。</p>
</section>

<section id="events">
<h2>活动清单</h2>
<p>A：优先行动。B：有明确资格、目标或约见对象后值得参加。C：持续观察。点击活动可查看条件、费用、分工与官方入口。HT 为未税，TTC 为含税。</p>
<form id="filters" class="filters" hidden role="search" aria-label="筛选活动">
<label class="search-label">搜索活动<input id="search" type="search" placeholder="活动、行业或关键词" autocomplete="off"></label>
<label>目标<select id="goal"><option value="">全部目标</option>${['获客','展示','合作','融资'].map(goal => `<option>${goal}</option>`).join('')}</select></label>
<label>城市<select id="city"><option value="">全部城市</option>${[...new Set(main.map(event=>event.city))].map(city=>`<option>${city}</option>`).join('')}</select></label>
<label>优先级<select id="priority"><option value="">全部优先级</option><option value="A">A · 优先行动</option><option value="B">B · 有条件参加</option></select></label>
<button type="reset">清除筛选</button>
</form>
<div class="list-tools"><p id="result-count" role="status" aria-live="polite">${main.length} 项活动</p><button id="expand" type="button" hidden>展开当前活动</button></div>
<div class="event-head" aria-hidden="true"><span>日期</span><span>活动与地点</span><span>参与状态</span><span>优先级</span></div>
<div id="event-list">${main.map(eventHTML).join('\n')}</div>
<p id="empty" hidden>没有符合条件的活动，请调整关键词或清除筛选。</p>
</section>

<section id="deadlines" class="reading">
<h2>截止提醒</h2>
<p>以 2026 年 11 月 15 日为起点。未来 7 天与 14 天内，原清单没有另外确认的申请截止；11 月 17 日有本地活动，11 月 18 日有新入口开放。未来 30 天重点处理下列事项。</p>
<div class="table-scroll" role="region" aria-label="截止提醒表" tabindex="0"><table><thead><tr><th>日期</th><th>事项</th><th>行动</th></tr></thead><tbody>
<tr><td>11/18 起</td><td><a href="#ise">ISE</a>、<a href="#tech-spirit">Tech Spirit</a></td><td>检查技术挑战与投资人会谈预约，分别核对资格</td></tr>
<tr><td>11/30</td><td><a href="#soft">SOFT B2B</a></td><td>配对报名截止；先确认约见对象</td></tr>
<tr><td>12/01 前</td><td><a href="#place-creative">La Place aux Pitchs</a></td><td>建议 11/30 前提交，先确认既有 SAS 产品是否适用</td></tr>
<tr><td>12/03 23:59 CET</td><td><a href="#engage">ENGAGE／4YFN</a></td><td>完成孵化资格核对与英文材料</td></tr>
<tr><td>12/10</td><td><a href="#occitanie-invest">Occitanie Invest</a></td><td>核对营收、现金、融资产品与用途</td></tr>
<tr><td>2027/01/31</td><td><a href="#medfel">medFEL 区域展团</a></td><td>只在有展示目标和预算时申请付费展团</td></tr>
<tr><td>2027/02/02</td><td><a href="#ise">ISE 技术供应商</a></td><td>按技术供应商专门截止日提交</td></tr>
<tr><td>2027/02/07 23:59:59 CET</td><td><a href="#advanced-factories">Advanced Factories</a></td><td>案例演讲投稿截止</td></tr>
</tbody></table></div>
</section>

<section id="schedule" class="reading">
<h2>两周行动与出行取舍</h2>
<ul>
<li>11 月 15–17 日：落实本地活动，准备一页法语企业介绍和五分钟演示。La Cité 与 MEETT 分属两处，不把两个全天议程都排满。</li>
<li>11 月 18 日：检查 ISE 技术供应商入口和 Tech Spirit 会谈；只为匹配的问题和对象继续准备。</li>
<li>11 月 19–22 日：确定 12 月初主行程；核对 ENGAGE 校内孵化条件、La Place aux Pitchs 资格和 Aeromart 学生日报名。</li>
<li>11 月 23–29 日：完成产品使用证据、英文动机与三分钟 pitch；如果选择 SOFT，提前落实约见。</li>
</ul>
<div class="table-scroll" role="region" aria-label="行程撞期与取舍" tabindex="0"><table><thead><tr><th>时间</th><th>冲突或组合</th><th>建议取舍</th></tr></thead><tbody>
<tr><td>11/17</td><td>Transfo Digitale Day / 企业展</td><td>软件需求优先前者；两人可分头参加</td></tr>
<tr><td>12/01–03</td><td>Vinitech / Nuit des Réseaux / SOFT / La Place Créative / Tech Spirit / Aeromart</td><td>农业获客优先 Vinitech；练 pitch 选 La Place；融资合作需先约会谈；航空了解走学生日</td></tr>
<tr><td>2027/03/01–04</td><td>4YFN / Talent Arena</td><td>同在巴塞罗那，可合并差旅，但入选 ENGAGE 后优先满足其四日出席要求</td></tr>
<tr><td>2027/03/18</td><td>Global Industrie / Occitanie Invest</td><td>若入选融资活动，保留图卢兹当天；里昂展可选其他日期</td></tr>
</tbody></table></div>
<p>两人分工时，合伙人主攻农业和仓储交流，本人主攻演讲、大学创业和技术合作。共同去农业展时，把时间留给联合演示与需求访谈。</p>
</section>

<section id="materials" class="reading">
<h2>准备材料</h2>
<ul>
<li>一页法语企业介绍：REX 做什么、已完成的项目、希望接触的客户。</li>
<li>三分钟项目介绍：围绕一个产品或案例，说明问题、方案和实际使用。</li>
<li>五分钟可操作演示：完整展示订单、库存、检测、工单或单据中的一条业务流程。</li>
<li>一页效果记录：使用场景、使用者、处理量、减少的步骤或时间；尚未测量的数据不写成成果。</li>
</ul>
<p>Advanced Factories 可围绕电子产品仓储的检测、库存与出入库追踪准备案例。ENGAGE 需要把公司与合伙人的经营背景联系到参选产品的 MVP、试点、用户或收入证据；不同实体的业务收入分别说明。</p>
<p>展示硬件、现场安装或设备接口时，明确设备访问、协议、调试、维护和验收责任。软件演示中使用已获授权的数据或清楚标注的示例数据。</p>
</section>

<section id="watch">
<h2>观察名单与未开放入口</h2>
${watch.map(eventHTML).join('\n')}
<ul class="reading"><li><a href="#global-industrie">Global Industrie</a> 创业比赛已截止，继续看观众与商务交流入口。</li><li><a href="#medfel">medFEL</a> 免费观众 badge 尚未开放，等待年底公告。</li><li><a href="#hispack">Hispack</a> 目前仅确认展商联系入口，观众票价和报名待核实。</li></ul>
</section>

<section id="prompt" class="reading">
<h2>可复用检索提示词</h2>
<p>首次用于完整调研；后续与上一期成功报告比较，滚动检查未来六个月。复制文本不会创建定时任务，已有任务继续沿用。</p>
<div class="downloads"><button id="copy-prompt" type="button" hidden>复制提示词</button><a href="./prompt.txt" download="REX-活动研究提示词.txt">下载 TXT</a><button id="select-prompt" type="button" hidden>选中全文</button></div>
<p id="copy-status" role="status" aria-live="polite"></p>
<details class="prompt-details"><summary>查看完整提示词</summary><pre id="prompt-text" tabindex="0">${esc(prompt)}</pre></details>
</section>
<footer class="reading"><p>本期资料整理：2026 年 11 月 15 日。原报告提及每周一上午（法国时间）更新，首次为 11 月 16 日；任务状态以原任务记录为准，本页不会自动发起报名、购票或联系。</p><a href="/guides/zh/">返回攻略总览</a></footer>
</main></body></html>`;
await writeFile(new URL('index.html', root), html);

const report = `# REX 创业活动与商业机会\n\n资料日期：2026-11-15（Europe/Paris）。覆盖：2026-11-15 至 2027-05-15。\n\n依据提供的首轮报告整理，部分重点入口在发布前复核，范围见各项。原报告未记录检索截止时刻。状态与价格是本期资料快照，行动前请复核官方入口。参与、演示和试点方向是建议，不代表公开采购需求。\n\nA：优先行动；B：有明确条件后参加；C：持续观察。HT 为未税，TTC 为含税。\n\n${data.events.map(event => `## ${event.name}${event.watch ? '（观察名单）' : ''}\n\n${event.when} · ${event.city}${event.venue ? ' · ' + event.venue : ''} · ${event.priority} ${priorities[event.priority]}\n目标：${event.goals.join('、')}。状态：${event.status}。\n\n${Object.entries(labels).filter(([key])=>event[key]).map(([key,label])=>`- ${label}：${event[key]}`).join('\n')}\n\n${event.sources.map(([label,url])=>`[${label}](${url})`).join(' · ')}`).join('\n\n')}\n\n## 检索提示词\n\n${prompt}`;
await writeFile(new URL('report.md', root), report);
console.log(`Built ${main.length} opportunities, ${watch.length} watch items and the complete research prompt.`);
