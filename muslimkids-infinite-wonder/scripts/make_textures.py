"""Процедурные текстуры «Бесконечного чуда» (детерминированно, seed фиксирован).

  earth_day.jpg    — цвет поверхности Земли (равнопромежуточная проекция);
  earth_data.png   — R: суша, G: рельеф, B: близость берега;
  earth_clouds.jpg — облака;
  paper.jpg        — бесшовная фактура акварельной бумаги;
  leaf.png         — лист: цвет с прожилками + альфа-контур;
  leaf_bump.jpg    — рельеф прожилок листа.

Контуры суши: Natural Earth 1:50m (world-atlas, public domain) — сначала
`node scripts/export_land.mjs output/land-50m.geojson`.
Запуск: python3 scripts/make_textures.py
"""
import json
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "textures")
W, H = 2048, 1024
rng = np.random.default_rng(13)


# ---------- шум ----------
def _hash(ix, iy, iz, seed):
    h = (ix.astype(np.uint32) * np.uint32(374761393) + iy.astype(np.uint32) * np.uint32(668265263)
         + iz.astype(np.uint32) * np.uint32(2147483647) + np.uint32(seed * 1013))
    h = (h ^ (h >> np.uint32(13))) * np.uint32(1274126177)
    h = h ^ (h >> np.uint32(16))
    return (h & np.uint32(0xFFFFFF)).astype(np.float32) / np.float32(0xFFFFFF)


def vnoise3(p, seed=0):
    i = np.floor(p).astype(np.int64)
    f = p - i
    u = f * f * (3 - 2 * f)
    out = 0
    for dx in (0, 1):
        for dy in (0, 1):
            for dz in (0, 1):
                w = ((u[..., 0] if dx else 1 - u[..., 0]) * (u[..., 1] if dy else 1 - u[..., 1])
                     * (u[..., 2] if dz else 1 - u[..., 2]))
                out = out + w * _hash(i[..., 0] + dx, i[..., 1] + dy, i[..., 2] + dz, seed)
    return out


def fbm3(p, octaves=6, seed=0, lac=2.03, gain=0.5):
    total, amp, norm = 0, 1.0, 0
    for o in range(octaves):
        total = total + amp * vnoise3(p * (lac ** o), seed + o * 7)
        norm += amp
        amp *= gain
    return total / norm


def sphere_grid(w, h):
    lon = (np.arange(w) + 0.5) / w * 2 * np.pi - np.pi
    lat = np.pi / 2 - (np.arange(h) + 0.5) / h * np.pi
    lon, lat = np.meshgrid(lon, lat)
    p = np.stack([np.cos(lat) * np.cos(lon), np.sin(lat), np.cos(lat) * np.sin(lon)], -1)
    return np.degrees(lon), np.degrees(lat), p.astype(np.float32)


def blur(a, r):
    """Гауссово размытие через FFT (по долготе бесшовно)."""
    h, w = a.shape
    ky = np.fft.fftfreq(h)[:, None]
    kx = np.fft.fftfreq(w)[None, :]
    g = np.exp(-2 * (np.pi * r) ** 2 * (kx ** 2 + ky ** 2))
    return np.real(np.fft.ifft2(np.fft.fft2(a) * g)).astype(np.float32)


def smooth(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def hexrgb(h):
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], np.float32) / 255


def save(a, name, mode="RGB", q=92):
    im = Image.fromarray((np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8), mode)
    path = os.path.join(OUT, name)
    im.save(path, quality=q) if name.endswith(".jpg") else im.save(path, optimize=True)
    print("✓", name, im.size)


# ---------- суша ----------
def land_mask():
    ss = 2
    im = Image.new("L", (W * ss, H * ss), 0)
    d = ImageDraw.Draw(im)
    geo = json.load(open(os.path.join(ROOT, "output", "land-50m.geojson")))
    for f in geo["features"]:
        g = f["geometry"]
        polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        for poly in polys:
            for k, ring in enumerate(poly):
                # Кольца через антимеридиан (Фиджи, Чукотка): «разворачиваем»
                # долготу и рисуем с переносом ±360°.
                xs = [ring[0][0]]
                for (x0, _), (x1, _) in zip(ring[:-1], ring[1:]):
                    dx = x1 - x0
                    xs.append(xs[-1] + dx - 360 * round(dx / 360))
                for shift in (-360, 0, 360):
                    pts = [((x + shift + 180) / 360 * W * ss, (90 - y) / 180 * H * ss)
                           for x, (_, y) in zip(xs, ring)]
                    d.polygon(pts, fill=255 if k == 0 else 0)
    im = im.resize((W, H), Image.LANCZOS)
    return np.asarray(im, np.float32) / 255


# Основные горные системы: (точки lon/lat, ширина °, высота).
RANGES = [
    ([(70, 39), (75, 41.5), (80, 42.5), (86, 43), (93, 43.5)], 2.2, 1.0),   # Тянь-Шань
    ([(70, 37), (74, 36.5), (78, 35)], 1.8, 1.0),                           # Памир
    ([(73, 35), (78, 32), (84, 28.5), (89, 27.8), (95, 28.5)], 2.0, 1.1),   # Гималаи
    ([(80, 34), (88, 34), (96, 33.5), (100, 31)], 4.0, 0.7),                # Тибет
    ([(42, 43), (46, 42), (49, 41)], 1.2, 0.7),                             # Кавказ
    ([(6, 45), (10, 46.4), (14, 47)], 1.2, 0.7),                            # Альпы
    ([(59, 50), (59.5, 58), (64, 66)], 1.4, 0.35),                          # Урал
    ([(-123, 55), (-116, 49), (-110, 43), (-106, 37), (-108, 32)], 3.0, 0.75),  # Скалистые
    ([(-78, 6), (-76, -2), (-74, -12), (-69, -18), (-70, -28), (-71, -40), (-73, -50)], 1.8, 1.0),  # Анды
    ([(37, 9), (39, 12)], 2.5, 0.55),                                       # Эфиопия
    ([(-6, 31), (-2, 33.5), (6, 36)], 1.4, 0.5),                            # Атлас
    ([(48, 33), (54, 30), (58, 28)], 1.6, 0.45),                            # Загрос
    ([(102, 38), (110, 37)], 1.5, 0.35),
]
DESERTS = [  # (lon, lat, rx, ry)
    (12, 23, 22, 7), (45, 23, 10, 6), (104, 43, 9, 3.5), (132, -25, 12, 5), (21, -23, 5, 3.5),
    (71, 26.5, 4, 2.5), (57, 31, 6, 3.5), (-112, 34, 5, 3.5), (83, 39, 6, 2.2), (63, 41, 6, 3),
    (-70, -23, 1.5, 5),
]


def dist_to_poly(lon, lat, pts):
    best = np.full(lon.shape, 1e9, np.float32)
    for (x0, y0), (x1, y1) in zip(pts[:-1], pts[1:]):
        dx, dy = x1 - x0, y1 - y0
        t = np.clip(((lon - x0) * dx + (lat - y0) * dy) / (dx * dx + dy * dy), 0, 1)
        d = np.hypot(lon - (x0 + t * dx), lat - (y0 + t * dy))
        best = np.minimum(best, d)
    return best


def earth():
    lon, lat, p = sphere_grid(W, H)
    land = land_mask()
    n1 = fbm3(p * 3.0, 7, seed=1)
    n2 = fbm3(p * 9.0, 5, seed=2)
    ridged = 1 - np.abs(fbm3(p * 14.0, 5, seed=3) * 2 - 1)

    mount = np.zeros_like(lon)
    for pts, w, hgt in RANGES:
        mount = np.maximum(mount, hgt * np.exp(-(dist_to_poly(lon, lat, pts) / w) ** 2))
    mount *= smooth(0.3, 0.8, 0.5 * ridged + 0.7 * n2)
    relief = np.clip(land * (0.18 * n1 + 0.12 * ridged + mount), 0, 1.4) / 1.4

    desert = np.zeros_like(lon)
    for cx, cy, rx, ry in DESERTS:
        desert = np.maximum(desert, np.exp(-(((lon - cx) / rx) ** 2 + ((lat - cy) / ry) ** 2) ** 1.4))
    desert = smooth(0.3, 0.85, desert * (0.5 + 0.9 * n2) + 0.15 * (n1 - 0.5)) * 0.8

    alat = np.abs(lat)
    ice = smooth(-63, -66, lat) + smooth(0.0, 1.0, (lat - 60) / 4) * np.exp(-((lon + 42) / 18) ** 2)
    ice = np.clip(ice + smooth(78, 83, lat), 0, 1) * land
    ice = np.maximum(ice, land * smooth(0.5, 0.8, mount * ridged ** 2 * (0.6 + 0.8 * n2)) * 0.8)  # снежные вершины

    # Цвет суши: тропики → степи → тайга → тундра.
    rain = hexrgb("#1F6B45")
    green = hexrgb("#3AA67C") * 0.72 + hexrgb("#6FA84E") * 0.28
    steppe = hexrgb("#9DAE62")
    taiga = hexrgb("#24563F")
    tundra = hexrgb("#7D8A68")
    sand = hexrgb("#D9B678")
    rock = hexrgb("#93704F")
    col = green[None, None] * np.ones((H, W, 1), np.float32)
    col = col + (rain - green) * smooth(18, 4, alat)[..., None] * (0.6 + 0.4 * n2[..., None])
    col = col + (steppe - col) * (smooth(0.35, 0.8, n1) * smooth(25, 40, alat) * smooth(58, 46, alat))[..., None] * 0.7
    col = col + (taiga - col) * (smooth(48, 56, lat) * smooth(70, 62, lat))[..., None]
    col = col + (tundra - col) * smooth(64, 71, alat)[..., None]
    col = col + (sand - col) * desert[..., None]
    col = col + (rock - col) * smooth(0.1, 0.6, mount)[..., None] * (0.55 + 0.35 * ridged[..., None])
    col *= (0.86 + 0.28 * n2)[..., None]
    col = col + (np.array([0.96, 0.97, 0.99]) - col) * ice[..., None]

    # Океан: глубина через «близость берега».
    near = np.clip(blur(land, 3) * 3.0, 0, 1)
    mid = np.clip(blur(land, 18) * 2.2, 0, 1)
    deep, ocean, shelf, lagoon = (hexrgb(c) for c in ("#0A2E5C", "#1B508B", "#2C7FB2", "#52D0CC"))
    oc = deep + (ocean - deep) * (0.35 + 0.65 * mid[..., None])
    oc = oc + (shelf - oc) * near[..., None] * 0.75
    oc = oc + (lagoon - oc) * (near ** 3)[..., None] * 0.45 * smooth(40, 10, alat)[..., None]
    oc *= (0.94 + 0.12 * n1)[..., None]
    oc = oc + (np.array([0.88, 0.93, 0.97]) - oc) * smooth(70, 80, alat)[..., None] * 0.75  # морской лёд

    day = oc + (col - oc) * land[..., None]
    save(day, "earth_day.jpg")
    # Без альфа-канала: браузер премультиплицирует альфу и обнулил бы RGB.
    # Лёд шейдер определяет по белизне цвета поверхности.
    data = np.stack([land, relief, near], -1)
    save(data, "earth_data.png", "RGB")

    # Облака: крупные массивы + полосы циклонов; меньше у полюсов.
    c = fbm3(p * np.array([2.2, 3.2, 2.2], np.float32) + 4, 7, seed=21)
    c2 = fbm3(p * 8 + 9, 5, seed=22)
    band = 0.55 + 0.45 * np.cos(np.radians(lat) * 6.0) * 0.5
    cl = smooth(0.50, 0.74, c * 0.8 + c2 * 0.3 + band * 0.12 - 0.04)
    cl *= smooth(86, 70, alat)
    save(np.repeat(cl[..., None], 3, -1), "earth_clouds.jpg")


def fft_noise(n, power, seed):
    r = np.random.default_rng(seed)
    f = np.fft.fft2(r.standard_normal((n, n)))
    kx = np.fft.fftfreq(n)[:, None]
    ky = np.fft.fftfreq(n)[None, :]
    k = np.sqrt(kx ** 2 + ky ** 2) + 1e-4
    a = np.real(np.fft.ifft2(f / k ** power))
    return (a - a.mean()) / a.std()


def paper():
    n = 1024
    fibers = fft_noise(n, 0.6, 3)
    grain = fft_noise(n, 1.2, 4)
    tooth = fft_noise(n, 1.6, 5)
    a = 0.5 + 0.07 * grain + 0.035 * fibers + 0.09 * tooth
    save(np.repeat(np.clip(a, 0, 1)[..., None], 3, -1), "paper.jpg")


def leaf():
    """Лист в UV: x — от черешка к верхушке, y — поперёк."""
    w, h = 1024, 512
    ss = 2
    x = (np.arange(w) + 0.5) / w
    y = (np.arange(h) + 0.5) / h * 2 - 1
    X, Y = np.meshgrid(x, y)
    half = leaf_half_width(X)
    mask = smooth(0.012, -0.004, np.abs(Y) - half)

    im = Image.new("L", (w * ss, h * ss), 0)
    d = ImageDraw.Draw(im)
    def P(u, v):
        return (u * w * ss, (v + 1) / 2 * h * ss)
    # Главная жилка.
    d.line([P(0.0, 0), P(0.97, 0)], fill=255, width=int(9 * ss))
    # Вторичные жилки: дуги к краю, почти супротивно.
    for i, u0 in enumerate(np.linspace(0.08, 0.86, 10)):
        for side in (-1, 1):
            u0s = u0 + (0.02 if side > 0 else 0)
            pts = []
            for t in np.linspace(0, 1, 24):
                u = u0s + t * 0.17 + t * t * 0.05
                hw = leaf_half_width(np.array(u))
                v = side * hw * (0.95 * t ** 0.8)
                pts.append(P(u, float(v)))
            d.line(pts, fill=215, width=int(max(2, 5 - 0.25 * i) * ss), joint="curve")
    veins = np.asarray(im.resize((w, h), Image.LANCZOS), np.float32) / 255
    # Третичная сеть: границы ячеек Вороного.
    pts = np.stack([rng.uniform(0, 1, 900), rng.uniform(-1, 1, 900)], -1)
    d1 = np.full(X.shape, 9.0, np.float32)
    d2 = np.full(X.shape, 9.0, np.float32)
    for px, py in pts:
        dd = np.hypot((X - px) * 2.0, Y - py)
        d2 = np.where(dd < d1, d1, np.minimum(d2, dd))
        d1 = np.minimum(d1, dd)
    net = smooth(0.012, 0.0, d2 - d1) * 0.45
    vein = np.clip(np.maximum(veins, net), 0, 1)

    nn = fft_noise(512, 1.3, 9)
    nn = np.asarray(Image.fromarray(nn.astype(np.float32), "F").resize((w, h)), np.float32)
    base_a, base_b = hexrgb("#2E8F57"), hexrgb("#58B85E")
    t = (0.5 + 0.5 * np.cos(np.abs(Y) / np.maximum(half, 1e-3) * np.pi * 0.5))[..., None]
    col = base_a + (base_b - base_a) * t * 0.7
    col = col * (0.93 + 0.06 * nn[..., None])
    col = col + (hexrgb("#C9E58A") - col) * (vein * 0.75)[..., None]
    rgba = np.concatenate([col, mask[..., None]], -1)
    save(rgba, "leaf.png", "RGBA")
    save(np.repeat(vein[..., None], 3, -1), "leaf_bump.jpg")


def leaf_half_width(u):
    """Полуширина листа (в долях −1..1): яйцевидная форма с острой верхушкой."""
    u = np.clip(u, 0, 1)
    return 0.92 * np.sin(np.pi * u ** 0.78) ** 0.9 * (1 - 0.35 * u ** 3)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    import sys
    for job in sys.argv[1:] or ["paper", "leaf", "earth"]:
        globals()[job]()
