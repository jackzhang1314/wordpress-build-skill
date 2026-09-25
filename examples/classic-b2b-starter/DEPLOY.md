# Deployment Guide

本文覆盖 Starter 的 Hostinger 部署、首次内容导入、上线验证和回滚。手动复制文件只作为应急方案；优先使用 Harness。

## 前置条件

- Node.js 22+
- Git、rsync、tar、gzip、PHP 语法检查可用
- Hostinger SSH 账号和私钥
- WordPress 6.4+、PHP 8.1+
- 已配置 HTTPS 和 post-name permalink
- 目标域名可访问

## 1. 创建项目

推荐使用 Harness 的 starter 初始化：

```bash
cd /path/to/wordpress-build-skill
npm ci
node harness/cli.mjs init client-site --root ../projects --from-starter
```

## 2. 本地检查

```bash
cd ../projects/client-site
node /path/to/wordpress-build-skill/harness/cli.mjs --project . check
```

检查包括结构、heading hierarchy、PHP syntax、ACF 绑定、zero-media、组件契约、editor patterns 和 seed contract。

## 3. 配置目标站点

编辑 `project.json`：

```json
{
  "title": "Client Site",
  "domain": "client-site.hostingersite.com",
  "requiredPlugins": [
    "advanced-custom-fields",
    "seo-by-rank-math",
    "fluentform",
    "classic-editor"
  ],
  "ssh": {
    "host": "REPLACE_SSH_HOST",
    "port": "65002",
    "user": "REPLACE_SSH_USER",
    "keyPath": "REPLACE_PRIVATE_KEY_PATH",
    "wpPath": "/home/REPLACE_SSH_USER/domains/client-site.hostingersite.com/public_html"
  }
}
```

确认：

```bash
node /path/to/harness/cli.mjs --project . config
node /path/to/harness/cli.mjs --project . doctor
```

## 4. SMTP 与企业邮箱

推荐使用 Hostinger 域名邮箱 + Hostinger SMTP：

| 常量 | 示例 |
| --- | --- |
| `SMTP_HOST` | `smtp.hostinger.com` |
| `SMTP_PORT` | `465` |
| `SMTP_SECURE` | `ssl` |
| `SMTP_USERNAME` | `notify@your-domain.com` |
| `SMTP_PASSWORD` | Hostinger 邮箱密码 |
| `SMTP_FROM` | `notify@your-domain.com` |
| `SMTP_FROM_NAME` | 站点标题 |

将真实值写入服务器 `wp-config.php`，不要写入 Git。配置后执行：

```bash
node /path/to/harness/cli.mjs --project . smtp configure
node /path/to/harness/cli.mjs --project . smtp test
```

上线前必须收到真实测试邮件；表单入库和邮件送达是两个验证。

## 5. 首次部署

```bash
node /path/to/harness/cli.mjs --project . deploy --with-content
```

流程包括本地 check、远程备份、插件安装/激活、theme/plugin 同步、content seed、WordPress/Rank Math 配置、缓存清理、路由和数据库验证。

要重建导航时显式加：

```bash
node /path/to/harness/cli.mjs --project . deploy --with-content --with-nav
```

## 6. 日常热更新

主题、插件或模板修改：

```bash
node /path/to/harness/cli.mjs --project . deploy --skip-content
```

单页正文、文章、导航和模板：

```bash
node /path/to/harness/cli.mjs --project . edit-page <slug> --file body.html
node /path/to/harness/cli.mjs --project . post push article.json
node /path/to/harness/cli.mjs --project . nav add --label Products --url /products/
node /path/to/harness/cli.mjs --project . template assign about --template page-templates/about.php
```

## 7. 上线验收

```bash
node /path/to/harness/cli.mjs --project . cms-audit
node /path/to/harness/cli.mjs --project . editor-audit
node /path/to/harness/cli.mjs --project . audit-fields
node /path/to/harness/cli.mjs --project . verify --screenshots
node /path/to/harness/cli.mjs --project . verify-form
```

人工检查：

- [ ] 首页、产品、类目、行业、指南、About、Contact 均可访问。
- [ ] 每个路由只有一个 H1，没有跳级 heading。
- [ ] 产品规格、FAQ、类目内容、工厂信息均可在后台编辑。
- [ ] 产品详情底部长正文使用原生编辑器。
- [ ] Contact 渲染 Fluent Forms，测试提交入库。
- [ ] SMTP 测试邮件和表单通知均到达真实收件箱。
- [ ] `/sitemap_index.xml` 可访问，包含产品/指南/页面。
- [ ] 390/768/1440 无横向溢出，导航和表单可操作。
- [ ] 每张正式图片有 alt；无占位图残留在已上线内容中。
- [ ] 后台密码已轮换，凭据交付给站点所有者。
- [ ] 生产部署备份 ID 已记录。

## 8. 回滚

```bash
node /path/to/harness/cli.mjs --project . rollback <backup-id>
```

回滚覆盖 theme/plugin 文件；数据库和用户新增媒体/表单不在文件回滚范围内。重要内容操作前后必须保留数据库备份。

## 9. 交付

```bash
node /path/to/harness/cli.mjs --project . credentials show
```

输出后台地址、账号、邮箱和当前密码，交给站点所有者。上线后建议立即由用户修改密码或运行 `credentials rotate` 后再交付新凭据。
