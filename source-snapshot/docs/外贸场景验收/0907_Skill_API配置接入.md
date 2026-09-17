# Skill API 配置接入

日期：2026-09-07。用户要求需要 API 的技能配上对应配置入口。本轮完成连接配置层，首个服务为 Apify。

## 用户入口

- 设置 → 技能 → Apify API 配置：密码输入框、保存配置、测试连接、删除配置、获取 Token 链接。
- 技能详情概览：skill.json 中 product 元数据本身增加 connections:["apify"]（skill.json 根字段，与 title/category 并列）；该 Skill 自动展示相同配置组件。
- 名为 apify-google-maps-leads 的技能也显示该入口。此匹配只提供固定服务配置，不授予执行工具。
- 同一浏览器的多个 Apify 技能共用一份连接，不需要重复粘贴 Token。

skill.json 最小示例：

```json
{"title":"地图找客","category":"prospecting","summary":"使用 Apify 研究当地商家","connections":["apify"]}
```

## 实现与边界

凭据独立保存在 chrome.storage.local，访问级别 TRUSTED_CONTEXTS；不写入 Skill 元数据、模型指令、任务文件或导出包，不声称浏览器本地存储是加密保险库。页面不会回填已保存 Token；更换需输入新值并保存。

测试使用 [Apify 官方账户读取接口](https://docs.apify.com/api/v2/users-me-get)，固定 GET https://api.apify.com/v2/users/me，Authorization Bearer，不把 Token 放进 URL；禁止重定向、10 秒超时、不回传服务器正文或完整账户资料。此测试只验证账户访问，受限 Token 若无该权限会提示，不能据此判定特定 Actor 权限或余额足够。

连接时间使用独立记录并绑定 Token SHA-256 指纹。验证完成不重写凭据，避免并发删除被旧测试恢复。修改 Token 后旧指纹不匹配，不显示旧成功状态。

connections 仅允许已实现的服务枚举 apify；外部 Skill 不能指定任意 API 域名来接收凭据。新增服务需要实现对应连接适配器，不能仅靠声明获得网络执行能力。

## 验证

最终同轮 typecheck、lint、4 个测试文件 / 31 项、build 通过。覆盖独立存储、状态不含 Token、固定端点/Bearer、401/403/429/500、删除期间测试回执、配置 UI、更换草稿与枚举限制。没有用户 Token，未调用真实 Apify 账户；没有执行本地 UI 浏览器实测，不把 jsdom 测试称为原生 Chrome 验收。

## 尚未包含

本轮没有新增 Apify 采集 Skill 包或 Actor 执行工具，没有启动任务、轮询、读取 dataset 或完成地图找客。API 配置已可保存与测试；采集执行适配是下一步，不能因配置完成就宣称地图找客可用。现有 15 个内置技能数量保持不变。
