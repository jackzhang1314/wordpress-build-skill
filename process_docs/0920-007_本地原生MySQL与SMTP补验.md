# 本地原生 MySQL 与 SMTP 补验

时间：2026-09-20 05:00 Asia/Shanghai（UTC+08:00）。

触发：用户指出此前列为“需生产验收”的能力也能在本地验证。纠正环境边界，将原生部署/MySQL/SMTP 本地验收与公网目标验收分开。

主要工作：新增 scripts/hongda-native.mjs 和 fixtures/hongda-native/{smtp,state}.php，使用独立 Docker Compose 项目启动 PHP/Apache、MySQL 源库/恢复库及 Mailpit；源码 ZIP 部署与哈希核对、实际 Skill 内容操作、浏览器询盘、真实 SMTP 收件、原生数据库导入导出、数据/配置/媒体哈希、容器重建和路由复验。扩展 seed 的隔离地址白名单与 CLI 引导兼容；既有 inquiry 脚本支持 SMTP 接收 API 检查；增加 package 命令和 lint 路径。回写 Skill verification/release、README、架构文档。

最终报告：docs/acceptance/hongda-native/run-6cJ4Tu/summary.json，passed。WordPress 7.1 / PHP 8.3.33 / MySQL 8.4.11；20 部署文件哈希一致、80 页面请求/15 检查通过、1 询盘和 1 SMTP 邮件、6 张业务内容/关系/询盘表哈希和关键配置一致、30 媒体文件一致；Web 容器重建保留数据，14 路由复验通过。用户现有容器、9464/9465 和历史数据库未改动。

失败记录：首次 internal bridge 宿主访问不可用，停止本次容器并保留 interrupted 记录；第二次 JSON 斜杠转义导致 URL 归一化哈希误报，修复后全量重跑；seed 在 WP-CLI 内重复加载配置警告修复。原始失败证据保留，详见 native/README。

验证：typecheck、lint、35 测试、build、10 官方模块哈希和 Skill quick_validate 通过。最终本轮容器已停止，具名卷和私有 SQL/快照保留，不上传凭据或完整数据库。代码工作区存在此前未提交内容，本轮未暂存或提交。

遗留：视觉在本地即可验收，但本轮没有修改视觉，不宣布合格。真实收件箱投递、公网 DNS/TLS/CDN 和目标主机差异在选定目标后验证；不能以这些边界阻塞本地能验证的技术链。
