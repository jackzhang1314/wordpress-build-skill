# H07：按需 WordPress 工具与预算隔离

- 时间：2026-09-08 01:36:27 GMT+8。
- 触发：用户要求继续Harness优化；组合预算回归定位及修复里程碑。
- 工作区：5977 / codex/vercel-delivery-contract-20260907；基线0b3db56（产品953ba65），本阶段未修改浏览器执行器或快照分支。

## 原因与修复

runtime.prepareStep已经正确把activeTools传给ContextManager与AI SDK。问题是ToolSelection对未分组工具默认常驻，新WP工具没有分组，因而无关任务也承受它们的schema成本。旧组合诊断中两个WP schema约22082估计tokens；插件负责人已独立缩小WP传输schema，本修复不重复其业务或schema实现。

ToolSelection增加wordpress组，包含现有10个WP工具和负责人将新增的wpReadSite/wpConfigureSite。普通任务默认不启用；模型通过可见selectTools说明发现并启用，允许与files/skills/browser组合，切走后释放WP schema。提问、交付检查、历史回读仍常驻；原有五个组兼容。复用SDK官方activeTools/toolOrder与工具schema类型，无新依赖/模型循环/持久化schema。未知未分组工具的既有兼容行为保留，因此不声称已解决未来所有连接器的工具体积问题。

## 验证

先写两个反例：旧代码默认暴露12个WP工具；大型WP schema导致无关任务ContextManager.prepare拒绝。基线4项中2失败、2通过。修复后typecheck、lint及工具选择/上下文/原生运行器3文件47项通过（2.97秒）。测试通过SDK官方schema验证wordpress选择，核对选组、退组及核心恢复工具保留，并用合成超大schema确认普通任务预算恢复、显式完整工具集仍触发原预算保护。合成schema不是原WP精确重放，未新增真实模型请求。

选择WP后仍可能超预算；schema体积由插件负责人优化，不调高64000预算或删除工作窗口保护。没有重建用户dist/重载Comet，也不修改执行器冻结组合输入。主区组合验证和实际源码集成待登记。

## 文档与下一步

补充现有Harness模块说明与主项目状态/唯一合并清单H07；架构入口标注工具按需激活，无运行宿主或通信协议变化。先以确切源码增量整合并保留主区tool-selection原有文案，再继续H06交付检查配置/待处理复核问题。两类真实业务失败未解除。

## 首次集成与原生循环补验

源码dbc0bef已于2026-09-08 01:37在主区集成：索引完整树与源提交一致，保留主区tool-selection已有SEO/批注文案，未整包提交179项在途修改。主区typecheck/lint与3文件47项通过。最初命令误写wp-workflows.test.ts，Vitest未匹配该文件，所以这次只算3文件47项；随后按实际wordpress-workflows.test.ts单独补验，不伪称该第一次包含WP用例。5977生产构建通过，未覆盖主区dist或用户Comet。

补充原生AgentRunner→ToolLoopAgent→provider回归：通过文件运行时注入合成只读wpRead工具，首步provider未收到WP工具，模型selectTools选择wordpress/files后才收到wpRead/readFile/checkDeliveries，并恰好执行一次、正常完成、零toolErrors。该文件11项、typecheck/lint通过；模型为MockLanguageModelV4，非真实WP网络或付费模型验收。

最终主区整合基线75340f7：typecheck/lint与工具选择、上下文、原生运行器、交付运行器、WordPress工作流5文件68项通过（2026-09-08 01:40:37，5.32秒）；此前WP单独10项通过。主区仍有其他任务未提交增量，该组合测试不能冒充干净提交或真实业务验收。原生激活测试与生产代码均已整合；H07阶段完成，下一步继续H06交付阻塞，保持原业务失败记录。
