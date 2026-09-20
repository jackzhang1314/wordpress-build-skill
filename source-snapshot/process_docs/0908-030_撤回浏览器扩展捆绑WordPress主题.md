# 撤回浏览器扩展捆绑WordPress主题

时间：2026-09-08T02:04:21.984977+08:00；触发：用户纠正产品边界，撤回错误实现。

决定：浏览器扩展提供WordPress连接器、Skills和能力适配，不捆绑固定主题，不绑定自有主题。普通建页沿用用户当前主题；可选站点插件仅提供数据模型和有限站点设置，不能成为普通建页前提。

已移除：build.mjs主题打包项、preview主题下载路由、连接器主题下载链接、wpConfigureSite的activateTheme/brandColor字段与专属主题判断。站点配套插件同样移除主题激活和品牌写入接口。修正site-setup Skill、安装说明、README与架构方案；旧主题源码和旧过程证据仅留档，不进入发行包，不是当前产品能力。

验证：types/lint、5文件53项、build通过；dist/wordpress-site仅manifest.json与octopus-site-0.1.0.zip，断言无theme条目/主题ZIP通过。新增拒绝主题激活和专属品牌字段的回归。本轮正式插件ZIP在WordPress6.9.7/PHP8.3.31/ACF6.8.9完成19项服务端验证，包含既有主题保持不变、主题激活字段被拒绝；证据docs/research/browser-wordpress-site-20260908/no-theme-acceptance.json。不沿用原主题验收冒充本轮。

工作区/目标codex/agent-workspace-sandbox，HEAD378367f外未提交，无交付SHA。dist已更新，未重载用户扩展。模块/架构/状态/清单已同步撤回边界。
