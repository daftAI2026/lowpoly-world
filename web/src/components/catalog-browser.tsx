/**
 * [INPUT]: 依赖已验证目录资产、双语资源和纯目录视图算法。
 * [OUTPUT]: 导出首页资产库工作台，组合搜索、facet、排序、计数和虚拟网格。
 * [POS]: 首页数据交互边界；所有筛选只在浏览器中作用于公开快照。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CatalogFilters as CatalogFiltersPanel } from '@/components/catalog-filters';
import { CatalogGrid } from '@/components/catalog-grid';
import { Input } from '@/components/ui/input';
import { buildCatalogFacets, filterAndSortAssets, hasCatalogFilters, isCatalogSort, type CatalogFilters, type CatalogSort, type CatalogFormat, type TriangleBand } from '@/lib/catalog-view';
import type { Catalog } from '@/lib/catalog';
import type { Locale } from '@/lib/locale';

const emptyFilters: CatalogFilters = {
  query: '',
  categoryPath: null,
  formats: [],
  tags: [],
  triangleBand: null,
};

type CatalogBrowserProps = {
  catalog: Catalog;
  locale: Locale;
};

function toggleValue<T>(values: readonly T[], value: T, enabled: boolean): T[] {
  if (enabled) return values.includes(value) ? [...values] : [...values, value];
  return values.filter((current) => current !== value);
}

export function CatalogBrowser({ catalog, locale }: CatalogBrowserProps) {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<CatalogFilters>(emptyFilters);
  const [sort, setSort] = useState<CatalogSort>('id-asc');
  const facets = useMemo(() => buildCatalogFacets(catalog.assets), [catalog.assets]);
  const visibleAssets = useMemo(
    () => filterAndSortAssets(catalog.assets, filters, sort, locale),
    [catalog.assets, filters, sort, locale],
  );
  const activeFilters = hasCatalogFilters(filters);

  const setFormat = (format: CatalogFormat, enabled: boolean) => {
    setFilters((current) => ({ ...current, formats: toggleValue(current.formats, format, enabled) }));
  };
  const setTag = (tag: string, enabled: boolean) => {
    setFilters((current) => ({ ...current, tags: toggleValue(current.tags, tag, enabled) }));
  };
  const setTriangleBand = (triangleBand: TriangleBand, enabled: boolean) => {
    setFilters((current) => ({
      ...current,
      triangleBand: enabled ? triangleBand : current.triangleBand === triangleBand ? null : current.triangleBand,
    }));
  };
  const clearFilters = () => setFilters({ ...emptyFilters });

  return (
    <section className="catalog-browser" aria-label={t('home.collectionTitle')}>
      <div className="catalog-toolbar">
        <label className="catalog-search">
          <span className="visually-hidden">{t('home.searchLabel')}</span>
          <Search aria-hidden="true" />
          <Input
            type="search"
            value={filters.query}
            placeholder={t('home.searchPlaceholder')}
            onChange={(event) => setFilters((current) => ({ ...current, query: event.currentTarget.value }))}
          />
        </label>

        <label className="sort-control">
          <span>{t('home.sortLabel')}</span>
          <select
            value={sort}
            onChange={(event) => {
              const value = event.currentTarget.value;
              if (isCatalogSort(value)) setSort(value);
            }}
          >
            <option value="id-asc">{t('home.sortId')}</option>
            <option value="name-asc">{t('home.sortName')}</option>
            <option value="triangles-asc">{t('home.sortTriangles')}</option>
            <option value="triangles-desc">{t('home.sortTrianglesDesc')}</option>
          </select>
        </label>

        <p className="catalog-result-count" aria-live="polite">
          {t('home.resultCount', { visible: visibleAssets.length, total: catalog.count })}
        </p>
      </div>

      <div className="catalog-workspace">
        <CatalogFiltersPanel
          facets={facets}
          filters={filters}
          onCategoryChange={(categoryPath) => setFilters((current) => ({ ...current, categoryPath }))}
          onFormatChange={setFormat}
          onTagChange={setTag}
          onTriangleBandChange={setTriangleBand}
          onClear={clearFilters}
          hasFilters={activeFilters}
        />
        <div className="catalog-results">
          <CatalogGrid
            assets={visibleAssets}
            locale={locale}
            onClearFilters={clearFilters}
            hasFilters={activeFilters}
          />
        </div>
      </div>
    </section>
  );
}
