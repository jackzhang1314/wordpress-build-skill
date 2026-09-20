# Rank Math Free 单一 SEO 实现

2026-09-20，Asia/Shanghai。用户要求当前新站统一使用 Rank Math 免费版，并明确不要历史数据迁移、旧插件适配或双插件兼容。

## 实施

- 9490 主站、9491 模型复用测试站启用 Rank Math Free 1.0.278，The SEO Framework 插件已停用并移除。未运行旧数据导入器；没有保留旧插件 hooks、wp_robots 回退或双实现分支。
- 新站 start.mjs 固定同一免费版本，缓存版本不符直接报错；content/rankmath.php 完成隔离预览的初始化。选择官方支持的跳过账户连接，启用 Sitemap、Schema、ACF、Redirections、404 Monitor。未连接外部账户、启用 Pro、Content AI、Analytics 或 Instant Indexing。
- 标题/描述/canonical/robots/JSON-LD/sitemap 由 Rank Math 负责。业务插件只扩展筛选 noindex 和 CPT 目录描述，数据来源仍为现有 CPT 定义。
- 产品/行业/普通页不自动套用 Article 或带价格的 Product Schema，文章使用 Article。适用的 Organization/WebPage 等由 Rank Math 输出；未伪造报价、评分或库存。
- 原生区块画布与 Rank Math 在当前版本各自输出 title，实测会重复。seo.php 在区块 title handler 存在时移除 Rank Math 的第二个 title callback，标题值仍由 Rank Math filter 管理。这是当前原生主题集成，不是旧插件兼容。

## 验证

- `integration.json`：两个实例均仅启用一个 SEO 插件，版本/免费版/模块/账户跳过/前台初始化/预览 noindex 正确；自定义标题和描述经 WP post meta API 写入，前台实际回读，再恢复；产品未被自动标成 Article/Product，也无虚构 aggregateRating。源码与 49 文件分发 manifest 一致。
- `seo.json`：11 类 URL 的状态码、唯一 title/robots、描述、canonical、分页、筛选/搜索/作者策略，以及 sitemap_index.xml 和全部子地图。子地图包含产品和分类，排除测试草稿/作者。测试临时公开索引设置限定 loopback，finally 已恢复 noindex。
- `editor.png` / `snippet-editor.png`：实际登录产品原生编辑器，打开 Rank Math 面板和 Edit Snippet；SEO 输入界面可用。字段持久化验证使用 WordPress meta API，不把它报告为鼠标输入并点击 Save 的端到端测试。
- ESLint、构建和 git diff --check 通过。PHP SEO 文件解析检查通过；初始化配置已经在两个当前实例运行。未改 TypeScript 业务逻辑，未重复运行与本次无关的整站视觉或全部工具测试。

初始化中曾发现账户跳过未完成导致前台 SEO 未初始化、双 title、rewrite 尚未刷新，以及测试仍硬编码旧作者 URL；分别修正并复跑。最终作者路径由 get_author_posts_url 获取。Schema 不要求搜索等工具页一律输出，按页面类型验收。

## 复验与边界

运行 `npm run test:starter:seo`。当前预览仍为 noindex，不报告 Google 收录或生产部署。未再次从零创建 Docker 环境，下一轮空白安装复验仍需单独进行。旧技术基线报告保留作历史证据，不作为当前 SEO 配置或兼容目标。

当前源码状态见 source-state.json。主题结构、产品数据、表单与视觉没有因本次插件替换而重构。
