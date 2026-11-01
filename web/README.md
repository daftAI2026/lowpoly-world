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

- 内部路由使用 `/en/...` 与 `/zh/...`；生产链接指向对应 `index.html` 文件。
- HF 不提供目录索引或路由重写。入站文件 URL 由 Router 双向转换；根入口为 `/index.html`。
- 本地开发保留语义路径。生产页面直链、刷新和语言切换不依赖托管端回退。
- URL 是唯一语言来源。站点不探测浏览器语言，不写语言 cookie。
- i18next 管业务文案。Fumadocs 管文档路由与内置 UI 标签。
- 10 个帮助主题均提供英文原文与完整简体中文译稿。新页面缺译时才标注英文回退。
- 资产字段不自动翻译。`name_zh` 缺失时详情和卡片显示 `name_en`。
- 搜索索引采用 Fumadocs 多语言配置，并按 URL locale 筛选。

## 本地开发

需要 Node.js `^22.18.0`、`^24.11.0` 或 `>=26.0.0`。

```bash
npm ci
npm run dev
```

Vite+ 统一开发、构建、检查和测试入口。检查前生成 Fumadocs adapter 与文件路由树：

```bash
npm run content:generate
npm run routes:generate
npm exec -- vp check
npm test
```

`.source/server.ts` 与 `.source/browser.ts` 分别提供服务端页面树和客户端 MDX 加载器。
`source.config.ts` 只收集 `.mdx` 文件，避免发布 GEB Markdown 地图。
`src/routeTree.gen.ts` 是路由类型契约。路由生成器加载同一份 Vite 配置，不监听端口。

## 静态构建

```bash
npm run build
npm run build:smoke
npm run preview
```

TanStack Start 客户端产物位于 `dist/client/`。构建需生成双语首页、资产详情壳、10 篇
文档的双语页面和 `/api/search` 静态索引。`build:smoke` 检查文件、文档标题、HTML 语言、
静态资源、导航目标真实文件和 GEB 地图隔离。
本机或 GitHub Actions 使用 Node.js 构建。将 `dist/client/` 内容复制到 Space 根目录，
再加入 `hf-space/README.md`，入口为 `index.html`。HF 只托管生成文件，不运行 Node 服务。
不设置 `app_build_command`，避免远端构建的额度要求。网站不写 Dataset。

## 数据边界

- 唯一目录源：`daftAI2026/3d-assets`。
- 读取 `catalog/v1/latest.json`，再验证不可变快照的 SHA256。
- 未发布指针显示空目录。网络、JSON、schema、计数或摘要错误显示失败状态。
- 资产预览和文件链接只取自已验证的目录记录。
- 页面不构造示例资产，也不把模型文件放入 Git。

## 当前范围

本模块提供浏览器搜索、分类树和计数、格式/标签/三角面数筛选、排序与虚拟网格。
详情页使用单一 `<model-viewer>`，提供相机控件、复位、自动旋转和全屏。
详情资源按需读取。缺失字段显示 `Not supplied`。输入源图必须有权利声明。
10 个帮助主题覆盖入门、下载、许可、格式、Blender、Three.js、schema、贡献、更新和 FAQ，并各有中英版本。
两种语言各自编译正文、标题与搜索索引。语言切换保留当前页面。

`src/components/ui/` 保存已审阅的 Base UI 源码组件。它不依赖 shadcn CLI 运行。
`components.json` 保留组件生成配置。CLI 不在默认依赖中。
新增组件时，使用固定且经审阅的 CLI 版本。不要直接运行未审阅的 `latest`。

目录没有 `latest.json` 时，首页显示诚实空状态。测试 fixture 不进入应用目录或构建输出。

## 当前验收（2026-11-02）

- Vite+ 类型与 lint 检查通过，59 项离线测试通过。
- 静态构建生成 26 个预渲染输出；smoke 覆盖 24 条路由、20 篇本地化文档和搜索。
- 公开 Dataset 已发布 10 个逐件审核的真实模型。目录摘要、Parquet 十行与 Image 特征已核对。
- 相同源 SHA 再次发布返回零变更，Dataset 提交不变；网站不参与模型发布。
- UI 采用 UI Colors 的 Stone、Teal、Red 语义色，文字固定 12、14、20px，线条为 0.5px。
- 首页省去重复说明与空标签筛选。焦点无需动画，其他必要颜色过渡为 250ms ease-out。
- npm audit 当前为零告警。查看器按需加载；大 chunk 提示不作为测试失败。
- HF Data Studio 索引已返回十条记录与图像特征，转换预览已读回核对；首次排队后自行就绪。


CI 只检查公开网站。HF 同步必须手动触发，缺省关闭。
专用 `HF_SPACE_TOKEN` 由所有者独立设置；本项目不会自动复制本机凭据。

## 官方依据

- [Fumadocs Create App CLI](https://www.fumadocs.dev/docs/cli/create-fumadocs-app)
- [Fumadocs TanStack Start](https://www.fumadocs.dev/docs/manual-installation/tanstack-start)
- [Fumadocs static build](https://www.fumadocs.dev/docs/deploying/static)
- [Fumadocs Vite MDX](https://www.fumadocs.dev/docs/mdx/vite)
- [TanStack Start SPA mode](https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode)
- [TanStack Start static prerendering](https://tanstack.com/start/latest/docs/framework/react/guide/static-prerendering)
- [TanStack Router URL rewrites](https://tanstack.com/router/latest/docs/guide/url-rewrites)
- [TanStack Router manual setup](https://tanstack.com/router/latest/docs/installation/manual)
- [Vite JavaScript API](https://vite.dev/guide/api-javascript)
- [Fumadocs TanStack Start internationalization](https://www.fumadocs.dev/docs/internationalization/tanstack-start)
- [Fumadocs UI translations](https://www.fumadocs.dev/docs/ui/translations)
- [i18next configuration](https://www.i18next.com/overview/configuration-options)
- [react-i18next useTranslation](https://react.i18next.com/latest/usetranslation-hook)
- [Hugging Face Static HTML Spaces](https://huggingface.co/docs/hub/spaces-sdks-static)
- [Vite+ overview](https://viteplus.dev/guide)
- [Vite+ test runner](https://viteplus.dev/guide/test)
- [TanStack Virtual](https://tanstack.com/virtual/latest/docs/introduction)
- [Google model-viewer](https://modelviewer.dev/docs/index.html)
- [shadcn/ui TanStack Start](https://ui.shadcn.com/docs/installation/tanstack)
- [NVIDIA SimReady assets](https://huggingface.co/datasets/nvidia/simready-assets)
- [Scenario 3D Collection](https://huggingface.co/datasets/scenario-labs/3d-collection)
