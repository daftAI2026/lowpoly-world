# ui/

> L2 | 父级: ../CLAUDE.md

## 成员清单

button.tsx: shadcn/ui 官方 Base Nova，通用动作与按钮链接样式。
input.tsx: shadcn/ui 官方 Base Nova，文本与搜索输入。
checkbox.tsx: shadcn/ui 官方 Base Nova，独立勾选与筛选布尔值；未选边线读取 muted-foreground。
native-select.tsx: shadcn/ui 官方 Base Nova，原生下拉选择与选项。
textarea.tsx: shadcn/ui 官方 Base Nova，只读下载命令文本。
popover.tsx: shadcn/ui 官方 Base Nova，带焦点返回的偏好面板。
collapsible.tsx: shadcn/ui 官方 Base Nova，筛选与元数据折叠。
toggle.tsx: shadcn/ui 官方 Base Nova，互斥视图的切换外观。
toggle-group.tsx: shadcn/ui 官方 Base Nova，方向键可访问的视图切换。
breadcrumb.tsx: shadcn/ui 官方 Base Nova，分类导航的列表语义。
resizable.tsx: shadcn/ui 官方 Base Nova，官方可访问分栏与分隔条。
label.tsx: shadcn/ui 官方 Base Nova，表单控件的可见标签。
badge.tsx: shadcn/ui 官方 Base Nova，非交互文件格式标签。
registry.sources.json: 官方 URL、快照摘要与本地外观适配清单，不参与运行。

本目录只复用官方组件。业务模块不得重新定义基础交互。
只使用 Base UI 版本，不引入 Radix 或第二套主题。
文档和导航继续使用 FU 原生组件。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
