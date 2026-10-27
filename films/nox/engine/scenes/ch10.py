"""CH10 — Время, которое не видно в первый день (18:00–20:00). Ledger: 120 → 220 → 320 → 420."""
import numpy as np

import kit
import shapes
from stage import route, stagger

CAP = 600.0   # jar capacity in units (level = units / CAP), same in every chapter


def build(st):
    T = st.T
    nox, jar, fill = st.nox, st.jar, st.jarfill
    G = kit.GROUND
    c0 = T.C(10)

    # --- A: one day hardly differs from another: repair, notes, repair
    a0 = T.S("CH10-A")
    bench = kit.obj(st, "workbench", 1000, seed=1001, layer=2)
    bench.key(c0 + 0.2, 0.01, x=1060, y=800, s=0.9, alpha=0.0)
    bench.key(c0 + 0.3, 0.8, alpha=0.9)
    nox.key(c0 + 0.2, 0.01, x=760, y=G, s=0.9, pose="work", face=1.0, alpha=1.0)
    for k in range(5):
        t = a0 + 0.8 + k * 1.6
        sp = kit.obj(st, "dot", 40, seed=1002 + k, layer=6)
        sp.key(t, 0.01, x=1010 + (k % 3) * 30, y=730, s=0.8, alpha=0.0)
        sp.key(t + 0.05, 0.15, alpha=1.0, s=1.3)
        sp.key(t + 0.4, 0.4, alpha=0.0)
        nox.key(t, 0.4, fa2=40 + 18 * (k % 2))
    st.cap(T.Wd("CH10-A", "чинит") - 0.2, T.E("CH10-A", 1.0), "чинит · записывает · чинит", 1060, 300, "small")

    # --- B: zoom out from a day to weeks: the master's hand changes; notes show 3 h -> 40 min
    b0 = T.S("CH10-B")
    weeks = kit.obj(st, "weeks", 2600, seed=1010, layer=2)
    w_wk = T.Wd("CH10-B", "недели")
    weeks.key(w_wk - 0.6, 0.01, x=960, y=330, s=1.15, alpha=1.0, assemble=0.0, ox=1060, oy=700, spread=3)
    weeks.key(w_wk - 0.5, 2.0, assemble=1.0)
    st.cam.key(w_wk - 0.8, 2.0, z=0.88, cy=560)
    st.cam.key(T.E("CH10-B", 0.8), 1.6, z=1.0, cy=540)
    st.cap(T.Wd("CH10-B", "Повторных") - 0.2, T.E("CH10-B", 0.4), "меньше повторных ошибок · точнее работа", 1180, 480, "small")
    w3 = T.Wd("CH10-B", "три")
    st.cap(w3 - 0.4, T.E("CH10-B", 1.0), "весной: *3 часа*", 1280, 620, "label")
    st.cap(T.Wd("CH10-B", "сорок") - 0.4, T.E("CH10-B", 1.0), "к лету: *40 минут*", 1680, 620, "label")
    note = kit.obj(st, "notebook", 1200, seed=1011, layer=4)
    note.key(T.Wd("CH10-B", "записи") - 0.4, 0.01, x=1480, y=780, s=0.35, alpha=0.0)
    note.key(T.Wd("CH10-B", "записи") - 0.3, 0.6, alpha=0.9)
    note.key(T.E("CH10-B", 1.0), 0.8, alpha=0.0)

    # --- C: one link is not a chain; one good repair is not a working process
    cc0 = T.S("CH10-C")
    weeks.key(cc0 - 0.3, 0.8, alpha=0.0)
    bench.key(cc0 - 0.3, 0.8, alpha=0.0)
    link = kit.obj(st, "link", 1600, seed=1012, layer=3)
    link.key(cc0 - 0.01, 0.01, x=1180, y=520, s=1.4, alpha=0.0)
    link.key(cc0 + 0.1, 0.6, alpha=1.0)
    w_ch = T.Wd("CH10-C", "собирается")
    link.key(w_ch - 0.4, 1.8, shape="chain", s=1.15)
    st.cap(cc0 + 0.3, T.E("CH10-C", 1.0), "одно звено ≠ цепь", 1180, 330, "label")
    st.cap(T.Wd("CH10-C", "ремонт") - 0.3, T.E("CH10-C", 1.0), "один ремонт ≠ *рабочий процесс*", 1180, 700, "label")
    nox.key(cc0, 1.0, pose="calm", x=420)
    st.sound(w_ch - 0.3, "chain", 0.4)

    # --- D: the same with lights, no magic: 120 -> 220 -> 320 -> 420 (100 a month, from his income)
    d0 = T.S("CH10-D")
    st.light(d0 - 0.9, T.E("CH10-D2", 0.7))
    link.key(d0 - 0.3, 0.8, alpha=0.0)
    jar.key(d0 - 0.3, 0.01, x=1260, y=600, s=0.9, alpha=0.0, bright=1.0)
    jar.key(d0 - 0.2, 0.8, alpha=1.0)
    fill.key(d0 - 0.3, 0.01, x=1260, y=600, s=0.9, alpha=1.0, level=120 / CAP)
    st.cap(T.Wd("CH10-D", "двадцать") - 0.2, T.Wd("CH10-D", "Двести") + 0.2, "120", 1260, 330, "num")
    totals = (("Двести", 220), ("Триста", 320), ("Четыреста", 420))
    for i, (w, v) in enumerate(totals):
        tw = T.Wd("CH10-D", w)
        n = 100
        rng = np.random.default_rng(1020 + i)
        src = np.stack([rng.uniform(500, 900, n), rng.uniform(-50, 20, n)], 1)
        dst = np.stack([1260 + rng.normal(0, 40, n), 560 + rng.normal(0, 30, n)], 1)
        tg = stagger(n, tw - 0.9, tw - 0.2, 1030 + i)
        st.add(route(n, [(tg, src), (tg + 0.8, dst)], seed=1040 + i, t_off=tg + 0.8, size=0.9))
        fill.key(tw - 0.1, 0.5, level=v / CAP)
        nxt = T.Wd("CH10-D", totals[i + 1][0]) + 0.2 if i < 2 else T.E("CH10-D2", 0.6)
        st.cap(tw, nxt, f"{v}", 1260, 330, "num")
        st.sound(tw - 0.1, "drop", 0.3)
    st.cap(T.Wd("CH10-D", "Нокс") - 0.2, T.E("CH10-D2", 0.6), "+100 в месяц · *без начислений*", 1260, 860, "small")
    st.cap(T.Wd("CH10-D", "воздуха") - 0.8, T.E("CH10-D", 0.8), "каждый огонёк — из заработка", 600, 400, "label")
    nox.key(d0, 1.0, pose="think", x=560)

    # --- D2: regularity matters more than size — even in months he wants to skip
    e0 = T.S("CH10-D2")
    st.cap(T.Wd("CH10-D2", "Регулярность") - 0.2, T.E("CH10-D2", 0.8), "*регулярность* важнее размера", 600, 400, "label")
    nox.key(T.Wd("CH10-D2", "пропустить") - 0.5, 0.8, pose="reach_stop", head=16)

    # --- E: a sprout = skill, not a promised harvest
    f0 = T.S("CH10-E")
    jar.key(f0 - 0.3, 0.8, alpha=0.0)
    fill.key(f0 - 0.3, 0.8, alpha=0.0)
    sprout = kit.obj(st, "sprout", 1500, seed=1050, layer=3)
    sprout.key(f0 - 0.01, 0.01, x=1260, y=640, s=1.2, alpha=1.0, assemble=0.0, ox=1260, oy=760)
    sprout.key(f0, 2.4, assemble=1.0)
    st.cap(T.Wd("CH10-E", "навыка") - 0.3, T.E("CH10-E", 1.0), "образ *навыка*, не обещание урожая", 1260, 300, "label")
    st.cap(T.Wd("CH10-E", "гарантируют") - 0.3, T.E("CH10-E", 1.0), "навыки не гарантируют дохода", 1260, 900, "small")
    nox.key(f0, 1.0, pose="calm")

    # --- F: not a ban on today's joys; choosing between what he values
    g0 = T.S("CH10-F")
    sprout.key(g0 - 0.3, 0.8, alpha=0.0)
    sc = kit.obj(st, "scales", 1600, seed=1051, layer=3)
    sc.key(g0 - 0.01, 0.01, x=1180, y=560, s=1.3, alpha=0.0)
    sc.key(g0 + 0.1, 0.8, alpha=1.0)
    sc.key(g0 + 1.0, 1.2, rot=-6)
    sc.key(g0 + 3.0, 1.6, rot=3)
    sc.key(g0 + 5.0, 1.6, rot=0)
    st.cap(g0 + 0.4, T.E("CH10-F", 0.8), "один вечер", 970, 760, "small")
    st.cap(g0 + 0.6, T.E("CH10-F", 0.8), "месяцы", 1390, 760, "small")
    st.cap(T.Wd("CH10-F", "выбирать") - 0.3, T.E("CH10-F", 0.8), "выбирать, а не *воевать с жизнью*", 1180, 200, "label")

    # --- G: calendar cells -> windows of the neighbouring houses
    h0 = T.S("CH10-G")
    sc.key(h0 - 0.3, 0.8, alpha=0.0)
    cal = kit.obj(st, "calendar", 2600, seed=1052, layer=2)
    cal.key(h0 - 0.01, 0.01, x=1100, y=520, s=1.2, alpha=0.0)
    cal.key(h0 + 0.1, 0.8, alpha=1.0)
    w_win = T.Wd("CH10-G", "окна")
    cal.key(w_win - 0.2, 2.0, shape="windows6", s=1.0, x=1100, y=480)
    st.cap(T.Wd("CH10-G", "своя") - 0.2, T.E("CH10-G", 1.4), "за каждым окном — *своя* жизнь", 1100, 900, "label")
    nox.key(h0, 1.0, pose="tilt", x=330, s=0.8)
    st.windows = cal
