---
name: seo-serp-analysis
description: 读取目标市场实时 SERP，比较排名页面类型、内容覆盖和可切入问题。 使用 DataForSEO API 数据，适用于外贸独立站 SEO。
---
# Google 搜索结果分析

先读取 references/seo-api.md 的工具参数与数据口径。本技能为浏览器适配版，来源见 references/seo-sources.md。

1. 用 serp 查询一个目标词。读取数据文件中实际 organic 项、rank_group/rank_absolute、URL、标题和摘要；保留其他 SERP 类型，广告不计入自然排名。
2. 对前列页面分类：指南、产品、分类、比较、目录、论坛等。不能默认把大站都排除，它们也是搜索结果竞争者。
3. 在用户任务浏览范围内访问代表性页面，用 snapshot、inspectPage 保存页面证据；只凭摘要不能断言完整文章结构或字数。
4. 比较实际读取的前三个自然结果与目标页，列出覆盖、证据、用户问题与差异机会。访问失败保留未知和覆盖范围。
5. 输出 serp-analysis.md，附市场、桌面设备、时间和数据路径。前十样本未出现目标站只能说明本次样本未出现，不是未收录。
