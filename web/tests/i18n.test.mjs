/**
 * [INPUT]: 依赖 Vite+ Vitest、双语资源和 URL locale helper。
 * [OUTPUT]: 覆盖语言白名单、首页路径、回退规则与资源键一致性。
 * [POS]: 国际化边界离线回归；不访问网络、模型或浏览器语言。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { describe, expect, it } from 'vite-plus/test';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBusinessI18n, fumadocsI18n } from '../src/lib/i18n.ts';
import {
  defaultLocale,
  documentLocaleFromPath,
  getAssetDisplayName,
  isLocale,
  localeFromPath,
  localizedHomePath,
  localizedPath,
  resolveLocale,
  supportedLocales,
} from '../src/lib/locale.ts';
import { messages } from '../src/lib/messages.ts';

const componentsRoot = fileURLToPath(new URL('../src/components/', import.meta.url));

function resourceKeys(value, prefix = '') {
  return Object.entries(value).flatMap(([key, entry]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof entry === 'string' ? [path] : resourceKeys(entry, path);
  });
}

async function listComponentFiles(directory, relative = '') {
  const entries = await readdir(join(directory, relative), { withFileTypes: true });
  const children = await Promise.all(entries.map(async (entry) => {
    const child = join(relative, entry.name);
    return entry.isDirectory() ? listComponentFiles(directory, child) : [child];
  }));
  return children.flat().filter((path) => path.endsWith('.tsx'));
}

describe('URL-based localization', () => {
  it('keeps the URL locale whitelist aligned with Fumadocs configuration', () => {
    expect([...fumadocsI18n.languages]).toEqual([...supportedLocales]);
    expect(fumadocsI18n.defaultLanguage).toBe(defaultLocale);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('zh')).toBe(true);
    expect(isLocale('fr')).toBe(false);
  });

  it('uses the English default for missing and unsupported URL locales', () => {
    expect(resolveLocale(undefined)).toBe('en');
    expect(resolveLocale('fr')).toBe('en');
    expect(localeFromPath('/zh/docs/getting-started')).toBe('zh');
    expect(localeFromPath('/unknown/asset')).toBe('en');
  });

  it('keeps locale switching within statically addressable paths', () => {
    expect(localizedPath('/en/asset/', 'zh')).toBe('/zh/asset/');
    expect(localizedPath('/zh/docs/getting-started', 'en')).toBe('/en/docs/getting-started');
    expect(localizedPath('/', 'zh')).toBe('/zh/');
    expect(localizedHomePath('en')).toBe('/en/');
    expect(localizedHomePath('zh')).toBe('/zh/');
  });

  it('keeps all business resource keys aligned across English and Chinese', () => {
    expect(resourceKeys(messages.en).sort()).toEqual(resourceKeys(messages.zh).sort());
  });

  it('keeps every component translation lookup in the business resources', async () => {
    const resourceKeySet = new Set(resourceKeys(messages.en));
    const files = await listComponentFiles(componentsRoot);

    for (const path of files) {
      const source = await readFile(join(componentsRoot, path), 'utf8');
      const lookups = [...source.matchAll(/\bt\(\s*['"]([\w.]+)['"]/g)];
      for (const [, key] of lookups) {
        const exactKeyExists = resourceKeySet.has(key);
        const pluralKeyExists = [...resourceKeySet].some((candidate) =>
          candidate.startsWith(`${key}_`),
        );
        expect(exactKeyExists || pluralKeyExists, `${path}: ${key}`).toBe(true);
      }
    }
  });

  it('falls back to English for missing translations in an isolated instance', () => {
    const instance = createBusinessI18n('zh');
    instance.addResource('en', 'translation', 'fallbackProbe', 'English fallback');

    expect(instance.isInitialized).toBe(true);
    expect(instance.t('home.collectionTitle')).toBe(messages.zh.home.collectionTitle);
    expect(instance.t('fallbackProbe')).toBe('English fallback');
    expect(instance.language).not.toBe('en');
  });

  it('uses the source filename rather than the requested locale for document language', () => {
    expect(documentLocaleFromPath('index.zh.mdx')).toBe('zh');
    expect(documentLocaleFromPath('formats.mdx')).toBe('en');
    expect(documentLocaleFromPath('nested/page.en.mdx')).toBe('en');
  });

  it('uses the English asset name when the Dataset has no Chinese name', () => {
    const englishOnlyName = { name_en: 'Published name', name_zh: '' };
    const bilingualName = { name_en: 'Published name', name_zh: '已发布名称' };

    expect(getAssetDisplayName(englishOnlyName, 'zh')).toBe('Published name');
    expect(getAssetDisplayName(bilingualName, 'zh')).toBe('已发布名称');
    expect(getAssetDisplayName(bilingualName, 'en')).toBe('Published name');
  });
});
