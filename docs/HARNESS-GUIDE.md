# Harness + Starter 使用手册

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

1. **Harness 管流程，Starter 管正面基线。** Harness 不假定任意 WordPress 站；Starter 提供可检查、可部署的约定。
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

node harness/cli.mjs init client-site --root ../projects --from-starter
cd ../projects/client-site
node ../../wordpress-build-skill/harness/cli.mjs --project . check
```

### 通用空项目路径

```bash
node harness/cli.mjs init minimal-site --root ../projects
```

该路径只生成最小 Classic PHP reference，适合新架构实验；生产 B2B 站优先使用 `--from-starter`。

## 配置 project.json

`--from-starter` 会生成不含 SSH 的本地 project.json。接入主机前至少修改：

| 字段 | 说明 |
| --- | --- |
| `title` | 站点标题 |
| `domain` | Hostinger 站点域名，不含 `https://` |
| `contentMarkers` | 部署后应出现的品牌 marker |
| `requiredPlugins` | 默认 ACF、Rank Math、Fluent Forms、Classic Editor |
| `ssh.host/port/user/keyPath/wpPath` | SSH/WP-CLI 执行通道 |
| `seed.enabled` | 首次部署导入示例/内容；生产正式内容部署前重新审查 |
| `media.sources` | Starter 默认为空，保持 zero-media |

远程命令会拒绝 example-only 配置，防止误写占位项目。

## 部署生命周期

### 本机 bootstrap

```bash
node harness/bootstrap.mjs --fix
```

会检查并修复 Node/npm/Git/rsync/tar/gzip、项目依赖、Skill runtime、Hostinger CLI。PHP/Docker/Chrome 是推荐能力：PHP/Docker 用于本地 PHP 语法检查，Chrome 用于截图。

### Hostinger 连接

```bash
node harness/cli.mjs hostinger setup --install --connect
```

`--install` 在 macOS/Linux + Homebrew 下安装官方 Hostinger CLI；无 Homebrew 时返回官方 release 安装指引。`--connect` 用只读订单列表验证账户已授权，不会创建站点。

### SSH 向导

```bash
node harness/cli.mjs --project . ssh setup
```

向导会生成/复用专用 key，读取 Hostinger 网站列表和 DNS，保存 `project.json`，并测试 SSH/WP-CLI。若 Hostinger 后台还没有 public key，它会输出 key 和 hPanel URL；用户粘贴后重新运行即可。

### 已有 Hostinger 站点

```bash
node harness/cli.mjs --project . doctor
node harness/cli.mjs --project . check
node harness/cli.mjs --project . deploy --with-content
```

### 首次自动开站

```bash
node harness/cli.mjs --project . provision \
  --domain your-site.hostingersite.com \
  --ssh-host REPLACE_SSH_HOST \
  --ssh-port 65002 \
  --ssh-user REPLACE_SSH_USER \
  --ssh-key REPLACE_PRIVATE_KEY_PATH
```

`provision` 会安装并激活默认插件：ACF Free、Rank Math Free、Fluent Forms、Classic Editor。若无环境密码，会生成随机 WP admin 密码并写入私有凭据文件。

### 日常更新

```bash
node harness/cli.mjs --project . deploy --skip-content
```

`--skip-content` 适合主题/插件热更新。后台编辑的内容、导航和新增询盘不会被重建。

## Starter 修改地图

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
node harness/cli.mjs --project . cms-audit
node harness/cli.mjs --project . audit-fields
```

## 表单和邮件

Fluent Forms 是询盘入口，contact 页使用 `[starter_rfq_form]`。邮件发送使用主题 mu-plugin 读取 `wp-config.php` 常量，推荐 Hostinger 企业邮箱 + `smtp.hostinger.com`。

```bash
node harness/cli.mjs --project . smtp configure
node harness/cli.mjs --project . smtp test
node harness/cli.mjs --project . verify-form
```

真实收件箱验证是交付门槛；Fluent Forms 入库成功不等于 SMTP 送达成功。

## 验证矩阵

```bash
node harness/cli.mjs --project . check
node harness/cli.mjs --project . cms-audit
node harness/cli.mjs --project . editor-audit
node harness/cli.mjs --project . audit-fields
node harness/cli.mjs --project . verify --screenshots
node harness/cli.mjs --project . verify-form
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
