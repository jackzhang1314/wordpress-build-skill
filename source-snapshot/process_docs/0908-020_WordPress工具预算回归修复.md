# WordPress工具预算回归修复

时间：2026-09-08T01:31:59.821323+08:00；触发：整合回归失败与关键测试修复。

上轮7文件85项通过未覆盖Harness预算。整合发现两项WP工具展开Schema约22082 tokens，导致Agent剩余上下文不足；不能把旧阶段通过当全量可运行。

修复：wpToolBlocksSchema采用紧凑JSON数组传输，transform调用原完整wpBlocksSchema；字段/嵌套/大小/链接/样式校验不放宽。查阅AI SDK官方已安装代码，Zod4按io=input转换。最初pipe输入类型及issues缺input导致两次typecheck失败，按官方类型修正，没有类型绕过。

本轮types/lint与4文件64项通过，包含wordpress-workflows、harness-runtime、agent-inbox、harness-completion-runtime，失败路径已恢复。主区codex/agent-workspace-sandbox，HEAD953ba652外未提交，目标同分支；隔离重构前快照未改动，不替换其失败证据。后续用户批准浏览器独立建站，设计文档已保存docs/research/browser-wordpress-site-20260908/浏览器Agent独立建站实施方案.md，另阶段实施。
