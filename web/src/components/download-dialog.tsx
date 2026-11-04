/**
 * [INPUT]: 依赖目录仓库常量、选定资产、真实提交与官方 Dialog 控件。
 * [OUTPUT]: 导出独立下载确认弹窗，提供目录保存与固定版本命令。
 * [POS]: 下载动作确认边界；选定目录后把任务交给持久队列，不在弹窗中执行。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, FolderDown, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { CopyButton } from './copy-button';
import { DATASET_REPO_ID, type CatalogAsset } from '@/lib/catalog';
import { readDatasetRevision, downloadFiles, downloadCommands } from '@/lib/asset-downloads';
import {
  pickDownloadDirectory,
  supportsDirectoryDownload,
  type DownloadDirectory,
} from '@/lib/directory-download';
import { getAssetDisplayName, type Locale } from '@/lib/locale';
type Request = { key: number; assets: CatalogAsset[] };
export function DownloadDialog({
  request,
  locale,
  onClose,
  onStart,
}: {
  request: Request | null;
  locale: Locale;
  onClose: () => void;
  onStart: (assets: CatalogAsset[], revision: string, directory: DownloadDirectory) => void;
}) {
  const { t } = useTranslation();
  return (
    <Dialog
      open={Boolean(request)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="download-confirm" showCloseButton={false}>
        <DialogHeader className="download-dialog-header">
          <DialogTitle>{t('downloads.fromHF')}</DialogTitle>
          <DialogClose
            render={<Button variant="ghost" size="icon" aria-label={t('downloads.close')} />}
          >
            <X aria-hidden="true" />
          </DialogClose>
        </DialogHeader>
        {request && (
          <DownloadOptions
            key={request.key}
            assets={request.assets}
            locale={locale}
            onStart={onStart}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
function DownloadOptions({
  assets,
  locale,
  onStart,
}: {
  assets: CatalogAsset[];
  locale: Locale;
  onStart: (assets: CatalogAsset[], revision: string, directory: DownloadDirectory) => void;
}) {
  const { t } = useTranslation();
  const [revision, setRevision] = useState<string | null>(null),
    [error, setError] = useState(false),
    [attempt, setAttempt] = useState(0);
  const [supported, setSupported] = useState(false),
    [embedded, setEmbedded] = useState(false),
    [picking, setPicking] = useState(false),
    [folderError, setFolderError] = useState(false);
  useEffect(() => {
    setSupported(supportsDirectoryDownload());
    setEmbedded(window.top !== window);
    const controller = new AbortController();
    setError(false);
    setRevision(null);
    void readDatasetRevision(controller.signal)
      .then((sha) => {
        if (!controller.signal.aborted) setRevision(sha);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => controller.abort();
  }, [attempt]);
  const groups = useMemo(() => {
    if (!revision) return null;
    try {
      return assets.map((asset) => ({ asset, files: downloadFiles([asset], revision) }));
    } catch {
      return null;
    }
  }, [assets, revision]);
  const commands =
    groups && revision
      ? downloadCommands(
          groups.flatMap((group) => group.files),
          revision,
        )
      : '';
  const save = () => {
    if (!revision || !groups || picking) return;
    setPicking(true);
    setFolderError(false);
    // ---- 仅用户点击后选择目录，弹窗关闭不拥有后台任务 ----
    void pickDownloadDirectory()
      .then((directory) => onStart(assets, revision, directory))
      .catch((reason) => {
        if (!(reason instanceof DOMException && reason.name === 'AbortError')) setFolderError(true);
      })
      .finally(() => setPicking(false));
  };
  return (
    <div className="download-dialog-body">
      <p className="download-license">
        <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">
          CC BY 4.0
        </a>
      </p>
      {supported ? (
        <>
          <Button disabled={!groups || picking} onClick={save}>
            <FolderDown aria-hidden="true" />
            {t('workspace.saveFolder')}
          </Button>
          <p className="download-hint">{t('downloads.folderHint')}</p>
        </>
      ) : embedded ? (
        <Button
          variant="outline"
          nativeButton={false}
          render={
            <a
              href={typeof window === 'undefined' ? '#' : window.location.href}
              target="_blank"
              rel="noreferrer"
            />
          }
        >
          <ExternalLink aria-hidden="true" />
          {t('downloads.openStandalone')}
        </Button>
      ) : (
        <p className="download-hint">{t('downloads.unsupported')}</p>
      )}
      {folderError && <p role="alert">{t('workspace.folderError')}</p>}
      {error || (revision && !groups) ? (
        <p role="alert">
          {t('workspace.downloadError')}{' '}
          <Button variant="link" onClick={() => setAttempt((n) => n + 1)}>
            {t('catalog.retry')}
          </Button>
        </p>
      ) : !revision ? (
        <p role="status">{t('workspace.preparingDownloads')}</p>
      ) : null}
      {groups && revision && (
        <>
          <div className="download-command-heading">
            <h3>{t('downloads.orCLI')}</h3>
            <CopyButton value={commands} label={t('downloads.copyAll')} />
          </div>
          {groups.map(({ asset, files }) => (
            <section className="download-command" key={asset.id}>
              <header>
                <span>
                  {getAssetDisplayName(asset, locale)} <code>{asset.id}</code>
                </span>
                <CopyButton value={downloadCommands(files, revision)} label={t('downloads.copy')} />
              </header>
              <Textarea
                readOnly
                rows={3}
                aria-label={t('downloads.commandFor', { id: asset.id })}
                value={downloadCommands(files, revision)}
                className="font-mono text-xs"
              />
              <Button
                variant="link"
                nativeButton={false}
                render={
                  <a
                    href={`https://huggingface.co/datasets/${DATASET_REPO_ID}/tree/${revision}/${files[0]?.path.split('/').slice(0, -1).join('/') ?? ''}`}
                    target="_blank"
                    rel="noreferrer"
                  />
                }
              >
                {t('downloads.openHF')}
                <ExternalLink aria-hidden="true" />
              </Button>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
