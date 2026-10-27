"""CH01 — Куда исчез месяц? (00:00–02:00)"""
import numpy as np

import kit
import shapes
from stage import disc, route, stagger

NEED = shapes.BLUE
EXTRA = shapes.PINK


def build(st):
    T = st.T
    nox, jar, fill = st.nox, st.jar, st.jarfill
    G = kit.GROUND

    # --- A: one point -> Nox; 800 lights through his paws; 700 need + 100 purchases; all gone
    spark = kit.obj(st, "dot", 80, seed=11, layer=6, x=960, y=520)
    spark.key(0.0, 0.25, alpha=1.0, s=1.8)
    spark.key(0.45, 0.5, alpha=0.0, s=0.4)
    st.sound(0.05, "spark", 0.7)
    nox.key(0.0, 0.01, pose="carry", x=560, y=G, s=1.0, alpha=1.0, assemble=0.0, ox=960, oy=520)
    nox.key(0.25, 2.0, assemble=1.0)
    st.ground.key(0.6, 1.5, alpha=0.5)
    # shelf with the empty vessel (left, high)
    plank = kit.obj(st, "plank", 500, seed=12, layer=2, x=230, y=640, s=0.6)
    plank.key(1.2, 1.0, alpha=0.8)
    jar.key(1.2, 0.01, x=230, y=560, s=0.55, alpha=0.0)
    jar.key(1.3, 1.0, alpha=0.95)
    fill.key(0, 0.01, x=230, y=560, s=0.55, alpha=1.0, level=0.0)

    w_800 = T.Wd("CH01-A", "восемьсот")
    w_month = T.Wd("CH01-A", "Месяц")
    hold = (745, 700)
    n1 = 800
    rng = np.random.default_rng(1)
    src = np.stack([rng.uniform(150, 1400, n1), rng.uniform(-60, 80, n1)], 1)
    t_s = stagger(n1, w_800 - 0.5, w_800 + 1.2, 1)
    t_h = t_s + rng.uniform(0.8, 1.2, n1)
    hp = disc(n1, *hold, 58, 2)
    st.cap(w_800 + 0.6, w_month + 3.2, "800", hold[0] + 150, hold[1] - 105, "num")
    arc = kit.obj(st, "timearc", 1200, seed=13, layer=1, x=560, y=640, s=0.95)
    kit.appear(arc, w_month - 0.1, 1.0, alpha=0.75)
    st.cap(w_month + 0.2, w_month + 3.0, "1 месяц", 560, 300, "small")
    arc.key(w_month + 3.2, 1.0, alpha=0.0)
    st.sound(w_800, "flow", 0.6)

    need = kit.Bin(st, 1250, 590, "Необходимое", 1000, seed=21, cols=26, dx=9.6, dy=9.6)
    extra = kit.Bin(st, 1640, 590, "Покупки", 400, seed=22, cols=26, dx=9.6, dy=9.6)
    w_go = T.Wd("CH01-A", "уходят")
    w_part = T.Wd("CH01-A", "часть")
    w_last = T.Wd("CH01-A", "последнему")
    w_none = T.Wd("CH01-A", "одного", end=True)
    need.show(w_go - 0.8, T.E("CH01-B") + 1.0)
    extra.show(w_go - 0.6, T.E("CH01-B") + 1.0)
    order = np.argsort(hp[:, 0] + rng.normal(0, 20, n1))
    is_need = np.zeros(n1, bool)
    is_need[order[:700]] = True
    t_go = np.empty(n1)
    t_go[order[:700]] = stagger(700, w_go, w_part + 0.4, 3)
    t_go[order[700:]] = stagger(100, w_part, w_part + 1.0, 4)
    dst = np.zeros((n1, 2), np.float32)
    dst[order[:700]] = need.slots[:700]
    dst[order[700:]] = extra.slots[:100]
    t_arr = t_go + 0.9
    # spending: lights fade from the top of each bin; the last purchase light goes out at "одного"
    t_off = np.empty(n1)
    t_off[order[:700]] = stagger(700, w_last - 0.2, w_none - 0.6, 5, order=np.arange(699, -1, -1))
    t_off[order[700:]] = stagger(100, w_last, w_none - 0.4, 6, order=np.arange(99, -1, -1))
    t_off[order[700]] = w_none
    col = np.where(is_need[:, None], np.array(NEED), np.array(EXTRA))
    col = np.where((np.arange(n1) % 1 == 0)[:, None], col, col)
    # lights are amber while held (money), take the category colour on arrival
    st.add(route(n1, [(t_s, src), (t_h, hp), (t_go, hp), (t_arr, dst)], seed=1, color=shapes.AMBER,
                 t_off=t_go + 0.45, size=0.95))
    st.add(route(n1, [(t_go + 0.45, hp + (dst - hp) * 0.45), (t_arr, dst)], seed=2, color=col, t_off=t_off,
                 size=0.95, arc=-30))
    st.cap(w_go + 1.2, w_last + 0.5, "700", 1250, 815, "numS")
    st.cap(w_part + 1.0, w_last + 0.5, "100", 1640, 815, "numS")
    st.cap(w_800, T.E("CH01-B", 1.0), "Условный пример: 1 огонёк = 1 единица", 110, 1000, "note", align="left")
    st.sound(w_go, "flow", 0.5)
    nox.key(w_go, 1.0, pose="gesture")
    nox.key(w_last, 1.2, pose="tilt")
    st.sound(w_none, "out", 0.6)

    # --- B: more work -> 1000 lights; 700 need + 300 purchases; the vessel is still empty
    b0 = T.S("CH01-B")
    w_1000 = T.Wd("CH01-B", "тысяча")
    w_jar = T.Wd("CH01-B", "сосуд")
    nox.key(b0, 0.8, pose="work")
    nox.key(b0 + 1.2, 0.8, pose="carry")
    n2 = 1000
    rng = np.random.default_rng(3)
    src2 = np.stack([rng.uniform(150, 1400, n2), rng.uniform(-60, 80, n2)], 1)
    ts2 = stagger(n2, w_1000 - 1.6, w_1000 + 0.2, 7)
    th2 = ts2 + rng.uniform(0.7, 1.0, n2)
    hp2 = disc(n2, *hold, 66, 8)
    st.cap(w_1000 + 0.4, w_jar + 0.4, "1000", hold[0] + 165, hold[1] - 110, "num")
    order2 = np.argsort(hp2[:, 0] + rng.normal(0, 20, n2))
    is_need2 = np.zeros(n2, bool)
    is_need2[order2[:700]] = True
    tgo2 = np.empty(n2)
    tgo2[order2[:700]] = stagger(700, w_1000 + 0.6, w_jar - 0.2, 9)
    tgo2[order2[700:]] = stagger(300, w_1000 + 0.9, w_jar + 0.1, 10)
    dst2 = np.zeros((n2, 2), np.float32)
    dst2[order2[:700]] = need.slots[:700]
    dst2[order2[700:]] = extra.slots[:300]
    tarr2 = tgo2 + 0.8
    tout2 = np.full(n2, T.E("CH01-B") + 0.3) + rng.uniform(0, 0.9, n2)
    col2 = np.where(is_need2[:, None], np.array(NEED), np.array(EXTRA))
    st.add(route(n2, [(ts2, src2), (th2, hp2), (tgo2, hp2), (tarr2, dst2)], seed=3, t_off=tgo2 + 0.4, size=0.95))
    st.add(route(n2, [(tgo2 + 0.4, hp2 + (dst2 - hp2) * 0.45), (tarr2, dst2)], seed=4, color=col2, t_off=tout2,
                 size=0.95, arc=-30))
    st.cap(w_1000 + 1.6, T.E("CH01-B") + 0.4, "700", 1250, 815, "numS")
    st.cap(w_1000 + 1.9, T.E("CH01-B") + 0.4, "300", 1640, 815, "numS")
    st.sound(w_1000, "flow", 0.6)
    # camera glides to the empty vessel
    st.cam.key(w_jar - 0.3, 1.4, cx=640, cy=560, z=1.18)
    st.cap(w_jar + 0.5, T.E("CH01-B") + 1.4, "Остаток: *0*", 230, 400, "label")
    jar.key(w_jar, 0.6, bright=1.35)
    jar.key(w_jar + 1.5, 0.8, bright=1.0)
    nox.key(w_jar, 1.0, pose="tilt", face=-1.0)

    # --- C: income grew, the feeling did not. Two lines: earned 800 -> 1000, left 0 -> 0
    c0 = T.S("CH01-C")
    st.cam.key(c0 - 0.4, 1.4, cx=960, cy=540, z=1.0)
    nox.key(c0, 1.2, pose="think", face=1.0, x=430)
    x0, x1 = 900, 1640
    n_l = 70
    u = np.linspace(0, 1, n_l)
    earn = np.stack([x0 + (x1 - x0) * u, 640 - 150 * u], 1)
    left = np.stack([x0 + (x1 - x0) * u, np.full(n_l, 820.0)], 1)
    tl = c0 + 0.8 + u * 1.6
    c_end = T.E("CH01-D", 0.6)
    st.add(route(n_l, [(tl, earn)], seed=5, color=shapes.AMBER, t_off=np.full(n_l, c_end), size=1.15))
    st.add(route(n_l, [(tl + 0.4, left)], seed=6, color=shapes.TURQ, t_off=np.full(n_l, c_end), size=1.15))
    st.cap(c0 + 1.0, c_end, "Заработок: 800 → *1000*", 1270, 470, "label")
    st.cap(c0 + 1.4, c_end, "Остаток: 0 → _0_", 1270, 880, "label")
    w_same = T.Wd("CH01-C", "одно", end=True)
    st.cap(w_same - 0.6, T.E("CH01-C", 1.4), "Больше зарабатывать ≠ жить свободнее", 960, 150, "head")
    st.sound(c0 + 0.8, "tick", 0.4)
    d0 = T.S("CH01-D")
    nox.key(d0, 1.2, pose="calm")
    st.cap(T.Wd("CH01-D", "Иногда"), T.E("CH01-D", 0.8), "Иногда денег просто мало", 960, 150, "label")

    # --- E: the box with a circular lock; a golden tower glimpsed behind it
    e0 = T.S("CH01-E")
    box, lock, tower = st.box, st.lock, st.tower
    box.key(e0 - 0.01, 0.01, x=1320, y=640, s=0.85, alpha=0.0)
    box.key(e0, 1.2, alpha=1.0)
    lock.key(e0 - 0.01, 0.01, x=1320, y=640 + 22 * 0.85, s=0.85, alpha=0.0)
    lock.key(e0 + 0.4, 1.0, alpha=1.0)
    plank2 = kit.obj(st, "plank", 500, seed=14, layer=2, x=1320, y=740, s=0.9)
    plank2.key(e0, 1.0, alpha=0.8)
    nox.key(e0, 2.0, pose="walk", x=820)
    nox.key(e0 + 2.0, 1.0, pose="tilt")
    w_tower = T.Wd("CH01-E", "башня")
    tower.key(w_tower - 1.2, 0.01, x=1560, y=520, s=0.95, alpha=0.0, assemble=0.0, ox=1320, oy=620)
    tower.key(w_tower - 1.0, 1.4, assemble=1.0, alpha=0.6)
    tower.key(T.E("CH01-E", 0.6), 1.0, alpha=0.0)
    nox.key(w_tower, 1.0, pose="proud")
    st.sound(w_tower - 1.0, "rise", 0.5)

    # --- F: three orientation signs assemble from the same light (Nox's own landmarks)
    f0 = T.S("CH01-F")
    box.key(f0 - 0.3, 0.8, alpha=0.0)
    lock.key(f0 - 0.3, 0.8, alpha=0.0)
    plank2.key(f0 - 0.3, 0.8, alpha=0.0)
    plank.key(f0 - 0.3, 0.8, alpha=0.0)
    jar.key(f0 - 0.3, 0.8, alpha=0.0)
    nox.key(f0 - 0.2, 1.5, pose="calm", x=200, s=0.62)
    signs = [("цель", 580, "compass", 0.95, "ясная *цель*", "куда направлять\nсилы"),
             ("привычки", 1090, "jar", 0.8, "полезные *привычки*", "чтобы заработанное\nне исчезало"),
             ("достаточности", 1600, "hourglass", 1.0, "понимание\n*достаточности*", "ради чего\nон бежит")]
    st.books = []
    g_end = T.E("CH01-G", 0.4)
    for i, (w, x, icon, sc, title, sub) in enumerate(signs):
        t = T.Wd("CH01-F", w) - 0.3
        ic = kit.obj(st, icon, 1500, seed=40 + i, layer=4)
        ic.key(t - 0.01, 0.01, x=x, y=440, s=sc, alpha=1.0, assemble=0.0, ox=960, oy=200, spread=2)
        ic.key(t, 1.3, assemble=1.0)
        st.cap(t + 0.4, g_end, title, x, 650 if "\n" not in title else 672, "label", size=38)
        st.cap(t + 0.7, g_end, sub, x, 775, "small", size=30)
        st.books.append((ic, ic))
        st.sound(t, "chime_soft", 0.3)
    st.cap(T.Wd("CH01-F", "ориентира") - 0.3, T.Wd("CH01-F", "Ясную") - 0.2, "три ориентира", 960, 200, "head")
    g0 = T.S("CH01-G")
    nox.key(g0, 1.0, pose="think")
    for i, (ic, _) in enumerate(st.books):
        ic.key(g_end - 0.2 + i * 0.15, 1.0, alpha=0.0)

    # --- H: the empty vessel turns into a treadmill: he runs faster, lights fly off behind him
    h0 = T.S("CH01-H")
    tm = kit.obj(st, "treadmill", 1800, seed=15, layer=2)
    tm.key(h0 - 0.6, 0.01, x=960, y=850, s=1.0, alpha=1.0, assemble=0.0, ox=230, oy=560)
    tm.key(h0 - 0.5, 1.4, assemble=1.0)
    nox.key(h0 - 0.4, 1.0, pose="walk", x=940, y=835, s=0.82)
    w_run = T.Wd("CH01-H", "Бежит")
    nox.key(w_run, 0.8, pose="run")
    n3 = 260
    rng = np.random.default_rng(9)
    ts3 = stagger(n3, w_run, 119.0, 11)
    p0 = np.stack([np.full(n3, 1000.0) + rng.normal(0, 12, n3), np.full(n3, 640.0) + rng.normal(0, 30, n3)], 1)
    p1 = np.stack([rng.uniform(-80, 200, n3), rng.uniform(300, 820, n3)], 1)
    st.add(route(n3, [(ts3, p0), (ts3 + 1.0, p1)], seed=12, t_off=ts3 + 0.8, size=0.9, arc=-60))
    st.sound(w_run, "whoosh", 0.4)
    st.ch01_end = {"treadmill": tm}
