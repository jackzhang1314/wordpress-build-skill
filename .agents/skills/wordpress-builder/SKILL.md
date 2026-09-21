---
name: wordpress-builder
description: 编排官方 WordPress 专业 Skill 和项目工具，从干净环境新建 ACF 驱动的企业网站，并维护本方案创建的网站。用于新站规划、主题与业务插件开发、内容录入、验收和发布；暂不接管旧主题或 Elementor 等既有编辑器站点。
---

# WordPress 新站总编排

用当前 Codex 完成编排。官方专业模块承担具体工作流，项目工具承担内容写入与状态记录。先读 [能力接入与交接](references/orchestration.md)，只加载当前任务所需专业模块，不一次读取全部 Skill。

## 新环境依赖

完整仓库按根 AGENTS.md 执行 harness:doctor / harness:setup；Node 缺失时先按实际系统配置官方 Node.js 22+。仅安装当前任务需要的工具，避免将全部专业 Skill 的可选依赖都变成必装项。独立 Skill 包不包含仓库 Docker 启动器，按 references/runtime.md 和专业模块前置条件核对，不能调用不存在的仓库脚本。Hostinger 初始化脚本随 Skill 提供，见下文。

## 范围与入口

- 项目 `AGENTS.md` 是日常开发入口。新站 Discover 按 [项目指令规范](references/project-instructions.md) 建立或合并客户源码根的 AGENTS.md，记录真实目录、环境、命令及 Skill/质量规范路由；不把本工具仓库约定直接复制给客户。

- 新站从可控制的干净 WordPress 环境开始，ACF 为本方案要求。支持后续修改和升级本方案创建的站点；旧站接管、第三方 builder 迁移不在当前范围。
- 新站必须有源码与运行环境控制能力。只有 REST 凭据不能完成主题/插件部署，准确指出缺少的能力，不擅自把其他网站清空为“新站”。
- `wp` 表示 `node "<本 Skill 绝对目录>/scripts/wp.mjs"`。完整接口见 [runtime.md](references/runtime.md)。运行文件缺失时，在本工具仓库执行 `npm ci && npm run build`；独立分发包缺文件时报告包不完整。
- `wp capabilities` 校验固定版本模块。`project-init` 保存新站契约，`project-inspect` 实际调用官方本地项目识别，`project-status` 恢复进度。下载、校验通过、工具可用、工作验收通过是不同状态。

## 按目标选择流程

1. **规划新站**：读取企业事实与已有授权，明确内容、语言、编辑方式、询盘入口和目标环境。先按 [搜索质量规划](references/search-quality.md) 确定买家任务、页面独立价值和事实来源，再看 [architecture.md](references/architecture.md)，默认采用原生区块主题，组合 CPT/ACF、原生模板和必要 PHP 动态块；经典 PHP 基线或特殊整页 PHP 按明确场景保留，再看 [site-workflow.md](references/site-workflow.md)。代表页区块骨架已随包提供，但完整客户站仍需按 Brief 实施；适用条件与可运行参考见 [reference-site.md](references/reference-site.md)，不把默认选择说成普适最优。
2. **执行专业工作**：完整 B2B 外贸站先读 [逐页实施策略](references/b2b-pages.md)，明确每页的买家任务、数据来源与实现方式。按能力表选择模块，交付目标、文件/数据范围、实际版本和前置成果。专业模块使用所需工具完成工作；主编排检查结果与跨模块业务链。
3. **维护本方案建成的站点**：读取已有契约和远端状态，只完成本次变更及相关验证；不要为改一个字段重走整站流程。主题增量更新前按 [release.md](references/release.md) 的模板覆盖预检（本地 `starter:update-preflight` 或远端 `hostinger:remote-preflight`，均只读）核对冲突后再处置。已完成发布的迭代保留原任务，使用独立迭代目录与新的基线。
4. **审计/研究**：只收集证据和输出结论，除非任务同时授权修改。不能把研究计划写成通过记录。

## 工作分工

- CPT、分类、业务字段和升级逻辑归业务插件；模板与展示配置归主题。ACF/正文/原生主图不重复保存同一数据。见 [content.md](references/content.md)。
- 主题实现读 [theme-code.md](references/theme-code.md)：默认加载官方区块主题流程，按需组合 Patterns、动态块与插件模块。一个产物明确所有者，允许模块协作，不让多个流程相互覆盖同一模板。PHP 动态渲染不要求改用经典主题。
- 搜索质量从 Discover 开始执行 [search-quality.md](references/search-quality.md)，不等页面完成才补关键词或插件；公开页面工程读取 [SEO 规范](references/seo.md)：服务端 HTML、真实链接、分页/筛选、canonical、结构化数据与性能；不要求静态导出，也不承诺收录。
- 设计与素材按 [design.md](references/design.md)、[media.md](references/media.md) 执行。HTML 预览按需要使用，真实 WordPress 预览是验收对象。
- 插件安装与配置先读 [插件基线](references/plugins.md)，使用随包机器清单明确必装、按环境配置和仅测试依赖；安装、激活、配置、业务验收分别记录。
- 本方案新站统一使用 Rank Math Free 作为唯一 SEO 输出负责人，按 [SEO 规范](references/seo.md) 初始化并验收，不做历史 SEO 数据/旧插件兼容。表单按项目需求选定；ACF PRO 专属能力必须先核对授权。

## 写入、交接与交付

- 实际执行接口、权限、字段 schema 先确认，再写入。保留无关内容，不编造企业认证、客户或产品参数。
- 内容写入沿用 plan → apply → readback。未知结果先协调日志与远端状态，不换一个工具重复写入。官方工具执行的写操作也要保存回执；项目 Journal 不会自动拦截所有外部工具。
- 已有授权持续有效。无关的上游安装、遥测、通知或发布动作不因读取 Skill 自动获得授权。
- 专业模块返回变更、检查结果、证据和缺口。阶段 `project-record` 只记录有文件证据的声明；不能替代真实验收或作为发布授权。
- 进入 Hostinger 部署任务时先执行 `node "<本 Skill 绝对目录>/scripts/hostinger-setup.mjs"` 检查工具；缺少 CLI 且已有部署/配置授权时加 `--install`，再用 `--connect` 验证只读账户访问。首次官方浏览器登录由用户完成；不索取聊天 Token，不因 CLI 可用就跳过目标/备份/发布验收。只加载 Skill 或做本地设计时不主动安装主机工具，MCP 可选。无 Homebrew/Windows 的官方二进制路径按 hostinger reference 执行，不能把提示当安装成功。
- 当前唯一公网部署目标为 Hostinger Managed WordPress，先读 [Hostinger 部署规范](references/hostinger.md)，再按需使用官方 wp-wpcli-and-ops。CLI/API 管托管资源，SSH/WP-CLI 管文件与 WordPress；MCP 可选，不新增必装 AI 插件。当前参考站已验证 CLI TUS + 一次性 cron/WP-CLI 的首次部署；通用远程执行器和 SSH 路径尚未验收，不把本地成功或 build --publish 当成主机部署成功。
- 发布前读 [release.md](references/release.md)。验证后台修改字段/图片/正文后的回显、菜单、链接、询盘、移动端和恢复；代码检查或 API 成功不足以证明整站完成。
- 整站验证或修复后，按 [验证与经验沉淀](references/verification.md) 核对询盘、编辑和恢复证据；已验证的通用做法回写相应 reference，版本特例保留边界。
- 交付区分已完成、部分验证和未覆盖。保存实际核心/PHP/插件版本、源码状态与证据；实验站启动参数不能代替实测版本。
