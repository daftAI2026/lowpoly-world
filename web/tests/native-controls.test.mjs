/**
 * [INPUT]: 依赖 Fumadocs 适配样式与原生主题、浮层的结构契约。
 * [OUTPUT]: 回归局部细描边、不透明浮层与全局边线不变。
 * [POS]: 原生控件静态回归；计算样式、交互与明暗效果另由浏览器验证。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { describe, it, expect } from 'vite-plus/test';
import { readFile } from 'node:fs/promises';

const read = (name) => readFile(new URL(name, import.meta.url), 'utf8');
const group = ".ui [role='group'][class~='bg-fd-secondary']:has(> [role='menuitemradio'])";
const popup = ".ui [role='dialog'][class~='bg-fd-popover/60']";
const rule = (css, selector) => [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .filter(([, selectors]) => selectors.includes(selector)).map(([, , body]) => body).join('\n');

describe('Native controls follow the site design language', () => {
  it('pins the upstream control classes used by the narrow CSS adapters', async () => {
    const actions = await read('../node_modules/fumadocs-ui/dist/layouts/spacious/slots/actions.js');
    const popover = await read('../node_modules/fumadocs-ui/dist/components/ui/popover.js');
    expect(actions).toContain('Menu.RadioGroup');
    expect(actions).toContain('Menu.RadioItem');
    expect(actions).toContain('border bg-fd-secondary p-0.5');
    expect(popover).toContain('bg-fd-popover/60 backdrop-blur-lg');
  });

  it('uses a local half-pixel theme track without stacking a decorative ring or shadow', async () => {
    const css = await read('../src/styles/fumadocs.css');
    expect(rule(css, group)).toContain('border-width: 0.5px');
    expect(rule(css, group)).toContain('border-color: var(--border)');
    expect(rule(css, `${group} > span[aria-hidden='true']`)).toContain('box-shadow: none');
  });

  it('makes upstream translucent popovers opaque without inventing a new palette', async () => {
    const css = await read('../src/styles/fumadocs.css');
    expect(rule(css, popup)).toContain('background-color: var(--popover)');
    expect(rule(css, popup)).toContain('backdrop-filter: none');
    expect(rule(css, popup)).toContain('border-width: 0.5px');
  });

  it('retains the stronger global border role and leaves focus styling to the native controls', async () => {
    const css = await read('../src/styles/fumadocs.css');
    const adapter = await read('../src/styles/shadcn.css');
    expect(adapter).toContain('--color-fd-border: var(--lpw-line)');
    expect(css).not.toContain('--color-fd-border:');
    expect(css).not.toMatch(/(?:focus|menuitemradio)[^{]*\{[^}]*outline:\s*(?:0|none)/);
  });
});
