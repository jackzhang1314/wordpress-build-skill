# WordPress真实HTTPS验收与模型待配置

时间：2026-09-08 03:10:56 GMT+8
触发：真实浏览器连接器阶段完成，保存等待外部配置状态。

主区/目标codex/agent-workspace-sandbox，40be38e外未提交、无交付SHA。产品82项/types/lint/候选build通过，新增辅助TS最终types/lint通过。独立候选已实际装载到测试Chrome，真实HTTPS应用密码连接、四页草稿写入回读通过；modelRun=false，隔离模型API未配置，真实Agent端到端待用户配置后继续。未覆盖dist或重载用户扩展。

关键文件：tests/wordpress-browser-acceptance.ts（实际产品函数的扩展环境验收），wordpress-site/tests/serve-https-acceptance.mjs（开发专用回环TLS与单次bootstrap），研究目录e2e/示例企业资料.md、完整验收任务.md、https-connector-result.json、candidate-build.json、README.md。无产品新入口、依赖或架构变化，不必改架构图。模块、状态、合并清单同步实际验收边界。

保留故障：443绑定权限失败→隔离Chrome端口映射9443；跨扩展bootstrap Origin缺失→保留随机令牌与单次消费、拒绝不匹配显式Origin；首次只读连接网络失败且无wpOperations→核查认证200后重试。普通标签页打开侧栏会被产品拒绝，改用真实sidePanel.open。以上不改变生产连接器限制。

下一步：用户只在隔离插件设置中配置模型，不在聊天发密钥；真实模型任务复用已有6–9草稿并完成发布/首页/导航。当前未运行模型，不称整站自主交付通过。测试进程与私有凭据保留用于续验，后续收尾再关闭并撤销测试应用密码。
