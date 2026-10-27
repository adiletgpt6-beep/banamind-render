// Проверки ролика 80-1-4 «Один Создатель» (автоматические проверки ТЗ):
//   1) диалоги: ровно 47 реплик, нумерация 01…47, порядок, говорящие и текст —
//      дословно по утверждённому сценарию;
//   2) сцены: ровно 8, в заданном порядке;
//   3) паузы: ровно четыре — 4, 5, 5, 5 с (сумма 19 с) от конца вопроса до
//      начала ответа; во время пауз никто не говорит и нет надписей;
//   4) длительность 4:15–5:00;
//   5) параметры видео: 1920×1080, 30 к/с, 16:9;
//   6) персонажи: в комнате ровно 25 учеников и один учитель, у фоновых
//      учеников постоянные места;
//   7) надписи: ровно две, точное написание, каждая — в своей сцене;
//   8) росток: размер и геометрия не меняются по ходу фильма;
//   9) аудио: каждая реплика — своей роли, файл на месте, речь не обрезана,
//      реплики не накладываются (кроме общего ответа детей);
//   + карточки: ровно четыре, в нужном порядке; SRT без ответа в паузах.
// Сборка (tsc, eslint) — npm run lint; рендер и файл — npm run render:80-1-4,
// npm run verify:80-1-4.
//
// Запуск: npm run test:80-1-4 (русская версия), npm run test:80-1-4-ky (кыргызская:
// те же проверки по её озвучке; текст — утверждённый перевод, якорные слова
// режиссуры — в репликах).
import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";
import { A4_DURATION, A4_PROTECTED, A4_SCENES, A4_VIEWER_PAUSES } from "../src/lesson80-1-4/script.ts";
import { A4_FLOW, buildTimeline as buildTimeline0, checkViewerPauses, dialogueTable } from "../src/lesson80-1-4/timeline.ts";
import { LANG, PACK, VOICE_DIR } from "./lib/a4-lang.mjs";

// языковая версия (--lang=ky / A4_LANG=ky): реплики, надписи, озвучка, распознавание
const A4_LINES = PACK.lines;
const A4_TEXT = PACK.text;
const A4_VIDEO = PACK.video;
const buildTimeline = (m, fps) => buildTimeline0(m, fps, LANG);
const MAN = `${VOICE_DIR}/manifest.json`;
const hasMan = existsSync(MAN);
const manifest = hasMan ? JSON.parse(readFileSync(MAN, "utf8")) : null;

// Утверждённый сценарий: говорящий и текст каждой из 47 реплик.
const T_ = "teacher";
const REF = [
  ["yusuf", "Мухаммад, можно я полью росток?"],
  [T_, "Можно. Только сначала посмотрим, сухая ли земля."],
  ["amir", "Сверху сухая."],
  ["yusuf", "Я всё вылью! Он быстрее вырастет!"],
  [T_, "Понемногу, Юсуф. Слишком много воды тоже может навредить."],
  ["yusuf", "Вот так?"],
  [T_, "Да. Теперь хватит."],
  ["yusuf", "Ну? Расти!"],
  ["amir", "Он сейчас станет большим?"],
  [T_, "Нет. Ростку нужно время. Посмотрите: есть стебелёк и листья. Позже появятся новые."],
  ["bilal", "Мы можем наблюдать за ним каждый день."],
  [T_, "И ухаживать. А ещё ему нужна не только вода."],
  [T_, "Ребята, что ещё нужно нашему ростку?"],
  ["amir", "Свет!"],
  ["bilal", "И воздух."],
  [T_, "Да. Корни берут воду из почвы. Листья используют свет. И растение живёт в воздухе."],
  ["yusuf", "А солнце далеко!"],
  [T_, "Далеко. А его свет доходит до нашего окна. Всё это помогает ростку расти."],
  ["amir", "Вода, земля, воздух, солнце… Они такие разные."],
  [T_, "Верно. А теперь подумайте: кто создал воду? И солнце, от которого приходит свет?"],
  ["yusuf", "Аллах."],
  ["bilal", "И семечко, из которого вырос росток?"],
  [T_, "Тоже Аллах."],
  ["amir", "А может, у солнца один Создатель, а у воды — другой?"],
  [T_, "Нет, Амир. Аллах создал и солнце, и воду, и весь мир. У мира один Создатель."],
  ["bilal", "А как мы узнаём, что Аллах один?"],
  [T_, "Об этом говорится в Коране. В начале суры «Аль-Ихляс» сказано, что Аллах Един."],
  ["yusuf", "Един — это один?"],
  [T_, "Да. Нет другого Бога, равного Ему. И нет другого Создателя, который создал бы отдельную часть мира."],
  ["amir", "Значит, солнце и дождь — не боги?"],
  [T_, "Верно. Это творения Аллаха."],
  ["yusuf", "А меня тоже Аллах создал?"],
  [T_, "Да, Юсуф. И Амира, и Билала, и всех нас."],
  ["bilal", "А нам нужна помощь друг друга."],
  [T_, "Да. Ты помогаешь младшим, родители заботятся о детях. Аллах же ни в ком не нуждается."],
  ["amir", "Ему не нужен другой создатель?"],
  [T_, "Не нужен. Аллах один и ни от кого не зависит."],
  [T_, "Кто создал солнце, воду и наш росток?"],
  ["yusuf", "Аллах!"],
  [T_, "Солнце — Создатель или творение?"],
  ["amir", "Творение."],
  [T_, "А сколько у мира Создателей?"],
  ["kids", "Один! Аллах!"],
  ["yusuf", "Значит, маленький росток и большие горы создал Аллах!"],
  [T_, "Да. Творения разные. А Создатель — один."],
  ["yusuf", "Тогда завтра снова посмотрим, как он растёт."],
  [T_, "Посмотрим. И позаботимся о нём."],
];

// Кыргызский перевод: обязательные формулировки богословских реплик
// (24, 25, 27, 29, 31, 35, 37, 45) — Создатель один, Аллах Един (112:1),
// нет равного Ему (112:4), ни в ком не нуждается (112:2), всё — Его творения.
const KY_KEY = {
  24: ["жаратуучусу башка"],
  25: ["Аллах жараткан", "бир гана Жаратуучусу бар"],
  27: ["Курандан", "«Ыхлас» сүрөсүнүн", "Аллах Жалгыз"],
  29: ["Аллахтан башка кудай жок", "Ага тең келер эч ким жок", "башка жаратуучу жок"],
  31: ["жаратылган нерселер", "Аллах жараткан"],
  35: ["Аллах эч кимге муктаж эмес"],
  37: ["Аллах бир", "эч кимге көз каранды эмес"],
  45: ["Жаратылган нерселер ар түрдүү", "Жаратуучу — бирөө гана"],
};

// Экранные надписи версии — ровно две, точное написание.
const CAPTIONS = {
  ru: ["Аллах Един", "Аллах — Единственный Создатель"],
  ky: ["Аллах — Жалгыз", "Аллах — жалгыз Жаратуучу"],
};

// Режиссура (TSX) собирается esbuild во временный модуль — те же функции,
// что рисуют кадр, без браузера.
const loadDirection = async () => {
  // внутри проекта, чтобы модуль находил react из node_modules
  const dir = join(process.cwd(), "node_modules", ".cache", `l4-test-${process.pid}`);
  mkdirSync(dir, { recursive: true });
  const out = join(dir, "direction.mjs");
  await build({ entryPoints: ["src/lesson80-1-4/direction.tsx"], bundle: true, format: "esm", platform: "node", outfile: out, jsx: "automatic", external: ["react", "react/jsx-runtime", "remotion"], logLevel: "error" });
  const mod = await import(pathToFileURL(out).href);
  const props = join(dir, "props.mjs");
  await build({ entryPoints: ["src/lesson80-1-4/sets/props.tsx"], bundle: true, format: "esm", platform: "node", outfile: props, jsx: "automatic", external: ["react", "react/jsx-runtime", "remotion"], logLevel: "error" });
  const pm = await import(pathToFileURL(props).href);
  rmSync(dir, { recursive: true, force: true });
  return { ...mod, props: pm };
};

test("1. диалоги: 47 реплик, нумерация 01…47, порядок, говорящие и текст дословно", () => {
  assert.equal(A4_LINES.length, 47);
  assert.equal(REF.length, 47);
  A4_LINES.forEach((l, i) => {
    assert.equal(l.id, `80-1-4-${String(i + 1).padStart(3, "0")}`);
    assert.equal(l.n, i + 1);
    assert.equal(l.role, REF[i][0], `говорящий реплики ${i + 1}`);
    if (LANG === "ru") assert.equal(l.text, REF[i][1], `текст реплики ${i + 1}`);
    else {
      // перевод: кириллица (с ң ө ү), без латиницы и цифр — их синтез читает плохо
      assert.ok(l.text.trim().length > 1, `реплика ${i + 1} пуста`);
      assert.ok(!/[A-Za-z0-9]/.test(l.text), `${l.id}: латиница или цифры`);
      assert.ok(/^[\p{Script=Cyrillic}\s.,!?:;«»—–…-]+$/u.test(l.text), `${l.id}: посторонние знаки «${l.text}»`);
      // «Аллах.» / «Аллах!» одинаковы на обоих языках
      if (!/^Аллах[.!]$/.test(l.text)) assert.notEqual(l.text, REF[i][1], `${l.id}: не переведена`);
    }
    // в синтез уходит только текст реплики (без номера, имени, указаний, таймкодов)
    assert.ok(!/[[\]]|Мухаммад:|Юсуф:|Амир:|Билал:|Дети:|\d\d:\d\d/.test(l.spoken ?? l.text), l.id);
    if (l.spoken) assert.equal(l.spoken.replace(/[^\p{L}\s]/gu, "").replace(/\s+/g, " "), l.text.replace(/[^\p{L}\s]/gu, "").replace(/\s+/g, " "), `${l.id}: spoken меняет слова`);
  });
  // говорят только учитель, три героя и группа детей; голоса «от лица Аллаха» нет
  for (const l of A4_LINES) assert.ok(["teacher", "yusuf", "amir", "bilal", "kids"].includes(l.role));
  assert.deepEqual(A4_LINES.filter((l) => l.role === "kids").map((l) => l.n), [43]);
  if (LANG === "ru") for (const n of A4_PROTECTED) assert.equal(A4_LINES[n - 1].text, REF[n - 1][1]);
  // перевод: богословские реплики сохраняют точные формулировки утверждённого перевода
  else for (const n of A4_PROTECTED) for (const w of KY_KEY[n]) assert.ok(A4_LINES[n - 1].text.includes(w), `${n}: нет «${w}»`);
});

test("2. сцены: ровно 8, в заданном порядке; каждая реплика один раз в потоке", () => {
  assert.deepEqual(
    A4_SCENES.map((s) => s.title),
    ["Сейчас вырастет!", "Почему он не вырос сразу?", "Не только вода", "Разные создатели?", "Что значит «Един»?", "А мы?", "Проверим, что поняли", "Маленький росток и большие горы"],
  );
  const counts = A4_SCENES.map((s) => A4_LINES.filter((l) => l.scene === s.id).length);
  assert.deepEqual(counts, [7, 5, 6, 7, 6, 6, 6, 4]);
  const segs = A4_FLOW.filter((f) => "seg" in f).map((f) => f.seg);
  assert.deepEqual(segs, A4_LINES.map((l) => l.id));
  const scenes = A4_FLOW.filter((f) => "scene" in f).map((f) => f.scene);
  assert.deepEqual(scenes, A4_SCENES.map((s) => s.id));
});

test("3. паузы: ровно четыре — 4, 5, 5, 5 с (19 с), от конца вопроса до начала ответа", { skip: !hasMan }, () => {
  assert.deepEqual(A4_VIEWER_PAUSES.map((p) => [Number(p.q.slice(-3)), Number(p.a.slice(-3)), p.sec]), [
    [13, 14, 4],
    [38, 39, 5],
    [40, 41, 5],
    [42, 43, 5],
  ]);
  assert.equal(A4_VIEWER_PAUSES.reduce((a, p) => a + p.sec, 0), 19);
  assert.deepEqual(A4_FLOW.filter((f) => "pause" in f).map((f) => f.pause), A4_VIEWER_PAUSES.map((p) => p.q));
  const T = buildTimeline(manifest, 30);
  for (const p of checkViewerPauses(T)) assert.ok(p.ok, `${p.q}→${p.a}: ${p.frames} кадров < ${p.need}`);
  // ответ идёт сразу за паузой — между вопросом и ответом нет других реплик и действий
  for (const { q, a } of A4_VIEWER_PAUSES) {
    const i = A4_FLOW.findIndex((f) => "pause" in f && f.pause === q);
    assert.ok("seg" in A4_FLOW[i - 1] && A4_FLOW[i - 1].seg === q, `перед паузой — вопрос ${q}`);
    assert.ok("seg" in A4_FLOW[i + 1] && A4_FLOW[i + 1].seg === a && (A4_FLOW[i + 1].gap ?? 0) === 0, `после паузы — ответ ${a}`);
  }
});

test("4. длительность 4:15–5:00 (по фактической озвучке)", { skip: !hasMan }, () => {
  const T = buildTimeline(manifest, 30);
  assert.equal(T.estimated, false, "шкала по оценкам, а не по озвучке");
  assert.ok(T.total >= A4_DURATION.min && T.total <= A4_DURATION.max, `длительность ${T.total.toFixed(2)} с`);
});

test("5. параметры видео: 1920×1080, 30 к/с, 16:9, H.264/AAC", () => {
  assert.equal(A4_VIDEO.width, 1920);
  assert.equal(A4_VIDEO.height, 1080);
  assert.equal(A4_VIDEO.fps, 30);
  assert.equal(A4_VIDEO.width / A4_VIDEO.height, 16 / 9);
  assert.match(A4_VIDEO.id, /^Lesson80-1-4-/);
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  const cmd = LANG === "ru" ? "render:80-1-4" : `render:80-1-4-${LANG}`;
  assert.ok(pkg.scripts[cmd], `нет npm run ${cmd}`);
});

test("6–8. комната: 25 учеников и учитель; постоянные места; росток не растёт; надписи; карточки; паузы без ответа", { skip: !hasMan }, async () => {
  const { buildDirection, roomStateAt, captionTimes, KIDS, props } = await loadDirection();
  const T = buildTimeline(manifest, 30);
  const D = buildDirection(T);
  assert.equal(KIDS.length, 25, "учеников в составе");
  assert.equal(KIDS.filter((k) => k.hero).length, 3);
  assert.equal(new Set(KIDS.map((k) => k.look.key)).size, 25, "у каждого ученика свой облик");
  const seats = new Map();
  const box0 = JSON.stringify(props.plantBox());
  const PLANT0 = JSON.stringify(props.PLANT);
  for (let t = 0; t < T.total; t += 0.5) {
    const s = roomStateAt(T, D, t);
    const kids = s.chars.filter((c) => c.id !== "teacher");
    assert.equal(kids.length, 25, `t=${t}: учеников ${kids.length}`);
    assert.equal(s.chars.filter((c) => c.id === "teacher").length, 1);
    assert.equal(new Set(s.chars.map((c) => c.id)).size, 26);
    assert.ok(s.chars.every((c) => !c.hidden), `t=${t}: кто-то скрыт`);
    // фоновые ученики не меняют мест
    for (const c of kids.filter((c) => !["yusuf", "amir", "bilal"].includes(c.id))) {
      const key = `${c.x},${c.y}`;
      if (!seats.has(c.id)) seats.set(c.id, key);
      assert.equal(seats.get(c.id), key, `${c.id} сменил место`);
    }
    // росток: та же геометрия; наклон только от сдвига поддона (≤ 6°)
    assert.ok(Math.abs(s.pot.tilt) <= 6 && Math.abs(s.pot.sway) <= 6, `t=${t}: наклон ростка`);
  }
  assert.equal(seats.size, 22);
  assert.equal(JSON.stringify(props.plantBox()), box0);
  assert.equal(JSON.stringify(props.PLANT), PLANT0);
  // во время пауз никто не говорит (рты закрыты) и надписей нет
  const cap = captionTimes(T, D);
  for (const p of Object.values(T.pause)) {
    for (let t = p.start + 0.15; t < p.end - 0.05; t += 0.25) {
      const s = roomStateAt(T, D, t);
      for (const c of s.chars) assert.ok(c.face.mouthOpen < 0.05, `пауза ${t.toFixed(2)}: говорит ${c.id}`);
      assert.ok(!(t > cap.oneIn && t < cap.oneOut + 0.5) && t < cap.finalIn, `надпись в паузе ${t}`);
    }
  }
  // надписи: ровно две, точное написание, каждая в своей сцене
  assert.deepEqual(Object.values(A4_TEXT), CAPTIONS[LANG]);
  assert.ok(cap.oneIn >= T.scenes.one.start && cap.oneOut <= T.scenes.one.end + 0.6, "«Аллах Един» — в сцене 5");
  assert.ok(cap.finalIn >= T.scenes.end.start && T.total - cap.finalIn >= 4 && T.total - cap.finalIn <= 6, "финальная надпись ≈ 4–5 с в конце");
  // карточки: ровно четыре — солнце, капля, почва, листья на ветру
  const mid = D.cardsAt(T.scenes.cards.start + 12);
  assert.deepEqual(mid.rail, ["sun", "drop", "soil", "wind"]);
  assert.equal(mid.stack + mid.rail.filter(Boolean).length, 4);
  const end = D.cardsAt(T.total - 0.1);
  assert.equal(end.amirStack, 4, "Амир сложил четыре карточки");
  // горшок в финале — снова на светлом месте
  assert.ok(D.potAt(T.total - 0.1).light > 0.99);
});

test("9. аудио: роли, файлы на месте, речь не обрезана, реплики не накладываются", { skip: !hasMan }, () => {
  assert.equal(manifest.complete, true, `нет озвучки: ${manifest.missing}`);
  for (const l of A4_LINES) {
    const x = manifest.lines.find((y) => y.segId === l.id);
    assert.ok(x, `нет ${l.id}`);
    assert.equal(x.role, l.role, `${l.id}: роль`);
    assert.ok(existsSync(`public/${A4_VIDEO.voiceDir}/${x.file}`), `нет файла ${x.file}`);
    assert.equal(x.text, l.spoken ?? l.text, l.id);
    assert.ok(x.speechEnd > x.speechStart);
    // первая и последняя буквы (тайминги синтеза) — внутри файла с запасом:
    // начало слова не срезано, после последнего слова есть затухание
    const first = x.alignedStart ?? x.words?.[0]?.start ?? x.speechStart;
    const last = x.alignedEnd ?? x.words?.[x.words.length - 1]?.end ?? x.speechEnd;
    assert.ok(first >= 0.06, `${l.id}: начало речи обрезано (${first})`);
    // хвост ≥ 60 мс либо разрез пришёлся на тишину (≤ −45 дБ) — слово не срезано
    assert.ok(x.durationSec - last >= 0.06 || (x.tailDb ?? 0) <= -45, `${l.id}: конец речи обрезан (${(x.durationSec - last).toFixed(3)} с, ${x.tailDb} дБ)`);
  }
  const T = buildTimeline(manifest, 30);
  const segs = Object.values(T.seg).sort((a, b) => a.start - b.start);
  for (let i = 1; i < segs.length; i++) assert.ok(segs[i].start >= segs[i - 1].end + 0.05, `наложение ${segs[i].line}`);
  const table = dialogueTable(T);
  assert.equal(table.length, 47);
  for (const r of table) assert.ok(r.audioFile && r.endFrame > r.startFrame && r.emotion && r.animationCue && r.mouthAnimation, r.id);
});

test("9b. распознавание готовых реплик (CI: Whisper — ru, MMS — ky) совпадает со сценарием", { skip: !existsSync(PACK.asr) || !hasMan }, () => {
  const asr = JSON.parse(readFileSync(PACK.asr, "utf8"));
  const bad = [];
  for (const l of A4_LINES) {
    const r = asr.lines?.[l.id];
    const m = manifest.lines.find((y) => y.segId === l.id);
    const sig = `${l.id}:${statSync(`public/${A4_VIDEO.voiceDir}/${m.file}`).size}`;
    // проверен именно тот файл, что звучит в фильме (подпись = id:размер)
    if (!r || r.sig !== sig) bad.push(`${l.id}: текущий файл ещё не распознан`);
    else if (r.cer > 0.2) bad.push(`${l.id} cer=${r.cer} «${r.heard}»`);
  }
  assert.deepEqual(bad, []);
});

// длительность WAV по заголовку (PCM 16 бит)
const wavSec = (path) => {
  const b = readFileSync(path);
  const rate = b.readUInt32LE(24);
  const ch = b.readUInt16LE(22);
  let o = 12;
  while (o < b.length - 8) {
    const id = b.toString("ascii", o, o + 4);
    const size = b.readUInt32LE(o + 4);
    if (id === "data") return size / (rate * ch * 2);
    o += 8 + size + (size % 2);
  }
  return 0;
};

test("10. шумы: файлы на месте, полив звучит всю струю, в паузах для ответа тихо", { skip: !hasMan }, async () => {
  const { buildDirection } = await loadDirection();
  const T = buildTimeline(manifest, 30);
  const D = buildDirection(T);
  const dir = `public/${A4_VIDEO.voiceDir}/sfx`;
  const names = ["pour", "drip-1", "drip-2", "can-lift", "can-place", "tray-slide", "tray-slide-back", "card-pick-1", "card-pick-2", "card-pick-3", "card-place-1", "card-place-2", "card-place-3", "card-out-1", "card-out-2", "card-out-3", "card-on-stack-1", "card-on-stack-2", "card-on-stack-3", "cloth-1", "cloth-2", "soil-touch"];
  for (const n of names) assert.ok(existsSync(`${dir}/${n}.wav`), `нет ${n}.wav`);
  // pour.wav = 0,22 с полёта струи + струя + 0,35 с хвоста — не короче струи в кадре
  const flow = D.sfx.pour.stop - D.sfx.pour.start;
  const pour = wavSec(`${dir}/pour.wav`);
  assert.ok(Math.abs(pour - (flow + 0.57)) < 0.15, `pour.wav ${pour.toFixed(2)} с, струя ${flow.toFixed(2)} с (пересобрать: POUR_FLOW=${flow.toFixed(2)} npm run audio:sfx:80-1-4)`);
  // все шумы — внутри фильма и не в паузах для ответа зрителя
  const at = [D.sfx.soilTouch, D.sfx.canLift, D.sfx.canLift2, D.sfx.pour.start, D.sfx.pour.stop + 0.9, D.sfx.traySlide.to, D.sfx.traySlide.back, ...D.sfx.canPlace, ...D.sfx.cardPick, ...D.sfx.cardPlace, ...D.sfx.cardsGather, ...D.sfx.cardsOnStack, ...D.sfx.drips, ...D.sfx.cloth.map((c) => c.at)];
  // капли: две, и звучат в момент касания земли (по тому же расчёту, что рисует их)
  assert.equal(D.sfx.drips.length, 2);
  for (const d of D.sfx.drips) assert.ok(d > D.sfx.pour.stop && d < D.sfx.pour.stop + 1.2, `капля ${d}`);
  for (const x of at) {
    assert.ok(x > 0 && x < T.total - 1, `шум вне фильма: ${x}`);
    for (const p of Object.values(T.pause)) assert.ok(x < p.start - 0.3 || x > p.end, `шум в паузе: ${x.toFixed(2)}`);
  }
});

test("SRT: 47 субтитров, ответ не появляется во время паузы", { skip: !hasMan || !existsSync(PACK.srt) }, () => {
  const srt = readFileSync(PACK.srt, "utf8");
  const T = buildTimeline(manifest, 30);
  const sec = (s) => {
    const [h, m, r] = s.split(":");
    return Number(h) * 3600 + Number(m) * 60 + Number(r.replace(",", "."));
  };
  const cues = srt
    .trim()
    .split(/\n\n/)
    .map((b) => {
      const [, time, ...text] = b.split("\n");
      const [a, z] = time.split(" --> ").map(sec);
      return { a, z, text: text.join(" ") };
    });
  assert.equal(cues.length, 47);
  for (const { q, a } of A4_VIEWER_PAUSES) {
    const qEnd = T.seg[q].end;
    const aStart = T.seg[a].start;
    for (const c of cues) assert.ok(!(c.a < aStart - 0.06 && c.z > qEnd + 0.7), `субтитр «${c.text}» в паузе`);
  }
});

test("якоря режиссуры: слово каждого якоря звучит в своей реплике", { skip: LANG === "ru" || !hasMan }, () => {
  const bad = [];
  const norm = (w) => w.replace(/[^\p{L}]/gu, "").toLowerCase();
  for (const [n, pairs] of Object.entries(PACK.anchors)) {
    const m = manifest.lines.find((y) => y.segId === `80-1-4-${String(n).padStart(3, "0")}`);
    for (const [ru, w] of Object.entries(pairs)) if (!m.words.some((x) => norm(x.text) === norm(w))) bad.push(`${n}: «${ru}» → «${w}» нет среди слов: ${m.words.map((x) => x.text).join(" ")}`);
  }
  assert.deepEqual(bad, []);
});
