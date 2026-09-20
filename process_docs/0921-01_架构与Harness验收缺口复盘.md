# 架构与 Harness 验收缺口复盘

时间：2026-09-21 01:13:09 +08:00（Asia/Shanghai）。
触发：用户询问完整性、最佳实践依据及未沉淀经验。

核对源码、CMS/部署/恢复证据，并查阅 WordPress 官方 customTemplates、CPT 插件归属及 Google SEO Starter Guide。架构机制符合官方支持方向，第三方插件/托管组合是项目选择，不宣称唯一最佳或官方认证。

发现：GETTING-STARTED 与 Hostinger reference 仍称远端恢复未验；ARCHITECTURE 末尾仍称产品/分类模板未实施；根 AGENTS 未明确历史 PHP 示例和当前区块站。已修正文档状态，保留历史示例和历史验收，不改历史证据。将未验收矩阵集中放 ARCHITECTURE，新增恢复隔离与证据时效经验到 hostinger reference，根 AGENTS 强化清除矛盾现状的要求。

尚待工程化：本轮 CMS 私有验收脚本未成为可配置通用命令；需要测试数据归属清单、只读重试/未知写入保护、自动清理和隐私过滤。客户 AGENTS 模板已有规范，但全新任务正确加载/独立新项目完整复用尚需证据。增量发布与数据库模板覆盖冲突、正式邮件、安全/性能/无障碍和生产索引验收未完整覆盖。不为可选 SSH 或所有上游 Skill 全覆盖制造当前站上线前置条件。

验证：本轮为文档修正，核对本地证据和官方来源；检查 diff/路径。不运行无关网站测试，不把文档更新标成新功能验收。详细验证结果见本轮交付。

官方来源：
- https://developer.wordpress.org/themes/global-settings-and-styles/custom-templates/
- https://developer.wordpress.org/plugins/post-types/registering-custom-post-types/
- https://developers.google.com/search/docs/fundamentals/seo-starter-guide
