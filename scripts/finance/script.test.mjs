// Проверки сценария выпуска: привязки графики к словам, суммы, правила
// содержания (шариатский фильтр формулировок), субтитры.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { SCENES, SFX, EPISODE } from "../../src/finance/episode/script.ts";
import { buildTimeline, cueTime } from "../../src/finance/timeline.ts";
import { buildCaptions } from "../../src/finance/captions.ts";

const manifest = existsSync("public/finance/voice/manifest.json") ? JSON.parse(readFileSync("public/finance/voice/manifest.json", "utf8")) : null;
const tl = buildTimeline(SCENES, manifest);
const text = SCENES.flatMap((s) => s.lines.map((l) => l.text)).join(" ");

test("все привязки к словам находятся в репликах", () => {
  const cues = [];
  for (const s of SCENES) {
    s.host.slice(1).forEach((h) => cues.push(h.at));
    s.poses.slice(1).forEach((p) => cues.push(p.at));
  }
  SFX.forEach(([c]) => cues.push(c));
  for (const f of readdirSync("src/finance/visuals")) {
    const src = readFileSync(`src/finance/visuals/${f}`, "utf8");
    for (const m of src.matchAll(/\b(?:pop|ramp|at)\("([^"]+)"/g)) cues.push(m[1]);
    for (const m of src.matchAll(/"([a-z]\d@[^"]+)"/g)) cues.push(m[1]);
  }
  const bad = [];
  for (const c of new Set(cues)) {
    try {
      cueTime(tl, c);
    } catch (e) {
      bad.push(`${c}: ${e.message}`);
    }
  }
  assert.deepEqual(bad, []);
});

test("уникальные id реплик и визуальные блоки", () => {
  const ids = SCENES.flatMap((s) => s.lines.map((l) => l.id));
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.match(id, /^[a-z]\d$/);
});

test("суммы сквозного примера согласованы", () => {
  const e = EPISODE.example;
  assert.equal(1400 + 500 + 350 + 250 + 100, e.essentials);
  assert.equal(300 + 90 + 210, e.flexible);
  assert.equal(e.essentials + e.flexible, e.spending);
  assert.equal(e.takeHome - e.spending, e.leftover);
  assert.equal(e.takeHome / 200, 20); // цена часа
  assert.equal(120 / 20, 6); // кроссовки
  assert.equal((3 * 20) / 20, 3); // доставка в неделю
  const trimmed = e.spending - (300 - 200) - (90 - 40);
  assert.equal(trimmed, 3050);
  assert.equal(e.takeHome - trimmed, 950);
  assert.equal(600 + 250 + 100, 950);
  assert.equal(3 * e.essentials, 7800);
  assert.equal(Math.ceil(7800 / 600), 13);
  assert.equal(4500 / 250, 18);
  assert.equal(4000 / 160, 25);
  assert.equal(600 - 250, 350);
  assert.equal(300 - 200, 100);
  for (const s of ["$4,000", "$3,200", "$800", "$2,600", "$600", "$20", "$120", "$300", "$200", "$90", "$40", "$3,050", "$950", "$250", "$100", "$7,800", "$350"]) {
    assert.ok(text.includes(s), `в тексте нет ${s}`);
  }
});

test("нет запрещённых рекомендаций и обещаний", () => {
  const banned = [
    /compound interest/i, /\bAPY\b/i, /high[- ]yield/i, /savings account/i, /\bbonds?\b/i, /crypto/i, /bitcoin/i, /leverage/i,
    /margin/i, /options trading/i, /\bbet\b/i, /lottery/i, /guaranteed (income|returns?|profit)/i, /passive income/i,
    /financial freedom/i, /get rich/i, /credit card rewards/i, /mortgage/i, /\bloan\b/i, /\d+% (a|per) year/i, /halal/i,
  ];
  // допустимые упоминания — только в запрещающем контексте
  const allowed = [/get-rich-quick schemes/i, /interest-based debt/i, /interest on borrowed money/i, /no promised/i, /nothing is guaranteed/i, /not a fixed, guaranteed payout/i];
  let t = text;
  for (const a of allowed) t = t.replace(new RegExp(a.source, "gi"), "");
  for (const b of banned) assert.doesNotMatch(t, b);
  assert.doesNotMatch(text, /DRAFT/);
});

test("субтитры: не больше двух строк, строки читаемой длины", () => {
  const caps = buildCaptions(tl);
  assert.ok(caps.length > 50);
  for (const c of caps) {
    assert.ok(c.lines.length <= 2, c.lines.join(" / "));
    for (const l of c.lines) assert.ok(l.length <= 48, `длинная строка: ${l}`);
    assert.ok(c.to > c.from);
  }
  const joined = caps.map((c) => c.lines.join(" ")).join(" ");
  assert.equal(joined.replace(/\s+/g, " "), text.replace(/\s+/g, " "));
});

test("хронометраж: сцены идут подряд, финал держится", () => {
  for (let i = 1; i < tl.scenes.length; i++) assert.ok(tl.scenes[i].from >= tl.scenes[i - 1].from);
  assert.ok(tl.duration - tl.lines.at(-1).speechTo >= 3);
});
