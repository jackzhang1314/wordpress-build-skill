---
name: page-table
description: 将当前网页中的列表、产品参数或关键词数据整理成有来源的表格。用户要求提取网页数据、整理表格时使用。
---
# 网页数据整理
1. 先 snapshot，确认来源、筛选条件、单位、tables、scrollContainers、frames 和页面标注的总行数。
2. HTML/ARIA 表格用 extractTable 直接保存批次到 data/page-001.json；不要让模型从正文抄写大量数据。每批最多 200 行，nextOffset 不为空时携带 fingerprint 继续。同一 DOM 批次变化就从 offset=0 重新提取。
3. nextOffset=null 只说明当前已加载 DOM 扫描完毕。分页要点击下一页并等待实际页码/数据变化；虚拟表格要对 scrollContainers 中的容器滚动，每次重新 snapshot 再提取。多次没有新增数据但总数不匹配时应报告缺口，禁止假装完整。
4. iframe 要使用对应 frameId；open Shadow DOM 可读取，closed Shadow DOM、Canvas 表格目前不能直接提取。
5. 每批保留原始数据文件及来源、行索引、时间和警告。运行工作区 JavaScript 生成 CSV，使用业务主键去重；不要因为两行内容相同就删除合法重复记录。无主键时保留重复并说明。
6. 合并前检查列名与筛选条件是否一致；同一主键数据冲突应列出，不静默覆盖。保持原始单位，缺失值保持空值。
7. 核对预期数量、实际唯一数量、缺失字段、批次数和提取范围。CSV 正确转义逗号、引号和换行；对以 =、+、-、@ 开头的文本采用表格公式防护，原始 JSON 保留未改写值。
8. publishFile 交付核验后的 CSV 与报告；正文说明实际抓取数量和未完成范围，大数据不使用 showCard 逐行铺满聊天。

## 商品卡、列表和搜索结果（不是 HTML/ARIA 表格）
- snapshot 用于找搜索框、筛选和分页控件；正文及元素列表只是预览。预览截断位置不是列表末尾，滚动后预览相同不能证明已到底或没有更多商品。elementOffset / nextElementOffset 是元素观察分页，不是网站商品页码。
- 优先 extractList 保存按项目边界归组的原始数据。linkContains 使用实际商品链接片段；确认商品 ID 在路径时用 identity=pathname 忽略跟踪参数。文件 items 中每项的 text 是原文、links 是同一容器内的链接，名称字段为 links[].text。脚本直接解析 items，不再按全局 locator 顺序重建商品卡。无法确定边界时才用 inspectPage 调查，并检查覆盖警告。
- 脚本示例：`const batch = JSON.parse(fs.readFile('sources/page-001.json')); for (const item of batch.items) { console.log(item.key, item.text.slice(0, 120)); }`。无需 require/import；不要使用 Node.js 的 readFileSync。实际脚本应将整理记录保存到声明的 outputs，stdout 只输出计数与少量样本。
- 优先依据明确商品 ID、商品 URL 和同一卡片的结构证据关联名称、价格、MOQ、供应商；不能仅凭链接顺序把不同商品或广告栏字段拼在一起。关联不确定时留空并记录缺口，保留来源文件及证据 id。
- 标题优先使用同一卡片内标题元素（例如 locator 中 h2/h3）的链接正文；不能把“最长 product 链接文字”当标题，评分、促销和价格链接也可能指向同一商品。验证每个字段的语义位置，而不只是验证文字出现在卡片里。货币符号不总能唯一确定货币代码，缺少明确代码证据时保留符号或留空。
- 每获取一个批次就保存原始证据和已整理记录，更新 plan.md 的完成项和下一步。按阶段读取文件，不要依赖对话正文作为唯一进度记录。
- 分页先观察实际 pagination 区域或页面提供的链接，再执行并核实页码/URL/商品 ID 集合变化；不猜 page 参数，不把换筛选当作访问了第二页。无法访问下一页时交付实际覆盖的数据与明确缺口。
- 发布前重新读取用户的数量与覆盖要求：共 N 条是精确数量，至少 N 条才是下限，不能自行放宽为 >=N。原始证据可多于交付数量；筛选交付子集后重新验证行数、唯一 ID、各来源覆盖和字段证据，报告分别列出原始数与交付数。保存可重跑的验证代码与结果，再发布；publishFile 成功只代表文件已展示，不能代替业务验收。
