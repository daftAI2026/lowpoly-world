/**
 * [INPUT]: 依赖持久下载队列快照、locale与官方Popover、Progress、Button。
 * [OUTPUT]: 导出独立任务入口与进行中、完成、失败状态面板。
 * [POS]: 下载执行的观察视图；关闭面板不取消，只有明确取消动作才停止。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Download, X, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle } from './ui/popover';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { getAssetDisplayName, type Locale } from '@/lib/locale';
import type { DownloadJob, DownloadQueue } from '@/lib/download-queue';
export function DownloadTasks({
  jobs,
  queue,
  active,
  locale,
  open,
  onOpenChange,
}: {
  jobs: readonly DownloadJob[];
  queue: DownloadQueue;
  active: number;
  locale: Locale;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const done = jobs.filter((job) => job.status === 'complete').length,
    failed = jobs.filter((job) => job.status === 'failed').length;
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={t('downloads.tasks')}
            title={t('downloads.tasks')}
          />
        }
      >
        <Download aria-hidden="true" />
        {active > 0 && <span className="download-task-badge">{active}</span>}
      </PopoverTrigger>
      <PopoverContent align="end" className="download-task-panel">
        <header className="download-panel-header">
          <PopoverTitle>{t('downloads.tasks')}</PopoverTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            aria-label={t('downloads.close')}
          >
            <X aria-hidden="true" />
          </Button>
        </header>
        <div className="download-task-summary">
          <span>{t('downloads.summary', { active, done, failed })}</span>
          {active > 0 && (
            <Button variant="link" onClick={() => queue.cancelAll()}>
              {t('downloads.cancelAll')}
            </Button>
          )}
        </div>
        {!jobs.length ? (
          <p className="download-hint">{t('downloads.empty')}</p>
        ) : (
          <ul className="download-task-list">
            {open &&
              jobs.map((job) => {
                const running = job.status === 'active' || job.status === 'queued';
                const fraction = job.total ? Math.min(1, (job.loaded ?? 0) / job.total) : 0;
                const percent = Math.min(
                  100,
                  ((job.completed.length + (job.current ? fraction : 0)) / job.files.length) * 100,
                );
                return (
                  <li key={job.key} data-task-status={job.status}>
                    <header>
                      <span>
                        {getAssetDisplayName(job.asset, locale)} <code>{job.asset.id}</code>
                      </span>
                      <span>{t(`downloads.${job.status}`)}</span>
                    </header>
                    {running && (
                      <Progress
                        value={percent}
                        aria-label={t('downloads.progressFor', { id: job.asset.id })}
                      />
                    )}
                    <footer>
                      <span>
                        {job.completed.length}/{job.files.length}
                      </span>
                      <div>
                        {running ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={t('downloads.cancelFor', { id: job.asset.id })}
                            onClick={() => queue.cancel(job.key)}
                          >
                            <X aria-hidden="true" />
                          </Button>
                        ) : (
                          <>
                            {job.status !== 'complete' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={t('downloads.retryFor', { id: job.asset.id })}
                                onClick={() => void queue.retry(job.key)}
                              >
                                <RotateCcw aria-hidden="true" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={t('downloads.removeFor', { id: job.asset.id })}
                              onClick={() => queue.remove(job.key)}
                            >
                              <X aria-hidden="true" />
                            </Button>
                          </>
                        )}
                      </div>
                    </footer>
                    {job.failed.length > 0 && (
                      <ul className="download-failures">
                        {job.failed.map((path) => (
                          <li key={path}>
                            <code>{path}</code>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
          </ul>
        )}
        {jobs.some((job) => job.status !== 'active' && job.status !== 'queued') && (
          <Button variant="link" onClick={() => queue.clearFinished()}>
            {t('downloads.clearFinished')}
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
