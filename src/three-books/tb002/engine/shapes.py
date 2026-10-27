"""TB-002 point-cloud shapes (sampling core adapted from the TB-001 engine) + the TB-002 prop library.

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


# ---------------------------------------------------------------- shape library
LIB = {}


def shape(name):
    def deco(fn):
        LIB[name] = fn
        return fn
    return deco


@functools.lru_cache(maxsize=None)
def get(name, n):
    s = LIB[name](n)
    return resample(s, n, seed=hash(name) % 1000)


def _cv(w, h, res=2.0):
    return Canvas(w, h, res)




def text_shape(s, n, size=120, color=AMBER, seed=0):
    w = max(200, int(len(s) * size * 0.75))
    c = Canvas(w, size * 1.6, res=1.5)
    c.text(0, 0, s, color, size)
    return c.to_shape(n, seed=seed, edge_boost=0.1)


def ring_points(n, r=1.0, gap=0.0, seed=0, start=-90.0):
    """Open ring (gap = fraction of circle missing) as parametric points along the arc."""
    rng = _rng(seed)
    u = (np.arange(n) + rng.random(n) * 0.6) / n
    ang = np.radians(start + (gap / 2 + u * (1 - gap)) * 360)
    rr = r * (1 + rng.normal(0, 0.05, n))
    return np.stack([np.cos(ang) * rr, np.sin(ang) * rr], 1).astype(np.float32), u




# ================================================================ TB-002 prop library
LIB = {}
LILACP = (0.72, 0.58, 1.0)
INDIGO = (0.40, 0.42, 0.95)
CARD = (0.93, 0.95, 1.0)
CORD = (1.0, 0.80, 0.45)
BOXC = (1.0, 0.70, 0.34)
BOXD = (0.86, 0.52, 0.24)
STEEL = (0.62, 0.70, 1.0)
STRAP = (0.10, 0.88, 0.80)
GLASS = (0.45, 0.78, 1.0)
GLASSD = (0.20, 0.34, 0.60)


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


# ---------------------------------------------------------------- the universal box and its parts
@shape("unibox")
def _unibox(n):
    c = _cv(200, 150)
    c.rect(-80, -50, 80, 55, LILACP, r=10)
    c.rect(-80, -50, 80, -40, (0.85, 0.75, 1.0))
    for i, x in enumerate((-58, -34, -10)):
        c.ellipse(x, -18, 7, 7, (AMBER, TURQ, PINK)[i])         # buttons
    c.rect(20, -28, 66, 0, (0.55, 0.45, 0.95), r=3)             # label plate
    c.rect(-70, 12, 70, 18, (0.52, 0.42, 0.90))                 # drawer seams
    c.rect(-70, 34, 70, 40, (0.52, 0.42, 0.90))
    return c.to_shape(n, seed=101, edge_boost=0.35)


@shape("unibox_screen")
def _uscreen(n):
    c = _cv(110, 90)
    c.rect(-44, -38, 44, 24, (0.30, 0.95, 0.90), r=5)
    c.erase_poly([(-38, -32), (38, -32), (38, 18), (-38, 18)])
    c.rect(-30, -24, 20, -18, (0.55, 1.0, 0.95))
    c.rect(-30, -10, 30, -4, (0.55, 1.0, 0.95))
    c.rect(-30, 4, 8, 10, (0.55, 1.0, 0.95))
    c.rect(-6, 24, 6, 40, STEEL)
    return c.to_shape(n, seed=102, edge_boost=0.3)


@shape("unibox_flag")
def _uflag(n):
    c = _cv(90, 130)
    c.rect(-3, -60, 3, 60, STEEL)
    c.poly([(3, -60), (44, -48), (3, -34)], PINK)
    return c.to_shape(n, seed=103, edge_boost=0.3)


@shape("unibox_drawer")
def _udrawer(n):
    c = _cv(120, 40)
    c.rect(-50, -12, 50, 12, (0.62, 0.50, 0.98), r=3)
    c.rect(-10, -4, 10, 4, AMBER, r=2)
    return c.to_shape(n, seed=104, edge_boost=0.3)


@shape("unibox_handle")
def _uhandle(n):
    c = _cv(120, 70)
    c.arc(0, 20, 38, 180, 360, STEEL, 7)
    return c.to_shape(n, seed=105, edge_boost=0.3)


@shape("manual")
def _manual(n):
    c = _cv(70, 90)
    c.rect(-26, -36, 26, 36, CARD, r=3)
    for y in (-22, -10, 2, 14):
        c.rect(-18, y, 18, y + 4, (0.55, 0.58, 0.85))
    return c.to_shape(n, seed=106, edge_boost=0.25)


# ---------------------------------------------------------------- courier boxes, cord, carrier
@shape("flatbox")
def _flatbox(n):
    c = _cv(150, 50)
    c.rect(-62, -17, 62, 17, BOXC, r=3)
    c.rect(-62, -3, 62, 3, BOXD)
    c.rect(-6, -17, 6, 17, (1.0, 0.86, 0.55))
    return c.to_shape(n, seed=111, edge_boost=0.3)


@shape("boxpair")
def _boxpair(n):
    c = _cv(150, 90)
    for y in (-18, 18):
        c.rect(-62, y - 16, 62, y + 16, BOXC, r=3)
        c.rect(-62, y - 2, 62, y + 2, BOXD)
    c.rect(-62, -1, 62, 1, (0.4, 0.3, 0.2))
    return c.to_shape(n, seed=112, edge_boost=0.3)


@shape("boxpair_tilt")
def _boxpair_tilt(n):
    # the two boxes slid apart on a tilted base (top box shifted toward the low side)
    c = _cv(170, 100)
    c.rect(-56, 4, 66, 36, BOXC, r=3)
    c.rect(-56, 18, 66, 22, BOXD)
    c.rect(-70, -30, 52, 2, BOXC, r=3)
    c.rect(-70, -16, 52, -12, BOXD)
    return c.to_shape(n, seed=113, edge_boost=0.3)


@shape("cord_tie")
def _cord(n):
    c = _cv(160, 110)
    c.line([(-66, -36), (66, -36), (66, 36), (-66, 36), (-66, -36)], CORD, 3.5)
    c.line([(-30, -36), (-30, 36)], CORD, 3.0)
    c.line([(30, -36), (30, 36)], CORD, 3.0)
    c.line([(0, -36), (-8, -52), (10, -48), (0, -36)], CORD, 3.0)       # knot
    return c.to_shape(n, seed=114, edge_boost=0.2, size=0.9)


@shape("cord_loose")
def _cord_loose(n):
    c = _cv(170, 70)
    pts = [(-70 + i * 7, 10 * math.sin(i * 0.6)) for i in range(21)]
    c.line(pts, CORD, 3.5)
    return c.to_shape(n, seed=115, edge_boost=0.2, size=0.9)


def _carrier_draw(c, stops=False, mounts_ok=True, folded=False):
    if folded:
        c.rect(-70, -8, 70, 8, STEEL, r=3)
        c.rect(-66, -14, 66, -9, STRAP, r=2)
        return
    c.rect(-72, 40, 72, 50, STEEL, r=3)                       # flat base
    mx = (-54, 54) if mounts_ok else (-54, 30)
    for x in mx:
        c.rect(x - 7, 30, x + 7, 42, AMBER, r=2)              # mounts
    c.line([(mx[0], 32), (mx[0] - 4, -20), (-20, -62), (20, -62), (mx[1] + 4, -20), (mx[1], 32)], STRAP, 6)
    c.rect(-16, -70, 16, -56, (0.55, 1.0, 0.95), r=4)         # grip
    if stops:
        for x in (-74, 74):
            c.rect(x - 4, 10, x + 4, 46, (1.0, 0.86, 0.5), r=2)   # side stops


@shape("carrier")
def _carrier(n):
    c = _cv(180, 150)
    _carrier_draw(c)
    return c.to_shape(n, seed=121, edge_boost=0.3)


@shape("carrier_bad")
def _carrier_bad(n):
    c = _cv(180, 150)
    _carrier_draw(c, mounts_ok=False)
    return c.to_shape(n, seed=122, edge_boost=0.3)


@shape("carrier_v2")
def _carrier_v2(n):
    c = _cv(180, 150)
    _carrier_draw(c, stops=True)
    return c.to_shape(n, seed=123, edge_boost=0.3)


@shape("carrier_folded")
def _carrier_folded(n):
    c = _cv(180, 150)
    _carrier_draw(c, folded=True)
    return c.to_shape(n, seed=124, edge_boost=0.3)


@shape("carrier_parts")
def _carrier_parts(n):
    """Base, strap and mounts lying apart on the counter (before assembly)."""
    c = _cv(260, 120)
    c.rect(-110, 30, 30, 40, STEEL, r=3)
    c.line([(50, 36), (70, 10), (100, 2), (120, 20)], STRAP, 6)
    for x in (-20, 0):
        c.rect(x + 40, 30, x + 52, 40, AMBER, r=2)
    return c.to_shape(n, seed=125, edge_boost=0.3)


@shape("stops")
def _stops(n):
    c = _cv(180, 60)
    for x in (-74, 74):
        c.rect(x - 4, -18, x + 4, 18, (1.0, 0.86, 0.5), r=2)
    return c.to_shape(n, seed=126, edge_boost=0.2)


# ---------------------------------------------------------------- station architecture
@shape("stall")
def _stall(n):
    """Tiko's counter with a canopy and an empty sign board (sign text is a caption)."""
    c = _cv(520, 470)
    c.rect(-220, 80, 220, 96, (0.80, 0.66, 1.0), r=4)          # counter top
    c.rect(-210, 96, 210, 230, (0.42, 0.34, 0.86), r=6)        # counter front
    c.rect(-196, 120, 196, 126, (0.60, 0.48, 1.0))
    c.rect(-212, -150, -200, 80, (0.55, 0.50, 0.95))           # posts
    c.rect(200, -150, 212, 80, (0.55, 0.50, 0.95))
    _frame(c, -232, -226, 232, -150, (0.80, 0.66, 1.0), 5)     # sign board frame
    return c.to_shape(n, seed=131, edge_boost=0.35)


@shape("signboard_tall")
def _sign_tall(n):
    c = _cv(520, 260)
    _frame(c, -232, -120, 232, 120, (0.80, 0.66, 1.0), 5)
    return c.to_shape(n, seed=132, edge_boost=0.3)


@shape("door")
def _door(n):
    c = _cv(220, 340)
    _frame(c, -95, -160, 95, 160, STEEL, 9)
    c.rect(-4, -150, 4, 150, STEEL)
    for x0 in (-70, 20):
        c.line([(x0, -60), (x0 + 40, -120)], GLASS, 3)
        c.line([(x0 + 10, -30), (x0 + 40, -80)], GLASS, 2)
    c.rect(-22, -6, -12, 22, AMBER)
    c.rect(12, -6, 22, 22, AMBER)
    return c.to_shape(n, seed=141, edge_boost=0.3)


@shape("door_open")
def _door_open(n):
    c = _cv(220, 340)
    _frame(c, -95, -160, 95, 160, STEEL, 9)
    c.line([(-86, -150), (-50, -128), (-50, 128), (-86, 150)], GLASS, 3)
    c.line([(86, -150), (50, -128), (50, 128), (86, 150)], GLASS, 3)
    c.rect(-54, -120, -48, 120, STEEL)
    c.rect(48, -120, 54, 120, STEEL)
    return c.to_shape(n, seed=142, edge_boost=0.3)


@shape("bench")
def _bench(n):
    c = _cv(300, 90)
    c.rect(-130, -14, 130, 0, (0.55, 0.60, 1.0), r=3)
    c.rect(-116, 0, -104, 40, (0.45, 0.50, 0.90))
    c.rect(104, 0, 116, 40, (0.45, 0.50, 0.90))
    return c.to_shape(n, seed=143, edge_boost=0.3)


@shape("lowtable")
def _lowtable(n):
    c = _cv(300, 140)
    c.rect(-130, -20, 130, -6, (0.70, 0.72, 1.0), r=3)
    c.rect(-120, -6, -108, 60, (0.50, 0.55, 0.95))
    c.rect(108, -6, 120, 60, (0.50, 0.55, 0.95))
    return c.to_shape(n, seed=144, edge_boost=0.3)


@shape("stairs")
def _stairs(n):
    c = _cv(360, 330)
    pts = [(-170, 160)]
    for i in range(8):
        x = -170 + i * 40
        y = 160 - i * 38
        pts += [(x, y - 38), (x + 40, y - 38)]
    pts += [(150, 160)]
    c.poly(pts, (0.45, 0.48, 0.92))
    c.line([(-170, 120), (150, -190)], STEEL, 5)
    return c.to_shape(n, seed=145, edge_boost=0.4)


@shape("pickup")
def _pickup(n):
    """Box pickup point: counter with shelves of parcels."""
    c = _cv(520, 420)
    c.rect(-230, 80, 230, 96, (0.62, 0.85, 1.0), r=4)
    c.rect(-220, 96, 220, 200, (0.30, 0.55, 0.85), r=6)
    _frame(c, -230, -200, 230, 80, (0.45, 0.62, 0.95), 6)
    for y in (-110, -20):
        c.rect(-224, y, 224, y + 6, (0.45, 0.62, 0.95))
    rng = _rng(5)
    for y in (-110, -20, 80):
        x = -210
        while x < 190:
            w = rng.uniform(40, 80)
            h = rng.uniform(26, 60)
            c.rect(x, y - h, x + w, y - 2, BOXC if rng.random() < 0.6 else BOXD, r=3)
            x += w + rng.uniform(8, 20)
    return c.to_shape(n, seed=146, edge_boost=0.3)


@shape("neighbor_stall")
def _nstall(n):
    c = _cv(440, 380)
    c.rect(-190, 60, 190, 74, (1.0, 0.72, 0.42), r=4)
    c.rect(-180, 74, 180, 190, (0.62, 0.36, 0.70), r=6)
    c.rect(-184, -150, -174, 60, (0.70, 0.50, 0.80))
    c.rect(174, -150, 184, 60, (0.70, 0.50, 0.80))
    c.poly([(-200, -150), (200, -150), (180, -186), (-180, -186)], (1.0, 0.62, 0.40))
    for x in (-120, -40, 40, 120):
        c.rect(x - 26, 20, x + 26, 58, (0.95, 0.80, 0.55), r=4)
    return c.to_shape(n, seed=147, edge_boost=0.3)


@shape("floor")
def _floor(n):
    c = _cv(2400, 30)
    for i in range(0, 2400, 6):
        c.rect(-1200 + i, -1.5, -1200 + i + 3, 1.5, (0.40, 0.42, 0.85))
    return c.to_shape(n, seed=148, edge_boost=0.0, size=0.8)


@shape("upper")
def _upper(n):
    """Upper passage: walkway band, railing and columns (background)."""
    c = _cv(2400, 300)
    c.rect(-1200, 40, 1200, 45, (0.36, 0.38, 0.80))
    c.rect(-1200, -6, 1200, -4, (0.36, 0.40, 0.85))
    for x in range(-1200, 1200, 80):
        c.rect(x, -4, x + 2, 40, (0.30, 0.34, 0.75))
    for x in range(-1000, 1200, 800):
        c.rect(x - 6, 45, x + 6, 150, (0.26, 0.28, 0.64))
    return c.to_shape(n, seed=149, edge_boost=0.1, size=0.85)


@shape("platform_sign")
def _psign(n):
    c = _cv(360, 90)
    c.rect(-160, -30, 160, 30, (0.16, 0.34, 0.62), r=8)
    c.erase_poly([(-154, -24), (154, -24), (154, 24), (-154, 24)])
    c.poly([(116, -14), (144, 0), (116, 14)], CARD)
    return c.to_shape(n, seed=150, edge_boost=0.3)


# ---------------------------------------------------------------- paper, cards, tray, notes
@shape("sheet")
def _sheet(n):
    c = _cv(200, 250)
    c.rect(-84, -110, 84, 110, CARD, r=6)
    return c.to_shape(n, seed=161, edge_boost=0.3)


@shape("card")
def _card(n):
    c = _cv(300, 170)
    c.rect(-130, -70, 130, 70, CARD, r=10)
    c.erase_poly([(-122, -62), (122, -62), (122, 62), (-122, 62)])
    return c.to_shape(n, seed=162, edge_boost=0.25)


@shape("card_small")
def _card_small(n):
    c = _cv(200, 120)
    c.rect(-86, -46, 86, 46, CARD, r=8)
    c.erase_poly([(-80, -40), (80, -40), (80, 40), (-80, 40)])
    return c.to_shape(n, seed=163, edge_boost=0.25)


@shape("tray")
def _tray(n):
    c = _cv(240, 70)
    c.poly([(-100, -16), (100, -16), (86, 18), (-86, 18)], (0.55, 0.60, 0.98))
    c.erase_poly([(-92, -16), (92, -16), (80, 10), (-80, 10)])
    return c.to_shape(n, seed=164, edge_boost=0.3)


@shape("note")
def _note(n):
    c = _cv(130, 90)
    c.rect(-54, -34, 54, 34, (1.0, 0.92, 0.62), r=4)
    for y in (-16, -2, 12):
        c.rect(-40, y, 30, y + 4, (0.70, 0.55, 0.30))
    return c.to_shape(n, seed=165, edge_boost=0.25)


@shape("pencil")
def _pencil(n):
    c = _cv(110, 30)
    c.rect(-44, -4, 30, 4, AMBER)
    c.poly([(30, -4), (46, 0), (30, 4)], CARD)
    return c.to_shape(n, seed=166, edge_boost=0.2)


@shape("check")
def _check(n):
    c = _cv(60, 60)
    c.line([(-18, 0), (-5, 14), (20, -16)], GREEN, 7)
    return c.to_shape(n, seed=167, edge_boost=0.2)


@shape("dash")
def _dash(n):
    c = _cv(60, 60)
    c.line([(-16, 0), (16, 0)], (0.75, 0.78, 1.0), 6)
    return c.to_shape(n, seed=168, edge_boost=0.2)


@shape("price_tag")
def _ptag(n):
    c = _cv(120, 70)
    c.poly([(-50, -24), (36, -24), (52, 0), (36, 24), (-50, 24)], (1.0, 0.86, 0.55))
    c.erase_ellipse(30, 0, 5, 5)
    return c.to_shape(n, seed=169, edge_boost=0.25)


# ---------------------------------------------------------------- other people's loads
@shape("crate")
def _crate(n):
    c = _cv(200, 170)
    c.rect(-84, -66, 84, 66, (0.80, 0.55, 0.38), r=4)
    c.line([(-84, -66), (84, 66)], (0.62, 0.40, 0.28), 6)
    c.line([(84, -66), (-84, 66)], (0.62, 0.40, 0.28), 6)
    return c.to_shape(n, seed=171, edge_boost=0.3)


@shape("suitcase")
def _suitcase(n):
    c = _cv(130, 190)
    c.rect(-48, -60, 48, 74, (0.50, 0.62, 1.0), r=10)
    c.rect(-5, -60, 5, 74, (0.38, 0.48, 0.90))
    c.rect(-16, -86, -10, -60, STEEL)
    c.rect(10, -86, 16, -60, STEEL)
    c.rect(-16, -88, 16, -82, STEEL)
    return c.to_shape(n, seed=172, edge_boost=0.3)


@shape("softbag")
def _softbag(n):
    c = _cv(120, 120)
    c.ellipse(0, 14, 46, 38, (0.85, 0.55, 0.90))
    c.arc(0, -10, 22, 190, 350, (0.95, 0.70, 0.95), 5)
    return c.to_shape(n, seed=173, edge_boost=0.3)


@shape("lightbag")
def _lightbag(n):
    c = _cv(80, 90)
    c.rect(-24, -14, 24, 30, (0.55, 0.85, 0.95), r=4)
    c.arc(0, -14, 13, 180, 360, (0.65, 0.95, 1.0), 4)
    return c.to_shape(n, seed=174, edge_boost=0.3)


@shape("bigbox_l")
def _bigbox(n):
    c = _cv(170, 110)
    c.rect(-76, -42, 76, 42, BOXC, r=3)
    c.rect(-76, -4, 76, 4, BOXD)
    return c.to_shape(n, seed=175, edge_boost=0.3)


# ---------------------------------------------------------------- explanatory objects
@shape("route")
def _route(n):
    """Dashed path: counter → door → onwards, with a door mark (top-view style diagram)."""
    c = _cv(900, 220)
    for i in range(0, 760, 34):
        x = -420 + i
        y = 40 * math.sin(i / 760 * math.pi) * -1
        c.ellipse(x, y, 6, 6, TURQ)
    c.rect(30, -90, 42, 90, STEEL)
    c.rect(30, -90, 70, -82, STEEL)
    return c.to_shape(n, seed=181, edge_boost=0.2)


@shape("strike")
def _strike(n):
    c = _cv(600, 40)
    c.line([(-280, 6), (280, -6)], (1.0, 0.55, 0.50), 6)
    return c.to_shape(n, seed=182, edge_boost=0.2)


@shape("bracket")
def _bracket(n):
    c = _cv(80, 400)
    c.line([(10, -180), (-20, -180), (-20, 180), (10, 180)], (0.75, 0.78, 1.0), 5)
    return c.to_shape(n, seed=183, edge_boost=0.2)


@shape("hline")
def _hline(n):
    c = _cv(520, 20)
    c.rect(-250, -2, 250, 2, (0.75, 0.78, 1.0))
    return c.to_shape(n, seed=184, edge_boost=0.1)


@shape("eye")
def _eye(n):
    c = _cv(120, 70)
    c.ellipse(0, 0, 46, 22, (0.70, 0.90, 1.0))
    c.erase_ellipse(0, 0, 38, 15)
    c.ellipse(0, 0, 11, 11, TURQ)
    return c.to_shape(n, seed=185, edge_boost=0.2)


@shape("hand_icon")
def _hand_icon(n):
    c = _cv(110, 120)
    c.ellipse(0, 18, 30, 30, (1.0, 0.86, 0.75))
    for i, x in enumerate((-22, -8, 6, 20)):
        c.rect(x - 5, -36 + abs(i - 1.5) * 6, x + 5, 12, (1.0, 0.86, 0.75), r=5)
    c.rect(26, 0, 46, 12, (1.0, 0.86, 0.75), r=6)
    return c.to_shape(n, seed=186, edge_boost=0.25)


@shape("question")
def _question(n):
    c = _cv(100, 140)
    c.arc(0, -22, 28, 180, 420, AMBER, 10)
    c.line([(0, 6), (0, 24)], AMBER, 10)
    c.ellipse(0, 46, 7, 7, AMBER)
    return c.to_shape(n, seed=187, edge_boost=0.2)


@shape("service_card")
def _service(n):
    c = _cv(300, 190)
    c.rect(-130, -80, 130, 80, CARD, r=10)
    c.erase_poly([(-122, -72), (122, -72), (122, 72), (-122, 72)])
    c.ellipse(-82, -30, 22, 22, TURQ)
    c.line([(-94, -30), (-84, -20), (-68, -42)], CARD, 4)
    for y in (-40, -20, 20, 40):
        c.rect(-40 if y < 0 else -100, y, 100, y + 6, (0.6, 0.64, 0.9))
    return c.to_shape(n, seed=188, edge_boost=0.25)


@shape("ad_card")
def _ad(n):
    c = _cv(220, 280)
    c.rect(-90, -120, 90, 120, CARD, r=8)
    c.erase_poly([(-82, -112), (82, -112), (82, 112), (-82, 112)])
    c.rect(-64, -90, 64, -64, AMBER, r=4)
    for y in (-40, -22, -4):
        c.rect(-64, y, 50, y + 6, (0.6, 0.64, 0.9))
    c.rect(-64, 60, 20, 90, TURQ, r=6)
    return c.to_shape(n, seed=189, edge_boost=0.25)


@shape("bar")
def _bar(n):
    """Unit bar 100×30 (scale its width with sx: 1 unit of the example = 60 px at sx 0.6)."""
    c = _cv(110, 40)
    c.rect(-50, -15, 50, 15, (1.0, 1.0, 1.0), r=3)
    return c.to_shape(n, seed=191, edge_boost=0.15)


def _dots(k, col):
    c = _cv(760, 70)
    for i in range(k):
        c.ellipse(-330 + i * 60, 0, 20, 20, col)
    return c


@shape("dots12")
def _dots12(n):
    return _dots(12, (0.62, 0.66, 1.0)).to_shape(n, seed=192, edge_boost=0.2)


@shape("dots5")
def _dots5(n):
    return _dots(5, TURQ).to_shape(n, seed=193, edge_boost=0.2)


@shape("dots2")
def _dots2(n):
    return _dots(2, GREEN).to_shape(n, seed=194, edge_boost=0.2)


@shape("ghost_row")
def _ghost_row(n):
    c = _cv(1300, 160)
    for i in range(8):
        x = -560 + i * 160
        _carrier_draw_at(c, x)
    return c.to_shape(n, seed=195, edge_boost=0.25)


def _carrier_draw_at(c, x0):
    c.rect(x0 - 60, 40, x0 + 60, 48, STEEL, r=3)
    c.line([(x0 - 45, 34), (x0 - 48, -10), (x0 - 16, -48), (x0 + 16, -48), (x0 + 48, -10), (x0 + 45, 34)], STRAP, 5)


@shape("bigsign")
def _bigsign(n):
    c = _cv(900, 200)
    _frame(c, -420, -80, 420, 80, (1.0, 0.72, 0.42), 7)
    return c.to_shape(n, seed=196, edge_boost=0.3)
