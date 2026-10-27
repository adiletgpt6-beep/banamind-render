#!/usr/bin/env python3
"""Сборка 3D-персонажей ролика «Жумуштан жарым саатка» из MakeHuman (CC0).

Источник: базовая сетка MakeHuman hm08, скелет default (163 кости) с весами,
макро-таргеты (пол, возраст, телосложение, этничность), таргеты мимики
(asian), глаза high-poly — всё CC0 (см. tools/characters/fetch_makehuman.sh).

Для каждого персонажа:
  1) морфинг базы (возраст/пол/телосложение/этничность) и масштаб до роста;
  2) скелет по суставам, веса (до 4 костей на вершину);
  3) одежда из «вспомогательной» оболочки (helper-tights/helper-skirt),
     обувь, волосы (оболочка helper-hair + пучок/хвост), брови, ресницы,
     зубы, язык, полость рта, глаза;
  4) кожа под одеждой скрыта (без «прорастания» тела сквозь ткань);
  5) мимика — morph targets (моргание, брови, улыбка, рот: A/O/U/I/E…).
Результат: public/models/<имя>.glb (skinned glTF 2.0, метры, +Y вверх,
лицо смотрит в +Z, ступни на y = 0).

Запуск: tools/characters/fetch_makehuman.sh && python3 tools/characters/build_characters.py
"""
import json
import math
import os
import struct
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
MH = os.path.join(HERE, ".cache", "makehuman")
OUT = os.path.join(HERE, "..", "..", "public", "models")
DM = 0.1  # единицы MakeHuman — дециметры


# ---------------------------------------------------------------- загрузка
def load_obj(path):
    vs, vts, faces = [], [], []
    group = None
    for line in open(path):
        if line.startswith("v "):
            vs.append([float(x) for x in line.split()[1:4]])
        elif line.startswith("vt "):
            vts.append([float(x) for x in line.split()[1:3]])
        elif line.startswith("g "):
            group = line.split()[1]
        elif line.startswith("f "):
            idx, uv = [], []
            for t in line.split()[1:]:
                p = t.split("/")
                idx.append(int(p[0]) - 1)
                uv.append(int(p[1]) - 1 if len(p) > 1 and p[1] else -1)
            faces.append((group, idx, uv))
    return np.array(vs, dtype=np.float64), np.array(vts or [[0, 0]], dtype=np.float64), faces


def load_target(name):
    path = os.path.join(MH, "targets", name)
    idx, d = [], []
    for line in open(path):
        if not line.strip() or line.startswith("#"):
            continue
        p = line.split()
        idx.append(int(p[0]))
        d.append([float(p[1]), float(p[2]), float(p[3])])
    return np.array(idx, dtype=np.int64), np.array(d, dtype=np.float64).reshape(-1, 3)


def apply_target(verts, name, w):
    if abs(w) < 1e-6:
        return
    idx, d = load_target(name)
    if len(idx):
        verts[idx] += w * d


# ------------------------------------------------- макро-модификаторы (как в MH)
def age_value(years):
    return (years - 1) / 48.0 if years < 25 else 0.5 + (years - 25) / 130.0


def age_weights(v):
    if v < 0.5:
        baby = max(0.0, 1 - v * 5.333)
        young = max(0.0, (v - 0.1875) * 3.2)
        child = max(0.0, min(1.0, 5.333 * v) - young)
        return {"baby": baby, "child": child, "young": young, "old": 0.0}
    old = max(0.0, v * 2 - 1)
    return {"baby": 0.0, "child": 0.0, "young": 1 - old, "old": old}


def tri_weights(v, names):
    lo = max(0.0, 1 - v * 2)
    hi = max(0.0, (v - 0.5) * 2)
    return {names[0]: lo, names[1]: 1 - lo - hi, names[2]: hi}


def morph_macros(verts, c):
    g = {"female": 1 - c["gender"], "male": c["gender"]}
    a = age_weights(age_value(c["age"]))
    m = tri_weights(c["muscle"], ["minmuscle", "averagemuscle", "maxmuscle"])
    w = tri_weights(c["weight"], ["minweight", "averageweight", "maxweight"])
    for gn, gw in g.items():
        for an, aw in a.items():
            for mn, mw in m.items():
                for wn, ww in w.items():
                    k = gw * aw * mw * ww
                    if k > 1e-4:
                        apply_target(verts, f"macrodetails/universal-{gn}-{an}-{mn}-{wn}.target", k)
            for race, rw in c["race"].items():
                k = gw * aw * rw
                if k > 1e-4:
                    apply_target(verts, f"macrodetails/{race}-{gn}-{an}.target", k)


# ---------------------------------------------------------------- геометрия
def triangulate(faces):
    tris = []
    for f in faces:
        for i in range(1, len(f) - 1):
            tris.append([f[0], f[i], f[i + 1]])
    return np.array(tris, dtype=np.int64).reshape(-1, 3)


def vertex_normals(verts, tris):
    n = np.zeros_like(verts)
    a, b, c = verts[tris[:, 0]], verts[tris[:, 1]], verts[tris[:, 2]]
    fn = np.cross(b - a, c - a)
    for k in range(3):
        np.add.at(n, tris[:, k], fn)
    ln = np.linalg.norm(n, axis=1, keepdims=True)
    ln[ln == 0] = 1
    return n / ln


def srgb(h):
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]


# ------------------------------------------------------------- GLB-писатель
class Glb:
    def __init__(self):
        self.bin = bytearray()
        self.j = {
            "asset": {"version": "2.0", "generator": "BalaGo MakeHuman builder"},
            "buffers": [], "bufferViews": [], "accessors": [], "meshes": [],
            "nodes": [], "skins": [], "materials": [], "scenes": [], "scene": 0,
            "images": [], "textures": [], "samplers": [],
        }

    def view(self, data, target=None):
        while len(self.bin) % 4:
            self.bin.append(0)
        off = len(self.bin)
        self.bin += data
        v = {"buffer": 0, "byteOffset": off, "byteLength": len(data)}
        if target:
            v["target"] = target
        self.j["bufferViews"].append(v)
        return len(self.j["bufferViews"]) - 1

    def acc(self, arr, kind, ctype, target=None, minmax=False):
        arr = np.ascontiguousarray(arr)
        bv = self.view(arr.tobytes(), target)
        a = {"bufferView": bv, "componentType": ctype, "count": int(arr.shape[0]), "type": kind}
        if minmax:
            a["min"] = arr.min(axis=0).tolist()
            a["max"] = arr.max(axis=0).tolist()
        self.j["accessors"].append(a)
        return len(self.j["accessors"]) - 1

    def material(self, name, color, rough=0.7, metal=0.0, tex=None, double=False):
        m = {"name": name, "pbrMetallicRoughness": {
            "baseColorFactor": srgb(color) + [1.0], "roughnessFactor": rough, "metallicFactor": metal}}
        if tex is not None:
            m["pbrMetallicRoughness"]["baseColorTexture"] = {"index": tex}
            m["pbrMetallicRoughness"]["baseColorFactor"] = [1, 1, 1, 1]
        if double:
            m["doubleSided"] = True
        self.j["materials"].append(m)
        return len(self.j["materials"]) - 1

    def texture(self, png_path):
        data = open(png_path, "rb").read()
        bv = self.view(data)
        self.j["images"].append({"bufferView": bv, "mimeType": "image/png"})
        if not self.j["samplers"]:
            self.j["samplers"].append({"magFilter": 9729, "minFilter": 9987})
        self.j["textures"].append({"source": len(self.j["images"]) - 1, "sampler": 0})
        return len(self.j["textures"]) - 1

    def save(self, path):
        for k in ["images", "textures", "samplers"]:
            if not self.j[k]:
                del self.j[k]
        while len(self.bin) % 4:
            self.bin.append(0)
        self.j["buffers"] = [{"byteLength": len(self.bin)}]
        js = json.dumps(self.j, separators=(",", ":")).encode()
        while len(js) % 4:
            js += b" "
        with open(path, "wb") as f:
            f.write(struct.pack("<III", 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(self.bin)))
            f.write(struct.pack("<II", len(js), 0x4E4F534A) + js)
            f.write(struct.pack("<II", len(self.bin), 0x004E4942) + bytes(self.bin))


# --------------------------------------------------------------- скелет
def build_skeleton(verts, sk):
    joint = {n: verts[np.array(ix)].mean(axis=0) for n, ix in sk["joints"].items()}
    names = list(sk["bones"].keys())
    world = {}
    for n in names:
        b = sk["bones"][n]
        h, t = joint[b["head"]], joint[b["tail"]]
        y = t - h
        y = y / (np.linalg.norm(y) or 1)
        p = [joint[x] for x in sk["planes"].get(b["rotation_plane"], [])] if b.get("rotation_plane") in sk["planes"] else []
        if len(p) == 3:
            nrm = np.cross(p[1] - p[0], p[2] - p[1])
        else:
            nrm = np.array([0.0, 0.0, 1.0])
        x = np.cross(y, nrm)
        if np.linalg.norm(x) < 1e-6:
            x = np.cross(y, [0, 0, 1.0]) if abs(y[2]) < 0.9 else np.cross(y, [1.0, 0, 0])
        x /= np.linalg.norm(x)
        z = np.cross(x, y)
        m = np.eye(4)
        m[:3, 0], m[:3, 1], m[:3, 2], m[:3, 3] = x, y, z, h
        world[n] = m
    return names, world, joint


def mat_to_quat(m):
    t = m[0, 0] + m[1, 1] + m[2, 2]
    if t > 0:
        s = math.sqrt(t + 1.0) * 2
        w, x, y, z = 0.25 * s, (m[2, 1] - m[1, 2]) / s, (m[0, 2] - m[2, 0]) / s, (m[1, 0] - m[0, 1]) / s
    elif m[0, 0] > m[1, 1] and m[0, 0] > m[2, 2]:
        s = math.sqrt(1.0 + m[0, 0] - m[1, 1] - m[2, 2]) * 2
        w, x, y, z = (m[2, 1] - m[1, 2]) / s, 0.25 * s, (m[0, 1] + m[1, 0]) / s, (m[0, 2] + m[2, 0]) / s
    elif m[1, 1] > m[2, 2]:
        s = math.sqrt(1.0 + m[1, 1] - m[0, 0] - m[2, 2]) * 2
        w, x, y, z = (m[0, 2] - m[2, 0]) / s, (m[0, 1] + m[1, 0]) / s, 0.25 * s, (m[1, 2] + m[2, 1]) / s
    else:
        s = math.sqrt(1.0 + m[2, 2] - m[0, 0] - m[1, 1]) * 2
        w, x, y, z = (m[1, 0] - m[0, 1]) / s, (m[0, 2] + m[2, 0]) / s, (m[1, 2] + m[2, 1]) / s, 0.25 * s
    q = np.array([x, y, z, w])
    return (q / np.linalg.norm(q)).tolist()


# ------------------------------------------------------------- персонажи
# Одежда: регионы по доминирующей кости. sleeves: "long" | "short" | "none".
CHARACTERS = {
    "mom": dict(gender=0.0, age=34, muscle=0.5, weight=0.5,
                race={"asian": 0.8, "caucasian": 0.2}, height=1.63, lips="#C47D74",
                skin="#E3B48F", hair="#2B1D18", hairStyle="bun_low", brows="#2B1D18",
                top="#F4F1EA", topSleeves="long", bottom="#2F3C5C", shoes="#3A2A24",
                jacket=None, skirt=None),
    "son": dict(gender=1.0, age=10, muscle=0.5, weight=0.45,
                race={"asian": 0.8, "caucasian": 0.2}, height=1.38,
                skin="#E8BC98", hair="#1E1613", hairStyle="short_boy", brows="#1E1613",
                top="#F7F7F4", topSleeves="long", vest="#1F2F55", bottom="#1F2F55",
                shoes="#2A2A2E", jacket=None, skirt=None),
    "husband": dict(gender=1.0, age=37, muscle=0.55, weight=0.55,
                    race={"asian": 0.8, "caucasian": 0.2}, height=1.76,
                    skin="#D8A781", hair="#1A1412", hairStyle="short_man", brows="#1A1412",
                    top="#5E6E63", topSleeves="long", bottom="#3B4150", shoes="#2E2C2B",
                    jacket=None, skirt=None),
    "colleague": dict(gender=1.0, age=29, muscle=0.5, weight=0.45,
                      race={"asian": 0.7, "caucasian": 0.3}, height=1.78,
                      skin="#DDAE88", hair="#24201D", hairStyle="short_side", brows="#24201D",
                      top="#BFD3EA", topSleeves="long", bottom="#2E3440", shoes="#2B2622",
                      jacket=None, skirt=None),
    "teacher": dict(gender=0.0, age=48, muscle=0.45, weight=0.6,
                    race={"asian": 0.8, "caucasian": 0.2}, height=1.6,
                    skin="#DDB08C", hair="#3A2A22", hairStyle="bun_high", brows="#3A2A22",
                    top="#8C3B4B", topSleeves="long", bottom="#4A4F5E", shoes="#2B2626",
                    jacket=None, skirt=None),
    "boss": dict(gender=1.0, age=50, muscle=0.5, weight=0.6,
                 race={"asian": 0.8, "caucasian": 0.2}, height=1.74,
                 skin="#D6A882", hair="#6E6A66", hairStyle="short_man", brows="#4A4440",
                 top="#26324A", topSleeves="long", bottom="#26324A", shoes="#1E1F24",
                 jacket=None, skirt=None),
    # школьница и папа одноклассницы (у школы — других детей забирают раньше)
    "girl": dict(gender=0.0, age=9, muscle=0.5, weight=0.45,
                 race={"asian": 0.8, "caucasian": 0.2}, height=1.33,
                 skin="#E6BA97", hair="#241914", hairStyle="bun_high", brows="#241914",
                 top="#F7F7F4", topSleeves="long", vest="#6B2737", bottom="#2B2F3F",
                 shoes="#2A2A2E", jacket=None, skirt=None),
    "parent": dict(gender=1.0, age=42, muscle=0.55, weight=0.6,
                   race={"asian": 0.85, "caucasian": 0.15}, height=1.72,
                   skin="#D4A27C", hair="#1C1714", hairStyle="short_man", brows="#1C1714",
                   top="#7A5C45", topSleeves="long", bottom="#2F3340", shoes="#2A2420",
                   jacket=None, skirt=None),
}

TORSO = ("spine", "breast", "clavicle", "shoulder", "special01")
UPPER = ("upperarm",)
LOWER = ("lowerarm",)
HAND = ("wrist", "metacarpal", "finger")
HIPS = ("pelvis", "root")
LEG = ("upperleg", "lowerleg")
FOOT = ("foot", "toe")
HEAD = ("neck", "head", "jaw", "special0", "eye", "tongue", "orbicularis", "levator", "oculi", "temporalis", "risorius", "special")


def bone_class(name):
    for group, keys in (("hand", HAND), ("foot", FOOT), ("upper", UPPER), ("lower", LOWER),
                        ("leg", LEG), ("hips", HIPS), ("torso", TORSO), ("head", HEAD)):
        if any(name.startswith(k) for k in keys):
            return group
    return "head"


EXPRESSIONS = {
    "blink_L": "eye-left-closure", "blink_R": "eye-right-closure",
    "eyeWide_L": "eye-left-opened-up", "eyeWide_R": "eye-right-opened-up",
    "squint_L": "eye-left-slit", "squint_R": "eye-right-slit",
    "browDown_L": "eyebrows-left-down", "browDown_R": "eyebrows-right-down",
    "browInnerUp_L": "eyebrows-left-inner-up", "browInnerUp_R": "eyebrows-right-inner-up",
    "browUp_L": "eyebrows-left-up", "browUp_R": "eyebrows-right-up",
    "jawOpen": "mouth-open", "smile": "mouth-corner-puller", "frown": "mouth-depression",
    "pucker": "mouth-pursing", "wide": "mouth-retraction", "press": "mouth-compression",
    "funnel": "mouth-protusion", "upperUp": "mouth-elevation",
}


def catmull_clark(faces, nv):
    """Один шаг Catmull–Clark как разреженный линейный оператор S:
    новые вершины = S @ старые. Тот же S применяется к весам и морфам."""
    from scipy.sparse import coo_matrix
    used = sorted({i for f in faces for i in f})
    vmap = {v: k for k, v in enumerate(used)}
    nvp = len(used)
    edges = {}
    vfaces = [[] for _ in range(nv)]
    vnbr = [set() for _ in range(nv)]
    for fi, f in enumerate(faces):
        k = len(f)
        for i in range(k):
            a_, b_ = f[i], f[(i + 1) % k]
            e = (min(a_, b_), max(a_, b_))
            edges.setdefault(e, []).append(fi)
            vnbr[a_].add(b_)
            vnbr[b_].add(a_)
            vfaces[a_].append(fi)
    eid = {e: nvp + k for k, e in enumerate(edges)}
    fid0 = nvp + len(edges)
    rows, cols, vals = [], [], []

    def add(r, combo):
        for c_, w_ in combo.items():
            rows.append(r)
            cols.append(c_)
            vals.append(w_)

    def fpoint(fi):
        f = faces[fi]
        return {v: 1.0 / len(f) for v in f}

    def comb(*parts):
        out = {}
        for w_, d in parts:
            for k_, x in d.items():
                out[k_] = out.get(k_, 0.0) + w_ * x
        return out
    for fi in range(len(faces)):
        add(fid0 + fi, fpoint(fi))
    for e, fl in edges.items():
        a_, b_ = e
        if len(fl) == 2:
            add(eid[e], comb((0.25, {a_: 1.0, b_: 1.0}), (0.25, fpoint(fl[0])), (0.25, fpoint(fl[1]))))
        else:
            add(eid[e], {a_: 0.5, b_: 0.5})
    for v in used:
        bnd = [u for u in vnbr[v] if len(edges[(min(u, v), max(u, v))]) == 1]
        if bnd:
            if len(bnd) == 2:
                add(vmap[v], {v: 0.75, bnd[0]: 0.125, bnd[1]: 0.125})
            else:
                add(vmap[v], {v: 1.0})
            continue
        n = len(vnbr[v])
        F = comb(*[(1.0 / len(vfaces[v]), fpoint(fi)) for fi in vfaces[v]])
        R = comb(*[(1.0 / n, {v: 0.5, u: 0.5}) for u in vnbr[v]])
        add(vmap[v], comb((1.0 / n, F), (2.0 / n, R), ((n - 3.0) / n, {v: 1.0})))
    nnew = fid0 + len(faces)
    S = coo_matrix((vals, (rows, cols)), shape=(nnew, nv)).tocsr()
    newf, parent = [], []
    for fi, f in enumerate(faces):
        k = len(f)
        for i in range(k):
            a_, b_, p_ = f[i], f[(i + 1) % k], f[i - 1]
            newf.append([vmap[a_], eid[(min(a_, b_), max(a_, b_))], fid0 + fi, eid[(min(p_, a_), max(p_, a_))]])
            parent.append(fi)
    return S, newf, parent


def adjacency(tris, n):
    nb = [set() for _ in range(n)]
    for a_, b_, c_ in tris:
        nb[a_] |= {b_, c_}
        nb[b_] |= {a_, c_}
        nb[c_] |= {a_, b_}
    return nb



def loosen(Q, src, N, groups, slice_h=0.012, margin=0.0, straight_below=None):
    """Свободный крой: каждый поперечный срез группы (торс, рука, нога)
    выталкивается до своей выпуклой оболочки — ткань не повторяет вогнутости
    тела (под грудью, на талии, между мышцами)."""
    from scipy.spatial import ConvexHull
    out = Q.copy()
    for grp in groups:
        ids, origin, axis = grp[:3]
        straight = len(grp) > 3 and grp[3] == "straight"
        fourier = len(grp) > 3 and grp[3] == "fourier"
        if len(ids) < 10:
            continue
        a = axis / np.linalg.norm(axis)
        b1 = np.cross(a, [0, 0, 1.0])
        if np.linalg.norm(b1) < 1e-3:
            b1 = np.cross(a, [1.0, 0, 0])
        b1 /= np.linalg.norm(b1)
        b2 = np.cross(a, b1)
        rel = Q[ids] - origin
        sv = rel @ a
        uv = np.stack([rel @ b1, rel @ b2], axis=1)
        smin, smax = sv.min(), sv.max()
        nb = max(1, int((smax - smin) / slice_h))
        radii = {}
        for k in range(nb + 1):
            lo = smin + k * slice_h - slice_h * 0.5
            sel = np.where((sv >= lo) & (sv < lo + slice_h * 2))[0]
            if len(sel) < 4:
                continue
            pts = uv[sel]
            ctr = pts.mean(axis=0)
            try:
                hull = ConvexHull(pts)
            except Exception:
                continue
            poly = pts[hull.vertices]
            core = np.where((sv >= lo + slice_h * 0.5) & (sv < lo + slice_h * 1.5))[0]
            for i in core:
                d = uv[i] - ctr
                ln = np.linalg.norm(d)
                if ln < 1e-6:
                    continue
                d = d / ln
                best = ln
                for j in range(len(poly)):
                    p0, p1 = poly[j], poly[(j + 1) % len(poly)]
                    e = p1 - p0
                    den = d[0] * (-e[1]) - d[1] * (-e[0])
                    if abs(den) < 1e-12:
                        continue
                    w = p0 - ctr
                    t = (w[0] * (-e[1]) - w[1] * (-e[0])) / den
                    u = (d[0] * w[1] - d[1] * w[0]) / den
                    if t > 0 and -1e-6 <= u <= 1 + 1e-6:
                        best = max(best, t)
                r = best * (1 + margin)
                radii[i] = (ctr, d, r)
            if fourier and core.size:
                # торс: плавный контур среза (гармоники ≤ 4) — без «острых» точек
                ang = np.linspace(0, 2 * np.pi, 72, endpoint=False)
                rr = []
                for th in ang:
                    d = np.array([math.cos(th), math.sin(th)])
                    best = 0.0
                    for j in range(len(poly)):
                        p0, p1 = poly[j], poly[(j + 1) % len(poly)]
                        e = p1 - p0
                        den = d[0] * (-e[1]) - d[1] * (-e[0])
                        if abs(den) < 1e-12:
                            continue
                        w = p0 - ctr
                        t = (w[0] * (-e[1]) - w[1] * (-e[0])) / den
                        u = (d[0] * w[1] - d[1] * w[0]) / den
                        if t > 0 and -1e-6 <= u <= 1 + 1e-6:
                            best = max(best, t)
                    rr.append(best)
                rr = np.array(rr)
                # 8 гармоник с множителями Ланцоша — без ряби (эффект Гиббса)
                # между выпуклостями; ткань не уходит внутрь контура тела
                K = 8
                sig = [1.0] + [s_ for k in range(1, K + 1) for s_ in (np.sinc(k / (K + 1)),) * 2]
                A = np.stack([np.ones_like(ang)] + [f(k * ang) for k in range(1, K + 1) for f in (np.cos, np.sin)], axis=1)
                coef, *_ = np.linalg.lstsq(A, rr, rcond=None)
                coef = coef * np.array(sig)
                for i in core:
                    if i not in radii:
                        continue
                    c_, d_, r_ = radii[i]
                    th = math.atan2(d_[1], d_[0])
                    row = np.array([1.0] + [f(k * th) for k in range(1, K + 1) for f in (math.cos, math.sin)])
                    own = float(np.linalg.norm(uv[i] - c_))
                    radii[i] = (c_, d_, max(float(row @ coef), own) * (1 + margin))
        if straight and radii:
            # прямые брюки: ниже колена срез не уже, чем у колена
            L = smax - smin
            knee = [r for i, (c_, d_, r) in radii.items() if abs(sv[i] - (smin + 0.55 * L)) < slice_h]
            if knee:
                rk = np.percentile(knee, 60) * 1.02
                for i, (c_, d_, r) in list(radii.items()):
                    if sv[i] > smin + 0.55 * L:
                        radii[i] = (c_, d_, max(r, rk * (0.9 + 0.1 * np.clip((r / rk), 0, 1))))
        for i, (ctr, d, r) in radii.items():
            p2 = ctr + d * r
            out[ids[i]] = origin + a * sv[i] + b1 * p2[0] + b2 * p2[1]
    return out


def build(name, c, base, base_vt, faces, sk, mhw, eye_obj, eye_clo):
    from scipy.sparse import identity, vstack
    verts = base.copy()
    morph_macros(verts, c)
    nv = len(verts)
    by_group = {}
    for g, idx, uv in faces:
        by_group.setdefault(g, []).append(idx)

    names, world, joint = build_skeleton(verts, sk)
    bix = {n: i for i, n in enumerate(names)}
    W0 = np.zeros((nv, len(names)), dtype=np.float32)
    for b, lst in mhw["weights"].items():
        if b in bix:
            for i, w in lst:
                W0[i, bix[b]] = w

    # масштаб: метры, рост, ступни на 0, центр между бёдрами
    body_idx = np.unique(np.array([i for f in by_group["body"] for i in f]))
    h_dm = verts[body_idx, 1].max() - verts[body_idx, 1].min()
    s = c["height"] / h_dm
    shoe_lift = 0.012
    pelvis = joint["pelvis.L____head"] * 0.5 + joint["pelvis.R____head"] * 0.5
    origin = np.array([pelvis[0], verts[body_idx, 1].min(), pelvis[2]])

    def tm(p):
        return (p - origin) * s + np.array([0, shoe_lift, 0])
    V0 = tm(verts)
    for n in names:
        world[n][:3, 3] = tm(world[n][:3, 3])
    J = {k: tm(v) for k, v in joint.items()}

    morph_names = list(EXPRESSIONS.keys())
    D0 = {}
    for key, tname in EXPRESSIONS.items():
        idx, d = load_target(f"expression/units/asian/{tname}.target")
        full = np.zeros((nv, 3))
        full[idx] = d * s
        D0[key] = full

    # ---- подразделение тела (Catmull–Clark) + вспомогательные сетки как есть
    body_faces0 = by_group["body"]
    S, bf, parent = catmull_clark(body_faces0, nv)
    helpers = sorted({i for g in ("helper-l-eyelashes-1", "helper-r-eyelashes-1", "helper-upper-teeth", "helper-lower-teeth") for f in by_group[g] for i in f})
    H = identity(nv, format="csr")[helpers]
    T = vstack([S, H]).tocsr()
    hmap = {v: S.shape[0] + k for k, v in enumerate(helpers)}
    P = T @ V0
    W = np.asarray(T @ W0, dtype=np.float32)
    D = {k: T @ v for k, v in D0.items()}
    nP = len(P)
    vclass = np.array([bone_class(names[d]) for d in W.argmax(axis=1)])
    parent_cls = []
    for f in body_faces0:
        cl = [bone_class(names[d]) for d in W0[f].argmax(axis=1)]
        parent_cls.append(max(set(cl), key=cl.count))
    fcls = [parent_cls[p_] for p_ in parent]

    glb = Glb()
    mats = {}

    def mat(key, color, **kw):
        if key not in mats:
            mats[key] = glb.material(key, color, **kw)
        return mats[key]
    prims = []

    def make_prim(face_list, material, offset=0.0, extra=None, smooth=0, morphs=True, min_off=None, edge_smooth=0, clamp_y=None, loose=None, taubin=False, uv_fn=None, flat=None, taper=0, base=None):
        tris = triangulate(face_list)
        if len(tris) == 0:
            return None
        used = np.unique(tris)
        remap = -np.ones(nP, dtype=np.int64)
        remap[used] = np.arange(len(used))
        lt = remap[tris]
        B = P if base is None else base
        src = B[used].copy()
        N = vertex_normals(B, tris)[used]
        off = np.full(len(used), float(offset))
        if extra is not None:
            off = off + extra(src)
        Q = src + N * off[:, None]
        if loose is not None:
            Q = loosen(Q, src, N, loose(used), margin=0.008)
        if smooth:
            nb = adjacency(lt, len(used))
            nbl = [np.fromiter(x, dtype=np.int64) for x in nb]
            # Таубин (λ/μ): убирает мелкие выпуклости без «усадки» ткани
            for it in range(smooth):
                avg = np.array([Q[x].mean(axis=0) if len(x) else Q[i] for i, x in enumerate(nbl)])
                Q = Q + (0.5 if (it % 2 == 0 or not taubin) else -0.53) * (avg - Q)
                if min_off is not None and not taubin:
                    d = ((Q - src) * N).sum(axis=1)
                    lo = np.minimum(off, min_off)
                    Q = Q + N * np.maximum(0, lo - d)[:, None]
            if taubin and min_off is not None:
                d = ((Q - src) * N).sum(axis=1)
                Q = Q + N * np.maximum(0, min_off * 0.5 - d)[:, None]
        if flat is not None:
            # грудь под тканью — без «острых» вершин: глубина (z) передних
            # точек сглаживается как функция (x, y) гауссом σ≈2,2 см; x и y
            # не меняются (вершины не сбиваются в кучу)
            from scipy.spatial import cKDTree
            wgt = np.zeros(len(Q))
            for c0, rad in flat:
                d = np.linalg.norm(Q[:, :2] - c0[:2], axis=1)
                wgt = np.maximum(wgt, np.clip(1 - d / rad, 0, 1) ** 0.5)
            front = Q[:, 2] > (min(c0[2] for c0, _ in flat) - 0.07)
            sel = np.where((wgt > 0) & front)[0]
            if sel.size:
                kd = cKDTree(Q[sel, :2])
                z = Q[sel, 2].copy()
                for _ in range(2):
                    znew = z.copy()
                    for k_, i_ in enumerate(sel):
                        idx = kd.query_ball_point(Q[i_, :2], 0.07)
                        dd = np.linalg.norm(Q[sel[idx], :2] - Q[i_, :2], axis=1)
                        w_ = np.exp(-(dd / 0.028) ** 2)
                        znew[k_] = (z[idx] * w_).sum() / w_.sum()
                    z = znew
                # ткань не опускается ниже сглаженного «белья» больше чем на 2 мм
                Q[sel, 2] = Q[sel, 2] + (z - Q[sel, 2]) * wgt[sel]

        if edge_smooth:
            # края (ворот, манжеты, линия волос) — сглаживаем вдоль края
            cnt = {}
            for a_, b_, c_ in lt:
                for e in ((a_, b_), (b_, c_), (c_, a_)):
                    k = (min(e), max(e))
                    cnt[k] = cnt.get(k, 0) + 1
            bn = {}
            for (a_, b_), n_ in cnt.items():
                if n_ == 1:
                    bn.setdefault(a_, []).append(b_)
                    bn.setdefault(b_, []).append(a_)
            bv = [v for v, x in bn.items() if len(x) == 2]
            if bv:
                bv = np.array(bv)
                n1 = np.array([bn[v][0] for v in bv])
                n2 = np.array([bn[v][1] for v in bv])
                for _ in range(edge_smooth):
                    Q[bv] = 0.5 * Q[bv] + 0.25 * (Q[n1] + Q[n2])
        if taper:
            # край оболочки сходит на нет (без толстой «каски» по линии роста)
            cnt2 = {}
            for a_, b_, c_ in lt:
                for e in ((a_, b_), (b_, c_), (c_, a_)):
                    k = (min(e), max(e))
                    cnt2[k] = cnt2.get(k, 0) + 1
            ring = np.full(len(Q), 99)
            ring[[v for e, n_ in cnt2.items() if n_ == 1 for v in e]] = 0
            nb3 = adjacency(lt, len(used))
            for r_ in range(1, taper + 1):
                cur = np.where(ring == r_ - 1)[0]
                for v in cur:
                    for u in nb3[v]:
                        if ring[u] > r_:
                            ring[u] = r_
            tw = np.clip(ring / float(taper + 1), 0, 1)[:, None] ** 0.8
            # только по нормали: касательное сглаживание края сохраняется
            dn = ((Q - src) * N).sum(axis=1, keepdims=True) - 0.0015
            Q = Q - N * np.maximum(dn, 0) * (1 - tw)
        if clamp_y is not None:
            # чистая линия ворота: всё выше кривой опускаем на кривую
            lim = clamp_y(Q)
            Q[:, 1] = np.minimum(Q[:, 1], lim)
        Wp = W[used]
        if not morphs and smooth:
            # одежда: сглаженные веса — ткань не повторяет «защипы» тела при
            # движении рук (грудь, подмышки)
            nb4 = [np.fromiter(x, dtype=np.int64) for x in adjacency(lt, len(used))]
            for _ in range(12):
                Wp = 0.5 * Wp + 0.5 * np.array([Wp[x].mean(axis=0) if len(x) else Wp[i] for i, x in enumerate(nb4)])
            Wp = Wp / np.maximum(Wp.sum(axis=1, keepdims=True), 1e-9)
        p = dict(idx=used, tris=lt, mat=material, pos=Q, W=Wp, morphs=morphs)
        if uv_fn is not None:
            p["uv"] = uv_fn(Q)
        if morphs:
            p["targets"] = [D[k][used] for k in morph_names]
        prims.append(p)
        return p

    # ---- линии одежды
    neck_y = J["neck01____head"][1]
    waist_y = J["spine04____head"][1] * 0.35 + J["spine05____head"][1] * 0.65
    sleeves = c["topSleeves"]
    top_f, bot_f = [], []
    for f, cl in zip(bf, fcls):
        ys = P[f, 1]
        if cl in ("torso", "hips") and ys.min() >= waist_y - 0.03 and ys.max() < neck_y - 0.006:
            top_f.append(f)
        elif cl == "upper" or (cl == "lower" and sleeves == "long"):
            top_f.append(f)
        if (cl in ("torso", "hips") and ys.max() <= waist_y + 0.012) or (cl == "leg" and not c.get("skirt")):
            bot_f.append(f)
    neck_c = J["neck01____head"]
    neck_r = 0.065 * c["height"] / 1.65

    def neckline(Q):
        # круглый ворот: ниже спереди, выше сзади
        dz = np.clip((Q[:, 2] - neck_c[2]) / neck_r, -1, 1)
        dx = np.clip(np.abs(Q[:, 0] - neck_c[0]) / (neck_r * 1.6), 0, 1)
        base_y = neck_c[1] - 0.012 - 0.022 * np.clip(dz, 0, 1) * (1 - dx ** 2)
        far = np.clip((np.abs(Q[:, 0] - neck_c[0]) - neck_r * 1.3) / 0.05, 0, 1)
        return base_y + far * 1.0  # плечи и рукава не ограничиваем
    def body_groups(used, legs=True, arms=True, torso=True):
        g = []
        cls = vclass[used]
        xs = P[used, 0]
        if torso:
            ids = np.where(np.isin(cls, ["torso", "hips"]))[0]
            g.append((ids, np.array([0, 0, J["spine03____head"][2]]), np.array([0, 1.0, 0]), "fourier"))
        if arms:
            for side, sgn in (("L", 1), ("R", -1)):
                sh, wr = J[f"upperarm01.{side}____head"], J[f"wrist.{side}____head"]
                ids = np.where(np.isin(cls, ["upper", "lower"]) & (xs * sgn > 0))[0]
                g.append((ids, sh, wr - sh))
        if legs:
            for side, sgn in (("L", 1), ("R", -1)):
                hip, ank = J[f"upperleg01.{side}____head"], J[f"foot.{side}____head"]
                ids = np.where((cls == "leg") & (xs * sgn > 0))[0]
                g.append((ids, hip, ank - hip, "straight"))
        return g
    # точки сосков: самая выпуклая точка передней поверхности торса (z выше
    # среднего по соседям в радиусе 2,5 см) с каждой стороны; лопатки — сзади
    from scipy.spatial import cKDTree
    tor = np.where(np.isin(vclass, ["torso"]))[0]
    chest_pts = []
    for sgn in (1, -1):
        cand = tor[(P[tor, 0] * sgn > 0.02) & (P[tor, 1] < neck_y - 0.06) & (P[tor, 1] > neck_y - 0.32) & (P[tor, 2] > J["spine03____head"][2])]
        if cand.size:
            kd = cKDTree(P[cand])
            bump = np.array([P[i, 2] - P[cand[kd.query_ball_point(P[i], 0.025)], 2].mean() for i in cand])
            chest_pts.append((P[cand[np.argmax(bump)]], 0.12))
        cb = tor[(P[tor, 0] * sgn > 0.04) & (P[tor, 1] < neck_y - 0.06) & (P[tor, 1] > neck_y - 0.26)]
        if cb.size:
            chest_pts.append((P[cb[np.argmin(P[cb, 2])]], 0.1))
    # «бельё» под одеждой: тело около сосков и лопаток сглажено — ткань
    # повторяет мягкую форму, без точечных выпуклостей
    P_under = P.copy()
    btris = triangulate(bf)
    bnb = [np.fromiter(x, dtype=np.int64) for x in adjacency(btris, nP)]
    wgt_u = np.zeros(nP)
    # только грудь спереди (сглаживание спины давало просвет кожи на лопатках)
    for c0, rad in chest_pts:
        if c0[2] <= J["spine03____head"][2]:
            continue
        d = np.linalg.norm(P - c0, axis=1)
        wgt_u = np.maximum(wgt_u, np.clip(1 - d / rad, 0, 1) ** 0.5)
    sel_u = np.where(wgt_u > 0)[0]
    nbs = [bnb[i] for i in sel_u]
    if os.environ.get("DEBUG_FLAT"):
        print("under", [tuple(np.round(c0, 3)) for c0, _ in chest_pts])
    for _ in range(160):
        avg = np.array([P_under[x].mean(axis=0) if len(x) else P_under[i] for i, x in zip(sel_u, nbs)])
        P_under[sel_u] += 0.6 * wgt_u[sel_u, None] * (avg - P_under[sel_u])
    make_prim(top_f, mat("top", c["top"], rough=0.88), offset=0.008, smooth=120, morphs=False, min_off=0.006, edge_smooth=25, clamp_y=neckline,
              loose=lambda u: body_groups(u, legs=False), taubin=True, base=P_under,
              flat=[(c0, 0.13) for c0, r in chest_pts if c0[2] > J["spine03____head"][2]])
    if c.get("vest"):
        vest = [f for f, cl in zip(top_f, [fcls[bf.index(f)] if False else None for f in top_f]) if True]
        vest = [f for f in top_f if vclass[f[2]] in ("torso", "hips")]
        make_prim(vest, mat("vest", c["vest"], rough=0.8), offset=0.019, smooth=120, morphs=False, min_off=0.012, edge_smooth=25,
                  clamp_y=lambda Q: neckline(Q) - 0.03, loose=lambda u: body_groups(u, legs=False, arms=False), taubin=True, base=P_under)
    if c.get("shirtCollar"):
        # воротник рубашки: полоса у линии ворота поверх пиджака/жилета
        band = [f for f in top_f if vclass[f[2]] in ("torso", "hips") and (P[f, 1] > neckline(P[f]) - 0.035).all()]
        make_prim(band, mat("collar", c["shirtCollar"], rough=0.8), offset=0.016, smooth=60, morphs=False, min_off=0.009, edge_smooth=25,
                  clamp_y=lambda Q: neckline(Q) + 0.012, loose=lambda u: body_groups(u, legs=False, arms=False), taubin=True)
    make_prim(bot_f, mat("bottom", c["bottom"], rough=0.88), offset=0.015, smooth=80, morphs=False, min_off=0.008, edge_smooth=25,
              loose=lambda u: body_groups(u, arms=False), taubin=True)
    if c.get("skirt"):
        sk_faces = by_group["helper-skirt"]
        # юбка — отдельная оболочка MakeHuman (без подразделения)
        sidx = sorted({i for f in sk_faces for i in f})
        smap = {v: nP + k for k, v in enumerate(sidx)}
        P_extra = V0[sidx]
        W_extra = W0[sidx]
        extra_faces = [[smap[i] for i in f] for f in sk_faces]
        P_all = np.vstack([P, P_extra])
        tris = triangulate(extra_faces)
        used = np.unique(tris)
        remap = -np.ones(len(P_all), dtype=np.int64)
        remap[used] = np.arange(len(used))
        N = vertex_normals(P_all, tris)[used]
        prims.append(dict(idx=used, tris=remap[tris], mat=mat("skirt", c["skirt"], rough=0.88, double=True),
                          pos=P_all[used] + N * 0.006, W=np.vstack([W, W_extra])[used], morphs=False))

    # ---- обувь и кожа
    foot_f = [f for f, cl in zip(bf, fcls) if cl == "foot"]
    ankle_f = [f for f, cl in zip(bf, fcls) if cl == "leg" and P[f, 1].max() < J["foot.L____head"][1] + 0.03]
    # кожу под одеждой убираем с запасом: два кольца граней у края остаются
    covered = {tuple(f) for f in bot_f + foot_f}
    covered |= {tuple(f) for f in top_f if (P[f, 1] < neckline(P[f]) - 0.012).all()}
    for _ in range(2):
        edge_v = set()
        for f in bf:
            if tuple(f) not in covered:
                edge_v.update(f)
        covered = {f for f in covered if not any(v in edge_v for v in f)}
    hidden = covered
    skin_f = [f for f in bf if tuple(f) not in hidden]
    make_prim(skin_f, mat("skin", c["skin"], rough=0.6))
    # обувь: гладкая «суперэллипсоидная» форма по габаритам стопы в осях кости
    shoe_mat = mat("shoes", c["shoes"], rough=0.45)
    sole_mat = mat("sole", "#E9E4DC" if c.get("sneakers") else "#1E1B1A", rough=0.8)
    for side in ("L", "R"):
        fb = bix[f"foot.{side}"]
        fv = np.unique(np.array([i for f in foot_f for i in f]))
        fv = fv[(P[fv, 0] > 0) == (side == "L")]
        M = world[f"foot.{side}"]
        inv = np.linalg.inv(M)
        loc = (inv[:3, :3] @ P[fv].T).T + inv[:3, 3]
        lo, hi = loc.min(axis=0), loc.max(axis=0)
        ctr, ext = (lo + hi) / 2, (hi - lo) / 2 + 0.008
        seg, rings = 40, 24
        pts, tris = [], []
        e_ = 0.35
        for r_ in range(rings + 1):
            th = math.pi * r_ / rings
            for s_ in range(seg):
                ph = 2 * math.pi * s_ / seg
                sx = math.copysign(abs(math.sin(th) * math.cos(ph)) ** e_, math.sin(th) * math.cos(ph))
                sy = math.copysign(abs(math.cos(th)) ** e_, math.cos(th))
                sz = math.copysign(abs(math.sin(th) * math.sin(ph)) ** e_, math.sin(th) * math.sin(ph))
                pts.append([sx, sy, sz])
        for r_ in range(rings):
            for s_ in range(seg):
                a_ = r_ * seg + s_
                b_ = r_ * seg + (s_ + 1) % seg
                tris += [[a_, b_, a_ + seg], [b_, b_ + seg, a_ + seg]]
        L_ = np.array(pts) * ext + ctr
        Wp = (M[:3, :3] @ L_.T).T + M[:3, 3]
        Wp[:, 1] = np.maximum(Wp[:, 1], 0.0)  # подошва ровно на полу
        Wb = np.zeros((len(Wp), len(names)), dtype=np.float32)
        Wb[:, fb] = 1
        prims.append(dict(idx=None, tris=np.array(tris), mat=shoe_mat, pos=Wp, W=Wb, morphs=False))
    hidden |= {tuple(f) for f in ankle_f if P[f, 1].max() < J["foot.L____head"][1] - 0.005}

    # ---- ресницы и зубы (вспомогательные сетки MakeHuman)
    lash = [[hmap[i] for i in f] for g in ("helper-l-eyelashes-1", "helper-r-eyelashes-1") for f in by_group[g]]
    make_prim(lash, mat("lashes", "#16100E", rough=0.9, double=True))
    teeth = [[hmap[i] for i in f] for g in ("helper-upper-teeth", "helper-lower-teeth") for f in by_group[g]]
    make_prim(teeth, mat("teeth", "#F1ECE3", rough=0.35))

    # ---- брови: гладкая дуга (полином по точкам надбровной линии), лента
    # «пришита» к ближайшим вершинам кожи — следует мимике бровей
    dl = np.linalg.norm(D0["browUp_L"], axis=1) + np.linalg.norm(D0["browUp_R"], axis=1)
    body_set = set(body_idx.tolist())
    cand = np.array([i for i in np.where(dl > dl.max() * 0.3)[0] if i in body_set])
    n0 = vertex_normals(V0, triangulate(body_faces0))
    brow_rows = []
    for side in (1, -1):
        sv = cand[V0[cand, 0] * side > 0.004]
        if len(sv) < 6:
            continue
        x = np.abs(V0[sv, 0])
        wgt = dl[sv] ** 4
        cy = np.polyfit(x, V0[sv, 1], 2, w=wgt)
        cz = np.polyfit(x, V0[sv, 2], 2, w=wgt)
        x0, x1 = np.percentile(x, 6), np.percentile(x, 97)
        for k in range(10):
            t = k / 9
            xc = x0 + (x1 - x0) * t
            pt = np.array([xc * side, np.polyval(cy, xc), np.polyval(cz, xc)])
            d2 = ((V0[sv] - pt) ** 2).sum(axis=1)
            near = sv[np.argsort(d2)[:4]]
            ww = 1 / (np.sqrt(np.sort(d2)[:4]) + 1e-4)
            row = {int(i): float(w_ / ww.sum()) for i, w_ in zip(near, ww)}
            brow_rows.append((pt, t, row))
    if brow_rows:
        bp = np.array([r[0] for r in brow_rows])
        bw = np.array([sum(W0[i] * w_ for i, w_ in r[2].items()) for r in brow_rows])
        bd = {k: np.array([sum(D0[k][i] * w_ for i, w_ in r[2].items()) for r in brow_rows]) for k in morph_names}
        bn = np.array([sum(n0[i] * w_ for i, w_ in r[2].items()) for r in brow_rows])
        bn /= np.linalg.norm(bn, axis=1, keepdims=True)
        pos, ws, ds, tris = [], [], {k: [] for k in morph_names}, []
        width = 0.0062 * c["height"] / 1.65
        for k, (pt, t, _) in enumerate(brow_rows):
            half = width * (1.0 - 0.6 * t) * 0.5
            for sgn in (1, -1):
                lift = 0.0045 * t ** 1.3 - 0.001
                pos.append(pt + bn[k] * 0.0018 + np.array([0, half * sgn + width * 0.25 + lift, 0]))
                ws.append(bw[k])
                for m in morph_names:
                    ds[m].append(bd[m][k])
        for side_i in range(len(brow_rows) // 10):
            for k in range(9):
                a_ = (side_i * 10 + k) * 2
                tris += [[a_, a_ + 2, a_ + 1], [a_ + 1, a_ + 2, a_ + 3]]
        prims.append(dict(idx=None, tris=np.array(tris), mat=mat("brows", c["brows"], rough=0.9, double=True),
                          pos=np.array(pos), W=np.array(ws), morphs=True,
                          targets=[np.array(ds[m]) for m in morph_names]))

    # ---- волосы: оболочка головы выше линии роста волос
    head_f = [f for f, cl in zip(bf, fcls) if cl == "head"]
    hv = np.unique(np.array([i for f in head_f for i in f]))
    head_top = P[hv, 1].max()
    brow_y = bp[:, 1].mean() if brow_rows else head_top - 0.09
    zf, zb = P[hv, 2].max(), P[hv, 2].min()
    ear_x = np.abs(P[hv, 0]).max()
    style = c["hairStyle"]
    front_line = brow_y + (0.40 if style.startswith("short") else 0.47) * (head_top - brow_y)
    back_line = J["neck03____head"][1] + (0.03 if style.startswith("short") else -0.015)

    def hair_face(f):
        p_ = P[f].mean(axis=0)
        t = np.clip((zf - p_[2]) / (zf - zb), 0, 1)
        line = front_line + (back_line - front_line) * t ** 1.3
        # линия роста волос — мягкая дуга: выше по центру лба, ниже к вискам
        line += 0.008 * max(0.0, 1 - (p_[0] / (ear_x * 0.55)) ** 2) * (1 - t) ** 2
        if p_[1] < line:
            return False
        if style.startswith("short") and abs(p_[0]) > ear_x * 0.84 and p_[1] < brow_y + 0.012 and t < 0.78:
            return False
        if not style.startswith("short") and abs(p_[0]) > ear_x * 0.9 and p_[1] < brow_y - 0.035 and t < 0.6:
            return False
        return True
    hair_f = [f for f in head_f if hair_face(f)]
    vol = {"short_boy": 0.016, "short_man": 0.012, "short_side": 0.017, "bun_low": 0.017, "bun_high": 0.015}[style]
    head_c = J["head____head"]

    def head_groups(used):
        return [(np.arange(len(used)), np.array([head_c[0], 0, head_c[2]]), np.array([0, 1.0, 0]), "fourier")]

    # макушка (точка, от которой «растут» пряди): сзади-сверху
    crown = np.array([head_c[0], head_top - 0.015, zb + (zf - zb) * 0.32])

    def hair_uv(Q):
        # полярная развёртка вокруг макушки: v — вдоль прядей, u — поперёк
        ax = (crown - np.array([head_c[0], head_c[1] - 0.02, (zf + zb) / 2]))
        ax /= np.linalg.norm(ax)
        d = Q - crown
        b1 = np.cross(ax, [1.0, 0, 0])
        b1 /= np.linalg.norm(b1)
        b2 = np.cross(ax, b1)
        ang = np.arctan2(d @ b2, d @ b1)
        dist = np.linalg.norm(d, axis=1)
        return np.stack([(ang / (2 * np.pi) + 0.5) * 24.0, dist / 0.2 * 2.0], axis=1)

    def hair_extra(Q):
        k = np.clip((Q[:, 1] - front_line) / (head_top - front_line + 1e-6), 0, 1)
        if style.startswith("short"):
            # короткая стрижка: объём сверху, виски и затылок — коротко
            k = np.clip((Q[:, 1] - (head_top - 0.075)) / 0.075, 0, 1) ** 1.2
            front = np.clip((Q[:, 2] - head_c[2]) / 0.08, 0, 1)
            return 0.0025 + k * vol * (0.8 + 0.5 * front)
        return 0.004 + k ** 0.6 * vol

    def hair_up(Q):
        k = np.clip((Q[:, 1] - front_line) / (head_top - front_line + 1e-6), 0, 1)
        return 0.003 + k ** 0.6 * vol
    hp = make_prim(hair_f, mat("hair", c["hair"], rough=0.62), extra=hair_extra, smooth=40, morphs=False, min_off=0.004, edge_smooth=30,
                   loose=head_groups, taubin=True, uv_fn=hair_uv, taper=3)
    if hp is not None and style.startswith("short"):
        # чёлка: передний край чуть вперёд и вниз (нависает над лбом)
        Q = hp["pos"]
        front = (Q[:, 2] > head_c[2] + 0.02)
        near = np.clip(1 - (Q[:, 1] - Q[front, 1].min()) / 0.035, 0, 1) * front
        Q += np.stack([np.zeros(len(Q)), -near * 0.006, near * 0.010], axis=1)
    if False and style in ("bun_low", "bun_high"):
        # пряди у лица: две мягкие ленты от висков вдоль щёк
        for sgn in (1, -1):
            top = np.array([sgn * ear_x * 0.9, front_line - 0.012, head_c[2] + 0.045])
            pts, ws, tris = [], [], []
            n_ = 8
            for k in range(n_ + 1):
                t = k / n_
                c_ = top + np.array([sgn * (0.003 * math.sin(t * math.pi) - 0.004 * t), -0.06 * t, -0.006 * t])
                wdt = 0.0075 * (1 - 0.7 * t)
                for e in (-1, 1):
                    pts.append(c_ + np.array([0, 0, e * wdt]))
                    wrow = np.zeros(len(names), dtype=np.float32)
                    wrow[bix["head"]] = 1
                    ws.append(wrow)
            for k in range(n_):
                a_ = 2 * k
                tris += [[a_, a_ + 1, a_ + 2], [a_ + 1, a_ + 3, a_ + 2]]
            uv = np.array([[e * 0.5 + 0.5, k / n_ * 2] for k in range(n_ + 1) for e in (-1, 1)])
            prims.append(dict(idx=None, tris=np.array(tris), mat=mats["hair"], pos=np.array(pts), W=np.array(ws),
                              morphs=False, uv=uv, double=True))

    # ---- глаза: без прозрачной роговицы (её UV — в синем круге текстуры)
    eye_v, eye_vt, eye_faces = eye_obj
    ref, wts, offs, scl = eye_clo
    s_vec = np.array([abs(verts[a_, k] - verts[b_, k]) / dist for k, (a_, b_, dist) in enumerate(scl)])
    EV = tm((verts[ref] * wts[:, :, None]).sum(axis=1) + offs * s_vec)
    EW = (W0[ref] * wts[:, :, None]).sum(axis=1)
    eye_tex = glb.texture(os.path.join(MH, "eyes", "materials", "brown_eye.png"))
    eye_mat = glb.material("eyes", "#FFFFFF", rough=0.2, tex=eye_tex)
    glb.j["materials"][eye_mat]["pbrMetallicRoughness"]["baseColorFactor"] = [0.92, 0.88, 0.86, 1]

    extra = []
    if style in ("bun_low", "bun_high"):
        hp = P[[i for f in hair_f for i in f]]
        cy = head_top - (0.075 if style == "bun_low" else 0.03)
        r = 0.048 if style == "bun_low" else 0.042
        extra.append(("bun", np.array([0.0, cy, hp[:, 2].min() - r * 0.45]), (r, r * 0.82, r * 0.78), "head", "hair"))
    teeth_v = P[[hmap[i] for g in ("helper-upper-teeth", "helper-lower-teeth") for f in by_group[g] for i in f]]
    tc = teeth_v.mean(axis=0)
    tw = teeth_v[:, 0].max() - teeth_v[:, 0].min()
    extra.append(("mouth", tc + np.array([0, -tw * 0.05, -tw * 0.32]), (tw * 0.4, tw * 0.34, tw * 0.42), "head", "mouthInside"))

    # ======================= запись glTF =======================
    def weights4(Wrows):
        order = np.argsort(-Wrows, axis=1)[:, :4]
        wv = np.take_along_axis(Wrows, order, axis=1)
        sm = wv.sum(axis=1, keepdims=True)
        sm[sm == 0] = 1
        return order.astype(np.uint16), (wv / sm).astype(np.float32)

    jt_first = 0
    for i, n in enumerate(names):
        par = sk["bones"][n]["parent"]
        local = np.linalg.inv(world[par]) @ world[n] if par else world[n]
        glb.j["nodes"].append({"name": n, "translation": local[:3, 3].tolist(), "rotation": mat_to_quat(local[:3, :3])})
    for i, n in enumerate(names):
        ch = [bix[m] for m, b in sk["bones"].items() if b["parent"] == n]
        if ch:
            glb.j["nodes"][i]["children"] = ch
    root_joint = bix[[n for n in names if not sk["bones"][n]["parent"]][0]]
    ibm = np.stack([np.linalg.inv(world[n]).T for n in names]).astype(np.float32)
    glb.j["skins"].append({"joints": list(range(len(names))), "inverseBindMatrices": glb.acc(ibm.reshape(len(names), 16), "MAT4", 5126), "skeleton": root_joint})
    mesh_nodes = []

    def sparse_target(t):
        nz = np.where(np.abs(t).max(axis=1) > 1e-7)[0]
        n = len(t)
        if len(nz) == 0:
            nz = np.array([0])
        ib = glb.view(nz.astype(np.uint32).tobytes())
        vb = glb.view(t[nz].astype(np.float32).tobytes())
        acc = {"componentType": 5126, "count": int(n), "type": "VEC3",
               "min": t.min(axis=0).astype(np.float32).tolist(), "max": t.max(axis=0).astype(np.float32).tolist(),
               "sparse": {"count": int(len(nz)), "indices": {"bufferView": ib, "componentType": 5125}, "values": {"bufferView": vb}}}
        glb.j["accessors"].append(acc)
        return len(glb.j["accessors"]) - 1

    def add_mesh(mname, plist):
        gp_list = []
        for p in plist:
            Pp = p["pos"].astype(np.float32)
            tris = p["tris"].astype(np.int64)
            N = vertex_normals(Pp.astype(np.float64), tris).astype(np.float32)
            Jn, Wt = weights4(p["W"])
            attrs = {"POSITION": glb.acc(Pp, "VEC3", 5126, 34962, minmax=True),
                     "NORMAL": glb.acc(N, "VEC3", 5126, 34962),
                     "JOINTS_0": glb.acc(Jn, "VEC4", 5123, 34962),
                     "WEIGHTS_0": glb.acc(Wt, "VEC4", 5126, 34962)}
            if p.get("uv") is not None:
                attrs["TEXCOORD_0"] = glb.acc(p["uv"].astype(np.float32), "VEC2", 5126, 34962)
            if len(Pp) < 65535:
                ind = glb.acc(tris.reshape(-1).astype(np.uint16), "SCALAR", 5123, 34963)
            else:
                ind = glb.acc(tris.reshape(-1).astype(np.uint32), "SCALAR", 5125, 34963)
            gp = {"attributes": attrs, "indices": ind, "material": p["mat"]}
            if p.get("targets") is not None:
                gp["targets"] = [{"POSITION": sparse_target(t)} for t in p["targets"]]
            gp_list.append(gp)
        m = {"name": mname, "primitives": gp_list}
        if any(p.get("targets") is not None for p in plist):
            m["weights"] = [0.0] * len(morph_names)
            m["extras"] = {"targetNames": morph_names}
            for gp in gp_list:
                if "targets" not in gp:
                    raise RuntimeError("all primitives of a morph mesh need targets")
        glb.j["meshes"].append(m)
        glb.j["nodes"].append({"name": mname, "mesh": len(glb.j["meshes"]) - 1, "skin": 0})
        mesh_nodes.append(len(glb.j["nodes"]) - 1)

    add_mesh("Body", [p for p in prims if p["morphs"]])
    add_mesh("Outfit", [p for p in prims if not p["morphs"]])

    tri_v, tri_uv = [], []
    for g, f, uv in eye_faces:
        uvs = eye_vt[np.array(uv)]
        if (uvs[:, 0] > 0.84).all() and (uvs[:, 1] < 0.16).all():
            continue  # роговица
        for i in range(1, len(f) - 1):
            tri_v += [f[0], f[i], f[i + 1]]
            tri_uv += [uv[0], uv[i], uv[i + 1]]
    tri_v = np.array(tri_v)
    UV = eye_vt[np.array(tri_uv)].copy()
    UV[:, 1] = 1 - UV[:, 1]
    add_mesh("Eyes", [dict(pos=EV[tri_v], tris=np.arange(len(tri_v)).reshape(-1, 3), mat=eye_mat, W=EW[tri_v], uv=UV)])

    ext = []
    for key, center, radii, bone, mkey in extra:
        seg, rings = 28, 18
        pts, tris = [], []
        for r_ in range(rings + 1):
            th = math.pi * r_ / rings
            for s_ in range(seg):
                ph = 2 * math.pi * s_ / seg
                pts.append([math.sin(th) * math.cos(ph), math.cos(th), math.sin(th) * math.sin(ph)])
        for r_ in range(rings):
            for s_ in range(seg):
                a_ = r_ * seg + s_
                b_ = r_ * seg + (s_ + 1) % seg
                tris += [[a_, b_, a_ + seg], [b_, b_ + seg, a_ + seg]]
        Pp = np.array(pts) * np.array(radii) + center
        Wb = np.zeros((len(Pp), len(names)), dtype=np.float32)
        Wb[:, bix[bone]] = 1
        mm = mats["hair"] if mkey == "hair" else mat("mouthInside", "#2A1012", rough=0.95)
        ext.append(dict(pos=Pp, tris=np.array(tris), mat=mm, W=Wb))
    add_mesh("Extras", ext)

    glb.j["scenes"].append({"name": name, "nodes": mesh_nodes + [root_joint]})
    glb.j["asset"]["extras"] = {"character": name, "height": c["height"], "license": "CC0 (MakeHuman assets)"}
    os.makedirs(OUT, exist_ok=True)
    out = os.path.join(OUT, f"{name}.glb")
    glb.save(out)
    print(f"+ {out}: {os.path.getsize(out) / 1e6:.2f} МБ, вершин {nP}, костей {len(names)}, мимика {len(morph_names)}")


def load_mhclo(path):
    ref, wts, offs, scl = [], [], [], [None, None, None]
    in_verts = False
    for line in open(path):
        p = line.split()
        if not p or p[0].startswith("#"):
            continue
        if p[0] in ("x_scale", "y_scale", "z_scale"):
            scl["xyz".index(p[0][0])] = (int(p[1]), int(p[2]), float(p[3]))
        elif p[0] == "verts":
            in_verts = True
        elif in_verts and len(p) == 9:
            ref.append([int(x) for x in p[:3]])
            wts.append([float(x) for x in p[3:6]])
            offs.append([float(x) for x in p[6:9]])
        elif in_verts and p[0] in ("delete_verts", "material"):
            in_verts = False
    return np.array(ref), np.array(wts), np.array(offs), scl


def main():
    only = sys.argv[1:]
    base, base_vt, faces = load_obj(os.path.join(MH, "3dobjs", "base.obj"))
    sk = json.load(open(os.path.join(MH, "rigs", "default.mhskel")))
    mhw = json.load(open(os.path.join(MH, "rigs", "default_weights.mhw")))
    ev, evt, ef = load_obj(os.path.join(MH, "eyes", "high-poly", "high-poly.obj"))
    clo = load_mhclo(os.path.join(MH, "eyes", "high-poly", "high-poly.mhclo"))
    for name, c in CHARACTERS.items():
        if only and name not in only:
            continue
        build(name, c, base, base_vt, faces, sk, mhw, (ev, evt, ef), clo)


if __name__ == "__main__":
    main()
