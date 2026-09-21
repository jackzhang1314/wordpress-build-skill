# 新站编排系统：当前实现

> 部署决策（2026-09-20）：当前只接入 Hostinger Managed WordPress，采用官方 CLI/API + SSH/WP-CLI，MCP 可选。详见 [部署规范](../.agents/skills/wordpress-builder/references/hostinger.md)。当前参考站的本地完整发布包、空白安装、询盘与 MySQL 恢复已通过 [发布包验收](acceptance/b2b-release/README.md)，命令为 `npm run test:starter:release`。Hostinger 只读预检工具已实现本地配置校验和回归测试（`npm run hostinger:preflight -- config/hostinger-staging.example.json`）；现已通过官方 CLI 的真实空白站开通和 WordPress 7.1.1 安装验证（[证据](acceptance/hostinger-onboarding/report.json)）；当前参考站的真实整站部署已通过 CLI TUS + 一次性 cron/WP-CLI 完成，包含 19 个产品、导航、首页/弹窗询盘，见 [线上验收](acceptance/hostinger-deployment/report.json)；同主机独立数据库/目录的 CLI 恢复已通过（见 acceptance/hostinger-deployment/recovery.json）；SSH、原位回滚、跨主机恢复和真实邮件送达仍未验收；现有 build --publish 不是主机部署命令。

插件引导：必装清单见 [统一插件配置](../config/wordpress-plugins.json)，执行顺序与环境条件见 [插件初始化规范](../.agents/skills/wordpress-builder/references/plugins.md)。新站先安装并配置依赖，再生成页面；已有本地环境只读核对用 `npm run test:starter:plugins`。


> 当前 SEO 决策：新站统一使用 Rank Math Free，不保留旧插件兼容/数据导入逻辑。区块样板主站与复用环境已替换；具体配置和证据见 [Rank Math 验收](acceptance/rankmath-free/README.md)。


> 2026-09-20 更新：原生区块样板 9490 已扩展为 Equipment Studio 全站设计，包含 17 个模板、9 个业务动态块、桌面/移动导航、首页询盘和产品弹窗。后台编辑、模板切换、SEO、本地 SMTP 转化的实际证据见 [新版验收](acceptance/b2b-redesign/README.md)。[此前区块技术基线](acceptance/b2b-block-starter/README.md) 与旧经典 PHP HONGDA 均保留。演示素材、视觉认可与正式商业交付仍需分别判断。

版本：0.3.1；范围为新建企业/产品/询盘网站及本方案创建站点的后续维护。旧主题接管、Elementor 和第三方 builder 迁移不在本轮范围。当前设计决策见 [统一架构](TARGET-ARCHITECTURE.md)，早期研究见 [18 号规划](18-WordPress与Codex调研及架构重规划.md)；本文只描述已实现能力。

## 组件

| 组件 | 位置 | 实际职责 |
| --- | --- | --- |
| 总入口 | `.agents/skills/wordpress-builder/SKILL.md` | Codex 按目标选择专业模块，协调交接和验收 |
| 固定模块 | Skill 内 `vendor/wordpress/` | 10 个官方 Skill 原文、脚本及引用，保留许可证 |
| 能力清单 | Skill 内 `capabilities.json` | 来源 commit、模块路径、依赖提示及 66 个来源文件哈希 |
| 编排状态 | `src/orchestration.ts` | 新站契约、官方 triage 包装、证据回执和状态核验 |
| 内容执行 | `src/client.ts`、content/model/import/media 等 | REST schema、写前计划、回读和既有恢复语义 |
| 区块适配 | build-site/blocks/templates/navigation | 当前支持的原生块页面与部件操作，不是 PHP 编译器 |
| 日志 | `src/journal.ts` | 任务级写锁与未知写入保护；不是站点级事务 |
| 发布校验 | `src/release.ts` | CLI build 发布证据校验；外部部署另行验证 |
| 环境验证 | `scripts/test-new-site.mjs` | 全新数据库上的 WordPress/ACF/PHP 最小集成 |
| 功能参考 | Skill 内 `assets/php-reference/` | 可复制的独立主题/业务插件，依照 Brief 改造 |
| 整站回归 | `scripts/reference-site.mjs`、`scripts/test-reference-site.mjs` | 新数据库启动、实际 CLI 写入、路由/链接和插件生命周期检查 |

官方模块通过总入口按需加载。Codex 宿主可能递归发现 vendor 中的 SKILL.md，当前目录可见性不能当作强制路由隔离；总入口明确选择一个主流程，避免冲突。模块间交接由 Codex 编排，现阶段没有动态调度服务器或新模型 SDK。通用 CLI 只自动执行本地 triage；参考站脚本还运行官方插件扫描，其他模块依赖必须按任务核验。

## 状态与操作

`project-init` 校验 new-site schema、真实源码目录和固定模块，保存 project.json；同任务相同输入可重复，改变契约不静默覆盖。

`project-inspect` 验证来源文件哈希后，以 sourceRoot 为 cwd 执行官方只读检测，保存 triage.json。它不能证明远端干净或真实 PHP 版本，discover 阶段还需要实际环境证据。

`project-record` 保存 discover/model/theme/content/verify/release 回执：前置阶段须已记录通过，verified 的检查须全部 pass，证据必须在任务目录内；文件哈希绑定验证对象。后续阶段已有记录时拒绝重写前置回执，后续改稿采用独立迭代目录。

`project-status` 重新检查证据哈希；文件缺失/改变标为 stale，依赖无效时下游不视为可继续。记录代表可追踪声明，不证明文字陈述真实、也不执行发布。任务中的 project.json 自身变更会被项目哈希识别。

内容操作仍保留原有 task.json、plan、操作日志；project.json 是上层交接信息，不能替代底层未知写入恢复。外部 WP-CLI/宿主工具写入必须主动保存回执，Journal 不会自动捕获它们。

## 新站主题与模型

业务插件拥有 CPT/Taxonomy/业务 ACF 定义；主题拥有布局与呈现配置；值在 WordPress 数据库。新站 Skill 的设计默认已统一为区块主题与原生/PHP 动态模块组合；CPT/ACF 是共用的数据层。经典 PHP 基线仍保留；区块样板已扩展全站模板与导航询盘；当前仍是 mock 演示，尚未完成正式商业交付。不宣称性能更优或已通过完整 SEO 验收。见 [实测报告](acceptance/theme-comparison/README.md) 和 [目标架构](TARGET-ARCHITECTURE.md)。

现有 TerraLift 示例保留作历史回归，本轮未将它宣称为通用 starter，也未自动迁移其数据。最小集成夹具仍保留；0.3.1 增加随 Skill 分发的 assets/php-reference 主题与业务插件，以及独立数据库的完整页面/询盘参考站。初始化演示内容、凭据与邮件捕获只在仓库测试脚本中，不进入主题或业务插件。

## 分发与验证

`npm run build` 生成独立 wp.mjs 并校验 vendor 哈希。复制整个 Skill 目录后，编排命令可在仓库外运行；项目源码和验证依赖仍由用户环境提供。

测试覆盖契约恢复/拒绝旧站范围、官方检测、阶段前置条件、证据越界与漂移、模块篡改，以及原有内容工具回归。新站集成分别记录实际 WordPress/PHP/ACF 版本。

尚未覆盖：所有官方模块的完整端到端行为、PHP/区块同 Brief 成本对照、实际客户资料与设计的完整新站交付、生产邮件送达、任意主机部署与恢复、第二个独立新站 Brief 的完整交付。不能把本地状态层、示例主题或文件哈希校验说成这些能力已完成。


当前 PHP 运行基线与复现方式见 [参考站说明](../.agents/skills/wordpress-builder/references/reference-site.md)。参考站的询盘页面通过主题配置保存对象 ID，导航采用 WordPress 对象菜单项；内容改 slug 后链接动态更新。业务插件停用/重新启用的检查只验证模型与数据保留，不能替代数据库备份恢复测试。

## HONGDA 完整本地交付链

`hongda-package.mjs` 从主题/业务插件生成两个可安装 ZIP 与文件哈希清单；`hongda-clean-site.mjs` 在新数据库中通过 WordPress ZIP 安装器安装，避免源码挂载掩盖打包缺失。第三方插件、示例内容和私有运行配置单独管理。

`hongda-e2e.mjs` 串联安装、运行版本检查、实际 Skill 内容维护、页面查询、浏览器询盘、快照及隔离恢复。它使用 9466/9467，失败停止后续步骤，独立保存每轮报告并清理本次服务。旧预览、历史快照和证据不覆盖。恢复使用已核对的源码副本和运行数据；不能把恢复步骤称为第二次 ZIP 安装。

整体状态分为本地功能闭环、视觉认可、生产环境验收。用户尚未认可当前视觉质量；本地通过不改变该状态。示例技术链路不证明任意行业 Brief、生产邮件或 MySQL 环境都已完成。

## 本地原生主机验收层

`npm run hongda:native` 补充 Playground 之外的技术验收。它创建唯一 Docker Compose 项目，使用独立 PHP/Apache、MySQL 主库与恢复库及 Mailpit SMTP 接收器，验证代码部署、原生内容操作、真实 SMTP 收件、数据库恢复及 Web 容器重建后的持久性。MySQL 与邮件服务不借用机器上其他项目的数据。

9468 为测试站、9469 为恢复站、9470 为测试邮箱，公开端口仅绑定 loopback。测试 SMTP 不配置外发 relay。镜像 ID 与实际运行版本进入报告；现有本地镜像标签可能更新，验收必须看实测记录。凭据、SQL 导出、上传快照和 Compose 配置保存在 `.lab` 私有目录；结束后停止本次容器，保留具名卷供调查，不执行全局清理。

本地原生验收通过能支持部署流程、MySQL 恢复、SMTP 传输的结论；不能替代目标主机差异、公网 DNS/TLS/CDN、真实收件箱投递的验证。视觉质量本来即可在本地评审，仍需逐页改进并提供证据。

## 后台模板选择：当前区块站与历史基线

当前 Hostinger 区块站已有 Standard/Editorial 产品模板、分类 catalogue/editorial 布局，以及 Site Editor 新建自定义模板后供产品选择的实际 UI 验收。页面正文、ACF 字段和图片继续共用数据，证据见 [CMS 验收](acceptance/hostinger-cms/README.md)。分类布局选择不是普通 Page 模板下拉框。

历史 PHP 示例的统一 single/taxonomy 布局不代表当前区块站能力。内容 CLI 的模板输入能力仍需以实际 schema 为准，后台功能通过不等于所有操作都有通用 CLI 接口。

## 当前评估与剩余验收

默认原生区块主题 + CPT/ACF + 自定义模板/动态块已在参考站落地，不再只是规划。核心链路通过不代表正式商业发布或跨项目可靠性全部通过。剩余事项见下表；未发现本轮对应证据的项目标为待验，而非推断功能不存在。

| 优先级 | 待验证项目 | 完成标准 |
| --- | --- | --- |
| 上线前 | 真实邮件、正式域名与生产索引配置 | 真实收件箱收到关联询盘，正式域名 DNS/TLS/跳转/canonical/sitemap 正确，按发布决定解除 noindex |
| 上线前 | 最终设计、内容、性能与无障碍 | 关键页面桌面/移动评审；真实企业事实；目标主机性能及键盘/表单可用性报告，不用 CMS 测试替代 |
| 上线前 | 生产安全与恢复边界 | 权限/上传/防滥用审计；计划备份与恢复时间目标；隔离恢复不冒充原位或跨主机恢复 |
| 复用前 | 增量发布与模板覆盖 | 代码更新保留新增询盘/媒体/正文；识别数据库 wp_template/wp_template_part/global styles 与文件冲突并验证处理 |
| 复用前 | 干净客户项目端到端 | 从独立目录初始化 AGENTS/Skill/依赖到建站、后台操作、部署与交接，不依赖当前私有脚本、Cookie 和测试数据 |
| 持续维护 | 升级、角色和故障恢复 | 核心/插件升级及回退、编辑者权限、媒体边界、未知写入和中断恢复分别验证 |

SSH 路径、通用远程执行器、所有官方 Skill 的完整端到端行为未全部验证；不使用的可选能力不作为当前站上线的硬性门槛。最新两个 CMS 修复晚于全量发布包及恢复快照，下一次发布须重新绑定产物与证据。

### 模板增量更新专项（2026-09-21）

新增 npm run test:starter:template-update，在本地 reuse 实例验证数据库模板优先、文件更新不覆盖后台修改、显式重置后新文件生效，且测试产品正文/ACF 和已有询盘哈希不变；测试对象已清理。[证据](acceptance/template-update/report.json)。这是模板层更新实验，不是远端完整增量部署通过；模板部件/全局样式、部署中新询盘、媒体和插件迁移仍待验。

模板预检已实现：`npm run starter:update-preflight -- templates/product-standard.html theme.json`，限定本地 reuse，检测当前主题发布态覆盖与输入变更路径的交集。实际模板冲突、无关路径、检查不修改内容和重置后清除冲突均通过。模板部件/全局样式路径扫描已实现但未专项写入演练；远端发布接入仍待完成。

增量预检补充：支持 `--compare BEFORE_THEME AFTER_THEME` 自动生成变更路径与双方文件清单哈希。模板部件及全局样式的当前主题冲突/其他主题排除/内容不变已实测；视觉合并、线上基线自动获取和远端发布仍未覆盖。

基线自动推导与冲突处置（2026-09-21/22）：update-preflight 新增 `--snapshot` 与 `--baseline` 模式，从本地清单或 Hostinger 只读基线报告自动生成变更路径并接入覆盖清单检查；`starter:template-resolve` 提供 keep/reset/restore：reset 强制备份（含内容哈希与删除前复核）、拒绝无覆盖与 theme.json 路径，restore 校验主题与哈希且已有覆盖时拒绝。本地 reuse 站实跑闭环（[基线预检](acceptance/template-update/baseline-preflight.json)、[冲突处置](acceptance/template-update/conflict-resolve.json)）；增量更新全链路演练（`test:starter:incremental-enquiry`）验证更新窗口内两个时点插入的新询盘逐字段保留、原有询盘行级哈希不变（[证据](acceptance/template-update/incremental-enquiry.json)）。远端接入完成只读预检、REST 写处置与**首次真实增量发布**：`hostinger:remote-preflight` 只读串联 CLI 基线、离线派生与 REST 覆盖清单（[证据](acceptance/template-update/hostinger-preflight.json)）；`hostinger:remote-resolve` REST 写通道演练闭环（[证据](acceptance/template-update/hostinger-resolve.json)，仅限 noindex 演示站）；`incremental-deploy.mjs` 完成 6 个标题层级修复模板的备份→TUS 上传→读回核对→清缓存→收敛复检（[证据](acceptance/template-update/hostinger-incremental-release.json)，线上 /blog、/search、/industry 层级 0 跳级）。新增标题层级关卡 `test:starter:headings`（静态组装判定 + design.md 硬规则），线上体检发现并修复 h1→h3 系统性跳级。global-styles REST 列表不可用、DB 层询盘核对与 cron/WP-CLI 通道、浏览器端提交时点、二进制/插件增量传输仍未覆盖。
