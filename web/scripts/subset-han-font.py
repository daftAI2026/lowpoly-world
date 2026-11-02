#!/usr/bin/env python3
# [INPUT]: 依赖 Adobe 官方 SC VF、fonttools 4.60.1 与公开网站文本。
# [OUTPUT]: 生成 GB2312 加网站字符的 WOFF2 与可核对的字体摘要。
# [POS]: 仅用于网站字体生成；常规构建直接读取已提交产物。
# [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
import hashlib
import json
from pathlib import Path
import sys
from fontTools import subset
from fontTools.ttLib import TTFont

web = Path(__file__).resolve().parents[1]
source = Path(sys.argv[1])
expected_source_sha = '085cc88c530b9c434165ab926f81608a55b24e60e05719f3d41340ac45d9c62f'
if hashlib.sha256(source.read_bytes()).hexdigest() != expected_source_sha:
    raise SystemExit('字体来源摘要不符；请使用 han-font-build.json 的官方原件。')
output = web / 'src/assets/han-sans-sc-subset.woff2'
characters = set()
for first in range(0xA1, 0xF8):
    for second in range(0xA1, 0xFF):
        try:
            characters.update(bytes([first, second]).decode('gb2312'))
        except UnicodeDecodeError:
            pass
for folder in ['src', 'content']:
    for path in (web / folder).rglob('*'):
        if path.suffix in {'.tsx', '.ts', '.mdx'}:
            characters.update(c for c in path.read_text() if ord(c) >= 0x2E80)
font = TTFont(source, recalcTimestamp=False)
available = set(font.getBestCmap())
points = {ord(c) for c in characters if ord(c) >= 0x2000} & available
options = subset.Options()
options.flavor = 'woff2'
options.recalc_timestamp = False
options.name_IDs = ['*']
options.name_legacy = True
options.name_languages = ['*']
subsetter = subset.Subsetter(options=options)
subsetter.populate(unicodes=points)
subsetter.subset(font)
# ---- OFL 的 Reserved Font Name 为 Source；修改后的字族必须改名 ----
renamed = {1: 'LPW Han Sans SC', 3: 'LPW Han Sans SC subset 2.005',
           4: 'LPW Han Sans SC', 6: 'LPWHanSansSC', 16: 'LPW Han Sans SC',
           21: 'LPW Han Sans SC', 25: 'LPWHanSansSC'}
for record in font['name'].names:
    if record.nameID in renamed:
        record.string = renamed[record.nameID].encode(record.getEncoding())
    elif record.nameID > 255 and 'SourceHanSansSCVF' in record.toUnicode():
        record.string = record.toUnicode().replace('SourceHanSansSCVF', 'LPWHanSansSCVF').encode(record.getEncoding())
font.flavor = 'woff2'
font.recalcTimestamp = False
font.save(output)
axes = {a.axisTag: [a.minValue, a.maxValue] for a in font['fvar'].axes}
report = {'source_sha256': hashlib.sha256(source.read_bytes()).hexdigest(),
          'output_sha256': hashlib.sha256(output.read_bytes()).hexdigest(),
          'output_bytes': output.stat().st_size, 'glyph_codepoints': len(points),
          'coverage': 'GB2312 non-Latin plus current public website characters',
          'family': 'LPW Han Sans SC', 'original_family': 'Source Han Sans SC',
          'reserved_name_renamed': True, 'axes': axes,
          'source_url': 'https://raw.githubusercontent.com/adobe-fonts/source-han-sans/a4f7cf94edfb9d7ffbdfc4841de276358bd7e0f2/Variable/WOFF2/OTF/SourceHanSansSC-VF.otf.woff2'}
(web / 'src/assets/han-font-build.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report))
