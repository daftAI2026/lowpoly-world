/**
 * [INPUT]: 依赖 Node 内置测试器、双语资源与 URL locale helper。
 * [OUTPUT]: 覆盖语言白名单、首页路径、回退规则、资产名称与资源键一致性。
 * [POS]: 国际化边界的离线回归；不访问网络、模型或浏览器语言。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import assert from 'node:assert/strict';
import { it } from 'node:test';
import { createBusinessI18n, fumadocsI18n } from '../src/lib/i18n.ts';
import {
  defaultLocale,
  getAssetDisplayName,
  isLocale,
  localeFromPath,
  localizedHomePath,
  localizedPath,
  resolveLocale,
  supportedLocales,
} from '../src/lib/locale.ts';
import { messages } from '../src/lib/messages.ts';

function resourceKeys(value, prefix = '') {
  return Object.entries(value).flatMap(([key, entry]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof entry === 'string' ? [path] : resourceKeys(entry, path);
  });
}

it('keeps the URL locale whitelist aligned with Fumadocs configuration', () => {
  assert.deepEqual([...fumadocsI18n.languages], [...supportedLocales]);
  assert.equal(fumadocsI18n.defaultLanguage, defaultLocale);
  assert.equal(isLocale('en'), true);
  assert.equal(isLocale('zh'), true);
  assert.equal(isLocale('fr'), false);
});

it('uses the English default for missing and unsupported URL locales', () => {
  assert.equal(resolveLocale(undefined), 'en');
  assert.equal(resolveLocale('fr'), 'en');
  assert.equal(localeFromPath('/zh/docs/getting-started'), 'zh');
  assert.equal(localeFromPath('/unknown/asset'), 'en');
});

it('keeps locale switching within statically addressable paths', () => {
  assert.equal(localizedPath('/en/asset/', 'zh'), '/zh/asset/');
  assert.equal(localizedPath('/zh/docs/getting-started', 'en'), '/en/docs/getting-started');
  assert.equal(localizedPath('/', 'zh'), '/zh/');
});

it('returns asset-detail exits to the localized gallery home', () => {
  assert.equal(localizedHomePath('en'), '/en/');
  assert.equal(localizedHomePath('zh'), '/zh/');
});

it('aligns all business resource keys across English and Chinese', () => {
  assert.deepEqual(resourceKeys(messages.en).sort(), resourceKeys(messages.zh).sort());
});

it('falls back to English for missing translations in an isolated instance', () => {
  const instance = createBusinessI18n('zh');
  instance.addResource('en', 'translation', 'fallbackProbe', 'English fallback');

  assert.equal(instance.isInitialized, true);
  assert.equal(instance.t('home.titleFirst'), messages.zh.home.titleFirst);
  assert.equal(instance.t('fallbackProbe'), 'English fallback');
  assert.notEqual(instance.language, 'en');
});

it('uses the English asset name when the Dataset has no Chinese name', () => {
  const englishOnlyName = { name_en: 'Published name', name_zh: '' };
  const bilingualName = { name_en: 'Published name', name_zh: '已发布名称' };

  assert.equal(getAssetDisplayName(englishOnlyName, 'zh'), 'Published name');
  assert.equal(getAssetDisplayName(bilingualName, 'zh'), '已发布名称');
  assert.equal(getAssetDisplayName(bilingualName, 'en'), 'Published name');
});
