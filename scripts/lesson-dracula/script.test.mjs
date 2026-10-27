// Проверки сценария BM-033: уникальные реплики, 5–7 вопросов с паузой 4–6 с,
// опора каждой сцены на главу, файл и строку русской редакции 2013 года (или
// пометка «метафора»), цитаты дословны и стоят в своих опорах, охват всех 23
// глав, нет посторонних тем и фальшивых заявлений («27 глав прочитаны»),
// обращение к зрителю на «вы», нет таймеров, титры BanaMind по озвучке,
// длительность с озвучкой — 29:30–30:30.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { loadManifest, SCENES, timeline } from "./lib.mjs";
import { checkQuotes } from "./quotes.mjs";
import { checkRef, parseRef } from "./source.mjs";
import { VISUALS_LIST } from "../../src/lesson-dracula/visuals/list.ts";

test("реплики уникальны и не пустые", () => {
  const ids = SCENES.flatMap((s) => s.lines.map((l) => l.id));
  assert.equal(new Set(ids).size, ids.length);
  const sids = SCENES.map((s) => s.id);
  assert.equal(new Set(sids).size, sids.length);
  for (const s of SCENES) for (const l of s.lines) assert.ok(l.text.trim().length > 2, l.id);
});

test("5–7 вопросов для размышления с паузой 4–6 с", () => {
  const qs = SCENES.flatMap((s) => s.lines.filter((l) => l.wait));
  assert.ok(qs.length >= 5 && qs.length <= 7, `вопросов ${qs.length}`);
  for (const q of qs) {
    assert.ok(q.wait >= 4 && q.wait <= 6, q.id);
    assert.match(q.text, /\?/, q.id);
  }
});

test("каждая сцена опирается на главу, файл и строку (или помечена как метафора)", () => {
  for (const s of SCENES) {
    assert.ok(s.src.length > 0, s.id);
    for (const r of s.src) {
      if (r === "метафора") continue;
      assert.equal(checkRef(r), null, `${s.id}: ${checkRef(r)}`);
    }
    if (!s.src.every((r) => r === "метафора")) assert.ok(s.book, `${s.id}: нет пометки «что в романе»`);
    assert.ok(s.analysis, `${s.id}: нет пометки «вывод BanaMind»`);
  }
});

test("опоры охватывают все 23 главы редакции и не меньше 50 строк", () => {
  const refs = SCENES.flatMap((s) => s.src.map(parseRef).filter(Boolean));
  const chapters = new Set(refs.map((r) => r.ch));
  for (let ch = 1; ch <= 23; ch++) assert.ok(chapters.has(ch), `нет опоры на главу ${ch}`);
  const uniq = new Set(refs.map((r) => `${r.part}:${r.line}`));
  assert.ok(uniq.size >= 50, `опорных строк ${uniq.size}`);
});

test("цитаты в «ёлочках» дословно есть в книге и в опорах сцены", () => {
  const { n, bad } = checkQuotes();
  assert.ok(n >= 40, `цитат ${n}`);
  assert.deepEqual(bad, []);
});

test("визуалы существуют", () => {
  for (const s of SCENES) assert.ok(VISUALS_LIST.includes(s.visual.kind), `${s.id}: ${s.visual.kind}`);
});

test("нет посторонних тем, рекламы, кинообразов и ложных заявлений об издании", () => {
  const text = SCENES.flatMap((s) => s.lines.map((l) => l.text)).join(" ").toLowerCase();
  for (const bad of ["balago", "балаго", "подпиш", "лайк", "колокольчик", "бишкек", "коппол", "universal", "hammer", "бела лугоши", "кристофер ли", "все 27 глав", "полный перевод", "несокращ", "переводчик", "как спастись от вампир", "чеснок помогает"])
    assert.ok(!text.includes(bad), bad);
  // 27 глав упоминаются только как внешняя справка об английском издании
  const with27 = SCENES.filter((s) => s.lines.some((l) => /двадцать семь|27 глав/.test(l.text)));
  assert.deepEqual(with27.map((s) => s.id), ["d03"]);
});

test("объём речи и длительность фильма", () => {
  const words = SCENES.flatMap((s) => s.lines.map((l) => l.text)).join(" ").split(/\s+/).length;
  assert.ok(words >= 3000 && words <= 3900, `слов ${words}`);
  const m = loadManifest();
  if (m?.lines?.length === SCENES.reduce((a, s) => a + s.lines.length, 0)) {
    const tl = timeline();
    assert.ok(tl.duration >= 1770 && tl.duration <= 1830, `длительность ${tl.duration.toFixed(1)} с (естественная ${tl.natural.toFixed(1)})`);
  }
});

test("к зрителю — на «вы»", () => {
  const bad = /(^|[^а-яё])(ты|тебя|тебе|твой|твоё|твоя|твои|давай|посмотри|представь|подумай|запомни)([^а-яё]|$)/i;
  for (const s of SCENES)
    for (const l of s.lines) {
      const text = l.text.replace(/«[^»]*»/g, ""); // цитаты героев романа не проверяем
      assert.ok(!bad.test(text), `${l.id}: ${l.text}`);
    }
});

test("на экране нет таймеров и обратного отсчёта", () => {
  const q = readFileSync("src/lesson-dracula/components/QuestionOverlay.tsx", "utf8");
  assert.ok(!/Math\.ceil|strokeDashoffset|sec\b/.test(q), "карточка вопроса не должна считать время");
  const tag = readFileSync("src/lesson-dracula/components/RoomTag.tsx", "utf8");
  assert.ok(!/progress|%|секунд/.test(tag));
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
    if (!ln.file) continue; // без озвучки — черновые оценки
    const ws = timeWords(ln);
    assert.ok(ws[0].start >= ln.speechFrom - 0.05 && ws[ws.length - 1].end <= ln.speechTo + 0.05, ln.id);
    assert.ok(ln.chars.length > 0, `нет таймкодов букв: ${ln.id}`);
  }
  const words = list.flatMap((c) => c.rows.flat());
  const hl = words.filter((w) => w.emph).length / words.length;
  assert.ok(hl > 0.03 && hl < 0.16, `выделено ${(hl * 100).toFixed(1)}% слов`);
});

test("карта свидетельств: 50–65 опор, все 23 главы, фрагменты дословно в своих строках", async () => {
  const { ANCHORS } = await import("./anchors.mjs");
  const { lineText, norm } = await import("./source.mjs");
  assert.ok(ANCHORS.length >= 50 && ANCHORS.length <= 65, `опор ${ANCHORS.length}`);
  const chapters = new Set();
  for (const [ref, frag, kind] of ANCHORS) {
    assert.equal(checkRef(ref), null, ref);
    const p = parseRef(ref);
    chapters.add(p.ch);
    assert.ok(norm(lineText(p.part, p.line)).includes(norm(frag)), `${ref}: нет «${frag}»`);
    assert.ok(frag.split(/\s+/).length <= 12, `${ref}: фрагмент длиннее 12 слов`);
    assert.ok(["факт", "мнение", "вывод"].includes(kind), ref);
  }
  assert.equal(chapters.size, 23);
});
