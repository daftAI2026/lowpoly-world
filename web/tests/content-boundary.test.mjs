/**
 * [INPUT]: 依赖 Vite+ Vitest、Fumadocs 配置与 content/docs 源文。
 * [OUTPUT]: 验证地图隔离、MDX 契约语法和静态路由完整性。
 * [POS]: 防止 GEB 地图泄入公开文档；不触发 MDX 构建。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { readFile, readdir } from 'node:fs/promises';
import { describe, expect, it } from 'vite-plus/test';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { docs } from '../source.config.ts';
import { documentationPages, staticPrerenderPages } from '../scripts/static-routes.mjs';

const docsRoot = fileURLToPath(new URL('../content/docs/', import.meta.url));

async function listFiles(directory, relative = '') {
  const entries = await readdir(join(directory, relative), { withFileTypes: true });
  const children = await Promise.all(entries.map(async (entry) => {
    const child = join(relative, entry.name);
    return entry.isDirectory() ? listFiles(directory, child) : [child];
  }));
  return children.flat();
}

describe('public documentation boundary', () => {
  it('keeps GEB maps out of the public Fumadocs document collection', async () => {
    expect(docs.docs.files).toEqual(['**/*.mdx']);

    const files = await listFiles(docsRoot);
    const maps = files.filter((path) => /(^|\/)(CLAUDE|AGENTS).*\.md$/i.test(path));
    const documents = files.filter((path) =>
      docs.docs.files.includes('**/*.mdx') && path.endsWith('.mdx'),
    );
    expect(maps).toContain('CLAUDE.md');
    expect(documents.length).toBeGreaterThan(0);
    expect(maps.every((path) => !documents.includes(path))).toBe(true);
  });

  it('uses MDX comments rather than unsupported HTML comments for contracts', async () => {
    const files = (await listFiles(docsRoot)).filter((path) => path.endsWith('.mdx'));
    for (const path of files) {
      const source = await readFile(join(docsRoot, path), 'utf8');
      expect(source).not.toMatch(/<!--[\s\S]*?\[INPUT\]/);
      expect(source).toMatch(
        /\{\/\*[\s\S]*?\[PROTOCOL\]: 变更时更新此头部，然后检查 CLAUDE\.md[\s\S]*?\*\/\}/,
      );
    }
  });

  it('ships a complete Chinese translation for every English document without changing code or URLs', async () => {
    for (const page of documentationPages) {
      const stem = page.slug || 'index';
      const english = await readFile(join(docsRoot, `${stem}.mdx`), 'utf8');
      const chinese = await readFile(join(docsRoot, `${stem}.zh.mdx`), 'utf8');
      expect(chinese).toContain(`title: ${page.titleZh}`);
      expect(chinese).toMatch(/[\u4e00-\u9fff]/);
      expect(chinese.match(/```[\s\S]*?```/g) ?? [])
        .toEqual(english.match(/```[\s\S]*?```/g) ?? []);
      expect(chinese.match(/https?:\/\/[^\s)<>`]+/g) ?? [])
        .toEqual(english.match(/https?:\/\/[^\s)<>`]+/g) ?? []);
    }
  });

  it('keeps navigation order aligned and localizes the search breadcrumb', async () => {
    const english = JSON.parse(await readFile(join(docsRoot, 'meta.json'), 'utf8'));
    const chinese = JSON.parse(await readFile(join(docsRoot, 'meta.zh.json'), 'utf8'));
    expect(chinese.pages).toEqual(english.pages);
    expect(english.pages).toEqual(documentationPages.map((page) => page.slug || 'index'));
    expect(english.title).toBe('Documentation');
    expect(chinese.title).toBe('文档');
  });

  it('serves prebuilt Space files without invoking credit-based remote builds', async () => {
    const card = await readFile(new URL('../hf-space/README.md', import.meta.url), 'utf8');
    expect(card).toMatch(/^sdk: static$/m);
    expect(card).toMatch(/^app_file: index\.html$/m);
    expect(card).not.toMatch(/^app_build_command:/m);
  });

  it('pre-renders every MDX page for both URL locales', async () => {
    const mdxPages = (await listFiles(docsRoot))
      .filter((path) => path.endsWith('.mdx') && !path.endsWith('.zh.mdx'))
      .map((path) => path.replace(/\.mdx$/, ''));
    const expectedSlugs = mdxPages.map((path) => path === 'index' ? '' : path).sort();
    expect(documentationPages.map((page) => page.slug).sort()).toEqual(expectedSlugs);

    for (const locale of ['en', 'zh']) {
      for (const page of documentationPages) {
        const route = `/${locale}/docs${page.slug ? `/${page.slug}` : ''}`;
        expect(staticPrerenderPages).toContainEqual({ path: route });
      }
    }
    expect(staticPrerenderPages).toContainEqual({ path: '/api/search' });
  });
});
