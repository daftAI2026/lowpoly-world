/**
 * [INPUT]: 依赖布局源码与纯选择规则。
 * [OUTPUT]: 验证展示/文档分离、就地预览和普通链接保留。
 * [POS]: 工作区回归；真实浏览器另验相机、停靠和焦点。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { describe, expect, it } from 'vite-plus/test';
import { readFile } from 'node:fs/promises';
import { previewNeighbors, shouldOpenPreview } from '../src/lib/catalog-selection.ts';
const read = (p) => readFile(new URL(p, import.meta.url), 'utf8');

describe('Separate product surfaces', () => {
  it('keeps gallery and details outside the documentation shell', async () => {
    for (const file of ['home-page.tsx', 'asset-page.tsx']) {
      const t = await read('../src/components/' + file);
      expect(t).toContain("from 'fumadocs-ui/layouts/home'");
      expect(t).not.toContain('DocsPage');
    }
    const parent = await read('../src/routes/$lang/route.tsx');
    expect(parent).not.toContain('Shell');
    const docs = await read('../src/routes/$lang/docs/$.tsx');
    expect(docs).toContain('<DocsShell');
  });
  it('keeps results and optional preview in one browsing workspace', async () => {
    const t = await read('../src/components/catalog-browser.tsx');
    expect(t).toContain('browse-main');
    expect(t).toContain('<AssetPreview');
    expect(t).toContain('visibleAssets');
    const preview = await read('../src/components/asset-preview.tsx');
    expect(preview).toContain('<AssetDetails');
    expect(preview).not.toContain('RTX Motion');
    expect(preview).not.toContain('iframe');
  });
});

describe('Preview selection rules', () => {
  const click = { button: 0, ctrlKey: false, metaKey: false, shiftKey: false, altKey: false, defaultPrevented: false };
  it('only intercepts ordinary primary clicks on wide viewports', () => {
    expect(shouldOpenPreview(click, true)).toBe(true);
    expect(shouldOpenPreview(click, false)).toBe(false);
    for (const key of ['ctrlKey','metaKey','shiftKey','altKey','defaultPrevented']) expect(shouldOpenPreview({...click,[key]:true},true)).toBe(false);
    expect(shouldOpenPreview({...click,button:1},true)).toBe(false);
  });
  it('navigates only the current filtered order and never wraps', () => {
    const assets = [{id:'b'},{id:'a'},{id:'c'}];
    expect(previewNeighbors(assets,'a')).toEqual({index:1,previous:'b',next:'c'});
    expect(previewNeighbors(assets,'b').previous).toBeNull();
    expect(previewNeighbors(assets,'c').next).toBeNull();
  });
  it('does not pretend a filtered-out selection belongs to the results', () => {
    expect(previewNeighbors([{id:'a'}],'b')).toEqual({index:-1,previous:null,next:null});
    expect(previewNeighbors([],null).index).toBe(-1);
  });
});
