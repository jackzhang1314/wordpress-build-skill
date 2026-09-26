# WordPress Builder（Starter 可选）

这是当前唯一维护的 WordPress AI 建站基线：一个 **WordPress Builder CLI 和 Skill Suite**，加一个**可选的 Classic WordPress B2B Starter Template**。Starter 是新站的快速正面示例；Builder 同样支持接管既有 WordPress 站点，并且不会假设它们使用 Starter。

- WordPress Builder 仓库：<https://github.com/jackzhang1314/wordpress-build-skill>
- Starter Template 仓库：<https://github.com/jackzhang1314/b2b-wordpress-starter-template>
- 当前 WordPress Builder 基线：`2.17.0`
- 当前 Starter release：`v1.10.1`
- 当前 Starter content model：`2.9.0`

> 给 Codex / AI Agent 的入口：默认 clone `main`。`main` 是当前集成基线；`v2.17.0` 是最新可复测 tag。历史 `docs/01-*` 到 `docs/19-*`、旧区块主题和旧验收资料只用于追溯，不作为新站入口。

### 交给 Codex 的最小指令

把本仓库链接发给 Codex 后，可以直接使用这段指令：

```text
Clone https://github.com/jackzhang1314/wordpress-build-skill.git.
Read README.md, AGENTS.md, docs/HARNESS-GUIDE.md and examples/classic-b2b-starter/README.md first.
Do not use the historical docs as the current default architecture.
Repair the local environment with `node harness/bootstrap.mjs --fix`.
For a new site you may use: node wordpress-builder.mjs init <kebab-case-project-name> --root ../projects --from-starter.
For an existing WordPress site use: node wordpress-builder.mjs adopt <kebab-case-project-name> --domain <domain>.
Before any remote write, ask me for the Hostinger SSH/domain values or use the values I provide.
```

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

## 2. 两条使用路径

### A. 可选快速路径：新建一个 Starter 项目

```bash
git clone https://github.com/jackzhang1314/wordpress-build-skill.git
cd wordpress-build-skill
node harness/bootstrap.mjs --fix

node wordpress-builder.mjs init my-factory-site \
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
node /absolute/path/to/wordpress-build-skill/wordpress-builder.mjs --project . check
```

### B. 接管任意既有 WordPress 站点

```bash
node /path/to/wordpress-build-skill/wordpress-builder.mjs adopt existing-factory \
  --root /absolute/path/to/projects \
  --domain existing-site.hostingersite.com
```

`adopt` 会生成 `mode: external` 的项目，读取线上 WordPress、active theme、插件清单和站点信息，并复用账号级 SSH key。外部项目允许内容、导航、模板分配、备份、审计和状态检查；但 `deploy`、`media`、`content`、`setup` 会被阻断，避免用本地 Starter 覆盖客户线上代码。

### C. 检查真实 WordPress 形态

```bash
node /path/to/wordpress-build-skill/wordpress-builder.mjs --project . project inspect
```

它会读取 WordPress 版本、active theme、theme type、导航机制、page templates、插件、公开 CPT/taxonomy、表单和内容计数。该结果决定 Content 和 Design Skill 能安全执行哪些操作。

### D. 接入 Hostinger

先确认 Hostinger CLI 和账户访问：

```bash
node /path/to/wordpress-build-skill/wordpress-builder.mjs hostinger setup --install --connect
```

查看账号下可管理的站点：

```bash
node /path/to/wordpress-build-skill/wordpress-builder.mjs sites list
```

然后把 `project.json` 里的 `domain` 改成实际测试/生产域名，再运行 SSH 向导：

```bash
node /path/to/wordpress-build-skill/wordpress-builder.mjs --project . ssh setup
```

向导会自动完成：

1. 创建或复用账号级 SSH key；
2. 从 Hostinger 网站列表和 DNS 推导 SSH user/host；
3. 保存 `project.json`；
4. 首次需要时自动 bootstrap key；
5. 测试 SSH 和远程 WP-CLI。

SSH key 是 hosting account 级的：同一个 `u123456789` 账号下的网站可以复用 `~/.ssh/hostinger-u123456789_ed25519`。新项目默认选择这个账号级 key，不再复制旧项目里的 key。

自动 bootstrap 使用已授权 Hostinger CLI 的 Files + temporary Cron Job；成功后删除临时 Cron。若 API 权限或主机状态不允许，命令会自动降级：复制 public key、打开 hPanel，让用户粘贴一次。保存后重新运行 `ssh setup`。已有可用 private key 的用户传 `--ssh-key <path>`；不想让 WordPress Builder 自动写入 key 时加 `--no-install-key`。

然后：

```bash
node /path/to/wordpress-build-skill/wordpress-builder.mjs --project . doctor
node /path/to/wordpress-build-skill/wordpress-builder.mjs --project . deploy --with-content
```

- 首次部署使用 `--with-content` 导入 example/seed。
- 日常代码部署使用 `--skip-content`，避免覆盖后台编辑。
- 导航只在明确需要时用 `--with-nav` 重建。
- 生产站点不要把真实 SSH、密码、SMTP secret 提交进 Git。

### D. 交付前验证

```bash
node /path/to/wordpress-build-skill/wordpress-builder.mjs --project . cms-audit
node /path/to/wordpress-build-skill/wordpress-builder.mjs --project . editor-audit
node /path/to/wordpress-build-skill/wordpress-builder.mjs --project . audit-fields
node /path/to/wordpress-build-skill/wordpress-builder.mjs --project . verify --screenshots
node /path/to/wordpress-build-skill/wordpress-builder.mjs --project . verify-form
node /path/to/wordpress-build-skill/wordpress-builder.mjs --project . credentials show
```

`credentials show` 会输出后台地址、账号、一次性生成/轮换后的密码，用于直接交给站点所有者。

## 3. 日常运营与热更新

WordPress 不需要停机更新。WordPress Builder 通过 SSH/WP-CLI 同步主题、插件和受控内容，正常部署流程包含备份、缓存清理和验证。

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
→ 本地 npm test + node wordpress-builder.mjs --project . check
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
node wordpress-builder.mjs --project examples/classic-b2b-starter check
npm run package:starter
```

打包产物输出到 `dist/`，包含 tarball、SHA-256 和逐文件 manifest。

## 7. 文档地图

| 文档 | 用途 |
| --- | --- |
| [docs/HARNESS-GUIDE.md](docs/HARNESS-GUIDE.md) | 当前 WordPress Builder/Starter 使用手册（历史文件名保留） |
| [HANDOFF.md](HANDOFF.md) | 跨模型/新会话交接、当前基线和下一步提示词 |
| [docs/SKILL-SUITE-PLAN.md](docs/SKILL-SUITE-PLAN.md) | WordPress Builder Skill Suite 拆分与迁移方案 |
| [docs/SKILL-SUITE-PLAN-AUDIT.md](docs/SKILL-SUITE-PLAN-AUDIT.md) | Skill Suite 方案审计、当前架构限制和实施前置条件 |
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
