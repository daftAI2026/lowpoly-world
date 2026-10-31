/**
 * [INPUT]: 依赖静态 href helper 与静态预渲染路径清单。
 * [OUTPUT]: 验证静态文件 URL 映射及 API、资源、未知路由边界。
 * [POS]: URL 适配离线回归；不启动服务器，也不访问网络。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { describe, expect, it } from 'vite-plus/test';
import { staticPrerenderPages } from '../scripts/static-routes.mjs';
import {
  createStaticUrlRewrite,
  hrefSuffix,
  staticPagePaths,
  toSemanticPathname,
  toStaticFilePathname,
  toStaticHref,
} from '../src/lib/static-href.ts';

function normalizePath(pathname) {
  return pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
}

describe('static href mapping', () => {
  it('keeps its static route allowlist aligned with prerender output', () => {
    const expectedPaths = new Set([
      '/',
      ...staticPrerenderPages
        .filter(({ path }) => path !== '/api/search')
        .map(({ path }) => normalizePath(path)),
    ]);

    expect(new Set(staticPagePaths)).toEqual(expectedPaths);
  });

  it('maps the site root and localized route files in production only', () => {
    expect(toStaticFilePathname('/', true)).toBe('/index.html');
    expect(toStaticFilePathname('/zh/docs/', true)).toBe('/zh/docs/index.html');
    expect(toStaticFilePathname('/en/asset/', true)).toBe('/en/asset/index.html');
    expect(toStaticFilePathname('/zh/docs/', false)).toBe('/zh/docs/');
  });

  it('does not rewrite API, assets, unknown pages, or unknown docs slugs', () => {
    for (const pathname of [
      '/api/search',
      '/assets/app.css',
      '/en/not-found',
      '/zh/docs/not-a-page',
    ]) {
      expect(toStaticFilePathname(pathname, true)).toBe(pathname);
    }
  });

  it('maps only allowlisted index files back to semantic routes', () => {
    expect(toSemanticPathname('/index.html')).toBe('/');
    expect(toSemanticPathname('/zh/docs/index.html')).toBe('/zh/docs/');
    expect(toSemanticPathname('/en/asset/index.html')).toBe('/en/asset/');
    expect(toSemanticPathname('/api/search/index.html')).toBeUndefined();
    expect(toSemanticPathname('/zh/docs/not-a-page/index.html')).toBeUndefined();
  });

  it('preserves query and hash bytes for native links and locale changes', () => {
    const suffix = '?id=A%2fb+%20&view=mesh#section%2fthree';
    const href = `/zh/asset/${suffix}`;

    expect(toStaticHref(href, true)).toBe(`/zh/asset/index.html${suffix}`);
    expect(toStaticHref(href, false)).toBe(href);
    expect(hrefSuffix(`/zh/docs/index.html${suffix}`)).toBe(suffix);
  });

  it('leaves external, protocol-relative, and unknown hrefs untouched', () => {
    for (const href of [
      'https://example.test/zh/docs',
      '//cdn.example.test/zh/docs',
      '/zh/docs/not-a-page',
      '/api/search?locale=zh',
      '/assets/app.css',
    ]) {
      expect(toStaticHref(href, true)).toBe(href);
    }
  });

  it('rewrites only same-origin static routes and keeps URL suffixes', () => {
    const origin = 'https://gallery.example.test';
    const rewrite = createStaticUrlRewrite(true, origin);
    const input = new URL(`/zh/docs/index.html${'?q=%2f#section'}`, origin);
    const inputSuffix = `${input.search}${input.hash}`;
    rewrite.input?.({ url: input });
    expect(input.pathname).toBe('/zh/docs/');
    expect(`${input.search}${input.hash}`).toBe(inputSuffix);

    const output = new URL(`/zh/docs${'?q=%2f#section'}`, origin);
    const outputSuffix = `${output.search}${output.hash}`;
    rewrite.output?.({ url: output });
    expect(output.pathname).toBe('/zh/docs/index.html');
    expect(`${output.search}${output.hash}`).toBe(outputSuffix);

    const api = new URL('/api/search', origin);
    rewrite.output?.({ url: api });
    expect(api.pathname).toBe('/api/search');

    const external = new URL('/zh/docs/index.html', 'https://other.example.test');
    rewrite.input?.({ url: external });
    expect(external.pathname).toBe('/zh/docs/index.html');

    const developmentRewrite = createStaticUrlRewrite(false, origin);
    const development = new URL('/zh/docs', origin);
    developmentRewrite.output?.({ url: development });
    expect(development.pathname).toBe('/zh/docs');
  });
});
