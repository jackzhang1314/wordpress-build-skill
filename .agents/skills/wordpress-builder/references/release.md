# 新站发布与后续迭代验收

当前公网目标仅 Hostinger Managed WordPress，按 [Hostinger 部署规范](hostinger.md) 区分首次发布、后续更新及远端验收。当前参考站的真实首次部署已验证，通用远程部署执行器尚未完成；本文的内容发布门禁不等于托管部署。

整站发布验证下列全链路；本方案建成站点的局部维护按影响范围验证，不能为小改动重复要求全站发布。project-record 的 release 回执不触发发布，也不替代本节门禁。

发布证据保存在任务目录，禁止把凭据、完整表单个人信息写入公开仓库。记录：

- 实际站点、核心/PHP/插件版本、HEAD 与未提交变更摘要；主题/插件文件哈希。
- 资源 ID/地址、模板所有权、内容更新前后指纹、字段映射及数据库迁移记录。
- 桌面与手机截图、浏览器错误、链接状态、编辑回显测试，以及各项 pass/fail/not-tested。
- 表单 UI、服务器记录、通知捕获、真实收件分别列状态。实验室拦截 wp_mail，不向演示邮箱外发。
- 代码与数据恢复快照、恢复步骤、实际演练结果。

询盘的四层证据、运行数据快照与隔离恢复，以及版本相关注意事项见 [验证与经验沉淀](verification.md)。

硬失败：PHP fatal、脚本模块解析失败、菜单不可用、主 CTA 404、必需表单缺失、表单失败却显示成功、数据编辑不回显、明显横向溢出、模板所有权冲突、发布版本与验收证据不一致。视觉评分不能抵消这些失败。

CLI build --publish 必须带 --evidence FILE。它校验连接/计划、精确页面集合、内容指纹与证据文件 SHA-256，并要求必要检查 pass。表单仅在任务确实无需表单时可写 not-applicable 并说明依据。此门禁不自动执行浏览器测试，不证明远端代码和本地文件天然一致；主题部署另做哈希核对。底层 buildSite 库调用方也必须执行 verifyPublication，不能绕过 CLI 声称门禁已通过。未实现的能力写 not-tested，不能写 pass。内容写入结果未知按日志恢复，不自动重发；文件同步成功只表示部署完成，重启与浏览器复验后才算验证完成。

目录引用面向可安装 Skill，不依赖仓库外 docs/14 等路径。可选设计 Skill 不在环境中时，使用本目录 design.md 的规则继续，不声称已读取不存在的能力。


## Evidence JSON

`identity` 从任务 task.json 取得；`planHash` 使用同一任务保存值。`pages` 必须覆盖计划中的所有实际页面；`fingerprint` 使用 read-page 返回的 releaseFingerprint。它忽略发布状态、时间和首页 URL 的合法变化，以允许中断后继续；正文、标题、模板、媒体变化会失效。

```json
{
  "identity": "<64位任务连接哈希>",
  "planHash": "<64位计划哈希>",
  "reviewedAt": "2026-09-19T22:00:00+08:00",
  "environment": {"wordpress":"实际版本","php":"实际版本","theme":"实际主题"},
  "checks": {
    "navigation":{"status":"pass","evidence":"菜单打开、关闭、Escape 与焦点返回的记录路径"},
    "primaryLinks":{"status":"pass","evidence":"全部主按钮实际目标和状态码记录路径"},
    "forms":{"status":"pass","evidence":"提交记录及本地通知捕获证据路径"},
    "editing":{"status":"pass","evidence":"字段图片正文编辑回显的记录路径"},
    "responsive":{"status":"pass","evidence":"桌面手机断点与溢出检查路径"},
    "visual":{"status":"pass","evidence":"当前版本截图与视觉评审记录路径"},
    "recovery":{"status":"pass","evidence":"快照和隔离恢复验证记录路径"}
  },
  "files":[{"path":"相对此证据文件的截图或源码路径","sha256":"<实际字节SHA-256>"}],
  "pages":[{"id":123,"fingerprint":"<read-page.releaseFingerprint>"}]
}
```

不预填通过状态：示例说明格式，只有完成对应验证后才可替换为真实证据。代码、截图和内容变化后重新审查。

## 本地验收与线上验收的划分

本地可完成原生 PHP/Web Server 部署、真实 MySQL 导出与隔离恢复、SMTP 测试邮箱收件、容器重建持久性和完整页面视觉评审。不要一概标为“只能生产验收”。具体方法见 verification 中“本地也可以验收生产技术链”。真实公网基础设施和真实邮件投递则绑定实际目标环境；本地验证结果保留其适用范围。


## 正式公开交付的搜索质量门槛

按 [search-quality.md](search-quality.md) 与 [seo.md](seo.md) 附逐页证据，至少覆盖首页、分类、详情、方案、About/联系、文章等实际页面类型。误留全站 noindex、重要内容仅为空壳、主要内链不可发现、错误 canonical、伪造产品/企业证据、无价值规模化页面等应修复后再标为正式交付；预览站按预览策略保留限制。

这些是总编排的人工/工具联合交付门槛。当前 `build --publish` 的 Evidence JSON 未增加 SEO/内容质量自动校验字段，不把这里的要求写成 CLI 已自动实现。可在现有任务证据目录保存补充报告并引用；缺失检查记录 not-tested，不伪造 pass，也不等待排名出现才完成本地技术验收。

## 增量更新：数据库模板覆盖门槛

更新区块主题前列出当前主题的 wp_template、wp_template_part 和全局样式覆盖，比较源码变更范围。后台保存的模板优先于对应主题文件：文件同步既不删除后台修改，也不保证新文件布局可见。不能自动删除全部覆盖来强制更新。

有冲突时保留后台版本，输出受影响模板及引用页面；根据本次授权明确选择保留、合并或重置。重置前备份对应对象，验证正文/ACF/图片/询盘均未丢失。模板文件更新测试与数据库迁移、远端传输、部署中新增询盘分别验收，不合并为一个笼统 pass。

参考仓库可运行 npm run test:starter:template-update：只在本地 reuse 实验站创建唯一测试产品、模板文件和数据库覆盖，验证文件被遮蔽、显式重置后新文件可见、产品字段和已有询盘保持及清理。它不连接生产，不代表模板部件、全局样式、媒体和完整增量部署都已验收。

参考仓库新增只读命令：`npm run starter:update-preflight -- templates/product-standard.html parts/header.html theme.json`。参数必须为实际变化的主题相对路径；检测当前主题已发布的模板/部件/全局样式数据库对象，只输出 ID、路径和哈希，命中对应路径返回退出码 2。空输入拒绝，不把“没传路径”当通过。当前适配器仅面向本地 reuse 实验站，不是 Hostinger 远端发布门禁；全局样式仅做 theme.json 级保守冲突提示，不做属性级合并。无冲突也不证明 CSS/动态块/插件变更不影响页面，仍需页面回归。

自动差异模式：`npm run starter:update-preflight -- --compare BEFORE_THEME AFTER_THEME`。对两个完整区块主题目录逐文件 SHA-256 比较，纳入新增/修改/删除，自动提取模板、部件和 theme.json 路径；拒绝符号链接及缺失主题标识文件。输出双方清单哈希和变更列表，CSS/PHP 等变化要求页面回归。输入目录必须分别对应实际部署基线和候选产物；该命令不自动证明基线就是线上版本。无差异不是发布授权，报告始终 releaseApproval=false。模板部件/全局样式的冲突扫描已用本地 WordPress 数据夹具验证，尚非两者的完整视觉合并测试。
