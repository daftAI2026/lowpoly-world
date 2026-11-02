/**
 * [INPUT]: 依赖 Fumadocs 原生链接解析、共享导航配置与页面源码。
 * [OUTPUT]: 验证两项交付的互链、双语路径和原生模板边界。
 * [POS]: 展示应用基础回归；不创建第三个站，不访问远端。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { describe, expect, it } from 'vite-plus/test';
import { readFile } from 'node:fs/promises';
import { resolveLinkItems } from 'fumadocs-ui/layouts/shared';
import { baseOptions } from '../src/lib/layout.shared.tsx';
import { toStaticHref } from '../src/lib/static-href.ts';

const readSource = (path) => readFile(new URL(path, import.meta.url), 'utf8');

describe('Fumadocs application foundation', () => {
  for (const locale of ['en', 'zh']) {
    it(`connects ${locale} gallery, guides, GitHub and Hugging Face in native navigation`, () => {
      const options = baseOptions(locale);
      const items = resolveLinkItems(options);
      const icons = items.filter((item) => item.type === 'icon');
      expect(icons.map((item) => item.label).sort((a, b) => a.localeCompare(b))).toEqual(['GitHub', 'Hugging Face']);
      expect(icons.find((item) => item.label === 'Hugging Face').url)
        .toBe('https://huggingface.co/datasets/daftAI2026/3d-assets');
      expect(items.filter((item) => item.type !== 'icon').map((item) => toStaticHref(item.url, true)))
        .toEqual([`/${locale}/index.html`, `/${locale}/docs/index.html`]);
      expect(items.filter((item) => item.type !== 'icon').map((item) => item.text))
        .toEqual(locale === 'zh' ? ['模型库', '使用文档'] : ['Assets', 'Documentation']);
      expect(options.slots?.header).toBeUndefined();
      expect(options.nav?.component).toBeUndefined();
    });
  }

  it('uses the official website Spacious layout and matching page components', async () => {
    const route = await readSource('../src/routes/$lang/docs/$.tsx');
    const shell = await readSource('../src/components/docs-shell.tsx');
    expect(shell).toContain("from 'fumadocs-ui/layouts/spacious'");
    expect(route).toContain("from 'fumadocs-ui/layouts/spacious/page'");
    expect(route).not.toContain('<DocsLayout');
    expect(route).not.toContain("from 'fumadocs-ui/layouts/docs'");
  });

  it('extends native Fumadocs cards only for asset previews', async () => {
    const card = await readSource('../src/components/asset-card.tsx');
    expect(card).toContain("from 'fumadocs-ui/components/card'");
    expect(card).toContain('<Card');
    expect(card).not.toContain('<canvas');
  });

  it('aligns gallery content with the native shell width token', async () => {
    const css = await readSource('../src/styles/shell.css');
    expect(css).toContain('var(--fd-layout-width, 1400px)');
  });

  it('does not replace framework geometry with global class-name interception', async () => {
    const css = await readSource('../src/styles/fumadocs.css');
    expect(css).not.toMatch(/\[class\*=['"](?:shadow|backdrop-blur|transition-|animate-)/);
    expect(css).not.toContain("#nd-page > div[class*='@container']");
  });
});


describe('Official source fidelity', () => {
  it('uses the original multicolor HF brand asset without currentColor substitution', async () => {
    const icon = await readSource('../src/components/hugging-face-icon.tsx');
    const svg = await readSource('../src/assets/hugging-face.svg');
    expect(icon).toContain('hugging-face.svg');
    expect(svg).toContain('#FFD21E');
    expect(svg).not.toContain('currentColor');
  });
  it('imports the same spacious styles and removes project-wide geometry overrides', async () => {
    const app = await readSource('../src/styles/app.css');
    const tokens = await readSource('../src/styles/tokens.css');
    const css = await readSource('../src/styles/fumadocs.css');
    expect(app).toContain('fumadocs-ui/css/generated/spacious.css');
    expect(tokens).not.toMatch(/--(?:text-|radius-)/);
    expect(tokens).not.toContain('--color-fd-background:');
    expect(tokens).toContain("'Geist'");
    expect(css).not.toMatch(/#nd-(?:nav|subnav|page|sidebar)/);
  });
  it('virtualizes against the real native page scroller, with a window fallback on mobile', async () => {
    const grid = await readSource('../src/components/catalog-grid.tsx');
    expect(grid).toContain('useVirtualizer');
    expect(grid).toContain('getScrollElement');
    expect(grid).toContain('overflowY');
    expect(grid).toContain('ancestor.scrollTop');
  });
});
