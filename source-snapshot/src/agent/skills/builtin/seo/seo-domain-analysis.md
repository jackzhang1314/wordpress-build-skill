---
name: seo-domain-analysis
description: 分析域名自然排名、关键词与估算流量，结合页面样本确定改进重点。 使用 DataForSEO API 数据，适用于外贸独立站 SEO。
---
# 网站 SEO 数据分析

先读取 references/seo-api.md 的工具参数与数据口径。本技能为浏览器适配版，来源见 references/seo-sources.md。

1. 用 domain 查询选定市场概况，ranked 查询自然关键词。域名参数不含协议和路径；只分析请求的市场。
2. 读取 organic 下的排名分布、count、etv 及实际关键词行。etv 为 DataForSEO 估算流量，不能称为 GA4 会话或 Search Console 点击。
3. 识别已有优势主题、接近前十的机会词和品牌依赖。导出样本行不代表全站所有关键词；没有历史快照就不宣称流量下降。
4. 选用户范围内的重要页面用 inspectPage 检查标题、正文、canonical、robots 与内链。样本页面不能证明全站技术健康，实际点击、索引状态、外链和 CWV 未接入则明确未知。
5. 保存 domain-report.md 和 ranked-keywords.csv；每项建议附域名/页面、数字或现场证据、影响假设与复查方法。Semrush Authority Score 不映射为任何自造评分。
