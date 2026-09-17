# WordPress真实模型首轮问题修复与复测

时间：2026-09-08 03:36:04 GMT+8
触发：真实测试发现问题后的重要修改与验证。

首轮39步暂停，未发布；模型配置已复用，无需用户填写。wpRead内容响应改为提供真实ID/状态/修改时间与最多6000字符正文，rawComplete区分完整、长文和缺失；完整证据保留。Skill要求逐页持久化进度，续跑只处理未完成项，避免为预览反复进入编辑器保存。

关键文件：src/agent/connections/wordpress-workflows.ts、src/agent/skills/builtin/wordpress/site-setup.md、tests/wordpress-workflows.test.ts。types/lint、3文件37项通过，独立candidate build通过。真实HTTPS读取page7返回draft/rawComplete=true/607字符/FIXTURE-1，已验证新读取路径。

主区/目标codex/agent-workspace-sandbox，HEAD 3e4f1666784dfa6cb9bc8784b2d37dbd4dea7161外未提交，无交付SHA。加载仅隔离Chrome；普通热重载后开发页不可访问，重启同一隔离profile恢复，配置与草稿保留。不动dist。指纹见docs/research/browser-wordpress-site-20260908/e2e/resume-build.json。复测任务66853be1-5f28-4943-914f-2b9363116261运行中，不能将工具单测/读取成功宣称完整自主建站。
