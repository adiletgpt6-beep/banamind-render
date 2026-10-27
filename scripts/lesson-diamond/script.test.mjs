// Проверки сценария BM-027: уникальные реплики, 5–7 вопросов с паузой 4–6 с,
// опора каждой сцены на строку источника (part-NN.txt) или пометка «метафора»,
// цитаты дословны, охват пролога, всех 19 глав, эпилога и послесловия 2003 года,
// нет посторонних тем и устаревших этнонимов в речи ведущего, обращение на «вы»,
// нет таймеров, титры BanaMind по озвучке, длительность с озвучкой — 29:30–30:30.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { loadManifest, SCENES, timeline } from "./lib.mjs";
import { checkQuotes } from "./quotes.mjs";
import { VISUALS_LIST } from "../../src/lesson-diamond/visuals/list.ts";
import { checkRef, original, parseRef } from "./sources.mjs";

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
    assert.match(q.text, /\?/, q.id);
  }
});

test("каждая сцена опирается на строку источника (или помечена как метафора)", () => {
  for (const s of SCENES) {
    assert.ok(s.src.length > 0, s.id);
    for (const r of s.src) {
      if (r === "метафора") continue;
      assert.equal(checkRef(r), null, `${s.id}: ${checkRef(r)}`);
    }
    if (!s.src.every((r) => r === "метафора")) assert.ok(s.book, `${s.id}: нет пометки «что пишет Даймонд»`);
  }
});

test("опоры охватывают пролог, все 19 глав, эпилог и послесловие 2003 года", () => {
  // начала разделов в строках оригинала (manifest.json → headings)
  const heads = [[12, "пролог"], [90, "гл.1"], [147, "гл.2"], [199, "гл.3"], [251, "гл.4"], [273, "гл.5"], [306, "гл.6"], [340, "гл.7"], [404, "гл.8"], [498, "гл.9"], [569, "гл.10"], [617, "гл.11"], [694, "гл.12"], [770, "гл.13"], [860, "гл.14"], [957, "гл.15"], [1047, "гл.16"], [1083, "гл.17"], [1141, "гл.18"], [1205, "гл.19"], [1291, "эпилог"], [1355, "послесловие"], [1407, "конец"]];
  const lines = SCENES.flatMap((s) => s.src.filter((r) => parseRef(r)).map(original));
  for (let i = 0; i < heads.length - 1; i++) {
    const [a, name] = heads[i];
    const b = heads[i + 1][0];
    assert.ok(lines.some((x) => x >= a && x < b), `нет опоры на ${name}`);
  }
  assert.ok(new Set(SCENES.flatMap((s) => s.src)).size >= 80, "опор меньше 80");
});

test("цитаты в «ёлочках» дословно есть в письмах", () => {
  const { n, bad } = checkQuotes();
  assert.ok(n >= 30, `цитат ${n}`);
  assert.deepEqual(bad, []);
});

test("визуалы существуют", () => {
  for (const s of SCENES) assert.ok(VISUALS_LIST.includes(s.visual.kind), `${s.id}: ${s.visual.kind}`);
});

test("нет посторонних тем, рекламы, устаревших этнонимов в речи ведущего", () => {
  const text = SCENES.flatMap((s) => s.lines.map((l) => l.text)).join(" ").toLowerCase();
  for (const bad of ["balago", "балаго", "подпиш", "лайк", "бишкек", "негр", "пигме", "бушмен", "готтентот", "эскимос", "дикар", "монголоид", "примитивн", "низшая раса", "аллах", "пророк"]) assert.ok(!text.includes(bad), bad);
});

test("объём речи и длительность фильма", () => {
  const words = SCENES.flatMap((s) => s.lines.map((l) => l.text)).join(" ").split(/\s+/).length;
  assert.ok(words >= 2700 && words <= 4000, `слов ${words}`);
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
      const text = l.text.replace(/«[^»]*»/g, ""); // цитаты книги не проверяем
      assert.ok(!bad.test(text), `${l.id}: ${l.text}`);
    }
});

test("на экране нет таймеров и обратного отсчёта", () => {
  const q = readFileSync("src/lesson-diamond/components/QuestionOverlay.tsx", "utf8");
  assert.ok(!/Math\.ceil|strokeDashoffset|sec\b/.test(q), "карточка вопроса не должна считать время");
  const tag = readFileSync("src/lesson-diamond/components/RoomTag.tsx", "utf8");
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
    // реплика изменена после озвучки — её перезапишет voice.mjs; проверяем после синтеза
    if (ln.words.map((w) => w.text).join(" ") !== ln.text.split(/\s+/).filter(Boolean).join(" ")) continue;
    const ws = timeWords(ln);
    assert.ok(ws[0].start >= ln.speechFrom - 0.05 && ws[ws.length - 1].end <= ln.speechTo + 0.05, ln.id);
    assert.ok(ln.chars.length > 0, `нет таймкодов букв: ${ln.id}`);
  }
  const words = list.flatMap((c) => c.rows.flat());
  const hl = words.filter((w) => w.emph).length / words.length;
  assert.ok(hl > 0.03 && hl < 0.16, `выделено ${(hl * 100).toFixed(1)}% слов`);
});
