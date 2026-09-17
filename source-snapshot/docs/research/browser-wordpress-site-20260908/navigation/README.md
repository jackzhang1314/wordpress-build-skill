# 简单导航精确修改验收

2026-09-08，工作区未提交实现。

## 使用

通过WordPress建页Skill选择wordpress工具组，wpRead templateParts读取现有主题部件原文。wpPlanNavigation指定部件完整ID、唯一原文导航片段及已发布页面ID/标签。检查返回计划、移除内容和影响范围后，wpApplyNavigation使用固定版本计划文件。随后浏览器验收真实引用页面。

- 支持自闭合navigation和仅含navigation-link/page-list的简单菜单。
- 所选片段之外的原文保持不变；保留导航布局属性。ref菜单转为部件内联导航，不改原共享菜单记录；所有使用此部件的页面会受影响。
- 共享菜单原内容会读取进计划，应用前再次核对；模板、主题或目标页面URL/状态变化也会停止。
- 复杂子菜单/搜索/自定义块/锁/特殊绑定拒绝。客户端核对仍存在服务端并发窗口。
- 模板部件修改不等于已绑定到所有模板。不能把此能力说成任意页眉页脚重设计。

## 实际验证

默认Twenty Twenty-Five页眉，沿用原布局、标题和手机overlay属性；生产replaceNavigation函数生成局部变换，真实WordPress REST写入并回读完全一致。站点Gutenberg解析10个区块全部有效，1440/390像素无横向溢出、四个链接匹配。真实点击手机菜单打开、关闭，再点击product跳转nav-fixture-product成功。

本测试使用隔离站点中新建的已发布测试页，原四页草稿保留。测试资料非客户内容。连接器计划、文件hash、过期拒绝、POST恢复等由独立模拟HTTP回归覆盖；本次不是浏览器扩展应用密码或真实模型端到端验收。

[结果与原文差异](result.json) · [桌面](navigation-1440.png) · [手机](navigation-390.png) · [手机菜单展开](navigation-mobile-open.png)

## 重现

先按four-pages/README.md建立新的隔离Playground站点并用独立agent-browser session登录，再执行 node wordpress-site/tests/check-navigation-browser.mjs /tmp/四页夹具目录 session名称。该脚本只允许127.0.0.1测试站；只对新鲜默认自闭合导航运行，不盲目覆盖上次修改。脚本验证读写/布局，手机菜单开关与链接跳转需按实际快照点击检查并保存证据。
