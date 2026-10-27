// Проверки сценария BM-024: уникальные реплики, 5–7 вопросов с паузой 4–6 с, у каждой сцены
// опора на строки источника (L68–L1262) или «анализ», все главы книги покрыты, цитаты в «кавычках»
// дословно есть в источнике и короткие, обращение на «вы», обязательные оговорки TASK,
// нет рекламы кредитов/обещаний дохода/таймеров, длительность 29:30–30:30, титры по озвучке.
// LSR_SCOPE=pilot — проверяются только сцены пилота (длительность 30–75 с).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { SCENES as ALL } from "../../../src/books/lean-startup-eric-ries/film/script.ts";
import { loadManifest, PILOT, SCENES, timeline } from "./lib.mjs";
import { BOOK, FIRST, LAST } from "./source.mjs";

const letters = (s) => s.toLowerCase().replace(/ё/g, "е").replace(/[^\p{L}\p{N}]/gu, "");
const BOOK_L = letters(BOOK);
// обязательные честные оговорки фильма (TASK BM-024)
const MUST = ["не гарантирует", "исторический пример", "учебный пример"];
const text = ALL.flatMap((s) => s.lines.map((l) => l.text)).join(" ");

test("источник: строки L68–L1262, эпилог «Никаких потерь» на месте", () => {
  assert.equal(FIRST, 68);
  assert.equal(LAST, 1262);
  assert.ok(BOOK_L.includes(letters("Эпилог: никаких потерь")), "нет эпилога");
});

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
    assert.match(q.text, /^Вопрос для размышления: .+\?$/, q.id);
  }
});

test("каждая сцена опирается на строки источника L68–L1262 или «анализ»", () => {
  for (const s of ALL) {
    assert.ok(s.src.length > 0, s.id);
    for (const r of s.src) {
      if (r === "анализ") continue;
      const m = /^L(\d+)(?:–L(\d+))?$/.exec(r);
      assert.ok(m, `${s.id}: ${r}`);
      const a = Number(m[1]);
      const b = Number(m[2] ?? m[1]);
      assert.ok(a >= FIRST && b <= LAST && a <= b, `${s.id}: ${r} вне файла`);
    }
  }
});

test("охват полного источника: введение, 12 глав, эпилог; обязательные оговорки", () => {
  const lines = ALL.flatMap((s) => s.src.filter((r) => r !== "анализ").map((r) => Number(/^L(\d+)/.exec(r)[1])));
  // введение, главы 1–12 (по manifest.json), эпилог
  const ranges = [[68, 110], [111, 148], [149, 192], [193, 252], [253, 323], [324, 380], [381, 464], [465, 597], [598, 724], [725, 828], [829, 900], [901, 1020], [1021, 1093], [1094, 1170]];
  for (const [a, b] of ranges) assert.ok(lines.some((n) => n >= a && n <= b), `нет опоры на строки ${a}–${b}`);
  for (const must of MUST) assert.ok(text.includes(must), must);
});

test("цитаты книги в «кавычках»: дословно из источника и короткие (≤ 16 слов)", () => {
  for (const s of ALL)
    for (const l of s.lines)
      for (const q of l.text.match(/«[^»]+»/g) ?? []) {
        const words = q.split(/\s+/).length;
        assert.ok(words <= 16, `${l.id}: ${q}`);
        // одно-двухсловные кавычки — термины («бизнес», «Небо падает!»), остальные — цитаты
        if (words >= 3) assert.ok(BOOK_L.includes(letters(q.replace(/…/g, ""))) || q.split("…").every((p) => BOOK_L.includes(letters(p))), `${l.id}: цитаты нет в источнике: ${q}`);
      }
});

test("визуалы существуют", () => {
  const reg = readFileSync("src/books/lean-startup-eric-ries/film/visuals/index.ts", "utf8");
  const kinds = new Set([...reg.matchAll(/^\s+(\w+): \w+,$/gm)].map((m) => m[1]));
  for (const s of SCENES) assert.ok(kinds.has(s.visual.kind), `${s.id}: ${s.visual.kind}`);
});

test("нет посторонних тем, рекламы кредитов и обещаний дохода", () => {
  const low = text.toLowerCase();
  for (const bad of ["balago", "балаго", "подпиш", "лайк", "колокольч", "бишкек", "whatsapp", "гарантирован", "без риска", "лёгкие деньги", "возьмите кредит", "берите кредит", "быстро разбогате", "90%", "90 %", "fail fast"]) assert.ok(!low.includes(bad), bad);
});

test("объём речи и длительность фильма", () => {
  const words = text.split(/\s+/).length;
  assert.ok(words >= 3100 && words <= 3800, `слов ${words}`);
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
      const own = l.text.replace(/«[^»]*»/g, ""); // цитаты книги не проверяем
      assert.ok(!bad.test(own), `${l.id}: ${l.text}`);
    }
});

test("на экране нет таймеров и обратного отсчёта", () => {
  const q = readFileSync("src/books/lean-startup-eric-ries/film/components/QuestionOverlay.tsx", "utf8");
  assert.ok(!/Math\.ceil|strokeDashoffset|sec\b/.test(q), "карточка вопроса не должна считать время");
  const bar = readFileSync("src/books/lean-startup-eric-ries/film/components/ChapterBar.tsx", "utf8");
  assert.ok(!/toFixed|duration|frame/.test(bar), "табличка главы без времени");
});

test("титры BanaMind: ≤ 2 строк, без перекрытий, текст = сценарий, время слов по озвучке", async () => {
  const { cues } = await import("./lib.mjs");
  const { timeWords } = await import("../../../src/banamind/captions/build.ts");
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
