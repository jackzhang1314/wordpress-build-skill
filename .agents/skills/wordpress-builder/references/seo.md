# B2B 新站：Google 抓取与 SEO 工程规范

适用于网站规划、公开页面生成和发布验收。SEO 是页面输出和内容质量的约束，不用主题类别或插件安装成功替代验证。以下是本项目实施标准；不意味着每一项都是 Google 排名因素。资料核对：2026-09-20。规划与内容可信度先看 [search-quality.md](search-quality.md)，本页负责工程实现。

## 渲染与链接

- 默认 WordPress 服务端 HTML。初始响应应包含该页核心正文、产品参数、主图及指向分类/产品/关联内容的真实链接。折叠面板可以有交互，但核心内容不以点击、滚动或浏览器 API 请求作为唯一获取入口。
- 使用 `<a href>` 和可直接访问的稳定 URL；分类分页有真实下一页链接，不只提供“加载更多”按钮。动态块经 PHP 输出 HTML，与仅在浏览器渲染的空壳不同。
- 用户和爬虫获得相同主要内容；不默认引入按 User-Agent 分流的 dynamic rendering。
- 公开有效页面用适当成功状态；不存在的产品、越界分页和无效筛选组合正确处理，不能统一返回首页或 200 空壳。无匹配的有效搜索保留清晰重选入口，是否索引按页面策略决定。

依据：[JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)、[可抓取链接](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)。

## URL、索引与内容层级

先给每类 URL 指定 index/noindex、canonical、sitemap 和内部链接策略：

| 页面 | 默认项目策略 |
| --- | --- |
| 有独立内容的产品、分类、行业方案、About、文章 | 允许索引；独立 title、描述与清晰主标题；稳定规范 URL；避免孤立页 |
| 目录分页 | 独立 URL 与通常自指 canonical；不把第 2 页统一指向第 1 页；保持链接可发现 |
| 排序、追踪、重复筛选组合 | 限制无限 URL 产生；按真实等价性规划 canonical 与抓取，不把不同内容全部 canonical 到分类首页 |
| 值得搜索的筛选落地页 | 经内容与需求评估后提供稳定 URL、独立价值和入口；不批量索引所有排列组合 |
| 搜索结果、感谢页、纯工具/询盘上下文参数页 | 通常不作为搜索落地页；分别决定 noindex 或等价 URL 合并，不能一刀切给参数 URL 同样规则 |
| 测试、预览、未审核 mock 内容 | 保持隔离；公网预览采用访问控制，按环境补 noindex；不进入正式 sitemap |

robots.txt 控制抓取，noindex 控制索引：要让 Google 读取 noindex，不能同时禁止它抓取该页。canonical 是规范化信号，不是禁止抓取指令，也不保证去重。使用 sitemap 中的规范 URL、内部链接与重定向保持信号一致。迁移已有 URL 才设计必要的永久重定向，不为切模板随意改 slug。

依据：[分页](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading)、[筛选抓取](https://developers.google.com/crawling/docs/faceted-navigation)、[canonical](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)、[noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing)。

## 内容与结构化数据

- 产品页写具体型号、应用条件、可信规格、图片/文件及采购信息；分类和行业页有独立选型价值。Codex 不为凑关键词生成仅替换型号/地区名的低价值页面。
- 配置一个 SEO 输出负责人；主题不重复生成 title、canonical 或相互矛盾的 JSON-LD。业务插件可通过受控集成补充产品事实。
- 结构化数据与可见内容一致；按页面适用性使用 Product、BreadcrumbList、Organization、Article 等，不在所有页面套同一 schema。
- **询价型 B2B 不伪造价格、库存或评价。** 没有真实报价/评价等所需数据时，不为通过 Google Product 富结果检查填入 0 价格或虚构评分。schema.org 类型描述有效、Google 富结果资格、实际展示是不同结论。
- 图片使用媒体尺寸、明确宽高、适当压缩及符合内容的 alt；主图不机械延迟加载。正文描述不能只存在于图片中。
- 多语言进入范围时另行核对独立语言 URL、互相对应的 hreflang 与 canonical；不默认制作大量机器翻译落地页。

依据：[Product snippets](https://developers.google.com/search/docs/appearance/structured-data/product-snippet)、[生成式 AI 内容](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content)。

## WordPress 专项实现

这些是本项目 WordPress 验收点，不是额外的 Google 排名因子：

| 实现点 | 实际检查 |
| --- | --- |
| 环境可见性 | 分别检查预览/生产的 Settings → Reading、HTTP X-Robots-Tag、页面 robots、robots.txt、主机访问控制；生产公开页面没有误留 noindex。WordPress“建议不索引”不是访问控制 |
| 产品 CPT 与 taxonomy | 核验 public/publicly_queryable、rewrite、has_archive 等与页面规划一致；show_in_rest 负责编辑/API，不等于可索引。内部询盘记录不因需要管理而开放成搜索页面 |
| 固定链接与主域 | 正确的 HTTPS、WordPress/Site 地址、CPT/分类前缀与实际 permalink；检查重定向链、旧域名和预览地址；不为关键词反复改 slug |
| sitemap | 核实使用核心或所选 SEO 插件的实际 sitemap 提供方和 URL，不写死所有站为 wp-sitemap.xml 或 sitemap_index.xml；覆盖计划索引的产品/分类/页面，排除草稿、noindex 和重定向 URL。URL 变更后核对更新 |
| 多余归档 | 逐类审查标签、作者、日期、媒体附件页及内部搜索；有独立用途的保留，不一律关闭。重复/低价值页依策略合并或不索引，附件文件与附件页面区分处理 |
| ACF 内容 | 放在字段里不会自动成为可抓取正文；模板/动态块须实际输出。后台字段变化后验证前台、缓存、SEO 描述/结构化数据同步，不复制一套参数作为 SEO 专用文本 |
| 标题与 schema | 用一个 SEO 输出负责人协调核心、主题和插件，实际 HTML 核验无重复/冲突；不能通过安装两个 SEO 插件叠加效果 |
| 图片 | 优先附件 ID 和 WordPress 图片 API，核验 src/srcset/sizes、尺寸、alt 与实际加载；产品主图使用可发现的 img，而非只放 CSS background |
| 主题与资源 | 核心内容服务端输出，编辑器/前台样式分别加载；启用资源合并/压缩/延迟后回归图库、菜单、表单和布局稳定性 |
| 多语言 | 进入范围才选定可维护实现；稳定语言 URL、适用 hreflang 相互引用和同语言 canonical；翻译保持型号/单位/事实一致，不只翻菜单 |

依据：[Reading 设置](https://wordpress.org/documentation/article/settings-reading-screen/)、[CPT 注册](https://developer.wordpress.org/reference/functions/register_post_type/)、[WordPress sitemap](https://developer.wordpress.org/reference/classes/wp_sitemaps/)、[附件图片 API](https://developer.wordpress.org/reference/functions/wp_get_attachment_image/)、[Google 图片](https://developers.google.com/search/docs/appearance/google-images)、[语言版本](https://developers.google.com/search/docs/specialty/international/localized-versions)。

## 性能与可执行验收

1. 记录每类代表 URL 的 HTTP 状态、原始响应 HTML；核验核心内容、真实 href、title、description、canonical、robots、JSON-LD，不只检查浏览器执行后的 DOM。
2. 验证 sitemap 与内部链接，分类分页/筛选/空结果/不存在 URL；检查重复 canonical、重复 schema、软 404 与预览域名残留。筛选策略按上述 URL 矩阵判断，不能仅断言所有页面都有 canonical。
3. 浏览器核对移动端、实际交互、图片和主要内容；脚本失败时仍有可理解的核心页面。比较原始 HTML 与渲染页面，排查隐藏/缺失正文。
4. 性能先做本地/实验室诊断；生产有真实数据后核对移动端第 75 百分位 Core Web Vitals：LCP ≤2.5 秒、INP ≤200 ms、CLS ≤0.1。单次 Lighthouse 或同机 HTML 请求耗时不代表真实 CWV 通过。
5. 缓存按页面和登录/预览/表单会话设计；内容/字段/模板更新后验证失效，询盘 POST 不用整页缓存处理。不能为 SEO 静态化而破坏表单、nonce 或运营更新。
6. 公开上线且有站点权限后，检查 Search Console URL Inspection、sitemap 与索引状态；本地可以验收技术条件，无法据此报告 Google 已收录。发布检查区分预览环境的索引限制与正式页面策略。

依据：[Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals)。结构化数据测试工具的结果与真实搜索表现单独记录。SEO 技术、业务功能、视觉认可分别验收，不用一个总分互相抵消。

## Harness v2 自动配置

生产站首次部署和后续部署不得只 `plugin activate seo-by-rank-math`。使用：

```bash
node harness/cli.mjs --project <site-dir> configure-seo
```

`deploy` 会在插件基线后自动执行同一配置。Harness 负责跳过账户连接、approved modules、organization、CPT/taxonomy titles/sitemaps、rewrite/cache 和 XML 验收；项目 `project.json` 只声明业务 post types、taxonomies、noindex 和 organization。激活插件后必须实际请求 `/sitemap_index.xml` 与业务子 sitemap；HTTP 200 还要确认 XML，不把 HTML 404 页或 WordPress core sitemap 误报为 Rank Math 接管。

## 当前唯一 SEO 实现：Rank Math Free

本方案新站统一使用 Rank Math 免费版；不同时启用其他完整 SEO 插件，不做旧插件适配、回退或历史 SEO 数据导入。旧版本实验结果只作历史记录，不能作为新站安装说明。

- 当前区块样板实测 1.0.278。选择跳过账户连接即可启用本地免费功能；仅命令行 activate 不等于前台 metadata 已初始化。初始化后在新请求刷新 rewrite，实测 sitemap_index.xml 及其子地图。
- 默认模块：Sitemap、Schema、ACF、Redirections、404 Monitor。其他模块按明确需求另行决定，不自动连接外部账户或购买 Pro。
- 产品/行业 CPT 与分类需要在 Titles & Meta 和 Sitemap Settings 中明确配置。作者与搜索不索引；过滤目录经 rank_math/frontend/robots 处理。动态目录描述通过 rank_math/frontend/description 读取 CPT 的唯一说明来源。
- 询价产品、行业页与普通页面默认关闭自动文章/产品富摘要类型；没有真实价格和评价不伪造 offers/ratings。Rank Math 仍输出适用的站点、Organization、WebPage、面包屑图谱；文章使用 Article。ACF 模块的内容分析不等于自动完成产品 schema 字段映射。
- 当前 WordPress 7.1 原生区块画布与 Rank Math 1.0.278 会分别注册 title 输出。样板在 wp_head 开始时确认区块画布 title handler 存在，再移除 Rank Math head 的重复 title callback；标题值仍走 Rank Math 的公开 title filter。必须实际断言 HTML 中恰有一个 title，不能仅凭插件已激活判断。
- 作者路径、sitemap URL 从当前插件/WordPress 实际输出读取，测试不沿用旧插件的固定地址。
- 保持预览 noindex；本地临时模拟公开设置必须 finally 恢复。配置账户跳过、模块和索引策略由初始化负责，主题不另写 SEO 元数据。

官方接口：[Rank Math hooks](https://rankmath.com/kb/filters-hooks-api-developer/)、[ACF 集成](https://rankmath.com/kb/advanced-custom-fields/)。项目证据见仓库 docs/acceptance/rankmath-free/。
