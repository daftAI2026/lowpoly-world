/**
 * [INPUT]: 依赖官网 Spacious 布局、共享导航与调用方的 shadcn 筛选内容。
 * [OUTPUT]: 导出全屏 GalleryShell；原生 actions 插槽组合业务动作与官方导航。
 * [POS]: 展厅和单件详情的布局边界；文档仍由 DocsShell 独立承载。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import {
  CatalogSearchContext,
  catalogSearchSlots,
  type CatalogSearchBinding,
} from './catalog-search';
import { createContext, use, type ReactNode, type ComponentProps } from 'react';
import { HeaderActions } from 'fumadocs-ui/layouts/spacious/slots/actions';
import { cn } from '@/lib/utils';
import { DocsLayout } from 'fumadocs-ui/layouts/spacious';
import { DocsPage } from 'fumadocs-ui/layouts/spacious/page';
import { baseOptions } from '@/lib/layout.shared';
import type { Locale } from '@/lib/locale';
import { appName } from '@/lib/shared';

const GalleryActionsContext = createContext<ReactNode>(null);
function GalleryHeaderActions({ className, ...props }: ComponentProps<'div'>) {
  const actions = use(GalleryActionsContext);
  return (
    <div className={cn('gallery-header-actions flex items-center gap-1', className)} {...props}>
      {actions}
      <HeaderActions />
    </div>
  );
}

export function GalleryShell({
  locale,
  sidebar,
  actions,
  search,
  children,
}: {
  locale: Locale;
  sidebar?: ReactNode;
  actions?: ReactNode;
  search?: CatalogSearchBinding;
  children: ReactNode;
}) {
  const options = baseOptions(locale);
  return (
    <CatalogSearchContext value={search ?? null}>
      <GalleryActionsContext value={actions}>
        <DocsLayout
          {...options}
          tree={{ name: appName, children: [] }}
          tabs={false}
          searchToggle={{ enabled: Boolean(search) }}
          slots={{
            ...(search ? { searchTrigger: catalogSearchSlots } : {}),
            ...(actions ? { actions: GalleryHeaderActions } : {}),
          }}
          links={[
            ...(options.links ?? []),
            ...(sidebar
              ? [{ type: 'custom' as const, on: 'menu' as const, children: sidebar }]
              : []),
          ]}
        >
          <DocsPage
            full
            role="main"
            className="site-main gallery-main layout:[--fd-page-width:100%]"
            breadcrumb={{ enabled: false }}
            footer={{ enabled: false }}
            tableOfContent={{ enabled: false }}
            tableOfContentPopover={{ enabled: false }}
          >
            {children}
          </DocsPage>
        </DocsLayout>
      </GalleryActionsContext>
    </CatalogSearchContext>
  );
}
