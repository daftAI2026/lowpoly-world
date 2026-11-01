/**
 * [INPUT]: 依赖服务端 MDX 页面树、locale 与静态函数中间件。
 * [OUTPUT]: 导出可预渲染的双语导航读取函数。
 * [POS]: 根入口和语言父路由共享树快照；不将 server collection 打入浏览器。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { createServerFn } from '@tanstack/react-start';
import { staticFunctionMiddleware } from '@tanstack/start-static-server-functions';
import type { Locale } from './locale';
import { source } from './source.server';

export const loadNavigation = createServerFn({ method: 'GET' })
  .validator((locale: Locale) => locale)
  .middleware([staticFunctionMiddleware])
  .handler(async ({ data: locale }) => ({
    pageTree: await source.serializePageTree(source.getPageTree(locale)),
  }));
