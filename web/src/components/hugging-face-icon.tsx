/**
 * [INPUT]: 依赖 HF 官方品牌页提供的原始彩色 SVG。
 * [OUTPUT]: 导出保留官方黄色、面部与手部比例的 HuggingFaceIcon。
 * [POS]: 原生导航的品牌例外；不染色、不走第三方单色图标。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import logo from '@/assets/hugging-face.svg';

export function HuggingFaceIcon() {
  return <img src={logo} width={20} height={20} alt="" aria-hidden="true" />;
}
