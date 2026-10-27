// Проверки мини-фильма 80-1-12 «Аллах слышит меня?» (node --test):
// сценарий (37 реплик, точный текст, говорящие), шкала и три паузы ровно по
// 150 кадров, деревянная картинка (ровно 6 деталей, состояния 3/6 → 4/6 →
// 5/6 → 6/6, деталь двигается только в руке, неверный поворот не подходит),
// коробка, класс (25 мальчиков + учитель, все в последнем общем плане),
// монтаж, озвучка (один провайдер, один голос на роль).
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { FILM, L80_LINES, L80_PAUSES, L80_SCENES, VOICES, lineFile } from "../src/lesson80/film-1-12/script.ts";
import { buildTimeline, checkTimeline, estimateManifest, markOf, pauseFrames } from "../src/lesson80/film-1-12/timeline.ts";
import { buildChoreo } from "../src/lesson80/film-1-12/choreo.ts";
import { buildShots, CAM } from "../src/lesson80/film-1-12/shots.ts";
import { BOX, fitsAt, PICTURE, PIECES, pieceById, S, slotOf, START_PLACED } from "../src/lesson80/film-1-12/puzzle.ts";
import { CAST, TEACHER, bgPlace } from "../src/lesson80/film-1-12/cast.ts";
import { SEAT } from "../src/lesson80/film-1-12/layout.ts";
import { PUPILS } from "../src/lesson80/characters/characterConfig.ts";

const MANIFEST = `public/${FILM.voiceDir}/manifest.json`;
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : estimateManifest();
const tl = buildTimeline(manifest);
const ch = buildChoreo(tl);
const FPS = FILM.fps;
const F = (s) => Math.round(s * FPS);
const sceneEnd = (id) => F(tl.scenes.find((s) => s.id === id).to) - 1;

// Канонический текст задания (порядок и говорящие).
const CANON = [
  ["yusuf", "Аллах, помоги мне собрать картинку."],
  ["amir", "Ты что-то сказал?"],
  ["yusuf", "Я попросил Аллаха помочь. Но очень тихо."],
  ["yusuf", "Мухаммад, а Аллах меня слышит?"],
  ["muhammad", "Как вы считаете, ребята?"],
  ["bilal", "Да. Аллах слышит."],
  ["muhammad", "Верно. В Коране Аллах назван Слышащим. Тебе не нужно кричать, чтобы Аллах услышал твою просьбу."],
  ["yusuf", "Даже тихо-тихо?"],
  ["muhammad", "Да."],
  ["muhammad", "Такую просьбу к Аллаху называют дуа."],
  ["yusuf", "Значит, я уже сделал дуа?"],
  ["muhammad", "Да. Ты попросил Аллаха помочь. В Коране говорится, что Он отвечает на обращение того, кто Его просит."],
  ["bilal", "О чём можно просить?"],
  ["muhammad", "О хорошем: об учении, здоровье, помощи себе и другим."],
  ["muhammad", "Какими словами Юсуф может попросить помощи в учёбе?"],
  ["yusuf", "Аллах, помоги мне понять и научиться."],
  ["amir", "А я попрошу: «Аллах, помоги мне быть хорошим другом»."],
  ["muhammad", "Хорошие просьбы."],
  ["yusuf", "Я попросил. А почему картинка ещё не собралась?"],
  ["muhammad", "Мы просим Аллаха помощи и сами стараемся. Дуа не означает, что всё сразу получится."],
  ["bilal", "Аллах слышит, даже если мы ещё не видим результата?"],
  ["muhammad", "Да. Продолжай обращаться к Аллаху и делать то, что зависит от тебя."],
  ["muhammad", "Что поможет Юсуфу собрать картинку?"],
  ["amir", "Посмотреть на рисунок и подобрать края. Я покажу."],
  ["yusuf", "Вот эта, с зелёным листиком?"],
  ["amir", "Поверни её. Видишь, веточка продолжается."],
  ["yusuf", "Подошла!"],
  ["bilal", "Теперь попробуй следующую сам."],
  ["yusuf", "Я собрал!"],
  ["amir", "Ты внимательно смотрел и пробовал."],
  ["yusuf", "Спасибо, Амир! И тебе, Билал!"],
  ["muhammad", "Ты учился и принимал помощь друзей."],
  ["muhammad", "Теперь ты знаешь, как можно попросить помощи."],
  ["yusuf", "Аллах слышит меня, даже если я говорю тихо."],
  ["bilal", "А дуа — это просьба к Аллаху."],
  ["amir", "Просим помощи и стараемся."],
  ["yusuf", "И можно помочь другу!"],
];

test("сценарий: 37 реплик по порядку, точный текст и говорящие, восемь сцен", () => {
  assert.equal(L80_LINES.length, 37);
  L80_LINES.forEach((l, i) => {
    assert.equal(l.id, i + 1);
    assert.equal(l.role, CANON[i][0], `№${l.id}: говорящий`);
    assert.equal(l.text, CANON[i][1], `№${l.id}: текст`);
  });
  assert.deepEqual(L80_SCENES.map((s) => s.id), ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"]);
  // нет рассказчика и групповых реплик; ни одной реплики «от Аллаха»
  assert.ok(L80_LINES.every((l) => ["muhammad", "yusuf", "amir", "bilal"].includes(l.role)));
  // тихая просьба — только реплика 1
  assert.deepEqual(L80_LINES.filter((l) => l.quiet).map((l) => l.id), [1]);
});

test("шкала: без замечаний, три паузы ровно по 5 с (150 кадров), длительность около 4 минут", () => {
  assert.deepEqual(checkTimeline(tl), []);
  assert.deepEqual(L80_PAUSES.map((p) => [p.after, p.sec]), [[5, 5], [15, 5], [23, 5]]);
  for (const p of L80_PAUSES) assert.equal(pauseFrames(tl, p.after), 150, `пауза ${p.id}`);
  for (const ps of tl.pauses) {
    // в паузе ни одна реплика не звучит (по звуку файла)
    for (const c of tl.cues) {
      const s = tl.sound[c.id];
      assert.ok(s.end <= ps.from + 1e-6 || s.start >= ps.to - 1e-6, `реплика ${c.id} звучит в паузе ${ps.id}`);
    }
  }
  assert.ok(tl.durationSec >= 225 && tl.durationSec <= 255, `длительность ${tl.durationSec}`);
  const fin = markOf(tl, "финал: класс");
  assert.ok(fin.to - fin.from >= 4 && fin.to - fin.from <= 5);
  // сцены идут по порядку и не пустые
  tl.scenes.forEach((s, i) => {
    assert.ok(s.to > s.from + 15, `сцена ${s.id} пустая`);
    if (i) assert.ok(Math.abs(s.from - tl.scenes[i - 1].to) < 1e-6);
  });
});

test("картинка: ровно 6 деталей, форма и неверный поворот", () => {
  assert.equal(PIECES.length, 6);
  assert.equal(new Set(PIECES.map((p) => p.id)).size, 6);
  const placed = new Set(START_PLACED);
  const leaf = pieceById("r0c1");
  assert.equal(fitsAt(leaf, 90, placed), false, "деталь с листиком, повёрнутая на четверть оборота, не подходит");
  assert.equal(fitsAt(leaf, 0, placed), true, "после поворота подходит");
  placed.add("r0c1");
  assert.equal(fitsAt(pieceById("r1c2"), 0, placed), true);
  placed.add("r1c2");
  assert.equal(fitsAt(pieceById("r0c2"), 0, placed), true);
});

test("картинка: контрольные состояния 3/6 … 4/6 → 5/6 → 6/6, сборка не распадается", () => {
  for (const id of ["s1", "s2", "s3", "s4", "s5"]) assert.equal(ch.placedAt(sceneEnd(id)), 3, `после ${id}`);
  assert.equal(ch.placedAt(sceneEnd("s6")), 4, "после сцены 6");
  const m5 = markOf(tl, "пятая деталь");
  const m6 = markOf(tl, "шестая деталь");
  assert.equal(ch.placedAt(F(m5.to)), 5, "пятая деталь");
  assert.equal(ch.placedAt(F(m6.from)), 5, "перед шестой");
  assert.equal(ch.placedAt(F(m6.to)), 6, "шестая деталь");
  assert.equal(ch.placedAt(sceneEnd("s8")), 6, "сцена 8");
  let prev = 3;
  for (let f = 0; f < tl.durationInFrames; f++) {
    const n = ch.placedAt(f);
    assert.ok(n >= prev && n >= 3 && n <= 6, `кадр ${f}: ${n}`);
    prev = n;
  }
  // соединение — только в отведённых действиях (не «само» после дуа)
  const turn = markOf(tl, "поворот и соединение");
  assert.equal(ch.placedAt(F(turn.from)), 3);
  assert.equal(ch.placedAt(F(turn.to)), 4);
});

test("картинка: деталь двигается только в руке Юсуфа, лежащая неподвижна и стоит точно в гнезде", () => {
  for (const p of PIECES) {
    for (let f = 0; f < tl.durationInFrames - 1; f++) {
      const a = ch.piece(p.id, f);
      const b = ch.piece(p.id, f + 1);
      const moved = Math.hypot(a.u - b.u, a.w - b.w) > 1e-6 || Math.abs(a.z - b.z) > 1e-6 || Math.abs(a.theta - b.theta) > 1e-6;
      if (moved) assert.ok(a.held || b.held, `${p.id} сдвинулась без руки в кадре ${f}`);
      if (a.held) assert.ok(["left", "right", "both"].includes(a.held), "держит только Юсуф");
      if (a.placed) {
        const s = slotOf(p);
        assert.ok(Math.abs(a.u - s.u) < 1e-6 && Math.abs(a.w - s.w) < 1e-6 && a.z === 0 && a.theta === 0, `${p.id} в картинке не в гнезде (кадр ${f})`);
      }
      if (!a.held) assert.ok(a.z < 1e-6, `${p.id} висит в воздухе без руки (кадр ${f})`);
    }
  }
});

test("картинка: лежащие отдельно детали не накрывают собранную часть и друг друга", () => {
  const half = 50 * S + 26 * S; // половина клетки + выступ
  const picture = { u0: PICTURE.u - 150 * S - 9, u1: PICTURE.u + 150 * S + 9, w0: PICTURE.w - 100 * S - 9, w1: PICTURE.w + 100 * S + 9 };
  for (let f = 0; f < tl.durationInFrames; f += 3) {
    const lying = PIECES.map((p) => ({ p, s: ch.piece(p.id, f) })).filter((x) => !x.s.held && !x.s.placed && x.s.z < 1e-6);
    for (const { p, s } of lying) {
      const inside = s.u + half > picture.u0 && s.u - half < picture.u1 && s.w + half > picture.w0 && s.w - half < picture.w1;
      assert.ok(!inside, `${p.id} лежит на собранной части (кадр ${f})`);
    }
    for (let i = 0; i < lying.length; i++)
      for (let j = i + 1; j < lying.length; j++) assert.ok(Math.hypot(lying[i].s.u - lying[j].s.u, lying[i].s.w - lying[j].s.w) > 2 * half - 4, `${lying[i].p.id} и ${lying[j].p.id} накладываются (кадр ${f})`);
  }
});

test("коробка: пустая, двигается только в руках (Амир → оба → Юсуф), в конце рядом с картинкой", () => {
  const m = markOf(tl, "коробка");
  const seq = [];
  for (let f = 0; f < tl.durationInFrames - 1; f++) {
    const a = ch.box(f);
    const b = ch.box(f + 1);
    const moved = Math.hypot(a.u - b.u, a.w - b.w) > 1e-6 || Math.abs(a.z - b.z) > 1e-6;
    if (moved) assert.ok(a.holder || b.holder, `коробка сдвинулась без рук в кадре ${f}`);
    if (a.holder && seq[seq.length - 1] !== a.holder) seq.push(a.holder);
    if (!a.holder) assert.ok(a.z < 1e-6, `коробка в воздухе без рук (кадр ${f})`);
  }
  assert.deepEqual(seq, ["amir", "both", "yusuf"]);
  assert.ok(F(m.from) <= tl.durationInFrames);
  const end = ch.box(tl.durationInFrames - 1);
  assert.equal(end.u, BOX.end.u);
  const pictureEdge = PICTURE.u + 150 * S;
  const boxNear = end.u - BOX.w / 2;
  assert.ok(boxNear > pictureEdge && boxNear - pictureEdge < 40, "коробка стоит рядом с готовой картинкой, не на ней");
  // все детали остались в картинке, ни одна не ушла в коробку
  assert.equal(ch.placedAt(tl.durationInFrames - 1), 6);
});

test("класс: ровно 25 мальчиков (3 главных + 22), учитель отдельно, все в последнем общем плане", () => {
  assert.equal(PUPILS.length, 25);
  assert.equal(CAST.length, 25);
  assert.equal(new Set(CAST.map((p) => p.id)).size, 25);
  assert.equal(CAST.filter((p) => p.main).length, 3);
  assert.ok(CAST.every((p) => p.age >= 4 && p.age <= 12));
  assert.equal(TEACHER.id, "muhammad");
  assert.ok(!CAST.some((p) => p.id === TEACHER.id));
  const ages = new Set(CAST.map((p) => p.age));
  assert.ok(ages.size >= 7, "заметная разница в возрасте");
  // последний общий план: все 25 и учитель в кадре (голова и туловище внутри)
  const f = tl.durationInFrames - 1;
  const cam = CAM.wide;
  const vis = { x0: cam.x - 960 / cam.zoom, x1: cam.x + 960 / cam.zoom, y0: cam.y - 540 / cam.zoom, y1: cam.y + 540 / cam.zoom };
  const places = CAST.map((p) => (p.main ? ch[p.id].place(f) : bgPlace(p)));
  places.push(ch.teacher.place(f));
  for (const pl of places) {
    assert.ok(pl.x - 0.15 * pl.h > vis.x0 && pl.x + 0.15 * pl.h < vis.x1, `x ${pl.x} вне кадра`);
    assert.ok(pl.y - 0.62 * pl.h > vis.y0 && pl.y < vis.y1, `y ${pl.y} вне кадра`);
  }
  // три друга и учитель на своих местах в конце
  assert.equal(ch.teacher.place(f).x, SEAT.teacher.x);
  assert.equal(ch.amir.place(f).x, SEAT.amirNear.x);
});

test("монтаж: непрерывный, без вспышек, последний план — общий план класса", () => {
  const shots = buildShots(tl);
  assert.equal(shots[0].from, 0);
  shots.forEach((s, i) => {
    if (i) assert.equal(s.from, shots[i - 1].to, `зазор перед «${s.label}»`);
    assert.ok(s.to - s.from >= 18, `слишком короткий план «${s.label}» (${s.to - s.from} кадров)`);
  });
  const last = shots[shots.length - 1];
  assert.ok(last.to >= tl.durationInFrames);
  assert.equal(last.kind, "room");
  const cam = typeof last.cam === "function" ? last.cam(tl.durationInFrames - 1) : last.cam;
  assert.ok(Math.abs(cam.zoom - CAM.wide.zoom) < 0.01, "в конце — общий план");
});

test("озвучка: 37 реплик одного провайдера, один голос на роль, текст совпадает, без перегруза", { skip: !existsSync(MANIFEST) }, () => {
  assert.equal(manifest.partial, false);
  assert.equal(manifest.lines.length, 37);
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
    assert.ok(c.from <= c.chars[0].start + 1e-6, `№${c.id}: реплика начинается позже первой буквы`);
  }
});

test("учитель: подходит, садится один раз и дальше сидит рядом с Юсуфом", () => {
  const sit = markOf(tl, "учитель садится");
  let seated = false;
  for (let f = 0; f < tl.durationInFrames; f += 2) {
    const fs = ch.teacher.pose(f).floorSit ?? 0;
    if (fs >= 0.999) seated = true;
    if (seated) assert.ok(fs >= 0.999, `учитель встал в кадре ${f}`);
  }
  assert.ok(seated);
  assert.equal(ch.teacher.place(F(sit.to)).x, SEAT.teacher.x);
  assert.ok(Math.abs(SEAT.teacher.x - SEAT.yusuf.x) < 300, "садится рядом с Юсуфом (через край стола)");
});
