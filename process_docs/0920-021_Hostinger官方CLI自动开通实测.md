# Hostinger 官方 CLI 自动开通实测

时间：2026-09-20T18:38:45+08:00（Asia/Shanghai）。本机时间与供应商响应中的 created_at 存在差异，各保留其来源，不用供应商时间覆盖本机记录。

触发：用户已购买 Unlimited，要求助手自动创建 WordPress，明确不应要求其去后台手动建站；提供了管理员邮箱。已有用户授权覆盖已购套餐内新建站点，未购买新服务或绑定正式域名。

## 完成

- Homebrew 安装 Hostinger 官方 CLI 3.35.0 / ae73453；当前可调用 MCP 列表没有 Hostinger。CLI 使用已有账户授权成功，未要求用户重复登录，也未读取/打印 API Token。
- 确认一个有效已购订单、原网站列表为空；生成免费临时域名，采用可用机房首选 boston，创建后查询实际站点。
- 安装 WordPress，随机密码保存私有 0600 配置；先查安装不存在，不传 overwrite=true，提交后查询有效实例。
- 实际 WordPress 7.1.1；HTTPS 首页与登录页 200，SSL active，HTTPS 跳转已开；后台 home/siteurl 均 HTTPS。通过实际 Reading 表单 nonce 将 blog_public=0，回读及前台 noindex/nofollow 确认。
- 证据 docs/acceptance/hostinger-onboarding/report.json；私有状态与管理员配置 .wordpress-builder/hostinger/，不提交。

## 经验与修正

更新 AGENTS 自动化优先规则；Hostinger Skill reference 沉淀八步开通流程、真实凭据字段、异步结果核验、营销名称/内部套餐名差异、列表 URL 与实际后台配置区别。此前“没有 CLI/未授权”和“先让用户手动创建”不再作为现状。

后台登录最初尝试序列化 CookieJar 失败（线程锁不可 pickle），随后使用标准 MozillaCookieJar 私有文件保存，完成实际设置。未重复 WordPress 安装。CLI 操作与后台设置是原生已授权操作，没有自定义站点代码改动；使用远端接口和 HTML 回读验收，文档差异检查。

## 遗留

这是自动开通空白 WordPress，不是本地 B2B 网站已部署。业务插件基线、自定义包部署、SSH、生产邮件、远端备份恢复未验收。后续需要适配远端 7.1.1，不能挪用本地 7.1 的全部验收结论。现有预览站和共享工作区未覆盖，未提交 Git。

## 用户追加要求：所有问题均保留记录

已加强根 AGENTS、客户 AGENTS 模板及 verification 规范：所有实际失败、阻塞、错误判断和用户纠正进入同阶段记录；验证后的通用方法才提升为规范，未形成结论仍保留待验证或项目特例。CookieJar 失败及标准私有会话保存方法追加至 Hostinger reference，避免只存在过程日志。文档检查通过，不重复运行无关网站测试。
