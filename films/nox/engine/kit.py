"""Reusable staging pieces for chapter scripts."""
import numpy as np

import shapes
from film import ShapeActor
from stage import disc, grid_slots, route, stagger

GROUND = 905.0
CH_TITLES = {}


def chapter_card(st, ch):
    """Small chapter label top-left for 4 s at the start of each chapter (not a full-screen title)."""
    t0 = st.T.C(ch["index"], 0.5)
    st.cap(t0, t0 + 4.2, f"_{ch['index']:02d}_  {ch['title']}", 110, 84, "chapter", align="left")


def obj(st, shape, n=2000, seed=0, layer=3, **init):
    return st.add(ShapeActor(shape, n=n, seed=seed, layer=layer, **init))


def appear(a, t, d=1.2, origin=None, alpha=1.0, **kw):
    """Assemble an object from a point (origin) or fade it in."""
    if origin is not None:
        a.key(t - 0.001, 0.001, assemble=0.0, alpha=alpha, ox=origin[0], oy=origin[1], **kw)
        a.key(t, d, assemble=1.0)
    else:
        a.key(t - 0.001, 0.001, alpha=0.0, **kw)
        a.key(t, d * 0.6, alpha=alpha)
    return a


def vanish(a, t, d=0.8, to=None):
    if to is not None:
        a.key(t, d, assemble=0.0, ox=to[0], oy=to[1])
        a.key(t + d, 0.2, alpha=0.0)
    else:
        a.key(t, d, alpha=0.0)
    return a


class Bin:
    """A labelled category container that lights fly into (slots fill from the bottom)."""

    def __init__(self, st, x, y, label, cap_n, seed=0, cols=24, dx=10.5, dy=10.5, color=None, dark=False,
                 sx=1.0, sy=1.12):
        self.st, self.x, self.y = st, x, y
        self.label = label
        self.box = obj(st, "binbox", 900, seed=seed + 900, layer=2, x=x, y=y, sx=sx, sy=sy)
        self.slots = grid_slots(cap_n, x, y + 150 * sy - 12, cols, dx, dy, seed=seed)
        self.dark = dark

    def show(self, t0, t1, label_t1=None):
        self.box.key(t0, 0.8, alpha=0.9)
        self.box.key(t1, 0.8, alpha=0.0)
        self.st.cap(t0 + 0.2, label_t1 or t1, self.label, self.x, self.y - 210, "label", dark=self.dark)


def money(st, n, t_in0, t_in1, src_box, hold, hold_r=60, seed=0, color=shapes.AMBER, travel=1.0):
    """Lights arriving from an area into a held cluster. Returns (times_arrive, hold_positions)."""
    rng = np.random.default_rng(seed)
    src = np.stack([rng.uniform(src_box[0], src_box[2], n), rng.uniform(src_box[1], src_box[3], n)], 1)
    t_start = stagger(n, t_in0, t_in1, seed)
    t_hold = t_start + travel * rng.uniform(0.8, 1.2, n)
    hp = disc(n, hold[0], hold[1], hold_r, seed + 1)
    return src.astype(np.float32), t_start, t_hold, hp


def ledger_label(st, t0, t1, x, y, s, style="num", **kw):
    return st.cap(t0, t1, s, x, y, style, **kw)
