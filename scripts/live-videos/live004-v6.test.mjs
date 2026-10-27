// LIVE-004 v6 (V6_SUBTITLES_BRIEF.md): только новые субтитры поверх v5.
//   node --test scripts/live-videos/live004-v6.test.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { SHOWN_BY_GRAPHICS, V6_CAPTIONS } from "../../src/live-videos/live004/v6/captions.ts";
import { PLAN } from "../../src/live-videos/live004/v6/plan-v6.ts";
import { PLAN as V5 } from "../../src/live-videos/live004/v5/plan-v5.ts";
import { LIVE04_WORDS } from "../../src/live04/transcript.ts";

const v6 = readFileSync("src/live-videos/live004/v6/BalaGoLive04MotionV6.tsx", "utf8");
const v5 = readFileSync("src/live-videos/live004/v5/BalaGoLive04MotionV5.tsx", "utf8");
const kc = readFileSync("src/live/KineticCaptions.tsx", "utf8");

test("каждое слово речи показано ровно один раз: субтитром или синхронной графикой", () => {
  const seen = new Array(LIVE04_WORDS.length).fill(0);
  for (const g of V6_CAPTIONS) for (let i = g.from; i <= g.to; i++) seen[i]++;
  for (const [a, b] of SHOWN_BY_GRAPHICS) for (let i = a; i <= b; i++) seen[i]++;
  seen.forEach((n, i) => assert.equal(n, 1, `слово #${i} «${LIVE04_WORDS[i].text}» показано ${n} раз`));
});

test("короткие группы по порядку речи (1–5 слов, ≤ 3 строк)", () => {
  let prev = -1;
  for (const g of V6_CAPTIONS) {
    assert.ok(g.from > prev && g.to >= g.from, `порядок ${g.from}`);
    assert.ok(g.to - g.from + 1 <= 5, `группа ${g.from}–${g.to} длинная`);
    assert.ok((g.breakAfter?.length ?? 0) <= 2);
    prev = g.to;
  }
});

test("без синей плашки и без старого компонента субтитров", () => {
  assert.ok(!v6.includes("<Captions"), "v6 не использует Captions с плашкой");
  assert.ok(!/background:\s*"rgba\(10, 22, 54/.test(kc), "в KineticCaptions нет сплошной плашки");
});

test("зоны: разные по сценам, не на CTA-графике и не в нижней зоне Reels", () => {
  const zones = new Set(V6_CAPTIONS.map((g) => `${g.align}:${g.x}:${g.y}`));
  assert.ok(zones.size >= 6, `зон ${zones.size}`);
  const h = (g) => ((g.breakAfter?.length ?? 0) + 1) * (g.size ?? 64) * 1.12;
  for (const g of V6_CAPTIONS) {
    const top = g.y - h(g) / 2;
    const bottom = g.y + h(g) / 2;
    assert.ok(bottom <= 1520, `группа ${g.from}: ниже 1520 px`);
    assert.ok(top >= 230, `группа ${g.from}: выше 230 px`);
    const t0 = LIVE04_WORDS[g.from].start;
    // шапка Instagram 268–460 px и стрелка до ≈ 700 px (29,5–30,9 с)
    if (t0 >= 29.4 && t0 < 31) assert.ok(top > 720, `группа ${g.from} на шапке Instagram/стрелке`);
    // карточка WhatsApp 1176–1346 px (с 31,35 с)
    if (t0 >= 31) assert.ok(top > 1350, `группа ${g.from} на карточке WhatsApp`);
  }
});

test("остальное — как в v5: цвет, маршрут, план эффектов и звуков", () => {
  assert.match(v6, /from "\.\.\/v5\/grade"/);
  assert.match(v6, /from "\.\.\/v5\/Route"/);
  assert.deepEqual(PLAN.effects, V5.effects);
  assert.deepEqual(PLAN.sfx, V5.sfx);
  // CTA-блоки v5 перенесены без изменений
  const cut = (s, a, b) => s.slice(s.indexOf(a), s.indexOf(b));
  assert.equal(cut(v6, "const InstagramHeader", "// ---------------------------------------------------------------- звук"), cut(v5, "const InstagramHeader", "// ---------------------------------------------------------------- звук"));
});

test("заголовок хука = речь слово в слово (заменяет субтитр)", () => {
  for (const w of ["кээде", "20 мүнөттүк", "эле", "иш", "эмес"]) assert.ok(v6.includes(`text: "${w}"`), w);
});
