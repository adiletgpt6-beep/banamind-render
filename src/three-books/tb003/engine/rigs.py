"""TB-003 character rigs: Rin (adult turtle of emerald particles with a wide low shell and three amber
segments), Tai (light heron in a warm coral vest), Sai (laconic citizen in a blue work silhouette) and the
training-shift participants. Rig mechanics (two-bone limbs, poses, joints) are adapted from the TB-002 engine;
the characters are new. One fixed particle set per character (fixed seed).

Local units: y down, origin between the feet on the ground, facing +x. Pose parameters are plain floats
so key-frames interpolate smoothly. Joints (hands, head, chest) are returned for prop attachment."""
import functools
import math

import numpy as np

from shapes import Canvas

EMER = (0.14, 0.72, 0.48)
EMER_L = (0.46, 0.98, 0.70)
EMER_D = (0.07, 0.50, 0.38)
SHELL = (0.06, 0.44, 0.34)
SHELL_RIM = (0.30, 0.80, 0.56)
AMBER = (1.0, 0.74, 0.25)
PLAST = (0.56, 0.90, 0.62)
CREAM = (1.0, 0.95, 0.80)
EYE_D = (0.06, 0.16, 0.20)

FEATHER = (0.86, 0.92, 1.0)
FEATHER_D = (0.58, 0.68, 0.95)
VEST = (1.0, 0.40, 0.28)
VEST_D = (0.86, 0.36, 0.32)
BEAK = (1.0, 0.82, 0.30)
CREST = (0.36, 0.44, 0.86)
LEGC = (0.95, 0.74, 0.46)

JACKET = (0.30, 0.46, 1.0)
TROUSER = (0.26, 0.30, 0.66)
SKIN = (1.0, 0.82, 0.66)
HAIR = (0.30, 0.30, 0.62)

BASE_POSE = {
    "lean": 0.0, "head": 0.0, "ear": 0.0, "tail_raise": 0.0,
    "fa1": 8.0, "fa2": 16.0, "ba1": -6.0, "ba2": 14.0,     # front/back arm: shoulder, elbow (deg; 0 = down)
    "fl1": 4.0, "fl2": 0.0, "bl1": -4.0, "bl2": 0.0,       # legs: hip, knee
    "stride": 0.0, "blink": 1.0, "bob": 0.0, "speed": 1.0, "squash": 0.0,
}


def _rng(seed):
    return np.random.default_rng(seed)


def _rot(p, deg, pivot):
    a = math.radians(deg)
    c, s = math.cos(a), math.sin(a)
    q = p - pivot
    return np.stack([q[:, 0] * c - q[:, 1] * s, q[:, 0] * s + q[:, 1] * c], 1) + pivot


def _limb(n, w0, w1, seed):
    rng = _rng(seed)
    s = rng.random(n)
    v = rng.random(n) * 2 - 1
    v = np.sign(v) * np.abs(v) ** 0.8
    return s.astype(np.float32), v.astype(np.float32)


def _chain(s, v, a, j1, j2, l1, l2, w0, w1, hand=0.3):
    """Two-bone limb from a: j1 from straight down (+ forward), j2 bend. Returns points and end point."""
    d1 = np.array([math.sin(math.radians(j1)), math.cos(math.radians(j1))])
    e = a + d1 * l1
    d2a = math.radians(j1 + j2)
    b = e + np.array([math.sin(d2a), math.cos(d2a)]) * l2
    t = s[:, None]
    pos = (1 - t) ** 2 * a + 2 * (1 - t) * t * e + t ** 2 * b
    tan = 2 * (1 - t) * (e - a) + 2 * t * (b - e)
    tan /= np.linalg.norm(tan, axis=1, keepdims=True) + 1e-6
    nrm = np.stack([-tan[:, 1], tan[:, 0]], 1)
    w = (w0 + (w1 - w0) * s)[:, None] / 2
    w = w * (1 + hand * np.clip((s[:, None] - 0.85) / 0.15, 0, 1))
    return pos + nrm * v[:, None] * w, b


def _leg(s, v, hp, j1, j2, l1, l2, w, foot):
    knee = hp + np.array([math.sin(math.radians(j1)), math.cos(math.radians(j1))]) * l1
    a2 = math.radians(j1 + j2)
    ankle = knee + np.array([math.sin(a2), math.cos(a2)]) * l2
    toe = ankle + np.array([foot, 0.0])
    t = s[:, None]
    seg1 = t < 0.45
    u1 = np.clip(t / 0.45, 0, 1)
    u2 = np.clip((t - 0.45) / 0.40, 0, 1)
    u3 = np.clip((t - 0.85) / 0.15, 0, 1)
    pos = np.where(seg1, hp + (knee - hp) * u1,
                   np.where(t < 0.85, knee + (ankle - knee) * u2, ankle + (toe - ankle) * u3))
    d = np.where(seg1, (knee - hp)[None], np.where(t < 0.85, (ankle - knee)[None], (toe - ankle)[None]))
    d = d / (np.linalg.norm(d, axis=1, keepdims=True) + 1e-6)
    nrm = np.stack([-d[:, 1], d[:, 0]], 1)
    ww = (w[0] + (w[1] - w[0]) * s)[:, None] / 2
    ww = np.where(t >= 0.85, w[1] * 0.42, ww)
    return pos + nrm * v[:, None] * ww


SP = 3.0   # rig point spacing in units at scale 1 (screen spacing at s=1.4 ~ 4.2 px)


class Rig:
    """Generic biped. Subclasses fill self.parts in build() and set the skeleton constants."""
    POSE_DEFAULT = BASE_POSE
    POSES = {}
    HIP = (0.0, -80.0)
    NECK = (10.0, -200.0)
    SHOULDER_F = (16.0, -168.0)
    SHOULDER_B = (0.0, -168.0)
    ARM = (42.0, 40.0)
    ARM_W = (20.0, 15.0)
    LEG = (40.0, 34.0)
    LEG_W = (26.0, 18.0)
    FOOT = 22.0
    HIP_F = (8.0, -84.0)
    HIP_B = (-6.0, -84.0)
    TAIL = None
    HEADJ = (10.0, -40.0)
    SEED = 7
    dens = 1.0

    def __init__(self):
        self.parts = []
        self.build()
        self.total = sum(len(p["p"]) for p in self.parts)

    def add(self, name, p, z, c, s, layer=0.0, **extra):
        d = {"name": name, "p": np.asarray(p, np.float32), "z": np.asarray(z, np.float32),
             "c": np.asarray(c, np.float32), "s": np.asarray(s, np.float32), "layer": layer}
        d.update(extra)
        self.parts.append(d)

    def add_canvas(self, name, cv, n, seed, edge=0.45, depth=0.9, layer=0.0, offset=(0, 0), **extra):
        # point count follows the drawn area: spacing SP units at scale 1 (rigs are thinned when small)
        area = float((np.asarray(cv.img)[..., 3] > 127).sum()) / cv.res ** 2
        n = max(60, int(area / SP ** 2 * self.dens))
        sh = cv.to_shape(n, seed=seed, edge_boost=edge, depth=depth)
        self.add(name, sh["p"] + np.array(offset, np.float32), sh["z"], sh["c"], sh["s"], layer, **extra)

    def add_limb(self, name, n, w, color, tip_color, layer, seed, tip=0.84):
        ln = self.ARM[0] + self.ARM[1] if name.startswith("arm") else self.LEG[0] + self.LEG[1]
        n = max(40, int(ln * (w[0] + w[1]) / 2 / SP ** 2 * self.dens * 1.1))
        s, v = _limb(n, w[0], w[1], seed)
        rng = _rng(seed + 1)
        c = np.tile(np.array([color], np.float32), (n, 1)) * (1 + rng.normal(0, 0.05, (n, 1)))
        if tip_color is not None:
            c[s > tip] = np.array(tip_color)
        if layer < 0:
            c = c * 0.70
        z = np.sqrt(np.clip(1 - v * v, 0, 1)) * np.where(rng.random(n) < 0.5, -1, 1)
        sz = 1 + 0.35 * np.exp(-(1 - np.abs(v)) * 6) * rng.uniform(0.8, 1.1, n)
        self.add(name, np.stack([s, v], 1), z * 0.6, np.clip(c, 0, 1), sz, layer, w=w)

    def count(self):
        return self.total

    def build(self):
        raise NotImplementedError

    def head_extra(self, q, prt, P, t):
        return q

    def evaluate(self, pz, t):
        P = {**self.POSE_DEFAULT, **pz}
        breathe = math.sin(t * 2 * math.pi / 4.4) * 1.0
        stride = P["stride"]
        ph = t * 2 * math.pi * 1.05 * P["speed"]
        swing = math.sin(ph) * 24 * stride
        bob = abs(math.sin(ph)) * 4 * stride + P["bob"]
        hip = np.array(self.HIP) + np.array([0, -bob])
        lean = P["lean"]
        sq = P["squash"]

        def torso_xf(q):
            q = q + np.array([0, -bob])
            q = _rot(q, lean, hip)
            if sq:
                q[:, 1] = q[:, 1] * (1 - 0.06 * sq)
            return q

        neck = torso_xf(np.array([self.NECK], np.float32))[0]
        head_ang = P["head"] + 0.8 * breathe

        def head_xf(q):
            return _rot(q, head_ang * 0.6 + lean * 0.4, np.zeros(2)) + neck

        joints = {"neck": neck}
        out_p, out_z, out_c, out_s = [], [], [], []
        for prt in self.parts:
            nm = prt["name"]
            p = prt["p"]
            if nm.startswith("torso"):
                q = p.copy()
                q[:, 0] = q[:, 0] * (1 + 0.012 * breathe)
                q = torso_xf(q)
            elif nm.startswith("head") or nm in ("eye", "nose", "mask"):
                q = p.copy()
                if nm == "eye" and P["blink"] < 1:
                    cy = prt["cy"]
                    q[:, 1] = cy + (q[:, 1] - cy) * max(0.08, P["blink"])
                q = self.head_extra(q, prt, P, t)
                q = head_xf(q)
            elif nm.startswith("ear"):
                base = prt["base"]
                tw = math.sin(t * 1.3 + prt.get("ph", 0)) * 1.5
                q = head_xf(_rot(p + base, -P["ear"] + tw, base))
            elif nm.startswith("arm"):
                front = nm == "arm_f"
                sh = torso_xf(np.array([self.SHOULDER_F if front else self.SHOULDER_B], np.float32))[0]
                j1 = (P["fa1"] if front else P["ba1"]) + lean - (swing * 0.7 if front else -swing * 0.7)
                j2 = P["fa2"] if front else P["ba2"]
                q, end = _chain(p[:, 0], p[:, 1], sh, j1, j2, self.ARM[0], self.ARM[1], *prt["w"])
                joints["hand_f" if front else "hand_b"] = end
            elif nm.startswith("leg"):
                front = nm == "leg_f"
                hp = torso_xf(np.array([self.HIP_F if front else self.HIP_B], np.float32))[0]
                j1 = (P["fl1"] if front else P["bl1"]) + (swing if front else -swing)
                j2 = (P["fl2"] if front else P["bl2"]) - abs(swing) * 0.5 * stride
                q = _leg(p[:, 0], p[:, 1], hp, j1, j2, self.LEG[0], self.LEG[1], prt["w"], self.FOOT)
            elif nm == "tail":
                base = torso_xf(np.array([self.TAIL["base"]], np.float32))[0]
                q = self._tail(p[:, 0], p[:, 1], base, P["tail_raise"] - lean * 0.3 + math.sin(t * 1.1) * 3 +
                               math.sin(ph) * 4 * stride, t)
            else:
                q = p
            out_p.append(q)
            out_z.append(prt["z"] + prt["layer"] * 0.6)
            out_c.append(prt["c"])
            out_s.append(prt["s"])
        joints["head"] = head_xf(np.array([self.HEADJ]))[0]
        joints["chest"] = torso_xf(np.array([[20.0, (self.NECK[1] + self.HIP[1]) / 2]], np.float32))[0]
        return (np.concatenate(out_p).astype(np.float32), np.concatenate(out_z).astype(np.float32),
                np.concatenate(out_c).astype(np.float32), np.concatenate(out_s).astype(np.float32), joints)

    def _tail(self, s, v, base, raise_deg, t):
        T = self.TAIL
        L, n = T["len"], 32
        ss = np.linspace(0, 1, n)
        d = math.radians(T["ang"] + raise_deg)
        pts = [base]
        seg = L / (n - 1)
        for i in range(1, n):
            k = ss[i]
            d += math.radians(T["curl"] * (0.25 + k)) + math.radians(0.6 * math.sin(t * 1.4 - k * 3))
            pts.append(pts[-1] + np.array([math.cos(d), math.sin(d)]) * seg)
        spine = np.array(pts)
        idx = np.clip(s * (n - 1), 0, n - 1.001)
        i0 = idx.astype(int)
        f = (idx - i0)[:, None]
        pos = spine[i0] * (1 - f) + spine[i0 + 1] * f
        tan = spine[i0 + 1] - spine[i0]
        tan /= np.linalg.norm(tan, axis=1, keepdims=True) + 1e-6
        nrm = np.stack([-tan[:, 1], tan[:, 0]], 1)
        return pos + nrm * (v * T["w"](s) / 2)[:, None]


def _common_poses(scale=1.0):
    return {
        "stand": {},
        "calm": {"lean": -2, "head": 4, "fa1": 4, "fa2": 10},
        "think": {"head": 12, "lean": 2, "fa1": 34, "fa2": 120, "ear": 8},
        "tilt": {"head": 16, "ear": -6, "fa1": 10, "fa2": 30},
        "reach": {"lean": 6, "fa1": 78, "fa2": 10, "head": 6},
        "reach_stop": {"lean": 3, "fa1": 58, "fa2": 40, "head": 10, "ear": 10},
        "hold": {"lean": 2, "fa1": 46, "fa2": 52, "ba1": 40, "ba2": 56, "head": 8},
        "hold1": {"lean": 1, "fa1": 46, "fa2": 52, "head": 6},
        "lift": {"lean": -1, "fa1": 30, "fa2": 66, "ba1": 26, "ba2": 70, "head": 10},
        "carry_side": {"lean": -2, "fa1": 6, "fa2": 8, "ba1": -4, "ba2": 10},
        "work": {"lean": 9, "fa1": 52, "fa2": 46, "ba1": 44, "ba2": 52, "head": 22},
        "proud": {"lean": -6, "head": -10, "tail_raise": 24, "ear": -10, "fa1": -8, "fa2": 30},
        "tired": {"lean": 12, "head": 24, "ear": 30, "tail_raise": -22, "fa1": 2, "fa2": 6, "ba1": 0},
        "surprised": {"lean": -7, "head": -12, "ear": -16, "tail_raise": 18, "fa1": 38, "fa2": 66},
        "point": {"lean": 2, "fa1": 110, "fa2": 8, "head": -4},
        "point_up": {"lean": -2, "fa1": 150, "fa2": 6, "head": -16},
        "gesture": {"fa1": 68, "fa2": 76, "ba1": 58, "ba2": 66, "lean": -2, "head": -4, "tail_raise": 12},
        "present": {"fa1": 70, "fa2": 20, "ba1": 20, "ba2": 30, "lean": 2, "head": 2, "tail_raise": 10},
        "walk": {"stride": 1.0, "lean": 4, "tail_raise": 6},
        "walk_hold": {"stride": 1.0, "lean": 2, "fa1": 46, "fa2": 52, "ba1": 40, "ba2": 56, "head": 6},
        "walk_hold1": {"stride": 1.0, "lean": 2, "fa1": 46, "fa2": 52, "head": 4},
        "walk_side": {"stride": 1.0, "lean": 3, "fa1": 6, "fa2": 8},
        "write": {"lean": 10, "head": 24, "fa1": 46, "fa2": 68, "ba1": 30, "ba2": 50},
        "palms": {"fa1": 34, "fa2": -10, "ba1": 30, "ba2": -10, "lean": -3, "head": 0},
        "door": {"lean": 3, "fa1": 88, "fa2": 4, "head": -2},
        "nod": {"head": 14, "lean": 2},
        "rest": {"lean": -6, "head": -2, "ear": 4, "tail_raise": -8, "fa1": -2, "fa2": 4, "ba1": -6},
    }


class Rin(Rig):
    """Adult turtle: wide low shell behind the body with three amber segments, short sure limbs,
    light lower line of the muzzle, a light plastron. No tail ring, mask or ears."""
    POSES = _common_poses()
    HIP = (0.0, -70.0)
    NECK = (20.0, -186.0)
    SHOULDER_F = (34.0, -158.0)
    SHOULDER_B = (10.0, -160.0)
    ARM = (44.0, 40.0)
    ARM_W = (22.0, 18.0)
    LEG = (32.0, 30.0)
    LEG_W = (34.0, 26.0)
    FOOT = 26.0
    HIP_F = (12.0, -76.0)
    HIP_B = (-8.0, -76.0)
    TAIL = {"base": (-44.0, -72.0), "len": 30.0, "ang": 160.0, "curl": -1.0,
            "w": lambda s: 6 + 12 * (1 - np.clip(s, 0, 1))}
    HEADJ = (14.0, -36.0)
    SEED = 11
    dens = 0.72

    def build(self):
        seed = self.SEED
        rng = np.random.default_rng(seed)
        # shell: a wide low dome on the back, lighter rim, three amber segments along the top of the dome
        cv = Canvas(200, 240, res=2)
        cv.ellipse(-30, 0, 66, 94, SHELL_RIM)
        cv.ellipse(-30, 0, 58, 86, SHELL)
        for k, (sx, sy) in enumerate(((-60, -52), (-70, 0), (-60, 52))):
            pts = [(sx + 17 * math.cos(math.radians(a)), sy + 19 * math.sin(math.radians(a))) for a in range(0, 360, 60)]
            cv.poly(pts, AMBER)
        cv.line([(-10, -80), (-24, -40), (-26, 40), (-10, 80)], EMER_D, 4)
        self.add_canvas("torso_shell", cv, 0, seed + 5, edge=0.5, depth=1.0, layer=-0.6, offset=(-8, -128))
        # body + plastron
        cv = Canvas(200, 220, res=2)
        cv.ellipse(6, 0, 52, 70, EMER)
        cv.ellipse(22, 8, 30, 56, PLAST)
        for y in (-22, 4, 30):
            cv.rect(2, y, 46, y + 3, (0.55, 0.85, 0.62))
        self.add_canvas("torso", cv, 0, seed + 1, edge=0.5, depth=1.0, offset=(0, -128))
        # head: round, short snout toward +x, light lower line of the muzzle
        cv = Canvas(200, 160, res=2.6)
        cv.ellipse(4, -40, 40, 35, EMER_L)
        cv.ellipse(36, -30, 22, 17, EMER_L)
        cv.line([(8, -16), (30, -18), (56, -24)], CREAM, 5)
        self.add_canvas("head", cv, 0, seed + 2, edge=0.6, depth=0.9)
        for nm, cx, cy, r, k in (("eye", 26, -50, 5.0, 60), ("nose", 56, -36, 3.2, 26)):
            ang = rng.random(k) * 2 * np.pi
            rr = np.sqrt(rng.random(k)) * r
            col = EYE_D if nm == "eye" else (0.10, 0.36, 0.30)
            self.add(nm, np.stack([cx + np.cos(ang) * rr, cy + np.sin(ang) * rr * 0.9], 1), np.full(k, 0.95),
                     np.tile(np.array([col]), (k, 1)), np.full(k, 1.2), 0.5, cy=cy)
        k = 24   # small light highlight in the eye (alive, not cartoonish)
        self.add("eye", np.stack([28 + rng.normal(0, 0.8, k), -52 + rng.normal(0, 0.8, k)], 1), np.full(k, 1.0),
                 np.tile(np.array([(0.9, 1.0, 1.0)]), (k, 1)), np.full(k, 0.8), 0.6, cy=-50)
        self.add_limb("arm_f", 0, self.ARM_W, EMER_L, (0.80, 1.0, 0.84), 0.7, seed + 10, tip=0.8)
        self.add_limb("arm_b", 0, self.ARM_W, EMER_D, EMER, -1.0, seed + 11, tip=0.82)
        self.add_limb("leg_f", 0, self.LEG_W, EMER, EMER_L, 0.3, seed + 12, tip=0.86)
        self.add_limb("leg_b", 0, self.LEG_W, EMER_D, EMER, -1.0, seed + 13, tip=0.86)
        n = 60
        s = rng.random(n)
        v = rng.random(n) * 2 - 1
        self.add("tail", np.stack([s, v], 1), np.zeros(n), np.tile(np.array([EMER]), (n, 1)), np.ones(n), -0.5)


class Tai(Rig):
    """Light heron: long thin legs, oval body, coral vest, long neck, clear beak, small dark crest.
    The wings act as arms (their light tips hold the sheet and the marker)."""
    POSES = _common_poses()
    HIP = (0.0, -206.0)
    NECK = (34.0, -418.0)
    SHOULDER_F = (20.0, -300.0)
    SHOULDER_B = (2.0, -302.0)
    ARM = (58.0, 52.0)
    ARM_W = (22.0, 14.0)
    LEG = (104.0, 100.0)
    LEG_W = (11.0, 8.0)
    FOOT = 30.0
    HIP_F = (8.0, -212.0)
    HIP_B = (-6.0, -212.0)
    HEADJ = (12.0, -14.0)
    TAIL = {"base": (-62.0, -250.0), "len": 46.0, "ang": 165.0, "curl": 0.6,
            "w": lambda s: 26 * (1 - np.clip(s, 0, 1)) + 4}
    SEED = 23

    def build(self):
        seed = self.SEED
        rng = np.random.default_rng(seed)
        # body, vest and the long neck (the neck belongs to the torso; the head turns at its top)
        cv = Canvas(240, 300, res=2)
        cv.ellipse(0, 40, 70, 52, FEATHER)
        cv.rect(-46, 2, 50, 88, VEST, r=16)
        cv.rect(-46, 70, 50, 88, VEST_D, r=8)
        cv.rect(2, 6, 8, 84, (1.0, 0.70, 0.55))
        pts = [(36, 10), (44, -30), (30, -70), (38, -110)]
        cv.line(pts, FEATHER, 20)
        self.add_canvas("torso", cv, 0, seed + 1, edge=0.45, depth=1.0, offset=(0, -300))
        cv = Canvas(200, 120, res=2.8)
        cv.ellipse(6, -14, 24, 19, FEATHER)
        cv.poly([(24, -22), (92, -12), (24, -6)], BEAK)
        cv.line([(-12, -28), (-34, -34), (-48, -30)], CREST, 4)
        cv.ellipse(-14, -20, 7, 6, CREST)
        self.add_canvas("head", cv, 0, seed + 2, edge=0.6, depth=0.9)
        k = 46
        ang = rng.random(k) * 2 * np.pi
        rr = np.sqrt(rng.random(k)) * 4.2
        self.add("eye", np.stack([12 + np.cos(ang) * rr, -20 + np.sin(ang) * rr], 1), np.full(k, 0.95),
                 np.tile(np.array([(0.08, 0.10, 0.25)]), (k, 1)), np.full(k, 1.15), 0.5, cy=-20)
        self.add_limb("arm_f", 0, self.ARM_W, FEATHER, FEATHER_D, 0.5, seed + 10, tip=0.78)
        self.add_limb("arm_b", 0, self.ARM_W, FEATHER_D, (0.45, 0.55, 0.85), -1.0, seed + 11, tip=0.78)
        self.add_limb("leg_f", 0, self.LEG_W, LEGC, LEGC, 0.3, seed + 12, tip=0.9)
        self.add_limb("leg_b", 0, self.LEG_W, tuple(x * 0.8 for x in LEGC), LEGC, -1.0, seed + 13, tip=0.9)
        n = 140
        s = rng.random(n)
        v = rng.random(n) * 2 - 1
        c = np.tile(np.array([FEATHER_D], np.float32), (n, 1))
        self.add("tail", np.stack([s, v], 1), np.zeros(n), c, np.ones(n), -0.5)


class Person(Rig):
    """Human-proportioned light citizen (Sai, the participants)."""
    POSES = _common_poses()
    HIP = (0.0, -190.0)
    NECK = (6.0, -350.0)
    SHOULDER_F = (12.0, -326.0)
    SHOULDER_B = (-2.0, -328.0)
    ARM = (70.0, 66.0)
    ARM_W = (24.0, 17.0)
    LEG = (96.0, 88.0)
    LEG_W = (32.0, 21.0)
    FOOT = 30.0
    HIP_F = (8.0, -192.0)
    HIP_B = (-6.0, -192.0)

    def __init__(self, jacket=JACKET, trouser=TROUSER, skin=SKIN, hair=HAIR, cap=True, seed=21, dens=1.0,
                 hair_style="short"):
        self.jacket, self.trouser, self.skin, self.hair = jacket, trouser, skin, hair
        self.cap, self.SEED, self.dens, self.hair_style = cap, seed, dens, hair_style
        super().__init__()

    def build(self):
        seed, D = self.SEED, self.dens
        jd = tuple(x * 0.72 for x in self.jacket)
        jd2 = tuple(x * 0.80 for x in self.jacket)
        cv = Canvas(160, 200, res=2)
        cv.rect(-44, -80, 46, 64, jd2, r=22)                  # short jacket, waist length
        cv.rect(-40, 56, 42, 76, jd, r=6)                       # hem
        cv.rect(4, -76, 10, 54, tuple(min(1, x * 1.25) for x in self.jacket))   # zip line
        self.add_canvas("torso", cv, int(2100 * D), seed + 1, edge=0.4, depth=1.0, offset=(2, -268))
        cv = Canvas(140, 140, res=2.6)
        cv.ellipse(4, -40, 31, 37, self.skin)
        if self.hair_style == "short":
            cv.ellipse(-6, -58, 30, 24, self.hair)
            cv.ellipse(-22, -40, 13, 22, self.hair)
        else:
            cv.ellipse(-4, -60, 32, 22, self.hair)
            cv.ellipse(-26, -36, 12, 30, self.hair)
        if self.cap:
            cv.ellipse(2, -66, 32, 15, self.jacket)
            cv.poly([(16, -66), (52, -60), (50, -55), (14, -58)], self.jacket)
        self.add_canvas("head", cv, int(1100 * D), seed + 2, edge=0.55, depth=0.9)
        k = 50
        ang = _rng(seed).random(k) * 2 * np.pi
        rr = np.sqrt(_rng(seed + 1).random(k)) * 3.8
        self.add("eye", np.stack([22 + np.cos(ang) * rr, -44 + np.sin(ang) * rr], 1), np.full(k, 0.95),
                 np.tile(np.array([(0.15, 0.2, 0.4)]), (k, 1)), np.full(k, 1.1), 0.5, cy=-44)
        self.add_limb("arm_f", int(560 * D), self.ARM_W, self.jacket, self.skin, 0.5, seed + 10, tip=0.88)
        self.add_limb("arm_b", int(480 * D), self.ARM_W, self.jacket, self.skin, -1.0, seed + 11, tip=0.88)
        self.add_limb("leg_f", int(700 * D), self.LEG_W, self.trouser, (0.85, 0.88, 1.0), 0.3, seed + 12, tip=0.86)
        self.add_limb("leg_b", int(640 * D), self.LEG_W, self.trouser, (0.85, 0.88, 1.0), -1.0, seed + 13, tip=0.86)




@functools.lru_cache(maxsize=None)
def rin():
    return Rin()


@functools.lru_cache(maxsize=None)
def tai():
    return Tai()


PEOPLE = {
    # Sai: a laconic colleague in a blue work silhouette (no cap, short dark hair)
    "sai": dict(jacket=(0.30, 0.46, 1.0), trouser=(0.22, 0.26, 0.62), skin=(0.98, 0.82, 0.70),
                hair=(0.22, 0.24, 0.52), cap=False, seed=31, dens=0.9),
    # participants of the training shifts and a client
    "mel": dict(jacket=(0.70, 0.86, 0.36), trouser=(0.30, 0.34, 0.66), skin=(1.0, 0.84, 0.72),
                hair=(0.55, 0.36, 0.30), cap=False, seed=41, dens=0.75, hair_style="long"),
    "dan": dict(jacket=(0.66, 0.50, 1.0), trouser=(0.30, 0.30, 0.62), skin=(0.95, 0.78, 0.66),
                hair=(0.20, 0.20, 0.40), cap=False, seed=51, dens=0.75),
    "ola": dict(jacket=(1.0, 0.72, 0.36), trouser=(0.36, 0.32, 0.66), skin=(1.0, 0.86, 0.76),
                hair=(0.70, 0.45, 0.35), cap=False, seed=61, dens=0.75, hair_style="long"),
    "client": dict(jacket=(0.50, 0.66, 0.95), trouser=(0.30, 0.34, 0.64), skin=(0.92, 0.82, 0.90),
                   hair=(0.55, 0.50, 0.85), cap=False, seed=71, dens=0.6),
    "far1": dict(jacket=(0.45, 0.55, 0.95), trouser=(0.30, 0.32, 0.70), skin=(0.82, 0.78, 1.0),
                 hair=(0.55, 0.50, 0.95), cap=False, seed=81, dens=0.5),
    "far2": dict(jacket=(0.80, 0.50, 0.85), trouser=(0.35, 0.30, 0.70), skin=(0.95, 0.80, 0.95),
                 hair=(0.60, 0.35, 0.75), cap=False, seed=91, dens=0.5, hair_style="long"),
}


@functools.lru_cache(maxsize=None)
def person(key):
    return Person(**PEOPLE[key])
