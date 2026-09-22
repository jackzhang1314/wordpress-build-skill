# 自由模板与主题代码工程规范

本文件沉淀隔离站实测的模板架构与主题代码规则。阶段 5 生成 D 模式自由模板、阶段 4 生成/改主题时必读；规则来源全部标注实测状态，不写未验证内容。

## 1. 模板架构：四种页面生成模式

| 模式 | 载体 | 数据 | 适用 |
| --- | --- | --- | --- |
| A 组合页 | `post_content` + Pattern | 正文 | 首页、营销页 |
| B 绑定页 | `templates/*.html` customTemplates + Block Bindings | ACF | 后台需逐篇切模板的页面 |
| C 归档页 | Query Loop 归档模板 | Query Loop | 列表 |
| D 自由页 | 主题根目录 PHP + `get_field()` 自由 HTML | ACF + 实时查询 | 像素级详情/分类/首页/落地页 |

**模板优先级（实测）**：区块模板（任意层级匹配）永远压过 PHP fallback（`resolve_block_template()`）。要让 PHP 自由模板生效，必须删除同层级或更泛化的 `.html`。已知特例：

1. **站点首页**：`get_front_page_template()` 只认 `front-page.php`，完全忽略后台设置的自定义页面模板（REST 写入返回成功但前台不生效）。首页自由模板的正确形态是 `front-page.php` 委托（一行 require 页面模板文件）+ 删除 `templates/front-page.html`。
2. **DB 覆盖**：后台 FSE 保存会把模板/部件存进数据库并优先于主题文件。AI 只写主题文件；交付前用 `/wp-json/wp/v2/templates` 和 `/template-parts` 检查 `source: custom` 记录，发现即报告并清理。

## 2. 自由模板文档壳与安全基线

每个根目录 PHP 自由模板必须满足：

1. **完整文档壳**：`<!DOCTYPE html>` + `language_attributes()` + `wp_head()` + `body_class()` + `wp_body_open()` + `wp_footer()`。**禁止 `get_header()`/`get_footer()`**——它们不解析 Block Theme 的 `parts/*.html`，会落到 theme-compat 兜底壳毁掉设计；头部页脚用 `block_template_part( 'header' )` / `( 'footer' )`。
2. **ABSPATH 守卫**：文件顶部 `if ( ! defined( 'ABSPATH' ) ) { exit; }`（`<?php` 声明行之后、docblock 之后均可，但必须在任何输出前）。
3. **`add_theme_support( 'title-tag' )` 必须显式声明**（主题 `functions.php`）。Block Theme 不会自动启用；漏掉则所有自由模板页无 `<title>`（实测 P0 级 SEO 缺陷）。同时声明 `automatic-feed-links`、`post-thumbnails`、`editor-styles`。
4. **跳转链接**：`wp_body_open()` 后输出 skip link，`<main id="tl-main">`；配 `.skip-link` CSS。
5. **可移植路由**：禁止硬编码域名、端口或页面路径。内部页面链接用 `get_page_by_path()` 解析 helper（静态缓存），归档用 `get_post_type_archive_link()`，导航部件用相对路径。`navigation-link` 块没有 `url` 属性时前台不渲染 href，必须回填相对 URL。
6. **`get_term_link()` 可能返回 `WP_Error`**，输出前 `(string)` 转换或 `is_wp_error()` 分支。

## 3. 主题 functions.php 标配 helper（实测模式）

```php
// ACF 安全读取：ACF 停用时返回默认值，模板永不 fatal
function tl_field( string $key, $post_id = false, string $default = '', bool $format = true ) {
    if ( ! function_exists( 'get_field' ) ) { return $default; }
    $value = get_field( $key, $post_id, $format );
    return ( $value === null || $value === '' ) ? $default : $value;
}

// 可移植内部页面 URL
function tl_page_url( string $slug ): string { /* get_page_by_path + 静态缓存 */ }
```

模板内一律经 helper 读字段，不做裸 `get_field()` 调用。字段组输出规则见阶段 5。

**搜索范围**：默认搜索只覆盖 post；用 `pre_get_posts`（仅主查询且 `is_search()`）扩到 `['post','page','oct_product','oct_case']`，并在搜索模板加分页块。

## 4. ACF 集成实测规则

1. 图片字段 `return_format: url`：**REST GET 返回原始附件 ID（不是 URL），REST 写入校验要求整数 ID**；`get_field()` 前台与 Block Bindings 渲染层自动转 URL。REST 写图片字段传 mediaId。
2. 模板要控尺寸时用第三参取原始值再转：`tl_field( 'hero_image', $pid, '', false )` + `wp_get_attachment_image_url( (int) $id, 'large' )`；alt 从 `_wp_attachment_image_alt` 取，缺省回退标题。
3. 页面级字段组与模板成对（`page-x-v1.php` + `acf/page-x-v1.php`，location `page_template ==`）；CPT 字段组集中注册，全部 `show_in_rest` + `allow_in_bindings`。
4. 新项目必装：ACF、Fluent Forms（全部表单走短代码，表单字段不建 ACF）、SEO 插件（meta description / OG 标签由插件承担，模板不手写）。
5. 字段命名避免过于通用的 `hero_title` 类名字跨插件冲突——真实站点立项时即带模板前缀（如 `contact_v1_email`），存量数据迁移一起做。

## 5. CSS 与可访问性纪律

1. **token 纪律**：品牌色禁止裸 HEX。渐变色可用 `var(--token)`；`color-mix()` 需提供 fallback 字面量；`var()` 的 fallback 参数里允许字面量。上下文透明度（玻璃徽章 rgba）可保留但需注释说明。
2. **对比度 WCAG AA**：小字号文本/按钮底色 ≥4.5:1。品牌亮橙（#E8570E 白字约 3.6:1）只能用于大标题装饰；按钮与小字用深一档 token（如 `--tl-signal-text: #C9430A`，约 4.9:1）。
3. 卡片缩略图显式 `loading="lazy"` + `decoding="async"`；首屏 hero 保持默认 eager。
4. 无图卡片输出占位组件（等 aspect-ratio + mono 标签），不允许空 `figure` 塌陷。
5. 分页 `<nav>` 带 `aria-label`；当前分类/页码 `aria-current="page"`。
6. 全局 `prefers-reduced-motion: reduce` 降级；`@font-face`/fontFace 声明 `fontDisplay: "swap"`。
7. 已知特异性陷阱：`.entry-content h2.wp-block-heading` 是 0,3,0，深色面板标题需 ≥0,3,0；`.tl-main .wp-block-post-title` 类的宽选择器会污染 Query Loop 卡片标题，页面主标题一律收窄为 `>` 直接子级或专用 class。
8. 区块列布局 `width:auto` 会塌陷，列宽用显式百分比（如 56/38、62/34）。

## 6. 短代码与模板部件（WP 6.9 实测）

`render_block_core_shortcode()` 只做 `wpautop`，**不执行 `do_shortcode`**；模板部件输出不经过 `the_content` 的 shortcode 过滤器，部件内 shortcode 块会原样输出。生产修复一行：`add_filter( 'render_block_core_shortcode', 'do_shortcode' )`。能不用 shortcode 就不用——静态文案（如无年份版权行）永远比动态方案少一个故障点。

## 7. 部署与隔离实验室

1. **分层部署**：单文件热更（日常改稿，秒级）/ 主题或插件目录同步 / 先备份再变更（含前台冒烟 4 路由）。本仓库 `scripts/deploy-lab.mjs`（file/theme/plugin/backup/all/smoke，Playground 环境专用）；生产 SSH 部署按 docs/15 §5 约定实现。
2. **Playground 三个坑（实测）**：
   - worker 文件系统是启动时快照：**模板/部件改动后必须整进程重启**，运行中 rsync 可能继续命中旧文件；
   - 进程会静默退出（表现为连接 000）：用会话式启动（PTY）保活，`nohup &` 会被会话回收；
   - SQLite 在 `wp-content/database/.ht.sqlite`，可直接 sqlite3 只读排查（注意复制后查询，避免锁）。
3. 无 PHP CLI 的环境：改 PHP 后用前台状态码 + `debug.log` 定位语法错误；`foreach ( $arr as [ $a, $b ] )` 合法，`as array( $a, $b )` 非法。

## 8. 交付前检查清单（自由模板任务）

- [ ] `<title>` 在每类模板页都存在
- [ ] header/footer 为 `block_template_part()`，无 theme-compat 兜底标记（`id="headerimg"`）
- [ ] 所有根目录 PHP + acf 文件有 ABSPATH 守卫
- [ ] 无硬编码域名/端口/绝对路径；导航块有可渲染 href
- [ ] `/wp-json/wp/v2/templates`、`/template-parts` 无 `source: custom` 覆盖
- [ ] REST 写图片字段用附件 ID；前台渲染 URL/尺寸正确
- [ ] ACF 停用模拟：模板不 fatal
- [ ] 搜索覆盖 CPT 且有分页
- [ ] 对比度、skip link、aria、reduced-motion 过检
- [ ] 部件改动后整进程重启再验证
