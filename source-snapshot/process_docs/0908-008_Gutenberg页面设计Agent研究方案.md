# Gutenberg 页面设计Agent研究方案

时间：2026-09-08T00:26:03.143838+08:00（Asia/Shanghai）。触发：下一阶段架构与Skill设计确定。

主要工作：核对现有连接器/区块编译/写工具和Skill，识别布局、样式、模板、主题设计信息和局部更新缺口；研究WordPress官方区块、REST、Site Editor、Global Styles及3项官方开源Skill。决定复用共享连接器和现有Agent，升级建页Skill，以主题适配、受控区块与Pattern为主，先页面后全站。

文件：docs/research/gutenberg-page-agent-20260908/方案.md。新增方案未实施，不改运行时或安装上游Skill。

验证：源码与官方来源交叉核对；Global Styles手册直链失败，改用官方控制器文档。未运行代码测试、未访问用户站点，不沿用上一轮测试作为新能力验收。

工作区：codex/agent-workspace-sandbox，核对HEAD057d493；文档未提交，无新交付SHA，目标同主分支。本轮是研究交付，布局/样式升级待实施。下一步按方案阶段1扩展设计档案、区块样式和Pattern。
