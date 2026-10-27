"""A04–A05: Wednesday's limited invitation and the written expectation; Thursday: an instruction without
the right to decide (S14–S24)."""
from kit import (BOARD_X, DAYS, GROUND, MAT_X, PANEL_Y, ROOM_DOOR_X, ROOM_X, S_STANDS, SAI_X, SIDE_X, SITE_DOOR_X,
                 SITE_X, STAND_Y, TABLE_TOP, msg, say)


def s14(K, sc):
    """Sai's message from another working circle; three training shifts as empty future cells (B018, B019)."""
    t0, t1 = sc["t0"], sc["t1"]
    rin, sai = K.rin, K.sai
    K.day(t0, DAYS["wed"], d=2.5)
    K.cut(t0 + 0.3, SAI_X + 160, 560, 1.0)
    K.place(sai, t0 + 0.3, x=SAI_X - 60, face=1, pose="write", alpha=1.0)
    K.place(rin, t0 + 0.3, alpha=0.0)
    ph = K.tmp("phone", SAI_X + 10, 610, t0 + 0.6, K.w("B018", "координировал") + 3.0, s=0.7, layer=7)
    K.headline(t0 + 0.8, t0 + 4.2, "Среда", style="small")
    K.label(K.w("B018", "Сай") - 0.2, K.w("B018", "Сай") + 3.2, "Сай", SAI_X - 60, 420, "small")
    tg = K.w("B018", "встречу")
    K.label(tg - 0.6, tg + 3.0, "несколько лет назад — одна общая городская встреча", SAI_X + 160, 260, "note")
    tk = K.w("B018", "координировал")
    sai.key(tk - 0.3, 0.6, pose="present")
    K.label(tk, tk + 3.0, "другая площадка", SAI_X + 240, 300, "small")
    # the message reaches Rin in his workroom
    tw = K.w("B018", "видел")
    K.cut(tw - 0.2, ROOM_X - 60, 560, 1.0)
    K.place(rin, tw - 0.2, x=ROOM_X - 330, face=1, pose="calm", alpha=1.0)
    sai.key(tw - 0.2, 0.01, alpha=0.0)
    msg(K, tw, (ROOM_DOOR_X, 380), (ROOM_X - 300, 520), d=1.4, s=1.0, hold=1.8)
    rin.key(tw + 1.6, 0.6, pose="hold1")
    ts = K.w("B018", "смены")
    cells = K.tmp("cells3", ROOM_X + 160, 400, ts - 0.6, K.E("B019") - 0.3, s=0.9, layer=5)
    for i in range(3):
        K.label(ts - 0.2, K.E("B019") - 0.3, f"смена {i + 1}", ROOM_X + 160 + (i - 1) * 162, 400, "small", size=24)
    K.headline(ts - 0.4, ts + 4.0, "Три учебные смены")
    tn = K.w("B018", "должности")
    K.label(tn - 0.2, tn + 3.4, "не должность • не «будущее состояние»", ROOM_X + 160, 520, "note")
    tp = K.w("B018", "объяснять")
    K.label(tp - 1.6, K.E("B018") + 0.5, "умеет готовить панно + готов учиться объяснять", ROOM_X + 160, 290, "small",
            size=28)
    # B019: the invitation seems to be for someone he has not yet become
    tr = K.w("B019", "стал")
    rin.key(tr - 0.6, 0.7, pose="tired")
    K.label(tr - 0.4, tr + 3.2, "«руководитель»?", ROOM_X - 300, 290, "cite")
    tl = K.w("B019", "позже")
    say(K, tl - 1.0, tl + 2.0, "«Может быть, позже»", rin)
    tu = K.w("B019", "уверенность")
    K.label(tu - 0.4, tu + 3.0, "врождённая уверенность — не вопрос", ROOM_X + 160, 520, "note")
    to = K.w("B019", "ограниченную")
    rin.key(to, 0.7, pose="tilt")
    cells.key(to, 0.6, tint=(0.4, 1.0, 0.75, 0.5))
    K.headline(to - 0.2, t1 - 0.2, "Ограниченная работа: видно конкретные навыки", style="small", y=1000)


def s15(K, sc):
    """Sai shows real sheets of his site; Rin honestly describes the same problem (B020, B021)."""
    t0, t1 = sc["t0"], sc["t1"]
    rin, sai = K.rin, K.sai
    K.cut(t0 + 0.3, SAI_X + 330, 560, 1.0)
    K.place(sai, t0 + 0.3, x=SAI_X + 530, face=-1, pose="calm", alpha=1.0)
    K.place(rin, t0 + 0.3, x=SAI_X + 10, face=1, pose="calm", alpha=1.0)
    for p in K.sai_panels:
        p.key(t0 + 0.3, 0.01, alpha=0.9)
    td = K.w("B020", "описать")
    rin.key(td - 0.4, 0.6, pose="gesture")
    K.headline(td - 0.2, td + 3.6, "Что вы уже делали?")
    ts = K.w("B020", "сборщики")
    sai.key(ts - 0.4, 0.6, pose="present")
    for i, k in enumerate(("far1", "far2")):
        a = K.small[i]
        K.place(a, ts - 0.4, x=SAI_X + 760 + i * 90, face=-1, alpha=0.0, pose="work")
        a.key(ts - 0.3, 0.5, alpha=0.75)
        a.key(K.E("B020") - 0.4, 0.5, alpha=0.0)
    tk = K.w("B020", "координатора")
    for i in range(3):
        msg(K, tk - 0.3 + i * 0.5, (SAI_X + 770 + (i % 2) * 90, 640), (SAI_X + 540, 470), d=0.9, s=0.6)
    K.label(tk - 0.4, tk + 3.2, "знали движения — ждали при каждом изменении", SAI_X + 330, 280, "small")
    tz = K.w("B020", "знакомый")
    rin.key(tz, 0.6, pose="nod")
    te = K.w("B020", "эксперта")
    K.label(te - 0.4, te + 2.6, "не изображать эксперта", SAI_X + 10, 330, "note")
    th = K.w("B020", "похожее")
    say(K, th - 1.0, th + 2.2, "«У меня похожее»", rin)
    rin.key(th - 1.0, 0.6, pose="palms")
    sai.key(th, 0.6, pose="nod")
    tc = K.w("B020", "проверить")
    K.headline(tc - 0.8, K.E("B020") + 0.4, "Работа, которую можно проверить вместе", style="small", y=1000)
    # B021: records of shifts; not a sage who knows everything
    tz2 = K.w("B021", "записи")
    for i in range(2):
        K.tmp("shiftsheet", SAI_X + 680 + i * 120, 420, tz2 - 0.6 + i * 0.3, t1 - 0.4, s=0.45, layer=7)
    sai.key(tz2 - 0.6, 0.6, pose="present")
    for i, (wd, lab) in enumerate((("жить", "как жить"), ("вкладывать", "куда вкладывать деньги"),
                                    ("навсегда", "какую профессию навсегда"))):
        tw = K.w("B021", wd)
        K.label(tw - 0.2, K.w("B021", "задавал") + 0.6, lab, SAI_X + 280, 250 + i * 46, "note", size=24)
        K.tmp("strike", SAI_X + 280, 252 + i * 46, tw + 0.4, K.w("B021", "задавал") + 0.6, s=0.55, layer=8,
              sy=0.6)
    tq = K.w("B021", "действительно")
    K.label(tq - 0.4, t1 - 0.4, "вопросы о том, что человек действительно делал", SAI_X + 330, 250, "small")
    tm = K.w("B021", "мудрого")
    K.label(tm - 0.2, t1 - 0.4, "не нужен один мудрый человек на все ответы", SAI_X + 330, 860, "note")
    rin.key(tm, 0.6, pose="calm")


def s16(K, sc):
    """Three conditions on the margin and the expectation written before the check (B022, B023)."""
    t0, t1 = sc["t0"], sc["t1"]
    rin, sai = K.rin, K.sai
    K.cut(t0 + 0.3, ROOM_X + 120, 560, 1.05)
    sai.key(t0 + 0.3, 0.01, alpha=0.0)
    K.place(rin, t0 + 0.3, x=ROOM_X - 330, face=1, pose="write", alpha=1.0)
    K.place(K.order, t0 + 0.3, x=ROOM_X - 60, y=TABLE_TOP - 70, s=0.5, alpha=1.0)
    K.headline(t0 + 0.6, K.w("B022", "условия") + 2.4, "Три условия — заранее", style="small")
    conds = [("решить", "1. Тая знает, что может решить сама"),
             ("Оплата", "2. Оплата включает реальную работу команды"),
             ("остановиться", "3. Понятно, когда остановиться и позвать ответственного")]
    for i, (wd, lab) in enumerate(conds):
        tw = K.w("B022", wd)
        K.label(tw - 0.6, K.E("B023") + 0.3, lab, ROOM_X + 60, 300 + i * 56, "small", size=28, align="left")
        K.tmp("check", ROOM_X + 30, 300 + i * 56, tw - 0.5, K.E("B023") + 0.3, s=0.5, layer=6,
              tint=(0.75, 0.8, 1.0, 0.7))
        K.sfx(tw - 0.5, "paper", 0.4)
    tk = K.w("B022", "красивые")
    K.label(tk - 0.3, tk + 3.0, "иначе красивые слова ничего не доказывают", ROOM_X + 220, 500, "note")
    # B023: the expectation
    te = K.w("B023", "ожидание")
    K.tmp("column", ROOM_X + 260, 575, te - 0.4, t1 - 0.3, s=1.0, sx=2.5, sy=0.36, layer=4,
          tint=(1.0, 0.85, 0.5, 0.6))
    K.label(te, t1 - 0.3, "Ожидание: после объяснения Тая сделает\nобычную перестановку без сообщения мне",
            ROOM_X + 260, 575, "small", size=26)
    K.headline(te + 0.2, t1 - 0.2, "Ожидание — до результата")
    tp = K.w("B023", "почему")
    K.label(tp - 0.2, tp + 3.0, "если нет — узнать почему", ROOM_X + 260, 700, "note")
    th = K.w("B023", "привычку")
    rin.key(th - 0.4, 0.6, pose="think")
    say(K, th + 0.4, th + 4.6, "«я так и предполагал»", rin, style="note")
    tsv = K.w("B023", "свериться")
    K.label(tsv - 0.4, t1 - 0.3, "записано заранее", ROOM_X + 260, 470, "cite")
    rin.key(tsv, 0.6, pose="calm")


def s17(K, sc):
    """Two working circles linked by one acquaintance — no net of endless benefits."""
    t0, t1 = sc["t0"], sc["t1"]
    K.board(t0 + 0.3, t1 - 0.3)
    c2 = K.tmp("circles2", BOARD_X, 470, t0 + 0.5, t1 - 0.6, s=1.0, layer=3)
    K.label(t0 + 0.8, t1 - 0.6, "круг Рина", BOARD_X - 260, 470, "small", size=28)
    tc = K.w("B024", "другом")
    K.label(tc - 0.3, t1 - 0.6, "другой\nрабочий круг", BOARD_X + 260, 470, "small", size=28)
    K.headline(tc - 0.2, tc + 4.0, "Другой рабочий круг")
    tn = K.w("B024", "тайного")
    K.label(tn - 0.2, tn + 3.2, "нет тайного правила «знакомые обязаны»", BOARD_X, 760, "note")
    tu = K.w("B024", "уточнил")
    K.label(tu - 0.4, t1 - 0.6, "реальное предложение → уточнить условия", BOARD_X, 760, "small")
    tb = K.w("B024", "Близкие")
    K.label(tb - 0.2, t1 - 0.6, "близкие — поддержка", BOARD_X - 260, 690, "note")
    tz = K.w("B024", "сведения")
    K.label(tz - 0.4, t1 - 0.6, "новый контакт — новые сведения", BOARD_X + 260, 690, "note")


def s18(K, sc):
    """Thursday's short training shift without visitors; everyone knows the conditions; Rin is near."""
    t0, t1 = sc["t0"], sc["t1"]
    rin, tai, mel, dan = K.rin, K.tai, K.p["mel"], K.p["dan"]
    K.cut(t0 + 0.3, SITE_X - 100, 560, 1.0)
    K.place(rin, t0 + 0.3, x=S_STANDS[0] - 150, face=1, pose="gesture", alpha=1.0)
    K.place(tai, t0 + 0.3, x=S_STANDS[1] + 100, face=-1, pose="stand", alpha=1.0)
    K.place(mel, t0 + 0.3, x=MAT_X + 230, face=1, pose="calm", alpha=1.0)
    K.place(dan, t0 + 0.3, x=S_STANDS[3] + 170, face=-1, pose="calm", alpha=1.0)
    for p in K.s_panels:
        p.key(t0 + 0.3, 0.01, alpha=0.0)
    K.headline(t0 + 0.6, K.w("B025", "посетителей") + 3.0, "Учебная площадка")
    tv = K.w("B025", "посетителей")
    K.label(tv - 0.3, tv + 3.6, "без посетителей", SITE_X - 100, 260, "small")
    tz = K.w("B025", "знали")
    K.label(tz - 0.2, tz + 3.6, "все знают: это проверка передачи работы", SITE_X - 100, 310, "note")
    for a in (tai, mel, dan):
        a.key(tz, 0.6, pose="nod")
    tr = K.w("B025", "рядом")
    K.walk(rin, tr - 0.5, SIDE_X + 60, speed=170, pose_after="calm")
    K.cam(tr - 0.5, 4.0, cx=SITE_X + 220, cy=560, z=1.0)
    K.label(tr + 1.0, t1 - 0.3, "рядом и отвечает за происходящее", SIDE_X + 40, 300, "small")
    te = K.w("B025", "экзамен")
    K.headline(te - 0.6, t1 - 0.2, "Наблюдение, а не экзамен со спрятанными условиями", style="small", y=1000)
    K.turn(rin, t1 - 0.4, -1)


def s19(K, sc):
    """Another arrangement of stands; Tai stops; several clear requests wait for an answer (B026, B027)."""
    t0, t1 = sc["t0"], sc["t1"]
    rin, tai, mel, dan = K.rin, K.tai, K.p["mel"], K.p["dan"]
    K.day(t0, DAYS["thu"], d=2.0)
    K.cam(t0, 2.0, cx=SITE_X - 150, cy=560, z=1.0)
    K.headline(t0 + 0.6, t0 + 4.0, "Четверг", style="small")
    tb = K.w("B026", "быстро")
    tai.key(tb - 1.0, 0.6, pose="work", face=-1)
    for i in (0, 1):
        p = K.s_panels[i]
        K.place(p, tb - 1.2, alpha=0.0, assemble=0.0, ox=S_STANDS[i] + 60, oy=PANEL_Y + 160)
        p.key(tb - 1.0 + i * 0.6, 1.4, alpha=1.0, assemble=1.0)
    K.sfx(tb - 0.6, "shimmer", 0.5)
    tc = K.w("B026", "иначе")
    for i, dx in ((2, -30), (3, 40)):
        K.s_stands[i].key(tc - 0.4, 1.6, x=S_STANDS[i] + dx)
    K.label(tc - 0.2, tc + 3.4, "стойки стоят чуть иначе", S_STANDS[2] + 100, 260, "small")
    for i, k in ((2, "c"), (3, "d")):
        p = K.s_panels[i]
        K.place(p, tc, x=S_STANDS[i] + (-30 if i == 2 else 40), alpha=0.0, shape="panel_" + k)
        p.key(tc + 0.4, 0.8, alpha=1.0)
    tsw = K.w("B026", "местами")
    K.tmp("swap", (S_STANDS[2] + S_STANDS[3]) / 2 + 5, PANEL_Y - 150, tsw - 0.4, K.E("B026") + 0.6, s=0.9, layer=6)
    tr = K.w("B026", "менялись")
    K.label(tr - 0.6, tr + 3.0, "рисунок и число панно — те же", S_STANDS[2] + 100, 300, "note")
    ti = K.w("B026", "инструкции")
    sh = K.tmp("sheet", S_STANDS[1] + 100, 420, ti - 0.5, K.E("B026") + 0.4, s=0.5, layer=8)
    K.tmp("question", S_STANDS[1] + 170, 360, ti + 0.3, K.E("B026") + 0.4, s=0.5, layer=8)
    K.label(ti, K.E("B026") + 0.4, "разрешено ли решить самой?", S_STANDS[1] + 100, 290, "small")
    tst = K.w("B026", "остановилась")
    tai.key(tst - 0.3, 0.6, pose="hold1")
    tn = K.w("B026", "написала")
    msg(K, tn - 0.2, (S_STANDS[1] + 110, 420), (SITE_DOOR_X + 40, 480), d=1.4)
    # B027: the others wait too — no breakage, no danger
    tf = K.w("B027", "рамку")
    fr = K.prop("frame_empty", 0, 0, s=0.7, layer=7, alpha=0.0)
    K.hold(fr, mel, tf - 1.6, "hand_f", dx=10, dy=-30, d=0.01)
    fr.key(tf - 1.5, 0.5, alpha=1.0)
    mel.key(tf - 1.6, 0.6, pose="hold")
    K.tmp("question", MAT_X + 230, 420, tf - 0.4, K.E("B027") - 0.4, s=0.5, layer=7)
    fr.key(K.E("B027") + 0.2, 0.5, alpha=0.0)
    tp = K.w("B027", "подтверждения")
    dan.key(tp - 0.5, 0.6, pose="tilt")
    K.tmp("question", S_STANDS[3] + 170, 420, tp - 0.3, K.E("B027") - 0.4, s=0.5, layer=7)
    for i, a in enumerate((mel, dan)):
        msg(K, tp + 0.6 + i * 0.7, (a.tr.at(tp)["x"], 440), (SITE_DOOR_X + 40, 500 - i * 30), d=1.4)
    tz = K.w("B027", "разбил")
    K.label(tz - 0.2, tz + 3.2, "ничего не разбито, ничего опасного", SITE_X - 150, 260, "note")
    tu = K.w("B027", "научили")
    K.headline(tu - 0.6, K.E("B027") + 0.6, "Умеют. Не уполномочены.")
    tv = K.w("B027", "вернулись")
    K.cam(tv - 0.4, 2.4, cx=SITE_X + 120, cy=560, z=1.0)
    K.label(tv, t1 - 0.2, "тот самый четверг", SITE_X + 120, 230, "cite")


def s20(K, sc):
    """Rin's hand reaches to answer from behind the door — and stops."""
    t0, t1 = sc["t0"], sc["t1"]
    rin = K.rin
    K.cam(t0, 1.8, cx=SITE_DOOR_X + 120, cy=600, z=1.3)
    K.place(rin, t0, x=SIDE_X + 60, face=-1, pose="calm", alpha=1.0)
    td = K.w("B028", "двери")
    rin.key(td, 0.6, pose="tired")
    for i in range(3):
        msg(K, td + 0.3 + i * 0.6, (SITE_DOOR_X - 300, 380 + i * 30), (SIDE_X + 30, 500 - i * 26), d=1.0, s=0.7)
    tz = K.w("B028", "закрыть")
    rin.key(tz - 0.2, 0.8, pose="reach")
    K.headline(tz - 0.4, tz + 3.0, "Ответить сразу?", style="small")
    for i, (wd, lab) in enumerate((("перестановку", "подсказать перестановку"), ("место", "указать место"),
                                    ("готовность", "проверить лично"))):
        tw = K.w("B028", wd)
        K.label(tw - 0.3, K.w("B028", "заработает") + 0.4, lab, SITE_DOOR_X - 250, 300 + i * 50, "small", size=26,
                alpha=0.8)
    tw2 = K.w("B028", "заработает")
    K.label(tw2 - 0.2, tw2 + 2.2, "смена снова пойдёт…", SITE_DOOR_X - 250, 460, "note")
    tp = K.w("B028", "проверка")
    rin.key(tp - 0.4, 0.7, pose="reach_stop")
    K.sfx(tp - 0.2, "fixed", 0.5)
    K.headline(tp - 0.2, t1 - 0.3, "Подсказка меняет проверку")
    tc = K.w("B028", "соседней")
    K.label(tc - 0.4, t1 - 0.3, "руководить из соседней комнаты = снова участник каждого решения", SITE_DOOR_X - 60, 860,
            "note")
    rin.key(t1 - 1.6, 0.8, pose="think")


def s21(K, sc):
    """«Я знаю, как собрать. Я не знаю, что мне разрешено менять». Expectation and result side by side."""
    t0, t1 = sc["t0"], sc["t1"]
    rin, tai = K.rin, K.tai
    K.cam(t0, 1.6, cx=SITE_DOOR_X - 20, cy=560, z=1.05)
    K.walk(rin, t0, SITE_DOOR_X + 130, speed=150, pose_after="calm")
    K.turn(rin, t0 + 2.4, -1)
    K.walk(tai, t0 + 0.3, SITE_DOOR_X - 250, speed=200, pose_after="stand")
    K.turn(tai, t0 + 2.4, 1)
    tq = K.w("B029", "сказала")
    say(K, tq, K.w("B029", "менять", end=True) + 1.2, "«Я знаю, как собрать.\nЯ не знаю, что мне разрешено менять»", tai,
        style="label", size=34)
    tai.key(tq, 0.6, pose="palms")
    tu = K.w("B029", "упрёк")
    rin.key(tu - 0.4, 0.6, pose="tired")
    K.label(tu - 0.2, tu + 2.4, "упрёк?", SITE_DOOR_X + 130, 330, "note")
    tv = K.w("B029", "Вместо")
    rin.key(tv, 0.7, pose="gesture")
    tr = K.w("B029", "повторил")
    say(K, tr + 0.6, K.w("B029", "решения", end=True) + 1.0,
        "«Ты умеешь делать работу,\nно не можешь понять границу\nсамостоятельного решения?»", rin, style="small", size=28)
    tk = K.w("B029", "кивнула")
    tai.key(tk - 0.2, 0.6, pose="nod")
    K.headline(tk + 0.3, K.E("B029") + 0.4, "Не спор о внимательности — проверка понимания", style="small", y=1000)
    # B030: expectation vs result
    te = K.w("B030", "записи")
    K.cam(te - 0.4, 1.6, cx=SITE_DOOR_X - 60, cy=520, z=1.05)
    rin.key(te, 0.6, pose="write")
    tai.key(te, 0.6, pose="stand")
    K.tmp("column", SITE_DOOR_X - 330, 300, te - 0.2, t1 - 0.3, s=1.0, sx=1.25, sy=0.33, layer=6,
          tint=(1.0, 0.85, 0.5, 0.6))
    K.label(te + 0.2, t1 - 0.3, "ожидание:\nпройдёт без сообщения", SITE_DOOR_X - 330, 300, "small", size=24)
    tn = K.w("B030", "прошла")
    K.tmp("column", SITE_DOOR_X + 20, 300, tn - 0.4, t1 - 0.3, s=1.0, sx=1.25, sy=0.33, layer=6,
          tint=(1.0, 0.6, 0.55, 0.6))
    K.label(tn - 0.2, t1 - 0.3, "результат:\nне прошла", SITE_DOOR_X + 20, 300, "small", size=24)
    K.tmp("cross", SITE_DOOR_X + 150, 260, tn, t1 - 0.3, s=0.6, layer=7)
    K.headline(tn + 0.2, t1 - 0.3, "Ожидание не сбылось")
    tm = K.w("B030", "могли")
    K.label(tm - 0.4, tm + 3.4, "«все могли бы догадаться»", SITE_DOOR_X - 150, 430, "cite")
    K.tmp("strike", SITE_DOOR_X - 150, 432, tm + 1.0, tm + 3.4, s=0.6, layer=8, sy=0.6)
    tb = K.w("B030", "плохим")
    K.label(tb - 0.4, t1 - 0.3, "не про «плохого» Рина • не про неспособность Таи", SITE_DOOR_X - 150, 860, "note")
    tg = K.w("B030", "подготовке")
    K.label(tg - 1.2, t1 - 0.3, "чего не хватило подготовке?", SITE_DOOR_X - 150, 430, "small")


def s22(K, sc):
    """Three separate lines: what happened, possible cause, what to change."""
    t0, t1 = sc["t0"], sc["t1"]
    K.board(t0 + 0.3, t1 - 0.3, back=(ROOM_X, 560, 1.05))
    K.headline(t0 + 0.6, t1 - 0.4, "Сначала событие")
    heads = [("произошло", "Что произошло", 300), ("причины", "Возможная причина", 560), ("изменения", "Что изменить", 780)]
    for wd, lab, y in heads:
        tw = K.w("B031", wd)
        K.label(tw - 0.4, t1 - 0.6, lab, BOARD_X - 520, y, "small", align="left", size=30)
    for i, (wd, lab) in enumerate((("Стойки", "стойки расположены иначе"),
                                    ("Разрешение", "разрешение на перестановку не определено"),
                                    ("ждала", "работа ждала ответа"))):
        tw = K.w("B031", wd)
        K.label(tw - 0.2, t1 - 0.6, lab, BOARD_X - 150, 296 + i * 44, "note", align="left", size=26)
    for i, (wd, lab) in enumerate((("невнимателен", "«кто-то невнимателен»"),
                                    ("контролируешь", "«ты слишком всё контролируешь»"))):
        tw = K.w("B031", wd)
        x = BOARD_X + 20 + i * 380
        K.label(tw - 0.4, K.w("B031", "Рину") - 0.2, lab, x, 556, "cite", size=26)
        K.tmp("strike", x, 558, tw + 0.6, K.w("B031", "Рину") - 0.2, s=0.6, layer=6, sy=0.6)
    tz = K.w("B031", "увидеть")
    K.label(tz - 0.8, t1 - 0.6, "изменения, которые видно в работе", BOARD_X + 200, 776, "note", size=26)


def s23(K, sc):
    """Two explanations; the second is easier to check. Rin notices his own gain from being needed."""
    t0, t1 = sc["t0"], sc["t1"]
    rin = K.rin
    K.day(t0, DAYS["fri_eve"], d=3.0, k=0.2)
    K.place(rin, t0 - 0.2, x=ROOM_X - 330, face=1, pose="think", alpha=1.0)
    K.place(K.order, t0 - 0.2, alpha=0.0)
    K.cam(t0, 1.4, cx=ROOM_X + 120, cy=540, z=1.0)
    K.headline(t0 + 0.4, K.w("B032", "проще") + 2.0, "Как проверить причину?")
    for i, (wd, lab, x) in enumerate((("Первое", "1. Тае нужно чаще\nпроявлять инициативу", ROOM_X + 10),
                                      ("Второе", "2. Рин просит инициативу,\nно держит все разрешения", ROOM_X + 430))):
        tw = K.w("B032", wd)
        K.label(tw, K.E("B032") + 0.3, lab, x, 400, "label", size=32)
    tp = K.w("B032", "проще")
    K.tmp("check", ROOM_X + 430, 505, tp - 0.2, K.E("B032") + 0.3, s=1.2, layer=6)
    K.label(tp, K.E("B032") + 0.3, "можно проверить:\nграницы + похожая ситуация", ROOM_X + 430, 590, "small", size=26)
    ts = K.w("B032", "смелости")
    K.label(ts - 0.2, K.E("B032") + 0.3, "«будь смелее» —\nбез полезного конца", ROOM_X + 10, 590, "note", size=26)
    rin.key(ts, 0.6, pose="tilt")
    # B033: his own pleasure of being needed
    tv = K.w("B033", "важность")
    K.cam(tv - 1.0, 2.0, cx=ROOM_X - 140, cy=560, z=1.2)
    K.flow(60, tv - 0.8, tv + 2.4, (ROOM_X + 400, 300), (ROOM_X - 330, 640), travel=1.2, stay=False,
           vanish_at_dst=True, seed=61, color=(1.0, 0.80, 0.40), size=0.7, arc=-80)
    rin.key(tv - 0.4, 0.8, pose="proud")
    K.label(tv - 0.2, tv + 3.6, "приятно, когда спрашивают меня", ROOM_X - 330, 320, "cite")
    tn = K.w("B033", "нельзя")
    K.label(tn - 0.6, tn + 2.6, "«без меня ничего нельзя»", ROOM_X + 60, 400, "note")
    th = K.w("B033", "честная")
    rin.key(th - 0.4, 0.8, pose="calm")
    K.headline(th - 0.2, t1 - 0.3, "Ещё одна честная причина — учесть", style="small", y=1000)
    tt = K.w("B033", "поручать")
    K.label(tt - 0.4, t1 - 0.3, "это его работа, не задача Таи", ROOM_X + 60, 400, "note")


def s24(K, sc):
    """The training shift is stopped; the time is paid; the questions stay in the record."""
    t0, t1 = sc["t0"], sc["t1"]
    rin, tai, mel, dan = K.rin, K.tai, K.p["mel"], K.p["dan"]
    K.cut(t0 + 0.3, SITE_X + 60, 560, 1.0)
    K.place(rin, t0 + 0.3, x=SITE_DOOR_X - 120, face=-1, pose="calm", alpha=1.0)
    K.place(tai, t0 + 0.3, x=S_STANDS[1] + 100, face=1, pose="stand", alpha=1.0)
    K.place(mel, t0 + 0.3, x=MAT_X + 230, face=1, pose="calm", alpha=1.0)
    K.place(dan, t0 + 0.3, x=S_STANDS[3] + 160, face=-1, pose="calm", alpha=1.0)
    ts = K.w("B034", "остановили")
    K.headline(ts - 0.2, ts + 3.6, "Смену остановили — честно", style="small")
    K.sfx(ts, "dim", 0.4)
    tr = K.w("B034", "результатом")
    K.headline(tr - 0.8, t1 - 0.3, "Вопросы — тоже результат")
    sh = K.tmp("shiftsheet", SITE_X - 620, 330, tr - 1.0, t1 - 0.3, s=0.55, layer=6)
    tz = K.w("B034", "Заплатили")
    for i, a in enumerate((tai, mel, dan)):
        K.flow(18, tz - 0.2 + i * 0.4, tz + 0.6 + i * 0.4, (SITE_DOOR_X - 120, 640), (a.tr.at(tz)["x"], 620),
               travel=1.0, stay=False, vanish_at_dst=True, seed=70 + i, color=(1.0, 0.78, 0.35), size=0.7, arc=-120)
    K.label(tz, tz + 3.6, "отработанное время оплачено", SITE_X - 300, 260, "small")
    for a in (tai, mel, dan):
        a.key(tz + 1.0, 0.6, pose="nod")
    tl = K.w("B034", "список")
    K.label(tl - 0.2, t1 - 0.3, "список затруднений • что меняем", SITE_X - 620, 450, "small", size=26)
    tn = K.w("B034", "независимую")
    K.label(tn - 0.4, tn + 2.8, "не независимая команда за один день", SITE_X - 300, 260, "note")
    ti = K.w("B034", "инструкцию")
    K.label(ti - 0.8, t1 - 0.3, "подробная инструкция ≠ готовая организация работы", SITE_X + 60, 860, "small")
    rin.key(ti, 0.6, pose="nod")


SCENES = {"S14": s14, "S15": s15, "S16": s16, "S17": s17, "S18": s18, "S19": s19, "S20": s20, "S21": s21,
          "S22": s22, "S23": s23, "S24": s24}
