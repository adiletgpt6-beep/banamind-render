"""TB-003 film runtime: measured timeline, key-framed actors (rigs, morphing props, lights, dust).

Every frame is evaluated from the absolute time only (deterministic): any frame range can be rendered
independently and segments join seamlessly. Track/ShapeActor/Flow/Dust are adapted from the TB-001 engine;
Timing is new: it follows the 45 scenes of SCENES.json and the measured ElevenLabs narration."""
import bisect
import functools
import json
import math
import os
import re
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "..", "scripts", "three-books", "tb003"))
import shapes  # noqa: E402
import script as scriptmod  # noqa: E402

FPS = 30
W, H = 1920, 1080
TOTAL = 1800.0
SPACING = 4.2          # target on-screen distance between neighbouring dots, px
DOT = 3.2              # base dot diameter, px
GAP_IN = 0.85          # pause between blocks inside a scene, s
LEAD, TAIL = 1.1, 0.9  # minimal action before the first / after the last block of a scene, s
FINAL_HOLD = 4.0       # quiet frame after the last word of the film, s
WPS_EST = 2.2          # words per second for the estimate used before narration exists


def ease(u):
    u = min(1.0, max(0.0, u))
    return u * u * (3 - 2 * u)


def ease_arr(u):
    u = np.clip(u, 0, 1)
    return u * u * (3 - 2 * u)


# ------------------------------------------------------------------ timing
class Timing:
    """Absolute times of scenes, parts, speech blocks and words.

    Scene length = measured speech + pauses; the remaining time up to 1800 s is distributed over the scenes
    in proportion to the action room the storyboard planned for them (never by stretching speech)."""

    def __init__(self, manifest_path=None):
        self.parts = scriptmod.load()
        self.scene_list = scriptmod.scenes()
        bl = {b["id"]: b for b in scriptmod.all_blocks(self.parts)}
        manifest_path = manifest_path or os.path.join(scriptmod.VOICE_DIR, "blocks", "manifest.json")
        man = json.load(open(manifest_path))["blocks"] if os.path.exists(manifest_path) else {}
        self.estimated = []
        items = {}
        for bid, b in bl.items():
            m = man.get(bid)
            al_path = os.path.join(scriptmod.VOICE_DIR, "blocks", f"{bid}.json")
            if m and m.get("text") == b["text"] and os.path.exists(al_path):
                al = json.load(open(al_path))
                items[bid] = {"dur": m["speech_end"] - m["speech_start"], "trim": m["speech_start"],
                              "file_dur": m["duration"], "al": al}
            else:
                self.estimated.append(bid)
                d = len(b["text"].split()) / WPS_EST
                items[bid] = {"dur": d, "trim": 0.0, "file_dur": d, "al": None}
        need, plan = [], []
        for i, s in enumerate(self.scene_list):
            sp = sum(items[b]["dur"] for b in s["speech_blocks"]) + GAP_IN * (len(s["speech_blocks"]) - 1)
            lead = 0.5 if i == 0 else LEAD
            tail = TAIL + (FINAL_HOLD if i == len(self.scene_list) - 1 else 0)
            need.append(sp + lead + tail)
            plan.append(s["end_seconds"] - s["start_seconds"])
        slack = TOTAL - sum(need)
        self.slack = slack
        if slack < 0:
            raise SystemExit(f"narration too long for 1800 s by {-slack:.1f} s; edit the text, do not speed up")
        wts = [max(0.4, p - n) for p, n in zip(plan, need)]
        ws = sum(wts)
        extra = [slack * w / ws for w in wts]
        self.blocks, self.scenes = {}, []
        t = 0.0
        for i, s in enumerate(self.scene_list):
            e = extra[i]
            nb = len(s["speech_blocks"])
            lead = (0.5 if i == 0 else LEAD) + e * (0.45 if nb > 1 else 0.5)
            inner = e * 0.15 / (nb - 1) if nb > 1 else 0.0
            t0 = t
            tb = t0 + lead
            bids = []
            for k, bid in enumerate(s["speech_blocks"]):
                it = items[bid]
                self.blocks[bid] = {"start": tb, "end": tb + it["dur"], "trim": it["trim"], "dur": it["dur"],
                                    "file_dur": it["file_dur"], "al": it["al"], "text": bl[bid]["text"],
                                    "scene": s["scene_id"], "part": bl[bid]["part"]}
                bids.append(bid)
                tb += it["dur"] + (GAP_IN + inner if k < nb - 1 else 0)
            t = t0 + need[i] + e
            self.scenes.append({"id": s["scene_id"], "index": i + 1, "t0": t0, "t1": t, "blocks": bids,
                                "caption": s.get("caption", ""), "plan": (s["start_seconds"], s["end_seconds"])})
        self.scenes[-1]["t1"] = TOTAL
        self.scene = {s["id"]: s for s in self.scenes}
        self.part_times = {}
        for p in self.parts:
            first = p["blocks"][0]["id"]
            sc = self.scene[self.blocks[first]["scene"]]
            self.part_times[p["id"]] = sc["t0"]
        self._words = {}

    def S(self, bid, dt=0.0):
        return self.blocks[bid]["start"] + dt

    def E(self, bid, dt=0.0):
        return self.blocks[bid]["end"] + dt

    def words(self, bid):
        """[(word, abs_start, abs_end)] for a block (ElevenLabs alignment if available, else proportional)."""
        if bid in self._words:
            return self._words[bid]
        b = self.blocks[bid]
        toks = b["text"].split()
        out = []
        al = b["al"]
        if al and al.get("characters"):
            chars = "".join(al["characters"])
            # alignment is for the spoken text; map tokens by searching their letters in order
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
                a, e = i, min(i + ln - 1, len(al["end"]) - 1)
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
        self._words[bid] = out
        return out

    def W(self, bid, needle, occ=1, end=False):
        """Absolute time of the occ-th word containing `needle` (case-insensitive, ё = е) in a block."""
        k = 0
        nd = needle.lower().replace("ё", "е")
        for w in self.words(bid):
            if nd in w[0].lower().replace("ё", "е"):
                k += 1
                if k == occ:
                    return w[2] if end else w[1]
        raise KeyError(f"{bid}: word '{needle}' #{occ} not found")

    def timeline(self):
        return {"total": TOTAL, "fps": FPS, "estimated_blocks": self.estimated, "slack_s": round(self.slack, 2),
                "parts": [{"id": p["id"], "title": p["title"], "start": round(self.part_times[p["id"]], 3)}
                          for p in self.parts],
                "scenes": [{"id": s["id"], "start": round(s["t0"], 3), "end": round(s["t1"], 3),
                            "start_frame": int(round(s["t0"] * FPS)), "end_frame": int(round(s["t1"] * FPS)),
                            "blocks": s["blocks"]} for s in self.scenes],
                "blocks": {k: {"start": round(v["start"], 3), "end": round(v["end"], 3), "scene": v["scene"]}
                           for k, v in self.blocks.items()}}


# ------------------------------------------------------------------ keyframes
class Track:
    """Key-framed state with an independent timeline per property.

    key(t, d, **vals): each listed property starts moving to its value at t and arrives at t + d.
    Keys on different properties never interfere (a walk key does not cancel a simultaneous fade)."""

    def __init__(self, init):
        self.init = dict(init)
        self.keys = []
        self._props = None

    def key(self, t, d=1.0, **vals):
        self.keys.append((float(t), max(1e-3, float(d)), vals))
        self._props = None
        return self

    def _prepare(self):
        per = {}
        for t, d, vals in sorted(self.keys, key=lambda k: k[0]):
            for k, v in vals.items():
                per.setdefault(k, []).append((t, d, v))
        props = {}
        for k, lst in per.items():
            starts = []
            cur = self.init.get(k, lst[0][2])
            prev = None
            for t, d, v in lst:
                if prev is not None:
                    pt, pd, pv, ps = prev
                    cur = _lerp(ps, pv, 1.0 if pd <= 0.02 else ease((t - pt) / pd))
                starts.append(cur)
                prev = (t, d, v, cur)
            props[k] = ([x[0] for x in lst], lst, starts)
        self._props = props

    def at(self, T):
        if self._props is None:
            self._prepare()
        out = dict(self.init)
        shp = None
        for k, (times, lst, starts) in self._props.items():
            i = bisect.bisect_right(times, T) - 1
            if i < 0:
                continue
            t, d, v = lst[i]
            raw = (T - t) / d
            u = ease(raw)
            out[k] = _lerp(starts[i], v, 1.0 if d <= 0.02 and raw >= 0 else u)
            if k == "shape":
                shp = (starts[i], v, min(1.0, max(0.0, raw)))
        if shp is None:
            sh = out.get("shape")
            shp = (sh, sh, 1.0)
        out["_from"], out["_to"], out["_u"] = {"shape": shp[0]}, {"shape": shp[1]}, shp[2]
        return out


def _lerp(a, b, u):
    if isinstance(b, bool) or isinstance(a, bool):
        return b if u >= 1.0 else a
    if isinstance(b, (int, float)) and isinstance(a, (int, float)):
        return a + (b - a) * u
    if isinstance(b, tuple) and isinstance(a, tuple) and len(a) == len(b):
        return tuple(x + (y - x) * u for x, y in zip(a, b))
    return b if u >= 1.0 else a


def _blend(a, b, u):
    out = dict(a)
    for k, v in b.items():
        if k not in a:
            out[k] = v
            continue
        av = a[k]
        if isinstance(v, (int, float)) and isinstance(av, (int, float)) and not isinstance(v, bool):
            out[k] = av + (v - av) * u
        elif isinstance(v, tuple) and isinstance(av, tuple) and len(v) == len(av):
            out[k] = tuple(x + (y - x) * u for x, y in zip(av, v))
        else:
            out[k] = v if u >= 1.0 else av
    return out


# ------------------------------------------------------------------ actors
class Actor:
    layer = 0
    t_on = -1e9    # visibility window (fast reject)
    t_off = 1e9

    def emit(self, T):  # -> (x, y, size, r, g, b, a) arrays, world coords
        raise NotImplementedError


def _twinkle(n, seed, T, amount=0.12):
    rng = np.random.default_rng(seed)
    w = rng.uniform(0.6, 1.8, n)
    ph = rng.uniform(0, 6.28, n)
    return 1 - amount + amount * np.sin(T * w + ph)


@functools.lru_cache(maxsize=64)
def _tw_params(n, seed):
    rng = np.random.default_rng(seed)
    return rng.uniform(0.6, 1.8, n).astype(np.float32), rng.uniform(0, 6.28, n).astype(np.float32)


def twinkle(n, seed, T, amount=0.12):
    w, ph = _tw_params(n, seed)
    return 1 - amount + amount * np.sin(T * w + ph)


class RigActor(Actor):
    """A character rig (see rigs.py) with one fixed particle set and key-framed pose + placement."""

    def __init__(self, rig, layer=5, seed=7, **init):
        self.rig = rig
        base = {"x": 960.0, "y": 905.0, "s": 1.0, "face": 1.0, "alpha": 0.0, "assemble": 1.0, "ox": 960.0,
                "oy": 540.0, "dim": 1.0, "glow": 1.0}
        base.update({k: float(v) for k, v in rig.POSE_DEFAULT.items()})
        base.update(init)
        self.tr = Track(base)
        self.seed = seed
        n = rig.count()
        rng = np.random.default_rng(99 + seed)
        self.rank = rng.permutation(n) / n
        self.delay = rng.random(n)
        self.scatter = rng.normal(0, 1, (n, 2)).astype(np.float32)
        self.layer = layer
        self._cache = (None, None)

    def key(self, t, d=1.0, pose=None, **kw):
        vals = {}
        if pose:
            p = dict(self.rig.POSE_DEFAULT)
            p.update(self.rig.POSES[pose] if isinstance(pose, str) else pose)
            vals.update({k: float(v) for k, v in p.items()})
        vals.update(kw)
        self.tr.key(t, d, **vals)
        return self

    def _eval(self, T):
        if self._cache[0] == T:
            return self._cache[1]
        st = self.tr.at(T)
        pz = {k: st[k] for k in self.rig.POSE_DEFAULT}
        res = self.rig.evaluate(pz, T)
        self._cache = (T, (st, res))
        return st, res

    def joint(self, T, name):
        """World position of a joint ('hand_f', 'hand_b', 'head', 'chest')."""
        st, (p, z, c, s, joints) = self._eval(T)
        j = joints[name]
        S = st["s"]
        return np.array([st["x"] + j[0] * S * st["face"], st["y"] + j[1] * S], np.float32)

    def emit(self, T):
        st = self.tr.at(T)
        if st["alpha"] <= 0.003:
            return None
        st, (p, z, c, s, joints) = self._eval(T)
        S = st["s"]
        face = st["face"]
        x = st["x"] + p[:, 0] * S * face
        y = st["y"] + p[:, 1] * S
        a_ = np.full(len(x), st["alpha"], np.float32) * twinkle(len(x), 3 + self.seed, T, 0.1)
        asm = st["assemble"]
        if asm < 1.0:
            u = ease_arr((asm * 1.6 - self.delay * 0.6))
            sx = st["ox"] + self.scatter[:, 0] * 18 * (1 - u)
            sy = st["oy"] + self.scatter[:, 1] * 18 * (1 - u)
            x = sx + (x - sx) * u
            y = sy + (y - sy) * u
            a_ = a_ * (0.35 + 0.65 * u)
        b = 0.78 + 0.32 * (np.clip(z, -1.5, 1.2) + 1) / 2
        col = np.clip(c * b[:, None] * st["dim"], 0, 1)
        size = DOT * s * (0.88 + 0.22 * (np.clip(z, -1, 1) + 1) / 2) * np.clip(0.75 + 0.3 * S, 0.8, 1.3)
        keep = self.rank < min(1.0, (S / 1.4) ** 2 + 0.04)
        return np.stack([x, y, size, col[:, 0], col[:, 1], col[:, 2], a_], 1)[keep]


@functools.lru_cache(maxsize=512)
def _shape_arrays(name, n):
    if name.startswith("text:"):
        _, s, size, col = name.split(":", 3)
        sh = shapes.text_shape(s, n, size=int(size), color=shapes.hexc(col))
        return shapes.resample(sh, n)
    return shapes.get(name, n)


@functools.lru_cache(maxsize=512)
def _perm(a, b, n):
    return shapes.match(_shape_arrays(a, n)["p"], _shape_arrays(b, n)["p"])


@functools.lru_cache(maxsize=512)
def shape_area(name):
    sh = _shape_arrays(name, 600)
    p = sh["p"]
    return float(np.ptp(p[:, 0]) * np.ptp(p[:, 1]) * 0.45)


class ShapeActor(Actor):
    """A morphing particle object. key(t, d, shape=..., x, y, s, rot, alpha, assemble, level, att...).

    attach(rig, joint, dx, dy): while state 'att' > 0 the object follows that joint of the rig
    (blended with its own x/y by 'att'), so hands really hold the things they carry."""

    def __init__(self, shape, n=2400, seed=0, layer=3, **init):
        base = {"shape": shape, "x": 960.0, "y": 540.0, "s": 1.0, "rot": 0.0, "alpha": 0.0, "assemble": 1.0,
                "ox": 960.0, "oy": 540.0, "level": 1.0, "yaw": 0.0, "tint": (1.0, 1.0, 1.0, 0.0), "curve": 1.0,
                "bright": 1.0, "sx": 1.0, "sy": 1.0, "spread": 1.0, "att": 0.0, "adx": 0.0, "ady": 0.0,
                "flip": 1.0, "dense": 1.0}
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
        self.rig = None
        self.joint = None

    def key(self, t, d=1.0, **kw):
        self.tr.key(t, d, **kw)
        return self

    def attach(self, rig, joint):
        self.rig, self.joint = rig, joint
        return self

    def pos(self, T):
        st = self.tr.at(T)
        x, y = st["x"], st["y"]
        if self.rig is not None and st["att"] > 0:
            j = self.rig.joint(T, self.joint)
            x = x + (j[0] + st["adx"] - x) * st["att"]
            y = y + (j[1] + st["ady"] - y) * st["att"]
        return st, x, y

    def emit(self, T):
        st = self.tr.at(T)
        if st["alpha"] <= 0.003:
            return None
        st, X, Y = self.pos(T)
        n = self.n
        A, B, u = st["_from"]["shape"], st["_to"]["shape"], st["_u"]
        sb = _shape_arrays(B, n)
        if A != B and u < 1.0:
            sa = _shape_arrays(A, n)
            perm = _perm(A, B, n)
            ui = ease_arr(u * 1.5 - self.delay * 0.5)
            pa = sa["p"][perm]
            p = pa + (sb["p"] - pa) * ui[:, None]
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
        px = p[:, 0] * st["sx"] * st["flip"]
        py = p[:, 1] * st["sy"]
        yaw = st["yaw"] + 0.12 * math.sin(T * 0.35 + self.seed)
        x = X + (px * cr - py * sr) * S + z * yaw * 8 * S
        y = Y + (px * sr + py * cr) * S
        a_ = np.full(n, st["alpha"], np.float32) * twinkle(n, self.seed, T, 0.12)
        lvl = st["level"]
        if lvl < 1.0:
            a_ = a_ * ease_arr((lvl - k) * 25 + 1)
        asm = st["assemble"]
        if asm < 1.0:
            uu = ease_arr(asm * 1.6 - self.delay * 0.6)
            sx_ = st["ox"] + self.scatter[:, 0] * 40 * st["spread"] * (1 - uu)
            sy_ = st["oy"] + self.scatter[:, 1] * 40 * st["spread"] * (1 - uu)
            x = sx_ + (x - sx_) * uu
            y = sy_ + (y - sy_) * uu
            a_ = a_ * (0.3 + 0.7 * uu)
        col = c * (0.82 + 0.25 * (np.clip(z, -1, 1) + 1) / 2)[:, None] * st["bright"]
        tint = st["tint"]
        if tint[3] > 0:
            col = col * (1 - tint[3]) + np.array(tint[:3]) * tint[3]
        col = np.clip(col, 0, 1)
        dens = min(1.0, (S * S * abs(st["sx"] * st["sy"]) * shape_area(B)) / (SPACING ** 2) / n * st["dense"] + 0.02)
        keep = self.rank < dens
        size = DOT * s * np.clip(0.72 + 0.3 * S, 0.7, 1.3) * (0.9 + 0.2 * (np.clip(z, -1, 1) + 1) / 2)
        return np.stack([x, y, size, col[:, 0], col[:, 1], col[:, 2], a_], 1)[keep]


class Flow(Actor):
    """A stream of individual lights travelling from a source to destination points (attention, effort)."""

    def __init__(self, n, t0, t1, src, dst, color=shapes.AMBER, travel=1.1, arc=-120, size=1.0,
                 stay=True, fade_at=None, seed=0, src_spread=10, layer=4, alpha=1.0, vanish_at_dst=False):
        self.n = n
        rng = np.random.default_rng(500 + seed)
        jitter = rng.uniform(-0.3, 0.3, n) * (t1 - t0) / max(1, n)
        self.tl = t0 + (t1 - t0) * np.arange(n) / max(1, n - 1) + jitter
        self.travel = travel * rng.uniform(0.85, 1.15, n)
        self.src = np.array(src, np.float32) + rng.normal(0, src_spread, (n, 2)).astype(np.float32)
        dst = np.array(dst, np.float32)
        if dst.ndim == 1:
            dst = np.tile(dst, (n, 1)) + rng.normal(0, 8, (n, 2)).astype(np.float32)
        self.dst = dst
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
        self.t_on = float(self.tl.min())
        self.t_off = (fade_at + 1.0) if fade_at is not None else (float(self.tl.max() + self.travel.max() + 1.0)
                                                                    if not stay else 1e9)

    def emit(self, T):
        if T < self.t_on or T > self.t_off:
            return None
        u = (T - self.tl) / self.travel
        vis = u > 0
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
        alpha *= twinkle(self.n, self.seed, T, 0.15)
        size = DOT * 1.15 * self.size * (1 + 0.25 * np.sin(np.pi * uc))
        out = np.concatenate([a, size[:, None], self.col, alpha[:, None]], 1)
        return out[vis & (alpha > 0.01)]


class Dust(Actor):
    """Sparse background lights in three depth layers (very slow drift): the air of the station."""

    def __init__(self, n=480, seed=4):
        rng = np.random.default_rng(seed)
        self.p = np.stack([rng.uniform(0, W, n), rng.uniform(0, H, n)], 1)
        self.depth = rng.choice([0.25, 0.5, 0.85], n, p=[0.5, 0.33, 0.17])
        self.v = np.stack([rng.normal(0, 3, n), rng.normal(-2, 2, n)], 1)
        pal = np.array([shapes.BLUE, shapes.TURQ, shapes.VIOLET, shapes.PINK, shapes.AMBER], np.float32)
        self.c = pal[rng.integers(0, 5, n)]
        self.tw = rng.uniform(0.3, 1.2, n)
        self.ph = rng.uniform(0, 6.3, n)
        self.layer = -10

    def emit(self, T, cam=(960, 540, 1.0)):
        cx, cy, z = cam
        par = self.depth[:, None]
        q = self.p + self.v * T * par
        q[:, 0] = (q[:, 0] - (cx - 960) * par[:, 0] * 0.5) % (W + 40) - 20
        q[:, 1] = (q[:, 1] - (cy - 540) * par[:, 0] * 0.5) % (H + 40) - 20
        a = (0.12 + 0.33 * self.depth) * (0.6 + 0.4 * np.sin(T * self.tw + self.ph))
        size = 1.5 + 2.2 * self.depth
        return np.concatenate([q, size[:, None], self.c, a[:, None]], 1)
