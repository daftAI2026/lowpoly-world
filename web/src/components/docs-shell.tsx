/**
 * [INPUT]: 依赖官网同款 Spacious、静态页面树与共享品牌外链。
 * [OUTPUT]: 导出 DocsShell，正文树留在侧栏，模型互链进入右上操作。
 * [POS]: 仅供文档路由使用；展示工作区不进入该阅读布局。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import type { Root } from 'fumadocs-core/page-tree';
import { DocsLayout } from 'fumadocs-ui/layouts/spacious';
import type { ReactNode } from 'react';
import { baseOptions } from '@/lib/layout.shared';
import { type Locale } from '@/lib/locale';

export function DocsShell({
  locale,
  tree,
  children,
}: {
  locale: Locale;
  tree: Root;
  children: ReactNode;
}) {
  const options = baseOptions(locale, 'docs');
  return (
    <DocsLayout {...options} tree={tree}>
      {children}
    </DocsLayout>
  );
}
