/**
 * [INPUT]: 依赖官方 shadcn Button、可复制文本与 Clipboard API。
 * [OUTPUT]: 导出带真实成功或失败反馈的复制按钮。
 * [POS]: 预览与选择集共用复制能力；权限失败不伪报成功。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
export function CopyButton({ value, label }: { value: string; label: string }) {
  const { t } = useTranslation();
  const [receipt, setReceipt] = useState<{ value: string; status: 'copied' | 'failed' } | null>(
    null,
  );
  const status = receipt?.value === value ? receipt.status : 'idle';
  return (
    <span className="copy-control">
      <Button
        type="button"
        variant="link"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setReceipt({ value, status: 'copied' });
          } catch {
            setReceipt({ value, status: 'failed' });
          }
        }}
      >
        {label}
      </Button>
      {status !== 'idle' && (
        <span role="status">
          {t(status === 'copied' ? 'workspace.copied' : 'workspace.copyFailed')}
        </span>
      )}
    </span>
  );
}
