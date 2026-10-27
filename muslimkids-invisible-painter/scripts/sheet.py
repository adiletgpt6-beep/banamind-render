# Контактный лист кадров: python3 scripts/sheet.py out.jpg frame1.jpg frame2.jpg ...
import sys
from PIL import Image, ImageDraw
out, files = sys.argv[1], sys.argv[2:]
ims = [Image.open(f) for f in files]
w, h = 360, 640
cols = min(5, len(ims))
rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (cols * w, rows * (h + 24)), "white")
d = ImageDraw.Draw(sheet)
for i, (f, im) in enumerate(zip(files, ims)):
    x, y = (i % cols) * w, (i // cols) * (h + 24)
    sheet.paste(im.resize((w, h)), (x, y + 24))
    d.text((x + 6, y + 4), f.split("/")[-1], fill="black")
sheet.save(out, quality=88)
