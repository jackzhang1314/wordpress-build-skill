# 原生区块代表页：整合与验收

日期：2026-09-20，Asia/Shanghai。源码：[独立项目](../../../examples/b2b-block-starter/README.md)，项目约定：[AGENTS.md](../../../examples/b2b-block-starter/AGENTS.md)。

## 本轮交付

- theme/ 原生区块主题、plugin/ 独立业务模型与 5 个动态区块；34 个源码文件通过构建进入 Skill assets/block-starter，manifest 记录哈希。
- 首页、产品分类、两套产品详情模板及联系页代表链路。两种产品布局共用原生字段和 ACF 数据，分类在后台选择 Catalogue / Introduction first。
- 官方 ACF acf/field 替代实验自定义绑定；新增可编辑 selection-guide Pattern、业务插件页面目标配置与 SEO 集成。
- 两个独立空数据库安装：9490 设备样板，9491 泵产品小样。泵样板是另一数据集的模型复用检查，未声称完整行业适配或独立新 Agent 从零完成。

## 证据与覆盖

| 证据 | 实际覆盖 |
| --- | --- |
| [functional.json](functional.json) | 两站路由、产品新建草稿/发布、两模板切换保持内容与 URL、官方绑定列表上下文、字段回显、分类布局、主站分页、PHP 解析、数据库模板覆盖数 |
| [browser.json](browser.json) | 实际模板选择、ACF 输入与 Save、首页正文和 Pattern 保存、分类编辑选择。正文/主图部分用原生编辑器数据接口和真实 Save，不冒充媒体选择器点击测试 |
| [screens.json](screens.json) | 1440/390 宽度的代表页、主标题、溢出/坏图、移动菜单；截图可检查布局，但不等于用户视觉评分通过 |
| [seo.json](seo.json) | 隔离 loopback 暂时切换公开索引设置：title/description/canonical/robots、结构化数据可解析、核心正文和图片、分页与筛选、sitemap 及分类子图；结束恢复 noindex |
| [enquiry.json](enquiry.json) | 4 项必填、无效产品拒绝、成功写入 1 条、本地 SMTP 通知 1 封；不是外部邮件送达 |

实测版本在 functional.json：WordPress 7.1、PHP 8.3.33、MySQL 8.4.11、ACF 6.8.9 免费版、Fluent Forms 6.2.9。SEO Framework 5.1.4。预览与 mock 保持 noindex；没有连接生产网站。

## 发现与修复

1. 原实验命名、主题中的业务区块及自定义绑定：整理为稳定 b2b-site 名称，业务块移到插件，复用官方 ACF 来源。
2. CPT 总目录缺 meta description：通过 SEO Framework filter 从同一 CPT 描述获取，页面亦显示该介绍。
3. 给 core 与 SEO 插件同时添加 robots 导致筛选页双标签：SEO 插件负责输出，core 仅作无插件回退。
4. SEO Framework optimized sitemap 设计上不含分类：样板改用核心 sitemap 模式，检查子图；无独立价值的 mock admin 作者归档 noindex。
5. docker cp 的路径 join 消掉尾部 /.，旧同步曾形成重复子目录：修正目录内容复制，清理仅由此次错误生成的重复目录，加入目标文件 hash 核验。
6. 测试使用旧草稿 URL、未解码 HTML 实体及继承移动视口：修正测试依据；保留失败说明，不把这些测试错误当作站点能力缺失。

## 未覆盖与下一阶段

- 不是完整商业站：行业、About、文章等尚未逐页设计与验收，示例导航/CTA 路由须按客户调整；子目录安装未验收。
- 视觉仅完成代表布局检查，未获得用户认可；mock 规格、图片不是供应商真实证据，不能直接用于正式对外营销。
- 免费 ACF 的前台绑定与字段保存已验收，不代表完整双向绑定 UI 或所有字段类型均通过。
- 编辑器仍出现 global-styles-css-custom-properties-inline-css iframe 加载警告；区块有效性与保存测试通过，不通过移除核心样式掩盖该警告。
- 本轮未重新执行整机文件/数据库/媒体灾难恢复、真实目标主机部署、外部邮件、Google 实际抓取或现场 CWV。前一轮基线恢复证据不能自动升级为本骨架完整恢复通过。
- 新客户 AGENTS 模板与本项目已接入；未开展另一个全新 Codex 任务的独立使用评估。现有 CLI content-plan 尚未增加原生多模板选择参数。

## 复验与安全范围

命令见项目 README。测试会短暂修改两套本地实验的模板、字段或索引设置，并在 finally 恢复；新建测试产品移入垃圾箱，询盘保留本地测试记录。源码同步不重置页面正文或删除用户模板覆盖。私有 .lab 指针、连接凭据、SQL 不进入此证据目录。
