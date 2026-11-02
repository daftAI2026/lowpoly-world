/**
 * [INPUT]: 依赖目录派生 facet、当前筛选状态、实际内容宽度和本地化事件。
 * [OUTPUT]: 导出分类树、格式、三角面数和标签筛选面板。
 * [POS]: 画廊筛选唯一视图；计数来自已校验目录，不读取外部统计。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import type { CatalogAsset } from '@/lib/catalog';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/components/ui/checkbox';
import type {
  CatalogFacets,
  CatalogFilters,
  CategoryNode,
  CatalogFormat,
  TriangleBand,
} from '@/lib/catalog-view';

type CatalogFiltersProps = {
  facets: CatalogFacets;
  assets: CatalogAsset[];
  onExtraChange: (next: Partial<CatalogFilters>) => void;
  hiddenGroups: string[];
  filters: CatalogFilters;
  onCategoryChange: (path: string | null) => void;
  onFormatChange: (format: CatalogFormat, enabled: boolean) => void;
  onTagChange: (tag: string, enabled: boolean) => void;
  onTriangleBandChange: (band: TriangleBand, enabled: boolean) => void;
  onClear: () => void;
  hasFilters: boolean;
};

type CategoryTreeProps = {
  nodes: CategoryNode[];
  selectedPath: string | null;
  onSelect: (path: string | null) => void;
};

function CategoryBranch({
  node,
  selectedPath,
  onSelect,
}: {
  node: CategoryNode;
  selectedPath: string | null;
  onSelect: (path: string | null) => void;
}) {
  const [expanded, setExpanded] = useState(
    Boolean(selectedPath && selectedPath.startsWith(node.path + '/')),
  );
  useEffect(() => {
    if (selectedPath?.startsWith(node.path + '/')) setExpanded(true);
  }, [selectedPath, node.path]);
  const { t } = useTranslation();
  const hasChildren = node.children.length > 0;
  const label = node.label === 'Uncategorized' ? t('home.uncategorized') : node.label;
  const childId = `category-${encodeURIComponent(node.path)}`;

  return (
    <li className="category-tree-node">
      <div className="category-tree-row">
        {hasChildren ? (
          <button
            type="button"
            className="category-disclosure"
            aria-label={
              expanded
                ? t('home.collapseCategory', { category: label })
                : t('home.expandCategory', { category: label })
            }
            aria-expanded={expanded}
            aria-controls={childId}
            onClick={() => setExpanded((current) => !current)}
          >
            {expanded ? <ChevronDown aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
          </button>
        ) : (
          <span className="category-disclosure-spacer" aria-hidden="true" />
        )}
        <button
          type="button"
          className="category-select"
          data-selected={selectedPath === node.path}
          aria-pressed={selectedPath === node.path}
          onClick={() => onSelect(selectedPath === node.path ? null : node.path)}
        >
          <span>{label}</span>
          <span className="facet-count">{node.count}</span>
        </button>
      </div>
      {hasChildren && (
        <ul id={childId} className="category-tree-children" hidden={!expanded}>
          {node.children.map((child) => (
            <CategoryBranch
              key={child.path}
              node={child}
              selectedPath={selectedPath}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function CategoryTree({ nodes, selectedPath, onSelect }: CategoryTreeProps) {
  const { t } = useTranslation();
  return (
    <ul className="category-tree">
      {nodes.map((node) => (
        <CategoryBranch
          key={node.path}
          node={node}
          selectedPath={selectedPath}
          onSelect={onSelect}
        />
      ))}
      {nodes.length === 0 && <li className="facet-empty">{t('home.noFacetValues')}</li>}
    </ul>
  );
}

function FilterOption({
  id,
  label,
  count,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  count: number;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="filter-option" htmlFor={id}>
      <Checkbox id={id} checked={checked} onCheckedChange={(value) => onChange(value === true)} />
      <span className="filter-option-label">{label}</span>
      <span className="facet-count">{count}</span>
    </label>
  );
}

export function CatalogFilters({
  facets,
  assets,
  onExtraChange,
  hiddenGroups,
  filters,
  onCategoryChange,
  onFormatChange,
  onTagChange,
  onTriangleBandChange,
  onClear,
  hasFilters,
}: CatalogFiltersProps) {
  const { t } = useTranslation();
  const filtersRef = useRef<HTMLElement>(null);
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  useEffect(() => {
    const host = filtersRef.current?.closest<HTMLElement>('.site-main');
    if (!host) return;
    const syncWidth = () => setIsDesktop(host.clientWidth >= 720);
    syncWidth();
    const observer = new ResizeObserver(syncWidth);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const filtersOpen = isDesktop === null || isDesktop || isExpanded;
  const valuesFor = (field: 'license' | 'source') =>
    [...new Set(assets.map((a) => a[field]).filter((v): v is string => Boolean(v)))].sort();
  const selectedFormats = new Set(filters.formats);
  const selectedTags = new Set(filters.tags);
  const selectedBand = filters.triangleBand;
  const formatOptions: Array<{ value: CatalogFormat; label: string; count: number }> = [
    { value: 'glb', label: 'GLB', count: facets.formats.glb },
    { value: 'blend', label: 'BLEND', count: facets.formats.blend },
  ];
  const bandOptions: Array<{ value: TriangleBand; label: string; count: number }> = [
    {
      value: 'under-5k',
      label: t('home.triangleBandMinimal'),
      count: facets.triangleBands['under-5k'],
    },
    {
      value: '5k-to-25k',
      label: t('home.triangleBandLight'),
      count: facets.triangleBands['5k-to-25k'],
    },
    {
      value: '25k-plus',
      label: t('home.triangleBandDense'),
      count: facets.triangleBands['25k-plus'],
    },
  ];

  return (
    <aside ref={filtersRef} className="catalog-filters" aria-label={t('home.filters')}>
      <details
        className="filter-disclosure"
        open={filtersOpen}
        onToggle={(event) => {
          if (!isDesktop) setIsExpanded(event.currentTarget.open);
        }}
      >
        <summary>{t('home.filters')}</summary>
        <div className="filter-panel">
          <section className="filter-group" aria-labelledby="category-filter-heading">
            <h3 id="category-filter-heading">{t('home.categories')}</h3>
            <button
              type="button"
              className="category-select category-all"
              data-selected={filters.categoryPath === null}
              aria-pressed={filters.categoryPath === null}
              onClick={() => onCategoryChange(null)}
            >
              <span>{t('home.allCategories')}</span>
            </button>
            <CategoryTree
              nodes={facets.categories}
              selectedPath={filters.categoryPath}
              onSelect={onCategoryChange}
            />
          </section>

          <section
            className="filter-group"
            hidden={hiddenGroups.includes('format')}
            aria-labelledby="format-filter-heading"
          >
            <h3 id="format-filter-heading">{t('home.formats')}</h3>
            {formatOptions
              .filter((option) => option.count > 0)
              .map((option) => (
                <FilterOption
                  key={option.value}
                  id={`format-${option.value}`}
                  label={option.label}
                  count={option.count}
                  checked={selectedFormats.has(option.value)}
                  onChange={(checked) => onFormatChange(option.value, checked)}
                />
              ))}
            {formatOptions.every((option) => option.count === 0) && (
              <p className="facet-empty">{t('home.noFacetValues')}</p>
            )}
          </section>

          <section
            className="filter-group"
            hidden={hiddenGroups.includes('triangle')}
            aria-labelledby="triangle-filter-heading"
          >
            <h3 id="triangle-filter-heading" title={t('home.triangleFilterNote')}>
              {t('home.lowPolyLevel')}
            </h3>
            {bandOptions
              .filter((option) => option.count > 0)
              .map((option) => (
                <FilterOption
                  key={option.value}
                  id={`triangles-${option.value}`}
                  label={option.label}
                  count={option.count}
                  checked={selectedBand === option.value}
                  onChange={(checked) => onTriangleBandChange(option.value, checked)}
                />
              ))}
            {bandOptions.every((option) => option.count === 0) && (
              <p className="facet-empty">{t('home.noFacetValues')}</p>
            )}
          </section>

          {facets.tags.length > 0 && (
            <section
              className="filter-group"
              hidden={hiddenGroups.includes('tag')}
              aria-labelledby="tag-filter-heading"
            >
              <h3 id="tag-filter-heading">{t('home.tags')}</h3>
              <div className="tag-filter-list">
                {facets.tags.map((tag) => (
                  <FilterOption
                    key={tag.label}
                    id={`tag-${encodeURIComponent(tag.label)}`}
                    label={tag.label}
                    count={tag.count}
                    checked={selectedTags.has(tag.label)}
                    onChange={(checked) => onTagChange(tag.label, checked)}
                  />
                ))}
              </div>
            </section>
          )}

          {(['license', 'source'] as const).map(
            (field) =>
              valuesFor(field).length > 0 &&
              !hiddenGroups.includes(field) && (
                <label className="filter-group extra-filter" key={field}>
                  <span>{t(`workspace.${field}`)}</span>
                  <select
                    value={filters[field] ?? ''}
                    onChange={(e) => onExtraChange({ [field]: e.currentTarget.value || null })}
                  >
                    <option value="">{t('workspace.any')}</option>
                    {valuesFor(field).map((v) => (
                      <option key={v} value={v}>
                        {v} ({assets.filter((a) => a[field] === v).length})
                      </option>
                    ))}
                  </select>
                </label>
              ),
          )}
          {assets.some((a) => a.dimensions_m) && !hiddenGroups.includes('dimension') && (
            <label className="filter-group extra-filter">
              <span>{t('workspace.dimension')}</span>
              <select
                value={filters.dimension ?? ''}
                onChange={(e) =>
                  onExtraChange({
                    dimension:
                      e.currentTarget.value === 'under-1m'
                        ? 'under-1m'
                        : e.currentTarget.value === '1m-plus'
                          ? '1m-plus'
                          : null,
                  })
                }
              >
                <option value="">{t('workspace.any')}</option>
                <option value="under-1m">{t('workspace.under1m')}</option>
                <option value="1m-plus">{t('workspace.over1m')}</option>
              </select>
            </label>
          )}
          {hasFilters && (
            <button className="text-button clear-filters" type="button" onClick={onClear}>
              {t('home.clearFilters')}
            </button>
          )}
        </div>
      </details>
    </aside>
  );
}
