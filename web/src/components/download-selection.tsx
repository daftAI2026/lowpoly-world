/**
 * [INPUT]: 依赖独立下载选择集、公开文件协议与真实 Dataset commit。
 * [OUTPUT]: 导出选择审阅、移除、清单导出、固定版本命令与逐件下载链接。
 * [POS]: 下载工作流唯一会话；不预取大包，不声称浏览器文件已落盘。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CatalogAsset } from '@/lib/catalog';
import { downloadFiles, downloadCommands, readDatasetRevision } from '@/lib/asset-downloads';
import { getAssetDisplayName, type Locale } from '@/lib/locale';
import { CopyButton } from './copy-button';
type Props = {
  assets: CatalogAsset[];
  locale: Locale;
  onRemove: (id: string) => void;
  onClear: () => void;
  onInspect: (id: string) => void;
  onClose: () => void;
};
export function DownloadSelection({
  assets,
  locale,
  onRemove,
  onClear,
  onInspect,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const [revision, setRevision] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [opened, setOpened] = useState<Set<string>>(new Set());
  useEffect(() => {
    const c = new AbortController();
    setError(false);
    setRevision(null);
    void readDatasetRevision(c.signal)
      .then((sha) => {
        if (!c.signal.aborted) setRevision(sha);
      })
      .catch(() => {
        if (!c.signal.aborted) setError(true);
      });
    return () => c.abort();
  }, [attempt]);
  const prepared = useMemo(() => {
    if (!revision) return null;
    try {
      const files = downloadFiles(assets, revision);
      return { files, commands: downloadCommands(files, revision) };
    } catch {
      return null;
    }
  }, [assets, revision]);
  const files = prepared?.files ?? [];
  const urls = files.map((f) => f.url).join('\n');
  const exportManifest = () => {
    if (!revision || !prepared) return;
    const blob = new Blob(
      [JSON.stringify({ dataset: 'daftAI2026/3d-assets', revision, files }, null, 2)],
      { type: 'application/json' },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lowpoly-world-downloads.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <section className="download-selection" aria-label={t('workspace.reviewSelection')}>
      <header>
        <h2>{t('workspace.selectionCount', { count: assets.length })}</h2>
        <Button variant="link" type="button" onClick={onClose}>
          {t('workspace.backResults')}
        </Button>
      </header>
      <div className="selection-actions">
        <Button type="button" variant="link" disabled={!assets.length} onClick={onClear}>
          {t('workspace.clearSelection')}
        </Button>
        {prepared && (
          <>
            <CopyButton value={urls} label={t('workspace.copyFileURLs')} />
            <Button type="button" variant="link" disabled={!files.length} onClick={exportManifest}>
              {t('workspace.exportManifest')}
            </Button>
          </>
        )}
      </div>
      <ul className="selection-items">
        {assets.map((asset) => (
          <li key={asset.id}>
            <Button
              variant="ghost"
              className="selection-name whitespace-normal justify-start"
              type="button"
              onClick={() => onInspect(asset.id)}
            >
              {getAssetDisplayName(asset, locale)} <span>{asset.id}</span>
            </Button>
            <div>
              {files
                .filter((f) => f.id === asset.id)
                .map((f) => (
                  <Button
                    key={f.path}
                    variant="outline"
                    nativeButton={false}
                    render={<a href={f.url + '?download=true'} download />}
                    onClick={() => setOpened((set) => new Set([...set, f.path]))}
                  >
                    {f.format}
                  </Button>
                ))}
              <Button
                type="button"
                variant="link"
                onClick={() => onRemove(asset.id)}
                aria-label={t('workspace.removeAsset', { id: asset.id })}
              >
                {t('workspace.remove')}
              </Button>
            </div>
          </li>
        ))}
      </ul>
      {error || (revision && !prepared) ? (
        <p role="alert">
          {t('workspace.downloadError')}{' '}
          <Button type="button" variant="link" onClick={() => setAttempt((n) => n + 1)}>
            {t('catalog.retry')}
          </Button>
        </p>
      ) : !revision ? (
        <p role="status">{t('workspace.preparingDownloads')}</p>
      ) : null}
      {prepared && files.length > 0 && (
        <Collapsible className="download-commands">
          <CollapsibleTrigger render={<Button variant="ghost" className="justify-start" />}>
            {t('workspace.downloadCommands')}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <p>{t('workspace.commandHelp')}</p>
            <Textarea
              className="font-mono text-xs"
              aria-label={t('workspace.downloadCommands')}
              readOnly
              value={prepared.commands}
              rows={5}
            />
            <CopyButton value={prepared.commands} label={t('workspace.copyCommands')} />
            <p className="download-revision">
              {t('workspace.datasetCommit')}: <code>{revision}</code>
            </p>
          </CollapsibleContent>
        </Collapsible>
      )}
      <p className="download-status" role="status">
        {t('workspace.downloadHandoff', { count: opened.size })}
      </p>
    </section>
  );
}
