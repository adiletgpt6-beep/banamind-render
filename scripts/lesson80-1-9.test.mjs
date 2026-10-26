// Проверки данных Lesson80-1-9 «Кому сказать спасибо?» (node --test):
// канонический текст 45 реплик, состав класса, журнал 25 салфеток, паузы
// 150/150/180 кадров по звуку, речь и жевание не пересекаются, тарелка и
// кусочек яблока, тишина и неподвижность в паузах, надписи, озвучка.
// Шкала строится по озвучке из ветки (манифест), без неё — по оценке.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { FILM, L80_LINES, L80_PAUSES, VOICES, CAPTIONS, lineFile } from "../src/lesson80/film-1-9/script.ts";
import { buildTimeline, checkTimeline, cueById, estimateManifest, pauseFrames } from "../src/lesson80/film-1-9/timeline.ts";
import { buildChoreo } from "../src/lesson80/film-1-9/choreo.ts";
import { buildShots } from "../src/lesson80/film-1-9/shots.ts";
import { BG_IDS, CAST, castById, seatPlace } from "../src/lesson80/film-1-9/cast.ts";
import { checkNapkinLog, givenCountAt, hasNapkinAt, trayCountAt } from "../src/lesson80/film-1-9/napkins.ts";
import { PLATES } from "../src/lesson80/film-1-9/layout.ts";
import { lipAt } from "../src/lesson80/core/lips.ts";
import { PUPILS, TEACHER } from "../src/lesson80/characters/characterConfig.ts";

const MANIFEST = `public/${FILM.voiceDir}/manifest.json`;
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : estimateManifest();
const tl = buildTimeline(manifest);
const ch = buildChoreo(tl);
const { shots, captions } = buildShots(tl, ch);
const FPS = FILM.fps;
const f = (s) => Math.round(s * FPS);
const sceneFrom = (id) => f(tl.scenes.find((s) => s.id === id).from);
const sceneTo = (id) => f(tl.scenes.find((s) => s.id === id).to);

// Канонический текст задания (неизменяемый эталон).
const CANON = [
  ["yusuf", "Спасибо, Мухаммад!"],
  ["muhammad", "Пожалуйста, Юсуф."],
  ["yusuf", "Но ведь яблоко выросло на дереве, которое создал Аллах. Кому я должен сказать спасибо?"],
  ["muhammad", "Мы благодарим Аллаха за Его дары и людей — за их заботу."],
  ["yusuf", "И Аллаха, и вас?"],
  ["muhammad", "Да. Аллах создал яблони и дал им возможность расти и приносить плоды."],
  ["amir", "А люди ухаживали за садом и собирали яблоки?"],
  ["muhammad", "Да. А я купил их, помыл и нарезал."],
  ["yusuf", "А как поблагодарить Аллаха?"],
  ["muhammad", "Можно сказать: «Альхамдулиллях»."],
  ["amir", "А что это означает?"],
  ["muhammad", "«Хвала Аллаху». Этими словами мы можем выражать благодарность Аллаху."],
  ["bilal", "Мы помним, что еда — дар Аллаха?"],
  ["muhammad", "Да. Мы замечаем то, что Он нам дал."],
  ["bilal", "А в Коране говорится о благодарности?"],
  ["muhammad", "Да. Коран учит нас благодарить Аллаха за Его милости."],
  ["yusuf", "Милости — это что?"],
  ["muhammad", "Добро, которое Аллах нам дал. Например, еда и вода."],
  ["amir", "То, что у нас бывает каждый день?"],
  ["muhammad", "Да. Даже привычное добро важно замечать."],
  ["yusuf", "Билал, спасибо, что принёс салфетки!"],
  ["bilal", "Пожалуйста."],
  ["yusuf", "Вот так можно?"],
  ["muhammad", "Да. Мы благодарим людей за добро, которое они нам делают."],
  ["amir", "Значит, когда мама готовит или друг помогает, мы тоже говорим спасибо."],
  ["muhammad", "Верно."],
  ["yusuf", "Билал всем раздал салфетки. А у него нет!"],
  ["bilal", "Я ещё не взял себе."],
  ["yusuf", "Вот тебе, Билал."],
  ["bilal", "Спасибо, Юсуф."],
  ["muhammad", "Вы заботитесь друг о друге. Это хороший поступок."],
  ["amir", "Значит, благодарность — это не только слова?"],
  ["muhammad", "Её можно показывать и делами: помогать друг другу и бережно относиться к еде."],
  ["muhammad", "Что означает «Альхамдулиллях»?"],
  ["amir", "Хвала Аллаху."],
  ["muhammad", "Кого мы благодарим за заботу и помощь?"],
  ["bilal", "Людей, которые нам помогают."],
  ["muhammad", "Как можно проявить благодарность делом?"],
  ["yusuf", "Помочь другому. Я принёс Билалу салфетку!"],
  ["muhammad", "Да. Мы можем благодарить словами и добрыми поступками."],
  ["yusuf", "Бисмиллях."],
  ["yusuf", "Альхамдулиллях."],
  ["yusuf", "И спасибо вам за угощение, Мухаммад!"],
  ["muhammad", "Пожалуйста, Юсуф."],
  ["yusuf", "Я благодарю Аллаха и людей, которые обо мне заботятся."],
];

test("ровно 45 реплик: порядок, говорящие и точный текст; на шкале по порядку", () => {
  assert.equal(L80_LINES.length, 45);
  L80_LINES.forEach((l, i) => {
    assert.equal(l.id, i + 1);
    assert.equal(l.role, CANON[i][0], `№${l.id}: говорящий`);
    assert.equal(l.text, CANON[i][1], `№${l.id}: текст`);
  });
  assert.equal(tl.cues.length, 45);
  tl.cues.forEach((c, i) => assert.equal(c.id, i + 1));
  assert.deepEqual(checkTimeline(tl), []);
  assert.ok(tl.durationSec >= 210 && tl.durationSec <= 260, `длительность ${tl.durationSec}`);
});

test("класс: ровно 25 разных мальчиков (3 главных + 22), учитель отдельно, места не совпадают", () => {
  assert.equal(CAST.length, 25);
  assert.equal(new Set(CAST.map((p) => p.castId)).size, 25);
  assert.equal(new Set(CAST.map((p) => p.id)).size, 25);
  assert.equal(CAST.filter((p) => p.main).length, 3);
  assert.equal(BG_IDS.length, 22);
  assert.ok(CAST.every((p) => PUPILS.some((x) => x.id === p.id)), "только ученики серии");
  assert.ok(!CAST.some((p) => p.id === TEACHER.id));
  for (const a of CAST)
    for (const b of CAST) {
      if (a === b) continue;
      const pa = seatPlace(a);
      const pb = seatPlace(b);
      if (Math.abs(pa.y - pb.y) < 20) assert.ok(Math.abs(pa.x - pb.x) >= 150, `${a.castId} и ${b.castId} сидят вплотную`);
    }
  // возраст: 7 младших 4–6? — фоновые в диапазоне 4–12, ряд A младше ряда C
  const age = (row) => CAST.filter((p) => p.seat.row === row).map((p) => p.age);
  const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;
  assert.ok(avg(age("A")) < avg(age("C")));
  assert.ok(CAST.every((p) => p.age >= 4 && p.age <= 12));
});

test("салфетки: журнал без нарушений и контрольные точки по сценам", () => {
  const roster = [...BG_IDS, "amir", "yusuf", "bilal"];
  assert.deepEqual(checkNapkinLog(ch.log, { roster, yusufNotBefore: sceneFrom("s5"), duration: tl.durationInFrames }), []);
  const ev = ch.log.events;
  assert.deepEqual(ev.slice(0, 22).map((e) => e.recipient), BG_IDS);
  // до передачи Юсуфу салфетки уже у 22 фоновых и Амира
  const y = ev[23];
  for (const e of ev.slice(0, 23)) assert.ok(e.release <= y.take);
  // конец сцены 3: 23 выдано, на подносе 2; у Юсуфа и Билала нет
  const s3 = sceneTo("s3") - 1;
  assert.equal(givenCountAt(ch.log, s3), 23);
  assert.equal(trayCountAt(ch.log, s3), 2);
  assert.ok(!hasNapkinAt(ch.log, "yusuf", s3) && !hasNapkinAt(ch.log, "bilal", s3));
  // сцена 4 без передач
  assert.equal(trayCountAt(ch.log, sceneTo("s4") - 1), 2);
  // конец сцены 5: 24 у других, 1 на подносе, у Билала нет
  const s5 = sceneTo("s5") - 1;
  assert.equal(givenCountAt(ch.log, s5), 24);
  assert.equal(trayCountAt(ch.log, s5), 1);
  assert.ok(!hasNapkinAt(ch.log, "bilal", s5));
  // конец сцены 6: у всех 25, на подносе 0; передача 25 — в сцене 6
  const s6 = sceneTo("s6") - 1;
  assert.equal(givenCountAt(ch.log, s6), 25);
  assert.equal(trayCountAt(ch.log, s6), 0);
  assert.ok(ev[24].take >= sceneFrom("s6") && ev[24].settle < sceneTo("s6"));
  // в каждый кадр каждая салфетка существует в одном экземпляре
  for (let t = 0; t < tl.durationInFrames; t += 2) {
    const out = ch.napkins(t);
    assert.equal(new Set(out.map((n) => n.id)).size, out.length);
    assert.equal(out.length + ch.tray(t).count, 25, `кадр ${t}`);
  }
  // своя салфетка Юсуфа лежит на месте до конца
  const own = ev[23];
  for (let t = own.settle; t < tl.durationInFrames; t += 15) {
    const n = ch.napkins(t).find((x) => x.id === own.napkin);
    assert.ok(n && n.state === "placed", `кадр ${t}`);
  }
  // после сцены 3 Билал больше не раздаёт: стоит/сидит на месте
  const sitEnd = ch.route.sitDown.to;
  assert.ok(sitEnd < f(cueById(tl, 13).from));
  const p0 = ch.bilal.place(sitEnd + 1);
  for (let t = sitEnd + 1; t < tl.durationInFrames; t += 10) assert.deepEqual(ch.bilal.place(t), p0);
});

test("паузы: ровно 150/150/180 кадров по звуку, ответ после паузы, в паузе — тишина", () => {
  for (const ps of L80_PAUSES) assert.equal(pauseFrames(tl, ps.after), ps.sec * FPS, `пауза ${ps.id}`);
  assert.equal(L80_PAUSES.reduce((a, p) => a + p.sec * FPS, 0), 480);
  const roles = ["muhammad", "yusuf", "amir", "bilal"];
  for (const p of tl.pauses) {
    for (let t = Math.ceil(p.from * FPS) + 1; t < Math.floor(p.to * FPS) - 1; t++) {
      for (const r of roles) assert.equal(lipAt(tl.cues, r, t).open, 0, `${r} двигает губами в паузе ${p.id} (кадр ${t})`);
      // ни жестов, ни кивков в паузе
      const tp = ch.teacher.pose(t);
      assert.ok(!tp.nod, `учитель кивает в паузе ${p.id}`);
      for (const id of BG_IDS) assert.ok(!ch.bg(castById(id)).pose(t).nod, `${id} кивает в паузе`);
    }
    // субтитров/надписей в паузе нет
    assert.ok(!captions.some((c) => c.to > Math.ceil(p.from * FPS) && c.from < Math.floor(p.to * FPS)), `надпись в паузе ${p.id}`);
  }
  // кроме трёх пауз — никаких долгих тишин после вопросов
  const qs = tl.cues.filter((c) => /\?$/.test(L80_LINES[c.id - 1].text) && !L80_PAUSES.some((p) => p.after === c.id));
  for (const c of qs) {
    const n = tl.cues.find((x) => x.id === c.id + 1);
    if (n) assert.ok(n.from - c.to < 3.2, `после вопроса ${c.id} слишком долго (${(n.from - c.to).toFixed(2)} с)`);
  }
});

test("еда: «Бисмиллях» до еды, кусочек правой рукой, жевание без речи, «Альхамдулиллях» после", () => {
  const ev = ch.events;
  const l41 = cueById(tl, 41);
  const l42 = cueById(tl, 42);
  assert.ok(f(l41.to) < ev.sliceTake - 4, "«Бисмиллях» звучит до взятия кусочка");
  assert.ok(ev.chewEnd + 8 <= f(l42.from), "«Альхамдулиллях» — после конца жевания");
  for (let t = 0; t < tl.durationInFrames; t++) {
    if (ch.chewing("yusuf", t) > 0) assert.equal(lipAt(tl.cues, "yusuf", t).open, 0, `Юсуф говорит во время жевания (кадр ${t})`);
  }
  // кусочек в анатомически правой руке (на экране левая — armL), не остаётся копией на тарелке
  for (let t = ev.sliceTake; t < ev.bite2; t += 2) {
    const s = ch.yusufSlice(t);
    assert.ok(s, `кадр ${t}`);
    const pose = ch.yusuf.pose(t);
    assert.equal(pose.armL?.shape, "pinch", `кадр ${t}: кусочек держит правая рука`);
    assert.equal(ch.yusufPlate(t).slices.filter(Boolean).length, 4);
  }
  assert.equal(ch.yusufPlate(ev.sliceTake - 1).slices.filter(Boolean).length, 5);
  // фоновые ученики в финале: кусочек в руке появляется ровно тогда, когда
  // гнездо на тарелке пустеет; у Амира и Билала тарелки не меняются
  for (const id of BG_IDS) {
    for (let t = 0; t < tl.durationInFrames; t += 3) {
      const inHand = ch.bgSlice(id, t) !== null || ch.chewing(id, t) > 0;
      const taken = ch.bgPlate(id, t).filter(Boolean).length < 4;
      assert.equal(inHand, taken, `${id}, кадр ${t}: кусочек и тарелка не согласованы`);
    }
  }
  for (const id of ["amir", "bilal"]) for (let t = 0; t < tl.durationInFrames; t += 30) assert.equal(ch.bgPlate(id, t).filter(Boolean).length, 4, `${id}: кусочки не исчезают`);
  // реплики 43 и 45 — с пустым ртом
  for (const id of [43, 45]) {
    const c = cueById(tl, id);
    for (let t = f(c.from); t <= f(c.to); t++) assert.equal(ch.chewing("yusuf", t), 0);
  }
});

test("тарелка Юсуфа: в руках учителя → опора на столик → остаётся на месте", () => {
  const ev = ch.events;
  assert.ok(ch.yusufPlate(ev.plateContact - 10).carried);
  const home = { x: PLATES.yusuf.x, y: PLATES.yusuf.y };
  for (let t = ev.plateContact; t < tl.durationInFrames; t += 5) assert.deepEqual(ch.yusufPlate(t).pos, home);
  assert.ok(ev.plateRelease > ev.plateContact, "рука отпускает после опоры");
  assert.ok(ev.plateRelease < f(cueById(tl, 1).from), "тарелка стоит до «Спасибо»");
});

test("надписи: значение после того, как прозвучало, убрано до сцены 7; подпись аята — в сцене 4", () => {
  const meaning = captions.find((c) => c.text === CAPTIONS.meaning);
  const ayah = captions.find((c) => c.text === CAPTIONS.ayah);
  const l12 = cueById(tl, 12);
  assert.ok(meaning.from >= f(l12.words[1].end), "надпись после «Хвала Аллаху»");
  assert.ok(meaning.to - meaning.from >= 3.5 * FPS, "надпись держится ≥ 3,5 с");
  assert.ok(meaning.to < sceneFrom("s7"));
  assert.ok(ayah.from >= sceneFrom("s4") && ayah.to <= sceneTo("s4"));
});

test("монтаж: непрерывный; растворения только у вставки сада; финал ≥ 2 с общего плана", () => {
  assert.equal(shots[0].from, 0);
  assert.equal(shots[shots.length - 1].to, tl.durationInFrames);
  for (let i = 1; i < shots.length; i++) assert.equal(shots[i].from, shots[i - 1].to);
  for (const s of shots) if (s.dissolve) assert.ok(s.kind === "garden" || shots[shots.indexOf(s) - 1].kind === "garden", s.label);
  const g = shots.filter((s) => s.kind === "garden");
  const gl = (g[g.length - 1].to - g[0].from) / FPS;
  assert.ok(gl >= 3.5 && gl <= 7, `вставка сада ${gl.toFixed(1)} с`);
  const last = shots[shots.length - 1];
  assert.ok(last.to - last.from >= 2 * FPS && /финал/.test(last.label));
  assert.ok(f(cueById(tl, 45).to) <= last.from + 20, "финальный общий план после реплики 45");
});

test("озвучка: файлы на месте, один голос на роль, один провайдер, без перегруза", { skip: manifest.estimated ? "нет озвучки" : false }, () => {
  assert.ok(!manifest.partial && !manifest.estimated);
  const provider = manifest.provider;
  const voiceOf = {};
  for (const l of L80_LINES) {
    const ml = manifest.lines.find((x) => x.id === l.id);
    assert.ok(ml, `№${l.id}`);
    assert.equal(ml.text, l.text, `№${l.id}: текст в манифесте`);
    assert.ok(existsSync(`public/${FILM.voiceDir}/${lineFile(l.id)}`), `№${l.id}: mp3`);
    assert.equal(ml.provider ?? provider, provider);
    const v = ml.voiceId ?? JSON.stringify(ml.voice);
    voiceOf[l.role] ??= v;
    assert.equal(voiceOf[l.role], v, `№${l.id}: голос роли сменился`);
    if (provider === "elevenlabs") assert.equal(ml.voiceId, VOICES[l.role].elevenlabs.voiceId);
    assert.ok(ml.peakDb === undefined || ml.peakDb <= -1, `№${l.id}: пик ${ml.peakDb}`);
  }
  assert.equal(new Set(Object.values(voiceOf)).size, 4, "четыре разных голоса");
});
