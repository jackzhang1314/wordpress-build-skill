# WordPress 浏览器工作流约定

这是本产品原创场景流程，运行于浏览器Agent，不需要Codex CLI、Node或PHP执行。WordPress凭据统一保存在本地连接器；API只发送至配置站点。先wpRead site；完整只读结果保存在返回的证据文件，使用readFile实际读取。

先selectTools启用wordpress工具组，可同时选择files/skills/browser。

工具：wpPlanNavigation/wpApplyNavigation（当前主题模板部件中的简单导航精确替换，先生成固定版本计划再应用；复杂子菜单/绑定不适配）；wpReadSite、wpConfigureSite（普通站点显式source=native使用官方有限设置，source=companion兼容配套插件，两种revision不可混用）；wpReadDesignProfile（主题/区块/模板读取）、wpCompilePage（只读编译计划）；wpRead（site/content/list/schema/media/terms/abilities/ability/navigation/templates/templateParts）；wpWriteContent；wpUploadMedia；wpReadAbility；wpWriteAbility；wpPreviewProducts；wpImportProducts；wpWorkflowStatus。写工具进入产品统一确认界面。批量任务会分批确认；未知POST不重发，已知ID回读失败可恢复回读。同任务相同操作复用回执。

ACF使用现有CPT和REST字段schema。WPForms使用官方Abilities REST，不需要为浏览器另启MCP进程；WordPress6.9+、WPForms1.10.2+，WPForms → Tools → AI MCP → Enable MCP Write Access。只读schema与实际权限为准；通知与第三方集成不在安全设置接口内。Rank Math能力以站点公开声明为准，不保证所有版本/套餐开放。

文章和页面默认草稿，主动发布要有用户明确目标。草稿URL可能只能登录查看。媒体回执、字段回读、浏览器视觉检查、真实邮件送达是不同证据，不可混同。页面仅支持适配的原生核心区块，不支持全站主题模板编辑。

官方参考（研究日期2026-09-08）：
- https://developer.wordpress.org/rest-api/reference/pages/
- https://developer.wordpress.org/rest-api/reference/media/
- https://developer.wordpress.org/block-editor/getting-started/fundamentals/markup-representation-block/
- https://www.advancedcustomfields.com/resources/wp-rest-api-integration/
- https://wpforms.com/developers/wpforms-rest-api/
- https://rankmath.com/kb/mcp-tools/
- https://developer.wordpress.org/apis/abilities-api/rest-api-endpoints/
