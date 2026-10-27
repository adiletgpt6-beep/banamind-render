"""TB-003 stage: all actors, captions, global tracks (camera, light mode, bloom) and sound cues,
plus small authoring helpers shared by the scene scripts (adapted from the TB-001 engine)."""
import math

import numpy as np

import film
import shapes
import text
from film import Track


class Stage:
    def __init__(self, timing):
        self.T = timing
        self.actors = []
        self.captions = []
        self.cam = Track({"cx": 960.0, "cy": 540.0, "z": 1.0})
        self.look = Track({"light": 0.0, "bloom": 0.4, "halo": 0.24, "grid": 1.0, "tint_k": 0.22,
                           "tint": (0.25, 0.2, 0.6), "fade": 1.0, "dust": 1.0})
        self.sfx = []
        self.dust = film.Dust()
        self.markers = []   # (t, label) for QA / storyboard
        self._sorted = None

    def add(self, a):
        self.actors.append(a)
        self._sorted = None
        return a

    def cap(self, t0, t1, s, x, y, style="label", **kw):
        c = text.Caption(t0, t1, s, x, y, style, **kw)
        self.captions.append(c)
        return c

    def sound(self, t, kind, gain=1.0):
        self.sfx.append((float(t), kind, float(gain)))

    def light(self, t0, t1, d=1.5):
        """A light explanatory composition between t0 and t1 (gradual transitions, no flash)."""
        self.look.key(t0, d, light=1.0, bloom=0.12, dust=0.3)
        self.look.key(t1, d, light=0.0, bloom=0.4, dust=1.0)

    def mark(self, t, label):
        self.markers.append((float(t), label))

    # --------------------------------------------------------------- frame
    def frame(self, T):
        cam = self.cam.at(T)
        look = self.look.at(T)
        parts = []
        d = self.dust.emit(T, (cam["cx"], cam["cy"], cam["z"]))
        if d is not None and look["dust"] > 0.01:
            d[:, 6] *= look["dust"] * (1 - 0.7 * look["light"])
            parts.append(d)
        world = []
        if self._sorted is None:
            self._sorted = sorted(self.actors, key=lambda a: a.layer)
        for a in self._sorted:
            if T < a.t_on or T > a.t_off:
                continue
            e = a.emit(T)
            if e is not None and len(e):
                world.append(e)
        if world:
            wp = np.concatenate(world)
            z = cam["z"]
            wp[:, 0] = (wp[:, 0] - cam["cx"]) * z + 960
            wp[:, 1] = (wp[:, 1] - cam["cy"]) * z + 540
            wp[:, 2] *= np.clip(0.75 + 0.25 * z, 0.8, 1.5)
            m = (wp[:, 0] > -30) & (wp[:, 0] < 1950) & (wp[:, 1] > -30) & (wp[:, 1] < 1110)
            parts.append(wp[m])
        pts = np.concatenate(parts).astype(np.float32) if parts else None
        if pts is not None and look["fade"] < 1:
            pts[:, 6] *= look["fade"]
        overlay = text.compose(self.captions, T, look["light"], cam)
        if overlay is not None and look["fade"] < 1:
            overlay = (overlay.astype(np.float32) * look["fade"]).astype(np.uint8)
        return pts, overlay, look, cam


# ------------------------------------------------------------------ helpers
def grid_slots(n, cx, cy, cols, dx=11.0, dy=11.0, seed=0, jitter=1.5, bottom=True):
    """n slot positions in a grid filling upward from the bottom (bottom=True) of a column."""
    rng = np.random.default_rng(seed)
    rows = int(math.ceil(n / cols))
    out = []
    for i in range(n):
        r, c = divmod(i, cols)
        x = cx + (c - (cols - 1) / 2) * dx + (dx / 2 if r % 2 else 0) * 0.5
        y = (cy - r * dy) if bottom else (cy - (rows - 1) / 2 * dy + r * dy)
        out.append((x + rng.normal(0, jitter), y + rng.normal(0, jitter)))
    return np.array(out, np.float32)


def disc(n, cx, cy, r, seed=0):
    rng = np.random.default_rng(seed)
    a = rng.uniform(0, 2 * np.pi, n)
    rr = r * np.sqrt(rng.uniform(0, 1, n))
    return np.stack([cx + np.cos(a) * rr, cy + np.sin(a) * rr], 1).astype(np.float32)


def stagger(n, t0, t1, seed=0, order=None):
    rng = np.random.default_rng(seed)
    idx = np.arange(n) if order is None else np.asarray(order)
    return t0 + (t1 - t0) * idx / max(1, n - 1) + rng.uniform(-0.04, 0.04, n)


