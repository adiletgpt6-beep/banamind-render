"""A01–A03: the stopped Thursday shift, Monday's two plaques, Tuesday's chain of seven palms (S01–S13)."""
from kit import (BOARD_X, DAYS, G_STANDS, GROUND, MAT_X, PANEL_Y, ROOM_DOOR_X, ROOM_X, S_STANDS, SIDE_X,
                 SITE_DOOR_X, SITE_X, TABLE_TOP, bars, msg, say)

STEPS = ("запрос", "рисунок", "материалы", "сборка", "доставка", "установка", "проверка")


def team_on_site(K, t, alpha=1.0):
    """Tai and two participants at their places on the training site."""
    tai, mel, dan = K.tai, K.p["mel"], K.p["dan"]
    K.place(tai, t, x=S_STANDS[1] + 100, face=1, pose="hold1", alpha=alpha)
    K.place(mel, t, x=MAT_X + 230, face=1, pose="hold", alpha=alpha)
    K.place(dan, t, x=S_STANDS[3] + 170, face=-1, pose="calm", alpha=alpha)
    return tai, mel, dan


def s01(K, sc):
    """Everything is ready on the training site, but each next step waits for one answer."""
    t0, t1 = sc["t0"], sc["t1"]
    K.day(0, DAYS["thu"], d=0.01)
    K.cam(0, 0.01, cx=SITE_X - 180, cy=560, z=1.0)
    K.place(K.rin, 0, alpha=0.0, x=SIDE_X + 60, face=-1)
    tai, mel, dan = team_on_site(K, 0, alpha=0.0)
    for a, dt in ((tai, 0.6), (mel, 1.0), (dan, 1.4)):
        a.key(dt, 1.8, alpha=1.0)
    tp = K.w("B001", "Панно")
    for i, p in enumerate(K.s_panels):
        K.place(p, 0, alpha=0.0, assemble=0.0, ox=p.tr.init["x"], oy=PANEL_Y - 200)
        p.key(tp - 1.2 + i * 0.25, 1.6, alpha=1.0, assemble=1.0)
    K.sfx(tp - 0.8, "shimmer", 0.6)
    tm = K.w("B001", "Материалы")
    K.label(tm, tm + 3.0, "материалы на месте", MAT_X, TABLE_TOP - 150, "small")
    tk = K.w("B001", "Команда")
    K.label(tk, tk + 3.0, "команда знает, что делать", S_STANDS[1] + 100, 330, "small")
    tai.key(tk, 0.6, pose="work")
    mel.key(tk + 0.3, 0.6, pose="lift")
    dan.key(tk + 0.5, 0.6, pose="present")
    ts = K.w("B001", "остановилось")
    for a, pz in ((tai, "hold1"), (mel, "hold"), (dan, "calm")):
        a.key(ts - 0.2, 0.9, pose=pz)
    K.headline(ts - 0.1, ts + 4.5, "Смена остановилась")
    K.sfx(ts, "dim", 0.5)
    tl = K.w("B001", "свет")
    K.label(tl - 0.2, tl + 3.0, "свет горит", S_STANDS[0] - 120, 300, "note")
    K.flow(30, tl - 0.3, tl + 0.8, (S_STANDS[0] - 400, 250), [(x, PANEL_Y) for x in S_STANDS] * 8, travel=0.8,
           stay=False, vanish_at_dst=True, seed=3, color=(1.0, 0.85, 0.5), size=0.7)
    ta = K.w("B001", "ответа")
    for i, a in enumerate((tai, mel, dan)):
        q = K.tmp("question", a.tr.at(ta)["x"], 380 if a is not tai else 330, ta - 0.3 + i * 0.3, t1 + 0.6, s=0.5,
                  layer=7)
    K.cam(ta - 0.4, 3.5, cx=SITE_X + 120, cy=560, z=1.0)
    tn = K.w("B001", "подсказывать")
    K.label(tn - 0.6, t1 + 0.5, "ждут ответа одного человека", SITE_DOOR_X - 60, 260, "small")


def s02(K, sc):
    """Rin behind the open door: «Спросим у Рина». Messages converge to him."""
    t0, t1 = sc["t0"], sc["t1"]
    rin, tai, mel, dan = K.rin, K.tai, K.p["mel"], K.p["dan"]
    K.cam(t0, 2.6, cx=SITE_DOOR_X + 40, cy=560, z=1.05)
    K.place(rin, t0, x=SIDE_X + 60, face=-1, pose="calm")
    rin.key(t0 + 0.2, 1.2, alpha=1.0)
    tq = K.w("B002", "Спросим")
    say(K, tq - 0.3, tq + 2.8, "«Спросим у Рина»", mel, dx=40)
    mel.key(tq - 0.4, 0.5, pose="point")
    for i, a in enumerate((tai, mel, dan)):
        st = a.tr.at(tq)
        msg(K, tq + 0.4 + i * 0.6, (st["x"], 420), (SIDE_X + 40, 520 - i * 30), d=1.5)
    tm = K.w("B002", "мастерства")
    rin.key(tm - 0.6, 0.8, pose="proud")
    K.sfx(tm, "lit", 0.4)
    tt = K.w("B002", "Теперь")
    rin.key(tt, 0.9, pose="tired")
    for i in range(5):
        a = (tai, mel, dan)[i % 3]
        st = a.tr.at(tt)
        msg(K, tt + 0.3 + i * 0.75, (st["x"], 430), (SIDE_X + 10 + (i % 3) * 40, 470 - i * 22), d=1.3, hold=2.5)
    K.flow(80, tt, K.w("B002", "решении", end=True), [(x, 430) for x in (S_STANDS[1] + 100, MAT_X + 230,
           S_STANDS[3] + 170)] * 30, (SIDE_X + 40, 560), travel=1.3, stay=False, vanish_at_dst=True, seed=5,
           color=(0.60, 0.85, 1.0), size=0.6, arc=-160)
    tg = K.w("B002", "главным")
    K.headline(tg - 0.2, t1 - 0.4, "Главный человек в каждом решении", style="small", y=1000)
    tu = K.w("B002", "успех")
    rin.key(tu - 0.5, 0.8, pose="proud")
    rin.key(t1 - 1.6, 1.0, pose="think")


def s03(K, sc):
    """Back three days: the week sheet; a fictional story; what keeps working without him?"""
    t0, t1 = sc["t0"], sc["t1"]
    K.board(t0 + 0.3, t1 - 0.4)
    K.st.look.key(t0 + 0.3, 0.01, tint=DAYS["mon"])
    for a in (K.rin, K.tai, K.p["mel"], K.p["dan"]):
        a.key(t0 + 0.3, 0.01, alpha=0.0)
    for p in K.s_panels:
        p.key(t0 + 0.3, 0.01, alpha=0.0)
    wk = K.tmp("week", BOARD_X, 470, t0 + 0.5, t1 - 1.0, s=1.0, layer=3)
    days = ("пн", "вт", "ср", "чт", "пт", "сб", "вс")
    for i, d in enumerate(days):
        K.label(t0 + 0.7 + i * 0.08, t1 - 1.0, d, BOARD_X - 420 + i * 140, 470, "small", size=30)
    hl = K.prop("cell_full", BOARD_X - 420 + 3 * 140, 470, s=0.95, layer=4, alpha=0.0, tint=(1.0, 0.75, 0.3, 0.8))
    tb = K.w("B003", "назад")
    hl.key(t0 + 1.0, 0.5, alpha=0.9)
    hl.key(tb - 0.8, 1.8, x=BOARD_X - 420)
    hl.key(t1 - 1.0, 0.5, alpha=0.0)
    hl.t_off = t1 + 1
    K.sfx(tb - 0.8, "whoosh", 0.5)
    K.headline(tb - 0.3, tb + 3.5, "Тремя днями раньше")
    tf = K.w("B003", "вымышленная")
    K.label(tf - 0.4, tf + 4.2, "Вымышленная история одной недели", BOARD_X, 660, "note")
    tw = K.w("B003", "волшебного")
    K.label(tw - 0.2, tw + 3.2, "без волшебного дохода без труда", BOARD_X, 730, "small")
    tq = K.w("B003", "неприятный")
    K.label(tq, t1 - 0.8, "Что продолжит работать,\nкогда он перестанет делать всё сам?", BOARD_X, 760, "label")


def s04(K, sc):
    """Monday. The main job in the garden of lights; a personal order after the shift (B004, B005)."""
    t0, t1 = sc["t0"], sc["t1"]
    rin = K.rin
    K.cut(t0 + 0.2, 1000, 560, 1.0, light=0.0)
    K.day(t0 + 0.2, DAYS["mon"], d=0.01)
    K.place(rin, t0 + 0.2, x=G_STANDS[1] - 120, face=1, alpha=1.0, pose="work")
    for p in K.g_panels:
        p.key(t0 + 0.2, 0.01, alpha=0.35)
    tg = K.w("B004", "саду")
    K.cam(tg - 0.5, 4.0, cx=1000, cy=540, z=0.92)
    K.headline(tg, tg + 3.6, "Понедельник", style="small")
    for i, w in enumerate(("Собирал", "проверял", "готовил")):
        tw = K.w("B004", w)
        p = K.g_panels[i + 1]
        if i == 0:
            p.key(tw - 0.3, 0.01, alpha=0.0, assemble=0.0, ox=G_STANDS[1], oy=PANEL_Y + 120)
            p.key(tw - 0.25, 1.8, alpha=1.0, assemble=1.0)
            K.sfx(tw, "shimmer", 0.5)
        else:
            p.key(tw - 0.3, 0.9, alpha=1.0)
            K.walk(rin, tw - 1.2, G_STANDS[i + 1] - 120, speed=150, pose_after="work")
    K.tmp("eye", G_STANDS[2], PANEL_Y - 140, K.w("B004", "проверял"), K.w("B004", "готовил"), s=0.6, layer=6)
    K.g_panels[0].key(K.w("B004", "встречам"), 0.9, alpha=1.0)
    to = K.w("B004", "обычная")
    K.headline(to - 0.2, to + 4.2, "Основная работа: понятные обязанности", style="small", y=1000)
    tpay = K.w("B004", "оплату")
    K.tmp("note", G_STANDS[3] + 170, 470, tpay - 0.2, tpay + 3.2, s=0.8, layer=6)
    K.label(tpay, tpay + 3.0, "оплата", G_STANDS[3] + 170, 410, "small", size=26)
    rin.key(tpay, 0.6, pose="calm")
    tn = K.w("B004", "навыки")
    for i, a in enumerate(K.small[:2]):
        K.walker(a, tn - 0.6 + i * 1.2, -200 + i * 2400, 1100, speed=110, alpha=0.7)
    K.label(tn, tn + 3.6, "навыки • знакомые • первые хорошие вещи", 1000, 260, "note")
    # B005: after the main shift — a direct order (darker evening light, the workroom)
    te = K.w("B005", "После")
    K.day(te - 0.5, DAYS["fri_eve"], d=2.0)
    K.cut(te + 0.4, ROOM_X + 150, 560, 1.0)
    K.place(rin, te + 0.4, x=ROOM_X - 330, face=1, pose="calm")
    K.place(K.order, te + 0.4, alpha=0.0)
    cl = K.p["client"]
    tz = K.w("B005", "заказчик")
    K.place(cl, te + 0.4, x=ROOM_DOOR_X + 80, face=-1, alpha=0.0)
    cl.key(tz - 0.8, 0.5, alpha=1.0)
    K.walk(cl, tz - 0.8, ROOM_X + 380, speed=200)
    msg(K, tz, (ROOM_X + 380, 420), (ROOM_X - 220, 520), d=1.0)
    K.headline(tz, tz + 3.5, "Личный заказ — напрямую", style="small")
    pan = K.prop("panel_a", ROOM_X, TABLE_TOP - 90, s=0.7, layer=4, alpha=0.0)
    tr = K.w("B005", "рисунок")
    pan.key(tr - 0.4, 0.6, alpha=1.0)
    pan.key(tr + 0.6, 1.2, shape="panel_c")
    rin.key(tr - 0.4, 0.6, pose="work")
    td = K.w("B005", "времени")
    msg(K, td - 0.4, (ROOM_X - 220, 440), (ROOM_X + 380, 430), d=0.9)
    tsb = K.w("B005", "собирал")
    K.label(tsb - 0.2, tsb + 3.4, "выбрать • договориться • собрать • привезти • проверить", ROOM_X + 60, 300, "small",
            size=28)
    K.walk(cl, tsb + 0.8, ROOM_DOOR_X + 160, speed=220)
    cl.key(tsb + 2.6, 0.5, alpha=0.0)
    tm = K.w("B005", "Денег")
    K.flow(40, tm - 0.2, tm + 2.0, (ROOM_DOOR_X, 600), (ROOM_X - 220, 680), travel=1.1, stay=False,
           vanish_at_dst=True, seed=9, color=(1.0, 0.78, 0.35), size=0.8, arc=-90)
    rin.key(tm, 0.6, pose="proud")
    tv = K.w("B005", "вопросы")
    for i in range(4):
        K.tmp("question", ROOM_X - 360 + i * 90, 380 - (i % 2) * 40, tv + i * 0.35, t1 - 0.4, s=0.4, layer=6)
    rin.key(tv + 0.6, 0.6, pose="tired")
    K.label(tv + 0.4, t1 - 0.4, "раньше — между несколькими людьми", ROOM_X - 220, 290, "note")
    tc = K.w("B005", "считал")
    K.label(tc, t1 - 0.3, "считал только поступление", ROOM_X + 300, 760, "small")
    pan.key(t1 - 0.6, 0.5, alpha=0.0)


def s05(K, sc):
    """Two plaques: «Работа» and «Своё дело». Rearranging them does not change the path of actions."""
    t0, t1 = sc["t0"], sc["t1"]
    rin = K.rin
    K.day(t0, DAYS["mon"], d=2.0)
    K.cam(t0, 2.0, cx=ROOM_X, cy=600, z=1.25)
    p1, p2 = K.plaque1, K.plaque2
    xa, xb = ROOM_X - 100, ROOM_X + 100
    y = TABLE_TOP - 26
    K.place(rin, t0, x=ROOM_X - 330, face=1, pose="reach")
    for p, x in ((p1, xa), (p2, xb)):
        K.place(p, t0, x=x, y=y, alpha=0.0)
        p.key(t0 + 0.4, 0.8, alpha=1.0)
    tw1 = K.w("B006", "Работа")
    tw2 = K.w("B006", "дело")
    tp = K.w("B006", "переносил")
    t_end = K.E("B007") + 0.3
    swaps = [tp, tp + 2.6]
    # swap twice; the words travel with their plaques (hidden only while a plaque is moving)
    for k, ta in enumerate(swaps):
        p1.key(ta, 1.0, x=xb if k == 0 else xa)
        p2.key(ta, 1.0, x=xa if k == 0 else xb)
        K.sfx(ta, "paper", 0.5)
    for word, t_on, xs in (("Работа", tw1 - 0.3, (xa, xb, xa)), ("Своё дело", tw2 - 0.3, (xb, xa, xb))):
        bounds = [t_on, swaps[0], swaps[0] + 1.0, swaps[1], swaps[1] + 1.0, t_end]
        for k in range(3):
            a, b = bounds[2 * k], bounds[2 * k + 1]
            if b - a > 0.3:
                K.label(a, b, word, xs[k], y - 8, "small", size=26, fade=0.25)
    rin.key(tp - 0.2, 0.5, pose="work")
    tn = K.w("B006", "никогда")
    K.headline(tn - 0.5, t1 + 0.3, "Выбрать навсегда?")
    rin.key(tn, 0.7, pose="think")
    tu = K.w("B006", "уходить")
    K.tmp("arrow", ROOM_X + 400, 470, tu - 0.2, tu + 2.0, s=0.8, layer=5)
    to = K.w("B006", "оставаться")
    K.tmp("arrow", ROOM_X - 420, 470, to - 0.2, to + 2.0, s=0.8, layer=5, rot=180)
    K.label(K.w("B006", "упустил") - 0.2, t1, "«главная возможность»?", ROOM_X, 360, "note")


def s06(K, sc):
    """Behind each plaque several concrete duties open up."""
    t0, t1 = sc["t0"], sc["t1"]
    rin = K.rin
    K.cam(t0, 1.6, cx=ROOM_X + 10, cy=540, z=1.05)
    tb = K.w("B007", "большой")
    K.headline(tb - 0.4, tb + 3.2, "Слишком большая задача для двух табличек", style="small")
    xa, xb = ROOM_X - 100, ROOM_X + 100
    items = [("зарплата", "развиваться", ROOM_X + 380, 300, "понятная оплата ≠\nостановка развития"),
             ("Прямой", "владельцем", ROOM_X + 380, 420, "прямой заказ ≠\nсвободный владелец"),
             ("вывеска", "вечером", ROOM_X + 380, 540, "вывеска не считает\nвечерней работы")]
    for i, (w0, w1, x, y, lab) in enumerate(items):
        ta = K.w("B007", w0)
        K.label(ta, t1 - 0.5, lab, x, y, "small", size=26)
        K.flow(14, ta - 0.4, ta + 0.2, ((xa if i == 0 else xb), TABLE_TOP - 40), (x, y), travel=0.7, stay=False,
               vanish_at_dst=True, seed=20 + i, color=(0.8, 0.85, 1.0), size=0.6)
    tc = K.w("B007", "конкретные")
    K.label(tc - 0.2, t1 - 0.5, "как устроены его конкретные дни?", ROOM_X, 640, "label", size=34)
    rin.key(tc, 0.6, pose="tilt")
    tn = K.w("B007", "название")
    K.headline(tn - 0.2, t1 - 0.2, "Что придётся делать?", y=1000)
    rin.key(tn, 0.6, pose="point_up")


def s07(K, sc):
    """Someone else's neat site in a frame; the unseen work outside it. The same questions repeat (B008, B009)."""
    t0, t1 = sc["t0"], sc["t1"]
    rin = K.rin
    for p in (K.plaque1, K.plaque2):
        p.key(t0 + 0.2, 0.6, alpha=0.0)
    K.cam(t0, 1.6, cx=ROOM_X - 120, cy=520, z=1.0)
    K.window.key(t0, 0.8, alpha=0.08)
    K.window.key(K.E("B008") + 0.4, 0.8, alpha=0.8)
    K.walk(K.rin, t0 + 0.2, ROOM_X + 90, pose_after="calm")
    fr = K.tmp("photo_frame", ROOM_X - 420, 400, K.w("B008", "руководителем") - 0.6, K.E("B008") + 0.4, s=0.95,
               layer=5)
    K.headline(K.w("B008", "сравнение") - 0.3, K.w("B008", "сравнение") + 3.0, "Сравнение с другими", style="small")
    K.label(K.w("B008", "руководителем"), K.E("B008") + 0.4, "«руководитель»", ROOM_X - 420, 230, "small")
    hid = [("сообщения", "ответы после закрытия", ROOM_X - 760, 610), ("стоит", "оплата команды", ROOM_X - 420, 640),
           ("исправляет", "ошибка на месте", ROOM_X - 100, 610)]
    for wd, lab, x, y in hid:
        tw = K.w("B008", wd)
        K.label(tw - 0.2, K.E("B008") + 0.4, lab, x, y, "note", size=24, alpha=0.75)
    K.headline(K.w("B008", "картинке") - 0.2, K.E("B008") + 0.4, "Что остаётся за кадром?", y=1000)
    rin.key(K.w("B008", "сомнениями"), 0.7, pose="tired")
    for i in range(5):
        K.tmp("question", ROOM_X + 40 + (i % 3) * 70, 400 - i * 22, K.w("B008", "сомнениями") + i * 0.25,
              K.E("B008") + 0.4, s=0.35, layer=6)
    K.label(K.w("B008", "опаздывает") - 0.6, K.E("B008") + 0.4, "«опаздываю»", ROOM_X + 110, 270, "cite")
    # B009: waiting for certainty — the same notes come back
    tw = K.w("B009", "уверенности")
    K.cam(tw - 0.6, 2.0, cx=ROOM_X + 40, cy=560, z=1.15)
    rin.key(tw - 0.4, 0.7, pose="write")
    K.headline(tw - 0.2, tw + 3.2, "Подождать уверенности", style="small")
    notes = []
    for i in range(3):
        n = K.prop("note", ROOM_X - 60 + i * 80, TABLE_TOP - 30, s=0.7, layer=5, alpha=0.0)
        notes.append(n)
    tq = K.w("B009", "повторялись")
    for k in range(3):
        for i, n in enumerate(notes):
            ta = tq - 0.6 + k * 1.6 + i * 0.3
            n.key(ta, 0.4, alpha=1.0, y=TABLE_TOP - 30 - k * 4)
            n.key(ta + 1.0, 0.4, alpha=0.25)
    K.label(tq, tq + 4.6, "те же вопросы • без новых сведений", ROOM_X + 40, 560, "small")
    for n in notes:
        n.key(K.E("B009") - 0.6, 0.5, alpha=0.0)
    tv = K.w("B009", "выбором")
    K.headline(tv - 1.0, t1 - 0.2, "Ожидание — тоже выбор", y=1000)
    rin.key(tv, 0.6, pose="think")


def s08(K, sc):
    """The plaques set aside; one real order sheet at the centre of the table."""
    t0, t1 = sc["t0"], sc["t1"]
    rin = K.rin
    K.cam(t0, 1.6, cx=ROOM_X, cy=600, z=1.3)
    K.walk(rin, t0, ROOM_X - 330, pose_after="calm")
    K.turn(rin, t0 + 3.6, 1)
    for p, x in ((K.plaque1, ROOM_X - 150), (K.plaque2, ROOM_X + 150)):
        p.key(t0, 0.01, x=x, y=TABLE_TOP - 26)
        p.key(t0 + 0.1, 0.6, alpha=0.6)
    to = K.w("B010", "Отложил")
    K.plaque1.key(to, 0.9, x=ROOM_X - 115, y=TABLE_TOP - 22, alpha=0.3)
    K.plaque2.key(to, 0.9, x=ROOM_X + 115, y=TABLE_TOP - 22, alpha=0.3)
    K.sfx(to, "paper", 0.5)
    rin.key(to - 0.2, 0.6, pose="reach")
    tl = K.w("B010", "лист")
    K.place(K.order, t0, x=ROOM_X, y=TABLE_TOP - 70, s=0.5, alpha=0.0, assemble=0.0, ox=ROOM_X, oy=TABLE_TOP - 300)
    K.order.key(tl - 0.4, 1.0, alpha=1.0, assemble=1.0)
    K.headline(tl - 0.2, t1 - 0.3, "Посмотреть один заказ")
    tp = K.w("B010", "путь")
    K.label(tp - 0.2, tp + 4.0, "от первого сообщения до последней проверки", ROOM_X, 380, "small", size=28)
    rin.key(tp, 0.6, pose="work")
    for wd, lab, x in (("пять", "не лучшие пять минут", ROOM_X - 260), ("тяжёлую", "не самая тяжёлая", ROOM_X + 260)):
        tw = K.w("B010", wd)
        K.label(tw - 0.2, tw + 2.6, lab, x, 470, "note", size=24)
    tc = K.w("B010", "целиком")
    K.label(tc - 0.3, t1 - 0.3, "обычная работа целиком", ROOM_X, 470, "small")
    for p in (K.plaque1, K.plaque2):
        p.key(t1 - 0.6, 0.5, alpha=0.0)
    rin.key(K.w("B010", "уменьшился"), 0.7, pose="calm")


def s09(K, sc):
    """Seven steps of one order, Rin's palm on every step; more orders repeat the whole line (B011, B012)."""
    t0, t1 = sc["t0"], sc["t1"]
    K.day(t0, DAYS["tue"], d=2.0)
    K.board(t0 + 0.3, t1 - 0.3, back=(ROOM_X, 600, 1.15))
    K.headline(t0 + 0.6, K.w("B011", "отметок") + 1.0, "Вторник. Путь одного заказа", style="small")
    Y = 430
    ch = K.tmp("chain7", BOARD_X, Y, t0 + 0.5, t1 - 0.6, layer=3)
    for i, s in enumerate(STEPS):
        tw = K.w("B011", s.capitalize() if i else "Запрос")
        K.label(tw - 0.2, t1 - 0.6, s, BOARD_X - 450 + i * 150, Y + 62, "small", size=24)
    tpalm = K.w("B011", "ладони")
    for i in range(7):
        K.tmp("palm", BOARD_X - 450 + i * 150, Y - 78, tpalm + i * 0.22, t1 - 0.6, s=1.0, layer=5,
              tint=(0.10, 0.75, 0.45, 0.7))
    K.sfx(tpalm, "ticks10", 0.5)
    K.headline(K.w("B011", "семь") - 0.2, K.E("B011") + 0.2, "Семь шагов — семь отметок Рина", y=1000)
    K.label(K.w("B011", "голове") - 0.2, K.E("B011") + 0.2, "всё — в одной голове", BOARD_X, 620, "note")
    # B012: more orders — the whole line repeats with his hours
    tr = K.w("B012", "несколько")
    for k in range(2):
        y2 = Y + 210 + k * 130
        K.tmp("chain7", BOARD_X, y2, tr + 0.4 + k * 1.2, t1 - 0.6, s=1.0, layer=3, alpha=0.75)
        for i in range(7):
            K.tmp("palm", BOARD_X - 450 + i * 150, y2 - 52, tr + 0.8 + k * 1.2 + i * 0.12, t1 - 0.6, s=0.7,
                  layer=5, tint=(0.10, 0.75, 0.45, 0.7))
    th = K.w("B012", "часов")
    K.label(th - 0.3, t1 - 0.6, "больше поступлений = больше его часов", BOARD_X + 520, 300, "small", size=28)
    td = K.w("B012", "достойно")
    K.label(td - 0.4, td + 3.0, "так работает многое полезное", BOARD_X - 520, 300, "note")
    tz = K.w("B012", "независимой")
    K.headline(tz - 0.3, t1 - 0.6, "«Независимо от меня»? Пока — полностью от него", y=1000, style="small")


def s10(K, sc):
    """Three different ways of working on one baseline, without a ladder of status."""
    t0, t1 = sc["t0"], sc["t1"]
    rin = K.rin
    K.board(t0 + 0.3, t1 - 0.3, back=(980, 560, 1.0))
    base = K.tmp("baseline", BOARD_X, 790, t0 + 0.4, t1 - 0.3, s=0.85, layer=3)
    cols = [("любит", "делать вещь\nот начала до конца", BOARD_X - 380), ("стабильная", "стабильная роль\nв команде", BOARD_X),
            ("организовывать", "организовывать\nобщий процесс", BOARD_X + 380)]
    for i, (wd, lab, x) in enumerate(cols):
        tw = K.w("B013", wd)
        K.tmp("column", x, 590, tw - 0.4, t1 - 0.3, s=0.9, layer=3)
        K.label(tw, t1 - 0.3, lab, x, 560, "small", size=26)
    K.headline(K.w("B013", "неправильной") - 0.4, K.w("B013", "неправильной") + 3.0, "Не «правильная» и «неправильная»",
               style="small")
    K.headline(K.w("B013", "обязательства") - 0.3, t1 - 0.2, "Разные обязательства")
    K.label(K.w("B013", "неудобные") - 0.6, t1 - 0.3, "неудобные части тоже кому-то достаются", BOARD_X, 880, "note")


def s11(K, sc):
    """Rin shows Tai the movements; she repeats. The paid agreement stays visible."""
    t0, t1 = sc["t0"], sc["t1"]
    rin, tai = K.rin, K.tai
    K.cut(t0 + 0.3, 980, 560, 1.0)
    K.place(rin, t0 + 0.3, x=G_STANDS[1] - 110, face=1, pose="calm", alpha=1.0)
    for p in K.g_panels:
        p.key(t0 + 0.3, 0.01, alpha=1.0)
    K.g_panels[2].key(t0 + 0.3, 0.01, alpha=0.0)
    tz = K.w("B014", "позвал")
    K.place(tai, t0 + 0.3, x=2200, face=-1, alpha=0.0, pose="stand")
    tai.key(tz - 0.6, 0.6, alpha=1.0)
    K.walk(tai, tz - 0.6, G_STANDS[2] + 150, speed=260, pose_after="stand")
    rin.key(tz, 0.6, pose="gesture")
    tu = K.w("B014", "умела")
    K.label(tu - 0.2, tu + 2.6, "Тая уже умеет собирать панно", G_STANDS[2], 260, "small")
    td = K.w("B014", "оплаченном")
    K.label(td, t1 + 0.6, "небольшой оплаченный\nучасток работы", G_STANDS[0] - 130, 430, "small", size=24)
    tk = K.w("B014", "крепления")
    rin.key(tk - 0.3, 0.6, pose="point")
    K.tmp("frame_empty", G_STANDS[2], PANEL_Y, tk - 0.2, K.w("B014", "повторила") + 0.2, s=1.0, layer=3)
    to = K.w("B014", "образец")
    K.tmp("panel_b", G_STANDS[1] - 260, 600, to - 0.3, t1 - 0.4, s=0.55, layer=5)
    tr = K.w("B014", "повторила")
    tai.key(tr - 0.3, 0.6, pose="work", face=-1)
    K.g_panels[2].key(tr - 0.1, 0.01, alpha=0.0, assemble=0.0, ox=G_STANDS[2] + 100, oy=PANEL_Y + 140, shape="panel_c")
    K.g_panels[2].key(tr, 1.6, alpha=1.0, assemble=1.0)
    K.sfx(tr + 0.2, "shimmer", 0.5)
    tre = K.w("B014", "облегчение")
    rin.key(tre - 0.2, 0.8, pose="rest")
    K.headline(K.w("B014", "передать") - 0.3, K.w("B014", "Но") + 0.3, "Движение передано", style="label")
    tb = K.w("B014", "Но")
    K.label(tb + 0.3, t1 - 0.2, "сведения для решения — ещё нет", G_STANDS[2], 260, "small")
    tai.key(tb + 0.6, 0.6, pose="tilt")


def s12(K, sc):
    """Tai's questions; every answer points back to Rin."""
    t0, t1 = sc["t0"], sc["t1"]
    rin, tai = K.rin, K.tai
    K.cam(t0, 1.4, cx=1060, cy=560, z=1.08)
    ts = K.w("B015", "поменять")
    tai.key(ts - 0.5, 0.6, pose="gesture", face=-1)
    K.tmp("swap", (G_STANDS[2] + G_STANDS[3]) / 2, PANEL_Y - 140, ts - 0.2, ts + 4.0, s=0.9, layer=6)
    K.label(K.w("B015", "уже") - 0.4, K.w("B015", "уже") + 2.6, "проход уже?", (G_STANDS[2] + G_STANDS[3]) / 2, 820,
            "note")
    ta = K.w("B015", "разберёмся")
    say(K, ta - 1.2, ta + 2.2, "«На месте разберёмся»", rin)
    rin.key(ta - 1.2, 0.6, pose="palms")
    tq = K.w("B015", "подтверждает")
    say(K, tq - 1.0, tq + 2.4, "кто подтверждает изменение?", tai, style="note")
    K.tmp("question", G_STANDS[2] + 150, 300, tq - 0.6, tq + 2.4, s=0.6, layer=7)
    tn = K.w("B015", "напиши")
    say(K, tn - 0.5, tn + 2.6, "«Просто напиши мне»", rin)
    for i in range(3):
        K.flow(10, tn + i * 0.5, tn + 0.5 + i * 0.5, (G_STANDS[2] + 150, 420), (G_STANDS[1] - 110, 560), travel=1.0,
               stay=False, vanish_at_dst=True, seed=40 + i, color=(0.6, 0.85, 1.0), size=0.7, arc=-120)
    tl = K.w("B015", "листе")
    sh = K.tmp("sheet", 1660, 520, tl - 0.4, t1 - 0.2, s=0.95, layer=6)
    K.label(tl, t1 - 0.2, "Рин\nТая", 1640, 470, "small", size=30)
    tr = K.w("B015", "дороги")
    K.tmp("arrow", 1660, 640, tr - 0.2, t1 - 0.2, s=0.6, layer=7, rot=200)
    K.tmp("arrow", 1680, 600, tr + 0.2, t1 - 0.2, s=0.6, layer=7, rot=215)
    K.headline(tr - 0.4, t1 - 0.2, "А кто решает?")
    rin.key(K.w("B015", "заметил"), 0.6, pose="calm")
    tai.key(K.w("B015", "заметил"), 0.6, pose="stand")


def s13(K, sc):
    """Evening money; the sum splits; two observations and one sharper question (B016, B017)."""
    t0, t1 = sc["t0"], sc["t1"]
    rin, tai = K.rin, K.tai
    K.day(t0, DAYS["fri_eve"], d=2.0)
    K.cut(t0 + 0.4, ROOM_X + 60, 560, 1.0)
    tai.key(t0 + 0.4, 0.01, alpha=0.0)
    K.place(rin, t0 + 0.4, x=ROOM_X - 300, face=1, pose="calm")
    K.place(K.order, t0 + 0.4, alpha=0.0)
    tm = K.w("B016", "деньги")
    K.flow(40, tm - 0.4, tm + 1.6, (ROOM_DOOR_X, 500), (ROOM_X - 300, 690), travel=1.1, stay=False,
           vanish_at_dst=True, seed=51, color=(1.0, 0.78, 0.35), size=0.8, arc=-80)
    tz = K.w("B016", "заработок")
    xe, full = bars(K, K.E("B016") + 0.2, [(100, (1.0, 0.72, 0.30), "вся сумма", tz - 0.6)], ROOM_X - 200, 420, u=6.0)
    K.label(tz - 0.2, tz + 2.4, "«заработок»?", ROOM_X + 100, 330, "cite")
    rin.key(tz - 0.6, 0.6, pose="proud")
    tv = K.w("B016", "вспомнил")
    rin.key(tv, 0.7, pose="think")
    parts = [(28, (0.45, 0.55, 1.0), "материалы", K.w("B016", "материалы")),
             (14, (0.62, 0.42, 0.95), "поездка", K.w("B016", "поездку")),
             (34, (0.15, 0.75, 0.62), "оплата Тае", K.w("B016", "Тае")),
             (24, (0.95, 0.80, 0.55), "?", K.w("B016", "аккуратно"))]
    bars(K, K.E("B016") + 0.2, parts, ROOM_X - 200, 520, u=6.0, lab_size=22)
    tp = K.w("B016", "прошли")
    K.headline(tp - 0.4, K.E("B016") + 0.2, "Прошло через руки ≠ осталось после работы", style="small", y=1000)
    # B017: two observations
    to = K.w("B017", "наблюдения")
    rin.key(to - 0.4, 0.6, pose="write")
    obs = [("Заказ", "1. заказ зависит от меня чаще"), ("сумма", "2. сумма рассказывает меньше")]
    for i, (wd, lab) in enumerate(obs):
        tw = K.w("B017", wd)
        K.tmp("note", ROOM_X + 40, 400 + i * 120, tw - 0.4, t1 - 0.4, s=0.9, layer=5)
        K.label(tw, t1 - 0.4, lab, ROOM_X + 260, 400 + i * 120, "small", size=28, align="left")
    tn = K.w("B017", "немедленно")
    K.label(tn - 0.2, tn + 3.0, "не требует увольняться", ROOM_X + 260, 640, "note", align="left")
    tq = K.w("B017", "сформулировать")
    K.headline(tq - 0.3, t1 - 0.3, "Что зависит только от меня?")
    K.label(K.w("B017", "процесс") - 0.4, t1 - 0.3, "небольшой оплаченный процесс:\nдругой делает свою часть без непрерывной помощи?",
            ROOM_X + 100, 800, "small", size=28)
    rin.key(K.w("B017", "процесс"), 0.6, pose="think")


SCENES = {"S01": s01, "S02": s02, "S03": s03, "S04": s04, "S05": s05, "S06": s06, "S07": s07, "S08": s08,
          "S09": s09, "S10": s10, "S11": s11, "S12": s12, "S13": s13}
