---
name: wordpress-builder
description: 用 Codex 连接 WordPress，把企业资料建成原生区块页面，预览后发布并配置首页与简单导航，支持任务恢复和改动核验。
---

# Codex WordPress 建站

使用本 Skill 目录的 `scripts/wp.mjs` 调用独立 WordPress 工具。命令为 `node "<本 Skill 绝对目录>/scripts/wp.mjs" ...`。若文件缺失，在本项目根目录执行 `npm ci && npm run build`；不要调用资料快照中的扩展构建脚本。

先阅读 [执行接口](references/runtime.md)。需要整站任务时阅读 [建站与验收](references/site-workflow.md)。历史 `selectTools/wpRead/wpWriteContent` 是另一个宿主的接口，不在 Codex 里直接调用。

1. 从当前用户任务确定建站范围、目标语言、企业事实、素材及发布授权。会话已有授权持续有效，不按每页重复确认；缺失业务事实标记待补，不编造认证、客户或性能参数。测试企业必须明确标注为示例。
2. 连接从环境读取 `WP_URL`、`WP_USERNAME`、`WP_APP_PASSWORD`，可选 `WP_REST_URL`。不要输出密码、读取无关应用凭据或写入计划。`doctor --task <目录>` 读取实际账号权限、主题、区块及内容模型。保留当前主题；不能把 unknown 当成不支持。
3. 沿用本次任务文件。先检查 `status` 及已保存回执，找下一项未完成操作。新任务读取现有页面以避免覆盖，按真实主题设计页面，写入带来源文件的计划。当前批量 build 面向新页面；已有同 slug 页面会拒绝创建，不能换 slug 偷绕。
   素材使用upload-media上传已确认的本地图片/PDF，再用实际mediaId建图像块。不要把测试截图或生成图冒充企业实拍；图片要检查真实加载和alt。参考[素材说明](references/media.md)。
4. `build --plan <文件> --task <目录>` 创建草稿并用实际 ID 补齐内部链接。`page:key` 只用于计划内页面引用。计划一经执行固定，恢复使用相同文件和目录；改稿先read-page取得指纹，使用page-edit-plan生成完整前后稿、审阅后page-edit-apply。编辑计划会替换整个正文，输入需保留无关内容；不能删任务目录重建。局部包含未适配区块的复杂页面先研究保留方法。
5. 使用可用浏览器工具登录并检查真实草稿：桌面与 390px、原生编辑器有效块、单一 H1、图片、按钮、横向溢出。API 成功不能替代截图和编辑器检查。保存具体检查结果、页面版本及截图路径。存在问题先修复再发布。
6. 已授权发布时执行同一命令加 `--publish`，工具只改变状态，保留正文，并设置站点标题、描述和首页。导航使用 `template-parts` 中的真实 ID 和唯一导航原文生成 `navigation-plan`；审阅影响后在既有授权范围执行 `navigation-apply`。它影响所有引用该模板部件的页面。
7. 检查已发布前台、首页、导航的实际链接与手机菜单开关。交付真实 URL、ID、状态、证据目录，以及仍未验证的业务要求。表单创建不等于邮件送达，静态产品表格不等于 ACF 动态绑定。

产品、案例或批量导入任务阅读 [内容模型与导入](references/content.md)。先用 content-type 读取实际 CPT/字段，再 content-plan/content-apply；字段更新可保留完整原文。CSV 用 import-plan/import-apply 创建草稿，固定源文件与稳定键。不要为使用工具擅自重注册客户内容模型或安装测试插件。meta 段落绑定与 catalog 原生查询均需真实前台验证。

结果未知时读取操作记录和远端状态，不重复 POST；已收到响应但回读失败，重复相同命令只继续回读。锁冲突须先核对 owner.json 中的真实进程；不能仅凭文件时间删锁。

当前工具完成度以本仓库验收记录为准。CMS/ACF 文本字段、原生字段绑定与 CSV 草稿导入已有隔离站实测；复杂 ACF 字段、产品模板设计、复杂页面局部编辑、表单送达和 SEO 插件写入仍需后续实现或具体适配。继续推进完整任务，同时明确具体缺口。
