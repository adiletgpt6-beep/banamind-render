// LIVE-005 v1 — проверки монтажа по правилам BalaGo LIVE (live/STYLE.md,
// live-videos/RULES.md, CLAUDE.md): речь, субтитры, лицо и жесты, CTA, город.
//   node --test scripts/live-videos/live005.test.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { cameraAt, zoomAt } from "../../src/live-videos/live005/camera.ts";
import { IG_CARD, WA_BUBBLE, igArrowPoint } from "../../src/live-videos/live005/cta.ts";
import { LIVE005_CAPTIONS, SHOWN_BY_GRAPHICS } from "../../src/live-videos/live005/captions.ts";
import { faceBox, shotIndex } from "../../src/live-videos/live005/face.ts";
import { applyGrade, gradeAt } from "../../src/live-videos/live005/grade.ts";
import { faceColorAt } from "../../src/live-videos/live005/face.ts";
import { EXIT, blockRect, groupWindow, linesOf, wordHold } from "../../src/live-videos/live005/layout.ts";
import { INSERTS, PLAN, SFX } from "../../src/live-videos/live005/plan.ts";
import { CUTS, GESTURE, LIVE005_END } from "../../src/live-videos/live005/timing.ts";
import { LIVE005_PHRASES, LIVE005_WORDS as W } from "../../src/live-videos/live005/transcript.ts";

const comp = readFileSync("src/live-videos/live005/BalaGoLive005V1.tsx", "utf8");
const gfx = readFileSync("src/live-videos/live005/Graphics.tsx", "utf8");
const caps = readFileSync("src/live-videos/live005/EditorialCaptions.tsx", "utf8");
const lum = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];

test("расшифровка: 73 слова по порядку, кыргызские буквы, без лишней латиницы", () => {
  assert.equal(W.length, 73);
  assert.equal(LIVE005_PHRASES.length, 12);
  for (let i = 1; i < W.length; i++) assert.ok(W[i].start >= W[i - 1].end - 0.001 && W[i].end > W[i].start, `слово ${i}`);
  assert.ok(W[W.length - 1].end < LIVE005_END, "речь укладывается в ролик");
  const text = W.map((w) => w.text).join(" ");
  for (const ch of ["ү", "ө", "ң"]) assert.ok(text.includes(ch), `есть «${ch}»`);
  const latin = W.filter((w) => /[A-Za-z]/.test(w.text)).map((w) => w.text);
  assert.deepEqual(latin, ["BalaGo'нун", "WhatsApp'ка"]);
  // автор обращается к родителю на «сиз»; детской речи нет
  assert.match(text, /балаңызды/);
  assert.doesNotMatch(text, /\b(сен|сага|сени)\b/i);
});

test("каждое слово речи показано ровно один раз: субтитром или синхронной графикой", () => {
  const seen = new Array(W.length).fill(0);
  for (const g of LIVE005_CAPTIONS) for (let i = g.from; i <= g.to; i++) seen[i]++;
  for (const [a, b] of SHOWN_BY_GRAPHICS) for (let i = a; i <= b; i++) seen[i]++;
  seen.forEach((n, i) => assert.equal(n, 1, `слово #${i} «${W[i].text}» показано ${n} раз`));
  // графика действительно выводит эти слова (EdLines по тем же индексам)
  assert.match(gfx, /from: 17, to: 20/);
  assert.match(gfx, /from: 21, to: 26/);
  assert.match(gfx, /from: 35, to: 36/);
  assert.match(gfx, /from: 37, to: 39/);
  assert.match(gfx, /from: 40, to: 42/);
  assert.match(gfx, /from: 43, to: 44/);
});

test("короткие группы по 1–5 слов (одна фраза с перечёркиванием — 6), по порядку, ≤ 3 строк", () => {
  let prev = -1;
  let six = 0;
  for (const g of LIVE005_CAPTIONS) {
    assert.ok(g.from > prev && g.to >= g.from, `порядок ${g.from}`);
    const n = g.to - g.from + 1;
    assert.ok(n <= 6, `группа ${g.from}–${g.to} длинная`);
    if (n === 6) six++;
    assert.ok(linesOf(g).length <= 3, `группа ${g.from}: строк больше 3`);
    prev = g.to;
  }
  assert.ok(six <= 1, "шесть слов — только у одной фразы");
});

test("каждое слово успевают прочитать: стоит неподвижно ≥ 0,15 с (обычно ≥ 0,3 с)", () => {
  const holds = [];
  for (const [i, g] of LIVE005_CAPTIONS.entries())
    for (let w = g.from; w <= g.to; w++) {
      const h = wordHold(W, LIVE005_CAPTIONS, i, w, CUTS);
      holds.push(h);
      assert.ok(h >= 0.15, `«${W[w].text}» стоит ${h.toFixed(2)} с`);
    }
  const median = holds.sort((a, b) => a - b)[Math.floor(holds.length / 2)];
  assert.ok(median >= 0.6, `медиана ${median.toFixed(2)} с`);
});

test("одновременно видимые группы не налезают друг на друга и на часы хука", () => {
  for (let i = 0; i < LIVE005_CAPTIONS.length; i++)
    for (let j = i + 1; j < LIVE005_CAPTIONS.length; j++) {
      const a = groupWindow(W, LIVE005_CAPTIONS, i, CUTS);
      const b = groupWindow(W, LIVE005_CAPTIONS, j, CUTS);
      if (Math.min(a.end, b.end) - Math.max(a.start, b.start) <= EXIT + 0.01) continue; // «лента»: уход и вход
      const ra = blockRect(LIVE005_CAPTIONS[i], W);
      const rb = blockRect(LIVE005_CAPTIONS[j], W);
      assert.ok(!(ra.left < rb.right && ra.right > rb.left && ra.top < rb.bottom - 2 && ra.bottom > rb.top + 2), `группы ${LIVE005_CAPTIONS[i].from} и ${LIVE005_CAPTIONS[j].from}`);
    }
  const clock = INSERTS.find((x) => x.id === "clock");
  const box = { left: 82 - 16, right: 194 + 16, top: 258 - 16, bottom: 370 + 16 }; // циферблат с кольцом
  for (const [i, g] of LIVE005_CAPTIONS.entries()) {
    const w = groupWindow(W, LIVE005_CAPTIONS, i, CUTS);
    if (w.end <= clock.from || w.start >= clock.to) continue;
    const r = blockRect(g, W);
    assert.ok(!(r.left < box.right && r.right > box.left && r.top < box.bottom && r.bottom > box.top), `группа ${g.from} на часах`);
  }
});

test("без синей плашки: нет коробки под субтитрами, нет старых компонентов", () => {
  assert.ok(!comp.includes("<Captions"), "нет Captions с плашкой");
  assert.ok(!comp.includes("KineticCaptions"), "свой стиль, не шаблон LIVE-004 v6");
  assert.doesNotMatch(caps, /background:\s*"rgba\(10, 22, 54/);
  assert.doesNotMatch(caps, /borderRadius:\s*\d+,\s*\n\s*background:\s*C\.navy/);
});

test("субтитры в безопасной зоне Reels и не закрывают лицо", () => {
  for (const [i, g] of LIVE005_CAPTIONS.entries()) {
    const r = blockRect(g, W);
    assert.ok(r.left >= 70 && r.right <= 930, `группа ${g.from}: по ширине ${Math.round(r.left)}–${Math.round(r.right)}`);
    assert.ok(r.top >= 230 && r.bottom <= 1520, `группа ${g.from}: по высоте ${Math.round(r.top)}–${Math.round(r.bottom)}`);
    const w = groupWindow(W, LIVE005_CAPTIONS, i, CUTS);
    for (let t = w.start; t < w.end; t += 1 / 30) {
      const f = faceBox(t, 20);
      const hit = r.left < f.right && r.right > f.left && r.top < f.bottom && r.bottom > f.top;
      assert.ok(!hit, `группа ${g.from} на лице в ${t.toFixed(2)} с`);
    }
  }
});

test("субтитры и вставки живут внутри своего плана и не обрывают слово раньше времени", () => {
  for (const [i, g] of LIVE005_CAPTIONS.entries()) {
    const w = groupWindow(W, LIVE005_CAPTIONS, i, CUTS);
    assert.equal(shotIndex(w.start), shotIndex(w.end - 0.001), `группа ${g.from} переходит склейку`);
    assert.ok(w.start <= W[g.from].start, `группа ${g.from} появляется к первому слову`);
    // последнее слово видно почти до конца его звучания (уход — вместе со входом следующей)
    assert.ok(w.end >= Math.min(W[g.to].end - 0.05, CUTS.find((c) => c > W[g.from].start) ?? Infinity) - 0.03, `группа ${g.from} уходит раньше слова «${W[g.to].text}»`);
  }
  for (const x of INSERTS.filter((v) => v.kind === "insert")) assert.equal(shotIndex(x.from), shotIndex(x.to - 0.001), `вставка ${x.id} переходит склейку`);
});

test("позиции меняются по сценам (не одна зона на весь ролик)", () => {
  const zones = new Set(LIVE005_CAPTIONS.map((g) => `${g.align}:${g.x}:${Math.round(g.y / 100)}`));
  assert.ok(zones.size >= 6, `зон ${zones.size}`);
  const top = LIVE005_CAPTIONS.filter((g) => g.y < 600).length;
  const bottom = LIVE005_CAPTIONS.filter((g) => g.y > 1200).length;
  assert.ok(top >= 4 && bottom >= 4, "и небо, и нижняя треть");
});

// Окна реальных жестов (кадр 1080×1920) — по покадровому просмотру исходника.
const HANDS = [
  { from: 2.55, to: 3.6, box: [60, 1150, 1050, 1560] }, // ладони «калсачы?»
  { from: 7.85, to: 10.45, box: [0, 1020, 1080, 1240] }, // ладони в стороны (дилемма)
  { from: 14.3, to: 16.8, box: [220, 880, 830, 1060] }, // перечисление
  { from: 21.15, to: 21.6, box: [280, 740, 470, 1050] }, // палец «уюштуруп»
  { from: 27.55, to: 28.65, box: [440, 640, 570, 860] }, // палец вверх
  { from: 28.8, to: 29.85, box: [430, 820, 580, 990] }, // палец вниз
  { from: 30.75, to: 31.75, box: [260, 860, 780, 1205] }, // раскрытые ладони (поднимаются и опускаются)
];

test("субтитры не перекрывают жестикулирующие руки", () => {
  for (const [i, g] of LIVE005_CAPTIONS.entries()) {
    const r = blockRect(g, W);
    const w = groupWindow(W, LIVE005_CAPTIONS, i, CUTS);
    for (const h of HANDS) {
      if (w.end <= h.from || w.start >= h.to) continue;
      const [l, tp, rt, b] = h.box;
      assert.ok(!(r.left < rt && r.right > l && r.top < b && r.bottom > tp), `группа ${g.from} на жесте ${h.from}`);
    }
  }
});

test("пузырь WhatsApp и шапка Instagram не закрывают жестикулирующие руки", () => {
  const boxes = [
    { id: "whatsapp", r: [WA_BUBBLE.left, WA_BUBBLE.top, WA_BUBBLE.left + WA_BUBBLE.width, WA_BUBBLE.top + WA_BUBBLE.height] },
    { id: "instagram", r: [IG_CARD.left, IG_CARD.top, IG_CARD.left + IG_CARD.width, IG_CARD.top + IG_CARD.height] },
  ];
  for (const b of boxes) {
    const x = INSERTS.find((v) => v.id === b.id);
    for (const h of HANDS) {
      if (x.to <= h.from || x.from >= h.to) continue;
      const [l, tp, rt, bt] = h.box;
      const [L, T, R, B] = b.r;
      assert.ok(!(L < rt && R > l && T < bt && B > tp), `${b.id} на жесте ${h.from}`);
    }
  }
});

test("вставки по одной, у каждой слова и смысл; CTA автора не дублируется", () => {
  const sorted = [...INSERTS].sort((a, b) => a.from - b.from);
  for (let i = 1; i < sorted.length; i++) assert.ok(sorted[i].from >= sorted[i - 1].to - 0.1, `${sorted[i - 1].id} и ${sorted[i].id} пересекаются`);
  for (const x of INSERTS) assert.ok(x.words && x.why, x.id);
  assert.equal(PLAN.cta.spoken, true);
  assert.equal(PLAN.cta.duplicated, false);
  assert.ok(PLAN.justification.length > 40);
  // никакой синтетической озвучки, финальной заставки и контакт-дока
  assert.doesNotMatch(comp, /brand\.mp3|EndCard|ContactDock|elevenlabs/i);
  const audio = [...comp.matchAll(/<Audio src=\{staticFile\(([^)]+)\)/g)].map((m) => m[1]);
  assert.deepEqual(audio.slice(0, 2), ["LIVE005.voice", "LIVE005.music"]);
});

test("CTA по жестам: Instagram на пальце вверх, WhatsApp под пальцем вниз ≥ 3 с, номер точный", () => {
  const ig = INSERTS.find((x) => x.id === "instagram");
  const wa = INSERTS.find((x) => x.id === "whatsapp");
  assert.ok(ig.from <= GESTURE.pointUp.from && ig.to >= GESTURE.pointUp.to - 0.1, "шапка на жесте вверх");
  assert.ok(wa.from <= GESTURE.pointDown.from + 0.1, "номер с жестом вниз");
  assert.ok(wa.to >= LIVE005_END - 0.01 && LIVE005_END - wa.from >= 3, `номер на экране ${(LIVE005_END - wa.from).toFixed(2)} с`);
  assert.match(gfx, />0998 08 38 28</);
  assert.match(gfx, /@balago\.kg/);
  assert.doesNotMatch(gfx, /подписчик|публикац|followers|posts/i, "метрики аккаунта не выдумываются");
  // номер появляется сразу (≤ 0,15 с) и дальше неподвижен; пузырь ниже кончика пальца
  assert.match(gfx, /const a = ramp\(t, x\.from, 0\.15, easeOut\)/);
  assert.match(gfx, /const BUBBLE = WA_BUBBLE;/);
  assert.ok(WA_BUBBLE.top > GESTURE.pointDown.tip.y + 40, "пузырь ниже пальца");
  assert.ok(WA_BUBBLE.top + WA_BUBBLE.height <= 1520 && WA_BUBBLE.left >= 70 && WA_BUBBLE.left + WA_BUBBLE.width <= 930, "пузырь в безопасной зоне");
  // камера в CTA без зума: координаты жестов сняты при масштабе 1
  for (let t = GESTURE.pointUp.from; t < 30.5; t += 0.1) assert.ok(Math.abs(zoomAt(t) - 1) < 0.002, `зум в CTA ${t.toFixed(1)}`);
});

test("шапка Instagram и стрелка не заходят на лицо, пузырь WhatsApp — ниже лица и руки", () => {
  const ig = INSERTS.find((x) => x.id === "instagram");
  for (let t = ig.from; t <= ig.to; t += 1 / 30) {
    const f = faceBox(t, 6);
    assert.ok(IG_CARD.top + IG_CARD.height < f.top, `шапка над головой в ${t.toFixed(2)}`);
    for (let u = 0; u <= 1; u += 0.02) {
      const p = igArrowPoint(t, u);
      assert.ok(!(p.x > f.left && p.x < f.right && p.y > f.top && p.y < f.bottom), `стрелка на лице в ${t.toFixed(2)} (u=${u.toFixed(2)})`);
    }
  }
  const wa = INSERTS.find((x) => x.id === "whatsapp");
  for (let t = wa.from; t < LIVE005_END; t += 1 / 30) assert.ok(WA_BUBBLE.top > faceBox(t, 20).bottom, `пузырь ниже лица в ${t.toFixed(2)}`);
});

test("Бишкек в кадре (не назван в речи) — деликатной надписью", () => {
  assert.equal(PLAN.city.spoken, false);
  assert.match(gfx, /Бишкек\n/);
  assert.match(gfx, /Бишкектеги балдар үчүн такси/);
});

test("камера: плавные приближения ≤ 1,15, без рывков внутри плана", () => {
  let prev = cameraAt(0);
  for (let f = 1; f < LIVE005_END * 30; f++) {
    const t = f / 30;
    const c = cameraAt(t);
    assert.ok(c.s >= 0.999 && c.s <= 1.15, `масштаб ${c.s} в ${t.toFixed(2)}`);
    // склейки и задуманный переход «наезд с размытием» на 17,43 с — не рывки
    const cut = CUTS.some((x) => Math.abs(x - t) < 0.05) || Math.abs(t - CUTS[4]) < 0.4;
    if (!cut) assert.ok(Math.abs(c.s - prev.s) < 0.02, `рывок масштаба в ${t.toFixed(2)}`);
    prev = c;
  }
});

test("цвет: лицо светлее исходника, без затемнения и пересвета белого", () => {
  for (let t = 0.2; t < LIVE005_END; t += 0.5) {
    const g = gradeAt(t);
    const f = faceColorAt(t);
    const out = applyGrade(g, f);
    assert.ok(lum(out) > lum(f) + 8, `лицо ярче в ${t.toFixed(1)} (${Math.round(lum(f))} → ${Math.round(lum(out))})`);
    assert.ok(lum(out) >= 105 && lum(out) <= 140, `яркость лица ${Math.round(lum(out))} в ${t.toFixed(1)}`);
    const white = applyGrade(g, [235, 235, 235]);
    assert.ok(Math.max(...white) - Math.min(...white) < 14, `белая куртка не окрашена в ${t.toFixed(1)}`);
    const night = applyGrade(g, [10, 14, 30]);
    assert.ok(lum(night) < 24, `ночное небо остаётся тёмным в ${t.toFixed(1)}`);
  }
});

test("звук: только оригинальный голос, музыка под ним, немного мягких эффектов", () => {
  assert.ok(SFX.length <= 8, `эффектов ${SFX.length}`);
  for (const s of SFX) assert.ok(s.volume <= 0.35);
  assert.match(comp, /speaking\(t \+ k\) \? 0\.11 : 0\.26/);
});
