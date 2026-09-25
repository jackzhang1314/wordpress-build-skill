# Customization Guide

本指南把 Starter 变成客户站。顺序：品牌 → 内容模型 → 模板 → 图片/正文 → 表单/邮件 → SEO → 验收。

## 1. 品牌 token

只改 `theme/style.css` 的三个品牌变量：

```css
:root {
  --brand-primary: #111418;
  --brand-accent: #2258D5;
  --brand-surface: #F4F5F7;
}
```

| Token | 控制 |
| --- | --- |
| `--brand-primary` | 标题、导航文字、footer、深色面 |
| `--brand-accent` | 主按钮、链接、active state、focus |
| `--brand-surface` | 浅色 section、空状态和组件背景 |

其他颜色保持语义 token。检查正文对比度至少 4.5:1；大标题建议 7:1。完整规则见 `DESIGN.md`。

## 2. 站点身份和全局信息

| 内容 | 后台位置 |
| --- | --- |
| Site title / tagline | Settings → General |
| 联系邮箱、电话、工作时间 | Appearance → Customize → Contact & Brand Info |
| Topbar/footer 文案 | Appearance → Customize |
| Homepage stats/CTA | Home page ACF 或 Customizer，以后台字段 owner 为准 |
| 工厂 facts/certifications | Factory profile |
| Archive intro、404、response promise | Site copy |
| Contact intro/checklist/form note | Contact page content |

不要把这些内容硬编码进 PHP。

## 3. 页面与模板

Starter 提供可选模板：

| 内容 | 模板选择方式 |
| --- | --- |
| Home | Home page 的 ACF `home_template`：corporate / product-led / conversion / industrial |
| Product detail | Product 的 ACF/template registry：standard / technical / project / compact |
| Product category | term 的 ACF `category_template`：standard / catalogue / conversion / editorial |
| About / Contact / Landing / Case study / Factory capability / Resource center / Catalogue | WP Admin → Page Attributes / Template |

模板只决定版式；文案和字段仍在 CMS。修改共享模板会影响使用它的内容。

## 4. 内容模型

| 数据 | 后台入口 |
| --- | --- |
| Products | Products → Products |
| Product categories | Products → Product Collections |
| Industries | Industries |
| Guides | Guides |
| Blog / News | Posts |
| Pages | Pages |
| Factory profile | Factory profile option page |
| Site copy | Site copy option page |
| Contact content | Contact page ACF |

结构化字段示例：

- Product quick specs / full specs：`Value | Label` 或 `Label | Value` 按 ACF instructions。
- Product FAQ：`Question | Answer`。
- Factory facts：`Value | Label`，例如 `3 lines | Automated SMT, assembly and burn-in`。
- Category resources：`Label | URL`。

改内容模型后必须跑：

```bash
node /path/to/harness/cli.mjs --project . cms-audit
node /path/to/harness/cli.mjs --project . audit-fields
```

## 5. 媒体

Starter 默认 zero-media，`media-map.json` 保持空。前端在没有图片时显示技术占位框，标注目标尺寸和比例。

正式图片路径：

1. 产品/指南/页面：WP Admin → 对应内容 → Featured image。
2. 产品 gallery：Product ACF gallery slots。
3. 页面正文图片：native editor Media Library。
4. 站点图标：Appearance → Customize 或替换 `theme/assets/favicon.svg`。

每个正式图片填写 alt text。不要把真实照片提交进 Starter 源码。

## 6. 表单

Contact 页使用稳定 shortcode：

```text
[starter_rfq_form]
```

修改字段在 WP Admin → Fluent Forms。样式由 `theme/style.css` 控制。表单通知发送依赖 SMTP。验证：

```bash
node /path/to/harness/cli.mjs --project . verify-form
```

真实收件箱收到通知才算邮件链路通过。

## 7. 邮件

推荐 Hostinger 企业邮箱 + Hostinger SMTP。真实凭据写目标服务器 `wp-config.php`：

```php
define('SMTP_HOST', 'smtp.hostinger.com');
define('SMTP_PORT', '465');
define('SMTP_SECURE', 'ssl');
define('SMTP_USERNAME', 'notify@your-domain.com');
define('SMTP_PASSWORD', 'REPLACE_MAILBOX_PASSWORD');
define('SMTP_FROM', 'notify@your-domain.com');
define('SMTP_FROM_NAME', 'Client Site');
```

测试：

```bash
node /path/to/harness/cli.mjs --project . smtp test
```

## 8. SEO

1. Rank Math 完成站点连接和基础设置。
2. 检查 `/sitemap_index.xml`。
3. 每个产品/指南设置 SEO title、description、focus keyword。
4. Product 使用 Rank Math product snippet；guide/article 使用 article snippet。
5. 上线前移除 noindex，确认 canonical 指向正式域名。

## 9. 不要修改的契约

| 内容 | 原因 |
| --- | --- |
| CPT slug `starter_product` / `starter_industry` / `starter_guide` | 模板文件名、queries、seed 和验证依赖 |
| `Starter\Theme` / `Starter\Model` 命名空间 | 组件和函数引用 |
| `product_collection_{$term_id}` term meta 读取方式 | ACF term meta 正确归属 |
| `[starter_rfq_form]` shortcode | 解耦 Fluent Forms form ID |
| `main.shell`、heading 层级、skip link | 布局和无障碍契约 |
| `content/media-map.json` schema | seed/media 流程依赖 |

如果确实要重命名 CPT，必须同时修改模板文件名、plugin 注册、seed、project content counts 和测试。

## 10. 修改后的验收

```bash
node /path/to/harness/cli.mjs --project . check
node /path/to/harness/cli.mjs --project . cms-audit
node /path/to/harness/cli.mjs --project . audit-fields
node /path/to/harness/cli.mjs --project . editor-audit
node /path/to/harness/cli.mjs --project . verify --screenshots
```

本地全量测试在 Harness 仓库根目录运行：

```bash
npm run typecheck
npm run lint
npm test
```
