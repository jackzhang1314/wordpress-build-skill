---
name: seo-content-studio
description: 使用 DataForSEO 关键词和 SERP 数据生成 SEO 简报、大纲或完整文章；也可结合企业数据写研究文章，适合外贸独立站内容生产。
---
# SEO 文章工作室

读取 references/seo-api.md 了解现有工具与数据口径。方法整合自 references/seo-sources.md 中的 Claude SEO content-brief、Aaron content-writer、OpenClaudia write-blog 和 Agentic content-seo，已改为本产品浏览器与文件工具。

## 选择交付模式

以用户目标为准：要简报交付 brief；只要大纲交付 outline；要求文章就完成全文 article。数据驱动文章先读原始企业资料，关键词驱动文章先验证搜索需求。不要把这些输入模式变成重复入口或要求用户批准每个普通步骤。

## 执行

1. 确定主题、目标国家/语言、受众、产品事实和输出模式。缺少决定 API 查询的资料才询问；已有资料不重复索要。禁止要求在聊天填写连接器凭据。
2. dataForSeoConnectionStatus 检查连接；dataForSeoMarkets 选择实际支持的组合。dataForSeoQuery 的 keywords 查询指标，serp 查询搜索结果。需要发现主题才使用 ideas；同一任务已有数据直接复用。
3. 读取回执 path，核对 readFile 的 version 与回执一致。月度数据保留时间，搜索量只证明搜索需求；不能写成市场销量或企业业绩。用户 CSV 用已有解析/计算工具核查完整口径。
4. 区分自然结果与广告、目录、产品页、比较页、指南。需要页面正文时在任务范围内访问并 inspectPage，未访问的页面只能引用实际 SERP 摘要。形成事实—来源—推论表。
5. 按搜索意图设计结构并结合企业能提供的真实参数、选型解释、应用案例与原创数据。大纲列段落目的、待补材料及可靠内链；不固定关键词密度或模仿竞品字数，不凭空编造认证/产能/专家引语。
6. 按模式交付。brief.md 包含研究、大纲和资料缺口；outline.md 只交付所需结构；全文保存 article.md、metadata.json、sources.md。用户要求完整文章时不能停在简报。写作使用当前模型，不调用不存在的写作 API。
7. 核查文章事实与引用、意图、可读结构、产品承诺及链接。缺失事实用待确认标记；readFile 核验后 publishFile 发布实际文件版本。交付状态是草稿，未调用网站发布工具就不能声称已上线。

需要保存到 WordPress 时，使用 writeSeoPost 默认 draft；明确要求发布才用 publish。更新必须先 readSeoPost 得到修改时间，保留原文；保存后检查回执与正文是否一致。其他 CMS 需要具体适配，不能声称通用发布。
