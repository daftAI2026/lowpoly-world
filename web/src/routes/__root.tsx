/**
 * [INPUT]: 依赖 TanStack URL、静态 href helper、隔离 i18next、Fumadocs Provider、原生样式、字体与 Fumadocs/shadcn 许可。
 * [OUTPUT]: 导出按 URL 设置 lang 的 HTML 根路由、语言切换、明暗主题和静态搜索 Provider。
 * [POS]: locale 唯一注入点；语言切换保留 query/hash 原始字节并导航到真实文件。
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
import resizableLicense from '@/assets/LICENSE-react-resizable-panels.txt?url';
import fumadocsLicense from '@/assets/LICENSE-fumadocs.txt?url';
import shadcnLicense from '@/assets/LICENSE-shadcn.txt?url';
import interLicense from '@/assets/OFL-Inter.txt?url';
import hanLicense from '@/assets/OFL-Han-Sans-SC.txt?url';
import monoLicense from '@/assets/OFL-Geist-Mono.txt?url';
import { createBusinessI18n, fumadocsTranslations } from '@/lib/i18n';
import { localizedPath, resolveLocale } from '@/lib/locale';
import { hrefSuffix, toStaticHref } from '@/lib/static-href';
import { RootProvider } from 'fumadocs-ui/provider/tanstack';
import { i18nProvider } from 'fumadocs-ui/i18n';
import SearchDialog from '@/components/search';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'license', href: resizableLicense, type: 'text/plain', title: 'react-resizable-panels MIT' },
      { rel: 'license', href: fumadocsLicense, type: 'text/plain', title: 'Fumadocs MIT' },
      { rel: 'license', href: shadcnLicense, type: 'text/plain', title: 'shadcn/ui MIT' },
      { rel: 'license', href: interLicense, type: 'text/plain', title: 'Inter OFL' },
      { rel: 'license', href: hanLicense, type: 'text/plain', title: 'Han Sans SC OFL' },
      { rel: 'license', href: monoLicense, type: 'text/plain', title: 'Geist Mono OFL' },
    ],
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
      const nextHref = toStaticHref(`${nextPath}${hrefSuffix(location.publicHref)}`, import.meta.env.PROD);
      window.location.assign(nextHref);
    },
  };

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="ui">
        <I18nextProvider i18n={businessI18n}>
          <RootProvider
            i18n={fumadocsI18n}
            theme={{ defaultTheme: 'light', enableSystem: true, disableTransitionOnChange: true }}
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
