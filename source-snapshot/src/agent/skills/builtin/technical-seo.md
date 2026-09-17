---
name: technical-seo
description: 进行有范围的全站或单页技术 SEO 审计，检查抓取、索引指令、重复内容、重定向与迁移证据；保留实际覆盖和未知项。
---
# 技术 SEO 审计

按需读取 references/seo-api.md 的参数与范围，来源见 references/seo-sources.md。

单页先 inspectPage 保存渲染 DOM，检查 titles/descriptions/canonicals/robots/headings/language/links。多个值分别核对，保留原值、resolvedURL、locator、时间及 coverage。DOM 不能证明 HTTP 状态、Google 最终 canonical 或收录。搜索意图研究使用专门 SERP 技能。

全站模式先明确域名、页数上限、是否 JS 渲染及费用。startSeoAudit 创建后保存 taskId；readSeoAudit summary 读取进度，未 finished 不称审计完成。按需明确 stopSeoAudit：用户停止浏览器任务不会自动取消服务端抓取。默认100页最多1000页、JS关闭，启用会加价。

完成后按 nextOffset 读取 pages、links、redirect_chains、non_indexable。duplicate_tags 必须指定 duplicateType=duplicate_title/duplicate_description；duplicate_content 必须提供抓取过的 url。重复不自动等于有害，应结合意图、模板和 canonical 判断。readSeoAudit raw_html/microdata 可查指定页面，参数与工具说明一致。

readSeoResource 读取 robots.txt、sitemap 或目标 URL 原始响应：无登录、不跟随跳转，保存状态、Location、X-Robots-Tag/Link 和截断标志。对照抓取与渲染结果，不能把没有观察到当不存在。sitemap 超出单次范围应显式读取子文件；解析实体和 URL 后去重，不用样本代表全站。

Google 真正索引检查需 googleSearchConsole sites → inspect，必须有站点权限，仅报告 Google 已索引版本。页面可能可抓取但没有索引数据，两者分开。性能使用 dataForSeoResearch lighthouse 和 seoFieldPerformance，各自区分实验室与现场。

迁移模式读取迁移前后抓取/排名快照和用户 URL 映射，逐项比较跳转目标、状态、内容保留、canonical、内链和 sitemap；无迁移前证据就只能做当前审计。工作区计算保留文件版本、分母和未覆盖项。

交付 technical-seo.md 与 issues.csv，包含优先级、URL、原值、实际问题、证据、修复建议、影响与复查动作。结论注明配置页数、实际抓取、已读取数量、时间和限制。不得承诺排名或 Google 采用所有指令。
