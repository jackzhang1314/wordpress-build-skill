# 搜索页经验与证据边界

验证日期：2026-09-06；页面：Alibaba.com 中文界面，/search/page，SearchScene=proSearch，关键词 mini excavator。站点可能更新，这些是定位和排查线索，必须与当前观察核对。

## 搜索与筛选
- 首页「Search Alibaba」搜索框实际可为 textarea。依据 role/label 找输入，不限定 input 标签。
- 「更多筛选条件」是普通 div，分页页码是 span，可能没有 button/link 角色。新版 snapshot 提供 pointer/onclick 可点击候选。query 查询单一名称；用返回 ref 点击并观察弹窗，不能用旧 ref 或猜 ref。
- 本次真实截图确认弹窗中有两个不同的供应商选项，文字部分都只有「供应商」，Verified/Verified PRO 品牌部分是空 alt 图片：前者控件 domId=assessmentCompany-true，后者 domId=verifiedPro-1。先打开筛选面板，在同一弹窗确认这两个 checkbox 的 domId、role 和当前 checked，再使用此已验证映射；结构不符或仅找到相似文本时不要猜。DOM 标识不是任意图片 OCR 能力。
- Verified Supplier 要选前者，不能误选 PRO。setChecked 返回 verified 后仍要点「应用」。结果页面 URL 可能不变，检查列表刷新及再次打开弹窗时勾选状态。
- 之前失败原因：未实际打开更多筛选，单查 Verified 文本没有匹配，就错误声明不存在；不要复用这一结论。

## 同卡片关联
- 本次标题为 h2.searchx-product-e-title 下的 a，实际链接是 www.alibaba.com/product-detail/..._<商品ID>.html；跟踪参数不参与商品去重。
- 卡片内可能还有指向同一详情的评分、价格、图片链接。价格区与 MOQ 区相邻；供应商通常链接到独立公司 profile 页面。inspectPage/extractList 的结构与 links 用作字段证据，不能把不同卡片拼接。
- 不要求模型逐条复制。让 runJavaScript 读取批次 JSON，保存规范记录和核验结果；stdout 只返回计数与少量异常样本。脚本在运行前检查语法和运行环境，版本冲突要重新确认文件版本再编辑。

## 分页与终止
- 使用当前观察中「Go to page 2」等实际分页候选，不拼接猜测 URL 参数。点一次后等待页码与商品集合变化；正文中提到“2”不等于当前页码为 2。
- 同 URL 可展示不同页，fingerprint 变化只能证明内容变化，不能单独证明分页。记录点击目标、实际页码、来源文件、筛选状态。
- 已满足数量和覆盖条件后停止采集，输出指定子集。多次读取相同数据无新增时先检查 offset、文件版本、过滤条件和定位范围，换方法，不通过反复解释页面替代执行。
