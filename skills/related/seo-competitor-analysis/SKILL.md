---
name: seo-competitor-analysis
description: 使用 DataForSEO 分析单个网站或比较竞争对手的自然排名、关键词和估算流量，输出有来源的外贸独立站 SEO 机会报告。
---
# 竞品与域名分析

先读取 references/seo-api.md。整合 references/seo-sources.md 中 Aaron competitor-analysis 与 OpenClaudia semrush-research 的方法；数据统一由本产品 DataForSEO 连接器提供。

1. 识别单站诊断或多站对比，确定域名、国家和语言。用户已指定竞品则直接使用；只有要求发现竞品时调用 competitors，根据官网分为同行、替代方案、内容站和目录。
2. dataForSeoQuery 的 domain 获取所选市场概况；ranked 获取自然排名词。优先少量有业务相关性的域名，明确结果数量；不得自动扩展为无限查询。
3. readFile 回读证据并核对回执版本。比较 organic 排名分布、词数、关键词和 etv。etv 是第三方估算，不是 GA4 流量；付费 competition 不等于自然关键词难度，Semrush/其他平台的专有分数不映射成自造分数。
4. 结合实际排名页面和产品判断机会：优势主题、接近前十的相关词、品牌依赖、适合更新的页面。访问用户范围内代表页并 inspectPage 保存内容证据；不能由少量关键词证明全站所有热门页。
5. 用户要求缺口时以 gap 查询 target=自家站、competitor=竞品，核对自家现有页面；没排名不等于没有内容。没有历史数据不能宣称排名下降，没有外链或 GSC 数据则将这些维度标为未验证。
6. 单站输出 domain-report.md 与 ranked-keywords.csv；多站输出 competitor-report.md 与 comparison.csv。每项建议附域名/页面、具体证据、影响假设、建议动作与复查办法；注明样本范围、市场、时间与来源文件版本。核验后 publishFile 交付。
