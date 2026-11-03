/**
 * [INPUT]: 依赖固定分类词表与明确物体、修饰语和歧义的合成名称。
 * [OUTPUT]: 验证中英归并、历史物体覆盖、复合名词与歧义回退。
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
  it.each([
    ['Electric rice cooker', '电饭煲', 'household/kitchen'],
    ['Takoyaki pan', '章鱼烧模盘', 'household/cookware'],
    ['Steam mop', '蒸汽拖把', 'household/cleaning'],
    ['Walk in bathtub', '步入式浴缸', 'household/bathroom'],
    ['Lipstick tube', '口红管', 'household/personal-care'],
    ['Folding umbrella', '折叠雨伞', 'household/travel'],
    ['Doctor bag', '医生包', 'clothing/bags'],
    ['Yukata', '浴衣', 'clothing'],
    ['Mortarboard', '学士帽', 'clothing/headwear'],
    ['Geta', '木屐', 'clothing/footwear'],
    ['Clinical thermometer', '体温计', 'tools/healthcare'],
    ['Alpine chalet', '阿尔卑斯木屋', 'architecture/residential'],
    ['Community clinic', '社区诊所', 'architecture/public-commercial'],
  ])('covers a named object family: %s', (name_en, name_zh, path) => {
    expect(classifyCategory({ category: 'Uncategorized', name_en, name_zh }))
      .toEqual({ path, reason: 'name' });
  });
  it.each([
    ['Desktop vacuum', '桌面迷你吸尘器', 'household/cleaning'],
    ['Garment steamer', '立式挂烫机', 'household/cleaning'],
    ['Shoe brush', '鞋刷', 'household/cleaning'],
    ['Camera shoulder bag', '相机肩包', 'clothing/bags'],
    ['Bicycle pannier', '自行车驮包', 'clothing/bags'],
    ['Manual wheelchair', '手动轮椅', 'tools/healthcare'],
    ['Shower stool', '洗澡凳', 'household/bathroom'],
    ['Squat toilet pan', '蹲式便器', 'household/bathroom'],
    ['Straw sunhat', '宽檐草帽', 'clothing/headwear'],
    ['Gladiator sandal', '罗马绑带凉鞋', 'clothing/footwear'],
    ['Tree house', '树上木屋', 'architecture/residential'],
    ['Swallowtail roof house', '闽南燕尾脊宅', 'architecture/residential'],
    ['C shaped sofa table', 'C形沙发边桌', 'furniture/tables'],
  ])('uses the compound object rather than its modifier: %s', (name_en, name_zh, path) => {
    expect(classifyCategory({ category: null, name_en, name_zh }).path).toBe(path);
  });
  it('keeps unsupported names and conflicting families unresolved', () => {
    for (const name_en of ['Object 24', 'LPW-00700', 'Unknown prop', 'Chair and lamp']) {
      expect(classifyCategory({ category: null, name_en, name_zh: '' }))
        .toEqual({ path: 'uncategorized', reason: 'unresolved' });
    }
    expect(classifyCategory({
      category: 'unmapped-production-bucket', name_en: 'Chair', name_zh: '椅子',
    })).toEqual({ path: 'uncategorized', reason: 'unresolved' });
  });

  it.each([
    ['Bicycle', '自行车', 'transport'],
    ['Camera', '相机', 'tools'],
    ['Pine tree', '松树', 'nature/plants'],
    ['Rock', '岩石', 'nature/rocks'],
    ['Sofa', '沙发', 'furniture/seating'],
  ])('does not move the actual modified object into an accessory family: %s', (name_en, name_zh, path) => {
    expect(classifyCategory({ category: null, name_en, name_zh }).path).toBe(path);
  });

});
