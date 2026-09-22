# WordPress 上游 Skill 采集与初审

时间：2026-09-19 23:50:23 Asia/Shanghai（UTC+08:00）。

触发：用户要求将发现的 WordPress 官方及相关 Skill 下载下来，研究对当前架构与 Skill 的参考意义。

成果：下载 WordPress/agent-skills、WordPress/marketing、两套 Automattic 建站仓库、Respira、soderlind、安全技能及第三方上游派生包共 8 个仓库快照；另采集 Gutenberg 的 .agents、根说明/许可与直接引用文档。全部固定完整 commit，保留来源、采集时间和 SHA-256。共 326 个 SKILL.md、149 种不同正文、131 个不同 name；数量含重复包装与派生版本，不当作独立能力计数。

研究真源：`research/wordpress-skills/README.md`。索引在 INDEX.md、catalog.json、catalog.csv，来源在 manifest.json，各版本旁 files.json 保存文件哈希。重点检查官方路由/插件/REST/运维，Automattic 运行分工，Respira CPT/迁移，第三方权限约束及 Gutenberg 测试/兼容性；其他条目已索引，未逐一做行为测试。

主要结论：复用按需专业知识和环境工具，保留项目建站编排；不整套照搬强制区块主题、专有 MCP、特定认证场景的 nonce/权限假设和重复确认流程。缺少明确许可的项目先保留研究，不宣称已可统一再分发。

验证：1068 个下载源文件 SHA-256 全部通过；研究 README/索引本地链接通过。未执行上游脚本、安装依赖、启用技能或 MCP；没有修改网站、提交或推送。Gutenberg 仅为部分源码快照，直接引用已补齐，递归依赖的完整包源码未下载。

下一步：按照研究库采用矩阵，先做站点契约、任务路由和版本验证，再开展 PHP/区块同 Brief 对照。正式采用的模块须经过适配与行为验证；研究文件内指令仅作为分析对象。
