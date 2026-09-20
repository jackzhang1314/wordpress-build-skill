# WordPress配套插件与主题服务端验收

时间：2026-09-08T01:38:00.837161+08:00；触发：独立模块与实际服务端关键测试完成。

wordpress-site/plugin/octopus-site注册产品/案例CPT、原生字段、可选ACF字段编辑、受限站点配置与权限/版本核验。wordpress-site/theme/octopus-trade提供原生区块主题、模板、品牌样式和core/post-meta动态绑定。没有任意PHP执行接口，业务数据不依赖主题。

使用独立/tmp/octopus-wordpress-acceptance安装官方@wp-playground/cli3.1.40，在实际PHP/WordPress中运行wordpress-site/tests/acceptance.php，16项全部通过。实际版本WordPress6.9.7/PHP8.5.6，以运行回执为准。覆盖CPT/REST创建、字段动态渲染与更新、主题激活、首页、权限、陈旧版本、非法CSS、未知设置、草稿首页和换主题数据保留。证据docs/research/browser-wordpress-site-20260908/wordpress-server-acceptance.json。

Docker未运行，改用官方Playground；初装CLI3.1.53因上游blueprints同版本缺包失败，固定3.1.40成功。Playground仅开发验收依赖，不加入扩展package.json。当前未验证ACF已安装模式、视觉编辑/前端响应式、正式站点。扩展工具和配置页尚未接入，待并行回归冻结解除继续。源码主区未提交，核对HEAD953ba652，目标codex/agent-workspace-sandbox。
