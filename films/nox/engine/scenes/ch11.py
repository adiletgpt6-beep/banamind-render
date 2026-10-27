"""CH11 — Разные люди — разные условия (20:00–22:00). Fictional examples, not biographies."""
import numpy as np

import kit
import shapes
from stage import grid_slots, route, stagger


def build(st):
    T = st.T
    nox, wins = st.nox, st.windows
    G = kit.GROUND
    c0 = T.C(11)
    wins.key(c0 + 0.2, 1.2, alpha=0.0)

    # --- A: comparing himself with a neighbour: a taller tower, a bigger workshop
    a0 = T.S("CH11-A")
    nb = kit.obj(st, "tower", 2800, seed=1101, layer=2)
    nb.key(c0 + 0.6, 0.01, x=1420, y=G - 300 * 0.95, s=0.95, alpha=1.0, assemble=0.0, ox=1420, oy=G, spread=2)
    nb.key(c0 + 0.7, 2.2, assemble=1.0)
    mine = kit.obj(st, "house", 1300, seed=1102, layer=2)
    mine.key(c0 + 0.6, 0.01, x=860, y=G - 130 * 0.7, s=0.7, alpha=0.0)
    mine.key(c0 + 0.8, 1.0, alpha=0.9)
    nox.key(c0 + 0.2, 0.01, x=560, y=G, s=0.85, pose="tilt", face=1.0)
    st.cap(T.Wd("CH11-A", "сравнение") - 0.2, T.E("CH11-A", 0.8), "сравнение — *неточный* инструмент", 960, 170, "head")
    st.cap(T.Wd("CH11-A", "стартовой") - 0.4, T.E("CH11-A", 0.8), "не видно: старт · везение · цена", 960, 240, "small")

    # --- B: behind the façade: a ready workshop from family, support, an earlier start
    b0 = T.S("CH11-B")
    nb.key(b0 + 0.3, 1.4, shape="facade", s=0.8, y=560, tint=(0.6, 0.6, 0.9, 0.3))
    for i, (w, txt) in enumerate((("готовая", "готовая мастерская от семьи"), ("поддержка", "поддержка"),
                                  ("раньше", "старт на несколько лет раньше"))):
        st.cap(T.Wd("CH11-B", w) - 0.2, T.E("CH11-B", 1.0), txt, 1110, 330 + i * 60, "label", size=36, align="right")

    # --- C: the house opposite: almost all income goes to a relative's treatment
    cc0 = T.S("CH11-C")
    nb.key(cc0 - 0.3, 1.0, alpha=0.0)
    mine.key(cc0 - 0.3, 1.0, alpha=0.0)
    she = kit.obj(st, "person2", 1200, seed=1103, layer=3)
    she.key(cc0, 0.01, x=1080, y=G - 160, s=0.95, alpha=0.0)
    she.key(cc0 + 0.3, 1.0, alpha=0.95)
    inc = grid_slots(1000, 1420, 860, 20, 9.0, 9.0, seed=1104)
    must = np.arange(1000) < 950
    tt = stagger(1000, T.Wd("CH11-C", "заработок") - 0.6, T.Wd("CH11-C", "заработок") + 0.8, 1105)
    st.add(route(1000, [(tt, inc - np.array([0, 420])), (tt + 0.7, inc)], seed=1106,
                 color=np.where(must[:, None], np.array(shapes.BLUE), np.array(shapes.AMBER)),
                 t_off=np.full(1000, T.E("CH11-C", 1.0)), size=0.85, arc=0))
    st.cap(T.Wd("CH11-C", "лечение") - 0.3, T.E("CH11-C", 1.0), "лечение близкого", 1420, 380, "label")
    st.cap(T.Wd("CH11-C", "понимает") - 0.6, T.E("CH11-C", 1.0), "пуст *не потому*, что она чего-то не понимает", 960, 170,
           "label", size=38)
    nox.key(cc0, 1.0, pose="calm", x=560)

    # --- D: Housel: personal experience is a tiny part of the world; luck and risk
    d0 = T.S("CH11-D")
    st.cap(T.Wd("CH11-D", "кусочек") - 0.3, T.E("CH11-D", 0.8), "свой опыт — *маленький кусочек* картины", 960, 170, "label")
    st.cap(T.Wd("CH11-D", "удача") - 0.2, T.E("CH11-D", 0.8), "удача и риск", 960, 240, "head")
    st.cap(T.Wd("CH11-D", "Одинаковое") - 0.3, T.E("CH11-D", 0.8), "одно правило ≠ одинаковые возможности", 960, 320, "small")
    dice = kit.obj(st, "question", 900, seed=1107, layer=3)
    dice.key(T.Wd("CH11-D", "удача") - 0.3, 0.01, x=1500, y=560, s=0.8, alpha=0.0, tint=(*shapes.VIOLET, 0.5))
    dice.key(T.Wd("CH11-D", "удача") - 0.2, 0.8, alpha=0.8)
    dice.key(T.E("CH11-D", 0.6), 0.8, alpha=0.0)

    # --- E: no lecture: Nox helps take apart a stubborn mechanism; she shows him a trick
    e0 = T.S("CH11-E")
    gear = kit.obj(st, "gear", 1300, seed=1108, layer=4)
    gear.key(e0, 0.01, x=820, y=640, s=0.55, alpha=1.0, assemble=0.0, ox=820, oy=760)
    gear.key(e0 + 0.1, 1.4, assemble=1.0)
    gear.key(e0 + 1.6, 6.0, rot=180)
    nox.key(e0, 1.2, pose="work", x=600)
    she.key(e0, 1.2, x=1040)
    st.cap(T.Wd("CH11-E", "лекцию") - 0.3, T.E("CH11-E", 1.0), "без лекций о дисциплине", 820, 300, "label")
    st.cap(T.Wd("CH11-E", "приём") - 0.4, T.E("CH11-E", 1.0), "обмен *приёмами*", 820, 360, "small")
    st.sound(e0 + 1.6, "tick", 0.3)

    # --- F: three zones: own decisions / available resources / circumstances
    f0 = T.S("CH11-F")
    for a in (gear, she):
        a.key(f0 - 0.3, 0.8, alpha=0.0)
    zones = kit.obj(st, "zones3", 2400, seed=1109, layer=2)
    zones.key(T.Wd("CH11-F", "решения") - 0.6, 0.01, x=1060, y=560, s=1.0, alpha=1.0, assemble=0.0, ox=1060, oy=560,
              spread=4)
    zones.key(T.Wd("CH11-F", "решения") - 0.5, 1.6, assemble=1.0)
    for i, (w, txt) in enumerate((("решения", "мои решения"), ("ресурсы", "ресурсы"), ("обстоятельства", "обстоятельства"))):
        st.cap(T.Wd("CH11-F", w) - 0.2, T.E("CH11-F", 1.0), txt, 640 + i * 420, 560, "label")
    st.cap(f0 + 0.2, T.Wd("CH11-F", "различать") - 0.2,
           "доход ≠ достоинство", 1060, 170, "head")
    st.cap(T.Wd("CH11-F", "Ответственность") - 0.2, T.E("CH11-F", 1.0),
           "ответственность — *без обвинений*\nсочувствие — _без беспомощности_", 1060, 870, "label", size=38)
    nox.key(f0, 1.0, pose="calm", x=300, s=0.75)

    # --- G: windows go out one by one; a huge sign lights up above the street
    g0 = T.S("CH11-G")
    zones.key(g0 - 0.3, 0.8, alpha=0.0)
    w2 = kit.obj(st, "windows6", 2400, seed=1110, layer=1)
    w2.key(g0, 0.01, x=1060, y=560, s=1.0, alpha=0.0)
    w2.key(g0 + 0.1, 0.8, alpha=0.9)
    w2.key(T.Wd("CH11-G", "гаснут"), 2.4, level=0.0)
    w2.key(T.Wd("CH11-G", "указатель") - 0.4, 0.6, alpha=0.0)
    sign = kit.obj(st, "bigsign", 3000, seed=1111, layer=3)
    w_sign = T.Wd("CH11-G", "загорается")
    sign.key(w_sign - 0.2, 0.01, x=1060, y=440, s=1.0, alpha=1.0, assemble=0.0, ox=1060, oy=900, spread=3)
    sign.key(w_sign - 0.1, 1.6, assemble=1.0, bright=1.3)
    st.cap(T.Wd("CH11-G", "ответ") - 0.5, T.E("CH11-G", 1.6), "ОДИН ОТВЕТ ДЛЯ ВСЕХ", 1060, 425, "head", size=58)
    st.sound(w_sign, "neon", 0.5)
    nox.key(g0, 1.0, pose="surprised", x=330)
    st.sign = sign
