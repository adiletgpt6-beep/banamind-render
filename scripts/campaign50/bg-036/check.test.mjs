// Проверки сценария BalaGoBG036 до рендера (node --test):
// реплики дословно по разделу «Полный VO для TTS» сценария 36-BG-036.md,
// Бишкек и оба способа связи в озвучке и на финальном экране, номер
// 0998 08 38 28, 1 сапар = ҮЙ → МЕКТЕП → ҮЙ, честные условия (40 → 45,
// проба отдельно и только после группы, цена по расстоянию, никаких сумм),
// кыргызские буквы, финал ≥ 5 с с контактами и ≥ 3 с после речи.
// BG36_STRICT_VOICE=1 — дополнительно требовать готовую актуальную озвучку.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { BG36_CONTACTS_IN, BG36_LINES, BG36_TEXT, BG36_VIDEO } from "../../../src/campaign50/bg-036/script.ts";
import { buildBg36Timeline, checkBg36Timeline, estimateBg36Manifest } from "../../../src/campaign50/bg-036/timing.ts";
import { requireBg36Manifest } from "../../../src/campaign50/bg-036/manifestGuard.ts";

const MF = `public/${BG36_VIDEO.voiceDir}/manifest.json`;
const EPISODE = "campaigns/balago-50/episodes/36-BG-036.md";
const strict = process.env.BG36_STRICT_VOICE === "1";
const manifest = existsSync(MF) ? JSON.parse(readFileSync(MF, "utf8")) : estimateBg36Manifest();
const text = (id) => BG36_LINES.find((x) => x.id === id).text;
const all = BG36_LINES.map((l) => `${l.text} ${l.spoken ?? ""}`).join(" ").toLowerCase();
const spoken = BG36_LINES.map((l) => l.spoken ?? l.text).join(" ").toLowerCase();
const screen = JSON.stringify(BG36_TEXT).toLowerCase();
const sceneSrc = ["Hook", "Trip", "Bonus", "Trial", "Apply", "Cta"]
  .map((n) => readFileSync(`src/campaign50/bg-036/scenes/${n}.tsx`, "utf8"))
  .join("\n")
  .toLowerCase();

test("реплики диктора дословно по сценарию 36-BG-036.md", () => {
  const md = readFileSync(EPISODE, "utf8");
  const vo = [...md.matchAll(/^\d+\. \*\*[^*]+\*\* — \*\*Диктор:\*\* «(.+)»\s*$/gmu)].map((m) => m[1]);
  assert.equal(vo.length, 6, "в сценарии 6 реплик диктора");
  assert.equal(text("n01"), vo[0]);
  assert.equal(text("n02"), vo[1]);
  assert.equal(text("n03"), vo[2]);
  assert.equal(text("n04"), vo[3]);
  assert.equal(text("n05"), vo[4]);
  // финальная реплика разделена на три фразы — вместе дословно
  assert.equal([text("n06"), text("n07"), text("n08")].join(" "), vo[5]);
});

test("озвучка отличается от текста только написанием BalaGo/WhatsApp", () => {
  for (const l of BG36_LINES) {
    if (!l.spoken) continue;
    const norm = (s) => s.replace(/BalaGo/g, "БалаГо").replace(/WhatsApp/g, "Ватсап");
    assert.equal(l.spoken, norm(l.text), l.id);
  }
});

test("Бишкек и оба способа связи в озвучке", () => {
  assert.match(spoken, /бишкектеги балдар үчүн такси/u);
  assert.match(spoken, /профилдеги шилтемеге өтүңүз/u);
  assert.match(spoken, /ватсап аркылуу жазыңыз/u);
  assert.match(spoken, /экрандагы номерге/u);
  assert.match(spoken, /жолго чыгалы/u);
});

test("финальный экран: город, профиль, WhatsApp и полный номер", () => {
  assert.equal(BG36_TEXT.cta.city, "Бишкек • Балдар үчүн такси");
  assert.equal(BG36_TEXT.cta.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(BG36_TEXT.cta.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(BG36_TEXT.cta.whatsappLabel, "WhatsApp:");
  assert.equal(BG36_TEXT.cta.whatsappNumber, "0998 08 38 28");
  const cta = readFileSync("src/campaign50/bg-036/scenes/Cta.tsx", "utf8");
  for (const k of ["t.city", "t.link", "t.or", "t.whatsappLabel", "t.whatsappNumber"]) assert.ok(cta.includes(`{${k}}`), k);
});

test("надписи сценария: 40 + 5 = 45, 1 сапар = ҮЙ → МЕКТЕП → ҮЙ, пакет, проба, цена", () => {
  assert.equal(BG36_TEXT.hook.equation, "40 + 5 = 45");
  assert.equal(BG36_TEXT.trip.equation, "1 толук сапар = ҮЙ → МЕКТЕП → ҮЙ");
  assert.equal(BG36_TEXT.example, "Шарттуу мисал");
  assert.equal(BG36_TEXT.bonus.equation, "40 төлөйсүз → 45 аласыз");
  assert.equal(BG36_TEXT.bonus.badge, "+5 бонус");
  assert.equal(BG36_TEXT.trial.separate, "Биринчи сыноо — өзүнчө");
  assert.equal(BG36_TEXT.trial.groupFirst, "Алгач ылайыктуу топ");
  assert.equal(BG36_TEXT.apply.chainText, "Сыноо → чечим → топтом");
  assert.equal(BG36_TEXT.apply.price, "Баасы аралыкка жараша");
  assert.match(BG36_TEXT.trial.groupNote, /3–4 бала/u);
  assert.match(BG36_TEXT.trial.groupNote, /2 жумага чейин/u);
});

test("никаких сумм, фиксированной цены и запрещённых обещаний", () => {
  const banned = ["сом", "1000", "1200", "1500", "тамак", "таттуу", "шире", "печенье", "конфет", "gps", "24/7", "кепилдик", "кепилденет", "эртең эле", "дароо", "автокресло", "текшерилген айдоочу"];
  for (const bad of banned) {
    assert.ok(!all.includes(bad), `реплики: ${bad}`);
    assert.ok(!screen.includes(bad), `надписи: ${bad}`);
    // в исходниках сцен — только слова (числа там — размеры и шрифты)
    if (/\p{L}/u.test(bad)) assert.ok(!new RegExp(`(?<![\\p{L}])${bad}(?![\\p{L}])`, "u").test(sceneSrc), `сцены: ${bad}`);
  }
});

test("кыргызские буквы ү, ө, ң", () => {
  for (const ch of ["ү", "ө", "ң"]) {
    assert.ok(all.includes(ch), `реплики: ${ch}`);
    assert.ok(screen.includes(ch), `надписи: ${ch}`);
  }
});

test("нет обращения на «сен» (реплик детей нет, диктор — на «сиз»)", () => {
  assert.ok(BG36_LINES.every((l) => l.role === "narrator"));
  assert.ok(!/(?<![\p{L}])(сен|сага|сени|сенин|сенде)(?![\p{L}])/iu.test(all + screen));
  assert.match(all, /төлөсөңүз|тандайсыз|өтүңүз|жазыңыз/u);
});

test("шкала: финал с контактами ≥ 5 с, после речи ≥ 3 с, 60–95 с", () => {
  if (strict) assert.ok(existsSync(MF), "нет manifest.json озвучки");
  const tl = buildBg36Timeline(manifest);
  assert.deepEqual(checkBg36Timeline(tl), []);
  const cta = tl.scenes.find((s) => s.id === "cta");
  const end = tl.frames / BG36_VIDEO.fps;
  const contactsFrom = cta.from / BG36_VIDEO.fps + BG36_CONTACTS_IN;
  assert.ok(end - contactsFrom >= 5, `контакты ${(end - contactsFrom).toFixed(2)} с`);
  assert.ok(end - tl.speechEnd >= 3, `после речи ${(end - tl.speechEnd).toFixed(2)} с`);
  // контакты появляются раньше, чем диктор их называет
  const n07 = tl.cues.find((c) => c.id === "n07");
  assert.ok(contactsFrom <= n07.from + 0.01, "контакты на экране к началу призыва");
  assert.ok(end >= 60 && end <= BG36_VIDEO.maxSec, `длительность ${end}`);
});

test("озвучка: хэш дубля и тайминги слов совпадают со сценарием (строгий режим)", { skip: !strict }, async () => {
  const { bg36Hash, voiceOfRole } = await import("./tts.mjs");
  for (const l of BG36_LINES) {
    const ml = manifest.lines.find((x) => x.id === l.id);
    // хэш считается по базовому seed реплики (дубли — seed + 11·k), как в voice.mjs
    assert.equal(ml.hash, bg36Hash(l, voiceOfRole(l.role).voiceId), `${l.id}: файл озвучки от другой версии реплики`);
    const timed = l.text.split(/\s+/).filter((w) => /[\p{L}\d]/u.test(w)).length;
    assert.equal(ml.words.length, timed, `${l.id}: слов в таймингах ${ml.words.length}, в тексте ${timed}`);
    for (let i = 1; i < ml.words.length; i++) assert.ok(ml.words[i].start >= ml.words[i - 1].start, `${l.id}: слова не по порядку`);
    assert.ok(ml.words[0].start >= ml.speechStart - 0.05 && ml.words.at(-1).end <= ml.speechEnd + 0.05, `${l.id}: слова вне речи`);
  }
});

test("озвучка актуальна (строгий режим)", { skip: !strict }, () => {
  const files = new Set(
    BG36_LINES.map((l) => manifest.lines.find((x) => x.id === l.id)?.file)
      .filter(Boolean)
      .filter((f) => existsSync(`public/${BG36_VIDEO.voiceDir}/${f}`))
      .map((f) => `${BG36_VIDEO.voiceDir}/${f}`),
  );
  assert.doesNotThrow(() => requireBg36Manifest(manifest, files));
});
