<!--
[INPUT]: 依赖产品定位、UI Colors v4 色阶与 sutto 公开 token。
[OUTPUT]: 约束资产库色彩、排版、布局、交互和文案。
[POS]: 网站唯一设计地图；src/styles/app.css 汇入分层样式并消费本契约。
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->
# Lowpoly World Design System

低多边形资产工作台。暖中性色承载数据，青绿标记主要动作，红色表示失败。
资产预览是唯一高权重视觉内容。空目录不显示模型占位图。

## Visual rules

1. 使用紧凑标题栏、目录工具栏、分类筛选和虚拟网格。
2. 不创建营销 Hero，不重复展示标题、计数或数据集入口。
3. 只使用 UI Colors 的 Stone、Teal、Red v4 色阶。
4. 颜色通过 `tokens.css` 的语义变量进入组件。
5. 文字只用 12、14、20 px。12 px 是最小字号。
6. 边线和焦点轮廓使用 0.5 px。焦点使用 Teal100 底色和文字下划线。
7. 只用 4、6、8 px 圆角。内层圆角补偿 0.5 px 外框。
8. 不使用阴影、彩色左边线、渐变、纹理或玻璃模糊。
9. 不移动控件。必要的颜色变化使用 250 ms ease-out。
10. 尊重减少动态偏好，触控目标至少 40 px。

## Semantic tokens

| Role | Token | Use |
| --- | --- | --- |
| Canvas | `--color-stone-50` | 页面底色 |
| Surface | `--color-stone-100` | 预览区和次级表面 |
| Ink | `--color-stone-900` | 正文、标题和图标 |
| Muted | `--color-stone-600` | 标签和次级事实 |
| Line | `--color-stone-300` | 0.5 px 边界 |
| Primary | `--color-teal-800` | 主要动作和焦点文字 |
| Hover | `--color-teal-900` | 主要动作悬停 |
| Selected | `--color-teal-100` | 分类和筛选选中底色 |
| Focus | `--color-teal-700` | 键盘焦点轮廓 |
| Error | `--color-red-800` | 失败状态文案 |
| Error surface | `--color-red-50` | 失败状态背景 |
| Error line | `--color-red-300` | 失败状态边界 |

所有页面颜色只从上述色阶派生。Fumadocs 复用相同语义 token。
页面使用浅色主题，不添加独立主题状态。

## Layout and components

- 桌面目录使用 232 px 筛选栏和流式结果网格。
- 移动端筛选使用原生 disclosure。
- 宽度低于 360 px 时资产卡改为单列。
- 虚拟网格由容器测量高度，不固定视口高度。
- 资产卡外框 8 px，预览内角为外框半径减 0.5 px。
- 代码高亮只用 Stone、Teal 语义色；不覆盖资产材质。
- 详情页只加载当前资产的 GLB。
- Viewer 提供拖动旋转、缩放、复位、自动旋转和全屏。
- GLB 失败时只回退同资产预览图。
- 文档和搜索使用 Fumadocs 布局及静态索引。
- 文档页的上一篇和下一篇标题使用 Stone Ink。
- 正文链接、主操作和选中项使用 Teal。
- 文档标题、正文、代码分别使用 20、14、12 px。

## Content rules

- 面向查找、预览、下载和检查 3D 资产的用户。
- 一句只表达一项操作或事实。
- 不使用中点分隔格式、标签或事实。
- 不重复页面标题、分类、计数、链接或空态说明。
- 空态说明目录索引状态，不推断模型已发布或未发布。
- 错误态保留重试和可展开技术细节。
- 缺失字段显示本地化的 `Not supplied`。
- 三角面数区间不是质量评级。
- 发布元数据不构成质量或权利认证。
- 只有发布记录含权利确认 URL 和说明时才显示来源输入图。
- 不自动翻译资产字段，不生成演示记录或伪模型。

## Responsive and accessibility

- 主内容最大宽度 1440 px。
- 移动端保留 16 px 页面边距；320 px 视口不得横向溢出。
- 详情页在窄屏先显示模型舞台，再显示文件和元数据。
- 颜色不能单独表达选中、错误或焦点状态。
- 所有控件具有可见键盘焦点和本地化名称。
- 文档侧栏、搜索结果和目录共用同一字号与色阶。

## References

- [UI Colors Stone v4](https://uicolors.app/tailwind-colors/stone)
- [UI Colors Teal v4](https://uicolors.app/tailwind-colors/teal)
- [UI Colors Red v4](https://uicolors.app/tailwind-colors/red)
- [UI Colors semantic tokens](https://uicolors.app/tokens)
- [sutto design tokens](https://github.com/daftAI2026/sutto/blob/main/src/index.css)
- [sutto Base UI Button](https://github.com/daftAI2026/sutto/blob/main/src/components/ui/button.tsx)
- [TanStack Virtual](https://tanstack.com/virtual/latest/docs/introduction)
- [Google model-viewer](https://modelviewer.dev/docs/index.html)
- [Fumadocs UI translations](https://www.fumadocs.dev/docs/ui/translations)
