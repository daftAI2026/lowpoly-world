/**
 * [INPUT]: 依赖预览布局与共享详情源码。
 * [OUTPUT]: 回归下方画布高度约束与紧凑元数据归属。
 * [POS]: 截断模型的源码回归；真实浏览器另验画布和控件边界。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { describe, it, expect } from 'vite-plus/test';
import { readFile } from 'node:fs/promises';
const read = (name) => readFile(new URL(name, import.meta.url), 'utf8');
const prefix = ".catalog-workspace[data-bottom='true'][data-expanded='false']";
const rule = (css, selector) => {
  const text = css.replace(/\s+/g, ' ');
  const from = text.indexOf(`${selector} {`);
  return from < 0 ? '' : text.slice(from).split('}')[0];
};
describe('Bottom preview fits the pane', () => {
  it('lets the stage fill remaining height instead of retaining a width-derived aspect ratio', async () => {
    const css = await read('../src/styles/workspace.css');
    const stage = rule(css, `${prefix} .viewer-stage:not(:fullscreen)`);
    expect(stage).toContain('aspect-ratio: auto');
    expect(stage).toContain('min-height: 0');
    expect(stage).toContain('flex: 1');
    expect(rule(css, `${prefix} .asset-detail-copy`)).toContain('overflow-y: auto');
  });
  it('keeps bottom actions in the header row rather than consuming three rows', async () => {
    const css = await read('../src/styles/workspace.css');
    expect(rule(css, `${prefix} .preview-panel-header`)).toContain(
      'grid-template-columns: minmax(0, 1fr) auto auto',
    );
    expect(rule(css, `${prefix} .preview-more`)).toContain('display: contents');
  });
  it('puts compact metadata in the facts column and preserves standalone metadata placement', async () => {
    const source = await read('../src/components/asset-details.tsx');
    expect(source.match(/<AssetMetadataPanel\b/g)).toHaveLength(1);
    const aside = source.split('<aside')[1].split('</aside>')[0];
    expect(aside).toContain('{compact && metadata}');
    expect(source).toContain('{!compact && metadata}');
  });
});
