# 19. 经典主题 + ACF 生产部署与 Harness

状态：已生产实测（2026-09-22，IRONTRACK PARTS / violet-vulture-561066.hostingersite.com）。

## 结论

新 WordPress 外贸 B2B 项目默认改为：**最小经典 PHP 主题 + ACF 本地字段 + 业务插件 CPT/taxonomy + Fluent Forms 询盘 + SSH/WP-CLI 部署**。不再要求新站从 Block Theme 起步。

## 分工

| 层 | 归属 |
| --- | --- |
| 视觉与模板 | 经典主题：`header.php`、`footer.php`、`front-page.php`、页面模板、CPT/taxonomy 模板 |
| 业务模型 | 业务插件：CPT、分类、ACF local fields、SEO 默认值；询盘捕获由 Fluent Forms 负责，邮件通知通过 mu-plugin SMTP（smtp.hostinger.com）发送 |
| 内容 | `content/site-data.json` 种子 + ACF 后台编辑 |
| 平台 | Hostinger CLI：网站创建、安装 WordPress、缓存清理 |
| 管理 | SSH + WP-CLI：文件、数据库、插件、媒体、内容、验收 |
| REST | 外部集成；不是 Codex 日常管理主通道 |

## Harness 命令

统一入口：仓库根目录 `harness/cli.mjs`（也可 `npm run harness`）。所有命令用 `--project <site-dir>` 指向客户项目，入口本身不硬编码项目名、主题、域名或内容模型。

- `init <name> --root <parent>`：生成经典 PHP + ACF 项目骨架和可校验 `project.json`
- `config`：Zod schema 校验并展开默认值
- `doctor`：Node/Git/rsync/tar/gzip/Hostinger CLI/PHP/SSH/WP-CLI
- `check`：结构、经典主题无 `theme.json`、插件主文件、ABSPATH、标题层级、内容 JSON、媒体引用、凭据扫描、PHP 语法（本机 PHP 或 Docker）
- `backup`：主题/插件 tar + WP-CLI 常量调用 `mysqldump` + SHA-256 manifest
- `media`：按 `project.json.media.sources` 上传并生成 `content/media-map.json`
- `content`：打包项目 `scripts/seed.php`、`content/site-data.json`、`media-map.json` 后远端执行
- `provision`：Hostinger CLI 查重/生成子域/建站/安装 WP，凭据只写私有 0600 文件，回写 project.json 后自动进入首次 deploy
- `setup`：WordPress 核心选项 → 插件基线 → Rank Math Free
- `configure-seo`：数据库备份 → WP 核心选项 → 插件基线 → Rank Math → 缓存 → 前台/XML sitemap 验证
- `deploy`：check → SSH/WP-CLI 预检 → backup → 插件基线 → sync → core/SEO 配置 → media/content → Hostinger cache → URL/H1/标题/数据库/SEO 验证；失败自动恢复文件
- `verify` / `status`：原始域名、每页 1 个 H1、0 跳级、标记、内容计数、激活插件
- `rollback`：按 manifest 恢复主题/插件；数据库恢复保持人工批准
- `wp` / `ssh` / `open` / `cache`：日常运维

## 生产实测修正

1. Hostinger 禁用 `proc_open` 后 `wp db export` 会失败；用 WP-CLI 读取 DB 常量后调用 `mysqldump --single-transaction --quick --no-tablespaces`。
2. WP-CLI `eval-file` 顶层变量不是 global；跨函数使用 media map 要写 `$GLOBALS`。
3. 直接 `update_post_meta` 写 ACF 字段时，模板要兼容附件 ID、数组 URL 和 `sizes` 缺失。
4. Repeater 渲染优先 `get_field()` + `foreach`；`have_rows()/the_sub_field()` 对 CLI 直写数据不可靠。
5. 清空导航要删除所有 `nav_menu_item` 帖子；`wp_get_nav_menu_items()` 会漏掉 object_id 为 0 的孤儿项。
6. Rank Math 只激活不等于接管；必须写入 registration skip、configured、approved modules、CPT/taxonomy titles/sitemap options，再刷新 rewrite，并实际验证 `/sitemap_index.xml` 与子 sitemap 的 XML。
7. SSH/rsync 偶发 ETIMEDOUT 必须重试；重试后重新执行远端验证。
8. 全新项目可以先没有 `project.hostinger`；提供 `--order` 与 SSH 参数后，Harness 从 Hostinger website 回读并写回用户。新安装 website 就绪不等于后台文件写入停止，文件快照对 `file changed as we read it` 做有限重试。
9. Seed 在远端 staging 后执行，Harness 显式传媒体地图与站点数据参数；项目脚本不要假设原始项目路径。业务 sitemap 从 `project.json` 派生并逐个验证 XML，私有 RFQ 不进入 sitemap。

## 验证

- v2 harness：89/89 Node tests 全绿；`npm run lint`、`npm run typecheck`、`git diff --check` 全绿。
- 用统一 CLI 对 IRONTRACK 项目执行 `check`、`doctor`、`verify`、`status`、`content`、`configure-seo`、`deploy` 成功；部署后 7 个 URL、H1/标题层级、10/4/1 数据库计数、Rank Math 前台与 `/sitemap_index.xml`、`/page-sitemap.xml` XML 全部通过。

## Clean-room 新站演练补充（2026-09-22）

- 独立最小经典 PHP + ACF 项目完成 `provision`、完整 `deploy --with-media --with-content`、6 个关键 URL、H1/跳级、产品/指南/RFQ 计数、RFQ private row、Rank Math Free、index 与 post/page/产品 CPT/业务 taxonomy 子 sitemap 验证。
- 使用 `rollback` 恢复已知主题/插件快照后，六页验证、数据库计数和 RFQ 行仍通过；站点保持可用。
- 跨项目规范已回写 `classic-acf-default.md`、`hostinger.md`、`seo.md`；Harness 补充 new-account provisioning、seed staging contract、fresh-install backup retry 与业务 sitemap 派生验收回归测试。

## 证据

项目：`/Users/Zhuanz1/Documents/ChatGPT/wordpress-projects/irontrack-parts`
验收：`docs/process/0922-03_IRONTRACK经典主题ACF上线.md`
截图：`docs/acceptance/*.png`

## B2B 全流程演练补充（2026-09-22 第二轮）

- 真实信息架构（6 产品 / 4 分类 / 3 行业 / 3 指南 / 新闻 / About / Contact）完成 `deploy --with-media --with-content`；22 个 URL、6 项计数（含 `kind: "term"` 的分类计数）、7 个 sitemap、RFQ 新版表单写入全部通过。
- 新修正：`contentCounts` 增加 `kind: post|term`，`verifyDatabase` 对 taxonomy 使用 `wp term list` 计数；此前把分类当 post type 数会导致验证误报 0 并触发回滚。
- 流程教训：手写/重写 `project.json` 时必须合并 provision 回写的 `domain/ssh/hostinger` 字段，否则远程命令直接拒绝执行（Harness 拒绝是正确行为）。
- 欠债清偿：provision 生成子域后立即写入 project.json（中断可凭盘上记录恢复）；`--with-media` 改为幂等导入，只上传媒体地图缺失的键，不再每次堆一套重复附件。
- 维护层上线：`edit-page`/`post push`（写前指纹检测手工编辑冲突，--adopt-remote 才允许接管，readback + .content-state.json journal）、`nav add|remove`（外科手术式菜单项操作，不再全量重建）、`template assign`（校验 Template Name 与 the_content 渲染）。seed 降级为首次开通专用，后续内容变更走维护命令。
- 通用性整改：中心代码移除 IRONTRACK `it_rfq` 残迹与时区硬编码；`project.timezone` 由项目声明，"项目管业务、Harness 管机制"边界重新收紧。
