# 重构前全量回归：已知失败

捕获2026-09-07T17:26:00.859Z，检查结束2026-09-07T17:32:26.474Z（UTC）。独立快照执行typecheck、lint、build均exit 0；全量194文件1517项，1508通过、9失败（5文件），exit 1。记录原始失败，不改测试使其变绿，不将其他任务后续修复或旧通过合并为此次通过。

| 文件 | 失败用例 |
| --- | --- |
| tests/agent-inbox.test.ts | 后台在上一轮结束边界收到入队，自动使用原上下文续跑且同一 ID 不重复发送 |
| tests/agent-inbox.test.ts | 后台完成后自动派发带显式上下文的队列，纯聊天选择也不会丢失 |
| tests/agent-inbox.test.ts | 后台跨页排队重新创建对应驱动，A→B→A 不操作上一页 |
| tests/agent-inbox.test.ts | 排队网页在执行前关闭，保留消息并提示错误，不回退到旧网页 |
| tests/agent-questions.test.ts | 完成后回答自动续跑原任务；重复提交不重复启动 |
| tests/harness-completion-runtime.test.ts | 持久化恢复后未完成采集和失败交付依旧阻止假成功，修复交付可解除 |
| tests/harness-progress.test.ts | SDK prepareStep 收到跨工具循环提醒，原始工具回执配对保持完整 |
| tests/harness-runtime.test.ts | 批量采集未完成或来源伪造时，模型结束文本不能把任务标为完成：partial |
| tests/harness-runtime.test.ts | 批量采集未完成或来源伪造时，模型结束文本不能把任务标为完成：forged-export |

原始断言及调用栈见[validation.json](validation.json)，全量机器结果见[test-results.json](test-results.json)。本轮没有新真实浏览器或模型业务调用。

## 后续调查

其他任务已独立诊断固定系统/工具schema占用导致ContextManager.prepare工作空间不足（src/agent/context/manager.ts:265–268），并指向新WordPress结构化工具schema。该诊断不是本快照中逐项因果实验：目前本快照确认上述9条失败，具体影响范围待后续修复对照。已通知WordPress与Vercel Harness负责人；不通过移除预算保护或改写断言掩盖问题。

录屏负责人另确认会话结束后取消、区域选择体验有已知未完成事项；这些不是本次测试新增通过项。Puppeteer仅在Pi隔离候选完成6通过/2失败的组件探针，此快照仍使用现有产品执行器。
