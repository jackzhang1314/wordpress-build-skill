# Google 搜索与 Google Maps 外贸主动开发 Skill 研究

日期：2026-09-07。研究范围：外贸业务员寻找海外买家、经销商、批发商、租赁商、安装服务商与终端企业。检索 skills.sh 与 GitHub，读取重点方法和依赖，使用本产品实际 parseSkill 检查 5 个候选主文件。没有安装第三方包、运行采集服务、调用付费 API 或发送邮件。

## 结论

推荐新增两个用户入口：Google 搜索找客户、Google Maps 找客户。两者使用同一客户清单结构，后续复用已有 company-research 和 cold-outreach。多语言、协会名单、品牌经销商网络和分城市扩展作为查找策略，不在第一版拆成十几个容易混淆的按钮。

本次候选中，没有发现已经验证可以原样导入、纯浏览器运行、并针对外贸采购角色做好筛选的完整包。最适合借鉴的是可解释的客户资格判断和分阶段交付；采集 API 包和本地爬虫属于另一种执行架构。

## 开源候选比较

| 候选与来源 | 许可核验 | 值得参考 | 对我们产品的判断 |
|---|---|---|---|
| [Corey prospecting](https://github.com/coreyhaines31/marketingskills/tree/5b2c0007766c6a1cf1d53fd8fc73e979e0821022/skills/prospecting) | MIT，根 LICENSE 已核对 | 先定义客户资格，分搜索/核验/交付；本地商家分支 | 方法首选，拆短并重写外贸判断；主文件导入超长 |
| [Apify google-maps-leads](https://github.com/apify/awesome-skills/tree/97b0642af22e4ecec0d1a309ddf7bfcc5d576079/skills/apify-google-maps-leads) | Apache-2.0，根 LICENSE 已核对 | 地图→官网→联系人→CSV，保留缺联系人商家，防联系人错配 | 流程参考；需 Apify CLI/MCP 和 Actors，附加数据可能计费；本次 YAML 解析失败 |
| [gosom google-maps-scraper](https://github.com/gosom/google-maps-scraper/tree/beca11f148c7dc9651ee2da9aa9ce111f3dd3bea/skills/google-maps-scraper) | MIT，根 LICENSE 已核对 | 先验证小样本、任务监控、失败保留部分结果 | 本地采集方案参考，依赖 Docker/Node；不适合浏览器内直接执行 |
| [gmapsscraper google-maps-leads](https://github.com/gmapsscraper/google-maps-agent-skills/tree/2c6847bacc265b13cc1cae3f63db70f8371ae840/google-maps-leads) | MIT，根 LICENSE 已核对 | 按行业与地点组合查询、商家与地址去重 | 依赖其商业 API/curl；评分偏评论/联系方式，需改为外贸匹配；嵌套 metadata 不兼容 |
| [Composio lead-research-assistant](https://github.com/ComposioHQ/awesome-claude-skills/tree/be2a406907dbc61b73e6827ded415c96139d13a2/lead-research-assistant) | 本次未找到仓库根许可证，API license=null，不能认定可直接再分发 | 产品→目标公司→接触策略的简单框架 | 方法比较对象；可解析但没有 Google/Maps 页面执行细节，不复制上架 |
| [Browserbase event-prospecting](https://github.com/browserbase/skills/tree/6811ca31163332d9d60309cff48e77f09de37a17/skills/event-prospecting) | 本次未找到根许可证，许可待核实 | 活动名单先按公司筛选，再研究具体人员 | 后续展会模式参考；依赖 browse 命令/脚本，偏活动讲者，不直接等于外贸买家 |

以上“许可”针对已查到的仓库许可；服务费用、工具依赖与代码许可是不同问题。没有做法律适用性审查，也没有审计所有依赖或全部脚本。

### 对上游方法的具体取舍

[Corey 本地商家参考](https://github.com/coreyhaines31/marketingskills/blob/5b2c0007766c6a1cf1d53fd8fc73e979e0821022/skills/prospecting/references/local-prospecting.md)明显包含向商家销售建站/营销服务的逻辑。外贸卖产品时，“没有网站”或“网站很旧”不能直接当高价值信号，应核验商品品类、服务项目、渠道和供货关系。

[Corey B2B 参考](https://github.com/coreyhaines31/marketingskills/blob/5b2c0007766c6a1cf1d53fd8fc73e979e0821022/skills/prospecting/references/b2b-prospecting.md)可参考公司与业务模式维度，但不机械要求每个传统采购商都有融资、近期高管变动，也不因家族企业或信息少就排除。

Apify 的缺联系人保留与域名错配检查值得吸收；不采用默认开启多项付费补全、统一评论评分阈值作为本产品默认值。gosom 的自动更新、代理赞助推荐与求 star 属于上游使用流程，不进入我们的用户任务方法。gmapsscraper 的邮箱格式检查不能代表邮箱可投递，更不代表对方愿意收到开发信。

Google Maps Platform 的 [开发技能](https://github.com/googlemaps/agent-skills)主要帮助开发地图应用/API，不是外贸业务员的找客工作流；本次不列为首批业务技能。

## 实际导入检查

调用当前 src/agent/skills/import.ts 的 parseSkill，输入固定提交的原始 SKILL.md；仅测主文件格式与长度，不是完整包资源或业务运行验收。详细机器记录：output/prospecting-research/import-check.json。

| 主文件 | 结果 | 说明 |
|---|---|---|
| Corey prospecting | 失败 | 正文超过当前 16000 字符上限；适合把分支与资料移入 references |
| Apify google-maps-leads | 失败 | description 中出现未正确处理的冒号，YAML 报 Nested mappings 错误 |
| gmapsscraper google-maps-leads | 失败 | metadata.openclaw 为嵌套对象，当前 metadata 只接受字符串映射 |
| gosom google-maps-scraper | 通过，有诊断 | 解析通过不提供 Docker、Node、Bash；allowed-tools 不自动授予工具 |
| Composio lead-research-assistant | 通过 | 没有证明许可、完整资源与业务效果已满足 |

不为导入外部包盲目放大所有限制；优先改成简短、可验证、按需读取的本产品技能。

## 建议封装的主动开发场景

下表为本项目设计建议，非上游原包已经实现或经过效果验证的功能。

| 入口/策略 | 用户输入 | 执行方法 | 应交付结果 | 优先级 |
|---|---|---|---|---|
| Google 产品+国家找买家 | 产品、国家、目标客户角色、数量 | 产品用词×买家角色×地区分组搜索，访问官网核验 | 候选、合格、排除及未知清单 | P0，独立 Skill |
| Google 当地语言与同义词 | 英文产品术语、目标市场 | 根据当地实际页面调整称呼，保留词组来源 | 查询词组及新增客户，跨查询去重 | P0，搜索子策略 |
| Google 品牌经销商网络 | 相邻品牌/竞品、地区 | 找公开 dealer/distributor 页面，再核验各渠道公司 | 经销商列表、品牌关系证据与产品匹配 | P1，搜索子策略 |
| Google 协会/展会目录找客 | 行业、地区、名单或活动 | 找公开名单，分清参展商/供应商/买家后访问官网 | 有角色与排除原因的名单 | P1，搜索子策略 |
| Google 相似客户扩展 | 已认可客户官网 | 提取业务类型、产品与服务词，再找同类公司 | 相似理由与独立核验来源 | P1，搜索子策略 |
| Google Maps 城市找客 | 城市、商家类型、数量/观察范围 | 搜索、读取实际商家卡、访问官网核验 | 商家与分店清单、官网、联系渠道 | P0，独立 Skill |
| Maps 多城市扩展 | 已验证词组与城市列表 | 分城市记录进度、范围、原始候选和新增数 | 覆盖矩阵、去重客户清单与未完成地区 | P1，地图子策略 |
| 官网公开联系渠道补全 | 合格客户表 | 公司/联系页寻找真实公开邮箱、电话、表单或人员职位 | 联系渠道、来源日期、角色匹配与未知状态 | P0，复用背调 |
| 已有名单清洗与复核 | 客户 CSV、我方产品资料 | 官网核验、公司/分店关联、重复来源合并 | 可继续开发的名单、排除清单 | P1，共用能力 |

## Google 搜索找客的执行规格

### 输入

必需的是产品或应用、目标市场和希望找哪类客户；数量是合格客户目标还是原始候选数量要分清。公司规模、进口记录、MOQ、认证等只有用户提出才作为门槛，缺少事实时不虚构。

### 查询设计示例

例如工业泵企业找澳洲渠道，下列只是待执行的查询计划，不代表已找到客户：

- industrial pump distributors Australia
- industrial pump suppliers Melbourne
- pumping equipment dealers Queensland
- "industrial pumps" "distributor" Australia
- 对已经核实的官网执行 site:真实域名 contact / brands / products 等站内查找。

先宽后窄，用网页上出现的实际产品和业务叫法迭代。引号、site: 和减号有 [Google 官方说明](https://support.google.com/websearch/answer/2466433?hl=en)。不要默认加大量排除词；例如卖产品的工厂也可能采购配套件，manufacturer 不应总是排除。国家域名只是一条线索，不证明总部、服务区或买家资格。

### 核验与停止

搜索结果摘要用于发现，不代替官网核验。每家检查实际经营品类、客户角色、地区和我方产品关联，保留通过/不通过/待确认。逐批保存已访问 URL 和结果；数量未达成说明缺口，不以无依据公司补齐。对方销售某产品不证明有进口记录、正在采购或愿意更换供应商。

## Maps 找客的执行规格

1. 把我方产品映射为会销售、安装、维护、租赁或使用它的商家类型。例如工业泵可探索泵经销商、灌溉设备供应商、相关工程服务商；这些是待核验方向，不是自动合格客户。
2. 明确城市/地区与词组，每个搜索批次保留实际地图 URL、观察时间和观察范围。用户给整个国家时先规划分区，不能把一次地图结果称作全国覆盖。
3. 读取实际列表/商家详情，记录名称、类别、地址、地图链接、官网、电话和营业状态。评级仅是地图观察字段，不作为采购额或进口能力证据。
4. 访问官网检查产品与渠道业务；Maps 没有官网按钮时可搜索“精确商家名+城市”，找到后需核对身份。
5. 公司与分店分开：同官网多地址保留分店关系；相似公司名不自动合并。同商家多查询命中合并来源。只有页面实际提供稳定 place 标识时才保存，不从名称生成伪 ID。
6. 分城市/分词组记账，滚动无新增不等于全地区已穷尽。记录验证码、未加载、权限或网络问题，保留已核验结果。
7. 输出公司级与门店级关联及推荐接触渠道；连锁店可能集中采购，应标明门店电话与总部采购角色的区别。

[Google Maps 官方说明](https://support.google.com/maps/answer/3092445?hl=en)列出商家详情字段，并说明结果受相关性、距离和知名度等影响。因此不能把搜索前列当成最大进口商，也不能用结果数直接计算当地市场总规模。

## 客户表应保存的字段

- 身份：lead_id、公司名、门店名/地址、官网、Maps 链接、国家/城市、公司与门店关联。
- 业务：客户角色、经营产品、匹配理由、排除理由、待确认事项；采购信号与产品匹配分列。
- 联系：公开邮箱/电话/联系页、联系人与职位（如有证据）、发现来源；邮箱可投递状态默认未验证。
- 证据：查询组、来源 URL、采集时间、path/version/sourceId/证据 id。
- 进度：待访问、已核验、需补查、排除、已生成草稿；不把同一公司的多个邮箱当多个新客户。

首版采用可解释的“优先开发 / 可继续核查 / 暂不匹配”，理由分别展示产品匹配、渠道角色、市场和联系方式。不要输出没有校准依据的 87 分，也不要用星级推断采购能力。

## 与当前产品的接入

| 层次 | 推荐复用/新增 |
|---|---|
| 用户入口 | 新增 google-search-prospecting 与 google-maps-prospecting，归入找客户与背调 |
| 共用方法 | 客户角色、证据、公司/门店去重、进度与清单格式做成 references，避免多份分叉 |
| 浏览器工具 | 复用 snapshot/navigate/click/scroll/inspectPage/extractList；针对 Google/Maps 实际页面验证定位和范围 |
| 文件能力 | 复用 writeFile/readFile/runJavaScript/publishFile；分别保存候选、合格、排除与任务状态 |
| 后续任务 | company-research 深入调查；cold-outreach 使用核验后的证据写信，避免从头重搜 |
| 可选采集服务 | Apify 或本地爬虫留作单独执行适配；服务端、费用与凭据需要另行实现，不写在 Skill 中假装可用 |

现有 company-research 已涵盖通用搜索/Maps/背调/写信。新增入口时应收窄它的职责为单客户深入核验，而不是复制现有大包再换名字。

## 第一轮验收建议

分别给 Google 与 Maps 设 10 个合格客户的目标；记录原始候选数、唯一公司数、分店数、合格数、排除数和未完成原因。人工逐项核对官网是否同一主体、业务匹配是否有证据、联系渠道是否真实来源，以及跨词组是否错误去重。刻意包含同名异地、同官网分店、无官网、无邮箱、制造商与经销商混合结果。记录实际用时和模型用量，不预先承诺每小时数量或获客效果。

本次仅完成研究与导入解析检查；这两个新入口尚未实现，也未执行客户搜索或邮件发送。
