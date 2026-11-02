/**
 * [INPUT]: 依赖 TanStack 的 URL 参数、locale.ts 白名单和双语元数据。
 * [OUTPUT]: 导出语言路由边界，拒绝未知语言并渲染独立布局的子页面。
 * [POS]: URL 语言段唯一验证点；不创建 cookie、探测器或共享状态。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { createFileRoute, notFound, Outlet } from '@tanstack/react-router';
import { isLocale, resolveLocale } from '@/lib/locale';
import { messages } from '@/lib/messages';

export const Route = createFileRoute('/$lang')({
  beforeLoad: ({ params }) => {
    if (!isLocale(params.lang)) throw notFound();
  },
  head: ({ params }) => {
    const locale = resolveLocale(params.lang);
    return {
      meta: [
        { title: messages[locale].meta.title },
        { name: 'description', content: messages[locale].meta.description },
      ],
    };
  },
  component: () => <Outlet />,
});
