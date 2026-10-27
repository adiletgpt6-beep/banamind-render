// Проверки сценария BG-002: обращение ребёнка к отцу на «сиз», Бишкек и
// оба способа связи в озвучке и на экране, полный номер, отсутствие
// запрещённых обещаний, шкала реплик по оценочным таймингам.
import assert from "node:assert/strict";
import { test } from "node:test";
import { BG2_LINES, BG2_SCENES, BG2_TEXT, BG2_VIDEO } from "../../../src/campaign50/bg-002/script.ts";
import { bg2DurationFrames, buildBg2Cues, checkBg2Timing, estimateBg2Manifest } from "../../../src/campaign50/bg-002/timing.ts";

const all = BG2_LINES.map((l) => `${l.text} ${l.spoken ?? ""}`).join(" ");
const screen = JSON.stringify(BG2_TEXT);

test("сын обращается к отцу на «сиз»", () => {
  const son = BG2_LINES.filter((l) => l.role === "son");
  assert.ok(son.length > 0);
  for (const l of son) {
    assert.match(l.text, /\bсиз\b|сиз(би|ге|ди|дин)|[еэ]сизби/i, l.id);
    assert.doesNotMatch(l.text, /(^|\s)(сен|сага|сени|сенин)(\s|[.,?!]|$)|кетесиңби|бересиңби/i, l.id);
  }
});

test("финал: Бишкек, ссылка в профиле и WhatsApp — в речи", () => {
  const cta = BG2_LINES.find((l) => l.scene === "cta");
  assert.match(cta.text, /Бишкек/);
  assert.match(cta.text, /профилдеги шилтеме/);
  assert.match(cta.text, /WhatsApp/);
  assert.match(cta.text, /0998 08 38 28/);
  assert.match(cta.spoken, /Ватсап/);
});

test("финальный экран: город, оба действия и полный номер", () => {
  assert.equal(BG2_TEXT.cta.city, "Бишкек • Балдар үчүн такси");
  assert.equal(BG2_TEXT.cta.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(BG2_TEXT.cta.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(BG2_TEXT.cta.whatsapp, "WhatsApp: 0998 08 38 28");
});

test("нет запрещённых обещаний и еды", () => {
  for (const bad of [/24\/7/, /GPS/i, /сертификат/i, /кафил/i, /тамак/i, /таттуу/i, /эртеңден/i]) {
    assert.doesNotMatch(all + screen, bad);
  }
  assert.match(all, /топ түзүлөт/);
  assert.match(all, /толук сыноо сапары акысыз/);
});

test("кыргызские буквы на месте", () => {
  assert.match(all + screen, /ү/);
  assert.match(all + screen, /ө/);
  assert.match(all + screen, /ң/);
});

test("шкала: реплики в своих сценах, финал ≥ 3,2 с после речи, 66–75 с", () => {
  const m = estimateBg2Manifest();
  assert.deepEqual(checkBg2Timing(m.lines), []);
  const sec = bg2DurationFrames(m) / BG2_VIDEO.fps;
  const last = Math.max(...buildBg2Cues(m).map((c) => c.to));
  assert.ok(sec >= BG2_VIDEO.minSec && sec <= BG2_VIDEO.maxSec, `${sec}`);
  assert.ok(sec - last >= 3.2, `${sec - last}`);
  const ctaFrom = BG2_SCENES.find((s) => s.id === "cta").from;
  assert.ok(sec - ctaFrom - 1.8 >= 5, "контакты на экране ≥ 5 с");
});
