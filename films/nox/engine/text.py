"""Readable typographic layer (not particles): short captions rendered with Pillow, composited
as premultiplied RGBA tiles over the particle frame. Markup: *word* = amber accent,
_word_ = turquoise accent."""
import functools
import os
import re

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

FONTS = os.path.join(os.path.dirname(__file__), "..", "fonts")
W, H = 1920, 1080

STYLES = {
    # name: font file, px size, colour, accent colour
    "title": ("InterDisplay-ExtraBold.otf", 68, (244, 247, 255), (255, 189, 63)),
    "head": ("InterDisplay-Bold.otf", 56, (244, 247, 255), (255, 189, 63)),
    "label": ("Inter-SemiBold.otf", 42, (244, 247, 255), (255, 189, 63)),
    "num": ("InterDisplay-ExtraBold.otf", 76, (255, 205, 96), (24, 230, 207)),
    "numS": ("InterDisplay-Bold.otf", 50, (244, 247, 255), (255, 189, 63)),
    "small": ("Inter-SemiBold.otf", 34, (214, 220, 255), (255, 189, 63)),
    "note": ("Inter-Medium.otf", 30, (190, 198, 238), (255, 189, 63)),
    "cite": ("Inter-Medium.otf", 30, (200, 208, 245), (24, 230, 207)),
    "chapter": ("Inter-SemiBold.otf", 32, (226, 230, 255), (24, 230, 207)),
    "thumb": ("InterDisplay-ExtraBold.otf", 150, (255, 255, 255), (255, 189, 63)),
}
DARK = {  # same styles on light backgrounds
    "title": (26, 22, 58), "head": (26, 22, 58), "label": (30, 28, 70), "num": (120, 60, 200),
    "numS": (30, 28, 70), "small": (52, 50, 100), "note": (80, 80, 130), "cite": (80, 80, 130),
    "chapter": (60, 56, 120), "thumb": (26, 22, 58),
}
DARK_ACC = (205, 120, 0)
DARK_ACC2 = (0, 150, 135)


@functools.lru_cache(maxsize=None)
def _font(name, size):
    return ImageFont.truetype(os.path.join(FONTS, name), size)


def _runs(s):
    out = []
    for m in re.finditer(r"\*([^*]+)\*|_([^_]+)_|([^*_]+)", s):
        if m.group(1):
            out.append((m.group(1), 1))
        elif m.group(2):
            out.append((m.group(2), 2))
        else:
            out.append((m.group(3), 0))
    return out


@functools.lru_cache(maxsize=2048)
def render(s, style="label", dark=False, align="center", size=None, maxw=None):
    """Return premultiplied RGBA uint8 tile (h, w, 4) and its (ox, oy) offset of the anchor."""
    fname, px, col, acc = STYLES[style]
    px = size or px
    f = _font(fname, px)
    if dark:
        col = DARK[style]
        acc = DARK_ACC
    acc2 = DARK_ACC2 if dark else (24, 230, 207)
    lines = s.split("\n")
    lh = int(px * 1.22)
    widths = []
    dummy = ImageDraw.Draw(Image.new("L", (1, 1)))
    for ln in lines:
        widths.append(sum(dummy.textlength(t, font=f) for t, _ in _runs(ln)))
    tw = int(max(widths)) + 2
    pad = int(px * 0.6)
    img = Image.new("RGBA", (tw + 2 * pad, lh * len(lines) + 2 * pad), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for i, ln in enumerate(lines):
        x = pad + (tw - widths[i]) / 2 if align == "center" else pad + (0 if align == "left" else tw - widths[i])
        y = pad + i * lh
        for t, kind in _runs(ln):
            c = col if kind == 0 else (acc if kind == 1 else acc2)
            d.text((x, y), t, font=f, fill=c + (255,))
            x += d.textlength(t, font=f)
    # soft shadow / halo for readability over particles
    a = img.split()[3]
    sh = a.filter(ImageFilter.GaussianBlur(px * 0.12)).point(lambda v: min(255, int(v * (0.55 if dark else 0.9))))
    shadow = Image.new("RGBA", img.size, (255, 255, 255, 0) if dark else (5, 8, 24, 0))
    shadow.putalpha(sh)
    out = Image.alpha_composite(shadow, img)
    arr = np.asarray(out).astype(np.float32)
    arr[..., :3] *= arr[..., 3:4] / 255.0
    arr = arr.astype(np.uint8)
    h, w = arr.shape[:2]
    if align == "center":
        anchor = (w // 2, h // 2)
    elif align == "left":
        anchor = (pad, h // 2)
    else:
        anchor = (w - pad, h // 2)
    return arr, anchor


class Caption:
    """A text item on screen from t0 to t1 with fade/slide in and out."""

    def __init__(self, t0, t1, s, x, y, style="label", dark=None, align="center", fade=0.45, slide=14,
                 size=None, alpha=1.0, world=None):
        self.t0, self.t1, self.s, self.x, self.y = t0, t1, s, x, y
        self.style, self.dark, self.align, self.fade, self.slide = style, dark, align, fade, slide
        self.size, self.alpha, self.world = size, alpha, world

    def state(self, T):
        if T < self.t0 or T > self.t1:
            return None
        a = min(1.0, (T - self.t0) / self.fade, (self.t1 - T) / self.fade) * self.alpha
        if a <= 0.01:
            return None
        u = min(1.0, (T - self.t0) / (self.fade * 1.6))
        dy = (1 - (1 - (1 - u) ** 3)) * self.slide
        return a, dy


WORLD_STYLES = {"label", "small", "num", "numS"}   # captions attached to objects follow the camera


def compose(captions, T, light=0.0, cam=None):
    """Full-frame premultiplied RGBA overlay (H, W, 4) uint8, or None when no text is visible.
    Captions with dark=None switch to dark ink automatically on light backgrounds."""
    vis = []
    for c in captions:
        st = c.state(T)
        if st:
            vis.append((c, st))
    if not vis:
        return None
    out = np.zeros((H, W, 4), np.float32)
    for c, (a, dy) in vis:
        dark = c.dark if c.dark is not None else light > 0.5
        tile, (ax, ay) = render(c.s, c.style, dark, c.align, c.size)
        cx, cy = c.x, c.y
        world = c.world if c.world is not None else c.style in WORLD_STYLES
        if world and cam is not None and (cam["z"] != 1.0 or cam["cx"] != 960 or cam["cy"] != 540):
            cx = (cx - cam["cx"]) * cam["z"] + 960
            cy = (cy - cam["cy"]) * cam["z"] + 540
        x0 = int(round(cx - ax))
        y0 = int(round(cy - ay + dy))
        h, w = tile.shape[:2]
        sx0, sy0 = max(0, -x0), max(0, -y0)
        ex, ey = min(w, W - x0), min(h, H - y0)
        if ex <= sx0 or ey <= sy0:
            continue
        t = tile[sy0:ey, sx0:ex].astype(np.float32) * a
        dst = out[y0 + sy0:y0 + ey, x0 + sx0:x0 + ex]
        dst[:] = t + dst * (1 - t[..., 3:4] / 255.0)
    return np.clip(out, 0, 255).astype(np.uint8)
