# 搜索质量前置与 WordPress SEO 规范

时间：2026-09-20T06:43:51+08:00，Asia/Shanghai（UTC+08:00）。

触发：用户要求搜索通用网站与 WordPress SEO 最佳实践，将 Google 官方文档和网站质量指南从建站初期融入规范。

研究：核对 Search Essentials、SEO Starter Guide、Helpful/People-first、Spam policies、Page experience、图片和语言版本文档；WordPress SEO/Reading/CPT/Sitemap/附件图片公开文档。质量指南完整版 PDF 经两个官方域名抓取失败，改为阅读由 Google 当前 helpful-content 文档链接的官方 36 页概览，尤其第 18–30 页；不声称阅读完整最新版。区分评分员评估与实际排名、E-E-A-T 与插件评分。WordPress 旧 SEO 文章仍含目录提交/文章数量旧建议，未采纳为 Google 标准。

落地：新增 references/search-quality.md，规定页面任务/独立价值/来源/责任/更新与质量评审；扩展 seo.md 的 WordPress 专项；在 Skill 入口和 Discover→Model→Theme→Content→Verify→Release 中接入，并同步架构、内容、设计、B2B 页面与发布规范。强调 mock 预览可推进、正式企业证据不得伪造；既有技术 SEO 规范继续复用。新流程不增加现有严格 CLI schema 未支持字段，不宣称自动验收已实现。

变更文件：

- README.md
- .agents/skills/wordpress-builder/SKILL.md
- .agents/skills/wordpress-builder/references/b2b-pages.md
- .agents/skills/wordpress-builder/references/architecture.md
- .agents/skills/wordpress-builder/references/content.md
- .agents/skills/wordpress-builder/references/verification.md
- .agents/skills/wordpress-builder/references/release.md
- .agents/skills/wordpress-builder/references/seo.md
- .agents/skills/wordpress-builder/references/site-workflow.md
- .agents/skills/wordpress-builder/references/design.md
- docs/TARGET-ARCHITECTURE.md
- .agents/skills/wordpress-builder/references/search-quality.md

验证：Skill quick_validate 通过；本轮 12 份 Markdown 本地链接检查通过；66 个 vendor 文件 SHA-256 一致；git diff --check 通过。纯文档修改未跑无关应用测试，未修改运行站点或 SEO 配置，无外部发送/发布。

后续：按新标准对实际网站输出做内容和技术验收；公开上线且授权后结合 Search Console、真实 CWV 和询盘效果维护。规范建立有助于提高建站起点，不能当作网站已符合所有要求或 Google 排名保证。
