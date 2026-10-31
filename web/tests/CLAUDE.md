# tests/
> L2 | 父级: ../CLAUDE.md

## 成员清单

catalog.test.mjs: 隔离验证目录读取、摘要、schema、计数、唯一 ID 与 URL 边界。
i18n.test.mjs: 离线验证语言段、目录首页路径、i18next 回退与资源键对齐。
content-boundary.test.mjs: 验证 MDX 集合排除地图，契约使用合法 MDX 注释。

测试替换 fetch，不访问 Hugging Face 网络或仓库资源。语言测试只读取本地资源。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
