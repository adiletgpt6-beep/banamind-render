// Проверки фильма 80-1-11: сценарий (45 реплик по порядку, роли, точный
// текст каждой реплики, надписи реквизита), класс (25 учеников, 3 главных,
// учитель отдельно, места без повторов), шкала (три паузы ровно по 150 кадров
// по звуку, финальный общий план 120–150 кадров, озвучка), субтитры (с первым
// звуком, без наложений, вопрос держится всю паузу), постановка (Амир входит
// из двери и до признания не подходит к ростку; земля — после паузы 3 и
// «Верно»; вода в чашку → передача → полив; карточка пишется после реплики 38
// и готова к «Готово»), тишина фона в паузах, монтаж (непрерывный, без
// склеек в паузах, финал — общий план), финал (все сидят на своих местах),
// касания (кисть, держащая предмет или касающаяся земли/плеча, — в пределах
// длины руки по модели плеча рига: предмет не висит в воздухе у руки).
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { CAST, castById, TEACHER } from "../src/lesson80/film-1-11/cast.ts";
import { FILM, L80_LINES, L80_PAUSES, TEXTS, lineFile } from "../src/lesson80/film-1-11/script.ts";
import { buildTimeline, checkTimeline, cueById, estimateManifest, markOf, pauseFrames } from "../src/lesson80/film-1-11/timeline.ts";
import { subtitleEvents } from "../src/lesson80/film-1-11/subtitleEvents.ts";
import { buildShots, CAM } from "../src/lesson80/film-1-11/shots.ts";
import { buildChoreo, shoulderOf } from "../src/lesson80/film-1-11/choreo.ts";
import { AT_TABLE, SEATS_MAIN } from "../src/lesson80/film-1-11/layout.ts";
import { cardReveal } from "../src/lesson80/film-1-11/card.ts";

const MANIFEST = `public/${FILM.voiceDir}/manifest.json`;
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : estimateManifest();
const tl = buildTimeline(manifest);
const ch = buildChoreo(tl);
const FPS = FILM.fps;
const END = tl.durationInFrames;
const F = (id) => ({ from: Math.round(cueById(tl, id).from * FPS), to: Math.round(cueById(tl, id).to * FPS) });
const PF = (p) => ({ from: Math.round(p.from * FPS), to: Math.round(p.to * FPS) });
const MF = (label) => ({ from: Math.round(markOf(tl, label).from * FPS), to: Math.round(markOf(tl, label).to * FPS) });
const frames = (from, to, step = 1) => Array.from({ length: Math.max(0, Math.ceil((to - from) / step)) }, (_, i) => from + i * step);

const ROLES = {
  yusuf: [1, 6, 9, 14, 18, 27, 36, 43],
  bilal: [2, 4, 8, 10, 20, 22, 30, 37, 39],
  amir: [3, 5, 7, 11, 13, 16, 25, 29, 32, 35, 38, 41, 45],
  muhammad: [12, 15, 17, 19, 21, 23, 24, 26, 28, 31, 33, 34, 40, 42, 44],
};
// Точный текст реплик (копия script.ts): случайная правка текста ловится здесь.
const TEXT = [
  [1, "У нашего ростка зелёные листочки!"],
  [2, "Амир, ты обещал проверить росток. Посмотрел, нужна ли ему вода?"],
  [3, "Да. Земля ещё влажная."],
  [4, "Ты ведь ещё не подходил к ростку."],
  [5, "Я забыл проверить. А потом сказал, что проверил."],
  [6, "Почему?"],
  [7, "Мне было неловко признаться."],
  [8, "Что Амир может сделать теперь?"],
  [9, "Сказать, как было. А я пойду с тобой."],
  [10, "Пойдём."],
  [11, "Мухаммад, простите. Я не проверил росток. Я сказал неправду."],
  [12, "Спасибо, что рассказал. Что хочешь исправить?"],
  [13, "Сказать правду. Проверить росток. И извиниться перед Билалом."],
  [14, "А если я ошибусь?"],
  [15, "Ошибиться может каждый. Аллах — наш Создатель. Он Милостивый и Прощающий."],
  [16, "А можно попросить Аллаха прощения?"],
  [17, "Да. В Коране сказано: «Не отчаивайтесь в милости Аллаха»."],
  [18, "Как это — не отчаиваться?"],
  [19, "Не терять надежду на Его прощение. Можно попросить прощения и стараться исправиться."],
  [20, "Что значит исправиться?"],
  [21, "Пожалеть о плохом поступке, перестать так делать и решить больше его не повторять."],
  [22, "А если человек снова поступил плохо?"],
  [23, "Снова попросить прощения и исправиться. Надежду терять не нужно."],
  [24, "Какими словами можно попросить Аллаха прощения?"],
  [25, "Аллах, прости меня. Помоги мне говорить правду."],
  [26, "Просить можно своими словами. Важно поступать честно."],
  [27, "А Билалу что сказать?"],
  [28, "Перед ним тоже нужно извиниться и вернуться к обещанному делу."],
  [29, "Билал, прости, что сказал неправду."],
  [30, "Я прощаю тебя. Давай проверим вместе."],
  [31, "Что можно сделать сейчас?"],
  [32, "Посмотреть, нужна ли ростку вода."],
  [33, "Верно."],
  [34, "Земля подсохла. Росток можно немного полить."],
  [35, "Сейчас медленно полью."],
  [36, "А как теперь не забыть?"],
  [37, "Сделаем напоминание."],
  [38, "Напиши: «Проверить росток»."],
  [39, "Готово."],
  [40, "Проверять будем вместе. Поливать — когда нужно."],
  [41, "А если забуду, скажу честно."],
  [42, "Ты смог сказать правду и вернуться к делу."],
  [43, "Если я ошибусь, я тоже смогу исправиться."],
  [44, "Да. У Аллаха можно просить прощения. А за помощью приходи к нам."],
  [45, "Спасибо, что пошли со мной."],
];

test("сценарий: ровно 45 реплик по порядку, говорящие и точный текст", () => {
  assert.equal(L80_LINES.length, 45);
  L80_LINES.forEach((l, i) => assert.equal(l.id, i + 1));
  const roleOf = new Map(Object.entries(ROLES).flatMap(([r, ids]) => ids.map((id) => [id, r])));
  assert.equal(roleOf.size, 45);
  for (const l of L80_LINES) assert.equal(l.role, roleOf.get(l.id), `№${l.id}: говорящий`);
  assert.equal(TEXT.length, 45);
  for (const [id, text] of TEXT) assert.equal(L80_LINES[id - 1].text, text, `№${id}: текст`);
  for (const l of L80_LINES) assert.ok(!/\d/.test(l.text), `в тексте №${l.id} нет цифр`);
  assert.equal(L80_LINES[16].text, "Да. В Коране сказано: «Не отчаивайтесь в милости Аллаха».");
  assert.equal(TEXTS.card, "Проверить росток");
  assert.equal(TEXTS.poster, "Аллах — наш Создатель");
});

test("класс: 25 учеников (3 главных), учитель отдельно, места без повторов", () => {
  const ids = ["yusuf", "amir", "bilal", ...Array.from({ length: 22 }, (_, i) => `pupil${String(i + 1).padStart(2, "0")}`)];
  assert.equal(CAST.length, 25);
  assert.equal(new Set(CAST.map((p) => p.id)).size, 25);
  assert.deepEqual(new Set(CAST.map((p) => p.id)), new Set(ids));
  assert.deepEqual(CAST.filter((p) => p.main).map((p) => p.id).sort(), ["amir", "bilal", "yusuf"]);
  for (const p of CAST) assert.ok(p.age >= 4 && p.age <= 12, `${p.id}: возраст ${p.age}`);
  assert.ok(!CAST.some((p) => p.id === TEACHER.id || p.id === "muhammad"), "учитель не в списке учеников");
  const bg = CAST.filter((p) => !p.main);
  assert.equal(bg.length, 22);
  assert.equal(new Set(bg.map((p) => `${p.plan.seat.row}:${p.plan.seat.x}`)).size, 22, "места без повторов");
  // в одном ряду соседи не ближе 180 px
  const rows = new Map();
  for (const p of bg) rows.set(p.plan.seat.row, [...(rows.get(p.plan.seat.row) ?? []), p.plan.seat.x]);
  for (const [row, xs] of rows) {
    const s = [...xs].sort((a, b) => a - b);
    for (let i = 1; i < s.length; i++) assert.ok(s[i] - s[i - 1] >= 180, `ряд ${row}: ${s[i - 1]} и ${s[i]}`);
  }
  assert.equal(FILM.id, "Lesson80-1-11");
  assert.equal(FILM.productionId, "80-1-11");
});

test("шкала: без замечаний, три паузы ровно по 150 кадров по звуку, финальный общий план", () => {
  assert.deepEqual(checkTimeline(tl), []);
  assert.deepEqual(tl.pauses.map((p) => p.after), [8, 24, 31]);
  assert.deepEqual(L80_PAUSES.map((p) => p.after), [8, 24, 31]);
  for (const p of tl.pauses) {
    assert.equal(pauseFrames(tl, p.after), 150, `пауза ${p.id}`);
    assert.equal(PF(p).to - PF(p).from, 150, `пауза ${p.id}: отрезок`);
    // ответ не начинается раньше конца паузы ни звуком, ни артикуляцией
    const next = cueById(tl, p.after + 1);
    assert.ok(tl.sound[next.id].start >= p.to - 1e-6, `пауза ${p.id}: первый звук ответа`);
    assert.ok(next.from >= p.to - 1e-6, `пауза ${p.id}: начало ответа`);
    assert.ok(tl.sound[p.after].end <= p.from + 1e-6, `пауза ${p.id}: звук вопроса`);
  }
  assert.ok(END >= 6600 && END <= 7800, `длительность ${END} кадров`);
  const fin = MF("финал: класс");
  assert.ok(fin.to - fin.from >= 120 && fin.to - fin.from <= 150, `финал ${fin.to - fin.from} кадров`);
  assert.equal(fin.to, END, "финальный общий план — в самом конце");
});

test("озвучка: 45 реплик, файлы на месте, один провайдер, текст совпадает", { skip: existsSync(MANIFEST) ? false : "нет манифеста" }, () => {
  assert.equal(manifest.lines.length, 45);
  assert.ok(!manifest.partial && !manifest.estimated);
  for (const l of L80_LINES) {
    const ml = manifest.lines.filter((x) => x.id === l.id);
    assert.equal(ml.length, 1, `№${l.id}`);
    const x = ml[0];
    assert.ok(x.file, `№${l.id}: файл`);
    assert.equal(x.file, lineFile(l.id));
    assert.ok(existsSync(`public/${FILM.voiceDir}/${x.file}`), `№${l.id}: нет ${x.file}`);
    assert.ok(x.durationSec > 0 && x.speechEnd > x.speechStart, `№${l.id}: длительность`);
    assert.equal(x.text, l.text, `№${l.id}: текст`);
  }
  assert.equal(new Set(manifest.lines.map((l) => l.provider)).size, 1, "одна дорожка одного провайдера");
});

test("субтитры: все реплики, с первым звуком, без наложений, вопрос держится всю паузу", () => {
  const ev = subtitleEvents(tl);
  assert.deepEqual(new Set(ev.map((e) => e.id)), new Set(L80_LINES.map((l) => l.id)));
  for (const e of ev) {
    const c = cueById(tl, e.id);
    assert.ok(e.from >= tl.sound[e.id].start - 0.01, `№${e.id}.${e.part}: раньше первого звука`);
    assert.ok(e.from >= c.from - 0.01, `№${e.id}.${e.part}: раньше начала речи`);
    assert.ok(e.to > e.from, `№${e.id}.${e.part}: пустой интервал`);
    const rows = e.text.split("\n");
    assert.ok(rows.length <= 2, `№${e.id}.${e.part}: ${rows.length} строки`);
    for (const r of rows) assert.ok(r.length <= 44, `№${e.id}.${e.part}: строка ${r.length} знаков «${r}»`);
  }
  for (let i = 1; i < ev.length; i++) assert.ok(ev[i].from >= ev[i - 1].to - 1e-6, `№${ev[i - 1].id}.${ev[i - 1].part} накладывается на №${ev[i].id}.${ev[i].part}`);
  for (const p of tl.pauses) {
    for (const e of ev.filter((x) => x.id === p.after + 1)) assert.ok(e.from >= p.to - 1e-6, `пауза ${p.id}: субтитр ответа во время паузы`);
    const q = ev.filter((x) => x.id === p.after).at(-1);
    assert.ok(q.to >= p.to - 0.25 && q.to <= p.to, `пауза ${p.id}: вопрос гаснет в ${q.to.toFixed(2)} с, пауза до ${p.to.toFixed(2)} с`);
  }
});

test("постановка: Амир входит из двери, кладёт сумку и до признания не подходит к ростку", () => {
  const ev = ch.events;
  assert.ok(ch.inDoorway(0), "кадр 0: Амир в дверном проёме");
  for (const f of frames(F(1).from, END)) assert.ok(!ch.inDoorway(f), `кадр ${f}: Амир снова в проёме`);
  assert.ok(ev.doorOpen < ev.bagDown);
  assert.ok(ev.bagDown < F(2).from, "сумка на ковре до реплики 2");
  assert.equal(ch.bag(0).state, "carried");
  assert.equal(ch.bag(F(2).from).state, "down");
  for (const f of frames(0, F(10).to + 1)) assert.ok(ch.amir.place(f).x < 900, `кадр ${f}: Амир x = ${ch.amir.place(f).x.toFixed(0)}`);
  // зона ростка — у столика с горшком под окном (x > 1700, y < 1200); низкий
  // столик учителя (y ≈ 1340) к ней не относится. К ростку все идут только
  // после извинения перед Билалом (отрезок «к ростку» после реплики 30).
  const toSprout = MF("к ростку");
  assert.ok(toSprout.from > F(30).to);
  for (const f of frames(0, toSprout.from)) {
    const p = ch.amir.place(f);
    assert.ok(!(p.x > 1700 && p.y < 1200), `кадр ${f}: Амир у ростка (${p.x.toFixed(0)}, ${p.y.toFixed(0)})`);
  }
});

test("постановка: земля после паузы 3 и «Верно», затем вода в чашку → передача → полив", () => {
  const ev = ch.events;
  const p3 = PF(tl.pauses[2]);
  assert.ok(ev.soilTouch[0] > p3.to, "земля — после паузы 3");
  assert.ok(ev.soilTouch[0] > F(33).from, "земля — после «Верно»");
  assert.ok(F(34).from > ev.soilTouch[0], "«Земля подсохла» — после касания");
  assert.ok(ev.pourCup.from > F(34).to, "вода в чашку — после реплики 34");
  assert.ok(ev.handoff.from >= ev.pourCup.to, "передача — после наполнения");
  assert.ok(ev.waterOn.from > F(35).to, "полив — после «Сейчас медленно полью»");
  let prev = Infinity;
  for (const f of frames(0, END)) {
    const c = ch.cup(f);
    if (f < ev.pourCup.from) assert.equal(c.fill, 0, `кадр ${f}: чашка не пустая до налива`);
    assert.ok(c.fill <= 0.55, `кадр ${f}: налито ${c.fill}`);
    if (f >= ev.waterOn.to) assert.equal(c.fill, 0, `кадр ${f}: вода осталась после полива`);
    if (f >= ev.waterOn.from && f <= ev.waterOn.to) {
      assert.ok(c.fill <= prev + 1e-9, `кадр ${f}: воды стало больше во время полива`);
      prev = c.fill;
    }
    const s = ch.stream(f);
    if (c.tilt < 20) assert.ok(!s || s.kind !== "cup", `кадр ${f}: струя из чашки при наклоне ${c.tilt.toFixed(1)}°`);
    if (f >= ev.cupUpright) {
      assert.equal(c.tilt, 0, `кадр ${f}: чашка наклонена после выпрямления`);
      assert.equal(s, null, `кадр ${f}: струя после выпрямления`);
    }
    if (f >= ev.cupDown + 15) assert.equal(c.holder, "table", `кадр ${f}: чашка не на столике`);
  }
});

test("карточка: чистая до реплики 38, надпись готова до «Готово», у горшка в конце", () => {
  const ev = ch.events;
  for (const f of frames(0, F(38).to)) {
    assert.equal(ch.progress(f), 0, `кадр ${f}`);
    assert.equal(ch.card(f).progress, 0, `кадр ${f}`);
  }
  for (const f of frames(0, F(37).to)) assert.equal(ch.pencil(f).inHand, false, `кадр ${f}: карандаш в руке`);
  for (const f of frames(0, ev.writeStart + 1)) {
    const r = cardReveal(ch.progress(f));
    assert.ok(ch.card(f).progress === 0 && r.line1 === 0 && r.line2 === 0 && r.leaf === 0, `кадр ${f}: на карточке что-то есть до письма`);
  }
  for (const f of frames(0, ev.cardPlaced)) assert.notEqual(ch.card(f).state, "atPot", `кадр ${f}`);
  assert.ok(ev.writeStart > F(38).to);
  assert.ok(ev.writeEnd < F(39).from, "надпись закончена до «Готово»");
  assert.equal(ch.progress(F(39).from), 1);
  assert.equal(ch.card(END - 1).state, "atPot");
});

test("паузы: фоновые ученики спокойны — без перелистывания и кивков", () => {
  const bg = CAST.filter((p) => !p.main);
  for (const p of tl.pauses) {
    const s = PF(p);
    for (const f of frames(s.from, s.to + 1)) {
      for (const x of bg) {
        assert.equal(ch.bgItem(x, f).flip, 0, `${x.id}, кадр ${f}: страница`);
        assert.equal(ch.bg(x).pose(f).nod ?? 0, 0, `${x.id}, кадр ${f}: кивок`);
      }
    }
    // перелистывание длится 0,8 с (24 кадра)
    for (const fl of ch.events.pageFlips) assert.ok(fl.at + 24 <= s.from || fl.at > s.to, `${fl.id}: страница в паузе ${p.id} (кадр ${fl.at})`);
  }
});

test("монтаж: непрерывен, без склеек в паузах, финал — общий план класса", () => {
  const shots = buildShots(tl, ch);
  assert.equal(shots[0].from, 0);
  for (let i = 0; i < shots.length; i++) {
    assert.ok(shots[i].to > shots[i].from, `пустой план: ${shots[i].label}`);
    if (i > 0) assert.equal(shots[i].from, shots[i - 1].to, shots[i].label);
  }
  assert.equal(shots.at(-1).to, END);
  for (const p of tl.pauses) {
    const s = PF(p);
    const shot = shots.find((x) => x.from <= s.from && s.from < x.to);
    assert.ok(shot, `пауза ${p.id}: нет плана`);
    assert.ok(shot.to >= s.to, `пауза ${p.id}: склейка в кадре ${shot.to} внутри паузы ${s.from}–${s.to} («${shot.label}»)`);
    assert.equal(typeof shot.cam, "object", `пауза ${p.id}: камера неподвижна`);
  }
  const last = shots.at(-1);
  assert.equal(last.label, "финал: класс");
  assert.equal(last.kind, "room");
  assert.deepEqual(last.cam, CAM.wide);
  assert.ok(last.to - last.from >= 120, `финал ${last.to - last.from} кадров`);
});

test("финал: все четверо сидят на своих местах", () => {
  const who = [
    ["yusuf", ch.yusuf, SEATS_MAIN.yusuf],
    ["amir", ch.amir, SEATS_MAIN.amir],
    ["bilal", ch.bilal, SEATS_MAIN.bilal],
    ["teacher", ch.teacher, AT_TABLE.teacher],
  ];
  for (const f of [ch.events.allSeated, END - 1]) {
    for (const [name, ctl, seat] of who) {
      assert.equal(ctl.pose(f).floorSit, 1, `${name}, кадр ${f}: не сидит`);
      const p = ctl.place(f);
      assert.ok(Math.abs(p.x - seat.x) < 0.5 && Math.abs(p.y - seat.y) < 0.5, `${name}, кадр ${f}: (${p.x.toFixed(0)}, ${p.y.toFixed(0)}) вместо (${seat.x}, ${seat.y})`);
    }
  }
});

test("касания: держимые предметы, земля и плечо — в пределах длины руки", () => {
  const ev = ch.events;
  const looks = { teacher: TEACHER.look.build, amir: castById("amir").look.build, bilal: castById("bilal").look.build, yusuf: castById("yusuf").look.build };
  const touchSpans = {
    teacher: [[ev.soilTouch[0], ev.soilTouch[1]]],
    yusuf: [[ev.touch.from + 10, ev.touch.to - 6]],
  };
  const bad = [];
  for (const who of Object.keys(looks)) {
    const ctl = ch[who];
    for (let f = 0; f < END; f++) {
      const inTouch = (touchSpans[who] ?? []).some(([a, b]) => f >= a && f <= b);
      if (!ctl.holding(f) && !inTouch) continue;
      const pose = ctl.pose(f);
      for (const [side, key] of [[-1, "armL"], [1, "armR"]]) {
        const a = pose[key];
        if (!a?.target || a.elbow === "hang") continue;
        if (!["fist", "pinch", "point", "open"].includes(a.shape ?? "relax")) continue;
        const s = shoulderOf(looks[who], ctl.place(f), ctl.face(f), pose, side);
        const r = Math.hypot(a.target.x - s.x, a.target.y - s.y) / s.reach;
        if (r > 0.985) bad.push(`${who} ${key} кадр ${f}: ${(r * 100).toFixed(0)}%`);
      }
    }
  }
  assert.deepEqual(bad.slice(0, 12), [], `рука не достаёт (${bad.length} кадров)`);
});

test("состав в кадре: в первом и финальном общем плане видны все 25 мальчиков и учитель", () => {
  const shots = buildShots(tl, ch);
  const camAt = (f) => {
    const s = shots.find((x) => f >= x.from && f < x.to);
    return typeof s.cam === "function" ? s.cam(f) : s.cam;
  };
  const people = [...CAST.map((p) => ({ id: p.id, ctl: p.main ? ch[p.id] : ch.bg(p) })), { id: "teacher", ctl: ch.teacher }];
  const check = (f, label) => {
    const cam = camAt(f);
    assert.equal(cam.zoom, CAM.wide.zoom, `${label}: кадр ${f} — не общий план`);
    const hw = 960 / cam.zoom;
    const hh = 540 / cam.zoom;
    for (const { id, ctl } of people) {
      const pl = ctl.place(f);
      const sit = ctl.pose(f).floorSit ?? 0;
      const top = pl.y - pl.h * (sit > 0.5 ? 0.62 : 1.0);
      assert.ok(pl.x - 0.08 * pl.h > cam.x - hw && pl.x + 0.08 * pl.h < cam.x + hw, `${label}: ${id} за краем кадра по x`);
      assert.ok(top > cam.y - hh && pl.y < cam.y + hh, `${label}: ${id} за краем кадра по y`);
    }
  };
  assert.equal(people.length, 26);
  check(ch.events.doorClosed + 40, "первый общий план");
  for (let f = MF("финал: класс").from; f < END; f += 15) check(f, "финал");
});
