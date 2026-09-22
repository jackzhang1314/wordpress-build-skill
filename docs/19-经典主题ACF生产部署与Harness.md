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

模板：`harness/templates/project-harness.mjs`。

- `doctor`：Node/Docker/Hostinger CLI/SSH/WP-CLI
- `check`：必要文件、JSON、模板标题层级
- `backup`：主题/插件 tar + WordPress DB gzip
- `media`：上传并生成 `content/media-map.json`
- `content`：seed terms/pages/products/guides/menus
- `deploy`：预检 → 备份 → 插件基线 → 同步 → 激活 → 缓存 → URL/数据库验证
- `rollback`：恢复主题/插件；DB 恢复保持人工批准

## 生产实测修正

1. Hostinger 禁用 `proc_open` 后 `wp db export` 会失败；用 WP-CLI 读取 DB 常量后调用 `mysqldump --single-transaction --quick --no-tablespaces`。
2. WP-CLI `eval-file` 顶层变量不是 global；跨函数使用 media map 要写 `$GLOBALS`。
3. 直接 `update_post_meta` 写 ACF 字段时，模板要兼容附件 ID、数组 URL 和 `sizes` 缺失。
4. Repeater 渲染优先 `get_field()` + `foreach`；`have_rows()/the_sub_field()` 对 CLI 直写数据不可靠。
5. 清空导航要删除所有 `nav_menu_item` 帖子；`wp_get_nav_menu_items()` 会漏掉 object_id 为 0 的孤儿项。
6. Rank Math 未配置向导时，Sitemap 模块可能仍未接管；首轮验收 WordPress core `/wp-sitemap.xml`，不要把未验证的 `/sitemap_index.xml` 写成完成。
7. SSH/rsync 偶发 ETIMEDOUT 必须重试；重试后重新执行远端验证。

## 证据

项目：`/Users/Zhuanz1/Documents/ChatGPT/wordpress-projects/irontrack-parts`
验收：`docs/process/0922-03_IRONTRACK经典主题ACF上线.md`
截图：`docs/acceptance/*.png`
