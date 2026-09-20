# 本地原生 PHP / MySQL / SMTP 验收

2026-09-20 04:59 Asia/Shanghai 完成。最终 [总报告](run-6cJ4Tu/summary.json) 为 passed。

用户指出部署、邮件和数据库恢复可以在本地验收。本轮把“未验证”与“只能在线上验证”分开，增加 `npm run hongda:native`，不依赖正式主机或客户资料。

## 实测范围

| 环节 | 结果与证据 |
| --- | --- |
| 原生环境 | WordPress 7.1 / PHP 8.3.33 / MySQL 8.4.11；镜像内容 ID 已记录。该矩阵不同于前轮 Playground 7.1.1 / PHP 8.3.32，不混写版本 |
| 代码部署 | 从 ZIP 解压到独立文件卷，20 个文件与交付哈希一致，WP-CLI 激活主题/插件；WordPress ZIP 安装器本身由前轮 e2e 覆盖 |
| 业务链 | [80 次页面请求及 15 项检查](run-6cJ4Tu/runtime.json)，包括实际 Skill 内容写入/回读、安全重放、字段/正文/主图、分页筛选和 404 |
| SMTP | [浏览器询盘](run-6cJ4Tu/enquiry.json)：4 项必填、无效产品拒绝、成功提交；新增 1 询盘与 1 邮件。`pre_wp_mail` 无拦截，PHPMailer 连接 Mailpit SMTP。收件 API 实际 To 为 reference@example.test，主题 HONGDA preview inquiry，邮件包含测试提交邮箱 |
| MySQL 恢复 | 原生 mysqldump 导出，再导入独立 MySQL 数据库；URL 替换先 dry-run。6 张内容/关系/询盘表逐行逻辑哈希、关键配置和 30 个上传文件哈希一致，SQL 快照未改动 |
| 数据持久性 | 强制重建源 Web 容器，数据库和上传卷保留，内容哈希仍一致；源站与恢复站共 14 条路由复验通过 |

[恢复前逻辑状态](run-6cJ4Tu/before-state.json) 仅含行数和哈希，不含数据库内容或密码。核心内容、ACF、分类关系、菜单、页面配置和询盘参与比对；运行期 transient、用户会话等不纳入逻辑哈希。SQL 全库导出保留在私有目录。

## 复现

```sh
npm run hongda:native
```

需要可用 Docker Compose、`wordpress:php8.3-apache`、`wordpress:cli-php8.3`、`mysql:8.4`、`public.ecr.aws/supabase/mailpit:v1.30.2` 镜像、现有 ACF/Fluent Forms/SEO Framework 插件目录，以及 Playwright CLI。插件目录可通过 WP_TEST_PLUGINS_PATH 指定。镜像标签不是固定摘要；每轮以报告中的实际镜像 ID 和运行版本为准。

使用唯一 Compose 项目；9468/9469/9470 仅绑定 127.0.0.1，运行结束停止本轮容器。数据库不开放宿主端口。测试 SMTP 指向专用 Mailpit，无外发中继。`.lab/hongda-native-latest.json` 记录该轮 Compose 路径、项目名及私有资料位置。保留停止的容器和卷用于调查，不自动删除其他环境或历史数据。开始前确保三个端口空闲。

安装包只含主题和业务插件。Docker 配置、SMTP 测试辅助插件、凭据、SQL、上传快照在私有运行目录；不将其作为客户生产代码交付。

## 失败与修复

- 首次尝试：Docker internal 网络在本机无法通过已发布端口从宿主访问；保留 interrupted 报告。改为专用普通 bridge，端口仍仅 loopback，邮件仍只进入本地 SMTP。
- 第二次 [失败报告](run-iT7KWx/summary.json)：查询结果 JSON 默认转义 URL 斜杠，地址归一化失效，恢复逻辑哈希误报。改为 JSON_UNESCAPED_SLASHES 后完整重跑通过；并未跳过数据表检查。
- WP-CLI 已加载 WordPress，seed 再 require wp-load 导致常量重复警告；改为仅未加载环境时引导 WordPress，最终运行没有该警告。
- WP-CLI 对 hard rewrite 的环境识别仍有警告；Docker 默认 .htaccess 下原站、恢复站真实路由及 404 均通过，未据此声称所有 Web Server 重写规则通用。

配套检查：typecheck、lint、35 项测试、build、10 个官方模块完整性、Skill quick_validate 通过。

## 后续边界

视觉可在本地检查，不需要生产部署；当前设计仍待改进。本轮没有以技术通过代替视觉认可。

本地 SMTP 收件不等于 Gmail/Outlook 的收件箱投递与 SPF/DKIM/DMARC/反垃圾信誉验证。本地部署与恢复不等于目标主机的备份设施、公网 DNS/TLS/CDN 已通过。后续应按实际目标逐项补验，而不是将所有部署、邮件、数据库检查一概延后。

参考：[Mailpit API](https://mailpit.axllent.org/docs/api-v1/)、[WordPress WP-CLI 数据库导出](https://developer.wordpress.org/cli/commands/db/export/)。本轮实际调用 MySQL 容器自带 mysqldump/mysql，WP-CLI 负责 WordPress 安装、激活、数据读取与 URL 迁移。
