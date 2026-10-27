// Проверки сценария BM-029: уникальные реплики, 5–7 вопросов с паузой 4–6 с,
// опора каждой сцены на строки книги (part-NN:a–b), каждое число в реплике стоит
// в указанных строках книги, цитаты дословны, все блоки фильма на месте,
// историческая рамка (начало 2015 года) названа, нет инвестиционных советов,
// обращение к зрителю на «вы», нет таймеров и рекламы, длительность 29:30–30:30.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { loadManifest, SCENES, timeline } from "./lib.mjs";
import { checkQuotes } from "./quotes.mjs";
import { VISUALS_LIST } from "../../src/lesson-musk/visuals/list.ts";

const PART = Array.from({ length: 16 }, (_, i) => readFileSync(`books/500-series/sources/BM-029/part-${String(i + 1).padStart(2, "0")}.txt`, "utf8").split("\n"));
const REF = /^part-(\d\d):(\d+)(?:–(\d+))?$/;
const linesOf = (r) => {
  const m = REF.exec(r);
  const p = PART[Number(m[1]) - 1];
  return p.slice(Number(m[2]) - 1, Number(m[3] ?? m[2])).join(" ");
};
const numNorm = (s) => s.replace(/ /g, " ");

test("реплики уникальны и не пустые", () => {
  const ids = SCENES.flatMap((s) => s.lines.map((l) => l.id));
  assert.equal(new Set(ids).size, ids.length);
  for (const s of SCENES) for (const l of s.lines) assert.ok(l.text.trim().length > 2, l.id);
});

test("5–7 вопросов для размышления с паузой 4–6 с", () => {
  const qs = SCENES.flatMap((s) => s.lines.filter((l) => l.wait));
  assert.ok(qs.length >= 5 && qs.length <= 7, `вопросов ${qs.length}`);
  for (const q of qs) {
    assert.ok(q.wait >= 4 && q.wait <= 6, q.id);
    assert.match(q.text, /\?$/, q.id);
  }
});

test("каждая сцена опирается на строки книги (или помечена как метафора/анализ)", () => {
  for (const s of SCENES) {
    assert.ok(s.src.length > 0, s.id);
    for (const r of s.src) {
      if (r === "метафора" || r === "анализ") continue;
      const m = REF.exec(r);
      assert.ok(m, `${s.id}: ${r}`);
      const p = PART[Number(m[1]) - 1];
      assert.ok(p && Number(m[2]) >= 1 && Number(m[3] ?? m[2]) <= p.length && Number(m[3] ?? m[2]) >= Number(m[2]), `${s.id}: ${r} вне файла`);
    }
    if (s.src.some((r) => REF.test(r))) assert.ok(s.book, `${s.id}: нет пометки «что говорит книга»`);
    if (s.src.includes("метафора") || s.src.includes("анализ")) assert.ok(s.analysis, `${s.id}: метафора/анализ без пометки analysis`);
  }
});

test("каждое число в репликах есть в указанных строках книги", () => {
  const bad = [];
  for (const s of SCENES) {
    const src = numNorm(s.src.filter((r) => REF.test(r)).map(linesOf).join(" ")).replace(/(\d),(\d)/g, "$1.$2");
    for (const l of s.lines)
      for (const m of l.text.matchAll(/\d+(?:[.,]\d+)?/g)) {
        const n = m[0].replace(",", ".");
        if (!new RegExp(`(^|[^\\d.])${n.replace(".", "\\.")}([^\\d]|$)`).test(src)) bad.push(`${l.id}: ${m[0]}`);
      }
  }
  assert.deepEqual(bad, []);
});

test("цитаты в «ёлочках» дословно есть в книге", () => {
  const { n, bad } = checkQuotes();
  assert.ok(n >= 12, `цитат ${n}`);
  assert.deepEqual(bad, []);
});

test("визуалы существуют", () => {
  for (const s of SCENES) assert.ok(VISUALS_LIST.includes(s.visual.kind), `${s.id}: ${s.visual.kind}`);
});

test("все блоки фильма, рамка книги и три вывода", () => {
  const parts = new Set(SCENES.map((s) => s.part));
  for (const p of ["intro", "author", "early", "zip2", "paypal", "spacex", "tesla", "crisis", "launch", "factory", "horizon", "cost", "end"]) assert.ok(parts.has(p), p);
  const text = SCENES.flatMap((s) => s.lines.map((l) => l.text)).join(" ");
  assert.match(text, /начала 2015 года/, "временная рамка книги");
  assert.match(text, /Эшли Вэнс/, "автор книги");
  assert.deepEqual(SCENES.filter((s) => s.visual.kind === "conclusion").map((s) => s.visual.n), [1, 2, 3]);
  // Tesla основали Эберхард и Тарпеннинг — фильм не приписывает основание одному Маску
  assert.match(text, /основали Мартин Эберхард и Марк Тарпеннинг/);
});

test("нет инвестиционных советов и сенсаций", () => {
  const text = SCENES.flatMap((s) => s.lines.map((l) => l.text)).join(" ").toLowerCase();
  for (const bad of ["купите акци", "продайте акци", "инвестируйте", "рекомендуем купить", "секрет успеха", "пять секретов", "гарантирован", "последние новости", "сейчас маск", "сегодня маск"]) assert.ok(!text.includes(bad), bad);
});

test("нет посторонних тем, рекламы, таймеров и обращения на «ты»", () => {
  const text = SCENES.flatMap((s) => s.lines.map((l) => l.text)).join(" ").toLowerCase();
  for (const bad of ["balago", "балаго", "подпиш", "лайк", "колокольчик", "бишкек", "таймер", "обратный отсчёт", "100%", "всегда работает", "гарантир"]) assert.ok(!text.includes(bad), bad);
  for (const ty of [" ты ", " тебе ", " тебя ", " твой ", " твоя "]) assert.ok(!(" " + text + " ").includes(ty), `обращение «${ty.trim()}»`);
});

test("объём речи и длительность фильма", () => {
  const words = SCENES.flatMap((s) => s.lines.map((l) => l.text)).join(" ").split(/\s+/).length;
  assert.ok(words >= 2900 && words <= 3700, `слов ${words}`);
  const m = loadManifest();
  // длительность проверяется, когда озвучены все реплики (в пилоте — только пилотные сцены)
  if (m?.lines?.length === SCENES.flatMap((s) => s.lines).length) {
    const tl = timeline();
    assert.ok(tl.duration >= 1770 && tl.duration <= 1830, `длительность ${tl.duration.toFixed(1)} с`);
  }
});

test("опоры SOURCE_MAP: 50+ утверждений, дословные якоря в указанных строках, сцены существуют", async () => {
  const { FACTS } = await import("./facts.mjs");
  assert.ok(FACTS.length >= 50, `опор ${FACTS.length}`);
  const ids = new Set(SCENES.map((s) => s.id));
  for (const f of FACTS) {
    const m = REF.exec(f.ref);
    assert.ok(m, `${f.id}: ${f.ref}`);
    const line = PART[Number(m[1]) - 1][Number(m[2]) - 1] ?? "";
    assert.ok(numNorm(line).includes(numNorm(f.anchor)), `${f.id}: нет «${f.anchor}» в ${f.ref}`);
    assert.ok(ids.has(f.scene), `${f.id}: нет сцены ${f.scene}`);
    assert.ok(["В", "М", "П", "А"].includes(f.who) || f.who.startsWith("У:"), `${f.id}: голос ${f.who}`);
  }
});
