"""A01–A03: zero purchases, the overloaded box, the other side of the vitrine (S01–S11)."""
from kit import (BENCH_X, BOX_X, BOX_Y, COUNTER_TOP, DOOR_X, GROUND, SIGN_Y, STAIRS_X, STALL_X, UPPER_Y)


def unfold(K, t, d=0.5):
    """The universal box shows its features: handle, screen, flag, drawers."""
    K.show(K.uhandle, t, d, y=BOX_Y - 62)
    K.show(K.uscreen, t + 0.35, d, y=BOX_Y - 92)
    K.show(K.uflag, t + 0.7, d, y=BOX_Y - 70)
    K.show(K.udrawer1, t + 1.0, d, x=BOX_X + 34)
    K.show(K.udrawer2, t + 1.25, d, x=BOX_X - 30)
    for k in range(4):
        K.sfx(t + k * 0.35, "click", 0.7)


def fold(K, t, d=0.5):
    K.uhandle.key(t, d, y=BOX_Y - 50, alpha=0.0)
    K.uscreen.key(t + 0.15, d, y=BOX_Y - 40, alpha=0.0)
    K.uflag.key(t + 0.3, d, y=BOX_Y - 40, alpha=0.0)
    K.udrawer1.key(t + 0.45, d, x=BOX_X, alpha=0.0)
    K.udrawer2.key(t + 0.6, d, x=BOX_X, alpha=0.0)


def s01(K, sc):
    t0, t1 = sc["t0"], sc["t1"]
    tk, ny = K.tiko, K.naya
    K.cam(0, 0.01, cx=1150, cy=540, z=1.0)
    K.place(tk, 0, x=590, face=1, alpha=0.0, assemble=0.0, ox=590, oy=700, pose="stand")
    tk.key(0.2, 2.2, alpha=1.0, assemble=1.0)
    for a in (K.unibox,):
        K.place(a, 0, alpha=0.0)
        K.show(a, 0.8, 1.2)
    K.place(K.uhandle, 0, y=BOX_Y - 50)
    K.place(K.uscreen, 0, y=BOX_Y - 40)
    K.place(K.uflag, 0, y=BOX_Y - 40)
    unfold(K, K.w("B001", "светилось"))
    tk.key(K.w("B001", "светилось") - 0.3, 0.6, pose="present")
    # visitors stop, smile, walk on (attention lights fly to them and come back empty)
    p1, p2 = K.p["p1"], K.p["p2"]
    ts = K.w("B001", "Люди")
    K.place(p1, t0, x=2050, face=-1, alpha=0.0)
    p1.key(ts - 3.2, 0.5, alpha=1.0)
    ta = K.walk(p1, ts - 3.2, 1290, speed=260)
    p1.key(ta, 0.6, pose="tilt")
    K.flow(26, ta + 0.2, ta + 1.6, (BOX_X, BOX_Y - 40), (1260, 560), travel=1.0, stay=False, vanish_at_dst=True,
           seed=11, color=(0.75, 0.85, 1.0), size=0.8)
    tl = K.w("B001", "дальше", end=True)
    K.walk(p1, tl - 1.0, -200, speed=260)
    p1.key(tl + 3.5, 0.5, alpha=0.0)
    K.place(p2, t0, x=2150, face=-1, alpha=0.0)
    p2.key(ts - 2.0, 0.5, alpha=1.0)
    tb = K.walk(p2, ts - 2.0, 1480, speed=250)
    p2.key(tb, 0.6, pose="nod")
    tk.key(tb, 0.6, pose="gesture")
    K.walk(p2, tl - 0.4, 2300, speed=250)
    p2.key(tl + 4.5, 0.5, alpha=0.0)
    tn = K.w("B001", "одиннадцать")
    K.label(tn, tn + 5.0, "«Как интересно» × 11", STALL_X, SIGN_Y, "small")
    K.headline(K.w("B001", "останавливались"), K.w("B001", "соседнем") + 0.4, "Интерес ≠ покупка")
    tk.key(tl, 0.8, pose="tired")
    # the neighbouring aisle: Naya ties two boxes with a plain cord and leaves
    tn2 = K.w("B001", "соседнем")
    K.cam(tn2 - 0.4, 2.4, cx=BENCH_X + 80, cy=600, z=1.15)
    K.place(ny, t0, x=BENCH_X + 150, face=-1, alpha=0.0, pose="work")
    ny.key(tn2 - 1.0, 0.6, alpha=1.0)
    K.place(K.nboxes, t0, x=BENCH_X + 20, y=GROUND - 40 - 14 - 36, alpha=0.0)
    K.show(K.nboxes, tn2 - 1.0, 0.6)
    K.place(K.cord, t0, x=BENCH_X + 20, y=GROUND - 40 - 14 - 36, alpha=0.0, assemble=0.0, ox=BENCH_X + 20,
            oy=GROUND - 160)
    tc = K.w("B001", "шнуром")
    K.cord.key(tc - 0.8, 1.6, alpha=1.0, assemble=1.0)
    K.sfx(tc, "paper", 0.8)
    tg = K.w("B001", "ушла")
    ny.key(tg - 0.6, 0.5, pose="hold", face=1)
    K.hold(K.nboxes, ny, tg - 0.2, "hand_f", dx=-18, dy=-20)
    K.hold(K.cord, ny, tg - 0.2, "hand_f", dx=-18, dy=-20)
    K.walk(ny, tg + 0.2, DOOR_X + 260, speed=200, walk_pose="walk_hold")
    K.cam(tg + 0.2, 4.0, cx=DOOR_X - 60, cy=600, z=1.1)
    K.door.key(tg + 2.6, 0.6, shape="door_open")
    K.sfx(tg + 2.6, "creak", 0.5)
    tk.key(K.w("B001", "чудо"), 0.7, pose="surprised")


def s02(K, sc):
    t0, t1 = sc["t0"], sc["t1"]
    tk, ny = K.tiko, K.naya
    # close on the cord as she goes through the door; then Tiko behind his vitrine
    K.cam(t0, 1.2, cx=DOOR_X + 150, cy=640, z=1.45)
    ny.key(t0 + 1.2, 0.5, alpha=0.0)
    K.hide(K.nboxes, t0 + 1.2, 0.5)
    K.hide(K.cord, t0 + 1.2, 0.5)
    K.door.key(t0 + 1.6, 0.8, shape="door")
    tv = K.w("B002", "вывеске")
    K.cut(min(tv - 1.0, t0 + 2.2), 1000, 560, 1.2)
    tk.key(tv - 0.4, 0.6, pose="point_up", face=1)
    K.headline(tv - 0.2, tv + 2.0, "вывеска?", y=150, style="small")
    tp = K.w("B002", "цене")
    tk.key(tp, 0.6, pose="think")
    K.headline(tp, tp + 1.8, "цена?", y=150, style="small")
    tb = K.w("B002", "покупателях")
    tk.key(tb, 0.6, pose="gesture")
    K.headline(tb, tb + 1.8, "покупатели?", y=150, style="small")
    to = K.w("B002", "другую")
    K.cam(to - 0.4, 2.2, cx=1150, cy=540, z=1.0)
    tk.key(to, 0.8, pose="tilt", face=1)
    tf = K.w("B002", "вымышленная")
    K.st.cap(tf - 0.6, tf + 6.0, "Вымышленная история", 960, 1010, "note", world=False)
    tk.key(tf + 1.0, 0.8, pose="calm")
    fold(K, t1 - 2.2)
    K.st.look.key(t1 - 1.6, 1.4, fade=0.0)
    tk.key(t1 - 1.6, 1.2, alpha=0.0)
    K.unibox.key(t1 - 1.6, 1.2, alpha=0.0)


def s03(K, sc):
    """Morning: the station wakes before Tiko; everyone already has their own task."""
    t0, t1 = sc["t0"], sc["t1"]
    tk = K.tiko
    K.cam(t0, 0.01, cx=3350, cy=560, z=1.0)
    K.st.look.key(t0 + 0.05, 1.4, fade=1.0)
    for i, a in enumerate(K.small):
        x0 = 2300 + i * 380
        K.walker(a, t0 + 0.2 + i * 1.3, x0, x0 + 2600 + i * 200, speed=120, face=1, alpha=0.8)
    p3, p4, p2 = K.p["p3"], K.p["p4"], K.p["p2"]
    box3 = K.prop("flatbox", 0, 0, layer=5)
    tw = K.w("B003", "свёрток")
    K.walker(p3, tw - 2.0, 4000, 2500, speed=210, walk_pose="walk_hold1")
    K.place(box3, tw - 2.0, alpha=0.0)
    K.hold(box3, p3, tw - 2.0, "hand_f", dx=0, dy=-6, d=0.01)
    K.show(box3, tw - 1.95, 0.5)
    K.hide(box3, tw + 6.0, 0.5)
    td = K.w("B003", "дверь")
    K.place(p4, td - 2.5, x=DOOR_X - 130, face=1, alpha=0.0, pose="door")
    p4.key(td - 2.4, 0.6, alpha=1.0)
    K.door.key(td - 0.6, 0.7, shape="door_open")
    K.door.key(td + 3.0, 0.8, shape="door")
    p4.key(td + 3.0, 0.6, pose="stand")
    K.walk(p4, td + 3.4, DOOR_X + 400, speed=220)
    p4.key(td + 5.0, 0.5, alpha=0.0)
    tb = K.w("B003", "билет")
    bag = K.prop("softbag", 0, 0, layer=5)
    K.place(p2, tb - 3.0, x=2250, face=1, alpha=0.0, pose="hold1")
    p2.key(tb - 2.9, 0.5, alpha=1.0)
    K.place(bag, tb - 3.0, alpha=0.0)
    K.hold(bag, p2, tb - 3.0, "hand_f", dx=4, dy=10, d=0.01)
    K.show(bag, tb - 2.9, 0.5)
    p2.key(tb - 0.6, 0.6, pose="think")
    p2.key(tb + 1.4, 0.4, pose="hold1")
    p2.key(tb + 2.4, 0.5, alpha=0.0)
    K.hide(bag, tb + 2.4, 0.5)
    # camera travels along the passage to the stall, which stands apart from all three paths
    tt = K.w("B003", "Тико", occ=2)
    K.cam(K.w("B003", "Внизу"), (tt - K.w("B003", "Внизу")) + 1.0, cx=1100, cy=560, z=1.0)
    K.place(tk, tt - 2.0, x=590, face=1, pose="proud", alpha=0.0)
    tk.key(tt - 2.0, 1.0, alpha=1.0)
    K.place(K.unibox, tt - 2.0, alpha=0.0)
    K.show(K.unibox, tt - 1.8, 1.0)
    K.headline(K.w("B003", "покупателей", occ=2), t1 + 0.3, "Кому это нужно?")
    tk.key(K.w("B003", "спрашивал"), 0.8, pose="calm")


def s04(K, sc):
    """The box opens feature after feature; Tiko aligns every detail with care (B004, B005)."""
    t0, t1 = sc["t0"], sc["t1"]
    tk = K.tiko
    K.cam(t0, 1.8, cx=790, cy=650, z=1.65)
    tk.key(t0 + 0.4, 0.6, pose="reach")
    th = K.w("B004", "ручка")
    K.show(K.uhandle, th - 0.3, 0.5, y=BOX_Y - 62)
    K.sfx(th - 0.3, "click")
    tsn = K.w("B004", "экран")
    K.show(K.uscreen, tsn - 0.3, 0.6, y=BOX_Y - 92)
    K.sfx(tsn - 0.3, "click")
    tf = K.w("B004", "флажок")
    K.show(K.uflag, tf - 0.4, 0.6, y=BOX_Y - 70)
    K.sfx(tf - 0.4, "click")
    td = K.w("B004", "отделений")
    K.show(K.udrawer1, td - 0.4, 0.6, x=BOX_X + 34)
    K.show(K.udrawer2, td + 0.1, 0.6, x=BOX_X - 30)
    K.sfx(td - 0.4, "pop", 0.6)
    tm = K.w("B004", "инструкцию")
    K.place(K.manual, t0, alpha=0.0, y=COUNTER_TOP - 40)
    K.show(K.manual, tm - 0.3, 0.6)
    tk.key(tm - 0.6, 0.6, pose="think")
    tk.key(K.w("B004", "причине"), 0.6, pose="work")
    K.headline(K.w("B004", "Вдруг"), K.w("B004", "пригодится") + 1.4, "«Вдруг пригодится»", style="small")
    # B005: his evenings as warm lights flowing into the box
    te = K.w("B005", "вечеров")
    K.flow(60, te - 0.5, te + 5.0, (680, 720), (BOX_X, BOX_Y - 10), travel=1.2, stay=False, vanish_at_dst=True,
           seed=21, color=(1.0, 0.78, 0.40), size=0.8, arc=-60)
    tk.key(te, 0.6, pose="work")
    tk.key(K.w("B005", "углы"), 0.6, pose="hold")
    K.headline(K.w("B005", "труд"), K.w("B005", "заметит") + 1.5, "Сделано много")
    tsn2 = K.w("B005", "Снаружи")
    K.cam(tsn2 - 0.6, 2.4, cx=1100, cy=560, z=1.0)
    tk.key(tsn2, 0.6, pose="calm")
    p1 = K.p["p1"]
    K.walker(p1, tsn2 - 0.4, 1950, -150, speed=230)
    K.headline(K.w("B005", "дороге"), t1, "своя дорога • свои руки • своё неудобство", y=1000, style="small")


def s05(K, sc):
    """First visitor: 'What do I do with it?' — features, a glance at the platform, 'Nice', gone."""
    t0, t1 = sc["t0"], sc["t1"]
    tk = K.tiko
    v = K.p["p3"]
    K.cam(t0, 1.2, cx=1000, cy=560, z=1.08)
    K.place(v, t0, x=1950, face=-1, alpha=0.0, pose="stand")
    v.key(t0 + 0.1, 0.6, alpha=1.0)
    ta = K.walk(v, t0 + 0.1, 1230, speed=240)
    tq = K.w("B006", "делать")
    v.key(tq - 0.8, 0.6, pose="palms")
    K.headline(tq - 1.0, tq + 3.0, "Зачем мне это?")
    tk.key(K.w("B006", "показывать") - 0.2, 0.6, pose="present")
    for k, (a, kw) in enumerate(((K.uscreen, {"bright": 1.6}), (K.uflag, {"rot": 14}), (K.udrawer1, {"x": BOX_X + 50}))):
        tt = K.w("B006", "возможности") + k * 1.4
        a.key(tt, 0.4, **kw)
        a.key(tt + 0.7, 0.5, **{"bright": 1.0} if "bright" in kw else ({"rot": 0} if "rot" in kw else {"x": BOX_X + 34}))
        K.sfx(tt, "click", 0.6)
    tl = K.w("B006", "платформы")
    v.key(tl - 0.4, 0.5, face=1, pose="stand")
    v.key(tl + 0.6, 0.5, face=-1)
    tk.key(K.w("B006", "третьей"), 0.6, pose="gesture")
    tr = K.w("B006", "Красиво")
    v.key(tr - 0.2, 0.4, pose="nod")
    K.walk(v, K.w("B006", "ушёл"), 2100, speed=250)
    v.key(K.w("B006", "ушёл") + 3.0, 0.5, alpha=0.0)
    # approval is not an order: a soft mark appears and dissolves before reaching the counter
    mark = K.prop("check", 1240, 470, layer=6)
    K.place(mark, t0, alpha=0.0, assemble=1.0)
    to = K.w("B006", "одобрение")
    K.show(mark, to - 0.4, 0.5)
    mark.key(K.w("B006", "заказом") - 0.2, 1.0, assemble=0.0, ox=1240, oy=470, spread=2.0)
    mark.key(K.w("B006", "заказом") + 0.8, 0.4, alpha=0.0)
    K.label(K.w("B006", "заказом") - 0.4, K.w("B006", "воображении"), "одобрение ≠ заказ", 1240, 410, "small")
    tk.key(K.w("B006", "воображении"), 0.8, pose="think")
    tk.key(K.w("B006", "действительности"), 0.8, pose="tired")


def s06(K, sc):
    """The sign grows into three lines; the box gets pushed aside; feet keep passing."""
    t0, t1 = sc["t0"], sc["t1"]
    tk = K.tiko
    K.cam(t0, 1.4, cx=1050, cy=520, z=1.0)
    fold(K, t0 + 0.2)
    K.hide(K.manual, t0 + 0.2)
    ts = K.w("B007", "сияло")
    t2 = K.w("B007", "вторую")
    K.label(ts - 0.4, t2 - 0.2, "Новый уровень повседневных возможностей", STALL_X, SIGN_Y, "small", size=21)
    K.label(t2 - 0.2, t1 - 0.8, "Новый уровень повседневных возможностей", STALL_X, SIGN_Y - 110, "small", size=21)
    tk.key(K.w("B007", "увеличил"), 0.6, pose="point_up")
    K.sfx(ts - 0.4, "lit", 0.6)
    sign = K.prop("signboard_tall", STALL_X, SIGN_Y - 46, layer=1)
    K.place(sign, t0, alpha=0.0)
    K.show(sign, t2 - 0.4, 0.7)
    K.label(t2 - 0.2, t1 - 0.8, "Для дома, дороги, работы и отдыха", STALL_X, SIGN_Y - 52, "small", size=21)
    t3 = K.w("B007", "третью")
    K.label(t3 - 0.2, t1 - 0.8, "Всё в одном • ещё больше функций", STALL_X, SIGN_Y + 6, "small", size=21)
    K.sfx(t2, "lit", 0.5)
    K.sfx(t3, "lit", 0.5)
    tp = K.w("B007", "отодвинуть")
    K.unibox.key(tp - 0.6, 1.0, x=BOX_X - 70, s=0.85)
    tk.key(tp - 0.6, 0.6, pose="work")
    # the line of walking people does not change
    for i, k in enumerate(("p1", "p2", "p4")):
        K.walker(K.p[k], t0 + 2.0 + i * 6.5, 2050 if i % 2 == 0 else -150, -150 if i % 2 == 0 else 2050, speed=250)
    K.headline(K.w("B007", "предлагают") - 1.8, t1 - 0.6, "Непонятно, что здесь предлагают")
    K.hide(sign, t1 - 0.8, 0.8)
    K.unibox.key(t1 - 0.8, 0.8, x=BOX_X, s=1.0)


def s07(K, sc):
    """Blame the passers-by — or step away from the counter. He physically takes the second path."""
    t0, t1 = sc["t0"], sc["t1"]
    tk = K.tiko
    K.cam(t0, 1.6, cx=640, cy=640, z=1.6)
    tk.key(t0 + 0.2, 0.8, pose="tired")
    tb = K.w("B008", "обвинить")
    K.cam(tb - 1.0, 1.6, cx=900, cy=600, z=1.15)
    # two thought paths in the air above him
    left = K.prop("route", 560, 470, s=0.42, layer=3, rot=180)
    right = K.prop("route", 1180, 470, s=0.42, layer=3)
    K.place(left, t0, alpha=0.0)
    K.place(right, t0, alpha=0.0)
    K.show(left, tb - 0.4, 0.6, alpha=0.8)
    K.label(tb - 0.2, K.w("B009", "Есть"), "обвинить прохожих", 560, 410, "small")
    tq = K.w("B008", "допустить")
    K.show(right, tq - 0.4, 0.6, alpha=0.8)
    K.label(tq - 0.2, t1 - 1.0, "понять, что они увидели", 1180, 410, "small")
    left.key(K.w("B008", "поняли"), 1.0, alpha=0.25)
    tk.key(K.w("B009", "старался"), 0.6, pose="proud")
    tk.key(K.w("B009", "нужно"), 0.6, pose="think")
    K.headline(K.w("B009", "старался") - 0.2, K.w("B009", "проверить") + 1.0, "«я очень старался»  ≠  «это нужно другому»",
               style="small")
    tg = K.w("B009", "отойти")
    tk.key(tg - 0.6, 0.6, face=1)
    K.hide(left, tg, 0.8)
    K.walk(tk, tg, 1300, speed=130)
    K.cam(tg, 4.0, cx=1300, cy=600, z=1.2)
    tk.key(K.w("B009", "Посмотреть"), 0.6, face=-1, pose="tilt")
    K.headline(K.w("B009", "Посмотреть") - 0.3, t1, "Посмотреть с другой стороны")
    K.hide(right, K.w("B009", "Посмотреть"), 1.0)


def s08(K, sc):
    """Naya at the door: boxes pressed to the chest, one hand freed, a slipping corner, bench, cord."""
    t0, t1 = sc["t0"], sc["t1"]
    tk, ny = K.tiko, K.naya
    K.cut(t0 + 0.2, DOOR_X + 150, 600, 1.15)
    K.place(tk, t0 + 0.2, x=2150, face=1, pose="stand", alpha=1.0)
    K.place(ny, t0 + 0.2, x=STAIRS_X + 120, face=-1, alpha=1.0, pose="hold")
    K.place(K.nboxes, t0 + 0.2, alpha=1.0, att=0.0)
    K.hold(K.nboxes, ny, t0 + 0.2, "hand_f", dx=14, dy=-20, d=0.01)
    K.place(K.cord, t0 + 0.2, alpha=0.0, att=0.0)
    ta = K.walk(ny, K.w("B010", "лестницы") - 0.5, DOOR_X + 150, speed=180, walk_pose="walk_hold", pose_after="hold")
    to = K.w("B010", "открыть")
    K.cam(to - 1.0, 1.5, cx=DOOR_X + 60, cy=620, z=1.55)
    ny.key(to - 0.2, 0.6, pose="hold1")
    K.nboxes.key(to - 0.2, 0.6, adx=4, ady=-6)
    tf = K.w("B010", "ладонь")
    ny.key(tf - 0.5, 0.6, ba1=88, ba2=4)
    K.door.key(tf, 0.6, shape="door_open")
    K.door.key(tf + 3.0, 0.8, shape="door")
    tc = K.w("B010", "угол")
    K.nboxes.key(tc - 0.8, 0.4, rot=-9)
    K.nboxes.key(tc + 0.1, 0.5, rot=0)
    K.sfx(tc - 0.6, "drop", 0.5)
    ny.key(tc - 0.6, 0.3, pose="hold")
    tsit = K.w("B010", "скамью")
    K.cam(tsit - 2.0, 2.4, cx=BENCH_X + 120, cy=620, z=1.35)
    tb = K.walk(ny, tsit - 2.2, BENCH_X + 120, speed=190, walk_pose="walk_hold", pose_after="work")
    K.release(K.nboxes, tb, BENCH_X - 10, GROUND - 40 - 14 - 36)
    K.sfx(tb, "clunk", 0.5)
    tcord = K.w("B010", "шнур")
    K.place(K.cord, t0 + 0.3, x=BENCH_X - 10, y=GROUND - 40 - 14 - 36, assemble=0.0, ox=BENCH_X + 60, oy=GROUND - 220)
    K.cord.key(tcord - 0.2, 1.6, alpha=1.0, assemble=1.0)
    K.sfx(tcord, "paper", 0.7)
    tt = K.w("B010", "Тико")
    K.cam(tt - 0.4, 2.4, cx=BENCH_X - 120, cy=620, z=1.2)
    tk.key(tt - 0.2, 0.6, pose="tilt")
    K.headline(K.w("B010", "руками") - 0.4, t1, "Руки заняты")


def s09(K, sc):
    """'Would my box be useful?' — 'Maybe.' Then a better question about the door."""
    t0, t1 = sc["t0"], sc["t1"]
    tk, ny = K.tiko, K.naya
    K.cam(t0, 1.4, cx=BENCH_X - 60, cy=620, z=1.25)
    K.walk(tk, t0 + 0.3, BENCH_X - 230, speed=120)
    tq = K.w("B011", "пригодился")
    tk.key(tq - 0.6, 0.6, pose="point", face=-1)
    tk.key(tq + 0.8, 0.6, face=1, pose="gesture")
    ny.key(tq - 0.4, 0.6, face=-1, pose="stand")
    tm = K.w("B011", "Возможно")
    ny.key(tm - 0.3, 0.5, pose="tilt")
    ghost = K.prop("check", BENCH_X - 200, 430, s=1.4, layer=6)
    K.place(ghost, t0, alpha=0.0)
    K.show(ghost, tm, 0.6, alpha=0.6)
    ghost.key(K.w("B011", "выбрала"), 0.9, shape="dash", alpha=0.7)
    K.hide(ghost, K.w("B011", "вопрос") + 0.5)
    K.label(K.w("B011", "приятное"), K.w("B011", "выбрала") + 1.4, "«возможно» — ещё не выбор", BENCH_X - 200, 370, "small")
    tq2 = K.w("B011", "обычно")
    K.headline(tq2 - 0.4, tq2 + 4.0, "Как вы делаете это сейчас?")
    tk.key(tq2 - 0.4, 0.6, pose="palms")
    loose = K.prop("cord_loose", 0, 0, layer=6)
    K.place(loose, t0, alpha=0.0)
    ts = K.w("B011", "показала")
    ny.key(ts - 0.3, 0.6, pose="present")
    K.hold(loose, ny, ts - 0.3, "hand_f", dx=10, dy=0, d=0.01)
    K.show(loose, ts - 0.2, 0.6)
    K.hide(K.cord, ts - 0.2, 0.6)
    tv = K.w("B011", "врезался")
    hx, hy = ny.joint(tv, "hand_f")           # small sparks where the cord cuts into the palm
    K.flow(16, tv - 0.1, tv + 1.2, (hx, hy), (hx + 10, hy - 50), stay=False, vanish_at_dst=True, seed=31,
           color=(1.0, 0.55, 0.45), size=0.7, src_spread=4, travel=0.8, arc=-10)
    tw = K.w("B011", "ослабевал")
    loose.key(tw, 0.6, curve=2.0, rot=8)
    # B012: the result she wants — two small boxes level, one hand free
    tb12 = K.S("B012")
    K.hide(loose, tb12 + 0.5)
    K.cord.key(tb12 + 0.5, 0.6, alpha=1.0)
    th = K.w("B012", "удержать")
    ny.key(th - 0.5, 0.6, pose="hold1")
    K.hold(K.nboxes, ny, th - 0.5, "hand_f", dx=14, dy=-20)
    K.hold(K.cord, ny, th - 0.5, "hand_f", dx=14, dy=-20)
    tfree = K.w("B012", "свободной")
    ny.key(tfree - 0.4, 0.6, ba1=40, ba2=-6)
    hand = K.prop("hand_icon", BENCH_X + 330, 520, s=0.8, layer=6)
    K.place(hand, t0, alpha=0.0)
    K.show(hand, tfree, 0.6, alpha=0.9)
    K.label(tfree + 0.2, K.w("B012", "сегодняшнее") + 1.0, "две коробки ровно • одна рука свободна", BENCH_X + 60, 360,
            "small")
    K.hide(hand, K.w("B012", "сегодняшнее") + 1.0)
    tk.key(K.w("B012", "скромно"), 0.6, pose="tilt")
    ny.key(K.w("B012", "повторялось"), 0.6, pose="nod")
    K.release(K.nboxes, t1 - 0.8, BENCH_X - 10, GROUND - 40 - 14 - 36)
    K.release(K.cord, t1 - 0.8, BENCH_X - 10, GROUND - 40 - 14 - 36)
    ny.key(t1 - 0.8, 0.6, pose="stand")


def s10(K, sc):
    """Different circumstances on one station; then the observable sequence of Naya's actions."""
    t0, t1 = sc["t0"], sc["t1"]
    tk, ny = K.tiko, K.naya
    K.cam(t0, 1.8, cx=BENCH_X + 640, cy=560, z=0.88)
    loads = (("p3", "suitcase", "большой чемодан", BENCH_X + 400, 30, 2, "чемодан"),
             ("neighbor", None, "почти не переносит коробки", DOOR_X + 330, 0, 0, "продавец"),
             ("p2", "lightbag", "одна лёгкая сумка", DOOR_X + 720, 4, 8, "лёгкой"))
    for i, (k, prop, lab, x, dx, dy, word) in enumerate(loads):
        a = K.p[k]
        tw = K.w("B013", word, frac=0.2 + 0.25 * i)
        K.place(a, t0, x=x, face=-1, alpha=0.0, pose="hold1" if prop == "lightbag" else ("carry_side" if prop else "stand"))
        a.key(tw - 0.8, 0.6, alpha=1.0)
        if prop:
            pa = K.prop(prop, 0, 0, layer=5)
            K.place(pa, t0, alpha=0.0)
            K.hold(pa, a, t0, "hand_f", dx=dx if prop == "lightbag" else 10, dy=dy if prop == "lightbag" else 50, d=0.01)
            K.show(pa, tw - 0.8, 0.6)
            K.hide(pa, K.E("B013") + 0.6, 0.8)
        else:
            stand = K.prop("lowtable", x - 100, GROUND - 60, s=0.6, layer=3)
            K.place(stand, t0, alpha=0.0)
            K.show(stand, tw - 0.8, 0.6, alpha=0.7)
            K.hide(stand, K.E("B013") + 0.6, 0.8)
        K.label(tw - 0.4, K.E("B013") + 0.6, lab, x, 400 + 50 * (i % 2), "small", size=26)
        a.key(K.E("B013") + 0.6, 0.8, alpha=0.0)
    K.headline(K.w("B013", "станции"), K.w("B013", "общими"), "Одна станция — разные обстоятельства", style="small")
    # B014: the sequence of actions, written down (not an opinion about his invention)
    K.cam(K.S("B014") - 0.5, 1.6, cx=BENCH_X - 80, cy=600, z=1.15)
    note = K.prop("note", 0, 0, layer=7, s=0.9)
    K.place(note, t0, alpha=0.0)
    K.hold(note, tk, t0, "hand_f", dx=18, dy=-14, d=0.01)
    tk.key(K.S("B014"), 0.6, pose="write", face=1)
    K.show(note, K.S("B014") + 0.2, 0.6)
    steps = ["1  взять две коробки", "2  пройти дверь", "3  удержать основание ровно", "4  не занять вторую руку"]
    words = ["взять", "пройти", "удержать", "занять"]
    for i, (s, wd) in enumerate(zip(steps, words)):
        tw = K.w("B014", wd)
        K.label(tw - 0.2, t1 - 0.6, s, BENCH_X - 470, 380 + i * 44, "small", align="left")
        K.sfx(tw, "tick", 0.6)
    K.headline(K.w("B014", "одним"), t1, "Один разговор — начало, не весь рынок", style="small")
    ny.key(K.w("B014", "наблюдать"), 0.6, pose="nod")
    tk.key(K.w("B014", "следующий"), 0.6, pose="calm")
    K.hide(note, t1 - 0.6)


def s11(K, sc):
    """Why the cord won: it was at hand and did a clear part of the job."""
    t0, t1 = sc["t0"], sc["t1"]
    tk, ny = K.tiko, K.naya
    K.cam(t0, 1.4, cx=BENCH_X + 60, cy=620, z=1.3)
    ny.key(t0 + 0.4, 0.6, pose="hold1", face=1)
    K.hold(K.nboxes, ny, t0 + 0.4, "hand_f", dx=14, dy=-20)
    K.hold(K.cord, ny, t0 + 0.4, "hand_f", dx=14, dy=-20)
    ghost = K.prop("unibox", BENCH_X + 330, GROUND - 220, layer=4, tint=(0.6, 0.6, 0.9, 0.4))
    K.place(ghost, t0, alpha=0.0)
    tg = K.w("B015", "конкурс")
    K.show(ghost, tg - 1.0, 0.8, alpha=0.45)
    K.label(tg - 0.6, tg + 4.0, "шнур: рядом и делает понятную часть работы", BENCH_X + 60, 380, "small")
    K.hide(ghost, tg + 4.0, 0.8)
    tz = K.w("B015", "донести")
    K.headline(tz - 0.6, tz + 4.0, "Результат, который нужен")
    tw = K.walk(ny, tz - 0.4, DOOR_X - 140, speed=190, walk_pose="walk_hold1", pose_after="door")
    K.cam(tz, 3.5, cx=DOOR_X - 200, cy=600, z=1.15)
    K.door.key(tw, 0.5, shape="door_open")
    K.walk(ny, tw + 0.8, DOOR_X + 420, speed=190, walk_pose="walk_hold1")
    ny.key(tw + 2.4, 0.6, alpha=0.0)
    K.hide(K.nboxes, tw + 2.4)
    K.hide(K.cord, tw + 2.4)
    K.door.key(tw + 3.0, 0.8, shape="door")
    tk.key(K.w("B015", "разгадка"), 0.6, pose="nod")
    tk.key(K.w("B015", "трудность"), 0.6, pose="think")
    tk.key(K.w("B015", "гордился"), 0.8, pose="tired")


SCENES = {"S01": s01, "S02": s02, "S03": s03, "S04": s04, "S05": s05, "S06": s06, "S07": s07, "S08": s08,
          "S09": s09, "S10": s10, "S11": s11}
