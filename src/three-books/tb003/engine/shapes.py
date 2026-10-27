"""TB-003 point-cloud shapes (sampling core adapted from the TB-001/TB-002 engines) + the new TB-003 prop library.

A shape is a dict of float32 arrays: p (N,2) local coords centred at 0, z (N,) depth -1..1,
c (N,3) colour 0..1, s (N,) size multiplier, k (N,) per-point key 0..1 (used for fill levels,
staggered assembly etc.). Units: pixels at scale 1."""
import functools
import math

import numpy as np
from PIL import Image, ImageDraw

# palette (prompt section 11)
BG = "#07111F"
AMBER = (1.0, 0.741, 0.247)       # #FFBD3F
TURQ = (0.094, 0.902, 0.812)      # #18E6CF
GREEN = (0.396, 0.906, 0.522)     # #65E785
BLUE = (0.427, 0.486, 1.0)        # #6D7CFF
PINK = (0.914, 0.282, 0.722)      # #E948B8
WHITE = (0.957, 0.969, 1.0)       # #F4F7FF
VIOLET = (0.62, 0.40, 1.0)
GOLD = (1.0, 0.82, 0.35)
RED = (1.0, 0.45, 0.42)


def hexc(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


def _rng(seed):
    return np.random.default_rng(seed)


def sample_mask(mask, n, seed=0, scale=1.0):
    """Jittered-grid sampling of a boolean mask (H,W) -> n points (pixel coords / scale)."""
    ys, xs = np.nonzero(mask)
    area = len(xs)
    if area == 0:
        return np.zeros((n, 2), np.float32)
    rng = _rng(seed)
    step = math.sqrt(area / n)
    pts = None
    for _ in range(6):
        gx = np.arange(0, mask.shape[1], step)
        gy = np.arange(0, mask.shape[0], step)
        X, Y = np.meshgrid(gx, gy)
        X = X.ravel() + rng.uniform(-0.38, 0.38, X.size) * step + step * 0.5
        Y = Y.ravel() + rng.uniform(-0.38, 0.38, Y.size) * step + step * 0.5
        xi = np.clip(X.astype(int), 0, mask.shape[1] - 1)
        yi = np.clip(Y.astype(int), 0, mask.shape[0] - 1)
        ok = mask[yi, xi]
        pts = np.stack([X[ok], Y[ok]], 1)
        if len(pts) >= n:
            break
        step *= 0.9
    if len(pts) > n:
        idx = np.sort(rng.choice(len(pts), n, replace=False))
        pts = pts[idx]
    elif len(pts) < n:
        extra = rng.integers(0, len(xs), n - len(pts))
        pts = np.concatenate([pts, np.stack([xs[extra] + rng.random(len(extra)), ys[extra] + rng.random(len(extra))], 1)])
    return (pts / scale).astype(np.float32)


def edge_dist(mask):
    """Approximate distance to the mask edge (pixels) using repeated erosion (cheap, small masks)."""
    m = mask.copy()
    d = np.zeros(mask.shape, np.float32)
    k = 0
    while m.any() and k < 60:
        d[m] += 1
        e = m.copy()
        e[1:, :] &= m[:-1, :]
        e[:-1, :] &= m[1:, :]
        e[:, 1:] &= m[:, :-1]
        e[:, :-1] &= m[:, 1:]
        m = e
        k += 1
    return d


class Canvas:
    """Draw a colour-coded picture with PIL at `res` px per unit; regions carry colours.
    Coordinates are given in units with origin at the centre."""

    def __init__(self, w, h, res=2.0):
        self.w, self.h, self.res = w, h, res
        self.W, self.H = int(w * res), int(h * res)
        self.img = Image.new("RGBA", (self.W, self.H), (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.img)

    def _p(self, x, y):
        return ((x + self.w / 2) * self.res, (y + self.h / 2) * self.res)

    def _col(self, c, a=255):
        return (int(c[0] * 255), int(c[1] * 255), int(c[2] * 255), a)

    def poly(self, pts, c, a=255):
        self.d.polygon([self._p(x, y) for x, y in pts], fill=self._col(c, a))

    def ellipse(self, cx, cy, rx, ry, c, a=255):
        x0, y0 = self._p(cx - rx, cy - ry)
        x1, y1 = self._p(cx + rx, cy + ry)
        self.d.ellipse([x0, y0, x1, y1], fill=self._col(c, a))

    def rect(self, x0, y0, x1, y1, c, a=255, r=0):
        p0, p1 = self._p(x0, y0), self._p(x1, y1)
        if r:
            self.d.rounded_rectangle([p0, p1], radius=r * self.res, fill=self._col(c, a))
        else:
            self.d.rectangle([p0, p1], fill=self._col(c, a))

    def line(self, pts, c, width, a=255):
        self.d.line([self._p(x, y) for x, y in pts], fill=self._col(c, a), width=max(1, int(width * self.res)),
                    joint="curve")
        for x, y in (pts[0], pts[-1]):
            self.ellipse(x, y, width / 2, width / 2, c, a)

    def arc(self, cx, cy, r, a0, a1, c, width, a=255, steps=64):
        pts = [(cx + r * math.cos(math.radians(t)), cy + r * math.sin(math.radians(t)))
               for t in np.linspace(a0, a1, steps)]
        self.line(pts, c, width, a)

    def ring(self, cx, cy, r, width, c, a=255):
        self.ellipse(cx, cy, r + width / 2, r + width / 2, c, a)
        self.ellipse(cx, cy, r - width / 2, r - width / 2, (0, 0, 0), 0)
        # punch hole: draw transparent via composite
        x0, y0 = self._p(cx - r + width / 2, cy - r + width / 2)
        x1, y1 = self._p(cx + r - width / 2, cy + r - width / 2)
        self.d.ellipse([x0, y0, x1, y1], fill=(0, 0, 0, 0))

    def erase_ellipse(self, cx, cy, rx, ry):
        x0, y0 = self._p(cx - rx, cy - ry)
        x1, y1 = self._p(cx + rx, cy + ry)
        self.d.ellipse([x0, y0, x1, y1], fill=(0, 0, 0, 0))

    def erase_poly(self, pts):
        self.d.polygon([self._p(x, y) for x, y in pts], fill=(0, 0, 0, 0))

    def text(self, x, y, s, c, size, font=None):
        from PIL import ImageFont
        import os
        f = ImageFont.truetype(font or os.path.join(os.path.dirname(__file__), "..", "fonts", "InterDisplay-ExtraBold.otf"),
                               int(size * self.res))
        bb = self.d.textbbox((0, 0), s, font=f)
        px, py = self._p(x, y)
        self.d.text((px - (bb[2] - bb[0]) / 2 - bb[0], py - (bb[3] - bb[1]) / 2 - bb[1]), s, font=f,
                    fill=self._col(c))

    def to_shape(self, n, seed=0, edge_boost=0.35, jitter_col=0.06, depth=1.0, size=1.0, keymode="y"):
        arr = np.asarray(self.img).astype(np.float32) / 255
        mask = arr[..., 3] > 0.5
        pts = sample_mask(mask, n, seed)
        xi = np.clip(pts[:, 0].astype(int), 0, self.W - 1)
        yi = np.clip(pts[:, 1].astype(int), 0, self.H - 1)
        col = arr[yi, xi, :3]
        ed = edge_dist(mask)[yi, xi] / self.res
        rng = _rng(seed + 7)
        col = np.clip(col * (1 + rng.normal(0, jitter_col, (n, 1))) + rng.normal(0, jitter_col * 0.5, (n, 3)), 0, 1)
        thick = np.clip(ed / 18.0, 0, 1)
        z = (np.sqrt(thick) * rng.choice([-1, 1], n) * rng.uniform(0.3, 1, n) * depth).astype(np.float32)
        edge = np.exp(-ed / 3.0)
        s = (size * (1 + edge_boost * edge) * rng.uniform(0.8, 1.15, n)).astype(np.float32)
        p = np.stack([pts[:, 0] / self.res - self.w / 2, pts[:, 1] / self.res - self.h / 2], 1).astype(np.float32)
        if keymode == "y":
            k = 1 - (p[:, 1] - p[:, 1].min()) / max(1e-6, np.ptp(p[:, 1]))
        elif keymode == "x":
            k = (p[:, 0] - p[:, 0].min()) / max(1e-6, np.ptp(p[:, 0]))
        else:
            k = rng.random(n)
        return {"p": p, "z": z, "c": col.astype(np.float32), "s": s, "k": k.astype(np.float32)}


def concat(*shapes):
    return {key: np.concatenate([s[key] for s in shapes]) for key in ("p", "z", "c", "s", "k")}


def hilbert_key(p, order=10):
    """Hilbert curve index of 2D points (for spatially coherent morph matching)."""
    lo = p.min(0)
    span = max(np.ptp(p[:, 0]), np.ptp(p[:, 1]), 1e-6)
    n = 1 << order
    x = np.clip(((p[:, 0] - lo[0]) / span * (n - 1)).astype(np.int64), 0, n - 1)
    y = np.clip(((p[:, 1] - lo[1]) / span * (n - 1)).astype(np.int64), 0, n - 1)
    d = np.zeros(len(p), np.int64)
    s = n >> 1
    while s > 0:
        rx = ((x & s) > 0).astype(np.int64)
        ry = ((y & s) > 0).astype(np.int64)
        d += s * s * ((3 * rx) ^ ry)
        # rotate
        m = ry == 0
        flip = m & (rx == 1)
        x = np.where(flip, s - 1 - x, x)
        y = np.where(flip, s - 1 - y, y)
        x2 = np.where(m, y, x)
        y2 = np.where(m, x, y)
        x, y = x2, y2
        s >>= 1
    return d


def match(a, b):
    """Permutation perm so that a[perm[i]] travels to b[i] in a spatially coherent way."""
    ia = np.argsort(hilbert_key(a), kind="stable")
    ib = np.argsort(hilbert_key(b), kind="stable")
    perm = np.empty(len(b), np.int64)
    perm[ib] = ia
    return perm


def resample(shape, n, seed=0):
    """Return shape with exactly n points (subsample or duplicate with tiny jitter)."""
    m = len(shape["p"])
    if m == n:
        return shape
    rng = _rng(seed)
    if m > n:
        idx = np.sort(rng.choice(m, n, replace=False))
    else:
        idx = np.concatenate([np.arange(m), rng.integers(0, m, n - m)])
    out = {k: v[idx].copy() for k, v in shape.items()}
    if m < n:
        out["p"][m:] += rng.normal(0, 1.2, (n - m, 2)).astype(np.float32)
    return out


# ================================================================ TB-003 prop library
# The city gardens of light, the workroom, the training site and the explanatory objects of Rin's week.
LIB = {}
EMER = (0.20, 0.86, 0.56)
EMER_D = (0.10, 0.58, 0.40)
CORAL = (1.0, 0.52, 0.42)
SKY = (0.35, 0.52, 1.0)
CARD = (0.93, 0.95, 1.0)
INK = (0.55, 0.60, 0.90)
STEEL = (0.62, 0.70, 1.0)
WOOD = (0.86, 0.62, 0.40)
WOOD_D = (0.66, 0.44, 0.30)
LEAF = (0.22, 0.70, 0.52)
LEAF_D = (0.12, 0.46, 0.40)
PALMC = (1.0, 0.86, 0.62)


def shape(name):
    def deco(fn):
        LIB[name] = fn
        return fn
    return deco


@functools.lru_cache(maxsize=None)
def get(name, n):
    s = LIB[name](n)
    return resample(s, n, seed=sum(map(ord, name)) % 1000)


def _cv(w, h, res=2.0):
    return Canvas(w, h, res)


def _frame(c, x0, y0, x1, y1, col, w):
    c.rect(x0, y0, x1, y0 + w, col)
    c.rect(x0, y1 - w, x1, y1, col)
    c.rect(x0, y0, x0 + w, y1, col)
    c.rect(x1 - w, y0, x1, y1, col)


# ---------------------------------------------------------------- decorative panels (four clear patterns)
PANEL_COL = {"a": (TURQ, (0.55, 1.0, 0.92)), "b": (AMBER, (1.0, 0.90, 0.60)),
             "c": (PINK, (1.0, 0.70, 0.90)), "d": (VIOLET, (0.80, 0.70, 1.0))}


def _panel_draw(c, kind, x0=0.0, y0=0.0, w=60, h=80):
    col, lite = PANEL_COL[kind]
    _frame(c, x0 - w, y0 - h, x0 + w, y0 + h, lite, 5)
    if kind == "a":            # circles
        for yy in (-42, 0, 42):
            for xx in (-26, 26):
                c.ellipse(x0 + xx, y0 + yy, 13, 13, col)
    elif kind == "b":          # diamonds
        for yy in (-40, 0, 40):
            c.poly([(x0, y0 + yy - 18), (x0 + 30, y0 + yy), (x0, y0 + yy + 18), (x0 - 30, y0 + yy)], col)
    elif kind == "c":          # waves
        for yy in (-46, -16, 14, 44):
            c.line([(x0 - 44 + i * 8, y0 + yy + 7 * math.sin(i * 0.9)) for i in range(12)], col, 5)
    else:                      # stars / sparks
        for xx, yy in ((-24, -40), (24, -12), (-20, 22), (22, 50)):
            for a in (0, 60, 120):
                r = math.radians(a)
                c.line([(x0 + xx - 13 * math.cos(r), y0 + yy - 13 * math.sin(r)),
                        (x0 + xx + 13 * math.cos(r), y0 + yy + 13 * math.sin(r))], col, 4)


for _k in "abcd":
    def _mk(k):
        def fn(n):
            c = _cv(140, 180)
            _panel_draw(c, k)
            return c.to_shape(n, seed=300 + ord(k), edge_boost=0.3)
        return fn
    shape("panel_" + _k)(_mk(_k))


@shape("frame_empty")
def _frame_empty(n):
    c = _cv(140, 180)
    _frame(c, -60, -80, 60, 80, (0.80, 0.84, 1.0), 5)
    return c.to_shape(n, seed=311, edge_boost=0.3)


@shape("stand")
def _stand(n):
    """Display stand: two thin side posts and a top bar; the panel hangs between the posts (bar at y = -210)."""
    c = _cv(190, 440)
    col = (0.46, 0.54, 0.92)
    for x in (-70, 70):
        c.rect(x - 3, -210, x + 3, 200, col)
        c.rect(x - 22, 196, x + 22, 205, col, r=3)
    c.rect(-76, -214, 76, -206, col, r=3)
    return c.to_shape(n, seed=312, edge_boost=0.3)


@shape("materials")
def _materials(n):
    """Stack of empty frames and a box of fastenings."""
    c = _cv(220, 160)
    for i in range(4):
        _frame(c, -96 + i * 7, -60 + i * 9, 10 + i * 7, 60, (0.78, 0.82, 1.0), 4)
    c.rect(28, 10, 100, 60, WOOD, r=4)
    c.rect(28, 10, 100, 20, WOOD_D)
    for x in (44, 64, 84):
        c.ellipse(x, 38, 5, 5, AMBER)
    return c.to_shape(n, seed=313, edge_boost=0.3)


# ---------------------------------------------------------------- garden of lights
@shape("lamp")
def _lamp(n):
    c = _cv(90, 420)
    c.rect(-4, -170, 4, 200, (0.45, 0.55, 0.90))
    c.rect(-24, 196, 24, 206, (0.45, 0.55, 0.90), r=3)
    c.ellipse(0, -186, 20, 20, (1.0, 0.86, 0.55))
    c.arc(0, -186, 30, 200, 340, (0.55, 0.62, 0.95), 3)
    return c.to_shape(n, seed=321, edge_boost=0.3)


@shape("arch")
def _arch(n):
    c = _cv(520, 440)
    for k in range(0, 181, 6):
        a = math.radians(180 + k)
        c.ellipse(220 * math.cos(a), 30 + 220 * math.sin(a), 6, 6, (TURQ, (0.6, 0.9, 1.0), AMBER)[k // 6 % 3])
    c.rect(-226, 30, -214, 210, (0.40, 0.50, 0.88))
    c.rect(214, 30, 226, 210, (0.40, 0.50, 0.88))
    return c.to_shape(n, seed=322, edge_boost=0.25)


@shape("bush")
def _bush(n):
    c = _cv(260, 160)
    for x, y, r in ((-70, 20, 50), (0, -5, 66), (72, 22, 48), (-30, 40, 40), (40, 42, 40)):
        c.ellipse(x, y, r, r * 0.85, LEAF)
    rng = _rng(3)
    for _ in range(9):
        c.ellipse(rng.uniform(-90, 90), rng.uniform(-30, 40), 5, 5, (1.0, 0.85, 0.5))
    return c.to_shape(n, seed=323, edge_boost=0.3)


@shape("tree")
def _tree(n):
    c = _cv(360, 560)
    c.rect(-14, 40, 14, 270, WOOD_D)
    for x, y, r in ((0, -120, 110), (-90, -40, 80), (90, -40, 80), (0, 0, 90), (-40, -190, 70), (50, -180, 70)):
        c.ellipse(x, y, r, r * 0.9, LEAF_D)
    rng = _rng(4)
    for _ in range(18):
        c.ellipse(rng.uniform(-140, 140), rng.uniform(-230, 40), 5, 5, (0.70, 1.0, 0.85))
    return c.to_shape(n, seed=324, edge_boost=0.25)


@shape("ground")
def _ground(n):
    c = _cv(2400, 30)
    for i in range(0, 2400, 6):
        c.rect(-1200 + i, -1.5, -1200 + i + 3, 1.5, (0.32, 0.62, 0.62))
    return c.to_shape(n, seed=325, edge_boost=0.0, size=0.8)


@shape("skyline")
def _skyline(n):
    """Far city roofs and garden hedges (background band)."""
    c = _cv(2400, 260)
    rng = _rng(6)
    x = -1200
    while x < 1200:
        w = rng.uniform(80, 200)
        h = rng.uniform(40, 200)
        c.rect(x, 120 - h, x + w, 120, (0.26, 0.32, 0.66))
        for _ in range(int(w * h / 3000)):
            wx, wy = x + rng.uniform(8, w - 14), 120 - rng.uniform(14, h - 6)
            c.rect(wx, wy, wx + 6, wy + 6, (0.9, 0.8, 0.5))
        x += w + rng.uniform(10, 60)
    return c.to_shape(n, seed=326, edge_boost=0.1, size=0.85)


# ---------------------------------------------------------------- workroom and training site
@shape("table")
def _table(n):
    """Work table: top at y = -24, legs reach y = +140 (place its centre 140 px above the floor)."""
    c = _cv(380, 300)
    c.rect(-170, -24, 170, -8, WOOD, r=3)
    c.rect(-156, -8, -144, 140, WOOD_D)
    c.rect(144, -8, 156, 140, WOOD_D)
    return c.to_shape(n, seed=331, edge_boost=0.3)


@shape("door_room")
def _door_room(n):
    c = _cv(200, 340)
    _frame(c, -80, -160, 80, 160, STEEL, 8)
    c.rect(-70, -150, 70, 152, (0.45, 0.50, 0.92), r=3)
    c.erase_poly([(-58, -138), (58, -138), (58, 140), (-58, 140)])
    c.ellipse(46, 6, 7, 7, AMBER)
    return c.to_shape(n, seed=332, edge_boost=0.3)


@shape("door_room_open")
def _door_room_open(n):
    c = _cv(200, 340)
    _frame(c, -80, -160, 80, 160, STEEL, 8)
    c.poly([(-72, -152), (-30, -132), (-30, 132), (-72, 152)], (0.45, 0.50, 0.92))
    c.erase_poly([(-64, -138), (-38, -126), (-38, 124), (-64, 138)])
    c.ellipse(-36, 6, 5, 5, AMBER)
    return c.to_shape(n, seed=333, edge_boost=0.3)


@shape("window")
def _window(n):
    c = _cv(260, 220)
    _frame(c, -110, -90, 110, 90, (0.55, 0.62, 0.98), 6)
    c.rect(-3, -90, 3, 90, (0.55, 0.62, 0.98))
    c.rect(-110, -3, 110, 3, (0.55, 0.62, 0.98))
    for x, y in ((-60, -50), (50, 40), (60, -40)):
        c.ellipse(x, y, 4, 4, (1.0, 0.85, 0.5))
    return c.to_shape(n, seed=334, edge_boost=0.3)


@shape("plaque")
def _plaque(n):
    """Small standing table sign (its word is a caption)."""
    c = _cv(220, 110)
    _frame(c, -96, -40, 96, 30, (0.90, 0.92, 1.0), 4)
    c.poly([(-30, 30), (30, 30), (44, 46), (-44, 46)], (0.62, 0.66, 0.98))
    return c.to_shape(n, seed=335, edge_boost=0.3)


@shape("sheet")
def _sheet(n):
    c = _cv(200, 250)
    c.rect(-84, -110, 84, 110, CARD, r=6)
    c.erase_poly([(-78, -104), (78, -104), (78, 104), (-78, 104)])
    for y in (-80, -50, -20, 10, 40, 70):
        c.rect(-62, y, 62 if y < 40 else 20, y + 4, INK)
    return c.to_shape(n, seed=336, edge_boost=0.25)


@shape("shiftsheet")
def _shiftsheet(n):
    """Shift sheet: a header and three rows with empty mark boxes on the right."""
    c = _cv(280, 340)
    c.rect(-120, -150, 120, 150, CARD, r=6)
    c.erase_poly([(-113, -143), (113, -143), (113, 143), (-113, 143)])
    c.rect(-96, -120, 40, -110, AMBER)
    for i in range(4):
        y = -70 + i * 56
        c.rect(-96, y, 30, y + 5, INK)
        _frame(c, 56, y - 16, 90, y + 18, INK, 3)
    return c.to_shape(n, seed=337, edge_boost=0.25)


@shape("week")
def _week(n):
    c = _cv(980, 190)
    for i in range(7):
        x = -420 + i * 140
        _frame(c, x - 60, -70, x + 60, 70, (0.75, 0.80, 1.0), 4)
    return c.to_shape(n, seed=338, edge_boost=0.25)


@shape("cells3")
def _cells3(n):
    c = _cv(560, 170)
    for i in range(3):
        x = -180 + i * 180
        for k in range(0, 360, 12):           # dashed outline = not yet happened
            a = k / 360
            px = x - 70 + 140 * min(1, max(0, (a * 4) if a < 0.25 else 1 if a < 0.5 else (1 - (a - 0.5) * 4) if a < 0.75 else 0))
            py = -55 + 110 * min(1, max(0, 0 if a < 0.25 else (a - 0.25) * 4 if a < 0.5 else 1 if a < 0.75 else 1 - (a - 0.75) * 4))
            c.ellipse(px, py, 3.2, 3.2, (0.75, 0.80, 1.0))
    return c.to_shape(n, seed=339, edge_boost=0.2)


@shape("cell_full")
def _cell_full(n):
    c = _cv(170, 140)
    _frame(c, -70, -55, 70, 55, (0.70, 1.0, 0.85), 5)
    c.line([(-22, 0), (-6, 16), (24, -18)], GREEN, 7)
    return c.to_shape(n, seed=340, edge_boost=0.25)


# ---------------------------------------------------------------- explanatory objects
@shape("chain7")
def _chain7(n):
    """Seven equal stations on one line (x = -450 … 450, step 150)."""
    c = _cv(1000, 120)
    c.rect(-450, -3, 450, 3, (0.55, 0.62, 0.95))
    for i in range(7):
        x = -450 + i * 150
        c.ellipse(x, 0, 30, 30, (0.55, 0.62, 0.95))
        c.erase_ellipse(x, 0, 24, 24)
        c.ellipse(x, 0, 8, 8, TURQ)
    return c.to_shape(n, seed=341, edge_boost=0.25)


@shape("palm")
def _palm(n):
    c = _cv(80, 90)
    c.ellipse(0, 14, 22, 22, PALMC)
    for i, x in enumerate((-16, -6, 4, 14)):
        c.rect(x - 4, -28 + abs(i - 1.5) * 4, x + 4, 10, PALMC, r=4)
    c.rect(18, 2, 34, 11, PALMC, r=4)
    return c.to_shape(n, seed=342, edge_boost=0.25)


@shape("stop_palm")
def _stop_palm(n):
    c = _cv(160, 160)
    c.ellipse(0, 0, 66, 66, AMBER)
    c.erase_ellipse(0, 0, 58, 58)
    c.ellipse(0, 14, 24, 24, (1.0, 0.92, 0.70))
    for i, x in enumerate((-18, -6, 6, 18)):
        c.rect(x - 4.5, -34 + abs(i - 1.5) * 4, x + 4.5, 10, (1.0, 0.92, 0.70), r=4)
    return c.to_shape(n, seed=343, edge_boost=0.25)


@shape("msg")
def _msg(n):
    c = _cv(110, 80)
    c.rect(-44, -26, 44, 20, (0.60, 0.85, 1.0), r=10)
    c.poly([(-24, 18), (-30, 34), (-8, 18)], (0.60, 0.85, 1.0))
    for x in (-18, 0, 18):
        c.ellipse(x, -3, 4.5, 4.5, (0.15, 0.25, 0.55))
    return c.to_shape(n, seed=344, edge_boost=0.25)


@shape("phone")
def _phone(n):
    c = _cv(70, 110)
    c.rect(-24, -44, 24, 44, (0.60, 0.70, 1.0), r=7)
    c.rect(-18, -34, 18, 30, (0.30, 0.85, 0.95), r=3)
    return c.to_shape(n, seed=345, edge_boost=0.25)


@shape("arrow")
def _arrow(n):
    c = _cv(240, 60)
    c.rect(-100, -4, 80, 4, (0.85, 0.88, 1.0))
    c.poly([(70, -18), (106, 0), (70, 18)], (0.85, 0.88, 1.0))
    return c.to_shape(n, seed=346, edge_boost=0.2)


@shape("boundary")
def _boundary(n):
    """Dashed rectangle 640×300: the agreed row."""
    c = _cv(680, 340)
    for i in range(0, 640, 28):
        c.rect(-320 + i, -150, -320 + i + 16, -144, GREEN)
        c.rect(-320 + i, 144, -320 + i + 16, 150, GREEN)
    for i in range(0, 300, 28):
        c.rect(-320, -150 + i, -314, -150 + i + 16, GREEN)
        c.rect(314, -150 + i, 320, -150 + i + 16, GREEN)
    return c.to_shape(n, seed=347, edge_boost=0.2)


@shape("swap")
def _swap(n):
    """Two curved arrows exchanging places."""
    c = _cv(260, 140)
    c.arc(0, 30, 90, 200, 340, AMBER, 5)
    c.poly([(84, -6), (100, 30), (66, 22)], AMBER)
    c.arc(0, -30, 90, 20, 160, AMBER, 5)
    c.poly([(-84, 6), (-100, -30), (-66, -22)], AMBER)
    return c.to_shape(n, seed=348, edge_boost=0.2)


@shape("photo_frame")
def _photo(n):
    """A neat picture of someone's grand site: what others show."""
    c = _cv(460, 320)
    _frame(c, -210, -140, 210, 140, (1.0, 0.90, 0.65), 7)
    for i, k in enumerate("abcd"):
        _panel_draw(c, k, -150 + i * 100, -10, w=34, h=46)
    c.arc(0, 160, 230, 205, 335, (1.0, 0.85, 0.5), 4)
    for x in (-160, 160):
        c.ellipse(x, -100, 6, 6, (1.0, 0.85, 0.5))
    return c.to_shape(n, seed=349, edge_boost=0.25)


@shape("column")
def _column(n):
    c = _cv(300, 460)
    c.rect(-124, -200, 124, 200, CARD, r=10)
    c.erase_poly([(-116, -192), (116, -192), (116, 192), (-116, 192)])
    c.rect(-90, -160, 90, -150, INK)
    return c.to_shape(n, seed=350, edge_boost=0.25)


@shape("baseline")
def _baseline(n):
    c = _cv(1300, 20)
    c.rect(-620, -2, 620, 2, (0.75, 0.80, 1.0))
    return c.to_shape(n, seed=351, edge_boost=0.1)


@shape("circles2")
def _circles2(n):
    c = _cv(1000, 400)
    for x, col in ((-260, EMER), (260, SKY)):
        c.ellipse(x, 0, 170, 170, col)
        c.erase_ellipse(x, 0, 162, 162)
    for i in range(0, 200, 16):
        c.ellipse(-90 + i * 0.9, 0, 4, 4, AMBER)
    return c.to_shape(n, seed=352, edge_boost=0.2)


@shape("letter")
def _letter(n):
    c = _cv(150, 110)
    c.rect(-60, -40, 60, 40, CARD, r=4)
    c.erase_poly([(-54, -34), (54, -34), (54, 34), (-54, 34)])
    c.line([(-58, -38), (0, 6), (58, -38)], CARD, 4)
    return c.to_shape(n, seed=353, edge_boost=0.25)


@shape("badge")
def _badge(n):
    c = _cv(70, 70)
    c.rect(-22, -16, 22, 16, (0.95, 0.80, 0.45), r=4)
    c.rect(-14, -6, 14, -2, (0.40, 0.30, 0.20))
    c.rect(-14, 4, 6, 8, (0.40, 0.30, 0.20))
    return c.to_shape(n, seed=354, edge_boost=0.25)


@shape("signature")
def _signature(n):
    c = _cv(150, 60)
    pts = [(-60 + i * 4, 10 * math.sin(i * 0.55) - (i % 9) * 0.6) for i in range(30)]
    c.line(pts, CORAL, 4)
    return c.to_shape(n, seed=355, edge_boost=0.2)


@shape("mark")
def _mark(n):
    c = _cv(60, 60)
    c.line([(-18, 0), (-5, 14), (20, -16)], CORAL, 7)
    return c.to_shape(n, seed=356, edge_boost=0.2)


@shape("check")
def _check(n):
    c = _cv(60, 60)
    c.line([(-18, 0), (-5, 14), (20, -16)], GREEN, 7)
    return c.to_shape(n, seed=357, edge_boost=0.2)


@shape("cross")
def _cross(n):
    c = _cv(60, 60)
    c.line([(-15, -15), (15, 15)], RED, 6)
    c.line([(15, -15), (-15, 15)], RED, 6)
    return c.to_shape(n, seed=358, edge_boost=0.2)


@shape("note")
def _note(n):
    c = _cv(130, 90)
    c.rect(-54, -34, 54, 34, (1.0, 0.92, 0.62), r=4)
    for y in (-16, -2, 12):
        c.rect(-40, y, 30, y + 4, (0.70, 0.55, 0.30))
    return c.to_shape(n, seed=359, edge_boost=0.25)


@shape("pencil")
def _pencil(n):
    c = _cv(110, 30)
    c.rect(-44, -4, 30, 4, AMBER)
    c.poly([(30, -4), (46, 0), (30, 4)], CARD)
    return c.to_shape(n, seed=360, edge_boost=0.2)


@shape("question")
def _question(n):
    c = _cv(100, 140)
    c.arc(0, -22, 28, 180, 420, AMBER, 10)
    c.line([(0, 6), (0, 24)], AMBER, 10)
    c.ellipse(0, 46, 7, 7, AMBER)
    return c.to_shape(n, seed=361, edge_boost=0.2)


@shape("strike")
def _strike(n):
    c = _cv(600, 40)
    c.line([(-280, 6), (280, -6)], (1.0, 0.55, 0.50), 6)
    return c.to_shape(n, seed=362, edge_boost=0.2)


@shape("hline")
def _hline(n):
    c = _cv(520, 20)
    c.rect(-250, -2, 250, 2, (0.75, 0.78, 1.0))
    return c.to_shape(n, seed=363, edge_boost=0.1)


@shape("bar")
def _bar(n):
    """Unit bar 100×30 (its width is scaled with sx)."""
    c = _cv(110, 40)
    c.rect(-50, -15, 50, 15, (1.0, 1.0, 1.0), r=3)
    return c.to_shape(n, seed=364, edge_boost=0.15)


@shape("eye")
def _eye(n):
    c = _cv(120, 70)
    c.ellipse(0, 0, 46, 22, (0.70, 0.90, 1.0))
    c.erase_ellipse(0, 0, 38, 15)
    c.ellipse(0, 0, 11, 11, TURQ)
    return c.to_shape(n, seed=365, edge_boost=0.2)


@shape("person_icon")
def _person_icon(n):
    c = _cv(80, 110)
    c.ellipse(0, -30, 17, 17, (0.80, 0.86, 1.0))
    c.rect(-26, -6, 26, 44, (0.80, 0.86, 1.0), r=14)
    return c.to_shape(n, seed=366, edge_boost=0.25)


@shape("site_marks")
def _site_marks(n):
    """Floor marks of the training site: two rows of stand positions."""
    c = _cv(1300, 40)
    for i in range(0, 1240, 22):
        c.rect(-620 + i, -2, -620 + i + 12, 2, (0.40, 0.80, 0.70))
    return c.to_shape(n, seed=367, edge_boost=0.1, size=0.85)


@shape("dot")
def _dot(n):
    c = _cv(40, 40)
    c.ellipse(0, 0, 12, 12, (1.0, 1.0, 1.0))
    return c.to_shape(n, seed=368, edge_boost=0.1)
