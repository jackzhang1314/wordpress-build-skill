# 浏览器 Agent：标准外贸站建设

目标：用户不需要Codex。本流程在已有WordPress上建设产品展示站，不购买域名/主机。不需要第三方页面编辑器或ACF PRO。

## 连接与安装

先selectTools选择wordpress、files、skills；需要真实预览再加入browser。wpRead site与wpReadDesignProfile发现用户站点的主题、模板、区块、账号权限和内容模型。先阅读adaptation中的逐类型结论并保存页面适配计划：ready_to_attempt_draft表示可尝试草稿，不是已经写入；permission_required需权限；tool_not_supported/connector_not_supported不能冒充可执行；needs_verification/unknown继续取证。contentTypes可指定最多8种类型，大字段schema从返回证据文件读取。普通建页不要求安装配套插件，更不要求安装或更换主题。

需要预设产品/案例模型且站点没有相应能力时，可按需使用Octopus Site能力插件；用户在WordPress后台安装插件ZIP后再wpReadSite检测。已有CPT/ACF模型优先沿用，不默认覆盖。此插件不提供主题，不控制站点设计。不要在聊天索要应用密码。

## 内容与结构

先保存企业事实、来源、缺失资料、目标市场和站点页面表。标准建议：首页、产品目录、案例目录、关于、联系、文章；根据企业实际需求调整，不填假认证/客户证言/参数。

1. wpRead list分别检查page、oct_product、oct_case已有内容，分页查重；更新读最新内容和modified_gmt。
2. wpRead schema取得真实字段和模板选项。产品固定字段meta：oct_model、oct_material、oct_moq、oct_lead_time；案例：oct_industry、oct_outcome。字段目前为文本，保留单位。已有ACF站点其他模型继续用原ACF导入流程，不替换其结构。
3. 图片先上传真实媒体。wpCompilePage编译原生blocks方案；wpWriteContent的type可为page/post/oct_product/oct_case，业务参数用meta，不复制到正文声称实时绑定。字段能否在前端动态展示取决于用户当前模板是否绑定字段；必须检测与验证，不能因字段写入成功就声称页面展示完成。
4. 创建产品/案例目录page时使用`{"type":"catalog","postType":"oct_product","perPage":9}`或oct_case；它是原生Query循环，已发布产品更新后自动出现在目录。不要把一批静态产品卡片当动态CMS。查询默认按时间倒序，第一版目录不含筛选控件。
5. 页面标题由title提供，正文从H2开始。选择landing等模板必须来自站点schema。先建草稿，检查真实页面、导航、图片、窄屏布局、区块是否有效；草稿无权访问则报告待验。
6. 询盘入口优先经核验的联系页面/电话/邮箱；需要表单时使用WPForms技能与站点现有能力，未配置不得称表单可用或邮件送达。

## 四页草稿的执行与续建

每完成一页或一次预览，立即更新同一个任务进度文件：页面ID、实际状态、modifiedGmt、回执文件及版本、已检查的URL、未完成项和下一动作。续跑先读此文件和wpWorkflowStatus，只推进未完成项；不要重新执行已完成的主题发现、技能阅读和整批草稿检查。写入前仍须读取待修改页面的最新版本；未知写操作先核对回执。

wpRead content直接返回实际状态与正文；rawComplete=true表示这份正文完整，可直接检查，不必再次readFile同份JSON。rawComplete=false不能据截断内容下结论，按证据文件的固定version和nextOffset继续读取；不要反复读取offset=0。正文完整不代表ACF/meta等其他字段完整，所需字段仍从证据读取。草稿前端检查优先打开返回URL的预览，不为纯预览反复进入编辑器或点击保存；需要验证区块可编辑性时再进入编辑器。

标准首轮覆盖首页、产品页、关于我们、联系页。产品页先按适配报告选择已有产品模型；没有模型而用户只需要展示时使用普通page，并明确它不提供结构化产品CMS。不因缺少oct_product而阻止其他普通页面。

| 页面 | 最小内容依据 | 优先使用的原生区块 | 验收重点 |
| --- | --- | --- | --- |
| 首页 | 企业产品、目标客户、可证实的价值与询盘入口 | section、heading、columns、paragraph、button | 主标题不重复；产品和联系入口可达 |
| 产品页 | 产品名称、参数及单位、实际应用、图片资料 | heading、table、image、faq、button | 参数与资料一致；不把静态表格称为ACF动态绑定 |
| 关于我们 | 公司名称、业务范围、已核实的企业事实 | heading、paragraph、columns、image | 不虚构成立年份、工厂、认证或客户案例 |
| 联系页 | 经核实的邮箱、电话、地址或已有表单 | heading、paragraph、button、form | 邮箱电话链接正确；未实际发送测试就不称询盘送达 |

在任务文件维护页面表：逻辑页面、资料来源、内容类型、已有ID、拟用slug、实际URL、modified_gmt、写入/回读状态、桌面/窄屏/编辑器检查结果、待办。记录为本任务交付文件，复用现有工具回执，不另建执行状态机。

先分页查重，再逐页编译和保存有实际内容的draft，立即保存回执及ID。第一轮不插入猜测的站内路径；可以使用已核验邮箱或已有已发布联系页。全部得到实际URL后，读取各页最新内容和modified_gmt，补齐互链并以id+expectedModified更新。slug只是请求值，WordPress可能调整，链接以实际回执为准；不能把编辑器URL、带nonce的预览URL写入正文。

任务恢复时先读页面表与写入回执，读取已有ID核对状态；不要重新创建已成功的页面。未知写入先查证，不重发。任一页失败时保留已完成页面和待办，不宣称整站完成，也不为了清理失败而删除页面。更新与人工修改冲突时保留现场，重新读内容后决定合并。

草稿只有具备权限的用户可以预览，页面之间的草稿链接不代表匿名访客可访问。逐页打开真实预览，检查桌面与窄屏溢出、标题层级、图片、按钮目标，并在原生编辑器检查无效块。每项记录通过/失败/未验证及证据。缺少浏览器登录时保留待验，不能通过发布草稿来绕过登录。发布后重新读取实际URL并核对互链，草稿阶段的URL不作为永久链接保证。

此阶段创建的是四个内容草稿，不自动修改站点首页、全站菜单、页眉页脚或主题模板。用户要求整站上线时将这些列入后续实际配置与验收；正文内的导航按钮不等于全站菜单配置完成。

## 上线与站点设置

按明确发布目标把选定页面/产品发布；需要静态首页时先确认该page已发布。普通站点先wpReadSite source=native取得revision，再wpConfigureSite source=native带expectedRevision，仅填写需要修改的字段：siteTitle、description、homePage、postsPage。此工具不安装主题，不改URL/管理员/索引开关。已有文章页与首页不能相同。原生模式不要求配套插件；旧配套流程显式source=companion，两种revision不可混用。不自动从失败的原生写切换到配套写。原生revision只是客户端写前检查，不提供原子锁，存在并发窗口，写后仍要回读。

全站导航和页眉页脚先用wpRead operation=navigation、templates、templateParts分页读取证据，确认启用主题模板实际引用的导航ID和模板部件。对当前区块主题的简单导航，可用wpPlanNavigation生成局部替换计划：templatePart必须用证据里的完整ID，navigationMarkup复制原文唯一的完整导航片段，links填已发布pageId和目标语言label。计划会列出被替换内容和影响范围；若原导航使用ref，将转为此部件内联导航，原共享菜单记录不改，所有引用此部件的页面仍受影响。先检查并展示计划，再wpApplyNavigation传返回的plan文件与version。不要用猜测片段、手改计划文件或wpWriteContent写模板。

当前支持自闭合导航，以及仅含简单navigation-link/page-list的导航；复杂子菜单、搜索、社交区块、锁定或绑定导航保留为待办，不强制覆盖。应用前自动核对部件、主题与页面状态；过期重新规划，结果未知不重发。写入后访问实际引用此部件的页面，核对桌面链接、窄屏展开/关闭/链接可达性和编辑器有效性；contentMatches不能代替前端验收。无法确认部件引用时不宣称全站导航完成。

settingsMatch、contentMatches、metaMatches、templateMatches等回执须逐项检查。WordPress后台可对输入做规范化，API成功不能代替一致性。最终访问真实首页、目录、产品详情和联系页；确认字段修改能影响前端，导航去向正确。第三方主题/global styles覆盖可能改变品牌色呈现，需实际检查。

交付实际站点URL、内容ID与发布状态、安装组件版本、核验结果与待办。媒体/写入中断结果未知时，不重复提交同一操作。后续SEO研究/写作/发布继续使用已有DataForSEO和WordPress技能。日常维护无需切换Codex；自定义插件、复杂字段类型和服务器故障超出标准建站能力时明确说明。
