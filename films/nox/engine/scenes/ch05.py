"""CH05 — Цель, у которой есть следующий шаг (08:00–10:00)."""
import kit
import shapes


def build(st):
    T = st.T
    nox, comp, tower = st.nox, st.compass, st.tower
    G = kit.GROUND
    arrow = st.arrow

    # --- A: arrow -> compass; the word "БОЛЬШЕ" scatters into arrows pointing everywhere
    a0 = T.S("CH05-A")
    arrow.key(a0 - 0.5, 0.6, alpha=0.0)
    comp.key(a0 - 0.6, 0.01, x=1260, y=560, s=1.4, alpha=1.0, assemble=0.0, ox=1260, oy=560, spread=4)
    comp.key(a0 - 0.5, 1.4, assemble=1.0, rot=0)
    word = kit.obj(st, "text:БОЛЬШЕ:120:E948B8", 1800, seed=501, layer=4)
    wb = T.Wd("CH05-A", "больше")
    word.key(wb - 0.4, 0.01, x=1260, y=560, s=1.0, alpha=0.0)
    word.key(wb - 0.3, 0.6, alpha=1.0)
    w_all = T.Wd("CH05-A", "стороны")
    word.key(w_all - 0.8, 1.6, shape="arrows_all", s=1.15)
    word.key(T.E("CH05-A", 1.6), 1.0, alpha=0.0)
    comp.key(wb, 0.6, alpha=0.35)
    # needle spins (rot) while the goal is vague
    comp.key(w_all - 0.6, 2.5, rot=540)
    nox.key(a0 - 0.5, 1.0, pose="tilt", x=520, s=0.95, face=1.0)
    st.sound(w_all - 0.6, "whoosh", 0.35)

    # --- B: Hill: definiteness; what you give in return
    b0 = T.S("CH05-B")
    comp.key(b0 + 0.3, 1.2, alpha=1.0, rot=720, s=1.3)
    st.cap(T.Wd("CH05-B", "взамен") - 0.4, T.E("CH05-B", 1.0), "Что ты отдаёшь *взамен*?", 1260, 170, "head")
    st.cap(T.Wd("CH05-B", "пользу") - 0.3, T.E("CH05-B", 1.0), "какую пользу создаёшь", 1260, 240, "small")
    nox.key(b0, 1.0, pose="think")

    # --- C: first goal: the tallest tower — beautiful, but no next step
    c0 = T.S("CH05-C")
    tower.key(c0 - 0.01, 0.01, x=1560, y=430, s=1.05, alpha=0.0, assemble=0.0, ox=1260, oy=560)
    tower.key(c0, 1.6, assemble=1.0, alpha=0.9)
    comp.key(c0, 1.0, x=900, y=520, s=0.85)
    comp.key(c0 + 1.0, 3.0, rot=900)
    st.cap(c0 + 0.4, T.E("CH05-C", 0.8), "Цель 1: «самая высокая башня»", 1560, 110, "label")
    st.cap(T.Wd("CH05-C", "завтра") - 0.3, T.E("CH05-C", 0.8), "Что делать *завтра утром*?", 900, 330, "small")
    nox.key(c0, 1.0, pose="proud")
    nox.key(T.Wd("CH05-C", "Но"), 0.8, pose="tilt")

    # --- D: second goal: a repair skill, real people, a 2-month check, no promised income
    d0 = T.S("CH05-D")
    tower.key(d0 - 0.2, 1.0, alpha=0.0)
    comp.key(d0, 1.6, rot=1080 + 30, x=420, y=380, s=0.7)
    lamp = kit.obj(st, "lamp", 1400, seed=502, layer=3)
    lamp.key(T.Wd("CH05-D", "механизмы") - 0.6, 0.01, x=1030, y=600, s=0.75, alpha=0.0, tint=(0.5, 0.55, 0.9, 0.5))
    lamp.key(T.Wd("CH05-D", "механизмы") - 0.5, 0.8, alpha=1.0)
    people = []
    for i, x in enumerate((1360, 1470, 1580)):
        p = kit.obj(st, "person" if i != 1 else "person2", 700, seed=503 + i, layer=3)
        tw = T.Wd("CH05-D", "жителям") - 0.4 + i * 0.15
        p.key(tw, 0.01, x=x, y=G - 120, s=0.65, alpha=0.0)
        p.key(tw + 0.05, 0.6, alpha=0.8)
        people.append(p)
    cal = kit.obj(st, "calendar", 1200, seed=506, layer=3)
    tw = T.Wd("CH05-D", "срок")
    cal.key(tw - 0.3, 0.01, x=1470, y=300, s=0.42, alpha=0.0)
    cal.key(tw - 0.2, 0.6, alpha=0.9)
    st.cap(T.Wd("CH05-D", "механизмы"), T.E("CH05-D", 0.8), "навык", 1030, 820, "small")
    st.cap(T.Wd("CH05-D", "жителям"), T.E("CH05-D", 0.8), "люди", 1470, 820, "small")
    st.cap(tw, T.E("CH05-D", 0.8), "срок: *2 месяца*", 1470, 160, "small")
    st.cap(T.Wd("CH05-D", "обещанного") - 0.3, T.E("CH05-D", 0.8), "доход *не обещан*", 1030, 240, "label")
    nox.key(d0, 1.0, pose="gesture")

    # --- E: three cards
    e0 = T.S("CH05-E")
    for a in [lamp, cal] + people:
        a.key(e0 - 0.4, 0.8, alpha=0.0)
    cards = kit.obj(st, "cards3", 2400, seed=507, layer=3)
    cards.key(e0 - 0.01, 0.01, x=1060, y=560, s=1.0, alpha=1.0, assemble=0.0, ox=520, oy=640)
    cards.key(e0, 1.4, assemble=1.0)
    for i, (w, txt) in enumerate((("умею", "Что я *умею*?"), ("полезно", "Кому это *полезно*?"),
                                  ("шаг", "Какой *следующий шаг*?"))):
        st.cap(T.Wd("CH05-E", w) - 0.4, T.E("CH05-E2", 0.4), txt.replace(" ", "\n", 1) if i == 2 else txt,
               660 + i * 400, 560, "label", size=38)
    nox.key(e0, 1.0, pose="write", x=330, s=0.8)
    st.sound(e0 + 0.3, "paper", 0.4)

    # --- E2: written goal and weekly review (Hill); no "attracting money"
    f0 = T.S("CH05-E2")
    st.cap(T.Wd("CH05-E2", "раз") - 0.2, T.Wd("CH05-E2", "Одного") - 0.2, "Раз в неделю: *что сделано?*", 1060, 760, "label")
    st.cap(T.Wd("CH05-E2", "Одного") - 0.2, T.E("CH05-E2", 0.8), "одного желания *мало*", 1060, 760, "label")
    st.cap(T.Wd("CH05-E2", "следующий") - 0.4, T.E("CH05-E2", 0.8), "важнее следующий шаг", 1060, 830, "small")

    # --- F: start now: broken lamp on the bench, the scheme, a first small try; the dream bubble pops
    g0 = T.S("CH05-F")
    cards.key(g0 - 0.3, 0.8, alpha=0.0)
    bench = kit.obj(st, "workbench", 1100, seed=508, layer=2)
    bench.key(g0 - 0.01, 0.01, x=1080, y=780, s=1.0, alpha=0.0)
    bench.key(g0, 0.8, alpha=0.9)
    lamp.key(T.Wd("CH05-F", "лампу") - 0.5, 0.01, x=1060, y=690, s=0.5, alpha=0.0, tint=(0.5, 0.55, 0.9, 0.5))
    lamp.key(T.Wd("CH05-F", "лампу") - 0.4, 0.8, alpha=1.0)
    book = kit.obj(st, "book", 900, seed=509, layer=3)
    book.key(T.Wd("CH05-F", "схему") - 0.3, 0.01, x=1290, y=730, s=0.5, alpha=0.0)
    book.key(T.Wd("CH05-F", "схему") - 0.2, 0.6, alpha=0.9)
    nox.key(g0, 1.4, pose="walk", x=820, s=0.95)
    nox.key(g0 + 1.4, 0.8, pose="work")
    w_try = T.Wd("CH05-F", "пробу")
    spark = kit.obj(st, "dot", 60, seed=510, layer=6)
    spark.key(w_try - 0.2, 0.01, x=1060, y=660, s=1.2, alpha=0.0)
    spark.key(w_try, 0.2, alpha=1.0)
    spark.key(w_try + 0.4, 0.5, alpha=0.0)
    st.sound(w_try, "spark", 0.4)
    bubble = kit.obj(st, "cloud", 1300, seed=511, layer=4)
    tb = T.Wd("CH05-F", "Представлять")
    bubble.key(tb - 0.2, 0.01, x=1180, y=330, s=1.0, alpha=0.0, tint=(1.0, 0.85, 0.5, 0.3))
    bubble.key(tb, 0.8, alpha=0.8)
    lit = kit.obj(st, "lamp_lit", 900, seed=512, layer=5)
    lit.key(tb + 0.1, 0.01, x=1180, y=330, s=0.45, alpha=0.0)
    lit.key(tb + 0.2, 0.8, alpha=1.0)
    w_pop = T.Wd("CH05-F", "починит")
    bubble.key(w_pop - 0.4, 0.5, assemble=0.0, ox=1180, oy=330, spread=3.0)
    bubble.key(w_pop + 0.1, 0.2, alpha=0.0)
    lit.key(w_pop - 0.4, 0.5, assemble=0.0, ox=1180, oy=330, spread=3.0)
    lit.key(w_pop + 0.1, 0.2, alpha=0.0)
    st.sound(w_pop - 0.4, "pop", 0.4)

    # --- G: limits: market, health, chance do not obey a goal
    h0 = T.S("CH05-G")
    for a in (bench, book):
        a.key(h0 + 0.5, 1.0, alpha=0.0)
    lamp.key(h0 + 0.5, 1.0, alpha=0.0)
    comp.key(h0, 1.4, x=1060, y=520, s=1.1, alpha=1.0, rot=1080)
    for i, (w, txt, x, y) in enumerate((("рынок", "рынок", 760, 330), ("здоровье", "здоровье", 1360, 330),
                                        ("случай", "случай", 1060, 820))):
        cl = kit.obj(st, "cloud", 900, seed=513 + i, layer=2)
        tw = T.Wd("CH05-G", w)
        cl.key(tw - 0.3, 0.01, x=x, y=y, s=0.65, alpha=0.0)
        cl.key(tw - 0.2, 0.8, alpha=0.55)
        cl.key(T.E("CH05-G", 1.2), 1.0, alpha=0.0)
        st.cap(tw, T.E("CH05-G", 1.2), txt, x, y, "small")
    st.cap(T.Wd("CH05-G", "обещание") - 0.4, T.E("CH05-G", 1.3), "Ясная цель — *не обещание победы*", 1060, 120, "head")
    nox.key(h0, 1.0, pose="calm", x=420, s=0.85)
    st.lamp = lamp
    st.bench = bench
