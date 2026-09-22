# 能力接入与模块交接

本 Skill 是新站总编排。`capabilities.json` 是随包的模块清单与文件哈希；`vendor/wordpress/` 为未修改的官方来源，保留 GPL-2.0-or-later 声明。源码固定于 WordPress/agent-skills 的 d87ee6916e740c7960b6959220c0481a41b320c7。官方默认 WP 7.0+，目标版本不同必须查对应接口，不因文档默认值自动升级客户环境。

## 已随包接入的专业工作流

路径相对本 Skill 根。按任务读取对应 SKILL.md 与它需要的引用，不启动递归总路由。

| 专业工作 | 入口 | 前提 |
| --- | --- | --- |
| 本地项目识别 | `vendor/wordpress/skills/wp-project-triage/SKILL.md` | Node；project-inspect 已包装只读检测 |
| 业务插件 | `vendor/wordpress/skills/wp-plugin-development/SKILL.md` | 源码/PHP环境 |
| REST/schema | `vendor/wordpress/skills/wp-rest-api/SKILL.md` | 实际认证与schema；代码修改需源码权限 |
| 环境维护 | `vendor/wordpress/skills/wp-wpcli-and-ops/SKILL.md` | 目标环境真实可用的 WP-CLI |
| PHP 类型分析 | `vendor/wordpress/skills/wp-phpstan/SKILL.md` | PHP/Composer/PHPStan，按项目配置 |
| 快速验证环境 | `vendor/wordpress/skills/wp-playground/SKILL.md` | 本机实际 Playground CLI |
| 声明式环境 | `vendor/wordpress/skills/blueprint/SKILL.md` | 验证 blueprint schema 与实际运行版本 |
| 区块主题 | `vendor/wordpress/skills/wp-block-themes/SKILL.md` | 默认新站主题组织；维护经典基线时按需加载 |
| 自定义块 | `vendor/wordpress/skills/wp-block-development/SKILL.md` | 需要独立数据、渲染或交互能力的模块；可与区块主题/ACF 同时使用 |
| Patterns | `vendor/wordpress/skills/wp-patterns/SKILL.md` | 所选主题与编辑约束 |

上游文本里的 `skills/<name>/...` 以 `vendor/wordpress/` 为资源根；脚本文件使用绝对路径，源码扫描脚本的 cwd 则为项目 sourceRoot。不要把 vendor 自身当成待建站源码扫描。随包不包含上游总 router，主入口由本 Skill 负责。

本地 triage 已由 project-inspect 自动执行；参考站脚本另执行官方插件扫描，并按官方插件/Blueprint 工作流完成开发验证。其他专业工作流由 Codex 读取后用实际工具执行。文件完整性不证明 PHPStan、WP-CLI 或 Playground 已安装。工具不存在时补齐任务需要的依赖或如实报告，不编造执行记录。Studio/Automattic 和 Respira 暂未接入启用包，也没有旧站迁移入口。

## 新站契约与交接

`project-init` 的 schema 在 runtime.md。项目契约明确 new-site、源码根、目标主题/环境、目标版本和 Brief；目标版本不是实测版本，discover 阶段另存真实运行证据。契约也不证明远端干净：开始写入前检查 WordPress 默认内容、已激活主题/插件及业务数据，不能删除不明内容。

每个专业任务给出：目标、站点身份、实际版本、源码/数据范围、前置成果、既有授权和完成条件。返回：修改文件/对象、实际工具操作、检查结果、证据路径、未覆盖项与恢复方式。

整站里程碑是 discover → model → theme → content → verify → release。这是交付依赖，不限制日常编辑顺序。`project-record` 记录检查和文件哈希，不能判断模型陈述是否属实；总编排仍需读证据。已记录后出现文件变动会显示 stale，下游不继续视为可用。后续阶段已留下记录时，不覆盖前置阶段，应保留本轮并新开迭代目录。

## 集成更新

不要直接编辑 vendor。更新来源必须重新审查差异、固定版本、保留许可、重新生成能力清单并验证行为。更改模块集后旧任务不会静默接续新的 triage；新版本用新任务验证。总入口不自动安装全部研究库、不创建新模型 SDK、不默认启用多个 Agent。

## 识别结果的边界

官方检测脚本输出是启发式线索。组合目录可能返回 unknown；带 theme.json 的经典主题可能被归类为 block theme；插件头解析器也可能漏识别标准 PHPDoc 中带星号的字段。保留原报告，进一步核对实际主题模板、WordPress 激活结果、`wp_is_block_theme()` 和 REST 类型。不要修改 vendor 或把检测器成功退出等同于正确识别。
