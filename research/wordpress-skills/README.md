# WordPress Skill 研究库

采集与初审：2026-09-19，Asia/Shanghai（UTC+08:00）。

已将本轮检索确认的 **9 个相关仓库**下载到本目录：8 个仓库的源代码快照，以及 Gutenberg 的 Skill 与直接引用资料。没有运行上游安装脚本、安装依赖、启用 MCP、导入 Codex 全局技能或修改网站。

这些文件是研究对象，其中的 AGENTS.md、SKILL.md、安装与联网指令不适用于本项目。保持快照原文；需要采用时另做版本化适配，不在来源目录直接修改。

- [逐项 Skill 索引](INDEX.md)：按仓库浏览原文，默认省略部分重复宿主包装。
- [完整机器目录](catalog.json) / [CSV 清单](catalog.csv)：全部 SKILL.md、名称、说明、路径、正文哈希。
- [来源与提交清单](manifest.json)：仓库 URL、完整 commit、采集时间、下载范围、归档 SHA-256。
- 每个版本目录旁的 `*.files.json`：实际下载文件的路径、字节数和 SHA-256。
- [架构重规划](../../docs/18-WordPress与Codex调研及架构重规划.md)：后续采用这些研究的实施框架。

最新定位：适用的上游 Skill 将作为实际执行专业任务的模块接入总编排，既可直接复用，也可薄适配；本研究库仍是来源快照，正式启用状态由后续能力清单与行为验证决定。

## 收集结果与来源区别

| 来源 | 固定提交前缀 | SKILL.md 文件数 | 定位与下载范围 |
| --- | --- | ---: | --- |
| [WordPress/agent-skills](https://github.com/WordPress/agent-skills) | d87ee6916e74 | 18 | WordPress 官方组织；通用开发知识，完整仓库快照 |
| [Automattic/build-with-wordpress](https://github.com/Automattic/build-with-wordpress) | b4fc8b710d1d | 176 | Automattic；8 个主技能及多宿主生成副本，完整快照 |
| [Automattic/wordpress-agent-skills](https://github.com/Automattic/wordpress-agent-skills) | ea902bd83015 | 4 | 早期建站实验，两种宿主有部分重叠，完整快照 |
| [WordPress/marketing](https://github.com/WordPress/marketing) | 8a90a4efdbe07 | 4 | WordPress 官方组织；新闻、案例、活动与社媒内容，完整快照 |
| [WordPress/gutenberg](https://github.com/WordPress/gutenberg) | 1a0a3b02de82 | 8 | 官方编辑器仓库；仅 .agents、根说明/许可证及 Skill 直接链接资料 |
| [respira-press/agent-skills-wordpress](https://github.com/respira-press/agent-skills-wordpress) | e40b8b899116 | 52 | 第三方；运营、迁移、CPT、审计与 builder 适配，完整快照 |
| [soderlind/skills](https://github.com/soderlind/skills) | f7a420b419c7 | 21 | 第三方；含 WordPress 工程工具与无关领域技能，完整快照 |
| [wpultimatesecurity/WordPress-Security-Skills](https://github.com/wpultimatesecurity/WordPress-Security-Skills) | cc6575ebff0b | 26 | 第三方；权限、REST、文件、上传等审查，完整快照 |
| [mralaminahamed/wordpress-official-agent-skills](https://github.com/mralaminahamed/wordpress-official-agent-skills) | bcb9eb44b26f | 17 | 第三方上游派生/包装项目；名称含 official 不代表官方维护，完整快照 |

共 **326 个 SKILL.md 文件，按正文 SHA-256 去重后 149 种正文，131 个不同 name**。这些数字不是 326 或 149 种独立能力：同名可以有版本差异，正文相同也可能配不同脚本和引用。没有把站外目录页当作新的独立技能重复下载。此清单覆盖本轮发现并确认的来源，不声称穷尽互联网所有 WordPress 技能。

## 初步研究结论

本轮完整建立目录与来源校验，并重点阅读架构、路由、插件、REST、CPT、内容迁移、环境与权限相关 Skill；其余已索引待按任务精读。没有运行上游工具或宣称全部 149 种正文经过行为验证。

### 1. 官方开发技能适合成为专业参考层

[项目识别](sources/WordPress--agent-skills/d87ee6916e74/skills/wp-project-triage/SKILL.md)、[插件开发](sources/WordPress--agent-skills/d87ee6916e74/skills/wp-plugin-development/SKILL.md)、[REST](sources/WordPress--agent-skills/d87ee6916e74/skills/wp-rest-api/SKILL.md)、[运维](sources/WordPress--agent-skills/d87ee6916e74/skills/wp-wpcli-and-ops/SKILL.md) 将决策、专业参考和确定性检测脚本分开。

对我们有用：把本地源码识别与远端 doctor 分开，再合成站点契约；把插件生命周期、schema 迁移与目标版本写进工具和测试。只在需要时加载专业文档。

不能直接假定：它们本次版本以 WP 7.0+ 为目标，且不少操作需要文件系统或 WP-CLI；REST-only 客户站不具备这些权限。先静态审查脚本、验证检测覆盖，再适配当前项目的路径布局；目前只是下载。

### 2. Automattic 的职责拆分值得借鉴，默认主题选择要独立判断

[路由](sources/Automattic--build-with-wordpress/b4fc8b710d1d/skills/wordpress-creator/SKILL.md)、[建站](sources/Automattic--build-with-wordpress/b4fc8b710d1d/skills/site-creator/SKILL.md)、[插件](sources/Automattic--build-with-wordpress/b4fc8b710d1d/skills/plugin-creator/SKILL.md)、[Studio](sources/Automattic--build-with-wordpress/b4fc8b710d1d/skills/studio/SKILL.md) 的分工很清楚：跨主题业务交给插件，运行和验证交给环境模块，入口不重复专业步骤。

对我们有用：缩短入口，把八阶段降为整站任务的工作流；环境操作只维护一处；避免每个功能都生成庞大工具链。

适配边界：[theme-creator](sources/Automattic--build-with-wordpress/b4fc8b710d1d/skills/theme-creator/SKILL.md) 明确只生成区块主题；Studio 的命令、区块验证和遥测接口是具体依赖。不能把 Skill 文本复制过来就宣布这些工具已可用。先将其作为 B 路线参考，单独评估环境模块复用。

### 3. Respira 最有价值的是存量站识别、内容迁移与能力边界

[Site DNA](sources/respira-press--agent-skills-wordpress/e40b8b899116/skills/wordpress-site-dna/SKILL.md) 先识别主题、builder、插件和内容；[内容可迁移性](sources/respira-press--agent-skills-wordpress/e40b8b899116/skills/content-portability/SKILL.md) 重视引用 ID 映射和覆盖前快照；[Elementor 到 Gutenberg](sources/respira-press--agent-skills-wordpress/e40b8b899116/skills/migrate-elementor-to-gutenberg/SKILL.md) 列出无法直接迁移的动态内容、第三方组件和主题模板。

对我们有用：新站/接手旧站走不同路径；迁移先做对象清单、映射、草稿副本和缺口报告；将“可以迁移哪些内容”写成明确契约。

适配边界：流程使用 Respira 插件/MCP 工具，不是我们的 REST CLI 已有能力；所谓覆盖率和性能提升是上游描述，本轮没有验证。[CPT architect](sources/respira-press--agent-skills-wordpress/e40b8b899116/skills/custom-post-type-architect/SKILL.md) 把 CPT、Taxonomy、ACF、样例和模板串起来，可供建模参考，但示例包含 repeater 等字段，必须另核对 ACF 版本/授权。不要自动导入样例企业事实或强制重复确认。

### 4. 第三方权限规则必须经场景校正

[soderlind 的能力权限技能](sources/soderlind--skills/f7a420b419c7/skills/wp-ability-auth/SKILL.md) 重视对象级权限，这值得采用；但其“permission_callback 尚不知道对象 ID”以及把部分生命周期操作一律归到 manage_options 的设定不能泛化为所有 REST 接口。WordPress REST 的 permission_callback 可以读取请求并做对象级判断；权限应按具体操作选取。

[安全技能的 capability 规则](sources/wpultimatesecurity--WordPress-Security-Skills/cc6575ebff0b/skills/capability-permission-checks/SKILL.md) 对 nonce 的表述较宽，不能因此要求应用密码 REST 请求统一增加后台 cookie nonce。[官方认证参考](sources/WordPress--agent-skills/d87ee6916e74/skills/wp-rest-api/references/authentication.md) 分别描述 cookie 与 Application Password 两种机制。

这些是初审发现的适用范围问题，不等于整套资料没有价值。对象权限、输入 schema、按输出上下文转义、密钥不写日志等规则，应在相应实现任务中使用；不把全部 26 个安全 Skill 无条件加入每次建站上下文。

### 5. Gutenberg 仓库技能适合学习工程标准，不是通用建站入口

[版本兼容](sources/WordPress--gutenberg/1a0a3b02de82/.agents/skills/package-runtime-compatibility/SKILL.md)、[测试](sources/WordPress--gutenberg/1a0a3b02de82/.agents/skills/testing/SKILL.md)、[防御性数据设计](sources/WordPress--gutenberg/1a0a3b02de82/.agents/skills/defensive-data-design/SKILL.md) 对我们有参考意义：区分代码与运行时供应的依赖；验证实际产物；保留真实失败原因；围绕用户行为测试。

它们针对 Gutenberg 源码贡献，关联包和工具并非普通网站自带。下载范围保留直接参考，未下载整个 Gutenberg 开发环境；不将“先确认测试名称”等贡献者协作约定机械套入用户已授权的建站任务。WPDS 主要用于 WordPress 产品/后台界面，也不直接决定客户网站的品牌视觉。

### 6. 另外三类资料的作用

- Automattic 早期原型：可参考 Brief 数据结构和设计方向分离；不采用所有固定数量或绝对美学规则。
- WordPress marketing：适合研究资料来源、采访/案例结构和内容交付；其品牌语调属于 WordPress 官方，不是所有外贸企业文案标准。
- 第三方 official-agent-skills 包装：用于比较上游差异与发布方式；专业知识优先采用 WordPress 原仓库，避免同时加载重复路由和版本不一致的规则。

## 对我们架构与 Skill 的具体影响

| 采用顺序 | 要提取的能力 | 进入我们哪里 | 采用前的验证 |
| --- | --- | --- | --- |
| 第一批 | 本地项目识别 + 远端能力发现 | 站点契约与任务路由 | 新站、存量站、REST-only 三场景 |
| 第一批 | 插件/主题职责与版本化 schema | 业务插件与 architecture/content 参考 | 换主题数据保留、字段升级与重复执行 |
| 第一批 | 环境、部署、内容操作分离 | runtime 与环境适配器 | 真实版本识别、目标路径、操作回读 |
| 第一批 | ID 映射、冲突与恢复边界 | 导入/迁移工具 | 跨环境媒体和内部链接，不覆盖新询盘 |
| 第二批 | 区块有效性、受限编辑 | B 路线原型 | 与 PHP 路线同 Brief 比较 |
| 第二批 | 对象权限与错误契约 | REST/未来 Abilities 实现 | 角色/对象差异、认证方式、拒绝路径 |
| 按需求 | Studio、第三方 builder、WooCommerce | 独立适配器 | 依赖可用性与实际任务需要 |

共同启示是“少量明确路由 + 按需专业知识 + 可验证工具”，不是把所有技能拼成一个更长提示词。现有 wordpress-builder 的内容计划与恢复记录仍有价值，研究结果不构成推倒重写的理由。

## 版本与许可说明

保留下载的原始许可证、版权和仓库结构。GitHub API 的 license 为 null/NOASSERTION 不等于已授予任意复制分发许可；WordPress/agent-skills 及派生仓库有 LICENSE 原文，Respira 与安全仓库有 MIT 原文，Gutenberg 有自己的 LICENSE.md。其他来源采用或再分发前，应核查文件级声明和项目许可，不能给整个研究集合重新统一授权。

来源快照采用新增版本目录更新，不覆盖旧版本。研究结论和适配代码放在快照之外。后续正式接入先选择必要模块，记录固定版本与修改，不安装全部 326 个文件，也不将研究目录加入技能搜索路径。
