/**
 * [INPUT]: 依赖纯目录视图函数与离线资产 fixture。
 * [OUTPUT]: 覆盖分类树、facet 数量、筛选、排序和虚拟行分组。
 * [POS]: 浏览器目录算法回归；fixture 不离开测试目录。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { describe, expect, it } from 'vite-plus/test';
import {
  buildCatalogFacets,
  categoryPathFor,
  filterAndSortAssets,
  groupIntoRows,
  hasCatalogFilters,
  isCatalogSort,
  triangleBandFor,
} from '../src/lib/catalog-view.ts';

const baseUrl = 'https://huggingface.co/datasets/daftAI2026/3d-assets/resolve/main/';

function asset(id, overrides = {}) {
  return {
    id,
    name_en: `Asset ${id}`,
    name_zh: '',
    category: null,
    revision: null,
    source_sha256: 'a'.repeat(64),
    license: null,
    source: null,
    tags: [],
    triangles: null,
    vertices: null,
    dimensions_m: null,
    file_size_bytes: null,
    published_at_utc: null,
    glb_url: null,
    blend_url: null,
    preview_url: null,
    preview_urls: [],
    metadata_url: null,
    prompt_url: null,
    settings_url: null,
    ...overrides,
  };
}

const assets = [
  asset('LPW-00003', {
    name_en: 'Stone Cairn',
    name_zh: '石堆',
    category: 'Environment / Rocks',
    tags: ['stone', 'outdoor'],
    triangles: 4_999,
    glb_url: `${baseUrl}assets/LPW-00003/model.glb`,
  }),
  asset('LPW-00001', {
    name_en: 'Forest Pine',
    category: 'Environment > Plants',
    tags: ['plant', 'outdoor'],
    triangles: 5_000,
    blend_url: `${baseUrl}sources/LPW-00001/model.blend`,
  }),
  asset('LPW-00002', {
    name_en: 'Indoor Table',
    category: 'Props/Furniture',
    tags: ['wood', 'furniture'],
    triangles: 25_000,
    glb_url: `${baseUrl}assets/LPW-00002/model.glb`,
    blend_url: `${baseUrl}sources/LPW-00002/model.blend`,
  }),
];

const emptyFilters = {
  query: '',
  categoryPath: null,
  formats: [],
  tags: [],
  triangleBand: null,
};

describe('catalog view algorithms', () => {
  it('builds normalized category paths and ancestor counts', () => {
    expect(categoryPathFor('Environment > Rocks')).toBe('nature/rocks');
    const facets = buildCatalogFacets(assets);
    const environment = facets.categories.find((node) => node.label === 'nature');
    expect(environment?.count).toBe(2);
    expect(environment?.children.map((node) => node.label)).toEqual(['plants', 'rocks']);
  });

  it('counts formats, tags and triangle bands from published records', () => {
    const facets = buildCatalogFacets(assets);
    expect(facets.formats).toEqual({ glb: 2, blend: 2 });
    expect(facets.triangleBands).toEqual({
      'under-5k': 1,
      '5k-to-25k': 1,
      '25k-plus': 1,
    });
    expect(facets.tags).toContainEqual({ label: 'outdoor', count: 2 });
    expect(triangleBandFor(null)).toBeNull();
  });

  it('combines category prefix, format OR, and tag AND filters', () => {
    const result = filterAndSortAssets(
      assets,
      {
        ...emptyFilters,
        categoryPath: 'Environment',
        formats: ['glb', 'blend'],
        tags: ['outdoor'],
      },
      'id-asc',
      'en',
    );
    expect(result.map((item) => item.id)).toEqual(['LPW-00001', 'LPW-00003']);
  });

  it('searches names, ids, categories and tags without case sensitivity', () => {
    const result = filterAndSortAssets(
      assets,
      { ...emptyFilters, query: 'OUTDOOR' },
      'id-asc',
      'en',
    );
    expect(result.map((item) => item.id)).toEqual(['LPW-00001', 'LPW-00003']);
  });

  it('sorts by localized name and places unknown triangle counts last', () => {
    const mixed = [asset('LPW-9', { name_en: 'Zebra', triangles: null }), ...assets];
    const names = [
      asset('LPW-00010', { name_en: 'Aardvark', name_zh: 'Zulu' }),
      asset('LPW-00011', { name_en: 'Zulu', name_zh: 'Alpha' }),
    ];
    const localized = filterAndSortAssets(names, emptyFilters, 'name-asc', 'zh');
    const english = filterAndSortAssets(names, emptyFilters, 'name-asc', 'en');
    expect(localized[0].id).toBe('LPW-00011');
    expect(english[0].id).toBe('LPW-00010');
    const triangleOrder = filterAndSortAssets(mixed, emptyFilters, 'triangles-asc', 'en');
    expect(triangleOrder.at(-1).id).toBe('LPW-9');
  });

  it('keeps ID sort deterministic and validates select values', () => {
    expect(
      filterAndSortAssets(assets, emptyFilters, 'id-asc', 'en').map((item) => item.id),
    ).toEqual(['LPW-00001', 'LPW-00002', 'LPW-00003']);
    expect(isCatalogSort('triangles-desc')).toBe(true);
    expect(isCatalogSort('unexpected')).toBe(false);
  });

  it('groups responsive rows and rejects invalid column counts', () => {
    expect(groupIntoRows([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(groupIntoRows([], 2)).toEqual([]);
    expect(() => groupIntoRows([1], 0)).toThrow(RangeError);
    expect(() => groupIntoRows([1], 1.5)).toThrow(RangeError);
  });

  it('reports active filters without constructing a fake record', () => {
    expect(hasCatalogFilters(emptyFilters)).toBe(false);
    expect(hasCatalogFilters({ ...emptyFilters, triangleBand: 'under-5k' })).toBe(true);
  });
});
