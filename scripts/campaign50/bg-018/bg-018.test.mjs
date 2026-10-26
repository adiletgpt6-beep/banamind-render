// Тесты BG-018: тексты (Бишкек, оба CTA, номер, ү/ө/ң, без «сен»),
// шкала (паузы, финал ≥ 3 с после голоса, контакты ≥ 5 с), озвучка.
//   node --test scripts/campaign50/bg-018/bg-018.test.mjs
// BG18_STRICT_VOICE=1 — все реплики обязаны иметь актуальный файл озвучки.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { BG18_CONTACTS, BG18_LINES, BG18_VIDEO } from "../../../src/campaign50/bg-018/script.ts";
import { buildBg18Timeline, checkBg18Timeline, estimateBg18Manifest } from "../../../src/campaign50/bg-018/timing.ts";
import { bg18Hash, voiceOfRole } from "./tts.mjs";

const MANIFEST = join("public", BG18_VIDEO.voiceDir, "manifest.json");
const all = BG18_LINES.map((l) => l.text).join(" ");
const spoken = BG18_LINES.map((l) => l.spoken ?? l.text).join(" ");

test("Бишкек и оба способа связи — в речи", () => {
  assert.match(spoken, /Бишкек/);
  assert.match(spoken, /профилдеги шилтемеге/);
  assert.match(spoken, /вотсап/i);
  assert.match(spoken, /жолго чыгалы/);
});

test("контакты финала на экране", () => {
  assert.equal(BG18_CONTACTS.city, "Бишкек • Балдар үчүн такси");
  assert.equal(BG18_CONTACTS.profile, "Профилдеги шилтемеге өтүңүз");
  assert.equal(BG18_CONTACTS.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(BG18_CONTACTS.phone, "0998 08 38 28");
  assert.match(all, /0998 08 38 28/);
});

test("кыргызские буквы, без обращения на «сен» и без еды", () => {
  assert.match(all, /[ү]/);
  assert.match(all, /[ө]/);
  assert.match(all, /[ң]/);
  assert.doesNotMatch(all, /\bсен\b|\bсага\b|\bсени\b/i);
  assert.doesNotMatch(all, /тамак|шоколад|конфет|шире/i);
});

test("шкала по оценке таймингов корректна", () => {
  const tl = buildBg18Timeline(estimateBg18Manifest());
  assert.deepEqual(checkBg18Timeline(tl), []);
  assert.ok(tl.durationSec >= 55 && tl.durationSec <= 90, `длительность ${tl.durationSec}`);
});

test("озвучка: файлы и шкала", { skip: !existsSync(MANIFEST) && process.env.BG18_STRICT_VOICE !== "1" }, () => {
  assert.ok(existsSync(MANIFEST), "нет manifest.json");
  const m = JSON.parse(readFileSync(MANIFEST, "utf8"));
  assert.equal(m.partial, false);
  for (const l of BG18_LINES) {
    const ml = m.lines.find((x) => x.id === l.id);
    assert.ok(ml, `нет реплики ${l.id}`);
    assert.ok(existsSync(join("public", BG18_VIDEO.voiceDir, ml.file)), `нет файла ${ml.file}`);
    assert.equal(ml.hash, bg18Hash(l, voiceOfRole(l.role).voiceId), `${l.id}: файл не соответствует тексту`);
  }
  const tl = buildBg18Timeline(m);
  assert.deepEqual(checkBg18Timeline(tl), []);
});
