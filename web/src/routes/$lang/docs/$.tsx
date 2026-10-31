/**
 * [INPUT]: 依赖 URL locale、server 页面树与 `.source/browser` MDX 加载器。
 * [OUTPUT]: 导出 `/en/docs/*`、`/zh/docs/*` 页面；中文缺译时显示英文回退提示。
 * [POS]: 分开读取 SSR 导航与浏览器正文；正文通过 Fumadocs `useContent` 渲染。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { createFileRoute, notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { staticFunctionMiddleware } from '@tanstack/start-static-server-functions';
import { useFumadocsLoader } from 'fumadocs-core/source/client';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { DocsBody, DocsPage, DocsTitle, DocsDescription } from 'fumadocs-ui/layouts/docs/page';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useMDXComponents } from '@/components/mdx';
import { baseOptions } from '@/lib/layout.shared';
import { resolveLocale, type Locale } from '@/lib/locale';
import browserCollections from '../../../../.source/browser';
import { source } from '@/lib/source.server';

const clientDocs = browserCollections.docs.createClientLoader({
  component({ frontmatter, toc, default: MDX }) {
    return (
      <DocsPage toc={toc}>
        <DocsTitle>{frontmatter.title}</DocsTitle>
        <DocsDescription>{frontmatter.description}</DocsDescription>
        <DocsBody>
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
      pageTree: await source.serializePageTree(source.getPageTree(locale)),
    };
  });

function Content({ path }: { path: string }) {
  return clientDocs.useContent(path);
}

function Page() {
  const data = useFumadocsLoader(Route.useLoaderData());
  const { t } = useTranslation();
  const locale = resolveLocale(data.locale);

  return (
    <DocsLayout {...baseOptions(locale)} tree={data.pageTree}>
      {locale === 'zh' && (
        <aside className="docs-locale-notice" role="note">
          {t('docs.englishFallback')}
        </aside>
      )}
      <div lang="en">
        <Suspense>
          <Content path={data.path} />
        </Suspense>
      </div>
    </DocsLayout>
  );
}
