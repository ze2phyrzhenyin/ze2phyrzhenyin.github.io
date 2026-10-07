#!/usr/bin/env python3
"""Rebuild the zero-dependency single-file website. Python 3.9+ only."""
from pathlib import Path
import json
root=Path(__file__).resolve().parent
out=root.parents[2]/'public/guides/java/index.html'
out.parent.mkdir(parents=True,exist_ok=True)
data=json.loads((root/'data.json').read_text(encoding='utf-8'))
# Prevent user-authored code examples from terminating the JSON script element.
serialized=json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
html=(root/'template.html').read_text(encoding='utf-8')
html=html.replace('/*__STYLES__*/',(root/'styles.css').read_text(encoding='utf-8'))
html=html.replace('/*__DATA__*/',serialized)
html=html.replace('/*__APP__*/',(root/'app.js').read_text(encoding='utf-8'))
out.write_text(html,encoding='utf-8')
print(f'Created {out.name}: {out.stat().st_size:,} bytes')
