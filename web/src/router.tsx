/**
 * [INPUT]: 依赖 TanStack 文件路由树、站点 404 与静态 URL 转换规则。
 * [OUTPUT]: 导出应用 Router 工厂，启用预加载、滚动恢复与双向文件 URL 转换。
 * [POS]: 文件路由树唯一入口；生产链接指向 index.html，开发路径保持语义形式。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { NotFound } from '@/components/not-found';
import { createStaticUrlRewrite } from '@/lib/static-href';

export function getRouter() {
  const origin = typeof window === 'undefined' ? 'http://localhost' : window.location.origin;
  return createTanStackRouter({
    routeTree,
    origin,
    rewrite: createStaticUrlRewrite(import.meta.env.PROD, origin),
    defaultPreload: 'intent',
    scrollRestoration: true,
    defaultNotFoundComponent: NotFound,
  });
}
