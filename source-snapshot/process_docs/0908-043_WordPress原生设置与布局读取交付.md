# WordPress原生设置与布局读取交付

时间：2026-09-08 02:41:48 GMT+8

触发：原生站点设置模块与真实REST验证完成。

主共享工作区/目标 codex/agent-workspace-sandbox，核对HEAD f750d05外未提交，无交付SHA。原生站点设置与布局只读发现接入现有12个WP工具。typecheck、lint、5文件46项及build通过；无配套插件WordPress6.9.7真实REST处理19项通过。dist已构建，未重载用户扩展、未发布、未操作客户站点。导航与模板写入/绑定尚未实现，不代表整站配置完成。

## 主要工作与关键文件

- wordpress-site.ts：wpReadSite/wpConfigureSite增加source=native，连接原生settings API；旧默认companion与设置页组件检测兼容保留，不自动回退写。只允许标题、描述、已发布首页/文章页。读取设置和账号权限，revision绑定连接身份与原生状态；写前检查、schema字段开放、写后回读、未知不重发。
- wordpress-workflows.ts：wpRead navigation为服务端分页；templates/templateParts为集合读取后本地ID排序分页，search仅筛选ID，避免无效服务端分页。正文工具仍不能写这些类型。
- wordpress-tools.ts及site-setup.md/api-guide.md：描述和Skill按需显式native，导航必须区分独立记录、嵌入布局与实际引用。无新增主题、插件或用户本地依赖。
- tests/wordpress-workflows.test.ts：新增3项原生设置/权限/schema/版本/已发布页面/回执缓存/固定只读路由测试。
- wordpress-site/tests/native-settings.php：真实服务器19项，可通过Playground runPHP Blueprint重现。

## 研究与边界

官方settings支持5个所需字段，因此不再要求用户安装配套插件才能设置首页。模板API不支持page/per_page，按官方模板文档调整本地分页。真实站点navigation返回0，但有7个template-parts，空导航记录不意味着没有菜单。原生revision是客户端乐观检查，官方API没有服务端原子条件写，仍存在并发窗口；配套模式已有服务端revision检查保持。

## 文档与后续

已更新模块、架构增量、PROJECT_STATUS与合并清单；方案位于docs/research/browser-wordpress-site-20260908/原生站点设置与导航适配方案.md，结果同目录native-settings-result.json。下一步是解析现有模板中的嵌入/引用导航并适配有明确目标和版本保护的修改；真实客户Agent和发布验收尚缺。
