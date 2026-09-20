# HONGDA WordPress 本地阶段验收

范围：用户指定参考站的视觉、信息架构和布局，使用既定 PHP 混合 WordPress 架构重建。当前为本地设计与内容预览，尚未正式发布。

## 已实现

- 独立业务插件：19 个产品、5 个设备分类、11 个行业方案、ACF 免费版结构化字段及关联关系。
- 专用首页、产品归档/分类/详情、行业归档/详情、公司介绍、联系、文章及 404 模板。
- 公司介绍 7 个子页、联系主题 7 个子页、9 篇原生文章。参考内容待事实审核。
- 成熟表单插件实际提交与留存；隐藏产品 ID 在服务端检查为已发布产品，联系页显示对应名称。
- WordPress 附件、菜单、编辑器正文、ACF 字段；未使用参考站 React bundle、聊天账户或联系去向。

最终本地回归：80 次页面请求、15 项功能检查、12 项桌面/手机布局检查通过；后台 ACF 保存回显与询盘链另有独立证据。源码与运行副本核对 32 个文件。编排 discover/model/theme/content/verify 已记录，release 保持 pending。

## 证据

- `runtime.json`：实际版本、对象、逐路由状态、单文档/H1、分页、重量筛选/空结果、Skill plan/apply/readback 和安全重放、正文/主图回显、联系页按 ID 跟随改名、源码与运行副本哈希比对。
- `browser-layout.json`：6 类页面 × 1440/390 宽度；无横向溢出、无失效已加载图片、无 pageerror，移动菜单键盘可打开。截图为 home/product/about 两种宽度。
- `editor.json`、`editor-acf.png`：真实 WordPress 后台 ACF 型号编辑保存、前台回显和恢复；正文与主图的本轮修改回显通过 REST 验证，未冒充后台逐项点击测试。
- `enquiry.json`、`enquiry-validation.json`、`enquiry-simple.json`、`enquiry-receipts.json`：四项必填错误、无效产品返回 423、有效提交返回成功、数据库 1 条记录（产品 ID 11）、本地捕获 1 条通知。没有外部邮件。
- `triage-plugin.json`、`triage-theme.json`：原始官方启发式报告，存在漏识别/误分类；以实际运行证据纠正判断，没有改 vendor。

## 遇到并处理的问题

1. 本地 Playground CLI 3.1.52 将 PHP_SELF 设置为请求路由，WordPress 对未匹配路由清除了 404 并重定向首页。已在独立 lab fixture 中针对实际执行 index.php 修正 CGI 变量，保持 REQUEST_URI 不变；主题和业务插件没有该补丁。当前 404 正常。
2. 初版询盘展示内部产品 ID；改为隐藏字段，并保留可读产品名称及服务端校验。
3. 初版继承了干净 WordPress 的 Hello world / Sample Page。现已仅将本实例的这两个安装默认对象移入回收站；seed 同步处理，不删除用户既有站点内容。
4. 早期主图断言误以为 WordPress 附件输出必有 wp-image-ID class；修为核对附件真实图像 URL，原生主图行为正常。
5. 浏览器首次询盘测试将多次校验连续放在同一个表单状态，等待响应超时；`enquiry-browser.json` 保留失败输出。随后分别重新加载验证必填、无效产品和成功路径，并以数据库/本地通知回读确认。另一次 URL 解析位于 CLI 沙箱报错，已改在页面上下文解析。

## 尚未覆盖

- 生产 MySQL、实际邮件送达、防滥用策略的生产配置、备份恢复、生产发布。
- 企业身份、工厂、认证、产品规格、服务政策的真实性核验；参考站原文不能代替企业材料。
- 品牌自有图片。当前为 6 张标注示意的 Wikimedia 照片，作者与许可通过来源 API 提取，站内 Image credits 可查看；展示裁切已声明。
- 编辑器出现 `global-styles-css-custom-properties-inline-css` iframe warning（上一参考站亦存在）；本轮 ACF 保存与前台回显通过，未通过屏蔽告警宣称修复。

本地 UI / 功能通过与生产上线通过不同。`release` 阶段保持未完成。
