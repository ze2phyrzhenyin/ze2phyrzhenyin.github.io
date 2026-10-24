import { systems, commandsFor, detectSystem, repairPrompt, quickPrompts } from './content.js';

const $ = (selector) => document.querySelector(selector);
const escape = (text) => String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const copyIcon = '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2"/><path d="M12 7V3H3v9h4"/></svg>';
const checkIcon = '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8"/><path d="m6 10 3 3 5-6"/></svg>';
let blockId = 0;
const detected = detectSystem(navigator.userAgentData?.platform || navigator.platform, navigator.userAgent);
let os = detected || 'windows';
let step = 0;
const completed = { windows: new Set(), macos: new Set(), linux: new Set() };
let privateKey = '';
let secretRequest = 0;
let toastTimer;

function code(text, title, prompt = false) {
  const id = `command-${++blockId}`;
  return `<div class="code-block${prompt ? ' prompt' : ''}"><div class="code-top"><span class="code-caption">${escape(title)}</span><button type="button" class="copy" data-copy="${id}" aria-label="复制${escape(title)}">${copyIcon}<span>复制</span></button></div><pre tabindex="0" aria-label="${escape(title)}"><code id="${id}">${escape(text)}</code></pre></div>`;
}
const result = (text) => `<div class="success">${checkIcon}<p><strong>看到这个，就对了：</strong>${text}</p></div>`;
const instruction = (number, title) => `<p class="instruction"><span class="instruction-number" aria-hidden="true">${number}</span><strong>${title}</strong></p>`;
const link = (url, text) => `<a class="inline-link" href="${url}" target="_blank" rel="noopener noreferrer">${text} ↗</a>`;

function stepContent() {
  const s = systems[os];
  const c = commandsFor(os);
  const title = ['准备运行环境', '安装 Codex CLI', '连接你的 API Key', '打开自己的 Java 项目', '开始修复 Java 代码'][step];
  const intro = [
    '终端就是输入命令的窗口。跟着复制、粘贴，再按回车即可。',
    '把 Codex 安装到电脑上。安装通常需要几十秒，请等它执行完。',
    '这里已经为你准备了专用密钥，无需自行充值。按下面的顺序操作。',
    '先进入项目文件夹，再启动 Codex。它就知道要帮你看哪些代码。',
    '把问题说清楚，让 Codex 先分析，再用尽量小的修改解决它。',
  ][step];
  let body = '';
  if (step === 0) body = `
    ${instruction(1, `打开 ${s.terminal}`)}
    <div class="terminal-tip">${s.open}<br>复制下面的命令，在终端按 <strong>${s.paste}</strong> 粘贴，然后按 <strong>Enter（回车）</strong>。每条分别执行。</div>
    ${instruction(2, '检查 Node.js 和 npm')}
    ${code(c.node, '检查 Node.js')}${code(c.npm, '检查 npm')}
    ${result('两条命令都显示版本号，例如 <code>v24.x.x</code> 和 <code>11.x.x</code>。已经安装就可以直接下一步。')}
    <details class="inline-details"><summary>没有版本号，或提示找不到命令？</summary><p>打开 ${link('https://nodejs.org/en/download', 'Node.js 官方下载页')}，选择你的系统和 <strong>LTS（长期支持）</strong>版本。${os === 'windows' ? '选择 Windows Installer（.msi）下载安装，保留 npm 和 PATH 的默认选项。' : os === 'macos' ? '选择 macOS Installer（.pkg）下载安装。' : '按照官网针对你的 Linux 发行版提供的安装说明操作。'} 安装完成后，关闭并重新打开终端，再执行上面两条命令。</p></details>`;

  if (step === 1) body = `
    ${instruction(1, '复制安装命令，在终端粘贴并按回车')}${code(c.install, '安装最新版 Codex')}
    <p class="helper">等待终端重新出现可以输入命令的提示符，再进行下一项。</p>
    ${instruction(2, '检查是否安装成功')}${code(c.version, '检查 Codex 版本')}
    ${result('出现 <code>codex-cli</code> 和版本号，就说明安装成功。')}
    <details class="inline-details"><summary>${os === 'windows' ? '为什么命令后面有 .cmd？' : '安装时提示 EACCES 或权限不足？'}</summary><p>${os === 'windows' ? 'PowerShell 有时会拦截 npm.ps1 或 codex.ps1。本教程统一使用 npm.cmd 和 codex.cmd，功能相同，不需要关闭执行策略或降低系统安全设置。' : `不要直接加 sudo 重试。按 ${link('https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally', 'npm 官方权限修复说明')} 使用 Node.js 版本管理器或用户目录安装，再重新执行安装命令。`}</p></details>
    <p class="helper">安装后仍找不到 Codex？页面下方第一条常见问题有继续操作的方法。</p>`;

  if (step === 2) body = `
    <p class="callout">本教程使用 <strong>API Key 按量计费登录</strong>，费用由管理员承担。ChatGPT 订阅登录是另一种方式，不要在这里改选 ChatGPT 登录。</p>
    ${instruction(1, '先运行登录命令，等终端提示输入密钥')}
    ${code(c.login, `${s.terminal} · 隐藏输入登录`)}
    <p class="helper">整段复制，粘贴到 ${s.terminal} 后按回车；${os === 'windows' ? '若出现多行粘贴提醒，确认粘贴，最后再按一次回车。' : ''}看到 <code>Paste API Key, then press Enter</code> 再继续。命令会从隐藏输入接收密钥，不会把密钥写入命令历史。</p>
    ${instruction(2, '回到这里复制密钥，再粘贴到终端')}
    <div class="key-card"><div><strong>本页专用 API Key</strong><span id="key-status">正在读取受保护的密钥…</span></div><div class="key-actions"><button type="button" class="button primary" id="copy-key" disabled>${copyIcon}复制密钥</button><button type="button" class="button secondary" id="reveal-key" disabled aria-expanded="false">显示</button></div><code id="key-value" hidden></code></div>
    <p class="helper">在终端按 <strong>${s.paste}</strong> 粘贴密钥，再按回车。${os === 'windows' ? '只显示星号是正常现象。' : '屏幕不显示字符，也不显示星号，这是正常现象。'} 这时不要再复制上面的命令，以免覆盖剪贴板里的密钥。</p>
    ${instruction(3, '检查登录方式')}${code(c.status, '检查登录状态')}
    ${result('显示已使用 API Key 登录（通常包含 <code>API key</code>）。这说明本机已保存登录信息；额度和模型权限要在发送第一条任务时才能确认。')}
    <details class="inline-details"><summary>已有自己的项目密钥，或需要更换密钥？</summary><ol class="checklist"><li>接受管理员发来的 OpenAI API 项目邀请。</li><li>打开 ${link('https://platform.openai.com/api-keys', 'API Keys')}，切换到管理员承担费用的项目，创建<strong>属于你自己的项目密钥</strong>。</li><li>重新执行上面的登录命令，在终端粘贴你新建的密钥，不要粘贴到网页或 Java 项目文件里。</li></ol></details>
    <p class="helper">Codex 会在电脑的凭据存储或 <code>~/.codex/auth.json</code> 保存登录信息；不要分享这个文件。网页不会把密钥存入浏览器本地存储。</p>`;

  if (step === 3) body = `
    <p class="callout">修改前先复制一份完整项目作为备份；如果你会用 Git，先保存当前改动并提交。项目中有重要文件时，这一步不要省略。</p>
    ${instruction(1, '进入项目文件夹')}
    <p class="helper">找到包含 <code>pom.xml</code>、<code>build.gradle</code> 或 <code>src</code> 的文件夹。${os === 'windows' ? '在文件资源管理器中打开它，点击顶部地址栏复制完整路径。' : os === 'macos' ? '在 Finder 中选中文件夹，按 ⌥ + ⌘ + C 复制路径。' : '在文件管理器中打开它，按 Ctrl + L 复制完整路径。'} 把下面引号里的示例换成你的真实路径，保留引号。</p>
    ${code(c.path, '进入项目 · 请替换示例路径')}
    ${instruction(2, '启动 Codex，使用 Astra / xhigh')}${code(c.start, '启动 GPT-6-Astra · xhigh')}
    <p class="helper">以后每次开始工作，都在项目目录运行这条启动命令，它会明确选择这个模型和思考强度。首次出现项目信任或沙箱提示时，只信任自己的项目，保留默认安全权限。</p>
    ${result('进入 Codex 对话界面，显示当前项目目录和 <code>gpt-6-astra</code>。现在它可以读取项目文件，并根据你的要求分析和协助修改。')}
    <details class="inline-details"><summary>运行 Java 项目测试，还需要什么？</summary><p>在启动 Codex 前，或另开一个终端执行：</p>${code(c.java, '检查 Java')}<p>出现版本号说明已找到 Java。编译和测试还需要与项目要求一致的 JDK；使用 Maven / Gradle 的项目可能还需要构建工具，优先使用项目自带的 <code>mvnw</code> / <code>gradlew</code>。不确定版本时，先让 Codex 阅读项目配置并告诉你要安装什么。</p></details>`;

  if (step === 4) body = `
    <p class="helper">复制下面的提示词，粘贴到 <strong>Codex 的对话输入区</strong>，把方括号里的内容换成你的实际问题，再按回车发送。</p>
    ${code(repairPrompt, 'Java 项目诊断与修复', true)}
    <p class="helper">把错误信息、预期效果或报错截图补充给 Codex，通常能让它更快定位问题。截图粘贴不成功时，直接复制完整报错文字即可。</p>
    ${result('Codex 开始分析你的项目并回复。修改完成后，检查它列出的文件和测试结果；仍有报错就把完整报错发回同一段对话。')}
    <details class="inline-details"><summary>另外 3 个随手可用的提示词</summary><div class="quick-prompts">${quickPrompts.map((p) => code(p.text, p.title)).join('')}</div></details>
    ${completed[os].size === 5 ? '<div class="completion"><strong>准备好了，去解决第一个问题吧。</strong><p>你已确认完成全部 5 步。以后进入项目文件夹，使用第 4 步的启动命令即可继续。</p></div>' : ''}`;
  return `<div class="panel-enter"><p class="panel-kicker">STEP 0${step + 1} / 05</p><h2 tabindex="-1" id="step-title">${title}</h2><p class="intro">${intro}</p>${body}</div>`;
}

function renderFaq() {
  const c = commandsFor(os);
  const questions = [
    ['提示 codex is not recognized 或 command not found？', `<p>关闭并重新打开终端，再试第 2 步；Windows 请使用 <code>codex.cmd</code>。仍不行可在项目目录用下面的临时启动命令（首次会下载），或用第二条命令查看 npm 安装目录并按 ${link('https://docs.npmjs.com/cli/v11/configuring-npm/folders', 'npm 官方目录说明')}检查 PATH。</p>${code(c.fallback, '临时启动 Codex · Astra / xhigh')}${code(c.prefix, '查看 npm 全局安装目录')}`],
    ['API Key 登录失败怎么办？', '<p>按第 3 步重新登录，确认粘贴的是完整 API Key，没有额外空格，也没有把网页访问码当成 API Key。若仍提示无效、无模型权限或网络不可达，把报错文字发给管理员，让管理员检查密钥状态、项目权限、GPT-6-Astra 的访问资格及当前网络；不要发送完整密钥或截图中的密钥。</p>'],
    ['提示额度不足、余额不足，或密钥过期？', '<p>先停止重复重试，联系管理员确认项目额度、账户余额或更换到期密钥，你不需要自己充值。项目消费提醒不等于硬性上限；换了密钥后，按第 3 步重新登录。</p>'],
    ['Codex 修改错了，怎么恢复？', '<p>先按 Ctrl + C 停止当前任务，再在 IDE 的 Git 差异视图中查看改动，只撤销本次错误修改，保留你原本的工作。没有 Git 时，从第 4 步制作的项目备份恢复相应文件；不要直接删除整个项目。</p>'],
    ['怎么退出 Codex 或退出 API 登录？', `<p>在 Codex 对话里输入下面的退出指令；正在执行任务时先按 Ctrl + C 停止。回到普通终端后，第二条命令可以清除本机登录；它不会撤销平台上的密钥。要结束网页访问，点击页面顶部「退出此页面」；网页登录在 8 小时后也会自动到期。</p>${code(c.exit, '退出 Codex 对话')}${code(c.logout, '清除本机 API 登录')}`],
  ];
  $('#faq-items').innerHTML = questions.map(([q, a]) => `<details><summary>${q}</summary><div>${a}</div></details>`).join('');
}

function notify(text) {
  clearTimeout(toastTimer);
  $('#toast').textContent = text;
  $('#toast').classList.add('visible');
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 2600);
}

async function loadSecret() {
  const request = ++secretRequest;
  privateKey = '';
  try {
    const response = await fetch('./access-key', { cache: 'no-store', credentials: 'same-origin', redirect: 'error' });
    if (!response.ok) throw new Error('unavailable');
    const data = await response.json();
    if (typeof data.key !== 'string' || !/^sk-[A-Za-z0-9_-]{20,}$/.test(data.key)) throw new Error('invalid');
    if (request !== secretRequest || step !== 2) return;
    if (data.expiresAt && Date.now() >= Date.parse(data.expiresAt)) {
      $('#key-status').textContent = '专用密钥已到期，请联系管理员更换后再继续。';
      return;
    }
    privateKey = data.key;
    $('#key-status').textContent = data.expiresAt ? `有效期至 ${data.expiresAt.slice(0, 10)}，请勿转发。` : '仅供受邀朋友使用，请勿转发。';
    $('#copy-key').disabled = false;
    $('#reveal-key').disabled = false;
  } catch {
    if (request !== secretRequest || step !== 2) return;
    $('#key-status').textContent = '专用密钥暂不可用，请联系管理员，或使用下方的自有项目密钥方式。';
  }
}

function render({ focus = false, scroll = false } = {}) {
  privateKey = '';
  secretRequest++;
  document.querySelectorAll('[data-os]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.os === os)));
  document.querySelectorAll('[data-step]').forEach((b) => {
    const index = Number(b.dataset.step);
    const done = completed[os].has(index);
    if (index === step) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    b.dataset.complete = String(done);
    b.querySelector('.step-number').textContent = done ? '✓' : `0${index + 1}`;
    b.setAttribute('aria-label', `第 ${index + 1} 步，${b.querySelector('.step-label').firstChild.textContent}${done ? '，已完成' : ''}`);
  });
  $('#progress').value = completed[os].size;
  $('#progress-count').textContent = `${completed[os].size} / 5`;
  $('#panel').innerHTML = stepContent();
  $('#previous').disabled = step === 0;
  $('#next').disabled = completed[os].size === 5 && step === 4;
  $('#next').innerHTML = step === 4 ? (completed[os].has(4) ? '已发送第一条提示词 ✓' : '我已发送第一条提示词 ✓') : '检查完成，下一步 <span aria-hidden="true">→</span>';
  $('#announcer').textContent = `${systems[os].name}，第 ${step + 1} 步，已完成 ${completed[os].size} / 5`;
  if (step === 2) void loadSecret();
  if (scroll) $('#guide').scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  if (focus) $('#step-title').focus({ preventScroll: true });
}

$('#detected').textContent = detected ? `已识别 ${systems[os].name} · 也可以手动切换` : '请选你要安装 Codex 的电脑系统，手机仅用于阅读';
for (const button of document.querySelectorAll('[data-os]')) button.addEventListener('click', () => {
  os = button.dataset.os;
  $('#detected').textContent = `当前按 ${systems[os].name} 显示 · 每个系统单独记录本次进度`;
  render(); renderFaq();
});
for (const button of document.querySelectorAll('[data-step]')) button.addEventListener('click', () => { step = Number(button.dataset.step); render({ focus: true }); });
$('#start').addEventListener('click', () => { step = 0; render({ focus: true }); });
$('#previous').addEventListener('click', () => { if (step > 0) step--; render({ focus: true, scroll: true }); });
$('#next').addEventListener('click', () => {
  completed[os].add(step);
  if (step < 4) step++;
  render({ focus: true, scroll: true });
  if (completed[os].size === 5) notify('5 个步骤全部完成，开始你的第一个任务吧。');
});

document.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-copy]');
  if (button) {
    const source = document.getElementById(button.dataset.copy);
    try {
      await navigator.clipboard.writeText(source.textContent);
      button.dataset.copied = 'true';
      button.querySelector('span').textContent = '已复制';
      notify('已复制，请到终端或 Codex 中粘贴。');
      setTimeout(() => { button.dataset.copied = 'false'; button.querySelector('span').textContent = '复制'; }, 1800);
    } catch {
      const range = document.createRange(); range.selectNodeContents(source);
      const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
      source.parentElement.focus();
      notify('浏览器不允许复制，已选中文字，请手动复制。');
    }
  }
  if (event.target.closest('#copy-key') && privateKey) {
    try { await navigator.clipboard.writeText(privateKey); notify('密钥已复制，请粘贴到终端的隐藏输入提示处。'); }
    catch { notify('浏览器不允许复制，请点「显示」后手动选择复制。'); }
  }
  if (event.target.closest('#reveal-key') && privateKey) {
    const value = $('#key-value');
    value.hidden = !value.hidden;
    value.textContent = value.hidden ? '' : privateKey;
    $('#reveal-key').textContent = value.hidden ? '显示' : '隐藏';
    $('#reveal-key').setAttribute('aria-expanded', String(!value.hidden));
  }
});
window.addEventListener('pagehide', () => { privateKey = ''; secretRequest++; const value = $('#key-value'); if (value) { value.textContent = ''; value.hidden = true; } });
window.addEventListener('pageshow', (event) => { if (event.persisted && step === 2) render(); });
render();
renderFaq();
