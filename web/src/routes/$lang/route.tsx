/**
 * [INPUT]: 依赖 TanStack 的 URL 参数、locale.ts 白名单和双语元数据、静态导航与 AppShell。
 * [OUTPUT]: 导出语言路由边界，拒绝未知语言并在官网同款壳内渲染子页面。
 * [POS]: URL 语言段唯一验证点；不创建 cookie、探测器或共享状态。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { createFileRoute, notFound, Outlet } from '@tanstack/react-router';
import { isLocale, resolveLocale } from '@/lib/locale';
import { messages } from '@/lib/messages';
import { AppShell } from '@/components/app-shell';
import { loadNavigation } from '@/lib/navigation';
import { useFumadocsLoader } from 'fumadocs-core/source/client';

export const Route = createFileRoute('/$lang')({
  beforeLoad: ({ params }) => {
    if (!isLocale(params.lang)) throw notFound();
  },
  loader: ({ params }) => loadNavigation({ data: resolveLocale(params.lang) }),
  head: ({ params }) => {
    const locale = resolveLocale(params.lang);
    return {
      meta: [
        { title: messages[locale].meta.title },
        { name: 'description', content: messages[locale].meta.description },
      ],
    };
  },
  component: LocalizedLayout,
});

function LocalizedLayout() {
  const { lang } = Route.useParams();
  const { pageTree } = useFumadocsLoader(Route.useLoaderData());
  return <AppShell locale={resolveLocale(lang)} tree={pageTree}><Outlet /></AppShell>;
}
