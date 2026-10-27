"""Five original TB-003 thumbnails (1280×720) rendered with the film's own particle engine and rigs,
plus a contact sheet and a 320×180 check sheet.

  python3 thumbs.py OUTDIR
Text is set after rendering with a reliable Cyrillic font (Inter Display ExtraBold, OFL)."""
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ENG = os.path.join(HERE, "..", "..", "..", "src", "three-books", "tb003", "engine")
sys.path.insert(0, ENG)
import film  # noqa: E402
import rigs  # noqa: E402
from film import RigActor, ShapeActor  # noqa: E402
from gl import Renderer  # noqa: E402
from stage import Stage  # noqa: E402

FONT = os.path.join(ENG, "..", "fonts", "InterDisplay-ExtraBold.otf")
WHITE = (255, 255, 255)
AMBER = (255, 189, 63)
TURQ = (24, 230, 207)
INK = (26, 22, 58)


class Scene:
    def __init__(self, timing):
        self.st = Stage(timing)
        self.seed = 0
        self.st.look.key(0, 0.01, dust=0.6)

    def prop(self, name, x, y, s=1.0, alpha=1.0, n=None, **kw):
        self.seed += 1
        area = film.shape_area(name)
        n = n or int(min(30000, max(400, area * s * s / film.SPACING ** 2 * 1.3)))
        a = ShapeActor(name, n=n, seed=self.seed, x=x, y=y, s=s, alpha=alpha, **kw)
        return self.st.add(a)

    def rig(self, r, seed, x, y, s, pose="stand", face=1.0, alpha=1.0, **kw):
        a = RigActor(r, seed=seed, x=x, y=y, s=s, face=face, alpha=alpha, **kw)
        a.key(0, 0.01, pose=pose, **kw)
        return self.st.add(a)

    def render(self, r, T=2.0, light=0.0, cam=(960, 540, 1.0), bloom=0.45, tint_k=0.25):
        self.st.cam.key(0, 0.01, cx=cam[0], cy=cam[1], z=cam[2])
        self.st.look.key(0, 0.01, light=light, bloom=bloom, tint_k=tint_k)
        pts, ov, look, c = self.st.frame(T)
        buf = r.frame(pts, light=look["light"], bloom=look["bloom"], halo=0.3, grid=look["grid"] * 0.6, overlay=ov,
                      tint=look["tint"], tint_k=look["tint_k"], cam=(c["cx"] - 960, c["cy"] - 540), cam_z=c["z"])
        im = Image.frombytes("RGB", (1920, 1080), buf).transpose(Image.FLIP_TOP_BOTTOM)
        return im.resize((1280, 720), Image.LANCZOS)


def headline(im, lines, x, y, size, color=WHITE, accent=AMBER, accent_line=None, align="left", dark=False):
    """Big Cyrillic headline with a soft shadow and a thin outline for phone readability."""
    d = ImageDraw.Draw(im)
    f = ImageFont.truetype(FONT, size)
    lh = int(size * 1.02)
    shadow = Image.new("RGBA", im.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    pos = []
    for i, ln in enumerate(lines):
        w = d.textlength(ln, font=f)
        xx = x if align == "left" else (x - w if align == "right" else x - w / 2)
        pos.append((xx, y + i * lh, ln))
        sd.text((xx + 4, y + i * lh + 6), ln, font=f, fill=(255, 255, 255, 120) if dark else (0, 0, 10, 200))
    shadow = shadow.filter(ImageFilter.GaussianBlur(7))
    base = im.convert("RGBA")
    base.alpha_composite(shadow)
    d = ImageDraw.Draw(base)
    for i, (xx, yy, ln) in enumerate(pos):
        col = accent if accent_line == i else color
        d.text((xx, yy), ln, font=f, fill=col, stroke_width=3, stroke_fill=(255, 255, 255) if dark else (12, 10, 34))
    return base.convert("RGB")


def t1(T, r):
    """Everything converges on him: Rin large in the left third with a work sheet; three requests fly in."""
    sc = Scene(T)
    sc.st.look.key(0, 0.01, tint=(0.70, 0.52, 0.22))
    sc.prop("ground", 960, 1000, s=1.0, alpha=0.6)
    for i, (k, x) in enumerate((("a", 1180), ("b", 1420), ("c", 1660))):
        sc.prop("stand", x, 780, s=0.95, alpha=0.5)
        sc.prop("panel_" + k, x, 668, s=0.95, alpha=0.75)
    for i, (src, dst) in enumerate((((1700, 260), (700, 520)), ((1820, 520), (720, 620)), ((1500, 900), (700, 700)))):
        sc.prop("msg", src[0] + (dst[0] - src[0]) * 0.45, src[1] + (dst[1] - src[1]) * 0.45, s=1.6)
        sc.st.add(film.Flow(90, 0.0, 2.0, src, dst, color=(0.6, 0.85, 1.0), travel=1.6, stay=False, vanish_at_dst=True,
                            seed=20 + i, src_spread=20, arc=-60 + i * 50, size=1.1))
    rin = sc.rig(rigs.rin(), 7, 420, 1230, 3.0, pose="tired", face=1)
    sh = sc.prop("shiftsheet", 0, 0, s=1.0)
    sh.attach(rin, "hand_f")
    sh.key(0, 0.01, att=1.0, adx=40, ady=-60)
    im = sc.render(r, T=2.6, cam=(960, 560, 1.0), bloom=0.5)
    return headline(im, ["ВСЁ", "НА ТЕБЕ?"], 1240, 34, 128, align="right", accent_line=1)


def t2(T, r):
    """The empty place in front, Tai with ready panels behind; Rin only a small silhouette behind the door."""
    sc = Scene(T)
    sc.st.look.key(0, 0.01, tint=(0.70, 0.52, 0.22))
    sc.prop("ground", 960, 1010, s=1.0, alpha=0.6)
    sc.prop("table", 520, 900, s=1.9)
    sc.prop("sheet", 470, 790, s=0.6, alpha=0.5)
    for k, x in (("a", 980), ("c", 1180)):
        sc.prop("stand", x, 760, s=0.9, alpha=0.55)
        sc.prop("panel_" + k, x, 652, s=0.9)
    sc.rig(rigs.tai(), 21, 1360, 980, 1.25, pose="hold1", face=-1)
    sc.prop("question", 1360, 330, s=0.9)
    sc.prop("door_room_open", 1700, 820, s=1.0)
    sc.rig(rigs.rin(), 7, 1790, 960, 0.55, pose="calm", face=-1, dim=0.8)
    im = sc.render(r, T=2.0, cam=(960, 560, 1.0), bloom=0.45)
    return headline(im, ["СПРОСИМ", "У РИНА"], 50, 30, 116, accent_line=1)


def t3(T, r):
    """The path of one order from above: the same palm on every step, small Rin at the central node."""
    sc = Scene(T)
    sc.st.look.key(0, 0.01, tint=(0.75, 0.55, 0.25), tint_k=0.5)
    sc.prop("chain7", 960, 640, s=1.75)
    for i in range(7):
        x = 960 + (-450 + i * 150) * 1.75
        if i != 3:
            sc.prop("palm", x, 500, s=1.6, tint=(0.25, 1.0, 0.6, 0.55))
    sc.rig(rigs.rin(), 7, 960, 700, 1.05, pose="palms", face=1)
    im = sc.render(r, T=2.0, cam=(960, 560, 1.0), bloom=0.55, tint_k=0.5)
    return headline(im, ["ТЫ — ВСЯ", "СИСТЕМА?"], 640, 40, 112, align="center", accent_line=1)


def t4(T, r):
    """Light close-up: 120 on the incoming line, three layers of real costs, the small 12 that is left."""
    sc = Scene(T)
    U = 9.0
    x0 = 960 - 60 * U
    sc.prop("bar", 960, 400, s=1.0, sx=120 * U / 100, sy=2.6, n=9000, tint=(1.0, 0.70, 0.30, 1.0))
    x = x0
    for v, col in ((72, (0.15, 0.72, 0.62)), (24, (0.45, 0.55, 1.0)), (12, (0.62, 0.42, 0.95)), (12, (1.0, 0.55, 0.2))):
        sc.prop("bar", x + v * U / 2, 610, s=1.0, sx=v * U / 100, sy=2.6, n=int(v * 60), tint=(*col, 1.0))
        x += v * U
    im = sc.render(r, T=2.0, light=1.0, bloom=0.12, cam=(960, 540, 1.0))
    im = headline(im, ["ЧТО ОСТАЛОСЬ?"], 640, 26, 104, color=INK, accent=(205, 110, 0), align="center", dark=True)
    sx = 1280 / 1920
    im = headline(im, ["120"], 640, 150, 88, color=(150, 80, 0), align="center", dark=True)
    im = headline(im, ["− 72  − 24  − 12"], int((x0 + 54 * U) * sx), 450, 46, color=INK, align="center", dark=True)
    im = headline(im, ["12"], int((x0 + 114 * U) * sx), 450, 120, color=(205, 90, 0), align="center", dark=True)
    return headline(im, ["условный пример"], 640, 640, 34, color=(80, 80, 130), align="center", dark=True)


def t5(T, r):
    """Close: Tai's wing puts her own mark on the shift sheet; Rin calm in the second plane."""
    sc = Scene(T)
    sc.st.look.key(0, 0.01, tint=(0.70, 0.56, 0.26), tint_k=0.45)
    sc.rig(rigs.rin(), 7, 330, 1000, 1.3, pose="calm", face=1, dim=0.75)
    sc.prop("shiftsheet", 980, 560, s=1.9)
    sc.prop("mark", 1066, 532, s=3.2)
    sc.prop("signature", 940, 860, s=1.6)
    tai = sc.rig(rigs.tai(), 21, 1650, 1700, 2.6, pose="write", face=-1)
    im = sc.render(r, T=2.0, cam=(960, 540, 1.0), bloom=0.5, tint_k=0.45)
    return headline(im, ["ДОВЕРИТЬ", "РЕШЕНИЕ"], 40, 30, 112, accent_line=1)


def main():
    film.DOT = 4.4          # larger, cleaner dots: thumbnails are read at phone size
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    T = film.Timing()
    r = Renderer()
    ims = []
    for i, fn in enumerate((t1, t2, t3, t4, t5), 1):
        im = fn(T, r)
        assert im.size == (1280, 720)
        p = os.path.join(out, f"TB003_thumbnail_{i:02d}.png")
        im.save(p, optimize=True)
        ims.append(im)
        print(p)
    sheet = Image.new("RGB", (1280 * 2 + 30, 720 * 3 + 40), (14, 14, 26))
    for i, im in enumerate(ims):
        sheet.paste(im, (10 + (i % 2) * 1290, 10 + (i // 2) * 730))
    sheet.save(os.path.join(out, "TB003_thumbnails_contact_sheet.jpg"), quality=90)
    small = Image.new("RGB", (320 * 5 + 60, 180 + 20), (14, 14, 26))
    for i, im in enumerate(ims):
        small.paste(im.resize((320, 180), Image.LANCZOS), (10 + i * 330, 10))
    small.save(os.path.join(out, "TB003_thumbnails_320x180.jpg"), quality=92)


if __name__ == "__main__":
    main()
