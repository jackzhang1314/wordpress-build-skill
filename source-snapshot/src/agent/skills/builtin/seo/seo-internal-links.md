---
name: seo-internal-links
description: 基于实际页面和抓取图给出内链建议，定位深度、断链与可能的孤立页面。
---
# 内链与页面结构

先按需读取 references/seo-api.md 的实际工具合同，来源与修改说明见 references/seo-sources.md。本技能运行于本浏览器 Agent，不需要终端或 MCP。

1. 小范围用 inspectPage 读取页面真实链接和正文；全站用 startSeoAudit/readSeoAudit 的 pages 与 links，按实际 nextOffset 读取。
2. 读取 sitemap 或用户完整 URL 清单作为页面全集；爬虫未发现的 URL 不一定是孤立页。只有已知全集与完整内部链接覆盖才可判孤立，否则标记疑似。
3. 在工作区计算规范化 URL 的有向图、入链/出链和从入口的最短深度，保留参数页、跳转、canonical 处理规则；不要把 sameOrigin 当 HTTP 200。
4. 结合主题相关性、真实段落和目标页类型提出锚文本，排除不存在、不可访问或已明显冲突的目标。每个建议包含来源页、具体段落、锚文本、目标 URL 与依据。
5. 输出 internal-links.csv 和 structure.md；建议落地后重读页面或 WordPress 文章核实实际链接。自动补链接只用于用户明确授权的页面，不能以工具点击成功替代保存验证。
