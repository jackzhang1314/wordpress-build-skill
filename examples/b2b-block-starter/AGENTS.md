# B2B 区块新站样板

本目录是代表页面与干净安装验收项目，不是现有 HONGDA 的原地迁移。继承仓库约定，按下列实际归属开发。

- 编排入口：[wordpress-builder](../../.agents/skills/wordpress-builder/SKILL.md)。主题使用官方 wp-block-themes，业务模块使用 wp-block-development/wp-plugin-development，Patterns 使用 wp-patterns，按需加载。
- 主题：theme/；业务插件：plugin/；受控演示内容：content/；本地环境与验证：scripts/。产品模型是设备示例（hd_product、hd_category、hd_solution），其他行业必须调整模型与 Brief，不能把重量字段当作所有产品的通用属性。
- 原生区块主题与两套产品模板；ACF 免费字段，优先官方 acf/field 服务端绑定；业务动态块归插件，分类布局字段与分派归主题。不引入 Elementor。
- [项目说明与验收边界](README.md) 是本项目真源。质量与 SEO 按总 Skill 对应 references 执行。所有示例数据和图片只用于演示，不代表真实规格、认证或商业承诺。
- 从仓库根运行 `node examples/b2b-block-starter/scripts/start.mjs` 启动两套全新数据库（端口 9490、9491；本地 Mailpit 9492）。端口被占用时不重跑、不停止无关服务。私有 .lab/b2b-starter-latest.json 保存本项目容器与凭据；不可公开。
- 从仓库根运行 `node examples/b2b-block-starter/scripts/check.mjs` 做 REST/前台检查；该脚本对独立本地样板短暂修改数据并恢复。浏览器验收使用 Playwright CLI，新版证据放 docs/acceptance/b2b-redesign/，旧证据保留。
- 修改后同步仅更新本项目容器中的主题/插件，不重置页面正文或删除 Site Editor 覆盖。检查源码与数据库模板覆盖再判断前台是否生效。
- 实测版本从私有运行目录 artifacts-*/runtime.json 读取，不把 Docker 标签当版本证据。预览 noindex；不得为通过 sitemap 测试把预览长期改为公开索引。

- 全站设计先读 DESIGN.md：区分产品目录、应用目录、采购指南与公司页面的任务，不把每页做成相同卡片墙。导航、首页内嵌询盘、产品弹窗必须在实际浏览器验收。
- scripts/design.mjs 是模板与两篇演示页面布局的生成源；同步修改生成源与输出。content/redesign.php 仅限受保护的 9490 演示内容重建，不进入客户包。
- 数据变更测试和最终截图串行执行；截图等待字体和导航动画完成，检查真实截图后才能评价设计。每次交付注明实际源码清单，不把旧的通过证据归给新版本。

- 新站 SEO 固定使用 Rank Math Free。业务 SEO 规则仅对接 rank_math 公共 hooks；不引入旧 SEO 插件兼容层或数据导入器。content/rankmath.php 是隔离预览的初始化配置，生产项目按真实内容配置同样规则。

- 插件来源/版本只维护根目录 config/wordpress-plugins.json；start.mjs 经 scripts/plugins.mjs 安装四项必装依赖，版本不符在激活前失败。`npm run test:starter:plugins` 检查现有环境，不重建、不升级、不重置配置。
