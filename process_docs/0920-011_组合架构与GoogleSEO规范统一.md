# 组合架构与 Google SEO 规范统一

时间：2026-09-20T06:39:32+08:00，Asia/Shanghai（UTC+08:00）。

触发：用户要求深入查证区块主题、CPT/ACF、自定义模板与 PHP 共生是否正确，并更新 Skill 和规范；追加强调适合 Google 抓取与 SEO，不要求静态页面。

研究：核对 WordPress 官方主题结构/customTemplates/动态渲染/模板解析/PHP Patterns/块样式/CPT/绑定/锁定文档，以及官方 Hybrid 教程、ACF Blocks/get_field/绑定资料；补查 Google Search Central 的 JS SEO、真实链接、分页、筛选抓取、canonical、noindex、Product snippets、Core Web Vitals 和生成式内容规范。来源链接与工程推论统一记录在 docs/TARGET-ARCHITECTURE.md 和 Skill references/seo.md。

结论：用户提出的组合原则正确。默认设计为原生区块主题 + 业务插件/CPT/Taxonomy + ACF + 原生模板/Patterns + 必要 PHP 动态块 + CSS/JS。区块模板不能执行内嵌 PHP，动态块承接请求时渲染；独立 PHP 整页属于需要明确路由/编辑边界的例外。Google SEO 不要求静态文件；本项目要求主要内容在服务端初始 HTML 输出，JS 增强交互。规范符合技术抓取目标，不承诺索引或排名。

额外核验：只读访问既有隔离 B 实例，实际 WP 7.1 / ACF 6.8.9 / acfPro=false / enable_block_bindings=true；acf/field 和 comparison/acf 均已注册。ACF 官方完整编辑器绑定体验的 PRO/版本要求，不能推导为免费版完全没有绑定能力。未验证官方来源的 Query Loop 行为或双向编辑，规范要求先复用/核验实际能力，再为已证实缺口薄适配。

变更：统一新站规划默认与模块职责，补模板/PHP/字段/预览边界；新增 SEO 按页面 URL 策略和实测验收标准；更新 README、上手指南和当前实现说明；18 号研究明确为历史，避免多个架构真源。既有验收报告和 vendor 原文保留。主要文件：

- README.md
- .agents/skills/wordpress-builder/SKILL.md
- .agents/skills/wordpress-builder/references/theme-code.md
- .agents/skills/wordpress-builder/references/b2b-pages.md
- .agents/skills/wordpress-builder/references/architecture.md
- .agents/skills/wordpress-builder/references/orchestration.md
- .agents/skills/wordpress-builder/references/content.md
- .agents/skills/wordpress-builder/references/reference-site.md
- .agents/skills/wordpress-builder/references/verification.md
- .agents/skills/wordpress-builder/references/site-workflow.md
- docs/ARCHITECTURE.md
- docs/TARGET-ARCHITECTURE.md
- docs/18-WordPress与Codex调研及架构重规划.md
- docs/GETTING-STARTED.md
- .agents/skills/wordpress-builder/references/seo.md

验证：Skill quick_validate 通过；当前 capabilities 命令返回 integrity=verified；66 个 vendor 文件逐一 SHA-256 核验通过；本轮 15 份文档的本地 Markdown 目标检查通过；git diff --check 通过。人工核对设计默认、当前运行基线、独立原型和未完成能力的表述一致。只改 Markdown，未运行无关应用单测、类型检查或全站浏览器回归。

未覆盖与下一步：本轮没有修改运行主题/业务数据/CLI schema，没有进行实际网站迁移、全站 SEO 审计或 Google 索引验证。完整区块 starter、Pattern 库、编辑器一致性、后台分类布局 UI、模板 CLI、全站页面与部署恢复等继续按目标文档推进。SEO 需对实际输出逐项验收；上线后再在授权范围内核对 Search Console 等外部状态。保留 PHP 基线和区块 worktree；无提交、整体暂存或生产部署。
