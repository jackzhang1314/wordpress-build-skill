# Codex WordPress 建站实施与验收

2026-09-08。用户新目标：用 Codex 结合交接方案摸索完整自动建站，并开发对应 Skill。此目标更新原先“不默认依赖 Codex”的宿主约束；原始快照保持不变。

## 交付范围

Codex 读取企业资料、规划页面与设计、调用独立执行工具、检查真实页面、完成授权范围内的发布和站点配置。保留现有主题，产出可继续编辑的原生区块。不能以静态 HTML 演示或 REST 成功替代 WordPress 验收。

| 能力 | 证明完成所需证据 | 当前状态 |
| --- | --- | --- |
| Codex Skill 与独立工具 | 本项目构建、可安装包、真实 Codex 调用 | 初版已运行；独立新实例评测待做 |
| 站点发现与认证 | 真实 WordPress REST、主题/权限/区块检测 | 本机真实应用密码通过；新工具HTTPS待验 |
| 企业资料到四页 | 资料来源、页面计划、真实草稿及原生编辑器有效性 | 虚构资料四页真实通过；真实企业资料待接 |
| 媒体与视觉布局 | 真实上传回执、桌面/手机截图、图片/链接检查 | PNG上传/嵌入与页面预览通过；PDF/特色图待验或实现 |
| 发布、首页、导航 | 状态回读、首页设置、实际菜单及手机交互 | 当前区块主题四页、页眉页脚、匿名及手机菜单通过 |
| 中断恢复与改稿 | 断点继续、未知结果不重发、保留人工修改 | 20项测试及真实重跑/改稿通过，含批量第二条回读失败恢复；未知结果核对后恢复接口待做 |
| 产品 CMS / ACF / 导入 | 实际字段 schema、动态模板展示、稳定键导入 | CPT/ACF文本字段、原生绑定、CSV草稿导入实测通过；产品模板设计及复杂字段待完成 |
| 询盘与 SEO | 实际插件能力、询盘送达、页面 SEO 与抓取检查 | 待移植和验证 |
| 整套自主任务 | Codex 从企业资料完成以上适用能力，逐项证据 | 未完成 |

## 实现选择

1. Codex 自身承担推理与任务编排，不再构建另一套浏览器扩展或模型循环。
2. Node.js / TypeScript CLI 提供稳定的 JSON 输入输出；构建为 Skill 内自包含执行文件。连接凭据只从环境变量读取，运行目录仅保存非凭据任务状态和回执。
3. 原生区块、有限精确导航沿用已有已测试逻辑，在新边界重新测试。写入用持久化操作记录与完整内容指纹保护；状态变更单独执行。
4. 隔离 Playground 使用真实 WordPress/PHP/SQLite，测试通过后再适配已授权的客户站点。HTTP 明确仅供回环测试；实际站点使用 HTTPS 应用密码。
5. 使用命令输出与本地任务文件作为恢复依据，不依赖不断重读 Skill；每阶段指出下一动作。

## 已核对的官方资料

- [页面接口](https://developer.wordpress.org/rest-api/reference/pages/)：更新参数可单独提供 status。
- [认证](https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/)：应用密码 Basic Auth 通过 HTTPS 调用。
- [REST 发现](https://developer.wordpress.org/rest-api/using-the-rest-api/discovery/)：以实际 REST 根和路由信息为准，兼容子目录和 rest_route。
- [Playground CLI](https://wordpress.github.io/wordpress-playground/developers/local-development/wp-playground-cli/)：server 支持版本与目录挂载；环境和证据需持久保存。

核对日期 2026-09-08。厂商接口存在只证明可研究，不证明本实现已支持。域名购买、主机账单、任意主题和付费插件授权尚不属于可承诺的自动执行能力。
