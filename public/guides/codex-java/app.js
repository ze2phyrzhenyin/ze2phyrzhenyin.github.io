import { commands, repairPrompt, quickPrompts } from './content.js';

const $ = selector => document.querySelector(selector);
const escape = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const copyIcon = '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2"/><path d="M12 7V3H3v9h4"/></svg>';
let blockId = 0;
let privateKey = '';
let secretRequest = 0;
let toastTimer;
function code(text, title, prompt = false) {
  const id = `command-${++blockId}`;
  return `<div class="code-block${prompt ? ' prompt' : ''}"><div class="code-top"><span>${escape(title)}</span><button type="button" class="copy" data-copy="${id}" aria-label="复制${escape(title)}">${copyIcon}<span>复制</span></button></div><pre tabindex="0" aria-label="${escape(title)}"><code id="${id}">${escape(text)}</code></pre></div>`;
}
const link = (url, text) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
const section = (n, title, body) => `<section class="step" id="step-${n}" aria-labelledby="title-${n}"><h2 id="title-${n}">${n}. ${title}</h2>${body}</section>`;

function render() {
  privateKey = '';
  secretRequest++;
  blockId = 0;
  const c = commands;
  $('#steps').innerHTML = [
    section(1, '打开终端', `
      <p>按 Windows 键，搜索 <strong>PowerShell</strong> 并打开。</p>
      <p>点击「复制」，回到终端按 <strong>Ctrl + V</strong> 粘贴，再按回车。先运行下面两行：</p>
      ${code(c.check, '检查 Node.js 和 npm')}
      <p class="result">两行都出现版本号，就可以继续。</p>
      <p class="note">提示找不到命令？去 ${link('https://nodejs.org/en/download', 'Node.js 官网')}下载 <strong>LTS</strong> 版本，选择 Windows Installer（.msi），按默认选项安装。安装后重新打开终端，再试一次。</p>`),
    section(2, '安装 Codex', `
      <p>运行安装命令，等它结束：</p>
      ${code(c.install, '安装')}
      <p>再查看版本：</p>
      ${code(c.version, '查看版本')}
      <p class="result">出现 <code>codex-cli</code> 和版本号，说明安装成功。</p>
      <p class="note">命令中的 <code>.cmd</code> 可以避开 PowerShell 脚本限制，不用修改系统设置。</p>`),
    section(3, '登录', `
      <p>把下面<strong>整段命令</strong>复制到 PowerShell，按回车。若提示多行粘贴，选择「仍然粘贴」。</p>
      ${code(c.login, '等待输入密钥')}
      <p>看到 <code>Paste API Key, then press Enter</code> 后，点击下面的「复制密钥」，粘贴到终端，再按回车。</p>
      <div class="key-card"><div class="key-info"><strong>API Key</strong><span id="key-status">正在读取…</span></div><div class="key-actions"><button type="button" id="copy-key" disabled>复制密钥</button><button type="button" id="reveal-key" disabled aria-expanded="false">显示</button></div><code id="key-value" hidden></code></div>
      <p class="note">粘贴密钥时只显示星号是正常的。</p>
      <p>检查登录结果：</p>
      ${code(c.status, '查看登录状态')}
      <p class="result">显示 <code>API key</code>，说明已登录。费用由管理员承担，与 ChatGPT 订阅分开。</p>
      <details><summary>使用自己的项目密钥</summary><p>接受管理员的项目邀请，在 ${link('https://platform.openai.com/api-keys', 'API Keys')} 切换到该项目，创建自己的密钥。重新运行上面的登录命令，在终端粘贴新密钥。</p></details>`),
    section(4, '打开 Java 项目', `
      <p>先复制一份项目作为备份；会用 Git 的话，先提交当前改动。</p>
      <p>在文件资源管理器中打开项目，点击顶部地址栏复制路径。把下面引号里的内容换成你的路径，保留引号：</p>
      ${code(c.path, '进入项目文件夹')}
      <p class="note">选包含 <code>pom.xml</code>、<code>build.gradle</code> 或 <code>src</code> 的文件夹。</p>
      <p>检查电脑是否有 Java：</p>
      ${code(c.java, '查看 Java 版本')}
      <p class="note">运行测试需要项目对应版本的 JDK，可能还需要 Maven 或 Gradle。不确定装哪个版本，可以先让 Codex 看项目配置。</p>
      <p>启动 Codex：</p>
      ${code(c.start, 'GPT-6-Astra · xhigh')}
      <p class="result">进入对话界面后，Codex 就可以读取这个项目。首次询问是否信任文件夹时，确认路径是自己的项目，其他权限保留默认设置。</p>`),
    section(5, '把问题发给 Codex', `
      <p>复制下面这段话，粘贴到 <strong>Codex 对话框</strong>。把方括号里的内容换成你的问题，再发送。</p>
      ${code(repairPrompt, 'Java 项目诊断与修复', true)}
      <p class="note">尽量附上完整报错、预期结果或截图。改完后查看文件改动和测试结果；还有报错，就继续发在同一段对话里。</p>
      <details><summary>其他常用问法</summary>${quickPrompts.map(p => code(p.text, p.title, true)).join('')}</details>
      <p>下次使用时，从第 4 步进入项目并启动即可。</p>`),
  ].join('');
  const faq = [
    ['找不到 codex 命令？', `<p>关闭终端重新打开，再试第 2 步。Windows 用 <code>codex.cmd</code>；仍不行，可以在项目目录运行：</p>${code(c.fallback, '临时启动 Codex')}<p>这条命令会下载并运行 Codex。若它也失败，把报错发给管理员。</p>`],
    ['API Key 登录失败？', '<p>按第 3 步重新登录，确认复制的是完整密钥，不是网页访问码。仍报错时，把报错文字发给管理员检查密钥、模型权限和网络；不要发送密钥。</p>'],
    ['额度不足，或密钥过期？', '<p>联系管理员检查余额、项目额度或更换密钥，无需自己充值。换好后，按第 3 步重新登录。</p>'],
    ['代码改错了，怎么恢复？', '<p>先按 Ctrl + C 停止任务。在编辑器的 Git 记录中查看并撤销这次错误修改，保留原有改动；没有 Git 就从备份恢复对应文件。</p>'],
    ['怎么退出？', `<p>在 Codex 对话中输入：</p>${code(c.exit, '退出 Codex')}<p>要清除电脑上保存的 API 登录，退出后在终端运行：</p>${code(c.logout, '退出 API 登录')}<p>网页右上角的「退出」只退出本页。</p>`],
  ];
  $('#faq-items').innerHTML = faq.map(([q,a]) => `<details><summary>${q}</summary><div>${a}</div></details>`).join('');
  void loadSecret();
}

function notify(text) {
  clearTimeout(toastTimer);
  $('#toast').textContent = text;
  $('#toast').classList.add('visible');
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 2400);
}
async function loadSecret() {
  const request = ++secretRequest;
  privateKey = '';
  try {
    const response = await fetch('./access-key', { cache: 'no-store', credentials: 'same-origin', redirect: 'error' });
    if (!response.ok) throw new Error('unavailable');
    const data = await response.json();
    if (typeof data.key !== 'string' || !/^sk-[A-Za-z0-9_-]{20,}$/.test(data.key)) throw new Error('invalid');
    if (request !== secretRequest) return;
    if (data.expiresAt && (!Number.isFinite(Date.parse(data.expiresAt)) || Date.now() >= Date.parse(data.expiresAt))) {
      $('#key-status').textContent = '密钥已到期，请联系管理员更换。';
      return;
    }
    privateKey = data.key;
    $('#key-status').textContent = data.expiresAt ? `有效期至 ${data.expiresAt.slice(0, 10)}` : '请勿转发';
    $('#copy-key').disabled = false;
    $('#reveal-key').disabled = false;
  } catch {
    if (request !== secretRequest) return;
    $('#key-status').textContent = '密钥暂不可用，请重新进入页面或联系管理员。';
  }
}
document.addEventListener('click', async event => {
  const button = event.target.closest('[data-copy]');
  if (button) {
    const source = document.getElementById(button.dataset.copy);
    try {
      await navigator.clipboard.writeText(source.textContent);
      button.querySelector('span').textContent = '已复制';
      notify('已复制');
      setTimeout(() => { button.querySelector('span').textContent = '复制'; }, 1800);
    } catch {
      const range = document.createRange(); range.selectNodeContents(source);
      const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
      source.parentElement.focus();
      notify('已选中文字，请手动复制。');
    }
  }
  if (event.target.closest('#copy-key') && privateKey) {
    try { await navigator.clipboard.writeText(privateKey); notify('密钥已复制，回到终端粘贴。'); }
    catch { notify('请点「显示」，手动选择并复制密钥。'); }
  }
  if (event.target.closest('#reveal-key') && privateKey) {
    const value = $('#key-value');
    value.hidden = !value.hidden;
    value.textContent = value.hidden ? '' : privateKey;
    $('#reveal-key').textContent = value.hidden ? '显示' : '隐藏';
    $('#reveal-key').setAttribute('aria-expanded', String(!value.hidden));
  }
});
window.addEventListener('pagehide', () => {
  privateKey = ''; secretRequest++;
  $('#key-value').textContent = ''; $('#key-value').hidden = true;
  $('#copy-key').disabled = true; $('#reveal-key').disabled = true;
});
window.addEventListener('pageshow', event => { if (event.persisted) render(); });
render();
