"""A04–A06: what to keep, what a person understands in seconds, a clear text reveals a bad test (S12–S24)."""
from kit import (BOARD_X, BOX_X, BOX_Y, COUNTER_TOP, DOOR_X, GROUND, SIGN_Y, STALL_X, TABLEA_X)

TRAY = (STALL_X + 130, COUNTER_TOP - 22)
TABLE_TOP = GROUND - 60 - 20          # top surface of the low table
CARR_ON_TABLE = (TABLEA_X, TABLE_TOP - 50)


def boxes_on(carrier_xy):
    return carrier_xy[0], carrier_xy[1] + 6


def s12(K, sc):
    """Two sheets seen from above: what the box can do / what Naya is trying to do."""
    t0, t1 = sc["t0"], sc["t1"]
    tk = K.tiko
    K.cut(t0 + 0.3, 900, 620, 1.35)
    K.place(tk, t0 + 0.3, x=590, face=1, alpha=1.0, pose="write")
    K.place(K.naya, t0 + 0.3, alpha=0.0)
    tb = t0 + 3.0
    K.board(tb, t1 - 0.2, back=(1000, 560, 1.0))
    L, R = BOARD_X - 330, BOARD_X + 330
    sh1 = K.prop("sheet", L, 560, s=1.9, layer=2, smax=2.0, tint=(0.62, 0.66, 1.0, 0.85))
    sh2 = K.prop("sheet", R, 560, s=1.9, layer=2, smax=2.0, tint=(0.45, 0.95, 0.85, 0.85))
    for a in (sh1, sh2):
        K.place(a, t0, alpha=0.0)
        K.show(a, tb + 0.3, 0.8, alpha=0.35)
        K.hide(a, t1 - 0.4, 0.3)
    K.label(tb + 0.4, t1 - 0.4, "что умеет короб", L, 290, "label")
    feats = ["ручка", "экран", "флажок", "отделения", "инструкция"]
    t_first = K.w("B016", "первом")
    for i, f in enumerate(feats):
        K.label(t_first + 0.3 + i * 0.5, t1 - 0.4, f, L, 380 + i * 52, "small")
    K.label(K.w("B016", "втором") - 0.3, t1 - 0.4, "чего добивается Ная", R, 290, "label")
    acts = ["две коробки ровно", "одна рука свободна", "пройти дверь"]
    for i, f in enumerate(acts):
        K.label(K.w("B016", "Ная") + 0.3 + i * 0.6, t1 - 0.4, f, R, 380 + i * 52, "small")
    K.headline(K.w("B016", "совпадали") - 0.2, K.w("B016", "совпадали") + 3.0, "почти не совпадают", y=1000,
               style="small")
    tx = K.w("B016", "расширять")
    for i in range(3):
        K.label(tx + 0.3 + i * 0.45, t1 - 0.4, "+ ещё…", L, 640 + i * 46, "note")
    sh1.key(tx, 1.6, sy=1.35, y=640)
    ts = K.w("B016", "отдельную")
    sh2.key(ts - 0.2, 0.8, bright=1.5, alpha=0.75)
    K.headline(K.w("B016", "решение") - 0.4, t1 - 0.3, "Что человек хочет сделать?")
    K.sfx(tb + 0.4, "paper", 0.7)


def s13(K, sc):
    """Screen and flag come off and go into a separate tray: put aside, not destroyed."""
    t0, t1 = sc["t0"], sc["t1"]
    tk = K.tiko
    K.cam(t0, 1.4, cx=820, cy=640, z=1.6)
    K.unibox.key(t0, 0.01, x=BOX_X, s=1.0)
    for a, y in ((K.uscreen, BOX_Y - 92), (K.uflag, BOX_Y - 70), (K.uhandle, BOX_Y - 62)):
        K.place(a, t0, y=y)
        K.show(a, t0 + 0.1, 0.6)
    K.place(K.udrawer1, t0, x=BOX_X + 34)
    K.show(K.udrawer1, t0 + 0.1, 0.6)
    K.place(K.tray, t0, x=TRAY[0], y=TRAY[1], alpha=0.0)
    K.show(K.tray, t0 + 0.5, 0.8)
    tf = K.w("B017", "флажок")
    tk.key(tf - 0.6, 0.6, pose="reach")
    K.uflag.key(tf, 1.2, x=TRAY[0] - 40, y=TRAY[1] - 22, s=0.7, rot=-80)
    K.sfx(tf + 1.1, "drop", 0.5)
    te = K.w("B017", "экран")
    K.uscreen.key(te, 1.2, x=TRAY[0] + 30, y=TRAY[1] - 30, s=0.6, rot=0)
    K.sfx(te + 1.1, "drop", 0.5)
    tw = K.w("B017", "желание")
    tk.key(tw - 0.3, 0.5, pose="think")
    K.uscreen.key(tw, 0.6, y=TRAY[1] - 44)          # almost goes back
    K.uscreen.key(tw + 1.0, 0.6, y=TRAY[1] - 30)
    K.uhandle.key(K.w("B017", "сделал"), 1.2, x=TRAY[0] - 10, y=TRAY[1] - 16, s=0.6)
    K.udrawer1.key(K.w("B017", "сделал") + 0.8, 1.2, x=TRAY[0] + 70, y=TRAY[1] - 10, s=0.55)
    tp = K.w("B017", "прошлого")
    K.flow(28, tp - 0.4, tp + 1.4, (TRAY[0], TRAY[1] - 20), (TRAY[0], TRAY[1] - 40), travel=0.9, stay=True,
           fade_at=t1 - 0.5, seed=41, color=(1.0, 0.78, 0.4), size=0.6, arc=-30, src_spread=30)
    K.label(tp, t1 - 0.4, "прошлый труд остаётся", TRAY[0], TRAY[1] - 120, "small")
    K.headline(K.w("B017", "обязательство") - 0.3, t1 - 0.2, "Можно отложить")
    tk.key(K.w("B017", "обязательство"), 0.6, pose="calm")


def s14(K, sc):
    """Base, strap and mounts become a carrier; it is recognised first, then it moves."""
    t0, t1 = sc["t0"], sc["t1"]
    tk = K.tiko
    K.carrier = K.unibox                      # the same particles: the box becomes the carrier
    c = K.carrier
    K.cam(t0, 1.2, cx=840, cy=640, z=1.5)
    to = K.w("B018", "Остались")
    c.key(to - 0.4, 1.6, shape="carrier_parts", y=COUNTER_TOP - 55, x=BOX_X + 10)
    K.sfx(to, "morph", 0.7)
    tk.key(to, 0.6, pose="work")
    dbox = K.prop("boxpair", BOX_X + 190, COUNTER_TOP - 36, layer=4)
    K.dboxes = dbox
    K.place(dbox, t0, alpha=0.0)
    tf = K.w("B018", "сложенном")
    K.show(dbox, tf - 1.0, 0.8, alpha=0.9)
    c.key(tf - 0.3, 1.4, shape="carrier_folded", x=BOX_X + 30, y=COUNTER_TOP - 10)
    tr = K.w("B018", "раскрытом")
    c.key(tr - 0.3, 1.4, shape="carrier", x=BOX_X + 60, y=COUNTER_TOP - 50)
    dbox.key(tr + 0.6, 1.0, x=BOX_X + 60, y=COUNTER_TOP - 44)
    K.sfx(tr, "fixed", 0.6)
    tn = K.w("B018", "переноской")
    K.label(tn - 0.3, tn + 4.0, "переноска", BOX_X + 60, COUNTER_TOP - 190, "label")
    K.headline(K.w("B018", "простота") - 0.3, K.w("B018", "доказывала") + 1.6, "Простота ещё ничего не доказывает",
               style="small")
    tm = K.w("B018", "проверить")
    K.label(tm - 1.6, t1 - 0.3, "основная работа: не проверена", BOX_X + 60, COUNTER_TOP - 140, "note")
    tk.key(K.w("B018", "Плохую"), 0.6, pose="think")
    # it moves: lifted a little by the strap
    c.key(tm - 2.0, 0.8, y=COUNTER_TOP - 70)
    dbox.key(tm - 2.0, 0.8, y=COUNTER_TOP - 64)
    c.key(tm - 0.8, 0.8, y=COUNTER_TOP - 50)
    dbox.key(tm - 0.8, 0.8, y=COUNTER_TOP - 44)


def s15(K, sc):
    """A small scenario: two closed boxes up to two kilograms; a heavy crate and a soft bag pass by."""
    t0, t1 = sc["t0"], sc["t1"]
    tk = K.tiko
    K.cam(t0, 1.4, cx=1000, cy=600, z=1.2)
    tw = K.w("B019", "килограммов")
    K.label(tw - 0.4, K.E("B019") + 1.0, "2 коробки • до 2 кг", BOX_X + 60, COUNTER_TOP - 200, "label")
    K.sfx(tw, "tick", 0.6)
    K.headline(K.w("B019", "ограничивали") - 0.4, K.w("B019", "ограничивали") + 3.4, "Условия ограничивают обещание",
               style="small")
    crate = K.prop("crate", 1450, GROUND - 70, layer=3, tint=(0.6, 0.6, 0.9, 0.3))
    K.place(crate, t0, alpha=0.0)
    th = K.w("B019", "тяжёлый")
    K.show(crate, th - 0.3, 0.6, alpha=0.5)
    K.label(th, th + 3.0, "другая проверка", 1450, GROUND - 190, "note")
    K.hide(crate, th + 3.2)
    td = K.w("B019", "дождь")
    rain = K.flow(60, td - 0.2, td + 2.2, (1720, 380), (1720, 820), travel=0.8, stay=False, vanish_at_dst=True, seed=51,
                  color=(0.55, 0.7, 1.0), size=0.6, arc=0, src_spread=60)
    K.label(td + 0.2, td + 3.0, "другое решение", 1720, 340, "note")
    tk.key(K.w("B019", "облегчение"), 0.8, pose="calm")
    # B020: an elderly woman with a soft bag — he almost calls out, and stops
    el = K.p["elder"]
    bag = K.prop("softbag", 0, 0, layer=5)
    te = K.w("B020", "пожилая")
    K.place(el, t0, x=1950, face=-1, alpha=0.0, pose="hold1")
    el.key(te - 1.0, 0.5, alpha=1.0)
    K.place(bag, t0, alpha=0.0)
    K.hold(bag, el, t0, "hand_f", dx=4, dy=12, d=0.01)
    K.show(bag, te - 1.0, 0.5)
    K.walk(el, te - 1.0, -250, speed=120, walk_pose="walk_hold1")
    to = K.w("B020", "окликнул")
    tk.key(to - 0.4, 0.4, pose="reach")
    tk.key(K.w("B020", "остановился") - 0.1, 0.5, pose="reach_stop")
    tk.key(K.w("B020", "остановился") + 0.8, 0.8, pose="calm")
    el.key(K.E("B020") - 1.0, 0.8, alpha=0.0)
    K.hide(bag, K.E("B020") - 1.0, 0.8)
    K.headline(K.w("B020", "уважение") - 0.3, K.w("B020", "продажи") + 2.4, "Уважение может выглядеть как отсутствие продажи",
               style="small")


def s16(K, sc):
    """One path through the door; the question 'for everyone' is struck through."""
    t0, t1 = sc["t0"], sc["t1"]
    K.board(t0 + 0.6, t1 - 0.2, back=(1000, 560, 1.0))
    route = K.prop("route", BOARD_X, 420, s=1.2, layer=3, smax=1.3)
    K.place(route, t0, alpha=0.0, level=0.0)
    K.show(route, t0 + 1.0, 0.4)
    route.key(t0 + 1.2, 3.0, level=1.0)
    K.label(t0 + 1.4, t1 - 0.4, "прилавок", BOARD_X - 520, 470, "small")
    K.label(t0 + 2.4, t1 - 0.4, "дверь", BOARD_X + 60, 300, "small")
    K.headline(K.w("B021", "различить") - 0.4, K.w("B021", "результат") + 2.6, "Узкая задача — место, где виден результат",
               style="small")
    q1 = K.w("B022", "Почему")
    K.label(q1 - 0.3, t1 - 0.4, "«Почему никто не покупает мою замечательную вещь?»", BOARD_X, 640, "small")
    strike = K.prop("strike", BOARD_X, 642, s=1.5, layer=6, smax=1.6)
    K.place(strike, t0, alpha=0.0, level=0.0)
    tq2 = K.w("B022", "Сможет")
    K.show(strike, tq2 - 0.6, 0.3)
    strike.key(tq2 - 0.5, 0.8, level=1.0)
    K.label(tq2 - 0.1, t1 - 0.4, "«Сможет ли Ная пройти с двумя коробками,", BOARD_X, 740, "label")
    K.label(tq2 + 0.6, t1 - 0.4, "не перехватывая их у двери?»", BOARD_X, 800, "label")
    K.headline(K.w("B022", "величественно") - 0.3, t1 - 0.3, "Что проверяем?")
    for a in (route, strike):
        K.hide(a, t1 - 0.45, 0.3)


def s17(K, sc):
    """The general sign goes out; the same board gets object, situation and next action."""
    t0, t1 = sc["t0"], sc["t1"]
    tk, ny = K.tiko, K.naya
    K.cam(t0, 0.01, cx=1000, cy=560, z=1.0)
    K.place(K.carrier, t0, x=BOX_X + 60, y=COUNTER_TOP - 50, alpha=1.0, shape="carrier", att=0.0)
    K.place(K.dboxes, t0, x=BOX_X + 60, y=COUNTER_TOP - 44, alpha=0.9, att=0.0)
    for a in (K.uscreen, K.uflag, K.uhandle, K.udrawer1, K.tray):
        a.key(t0, 0.01, alpha=1.0)
    tv = K.w("B023", "выключать")
    K.label(t0, tv + 0.4, "Новый уровень повседневных возможностей", STALL_X, SIGN_Y, "small", size=27)
    th = K.w("B023", "Современное")
    K.label(th - 0.2, K.S("B024") - 0.2, "Современное решение для удобной транспортировки", STALL_X, SIGN_Y, "small",
            size=25)
    K.sfx(tv + 0.3, "dim", 0.6)
    tk.key(tv, 0.6, pose="point_up")
    tn = K.w("B023", "Ная")
    K.place(ny, t0, x=1980, face=-1, alpha=0.0, pose="hold")
    ny.key(tn - 1.5, 0.5, alpha=1.0)
    K.place(K.nboxes, t0, alpha=0.0, att=0.0, rot=0)
    K.hold(K.nboxes, ny, t0, "hand_f", dx=14, dy=-20, d=0.01)
    K.show(K.nboxes, tn - 1.5, 0.5)
    K.walk(ny, tn - 1.5, -250, speed=210, walk_pose="walk_hold")
    ny.key(tn + 7.0, 0.5, alpha=0.0)
    K.hide(K.nboxes, tn + 7.0, 0.5)
    K.headline(K.w("B023", "доволен") - 0.3, K.E("B023"), "Слова о продавце, а не о задаче", style="small")
    t24 = K.S("B024")
    K.label(t24 + 0.2, t1 + 400, "Две небольшие коробки — одной рукой", STALL_X, SIGN_Y - 12, "label", size=26)
    tl2 = K.w("B024", "Складная")
    K.label(tl2 - 0.2, t1 + 400, "Складная переноска. Можно попробовать здесь", STALL_X, SIGN_Y + 22, "note", size=19)
    K.sfx(t24 + 0.2, "lit", 0.6)
    tk.key(t24, 0.6, pose="write")
    tp = K.w("B024", "предмет")
    K.headline(tp - 0.2, tp + 3.6, "предмет • ситуация • действие", y=1000, style="small")
    tc = K.w("B024", "цены")
    tag = K.prop("price_tag", BOX_X + 236, COUNTER_TOP - 26, layer=5, s=1.0)
    K.dtag = tag
    K.place(tag, t0, alpha=0.0)
    K.show(tag, tc - 0.2, 0.6)
    K.label(tc - 0.1, t1 + 400, "16 • до 2 кг", BOX_X + 232, COUNTER_TOP - 26, "small", size=19, dark=True)
    K.headline(K.w("B024", "недоразумение") - 1.6, t1, "Коротко, но без потери условия", style="small")
    tk.key(K.w("B024", "загадкой"), 0.6, pose="calm")


def s18(K, sc):
    """Show the strap on the object; replace 'secure properly' with a small clear picture."""
    t0, t1 = sc["t0"], sc["t1"]
    tk = K.tiko
    K.cam(t0, 1.4, cx=BOX_X + 120, cy=640, z=1.55)
    ts = K.w("B025", "ремень")
    K.carrier.key(ts - 0.2, 0.5, bright=1.6)
    K.carrier.key(ts + 1.0, 0.8, bright=1.0)
    tk.key(ts - 0.4, 0.6, pose="point")
    tr = K.w("B025", "Убрал")
    for a in (K.uscreen, K.uflag, K.uhandle, K.udrawer1, K.tray):
        a.key(tr, 1.2, x=a.tr.at(tr)["x"] - 520, alpha=0.0)
    for k, word in enumerate(("самая", "подходит")):
        tw = K.w("B025", word)
        txt = "«самая удобная»" if k == 0 else "«подходит всем»"
        K.label(tw - 0.2, tw + 3.4, txt, BOX_X + 320, COUNTER_TOP - 250 + k * 56, "small")
        st = K.prop("strike", BOX_X + 320, COUNTER_TOP - 250 + k * 56, s=0.45, layer=7)
        K.place(st, t0, alpha=0.0, level=0.0)
        K.show(st, tw + 0.6, 0.2)
        st.key(tw + 0.6, 0.6, level=1.0)
        K.hide(st, tw + 3.4, 0.4)
    K.headline(K.w("B025", "честнее") - 0.3, K.E("B025") + 0.6, "Показать, что вещь делает в известных условиях",
               style="small")
    # B026: the instruction
    t26 = K.S("B026")
    card = K.prop("card", BOX_X + 360, COUNTER_TOP - 170, s=0.95, layer=5)
    K.place(card, t0, alpha=0.0)
    tq = K.w("B026", "Закрепите")
    K.show(card, tq - 0.6, 0.6)
    K.label(tq - 0.3, K.w("B026", "заменил") + 0.4, "«Закрепите груз\nнадлежащим образом»", BOX_X + 360,
            COUNTER_TOP - 170, "small", size=26)
    tz = K.w("B026", "изображением")
    mini = K.prop("carrier", BOX_X + 360, COUNTER_TOP - 172, s=0.45, layer=6, smax=0.6)
    minib = K.prop("boxpair", BOX_X + 360, COUNTER_TOP - 170, s=0.45, layer=6, smax=0.6)
    for a in (mini, minib):
        K.place(a, t0, alpha=0.0)
        K.show(a, tz - 0.3, 0.8)
    for x in (BOX_X + 360 - 24, BOX_X + 360 + 24):
        m = K.prop("check", x, COUNTER_TOP - 140, s=0.3, layer=7)
        K.place(m, t0, alpha=0.0)
        K.show(m, K.w("B026", "отмеченные") - 0.2, 0.4)
        K.hide(m, t1 - 0.6)
    K.label(K.w("B026", "отмеченные"), t1 - 0.6, "ремень — через отмеченные крепления", BOX_X + 360, COUNTER_TOP - 82,
            "note", size=22)
    tk.key(K.w("B026", "длиннее"), 0.6, pose="calm")
    K.headline(K.w("B026", "длиннее") - 0.6, t1, "Понятно, как использовать")
    K.mini = (card, mini, minib)


def s19(K, sc):
    """A man with a big crate reads, checks the weight and leaves calmly; Naya stops: 'Will you show me?'"""
    t0, t1 = sc["t0"], sc["t1"]
    tk, ny = K.tiko, K.naya
    card, mini, minib = K.mini
    K.cam(t0, 1.4, cx=1080, cy=580, z=1.1)
    m = K.p["p1"]
    crate = K.prop("crate", 0, 0, layer=5, s=0.8)
    tw = K.w("B027", "ящиком")
    K.place(m, t0, x=1980, face=-1, alpha=0.0, pose="hold")
    m.key(tw - 2.0, 0.5, alpha=1.0)
    K.place(crate, t0, alpha=0.0)
    K.hold(crate, m, t0, "hand_f", dx=-10, dy=-18, d=0.01)
    K.show(crate, tw - 2.0, 0.5)
    ta = K.walk(m, tw - 2.0, 1330, speed=220, walk_pose="walk_hold", pose_after="hold")
    tr = K.w("B027", "Прочитал")
    m.key(tr, 0.6, head=14)
    tv = K.w("B027", "вес")
    K.label(tv - 0.2, tv + 2.6, "до 2 кг", BOX_X + 226, COUNTER_TOP - 210, "label")
    m.key(tv + 0.6, 0.4, pose="nod")
    tu = K.w("B027", "ушёл")
    m.key(tu - 0.2, 0.4, pose="hold")
    K.walk(m, tu, 2100, speed=220, walk_pose="walk_hold")
    m.key(tu + 4.0, 0.5, alpha=0.0)
    K.hide(crate, tu + 4.0, 0.5)
    tk.key(K.w("B027", "разочарование"), 0.6, pose="tired")
    tk.key(K.w("B027", "полезное"), 0.6, pose="calm")
    K.headline(K.w("B027", "выбирать") - 0.4, K.E("B027") + 0.5, "Понятные слова помогают выбрать — и отказаться",
               style="small")
    # Naya stops
    t28 = K.S("B028")
    K.place(ny, t0, x=1980, face=-1, alpha=0.0, pose="hold")
    K.place(K.nboxes, t0, alpha=0.0, att=0.0, rot=0, x=0, y=0)
    K.hold(K.nboxes, ny, t0, "hand_f", dx=14, dy=-20, d=0.01)
    ny.key(t28 - 3.2, 0.5, alpha=1.0)
    K.show(K.nboxes, t28 - 3.2, 0.5)
    K.walk(ny, t28 - 3.2, 1600, speed=220, walk_pose="walk_hold", pose_after="hold")
    tq = K.w("B028", "Покажете")
    ny.key(tq - 0.2, 0.5, pose="tilt", fa1=46, fa2=52, ba1=40, ba2=56)
    K.headline(tq - 0.4, tq + 2.6, "Можно попробовать")
    K.label(tq - 0.2, tq + 2.4, "«Покажете?»", 1600, 400, "label")
    # the test table appears next to the stall; carrier goes onto it
    K.show(K.tableA, K.w("B028", "сработали") - 2.0, 1.0)
    tput = K.w("B028", "аккуратно")
    tk.key(tput - 2.6, 0.4, pose="hold")
    K.walk(tk, tput - 2.4, TABLEA_X - 190, speed=120, walk_pose="walk_hold", pose_after="hold")
    K.carrier.key(tput - 2.4, 1.8, x=CARR_ON_TABLE[0], y=CARR_ON_TABLE[1])
    K.dboxes.key(tput - 2.4, 1.0, alpha=0.0)
    for a in (card, mini, minib):
        K.hide(a, tput - 2.4, 0.8)
    K.release(K.nboxes, tput, *boxes_on(CARR_ON_TABLE), d=0.8)
    ny.key(tput, 0.6, pose="stand")
    K.sfx(tput + 0.8, "clunk", 0.5)
    K.cam(tput - 1.0, 2.0, cx=TABLEA_X, cy=640, z=1.4)
    tk.key(K.E("B028") - 0.8, 0.6, pose="present")


def s20(K, sc):
    """The moment the description stops and use begins: real weight, real direction of force."""
    t0, t1 = sc["t0"], sc["t1"]
    tk, ny = K.tiko, K.naya
    K.cam(t0, 2.0, cx=TABLEA_X + 40, cy=650, z=1.55)
    tw = K.w("B029", "вес")
    K.flow(30, tw - 0.4, tw + 1.6, (CARR_ON_TABLE[0], CARR_ON_TABLE[1] - 20), (CARR_ON_TABLE[0], CARR_ON_TABLE[1] + 40),
           travel=0.9, stay=False, vanish_at_dst=True, seed=61, color=(1.0, 0.8, 0.45), size=0.7, arc=0, src_spread=40)
    K.label(tw - 0.2, tw + 2.6, "настоящий вес", CARR_ON_TABLE[0] - 230, CARR_ON_TABLE[1] + 10, "note")
    td = K.w("B029", "направление")
    K.flow(30, td - 0.4, td + 1.6, (CARR_ON_TABLE[0], CARR_ON_TABLE[1] - 50), (CARR_ON_TABLE[0], CARR_ON_TABLE[1] - 180),
           travel=0.9, stay=False, vanish_at_dst=True, seed=62, color=(0.2, 0.95, 0.85), size=0.7, arc=0,
           src_spread=12)
    K.label(td - 0.2, td + 2.6, "усилие ремня", CARR_ON_TABLE[0] + 220, CARR_ON_TABLE[1] - 150, "note")
    K.headline(K.w("B029", "пустом") - 0.4, K.w("B029", "Тико") + 0.4, "Проверка", style="label")
    tk.key(K.w("B029", "улыбался") - 0.2, 0.6, pose="proud")
    tl = K.w("B029", "подняла")
    ny.key(tl - 1.2, 0.6, pose="lift", face=-1)
    K.place(ny, t0, x=CARR_ON_TABLE[0] + 170)
    K.hold(K.carrier, ny, tl - 0.6, "hand_f", dx=-20, dy=58, d=0.6)
    K.carrier.key(tl - 0.6, 0.01, x=CARR_ON_TABLE[0], y=CARR_ON_TABLE[1])
    ny.key(tl, 1.6, pose="hold", fa1=40, fa2=20)


def s21(K, sc):
    """A mount is offset: the base tilts; she puts it back on the table at once. Nothing falls."""
    t0, t1 = sc["t0"], sc["t1"]
    tk, ny = K.tiko, K.naya
    c, b = K.carrier, K.nboxes
    K.cam(t0, 1.2, cx=TABLEA_X + 40, cy=650, z=1.7)
    # boxes ride with the carrier: attach them to the same hand
    K.hold(b, ny, t0, "hand_f", dx=-20, dy=64, d=0.3)
    ttl = K.w("B030", "наклонилось")
    c.key(ttl - 1.4, 0.6, shape="carrier_bad")
    c.key(ttl - 0.4, 0.8, rot=-11)
    b.key(ttl - 0.4, 0.8, rot=-11, shape="boxpair_tilt")
    K.sfx(ttl - 0.2, "creak", 0.6)
    K.headline(ttl, ttl + 3.0, "Не готово")
    td = K.w("B030", "опустила")
    ny.key(td - 0.3, 0.6, pose="lift")
    K.release(c, td + 0.2, CARR_ON_TABLE[0], CARR_ON_TABLE[1], d=0.7, rot=0)
    K.release(b, td + 0.2, *boxes_on(CARR_ON_TABLE), d=0.7, rot=0)
    b.key(td + 1.0, 0.6, shape="boxpair")
    K.sfx(td + 0.9, "clunk", 0.5)
    K.label(K.w("B030", "упало") - 0.2, K.w("B030", "упало") + 2.6, "ничего не упало", CARR_ON_TABLE[0],
            CARR_ON_TABLE[1] - 170, "note")
    tk.key(K.w("B030", "показать") - 0.3, 0.5, pose="reach")
    tk.key(K.w("B030", "посмотрела"), 0.5, pose="calm")
    ts = K.w("B030", "дорогу")
    ny.key(ts - 1.4, 0.6, pose="palms")
    K.label(ts - 1.2, t1 - 0.2, "«Мне нужно смотреть на дорогу»", TABLEA_X + 120, 380, "label")
    c.key(K.w("B030", "перекосилась") - 0.4, 0.5, rot=-6)
    c.key(K.w("B030", "перекосилась") + 0.4, 0.6, rot=0)


def s22(K, sc):
    """Hide the condition — or admit the result. 'Not ready yet.' Mounts moved, side stops added."""
    t0, t1 = sc["t0"], sc["t1"]
    tk, ny = K.tiko, K.naya
    c = K.carrier
    K.cam(t0, 1.4, cx=TABLEA_X - 40, cy=560, z=1.15)
    tk.key(t0 + 0.2, 0.6, pose="tired")
    a1 = K.w("B031", "инструкцию")
    o1 = K.prop("card_small", TABLEA_X - 300, 260, s=1.3, layer=5)
    o2 = K.prop("card_small", TABLEA_X + 300, 260, s=1.3, layer=5)
    for o in (o1, o2):
        K.place(o, t0, alpha=0.0)
    K.show(o1, a1 - 0.6, 0.6, alpha=0.8)
    K.label(a1 - 0.4, K.S("B032") + 0.6, "мелкая инструкция,\nпоказ без нагрузки", TABLEA_X - 300, 260, "small", size=26)
    o1.key(K.w("B031", "разочарование") - 0.4, 1.2, alpha=0.25)
    K.headline(K.w("B031", "полезный") - 0.2, K.w("B031", "неприятный") + 2.0, "Самый полезный отказ за день",
               style="small")
    t32 = K.S("B032")
    K.show(o2, t32 - 0.4, 0.6, alpha=0.9)
    K.label(t32 - 0.2, K.w("B032", "вернуться") + 1.0, "признать результат", TABLEA_X + 300, 260, "small", size=26)
    tg = K.w("B032", "готово")
    K.label(tg - 0.6, tg + 2.6, "«Пока не готово»", TABLEA_X - 150, 330, "label")
    tk.key(tg - 0.6, 0.6, pose="palms")
    for o in (o1, o2):
        K.hide(o, K.w("B032", "вернуться") + 1.0)
    tv = K.w("B032", "вернуться")
    ny.key(tv, 0.6, pose="nod")
    K.walk(ny, tv + 1.2, 2150, speed=210)
    ny.key(tv + 4.0, 0.6, alpha=0.0)
    tb = K.w("B032", "коробки")
    K.label(tb, K.w("B032", "обычных") + 1.6, "те же коробки, тот же вес", CARR_ON_TABLE[0], CARR_ON_TABLE[1] - 190,
            "note")
    tm = K.w("B032", "перенёс")
    tk.key(tm - 0.6, 0.6, pose="work")
    c.key(tm, 1.4, shape="carrier")
    K.sfx(tm + 0.4, "fixed", 0.6)
    tu = K.w("B032", "упоры")
    c.key(tu - 0.2, 1.4, shape="carrier_v2")
    K.sfx(tu + 0.4, "fixed", 0.6)
    K.headline(K.w("B032", "неудобное") - 0.4, t1, "Исправить причину")
    K.cam(tm - 1.0, 1.6, cx=TABLEA_X - 20, cy=650, z=1.6)


def s23(K, sc):
    """Repeated lifts at the table in the same conditions; the strap keeps contact; slower claims."""
    t0, t1 = sc["t0"], sc["t1"]
    tk = K.tiko
    c, b = K.carrier, K.nboxes
    K.cam(t0, 1.0, cx=TABLEA_X - 40, cy=660, z=1.6)
    lifts = [K.w("B033", "поднимал"), K.w("B033", "менял"), K.w("B033", "давит")]
    tk.key(t0, 0.5, pose="hold", face=1)
    for i, tl in enumerate(lifts):
        dy = -46
        c.key(tl - 0.3, 0.6, y=CARR_ON_TABLE[1] + dy)
        b.key(tl - 0.3, 0.6, y=CARR_ON_TABLE[1] + 6 + dy, x=CARR_ON_TABLE[0] + (0, 10, -8)[i])
        tk.key(tl - 0.3, 0.6, pose="lift")
        c.key(tl + 1.0, 0.6, y=CARR_ON_TABLE[1])
        b.key(tl + 1.0, 0.6, y=CARR_ON_TABLE[1] + 6)
        tk.key(tl + 1.0, 0.6, pose="hold")
        K.sfx(tl + 1.5, "clunk", 0.35)
    K.headline(K.w("B033", "сценария") - 0.4, K.w("B033", "сценария") + 3.0, "Те же условия")
    th = K.w("B033", "ладонь")
    K.cam(th - 0.8, 1.0, cx=TABLEA_X - 60, cy=620, z=2.0)
    K.cam(th + 2.0, 1.4, cx=TABLEA_X - 40, cy=640, z=1.45)
    K.label(K.w("B033", "лабораторию") - 0.2, K.E("B033") + 0.2, "не лаборатория • не «любой груз»", TABLEA_X - 40, 360,
            "note")
    # B034: the same parts, placed differently, beat the little screen
    t34 = K.S("B034")
    gscreen = K.prop("unibox_screen", TABLEA_X + 280, 560, s=1.2, layer=5, tint=(0.6, 0.6, 0.9, 0.3))
    K.place(gscreen, t0, alpha=0.0)
    te = K.w("B034", "экран")
    K.show(gscreen, te - 1.0, 0.6, alpha=0.5)
    gscreen.key(te - 0.4, 1.2, y=500)
    K.hide(gscreen, te + 2.6, 0.8)
    K.headline(K.w("B034", "расположение") - 0.4, K.w("B034", "проверка") + 2.0,
               "Улучшение — другое расположение тех же деталей", style="small")
    # B035: early test ≠ early money for an untested promise
    t35 = K.S("B035")
    K.cam(t35 - 0.4, 1.4, cx=TABLEA_X - 40, cy=560, z=1.15)
    tp = K.w("B035", "полезно")
    K.label(tp - 1.6, K.E("B035"), "раньше показывать проверяемую версию — полезно", TABLEA_X - 40, 300, "small")
    td = K.w("B035", "другое")
    K.label(td - 2.4, K.E("B035"), "раньше брать деньги за непроверенное — другое решение", TABLEA_X - 40, 356, "small")
    K.headline(K.w("B035", "экономит") - 0.4, t1, "Маленький запуск уменьшает масштаб ошибки", style="small")
    tk.key(K.w("B035", "запуск"), 0.6, pose="nod")


def s24(K, sc):
    """Naya returns and lifts it herself; Tiko's hands stay away. 'Now I'll try it on my route.'"""
    t0, t1 = sc["t0"], sc["t1"]
    tk, ny = K.tiko, K.naya
    c, b = K.carrier, K.nboxes
    K.cam(t0, 1.2, cx=TABLEA_X + 40, cy=620, z=1.3)
    K.place(ny, t0, x=2050, face=-1, alpha=0.0, pose="stand")
    ny.key(t0 + 0.2, 0.5, alpha=1.0)
    K.walk(ny, t0 + 0.2, CARR_ON_TABLE[0] + 170, speed=210)
    tw = K.w("B036", "ремень")
    ny.key(tw - 0.6, 0.6, pose="lift")
    tk.key(tw - 0.6, 0.8, pose="palms")
    K.walk(tk, tw - 0.4, TABLEA_X - 260, speed=90, pose_after="palms")
    K.headline(K.w("B036", "придерживал") - 0.3, K.w("B036", "движение") + 1.6, "Руки Тико в стороне", style="small")
    lifts = [K.w("B036", "подняла"), K.w("B036", "повторила")]
    for tl in lifts:
        K.hold(c, ny, tl - 0.3, "hand_f", dx=-20, dy=58, d=0.4)
        K.hold(b, ny, tl - 0.3, "hand_f", dx=-20, dy=64, d=0.4)
        ny.key(tl - 0.3, 0.8, pose="hold", fa1=40, fa2=20)
        ny.key(tl + 1.4, 0.6, pose="lift")
        K.release(c, tl + 1.6, CARR_ON_TABLE[0], CARR_ON_TABLE[1], d=0.6)
        K.release(b, tl + 1.6, *boxes_on(CARR_ON_TABLE), d=0.6)
    tq = K.w("B036", "попробую")
    K.label(tq - 0.6, tq + 3.0, "«Вот теперь попробую на своём пути»", TABLEA_X + 60, 360, "label")
    K.headline(K.w("B036", "покупка") - 0.4, K.w("B036", "покупка") + 3.0, "Попробовать самой")
    K.hold(c, ny, tq + 0.6, "hand_f", dx=-20, dy=58, d=0.5)
    K.hold(b, ny, tq + 0.6, "hand_f", dx=-20, dy=64, d=0.5)
    ny.key(tq + 0.6, 0.6, pose="hold", fa1=40, fa2=20)
    K.label(K.w("B036", "получилось") - 2.6, t1, "согласие — про действие, а не про красоту идеи", TABLEA_X, 990, "note")
    tk.key(K.w("B036", "получилось"), 0.6, pose="calm")


SCENES = {"S12": s12, "S13": s13, "S14": s14, "S15": s15, "S16": s16, "S17": s17, "S18": s18, "S19": s19,
          "S20": s20, "S21": s21, "S22": s22, "S23": s23, "S24": s24}
