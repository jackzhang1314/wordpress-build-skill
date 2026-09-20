> 当前产品边界（用户纠正，0908）：浏览器扩展不捆绑主题，已撤下主题ZIP/下载/激活与专属品牌设置。建页沿用用户当前主题和模板；站点数据插件可选，普通建页不依赖它。下文首版主题交付是已撤回的历史阶段，不代表当前产品。

# WordPress 七项场景实施契约

2026-09-08（开工于09-07）· 方案，实施结果在文末追加。

## 范围与架构

遵循用户确认的七项：Gutenberg页面、ACF产品导入、媒体、WPForms、DataForSEO文章发布、Rank Math、SEO监测。不接第三方页面构建器。

当前基线主区 f30bcad，连接器与SEO工具属于未提交工作区。复用trusted chrome storage、ToolHost串行执行、SDK审批、FileStore和既有SEO数据工具。无Node/PHP在浏览器运行，无新增商业服务账号。

## 先研究再实施的结果

- 已读wordpress.ts、publishing-tools.ts、FileStore/import/table-file、builtin/catalog、runtime审批和transcript、相关测试。Zod官方fromJSONSchema类型可用于站点声明schema转换，半实验转换不替代服务器校验；失败即拒绝写入。
- 官方依据：WordPress REST pages/posts/media/types；ACF REST integration；WPForms REST/Abilities；WordPress Abilities endpoints；Rank Math MCP tools。具体链接见 ../research/wordpress-ecosystem-20260907/report-source.md。
- 原生块采用受控类型与固定序列化，不允许整页HTML冒充区块。引用图片必须对应站点真实媒体。
- 媒体输入必须是任务内固定版本的真实二进制；需补原始图片/PDF导入，保留PDF文本提取。
- ACF先OPTIONS读取字段约束，仅现有wp/v2内容类型；CSV/XLSX提取表格字段映射，验证整份来源，分批最多20条，稳定slug与远端ID防重，默认草稿。
- WPForms/Rank Math固定允许名单，实时读取声明的schema；读写分工具，写入强制审批，拒绝不存在或未开放能力，不支持任意PHP/通用端点执行。
- 所有外部写入先持久化操作状态，未知结果不盲重试。保存远端ID/回执，证据文件失败不导致重复创建。

## 模块计划

wordpress.ts负责固定站点REST传输；wordpress-blocks.ts负责区块编译；wordpress-workflows.ts负责内容与媒体、能力、产品导入；wordpress-tools.ts负责Agent工具封装；Skill包与连接器页提供入口。

## 验收

定向测试：凭据目的地、路径与schema、HTML注入、媒体字节与上传幂等、更新版本冲突、原生块、CSV映射/重复键/分批恢复、插件读写边界及拒绝后零请求。完成后types/lint/build和相关回归。
真实WordPress/ACF/WPForms/Rank Math站点未配置，不能宣称真实业务验收；真实块编辑器/前台呈现需专门验证。

## 实施结果（2026-09-08）

| 场景 | 当前产品实现 | 使用边界 |
| --- | --- | --- |
| 原生建页 | 产品、案例、FAQ和广告落地页等业务用途共用原生块Skill；实际支持heading/paragraph/image/button/group/shortcode/columns/column/table/details；3层容器嵌套、分区样式与模板选择 | 新布局样本18节点通过官方解析校验；不是全站主题构建器 |
| ACF批量产品 | Excel转换CSV；全表字段校验、固定批次预览、逐行持久回执、最多20条/批、草稿 | 现有CPT和REST字段组；稳定键查重含草稿；不批量覆盖既有产品 |
| 图文媒体 | 原始PNG/JPEG/WebP/GIF/PDF导入和multipart上传；alt、caption、特色图、正文引用 | 单文件10MB、导入合计12MB且受任务容量约束；PDF提取失败保留原件并写说明 |
| WPForms | 官方schema探测、创建表单、增加/修改字段、安全设置、shortcode嵌入 | 需要写开关与对应许可；通知/确认/第三方集成设置未开放，真实送达另验 |
| SEO文章 | 复用SEO文章工作室与DataForSEO；新图文Skill补媒体和原生块发布 | 数据费用沿用原确认机制；文章事实与发布状态需核对 |
| Rank Math | 读取设置/健康/robots/llms，7个固定设置写能力，写后get-settings证据 | 仅站点实际公开REST Abilities及schema支持字段；不执行任意PHP |
| SEO监测 | 复用既有有限次数计划、快照、暂停和设置状态列表 | 未调用用户实际付费API，不等于无限后台监控 |

入口：设置 → 技能 → 建站与页面优化（新增5项，含已有3项共8项）；所有技能共用设置 → 连接器 → WordPress。目录共37个活动Skill、SEO分类保持18个。详情中展示WordPress状态并可跳转配置；配置保存后可检测站点能力。

回执：写前持久化wpOperations，已知响应先落盘再回读；未知写入不重传。前置版本/已有键校验发生在提交标记之前。ACF预览哈希绑定站点配置、来源版本、映射、schema与批次，避免未预览写入。它是任务级防重，更新前修改时间检查不是服务器原子锁；跨任务并发仍需避免对同一内容同时操作。

验证：完整串行命令typecheck → lint → 11个测试文件119项 → build于00:19通过；本地设置预览已验证新5项、详情连接器跳转、配置按钮与排版。Gutenberg官方库@wordpress/blocks15.27.0、@wordpress/block-library10.5.0，10个节点isValid全部true，见[结果](../research/wordpress-ecosystem-20260907/gutenberg-block-validation.json)。验证库仅装在临时目录，不增加产品运行依赖；此前临时包安装版本不匹配失败，最终匹配版本完成校验。

当前源码位于主共享工作区codex/agent-workspace-sandbox，未形成独立交付SHA；构建和本地预览已更新，未替用户重载Comet/Chrome扩展。真实WordPress/ACF/WPForms/Rank Math凭据未配置，未创建线上内容或发送询盘，因此站点端到端验收待配置后完成。公开SEO仓库仍保持先前发布，本次5个WordPress包未推送GitHub，可从产品Skill详情下载。

## 下一阶段研究：页面布局与样式

用户进一步要求Gutenberg页面样式开发，已完成[页面设计Agent方案](../research/gutenberg-page-agent-20260908/方案.md)。0908布局阶段已实现多列、分区样式、主题设计档案、编译计划和模板选择；局部块修改仍待实施。复用共享WordPress连接器和已有建页Skill。

## 完整建站架构方案

[WordPress原生区块AI建站完整架构方案](../WordPress原生区块AI建站完整架构方案.md)纳入用户确认的CPT、ACF、区块主题及共享连接器。0908首版已实现固定B2B业务插件、区块主题与原生字段绑定；任意模型、复杂字段与完整部署升级仍待扩展，详见下文。

## 页面布局阶段（2026-09-08T01:24:28.349347+08:00）

新增wordpress-design.ts：wpReadDesignProfile探测活动主题、core区块注册、页面模板OPTIONS和主题默认样式；wpCompilePage递归核验媒体/表单、检查已注册区块并保存完整计划。403/404等标记unknown，网络失败不伪装成功。读取不包含用户全局样式覆盖，不代表编辑器上下文允许全部区块；浏览器渲染仍须验收。

编译器支持最多3层容器嵌套、300节点、120000字符；section.style使用6位HEX色、0–160px内边距和0–80px圆角。columns为2–4列，指定宽度必须全部给出并合计100%。table最多40行12列且等列数；faq为core/details。模板值必须匹配实时schema枚举；回执增加templateMatches。未知POST与版本检查行为沿用原契约。

Skill包含6个可编辑组合（首屏、优势、参数、应用、FAQ、询盘）；占位文字须替换，不伪造素材ID/链接。5个旧WordPress包保留固定版本，活动目录不增加重复项。现有写入确认流程复用，新增2工具只读。

本轮types/lint、7文件85项及build通过；未做真实站点验收或用户扩展重载。主区953ba652外未提交增量，无独立交付SHA。[过程记录](../../process_docs/0908-019_WordPress页面布局阶段验收.md)；[官方解析结果](../research/gutenberg-page-agent-20260908/layout-block-validation.json)。

## 浏览器Agent独立建站首版（2026-09-08T01:56:12.677989+08:00）

产品目标：用户只用浏览器Agent完成已有WordPress上的标准外贸展示站建设与运营；Codex可选，不是依赖。[实施方案](../research/browser-wordpress-site-20260908/浏览器Agent独立建站实施方案.md)，[安装说明](../../wordpress-site/README.md)。

- 配套插件octopus-site v0.1.0：oct_product/oct_case、分类、原生字段/ACF表单；GET/POST octopus/v1/site为固定受限接口，GET需edit_posts，配置需manage_options，主题切换另需switch_themes与显式activateTheme。模型版本1，纯文本字段，字段值实时绑定。
- 区块主题octopus-trade v0.1.0：14模板/部件、theme.json设计系统、原生Query归档、产品/案例字段绑定。默认安装不改主题、不导入演示数据。现有主题保留；换主题数据仍在。
- 两个工具wpReadSite/wpConfigureSite，总计12工具；通过selectTools选择wordpress组。配置需要expectedRevision，只支持标题/描述、已发布首页/文章页、品牌色、激活已安装自有主题；写后回读和未知POST不重放沿用既有机制。option更新非原子事务，不提供自动回滚承诺。
- wpWriteContent增加自有CPT、实时meta schema验证、productCategories/caseIndustries真实ID与metaMatches；catalog块查询真实已发布内容并提供分页，多目录ID独立。其他已有ACF模型继续原导入流程。
- wordpress-site/build.mjs用已有fflate生成ZIP、manifest与SHA256；scripts/build.mjs打入dist/wordpress-site。配置页提供下载与检测。首次上传ZIP在WordPress后台完成；无需用户本地运行Node或Codex。
- 原生建页Skill包含references/site-setup.md；活动技能仍37，历史包保留。设计档案的完整schema进入证据，工具内联紧凑摘要，避免上下文耗尽。

最终types/lint、10文件145项、build通过；正式ZIP在WP6.9.7/PHP8.3.31/ACF6.8.9安装与18项服务器测试通过。前端入口/HTTP下载/ZIP校验，以及实际示例窄屏与FAQ通过。主区378367f外未提交、dist已更新，用户扩展未重载、真实站点/真实模型整站端到端/表单送达未验收。详见[阶段记录](../../process_docs/0908-028_浏览器Agent标准外贸建站首版交付.md)。

本轮修正与验证见[撤回记录](../../process_docs/0908-030_撤回浏览器扩展捆绑WordPress主题.md)。

## 现有站点检测与适配（2026-09-08T02:19:53.427778+08:00）

wpReadDesignProfile现在统一返回主题/区块摘要与adaptation。可选contentTypes最多8种；默认页/文章加有界现有类型。wordpress-assessment.ts将账号能力、类型能力和OPTIONS schema对照，区分ready_to_attempt_draft、permission_required、needs_verification、tool_not_supported、connector_not_supported、unknown。只读探测，无POST，不要求配套插件。

报告标明创建与发布权限、媒体上传权限、正文/ACF/meta字段、模板枚举和可用写工具；OPTIONS可读不证明可写。字段摘要12项/组、模板50项，完整数据和行动方案在证据文件。没有模板枚举时当前写工具只沿用默认/已有模板；自定义类型没有工具适配时先做内容方案，不能强行改模型。前端动态绑定与视觉检查始终待验。

最终types/lint、7文件92项、build通过；WordPress6.9.7真实API数据（无配套插件）验证页/文章可尝试草稿。主区4fc1e7b外未提交，未重载用户扩展；不等于客户站点建站端到端验收。[方案](../research/browser-wordpress-site-20260908/现有站点适配实施方案.md)；[过程](../../process_docs/0908-036_现有WordPress站点检测与适配方案交付.md)。

## 四页草稿与浏览器验收（2026-09-08 02:35:17 GMT+8）

整站reference现在规定四页依据、页面表、先建draft再用回执URL补链、按id/expectedModified续建和桌面/窄屏/编辑器检查。缺少产品CPT时普通展示页仍可使用page，不声称具备动态CMS。正文按钮不代表全站菜单，草稿URL不保证发布后不变。

主共享工作区/目标 codex/agent-workspace-sandbox，核对HEAD f750d05 外未提交，无独立交付SHA。更新建页Skill四页编排、实际URL补链、回执续建和逐页验收。最终typecheck、lint、4文件39项与build全部通过；真实WordPress6.9.7无配套插件26项，真实Gutenberg44个有效区块、8组桌面/窄屏检查通过。dist已构建，未重载用户扩展或发布；不是客户站点/真实模型/扩展认证端到端验收。全站菜单、页眉页脚和发布仍待实际配置。

[验收证据与重现](../research/browser-wordpress-site-20260908/four-pages/README.md)；[过程记录](../../process_docs/0908-041_WordPress四页草稿与浏览器验收.md)。

## 原生设置与布局读取（2026-09-08 02:41:48 GMT+8）

wpReadSite/wpConfigureSite显式source=native使用官方settings，无需配套插件；省略source保持旧companion兼容，设置页的配套组件检测仍调用原函数。Skill优先native，两种revision不能混用，也不自动回退写。仅允许标题、描述、已发布首页/文章页，禁止相同页；写前版本及字段检查、回读和未知不重放复用既有流程。native revision是客户端检查，不提供服务端原子条件写。

wpRead新增navigation/templates/templateParts只读。navigation服务端分页；模板集合受连接器4MB响应限制，读取后本地按ID分页，search只筛选ID。证据保留选中项原始内容；空导航记录不表示没有嵌入导航。未开放模板写入、主题修改或导航绑定。

主共享工作区/目标 codex/agent-workspace-sandbox，核对HEAD f750d05外未提交，无交付SHA。原生站点设置与布局只读发现接入现有12个WP工具。typecheck、lint、5文件46项及build通过；无配套插件WordPress6.9.7真实REST处理19项通过。dist已构建，未重载用户扩展、未发布、未操作客户站点。导航与模板写入/绑定尚未实现，不代表整站配置完成。

[方案与官方来源](../research/browser-wordpress-site-20260908/原生站点设置与导航适配方案.md) · [真实REST结果](../research/browser-wordpress-site-20260908/native-settings-result.json) · [过程](../../process_docs/0908-043_WordPress原生设置与布局读取交付.md)。

## 简单导航精确修改（2026-09-08 02:54:09 GMT+8，覆盖此前布局仅只读边界）

wpPlanNavigation读取当前区块主题部件原文、已发布站内页面及可能的共享导航，生成固定版本任务计划；会话保存最多20个计划hash。wpApplyNavigation读取未篡改本任务计划，重读全部依据后仅POST目标部件content，复用wpOperations和统一审批/回读。14个工具按wordpress组加载；新源码wordpress-navigation.ts，受限双斜杠部件ID路径由wordpress.ts适配。

只支持自闭合navigation或简单navigation-link/page-list子块；替换唯一片段之外的原文保持不变，保留导航布局属性。ref转为部件内联，不修改原共享菜单；所有引用该部件的页面仍受影响。锁、绑定、复杂内容拒绝。客户端写前校验仍有竞态；部件写入不能证明前端正在引用它。

主共享工作区/目标codex/agent-workspace-sandbox，最终核对HEAD90f0bdd外未提交，无独立交付SHA。新增导航计划/应用，WordPress按需工具现14个。最终typecheck/lint通过，6文件82项回归通过，独立候选output/builds/wp-navigation-0908构建通过。实际WordPress默认页眉写后回读、10个Gutenberg有效块、桌面/手机与菜单开关/产品链接跳转通过。本轮最终候选未交付dist、未重载用户扩展或发布，不代表客户站点/真实模型/扩展认证端到端通过。

[证据与重现](../research/browser-wordpress-site-20260908/navigation/README.md) · [过程](../../process_docs/0908-047_WordPress简单导航精确修改交付.md)。

## 扩展真实HTTPS验收（2026-09-08 03:10:56 GMT+8）

主区/目标codex/agent-workspace-sandbox，40be38e外未提交、无交付SHA。产品82项/types/lint/候选build通过，新增辅助TS最终types/lint通过。独立候选已实际装载到测试Chrome，真实HTTPS应用密码连接、四页草稿写入回读通过；modelRun=false，隔离模型API未配置，真实Agent端到端待用户配置后继续。未覆盖dist或重载用户扩展。

验证使用生产连接器HTTPS及真实应用密码，非上一阶段模拟HTTP。仅诊断页调用生产工作流，尚无自主模型规划。隔离DNS/证书只属于开发机测试，不是用户运行依赖。详见[结果与续验说明](../research/browser-wordpress-site-20260908/e2e/README.md)。
