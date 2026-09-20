---
name: wordpress-block-pages
description: 根据企业资料构建标准WordPress外贸站，管理可编辑的产品、案例和页面。
---

# WordPress 原生区块建页

整站建设或初始化时先读取 references/site-setup.md；单页任务读取 references/wordpress-api.md。先selectTools启用wordpress、files、skills，预览时加入browser。凭据在设置 → 连接器 → WordPress统一配置，Skill不存密码。

1. 读取企业资料，保留参数来源，不编造认证或案例；明确页面用途、目标语言和询盘入口。
2. wpRead site 检测连接，wpReadDesignProfile读取当前主题、注册区块、模板、账号权限与内容模型，先根据adaptation生成适配方案；未知/缺权限/未适配项明确列出，再选择可尝试的草稿流程。已有站点沿用主题；unknown不是不支持。wpRead list（type=page）查重。更新先 wpRead content，读取证据原文取得 modified_gmt；不能覆盖用户已改内容。
3. 先保存页面方案、文案和 blocks JSON 到任务文件。支持 heading、paragraph、image、button、section、form、columns、table、faq。从 assets/patterns.json 按需读取首屏、优势、参数、应用、FAQ、询盘六种组合，替换全部占位文字再使用。页面标题由 title 提供；正文从 H2 开始。section与columns最多嵌套3层；每组2–4列，宽度省略均分或全部指定且合计100。section.style支持六位HEX的color/background、0–160的padding像素和0–80的radius像素，优先参考真实主题。参数表每行同列数。不支持任意HTML、脚本或第三方编辑器。
4. 图片先 wpUploadMedia；以真实媒体ID构建 image。表单用现有WPForms ID，必要时遵循表单Skill流程创建。按钮仅使用已核实链接。
5. 先wpCompilePage保存编译计划、核验媒体和区块注册；这不是视觉预览。随后使用同一blocks调用wpWriteContent type=page、blocks、status=draft；更新带id与expectedModified。template可选，只能使用站点schema实际声明的值，省略则沿用默认或已有模板。明确要求上线时使用publish。检查所有Matches回执，不一致列为未完成。
6. 在已登录用户浏览器打开WordPress草稿预览，检查桌面/窄屏标题、图片、按钮、表单和原生区块编辑器是否报无效块。未访问不能声称视觉验收通过。交付实际ID、状态、URL、证据与待验项。

交付前核验实际回执和任务文件。网络未知结果不自动重发；插件版本/权限不足明确报告，不把计划写成已完成。
