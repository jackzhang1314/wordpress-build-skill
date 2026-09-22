# 19. 经典主题 + ACF 生产部署与 Harness

状态：已生产实测（2026-09-22，IRONTRACK PARTS / violet-vulture-561066.hostingersite.com）。

## 结论

新 WordPress 外贸 B2B 项目默认改为：**最小经典 PHP 主题 + ACF 本地字段 + 业务插件 CPT/taxonomy/RFQ + SSH/WP-CLI 部署**。不再要求新站从 Block Theme 起步。

## 分工

| 层 | 归属 |
| --- | --- |
| 视觉与模板 | 经典主题：`header.php`、`footer.php`、`front-page.php`、页面模板、CPT/taxonomy 模板 |
| 业务模型 | 业务插件：CPT、分类、ACF local fields、RFQ 捕获、SEO 默认值 |
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

## 验证

- v2 harness：89/89 Node tests 全绿；`npm run lint`、`npm run typecheck`、`git diff --check` 全绿。
- 用统一 CLI 对 IRONTRACK 项目执行 `check`、`doctor`、`verify`、`status`、`content`、`configure-seo`、`deploy` 成功；部署后 7 个 URL、H1/标题层级、10/4/1 数据库计数、Rank Math 前台与 `/sitemap_index.xml`、`/page-sitemap.xml` XML 全部通过。

## 证据

项目：`/Users/Zhuanz1/Documents/ChatGPT/wordpress-projects/irontrack-parts`
验收：`docs/process/0922-03_IRONTRACK经典主题ACF上线.md`
截图：`docs/acceptance/*.png`
