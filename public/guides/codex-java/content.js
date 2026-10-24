export const systems = {
  windows: { name: 'Windows', terminal: 'PowerShell', open: '按 Windows 键，搜索 PowerShell，然后打开。无需以管理员身份运行。', paste: 'Ctrl + V', npm: 'npm.cmd', codex: 'codex.cmd', path: 'C:\\Users\\你的用户名\\Documents\\my-java-project' },
  macos: { name: 'macOS', terminal: 'Terminal', open: '按 ⌘ + 空格，搜索「终端」或 Terminal，然后按回车打开。', paste: '⌘ + V', npm: 'npm', codex: 'codex', path: '/Users/你的用户名/Documents/my-java-project' },
  linux: { name: 'Linux', terminal: '终端', open: '在应用菜单中搜索「终端」并打开。Ubuntu 也可以按 Ctrl + Alt + T。', paste: 'Ctrl + Shift + V', npm: 'npm', codex: 'codex', path: '/home/你的用户名/projects/my-java-project' },
};

// No credential is embedded or collected. These are instructions to run locally.
export const unixLogin = `bash -c '
  set +x
  IFS= read -r -s -p "Paste API Key, then press Enter: " codex_key </dev/tty || exit 1
  printf "\\n" >/dev/tty
  [ -n "$codex_key" ] || { printf "No key entered.\\n" >&2; exit 1; }
  printf "%s" "$codex_key" | codex login --with-api-key
  codex_result=$?
  unset codex_key
  exit "$codex_result"
'`;

export const windowsLogin = `& {
  $codexSecret = Read-Host "Paste API Key, then press Enter" -AsSecureString
  try {
    if ($codexSecret.Length -eq 0) { throw "No key entered." }
    ([System.Net.NetworkCredential]::new("", $codexSecret)).Password |
      codex.cmd login --with-api-key
  } finally {
    $codexSecret.Dispose()
  }
}`;

export const repairPrompt = `你现在正在我的 Java 项目目录中工作。请先阅读项目结构，识别 Java 版本、构建工具及主要模块。

我目前遇到的问题是：

【在这里描述你的报错或需要实现的功能】

请先分析问题原因，指出涉及的文件，并提出尽量小的修改方案。

不要随意重构无关代码，不要删除重要文件，也不要修改数据库或执行高风险操作。

在需要我确认时先询问。完成代码修改后，使用项目已有的 Maven、Gradle 或其他测试方式验证结果，并清楚告诉我：

1. 问题原因是什么；
2. 修改了哪些文件；
3. 进行了哪些测试；
4. 是否还有未解决的问题。`;

export const quickPrompts = [
  { title: '读懂一段代码', text: '请用适合 Java 初学者的语言解释下面这段代码：它做什么、输入和输出是什么，并用一个简单例子说明。先不要修改代码。\n\n【粘贴代码或填写文件路径】' },
  { title: '分析编译错误', text: '请结合项目使用的 Java 版本和构建工具，分析以下编译错误，指出最先需要修复的原因和相关文件，给出最小修改方案，确认后再修改。\n\n【粘贴完整编译报错】' },
  { title: '检查修改的影响', text: '请检查本次代码差异，说明它可能影响哪些功能，并使用项目已有的安全测试验证。不要连接生产数据库或执行高风险操作；测试无法运行时，说明原因和还需要人工验证的部分。' },
];

export function detectSystem(platform = '', agent = '') {
  if (/Android|iPhone|iPad|Mobile/i.test(agent)) return null;
  if (/win/i.test(platform)) return 'windows';
  if (/mac/i.test(platform)) return 'macos';
  if (/linux/i.test(platform)) return 'linux';
  return null;
}

export function commandsFor(os) {
  const s = systems[os];
  return {
    node: 'node --version', npm: `${s.npm} --version`,
    install: `${s.npm} install -g @openai/codex@latest`,
    version: `${s.codex} --version`, login: os === 'windows' ? windowsLogin : unixLogin,
    status: `${s.codex} login status`, path: `cd "${s.path}"`,
    start: `${s.codex} -m gpt-6-astra -c model_reasoning_effort=xhigh`, java: 'java -version', logout: `${s.codex} logout`, exit: '/quit',
    fallback: `${s.npm} exec --package=@openai/codex@latest -- codex -m gpt-6-astra -c model_reasoning_effort=xhigh`,
    prefix: `${s.npm} prefix -g`,
  };
}
