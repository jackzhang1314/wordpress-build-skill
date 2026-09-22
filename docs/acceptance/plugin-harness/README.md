# 插件基线接入 Harness

2026-09-20，Asia/Shanghai。用户要求把必要插件的安装、配置作为建站初始流程，并保持新站方案简单、不兼容旧插件。

## 本轮落地

- config/wordpress-plugins.json 是必装依赖、版本、来源和配置职责的唯一安装清单：ACF Free、Fluent Forms Free、Rank Math Free、项目业务插件。
- start.mjs 改为调用 scripts/plugins.mjs；官方目录插件使用固定版本，ACF 使用厂商固定下载地址，项目业务插件使用本地源码。缓存/包版本不符停止；全部版本校验后才激活，保存 plugins.json 回执。
- 表单仍由既有 content/form.php 按项目生成和绑定，Rank Math 由 content/rankmath.php 初始化。没有新增兼容插件或旧数据导入器。
- plugins-check.mjs 对当前两个实例只读核对版本、唯一基线、字段/CPT/分类、表单 ID/字段/通知开启、Rank Math 初始化/模块和 noindex。发布前的邮件、防垃圾、备份恢复与性能是独立验收要求，不等于又必须装四个插件。
- 清单随构建复制到 Skill assets/plugin-profile.json；Skill 插件 reference、AGENTS、项目和架构/上手说明已接通入口。

## 验证

- inventory.json：9490 与 9491 全部基线插件及基本配置通过，分发清单与源清单相同。未对站点进行升级或重新 seed。
- tests/plugin-profile.test.mjs 三项测试通过：依赖缺失/失活/版本漂移/额外激活插件拒绝，来源与固定版本选择，错误版本在激活前停止及非法清单拒绝。
- npm run lint、npm test（38 项）、npm run build、git diff --check 通过。
- 本轮未重新创建空白容器。安装分支通过依赖注入测试，现有两个实例通过真实只读验收；不能报告为新安装流程已完整从零复跑。

版本是当前验收基线，并非最新版本或安全状态保证；生产前核对厂商更新并测试后调整清单。第三方包来源/版本检查不等同于密码学文件完整性检查。现有收件/Mailpit 证据见之前站点报告，不因本轮清单通过而重新宣称生产送达成功。
