// Тесты танца фильма №33 (без рендера): опорная стопа не скользит по полу,
// движение кончается в исходной стойке, поднятая стопа не уходит под пол,
// таз остаётся между стопами (вес не «висит» снаружи опоры).
// Запуск: node --test scripts/mov33-rig.test.mjs
import assert from "node:assert/strict";
import { test } from "node:test";
import { danceAt } from "../src/moms-old-video/rig/dance.ts";
import { LOOKS } from "../src/moms-old-video/rig/looks.ts";

const MOVES = ["A", "Amirror", "B", "tuck", "bow"];
const builds = { adult: LOOKS.momDance.build, child: LOOKS.son.build };

for (const [who, b] of Object.entries(builds)) {
  for (const move of MOVES) {
    const segs = [{ move, from: 0, dur: 78, size: who === "child" ? 0.9 : 1 }];
    test(`${move} (${who}): опорная стопа неподвижна, стопа не под полом`, () => {
      let prev = danceAt(0, segs, b).feet;
      for (let t = 1; t <= 78; t++) {
        const cur = danceAt(t, segs, b).feet;
        for (let i = 0; i < 2; i++) {
          assert.ok(cur[i].y <= -14 + 1e-6, `${move} t=${t}: стопа ниже пола (${cur[i].y})`);
          const planted = prev[i].y >= -14 - 1e-6 && cur[i].y >= -14 - 1e-6;
          if (planted) assert.ok(Math.abs(cur[i].x - prev[i].x) < 0.6, `${move} t=${t}: опорная стопа ${i} скользит на ${(cur[i].x - prev[i].x).toFixed(2)}`);
        }
        prev = cur;
      }
    });
    test(`${move} (${who}): начинается и кончается в исходной стойке`, () => {
      const a = danceAt(0, segs, b);
      const z = danceAt(78, segs, b);
      for (const p of [a, z]) {
        assert.ok(Math.abs(p.hipShift) < 0.5, `таз ${p.hipShift}`);
        assert.ok(Math.abs(p.feet[0].x + p.feet[1].x) < 0.5, "стопы несимметричны");
      }
    });
  }
  test(`A (${who}): таз над опорой — между стопами с запасом`, () => {
    const segs = [{ move: "A", from: 0, dur: 78 }];
    for (let t = 0; t <= 78; t++) {
      const d = danceAt(t, segs, b);
      const lo = Math.min(d.feet[0].x, d.feet[1].x) - b.hipJointX;
      const hi = Math.max(d.feet[0].x, d.feet[1].x) + b.hipJointX;
      assert.ok(d.hipShift >= lo && d.hipShift <= hi, `t=${t}: таз ${d.hipShift.toFixed(1)} вне ${lo.toFixed(1)}…${hi.toFixed(1)}`);
    }
  });
}
