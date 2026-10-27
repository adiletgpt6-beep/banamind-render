// Проверки сценария BM-040: уникальные реплики, 5–7 вопросов с паузой 4–6 с,
// опора каждой сцены на строку источника (part-NN.txt / png) или пометка «метафора»,
// цитаты дословны, охват предисловия, 12 глав и послесловия, нет имени автора и
// названия книги в голосе, нет посторонних тем, обращение на «вы», нет таймеров,
// титры BanaMind по озвучке, длительность с озвучкой — 29:30–30:30.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { loadManifest, SCENES, timeline } from "./lib.mjs";
import { checkQuotes } from "./quotes.mjs";
import { VISUALS_LIST } from "../../src/books/spqr-history-ancient-rome-beard/film/visuals/list.ts";
import { checkRef, original, parseRef } from "./sources.mjs";

const FILM = "src/books/spqr-history-ancient-rome-beard/film";
const allText = () => SCENES.flatMap((s) => s.lines.map((l) => l.text)).join(" ");

test("реплики уникальны и не пустые", () => {
  const ids = SCENES.flatMap((s) => s.lines.map((l) => l.id));
  assert.equal(new Set(ids).size, ids.length);
  for (const s of SCENES) for (const l of s.lines) assert.ok(l.text.trim().length > 2, l.id);
});

test("холодный старт — собственный текст задания", () => {
  const start = SCENES[0].lines.map((l) => l.text).join(" ");
  assert.ok(start.startsWith("В одном городе человек произносит речь"), start);
  assert.ok(start.includes("кто имеет право быть своим?"));
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
    if (!s.src.every((r) => r === "метафора")) assert.ok(s.book, `${s.id}: нет пометки «что говорит источник»`);
    else assert.ok(s.analysis, `${s.id}: образ фильма без пояснения`);
  }
});

test("опоры охватывают предисловие, все 12 глав и послесловие", () => {
  // начала разделов в строках оригинала (TASK.md, таблица «Состав книги»)
  const heads = [[10, "предисловие"], [38, "гл.1"], [127, "гл.2"], [226, "гл.3"], [332, "гл.4"], [427, "гл.5"], [524, "гл.6"], [632, "гл.7"], [741, "гл.8"], [845, "гл.9"], [971, "гл.10"], [1144, "гл.11"], [1255, "гл.12"], [1399, "послесловие"], [1423, "источники"]];
  const lines = SCENES.flatMap((s) => s.src.filter((r) => parseRef(r)).map(original));
  for (let i = 0; i < heads.length - 1; i++) {
    const [a, name] = heads[i];
    const b = heads[i + 1][0];
    assert.ok(lines.some((x) => x >= a && x < b), `нет опоры на ${name}`);
  }
  assert.ok(new Set(SCENES.flatMap((s) => s.src)).size >= 120, "опор меньше 120");
});

test("цитаты в «ёлочках» дословно есть в книге", () => {
  const { n, bad } = checkQuotes();
  assert.ok(n >= 15, `цитат ${n}`);
  assert.deepEqual(bad, []);
});

test("визуалы существуют", () => {
  for (const s of SCENES) assert.ok(VISUALS_LIST.includes(s.visual.kind), `${s.id}: ${s.visual.kind}`);
});

test("в голосе и кадре нет имени автора и названия книги, рекламы, посторонних тем", () => {
  const visuals = JSON.stringify(SCENES.map((s) => s.visual)).toLowerCase();
  const text = allText().toLowerCase();
  for (const bad of ["бирд", "beard", "spqr. история", "история древнего рима", "balago", "балаго", "бишкек", "подпиш", "лайк", "аллах", "пророк", "почему рим пал", "падение западной"])
    for (const [where, t] of [["речь", text], ["кадр", visuals]]) assert.ok(!t.includes(bad), `${where}: ${bad}`);
});

test("212 год — только свободные, без обещаний демократии и освобождения рабов", () => {
  const t = allText();
  assert.match(t, /все свободные жители империи/);
  assert.match(t, /Рабов этот указ не освобождал/);
});

test("Октавиан — приёмный сын по завещанию, не биологический", () => {
  assert.match(allText(), /усыновление, а не родство по крови/);
});

test("объём речи и длительность фильма", () => {
  const words = allText().split(/\s+/).length;
  assert.ok(words >= 2700 && words <= 3900, `слов ${words}`);
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
      const text = l.text.replace(/«[^»]*»/g, ""); // цитаты источника не проверяем
      assert.ok(!bad.test(text), `${l.id}: ${l.text}`);
    }
});

test("на экране нет таймеров и обратного отсчёта", () => {
  const q = readFileSync(`${FILM}/components/QuestionOverlay.tsx`, "utf8");
  assert.ok(!/Math\.ceil|strokeDashoffset|sec\b/.test(q), "карточка вопроса не должна считать время");
  const tag = readFileSync(`${FILM}/components/RoomTag.tsx`, "utf8");
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
    if (ln.words.map((w) => w.text).join(" ") !== ln.text.split(/\s+/).filter(Boolean).join(" ")) continue;
    const ws = timeWords(ln);
    assert.ok(ws[0].start >= ln.speechFrom - 0.05 && ws[ws.length - 1].end <= ln.speechTo + 0.05, ln.id);
    assert.ok(ln.chars.length > 0, `нет таймкодов букв: ${ln.id}`);
  }
  const words = list.flatMap((c) => c.rows.flat());
  const hl = words.filter((w) => w.emph).length / words.length;
  assert.ok(hl > 0.03 && hl < 0.16, `выделено ${(hl * 100).toFixed(1)}% слов`);
});
