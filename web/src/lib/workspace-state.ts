/**
 * [INPUT]: 依赖 URLSearchParams、统一分类路径与目录筛选类型。
 * [OUTPUT]: 导出浏览状态的白名单解析、规范序列化与默认值。
 * [POS]: 分享、历史与语言切换共用的状态契约；不保存模型或凭据。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { normalizeCategoryPath } from './category-taxonomy.ts';
import { isCatalogSort, type CatalogFilters, type CatalogSort } from './catalog-view';
export type PreviewDock = 'right' | 'left' | 'bottom';
export type WorkspaceState = {
  filters: CatalogFilters;
  sort: CatalogSort;
  view: 'grid' | 'list';
  density: 'small' | 'medium' | 'large';
  asset: string | null;
  dock: PreviewDock;
  expanded: boolean;
  selected: string[];
};
export const emptyFilters: CatalogFilters = {
  query: '',
  categoryPath: null,
  formats: [],
  tags: [],
  triangleBand: null,
};
export function defaultWorkspace(): WorkspaceState {
  return {
    filters: { ...emptyFilters },
    sort: 'id-asc',
    view: 'grid',
    density: 'medium',
    asset: null,
    dock: 'right',
    expanded: false,
    selected: [],
  };
}
const assetID = /^LPW-\d{5}$/;

// ---- 连续编号压成区间，避免批量选择生成超长重复 query ----
export function encodeSelection(ids: readonly string[]): string {
  const numbers = [
    ...new Set(ids.filter((id) => assetID.test(id)).map((id) => Number(id.slice(4)))),
  ].sort((a, b) => a - b);
  const groups: string[] = [];
  for (let i = 0; i < numbers.length; i++) {
    const start = numbers[i];
    let end = start;
    while (numbers[i + 1] === end + 1) {
      end = numbers[++i];
    }
    groups.push(start === end ? start.toString(36) : `${start.toString(36)}-${end.toString(36)}`);
  }
  return groups.join('.');
}
export function decodeSelection(value: string): string[] {
  const ids: string[] = [];
  for (const group of value.split('.')) {
    if (!/^[0-9a-z]+(?:-[0-9a-z]+)?$/.test(group)) continue;
    const [a, b] = group.split('-');
    const start = parseInt(a, 36);
    const end = b ? parseInt(b, 36) : start;
    if (start > end || end > 99999 || end - start >= 10000) continue;
    for (let n = start; n <= end && ids.length < 10000; n++)
      ids.push(`LPW-${String(n).padStart(5, '0')}`);
    if (ids.length >= 10000) break;
  }
  return [...new Set(ids)].sort();
}

const unique = (values: string[]) => [...new Set(values.filter(Boolean))];
export function parseWorkspace(search: string): WorkspaceState {
  const p = new URLSearchParams(search);
  const s = defaultWorkspace();
  const get = (key: string): string | null => {
    const raw = p.get(key);
    if (raw?.startsWith('"')) {
      try {
        const v: unknown = JSON.parse(raw);
        if (typeof v === 'string') return v;
      } catch {
        /* 保留原始搜索文本 */
      }
    }
    return raw;
  };
  // ---- TanStack 将数组序列化为 JSON；同时接受原生重复 query 键 ----
  const list = (key: string): string[] =>
    p.getAll(key).flatMap((raw) => {
      if (!raw.startsWith('[')) return [raw];
      try {
        const value: unknown = JSON.parse(raw);
        return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
      } catch {
        return [];
      }
    });
  const band = get('triangles');
  s.filters = {
    query: (get('q') ?? '').slice(0, 500),
    categoryPath: normalizeCategoryPath(get('category')?.slice(0, 300)),
    formats: unique(list('format'))
      .filter((f): f is 'glb' | 'blend' => f === 'glb' || f === 'blend')
      .sort(),
    tags: unique(list('tag')).slice(0, 50).sort(),
    triangleBand: band === 'under-5k' || band === '5k-to-25k' || band === '25k-plus' ? band : null,
    license: get('license')?.slice(0, 300) || null,
    source: get('source')?.slice(0, 300) || null,
    dimension:
      get('dimension') === 'under-1m'
        ? 'under-1m'
        : get('dimension') === '1m-plus'
          ? '1m-plus'
          : null,
    withPreview: get('preview') === '1',
  };
  const sort = get('sort') ?? '';
  if (isCatalogSort(sort)) s.sort = sort;
  if (get('view') === 'list') s.view = 'list';
  const density = get('density');
  if (density === 'small' || density === 'large') s.density = density;
  const asset = get('asset');
  s.asset = asset && assetID.test(asset) ? asset : null;
  const dock = get('dock');
  if (dock === 'left' || dock === 'bottom') s.dock = dock;
  s.expanded = Boolean(s.asset && get('expanded') === '1');
  s.selected = unique([...list('selected'), ...decodeSelection(get('selection') ?? '')])
    .filter((id) => assetID.test(id))
    .slice(0, 10000)
    .sort();
  return s;
}
export function serializeWorkspace(s: WorkspaceState): string {
  const p = new URLSearchParams();
  const f = s.filters;
  if (f.query) p.set('q', f.query);
  if (f.categoryPath) p.set('category', f.categoryPath);
  for (const fmat of [...f.formats].sort()) p.append('format', fmat);
  for (const tag of [...new Set(f.tags)].sort()) p.append('tag', tag);
  if (f.triangleBand) p.set('triangles', f.triangleBand);
  if (f.license) p.set('license', f.license);
  if (f.source) p.set('source', f.source);
  if (f.dimension) p.set('dimension', f.dimension);
  if (f.withPreview) p.set('preview', '1');
  if (s.sort !== 'id-asc') p.set('sort', s.sort);
  if (s.view !== 'grid') p.set('view', s.view);
  if (s.density !== 'medium') p.set('density', s.density);
  if (s.asset) p.set('asset', s.asset);
  if (s.dock !== 'right') p.set('dock', s.dock);
  if (s.asset && s.expanded) p.set('expanded', '1');
  const selected = [...new Set(s.selected)].sort();
  if (selected.length > 20) p.set('selection', encodeSelection(selected));
  else for (const id of selected) p.append('selected', id);
  return p.toString();
}
