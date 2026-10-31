# scripts/
> L2 | 父级: ../CLAUDE.md

## 成员清单

generate-route-tree.mjs: 在 tsc 前加载 Vite 配置并生成 `src/routeTree.gen.ts`。
static-routes.mjs: 从 static-pages.ts 派生预渲染路径，再加入静态搜索端点。
verify-static-output.mjs: 检查 client SPA、资源、所有静态路由、双语文档标题、正文语言、lang、搜索索引、导航真实文件和地图隔离。

`routes:generate` 启动 Vite 服务对象但不监听端口。`build:smoke` 只读构建输出。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
