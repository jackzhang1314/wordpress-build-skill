# HONGDA 原生 WordPress 新站实施

时间：2026-09-20T03:05:23+08:00（Asia/Shanghai）。

触发：用户明确参考 Cloudflare 网站的样式、信息架构和页面布局，同时必须使用既有 WordPress AI 建站方案、整套 Skill 与技术规范，并授权开始实施。

主要工作：在 `examples/hongda-wordpress/` 新建独立业务插件、PHP 混合主题、theme.json、ACF 免费字段和原生正文；构建首页、设备归档/分类/详情、行业归档/详情、About、联系主题、文章及 404。沿用官方插件、Playground 与 Blueprint 工作流，执行能力完整性校验、官方识别、运行 PHP 解析、实际内容创建/回读；导入 19 产品、5 分类、11 行业、9 文章及企业/联系子页。独立 9464 环境不复用原数据库，不发布 Cloudflare。

关键文件：站点源码 `examples/hongda-wordpress/`；启动 `scripts/hongda-site.mjs`；集成回归 `scripts/test-hongda-site.mjs`；本地兼容和回执 `scripts/fixtures/hongda/`；证据集中 `docs/acceptance/0920-hongda/`。README 与 Skill 的逐页策略/编排识别边界同步更新。

验证：TypeScript typecheck、项目 lint、diff 检查；真实运行环境 PHP 解析；页面路由及内容回显；桌面/手机 12 项布局；真实后台 ACF 编辑保存；询盘必填与产品引用校验、实际入库及本地通知。实际详细数字、源码哈希与最后状态以集中验收文档及 JSON 为准，不把早期失败覆盖为通过。

遇到的问题：Playground CGI PHP_SELF 引起 404 重定向，修正在本地 fixture；隐藏产品 ID；清理本新建实例的安装默认文章/页面；修正主图测试断言。官方识别脚本有启发式误判，保留报告并以运行 WordPress 的主题类型为准。WordPress/ACF 编辑器仍有非阻断 iframe 样式告警。浏览器脚本早期超时及最终隔离验证记录均保留。

遗留与下一步：本次是可操作的设计预览，真实品牌素材、企业/规格/认证事实、生产邮件送达、MySQL、备份恢复及正式发布仍待完成。运行服务每次启动创建新数据库，不能把预览数据库当长期内容资产。没有提交、推送或正式部署。

最终阶段结果：80 次路由请求、15 项功能检查、12 项布局检查通过，32 个站点文件与运行副本一致。后台编辑与询盘证据完成，五个本地编排阶段已记录，发布 pending。预览地址 http://127.0.0.1:9464/ 已发送到 Codex 浏览器面板（工具返回 queued）。
