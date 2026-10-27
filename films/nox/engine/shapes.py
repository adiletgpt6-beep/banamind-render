"""Point-cloud shapes: deterministic sampling of vector drawings into coloured particles.

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


@shape("jar")
def _jar(n):
    """Glass vessel outline (k = height for content level is handled by Jar actor)."""
    c = _cv(220, 280)
    body = [(-80, -95), (80, -95), (92, -60), (92, 115), (80, 130), (-80, 130), (-92, 115), (-92, -60)]
    c.poly(body, (0.55, 0.85, 1.0))
    c.erase_poly([(-80, -85), (80, -85), (84, -58), (84, 112), (74, 122), (-74, 122), (-84, 112), (-84, -58)])
    c.rect(-58, -125, 58, -95, (0.55, 0.85, 1.0))
    c.erase_poly([(-50, -118), (50, -118), (50, -96), (-50, -96)])
    c.rect(-70, -132, 70, -122, (0.62, 0.9, 1.0), r=4)
    return c.to_shape(n, seed=11, edge_boost=0.2, size=0.85)


@shape("jar_fill")
def _jar_fill(n):
    c = _cv(220, 280)
    c.poly([(-78, -82), (78, -82), (82, -57), (82, 110), (72, 120), (-72, 120), (-82, 110), (-82, -57)], AMBER)
    s = c.to_shape(n, seed=12, edge_boost=0.0, size=0.95, keymode="y", jitter_col=0.1)
    # warm gradient amber->gold, with some turquoise sparks
    rng = _rng(3)
    mix = rng.random(n) < 0.12
    s["c"][mix] = np.array(TURQ, np.float32)
    return s


@shape("box")
def _box(n):
    """Closed box with circular lock on the front (lock drawn by separate shape)."""
    c = _cv(300, 240)
    c.rect(-130, -60, 130, 100, (0.62, 0.42, 1.0), r=10)
    c.poly([(-140, -95), (140, -95), (130, -58), (-130, -58)], (0.75, 0.55, 1.0))
    c.rect(-130, -64, 130, -56, (1.0, 0.82, 0.4))
    c.erase_ellipse(0, 22, 48, 48)
    return c.to_shape(n, seed=21, edge_boost=0.3)


@shape("lock")
def _lock(n):
    c = _cv(120, 120)
    c.arc(0, 0, 40, -90, 220, GOLD, 9)
    for a in range(0, 360, 30):
        x, y = 30 * math.cos(math.radians(a)), 30 * math.sin(math.radians(a))
        c.ellipse(x, y, 2.6, 2.6, (1.0, 0.9, 0.6))
    c.ellipse(0, 0, 6, 6, (1.0, 0.95, 0.75))
    return c.to_shape(n, seed=22, edge_boost=0.2, size=0.9)


@shape("clockface")
def _clockface(n):
    c = _cv(120, 120)
    c.arc(0, 0, 40, 0, 360, TURQ, 7)
    for a in range(0, 360, 30):
        r0 = 30
        x, y = r0 * math.cos(math.radians(a)), r0 * math.sin(math.radians(a))
        c.ellipse(x, y, 3, 3, WHITE)
    c.line([(0, 0), (0, -26)], GOLD, 5)
    c.line([(0, 0), (18, 8)], GOLD, 5)
    return c.to_shape(n, seed=23, edge_boost=0.2, size=0.9)


@shape("tower")
def _tower(n):
    c = _cv(200, 620)
    for i in range(9):
        y0 = 290 - i * 62
        w = 74 - i * 5
        c.rect(-w, y0 - 54, w, y0, GOLD if i % 2 == 0 else AMBER, r=4)
        for j in range(-1, 2):
            c.rect(j * w * 0.55 - 7, y0 - 40, j * w * 0.55 + 7, y0 - 18, (1.0, 0.95, 0.75))
    c.poly([(-30, -268), (30, -268), (0, -305)], (1.0, 0.95, 0.6))
    return c.to_shape(n, seed=31, edge_boost=0.35, keymode="y")


@shape("compass")
def _compass(n):
    c = _cv(240, 240)
    c.arc(0, 0, 100, 0, 360, (0.55, 0.85, 1.0), 10)
    for a in range(0, 360, 45):
        r0, r1 = 80, 92
        c.line([(r0 * math.cos(math.radians(a)), r0 * math.sin(math.radians(a))),
                (r1 * math.cos(math.radians(a)), r1 * math.sin(math.radians(a)))], WHITE, 4)
    c.poly([(0, -78), (16, 0), (-16, 0)], AMBER)
    c.poly([(0, 78), (16, 0), (-16, 0)], (0.55, 0.6, 1.0))
    c.ellipse(0, 0, 9, 9, WHITE)
    return c.to_shape(n, seed=41, edge_boost=0.3)


@shape("arrow")
def _arrow(n):
    c = _cv(260, 80)
    c.line([(-110, 0), (70, 0)], TURQ, 14)
    c.poly([(60, -32), (118, 0), (60, 32)], TURQ)
    return c.to_shape(n, seed=42, edge_boost=0.3)


@shape("bridge")
def _bridge(n):
    c = _cv(900, 300)
    pts = [(x, -40 + 0.00025 * x * x * 0.0) for x in np.linspace(-420, 420, 50)]
    c.line(pts, TURQ, 16)
    c.line([(x, -78 + 0.00016 * x * x) for x in np.linspace(-420, 420, 50)], (0.55, 0.85, 1.0), 6)
    for x in np.linspace(-360, 360, 9):
        c.line([(x, -78 + 0.00016 * x * x), (x, -40)], (0.55, 0.85, 1.0), 4)
    for x in (-300, -100, 100, 300):  # pillars (spare supports)
        c.poly([(x - 18, -32), (x + 18, -32), (x + 26, 130), (x - 26, 130)], BLUE)
        c.rect(x - 30, 125, x + 30, 140, VIOLET)
    return c.to_shape(n, seed=51, edge_boost=0.3, keymode="x")


@shape("wallet_s")
def _wallet_s(n):
    c = _cv(200, 160)
    c.rect(-55, -38, 55, 38, (0.85, 0.45, 0.85), r=10)
    c.rect(10, -14, 60, 14, (0.95, 0.6, 0.95), r=6)
    c.erase_ellipse(30, 0, 5, 5)
    return c.to_shape(n, seed=61)


@shape("wallet_l")
def _wallet_l(n):
    c = _cv(420, 300)
    c.rect(-170, -110, 170, 110, (0.85, 0.45, 0.85), r=22)
    c.rect(40, -40, 185, 40, (0.95, 0.6, 0.95), r=14)
    c.erase_ellipse(100, 0, 13, 13)
    c.erase_poly([(-150, -88), (20, -88), (20, 88), (-150, 88)])  # empty inside
    c.rect(-150, -88, 20, -76, (0.85, 0.45, 0.85))
    return c.to_shape(n, seed=62)


@shape("treadmill")
def _treadmill(n):
    c = _cv(700, 260)
    c.poly([(-300, 60), (300, 60), (320, 90), (-320, 90)], (0.55, 0.6, 1.0))
    for x in (-310, 310):
        c.ellipse(x, 75, 22, 22, BLUE)
    c.line([(250, 60), (290, -110)], (0.55, 0.85, 1.0), 10)
    c.rect(255, -130, 330, -105, TURQ, r=6)
    for x in np.linspace(-280, 230, 18):
        c.rect(x - 4, 62, x + 4, 70, WHITE)
    return c.to_shape(n, seed=71, keymode="x")


@shape("book")
def _book(n):
    c = _cv(260, 180)
    c.poly([(-120, -60), (-6, -50), (-6, 70), (-120, 60)], (0.7, 0.75, 1.0))
    c.poly([(6, -50), (120, -60), (120, 60), (6, 70)], (0.6, 0.65, 1.0))
    for i in range(5):
        y = -30 + i * 18
        c.line([(-100, y), (-24, y + 6)], WHITE, 3)
        c.line([(24, y + 6), (100, y)], WHITE, 3)
    return c.to_shape(n, seed=81)


@shape("lamp")
def _lamp(n):
    c = _cv(260, 320)
    c.rect(-80, 120, 80, 140, (0.6, 0.65, 1.0), r=6)
    c.line([(0, 120), (-20, 10), (40, -60)], (0.55, 0.85, 1.0), 10)
    c.poly([(10, -110), (110, -60), (80, -20), (-10, -70)], AMBER)
    c.ellipse(-20, 10, 12, 12, WHITE)
    return c.to_shape(n, seed=91)


@shape("gear")
def _gear(n):
    c = _cv(240, 240)
    pts = []
    for i in range(48):
        a = i / 48 * 2 * math.pi
        r = 100 if (i // 3) % 2 == 0 else 82
        pts.append((r * math.cos(a), r * math.sin(a)))
    c.poly(pts, AMBER)
    c.erase_ellipse(0, 0, 50, 50)
    c.ellipse(0, 0, 16, 16, GOLD)
    for a in range(0, 360, 60):
        c.line([(0, 0), (50 * math.cos(math.radians(a)), 50 * math.sin(math.radians(a)))], GOLD, 8)
    return c.to_shape(n, seed=101)


@shape("sprout")
def _sprout(n):
    c = _cv(220, 260)
    c.rect(-70, 80, 70, 120, (0.6, 0.4, 0.9), r=8)
    c.line([(0, 80), (0, -40)], GREEN, 9)
    c.poly([(0, -30), (-70, -80), (-90, -50), (-30, -10)], GREEN)
    c.poly([(0, -50), (60, -110), (85, -80), (20, -30)], (0.5, 0.95, 0.6))
    return c.to_shape(n, seed=111)


@shape("chain")
def _chain(n):
    c = _cv(700, 120)
    for i in range(7):
        x = -270 + i * 90
        if i % 2 == 0:
            c.ellipse(x, 0, 52, 30, AMBER)
            c.erase_ellipse(x, 0, 38, 17)
        else:
            c.ellipse(x, 0, 52, 14, GOLD)
            c.erase_ellipse(x, 0, 40, 5)
    return c.to_shape(n, seed=121, keymode="x")


@shape("link")
def _link(n):
    c = _cv(140, 100)
    c.ellipse(0, 0, 52, 30, AMBER)
    c.erase_ellipse(0, 0, 38, 17)
    return c.to_shape(n, seed=122)


@shape("window")
def _window(n):
    c = _cv(260, 220)
    c.rect(-110, -90, 110, 90, (1.0, 0.78, 0.4), r=10)
    c.erase_poly([(-96, -76), (96, -76), (96, 76), (-96, 76)])
    c.rect(-96, -76, 96, 76, (1.0, 0.72, 0.35), a=255)
    c.rect(-4, -76, 4, 76, (0.6, 0.45, 0.9))
    c.rect(-96, -4, 96, 4, (0.6, 0.45, 0.9))
    return c.to_shape(n, seed=131)


@shape("house")
def _house(n):
    c = _cv(260, 300)
    c.poly([(-110, -40), (0, -130), (110, -40)], VIOLET)
    c.rect(-95, -40, 95, 130, BLUE)
    c.erase_poly([(-60, 0), (-15, 0), (-15, 50), (-60, 50)])
    c.erase_poly([(15, 0), (60, 0), (60, 50), (15, 50)])
    c.rect(-60, 0, -15, 50, (1.0, 0.75, 0.4))
    c.rect(15, 0, 60, 50, (1.0, 0.75, 0.4))
    return c.to_shape(n, seed=141)


@shape("signpost")
def _signpost(n):
    c = _cv(420, 420)
    c.line([(0, 190), (0, -170)], (0.55, 0.6, 1.0), 14)
    c.poly([(-10, -160), (170, -160), (200, -130), (170, -100), (-10, -100)], PINK)
    c.poly([(10, -80), (-170, -80), (-200, -50), (-170, -20), (10, -20)], AMBER)
    c.poly([(-10, 0), (150, 0), (180, 30), (150, 60), (-10, 60)], TURQ)
    return c.to_shape(n, seed=151)


@shape("bigsign")
def _bigsign(n):
    c = _cv(900, 420)
    c.rect(-400, -170, 400, 110, PINK, r=26)
    c.erase_poly([(-380, -150), (380, -150), (380, 90), (-380, 90)])
    c.line([(-200, 110), (-200, 200)], (0.55, 0.6, 1.0), 16)
    c.line([(200, 110), (200, 200)], (0.55, 0.6, 1.0), 16)
    for x in np.linspace(-370, 370, 22):
        c.ellipse(x, -160, 7, 7, GOLD)
        c.ellipse(x, 100, 7, 7, GOLD)
    return c.to_shape(n, seed=161, keymode="x")


@shape("machine_front")
def _machine_front(n):
    """Shiny promise construction (front facade)."""
    c = _cv(520, 520)
    c.poly([(-200, 220), (200, 220), (160, -120), (0, -230), (-160, -120)], (1.0, 0.75, 0.35))
    c.erase_poly([(-150, 190), (150, 190), (120, -100), (0, -190), (-120, -100)])
    for i in range(6):
        r = 30 + i * 22
        c.arc(0, 40, r, 200, 340, PINK if i % 2 else GOLD, 6)
    c.ellipse(0, 40, 26, 26, WHITE)
    return c.to_shape(n, seed=171)


@shape("machine_back")
def _machine_back(n):
    """The same construction seen from the side: thin facade, nothing behind."""
    c = _cv(520, 520)
    c.poly([(-12, 220), (12, 220), (12, -230), (-12, -230)], (1.0, 0.75, 0.35))
    c.line([(12, 200), (160, 210)], (0.55, 0.6, 1.0), 6)
    c.line([(12, -150), (140, 205)], (0.55, 0.6, 1.0), 5)
    for k in range(10):
        c.ellipse(40 + k * 12, -60 + k * 25, 6, 6, (1.0, 0.95, 0.7))  # just bulbs
    return c.to_shape(n, seed=172)


@shape("anvil")  # main workshop machine (lathe-like)
def _anvil(n):
    c = _cv(520, 300)
    c.rect(-230, 40, 230, 70, BLUE, r=8)
    c.rect(-200, 70, -170, 140, VIOLET)
    c.rect(170, 70, 200, 140, VIOLET)
    c.rect(-210, -60, -110, 40, (0.55, 0.6, 1.0), r=8)
    c.rect(110, -40, 190, 40, (0.55, 0.6, 1.0), r=8)
    c.line([(-110, -10), (110, -10)], WHITE, 8)
    c.ellipse(-160, -10, 36, 36, TURQ)
    c.erase_ellipse(-160, -10, 16, 16)
    return c.to_shape(n, seed=181)


@shape("calendar")
def _calendar(n):
    c = _cv(520, 380)
    c.rect(-240, -170, 240, 170, (0.55, 0.6, 1.0), r=16)
    c.erase_poly([(-224, -110), (224, -110), (224, 154), (-224, 154)])
    c.rect(-240, -170, 240, -110, PINK, r=16)
    for r_ in range(4):
        for col in range(7):
            x = -196 + col * 65
            y = -78 + r_ * 62
            c.rect(x - 22, y - 20, x + 22, y + 20, (0.75, 0.8, 1.0), r=6)
    return c.to_shape(n, seed=191, keymode="x")


@shape("notebook")
def _notebook(n):
    c = _cv(420, 520)
    c.rect(-180, -230, 180, 230, (0.85, 0.88, 1.0), r=14)
    c.erase_poly([(-160, -210), (160, -210), (160, 210), (-160, 210)])
    for i in range(12):
        y = -180 + i * 32
        c.line([(-130, y), (130, y)], (0.6, 0.65, 1.0), 3)
    for i in range(8):
        c.ellipse(-180, -190 + i * 54, 10, 10, (0.95, 0.75, 0.4))
    return c.to_shape(n, seed=201)


@shape("card")
def _card(n):
    c = _cv(300, 200)
    c.rect(-130, -80, 130, 80, (0.75, 0.8, 1.0), r=12)
    c.erase_poly([(-120, -70), (120, -70), (120, 70), (-120, 70)])
    return c.to_shape(n, seed=211)


@shape("question")
def _question(n):
    c = _cv(200, 280)
    c.arc(0, -50, 55, 180, 405, PINK, 26)
    c.line([(38, -10), (0, 30), (0, 60)], PINK, 26)
    c.ellipse(0, 110, 18, 18, PINK)
    return c.to_shape(n, seed=221)


@shape("heart")
def _heart(n):
    c = _cv(220, 200)
    pts = []
    for t in np.linspace(0, 2 * math.pi, 120):
        x = 16 * math.sin(t) ** 3
        y = -(13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t))
        pts.append((x * 5.5, y * 5.5))
    c.poly(pts, PINK)
    return c.to_shape(n, seed=231)


@shape("dot")
def _dot(n):
    c = _cv(40, 40)
    c.ellipse(0, 0, 6, 6, WHITE)
    return c.to_shape(n, seed=241, edge_boost=0)


@shape("cloud")
def _cloud(n):
    c = _cv(300, 160)
    for x, y, r in ((-70, 10, 50), (0, -20, 65), (70, 10, 50), (0, 25, 55)):
        c.ellipse(x, y, r, r * 0.8, (0.6, 0.65, 0.95))
    return c.to_shape(n, seed=251)


@shape("hourglass")
def _hourglass(n):
    c = _cv(160, 240)
    c.rect(-70, -110, 70, -96, VIOLET, r=4)
    c.rect(-70, 96, 70, 110, VIOLET, r=4)
    c.poly([(-58, -96), (58, -96), (6, 0), (58, 96), (-58, 96), (-6, 0)], (0.6, 0.85, 1.0))
    c.erase_poly([(-46, -88), (46, -88), (2, 0), (46, 88), (-46, 88), (-2, 0)])
    c.poly([(-30, 88), (30, 88), (0, 50)], AMBER)
    return c.to_shape(n, seed=261)


@shape("person")
def _person(n):
    """Simple townsfolk silhouette (not the hero)."""
    c = _cv(160, 340)
    c.ellipse(0, -120, 34, 36, (0.6, 0.62, 1.0))
    c.poly([(-50, -70), (50, -70), (62, 60), (-62, 60)], (0.5, 0.55, 0.95))
    c.rect(-40, 60, -10, 160, (0.45, 0.5, 0.9))
    c.rect(10, 60, 40, 160, (0.45, 0.5, 0.9))
    return c.to_shape(n, seed=271)


@shape("person2")
def _person2(n):
    c = _cv(160, 340)
    c.ellipse(0, -120, 32, 34, (0.95, 0.55, 0.8))
    c.poly([(-44, -72), (44, -72), (78, 150), (-78, 150)], (0.85, 0.45, 0.75))
    return c.to_shape(n, seed=272)


@shape("armchair")
def _armchair(n):
    c = _cv(240, 220)
    c.rect(-90, -90, 90, 30, PINK, r=24)
    c.rect(-110, 0, 110, 60, (0.9, 0.35, 0.75), r=18)
    c.rect(-100, 60, -84, 100, VIOLET)
    c.rect(84, 60, 100, 100, VIOLET)
    return c.to_shape(n, seed=281)


@shape("toolset")
def _toolset(n):
    c = _cv(260, 160)
    c.rect(-110, -20, 110, 60, (0.55, 0.6, 1.0), r=10)
    c.line([(-80, -20), (-80, -60), (80, -60), (80, -20)], WHITE, 7)
    c.line([(-60, 10), (40, 10)], GOLD, 8)
    c.line([(-50, 34), (60, 34)], TURQ, 8)
    return c.to_shape(n, seed=291)


@shape("box_open")
def _box_open(n):
    c = _cv(300, 260)
    c.rect(-130, -40, 130, 120, (0.62, 0.42, 1.0), r=10)
    c.poly([(-130, -42), (130, -42), (150, -150), (-110, -160)], (0.75, 0.55, 1.0))
    c.erase_poly([(-110, -20), (110, -20), (110, 100), (-110, 100)])
    return c.to_shape(n, seed=301)


@shape("scales")
def _scales(n):
    c = _cv(420, 300)
    c.line([(0, 130), (0, -100)], (0.55, 0.6, 1.0), 10)
    c.line([(-160, -90), (160, -90)], (0.55, 0.85, 1.0), 8)
    for x in (-160, 160):
        c.line([(x, -90), (x - 50, 0)], WHITE, 3)
        c.line([(x, -90), (x + 50, 0)], WHITE, 3)
        c.arc(x, 0, 55, 0, 180, TURQ if x < 0 else AMBER, 8)
    c.rect(-60, 125, 60, 140, VIOLET, r=4)
    return c.to_shape(n, seed=311)


@shape("bulb")
def _bulb(n):
    c = _cv(140, 200)
    c.ellipse(0, -20, 52, 56, GOLD)
    c.rect(-24, 30, 24, 70, (0.6, 0.65, 1.0), r=4)
    return c.to_shape(n, seed=321)


@shape("shelf")
def _shelf(n):
    c = _cv(900, 520)
    for i in range(4):
        y = -200 + i * 130
        c.rect(-400, y, 400, y + 12, (0.55, 0.6, 1.0))
        x = -380
        k = 0
        while x < 370:
            w = 18 + (k * 7) % 14
            h = 70 + (k * 13) % 40
            col = (BLUE, TURQ, VIOLET, AMBER, PINK, GREEN)[(k + i) % 6]
            c.rect(x, y - h, x + w, y - 2, col, r=3)
            x += w + 6
            k += 1
    return c.to_shape(n, seed=331, keymode="y")


@shape("mixture")
def _mixture(n):
    """Ring of three objects used for the 'system' diagram fallback."""
    c = _cv(200, 200)
    c.arc(0, 0, 80, 0, 360, WHITE, 6)
    return c.to_shape(n, seed=341)


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


@shape("timearc")
def _timearc(n):
    """Month arc behind the hero: 30 small day ticks on a wide arc."""
    c = _cv(900, 480)
    c.arc(0, 200, 400, 200, 340, (0.55, 0.62, 1.0), 5)
    for i in range(31):
        a = math.radians(200 + i * (140 / 30))
        x, y = 400 * math.cos(a), 200 + 400 * math.sin(a)
        r = 6 if i % 7 == 0 else 3.5
        c.ellipse(x, y - 18, r, r, TURQ if i % 7 == 0 else (0.7, 0.75, 1.0))
    return c.to_shape(n, seed=351, edge_boost=0.1, keymode="x")


@shape("binbox")
def _binbox(n):
    """Open container outline (category bin) 260 x 300."""
    c = _cv(300, 340)
    c.line([(-130, -150), (-130, 150), (130, 150), (130, -150)], (0.55, 0.62, 1.0), 6)
    c.rect(-140, 150, 140, 162, (0.6, 0.66, 1.0), r=4)
    return c.to_shape(n, seed=361, edge_boost=0.1)


@shape("vitrine")
def _vitrine(n):
    c = _cv(520, 420)
    c.rect(-240, -190, 240, 190, PINK, r=14)
    c.erase_poly([(-224, -150), (224, -150), (224, 174), (-224, 174)])
    c.rect(-250, -200, 250, -150, (0.95, 0.4, 0.8), r=12)
    for x in np.linspace(-220, 220, 12):
        c.ellipse(x, -175, 5, 5, GOLD)
    c.rect(-224, 120, 224, 130, (0.7, 0.4, 0.9))
    return c.to_shape(n, seed=371, edge_boost=0.2)


@shape("plank")
def _plank(n):
    c = _cv(520, 40)
    c.rect(-250, -8, 250, 8, (0.55, 0.6, 1.0), r=4)
    return c.to_shape(n, seed=381, edge_boost=0.1)


@shape("ground")
def _ground(n):
    c = _cv(1800, 30)
    c.rect(-880, -3, 880, 3, (0.45, 0.5, 0.95))
    return c.to_shape(n, seed=391, edge_boost=0.0, size=0.8)


@shape("room")
def _room(n):
    """Small room made of three stacked light layers (walls + roof) — the reserve."""
    c = _cv(420, 360)
    c.rect(-170, 40, 170, 160, AMBER)
    c.rect(-170, -70, 170, 36, GOLD)
    c.rect(-170, -170, 170, -74, (1.0, 0.9, 0.55))
    c.erase_poly([(-60, 30), (60, 30), (60, 160), (-60, 160)])
    c.erase_poly([(-120, -140), (-60, -140), (-60, -95), (-120, -95)])
    c.erase_poly([(60, -140), (120, -140), (120, -95), (60, -95)])
    return c.to_shape(n, seed=401, keymode="y")


@shape("doorway")
def _doorway(n):
    c = _cv(300, 360)
    c.rect(-120, -160, 120, 160, (1.0, 0.85, 0.55), r=10)
    c.erase_poly([(-100, -140), (100, -140), (100, 160), (-100, 160)])
    return c.to_shape(n, seed=402)


@shape("workbench")
def _workbench(n):
    c = _cv(560, 220)
    c.rect(-260, -20, 260, 4, (0.55, 0.6, 1.0), r=6)
    c.rect(-240, 4, -220, 100, (0.45, 0.5, 0.92))
    c.rect(220, 4, 240, 100, (0.45, 0.5, 0.92))
    return c.to_shape(n, seed=411)


@shape("arrows_all")
def _arrows_all(n):
    c = _cv(700, 700)
    for k in range(12):
        a = math.radians(k * 30 + 8)
        x0, y0 = 70 * math.cos(a), 70 * math.sin(a)
        x1, y1 = 290 * math.cos(a), 290 * math.sin(a)
        col = (AMBER, TURQ, PINK, BLUE, GREEN, VIOLET)[k % 6]
        c.line([(x0, y0), (x1, y1)], col, 9)
        ah = [(x1 + 26 * math.cos(a), y1 + 26 * math.sin(a)),
              (x1 + 18 * math.cos(a + 2.2), y1 + 18 * math.sin(a + 2.2)),
              (x1 + 18 * math.cos(a - 2.2), y1 + 18 * math.sin(a - 2.2))]
        c.poly(ah, col)
    return c.to_shape(n, seed=421)


@shape("road")
def _road(n):
    c = _cv(900, 300)
    c.poly([(-60, 140), (60, 140), (30, -130), (-30, -130)], (0.55, 0.6, 1.0))
    c.erase_poly([(-44, 130), (44, 130), (20, -120), (-20, -120)])
    for y in range(-110, 140, 40):
        c.rect(-3, y, 3, y + 20, GOLD)
    return c.to_shape(n, seed=431)


@shape("finishline")
def _finishline(n):
    c = _cv(600, 120)
    for i in range(20):
        for j in range(2):
            if (i + j) % 2 == 0:
                c.rect(-290 + i * 29, -28 + j * 28, -290 + i * 29 + 29, -28 + j * 28 + 28, WHITE)
    return c.to_shape(n, seed=441, keymode="x")


@shape("broken")
def _broken(n):
    """Workshop machine broken in two halves with sparks."""
    c = _cv(520, 300)
    c.poly([(-230, 40), (-10, 40), (-30, 70), (-230, 70)], BLUE)
    c.poly([(10, 50), (230, 40), (230, 70), (0, 80)], BLUE)
    c.rect(-200, 70, -170, 140, VIOLET)
    c.rect(170, 70, 200, 140, VIOLET)
    c.rect(-210, -60, -110, 40, (0.55, 0.6, 1.0), r=8)
    c.rect(110, -30, 190, 50, (0.55, 0.6, 1.0), r=8)
    c.line([(-110, -10), (-20, 10)], WHITE, 8)
    c.line([(30, 30), (110, 10)], WHITE, 8)
    for k in range(7):
        a = math.radians(-150 + k * 20)
        c.line([(0, 30), (60 * math.cos(a), 30 + 60 * math.sin(a))], GOLD, 3)
    return c.to_shape(n, seed=451)


@shape("cards3")
def _cards3(n):
    c = _cv(1200, 240)
    for x in (-400, 0, 400):
        c.rect(x - 170, -100, x + 170, 100, (0.75, 0.8, 1.0), r=16)
        c.erase_poly([(x - 158, -88), (x + 158, -88), (x + 158, 88), (x - 158, 88)])
    return c.to_shape(n, seed=461, keymode="x")


@shape("library")
def _library(n):
    return _shelf(n)


@shape("plans2")
def _plans2(n):
    """Two streams of blueprint sheets."""
    c = _cv(700, 260)
    for k in range(5):
        x = -300 + k * 60
        c.rect(x - 40, -60 + k * 10, x + 40, 40 + k * 10, (0.5, 0.75, 1.0), r=4)
        c.erase_poly([(x - 34, -54 + k * 10), (x + 34, -54 + k * 10), (x + 34, 34 + k * 10), (x - 34, 34 + k * 10)])
        x2 = 300 - k * 60
        c.rect(x2 - 40, -60 + k * 10, x2 + 40, 40 + k * 10, (1.0, 0.75, 0.45), r=4)
        c.erase_poly([(x2 - 34, -54 + k * 10), (x2 + 34, -54 + k * 10), (x2 + 34, 34 + k * 10), (x2 - 34, 34 + k * 10)])
    return c.to_shape(n, seed=471)


@shape("lamp_lit")
def _lamp_lit(n):
    c = _cv(420, 360)
    c.rect(-80, 140, 80, 160, (0.6, 0.65, 1.0), r=6)
    c.line([(0, 140), (-20, 30), (40, -40)], (0.55, 0.85, 1.0), 10)
    c.poly([(10, -90), (110, -40), (80, 0), (-10, -50)], GOLD)
    c.poly([(80, 0), (110, -40), (200, 60), (150, 110)], (1.0, 0.9, 0.55), a=255)
    c.ellipse(-20, 30, 12, 12, WHITE)
    return c.to_shape(n, seed=481)


@shape("wheel")
def _wheel(n):
    return _gear(n)


@shape("clocktower")
def _clocktower(n):
    c = _cv(300, 440)
    c.rect(-90, -60, 90, 200, BLUE, r=8)
    c.poly([(-110, -60), (110, -60), (0, -200)], VIOLET)
    c.ellipse(0, 40, 64, 64, (0.9, 0.92, 1.0))
    c.erase_ellipse(0, 40, 54, 54)
    c.line([(0, 40), (0, -2)], GOLD, 7)
    c.line([(0, 40), (32, 52)], GOLD, 7)
    return c.to_shape(n, seed=491)


@shape("forks3")
def _forks3(n):
    """Three roads from one point."""
    c = _cv(1100, 520)
    c.line([(0, 240), (0, 120)], (0.6, 0.66, 1.0), 16)
    c.line([(0, 120), (-380, -200)], RED, 14)
    c.line([(0, 120), (0, -220)], (0.6, 0.62, 0.8), 14)
    c.line([(0, 120), (380, -200)], TURQ, 14)
    return c.to_shape(n, seed=501)


@shape("weeks")
def _weeks(n):
    c = _cv(1400, 200)
    for i in range(12):
        x = -650 + i * 118
        c.rect(x - 46, -46, x + 46, 46, (0.6, 0.68, 1.0), r=10)
        c.erase_poly([(x - 38, -38), (x + 38, -38), (x + 38, 38), (x - 38, 38)])
        k = min(1, (i + 1) / 12)
        c.rect(x - 30, 30 - 60 * k, x + 30, 30, AMBER if i % 2 else GOLD, r=6)
    return c.to_shape(n, seed=511, keymode="x")


@shape("windows6")
def _windows6(n):
    c = _cv(1300, 600)
    for r in range(2):
        for k in range(3):
            x = -420 + k * 420
            y = -140 + r * 280
            c.rect(x - 150, y - 110, x + 150, y + 110, (0.55, 0.6, 1.0), r=10)
            c.rect(x - 136, y - 96, x + 136, y + 96, (1.0, 0.76, 0.4) if (r + k) % 2 == 0 else (0.95, 0.6, 0.85))
    return c.to_shape(n, seed=521, keymode="x")


@shape("facade")
def _facade(n):
    c = _cv(520, 640)
    c.rect(-200, -260, 200, 300, GOLD, r=8)
    for r in range(5):
        for k in range(3):
            c.rect(-150 + k * 110, -220 + r * 100, -100 + k * 110, -160 + r * 100, (1.0, 0.95, 0.75))
    return c.to_shape(n, seed=531)


@shape("zones3")
def _zones3(n):
    c = _cv(1300, 420)
    for k, col in enumerate((AMBER, TURQ, VIOLET)):
        x = -420 + k * 420
        c.ellipse(x, 0, 170, 170, col)
        c.erase_ellipse(x, 0, 156, 156)
    return c.to_shape(n, seed=541, keymode="x")


@shape("system")
def _system(n):
    """Loop of arrows connecting three stations (compass top, jar right, bridge left)."""
    c = _cv(1100, 760)
    pts = [(0, -260), (330, 190), (-330, 190)]
    for i in range(3):
        a, b = pts[i], pts[(i + 1) % 3]
        mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
        c.line([(a[0] * 0.7 + mx * 0.3, a[1] * 0.7 + my * 0.3), (b[0] * 0.7 + mx * 0.3, b[1] * 0.7 + my * 0.3)],
               (0.6, 0.7, 1.0), 6)
    return c.to_shape(n, seed=551)


@shape("pagelines")
def _pagelines(n):
    return _notebook(n)


@shape("week7")
def _week7(n):
    c = _cv(1500, 220)
    for i in range(7):
        x = -630 + i * 210
        c.rect(x - 90, -90, x + 90, 90, (0.62, 0.68, 1.0), r=14)
        c.erase_poly([(x - 80, -80), (x + 80, -80), (x + 80, 80), (x - 80, 80)])
    return c.to_shape(n, seed=561, keymode="x")


@shape("freewindow")
def _freewindow(n):
    """Window into a free evening: warm window, workshop, two figures and a moon."""
    c = _cv(760, 520)
    c.rect(-340, -230, 340, 230, (1.0, 0.8, 0.45), r=18)
    c.erase_poly([(-322, -212), (322, -212), (322, 212), (-322, 212)])
    c.rect(-322, 130, 322, 212, (0.55, 0.45, 0.95))
    c.ellipse(230, -130, 40, 40, (1.0, 0.95, 0.8))
    c.erase_ellipse(248, -140, 34, 34)
    for x, col in ((-140, AMBER), (-50, PINK), (40, TURQ)):
        c.ellipse(x, 30, 26, 28, col)
        c.poly([(x - 34, 62), (x + 34, 62), (x + 44, 130), (x - 44, 130)], col)
    c.rect(150, 40, 290, 130, (0.55, 0.62, 1.0), r=6)
    c.poly([(170, 40), (270, 40), (220, -10)], GOLD)
    return c.to_shape(n, seed=571)
