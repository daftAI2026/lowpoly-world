/**
 * [INPUT]: 依赖 TanStack location、导航与纯浏览状态契约。
 * [OUTPUT]: 导出 URL 驱动状态与保留滚动位置的状态更新。
 * [POS]: 工作区唯一浏览状态源；返回和语言切换不依赖临时组件副本。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useMemo } from 'react';
import { parseWorkspace, serializeWorkspace, type WorkspaceState } from './workspace-state';
export function useWorkspace() {
  const location = useRouterState({ select: (s) => s.location });
  const navigate = useNavigate();
  const state = useMemo(() => parseWorkspace(location.searchStr), [location.searchStr]);
  const update = (next: Partial<WorkspaceState>, replace = false) => {
    const params = new URLSearchParams(serializeWorkspace({ ...state, ...next }));
    const search: Record<string, string | string[]> = {};
    for (const key of new Set(params.keys())) {
      const values = params.getAll(key);
      search[key] = values.length > 1 ? values : values[0];
    }
    void navigate({ to: location.pathname, search, replace, resetScroll: false });
  };
  return { state, update };
}
