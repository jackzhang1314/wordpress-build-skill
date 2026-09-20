# HONGDA 从安装包到运行数据恢复

2026-09-20 04:39 Asia/Shanghai，本轮 [总结果](run-6trctG/summary.json) 为 passed，范围是本地新站。

执行 `npm run hongda:e2e`，在独立 9466/9467 环境跑通以下链路，完成后进程已停止；既有 9464/9465 不改动。

| 检查 | 实测结果 | 证据 |
| --- | --- | --- |
| WordPress ZIP 安装 | 主题和业务插件正常安装，20 文件 SHA-256 一致 | [安装](run-6trctG/package-install.json)、[清单](run-6trctG/package-manifest.json) |
| 核心与内容维护 | WP 7.1.1 / PHP 8.3.32；80 次页面请求、15 项检查通过，含 Skill CLI 写入与安全重放 | [运行](run-6trctG/runtime.json) |
| 浏览器询盘 | 4 个必填错误、无效产品拒绝、成功提交；新增 1 记录及 1 本地通知 | [询盘](run-6trctG/enquiry.json) |
| 数据恢复 | 58 个已发布内容对象、95 个 ACF 字段、30 个上传文件、1 条询盘一致；原快照哈希不变 | [恢复](run-6trctG/recovery.json) |

询盘截图为示例数据，不包含客户真实信息。数据库、应用密码和备份留在 `.lab` 私有目录，不放进此证据目录。公开交付 ZIP 只含主题/业务插件代码，位于 `output/hongda-delivery/release-ilMgoi/`；内容、第三方插件、环境配置另行管理。

代码配套检查：typecheck、lint、35 项测试、build、10 个官方模块哈希校验及 Skill quick_validate 通过。自动执行器在本轮运行中补充了 package-manifest 的自动落盘动作，本轮清单以同源复制补齐并重新通过 eslint；没有因此重跑业务写入。版本/文件证据绑定此次安装和内容源码，不把检查结果扩展到未来修改。

未覆盖：用户视觉认可、正式企业资料审核、生产邮件送达、生产 MySQL 部署与恢复，以及第二套不同 Brief 的完整交付。当前完成“本地可重复功能闭环”，不宣称已完成生产发布或优秀视觉设计。
