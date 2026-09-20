# DataForSEO 共享连接器

官方 API 文档：https://docs.dataforseo.com/v3/ ，API 凭据入口：https://app.dataforseo.com/api-access 。仅填写 API Login / API Password。凭据保存在扩展受信任的本地存储，不放入 skill.json、技能正文、模型提示词或公开示例。

Live 查询通常按请求与返回项计费；OnPage 抓取按任务和选项计费。单次列表默认有界，显式分页会增加请求。JS 渲染、Lighthouse、Backlinks 权限和费用以服务最新条款/账户为准，不在技能中写死价格。连接测试仅说明账户接口可用，不代表全部数据产品已经获权。

现有宿主：普通查询最多20种独立请求/任务；关键词最多20个/次；列表最多100/页；SERP 固定桌面前十；全站抓取最多1000页；监测最多30次、间隔至少60分钟。监测确认授权整个有限计划，次数上限不是美元硬预算。跨多个国家需分别查询并保持口径。

官方接口：

- https://docs.dataforseo.com/v3/backlinks/domain_intersection/live/
- https://docs.dataforseo.com/v3/on_page/task_post/
- https://docs.dataforseo.com/v3/on_page/summary/
- https://docs.dataforseo.com/v3/on_page/pages/
- https://docs.dataforseo.com/v3/on_page/force_stop/
- https://docs.dataforseo.com/v3/on_page/lighthouse/live/json/

DataForSEO Labs 的估算不是 Google Search Console 实际点击；Backlinks 变化是供应商索引观测，不保证现场变化；Lighthouse 是实验室测试，不替代 CrUX。返回空数组不意味着没有搜索量、没有外链或页面未被索引。
