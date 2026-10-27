"""CH13 — Три ориентира — одна система (24:00–26:00)."""
import math

import numpy as np

import kit
import shapes
from stage import route, stagger


def build(st):
    T = st.T
    nox, jar, fill, comp, bridge, box, lock = st.nox, st.jar, st.jarfill, st.compass, st.bridge, st.box, st.lock
    G = kit.GROUND
    # stations of the system triangle
    PC, PJ, PB = (1060, 300), (1420, 700), (700, 700)

    # --- A/B: the three objects with their meaning
    a0 = T.S("CH13-A")
    comp.key(a0, 1.4, x=PC[0], y=PC[1], s=0.8)
    jar.key(a0, 1.4, x=PJ[0], y=PJ[1], s=0.65)
    fill.key(a0, 1.4, x=PJ[0], y=PJ[1], s=0.65)
    bridge.key(a0, 1.4, x=PB[0], y=PB[1] + 10, s=0.36)
    nox.key(a0, 1.2, x=1760, s=0.7, pose="calm", face=-1.0)
    b0 = T.S("CH13-B")
    st.light(b0 - 0.6, T.E("CH13-D", 0.6))
    st.cap(T.Wd("CH13-B", "Компас") - 0.1, T.E("CH13-E2", 0.6), "компас · направление труда", PC[0] - 150, PC[1], "small", align="right")
    st.cap(T.Wd("CH13-B", "Сосуд") - 0.1, T.E("CH13-E2", 0.6), "сосуд · что остаётся", PJ[0], PJ[1] + 150, "small")
    st.cap(T.Wd("CH13-B", "Мост") - 0.1, T.E("CH13-E2", 0.6), "мост · запас на ошибки", PB[0] - 200, PB[1] + 10, "small", align="right")
    for a, w in ((comp, "Компас"), (jar, "Сосуд"), (bridge, "Мост")):
        tw = T.Wd("CH13-B", w)
        a.key(tw - 0.1, 0.4, bright=1.5)
        a.key(tw + 0.6, 0.6, bright=1.0)

    # --- C: connections: work -> income -> spending -> remainder -> reserve -> calmer work
    c0 = T.S("CH13-C")
    sysl = kit.obj(st, "system", 1500, seed=1301, layer=1)
    sysl.key(c0 - 0.01, 0.01, x=1060, y=560, s=1.0, alpha=0.0)
    sysl.key(c0 + 0.1, 1.0, alpha=0.7)
    n = 240
    loop = []
    for k in range(n):
        u = k / n * 3
        i = int(u) % 3
        f = u - int(u)
        a, b = [PC, PJ, PB][i], [PC, PJ, PB][(i + 1) % 3]
        loop.append((a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f))
    loop = np.array(loop, np.float32)
    cend = T.E("CH13-E2", 0.4)
    # each light walks one third of the loop repeatedly: model as a long chain of key points
    ts = stagger(n, c0 + 0.5, c0 + 3.0, 1302)
    pts = [(ts, loop)]
    for j in range(1, 10):
        pts.append((ts + j * 1.6, np.roll(loop, -j * 8, axis=0)))
    st.add(route(n, pts, seed=1303, color=shapes.TURQ, t_off=np.full(n, cend), size=0.8, arc=0))
    labels = (("доход", "Работа", (1330, 470)), ("расходы", "Расходы", (930, 790)), ("запасом", "Сохранённое", (930, 845)),
              ("спокойнее", "Запас", (790, 470)))
    for w, txt, (x, y) in labels:
        st.cap(T.Wd("CH13-C", w) - 0.3, cend, {"доход": "работа → доход", "расходы": "расходы → остаток",
                                               "запасом": "сохранённое → запас", "спокойнее": "запас → спокойнее работать"}[w],
               x, y, "small")

    # --- D: every part has a limit
    d0 = T.S("CH13-D")
    for w, txt, y in (("Амбиция", "амбиция без цены — истощает", 120), ("Сокращение", "экономия не заменит заработка", 170),
                      ("осторожность", "осторожность не делает работы", 220)):
        st.cap(T.Wd("CH13-D", w) - 0.2, T.E("CH13-D", 0.8), txt, 1060, y, "small")

    # --- E: external conditions around the machine
    e0 = T.S("CH13-E")
    for i, (w, x, y) in enumerate((("рынок", 230, 520), ("здоровье", 1700, 170), ("случай", 1420, 160))):
        cl = kit.obj(st, "cloud", 700, seed=1304 + i, layer=0)
        tw = T.Wd("CH13-E", w)
        cl.key(tw - 0.3, 0.01, x=x, y=y, s=0.6, alpha=0.0)
        cl.key(tw - 0.2, 0.8, alpha=0.5)
        cl.key(T.E("CH13-E", 1.0), 1.0, alpha=0.0)
        st.cap(tw, T.E("CH13-E", 1.0), w, x, y, "small")
    st.cap(T.Wd("CH13-E", "гарантирует") - 0.3, T.E("CH13-E", 0.8), "не гарантирует результат —\nделает выбор *понятнее*",
           1060, 170, "label")

    # --- E2: one shared action: a rush night order? each object "answers"
    f0 = T.S("CH13-E2")
    st.cap(T.Wd("CH13-E2", "ночной") - 0.4, T.Wd("CH13-E2", "Компас") + 0.2, "Брать срочный *ночной* заказ?", 1060, 110,
           "head")
    for a, w, q, (x, y) in ((comp, "Компас", "учиться этому?", (PC[0] + 230, PC[1])),
                            (jar, "Сосуд", "нужны ли сейчас огни?", (PJ[0], PJ[1] - 150)),
                            (bridge, "Мост", "а если устанет и ошибётся?", (PB[0] - 260, PB[1] - 110))):
        tw = T.Wd("CH13-E2", w)
        a.key(tw - 0.1, 0.4, bright=1.6)
        a.key(tw + 1.6, 0.6, bright=1.0)
        st.cap(tw, T.E("CH13-E2", 0.6), q, x, y, "small")
    w_no = T.Wd("CH13-E2", "отказывается")
    st.cap(w_no - 0.2, T.E("CH13-E2", 1.0), "Нет ночному · *да* утреннему", 1060, 110, "head")
    nox.key(w_no, 0.8, pose="gesture")

    # --- F: our conclusion, not a summary of the books
    g0 = T.S("CH13-F")
    sysl.key(g0, 1.0, alpha=0.3)
    st.cap(g0 + 0.1, T.E("CH13-F", 1.0), "не рецепт — *опыт Нокса*", 1060, 170, "label")

    # --- G: Nox walks across the bridge to his workshop; the lock looks like a clock; system -> notebook page
    h0 = T.S("CH13-G")
    sysl.key(h0, 1.0, alpha=0.0)
    comp.key(h0, 1.2, assemble=0.0, ox=960, oy=600, spread=2)
    comp.key(h0 + 1.2, 0.3, alpha=0.0)
    jar.key(h0, 1.0, alpha=0.0)
    fill.key(h0, 1.0, alpha=0.0)
    bridge.key(h0, 1.4, x=860, y=620, s=0.8, alpha=1.0)
    nox.key(h0 - 0.4, 0.4, alpha=0.0)
    nox.key(h0 + 0.2, 0.01, x=420, y=620 - 32, s=0.5, pose="walk", face=1.0)
    nox.key(h0 + 0.25, 0.4, alpha=1.0)
    nox.key(h0 + 0.3, 4.4, x=1180)
    shop = kit.obj(st, "house", 1300, seed=1311, layer=2)
    shop.key(h0, 0.01, x=1500, y=500, s=0.75, alpha=0.0)
    shop.key(h0 + 0.5, 1.0, alpha=0.9)
    st.cap(T.Wd("CH13-G", "мастерской") - 0.3, T.Wd("CH13-G", "замок") - 0.2, "не к башне — *к мастерской*", 1060, 170,
           "label")
    w_lock = T.Wd("CH13-G", "часы")
    box.key(w_lock - 1.2, 0.01, x=1640, y=260, s=0.5, alpha=0.0)
    box.key(w_lock - 1.1, 0.8, alpha=1.0)
    lock.key(w_lock - 1.2, 0.01, x=1640, y=260 + 11, s=0.5, alpha=0.0, shape="lock", rot=0)
    lock.key(w_lock - 1.1, 0.8, alpha=1.0)
    lock.key(w_lock - 0.2, 1.2, shape="clockface")
    w_page = T.Wd("CH13-G", "странице")
    note = kit.obj(st, "notebook", 2000, seed=1312, layer=3)
    note.key(w_page - 0.6, 0.01, x=960, y=540, s=1.15, alpha=1.0, assemble=0.0, ox=860, oy=620, spread=4)
    note.key(w_page - 0.5, 1.8, assemble=1.0)
    for a in (bridge, shop, box, lock):
        a.key(w_page - 0.6, 1.0, alpha=0.0)
    nox.key(w_page - 0.6, 1.0, alpha=0.0)
    st.note = note
