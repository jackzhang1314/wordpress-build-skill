# Browser Agent SEO Skills

为外贸独立站团队设计的 18 个 SEO 场景技能。由“章鱼外贸 AI 工具箱”的同一份内置技能源码导出，结合 DataForSEO 数据、浏览器证据和版本化文件。

这不是上游包的简单合集，也不是 DataForSEO 官方产品。技能里的工具名属于本浏览器 Agent；其他宿主需要实现相同工具合同，不能仅安装 SKILL.md 就获得 API 或浏览器能力。无需在技能里保存任何 API 凭据。

## 场景目录

| 分类 | 技能 |
|---|---|
| 竞争分析 | [竞品与域名分析](skills/seo-competitor-analysis/SKILL.md)、[竞争关键词与内容缺口](skills/seo-content-gap/SKILL.md)、[SEO 数据复盘](skills/seo-performance-review/SKILL.md) |
| 内容生产 | [SEO 文章工作室](skills/seo-content-studio/SKILL.md)、[旧文章更新](skills/seo-content-refresh/SKILL.md)、[内容计划与本地化](skills/seo-content-plan/SKILL.md) |
| 关键词 | [关键词研究](skills/seo-keyword-research/SKILL.md)、[SERP 分析](skills/seo-serp-analysis/SKILL.md)、[主题聚类](skills/seo-topic-clusters/SKILL.md) |
| 外链 | [外链画像与变化](skills/seo-backlink-audit/SKILL.md)、[外链机会](skills/seo-link-prospecting/SKILL.md)、[联系与跟进](skills/seo-link-outreach/SKILL.md) |
| 页面优化 | [On-page 检查](skills/on-page-seo/SKILL.md)、[内链与结构](skills/seo-internal-links/SKILL.md)、[结构化数据](skills/seo-schema/SKILL.md) |
| 技术审计 | [技术 SEO 审计](skills/technical-seo/SKILL.md)、[国际 SEO](skills/seo-international/SKILL.md)、[性能与体验](skills/seo-performance/SKILL.md) |

## 安装与配置

在支持这些工具的浏览器 Agent 中，打开设置 → 技能，选择单个 `skills/<name>` 目录导入；也可使用 GitHub 目录链接。已作为内置技能提供的同名包不能覆盖，优先升级宿主；做自己的改编时修改 `name` 后导入。整个仓库有多个 SKILL.md，不作为单个技能导入。

设置 → 连接器统一配置：

- **DataForSEO**：API Login / API Password，用于关键词、SERP、竞品、Backlinks、OnPage、Lighthouse。不同产品权限、余额、费用由账户决定。
- **Google**：注册 Web OAuth Client ID，并将扩展配置页显示的 `https://<extension-id>.chromiumapp.org/google` 注册为授权重定向 URI。启用 Search Console/Gmail API，按需要授权；测试阶段按 Google 要求配置测试用户。令牌到期需要重新授权。可选 CrUX API Key 需要启用 Chrome UX Report API；仅使用 CrUX 时不需要 OAuth Client ID。
- **WordPress**：HTTPS 站点、用户名、应用密码；用于文章读取、草稿、更新和发布。不是普通登录密码，也不是所有 CMS 的通用发布协议。

读取 [宿主工具合同](adapters/browser-agent.md)、[数据与费用说明](connectors/dataforseo.md)。[模拟案例](examples/scenarios.json) 不含真实客户、查询记录或凭据。

## 执行与可靠性

付费查询、外联发送和 CMS 写入采用宿主审批；先保留提交记录，未知结果不自动重试。查询保存原始证据，缓存复用核对文件版本与哈希。全站审计明确抓取上限、任务进度、分页和停止，不把任务创建当完成。定时监测是浏览器本地的有限次数据快照；关闭浏览器不运行，不后台发邮件或运行模型。

文章由模型基于证据和用户事实生成；DataForSEO 不替用户创造真实产品事实。所有排名、流量和外链效果均不保证。GSC 点击、第三方估算、实验室性能与真实用户体验分别标注。

## 版本与验证

`manifest.json` 记录每个技能的内容版本和文件列表。宿主仓库执行 `node scripts/export-seo-skills.mjs`，从真实内置包导出；公开仓库中的 `scripts/validate.mjs` 检查目录、包文件、引用与模拟案例。本仓库不含凭据读取脚本或上游安装脚本。

自动测试验证实现和模拟服务行为，不能代替各使用者账户的真实 API/OAuth/邮件/CMS 联调。Google 应用审核、WordPress 配置、DataForSEO 产品权限取决于服务方。

## 来源与许可证

这是独立的浏览器适配实现，方法来源、固定上游提交与修改说明见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)，保留包内许可证。公开可见不等于开源；未包含采用专有许可证的 CodexSEO 内容。新写的仓库说明与示例采用 MIT，第三方内容保留原有 MIT/Apache-2.0 条款。
