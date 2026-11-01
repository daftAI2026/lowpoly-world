/**
 * [INPUT]: 依赖 Base UI Button、Fumadocs 按钮变体与 cn。
 * [OUTPUT]: 导出复用原生 Fumadocs 样式的资产操作按钮。
 * [POS]: 可复用交互底座；链接继续使用原生 anchor 保留导航语义。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type ButtonProps = Omit<ComponentProps<typeof ButtonPrimitive>, 'className'> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'icon';
  className?: string;
};

export function Button({
  className,
  variant = 'secondary',
  size = 'md',
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size: size === 'md' ? undefined : size }), className)}
      {...props}
    />
  );
}
