# Skill 场景化重构与开源技能研究

研究与实施日期：2026-09-06。对象：面向外贸业务员、独立站运营、社媒运营与广告投手的浏览器 Agent。

## 结论

应该按用户要完成的工作分类。岗位、平台作为搜索标签；来源、版本和依赖作为管理信息。保留现有抽屉与设置页视觉，把“找一个技能”变成“理解输入与产出，然后加入任务”。本轮已落地七个业务分类、15 个内置技能、收藏与最近使用、统一详情和完整 ZIP 导出。

选择开源包的标准是：方法可解释、输入输出明确、证据可追溯、许可明确、依赖可在当前浏览器执行。星标数量不作为质量结论。原包可以解析不等于它能在本产品运行。

## 调研来源与取舍

以下为固定提交核验，链接指向当次研究版本。没有审计整个仓库的所有文件，也没有在真实广告账户或客户邮箱执行上游自动化。

| 来源 | 许可 / 固定版本 | 值得吸收的方法 | 适配结论 |
|---|---|---|---|
| [Corey Haines Marketing Skills](https://github.com/coreyhaines31/marketingskills/tree/5b2c0007766c6a1cf1d53fd8fc73e979e0821022) | MIT；5b2c000… | CRO 的采购障碍、文案事实表达、社媒复用、开发信个性化、广告角度与审计口径 | 本轮主要参考；改编为短中文浏览器流程，随包保留许可证和来源 |
| [Anthropic Knowledge Work Plugins](https://github.com/anthropics/knowledge-work-plugins/tree/1f517b9de47e827c80cd933ed364e16838072239) | Apache-2.0；1f517b9… | account-research 的事实、来源、业务匹配与行动建议 | 研究参考，未复制进内置包；draft-outreach 存在与实际技能名不一致的引用，连接器不能假定可用 |
| [Trade Customer Intel](https://github.com/FloydTang/trade-customer-intel/tree/426df5ba0bc3bc5c3b7677ace60e26d1342c68c8) | MIT；426df5b… | 外贸客户调查框架、事实与推断分开 | 不原样导入；Python、搜索服务依赖与推广指令不适合直接进入产品默认流程 |
| [Google Skills](https://github.com/google/skills/tree/134ba0655f1f6db621800a01dfd7c6925152fa40) | Apache-2.0；134ba06… | Ads diagnostics 的账户范围、数据口径与诊断顺序 | 暂留连接器阶段；依赖 list_accessible_customers/search/get_resource_metadata 等工具，当前不宣称可执行 |
| 本地 audit-website、b2b-builder、b2b-fast-builder 等技能方向 | 本地候选，不推断统一许可 | 全站审计、B2B 页面信息架构与询盘导向 | 作为后续拆解候选；终端审计、框架建站和部署能力不等于浏览器侧栏已具备，不整包安装 |

Corey 重点读取 cro、copywriting、social、cold-email、ad-creative、ads 及相关参考文件；ad-creative 和 ads 正文体量较大，部分路径依赖仓库外层 tools。社媒 listening 仅部分读取，不对整个监听方案作质量背书。保留适合任务的方法，去除未接入工具、固定效果数字、机械预算阈值和平台算法保证。

## SEO 的证据标准

On-page SEO 使用原创中文流程，以 Google Search Central 核对判定依据：

- [标题链接](https://developers.google.com/search/docs/appearance/title-link)：描述性、准确性和页面匹配；不把固定字符数当硬性排名规则。
- [搜索摘要](https://developers.google.com/search/docs/appearance/snippet)：描述应有页面针对性；实际摘要可能由搜索引擎重写。
- [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)：不套用“多个 H1 必罚”“固定字数或关键词密度保证排名”等规则。
- [Canonical](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)：canonical 是规范化信号，不保证 Google 选择该 URL。
- [Robots](https://developers.google.com/search/docs/crawling-indexing/robots/intro)：抓取控制与索引控制分开。
- [结构化数据](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)：语法正确与符合展示资格不同，不保证富媒体结果。

检查产出区分“已验证问题 / 建议 / 未知 / 不适用”，保留原值、来源与覆盖范围。当前页面检查不能冒充全站爬取、排名追踪或 Search Console 实证。

## 已落地的场景库

| 大分类 | 内置技能 | 主要产出 | 本轮新增 |
|---|---|---|---|
| 找客户与背调 | 客户调研 | 客户概况、匹配理由、来源与未知项 | — |
| 客户沟通 | 个性化开发信 | 主题、正文与跟进草稿 | cold-outreach |
| 建站与页面优化 | 网站结构、询盘转化检查、B2B 产品页文案 | 页面结构、采购障碍清单、页面文案 | landing-cro、b2b-copywriting |
| SEO 优化 | 技术 SEO 与搜索研究、On-page SEO 检查 | 原值、证据、建议值、搜索样本 | on-page-seo |
| 社媒推广 | 外贸社媒内容 | 平台文案、素材说明、内容计划 | social-content |
| 广告投放 | 搜索词分析、广告文案与落地页、否词与误伤检查 | 逐行分类、广告变体、否词影响清单 | ad-creative、negative-keywords |
| 数据与资料整理 | 网页转表格、产品对比、批注整理、阿里国际站商品研究 | 有来源的表格、对比与修改清单 | — |

额外保留“我的导入”兼容无分类的旧包。外部包可通过 skill.json 指定业务分类；这不赋予它浏览器适配认证或执行权限。

## 交互改造

1. 对话中的“使用技能”：场景筛选 + 中英文关键词、平台、岗位标签搜索；按场景分组。
2. 卡片使用中文业务名称，展示结果摘要；提供详情与星标。
3. 详情先展示需要的资料、你会得到、使用条件和示例，再将技能加入当前任务。
4. 收藏与最近使用保存在本地，刷新后仍可用；清空站点存储会清除这些偏好。
5. 管理页使用同一目录模型，展示来源与兼容性；方法正文折叠，保留原有导入和启停能力。
6. 详情页支持下载当前版本的完整 ZIP，包含方法、参考资源、元数据与许可。
7. 继续采用现有 /skill-name 消息传输，保留原草稿，每条消息至多四个技能；未实现独立参数表单或技能标签芯片。

## 规划架构与兼容

- catalog.ts：业务目录与展示字段；输入、输出、标签、示例、依赖均有 schema 限制。
- model.ts / import.ts：可选 skill.json sidecar；旧 SKILL.md 格式保持兼容，未知字段不当作可信能力。
- picker.ts / view.ts：共享目录语义，选择任务与管理包各自保持职责。
- preferences.ts：仅保存技能名称，不存客户资料。
- builtin.ts：在旧八个包的基础上添加七个新包。旧包资源保持原版本可解析。
- store.ts：升级内置包时保留启停偏好，但不让历史 head 把目录锁在旧版本。
- package.ts：复用 fflate 官方类型导出完整包，回导后校验内容哈希与资源引用。

没有引入新依赖，也没有把开源技能安装到用户全局 Codex 环境。技能方法不等于新工具权限；浏览器访问、文件计算、发送与发布仍由已有工具能力决定。

## 后续功能顺序

| 优先级 | 下一阶段 | 完成条件 |
|---|---|---|
| P1 | Google / Maps 专用找客任务 | 明确地区、客户类型、数量；去重、官网核验、证据与可恢复进度 |
| P1 | 企业产品资料复用 | 用户一次维护产品、市场、认证等事实；任务可选择关联版本 |
| P1 | 场景质量验收集 | 真实业务页面与匿名报表，记录证据正确率、遗漏、任务成功率 |
| P2 | 邮箱草稿到发送闭环 | 邮箱接入、收件人核验、发送状态与失败处理，明确授权范围 |
| P2 | 广告连接器与站点检测工具 | 数据口径和工具可用性验证后再上架依赖它们的技能 |
| P2 | 按场景预算 / 积分 | 基于实际搜索、页面、模型与计算成本显示预算和消耗；不按技能标题武断定价 |

本轮没有实现邮件自动发送、社媒自动发布、广告账户改写或积分扣费。上架这些能力前需要完成对应工具链与业务验收。

## 验证记录

类型检查、ESLint、构建通过；技能目录、ZIP 导出回导、sidecar 兼容、启停升级、收藏/最近使用和输入保留已有自动化测试。UI 在本地预览实测 SEO 分类、星标、详情、加入任务以及 320px 窄侧栏。截图见 output/skill-ux-audit。全量测试结果在本次过程记录补充；本报告不把 UI 验证等同真实模型在客户网站上的任务成功率。

最终回归：5 个技能测试文件 34 项通过；typecheck、lint、build 通过。全量 683 项中 675 通过、8 失败，失败集中于浏览器原生输入测试缺少 chrome.tabs.get 模拟，详见 process_docs/0906-132_Skill场景重构与开源研究验收.md。内置浏览器下载事件未返回，因此 Chrome 下载落盘仍未验收；ZIP 内容与回导哈希验证通过。
