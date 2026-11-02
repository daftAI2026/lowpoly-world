/**
 * [INPUT]: 依赖网站 CSS 语义 token、Fumadocs 覆盖和双语消息资源。
 * [OUTPUT]: 验证 UI 色阶、字号、边线、圆角、动效和文案约束。
 * [POS]: 设计系统离线回归；不启动浏览器或访问外部资源。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { describe, expect, it } from 'vite-plus/test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { CatalogFilters } from '../src/components/catalog-filters.tsx';
import { createBusinessI18n } from '../src/lib/i18n.ts';
import { buildCatalogFacets } from '../src/lib/catalog-view.ts';
import { messages } from '../src/lib/messages.ts';

const stylesRoot = fileURLToPath(new URL('../src/styles/', import.meta.url));
const sourceConfigPath = fileURLToPath(new URL('../source.config.ts', import.meta.url));

async function readStyles() {
  const names = await readdir(stylesRoot);
  const files = names.filter((name) => name.endsWith('.css'));
  const sources = await Promise.all(files.map((name) => readFile(`${stylesRoot}/${name}`, 'utf8')));
  return sources.join('\n');
}

function allStrings(value) {
  return Object.values(value).flatMap((entry) =>
    typeof entry === 'string' ? [entry] : allStrings(entry),
  );
}

function renderFilters(facets) {
  const emptyFilters = {
    query: '',
    categoryPath: null,
    formats: [],
    tags: [],
    triangleBand: null,
  };
  const noop = () => {};
  return renderToStaticMarkup(createElement(
    I18nextProvider,
    { i18n: createBusinessI18n('en') },
    createElement(CatalogFilters, {
      assets: [], hiddenGroups: [], onExtraChange: () => {},
      facets,
      filters: emptyFilters,
      onCategoryChange: noop,
      onFormatChange: noop,
      onTagChange: noop,
      onTriangleBandChange: noop,
      onClear: noop,
      hasFilters: false,
    }),
  ));
}

describe('UI design constraints', () => {
  it('uses at most four role-based type sizes', async () => {
    const styles = await readStyles();
    const sizes = [...styles.matchAll(/font-size\s*:\s*([^;]+);/g)]
      .map(([, value]) => `${Number.parseFloat(value)}px`);

    expect(new Set(sizes).size).toBeLessThanOrEqual(4);
    expect(sizes.every((size) => Number.parseFloat(size) >= 12)).toBe(true);
    expect(styles).not.toContain('--text-base:');
  });

  it('maps semantic colors to the UI Colors palette and avoids custom colors', async () => {
    const styles = await readStyles();
    expect(styles).toContain('--lpw-canvas: var(--color-fd-background)');
    expect(styles).toContain('--lpw-accent: var(--color-fd-primary)');
    expect(styles).toContain('--lpw-danger: var(--color-red-800)');
    expect(styles).toContain('--progress-bar-color: var(--lpw-focus)');
    expect(styles).not.toMatch(/#[\da-f]{3,8}\b/i);
  });

  it('keeps visible borders at a half pixel and suppresses shadows', async () => {
    const styles = await readStyles();
    const borderWidths = [...styles.matchAll(/\bborder(?:-(?:top|right|bottom|left))?\s*:\s*([\d.]+)px\b/g)]
      .map(([, value]) => Number(value));

    expect(borderWidths.every((value) => value === 0 || value === 0.5)).toBe(true);
    expect(styles).not.toMatch(/border-left\s*:/);
    expect([...styles.matchAll(/box-shadow\s*:\s*([^;]+);/g)]
      .every(([, value]) => value.trim().startsWith('none'))).toBe(true);
    expect(styles).not.toContain('#nd-page h1');
    expect(styles).not.toMatch(/outline\s*:\s*2px/);
  });

  it('uses a small nested radius scale and only color feedback motion', async () => {
    const styles = await readStyles();
    expect(styles).not.toMatch(/--radius-(?:sm|md|lg):/);
    expect(styles).toContain('250ms ease-out');
    expect(styles).toContain('prefers-reduced-motion: reduce');
    expect(styles).toContain('border-radius: calc(var(--radius-lg) - 0.5px)');
  });

  it('hides the empty Tags group and keeps values when available', () => {
    const empty = renderFilters(buildCatalogFacets([]));
    expect(empty).not.toContain('tag-filter-heading');

    const withTags = renderFilters(buildCatalogFacets([{
      id: 'LPW-TEST-001',
      name_en: 'Test asset',
      name_zh: '',
      category: 'Props',
      tags: ['low-poly'],
      triangles: 120,
      glb_url: 'https://huggingface.co/datasets/daftAI2026/3d-assets/resolve/main/assets/LPW-TEST-001/model.glb',
      blend_url: null,
    }]));
    expect(withTags).toContain('tag-filter-heading');
    expect(withTags).toContain('low-poly');
  });

  it('uses the official default code theme without a project palette', async () => {
    const sourceConfig = await readFile(sourceConfigPath, 'utf8');
    expect(sourceConfig).toContain('defineConfig()');
    expect(sourceConfig).not.toContain('lowpolyCodeTheme');
    expect(sourceConfig).not.toMatch(/#[\da-f]{3,8}\b/i);
  });

  it('keeps middle-dot separators out of interface copy', () => {
    expect(allStrings(messages).every((copy) => !copy.includes('·'))).toBe(true);
  });
});
