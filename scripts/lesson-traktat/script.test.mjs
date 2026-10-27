// Проверки сценария урока: уникальные реплики, 5–7 вопросов с паузой 4–6 с,
// у каждой сцены есть опора на исходную запись, нет посторонних тем,
// длительность с озвучкой — 29:30–30:30.
import assert from "node:assert/strict";
import { test } from "node:test";
import { loadManifest, SCENES, timeline } from "./lib.mjs";
import { VISUALS_LIST } from "../../src/lesson-traktat/visuals/list.ts";

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

test("каждая сцена опирается на исходную запись", () => {
  for (const s of SCENES) {
    assert.ok(s.src.length > 0, s.id);
    for (const r of s.src) assert.match(r, /^(\d{2}:\d{2}–\d{2}:\d{2}|урок)$/, `${s.id}: ${r}`);
  }
});

test("визуалы существуют", () => {
  for (const s of SCENES) assert.ok(VISUALS_LIST.includes(s.visual.kind), `${s.id}: ${s.visual.kind}`);
});

test("нет посторонних тем и персонажей", () => {
  const text = SCENES.flatMap((s) => s.lines.map((l) => l.text)).join(" ").toLowerCase();
  for (const bad of ["лошад", "финанс", "balago", "балаго", "подпиш", "лайк"]) assert.ok(!text.includes(bad), bad);
});

test("объём речи и длительность урока", () => {
  const words = SCENES.flatMap((s) => s.lines.map((l) => l.text)).join(" ").split(/\s+/).length;
  assert.ok(words >= 2400 && words <= 3600, `слов ${words}`);
  const m = loadManifest();
  if (m?.lines?.length) {
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
  const q = readFileSync("src/lesson-traktat/components/QuestionOverlay.tsx", "utf8");
  assert.ok(!/Math\.ceil|strokeDashoffset|sec\b/.test(q), "карточка вопроса не должна считать время");
  const hook = readFileSync("src/lesson-traktat/visuals/hook.tsx", "utf8");
  assert.ok(!/вслух|таймер/.test(hook));
  const mix = readFileSync("scripts/lesson-traktat/mixdown.mjs", "utf8");
  assert.ok(!/chime/.test(mix), "без сигналов отсчёта");
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
