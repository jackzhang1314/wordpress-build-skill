# WordPress AI 建站：统一架构决策与研究依据

> 部署决策（2026-09-20）：当前只接入 Hostinger Managed WordPress，采用官方 CLI/API + SSH/WP-CLI，MCP 可选。详见 [部署规范](../.agents/skills/wordpress-builder/references/hostinger.md)。当前参考站的本地完整发布包、空白安装、询盘与 MySQL 恢复已通过 [发布包验收](acceptance/b2b-release/README.md)，命令为 `npm run test:starter:release`。Hostinger 只读预检工具已实现本地配置校验和回归测试（`npm run hostinger:preflight -- config/hostinger-staging.example.json`）；现已通过官方 CLI 的真实空白站开通和 WordPress 7.1.1 安装验证（[证据](acceptance/hostinger-onboarding/report.json)）；SSH 预检和自定义整站部署仍未验收；现有 build --publish 不是主机部署命令。

> 当前 SEO 决策：新站统一使用 Rank Math Free，不保留旧插件兼容/数据导入逻辑。区块样板主站与复用环境已替换；具体配置和证据见 [Rank Math 验收](acceptance/rankmath-free/README.md)。


> 2026-09-20 更新：新增 [原生区块代表页项目](../examples/b2b-block-starter/README.md) 及随包 `assets/block-starter`。两套产品模板、分类布局、Pattern 插入、官方 ACF 绑定和代表页 SEO 已有 [本轮证据](acceptance/b2b-block-starter/README.md)。旧 HONGDA 未迁移，完整商业站设计和生产交付仍未完成；下文 PHP 基线的功能限制只适用于该旧基线。

整套方案由项目 AGENTS.md、总编排 Skill、官方专业 Skills、按需规范、项目工具和验收证据共同组成。[仓库开发约定](../AGENTS.md) 管理本方案开发；每个新客户站按 [项目指令规范](../.agents/skills/wordpress-builder/references/project-instructions.md) 建立自己的 AGENTS.md，记录站点事实、代码归属、Skill 路由和实际验证命令。当前由 Codex 适配模板生成，`project-init` 尚未自动生成该文件。

核对：2026-09-20，Asia/Shanghai。本文是当前设计决策；[ARCHITECTURE.md](ARCHITECTURE.md) 记录当前实现，[上手指南](GETTING-STARTED.md) 区分操作对象。**本轮统一了 Skill 的新站规划默认，未把运行中的 PHP 站迁移为区块主题。**

## 结论与修正

用户提出的“区块主题、CPT、ACF、自定义模板、PHP 可以共生”是正确的。它们分别负责页面组织、内容模型、字段编辑和动态渲染，不能简单当作互斥技术。之前因“运营只填字段”而将推荐反转为经典 PHP，是把编辑需求与渲染能力混为一谈。

本项目选择 **原生区块主题 + 独立业务插件/CPT/Taxonomy + ACF + 原生自定义模板/Patterns + 必要 PHP 动态区块 + 定制 CSS/JavaScript**。公开内容默认服务端生成 HTML，以 Google 抓取、真实编辑和可维护性约束具体实现。无需为了 SEO 强制静态导出，也不默认引入无头前端。

这是针对新建 B2B、Codex 生成设计、运营维护产品和多模板、无第三方编辑器的工程决策。官方资料支持各项组合机制，没有宣布这套组合是所有网站的唯一最佳架构。漂亮程度、开发效率、性能和索引结果仍须分别验证。

## 查证结果

| 问题 | 官方依据与结论 | 对本项目的约束 |
| --- | --- | --- |
| 区块主题能否有多套产品模板？ | [customTemplates](https://developer.wordpress.org/themes/global-settings-and-styles/custom-templates/) 支持限定 Page/Post/CPT 的可选模板 | 产品编辑页选择布局；不是每件产品重新注册 CPT |
| 区块主题能否使用 PHP？ | [主题结构](https://developer.wordpress.org/themes/core-concepts/theme-structure/)保留 functions.php；[动态块](https://developer.wordpress.org/block-editor/getting-started/fundamentals/static-dynamic-rendering/)支持 PHP render.php/render_callback | HTML 模板组合区块，PHP 承担实际动态模块；不把 PHP 直接写进 .html |
| PHP 整页能否与区块模板并存？ | [核心 locate_block_template](https://developer.wordpress.org/reference/functions/locate_block_template/)比较区块与 PHP 模板具体程度，并可回退 PHP | 技术上可并存；独立整页 PHP 按例外验收优先级、资源和编辑能力，不承诺无缝 Site Editor |
| 是否应叫 Hybrid Theme？ | [官方 Hybrid 教程](https://developer.wordpress.org/news/2024/12/bridging-the-gap-hybrid-themes/)主要讲经典主题吸收区块功能 | 我们明确称“区块主题 + 动态模块”，避免和现有经典 PHP 混合基线混称 |
| 复杂样式是否受限？ | [Block Stylesheets](https://developer.wordpress.org/themes/features/block-stylesheets/)支持定制 CSS 并接入前台/编辑器 | theme.json 管 token，组件样式实现自由布局；无需所有设计都依赖默认控件 |
| ACF 是否必须 PRO？ | [ACF Blocks](https://www.advancedcustomfields.com/resources/blocks/)是 PRO 能力；[get_field](https://www.advancedcustomfields.com/resources/get_field/)提供字段读取 | 免费字段 + 原生动态块是可用基线；ACF Blocks 是可选实现，先核对许可 |
| 所有绑定都能自动编辑吗？ | [WordPress Bindings](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-bindings/)区分服务器和编辑器能力；[ACF 当前绑定指南](https://www.advancedcustomfields.com/resources/block-bindings/)的完整 UI/实时编辑要求 PRO 6.8.1+、WP 6.7+及配置 | 基础读取、编辑器显示、实时预览、双向写回分别验收，不将它们合并为“支持绑定” |
| Pattern 内 PHP 是否就是动态页面？ | [Using PHP in Patterns](https://developer.wordpress.org/themes/patterns/using-php-in-patterns/)明确 PHP 在注册期执行 | 当前产品与查询数据在动态块/绑定中读取，不能在注册期固化 |
| 数据该放主题还是插件？ | [CPT 官方建议](https://developer.wordpress.org/plugins/post-types/registering-custom-post-types/)建议内容类型归插件以保持可移植性 | 业务 schema/关系/询盘归插件，展示归主题 |

本轮额外只读核验现有 B 实例：WordPress 7.1、ACF 6.8.9 免费版，`acf/field` 与实验 `comparison/acf` 均已注册。因此不能笼统说“免费版没有绑定”。正式适配应先核验并复用现有来源；只有字段类型、上下文、访问控制或编辑器行为存在已证实缺口时才加自有适配。此次注册核验未验证官方绑定的 Query Loop 上下文或编辑器双向写回，不自动升级依赖或替换实验来源。

## 组合方式与责任

```text
Codex + wordpress-builder 总编排
├─ 官方专业 Skill：主题、Patterns、块、插件、REST、运维
├─ 业务插件：产品/分类/方案、ACF schema、数据服务、询盘校验
└─ 原生区块主题
   ├─ theme.json / CSS：统一视觉与编辑器样式
   ├─ templates / parts：页面布局、可选产品模板、页头页脚
   ├─ Patterns / 核心块：起始页面与可编辑章节
   └─ PHP 动态块 / Bindings：消费同一份业务数据
           ↓
   服务端 HTML → 适用的缓存/CDN → 浏览器交互增强
```

跨主题仍需有效的业务块放业务或配套块插件；主题专属展示块可留主题。产品名、摘要、主图和正文使用原生字段，规格与关系使用 ACF/对象 ID，装饰选项使用块属性。不要为不同模板复制产品数据，也不强制将所有文字搬入 ACF。

每个模板说明适用对象、读取字段、可编辑范围、缺值表现、稳定标识与回退。运营默认维护内容和选择批准模板；允许设计维护者使用 Site Editor。权限和 contentOnly/锁定分别管理，锁定不是权限控制。[官方锁定说明](https://developer.wordpress.org/block-editor/how-to-guides/curating-the-editor-experience/block-locking/)

## 页面与模块选择

| 场景 | 默认组合 |
| --- | --- |
| 首页/品牌叙事 | front-page 承接真实页面正文，核心块/起始 Pattern + 定制样式；需要查询时加入动态模块 |
| 产品详情 | 多套 customTemplates，读取同一 CPT 的原生字段和 ACF；正文用核心块，规格/关联/询盘用动态模块 |
| 产品分类 | 真正 taxonomy 归档、当前分类查询与可抓取分页；主题 term 布局字段选择批准展示方案 |
| 行业方案 | 按维护需要用 Page 或 solution CPT；独立叙事与对象关联，不复制产品事实 |
| About/专题 | Page 模板 + 原生内容/Patterns；特殊章节开发可复用块 |
| 联系/询盘 | 原生页面结构 + 已选表单；避免模板与正文重复渲染，服务端核验产品上下文 |
| 特殊配置器等 | 单独模块，优先渐进增强；特殊整页 PHP 需说明核心块/动态模块不足的具体原因 |

原生块 → 定制样式/Patterns → 数据绑定或动态块，是按需求选用的工具，并非要求每个页面按顺序试错。模块首次开发有成本；复用后可降低后续模板成本。本轮实验没有测出“区块比 PHP 生成更容易”的普遍结论。

## Google SEO 是输出标准

Google 可以处理 JavaScript，官方仍建议考虑服务端或预渲染。产品 ACF 来自数据库、动态块通过 PHP 输出，并不妨碍服务器返回完整内容；静态文件不是收录前提。[Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)

本项目要求核心内容在初始 HTML 中可读，链接使用真实 href；分页、筛选、canonical、robots、sitemap、结构化数据和性能按 [SEO 实施规范](../.agents/skills/wordpress-builder/references/seo.md) 验收。缓存是部署优化，不改变数据库内容所有权。询价产品不编造价格/评价来获得富结果；安装 SEO 插件不代表这些检查通过。

这套架构有利于落实技术 SEO，不能保证 Google 收录、排名或富结果展示。真实搜索表现需要在公开环境继续观察；本地只报告可抓取条件和页面质量检查。

## 状态和实施顺序

| 层次 | 本轮结束时的状态 |
| --- | --- |
| 新站架构/Skill 默认 | 已统一为区块主题与原生/PHP 模块组合，补充 SEO 规范 |
| 当前主工作区 HONGDA 与随包参考 | 仍是经典 PHP 基线，未迁移 |
| 区块原型 | 独立 worktree 内已验证代表性模板、字段、询盘、首页编辑和模板覆盖恢复；见 [对照报告](acceptance/theme-comparison/README.md) |
| 完整区块 starter | 尚未随包交付；不能把原型测试复制为生产验收 |
| 本轮 SEO | 完成官方资料研究和规范；未执行全站 SEO 审计或实际 Google 索引验证 |

独立区块代表页骨架、Pattern 插入及分类布局 UI 已落地；后续完善全部关键页、编辑器预览质量及 CLI 模板适配。每次升级检查数据库模板/部件/全局样式覆盖，比较并合并用户修改；不自动删除覆盖来让源码生效。[WordPress 模板说明](https://developer.wordpress.org/themes/templates/templates/)

最终交付再验证 ZIP 安装、字段/模板编辑、询盘、导航、SEO、移动交互和全新 MySQL/媒体恢复。保留既有 PHP 基线与历史证据，架构规范生效与网站迁移完成是两个不同里程碑。


## 从第一步纳入内容质量

新站 Discover 即按 [搜索质量规范](../.agents/skills/wordpress-builder/references/search-quality.md) 明确页面任务、独立价值、查询意图和事实来源；Model/Theme 定义数据与索引策略，Content 核验事实与责任，Verify/Release 同时检查技术输出和实际用途。借鉴 Google 质量评估的视角，但不把 E-E-A-T 或评估员评分当作直接排名公式。

WordPress 专项配置与各阶段产物已进入 [SEO 规范](../.agents/skills/wordpress-builder/references/seo.md) 和 [交付流程](../.agents/skills/wordpress-builder/references/site-workflow.md)。本次为规范落地，当前 CLI 不自动执行全部质量门槛；具体网站仍需按实际输出验收。
