/**
 * [INPUT]: 依赖 static-pages.ts 的页面注册表与静态搜索端点。
 * [OUTPUT]: 导出预渲染路径和 smoke 检查使用的文档清单。
 * [POS]: Vite 配置与构建断言的薄适配；不重复定义页面。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { staticDocumentRoutes } from '../src/lib/static-pages.ts';
export { documentationPages } from '../src/lib/static-pages.ts';

export const staticPrerenderPages = [
  ...staticDocumentRoutes.map((path) => ({ path })),
  { path: '/api/search' },
];
