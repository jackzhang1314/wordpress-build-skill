# 现有运行基线与可复用参考

## 原生区块代表页骨架（新增）

`assets/block-starter/theme/` 与 `plugin/` 已随构建生成，详见 [骨架使用说明](../assets/block-starter/README.md)。仓库真源为 `examples/b2b-block-starter`，不是在旧 HONGDA 上覆盖主题。已用两个独立空数据库验证设备样板与泵产品小样；实测 WordPress 7.1 / PHP 8.3.33 / MySQL 8.4.11 / ACF 6.8.9 免费版，Fluent Forms 6.2.9；当前区块方案统一 Rank Math Free 1.0.278，已替换旧 SEO 插件且无旧数据导入/适配。

已验证：两套产品模板、分类布局后台选择、ACF 后台保存和原生正文/主图编辑数据保存、官方 acf/field 的 Query Loop 回显、Pattern 插入、响应式导航、本地 SMTP 询盘，以及代表 URL 的 SEO 检查。正文/主图使用编辑器数据接口和实际 Save 按钮验收，未将它写成完整媒体选择器鼠标操作。泵小样仅证明干净安装/模型复用，不是完整行业站。

仍需按项目完成全部页面设计、品牌与真实内容、路由/导航适配、目标主机部署及恢复。发布包不包含演示数据库、seed 或实验 SMTP。模板中示例网址在子目录安装时需适配；CLI content-plan 尚未提供完整多模板选择接口。

## 经典 PHP 运行基线（保留）

新站规划默认见 [architecture.md](architecture.md)：原生区块主题与 CPT/ACF、原生模板、必要 PHP 动态模块组合。下述另一套随包可复制源码为经典 PHP 模板层级 + theme.json + 原生正文编辑 + 独立业务插件，作为功能基线保留。不要把此目录宣称为已完成的区块 starter。

区块主题适用于 Codex 创建模板、运营仅选择布局和填字段的场景，不以要求拖拽设计为前提。需要快速复验既有 PHP 基线时仍使用下列源码。电商、会员或应用型需求另评估；区块原型的代表性通过不替代完整新站交付。

## 随包源码

`assets/php-reference/theme/` 是普通经典主题，包含首页、产品、分类、文章、归档、搜索和 404；`assets/php-reference/plugin/site-model.php` 是独立 CPT/分类/ACF 模型。

复制到新项目后，按 Brief 修改品牌、命名空间、字段、模板和样式。插件目录内的参考数据模型仅有 material/finish 两个示例字段，不是所有行业的固定字段。使用 ACF 免费能力，标题、摘要、正文和特色图保留原生数据源。字段 schema 在插件 PHP 中维护，内容值不进 Git。

主题的导航由后台菜单管理，站内页面使用对象菜单项。询盘入口在外观 → 自定义 → Site links 选择页面，保存页面 ID 后通过 permalink 生成链接，页面 slug 修改不需要改模板；小屏保持可见且可换行，参考站不依赖隐藏菜单脚本。联系页由原生正文/shortcode 承载选定表单，业务插件不绑定表单引擎。参考站选用 Fluent Forms 和 The SEO Framework，只是这一组实测组合，不是总编排强制品牌。

这些文件不会自动创建管理员、内容、表单或改写数据库。插件停用不删内容；主题没有 schema 注册职责。现有版本仅包含初始 schema，后续字段改名或值转换需要项目专用升级步骤并验证重复运行。

## 仓库验证

仓库提供 `npm run reference:serve` 从全新数据库启动本地参考站，端口 9463；依赖已安装的 ACF、Fluent Forms 和 The SEO Framework 文件。默认插件根 `.lab/wordpress/wp-content/plugins`，可通过 `WP_TEST_PLUGINS_PATH` 指定。缺依赖直接报告，不静默安装到客户环境。

运行 `npm run test:reference` 验证实际 CLI 字段/图片写入、正文编辑、分类字段、路由、分页、搜索、404、SEO 标记、页面改名后的链接和业务插件重新启用后的内容保留。该测试会修改自己新建的参考站数据，只允许 loopback 9463。

服务器每次启动创建新环境，停止后不承诺数据库持久化；私有证据在 `.lab/reference-*`。`test:reference` 使用最近成功启动流程生成的连接信息，不能把它当作客户站部署器。浏览器编辑、表单成功/失败、邮件本地捕获需要单独验证。不要把本地捕获当作收件人已收到邮件。

Playground 实测版本和源文件哈希见仓库 `docs/acceptance/0920-reference/`。正式部署仍需目标 PHP/MySQL、邮件服务、缓存与备份恢复验收；运行参考站不能自动证明这些环境兼容。

## 已观察到的编辑器限制

在本轮 WordPress 7.1.1 / ACF 6.8.9 中，产品字段位于编辑器的 Meta Boxes → Product details，初次打开可能折叠。测试时其点击区域被调整高度的分隔条遮挡，键盘聚焦后 Enter 可展开并正常保存；不能仅看 REST 字段可写就判定编辑体验合格。交付时应实际检查运营账号的字段可见性，并说明如何打开面板。

编辑器还出现 global-styles 进入 iframe 的警告；前台未观察到脚本错误，字段/正文保存成功，但该编辑器样式警告仍保留为待复核项，不通过删除 WordPress 样式规避。
