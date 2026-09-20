---
name: seo-backlink-audit
description: 分析引用域、外链、锚文本及供应商索引中的新增丢失，保留样本证据。
---
# 外链画像与变化

先按需读取 references/seo-api.md 的实际工具合同，来源与修改说明见 references/seo-sources.md。本技能运行于本浏览器 Agent，不需要终端或 MCP。

1. 对目标使用 backlinkSummary；按需读取 referringDomains、anchors、backlinks。总外链与引用域分开，保留 limit/offset 和实际读取数量。
2. 用 linkChanges 指定起止日，区分供应商首次发现/丢失与现场真实新增/删除；重要变化访问来源页检查目标链接、rel 和上下文，访问失败标未知。
3. 统计来源主题、国家、锚文本集中度、nofollow/sponsored/ugc（仅实际返回或页面证据）、目标页和时间分布。不同供应商权威分数不互换。
4. 风险判断需要多种证据，不把 spam score 单指标等同于惩罚或必须拒绝链接；不自动提交 disavow。
5. 输出 backlink-audit.md、backlinks.csv，每条建议带来源 URL、观测时间、范围与验证状态。优先列可修复断链、错误目标和真实合作机会，不承诺排名提升。
