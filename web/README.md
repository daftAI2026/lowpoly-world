<!--
[INPUT]: 依赖 web/ 的 TanStack Start、Fumadocs 与公开 Dataset 读取模块。
[OUTPUT]: 说明本地开发命令、静态构建边界和 Space 配置入口。
[POS]: 网站模块的人类入口；不作为模型数据或 Dataset 发布器。
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->
# Lowpoly World Web

这是 Lowpoly World 的本地静态网站模块。它只读 Hugging Face Dataset 的公开目录。
它不保存模型、令牌或审核记录。

## 语言边界

- `/en/...` 与 `/zh/...` 是静态可预渲染的语言 URL。`/` 是默认英文首页。
- URL 是唯一语言来源。站点不探测浏览器语言，不写语言 cookie。
- i18next 管业务文案。Fumadocs 管文档路由与内置 UI 标签。
- 现有文档仅有英文。`/zh/docs/...` 明确回退英文正文，并标注尚未完成翻译。
- 资产字段不自动翻译。`name_zh` 缺失时详情和卡片显示 `name_en`。
- 搜索索引采用 Fumadocs 多语言配置，并按 URL locale 筛选。

## 本地开发

需要 Node.js `>=22.12.0`。

```bash
npm ci
npm run dev
```

TypeScript 检查会先生成 Fumadocs adapter 与 TanStack 文件路由树：

```bash
npm run types:check
```

`.source/server.ts` 与 `.source/browser.ts` 分别提供服务端页面树和客户端 MDX 加载器。
`source.config.ts` 只收集 `.mdx` 文件，避免发布 GEB Markdown 地图。
`src/routeTree.gen.ts` 是路由类型契约。独立类型检查先运行 `content:generate`，再用
`routes:generate` 加载同一份 Vite 配置，不监听端口。

目录客户端的离线测试使用 Node 内置测试运行器：

```bash
npm test
```

## 静态构建

```bash
npm run build
npm run preview
```

TanStack Start 的 Vite 客户端产物目标为 `dist/client/`。HF Static Space 模板引用
`dist/client/index.html`，并要求将 `web/` 内容镜像到 Space 仓库根目录。

2026-10-31 本地验收：22 项离线测试、类型检查和静态构建通过。
构建输出包含 `/`、`/en/`、`/zh/`、双语资产详情、双语文档和 `/api/search` 静态文件。
只用静态 HTTP 服务器验过中文首页、英文文档回退、静态搜索、语言切换保留查询与锚点、详情直链刷新和 390px 窄屏。
公开目录尚无指针，页面显示首次发布空状态。线上 Space 尚未部署本站。

构建保留上游 `::highlight(fd-search)` 的两条 CSS 优化提示，以及约 503 kB 主包提示。
浏览器未出现脚本异常；默认 favicon 缺失和未发布目录指针返回 404。
这些结果不包含真实资产预览或模型加载验收。

构建可在托管端运行 Node.js。部署后的 Space 只托管静态文件，不启动 Node.js 服务。
该网站不部署到 Dataset，也不向 Dataset 写入内容。

本模块使用 Fumadocs 官方 `tanstack-start-spa` 模板。它保留构建期静态函数和搜索索引，
移除 Nitro 服务与依赖重写规则的本地静态服务器配置。

## 数据边界

- 唯一目录源：`daftAI2026/3d-assets`。
- 读取 `catalog/v1/latest.json`，再验证不可变快照的 SHA256。
- 未发布指针显示空目录。网络、JSON、schema、计数或摘要错误显示失败状态。
- 资产预览和文件链接只取自已验证的目录记录。
- 页面不构造示例资产，也不把模型文件放入 Git。

## 当前范围

本模块提供首页、资产详情骨架、目录状态、Fumadocs 文档与静态搜索配置。
搜索筛选、虚拟滚动和 3D 查看器未纳入本轮。

## 官方依据

- [Fumadocs Create App CLI](https://www.fumadocs.dev/docs/cli/create-fumadocs-app)
- [Fumadocs TanStack Start](https://www.fumadocs.dev/docs/manual-installation/tanstack-start)
- [Fumadocs static build](https://www.fumadocs.dev/docs/deploying/static)
- [Fumadocs Vite MDX](https://www.fumadocs.dev/docs/mdx/vite)
- [TanStack Start SPA mode](https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode)
- [TanStack Start static prerendering](https://tanstack.com/start/latest/docs/framework/react/guide/static-prerendering)
- [TanStack Router manual setup](https://tanstack.com/router/latest/docs/installation/manual)
- [Vite JavaScript API](https://vite.dev/guide/api-javascript)
- [Fumadocs TanStack Start internationalization](https://www.fumadocs.dev/docs/internationalization/tanstack-start)
- [Fumadocs UI translations](https://www.fumadocs.dev/docs/ui/translations)
- [i18next configuration](https://www.i18next.com/overview/configuration-options)
- [react-i18next useTranslation](https://react.i18next.com/latest/usetranslation-hook)
- [Hugging Face Static HTML Spaces](https://huggingface.co/docs/hub/spaces-sdks-static)
