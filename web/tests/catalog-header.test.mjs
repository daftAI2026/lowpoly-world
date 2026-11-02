/**
 * [INPUT]: 依赖展示首页、工作区工具栏与布局样式。
 * [OUTPUT]: 验证无重复大标题、按需分类路径与唯一模型搜索及窄屏换行边界。
 * [POS]: 展厅纵向空间回归；浏览器另测真实结果区起点。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { describe, expect, it } from 'vite-plus/test';
import { readFile } from 'node:fs/promises';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { WorkspaceToolbar } from '../src/components/workspace-toolbar.tsx';
import { defaultWorkspace } from '../src/lib/workspace-state.ts';
import { createBusinessI18n } from '../src/lib/i18n.ts';
function renderToolbar(categoryPath) {
  const state = defaultWorkspace();
  state.filters.categoryPath = categoryPath;
  const noop = () => {};
  return renderToStaticMarkup(createElement(I18nextProvider, { i18n: createBusinessI18n('en') },
    createElement(WorkspaceToolbar, { state, update: noop, visible: 0, total: 0, selectedCount: 0,
      onSelectResults: noop, onReview: noop, hiddenGroups: [], onHiddenGroups: noop, onReopen: null })));
}
const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

describe('Compact catalog header', () => {
  it('renders no default breadcrumb but retains the selected category hierarchy', () => {
    expect(renderToolbar(null)).not.toContain('data-slot="breadcrumb"');
    const filtered = renderToolbar('Props/Furniture');
    expect(filtered).toContain('data-slot="breadcrumb"');
    expect(filtered).toContain('Furniture');
    expect(filtered).toContain('aria-current="page"');
    expect(filtered.indexOf('class="filter-chips"')).toBeLessThan(filtered.indexOf('data-slot="breadcrumb"'));
  });
  it('keeps the collection heading accessible without a visible hero row', async () => {
    const home = await read('../src/components/home-page.tsx');
    expect(home).toMatch(/<h1 className="visually-hidden">\{t\('home.collectionTitle'\)\}<\/h1>/);
    expect(home).not.toContain('className="gallery-title"');
  });
  it('shows category navigation only in the active filter row and keeps search out of the toolbar', async () => {
    const source = await read('../src/components/workspace-toolbar.tsx');
    expect(source).toMatch(
      /<div className="workspace-heading">\s*<div className="catalog-toolbar">/,
    );
    expect(source).toMatch(/<div className="filter-chips">\s*\{f.categoryPath && \(\s*<Breadcrumb/);
    expect(source).toContain("parts.slice(0, index + 1).join('/')");
    expect(source).toContain('filters: { ...emptyFilters }');
    expect(source).not.toContain('type="search"');
    const shell = await read('../src/components/gallery-shell.tsx');
    expect(shell).toContain('searchTrigger: catalogSearchSlots');
    expect(shell).toContain('searchToggle={{ enabled: Boolean(search) }}');
  });
  it('does not reserve a blank sidebar column above the catalog', async () => {
    const controls = await read('../src/styles/workspace-controls.css');
    const shell = await read('../src/styles/shell.css');
    expect(controls).toMatch(/\.workspace-heading\s*\{[^}]*margin-bottom:\s*8px;/s);
    expect(controls).not.toContain('grid-template-columns: 232px');
    expect(controls).toMatch(/\.asset-breadcrumb\s*\{[^}]*flex-wrap: wrap/s);
    expect(shell).not.toContain('.gallery-title');
  });
});
