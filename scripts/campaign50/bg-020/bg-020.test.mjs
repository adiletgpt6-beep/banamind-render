// Тесты BG-020: реплики сценария, обращение ребёнка, Бишкек, оба CTA и
// номер, факты бренда, шкала (контакты ≥ 5 с, ≥ 3 с после голоса).
//   node --test scripts/campaign50/bg-020/bg-020.test.mjs
// BG020_STRICT_VOICE=1 — требовать готовую озвучку всех реплик.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { BG020_LINES, BG020_TEXT, BG020_VIDEO, BG020_VOICES } from "../../../src/campaign50/bg-020/script.ts";
import { buildBg020Timeline, checkBg020Timeline, estimateBg020Manifest } from "../../../src/campaign50/bg-020/timeline.ts";

const episode = readFileSync("campaigns/balago-50/episodes/21-BG-020.md", "utf8");
const MANIFEST = `public/${BG020_VIDEO.voiceDir}/manifest.json`;

test("каждая реплика — дословно из сценария", () => {
  const scripted = ["s01", "n01", "f01", "m01", "n02", "n03"];
  for (const id of scripted) {
    const l = BG020_LINES.find((x) => x.id === id);
    assert.ok(episode.includes(l.text), `${id}: «${l.text}» нет в сценарии`);
  }
  const cta = BG020_LINES.filter((l) => l.scene === "cta").map((l) => l.text).join(" ");
  assert.ok(episode.includes(cta), "финальная реплика не совпадает со сценарием");
});

test("ребёнок не обращается к родителям на «сен»", () => {
  for (const l of BG020_LINES.filter((x) => x.role === "son")) {
    const words = l.text.toLowerCase().split(/[^\p{L}]+/u);
    for (const w of ["сен", "сени", "сага", "сенин", "сенде", "сенден"]) assert.ok(!words.includes(w), `${l.id}: «${w}»`);
    assert.ok(!words.some((w) => /(сыңбы|сиңби|суңбу|сүңбү)$/u.test(w)), `${l.id}: глагол на «сен»`);
  }
});

test("Бишкек, профиль и WhatsApp — в голосе и на экране", () => {
  const voice = BG020_LINES.map((l) => l.spoken ?? l.text).join(" ");
  assert.match(voice, /Бишкек/);
  assert.match(voice, /профилдеги шилтемеге/);
  assert.match(voice, /Ватсап/);
  assert.match(voice, /BalaGo менен жолго чыгалы|БалаГо менен жолго чыгалы/);
  assert.equal(BG020_TEXT.cta.city, "Бишкек • Балдар үчүн такси");
  assert.equal(BG020_TEXT.cta.whatsappNumber, "0998 08 38 28");
  assert.match(BG020_TEXT.cta.link, /Профилдеги шилтемеге өтүңүз/);
  assert.match(BG020_TEXT.cta.or, /WhatsApp/);
  assert.match(BG020_TEXT.cta.route, /ҮЙ → МЕКТЕП → ҮЙ/);
});

test("условия по BRAND_FACTS: 3–4 ребёнка, до 2 недель, полная пробная поездка бесплатна", () => {
  const steps = BG020_TEXT.steps.map((s) => `${s.title} ${s.note}`).join(" ");
  assert.match(steps, /3–4 бала/);
  assert.match(steps, /2 жумага чейин/);
  assert.match(steps, /толук сыноо сапары — акысыз/);
  assert.match(steps, /ҮЙ → МЕКТЕП → ҮЙ/);
  assert.doesNotMatch(JSON.stringify(BG020_TEXT), /GPS|1000 сом|эртең баштал/);
});

test("голоса — готовые голоса проекта", () => {
  for (const v of Object.values(BG020_VOICES)) assert.match(v.voiceId, /^[A-Za-z0-9]{20}$/);
});

test("шкала: контакты ≥ 5 с, после последнего слова ≥ 3 с", () => {
  const m = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : estimateBg020Manifest();
  const tl = buildBg020Timeline(m);
  assert.deepEqual(checkBg020Timeline(tl), []);
  assert.ok(tl.durationSec >= 55 && tl.durationSec <= 95, `длительность ${tl.durationSec}`);
});

test("озвучка готова (BG020_STRICT_VOICE=1)", { skip: process.env.BG020_STRICT_VOICE !== "1" }, () => {
  const m = JSON.parse(readFileSync(MANIFEST, "utf8"));
  for (const l of BG020_LINES) {
    const ml = m.lines.find((x) => x.id === l.id);
    assert.ok(ml?.file && existsSync(`public/${BG020_VIDEO.voiceDir}/${ml.file}`), `${l.id}: нет файла`);
    assert.equal(ml.text, l.text);
  }
});
