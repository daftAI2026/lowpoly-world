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
  it('masks scrolling cards behind gallery navigation without changing document headers', async () => {
    const css = await read('../src/styles/shell.css');
    expect(css).toContain('#nd-page-panel:has(.catalog-browser) > header');
  });
  it('keeps metadata disclosure hit areas full width and visibly expandable', async () => {
    const source = await read('../src/components/asset-metadata-panel.tsx');
    expect(source.match(/className="metadata-disclosure"/g)).toHaveLength(3);
    expect(source.match(/<ChevronDown aria-hidden="true"/g)).toHaveLength(3);
    const css = await read('../src/styles/detail.css');
    expect(css).toMatch(/\.metadata-disclosure\s*\{[^}]*width: 100%/s);
    expect(css).toMatch(/\.metadata-disclosure\s*\{[^}]*min-height: 48px/s);
  });
  it('pins file actions outside the preview scroll body and fills viewer controls evenly', async () => {
    const source = await read('../src/components/asset-preview.tsx');
    expect(source).toMatch(/<\/div>\s*<footer className="preview-file-footer">/);
    expect(source).toContain('<AssetFileActions asset={asset} />');
    const css = await read('../src/styles/detail.css');
    expect(css).toMatch(/\.viewer-controls\s*\{[^}]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/s);
  });
  it('uses a centered non-idle splitter affordance instead of a stray top line', async () => {
    const css = await read('../src/styles/workspace.css');
    expect(css).toMatch(/\.workspace-splitter::before\s*\{[^}]*top: 50%/s);
    expect(css).toMatch(/\.workspace-splitter::before\s*\{[^}]*opacity: 0/s);
  });
  it('keeps the preview identity and icon actions together without a separate ID row', async () => {
    const source = await read('../src/components/asset-preview.tsx');
    expect(source).toContain('preview-identity');
    expect(source).toContain('preview-dock-menu');
    expect(source).not.toContain('NativeSelect');
    expect(source).not.toContain('preview-more');
  });
  it('uses the outer FU background and full-row facet targets', async () => {
    const native = await read('../src/styles/fumadocs.css');
    expect(native).toMatch(/#nd-sidebar\s*\{[^}]*background-color: transparent/s);
    const css = await read('../src/styles/catalog.css');
    expect(css).toMatch(/\.filter-group:has\(> \.facet-heading\)\s*\{[^}]*padding-block: 0/s);
    expect(css).toMatch(/\.facet-heading\s*\{[^}]*min-height: 64px/s);
    const source = await read('../src/components/catalog-filters.tsx');
    expect(source).not.toContain('category-disclosure-spacer');
  });
  it('separates results and facts scrolling when preview is open', async () => {
    const css = await read('../src/styles/workspace.css');
    expect(css).toContain(".catalog-workspace[data-preview='false'][data-expanded='false']");
    expect(css).not.toContain(".catalog-workspace:is([data-bottom='false'], [data-preview='false'])");
    expect(css).not.toContain('@container (max-width: 899px)');
    expect(css).toContain('@media (max-width: 899px)');
    expect(css).toMatch(/\.catalog-workspace\[data-preview='true'\] \.preview-panel-body\s*\{[^}]*overflow: hidden/s);
    expect(css).toMatch(/\.catalog-workspace\[data-preview='true'\] \.asset-detail-copy\s*\{[^}]*overflow-y: auto/s);
    const browser = await read('../src/components/catalog-browser.tsx');
    expect(browser).toContain("scrollScope={selected ? 'panel' : 'page'}");
  });

});
