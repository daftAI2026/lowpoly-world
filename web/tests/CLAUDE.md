# tests/
> L2 | 父级: ../CLAUDE.md

## 成员清单

catalog.test.mjs: 验证指针、404 空态、摘要、schema、计数、ID、URL 和可选字段。
catalog-view.test.mjs: 验证分类/facet 数量、筛选组合、排序、计数和虚拟行。
asset-metadata.test.mjs: 验证可选资源、权利确认、错误隔离和 recipe JSON。
i18n.test.mjs: 验证 locale、路径、正文语言、回退、双语键对齐和组件文案引用完整性。
static-href.test.mjs: 验证语义路由与 index.html 双向映射、静态路径清单、query/hash、API 与未知路径边界。
content-boundary.test.mjs: 验证 MDX 集合排除地图、合法注释、免费静态部署边界、完整中文译稿、代码与 URL 一致性和静态路由完整性。
ui-design.test.mjs: 验证三档字号、UI Colors 色阶、0.5 px 边线与焦点、圆角、动效和双语文案。

Vite+ Vitest 运行全部测试。测试替换 fetch，不访问 HF 网络或仓库资源。
合成目录记录只存在于测试模块。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
