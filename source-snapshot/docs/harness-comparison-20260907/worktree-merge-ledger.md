# Worktree 盘点与合并清单

核对时间：2026-09-07 21:31:50 GMT+8。这是当前产品同一个 Git 仓库的工作目录清单，不是电脑上所有仓库的清单；opensource 的参考源码与固定版本 worktree 不计入本表。

用户要求：各任务必须记住阶段成果何时应合并，不得只报告“完成”而把代码留在不同工作区。

## 当前盘点

截至2026-09-08 03:36:53 GMT+8，Git登记10个目录：1主区、4原有独立开发/评测、3历史对照、2浏览器执行器相关工作区（开发与冻结各1）。本轮仅盘点，没有新建或删除工作区；各任务源码和验收状态仍由其负责条目记录。

当前主要集成目标为主区分支 `codex/agent-workspace-sandbox`，2026-09-08 05:30:32 GMT+8核对HEAD `44bf53176ef5fb3ec119046bb9fea660e1935d05`（H16源72add95独立整合a4393cc、文档收尾44bf531；H15未合）。原联合失败与各任务证据保留，治理文件的其他任务条目按各自注明时点。

| 用途/任务 | 工作区 | 分支 | 提交 | 工作区状态 | 相对目标落后 / 独有提交数 | 处理安排 |
| --- | --- | --- | --- | --- | --- | --- |
| I06 执行器恢复闭合输入 | [目录](</Users/Zhuanz1/.codex/worktrees/i05-executor-recovery-20260908/浏览器网页批注插件>) | `codex/i05-executor-recovery-20260908` | `ab10c607cf93` | 干净独立提交 | 基线9dfa047+1提交 | 组件13文件105项/types/lint/build/audit/原生恢复通过；精确输入[i06-executor-input.json](i06-executor-input.json)，供BX02/Pi/Vercel共同执行器接入，未合入主产品 |
| 主工作区 | [目录](</Users/Zhuanz1/Documents/ChatGPT/浏览器网页批注插件>) | codex/agent-workspace-sandbox | 44bf53176ef5 | 多任务在途修改保留 | 0 / 0 | H16独立整合a4393cc，主295项/types/lint/隔离build；935原在途及稳定dist保持，用户未重载。2026-09-08 05:30:32 GMT+8 |
| Vercel AI SDK 与 Pi 对比评估测试 | [目录](</Users/Zhuanz1/.codex/worktrees/180d/浏览器网页批注插件>) | `codex/unified-harness-evaluation-20260907` | `b359aaa` | H17报告c4a1d9f、M1验收c479548/M2事前约定b359aaa已提交，AGENTS导航保留 | 主区44bf531/Pi M1 366f087，2026-09-08 09:32 GMT+8核对 | E01固定比较及M1有限接入验收完成；M2已派发、待实际结果，产品未整合 |
| Vercel Harness 优化 | [目录](</Users/Zhuanz1/.codex/worktrees/5977/浏览器网页批注插件>) | codex/vercel-delivery-contract-20260907 | 69a5d2b508de | H17产品6361ab05冻结；职责收束兼容/回退，仅本地AGENTS未跟踪 | 27 / 6（原始历史计数，H16补丁等价已整合；2026-09-08 08:18:38 GMT+8） | 重复评测后Pi优先有限接入，V入口保留；[兼容回退交接](</Users/Zhuanz1/.codex/worktrees/5977/浏览器网页批注插件/process_docs/0908-74_Vercel兼容回退与Pi产品约束交接.md>)，不继续泛化优化或扩预算；H15/H17仍未合主区 |
| Pi Harness 优化 | [目录](</Users/Zhuanz1/.codex/worktrees/e927/浏览器网页批注插件>) | `codex/pi-contract-recovery-20260907` | `366f08701f2837c6607322b645ca87ce910b88e6` | M1源码/架构/模块/证据完整冻结；仅本地AGENTS导航未跟踪 | 2026-09-08 09:29:14 GMT+8，主目标44bf531；203个生产源输入/67个本次变更输入匹配冻结Git | P01，M1三场景MV3与329项通过，无付费；独立复跑待绑定源SHA；未整合/发布，M2–M4未执行 |
| Vercel 前端消息流与 UI 优化 | [目录](</Users/Zhuanz1/.codex/worktrees/ec1d/浏览器网页批注插件>) | `codex/vercel-ui-streaming-20260907` | `6ac0dd8af88a` | 用户决定暂缓U07/双内核适配；研究保留 | 操作前现场核对 | 先选内核再重构，范围决策已整合377f430；无产品源码变更 |
| 浏览器执行器冻结快照 | [目录](</Users/Zhuanz1/.codex/worktrees/browser-executor-baseline-20260908/浏览器网页批注插件>) | `codex/browser-executor-pre-refactor-20260908` | `9dfa0476bb7e` | 本轮仅按Git登记盘点，未改动副本 | 不按候选源码排队合并 | 由「浏览器执行器优化」维护重构前证据；保留，不删除或批量合并 |
| 浏览器执行器开发候选 | [目录](</Users/Zhuanz1/.codex/worktrees/browser-executor-puppeteer-20260908/浏览器网页批注插件>) | `codex/browser-executor-puppeteer-20260908` | `a195e8789214` | 本轮按Git只读盘点；源码47c784/负责人冻结a195e87 | 由BX02负责人按目标重核 | 已登记BX02，当前不切正式产品；性能/兼容门槛按其条目，不整包合旧快照或由Harness任务重复实现 |
| DeepAgents 历史对照 | [目录](</Users/Zhuanz1/Documents/ChatGPT/浏览器网页批注插件-DeepAgents对照-20260907>) | `codex/deepagents-harness-comparison-20260907` | `804de313e7a1` | 干净 | 12 / 1 | 历史保留，见下方集成队列 |
| Pi 历史对照 | [目录](</Users/Zhuanz1/Documents/ChatGPT/浏览器网页批注插件-Pi对照-20260907>) | `codex/pi-harness-comparison-20260907` | `195cbafc9d2e` | 干净 | 12 / 18 | 历史保留，见下方集成队列 |
| Vercel 历史对照 | [目录](</Users/Zhuanz1/Documents/ChatGPT/浏览器网页批注插件-Vercel对照-20260907>) | `codex/vercel-harness-baseline-20260907` | `22d6c764adaf` | 干净 | 12 / 1 | 历史保留，见下方集成队列 |

提交计数只表示 Git 历史关系，不能据此证明某项功能尚未通过 cherry-pick、补丁或手工改动集成。实际集成前还需检查补丁等价性、调用关系和目标实现。状态会随其他任务工作变化，不能拿本快照代替合并前检查。

## 什么时候应进入合并

1. 一个边界明确、可独立使用的阶段完成时，立即检查集成条件，不等整个大项目结束。提交需包含该阶段所有必要源码、依赖、文档与相关测试。
2. 源分支通过 typecheck、lint、相关测试和构建；涉及扩展通信/恢复/交付语义的阶段，还应取得相应业务验收证据。已由评测任务负责的付费模型/Chrome 验收沿用已有协调安排。
3. 明确源提交、目标分支、依赖提交、共享文件冲突和未覆盖项。记录“待验证 / 可集成 / 已集成”，不能把提交完成、快进可行或无文本冲突当作验收完成。
4. 对应任务先收束目标工作区的相关未提交改动；实际整合保留其他任务成果，不能为方便合并擅自清空、整体 stash 或提交他人改动。
5. 在整合后的准确提交上重新运行相关回归、类型/lint/构建及必要的扩展链路验收。合并完成后记录目标提交 SHA、结果与遗留问题；只有到这一步才能报告“已进入主产品”。

## 当前 Vercel 与前端依赖

- Vercel Harness H01：7dd237cacbfd34ceaf77b92e16d728277b49261b，固定交付契约基线，待业务/整合验证。H02 是其后的复核恢复增量，详见独立队列行；不替换正在复测的 H01 输入。
- 2026-09-07 22:14 GMT+8 交接核对：H02 `29eb6fc` 与 U01 `429512b` 的共同基线为 H01 `7dd237c`，双方新增源码路径不重叠。先满足 H01 集成条件，再分别整合 Harness/前端增量；互相不自动包含，不能把任一分支的通过当作组合版本验收。目标共享修改收束后，在实际组合提交重新验证；前端 979 项与 Harness 974 项分别属于各自候选。
- 已由 E01 `acafb456` 确认共享缺口：Pi416a43c 首次模型登记把“共 8 页”变成字符 `8` 恰好出现一次，40 次字符计数阻止发布，最终 paused；不是系统自动登记。Pi `ca3e649` 加入适用性校验，Vercel复现“生成文本 8 页 / Generate text 8 pages long”漏拦截后，Pi3819fca补齐无引号次数语境；H03 `8fcbe80` 已在H02上整合相同共享修复并通过组合回归。保留原门禁/冻结与全部旧评测证据；H03真实业务未验收，来源限定/覆盖仍独立未解决。
- 前端任务起点也是 7dd237c，已经包含该 Harness 候选。推荐先让这一 Harness 基线完成集成，再合入前端后续增量；如反向安排必须明确其携带的 Harness 依赖，不能重复 cherry-pick 同一成果。
- 前端已建立 codex/vercel-ui-streaming-20260907 分支，新增 3c0ff2f8f77e0557dac163248f7e898eacdecc86；该提交仅记录交接与集成要求，不能据此宣称 UI 重构完成。工作区如继续变化，以最新冻结提交为准。
- Harness 管执行循环/工具契约/上下文/交付完成判定；前端管消息模型/消费传输适配/聊天状态/呈现。runtime 与协议类型发生交叉时，先固定接口，再分批整合，避免互相重写。
- Pi 和旧对照版本不直接整包合并到正式 Vercel 路线；共享修复可由其负责任务提取为独立、可验证提交。

## 阶段交付的固定汇报项

每次阶段结束，报告：工作区与分支、源 SHA、阶段验证、目标分支、集成状态、尚未满足的条件；完成整合后再补目标 SHA 与整合验证。当前会话持续负责自己和拆出的前端任务的合并依赖记录，其他任务结果以对应负责人的证据为准。

本次只新增管理文档，没有运行代码测试，也没有合并或删除工作树/分支。


## 集成队列（2026-09-07 21:31:50 GMT+8）

配套入口：[项目规则](../../AGENTS.md)、[项目状态](../PROJECT_STATUS.md)。本表将目录盘点与实际待交付事项分开。默认目标是主工作区当前分支 `codex/agent-workspace-sandbox`，每次实施前重核。

| 编号 | 待交付事项 / 负责人 | 源版本与依赖 | 当前状态及证据 | 进入集成尚需满足的条件 | 实际目标 SHA / 集成验证 |
| --- | --- | --- | --- | --- | --- |
| G01 | 项目规则与状态治理 / 当前协调任务 | 主工作区 AGENTS.md、PROJECT_STATUS.md、此清单及导航文档；现为未提交文档 | 文档验证通过：32 个本地链接、8 条工作区记录、4 个规则入口及 git diff --check；未作为代码功能合并 | 正式版本化时仅暂存本批文档，保留其他任务修改；活动工作区本地 AGENTS 入口不混入功能提交 | 尚无提交；未执行代码合并 |
| G02 | 项目架构与新任务入口 / 当前协调任务 | 主工作区 docs/ARCHITECTURE.md、规则/状态/README 导航及过程记录；无业务源码改动 | 文档检查通过：143 个本地链接；两张结构/时序图对照源码核验 | 与 G01 独立整理文档提交，保留并行功能和 P01 等其他任务更新；活动工作区导航不混入功能提交 | 尚未提交；未执行业务代码合并 |
| G03 | 里程碑主动维护文档 / 当前协调任务 | 主 AGENTS.md、架构维护说明、4 个本地规则导航及过程记录 | 文档检查通过；明确触发时机、模块文档要求、阶段交付检查、并发更新和候选/主线责任 | 与 G01/G02 规则文档独立版本化；功能任务按新规则执行，不等待用户重复提醒 | 尚未提交；未执行业务代码合并 |
| H01 | Vercel Harness 交付契约 / Vercel Harness 优化 | 7dd237cacbfd34ceaf77b92e16d728277b49261b，基于 23a5451 | 2026-09-07 22:41 GMT+8：E01 acafb456 的确切 H01 样本已发布v2、9项程序检查通过，内容仍待人工复核；不能称业务全通过。原本地全量/后续回归时点见 process_docs/0907-125 | 技术整合完成；真实模型内容复核、词法防护及历史坏契约等已知限制仍保留，不套用旧样本成绩 | 已合入 codex/agent-workspace-sandbox / 0c69ad5feeb4f05dc8cc0225f8a41fe8728997f1（源码e09e539）；最终主区184文件1390项、types/lint/build、原生侧栏通过；Comet主区dist重载并历史恢复，见INT01 |
| H02 | Vercel 交付复核恢复 / Vercel Harness 优化 | 29eb6fc4bdab1c9671d967093c5e7731b0f675a0；5977 / codex/vercel-delivery-contract-20260907；直接依赖 H01 7dd237c | 2026-09-07 22:10 GMT+8：候选已冻结；分页回执索引及完全相同复核提交的幂等重试，复用 readContext，无新工具或存储迁移。typecheck/lint/build、全量 137 文件 / 974 项通过（357.37 秒）；[阶段证据](</Users/Zhuanz1/.codex/worktrees/5977/浏览器网页批注插件/process_docs/0907-126_Vercel交付复核恢复与幂等重试.md>)；模块、主架构候选入口与状态已更新 | 技术整合完成；真实模型内容复核、词法防护及历史坏契约等已知限制仍保留，不套用旧样本成绩 | 已合入 codex/agent-workspace-sandbox / 0c69ad5feeb4f05dc8cc0225f8a41fe8728997f1（源码e09e539）；最终主区184文件1390项、types/lint/build、原生侧栏通过；Comet主区dist重载并历史恢复，见INT01 |
| H03 | 数值交付检查适用性 / Vercel Harness 优化 | 8fcbe80c641aa5497251ce49ba7cb779f7e9d225；5977 / codex/vercel-delivery-contract-20260907；直接父H02 29eb6fc；共享修复来源Pi ca3e649→3819fca的两个文件增量 | 2026-09-07 22:47 GMT+8：候选已冻结；有效首次登记前拒绝数值代理，保留原门禁/冻结/H02恢复。typecheck/lint/build与8文件123项通过；共享两文件相对Pi3819fca仅有等价H02增量，新增Vercel原生拒绝→更正→发布→恢复回归。[阶段证据](</Users/Zhuanz1/.codex/worktrees/5977/浏览器网页批注插件/process_docs/0907-127_数值交付检查审查与Vercel组合验证.md>)；模块与架构候选入口同步 | 技术整合完成；真实模型内容复核、词法防护及历史坏契约等已知限制仍保留，不套用旧样本成绩 | 已合入 codex/agent-workspace-sandbox / 0c69ad5feeb4f05dc8cc0225f8a41fe8728997f1（源码e09e539）；最终主区184文件1390项、types/lint/build、原生侧栏通过；Comet主区dist重载并历史恢复，见INT01 |
| H04 | 来源复核范围诊断 / Vercel Harness 优化 | 99b2c06f760161b1844c1c22820ff3b7b3106033，父0c69ad5；共享两文件与Pi78194a2逐字节一致；Vercel原生恢复另补测试 | 2026-09-07 23:44:25 GMT+8：旧归档恢复当前版本复核并集、partial/unknown/缺口及边界上下文；无schema迁移/100%字符门禁。候选12文件190项及types/lint/build通过；[阶段记录](../../process_docs/0907-175_Vercel来源复核范围诊断.md) | 技术整合完成；H04未重新加载Comet、未新付费模型业务复测；语义完整性及旧A3内容待复核限制保留 | 已快进主区codex/agent-workspace-sandbox/99b2c06，文档收尾f30bcad；主区12文件192项、types/lint/build通过。首次lint临时语法失败由所属任务修复；未提交并行增量保留，不作为干净提交全量验收 |
| H05 | 固定版本文件续读 / Vercel Harness 优化 | 75bacf295890a8ae4684b9c12397c6e33c08981f，父f30bcad；5977/codex/vercel-delivery-contract-20260907 | 2026-09-08 00:06:59 GMT+8：readFile复用历史version，明确UTF-16游标；基线改稿反例2项先失败，修复后候选9文件129项、types/lint/build通过。[阶段记录](../../process_docs/0908-01_Harness固定版本文件续读.md) | 技术整合完成；只有显式固定version才保证跨次同版，未重载Comet/新模型业务复测，无持久schema迁移 | 已合入主区codex/agent-workspace-sandbox/75bacf2，文档收尾e827bdf；主区9文件129项、types/lint/build通过。保留inspectPage及其他在途修改，源码工作区与主区对齐 |
| H06 | Vercel真实任务验收 / Vercel Harness 优化 | 产品e827bdf；测试f35a9a0；审计报告48f021d3433cde1153e824392e2ee4b7c68491e2；5977/codex/vercel-delivery-contract-20260907 | 2026-09-08 00:46:51 GMT+8：两类业务均未交付；8页3图预览通过但超时/语义失败；固定v1读取与原成果保护通过，错误JSON检查导致恢复发布失败。59请求/已知1198975tokens/1次未知；197输入/4产物hash未变，清理完成。[实测报告](vercel-h05-live-results.md) | 测试/报告可整合，问题尚未修复；下一步检查登记纠错与pending复核作废。实测不覆盖U02/U03、主区在途修改或用户Comet  2026-09-08 01:25:50 GMT+8职责收窄：浏览器后端、DOM/列表/表格采集、页面续读与动作生命周期归「浏览器执行器优化」；本任务先做H06交付检查纠错与pending复核处理，聚焦delivery.ts及本侧回归。BX B5仅在公共契约冻结后接Vercel适配，runtime/tools/context共享改动先按函数与SHA对齐；不重复H05或浏览器方案。边界记录见[本任务过程记录](</Users/Zhuanz1/.codex/worktrees/5977/浏览器网页批注插件/process_docs/0908-20_Vercel与浏览器执行器职责边界.md>)。 补充：组合WP工具schema预算诊断出现启动失败，已只读核对，属Harness激活工具/预算与WP schema共同定位项；已有activeTools过滤，不能预设所有工具均发送。未重跑/未改冻结副本，快照最终验收待执行器任务。| 已合入codex/agent-workspace-sandbox/a01fc986a78529ec3854f30c166fcb70831c8f75；167项在途文件hash原样保留，主区types/lint及3文件30项回归通过；未重建/替换主dist；整合收尾953ba65 |
| H07 | WordPress工具按需激活 / Vercel Harness 优化 | dbc0bef1b76afc6e7c49451e55369c66c0693320；5977/codex/vercel-delivery-contract-20260907；原产品953ba65 | 2026-09-08：旧版2项反例失败，修复后候选types/lint/build及3文件47项通过；wordpress组覆盖12工具，可按需启用/退出，核心恢复与交付入口常驻。[记录](../../process_docs/0908-22_Harness按需WordPress工具与预算隔离.md) | 无新依赖、模型循环、浏览器协议或数据库schema；WP自身schema缩小由插件负责人独立负责。H06交付问题未解除 | 主区精确树已推进dbc0bef；保留原selector文案和179项在途文件，其余文件不整包提交；主区最终75340f7组合types/lint及5文件68项通过，文档收尾397e8dd。未改执行器冻结副本 |
| H08 | pending复核显式作废 / Vercel Harness 优化 | 3a4e7dc，父397e8dd；5977/codex/vercel-delivery-contract-20260907 | 2026-09-08 01:46:27 GMT+8：新工具保留作废原因/归档，已提交发现不可撤销，全部作废不满足交付且48条额度不释放；原生恢复后原v1发布回归通过。候选4文件122项/types/lint/build通过。[阶段记录](../../process_docs/0908-24_Harness待处理复核作废与恢复交付.md) | DeliveryState增加discarded/discardReason，旧记录可读但旧代码不保证识别新状态；无DB迁移。H06错误JSON检查及内容限定问题仍未修复；未新增付费/Chrome业务验收 | 已合入主区codex/agent-workspace-sandbox/5e40a00a91d8f525c623070fa3261b1b72157294（原主区f7c496f已含前端708534a，快进不适用后正常merge）；主区types/lint及6文件139项通过，文档收尾378367fb615362b3c5c791e22ee26178dce316c7；执行器冻结快照及其他在途修改保留 |
| H09 | JSON对象检查与冻结前自测 / Vercel Harness 优化 | a97b2ae0d8825f89a2e1154ab8c893263916466a，父378367f；5977/codex/vercel-delivery-contract-20260907 | 候选5文件143项/types/lint/build通过；主区02:05:12的6文件159项/types/lint通过；原生脚本模型拒绝错误登记→纠正→发布原v1→恢复回归。[记录](../../process_docs/0908-29_Harness_JSON对象检查与冻结前自测.md) | 新/更正JSON登记必须exampleJson；样例仅验证格式自洽，不证明用户语义/金额正确。已冻结契约不自动改写；旧数组可读，新对象契约不保证旧代码兼容。无DB迁移/新真实模型或浏览器业务验收 | 主区codex/agent-workspace-sandbox快进a97b2ae，文档收尾f0bb0eb7ba334e973bc2fc936672e15efd285542；5977同HEAD，其他任务在途修改与执行器冻结快照保留 |
| H10 | 来源复核原句对照 / Vercel Harness 优化 | f575185e193612302bb9f6c540b0b7254f85d92d；5977/codex/vercel-delivery-contract-20260907，父f0bb0eb | 候选5文件160项/types/lint通过、同产品源码build通过；主区02:25:57的6文件176项/types/lint通过。原生脚本拒空结论→对照发现→阻止发布→修稿重审→发布恢复，并发/停止保护。[证据](../../process_docs/0908-36_Harness来源复核原句对照.md) | comparisons随DeliveryState保存；旧已提交可原样重试，旧pending新空发现需对照，新不利对照不可交给旧代码忽略。引文真实不证明supported判断正确；无新真实模型/浏览器业务验收，H06失败保留 | 已整合codex/agent-workspace-sandbox/aa7b31b123e3da3114a7ee38a131e7752c08d022，文档收尾f750d051c84e027ce0dc209700cb3e9075977aa9；原在途tracked diff哈希不变，5977保留已验证源候选 |
| H11 | H10固定候选真实复测 / Vercel Harness 优化 | 产品f575185；入口ec86aa6edf798759769580eef5c60d3e0a43fa9f；报告9ff7953f3949412527f9d690b01ed31482d45680；5977/codex/vercel-delivery-contract-20260907 | 25请求348604tokens，文章路径误报未交付/无来源复核；JSON正确原v1重载后发布，9机制通过。197输入/4产物hash不变，隔离清理完成。[报告](vercel-h10-live-results.md)；主区113项/types/lint通过 | 使用已存正文替代网页输入，不与H06作严格成功率/成本比较；H10语义未触达，恢复未显式读v1，长继续消息重开登记，Chrome开发模式阻止在付费resume前解决。新错误先留证未代改候选 | 已整合codex/agent-workspace-sandbox/97ae5bd6b98f875b756eec9f2ba56f3167c52d5e，收尾90f0bdd2678897a8a99af53482d18103f599b65c；原在途tracked diff保留，未更换主dist/用户Comet/执行器快照 |
| H12 | 来源描述与输出路径误报 / Vercel Harness 优化 | bf1bd2690cf1f3f1b0d2f725d2590c8edcb1c961；5977/codex/vercel-delivery-contract-20260907；父9ff7953 | 2026-09-08 03:15:51 GMT+8：原文误报及描述用法先复现11失败；修复后候选5文件180项、主区5文件182项、双方types/lint与隔离构建通过。只修delivery.ts及对应回归/文档。[记录](../../process_docs/0908-54_Harness来源描述与输出路径误报修复.md) | 保守词法规则非通用语义判断；无新模型请求/浏览器业务复测，H11真实语义仍未触达；无schema/循环/前端/浏览器执行器改动，历史坏契约不自动迁移 | 已合入codex/agent-workspace-sandbox/04ee553925456d4b0bdd35b33b8ecd59e5fe8451，文档收尾beeb74c708198942e2ee999665d77ab2e4533ee3。合并时原tracked diff和721个未跟踪文件hash保留；主区233个稳定dist文件hash不变。输出仅output/builds/h12-integration，未更新用户加载版本 |
| H13 | H12文章真实复测 / Vercel Harness 优化 | 产品bf1bd2690cf1；入口6c876eba81d1012309daa1fb8c58e0e07509e6d4；报告7caa88fe2dbed3f7ff63403109d3c4f47a8643f6；5977/codex/vercel-delivery-contract-20260907 | 2026-09-08 03:36:53 GMT+8：24实际请求502168tokens/167.712秒，25条观察记录最后一条本地未发送。HTMLv3/8页3原图，0复核/0发布；内容限定及排版失败。198输入/4产物hash不变，隔离清理完成。[报告](vercel-h12-live-results.md) | 仅一次固定输入/模型，无U06/BX02/JSON复测，不预测扩大预算后的成功。源133项、主144项及types/lint，源候选build通过，业务未通过 | 已整合codex/agent-workspace-sandbox/0af7ae93c414924da51a48c41c27b277de6de2ac，文档收尾3e4f1666784dfa6cb9bc8784b2d37dbd4dea7161；原tracked diff和724个未跟踪文件hash保留，用户dist/加载版本未改 |
| H14 | 共享交付校验误拒 / Vercel Harness 优化 | ea952add822b8416fcd4a3f0664bb526ef00af66；5977/codex/vercel-delivery-contract-20260907；起点7caa88f | 2026-09-08 03:58:00 GMT+8：原6项2失败已修复；源9文件245项/主9文件248项、双方types/lint/隔离build/audit通过。[整合记录](../../process_docs/0908-64_H14共享交付修复精确整合.md) | 新literal.max对应用户依据；HTML使用parse5@8.0.1公开解析，原始范围与旧回执兼容。源后台+169347字节，启动未测；无真实模型重跑。H13重复检查效率后续暂停，待同版执行器联合候选 | 已整合codex/agent-workspace-sandbox/99296f891859a966c4e47bd9d95b5a82c8faad6b，文档收尾052a5cb2efe2ba3342b2e0f438ec2d6803aad7c2；930项原dirty/untracked保留，3共享文件原增量精确验证；源222/主233稳定dist未变。Pi原样接入及执行器准入待各负责人交付 |
| H15 | Vercel同版BX03联合候选 | 5977/codex/vercel-delivery-contract-20260907；起点ea952ad，BX03源ec206e2923748ed3b3fa48ba97e2680ab7c8bd3a；候选6406d5bcb5370307166e4b7eb6f83d0e77c641f1 | 2026-09-08 04:46:52 GMT+8：33文件470项、types/lint/隔离build/audit、Chrome152输入18项和Vercel原生模拟5步真实填写/一次trusted点击通过。[说明](</Users/Zhuanz1/.codex/worktrees/5977/浏览器网页批注插件/docs/harness-comparison-20260907/vercel-bx03-adoption.md>) | 21公共源/插件一致，model-catalog UI及ownership type-only支持差异显式记录；H14/loop/context/wire保留。纯接入零付费，否定句交付误报保留未修，不扩展优化 | 已冻结6406d5b交统一评测；未合入codex/agent-workspace-sandbox/用户加载版本，原222稳定dist保持；后续按候选选择结果精确整合，未生成主区合并SHA |
| H17 | CSV未知数量最小表达 / Vercel Harness 优化 | 6361ab05e3ebe52d0c45c570c3817844fd2468f5；5977/codex/vercel-delivery-contract-20260907，父986835eb | 2026-09-08 06:02:22 GMT+8：新13项先4通过9失败；修后12文件254项/types/lint/隔离build/audit通过。[H17记录](</Users/Zhuanz1/.codex/worktrees/5977/浏览器网页批注插件/process_docs/0908-71_H17_CSV未知数量最小修复.md>)；只改delivery.ts两处，另含共享真实夹具/测试、Vercel wire回归及文档 | rows省略仍校验完整格式；0/正数精确，旧冻结不解锁。数字依据未实现语义识别/原rows0仍可误登记，零新模型调用，222稳定dist保持 | 目标codex/agent-workspace-sandbox/44bf531，尚未整合或用户加载；Pi已原样接入ac515409，真实四阶段通过f1fb9d2；只读审查c7772814fb76及4文件66项通过，允许固定配置完整系统比较，保留thinking/工作预算/复核差异限制；[六项原生能力审查](</Users/Zhuanz1/.codex/worktrees/5977/浏览器网页批注插件/process_docs/0908-73_H17_Vercel原生能力有限审查.md>)。新候选与旧批次失败分开，不追加旧预算 | 2026-09-08 08:18:38 GMT+8：c4a1d9f重复评测后本任务转兼容/回退；交接69a5d2b508de仅文档，产品6361ab05保持。[兼容回退交接](</Users/Zhuanz1/.codex/worktrees/5977/浏览器网页批注插件/process_docs/0908-74_Vercel兼容回退与Pi产品约束交接.md>)，三失败原件hash核对，未改变预算/运行代码；Pi优先有限接入不等于已迁移。
| H16 | 交付登记错误定位 / Vercel Harness 优化 | 72add950dba5d7bfcea410f35c3ea2aabfb0045f；5977/codex/vercel-delivery-contract-20260907，父6406d5b | 2026-09-08 05:30:32 GMT+8：真实6输入先复现；修后源16文件292项/主16文件295项、双方types/lint/隔离build通过。[整合记录](../../process_docs/0908-69_H16交付反馈独立整合.md) | SDK校验/三错计数无缺陷；只补schema结构说明与无效引用路径，检查/冻结不放宽。零付费、不改BX03/QuickJS/全文提示，原联合失败保持 | 已独立cherry-pick到codex/agent-workspace-sandbox/a4393cc60c4181b4051dbe9d2656423fc96c587e，父052a5cb，文档收尾44bf53176ef5fb3ec119046bb9fea660e1935d05，不含H15；935在途文件及源222/主233稳定dist保持。Pi已原样接入1220dbac；新有限CSV批次071cf05两路登记通过但预算内未发布。诊断986835eb7d6a离线确认rows0强制精确值与17行冲突/同轮禁止更改，尚未修复；[离线审查](</Users/Zhuanz1/.codex/worktrees/5977/浏览器网页批注插件/process_docs/0908-70_H16_CSV行数契约离线审查.md>)。本次仅诊断无新产品整合，后续合H15避免重复H16 |
| U01 | 前端消息流与 UI / Vercel 前端消息流与 UI 优化 | codex/vercel-ui-streaming-20260907；429512b74cffcd9b29815e33ed4ad6fa59172c59，研究增量 3c0ff2f/22d776a，继承 H01 | 2026-09-07 22:13 GMT+8：协商式文字/推理 append、remend@1.3.1 活动尾部显示候选已冻结；typecheck/lint/build、138文件979项及真实原生侧栏通过；[候选模块与协议图](</Users/Zhuanz1/.codex/worktrees/ec1d/浏览器网页批注插件/docs/Agent流式消息性能优化与验收.md>)、[过程记录](</Users/Zhuanz1/.codex/worktrees/ec1d/浏览器网页批注插件/process_docs/0907-164_流式显示与文本追加实施.md>) | 技术整合完成；聊天状态入口进一步统一未实施，其他功能后续改动独立验收 | 已合入 codex/agent-workspace-sandbox / 0c69ad5feeb4f05dc8cc0225f8a41fe8728997f1（源码e09e539）；最终主区184文件1390项、types/lint/build、原生侧栏通过；Comet主区dist重载并历史恢复，见INT01 |
| U02 | 前端会话归属修复 / Vercel 前端消息流与 UI 优化 | ec1d / codex/vercel-ui-streaming-20260907；研究ec61762、实施6de3ee7、组合90b88d、文档057d49342ec2794fe4e0133d733a45da2b271b23 | 2026-09-08 00:16:57 GMT+8：发送前固定目标、访问代次、旧Port/恢复读取保护；候选139文件1045项、主区8文件103项、types/lint/build及双方隔离原生侧栏通过。[证据](panel-session-fix.json)、[过程](../../process_docs/0908-04_前端会话归属修复与整合.md)；首次失败保留 | 第一阶段完成；同Port快照/Decoder统一接受为下一阶段，未迁移UIMessage/useChat。i18n的panel冻结已解除，后续改动独立验证 | 已整合codex/agent-workspace-sandbox / 057d49342ec2794fe4e0133d733a45da2b271b23；保留H05及全部主区在途差异。已构建，本任务未重载用户Comet，交多语言/错误引导会话统一验收加载 |
| U03 | 订阅同步校验与恢复 / Vercel 前端消息流与 UI 优化 | ec1d / codex/vercel-ui-streaming-20260907；源码06f43836772849b64678b00f3865bab890d1a529，文档69f530e92092bb7648cd79171fd6ac57218b1eaa | 2026-09-08 00:43:00 GMT+8：最终候选4文件57项、主区8文件114项、types/lint/build通过；正常流/主动丢1帧原生侧栏均精确恢复。辅助全量140文件1064项非冻结口径，早期中止与环境问题独立保留。[证据](stream-sync-fix.json) | 旧revision忽略，先检查再提交解码状态，旧首快照1至30秒退避，新Port隔离订阅，published抑制首读取晚回；RPC同时间戳仲裁及状态提示仍待后续 | 已整合codex/agent-workspace-sandbox / 69f530e92092bb7648cd79171fd6ac57218b1eaa；6源码/测试预映像校验+5支持文件三方合并，其他在途改动保留。panel冻结已解除，本任务未重载用户Comet，由统一UI验收会话负责 |
| U04 | 同访问晚RPC回执接受 / 前端 | 源码708534a，依赖U03；源收尾174bad2 | 冻结140文件1073项，H07组合81项，主区123项及types/lint；两侧正常/丢帧原生侧栏通过，失败和副本边界见证据 | 无；用户运行中的Comet不重载 | 源码f7c496f；文档544505c51c0baebd7eb374e87c050aedab427d50，保留同期H08合入；[证据](rpc-reply-fix.json) |
| U05 | 消息连接/恢复提示 / 前端 | 源fb74a1a，源收尾e530d38，依赖U04 | 主区144项+合入后30项、types/lint、原生中英/320与480px/恢复/丢帧通过；候选1082通过1超时，原限制单独复测7项通过 | 无U05源码阻塞；全量超时与复测不拼成一次全绿 | 源码002e649，收尾4fc1e7b2737505a8a92f9f4229a723549cb3233b；catalog仅加注册且保留原有未提交i18n，用户dist/Comet未重载。[证据](sync-status-fix.json) |
| P01 | Pi 候选优化 / Pi Harness 优化 | M1 366f08701f2837c6607322b645ca87ce910b88e6；e927/codex/pi-contract-recovery-20260907；Pi0.85.1/BX03 ec206e2，H17 ac515409历史冻结保留 | 2026-09-08 09:29:14 GMT+8：types/lint、29文件329项、Pi和默认V双生产build/audit；各203源输入匹配冻结Git。真实Chrome151：完成/关重开、用户暂停、切换目标重载三场景通过；实载faux后台330141d95e8dfd36f6c5632f25716c8cb517fcde315a4b1557923cada28dd35f与构建一致，可信点击1次、CSV当前/发布v1。[M1验收与复现](</Users/Zhuanz1/.codex/worktrees/e927/浏览器网页批注插件/docs/research/pi-product-m1/README.md>) | 实际AgentService/Pi官方Lane/当前侧栏/真实BX03与存储；仅供应商faux。权限/断线回调、准备期Stop、原生身份与目标保存、清理/结果投影定向验证。关闭侧栏初次失败及修复记录保留；气泡措辞为M3/UI限制。[M1模块](</Users/Zhuanz1/.codex/worktrees/e927/浏览器网页批注插件/docs/modules/pi-product-m1.md>)、候选架构/README/过程0908-29已更新。M2长任务/未知写、M3兼容和M4真实质量未验，零付费 | 目标codex/agent-workspace-sandbox（44bf531）；未整合/发布/改用户dist。180d已独立复跑同一运行源码，待绑定本冻结SHA；测试Chrome与自有profile已释放。下一步按M2门槛安排，不能直接替换正式Vercel |
| E01 | 统一评测 / Vercel AI SDK 与 Pi 对比评估测试 | 报告c4a1d9f6d031ff995a32c22c53d59cf071bfa2b2；交接00c7763；设施fec84b2；Pi ac515409/Vercel6361ab05/BX03 ec206e2 | 2026-09-08 08:17 GMT+8：报告c4a1d9f6d031ff995a32c22c53d59cf071bfa2b2，设施fec84b2。固定12任务/17阶段结束：CSV Pi3/3、Vercel2/3；文章完整验收各1/3，发布Pi3/3、Vercel1/3；总506请求/15611897tokens。文章为评测助手定性评分，非真人盲审；内部摘要/输出预算/复核路径差异公开。251份证据hash、六批冻结、来源前后/独立CSV、全部资源清理通过。阶段选择Pi优先有限产品接入验证，正式Vercel保留；已向Pi/Vercel/执行器/UI四任务发送有界交接，停止泛化双路线开发和自动加测。Pi兼容缺口与文章忠实度仍需验收，不称SDK上限。[H17重复最终报告](</Users/Zhuanz1/.codex/worktrees/180d/浏览器网页批注插件/docs/harness-comparison-20260907/h17-repeat-results.md>)；旧单对f1fb9d2、原生审查917dace及历史失败/评分更正保留，不混分母。 | 固定系统比较完成；选择Pi进入有限接入验证，产品兼容及质量仍待验收 | 目标codex/agent-workspace-sandbox；主区44bf531，本轮候选未整合、无目标产品SHA、用户dist未改。 2026-09-08 08:43 GMT+8：已接收Pi8fd86bb/BX03接口90b5848/V兼容69a5d2b，M1实施已派发Pi任务在e927隔离完成；独立验收约定698c139（[M1入口验收](</Users/Zhuanz1/.codex/worktrees/180d/浏览器网页批注插件/docs/harness-comparison-20260907/pi-product-m1-acceptance.md>)）。新产品源码/实际Service与侧栏证据尚待交付，零新增付费；BX03冻结、正式V入口保留，M2长任务/故障验收不得由M1代替。 2026-09-08 09:32 GMT+8：M1有限产品接入独立验收通过，报告c479548；实现366f08701f2837c6607322b645ca87ce910b88e6已冻结。独立三场景证据7c6739f、准备期Stop3项复跑通过；148夹具/两构建各203源输入及脚本与冻结Git一致，BX03未变。原失败9e513d5保留。主目标44bf531未整合/发布，dist 221文件hash保持、双方测试浏览器释放、零付费。可进入M2压缩/overflow/摘要失败/worker中断与未知写验证；M3兼容/M4真实业务未通过。[M1独立报告](</Users/Zhuanz1/.codex/worktrees/180d/浏览器网页批注插件/docs/harness-comparison-20260907/pi-product-m1-results.md>)。 2026-09-08 10:11 GMT+8：用户明确继续，M2已派发Pi任务从366f087实施；事前9项门槛b359aaa（默认60主循环/3压缩、overflow、摘要错误/Stop、真实worker中断与未知写、恢复竞态），零付费/BX03冻结，尚无M2通过结论。执行器后续等待/核验建议排在M2收口后。[M2约定](</Users/Zhuanz1/.codex/worktrees/180d/浏览器网页批注插件/docs/harness-comparison-20260907/pi-product-m2-acceptance.md>)。 |
| BXS01 | 浏览器执行器重构前快照 / 浏览器执行器优化 | /Users/Zhuanz1/.codex/worktrees/browser-executor-baseline-20260908/浏览器网页批注插件；codex/browser-executor-pre-refactor-20260908；起点953ba65；源码59e7e55beedf87b57b3e596881271f8f48d94eb3，记录HEAD 9dfa0476bb7e6785812e4d08c5ec7cf5d73dda6d | 2026-09-08 01:43:16 GMT+8：捕获01:26:00.859的1905文件，types/lint/build通过；全量194文件1517项，1508通过9失败；分支与标签baseline/browser-executor-pre-refactor-20260908已推送私人origin并核对一致。[快照](../baselines/browser-executor-pre-refactor-20260908/README.md)、[记录](../../process_docs/0908-18_浏览器执行器重构前快照.md) | 开发基线备份已完成；已知回归与后续修复分开绑定版本。未做全新npm ci、真实模型/浏览器业务验收；保留原始空白格式诊断。后续WP/i18n/H07修复不混入本冻结证据 | 仅独立私人快照分支/标签，不整包合入codex/agent-workspace-sandbox；正式953ba65另已推送。未合Pi或Puppeteer产品实现、未发布/重载，主区index未改 |
| BX01 | 共享浏览器执行器研究 / Harness架构QA | 主区及目标codex/agent-workspace-sandbox；本轮研究开工397e8dd、收尾采样4fc1e7b及并行未提交内容；原研究及59e7e55/9dfa047备份保留 | 2026-09-08 02:16:32 GMT+8：长期方案写成，13节/8表/架构图、B0–B6实施与11组复杂任务评测；静态文档验证见[记录](../research/shared-browser-executor-20260907/implementation-validation.json)，[实施方案](../research/shared-browser-executor-20260907/共享浏览器执行器实施方案.html)、[过程](../../process_docs/0908-29_共享执行器长期方案与实施契约.md) | 单扩展、原生循环保留；Puppeteer首选可替换后端，公开输入/transport修复先行；realm/CSP、业务目标/数据集身份及unknown恢复必须验收。该研究时点B0/B1a未开发，后续输入候选见BX02；P01历史先导6通过2失败不能当整合通过。没有新模型/浏览器业务或上游运行测试；无本轮视觉通过结论 | 本次方案未提交，无新增执行器产品/整合SHA；Puppeteer未安装到主产品。旧研究已随独立私人快照归档；本轮不改产品源码、不重捕快照、不重复实现I02/H08/H09 |
| BX02 | 浏览器执行器 B0输入切片/B1a / 浏览器执行器优化 | /Users/Zhuanz1/.codex/worktrees/browser-executor-puppeteer-20260908/浏览器网页批注插件；codex/browser-executor-puppeteer-20260908；基线9dfa047；源码47c7843796578ac7d24949d6aa37e364284972dc，文档/交付a195e8789214757062f71a4be150f50f47b3f251，已推送origin | 2026-09-08 03:26:06 GMT+8：Puppeteer25.10.0公开输入、关闭/取消/迟到ACK、范围/焦点复查；最终Chrome142/152各18项、12文件103项、types/lint/build/audit通过，源码哈希绑定冻结提交。[验收](</Users/Zhuanz1/.codex/worktrees/browser-executor-puppeteer-20260908/浏览器网页批注插件/docs/research/shared-browser-executor-20260907/b1a-acceptance-20260908/README.md>)。原始失败保留 | 单扩展，未改原生模型循环；B0全量观察/持久回执契约与B2–B6未完成。新后台初版约+360KB，初步cold中位耗时增加且高波动，性能门槛未建立。无新模型业务，Pi尚未接入。主区I05及H11之后改动不从旧快照覆盖；只抽wait兼容导出 | 目标codex/agent-workspace-sandbox（本次核对beeb74c）；独立候选冻结，未集成/未发布/未改用户dist。需主区兼容、性能准入后精确增量整合；禁止整包合快照 |
| BX03 | 共享执行器有限准入 / 浏览器执行器优化 | browser-executor-puppeteer-20260908/codex/browser-executor-puppeteer-20260908；源码ec206e2923748ed3b3fa48ba97e2680ab7c8bd3a、原交接b7353dd已推送；接口审查90b584809c9998e8efb8262a2332d75aa821a71f；10:13补记未提交；依赖I06 ab10c607和基线9dfa047 | 04:32历史证据：21文件167项/types/lint/隔离build/audit，Chrome142/152各18项，10对20样本及后台恢复冒烟；[原准入](</Users/Zhuanz1/.codex/worktrees/browser-executor-puppeteer-20260908/浏览器网页批注插件/docs/research/shared-browser-executor-20260907/bx03-admission-20260908/README.md>)。10:13核对M1实现366f087与独立报告c479548：有限产品接入通过，provider为faux；共用浏览器源及构建插件对ec206e2无差异。本轮零新模型/浏览器/代码测试/构建 | 原宿主四接缝已有M1有限实现，完整PB矩阵及M2长任务/未知写、M3兼容、M4实模业务待验收。约5.6s后台页输入原因待诊断；旧样本不证明业务/token收益。当前输入保持冻结，M2后优先B3动作等待核验与性能，再按失败证据推进B2/B4；现有续读/采集不重写 | 目标codex/agent-workspace-sandbox/44bf531；两候选共用BX03，Pi M1未进入主产品或用户dist。已通知「Vercel AI SDK 与 Pi 对比评估测试」，不更改当前评测、不要求ACK。[接口交接](</Users/Zhuanz1/.codex/worktrees/browser-executor-puppeteer-20260908/浏览器网页批注插件/docs/modules/pi-browser-host-handoff.md>)、过程0908-75已更新；原90b5848历史审查保留，本轮纯文档未提交 |
| M01 | 主工作区并行功能 / 各对应任务 | 当前主工作区 HEAD 23a545138cfac3372868277ddd413cbc4e59d614 之外的未提交修改 | 开发中；包含网页助手、报错引导、字幕/翻译、插件体系和录屏等不同任务；不是全部已验收 | 各负责人按功能拆出完整提交、验证、依赖及共享文件范围，再逐项新增队列条目；不将整目录视为单一可交付快照 | 尚未按各功能登记 |

| Q01 | 网页助手系统审查、异常恢复与弹窗/工具条优化 | 主区及目标codex/agent-workspace-sandbox；末次HEAD99b2c06，本任务增量未提交；测试按审查时点绑定；依赖共享quick/design/i18n | 2026-09-07 23:40 GMT+8：六类产品缺陷+一项预览问题修复；定向27项、types/lint复核、build通过；全量1386通过/5失败，相关46项复核通过（不拼成全量）；IAB流程/窄屏/写回/撤销通过，见docs/audits/web-assistant-20260907.md及0907-175 | 与共享修改收束后仅提交确切文件；最终真实扩展/系统IME/站点兼容性及后续设计事项见审查；保留其他任务在途失败证据 | 主区工作区及本地构建已实现，本任务无交付/整合SHA，未发布 |

| R01 | 录屏单轨剪辑与声音交互 / 视频录制与剪辑 | 主工作区codex/agent-workspace-sandbox未提交增量；用户暂停 | 2026-09-08 04:01:20 +0800：真实原生授权、73.772秒录音回放、第二段静音恢复通过；上轮71项与四视口UI通过；见[暂停进度](../录屏与剪辑暂停进度-20260908.md) | 先完成其他核心任务；删除片段清单侧栏待实施；原网页直接圈选待做；冻结快照最终回归与依赖整合未完成 | 未暂存/未提交/未发布/未覆盖dist；候选output/builds/recording-native-0908；按用户要求暂停提交，恢复后重新核对依赖hash |

### 更新模板与合并记录

| 编号 | 待交付事项 / 负责人 | 源版本与依赖 | 当前状态及证据 | 进入集成尚需满足的条件 | 实际目标 SHA / 集成验证 |
| --- | --- | --- | --- | --- | --- |
| I01 | 中英文界面与错误恢复 | 主区codex/agent-workspace-sandbox；953ba65外未提交增量；2466对资源、显式绑定、只读语言Port和注入模板 | 全量194文件1519项通过；最后增量5文件58项及types/lint/build通过；见process_docs/0908-21_中英文与恢复引导交付验收.md | 验收包output/i18n-accepted-0908-0139；Comet用户新任务运行中未重载，实际加载待任务结束 | 目标同分支，无独立交付SHA，未发布 |
| I02 | 任务分组自动恢复 | 主区codex/agent-workspace-sandbox；378367f外未提交增量；documentId锚点恢复session | 7文件110项、types/lint/build、隔离Chrome实际reload恢复通过；process_docs/0908-24_任务分组自动恢复.md | 构建output/task-recovery-0908-0158；旧任务无锚点不猜测认领；Comet未重载 | 目标同分支，无独立交付SHA，未发布 |
| I03 | 快捷工具/设置/网页连接自动恢复 | 主区与目标codex/agent-workspace-sandbox，f750d05外未提交增量；无独立SHA | 38文件245项、types/lint/build及隔离原生Port同id/一次生成、旧脚本同document握手通过；process_docs/0908-40_快捷工具与网页连接自动恢复验收.md | dist已构建，Comet未重载；无真实模型/Gmail邮件业务验收，未知写操作不重放 | 已在共享工作区实现，未单独提交/未发布 |
| I04 | 混版本会话0秒中断兼容修复 | 主区/目标codex/agent-workspace-sandbox，f750d05外未提交 | 39文件252项、types/lint、候选build/audit、旧/新后台原生空闲恢复及同任务切页通过；process_docs/0908-42_旧后台与新版网页脚本兼容故障修复.md | 默认候选构建隔离；仅接收器原子交付dist，不整包带入在途代码，不重载Comet；真实Gmail业务未复测 | 无独立SHA；兼容脚本已交付，完整后台候选待统一版本交付 |
| I05 | 主会话唤醒、侧栏同步异常恢复、连接诊断 | 主区/目标codex/agent-workspace-sandbox，beeb74c外未提交增量，无独立SHA；复用U05/U06 | 44文件325项/types/lint/候选build与audit；原生生产AgentService+固定模型：worker实际终止+session绑定丢失后续聊、明确切页、新会话、多窗口通过；process_docs/0908-53_主会话后台唤醒与连接恢复验收.md | output/builds/agent-recovery-0908；执行协调方确认当前缺完整统一发布基线，不能整包提交/覆盖I01/WP在途依赖；真实Gmail业务/多小时压力未验收 | 源码候选验证完成，本轮未修改用户dist/重载Comet；完整统一版本交付待集成。03:44核对377f430：原manifest14源文件全部匹配；build-paths等15项仅当前补充快照，无独立提交；精确依赖入口[i03-i05-dependency-manifest.json](i03-i05-dependency-manifest.json) |

每项保留：编号、负责人/任务 ID、源分支与 SHA、基线依赖、目标分支与合并前 SHA、变更范围、验证命令及证据路径、未覆盖项、状态、实际整合 SHA、整合后的验证、核对时间。状态建议使用：开发中 → 候选已提交/待验证 → 可集成 → 已集成；无需进入正式产品的历史资料标记“仅保留”。

INT01 已登记实际整合与加载；其他任务按各行状态判断。以后实际合并发生时追加一条事件，保留源/目标 SHA、方式（merge/cherry-pick 等）、验证证据和负责人，不删除原有失败或待办记录。页面可以更新当前状态，但历史事件保留。

### 活动工作区规则入口

主工作区根 AGENTS.md 是项目规则真源。现有 4 个活动 linked worktree 在缺少根规则时放置本地 AGENTS.md 导航，指向主规则与全局状态。导航不是功能代码，阶段提交只暂存自己的确切文件。将来正式 AGENTS.md 通过 Git 集成到分支之前，先读取并确认入口仅含导航，再用正式文件内容替换该导航；不得让入口文件阻塞整合，也不得覆盖用户新增规则。历史对照工作区不改动。

工作区表的状态采集在放置入口之前。新增的本地 AGENTS.md 会表现为未跟踪文件，不能将其误认为新增业务源码；工作区是否有其他新修改仍需重新检查。G01 正式文档尚未提交，因此将来新建工作区时需先检查规则是否已随 Git 继承，缺失时补同样的导航。


### U01 第一轮架构审计冻结（2026-09-07 21:38:09 GMT+8）

源提交 `22d776a4264aeffd941a7bd4d8f3852b146324e4`，分支 `codex/vercel-ui-streaming-20260907`。本次仅新增研究报告、离线探针及其结果和过程记录，产品源码未改；基线仍继承 H01。证据：[架构审计](</Users/Zhuanz1/.codex/worktrees/ec1d/浏览器网页批注插件/docs/Vercel前端消息体系架构审计与优化路线.md>)、[探针结果](</Users/Zhuanz1/.codex/worktrees/ec1d/浏览器网页批注插件/docs/harness-comparison-20260907/vercel-ui-audit-probe.json>)。

验证：typecheck/lint、JS语法、隔离探针通过；4文件44项相关测试通过。首次共享依赖路径导致1组收集失败，临时配置允许确切依赖目录后重跑通过；未改正式测试配置。未运行真实浏览器、模型、全量构建。研究材料可集成，功能仍待实施验证；目标 `codex/agent-workspace-sandbox`，没有执行 merge/cherry-pick，没有目标整合 SHA。前端自有新增提交为 3c0ff2f 和本提交，勿重复引入基线 Harness。


### E01 首批真实诊断交接（2026-09-07 21:46:20 GMT+8）

已读取负责人报告并核对源 SHA ac074a641845772f680f46c40664609ec71330d1。本批旧冻结输入运行结束；CSV 双路通过，文章 Vercel 内容失败、Pi 内容有待人工裁定问题。报告材料可供集成，但不代表 H01 或新 Pi 版本已通过业务验收。实际目标仍为 codex/agent-workspace-sandbox，未执行合并、未追加付费运行；详见 E01 行与原报告。


### Q01 写作窗尺寸与提示跟进（2026-09-07 21:56:40 GMT+8）

主工作区 codex/agent-workspace-sandbox，基线23a5451，新增修改未提交、无交付或整合SHA。默认宽度420px，完成态辅助说明使用tooltip；typecheck/lint/build、3文件21项测试通过，实际预览宽度420/320px验证通过。已更新网页快捷助手PRD、design-qa、PROJECT_STATUS及process_docs/0907-162。目标分支同主工作区；共享功能收束后提交，未发布或重载真实Chrome扩展。


### Q01 工具条外缘停靠跟进（2026-09-07 22:10:26 GMT+8）

所属工作区及目标分支均为主工作区codex/agent-workspace-sandbox，基线23a545138cfac3372868277ddd413cbc4e59d614，当前增量未提交、无交付/整合SHA。写作工具条停靠输入框外缘、16px间隔、无空间收小入口、组词避让、同框手动位置保留已完成。typecheck/lint/build与9文件47项相关回归通过；IAB正常/换行/拖动后输入/上下翻转/小入口菜单通过，系统IME窗口与实际扩展重载未覆盖。更新架构、PRD、PROJECT_STATUS、design-qa及process_docs/0907-166。阶段验证完成；需与共享quick/i18n源码收束后独立提交，未发布。


### V01 视频字幕与播放器助手审查（2026-09-07 22:16:00 GMT+8）

所属工作区与目标分支：主工作区 codex/agent-workspace-sandbox；基线23a545138cfac3372868277ddd413cbc4e59d614。当前字幕增量未提交，无交付/整合SHA，未发布。依赖同工作区 quick共享工具条/AskChat/附件、translation运行时、Agent来源协议；仅本任务视频文件及对应测试进行了本轮缺陷修复。42文件265项相关及共享链路回归、typecheck/lint、独立release构建通过；真YouTube引用、YouTube/B站容器全屏通过，B登录后新版流程及真实模型验收仍缺。证据：[审查矩阵](../video-context/subtitle-module-audit.md)、process_docs/0907-170。已更新模块说明、架构入口、PROJECT_STATUS；待真实环境及共享修改收束后独立提交，不能整包暂存主目录。


### I01共享源码冻结交接（2026-09-07 23:16:34 GMT+8）

I01已向U01确认暂停自身对panel/transcript/markdown-view/package/lock/build的修改，允许以当前主区文件为底叠加已授权的消息流增量；只代表本任务冻结，其他任务需各自确认。保留本地化、错误恢复、failure RPC及只读语言桥接；待U01组合验证/应用结果回传后解除。当前仍为主区23a5451外未提交增量，无新整合SHA，本次没有执行合并或代码测试。文件哈希与完整交接范围见[冻结记录](../../process_docs/0907-174_多语言共享文件冻结与消息流整合交接.md)。


### INT01 前端与 Harness 组合整合进行中（2026-09-07 23:19 GMT+8）

用户已授权由前端会话统一整合、组合验证和构建加载。固定 U01 429512b + H03 8fcbe80（包含 H01/H02）；ec1d 组合源码无冲突，正在完整回归。已取得 Harness、插件、i18n、网页助手、视频任务共享文件冻结/保留范围确认。主区基于每个文件旧内容 SHA-256 校验应用37文件的最小三方增量，保留全部原有未提交功能；当前 HEAD 仍为23a5451，尚未提交/更新分支。主区 types/lint及全量测试中。仅新增 remend 依赖，未扩大 manifest 权限；实际 Comet 扩展加载目录已核对为主区 dist，尚未构建重载。证据在 ec1d process_docs/0907-174_前端与Harness组合整合.md，完成后补实际目标 SHA 与加载验证。

INT01 23:27 更新：目标已从23a5451快进e09e539（U01+H03双父组合）。各负责人确认冻结后逐文件三方合并；index仅含组合已提交tree，主区其他修改保留为未提交。候选138文件1014项全过；主区首轮183文件1386项有1项quick测试在owner编辑期间失败，冻结后28文件145项及types/lint/build通过，最后固定源码全量中。Comet原扩展已重载，历史侧栏恢复，无权限扩张。待最终全量与文档冻结再补最终SHA。


### INT01 整合与加载完成（2026-09-07 23:30 GMT+8）

目标 `0c69ad5feeb4f05dc8cc0225f8a41fe8728997f1`，源码组合 `e09e539`，父U01 `429512b` + H03 `8fcbe80`；含H01/H02且无重复引入。组合138文件1014项通过；主区首次183文件1386项有1项运行期间变更的quick测试失败，保留原证据；冻结后的28文件145项及最终184文件1390项全通过（23:24:02开始，316.63秒）。types/lint/build与主区原生侧栏通过。实际Comet扩展mfnhpkekjldkkockdkimhabogafnpcgp从主区dist重载，既有历史与输入框恢复、权限不变、未发送模型请求。

主区其他任务未提交源码完整保留；后续新增未接线视频文件不在本次已加载构建内。主架构、模块和状态已更新。[最终过程证据](../../process_docs/0907-174_前端与Harness组合整合.md)、[构建指纹与测试结果](vercel-ui-harness-integration.json)。各任务解除临时源码冻结，后续变更须独立验证，不套用本次成绩。

### H04 实际整合（2026-09-07 23:44:25 GMT+8）

源99b2c06f760161b1844c1c22820ff3b7b3106033从主区父0c69ad5安全快进，仅5个阶段文件；后续2份验收文档快进到f30bcad95fc63e346c8c441da619a0aafa14afd2。两次操作均验证暂存区为空、目标路径无他人修改，合并前后原有已跟踪未提交差异哈希不变。5977与主区已对齐，无新增/删除worktree。

候选12文件190项；主区23:42:10同12文件192项通过（9.93秒），多出的2项是主区原有Markdown/工具确认卡测试；typecheck/lint/build通过。首次lint碰到中英文任务临时语法错误，负责人修复后才完成本次验证，不抹去首轮失败。主区仍有其他任务修改，本结果不是干净源码的全产品验收。H04已构建但未重载Comet，无新付费模型业务验收；INT01原1390项与加载记录仍只属于此前版本。模块、架构及状态已更新，详见process_docs/0907-175_Vercel来源复核范围诊断.md。


### V01 字幕来源同步与入口修复（2026-09-07 23:49:21 GMT+8）

字幕共享来源与 SPA 自动跟随修复已进入主工作区未提交源码：VideoSourceHub 统一双端来源/轨道；修复过期 Port.sender.url 导致切视频读取被拒；保留展开与语言偏好；去掉视频引用按钮原生边框，入口改为“在视频上显示 AI 双语字幕”。最终字幕专属 11 文件 86 项、types/lint、独立 release 和主区 build 通过；真实 YouTube 同文档切换及双向轨道同步通过。390/880px UI 已验收。B站真实登录切分P、真实模型翻译质量未验证。本轮 dist 已构建，原 Comet 扩展尚未确认重载。所属/目标均为主区 codex/agent-workspace-sandbox，核对 HEAD f30bcad；本功能没有交付或整合 SHA。 [过程证据](../../process_docs/0907-178_字幕来源同步与双语入口验收.md)。模块说明、主架构及审查矩阵同步完成；宽范围回归的并行 i18n 测试失败保留在证据中，未称全量通过。

### Q01 截图删除与选择相邻（2026-09-07 23:50:24 GMT+8）

主区/目标 codex/agent-workspace-sandbox，HEAD f30bcad，本次无交付或整合 SHA。仅调整共享 src/capture/editor.ts 的删除按钮插入位置，事前已通知录屏任务，保留其余修改。33 项截图编辑测试及 typecheck/lint/build、IAB 选择/删除/撤销通过；本地构建已更新，真实扩展未重载，未发布。模块说明与证据：process_docs/0907-181_截图删除与选择按钮相邻.md。

### 技能介绍悬停修复（报错与引导优化任务追加）

2026-09-07 23:54:47 GMT+8：用户报告的输入误弹出、离开卡片不关闭已修复。仅实际指针移动触发240ms等待，离开120ms收起，输入/IME/失焦取消；2文件40项及typecheck/lint/build通过。主区codex/agent-workspace-sandbox、基线f30bcad外未提交增量，无交付SHA，目标同分支；本轮dist已构建，未重载Comet。见../../process_docs/0907-182_技能介绍悬停误触发与延迟关闭修复.md。不改变I01尚未完成的全产品多语言范围。

### I01 配合 U02 的 panel.ts 临时冻结

2026-09-08 00:05:49 GMT+8：收到前端负责人整合协调后，I01确认暂不编辑主区src/agent/panel.ts，当前无该文件在途修改。保留已有多语言、错误恢复、设置直达和failure RPC；仅本任务冻结，等待U02完成通知解除。当前主区HEAD 75bacf2，本次仅协调记录，无新增验证或整合结论。见[冻结记录](../../process_docs/0908-02_多语言panel文件冻结配合U02.md)。

### H05 实际整合（2026-09-08 00:06:59 GMT+8）

主区f30bcad → 源码75bacf295890a8ae4684b9c12397c6e33c08981f → 验收文档e827bdf183d75144352cfba92ed42986a0327a7c，均快进。6个阶段文件含源码、测试和模块/过程文档；同文件其他任务inspectPage描述通过精确补丁保留，暂存tree等于冻结source tree后才快进，最终暂存区为空。合并检查的diff头哈希变化及实际保留验证见阶段记录，不整包暂存其他任务。

候选00:02:47相关9文件129项/3.70秒；主区00:05:24同9文件129项/4.23秒，双方types/lint/build通过。主区包含并行增量，非干净源码全产品验收；没有新模型请求、真实浏览器验收或Comet重载。原H04、E01及INT01证据边界保留，无新增/删除工作区。架构、文件模块、状态、过程文档已同步。


### V01 视频字幕设置（2026-09-08 00:11:56 GMT+8）

主区/目标codex/agent-workspace-sandbox，核对HEAD e827bdf，本功能未提交、无交付/整合SHA。播放器齿轮与Quick现有video子页复用设置组件；显示偏好、等待策略、共享术语及受保护存储桥已接入。23文件173项、types/lint、独立release和主区build通过；真实YouTube设置读写/SPA/轨道同步及B站未登录设置读写/全屏通过；B站登录后流程及真实模型质量未验收。主区dist已更新，未重载用户Comet，未发布。README、模块、架构与design-qa同步；[证据](../../process_docs/0908-03_视频字幕设置与双平台验收.md)。

### U02 第一阶段整合完成（2026-09-08 00:16:57 GMT+8）

实施6de3ee7在H04基线上验证后，合入主区H05 e827bdf形成90b88d；主区按3个源码/测试文件预映像校验三方叠加，9个研究/文档文件无冲突整合，再快进90b88d与文档057d49342ec2794fe4e0133d733a45da2b271b23。主区i18n确认panel冻结，保留设置引导、dataSharing、skillTokens、quick导航与视频协议；其他任务工作区差异完整保留。

候选139文件1045项；主区8文件103项及types/lint/build通过；组合分支另有相关回归。双方隔离原生侧栏400源事件、1000工具、12次输入、滚动0、精确输出、刷新、remend通过。初次红回归、浏览器路径错误和额外外部输入影响单独保留；没有模型调用。证据见panel-session-fix.json。用户Comet未由U02重载，最终统一构建加载由多语言/错误引导会话负责，已经解除panel冻结；之后的源码或dist变更不得套用本轮成绩。

## WP01 · WordPress七场景（2026-09-08T00:20:27.033513+08:00）

- 所属/目标：主工作区 `codex/agent-workspace-sandbox`，核对HEAD `057d49342ec2794fe4e0133d733a45da2b271b23`；源码在主区未提交，没有独立交付SHA。无需cherry-pick。
- 范围：WordPress连接器/8工具/5Skill/媒体导入及审批展示；复用既有SEO模块，未修改Harness循环。与U01/H05共享runtime保留既有修改。
- 验证：typecheck、lint、11文件119测试、build通过；本地设置预览已看到37Skill、新5项、共享连接器入口、检测按钮。真实WordPress站点与Comet重载未执行。
- 集成状态：主区源码和构建产物已接线；尚非冻结发布提交。根工作区含数百项跨任务未提交内容，不能整体提交为WP01；当前依赖未冻结的既有SEO连接器。后续冻结由精确文件/补丁处理，禁止整包暂存。
- 模块/证据：[WordPress模块](../modules/wordpress-workflows.md)；过程记录0908-004与[0908-006最终验收](../../process_docs/0908-006_WordPress七场景集成验收.md)。


### V01 首页/搜索页进入视频的连接修复（2026-09-08 00:35:32 GMT+8）

真实复现IR5rTZMsdIE从搜索页进入后被旧sender.url鉴权拒绝，补连接入口的平台文档认证及引用当前frame验证。类型/Lint、14文件108项、独立与主区build通过；真实搜索→视频→字幕/模型配置→引用通过。此前173项与直达视频测试不包含该入口。主区/目标codex/agent-workspace-sandbox，基线057d493，未提交、无交付SHA、未发布；dist已更新，用户浏览器未重载。本轮未真实调用模型。模块/架构/审查记录同步；[证据](../../process_docs/0908-09_视频搜索入口连接故障复现与修复.md)。

### U03同步校验整合完成（2026-09-08 00:43:00 GMT+8）

基线057d493→源码06f4383→文档69f530e92092bb7648cd79171fd6ac57218b1eaa。Harness确认后台订阅无在途修改、i18n确认panel临时冻结后，以6文件SHA256校验叠加并验证，其他已有功能保留；5个模块/计划/证据/过程/验证脚本路径无冲突三方整合。实际主区types/lint/build及8文件114项通过，最终源码指纹稳定。正常流与丢帧原生侧栏各400源更新/1000工具/12输入，精确文本、滚动、刷新/remend均通过；丢帧场景实际替换Port。统计包含观察Port，不与旧单Port性能数据比较。

辅助全量140文件1064项运行期间补了限速分支，不能替代最终冻结回归；最终候选4文件57项、主区114项及原生结果为本轮冻结依据。最初并行worker退出超时中止、随后为补恢复逻辑中止、测试浏览器配置重建导致缺少路径等如实记录。panel已解除冻结，用户Comet未由U03重载；后续源码/构建各自验证。

### Q01 关闭提示类型修复（2026-09-08 00:44:25 GMT+8）

主区/目标codex/agent-workspace-sandbox，HEAD69f530e外未提交增量。ToolbarDismiss 的 title/aria-label 共用readText解析动态文案，修复共享类型阻塞；types/lint及两文件16项通过。无交付/整合SHA，本轮未构建/重载浏览器。详见[过程记录](../../process_docs/0908-12_工具条关闭提示类型修复.md)。


### V01 字幕翻译恢复与双端任务同步（2026-09-08 01:00 GMT+8）

主区/目标codex/agent-workspace-sandbox，核对953ba65外未提交视频增量，无交付/整合SHA。新增双端被动订阅、显式任务状态、同任务无损加入与格式失败有界缩批恢复；旧消息哈希兼容，完成视图保活。types/lint、14文件119项通过。真实YouTube 7ARBJQn6QkM取得581段＋本机可控模型模拟72段后两次漏行，双端最终581/581、重开重复请求0；未验证真实模型译文质量。共享21文件166/167通过，Quick旧文案断言交并行负责人处理；独立release已构建，用户Comet未重载，最终dist/加载交i18n统一执行。模块/架构/审查已同步；[过程证据](../../process_docs/0908-11_字幕翻译恢复与双端任务同步.md)。

### WP01 页面布局阶段（2026-09-08T01:24:28.349347+08:00）

主区/目标codex/agent-workspace-sandbox，核对HEAD953ba652外未提交，无交付SHA。10个工具接入runtime，建页Skill已升级且保留旧包；多列/嵌套/FAQ/表格/分区样式、主题档案、编译与模板选择完成有限实现。types/lint、7文件85项、build通过；官方解析18节点有效。dist已构建，未重载用户扩展、未真实站点验收。ACF动态绑定、CPT插件与区块主题部署尚待实施。过程记录：process_docs/0908-019_WordPress页面布局阶段验收.md（相对仓库根）；模块与完整方案同步。

### U04晚回执保护整合完成（2026-09-08 01:49:33 GMT+8）

708534a在69f530e上冻结140文件1073项；与H07组合c26b5f通过6文件81项、types/lint。主区3项源码/测试SHA256预映像叠加，panel两处冲突保留i18n文案，主区8文件123项、types/lint通过；原生构建副本正常/丢帧通过。随后源码快进f7c496f。收尾期间另一任务把H08合到5e40a00，因此将本轮四项文档按精确补丁提交为544505c51c0baebd7eb374e87c050aedab427d50，保留H08而未重置或额外混入其改动；不把本轮H07组合测试等同H08全产品回归。

主区初次类型失败由连接器负责人修复；原生临时构建初次漏复制wordpress-site目录，补齐后通过，均见rpc-reply-fix.json。原生副本捕获早于无关连接器类型修正，主区types晚于修正，分别记录。U04三文件从回归到整合指纹一致，未改主区dist或重载用户Comet。更新模块、计划、证据、process_docs/0908-22、主架构与前端状态；无依赖/协议变化。下一阶段连接/恢复状态提示，跨worker全局版本仍未实现。


### V01 入口 Hover 对比度（2026-09-08 01:55:21 +0800）

主区/目标codex/agent-workspace-sandbox，HEAD378367f外CSS未提交增量，无交付SHA。修复entry深色hover/active与notice白底白字；真实Chrome样式/鼠标/焦点验证、30项、types/build通过。全局lint在并行WP测试的无用转义失败，未称全通过。dist已构建，用户Comet未重载；[证据](../../process_docs/0908-27_视频字幕入口悬停对比度修复.md)。

### WP01 浏览器独立建站首版（2026-09-08T01:56:12.677989+08:00）

主区/目标codex/agent-workspace-sandbox，核对378367f外未提交，无交付SHA。已接入配套CPT/字段插件、原生区块主题、动态目录、站点配置工具和组件下载；12个WordPress工具，建页Skill升级，保留历史包。最终types/lint、10文件145项、build通过；正式ZIP在WP6.9.7/PHP8.3.31/ACF6.8.9的18项服务器验收通过，前端入口/下载校验/示例窄屏通过。dist已更新，未重载用户扩展/真实站点验收/公开发布。初装ZIP需WP后台上传，域名主机和复杂定制不在首版范围。过程：process_docs/0908-028_浏览器Agent标准外贸建站首版交付.md（仓库根相对路径）；WordPress模块与架构已同步。

### WP01 撤回主题捆绑（2026-09-08T02:04:21.984977+08:00）

根据用户明确纠正，移除主题打包/下载/激活/专属品牌配置，建页沿用用户已有主题；可选数据插件不作为普通建页前提。types/lint、5文件53项与build通过，dist无主题ZIP或theme清单项。主区/目标codex/agent-workspace-sandbox，378367f外未提交，用户扩展未重载。旧主题交付说明失效，详情process_docs/0908-030_撤回浏览器扩展捆绑WordPress主题.md（仓库根相对路径）。

### U05连接恢复提示整合完成（2026-09-08 02:13:02 GMT+8）

源码fb74a1a（11个文件）从174bad2候选完成验证；主区七项源码/测试/探针按预映像与SHA256叠加，CSS仅追加本组件规则；四项模块/计划/证据/过程三方整合，f0bb0eb→002e649，收尾文档4fc1e7b2737505a8a92f9f4229a723549cb3233b。保留主区其他任务代码与分支，没有整体stash/reset。catalog两行注册在原未提交i18n目录内，未整包暂存，集中双语文本随U05源码提交。

最终主区10文件144项、types/lint、独立构建原生中英文热切换/320与480px/10秒提示/手动只读重连/保留消息与草稿焦点/丢帧恢复通过，合入后2文件30项及types/lint再通过；U05七路径指纹保持。候选最终build通过；全量141文件1082通过/1项页面大字段测试默认5秒超时，同限制单worker独立7项通过，不拼成一次全绿。早期非冻结回归失败单列于JSON。用户dist未改，Comet未重载；临时浏览器关闭。模块、计划、过程、架构、状态同步完成。


### 运行标题源码显示与 Comet 实际加载补记（2026-09-08 02:18:49 GMT+8）

本轮核查主区既有未提交 i18n 修复 transcript.ts label()，未新增源码提交；主区 2 文件 32 项回归通过。已在当前任务完成且输入为空后，通过原生扩展管理页重载主区 dist，并返回 Gmail 重开侧栏，原 4 轮历史、耗时和结果恢复；未新增模型调用、未刷新 Gmail。此为实际加载状态更新，不替代全量组合验收；最终正文夹杂过程性文字另待追查。证据：[0908-34_运行标题源码显示核查与实机重载.md](../../process_docs/0908-34_运行标题源码显示核查与实机重载.md)。

### WP01 现有站点检测与适配（2026-09-08T02:19:53.427778+08:00）

主区/目标codex/agent-workspace-sandbox，核对4fc1e7b外未提交，无本功能交付SHA。升级wpReadDesignProfile并增加wordpress-assessment：有界内容模型/权限/schema检测与行动方案；Skill先读方案再建页。最终types/lint、7文件92项、build通过，WordPress6.9.7无配套插件真实API数据验证页/文章可尝试草稿。dist已构建，未重载用户扩展；客户站点/真实模型四页草稿与浏览器端到端待验。过程process_docs/0908-036_现有WordPress站点检测与适配方案交付.md（仓库根相对路径）。

### V01 引用面板布局交付（2026-09-08 02:30:25 GMT+8）

主区/目标codex/agent-workspace-sandbox，HEAD4fc1e7b外未提交视频布局，依赖已有共享视频/i18n/侧栏源码，无独立交付SHA。91项、lint/build与六组前端组件视口/交互通过；typecheck复核见[过程记录](../../process_docs/0908-38_视频引用面板常驻操作与平台标识验收.md)。dist更新完成并已通知恢复任务释放构建；用户Comet未重载，未发布。不得以本轮模拟字幕/模型的布局验收代替真实平台读取/翻译质量验收。

V01最终类型边界（2026-09-08 02:33:06 GMT+8）：91项/lint/build及组件浏览器检查通过；整库typecheck受并行录屏microphone-guide.ts:59事件类型不匹配阻断，已交负责人；本功能未提交，核对主区HEAD f750d05。

### WP01 四页草稿与浏览器验收（2026-09-08 02:35:17 GMT+8）

主共享工作区/目标 codex/agent-workspace-sandbox，核对HEAD f750d05 外未提交，无独立交付SHA。更新建页Skill四页编排、实际URL补链、回执续建和逐页验收。最终typecheck、lint、4文件39项与build全部通过；真实WordPress6.9.7无配套插件26项，真实Gutenberg44个有效区块、8组桌面/窄屏检查通过。dist已构建，未重载用户扩展或发布；不是客户站点/真实模型/扩展认证端到端验收。全站菜单、页眉页脚和发布仍待实际配置。 过程：process_docs/0908-041_WordPress四页草稿与浏览器验收.md（仓库根相对路径）；证据：docs/research/browser-wordpress-site-20260908/four-pages/README.md。

### WP01 原生设置与布局读取（2026-09-08 02:41:48 GMT+8）

主共享工作区/目标 codex/agent-workspace-sandbox，核对HEAD f750d05外未提交，无交付SHA。原生站点设置与布局只读发现接入现有12个WP工具。typecheck、lint、5文件46项及build通过；无配套插件WordPress6.9.7真实REST处理19项通过。dist已构建，未重载用户扩展、未发布、未操作客户站点。导航与模板写入/绑定尚未实现，不代表整站配置完成。 过程：process_docs/0908-043_WordPress原生设置与布局读取交付.md（仓库根相对路径）。


### V01 双语字幕入口居中（2026-09-08 02:50:36 GMT+8）

主区/目标 codex/agent-workspace-sandbox，f750d05 外未提交。局部 CSS 消除图标向上 2.5px 偏移；标准模式真实浏览器图文中心、hover/active、200% 与中英文检查通过，types/lint、25 项回归和独立候选 build 通过。用户 dist 与加载版本未改，待稳定交付。[过程记录](../../process_docs/0908-45_视频双语字幕入口图文居中修复.md)。

### U06 原生推理分离候选（2026-09-08 02:53 GMT+8）

源4e79f64，ec1d/codex/vercel-ui-streaming-20260907；目标codex/agent-workspace-sandbox。已通过候选types/lint、4文件66项及7文件65项/build，真实合成模型协议证据见[reasoning-separation.json](reasoning-separation.json)。主区工作文件精确叠加10路径，runtime只改导入、ContextManager策略和主循环providerOptions，保留连接器/视频等在途增量。主区组合验证待完成、尚未Git整合；未触碰用户dist或重载。不是Gmail正文清洗器，不修旧消息；复杂业务/真实压缩恢复待验证。

### WP01 简单导航精确修改（2026-09-08 02:54:09 GMT+8）

主共享工作区/目标codex/agent-workspace-sandbox，最终核对HEAD90f0bdd外未提交，无独立交付SHA。新增导航计划/应用，WordPress按需工具现14个。最终typecheck/lint通过，6文件82项回归通过，独立候选output/builds/wp-navigation-0908构建通过。实际WordPress默认页眉写后回读、10个Gutenberg有效块、桌面/手机与菜单开关/产品链接跳转通过。本轮最终候选未交付dist、未重载用户扩展或发布，不代表客户站点/真实模型/扩展认证端到端通过。 文档：process_docs/0908-047_WordPress简单导航精确修改交付.md（仓库根相对路径）；证据：docs/research/browser-wordpress-site-20260908/navigation/README.md。

### U06 原生推理整合完成（2026-09-08 02:55:11 GMT+8）

源4e79f64d2ed787ada04625c7e8474a1d52c1df05，主区90f0bdd2678897a8a99af53482d18103f599b65c→0ab8fcde6561b4248227efcecee05225401e50a5。10项增量精确集成，保留全部其他任务改动；主区工作文件types/lint、12文件137项与独立build通过。源/主组合验证与真实合成协议边界见[整合证据](reasoning-integration.json)和[三组实测](reasoning-separation.json)。主架构、Thinking模块与前端状态已更新；本次未动dist/未重载Comet，旧文本不重写。过程：[交付记录](../../process_docs/0908-48_原生推理分离整合与加载边界.md)。

U06收尾版本：前端分支1f521545db522838556f874cc68fbb1ace075f2f、主目标c2d317ce96fccd8e70f294cbad98d943348255f3；仅补确切三份验收/加载记录，生产源码未变，未重复模型调用或覆盖构建。


### V01 紧凑入口实际目录交付（2026-09-08 02:57:55 GMT+8）

主区/目标 codex/agent-workspace-sandbox，c2d317c 起点外未提交。入口缩小至 28px 高、16px 图标；types/lint、25 项回归、两入口构建与标准模式浏览器验证通过。已对 dist/video-assistant.js、quick-content.js 原子更新精确 CSS，其他逻辑不变，哈希回读通过；未操作用户浏览器，需刷新视频页加载。[证据](../../process_docs/0908-49_双语字幕入口缩小与加载目录交付.md)。


### V01 全屏隐藏网页工具栏（2026-09-08 03:01:49 GMT+8）

主区/目标 codex/agent-workspace-sandbox，c2d317c 外未提交；EdgeHandle 暂时隐藏与退出恢复，不改用户配置或视频字幕。types/lint、37 项、quick-ui 构建与真实 Chrome Fullscreen API 切换通过。dist/quick-ui.js 已精确原子交付两处逻辑，用户浏览器未刷新。[过程记录](../../process_docs/0908-50_全屏隐藏网页悬浮工具栏.md)。

### U07 展示规则研究（2026-09-08 03:02:03 GMT+8，未实施）

ec1d/codex/vercel-ui-streaming-20260907，研究起点1f52154。已对照Codex稳定0.153.4/main 769a6a5bcd57138effa9f29773737e132f676b9b和主区c2d317c外源码，六类消息/折叠与U07-A/B/C验收方案进入[现有模块文档](../消息过程与最终结果设计.md)。本轮仅文档，无产品改动/新模型调用/扩展加载；研究提交待记录。过程：../../process_docs/0908-51_Codex事件渲染对照与前端展示优化方案.md。

U07研究已提交830d6b5ab6f9723cd6e8c84f101a337954ce63c3，三份文档已精确整合40be38e238002b78d74f3dba3602efd303b6ffab；产品源码未变。方案进入主区不代表UI行为已实现或加载。

### WP01 真实HTTPS验收（2026-09-08 03:10:56 GMT+8）

主区/目标codex/agent-workspace-sandbox，40be38e外未提交、无交付SHA。产品82项/types/lint/候选build通过，新增辅助TS最终types/lint通过。独立候选已实际装载到测试Chrome，真实HTTPS应用密码连接、四页草稿写入回读通过；首次modelRun=false仅为隔离配置未带入；现已复用原有模型，真实侧栏hasKey/dataSharing/visionReady均为true，真实Agent端到端已启动、尚待结果。未覆盖dist或重载用户扩展。 过程：process_docs/0908-054_WordPress真实HTTPS验收与模型待配置.md（仓库根相对路径）；证据docs/research/browser-wordpress-site-20260908/e2e/README.md。

### U07 双内核前端深度研究收尾（2026-09-08 03:25:44 GMT+8）

源0cc33e9cd759aeef376ad5f7674638cb194896c4（ec1d），主目标beeb74c708198942e2ee999665d77ab2e4533ee3→af4dddf8adf1149c7500a7fa8c45698ac3690a31，只整合七份方案/来源/基线/探针/过程文件。研究只读5977的9ff7953与Pi的ce95983；没有把原生历史或内核源码互相合并。32项合成断言符合预期，含旧Pi对新append拒绝、中间气泡误当结果与paused说明隐藏反例；缺口未修，不算产品全兼容。方案：[共同前端](../双内核前端消息展示兼容方案.md)；过程：../../process_docs/0908-56_双内核共用前端深度研究与兼容探针.md。主架构与前端状态已补候选入口；I05稳定性是外部在途依赖，未混算验收。无新模型/浏览器调用、未改dist或实际加载。

### 用户范围决策：先选型，后重构（2026-09-08 03:38:20 GMT+8）

源6ac0dd8af88a8e73dbcb9938ef9840a907a78a08→主目标377f430efdbeecd3f5264da18850ceb5dbe5c20f。用户明确最终只选一个内核，双内核兼容与U07前端重构暂缓，等待两候选优化/评测及选型结果。保留全部研究和既有修复，无兼容代码需要回退；不停止两内核评测或其他会话既有工作。[记录](../../process_docs/0908-60_先选内核再重构前端的范围调整.md)。


### BX02 跨任务接入协调（2026-09-08 03:41:10 GMT+8）

本次只核对与定向通知，未变更 BX02 源码/冻结提交或集成状态。最新主区 377f430efdbe 仍有 I05 等共享在途内容；兼容核对须保留 revision3/channel 与 buildDirectory。Vercel 继续共享 H14，Pi 复用并验原生恢复，前端按已提交范围暂缓 U07，独立评测刷新候选与资源准入。本任务后续负责 BX02 兼容/性能及 B2 真实页面读取，不整包合旧快照；H13 预存来源测试不覆盖浏览器采集。通知和证据见[协调记录](../../process_docs/0908-61_执行器与内核任务进度协调.md)。

### WP01 真实模型复测与工具分组修复

模型配置已复用，无需用户重填。前两轮发现重复检查和频繁上下文压缩，未发布，已保存失败证据。WP短内容回执、Skill进度指引、seo/maps按需工具组已修改；types/lint/53项与独立build通过。主区/目标codex/agent-workspace-sandbox未提交，无交付SHA，仅加载隔离Chrome，第三轮验收尚在运行。过程：process_docs/0908-062_SEO地图工具按需加载与WordPress复测.md（仓库根相对路径）。

WP01本轮收尾：三轮真实测试已暂停，未发布；修复代码types/lint/53项/build通过，新后台入口复测时侧栏CDP调用超时，第四轮未启动。测试Chrome关闭、profile保留，配置无需重填；完整自主建站未通过。当前证据docs/research/browser-wordpress-site-20260908/e2e/current-result.json。

### Q01 空白行原位创作设计（2026-09-08 06:05:17 GMT+8）

主区/目标codex/agent-workspace-sandbox，HEAD44bf531。仅新增[候选方案](../design/inline-writing-assistant.md)：保留选文功能，新增空白行创作，按宿主能力适配触发/插入/高亮。未改产品、未运行实现测试/构建，文档未提交、无交付/整合SHA。过程证据：process_docs/0908-70_空白行创作通用适配设计.md。

### Q01 文档上下文与创作提示词候选（2026-09-08 06:08:19 GMT+8）

[原位创作方案](../design/inline-writing-assistant.md)已补全文档范围、每轮快照、插入位置、长文覆盖和独立提示词。当前选文资料上限及正文改写提示词不能直接代表此能力；尚未实现/测试。主区与目标codex/agent-workspace-sandbox，HEAD44bf531，本轮仅文档未提交，无新整合SHA，证据process_docs/0908-71_原位创作文档上下文与提示词方案.md。

### Q01 写作助手兼容设计完成（2026-09-08 06:27 GMT+8）

主区/目标codex/agent-workspace-sandbox，HEAD44bf531，文档与研究用例未提交、无新交付/整合SHA。[交互与写回契约](../design/editor-writeback-contract.md)已补动态锚点、焦点/Enter、写回核验及兼容验收；先解决现有正文保护问题再新增空白行创作。诊断8项、既有回归31项、types/lint通过，研究TS单独验证；未实现方案、未做真实Notion写入或原生Enter验收、未改dist。证据见[兼容研究](../research/editor-compatibility-20260908/README.md)及process_docs/0908-72_写作助手兼容与误删风险研究.md。

### Q01 写作正文保护阶段0实施（2026-09-08 06:45 GMT+8）

主区/目标codex/agent-workspace-sandbox，HEAD44bf531，源码/文档未提交，无本阶段交付/整合SHA。实现写作焦点/编辑事件边界、继续改写保持焦点、空结果拒绝、一次快照写回及异步控件核验。types/lint、28文件169项、隔离build/audit通过；浏览器测试页Enter/替换/插入/多段/Undo通过，真实Notion与模型业务未验收。候选output/builds/writing-safety，未改dist；空白行创作与动态编辑器适配仍为后续阶段。[验收](../research/editor-compatibility-20260908/implementation/README.md)，过程process_docs/0908-73_写作输入隔离与写回核验实施.md。
