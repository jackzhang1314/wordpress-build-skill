# Sites Status Remote/Local Custody Correlation

- 时间：2026-09-26 19:50–20:01 CST（+08:00）
- 触发：用户确认继续下一项优先级，为 Hostinger 账号与本地项目建立可读的 custody inventory。
- 版本：WordPress Builder `2.21.0`

## 变更

新增命令：

```bash
node wordpress-builder.mjs sites status --root /absolute/path/to/projects
```

也支持 `--projects-root` 同义参数。未显式传路径时按常见布局依次尝试 `WORDPRESS_PROJECTS_ROOT`、仓库兄弟目录 `projects` 和 `wordpress-projects`。

输出内容：

1. Hostinger 远端 domain / user / order / enabled / website type；
2. 每个域名关联的本地 `project.json` 路径；
3. `mode` 与 `sourceProfile`；
4. 远端 inspection 记录的 active theme，缺失时显示本地 configured theme 并明确标注；
5. SSH 配置是否存在；
6. 最近备份 manifest；
7. 最近 `.deploy-state.json`；
8. remote inspection 的 fresh / stale / unknown / invalid 状态；
9. `unique` / `unmatched` / `ambiguous` 匹配结果；
10. local-only 项目与无效 project 文件。

## 设计边界

- 只读：不写 Hostinger、WordPress、本地项目或 SSH。
- 未匹配远端站点不猜测本地归属。
- 一个远端域名对应多个本地项目时标记 `ambiguous`，不自动选择其中一个。
- 备份和部署信息只读取与当前 `project.domain` 匹配的 manifest/state，避免项目换域名后显示错误历史。
- discovery 最多向下 3 层，并跳过 `.git`、`node_modules`、`.backups`、theme/plugin/content/evidence 等非项目目录。

## 实现

- `harness/lib/site-status.mjs`
- `harness/cli.mjs`
- `harness/lib/command-map.mjs`
- `tests/harness/site-status.test.mjs`
- `tests/harness/skill-suite.test.mjs`
- Setup Skill 与使用文档同步更新。

## 验证

单元/回归测试：

```text
node --test tests/harness/site-status.test.mjs: 3/3 pass
npm run typecheck: pass
npm run lint: pass
npm test: 215/215 pass
```

真实账号：

```text
remoteCount: 7
matchedRemoteCount: 5
unmatchedRemoteCount: 2
ambiguousRemoteCount: 1
localProjectCount: 6
localOnlyProjectCount: 0
invalidProjectCount: 0
```

`yellow-koala-142147.hostingersite.com` 正确显示为 `ambiguous`：

1. `hello-elementor-e2e`：旧 source/custom 测试项目；
2. `hello-elementor-external`：当前 external/custom adopted 项目。

这证明命令没有为了输出“好看”而隐藏重复 custody。后续需要用户决定是否归档或重命名旧 source 测试项目；本任务不自动删除。

## 遗留

- `sites status` 目前不逐站执行远程 `project inspect`，以保持账号级命令快速且只读；需要刷新某个站点时继续执行项目级 `project inspect`。
- 尚不支持一次命令扫描多个项目根目录。
