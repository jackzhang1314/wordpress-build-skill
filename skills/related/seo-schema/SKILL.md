---
name: seo-schema
description: 检查页面实际 JSON-LD 与 Microdata 属性，或根据真实内容生成结构化数据草稿。
---
# 结构化数据检查

先按需读取 references/seo-api.md 的实际工具合同，来源与修改说明见 references/seo-sources.md。本技能运行于本浏览器 Agent，不需要终端或 MCP。

1. inspectPage 保存 structuredData。逐条检查格式、raw、validJson 和 coverage；JSON-LD 必须解析成功且未截断，Microdata 属性采样不能冒充完整对象图。
2. 以实际 @type/@id 和可见页面内容核对 Product、Article、BreadcrumbList、Organization 等实体，检查重复/冲突、URL 和引用关系。缺必填业务字段先列未知，不生成虚假价格、评分、库存、认证或评论。
3. 生成模式输出正确 JSON-LD 文件；脚本类型为 application/ld+json，不执行代码。遵循 Google 实际支持类型和规则，无法核验的富结果条件列待人工确认。
4. 同页面多个实体可使用 @graph，但不能为了形式强制重写已有实现。跨页实体 ID 保持稳定，变体/offer 与实际页面对应。
5. 输出 schema-audit.md 与必要的 schema.json，标注语法检查、业务一致性、Google 富结果验证是三层不同判断。语法正确不保证富结果或排名。发布到站点须另有适配并现场回读，本工具不虚构 CMS 头部注入能力。
