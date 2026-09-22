# 项目 AGENTS.md：将规范接入日常开发

AGENTS.md 是项目约定入口，Skill 是可复用工作方法，playbook/references 是按需详细规范，源码与验收证据说明实际状态。它们共同构成方案；不要把所有正文复制进 AGENTS.md，也不要指望一个链接会自动执行验收。

## 两类项目

本工具仓库的根 AGENTS.md 约束工具/Skill 开发；每个客户网站在自己的源码根建立 AGENTS.md，记录该站真实目录、命令、内容模型、环境及规则。两者不能互相替代。

新站 Discover 阶段使用 [客户模板](../assets/project/AGENTS.md.template) 生成项目文件。它是待适配资产，不是在 assets 中生效的项目指令。已有 AGENTS.md 先读取、保留并合并，不整体覆盖；核对适用的上级与子目录指令，遇到与当前用户要求不一致的旧约定及时修正。

## 生成与维护

1. 查实际源码、package/composer 配置、环境探测和已有项目文档。记录源码根、主题/插件归属、Skill 安装位置、启动与验证命令，未知值明确待核对。
2. 用稳定路径链接 Brief、架构、模型、设计、质量/SEO 与验收真源。独立分发只需 Skill 包和客户文档，不引用本工具仓库才存在的 docs 路径。移动 Skill 后更新引用。
3. 只放全站长期约束和任务路由。确有独立目录规则时再加子目录 AGENTS.md，不在每个目录复制整套规范。WordPress 核心、vendor、缓存不放项目规则来诱导修改上游。
4. 首次交付核对所有路径存在、命令与当前配置一致、事实来源可追溯、无秘密、无误植演示数据。待核对项逐项说明影响，不能把未填模板宣称为完成项目接入。
5. 在目标项目的新 Codex 任务中做只读接入核对：让其说明源码归属、应使用的 Skill、代表页质量要求和实际验证命令，并核对回答与文件一致。这个检查不证明所有后续行为都合规，更不代替网站验收。

`project-init` 当前只写契约，不自动生成 AGENTS.md；上述生成由 Codex 按流程执行。AGENTS.md 模板不是 project.json 的新 schema 字段，不向现有 CLI 塞入未支持参数。

官方 [Codex AGENTS.md 指南](https://developers.openai.com/codex/guides/agents-md) 说明项目指令发现机制。使用标准大小写 AGENTS.md；子目录、override 和本机配置可能影响加载，不能假设仓库里所有文件都会同时读取。改动后以新任务核对加载结果，不宣称运行中任务自动重载。

## 经验归属

- 该客户的品牌、业务字段、命令和路径 → 客户文档/AGENTS.md。
- 跨项目验证有效的建站方法 → 自有 Skill 的对应 reference。
- 实测结果和遗留问题 → 项目验收与过程记录。
- 官方能力更新 → 固定版本接入流程；不直接修改 vendor Skill。

## 新项目落地：复制适配 starter 的实测清单（2026-09-22 首次实测）

用 starter 主题/插件复制适配新客户站（而非从零手写）时，机械重命名之外还有一组必踩的坑。以下为首次实测沉淀：

1. **块命名空间两处分离**：`blocks/*/block.json` 的 `"name"` 与 `blocks.php` 的 `wp_register_script` 句柄（如 `b2b-site-blocks`）是两个独立字符串，且句柄名不含斜杠——正则替换 `b2b-site/` 不会覆盖 `b2b-site-blocks`，必须单独替换，否则编辑器脚本静默失联。
2. **块名正则必须允许连字符**：解析块注释时 `[a-z0-9]+` 匹配不到 `query-title`/`post-title`/`template-part`，会全部漏检（静默假阴性）。用 `[a-z0-9-]+(?:\/[a-z0-9-]+)*`。
3. **业务插件版本钉扎**：插件 profile（config/wordpress-plugins.json）的 `version` 必须与项目插件头部的 Version 一致，否则安装器拒绝激活。新项目应在**项目内**放自己的 profile（版本与头部对齐），不改工具仓库配置。
4. **installRequiredPlugins 的 projectPlugin 参数**：profile 含 `source:"project"` 插件时必须传 `projectPlugin`，否则安装器按 `undefined` 路径拷贝崩溃。
5. **WP-CLI 细节**：`wp term create` 的父级参数是 `--parent=<id>`（无 `--by`）；`wp post list --name=X --field=ID` 返回纯 ID 文本而非 JSON（不要 JSON.parse）；`wp post create --porcelain` 偶发返回 `0`——创建后必须用 `post list --name` 复读确认，不要信任 porcelain 输出；async 回调（Promise.all map）里没有 `continue`，用 `return`。
6. **块主题首页**：`show_on_front` 默认 latest posts 时首页渲染 `home.html`；`front-page.html` 仅在静态首页模式下接管。空壳 front-page.html（只有 header/footer/post-content）会渲染成只有页脚的首页——首页模板必须自带完整内容，且至少含一个 h1。
7. **审计检测器先自校准**：对“属性引号风格（单/双）、嵌套结构、懒加载属性”做检测前，先在已知正确的真实页面上校准，否则单引号 label、嵌套标题这类误报会把注意力带偏。
8. **docker cp 目录嵌套**：目标目录已存在时 `docker cp dir container:/dst` 会把 dir 塞进 dst 内部（dst/dir），同步永远不生效且无报错。同步脚本用 `dir/.` 后缀复制内容，并定期核对容器内文件字节数与本地一致。
9. **动态块 kind 提取禁用偏移量硬编码**：渲染回调里 `substr($block->name, 9)` 这类按旧命名空间长度写死的偏移，在命名空间改名后全部失配且渲染为空（无报错的静默故障）。用 `explode('/', $block->name)[1]` 取尾段。
10. **语义重命名必须覆盖调用点**：函数定义改名（如 product_grid→part_grid）时用全仓 grep 核对调用点；500 fatal 直接看 debug.log 定位（新环境先开 WP_DEBUG_LOG）。
11. **本地通知链前置常量**：SMTP 捕获 MU 插件依赖 `NEW_SITE_REFERENCE_LAB` 常量，compose 缺该 define 时 wp_mail 静默走 mail() 失败且无报错——本地询盘验收前先发一封探针邮件核对捕获通道。
12. **Fluent Forms 提交数据在 response JSON**：询盘上下文字段（如 part_id）存于 submissions.response 与 submission_meta.value，核对用 response/`value` 列，不是 meta_value。

主题/插件的功能性适配（CPT 语义、ACF 字段组、文案语气、设计 token）按 Brief 正常执行，不属于本清单。
