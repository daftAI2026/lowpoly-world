/**
 * [INPUT]: 依赖下载队列外部存储与 React 的订阅、生命周期。
 * [OUTPUT]: 导出稳定的下载队列与任务快照。
 * [POS]: 工作区下载绑定；只有离开工作区才取消，关闭弹层不卸载此绑定。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useEffect, useState, useSyncExternalStore } from 'react';
import { createDownloadQueue } from './download-queue';
export function useDownloadQueue() {
  const [queue] = useState(() => createDownloadQueue());
  const jobs = useSyncExternalStore(queue.subscribe, queue.getSnapshot, queue.getSnapshot);
  const active = jobs.filter((job) => job.status === 'active' || job.status === 'queued').length;
  const busy = active > 0;
  useEffect(() => () => queue.cancelAll(), [queue]);
  useEffect(() => {
    if (!busy) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [busy]);
  return { queue, jobs, active };
}
