"""Procedural, deterministic textures for Layers of Reality.

earth_color.jpg  — stylised Muslim Kids palette Earth (Natural Earth land, public domain)
earth_rough.jpg  — roughness map (glossy ocean, matte land)
earth_clouds.jpg — seamless cloud mask (used as alphaMap)
Run: node scripts/export-land.mjs && python3 scripts/make-textures.py
"""
import json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H = 4096, 2048
OUT = "public/textures/"
rng = np.random.default_rng(12)


def periodic_noise(w, h, cells_x, cells_y, seed):
    """Bilinear value noise, seamless in x."""
    r = np.random.default_rng(seed).random((cells_y + 1, cells_x))
    xs = np.linspace(0, cells_x, w, endpoint=False)
    ys = np.linspace(0, cells_y, h)
    x0 = np.floor(xs).astype(int); fx = xs - x0; x1 = (x0 + 1) % cells_x
    y0 = np.clip(np.floor(ys).astype(int), 0, cells_y - 1); fy = ys - y0; y1 = y0 + 1
    fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy)
    a = r[y0][:, x0]; b = r[y0][:, x1]; c = r[y1][:, x0]; d = r[y1][:, x1]
    top = a * (1 - fx) + b * fx; bot = c * (1 - fx) + d * fx
    return top * (1 - fy[:, None]) + bot * fy[:, None]


def fbm(w, h, base, octaves, seed, aspect=2):
    acc = np.zeros((h, w)); amp = 1.0; tot = 0
    for o in range(octaves):
        cx = base * 2 ** o
        acc += amp * periodic_noise(w, h, cx * aspect // 2 * 2 or 2, cx, seed + o * 7)
        tot += amp; amp *= 0.5
    return acc / tot


# ---------- land mask ----------
rings = json.load(open("scripts/.cache/land-rings.json"))
mask_img = Image.new("L", (W, H), 0)
dr = ImageDraw.Draw(mask_img)
for item in sorted(rings, key=lambda r: r["hole"]):
    # unwrap longitudes so rings crossing the antimeridian stay continuous
    pts, prev, shift = [], None, 0.0
    for lo, la in item["ring"]:
        if prev is not None and abs(lo + shift - prev) > 180:
            shift -= 360 * np.sign(lo + shift - prev)
        prev = lo + shift
        pts.append(((prev + 180) / 360 * W, (90 - la) / 180 * H))
    if len(pts) > 2:
        for off in (-W, 0, W):
            dr.polygon([(x + off, y) for x, y in pts], fill=0 if item["hole"] else 255)
land = np.asarray(mask_img, dtype=np.float32) / 255
coast = np.asarray(mask_img.filter(ImageFilter.GaussianBlur(28)), dtype=np.float32) / 255
coast_far = np.asarray(mask_img.filter(ImageFilter.GaussianBlur(90)), dtype=np.float32) / 255

lon = np.linspace(-180, 180, W, endpoint=False)[None, :]
lat = np.linspace(90, -90, H)[:, None]
n1 = fbm(W, H, 8, 6, 3)
n2 = fbm(W, H, 24, 4, 41)


n3 = fbm(W, H, 48, 4, 77)


def blob(lo0, lo1, la0, la1, soft=1.6):
    cx, cy = (lo0 + lo1) / 2, (la0 + la1) / 2
    rx, ry = (lo1 - lo0) / 2, (la1 - la0) / 2
    d = np.sqrt(((lon - cx) / rx) ** 2 + ((lat - cy) / ry) ** 2)
    v = (1.15 - d) * soft + (n1 - 0.5) * 1.6 + (n3 - 0.5) * 0.5
    v = np.clip(v, 0, 1)
    return v * v * (3 - 2 * v)

desert = np.maximum.reduce([
    blob(-17, 33, 14, 32), blob(34, 60, 14, 31), blob(48, 70, 26, 40),
    blob(88, 118, 37, 47), blob(117, 142, -31, -19), blob(12, 25, -29, -17),
    blob(-117, -103, 27, 38), blob(-72, -66, -28, -17), blob(52, 66, 38, 46),
])
desert = np.clip(desert, 0, 1) * 0.92
mountains = np.maximum.reduce([
    blob(70, 100, 27, 38), blob(68, 84, 38, 45),   # Himalaya, Tian Shan
    blob(-78, -66, -40, 5), blob(-125, -105, 36, 58), blob(6, 15, 45, 48),
])
ice = np.clip((np.abs(lat) - 66) / 6, 0, 1) * (0.7 + 0.3 * n2)
ice = np.maximum(ice, blob(-58, -20, 60, 84, 3))
ice = np.maximum(ice, np.clip((-lat - 62) / 3, 0, 1))

def hexc(h):
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], dtype=np.float32) / 255

forest = hexc("#2F8A5E"); grass = hexc("#58B47A"); dry = hexc("#C9A86A")
rock = hexc("#967354"); snow = hexc("#F7F5EF")
deep = hexc("#0E2F5C"); mid = hexc("#194F88"); shallow = hexc("#3FA9C4")

tropic = np.clip(1 - np.abs(lat) / 25, 0, 1)
lc = forest[None, None] * (0.6 + 0.4 * tropic[..., None]) + grass[None, None] * (0.4 - 0.4 * tropic[..., None])
lc = lc * (0.78 + 0.22 * n2[..., None] + 0.18 * n3[..., None])
lc = lc * (1 - desert[..., None]) + dry * desert[..., None] * (0.88 + 0.22 * n2[..., None])
lc = lc * (1 - 0.45 * mountains[..., None]) + rock * 0.45 * mountains[..., None] * (0.8 + 0.4 * n3[..., None])
lc = lc * (1 - ice[..., None]) + snow * ice[..., None]

oc = deep * (1 - coast_far[..., None]) + mid * coast_far[..., None]
oc = oc * (1 - coast[..., None] * 0.9) + shallow * coast[..., None] * 0.9
oc = oc * (0.93 + 0.12 * n1[..., None])

col = oc * (1 - land[..., None]) + lc * land[..., None]
Image.fromarray((np.clip(col, 0, 1) * 255).astype(np.uint8)).save(OUT + "earth_color.jpg", quality=92)

rough = 0.58 * (1 - land) + 0.92 * land
rough = np.maximum(rough, ice * land * 0.7)
Image.fromarray((rough * 255).astype(np.uint8)).save(OUT + "earth_rough.jpg", quality=90)

# ---------- clouds (seamless) ----------
CW, CH = 2048, 1024
c = fbm(CW, CH, 8, 7, 99, aspect=2)
streak = fbm(CW, CH, 12, 5, 123, aspect=4)
c = 0.7 * c + 0.3 * streak
clat = np.linspace(90, -90, CH)[:, None]
band = 0.82 + 0.18 * np.cos(np.radians(clat) * 3) ** 2
c = np.clip((c * band - 0.47) / 0.16, 0, 1) ** 1.35
alpha = (c * 235).astype(np.uint8)
Image.fromarray(alpha, "L").save(OUT + "earth_clouds.jpg", quality=90)  # alphaMap (green channel)
print("textures done")
