# 经典 PHP 主题视觉规范（B2B 亮色高级工业风）

本文沉淀经典（非 Block）PHP 主题的视觉与体验层规范，来源为 harness-cleanroom v4 改造实测（2026-09-23，Hostinger 生产站 22 页验收通过）。Block Theme 侧规则见 `design.md`；模板工程规则见 `theme-code.md`。适用场景：外贸工业 B2B 官网、以 PHP 模板 + design token CSS 交付的项目。

## 1. 设计 token 基线（style.css `:root`）

经典主题没有 `theme.json` 时，`style.css` 顶部 `:root` 承担唯一 token 真源角色，模板禁止出现裸色值：

- 色板 9 档起步：`--paper/--surface/--surface-2` 三层底、`--ink/--body/--muted/--faint` 四层字、`--line/--line-strong` 两层线；强调色 `--accent`（及其 `-dark/-soft/-line/-ring` 派生）单独一组；语义色 `--ok/--danger` 成对给背景。
- 亮色高级工业风的推荐值（实测可读性达标）：`paper #FFFFFF`、`surface #F6F8FB`、`ink #0B1526`、`muted #5B6572`、`line #E4E8EF`、`accent #1D5BDB`、`ring rgba(accent,.16)`。正文用 `--body` 不用纯黑，标题才用 `--ink`。
- 字体：自托管单一可变字体（`InterVariable.woff2`，约 344KB，权重 100–900 含光学尺寸）+ 系统回退；`wp_head` 里 `preload`（`crossorigin`），`font-display: swap`。标题 `letter-spacing -.02em ~ -.03em`，正文 16–16.5px / 1.7–1.75。数字型数据（规格、统计）加 `font-variant-numeric: tabular-nums`。
- 形状：三档圆角（卡片 16 / 控件 10 / 小件 8）；阴影两档（静态 `card`、悬浮 `lift`），吸顶头单独一档 `header`。

## 2. 版式节奏

- 容器 `min(1200px, 100% - 2*gutter)`，gutter 桌面 48 → 平板 36 → 手机 20。
- 节奏用 `margin-top` 而不是 `padding-top:76px + padding-bottom:8px` 之类的魔法数：`main{padding-bottom}` + `.section{margin-top}`（桌面 100 → 平板 76 → 手机约 64），页面尾随容器 padding 收口。
- 页头统一组件 `.page-head`（eyebrow + h1 + 摘要 + 底部分隔线），面包屑放其上方；详情页主列不需要重复 page-head 样式时用 `.article{padding-top}` 拉开。
- Hero：双栏 1.04/0.96，图片列加同色系渐变背景块（伪元素偏移 −20px）制造深度；图片上可叠玻璃拟态小卡（backdrop-filter + 边框）承载一个关键事实（如质保年限）。CTA 行下方放「认证徽章 chips」（复用既有文案，不新增内容）。
- 统计带做成卡片（渐变浅底 + 顶部 3px accent 刻度线），不再用上下边框的裸分栏。

## 3. 组件规范

- 卡片：白底 + 1px `--line`，hover 上浮 3–4px + `shadow-lift` + 边框加深；媒体区 4/3，`overflow:hidden`，内图 hover 轻放大（1.04）。无缩略图时必须渲染内联 SVG 兜底（浅渐变底 + 网格 pattern + 线性图标），绝不允许空白灰盒；`functions.php` 提供 `media_placeholder($kind)` / `card_media($kind)` helper，图标按内容类型区分（产品/行业/指南/页面）。
- 信息 chips：卡片标题上方放分类/日期 chip（11px、大写字距 .1em、`--accent-soft` 底），详情页复用为可点击的分类入口。
- 分类磁贴：4 列（平板 2、手机 1），浅灰底无边框，hover 转白 + accent 边框；左上 46px 圆角图标盒（白底 + accent 线性图标），图标按 term slug 映射。
- 规格表：圆角外框 + `border-collapse:separate` + 末行去底线；label 列浅灰底；行 hover 微变底色；数值列 `tabular-nums`。
- 表单（含 Fluent Forms）：主题侧用 `.fluentform` 前缀覆盖：group 间距 18、label 14/600、输入 47px 高 + 10px 圆角、focus 用 `ring` 阴影、错误 `--danger`、成功态绿底卡；提交按钮对齐主题 `.button`。FF 按钮 label 可能为空（表单配置缺陷）——主题层用 `.ff-btn-submit::before{content:"…文案"}` 提供文案，不改表单数据。
- CTA band：surface→accent-soft 的 125° 渐变 + 20px 圆角，标题/说明左、按钮右；每个列表页/详情页尾一个，不超频。
- 面包屑：`functions.php` 统一 helper 输出 `<nav aria-label="Breadcrumb">` + ol，`li+li::before` 用 `/`；所有非首页模板页头调用。

## 4. 导航与交互

- 吸顶头：`rgba(255,255,255,.88)` + `backdrop-filter: blur(14px)`，滚过 1px 哨兵后加 `is-elevated` 阴影（IntersectionObserver，约 30 行原生 JS）。
- 当前项高亮必须覆盖 CPT 细节页/分类页：菜单只有归档入口时，用 `nav_menu_css_class` 过滤器把 `is_singular(CPT)`/`is_tax`/归档映射到对应菜单项，加 `current-menu-item`/`current-menu-ancestor`。
- 移动端 ≤1020px 收起为汉堡：全屏白色面板 + 逐项分隔线 + 全宽 CTA；按钮动画三线→×，`aria-expanded`/`aria-controls` 必须真实切换，Escape/点击外部/点击链接三种方式关闭，打开时锁 body 滚动。
- 顶栏（topbar）放价值主张 + 邮箱，≤640 隐藏；页脚 4 列（品牌含认证 chips / 联系 / 导航 / 转化列带按钮），底部条左右分列版权与回顶。
- Favicon 走主题 SVG（`assets/favicon.svg` + `wp_head` link），并输出 `theme-color`；主题 `style.css` 版本号必须递增以刷新 `?ver=` 缓存。
- 动效一律短（150–250ms、ease），`prefers-reduced-motion` 下全局关停并禁用平滑滚动；焦点环全局 `:focus-visible` 2px accent。

## 5. 内容呈现红线（不依赖内容改动）

- 内容数据不允许动时，以下问题全部在主题层解决：无图条目（SVG 兜底）、摘要拼接丢空格（`preg_replace('/<[^>]+>/',' ', …)` 后再截词）、About 页 `class="eyebrow>Quality"` 之类的模板属性残缺（重写模板）。
- 内链补充走模板：产品详情加「返回目录 + 相关产品（同站随机/同分类）」，指南详情加上/下篇导航 + CTA band，行业详情加推荐产品区。
- 截图验收注意：WP 默认懒加载会让 full-page 截图出现「空白媒体区」假象；先脚本滚动到底触发加载、回顶、再截。多页验收时用带随机 query 的 URL 绕过 LiteSpeed 页面缓存，否则浏览器/CDN 会回旧 HTML。
