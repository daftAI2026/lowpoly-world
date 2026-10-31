/**
 * [INPUT]: 依赖静态页面路径表、生产模式与当前站点 origin。
 * [OUTPUT]: 导出语义路由和真实 index.html 文件路径的双向转换。
 * [POS]: 静态部署 URL 边界；仅改写清单内页面，不碰 API、资源和未知路径。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import type { LocationRewrite } from '@tanstack/react-router';

import { staticPagePaths } from './static-pages.ts';
export { staticPagePaths } from './static-pages.ts';

const staticPagePathSet = new Set<string>(staticPagePaths);

function normalizeRoutePath(pathname: string): string {
  if (pathname === '/') return '/';
  return pathname.replace(/\/+$/, '');
}

function isStaticPagePath(pathname: string): boolean {
  return staticPagePathSet.has(normalizeRoutePath(pathname));
}

/** 将清单内语义路由映射为静态文件路径。 */
export function toStaticFilePathname(pathname: string, production: boolean): string {
  if (!production || !isStaticPagePath(pathname)) return pathname;
  const routePath = normalizeRoutePath(pathname);
  return routePath === '/' ? '/index.html' : `${routePath}/index.html`;
}

/** 将静态 index.html 路径还原为 TanStack 语义路由。 */
export function toSemanticPathname(pathname: string): string | undefined {
  if (pathname === '/index.html') return '/';
  if (!pathname.endsWith('/index.html')) return undefined;

  const semanticPath = pathname.slice(0, -'index.html'.length);
  return isStaticPagePath(semanticPath) ? semanticPath : undefined;
}

function suffixOffset(href: string): number {
  const query = href.indexOf('?');
  const hash = href.indexOf('#');
  if (query < 0) return hash;
  if (hash < 0) return query;
  return Math.min(query, hash);
}

/** 只替换路径前缀，保留 query 与 hash 的原始字节。 */
export function toStaticHref(href: string, production: boolean): string {
  if (!production) return href;
  const suffix = suffixOffset(href);
  const pathname = suffix < 0 ? href : href.slice(0, suffix);
  if (!pathname.startsWith('/') || pathname.startsWith('//')) return href;

  const filePath = toStaticFilePathname(pathname, true);
  return filePath === pathname ? href : `${filePath}${suffix < 0 ? '' : href.slice(suffix)}`;
}

/** 为 Router 提供静态文件入站与出站 URL 规则。 */
export function createStaticUrlRewrite(
  production: boolean,
  origin: string,
): LocationRewrite {
  return {
    input: ({ url }) => {
      if (url.origin !== origin) return undefined;
      const semanticPath = toSemanticPathname(url.pathname);
      if (semanticPath) url.pathname = semanticPath;
      return url;
    },
    output: production
      ? ({ url }) => {
          if (url.origin !== origin) return undefined;
          url.pathname = toStaticFilePathname(url.pathname, true);
          return url;
        }
      : undefined,
  };
}

/** 提取当前公开 URL 的原始 search/hash 后缀。 */
export function hrefSuffix(href: string): string {
  const suffix = suffixOffset(href);
  return suffix < 0 ? '' : href.slice(suffix);
}
