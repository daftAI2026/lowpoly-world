/**
 * [INPUT]: 依赖 use-catalog.ts 目录状态、Dataset 身份和 i18next Provider。
 * [OUTPUT]: 导出双语目录加载、空数据与失败状态提示。
 * [POS]: 首页与资产详情页共用状态视图；错误细节保持可展开，不生成示例资产。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { DATASET_REPO_ID } from '@/lib/catalog';
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
          <span className="state-kicker">{t('catalog.loadingEyebrow')}</span>
          <h2>{t('catalog.loadingTitle')}</h2>
          <p role="status">{t('catalog.connecting', { dataset: DATASET_REPO_ID })}</p>
        </div>
      )}

      {state.status === 'empty' && (
        <div className="state-panel">
          <span className="state-kicker">{t('catalog.emptyEyebrow')}</span>
          <h2>{t('catalog.emptyTitle')}</h2>
          <p>{t('catalog.emptyDescription')}</p>
          <a
            className="text-link"
            href={`https://huggingface.co/datasets/${DATASET_REPO_ID}`}
            target="_blank"
            rel="noreferrer"
          >
            {t('catalog.openDataset')} <span aria-hidden="true">↗</span>
          </a>
        </div>
      )}

      {state.status === 'error' && (
        <div className="state-panel state-panel-error" role="alert">
          <span className="state-kicker">{t('catalog.errorEyebrow')}</span>
          <h2>{t('catalog.errorTitle')}</h2>
          <p>{t('catalog.errorDescription')}</p>
          <details className="catalog-error-details">
            <summary>{t('catalog.errorDetails')}</summary>
            <code>{state.message}</code>
          </details>
          <Button className="retry-button" variant="primary" type="button" onClick={onRetry}>
            {t('catalog.retry')}
          </Button>
        </div>
      )}
    </section>
  );
}
