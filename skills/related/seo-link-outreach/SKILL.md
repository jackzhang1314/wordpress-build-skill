---
name: seo-link-outreach
description: 基于已核实的来源页生成个性化联系内容，管理发送、跟进和停止联系记录。
---
# 外链联系与跟进

先按需读取 references/seo-api.md 的实际工具合同，来源与修改说明见 references/seo-sources.md。本技能运行于本浏览器 Agent，不需要终端或 MCP。

1. 读取候选来源和我方资产，核实实际收件人来源、联系目的与相关性；没有邮箱只交付草稿，不猜测或搜索私人资料补齐。
2. seoContact read 检查状态；do-not-contact 不发信。生成具体主题、简短真实切入点、可提供的价值和单一下一步，不编造阅读经历、关系或合作承诺。
3. 默认交付可编辑草稿。用户已要求发送时，调用 sendSeoEmail，产品显示完整收件人、主题和正文供确认；成功记录 Gmail id，未知用 checkSeoDelivery 核对，不通过微改正文重复发送。
4. 根据实际回复更新记录，拒绝联系时设 do-not-contact。nextFollowUp 只记录计划；跟进前核查回复，不把到期等同于发送授权。使用 readSeoCorrespondence 读取实际往来，或使用用户提供回复；listSeoFollowUps 可列到期计划，不声称未核对邮箱就知道无回复。
5. 外链上线必须在来源页面观察实际 href、目标和上下文；输出 outreach.csv 与草稿/回执来源，区分候选、已联系、已回复、停止、已上线和未知。
