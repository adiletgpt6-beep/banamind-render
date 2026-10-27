// Тесты BG-021: тексты (Бишкек, оба CTA, номер, кыргызские буквы), фрагменты
// субтитров, шкала финала (контакты ≥5 с, ≥3 с после последнего слова),
// длительность. С BG021_STRICT_VOICE=1 — озвучка полная и актуальная.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { BG021_LINES, BG021_VIDEO, BG021_WHATSAPP, spokenWords } from "../../../src/campaign50/bg-021/script.ts";
import { buildBg021Timeline, sceneOf } from "../../../src/campaign50/bg-021/timing.ts";

const MANIFEST = `public/${BG021_VIDEO.voiceDir}/manifest.json`;
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : null;
const all = BG021_LINES.map((l) => l.text).join(" ");
const spoken = BG021_LINES.map((l) => l.spoken).join(" ");

test("Бишкек, ссылка в профиле и WhatsApp — в озвучке", () => {
  assert.match(spoken, /Бишкектеги балдар үчүн такси/);
  assert.match(spoken, /профилдеги шилтемеге өтүңүз/);
  assert.match(spoken, /вотсап/i);
  assert.match(spoken, /нөл, тогуз жүз токсон сегиз, нөл сегиз, отуз сегиз, жыйырма сегиз/);
  assert.match(spoken, /жолго чыгалы!$/);
  assert.equal(BG021_WHATSAPP, "0998 08 38 28");
  assert.match(all, /0998 08 38 28/);
});

test("Тексты кыргызские, без «сен»-обращений и без латинских подмен букв", () => {
  assert.match(spoken, /[үөң]/);
  for (const l of BG021_LINES) {
    assert.doesNotMatch(l.spoken, /(?<!\p{L})(сен|сага|сени|сенин)(?!\p{L})/iu, l.id);
    assert.doesNotMatch(l.spoken, /[a-z]/i, `${l.id}: латиница в тексте для синтеза`);
  }
});

test("Фрагменты субтитров покрывают все слова реплики", () => {
  for (const l of BG021_LINES.filter((x) => x.chunks.length)) {
    const n = l.chunks.reduce((a, [, k]) => a + k, 0);
    assert.equal(n, spokenWords(l.spoken).length, l.id);
    for (const [text, k] of l.chunks) assert.equal(spokenWords(text).length, k, `${l.id}: «${text}»`);
  }
});

test("Финал: контакты ≥5 с, ≥3 с после последнего слова; хронометраж 60–80 с", () => {
  const tl = buildBg021Timeline(manifest);
  const cta = sceneOf(tl, "cta");
  const lastWord = Math.max(...tl.cues.map((c) => c.to));
  const contactsFrom = cta.from + 1.2; // карточка контактов полностью видна
  assert.ok(tl.totalSec - contactsFrom >= 5, `контакты ${(tl.totalSec - contactsFrom).toFixed(2)} с`);
  assert.ok(tl.totalSec - lastWord >= 3, `после речи ${(tl.totalSec - lastWord).toFixed(2)} с`);
  assert.ok(tl.totalSec >= 55 && tl.totalSec <= 80, `длительность ${tl.totalSec} с`);
});

test("Озвучка полная и соответствует сценарию (BG021_STRICT_VOICE=1)", { skip: process.env.BG021_STRICT_VOICE !== "1" }, () => {
  assert.ok(manifest, "нет manifest.json");
  for (const l of BG021_LINES) {
    const m = manifest.lines.find((x) => x.id === l.id);
    assert.ok(m, `нет реплики ${l.id}`);
    assert.equal(m.spoken, l.spoken, l.id);
    assert.ok(existsSync(`public/${BG021_VIDEO.voiceDir}/${m.file}`), m.file);
  }
  assert.ok(buildBg021Timeline(manifest).voiced);
});
