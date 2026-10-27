"""CH09 — Настойчивость и упрямство (16:00–18:00)."""
import kit
import shapes


def build(st):
    T = st.T
    nox, bridge = st.nox, st.bridge
    G = kit.GROUND
    c0 = T.C(9)
    bridge.key(c0 + 0.2, 1.2, alpha=0.0)

    # --- A: mid-film reminder: what Nox already understands and what not yet
    a0 = T.S("CH09-A")
    nox.key(c0 + 0.1, 0.01, x=420, y=G, s=0.9, pose="calm", face=1.0)
    st.cap(T.Wd("CH09-A", "уходят") - 0.4, T.E("CH09-A", 0.8), "Понял: куда уходят огни · зачем запас", 1150, 380, "label")
    st.cap(T.Wd("CH09-A", "помогает") - 0.6, T.E("CH09-A", 0.8), "Пока нет: когда цель *помогает*, а когда *мешает*",
           1150, 450, "label")
    jar = kit.obj(st, "jar", 900, seed=901, layer=3)
    jar.key(T.Wd("CH09-A", "уходят") - 0.4, 0.01, x=1000, y=650, s=0.42, alpha=0.0)
    jar.key(T.Wd("CH09-A", "уходят") - 0.3, 0.6, alpha=0.8)
    brg = kit.obj(st, "bridge", 1400, seed=902, layer=3)
    brg.key(T.Wd("CH09-A", "запас") - 0.3, 0.01, x=1300, y=650, s=0.3, alpha=0.0)
    brg.key(T.Wd("CH09-A", "запас") - 0.2, 0.6, alpha=0.8)
    for a in (jar, brg):
        a.key(T.E("CH09-A", 0.8), 0.8, alpha=0.0)

    # --- B: a clock mechanism for the town square; three identical failures
    b0 = T.S("CH09-B")
    tower = kit.obj(st, "clocktower", 2200, seed=903, layer=2)
    tower.key(b0 - 0.01, 0.01, x=1340, y=560, s=1.15, alpha=0.0, tint=(0.4, 0.45, 0.8, 0.5))
    tower.key(b0, 1.0, alpha=0.9)
    gear = kit.obj(st, "gear", 1200, seed=904, layer=4)
    nox.key(b0, 1.2, pose="work", x=860)
    for i, w in enumerate(("Первая", "Вторая", "Третья")):
        tw = T.Wd("CH09-B", w)
        gear.key(tw - 0.4, 0.01, x=1340, y=606, s=0.38, alpha=1.0, assemble=0.0, ox=1060, oy=700)
        gear.key(tw - 0.3, 0.9, assemble=1.0)
        gear.key(tw + 0.9, 0.7, assemble=0.0, ox=1340, oy=900, spread=3)
        st.cap(tw, tw + 1.6, f"попытка {i + 1}: не работает", 1340, 290, "label")
        st.sound(tw + 0.9, "clunk", 0.35)
    st.cap(T.Wd("CH09-B", "повторяет") - 0.2, T.E("CH09-B", 1.0), "тот же шаг → *тот же* результат", 1340, 290, "label")

    # --- B2: it looks like persistence, but it is stubbornness (holding the method, not the goal)
    b2 = T.S("CH09-B2")
    st.cap(T.Wd("CH09-B2", "настойчивость") - 0.3, T.Wd("CH09-B2", "упрямство") - 0.1, "настойчивость?", 960, 170, "head")
    st.cap(T.Wd("CH09-B2", "упрямство") - 0.1, T.E("CH09-B2", 0.8), "*упрямство*: держится за способ, а не за цель",
           960, 170, "head", size=50)
    nox.key(b2, 1.0, pose="work", head=30, ear=10)

    # --- C: Hill on persistence + replacing failed plans; Housel: stay able to continue
    c1 = T.S("CH09-C")
    st.cap(T.Wd("CH09-C", "временной") - 0.4, T.E("CH09-C", 0.8), "неудача часто *временна*", 960, 150, "label")
    st.cap(T.Wd("CH09-C", "заменить") - 0.4, T.E("CH09-C", 0.8), "неработающий план — *заменить*", 960, 210, "label")
    st.cap(T.Wd("CH09-C", "продолжать") - 0.5, T.E("CH09-C", 0.8), "оставаться в состоянии _продолжать_", 960, 270, "label")
    nox.key(c1, 1.0, pose="think")

    # --- D: three roads: repeat forever / quit at the first trouble / a small limited experiment
    d0 = T.S("CH09-D")
    tower.key(d0 - 0.3, 0.8, alpha=0.0)
    roads = kit.obj(st, "forks3", 2400, seed=905, layer=2)
    roads.key(d0 - 0.01, 0.01, x=1180, y=560, s=0.9, alpha=1.0, assemble=0.0, ox=1180, oy=800)
    roads.key(d0, 1.4, assemble=1.0)
    for w, txt, x, y in (("повторять", "повторять ошибку", 780, 360), ("Бросить", "бросить всё", 1180, 250),
                         ("опыт", "ограниченный *опыт*", 1600, 360)):
        st.cap(T.Wd("CH09-D", w) - 0.2, T.E("CH09-E", 0.8), txt, x, y, "small")
    nox.key(d0, 1.0, pose="tilt", x=560, s=0.85)

    # --- E: he chooses the third: a limit (one week, parts already on the shelf), then honest review
    e0 = T.S("CH09-E")
    roads.key(e0 + 0.2, 1.0, bright=0.5)
    st.cap(T.Wd("CH09-E", "неделя") - 0.3, T.E("CH09-E", 1.0), "1 неделя · детали с полки", 1600, 420, "small")
    st.cap(T.Wd("CH09-E", "оценит") - 0.3, T.E("CH09-E", 1.0), "потом — *честная оценка*", 1600, 470, "small")
    nox.key(e0, 1.6, pose="walk", x=980, s=0.75)
    nox.key(T.Wd("CH09-E", "перечитывает") - 0.2, 0.8, pose="write")
    note = kit.obj(st, "notebook", 1400, seed=906, layer=4)
    note.key(T.Wd("CH09-E", "заметки") - 0.5, 0.01, x=1180, y=700, s=0.4, alpha=0.0)
    note.key(T.Wd("CH09-E", "заметки") - 0.4, 0.6, alpha=0.9)
    note.key(T.E("CH09-E", 0.8), 0.8, alpha=0.0)

    # --- F: our editorial conclusion (not a quote): keep the direction, change the method
    f0 = T.S("CH09-F")
    roads.key(f0, 1.0, alpha=0.0)
    st.cap(f0 + 0.2, T.E("CH09-F", 1.0), "Направление — *держать*.\nСпособ — _менять_.", 960, 430, "title")
    st.cap(T.Wd("CH09-F", "сам") - 0.3, T.E("CH09-F", 1.0), "вывод Нокса", 960, 600, "note")
    nox.key(f0, 1.0, pose="calm", x=330)

    # --- G: he does not burn the bridge: supports stay, the next span is rebuilt; the clock comes alive
    g0 = T.S("CH09-G")
    st.bridge.key(g0 - 0.3, 0.01, x=860, y=620, s=0.8, alpha=1.0, assemble=1.0, sy=1.0, bright=1.0)
    st.bridge.key(g0 - 0.2, 1.0, alpha=1.0)
    span = kit.obj(st, "bridge", 1600, seed=907, layer=3)
    w_span = T.Wd("CH09-G", "пролёт")
    span.key(w_span - 0.4, 0.01, x=860 + 900 * 0.8 * 0.62, y=620, s=0.5, alpha=1.0, assemble=0.0, ox=1500, oy=900,
             tint=(*shapes.GREEN, 0.4))
    span.key(w_span - 0.3, 1.8, assemble=1.0)
    st.cap(T.Wd("CH09-G", "Опоры") - 0.2, T.E("CH09-G", 0.4), "опоры остаются", 860, 820, "small")
    w_live = T.Wd("CH09-G", "оживает")
    tower.key(w_live - 0.6, 0.01, x=1560, y=330, s=0.7, alpha=0.0, tint=(1, 1, 1, 0.0))
    tower.key(w_live - 0.5, 0.8, alpha=1.0, bright=1.3)
    st.sound(w_live, "tick", 0.5)
    st.cap(T.Wd("CH09-G", "закрыть") - 0.5, T.E("CH09-G", 1.4), "иначе — честно *закрыть* замысел", 1300, 120, "small")
    nox.key(g0, 0.01, x=420, y=620 - 40 * 0.8, s=0.5, pose="walk")
    nox.key(g0 + 0.1, 4.0, x=900)
    nox.key(g0 + 4.2, 0.8, pose="calm")
    for a in (span, tower, st.bridge):
        a.key(T.E("CH09-G", 1.2), 0.8, alpha=0.0)
