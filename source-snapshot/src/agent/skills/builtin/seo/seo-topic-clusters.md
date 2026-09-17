---
name: seo-topic-clusters
description: 结合关键词指标和 SERP 重叠规划主题页、子页面与内链。 使用 DataForSEO API 数据，适用于外贸独立站 SEO。
---
# 关键词聚类与内容地图

先读取 references/seo-api.md 的工具参数与数据口径。本技能为浏览器适配版，来源见 references/seo-sources.md。

1. 用已有关键词表或 ideas 形成有限候选，按业务与语义先分组；标注这是初步语义分组。
2. 在用户接受的查询范围内，对各组代表词用 serp 获取前十自然 URL。用 runJavaScript 读取证据计算 URL 交集；未查询的词不能标为 SERP 验证聚类。
3. 记录采用的重叠判定阈值及其启发式性质，结合意图判断同页覆盖或拆页。保留不同页面类型和不确定的边界。
4. 用真实站点清单把组映射到已有或拟建页面，避免两个新页面竞争同意图；不要只依据文字相似决定合并。
5. 交付 clusters.csv、content-map.md 与内链建议；标注查询词数、覆盖程度和每条数据路径。不给未抓取全站的主题覆盖率。
