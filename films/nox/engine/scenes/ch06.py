"""CH06 — Полка знаний и работающий навык (10:00–12:00)."""
import math

import numpy as np

import kit
import shapes
from stage import route, stagger


def build(st):
    T = st.T
    nox, comp, lamp, bench = st.nox, st.compass, st.lamp, st.bench
    G = kit.GROUND

    # --- A: a library of lights grows above Nox
    a0 = T.S("CH06-A")
    comp.key(a0 - 1.0, 1.0, assemble=0.0, ox=960, oy=200, spread=3)
    comp.key(a0 + 0.2, 0.2, alpha=0.0)
    lib = kit.obj(st, "library", 3600, seed=601, layer=1)
    lib.key(a0 - 0.2, 0.01, x=980, y=330, s=1.05, alpha=1.0, assemble=0.0, ox=980, oy=700, spread=3)
    lib.key(a0, 2.6, assemble=1.0)
    st.cap(T.Wd("CH06-A", "схемы"), T.E("CH06-A", 1.0), "схемы · названия · советы", 980, 640, "small")
    nox.key(a0 - 1.0, 1.4, pose="surprised", x=600, s=0.95)
    st.sound(a0, "rise", 0.35)

    # --- B: the lamp on the bench is still dark
    b0 = T.S("CH06-B")
    lib.key(b0, 1.2, alpha=0.35, y=260, s=0.85)
    bench.key(b0 - 0.01, 0.01, x=1180, y=800, alpha=0.0)
    bench.key(b0, 0.8, alpha=0.9)
    lamp.key(b0 - 0.01, 0.01, x=1160, y=710, s=0.55, alpha=0.0, tint=(0.45, 0.5, 0.85, 0.6), shape="lamp")
    lamp.key(b0 + 0.1, 0.8, alpha=1.0)
    st.cap(T.Wd("CH06-B", "горит") - 0.2, T.E("CH06-B", 1.2), "не горит", 1160, 520, "label")
    nox.key(b0, 1.4, pose="walk", x=880)
    nox.key(b0 + 1.4, 0.8, pose="tilt")

    # --- C: Hill (specialized knowledge, organised and applied) + Clason (mastery)
    c0 = T.S("CH06-C")
    st.cap(T.Wd("CH06-C", "применёнными") - 0.4, T.E("CH06-C", 0.8), "знания → *применение*", 960, 170, "head")
    st.cap(T.Wd("CH06-C", "ремеслом") - 0.4, T.E("CH06-C", 0.8), "мастерство → польза", 960, 240, "small")

    # --- D: one full learning loop around the lamp: gap -> study -> try -> error -> redo
    d0 = T.S("CH06-D")
    lib.key(d0, 1.0, alpha=0.0)
    steps = (("пробел", "пробел"), ("Читает", "изучить"), ("Пробует", "попробовать"), ("Ошибается", "ошибка"),
             ("снова", "переделать"))
    cx, cy, R = 1160, 560, 250
    for i, (w, lab) in enumerate(steps):
        a = math.radians(-90 + i * 72)
        x, y = cx + R * math.cos(a) * 1.25, cy + R * math.sin(a) * 0.9
        tw = T.Wd("CH06-D", w)
        st.cap(tw - 0.1, T.E("CH06-D", 0.8), lab, x, y, "small")
    # a light runs around the loop
    n = 90
    ang = np.radians(-90 + np.linspace(0, 360, n))
    loop = np.stack([cx + R * 1.25 * np.cos(ang), cy + R * 0.9 * np.sin(ang)], 1)
    tl = stagger(n, T.Wd("CH06-D", "пробел"), T.Wd("CH06-D", "снова") + 0.5, 602)
    st.add(route(n, [(tl, loop)], seed=603, color=shapes.TURQ, t_off=np.full(n, T.E("CH06-D", 0.8)), size=0.8))
    for w in ("шатается", "искрит", "Ошибается"):
        tw = T.Wd("CH06-D", w)
        sp = kit.obj(st, "dot", 50, seed=604 + len(w), layer=6)
        sp.key(tw - 0.01, 0.01, x=1180 + (len(w) % 3) * 20, y=650, s=1.0, alpha=0.0)
        sp.key(tw, 0.15, alpha=1.0, s=1.6)
        sp.key(tw + 0.3, 0.4, alpha=0.0, s=0.4)
        st.sound(tw, "spark", 0.3)
    st.cap(T.Wd("CH06-D", "навыком") - 0.4, T.E("CH06-D", 0.9), "знание → *навык* — через руки", 960, 130, "head")
    nox.key(d0, 1.0, pose="work", x=930)

    # --- E: asking a craftswoman; two streams of drawings; assembling together
    e0 = T.S("CH06-E")
    she = kit.obj(st, "person2", 1300, seed=610, layer=4)
    she.key(e0 - 0.01, 0.01, x=1560, y=G - 160, s=0.95, alpha=0.0)
    she.key(e0 + 0.6, 1.0, alpha=0.95)
    plans = kit.obj(st, "plans2", 1600, seed=611, layer=5)
    tp = T.Wd("CH06-E", "показывает") - 0.3
    plans.key(tp, 0.01, x=1180, y=330, s=0.95, alpha=1.0, assemble=0.0, ox=1360, oy=500, spread=2)
    plans.key(tp + 0.1, 1.4, assemble=1.0)
    plans.key(T.Wd("CH06-E", "сотрудничество"), 1.4, s=0.6, y=300)
    st.cap(T.Wd("CH06-E", "сотрудничество") - 0.3, T.E("CH06-E", 0.9), "сотрудничество: люди знают *разное* и делятся",
           960, 150, "label", size=38)
    st.cap(T.Wd("CH06-E", "магии") - 0.3, T.E("CH06-E", 0.9), "два мастера · одна задача", 960, 210, "small")
    nox.key(T.Wd("CH06-E", "спрашивает") - 0.5, 0.8, pose="gesture", face=1.0)
    nox.key(T.Wd("CH06-E", "объясняет"), 0.8, pose="point")
    plans.key(T.E("CH06-E", 0.6), 0.8, alpha=0.0)

    # --- F: the lamp lights up; a customer carries it home (payment = part of monthly income)
    f0 = T.S("CH06-F")
    w_lit = T.Wd("CH06-F", "загорается")
    lamp.key(w_lit - 0.2, 0.9, shape="lamp_lit", tint=(1, 1, 1, 0.0), bright=1.5, s=0.5)
    st.sound(w_lit, "lit", 0.6)
    nox.key(w_lit, 0.6, pose="proud")
    she.key(f0, 0.8, alpha=0.0)
    cust = kit.obj(st, "person", 1100, seed=612, layer=4)
    tc = T.Wd("CH06-F", "заказчик") - 0.6
    cust.key(tc, 0.01, x=1700, y=G - 160, s=0.95, alpha=0.0)
    cust.key(tc + 0.1, 0.7, alpha=0.9, x=1480)
    w_home = T.Wd("CH06-F", "домой")
    lamp.key(w_home - 0.3, 2.4, x=2100, y=600)
    cust.key(w_home - 0.3, 2.4, x=2200)
    cust.key(w_home + 2.2, 0.3, alpha=0.0)
    st.cap(T.Wd("CH06-F", "Плата") - 0.2, T.E("CH06-F", 1.0), "плата = часть *обычного* месячного заработка", 960, 170,
           "label", size=38)

    # --- G: modest result; the mechanism becomes a clock-wheel; he wants more, faster
    g0 = T.S("CH06-G")
    st.cap(T.Wd("CH06-G", "проверяемый") - 0.5, T.E("CH06-G", 0.6), "маленький *проверяемый* результат", 960, 170, "head")
    bench.key(g0 + 2.0, 1.0, alpha=0.0)
    wheel = kit.obj(st, "wheel", 1600, seed=613, layer=3)
    tw = T.Wd("CH06-G", "кружит")
    wheel.key(tw - 0.3, 0.01, x=1200, y=560, s=0.9, alpha=1.0, assemble=0.0, ox=1180, oy=710)
    wheel.key(tw - 0.2, 1.4, assemble=1.0)
    wheel.key(tw + 1.0, 6.0, rot=360)
    for w in ("Больше", "Быстрее", "Крупнее"):
        t1 = T.Wd("CH06-G", w)
        st.cap(t1 - 0.05, T.E("CH06-G", 1.5), f"*{w}.*", {"Больше": 760, "Быстрее": 1200, "Крупнее": 1640}[w],
               860, "head")
    nox.key(tw, 1.0, pose="gesture", ear=-12, tail_raise=24)
    st.wheel = wheel
