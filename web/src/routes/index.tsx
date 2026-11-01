/**
 * [INPUT]: 依赖默认英文 locale、静态导航、AppShell 与首页。
 * [OUTPUT]: 导出 `/` 的静态英文入口。
 * [POS]: 保留站点根 URL；所有子页面链接使用明确语言前缀。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { createFileRoute } from '@tanstack/react-router';
import { HomePage } from '@/components/home-page';
import { defaultLocale } from '@/lib/locale';
import { messages } from '@/lib/messages';
import { AppShell } from '@/components/app-shell';
import { loadNavigation } from '@/lib/navigation';
import { useFumadocsLoader } from 'fumadocs-core/source/client';

export const Route = createFileRoute('/')({
  loader: () => loadNavigation({ data: defaultLocale }),
  head: () => ({
    meta: [
      { title: messages.en.meta.title },
      { name: 'description', content: messages.en.meta.description },
    ],
  }),
  component: RootHome,
});

function RootHome() {
  const { pageTree } = useFumadocsLoader(Route.useLoaderData());
  return <AppShell locale={defaultLocale} tree={pageTree}><HomePage locale={defaultLocale} /></AppShell>;
}
