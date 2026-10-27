// Проверки сценария BM-005: уникальные реплики, 5–7 вопросов с паузой 4–6 с,
// у каждой сцены есть опора на страницы PDF книги, нет посторонних тем и
// спорных эффектов как фактов, длительность с озвучкой — 29:30–30:30.
import assert from "node:assert/strict";
import { test } from "node:test";
import { loadManifest, SCENES, timeline } from "./lib.mjs";
import { VISUALS_LIST } from "../../src/lesson-greene/visuals/list.ts";

test("реплики уникальны и не пустые", () => {
  const ids = SCENES.flatMap((s) => s.lines.map((l) => l.id));
  assert.equal(new Set(ids).size, ids.length);
  for (const s of SCENES) for (const l of s.lines) assert.ok(l.text.trim().length > 2, l.id);
});

test("5–7 интерактивных вопросов с паузой 4–6 с", () => {
  const qs = SCENES.flatMap((s) => s.lines.filter((l) => l.wait));
  assert.ok(qs.length >= 5 && qs.length <= 7, `вопросов ${qs.length}`);
  for (const q of qs) {
    assert.ok(q.wait >= 4 && q.wait <= 6, q.id);
    assert.match(q.text, /\?/, q.id);
  }
});

test("каждая сцена опирается на страницы PDF книги", () => {
  for (const s of SCENES) {
    assert.ok(s.src.length > 0, s.id);
    for (const r of s.src) assert.match(r, /^PDF \d{1,3}(–\d{1,3})? \((закон \d{1,2}|предисловие|предисловие переводчика|оглавление|выходные данные)\)$/, `${s.id}: ${r}`);
    assert.ok(s.srcNote && s.srcNote.length > 20, `${s.id}: нет примечания к источнику`);
  }
});

test("визуалы существуют", () => {
  for (const s of SCENES) assert.ok(VISUALS_LIST.includes(s.visual.kind), `${s.id}: ${s.visual.kind}`);
});

test("повреждённые страницы PDF 137–151 не используются", () => {
  for (const s of SCENES)
    for (const r of s.src) {
      const m = /^PDF (\d+)(?:–(\d+))?/.exec(r);
      const a = Number(m[1]);
      const b = Number(m[2] ?? m[1]);
      assert.ok(b < 137 || a > 151, `${s.id}: ${r} задевает повреждённые страницы`);
    }
});

test("нет посторонних тем и персонажей", () => {
  const text = SCENES.flatMap((s) => s.lines.map((l) => l.text)).join(" ").toLowerCase();
  for (const bad of ["balago", "балаго", "бишкек", "подпиш", "лайк", "расплавлен", "ступай на"]) assert.ok(!text.includes(bad), bad);
});

test("объём речи и длительность урока", () => {
  const words = SCENES.flatMap((s) => s.lines.map((l) => l.text)).join(" ").split(/\s+/).length;
  assert.ok(words >= 2400 && words <= 3600, `слов ${words}`);
  const m = loadManifest();
  if (m?.lines?.length === SCENES.reduce((a, s) => a + s.lines.length, 0)) {
    const tl = timeline();
    assert.ok(tl.duration >= 1770 && tl.duration <= 1830, `длительность ${tl.duration.toFixed(1)} с (естественная ${tl.natural.toFixed(1)})`);
  }
});

test("к зрителю — на «вы», без детских оборотов", () => {
  const bad = /(^|[^а-яё])(ты|тебя|тебе|твой|твоё|твоя|твои|твоих|твоим|твоего|твоей|давай|посмотри|представь|подумай|запомни|запоминай|молодец|пока-пока|помнишь|оглянись)([^а-яё]|$)/i;
  for (const s of SCENES) for (const l of s.lines) {
    const text = l.text.replace(/«[^»]*»/g, ""); // цитаты персонажей книги не проверяем
    assert.ok(!bad.test(text), `${l.id}: ${l.text}`);
  }
});

test("на экране нет таймеров и обратного отсчёта", async () => {
  const { readFileSync } = await import("node:fs");
  const q = readFileSync("src/lesson-greene/components/QuestionOverlay.tsx", "utf8");
  assert.ok(!/Math\.ceil|strokeDashoffset|sec\b/.test(q), "карточка вопроса не должна считать время");
  for (const f of ["intro", "power", "words", "people", "strategy", "flex"]) {
    const src = readFileSync(`src/lesson-greene/visuals/${f}.tsx`, "utf8");
    assert.ok(!/таймер|обратный отсч/i.test(src), f);
  }
  const mix = readFileSync("scripts/lesson-greene/mixdown.mjs", "utf8");
  assert.ok(!/chime/.test(mix), "без сигналов отсчёта");
});

test("титры BanaMind: ≤ 2 строк, без перекрытий, текст = сценарий, время слов по озвучке", async () => {
  if (!loadManifest()?.lines?.length) return; // без озвучки — проверяется в CI
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
    // слова — по выравниванию озвучки, в пределах речи реплики
    const ws = timeWords(ln);
    assert.ok(ws[0].start >= ln.speechFrom - 0.05 && ws[ws.length - 1].end <= ln.speechTo + 0.05, ln.id);
    assert.ok(ln.chars.length > 0, `нет таймкодов букв: ${ln.id}`);
  }
  const words = list.flatMap((c) => c.rows.flat());
  const hl = words.filter((w) => w.emph).length / words.length;
  assert.ok(hl > 0.03 && hl < 0.15, `выделено ${(hl * 100).toFixed(1)}% слов`);
  const kin = new Set(list.filter((c) => c.rows.flat().some((w) => w.emph === 3)).map((c) => c.lineId));
  assert.ok(kin.size >= 3 && kin.size <= 8, `кинетика: ${kin.size}`);
});
