/**
 * [INPUT]: 依赖固定分类词表与合成名称，不读取远端模型。
 * [OUTPUT]: 验证中英归并、证据优先级与模糊名称保留未分类。
 * [POS]: 分类显示和筛选的共同契约回归。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { describe, it, expect } from 'vite-plus/test';
import {
  classifyCategory,
  categoryLabel,
  normalizeCategoryPath,
  categoryDisplayPath,
} from '../src/lib/category-taxonomy.ts';
describe('Controlled object taxonomy', () => {
  it('normalizes aliases without mixing language into category IDs', () => {
    expect(normalizeCategoryPath('furniture')).toBe('furniture');
    expect(normalizeCategoryPath('家具 > 床具')).toBe('furniture/beds');
    expect(normalizeCategoryPath('建筑/宗教与历史')).toBe('architecture/religious-historic');
    expect(categoryLabel('architecture/religious-historic', 'zh')).toBe('宗教与历史建筑');
    expect(categoryDisplayPath('furniture/beds', 'en')).toBe('Furniture / Beds');
  });
  it('uses supplied specific classification before name suggestions', () => {
    expect(
      classifyCategory({
        category: '家具/收纳',
        name_en: 'Shoe cabinet',
        name_zh: '',
      }).path,
    ).toBe('furniture/storage');
  });
  it('classifies clear historical names but leaves ambiguous cases unknown', () => {
    expect(
      classifyCategory({
        category: 'Uncategorized',
        name_en: 'Pedestal dining table',
        name_zh: '单柱圆餐桌',
      }).path,
    ).toBe('furniture/tables');
    expect(classifyCategory({ category: null, name_en: 'Table lamp', name_zh: '' }).path).toBe(
      'household/lighting',
    );
    expect(
      classifyCategory({
        category: null,
        name_en: 'Baseball cap',
        name_zh: '棒球帽',
      }).path,
    ).toBe('clothing/headwear');
    expect(classifyCategory({ category: null, name_en: 'Object 24', name_zh: '' }).path).toBe(
      'uncategorized',
    );
    expect(
      classifyCategory({
        category: null,
        name_en: 'Chair and lamp',
        name_zh: '',
      }).path,
    ).toBe('uncategorized');
  });
  it('keeps unknown source categories as diagnostics rather than visible mixed labels', () => {
    const result = classifyCategory({
      category: 'unmapped-production-bucket',
      name_en: 'Object',
      name_zh: '',
    });
    expect(result.path).toBe('uncategorized');
    expect(result.reason).toBe('unresolved');
  });
});
