# lib/
> L2 | 父级: ../CLAUDE.md

## 成员清单

catalog.ts: 读取 V2 指针与快照，校验 SHA256、字段和唯一 ID。
layout.shared.tsx: 统一 Fumadocs 首页与文档页导航选项，并保留 URL 语言段。
messages.ts: 保存业务英文与简体中文文案，资源键必须成对。
locale.ts: 定义 URL 语言段、回退规则、静态路径和目录首页路径。
i18n.ts: 将 URL 语言与隔离的 i18next、Fumadocs UI 配置衔接；相对 TS 导入显式带 `.ts`。
shared.ts: 保存公开站点名、文档路径和 GitHub 身份。
source.server.ts: 从 `.source/server` 构造 en/zh 页面树；仅 SSR 搜索与静态函数读取。
use-catalog.ts: 将目录请求映射为加载、空、成功和失败状态。

数据方向由路由指向目录客户端；模块不包含 HF 写入能力。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
