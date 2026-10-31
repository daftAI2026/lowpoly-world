# web/
> L2 | 父级: ../CLAUDE.md

## 成员清单

package.json: 锁定前端依赖与本地命令；types:check 先生成 Fumadocs 与路由类型源。
package-lock.json: 固定 npm 依赖解析结果，供离线可复现安装。
vite.config.ts: 接入 TanStack Start、Fumadocs MDX 和静态预渲染。
source.config.ts: 声明只包含 `.mdx` 页面、排除 GEB 地图的 Fumadocs 集合。
tsconfig.json: 配置严格 TypeScript 与 `@/` 源码别名。
.gitignore: 排除构建产物、依赖目录和 `.tanstack` 缓存。
README.md: 说明前端运行方式、数据边界和静态输出目标。
src/: 路由、界面、目录读取和全局样式。
content/: Fumadocs 编译期文档源。
hf-space/: Static Space YAML 与构建路径草案。
tests/: Node 内置测试运行器的目录协议离线测试。
scripts/: 用 Fumadocs CLI 与 TanStack Router Generator 预备类型检查源。

Dataset 发布器不读写 Space。Space 只托管静态构建输出。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
