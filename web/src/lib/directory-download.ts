/**
 * [INPUT]: 依赖目录仓库身份、固定版本文件、用户选定目录与流式写入。
 * [OUTPUT]: 提供能力检测、目录选择与可取消的顺序文件下载。
 * [POS]: 下载执行边界；不上传、不缓存完整模型，不申请后台目录权限。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import type { DownloadFile } from './asset-downloads';
import { DATASET_REPO_ID } from './catalog';
type FileHandle = { createWritable(): Promise<WritableStream<Uint8Array>> };
export type DownloadDirectory = {
  getDirectoryHandle(name: string, options: { create: true }): Promise<DownloadDirectory>;
  getFileHandle(name: string, options: { create: true }): Promise<FileHandle>;
};
type PickerWindow = Window & {
  showDirectoryPicker?: (options: { mode: 'readwrite' }) => Promise<DownloadDirectory>;
};
export type DirectoryProgress = { completed: string[]; failed: string[]; cancelled: boolean };
export function supportsDirectoryDownload(): boolean {
  return typeof window !== 'undefined' && Boolean((window as PickerWindow).showDirectoryPicker);
}
export async function pickDownloadDirectory(): Promise<DownloadDirectory> {
  const picker = (window as PickerWindow).showDirectoryPicker;
  if (!picker) throw new Error('Directory downloads are unavailable.');
  return picker.call(window, { mode: 'readwrite' });
}
export async function downloadToDirectory(
  files: readonly DownloadFile[],
  revision: string,
  directory: DownloadDirectory,
  signal: AbortSignal,
  onProgress: (progress: DirectoryProgress) => void,
  request: typeof fetch = fetch,
): Promise<DirectoryProgress> {
  if (!/^[a-f0-9]{40}$/.test(revision)) throw new Error('A Dataset commit is required.');
  // ---- 固定版本分目录，不覆盖另一版本；先校验整批，再执行写入 ----
  for (const file of files) {
    const url = new URL(file.url);
    if (
      url.origin !== 'https://huggingface.co' ||
      Boolean(url.username || url.password || url.search || url.hash) ||
      url.pathname !== `/datasets/${DATASET_REPO_ID}/resolve/${revision}/${file.path}` ||
      !/^[a-zA-Z0-9_./-]+$/.test(file.path) ||
      file.path.split('/').some((part) => !part || part === '.' || part === '..')
    )
      throw new Error('Invalid fixed-version file.');
  }
  const result: DirectoryProgress = { completed: [], failed: [], cancelled: false };
  const publish = () =>
    onProgress({ ...result, completed: [...result.completed], failed: [...result.failed] });
  if (signal.aborted) {
    result.cancelled = true;
    publish();
    return result;
  }
  const target = await directory.getDirectoryHandle(`lowpoly-world-${revision}`, { create: true });
  for (const file of files) {
    if (signal.aborted) {
      result.cancelled = true;
      break;
    }
    try {
      const response = await request(file.url, { signal, credentials: 'omit' });
      if (!response.ok || !response.body) throw new Error(`File HTTP ${response.status}`);
      let folder = target;
      const parts = file.path.split('/');
      for (const part of parts.slice(0, -1)) {
        folder = await folder.getDirectoryHandle(part, { create: true });
      }
      const handle = await folder.getFileHandle(parts.at(-1)!, { create: true });
      const writable = await handle.createWritable();
      // pipeTo 关闭写入后才记完成；中止或错误会回滚未提交的文件流。
      await response.body.pipeTo(writable, { signal });
      result.completed.push(file.path);
    } catch {
      if (signal.aborted) {
        result.cancelled = true;
        break;
      }
      result.failed.push(file.path);
    }
    publish();
  }
  publish();
  return result;
}
