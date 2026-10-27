"""A07–A09: the price explains something, where a person meets the idea, two orders ≠ the market (S25–S36)."""
from kit import (BOARD_X, BOX_X, COUNTER_TOP, DOOR_X, GROUND, NEIGHBOR_X, PICKUP_X, SIGN_Y, STALL_X, TABLE_X,
                 TABLEA_X, UPPER_Y)

TABLEC_TOP = GROUND - 80
CARR_C = (TABLE_X, TABLEC_TOP - 50)
U = 52.0          # px per unit of the example in the calculation bars


def bars(K, t, items, x0, y, t_end, h=1.6, u=U):
    """Sequential horizontal bars [(value, colour, label)] starting at x0; returns end x."""
    x = x0
    out = []
    for i, (v, col, lab, tt) in enumerate(items):
        w = v * u
        b = K.prop("bar", x + w / 2, y, layer=4, sx=w / 100, sy=h, smax=1.0, n=int(w * 30 * h / 12),
                   tint=(col[0], col[1], col[2], 1.0))
        K.place(b, t, alpha=0.0, level=1.0)
        K.show(b, tt, 0.6)
        K.hide(b, t_end - 0.45, 0.3)
        if lab:
            K.label(tt + 0.1, t_end - 0.45, lab, x + w / 2, y + 2, "small", size=26)
        out.append(b)
        x += w + 6
    return x, out


def s25(K, sc):
    """A neighbour's price tag and a cord in the pocket do not add up to his price."""
    t0, t1 = sc["t0"], sc["t1"]
    tk, ny = K.tiko, K.naya
    K.cut(t0 + 0.3, 1050, 600, 1.15)
    K.place(tk, t0 + 0.3, x=590, face=1, alpha=1.0, pose="think")
    K.place(ny, t0 + 0.3, alpha=0.0)
    K.place(K.tableA, t0 + 0.3, alpha=0.0)
    K.place(K.carrier, t0 + 0.3, x=BOX_X + 60, y=COUNTER_TOP - 50, att=0.0, shape="carrier_v2", rot=0, alpha=1.0)
    K.place(K.nboxes, t0 + 0.3, alpha=0.0, att=0.0)
    K.place(K.dboxes, t0 + 0.3, x=BOX_X + 60, y=COUNTER_TOP - 44, alpha=0.9, att=0.0)
    tn = K.w("B037", "сосед")
    tag = K.prop("price_tag", 1500, 520, s=1.2, layer=4, tint=(0.9, 0.6, 0.5, 0.4))
    other = K.prop("crate", 1500, 640, s=0.55, layer=3, tint=(0.6, 0.6, 0.9, 0.3))
    for a in (tag, other):
        K.place(a, t0, alpha=0.0)
        K.show(a, tn - 0.3, 0.6, alpha=0.7)
        K.hide(a, t1 - 1.0)
    K.label(tn, t1 - 1.0, "другая вещь,\nдругая работа", 1500, 430, "small", size=26)
    tc = K.w("B037", "шнуром")
    cord = K.prop("cord_loose", 1780, 620, s=1.0, layer=4)
    K.place(cord, t0, alpha=0.0)
    K.show(cord, tc - 0.3, 0.6)
    K.hide(cord, t1 - 1.0)
    K.label(tc, t1 - 1.0, "шнур уже в кармане", 1780, 540, "small", size=26)
    K.headline(K.w("B037", "Чужой") - 0.3, t1 - 0.3, "Из чего цена?")
    note = K.prop("sheet", 0, 0, s=0.4, layer=7)
    K.place(note, t0, alpha=0.0)
    K.hold(note, tk, t0, "hand_f", dx=16, dy=-20, d=0.01)
    tq = K.w("B037", "вопроса")
    tk.key(tq - 1.0, 0.6, pose="write")
    K.show(note, tq - 0.8, 0.5)
    K.hide(note, t1 - 0.5, 0.4)


def s26(K, sc):
    """Conditional calculation: 4 + 6 + 2 = 12; price 16; 16 − 12 = 4 — not net profit yet."""
    t0, t1 = sc["t0"], sc["t1"]
    K.board(t0 + 0.4, t1 - 0.3)
    X0 = BOARD_X - 520
    K.headline(t0 + 0.9, t1 - 0.5, "Условный расчёт на одну переноску", y=110, style="small")
    items = [(4, (0.42, 0.5, 1.0), "4", K.w("B038", "Четыре")),
             (6, (0.62, 0.40, 0.95), "6", K.w("B038", "Шесть")),
             (2, (0.10, 0.70, 0.65), "2", K.w("B038", "две"))]
    xe, _ = bars(K, t0, items, X0, 330, t1)
    names = [("материал", 330 + 62, items[0][3]), ("сборка, включая работу Тико", 330 + 62, items[1][3]),
             ("упаковка", 330 + 96, items[2][3])]
    x = X0
    for (v, _, _, _), (nm, y, tt) in zip(items, names):
        K.label(tt + 0.3, t1 - 0.45, nm, x + v * U / 2, y, "note", size=22)
        x += v * U + 6
    t12 = K.w("B038", "двенадцать")
    K.label(t12 - 0.2, t1 - 0.45, "= 12", xe + 70, 332, "num", size=60)
    tp = K.w("B038", "шестнадцать")
    xp, pb = bars(K, t0, [(16, (1.0, 0.70, 0.30), "цена 16", tp - 0.2)], X0, 520, t1)
    td = K.w("B038", "Разница")
    bars(K, t0, [(4, (0.10, 0.62, 0.45), "4", td - 0.2)], X0 + 12 * U + 12, 600, t1)
    K.label(td, t1 - 0.45, "16 − 12 = 4", X0 + 16 * U + 170, 600, "numS", size=44)
    tn = K.w("B038", "прибыль")
    K.label(tn - 0.8, t1 - 0.45, "ещё не чистая прибыль", BOARD_X, 760, "label")
    to = K.w("B038", "место")
    K.label(to - 0.2, t1 - 0.45, "место • неудачные экземпляры • другие расходы", BOARD_X, 830, "small")


def s27(K, sc):
    """His own work stays in line 6; then the card shows the same full price and conditions."""
    t0, t1 = sc["t0"], sc["t1"]
    tk = K.tiko
    X0 = BOARD_X - 520
    t39 = K.S("B039")
    K.headline(t0 + 0.1, K.w("B039", "заменяет") + 1.0, "Условный расчёт на одну переноску", y=110, style="small")
    items = [(4, (0.42, 0.5, 1.0), "4", t0 - 0.2), (6, (0.62, 0.40, 0.95), "6", t0 - 0.2),
             (2, (0.10, 0.70, 0.65), "2", t0 - 0.2)]
    tend = K.S("B040") - 0.3
    xe, bs = bars(K, t0 - 0.21, items, X0, 330, tend)
    tw = K.w("B039", "труда")
    bs[1].key(tw - 0.2, 0.6, bright=1.4)
    K.label(tw, K.w("B039", "записи") + 1.0, "свой труд — тоже часть цены", X0 + 7 * U, 440, "small")
    bs[1].key(K.w("B039", "исчезнет") - 0.2, 0.8, alpha=0.25)
    bs[1].key(K.w("B039", "исчезнет") + 1.6, 0.8, alpha=1.0)
    tm = K.w("B039", "механически")
    K.label(tm, K.w("B039", "согласиться") + 1.2, "+ желаемая сумма ≠ согласие покупателя", BOARD_X, 560, "small")
    K.label(K.w("B039", "Расчёт"), tend, "расчёт → условия Тико", BOARD_X - 300, 700, "label")
    K.label(K.w("B039", "покупателя", occ=1), tend, "решение → польза для покупателя", BOARD_X + 300, 700, "label")
    K.headline(K.w("B039", "заменяет") - 0.6, tend, "Одно не заменяет другое", y=900, style="small")
    # B040: back to the stall: visible price, same in talk and on the card
    K.cut(tend + 0.3, BOX_X + 160, 620, 1.45, light=0.0)
    K.label(tend + 0.3, t1 + 40, "16", BOX_X + 232, COUNTER_TOP - 26, "small", size=19, dark=True)
    tl = K.w("B040", "доплаты")
    K.label(tl - 0.4, tl + 3.0, "ремень входит в цену", BOX_X + 160, COUNTER_TOP - 260, "small")
    to = K.w("B040", "старой")
    K.label(to - 0.4, to + 3.0, "без придуманной «старой цены»", BOX_X + 160, COUNTER_TOP - 210, "small")
    K.headline(K.w("B040", "отказаться") - 0.6, t1, "Можно рассмотреть, попробовать и отказаться", style="small")
    tk.key(K.w("B040", "проверить"), 0.6, pose="calm")


def s28(K, sc):
    """Bigger boxes do not fit the tested outline; the question goes to a separate note."""
    t0, t1 = sc["t0"], sc["t1"]
    tk, ny = K.tiko, K.naya
    K.cam(t0, 1.2, cx=BOX_X + 200, cy=620, z=1.35)
    K.place(ny, t0, x=1350, face=-1, alpha=0.0, pose="stand")
    ny.key(t0 + 0.1, 0.6, alpha=1.0)
    K.walk(ny, t0 + 0.1, 1180, speed=150)
    tb = K.w("B041", "больше")
    ny.key(tb - 0.6, 0.6, pose="gesture")
    big = K.prop("bigbox_l", BOX_X + 60, COUNTER_TOP - 92, s=1.25, layer=6, tint=(1.0, 0.55, 0.45, 0.35))
    K.place(big, t0, alpha=0.0)
    K.show(big, tb, 0.6, alpha=0.55)
    K.label(tb + 0.4, tb + 4.4, "вне проверенного сценария", BOX_X + 60, COUNTER_TOP - 210, "note")
    K.hide(big, tb + 4.4, 0.8)
    tq = K.w("B041", "проверял")
    K.label(tq - 1.6, tq + 2.6, "«Для таких я пока не проверял»", BOX_X + 160, 330, "label")
    tk.key(tq - 1.6, 0.6, pose="palms")
    K.headline(K.w("B041", "границу") - 0.3, K.w("B041", "границу") + 3.4, "Это ещё не проверено")
    note = K.prop("note", BOX_X - 120, COUNTER_TOP - 30, layer=5)
    K.place(note, t0, alpha=0.0)
    tz = K.w("B041", "Записать")
    tk.key(tz - 0.4, 0.6, pose="write")
    K.show(note, tz, 0.6)
    K.label(tz + 0.3, t1 - 0.4, "вопрос на будущее", BOX_X - 120, COUNTER_TOP - 92, "note")
    tc = K.w("B041", "карточке")
    K.label(tc - 0.3, t1 - 0.3, "небольшое, но выполнимое предложение", BOX_X + 160, 990, "small")
    K.hide(note, t1 - 0.4)
    ny.key(K.w("B041", "обязанность"), 0.6, pose="nod")


def s29(K, sc):
    """The stall by the stream to the platforms: many passers-by, already busy, already leaving."""
    t0, t1 = sc["t0"], sc["t1"]
    tk, ny = K.tiko, K.naya
    K.cam(t0, 2.0, cx=1100, cy=500, z=0.92)
    K.place(ny, t0, alpha=0.0)
    ny.key(t0, 0.6, alpha=0.0)
    tk.key(t0 + 0.4, 0.6, pose="present")
    for i, a in enumerate(K.small):
        K.walker(a, t0 + 0.5 + i * 2.2, -300 + i * 120, 2400, speed=160, face=1, alpha=0.8)
        K.walker(a, t0 + 18 + i * 2.6, -300, 2400, speed=170, face=1, alpha=0.8)
    loads = [("p1", "suitcase", 8, 50), ("p2", "softbag", 4, 12), ("p4", "lightbag", 4, 8), ("p3", "crate", -10, -18)]
    for i, (k, prop, dx, dy) in enumerate(loads):
        a = K.p[k]
        tt = t0 + 1.5 + i * 7.5
        pa = K.prop(prop, 0, 0, layer=5, s=0.8 if prop == "crate" else 1.0)
        K.place(pa, t0, alpha=0.0)
        wp = "walk_hold" if prop == "crate" else ("walk_hold1" if prop in ("softbag", "lightbag") else "walk_side")
        te = K.walker(a, tt, -200, 2150, speed=260, face=1, walk_pose=wp)
        K.hold(pa, a, tt, "hand_f", dx=dx, dy=dy, d=0.01)
        K.show(pa, tt + 0.02, 0.5)
        K.hide(pa, te - 0.5, 0.5)
    tm = K.w("B042", "число")
    K.label(tm - 0.2, tm + 4.6, "прохожие ≠ покупатели", 1100, 330, "label")
    K.headline(K.w("B042", "разместить") - 1.0, t1, "Подходящий момент и место", style="small")
    tk.key(K.w("B042", "разместить"), 0.6, pose="think")


def s30(K, sc):
    """To the pickup point: a quiet place with a low table; visitors try it themselves."""
    t0, t1 = sc["t0"], sc["t1"]
    tk = K.tiko
    c = K.carrier
    tq = K.w("B043", "точки")
    K.hold(c, tk, tq - 1.4, "hand_f", dx=10, dy=50, d=0.5)
    K.hide(K.dboxes, tq - 1.4, 0.5)
    tk.key(tq - 1.4, 0.5, pose="hold1")
    K.walk(tk, tq - 0.9, 1700, speed=140, walk_pose="walk_hold1", pose_after="hold1")
    K.cam(tq - 0.9, 3.4, cx=1500, cy=560, z=1.0)
    # linked camera travel along the station
    tm = tq + 2.8
    K.cut(tm, PICKUP_X + 150, 580, 1.0)
    K.place(tk, tm, x=PICKUP_X - 300, face=1, pose="walk_hold1")
    K.walk(tk, tm + 0.1, TABLE_X - 170, speed=140, walk_pose="walk_hold1", pose_after="hold1")
    for i, k in enumerate(("p1", "p2")):
        bx = K.prop("flatbox", PICKUP_X - 120 + i * 60, GROUND - 250, layer=3)
        K.place(bx, t0, alpha=0.0)
        K.show(bx, tm, 0.4)
        K.hide(bx, K.E("B043") + 1.0)
    K.label(K.w("B043", "собирали") - 0.4, K.w("B043", "собирали") + 3.4, "здесь груз только собирают", PICKUP_X,
            420, "small")
    td = K.w("B043", "договорился")
    K.release(c, td, *CARR_C, d=0.6)
    tk.key(td, 0.6, pose="calm")
    card = K.prop("card_small", TABLE_X + 140, TABLEC_TOP - 48, s=0.75, layer=5)
    K.place(card, t0, alpha=0.0)
    K.show(card, td + 0.6, 0.6)
    K.cardC = card
    K.label(td + 0.6, K.T.scene["S44"]["t0"] - 0.2, "две коробки • одной рукой\n16 • до 2 кг", TABLE_X + 140, TABLEC_TOP - 48, "note",
            size=15)
    K.cam(td - 0.4, 2.0, cx=TABLE_X - 40, cy=620, z=1.25)
    K.headline(K.w("B043", "момент") - 0.4, K.w("B043", "задачей") + 2.0, "Рядом с задачей")
    # B044: one short phrase; refusal → left alone; agreement → tries herself
    v = K.p["p4"]
    vb = K.prop("boxpair", 0, 0, layer=6)
    t44 = K.S("B044")
    K.place(v, t0, x=TABLE_X + 420, face=-1, alpha=0.0, pose="hold")
    K.place(vb, t0, alpha=0.0)
    K.hold(vb, v, t0, "hand_f", dx=14, dy=-20, d=0.01)
    v.key(t44 - 0.6, 0.6, alpha=1.0)
    K.show(vb, t44 - 0.6, 0.6)
    K.walk(v, t44 - 0.6, TABLE_X + 170, speed=190, walk_pose="walk_hold", pose_after="hold")
    tc = K.w("B044", "фразу")
    tk.key(tc - 0.5, 0.5, pose="present")
    ta = K.w("B044", "попробовать")
    K.release(vb, ta - 0.6, CARR_C[0], CARR_C[1] + 6, d=0.6)
    v.key(ta - 0.6, 0.6, pose="lift")
    K.hold(c, v, ta + 0.4, "hand_f", dx=-20, dy=58, d=0.5)
    K.hold(vb, v, ta + 0.4, "hand_f", dx=-20, dy=64, d=0.5)
    v.key(ta + 0.4, 0.6, pose="hold", fa1=40, fa2=20)
    tk.key(K.w("B044", "держит"), 0.6, pose="palms")
    K.headline(K.w("B044", "продавец") - 0.4, t1, "Кто делает работу — вещь или продавец?", style="small")
    tr = K.w("B044", "удачной")
    K.release(c, tr - 1.6, *CARR_C, d=0.6)
    K.hold(vb, v, tr - 1.6, "hand_f", dx=14, dy=-20, d=0.6)
    v.key(tr - 1.6, 0.6, pose="hold")
    K.walk(v, tr - 0.6, TABLE_X + 700, speed=200, walk_pose="walk_hold")
    v.key(tr + 2.0, 0.5, alpha=0.0)
    K.hide(vb, tr + 2.0, 0.5)


def film_end(K):
    return 1800.0


def s31(K, sc):
    """Three different refusals, two wishes; reasons are not merged into one column 'too expensive'."""
    t0, t1 = sc["t0"], sc["t1"]
    tk = K.tiko
    K.cam(t0, 1.2, cx=TABLE_X + 60, cy=560, z=1.05)
    refusals = [("сложенный", "сложенный размер"), ("редко", "переносит редко"), ("дождя", "нужна защита от дождя")]
    vis = ["p1", "p2", "p3"]
    for i, ((wd, lab), k) in enumerate(zip(refusals, vis)):
        tw = K.w("B045", wd)
        a = K.p[k]
        K.place(a, t0, x=TABLE_X + 520, face=-1, alpha=0.0, pose="stand")
        a.key(tw - 2.4, 0.4, alpha=1.0)
        K.walk(a, tw - 2.4, TABLE_X + 200, speed=260)
        a.key(tw - 0.2, 0.5, pose="palms")
        K.walk(a, tw + 1.4, TABLE_X + 650, speed=260)
        a.key(tw + 3.0, 0.4, alpha=0.0)
        n = K.prop("note", TABLE_X - 420 + i * 240, 380, layer=5, s=1.2)
        K.place(n, t0, alpha=0.0)
        K.show(n, tw + 0.4, 0.5)
        K.hide(n, K.E("B046") - 0.4)
        K.label(tw + 0.5, K.E("B046") - 0.4, lab, TABLE_X - 420 + i * 240, 450 + 26 * (i % 2), "note", size=19)
    tk.key(K.w("B045", "записывал") - 0.3, 0.6, pose="write")
    K.headline(K.w("B045", "дорого") - 0.8, K.w("B045", "дорого") + 2.6, "не одно общее «всем дорого»", style="small")
    K.headline(K.w("B045", "повторяется") - 0.6, K.E("B045") + 0.4, "Причина отказа")
    for i, (wd, lab, why) in enumerate((("красной", "красный цвет?", "предпочтение"),
                                         ("ремень", "ремень длиннее?", "рост и способ захвата"))):
        tw = K.w("B046", wd)
        K.label(tw - 0.2, K.E("B046") - 0.4, lab, TABLE_X + 300, 520 + i * 60, "small", size=26)
        tw2 = K.w("B046", why.split()[0])
        K.label(tw2 - 0.2, K.E("B046") - 0.4, "→ " + why, TABLE_X + 560, 520 + i * 60, "note", size=22)
    K.headline(K.w("B046", "применение") - 0.6, t1, "Ответ подсказывает применение, а не громкость", y=1000,
               style="small")
    tk.key(K.w("B046", "спрашивал"), 0.6, pose="tilt")


def s32(K, sc):
    """Naya passes the door with one free hand; returns; 'I'll take it.' The first order, quietly."""
    t0, t1 = sc["t0"], sc["t1"]
    tk, ny = K.tiko, K.naya
    c2 = K.prop("carrier_v2", 0, 0, layer=6, smax=1.4)
    b2 = K.prop("boxpair", 0, 0, layer=6)
    K.cut(t0 + 0.3, DOOR_X - 60, 600, 1.2)
    K.place(ny, t0 + 0.3, x=DOOR_X - 520, face=1, alpha=1.0, pose="hold1")
    for a in (c2, b2):
        K.place(a, t0 + 0.3, alpha=1.0)
    K.hold(c2, ny, t0 + 0.3, "hand_f", dx=8, dy=56, d=0.01)
    K.hold(b2, ny, t0 + 0.3, "hand_f", dx=8, dy=62, d=0.01)
    tr = K.walk(ny, t0 + 0.5, DOOR_X - 140, speed=180, walk_pose="walk_hold1", pose_after="hold1")
    to = K.w("B047", "дверь")
    ny.key(to - 0.8, 0.6, ba1=88, ba2=4)
    K.door.key(to - 0.4, 0.6, shape="door_open")
    K.sfx(to - 0.4, "creak", 0.5)
    K.headline(K.w("B047", "ровными") - 0.4, K.w("B047", "рукой") + 2.0, "Коробки ровно • одна рука свободна",
               style="small")
    K.walk(ny, to + 0.4, DOOR_X + 300, speed=180, walk_pose="walk_hold1", pose_after="hold1")
    K.door.key(to + 3.0, 0.8, shape="door")
    tcord = K.w("B047", "Шнур")
    cord = K.prop("cord_loose", DOOR_X + 360, 520, s=0.8, layer=6)
    K.place(cord, t0, alpha=0.0)
    K.show(cord, tcord - 0.2, 0.5, alpha=0.8)
    K.label(tcord, tcord + 4.0, "шнуру остаются свои задачи", DOOR_X + 360, 450, "note")
    K.hide(cord, tcord + 4.0)
    # back at the pickup table: the first order
    t48 = K.S("B048")
    K.cut(t48 - 0.4, TABLE_X + 40, 620, 1.3)
    K.place(ny, t48 - 0.4, x=TABLE_X + 190, face=-1, pose="hold1")
    K.place(tk, t48 - 0.4, x=TABLE_X - 170, face=1, pose="calm", alpha=1.0)
    tv = K.w("B048", "Возьму")
    K.label(tv - 0.2, tv + 2.8, "«Возьму»", TABLE_X + 190, 380, "label")
    K.headline(K.w("B048", "согласие") - 0.3, K.w("B048", "музыки") + 1.0, "Первый заказ")
    tc = K.w("B048", "цену")
    tk.key(tc - 0.4, 0.5, pose="present")
    tp = K.w("B048", "передал")
    K.carrier.key(tp - 0.4, 0.01, att=0.0)
    K.hold(K.carrier, tk, tp - 0.4, "hand_f", dx=10, dy=40, d=0.6)
    tk.key(tp - 0.4, 0.6, pose="reach")
    K.hold(K.carrier, ny, tp + 0.9, "hand_b", dx=8, dy=50, d=0.6)
    ny.key(tp + 0.5, 0.6, ba1=40, ba2=10)
    tz = K.w("B048", "Записал")
    order = K.prop("check", TABLE_X + 140, TABLEC_TOP - 110, s=0.7, layer=7)
    K.place(order, t0, alpha=0.0)
    K.show(order, tz, 0.5)
    K.orders = [order]
    K.label(tz + 0.2, K.S("B049") + 0.5, "заказ 1", TABLE_X + 140, TABLEC_TOP - 150, "small")
    K.sfx(tz, "tick", 0.7)
    tk.key(tz, 0.6, pose="write")
    tk.key(K.w("B048", "понимание"), 0.6, pose="calm")
    K.walk(ny, t1 - 3.0, TABLE_X + 900, speed=200, walk_pose="walk_hold1")
    ny.key(t1 - 0.6, 0.5, alpha=0.0)
    for a in (c2, b2, K.carrier):
        K.hide(a, t1 - 0.6, 0.5)
    K.carrier = c2


def s33(K, sc):
    """The second buyer tries his own boxes and checks the weight; then 12 / 5 / 2 as a calm table."""
    t0, t1 = sc["t0"], sc["t1"]
    tk = K.tiko
    v = K.p["p3"]
    c3 = K.prop("carrier_v2", CARR_C[0], CARR_C[1], layer=5, smax=1.4)
    vb = K.prop("boxpair", 0, 0, layer=6)
    K.cam(t0, 1.0, cx=TABLE_X + 60, cy=620, z=1.2)
    K.place(c3, t0, alpha=0.0)
    K.show(c3, t0 + 0.2, 0.6)
    K.place(v, t0, x=TABLE_X + 520, face=-1, alpha=0.0, pose="hold")
    K.place(vb, t0, alpha=0.0)
    K.hold(vb, v, t0, "hand_f", dx=14, dy=-20, d=0.01)
    tw = K.w("B049", "Второй")
    v.key(tw - 2.4, 0.4, alpha=1.0)
    K.show(vb, tw - 2.4, 0.4)
    K.walk(v, tw - 2.4, TABLE_X + 190, speed=220, walk_pose="walk_hold", pose_after="hold")
    tl = K.w("B049", "поднял")
    K.walk(v, tl, TABLE_X + 480, speed=140, walk_pose="walk_hold", pose_after="hold")
    tv = K.w("B049", "сверил")
    K.walk(v, tv - 0.8, TABLE_X + 190, speed=160, walk_pose="walk_hold", pose_after="hold")
    v.key(tv + 0.2, 0.5, head=16)
    K.label(tv, tv + 2.6, "до 2 кг ✓", TABLE_X + 140, TABLEC_TOP - 160, "small")
    tg = K.w("B049", "передал")
    K.hold(c3, tk, tg - 0.6, "hand_f", dx=10, dy=40, d=0.6)
    tk.key(tg - 0.6, 0.6, pose="reach")
    K.hold(c3, v, tg + 0.8, "hand_b", dx=8, dy=50, d=0.6)
    o2 = K.prop("check", TABLE_X + 190, TABLEC_TOP - 110, s=0.7, layer=7)
    K.place(o2, t0, alpha=0.0)
    K.show(o2, tg + 1.0, 0.5)
    K.orders.append(o2)
    K.sfx(tg + 1.0, "tick", 0.7)
    K.label(tg + 1.0, tg + 4.0, "заказ 2 — проверенный экземпляр", TABLE_X + 160, TABLEC_TOP - 150, "small")
    K.walk(v, tg + 2.4, TABLE_X + 900, speed=210, walk_pose="walk_hold")
    v.key(tg + 4.6, 0.5, alpha=0.0)
    for a in (vb, c3):
        K.hide(a, tg + 4.6, 0.5)
    # calm table
    tt = K.w("B049", "числа")
    K.board(tt - 1.2, t1 - 0.3, back=(TABLE_X + 40, 600, 1.15))
    rows = [("dots12", "12 разговоров", 330, "двенадцатью"), ("dots5", "5 проб", 470, "Пятеро"),
            ("dots2", "2 покупки", 610, "Двое")]
    for name, lab, y, wd in rows:
        d = K.prop(name, BOARD_X - 120, y, layer=4, smax=1.0)
        K.place(d, t0, alpha=0.0)
        K.show(d, tt - 0.6, 0.6)
        K.hide(d, t1 - 0.45, 0.3)
        K.label(tt - 0.4, t1 - 0.45, lab, BOARD_X + 380, y, "label", align="left")
    K.headline(tt - 0.6, t1 - 0.45, "один вымышленный день на нашей станции", y=110, style="small")
    tc = K.w("B049", "шестой")
    K.label(tc - 1.4, t1 - 0.45, "не прогноз: «купит каждый шестой»", BOARD_X, 760, "small")
    st = K.prop("strike", BOARD_X, 762, s=1.0, layer=6)
    K.place(st, t0, alpha=0.0, level=0.0)
    K.show(st, tc, 0.2)
    st.key(tc, 0.6, level=1.0)
    K.hide(st, t1 - 0.45, 0.3)
    K.label(K.w("B049", "надеется") - 1.6, t1 - 0.45, "случилось  ≠  надеется", BOARD_X, 920, "label")


def s34(K, sc):
    """'I'll drop by later' goes to a separate note; revenue 32, direct costs 24, difference 8."""
    t0, t1 = sc["t0"], sc["t1"]
    K.board(t0 + 0.3, t1 - 0.3, back=(TABLE_X + 40, 600, 1.15))
    cols = [("оплачено", BOARD_X - 420, (0.1, 0.62, 0.4)), ("проба", BOARD_X, (0.1, 0.6, 0.6)),
            ("«загляну потом»", BOARD_X + 420, (0.6, 0.5, 0.9))]
    tend = K.S("B051") - 0.2
    for i, (lab, x, col) in enumerate(cols):
        K.label(t0 + 1.0 + i * 0.4, tend, lab, x, 300, "label")
        sh = K.prop("card_small", x, 470, s=1.2, layer=3, tint=(col[0], col[1], col[2], 0.9))
        K.place(sh, t0, alpha=0.0)
        K.show(sh, t0 + 1.0 + i * 0.4, 0.5)
        K.hide(sh, tend, 0.3)
    K.label(t0 + 1.6, tend, "2", BOARD_X - 420, 470, "num", size=60)
    K.label(t0 + 1.9, tend, "5", BOARD_X, 470, "num", size=60)
    tl = K.w("B050", "загляну")
    K.label(tl + 0.3, tend, "1", BOARD_X + 420, 470, "num", size=60)
    K.headline(K.w("B050", "отдельную") - 0.3, tend, "Отдельная заметка, не третья покупка", y=700, style="small")
    K.label(K.w("B050", "красивая") - 0.4, tend, "смешать всё → красивая, но неудобная цифра", BOARD_X, 800, "small")
    # B051 numbers
    X0 = BOARD_X - 520
    tr = K.w("B051", "выручки")
    D = 28.0
    xe, _ = bars(K, t0, [(16, (1.0, 0.70, 0.30), "16", tr - 1.6), (16, (1.0, 0.70, 0.30), "16", tr - 0.9)],
                 X0, 330, t1, h=1.2, u=D)
    K.label(tr - 0.2, t1 - 0.45, "выручка 32", xe + 120, 330, "label")
    K.headline(tr - 2.0, t1 - 0.45, "Условный расчёт за день", y=110, style="small")
    tz = K.w("B051", "двадцать")
    xe2, _ = bars(K, t0, [(24, (0.45, 0.48, 0.95), "прямые затраты 24", tz - 0.2)], X0, 450, t1, h=1.2, u=D)
    td = K.w("B051", "восемь")
    xe3, _ = bars(K, t0, [(8, (0.10, 0.70, 0.55), "8", td - 0.2)], X0 + 24 * D + 6, 570, t1, h=1.2, u=D)
    K.label(td + 0.2, t1 - 0.45, "разница 8 — до остальных расходов", BOARD_X + 120, 650, "label")
    K.headline(K.w("B051", "заработку") - 0.8, t1 - 0.45, "Не чистая прибыль", y=980, style="label")
    K.label(K.w("B051", "задачу") - 0.4, t1 - 0.45, "задача • предмет • объяснение • цена • место", BOARD_X, 860, "small")


def s35(K, sc):
    """Product, text and place changed together: no single winner. Known vs still unknown."""
    t0, t1 = sc["t0"], sc["t1"]
    tk = K.tiko
    K.cam(t0, 1.0, cx=TABLE_X + 40, cy=560, z=1.0)
    objs = [("carrier_v2", "продукт", "переделал"), ("card_small", "текст", "говорить"), ("lowtable", "место", "перенёс")]
    for i, (name, lab, wd) in enumerate(objs):
        x = TABLE_X - 360 + i * 360
        o = K.prop(name, x, 400, s=0.6 if name != "card_small" else 0.8, layer=5, smax=1.0)
        K.place(o, t0, alpha=0.0)
        tw = K.w("B052", wd)
        K.show(o, tw - 0.3, 0.6)
        K.hide(o, K.E("B052") + 0.6)
        K.label(tw, K.E("B052") + 0.6, lab, x, 490, "small")
    K.label(K.w("B052", "покупателей") - 0.3, K.E("B052") + 0.6, "покупатели", TABLE_X - 720, 490, "small")
    K.headline(K.w("B052", "сочетание") - 0.6, K.E("B052") + 0.6, "Ни один фактор не назначен победителем", style="small")
    K.label(K.w("B052", "научное") - 1.2, K.E("B052") + 0.6, "история пути ≠ научное исследование", TABLE_X + 40, 990,
            "note")
    # B053: known well / still unknown
    t53 = K.S("B053")
    K.board(t53 - 0.5, t1 - 0.2, back=(TABLE_X - 20, 640, 1.4))
    known = [("трудностью", "у Наи — конкретная трудность"), ("устранил", "первый вариант не помог"),
             ("Исправленный", "исправленный помог в показанном сценарии"),
             ("заплатить", "двое заплатили обозначенную цену")]
    unknown = [("часто", "как часто это нужно другим"), ("долгом", "долгое использование"),
               ("качеством", "те же качество и затраты")]
    K.label(t53 + 0.2, t1 - 0.4, "известно", BOARD_X - 420, 300, "label")
    for i, (wd, lab) in enumerate(known):
        tw = K.w("B053", wd)
        K.label(tw - 0.2, t1 - 0.4, "✓ " + lab, BOARD_X - 860, 380 + i * 56, "small", align="left", size=28)
    tu = K.w("B053", "неизвестным")
    K.label(tu - 0.2, t1 - 0.4, "пока неизвестно", BOARD_X + 470, 300, "label")
    for i, (wd, lab) in enumerate(unknown):
        tw = K.w("B053", wd)
        K.label(tw - 0.2, t1 - 0.4, "? " + lab, BOARD_X + 200, 380 + i * 56, "small", align="left", size=28)
    K.headline(tu - 0.4, t1 - 0.3, "Не прогноз на завтра", y=900, style="label")
    tk.key(K.w("B053", "узнал"), 0.6, pose="think")


def s36(K, sc):
    """One next case in the centre; other questions put aside; the next experiment is small."""
    t0, t1 = sc["t0"], sc["t1"]
    tk = K.tiko
    K.cam(t0, 1.4, cx=TABLE_X - 20, cy=640, z=1.4)
    tk.key(t0 + 0.2, 0.6, pose="calm")
    K.headline(K.w("B054", "защищал") - 0.6, K.w("B054", "вывода") + 2.0, "Список неизвестного защищает от большого вывода",
               style="small")
    q_old = K.w("B054", "нужно")
    K.label(q_old - 0.3, q_old + 3.2, "«нужно ли это всем»", TABLE_X - 20, 380, "small")
    st = K.prop("strike", TABLE_X - 20, 382, s=0.55, layer=7)
    K.place(st, t0, alpha=0.0, level=0.0)
    K.show(st, q_old + 1.2, 0.2)
    st.key(q_old + 1.2, 0.6, level=1.0)
    K.hide(st, q_old + 3.2, 0.4)
    tq = K.w("B054", "кто")
    K.label(tq - 0.2, K.E("B054") + 2.0, "«кто ещё переносит такие же коробки\nи чем ему неудобен нынешний способ»",
            TABLE_X - 20, 400, "small", size=28)
    piles = []
    for i in range(4):
        n = K.prop("note", TABLE_X - 300 + i * 18, TABLEC_TOP - 14 - i * 5, s=0.7, layer=5)
        K.place(n, t0, alpha=0.0)
        K.show(n, K.S("B055") + 0.2 + i * 0.3, 0.4)
        piles.append(n)
    K.label(K.S("B055") + 1.0, t1 - 0.4, "другие вопросы — отдельно", TABLE_X - 270, TABLEC_TOP - 110, "note", size=22)
    nxt = K.prop("card_small", TABLE_X + 10, TABLEC_TOP - 40, s=0.6, layer=6, tint=(0.4, 1.0, 0.85, 0.5))
    K.place(nxt, t0, alpha=0.0)
    tz = K.w("B055", "завтра")
    tk.key(tz - 0.6, 0.6, pose="reach")
    K.show(nxt, tz, 0.6)
    K.label(tz + 0.2, t1 - 0.4, "следующий случай", TABLE_X + 10, TABLEC_TOP - 120, "small", size=24)
    K.headline(K.w("B055", "Маленький") - 0.4, t1, "Следующий опыт — маленький", style="label")
    for n in piles + [nxt]:
        K.hide(n, t1 - 0.4)
    tk.key(K.w("B055", "пересмотреть"), 0.6, pose="nod")


SCENES = {"S25": s25, "S26": s26, "S27": s27, "S28": s28, "S29": s29, "S30": s30, "S31": s31, "S32": s32,
          "S33": s33, "S34": s34, "S35": s35, "S36": s36}
