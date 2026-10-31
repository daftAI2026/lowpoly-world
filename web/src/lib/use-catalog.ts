/**
 * [INPUT]: 依赖 catalog.ts 的公开 Dataset 读取协议与浏览器 AbortController。
 * [OUTPUT]: 导出加载、空目录、成功与失败状态，以及显式重试动作。
 * [POS]: 路由与数据客户端之间的状态边界；不复制索引校验逻辑。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useEffect, useState } from 'react';
import { loadPublicCatalog, type Catalog } from './catalog';

export type CatalogState =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'ready'; catalog: Catalog }
  | { status: 'error'; message: string };

export function useCatalog() {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<CatalogState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });

    void loadPublicCatalog(controller.signal)
      .then((catalog) => {
        if (controller.signal.aborted) return;
        setState(catalog ? { status: 'ready', catalog } : { status: 'empty' });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown catalog error.',
        });
      });

    return () => controller.abort();
  }, [attempt]);

  return {
    state,
    retry: () => setAttempt((current) => current + 1),
  };
}
