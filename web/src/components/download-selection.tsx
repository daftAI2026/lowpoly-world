/**
 * [INPUT]: 依赖独立下载选择集、公开文件协议与真实 Dataset commit。
 * [OUTPUT]: 导出选择审阅、移除、清单导出、固定版本命令与逐件下载链接。
 * [POS]: 下载工作流唯一会话；不预取大包，不声称浏览器文件已落盘。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
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
        <button className="text-button" type="button" onClick={onClose}>
          {t('workspace.backResults')}
        </button>
      </header>
      <div className="selection-actions">
        <button type="button" className="text-button" disabled={!assets.length} onClick={onClear}>
          {t('workspace.clearSelection')}
        </button>
        {prepared && (
          <>
            <CopyButton value={urls} label={t('workspace.copyFileURLs')} />
            <button
              type="button"
              className="text-button"
              disabled={!files.length}
              onClick={exportManifest}
            >
              {t('workspace.exportManifest')}
            </button>
          </>
        )}
      </div>
      <ul className="selection-items">
        {assets.map((asset) => (
          <li key={asset.id}>
            <button className="selection-name" type="button" onClick={() => onInspect(asset.id)}>
              {getAssetDisplayName(asset, locale)} <span>{asset.id}</span>
            </button>
            <div>
              {files
                .filter((f) => f.id === asset.id)
                .map((f) => (
                  <a
                    key={f.path}
                    href={f.url + '?download=true'}
                    download
                    onClick={() => setOpened((set) => new Set([...set, f.path]))}
                  >
                    {f.format}
                  </a>
                ))}
              <button
                type="button"
                className="text-button"
                onClick={() => onRemove(asset.id)}
                aria-label={t('workspace.removeAsset', { id: asset.id })}
              >
                {t('workspace.remove')}
              </button>
            </div>
          </li>
        ))}
      </ul>
      {error || (revision && !prepared) ? (
        <p role="alert">
          {t('workspace.downloadError')}{' '}
          <button type="button" className="text-button" onClick={() => setAttempt((n) => n + 1)}>
            {t('catalog.retry')}
          </button>
        </p>
      ) : !revision ? (
        <p role="status">{t('workspace.preparingDownloads')}</p>
      ) : null}
      {prepared && files.length > 0 && (
        <details className="download-commands">
          <summary>{t('workspace.downloadCommands')}</summary>
          <p>{t('workspace.commandHelp')}</p>
          <textarea
            aria-label={t('workspace.downloadCommands')}
            readOnly
            value={prepared.commands}
            rows={5}
          />
          <CopyButton value={prepared.commands} label={t('workspace.copyCommands')} />
          <p className="download-revision">
            {t('workspace.datasetCommit')}: <code>{revision}</code>
          </p>
        </details>
      )}
      <p className="download-status" role="status">
        {t('workspace.downloadHandoff', { count: opened.size })}
      </p>
    </section>
  );
}
