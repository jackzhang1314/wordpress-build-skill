# 整站重设计：设备选型与询盘

本轮用户明确拒绝旧版样式、UI 与文案，授权重写。保留 WordPress 原生区块、CPT/ACF 和真实询盘链路。主设计 Skill 为 frontend-design；B2B 设计参考仅取买家任务/信息组织，不采用其 Payload 技术栈。

视觉：steel #173E5D、ink #102B3F、signal #F3B529、paper #FFFFFF、mist #EEF3F6、muted #526878。标题用本地 Barlow Condensed，正文 Manrope。宽幅应用图片与窄型号标签构成工业目录特征；不采用旧红黑渐变、大字号加随机卡片的组合。颜色与字体写入 theme.json，组件 CSS 负责结构。

首页结构：完整导航 → 设备/工况首屏 → 分类横向目录 → 推荐型号 → 按应用选型 → 采购准备流程 → 可直接填写的询盘表单。产品目录突出真实分类和筛选；产品详情两种布局共用规格和产品上下文；应用页讲条件与匹配设备；About 讲采购协作范围，不编造工厂认证；资源页提供选型内容；联系页直接填写表单。

主导航：Products（分类子菜单）/ Applications / Buying guides / About / Contact，加 Request a quote。桌面横向、移动原生折叠菜单；页脚保留目录与联系，内页有面包屑和相关设备。每个页面可打开询盘弹窗，首页与联系页内嵌表单。所有 CTA 保留真实联系页 href，无 JavaScript 仍可跳转。

询盘只有一个每页表单实例，弹窗移动已初始化表单节点，关闭后归位，避免重复 ID/事件和丢失输入。原生 dialog 管理模态焦点、Escape 与关闭，产品上下文仍由服务端验证。

参考依据：Kubota 的设备系列分类与规格组织、Bobcat 的选型资料和 Build & Quote 路径，只提取信息原则，不复制品牌/照片/文案。企业规模与经销网络不同，不套用其证明材料。

- https://www.kubotausa.com/equipment-series/kx-series
- https://www.bobcat.com/na/en/buying-tools/build-quote
- https://www.bobcat.com/na/en/buying-resources/excavators/compact-excavator-buyers-guide

媒体沿用有许可记录的示意照片，公开预览明确标识；全部旧文案按采购问题重写，mock 参数不当作实际产品承诺。预览 noindex。本轮最终以匿名浏览器截图、完整导航与首页/弹窗实际提交为验收，不以组件存在或自评分代替用户审美认可。
