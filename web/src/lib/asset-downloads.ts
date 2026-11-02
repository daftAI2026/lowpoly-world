/**
 * [INPUT]: 依赖已校验的公开资产 URL 与明确的 Dataset commit。
 * [OUTPUT]: 导出文件清单、固定版本 URL 和 HF CLI 命令。
 * [POS]: 下载纯协议；不请求模型，不把资产版本或源 SHA 当 HF commit。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { DATASET_REPO_ID, requireDatasetUrl, type CatalogAsset } from './catalog';
export type DownloadFile = { id: string; format: 'GLB' | 'BLEND'; path: string; url: string };
export function downloadFiles(assets: readonly CatalogAsset[], revision: string): DownloadFile[] {
  if (!/^[a-f0-9]{40}$/.test(revision)) throw new Error('A Dataset commit is required.');
  return assets.flatMap((asset) =>
    (
      [
        ['GLB', asset.glb_url],
        ['BLEND', asset.blend_url],
      ] as const
    )
      .filter((entry): entry is readonly ['GLB' | 'BLEND', string] => Boolean(entry[1]))
      .map(([format, value]) => {
        const url = new URL(requireDatasetUrl(value, format));
        const prefix = `/datasets/${DATASET_REPO_ID}/resolve/main/`;
        const path = decodeURIComponent(url.pathname.slice(prefix.length));
        // ---- URL 校验之外再收紧 CLI 路径，拒绝 glob 与 shell 注入 ----
        if (
          !/^[a-zA-Z0-9_./-]+$/.test(path) ||
          path.split('/').some((p) => p === '..' || p === '.')
        ) {
          throw new Error('Unsupported download path.');
        }
        url.pathname = `/datasets/${DATASET_REPO_ID}/resolve/${revision}/${path}`;
        url.search = '';
        return { id: asset.id, format, path, url: url.href };
      }),
  );
}
export function downloadCommands(files: readonly DownloadFile[], revision: string): string {
  if (!/^[a-f0-9]{40}$/.test(revision)) throw new Error('A Dataset commit is required.');
  return files
    .map(
      (f) =>
        `hf download ${DATASET_REPO_ID} '${f.path}' --repo-type dataset --revision ${revision} --local-dir lowpoly-world-assets`,
    )
    .join('\n');
}
export async function readDatasetRevision(signal: AbortSignal): Promise<string> {
  const response = await fetch(
    `https://huggingface.co/api/datasets/${DATASET_REPO_ID}/revision/main`,
    { signal },
  );
  if (!response.ok) throw new Error(`Dataset revision HTTP ${response.status}`);
  const result: unknown = await response.json();
  const sha = typeof result === 'object' && result !== null && 'sha' in result ? result.sha : null;
  if (typeof sha !== 'string' || !/^[a-f0-9]{40}$/.test(sha))
    throw new Error('Invalid Dataset commit.');
  return sha;
}
