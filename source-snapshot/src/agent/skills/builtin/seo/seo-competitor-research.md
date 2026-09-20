---
name: seo-competitor-research
description: 发现搜索竞争对手，对比自然排名与关键词布局并提出行动建议。 使用 DataForSEO API 数据，适用于外贸独立站 SEO。
---
# SEO 竞争对手研究

先读取 references/seo-api.md 的工具参数与数据口径。本技能为浏览器适配版，来源见 references/seo-sources.md。

1. 用户已指定竞争域名就使用它们；未指定时用 competitors 找候选，结合官网判断直接同行、替代方案和内容竞争者。
2. 先给出有限样本范围，优先比较三个业务相关域名；每个以 domain、ranked 取得同一国家语言数据。
3. 对照排名分布、估算流量、词意图和排名页面；以实际数据解释优势，不能把排名好推断为业务销量好。
4. 如需词缺口，用 gap：target 为自家站，competitor 为竞品。样本网页内容可以浏览核实。外链质量、广告预算、AI 引用和实际转化不在这些端点覆盖内。
5. 输出 competitors.csv 与 competitor-report.md，列短期页面更新、中期新内容和待验证假设，附每个域名来源与采集时间。
