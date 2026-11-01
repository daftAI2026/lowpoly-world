/**
 * [INPUT]: 依赖 Fumadocs 原生 links、URL locale、站点身份和 HF 图标。
 * [OUTPUT]: 导出展厅与文档共用的主导航及 GitHub、HF 外链。
 * [POS]: 展示应用唯一导航配置；不替换模板 header 或菜单。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { HuggingFaceIcon } from '@/components/hugging-face-icon';
import { DATASET_REPO_ID } from './catalog';
import { localizedHomePath, localizedPath, type Locale } from './locale';
import { messages } from './messages';
import { appName, gitConfig } from './shared';

export function baseOptions(locale: Locale): BaseLayoutProps {
  const labels = messages[locale].navigation;
  return {
    themeSwitch: { enabled: false },
    nav: { title: appName, url: localizedHomePath(locale) },
    links: [
      { text: labels.assets, url: localizedHomePath(locale), active: 'url' },
      { text: labels.docs, url: localizedPath('/docs', locale), active: 'nested-url' },
      {
        type: 'icon',
        label: 'Hugging Face',
        text: 'Hugging Face',
        icon: <HuggingFaceIcon />,
        url: `https://huggingface.co/datasets/${DATASET_REPO_ID}`,
        external: true,
      },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
