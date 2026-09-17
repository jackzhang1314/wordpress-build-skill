# DataForSEO 共享连接器接入

时间：2026-09-07T20:16:40.214913+08:00
触发：重要修改，扩展连接器注册与授权配置。

新增 DataForSEO API Login / API Password 本地配置、状态、删除与账户验证；凭据留在受信任扩展上下文。连接器 ID 独立定义，设置导航和技能依赖从 Apify 单项改为可枚举的共享连接器。正式查询端点限定为七种 SEO 读取服务，校验 HTTP 与任务业务码，错误不暴露凭据。

关键文件：src/agent/connections/dataforseo.ts、dataforseo-view.ts、ids.ts、catalog.ts、settings.ts；settings-navigation.ts；skills/detail-content.ts、picker.ts、catalog.ts。

下一步：接入工具执行、费用确认与结果复用，适配十个技能并执行类型、Lint、测试及前端验证。当前尚未完成验收，未调用真实付费 API。
