/**
 * [INPUT]: 依赖原生 Notebook 壳、URL locale 与编译后的 MDX。
 * [OUTPUT]: 导出 `/en/docs/*`、`/zh/docs/*` 页面；读取对应译稿，缺译时标明英文回退。
 * [POS]: 应用内的使用文档；原生顶部导航与侧栏不另造壳。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { createFileRoute, notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { staticFunctionMiddleware } from '@tanstack/start-static-server-functions';
import { useFumadocsLoader } from 'fumadocs-core/source/client';
import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import { DocsBody, DocsPage, DocsTitle, DocsDescription } from 'fumadocs-ui/layouts/notebook/page';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useMDXComponents } from '@/components/mdx';
import { baseOptions } from '@/lib/layout.shared';
import { documentLocaleFromPath, resolveLocale, type Locale } from '@/lib/locale';
import browserCollections from '../../../../.source/browser';
import { source } from '@/lib/source.server';

const clientDocs = browserCollections.docs.createClientLoader<{ contentLocale: Locale; fallbackNotice: string | null }>({
  component({ frontmatter, toc, default: MDX }, { contentLocale, fallbackNotice }) {
    return (
      <DocsPage toc={toc} lang={contentLocale}>
        <DocsTitle>{frontmatter.title}</DocsTitle>
        <DocsDescription>{frontmatter.description}</DocsDescription>
        <DocsBody>
          {fallbackNotice && <aside className="docs-locale-notice" role="note">{fallbackNotice}</aside>}
          <MDX components={useMDXComponents()} />
        </DocsBody>
      </DocsPage>
    );
  },
});

export const Route = createFileRoute('/$lang/docs/$')({
  component: Page,
  loader: async ({ params }) => {
    const slugs = params._splat?.split('/') ?? [];
    const locale = resolveLocale(params.lang);
    const data = await staticDocLoader({ data: { slugs, locale } });
    await clientDocs.preload(data.path);
    return data;
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.title} | Lowpoly World` },
      { name: 'description', content: loaderData.description },
    ] : [],
  }),
});

const staticDocLoader = createServerFn({ method: 'GET' })
  .validator((input: { slugs: string[]; locale: Locale }) => input)
  .middleware([staticFunctionMiddleware])
  .handler(async ({ data: { slugs, locale } }) => {
    const page = source.getPage(slugs, locale);
    if (!page) throw notFound();

    return {
      path: page.path,
      locale,
      contentLocale: documentLocaleFromPath(page.path),
      title: page.data.title,
      description: page.data.description,
      pageTree: await source.serializePageTree(source.getPageTree(locale)),
    };
  });

function Content({ path, locale }: { path: string; locale: Locale }) {
  const { t } = useTranslation();
  const contentLocale = documentLocaleFromPath(path);
  return clientDocs.useContent(path, {
    contentLocale,
    fallbackNotice: locale !== contentLocale ? t('docs.englishFallback') : null,
  });
}

function Page() {
  const data = useFumadocsLoader(Route.useLoaderData());
  const locale = resolveLocale(data.locale);
  const options = baseOptions(locale);

  return (
    <DocsLayout {...options} nav={{ ...options.nav, mode: 'top' }} tree={data.pageTree}>
      <Suspense>
        <Content path={data.path} locale={locale} />
      </Suspense>
    </DocsLayout>
  );
}
