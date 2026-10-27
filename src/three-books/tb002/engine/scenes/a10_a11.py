"""A10–A11: the most dangerous pleasant offer, the next honest question (S37–S44)."""
from kit import (BOARD_X, GROUND, NEIGHBOR_X, SIGN_Y, STALL_X, TABLE_X, DOOR_X, BOX_X, COUNTER_TOP)

TABLEC_TOP = GROUND - 80
CARR_C = (TABLE_X, TABLEC_TOP - 50)


def demo_set(K, t0, t1):
    """A carrier with two boxes standing on the pickup table for the evening scenes."""
    c = K.prop("carrier_v2", CARR_C[0], CARR_C[1], layer=5, smax=1.4)
    b = K.prop("boxpair", CARR_C[0], CARR_C[1] + 6, layer=6)
    for a in (c, b):
        K.place(a, t0, alpha=0.0)
        K.show(a, t0 + 0.05, 0.4)
        K.hide(a, t1 - 0.3, 0.3)
    return c, b


def s37(K, sc):
    """'Can you make a big batch?' An imagined row appears as a translucent assumption and fades."""
    t0, t1 = sc["t0"], sc["t1"]
    tk = K.tiko
    nb = K.p["neighbor"]
    c, b = demo_set(K, t0, t1 + 200)
    K.demo = (c, b)
    K.cam(t0, 1.4, cx=TABLE_X + 260, cy=600, z=1.1)
    K.place(tk, t0, x=TABLE_X - 170, face=1, pose="calm", alpha=1.0)
    K.place(nb, t0, x=NEIGHBOR_X - 120, face=-1, alpha=0.0, pose="stand")
    nb.key(t0 + 0.3, 0.6, alpha=1.0)
    K.walk(nb, t0 + 0.3, TABLE_X + 230, speed=200)
    tq = K.w("B056", "партию")
    nb.key(tq - 0.8, 0.6, pose="gesture")
    K.label(tq - 1.4, tq + 3.4, "«Сможешь сделать большую партию?»", TABLE_X + 230, 360, "label")
    K.headline(tq - 0.6, tq + 3.6, "Большая партия?")
    tr = K.w("B056", "ряд")
    row = K.prop("ghost_row", TABLE_X + 120, 470, s=0.9, layer=3, smax=1.0)
    sign = K.prop("bigsign", TABLE_X + 120, 330, s=0.8, layer=3, smax=1.0)
    for a in (row, sign):
        K.place(a, t0, alpha=0.0, assemble=0.0, ox=TABLE_X, oy=560)
        a.key(tr - 0.3, 1.6, alpha=0.45, assemble=1.0)
    K.sfx(tr, "shimmer", 0.6)
    tk.key(tr - 0.4, 0.8, pose="proud")
    tg = K.w("B056", "нравиться")
    tk.key(tg - 0.4, 0.6, pose="tilt")
    tf = K.w("B056", "посмотрим", occ=2)
    for a in (row, sign):
        a.key(tf - 0.4, 1.8, alpha=0.0, assemble=0.0, ox=TABLE_X + 120, oy=470, spread=3.0)
    K.sfx(tf - 0.2, "fizzle", 0.5)
    K.label(tf - 0.2, t1 - 0.2, "неизвестность ≠ красивая картинка", TABLE_X + 120, 990, "note")


def s38(K, sc):
    """Other heavy loads at the neighbour's stall; this task is separated; a separate trial is proposed."""
    t0, t1 = sc["t0"], sc["t1"]
    tk = K.tiko
    nb = K.p["neighbor"]
    K.cam(t0, 1.4, cx=TABLE_X + 300, cy=600, z=1.05)
    tk.key(K.w("B057", "спросил") - 0.4, 0.6, pose="gesture")
    qs = [("коробок", "каких коробок?"), ("когда", "когда?"), ("показывать", "кто покажет ограничения?")]
    for i, (wd, lab) in enumerate(qs):
        tw = K.w("B057", wd)
        K.label(tw - 0.2, K.w("B057", "Выяснилось") + 1.5, lab, TABLE_X - 120, 330 + i * 46, "small", size=26)
    tv = K.w("B057", "размеров")
    loads = [("crate", TABLE_X + 520, GROUND - 66, 0.8), ("bigbox_l", TABLE_X + 700, GROUND - 46, 1.0),
             ("suitcase", TABLE_X + 860, GROUND - 74, 1.0)]
    objs = []
    for i, (nm, x, y, s) in enumerate(loads):
        o = K.prop(nm, x, y, s=s, layer=4)
        K.place(o, t0, alpha=0.0)
        K.show(o, tv - 0.8 + i * 0.4, 0.6)
        objs.append(o)
    nb.key(tv - 1.0, 0.6, pose="point", face=1)
    K.label(K.w("B057", "тяжелее") - 0.2, K.E("B057") + 1.0, "другие грузы — вне проверки", TABLE_X + 690, 650, "note")
    K.headline(K.w("B057", "последствия") - 1.0, K.E("B057") + 0.5, "Больше изделий ≠ шире проверенные условия",
               style="small")
    nb.key(K.w("B057", "подходил"), 0.6, face=-1, pose="stand")
    t58 = K.S("B058")
    K.label(t58 - 0.2, t58 + 4.0, "«Сейчас обещать всю партию не могу»", TABLE_X + 60, 330, "label")
    tk.key(t58, 0.6, pose="palms")
    tp = K.w("B058", "пробу")
    sep = K.prop("card_small", TABLE_X + 700, 470, s=0.9, layer=5, tint=(0.4, 1.0, 0.85, 0.4))
    K.place(sep, t0, alpha=0.0)
    K.show(sep, tp - 0.6, 0.6)
    K.label(tp - 0.4, t1 - 0.4, "отдельная проба\nна реальных коробках", TABLE_X + 700, 470, "note", size=20)
    K.headline(tp - 0.4, t1, "Сначала проверить")
    nb.key(K.w("B058", "обязан"), 0.6, pose="think")
    for o in objs + [sep]:
        K.hide(o, t1 - 0.4)
    K.walk(nb, t1 - 2.4, NEIGHBOR_X - 60, speed=200)
    nb.key(t1 - 0.3, 0.3, alpha=0.0)


def s39(K, sc):
    """Growth is allowed; complex products are sometimes needed. Naya folds the carrier and goes."""
    t0, t1 = sc["t0"], sc["t1"]
    tk, ny = K.tiko, K.naya
    K.cam(t0, 1.2, cx=TABLE_X + 80, cy=580, z=1.05)
    tr = K.w("B059", "Расти")
    cx = K.prop("unibox", TABLE_X - 420, 420, s=1.0, layer=4, tint=(0.6, 0.6, 0.9, 0.3))
    scr = K.prop("unibox_screen", TABLE_X - 440, 340, s=1.0, layer=4, tint=(0.6, 0.6, 0.9, 0.3))
    for a in (cx, scr):
        K.place(a, t0, alpha=0.0)
        K.show(a, tr - 0.3, 0.6, alpha=0.6)
        K.hide(a, K.E("B059") + 0.4)
    K.label(tr, K.E("B059") + 0.4, "сложная задача — открытый вопрос", TABLE_X - 420, 520, "note")
    qs = [("задачу", "какую задачу решает усложнение?"), ("держится", "на чём держится обещание?"),
          ("увидеть", "как увидеть результат?")]
    for i, (wd, lab) in enumerate(qs):
        tw = K.w("B059", wd)
        K.label(tw - 0.2, K.E("B059") + 0.4, lab, TABLE_X + 360, 300 + i * 46, "small", size=26)
    K.headline(K.w("B059", "Догадку") - 0.4, K.E("B059") + 0.4, "Задачи бывают разными")
    tk.key(K.w("B059", "спрашивать"), 0.6, pose="think")
    # B060: Naya with the empty folded carrier
    t60 = K.S("B060")
    fc = K.prop("carrier_folded", 0, 0, layer=6, smax=1.2)
    nbx = K.prop("boxpair", TABLE_X + 230, TABLEC_TOP - 34, layer=4)
    K.place(ny, t0, x=TABLE_X + 700, face=-1, alpha=0.0, pose="hold1")
    K.place(fc, t0, alpha=0.0)
    K.hold(fc, ny, t0, "hand_f", dx=10, dy=0, d=0.01)
    ny.key(t60 - 1.0, 0.5, alpha=1.0)
    K.show(fc, t60 - 1.0, 0.5)
    K.walk(ny, t60 - 1.0, TABLE_X + 380, speed=200, walk_pose="walk_hold1", pose_after="present")
    K.label(K.w("B060", "сложенную") - 0.2, K.w("B060", "завтра") + 1.4, "пустая сложенная переноска", TABLE_X + 380, 380,
            "note")
    tb = K.w("B060", "убрала")
    K.place(nbx, t0, alpha=0.0)
    K.show(nbx, tb - 1.2, 0.6, alpha=0.9)
    K.release(fc, tb, TABLE_X + 230, TABLEC_TOP - 76, d=0.6)
    ny.key(tb, 0.6, pose="work")
    K.headline(K.w("B060", "перехватов") - 0.6, K.w("B060", "дне") + 2.0, "Меньше перехватов у двери — в одном рабочем дне",
               style="small")
    tg = K.w("B060", "Впервые")
    ny.key(tg - 1.0, 0.5, pose="stand")
    K.hold(fc, ny, tg - 1.0, "hand_f", dx=10, dy=0, d=0.5)
    K.walk(ny, tg - 0.6, TABLE_X + 1100, speed=200, walk_pose="walk_hold1")
    ny.key(tg + 3.0, 0.6, alpha=0.0)
    K.hide(fc, tg + 3.0)
    K.hide(nbx, t1 - 0.5)
    tk.key(K.w("B060", "убедительнее"), 0.6, pose="calm")


def s40(K, sc):
    """The removed parts in their tray: he takes one, looks at a future task, puts it back."""
    t0, t1 = sc["t0"], sc["t1"]
    tk = K.tiko
    K.cam(t0, 1.4, cx=TABLE_X - 60, cy=660, z=1.6)
    for a in K.demo:
        K.hide(a, t0 - 0.6, 0.5)
        K.show(a, t1 - 0.6, 0.5)
    tray = K.prop("tray", TABLE_X - 10, TABLEC_TOP - 16, layer=4)
    parts = [("unibox_screen", -30, -34, 0.6), ("unibox_flag", 30, -30, 0.6), ("unibox_handle", 0, -20, 0.55),
             ("unibox_drawer", 60, -12, 0.5)]
    objs = []
    for nm, dx, dy, s in parts:
        o = K.prop(nm, TABLE_X - 10 + dx, TABLEC_TOP - 16 + dy, s=s, layer=5)
        K.place(o, t0, alpha=0.0)
        K.show(o, t0 + 0.2, 0.6)
        objs.append(o)
    K.place(tray, t0, alpha=0.0)
    K.show(tray, t0 + 0.2, 0.6)
    K.label(K.w("B061", "детали") - 0.2, K.w("B061", "Отложил") + 1.6, "отложены отдельно — не выброшены", TABLE_X + 40,
            TABLEC_TOP - 190, "note")
    tt = K.w("B061", "пригодятся")
    scr = objs[0]
    tk.key(tt - 1.0, 0.6, pose="reach")
    K.hold(scr, tk, tt - 0.4, "hand_f", dx=10, dy=-30, d=0.6)
    tk.key(tt + 0.4, 0.8, pose="think")
    K.headline(K.w("B061", "кому") - 0.4, K.w("B061", "сделать") + 2.2, "Кому это поможет? Что позволит сделать?")
    tp = K.w("B061", "способен")
    tk.key(tp - 0.6, 0.6, pose="reach")
    K.release(scr, tp, TABLE_X - 40, TABLEC_TOP - 50, d=0.8)
    K.label(tp + 0.4, t1 - 0.4, "«могу сделать» — ещё не причина предлагать", TABLE_X - 60, 990, "note")
    tk.key(tp + 1.2, 0.6, pose="calm")
    for o in objs + [tray]:
        K.hide(o, t1 - 0.4)


def s41(K, sc):
    """The first stall seen from the opposite side: the door, the boxes and the hand that needs a grip."""
    t0, t1 = sc["t0"], sc["t1"]
    tk = K.tiko
    for a in K.demo:
        K.hide(a, t0 + 0.1, 0.3)
    K.cut(t0 + 0.4, 1350, 580, 1.0)
    K.place(tk, t0 + 0.4, x=1300, face=-1, pose="calm", alpha=1.0)
    K.place(K.unibox, t0 + 0.4, alpha=0.0)
    K.label(t0 + 0.4, K.w("B062", "стоял", occ=2) + 0.5, "Новый уровень повседневных возможностей", STALL_X, SIGN_Y,
            "small", size=27, alpha=0.5)
    tv = K.w("B062", "Вечером")
    K.turn(tk, tv, 1)
    K.cam(tv, 4.0, cx=2300, cy=580, z=0.95)
    K.walk(tk, tv + 0.4, 1900, speed=110)
    td = K.w("B062", "дверь")
    hand = K.prop("hand_icon", DOOR_X - 350, 520, s=0.8, layer=6)
    bx = K.prop("boxpair", 2560, GROUND - 40 - 14 - 36, layer=4)
    for a, tt in ((hand, K.w("B062", "руку")), (bx, K.w("B062", "коробки"))):
        K.place(a, t0, alpha=0.0)
        K.show(a, tt - 0.2, 0.6, alpha=0.85)
        K.hide(a, t1 - 0.4)
    K.door.key(td - 0.2, 0.4, bright=1.6)
    K.door.key(td + 1.2, 0.8, bright=1.0)
    for i, (wd, lab) in enumerate((("проще", "вещь проще"), ("понятнее", "объяснение понятнее"),
                                    ("осторожнее", "выводы осторожнее"))):
        tw = K.w("B062", wd)
        K.label(tw - 0.2, t1 - 0.3, lab, 2300 - 440 + i * 440, 330, "small", size=28)
    K.headline(K.w("B062", "увереннее") - 0.8, t1, "Увидеть задачу")
    tk.key(K.w("B062", "увереннее"), 0.6, pose="nod")


def s42(K, sc):
    """A small honest experiment in four linked actions (for the viewer's own idea)."""
    t0, t1 = sc["t0"], sc["t1"]
    K.board(t0 + 0.3, t1 - 0.2)
    steps = [("eye", "посмотреть", "посмотреть, как человек\nсправляется сейчас"),
             ("question", "Спросить", "спросить о недавнем\nреальном случае"),
             ("carrier_v2", "Найти", "небольшой результат,\nкоторый вы обеспечите"),
             ("hand_icon", "отказаться", "условия понятны —\nможно отказаться"),
             ("note", "записать", "записать: случилось /\nпредполагаете")]
    for i, (nm, wd, lab) in enumerate(steps):
        x = BOARD_X - 760 + i * 380
        y = 430 if i % 2 == 0 else 560
        o = K.prop(nm, x, y, s=1.5 if nm != "carrier_v2" else 1.0, layer=4, smax=1.6,
                   tint=(0.25, 0.32, 0.9, 0.7) if nm in ("eye", "note", "hand_icon") else (1, 1, 1, 0))
        K.place(o, t0, alpha=0.0)
        tw = K.w("B063", wd)
        K.show(o, tw - 0.4, 0.6)
        K.hide(o, t1 - 0.4, 0.3)
        K.label(tw - 0.2, t1 - 0.4, lab, x, y + 130, "small", size=24)
        if i:
            K.flow(10, tw - 0.6, tw, (x - 300, y), (x - 70, y), travel=0.6, stay=True, fade_at=t1 - 0.5, seed=70 + i,
                   color=(0.2, 0.5, 0.95), size=0.6, arc=-30, src_spread=4)
    K.headline(K.S("B063") + 0.4, K.w("B063", "условия") - 0.4, "Не обязательно начинать с большой вывески",
               y=150, style="small")
    K.headline(K.w("B063", "условия"), t1 - 0.3, "Один честный опыт", y=150, style="label")


def s43(K, sc):
    """Without a physical product: a service card and an announcement, each with result and condition."""
    t0, t1 = sc["t0"], sc["t1"]
    tsv = K.w("B064", "услугу")
    srv = K.prop("service_card", BOARD_X - 400, 480, s=1.6, layer=4, smax=1.7, tint=(0.4, 0.45, 0.95, 0.5))
    ad = K.prop("ad_card", BOARD_X + 400, 480, s=1.35, layer=4, smax=1.4, tint=(0.4, 0.45, 0.95, 0.5))
    for a, tt in ((srv, tsv - 0.6), (ad, K.w("B064", "объявление") - 0.6)):
        K.place(a, t0, alpha=0.0)
        K.show(a, tt, 0.6)
        K.hide(a, t1 - 0.45, 0.3)
    K.label(K.w("B064", "результат") - 0.2, t1 - 0.45, "результат + условия работы", BOARD_X - 400, 700, "small")
    K.label(K.w("B064", "действие") - 0.2, t1 - 0.45, "какое действие сделает читатель?", BOARD_X + 400, 700, "small")
    K.headline(tsv - 0.6, K.w("B064", "дорогой") - 0.4, "Что сможет сделать человек?")
    K.headline(K.w("B064", "дорогой") - 0.2, t1 - 0.45, "Проверка отличает удачную догадку от неудачной", y=900,
               style="small")
    K.cut(t1 - 0.2, TABLE_X - 20, 640, 1.35, light=0.0)


def s44(K, sc):
    """Two done orders and the card of the next question; the long sign goes out, the card stays lit."""
    t0, t1 = sc["t0"], sc["t1"]
    tk = K.tiko
    K.place(tk, t0 - 0.2, x=TABLE_X - 200, face=1, pose="calm", alpha=1.0)
    for a in [K.cardC] + K.orders:
        K.hide(a, t0 - 0.2, 0.3)
    c = K.prop("carrier_v2", TABLE_X - 50, TABLEC_TOP - 50, layer=5, smax=1.4)
    card = K.prop("card", TABLE_X + 230, TABLEC_TOP - 160, s=1.65, layer=5, smax=1.7)
    for a in (c, card):
        K.place(a, t0 - 0.2, alpha=1.0)
    for i in range(2):
        o = K.prop("check", TABLE_X + 200 + i * 60, TABLEC_TOP - 236, s=0.7, layer=7)
        K.place(o, t0 - 0.2, alpha=0.0)
        K.show(o, K.w("B065", "выполненных") - 0.2 + i * 0.3, 0.4)
    t1l = K.w("B065", "Сегодня")
    K.label(t1l - 0.3, 1800, "Сегодня: два выполненных заказа", TABLE_X + 230, TABLEC_TOP - 186, "small", size=22)
    t2l = K.w("B065", "Завтра")
    K.label(t2l - 0.3, 1800, "Завтра: проверить следующий случай", TABLE_X + 230, TABLEC_TOP - 134, "small", size=22)
    K.sfx(t2l, "tick", 0.5)
    # the long sign seen far away at the stall goes out
    tv = K.w("B065", "выключил")
    K.cam(tv - 2.0, 2.0, cx=TABLE_X - 40, cy=620, z=1.15)
    K.label(t0, tv + 0.4, "Новый уровень повседневных возможностей", TABLE_X - 420, 300, "note", alpha=0.6)
    K.sfx(tv + 0.2, "dim", 0.6)
    card.key(K.w("B065", "светиться") - 0.4, 1.0, bright=1.4)
    tk.key(K.w("B065", "поможет") - 0.4, 0.6, pose="present")
    tz = K.w("B065", "возможности")
    K.headline(tz - 0.2, 1800, "кому поможет • что сделает • где границы", y=1000, style="small")
    tk.key(K.E("B065") + 0.2, 1.2, pose="calm")
    K.cam(K.E("B065") - 3.0, 6.0, cx=TABLE_X + 60, cy=630, z=1.25)
    K.st.look.key(1800 - 1.6, 1.5, fade=0.0)


SCENES = {"S37": s37, "S38": s38, "S39": s39, "S40": s40, "S41": s41, "S42": s42, "S43": s43, "S44": s44}
