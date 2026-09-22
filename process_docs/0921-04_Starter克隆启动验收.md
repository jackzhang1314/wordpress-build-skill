# GitHub Starter 克隆启动验收

时间：2026-09-21T06:46:01.085532+08:00（Asia/Shanghai）。
触发：用户希望仓库包含可体验/改造的完整 WordPress 模板项目，而非仅 Skill。

已确认远端已有 theme/plugin/content、六张产品图片及源码初始化；WordPress/PHP/MySQL 使用官方 Docker 镜像，免费插件按清单在线安装，不携带线上账户或询盘。新增 STARTER-QUICKSTART.md 并增加 README 入口。支持 WP_STARTER_PORT 指定连续三个本地端口，DB readiness 改成带认证 SELECT 1。

实测：独立发布副本、不使用原插件缓存，在 9690/9691 从空数据库完成两个实例启动；主站 19 页面、9 文章、19 产品、11 行业方案、6 附件，区块主题和 noindex 正常；首页/产品目录/联系/About/登录页 HTTP 200。实际核心 7.1、PHP 8.3.33、MySQL 8.4.11、ACF 6.8.9、Rank Math 1.0.278、Fluent Forms 6.2.9；不冒称与 Hostinger 7.1.1 完全相同。未执行这轮新站的完整浏览器交互回归。

问题：第一次 9590 实验仅修改启动端口，redesign/rankmath 的固定地址保护未调整导致拒绝；已在私有内容副本映射实际 URL 后重跑通过。失败实例只停止所属 Compose 项目并保留数据，未动原 9490。WP-CLI rewrite 提示 .htaccess 配置警告，实际关键漂亮 URL 均 200；保留警告不忽略结果。lint 检出 SELECT 1 字符串冗余转义，已修正。

本轮可重建演示内容，不是线上后续人工编辑的自动快照；真实资料与视觉质量边界保持。原始站私有指针未覆盖，发布副本有自己的 .lab 指针。已生成的演示管理员密码不进 Git。
