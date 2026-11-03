/**
 * [INPUT]: 依赖资产选择容器、官方复选框和主题源码。
 * [OUTPUT]: 回归角落遮挡、未选对比度与用户紫色主题、字体契约。
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
describe('Checked card semantics', () => {
  it('uses a purple download state independently of neutral preview focus', async () => {
    const card = await read('../src/components/asset-card.tsx');
    const css = await read('../src/styles/catalog.css');
    const workspace = await read('../src/styles/workspace.css');
    expect(card).toContain('data-checked={checked}');
    expect(card).toContain('data-selected={selected}');
    expect(css).toMatch(
      /\.asset-tile\[data-checked='true'\] \.asset-card\s*\{[^}]*border-color: var\(--primary\)/,
    );
    expect(workspace).toContain("[data-selected='true']:not([data-checked='true'])");
  });
  it('restricts surface motion to pointer actions and respects reduced motion', async () => {
    const css = await read('../src/styles/workspace-controls.css');
    const browser = await read('../src/components/catalog-browser.tsx');
    expect(css).toContain("data-workspace-input='pointer'");
    expect(css).toContain('prefers-reduced-motion: no-preference');
    expect(css).toContain('workspace-surface-in 250ms ease-out');
    expect(browser).toContain("addEventListener('keydown', keyboard, true)");
    expect(css).not.toMatch(/transition:\s*all/);
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
        '.9940',
        '0',
        '.9940',
        '0',
        '.9911',
        '0',
        '.5393 .2713 286.7462',
        '1',
        '.9540 .0063 255.4755',
        '.1344',
        '.9702',
        '.4386',
        '.9393 .0288 266.3680',
        '.5445 .1903 259.4848',
        '.6290 .1902 23.0704',
        '1',
        '.9300 .0094 286.2156',
        '.9401',
        '0',
        '.7459 .1483 156.4499',
        '.5393 .2713 286.7462',
        '.7336 .1758 50.5517',
        '.5828 .1809 259.7276',
        '.5590',
        '.9777 .0051 247.8763',
        '0',
        '0',
        '1',
        '.9401',
        '0',
        '.9401',
        '0',
      ],
      [
        '.2223 .0060 271.1393',
        '.9551',
        '.2568 .0076 274.6528',
        '.9551',
        '.2568 .0076 274.6528',
        '.9551',
        '.6132 .2294 291.7437',
        '1',
        '.2940 .0130 272.9312',
        '.9551',
        '.2940 .0130 272.9312',
        '.7058',
        '.2795 .0368 260.0310',
        '.7857 .1153 246.6596',
        '.7106 .1661 22.2162',
        '1',
        '.3289 .0092 268.3843',
        '.3289 .0092 268.3843',
        '.6132 .2294 291.7437',
        '.8003 .1821 151.7110',
        '.6132 .2294 291.7437',
        '.8077 .1035 19.5706',
        '.6691 .1569 260.1063',
        '.7058',
        '.2011 .0039 286.0396',
        '.9551',
        '.6132 .2294 291.7437',
        '1',
        '.2940 .0130 272.9312',
        '.6132 .2294 291.7437',
        '.3289 .0092 268.3843',
        '.6132 .2294 291.7437',
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
  it('uses direct role aliases and the latest shadow values, without custom color mixing', async () => {
    const tokens = await read('../src/styles/tokens.css');
    const adapter = await read('../src/styles/shadcn.css');
    expect(tokens).not.toContain('color-mix(');
    expect(tokens).toContain('--lpw-line: var(--border)');
    expect(tokens).toContain('--shadow-opacity: 0.16');
    expect(tokens).toContain('0px 2px 3px 0px hsl(0 0% 0% / 0.08)');
    expect(tokens.split('\n').filter((line) => line.includes('--shadow')).join('\n')).not.toMatch(/0\.18|0\.09|0\.45/);
    expect(adapter).toContain('--color-border: var(--border)');
    expect(adapter).not.toContain('--color-fd-primary:');
    expect(adapter).not.toContain('.dark [data-slot=');
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
