/**
 * [INPUT]: 依赖 URL 浏览状态、真实分类、筛选修改与选择集动作。
 * [OUTPUT]: 导出搜索、面包屑、可移除条件、视图密度与偏好控制。
 * [POS]: 工作区工具栏；只发状态变更，不加载目录或模型。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { WorkspaceState } from '@/lib/workspace-state';
import { emptyFilters } from '@/lib/workspace-state';
import { hasCatalogFilters, isCatalogSort, type CatalogFilters } from '@/lib/catalog-view';
import { Input } from './ui/input';
type Props = {
  state: WorkspaceState;
  update: (s: Partial<WorkspaceState>, replace?: boolean) => void;
  visible: number;
  total: number;
  selectedCount: number;
  onSelectResults: () => void;
  onReview: () => void;
  hiddenGroups: string[];
  onHiddenGroups: (groups: string[]) => void;
  onReopen: (() => void) | null;
};
export function WorkspaceToolbar({
  state: s,
  update,
  visible,
  total,
  selectedCount,
  onSelectResults,
  onReview,
  hiddenGroups,
  onHiddenGroups,
  onReopen,
}: Props) {
  const { t } = useTranslation();
  const f = s.filters;
  const filter = (patch: Partial<CatalogFilters>, replace = false) =>
    update({ filters: { ...f, ...patch } }, replace);
  const parts = f.categoryPath?.split('/') ?? [];
  const chips: { key: string; label: string; clear: () => void }[] = [];
  if (f.query) chips.push({ key: 'q', label: f.query, clear: () => filter({ query: '' }) });
  for (const format of f.formats)
    chips.push({
      key: format,
      label: format.toUpperCase(),
      clear: () => filter({ formats: f.formats.filter((v) => v !== format) }),
    });
  for (const tag of f.tags)
    chips.push({
      key: 'tag-' + tag,
      label: tag,
      clear: () => filter({ tags: f.tags.filter((v) => v !== tag) }),
    });
  if (f.triangleBand)
    chips.push({
      key: 'triangles',
      label: t(
        f.triangleBand === 'under-5k'
          ? 'home.triangleBandMinimal'
          : f.triangleBand === '5k-to-25k'
            ? 'home.triangleBandLight'
            : 'home.triangleBandDense',
      ),
      clear: () => filter({ triangleBand: null }),
    });
  for (const key of ['license', 'source'] as const)
    if (f[key]) chips.push({ key, label: f[key], clear: () => filter({ [key]: null }) });
  if (f.dimension)
    chips.push({
      key: 'dimension',
      label: t(f.dimension === 'under-1m' ? 'workspace.under1m' : 'workspace.over1m'),
      clear: () => filter({ dimension: null }),
    });
  if (f.withPreview)
    chips.push({
      key: 'preview',
      label: t('workspace.onlyPreviews'),
      clear: () => filter({ withPreview: false }),
    });
  return (
    <div className="workspace-toolbar">
      <nav className="asset-breadcrumb" aria-label={t('workspace.allAssets')}>
        <button type="button" onClick={() => update({ filters: { ...emptyFilters } })}>
          {t('workspace.allAssets')}
        </button>
        {parts.map((part, index) => (
          <span key={index}>
            <span aria-hidden="true">/</span>
            <button
              type="button"
              aria-current={index === parts.length - 1 ? 'page' : undefined}
              onClick={() => filter({ categoryPath: parts.slice(0, index + 1).join('/') })}
            >
              {part === 'Uncategorized' ? t('home.uncategorized') : part}
            </button>
          </span>
        ))}
      </nav>
      <div className="catalog-toolbar">
        <label className="catalog-search">
          <span className="visually-hidden">{t('home.searchLabel')}</span>
          <Search aria-hidden="true" />
          <Input
            type="search"
            value={f.query}
            placeholder={t('home.searchPlaceholder')}
            onChange={(e) => filter({ query: e.currentTarget.value }, true)}
          />
        </label>
        <label className="sort-control">
          <span>{t('home.sortLabel')}</span>
          <select
            value={s.sort}
            onChange={(e) => {
              if (isCatalogSort(e.currentTarget.value)) update({ sort: e.currentTarget.value });
            }}
          >
            <option value="id-asc">{t('home.sortId')}</option>
            <option value="name-asc">{t('home.sortName')}</option>
            <option value="triangles-asc">{t('home.sortTriangles')}</option>
            <option value="triangles-desc">{t('home.sortTrianglesDesc')}</option>
          </select>
        </label>
        <p className="catalog-result-count" aria-live="polite">
          {t('home.resultCount', { visible, total })}
        </p>
      </div>
      <div className="workspace-controls">
        <div className="view-controls" role="group" aria-label={t('home.assetResults')}>
          {(['grid', 'list'] as const).map((view) => (
            <button
              key={view}
              type="button"
              aria-pressed={s.view === view}
              onClick={() => update({ view })}
            >
              {t(`workspace.${view}`)}
            </button>
          ))}
        </div>
        <label className="density-control">
          {t('workspace.density')}
          <select
            value={s.density}
            disabled={s.view === 'list'}
            onChange={(e) =>
              update({ density: e.currentTarget.value as WorkspaceState['density'] })
            }
          >
            {(['small', 'medium', 'large'] as const).map((d) => (
              <option value={d} key={d}>
                {t(`workspace.${d}`)}
              </option>
            ))}
          </select>
        </label>
        <details className="workspace-preferences">
          <summary>{t('workspace.preferences')}</summary>
          <div>
            <label>
              <input
                type="checkbox"
                checked={Boolean(f.withPreview)}
                onChange={(e) => filter({ withPreview: e.currentTarget.checked })}
              />
              {t('workspace.onlyPreviews')}
            </label>
            <fieldset>
              <legend>{t('workspace.filterGroups')}</legend>
              {(['format', 'triangle', 'tag', 'license', 'source', 'dimension'] as const).map(
                (group) => (
                  <label key={group}>
                    <input
                      type="checkbox"
                      checked={!hiddenGroups.includes(group)}
                      onChange={(e) =>
                        onHiddenGroups(
                          e.currentTarget.checked
                            ? hiddenGroups.filter((g) => g !== group)
                            : [...hiddenGroups, group],
                        )
                      }
                    />
                    {t(
                      group === 'format'
                        ? 'home.formats'
                        : group === 'triangle'
                          ? 'home.lowPolyLevel'
                          : group === 'tag'
                            ? 'home.tags'
                            : `workspace.${group}`,
                    )}
                  </label>
                ),
              )}
            </fieldset>
          </div>
        </details>
        <button type="button" className="text-button" disabled={!visible} onClick={onSelectResults}>
          {t('workspace.selectResults', { count: visible })}
        </button>
        <button type="button" className="text-button" onClick={onReview}>
          {t('workspace.reviewSelection')} ({selectedCount})
        </button>
        {onReopen && (
          <button type="button" className="text-button" onClick={onReopen}>
            {t('workspace.reopenPreview')}
          </button>
        )}
      </div>
      {(chips.length > 0 || f.categoryPath) && (
        <div className="filter-chips">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              aria-label={t('workspace.removeFilter', { label: chip.label })}
              onClick={chip.clear}
            >
              {chip.label}
              <span aria-hidden="true">×</span>
            </button>
          ))}
          {hasCatalogFilters(f) && (
            <button
              type="button"
              className="text-button"
              onClick={() =>
                filter({
                  ...emptyFilters,
                  license: null,
                  source: null,
                  dimension: null,
                  withPreview: false,
                })
              }
            >
              {t('home.clearFilters')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
