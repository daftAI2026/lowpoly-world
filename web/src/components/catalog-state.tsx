/**
 * [INPUT]: 依赖目录状态、i18next 与官方 shadcn Button/Collapsible。
 * [OUTPUT]: 导出双语目录加载、空目录与验证失败提示。
 * [POS]: 首页与资产详情页共用状态视图；失败细节可展开，空目录不重复提供数据集入口。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import type { CatalogState } from '@/lib/use-catalog';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

type CatalogStateViewProps = {
  state: CatalogState;
  onRetry: () => void;
};

export function CatalogStateView({ state, onRetry }: CatalogStateViewProps) {
  const { t } = useTranslation();
  if (state.status === 'ready') return null;

  return (
    <section className="catalog-state" aria-live="polite">
      {state.status === 'loading' && (
        <div className="state-panel">
          <p className="state-loading" role="status">
            {t('catalog.loading')}
          </p>
        </div>
      )}

      {state.status === 'empty' && (
        <div className="state-panel">
          <h2>{t('catalog.emptyTitle')}</h2>
        </div>
      )}

      {state.status === 'error' && (
        <div className="state-panel state-panel-error" role="alert">
          <h2>{t('catalog.errorTitle')}</h2>
          <p>{t('catalog.errorDescription')}</p>
          <Collapsible className="catalog-error-details">
            <CollapsibleTrigger render={<Button variant="ghost" className="justify-start" />}>
              {t('catalog.errorDetails')}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <code>{state.message}</code>
            </CollapsibleContent>
          </Collapsible>
          <Button className="retry-button" variant="default" type="button" onClick={onRetry}>
            {t('catalog.retry')}
          </Button>
        </div>
      )}
    </section>
  );
}
