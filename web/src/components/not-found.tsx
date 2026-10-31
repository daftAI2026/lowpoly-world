/**
 * [INPUT]: 依赖当前 URL locale、Fumadocs 首页布局与双语 404 标签。
 * [OUTPUT]: 导出保留 URL locale 的站点级 404 视图。
 * [POS]: TanStack Router 的兜底页面；不改写数据错误为成功状态。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useRouterState } from '@tanstack/react-router';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { DefaultNotFound } from 'fumadocs-ui/layouts/home/not-found';
import { baseOptions } from '@/lib/layout.shared';
import { localeFromPath } from '@/lib/locale';

export function NotFound() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const locale = localeFromPath(pathname);

  return (
    <HomeLayout {...baseOptions(locale)}>
      <DefaultNotFound />
    </HomeLayout>
  );
}
