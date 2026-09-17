# Skill 清单与迁移说明

这些包由源项目 `builtinSkills()` 实际导出，包含 SKILL.md、引用文件、资产、许可证及原产品有提供的 skill.json。没有仅按文件名手工拼凑，也没有在本次同步中重写提示词。

## WordPress 核心 Skill

| Skill | 用途 | 目录 |
| --- | --- | --- |
| wordpress-block-pages | 连接WordPress，根据企业资料创建标准外贸站、产品案例与原生区块页面。 | [打开](../skills/wordpress/wordpress-block-pages/SKILL.md) |
| wordpress-acf-products | 读取 Excel 或 CSV，映射已有 ACF 字段并分批创建产品草稿。 | [打开](../skills/wordpress/wordpress-acf-products/SKILL.md) |
| wordpress-media | 上传图片或 PDF，设置图片说明、特色图并插入文章。 | [打开](../skills/wordpress/wordpress-media/SKILL.md) |
| wordpress-forms | 设计询盘字段，创建表单并嵌入 WordPress 原生区块页面。 | [打开](../skills/wordpress/wordpress-forms/SKILL.md) |
| wordpress-seo-settings | 依据实时站点能力检查并修改 SEO 设置，保留变更前后证据。 | [打开](../skills/wordpress/wordpress-seo-settings/SKILL.md) |

## 相关 Skill

| Skill | 用途 | 原产品声明的连接器 |
| --- | --- | --- |
| [technical-seo](../skills/related/technical-seo/SKILL.md) | 检查单页或有界全站的抓取、重复内容、重定向与索引证据。 | dataforseo、google |
| [on-page-seo](../skills/related/on-page-seo/SKILL.md) | 检查标题、内容、图片与内链，交付逐项修改建议。 | 未声明；仍可能依赖浏览器/文件工具 |
| [seo-keyword-research](../skills/related/seo-keyword-research/SKILL.md) | 从产品种子词扩展目标市场关键词，按真实需求、意图和业务相关性筛选。 | dataforseo |
| [seo-serp-analysis](../skills/related/seo-serp-analysis/SKILL.md) | 读取目标市场实时 SERP，比较排名页面类型、内容覆盖和可切入问题。 | dataforseo |
| [seo-content-gap](../skills/related/seo-content-gap/SKILL.md) | 找出竞品有排名而自家站没有排名的关键词，再核实值得补齐的内容。 | dataforseo |
| [seo-topic-clusters](../skills/related/seo-topic-clusters/SKILL.md) | 结合关键词指标和 SERP 重叠规划主题页、子页面与内链。 | dataforseo |
| [seo-content-refresh](../skills/related/seo-content-refresh/SKILL.md) | 对照当前搜索意图和原文证据，更新已有文章并保留可复核修改记录。 | dataforseo |
| [seo-content-studio](../skills/related/seo-content-studio/SKILL.md) | 从关键词或企业数据出发，按需生成简报、大纲或完整文章。 | dataforseo、wordpress |
| [seo-competitor-analysis](../skills/related/seo-competitor-analysis/SKILL.md) | 分析单个网站或比较同行的自然排名、关键词与估算流量。 | dataforseo |
| [site-outline](../skills/related/site-outline/SKILL.md) | 梳理网站导航、菜单层级和页面结构。用户要求网站目录、导航树或站点内容结构时使用。 | 未声明；仍可能依赖浏览器/文件工具 |
| [landing-cro](../skills/related/landing-cro/SKILL.md) | 找出采购信息与询盘路径缺口，形成可定位的修改建议。 | 未声明；仍可能依赖浏览器/文件工具 |
| [b2b-copywriting](../skills/related/b2b-copywriting/SKILL.md) | 把真实产品资料整理成清楚、可用于建站的文案。 | 未声明；仍可能依赖浏览器/文件工具 |
| [seo-performance-review](../skills/related/seo-performance-review/SKILL.md) | 比较同口径的自然搜索表现，结合真实站点数据或定时快照形成复盘。 | google、dataforseo |
| [seo-content-plan](../skills/related/seo-content-plan/SKILL.md) | 将研究结果变成按目标市场组织的内容日历、页面类型和本地化简报。 | dataforseo |
| [seo-backlink-audit](../skills/related/seo-backlink-audit/SKILL.md) | 分析引用域、外链、锚文本及供应商索引中的新增丢失，保留样本证据。 | dataforseo |
| [seo-link-prospecting](../skills/related/seo-link-prospecting/SKILL.md) | 从同行外链和行业内容中找到相关来源页，现场核实引用或合作机会。 | dataforseo |
| [seo-link-outreach](../skills/related/seo-link-outreach/SKILL.md) | 基于已核实的来源页生成个性化联系内容，管理发送、跟进和停止联系记录。 | google |
| [seo-internal-links](../skills/related/seo-internal-links/SKILL.md) | 基于实际页面和抓取图给出内链建议，定位深度、断链与可能的孤立页面。 | dataforseo |
| [seo-schema](../skills/related/seo-schema/SKILL.md) | 检查页面实际 JSON-LD 与 Microdata 属性，或根据真实内容生成结构化数据草稿。 | 未声明；仍可能依赖浏览器/文件工具 |
| [seo-international](../skills/related/seo-international/SKILL.md) | 核对多语言版本的 hreflang、canonical、语言和跨页回链，定位区域配置问题。 | 未声明；仍可能依赖浏览器/文件工具 |
| [seo-performance](../skills/related/seo-performance/SKILL.md) | 结合云端 Lighthouse 实验室检测与 CrUX 现场数据，给出有证据的优化清单。 | dataforseo、google |

## 迁移与使用边界

1. `wordpress-block-pages` 是可选择的主Skill名称；`references/site-setup.md` 是其整站建设参考，**不是名为 wordpress-site-setup 的独立Skill**。第一轮测试曾混淆这个名称。
2. 新项目可以按目录导入支持 SKILL.md 的宿主，但导入成功不意味着工具已实现。原Skill调用的wpRead/wpWriteContent、文件、浏览器、selectTools等接口必须有适配。不要向用户承诺放入Codex技能目录就能直接写站。
3. WordPress账号连接、DataForSEO及Google等连接器配置属于宿主设置，不写入Skill。没有对应插件/权限时先给出具体缺口。
4. 原产品最近增加了seo/maps工具组；部分历史Skill仍来自分组前的指引，新宿主应统一在连接器操作前选择正确组。本次保留原包内容与版本，未静默修改。
5. 推荐先验证一个页面，再启用产品、媒体、表单、SEO；不要一次激活全部26个Skill。
6. 此处是源码包，不是已经安装到浏览器或部署到WordPress的插件。不会自动调用任何API。

## 历史别名与合并

| 历史Skill名称 | 当前入口 |
| --- | --- |
| seo-content-brief / seo-data-article / seo-keyword-article | seo-content-studio |
| seo-domain-analysis / seo-competitor-research | seo-competitor-analysis |

当前包共26个；历史包版本共55条，含当前与旧版记录。请用 [skills/manifest.json](../skills/manifest.json) 作为当前目录，不把原项目seo-skills导出快照或legacy-packages里的旧条目重新全部激活。

## 来源与许可证

当前包：源项目src/agent/skills/builtin.ts及catalog.ts。所有原始文件与旧导出包保存在source-snapshot，历史版本保存在archive/skill-package-versions.json。相关MIT/GPL及来源说明逐文件保留；WordPress站点插件/历史主题与Skill不是同一份许可证。

source-snapshot/wordpress-site/theme是已撤回的主题实验，不属于当前Skill的强制安装项。
