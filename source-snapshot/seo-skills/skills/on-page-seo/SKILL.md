---
name: on-page-seo
description: 检查当前页面的 On-page SEO，包括标题与内容意图、采购信息、图片 alt 和内链，给出带证据的修改建议。技术元数据深入核查与搜索样本研究可使用 technical-seo。
---
# On-page SEO 检查

使用当前页面和用户已提供的目标词、国家、语言及产品事实。目标词未知时先做基础检查，不猜搜索量、排名或获客效果。详细判定读取 references/on-page-checks.md。

1. snapshot 确定当前页面与范围；inspectPage 保存 sources/on-page.json 后读取字段与正文，不把摘要当完整内容。readFile 读取当前版本，需核对回读 version 与采集回执相同；后续采集另存路径，避免覆盖本轮引用。图片证据已在 images 中；可按回执 imageRange 分段 readFile，超出单次读取范围继续读取或用 runJavaScript 解析证据文件。hasAltAttribute=false 表示未设置属性，true 且 alt 为空表示明确设置了空值；旧证据没有 hasAltAttribute 时属性是否存在未知，不能仅凭空字符串判断缺失。结合 caption、heading 和图片用途判断是否需要替代文本；loaded=false 不等于死图，coverage 截断时列出未覆盖范围。
2. 确认页面用途：产品、分类、应用、指南或公司介绍。对照采购意图、主标题、规格、应用、选型问题与用户真实产品资料。列出证据不足的内容，不补造认证、产能、MOQ 或案例。
3. 按参考检查标题、描述、可读结构、内容缺口、图片和内链。将“已发现的问题”“优化建议”“未验证”分开，附原值、证据位置、理由、建议值及复查方法。不以统一 SEO 分数掩盖证据缺口。
4. 需要批注时，若 createAnnotation 不在当前工具列表，先 selectTools 启用 browser、data、files、skills、annotations 组。snapshot 获取最新 annotationTargets/elements 的 ref；每个问题使用稳定 key，createAnnotation 保存后用返回 id 调用 readTaskAnnotation 回读真实编号。页面 title 等非可见字段对应“当前网页整体”；iframe 内问题先进入报告，不能冒充已建立该处批注。批注保存不代表网站已修改。
5. 用 writeFile 写入用户指定路径的 Markdown 修改清单，readFile 核验内容后按实际版本 publishFile。每项保留来源 URL、采集时间、证据 path/version/id、原值、问题或未知、建议与复查方法，已保存批注附实际编号。复查任务重新读取页面，逐项对照旧建议；只报告实际改变，不把短期排名变化归因于本次修改。

技术层面的索引、响应头、robots.txt、全站重复标题或 Google 选定 canonical 不由单页 DOM 证明。需要这些证据时明确补充来源。
