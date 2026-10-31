/**
 * [INPUT]: 依赖 Fumadocs 静态搜索客户端、对话框组件与当前语言上下文。
 * [OUTPUT]: 导出不访问服务端运行时的文档搜索对话框。
 * [POS]: 全站文档搜索入口；搜索数据由预渲染的 `/api/search` 提供。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
'use client';

import { useStaticSearch } from 'fumadocs-core/search/client';
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  type SharedProps,
} from 'fumadocs-ui/components/dialog/search';
import { useI18n } from 'fumadocs-ui/contexts/i18n';

export default function DefaultSearchDialog(props: SharedProps) {
  const { locale } = useI18n();
  const search = useStaticSearch({ locale });

  return (
    <SearchDialog {...search} {...props}>
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList />
      </SearchDialogContent>
    </SearchDialog>
  );
}
