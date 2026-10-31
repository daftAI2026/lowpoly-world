<!--
[INPUT]: 依赖冻结方案、Hugging Face 参考页与 sutto 已公开的设计 token。
[OUTPUT]: 约束网站视觉、排版、布局、组件状态和后续代理提示。
[POS]: 网站唯一设计地图；src/styles/app.css 汇入分层样式并消费本契约。
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->
# Lowpoly World Design System

**视觉论文：** 紧凑资产库工作台。暖白纸面承载炭灰信息，青绿只标记主要操作。真实资产缩略图是唯一强视觉锚点。

**内容计划：** 窄品牌栏与工具入口 → 分类筛选侧栏、搜索/排序/计数 → 虚拟资产网格。详情页使用模型舞台与元数据栏。文档页提供产品说明与静态搜索。

**交互论文：** 筛选和排序立即更新。资产网格按行虚拟化。模型查看器提供相机控件、复位、自动旋转和全屏。无装饰动效，遵循减少动态偏好。

## 1. Visual Theme and Atmosphere

画廊是资料工具，不是营销页。首屏先回答目录是否可用，再给搜索和筛选入口。资产存在时，缩略图承担视觉重量；目录为空时，不生成演示卡片。

## 2. Color Palette and Roles

| Token | Value | Role |
| --- | --- | --- |
| `canvas` | `#FCFCF9` | 全站暖白底色 |
| `surface` | `#FAF8F5` | 控件与列表表面 |
| `surface-raised` | `#FFFFFF` | 弹出层和输入表面 |
| `ink` | `#27251E` | 正文、标题和主要图标 |
| `muted` | `#6F6A62` | 次级说明和元数据 |
| `line` | `rgb(39 26 0 / 0.12)` | 细边界线 |
| `accent` | `#016A71` | 主操作、焦点和选中标记 |
| `accent-hover` | `#00595F` | 主操作悬停 |
| `accent-soft` | `#D9ECEC` | 选中分类的轻量底色 |
| `danger` | `#B42318` | 目录错误状态 |

浅色是唯一主题。不要增加第二套暗色 token。对比度不足时先改字色，不扩大强调色范围。

## 3. Typography Rules

使用系统无衬线字体。资产编号、哈希和 JSON 使用系统等宽字体。页面标题不使用展示字体。

| Role | Size | Weight | Line height |
| --- | --- | --- | --- |
| 页面标题 | 28 px | 650 | 1.15 |
| 分区标题 | 18 px | 620 | 1.3 |
| 正文 | 14 px | 400 | 1.5 |
| 控件与资产名 | 13 px | 520 | 1.4 |
| 说明与 ID | 11 px | 450 | 1.45 |

数字使用等宽字形。分类、许可和字段不使用全大写装饰。

## 4. Component Stylings

- **按钮：** Base UI Button primitive。主按钮使用青绿底。次级按钮使用透明底和细边框。焦点使用 2 px 青绿 outline。
- **输入：** Base UI-compatible native input。高度 38 px，8 px 圆角，焦点只改变边框与 outline。
- **选择框：** Base UI Checkbox。可见勾选框 16 px，不用颜色单独表达状态。
- **过滤器：** 分类以原生 disclosure 展开。标签和格式使用复选框。活动筛选显示可见状态和清除入口。
- **资产卡：** 无阴影。卡片边界为 1 px 细线。预览比 4:3，资产名和 ID 完整换行，不用省略号。
- **查看器：** 单件页面只挂载一个 `<model-viewer>`。工具条按钮显示当前状态。
- **空态：** 写明 Dataset 尚无目录指针。隐藏没有数据支撑的分类和格式项。

按钮采用统一 `8 px` 圆角。卡片采用 `12 px` 圆角。弹出层采用 `12 px` 圆角。控件不用 pill 几何。

## 5. Layout Principles

画廊最大宽度为 `1440 px`。桌面主栏由 `244 px` 筛选栏和流式网格组成。工具栏在列表顶部保持可见，不重复建营销 Hero。网格卡片最小宽度为 `180 px`，列数跟随容器宽度。

间距使用 `4 / 8 / 12 / 16 / 24 / 32 / 48 px`。区块只用底线分隔。内容与状态文本优先靠左对齐。

## 6. Depth and Elevation

页面以平面表面和背景色阶区分层级。默认不使用阴影。弹出层使用 `#FFFFFF` 表面和边界线。画廊背景不使用渐变、纹理或玻璃效果。

## 7. Do's and Don'ts

1. 只从已校验目录渲染资产记录。
2. 缺失字段显示 `Not supplied` 或本地化等价文案。
3. `Source input image` 必须有明确 URL、权利确认和权利说明。
4. 低模档位由三角面数阈值派生，不是质量认证。
5. 只在详情页加载当前 GLB。
6. 搜索、筛选与排序在浏览器内执行。
7. 不把部署服务器、用户 Drive 或凭证接入站点。
8. 不使用静态模型占位图、假记录或自动翻译资产字段。
9. 不声明未经审核的许可、质量或来源结论。

## 8. Responsive Behavior

视口低于 `720 px` 时，筛选区折叠为原生 disclosure。宽度达到 `360 px` 时网格至少两列；窄屏卡片最小宽度为 `140 px`。低于 `360 px` 时退化为一列。工具栏控件允许换行。详情模型区在元数据前显示。触控目标不低于 `40 px`。

桌面筛选栏保持普通文档流，不吸附在页面顶部。虚拟网格测量内容高度，不用固定窗口高度或假滚动容器。

## 9. Agent Prompt Guide

- **资产卡片：** 使用暖白底 `#FCFCF9`，文字 `#27251E`，边线 `rgb(39 26 0 / 0.12)`，12 px 圆角，无阴影。保留完整资产 ID、名称和真实预览。
- **主要按钮：** 使用 `#016A71` 背景、白色文字、8 px 圆角，至少 40 px 高，焦点为 2 px outline。悬停变为 `#00595F`。
- **筛选复选框：** 16 px 方框、8 px 圆角。选中使用 `#016A71`，标签文字保持 `#27251E`。
- **空目录状态：** 使用平面 `#FAF8F5` 表面、1 px 边线、12 px 圆角。说明 Dataset 指针缺失，不放模型插画或虚构数量。
- **模型舞台：** 使用 `#FAF8F5` 背景，16 px 圆角。将预览图作为失败回退，不把其他资产用作占位。

## References

- [NVIDIA SimReady Dataset](https://huggingface.co/datasets/nvidia/simready-assets): 资产预览入口与分类发现。
- [Scenario 3D Collection](https://huggingface.co/datasets/scenario-labs/3d-collection): 表格字段、预览图、prompt 和许可的并列呈现。
- [sutto design tokens](https://github.com/daftAI2026/sutto/blob/main/src/index.css): 暖白、青绿、无阴影和间距层级。
- [sutto Base UI Button](https://github.com/daftAI2026/sutto/blob/main/src/components/ui/button.tsx): Button 状态和 Base UI 组合方式。
- [TanStack Virtual](https://tanstack.com/virtual/latest/docs/introduction): 由应用拥有 markup 与样式的无头虚拟器。
- [Google model-viewer](https://modelviewer.dev/docs/index.html): 相机控件、加载事件、错误事件和相机复位方法。

SimReady 页面展示分类入口与资产浏览入口。我们采用分类树和目录视图，不复制宣传页。
Scenario 表格并列展示预览、模型、Prompt、输入、格式和许可。详情页保留这些字段边界。
sutto 的 CSS token 和 Base UI Button 提供暖白、青绿、无阴影和交互原语参考。
