/**
 * [INPUT]: 依赖目录 facet、当前筛选与官方 shadcn 折叠、动作和表单。
 * [OUTPUT]: 导出本地化分类树和折叠选项筛选，不提供固定许可或存储来源选择。
 * [POS]: 原生侧栏与抽屉中的筛选内容；不另建折叠外壳。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import type { CatalogAsset } from '@/lib/catalog';
import { categoryLabel } from '@/lib/category-taxonomy.ts';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
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
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === 'zh' ? 'zh' : 'en';
  const hasChildren = node.children.length > 0;
  const label = categoryLabel(node.path, locale);
  const childId = `category-${encodeURIComponent(node.path)}`;

  return (
    <Collapsible
      open={expanded}
      onOpenChange={setExpanded}
      render={<li className="category-tree-node" />}
    >
      <div className="category-tree-row">
        {hasChildren ? (
          <CollapsibleTrigger
            render={<Button variant="ghost" size="icon" />}
            type="button"
            className="category-disclosure"
            aria-label={
              expanded
                ? t('home.collapseCategory', { category: label })
                : t('home.expandCategory', { category: label })
            }
            aria-expanded={expanded}
            aria-controls={childId}
          >
            {expanded ? <ChevronDown aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
          </CollapsibleTrigger>
        ) : (
          <span className="category-disclosure-spacer" aria-hidden="true" />
        )}
        <Button
          variant={selectedPath === node.path ? 'secondary' : 'ghost'}
          type="button"
          className="category-select min-w-0 flex-1 shrink h-auto min-h-10 justify-between whitespace-normal text-left"
          data-selected={selectedPath === node.path}
          aria-pressed={selectedPath === node.path}
          onClick={() => onSelect(selectedPath === node.path ? null : node.path)}
        >
          <span>{label}</span>
          <span className="facet-count">{node.count}</span>
        </Button>
      </div>
      {hasChildren && (
        <CollapsibleContent render={<ul id={childId} className="category-tree-children" />}>
          {node.children.map((child) => (
            <CategoryBranch
              key={child.path}
              node={child}
              selectedPath={selectedPath}
              onSelect={onSelect}
            />
          ))}
        </CollapsibleContent>
      )}
    </Collapsible>
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

function FacetGroup({
  title,
  id,
  children,
  defaultOpen = false,
}: {
  title: string;
  id: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="filter-group">
      <CollapsibleTrigger
        render={<Button variant="ghost" className="facet-heading w-full justify-between px-0" />}
        id={id}
      >
        {title}
        <ChevronDown aria-hidden="true" className="size-3.5" />
      </CollapsibleTrigger>
      <CollapsibleContent className="facet-content">{children}</CollapsibleContent>
    </Collapsible>
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
    <Label className="filter-option" htmlFor={id}>
      <Checkbox id={id} checked={checked} onCheckedChange={(value) => onChange(value === true)} />
      <span className="filter-option-label">{label}</span>
      <span className="facet-count">{count}</span>
    </Label>
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
  const selectedFormats = new Set(filters.formats);
  const selectedTags = new Set(filters.tags);
  const selectedBand = filters.triangleBand;
  const formatOptions: Array<{
    value: CatalogFormat;
    label: string;
    count: number;
  }> = [
    { value: 'glb', label: 'GLB', count: facets.formats.glb },
    { value: 'blend', label: 'BLEND', count: facets.formats.blend },
  ];
  const bandOptions: Array<{
    value: TriangleBand;
    label: string;
    count: number;
  }> = [
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
    <aside className="catalog-filters" aria-label={t('home.filters')}>
      <div className="filter-panel">
        <section className="filter-group" aria-labelledby="category-filter-heading">
          <h3 id="category-filter-heading">{t('home.categories')}</h3>
          <Button
            variant={filters.categoryPath === null ? 'secondary' : 'ghost'}
            type="button"
            className="category-select category-all w-full justify-start"
            data-selected={filters.categoryPath === null}
            aria-pressed={filters.categoryPath === null}
            onClick={() => onCategoryChange(null)}
          >
            <span>{t('home.allCategories')}</span>
          </Button>
          <CategoryTree
            nodes={facets.categories}
            selectedPath={filters.categoryPath}
            onSelect={onCategoryChange}
          />
        </section>

        {!hiddenGroups.includes('format') && (
          <FacetGroup
            title={t('home.formats')}
            id="format-filter-heading"
            defaultOpen={filters.formats.length > 0}
          >
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
          </FacetGroup>
        )}

        {!hiddenGroups.includes('triangle') && (
          <FacetGroup
            title={t('home.lowPolyLevel')}
            id="triangle-filter-heading"
            defaultOpen={Boolean(filters.triangleBand)}
          >
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
          </FacetGroup>
        )}

        {facets.tags.length > 0 && !hiddenGroups.includes('tag') && (
          <FacetGroup
            title={t('home.tags')}
            id="tag-filter-heading"
            defaultOpen={filters.tags.length > 0}
          >
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
          </FacetGroup>
        )}

        {assets.some((a) => a.dimensions_m) && !hiddenGroups.includes('dimension') && (
          <FacetGroup
            title={t('workspace.dimension')}
            id="dimension-filter-heading"
            defaultOpen={Boolean(filters.dimension)}
          >
            {(['under-1m', '1m-plus'] as const).map((value) => {
              const count = assets.filter(
                (a) => a.dimensions_m && Math.max(...a.dimensions_m) < 1 === (value === 'under-1m'),
              ).length;
              return (
                count > 0 && (
                  <FilterOption
                    key={value}
                    id={`dimension-${value}`}
                    label={t(value === 'under-1m' ? 'workspace.under1m' : 'workspace.over1m')}
                    count={count}
                    checked={filters.dimension === value}
                    onChange={(checked) => onExtraChange({ dimension: checked ? value : null })}
                  />
                )
              );
            })}
          </FacetGroup>
        )}
        {hasFilters && (
          <Button variant="ghost" className="clear-filters" type="button" onClick={onClear}>
            {t('home.clearFilters')}
          </Button>
        )}
      </div>
    </aside>
  );
}
