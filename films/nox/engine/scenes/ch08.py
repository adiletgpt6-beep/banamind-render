"""CH08 — Запас, который казался лишним (14:00–16:00). Ledger: 300 − 180 = 120."""
import numpy as np

import kit
import shapes
from film import FoxActor
from stage import route, stagger

CAP = 600.0   # jar capacity in units (level = units / CAP), same in every chapter


def build(st):
    T = st.T
    nox, jar, fill, bridge, box, lock = st.nox, st.jar, st.jarfill, st.bridge, st.box, st.lock
    G = kit.GROUND
    c0 = T.C(8)
    box.key(c0 - 0.5, 0.8, alpha=0.0)
    lock.key(c0 - 0.5, 0.8, alpha=0.0)

    # --- A: the main workshop machine breaks (everyday trouble, not a catastrophe)
    a0 = T.S("CH08-A")
    mach = kit.obj(st, "anvil", 2000, seed=801, layer=3)
    mach.key(c0 + 0.2, 0.01, x=1180, y=760, s=1.0, alpha=0.0)
    mach.key(c0 + 0.4, 1.0, alpha=1.0)
    nox.key(c0 + 0.2, 1.2, pose="work", x=760, s=0.95)
    w_br = T.Wd("CH08-A", "Ломается")
    mach.key(w_br - 0.1, 0.5, shape="broken", curve=0.3)
    st.sound(w_br - 0.05, "clunk", 0.7)
    nox.key(w_br + 0.1, 0.4, pose="surprised")
    nox.key(w_br + 1.2, 0.8, pose="tilt")
    st.cap(T.Wd("CH08-A", "катастрофа") - 0.3, T.E("CH08-A", 1.0), "не катастрофа — но *работать нельзя*", 960, 180, "label")

    # --- B: repair costs 180; the vessel holds the 300 saved over three months
    b0 = T.S("CH08-B")
    jar.key(b0 - 0.3, 0.01, x=420, y=560, s=0.8, alpha=0.0, bright=1.0)
    jar.key(b0 - 0.2, 0.8, alpha=1.0)
    fill.key(b0 - 0.3, 0.01, x=420, y=560, s=0.8, alpha=1.0, level=300 / CAP)
    st.cap(T.Wd("CH08-B", "восемьдесят") - 0.6, T.E("CH08-D", 0.5), "Ремонт: *180*", 1180, 520, "head")
    st.cap(T.Wd("CH08-B", "триста") - 0.2, T.Wd("CH08-C", "Нокс") + 1.0, "В сосуде: *300*", 420, 330, "label")
    nox.key(b0, 1.2, pose="walk", x=760, face=-1.0)
    nox.key(b0 + 1.2, 0.8, pose="think", face=-1.0)

    # --- C: two imagined versions in one frame: without the reserve / with it
    cc0 = T.S("CH08-C")
    ghost = st.add(FoxActor(seed=7))
    ghost.layer = 2
    ghost.key(cc0, 0.01, pose="tired", x=1500, y=G, s=0.6, alpha=0.0, dim=0.5)
    ghost.key(cc0 + 0.3, 1.0, alpha=0.5)
    gm = kit.obj(st, "broken", 1100, seed=802, layer=2)
    gm.key(cc0, 0.01, x=1700, y=820, s=0.45, alpha=0.0, bright=0.5)
    gm.key(cc0 + 0.3, 1.0, alpha=0.6)
    st.cap(cc0 + 0.4, T.Wd("CH08-C", "теперь") + 0.5, "Без запаса: *спешка*", 1600, 560, "label")
    st.cap(T.Wd("CH08-C", "спешка") - 0.2, T.Wd("CH08-C", "теперь") + 0.5, "соглашаешься на что угодно", 1600, 615, "small")
    w_now = T.Wd("CH08-C", "теперь")
    for a in (ghost, gm):
        a.key(w_now, 1.0, alpha=0.0)
    w_pay = T.Wd("CH08-C", "оплачивает")
    n = 180
    rng = np.random.default_rng(803)
    src = np.stack([420 + rng.normal(0, 28, n), 600 + rng.normal(0, 30, n)], 1)
    dst = np.stack([1180 + rng.normal(0, 70, n), 740 + rng.normal(0, 25, n)], 1)
    tg = stagger(n, w_pay - 0.2, w_pay + 1.4, 804)
    st.add(route(n, [(tg, src), (tg + 1.0, dst)], seed=805, t_off=tg + 1.05, size=0.95, arc=-160))
    fill.key(w_pay - 0.2, 1.8, level=120 / CAP)
    mach.key(w_pay + 1.0, 1.2, shape="anvil", curve=0.5)
    st.sound(w_pay, "flow", 0.5)
    st.sound(w_pay + 1.6, "fixed", 0.5)
    w_eq = T.Wd("CH08-C", "Триста")
    st.cap(w_eq - 0.2, T.E("CH08-D", 0.6), "300 − 180 = *120*", 960, 170, "head")
    st.cap(w_eq + 1.0, T.E("CH08-D2", 0.6), "Остаток: *120*", 420, 330, "label")

    # --- D: less than before — but he got time to decide calmly
    d0 = T.S("CH08-D")
    nox.key(d0, 1.0, pose="calm", face=1.0)
    st.cap(T.Wd("CH08-D", "время") - 0.3, T.E("CH08-D", 1.0), "главное — *время* спокойно решить", 1180, 360, "label")

    # --- D2: the empty space in the vessel = room to manoeuvre
    e0 = T.S("CH08-D2")
    mach.key(e0, 1.0, alpha=0.3)
    st.cap(T.Wd("CH08-D2", "упущенной") - 0.4, T.Wd("CH08-D2", "Теперь"), "пустое место = упущенная покупка?", 960, 180,
           "label")
    st.cap(T.Wd("CH08-D2", "Теперь") - 0.1, T.E("CH08-D2", 0.8), "пустое место = *пространство для манёвра*", 960, 180,
           "label")
    jar.key(T.Wd("CH08-D2", "манёвра") - 0.3, 1.0, bright=1.4)
    glow = kit.obj(st, "pile:120:150:18E6CF", 500, seed=806, layer=2)
    glow.key(T.Wd("CH08-D2", "манёвра") - 0.4, 0.01, x=420, y=500, s=1.0, alpha=0.0)
    glow.key(T.Wd("CH08-D2", "манёвра") - 0.3, 1.0, alpha=0.35)
    glow.key(T.E("CH08-D2", 0.6), 0.8, alpha=0.0)
    nox.key(e0, 1.0, pose="think")

    # --- E: Housel: room for error; staying in the game. The bridge with spare supports
    f0 = T.S("CH08-E")
    mach.key(f0 - 0.4, 1.0, alpha=0.0)
    jar.key(f0 - 0.4, 1.0, alpha=0.0, bright=1.0)
    fill.key(f0 - 0.4, 1.0, alpha=0.0)
    bridge.key(f0 - 0.01, 0.01, x=1060, y=560, s=1.0, alpha=1.0, assemble=0.0, ox=420, oy=560, spread=3)
    bridge.key(f0, 2.4, assemble=1.0)
    st.cap(T.Wd("CH08-E", "ошибки") - 0.3, T.E("CH08-E", 0.8), "*запас на ошибки*", 1060, 170, "head")
    st.cap(T.Wd("CH08-E", "продолжить") - 0.6, T.E("CH08-E", 0.8), "суметь продолжить", 1060, 240, "small")
    nox.key(f0, 1.4, pose="walk", x=330, s=0.75)
    nox.key(f0 + 1.4, 0.8, pose="calm")

    # --- F: limit: a load bigger than the supports (not every reserve covers every trouble)
    g0 = T.S("CH08-F")
    load = kit.obj(st, "cloud", 1400, seed=807, layer=4)
    load.key(g0 + 0.3, 0.01, x=1060, y=300, s=1.6, alpha=0.0, tint=(0.45, 0.4, 0.75, 0.6))
    load.key(g0 + 0.4, 1.0, alpha=0.7)
    load.key(T.E("CH08-F", 0.4), 1.0, alpha=0.0)
    st.cap(T.Wd("CH08-F", "именно") - 0.2, T.E("CH08-F", 0.8), "покрыл *именно эту* поломку", 1060, 120, "label")
    st.cap(T.Wd("CH08-F", "любой") - 0.3, T.E("CH08-F", 0.8), "не любой резерв выдержит любую беду", 1060, 820, "small")

    # --- G: the bridge sags — the spare supports take the load; he simply walks across
    h0 = T.S("CH08-G")
    w_sag = T.Wd("CH08-G", "проседает")
    nox.key(h0 - 0.4, 0.01, x=560, y=520, s=0.55, pose="walk")
    nox.key(h0 - 0.3, 5.5, x=1500)
    bridge.key(w_sag - 0.2, 0.6, sy=0.94, y=572)
    bridge.key(w_sag + 0.6, 0.8, sy=1.0, y=560, bright=1.35)
    st.sound(w_sag, "creak", 0.4)
    st.cap(T.Wd("CH08-G", "опоры") - 0.2, T.E("CH08-G", 1.2), "запасные опоры принимают нагрузку", 1060, 900, "small")
    nox.key(T.E("CH08-G", 0.2), 0.8, pose="calm", x=1560, y=520)
    bridge.key(T.E("CH08-G", 1.0), 1.0, bright=1.0)
