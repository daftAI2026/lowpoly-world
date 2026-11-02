/**
 * [INPUT]: 依赖官网同款 Spacious、静态页面树与共享品牌外链。
 * [OUTPUT]: 导出文档专用的 DocsShell，保留原生侧栏、右上操作和移动菜单。
 * [POS]: 仅供文档路由使用；展示工作区不进入该阅读布局。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import type { Root } from 'fumadocs-core/page-tree';
import { DocsLayout } from 'fumadocs-ui/layouts/spacious';
import type { ReactNode } from 'react';
import { baseOptions } from '@/lib/layout.shared';
import { localizedHomePath, type Locale } from '@/lib/locale';
import { messages } from '@/lib/messages';

export function DocsShell({ locale, tree, children }: { locale: Locale; tree: Root; children: ReactNode }) {
  const options = baseOptions(locale);
  const labels = messages[locale].navigation;
  const navigation: Root = {
    ...tree,
    children: [
      { type: 'page', name: labels.assets, url: localizedHomePath(locale) },
      { type: 'separator', name: labels.docs },
      ...tree.children,
    ],
  };
  return (
    <DocsLayout {...options} links={options.links?.filter((item) => item.type === 'icon')} tree={navigation}>
      {children}
    </DocsLayout>
  );
}
