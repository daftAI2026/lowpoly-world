/**
 * [INPUT]: 依赖紧凑卡片、结果滚动与预览工具栏源码。
 * [OUTPUT]: 验证不强制名称编号空行、真实主滚动宿主与图标停靠菜单。
 * [POS]: 用户截图回归；真实几何另由浏览器验证。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { describe, it, expect } from 'vite-plus/test';
import { readFile } from 'node:fs/promises';
const read = (name) => readFile(new URL(name, import.meta.url), 'utf8');
describe('Compact asset workspace', () => {
  it('keeps name and ID in a compact wrapping row rather than forced empty space', async () => {
    const css = await read('../src/styles/catalog.css');
    expect(css).not.toContain('min-height: 2.8em');
    expect(css).toMatch(/\.asset-card-heading\s*\{[^}]*flex-direction: row/s);
    expect(css).toMatch(/\.asset-card-heading\s*\{[^}]*align-items: first baseline/s);
  });
  it('lets the FU main panel scroll natural results, not a full-height fake scroll ancestor', async () => {
    const css = await read('../src/styles/workspace.css');
    expect(css).toMatch(/#results\s*>\s*div\s*\{\s*overflow: visible !important/);
    const browser = await read('../src/components/catalog-browser.tsx');
    expect(browser).toContain('availableHeight');
    expect(browser).not.toContain('height: host.clientHeight');
    const grid = await read('../src/components/catalog-grid.tsx');
    expect(grid).toContain('[assets.length, scrollScope]');
  });
  it('keeps the preview identity and icon actions together without a separate ID row', async () => {
    const source = await read('../src/components/asset-preview.tsx');
    expect(source).toContain('preview-identity');
    expect(source).toContain('preview-dock-menu');
    expect(source).not.toContain('NativeSelect');
    expect(source).not.toContain('preview-more');
  });
});
