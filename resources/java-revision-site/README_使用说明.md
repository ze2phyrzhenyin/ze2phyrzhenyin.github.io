# Java 中法复习网站

仓库部署版本：https://zhaoyang.fr/guides/java/ 。中、英、法 Guides 目录均有入口；正文保持中法对照。源码与原始示例保存在本目录，发布文件位于 `public/guides/java/index.html`。

在网站仓库根目录重新生成：

```sh
python3 resources/java-revision-site/source/build.py
```

手机布局、触控导航及线上存储验证见仓库的 `scripts/tests/java-guide.mjs` 与 `docs/java-revision-guide.md`；本目录 `tests` 中保留的是导入前的原始验证报告。

适用：M1 MIAGE · Conception et programmation orientée objet。固定基线：Java 21，不使用预览特性。整理日期：2026-10-07。

## 直接使用

解压完整包，双击 `index.html`，用浏览器打开即可。也可以直接使用单独提供的 HTML 文件，它已经内嵌全部内容、样式和交互代码。

不需要安装 Node.js、npm、Java 或启动服务器来阅读网站。正文、题库、词汇卡和查找功能可离线使用；Java 官方文档的外部链接需要联网。HTML 文件必须在浏览器中打开并允许 JavaScript，不能只在压缩包预览器、聊天附件预览器或文字编辑器里查看。

网站以自包含 HTML 发布，也可以另存 `public/guides/java/index.html` 后离线阅读。返回 Guides 和外部官方文档链接需要在线访问。

## 内容与功能

- 11 个知识章节、82 个专题：语言与类型、控制结构、数组和字符串、方法、封装与相等性、泛型、继承与多态、集合、Lambda、Stream、异常和考试方法。
- 30 个算法与模型实现：完全数、工资 switch、字符串遍历、随机数组、求和、Fibonacci、回文、递归有序性和最大值、四种排序、泛型链表、学生类、多项式等；PGCD、Luhn、BFS、二分等标为扩展。
- 139 条标准库/API 速查：所属类型、常用签名、中文用途、Java 示例、返回值/副作用提醒和官方文档。
- 194 条法语词汇：名词、题目动词、量词、边界与逻辑限定，支持中法双向翻卡和已记住标记。
- 122 道自编练习：90 道选择与代码判断、20 道填空、12 道手写；每题有关联知识点。多选必须完全匹配，填空忽略空格、区分大小写。手写题仅保存草稿、提供参考实现和自查，不运行在线 Java 编译器。
- 20 题、30 分钟模拟练习：计时、交卷评分、解析、错题与历史结果。刷新不能重新计时。
- 18 条课件勘误与语法精度修正；逐文件、逐页段的覆盖索引。
- 全站中文/法语/代码名搜索、章节导航、收藏、掌握状态、笔记、错题本、考前清单、字号切换、明暗主题、移动端布局、打印本页及完整资料。

首页各统计来自数据实际条目，不把 API 的每个重载重复计数为独立题目。

## 学习记录与备份

记录使用浏览器 `localStorage`，没有账户和云同步，不向任何服务器上传。不同浏览器、隐私模式、本地文件路径以及清理浏览数据，可能影响保存或使记录丢失。

在“我的学习记录”中点击“导出全部学习记录”，得到 JSON 备份。换设备后打开相同网站，用“导入记录”恢复。导入会替换当前记录，需要确认。笔记、草稿和结果属于明文 JSON，备份中不要放密码或其他敏感凭据。

若出现浏览器不允许持久化的提示，本次会话仍可继续使用，但关闭前应导出。移动或重命名 HTML 文件前也建议先导出。

快捷键：`Ctrl+K` / `⌘K` 或 `/` 打开全站搜索；`Esc` 关闭。翻卡时空格显示答案、左右方向键切换卡片。

## 编译完整 Java 示例

阅读网站无需 Java；运行示例才需要 JDK 21。

进入 `examples` 目录执行：

```sh
javac -encoding UTF-8 --release 21 -Xlint:all RevisionAlgorithms.java Modeles.java TestRevision.java
java TestRevision
```

也可使用：

```sh
javac -encoding UTF-8 *.java
java TestRevision
```

`RevisionAlgorithms.java` 提供算法静态方法，`Modeles.java` 提供完整模型（采用嵌套类型，以便放在一个文件里），`TestRevision.java` 是无需第三方依赖的测试入口。例如实例化学生用 `new Modeles.Etudiant(...)`。

测试中排序耗时每次不同，只是演示测量，不是严谨的生产性能基准。运行输出中的检查计数不等于独立测试用例个数，其中包含参数遍历、随机数组与性质检查。

网站“知识手册”和题库的代码可能是方法体片段、类体片段、带省略标记的教学片段，或故意不能编译的反例；不能把这些片段不分上下文全部拼接编译。能够独立组合编译的是 examples 中的完整文件。大规模递归可能耗尽调用栈；需要遵守每个算法的输入契约。

## 原始资料与覆盖边界

主线是用户提供的七份课程文件：

1. 0 - Cours 2026.docx
2. 1 - Les concepts de base de la programmation objet.docx
3. 2 - La généricité.docx
4. 3 - L’héritage.docx
5. 4 - Les lambdas expressions.docx
6. 5 - Les Streams.docx
7. Cours_POO_intro.pdf

网站“资料覆盖与来源”提供文件名、页段映射及官方核对链接。原始文件不在下载包中再分发。能够读取的七份文档全文作为主线；部分图示未取得图片，不凭空补写未见图示。此前未取得全文的零散对话、未提供的TP原题，不宣称逐字覆盖。

“课件核心”表示该主题直接出现在课件中；主题中的精确边界解释可能来自Java21规范。“扩展补充”用于算法练习和必要背景。优先级、练习与模拟卷不是教师对实际考试题型占比或考查范围的承诺。这份资料覆盖当前给定课程主线，不声称穷尽整个JDK或Java生态。

## 编辑与重新生成

源码位于 `source`：

- `data.json`：全部课程内容、题库、术语、来源、算法摘录和可下载文件内容。
- `app.js`：导航、检索、练习评分、存储、导入导出和打印。
- `styles.css`：响应式布局和主题。
- `template.html`：单页骨架。
- `build.py`：仅依赖Python标准库的构建脚本。

修改后执行：

```sh
python3 resources/java-revision-site/source/build.py
```

请从网站仓库根目录执行，输出为 `public/guides/java/index.html`。直接修改 examples 中的Java文件不会自动修改data.json里的算法摘录和内嵌下载内容；同步这两处后再构建。构建脚本只组合数据、样式与脚本，不使用网络。

## 验证说明

完整Java源文件使用OpenJDK 21.0.11编译，`-Xlint:all`无诊断，并通过5,208项运行检查。原始输出在 `tests/TEST_REPORT.txt`。

浏览器页面经过Chromium渲染与交互检查，包括移动端和桌面布局、检索、客观题、手写自查、模拟、记录导出等。检查环境的浏览器管理策略阻止所有URL导航，因此使用直接注入HTML的渲染方式；存储重建测试使用显式Storage适配器，不能视为所有真实浏览器/本地文件路径的兼容性认证。测试边界详见 `tests/WEB_QA_REPORT.md`。

代码测试和界面测试均不是形式化证明，也不保证所有可能输入已穷举。
