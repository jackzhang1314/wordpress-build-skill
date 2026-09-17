# Skill API 配置与 Apify 连接入口

- 时间：2026-09-07 18:42:14 GMT+8。
- 触发：用户要求 API 技能对应配置页面；配置层里程碑完成。
- 工作：新增 Apify 配置/账户只读测试模块与共享 UI；技能管理页入口、技能详情按 connections 元数据展示；密码输入、独立保存、更换/删除、连接反馈。
- 文件：src/agent/connections/{apify.ts,view.ts,view.css}；src/agent/skills/{catalog.ts,detail-content.ts,view.ts}；tests/skill-connections.test.ts；public/privacy.html；docs/外贸场景验收/0907_Skill_API配置接入.md。
- 验证：最终同轮 typecheck、lint、4 文件 31 项、build 全通过。连接调用使用 mock；未请求真实账户、未启动收费 Actor。
- 安全边界：Token 仅发往固定 Apify 认证端点，不进入技能正文/模型/导出；验证回执单独保存哈希与时间，不回写已删除凭据。原始网络错误刻意不保留 cause，避免认证资料进入异常链，局部 ESLint 注释记录原因。
- 遗留：Apify 采集技能包和 Actor 任务/结果读取工具未实现；当前入口完成配置，不能宣称完整找客可用。未发布商店、未提交 Git。
