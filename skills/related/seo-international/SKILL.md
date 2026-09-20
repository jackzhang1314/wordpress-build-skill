---
name: seo-international
description: 核对多语言版本的 hreflang、canonical、语言和跨页回链，定位区域配置问题。
---
# 国际 SEO 检查

先按需读取 references/seo-api.md 的实际工具合同，来源与修改说明见 references/seo-sources.md。本技能运行于本浏览器 Agent，不需要终端或 MCP。

1. 建立预期语言/区域和 URL 映射，来源必须是用户站点或实际链接。逐页 inspectPage 读取 hreflang、canonical、language；必要时 readSeoResource 检查 HTTP Link 头和 sitemap 中的声明。
2. 分别保存每页证据；检测语言/区域代码格式、x-default、绝对解析地址、同语重复冲突、自引用和互相返回。只有读取对应页才能声称验证回链。
3. 比较 canonical 是否错误指向其他语言、跳转/错误页、HTML lang 与实际内容；翻译质量不等于 hreflang 正确。
4. 参数、分页、地区差异和同语多国按站点策略判断，不机械要求每种语言对应每个 URL；无法访问页面标未知，不能当缺回链。
5. 输出 hreflang-matrix.csv 和 international-seo.md，按严重性列实际原值、来源/目标、建议及复查步骤。修改后重新读取两端，不保证 Google 采用所给版本。
