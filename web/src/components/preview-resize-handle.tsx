/**
 * [INPUT]: 依赖停靠轴向、尺寸边界与指针捕获。
 * [OUTPUT]: 导出支持指针和键盘的宽度或高度分隔条。
 * [POS]: 仅调整单一预览，不注册全局事件或移动 viewer。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
export type PreviewSize = {
  value: number;
  minimum: number;
  maximum: number;
  onChange: (value: number) => void;
  axis: 'x' | 'y';
  direction: 1 | -1;
};
export function PreviewResizeHandle({
  value,
  minimum,
  maximum,
  onChange,
  axis,
  direction,
}: PreviewSize) {
  const { t } = useTranslation();
  const drag = useRef<{ origin: number; value: number } | null>(null);
  const change = (v: number) => onChange(Math.max(minimum, Math.min(maximum, v)));
  return (
    <div
      role="separator"
      tabIndex={0}
      aria-label={t(axis === 'x' ? 'asset.resizePreview' : 'workspace.previewHeight')}
      aria-orientation={axis === 'x' ? 'vertical' : 'horizontal'}
      aria-valuemin={minimum}
      aria-valuemax={maximum}
      aria-valuenow={value}
      className="preview-resizer"
      data-axis={axis}
      data-direction={direction}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        drag.current = { origin: axis === 'x' ? e.clientX : e.clientY, value };
        e.currentTarget.setPointerCapture(e.pointerId);
        e.preventDefault();
      }}
      onPointerMove={(e) => {
        if (drag.current)
          change(
            drag.current.value +
              ((axis === 'x' ? e.clientX : e.clientY) - drag.current.origin) * direction,
          );
      }}
      onPointerUp={(e) => {
        drag.current = null;
        if (e.currentTarget.hasPointerCapture(e.pointerId))
          e.currentTarget.releasePointerCapture(e.pointerId);
      }}
      onPointerCancel={() => {
        drag.current = null;
      }}
      onKeyDown={(e) => {
        const positive = axis === 'x' ? 'ArrowRight' : 'ArrowDown';
        const negative = axis === 'x' ? 'ArrowLeft' : 'ArrowUp';
        const next =
          e.key === positive
            ? value + 16 * direction
            : e.key === negative
              ? value - 16 * direction
              : e.key === 'Home'
                ? minimum
                : e.key === 'End'
                  ? maximum
                  : null;
        if (next !== null) {
          e.preventDefault();
          change(next);
        }
      }}
    />
  );
}
