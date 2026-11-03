# lib/
> L2 | 父级: ../CLAUDE.md

## 成员清单

category-taxonomy.json: 公开分类词表，稳定ID、双语标签与复合物体词；覆盖清洁、卫浴、护理、携行和住宅。
category-taxonomy.ts: 按来源别名和明确名称归类，共用分类路径、显示和筛选语义。

workspace-state.ts: 浏览状态白名单与规范 URL；预览和下载选择独立。
use-workspace.ts: TanStack URL 是浏览状态唯一来源，保留历史和滚动。
download-queue.ts: 按资产保存任务，弹层解绑不取消；重试只写未完成文件。
use-download-queue.ts: 唯一队列所有权与离页提醒；不以进度触发资产库重绘。
directory-download.ts: 独立安全窗口由用户选目录后固定版本流式保存；完成计数只取已关闭写入。
asset-downloads.ts: 固定 Dataset commit 的文件 URL、命令和版本读取，不下载模型。

catalog.ts: 读取 V2 指针与快照，校验 SHA256、字段和唯一 ID。
asset-metadata.ts: 校验详情可选 JSON、Prompt 与输入图权利字段；资源失败彼此隔离。
catalog-selection.ts: 普通链接与筛选内前后项；无 DOM 或远端依赖。
catalog-view.ts: 纯分类/facet、关键词、许可、来源、最长边、格式与面数筛选。
layout.shared.tsx: 配置右上页面互跳、明暗切换与 GitHub/HF；展厅和文档共用，不替换 header。
messages.ts: 保存业务英文与简体中文文案，区分模型搜索与文档搜索，资源键必须成对。
locale.ts: 定义 URL 语言段、回退规则、静态路径、正文源文件语言和目录首页路径。
static-pages.ts: 页面唯一注册表；共用文档 slug、双语标题、预渲染路径与 URL 白名单。
static-href.ts: 将已预渲染路由映射为真实 index.html；query、hash、API 和未知路径保持原样。
i18n.ts: 将 URL 语言与隔离的 i18next、Fumadocs UI 配置衔接；相对 TS 导入显式带 `.ts`。
shared.ts: 保存公开站点名、文档路径和 GitHub 身份。
source.server.ts: 从 `.source/server` 构造 en/zh 页面树；仅 SSR 搜索与静态函数读取。
use-catalog.ts: 将目录请求映射为加载、空、成功和失败状态。
use-asset-details.ts: 按需读取详情资源并在资产切换或卸载时取消请求。
utils.ts: 提供 Base UI 组件共用的 class 合并函数。

数据方向由路由指向目录客户端；模块不包含 HF 写入能力。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
