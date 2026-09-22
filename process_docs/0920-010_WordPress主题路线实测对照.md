# WordPress 主题路线实测对照

时间：2026-09-20T05:53:56+08:00，Asia/Shanghai（UTC+08:00）。

触发：用户要求实际测试哪种 WordPress AI 建站方案更合适，允许建立 worktree。

主要工作：创建 codex/wordpress-theme-comparison 分支及独立 worktree，记录复制的未提交基线；Docker 中建立 PHP 混合与原生区块两个站点，克隆初始业务数据，在两边均提供两套产品与分类布局。隔离实例使用 9480/9481、本地 Mailpit 9482，原演示站未替换。

验证结果：真实后台产品模板选择/保存/刷新、ACF 型号编辑与前台回显；REST 新建产品与发布；模板缺失回退；分类布局、筛选、分页；两边询盘入库与 SMTP 捕获；16 份文件共 279 个块有效；12 张响应式截图无溢出；区块原生导航打开/Esc 关闭/焦点恢复；区块首页编辑器改标题、保存、前台回显；模板数据库覆盖与源码冲突及显式合并；SQL 导出到独立数据库后模板覆盖/产品选择/分类布局/字段回读成功。类型检查、项目及实验脚本 lint、Skill quick_validate 通过。最终字段、模板选择和首页测试标记已核对恢复，无残留测试模板覆盖。

发现并修复：双 H1、重复表单、CPT 模板选择器展示无关模板、经典 CSS 隐藏原生移动导航。初次字段回显断言失败，调整为唯一标记/保存回读/新导航后通过，未推断未经证明的缓存根因。启动脚本最初的 shell PHP 检查失败改为容器内 token 解析；初次截图等待懒加载失败改为仅截图时 eager 加载，不能将该截图流程当作性能测试。

决策：原生区块适合下一阶段主线，理由为原生结构编辑和模板复用；PHP 仍为当前已运行基线。没有证据说明区块更快或视觉已达标，不直接切换默认交付骨架。

关键文件：docs/acceptance/theme-comparison/README.md（唯一完整实测报告及同目录证据）、docs/TARGET-ARCHITECTURE.md、docs/ARCHITECTURE.md；Skill references/theme-code.md 沉淀实际验证约束，references/design.md 消除与官方 wp-patterns 的自定义类规则冲突；vendor 不改动。实验实现与复验说明在 worktree 的 experiments/theme-comparison/README.md，实验文件哈希见证据目录 experiment-files.json。没有提交或整体暂存现有工作区修改。

边界与下一步：B 是代表性原型，尚未完成完整 Pattern 库、全部 B2B 页面、Site Editor 人工模板设计流程、后台分类布局 UI 操作、编辑器样式一致性、全局样式/导航覆盖恢复、新服务器全站恢复及生产性能/视觉验收。SQL 恢复借用了已有主题/插件/媒体，不等于从零部署；邮件仅到本地捕获。补齐这些后再统一迁移默认 Skill、骨架和用户指南。实例保留运行供比较；停止时只操作实验私有指针对应的 Compose 项目。
