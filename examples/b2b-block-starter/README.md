# B2B 原生区块新站样板

本项目将对照实验整理为可独立安装的主题、业务插件和受控演示数据。尚未作为完整商业网站发布。统一架构见 [目标架构](../../docs/TARGET-ARCHITECTURE.md)。

## 代表页面与内容约定

| 页面 | 买家任务 | 实现与编辑方式 |
| --- | --- | --- |
| 首页 | 找到设备范围与选型入口 | 原生正文区块 + 产品 Query Loop + 分类动态块；后台编辑正文和主图 |
| 产品分类 | 对比同类产品与适用条件 | 原生 taxonomy 归档、继承查询、分页；分类编辑页选择 Catalogue / Introduction first |
| 产品标准版 | 快速看型号、规格、图片、询盘 | product-standard 原生自定义模板；同一 CPT/ACF 数据 |
| 产品叙事版 | 先理解应用，再读技术信息 | product-editorial 模板；不复制数据或改变 URL |
| 选型引导章节 | 组织客户询盘信息 | 可插入 selection-guide Pattern；内容按项目核实 |

图片沿用有来源记录的示例媒体，许可见 content/media-manifest.json；不是该品牌实拍。机器参数与第二环境的泵参数都为 mock，预览 noindex。真实案例、认证与供应商承诺必须另有证据。

Pattern 设计：帮助采购描述工况；克制的技术语气；浅底纵向章节；大标题、正文、次级标题；沿用 theme.json 的 mist 与间距/字号 token。它是插入起点，已插入内容不会随 Pattern 文件自动更新。

## 独立安装与本地验收

需要 Docker、Node.js 22+；启动脚本使用本机缓存插件（可用 WP_TEST_PLUGINS_PATH 指定），无缓存时通过 WP-CLI 安装指定插件版本并记录实测版本。正式复用应锁定验收过的镜像和插件版本；本脚本不是生产部署工具。

从仓库根执行：

```sh
node examples/b2b-block-starter/scripts/start.mjs
node examples/b2b-block-starter/scripts/check.mjs
```

启动为两个全新独立 WordPress/MySQL，未复制旧数据库。主环境使用设备样板，复用环境用少量泵数据检查相同模型与模板的复用；它不证明已经完成泵行业全部内容与设计。端口为 9490、9491、9492，冲突时保留现有运行，不自行清理他人环境。

theme/ 可打包为 b2b-equipment 主题，plugin/ 为 site-model 插件。ACF、Rank Math SEO 免费版、Fluent Forms 单独安装；content/seed.php 只由受保护的本地实验运行，不进入客户主题/插件包。客户项目按自己的资料建立内容，不直接导入本示例数据库。

后台产品菜单 Equipment 中填写原生标题、正文、主图及 ACF 参数，选择 Product — Standard / Editorial 模板。Equipment families 编辑分类描述及布局。样板不保证 ACF 免费版具备编辑器绑定值双向写回；ACF 后台字段编辑与服务端回显分别验收。

新版证据见 [设计与转化验收](../../docs/acceptance/b2b-redesign/README.md)；[此前技术基线](../../docs/acceptance/b2b-block-starter/README.md) 保留作为历史记录。

## 复验命令补充

在仓库根按顺序运行 `node examples/b2b-block-starter/scripts/sync.mjs`（同步源码不重置数据）、`check.mjs`、`browser.mjs`、`screens.mjs`、`seo.mjs`、`inquiry.mjs`；后五个短名称均位于同一 scripts 目录。浏览器脚本通过 Playwright CLI 打开 b2b-starter 会话并使用本项目私有本地凭据登录。也可用 `npm run starter:start`、`npm run starter:sync`、`npm run test:starter`；总回归需要环境已启动且 Skill 资产已由 `npm run build` 更新。

Settings → B2B destinations 管理询盘等页面 ID。Rank Math Free 统一负责 SEO 输出及 sitemap；启用产品、行业与分类 sitemap，关闭作者 sitemap。当前项目只支持这一种 SEO 插件，不导入旧 SEO 数据，也不保留旧插件适配。源码包由根目录 `npm run build` 生成，manifest 校验源码/分发副本；不在生成目录里直接改代码。

## Equipment Studio 设计与转化

完整页面规划、字体与颜色、参考资料见 [DESIGN.md](DESIGN.md)。主站为 9490；9491 仅为模型复用夹具，不是第二个完成设计的网站。

- 首页、About：正文由原生区块组成，可在页面编辑器修改。产品、分类、应用、文章分别采用适合自己的模板；应用目录与采购指南不复用产品照片卡片。
- 导航：原生 Navigation 区块，Products 下含全部设备与五类设备；另有 Applications、Buying guides、About、Contact。手机使用核心导航弹层。
- 询盘：首页/About/应用详情/联系页可内嵌同一个 Fluent Forms 表单；导航、产品与 CTA 打开当前页 dialog。每页仅渲染一个初始化表单节点，移动节点而非克隆；保留输入、支持 Escape/关闭按钮、恢复焦点。产品 CTA 传隐藏产品 ID，服务端验证；禁用 JavaScript 时链接仍到联系页。
- 首次干净启动已接入新版内容初始化。已有本地演示如需**重新应用演示正文**，执行 `npm run starter:design`；它先生成原生模板、打包和同步，再备份主站数据库并重写明确的演示内容。不要用来保存客户编辑或仅同步 CSS。常规源码迭代用 `npm run build && npm run starter:sync`。
- 回归依次运行 `npm run test:starter`、`npm run test:starter:design`（含首页/弹窗提交）、`node examples/b2b-block-starter/scripts/routes.mjs`。后台写入测试与截图测试不能并行，避免把临时验证文字拍进交付截图。

演示图片有许可来源，但存在重复和其他厂商标识，不能作为 HONGDA 实拍或真实型号图片发布。当前完成的是新的设计实现与本地转化链，视觉偏好仍由用户审阅；不得用“没有溢出”代替视觉认可。

Rank Math Free 当前验收版本为 1.0.278。新站初始化采用“跳过账户连接”，启用 Sitemap、Schema、ACF、Redirections 与 404 Monitor；未启用 Analytics、Content AI、Instant Indexing 等模块，不需要 Pro。产品/行业/普通页面不自动套 Article 或带虚构报价的 Product Schema。验收见 [Rank Math Free](../../docs/acceptance/rankmath-free/README.md)。

## 插件初始化基线

[插件清单](../../config/wordpress-plugins.json) 统一管理 ACF Free、Fluent Forms Free、Rank Math Free 和项目业务插件。start.mjs 从清单安装并验证全部版本后激活，记录安装回执，再创建本项目表单与 SEO 配置。ACF 新下载使用厂商官方固定版本地址。

`npm run test:starter:plugins` 是现有主站/复用环境的只读清单与配置检查。详细的配置责任和正式发布所需邮件、防垃圾、备份/恢复、性能条件见 [插件规范](../../.agents/skills/wordpress-builder/references/plugins.md)。这些环境能力并不等于必须再装一组插件。

## 完整发布包与干净安装

从仓库根运行 `npm run test:starter:release`。需要现有 9490 样板正常运行、Docker 和 Playwright CLI。它只读取原预览站，在唯一 `.lab/b2b-release-*` 私有目录和独立 Docker 项目中完成快照清理、打包、解包核验、空数据库安装、字段/模板/询盘验证及 MySQL 恢复；端口由 Docker 动态分配并只绑定 loopback，结束后停止本次容器，保留数据供调查。

包中包括主题、四项插件、插件清单、经过限定清理的 SQL 和图片；不包括源站账号/应用密码、询盘、邮件捕获 MU 插件、wp-config 或 seed。只读工具挂载用于执行验收，主题/插件/媒体来自归档复制，运行目录不挂源码。归档里的通知默认关闭，新管理员和邮件设置由目标环境建立；本地验收额外配置 Mailpit，不属于发布包。

私有运行目录的 manifest.json 记录全部文件哈希，site.tar.gz 是完整参考包；`.lab/b2b-release-latest.json` 只在全程通过后更新。公开证据位于 docs/acceptance/b2b-release 的独立 run 目录。第三方依赖中明确识别的开发元数据会被排除，安装哈希对应本次归档，不冒充原厂 ZIP 校验。脚本仅支持当前 mock 样板的首次安装；不是任意客户数据脱敏器，不自动部署 Hostinger，也不用于覆盖已有线上站。
