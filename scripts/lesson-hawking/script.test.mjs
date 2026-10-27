// Проверки сценария BM-014 «Краткая история времени»: уникальные реплики, вопросы
// для размышления с паузой без таймеров, у каждой сцены есть опора на строки TXT или
// пометка «лаборатория»/«фильм»/«дополнение», визуалы существуют, религиозные
// ограничения и разделение голосов (TASK BM-014 п. 7), данные эпохи книги помечены,
// обращение на «вы», объём речи и длительность 29:30–30:30.
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

test("каждая сцена опирается на строки TXT или помечена как лаборатория/вывод/дополнение", () => {
  for (const s of SCENES) {
    assert.ok(s.src.length > 0, s.id);
    for (const r of s.src) assert.match(r, /^(L\d+(–L\d+)?|лаборатория|фильм|дополнение)$/, `${s.id}: ${r}`);
    if (s.claim === "lab") assert.ok(s.src.includes("лаборатория"), `${s.id}: учебная сцена без пометки`);
    if (s.claim === "update") assert.ok(s.src.includes("дополнение"), `${s.id}: дополнение без пометки`);
    if (s.src.includes("дополнение")) assert.match(s.srcNote, /SCIENCE_UPDATE_REFERENCES/, `${s.id}: дополнение без ссылки на источники`);
    for (const r of s.src) {
      const m = /^L(\d+)/.exec(r);
      if (m) assert.ok(Number(m[1]) >= 1 && Number(m[1]) <= 1100, `${s.id}: строка вне TXT ${r}`);
    }
    assert.ok(s.srcNote && s.srcNote.length > 20, `${s.id}: нет пояснения к источнику`);
  }
});

test("визуалы существуют", () => {
  // kind «fooBar» — компонент «export const FooBar» в src/lesson-hawking/visuals/*.tsx (см. visuals/index.ts)
  const dir = "src/lesson-hawking/visuals";
  const src = readdirSync(dir).filter((f) => f.endsWith(".tsx")).map((f) => readFileSync(`${dir}/${f}`, "utf8")).join("\n");
  for (const s of SCENES) {
    const name = s.visual.kind.charAt(0).toUpperCase() + s.visual.kind.slice(1);
    assert.ok(new RegExp(`export const ${name}\\b`).test(src), `${s.id}: ${s.visual.kind}`);
  }
});

test("религия: голоса разделены, фильм не утверждает и не опровергает бытие Творца", () => {
  const low = text.toLowerCase();
  for (const bad of ["бога нет", "бог не существует", "бога не существует", "творца нет", "доказала, что", "доказано, что бог", "опровергла бога", "аллах", "пророк", "ангел", "коран", "библи", "религия — ", "религии — "]) {
    assert.ok(!low.includes(bad), `запрещённая формулировка: ${bad}`);
  }
  // каждая реплика о Боге/Творце — с атрибуцией или как вывод фильма о границе науки
  for (const l of allLines.filter((x) => /бог|творц|создател/i.test(x.text))) {
    assert.match(l.text, /Хокинг|Саган|Смородинск|автор|вопрос|вер[еыу]|философ/i, `${l.id}: нет атрибуции`);
  }
  // Саган и Смородинский — только с указанием, что это другие авторы
  for (const l of allLines.filter((x) => /Саган|Смородинск/.test(x.text))) assert.match(l.text, /друг|отдельн|не слова Хокинга|не будем приписывать/i, l.id);
  const u05 = SCENES.find((s) => s.id === "u05").lines.map((l) => l.text).join(" ");
  assert.match(u05, /ни в одну, ни в другую сторону/);
});

test("данные эпохи книги и дополнения помечены", () => {
  for (const id of ["e07", "b08"]) assert.equal(SCENES.find((s) => s.id === id).claim, "update", id);
  assert.match(SCENES.find((s) => s.id === "e07").lines[0].text, /В книге/);
  assert.match(SCENES.find((s) => s.id === "b08").lines[0].text, /в книге быть не могло/);
  for (const id of ["q08", "b11", "u01", "u02", "u03", "a06"]) assert.equal(SCENES.find((s) => s.id === id).claim, "hypo", id);
  assert.match(SCENES.find((s) => s.id === "b10").lines.map((l) => l.text).join(" "), /прямо не наблюдали/);
  assert.match(SCENES.find((s) => s.id === "b10").lines.map((l) => l.text).join(" "), /упрощённая картинка/);
});

test("объём речи и длительность фильма", () => {
  const words = text.split(/\s+/).length;
  assert.ok(words >= 3300 && words <= 4300, `слов ${words}`);
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
  const q = readFileSync("src/lesson-hawking/components/QuestionOverlay.tsx", "utf8");
  assert.ok(!/Math\.ceil|strokeDashoffset|sec\b/.test(q), "карточка вопроса не должна считать время");
  const mix = readFileSync("scripts/lesson-hawking/mixdown.mjs", "utf8");
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
