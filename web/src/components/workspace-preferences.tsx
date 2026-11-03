/**
 * [INPUT]: 依赖工作区筛选可见性、预览条件与官方 shadcn Popover。
 * [OUTPUT]: 导出 WorkspacePreferences，集中展示偏好而不占用结果工具带。
 * [POS]: FU 全局动作区的业务组合；不持有目录或下载任务。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useTranslation } from 'react-i18next';
import { Settings2 } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
export function WorkspacePreferences({
  withPreview,
  onWithPreview,
  hiddenGroups,
  onHiddenGroups,
}: {
  withPreview: boolean;
  onWithPreview: (value: boolean) => void;
  hiddenGroups: string[];
  onHiddenGroups: (groups: string[]) => void;
}) {
  const { t } = useTranslation();
  return (
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
            checked={withPreview}
            onCheckedChange={(checked) => onWithPreview(checked === true)}
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
  );
}
