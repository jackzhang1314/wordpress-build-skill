# Rank Math 免费版单一 SEO 实现

时间：2026-09-20 08:10:50 GMT+8（Asia/Shanghai）。

用户授权替换当前 SEO 插件，随后明确不兼容历史数据和旧插件。本轮将区块样板主站及复用测试站统一为 Rank Math Free 1.0.278，停用并移除旧插件，没有执行历史数据导入或保留旧插件适配。旧源码实验版本未删，不参与当前新站实现。

主要文件：plugin/seo.php、content/rankmath.php、scripts/start.mjs、scripts/seo.mjs、scripts/rankmath-check.mjs；同步 Skill SEO 规范、入口、分发说明、项目 AGENTS/README 与架构文档。

实测修正：命令行 activate 后需要账户跳过初始化；原生区块画布重复 title；rewrite 需在初始化后的新请求刷新；测试作者地址改为当前 WordPress 输出。修复后两个实例集成检查、11 类 SEO URL 和 sitemap 子地图均通过；后台 Rank Math 面板与 Snippet Editor 可用。标题描述 meta 写入与前台回读通过并恢复。lint/build/diff-check 通过，证据位于 docs/acceptance/rankmath-free/。

未覆盖：本轮未重新建立全新容器、未上线、未测实际 Google 收录。预览 noindex 已恢复。后续按新安装脚本做最新版干净安装复验，无需增加旧插件兼容层。
