# Agent Skills 兼容性调查与接入建议

- 时间：2026-09-05 10:52:26 GMT+8
- 触发原因：完成自定义 / 预置 Skill 的架构可行性调查。
- 状态：设计建议，尚未实现；当前版本仍为 0.3.9，未修改运行时代码。

## 当前实现证据

src/agent/runtime.ts 使用固定 instructions、browserTools 和 AI SDK ToolLoopAgent；prepareStep 调用 compactHistory。src/agent/storage.ts 只有 conversations 表。没有 Skill 包导入、目录注册、激活或资源读取工具。当前 manifest 和工具集合未提供本机终端、Python 或通用本地文件执行能力。

## 规范与范围

依据 https://agentskills.io/specification 和 https://agentskills.io/client-implementation/adding-skills-support（本次读取官方页面）：SKILL.md 为 YAML 元数据与 Markdown 正文，目录可包含 references、assets、scripts 等资源。按名称/描述目录、激活时正文、需要时资源三级加载。脚本语言支持由宿主实现决定，格式兼容不等于任意第三方 Skill 可执行。

## 建议实现

1. SkillStore：预置包与用户导入的 SKILL.md / ZIP / 文件夹统一注册；保存来源、版本/内容哈希、启用状态、资源索引；同名明确选择，不静默覆盖；预置 Skill 可禁用。
2. 导入器：YAML 解析与字段诊断；保留额外字段；规范化包内相对路径；限制文件数与解压后大小、拒绝路径越界；展示资源和依赖需求。缺少运行环境的 Skill 明确标识，不宣称可运行。
3. Agent 集成：注入启用 Skill 的名称/描述目录；loadSkill 返回正文及资源列表，readSkillFile 按需读取包内文本；用户 /命令或选择器显式启用，也允许模型按任务自动选择。
4. 上下文：活跃 Skill 内容、版本与原始包单独保存；prepareStep 在上下文预算内补回有效指令，避免现有 compactHistory 将长 Skill 工具结果截成网页快照摘要。引导、排队、暂停恢复均继承明确的激活记录；运行中的任务锁定包版本，更新从后续任务生效。
5. 权限：Skill 不新增 Chrome 来源授权、任务网页范围或 API 凭据访问能力；实验性 allowed-tools 不能提升执行层权限。网页文本不能变成已安装 Skill。脚本文件可以导入保存，但首期不执行上传代码。
6. UI：设置里“技能”管理，内置/我的技能、导入、查看内容、启停；输入框选择或 /技能名；执行流显示“已使用：某技能”，归入可折叠过程。

建议首批：网页数据整理、多页面产品对比、网站导航梳理、批注转修改清单；关键词页面分析仅限页面上实际可读取的数据。所有预置包使用同一公开格式，不写成特殊内核分支。

## 后续与验证

首期交付浏览器工具可执行的流程、文本参考及文本模板，明确图片/二进制资源的消费能力。需要 Python/Bash/Node CLI、本机文件或外部 MCP 的 Skill 后续接入本地伴随程序或远端沙箱，再按能力评估支持。无需为 Skill 功能更换 AI SDK 内核。

实现后覆盖：元数据校验、压缩包越界及限额、同名版本、按需加载、模型与显式激活、长循环压缩、引导和恢复、权限不扩张、Skill 管理及工具折叠 UI。本轮仅调查和写文档，未运行实现测试。

后续补充：0905-51 与 docs/AgentSkills内核兼容性审计.md 已核实 SDK 7 内置 uploadSkill、当前适配器限制与 5 项最小实验。更详细的核心实现及证据以该审计为准。
