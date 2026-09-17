# 地图找客 Skill 与 Apify 执行接入

- 时间：2026-09-07 20:05:05 GMT+8。
- 触发：主要执行模块完成，首轮相关测试通过。
- 工作：新增内置地图找客技能、共享 Apify 绑定传输、提交前持久化、任务查询、分页结果读取与客户 CSV/来源 JSON 文件生成；连接器详情更新可用能力；任务绑定原凭据指纹但不向模型返回。
- 关键文件：`src/agent/connections/maps.ts`、`maps-tools.ts`、`apify.ts`、`catalog.ts`；`skills/builtin/apify-google-maps-leads.md`、`skills/builtin.ts`、`skills/catalog.ts`；`runtime.ts`、`storage.ts`；`tests/apify-maps.test.ts`。
- 首轮验证：typecheck、lint、6 文件 44 项测试通过（API 使用模拟响应，文件使用实际 IndexedDB 测试存储）。覆盖提交持久化、未知结果不重试、账户更换拒绝读取、任务匹配、部分结果、分页、CSV 与密钥隔离。
- 最终验证：费用确认卡补充地区、数量、可选补全与预算；7 文件 70 项测试、typecheck、lint、build 全部通过。内置浏览器核验新技能可见、Apify 关联与返回详情路径，页面已保留。未使用真实 Token，未启动付费任务。
- 交付文档：`docs/外贸场景验收/0907_Google_Maps找客接入与验收.md`；后续需真实账户小批量采集验证，不将模拟测试当作真实服务验收。
- 范围：一个对话一个采集任务，最多 5 个词、每词 100 家；支持官网联系方式，未接员工个人数据、多 Actor 补全或自动发信。结果未知需控制台核对；停止本地对话不会停止远端任务。
