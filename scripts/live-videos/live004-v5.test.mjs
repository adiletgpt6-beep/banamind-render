// LIVE-004 v5 (V5_BRIEF.md): полировка v4 — пять точечных исправлений,
// остальное как в v4; без второй озвучки, естественный финал.
//   node --test scripts/live-videos/live004-v5.test.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { SHOT_GRADES as V4G } from "../../src/live-videos/live004/v4/grade.ts";
import { SHOT_GRADES as V5G } from "../../src/live-videos/live004/v5/grade.ts";
import { V4_EFFECTS, V4_SFX } from "../../src/live-videos/live004/v4/plan-v4.ts";
import { PLAN, V5_CUE, V5_END_SEC, V5_GESTURE, V5_ROUTE_END } from "../../src/live-videos/live004/v5/plan-v5.ts";

const code = readFileSync("src/live-videos/live004/v5/BalaGoLive04MotionV5.tsx", "utf8");
const route = readFileSync("src/live-videos/live004/v5/Route.tsx", "utf8");

test("≈90 % v4 сохранено: те же эффекты и звуки, меняется только окно маршрута", () => {
  assert.equal(PLAN.effects.length, V4_EFFECTS.length);
  PLAN.effects.forEach((e, i) => {
    assert.equal(e.id, V4_EFFECTS[i].id);
    if (e.id !== "route") assert.deepEqual(e, V4_EFFECTS[i]);
  });
  assert.equal(PLAN.sfx.length, V4_SFX.length, "без новых звуков");
});

test("1) свет: меняются только планы у фонтана (5–6), средние тона выше, без затемнения", () => {
  V5G.forEach((g, i) => {
    if (i === 4 || i === 5) {
      assert.ok(g.r[1] < V4G[i].r[1], "гамма поднимает средние тона");
      assert.ok(g.r[2] > V4G[i].r[2], "меньше «прижатия» теней");
      // белое не пересвечивается: точка белого не выше v4, светлая куртка (0,9) < 0,97
      const f = (c, x) => c[0] * Math.pow(x, c[1]) + c[2];
      for (const ch of ["r", "g", "b"]) {
        assert.ok(f(g[ch], 1) <= f(V4G[i][ch], 1) + 0.005, `точка белого ${ch}`);
        assert.ok(f(g[ch], 0.9) < 0.97, `светлые тона ${ch}`);
      }
    } else assert.deepEqual(g, V4G[i]);
  });
});

test("2) темп без процентов, понятные кыргызские слова", () => {
  assert.ok(!/Math\.round\(v \* 100\)|%<\/span>/.test(code), "проценты в шкале");
  assert.match(code, /ТЕМП ТҮШТҮ/);
  assert.match(code, /КАЙРА ТЕМПКЕ/);
});

test("3) маршрут: плавнее, подсветка пунктов и сигнал завершения, видим после прибытия", () => {
  assert.match(route, /passRing/);
  assert.match(route, /ҮЙ → МЕКТЕП → ҮЙ/);
  assert.ok(V5_ROUTE_END - (V5_CUE.uygo + 0.15) >= 0.8, "сигнал завершения виден ≥ 0,8 с");
  assert.ok(V5_ROUTE_END < V5_GESTURE.pointUpFrom, "не пересекается с шапкой Instagram");
});

test("4) Instagram: ниже края, крупная ссылка, стрелка в ссылку, жест 29,65–30,55 с", () => {
  assert.match(code, /const CARD = \{ left: 90, top: 268/);
  assert.match(code, /fontSize: 40,[\s\S]{0,80}color: C\.navyInk/);
  assert.ok(V5_GESTURE.pointUpPeak >= 29.65 && V5_GESTURE.pointUpPeak <= 30.0);
  assert.match(code, /@balago\.kg/);
  const ig = code.slice(code.indexOf("const InstagramHeader"), code.indexOf("const WhatsApp"));
  assert.ok(!/подписчик|публикац|followers|posts/.test(ig.replace(/\/\/.*$/gm, "")));
});

test("5) WhatsApp: контрастно за 0,2 с, без проявления цифр, до конца", () => {
  const wa = code.slice(code.indexOf("const WhatsApp"), code.indexOf("// ---------------------------------------------------------------- звук"));
  assert.match(wa, /ramp\(t, at, 0\.2, easeOut\)/);
  assert.ok(!/opacity: Math\.max\(0\.15, num\)/.test(wa), "цифры без бледного проявления");
  assert.match(wa, /0998 08 38 28/);
  assert.ok(V5_END_SEC - V5_CUE.tomonku >= 3);
});

test("без второй озвучки CTA и заставки; финал = длина записи", () => {
  assert.equal(PLAN.cta.duplicated, false);
  for (const banned of ["brand.mp3", "EndCard", "ContactDock"]) assert.ok(!code.includes(banned));
  assert.equal(V5_END_SEC, 34.5);
});
