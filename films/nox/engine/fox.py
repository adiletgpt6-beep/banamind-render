"""NOX — the particle fox. One fixed set of particles (stable ids, seed) driven by a small rig.

Local units: y down, origin between the feet on the ground, facing +x; height ≈ 450 units.
Pose parameters are plain floats so key-frames interpolate smoothly."""
import functools
import math

import numpy as np

from shapes import AMBER, TURQ, VIOLET, WHITE, Canvas, ring_points

CREAM = (1.0, 0.90, 0.72)
NOSE = (0.55, 0.25, 0.65)
TAILTIP = (0.62, 0.45, 1.0)

POSE_DEFAULT = {
    "lean": 0.0, "head": 0.0, "ear": 0.0, "tail_raise": 0.0, "tail_curl": 0.0,
    "fa1": 8.0, "fa2": 18.0, "ba1": -6.0, "ba2": 14.0,     # front/back arm: shoulder, elbow (deg)
    "fl1": 4.0, "fl2": 0.0, "bl1": -4.0, "bl2": 0.0,       # legs: hip, knee
    "stride": 0.0, "run": 0.0, "ring_gap": 0.28, "clock": 0.0, "blink": 1.0, "bob": 0.0,
}

POSES = {
    "stand": {},
    "calm": {"lean": -2, "head": 4, "tail_raise": -6, "fa1": 4, "fa2": 10},
    "think": {"head": 12, "lean": 2, "fa1": 38, "fa2": 125, "ear": 8, "tail_curl": 0.3},
    "tilt": {"head": 18, "ear": -6, "fa1": 10, "fa2": 30},
    "reach": {"lean": 6, "fa1": 78, "fa2": 12, "head": 6, "tail_raise": 8},
    "reach_stop": {"lean": 3, "fa1": 58, "fa2": 40, "head": 10, "ear": 10},
    "carry": {"lean": 3, "fa1": 62, "fa2": 55, "ba1": 55, "ba2": 60, "head": 10},
    "work": {"lean": 10, "fa1": 52, "fa2": 48, "ba1": 44, "ba2": 54, "head": 22, "tail_raise": -4},
    "proud": {"lean": -6, "head": -10, "tail_raise": 28, "ear": -10, "fa1": -10, "fa2": 30},
    "tired": {"lean": 14, "head": 26, "ear": 34, "tail_raise": -24, "fa1": 2, "fa2": 6, "ba1": 0},
    "surprised": {"lean": -8, "head": -14, "ear": -18, "tail_raise": 20, "fa1": 40, "fa2": 70},
    "point": {"lean": 2, "fa1": 120, "fa2": 8, "head": -6},
    "gesture": {"fa1": 70, "fa2": 80, "ba1": 60, "ba2": 70, "lean": -2, "head": -4, "tail_raise": 14},
    "walk": {"stride": 1.0, "lean": 5, "tail_raise": 6},
    "run": {"stride": 1.0, "run": 1.0, "lean": 16, "tail_raise": 20, "ear": 16},
    "write": {"lean": 12, "head": 26, "fa1": 46, "fa2": 70, "ba1": 30, "ba2": 50},
    "rest": {"lean": -10, "head": -4, "ear": 6, "tail_raise": -10, "fa1": -4, "fa2": 4, "ba1": -8},
}


def pose(name, **over):
    p = dict(POSES[name])
    p.update(over)
    return p


def _rng(seed):
    return np.random.default_rng(seed)


def _limb_samples(n, w0, w1, seed):
    """Parametric samples (s along, v across) for a tapering capsule, density ∝ width."""
    rng = _rng(seed)
    s = np.sqrt(rng.random(n)) * 0 + rng.random(n)
    wscale = w0 + (w1 - w0) * s
    keep = rng.random(n) * max(w0, w1) <= wscale * 1.3
    s = np.where(keep, s, rng.random(n))
    v = (rng.random(n) * 2 - 1)
    v = np.sign(v) * np.abs(v) ** 0.8
    return s.astype(np.float32), v.astype(np.float32)


@functools.lru_cache(maxsize=4)
def build(seed=7, density=1.0):
    """Static particle definition of the fox (local rest coordinates per part)."""
    rng = _rng(seed)
    parts = []

    def add(name, p, z, c, s, layer=0.0):
        parts.append({"name": name, "p": p.astype(np.float32), "z": z.astype(np.float32),
                      "c": c.astype(np.float32), "s": s.astype(np.float32), "layer": layer})

    D = density
    # torso (pivot at hips (0,-105)); drawn in torso-local coords
    cv = Canvas(260, 300, res=2)
    cv.ellipse(4, -30, 62, 98, AMBER)        # centre at torso-local; later offset by (0,-185)
    cv.ellipse(-6, 55, 64, 52, AMBER)
    cv.ellipse(30, -40, 36, 62, TURQ)        # chest
    sh = cv.to_shape(int(2500 * D), seed=seed + 1, edge_boost=0.4, depth=1.0)
    p = sh["p"] + np.array([0, -185], np.float32)
    add("torso", p, sh["z"], sh["c"], sh["s"])

    # head (pivot at neck (22,-282)); head-local coords with origin at neck
    cv = Canvas(260, 220, res=2.4)
    cv.ellipse(6, -38, 50, 44, AMBER)
    cv.poly([(30, -72), (92, -46), (124, -30), (126, -22), (112, -12), (60, -4), (28, -10)], AMBER)
    cv.poly([(40, -20), (112, -12), (124, -20), (126, -14), (100, 0), (50, 4)], CREAM)   # muzzle
    cv.poly([(-30, -22), (-46, 4), (-8, -2)], CREAM)                                     # cheek ruff
    cv.erase_ellipse(56, -50, 7, 6)                                                      # eye socket
    sh = cv.to_shape(int(1750 * D), seed=seed + 2, edge_boost=0.55, depth=0.9)
    add("head", sh["p"], sh["z"], sh["c"], sh["s"])
    # eye (bright) and nose tip — dense, slightly larger points
    ang = rng.random(int(60 * D)) * 2 * np.pi
    rr = np.sqrt(rng.random(len(ang))) * 4.2
    add("eye", np.stack([56 + np.cos(ang) * rr, -50 + np.sin(ang) * rr], 1), np.full(len(ang), 0.9),
        np.tile(np.array([[0.85, 1.0, 1.0]]), (len(ang), 1)), np.full(len(ang), 1.1))
    ang = rng.random(int(55 * D)) * 2 * np.pi
    rr = np.sqrt(rng.random(len(ang))) * 6
    add("nose", np.stack([122 + np.cos(ang) * rr, -24 + np.sin(ang) * rr * 0.8], 1), np.full(len(ang), 0.8),
        np.tile(np.array([NOSE]), (len(ang), 1)), np.full(len(ang), 1.15))

    # ears (pivot at base, head-local). front ear and back ear
    for nm, base, tipx, col, lay in (("ear_f", (8, -74), 4, AMBER, 0.0), ("ear_b", (-22, -70), -30, AMBER, -1.0)):
        cv = Canvas(120, 140, res=2.5)
        cv.poly([(-24, 0), (24, 0), (tipx * 0.2, -86)], col)
        cv.poly([(-12, -6), (12, -6), (tipx * 0.15, -60)], (1.0, 0.55, 0.45))   # inner ear
        sh = cv.to_shape(int(260 * D), seed=int(seed + 3 + lay * 5), edge_boost=0.6, depth=0.5)
        e = sh["p"].copy()
        e[:, 1] -= 0.0
        add(nm, e, sh["z"], sh["c"] * (0.72 if lay < 0 else 1.0), sh["s"], layer=lay)
        parts[-1]["base"] = np.array(base, np.float32)

    # limbs (parametric)
    for nm, n0, w0, w1, lay in (("arm_f", 480, 26, 18, 0.5), ("arm_b", 420, 24, 17, -1.0),
                                ("leg_f", 600, 34, 20, 0.3), ("leg_b", 560, 33, 19, -1.0)):
        s, v = _limb_samples(int(n0 * D), w0, w1, seed + 10 + len(parts))
        c = np.tile(np.array([AMBER]), (len(s), 1)) * (1 + rng.normal(0, 0.05, (len(s), 1)))
        if nm.startswith("arm"):
            tip = s > 0.86
            c[tip] = np.array(CREAM) * 0.95
        else:
            c[s > 0.82] = np.array((0.95, 0.62, 0.30))
        if lay < 0:
            c = c * 0.68
        z = np.sqrt(np.clip(1 - v * v, 0, 1)) * np.where(rng.random(len(v)) < 0.5, -1, 1)
        sz = 1 + 0.35 * np.exp(-(1 - np.abs(v)) * 6) * rng.uniform(0.8, 1.1, len(v))
        add(nm, np.stack([s, v], 1), z * 0.6, np.clip(c, 0, 1), sz, layer=lay)
        parts[-1]["w"] = (w0, w1)

    # tail (parametric spine)
    n = int(2000 * D)
    s = rng.random(n)
    width = _tail_w(s)
    keep = rng.random(n) * 52 < width
    s = np.where(keep, s, rng.random(n) * 0.9 + 0.1)
    v = rng.random(n) * 2 - 1
    v = np.sign(v) * np.abs(v) ** 0.85
    c = np.zeros((n, 3), np.float32)
    t1 = np.clip((s - 0.70) / 0.18, 0, 1)[:, None]
    t2 = np.clip((s - 0.86) / 0.12, 0, 1)[:, None]
    c[:] = np.array(AMBER) * (1 - t1) + np.array(TAILTIP) * t1
    c = c * (1 - t2) + np.array(TURQ) * t2
    c = np.clip(c * (1 + rng.normal(0, 0.06, (n, 1))), 0, 1)
    z = np.sqrt(np.clip(1 - v * v, 0, 1)) * np.where(rng.random(n) < 0.5, -1, 1)
    sz = (1 + 0.3 * np.exp(-(1 - np.abs(v)) * 6)) * rng.uniform(0.85, 1.12, n)
    add("tail", np.stack([s, v], 1), z * 0.8, c, sz, layer=-0.5)

    # chest ring (open circle that later becomes a clock face)
    n = int(300 * D)
    rp, u = ring_points(n, 1.0, 0.0, seed + 40)
    c = np.tile(np.array([[0.75, 1.0, 0.98]]), (n, 1)).astype(np.float32)
    add("ring", np.stack([u, rng.random(n)], 1), np.full(n, 1.0), c, np.full(n, 0.95), layer=1.0)

    total = sum(len(pp["p"]) for pp in parts)
    return parts, total


def _tail_w(s):
    return 12 + 46 * np.sin(np.pi * np.clip(s, 0, 1) ** 0.62) ** 1.1


def _rot(p, deg, pivot):
    a = math.radians(deg)
    c, s = math.cos(a), math.sin(a)
    q = p - pivot
    return np.stack([q[:, 0] * c - q[:, 1] * s, q[:, 0] * s + q[:, 1] * c], 1) + pivot


def _chain(s, v, a, j1, j2, l1, l2, w0, w1):
    """Two-bone limb from point a: angles j1 (from straight down, + forward), j2 (bend)."""
    d1 = np.array([math.sin(math.radians(j1)), math.cos(math.radians(j1))])
    e = a + d1 * l1
    d2a = math.radians(j1 + j2)
    d2 = np.array([math.sin(d2a), math.cos(d2a)])
    b = e + d2 * l2
    # quadratic bezier a -> e -> b
    t = s[:, None]
    pos = (1 - t) ** 2 * a + 2 * (1 - t) * t * e + t ** 2 * b
    tan = 2 * (1 - t) * (e - a) + 2 * t * (b - e)
    tan /= np.linalg.norm(tan, axis=1, keepdims=True) + 1e-6
    nrm = np.stack([-tan[:, 1], tan[:, 0]], 1)
    w = (w0 + (w1 - w0) * s)[:, None] / 2
    # paw/foot: widen at the end
    w = w * (1 + 0.35 * np.clip((s[:, None] - 0.85) / 0.15, 0, 1))
    return pos + nrm * v[:, None] * w


def evaluate(pz, t, seed=7, density=1.0):
    """Particles of the fox in local coords for pose dict pz at time t.
    Returns p (N,2), z (N,), c (N,3), s (N,)."""
    parts, total = build(seed, density)
    P = {**POSE_DEFAULT, **pz}
    breathe = math.sin(t * 2 * math.pi / 4.2) * 1.0
    stride = P["stride"]
    ph = t * 2 * math.pi * (1.1 + 0.9 * P["run"])
    swing = math.sin(ph) * (24 + 16 * P["run"]) * stride
    bob = abs(math.sin(ph)) * 6 * stride + P["bob"]
    hip = np.array([0.0, -105.0 - bob])
    lean = P["lean"]
    out_p, out_z, out_c, out_s = [], [], [], []

    def torso_xf(q):
        q = q + np.array([0, -bob])
        q = _rot(q, lean, hip)
        return q

    neck_rest = np.array([24.0, -282.0])
    neck = torso_xf(neck_rest[None])[0]
    head_ang = P["head"] + 0.8 * breathe

    def head_xf(q):
        return _rot(q, head_ang * 0.6 + lean * 0.4, np.zeros(2)) + neck

    for prt in parts:
        nm = prt["name"]
        p = prt["p"]
        if nm == "torso":
            q = p.copy()
            q[:, 0] = q[:, 0] * (1 + 0.012 * breathe)
            q = torso_xf(q)
        elif nm in ("head", "eye", "nose"):
            q = p.copy()
            if nm == "eye" and P["blink"] < 1:
                q[:, 1] = -50 + (q[:, 1] + 50) * max(0.08, P["blink"])
            q = head_xf(q)
        elif nm.startswith("ear"):
            base = prt["base"]
            tw = math.sin(t * 1.3 + (0 if nm == "ear_f" else 1.7)) * 1.5
            q = _rot(p + base, -P["ear"] * (-1 if False else 1) - 6 + tw, base)
            q = head_xf(q)
        elif nm.startswith("arm"):
            front = nm == "arm_f"
            sh = torso_xf(np.array([[28.0 if front else 14.0, -246.0]]))[0]
            j1 = (P["fa1"] if front else P["ba1"]) + lean - (swing * 0.7 if front else -swing * 0.7)
            j2 = (P["fa2"] if front else P["ba2"])
            q = _chain(p[:, 0], p[:, 1], sh, j1, j2, 72, 68, *prt["w"])
        elif nm.startswith("leg"):
            front = nm == "leg_f"
            hp = torso_xf(np.array([[8.0 if front else -6.0, -112.0]]))[0]
            j1 = (P["fl1"] if front else P["bl1"]) + (swing if front else -swing)
            j2 = (P["fl2"] if front else P["bl2"]) - abs(swing) * 0.5 * stride
            q = _leg(p[:, 0], p[:, 1], hp, j1, j2, prt["w"])
        elif nm == "tail":
            base = torso_xf(np.array([[-46.0, -118.0]]))[0]
            q = _tail(p[:, 0], p[:, 1], base, P["tail_raise"] - lean * 0.3 + math.sin(t * 1.1) * 3 +
                      math.sin(ph) * 4 * stride, P["tail_curl"], t)
        elif nm == "ring":
            ctr = torso_xf(np.array([[34.0, -212.0]]))[0]
            q = _ring(p[:, 0], p[:, 1], ctr, P["ring_gap"], P["clock"], t)
        else:
            q = p
        z = prt["z"] + prt["layer"] * 0.6
        out_p.append(q)
        out_z.append(z)
        out_c.append(prt["c"])
        out_s.append(prt["s"])
    return (np.concatenate(out_p).astype(np.float32), np.concatenate(out_z).astype(np.float32),
            np.concatenate(out_c).astype(np.float32), np.concatenate(out_s).astype(np.float32))


def _mirror_fix(q, sh):
    # chain computed with angles measured from "down"; flip back to facing +x
    q[:, 0] = 2 * sh[0] - q[:, 0]
    return q


def _leg(s, v, hp, j1, j2, w):
    # thigh + shin, then a short forward foot (digitigrade feel)
    knee_d = np.array([math.sin(math.radians(j1)), math.cos(math.radians(j1))])
    l1, l2 = 62.0, 50.0
    knee = hp + knee_d * l1
    a2 = math.radians(j1 + j2)
    ankle = knee + np.array([math.sin(a2), math.cos(a2)]) * l2
    toe = ankle + np.array([30.0, 0.0])
    t = s[:, None]
    seg1 = t < 0.45
    u1 = np.clip(t / 0.45, 0, 1)
    u2 = np.clip((t - 0.45) / 0.37, 0, 1)
    u3 = np.clip((t - 0.82) / 0.18, 0, 1)
    pos = np.where(seg1, hp + (knee - hp) * u1,
                   np.where(t < 0.82, knee + (ankle - knee) * u2, ankle + (toe - ankle) * u3))
    d = np.where(seg1, (knee - hp)[None], np.where(t < 0.82, (ankle - knee)[None], (toe - ankle)[None]))
    d = d / (np.linalg.norm(d, axis=1, keepdims=True) + 1e-6)
    nrm = np.stack([-d[:, 1], d[:, 0]], 1)
    ww = (w[0] + (w[1] - w[0]) * s)[:, None] / 2
    ww = np.where(t >= 0.82, 9.0, ww)
    return pos + nrm * v[:, None] * ww


def _tail(s, v, base, raise_deg, curl, t):
    # spine: starts going back-down, sweeps back and up; raise rotates, curl bends the tip
    L = 215.0
    n = 48
    ss = np.linspace(0, 1, n)
    ang0 = math.radians(104 + raise_deg)   # at the base the tail hangs back-down, then sweeps up
    pts = [base]
    d = ang0
    seg = L / (n - 1)
    for i in range(1, n):
        k = ss[i]
        d += math.radians((3.7 + 2.0 * curl) * (0.25 + k)) + math.radians(0.6 * math.sin(t * 1.4 - k * 3))
        pts.append(pts[-1] + np.array([math.cos(d), math.sin(d)]) * seg)
    spine = np.array(pts)
    idx = np.clip(s * (n - 1), 0, n - 1.001)
    i0 = idx.astype(int)
    f = (idx - i0)[:, None]
    pos = spine[i0] * (1 - f) + spine[i0 + 1] * f
    tan = spine[i0 + 1] - spine[i0]
    tan /= np.linalg.norm(tan, axis=1, keepdims=True) + 1e-6
    nrm = np.stack([-tan[:, 1], tan[:, 0]], 1)
    return pos + nrm * (v * _tail_w(s) / 2)[:, None]


def _ring(u, r2, ctr, gap, clock, t):
    """Open ring (u along arc) that morphs into a clock face when clock -> 1."""
    R = 25.0
    g = gap * (1 - clock)
    ang = np.radians(-90 + (g / 2 + u * (1 - g)) * 360)
    ring = np.stack([np.cos(ang), np.sin(ang)], 1) * R * (1 + (r2[:, None] - 0.5) * 0.12)
    if clock > 0:
        # 25% of points become the two hands + 12 ticks
        hand = u < 0.22
        hu = u[hand] / 0.22
        long = hu < 0.55
        a_l = math.radians(-90 + (t * 6) % 360)
        a_s = math.radians(-90 + 120)
        hl = np.where(long[:, None], np.stack([np.cos(a_l) * hu / 0.55 * R * 0.78, np.sin(a_l) * hu / 0.55 * R * 0.78], 1),
                      np.stack([np.cos(a_s) * (hu - 0.55) / 0.45 * R * 0.55, np.sin(a_s) * (hu - 0.55) / 0.45 * R * 0.55], 1))
        tgt = ring.copy()
        tgt[hand] = hl
        ring = ring * (1 - clock) + tgt * clock
    return ring + ctr


def colors_for(c, z, tint=None):
    b = 0.78 + 0.32 * (np.clip(z, -1.5, 1.2) + 1) / 2
    c = c * b[:, None]
    if tint is not None:
        c = c * (1 - tint[3]) + np.array(tint[:3]) * tint[3]
    return np.clip(c, 0, 1)


def count(density=1.0):
    return build(7, density)[1]
