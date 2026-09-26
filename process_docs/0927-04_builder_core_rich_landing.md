# 2026-09-27 03:20（Asia/Shanghai）— Builder Core Rich Landing 方案

## 触发原因

`v2.25.0` 已能在 Elementor 老站旁边安全创建 Builder-managed 页面，但 Builder Core 的 Landing / Canvas 模板仍过于简单，只有：

```text
subtitle
summary
CTA label
CTA url
the_content()
```

这不能满足真实 B2B 页面需要，也不足以作为替代第三方编辑器页面的正面样例。

## 目标

把 Builder Core 从 1.0.2 升级到 1.1.0：

1. 扩充后台可编辑字段；
2. 升级 Landing 页面信息架构；
3. 增加主题独立的响应式样式；
4. 保持免费版 ACF 可用；
5. 不修改用户历史 Elementor/Divi/Bricks 页面；
6. 继续通过 `builder page plan/apply` 安全写入。

## 新增字段

保留：

```text
wbc_subtitle
wbc_summary
wbc_cta_label
wbc_cta_url
```

新增：

```text
wbc_benefits
wbc_specifications
wbc_faq
wbc_secondary_cta_label
wbc_secondary_cta_url
```

输入格式：

```text
wbc_benefits:
One benefit per line
Benefit | Supporting detail

wbc_specifications:
Label | Value

wbc_faq:
Question | Answer
```

全部使用 ACF textarea/text/url 免费字段，不依赖 Repeater / Gallery / ACF PRO。

## Landing 信息架构

1. Hero：
   - subtitle；
   - H1 title；
   - summary；
   - primary CTA。
2. Main editor content：
   - `the_content()`。
3. Buyer benefits：
   - benefits list；
   - 支持 `Benefit | detail`。
4. Specifications：
   - two-column spec table；
   - `Label | Value`。
5. FAQ：
   - `<details>` / `<summary>`；
   - `Question | Answer`。
6. Bottom CTA：
   - secondary CTA；
   - fallback primary CTA。
7. Theme header/footer：
   - 继续使用 `get_header()` / `get_footer()`，不替换用户老站导航。

## 设计原则

- 不使用蓝紫渐变或 SaaS 模板感；
- 工业外贸页采用克制的中性色、清晰层级和较高信息密度；
- 全部样式挂在 `.wordpress-builder-template` 作用域下；
- 不覆盖全站样式；
- 响应式断点不产生横向溢出；
- CTA 与交互元素保持可见 focus；
- 移动端触控目标不小于 44px；
- 正文与标题对比度满足 AA；
- 继承主题字体，避免强插品牌字体。

## 插件实现

- 新增 `assets/css/wordpress-builder-core.css`。
- 在支持的内容类型和 Builder 模板上 enqueue。
- 新增安全 helper：
  - 逐行解析；
  - `Label | Value` 拆分；
  - ACF 读取。
- Landing 模板使用语义 HTML：
  - `header`；
  - `article`；
  - `section`；
  - `ul`；
  - `table`；
  - `dl` 或 `details`；
  - `footer`。

## builder page 工作流同步

- `ALLOWED_FIELDS` 扩展到 9 个。
- URL 字段统一验证必须为完整 http(s) URL。
- Plan / apply / readback 均覆盖新字段。
- 未知字段继续拒绝。
- 第三方编辑器字段继续拒绝。

## 测试计划

1. ACF 9 个字段均 REST 暴露且有后台说明；
2. Builder Core 版本一致性；
3. 模板包含 `the_content()` 与新增 sections；
4. 插件样式作用域与 enqueue；
5. Builder page 支持新字段；
6. URL 字段验证；
7. 未知字段拒绝；
8. plan / apply / readback 包含新字段；
9. 真实 Hostinger Elementor 站升级插件并复测现有页面；
10. 公网 HTML 与移动/桌面截图验证。

## 发布计划

- WordPress Builder：`2.26.0`
- Builder Core：`1.1.0`
- 完整 gate：typecheck / lint / test / build
- commit、tag、push、干净 clone 复测

---

# 实施与验证记录（2026-09-27 03:45 Asia/Shanghai）

## 已实施

- Builder Core：
  - `1.0.2 → 1.1.0`；
  - ACF 字段从 4 个扩展到 9 个；
  - 新增 scoped CSS：`assets/css/wordpress-builder-core.css`；
  - 模板只在支持类型且使用 Builder template 时加载样式；
  - Landing 增加：
    - hero；
    - main editor content；
    - buyer benefits；
    - specifications table；
    - FAQ details；
    - bottom CTA；
  - 保留主题 `get_header()` / `get_footer()`。
- `builder page plan/apply`：
  - 字段白名单扩展到 9 个；
  - 两个 CTA URL 均验证完整 http(s)；
  - readback / rollback 覆盖新字段。

## 本地验证

- PHP 语法检查通过：
  - plugin PHP；
  - landing PHP；
  - canvas PHP。
- 单元测试更新：
  - 9 个 ACF 字段均 REST 暴露且有说明；
  - 版本一致性；
  - Landing 包含新增 sections；
  - CSS scoped / responsive / reduced-motion / focus-visible；
  - builder page 新字段读写与验证；
  - 未知字段和第三方编辑器字段拒绝。

## 真实 Hostinger / Elementor 站 E2E

站点：

```text
yellow-koala-142147.hostingersite.com
```

执行：

1. `builder install`：
   - 创建备份；
   - Builder Core 升级并激活为 `1.1.0`。
2. 更新 `builder-page-e2e.json` 的 9 个字段。
3. `builder page plan`：
   - action `update`;
   - 目标 `builder_project:builder-managed-e2e`。
4. `builder page apply`：
   - HTTP 200；
   - 4 个 verifyText 全部通过。
5. 公网 HTML 验证：
   - CSS `/wp-content/plugins/wordpress-builder-core/assets/css/wordpress-builder-core.css?ver=1.1.0` 加载；
   - `Buyer Benefits` 渲染；
   - `Specifications` 渲染；
   - `Questions and Answers` 渲染；
   - benefit / table / FAQ class 均出现。
6. `cms-audit` 通过：
   - field group `group_wbc_content`;
   - 9 个字段；
   - page template inventory；
   - stored values checked；
   - problems = 0。
7. Chrome 实测：
   - desktop viewport 1440：
     - no horizontal overflow；
     - benefit cards 2 列；
     - CTA height 50px。
   - mobile layout：
     - no horizontal overflow；
     - H1 对比度约 16.27:1；
     - CTA 触控高度 50px；
     - benefits / specs / FAQ 均渲染。
8. 截图证据：
   - `/Users/Zhuanz1/Documents/ChatGPT/wordpress-builder-skill/.wordpress-builder/visual/wbc-rich-landing-desktop.png`
   - `/Users/Zhuanz1/Documents/ChatGPT/wordpress-builder-skill/.wordpress-builder/visual/wbc-rich-landing-mobile.png`

历史 Elementor 页面仍未被转换或覆盖。

## 发布与干净克隆复测（2026-09-27 03:26 Asia/Shanghai）

- 功能提交：`7660d21c27bddead29c1db352cc8c16c52ec9fb6`（`feat: add Builder Core Rich Landing`）。
- 已推送 `main` 并发布 tag：`v2.26.0`。
- 从 GitHub 干净克隆 `v2.26.0` 后验证通过：
  - `node harness/bootstrap.mjs --fix`；
  - `npm run typecheck`；
  - `npm run lint`；
  - `npm test`：255/255；
  - `npm run build`；
  - `node wordpress-builder.mjs --help`。
- 干净克隆工作区保持干净（detached HEAD，无未提交文件）。
