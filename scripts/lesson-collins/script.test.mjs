// Проверки сценария BM-037: уникальные реплики, 5–7 вопросов с паузой 4–6 с, опора каждой
// сцены на строки книги (part-NN:a–b), каждое число реплики стоит в указанных строках книги,
// цитаты дословны, все участки фильма и все главы/FAQ/приложения книги, обращение на «вы»,
// нет таймеров, рекламы и ложных обещаний, длительность 29:30–30:30.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { loadManifest, SCENES, timeline } from "./lib.mjs";
import { checkQuotes } from "./quotes.mjs";
import { VISUALS_LIST } from "../../src/lesson-collins/visuals/list.ts";
import { numbersInWords } from "./numwords.mjs";

const PART = Array.from({ length: 25 }, (_, i) => readFileSync(`books/500-series/sources/BM-037/part-${String(i + 1).padStart(2, "0")}.txt`, "utf8").split("\n"));
const REF = /^part-(\d\d):(\d+)(?:–(\d+))?$/;
// значения, напечатанные только на рисунке книги: «fig:имя.jpg=562;309;37» (расшифровки — в source-map)
const FIG = /^fig:(\w+\.jpg)=([\d.,;]+)$/;
const FIG_INDEX = readFileSync("books/500-series/sources/BM-037/FIGURE_INDEX.md", "utf8");
const linesOf = (r) => {
  const m = REF.exec(r);
  const p = PART[Number(m[1]) - 1];
  return p.slice(Number(m[2]) - 1, Number(m[3] ?? m[2])).join(" ");
};
const numNorm = (s) => s.replace(/ /g, " ").replace(/(\d) (\d{3})/g, "$1$2");
const allText = () => SCENES.flatMap((s) => s.lines.map((l) => l.text)).join(" ");

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

test("каждая сцена опирается на строки книги (или помечена как метафора)", () => {
  for (const s of SCENES) {
    assert.ok(s.src.length > 0, s.id);
    for (const r of s.src) {
      if (r === "метафора") continue;
      const fm = FIG.exec(r);
      if (fm) {
        assert.ok(FIG_INDEX.includes(`figures/${fm[1]}`), `${s.id}: нет рисунка ${fm[1]}`);
        continue;
      }
      const m = REF.exec(r);
      assert.ok(m, `${s.id}: ${r}`);
      const p = PART[Number(m[1]) - 1];
      assert.ok(p && Number(m[2]) >= 1 && Number(m[3] ?? m[2]) <= p.length && Number(m[3] ?? m[2]) >= Number(m[2]), `${s.id}: ${r} вне файла`);
    }
    if (s.src.some((r) => REF.test(r))) assert.ok(s.book, `${s.id}: нет пометки «что говорит книга»`);
    if (s.src.includes("метафора")) assert.ok(s.analysis, `${s.id}: метафора без пометки analysis`);
  }
});

test("каждое число в репликах есть в указанных строках книги", () => {
  const bad = [];
  for (const s of SCENES) {
    if (!s.src.some((r) => REF.test(r))) {
      for (const l of s.lines) if (/\d/.test(l.text)) bad.push(`${l.id}: число в сцене-метафоре`);
      continue;
    }
    const raw = s.src.filter((r) => REF.test(r)).map(linesOf).join(" ");
    const src = numNorm(raw).replace(/(\d),(\d)/g, "$1.$2");
    const words = numbersInWords(raw);
    const figs = s.src.flatMap((r) => FIG.exec(r)?.[2].split(";").map((v) => v.replace(",", ".")) ?? []);
    for (const l of s.lines)
      for (const m of numNorm(l.text).matchAll(/\d+(?:[.,]\d+)?/g)) {
        const n = m[0].replace(",", ".");
        if (words.has(Number(n)) || figs.includes(n)) continue;
        if (!new RegExp(`(^|[^\\d.])${n.replace(".", "\\.")}([^\\d]|$)`).test(src)) bad.push(`${l.id}: ${m[0]}`);
      }
  }
  assert.deepEqual(bad, []);
});

test("цитаты в «ёлочках» дословно есть в книге", () => {
  const { n, bad } = checkQuotes();
  assert.ok(n >= 15, `цитат ${n}`);
  assert.deepEqual(bad, []);
});

test("визуалы существуют", () => {
  for (const s of SCENES) assert.ok(VISUALS_LIST.includes(s.visual.kind), `${s.id}: ${s.visual.kind}`);
});

test("все участки фильма, все 9 глав, FAQ и приложения", () => {
  const parts = new Set(SCENES.map((s) => s.part));
  for (const p of ["cold", "study", "lead", "who", "facts", "hedge", "disc", "tech", "fly", "end"]) assert.ok(parts.has(p), p);
  const files = new Set(SCENES.flatMap((s) => s.src.filter((r) => REF.test(r)).map((r) => REF.exec(r)[1])));
  // гл. 1 (02), 2 (03), 3 (05), 4 (07), 5 (09), 6 (11–12), 7 (13), 8 (14), FAQ (16), прил. 1.А/1.В/1.D (17, 18, 20)
  for (const f of ["01", "02", "03", "05", "07", "09", "11", "12", "13", "14", "16", "17", "18", "20"]) assert.ok(files.has(f), `part-${f}`);
});

test("пилот: первые сцены", () => {
  const pilot = SCENES.filter((s) => s.pilot).map((s) => s.id);
  assert.deepEqual(pilot, SCENES.slice(0, pilot.length).map((s) => s.id));
  assert.ok(pilot.length >= 3);
});

test("нет рекламы, таймеров, обещаний и обращения на «ты»", () => {
  const text = allText().toLowerCase();
  const own = text.replace(/«[^»]*»/g, " ");
  for (const bad of ["balago", "балаго", "подпиш", "лайк", "колокольчик", "бишкек", "таймер", "обратный отсчёт", "100% гарант", "гарантирую", "6,9 процента годовых", "каждый год в 6,9"]) assert.ok(!text.includes(bad), bad);
  for (const ty of [" ты ", " тебе ", " тебя ", " твой ", " твоя ", " твои "]) assert.ok(!(" " + own + " ").includes(ty), `обращение «${ty.trim()}»`);
  // латиница в речи сбивает выравнивание букв: названия — кириллицей
  for (const s of SCENES) for (const l of s.lines) assert.ok(!/[A-Za-z]/.test(l.text), `${l.id}: латиница в реплике`);
});

test("6,9 — совокупно за 15 лет, а не процент и не каждый год", () => {
  const ln = SCENES.flatMap((s) => s.lines).find((l) => l.text.includes("6,9 процента"));
  assert.ok(ln && /не 6,9 процента и не каждый год/.test(ln.text));
});

test("объём речи и длительность фильма", () => {
  const words = allText().split(/\s+/).length;
  assert.ok(words >= 3300 && words <= 4300, `слов ${words}`);
  const m = loadManifest();
  const all = SCENES.flatMap((s) => s.lines).length;
  if (m?.lines?.length >= all) {
    const tl = timeline();
    assert.ok(tl.duration >= 1770 && tl.duration <= 1830, `длительность ${tl.duration.toFixed(1)} с`);
  }
});
