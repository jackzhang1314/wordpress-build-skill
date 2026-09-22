# 0922-02 Harness v2 开通与 SEO 闭环

- **时间**：2026-09-22 18:55（Asia/Shanghai）
- **触发**：继续完成 Harness v2 遗留项，并把中间经验沉淀到正确的可执行层。

## 实现

1. **Hostinger provision**
   - 新增 `harness provision`：查询已有网站，必要时生成免费子域/建站，查询 WP 安装，必要时安装 WordPress，并轮询异步结果。
   - 新 WP 管理凭据只写 `.wordpress-builder/hostinger-<domain>/wordpress.json`，权限 0600；不进 Git、日志或聊天。
   - 建站成功后回写 `project.json` 的 domain、hostinger user/order、SSH path；如提供 SSH host/port/user/key，则保存后自动继续首次 deploy。
   - 已存在站点/安装时命令幂等，不覆盖、不重放安装。
2. **Rank Math Free 配置**
   - 新增 `configure-seo` 和 `setup`。`deploy` 也在插件同步后自动配置 Rank Math。
   - 配置内容：跳过账户连接、只启用 Sitemap/Schema/ACF/Redirections/404 Monitor、company/Organization、CPT/taxonomy titles、meta box、robots、sitemap、authors/attachments off。
   - 配置后刷新 rewrite/cache，并实际验证 `rank_math()->frontend`、`sitemap_index.xml`、`page-sitemap.xml` XML。
3. **配置归属**
   - 中央 Harness 拥有流程、异步轮询、凭据安全、质量关卡和验收。
   - `project.json` 拥有站点专用 organization、post types、taxonomies、noindex、SSH/Hostinger 目标和验收计数。
   - Hostinger reference 拥有平台分层和异步开通约束；SEO reference 拥有 Rank Math 输出负责人约束；classic-acf reference 是新站默认入口。

## 验证

- `npm test`：89/89 passed。
- `npm run lint`：0 errors。
- `npm run typecheck`：0 errors。
- `git diff --check`：clean。
- 在 IRONTRACK 生产站执行 `configure-seo`：DB 备份、WP options、插件基线、Rank Math Free 1.0.278、缓存清理和 XML sitemap 验证全部通过。
- 随后执行完整 `deploy`：7 页面 200、H1/标题层级、10 parts、4 guides、1 RFQ、Rank Math frontend 与 XML sitemap 均通过。
- `provision` 幂等与“新 WP 凭据写私有 0600 文件”有 Node 回归测试覆盖；本轮未新建 Hostinger 站，避免对账户做非必要写入。

## 文件

- `harness/lib/hostinger.mjs`
- `harness/lib/seo.mjs`
- `harness/cli.mjs`
- `harness/lib/config.mjs`
- `tests/harness/hostinger.test.mjs`
- `tests/harness/seo.test.mjs`
- `docs/19-经典主题ACF生产部署与Harness.md`
- `.agents/skills/wordpress-builder/references/hostinger.md`
- `.agents/skills/wordpress-builder/references/seo.md`
- `.agents/skills/wordpress-builder/references/classic-acf-default.md`

## 边界

- 未在本轮新建 Hostinger 网站；provision 的新建/安装路径由 fake CLI 回归测试覆盖，真实新建待下一次授权建站时留证据。
- 邮件送达、正式域名、DNS 和 Google 收录仍不属于本轮已验收范围。
