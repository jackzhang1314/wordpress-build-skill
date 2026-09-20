# 四页草稿验收

日期：2026-09-08，工作区未提交增量。

## 已验证

- WordPress 6.9.7，原有Twenty Twenty-Five主题，无Octopus配套插件。
- 当前产品serializer生成测试用区块，经真实REST处理创建联系、产品、关于、首页四个草稿；实际URL补链，回读及匿名隔离共26项通过。
- 真实Chromium登录WordPress：四页原生编辑器44个区块有效；1440与390像素共8组真实预览，单一主标题、正文互链、横向溢出检查通过。已查看首页桌面及三页窄屏截图。
- 连接器组合测试另外验证wpCompilePage→wpWriteContent→持久化恢复→四页按ID补链，创建数量始终4。该层使用模拟HTTP，不能称为真实认证端到端。

## 产品行为

site-setup Skill明确企业事实、四页内容依据、现有模型选择、页面表、逐页草稿回执、实际URL补链和中断续建。普通page无需配套插件。工具和运行状态继续复用既有实现，没有新增建站执行引擎、主题包或客户本地依赖。

## 验收边界

这是隔离测试资料，不是客户网站或设计成品。没有运行真实模型自主规划、扩展HTTPS应用密码端到端、真实企业图片上传、ACF动态模板、表单送达或发布。主题自带菜单与页脚未配置；截图中的Sample Page与默认页脚链接明确保留为待办。验证了页内链接目标，不意味着全站导航完成。

## 重现

开发环境需现有esbuild、官方wp-playground-cli与agent-browser；均非产品用户依赖。

1. 在仓库根运行 node wordpress-site/tests/prepare-four-pages.mjs /tmp/独立输出目录。
2. 运行wp-playground-cli server，参数 --wp=6.9 --php=8.3 --port=9415 --workers=6 --define-bool AUTOMATIC_UPDATER_DISABLED true --define-bool DISABLE_WP_CRON true --blueprint=/tmp/独立输出目录/blueprint.json --mount-dir /tmp/独立输出目录 /artifacts。只对隔离测试站禁用自动更新，避免维护模式干扰。
3. 通过agent-browser独立session登录测试站后台，然后运行 node wordpress-site/tests/check-four-pages-browser.mjs /tmp/独立输出目录 session名称。
4. 读取four-pages-result.json与browser-result.json。PHP结果必须所有passed=true，浏览器报告必须四页完成且passed=true。

## 证据

[服务器结果](four-pages-result.json) · [浏览器结果](browser-result.json) · [首页桌面](home-1440.png) · [首页窄屏](home-390.png) · [产品窄屏](product-390.png) · [关于窄屏](about-390.png) · [联系窄屏](contact-390.png)
