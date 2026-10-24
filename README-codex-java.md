# Codex CLI · Java 入门教程

Windows 单页中文教程，五步从上到下完整展开，无 Stepper 或系统切换。支持亮暗主题：`public/guides/codex-java/`，沿用现有 Astro 的 public 静态文件流程。无 React 运行时、无数据库、无账户系统、无外部字体或追踪脚本。默认启动 GPT-6-Astra / xhigh。

生产版使用简单的访问码输入页面，支持亮暗主题，只需输入访问码，不需要用户名，也不会调用浏览器的系统认证弹窗。一个独立 Node.js 服务通过服务器端校验访问码，Nginx 用 auth_request 保护教程及密钥端点；没有数据库或用户账户。

## 本地启动与构建

在 `zhao-zenbook` 的 `/home/zhao/Developer/siteweb`：

```sh
# 若当前 SSH 非交互会话找不到 node/npm，先加入已安装的 Node 路径
export PATH=/home/zhao/.nvm/versions/node/v24.21.0/bin:$PATH
dev-run npm run dev -- --host 127.0.0.1 --port 44327
```

Astro 开发模式访问 `http://127.0.0.1:44327/guides/codex-java/index.html`（public 目录的 HTML 需显式文件名）。在 Mac 上通过 `ssh -N -L 127.0.0.1:44327:127.0.0.1:44327 zhao-zenbook` 转发即可。也可 `python3 -m http.server 4321 --bind 127.0.0.1 --directory public`，访问 `/guides/codex-java/`。

```sh
dev-run npm run build
dev-run npm ci --prefix tests/codex-java
# 安装缺失的测试浏览器（已有时跳过）
dev-run npx --prefix tests/codex-java playwright install chromium webkit
TUTORIAL_URL=http://127.0.0.1:44327/guides/codex-java/index.html dev-run node tests/codex-java/verify.mjs
dev-run node --test tests/codex-java/access.test.mjs
```

本地预览没有真实密钥端点，显示「密钥暂不可用」。自动化测试拦截该端点并使用明确的假凭据，不连接 OpenAI，也不把真实密钥写入截图、测试报告或日志。生产密钥在已认证的教程页面加载时读取到页面内存，不写入 LocalStorage、SessionStorage 或 Cookie。LocalStorage 仅记录 `codex-java-theme` 的 light / dark 偏好。

## 生产发布

此页属于 `/guides/`，按仓库规则只发布到 `zhaoyang.fr`，不发布到 `zhauyoung.com`。

1. 首次上线前，先安装 `ops/codex-java/` 的访问保护。未登录读取教程会转到自定义访问码页；密钥端点必须返回 401。
2. 私密 JSON 输入包含 `key`、`expiresAt` 和 `accessCode`。仅通过 SSH stdin 传给 `ops/codex-java/install.py`，不使用命令行参数；脚本安装专用于本页的访问验证服务，经健康检查后验证并 reload Nginx。既有页面访问码沿用不变。
3. 提交并 push GitHub，使用维护项目的发布入口：

```sh
cd /home/zhao/Developer/server-ops
dev-run ./serverctl deploy --yes rex-ovh siteweb-rex -- --project-dir /home/zhao/Developer/siteweb
```

4. 验证无会话访问页面转到 `/signin`，无会话访问密钥 401；错误访问码显示行内提示，正确访问码进入教程，真实密钥复制成功；退出后密钥重新变为 401。所有私密响应必须 `no-store`，普通官网首页仍为 200。

密钥实际位置：`/var/lib/siteweb-private/codex-java/key.json`，root:www-data / 0640，父目录 0750。访问码仅以 scrypt 哈希保存在 `/etc/siteweb-codex-java/auth.json`（root / 0600），同文件含服务器签名密钥。API Key 不传给访问验证服务。Mac 管理端凭据为 `~/.local/share/credentials/siteweb/codex-java.json` / 0600；不要复制进仓库。Nginx 仅保护这个 HTTPS 路径；密钥和登录端点不记录访问日志。整个路径禁用缓存、索引和嵌入。

`siteweb-codex-java-auth.service` 使用动态非特权用户和 Unix socket `/run/siteweb-codex-java-auth/auth.sock`，不监听公网端口；额度为 128 MB / CPU 20%。服务器验证正确后只设置签名会话 Cookie（HttpOnly、Secure、SameSite=Strict、路径限于此教程），不含访问码或 API Key，8 小时失效；不存在本地存储里的密钥。提供跨站提交拦截、重复错误尝试限流、签名/到期校验和退出功能。

轮换时用新凭据重新运行安装器。访问码不变会保留现有会话；更换访问码会作废旧会话；访问码和 API Key 是两个不同的凭据。退出网页：点击顶部「退出」清除会话；`codex logout` 仅清除本机 CLI 登录，不撤销平台密钥。获准访问的人仍能复制密钥，因此访问码只应私下给受邀朋友。

## Cloudflare Pages / Vercel

普通无密钥教程可以直接部署 `public/guides/codex-java`，或 `npm run build` 后部署 `dist`。Cloudflare Pages：构建 `npm run build`，输出 `dist`；Vercel：Astro 静态预设。

**当前包含密钥的版本不能仅上传静态文件来获得访问保护。** 迁移必须先配置服务端认证（例如 Cloudflare Access），并用受同一认证保护的 Worker / Function 从密钥管理中返回 `access-key`；真实密钥永远不能打入 HTML/JS 或构建包。没有该端点时页面会安全地显示密钥暂不可用，允许使用自己的项目密钥。

## 官方依据（2026-10-24 核对）

- CLI 安装：https://developers.openai.com/codex/cli/
- npm 最新版命令：https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex
- API Key stdin 登录、状态、凭据存储：https://developers.openai.com/codex/auth/
- CLI 参数：https://developers.openai.com/codex/cli/reference/
- 模型 / xhigh：https://developers.openai.com/api/docs/models/gpt-6-astra
- Windows：https://developers.openai.com/codex/windows/
- PowerShell 隐藏输入：https://learn.microsoft.com/powershell/module/microsoft.powershell.utility/read-host
- 强制消费上限与延迟：https://developers.openai.com/api/docs/guides/spend-limits

安装成功、登录信息存在与实际模型调用成功是三个不同结果。页面明确提示按输出确认，不冒充自动电脑检测，不承诺余额或模型权限永久有效。

## 文案和界面

入口只有访问码提示、输入框、显示按钮和进入按钮。教程使用短句说明操作及结果，核心步骤全部展开，补充说明和常见问题可折叠。写法参考廖雪峰的安装 Git 教程与网道 Bash 入门，只参考说明方式，不照搬命令或正文。

验证覆盖全部复制按钮、密钥失败及过期、两种主题持久化、320–1440 px 布局、Chromium / WebKit 和无障碍扫描。PowerShell 的隐藏输入曾在 PowerShell 7 中用假凭据验证；未在原生 Windows 桌面实机运行，不调用付费模型。
