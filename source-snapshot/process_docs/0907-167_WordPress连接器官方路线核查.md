# WordPress 连接器官方路线与现有实现核查

时间：2026-09-07 22:04:39 GMT+8
触发：完成连接器研究与相关回归验证。

## 结论与架构

采用 WordPress 原生 REST API + Application Password。连接器集中保存一个站点的 HTTPS URL、用户名、应用密码；Skill 编排文章生成和发布，工具承担认证与网络请求，SDK 提供写操作审批，文件系统保存前后证据。凭据不进入 Skill 或聊天。无需为标准文章发布额外安装 MCP 插件或运行 Node/PHP/WP-CLI。

官方路线对照：

| 路线 | 适配结论 |
| --- | --- |
| [原生 REST API](https://developer.wordpress.org/rest-api/reference/posts/) | 首选；posts 接口支持创建和更新文章，官方还有媒体、分类标签等接口供后续扩展 |
| [Application Password](https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/) | WordPress 5.6 起提供，通过 HTTPS 用于外部客户端；实际权限继承用户，连接测试通过不等于有发布权限 |
| [WordPress/agent-skills](https://github.com/WordPress/agent-skills/blob/trunk/skills/wp-rest-api/SKILL.md) | 主要是站点/插件开发知识；当前 wp-rest-api 声明文件系统、bash、Node，部分流程依赖 WP-CLI，不能直接当浏览器发布工具安装 |
| [WordPress/mcp-adapter](https://github.com/WordPress/mcp-adapter) | 将 Abilities API 暴露给 MCP 客户端；适合未来接入站点自定义能力，需站点端与客户端适配，本次不引入 |
| [旧 Automattic/wordpress-mcp](https://github.com/Automattic/wordpress-mcp) | 上游已引导转向 mcp-adapter，不选择旧仓库作为新增依赖 |
| [WordPress.com API](https://developer.wordpress.com/docs/api/getting-started/) | 托管平台公共 API 的 OAuth 路线单独适配；当前实现不能据此声称支持所有 WordPress.com 站点 |

## 当前实际实现

- 设置 → 连接器 → WordPress：站点 URL、用户名、应用密码；保存、测试、删除配置。
- wordpress.ts：可信扩展存储，固定站点和接口白名单，凭据变化检查，拒绝重定向。
- publishing-tools.ts：readSeoPost / writeSeoPost，标题和 HTML 正文，draft/publish；更新需最近读取的修改时间；保存后回读正文与状态，返回文章链接；未知结果不自动重复创建。
- runtime.ts 注册工具，并对写文章强制审批；seo-content-studio.md 已编排 WordPress 发布步骤。
- 测试连接读取 users/me，只证明认证成功。正式发布需要对应用户具有发布权限。
- 当前仅一个站点配置。多站点、媒体上传/特色图、分类标签、slug/摘要、定时发布、Yoast/Rank Math 字段尚未实现。不能把官方 API 支持的字段全部当成本产品能力。

## 用户配置与使用

1. 在 WordPress 后台「用户 → 个人资料」生成专用应用密码。
2. 在扩展「设置 → 连接器 → WordPress」填写实际站点 HTTPS 根地址（保留安装子目录，不填 wp-admin）、用户名和应用密码，保存并测试。
3. 对 Agent 说「把这篇文章保存到 WordPress 草稿」或「将确认后的文章发布到 WordPress」。现有工具在执行写入前呈现确认。
4. 根据回执检查文章 URL、状态与内容。真实站点未配置前，无法完成远端验收。

## 后续优先级（方案，未实施）

P0：用用户站点验收认证 → 草稿 → 回读 → 更新 → 经授权正式发布。
P1：扩展媒体、特色图、分类标签、摘要/slug、WordPress 原生定时发布；每项增加官方接口适配及独立回读。
P2：多站点选择、特定 SEO 插件字段；根据站点实际注册接口检测支持程度。
MCP 仅在需要自定义 Abilities 时再引入，不替换已有可用 REST 链路。

## 验证与交付边界

本次未修改产品代码、未安装上游 Skill 或 MCP。运行 seo-publishing.test.ts 与 seo-approval.test.ts：2 文件、11 测试通过（模拟 API）。未调用真实 WordPress 站点，未发布文章。本次仅文档变更，无需新增架构图或重复完整构建。

工作区：主工作区；分支/目标分支 codex/agent-workspace-sandbox；HEAD 23a545138cfac3372868277ddd413cbc4e59d614。连接器是当前工作区未提交实现，不归属该 HEAD；本次文档未提交，无新增交付 SHA。扩展实际加载版本与真实账户联调仍待核验。
