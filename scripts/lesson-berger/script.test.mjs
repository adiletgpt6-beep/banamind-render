// Проверки сценария BM-038: уникальные реплики, 5–7 вопросов с паузой 4–6 с,
// опора каждой сцены на строки книги (part-NN:a–b), каждое число в реплике стоит
// в указанных строках книги, цитаты дословны, шесть камер и ключевые оговорки на месте,
// обращение к зрителю на «вы», нет таймеров и рекламы, длительность 29:30–30:30.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { loadManifest, SCENES, timeline } from "./lib.mjs";
import { checkQuotes } from "./quotes.mjs";
import { VISUALS_LIST } from "../../src/lesson-berger/visuals/list.ts";

const PART = Array.from({ length: 16 }, (_, i) => readFileSync(`books/500-series/sources/BM-038/part-${String(i + 1).padStart(2, "0")}.txt`, "utf8").split("\n"));
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

test("каждая сцена опирается на строки книги (или помечена как метафора/пример)", () => {
  for (const s of SCENES) {
    assert.ok(s.src.length > 0, s.id);
    for (const r of s.src) {
      if (r === "метафора" || r === "пример") continue;
      const m = REF.exec(r);
      assert.ok(m, `${s.id}: ${r}`);
      const p = PART[Number(m[1]) - 1];
      assert.ok(p && Number(m[2]) >= 1 && Number(m[3] ?? m[2]) <= p.length && Number(m[3] ?? m[2]) >= Number(m[2]), `${s.id}: ${r} вне файла`);
    }
    if (s.src.some((r) => REF.test(r))) assert.ok(s.book, `${s.id}: нет пометки «что говорит книга»`);
    if (s.src.includes("метафора") || s.src.includes("пример")) assert.ok(s.analysis, `${s.id}: метафора/пример без пометки analysis`);
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
  assert.ok(n >= 8, `цитат ${n}`);
  assert.deepEqual(bad, []);
});

test("визуалы существуют", () => {
  for (const s of SCENES) assert.ok(VISUALS_LIST.includes(s.visual.kind), `${s.id}: ${s.visual.kind}`);
});

test("все части фильма и ключевые оговорки на месте", () => {
  const parts = new Set(SCENES.map((s) => s.part));
  for (const p of ["intro", "talk", "currency", "triggers", "emotion", "public", "value", "stories", "mix", "end"]) assert.ok(parts.has(p), p);
  const text = SCENES.flatMap((s) => s.lines.map((l) => l.text)).join(" ");
  // примечание о правде: ложная связь прививок — сразу с опровержением
  assert.ok(SCENES.some((s) => s.src.includes("part-12:28–31")), "примечание о правде");
  assert.match(text, /Это неправда/);
  // обратная сторона наблюдаемости, предел выводов, не все шесть
  assert.ok(SCENES.some((s) => s.src.includes("part-10:70–76")), "нормализация вредного");
  assert.ok(SCENES.some((s) => s.src.includes("part-15:44")), "не все шесть принципов");
  assert.match(text, /не обещают/);
  assert.match(text, /данные тех лет/);
  // не путать с «принципами убеждения» и не обещать вирусность
  for (const bad of ["чалдини", "принципов убеждения", "гарантированно", "станет вирусной обязательно", "секрет вирусности"]) assert.ok(!text.toLowerCase().includes(bad), bad);
});

test("нет посторонних тем, рекламы, таймеров и обращения к зрителю на «ты»", () => {
  const text = SCENES.flatMap((s) => s.lines.map((l) => l.text)).join(" ").toLowerCase();
  for (const bad of ["balago", "балаго", "подпишитесь", "лайк", "колокольчик", "бишкек", "таймер", "обратный отсчёт", "100%", "всегда работает", "гарантир"]) assert.ok(!text.includes(bad), bad);
  // реплики персонажей в «ёлочках» не проверяются: это цитаты книги
  const own = " " + text.replace(/«[^»]*»/g, " ") + " ";
  for (const ty of [" ты ", " тебе ", " тебя ", " твой ", " твоя "]) assert.ok(!own.includes(ty), `обращение «${ty.trim()}»`);
});

test("объём речи и длительность фильма", () => {
  const words = SCENES.flatMap((s) => s.lines.map((l) => l.text)).join(" ").split(/\s+/).length;
  assert.ok(words >= 2400 && words <= 3900, `слов ${words}`);
  const m = loadManifest();
  // длительность проверяется, когда озвучены все реплики (после пилота — частичная озвучка)
  if (m?.lines?.length === SCENES.flatMap((s) => s.lines).length) {
    const tl = timeline();
    assert.ok(tl.duration >= 1770 && tl.duration <= 1830, `длительность ${tl.duration.toFixed(1)} с`);
  }
});
