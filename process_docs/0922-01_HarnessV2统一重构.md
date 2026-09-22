# 0922-01 Harness v2 统一重构

- **时间**：2026-09-22 14:45（Asia/Shanghai）
- **触发**：用户要求一次性高质量重构 Harness，而不是把项目级脚本复制成模板。
- **状态**：已实现并生产项目实测。

## 实现

1. 新增中央 CLI `harness/cli.mjs`，支持 `init`、`config`、`doctor`、`check`、`backup`、`media`、`content`、`deploy`、`verify`、`status`、`rollback`、`cache`、`wp`、`ssh`、`open`。
2. 新增 `project.json` Zod schema 和旧字段兼容；theme/plugin/path/media/seed/contentCounts 全部配置化，入口无项目名、域名、主题名或 `lt_/it_` 硬编码。
3. 部署执行 local gates → SSH/WP-CLI 预检 → files/DB backup → required plugin baseline → rsync sync → activation → media/content → cache clear → live URL/H1/heading/count verification；失败自动恢复部署前主题/插件。
4. 本地 gates 覆盖主题结构、经典主题约束、插件主文件、ABSPATH、PHP/HTML 标题层级、content data JSON、媒体引用、凭据扫描和 PHP syntax（PHP CLI 或 Docker fallback）。
5. 新项目 init 从 PHP reference 生成经典主题和业务插件，移除 `theme.json`，生成安全 slug 配置和项目文档。
6. SSH 命令统一 `ConnectTimeout`、`ServerAliveInterval`、strict host key accept-new、shell quoting 和 transient retry。
7. 数据库备份继续使用 WP-CLI 读取 DB 常量后 `mysqldump`，绕过 Hostinger 禁用的 `proc_open`。

## 验证

- `npm test`：84/84 passed。
- `npm run lint`：0 errors。
- `npm run typecheck`：0 errors。
- `git diff --check`：clean。
- 用统一 CLI 驱动 `/Users/Zhuanz1/Documents/ChatGPT/wordpress-projects/irontrack-parts`：
  - `check` / `doctor` / `status` / `verify` 通过。
  - `content` 重建 terms/pages/products/guides/menus 后 7 个页面、10 parts、4 guides、1 RFQ 均通过。
  - `content` 完整重建后 7 个页面、10 parts、4 guides、1 RFQ 通过。
  - `deploy --with-content` 完整执行备份、插件基线、同步、激活、媒体映射、seed、缓存、7 URL 和数据库验收。
  - `rollback` 恢复最近部署前主题/插件后，7 个 URL 和数据库计数仍通过。
- 部署失败路径有自动文件回滚；数据库仍要求人工批准，不覆盖询盘。

## 文件

- `harness/cli.mjs`
- `harness/init.mjs`
- `harness/lib/*.mjs`
- `tests/harness/*.test.mjs`
- `docs/19-经典主题ACF生产部署与Harness.md`
- `.agents/skills/wordpress-builder/references/classic-acf-default.md`

## 遗留

- Rank Math setup wizard 级配置和 Rank Math Sitemap 接管仍未完成。
- Hostinger provision（生成子域 + WP install）仍走 Hostinger CLI 手工编排，未并入 `harness provision`。
- 项目 seed 脚本仍是项目业务契约；中央 harness 负责传输和执行，不解析业务字段。
