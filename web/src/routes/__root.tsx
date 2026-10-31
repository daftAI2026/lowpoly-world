/**
 * [INPUT]: 依赖 TanStack URL 参数、隔离 i18next 工厂、Fumadocs Provider 与样式。
 * [OUTPUT]: 导出按 URL 设置 lang 的 HTML 根路由、静态搜索 Provider 和 Scripts。
 * [POS]: locale 唯一注入点；每个 SSR 树各自建实例，并固定浅色主题。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useParams,
  useRouterState,
} from '@tanstack/react-router';
import { useMemo } from 'react';
import { I18nextProvider } from 'react-i18next';
import appCss from '@/styles/app.css?url';
import { createBusinessI18n, fumadocsTranslations } from '@/lib/i18n';
import { localizedPath, resolveLocale } from '@/lib/locale';
import { RootProvider } from 'fumadocs-ui/provider/tanstack';
import { i18nProvider } from 'fumadocs-ui/i18n';
import SearchDialog from '@/components/search';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: RootComponent,
});

function RootComponent() {
  const { lang } = useParams({ strict: false });
  const locale = resolveLocale(lang);
  const businessI18n = useMemo(() => createBusinessI18n(locale), [locale]);
  const location = useRouterState({ select: (state) => state.location });
  const fumadocsProvider = i18nProvider(fumadocsTranslations, locale);
  const fumadocsI18n = {
    ...fumadocsProvider,
    onLocaleChange: (nextLocale: string) => {
      const nextPath = localizedPath(location.pathname, resolveLocale(nextLocale));
      const hash = location.hash ? `#${location.hash}` : '';
      window.location.assign(`${nextPath}${location.searchStr}${hash}`);
    },
  };

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <I18nextProvider i18n={businessI18n}>
          <RootProvider
            i18n={fumadocsI18n}
            theme={{ enabled: false }}
            search={{ SearchDialog }}
          >
            <Outlet />
          </RootProvider>
        </I18nextProvider>
        <Scripts />
      </body>
    </html>
  );
}
