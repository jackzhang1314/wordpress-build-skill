# Codex WordPress 新站编排

整套方案由项目 AGENTS.md、总编排 Skill、官方专业 Skills、按需规范、项目工具和验收证据共同组成。[仓库开发约定](AGENTS.md) 管理本方案开发；每个新客户站按 [项目指令规范](.agents/skills/wordpress-builder/references/project-instructions.md) 建立自己的 AGENTS.md，记录站点事实、代码归属、Skill 路由和实际验证命令。当前由 Codex 适配模板生成，`project-init` 尚未自动生成该文件。

从干净且可控制的 WordPress 环境建立企业/产品/询盘网站。总入口整合官方专业 Skill、项目内容工具和统一验证记录；ACF 为本方案要求。支持本方案创建站点的后续维护，**暂不接管旧主题、Elementor 或其他既有 builder**。

## 当前入口

新用户先读 [建站上手、页面维护与模板能力说明](docs/GETTING-STARTED.md)。其中区分现有 PHP 基线、区块实验已验证能力与完整骨架待办。

- [新站总编排 Skill](.agents/skills/wordpress-builder/SKILL.md)：任务范围、专业模块选择与交付。
- [搜索质量与内容规划](.agents/skills/wordpress-builder/references/search-quality.md)、[WordPress SEO 工程规范](.agents/skills/wordpress-builder/references/seo.md)：从需求到交付贯穿执行。
- [系统架构与实现边界](docs/ARCHITECTURE.md)：当前代码分工、实际接口、尚未实现能力。
- [统一架构决策与官方依据](docs/TARGET-ARCHITECTURE.md)：区块主题、ACF、原生模板与 PHP 模块共生；服务端 HTML 与 SEO 标准。
- [早期生态研究](docs/18-WordPress与Codex调研及架构重规划.md)：保留原研究阶段结论，当前决策以前项为准。
- [官方/开源研究库](research/wordpress-skills/README.md)：9 个固定版本来源；研究目录不自动启用。

## 新区块样板

[代表页项目](examples/b2b-block-starter/README.md) 已用独立数据库验证首页、分类和两套产品模板；[验收记录](docs/acceptance/b2b-block-starter/README.md) 说明覆盖范围。`npm run build` 将其主题/业务插件同步到 Skill 的 `assets/block-starter` 并生成哈希清单，独立分发时包含该资产目录。

## 使用

需要 Node.js 22+。安装仓库依赖后：

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
node .agents/skills/wordpress-builder/scripts/wp.mjs capabilities
```

build 打包内容工具并校验 10 个随包官方模块的完整性。分发时复制整个 `.agents/skills/wordpress-builder/`，包括 vendor、capabilities.json、references、scripts 和许可证，不仅复制 SKILL.md。

先准备新站项目文件（完整格式见 [执行接口](.agents/skills/wordpress-builder/references/runtime.md)），sourceRoot 指向新站源码目录：

```bash
node .agents/skills/wordpress-builder/scripts/wp.mjs project-init --plan project.json --task .wordpress-builder/new-site
node .agents/skills/wordpress-builder/scripts/wp.mjs project-inspect --task .wordpress-builder/new-site
node .agents/skills/wordpress-builder/scripts/wp.mjs project-status --task .wordpress-builder/new-site
```

project-inspect 实际运行官方项目识别；项目初始化只保存契约，**不会自动创建 WordPress 或安装主题/插件**。按总编排加载对应专业模块，在实际环境执行，再通过 project-record 保存带证据的阶段结果。

WordPress 内容工具另需环境变量 `WP_URL`、`WP_USERNAME`、`WP_APP_PASSWORD`，可选 `WP_REST_URL`。不要将凭据放进项目 JSON、Git 或公开证据。

```bash
node .agents/skills/wordpress-builder/scripts/wp.mjs doctor --task .wordpress-builder/new-site
```

`build` 是有限原生区块页面适配器；PHP 主题由专业工作流生成与部署。整站验收和发布规则见 [release.md](.agents/skills/wordpress-builder/references/release.md)。项目回执不替代实际发布操作，也不会自动验证外部工具完成的工作。

## 验证与边界

- `npm test`：内容工具、恢复语义、模块完整性和编排行为。
- `npm run test:new-site`：全新临时 WordPress 数据库、独立 PHP 主题和 ACF 模型集成；默认复用本机 `.lab` 中的 ACF 插件文件，可用 `WP_TEST_ACF_PATH` 指定。不复制演示站数据库，不向生产写入。
- `npm run reference:serve`：启动独立空白数据库的完整参考站，端口 9463；需本地 ACF、Fluent Forms、The SEO Framework，可用 `WP_TEST_PLUGINS_PATH` 指定插件根。
- `npm run test:reference`：在上述本地站实际验证 CLI 字段/图片更新、页面/分类/文章、分页、搜索和 404。会修改此测试站内容。
- `npm run test:theme`：历史 TerraLift 演示站隔离副本回归；依赖已有 `.lab`。
- `npm run lab`：历史持久化实验站，实际版本以运行证据为准，不等同于新站测试。

当前 PHP 基线的随包源码、适用条件与复现方法见 [参考站说明](.agents/skills/wordpress-builder/references/reference-site.md)。它是可改造的功能参考，不是已经完成客户品牌设计与生产验收的网站。

官方模块随包接入不代表所有工具和工作流均已行为验收。当前自动执行的是本地 triage；插件/主题/REST/运维等模块由 Codex 按需加载，核对依赖后执行。Studio、第三方 builder、任意主机自动部署、完整生产邮件送达尚不属于已交付能力。

新站规划默认原生区块主题 + CPT/ACF + 可选原生模板 + 必要 PHP 动态模块，允许按模块需求组合。参考源码仍是 PHP 基线；区块原型的代表性实测见 [对照报告](docs/acceptance/theme-comparison/README.md)，尚未完成完整骨架交付，不宣称生成成本或性能普遍更优。现有 `examples/terralift-ui-theme/` 是历史混搭演示，不是通用新站 starter。

## 历史资料

`source-snapshot/`、`skills/wordpress/`、`skills/related/`、`archive/` 和早期编号文档是原浏览器扩展与前期实验的历史快照，不是当前自动启用入口。来源索引见 [原始资料索引](docs/原始资料索引.md)，既有修复证据见 [17 号报告](docs/17-OpenAI系统审计与重构决策.md)。不运行快照内宿主构建脚本。

`npm run verify:snapshot` 用于原始快照校验；两个已记录的历史哈希偏差没有通过本轮重构改写或隐藏。各上游文件保持原有许可，本仓库不为全部历史资料统一重新授权。

### HONGDA B2B WordPress 实施示例

[HONGDA 新站源码与运行说明](examples/hongda-wordpress/README.md) 将用户指定参考站的信息架构和布局重新实现为 PHP 混合主题、独立业务插件、ACF 免费字段及原生 WordPress 内容。运行 `npm run hongda:serve`，预览地址为 `http://127.0.0.1:9464/`；运行 `npm run test:hongda` 验证当前隔离实例。内容和照片为待审核预览，生产发布能力不能从本地验收推导。[验收范围](docs/acceptance/0920-hongda/README.md)。

从交付包验证完整本地流程：`npm run hongda:e2e`。它会生成可安装主题/业务插件 ZIP，在 9466 空白实例安装，验证页面、内容维护和询盘，再恢复至独立 9467 实例比对；结束后停止本次启动的服务。每轮证据独立保存，依赖、范围和复现说明见上述 HONGDA 文档。此命令不操作现有 9464/9465，也不发布生产站。

本地原生主机验证：`npm run hongda:native` 在独立 Docker PHP/Apache、MySQL 和 Mailpit 环境验证部署、SMTP 收件、数据库恢复与容器重建持久性。[实测结果与复现方法](docs/acceptance/hongda-native/README.md)。这些能力可以在本地验证，不必等正式上线；真实公网服务和外部邮箱投递另行检查。

## 私人经验仓库快照

包含 harness、AGENTS.md、Skills、references/playbook、源码、测试及研究和验收文字记录。不包含凭据、数据库、浏览器会话和验收截图；历史截图链接需回原工作区查看。示例产品图片和上游许可证保留。执行 `npm ci` 和 `npm run build` 构建工具；Docker 实验需另行初始化。当前验证边界见 docs/ARCHITECTURE.md。

## 可运行的 WordPress 模板站

仓库包含完整区块主题、业务插件、页面/产品演示数据和图片，按 [Starter 快速开始](docs/STARTER-QUICKSTART.md) 可创建新的 WordPress/MySQL 实例，进入后台体验并改造。WordPress 核心使用官方 Docker 镜像安装，不携带线上数据库和账户。
