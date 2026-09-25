# WordPress B2B Harness + Starter Template

这是当前唯一维护的 WordPress AI 建站基线：一个 **Hostinger 部署 Harness** 加一个 **Classic WordPress B2B Starter Template**。旧区块主题、历史方案和早期验收资料只作为研究归档，不再作为新站入口。

- Harness 仓库：<https://github.com/jackzhang1314/wordpress-build-skill>
- Starter Template 仓库：<https://github.com/jackzhang1314/b2b-wordpress-starter-template>
- 当前 Harness 基线：`2.10.0`
- 当前 Starter release：`v1.10.0`
- 当前 Starter content model：`2.9.0`

## 1. 这套系统解决什么问题

`examples/classic-b2b-starter/` 是生产形态的正面基线，不是普通 demo。它预置：

| 层 | 已内置 |
| --- | --- |
| WordPress 架构 | Classic PHP theme + CPT + taxonomy + ACF Free + Classic Editor |
| 内容模型 | `starter_product`、`starter_industry`、`starter_guide`、`product_collection` |
| 页面体系 | 首页、产品归档、产品详情、产品类目、行业、知识/文章、About、Contact、404 |
| 可选模板 | 首页 4 类、产品详情 4 类、类目页 4 类、多个 page template |
| CMS 编辑 | ACF tabs、工厂档案、产品规格、FAQ、类目内容、CTA、SEO 文案 |
| 表单 | Fluent Forms RFQ、`[starter_rfq_form]` shortcode、入库与邮件验证 |
| SEO | Rank Math Free、sitemap、rich snippet、文章/产品 snippet 配置 |
| 邮件 | mu-plugin + Hostinger SMTP + 企业邮箱凭据，不依赖第三方发信插件 |
| 设计 | Precision Catalogue 设计系统、token、响应式、无障碍规则、zero-media placeholder |
| 质量门 | PHP/结构/heading/ACF/CMS/editor/route/form/screenshot 审计 |

它的价值不是“帮你少写 CSS”，而是把信息架构、字段绑定、模板路由、表单、SEO、部署和验证做成**不易跑偏的正面案例**。用户可以重构样式，但仍然保留稳定的 CMS/ACF/模板/部署契约。

## 2. 克隆后最快使用路径

### A. 新建一个 Starter 项目

```bash
git clone https://github.com/jackzhang1314/wordpress-build-skill.git
cd wordpress-build-skill
npm ci

node harness/cli.mjs init my-factory-site \
  --root /absolute/path/to/projects \
  --from-starter
```

生成目录示例：

```text
/absolute/path/to/projects/my-factory-site
├── theme/
├── plugin/
├── content/
├── config/
├── docs/
├── scripts/
├── project.json
└── project.example.json
```

`--from-starter` 会复制完整 Starter 正面基线，并生成本地 `project.json`。此时先做本地检查：

```bash
cd /absolute/path/to/projects/my-factory-site
node /absolute/path/to/wordpress-build-skill/harness/cli.mjs --project . check
```

### B. 接入 Hostinger

复制 `project.example.json` 的 SSH 规则，编辑 `project.json`：

```json
{
  "title": "My Factory Site",
  "domain": "your-site.hostingersite.com",
  "ssh": {
    "host": "REPLACE_SSH_HOST",
    "port": "65002",
    "user": "REPLACE_SSH_USER",
    "keyPath": "REPLACE_PRIVATE_KEY_PATH",
    "wpPath": "/home/REPLACE_SSH_USER/domains/your-site.hostingersite.com/public_html"
  }
}
```

然后：

```bash
node /path/to/wordpress-build-skill/harness/cli.mjs --project . doctor
node /path/to/wordpress-build-skill/harness/cli.mjs --project . deploy --with-content
```

- 首次部署使用 `--with-content` 导入 example/seed。
- 日常代码部署使用 `--skip-content`，避免覆盖后台编辑。
- 导航只在明确需要时用 `--with-nav` 重建。
- 生产站点不要把真实 SSH、密码、SMTP secret 提交进 Git。

### C. 交付前验证

```bash
node /path/to/wordpress-build-skill/harness/cli.mjs --project . cms-audit
node /path/to/wordpress-build-skill/harness/cli.mjs --project . editor-audit
node /path/to/wordpress-build-skill/harness/cli.mjs --project . audit-fields
node /path/to/wordpress-build-skill/harness/cli.mjs --project . verify --screenshots
node /path/to/wordpress-build-skill/harness/cli.mjs --project . verify-form
node /path/to/wordpress-build-skill/harness/cli.mjs --project . credentials show
```

`credentials show` 会输出后台地址、账号、一次性生成/轮换后的密码，用于直接交给站点所有者。

## 3. 日常运营与热更新

WordPress 不需要停机更新。Harness 通过 SSH/WP-CLI 同步主题、插件和受控内容，正常部署流程包含备份、缓存清理和验证。

| 场景 | 命令 |
| --- | --- |
| 改一个已上线页面正文 | `edit-page <slug> --file body.html` |
| 新增/更新文章 | `post push article.json` |
| 增加或删除导航项 | `nav add ...` / `nav remove ...` |
| 给页面换模板 | `template assign <slug> --template page-templates/xxx.php` |
| 轮换后台密码 | `credentials rotate` |
| 配置/测试邮件 | `smtp configure` / `smtp test` / `email-setup` |
| 清缓存 | `cache` |
| 回滚文件 | `rollback <backup-id>` |
| 截图审计 | `screenshot --routes /,... --widths 390,768,1440` |

## 4. Starter 二次开发规则

### 正面规则

1. 页面组件放 `theme/parts/` 或 `theme/inc/components.php`。
2. 数据访问放 `theme/inc/page-data.php`，模板只负责把数据传给组件。
3. 可选模板路由统一走 `theme/inc/template-loader.php`。
4. 所有业务文案、参数、FAQ、CTA、工厂能力都放在 ACF/Customizer。
5. 原生编辑器只承载长正文，例如产品底部 details、博客正文、About story。
6. 图片默认保持 zero-media；正式站通过媒体库或配置好的 media source 上传。
7. 类目 ACF term meta 必须用 `product_collection_{$term_id}`。
8. 每个后台存储值必须有 admin-editable 字段 owner。

### 负面模式，不要做

1. 不要把公司名、产品参数、认证、产能硬编码进模板。
2. 不要用 page builder 替代 Classic PHP 组件体系。
3. 不要用 ACF PRO repeater/flexible content/gallery 做默认依赖。
4. 不要让 layout partial 再次调用主循环。
5. 不要绕过 `project.json` 直接手写远端路径或散落 SSH 命令。
6. 不要把结构化数据塞进自由正文，导致后台无法逐项维护。
7. 不要在普通部署中默认重建导航或覆盖后台内容。
8. 不要删除 `main.shell`、`#main`、skip link 或 heading 层级。

## 5. 推荐开发流程

```text
init --from-starter
→ 修改 site-data / ACF demo 为客户真实信息
→ 本地 npm test + node harness/cli.mjs --project . check
→ 接入 project.json SSH/domain
→ deploy --with-content（首次）
→ cms-audit / audit-fields / editor-audit
→ verify --screenshots + verify-form
→ 后续内容与样式热更新
→ credentials show 交付
```

## 6. 本地开发与测试

在 Harness 仓库根目录：

```bash
npm ci
npm run typecheck
npm run lint
npm test
node harness/cli.mjs --project examples/classic-b2b-starter check
npm run package:starter
```

打包产物输出到 `dist/`，包含 tarball、SHA-256 和逐文件 manifest。

## 7. 文档地图

| 文档 | 用途 |
| --- | --- |
| [docs/HARNESS-GUIDE.md](docs/HARNESS-GUIDE.md) | 当前 Harness/Starter 使用手册 |
| [examples/classic-b2b-starter/README.md](examples/classic-b2b-starter/README.md) | Starter 能力和快速上手 |
| [examples/classic-b2b-starter/DESIGN.md](examples/classic-b2b-starter/DESIGN.md) | 设计系统真源 |
| [examples/classic-b2b-starter/docs/CMS-CONTENT-MODEL.md](examples/classic-b2b-starter/docs/CMS-CONTENT-MODEL.md) | CMS/ACF 模型 |
| [examples/classic-b2b-starter/docs/TEMPLATE-SUITE.md](examples/classic-b2b-starter/docs/TEMPLATE-SUITE.md) | 可选模板体系 |
| [RELEASES.md](RELEASES.md) | 发布记录 |
| `docs/01-*.md` 到 `docs/19-*.md` | 历史研究、旧架构和阶段验收归档 |

## 8. 当前边界

当前基线已完成 Hostinger 真实部署、路由验证、CMS/ACF 审计、响应式截图和 Fluent Forms 浏览器提交验证。

不要把以下内容当作已通用完成的能力：

- 跨所有主机商的自动部署；
- 所有邮箱服务商的自动开通；
- 无人工确认的生产发布授权；
- 完整屏幕阅读器/键盘无障碍认证；
- 恶意输入、高并发、多语言和复杂工作流的全量压测。
