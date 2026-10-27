# Лист контрольных кадров: несколько PNG рядом (для просмотра), с подписями.
#   python3 scripts/sd2d-sheet.py out.png a.png b.png …  (SHEET_W — ширина кадра)
import os, sys
from PIL import Image, ImageDraw
out, files = sys.argv[1], sys.argv[2:]
W = int(os.environ.get("SHEET_W", "360"))
ims = [Image.open(f).convert("RGB") for f in files]
H = int(W * ims[0].height / ims[0].width)
cols = min(len(ims), int(os.environ.get("SHEET_COLS", "5")))
rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (cols * W, rows * (H + 22)), "white")
d = ImageDraw.Draw(sheet)
for i, (f, im) in enumerate(zip(files, ims)):
    x, y = (i % cols) * W, (i // cols) * (H + 22)
    sheet.paste(im.resize((W, H)), (x, y + 22))
    d.text((x + 4, y + 4), os.path.basename(f), fill="black")
sheet.save(out)
