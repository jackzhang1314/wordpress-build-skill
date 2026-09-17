# Agent Skills 内核兼容性审计

> 本文记录 0.3.9 时的调查。0.4.0 已正式接入，当前能力见 [使用与实现](AgentSkills使用与实现.md)。

日期：2026-09-05 10:56:16 GMT+8。对象：页边 0.3.9、ai 7.0.93、@ai-sdk/deepseek 3.0.39、@ai-sdk/openai-compatible 3.0.44。

## 结论

现有 ToolLoopAgent 具备实现 Agent Skills 所需的流式多步工具调用、逐步指令/消息调整接口；原 SDK 不需要替换。页边自己的 AgentRunner 目前没有实现 Skill 生命周期，因此当前产品不支持标准 Skill 导入或渐进式披露。

SDK 7 已有 uploadSkill；不能说 SDK 没有 Skill API。但它是供应商托管能力，不会自动扫描/解析用户 Skill 并为本地 Chrome Agent 建立渐进式披露。当前安装的两个适配器调用 uploadSkill 均在请求前报告不支持。Kimi 经项目的 OpenAI-compatible 适配器调用；这里的结论仅针对当前适配器路径，不是断言 Kimi 服务商永远不支持 Skill。

推荐：保留 ToolLoopAgent，在我们控制的 AgentRunner 中实现独立 SkillRuntime。浏览器操作继续走现有 Driver 与权限策略。

## 证据和边界

| 层级 | 已核实的能力 | 对本项目的含义 |
| --- | --- | --- |
| 标准格式 | SKILL.md 的 YAML + Markdown、可选资源目录、compatibility 等字段 | 标准规定包内容，不规定必须采用 LangGraph 或某个模型 |
| ToolLoopAgent | tools、instructions、prepareStep 可修改 instructions/messages/activeTools/runtimeContext | 可承载目录注入、按需加载、已激活指令重建 |
| uploadSkill | 上传包到支持的供应商，返回 ProviderReference | 当前 DeepSeek/OpenAI-compatible 不具备对应上传能力；不是插件本地技能注册表 |
| HarnessAgent | SDK 附带文档有 skills 设置，示例使用独立 harness 包和运行时 | 不是当前 ToolLoopAgent 的参数；不能直接搬入 Chrome Worker 宣称已支持 |
| 页边 AgentRunner | 固定 instructions + browserTools；每段生成创建新 ToolLoopAgent | 没有加载器、资源索引、Skill 激活状态或版本 |
| 存储 | StoredConversation 保存 conversation、modelMessages、runContext.includeNotes | 没有包版本、读取记录、激活记录；runtimeContext 也不是持久化存储 |
| 上下文 | compactHistory 截断旧的大型工具输出 | 直接把 SKILL.md 当普通工具结果返回会在后续步骤丢失指令 |

原代码位置：src/agent/runtime.ts（generate/run/compactHistory）、src/agent/tools.ts、src/agent/storage.ts、src/agent/background.ts（恢复与队列）、src/agent/providers.ts。

已安装 SDK 证据：node_modules/ai/src/generate-text/prepare-step.ts、node_modules/ai/src/agent/tool-loop-agent-settings.ts、node_modules/ai/src/upload-skill/upload-skill.ts、node_modules/ai/docs/03-ai-sdk-harnesses/04-skills.mdx。

注意：在线及本地 uploadSkill 文档示例仍出现 content 字段，但当前 7.0.93 源码与声明使用 data。实验以已安装官方类型为准，使用 data: { type: 'text', text }，不复制过期示例。

## 渐进式披露的实际执行顺序

1. 会话初始化：读取启用技能的名称/描述目录；不读取全部正文与参考资料。显式指定技能的用户请求可直接进入激活。
2. 模型判断相关性：调用 loadSkill（名字必须映射至实际注册且可用的 Skill），宿主加载 SKILL.md 正文及资源路径列表。不是关键词命中就无条件激活。
3. 模型按说明工作：需要参考资料时调用 readSkillFile，仅加载指定包内文件；列出资源路径不等于把文件全读入。
4. 每一步请求：使用当前用户要求、有效 Skill 状态、现有执行记录和网页观察构建上下文。把技能指导与网页数据区分开。
5. 后续恢复：从持久化激活状态重建有效正文，再继续循环；不重新执行已完成网页动作。

这也与 UI 折叠是两回事：UI 折叠控制用户看到多少执行过程；渐进式披露控制每次模型请求收到哪些资料。

## 核心改动建议

### SkillRegistry 与包存储

预置包和上传包统一管理。解析 YAML 元数据，保存原始 SKILL.md、资源索引、内容哈希、来源、启用状态和兼容性诊断。标准元数据之外的内部 ID/版本使用内部记录，不要求用户修改标准包。包内路径相对 Skill 根解析，拒绝目录越界，限制解压后大小/数量。保留可识别的额外字段，但不承诺支持每个客户端私有扩展。

静态兼容性字段和脚本扫描只是诊断，不可能可靠推断每段自然语言要求的全部能力。运行时缺少工具/解释器也必须明确返回，不能默默忽略后继续宣称成功。

### SkillRuntime 与持久化

每个对话保存 activatedSkills：skillId、contentHash、激活原因、对应消息/调用 ID；有效包版本单独可恢复。导入更新不能改变正在运行任务读取到的内容。重复激活已在上下文中的同版本正文不再次追加。

Skill 读取和激活也通过 runner 的串行执行、取消与保存机制：成功返回前保存激活状态；用户引导打断生成或 Worker 中断，不丢失已确认的 Skill 状态。不是把状态只存在闭包或 SDK runtimeContext 中。

“调整方向”保留仍适用的技能，用户明确取消/切换技能时更新状态。队列中的显式技能选择随消息保存，在该消息实际出队时生效，不能提前改变正在执行的任务。任务无关的新对话不继承旧对话激活状态。

### ContextAssembler

替换当前一概截断工具结果的 compactHistory 策略。依据宿主记录的 toolCallId/技能版本识别受保护内容，不能仅通过外部文本自称 <skill_content> 判定。已激活且仍有效的正文保持完整；参考资料可以单独缓存、再次读取。

实验验证 prepareStep 可以每步重建正文。生产实现还应避免历史工具结果与重建正文重复占用上下文：保留合法的 tool-call/result 配对，用可识别的记录替换重复载荷，并独立注入一次有效正文。停用后同时清除有效层与重复载荷，防止旧指令通过历史消息继续生效。

设置目录、单 Skill 正文、资源读取、总上下文预算。规范建议的 500 行 / 5000 tokens 是建议而非强制字段限制；过大内容应提示或使用资源分拆，不能无提示截断指令。现有 180000 是累计用量阈值，不是当前请求的上下文大小控制，不能代替上下文预算。

### 工具和能力范围

初期增加 loadSkill、readSkillFile。读取已启用包内资料无需每次再确认；后续浏览器写操作仍受执行层权限控制。allowed-tools 是实验性字段，应做可支持的映射/限制诊断，不能让上传文件提升 Chrome 权限。

读取 scripts 文件不等于能执行。当前工具集没有通用 Python/Bash/本机文件访问，也没有模型视觉输入。脚本、图片及二进制资源应分别标识可读取/可处理/可执行的真实能力。未来接入独立执行环境后再扩大兼容性。

## 最小实验：已运行而非只做推断

文件：tests/skills-kernel-probe.test.ts。5 项检查通过，typecheck/lint 通过，无新依赖，无真实 API 请求。

1. DeepSeek 适配器调用 SDK uploadSkill：明确报不支持，网络请求数为 0。
2. OpenAI-compatible 同样验证。
3. 当前 ToolLoopAgent.stream 三次模型请求：首次只有目录；激活后出现完整正文且尚无参考内容；readSkillFile 后出现指定参考内容。只执行实际请求的两次读取。
4. 直接复现生产 compactHistory：长 Skill 工具输出进入旧消息区后，正文尾部标记消失，原始存储内容未变。
5. 宿主原型用 prepareStep 每步重建有效正文，在 8 步循环后仍完整；序列化再恢复激活快照，新建 Agent 后首个请求仍有完整正文，无重复加载动作。

限制：模型响应为 MockLanguageModelV4 的指定序列，证明 SDK 的调用/披露边界和上下文接口，不证明真实模型的选择质量。第五项是宿主快照模拟，不是生产 Chrome Worker 重启、队列或实时引导端到端验证。实验适配器只在测试内，未接入产品。当前产品仍为 0.3.9，未打包新版本。

## 正式验收门槛

- 标准 SKILL.md 包可导入；元数据、相对资源、更新和同名冲突行为明确。
- 无关技能正文、未读取参考资料不进入模型请求。
- 手动和模型激活、重复激活、禁用行为正确；失败不能记录为已成功使用。
- 长循环、暂停恢复、Worker 重启、队列和调整方向保留正确版本及状态。
- 上下文预算生效，指令不被普通工具摘要截断，不产生重复载荷。
- 原 13 个浏览器工具及新 Skill 工具的 HTTP schema 通过实际 provider 适配器序列化验证。
- 已授权网页范围、拒绝确认、只读模式不因 Skill 改变。
- 使用真实模型验证技能相关性选择和执行效果，独立于模拟链路测试。

## 来源

- [Agent Skills 格式规范](https://agentskills.io/specification)
- [Agent Skills 客户端实现指南](https://agentskills.io/client-implementation/adding-skills-support)
- [AI SDK 官方 Skill 接入教程](https://ai-sdk.dev/cookbook/guides/agent-skills)（搜索可读正文；直接打开因返回 text/markdown 失败）
- [Vercel Skill uploads 指南](https://vercel.com/kb/guide/ai-sdk-skill-uploads)

具体 SDK 参数以已安装 7.0.93 的源码与官方声明为准。
