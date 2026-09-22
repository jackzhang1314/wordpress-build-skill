# Hostinger 整站部署实测

时间：2026-09-20T19:01:27.322705+08:00（Asia/Shanghai）

## 触发与范围

用户指出仅开通空白 WordPress 不等于完成部署，要求继续上线本地 B2B 网站。授权目标为既有临时站 mediumblue-quail-505146.hostingersite.com；保留 mock/noindex，商业视觉质量和真实邮件送达单独验收。

## 执行中

- 从已验收的 b2b-release-EBtJjT 清理包建立隔离 prep 数据库，创建目标管理员、序列化安全替换 URL、激活四个基线插件、保留 noindex。原 localhost:9490 不变。
- 官方 CLI 3.35.0 的 TUS 上传已成功；先上传 Require all denied 并通过实际 HTTP 403，再上传 SQL 和压缩包。文件和凭据只在忽略目录保存。
- 官方 MCP 1.61.1 的整站 import helper 强制 is_empty，现有目标已经安装空白 WordPress，不直接将其当作空目录。评估使用官方 cron 能力调用主机 WP-CLI；当前仅提交只读预检，尚未写入业务数据库。
- 初次 cron 命令 API 已接受但未观察到执行证据，不能据 accepted 判完成；改为明确 /bin/bash 脚本和持久日志，并用原子目录锁防止重复执行，旧 cron 已删除。后续观察到脚本执行，平台调度存在延迟；cron output 为空不代表脚本没有运行，需读取脚本持久日志。
- 读取尚未生成的 preflight.log 返回 File does not exist，保留为未执行证据。
- 一次 zsh 无匹配 glob 报错，不影响部署；后续用 pathlib 检查文档冲突。

## 验收与遗留

首次部署及线上核心业务已通过，后续补充用户旧缓存复核；仍不将文件上传成功单独标为整站验收。

## 主机预检问题

- cron PATH 不含 wp，初次脚本报 command not found。改为上传已用于本地验收的 WP-CLI phar，明确通过 /usr/bin/php 调用。
- 第二次 WP-CLI --info 报 proc_open/proc_close 禁用。远端 CLI PHP 8.3.33；尝试仅在部署 CLI 进程加 -d disable_functions=，不修改 Web PHP 配置。已验证预检完整通过：WP-CLI 2.12.0、WP 7.1.1、PHP 8.3.33、数据库客户端 MariaDB 11.8.9。
- Chrome 未在 CUA 注册，createBrowserTab(chrome) 返回 Browser is not available；未触碰其他浏览器任务，继续使用已认证官方 CLI。

预检确认只有默认文章 ID 1 和隐私草稿 ID 3，表前缀 wp_、home 正确。平台自带 hostinger-ai-assistant、hostinger-easy-onboarding、hostinger-reach、hostinger 以及 auto-updates MU；保留文件，导入后仅启用基线四插件。首次迁移脚本已提交，每次运行使用原子锁防重放，先备份到用户 HOME 的 .harness-backups，再验 SHA-256、维护模式、解包/导入、核心数据库升级、重写/缓存刷新。

## 结果与故障闭环

- 真实首次迁移完成，备份在主机 HOME 的私有 .harness-backups 下；导入成功、维护模式退出、基线插件正常、noindex 保留。线上 WP 7.1.1 / PHP 8.3.33 / MariaDB 11.8.9。
- wp rewrite flush --hard 提示生成 .htaccess 需额外配置；未因此假定失败或盲改主机规则，现有规则实际支持所有业务路由及 404。
- 第一轮 HTTP 页面检查通过，但浏览器发现 CSS/JS/图片 404。确认根因为 umask 077 下非 root tar 解包使 wp-content/themes/plugins 父目录为 0700（归档原为 0755）。记录权限前后值后仅修复公开资源父目录为 0755，随后 CSS、图片实际 200；私有临时目录访问拒绝及站点外备份保持。
- 新增 scripts/hostinger/check-assets.mjs 与 tests/hostinger-assets.test.mjs，防止页面 200、静态文件 404 或 HTML 回退误报部署完成。两项测试通过；真实 8 个页面共 33 个同源资源通过。完整源码 lint 结果见最终检查。
- 首次截图只等待 img 可见，首屏图片尚未加载；重拍时等待 complete + naturalWidth > 0 并实际查看图片。记录此经验，不将瞬时加载空白当作最终视觉。
- 公网移动导航通过，首页表单/产品弹窗各成功提交，远端确认记录 ID 1/2，后一条 product_id=13。通知仍关闭，没有发送测试邮件。
- 3357 文件哈希、6 媒体、19 产品、后台管理员登录/产品编辑页均通过；临时 SQL/归档/执行脚本/WP-CLI 删除，任务删除后复查。原 localhost:9490 未修改。
- 经验回写 AGENTS.md、wordpress-builder SKILL、hostinger/release/verification references；更新架构与上手指南，公开证据在 docs/acceptance/hostinger-deployment。

尚未完成：真实邮件送达、远端恢复演练、正式域名与商业内容/视觉验收；当前交付是可访问并完成核心业务验收的 mock/noindex 公网预览站，不是这些未测项目已完成。

## 用户截图反馈：旧首页仍显示

用户在 Chrome 根域名看到部署前 WordPress AI Preview / Hello world，纠正仅凭新会话检查就认为所有访问正常的判断。检查发现主机原 .htaccess 的 ExpiresDefault access plus 1 weeks 导致 HTML Cache-Control public,max-age=604800；新请求已是 HONGDA，但既有浏览器副本可能继续使用旧 HTML。HTTP→HTTPS 正常，DNS 返回的两个 IPv4（147.79.120.173、148.135.128.78）经 TLS 校验固定解析访问均为 HONGDA，不支持把此现象归因于当前域名错指。

处理：启用 Hostinger cacheless 开发模式、清平台缓存、私有保存原 .htaccess 后添加预览 PHP HTML 的 no-store/no-cache/must-revalidate/max-age=0 头。新请求两地址均 200/HONGDA，Cache-Control 正确，CDN BYPASS。既有浏览器已缓存副本无法由服务器追溯删除；提供带部署参数的新地址及一次强制刷新。正式上线时需重新设计 HTML 可重验证缓存，而非永久关闭全部缓存。证据 cache-policy.json。

浏览器控制补充：CUA getApp Chrome 返回 native pipe closed，无法确认用户现有标签缓存内容；另一任务提示正在使用常用 Chrome，已停止此窗口操作，后续只用 CLI 和隔离验收会话。尝试 www 子域名证书不匹配；该平台临时站没有配置 www，不将其视为当前根域名故障或擅改其 DNS。

最终检查：新增资源检查单元测试 2/2 通过、npm run lint 通过、git diff --check 通过；临时 cron 列表为空。

## 用户确认与 Harness 固化

更新时间：2026-09-20T19:41:07.192706+08:00（Asia/Shanghai）。用户确认无痕浏览器访问原域名正常，补齐此前无法代替用户验证的旧会话/新会话对照证据。此前把带参数链接和新会话成功当作可交付结论过早；明确原始地址仍必须验收，不能强行归咎用户或盲改 DNS。

新增 check-preview.mjs / hostinger-preview.test.mjs：原 HTTPS 地址不带查询参数，匹配实际站点标识，预览 HTML 必须 no-store，拒绝跨站/路径/带参数跳转。该检查仅适用预览，fresh network 不能证明已有浏览器缓存已清除。资源与预览检查共 5 个回归测试通过，继续进行线上原地址和完整内链复验。

后续实测：preview-gate.json 的 4 个不带参数页面全部通过，links.json 的 43 个入口可达站内链接全部通过；npm run lint 与 git diff --check 通过。没有重跑询盘写入，没有切换用户正在使用的 Chrome。

邮件前置只读检查：官方 CLI mail orders 返回 total=0；domain portfolio 两条记录均 domain=null/pending_setup，为 free_domain 与 free_domain_transfer 待配置权益，不是已配置的正式域名。未领取/购买域名、未创建邮箱、未发送邮件。下一阶段真实邮件配置需要确定实际发件域名和服务，不能把管理员 Gmail 地址直接当成已认证的站点发件身份。
