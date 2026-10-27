// LIVE-004 v4 (V4_BRIEF.md): яркий монтаж, CTA автора без второй озвучки,
// визуализации по словам и жестам, естественный финал.
//   node --test scripts/live-videos/live004-v4.test.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { SHOT_GRADES } from "../../src/live-videos/live004/v4/grade.ts";
import { PLAN, V4_CUE, V4_END_SEC, V4_GESTURE } from "../../src/live-videos/live004/v4/plan-v4.ts";
import { LIVE04_WORDS } from "../../src/live04/transcript.ts";

const code = readFileSync("src/live-videos/live004/v4/BalaGoLive04MotionV4.tsx", "utf8");

test("нет второй озвучки CTA и финальной заставки; конец — длина записи", () => {
  assert.equal(PLAN.cta.spoken, true);
  assert.equal(PLAN.cta.duplicated, false);
  for (const banned of ["brand.mp3", "EndCard", "ContactDock", "brandAt"]) assert.ok(!code.includes(banned), banned);
  assert.ok(V4_END_SEC >= LIVE04_WORDS.at(-1).end + 0.3 && V4_END_SEC <= 34.51);
});

test("шапка @balago.kg — на жесте вверх и словах «профилдеги шилтемеге»", () => {
  const prof = LIVE04_WORDS.find((w) => w.text === "профилдеги");
  assert.ok(Math.abs(V4_GESTURE.pointUpFrom - prof.start) < 0.3, "шапка не совпадает со словом");
  assert.ok(V4_GESTURE.pointUpPeak > V4_GESTURE.pointUpFrom && V4_GESTURE.pointUpPeak < V4_GESTURE.pointUpTo);
  assert.match(code, /@balago\.kg/);
  // стилизованная схема без выдуманных цифр профиля
  const ig = code.slice(code.indexOf("const InstagramHeader"), code.indexOf("// ---------------------------------------------------------------- CTA: WhatsApp"));
  assert.ok(!/подписчик|публикац|followers|posts|\d{2,}\s*(k|K|тыс)/.test(ig.replace(/\/\/.*$/gm, "")), "в шапке не должно быть метрик");
});

test("WhatsApp 0998 08 38 28 — на словах «төмөнкү WhatsApp номерге», ≥ 3 с на чтение", () => {
  assert.match(code, /0998 08 38 28/);
  const tomonku = LIVE04_WORDS.find((w) => w.text === "төмөнкү").start;
  assert.equal(V4_CUE.tomonku, tomonku);
  assert.ok(V4_END_SEC - tomonku >= 3, `номер виден ${(V4_END_SEC - tomonku).toFixed(2)} с`);
});

test("Бишкек понятен: надпись (в речи не назван)", () => {
  assert.equal(PLAN.city.spoken, false);
  assert.match(code, /Бишкек • Балдар үчүн такси/);
});

test("свет: коррекция каждого из 7 планов, без глобальной тёмной вуали", () => {
  assert.equal(SHOT_GRADES.length, 7);
  for (const g of SHOT_GRADES) assert.ok(g.r[0] >= 1 && g.g[0] >= 1, "план не затемняется");
  assert.ok(!/rgba\(6,\s*14,\s*38,\s*0\.[3-9]\)\s*100%/.test(code), "нижний затемняющий градиент");
});

test("эффекты привязаны к словам и не накладываются друг на друга", () => {
  const ins = [...PLAN.inserts].sort((a, b) => a.from - b.from);
  for (let i = 1; i < ins.length; i++) assert.ok(ins[i].from >= ins[i - 1].to - 0.35, `${ins[i - 1].id} / ${ins[i].id}`);
  for (const e of PLAN.effects) assert.ok(e.words && e.why);
});
