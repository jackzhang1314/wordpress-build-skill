# Hostinger 远端只读预检闭环

时间：2026-09-22 00:06 +08:00（Asia/Shanghai）。
触发：本地 ①②③ 闭环后，用户确认继续远端接入，从只读操作开始。

## 主要工作

- 新增 `scripts/hostinger/remote-preflight.mjs`（npm run hostinger:remote-preflight）：远端只读冲突检测——读取 `.wordpress-builder/hostinger/` 私有状态（用户/域名/管理员凭据，零输出）、官方 CLI 采集远端主题基线（旧报告自动按日期归档）、`deriveBaselineChanges` 离线派生变更、testcookie 登录 + `admin-ajax.php?action=rest-nonce` 取 REST nonce、`context=edit` 盘点 `wp/v2/templates`/`template-parts`/`global-styles` 覆盖（仅 source=custom 且 publish 记为数据库覆盖）、与派生路径求交得冲突。
- 主守卫按 0921-05 教训用 `pathToFileURL(...).href` 比较，import 不触发副作用；`restOverridesToPaths` 导出供离线测试（tests/hostinger-remote-preflight.test.mjs）。
- `scripts/hostinger/theme-baseline.mjs` 只读 CLI 调用加三次指数退避重试（仅瞬态网络错误：deadline/TLS handshake/connection reset 等），遵循 0920-024「只读操作有界重试」惯例。

## 实际失败与修复

1. 首跑 CLI 在 Hostinger OAuth 端点 context deadline exceeded，二跑在文件内容读取 TLS handshake timeout——均为远端 API 网络瞬态故障；curl 复测连通后确认非认证问题，加有界重试后第三轮整跑通过。
2. lint 报 `URLSearchParams`/`setTimeout` 全局未定义（本仓库 eslint 配置不认），分别改手动 encodeURIComponent 与 `node:timers/promises`。
3. 调试期间输出中带出 hpanel 用户名（非凭据），后续避免在错误输出中回显私有状态字段。

## 验证结果

- 真实站（mediumblue-quail-505146.hostingersite.com，主题 b2b-equipment）实跑通过：33 远端文件、31 文本验证（2 字体二进制未验）、派生变更 0、数据库覆盖 0、冲突 0；全程零写入，报告无凭据命中（grep 校验 0）。证据 `docs/acceptance/template-update/hostinger-preflight.json`，旧基线归档 `hostinger-baseline-20260920.json`。
- 全量 `npm test` 68/68、lint、`git diff --check` 通过。

## 遗留问题与下一步

- 远端 REST global-styles 列表不可用（globalStylesViaRest=false），theme.json 数据库覆盖远端检测仍是缺口；二进制文件与模板/部件之外的数据库覆盖同样未覆盖。
- 冲突检出后的远端处置（keep/reset/restore 写路径）需经既有 cron/WP-CLI 机制或 REST 写接口，下一步设计并演练；基线时效在远端同样成立（发布前需重采）。
- 共享工作区继续按 0921-03 约定保持未提交。

## 同阶段追加：经验回写盘点（应用户要求）

时间：2026-09-22 00:12 +08:00。用户明确：所有沉淀经验必须回写 skill/harness/playbook。逐轮核对 0921-06~09 的回写完成度，补齐缺口：

| 经验 | 回写位置 | 状态 |
| --- | --- | --- |
| 基线快照/自动推导、换行归一化、未验二进制语义 | release.md | 0921-06 已写 |
| keep/reset/restore 语义、删除前哈希复核、整批拒绝、theme.json 拒处置 | release.md | 0921-07 已写 |
| 更新窗口询盘保留演练语义 | release.md/ARCHITECTURE.md | 0921-08 已写 |
| 远端只读预检流程、CLI 只读有界重试（仅瞬态网络错误）、rest-nonce 获取、REST 覆盖判定语义（source=custom+publish）、global-styles 缺口、错误输出禁回显私有字段 | hostinger.md「远端只读冲突预检」 | **本轮补齐** |
| 传输辅助函数字符串透传防双重编码（含插入成功但查询落空的案例） | verification.md「每轮迭代怎样沉淀」 | **本轮补齐** |
| 清理验证用独立可靠键（数字 id），禁复用可能损坏的查询键 | verification.md | **本轮补齐** |
| node:test assert.throws 用正则 | verification.md | **本轮补齐** |
| 维护任务路由（更新前先只读预检） | SKILL.md「按目标选择流程」第 3 条 | **本轮补齐** |
| 防复发机制化：CLI 重试在 theme-baseline.mjs、主守卫在 remote-preflight.mjs、覆盖映射测试 tests/hostinger-remote-preflight.test.mjs | 脚本/测试 | 已落 |

私有 GitHub 仓库（0921-03）暂为快照副本，本轮 reference/SKILL 更新是否同步推送由用户决定，未自动推送。
