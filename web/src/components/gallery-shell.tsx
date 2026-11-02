/**
 * [INPUT]: 依赖官网 Spacious 布局、共享导航与调用方的 shadcn 筛选内容。
 * [OUTPUT]: 导出占满视口的 GalleryShell，复用原生侧栏、抽屉与主面板。
 * [POS]: 展厅和单件详情的布局边界；文档仍由 DocsShell 独立承载。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import {
  CatalogSearchContext,
  catalogSearchSlots,
  type CatalogSearchBinding,
} from './catalog-search';
import type { ReactNode } from 'react';
import { DocsLayout } from 'fumadocs-ui/layouts/spacious';
import { DocsPage } from 'fumadocs-ui/layouts/spacious/page';
import { baseOptions } from '@/lib/layout.shared';
import type { Locale } from '@/lib/locale';
import { appName } from '@/lib/shared';

export function GalleryShell({
  locale,
  sidebar,
  search,
  children,
}: {
  locale: Locale;
  sidebar?: ReactNode;
  search?: CatalogSearchBinding;
  children: ReactNode;
}) {
  const options = baseOptions(locale);
  return (
    <CatalogSearchContext value={search ?? null}>
      <DocsLayout
        {...options}
        tree={{ name: appName, children: [] }}
        tabs={false}
        searchToggle={{ enabled: Boolean(search) }}
        slots={search ? { searchTrigger: catalogSearchSlots } : undefined}
        links={[
          ...(options.links ?? []),
          ...(sidebar ? [{ type: 'custom' as const, on: 'menu' as const, children: sidebar }] : []),
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
    </CatalogSearchContext>
  );
}
