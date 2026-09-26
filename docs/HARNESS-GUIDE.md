# WordPress Builder + Starter 使用手册

本文是当前版本的操作入口。历史文档可能描述旧区块主题或旧部署流程；如果冲突，以本文、`examples/classic-b2b-starter/DESIGN.md` 和最新代码为准。

## 架构总览

```text
wordpress-build-skill/
├── harness/                  # CLI、质量门、Hostinger SSH/WP-CLI、截图、表单和审计
├── examples/classic-b2b-starter/
│   ├── theme/                # Classic WordPress theme + components + selectable templates
│   ├── plugin/               # CPT/taxonomy/ACF Free content model
│   ├── content/              # example seed、patch、blank media map
│   ├── config/               # native editor patterns
│   ├── docs/                 # 模板、CMS、组件、工具链规范
│   └── project.example.json  # 可复制为 project.json 的站点配置
├── tests/                    # 回归测试
├── process_docs/             # 迭代过程记录
└── dist/                     # 打包产物（不提交）
```

## 核心原则

1. **WordPress Builder 管流程，Starter 管正面基线。** WordPress Builder 不假定任意 WordPress 站；Starter 提供可检查、可部署的约定。
2. **一份数据一个 owner。** 结构化内容在 ACF/CPT；长正文在原生编辑器；站点全局在 Customizer/options。
3. **模板可选择，路由不靠 slug。** WordPress page template、CPT template header 和 ACF template choice 分工明确。
4. **部署有安全边界。** 普通部署不重建导航；写远程前先 doctor/check/backup；回滚使用 backup id。
5. **验证不是可选步骤。** route、CMS、ACF、editor、form、screenshots 都是交付门槛。

## 新项目初始化

### Starter 路径，推荐

```bash
git clone https://github.com/jackzhang1314/wordpress-build-skill.git
cd wordpress-build-skill
npm ci

node wordpress-builder.mjs init client-site --root ../projects --from-starter
cd ../projects/client-site
node ../../wordpress-build-skill/wordpress-builder.mjs --project . check
```

### 通用空项目路径

```bash
node wordpress-builder.mjs init minimal-site --root ../projects
```

该路径只生成最小 Classic PHP reference，适合新架构实验；生产 B2B 站优先使用 `--from-starter`。

### 接管任意既有 WordPress 站点（不需要 Starter）

```bash
node wordpress-builder.mjs adopt existing-factory \
  --root ../projects \
  --domain existing-site.hostingersite.com
```

`adopt` 会创建 `mode: external` 项目：读取线上站点标题、WordPress 版本、active theme、插件清单和时区，并配置账号级 SSH key。它**不复制、不覆盖、不重建**线上主题或插件。

外部项目推荐命令：

```bash
node wordpress-builder.mjs --project ../projects/existing-factory check
node wordpress-builder.mjs --project ../projects/existing-factory backup
node wordpress-builder.mjs --project ../projects/existing-factory status
node wordpress-builder.mjs --project ../projects/existing-factory edit-page about --file body.html --adopt-remote
node wordpress-builder.mjs --project ../projects/existing-factory nav add 'Products' --url /products/
node wordpress-builder.mjs --project ../projects/existing-factory template assign about --template page-templates/customer.php
```

外部项目会阻止 `deploy`、`media`、`content`、`setup` 和 `configure-seo`。这些命令可能同步本地主题/插件或安装插件；接管已有站时必须先显式建立源码管理策略，不能默认用 Starter 覆盖。

## 配置 project.json

`--from-starter` 会生成不含 SSH 的本地 project.json。接入主机前至少修改：

| 字段 | 说明 |
| --- | --- |
| `title` | 站点标题 |
| `domain` | Hostinger 站点域名，不含 `https://` |
| `contentMarkers` | 部署后应出现的品牌 marker |
| `requiredPlugins` | Starter 默认 ACF、Rank Math、Fluent Forms、Classic Editor；外部项目必须为空或按实际站点配置 |
| `ssh.host/port/user/keyPath/wpPath` | SSH/WP-CLI 执行通道 |
| `seed.enabled` | 首次部署导入示例/内容；生产正式内容部署前重新审查 |
| `media.sources` | Starter 默认为空，保持 zero-media |
| `sourceProfile` | `starter` 或 `custom`；Starter 专属质量门只作用于 `starter` |

远程命令会拒绝 example-only 配置，防止误写占位项目。`mode: external` 是第二层保护：它明确表示 Builder 只管理内容/配置，不拥有本地主题和插件源码。

## 部署生命周期

### 本机 bootstrap

```bash
node harness/bootstrap.mjs --fix
```

会检查并修复 Node/npm/Git/rsync/tar/gzip、项目依赖、Skill runtime、Hostinger CLI。PHP/Docker/Chrome 是推荐能力：PHP/Docker 用于本地 PHP 语法检查，Chrome 用于截图。

### Hostinger 连接

```bash
node wordpress-builder.mjs hostinger setup --install --connect
```

`--install` 在 macOS/Linux + Homebrew 下安装官方 Hostinger CLI；无 Homebrew 时返回官方 release 安装指引。`--connect` 用只读订单列表验证账户已授权，不会创建站点。

列出账号下站点：

```bash
node wordpress-builder.mjs sites list
```

把远端站点和本地项目目录关联起来：

```bash
node wordpress-builder.mjs sites status --root ../projects
```

该命令只读取 Hostinger 清单、本地 `project.json`、备份 manifest 和部署状态文件，不写任何远端数据。它输出 unique / unmatched / ambiguous、local-only 项目、模式、主题、SSH、最近备份/部署与 inspection 新鲜度。

### SSH 向导

```bash
node wordpress-builder.mjs --project . ssh setup
```

向导会生成/复用账号级 key（`~/.ssh/hostinger-<user>_ed25519`），读取 Hostinger 网站列表和 DNS，保存 `project.json`，并测试 SSH/WP-CLI。新项目不再复制旧项目 key。默认会自动 bootstrap key；只有传 `--no-install-key` 才禁用。

自动 bootstrap 通过 Hostinger Files 上传一次性脚本，用 temporary Cron Job 追加 public key；SSH 连通后删除 Cron。它只针对当前已授权的 hosting account。若自动 bootstrap 不可用，向导自动降级为复制 key 并打开 hPanel；用户粘贴后重跑 `ssh setup`。同一 hosting user 下的后续网站直接复用该 key；不同 hosting order/user 仍需各自授权。已有可用 private key 时用 `--ssh-key <path>`。

### 项目、站点与路由检查

```bash
node wordpress-builder.mjs --project . project inspect --json
node wordpress-builder.mjs --project . project inspect --route-set core --json
node wordpress-builder.mjs --project . project inspect --routes /,/about/ --json
```

`project inspect` 用一次只读 WP-CLI 请求读取 WordPress 版本、active theme、theme type、插件、导航机制、page templates、公开 CPT/taxonomy、表单和内容计数。Content 和 Design 操作必须根据这个真实形态选择适配器。

对 Block/FSE 或混合站点，`--route-set core` / `--routes` 会继续向 WordPress 的 `_wp-find-template` 只读探测协议请求每个路由，记录实际选中的 template、template parts、导航归属和 `theme/custom` 来源。站点库存只说明对象存在；路由诊断才说明当前页面由谁渲染。因此未使用的 `wp_navigation` 不能当成当前导航，Classic menu location 不能在 Block 主题里自动当成已渲染导航，custom 数据库模板不能误报成 theme 文件。诊断失败、缺少部件或 markup 无效时输出 low confidence，不转成写权限。

受支持的路由级 `wp_navigation` 更新使用两阶段命令：

```bash
node wordpress-builder.mjs --project . nav block plan --route / --file content/block-nav.json
node wordpress-builder.mjs --project . nav block apply --plan <plan-id>
```

只支持当前 route 引用且内容为扁平 `wp:navigation-link` 的导航。Plan 记录 owner、影响面和 before/after hash；Apply 复查漂移、创建 snapshot、更新、读回、清缓存、验证前台 label，失败自动回滚。inline navigation、子菜单和 template/part 编辑仍需明确 source custody。

### Builder-managed 新页面

在已有 Elementor/Divi/自定义编辑器站点上，不转换历史页面，新增页面使用 Builder Core：

```bash
node wordpress-builder.mjs --project . builder install
node wordpress-builder.mjs --project . builder page plan --file content/builder-page.json
node wordpress-builder.mjs --project . builder page apply --plan <plan-id>
```

Plan/apply 只允许 Builder CPT、Builder 插件模板和九个 Builder ACF 字段；apply 会复查 drift、创建 snapshot、读回模板/字段、验证公网 verifyText 并自动回滚。Builder Landing 支持 hero、主内容、benefits、specifications、FAQ 和底部 CTA；第三方编辑器私有数据会被拒绝。

FSE template / template part 的精确片段修改：

```bash
node wordpress-builder.mjs --project . block-template plan --route / --part header --file content/template-patch.json
node wordpress-builder.mjs --project . block-template apply --plan <plan-id>
```

Patch 文件包含唯一 `find`、`replace` 和 `verifyText`。目标必须是当前 route 选中的 template/part。custom source 直接更新 override；theme source 创建 custom override。Apply 复查漂移、创建 snapshot、读回、清缓存并验证前台文本，失败自动恢复或删除新建 override。theme.json、PHP 文件和任意全文覆盖仍需 source custody。

### 已有 Hostinger 站点

如果已有站点使用 Starter 或已有受控本地源码，先在项目目录执行：

```bash
node wordpress-builder.mjs --project . doctor
node wordpress-builder.mjs --project . check
node wordpress-builder.mjs --project . deploy --with-content
```

如果只是“线上已有但本地无源码”的站点，改用上文 `adopt`。外部项目的 `deploy --with-content` 会被阻断，这是防止误覆盖旧站的保护，不是缺陷。

### 首次自动开站

```bash
node wordpress-builder.mjs --project . provision \
  --domain your-site.hostingersite.com
```

`provision` 会创建站点/WordPress、自动配置账号级 SSH key，再安装并激活默认插件：ACF Free、Rank Math Free、Fluent Forms、Classic Editor。若无环境密码，会生成随机 WP admin 密码并写入私有凭据文件。

### 日常更新

```bash
node wordpress-builder.mjs --project . deploy --skip-content
```

`--skip-content` 适合 source 项目主题/插件热更新。后台编辑的内容、导航和新增询盘不会被重建。外部项目不使用整站 deploy；继续用 `edit-page`、`post push`、`nav`、`template assign` 做精确更新。

## Starter 修改地图（可选路径）

| 要改什么 | 位置 |
| --- | --- |
| 颜色、字体、间距、组件状态 | `theme/style.css` + `DESIGN.md` |
| 页面结构 | `theme/templates/{home,products,categories}/` |
| page template 选择器 | `theme/page-templates/` |
| 全局 header/footer | `theme/parts/site-*.php` |
| 通用组件 | `theme/inc/components.php` |
| 页面数据映射 | `theme/inc/page-data.php` |
| 可选模板路由 | `theme/inc/template-loader.php` |
| CPT/taxonomy/ACF | `plugin/starter-model.php` |
| 示例内容 | `content/site-data.json` |
| 长正文 pattern | `config/editor-block-patterns.json` |
| 部署/验证配置 | `project.json` |

## CMS/ACF 规则

- ACF term 字段读取必须使用 `product_collection_{$term_id}`。
- field group 超过约 8 个字段时用 tabs。
- 每个 field 提供 label、instructions、REST access、有效 location。
- 不引入 ACF PRO repeater/flexible content/gallery。
- 产品规格、quick specs、FAQ、类目内容、资源、工厂能力都必须逐项后台可编辑。
- 改内容模型后运行：

```bash
node wordpress-builder.mjs --project . cms-audit
node wordpress-builder.mjs --project . audit-fields
```

## 表单和邮件

Fluent Forms 是询盘入口，contact 页使用 `[starter_rfq_form]`。邮件发送使用主题 mu-plugin 读取 `wp-config.php` 常量，推荐 Hostinger 企业邮箱 + `smtp.hostinger.com`。

```bash
node wordpress-builder.mjs --project . smtp configure
node wordpress-builder.mjs --project . smtp test
node wordpress-builder.mjs --project . verify-form
```

真实收件箱验证是交付门槛；Fluent Forms 入库成功不等于 SMTP 送达成功。

## 验证矩阵

```bash
node wordpress-builder.mjs --project . check
node wordpress-builder.mjs --project . cms-audit
node wordpress-builder.mjs --project . editor-audit
node wordpress-builder.mjs --project . audit-fields
node wordpress-builder.mjs --project . verify --screenshots
node wordpress-builder.mjs --project . verify-form
```

最低截图集合：home、product archive、product detail、category、blog/article、about、contact，宽度 `390/768/1440`。

## Starter Template 独立仓库

<https://github.com/jackzhang1314/b2b-wordpress-starter-template>

用户可以直接 “Use this template” 或 clone，把 `starter/` 作为项目源。Harness 仓库内的 `examples/classic-b2b-starter/` 是开发真源；发布脚本同步/打包为独立 release。

## 版本策略

- Harness package version：工具/API/质量门变化时更新。
- Starter plugin version：CPT/ACF/seed contract 变化时更新。
- Standalone starter release：面向用户复制的模板包 release，使用 semver。
- 破坏性变化必须在 `RELEASES.md` 写明迁移步骤和验证结果。
