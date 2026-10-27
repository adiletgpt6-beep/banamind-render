"""CH03 — Один огонёк из десяти (04:00–06:00). Ledger: 1000 = 700 + 200 + 100; 3 × 100 = 300."""
import numpy as np

import kit
import shapes
from stage import grid_slots, route, stagger

NEED, JOY, KEEP = shapes.BLUE, shapes.PINK, shapes.AMBER
CAP = 600.0   # jar capacity in units (level = units / CAP), same in every chapter


def build(st):
    T = st.T
    nox, jar, fill = st.nox, st.jar, st.jarfill
    G = kit.GROUND
    xs = st.ten_x
    dots = st.ten_dots

    # --- A: ten big lights, each = 100 units
    a0 = T.S("CH03-A")
    nox.key(a0 - 1.0, 1.2, pose="calm", x=240, s=0.75)
    st.cap(T.Wd("CH03-A", "сто"), T.E("CH03-B", 1.0), "1 огонь = *100* единиц", 960, 420, "label")
    st.cap(T.Wd("CH03-A", "тысяча") - 0.2, T.S("CH03-B") + 1.0, "10 × 100 = *1000*", 960, 770, "numS")
    for i, d in enumerate(dots):
        d.key(a0 + 0.3 + i * 0.12, 0.4, s=4.6, bright=1.4)
        d.key(a0 + 0.7 + i * 0.12, 0.4, s=4.0, bright=1.0)
    st.sound(a0 + 0.3, "ticks10", 0.4)

    # --- B: seven -> need, two -> joys, one stays (goes to the vessel)
    b0 = T.S("CH03-B")
    w7 = T.Wd("CH03-B", "Семь")
    w2 = T.Wd("CH03-B", "Два")
    w1 = T.Wd("CH03-B", "Один")
    jar.key(b0, 0.01, x=1560, y=640, s=0.75, alpha=0.0, bright=1.0)
    jar.key(b0 + 0.1, 0.8, alpha=1.0)
    fill.key(b0, 0.01, x=1560, y=640, s=0.75, alpha=1.0, level=0.0)
    for i in range(7):
        dots[i].key(w7 + i * 0.12, 1.0, x=420 + i * 70, y=800, s=3.2, tint=(*NEED, 0.8))
    for i in (7, 8):
        dots[i].key(w2 + (i - 7) * 0.2, 1.0, x=1000 + (i - 7) * 80, y=800, s=3.2, tint=(*JOY, 0.8))
    dots[9].key(w1, 1.2, x=1560, y=700, s=3.4)
    st.cap(w7 + 0.8, T.E("CH03-C", 0.5), "Необходимое · 700", 630, 880, "small")
    st.cap(w2 + 0.8, T.E("CH03-C", 0.5), "Радости · 200", 1040, 880, "small")
    st.cap(w1 + 0.8, T.E("CH03-C", 0.5), "Остаётся · *100*", 1560, 880, "small")
    w_sum = T.Wd("CH03-B", "Семьсот")
    st.cap(w_sum, T.E("CH03-C", 0.5), "700 + 200 + 100 = *1000*", 960, 250, "head")
    fill.key(w1 + 1.0, 1.0, level=100 / CAP)
    dots[9].key(w1 + 1.1, 0.8, alpha=0.0)
    st.sound(w7, "flow", 0.35)
    st.sound(w1 + 1.0, "drop", 0.5)

    # --- C: one decision changed: extras 300 -> 200. Clason's tenth = an example for Nox
    c0 = T.S("CH03-C")
    st.cap(c0 + 0.3, T.Wd("CH03-C", "двести") + 0.2, "Покупки: *300*", 1040, 690, "label")
    st.cap(T.Wd("CH03-C", "двести"), T.E("CH03-C", 0.5), "Покупки: 300 → *200*", 1040, 690, "label")
    st.cap(T.Wd("CH03-C", "правило") - 0.2, T.E("CH03-C", 0.8), "правило Нокса: *1 из 10* — _не норма для всех_", 960, 160, "small")
    nox.key(c0, 1.0, pose="think")
    for i in range(9):
        dots[i].key(T.E("CH03-C", 0.3), 0.8, alpha=0.0)

    # --- C2: pay yourself first: on payday 100 goes to the vessel before anything else
    c2 = T.S("CH03-C2")
    c2e = T.E("CH03-C2", 0.6)
    n = 1000
    rng = np.random.default_rng(301)
    src = np.stack([rng.uniform(300, 900, n), rng.uniform(-60, 30, n)], 1)
    keep = np.zeros(n, bool)
    keep[:100] = True
    w_day = T.Wd("CH03-C2", "день")
    ts = np.where(keep, stagger(n, w_day - 0.4, w_day + 0.4, 302), stagger(n, w_day + 0.8, w_day + 2.8, 303))
    tgt_keep = np.stack([1560 + rng.normal(0, 30, n), 680 + rng.uniform(-10, 60, n)], 1)
    tgt_rest = np.stack([rng.uniform(380, 1200, n), 860 + rng.uniform(-20, 20, n)], 1)
    dst = np.where(keep[:, None], tgt_keep, tgt_rest)
    col = np.where(keep[:, None], np.array(KEEP), np.where((np.arange(n) % 10 < 7)[:, None], np.array(NEED),
                                                            np.array(JOY)))
    st.add(route(n, [(ts, src), (ts + 1.0, dst)], seed=304, color=col,
                 t_off=np.where(keep, ts + 1.0, ts + 1.6), size=0.9))
    st.cap(w_day - 0.2, c2e, "1. Сначала — *в сосуд*", 1560, 420, "label")
    st.cap(w_day + 0.9, c2e, "2. Потом — всё остальное", 760, 420, "label")
    nox.key(c2, 1.0, pose="gesture", x=240)
    st.sound(w_day, "drop", 0.4)

    # --- D: a grand gesture over the vessel — nothing happens
    d0 = T.S("CH03-D")
    nox.key(d0 - 0.3, 1.0, pose="walk", x=1270, s=0.85, face=1.0)
    nox.key(T.Wd("CH03-D", "жест") - 0.2, 0.6, pose="point", fa1=135, head=-10, ear=-10, tail_raise=26)
    w_no = T.Wd("CH03-D", "Ничего")
    nox.key(w_no, 0.8, pose="tilt", ear=26, tail_raise=-14)
    fizz = kit.obj(st, "dot", 60, seed=305, layer=6)
    fizz.key(w_no - 0.9, 0.01, x=1560, y=520, s=1.0, alpha=0.0)
    fizz.key(w_no - 0.8, 0.3, alpha=0.9, s=1.5)
    fizz.key(w_no - 0.2, 0.6, alpha=0.0, s=0.2)
    st.sound(w_no - 0.8, "fizzle", 0.4)

    # --- E: three months: +100 each; 300 in the vessel; no interest, just not spent
    e0 = T.S("CH03-E")
    st.light(e0 - 0.9, T.E("CH03-E", 0.9))
    eend = T.E("CH03-E", 0.6)
    nox.key(e0, 1.0, pose="calm", x=300, s=0.8)
    for i, w in enumerate(("Первый", "Второй", "Третий")):
        tw = T.Wd("CH03-E", w)
        card = kit.obj(st, "card", 700, seed=310 + i, layer=3)
        cx = 640 + i * 300
        card.key(tw - 0.01, 0.01, x=cx, y=520, s=0.8, alpha=0.0)
        card.key(tw, 0.5, alpha=0.9)
        card.key(eend + 2.0, 0.8, alpha=0.0)
        st.cap(tw + 0.1, eend + 2.0, f"Месяц {i + 1}", cx, 500, "label")
        st.cap(tw + 0.4, eend + 2.0, "+100", cx, 560, "small")
        n3 = 100
        slots = np.stack([1560 + np.random.default_rng(i).normal(0, 28, n3),
                          np.full(n3, 650.0) + np.random.default_rng(i + 9).normal(0, 20, n3)], 1)
        src = np.stack([cx + np.random.default_rng(i + 3).normal(0, 40, n3),
                        520 + np.random.default_rng(i + 4).normal(0, 25, n3)], 1)
        if i == 0:
            # the first month's 100 is the one already put into the vessel in scene B
            st.cap(tw + 0.6, eend + 2.0, "уже в сосуде", cx, 610, "note")
            continue
        t_go = stagger(n3, tw + 0.5, tw + 1.2, 320 + i)
        st.add(route(n3, [(t_go, src), (t_go + 0.9, slots)], seed=330 + i, t_off=t_go + 0.9, size=0.9))
        st.sound(tw + 1.3, "drop", 0.35)
    fill.key(T.Wd("CH03-E", "Второй") + 1.4, 0.8, level=200 / CAP)
    fill.key(T.Wd("CH03-E", "Третий") + 1.4, 0.8, level=300 / CAP)
    w300 = T.Wd("CH03-E", "триста")
    st.cap(w300 - 0.2, eend + 2.0, "3 × 100 = *300*", 1560, 380, "head")
    st.cap(T.Wd("CH03-E", "процентов") - 0.2, eend + 2.0, "Без процентов: просто не потрачено", 960, 170, "small")
    st.cap(T.Wd("CH03-E", "настоящих") - 0.3, eend + 1.0, "3 настоящих месяца", 960, 820, "note")

    # --- F: limit — when everything goes to necessities, budgeting cannot create money
    f0 = T.S("CH03-F")
    fend = T.E("CH03-F", 0.5)
    inc = grid_slots(800, 900, 860, 16, 9.0, 9.0, seed=340)
    st.add(route(800, [(stagger(800, f0 + 0.3, f0 + 1.0, 341), inc - np.array([0, 450])),
                       (stagger(800, f0 + 0.3, f0 + 1.0, 341) + 0.7, inc)], seed=342, color=NEED,
                 t_off=np.full(800, fend), size=0.85, arc=0))
    st.cap(f0 + 0.4, fend, "Доход = необходимое", 900, 300, "label")
    st.cap(f0 + 1.0, fend, "Остаток: 0", 900, 920, "small")
    st.cap(T.Wd("CH03-F", "доходе") - 0.3, fend, "доход · обязательства · *поддержка*", 1320, 420, "small", align="left")
    jar.key(f0, 0.8, bright=0.6)
    jar.key(fend, 0.8, bright=1.0)

    # --- G: three saved layers become the walls of a small room (purpose not yet clear)
    g0 = T.S("CH03-G")
    room = kit.obj(st, "room", 2400, seed=350, layer=2)
    room.key(g0 + 0.5, 0.01, x=1180, y=680, s=1.0, alpha=1.0, assemble=0.0, ox=1560, oy=660, spread=0.6)
    room.key(g0 + 0.6, 2.2, assemble=1.0)
    fill.key(g0 + 0.5, 1.2, alpha=0.35)
    jar.key(g0 + 0.5, 1.2, alpha=0.35)
    st.cap(T.Wd("CH03-G", "непонятно") - 0.4, T.E("CH03-G", 1.2), "Зачем она? *Пока непонятно*", 1180, 330, "small")
    st.room = room
    nox.key(g0, 1.4, pose="tilt", x=560)
