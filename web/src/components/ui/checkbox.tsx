/**
 * [INPUT]: 依赖 Base UI Checkbox、Lucide 勾选图标和本地 cn 样式组合。
 * [OUTPUT]: 导出有键盘和表单语义的 shadcn/Base UI 复选框。
 * [POS]: 过滤器布尔选择底座；调用方持有所选筛选值。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CheckboxProps = CheckboxPrimitive.Root.Props & { className?: string };

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn('ui-checkbox', className)}
      {...props}
    >
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator">
        <Check aria-hidden="true" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
