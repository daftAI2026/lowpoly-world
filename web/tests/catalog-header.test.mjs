/**
 * [INPUT]: 依赖展示首页、工作区工具栏与布局样式。
 * [OUTPUT]: 验证无重复大标题、同排上下文与搜索及窄屏换行边界。
 * [POS]: 展厅纵向空间回归；浏览器另测真实结果区起点。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { describe, expect, it } from 'vite-plus/test';
import { readFile } from 'node:fs/promises';
const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

describe('Compact catalog header', () => {
  it('keeps the collection heading accessible without a visible hero row', async () => {
    const home = await read('../src/components/home-page.tsx');
    expect(home).toMatch(/<h1 className="visually-hidden">\{t\('home.collectionTitle'\)\}<\/h1>/);
    expect(home).not.toContain('className="gallery-title"');
  });
  it('places category context and search in one shared heading row', async () => {
    const source = await read('../src/components/workspace-toolbar.tsx');
    expect(source).toMatch(/<div className="workspace-heading">\s*<Breadcrumb/);
    expect(source).toMatch(/<\/Breadcrumb>\s*<div className="catalog-toolbar">/);
    expect(source).toMatch(/<\/div>\s*<\/div>\s*<div className="workspace-controls">/);
  });
  it('uses a single compact heading grid, with responsive stacking and no old title spacing', async () => {
    const controls = await read('../src/styles/workspace-controls.css');
    const shell = await read('../src/styles/shell.css');
    expect(controls).toMatch(/\.workspace-heading\s*\{[^}]*margin-bottom:\s*8px;/s);
    expect(controls).toMatch(
      /@container\s*\(min-width:\s*900px\)\s*\{\s*\.workspace-heading\s*\{[^}]*grid-template-columns:\s*232px minmax\(0, 1fr\);/s,
    );
    expect(shell).not.toContain('.gallery-title');
  });
});
