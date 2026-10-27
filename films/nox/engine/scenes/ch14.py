"""CH14 — Одна обычная неделя (26:00–28:00). Nox's experiment in his conditions, no promises."""
import kit
import shapes

DAYS = [  # block, icon shape, caption, pose
    ("CH14-B", "card", "1 · поступления и обязательное", "write"),
    ("CH14-C", "armchair", "2 · покупка ради впечатления: *подождать неделю*", "reach_stop"),
    ("CH14-D", "gear", "3 · какое умение проверить", "think"),
    ("CH14-E", "lamp", "4 · маленькая попытка", "work"),
    ("CH14-E", "person", "5 · честный отзыв — записать", "tilt"),
    ("CH14-F", "bridge", "6 · где план хрупкий?", "think"),
    ("CH14-G", "hourglass", "7 · отдых, вечером — записи", "rest"),
]


def build(st):
    T = st.T
    nox, note, box, lock = st.nox, st.note, st.box, st.lock
    G = kit.GROUND
    c0 = T.C(14)

    # --- A: a notebook page with seven cells
    a0 = T.S("CH14-A")
    st.light(c0 + 0.3, T.E("CH14-G3", 0.6))
    note.key(c0 + 0.2, 1.6, shape="week7", s=1.0, x=1060, y=300)
    nox.key(c0 + 0.2, 0.01, x=330, y=G, s=0.9, pose="write", face=1.0, alpha=0.0)
    nox.key(c0 + 0.3, 1.0, alpha=1.0)
    st.cap(T.Wd("CH14-A", "обычной") - 0.3, T.E("CH14-A", 1.2), "одна *обычная* неделя", 1060, 470, "head")

    xs = [1060 - 630 + i * 210 for i in range(7)]
    icons = []
    for i, (bid, shp, txt, pose) in enumerate(DAYS):
        t0 = T.S(bid) + (0 if i != 4 else T.Wd("CH14-E", "Пятый") - T.S(bid))
        ic = kit.obj(st, shp, 600, seed=1401 + i, layer=4)
        sc = {"bridge": 0.17, "card": 0.5, "armchair": 0.6, "gear": 0.55, "lamp": 0.45, "person": 0.38,
              "hourglass": 0.6}[shp]
        ic.key(t0 - 0.01, 0.01, x=xs[i], y=300, s=sc, alpha=1.0, assemble=0.0, ox=xs[i], oy=300, spread=1.5)
        ic.key(t0, 1.0, assemble=1.0)
        icons.append(ic)
        t1 = T.S(DAYS[i + 1][0]) if i < 6 else T.E("CH14-G", 0.8)
        if i == 3:
            t1 = T.Wd("CH14-E", "Пятый") - 0.1
        st.cap(t0 + 0.2, t1, txt, 1060, 560, "label", size=40)
        nox.key(t0, 0.8, pose=pose)
        st.sound(t0, "tick", 0.3)
    st.cap(T.S("CH14-C") + 0.2, T.E("CH14-C", 0.6), "если желание останется — купить *без чувства вины*", 1060, 620,
           "small")
    st.cap(T.Wd("CH14-F", "запас") - 0.4, T.E("CH14-F", 0.6), "месяц без заказов? сколько продержится запас?", 1060, 620,
           "small")

    # --- G2: not a recipe: other residents would have other weeks
    g2 = T.S("CH14-G2")
    win = kit.obj(st, "windows6", 2000, seed=1410, layer=1)
    win.key(g2 - 0.01, 0.01, x=1260, y=740, s=0.6, alpha=0.0)
    win.key(g2 + 0.1, 1.0, alpha=0.6)
    win.key(T.E("CH14-G3", 0.4), 1.0, alpha=0.0)
    st.cap(g2 + 0.1, T.E("CH14-G2", 0.8), "это *не рецепт*", 1060, 560, "head")
    for i, (w, txt) in enumerate((("работу", "найти работу"), ("долгами", "справиться с долгами"), ("выспаться", "выспаться"))):
        st.cap(T.Wd("CH14-G2", w) - 0.3, T.E("CH14-G2", 0.8), txt, 1060 + (i - 1) * 330, 640, "small")

    # --- G3: what this week does NOT contain
    g3 = T.S("CH14-G3")
    st.cap(g3 + 0.2, T.E("CH14-G3", 0.8), "без запретов · без упрёков · без ожидания чуда", 1060, 560, "label")
    nox.key(g3, 1.0, pose="calm")

    # --- H: three calm questions for the viewer; the notebook dots become a ring around the box
    h0 = T.S("CH14-H")
    for ic in icons:
        ic.key(h0 - 0.3, 1.0, alpha=0.0)
    note.key(h0 - 0.3, 1.0, alpha=0.25)
    st.cap(T.Wd("CH14-H", "ясно") - 0.4, T.Wd("CH14-H", "попробовать") - 0.2, "изменилось то, *насколько ясно* он её видит",
           1060, 560, "label")
    for i, (w, q) in enumerate((("остаётся", "Что остаётся после обязательного?"),
                                ("способность", "Какую полезную способность я развиваю?"),
                                ("Ради", "Ради какой жизни мне нужно *больше*?"))):
        st.cap(T.Wd("CH14-H", w) - 0.6, T.E("CH14-H", 1.2), q, 1060, 520 + i * 70, "label", size=40)
    st.cap(T.Wd("CH14-H", "только") - 0.3, T.E("CH14-H", 1.2), "только для себя — без публичных цифр", 1060, 760, "note")
    w_ring = T.E("CH14-H", 0.2)
    note.key(w_ring, 2.0, shape="mixture", s=2.2, x=960, y=560, alpha=0.9, curve=1.5)
    box.key(w_ring + 0.4, 0.01, x=960, y=560, s=0.8, alpha=0.0, rot=0)
    box.key(w_ring + 0.5, 1.0, alpha=1.0)
    lock.key(w_ring + 0.4, 0.01, x=960, y=560 + 22 * 0.8, s=0.8, alpha=0.0, shape="clockface", rot=0)
    lock.key(w_ring + 0.5, 1.0, alpha=1.0)
    nox.key(w_ring, 1.0, pose="calm", x=420, s=0.85)
