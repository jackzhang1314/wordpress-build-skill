> 用户纠正后的当前决定：撤回捆绑自有主题的设计。浏览器扩展提供通用连接器与Skills，沿用用户主题；站点数据插件可选。下文自有主题打包/激活/品牌设置属于已撤回的首版方案，不能作为实施指令。

# 浏览器 Agent 独立完成标准外贸建站：实施方案

2026-09-08；状态：先研究与设计，再实施。此前页面能力不能视为完整建站交付。

## 产品目标与范围

普通用户只使用浏览器扩展和已有WordPress后台，完成标准B2B产品展示站建设与运营；不安装Codex/Node/PHP本地工具。开发者用工程工具维护发行包，用户通过WordPress后台安装ZIP。主机、域名采购及从零开服务器不属于WordPress连接器；需要另行主机连接器。

首个可交付闭环：连接已有站点→检测环境→取得配套主题/插件→后台安装→复查能力→企业资料与网站规划→创建原生页面/产品/案例草稿→浏览器预览→发布明确选定的内容→设置首页与品牌→回读并检查真实站点。已有网站不默认换主题。

## 研究依据与选择

- WordPress原生REST支持内容/媒体/模板读取，不是任意主题文件部署服务：https://developer.wordpress.org/rest-api/reference/themes/
- 原生插件安装API的slug指WordPress.org目录，不应伪装支持自有ZIP：https://developer.wordpress.org/rest-api/reference/plugins/
- 自定义内容类型应放在插件，保留主题切换后的数据：https://developer.wordpress.org/plugins/post-types/registering-custom-post-types/
- CPT的REST与编辑器必须显式开启：https://developer.wordpress.org/rest-api/extending-the-rest-api/adding-rest-api-support-for-custom-content-types/
- ACF可通过代码声明字段组，字段值可编辑，结构定义属于版本化代码：https://www.advancedcustomfields.com/resources/register-fields-via-php/
- 原生Block Bindings读取show_in_rest字段；无需为简单文本引入ACF PRO动态块：https://developer.wordpress.org/block-editor/reference-guides/block-api/block-bindings/
- Playground可以在浏览器/隔离开发环境运行WordPress，用于验收，不等于用户正式站点部署：https://developer.wordpress.org/playground/

不建立任意PHP执行端点、不让模型逐次生成并上传未知服务器代码。业务插件提供版本化固定模型和有限站点设置；更复杂模型后续增加正式版本。WordPress官方注册、字段和权限API承担核心工作。

## 架构与接口

1. 浏览器Skill：升级现有WordPress建页入口，增加标准站点初始化流程和公开可下载安装包。避免重复Skill入口。
2. 共享连接器：保留站点/用户名/Application Password；增加仅octopus/v1/site固定路径适配。无独立密码配置。
3. WordPress配套插件octopus-site：注册oct_product与oct_case、产品分类和行业分类；固定字段模型；原生post-meta REST；检测ACF存在时提供同一字段的后台表单；ACF未装时仍可原生编辑字段，明确模式。
4. 区块主题octopus-trade：theme.json、首页/页面/单篇/产品与案例/归档/搜索/404模板、页头页尾；原生Query和Post Content承载动态内容。品牌色通过有限设置覆盖，禁止自由CSS输入。所有业务数据存插件，不随主题删除。
5. 工具：wpSite读取或配置受控站点设置，写操作必须进入既有写入确认；wpWriteContent扩展自有CPT与meta字段。wpRead site保留旧站点发现。
6. 动态数据：使用core/post-meta绑定paragraph的content；元字段变化后前端重新渲染，不把静态占位文字声称实时数据。缺权限/未登记字段不得写入。
7. 发行包：源码仓库中维护wordpress-site/plugin与theme；开发构建ZIP并随浏览器扩展资源提供下载入口。首次安装使用WordPress已有后台上传流程；当前浏览器执行器若不能上传本地文件，交付明确的后台安装步骤，不声称自动安装成功。

## 写入与恢复

站点设置需要manage_options；切换到已安装自有主题额外要求switch_themes，并由用户明确选择。设置请求带expectedRevision；服务端核对当前站点状态。选首页必须是已发布page。配置字段仅站点标题/描述、首页/文章页、品牌色及指定自有主题激活；不改URL、管理员账号、索引开关或第三方主题代码。写后回读；未知POST沿用不重放规则。

产品/案例编辑沿用modified_gmt与写入回执；字段类型由实时schema核对。回执区分内容/字段/模板一致性与浏览器视觉验收。

## 验证与交付门槛

先封闭工具schema上下文预算回归；保留完整运行时校验，工具声明采用紧凑输入结构。复跑失败的Harness测试，禁止增加预算掩盖问题。

实施后跑types/lint/相关测试/build；对实际WordPress隔离站点验证插件激活、REST权限、CPT/字段、动态绑定、主题渲染、配置冲突/回读和卸换主题数据保留。现有主题站点不能被自动切换。隔离站点与客户真实站点验收分开记录；不能用mock代替服务器运行证据。

每个里程碑更新process_docs、WordPress模块、架构、主状态和合并清单。源码、安装包、扩展构建、实际用户加载/安装版本分别记录。
