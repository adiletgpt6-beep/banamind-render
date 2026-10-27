#!/usr/bin/env bash
# Usage: scripts/sheet.sh name frame1 frame2 ...  → output/previews/stills/<name>.png (half-res contact sheet)
set -e
cd "$(dirname "$0")/.."
name=$1; shift
D=output/previews/stills; mkdir -p $D
npx remotion bundle --out-dir=.remotion-bundle >/dev/null 2>&1
for f in "$@"; do
  npx remotion still .remotion-bundle InfiniteDiscovery001 $D/f_$f.png --frame=$f --scale=0.5 >/tmp/claude-0/still.log 2>&1 || { tail -30 /tmp/claude-0/still.log; exit 1; }
done
python3 - "$name" "$@" <<'PY'
import sys
from PIL import Image, ImageDraw
name, fs = sys.argv[1], sys.argv[2:]
ims=[Image.open(f'output/previews/stills/f_{f}.png').convert('RGB') for f in fs]
w,h=ims[0].size
s=Image.new('RGB',(w*len(ims),h))
for i,im in enumerate(ims):
    s.paste(im,(i*w,0)); ImageDraw.Draw(s).text((i*w+8,8), f"{int(fs[i])/30:.1f}s", fill=(255,80,80))
s.save(f'output/previews/stills/{name}.png')
PY
