"""CH02 — Больше заработал — что изменилось? (02:00–04:00)"""
import numpy as np

import kit
import shapes
from stage import grid_slots, route, stagger

NEED, EXTRA, KEEP = shapes.BLUE, shapes.PINK, shapes.AMBER


def column(n, x, ybot, cols=20, d=9.0, seed=0):
    return grid_slots(n, x, ybot, cols, d, d, seed=seed, jitter=0.8)


def build(st):
    T = st.T
    nox, jar, fill = st.nox, st.jar, st.jarfill
    G = kit.GROUND
    c0 = T.C(2)
    tm = st.ch01_end["treadmill"]
    tm.key(c0 + 0.2, 1.2, assemble=0.0, ox=960, oy=1150)
    tm.key(c0 + 1.4, 0.2, alpha=0.0)
    nox.key(c0 + 0.2, 1.4, pose="think", x=330, y=G, s=0.9)

    # --- A: the second month in a stable chart: 1000 -> 700 need + 300 extra
    a0 = T.S("CH02-A")
    w1000 = T.Wd("CH02-A", "Тысяча")
    w700 = T.Wd("CH02-A", "Семьсот")
    w300 = T.Wd("CH02-A", "триста")
    n = 1000
    rng = np.random.default_rng(20)
    start = np.stack([rng.uniform(600, 1500, n), rng.uniform(-60, 40, n)], 1)
    col_all = column(n, 760, 860, seed=1)
    ts = stagger(n, w1000 - 0.8, w1000 + 0.6, 2)
    th = ts + 0.9
    order = np.argsort(-col_all[:, 1] + rng.normal(0, 4, n))   # bottom first
    need_i, ext_i = order[:700], order[700:]
    to = np.zeros(n)
    dst = col_all.copy()
    need_col = column(700, 1140, 860, seed=3)
    ext_col = column(300, 1460, 860, seed=4)
    dst[need_i] = need_col
    dst[ext_i] = ext_col
    tgo = np.zeros(n)
    tgo[need_i] = stagger(700, w700, w700 + 0.8, 5)
    tgo[ext_i] = stagger(300, w300, w300 + 0.6, 6)
    colr = np.tile(np.array(KEEP), (n, 1))
    colr[need_i] = NEED
    colr[ext_i] = EXTRA
    b_end = T.S("CH02-B")
    a_end = T.E("CH02-B2", 0.3)
    st.add(route(n, [(ts, start), (th, col_all)], seed=21, t_off=tgo, size=0.9, arc=-40))
    t_habit = T.S("CH02-B2")
    t_off = np.full(n, a_end)
    # B2: the purchases slide into "need" — habits become "necessary"
    habit_dst = column(300, 1140, 860 - 35 * 9.0, seed=7)
    pos3 = dst.copy()
    pos3[ext_i] = habit_dst
    th3 = np.zeros(n)
    th3[need_i] = t_habit
    th3[ext_i] = stagger(300, t_habit + 0.6, t_habit + 2.6, 8)
    st.add(route(n, [(tgo, col_all), (tgo + 0.9, dst), (th3, dst), (th3 + 1.1, pos3)], seed=22,
                 color=colr, t_off=t_off, size=0.9, arc=-30))
    st.cap(w1000, a_end, "1000", 760, 400, "numS")
    st.cap(w700 + 0.6, a_end, "Необходимое · *700*", 1140, 400, "small")
    st.cap(w300 + 0.5, b_end + 0.5, "Покупки · *300*", 1470, 400, "small")
    st.cap(a0, T.E("CH02-A", 1.0), "Условный пример · второй месяц", 110, 1000, "note", align="left")
    st.sound(w1000 - 0.6, "flow", 0.5)

    # --- B: the workshop "grows": a bigger sign, boxes; small empty wallet -> big empty wallet (gag)
    b0 = T.S("CH02-B")
    sign = kit.obj(st, "text:НОКС · РЕМОНТ:90:FFBD3F", 1600, seed=23, layer=3)
    sign.key(b0 - 0.01, 0.01, x=760, y=240, s=0.55, alpha=0.0)
    sign.key(b0 + 0.2, 1.0, alpha=1.0)
    sign.key(T.Wd("CH02-B", "вывеска"), 1.2, s=0.95)
    sign.key(T.E("CH02-B2"), 1.0, alpha=0.0)
    boxes = []
    for i, (x, sc) in enumerate(((560, 0.35), (640, 0.45), (600, 0.3))):
        bx = kit.obj(st, "box_open", 700, seed=24 + i, layer=2)
        tt = T.Wd("CH02-B", "коробки") + i * 0.25
        bx.key(tt - 0.01, 0.01, x=x, y=G - 50 - i * 25, s=sc, alpha=0.0, tint=(1.0, 0.55, 0.85, 0.35))
        bx.key(tt, 0.6, alpha=0.9)
        bx.key(T.E("CH02-B2"), 0.8, alpha=0.0)
        boxes.append(bx)
    w_small = T.Wd("CH02-B", "маленький")
    w_big = T.Wd("CH02-B", "большой")
    wal = kit.obj(st, "wallet_s", 1500, seed=27, layer=6)
    wal.key(w_small - 0.6, 0.01, x=470, y=640, s=0.6, alpha=0.0)
    wal.key(w_small - 0.5, 0.6, alpha=1.0)
    wal.key(w_big - 0.1, 1.1, shape="wallet_l", s=0.62, x=490, y=600)
    w_empty = T.Wd("CH02-B", "Тоже")
    st.cap(w_empty, T.E("CH02-B", 1.2), "Тоже пустой", 490, 410, "label")
    wal.key(T.E("CH02-B", 1.2), 0.8, alpha=0.0)
    nox.key(w_small - 0.6, 0.8, pose="carry")
    nox.key(w_big, 0.8, pose="proud")
    nox.key(w_empty, 0.6, pose="tilt", ear=24)
    st.sound(w_big, "pop", 0.4)
    st.sound(w_empty + 0.2, "deflate", 0.35)
    st.cap(t_habit + 0.8, T.E("CH02-B2", 0.3), "Привычное начинает\nказаться *необходимым*", 1460, 330, "small")

    # --- C: the same 1000, another split: two layers of one month, not two different people
    cc0 = T.S("CH02-C")
    st.light(cc0 - 0.9, T.E("CH02-C", 0.7))
    cend = T.E("CH02-C", 0.8)
    nox.key(cc0, 1.0, pose="calm", x=230, s=0.75)
    bars = []
    for side, (x0, vals, title) in enumerate(((760, (700, 300, 0), "Как было"), (1340, (700, 200, 100), "Другой вариант"))):
        tb = cc0 + 0.3 + side * (T.Wd("CH02-C", "Покупки") - cc0 - 0.3)
        st.cap(tb, cend, title, x0, 300, "label")
        xs = (x0 - 150, x0, x0 + 150)
        for k, (v, c, lab) in enumerate(zip(vals, (NEED, EXTRA, KEEP), ("нужное", "покупки", "остаток"))):
            slots = column(max(v, 1), xs[k], 830, cols=12, d=8.6, seed=30 + side * 3 + k)
            if v:
                t0 = tb + 0.2 + k * 0.6
                st.add(route(v, [(stagger(v, t0, t0 + 0.6, 40 + k), slots + np.array([0, -380])),
                                 (stagger(v, t0, t0 + 0.6, 40 + k) + 0.7, slots)], seed=31 + side * 3 + k,
                             color=c, t_off=np.full(v, cend), size=0.85, arc=0))
            st.cap(tb + 0.4 + k * 0.6, cend, f"{v}", xs[k], 870, "numS", size=40)
            st.cap(tb + 0.4 + k * 0.6, cend, lab, xs[k], 925, "note")
    w_one = T.Wd("CH02-C", "решении")
    st.cap(w_one - 0.3, cend, "Разница — в одном *решении*", 960, 170, "head")

    # --- D: income is a flow, reserve is what you keep
    d0 = T.S("CH02-D")
    dend = T.E("CH02-D", 0.8)
    w_flow = T.Wd("CH02-D", "поток")
    nflow = 420
    rng = np.random.default_rng(33)
    tf = stagger(nflow, d0 + 0.6, dend - 1.2, 34)
    p0 = np.stack([np.full(nflow, -40.0), 560 + rng.normal(0, 26, nflow)], 1)
    p1 = np.stack([np.full(nflow, 1960.0), 560 + rng.normal(0, 26, nflow)], 1)
    caught = rng.random(nflow) < 0.12
    jarpos = np.array([1240.0, 690.0])
    p_mid = np.where(caught[:, None], jarpos + rng.normal(0, 14, (nflow, 2)), (p0 + p1) / 2)
    p_end = np.where(caught[:, None], jarpos + np.stack([rng.normal(0, 22, nflow), rng.uniform(0, 40, nflow)], 1), p1)
    st.add(route(nflow, [(tf, p0), (tf + 2.2, p_mid), (tf + 2.2 + np.where(caught, 0.5, 2.2), p_end)], seed=35,
                 t_off=np.where(caught, dend, tf + 4.2), size=0.9, arc=0))
    jar.key(d0 + 0.2, 0.01, x=1240, y=720, s=0.6, alpha=0.0, bright=1.0)
    jar.key(d0 + 0.3, 0.8, alpha=1.0)
    jar.key(dend, 0.6, alpha=0.0)
    st.cap(w_flow - 0.2, dend, "Доход — *поток*", 700, 380, "head")
    st.cap(T.Wd("CH02-D", "Запас") - 0.1, dend, "Запас — то, что _удержано_", 1240, 880, "label")
    nox.key(d0, 1.0, pose="think", x=260, s=0.8)

    # --- E: caveat — when necessities do not fit into income, income matters most
    e0 = T.S("CH02-E")
    eend = T.E("CH02-E", 0.6)
    inc = column(600, 900, 860, cols=14, d=9.0, seed=50)
    nd = column(760, 1180, 860, cols=14, d=9.0, seed=51)
    st.add(route(600, [(stagger(600, e0 + 0.4, e0 + 1.2, 52), inc - np.array([0, 420])),
                       (stagger(600, e0 + 0.4, e0 + 1.2, 52) + 0.7, inc)], seed=53, color=KEEP,
                 t_off=np.full(600, eend), size=0.85, arc=0))
    st.add(route(760, [(stagger(760, e0 + 1.4, e0 + 2.4, 54), nd - np.array([0, 420])),
                       (stagger(760, e0 + 1.4, e0 + 2.4, 54) + 0.7, nd)], seed=55, color=NEED,
                 t_off=np.full(760, eend), size=0.85, arc=0))
    st.cap(e0 + 0.6, eend, "Доход", 900, 900, "small")
    st.cap(e0 + 1.6, eend, "Необходимое", 1180, 900, "small")
    st.cap(T.Wd("CH02-E", "главным") - 0.4, eend, "Тогда главное — *доход*", 1040, 250, "head")
    nox.key(e0, 1.0, pose="tilt")

    # --- F: he reaches for one more small thing — and stops his hand; the wallet edge -> 10 dots
    f0 = T.S("CH02-F")
    trinket = kit.obj(st, "heart", 500, seed=56, layer=4)
    trinket.key(f0 - 0.01, 0.01, x=720, y=620, s=0.35, alpha=0.0)
    trinket.key(f0 + 0.2, 0.6, alpha=0.9)
    nox.key(f0, 1.0, pose="walk", x=470, s=0.95)
    nox.key(f0 + 1.0, 1.0, pose="reach")
    w_stop = T.Wd("CH02-F", "останавливает")
    nox.key(w_stop, 0.5, pose="reach_stop", head=14, ear=12)
    st.sound(w_stop, "tick", 0.5)
    trinket.key(T.Wd("CH02-F", "Сколько"), 1.0, alpha=0.0)
    q = T.Wd("CH02-F", "Сколько")
    st.cap(q, T.E("CH02-F", 1.4), "Сколько он может *сохранить*?", 1150, 300, "head")
    st.cap(T.Wd("CH02-F", "ситуации") - 1.0, T.E("CH02-F", 1.4), "в своей ситуации", 1150, 380, "small")
    ten = kit.obj(st, "wallet_l", 1000, seed=57, layer=5)
    tdots = T.E("CH02-F", 0.2)
    ten.key(tdots - 0.01, 0.01, x=1150, y=620, s=0.5, alpha=0.0)
    ten.key(tdots, 0.6, alpha=0.9)
    xs10 = np.linspace(510, 1410, 10)
    st.ten_x = xs10
    st.ten_dots = []
    for i in range(10):
        tgt = (xs10[i], 600)
        dts = kit.obj(st, "dot", 120, seed=60 + i, layer=6)
        dts.key(tdots + 0.6 + i * 0.05, 0.01, x=tgt[0], y=tgt[1], s=4.0, alpha=1.0, assemble=0.0,
                ox=1150 + (i - 4.5) * 40, oy=620)
        dts.key(tdots + 0.6 + i * 0.05, 1.4, assemble=1.0)
        st.ten_dots.append(dts)
    ten.key(tdots + 0.6, 0.6, alpha=0.0)
