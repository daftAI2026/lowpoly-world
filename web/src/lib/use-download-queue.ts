/**
 * [INPUT]: 依赖稳定下载队列与 React 生命周期，不订阅界面进度。
 * [OUTPUT]: 导出工作区唯一队列，任务变化只更新离页保护。
 * [POS]: 队列所有权边界；进度由任务视图订阅，避免整个资产库重绘。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useEffect, useState } from 'react';
import { createDownloadQueue } from './download-queue';
export function useDownloadQueue() {
  const [queue] = useState(() => createDownloadQueue());
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    let busy = false;
    const sync = () => {
      const next = queue
        .getSnapshot()
        .some((job) => job.status === 'active' || job.status === 'queued');
      if (next === busy) return;
      busy = next;
      if (busy) window.addEventListener('beforeunload', warn);
      else window.removeEventListener('beforeunload', warn);
    };
    const unsubscribe = queue.subscribe(sync);
    sync();
    return () => {
      unsubscribe();
      window.removeEventListener('beforeunload', warn);
      queue.cancelAll();
    };
  }, [queue]);
  return queue;
}
