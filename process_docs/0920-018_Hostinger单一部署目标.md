# Hostinger 单一部署目标与规范接入

时间：2026-09-20T08:27:39+08:00（Asia/Shanghai）。

触发：用户同意先围绕 Hostinger 构建整套方案。当前分支 main，HEAD a49821fa88311b5fa59f4d0298b8a6f5b71bd7a1；工作区存在此前大量未提交变更，本轮未暂存或提交。

## 本轮成果

- 明确 Hostinger Managed WordPress 为当前唯一公网目标，不建设 SiteGround/多主机兼容层，也不要求 VPS。
- 新增 Skill references/hostinger.md，规定官方 CLI/API、可选 MCP 与 SSH/WP-CLI 的职责，首次发布、后续更新、失败恢复及证据边界。
- 同步总 Skill、根 AGENTS、客户 AGENTS 模板、release/plugins 规范、架构决策/现状及上手入口。
- 网站插件基线不变；Hostinger AI 插件不默认安装，主机预装插件须先盘点。

## 验证

- 检查 9 个本轮文件中的 85 个本地文档链接，无缺失。
- git diff --check 通过。纯文档变更，未运行无关站点测试。
- 未修改运行网站、数据库、账户或机器工具；未安装 CLI/MCP、购买主机或执行公网发布。

## 遗留与下一步

本轮完成架构和规范接入，未实现部署脚本。接下来实现本地发布包及排除规则，然后只读远端预检、测试站首次部署与恢复验收。实际套餐、SSH/站点路径、域名和凭据来源尚未确定。现有 build --publish 仅为内容门禁，不能报告为 Hostinger 自动部署。真实投递和生产环境验收未完成。
