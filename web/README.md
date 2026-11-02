<!--
[INPUT]: 依赖 web/ 的 TanStack Start、Fumadocs 与公开 Dataset 读取模块。
[OUTPUT]: 说明本地开发命令、静态构建边界和 Space 配置入口。
[POS]: 网站模块的人类入口；不作为模型数据或 Dataset 发布器。
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->
# Lowpoly World Web

这是 Lowpoly World 的展示应用，部署到 HF Static Space。
项目只有 Dataset 和展示应用两个交付，使用文档位于应用内。
它只读 Hugging Face Dataset 的公开目录。
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
再加入 `hf-space/README.md` 与网站 `LICENSE`，入口为 `index.html`。HF 只托管生成文件，不运行 Node 服务。
不设置 `app_build_command`，避免远端构建的额度要求。网站不写 Dataset。

## 数据边界

- 唯一目录源：`daftAI2026/3d-assets`。
- 读取 `catalog/v1/latest.json`，再验证不可变快照的 SHA256。
- 未发布指针显示空目录。网络、JSON、schema、计数或摘要错误显示失败状态。
- 资产预览和文件链接只取自已验证的目录记录。
- 页面不构造示例资产，也不把模型文件放入 Git。

## 当前范围

本模块提供浏览器搜索、分类树和计数、格式/标签/三角面数/许可/来源/最长边筛选、排序与虚拟结果。
详情页使用单一 `<model-viewer>`，提供相机控件、复位、自动旋转和全屏。
详情资源按需读取。缺失字段显示 `Not supplied`。输入源图必须有权利声明。
10 个帮助主题覆盖入门、下载、许可、格式、Blender、Three.js、schema、贡献、更新和 FAQ，并各有中英版本。
两种语言各自编译正文、标题与搜索索引。语言切换保留页面与浏览条件。

网格、列表与三档缩略图共用公开记录，不生成示例供应商。
宽屏普通点击在当前结果旁预览，支持左右下停靠、宽高调整、前后项与定位。
应用内展开与返回保留一个 viewer，不替换为跳页或浏览器全屏。
关闭预览保留搜索和筛选；修改键、窄屏继续访问独立详情 URL。
模型、文件与元数据由同一 AssetDetails 组合，不重复实现。
URL 独立保存预览和下载选择，支持分享、刷新与历史恢复。
批选明确作用于筛选结果。审阅选择后可移除、复制链接或导出清单。
批量命令固定 Dataset commit；文件直接下载，不占用浏览器批量缓存。
下载入口只记录已打开链接，不声称文件已保存。

`src/components/ui/` 保存 14 个官方 shadcn Base Nova 源码副本。
同一类控件只用这一套。FU 保留布局与文档。展厅复用 shadcn Card 和搜索控件。
`registry.sources.json` 记录官方 URL、原始摘要与外观适配。
复用官方 Input、Checkbox、NativeSelect、Popover、Collapsible、ToggleGroup、
Breadcrumb、Button、Textarea、Label、Badge 与 Resizable，不自写基础交互。
`react-resizable-panels@4.16.1` 由官方 Resizable 使用。
用户黑白 OKLCH token 统一驱动 FU 与 shadcn。
FU 使用官方 shadcn 适配，不覆盖布局，不引入 Radix。
原生明暗切换跨页面保存。英文 Inter，中文思源 SC 子集。
字体本地托管，系统字体最后回退；生成步骤见 assets/README.md。
MIT 许可通过 HTML license 链接随产物托管。
网站不依赖 shadcn CLI 运行。
`components.json` 保留组件生成配置。CLI 不在默认依赖中。
新增组件时，使用固定且经审阅的 CLI 版本。不要直接运行未审阅的 `latest`。

目录没有 `latest.json` 时，首页显示诚实空状态。测试 fixture 不进入应用目录或构建输出。

## 模板基础

本轮重新生成官方 `create-fumadocs-app@16.2.27` 的 `tanstack-start-spa` 基线。
保留已锁定的依赖与已验证的数据协议，不引入另一套框架。
展示使用原生 Spacious，文档单独使用官网 Spacious 与配套 Page。
模型库是筛选栏加结果/预览工作区，不是把文档阅读页改成资产列表。
采用官方 shadcn、spacious 与 preset；语义颜色、圆角和字体读取用户 token。
导航、搜索、语言菜单和文档分页使用原生组件。HF 与 GitHub 共用右上角入口。
官方 shadcn Card 承载资产图片；筛选、虚拟网格和 3D 查看器属于模板外的必要补充。

## 验收与发布边界（2026-11-02）

展示与文档共用官网 Spacious 全屏壳，入口与内容独立。完整工作区包含 URL 状态、列表、密度、筛选、
独立下载选择、三向停靠与应用内展开。网站不提供 AI 语义搜索或关节仿真。

- 类型与 lint 检查、离线测试、静态构建和浏览器验收分别执行。
- 静态 smoke 覆盖 24 路由、20 篇本地化文档和搜索。
- 资产数量以公开目录为准；模型逐件批准，网站发布不新增模型批准。
- HF 使用官方黄色 SVG，原生文档保持 Spacious 默认几何。
- 虚拟结果读取实际滚动宿主，窄屏详情保留返回条件。

CI 只检查公开网站。HF 同步必须手动触发，缺省关闭。
专用 `HF_SPACE_TOKEN` 由所有者独立设置；本项目不会自动复制本机凭据。

## 官方依据

- [Fumadocs 官网布局源码](https://github.com/fuma-nama/fumadocs/tree/ef5911245865c04140e3dae7ff51e7ef6260ef68/apps/docs/components/layouts/spacious)
- [Fumadocs Layout Links](https://www.fumadocs.dev/docs/ui/layouts/links)

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
