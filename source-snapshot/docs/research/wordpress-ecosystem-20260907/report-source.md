# WordPress 场景、连接器与 Skill 扩展研究

面向章鱼外贸 AI 工具箱 · 2026-09-07 · 研究方案，尚未实施新增功能

## 决策摘要

建议把 WordPress 扩展为「内容运营、页面构建、询盘转化、站点优化」四组场景，共用一个站点连接；先补齐原生媒体、页面和分类能力，再接入 WPForms、Rank Math、WooCommerce，并针对 Elementor 提供模板适配。Bricks 已有官方指向的 Skill 和实验 AI 能力，值得测试，但暂不作为生产默认方案。

这不是再安装一批名字叫 WordPress 的提示词。真正的交付需要同时具备业务流程、站点授权、具体执行接口，以及修改后的编辑器和前台验证。以下优先级是结合本产品用户与架构的判断，不是厂商排名。

## 1. 研究范围与用户规模

将「常用、用户量大的 WordPress 网站」理解为主流 WordPress 建站生态，同时补充真实大型网站案例。WordPress.org 是开源软件生态；WordPress.com 是托管服务，认证和接口不能混用。NASA 与白宫均出现在官方 Showcase，可作为复杂内容、媒体和发布流程的案例；本次没有核验其访问人数，也不据此推导它们使用某个页面构建器。[NASA 案例](https://wordpress.org/showcase/nasa/) · [白宫案例](https://wordpress.org/showcase/the-white-house/)

下表是检索时官方目录展示的安装量下限，不是独立用户数、付费客户数或市场份额。不同插件可装在同一网站，不能相加。目录会更新，商业版本也可能不计入免费插件。

| 产品 | 规模信号 | 对外贸站的意义 |
| --- | --- | --- |
| Elementor | [10M+ 活跃安装](https://wordpress.org/plugins/elementor/) | 高优先级页面构建适配对象 |
| Yoast SEO | [10M+ 活跃安装](https://en-au.wordpress.org/plugins/wordpress-seo/) | SEO 检查覆盖面广，写入需另外确认接口 |
| Contact Form 7 | [10M+ 活跃安装](https://wordpress.org/plugins/contact-form-7/) | 询盘表单检测与已有站点兼容 |
| WooCommerce | [7M+ 活跃安装](https://wordpress.org/plugins/woocommerce/) | 商品目录、产品资料和商城运营 |
| WPForms Lite | [5M+ 活跃安装](https://wordpress.org/plugins/wpforms-lite/) | 新建询盘表单与询盘数据整理 |
| Rank Math | [4M+ 活跃安装](https://wordpress.org/plugins/seo-by-rank-math/) | 已有 AI 能力，适合 SEO 实际操作 |
| Polylang | [800K+ 活跃安装](https://wordpress.org/plugins/polylang/) | 多语言站点的翻译关联与发布 |
| Kadence Blocks | [600K+ 活跃安装](https://wordpress.org/plugins/kadence-blocks/) | 原生区块扩展，需要识别具体块 |
| Spectra Legacy | [1M+ 活跃安装](https://wordpress.org/plugins/ultimate-addons-for-gutenberg/) | 旧站兼容对象 |
| Spectra Blocks 新版 | [40K+ 活跃安装](https://wordpress.org/plugins/spectra-blocks/) | 不可套用 Legacy 的百万安装量 |
| Divi / Beaver Builder | [Divi 厂商客户口径](https://www.elegantthemes.com/gallery/divi/) / [Beaver 厂商站点口径](https://www.wpbeaverbuilder.com/pricing-features/) | 是重要商业生态，但不与目录活跃安装量直接排序 |
| Bricks | 本次未核验活跃安装数 | 按官方接口与 Skill 的适配价值纳入，不宣称百万用户 |

## 2. 内容管理与上传：建议支持的完整工作流

原生 REST API 已覆盖文章、页面、媒体、分类、标签、修订等资源；这些是可供开发的官方能力，不代表我们现在已全部接入。[WordPress REST 资源目录](https://developer.wordpress.org/rest-api/reference/)

| 编号 | 场景 | 输入 → 交付 | 适配路径 | 建议 |
| --- | --- | --- | --- | --- |
| C01 | 完整文章发布 | 文稿、图片、分类 → 可检查的草稿或文章链接 | posts + media + categories/tags | 第一阶段；扩展现有发布工具 |
| C02 | Word/Markdown 文稿上传 | 用户文档 → 保留标题、列表、链接的编辑器内容 | 文件解析 + 原生区块序列化 | 第一阶段；清理外部样式 |
| C03 | 媒体上传与复用 | 图片/PDF → 媒体 ID、URL、alt、说明 | media，二进制上传 | 第一阶段；同图复用避免重复上传 |
| C04 | 特色图与正文插图 | 已上传素材 → 特色图和对应内容位置 | featured_media + 正文图片 | 第一阶段；不能只返回图片文件 |
| C05 | 内容库存整理 | 日期、类型、状态 → 可筛选的文章表 | 分页列表 + 明确覆盖范围 | 第一阶段；当前按 ID 读取不等于全站盘点 |
| C06 | 旧文章更新 | 旧页面、SEO 数据 → 修改对比和更新回执 | 原始内容读取 + 差异写入 | 第一阶段；复用现有 SEO 更新 Skill |
| C07 | 批量导入 | 产品/案例 CSV → 校验表、分批草稿和失败清单 | 原生 API；复杂映射可选 WP All Import | 第二阶段；每条记录独立追踪 |
| C08 | 内容日历与定时发布 | 时区、日期、文稿 → 站点端 future 状态 | WordPress 原生排期 | 第二阶段；不靠浏览器保持在线 |
| C09 | 多语言内容发布 | 原文、术语、语言 → 翻译页面和语言关联 | 核心页面 + WPML/Polylang 适配 | 第二阶段；翻译文字不等于建立语言关系 |
| C10 | 内容版本恢复 | 历史快照 → 恢复差异和新回执 | 修订读取或本地前置快照 + 内容更新 | 第二阶段；不声称全站回滚 |

媒体接口可读写 alt、caption、description 等；文章与页面接口支持特色图。上传需要扩展当前只发送 JSON 的连接器，并把媒体 ID 与后续页面操作关联。[媒体接口](https://developer.wordpress.org/rest-api/reference/media/) · [文章接口](https://developer.wordpress.org/rest-api/reference/posts/)

定时文章依赖站点调度。WP-Cron 通常由页面访问触发，不能承诺在任意主机环境下精确到秒；验收时检查未来状态及到期结果。[WP-Cron 官方说明](https://developer.wordpress.org/plugins/cron/)

WP All Import 的文档支持 CSV/XML、图片、字段映射；其 Action API 主要是 PHP hooks，定时执行使用 trigger/processing URL。不能把它当现成的通用远程 CRUD API。对已经使用它的客户，可以生成匹配导入模板或执行已配置任务；不为普通文章发布新增强制依赖。[导入说明](https://www.wpallimport.com/documentation/) · [调度接口](https://www.wpallimport.com/documentation/cron/)

## 3. 页面构建：按场景呈现，按编辑器适配

| 生态 | 官方能力与限制 | 我们应该怎么做 |
| --- | --- | --- |
| Gutenberg 原生区块 | pages 可创建更新；块内容有序列化格式 | 首批支持受控核心块：标题、段落、图片、列、分组、按钮、列表等；生成可继续编辑的页面 |
| Elementor | 布局为 JSON，保存于私有 post meta；官方说明模板导入导出 | 优先已有模板的文字、图片和 CTA 替换，按版本校验；本次未核验统一稳定的远程布局写入接口 |
| Divi | Divi 4 与 5 存储方式不同，迁移与第三方模块存在兼容边界 | 识别版本后做模板复用/局部更新；不把所有 Divi 页当同一种正文 |
| Bricks | 官方实验 Abilities 可操作元素、模板、样式，配套 Skills | 独立实验适配；官方要求实验期间在本地或 staging 使用 |
| Beaver Builder | 布局在 post meta，可导入导出模板 | 辅助模板迁移/编辑，不直接猜写私有数据 |
| Spectra / Kadence | 基于原生块但有插件专属属性和渲染 | 作为 Gutenberg 适配扩展，识别插件、块名与版本后启用 |

依据：[Pages API](https://developer.wordpress.org/rest-api/reference/pages/) · [区块数据表示](https://developer.wordpress.org/block-editor/getting-started/fundamentals/markup-representation-block/) · [Elementor 数据结构](https://developers.elementor.com/docs/data-structure/index.html) · [Divi 迁移说明](https://help.elegantthemes.com/en/articles/12767407-how-to-safely-migrate-from-divi-4-to-divi-5) · [Bricks AI](https://academy.bricksbuilder.io/builder/features/ai-abilities-and-skills/) · [Beaver 导入导出](https://docs.wpbeaverbuilder.com/beaver-builder/settings/export-import/)

建议页面场景：

| 编号 | 场景 | 交付与验收 | 第一适配对象 |
| --- | --- | --- | --- |
| P01 | 外贸首页/关于我们 | 企业事实、产品入口、优势、询盘 CTA | Gutenberg |
| P02 | 产品介绍页 | 真实参数、应用、下载资料、询盘入口 | Gutenberg / ACF |
| P03 | 行业解决方案页 | 行业问题、选型方案、案例、CTA | Gutenberg / Elementor 模板 |
| P04 | 广告落地页 | 关键词/广告承诺一致、清晰表单、移动端检查 | Gutenberg / Elementor 模板 |
| P05 | 案例与 FAQ 页面 | 有来源的案例，FAQ 内容与结构清晰 | Gutenberg |
| P06 | 现有页面局部更新 | 修改指定文案/图片/CTA，保留其余结构 | 各构建器专属适配 |
| P07 | 复用企业模板 | 保留字体、颜色、间距和全局组件关联 | 原生 patterns 或构建器模板 |
| P08 | 页面上线验收 | 编辑器无 invalid block、移动端无溢出、图片与链接正确 | 通用浏览器检查 |

创建页面和改主题不是一个层级。首批不自动改全站 header/footer、导航、全局样式；这些变更影响范围更大，应作为单独操作。/wp/v2/blocks 也不是任意文章内部块的 CRUD 接口。原生块可研究使用官方 parse/serialize/validate 能力，但要在扩展适合的宿主中运行，不能假设 service worker 有 DOM。[官方 blocks 包](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-blocks/)

## 4. 其他高价值生态：询盘、SEO、商品、多语言

| 对象 | 已核验的官方能力 | 可新增场景 | 边界 |
| --- | --- | --- | --- |
| WPForms | 通过 Abilities 读取表单；1.10.2 起提供 opt-in 写入 | 新建询盘表单、字段优化、询盘整理 | WordPress 6.9+；部分字段/条目能力需要 Pro；先读取 editing schema |
| Rank Math | 官方 AI 工具可审计、读元数据及修改部分 SEO 设置 | SEO 设置检查、首页元信息、支持项修复 | 逐工具检测；不据此推断所有文章字段均可写；部分功能依赖 Pro/Content AI |
| Yoast | 官方 REST 返回 SEO head 和结构化数据；该接口明确只读 | 发布前后 SEO 输出检查 | 写回需要其他已验证适配或后台 UI；不能直接 POST get_head |
| WooCommerce | wc/v3 管理 REST；另有原生 Abilities/MCP 开发者预览 | 产品草稿、属性与图片、目录批量更新 | 稳定 REST 优先；旧 Woo MCP 路径与共享 WP Adapter 认证不能混用；库存/价格与文案分开 |
| ACF | 传统 REST 字段读写；6.8+ 增加模型/内容 Abilities | B2B 产品参数、认证、案例字段 | AI 路线要求 WordPress 6.9+、开启 AI、旧项逐项允许；默认能力权限 manage_options，不能假设普通编辑员可用 |
| Polylang | Pro REST 支持 lang、translations | 翻译、建立语言关联、检查 hreflang | 该 REST 能力是 Pro 专有；生成译文与关联页面分两步 |
| WPML | 已核验 Woo Multilingual 的产品翻译 REST | Woo 产品翻译 | 不据此推导普通文章/页面的统一接口，需单独核验 |
| Gravity Forms | 可启用 REST API，支持应用密码等认证 | 询盘读取与整理的第二个表单适配器 | 先核对配置和用户权限 |
| Contact Form 7 | 大安装量的表单生态 | 已有询盘页面结构检查、表单可用性检查 | 本次未完成远程写入契约核验，优先检测和后台辅助操作 |
| 备份/迁移工具 | 站点级备份和迁移属于独立运维工作流 | 上线前检查备份与恢复准备 | 内容快照不是数据库/媒体/配置的完整备份，暂不做全站自动迁移 |

来源：[WPForms 能力接口](https://wpforms.com/developers/wpforms-rest-api/) · [Rank Math 官方工具](https://rankmath.com/kb/mcp-tools/) · [Yoast REST](https://developer.yoast.com/customization/apis/rest-api/) · [WooCommerce REST](https://developer.woocommerce.com/docs/apis/rest-api/) · [ACF REST](https://www.advancedcustomfields.com/resources/wp-rest-api-integration/)

新增能力交叉核验：[ACF Abilities](https://www.advancedcustomfields.com/resources/abilities-api/) · [Woo MCP 开发者预览](https://developer.woocommerce.com/docs/features/mcp/) · [Polylang Pro REST](https://polylang.pro/documentation/support/developers/rest-api/) · [WPML Woo 翻译](https://wpml.org/documentation/related-projects/woocommerce-multilingual/using-wordpress-rest-api-woocommerce-multilingual/) · [Gravity Forms 认证](https://docs.gravityforms.com/rest-api-v2-authentication/)。ACF 的 Show in REST API 与 Allow AI Access 是两种开关；旧站可继续走传统 REST，无需为普通字段更新强制升级。Rank Math 所读官方教程没有确认统一最低版本，因此由站点工具发现决定启用。

一个有价值的差异：DataForSEO 提供外部搜索/市场证据，WordPress 和 SEO 插件提供站点内实际配置。两者组合才能实现「根据数据提出建议 → 在网站修改 → 核对输出」。没有必要为了获取相同关键词数据让用户再买另一套 SEO 数据服务。

## 5. Skill 与连接器来源如何取舍

| 来源 | 类型 | 取舍 |
| --- | --- | --- |
| WordPress/agent-skills | 官方开发型 Skill 集合 | 优先借鉴 REST、区块、主题、排查的方法；涉及 PHP、文件系统、WP-CLI 的步骤不能直接装入浏览器执行 |
| codeerhq/bricks-skills | Bricks 官方文档链接的配套 Skill 包 | 借鉴页面计划、设计系统复用、元素和媒体关系、前台验证；保持 GPL 来源边界，适配前固定版本 |
| WordPress/mcp-adapter | 站点能力到 MCP 的桥接软件 | 是连接器基础设施，不是内容写作 Skill；只在需要 MCP 传输时引入 |
| WordPress.com MCP | 托管平台官方远程服务 | 作为独立 OAuth 连接模式；不能套用当前自建站应用密码接口 |
| Rank Math / WPForms Abilities | 插件提供的实际动作 | 封装成我们的业务 Skill，共用站点凭据；不是每项能力单独配置一把 API key |

来源：[官方 Skill 仓库](https://github.com/WordPress/agent-skills) · [Bricks Skill 仓库](https://github.com/codeerhq/bricks-skills) · [官方 MCP Adapter](https://github.com/WordPress/mcp-adapter) · [WordPress.com MCP](https://developer.wordpress.com/docs/mcp/)

官方 wp-rest-api Skill 面向开发者，明确包含文件系统、bash/Node 和部分 WP-CLI 工作流。不能因为仓库很知名就把其开发流程放进运营用户的 Skill 列表。[wp-rest-api 原文](https://github.com/WordPress/agent-skills/blob/trunk/skills/wp-rest-api/SKILL.md)

官方仓库当前列出 17 项 Skill，可按下面的方式筛选，保留原名方便后续定位。此表是目录级筛选，不声称逐行审计全部脚本。

| 上游 Skill | 在本项目中的用途 |
| --- | --- |
| wordpress-router、wp-project-triage | 将仓库识别思想改成站点能力识别 |
| wp-rest-api、wp-abilities-api | 连接器与工具 schema 的开发参考 |
| wp-abilities-audit、wp-abilities-verify | 适配开发和验证用，避免把能力描述当执行保证 |
| wp-block-development、wp-block-themes、wpds | 借鉴区块结构、模板和一致性，用于页面 Skill |
| wp-playground、blueprint | 借鉴可重现测试站；Playground 不能代替商业插件真实环境 |
| wp-interactivity-api | 高级交互开发参考，非首批运营功能 |
| wp-plugin-development、wp-plugin-directory-guidelines | 未来如开发站点桥接插件时使用 |
| wp-wpcli-and-ops、wp-performance、wp-phpstan | 留在开发/运维工具，不作为浏览器业务能力 |

来源为上述官方仓库目录；后续实施只选实际依赖项，分别读取原文、固定版本并重新验证。

本轮没有安装或复制这些包。生产接入前应固定 SHA、核对具体文件许可证与 NOTICE。Bricks 仓库标 GPL-2.0，不应直接并入现有 MIT 发布包而省略来源和许可证处理。用户规模大的插件不等于其新 AI 能力已有同等用户规模；没有可核验的 Skill 安装量时不虚构排名。

## 6. 面向我们的产品架构

### 连接方式

自建站继续使用 HTTPS + 应用密码；增加站点能力发现和受控 Abilities HTTP 适配。官方 Abilities 提供 HTTP 发现/执行接口，但只有显式 show_in_rest 的能力可通过 REST 访问，并且需要认证与能力权限检查。因此「安装了插件」不等于「Agent 能调用它」。[Abilities REST 官方契约](https://developer.wordpress.org/apis/abilities-api/rest-api-endpoints/)

WordPress.com 的官方 MCP 使用 OAuth 2.1、PKCE 和动态客户端注册，无需嵌入客户端密钥。它提供明确的 HTTP MCP 端点，架构上适合另做浏览器连接模式；实际 Chrome 回调 URI、令牌刷新、站点范围、传输生命周期和授权仍需联调。[自定义客户端接入](https://developer.wordpress.com/docs/mcp/connect-custom-mcp-client/)

WordPress.com 官方工具目录覆盖内容/媒体写入和页面设计上下文读取；可借鉴先读主题 tokens、patterns、blocks 再组装页面，以及保存后检查内容警告的做法。其服务权限与可用计划以官方配置页为准，不能把 WordPress.com 工具名字当成自建站通用端点。[工具目录](https://developer.wordpress.com/docs/mcp/tools-reference/)

Bricks 官方示例配置使用本地 npx 代理。浏览器内不能执行该命令；要实现 HTTP MCP 客户端或经验证的 Abilities HTTP 调用。遵守 Bricks 实验阶段仅测试站使用的要求，不开放其通用 PHP 执行作为普通运营能力。

### 建议的数据与模块分工（未实施）

1. 站点连接：siteId、地址、认证类型与凭据引用；多站点扩展时任务明确选站。
2. 能力档案：API 根路径、内容类型、编辑器、可用块、插件能力、读取/写入权限、版本与检查时间；证据不足显示未知。
3. 工具适配：原生内容/媒体、Abilities、WooCommerce、构建器分别封装，保持统一任务回执。
4. Skill：只存业务步骤、输入与交付规则、所需能力，不保存凭据。
5. 执行账本：站点/对象/输入摘要、已提交状态、远端 ID、前后快照、失败与结果未知状态；媒体成功、文章失败时可复用媒体继续。
6. 发布验证：API 回读确认持久化；浏览器检查页面实际呈现。两种证据互补，不能互相替代。

当前 wordpress.ts 仅允许 users/me 和 posts，且只支持 GET/JSON POST；writeSeoPost 只有标题、正文、draft/publish 与更新版本检查。新增媒体、pages、taxonomy、插件能力和 MCP 都需要真实代码工作，不能只加 Skill 文本。当前测试连接也只证明认证成功，不证明有全部发布/媒体权限。

### 用户交互

「设置 → 连接器 → WordPress → 选择站点」展示：已连接、可管理内容、可上传媒体、检测到的页面编辑器、表单和 SEO 能力。缺失能力显示明确原因与配置入口。Skill 库按内容运营/页面构建/询盘/站点优化筛选；打开场景后自动选择适配器，而不是要求用户理解 JSON、REST、MCP。

## 7. 建议新增的 14 个细分 Skill

以下都是提案。已有 SEO 文章工作室、内容更新、On-page 等继续复用；不再复制一套同功能 SEO Skill。

| 优先级 | Skill 名称建议 | 具体结果 | 需要补充 |
| --- | --- | --- | --- |
| P0 | WordPress 内容发布 | 文稿、图、分类完整落地并回读 | 媒体/分类/扩展文章字段 |
| P0 | WordPress 媒体管理 | 上传、复用、alt 与特色图 | 二进制与媒体查询/更新 |
| P0 | WordPress 内容盘点 | 已有内容清单、缺失项、更新建议 | 分页列表与覆盖率 |
| P0 | WordPress 页面创建 | 可编辑的原生区块页面草稿 | pages + 区块序列化 |
| P0 | WordPress 页面更新 | 保留布局的局部变更 | 编辑器识别和差异更新 |
| P0 | WordPress 上线检查 | 内容、移动端、链接、图片与状态报告 | API+浏览器联合验证 |
| P1 | 询盘表单搭建 | WPForms 询盘表单与页面嵌入 | Abilities + schema + UI 验证 |
| P1 | 询盘整理与质量分析 | 表单线索清单、缺失信息与跟进草稿 | WPForms/Gravity Forms 条目读取；不自动发送 |
| P1 | 外贸结构化内容管理 | 产品规格、证书、案例字段映射与上传 | ACF 现有模型优先；模型创建另行操作 |
| P1 | WordPress SEO 设置优化 | 已支持配置的检查、差异与回读 | Rank Math；Yoast 先只读 |
| P1 | WooCommerce 产品管理 | 商品草稿、属性、图片与批量结果 | wc/v3 连接适配 |
| P1 | 多语言页面管理 | 译文、语言关系与页面验证 | WPML/Polylang 专属契约 |
| P1 | 内容排期与批量上传 | 日历、分批执行及失败清单 | future、时区、逐项账本 |
| P2 | 模板复用与设计系统检查 | 沿用品牌模板、检查组件与样式一致性 | Elementor 优先，Bricks 测试候选 |

业务顺序建议：文章发布 → 原生页面 → 询盘表单 → 插件 SEO → Elementor 模板 → 商品/多语言。若真实客户以商城为主，将 WooCommerce 前移；若主要是制造业询盘站，表单优先于订单管理。

## 8. 分阶段验收与研究边界

第一阶段：原生内容闭环。使用测试站验证认证、媒体上传/重复检测、分类、草稿、正文图片、特色图、修改冲突、断线恢复、分页与页面编辑器有效性；无效区块不能算完成。

第二阶段：高价值插件。WPForms 验证版本、写开关、字段授权与真实保存；Rank Math 先审核工具范围，不能默认执行会改永久链接/noindex 的一键修复；WooCommerce 使用测试商品验证，不触及真实订单。

第三阶段：构建器与多语言。至少分别准备 Gutenberg、Elementor 与目标插件的真实测试站；单一站点通过不能代表所有主题/商业插件组合。Bricks 只进入实验矩阵。

本轮是研究和方案，没有修改产品代码、购买服务、安装插件或操作用户站点。未实测商业插件版本、真实 OAuth、远程写入与网站访问规模。商业功能以站点实际许可为准，本报告不作价格承诺。

研究方法：先读当前连接器、工具、manifest 和架构，再查官方 REST、插件文档、WordPress.org 目录及官方 Skill/MCP 仓库。发现 Bricks、Rank Math、WPForms 已有新 AI 能力后，针对性复查，修正仅依赖旧 REST 的判断。对 ACF 用户规模、构建器通用写接口等证据不足项保留未知。已覆盖用户三个问题和架构决策所需证据，进一步堆砌小仓库不会改变当前优先级，故停止广泛搜索。

核查基线：主工作区 codex/agent-workspace-sandbox，HEAD 0c69ad5feeb4f05dc8cc0225f8a41fe8728997f1，连接器仍为工作区未提交实现。本文不把研究建议写成已经集成，也不覆盖其他任务的整合状态。
