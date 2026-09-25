# B2B WordPress Starter Template

生产形态的外贸/工业 B2B WordPress Starter。目标是提供一个**正确的信息架构、可编辑 CMS、可部署质量门和可重构设计基线**，让用户在稳定骨架上做品牌化和二次开发。

当前包含：

| 层 | 能力 |
| --- | --- |
| Theme | Classic PHP theme、Precision Catalogue 设计系统、组件化 partial/component、响应式布局 |
| 路由 | Home、Products、Product Detail、Product Category、Industries、Guides、Blog/News、About、Contact、404 |
| 可选模板 | Home 4 类；Product detail 4 类；Product category 4 类；多个 page template |
| 内容模型 | `starter_product`、`starter_industry`、`starter_guide`、`product_collection` |
| CMS | ACF Free tabs、产品规格/FAQ、类目页内容、工厂档案、Site copy、Contact content、Customizer |
| 编辑器 | Classic Editor + 受控 native block patterns；长正文和结构化数据职责分离 |
| 表单 | Fluent Forms RFQ、稳定 shortcode `[starter_rfq_form]` |
| SEO | Rank Math Free、sitemap、产品 rich snippet、文章 snippet |
| 邮件 | mu-plugin 读取 `wp-config.php` SMTP 常量，推荐 Hostinger 企业邮箱 |
| 质量门 | 结构、heading、zero-media、ACF/CMS、editor patterns、route、form、screenshot |
| 文档 | `DESIGN.md`、`CUSTOMIZE.md`、`DEPLOY.md`、`docs/` |

## 快速开始

### 1. 从 Harness 初始化

推荐在 Harness 仓库里执行：

```bash
git clone https://github.com/jackzhang1314/wordpress-build-skill.git
cd wordpress-build-skill
npm ci

node harness/cli.mjs init my-factory-site \
  --root ../projects \
  --from-starter
```

生成的 `my-factory-site` 包含主题、插件、seed、docs 和本地 `project.json`。

### 2. 本地质量门

```bash
cd ../projects/my-factory-site
node /absolute/path/to/wordpress-build-skill/harness/cli.mjs --project . check
```

### 3. 品牌化与内容

先读 [`CUSTOMIZE.md`](CUSTOMIZE.md)。常见顺序：

1. 修改三个品牌 token：`--brand-primary`、`--brand-accent`、`--brand-surface`。
2. 复制 `project.example.json` 为 `project.json`（`--from-starter` 已生成）。
3. 修改 title、domain、SSH、content markers。
4. 用 WP Admin 或 `content/site-data.json` 调整产品、类目、行业、指南、工厂信息。
5. 在后台编辑 Home、About、Contact 的 ACF/page 内容。

### 4. 部署与验证

```bash
node /path/to/harness/cli.mjs --project . doctor
node /path/to/harness/cli.mjs --project . deploy --with-content
node /path/to/harness/cli.mjs --project . cms-audit
node /path/to/harness/cli.mjs --project . audit-fields
node /path/to/harness/cli.mjs --project . verify --screenshots
node /path/to/harness/cli.mjs --project . verify-form
```

首次部署用 `--with-content`；日常热更新用 `--skip-content`。

## 插件基线

| Plugin | 用途 |
| --- | --- |
| Advanced Custom Fields Free | CPT/taxonomy/page 字段 |
| Rank Math Free | SEO、sitemap、rich snippet |
| Fluent Forms Free | RFQ/询盘 |
| Classic Editor | Classic PHP template + 长正文编辑体验 |

不依赖 ACF PRO repeater、flexible content 或 gallery。

## 后台编辑地图

| 后台位置 | 可编辑内容 |
| --- | --- |
| Products → 产品 | 标题、摘要、正文、featured image、quick specs、full specs、FAQ、gallery slots、related products、CTA |
| Product Categories | overline、intro、key facts、selection guide、benefits、specifications、applications、factory support、standards、resources、FAQ、long description、CTA、layout |
| Industries | 标题、正文、featured image、challenge/outcome、相关产品 |
| Guides | 标题、正文、featured image、阅读时间/作者相关 meta |
| Factory profile | 工厂介绍、Value/Label facts、能力、流程、QC、认证、市场 |
| Site copy | 归档页介绍、404、response promise、About CTA |
| Contact page content | contact intro、RFQ checklist、form title/note |
| Appearance → Customize | 品牌/联系方式、topbar/footer、首页 stats/CTA |
| Pages | 页面正文和 WordPress template 选择 |

## 文件地图

```text
theme/
  style.css                    # 设计 token 和全部样式
  inc/components.php           # 通用组件
  inc/page-data.php            # ACF/CPT 数据映射
  inc/template-loader.php      # 可选模板 registry/renderer
  parts/                       # header/footer/card/blog-card/hero
  templates/home/              # 4 类首页 layout
  templates/products/          # 4 类产品详情 layout
  templates/categories/        # 4 类类目 layout
  page-templates/              # WordPress page templates
plugin/starter-model.php       # CPT/taxonomy/ACF 注册
content/site-data.json         # seed content
content/media-map.json         # Starter 默认空
config/editor-block-patterns.json
DESIGN.md                      # 设计系统真源
CUSTOMIZE.md                   # 品牌/内容修改指南
DEPLOY.md                      # 部署和验收清单
```

## 设计原则

`DESIGN.md` 是唯一视觉真源。当前方向是 **Precision Catalogue**：干净、精密、工业感，用 typography、hairline grid、数据和少量 accent 表达可信度，而不是装饰性营销页。

- 颜色只改三个品牌 token。
- 占位图必须显示目标尺寸和比例，不使用真实照片或随机图标。
- 卡片、fact、spec、blog、resource 是不同语义组件，不要做成完全相同的盒子。
- 长正文交给原生编辑器；结构化参数交给 ACF。
- 所有可见业务文案必须有后台编辑 owner。

## 安全边界

- 不提交 `project.json` 里的 SSH secret、SMTP 密码、WP admin 密码。
- SMTP 凭据写目标服务器 `wp-config.php`，仓库只保留占位文档。
- 不把 `.backups/`、`.wordpress-builder/`、`.deploy-state.json`、`.seed-state.json` 提交到 Git。
- 生产部署前必须备份并验证原域名。

## 相关仓库

- Harness 仓库：<https://github.com/jackzhang1314/wordpress-build-skill>
- Starter 独立仓库：<https://github.com/jackzhang1314/b2b-wordpress-starter-template>
