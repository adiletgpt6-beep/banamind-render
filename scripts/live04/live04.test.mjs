// Проверки BalaGoLive04Motion без рендера: расшифровка, финал по AGENTS.md.
//   node --test scripts/live04/live04.test.mjs
// LIVE04_STRICT_VOICE=1 — бренд-реплика обязана быть в public/audio/live04/.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { LIVE04_BRAND_LINE, LIVE04_CONTACTS } from "../../src/live04/brand.ts";
import { LIVE04, live04Timing } from "../../src/live04/timing.ts";
import { LIVE04_PHRASES, LIVE04_WORDS } from "../../src/live04/transcript.ts";

const brandFile = "public/audio/live04/brand.json";
const brand = existsSync(brandFile) ? JSON.parse(readFileSync(brandFile, "utf8")) : null;

test("слова расшифровки идут по порядку и лежат внутри исходника", () => {
  let prev = 0;
  for (const w of LIVE04_WORDS) {
    assert.ok(w.start >= prev - 0.001, `«${w.text}» начинается раньше предыдущего`);
    assert.ok(w.end > w.start, `«${w.text}»: конец раньше начала`);
    prev = w.end;
  }
  assert.ok(prev <= LIVE04.sourceDuration, "речь длиннее исходника");
  assert.equal(LIVE04_PHRASES.length, 14);
});

test("субтитры — кыргызские буквы, без латиницы кроме бренда", () => {
  const text = LIVE04_WORDS.map((w) => w.text).join(" ");
  for (const ch of ["ү", "ө", "ң"]) assert.ok(text.includes(ch), `нет буквы ${ch}`);
  const latin = LIVE04_WORDS.map((w) => w.text).filter((t) => /[A-Za-z]/.test(t));
  assert.deepEqual(latin, ["BalaGo", "WhatsApp"]);
});

test("Бишкек: в бренд-реплике и на финальном экране", () => {
  assert.match(LIVE04_BRAND_LINE.spoken, /Бишкек/);
  assert.equal(LIVE04_CONTACTS.city, "Бишкек • Балдар үчүн такси");
});

test("оба способа связи: голосом и на экране, полный номер", () => {
  assert.match(LIVE04_BRAND_LINE.spoken, /профилдеги шилтеме/i);
  assert.match(LIVE04_BRAND_LINE.spoken, /вотсап/i);
  assert.equal(LIVE04_CONTACTS.phone, "0998 08 38 28");
  assert.equal(LIVE04_CONTACTS.waLink, "https://wa.me/996998083828");
  // в живой речи Адилет сам называет оба действия
  const said = LIVE04_WORDS.map((w) => w.text.toLowerCase()).join(" ");
  assert.match(said, /профилдеги шилтемеге өтүңүз/);
  assert.match(said, /whatsapp номерге жазыңыз/);
});

test("финал: контакты ≥ 5 с одновременно, ≥ 3 с после последнего слова", () => {
  const timing = live04Timing(brand);
  const phoneAt = LIVE04_WORDS.find((w) => w.text === "WhatsApp").start;
  assert.ok(timing.totalSec - phoneAt >= 5, `контакты видны ${(timing.totalSec - phoneAt).toFixed(2)} с`);
  assert.ok(timing.totalSec - timing.brandSpeechEnd >= 3, "удержание после последнего слова < 3 с");
  // бренд-реплика не накладывается на живую речь
  const last = LIVE04_WORDS.at(-1).end;
  assert.ok(LIVE04.brandAt + (brand?.speechStart ?? 0) > last + 0.3);
});

test("бренд-реплика создана (строгий режим CI)", { skip: process.env.LIVE04_STRICT_VOICE !== "1" }, () => {
  assert.ok(brand, "нет public/audio/live04/brand.json");
  assert.ok(existsSync("public/audio/live04/brand.mp3"));
  assert.ok(brand.speechEnd > 2 && brand.speechEnd < 10, `длительность реплики ${brand.speechEnd}`);
  assert.equal(brand.voiceName, "KG-teacher");
});
