/**
 * [INPUT]: 依赖资产选择容器、官方复选框和主题源码。
 * [OUTPUT]: 回归角落遮挡、未选对比度与用户黑白主题、字体契约。
 * [POS]: 用户报告后的红绿回归；浏览器另验边缘命中、键盘与真实字体。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { describe, it, expect } from 'vite-plus/test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const read = (p) => readFile(new URL(p, import.meta.url), 'utf8');
const overlay = (css) => css.match(/\.asset-selection-toggle\s*\{([^}]+)\}/)?.[1] ?? '';
const cutsCorner = (css) =>
  /(?:top|left):\s*0\s*;/.test(overlay(css)) && /background:\s*var\(/.test(overlay(css));
describe('Card selection regression', () => {
  it('does not paint a canvas patch over the card corner', async () => {
    expect(
      cutsCorner('.asset-selection-toggle { top: 0; left: 0; background: var(--canvas); }'),
    ).toBe(true);
    const css = await read('../src/styles/workspace.css');
    expect(cutsCorner(css)).toBe(false);
    expect(overlay(css)).toMatch(/top:\s*8px/);
    expect(overlay(css)).toMatch(/background:\s*transparent/);
  });
  it('does not override upstream checked backgrounds with an unlayered card rule', async () => {
    const css = await read('../src/styles/workspace.css');
    expect(css).not.toMatch(/\.asset-selection-checkbox\s*\{[^}]*background:/);
    expect(css).toContain('.asset-selection-checkbox:not([data-checked])');
  });
  it('keeps the upstream checkbox but gives its unchecked outline an explicit contrast role', async () => {
    const checkbox = await read('../src/components/ui/checkbox.tsx');
    expect(checkbox).toContain('CheckboxPrimitive.Root');
    expect(checkbox).toContain('border-muted-foreground');
    const card = await read('../src/components/asset-card.tsx');
    expect(card).toContain('asset-selection-checkbox');
    expect(card).not.toContain('<input');
  });
});
describe('User theme contract', () => {
  it('uses the supplied light and dark palettes with the official FU shadcn adapter', async () => {
    const css = await read('../src/styles/tokens.css');
    const roles =
      'background foreground card card-foreground popover popover-foreground primary primary-foreground secondary secondary-foreground muted muted-foreground accent accent-foreground destructive destructive-foreground border input ring chart-1 chart-2 chart-3 chart-4 chart-5 sidebar sidebar-foreground sidebar-primary sidebar-primary-foreground sidebar-accent sidebar-accent-foreground sidebar-border sidebar-ring'.split(
        ' ',
      );
    const expected = [
      [
        '.99',
        '0',
        '1',
        '0',
        '.99',
        '0',
        '0',
        '1',
        '.94',
        '0',
        '.97',
        '.44',
        '.94',
        '0',
        '.63 .19 23.03',
        '1',
        '.92',
        '.94',
        '0',
        '.81 .17 75.35',
        '.55 .22 264.53',
        '.72',
        '.92',
        '.56',
        '.99',
        '0',
        '0',
        '1',
        '.94',
        '0',
        '.94',
        '0',
      ],
      [
        '0',
        '1',
        '.14',
        '1',
        '.18',
        '1',
        '1',
        '0',
        '.25',
        '1',
        '.23',
        '.72',
        '.32',
        '1',
        '.69 .20 23.91',
        '0',
        '.26',
        '.32',
        '.72',
        '.81 .17 75.35',
        '.58 .21 260.84',
        '.56',
        '.44',
        '.92',
        '.18',
        '1',
        '1',
        '0',
        '.32',
        '1',
        '.32',
        '.72',
      ],
    ];
    for (const [index, selector] of [':root', '.dark'].entries()) {
      const block = css.slice(css.indexOf(selector)).split('}')[0];
      for (const [i, role] of roles.entries()) {
        const actual = block.match(new RegExp(`--${role}:\\s*oklch\\(([^)]+)\\)`));
        const value = expected[index][i].split(' ').map(Number);
        if (value.length === 1) value.push(0, 0);
        expect(actual?.[1].split(/\s+/).map(Number), `${selector} --${role}`).toEqual(value);
      }
    }
    const app = await read('../src/styles/app.css');
    expect(app).toContain('fumadocs-ui/css/shadcn.css');
    expect(app).not.toContain('fumadocs-ui/css/neutral.css');
  });
  it('resolves the native Spacious System choice instead of creating an unthemed .system class', async () => {
    const root = await read('../src/routes/__root.tsx');
    expect(root).toContain("defaultTheme: 'light'");
    expect(root).toContain('enableSystem: true');
    expect(root).not.toContain('enableSystem: false');
  });
  it('uses self-hosted Inter and SC glyphs with system fallback last', async () => {
    const css = await read('../src/styles/fonts.css');
    expect(css).toContain("font-family: 'Inter'");
    expect(css).toContain("font-family: 'LPW Han Sans SC'");
    expect(css).toContain('font-display: swap');
    expect(css).not.toMatch(/https?:\/\//);
    const sources = JSON.parse(await read('../src/assets/fonts.sources.json'));
    for (const [name, expected] of [
      [sources.inter.file, sources.inter.sha256],
      ['han-sans-sc-subset.woff2', sources.han.output_sha256],
      [sources.mono.file, sources.mono.sha256],
    ]) {
      const bytes = await readFile(new URL(`../src/assets/${name}`, import.meta.url));
      expect(createHash('sha256').update(bytes).digest('hex')).toBe(expected);
    }
    const tokens = await read('../src/styles/tokens.css');
    expect(tokens.indexOf("'Inter'")).toBeLessThan(tokens.indexOf("'LPW Han Sans SC'"));
    expect(tokens.indexOf("'LPW Han Sans SC'")).toBeLessThan(tokens.indexOf('system-ui'));
  });
});
