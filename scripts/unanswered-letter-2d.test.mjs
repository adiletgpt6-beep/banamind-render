// Тесты BalaGoUnansweredLetter2D: шкала 120 с, сцены без дыр, пять ролей и
// сохранённые голоса, режимы речи (рассказчик / живая речь / внутреннее
// чтение), постоянные строки письма и календаря (14:30 внутри встреч обоих
// родителей), последовательность дней, контакт только в последних 150
// кадрах, тексты на кыргызском.
// UL2_STRICT_VOICE=1 — устаревшая или неполная озвучка считается ошибкой.
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  UL2_CAL,
  UL2_CONTACT_FROM,
  UL2_DIALOG_END,
  UL2_FRAMES,
  UL2_LETTER,
  UL2_LINES,
  UL2_SCENES,
  UL2_SEGMENTS,
  UL2_TEXT,
  UL2_TOPICS,
  UL2_VIDEO,
  UL2_VOICES,
} from "../src/unanswered-letter-2d/script.ts";
import { TS2_VOICES } from "../src/two-schedules-2d/script.ts";
import { buildUl2Cues, checkUl2Timing, estimateUl2Manifest } from "../src/unanswered-letter-2d/timing.ts";
import { dayLabelAt, topicAt } from "../src/unanswered-letter-2d/layout.ts";
import { ul2Hash, voiceOfRole } from "./lib/ul2d-tts.mjs";

const MANIFEST = `public/${UL2_VIDEO.voiceDir}/manifest.json`;
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : null;
const complete = Boolean(manifest && !manifest.partial && manifest.lines?.length === UL2_LINES.length);
const strict = process.env.UL2_STRICT_VOICE === "1";
const scene = (id) => UL2_SCENES.find((s) => s.id === id);
const SRC = "src/unanswered-letter-2d";
const sources = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? sources(join(dir, e.name)) : /\.tsx?$/.test(e.name) ? [join(dir, e.name)] : []));

test("формат: 1080×1920, 30 fps, ровно 120 с (3600 кадров)", () => {
  assert.equal(UL2_VIDEO.id, "BalaGoUnansweredLetter2D");
  assert.equal(UL2_VIDEO.output, "balago-unanswered-letter-2d");
  assert.deepEqual([UL2_VIDEO.width, UL2_VIDEO.height, UL2_VIDEO.fps, UL2_FRAMES], [1080, 1920, 30, 3600]);
});

test("13 сцен подряд, без дыр, от 0 до 120 с (сумма кадров = 3600)", () => {
  assert.equal(UL2_SCENES.length, 13);
  assert.deepEqual(
    UL2_SCENES.map((s) => s.id),
    ["intro", "offer", "draft", "car", "days", "husband", "calendar", "options", "drawing", "request", "reply", "service", "contact"],
  );
  assert.equal(UL2_SCENES[0].from, 0);
  for (let i = 1; i < UL2_SCENES.length; i++) assert.equal(UL2_SCENES[i].from, UL2_SCENES[i - 1].to);
  assert.equal(UL2_SCENES.at(-1).to, 120);
  const frames = UL2_SCENES.reduce((s, sc) => s + Math.round(sc.to * 30) - Math.round(sc.from * 30), 0);
  assert.equal(frames, UL2_FRAMES);
});

test("финал: объяснение услуги, затем контактная карточка ≥ 6 с до конца ролика", () => {
  const c = scene("contact");
  assert.equal(UL2_CONTACT_FROM, c.from);
  assert.equal(c.to, 120);
  assert.ok(c.to - c.from >= 8, "номер WhatsApp виден минимум 8 с");
  const sv = scene("service");
  assert.ok(sv.to - sv.from >= 6, "объяснение услуги — не короче 6 с");
  // объяснение услуги — после отправленного письма; призыв — на контактной карточке
  assert.deepEqual(UL2_SEGMENTS.filter((s) => s.scene === "service").map((s) => s.line), ["n05"]);
  assert.deepEqual(UL2_SEGMENTS.filter((s) => s.scene === "contact").map((s) => s.line), ["n06"]);
  assert.ok(UL2_DIALOG_END <= 120 - 3, "после призыва — минимум 3 с на чтение контактов");
});

test("пять ролей с сохранёнными голосами проекта (новые голоса не создаются)", () => {
  assert.deepEqual(Object.keys(UL2_VOICES).sort(), ["colleague", "daughter", "father", "mother", "narrator"]);
  assert.equal(UL2_VOICES.mother.voiceId, TS2_VOICES.mother.voiceId);
  assert.equal(UL2_VOICES.father.voiceId, TS2_VOICES.father.voiceId);
  assert.equal(UL2_VOICES.daughter.voiceId, TS2_VOICES.daughter.voiceId);
  // рассказчик — голос Voice Design (voiceDesign.ts), создаётся в CI
  assert.equal(UL2_VOICES.narrator.voiceId, "design:narrator");
  // коллега — сохранённый голос Eric (BalaGoTripQuestions, src/config.ts)
  assert.equal(UL2_VOICES.colleague.voiceId, "cjVigY5qzO86Huf0OWal");
  assert.equal(new Set(Object.values(UL2_VOICES).map((v) => v.voiceId)).size, 5, "у каждой роли свой тембр");
  for (const l of UL2_LINES) if (l.role !== "narrator" || existsSync("voice-samples/unanswered-letter-2d/design/voices.json")) assert.ok(voiceOfRole(l.role), `${l.id}: нет голоса`);
  assert.equal(new Set(UL2_LINES.map((l) => l.id)).size, UL2_LINES.length, "ID файлов уникальны");
  assert.equal(new Set(UL2_SEGMENTS.map((s) => s.id)).size, UL2_SEGMENTS.length, "ID сегментов уникальны");
  // каждый файл звучит ровно один раз
  for (const l of UL2_LINES) assert.equal(UL2_SEGMENTS.filter((s) => s.line === l.id).length, 1, l.id);
});

test("режимы речи: рассказчик, живая речь, внутреннее чтение ответа", () => {
  for (const s of UL2_SEGMENTS) {
    const l = UL2_LINES.find((x) => x.id === s.line);
    assert.equal(s.mode === "narrator", l.role === "narrator", `${s.id}: режим рассказчика`);
  }
  const inner = UL2_SEGMENTS.filter((s) => s.mode === "inner");
  assert.deepEqual(inner.map((s) => [s.id, s.scene]), [["m06", "reply"]]);
  assert.equal(UL2_LINES.find((l) => l.id === "m06").role, "mother");
});

test("ключевые реплики — по сценарию", () => {
  const t = Object.fromEntries(UL2_LINES.map((l) => [l.id, l.text]));
  assert.equal(t.n01, "Айжан бул сунушту эки жыл күткөн.");
  assert.equal(t.n01b, "Бирок үч күндөн бери жооп бере элек.");
  // финальный призыв: город, оба направления, ссылка в профиле и WhatsApp
  for (const w of ["BalaGo", "Бишкекте", "үйдөн мектепке", "мектептен үйгө"]) assert.ok(t.n05.includes(w), `n05: нет «${w}»`);
  for (const w of ["Профилдеги шилтеме", "WhatsApp"]) assert.ok(t.n06.includes(w), `n06: нет «${w}»`);
  assert.equal(t.c01, "Куттуктайм! Сен ушуну каалап жүргөн эмес белең?");
  assert.equal(t.m01, "Ооба. Бир нерсени ойлонуп алышым керек.");
  assert.equal(t.d01, "Апа, бизде сүрөт сынагы болот! Мен да катышам.");
  assert.equal(t.m02, "Абдан жакшы!");
  assert.equal(t.h01, "Сен дагы эле жооп бере элексиңби? Сени эмне токтотуп жатат?");
  assert.equal(t.m04, "Муну кайда коёбуз?");
  assert.equal(t.d02, "Сенин жаңы жумушуңа. Сен жетекчи болосуң да?");
  assert.equal(t.m05, "Абдан каалайм.");
  assert.equal(t.m06, "Сунушуңуздарга рахмат. Жаңы кызматты жана ага өтүүнүн шарттарын талкуулагым келет.");
  // сегменты идут по порядку сцен и времени
  const order = UL2_SCENES.map((s) => s.id);
  for (let i = 1; i < UL2_SEGMENTS.length; i++) {
    assert.ok(UL2_SEGMENTS[i].at > UL2_SEGMENTS[i - 1].at, `${UL2_SEGMENTS[i].id} раньше предыдущего`);
    assert.ok(order.indexOf(UL2_SEGMENTS[i].scene) >= order.indexOf(UL2_SEGMENTS[i - 1].scene));
  }
  // сцена черновика — без речи (осмысленная пауза)
  assert.equal(UL2_SEGMENTS.filter((s) => s.scene === "draft").length, 0);
});

test("письмо: одни и те же строки; ответ предлагает обсуждение, а не согласие", () => {
  assert.equal(UL2_LETTER.subject, "Жаңы багытты жетектөө");
  assert.equal(UL2_LETTER.greeting, "Айжан,");
  assert.equal(UL2_LETTER.heroine, "Айжан");
  assert.equal(UL2_LETTER.offer, "Компаниянын жаңы багытын жетектөөнү сунуштайбыз.");
  assert.equal(UL2_LETTER.draft, "Сунушуңуздарга рахмат…");
  assert.equal(UL2_LETTER.reply, "Сунушуңуздарга рахмат. Жаңы кызматты жана ага өтүүнүн шарттарын талкуулагым келет.");
  assert.equal(UL2_LETTER.replyParts.join(" "), UL2_LETTER.reply);
  assert.ok(UL2_LETTER.reply.startsWith(UL2_LETTER.draft.replace("…", "")), "ответ продолжает тот же черновик");
  assert.ok(UL2_LETTER.reply.includes("талкуулагым келет"));
  assert.deepEqual([UL2_LETTER.send, UL2_LETTER.sent], ["Жөнөтүү", "Жөнөтүлдү"]);
  // строки письма не дублируются в сценах вручную — только из UL2_LETTER
  for (const f of sources(SRC).filter((x) => !x.endsWith("script.ts"))) {
    const code = readFileSync(f, "utf8");
    for (const s of [UL2_LETTER.offer, UL2_LETTER.subject, "Сунушуңуздарга"]) assert.ok(!code.includes(s), `${f}: строка письма «${s}» записана вручную`);
  }
});

test("календарь: окончание уроков 14:30 внутри встреч обоих родителей", () => {
  assert.equal(UL2_CAL.title, "Жаңы команда");
  // это график будущей рабочей недели, а не дня истории
  assert.equal(UL2_CAL.subtitle, "Келерки аптанын графиги");
  assert.equal(UL2_CAL.schoolTime, "14:30");
  assert.equal(UL2_CAL.school, "14:30 · Сабак бүтөт");
  const s = UL2_CAL.schoolAt;
  assert.equal(s, 14.5);
  assert.deepEqual([UL2_CAL.mom.from, UL2_CAL.mom.to, UL2_CAL.mom.time], [14, 15, "14:00–15:00"]);
  assert.deepEqual([UL2_CAL.dad.from, UL2_CAL.dad.to, UL2_CAL.dad.time], [14, 15.5, "14:00–15:30"]);
  assert.ok(UL2_CAL.mom.from < s && s < UL2_CAL.mom.to);
  assert.ok(UL2_CAL.dad.from < s && s < UL2_CAL.dad.to);
  // в форме заявки время окончания уроков то же
  assert.ok(UL2_TEXT.page.fields.some(([k, v]) => k === "Сабактын убактысы" && v === "14:30 — сабак бүтөт"));
});

test("вкладки: пять тем с постоянными цветами", () => {
  assert.deepEqual(UL2_TOPICS.map((t) => t.label), ["Кат", "Мектеп", "Календарь", "Сүрөт", "Жооп"]);
  assert.equal(new Set(UL2_TOPICS.map((t) => t.color)).size, 5);
  const at = (id, k = 0.5) => topicAt(scene(id).from + (scene(id).to - scene(id).from) * k);
  assert.equal(at("intro"), "letter");
  assert.equal(at("offer"), "letter");
  assert.equal(at("car"), "school");
  assert.equal(at("calendar"), "calendar");
  assert.equal(at("drawing"), "drawing");
  assert.equal(at("reply"), "reply");
  assert.equal(at("contact"), null);
});

test("дни: 1-күн → 2-күн → 3-күн → Эртеси", () => {
  const seq = [];
  for (let t = 0; t < scene("service").from; t += 0.1) {
    const d = dayLabelAt(t);
    if (d && seq.at(-1) !== d) seq.push(d);
  }
  const days = seq.map((d) => d.split(" ·")[0]).filter((d, i, a) => a.indexOf(d) === i);
  assert.deepEqual(days, ["1-күн", "2-күн", "3-күн", "Эртеси"]);
  assert.equal(dayLabelAt(scene("offer").from + 1), "1-күн");
  assert.ok(dayLabelAt(scene("husband").from + 1).startsWith("3-күн"));
  assert.equal(dayLabelAt(scene("request").from + 1), "Эртеси");
  assert.equal(dayLabelAt(scene("reply").from + 1), "Эртеси");
});

test("один ассет рисунка: ChildDrawing используется во всех сценах с рисунком", () => {
  const files = sources(SRC);
  const defs = files.filter((f) => /export const ChildDrawing\b/.test(readFileSync(f, "utf8")));
  assert.equal(defs.length, 1, "рисунок определён ровно в одном файле");
  const users = files.filter((f) => /<ChildDrawing\b/.test(readFileSync(f, "utf8"))).map((f) => f.split("/").pop());
  for (const s of ["Drawing.tsx", "Reply.tsx"]) assert.ok(users.includes(s), `${s}: рисунок не из общего ассета`);
  const code = readFileSync(defs[0], "utf8");
  assert.ok(code.includes("UL2_LETTER.heroine"), "имя на двери — из UL2_LETTER.heroine");
});

const strings = (x) => (typeof x === "string" ? [x] : x && typeof x === "object" ? Object.values(x).flatMap(strings) : []);

test("кыргызские ө, ү, ң кириллицей; латиница — только BalaGo и WhatsApp", () => {
  const all = [...UL2_LINES.flatMap((l) => [l.text, l.spoken ?? ""]), ...strings(UL2_TEXT), ...strings(UL2_LETTER), ...strings(UL2_CAL), ...UL2_TOPICS.map((t) => t.label)].join(" ");
  for (const ch of ["ө", "ү", "ң"]) assert.ok(all.includes(ch), `нет «${ch}»`);
  assert.ok(!/[öüñ]/i.test(all));
  assert.equal(all.replace(/BalaGo|WhatsApp/g, "").match(/[A-Za-z]+/g), null);
});

test("финал: точный текст; номер только на контактной карточке и не озвучивается", () => {
  assert.deepEqual(UL2_TEXT.cta, {
    brand: "BalaGo",
    tagline: "Бишкек · Балдар үчүн такси",
    route: "Үй → Мектеп → Үй",
    call: "Алдын ала арыз калтырыңыз",
    link: "Профилдеги шилтеме аркылуу",
    whatsapp: "WhatsApp: 0998 08 38 28",
  });
  assert.equal(UL2_TEXT.page.title, "Алдын ала арыз");
  assert.equal(UL2_TEXT.page.send, "Арызды жөнөтүү");
  assert.equal(UL2_TEXT.page.sent, "Алдын ала арыз кабыл алынды");
  // подтверждение — только о заявке, поездка не подтверждена
  assert.equal(UL2_TEXT.page.sentNote, "Маршрут жана убакыт кийин такталат");
  // в форме нет реальных данных: адрес и номер школы скрыты
  for (const [k, v] of UL2_TEXT.page.fields.slice(0, 2)) assert.ok(v.includes("••"), `${k}: данные не скрыты`);
  assert.notEqual(UL2_TEXT.page.sent, UL2_LETTER.sent, "статус заявки отличается от статуса письма");
  const { cta, ...rest } = UL2_TEXT;
  // WhatsApp звучит только в призыве n06; номер не озвучивается вовсе
  const spokenAll = UL2_LINES.flatMap((l) => [l.text, l.spoken ?? ""]).join("\n").toLowerCase();
  assert.ok(!/0998|\d{3} \d{2}/.test(spokenAll), "номер озвучивается");
  const spokenOther = UL2_LINES.filter((l) => l.id !== "n06").flatMap((l) => [l.text, l.spoken ?? ""]);
  const others = [...spokenOther, ...strings(rest), ...strings(UL2_LETTER), ...strings(UL2_CAL)].join("\n").toLowerCase();
  assert.ok(!/0998|whatsapp|ватсап|wa\.me/.test(others), "номер или WhatsApp вне контактной карточки");
  // номер записан только в script.ts (UL2_TEXT.cta)
  for (const f of sources(SRC)) assert.ok(!/0998|wa\.me/.test(readFileSync(f, "utf8")) || f.endsWith("script.ts"), `${f}: номер вне script.ts`);
  const all = [others, ...strings(cta)].join("\n").toLowerCase();
  for (const bad of ["http", "www", "сом", "баасы", "кепилдик", "гарант", "тиркеме", "ырасталды", "брондолду", "төлөм", "айдоочу", "келишим"]) {
    assert.ok(!new RegExp(`(^|[^\\p{L}])${bad}`, "u").test(all), `найдено «${bad}»`);
  }
});

test("оценочная шкала: реплики в своих сценах, без наложений", { skip: complete && "есть реальная озвучка" }, () => {
  assert.deepEqual(checkUl2Timing(estimateUl2Manifest().lines), []);
});

const stale = complete
  ? UL2_LINES.filter((l) => {
      const ml = manifest.lines.find((x) => x.id === l.id);
      return !ml || ml.hash !== ul2Hash(l, voiceOfRole(l.role)?.voiceId);
    }).map((l) => l.id)
  : [];
const voiceSkip = !complete ? (strict ? false : "озвучки ещё нет") : stale.length && !strict ? `устарела: ${stale.join(", ")}` : false;

test("озвучка: все реплики актуальны, тайминги букв и огибающая, без перегруза", { skip: voiceSkip }, () => {
  assert.ok(complete, "нет полной озвучки");
  assert.deepEqual(stale, []);
  for (const l of UL2_LINES) {
    const ml = manifest.lines.find((x) => x.id === l.id);
    assert.ok(existsSync(`public/${UL2_VIDEO.voiceDir}/${ml.file}`), `${l.id}: нет файла`);
    assert.ok(ml.chars?.length > 3 && ml.env?.length >= Math.floor(ml.durationSec * 30), `${l.id}: нет таймингов`);
    assert.ok(ml.peakDb <= -1, `${l.id}: пик ${ml.peakDb}`);
    assert.equal(ml.voiceId, voiceOfRole(l.role).voiceId, `${l.id}: не тот голос`);
  }
});

test("реальная шкала: без наложений, паузы, речь до финального кадра", { skip: voiceSkip }, () => {
  assert.ok(complete, "нет полной озвучки");
  assert.deepEqual(checkUl2Timing(manifest.lines), []);
  for (const c of buildUl2Cues(manifest)) assert.ok(c.to <= UL2_DIALOG_END, `${c.id} до ${c.to}`);
});

test("разборчивость (MMS): CER ≤ 25 % на реплику", { skip: voiceSkip }, () => {
  assert.ok(complete, "нет полной озвучки");
  for (const ml of manifest.lines) if (typeof ml.asrCer === "number") assert.ok(ml.asrCer <= 0.25, `${ml.id}: CER ${ml.asrCer} («${ml.asrHeard}»)`);
});
