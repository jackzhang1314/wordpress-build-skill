---
name: seo-performance-review
description: 比较同口径的自然搜索表现，结合真实站点数据或定时快照形成复盘。
---
# SEO 数据复盘

先按需读取 references/seo-api.md 的实际工具合同，来源与修改说明见 references/seo-sources.md。本技能运行于本浏览器 Agent，不需要终端或 MCP。

1. 确认日期、国家、设备、搜索类型、站点范围；只允许同口径比较。先读用户历史文件，无历史时建立基线，不用当前值反推过去。
2. 实际点击/展示使用 googleSearchConsole sites → analytics。分别保存两期，保持 dimensions 一致；按实际行数显式分页，报告热门行限制。排名/估算使用 DataForSEO 并标明来源。
3. 用 runJavaScript 按 page/query 键合并，保留仅一期存在的行，计算绝对差与百分比；基期为零时不输出无限增长。CTR 按总点击/总展示重算，不能平均百分比。
4. 分离品牌/非品牌、页面组、国家与设备；流量下降先核对范围、季节性、内容/技术改动及数据延迟，不把相关性当因果。只有收入资料时才讨论询盘/营收归因。
5. 用户要求持续监测时创建有界 createSeoMonitor，记录授权范围和停止方式；seoMonitorStatus 回读已有快照。生成 report.md 与 comparison.csv，列证据、变化、假设和验证动作。
