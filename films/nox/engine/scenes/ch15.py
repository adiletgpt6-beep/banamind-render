"""CH15 — Что Нокс хотел купить на самом деле (28:00–30:00). Ledger: 1000 = 700 + 200 + 100."""
import numpy as np

import kit
import shapes
from stage import disc, route, stagger

CAP = 600.0   # jar capacity in units (level = units / CAP), same in every chapter


def build(st):
    T = st.T
    nox, note, box, lock, jar, fill = st.nox, st.note, st.box, st.lock, st.jar, st.jarfill
    G = kit.GROUND
    c0 = T.C(15)
    END = 1800.0

    # --- A: the first composition again — with visible differences
    a0 = T.S("CH15-A")
    note.key(c0 - 0.2, 1.0, alpha=0.0)
    box.key(c0 - 0.2, 1.2, x=1640, y=470, s=0.6)
    lock.key(c0 - 0.2, 1.2, x=1640, y=470 + 22 * 0.6, s=0.6)
    plank = kit.obj(st, "plank", 500, seed=1501, layer=2)
    plank.key(c0 + 0.5, 0.01, x=1640, y=550, s=0.6, alpha=0.0)
    plank.key(c0 + 0.6, 0.8, alpha=0.8)
    nox.key(c0 + 0.2, 1.2, pose="carry", x=560, s=1.0)
    jar.key(c0 + 0.2, 0.01, x=230, y=560, s=0.55, alpha=0.0, bright=1.0)
    jar.key(c0 + 0.4, 0.8, alpha=0.95)
    fill.key(c0 + 0.2, 0.01, x=230, y=560, s=0.55, alpha=1.0, level=420 / CAP)
    shelf = kit.obj(st, "plank", 500, seed=1502, layer=2)
    shelf.key(c0 + 0.4, 0.01, x=230, y=640, s=0.6, alpha=0.0)
    shelf.key(c0 + 0.5, 0.8, alpha=0.8)
    hold = (745, 700)
    w1000 = T.Wd("CH15-A", "Тысяча")
    n = 1000
    rng = np.random.default_rng(1503)
    src = np.stack([rng.uniform(150, 1400, n), rng.uniform(-60, 80, n)], 1)
    ts = stagger(n, w1000 - 1.4, w1000 + 0.3, 1504)
    th = ts + rng.uniform(0.7, 1.0, n)
    hp = disc(n, *hold, 64, 1505)
    need = kit.Bin(st, 1150, 600, "Необходимое", 700, seed=1506, cols=26, dx=9.6, dy=9.6)
    joy = kit.Bin(st, 1460, 600, "Радости", 200, seed=1507, cols=26, dx=9.6, dy=9.6)
    a_end = T.E("CH15-A", 0.8)
    need.show(w1000, a_end)
    joy.show(w1000 + 0.2, a_end)
    order = np.argsort(hp[:, 0] + rng.normal(0, 20, n))
    w7 = T.Wd("CH15-A", "Семьсот")
    w2 = T.Wd("CH15-A", "Двести")
    w1 = T.Wd("CH15-A", "Сто")
    tgo = np.empty(n)
    tgo[order[:700]] = stagger(700, w7 - 0.2, w7 + 1.2, 1508)
    tgo[order[700:900]] = stagger(200, w2 - 0.2, w2 + 0.8, 1509)
    tgo[order[900:]] = stagger(100, w1 - 0.6, w1 + 0.2, 1510)
    dst = np.zeros((n, 2), np.float32)
    dst[order[:700]] = need.slots
    dst[order[700:900]] = joy.slots
    dst[order[900:]] = np.stack([230 + rng.normal(0, 20, 100), 580 + rng.normal(0, 20, 100)], 1)
    col = np.tile(np.array(shapes.AMBER, np.float32), (n, 1))
    col[order[:700]] = shapes.BLUE
    col[order[700:900]] = shapes.PINK
    toff = np.full(n, a_end)
    toff[order[900:]] = tgo[order[900:]] + 0.9
    st.add(route(n, [(ts, src), (th, hp), (tgo, hp)], seed=1511, t_off=tgo + 0.05, size=0.95))
    st.add(route(n, [(tgo, hp), (tgo + 0.9, dst)], seed=1512, color=col, t_off=toff, size=0.95, arc=-60))
    fill.key(w1 + 0.4, 0.8, level=520 / CAP)
    st.cap(w1000 - 0.3, w7, "1000", hold[0] + 165, hold[1] - 110, "num")
    st.cap(w7 + 0.8, a_end, "700", 1150, 825, "numS")
    st.cap(w2 + 0.6, a_end, "200", 1460, 825, "numS")
    st.cap(c0 + 0.6, w1 + 0.3, "420", 230, 420, "numS")
    st.cap(w1 + 0.4, a_end, "420 + 100 = *520*", 300, 420, "numS", size=40)
    st.cap(a0 + 0.3, a_end, "Тот же условный месяц", 110, 1000, "note", align="left")
    w_on = T.Wd("CH15-A", "вовремя")
    lampw = kit.obj(st, "lamp_lit", 900, seed=1513, layer=3)
    lampw.key(w_on - 2.4, 0.01, x=860, y=320, s=0.4, alpha=0.0)
    lampw.key(w_on - 2.3, 0.6, alpha=0.9)
    lampw.key(w_on - 0.1, 0.6, shape="lamp", bright=0.6)
    lampw.key(a_end + 0.5, 0.8, alpha=0.0)
    st.cap(w_on - 0.4, a_end + 0.5, "18:00 — работа окончена", 860, 160, "label")
    nox.key(T.Wd("CH15-A", "богатым") - 0.3, 0.8, pose="calm")
    st.sound(w_on - 0.1, "click", 0.4)

    # --- B: the box opens: no mountain of lights — a window onto a free evening
    b0 = T.S("CH15-B")
    for a in (plank, shelf, jar, fill):
        a.key(b0 - 0.3, 1.0, alpha=0.0)
    box.key(b0 - 0.2, 1.4, x=1180, y=600, s=1.0)
    lock.key(b0 - 0.2, 1.4, x=1180, y=600 + 22, s=1.0)
    nox.key(b0, 1.4, pose="walk", x=700, s=0.95)
    nox.key(b0 + 1.4, 0.8, pose="reach")
    w_turn = T.Wd("CH15-B", "поворачивается")
    lock.key(w_turn - 0.2, 1.6, rot=360)
    w_open = T.Wd("CH15-B", "открывается")
    st.sound(w_open - 0.1, "unlock", 0.6)
    lock.key(w_open, 0.6, alpha=0.0)
    box.key(w_open, 0.9, shape="box_open")
    win = kit.obj(st, "freewindow", 3400, seed=1514, layer=4)
    w_win = T.Wd("CH15-B", "окно")
    win.key(w_win - 0.6, 0.01, x=1180, y=500, s=1.05, alpha=1.0, assemble=0.0, ox=1180, oy=600, spread=1.5)
    win.key(w_win - 0.5, 2.4, assemble=1.0)
    box.key(w_win + 0.4, 1.4, alpha=0.0)
    st.cap(T.Wd("CH15-B", "нет") - 0.2, w_win - 0.2, "Внутри нет *горы огней*", 1180, 140, "head")
    for i, (w, txt) in enumerate((("Свободный", "свободный вечер"), ("Работающая", "работающая мастерская"),
                                  ("Близкие", "близкие"))):
        st.cap(T.Wd("CH15-B", w) - 0.1, T.E("CH15-C", 0.6), txt, 1180 + (i - 1) * 380, 835, "small")
    st.cam.key(w_win - 0.5, 4.0, cx=1060, cy=540, z=1.06)

    # --- C: the chest ring closes into a calm clock face; Housel on control over time
    c1 = T.S("CH15-C")
    nox.key(c1, 2.6, ring_gap=0.0, pose="calm", head=4)
    nox.key(c1 + 1.6, 2.2, clock=1.0)
    st.cap(T.Wd("CH15-C", "временем") - 0.4, T.Wd("CH15-C", "роскоши") - 0.5, "распоряжаться *своим временем*", 1180, 140,
           "head")
    st.cap(T.Wd("CH15-C", "роскоши") - 0.4, T.E("CH15-C", 0.8),
           "не роскошь · не чужое одобрение · *право решать*, как проходит вечер", 1060, 140, "label", size=36)
    st.sound(c1 + 2.0, "chime_soft", 0.35)

    # --- D: the summary
    d0 = T.S("CH15-D")
    win.key(d0, 1.6, x=1480, y=420, s=0.6)
    for i, (w, txt) in enumerate((("Цель", "Цель — помогает *двигаться*"), ("Привычки", "Привычки — *сохранять* заработанное"),
                                  ("достаточности", "«Достаточно» — помнить, _ради чего_"))):
        st.cap(T.Wd("CH15-D", w) - 0.2, T.E("CH15-D", 0.8), txt, 1040, 700 + i * 64, "label", size=40)
    st.cap(d0 + 0.2, T.Wd("CH15-D", "Цель") - 0.3, "больше огней → *зачем* они нужны", 960, 140, "head")
    nox.key(d0, 1.2, pose="calm", x=330, s=0.8)
    st.cam.key(d0, 2.0, cx=960, cy=540, z=1.0)

    # --- E: one question for the comments
    e0 = T.S("CH15-E")
    st.cap(e0, T.E("CH15-E", 1.0), "Какая идея ближе вам:\nясная цель, привычка сохранять\nили умение понять, когда *достаточно*?",
           1040, 770, "head", size=46)

    # --- F (29:50–30:00): the workshop light goes out softly, the window stays warm; calm ending
    f0 = T.S("CH15-F")
    w_out = T.Wd("CH15-F", "гаснет")
    # Nox closes the workshop and walks into the warm window (joins the evening); right side stays free
    win.key(f0 - 0.4, 2.4, x=560, y=400, s=0.75)
    nox.key(f0 - 0.4, 1.0, pose="walk", face=1.0)
    nox.key(f0 + 0.6, 3.6, x=600, y=470, s=0.22)
    nox.key(f0 + 4.2, 0.8, pose="calm")
    st.look.key(w_out, 2.5, bloom=0.3, dust=0.5)
    st.sound(w_out, "click", 0.3)
    src_t = max(f0 + 1.0, END - 11.5)
    st.cap(src_t, END - 0.25, "Нокс", 110, 830, "head", align="left")
    st.cap(src_t + 0.3, END - 0.25, "Цена бесконечного «ещё»", 110, 895, "label", align="left")
    st.cap(src_t + 0.6, END - 0.25, "Нокс и все ситуации вымышлены · расчёты условные · не инвестиционная рекомендация",
           110, 968, "note", align="left", size=24)
    # final soft fade of everything in the last half second
    st.look.key(END - 0.6, 0.55, fade=0.0)
