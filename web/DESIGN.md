<!--
[INPUT]: 依赖 Fumadocs 官网源码、实测截图与 HF 官方品牌页。
[OUTPUT]: 固定官网 Spacious 基线与资产区扩展边界。
[POS]: 当前展示层设计地图；取代此前 Home/Notebook 和自定义主题。
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->
# Lowpoly World Design System

## 1. 产品与视觉方向

只有 HF Dataset 与 Static Space 应用两个交付。
使用文档位于应用内，不建第三个站。
视觉直接复用 Fumadocs 当前文档站，而非泛指使用组件库。
用户已拒绝此前 Notebook 与自定义主题组合。
本轮以官网 Spacious 左侧导航、阅读面板和右上操作为准。

官网源码锁定 `ef5911245865c04140e3dae7ff51e7ef6260ef68`。
入口为 `apps/docs/app/docs/layout.tsx`。
它转到 `components/layouts/spacious/`，使用官方 Spacious。
运行依赖沿用 Fumadocs Base UI 16.17.9，不另建框架。

## 2. 颜色

直接导入官方 neutral、generated/spacious 与 preset。
采用官网 UI 分区主色 `hsl(217 100% 58%)`。
资产语义色单向引用 `--color-fd-*`，不反向覆盖模板。
撤销旧 Stone/Teal 全局重映射。
HF 标识使用官方彩色 SVG，保留黄色和比例。
品牌原件不套用 UI 调色板，模型材质同样不染色。

## 3. 字体与排版

Geist 与 JetBrains Mono 与官网一致。
字体本地托管，保留 OFL 原文，中文回退系统字体。
不改模板 `--text-*`、标题、正文和代码字号。
资产信息保持最多四档字号，最小 12px。
当前直接复用官网的要求优先于旧模板覆盖规则。

## 4. 原生组件

AppShell 只调用官方 Spacious DocsLayout。
模型库、详情和文档全部使用匹配的 Spacious DocsPage。
侧栏、搜索、语言、外链、目录和分页均由官方组件生成。
桌面右上显示 HF 与 GitHub，窄屏沿用原生菜单。
资产按钮复用 Fumadocs buttonVariants，不以 shadcn 构造壳。
资产输入和复选框只负责筛选，不参与导航布局。

## 5. 布局与内容

父路由静态读取双语树，全应用只有一个壳。
模型库与详情使用 full 页面，文档使用标准阅读宽度。
模型网格与筛选是资产专属扩展，不模仿文档功能。
业务响应式断点依据内容容器，不误用整个窗口宽度。
桌面虚拟列表监听原生阅读容器，移动端监听窗口。
3D 查看器只挂载当前资产，数据协议与发布器不变。

## 6. 边界与深度

不覆盖模板圆角、阴影、边框和原生交互几何。
原生页面面板保留官网自身的边框、圆角和层次。
仅资产自有区域声明 0.5px 边框，不拦截通用 class。
不自造装饰动画；保留原生 reduced-motion 支持。
不复制官网 AI 服务、赞助和反馈功能来冒充可用能力。

## 7. 文案与禁止项

不使用中点分隔符，不重复解释，不制造资产数量。
不把页面变成工程审核控制台。
不将第三方单色图标当作官方彩色标识。
不把测试通过写成用户已经认可视觉。
不复制 Fumadocs 品牌与内容冒充本站身份。

## 8. 响应式与访问性

验证 320、390、768、1024 与桌面宽度。
验证原生侧栏和 Options 菜单、静态直链与语言切换。
验证文档搜索、资产滚动、过滤和真实模型旋转。
确认 HF 彩色标识在桌面与移动菜单均未染色。

## 9. 后续修改契约

先对照官网固定源码，再查已安装版本的原生选项。
新增功能不得重新创建导航、排版主题或菜单壳。
数据与模型不进网站 Git，仍由 Dataset 单独发布。

## References

- [官网布局入口](https://github.com/fuma-nama/fumadocs/blob/ef5911245865c04140e3dae7ff51e7ef6260ef68/apps/docs/app/docs/layout.tsx)
- [官网 Spacious 实现](https://github.com/fuma-nama/fumadocs/tree/ef5911245865c04140e3dae7ff51e7ef6260ef68/apps/docs/components/layouts/spacious)
- [官网样式与 UI 主色](https://github.com/fuma-nama/fumadocs/blob/ef5911245865c04140e3dae7ff51e7ef6260ef68/apps/docs/app/global.css)
- [官网字体](https://github.com/fuma-nama/fumadocs/blob/ef5911245865c04140e3dae7ff51e7ef6260ef68/apps/docs/app/layout.tsx)
- [HF 官方品牌资源](https://huggingface.co/brand)
