// Проверки сценария BM-010: уникальные реплики, 5–7 вопросов с паузой 4–6 с,
// у каждой сцены есть опора на строки TXT книги, все схемы существуют,
// к зрителю на «вы», без таймеров, длительность с озвучкой 29:30–30:30,
// титры BanaMind ≤ 2 строк, без перекрытий, текст = сценарий, время по озвучке.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { loadManifest, SCENES, timeline } from "./lib.mjs";

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
    assert.match(q.text, /^Вопрос для размышления: .*\?$/, q.id);
  }
});

test("каждая сцена опирается на строки книги (SOURCE_MAP)", () => {
  for (const s of SCENES) {
    assert.ok(s.src.length > 0, s.id);
    for (const r of s.src) assert.match(r, /^(L\d+(–L\d+)?|BanaMind)$/, `${s.id}: ${r}`);
    if (!s.src.some((r) => r.startsWith("L"))) assert.ok(s.part === "intro" || s.part === "end", `${s.id}: только комментарий канала`);
  }
  const map = readFileSync("books/peter-thiel-zero-to-one/SOURCE_MAP.md", "utf8");
  assert.match(map, /b9b983f4e05a98981f09eb1a947fa2dd8cc2642a1f8e464c6e33caaa5fc6b8f4/);
});

test("все схемы сценария есть в реестре", () => {
  const reg = readFileSync("src/lesson-zero-to-one/visuals/index.ts", "utf8");
  for (const s of SCENES) assert.match(reg, new RegExp(`\\b${s.visual.kind}:`), `${s.id}: ${s.visual.kind}`);
});

test("этика: без посторонних тем, призывов и выдумок", () => {
  const text = SCENES.flatMap((s) => s.lines.map((l) => l.text)).join(" ").toLowerCase();
  for (const bad of ["balago", "балаго", "подпиш", "лайк", "эйнштейн", "бог ", "кредит", "казино", "ставку", "инвестируйте", "гарантир"]) assert.ok(!text.includes(bad), bad);
  // «монополия» объяснена как созидательная уникальность, а не нарушение закона
  assert.ok(/исключает тех, кто нарушает закон/.test(text));
  assert.ok(/2014/.test(text), "отметка, что взгляды/цифры — 2014 года");
});

test("объём речи и длительность фильма", () => {
  const words = SCENES.flatMap((s) => s.lines.map((l) => l.text)).join(" ").split(/\s+/).length;
  assert.ok(words >= 3000 && words <= 4000, `слов ${words}`);
  const m = loadManifest();
  if (m?.lines?.length) {
    const tl = timeline();
    assert.ok(tl.duration >= 1770 && tl.duration <= 1830, `длительность ${tl.duration.toFixed(1)} с (естественная ${tl.natural.toFixed(1)})`);
  }
});

test("к зрителю — на «вы», без детских оборотов", () => {
  const bad = /(^|[^а-яё])(ты|тебя|тебе|твой|твоё|твоя|твои|давай|посмотри|представь|подумай|запомни|молодец|пока-пока)([^а-яё]|$)/i;
  for (const s of SCENES)
    for (const l of s.lines) {
      const text = l.text.replace(/«[^»]*»/g, "");
      assert.ok(!bad.test(text), `${l.id}: ${l.text}`);
    }
});

test("на экране нет таймеров и обратного отсчёта", () => {
  const q = readFileSync("src/lesson-zero-to-one/components/QuestionOverlay.tsx", "utf8");
  assert.ok(!/Math\.ceil|strokeDashoffset|sec\b/.test(q), "карточка вопроса не должна считать время");
  const mix = readFileSync("scripts/lesson-zero-to-one/mixdown.mjs", "utf8");
  assert.ok(!/chime/.test(mix), "без сигналов отсчёта");
});

test("титры BanaMind: ≤ 2 строк, без перекрытий, текст = сценарий, время слов по озвучке", async () => {
  const m = loadManifest();
  if (!m?.lines?.length) return;
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
    const ws = timeWords(ln);
    assert.ok(ws[0].start >= ln.speechFrom - 0.05 && ws[ws.length - 1].end <= ln.speechTo + 0.05, ln.id);
  }
  const words = list.flatMap((c) => c.rows.flat());
  const hl = words.filter((w) => w.emph).length / words.length;
  assert.ok(hl > 0.03 && hl < 0.18, `выделено ${(hl * 100).toFixed(1)}% слов`);
  const kin = new Set(list.filter((c) => c.rows.flat().some((w) => w.emph === 3)).map((c) => c.lineId));
  assert.ok(kin.size >= 3 && kin.size <= 8, `кинетика: ${kin.size}`);
});
