// Тесты Lesson80_1_5: 48 реплик по сценарию, четыре обязательные паузы по
// фактическому звуку, длительность 4:05–5:00, 25 учеников, голоса,
// файлы озвучки, субтитры без раскрытия ответов.
// Запуск: node --test scripts/lesson-80-1-5.test.mjs
// L815_REQUIRE_VOICE=1 — отсутствие полной озвучки считается ошибкой.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import {
  L815_BEATS,
  L815_LINES,
  L815_PAUSES,
  L815_PUPILS,
  L815_PUPIL_COUNT,
  L815_TEXT,
  L815_VIDEO,
} from "../src/lesson-80-1-5/script.ts";
import { buildL815Timeline, checkL815Timeline, estimateL815Manifest } from "../src/lesson-80-1-5/timing.ts";
import { L815_LOCAL_VOICES, L815_OPENAI_VOICES } from "../src/lesson-80-1-5/voices.ts";
import { voiceKey } from "./lib/l815-tts.mjs";

const MANIFEST = `public/${L815_VIDEO.voiceDir}/manifest.json`;
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : null;
const complete = Boolean(manifest && !manifest.partial && manifest.lines?.length === L815_LINES.length);
const strict = process.env.L815_REQUIRE_VOICE === "1";

test("формат: 1920×1080, 30 fps, диапазон 4:05–5:00", () => {
  assert.equal(L815_VIDEO.id, "Lesson80-1-5");
  assert.equal(L815_VIDEO.width, 1920);
  assert.equal(L815_VIDEO.height, 1080);
  assert.equal(L815_VIDEO.fps, 30);
  assert.equal(L815_VIDEO.minSec, 245);
  assert.equal(L815_VIDEO.maxSec, 300);
});

test("48 реплик по сценарию, в порядке и с нужными героями", () => {
  assert.equal(L815_LINES.length, 48);
  L815_LINES.forEach((l, i) => assert.equal(l.n, i + 1));
  const expected = [
    ["yusuf", "Что ты делаешь?"],
    ["amir", "Сейчас увидишь."],
    ["teacher", "Давайте посмотрим на Амира."],
    ["amir", "Вот! Лодочка!"],
    ["yusuf", "Настоящая?"],
    ["amir", "Бумажная. Но она может плавать."],
    ["yusuf", "Подожди… Ты говорил, что всё создал Аллах."],
    ["teacher", "Да. Аллах — Создатель всего мира."],
    ["yusuf", "А лодочку сделал Амир!"],
    ["amir", "Я сам её сложил. Смотри, даже складки видны."],
    ["bilal", "Получается, надо понять, что сделал Амир, а откуда взялась бумага."],
    ["teacher", "Именно. Сегодня в этом разберёмся."],
    ["teacher", "Ребята, из чего Амир сделал лодочку?"],
    ["yusuf", "Из бумаги!"],
    ["amir", "Был лист. Я согнул его и получил лодочку."],
    ["teacher", "Верно. Ты изменил форму листа. Сама бумага существовала до того, как ты приступил к работе."],
    ["bilal", "Он взял готовый лист."],
    ["teacher", "Да. А ещё умел его аккуратно сгибать."],
    ["yusuf", "А бумагу кто сделал?"],
    ["teacher", "Её изготовили люди. Такую бумагу можно делать из древесины деревьев."],
    ["amir", "Из дерева? Но оно же твёрдое!"],
    ["teacher", "Древесину обрабатывают, получают массу из маленьких волокон. Из неё формируют и сушат тонкие листы."],
    ["bilal", "Значит, лист в класс принесли готовым. А материал для бумаги взяли в природе."],
    ["teacher", "Верно."],
    ["teacher", "А древесина откуда?"],
    ["yusuf", "Из деревьев!"],
    ["teacher", "Садовник может посадить дерево и полить его. Как мы ухаживаем за нашим ростком."],
    ["bilal", "Но садовник не сделал солнце и воду."],
    ["teacher", "Верно. Аллах создал мир и нас. Он даровал нам зрение, слух и возможность учиться. В Коране говорится, что Аллах — Создатель всего."],
    ["yusuf", "Значит, для лодочки понадобилось то, что Он создал?"],
    ["teacher", "Да."],
    ["amir", "Тогда можно говорить: “Я сделал лодочку”?"],
    ["teacher", "Конечно. Ты сам складывал бумагу, старался и получил результат."],
    ["bilal", "Как пекарь печёт хлеб из муки?"],
    ["teacher", "Да. Или плотник делает стол из древесины. Люди учатся, трудятся и делают полезные вещи, используя то, что Аллах создал."],
    ["yusuf", "Амир, красивая лодочка!"],
    ["amir", "Спасибо!"],
    ["teacher", "Из чего Амир сделал лодочку?"],
    ["yusuf", "Из готовой бумаги."],
    ["teacher", "Можно ли Амиру сказать: “Я сделал эту игрушку”?"],
    ["bilal", "Да. Он потрудился."],
    ["teacher", "А кто Создатель всего мира, в том числе и нас?"],
    ["kids", "Аллах!"],
    ["yusuf", "Покажешь, как сложить такую?"],
    ["amir", "Покажу. Держи лист."],
    ["teacher", "Мы благодарим Аллаха за Его дары. Учимся, трудимся и делимся добром."],
    ["yusuf", "Спасибо, Амир!"],
    ["amir", "Давай вместе."],
  ];
  assert.deepEqual(L815_LINES.map((l) => [l.role, l.text]), expected);
  // биты содержат каждую реплику ровно один раз и в порядке
  const ids = L815_BEATS.filter((b) => b.kind === "line").map((b) => b.id);
  assert.deepEqual(ids, L815_LINES.map((l) => l.id));
});

test("четыре обязательные паузы: 4, 4, 5, 5 с после реплик 13, 38, 40, 42", () => {
  assert.deepEqual(
    L815_PAUSES.map((p) => [p.question, p.answer, p.sec]),
    [["l13", "l14", 4], ["l38", "l39", 4], ["l40", "l41", 5], ["l42", "l43", 5]],
  );
  assert.equal(L815_PAUSES.reduce((a, p) => a + p.sec, 0), 18);
});

test("тексты: без рекламы, WhatsApp, номеров, ссылок и постановочных пометок", () => {
  const all = [...L815_LINES.map((l) => l.spoken ?? l.text), L815_TEXT.title, L815_TEXT.final].join("\n").toLowerCase();
  for (const bad of ["whatsapp", "balago", "балаго", "http", "wa.me", "0998", "+996", "подпис", "сцена", "реплика", "пауза"]) {
    assert.ok(!all.includes(bad), `найдено «${bad}»`);
  }
  assert.equal(L815_TEXT.final, "Мы мастерим из того, что создал Аллах");
  assert.equal(L815_TEXT.finalLines.join(" "), L815_TEXT.final);
  assert.equal(L815_TEXT.title, "А лодочку сделал я!");
});

test("ровно 25 мальчиков с уникальными ID и местами; трое главных; учитель отдельно", () => {
  assert.equal(L815_PUPILS.length, L815_PUPIL_COUNT);
  assert.equal(L815_PUPIL_COUNT, 25);
  assert.equal(new Set(L815_PUPILS.map((p) => p.id)).size, 25);
  assert.deepEqual(L815_PUPILS.filter((p) => p.main).map((p) => p.main), ["yusuf", "amir", "bilal"]);
  assert.equal(L815_PUPILS.find((p) => p.main === "yusuf").age, 4);
  assert.equal(L815_PUPILS.find((p) => p.main === "amir").age, 8);
  assert.equal(L815_PUPILS.find((p) => p.main === "bilal").age, 11);
  for (const p of L815_PUPILS) assert.ok(p.age >= 4 && p.age <= 12, `${p.id}: возраст ${p.age}`);
  // места не совпадают: в одном ряду слоты различаются
  const key = (p) => `${p.row}:${p.slot}`;
  assert.equal(new Set(L815_PUPILS.map(key)).size, 25);
  // фоновые ученики не одинаковые: сочетание причёски и цвета одежды уникально
  const looks = L815_PUPILS.filter((p) => !p.main).map((p) => `${p.hairStyle}|${p.topColor}`);
  assert.equal(new Set(looks).size, looks.length);
});

test("голоса: у каждой роли свой голос в обоих провайдерах", () => {
  for (const voices of [L815_OPENAI_VOICES, L815_LOCAL_VOICES]) {
    const keys = Object.values(voices).map(voiceKey);
    assert.equal(new Set(keys).size, keys.length, "один голос — одна роль");
    for (const role of ["teacher", "yusuf", "amir", "bilal"]) assert.ok(voices[role], `нет голоса ${role}`);
  }
});

test("оценочная шкала (без озвучки): собирается без проблем", () => {
  const tl = buildL815Timeline(estimateL815Manifest());
  assert.deepEqual(checkL815Timeline(tl), []);
});

test("шкала по фактической озвучке: паузы ровно 120/120/150/150 кадров, ответ после паузы, длительность в диапазоне", { skip: complete ? false : strict ? false : "озвучки ещё нет" }, () => {
  assert.ok(complete, "нет полной озвучки (manifest.json)");
  const tl = buildL815Timeline(manifest);
  assert.deepEqual(checkL815Timeline(tl), []);
  assert.deepEqual(tl.pauses.map((p) => p.frames), [120, 120, 150, 150]);
  for (const p of tl.pauses) {
    const q = tl.cues.find((c) => c.id === p.question);
    const a = tl.cues.find((c) => c.id === p.answer);
    assert.ok(a.from >= q.to + p.sec, `${p.answer} начинается через ${(a.from - q.to).toFixed(3)} с`);
    assert.ok(a.audioFromFrame >= p.to, `${p.answer}: файл ответа начинается до конца ожидания`);
    assert.ok(a.from - q.to < p.sec + 0.5, `${p.answer}: слишком поздно`);
  }
  assert.ok(tl.durationSec >= L815_VIDEO.minSec && tl.durationSec <= L815_VIDEO.maxSec, `длительность ${tl.durationSec}`);
});

test("файлы озвучки: есть, тексты актуальны, тайминги и огибающая, без перегруза", { skip: complete ? false : strict ? false : "озвучки ещё нет" }, () => {
  assert.ok(complete, "нет полной озвучки");
  for (const l of L815_LINES) {
    const ml = manifest.lines.find((x) => x.id === l.id);
    assert.ok(ml, `${l.id}: нет в манифесте`);
    assert.equal(ml.text, l.text, `${l.id}: текст устарел`);
    assert.ok(existsSync(`public/${L815_VIDEO.voiceDir}/${ml.file}`), `${l.id}: нет файла`);
    assert.ok(ml.words?.length >= 1 && ml.chars?.length >= 2, `${l.id}: нет таймингов`);
    assert.ok(ml.env?.length >= Math.floor(ml.durationSec * 30), `${l.id}: нет огибающей`);
    assert.ok(ml.peakDb <= -1, `${l.id}: пик ${ml.peakDb} дБFS`);
    assert.ok(ml.speechEnd > ml.speechStart + 0.2, `${l.id}: слишком короткая речь`);
    assert.ok(ml.speechStart <= 0.12, `${l.id}: лишняя тишина в начале (${ml.speechStart} с)`);
    assert.ok(ml.durationSec - ml.speechEnd <= 0.25, `${l.id}: лишняя тишина в конце`);
  }
  // голоса ролей различаются по высоте: учитель ниже всех детей
  const f0 = (role) => {
    const v = manifest.lines.filter((x) => x.role === role && typeof x.f0 === "number" && x.speechEnd - x.speechStart > 1).map((x) => x.f0).sort((a, b) => a - b);
    return v[Math.floor(v.length / 2)];
  };
  assert.ok(f0("teacher") < f0("yusuf"), `учитель ${f0("teacher")} Гц, Юсуф ${f0("yusuf")} Гц`);
  assert.ok(f0("teacher") < f0("amir"), `учитель ${f0("teacher")} Гц, Амир ${f0("amir")} Гц`);
  assert.ok(f0("teacher") < f0("bilal"), `учитель ${f0("teacher")} Гц, Билал ${f0("bilal")} Гц`);
});

test("субтитры SRT (если собраны): ответы не раньше конца пауз", { skip: existsSync("out/lesson-80-1-5.srt") ? false : "SRT не собран" }, () => {
  const srt = readFileSync("out/lesson-80-1-5.srt", "utf8");
  const blocks = srt.trim().split(/\n\n+/);
  assert.equal(blocks.length, 48);
  const tl = buildL815Timeline(complete ? manifest : estimateL815Manifest());
  const toSec = (s) => {
    const m = /(\d+):(\d+):(\d+),(\d+)/.exec(s);
    return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) + Number(m[4]) / 1000;
  };
  for (const p of tl.pauses) {
    const q = tl.cues.find((c) => c.id === p.question);
    const a = tl.cues.find((c) => c.id === p.answer);
    const start = toSec(blocks[a.n - 1].split("\n")[1]);
    assert.ok(start >= q.to + p.sec - 0.001, `${p.answer}: субтитр с ${start} с`);
  }
});
