/**
 * [INPUT]: 接收 TanStack 路由参数、当前路径和公开资产名称字段。
 * [OUTPUT]: 导出语言集合、默认回退、静态路径、首页路径、正文语言与资产名选择函数。
 * [POS]: URL 是网站语言的唯一来源；不读取 cookie 或浏览器语言。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import type { CatalogAsset } from './catalog';

export const supportedLocales = ['en', 'zh'] as const;
export type Locale = (typeof supportedLocales)[number];
export const defaultLocale: Locale = 'en';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && supportedLocales.includes(value as Locale);
}

export function resolveLocale(value: unknown): Locale {
  return isLocale(value) ? value : defaultLocale;
}

export function localeFromPath(pathname: string): Locale {
  return resolveLocale(pathname.split('/')[1]);
}

/** 语言切换保留当前页面路径，并始终生成可静态托管的显式前缀。 */
export function localizedPath(pathname: string, locale: Locale): string {
  const absolutePath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const withoutLocale = absolutePath.replace(/^\/(?:en|zh)(?=\/|$)/, '') || '/';
  return `/${locale}${withoutLocale.startsWith('/') ? withoutLocale : `/${withoutLocale}`}`;
}

/** 目录首页同时是资产详情页的返回目标。 */
export function localizedHomePath(locale: Locale): string {
  return localizedPath('/', locale);
}

/** 中文名缺失时显示原始英文名；不翻译目录中的资产字段。 */
export function getAssetDisplayName(
  asset: Pick<CatalogAsset, 'name_en' | 'name_zh'>,
  locale: Locale,
): string {
  const chineseName = asset.name_zh.trim();
  return locale === 'zh' && chineseName ? chineseName : asset.name_en;
}

/** 正文语言来自源文件名，不能用请求语言冒充已翻译正文。 */
export function documentLocaleFromPath(path: string): Locale {
  return resolveLocale(path.match(/\.([a-z]+)\.mdx$/)?.[1]);
}
