---
name: seo-performance
description: 结合云端 Lighthouse 实验室检测与 CrUX 现场数据，给出有证据的优化清单。
---
# 性能与体验诊断

先按需读取 references/seo-api.md 的实际工具合同，来源与修改说明见 references/seo-sources.md。本技能运行于本浏览器 Agent，不需要终端或 MCP。

1. 明确目标 URL、移动/桌面和测试范围；dataForSeoResearch lighthouse 获取实验室报告，记录测试时间、设备、版本、实际审计项目与分数。
2. 需要真实用户数据时用 seoFieldPerformance 读取 CrUX 移动端及采集周期。无数据就标缺覆盖，不以 Lighthouse 替代；不同设备、时间和聚合范围不能直接相减。
3. 从实际返回的 LCP、CLS、INP 或实验室相关指标区分用户体验和诊断代理。实验室 TBT 不叫真实 INP；过时 FID 不冒充当前现场指标。
4. 结合浏览器截图和实际资源/布局，对图片、字体、脚本、缓存、渲染阻塞、主线程提出具体改动；没有资源证据不猜测最大的阻塞脚本。
5. 输出 performance.md，分实验室、现场、缺失与建议四类；修复后用相同配置复测，现场数据有聚合窗口，不能立即宣称真实用户 CWV 已改善。
