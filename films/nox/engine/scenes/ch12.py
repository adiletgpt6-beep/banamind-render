"""CH12 — Обещание, слишком красивое для вопросов (22:00–24:00). Reserve: 420 (kept)."""
import numpy as np

import kit
import shapes
from stage import route, stagger

CAP = 600.0   # jar capacity in units (level = units / CAP), same in every chapter


def build(st):
    T = st.T
    nox, sign, jar, fill, comp, bridge = st.nox, st.sign, st.jar, st.jarfill, st.compass, st.bridge
    G = kit.GROUND

    # --- A: the sign turns into a shining construction with a promise
    a0 = T.S("CH12-A")
    sign.key(a0 - 0.2, 2.0, shape="machine_front", s=1.15, x=1240, y=520, bright=1.3, curve=1.4)
    st.cap(T.Wd("CH12-A", "отдай") - 0.3, T.E("CH12-B", 1.2), "«Отдай запас — и завтра\nтвоя башня станет *выше всех*»",
           1240, 140, "head", size=50)
    st.cap(a0 + 0.2, T.E("CH12-A", 1.0), "вымышленная конструкция", 1240, 960, "note")
    nox.key(a0, 1.0, pose="surprised", x=420, s=0.9)
    st.sound(a0 + 0.2, "shimmer", 0.4)

    # --- B: the vessel holds 420; the construction wants all of it, now
    b0 = T.S("CH12-B")
    jar.key(b0 - 0.3, 0.01, x=640, y=600, s=0.75, alpha=0.0, bright=1.0)
    jar.key(b0 - 0.2, 0.8, alpha=1.0)
    fill.key(b0 - 0.3, 0.01, x=640, y=600, s=0.75, alpha=1.0, level=420 / CAP)
    st.cap(T.Wd("CH12-B", "четыреста") - 0.2, T.E("CH12-D", 0.6), "В сосуде: *420*", 640, 380, "label")
    # the jar lights are tugged towards the construction and fall back
    w_all = T.Wd("CH12-B", "все")
    n = 160
    rng = np.random.default_rng(1201)
    src = np.stack([640 + rng.normal(0, 30, n), 610 + rng.normal(0, 30, n)], 1)
    mid = np.stack([880 + rng.normal(0, 40, n), 520 + rng.normal(0, 40, n)], 1)
    tg = stagger(n, w_all - 0.3, w_all + 0.6, 1202)
    st.add(route(n, [(tg, src), (tg + 0.8, mid), (tg + 1.9, src)], seed=1203, t_off=tg + 1.9, size=0.85, arc=-40))
    w_now = T.Wd("CH12-B", "сейчас")
    st.cap(w_now - 0.3, T.E("CH12-B", 1.0), "РЕШАЙ СЕЙЧАС", 1240, 860, "label")
    sign.key(w_now - 0.3, 0.3, bright=1.6)
    sign.key(w_now + 0.1, 0.3, bright=1.1)
    sign.key(w_now + 0.5, 0.3, bright=1.6)
    sign.key(w_now + 0.9, 0.3, bright=1.2)
    nox.key(b0, 1.0, pose="reach_stop", face=1.0)
    st.sound(w_now - 0.2, "pulse", 0.35)

    # --- C: three questions; empty answers
    c0 = T.S("CH12-C")
    for i, (w, q) in enumerate((("Откуда", "Откуда берутся деньги?"), ("отдаю", "Что именно я отдаю?"),
                                ("пойдёт", "Что будет, если не так?"))):
        st.cap(T.Wd("CH12-C", w) - 0.3, T.E("CH12-D", 0.6), q, 420, 130 + i * 56, "label", size=38, align="left")
    nox.key(c0, 1.0, pose="think")
    st.cap(T.Wd("CH12-C", "пусто") - 0.3, T.E("CH12-C", 1.0), "ответы: красиво, *но пусто*", 1240, 960, "label")
    for i, (w, txt) in enumerate((("большое", "обещание очень большое"), ("короткое", "объяснение очень короткое"),
                                  ("немедленно", "решать — немедленно"))):
        st.cap(T.Wd("CH12-C", w) - 0.3, T.E("CH12-C", 1.0), txt, 1640, 300 + i * 52, "small")

    # --- D: the construction turns: behind the bright façade there is no working mechanism
    d0 = T.S("CH12-D")
    w_turn = T.Wd("CH12-D", "поворачивается")
    sign.key(w_turn - 0.2, 0.9, sx=0.08)
    sign.key(w_turn + 0.7, 0.01, shape="machine_back", sx=0.08)
    sign.key(w_turn + 0.72, 0.9, sx=1.0, bright=1.0)
    st.cap(T.Wd("CH12-D", "подсветка") - 0.3, T.E("CH12-D", 1.2), "за фасадом — *только подсветка*", 1240, 960, "label")
    st.sound(w_turn, "whoosh", 0.4)

    # --- E: Clason / Housel / Hill captions on names
    e0 = T.S("CH12-E")
    st.cap(T.Wd("CH12-E", "понимаешь") - 0.5, T.Wd("CH12-E", "уверенности") - 0.6, "не понимаешь дела — *не доверяй* ему запас",
           960, 170, "label", size=38)
    st.cap(T.Wd("CH12-E", "уверенности") - 0.5, T.Wd("CH12-E", "настоящий") - 0.2, "некоторые потери *не отыграть*", 960, 170, "label")
    st.cap(T.Wd("CH12-E", "настоящий") - 0.1, T.E("CH12-E", 0.8), "рост — из *полезной работы*", 960, 170, "label")

    # --- F: not every opportunity is bad; haste + empty answers = stop. His rule
    f0 = T.S("CH12-F")
    st.cap(f0 + 0.1, T.Wd("CH12-F", "спешка") - 0.2, "не всякая новая возможность плоха", 960, 170, "label")
    st.cap(T.Wd("CH12-F", "спешка") - 0.2, T.Wd("CH12-F", "правило") - 0.2, "спешка + пустые ответы = *стоп*", 960, 170,
           "head")
    st.cap(T.Wd("CH12-F", "правило") - 0.1, T.E("CH12-F", 1.0), "правило Нокса: не может объяснить —\n*не отдаёт*", 960, 190,
           "head", size=50)
    nox.key(f0, 1.0, pose="calm")

    # --- G: he keeps the reserve; the advertising lights crumble; three objects remain
    g0 = T.S("CH12-G")
    w_fall = T.Wd("CH12-G", "осыпаются")
    sign.key(w_fall - 0.4, 1.6, assemble=0.0, ox=1240, oy=G + 40, spread=10)
    sign.key(w_fall + 1.3, 0.4, alpha=0.0)
    st.sound(w_fall - 0.3, "crumble", 0.45)
    st.cap(T.Wd("CH12-G", "совет") - 0.5, T.E("CH12-G", 0.2), "решение героя, *не совет* покупать или продавать",
           960, 170, "small")
    w3 = T.Wd("CH12-G", "сосуд")
    jar.key(w3 - 0.2, 1.4, x=620, y=560, s=0.75)
    fill.key(w3 - 0.2, 1.4, x=620, y=560, s=0.75)
    comp.key(T.Wd("CH12-G", "компас") - 0.3, 0.01, x=1000, y=560, s=0.9, alpha=1.0, assemble=0.0, ox=1240, oy=G,
             rot=0, spread=3)
    comp.key(T.Wd("CH12-G", "компас") - 0.2, 1.4, assemble=1.0)
    bridge.key(T.Wd("CH12-G", "мост") - 0.3, 0.01, x=1480, y=600, s=0.42, alpha=1.0, assemble=0.0, ox=1240, oy=G,
               sy=1.0, bright=1.0, spread=3)
    bridge.key(T.Wd("CH12-G", "мост") - 0.2, 1.4, assemble=1.0)
    nox.key(g0, 1.0, pose="calm", x=300, s=0.8)
