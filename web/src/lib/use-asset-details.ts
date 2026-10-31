/**
 * [INPUT]: 依赖已验证目录资产、asset-metadata.ts 和浏览器 AbortController。
 * [OUTPUT]: 导出详情元数据加载状态及显式重试动作。
 * [POS]: React 生命周期与静态资源读取之间的边界；可选资源不阻断模型视图。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useEffect, useState } from 'react';
import type { CatalogAsset } from './catalog';
import { loadAssetDetails, type AssetDetails } from './asset-metadata';

export type AssetDetailsState =
  | { status: 'loading' }
  | { status: 'ready'; details: AssetDetails }
  | { status: 'error' };

export function useAssetDetails(asset: CatalogAsset) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<AssetDetailsState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });
    void loadAssetDetails(asset, fetch, controller.signal)
      .then((details) => {
        if (!controller.signal.aborted) setState({ status: 'ready', details });
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: 'error' });
      });
    return () => controller.abort();
  }, [asset, attempt]);

  return {
    state,
    retry: () => setAttempt((current) => current + 1),
  };
}
