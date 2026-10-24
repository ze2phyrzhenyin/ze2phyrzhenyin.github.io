// Commands are run by the reader in PowerShell. No credential belongs in this file.
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

export const commands = {
  check: 'node --version\nnpm.cmd --version',
  install: 'npm.cmd install -g @openai/codex@latest',
  version: 'codex.cmd --version',
  login: windowsLogin,
  status: 'codex.cmd login status',
  path: 'cd "C:\\Users\\你的用户名\\Documents\\my-java-project"',
  java: 'java -version',
  start: 'codex.cmd -m gpt-6-astra -c model_reasoning_effort=xhigh',
  logout: 'codex.cmd logout',
  exit: '/quit',
  fallback: 'npm.cmd exec --package=@openai/codex@latest -- codex -m gpt-6-astra -c model_reasoning_effort=xhigh',
};

export const repairPrompt = `请先阅读项目，确认 Java 版本、构建工具和主要模块。

问题：【填写报错或需求】

先说明原因、涉及文件和最小修改方案，再修改。不要重构无关代码、删除重要文件、修改数据库或执行高风险操作。需要确认时先问我。

完成后运行项目已有测试，说明问题原因、修改文件、测试结果和未解决的问题。`;

export const quickPrompts = [
  { title: '看懂代码', text: '请解释下面这段 Java 代码做了什么，举个简单例子。先不要修改。\n\n【粘贴代码或文件路径】' },
  { title: '解决编译错误', text: '请结合项目的 Java 版本和构建工具分析以下编译错误，指出原因和相关文件，给出最小修改方案，确认后再改。\n\n【粘贴完整报错】' },
  { title: '检查改动', text: '请检查这次修改会影响哪些功能，并运行项目已有测试。不要连接生产数据库或执行高风险操作。测试跑不了时，说明原因和需要人工检查的地方。' },
];
