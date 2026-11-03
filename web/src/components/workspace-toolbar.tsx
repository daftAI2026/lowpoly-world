/**
 * [INPUT]: 依赖 URL 状态、真实分类与官方 shadcn 表单、弹层和导航。
 * [OUTPUT]: 导出单行结果工具栏、图标视图与三档密度选择。
 * [POS]: 工作区工具栏；只发状态变更，不加载目录或模型。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Label } from '@/components/ui/label';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Button } from '@/components/ui/button';
import { Fragment, type ReactNode } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { normalizeCategoryPath, categoryLabel } from '@/lib/category-taxonomy.ts';
import { Grid2X2, List, Square, Settings2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { WorkspaceState } from '@/lib/workspace-state';
import { emptyFilters } from '@/lib/workspace-state';
import { hasCatalogFilters, isCatalogSort, type CatalogFilters } from '@/lib/catalog-view';
type Props = {
  state: WorkspaceState;
  update: (s: Partial<WorkspaceState>, replace?: boolean) => void;
  visible: number;
  total: number;
  onSelectResults: () => void;
  onDeselectResults: () => void;
  allResultsSelected: boolean;
  someResultsSelected: boolean;
  downloadControls: ReactNode;
  hiddenGroups: string[];
  onHiddenGroups: (groups: string[]) => void;
  onReopen: (() => void) | null;
};
export function WorkspaceToolbar({
  state: s,
  update,
  visible,
  total,
  onSelectResults,
  onDeselectResults,
  allResultsSelected,
  someResultsSelected,
  downloadControls,
  hiddenGroups,
  onHiddenGroups,
  onReopen,
}: Props) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === 'zh' ? 'zh' : 'en';
  const f = s.filters;
  const filter = (patch: Partial<CatalogFilters>, replace = false) =>
    update({ filters: { ...f, ...patch } }, replace);
  const parts = normalizeCategoryPath(f.categoryPath)?.split('/') ?? [];
  const chips: { key: string; label: string; clear: () => void }[] = [];
  if (f.query)
    chips.push({
      key: 'q',
      label: f.query,
      clear: () => filter({ query: '' }),
    });
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
      <div className="workspace-controls">
        <div className="workspace-summary">
          <p className="catalog-result-count" aria-live="polite">
            {t('home.resultCount', { visible, total })}
          </p>
          <Label
            className="result-selection-toggle"
            title={t('workspace.selectResults', { count: visible })}
          >
            <Checkbox
              checked={allResultsSelected}
              indeterminate={!allResultsSelected && someResultsSelected}
              disabled={!visible}
              aria-label={t('workspace.selectResults', { count: visible })}
              onCheckedChange={(checked) => (checked ? onSelectResults() : onDeselectResults())}
            />
          </Label>
        </div>
        <div className="workspace-view-actions">
          {downloadControls}
          <div className="view-options">
            <ToggleGroup
              className="view-controls"
              variant="default"
              spacing={1}
              value={[s.view]}
              onValueChange={(values) => {
                const view = values[0];
                if (view === 'grid' || view === 'list') update({ view });
              }}
              aria-label={t('workspace.view')}
            >
              {(['grid', 'list'] as const).map((view) => (
                <ToggleGroupItem
                  key={view}
                  value={view}
                  className="size-10 rounded-md p-0"
                  aria-label={t(`workspace.${view}`)}
                  title={t(`workspace.${view}`)}
                >
                  {view === 'grid' ? <Grid2X2 aria-hidden="true" /> : <List aria-hidden="true" />}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <ToggleGroup
              className="density-controls"
              variant="default"
              spacing={1}
              disabled={s.view === 'list'}
              value={[s.density]}
              onValueChange={(values) => {
                const density = values[0];
                if (density === 'small' || density === 'medium' || density === 'large')
                  update({ density });
              }}
              aria-label={t('workspace.density')}
            >
              {(['small', 'medium', 'large'] as const).map((density) => (
                <ToggleGroupItem
                  key={density}
                  value={density}
                  className="size-10 rounded-md p-0"
                  aria-label={t(`workspace.${density}`)}
                  title={`${t('workspace.density')}: ${t(`workspace.${density}`)}`}
                >
                  <Square
                    aria-hidden="true"
                    className={
                      density === 'small'
                        ? 'size-2.5'
                        : density === 'medium'
                          ? 'size-3.5'
                          : 'size-4.5'
                    }
                  />
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t('workspace.preferences')}
                  title={t('workspace.preferences')}
                />
              }
            >
              <Settings2 aria-hidden="true" />
            </PopoverTrigger>
            <PopoverContent align="start" className="workspace-preferences-content">
              <Label>
                <Checkbox
                  checked={Boolean(f.withPreview)}
                  onCheckedChange={(checked) => filter({ withPreview: checked === true })}
                />
                {t('workspace.onlyPreviews')}
              </Label>
              <fieldset>
                <legend>{t('workspace.filterGroups')}</legend>
                {(['format', 'triangle', 'tag', 'dimension'] as const).map((group) => (
                  <Label key={group}>
                    <Checkbox
                      checked={!hiddenGroups.includes(group)}
                      onCheckedChange={(checked) =>
                        onHiddenGroups(
                          checked === true
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
                  </Label>
                ))}
              </fieldset>
            </PopoverContent>
          </Popover>
          <Label className="sort-control">
            <span>{t('home.sortLabel')}</span>
            <NativeSelect
              value={s.sort}
              onChange={(e) => {
                if (isCatalogSort(e.currentTarget.value)) update({ sort: e.currentTarget.value });
              }}
            >
              <NativeSelectOption value="id-asc">{t('home.sortId')}</NativeSelectOption>
              <NativeSelectOption value="name-asc">{t('home.sortName')}</NativeSelectOption>
              <NativeSelectOption value="triangles-asc">
                {t('home.sortTriangles')}
              </NativeSelectOption>
              <NativeSelectOption value="triangles-desc">
                {t('home.sortTrianglesDesc')}
              </NativeSelectOption>
            </NativeSelect>
          </Label>
          {onReopen && (
            <Button type="button" variant="link" onClick={onReopen}>
              {t('workspace.reopenPreview')}
            </Button>
          )}
        </div>
      </div>
      {(chips.length > 0 || f.categoryPath) && (
        <div className="filter-chips">
          {f.categoryPath && (
            <Breadcrumb className="asset-breadcrumb" aria-label={t('workspace.allAssets')}>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    render={
                      <Button
                        variant="link"
                        onClick={() => update({ filters: { ...emptyFilters } })}
                      />
                    }
                  >
                    {t('workspace.allAssets')}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {parts.map((part, index) => (
                  <Fragment key={index}>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {index === parts.length - 1 ? (
                        <BreadcrumbPage>
                          {categoryLabel(parts.slice(0, index + 1).join('/'), locale)}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink
                          render={
                            <Button
                              variant="link"
                              onClick={() =>
                                filter({
                                  categoryPath: parts.slice(0, index + 1).join('/'),
                                })
                              }
                            />
                          }
                        >
                          {categoryLabel(parts.slice(0, index + 1).join('/'), locale)}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          )}
          {chips.map((chip) => (
            <Button
              variant="ghost"
              key={chip.key}
              type="button"
              aria-label={t('workspace.removeFilter', { label: chip.label })}
              onClick={chip.clear}
            >
              {chip.label}
              <span aria-hidden="true">×</span>
            </Button>
          ))}
          {hasCatalogFilters(f) && (
            <Button
              type="button"
              variant="link"
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
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
