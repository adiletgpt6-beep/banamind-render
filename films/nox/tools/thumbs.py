"""Five YouTube thumbnails 1280×720 (PNG) made with the film's own particle engine and Nox rig.

  python3 thumbs.py OUTDIR"""
import os
import sys

import numpy as np
from PIL import Image

HERE = os.path.dirname(__file__)
sys.path.insert(0, os.path.join(HERE, "..", "engine"))
import film  # noqa: E402
import kit  # noqa: E402
import shapes  # noqa: E402
from film import FoxActor  # noqa: E402
from gl import Renderer  # noqa: E402
from stage import Stage, disc, route, stagger  # noqa: E402

T0 = 10.0


def base():
    st = Stage(film.Timing())
    st.look.key(0, 0.01, bloom=0.5, halo=0.28, tint_k=0.35)
    st.dust.tr.key(0, 0.01, alpha=0.6)
    return st


def fox(st, **kw):
    f = st.add(FoxActor())
    f.key(0, 0.01, alpha=1.0, **kw)
    return f


def thumb1(st):
    fox(st, pose="carry", x=560, y=1060, s=1.75, face=1.0, ring_gap=0.3)
    jar = kit.obj(st, "jar", 2600, seed=1)
    jar.key(0, 0.01, x=960, y=700, s=1.25, alpha=1.0, bright=1.3)
    # earned lights streaming away to the right (towards spending)
    n = 700
    rng = np.random.default_rng(3)
    src = np.stack([rng.uniform(80, 420, n), rng.uniform(260, 520, n)], 1)
    dst = np.stack([rng.uniform(1250, 1980, n), rng.uniform(470, 1060, n)], 1)
    t = stagger(n, T0 - 3.0, T0 + 0.5, 4)
    col = np.where((np.arange(n) % 3 == 0)[:, None], np.array(shapes.PINK), np.array(shapes.AMBER))
    st.add(route(n, [(t, src), (t + 3.0, dst)], seed=5, color=col, size=1.6, arc=-260))
    st.cap(0, 99, "КУДА ВСЁ\n*ДЕЛОСЬ?*", 1420, 250, "thumb")


def thumb2(st):
    tw = kit.obj(st, "tower", 4200, seed=5)
    tw.key(0, 0.01, x=1480, y=560, s=1.55, alpha=1.0, bright=1.35)
    fox(st, pose="tired", x=420, y=1040, s=1.25, face=1.0, ring_gap=0.72)
    st.cap(0, 99, "БОЛЬШЕ ≠\n*СПОКОЙНЕЕ*", 760, 250, "thumb", size=140)


def thumb3(st):
    fl = kit.obj(st, "finishline", 1500, seed=7)
    fl.key(0, 0.01, x=300, y=150, s=0.5, alpha=1.0, rot=-18)
    n = 220
    u = np.linspace(0, 1, n)
    line = np.stack([120 + 260 * u, 1000 - 800 * u ** 1.4], 1)
    st.add(route(n, [(np.full(n, 0.0), line)], seed=8, color=shapes.TURQ, size=1.4))
    win = kit.obj(st, "freewindow", 4200, seed=9)
    win.key(0, 0.01, x=1500, y=560, s=1.0, alpha=1.0, bright=1.2)
    fox(st, pose="think", x=930, y=1050, s=1.45, face=1.0, ring_gap=0.3)
    st.cap(0, 99, "СКОЛЬКО\n*ДОСТАТОЧНО?*", 1190, 170, "thumb", size=126)


def thumb4(st):
    """ЦЕНА ЧУЖОГО ВЗГЛЯДА: bright reflection in a shop window, his real options dim behind him."""
    vit = kit.obj(st, "vitrine", 3600, seed=11)
    vit.key(0, 0.01, x=1340, y=640, s=1.55, alpha=1.0, bright=1.2)
    for shp, x, y, sc in (("lamp", 1130, 680, 0.6), ("armchair", 1560, 730, 0.7)):
        it = kit.obj(st, shp, 1100, seed=12 + int(x))
        it.key(0, 0.01, x=x, y=y, s=sc, alpha=1.0, bright=1.3)
    refl = fox(st, pose="proud", x=1340, y=980, s=0.95, face=-1.0, dim=1.35)
    refl.layer = 4
    room = kit.obj(st, "room", 2400, seed=13)
    room.key(0, 0.01, x=240, y=720, s=0.75, alpha=0.35, bright=0.45)
    fox(st, pose="tilt", x=650, y=1060, s=1.55, face=1.0, ring_gap=0.4)
    st.cap(0, 99, "ЦЕНА ЧУЖОГО\n*ВЗГЛЯДА*", 600, 200, "thumb", size=128)


def thumb5(st):
    """ЧТО ТЫ ПОКУПАЕШЬ?: a coin of lights turning into a clock; Nox looks at a free evening."""
    coin = kit.obj(st, "dot", 900, seed=14)
    coin.key(0, 0.01, x=980, y=560, s=13.0, alpha=1.0, tint=(*shapes.GOLD, 0.6))
    clk = kit.obj(st, "clockface", 1800, seed=15)
    clk.key(0, 0.01, x=1180, y=560, s=4.2, alpha=1.0, bright=1.3)
    n = 400
    rng = np.random.default_rng(16)
    a = rng.uniform(0, 2 * np.pi, n)
    src = np.stack([980 + np.cos(a) * 60, 560 + np.sin(a) * 60], 1)
    dst = np.stack([1180 + np.cos(a) * 170, 560 + np.sin(a) * 170], 1)
    t = stagger(n, T0 - 2.5, T0 + 0.5, 17)
    st.add(route(n, [(t, src), (t + 2.6, dst)], seed=18, color=shapes.GOLD, size=1.3, arc=-60))
    win = kit.obj(st, "freewindow", 3000, seed=19)
    win.key(0, 0.01, x=1620, y=300, s=0.55, alpha=1.0, bright=1.25)
    fox(st, pose="think", x=430, y=1050, s=1.5, face=1.0, ring_gap=0.15, clock=0.6)
    st.cap(0, 99, "ЧТО ТЫ\n*ПОКУПАЕШЬ?*", 720, 170, "thumb", size=128)


def main():
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    r = Renderer()
    for i, fn in enumerate((thumb1, thumb2, thumb3, thumb4, thumb5), 1):
        st = base()
        fn(st)
        pts, overlay, look, cam = st.frame(T0)
        buf = r.frame(pts, light=0, bloom=look["bloom"], halo=look["halo"], overlay=overlay, tint=look["tint"],
                      tint_k=look["tint_k"])
        im = Image.frombytes("RGB", (1920, 1080), buf).transpose(Image.FLIP_TOP_BOTTOM)
        im = im.resize((1280, 720), Image.LANCZOS)
        p = os.path.join(out, f"NOX_thumbnail_{i:02d}.png")
        im.save(p, optimize=True)
        print(p, os.path.getsize(p))


if __name__ == "__main__":
    main()
