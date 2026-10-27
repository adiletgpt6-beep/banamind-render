// Проверки сценария BM-028 «Космос»: уникальные реплики, вопросы для размышления
// с паузой без таймеров, у каждой сцены есть опора на строки TXT пакета источника
// (строки существуют) или пометка «окно»/«фильм»/«дополнение», визуалы существуют,
// голос примечаний издания отделён от Сагана, гипотезы не выдаются за открытия,
// религиозные ограничения, обращение на «вы», числа словами, длительность 29:30–30:30.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { loadManifest, SCENES, timeline } from "./lib.mjs";

const allLines = SCENES.flatMap((s) => s.lines);
const text = allLines.map((l) => l.text).join(" ");

test("реплики уникальны и не пустые", () => {
  const ids = allLines.map((l) => l.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const l of allLines) assert.ok(l.text.trim().length > 2, l.id);
});

test("4–7 вопросов для размышления с паузой 4–6 с", () => {
  const qs = allLines.filter((l) => l.wait);
  assert.ok(qs.length >= 4 && qs.length <= 7, `вопросов ${qs.length}`);
  for (const q of qs) {
    assert.ok(q.wait >= 4 && q.wait <= 6, q.id);
    assert.match(q.text, /^Вопрос для размышления: .*\?$/, q.id);
  }
});

const SRC = "books/500-series/sources/BM-028";
const partLines = (n) => readFileSync(`${SRC}/part-${n}.txt`, "utf8").split("\n").length;

test("каждая сцена опирается на строки TXT или помечена как окно/вывод/дополнение", () => {
  for (const s of SCENES) {
    assert.ok(s.src.length > 0, s.id);
    for (const r of s.src) assert.match(r, /^(part-\d\d:L\d+(–L\d+)?|окно|фильм|дополнение)$/, `${s.id}: ${r}`);
    if (s.claim === "lab") assert.ok(s.src.includes("окно"), `${s.id}: образ окна без пометки`);
    if (s.claim === "update") assert.ok(s.src.includes("дополнение"), `${s.id}: дополнение без пометки`);
    if (s.src.includes("дополнение")) assert.match(s.srcNote, /SCIENCE_AND_ATTRIBUTION_AUDIT/, `${s.id}: дополнение без ссылки на аудит`);
    for (const r of s.src) {
      const m = /^part-(\d\d):L(\d+)(?:–L(\d+))?$/.exec(r);
      if (!m) continue;
      const max = partLines(m[1]);
      assert.ok(Number(m[2]) >= 1 && Number(m[3] ?? m[2]) <= max && Number(m[3] ?? m[2]) >= Number(m[2]), `${s.id}: строки вне файла ${r}`);
    }
    assert.ok(s.srcNote && s.srcNote.length > 20, `${s.id}: нет пояснения к источнику`);
    assert.ok(["observe", "explain", "test", "revise"].includes(s.layer), `${s.id}: слой окна`);
  }
});

test("визуалы существуют", () => {
  // kind «fooBar» — компонент «export const FooBar» в src/lesson-sagan/visuals/*.tsx (см. visuals/index.ts)
  const dir = "src/lesson-sagan/visuals";
  const src = readdirSync(dir).filter((f) => f.endsWith(".tsx")).map((f) => readFileSync(`${dir}/${f}`, "utf8")).join("\n");
  for (const s of SCENES) {
    const name = s.visual.kind.charAt(0).toUpperCase() + s.visual.kind.slice(1);
    assert.ok(new RegExp(`export const ${name}\\b`).test(src), `${s.id}: ${s.visual.kind}`);
  }
});

test("религия: фильм не делает богословских выводов и не изображает пророков", () => {
  const low = text.toLowerCase();
  for (const bad of ["бога нет", "бог не существует", "бога не существует", "творца нет", "доказала, что бог", "опровергла бога", "аллах", "пророк", "ангел", "коран", "библия", "библию", "религия — "]) {
    assert.ok(!low.includes(bad), `запрещённая формулировка: ${bad}`);
  }
  assert.ok(!/бог|творц|создател/i.test(text), "темы веры в фильме не обсуждаются");
});

test("голоса: примечания издания отделены, гипотезы не выдаются за открытия", () => {
  // сцены с меткой «примечание» называют переводчика/издание в тексте
  for (const s of SCENES.filter((x) => x.claim === "note")) {
    assert.match(s.lines.map((l) => l.text).join(" "), /переводчик|примечани/i, `${s.id}: голос примечания не назван`);
  }
  const low = text.toLowerCase();
  for (const bad of ["нашли жизнь на марсе", "обнаружили жизнь", "пришельцы существуют", "каналы на марсе существуют", "машина времени существует", "доказано, что мы не одни"]) {
    assert.ok(!low.includes(bad), bad);
  }
  assert.match(SCENES.find((s) => s.id === "p07").lines.map((l) => l.text).join(" "), /неопровержимых свидетельств жизни на Марсе нет/);
  assert.equal(SCENES.find((s) => s.id === "c03").claim, "hypo");
  assert.match(SCENES.find((s) => s.id === "c03").lines.map((l) => l.text).join(" "), /оценки, а не найденные соседи/);
  assert.match(SCENES.find((s) => s.id === "l04").lines.map((l) => l.text).join(" "), /Машины времени нет/);
  assert.match(SCENES.find((s) => s.id === "i03").lines[0].text, /восьмидесятом/);
});

test("объём речи и длительность фильма", () => {
  const words = text.split(/\s+/).length;
  assert.ok(words >= 3300 && words <= 3800, `слов ${words}`);
  const m = loadManifest();
  if (m?.lines?.length === allLines.length) {
    const tl = timeline();
    assert.ok(tl.duration >= 1770 && tl.duration <= 1830, `длительность ${tl.duration.toFixed(1)} с (естественная ${tl.natural.toFixed(1)})`);
  }
});

test("к зрителю — на «вы», без детских оборотов", () => {
  const bad = /(^|[^а-яё])(ты|тебя|тебе|твой|твоё|твоя|твои|давай|посмотри|представь|подумай|запомни|молодец|пока-пока|помнишь)([^а-яё]|$)/i;
  for (const l of allLines) assert.ok(!bad.test(l.text.replace(/«[^»]*»/g, "")), `${l.id}: ${l.text}`);
});

test("в титрах и озвучке числа словами (титры = озвучка буква в букву)", () => {
  for (const l of allLines) if (!l.say) assert.ok(!/\d/.test(l.text), `${l.id}: цифры в тексте`);
});

test("на экране нет таймеров и обратного отсчёта", () => {
  const q = readFileSync("src/lesson-sagan/components/QuestionOverlay.tsx", "utf8");
  const bg = readFileSync("src/lesson-sagan/components/Background.tsx", "utf8");
  assert.ok(!/Math\.sin\(t/.test(bg), "звёзды фона не мерцают");
  assert.ok(!/Math\.ceil|strokeDashoffset|sec\b/.test(q), "карточка вопроса не должна считать время");
  const mix = readFileSync("scripts/lesson-sagan/mixdown.mjs", "utf8");
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
    const ws = timeWords(ln);
    assert.ok(ws[0].start >= ln.speechFrom - 0.05 && ws[ws.length - 1].end <= ln.speechTo + 0.05, ln.id);
  }
  const m = loadManifest();
  if (m?.lines?.length === allLines.length) for (const ln of tl.lines) assert.ok(ln.chars.length > 0, `нет таймкодов букв: ${ln.id}`);
  const words = list.flatMap((c) => c.rows.flat());
  const hl = words.filter((w) => w.emph).length / words.length;
  assert.ok(hl > 0.03 && hl < 0.16, `выделено ${(hl * 100).toFixed(1)}% слов`);
});
