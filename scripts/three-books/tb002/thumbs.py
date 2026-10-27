"""Five original TB-002 thumbnails (1280×720) rendered with the film's own particle engine and rigs,
plus a contact sheet and a 320×180 check sheet.

  python3 thumbs.py OUTDIR
Text is set after rendering with a reliable Cyrillic font (Inter Display ExtraBold, OFL)."""
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ENG = os.path.join(HERE, "..", "..", "..", "src", "three-books", "tb002", "engine")
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
    """Empty vitrine: big puzzled Tiko left, bright complicated box, three people leaving."""
    sc = Scene(T)
    sc.prop("floor", 960, 990, s=1.0, alpha=0.7)
    sc.prop("stall", 1250, 760, s=1.0)
    sc.prop("unibox", 1110, 760 + 80 - 55, s=1.2)
    sc.prop("unibox_screen", 1085, 650, s=1.2)
    sc.prop("unibox_flag", 1185, 668, s=1.2)
    sc.prop("unibox_handle", 1110, 690, s=1.2)
    sc.prop("unibox_drawer", 1160, 852, s=1.2)
    sc.prop("price_tag", 1330, 815, s=1.0)
    for i, k in enumerate(("p1", "p3", "p2")):
        sc.rig(rigs.passer(k), 40 + i, 1520 + i * 150, 990, 0.72, pose="walk", face=1, dim=0.6)
    sc.rig(rigs.tiko(), 7, 430, 1080, 2.35, pose="tilt", face=1)
    im = sc.render(r, T=3.0, cam=(960, 560, 1.0))
    return headline(im, ["ПОЧЕМУ", "НЕ ПОКУПАЮТ?"], 1240, 40, 104, align="right", accent_line=1)


def t2(T, r):
    """Cord vs the miracle box: two big masses on a diagonal, Tiko small in profile between them."""
    sc = Scene(T)
    sc.prop("unibox", 470, 430, s=2.6)
    sc.prop("unibox_screen", 420, 190, s=2.6)
    sc.prop("unibox_flag", 650, 240, s=2.6)
    sc.prop("unibox_handle", 470, 270, s=2.6)
    sc.prop("unibox_drawer", 560, 540, s=2.6)
    sc.prop("unibox_drawer", 380, 600, s=2.6)
    ny = sc.rig(rigs.naya(), 21, 1700, 1430, 2.3, pose="hold1", face=-1)
    sc.prop("boxpair", 1440, 760, s=2.4)
    sc.prop("cord_tie", 1440, 760, s=2.4)
    sc.rig(rigs.tiko(), 7, 960, 1000, 0.95, pose="think", face=1)
    sc.prop("floor", 960, 1000, s=1.0, alpha=0.5)
    im = sc.render(r, T=4.0, cam=(960, 540, 1.0))
    return headline(im, ["ШНУР", "ПОБЕДИЛ?"], 1250, 40, 118, align="right", accent=TURQ, accent_line=0)


def t3(T, r):
    """Moment of truth: the tilted base on the low table, Naya's palm stops the test, Tiko's eyes above."""
    sc = Scene(T)
    sc.prop("lowtable", 980, 1010, s=2.6)
    sc.prop("carrier_bad", 960, 760, s=2.8, rot=-11)
    sc.prop("boxpair_tilt", 960, 770, s=2.8, rot=-11)
    sc.prop("hand_icon", 1520, 560, s=2.6, rot=-12)
    sc.st.add(film.Flow(140, 0.0, 1.8, (1210, 300), (1200, 820), color=(1.0, 0.78, 0.4), travel=1.4, stay=False,
                        vanish_at_dst=True, seed=9, src_spread=50, arc=0, size=1.3))
    sc.rig(rigs.tiko(), 7, 250, 980, 3.4, pose="surprised", face=1)
    im = sc.render(r, T=2.6, cam=(960, 560, 1.0), bloom=0.55)
    return headline(im, ["СЛОВА", "НЕ СПАСУТ"], 1250, 40, 112, align="right", accent_line=1)


def t4(T, r):
    """Top view on a light surface: the carrier in the centre, removed parts muted at the edges."""
    sc = Scene(T)
    sc.prop("carrier_v2", 960, 600, s=3.0)
    sc.prop("boxpair", 960, 618, s=3.0)
    dim = (0.55, 0.55, 0.85, 0.35)
    sc.prop("unibox_screen", 330, 760, s=2.2, tint=dim, rot=12)
    sc.prop("unibox_flag", 1700, 760, s=2.0, tint=dim, rot=-60)
    sc.prop("unibox_drawer", 360, 980, s=2.4, tint=dim, rot=8)
    sc.prop("unibox_handle", 1640, 300, s=2.2, tint=dim)
    sc.prop("hand_icon", 1420, 900, s=2.2, rot=-30)
    sc.prop("unibox_drawer", 1330, 790, s=1.8, tint=dim, rot=-20)
    im = sc.render(r, T=2.0, light=1.0, bloom=0.12, cam=(960, 560, 1.0))
    return headline(im, ["ЧТО ЗДЕСЬ", "ЛИШНЕЕ?"], 60, 30, 104, color=INK, accent=(205, 110, 0), accent_line=1, dark=True)


def t5(T, r):
    """Two real orders: Naya leaves with the carrier, Tiko holds a small card with two clear marks."""
    sc = Scene(T)
    sc.prop("floor", 960, 960, s=1.0, alpha=0.7)
    sc.prop("pickup", 300, 760, s=1.0, alpha=0.45)
    sc.prop("lowtable", 980, 900, s=1.2)
    ny = sc.rig(rigs.naya(), 21, 1560, 960, 1.35, pose="walk_hold1", face=1)
    c = sc.prop("carrier_v2", 0, 0, s=1.3)
    b = sc.prop("boxpair", 0, 0, s=1.3)
    for a, dy in ((c, 74), (b, 82)):
        a.attach(ny, "hand_f")
        a.key(0, 0.01, att=1.0, adx=10, ady=dy)
    tk = sc.rig(rigs.tiko(), 7, 760, 960, 1.75, pose="present", face=1)
    card = sc.prop("card_small", 0, 0, s=1.3)
    card.attach(tk, "hand_f")
    card.key(0, 0.01, att=1.0, adx=70, ady=-50)
    sc.prop("check", 0, 0, s=1.0).attach(tk, "hand_f").key(0, 0.01, att=1.0, adx=40, ady=-52)
    sc.prop("check", 0, 0, s=1.0).attach(tk, "hand_f").key(0, 0.01, att=1.0, adx=100, ady=-52)
    sc.prop("card_small", 1040, 820, s=0.8, alpha=0.6, tint=(0.4, 1.0, 0.85, 0.4))
    im = sc.render(r, T=2.4, cam=(960, 600, 1.0))
    im = headline(im, ["2"], 70, 10, 250, color=AMBER)
    return headline(im, ["ЗАКАЗА"], 230, 105, 112)


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
        p = os.path.join(out, f"TB002_thumbnail_{i:02d}.png")
        im.save(p, optimize=True)
        ims.append(im)
        print(p)
    sheet = Image.new("RGB", (1280 * 2 + 30, 720 * 3 + 40), (14, 14, 26))
    for i, im in enumerate(ims):
        sheet.paste(im, (10 + (i % 2) * 1290, 10 + (i // 2) * 730))
    sheet.save(os.path.join(out, "TB002_thumbnails_contact_sheet.jpg"), quality=90)
    small = Image.new("RGB", (320 * 5 + 60, 180 + 20), (14, 14, 26))
    for i, im in enumerate(ims):
        small.paste(im.resize((320, 180), Image.LANCZOS), (10 + i * 330, 10))
    small.save(os.path.join(out, "TB002_thumbnails_320x180.jpg"), quality=92)


if __name__ == "__main__":
    main()
