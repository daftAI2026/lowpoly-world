/**
 * [INPUT]: 依赖 Node 内置测试器、Fumadocs 配置与 content/docs 源文。
 * [OUTPUT]: 验证文档集合排除地图，且契约注释使用 MDX 语法。
 * [POS]: 防止 Agent 地图泄入站点内容；不触发 MDX 构建。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { it } from 'node:test';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { docs } from '../source.config.ts';

const docsRoot = fileURLToPath(new URL('../content/docs/', import.meta.url));

async function listFiles(directory, relative = '') {
  const entries = await readdir(join(directory, relative), { withFileTypes: true });
  const children = await Promise.all(entries.map(async (entry) => {
    const child = join(relative, entry.name);
    return entry.isDirectory() ? listFiles(directory, child) : [child];
  }));
  return children.flat();
}

it('keeps GEB maps out of the public Fumadocs document collection', async () => {
  assert.deepEqual(docs.docs.files, ['**/*.mdx']);

  const files = await listFiles(docsRoot);
  const maps = files.filter((path) => /(^|\/)(CLAUDE|AGENTS).*\.md$/i.test(path));
  const documents = files.filter((path) =>
    docs.docs.files.includes('**/*.mdx') && path.endsWith('.mdx'),
  );
  assert.ok(maps.includes('CLAUDE.md'), 'the docs L2 map must remain in the source tree');
  assert.ok(documents.length > 0);
  assert.ok(maps.every((path) => !documents.includes(path)));
});

it('uses MDX comments rather than unsupported HTML comments for document contracts', async () => {
  const files = (await listFiles(docsRoot)).filter((path) => path.endsWith('.mdx'));
  for (const path of files) {
    const source = await readFile(join(docsRoot, path), 'utf8');
    assert.doesNotMatch(source, /<!--[\s\S]*?\[INPUT\]/, path);
    assert.match(source, /\{\/\*[\s\S]*?\[PROTOCOL\]: 变更时更新此头部，然后检查 CLAUDE\.md[\s\S]*?\*\/\}/, path);
  }
});
