"""CH04 — То, чего не видно (06:00–08:00)."""
import kit
import shapes
from film import FoxActor


def build(st):
    T = st.T
    nox, jar, fill = st.nox, st.jar, st.jarfill
    G = kit.GROUND
    room = st.room

    # --- A: an evening shop window: lamp, tool set, armchair
    a0 = T.S("CH04-A")
    room.key(a0 - 0.8, 1.2, x=330, y=640, s=0.62, alpha=0.8)
    fill.key(a0 - 0.8, 1.0, alpha=0.0)
    jar.key(a0 - 0.8, 1.0, alpha=0.0)
    vit = kit.obj(st, "vitrine", 2600, seed=401, layer=2)
    vit.key(a0 - 0.01, 0.01, x=1260, y=620, s=1.25, alpha=0.0)
    vit.key(a0 + 0.1, 1.2, alpha=0.95)
    items = []
    for i, (shp, w, x, y, sc) in enumerate((("lamp", "лампа", 1080, 640, 0.55), ("toolset", "инструментов", 1270, 700, 0.6),
                                            ("armchair", "кресло", 1460, 680, 0.62))):
        it = kit.obj(st, shp, 900, seed=402 + i, layer=3)
        tw = T.Wd("CH04-A", w)
        it.key(tw - 0.4, 0.01, x=x, y=y, s=sc, alpha=0.0, bright=1.2)
        it.key(tw - 0.3, 0.8, alpha=1.0)
        items.append(it)
    nox.key(a0 - 0.8, 2.4, pose="walk", x=760, y=G, s=0.95, face=1.0)
    nox.key(a0 + 1.6, 1.0, pose="tilt")

    # --- B: his reflection in the glass gets brighter; the room behind him dims
    b0 = T.S("CH04-B")
    refl = st.add(FoxActor(seed=7))
    refl.layer = 4
    refl.key(b0, 0.01, pose="proud", x=1270, y=860, s=0.7, face=-1.0, alpha=0.0, dim=0.55)
    refl.key(T.Wd("CH04-B", "отражение"), 1.2, alpha=0.45)
    refl.key(T.Wd("CH04-B", "ярче"), 1.6, alpha=0.9, dim=1.25)
    room.key(T.Wd("CH04-B", "гаснут") - 0.2, 2.4, alpha=0.12, bright=0.5)
    st.sound(T.Wd("CH04-B", "гаснут"), "dim", 0.4)
    st.cap(T.Wd("CH04-B", "ярче"), T.E("CH04-B", 1.4), "ярче", 1270, 330, "small")
    st.cap(T.Wd("CH04-B", "гаснут"), T.E("CH04-B", 1.4), "гаснет", 330, 330, "small")

    # --- C: Housel: we imagine ourselves in the owner's place
    c0 = T.S("CH04-C")
    st.cap(T.Wd("CH04-C", "видит") - 0.2, T.E("CH04-C", 1.0), "Нокс видит в этой роли *себя*", 960, 170, "head")
    refl.key(c0, 1.0, alpha=0.4, dim=0.8)

    # --- D: another resident looks at the same lamp and sees only himself
    d0 = T.S("CH04-D")
    person = kit.obj(st, "person", 1100, seed=405, layer=4)
    person.key(d0 - 0.01, 0.01, x=1720, y=G - 160, s=0.95, alpha=0.0)
    person.key(d0 + 0.2, 1.0, alpha=0.9)
    pref = kit.obj(st, "person", 1100, seed=406, layer=3)
    pref.key(d0 + 1.4, 0.01, x=1520, y=G - 230, s=0.65, alpha=0.0, bright=1.3)
    pref.key(d0 + 1.5, 1.0, alpha=0.6)
    refl.key(d0 + 1.0, 1.0, alpha=0.0)
    st.cap(T.Wd("CH04-D", "замечает") - 0.3, T.E("CH04-D", 1.0), "Нокса он *не замечает*", 960, 170, "label")
    nox.key(d0 + 1.0, 1.0, pose="tilt", head=22)

    # --- D2: visible vs invisible wealth (two layers of one choice)
    e0 = T.S("CH04-D2")
    for a in (person, pref):
        a.key(e0 - 0.3, 0.8, alpha=0.0)
    st.cap(T.Wd("CH04-D2", "потрачено") - 0.8, T.E("CH04-D2", 0.8), "Видно: сколько *потрачено*", 1270, 300, "label")
    st.cap(T.Wd("CH04-D2", "осталось") - 0.4, T.E("CH04-D2", 0.8), "Не видно: сколько _осталось_", 360, 300, "label")
    room.key(T.Wd("CH04-D2", "осталось") - 0.3, 1.0, alpha=0.85, bright=1.0)
    nox.key(e0, 1.0, pose="think", x=720)

    # --- E: the question, with a two-second pause on a meaningful frame
    q0 = T.S("CH04-E")
    wq = T.Wd("CH04-E", "Если")
    st.cap(T.Wd("CH04-E", "мотиве") - 0.2, wq - 0.1, "Вопрос — в *мотиве*", 960, 170, "head")
    st.cap(wq, T.E("CH04-E", 2.4), "Если эту вещь никто не увидит —\nНокс всё ещё её *захочет*?", 960, 200, "head")
    for it in items[1:]:
        it.key(wq, 1.0, alpha=0.25)
    items[0].key(wq, 1.0, bright=1.5)
    vit.key(wq, 1.0, alpha=0.4)
    nox.key(wq, 1.0, pose="tilt", head=16, ear=6)
    room.key(q0, 1.0, alpha=0.5)

    # --- F: sometimes yes. The invisible reserve = options: rest, learning, a calm week
    f0 = T.S("CH04-F")
    st.cap(f0, T.Wd("CH04-F", "Но") + 0.2, "Иногда — *да*", 960, 200, "head")
    for it in items[1:]:
        it.key(f0, 1.0, alpha=0.9)
    vit.key(f0, 1.0, alpha=0.9)
    opts = (("отдых", 210), ("обучение", 330), ("спокойная неделя", 450))
    for k, (w, x) in enumerate(opts):
        tw = T.Wd("CH04-F", w.split()[0][:6])
        st.cap(tw - 0.1, T.E("CH04-F2", 0.6), w, 330, 400 + k * 50, "small")
    room.key(T.Wd("CH04-F", "отдых") - 0.3, 1.0, alpha=1.0, bright=1.25)

    # --- F2: flexibility (Housel): wait, change job, learn, not panic
    f2 = T.S("CH04-F2")
    st.cap(T.Wd("CH04-F2", "свободой") - 0.2, T.E("CH04-F2", 0.6), "Невидимое = *свобода манёвра*", 1270, 170, "head")
    nox.key(f2, 1.0, pose="calm")

    # --- G: he leaves without buying; one light line in the glass folds into an arrow
    g0 = T.S("CH04-G")
    nox.key(g0, 0.8, face=-1.0, pose="walk", x=520)
    nox.key(g0 + 2.6, 1.0, pose="calm", face=1.0)
    for it in items:
        it.key(g0 + 0.5, 1.2, alpha=0.0)
    w_arrow = T.Wd("CH04-G", "стрелку")
    vit.key(T.Wd("CH04-G", "линия") - 0.4, 1.6, shape="arrow", s=1.6, x=1260, y=560)
    room.key(g0 + 1.0, 1.4, alpha=0.0)
    st.arrow = vit
    st.cap(T.Wd("CH04-G", "запрета") - 0.4, T.E("CH04-G", 0.6), "не из запрета — из *понимания*", 960, 170, "label")
    st.sound(w_arrow - 0.5, "morph", 0.4)
