# WordPress简单导航精确修改交付

时间：2026-09-08 02:54:09 GMT+8
触发：主要导航模块与验收完成。

主共享工作区/目标codex/agent-workspace-sandbox，最终核对HEAD90f0bdd外未提交，无独立交付SHA。新增导航计划/应用，WordPress按需工具现14个。最终typecheck/lint通过，6文件82项回归通过，独立候选output/builds/wp-navigation-0908构建通过。实际WordPress默认页眉写后回读、10个Gutenberg有效块、桌面/手机与菜单开关/产品链接跳转通过。本轮最终候选未交付dist、未重载用户扩展或发布，不代表客户站点/真实模型/扩展认证端到端通过。

## 实现

新增connections/wordpress-navigation.ts：局部原文替换、已发布站内page链接、计划文件固定版本/hash绑定、预览hash最多20个、应用前重新核对主题/部件/页面/引用菜单。写入复用wpOperations，恢复回读不重放POST。普通页眉/页脚模板部件中的一个简单navigation可被替换，其他原文保留；ref转部件内联，不改共享菜单记录。锁、绑定、复杂子菜单拒绝。

wordpress.ts只额外开放受限template-parts/theme//slug路径；wordpress-tools及wordpress工具组新增wpPlanNavigation/wpApplyNavigation，后者进入统一写确认。transcript只新增两项现有本地化标签映射，保留他人共享修改。会话状态增加wpNavigationPreviews?:string[]。Skill的site-setup/api-guide同步流程及影响范围。

## 验证与边界

新增4项工作流测试覆盖片段唯一性、原文字节保留、复杂锁拒绝、过期计划、固定文件hash、恢复不重POST、共享菜单变化拒绝；审批测试覆盖新写工具，工具组测试覆盖隐藏/启用；合计6文件82项。真实隔离站点使用生产局部变换函数和站点原生REST，10个块有效、两个视口、手机菜单开关/链接跳转通过。复杂嵌套菜单、任意页眉页脚重设计、经典主题、跨主题继承部件没有宣称支持；客户端检查不是原子锁。

## 文档与后续

模块、架构、PROJECT_STATUS和唯一合并清单已更新。方案docs/research/browser-wordpress-site-20260908/导航精确修改实施方案.md；证据navigation/README.md及result.json同研究目录。无新增依赖/主题或用户本地运行要求。下一步真实企业资料及客户站点Agent端到端验收，另按实际需求适配复杂菜单和页脚内容。
