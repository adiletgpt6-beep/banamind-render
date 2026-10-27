// LIVE-004 v3: правила живого финала (live/STYLE.md, AGENTS.md).
//   node --test scripts/live-videos/live004.test.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { PLAN, V3_END_SEC } from "../../src/live-videos/live004/plan-v3.ts";
import { LIVE04_WORDS } from "../../src/live04/transcript.ts";

const code = readFileSync("src/live-videos/live004/BalaGoLive04MotionV3.tsx", "utf8");

test("CTA произнесён автором и сохранён в субтитрах", () => {
  assert.equal(PLAN.cta.spoken, true);
  const said = LIVE04_WORDS.map((w) => w.text).join(" ");
  assert.match(said, /профилдеги шилтемеге өтүңүз/);
  assert.match(said, /WhatsApp номерге жазыңыз/);
});

test("CTA не дублируется: нет бренд-озвучки, контактных карточек и заставки", () => {
  assert.equal(PLAN.cta.duplicated, false);
  for (const banned of ["brand.mp3", "ContactDock", "EndCard", "LIVE04_CONTACTS", "brandAt"]) {
    assert.ok(!code.includes(banned), `в v3 не должно быть ${banned}`);
  }
});

test("естественный финал: ролик заканчивается вместе с записью", () => {
  const last = LIVE04_WORDS.at(-1).end;
  assert.ok(V3_END_SEC >= last + 0.3, "последнее слово обрезано");
  assert.ok(V3_END_SEC <= 34.51, "ролик не продлевается после конца записи");
});

test("Бишкек понятен зрителю: в речи не назван → деликатная надпись", () => {
  assert.equal(PLAN.city.spoken, false);
  const inserts = readFileSync("src/live-videos/live004/Inserts.tsx", "utf8");
  assert.match(inserts, /Бишкек • Балдар үчүн такси/);
  assert.match(code, /<RouteInsert keepCity \/>/);
});

test("сдержанность: ≤ 3 вставок, ≤ 8 звуков, ни одного звука на словах CTA", () => {
  assert.ok(PLAN.inserts.length <= 3);
  assert.ok(PLAN.sfx.length <= 8);
  const ctaFrom = LIVE04_WORDS.find((w) => w.text === "профилдеги").start;
  assert.ok(PLAN.sfx.every((s) => s.at < ctaFrom), "звук на CTA");
  assert.ok(PLAN.inserts.every((i) => i.to < ctaFrom), "графика на CTA");
});
