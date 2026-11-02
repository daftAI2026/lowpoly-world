/**
 * [INPUT]: 依赖普通鼠标事件字段与当前筛选后的资产顺序。
 * [OUTPUT]: 导出预览拦截规则、筛选内前后项。
 * [POS]: 工作区纯规则；修改键保留浏览器链接行为，不访问 DOM 或远端。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
type PreviewClick = Pick<
  MouseEvent,
  'button' | 'ctrlKey' | 'metaKey' | 'shiftKey' | 'altKey' | 'defaultPrevented'
>;
export function shouldOpenPreview(event: PreviewClick, wide: boolean): boolean {
  return (
    wide &&
    event.button === 0 &&
    !event.defaultPrevented &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey &&
    !event.altKey
  );
}
export function previewNeighbors(assets: readonly { id: string }[], selected: string | null) {
  const index = assets.findIndex((asset) => asset.id === selected);
  return {
    index,
    previous: index > 0 ? assets[index - 1].id : null,
    next: index >= 0 ? (assets[index + 1]?.id ?? null) : null,
  };
}
