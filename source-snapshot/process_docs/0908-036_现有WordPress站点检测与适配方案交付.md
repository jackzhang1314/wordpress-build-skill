# 现有WordPress站点检测与适配方案交付

时间：2026-09-08T02:19:53.427778+08:00；触发：只读检测与适配模块实现、验证和构建完成。

新增wordpress-assessment.ts，通过账号capabilities、内容类型capabilities与有界OPTIONS schema生成逐类型行动方案。复用wpReadDesignProfile，不新增工具，类型参数最多8项；未指定时页/文章优先加最多6种非内部类型。页schema请求复用；字段摘要每组最多12项，模板枚举最多50，完整响应与方案持久化至证据。自有主题/配套插件不作为检测或普通建页前提。

区分账号声明创建/发布权限、schema可读、现有工具能否执行、前端是否验收；OPTIONS不当权限凭据，缺cap保持unknown。兼容命名空间限定wp/v2，未适配不发schema请求，记录not_requested。现有ACF自定义类型可走既有导入；无写工具适配不承诺建页；只读字段不当可写字段。模板无枚举则省略template，沿用默认/已有模板。建页Skill先读adaptation、生成适配计划，再选择草稿流程。

验证：最终types/lint、7文件92项和build通过（02:18开始的顺序命令）；含专门适配测试、原WordPress写入/确认、技能和Harness预算回归。官方Playground WordPress6.9.7未安装配套插件，读取真实账号/类型/页文章OPTIONS后交给同一评估函数，两类型均ready_to_attempt_draft，前端仍needs_preview。结果docs/research/browser-wordpress-site-20260908/assessment-real-wordpress.json；可复现PHP取证脚本wordpress-site/tests/read-assessment.php。此项是实际REST数据驱动的评估，不是客户账号HTTPS连接器端到端或真实模型建站。

研究已读取官方Users文档并核对能力字段。Types文档本轮工具读取失败，没有以抓取失败当作API不支持；使用实际WordPress返回验证类型/权限结构。计划在docs/research/browser-wordpress-site-20260908/现有站点适配实施方案.md。

主区/目标codex/agent-workspace-sandbox；起点002e649、最终核对4fc1e7b，均为并行任务HEAD，本功能未提交，无交付SHA。源码接入现有工具与Skill，dist已构建，未重载用户扩展。用户真实站点四页草稿与浏览器完整验收仍是后续阶段。没有捆绑主题、切换主题或写站点。

文档同步：WordPress模块、架构、项目状态与合并清单。旧主题方案撤回状态保持。
