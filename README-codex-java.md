# Codex CLI · Java 入门教程

独立中文教程：`public/guides/codex-java/`，沿用现有 Astro 的 public 静态文件流程。无 React 运行时、无数据库、无账户系统、无外部字体或追踪脚本。默认启动 GPT-6-Astra / xhigh。

用户后续明确要求「包含真实密钥，必须有访问码」。因此生产版由现有 Nginx HTTP Basic Auth 保护整个路径（用户名 `friend`，密码为独立访问码），通过同源受保护的 `access-key` 端点提供密钥。不能用前端密码遮罩保护真实密钥。

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
python3 tests/codex-java/auth-stdin.py
```

本地预览没有真实密钥端点，显示「专用密钥暂不可用」。自动化测试拦截该端点并使用明确的假凭据，不连接 OpenAI，也不把真实密钥写入截图、测试报告或日志。生产密钥只在用户点击第 3 步时加载到页面内存，不写入 LocalStorage、SessionStorage 或 Cookie。

## 生产发布

此页属于 `/guides/`，按仓库规则只发布到 `zhaoyang.fr`，不发布到 `zhauyoung.com`。

1. 首次上线前，先安装 `ops/codex-java/` 的访问保护，确认未登录请求 HTML、JS、CSS 和 `access-key` 均返回 401。
2. 私密 JSON 输入包含 `key`、`expiresAt`、`username` 和 `accessCode`。仅通过 SSH stdin 传给 `ops/codex-java/install.py`，不使用命令行参数；脚本写入私有目录、验证 Nginx 配置后仅 reload。
3. 提交并 push GitHub，使用维护项目的发布入口：

```sh
cd /home/zhao/Developer/server-ops
dev-run ./serverctl deploy --yes rex-ovh siteweb-rex -- --project-dir /home/zhao/Developer/siteweb
```

4. 验证无认证和错误认证 401；正确认证页面及所有资源 200，密钥响应 `Cache-Control: private, no-store`；确认普通官网首页仍为 200。

密钥实际位置：`/var/lib/siteweb-private/codex-java/key.json`，root:www-data / 0640，父目录 0750。访问码仅以 salted SHA-512 crypt 哈希存放于 `/etc/nginx/private/codex-java.htpasswd`。Mac 管理端凭据为 `~/.local/share/credentials/siteweb/codex-java.json` / 0600；不要复制进仓库。Nginx 仅对这个 HTTPS 路径开启访问认证；密钥端点不记录访问日志。整个路径禁用缓存、索引和嵌入。

轮换时用新凭据重新运行安装器，更新到期时间；访问码和 API Key 是两个不同的凭据。退出网页：关闭隐私窗口以清除浏览器认证；`codex logout` 仅清除本机 CLI 登录，不撤销平台密钥。获准访问的人仍能复制密钥，因此访问码只应私下给受邀朋友。

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
