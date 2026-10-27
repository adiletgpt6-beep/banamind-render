"""CH07 — Где остановится слово «ещё»? (12:00–14:00)."""
import numpy as np

import kit
import shapes
from stage import route, stagger


def build(st):
    T = st.T
    nox, tower, wheel, box, lock = st.nox, st.tower, st.wheel, st.box, st.lock
    G = kit.GROUND

    # --- A: more work; the wheel spins faster; the golden tower rises
    a0 = T.S("CH07-A")
    wheel.key(a0 - 1.0, 1.0, x=420, y=360, s=0.55)
    wheel.key(a0, 8.0, rot=360 * 5)
    nox.key(a0 - 1.0, 1.2, pose="work", x=420, s=0.85)
    tower.key(a0 + 0.5, 0.01, x=1300, y=G - 300 * 0.5, s=0.5, alpha=1.0, assemble=0.0, ox=1300, oy=G, spread=2,
              sy=1.0)
    tower.key(a0 + 0.6, 2.0, assemble=1.0)
    w_up = T.Wd("CH07-A", "поднимается")
    tower.key(w_up - 0.5, 2.5, s=0.9, y=G - 300 * 0.9)
    st.sound(w_up - 0.4, "rise", 0.5)

    # --- B: the summit moves away each time Nox almost reaches it
    b0 = T.S("CH07-B")
    flag = kit.obj(st, "finishline", 900, seed=701, layer=4)
    flag.key(b0 - 0.01, 0.01, x=1300, y=95, s=0.4, alpha=0.0)
    flag.key(b0 + 0.3, 0.6, alpha=0.9)
    nox.key(b0, 1.2, pose="walk", x=980, s=0.7)
    nox.key(b0 + 1.2, 0.8, pose="reach", fa1=150)
    for i, w in enumerate(("этаж", "заказ", "Ещё.")):
        tw = T.Wd("CH07-B", w.replace(".", "")) if w != "Ещё." else T.Wd("CH07-B", "Ещё", occ=3)
        st.cap(tw - 0.1, T.E("CH07-B", 1.0), "Ещё " + {"этаж": "этаж", "заказ": "заказ", "Ещё.": "…"}[w],
               1640, 360 + i * 70, "label")
        tower.key(tw - 0.2, 0.9, sy=1.0 + 0.16 * (i + 1), y=G - 300 * 0.9 * (1.0 + 0.16 * (i + 1)))
        st.sound(tw - 0.2, "rise", 0.3)
    wheel.key(T.E("CH07-B", 0.4), 1.0, alpha=0.0)
    st.cam.key(b0 + 1.0, 4.0, cy=470, z=0.92)
    st.cam.key(T.E("CH07-B", 0.8), 2.0, cy=540, z=1.0)

    # --- C: Hill moves towards a goal; Housel asks where "enough" is; the moving goalpost
    c0 = T.S("CH07-C")
    st.cap(T.Wd("CH07-C", "достаточно") - 0.3, T.E("CH07-C", 0.8), "Где для тебя *«достаточно»*?", 700, 200, "head")
    st.cap(T.Wd("CH07-C", "остановить") - 0.3, T.E("CH07-C", 0.8), "остановить линию финиша", 700, 270, "small")
    nox.key(c0, 1.0, pose="tired", x=700, s=0.85)

    # --- D: the conflict is in how Nox applies the ideas: the finish line runs away
    d0 = T.S("CH07-D")
    st.cap(T.Wd("CH07-D", "пользуется") - 0.6, T.E("CH07-D", 0.8), "Дело не в цели,\nа в том, *как* ею пользоваться",
           700, 220, "label")
    w_run = T.Wd("CH07-D", "убегает")
    flag.key(T.Wd("CH07-D", "финиша") - 0.4, 2.4, y=-40, s=0.5)
    st.cap(w_run - 0.4, T.E("CH07-D", 1.2), "цель без «ради чего» = *убегающий финиш*", 1300, 980, "small")
    flag.key(T.E("CH07-D", 0.6), 0.8, alpha=0.0)

    # --- E: the cost: evening hours vanish; less attention for friends; sloppier repairs; ring opens
    e0 = T.S("CH07-E")
    tower.key(e0, 1.2, alpha=0.35)
    hours = []
    w_h = T.Wd("CH07-E", "исчезают")
    for i in range(6):
        h = kit.obj(st, "clockface", 420, seed=710 + i, layer=4)
        x = 1050 + i * 130
        h.key(e0 + 0.2 + i * 0.1, 0.01, x=x, y=420, s=0.7, alpha=0.0)
        h.key(e0 + 0.3 + i * 0.1, 0.5, alpha=0.95)
        h.key(w_h + i * 0.45, 0.6, alpha=0.0, assemble=0.0, ox=x, oy=560, spread=2)
        hours.append(h)
    st.cap(e0 + 0.4, w_h + 3.0, "свободные часы вечера", 1375, 330, "small")
    friends = []
    w_f = T.Wd("CH07-E", "друзей")
    for i, x in enumerate((1250, 1420)):
        f = kit.obj(st, "person2" if i else "person", 800, seed=720 + i, layer=3)
        f.key(w_f - 0.6, 0.01, x=x, y=G - 140, s=0.8, alpha=0.0)
        f.key(w_f - 0.5, 0.6, alpha=0.8)
        f.key(w_f + 1.0, 2.0, alpha=0.15)
        friends.append(f)
    w_rep = T.Wd("CH07-E", "небрежнее")
    sp = kit.obj(st, "broken", 900, seed=722, layer=3)
    sp.key(w_rep - 0.6, 0.01, x=1650, y=760, s=0.4, alpha=0.0)
    sp.key(w_rep - 0.5, 0.6, alpha=0.9)
    w_ring = T.Wd("CH07-E", "Круг")
    nox.key(w_ring - 0.2, 1.5, ring_gap=0.62, pose="tired")
    st.cam.key(w_ring - 0.2, 1.4, cx=700, cy=560, z=1.45)
    st.cam.key(T.E("CH07-E", 0.6), 1.2, cx=960, cy=540, z=1.0)
    st.cap(w_ring + 0.4, T.E("CH07-E", 0.6), "круг раскрывается", 760, 900, "note")
    for a in friends + [sp]:
        a.key(T.E("CH07-E", 0.5), 0.8, alpha=0.0)

    # --- F: the box reflects clocks, not lights; the lock does not give
    f0 = T.S("CH07-F")
    tower.key(f0 - 0.4, 1.0, alpha=0.0)
    box.key(f0 - 0.4, 0.01, x=1260, y=600, s=0.95, alpha=0.0)
    box.key(f0 - 0.3, 0.8, alpha=1.0)
    lock.key(f0 - 0.4, 0.01, x=1260, y=600 + 22 * 0.95, s=0.95, alpha=0.0, shape="lock")
    lock.key(f0 - 0.3, 0.8, alpha=1.0)
    w_clk = T.Wd("CH07-F", "часы")
    lock.key(w_clk - 0.3, 0.8, shape="clockface")
    lock.key(w_clk + 1.4, 0.8, shape="lock")
    w_no = T.Wd("CH07-F", "поддаётся")
    lock.key(w_no - 0.4, 0.15, rot=-8)
    lock.key(w_no - 0.2, 0.15, rot=8)
    lock.key(w_no, 0.2, rot=0)
    st.sound(w_no - 0.3, "locked", 0.5)
    nox.key(f0, 1.0, pose="reach_stop", x=880, s=0.9)

    # --- G: what does "enough" look like for HIS life? supports without a number
    g0 = T.S("CH07-G")
    box.key(g0, 1.0, x=1600, y=380, s=0.5)
    lock.key(g0, 1.0, x=1600, y=380 + 11, s=0.5)
    labels = ("Еда", "Дом", "Работа", "Запас", "Время")
    for i, w in enumerate(labels):
        tw = T.Wd("CH07-G", w)
        x = 560 + i * 230
        pl = kit.obj(st, "plank", 400, seed=730 + i, layer=2)
        pl.key(tw - 0.2, 0.01, x=x, y=760 - i * 40, s=0.38, alpha=0.0)
        pl.key(tw - 0.1, 0.6, alpha=0.95, tint=(*(shapes.TURQ if w == "Время" else shapes.BLUE), 0.6))
        pl.key(T.E("CH07-G", 1.3), 0.8, alpha=0.0)
        st.cap(tw - 0.05, T.E("CH07-G", 1.3), w.lower() if i else "еда", x, 712 - i * 40, "label")
    st.cap(T.Wd("CH07-G", "Числа") - 0.2, T.E("CH07-G", 1.3), "Числа нет — *одного числа для всех* не существует",
           960, 190, "label", size=38)
    nox.key(g0, 1.4, pose="think", x=330, s=0.85)
    # transition: the moving finish line -> a bridge built right at the edge of the load
    st.flag = flag
