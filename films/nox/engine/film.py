"""Film runtime: key-framed actors (fox, morphing shapes, flows of lights, text) evaluated
from absolute frame time only (deterministic; any frame can be rendered independently)."""
import functools
import json
import math
import os
import re
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "tools"))
import fox  # noqa: E402
import shapes  # noqa: E402
import script as scriptmod  # noqa: E402

FPS = 30
W, H = 1920, 1080
TOTAL = 1800.0
SPACING = 4.3          # target on-screen distance between neighbouring dots, px
DOT = 3.3              # base dot diameter, px


def ease(u):
    u = min(1.0, max(0.0, u))
    return u * u * (3 - 2 * u)


def ease_arr(u):
    u = np.clip(u, 0, 1)
    return u * u * (3 - 2 * u)


def ease_out(u):
    u = min(1.0, max(0.0, u))
    return 1 - (1 - u) ** 3


# ------------------------------------------------------------------ timing
class Timing:
    """Absolute times of screenplay blocks and words, from the narration manifest."""

    def __init__(self, manifest_path=None):
        self.chapters = scriptmod.load()
        self.blocks = {}
        root = scriptmod.ROOT
        manifest_path = manifest_path or os.path.join(root, "voice", "blocks", "manifest.json")
        man = json.load(open(manifest_path))["blocks"] if os.path.exists(manifest_path) else {}
        self.estimated = False
        self.report = []
        for ch in self.chapters:
            c0 = (ch["index"] - 1) * 120.0
            items = []
            for b in ch["blocks"]:
                m = man.get(b["id"])
                if m and m.get("text") == b["text"]:
                    al_path = os.path.join(root, "voice", "blocks", f"{b['id']}.json")
                    al = json.load(open(al_path)) if os.path.exists(al_path) else None
                    s0, s1 = m["speech_start"], m["speech_end"]
                    items.append({"b": b, "dur": s1 - s0, "trim": s0, "file_dur": m["duration"], "al": al})
                else:
                    self.estimated = True
                    d = len(b["text"].split()) / 2.05
                    items.append({"b": b, "dur": d, "trim": 0.0, "file_dur": d, "al": None})
            lead = 0.35 if ch["index"] == 1 else 0.9
            tail = 1.2 if ch["index"] < 15 else 2.6
            gaps = [it["b"]["gap"] for it in items]
            gaps[-1] = 0.0
            speech = sum(it["dur"] for it in items)
            slack = 120.0 - lead - tail - speech - sum(gaps)
            if slack < 0:
                # compress gaps (min 0.35 s) before failing
                compressible = sum(max(0, g - 0.35) for g in gaps)
                f = max(0.0, 1 + slack / compressible) if compressible else 0
                gaps = [0.35 + max(0, g - 0.35) * f if g else 0 for g in gaps]
                slack = 120.0 - lead - tail - speech - sum(gaps)
            if slack > 0:
                flex = [i for i, it in enumerate(items[:-1]) if it["b"]["flex"]] or list(range(len(items) - 1))
                wsum = sum(gaps[i] for i in flex) or 1
                for i in flex:
                    gaps[i] += slack * gaps[i] / wsum
                slack = 0
            self.report.append({"chapter": ch["id"], "speech": round(speech, 2), "overflow": round(min(0, slack), 2)})
            t = c0 + lead
            for it, g in zip(items, gaps):
                b = it["b"]
                self.blocks[b["id"]] = {"start": t, "end": t + it["dur"], "trim": it["trim"], "dur": it["dur"],
                                        "file_dur": it["file_dur"], "al": it["al"], "text": b["text"],
                                        "chapter": ch["id"]}
                t += it["dur"] + g

    def S(self, bid, dt=0.0):
        return self.blocks[bid]["start"] + dt

    def E(self, bid, dt=0.0):
        return self.blocks[bid]["end"] + dt

    def C(self, ch_index, dt=0.0):
        return (ch_index - 1) * 120.0 + dt

    def words(self, bid):
        """[(word, abs_start, abs_end)] for a block (alignment if available, else proportional)."""
        b = self.blocks[bid]
        toks = b["text"].split()
        out = []
        al = b["al"]
        if al and al.get("characters"):
            chars = "".join(al["characters"])
            pos = 0
            for tok in toks:
                core = re.sub(r"[^\w]", "", tok)
                i = chars.find(tok, pos)
                ln = len(tok)
                if i < 0 and core:
                    i = chars.find(core, pos)
                    ln = len(core)
                if i < 0:
                    out.append(None)
                    continue
                a, e = i, i + ln - 1
                out.append((tok, b["start"] + al["start"][a] - b["trim"], b["start"] + al["end"][e] - b["trim"]))
                pos = i + ln
        if not out or any(o is None for o in out):
            wts = [1 + len(re.sub(r"[^\w]", "", t)) for t in toks]
            tot = sum(wts)
            acc = 0
            est = []
            for tok, w in zip(toks, wts):
                est.append((tok, b["start"] + b["dur"] * acc / tot, b["start"] + b["dur"] * (acc + w) / tot))
                acc += w
            out = [o if o else e for o, e in zip(out or [None] * len(est), est)]
        return out

    def Wd(self, bid, needle, occ=1, end=False):
        """Absolute time of the occ-th word containing `needle` (case-insensitive) in block."""
        k = 0
        for w in self.words(bid):
            if needle.lower() in w[0].lower().replace("ё", "е") or needle.lower() in w[0].lower():
                k += 1
                if k == occ:
                    return w[2] if end else w[1]
        raise KeyError(f"{bid}: word '{needle}' #{occ} not found")


# ------------------------------------------------------------------ keyframes
class Track:
    """Key-framed state. key(t, d, **vals): transition to vals starts at t and lasts d seconds."""

    def __init__(self, init):
        self.init = dict(init)
        self.keys = []
        self._starts = None

    def key(self, t, d=1.0, **vals):
        self.keys.append((float(t), max(1e-3, float(d)), vals))
        self._starts = None
        return self

    def _prepare(self):
        self.keys.sort(key=lambda k: k[0])
        starts = []
        cur = dict(self.init)
        prev = None
        for t, d, vals in self.keys:
            if prev is not None:
                pt, pd, pv, ps = prev
                # very short keys (d <= 0.02 s) are instantaneous "set" keys
                cur = _blend(ps, pv, 1.0 if pd <= 0.02 else ease((t - pt) / pd))
            starts.append(dict(cur))
            prev = (t, d, vals, dict(cur))
        self._starts = starts

    def at(self, T):
        if self._starts is None:
            self._prepare()
        i = -1
        for j, k in enumerate(self.keys):
            if k[0] <= T:
                i = j
            else:
                break
        if i < 0:
            st = dict(self.init)
            st["_from"], st["_to"], st["_u"] = st, st, 1.0
            return st
        t, d, vals = self.keys[i]
        s0 = self._starts[i]
        u = (T - t) / d
        out = _blend(s0, vals, ease(u))
        out["_from"], out["_to"], out["_u"], out["_raw"] = s0, {**s0, **vals}, min(1.0, max(0.0, u)), u
        out["_t0"] = t
        return out


def _blend(a, b, u):
    out = dict(a)
    for k, v in b.items():
        if k not in a:
            out[k] = v
            continue
        av = a[k]
        if isinstance(v, (int, float)) and isinstance(av, (int, float)):
            out[k] = av + (v - av) * u
        elif isinstance(v, tuple) and isinstance(av, tuple) and len(v) == len(av):
            out[k] = tuple(x + (y - x) * u for x, y in zip(av, v))
        else:
            out[k] = v if u >= 1.0 else av
    return out


# ------------------------------------------------------------------ actors
class Actor:
    layer = 0

    def emit(self, T):  # -> (x, y, size, r, g, b, a) arrays, world coords
        raise NotImplementedError


def _twinkle(n, seed, T, amount=0.12):
    rng = np.random.default_rng(seed)
    w = rng.uniform(0.6, 1.8, n)
    ph = rng.uniform(0, 6.28, n)
    return 1 - amount + amount * np.sin(T * w + ph)


class FoxActor(Actor):
    def __init__(self, seed=7):
        base = {"x": 960.0, "y": 900.0, "s": 1.0, "face": 1.0, "alpha": 0.0, "assemble": 1.0, "ox": 960.0,
                "oy": 540.0, "yaw": 0.0, "glow": 1.0, "dim": 1.0}
        base.update({k: float(v) for k, v in fox.POSE_DEFAULT.items()})
        self.tr = Track(base)
        self.seed = seed
        n = fox.count()
        rng = np.random.default_rng(99)
        self.rank = rng.permutation(n) / n
        self.delay = rng.random(n)
        self.scatter = rng.normal(0, 1, (n, 2)).astype(np.float32)
        self.layer = 5

    def key(self, t, d=1.0, pose=None, **kw):
        vals = {}
        if pose:
            p = dict(fox.POSE_DEFAULT)
            p.update(fox.POSES[pose] if isinstance(pose, str) else pose)
            vals.update({k: float(v) for k, v in p.items()})
        vals.update(kw)
        self.tr.key(t, d, **vals)
        return self

    def emit(self, T):
        st = self.tr.at(T)
        if st["alpha"] <= 0.003:
            return None
        pz = {k: st[k] for k in fox.POSE_DEFAULT}
        p, z, c, s = fox.evaluate(pz, T)
        S = st["s"]
        face = st["face"]
        x = st["x"] + p[:, 0] * S * face + z * st["yaw"] * 14 * S
        y = st["y"] + p[:, 1] * S
        keep = self.rank < min(1.0, (S / 1.45) ** 2 + 0.03)
        a_ = np.full(len(x), st["alpha"], np.float32) * _twinkle(len(x), 3, T, 0.1)
        asm = st["assemble"]
        if asm < 1.0:
            u = ease_arr((asm * 1.6 - self.delay * 0.6))
            ox, oy = st["ox"], st["oy"]
            sx = ox + self.scatter[:, 0] * 16 * (1 - u)
            sy = oy + self.scatter[:, 1] * 16 * (1 - u)
            x = sx + (x - sx) * u
            y = sy + (y - sy) * u
            a_ = a_ * (0.35 + 0.65 * u)
        col = fox.colors_for(c, z) * st["dim"]
        size = DOT * s * (0.88 + 0.22 * (np.clip(z, -1, 1) + 1) / 2) * np.clip(0.7 + 0.3 * S, 0.75, 1.25)
        out = np.stack([x, y, size, col[:, 0], col[:, 1], col[:, 2], a_], 1)[keep]
        return out


@functools.lru_cache(maxsize=256)
def _shape_arrays(name, n):
    if name.startswith("text:"):
        _, s, size, col = name.split(":", 3)
        sh = shapes.text_shape(s, n, size=int(size), color=shapes.hexc(col))
        return shapes.resample(sh, n)
    if name.startswith("pile:"):
        return _pile(name, n)
    return shapes.get(name, n)


def _pile(name, n):
    # 'pile:W:H:hex' rectangular heap of lights (for counters)
    _, w, h, col = name.split(":")
    w, h = float(w), float(h)
    rng = np.random.default_rng(int(w * 7 + h))
    p = np.stack([rng.uniform(-w / 2, w / 2, n), rng.uniform(-h / 2, h / 2, n)], 1).astype(np.float32)
    c = np.tile(np.array(shapes.hexc(col), np.float32), (n, 1))
    c = np.clip(c * rng.uniform(0.85, 1.1, (n, 1)), 0, 1).astype(np.float32)
    return {"p": p, "z": rng.uniform(-1, 1, n).astype(np.float32), "c": c,
            "s": np.ones(n, np.float32), "k": (1 - (p[:, 1] + h / 2) / h).astype(np.float32)}


@functools.lru_cache(maxsize=256)
def _perm(a, b, n):
    return shapes.match(_shape_arrays(a, n)["p"], _shape_arrays(b, n)["p"])


def shape_area(name):
    sh = _shape_arrays(name, 600)
    p = sh["p"]
    # rough filled area from point bbox density (units^2)
    return float(np.ptp(p[:, 0]) * np.ptp(p[:, 1]) * 0.45)


class ShapeActor(Actor):
    """A morphing particle object. key(t, d, shape=..., x, y, s, rot, alpha, assemble, level...)."""

    def __init__(self, shape, n=2400, seed=0, layer=3, **init):
        base = {"shape": shape, "x": 960.0, "y": 540.0, "s": 1.0, "rot": 0.0, "alpha": 0.0, "assemble": 1.0,
                "ox": 960.0, "oy": 540.0, "level": 1.0, "yaw": 0.0, "tint": (1.0, 1.0, 1.0, 0.0), "curve": 1.0,
                "bright": 1.0, "sx": 1.0, "sy": 1.0, "spread": 1.0, "glow": 1.0}
        base.update(init)
        self.tr = Track(base)
        self.n = n
        rng = np.random.default_rng(1000 + seed)
        self.rank = rng.permutation(n) / n
        self.delay = rng.random(n)
        self.scatter = rng.normal(0, 1, (n, 2)).astype(np.float32)
        self.curve_r = rng.normal(0, 1, n).astype(np.float32)
        self.seed = seed
        self.layer = layer

    def key(self, t, d=1.0, **kw):
        self.tr.key(t, d, **kw)
        return self

    def emit(self, T):
        st = self.tr.at(T)
        if st["alpha"] <= 0.003:
            return None
        n = self.n
        A, B, u = st["_from"]["shape"], st["_to"]["shape"], st["_u"]
        sb = _shape_arrays(B, n)
        if A != B and u < 1.0:
            sa = _shape_arrays(A, n)
            perm = _perm(A, B, n)
            ui = ease_arr(u * 1.5 - self.delay * 0.5)
            pa = sa["p"][perm]
            p = pa + (sb["p"] - pa) * ui[:, None]
            # curved paths: offset perpendicular to the travel direction
            dvec = sb["p"] - pa
            nrm = np.stack([-dvec[:, 1], dvec[:, 0]], 1) * 0.25 * st["curve"]
            p = p + nrm * (np.sin(np.pi * ui) * self.curve_r)[:, None]
            c = sa["c"][perm] + (sb["c"] - sa["c"][perm]) * ui[:, None]
            z = sa["z"][perm] + (sb["z"] - sa["z"][perm]) * ui
            s = sa["s"][perm] + (sb["s"] - sa["s"][perm]) * ui
            k = sb["k"]
        else:
            p, c, z, s, k = sb["p"], sb["c"], sb["z"], sb["s"], sb["k"]
        S = st["s"]
        rot = math.radians(st["rot"])
        cr, sr = math.cos(rot), math.sin(rot)
        px = p[:, 0] * st["sx"]
        py = p[:, 1] * st["sy"]
        yaw = st["yaw"] + 0.18 * math.sin(T * 0.35 + self.seed)
        x = st["x"] + (px * cr - py * sr) * S + z * yaw * 10 * S
        y = st["y"] + (px * sr + py * cr) * S
        a_ = np.full(n, st["alpha"], np.float32) * _twinkle(n, self.seed, T, 0.12)
        lvl = st["level"]
        if lvl < 1.0:
            vis = ease_arr((lvl - k) * 25 + 1)
            a_ = a_ * vis
        asm = st["assemble"]
        if asm < 1.0:
            uu = ease_arr(asm * 1.6 - self.delay * 0.6)
            ox, oy = st["ox"], st["oy"]
            sx_ = ox + self.scatter[:, 0] * 40 * st["spread"] * (1 - uu)
            sy_ = oy + self.scatter[:, 1] * 40 * st["spread"] * (1 - uu)
            x = sx_ + (x - sx_) * uu
            y = sy_ + (y - sy_) * uu
            a_ = a_ * (0.3 + 0.7 * uu)
        col = c * (0.82 + 0.25 * (np.clip(z, -1, 1) + 1) / 2)[:, None] * st["bright"]
        tint = st["tint"]
        if tint[3] > 0:
            col = col * (1 - tint[3]) + np.array(tint[:3]) * tint[3]
        col = np.clip(col, 0, 1)
        dens = min(1.0, (S * S * shape_area(B)) / (SPACING ** 2) / n + 0.02)
        keep = self.rank < dens
        size = DOT * s * np.clip(0.72 + 0.3 * S, 0.7, 1.3) * (0.9 + 0.2 * (np.clip(z, -1, 1) + 1) / 2)
        return np.stack([x, y, size, col[:, 0], col[:, 1], col[:, 2], a_], 1)[keep]


class Flow(Actor):
    """A stream of individual lights travelling from a source to destination slots.

    dst: list of (x, y) per particle (slot positions), or callable i -> (x, y).
    t0..t1: launch window; travel: seconds per particle; after arrival a light stays until
    `fade_at` (then fades over 0.6 s) or vanishes on arrival when stay=False."""

    def __init__(self, n, t0, t1, src, dst, color=shapes.AMBER, travel=1.1, arc=-120, size=1.0,
                 stay=True, fade_at=None, seed=0, src_spread=10, layer=4, alpha=1.0, order=None,
                 dst_fade=None, vanish_at_dst=False):
        self.n = n
        rng = np.random.default_rng(500 + seed)
        jitter = rng.uniform(-0.3, 0.3, n) * (t1 - t0) / max(1, n)
        idx = np.arange(n) if order is None else np.asarray(order)
        self.tl = t0 + (t1 - t0) * idx / max(1, n - 1) + jitter
        self.travel = travel * rng.uniform(0.85, 1.15, n)
        self.src = np.array(src, np.float32) + rng.normal(0, src_spread, (n, 2)).astype(np.float32)
        self.dst = np.array([dst(i) for i in range(n)] if callable(dst) else dst, np.float32)
        self.ctrl = (self.src + self.dst) / 2 + np.stack([rng.normal(0, 40, n), arc + rng.normal(0, 30, n)], 1)
        col = np.array(color, np.float32)
        if col.ndim == 1:
            col = np.tile(col, (n, 1))
        self.col = np.clip(col * rng.uniform(0.85, 1.12, (n, 1)), 0, 1).astype(np.float32)
        self.size = size * rng.uniform(0.85, 1.15, n)
        self.stay = stay
        self.fade_at = fade_at
        self.alpha = alpha
        self.layer = layer
        self.seed = seed
        self.vanish = vanish_at_dst

    def emit(self, T):
        u = (T - self.tl) / self.travel
        vis = u > 0
        if self.fade_at is not None and T > self.fade_at + 0.8:
            return None
        if not vis.any():
            return None
        uc = np.clip(u, 0, 1)
        e = uc * uc * (3 - 2 * uc)
        a = (1 - e)[:, None] ** 2 * self.src + 2 * ((1 - e) * e)[:, None] * self.ctrl + (e * e)[:, None] * self.dst
        alpha = np.full(self.n, self.alpha, np.float32)
        alpha *= np.clip(u * 4, 0, 1)
        if self.vanish:
            alpha *= np.clip((1.25 - u) * 4, 0, 1)
        elif not self.stay:
            alpha *= np.where(u > 1, 0, 1)
        if self.fade_at is not None:
            alpha *= np.clip(1 - (T - self.fade_at) / 0.6, 0, 1)
        alpha *= _twinkle(self.n, self.seed, T, 0.15)
        size = DOT * 1.15 * self.size * (1 + 0.25 * np.sin(np.pi * uc))
        out = np.concatenate([a, size[:, None], self.col, alpha[:, None]], 1)
        return out[vis & (alpha > 0.01)]


class Dust(Actor):
    """Sparse background lights in three depth layers (very slow drift)."""

    def __init__(self, n=520, seed=4):
        rng = np.random.default_rng(seed)
        self.p = np.stack([rng.uniform(0, W, n), rng.uniform(0, H, n)], 1)
        self.depth = rng.choice([0.25, 0.5, 0.85], n, p=[0.5, 0.33, 0.17])
        self.v = np.stack([rng.normal(0, 3, n), rng.normal(-2, 2, n)], 1)
        pal = np.array([shapes.BLUE, shapes.TURQ, shapes.VIOLET, shapes.PINK, shapes.AMBER], np.float32)
        self.c = pal[rng.integers(0, 5, n)]
        self.tw = rng.uniform(0.3, 1.2, n)
        self.ph = rng.uniform(0, 6.3, n)
        self.layer = -10
        self.tr = Track({"alpha": 1.0})

    def emit(self, T, cam=(960, 540, 1.0)):
        st = self.tr.at(T)
        if st["alpha"] <= 0.01:
            return None
        cx, cy, z = cam
        par = self.depth[:, None]
        q = self.p + self.v * T * par
        q[:, 0] = (q[:, 0] - (cx - 960) * par[:, 0] * 0.5) % (W + 40) - 20
        q[:, 1] = (q[:, 1] - (cy - 540) * par[:, 0] * 0.5) % (H + 40) - 20
        a = (0.12 + 0.35 * self.depth) * (0.6 + 0.4 * np.sin(T * self.tw + self.ph)) * st["alpha"]
        size = 1.5 + 2.2 * self.depth
        return np.concatenate([q, size[:, None], self.c, a[:, None]], 1)
