/**
 * [INPUT]: 依赖静态路由清单与 dist/client 构建输出。
 * [OUTPUT]: 在路径、文档页或搜索索引缺失时以非零状态退出。
 * [POS]: HF Static Space 上传前的本地产物断言，不启动服务器。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { access, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { documentationPages, staticPrerenderPages } from './static-routes.mjs';

const clientRoot = fileURLToPath(new URL('../dist/client/', import.meta.url));

function outputPath(route) {
  const relative = route.replace(/^\/+|\/+$/g, '');
  return relative ? `${relative}/index.html` : 'index.html';
}

async function requireFile(relativePath, description) {
  const file = join(clientRoot, relativePath);
  try {
    await access(file);
  } catch {
    throw new Error(`Static output is missing ${description}: ${relativePath}`);
  }
  return file;
}

await requireFile('index.html', 'SPA entry');
const assetEntries = await readdir(join(clientRoot, 'assets'));
if (!assetEntries.some((entry) => entry.endsWith('.js')) ||
    !assetEntries.some((entry) => entry.endsWith('.css'))) {
  throw new Error('Static output must include JavaScript and CSS assets.');
}

for (const route of staticPrerenderPages) {
  if (route.path === '/api/search') continue;
  await requireFile(outputPath(route.path), `prerendered route ${route.path}`);
}

for (const locale of ['en', 'zh']) {
  for (const page of documentationPages) {
    const route = `/${locale}/docs${page.slug ? `/${page.slug}` : ''}`;
    const htmlPath = outputPath(route);
    const html = await readFile(await requireFile(htmlPath, `documentation page ${route}`), 'utf8');
    const title = locale === 'zh' ? page.titleZh : page.title;
    if (!html.includes(title)) {
      throw new Error(`Static documentation page ${route} does not contain its title.`);
    }
    if (!new RegExp(`<article\\b[^>]*\\blang="${locale}"`).test(html)) {
      throw new Error(`Static documentation page ${route} has the wrong body language.`);
    }
    if (locale === 'zh' && html.includes('此页尚无中文译稿')) {
      throw new Error(`Static documentation page ${route} unexpectedly uses the English fallback.`);
    }
    if (!html.includes(`<html lang="${locale}"`)) {
      throw new Error(`Static documentation page ${route} has the wrong HTML language.`);
    }
  }
}

const searchPath = await requireFile('api/search', 'Fumadocs static search index');
const searchIndex = JSON.parse(await readFile(searchPath, 'utf8'));
if (
  !searchIndex ||
  typeof searchIndex !== 'object' ||
  searchIndex.type !== 'advanced' ||
  typeof searchIndex.docs?.docs !== 'object' ||
  Object.keys(searchIndex.docs.docs).length === 0
) {
  throw new Error('Fumadocs static search output is not a document index.');
}

let leakedMapExists = false;
try {
  await access(join(clientRoot, 'content/docs/CLAUDE.md'));
  leakedMapExists = true;
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}
if (leakedMapExists) throw new Error('A GEB map was copied into the public static output.');

process.stdout.write(
  `Static output verified: ${staticPrerenderPages.length - 1} routes, ` +
  `${documentationPages.length * 2} localized docs, and search index.\n`,
);
