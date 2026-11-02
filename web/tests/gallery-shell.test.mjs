/**
 * [INPUT]: 依赖原生展厅壳、搜索插槽、资产卡与官方来源清单。
 * [OUTPUT]: 验证全屏复用、语义插槽、静态链接与无重复区域。
 * [POS]: 模型页改造契约；真实几何与移动抽屉由浏览器另验。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { readFile } from 'node:fs/promises';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { describe, it, expect } from 'vite-plus/test';
import { CatalogSearchContext, catalogSearchSlots } from '../src/components/catalog-search.tsx';
import { createBusinessI18n } from '../src/lib/i18n.ts';
import { messages } from '../src/lib/messages.ts';
const read = (p) => readFile(new URL(p, import.meta.url), 'utf8');

describe('Native gallery shell adaptation', () => {
  it('uses the upstream full-page extension rather than a recreated header or sidebar', async () => {
    const shell = await read('../src/components/gallery-shell.tsx');
    expect(shell).toContain("from 'fumadocs-ui/layouts/spacious'");
    expect(shell).toContain("from 'fumadocs-ui/layouts/spacious/page'");
    expect(shell).toContain('layout:[--fd-page-width:100%]');
    expect(shell).toContain('children: sidebar');
    expect(shell).not.toMatch(/<(?:header|nav|aside)\b/);
    expect(shell).not.toContain('source.server');
    for (const region of ['breadcrumb', 'footer', 'tableOfContent', 'tableOfContentPopover']) {
      expect(shell).toContain(`${region}={{ enabled: false }}`);
    }
  });
  it('replaces the original search with one controlled asset input, not a second document search', () => {
    for (const locale of ['en', 'zh']) {
      const html = renderToStaticMarkup(createElement(I18nextProvider, { i18n: createBusinessI18n(locale) },
        createElement(CatalogSearchContext, { value: { query: '00799', onQueryChange: () => {} } },
          createElement(catalogSearchSlots.full))));
      expect(html.match(/type="search"/g)).toHaveLength(1);
      expect(html).toContain('value="00799"');
      expect(html).toContain(messages[locale].workspace.searchModels);
      expect(html).not.toContain('workspace.searchModels');
    }
  });
  it('keeps the existing workspace and static detail destinations intact', async () => {
    const browser = await read('../src/components/catalog-browser.tsx');
    expect(browser).toContain('sidebar={sidebar}');
    expect(browser).not.toContain('workspace-filter-rail');
    expect(browser).toContain('<ResizablePanelGroup');
    const card = await read('../src/components/asset-card.tsx');
    expect(card).toContain('href={toStaticHref(href, import.meta.env.PROD)}');
    expect(card).toContain('shouldOpenPreview');
    expect(card).toContain('<CardHeader');
  });
  it('keeps thumbnail density effective on the full-width panel', async () => {
    const grid = await read('../src/components/catalog-grid.tsx');
    expect(grid).not.toContain('Math.min(6,');
    expect(grid).toContain('Math.floor((width + 18) / (minCardWidth + 18))');
  });
  it('uses familiar English view labels instead of invented labels', () => {
    expect(messages.en.workspace.grid).toBe('Grid');
    expect(messages.en.workspace.list).toBe('List');
  });
});
