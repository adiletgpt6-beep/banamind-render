"""A06–A07: Friday — the right to decide and the right to stop; what other people's independence costs
(S25–S35)."""
from kit import (BOARD_X, DAYS, GROUND, MAT_X, PANEL_Y, ROOM_X, S_STANDS, SIDE_X, SITE_DOOR_X, SITE_X, TABLE_TOP,
                 bars, msg, say)

ROW = (S_STANDS[0], S_STANDS[1], S_STANDS[2] - 30, S_STANDS[3] + 40)   # stand x after Thursday's shift
BOUND_X = (ROW[1] + ROW[2]) / 2                                        # the agreed row: panels 2 and 3
U = 7.0                                                                # px per unit of the example


def site_reset(K, t, rin_x=None):
    rin, tai = K.rin, K.tai
    K.place(rin, t, x=rin_x or S_STANDS[0] - 170, face=1, pose="calm", alpha=1.0)
    K.place(tai, t, x=ROW[2] + 130, face=-1, pose="stand", alpha=1.0)
    for a in (K.p["mel"], K.p["dan"], K.sai):
        a.key(t, 0.01, alpha=0.0)
    for i, (p, k) in enumerate(zip(K.s_panels, "abcd")):
        K.place(p, t, x=ROW[i], y=PANEL_Y, alpha=1.0, shape="panel_" + k)


def s25(K, sc):
    """Two panels inside the agreed row: an allowed swap and the mark of the responsible person."""
    t0, t1 = sc["t0"], sc["t1"]
    rin, tai = K.rin, K.tai
    K.day(t0, DAYS["fri"], d=2.0)
    K.cut(t0 + 0.3, SITE_X - 140, 560, 1.0)
    site_reset(K, t0 + 0.3)
    K.headline(t0 + 0.6, t0 + 4.0, "Пятница", style="small")
    tr = K.w("B035", "переписывать")
    K.label(tr - 0.3, tr + 3.0, "не переписывать всё с начала", SITE_X - 140, 250, "note")
    to = K.w("B035", "получалась")
    for i in (0, 1):
        K.tmp("check", ROW[i], PANEL_Y - 120, to - 0.6 + i * 0.3, K.E("B035") + 0.4, s=0.7, layer=6)
    td = K.w("B035", "допустимое")
    bd = K.tmp("boundary", BOUND_X, PANEL_Y + 10, td - 0.4, K.T.scene["S29"]["t1"] - 0.6, s=0.68, sy=0.78, layer=1)
    K.label(td, K.E("B035") + 0.4, "допустимое изменение", BOUND_X, 300, "small")
    ts = K.w("B035", "местами")
    p1, p2 = K.s_panels[1], K.s_panels[2]
    p1.key(ts - 0.2, 1.4, x=ROW[2], y=PANEL_Y - 18)
    p2.key(ts - 0.2, 1.4, x=ROW[1], y=PANEL_Y + 18)
    p1.key(ts + 1.3, 0.4, y=PANEL_Y)
    p2.key(ts + 1.3, 0.4, y=PANEL_Y)
    K.sfx(ts, "whoosh", 0.4)
    tai.key(ts - 0.4, 0.6, pose="work", face=-1)
    tk = K.w("B035", "рисунок")
    K.label(tk - 0.2, K.E("B035") + 0.4, "рисунок и число деталей — те же", BOUND_X, 860, "small", size=28)
    tz = K.w("B035", "записать")
    sh = K.prop("shiftsheet", 0, 0, s=0.32, layer=8, alpha=0.0)
    K.hold(sh, tai, tz - 1.2, "hand_f", dx=24, dy=-30, d=0.01)
    sh.key(tz - 1.1, 0.5, alpha=1.0)
    tai.key(tz - 1.2, 0.6, pose="write")
    K.tmp("mark", ROW[2] + 160, 600, tz, t1 + 0.5, s=0.5, layer=9)
    K.headline(K.w("B035", "сама") - 0.4, t1 - 0.2, "Можно решить самой")
    sh.key(t1 - 0.4, 0.4, alpha=0.0)
    K.label(K.w("B035", "ловить") - 0.4, t1 - 0.2, "без сообщения Рину", ROW[2] + 160, 250, "note")
    rin.key(K.w("B035", "ловить"), 0.6, pose="nod")


def s26(K, sc):
    """Changing the number of panels leaves the agreed row: stop and ask the responsible person."""
    t0, t1 = sc["t0"], sc["t1"]
    rin, tai = K.rin, K.tai
    K.cam(t0, 1.6, cx=SITE_X + 120, cy=560, z=1.0)
    tq = K.w("B036", "количества")
    ghosts = []
    for i in range(2):
        g = K.tmp("frame_empty", ROW[3] + 200 + i * 150, PANEL_Y + 20, tq - 0.2 + i * 0.3, t1 - 0.4, s=0.9,
                  layer=3, alpha=0.55, tint=(1.0, 0.7, 0.4, 0.5))
        ghosts.append(g)
    K.label(tq, t1 - 0.4, "+ панно?", ROW[3] + 275, 300, "label", size=34)
    for i, (wd, lab) in enumerate((("комплект", "комплект"), ("цену", "цена"), ("договорённость", "договорённость с площадкой"))):
        tw = K.w("B036", wd)
        K.label(tw - 0.2, K.E("B036") - 0.2, lab, ROW[3] + 275, 380 + i * 40, "note", size=24)
    tst = K.w("B036", "остановиться")
    K.tmp("stop_palm", ROW[2] + 160, 340, tst - 0.4, t1 - 0.4, s=0.8, layer=7)
    tai.key(tst - 0.3, 0.6, pose="reach_stop")
    K.sfx(tst - 0.2, "fixed", 0.5)
    to = K.w("B036", "ответственному")
    K.tmp("person_icon", SITE_DOOR_X - 20, 330, to - 0.4, t1 - 0.4, s=0.9, layer=6)
    K.label(to - 0.2, t1 - 0.4, "ответственный", SITE_DOOR_X - 20, 410, "small", size=24)
    K.tmp("arrow", (ROW[2] + 160 + SITE_DOOR_X - 20) / 2, 335, to - 0.2, t1 - 0.4, s=1.1, layer=6)
    K.headline(to - 0.6, t1 - 0.3, "Здесь нужно согласование")
    tg = K.w("B036", "Граница")
    K.label(tg - 0.2, tg + 3.6, "граница → действовать увереннее", BOUND_X, 860, "small")
    tr1 = K.w("B036", "известное")
    K.label(tr1 - 0.4, t1 - 0.4, "право сделать известное изменение", BOUND_X - 150, 960, "note", size=26)
    tr2 = K.w("B036", "продолжать")
    K.label(tr2 - 0.6, t1 - 0.4, "право не продолжать без условий", BOUND_X + 400, 960, "note", size=26)


def s27(K, sc):
    """Tai explains the rule in her own words and applies it to another pair without hints (B037, B038)."""
    t0, t1 = sc["t0"], sc["t1"]
    rin, tai = K.rin, K.tai
    K.cam(t0, 1.6, cx=SITE_X - 140, cy=560, z=1.0)
    tp = K.w("B037", "последовательность")
    rin.key(tp - 0.4, 0.6, pose="point")
    tm = K.w("B037", "выполнила")
    tai.key(tm - 0.3, 0.6, pose="work")
    ts = K.w("B037", "словами")
    say(K, ts - 0.4, ts + 3.2, "объясняет своими словами", tai, style="note")
    tai.key(ts - 0.4, 0.6, pose="gesture")
    tw = K.w("B037", "прочтения")
    sh = K.tmp("sheet", SITE_X - 900 + 260, 390, tw - 1.4, K.E("B037") + 0.3, s=0.75, layer=6)
    K.tmp("hline", SITE_X - 640, 400, tw - 0.6, tw + 1.6, s=0.25, layer=7, tint=(1.0, 0.6, 0.4, 0.9))
    K.label(tw - 0.4, tw + 1.6, "два прочтения", SITE_X - 640, 290, "note", size=24)
    tf = K.w("B037", "формулировку")
    K.tmp("hline", SITE_X - 640, 400, tf - 0.4, K.E("B037") + 0.3, s=0.25, layer=7, tint=(0.4, 1.0, 0.6, 0.9))
    K.label(tf - 0.2, K.E("B037") + 0.3, "формулировка исправлена", SITE_X - 640, 290, "small", size=24)
    rin.key(tf - 0.4, 0.6, pose="write")
    K.headline(K.w("B037", "повторил") - 0.4, K.E("B037") + 0.3, "Повторить движение ≠ понять условие", style="small",
               y=1000)
    # B038: another pair in the same allowed row
    to = K.w("B038", "другую")
    K.headline(to - 0.4, t1 - 0.3, "Другая пара. То же условие.")
    rin.key(to - 0.6, 0.6, pose="stand")
    K.walk(rin, to - 0.6, S_STANDS[0] - 260, speed=140, pose_after="stand")
    K.turn(rin, to + 1.0, 1)
    p1, p2 = K.s_panels[1], K.s_panels[2]
    tsv = K.w("B038", "сверилась")
    tai.key(tsv - 0.3, 0.6, pose="think")
    tx = K.w("B038", "перестановку")
    # the second pair: Thursday's arrangement is restored and the pattern pair differs (c ↔ b)
    p1.key(tx - 0.3, 1.3, x=ROW[1], y=PANEL_Y - 18)
    p2.key(tx - 0.3, 1.3, x=ROW[2], y=PANEL_Y + 18)
    p1.key(tx + 1.0, 0.4, y=PANEL_Y)
    p2.key(tx + 1.0, 0.4, y=PANEL_Y)
    tai.key(tx - 0.4, 0.6, pose="work")
    K.sfx(tx, "whoosh", 0.4)
    tmk = K.w("B038", "отметила")
    tai.key(tmk - 0.2, 0.6, pose="write")
    K.tmp("mark", ROW[2] + 160, 600, tmk, t1 - 0.2, s=0.5, layer=9)
    tn = K.w("B038", "взглядом")
    K.label(tn - 0.6, tn + 3.0, "Рин не подсказывает — даже взглядом", S_STANDS[0] - 260, 300, "note")
    tz = K.w("B038", "понимание")
    K.label(tz - 0.4, t1 - 0.3, "проверка понимания правила, а не памяти о картинке", BOUND_X, 860, "small")


def s28(K, sc):
    """A named checker compares number, pattern and marks; Rin watches the whole order (B039, B040)."""
    t0, t1 = sc["t0"], sc["t1"]
    rin, tai, sai, ola = K.rin, K.tai, K.sai, K.p["ola"]
    mel, dan = K.p["mel"], K.p["dan"]
    K.cam(t0, 1.6, cx=SITE_X - 60, cy=560, z=1.0)
    ta = K.w("B039", "Сай")
    K.place(sai, t0, x=SITE_DOOR_X + 150, face=-1, alpha=0.0, pose="stand")
    sai.key(ta - 0.6, 0.6, alpha=1.0)
    K.walk(sai, ta - 0.6, SITE_DOOR_X - 100, speed=200, pose_after="gesture")
    K.place(ola, t0, x=MAT_X + 180, face=1, alpha=0.0, pose="calm")
    K.place(mel, t0, x=MAT_X + 60, face=1, alpha=0.0, pose="calm")
    ola.key(ta, 0.6, alpha=1.0)
    mel.key(ta, 0.6, alpha=1.0)
    K.label(ta + 0.6, ta + 4.0, "Как команда узнаёт, что участок готов?", SITE_X - 60, 250, "small")
    tk = K.w("B039", "понемногу")
    for i, a in enumerate((mel, ola, tai)):
        K.tmp("check", a.tr.at(tk)["x"], 360 if a is not tai else 300, tk - 0.4 + i * 0.25, tk + 3.2, s=0.45, layer=7)
    tr = K.w("B039", "Рином")
    K.tmp("check", rin.tr.at(tr)["x"], 420, tr - 0.4, tr + 3.0, s=1.1, layer=7)
    K.label(tr, tr + 3.0, "общий результат — за Рином", rin.tr.at(tr)["x"] + 40, 300, "note")
    tn = K.w("B039", "назначили")
    bd = K.prop("badge", 0, 0, s=0.8, layer=8, alpha=0.0)
    K.hold(bd, ola, tn - 0.2, "chest", dx=14, dy=0, d=0.01)
    bd.key(tn, 0.6, alpha=1.0)
    bd.t_off = K.T.scene["S28"]["t1"] + 1.0
    bd.key(t1 - 0.4, 0.4, alpha=0.0)
    K.walk(ola, tn, ROW[1] - 120, speed=200, pose_after="present")
    K.label(tn + 0.4, K.E("B039") + 0.4, "проверяющий: число • рисунок • отметки", ROW[1] - 120, 300, "small")
    tg = K.w("B039", "громкого")
    K.label(tg - 0.2, K.E("B039") + 0.4, "не самый громкий • не обязательно старший\nумеет проверять и согласился отвечать",
            SITE_X - 60, 860, "note", size=26)
    K.headline(K.w("B039", "отвечать") - 2.0, K.E("B039") + 0.6, "Кто проверяет результат?")
    # B040: Rin's responsibility stays; his participation changes
    tz = K.w("B040", "ответственность")
    K.cam(tz - 0.6, 1.6, cx=S_STANDS[0] + 100, cy=540, z=1.05)
    for i, (wd, lab) in enumerate((("условия", "определяет условия"), ("обучение", "готовит обучение"),
                                    ("сбой", "ищет, где процесс даёт сбой"), ("остановить", "может остановить работу"))):
        tw = K.w("B040", wd)
        K.label(tw - 0.3, K.w("B040", "Раньше") + 0.6, lab, S_STANDS[0] - 520, 300 + i * 44, "small", align="left",
                size=26)
    rin.key(tz, 0.6, pose="calm")
    tb = K.w("B040", "Раньше")
    K.flow(30, tb - 0.2, tb + 1.4, (rin.tr.at(tb)["x"], 640), [(x, PANEL_Y) for x in ROW], travel=0.8, stay=False,
           vanish_at_dst=True, seed=81, color=(0.35, 1.0, 0.65), size=0.8, arc=-80)
    K.label(tb, tb + 2.6, "раньше: лично двигал каждую часть", S_STANDS[0] + 100, 860, "note")
    tt = K.w("B040", "Теперь")
    for i, a in enumerate((tai, ola, mel)):
        K.flow(16, tt + i * 0.4, tt + 1.0 + i * 0.4, (rin.tr.at(tt)["x"] + 20, 560), (a.tr.at(tt)["x"], 380),
               travel=1.0, stay=False, vanish_at_dst=True, seed=90 + i, color=(0.70, 0.95, 1.0), size=0.7, arc=-120)
    K.label(tt + 0.2, t1 - 0.3, "теперь: чтобы другие понимали работу и пределы решения", S_STANDS[0] + 100, 860, "small")
    rin.key(tt, 0.6, pose="gesture")
    th = K.w("B040", "названия")
    K.headline(th - 0.6, t1 - 0.2, "Навык — через действия и обратную связь", style="small")
    sai.key(t1 - 0.5, 0.4, alpha=0.0)
    for a in (ola, mel):
        a.key(t1 - 0.5, 0.4, alpha=0.0)


def s29(K, sc):
    """«С этой перестановкой я справлюсь»: confidence grounded in one familiar situation."""
    t0, t1 = sc["t0"], sc["t1"]
    rin, tai = K.rin, K.tai
    K.day(t0, DAYS["fri_eve"], d=3.0)
    K.cam(t0, 1.6, cx=BOUND_X - 40, cy=560, z=1.15)
    K.place(rin, t0, x=S_STANDS[0] - 100, face=1, pose="calm")
    tq = K.w("B041", "сказала")
    say(K, tq, tq + 3.6, "«С этой перестановкой я справлюсь»", tai, style="label", size=34)
    tai.key(tq, 0.6, pose="present")
    tn = K.w("B041", "всём")
    K.label(tn - 0.4, tn + 3.2, "не «уверена во всём на свете»", BOUND_X - 40, 860, "note")
    to = K.w("B041", "одной")
    K.headline(to - 0.6, t1 - 0.3, "В этой задаче — умею")
    for i in range(2):
        K.tmp("check", ROW[1 + i], PANEL_Y - 130, to - 0.2 + i * 0.3, t1 - 0.4, s=0.6, layer=6)
    tr = K.w("B041", "похожее")
    rin.key(tr - 0.3, 0.6, pose="nod")
    K.label(tr, tr + 3.0, "и у Рина: увидели работу правила", S_STANDS[0] - 100, 300, "small")
    tg = K.w("B041", "готовности")
    K.label(tg - 0.6, tg + 2.8, "надёжнее, чем требовать полной готовности", BOUND_X - 40, 860, "note")
    te = K.w("B041", "опытом")
    K.label(te - 1.2, t1 - 0.3, "часть ответов заработана опытом", BOUND_X - 40, 860, "small")


def s30(K, sc):
    """The conditional calculation: 120 − 72 − 24 − 12 = 12 before the costs it does not contain."""
    t0, t1 = sc["t0"], sc["t1"]
    K.board(t0 + 0.3, t1)
    K.headline(t0 + 0.6, t1 - 0.3, "Условный расчёт: один комплект работ", style="small")
    X0 = BOARD_X - 120 * U / 2
    t120 = K.w("B042", "двадцать")
    end = K.T.scene["S31"]["t1"] - 0.2
    bars(K, end, [(120, (1.0, 0.70, 0.30), "поступление 120", t120 - 0.4)], X0, 300, u=U, h=1.6)
    parts = [(72, (0.15, 0.72, 0.62), "72", K.w("B042", "семьдесят")),
             (24, (0.45, 0.55, 1.0), "24", K.w("B042", "двадцать", occ=2)),
             (12, (0.62, 0.42, 0.95), "12", K.w("B042", "двенадцать", occ=1)),
             (12, (0.95, 0.80, 0.55), "12", K.w("B042", "Остаётся"))]
    K.parts = bars(K, end, parts, X0, 470, u=U, h=1.6, gap=0, lab_size=24)[1]
    x = X0
    for (v, _, _, tt), (name, y) in zip(parts, (("работа команды", 425), ("материалы", 425),
                                                 ("поездка и мелкие расходы", 390), ("остаток", 425))):
        K.label(tt + 0.1, end, name, x + v * U / 2, y, "note", size=22)
        x += v * U
    K.label(K.w("B042", "Остаётся"), end, "120 − 72 − 24 − 12 = 12", BOARD_X, 610, "numS", size=48)
    tz = K.w("B042", "затрат")
    K.label(tz - 0.3, end, "12 — до затрат, которых в этом расчёте нет", BOARD_X, 690, "small")
    tn = K.w("B042", "обещанный")
    K.label(tn - 0.6, t1 - 0.2, "условные единицы • не обещанный доход в реальном городе", BOARD_X, 950, "note")


def s31(K, sc):
    """Removing the team's pay is not honest; training gets its own line; Rin's work is not yet subtracted."""
    t0, t1 = sc["t0"], sc["t1"]
    X0 = BOARD_X - 120 * U / 2
    team, mats, trip, rest = K.parts
    K.headline(t0 + 0.2, K.E("B043") - 0.2, "Убрать оплату команды?", style="small")
    tu = K.w("B043", "убрать")
    team.key(tu - 0.2, 0.8, alpha=0.18)
    K.label(tu + 0.4, K.w("B043", "бесплатно") - 0.3, "«приятная сумма» — без людей?", X0 + 36 * U, 400, "cite", size=28)
    tb = K.w("B043", "бесплатно")
    team.key(tb - 0.4, 0.8, alpha=1.0)
    K.sfx(tb - 0.2, "fixed", 0.4)
    tz = K.w("B043", "заменит")
    team.key(tz - 0.2, 1.0, tint=(0.10, 0.80, 0.50, 1.0))
    K.label(tz + 0.4, K.E("B043") + 0.2, "= часы Рина и прежняя зависимость", X0 + 36 * U, 400, "small", size=28)
    for i in range(5):
        K.tmp("palm", X0 + 10 * U + i * 12 * U, 470, tz + 0.6 + i * 0.15, K.E("B043") + 0.2, s=0.5, layer=6,
              tint=(0.05, 0.6, 0.35, 0.7))
    tc = K.w("B043", "одновременно")
    K.headline(tc - 0.6, K.E("B043") + 0.2, "Нельзя считать труд людей бесплатным, а себя свободным", style="small",
               y=1000)
    team.key(K.E("B043") + 0.2, 0.8, tint=(0.15, 0.72, 0.62, 1.0))
    # B044: training gets its own line
    tt = K.w("B044", "обучения")
    K.tmp("bar", X0 + 20 * U, 820, tt - 0.4, t1 - 0.3, sx=40 * U / 100, sy=1.3, layer=4,
          tint=(0.75, 0.55, 1.0, 1.0))
    K.label(tt, t1 - 0.3, "обучение и проверка — отдельная строка", X0 + 40 * U + 40, 820, "small", size=26,
            align="left")
    tr = K.w("B044", "вычтена")
    K.tmp("question", X0 + 114 * U, 400, tr - 0.4, t1 - 0.3, s=0.5, layer=6)
    K.label(tr - 0.2, tr + 3.6, "работа Рина по обучению ещё не вычтена из 12", BOARD_X, 760, "note", size=26)
    tv = K.w("B044", "выгодными")
    K.label(tv - 0.4, tv + 3.0, "первые смены могут быть менее выгодными", BOARD_X, 760, "small", size=28)
    tn = K.w("B044", "нужно")
    K.label(tn - 0.2, tn + 2.6, "обучение не нужно? — пока нет", BOARD_X, 760, "cite")
    tc2 = K.w("B044", "цена")
    K.headline(tc2 - 0.4, t1 - 0.2, "Время людей стоит денег")
    K.label(tc2 + 0.4, t1 - 0.3, "будущий результат ≠ сегодняшняя прибыль", BOARD_X, 760, "small", size=28)


def s32(K, sc):
    """Two separate scenarios from the same base: +6 → 6; +12 → 0. Not sequential."""
    t0, t1 = sc["t0"], sc["t1"]
    K.cut(t0 + 0.3, BOARD_X, 540, 1.0, light=1.0)
    K.headline(t0 + 0.6, t1 - 0.3, "Два отдельных сценария")
    tq = K.w("B045", "шесть")
    xa, xb = BOARD_X - 430, BOARD_X + 430
    K.tmp("column", BOARD_X, 560, t0 + 0.6, t1 - 0.4, s=1.0, sx=0.02, sy=1.2, layer=3)
    u = 22.0
    for x, extra, rest, tw, tit in ((xa, 6, 6, tq, "вариант А"), (xb, 12, 0, K.w("B045", "другом"), "вариант Б")):
        K.label(tw - 0.6, t1 - 0.4, tit, x, 260, "label")
        K.label(tw - 0.4, t1 - 0.4, "база: 12", x - 6 * u - 60, 380, "small", size=26)
        b0 = K.tmp("bar", x, 380, tw - 0.4, t1 - 0.4, sx=12 * u / 100, sy=1.4, layer=4, tint=(0.95, 0.80, 0.55, 1.0))
        K.tmp("bar", x - 6 * u + extra * u / 2, 470, tw + 0.4, t1 - 0.4, sx=extra * u / 100, sy=1.4, layer=4,
              tint=(1.0, 0.55, 0.50, 1.0))
        K.label(tw + 0.4, t1 - 0.4, f"+{extra} расходов", x - 6 * u - 80, 470, "small", size=26)
        K.label(tw + 1.4, t1 - 0.4, f"12 − {extra} = {rest}", x, 580, "numS", size=48)
        # the remainder field: a filled bar for 6, an empty dashed field for 0 (no glow left from the base)
        if rest:
            K.tmp("bar", x - 6 * u + rest * u / 2, 650, tw + 1.6, t1 - 0.4, sx=rest * u / 100, sy=1.4, layer=4,
                  tint=(0.15, 0.72, 0.45, 1.0))
        else:
            K.tmp("boundary", x - 6 * u + 40, 650, tw + 1.6, t1 - 0.4, s=0.13, sy=0.7, layer=4)
        K.label(tw + 1.6, t1 - 0.4, "остаток", x + 6 * u + 70, 650, "note", size=24)
    K.label(K.w("B045", "отдельных") - 0.3, t1 - 0.4, "не складываются последовательно • оба от одной базы", BOARD_X, 730,
            "small")
    tp = K.w("B045", "предсказывал")
    K.label(tp - 0.4, tp + 3.0, "это не прогноз", BOARD_X, 790, "note")
    to = K.w("B045", "окупится")
    K.label(to - 0.6, t1 - 0.4, "«всё окупится»", BOARD_X, 790, "cite")
    K.tmp("strike", BOARD_X, 792, to + 0.4, t1 - 0.4, s=0.45, layer=6, sy=0.6)
    K.label(to + 0.8, t1 - 0.4, "вопрос можно рассмотреть по частям", BOARD_X, 870, "small")


def s33(K, sc):
    """Three allowed answers: change the volume, change the way, or decline an unsuitable option."""
    t0, t1 = sc["t0"], sc["t1"]
    rin = K.rin
    K.cut(t0 + 0.3, ROOM_X + 80, 560, 1.0)
    K.place(rin, t0 + 0.3, x=ROOM_X - 330, face=1, pose="think", alpha=1.0)
    K.tai.key(t0 + 0.3, 0.01, alpha=0.0)
    tk = K.w("B046", "кнопкой")
    K.label(tk - 0.4, tk + 3.0, "не кнопка для получения денег", ROOM_X + 160, 260, "cite")
    K.tmp("strike", ROOM_X + 160, 262, tk + 0.4, tk + 3.0, s=0.7, layer=6, sy=0.6)
    tl = K.w("B046", "люди")
    K.label(tl - 0.2, K.w("B046", "обязанности") + 0.8, "люди • подготовка • материалы • пределы • ответственность",
            ROOM_X + 160, 330, "small", size=28)
    K.headline(K.w("B046", "уменьшить") - 0.6, t1 - 0.2, "Можно пересмотреть")
    for i, (wd, lab) in enumerate((("уменьшить", "уменьшить объём"), ("пересмотреть", "пересмотреть способ"),
                                    ("подходит", "признать: вариант\nне подходит"))):
        tw = K.w("B046", wd)
        x = ROOM_X - 60 + i * 300
        K.tmp("column", x, 520, tw - 0.4, t1 - 0.3, s=0.7, sy=0.45, layer=4)
        K.label(tw, t1 - 0.3, lab, x, 510, "small", size=26)
        rin.key(tw, 0.5, pose="point" if i < 2 else "palms")
    tn = K.w("B046", "название")
    K.label(tn - 0.8, t1 - 0.3, "не защищать решение ради красивого названия", ROOM_X + 160, 860, "note")


def s34(K, sc):
    """Three working paths without a pedestal; age is not an expiry date (B047, B048)."""
    t0, t1 = sc["t0"], sc["t1"]
    K.board(t0 + 0.3, t1 - 0.3, back=(ROOM_X, 600, 1.15))
    K.tmp("baseline", BOARD_X, 800, t0 + 0.5, K.E("B047") + 0.3, s=0.85, layer=3)
    cols = [("основной", "основная работа", "понятная оплата\nучиться дальше", BOARD_X - 380),
            ("личных", "личные заказы", "самостоятельность\nучастие в каждом этапе", BOARD_X),
            ("командном", "командный процесс", "другие задачи\nдополнительные расходы", BOARD_X + 380)]
    for wd, head, body, x in cols:
        tw = K.w("B047", wd)
        K.tmp("column", x, 600, tw - 0.4, K.E("B047") + 0.3, s=0.9, layer=3)
        K.label(tw - 0.2, K.E("B047") + 0.3, head, x, 385, "small", size=30)
        K.label(tw + 0.4, K.E("B047") + 0.3, body, x, 580, "note", size=24)
    tn = K.w("B047", "колонка")
    K.headline(tn - 0.4, K.E("B047") + 0.3, "Ни одна колонка не лучше автоматически", style="small")
    to = K.w("B047", "обязательства")
    K.label(to - 0.4, K.E("B047") + 0.3, "какие обязательства готов взять сейчас?", BOARD_X, 900, "small")
    # B048: age is not an expiry date
    ta = K.w("B048", "Возраст")
    K.headline(ta - 0.2, t1 - 0.3, "Без срока годности")
    K.label(ta + 0.4, ta + 4.6, "возраст ≠ срок годности", BOARD_X, 420, "label", size=40)
    tc = K.w("B048", "цифре")
    K.label(tc - 0.6, tc + 3.0, "право учиться не определяется цифрой", BOARD_X, 520, "note")
    ts = K.w("B048", "небольшой")
    K.tmp("cells3", BOARD_X, 640, ts - 0.4, t1 - 0.4, s=0.9, layer=4)
    K.label(ts, t1 - 0.4, "небольшая договорённость сейчас + существующая работа", BOARD_X, 760, "small")
    tp = K.w("B048", "ошибкой")
    K.label(tp - 0.6, t1 - 0.4, "прошлое — не ошибка; к нему добавляется навык", BOARD_X, 840, "note")


def s35(K, sc):
    """Saturday's conditions are written before the trial and remain unchanged."""
    t0, t1 = sc["t0"], sc["t1"]
    rin = K.rin
    K.place(rin, t0, x=ROOM_X - 330, face=1, pose="write", alpha=1.0)
    K.cam(t0, 1.4, cx=ROOM_X + 160, cy=540, z=1.0)
    K.headline(t0 + 0.4, t1 - 0.3, "Что считаем результатом?")
    rows = [("подсказок", "команда делает выбранную часть без постоянных подсказок"),
            ("границ", "изменения — внутри договорённых границ"),
            ("учтено", "время людей оплачено и учтено"),
            ("останавливается", "неподходящий запрос останавливается")]
    for i, (wd, lab) in enumerate(rows):
        tw = K.w("B049", wd)
        y = 300 + i * 58
        K.tmp("cell_full", ROOM_X - 60, y, tw - 0.6, t1 - 0.3, s=0.32, layer=5, tint=(0.75, 0.8, 1.0, 0.6))
        K.label(tw - 0.4, t1 - 0.3, lab, ROOM_X - 20, y, "small", size=28, align="left")
        K.sfx(tw - 0.4, "paper", 0.35)
    tp = K.w("B049", "похвалой")
    K.label(tp - 0.6, tp + 3.2, "пункт не спрятать за похвалой красивым панно", ROOM_X + 200, 600, "note")
    ts = K.w("B049", "спокойный")
    rin.key(ts - 0.6, 0.7, pose="calm")
    K.label(ts - 0.8, t1 - 0.3, "требовательнее — и спокойнее", ROOM_X + 200, 600, "small")


SCENES = {"S25": s25, "S26": s26, "S27": s27, "S28": s28, "S29": s29, "S30": s30, "S31": s31, "S32": s32,
          "S33": s33, "S34": s34, "S35": s35}
