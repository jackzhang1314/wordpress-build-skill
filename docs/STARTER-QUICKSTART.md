# 克隆后体验完整 WordPress 模板站

仓库同时提供建站 Harness 与可运行的 B2B WordPress Starter。它用源码和受控演示数据创建新数据库，不复制线上账户或询盘。

## 包含什么

- `examples/b2b-block-starter/theme/`：完整原生区块主题、页面模板、产品双模板、分类布局、导航、样式和脚本。
- `plugin/`：业务 CPT、分类、ACF 字段及动态区块。
- `content/`：首页/About 区块正文、产品/行业/文章等演示数据、初始化脚本和六张来源已记录的图片。
- `config/wordpress-plugins.json`：ACF Free、Fluent Forms Free、Rank Math Free 与业务插件的版本基线。
- WordPress 核心、PHP 和 MySQL：通过官方 Docker 镜像运行；第三方插件按清单下载安装。第一次启动需要网络，不是离线全量镜像。

## 启动

安装 Node.js 22+、Docker（含 Compose），并登录有权读取本私人仓库的 GitHub 账户：

```sh
git clone https://github.com/jackzhang1314/wordpress-build-skill.git
cd wordpress-build-skill
npm run harness:setup
npm run starter:start
```

打开 http://127.0.0.1:9490/；后台为 http://127.0.0.1:9490/wp-admin/。另有 9491 模型复用测试站和 9492 本地测试邮箱。外发邮件不启用，页面保持 noindex。

如果端口被占用，可运行 `WP_STARTER_PORT=9690 npm run starter:start`，会使用连续三个端口。每次 start 都创建新的隔离实例，已有实例不会自动删除；不要把 start 当成重启命令。部分仓库历史验收命令仍限定默认端口，非默认端口不要直接照搬。

管理员账号为 `admin`，密码每次安装随机生成，保存在被 Git 忽略的 `.lab/b2b-starter-latest.json` 的 `adminPassword` 字段。可在本机编辑器查看；不要提交或分享这个文件。

## 在已有站点上改造

修改 `theme/` 或 `plugin/` 后运行：

```sh
npm run build
npm run starter:sync
```

同步代码保留数据库和后台编辑；数据库保存的模板可能遮蔽主题文件更新，应先检查模板覆盖。正文、产品字段、图片和模板选择可直接在后台操作。`starter:design` 会重写演示正文，不要用于保留客户编辑的日常更新。

本地实例信息在 `.lab/b2b-starter-latest.json`，包括 Compose 文件和项目名。可用这些值运行 `docker compose -p PROJECT -f COMPOSE stop` / `start` 停止和恢复；不要使用全局删除或 `down -v` 清空其他站点。

这是完整演示内容的可重建起点，并非线上数据库逐字节快照。线上手工编辑、历史询盘、用户和媒体新增不会自动回流到 seed；迁移这些内容需要另做授权导出和脱敏验收。产品参数与图片为演示，实际商业站需要替换为真实资料。当前视觉质量和正式邮件交付仍有待验收项。

## 缺依赖时的统一入口

`npm run harness:doctor` 只读检测；`npm run harness:setup` 安装缺失 npm 依赖并构建/校验 Skill。需要 Docker 且 macOS 已有 Homebrew 时可加 `-- --install-system`；安装后仍须启动 Docker 并完成首次 UI。部署前用 `npm run harness:setup -- --deploy --connect`，按需安装 Hostinger CLI 并触发官方登录。Windows/Linux 无对应安装器时报告具体官方配置步骤，不声称全平台自动安装。Node 本身缺失时由 Codex 先配置 Node.js 22+，npm 命令无法安装执行它自身所需的运行时。

WordPress、PHP、MySQL、容器内 WP-CLI 在 starter:start 阶段提供，ACF/表单/SEO 插件按统一版本清单安装；无需额外 WordPress MCP。本机 doctor 通过不代表镜像已下载、所有插件安装通过或网站已经上线。高级浏览器/性能/PHPStan 工作流仍按专业 Skill 独立检查工具，当前 doctor 不宣称覆盖全部可选模块。
