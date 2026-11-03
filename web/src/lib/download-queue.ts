/**
 * [INPUT]: 依赖固定版本文件协议、用户目录和可替换的流式下载执行器。
 * [OUTPUT]: 导出按资产分组的任务队列，支持进度、取消、失败重试与清理。
 * [POS]: 下载任务的生命周期边界；弹层订阅状态，不拥有任务，也不因关闭而中断。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import type { CatalogAsset } from './catalog';
import { downloadFiles, type DownloadFile } from './asset-downloads';
import {
  downloadToDirectory,
  type DownloadDirectory,
  type DirectoryProgress,
} from './directory-download';
export type DownloadJob = {
  key: string;
  asset: CatalogAsset;
  revision: string;
  files: DownloadFile[];
  status: 'queued' | 'active' | 'complete' | 'failed' | 'cancelled';
  completed: string[];
  failed: string[];
  current?: string;
  loaded?: number;
  total?: number;
};
type Task = {
  job: DownloadJob;
  directory: DownloadDirectory;
  controller: AbortController;
  generation: number;
};
const busy = (job: DownloadJob) => job.status === 'queued' || job.status === 'active';
export function createDownloadQueue(execute: typeof downloadToDirectory = downloadToDirectory) {
  let jobs: DownloadJob[] = [],
    sequence = 0;
  const tasks = new Map<string, Task>(),
    listeners = new Set<() => void>();
  const emit = () => {
    jobs = [...jobs];
    listeners.forEach((listener) => listener());
  };
  const patch = (task: Task, value: Partial<DownloadJob>) => {
    task.job = { ...task.job, ...value };
    jobs = jobs.map((job) => (job.key === task.job.key ? task.job : job));
    emit();
  };
  async function run(task: Task, generation = task.generation) {
    if (generation !== task.generation) return;
    if (task.controller.signal.aborted) {
      patch(task, { status: 'cancelled' });
      return;
    }
    const previous = task.job.completed;
    const remaining = task.job.files.filter((file) => !previous.includes(file.path));
    patch(task, { status: 'active', failed: [], current: undefined, loaded: 0, total: undefined });
    let lastUpdate = 0;
    const progress = (value: DirectoryProgress) => {
      const now = Date.now();
      if (value.current && now - lastUpdate < 100) return;
      lastUpdate = now;
      patch(task, {
        completed: [...previous, ...value.completed],
        failed: value.failed,
        current: value.current,
        loaded: value.loaded,
        total: value.total,
      });
    };
    try {
      const result = await execute(
        remaining,
        task.job.revision,
        task.directory,
        task.controller.signal,
        progress,
      );
      patch(task, {
        completed: [...previous, ...result.completed],
        failed: result.failed,
        status: result.cancelled ? 'cancelled' : result.failed.length ? 'failed' : 'complete',
        current: undefined,
      });
    } catch {
      patch(task, {
        status: task.controller.signal.aborted ? 'cancelled' : 'failed',
        failed: remaining
          .filter((file) => !task.job.completed.includes(file.path))
          .map((file) => file.path),
        current: undefined,
      });
    }
  }
  return {
    getSnapshot: () => jobs,
    subscribe(this: void, listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    async enqueue(assets: readonly CatalogAsset[], revision: string, directory: DownloadDirectory) {
      // ---- 先验证整批文件，再创建任务；同一次批量顺序执行，避免千条并发请求 ----
      const prepared = assets.map((asset) => ({ asset, files: downloadFiles([asset], revision) }));
      const added: Task[] = [];
      for (const { asset, files } of prepared) {
        if (
          !files.length ||
          jobs.some((job) => busy(job) && job.asset.id === asset.id && job.revision === revision)
        )
          continue;
        const job: DownloadJob = {
          key: `${asset.id}-${++sequence}`,
          asset,
          revision,
          files,
          status: 'queued',
          completed: [],
          failed: [],
        };
        const task = { job, directory, controller: new AbortController(), generation: 0 };
        tasks.set(job.key, task);
        added.push(task);
        jobs = [...jobs, job];
      }
      emit();
      for (const task of added) await run(task, 0);
    },
    cancel(key: string) {
      const task = tasks.get(key);
      if (!task || !busy(task.job)) return;
      task.controller.abort();
      if (task.job.status === 'queued') patch(task, { status: 'cancelled' });
    },
    cancelAll() {
      for (const task of tasks.values())
        if (busy(task.job)) {
          task.controller.abort();
          if (task.job.status === 'queued') {
            task.job = { ...task.job, status: 'cancelled' };
            jobs = jobs.map((job) => (job.key === task.job.key ? task.job : job));
          }
        }
      emit();
    },
    async retry(key: string) {
      const task = tasks.get(key);
      if (!task || busy(task.job)) return;
      task.generation++;
      task.controller = new AbortController();
      await run(task);
    },
    remove(key: string) {
      if (jobs.some((job) => job.key === key && busy(job))) return;
      tasks.delete(key);
      jobs = jobs.filter((job) => job.key !== key);
      emit();
    },
    clearFinished() {
      for (const job of jobs) if (!busy(job)) tasks.delete(job.key);
      jobs = jobs.filter(busy);
      emit();
    },
  };
}
export type DownloadQueue = ReturnType<typeof createDownloadQueue>;
