/**
 * [INPUT]: 依赖独立下载选择集、官方Popover与持久下载队列。
 * [OUTPUT]: 导出选择计数、锚定审阅、下载确认和独立任务入口。
 * [POS]: 下载流程组合边界；选择、确认与执行分层，弹层不改变结果排版。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckSquare, ChevronDown, Download, X } from 'lucide-react';
import { Button } from './ui/button';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { CopyButton } from './copy-button';
import { DownloadDialog } from './download-dialog';
import { DownloadTasks } from './download-tasks';
import { useDownloadQueue } from '@/lib/use-download-queue';
import type { CatalogAsset } from '@/lib/catalog';
import { getAssetDisplayName, type Locale } from '@/lib/locale';
export function DownloadSelection({
  assets,
  locale,
  onRemove,
  onClear,
  onInspect,
}: {
  assets: CatalogAsset[];
  locale: Locale;
  onRemove: (id: string) => void;
  onClear: () => void;
  onInspect: (id: string) => void;
}) {
  const { t } = useTranslation();
  const [review, setReview] = useState(false),
    [tasksOpen, setTasksOpen] = useState(false);
  const [request, setRequest] = useState<{ key: number; assets: CatalogAsset[] } | null>(null);
  const serial = useRef(0),
    confirming = useRef(false);
  const { jobs, queue, active } = useDownloadQueue();
  const ask = (selection: CatalogAsset[]) => {
    confirming.current = true;
    setRequest({ key: ++serial.current, assets: [...selection] });
  };
  const closeDialog = () => {
    confirming.current = false;
    setRequest(null);
  };
  const urls = assets
    .flatMap((asset) => [asset.glb_url, asset.blend_url])
    .filter(Boolean)
    .join('\n');
  return (
    <>
      {assets.length > 0 && (
        <div className="selection-controls">
          <Popover
            open={review}
            onOpenChange={(open) => {
              if (!confirming.current) setReview(open);
            }}
          >
            <PopoverTrigger
              render={<Button variant="secondary" aria-label={t('workspace.reviewSelection')} />}
            >
              <CheckSquare aria-hidden="true" />
              {t('downloads.selected', { count: assets.length })}
              <ChevronDown aria-hidden="true" />
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="selection-review"
              aria-label={t('workspace.reviewSelection')}
            >
              <header className="download-panel-header">
                <Button variant="link" onClick={onClear}>
                  {t('workspace.clearSelection')}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t('downloads.close')}
                  onClick={() => setReview(false)}
                >
                  <X aria-hidden="true" />
                </Button>
              </header>
              <ul className="selection-review-list">
                {review &&
                  assets.map((asset) => (
                    <li key={asset.id}>
                      <Button
                        variant="ghost"
                        className="selection-review-asset"
                        onClick={() => {
                          setReview(false);
                          onInspect(asset.id);
                        }}
                      >
                        {asset.preview_url && <img src={asset.preview_url} alt="" loading="lazy" />}
                        <span>
                          {getAssetDisplayName(asset, locale)} <code>{asset.id}</code>
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t('downloads.downloadFor', { id: asset.id })}
                        onClick={() => ask([asset])}
                      >
                        <Download aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t('workspace.removeAsset', { id: asset.id })}
                        onClick={() => onRemove(asset.id)}
                      >
                        <X aria-hidden="true" />
                      </Button>
                    </li>
                  ))}
              </ul>
              <footer className="selection-review-footer">
                <span>{t('downloads.assetCount', { count: assets.length })}</span>
                <CopyButton value={urls} label={t('downloads.copyURLs')} />
                <Button onClick={() => ask(assets)}>
                  <Download aria-hidden="true" />
                  {t('downloads.downloadCount', { count: assets.length })}
                </Button>
              </footer>
            </PopoverContent>
          </Popover>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('workspace.clearSelection')}
            onClick={onClear}
          >
            <X aria-hidden="true" />
          </Button>
        </div>
      )}
      <DownloadTasks
        jobs={jobs}
        queue={queue}
        active={active}
        locale={locale}
        open={tasksOpen}
        onOpenChange={setTasksOpen}
      />
      <DownloadDialog
        request={request}
        locale={locale}
        onClose={closeDialog}
        onStart={(selected, revision, directory) => {
          closeDialog();
          setReview(false);
          setTasksOpen(true);
          void queue.enqueue(selected, revision, directory);
        }}
      />
    </>
  );
}
