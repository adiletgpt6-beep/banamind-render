// Проверки мини-фильма 80-1-13 «А Аллах видел?» (node --test): сценарий (35
// реплик, точный текст, говорящие), шкала и три паузы ровно по 150 кадров,
// четыре книжки (ковёр/стол → руки → полка, без двойников, красная неподвижна
// всю паузу 3), шесть деталей (все в коробке, коробка закрыта и на полке),
// учитель не видит первую помощь (повернут к доске), класс (25 мальчиков +
// учитель, все в первом и последнем общем плане), монтаж, озвучка.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { FILM, L80_LINES, L80_PAUSES, L80_SCENES, VOICES, lineFile } from "../src/lesson80/film-1-13/script.ts";
import { buildTimeline, checkTimeline, cueById, estimateManifest, markOf, pauseFrames } from "../src/lesson80/film-1-13/timeline.ts";
import { BOOKS_ALL, buildChoreo } from "../src/lesson80/film-1-13/choreo.ts";
import { buildShots, CAM } from "../src/lesson80/film-1-13/shots.ts";
import { PIECES } from "../src/lesson80/film-1-12/puzzle.ts";
import { CAST, TEACHER, bgPlace } from "../src/lesson80/film-1-13/cast.ts";
import { GREEN_FLOOR, SHELF, SHELF_SPOT, SPOT } from "../src/lesson80/film-1-13/layout.ts";
import { PUPILS } from "../src/lesson80/characters/characterConfig.ts";

const MANIFEST = `public/${FILM.voiceDir}/manifest.json`;
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : estimateManifest();
const tl = buildTimeline(manifest);
const ch = buildChoreo(tl);
const FPS = FILM.fps;
const F = (s) => Math.round(s * FPS);
const M = (label) => {
  const m = markOf(tl, label);
  return { from: F(m.from), to: F(m.to) };
};
const L = (id) => {
  const c = cueById(tl, id);
  return { from: F(c.from), to: F(c.to) };
};
const END = tl.durationInFrames - 1;

// Канонический текст задания (порядок и говорящие).
const CANON = [
  ["muhammad", "Спасибо, Амир, что убрал детали."],
  ["amir", "Коробка уже на месте."],
  ["yusuf", "Мухаммад, вы видели, как я поднял книгу?"],
  ["muhammad", "Нет, я готовил задание у доски."],
  ["yusuf", "А Аллах видел?"],
  ["muhammad", "Как вы считаете, ребята?"],
  ["bilal", "Да. Аллах видит наши поступки."],
  ["muhammad", "В Коране говорится: «Аллах видит все, что вы совершаете»."],
  ["yusuf", "Даже если люди не заметили?"],
  ["muhammad", "Да. Аллах — наш Создатель. В Коране Он назван Видящим."],
  ["amir", "Теперь книга на полке. Её легко найти."],
  ["muhammad", "Вот какую пользу принесла помощь Юсуфа. Спасибо, что позаботился."],
  ["yusuf", "Но я только поднял книжку."],
  ["muhammad", "Маленькое добро тоже важно. В Коране сказано: «Тот, кто сделал добро весом в мельчайшую частицу, увидит его»."],
  ["yusuf", "Совсем маленькое?"],
  ["muhammad", "Да. Даже маленькое добро не проходит напрасно."],
  ["bilal", "Значит, помочь может каждый из нас."],
  ["muhammad", "Какое доброе дело можно сделать в нашей комнате?"],
  ["amir", "Помочь убрать карандаши."],
  ["bilal", "Спросить, нужна ли помощь."],
  ["yusuf", "Улыбнуться другу!"],
  ["muhammad", "Да. Даже добрая улыбка — добро."],
  ["yusuf", "А если меня похвалят, это плохо?"],
  ["muhammad", "Похвала может радовать. Можно сказать «спасибо». Мы стараемся делать добро ради Аллаха и помогать людям."],
  ["bilal", "Главное — зачем мы его делаем?"],
  ["muhammad", "Да. Важно доброе намерение."],
  ["yusuf", "Я хочу, чтобы другу было легче."],
  ["muhammad", "Как Юсуф может помочь Амиру?"],
  ["yusuf", "Я отнесу эту книжку."],
  ["amir", "Спасибо. Положи её рядом с моими."],
  ["amir", "Вместе легче."],
  ["yusuf", "Я помогал, чтобы тебе было легче."],
  ["muhammad", "Аллах видит наши добрые поступки."],
  ["bilal", "И маленькое добро тоже важно."],
  ["yusuf", "Теперь всё на месте!"],
];

test("сценарий: 35 реплик по порядку, точный текст и говорящие, восемь сцен", () => {
  assert.equal(L80_LINES.length, 35);
  L80_LINES.forEach((l, i) => {
    assert.equal(l.id, i + 1);
    assert.equal(l.role, CANON[i][0], `№${l.id}: говорящий`);
    assert.equal(l.text, CANON[i][1], `№${l.id}: текст`);
    assert.ok(!/\d|\[|пауза/i.test(l.text), `№${l.id}: в тексте нет служебных пометок`);
  });
  assert.equal(L80_SCENES.length, 8);
  const words = L80_LINES.map((l) => l.text.split(/\s+/).filter((w) => /\p{L}/u.test(w)).length).reduce((a, b) => a + b, 0);
  assert.ok(words > 180 && words < 230, `слов ${words}`);
});

test("шкала: без замечаний, три паузы ровно по 5 с (150 кадров), длительность 3:20–4:00", () => {
  assert.deepEqual(checkTimeline(tl), []);
  assert.equal(L80_PAUSES.length, 3);
  for (const p of L80_PAUSES) assert.equal(pauseFrames(tl, p.after), 150, `пауза ${p.id}`);
  assert.deepEqual(L80_PAUSES.map((p) => p.after), [6, 18, 28]);
  assert.ok(tl.durationSec >= 200 && tl.durationSec <= 240, `${tl.durationSec} с`);
  // в паузе никто не говорит
  for (const p of tl.pauses) for (const c of tl.cues) assert.ok(tl.sound[c.id].end <= p.from + 1e-6 || tl.sound[c.id].start >= p.to - 1e-6, `реплика ${c.id} заходит в паузу ${p.id}`);
  const fin = markOf(tl, "финал: класс");
  assert.ok(fin.to - fin.from >= 4 && fin.to - fin.from <= 5);
});

test("книжки: ровно четыре, каждая в одном месте; маршруты ковёр/стол → руки → полка", () => {
  assert.deepEqual([...BOOKS_ALL].sort(), ["blue", "green", "orange", "red"]);
  // начало
  const b0 = Object.fromEntries(BOOKS_ALL.map((id) => [id, ch.book(id, 0)]));
  assert.equal(b0.green.where, "floor");
  assert.equal(b0.green.x, GREEN_FLOOR.x);
  for (const id of ["blue", "orange", "red"]) assert.equal(b0[id].where, "table");
  // переходы владельца — ровно по одному разу на каждом шаге, без возврата
  const order = { floor: 0, table: 0, hands: 1, shelf: 2 };
  for (const id of BOOKS_ALL) {
    let prev = ch.book(id, 0);
    const holders = new Set();
    for (let f = 1; f <= END; f++) {
      const b = ch.book(id, f);
      assert.ok(order[b.where] >= order[prev.where], `${id}: вернулась из «${prev.where}» в «${b.where}» (кадр ${f})`);
      if (b.holder) holders.add(b.holder);
      prev = b;
    }
    assert.equal(holders.size, 1, `${id}: один переносчик`);
  }
  assert.equal(ch.book("green", M("Юсуф поднимает книжку").to).holder, "yusuf");
  assert.equal(ch.book("blue", M("Амир несёт книжки").from + 5).holder, "amir");
  assert.equal(ch.book("orange", M("Амир несёт книжки").from + 5).holder, "amir");
  // после сцены 1: зелёная на полке, остальные на столике
  const s1 = F(tl.scenes[0].to) - 1;
  assert.equal(ch.book("green", s1).where, "shelf");
  for (const id of ["blue", "orange", "red"]) assert.equal(ch.book(id, s1).where, "table");
  // финал: все четыре на полке, на своих местах
  for (const id of BOOKS_ALL) {
    const b = ch.book(id, END);
    assert.equal(b.where, "shelf", id);
    assert.equal(b.x, SHELF_SPOT[id].x, id);
  }
  // на полке зелёная — в левом отделении, три остальные — в правом
  assert.ok(SHELF_SPOT.green.x < SHELF.mid);
  for (const id of ["blue", "orange", "red"]) assert.ok(SHELF_SPOT[id].x > SHELF.mid, id);
});

test("пауза 3: синяя и оранжевая уже на полке, красная неподвижно лежит на столике, Юсуф её не трогает", () => {
  const p3 = tl.pauses[2];
  const from = F(p3.from);
  const to = F(p3.to);
  const r0 = ch.book("red", from);
  for (let f = from; f <= to; f++) {
    const r = ch.book("red", f);
    assert.equal(r.where, "table", `кадр ${f}`);
    assert.equal(r.holder, null);
    assert.equal(r.x, r0.x);
    assert.equal(r.y, r0.y);
    assert.equal(ch.book("blue", f).where, "shelf");
    assert.equal(ch.book("orange", f).where, "shelf");
    // Юсуф на месте разговора, не идёт и не наклоняется
    const yp = ch.yusuf.place(f);
    assert.equal(yp.x, SPOT.yusufTalk.x);
    assert.equal(ch.yusuf.pose(f).crouch ?? 0, 0);
  }
  // красную Юсуф берёт только после своего ответа (№29)
  const firstHeld = (() => {
    for (let f = 0; f <= END; f++) if (ch.book("red", f).holder) return f;
    return -1;
  })();
  assert.ok(firstHeld > L(29).to, "красная в руках только после ответа");
});

test("детали: ровно шесть, все последовательно в коробке; коробка закрыта и стоит на полке до конца", () => {
  assert.equal(PIECES.length, 6);
  const pack = M("Амир кладёт детали");
  for (const p of PIECES) {
    assert.equal(ch.piece(p.id, 0).inBox, false);
    assert.equal(ch.piece(p.id, pack.to).inBox, true, `${p.id} в коробке к концу укладки`);
    // одна рука, по одной детали
  }
  for (let f = 0; f <= pack.to; f++) assert.ok(PIECES.filter((p) => ch.piece(p.id, f).held).length <= 1, `кадр ${f}: две детали в руке`);
  const close = M("Амир закрывает коробку");
  assert.equal(ch.box(close.to).lid.on, true);
  const s1 = F(tl.scenes[0].to) - 1;
  assert.equal(ch.box(s1).where, "shelf", "к концу сцены 1 коробка на полке");
  for (let f = s1; f <= END; f += 10) {
    const b = ch.box(f);
    assert.equal(b.where, "shelf");
    assert.equal(b.lid.on, true);
    assert.equal(b.inside, 6);
  }
});

test("учитель не видит первую помощь: всё действие Юсуфа с книжкой он повернут к доске", () => {
  const from = M("Юсуф замечает книжку").from;
  const to = M("Юсуф ставит книжку").to;
  for (let f = from; f <= to; f++) assert.ok(ch.teacher.face(f) < -0.5, `кадр ${f}: учитель смотрит ${ch.teacher.face(f).toFixed(2)}`);
  // и стоит у доски левее полки
  assert.ok(ch.teacher.place(from).x < SHELF.x1 - 300);
  // благодарность Юсуфу — только после его рассказа (№3)
  assert.ok(L(12).from > L(3).to);
});

test("класс: ровно 25 мальчиков (3 главных + 22), учитель отдельно; все в первом и последнем общем плане", () => {
  assert.equal(PUPILS.length, 25);
  assert.equal(CAST.length, 25);
  assert.equal(new Set(CAST.map((p) => p.id)).size, 25);
  assert.equal(CAST.filter((p) => p.main).length, 3);
  assert.ok(CAST.every((p) => p.age >= 4 && p.age <= 12));
  assert.equal(TEACHER.id, "muhammad");
  assert.ok(!CAST.some((p) => p.id === TEACHER.id));
  for (const [f, cam] of [[0, CAM.wide], [END, CAM.final]]) {
    const vis = { x0: cam.x - 960 / cam.zoom, x1: cam.x + 960 / cam.zoom, y0: cam.y - 540 / cam.zoom, y1: cam.y + 540 / cam.zoom };
    const places = CAST.map((p) => (p.main ? ch[p.id].place(f) : bgPlace(p)));
    places.push(ch.teacher.place(f));
    for (const pl of places) {
      assert.ok(pl.x - 0.15 * pl.h > vis.x0 && pl.x + 0.15 * pl.h < vis.x1, `кадр ${f}: x ${pl.x} вне кадра`);
      assert.ok(pl.y - 0.62 * pl.h > vis.y0 && pl.y < vis.y1, `кадр ${f}: y ${pl.y} вне кадра`);
    }
  }
  // в конце Юсуф и Амир сидят на своих местах
  assert.equal(ch.yusuf.pose(END).floorSit, 1);
  assert.equal(ch.amir.pose(END).floorSit, 1);
});

test("монтаж: непрерывный, вид сверху только в сцене 1, паузы — неподвижный план, в конце общий план", () => {
  const shots = buildShots(tl);
  assert.equal(shots[0].from, 0);
  shots.forEach((s, i) => {
    if (i) assert.equal(s.from, shots[i - 1].to, `зазор перед «${s.label}»`);
    assert.ok(s.to - s.from >= 20, `слишком короткий план «${s.label}» (${s.to - s.from} кадров)`);
    if (s.kind === "top") assert.ok(s.to <= F(tl.scenes[0].to), "вид сверху только на руки Амира в сцене 1");
  });
  assert.ok(shots.length >= 24 && shots.length <= 45, `планов ${shots.length}`);
  for (const p of tl.pauses) {
    const s = shots.find((x) => x.from <= F(p.from) && x.to >= F(p.to));
    assert.ok(s, `пауза ${p.id} — в одном плане`);
    const a = s.cam(F(p.from));
    const b = s.cam(F(p.to));
    assert.deepEqual(a, b, `пауза ${p.id}: камера неподвижна`);
  }
  const last = shots[shots.length - 1];
  assert.ok(last.to >= tl.durationInFrames);
  const cam = last.cam(END);
  assert.ok(Math.abs(cam.zoom - CAM.final.zoom) < 0.01, "в конце — общий план");
});

test("озвучка: 35 реплик одного провайдера, один голос на роль, текст совпадает, без перегруза", { skip: !existsSync(MANIFEST) }, () => {
  assert.equal(manifest.partial, false);
  assert.equal(manifest.lines.length, 35);
  const voiceOf = {};
  for (const l of L80_LINES) {
    const ml = manifest.lines.find((x) => x.id === l.id);
    assert.ok(ml, `№${l.id}`);
    assert.equal(ml.text, l.text);
    assert.equal(ml.file, lineFile(l.id));
    assert.ok(existsSync(`public/${FILM.voiceDir}/${ml.file}`));
    assert.equal(ml.provider, manifest.provider);
    if (manifest.provider === "elevenlabs") {
      assert.equal(ml.voiceId, VOICES[l.role].elevenlabs.voiceId, `№${l.id}: голос роли`);
      (voiceOf[l.role] ??= new Set()).add(ml.voiceId);
    }
    assert.ok(ml.peakDb <= -1, `№${l.id}: пик ${ml.peakDb}`);
    assert.ok(ml.speechEnd > ml.speechStart);
  }
  for (const v of Object.values(voiceOf)) assert.equal(v.size, 1);
});

test("губы: рот открывается не позже чем через кадр после начала голоса", { skip: !existsSync(MANIFEST) }, () => {
  for (const c of tl.cues) {
    const ml = manifest.lines.find((x) => x.id === c.id);
    const onset = c.audioFrom + Math.max(0, ml.env.findIndex((v) => v > 0.3)) / FILM.fps;
    assert.ok(c.chars[0].start <= onset + 1.5 / FILM.fps, `№${c.id}: первая буква ${c.chars[0].start.toFixed(2)} с, голос с ${onset.toFixed(2)} с`);
  }
});
