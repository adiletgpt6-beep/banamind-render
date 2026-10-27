// Проверки сценария BM-030: уникальные реплики, 5–7 вопросов с паузой 4–6 с, у каждой
// сцены есть опора на источник (part-NN:Lxxx) или пометка «анализ», нет длинных цитат,
// обращение на «вы», нет посторонних тем, нет таймеров, длительность 29:30–30:30,
// анимированные титры BanaMind по озвучке.
// WP_SCOPE=pilot — проверяются только сцены пилота (длительность 30–75 с).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { SCENES as ALL } from "../../src/books/war-and-peace-tolstoy/film/script.ts";
import { loadManifest, PILOT, SCENES, timeline } from "./lib.mjs";

const SRC = (n) => readFileSync(`books/500-series/sources/BM-030/part-${n}.txt`, "utf8").split("\n").length;

test("реплики уникальны и не пустые", () => {
  const ids = ALL.flatMap((s) => s.lines.map((l) => l.id));
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(new Set(ALL.map((s) => s.id)).size, ALL.length);
  for (const s of ALL) for (const l of s.lines) assert.ok(l.text.trim().length > 2, l.id);
});

test("5–7 вопросов для размышления с паузой 4–6 с", () => {
  const qs = ALL.flatMap((s) => s.lines.filter((l) => l.wait));
  assert.ok(qs.length >= 5 && qs.length <= 7, `вопросов ${qs.length}`);
  for (const q of qs) {
    assert.ok(q.wait >= 4 && q.wait <= 6, q.id);
    assert.match(q.text, /\?/, q.id);
  }
});

test("каждая сцена опирается на источник: part-NN:Lxxx в пределах файла или «анализ»", () => {
  const len = {};
  for (const s of ALL) {
    assert.ok(s.src.length > 0, s.id);
    for (const r of s.src) {
      if (r === "анализ") continue;
      const m = /^part-(\d{2}):L(\d+)(?:–L(\d+))?$/.exec(r);
      assert.ok(m, `${s.id}: ${r}`);
      len[m[1]] ??= SRC(m[1]);
      for (const n of [m[2], m[3]].filter(Boolean)) assert.ok(Number(n) >= 1 && Number(n) <= len[m[1]], `${s.id}: ${r} вне файла`);
    }
  }
});

test("охват романа: все тома, эпилог I и II, главные линии", () => {
  const src = ALL.flatMap((s) => s.src).join(" ");
  const parts = new Set([...src.matchAll(/part-(\d{2}):/g)].map((m) => Number(m[1])));
  // Том I: 01–13, Том II: 14–29, Том III: 30–45, Том IV: 46–55, Эпилог I: 55–58, Эпилог II: 58–60
  for (const [name, lo, hi] of [["Том I", 1, 13], ["Том II", 14, 29], ["Том III", 30, 45], ["Том IV", 46, 55], ["Эпилог", 55, 58], ["Эпилог II", 58, 60]])
    assert.ok([...parts].some((n) => n >= lo && n <= hi), `нет опоры на ${name}`);
  assert.ok(parts.size >= 45, `опор только на ${parts.size} частей`);
  const text = ALL.flatMap((s) => s.lines.map((l) => l.text)).join(" ");
  for (const must of ["Аустерлиц", "Бородино", "Каратаев", "Кутузов", "Наполеон", "княжна Марья", "Соня", "Николай", "эпилог", "Москва", "последняя фраза книги"]) assert.ok(text.includes(must), must);
});

test("цитаты книги в кавычках короткие (≤ 12 слов)", () => {
  for (const s of ALL)
    for (const l of s.lines)
      for (const q of l.text.match(/«[^»]+»/g) ?? []) assert.ok(q.split(/\s+/).length <= 12, `${l.id}: ${q}`);
});

test("визуалы существуют", () => {
  // реестр читается как текст: .tsx не импортируются в node
  const reg = readFileSync("src/books/war-and-peace-tolstoy/film/visuals/index.ts", "utf8");
  const kinds = new Set([...reg.matchAll(/^\s+(\w+): \w+,$/gm)].map((m) => m[1]));
  for (const s of SCENES) assert.ok(kinds.has(s.visual.kind), `${s.id}: ${s.visual.kind}`);
});

test("нет посторонних тем и призывов", () => {
  const text = ALL.flatMap((s) => s.lines.map((l) => l.text)).join(" ").toLowerCase();
  for (const bad of ["balago", "балаго", "подпиш", "лайк", "колокольч", "бишкек", "whatsapp", "бондарчук", "одри хепберн"]) assert.ok(!text.includes(bad), bad);
});

test("объём речи и длительность фильма", () => {
  const words = ALL.flatMap((s) => s.lines.map((l) => l.text)).join(" ").split(/\s+/).length;
  assert.ok(words >= 3000 && words <= 3700, `слов ${words}`);
  const m = loadManifest();
  const ids = new Set(m?.lines.map((l) => l.id) ?? []);
  if (SCENES.every((s) => s.lines.every((l) => ids.has(l.id)))) {
    const tl = timeline();
    const [lo, hi] = PILOT ? [30, 75] : [1770, 1830];
    assert.ok(tl.duration >= lo && tl.duration <= hi, `длительность ${tl.duration.toFixed(1)} с (естественная ${tl.natural.toFixed(1)})`);
  }
});

test("к зрителю — на «вы», без детских оборотов", () => {
  const bad = /(^|[^а-яё])(ты|тебя|тебе|твой|твоё|твоя|твои|давай|посмотри|представь|подумай|запомни|молодец|пока-пока)([^а-яё]|$)/i;
  for (const s of ALL)
    for (const l of s.lines) {
      const text = l.text.replace(/«[^»]*»/g, ""); // реплики героев книги не проверяем
      // пересказ слов героев («…не доверил бы его тебе…») допустим после «отвечает:/говорит:»
      const own = text.replace(/(отвечает|говорит|скажет|просит)[^.]*:[^.]*\./g, "");
      assert.ok(!bad.test(own), `${l.id}: ${l.text}`);
    }
});

test("на экране нет таймеров и обратного отсчёта", () => {
  const q = readFileSync("src/books/war-and-peace-tolstoy/film/components/QuestionOverlay.tsx", "utf8");
  assert.ok(!/Math\.ceil|strokeDashoffset|sec\b/.test(q), "карточка вопроса не должна считать время");
  const bar = readFileSync("src/books/war-and-peace-tolstoy/film/components/LayerBar.tsx", "utf8");
  assert.ok(!/toFixed|duration|frame/.test(bar), "значок слоя без времени");
});

test("титры BanaMind: ≤ 2 строк, без перекрытий, текст = сценарий, время слов по озвучке", async () => {
  const { cues } = await import("./lib.mjs");
  const { timeWords } = await import("../../src/banamind/captions/build.ts");
  const tl = timeline();
  const list = cues(tl);
  for (let i = 0; i < list.length; i++) {
    const c = list[i];
    assert.ok(c.rows.length <= 2, c.text);
    if (list[i + 1]) assert.ok(c.end <= list[i + 1].start, `перекрытие: ${c.text}`);
  }
  for (const ln of tl.lines) {
    const got = list.filter((c) => c.lineId === ln.id).map((c) => c.text).join(" ");
    assert.equal(got, ln.text.split(/\s+/).filter(Boolean).join(" "), ln.id);
    if (ln.file) {
      const ws = timeWords(ln);
      assert.ok(ws[0].start >= ln.speechFrom - 0.05 && ws[ws.length - 1].end <= ln.speechTo + 0.05, ln.id);
      assert.ok(ln.chars.length > 0, `нет таймкодов букв: ${ln.id}`);
    }
  }
  const words = list.flatMap((c) => c.rows.flat());
  const hl = words.filter((w) => w.emph).length / words.length;
  assert.ok(hl > 0.03 && hl < 0.2, `выделено ${(hl * 100).toFixed(1)}% слов`);
});
