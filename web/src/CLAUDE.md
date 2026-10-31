# src/
> L2 | 父级: ../CLAUDE.md

## 成员清单

router.tsx: 接入文件路由树；生产 URL 映射到 index.html，开发 URL 保留语义路径。
routeTree.gen.ts: 由 TanStack Router Generator 输出路由与类型契约；检查前生成。
components/: 首页工作台、资产详情、虚拟网格、模型查看器和 Base UI 控件。
lib/: Dataset 读取、静态 URL 映射、元数据边界、筛选算法、locale 与文档源。
routes/: 根英文首页、语言前缀页面和静态搜索入口。
styles/: token、shell、目录、详情和响应式样式分层。
types/: `<model-viewer>` Web Component 的 React JSX 类型扩展。

浏览器只读公开 Dataset；发布器与部署器不在此模块。单件查看器按需加载。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
