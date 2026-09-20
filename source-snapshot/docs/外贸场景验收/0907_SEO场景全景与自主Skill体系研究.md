# SEO 场景全景与自主 Skill 体系研究

日期：2026-09-07。对象：外贸独立站运营、内容运营、SEO 服务商及浏览器 AI Agent 产品团队。

## 一、结论与研究范围

建议建立 **6 大分类、18 个面向交付的 Skill**，覆盖下面 **60 个核心场景**；另列 6 个扩展场景。Skill 提供方法，DataForSEO 连接器提供市场与搜索数据，浏览器提供现场证据和操作，任务文件保存可复用的成果。

不要把每个 API 端点做成一个 Skill，也不要将十几个仓库原样搬进用户的技能列表。可以综合多个开源方法，形成我们自己的输入、步骤、证据标准和交付物。按用户最新要求，本轮先完成研究，原型保留，暂不继续扩展功能或发布 GitHub。

本轮核实 **11 个公开仓库、236 个 SEO 及相关 Skill 文件入口，重点审读 20 个源文件**。236 个入口含不同仓库间的重复方法，也含许可证不允许再发布的项目，不能理解为 236 个推荐安装包。详见 [逐项来源清单](0907_SEO开源与公开Skill来源清单.csv)。这是一份有明确检索边界的系统性盘点，不宣称穷尽整个互联网；目录核实与逐行审读分别标注。

检索覆盖 GitHub 仓库元数据、固定提交的 SKILL.md、许可证及 DataForSEO/Google 官方文档。第三方技能目录用于发现，原仓库用于确认。Star 只是 2026-09-07 的受关注程度快照，不是质量认证。

## 二、值得借鉴的来源

| 来源 | 本轮 Star 快照 | 许可与定位 | 重点参考方法 | 对本产品的处理 |
|---|---:|---|---|---|
| [Corey Haines / Marketing Skills](https://github.com/coreyhaines31/marketingskills) | 47,823 | MIT；广泛使用的营销技能库 | SEO audit、content strategy、programmatic SEO、schema、site architecture | 沿用已有适配经验；方法统一，不再复制一个重复 On-page 入口 |
| [AgriciDaniel / Claude SEO](https://github.com/AgriciDaniel/claude-seo) | 16,486 | MIT；SEO 专项套件 | content brief、cluster、technical、schema、backlinks、DataForSEO 扩展 | 重点改编；替换 Python、终端与 MCP 调用；剔除不适用的评分、字数硬规则 |
| [Aaron Marketing Skills](https://github.com/aaron-he-zhu/aaron-marketing-skills) | 2,738 | Apache-2.0；含 SEO/GEO 体系 | keyword research、competitor analysis、content gap、content writer | 重点改编数据证据分层与内容流程；替换其本地记忆/跨包协议 |
| [kostja94 / Marketing Skills](https://github.com/kostja94/marketing-skills) | 958 | GitHub 元数据 MIT；本轮审读 link-building | On-page/technical 细项分类、link-building | 作为场景完整性与外链流程参考；正式复制前审读具体包及许可全文 |
| [RampStack / Claude Skills](https://github.com/rampstackco/claude-skills) | 826 | GitHub 元数据 MIT；本轮审读 seo-offpage | PR、可链接资产、合作关系、目录引用四类外链方法 | 用于外链工作流拆分；不原样导入全部营销库 |
| [OpenClaudia Skills](https://github.com/OpenClaudia/openclaudia-skills) | 680 | MIT；营销执行技能 | semrush-research、write-blog、backlink-audit | 参考端到端流程；Semrush 数据源改为 DataForSEO，专有指标不硬映射 |
| [SE Ranking 官方 SEO Skills](https://github.com/seranking/seo-skills) | 136 | MIT；供应商官方技能库 | backlink-gap、backlinks-profile、technical-audit、content-brief、示例报告 | 很适合参考交付格式和技能边界；将 SE Ranking MCP 换成能力适配层 |
| [Agentic SEO Skills](https://github.com/agencia-conversion/agentic-seo-skills) | 50 | MIT；已有 DataForSEO 导向 | SERP 证据、文章 brief/write/check 流程 | 保留证据链；去掉本地 CLI、强制多 Agent、固定超长文章与发布依赖 |
| [Awesome SEO Skills](https://github.com/screpylabs/awesome-seo-skills) | 2 | MIT；导航目录，没有自己的 SKILL.md | 候选来源发现 | 不作为成熟技能包或质量背书 |
| [Ninryt SEO Analysis Skill](https://github.com/ninryt/seo-analysis-skill) | 0 | GitHub 元数据 MIT；小型工作流索引 | 技术、页面、Schema、多语言等分类 | 仅作覆盖检查，优先度低于已有主来源 |
| [AgriciDaniel / Codex SEO](https://github.com/AgriciDaniel/codex-seo) | 689 | **当前 LICENSE 为专有软件许可** | Codex 宿主工作流边界参考 | **不作为可复制/公开再发布的开源来源** |

已核实的许可原文：[Claude SEO MIT](https://github.com/AgriciDaniel/claude-seo/blob/a1480c7e590b16001bd9dc1627eacdcd44d580f9/LICENSE)、[Aaron Apache-2.0](https://github.com/aaron-he-zhu/aaron-marketing-skills/blob/12caa254edaa774c0c6ea6d128fe2d563748941f/LICENSE)、[SE Ranking MIT](https://github.com/seranking/seo-skills/blob/fd6d1408f2e6a06454d81c07c29e0f04342eb9ba/LICENSE)、[Codex SEO 专有许可](https://github.com/AgriciDaniel/codex-seo/blob/97c59bcdac3c9538bf0e3ae456c1e73aa387f85a/LICENSE)。Aaron 旧 [SEO/GEO 仓库](https://github.com/aaron-he-zhu/seo-geo-claude-skills) 已指向新的营销仓库，不能按旧目录盲目安装。SE Ranking README 的技能数量与当前目录有差异，来源清单以固定提交目录为准。

## 三、我们的能力基线

以下是代码检查结果，不是对未来能力的承诺。

| 层 | 现有能力 | 不能据此宣称具备 |
|---|---|---|
| 浏览器观察 | snapshot、网页正文续读、截图、当前任务标签页导航 | 任意网站全量爬取、绕过登录/验证码、无限后台执行 |
| 页面证据 | inspectPage：title、description、H1–H6、canonical、meta robots、语言、可见正文、链接 rel、图片 alt/尺寸等 | 原始响应头、全站索引状态、完整 JSON-LD/hreflang、全站重复内容；当前 schema 未包含这些专用字段 |
| 网页操作 | click、fill/fillForm、select、按键、回读及授权流程 | 通用 CMS 发布成功保证、邮箱投递与退订管理 |
| 文件与计算 | 版本化文件、CSV 解析、确定性 JavaScript、来源与下载交付 | runJavaScript 中使用 Node/Python/网络；它是无网络同步计算沙箱 |
| Skill | 按需加载说明、读取包内参考、场景元数据、导入导出 | SKILL.md 自动赋予 API/脚本执行权限 |
| DataForSEO 原型 | 集中凭据配置；7 类查询：关键词指标、扩词、SERP、域名概况、排名词、竞品、词缺口 | 已验收真实账户、Backlinks、云爬虫、历史监测、移动 SERP、GSC 或 CMS |

代码依据：`src/agent/tools.ts`、`src/agent/files/runtime.ts`、`src/browser/page-inspection.ts`、`src/agent/skills/runtime.ts`、`src/agent/connections/dataforseo.ts`、`src/agent/connections/seo-tools.ts`。

下面使用三个就绪标签：**已有基础**＝浏览器/文件能力已存在；**原型**＝本轮代码已接但未完成专门验收；**待扩展**＝还需新的工具/API/任务生命周期。标签描述实现状态，不是推荐优先级。

## 四、60 个核心场景

### A. 竞争对手调研与数据分析

参考：[Aaron competitor-analysis](https://github.com/aaron-he-zhu/aaron-marketing-skills/tree/12caa254edaa774c0c6ea6d128fe2d563748941f/seo-geo/survey/competitor-analysis)、[SE Ranking competitor-gap](https://github.com/seranking/seo-skills/tree/fd6d1408f2e6a06454d81c07c29e0f04342eb9ba/skills/seo-competitor-gap-analysis)、[OpenClaudia semrush-research](https://github.com/OpenClaudia/openclaudia-skills/tree/221b37d7ab95c14d5343c7b24fd9f9367a3fb400/skills/semrush-research)。

| ID | 用户场景 | DataForSEO 数据 | 浏览器/计算动作 | 交付物 | 建议 Skill | 状态与关键限制 |
|---|---|---|---|---|---|---|
| A01 | 不知道真正的 Google 竞争对手 | Labs Competitors Domain | 访问候选官网判断同行/内容站/目录 | 分层竞品名单 | 竞品与域名分析 | 原型；搜索竞争者不一定是业务同行 |
| A02 | 对比自家与三个同行的 SEO 体量 | Domain Rank Overview | 固定相同市场、语言做对比 | 域名对比报告 | 竞品与域名分析 | 原型；估算流量不是真实访问 |
| A03 | 找竞品最有价值的排名词 | Ranked Keywords | 分类采购意图，核实排名 URL | 竞品关键词 CSV | 竞品与域名分析 | 原型；有界样本非全库 |
| A04 | 找竞品最强的内容和产品页 | Relevant Pages；排名词辅助 | 浏览代表页、比较页面用途 | 竞品页面机会表 | 竞品与域名分析 | 待扩展 Relevant Pages；不能从少量词推断全站 Top Pages |
| A05 | 找竞品有排名但我们没有的词 | Labs Domain Intersection | 核对我们是否已有对应内容 | 排名缺口表 | 竞争与内容缺口 | 原型；未排名与没写过是两回事 |
| A06 | 看当前主词为什么由某类页面占据 | SERP Advanced | 读实际排名页面结构与信息 | SERP 页面类型报告 | 竞争与内容缺口 | 原型；页面内容需现场读取 |
| A07 | 进入新国家前比较竞争强度 | 多市场关键词/域名数据 | 按市场对比产品相关性与页面形式 | 市场优先级建议 | 竞品与域名分析 | 原型组合；不可跨市场直接相加重叠流量 |
| A08 | 跟踪竞品一个月新增/下降的主题 | Historical Rank Overview / Ranked 数据快照 | 对同口径快照做差异 | 变化报告 | SEO 数据复盘 | 待扩展历史端点或持久快照 |
| A09 | 诊断自家自然流量为什么下降 | DataForSEO 排名历史；另需 GSC/GA4 | 对齐日期、页面、搜索需求与站点修改 | 原因假设与验证表 | SEO 数据复盘 | 待扩展；估算排名不能独自证明因果 |
| A10 | 自动生成周期性 SEO 客户报告 | 多端点＋历史结果 | 计算变化、关联任务与成果 | 周报/月报 | SEO 数据复盘 | 手动按需可规划；后台定时、提醒和预算尚缺 |

### B. SEO 文章自动化生成

参考：[Claude SEO content-brief](https://github.com/AgriciDaniel/claude-seo/tree/a1480c7e590b16001bd9dc1627eacdcd44d580f9/skills/seo-content-brief)、[Aaron content-writer](https://github.com/aaron-he-zhu/aaron-marketing-skills/tree/12caa254edaa774c0c6ea6d128fe2d563748941f/seo-geo/implement/content-writer)、[OpenClaudia write-blog](https://github.com/OpenClaudia/openclaudia-skills/tree/221b37d7ab95c14d5343c7b24fd9f9367a3fb400/skills/write-blog)、[Agentic content-seo](https://github.com/agencia-conversion/agentic-seo-skills/tree/a45ab262e6f9de1b773786b57773f15376a26859/skills/content-seo)。

| ID | 用户场景 | DataForSEO 数据 | 浏览器/计算动作 | 交付物 | 建议 Skill | 状态与关键限制 |
|---|---|---|---|---|---|---|
| B01 | 输入关键词生成完整文章 | Keyword Overview＋SERP | 读品牌资料与代表性来源、写作自检 | 正文＋元信息＋来源 | SEO 文章工作室 | 原型；不能只交提纲冒充全文 |
| B02 | 根据企业数据写行业研究文章 | 需求词和 SERP 辅助 | 解析原始 CSV、计算口径、组织结论 | 数据文章与方法说明 | SEO 文章工作室 | 原型；搜索量不是行业销量 |
| B03 | 给写手一份可直接执行的简报 | 关键词指标＋SERP | 读前三代表页、核对产品能力 | brief＋outline | SEO 文章工作室 | 原型；简报是工作室的一种模式 |
| B04 | 做采购商选型/应用指南 | 产品/应用词与结果类型 | 读取真实规格、应用限制和采购问题 | 选型文章＋对比表 | SEO 文章工作室 | 原型组合；认证、测试数据必须有证据 |
| B05 | 写 X vs Y、替代品与对比文章 | 对比词指标＋SERP | 相同配置与口径查证双方产品 | 对比页草稿 | SEO 文章工作室 | 已有基础＋原型；不能捏造竞品缺点 |
| B06 | 生成产品分类页或解决方案页 | 交易意图词＋SERP | 读实际产品线与栏目，组织商业页 | 分类页/方案页文案 | SEO 文章工作室 | 已有基础＋原型；沿用 B2B 文案能力 |
| B07 | 把旧文章更新到当前意图 | 当前关键词/SERP；历史可选 | 原文保留/更新/删除逐项对照 | 更新稿＋修改记录 | 内容更新与质量检查 | 原型；没有历史不称为“流量衰退诊断” |
| B08 | 检查 AI 文章事实、重复与信息价值 | SERP 辅助，不是事实真源 | 逐项核查引用与企业事实 | 内容 QA 清单＋修订稿 | 内容更新与质量检查 | 已有基础；没有全网查重 API 不称为全网原创认证 |
| B09 | 从关键词/缺口生成三个月内容计划 | 扩词、缺口、指标 | 关联现有页面、产能与业务优先级 | 内容日历＋简报队列 | 内容计划与本地化 | 原型组合；日期与产能由用户目标决定 |
| B10 | 同一产品适配不同语言市场文章 | 各市场关键词/SERP | 术语本地化、单位和案例复核 | 多语言稿＋词表 | 内容计划与本地化 | 原型组合；不能仅机器翻译就称完成当地 SEO |

文章生成由现有模型执行，DataForSEO 负责研究数据。文章批量化应围绕真实内容价值；Google 明确指出，没有增量价值的大量自动生成页面可能违反 scaled content abuse 政策。[Google 生成式内容指南](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content)

### C. 关键词调研自动化

参考：[Aaron keyword-research](https://github.com/aaron-he-zhu/aaron-marketing-skills/tree/12caa254edaa774c0c6ea6d128fe2d563748941f/seo-geo/survey/keyword-research)、[Claude SEO cluster](https://github.com/AgriciDaniel/claude-seo/tree/a1480c7e590b16001bd9dc1627eacdcd44d580f9/skills/seo-cluster)、[SE Ranking keyword-cluster](https://github.com/seranking/seo-skills/tree/fd6d1408f2e6a06454d81c07c29e0f04342eb9ba/skills/seo-keyword-cluster)。

| ID | 用户场景 | DataForSEO 数据 | 浏览器/计算动作 | 交付物 | 建议 Skill | 状态与关键限制 |
|---|---|---|---|---|---|---|
| C01 | 产品种子词自动扩展 | Keyword Ideas；Related/Suggestions 可补充 | 产品同义词、材料/规格/应用归类 | 扩词表 | 关键词研究 | Ideas 原型；其他端点待扩展 |
| C02 | 批量校验现有词表的量与难度 | Keyword Overview | 保留词表记录、缺失项、时间 | 指标补全 CSV | 关键词研究 | 原型最多20词/次；大批量需批次与预算设计 |
| C03 | 找 supplier/manufacturer/wholesale 等采购词 | Ideas＋Overview | 识别采购对象与不相关零售词 | B2B 机会词表 | 关键词研究 | 原型；不要用广告竞争度冒充 SEO 难度 |
| C04 | 看词是适合博客还是产品页 | SERP＋可用意图字段 | 分类搜索结果页面与用户目的 | 意图/页面类型表 | 搜索意图与 SERP | 原型；意图推断标为分析 |
| C05 | 分析搜索量季节性和趋势 | monthly_searches；历史关键词/Trends | 按实际月份做时间序列 | 季节性与发布时间建议 | 关键词研究 | 指标中的月度数据可用；额外趋势端点待扩展 |
| C06 | 从竞品网址反向找词 | Ranked Keywords / Keywords For Site | 排除竞品品牌词、匹配自身产品 | 反向关键词表 | 关键词研究 | Ranked 原型；Keywords For Site 待扩展 |
| C07 | 找问句、长尾和用户困惑 | SERP 中实际 PAA；扩词 | 保留实际问句来源并分组 | 问题库 | 搜索意图与 SERP | 原型；PAA 未返回不能补造“Google 问题” |
| C08 | 自动把词聚成主题组 | SERP＋关键词指标 | URL 重叠计算＋语义辅助 | 聚类表 | 主题聚类与页面映射 | 原型；语义分组不能称为已验证 SERP 聚类 |
| C09 | 避免几个页面抢同一词 | 多页排名词/页面清单 | 意图重叠与 URL 对照 | 关键词蚕食候选与合并建议 | 主题聚类与页面映射 | 部分基础；确证需足够页面/历史证据 |
| C10 | 把关键词映射到实际网站结构 | 聚类、词缺口 | 核对现有页面、规划父子页和内链 | 关键词—页面地图 | 主题聚类与页面映射 | 已有基础＋原型；拟建 URL 与现有 URL 分开 |

### D. 自动化外链

参考：[SE Ranking backlink-gap](https://github.com/seranking/seo-skills/tree/fd6d1408f2e6a06454d81c07c29e0f04342eb9ba/skills/seo-backlink-gap)、[backlinks-profile](https://github.com/seranking/seo-skills/tree/fd6d1408f2e6a06454d81c07c29e0f04342eb9ba/skills/seo-backlinks-profile)、[Claude SEO backlinks](https://github.com/AgriciDaniel/claude-seo/tree/a1480c7e590b16001bd9dc1627eacdcd44d580f9/skills/seo-backlinks)、[RampStack offpage](https://github.com/rampstackco/claude-skills/tree/a67dd34c609f034c0cfd736a348659bbdf1605bf/skills/seo-offpage)。

| ID | 用户场景 | DataForSEO 数据 | 浏览器/计算动作 | 交付物 | 建议 Skill | 状态与关键限制 |
|---|---|---|---|---|---|---|
| D01 | 审计自己当前外链结构 | Backlinks Summary、Referring Domains、Anchors | 去重、域/页分开统计、抽样核实 | 外链画像报告 | 外链画像与变化 | 待扩展 Backlinks；不能假定配置后所有产品权限都可用 |
| D02 | 找同时链接多个同行而没链接我们的站 | Backlinks Domain/Page Intersection | 核实行业相关性和实际引用页 | 外链机会 CSV | 外链机会发现 | 待扩展；不同于 Labs 关键词 intersection |
| D03 | 找竞品页面背后的具体引用来源 | Backlinks 列表 | 打开来源页确认上下文、锚文本与目标 | 来源页与切入点清单 | 外链机会发现 | 待扩展＋浏览器核验 |
| D04 | 找资源页、行业协会、展会与目录机会 | SERP；可结合 Backlinks | 阅读收录要求、行业范围、付费属性 | 可申请目录/资源表 | 外链机会发现 | 普通 SERP 原型；高级搜索运算符当前原型禁用，需专门费用提示 |
| D05 | 找损坏链接并提供真实替代资源 | Backlinks broken 数据＋页面状态检查 | 核实来源页和死链、比较我方替代内容 | Broken-link 机会表 | 外链机会发现 | 待扩展；页面暂时不可访问不等于永久死链 |
| D06 | 找品牌被提到但没有链接的机会 | Content Analysis 搜索＋页面核验 | 区分同名品牌，检查是否已有目标链接 | 未链接提及清单 | 外链机会发现 | 待扩展；品牌提及不保证值得联系 |
| D07 | 找编辑或站点负责人并准备联系 | API 给来源域；联系人来自官网 | 读 About/Contact/投稿规则，记录公开信息 | 联系人证据与个性化邮件草稿 | 外链联系与跟进 | 草稿已有基础；DataForSEO 不是邮箱验证服务 |
| D08 | 发送、安排跟进并记录回复 | DataForSEO 不提供投递 | 邮箱连接器或经验证的邮件网页操作 | 发送回执、跟进任务、回复状态 | 外链联系与跟进 | 待扩展邮箱/队列；需用户授权具体发送，不能把草稿当投递 |
| D09 | 发现丢失外链、恢复机会并复查上线 | Backlinks 时间序列/列表；现场页 | 对快照、检查目标 href 与 rel | 丢失/新增报告与实际链接证据 | 外链画像与变化 | 待扩展；“已发送”不等于“已获得链接” |
| D10 | 做值得被引用的研究、工具或行业资料 | 关键词/SERP 指导需求 | 从真实数据生成选题和资产简报 | 可链接资产计划＋传播草稿 | 外链联系与跟进 | 内容基础可用；交互工具开发/托管是独立能力 |

**建议的外链流程：** 候选发现 → 相关性与现场核实 → 我方资源价值匹配 → 公开联系人确认 → 个性化草稿 → 授权发送 → 回复跟进 → 链接上线复查。数据筛选与起草可以较高程度自动化；发信依赖邮箱能力，对方是否建立链接无法由我们保证。

不把批量论坛灌水、自动造账号发链接、链接农场、机械买卖排名链接做成默认产品方向。Google 将主要为操纵排名而创建的链接列为 link spam。应服务真实引用与合作，而不是以“自动获得多少外链”作为保证。[Google 链接垃圾政策](https://developers.google.com/search/docs/essentials/spam-policies#link-spam)

### E. On-page SEO 分析

参考：[Claude SEO page/schema/images](https://github.com/AgriciDaniel/claude-seo/tree/a1480c7e590b16001bd9dc1627eacdcd44d580f9/skills)、[Aaron on-page-seo-checker](https://github.com/aaron-he-zhu/aaron-marketing-skills/tree/12caa254edaa774c0c6ea6d128fe2d563748941f/seo-geo/tune/on-page-seo-checker)、[Corey SEO audit](https://github.com/coreyhaines31/marketingskills/tree/5b2c0007766c6a1cf1d53fd8fc73e979e0821022/skills/seo-audit)。

| ID | 用户场景 | DataForSEO 数据 | 浏览器/计算动作 | 交付物 | 建议 Skill | 状态与关键限制 |
|---|---|---|---|---|---|---|
| E01 | 当前页一键 On-page 检查 | 非必需；关键词/SERP 可增强 | inspectPage 提取实际字段 | 原值—问题—建议—证据 | 页面 SEO 检查 | 已有基础；无 API 也应可用 |
| E02 | 优化 title、description 与 H1 | SERP 页面类型、关键词 | 比较原值与搜索意图 | 建议文案及理由 | 页面 SEO 检查 | 已有基础；字符范围是建议而非排名硬规则 |
| E03 | 查正文是否回答采购问题 | SERP＋用户产品事实 | 阅读规格、选型、交付与询盘信息 | 内容缺口与修改稿 | 页面 SEO 检查 | 已有基础＋原型 |
| E04 | 查图片 alt、尺寸和内容相关性 | 通常无需 API | inspectPage＋截图核对图片用途 | 图片修改表 | 页面 SEO 检查 | 已有基础；空装饰 alt 与缺失 alt 区分 |
| E05 | 找一篇文章可加入的真实内链 | 关键词/页面数据可辅助 | 对实际站点页面与语境 | 内链锚文本建议 | 内链与页面结构 | 已有基础；链接存在不代表可抓取/可收录 |
| E06 | 查孤立页面和站点层级过深 | OnPage Crawl Links | 计算站点图并对照 sitemap/内容清单 | 孤立页/深度报告 | 内链与页面结构 | 待扩展全站图；单页不能证明孤立 |
| E07 | 检查 Product/Article 等 Schema | OnPage Microdata 可辅助 | 需扩充本地 JSON-LD/Microdata 读取 | 结构化数据问题表 | 结构化数据检查 | 待扩展专用提取；当前 inspectPage 不提供完整 Schema |
| E08 | 根据真实产品信息生成 JSON-LD | 非必需 | 对照可见内容和支持字段生成 | JSON-LD 草稿＋验证步骤 | 结构化数据检查 | 生成草稿可做；不能把语法正确称为 Google 展示保证 |
| E09 | 检查 canonical、meta robots 与页面语言 | 本地 DOM；云抓取可对照 | 读取实际属性，标注矛盾 | 页面索引指令清单 | 页面 SEO 检查 | 已有基础；Google 选定 canonical 需另一证据来源 |
| E10 | 把修改建议落到页面并复查 | 通常无需新 API | 批注定位；适配 CMS 后填写保存并回读 | 批注＋修改前后证据 | 页面 SEO 检查 | 批注已有；CMS 保存/发布需专门适配和真实回执 |

### F. 技术 SEO 分析

参考：[Claude SEO technical](https://github.com/AgriciDaniel/claude-seo/tree/a1480c7e590b16001bd9dc1627eacdcd44d580f9/skills/seo-technical)、[SE Ranking technical-audit](https://github.com/seranking/seo-skills/tree/fd6d1408f2e6a06454d81c07c29e0f04342eb9ba/skills/seo-technical-audit)、[DataForSEO OnPage](https://docs.dataforseo.com/v3/on_page/task_post/)。

| ID | 用户场景 | DataForSEO/其他数据 | 浏览器/计算动作 | 交付物 | 建议 Skill | 状态与关键限制 |
|---|---|---|---|---|---|---|
| F01 | 按限定页数跑全站技术体检 | OnPage Task POST → Summary/Pages | 选择采样页现场复核 | 技术问题 CSV＋优先级报告 | 技术 SEO 审计 | 待扩展异步任务、分页、停止与恢复 |
| F02 | 检查 robots.txt 和 sitemap | 云爬虫＋受控 HTTP 资源读取 | 解析 sitemap/robots、核查 URL 范围 | 抓取规则与 sitemap 问题 | 技术 SEO 审计 | 待扩展资源读取；能打开网页不代表已解析全部规则 |
| F03 | 排查 404、重定向链、响应头禁索引 | OnPage Pages/Redirect Chains；HTTP 头 | 验证状态码、跳转目标和头信息 | 坏链与重定向清单 | 技术 SEO 审计 | 待扩展；渲染页面外观不能证明 HTTP 200 |
| F04 | 找全站重复标题、描述和正文 | Duplicate Tags/Content | 以实际抓取覆盖计算重复组 | 重复页面组与合并建议 | 技术 SEO 审计 | 待扩展；模板重复不一定是有害重复 |
| F05 | 排查 canonical 冲突、参数页与多版本 URL | OnPage 页面数据＋站点图 | 对照 HTTP/DOM/内部链接指向 | URL 规范化建议 | 技术 SEO 审计 | 单页部分已有；全站待扩展 |
| F06 | 看 JS 渲染前后是否丢内容或改指令 | 原始 HTTP＋启用 JS 的云抓取 | 对照本地渲染 DOM 与原始内容 | 渲染差异证据 | 技术 SEO 审计 | 待扩展；云爬虫开启 JS 会增加费用 |
| F07 | 检查多语言 hreflang 与回链 | 多页属性、sitemap、状态码 | 验证语言区域代码、互链与 canonical | 多语言问题表 | 国际 SEO 检查 | 待扩展 hreflang 与跨页图；不能靠翻译质量替代 |
| F08 | 检查速度、移动端与 CWV | OnPage/Lighthouse 实验室；CrUX 现场数据 | 截图、瓶颈归因、区分数据来源 | 性能报告与开发清单 | 性能与体验诊断 | 待扩展；实验室分数不等于真实用户 CWV |
| F09 | 确认页面在 Google 的索引状态 | GSC URL Inspection，需站点权限 | 对照用户拥有的站点与选定 canonical | 索引检查记录 | 技术 SEO 审计 | 待扩展 GSC 连接器；DataForSEO 搜索结果不能替代 |
| F10 | 改版/迁移前后自动对照 | 迁移前后爬虫/排名快照＋URL 映射 | 核查跳转、链接、canonical、内容保留 | 迁移验收报告 | 技术 SEO 审计 | 待扩展持久快照；不能从单次审计宣称迁移成功 |

## 五、六个扩展方向

| ID | 场景 | 与核心体系关系 | 额外能力 | 建议 |
|---|---|---|---|---|
| X01 | 本地 SEO / Google Maps 排名与商家资料 | 和已有地图找客相邻，但任务目标不同 | 地点级 SERP/地图数据、商家资料核验 | 单独研究，别与找客户 Skill 混名 |
| X02 | 电商产品、分类、筛选参数 SEO | 内容工作室＋技术审计的行业模板 | 商品数据、变体和参数页规则 | 优先作为外贸产品场景模板 |
| X03 | 图片/视频搜索优化 | On-page 的媒体模式 | 视频结构化信息、实际媒体数据 | 先从已有图片证据做起 |
| X04 | GEO / AI 搜索可见性 | 不等同于传统自然排名 | DataForSEO AI Optimization 等独立数据产品 | 后续评估覆盖与费用，不用 SERP 分数冒充 AI 引用 |
| X05 | 程序化 SEO 页面批量生产 | 内容地图＋模板＋CMS 队列 | 独有数据、内容差异检查、发布与回滚 | 放后期；模板替换国家名不构成内容价值 |
| X06 | SEO 与询盘/收入归因 | SEO 数据复盘的业务延伸 | GA4/GSC/CRM、统一客户与转化口径 | 价值高但不是 DataForSEO 一个连接器能完成 |

## 六、DataForSEO 到底负责哪些能力

| 能力模块 | 具体接口/官方资料 | 支持哪些场景 | 当前状态与口径 |
|---|---|---|---|
| 账户与市场 | [Authentication](https://docs.dataforseo.com/v3/auth/)、[User Data](https://docs.dataforseo.com/v3/appendix/user_data/)、[Locations/Languages](https://docs.dataforseo.com/v3/dataforseo_labs/locations_and_languages/) | 共享连接、市场选择 | 原型；API Login/Password；账户与市场查询官方标为不收费 |
| 关键词指标 | [Keyword Overview](https://docs.dataforseo.com/v3/dataforseo_labs/google/keyword_overview/live/) | C02/C03、文章研究 | 原型；量、CPC、付费竞争、意图等按实际返回；未收录到数据库的词可能省略 |
| 关键词发现 | [Keyword Ideas](https://docs.dataforseo.com/v3/dataforseo_labs/google/keyword_ideas/live/) | C01/C03/C07 | 原型；Related/Suggestions/Keywords For Site 可按缺口另加 |
| SERP | [Google Organic Advanced](https://docs.dataforseo.com/v3/serp/google/organic/live/advanced/) | A06、B、C04/C07/C08 | 原型固定桌面前十；高级运算符可能加价，不当普通请求处理 |
| 域名表现 | [Domain Rank Overview](https://docs.dataforseo.com/v3/dataforseo_labs/google/domain_rank_overview/live/)、[Ranked Keywords](https://docs.dataforseo.com/v3/dataforseo_labs/google/ranked_keywords/live/) | A02/A03/A07/C06 | 原型；仅所选市场和实际查询覆盖；etv 是估算 |
| 竞品与词差距 | [Competitors Domain](https://docs.dataforseo.com/v3/dataforseo_labs/google/competitors_domain/live/)、[Labs Domain Intersection](https://docs.dataforseo.com/v3/dataforseo_labs/google/domain_intersection/live/) | A01/A05、内容缺口 | 原型；词缺口方向为竞品有而我方无 |
| 外链画像 | [Summary](https://docs.dataforseo.com/v3/backlinks/summary/live/)、[Backlinks](https://docs.dataforseo.com/v3/backlinks/backlinks/live/) | D01/D03/D05/D09 | 待接入；引用域、链接与锚文本分开，不混用 Semrush/SE Ranking 的专有权威分数 |
| 外链机会交集 | [Backlinks Domain Intersection](https://docs.dataforseo.com/v3/backlinks-domain_intersection-live/)、[Page Intersection](https://docs.dataforseo.com/v3/backlinks-page_intersection-live/) | D02 | 待接入；和 Labs 的关键词交集是不同模块 |
| 单页云检查 | [Instant Pages](https://docs.dataforseo.com/v3/on_page/instant_pages/) | E、F03/F06 | 待接入；云观察和用户浏览器现场要分别保存；JS 为可加价选项 |
| 全站云爬虫 | [Task POST](https://docs.dataforseo.com/v3/on_page/task_post/)、[Summary](https://docs.dataforseo.com/v3/on_page/summary/)、[Duplicate Tags](https://docs.dataforseo.com/v3/on_page/duplicate_tags/)、[Duplicate Content](https://docs.dataforseo.com/v3/on_page/duplicate_content/) | E06、F01–F07 | 待接入；异步 task ID、页数范围、轮询、分页与费用需要独立生命周期 |
| 网络内容发现 | [Content Analysis Search](https://docs.dataforseo.com/v3/content_analysis/search/live/) | D06、文章资料候选 | 待接入；不是邮箱数据库，也不是所有文章事实的最终依据 |
| 真实索引/CWV | [GSC URL Inspection](https://developers.google.com/webmaster-tools/v1/urlInspection.index/inspect)、[PageSpeed Insights](https://developers.google.com/speed/docs/insights/v5/about) | F08/F09 | 需要 Google 数据能力；不能用 DataForSEO 估算冒充 |

不统一写死价格。官方 [Backlinks 定价](https://dataforseo.com/pricing/backlinks/backlinks) 页面本轮可访问，但网页提取未可靠显示完整价目，不采用网上流传的最低消费数字。接入前按实际账户权限与最新价格核验。连接成功仅说明账户接口可访问，不保证每个数据产品的余额、权限和返回覆盖。

## 七、推荐的 18 个自有 Skill

场景是用户要做的工作，Skill 是稳定交付合同。同一个 Skill 可有几种模式。例如“根据数据写文章”和“根据关键词写文章”建议统一在文章工作室，避免当前两个原型入口重复。

| 一级分类 | 自有 Skill（建议名） | 稳定交付 | 对现有原型的调整 |
|---|---|---|---|
| 竞争分析 | 竞品与域名分析 `seo-competitor-analysis` | 域名/页面/关键词对比报告 | 合并域名分析与竞品研究的共享步骤 |
| 竞争分析 | 竞争与内容缺口 `seo-content-gap` | 缺口表＋内容动作 | 保留缺口原型，区分排名与内容缺口 |
| 竞争分析 | SEO 数据复盘 `seo-performance-review` | 同口径变化报告 | 新增；历史/真实站点数据按能力启用 |
| 内容生产 | SEO 文章工作室 `seo-content-studio` | brief / outline / article＋sources | 合并两个写作入口和简报，三种明确模式 |
| 内容生产 | 内容更新与质量检查 `seo-content-refresh` | 修订稿＋修改记录 | 扩充现有更新原型 |
| 内容生产 | 内容计划与本地化 `seo-content-plan` | 内容日历＋市场词表 | 新增工作流，复用研究数据 |
| 关键词 | 关键词研究 `seo-keyword-research` | 有来源的指标与机会表 | 保留并完善批次与口径 |
| 关键词 | 搜索意图与 SERP `seo-serp-analysis` | 搜索样本与页面规划 | 保留原型，页面证据增强 |
| 关键词 | 主题聚类与页面映射 `seo-topic-clusters` | 聚类与真实/拟建页面地图 | 保留原型，增加可复核聚类计算 |
| 外链 | 外链画像与变化 `seo-backlink-audit` | 外链分布及新增/丢失 | 新增 Backlinks 接入 |
| 外链 | 外链机会发现 `seo-link-prospecting` | 核实过的来源页和切入点 | 新增；第一批外链重点 |
| 外链 | 外链联系与跟进 `seo-link-outreach` | 草稿、联系状态、上线证据 | 起草先做，发送与调度后做 |
| 页面优化 | 页面 SEO 检查 `on-page-seo` | 原值/问题/建议/证据/复查 | 保留已有，不强制依赖付费 API |
| 页面优化 | 内链与页面结构 `seo-internal-links` | 内链建议与站点结构问题 | 小范围浏览先支持；全站依赖爬虫 |
| 页面优化 | 结构化数据检查 `seo-schema` | 检查报告或 JSON-LD 草稿 | 新增固定提取能力后验收 |
| 技术审计 | 技术 SEO 审计 `technical-seo` | 有覆盖范围的技术问题表 | 将旧“技术＋搜索研究”中的 SERP 分给专门技能 |
| 技术审计 | 国际 SEO 检查 `seo-international` | hreflang/区域版本问题表 | 新增跨页证据 |
| 技术审计 | 性能与体验诊断 `seo-performance` | 实验室/现场数据分离的修复清单 | 新增性能数据能力 |

前端仍在现有“SEO 优化”分类下提供六类筛选/标签，不必立刻增加六套顶级设置页面。列表展示任务结果；详情展示输入、输出、依赖连接器和当前可执行范围。页面检查无需连接器时可以直接开始；遇到确实依赖的数据再引导配置。

## 八、适配架构与需要补齐的工程能力

```text
用户场景与资料
  → Skill：方法、模式、范围、交付合同
  → 工具适配：SEO 查询 / 页面检查 / 文件计算 / 授权操作
      → DataForSEO 连接器：账户与凭据、固定 API、权限与费用
      → 浏览器：当前任务页面观察与操作
  → 版本化证据与成果
  → 文章 / CSV / 审计报告 / 批注 / 复查
```

MCP 是工具连接协议，不是与 Semrush 并列的数据供应商。上游写 `mcp__...` 时要映射它实际提供的数据能力；上游要求 Python 时将确定性逻辑改为插件实现或受限工作区计算。不能仅替换提示词里的 API 名称。

必须补齐的共用部分：

1. **能力声明。** 连接器配置与技能依赖分离；进一步区分 labs、serp、backlinks、onpage 等可用能力。UI 的“已连接”不等于所有能力已验收。
2. **查询与费用合同。** 每项记录国家/语言/设备/深度/数量，区分免费验证与付费查询；展示费用来源，避免假预算。对异步爬虫记录 task ID、已知支出、未知提交和停止方式。
3. **证据模型。** 至少记录 provider、endpoint、request、市场/时间、task ID、费用、数据版本、已读取/总量与缺失原因。页面证据另带 URL、定位与采集范围；不要只保留模型总结。
4. **标准字段。** 内部使用有明确定义的 keyword、searchVolume、organicDifficulty、paidCompetition、estimatedTraffic 等字段，同时保存原始字段与供应商。没有相同定义的指标不强行映射。
5. **分页和恢复。** 保存查询检查点、同任务结果复用、过期策略和用户主动刷新；网络结果未知不自动重复计费。全站审计不是一个同步 fetch。
6. **页面检查扩展。** 加入专用 JSON-LD/hreflang 提取与受控原始响应读取。当前 DOM 检查不执行第三方代码。CMS 应按平台做保存/发布/回读的适配。
7. **外联与调度。** 邮箱连接器、发送记录、退订/停止联系状态、幂等、跟进时间和结果核查。通用网页点击不能代替这些业务状态。
8. **可验收样例。** 每个 Skill 有匿名化输入、预期结果与失败样例：无数据、空值、跨市场比较、截断、API 错误、付费结果未知、资料缺失等。

## 九、落地顺序

| 阶段 | 做什么 | 完成标准 |
|---|---|---|
| 研究定型（当前） | 60 个核心场景、来源清单、18 个自有 Skill 合同 | 六类不遗漏，能力/限制/许可明确；不把原型当完成 |
| 首批可用 | 关键词→SERP→文章；域名→竞品→缺口；已有 On-page | 真正从 API 数据到可下载成果，每个链路有失败/恢复验证 |
| 外链闭环前半程 | 外链画像→机会→官网核实→联系草稿 | 每条候选有实际引用页、相关性与联系依据 |
| 技术审计 | 单页增强→有界全站任务→多语言/性能 | task 生命周期、覆盖和报告可复核，不混淆实验室/现场数据 |
| 外联、监测与发布 | 邮件/后台任务/CMS 适配 | 具备授权、回执、恢复与停止机制后再开放 |
| 公开仓库 | 发布自有 Skill 源码、许可、适配文档、匿名示例 | 独立安装/导出验证通过；不包含凭据或用户数据 |

## 十、GitHub 公开发布规划

已核实当前项目 origin：`jackzhang1314/page-notes-browser-agent`。最终可以在该仓库维护规范化技能目录并构建公开发布包，或拆独立技能仓库；本轮研究不擅自创建新仓库、改变仓库可见性或推送整个工作区。

建议发布结构（规划，尚未创建）：

```text
seo-skills/
  README.md
  THIRD_PARTY_NOTICES.md
  licenses/
  skills/<skill-name>/
    SKILL.md
    skill.json
    references/
  connectors/dataforseo/README.md
  adapters/browser-agent/README.md
  examples/<scenario>/
  tests/fixtures/
```

以一份标准源文件生成插件内置包和公开 ZIP，避免“前端包”和“GitHub 包”长期手工维护两份。公开包中说明宿主工具合同：SKILL.md 可阅读不代表脱离本插件就能执行；不要宣称无需适配即可在 Codex/Claude/其他浏览器运行。

保留每个上游来源、固定提交、许可与修改说明；复制 Apache-2.0/MIT 内容时保留要求的声明，不将所有内容简单覆盖成单一自有许可。仓库公开不意味着 DataForSEO 数据可任意再分发，示例使用明确标为模拟的匿名数据。发布前再核对账户数据使用条件；不把真实客户资料、查询缓存或 token 放进仓库。

## 十一、本轮状态与尚未完成的工作

本轮前半段按上一条实施要求写入 DataForSEO 共享连接器和 10 个 SEO Skill 原型，随后按用户最新要求切换为完整场景研究。原型通过了 `npm run typecheck`、`npm run lint` 和现有相关测试 **7 文件、70 用例**；这些是兼容性回归，**不是新增 DataForSEO 行为的完整验收**。

尚未完成：DataForSEO 专门的错误/账户切换/重复计费/文件恢复测试、真实账户验证、前端浏览器完整验收、18 个最终 Skill 的重组、Backlinks/OnPage 接入及 GitHub 发布。未调用真实付费查询。当前预览可能仍使用上一轮构建，不代表已展示本轮原型。

研究的停止依据：六大类均已有可追溯参考、API 与浏览器能力映射；核心争议（公开≠开源、MCP≠供应商、外链发现≠获得外链、DOM≠全站审计）已厘清。尚未逐行审读的候选保留在 CSV，具体实现选中时再审读依赖/许可/测试，不进行重复安装。
