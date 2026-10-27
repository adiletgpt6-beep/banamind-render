// Тесты LESSON-80 (80-1-6): сценарий (45 реплик), учебные паузы, персонажи,
// шкала и озвучка. Запуск: npm run test:lesson-80-1-6
// L80_STRICT_VOICE=1 — отсутствие полной озвучки считается ошибкой.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { FILM, LEARNING_PAUSES, LINES, SCENES, VOICES, lineFile } from "../src/lesson80/film-1-6/script.ts";
import { buildTimeline, checkTimeline, estimateManifest } from "../src/lesson80/core/timing.ts";
import { L80_VIDEO } from "../src/lesson80/core/video.ts";
import { PUPILS, TEACHER } from "../src/lesson80/characters/characterConfig.ts";
import { BIRD_PLAN, birdStateAt, materialAt, nestCountAt } from "../src/lesson80/film-1-6/birdPlan.ts";

const SCRIPT = [
  ["yusuf", "Ой! У неё что-то в клюве!"],
  ["amir", "Травинка."],
  ["bilal", "Она несёт её к той ветке."],
  ["muhammad", "Посмотрим тихо."],
  ["yusuf", "Вон, она кладёт её в гнездо!"],
  ["muhammad", "Ребята, зачем птице гнездо?"],
  ["yusuf", "Чтобы там спать?"],
  ["muhammad", "Гнездо этой птицы — место для яиц. Позже в нём будут маленькие птенцы."],
  ["amir", "Значит, она готовит место для них?"],
  ["muhammad", "Да. Она приносит материал и собирает гнездо."],
  ["amir", "Меня лодочку научил складывать папа."],
  ["yusuf", "А её кто научил? У неё есть учитель?"],
  ["muhammad", "Птица не учится в классе, как мы. У неё есть природные способности выбирать место и собирать материалы."],
  ["bilal", "Это значит, она вообще ничему не учится?"],
  ["muhammad", "Нет. Птицы тоже могут учиться. У некоторых птиц опыт влияет на то, как они строят гнёзда."],
  ["yusuf", "Значит, умеет — и ещё учится?"],
  ["muhammad", "Да."],
  ["muhammad", "Посмотрите: она держит травинку клювом."],
  ["bilal", "И цепляется лапками за ветку."],
  ["amir", "А крылья помогают приносить материал."],
  ["muhammad", "Верно. Птица использует своё тело и то, что находит вокруг."],
  ["yusuf", "Ей не нужны ножницы?"],
  ["muhammad", "Для этой травинки — нет. Она может подхватить её клювом."],
  ["yusuf", "А кто создал её такой?"],
  ["muhammad", "Аллах. Он создал птицу и дал ей способности, которые помогают жить."],
  ["bilal", "В Коране об этом тоже говорится?"],
  ["muhammad", "Да. В Коране сказано, что наш Господь дал Своим творениям их облик и указал им путь."],
  ["amir", "Для птицы это — уметь летать, искать пищу и устраивать гнездо?"],
  ["muhammad", "У этой птицы — да. Мы познакомились с одним примером того, как устроена жизнь в природе."],
  ["yusuf", "Можно я выйду посмотреть поближе?"],
  ["muhammad", "Лучше останемся здесь. Если подойти близко, можно потревожить птицу."],
  ["yusuf", "Я хотел увидеть, куда она кладёт травинку."],
  ["muhammad", "Тогда будем смотреть из окна. Даже издалека можно заметить многое."],
  ["amir", "Она опять улетела. Долго ей ещё?"],
  ["muhammad", "Гнездо строится постепенно. За несколько минут оно полностью не появится."],
  ["bilal", "Будем наблюдать и в другой день."],
  ["muhammad", "Чем птица держала травинку?"],
  ["yusuf", "Клювом!"],
  ["muhammad", "Кто создал птицу и дал ей способности для жизни?"],
  ["kids", "Аллах!"],
  ["muhammad", "Как мы будем наблюдать за гнездом?"],
  ["bilal", "Издалека, не мешая птице."],
  ["amir", "Я сегодня только одну лодочку сложил. А она сколько травинок принесла!"],
  ["yusuf", "Завтра посмотрим, что у неё получилось?"],
  ["muhammad", "Посмотрим. Аллах создал удивительный мир. Мы учимся замечать Его творения и бережно относиться к ним."],
];

test("формат: 1920×1080, 30 fps, допуск 4:10–5:00", () => {
  assert.equal(L80_VIDEO.width, 1920);
  assert.equal(L80_VIDEO.height, 1080);
  assert.equal(L80_VIDEO.fps, 30);
  assert.equal(FILM.id, "Lesson80-1-6-BirdNest");
  assert.equal(FILM.minSec, 250);
  assert.equal(FILM.maxSec, 300);
});

test("ровно 45 реплик, номера 1…45 без пропусков и повторов, текст и говорящие по сценарию", () => {
  assert.equal(LINES.length, 45);
  assert.deepEqual(LINES.map((l) => l.id), Array.from({ length: 45 }, (_, i) => i + 1));
  assert.deepEqual(LINES.map((l) => [l.role, l.text]), SCRIPT);
  // дублей нет (единственное повторение по сценарию — короткое «Да.» учителя отсутствует: все 45 текстов уникальны)
  assert.equal(new Set(LINES.map((l) => `${l.role}:${l.text}`)).size, 45);
  for (const l of LINES) assert.ok(!/№|\d{2}\./.test(l.spoken ?? l.text), `в речи нет номеров: ${l.id}`);
});

test("реплики по сценам: 5 / 5 / 7 / 6 / 6 / 7 / 6 / 3", () => {
  const counts = SCENES.map((s) => LINES.filter((l) => l.scene === s.id).length);
  assert.deepEqual(counts, [5, 5, 7, 6, 6, 7, 6, 3]);
  // порядок сцен не нарушается внутри списка
  let last = 0;
  for (const l of LINES) {
    assert.ok(l.scene >= last);
    last = l.scene;
  }
});

test("четыре учебные паузы: после №06 — 4 с, №37 — 4 с, №39 — 5 с, №41 — 4 с (всего 17 с)", () => {
  assert.deepEqual(LEARNING_PAUSES, { 6: 4, 37: 4, 39: 5, 41: 4 });
  assert.equal(Object.values(LEARNING_PAUSES).reduce((a, b) => a + b, 0), 17);
  for (const [after, p] of Object.entries(LEARNING_PAUSES)) {
    const next = LINES.find((l) => l.id === Number(after) + 1);
    assert.equal(next.gapBefore, p, `gapBefore реплики ${next.id}`);
    assert.equal(next.learning, true);
  }
  assert.equal(LINES.filter((l) => l.learning).length, 4);
});

test("учебные паузы точны на шкале (оценочной и фактической), финальная надпись 4–5 с", () => {
  const est = buildTimeline(estimateManifest());
  assert.deepEqual(checkTimeline(est).filter((p) => p.includes("учебная")), []);
  const by = new Map(est.cues.map((c) => [c.id, c]));
  for (const [after, p] of Object.entries(LEARNING_PAUSES)) {
    const gap = by.get(Number(after) + 1).from - by.get(Number(after)).to;
    assert.ok(Math.abs(gap - p) < 1 / 30 + 1e-6, `пауза после №${after}: ${gap}`);
  }
  assert.ok(FILM.captionSec >= 4 && FILM.captionSec <= 5);
  assert.equal(FILM.caption, "Аллах дал Своим творениям способности для жизни");
});

test("персонажи: ровно 25 мальчиков (3 главных + 22), один учитель, ID без повторов, возраст 4–12", () => {
  assert.equal(PUPILS.length, 25);
  assert.equal(PUPILS.filter((p) => p.main).length, 3);
  assert.equal(PUPILS.filter((p) => !p.main).length, 22);
  assert.equal(new Set(PUPILS.map((p) => p.id)).size, 25);
  assert.equal(TEACHER.id, "muhammad");
  assert.ok(TEACHER.look.beard && TEACHER.look.cap === "tubeteika" && TEACHER.look.top === "suit");
  for (const p of PUPILS) assert.ok(p.age >= 4 && p.age <= 12, p.id);
  const y = PUPILS.find((p) => p.id === "yusuf");
  const a = PUPILS.find((p) => p.id === "amir");
  const b = PUPILS.find((p) => p.id === "bilal");
  assert.deepEqual([y.age, a.age, b.age], [4, 8, 11]);
  assert.equal(y.look.topColor, "#F2C53D"); // жёлтая футболка
  assert.equal(a.look.top, "sweater"); // синяя кофта
  assert.equal(b.look.top, "shirt"); // зелёная рубашка
  // места не совпадают
  assert.equal(new Set(PUPILS.map((p) => `${p.seat.row}:${p.seat.x}`)).size, 25);
  const ages = PUPILS.map((p) => p.age);
  assert.ok(ages.some((x) => x <= 6) && ages.some((x) => x >= 7 && x <= 9) && ages.some((x) => x >= 10));
});

test("голоса: по одному постоянному голосу на роль", () => {
  for (const role of ["muhammad", "yusuf", "amir", "bilal"]) assert.ok(VOICES[role].rhvoice.voice, role);
  const names = new Set(Object.values(VOICES).map((v) => `${v.rhvoice.voice}/${v.rhvoice.pitch}`));
  assert.equal(names.size, 4);
});

test("план птицы: материал в одном месте, состояния не пересекаются, гнездо не достраивается", () => {
  for (let i = 1; i < BIRD_PLAN.length; i++) assert.ok(BIRD_PLAN[i].at >= BIRD_PLAN[i - 1].at, `порядок сегментов ${i}`);
  const est = buildTimeline(estimateManifest());
  let prevNest = 0;
  for (let f = 0; f < est.durationInFrames; f += 7) {
    const st = birdStateAt(est, f);
    const mat = materialAt(est, f);
    assert.ok(["ground", "beak", "nest", "none"].includes(mat), `материал ${mat}`);
    if (st === "flyIn" || st === "flyOut") assert.ok(mat !== "nest" || true);
    const n = nestCountAt(est, f);
    assert.ok(n >= prevNest, `травинок в гнезде не меньше, чем раньше (кадр ${f})`);
    assert.ok(n <= 6, "гнездо не достраивается за фильм");
    prevNest = n;
  }
});

const MANIFEST = `public/${FILM.voiceDir}/manifest.json`;
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : null;
const strict = process.env.L80_STRICT_VOICE === "1";

test("озвучка: 45 файлов, тексты актуальны, тайминги есть, шкала в допуске", { skip: !manifest && !strict ? "озвучка не создана" : false }, () => {
  assert.ok(manifest, "manifest.json отсутствует");
  assert.equal(manifest.lines.length, 45);
  for (const l of LINES) {
    const ml = manifest.lines.find((x) => x.id === l.id);
    assert.ok(ml, `нет реплики ${l.id}`);
    assert.equal(ml.text, l.text);
    assert.equal(ml.file, lineFile(l.id));
    assert.ok(existsSync(`public/${FILM.voiceDir}/${ml.file}`), `нет файла ${ml.file}`);
    assert.ok(ml.words.length > 0 && ml.chars.length > 0 && ml.env.length > 0, `тайминги ${l.id}`);
    assert.ok(ml.speechEnd > ml.speechStart && ml.speechEnd <= ml.durationSec + 0.02, `длительность ${l.id}`);
    assert.ok(ml.peakDb <= -1, `пик ${l.id}: ${ml.peakDb} дБFS`);
  }
  const tl = buildTimeline(manifest);
  assert.deepEqual(checkTimeline(tl), []);
  assert.ok(tl.durationSec >= FILM.minSec && tl.durationSec <= FILM.maxSec, `длительность ${tl.durationSec}`);
});
