// Тесты BalaGoFiveUnsentMessages2D: шкала 120 с, сцены без дыр, три роли и
// сохранённые голоса, ровно пять записей (файл понедельника звучит дважды),
// прогресс совместного прослушивания 0/5 → 5/5, контакт только в последних
// 150 кадрах, тексты на кыргызском.
// FU2_STRICT_VOICE=1 — устаревшая или неполная озвучка считается ошибкой.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import {
  FU2_CONTACT_FROM,
  FU2_DIALOG_END,
  FU2_FRAMES,
  FU2_LINES,
  FU2_RECORDS,
  FU2_SCENES,
  FU2_SEGMENTS,
  FU2_TEXT,
  FU2_VIDEO,
  FU2_VOICES,
} from "../src/five-unsent-messages-2d/script.ts";
import { TS2_VOICES } from "../src/two-schedules-2d/script.ts";
import { buildFu2Cues, checkFu2Timing, estimateFu2Manifest } from "../src/five-unsent-messages-2d/timing.ts";
import { fu2Hash, voiceOfRole } from "./lib/fu2d-tts.mjs";

const MANIFEST = `public/${FU2_VIDEO.voiceDir}/manifest.json`;
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : null;
const complete = Boolean(manifest && !manifest.partial && manifest.lines?.length === FU2_LINES.length);
const strict = process.env.FU2_STRICT_VOICE === "1";
const scene = (id) => FU2_SCENES.find((s) => s.id === id);

test("формат: 1080×1920, 30 fps, ровно 120 с (3600 кадров)", () => {
  assert.equal(FU2_VIDEO.id, "BalaGoFiveUnsentMessages2D");
  assert.equal(FU2_VIDEO.output, "balago-five-unsent-messages-2d");
  assert.deepEqual([FU2_VIDEO.width, FU2_VIDEO.height, FU2_VIDEO.fps, FU2_FRAMES], [1080, 1920, 30, 3600]);
});

test("12 сцен подряд, без дыр, от 0 до 120 с (сумма кадров = 3600)", () => {
  assert.equal(FU2_SCENES.length, 12);
  assert.equal(FU2_SCENES[0].from, 0);
  for (let i = 1; i < FU2_SCENES.length; i++) assert.equal(FU2_SCENES[i].from, FU2_SCENES[i - 1].to);
  assert.equal(FU2_SCENES.at(-1).to, 120);
  const frames = FU2_SCENES.reduce((s, sc) => s + Math.round(sc.to * 30) - Math.round(sc.from * 30), 0);
  assert.equal(frames, FU2_FRAMES);
});

test("контактный финал — ровно кадры 3450–3599", () => {
  assert.equal(FU2_CONTACT_FROM, 115);
  const c = scene("contact");
  assert.deepEqual([Math.round(c.from * 30), Math.round(c.to * 30) - 1], [3450, 3599]);
  assert.ok(FU2_DIALOG_END <= 115 - 1, "речь заканчивается до контактной карточки");
});

test("три роли с сохранёнными голосами проекта (новые голоса не создаются)", () => {
  assert.deepEqual(Object.keys(FU2_VOICES).sort(), ["father", "narrator", "son"]);
  assert.equal(FU2_VOICES.father.voiceId, TS2_VOICES.father.voiceId);
  assert.equal(FU2_VOICES.son.voiceId, TS2_VOICES.son.voiceId);
  assert.equal(FU2_VOICES.narrator.voiceId, TS2_VOICES.narrator.voiceId);
  for (const l of FU2_LINES) assert.ok(voiceOfRole(l.role), `${l.id}: нет голоса`);
  assert.equal(new Set(FU2_LINES.map((l) => l.id)).size, FU2_LINES.length, "ID файлов уникальны");
  assert.equal(new Set(FU2_SEGMENTS.map((s) => s.id)).size, FU2_SEGMENTS.length, "ID сегментов уникальны");
});

test("ровно пять записей, дни по порядку, один голос сына", () => {
  assert.deepEqual(FU2_RECORDS.map((r) => r.day), ["Дүйшөмбү", "Шейшемби", "Шаршемби", "Бейшемби", "Жума"]);
  assert.deepEqual(FU2_RECORDS.map((r) => r.id), ["monday", "tuesday", "wednesday", "thursday", "friday"]);
  const recLines = FU2_LINES.filter((l) => l.record);
  assert.equal(recLines.length, 5);
  for (const l of recLines) assert.equal(l.role, "son");
  assert.deepEqual(recLines.map((l) => l.id), FU2_RECORDS.map((r) => r.line));
  // запись — только режим record; живые реплики и рассказчик — нет
  for (const s of FU2_SEGMENTS) {
    const l = FU2_LINES.find((x) => x.id === s.line);
    assert.ok(l, `${s.id}: нет файла ${s.line}`);
    assert.equal(s.mode === "record", Boolean(l.record), `${s.id}: режим`);
    assert.equal(s.mode === "narrator", l.role === "narrator", `${s.id}: режим рассказчика`);
  }
});

test("файл понедельника переиспользуется: суббота и совместное прослушивание", () => {
  const uses = FU2_SEGMENTS.filter((s) => s.line === "rec1");
  assert.deepEqual(uses.map((s) => [s.scene, s.record]), [["saturday", "monday"], ["listen", "monday"]]);
  for (const l of FU2_LINES) if (l.id !== "rec1") assert.ok(FU2_SEGMENTS.filter((s) => s.line === l.id).length === 1, `${l.id} звучит не один раз`);
  // в прослушивании — пять записей по порядку, без шестой
  const listen = FU2_SEGMENTS.filter((s) => s.scene === "listen");
  assert.deepEqual(listen.map((s) => s.record), ["monday", "tuesday", "wednesday", "thursday", "friday"]);
  assert.equal(FU2_SEGMENTS.filter((s) => s.mode === "record").length, 6);
});

test("ключевые реплики — по сценарию", () => {
  const t = Object.fromEntries(FU2_LINES.map((l) => [l.id, l.text]));
  assert.equal(t.n01, "Уулу атасына беш үн билдирүү жазган. Бирин да жөнөткөн эмес. Атасы муну кокусунан билди.");
  assert.equal(t.s01, "Ата, билесиңби, бүгүн биз…");
  assert.equal(t.f02, "Азыр, уулум. Бир мүнөт күтө турчу.");
  assert.equal(t.s02, "Өзгөчө деле эч нерсе.");
  assert.equal(t.rec1, "Ата, бүгүн биринчи жолу класстын алдында өзүм сүйлөдүм.");
  assert.equal(t.s03, "Сага.");
  assert.equal(t.s04, "Өзүм айтып бергим келген. Унутуп калбайын деп жазып койгом.");
  assert.equal(t.rec3, "Ата, бүгүн биздин командага ат ойлоп таптым.");
  assert.equal(t.f06, "Бүгүн жаңы жазуу болобу?");
  assert.equal(t.s05, "Бүгүн дароо эле айтып бере алам.");
  // ответ «хотел рассказать лично» звучит в субботнем разговоре
  assert.equal(FU2_SEGMENTS.find((s) => s.line === "s04").scene, "why");
  // сегменты идут по порядку сцен и времени
  const order = FU2_SCENES.map((s) => s.id);
  for (let i = 1; i < FU2_SEGMENTS.length; i++) {
    assert.ok(FU2_SEGMENTS[i].at > FU2_SEGMENTS[i - 1].at, `${FU2_SEGMENTS[i].id} раньше предыдущего`);
    assert.ok(order.indexOf(FU2_SEGMENTS[i].scene) >= order.indexOf(FU2_SEGMENTS[i - 1].scene));
  }
});

test("прогресс «Угулду» 0/5 → 5/5 только в совместном прослушивании", () => {
  const cues = buildFu2Cues(complete ? manifest : estimateFu2Manifest());
  const L = scene("listen");
  const ends = cues.filter((c) => c.mode === "record" && c.from >= L.from && c.to <= L.to).map((c) => c.to);
  assert.equal(ends.length, 5);
  const heardAt = (t) => ends.filter((e) => t >= e + 0.2).length;
  assert.equal(heardAt(L.from), 0);
  const seq = [L.from, ...ends.map((e) => e + 0.25)].map(heardAt);
  assert.deepEqual(seq, [0, 1, 2, 3, 4, 5]);
  assert.equal(heardAt(L.to - 0.01), 5);
  // запись в субботу не входит в совместное прослушивание
  const sat = cues.find((c) => c.id === "sat-monday");
  assert.ok(sat.to < L.from);
});

const strings = (x) => (typeof x === "string" ? [x] : x && typeof x === "object" ? Object.values(x).flatMap(strings) : []);

test("кыргызские ө, ү, ң кириллицей; латиница — только BalaGo и WhatsApp", () => {
  const all = [...FU2_LINES.flatMap((l) => [l.text, l.spoken ?? ""]), ...strings(FU2_TEXT)].join(" ");
  for (const ch of ["ө", "ү", "ң"]) assert.ok(all.includes(ch), `нет «${ch}»`);
  assert.ok(!/[öüñ]/i.test(all));
  assert.equal(all.replace(/BalaGo|WhatsApp/g, "").match(/[A-Za-z]+/g), null);
});

test("финал: точный текст; номер только на контактной карточке и не озвучивается", () => {
  assert.deepEqual(FU2_TEXT.cta, {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    call: "Алдын ала арыз калтырыңыз",
    link: "Профилдеги шилтеме аркылуу",
    whatsapp: "WhatsApp: 0998 08 38 28",
  });
  assert.equal(FU2_TEXT.page.title, "Алдын ала арыз");
  assert.equal(FU2_TEXT.page.sent, "Арыз жөнөтүлдү");
  const { cta, ...rest } = FU2_TEXT;
  const others = [...FU2_LINES.flatMap((l) => [l.text, l.spoken ?? ""]), ...strings(rest)].join("\n").toLowerCase();
  assert.ok(!/0998|whatsapp|ватсап|wa\.me/.test(others), "номер или WhatsApp вне контактной карточки");
  const all = [others, ...strings(cta)].join("\n").toLowerCase();
  for (const bad of ["http", "www", "сом", "баасы", "кепилдик", "гарант", "тиркеме", "ырасталды", "брондолду", "төлөм"]) {
    assert.ok(!new RegExp(`(^|[^\\p{L}])${bad}`, "u").test(all), `найдено «${bad}»`);
  }
});

test("оценочная шкала: реплики в своих сценах, без наложений", { skip: complete && "есть реальная озвучка" }, () => {
  assert.deepEqual(checkFu2Timing(estimateFu2Manifest().lines), []);
});

const stale = complete
  ? FU2_LINES.filter((l) => {
      const ml = manifest.lines.find((x) => x.id === l.id);
      return !ml || ml.hash !== fu2Hash(l, voiceOfRole(l.role).voiceId);
    }).map((l) => l.id)
  : [];
const voiceSkip = !complete ? "озвучки ещё нет" : stale.length && !strict ? `устарела: ${stale.join(", ")}` : false;

test("озвучка: все реплики актуальны, тайминги букв и огибающая, без перегруза", { skip: voiceSkip }, () => {
  assert.deepEqual(stale, []);
  for (const l of FU2_LINES) {
    const ml = manifest.lines.find((x) => x.id === l.id);
    assert.ok(existsSync(`public/${FU2_VIDEO.voiceDir}/${ml.file}`), `${l.id}: нет файла`);
    assert.ok(ml.chars?.length > 3 && ml.env?.length >= Math.floor(ml.durationSec * 30), `${l.id}: нет таймингов`);
    assert.ok(ml.peakDb <= -1, `${l.id}: пик ${ml.peakDb}`);
    assert.equal(ml.voiceId, FU2_VOICES[l.role].voiceId, `${l.id}: не тот голос`);
  }
});

test("реальная шкала: без наложений, паузы, речь до финального кадра", { skip: voiceSkip }, () => {
  assert.deepEqual(checkFu2Timing(manifest.lines), []);
  for (const c of buildFu2Cues(manifest)) assert.ok(c.to <= FU2_DIALOG_END, `${c.id} до ${c.to}`);
});

test("разборчивость (MMS): CER ≤ 25 % на реплику", { skip: voiceSkip }, () => {
  for (const ml of manifest.lines) if (typeof ml.asrCer === "number") assert.ok(ml.asrCer <= 0.25, `${ml.id}: CER ${ml.asrCer} («${ml.asrHeard}»)`);
});
