# HONGDA WordPress B2B 预览站

按用户指定的参考站布局和信息架构，使用本项目 WordPress 新站编排方案重建。真实 WordPress 服务端页面，不依赖原站 React bundle。

## 启动与验证

在工具仓库根目录运行：

```sh
npm run hongda:serve
npm run test:hongda
```

预览：http://127.0.0.1:9464/ 。启动脚本创建新的隔离 SQLite Playground，检查端口占用、官方能力文件完整性与 Blueprint schema，并在真实 PHP 中解析站点 PHP。每次重新启动会创建新数据库；手工修改不会自动回写 seed 或跨重启保留。现有 9462/9463 环境不复用。依赖已有本地 ACF、Fluent Forms、SEO Framework 插件文件，可通过 `WP_TEST_PLUGINS_PATH` 指定另一插件目录。正式部署需要正常 WordPress 主机、持久数据库与生产配置，不能以这个启动脚本替代。

## 源码和内容归属

- `plugin/site-model.php`：设备 CPT、设备分类、行业 CPT、ACF 参数、关联对象、询盘产品 ID 校验。删除/停用不会主动删除业务数据。
- `theme/`：PHP 模板层级、theme.json、响应式 CSS、WordPress 原生菜单和附件输出。品牌首页呈现字段由主题定义。
- `content/seed.php`：仅用于独立本地预览的内容导入；拒绝已有业务数据。`reference.json` 是参考站原文研究数据，不是已审核企业事实。
- `content/form.php`：使用实际 Fluent Forms 服务创建表单。产品 ID 隐藏传递、服务端验证；产品名在联系页展示。
- `content/media-manifest.json`：6 张示意照片的来源、作者和许可。各图标注示意，站内 Image credits 页面展示署名和许可链接。正式站需替换为已核实且获授权的品牌素材。
- `../../scripts/fixtures/hongda/`：本地运行兼容与只读验收回执接口，**不属于可部署业务插件**。

| 页面 | 实现 |
| --- | --- |
| 首页 | 独立首屏、真实分类/产品/行业查询、原生正文 |
| Equipment | CPT archive、taxonomy、服务端重量筛选及分页 |
| 产品详情 | 原生标题/摘要/正文/附件，ACF 型号与三组规格，关联同类设备 |
| Industry | 11 个行业对象、编辑器正文、关联设备分类 |
| Our story | 专用公司介绍模板、7 个层级子页 |
| Contact | 专用询盘模板、7 个服务主题子页、Fluent Forms |
| Journal | 原生文章和文章列表 |

规格采用 ACF 免费版多行字段，每行 `项目 | 值`，不依赖 ACF PRO Repeater。产品与分类使用各自的 WordPress permalink，不强行复刻 React 的重叠路径。

## 验收与边界

详见 [阶段验收](../../docs/acceptance/0920-hongda/README.md)。当前是内容待审核的本地预览；生产邮件、MySQL、备份恢复和真实素材仍未验收。页面设为 noindex。本地通知被捕获，不发给参考站联系人。

官方 triage 属于启发式识别：本项目的组合目录被判为 unknown，带 theme.json 的经典主题被误判为 block theme；插件扫描器也未识别带星号的标准 PHPDoc 插件头。保留原始报告，并以实际 WordPress 激活、REST 内容类型和 `wp_is_block_theme() === false` 作为运行证据，不修改 vendor 来伪造通过。

## 保存当前预览与隔离恢复

新增仓库命令：

```sh
npm run hongda:snapshot
npm run hongda:restore
npm run test:hongda:recovery
npm run test:hongda:enquiry
```

先保持 9464 原站运行并暂停后台编辑/上传，执行 snapshot；快照位于 `.lab/` 私有目录，包含一致性 SQLite 数据库、上传文件、代码与依赖以及访问所需的本地凭据，不能上传到公开仓库。该过程不会自动保存以后发生的编辑，需要保留新进度时重新快照。

restore 核对完整性后复制快照，在 **9465** 启动独立恢复站，不覆盖原站、不重新 seed。等终端出现 `Verified ready; active preview pointer updated.` 再运行 recovery 检查。版本在 CLI 和 Blueprint 中共同指定；“当前实例”指针只在运行证据和 REST 就绪后更新。端口占用时拒绝启动并保留原指针。

恢复测试核对稳定 ID、原生正文、ACF 字段、特色图、上传文件哈希、已有询盘与关键路由。它验证的是本地 SQLite，不是正式 MySQL 备份。停止/恢复过程中保留快照和先前运行目录。

enquiry 使用已安装的 Playwright Skill CLI，也可通过 `PLAYWRIGHT_CLI` 指定可执行文件。每次运行会在 **9464** 增加一条带产品关联的测试询盘和一条本地通知，按运行前后的增量核对；不向外部邮箱发送。它验证必填、无效产品、成功三条独立交互路径。新证据位于 `docs/acceptance/0920-hongda-iteration2/`。

## 从交付包跑通完整流程

```sh
npm run hongda:e2e
```

使用隔离的 9466 新站和 9467 恢复站，结束后停止本次启动的进程。保持这两个端口空闲；不会停止或替换 9464/9465。依赖同上，询盘交互还需要 Playwright CLI。执行：打包 → 空白 WordPress 的 ZIP 安装 → 运行版本与已安装文件哈希核对 → 页面/内容修改及回读 → 浏览器询盘及入库/本地通知 → 一致性快照 → 隔离恢复及数据比对。失败即停止后续步骤，每次报告存入独立的 `docs/acceptance/hongda-e2e/run-*/`。

`npm run hongda:package` 单独生成 `output/hongda-delivery/release-*/` 中的主题 ZIP、业务插件 ZIP 与 SHA-256 清单。交付包只含代码，不含本地账户、数据库、询盘、种子内容或实验插件；第三方插件另行安装，内容/菜单/联系页及表单另行配置。完整本地运行使用已授权的示例内容，不等于真实客户资料已审核。

总验收区分本地功能、视觉认可与生产环境：本地链路通过不能把视觉评价自动标为合格，也不能证明正式邮件送达或 MySQL 恢复。
