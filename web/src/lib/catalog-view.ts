/**
 * [INPUT]: 依赖经过 SHA256、schema、数量和 URL 校验的目录资产。
 * [OUTPUT]: 导出类别树、筛选统计、浏览器搜索排序和虚拟行分组函数。
 * [POS]: 画廊纯视图算法边界；不请求数据，也不更改原始目录顺序。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import type { CatalogAsset } from './catalog';
import type { Locale } from './locale';

export type CatalogFormat = 'glb' | 'blend';
export type TriangleBand = 'under-5k' | '5k-to-25k' | '25k-plus';
export type CatalogSort = 'id-asc' | 'name-asc' | 'triangles-asc' | 'triangles-desc';

export function isCatalogSort(value: string): value is CatalogSort {
  return value === 'id-asc' || value === 'name-asc' || value === 'triangles-asc' || value === 'triangles-desc';
}

export type CatalogFilters = {
  query: string;
  categoryPath: string | null;
  formats: readonly CatalogFormat[];
  tags: readonly string[];
  triangleBand: TriangleBand | null;
};

export type CategoryNode = {
  label: string;
  path: string;
  count: number;
  children: CategoryNode[];
};

export type CatalogFacets = {
  categories: CategoryNode[];
  formats: Record<CatalogFormat, number>;
  tags: Array<{ label: string; count: number }>;
  triangleBands: Record<TriangleBand, number>;
};

const EMPTY_CATEGORY = 'Uncategorized';

/** Category strings accept the documented slash or greater-than separator. */
export function categorySegments(category: string | null): string[] {
  const parts = (category ?? '')
    .split(/[/>]/)
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [EMPTY_CATEGORY];
}

export function categoryPathFor(category: string | null): string {
  return categorySegments(category).join('/');
}

export function triangleBandFor(value: number | null): TriangleBand | null {
  if (value === null) return null;
  if (value < 5_000) return 'under-5k';
  if (value < 25_000) return '5k-to-25k';
  return '25k-plus';
}

export function assetHasFormat(asset: CatalogAsset, format: CatalogFormat): boolean {
  return format === 'glb' ? Boolean(asset.glb_url) : Boolean(asset.blend_url);
}

export function buildCategoryTree(assets: readonly CatalogAsset[]): CategoryNode[] {
  type MutableNode = CategoryNode;
  const roots: MutableNode[] = [];

  for (const asset of assets) {
    let siblingNodes = roots;
    let currentPath = '';
    for (const label of categorySegments(asset.category)) {
      currentPath = currentPath ? `${currentPath}/${label}` : label;
      let node = siblingNodes.find((candidate) => candidate.label === label);
      if (!node) {
        node = { label, path: currentPath, count: 0, children: [] };
        siblingNodes.push(node);
      }
      node.count += 1;
      siblingNodes = node.children;
    }
  }

  const sortNodes = (nodes: MutableNode[]): MutableNode[] =>
    nodes
      .map((node) => ({ ...node, children: sortNodes(node.children) }))
      .sort((left, right) => left.label.localeCompare(right.label));

  return sortNodes(roots);
}

export function buildCatalogFacets(assets: readonly CatalogAsset[]): CatalogFacets {
  const tags = new Map<string, number>();
  const triangleBands: CatalogFacets['triangleBands'] = {
    'under-5k': 0,
    '5k-to-25k': 0,
    '25k-plus': 0,
  };
  const formats: CatalogFacets['formats'] = { glb: 0, blend: 0 };

  for (const asset of assets) {
    for (const tag of asset.tags) {
      const label = tag.trim();
      if (label) tags.set(label, (tags.get(label) ?? 0) + 1);
    }
    for (const format of ['glb', 'blend'] as const) {
      if (assetHasFormat(asset, format)) formats[format] += 1;
    }
    const band = triangleBandFor(asset.triangles);
    if (band) triangleBands[band] += 1;
  }

  return {
    categories: buildCategoryTree(assets),
    formats,
    tags: [...tags].map(([label, count]) => ({ label, count }))
      .sort((left, right) => left.label.localeCompare(right.label)),
    triangleBands,
  };
}

function normalizedSearchText(value: string): string {
  return value.normalize('NFKC').toLowerCase();
}

function matchesCategory(asset: CatalogAsset, selectedPath: string | null): boolean {
  if (!selectedPath) return true;
  const selected = selectedPath.split('/');
  const actual = categorySegments(asset.category);
  return selected.every((segment, index) => actual[index] === segment);
}

function displayName(asset: CatalogAsset, locale: Locale): string {
  if (locale === 'zh' && asset.name_zh.trim()) return asset.name_zh;
  return asset.name_en;
}

function compareNullableNumbers(left: number | null, right: number | null): number {
  if (left === null && right === null) return 0;
  if (left === null) return 1;
  if (right === null) return -1;
  return left - right;
}

export function filterAndSortAssets(
  assets: readonly CatalogAsset[],
  filters: CatalogFilters,
  sort: CatalogSort,
  locale: Locale,
): CatalogAsset[] {
  const query = normalizedSearchText(filters.query.trim());
  const selectedTags = new Set(filters.tags);
  const selectedFormats = new Set(filters.formats);

  const result = assets.filter((asset) => {
    if (query) {
      const searchTarget = normalizedSearchText([
        asset.id,
        asset.name_en,
        asset.name_zh,
        asset.category ?? '',
        ...asset.tags,
      ].join(' '));
      if (!searchTarget.includes(query)) return false;
    }
    if (!matchesCategory(asset, filters.categoryPath)) return false;
    if ([...selectedTags].some((tag) => !asset.tags.includes(tag))) return false;
    if (
      selectedFormats.size > 0 &&
      ![...selectedFormats].some((format) => assetHasFormat(asset, format))
    ) return false;
    if (filters.triangleBand && triangleBandFor(asset.triangles) !== filters.triangleBand) {
      return false;
    }
    return true;
  });

  result.sort((left, right) => {
    if (sort === 'name-asc') {
      const collatorLocale = locale === 'zh' ? 'zh-CN' : 'en';
      return displayName(left, locale).localeCompare(displayName(right, locale), collatorLocale) ||
        left.id.localeCompare(right.id, undefined, { numeric: true });
    }
    if (sort === 'triangles-asc') {
      return compareNullableNumbers(left.triangles, right.triangles) ||
        left.id.localeCompare(right.id, undefined, { numeric: true });
    }
    if (sort === 'triangles-desc') {
      return compareNullableNumbers(right.triangles, left.triangles) ||
        left.id.localeCompare(right.id, undefined, { numeric: true });
    }
    return left.id.localeCompare(right.id, undefined, { numeric: true });
  });

  return result;
}

/** Row grouping lets a single vertical virtualizer preserve responsive CSS columns. */
export function groupIntoRows<T>(items: readonly T[], columns: number): T[][] {
  if (!Number.isSafeInteger(columns) || columns < 1) {
    throw new RangeError('Virtual grid columns must be a positive integer.');
  }
  const rows: T[][] = [];
  for (let index = 0; index < items.length; index += columns) {
    rows.push(items.slice(index, index + columns));
  }
  return rows;
}

export function hasCatalogFilters(filters: CatalogFilters): boolean {
  return Boolean(
    filters.query.trim() ||
    filters.categoryPath ||
    filters.formats.length ||
    filters.tags.length ||
    filters.triangleBand,
  );
}
