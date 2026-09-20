# 0919-006 P2 批次清理与 Playground 坑记录

- 时间：2026-09-19 18:35 Asia/Shanghai
- 触发原因：用户要求继续清审计遗留项。

## 完成

1. 字体 license 文件（Fira Code / Fira Sans / Ysabeau Office，SIL OFL 1.1 归属）。
2. `Tested up to: 7.1` + theme.json schema wp/7.1。
3. 卡片缩略图显式 `loading="lazy"` + `decoding="async"`（归档/分类/首页三处）。
4. `.tl-fx-media-placeholder` 无图占位组件 + 5 处卡片 else 分支。
5. Cases 页 `paginate_links` 分页。
6. 搜索页卡片标题污染修复：`.tl-main .wp-block-post-title` 收窄为直接子级选择器。
7. footer 撤销 shortcode 动态年份方案 → 无年份版权行。

## 新发现并记录（docs/16 §6）

1. `render_block_core_shortcode` 在 WP 6.9 只做 `wpautop` 不做 `do_shortcode`——模板部件内 shortcode 块原样输出；生产修复一行 filter，本次改静态文案规避。
2. **Playground worker 文件系统快照**：运行中 rsync 后部分请求命中启动时快照旧文件；模板部件改动必须整进程重启。
3. Playground 进程会静默退出；会话式启动保活 + deploy-lab 工作流已含重启。

## 调试过程要点

footer 字面量输出排查历经：REST part 检查（无 DB 覆盖）→ shortcode 注册验证（true）→ render_block 过滤器埋点（发现 core 只做 wpautop）→ SQLite 直查（确认无 DB footer 覆盖、post 16 是蓝图残留 TT5 footer）→ 整进程重启仍未生效 → 判定为 worker 快照行为，止损改静态文案。

## 验证

10 条路由 200；footer 干净无字面量；搜索卡片标题不再吃大标题样式；`npm test` 23/23。

## 遗留

i18n 包装、ACF 字段名前缀迁移、pattern 内联样式收敛、ready_to_ship 字段——维持记录待真实站点。

## 追加：经验沉淀进 Skill（同日）

- 新增 `.agents/skills/wordpress-builder/references/theme-code.md`：模板优先级/首页特例/DB 覆盖、文档壳与 ABSPATH、title-tag、可移植路由、ACF helper 与 REST 图片语义、CSS/对比度/a11y 纪律、WP 6.9 shortcode 部件行为、分层部署与 Playground 三坑、交付前检查清单。
- SKILL.md：描述更新（自由 HTML 模板 + 预览门 + 分层部署）；阶段 3 补 ACF 必装与 REST 图片语义；阶段 5 接入 theme-code 基线与重启验证；阶段 8 接入检查清单。
- design.md v3 / content.md：ACF 图片字段实测语义、v3 演进记录。
