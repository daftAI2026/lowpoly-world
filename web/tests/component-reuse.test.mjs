/**
 * [INPUT]: 依赖官方组件来源清单、业务源码与统一主题桥接。
 * [OUTPUT]: 验证 FU 文档边界、shadcn 复用与禁止手写基础交互。
 * [POS]: 组件复用契约回归；不请求官方 registry 或 HF。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vite-plus/test';
const read = (p) => readFile(new URL(p, import.meta.url), 'utf8');
describe('Official component reuse', () => {
  it('keeps FU layouts but uses official shadcn primitives for gallery controls', async () => {
    expect(await read('../src/components/docs-shell.tsx')).toContain(
      'fumadocs-ui/layouts/spacious',
    );
    const source = JSON.parse(await read('../src/components/ui/registry.sources.json'));
    for (const name of [
      'badge',
      'button',
      'card',
      'checkbox',
      'input',
      'native-select',
      'textarea',
      'popover',
      'collapsible',
      'toggle',
      'toggle-group',
      'breadcrumb',
      'resizable',
      'label',
    ]) {
      expect(source.components[name].url).toBe(
        `https://ui.shadcn.com/r/styles/base-nova/${name}.json`,
      );
      expect(source.components[name].registry_sha256).toMatch(/^[a-f0-9]{64}$/);
      const file = await read(`../src/components/ui/${name}.tsx`);
      expect(file).toContain('[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md');
      expect(file).toContain('shadcn/ui');
      expect(createHash('sha256').update(file).digest('hex')).toBe(
        source.components[name].installed_sha256,
      );
    }
    expect(await read('../src/components/ui/button.tsx')).not.toContain('fumadocs-ui');
  });
  it('does not hand-code gallery buttons, form controls, disclosures or pointer resizing', async () => {
    const files = await readdir(new URL('../src/components/', import.meta.url));
    for (const name of files.filter((n) => n.endsWith('.tsx'))) {
      const source = await read('../src/components/' + name);
      expect(source, name).not.toMatch(/<(?:button|input|select|textarea|details|summary)\b/);
    }
    const browser = await read('../src/components/catalog-browser.tsx');
    expect(browser).toContain('ResizablePanelGroup');
    expect(browser).toContain('ResizableHandle');
    expect(browser).not.toContain('setPointerCapture');
  });
  it('maps shadcn utilities to the shared user palette without overriding FU layouts', async () => {
    const css = await read('../src/styles/shadcn.css');
    expect(css).toContain('--color-background: var(--background)');
    expect(css).toContain('--color-primary: var(--primary)');
    expect([...css.matchAll(/--color-fd-([\w-]+)\s*:/g)].map((m) => m[1])).toEqual(['border', 'primary']);
    expect(css).toContain('--color-fd-primary: var(--lpw-action-ink)');
    expect(css).toContain('--color-fd-border: var(--lpw-line)');
    expect(css).not.toMatch(/#[\da-f]{3,8}\b/i);
  });
});
