/**
 * [INPUT]: 依赖默认英文 locale 与共享首页视图。
 * [OUTPUT]: 导出 `/` 的静态英文入口。
 * [POS]: 保留站点根 URL；所有子页面链接使用明确语言前缀。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { createFileRoute } from '@tanstack/react-router';
import { HomePage } from '@/components/home-page';
import { defaultLocale } from '@/lib/locale';
import { messages } from '@/lib/messages';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: messages.en.meta.title },
      { name: 'description', content: messages.en.meta.description },
    ],
  }),
  component: () => <HomePage locale={defaultLocale} />,
});
