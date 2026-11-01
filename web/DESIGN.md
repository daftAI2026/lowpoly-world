<!--
[INPUT]: 依赖 Fumadocs 官方模板、原生组件与用户界面约束。
[OUTPUT]: 约束 Dataset 与展示应用的分工和模板扩展边界。
[POS]: 展示应用设计地图；文档是应用内页面，不是第三个站。
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->
# Lowpoly World Design System

## 1. 产品与主题

只有两个公开交付：HF Dataset 与 HF Static Space 展示应用。
Dataset 提供原生 Data Studio、文件预览、许可与下载。
展示应用提供资产浏览、3D 查看和使用文档。
使用文档属于同一个展示应用，不另建站。

以 Fumadocs 原生壳为起点，不自建导航框架。
官方 CLI `create-fumadocs-app@16.2.27` 的 `tanstack-start-spa` 是本轮基线。
运行依赖沿用已锁定的 Fumadocs Base UI 16.17.9。

## 2. 调色板

UI Colors Stone 承载背景、正文和边界。
Teal 表示链接、选中项与主操作，Red 表示错误。
颜色通过 tokens.css 的语义变量进入原生主题。
不重绘模型材质或源预览图。

## 3. 文字

使用四档字号：12、14、20、28px。
12px 用于编号和代码，14px 用于正文与操作。
20px 用于章节标题，28px 用于页面标题。
页面和章节保留独立层级，不再全部压成 20px。
保留模板的行距、阅读间距和字重。

## 4. 原生组件

- HomeLayout 承载模型库与模型详情。
- Notebook DocsLayout 使用 `nav.mode=top`。
- Notebook DocsPage 与该布局配套使用。
- 原生 links 同时提供模型库、使用文档、HF 和 GitHub。
- HF 与 GitHub 位于桌面右上角。
- 窄屏外链沿用模板菜单或侧栏，不自建第二套菜单。
- 原生 Card 只扩展正方形图片、名称、编号和格式。
- 搜索、语言切换、页内目录和文档分页沿用模板。

## 5. 布局与扩展

主导航归 layout.shared.tsx，不在首页重复放项目链接。
内容宽度读取模板 --fd-layout-width，与导航内边距对齐。
模型库保留分类、格式与面数筛选，图片是主要内容。
只有资产专属功能使用补充依赖：

- TanStack Virtual 按行虚拟化真实目录。
- Base UI 提供筛选与输入原语。
- model-viewer 只加载当前资产的 GLB。
- Prompt、配方与质量信息按需读取。

Fumadocs 不提供 3D 资产查看器，不伪造同名组件。

## 6. 边界与层次

线条声明为 0.5px。DPR 1 的浏览器会量化到设备像素。
保留原生弹层的功能性层次，不自建装饰阴影。
卡片外角 8px，预览内角减去 0.5px 外框。
原生搜索和控件的圆角不再被通用 class 规则强行替换。
只为本应用的资产卡设置必要颜色反馈。
键盘焦点不做动画，尊重减少动态偏好。

## 7. 文案与禁止项

- 不使用中点作分隔符，不写重复解释。
- 不把首页做成文档目录或工程审核控制台。
- 不把测试通过当成用户确认视觉通过。
- 不拦截全部 shadow、rounded-full 或 transition class。
- 不改模板网格和菜单几何来修局部问题。
- 不把未审核模型、私人报告或参考输入图放到公开界面。
- 不使用规划数量代替已发布数量。

## 8. 响应式与访问性

原生壳负责导航、搜索和文档断点。
资产筛选在窄屏使用现有 disclosure。
320、390 和桌面宽度均须实际验收。
验证菜单中的 HF/GitHub 和模型库返回路径。
图库不同时挂载多份 WebGL 画布。

## 9. 后续修改契约

先查 Fumadocs 原生选项，再考虑补充组件。
布局变化先对照模板，不从旧覆盖层继续打补丁。
数据读取、静态路由与模型发布器保持独立。
Dataset Card 从真实目录生成，后续发布不得丢失互链。

## References

- [Fumadocs CLI](https://www.fumadocs.dev/docs/cli/create-fumadocs-app)
- [Fumadocs Layout Links](https://www.fumadocs.dev/docs/ui/layouts/links)
- [Fumadocs Notebook](https://www.fumadocs.dev/docs/ui/layouts/notebook)
- [NVIDIA Dataset](https://huggingface.co/datasets/nvidia/simready-assets)
- [Scenario Dataset](https://huggingface.co/datasets/scenario-labs/3d-collection)
- [HF Dataset Cards](https://huggingface.co/docs/hub/datasets-cards)
- [UI Colors](https://uicolors.app/tokens)
