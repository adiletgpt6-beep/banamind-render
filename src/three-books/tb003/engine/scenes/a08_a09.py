"""A08–A09: Saturday — the team can say «stop»; Sunday — a decision that can be carried out (S36–S45)."""
from kit import (BOARD_X, DAYS, G_STANDS, GROUND, MAT_X, PANEL_Y, ROOM_DOOR_X, ROOM_X, S_STANDS, SIDE_X,
                 SITE_DOOR_X, SITE_X, TABLE_TOP, msg, say)
from scenes.a01_a03 import STEPS
from scenes.a06_a07 import BOUND_X, ROW


def s36(K, sc):
    """Saturday: everyone knows the conditions and roles; Sai observes; Rin is available, not leading."""
    t0, t1 = sc["t0"], sc["t1"]
    rin, tai, sai, ola, mel = K.rin, K.tai, K.sai, K.p["ola"], K.p["mel"]
    K.day(t0, DAYS["sat"], d=2.5)
    K.cut(t0 + 0.3, SITE_X + 60, 560, 1.0)
    K.place(rin, t0 + 0.3, x=SIDE_X + 60, face=-1, pose="calm", alpha=1.0)
    K.place(tai, t0 + 0.3, x=ROW[2] + 130, face=-1, pose="stand", alpha=1.0)
    K.place(ola, t0 + 0.3, x=ROW[0] - 150, face=1, pose="calm", alpha=1.0)
    K.place(mel, t0 + 0.3, x=MAT_X + 200, face=1, pose="hold", alpha=1.0)
    K.place(sai, t0 + 0.3, x=SITE_DOOR_X - 110, face=-1, pose="calm", alpha=0.0)
    for i, (p, k) in enumerate(zip(K.s_panels, "acdb")):
        K.place(p, t0 + 0.3, x=ROW[i], y=PANEL_Y, alpha=1.0, shape="panel_" + k)
    K.headline(t0 + 0.6, t0 + 4.0, "Суббота", style="small")
    tk = K.w("B050", "комплект")
    K.label(tk - 0.2, tk + 3.0, "похожий комплект", SITE_X - 140, 250, "small")
    tr = K.w("B050", "роли")
    bd = K.prop("badge", 0, 0, s=0.8, layer=8, alpha=0.0)
    K.hold(bd, ola, tr - 0.4, "chest", dx=14, dy=0, d=0.01)
    bd.key(tr - 0.3, 0.6, alpha=1.0)
    bd.key(K.T.scene["S41"]["t1"] - 0.3, 0.4, alpha=0.0)
    K.label(tr - 0.2, tr + 3.2, "условия и роли известны заранее", SITE_X - 140, 300, "note")
    ts = K.w("B050", "наблюдал")
    sai.key(ts - 0.5, 0.6, alpha=1.0)
    K.tmp("eye", SITE_DOOR_X - 110, 360, ts - 0.2, ts + 3.0, s=0.6, layer=7)
    tv = K.w("B050", "доступен")
    K.cam(tv - 0.4, 2.0, cx=SITE_X + 260, cy=560, z=1.0)
    K.label(tv, tv + 3.6, "доступен для исключений", SIDE_X + 60, 330, "small")
    tn = K.w("B050", "руководил")
    K.label(tn - 0.2, tn + 2.8, "не руководит каждым движением", SIDE_X + 60, 380, "note")
    to = K.w("B050", "согласованный")
    K.cam(to - 0.6, 1.8, cx=SITE_X - 60, cy=560, z=1.0)
    K.tmp("boundary", BOUND_X, PANEL_Y + 10, to - 0.6, K.T.scene["S38"]["t1"], s=0.68, sy=0.78, layer=1)
    K.headline(to - 0.4, t1 - 0.2, "Один согласованный участок")
    K.label(K.w("B050", "скрытой") - 0.4, t1 - 0.2, "без привычной скрытой помощи", BOUND_X, 860, "small")


def s37(K, sc):
    """Tai swaps another pair, marks the change; the checker confirms; work goes on."""
    t0, t1 = sc["t0"], sc["t1"]
    tai, ola, mel = K.tai, K.p["ola"], K.p["mel"]
    K.cam(t0, 1.2, cx=BOUND_X - 40, cy=560, z=1.05)
    tz = K.w("B051", "обратном")
    tai.key(tz - 0.8, 0.6, pose="think")
    K.label(tz - 0.4, tz + 2.6, "эта пара лучше встанет наоборот", BOUND_X, 250, "note")
    tsv = K.w("B051", "Сверила")
    tai.key(tsv - 0.2, 0.6, pose="tilt")
    tp = K.w("B051", "переставила")
    p1, p2 = K.s_panels[1], K.s_panels[2]
    p1.key(tp - 0.4, 1.3, x=ROW[2], y=PANEL_Y - 18)
    p2.key(tp - 0.4, 1.3, x=ROW[1], y=PANEL_Y + 18)
    p1.key(tp + 0.9, 0.4, y=PANEL_Y)
    p2.key(tp + 0.9, 0.4, y=PANEL_Y)
    tai.key(tp - 0.5, 0.6, pose="work")
    K.sfx(tp - 0.2, "whoosh", 0.4)
    tw = K.w("B051", "записала")
    tai.key(tw - 0.2, 0.6, pose="write")
    K.tmp("mark", ROW[2] + 160, 600, tw, t1 - 0.2, s=0.5, layer=9)
    tc = K.w("B051", "Проверяющий")
    K.walk(ola, tc - 0.6, ROW[1] - 40, speed=200, pose_after="present")
    K.tmp("eye", BOUND_X, PANEL_Y - 140, tc - 0.2, tc + 2.4, s=0.6, layer=7)
    K.tmp("check", BOUND_X, PANEL_Y - 140, tc + 2.0, t1 - 0.2, s=0.8, layer=7)
    K.sfx(tc + 2.0, "lit", 0.4)
    tg = K.w("B051", "продолжилась")
    mel.key(tg - 0.3, 0.6, pose="lift")
    K.headline(tg - 0.6, tg + 3.0, "Решение в границах")
    tt = K.w("B051", "четверг")
    for i in range(3):
        K.tmp("msg", SITE_DOOR_X - 60 + i * 60, 380 - i * 30, tt - 0.3 + i * 0.2, tt + 2.6, s=0.6, layer=7, alpha=0.35)
    K.label(tt - 0.2, tt + 2.6, "в четверг: все ждали его сообщения", SITE_DOOR_X - 20, 260, "note")
    tn = K.w("B051", "понятному")
    K.label(tn - 0.6, t1 - 0.2, "теперь: понятный для команды путь", BOUND_X, 860, "small")


def s38(K, sc):
    """A new request: Tai stops the extension, describes the change and waits; Rin keeps the record (B052, B053)."""
    t0, t1 = sc["t0"], sc["t1"]
    rin, tai, sai, cl = K.rin, K.tai, K.sai, K.p["client"]
    K.cam(t0, 1.4, cx=SITE_X + 120, cy=560, z=1.0)
    tq = K.w("B052", "дополнительный")
    K.place(cl, t0, x=SITE_DOOR_X + 300, face=-1, alpha=0.0, pose="stand")
    cl.key(tq - 1.6, 0.5, alpha=1.0)
    K.walk(cl, tq - 1.6, ROW[3] + 260, speed=230, pose_after="gesture")
    msg(K, tq - 0.2, (ROW[3] + 260, 430), (ROW[2] + 140, 440), d=0.9)
    for i in range(3):
        K.tmp("frame_empty", ROW[3] + 160 + i * 130, PANEL_Y + 30, tq + 0.4 + i * 0.3, K.E("B052") - 0.4, s=0.75,
              layer=3, alpha=0.5, tint=(1.0, 0.7, 0.4, 0.5))
    K.label(tq + 0.4, tq + 4.2, "ещё несколько панно рядом?", ROW[3] + 290, 250, "small")
    ts = K.w("B052", "остановилась")
    tai.key(ts - 0.3, 0.6, pose="reach_stop")
    K.tmp("stop_palm", ROW[2] + 140, 300, ts - 0.2, K.E("B052") + 0.2, s=0.7, layer=8)
    K.sfx(ts - 0.1, "fixed", 0.5)
    tu = K.w("B052", "согласие")
    K.label(tu - 0.4, tu + 3.6, "согласие на одну задачу ≠ разрешение расширить", BOUND_X, 860, "small")
    tn = K.w("B052", "Написала")
    tai.key(tn - 0.3, 0.6, pose="write")
    msg(K, tn, (ROW[2] + 140, 420), (SIDE_X + 40, 500), d=1.6, hold=1.0)
    K.label(tn + 0.4, tn + 3.6, "описала, что изменилось — ждёт решения", ROW[2] + 140, 250, "note")
    tsa = K.w("B052", "верное")
    sai.key(tsa - 0.4, 0.6, pose="nod")
    K.tmp("check", SITE_DOOR_X - 110, 330, tsa - 0.2, K.E("B052") + 0.4, s=0.8, layer=8)
    K.label(tsa, K.E("B052") + 0.4, "верное действие", SITE_DOOR_X - 110, 260, "small")
    cl.key(K.E("B052") - 0.2, 0.5, alpha=0.0)
    K.headline(K.w("B052", "остановке") - 0.4, K.E("B052") + 0.4, "Правильное «стоп»")
    # B053: the record of the stop stays in the report
    tr = K.w("B053", "вычеркнуть")
    K.cam(tr - 0.8, 1.6, cx=SIDE_X - 140, cy=520, z=1.1)
    rin.key(tr - 0.6, 0.6, pose="write")
    sai.key(tr - 0.8, 0.5, alpha=0.0)
    rep = K.tmp("shiftsheet", SIDE_X + 230, 450, tr - 0.8, t1 - 0.2, s=0.6, layer=7)
    K.label(tr - 0.6, t1 - 0.2, "остановка: доп. панно", SIDE_X + 230, 320, "small", size=24)
    K.tmp("strike", SIDE_X + 230, 320, tr + 0.2, K.w("B053", "перечитал") - 0.2, s=0.45, layer=8, sy=0.6)
    K.label(K.w("B053", "мечтал") - 0.3, K.w("B053", "мечтал") + 2.8, "«меньше сообщений любой ценой»", SIDE_X + 60, 250,
            "cite")
    tp = K.w("B053", "перечитал")
    rin.key(tp - 0.2, 0.6, pose="think")
    K.label(tp + 0.2, tp + 3.6, "условие 3: когда остановиться и позвать", SIDE_X - 140, 860, "note")
    tk = K.w("B053", "оставил")
    rin.key(tk - 0.3, 0.6, pose="nod")
    K.tmp("check", SIDE_X + 370, 320, tk, t1 - 0.2, s=0.6, layer=8)
    K.label(K.w("B053", "разрешённом") - 0.6, t1 - 0.2, "самостоятельно в разрешённом • вовремя «стоп» в новом",
            SIDE_X - 140, 860, "small")


def s39(K, sc):
    """The extra panels go to a separate agreement, not into the revenue of the current kit."""
    t0, t1 = sc["t0"], sc["t1"]
    rin = K.rin
    K.cut(t0 + 0.3, ROOM_X + 120, 540, 1.0)
    K.place(rin, t0 + 0.3, x=ROOM_X - 330, face=1, pose="calm", alpha=1.0)
    for a in (K.tai, K.sai, K.p["ola"], K.p["mel"], K.p["client"]):
        a.key(t0 + 0.3, 0.01, alpha=0.0)
    K.headline(t0 + 0.6, t1 - 0.2, "Это другой объём")
    tk = K.w("B054", "комплект")
    K.tmp("bar", ROOM_X - 20, 330, tk - 0.4, t1 - 0.3, sx=4.2, sy=1.4, layer=4, tint=(1.0, 0.70, 0.30, 1.0))
    K.label(tk - 0.2, t1 - 0.3, "текущий комплект — без изменений", ROOM_X - 20, 380, "small", size=26)
    td = K.w("B054", "договорённость")
    K.tmp("sheet", ROOM_X + 480, 560, td - 0.6, t1 - 0.3, s=0.7, layer=5)
    K.label(td - 0.4, t1 - 0.3, "отдельная договорённость:\nматериалы • время • условия", ROOM_X + 480, 420, "small",
            size=24)
    tz = K.w("B054", "согласиться")
    K.label(tz - 0.6, tz + 3.0, "заказчик может не согласиться", ROOM_X + 480, 700, "note")
    tg = K.w("B054", "гарантированную")
    K.label(tg - 0.6, tg + 3.2, "отказ ≠ потерянная «гарантированная прибыль»", ROOM_X + 80, 860, "note")
    tv = K.w("B054", "возможный")
    K.tmp("bar", ROOM_X - 20, 470, tv - 0.4, t1 - 0.3, sx=1.6, sy=1.2, layer=4, alpha=0.3,
          tint=(1.0, 0.80, 0.50, 1.0))
    K.label(tv - 0.2, t1 - 0.3, "только возможный результат", ROOM_X - 20, 520, "note", size=24)
    tw = K.w("B054", "воображаемыми")
    rin.key(tw - 0.4, 0.6, pose="palms")
    K.label(tw - 0.2, t1 - 0.3, "сегодняшние решения — не за счёт воображаемых завтрашних денег", ROOM_X + 80, 860,
            "small", size=26)


def s40(K, sc):
    """Not only panels are checked; on the sheet fewer palms, more names and roles (B055, B056)."""
    t0, t1 = sc["t0"], sc["t1"]
    rin = K.rin
    K.place(rin, t0, x=ROOM_X - 330, face=1, pose="write")
    K.cam(t0, 1.4, cx=ROOM_X + 160, cy=540, z=1.0)
    K.headline(t0 + 0.3, K.E("B055") + 0.3, "Проверить не только панно", style="small")
    for i, (wd, lab) in enumerate((("изменений", "записи изменений"), ("время", "действительное время"),
                                    ("оплату", "оплата участников"), ("вопросы", "вопросы, дошедшие до Рина"))):
        tw = K.w("B055", wd)
        y = 300 + i * 56
        K.tmp("cell_full", ROOM_X - 60, y, tw - 0.5, K.E("B055") + 0.3, s=0.32, layer=5, tint=(0.75, 0.8, 1.0, 0.6))
        K.label(tw - 0.3, K.E("B055") + 0.3, lab, ROOM_X - 20, y, "small", size=28, align="left")
    tl = K.w("B055", "дольше")
    K.label(tl - 0.4, K.E("B055") + 0.3, "обучение заняло дольше — расход остался в записи", ROOM_X + 160, 600, "note")
    tn = K.w("B055", "любая")
    K.label(tn - 0.4, K.E("B055") + 0.3, "это не доказывает «любая команда — любая площадка»", ROOM_X + 160, 860, "note")
    # B056: the chain again — fewer palms, names and duties next to them
    tb = K.S("B056") - 0.6
    K.board(tb, t1 - 0.3, back=(SITE_X + 60, 560, 1.0))
    Y = 470
    K.tmp("chain7", BOARD_X, Y, tb + 0.2, t1 - 0.5, layer=3)
    for i, s in enumerate(STEPS):
        K.label(tb + 0.3, t1 - 0.5, s, BOARD_X - 450 + i * 150, Y + 62, "small", size=24)
    roles = ["Рин", "Рин", "участник", "Тая", "участник", "Тая", "проверяющий"]
    tp = K.w("B056", "ладоней")
    for i, r in enumerate(roles):
        x = BOARD_X - 450 + i * 150
        if r == "Рин":
            K.tmp("palm", x, Y - 78, tb + 0.3, t1 - 0.5, s=1.0, layer=5, tint=(0.10, 0.75, 0.45, 0.7))
        else:
            K.tmp("palm", x, Y - 78, tb + 0.3, tp + 0.2 + i * 0.15, s=1.0, layer=5, tint=(0.10, 0.75, 0.45, 0.7))
            K.tmp("person_icon", x, Y - 80, tp + 0.6 + i * 0.15, t1 - 0.5, s=0.6, layer=5,
                  tint=(0.95, 0.55, 0.40, 0.6) if r == "Тая" else (0.40, 0.50, 0.95, 0.6))
        tn2 = K.w("B056", "имена")
        K.label(tn2 + i * 0.12, t1 - 0.5, r, x, Y - 150, "note", size=22)
    tr = K.w("B056", "переместилась")
    K.label(tr - 0.4, t1 - 0.5, "работа Рина: условия • повторяющиеся причины • обучение следующего",
            BOARD_X, 720, "small", size=28)
    K.headline(K.w("B056", "ответственности") - 1.6, t1 - 0.3, "Ответственность остаётся")


def s41(K, sc):
    """Tai points to a doubtful line of the instruction; they correct it together."""
    t0, t1 = sc["t0"], sc["t1"]
    rin, tai = K.rin, K.tai
    K.place(rin, t0, x=S_STANDS[0] - 60, face=1, pose="calm", alpha=1.0)
    K.place(tai, t0, x=S_STANDS[0] + 330, face=-1, pose="stand", alpha=1.0)
    K.cam(t0, 0.01, cx=S_STANDS[0] + 120, cy=500, z=1.15)
    sh = K.tmp("sheet", S_STANDS[0] + 130, 330, t0 + 0.3, t1 - 0.3, s=0.9, layer=7)
    ts = K.w("B057", "строку")
    tai.key(ts - 0.4, 0.6, pose="point", face=-1)
    K.tmp("hline", S_STANDS[0] + 130, 320, ts - 0.2, K.w("B057", "вместе"), s=0.25, layer=8,
          tint=(1.0, 0.6, 0.4, 0.9))
    tm = K.w("B057", "понимал")
    K.label(tm - 0.6, tm + 2.8, "«я и так понимаю, что тут написано»", S_STANDS[0] - 60, 250, "cite")
    tk = K.w("B057", "показать")
    rin.key(tk - 0.4, 0.6, pose="tilt")
    tv = K.w("B057", "вариант")
    tai.key(tv - 0.4, 0.6, pose="gesture")
    tt = K.w("B057", "вместе")
    rin.key(tt - 0.4, 0.6, pose="write")
    tai.key(tt - 0.4, 0.6, pose="write")
    K.tmp("hline", S_STANDS[0] + 130, 320, tt, t1 - 0.3, s=0.25, layer=8, tint=(0.4, 1.0, 0.6, 0.9))
    K.sfx(tt, "paper", 0.5)
    K.headline(tt - 0.2, t1 - 0.2, "Другой взгляд полезен")
    to = K.w("B057", "возразить")
    K.label(to - 1.4, t1 - 0.3, "оставить возможность возразить", S_STANDS[0] + 120, 860, "small")


def s42(K, sc):
    """Sunday: the two plaques turn into one sheet of a concrete agreement for the next stage."""
    t0, t1 = sc["t0"], sc["t1"]
    rin = K.rin
    K.day(t0, DAYS["sun"], d=3.0)
    K.cut(t0 + 0.3, ROOM_X, 580, 1.2)
    K.place(rin, t0 + 0.3, x=ROOM_X - 330, face=1, pose="calm", alpha=1.0)
    K.tai.key(t0 + 0.3, 0.01, alpha=0.0)
    K.headline(t0 + 0.6, t0 + 4.0, "Воскресенье", style="small")
    xa, xb, y = ROOM_X - 100, ROOM_X + 100, TABLE_TOP - 26
    p1, p2 = K.plaque1, K.plaque2
    K.place(p1, t0 + 0.3, x=xa, y=y, alpha=0.0, shape="plaque", s=0.88)
    K.place(p2, t0 + 0.3, x=xb, y=y, alpha=0.0, shape="plaque", s=0.88)
    tp = K.w("B058", "таблички")
    p1.key(tp - 0.6, 0.8, alpha=1.0)
    p2.key(tp - 0.6, 0.8, alpha=1.0)
    lab_end = K.w("B058", "мог") - 0.2
    K.label(tp - 0.4, lab_end, "Работа", xa, y - 8, "small", size=24)
    K.label(tp - 0.4, lab_end, "Своё дело", xb, y - 8, "small", size=24)
    td = K.w("B058", "дверями")
    K.label(td - 0.4, td + 2.8, "не двери к «единственной правильной жизни»", ROOM_X, 330, "note")
    tm = K.w("B058", "мог")
    p2.key(tm, 1.4, x=ROOM_X, alpha=0.0)
    p1.key(tm, 1.6, shape="shiftsheet", x=ROOM_X, y=TABLE_TOP - 92, s=0.5)
    K.sfx(tm, "morph", 0.5)
    rin.key(tm, 0.6, pose="present")
    lines = ["основная работа — сохраняется", "3 учебные смены", "понятная оплата"]
    for i, (wd, lab) in enumerate(zip(("основную", "трёх", "оплатой"), lines)):
        tw = K.w("B058", wd)
        K.label(tw - 0.2, t1 - 0.3, lab, ROOM_X + 360, 340 + i * 50, "small", size=28, align="left")
    tc = K.w("B058", "ближайший")
    K.headline(tc - 0.6, t1 - 0.2, "Следующий этап")
    tn = K.w("B058", "навсегда")
    K.label(tn - 0.4, t1 - 0.3, "не «навсегда» • не обязательно «большая компания»", ROOM_X, 860, "note")
    p1.key(t1 + 0.4, 0.6, alpha=0.0)
    p1.t_off = 1e9


def s43(K, sc):
    """Rin's reply to Sai: what he can lead, where he needs help, how the result will be checked."""
    t0, t1 = sc["t0"], sc["t1"]
    rin = K.rin
    K.cam(t0, 1.4, cx=ROOM_X + 120, cy=560, z=1.05)
    rin.key(t0 + 0.2, 0.6, pose="write")
    K.headline(t0 + 0.4, t0 + 4.0, "Ответ Саю", style="small")
    items = [("умеет", "могу вести: подготовку участка"), ("помощь", "нужна помощь: устройство смен"),
             ("условиям", "смотрим результат по условиям"), ("разбора", "время следующего разбора")]
    for i, (wd, lab) in enumerate(items):
        tw = K.w("B059", wd)
        K.label(tw - 0.3, t1 - 0.3, lab, ROOM_X + 40, 290 + i * 46, "small", size=28, align="left")
    tl = K.w("B059", "Его")
    lt = K.tmp("letter", ROOM_X + 40, TABLE_TOP - 40, tl - 1.2, tl + 1.6, s=0.8, layer=6)
    lt.key(tl - 0.2, 1.4, x=ROOM_DOOR_X + 200, y=320)
    K.sfx(tl - 0.2, "whoosh", 0.5)
    rin.key(tl - 0.2, 0.6, pose="calm")
    tb = K.w("B059", "билетом")
    K.label(tb - 0.8, tb + 3.0, "уверенность — не билет на вход", ROOM_X + 120, 560, "label", size=34)
    to = K.w("B059", "участок")
    K.tmp("panel_c", ROOM_X - 60, TABLE_TOP - 60, to - 1.0, t1 - 0.3, s=0.5, layer=5)
    for i, (wd, lab) in enumerate((("участок", "работающий участок"), ("ошибка", "замеченная ошибка"),
                                    ("исправления", "опыт исправления"))):
        tw = K.w("B059", wd)
        K.label(tw - 0.2, t1 - 0.3, lab, ROOM_X + 380, 660 + i * 44, "note", size=26)
    K.headline(K.w("B059", "опереться") - 0.6, t1 - 0.2, "Можно начать с этого")


def s44(K, sc):
    """Three practical questions through familiar images; three dignified paths (B060, B061)."""
    t0, t1 = sc["t0"], sc["t1"]
    K.board(t0 + 0.3, t1 - 0.3, back=(1000, 520, 0.95))
    K.headline(t0 + 0.6, K.E("B060") + 0.3, "Если узнаёте в Рине себя", style="small")
    q = [("только", "Какой результат сейчас зависит только от вас?", "palm"),
         ("знает", "Чего не знает другой: движения, условий или права решать?", "boundary"),
         ("ожидание", "Какое ожидание записать до следующей пробы?", "note")]
    for i, (wd, lab, icon) in enumerate(q):
        tw = K.w("B060", wd)
        y = 330 + i * 120
        K.tmp(icon, BOARD_X - 560, y, tw - 0.6, K.E("B060") + 0.3, s=0.6 if icon != "boundary" else 0.14, layer=4,
              tint=(0.10, 0.75, 0.45, 0.6) if icon == "palm" else (0.0, 0.0, 0.0, 0.0))
        K.label(tw - 0.4, K.E("B060") + 0.3, lab, BOARD_X - 480, y, "label", size=34, align="left")
    tr = K.w("B060", "неудобным")
    K.label(tr - 1.2, K.E("B060") + 0.3, "не выбирать всю жизнь заранее — встретиться с результатом", BOARD_X, 760,
            "note")
    # B061: three dignified paths; imagined advantages vs real duties
    tp = K.S("B061")
    K.tmp("baseline", BOARD_X, 640, tp, t1 - 0.4, s=0.75, layer=3)
    for i, (wd, lab) in enumerate((("Собственная", "собственная работа"), ("команде", "работа в команде"),
                                    ("организация", "организация процесса"))):
        tw = K.w("B061", wd)
        x = BOARD_X - 340 + i * 340
        K.tmp("column", x, 500, tw - 0.4, t1 - 0.4, s=0.6, sy=0.62, layer=3)
        K.label(tw - 0.2, t1 - 0.4, lab, x, 480, "small", size=26)
    tv = K.w("B061", "воображаемые")
    K.label(tv - 0.4, tv + 3.6, "воображаемые преимущества ≠ настоящие обязанности", BOARD_X, 260, "small")
    to = K.w("B061", "отсутствие")
    K.label(to - 0.6, to + 2.6, "не деньги за отсутствие", BOARD_X, 260, "cite")
    tn = K.w("B061", "навык")
    K.label(tn - 0.4, t1 - 0.4, "навык • его цена • следующая договорённость", BOARD_X, 760, "small")
    K.headline(K.w("B061", "откладывать") - 1.0, t1 - 0.2, "Где всё ждёт только вас?")


def s45(K, sc):
    """Tai puts her own mark; Rin accepts it without rewriting; the next sheet; the garden keeps glowing."""
    t0, t1 = sc["t0"], sc["t1"]
    rin, tai = K.rin, K.tai
    RX, TX, SX = 1440.0, 1660.0, 1550.0
    K.place(rin, t0 + 0.2, x=RX, face=1, pose="calm", alpha=1.0)
    K.place(tai, t0 + 0.2, x=TX, face=-1, pose="stand", alpha=0.0)
    tai.key(t0 + 0.4, 0.8, alpha=1.0)
    for i, (p, k) in enumerate(zip(K.g_panels, "abcd")):
        K.place(p, t0 + 0.2, alpha=0.9, shape="panel_" + k)
    for s_ in K.g_stands:
        s_.key(t0 + 0.2, 0.01, alpha=0.45)
    K.cam(t0 + 0.2, 0.01, cx=1420, cy=560, z=1.2)
    sheet = K.prop("shiftsheet", 0, 0, s=0.38, layer=8, alpha=0.0)
    tm = K.w("B062", "отметку")
    K.hold(sheet, tai, tm - 1.6, "hand_f", dx=26, dy=-36, d=0.01)
    sheet.key(tm - 1.5, 0.5, alpha=1.0)
    tai.key(tm - 1.6, 0.6, pose="write")
    sig = K.tmp("signature", TX - 70, 560, tm, t1 - 1.0, s=0.5, layer=9)
    K.sfx(tm, "paper", 0.5)
    tr = K.w("B062", "прочитал")
    K.hold(sheet, rin, tr - 0.8, "hand_f", dx=30, dy=-40, d=0.6)
    sig.attach(rin, "hand_f")
    sig.key(tr - 0.8, 0.6, att=1.0, adx=30.0, ady=-40.0)
    rin.key(tr - 0.6, 0.6, pose="hold1")
    tai.key(tr - 0.6, 0.6, pose="calm")
    K.label(K.w("B062", "переписал") - 0.4, K.w("B062", "переписал") + 3.0, "её почерк — без переписывания",
            SX, 300, "note")
    tn = K.w("B062", "следующем")
    nxt = K.tmp("shiftsheet", SX, 400, tn - 0.4, t1 - 0.8, s=0.4, layer=6)
    K.label(tn, K.w("B062", "светиться") + 1.0, "новый случай • имя ответственного • результат проверки", SX, 270,
            "small", size=26)
    ts = K.w("B062", "светиться")
    K.cam(ts - 1.0, 6.0, cx=1000, cy=540, z=0.9)
    for i, p in enumerate(K.g_panels):
        p.key(ts - 0.6 + i * 0.3, 1.2, bright=1.35)
    K.flow(120, ts - 0.6, t1 - 3.0, [(x, 120) for x in (300, 700, 1100, 1500, 1900)],
           [(x, 560) for x in (640, 860, 1080, 1300)], travel=2.4, stay=False, vanish_at_dst=True, seed=99,
           color=(1.0, 0.86, 0.55), size=0.6, arc=-60)
    K.sfx(ts, "shimmer", 0.5)
    tl = K.w("B062", "ненужности")
    K.headline(tl - 2.6, t1 - 4.6, "Работа продолжается")
    rin.key(tl - 1.0, 0.8, pose="rest")
    K.headline(t1 - 4.2, t1 - 0.5, "Ты создал своё дело — или вторую работу?", style="head", y=150)
    K.st.look.key(t1 - 1.0, 0.95, fade=0.0)


SCENES = {"S36": s36, "S37": s37, "S38": s38, "S39": s39, "S40": s40, "S41": s41, "S42": s42, "S43": s43,
          "S44": s44, "S45": s45}
