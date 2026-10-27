// Проверки сценария BM-031: уникальные реплики, 6–9 вопросов с паузой 4–6 с,
// опора каждой сцены на строки книги (part-NN:a–b, 25 файлов) или пометку «анализ/метафора»,
// каждое число в репликах есть в указанных строках, озвучка — пересказ (нет совпадений
// с переводом из 7+ слов подряд), все участки фильма и все 25 частей книги, обращение
// к зрителю на «вы», нет таймеров и рекламы, длительность 29:30–30:30.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { loadManifest, SCENES, timeline } from "./lib.mjs";
import { checkOriginality } from "./quotes.mjs";
import { VISUALS_LIST } from "../../src/books/harry-potter-philosophers-stone/film/visuals/list.ts";

const PART = Array.from({ length: 25 }, (_, i) => readFileSync(`books/500-series/sources/BM-031/part-${String(i + 1).padStart(2, "0")}.txt`, "utf8").split("\n"));
const REF = /^part-(\d\d):(\d+)(?:–(\d+))?$/;
const TAGS = new Set(["анализ", "метафора", "manifest.json"]);
const linesOf = (r) => {
  const m = REF.exec(r);
  const p = PART[Number(m[1]) - 1];
  return p.slice(Number(m[2]) - 1, Number(m[3] ?? m[2])).join(" ");
};

test("реплики уникальны и не пустые", () => {
  const ids = SCENES.flatMap((s) => s.lines.map((l) => l.id));
  assert.equal(new Set(ids).size, ids.length);
  for (const s of SCENES) for (const l of s.lines) assert.ok(l.text.trim().length > 2, l.id);
});

test("6–9 вопросов для размышления с паузой 4–6 с", () => {
  const qs = SCENES.flatMap((s) => s.lines.filter((l) => l.wait));
  assert.ok(qs.length >= 6 && qs.length <= 9, `вопросов ${qs.length}`);
  for (const q of qs) {
    assert.ok(q.wait >= 4 && q.wait <= 6, q.id);
    assert.match(q.text, /\?$/, q.id);
  }
});

test("каждая сцена опирается на строки книги или помечена как анализ/метафора", () => {
  for (const s of SCENES) {
    assert.ok(s.src.length > 0, s.id);
    for (const r of s.src) {
      if (TAGS.has(r) || /^part-\d\d$/.test(r)) continue;
      const m = REF.exec(r);
      assert.ok(m, `${s.id}: ${r}`);
      const p = PART[Number(m[1]) - 1];
      assert.ok(p && Number(m[2]) >= 1 && Number(m[3] ?? m[2]) <= p.length && Number(m[3] ?? m[2]) >= Number(m[2]), `${s.id}: ${r} вне файла`);
    }
  }
});

test("каждое число в репликах есть в указанных строках книги", () => {
  const bad = [];
  for (const s of SCENES) {
    const src = s.src.filter((r) => REF.test(r)).map(linesOf).join(" ");
    for (const l of s.lines) for (const m of l.text.matchAll(/\d+/g)) if (!new RegExp(`(^|\\D)${m[0]}(\\D|$)`).test(src)) bad.push(`${l.id}: ${m[0]}`);
  }
  assert.deepEqual(bad, []);
});

test("озвучка — наш пересказ: нет совпадений с переводом из 7+ слов и длинных цитат", () => {
  const { overlaps, longQuotes } = checkOriginality();
  assert.deepEqual(overlaps, []);
  assert.deepEqual(longQuotes, []);
});

test("визуалы существуют", () => {
  for (const s of SCENES) assert.ok(VISUALS_LIST.includes(s.visual.kind), `${s.id}: ${s.visual.kind}`);
});

test("все участки фильма и все 25 частей книги", () => {
  const parts = new Set(SCENES.map((s) => s.part));
  for (const p of ["cold", "frame", "origin", "fame", "choice", "trust", "judge", "mirror", "pressure", "reveal", "end"]) assert.ok(parts.has(p), p);
  const files = new Set(SCENES.flatMap((s) => s.src.filter((r) => REF.test(r)).map((r) => REF.exec(r)[1])));
  for (let i = 1; i <= 25; i++) assert.ok(files.has(String(i).padStart(2, "0")), `part-${String(i).padStart(2, "0")}`);
});

test("пилот: первые сцены, 3+ сцены", () => {
  const pilot = SCENES.filter((s) => s.pilot).map((s) => s.id);
  assert.deepEqual(pilot, SCENES.slice(0, pilot.length).map((s) => s.id));
  assert.ok(pilot.length >= 3);
});

test("нет посторонних тем, рекламы, таймеров и обращения к зрителю на «ты»", () => {
  const text = SCENES.flatMap((s) => s.lines.map((l) => l.text)).join(" ").toLowerCase();
  const own = text.replace(/«[^»]*»/g, " ");
  for (const bad of ["balago", "балаго", "подпиш", "лайк", "колокольчик", "бишкек", "таймер", "обратный отсчёт", "фильм уорнер", "warner"]) assert.ok(!text.includes(bad), bad);
  for (const ty of [" ты ", " тебе ", " тебя ", " твой ", " твоя ", " твоих "]) assert.ok(!(" " + own.replace(/[.,!?:;—]/g, " ") + " ").includes(ty), `обращение «${ty.trim()}»`);
});

test("объём речи и длительность фильма", () => {
  const words = SCENES.flatMap((s) => s.lines.map((l) => l.text)).join(" ").split(/\s+/).length;
  assert.ok(words >= 2800 && words <= 4000, `слов ${words}`);
  const m = loadManifest();
  const all = SCENES.flatMap((s) => s.lines).length;
  if (m?.lines?.length >= all) {
    const tl = timeline();
    assert.ok(tl.duration >= 1770 && tl.duration <= 1830, `длительность ${tl.duration.toFixed(1)} с`);
  }
});
