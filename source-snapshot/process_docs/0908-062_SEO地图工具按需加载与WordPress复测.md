# SEO地图工具按需加载与WordPress复测

时间：2026-09-08 03:44:00 GMT+8
触发：真实模型复测失败后的工具选择适配。

第二轮14步暂停，无发布。ledger记录11步内3次上下文压缩；此前SEO/Maps工具未在ToolSelection分组，导致WordPress步骤仍携带无关schema。现新增seo/maps两组，连接器操作按需可选，核心恢复/交付仍常驻。与Vercel Harness负责人确认不重叠，其本轮只改delivery。

关键文件：src/agent/harness/tool-selection.ts、tests/harness-tool-selection.test.ts、tests/seo-approval.test.ts。首次5个审批测试失败因为旧夹具未选择seo组；已更新夹具先选组，保留拒绝后零外部访问断言。最终types/lint、5文件53项通过，独立候选构建通过。原WordPress短回执和Skill续建指引保留。

主区/目标codex/agent-workspace-sandbox，未提交/无交付SHA。只加载隔离Chrome output/builds/wp-tools-0908副本，未动dist。第三轮真实任务c4183250-47a0-40f4-a8d9-f5738a1c75f8已启动，完整建站仍待结果。两轮证据和本次指纹位于docs/research/browser-wordpress-site-20260908/e2e/。

## 实际加载校正
第三轮10步后暂停：工具回执仍显示旧常驻列表，不能作为分组修复验收。磁盘候选已含seo/maps分组，但同名后台执行边界不明确。隔离副本将后台入口改名background-wp-tools.js、测试版本0.5.14.1，重启同一profile后实际worker URL已匹配新入口。原产品manifest未修改，用户dist未动。完整自主建站尚未通过。

## 本轮最终状态

模型配置已复用，真实模型已运行；三轮分别在39/14/10步暂停，未完成发布、首页、导航。已完成内容回执、Skill进度指引和连接器按需分组修复；types/lint/53项/build通过，短内容读取真实HTTPS通过。第三轮工具回执仍显示旧组，与磁盘候选不一致，实际运行版本尚不能按新组验收。换独立测试后台入口后worker URL已匹配，但原生侧栏CDP控制调用超时，新任务未建立；原因尚未确认，不直接归因为产品侧栏代码。测试Chrome已关闭，配置、草稿、任务和证据保留。下一步先恢复并核对测试侧栏控制与实际工具清单，再继续真实发布验收。无需用户重填API。详见current-result.json。
