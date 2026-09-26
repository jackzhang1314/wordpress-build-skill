# Hello Elementor + Elementor Free 兼容性 E2E

- 时间：2026-09-26 18:50–19:02 CST（+08:00）
- 触发：用户要求用免费 Hello Elementor 主题、免费 Elementor 编辑器构建页面，验证 WordPress Builder 能否在保留历史页面的前提下接管新增页面。
- 测试站：`https://yellow-koala-142147.hostingersite.com/`
- 本地 adopted 项目：`/Users/Zhuanz1/Documents/ChatGPT/wordpress-projects/hello-elementor-external`
- 证据：`/Users/Zhuanz1/Documents/ChatGPT/wordpress-projects/hello-elementor-external/evidence/hello-elementor-e2e/report.json`

## 环境与用例

线上环境：

- WordPress `7.1.2`
- Theme：Hello Elementor `3.5.1`
- Builder：Elementor Free `4.3.2`
- Builder Core：`wordpress-builder-core 1.0.1`
- ACF Free：`6.8.10`
- 项目模式：`external`

用例：

1. 安装并激活免费 Hello Elementor 与免费 Elementor。
2. 创建历史页面 `historical-elementor-page`，写入 `_elementor_data`、`_elementor_edit_mode=builder`、`_elementor_template_type=wp-page`，前台 marker 为 `HISTORICAL ELEMENTOR MARKER`。
3. `adopt` 为 external 项目后安装 Builder Core。
4. 新建 Builder-managed page `builder-managed-service-page`，分配 `builder-templates/landing.php`。
5. 新建 Builder CPT `builder_service:industrial-maintenance-service`，分配 `builder-templates/canvas.php`。
6. 分别验证历史页面、新增页面和 CPT 前台 marker。
7. 验证后台 page 与 `builder_service` 的模板选择列表都包含 Builder Canvas/Landing。
8. 验证通用 `edit-page` 对 Elementor-owned 历史页面执行安全拒绝。

## 结果

- adoption 正确识别 `renderingSystem=hybrid`、`authoringSystems=[classic-php, elementor]`。
- Builder Core 与 Elementor/Hello Elementor 共存，CPT、taxonomy、ACF 与插件模板可用。
- 新 Builder page 前台出现 `Builder Subtitle`、`BUILDER CORE BODY MARKER`、CTA 和 `wordpress-builder-template`。
- Builder CPT 前台出现 `Service Builder Subtitle`、`BUILDER SERVICE BODY MARKER` 和 `wordpress-builder-template`。
- 历史 Elementor 页面前台 marker 保持不变，没有转换或覆盖 Elementor 数据。
- WordPress 官方 `WP_Theme::get_page_templates(null, $post_type)` 返回值中，page 和 `builder_service` 均能看到 Builder Canvas/Landing。
- ACF group `group_wbc_content` 处于 active，`wbc_subtitle`、`wbc_summary`、`wbc_cta_label`、`wbc_cta_url` 四个字段可编辑，page/CPT 的已存值能回读。
- 通用 `edit-page` 更新历史页面时会在写入前失败：Elementor 通过 `_elementor_data` 拥有可见渲染，修改 `post_content` 只会影响不可见 fallback，不能宣称已经修改页面。

## 发现并修复

1. Builder Core 原先只挂载错误的 `theme_post_templates` 类钩子，不能可靠进入 page/CPT 的模板选择列表。已改为官方 `theme_templates` 过滤器，并按 post type 过滤。
2. 外部模板校验原先绕过官方 API 伪造模板列表。已改为 `WP_Theme::get_page_templates(null, $post_type)`。
3. `template assign` 原先只支持 page。已支持 `--post-type builder_service` 等 Builder CPT，并保留原模板快照。
4. `wp post-type list builder_project` 不是有效 WP-CLI 语法。安装校验改为列出全部 post types 后检查返回名称。
5. 外部站读取 `_wp_page_template` 不能作为 `wp post list` 字段。已改为先取 ID，再读 post meta。
6. 远程模板校验 PHP 会把验证片段拼在 `<?php` 之前。已拆分 prepare/validation/action 并由合法 PHP 头开始。
7. Builder Core 的 `template_include` 原先只处理 page。已扩展到 `builder_project` 和 `builder_service`。
8. `builder status` 原先读取 adopted 时的陈旧 project metadata。已改为现场 inspect 远程 WordPress。
9. 通用 `edit-page` 会悄悄修改 Elementor 页面的 `post_content`，但前台不变。已增加 `_elementor_edit_mode=builder` 写前拒绝，防止虚假成功。

## 验证

- 初始 E2E 证明历史 Elementor 页面保持渲染，Builder page/CPT 正常输出。
- live 追加验证：
  - `get_page_templates(null, page)` 与 `get_page_templates(null, builder_service)` 均包含 Builder Canvas/Landing；
  - ACF group 与四个字段存在，page/CPT 已存字段值可回读；
  - `edit-page historical-elementor-page ... --adopt-remote` 被安全拒绝，未创建写入快照。
- 焦点测试：22/22 通过。
- 全量 gate：`npm run typecheck` 通过，`npm run lint` 通过，`npm test` 206/206 通过。

## 边界与下一步

- 这不是“把 Elementor 页面迁移到 Builder”，而是“历史页面保留 + 新页面使用 Builder 架构”的并行模式。
- 用户后续明确决策（2026-09-26 19:14 CST）：不规划 `_elementor_data` 专用编辑模块。历史 Elementor 页面留给原编辑器；需要 Builder 接管时创建 Builder-managed 新页面并另行处理路由，不得用 `edit-page` 伪装支持。
- Builder Core 的 canvas/landing 是结构正确但视觉极简的最小模板，后续应扩展产品、文章、首页等设计变体。
- 测试站为一次性验证站，未经用户确认不得删除。
