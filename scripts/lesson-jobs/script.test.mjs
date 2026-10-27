// Проверки сценария BM-015 «Стив Джобс»: уникальные реплики, вопросы для размышления
// с паузой без таймеров, у каждой сцены есть опора на строки TXT или пометка
// «модель»/«фильм», визуалы существуют, ограничения TASK §4 (чужие изобретения,
// спорные версии, здоровье, наркотики, религия, финансы), обращение на «вы», объём речи
// и длительность 29:30–30:30.
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

test("каждая сцена опирается на строки TXT или помечена как модель/вывод фильма", () => {
  for (const s of SCENES) {
    assert.ok(s.src.length > 0, s.id);
    for (const r of s.src) assert.match(r, /^(L\d+(–L\d+)?|модель|фильм)$/, `${s.id}: ${r}`);
    if (s.claim === "model") assert.ok(s.src.includes("модель"), `${s.id}: учебная модель без пометки`);
    assert.ok(s.srcNote && s.srcNote.length > 20, `${s.id}: нет пояснения к источнику`);
  }
});

test("визуалы существуют", () => {
  // kind «fooBar» — компонент «export const FooBar» в src/lesson-jobs/visuals/*.tsx (см. visuals/index.ts)
  const dir = "src/lesson-jobs/visuals";
  const src = readdirSync(dir).filter((f) => f.endsWith(".tsx")).map((f) => readFileSync(`${dir}/${f}`, "utf8")).join("\n");
  for (const s of SCENES) {
    const name = s.visual.kind.charAt(0).toUpperCase() + s.visual.kind.slice(1);
    assert.ok(new RegExp(`export const ${name}\\b`).test(src), `${s.id}: ${s.visual.kind}`);
  }
});

test("религия и наркотики: ни изображений, ни проповеди, ни пропаганды", () => {
  const low = text.toLowerCase();
  for (const bad of ["аллах", "пророк", "коран", "библи", "ислам", "лсд", "кислот", "марихуан", "наркот"]) assert.ok(!low.includes(bad), bad);
});

test("здоровье: эпизод болезни — история, а не совет, без приговора о причине", () => {
  const c01 = SCENES.find((s) => s.id === "c01").lines.map((l) => l.text).join(" ");
  assert.match(c01, /не медицинский совет/);
  assert.match(c01, /никто не узнает/);
  for (const bad of ["убила", "убило", "лечитесь", "откажитесь от операции", "голодайте"]) assert.ok(!text.toLowerCase().includes(bad), bad);
});

test("спорные эпизоды показаны как версии", () => {
  for (const id of ["r08", "x03", "s04", "p02"]) assert.equal(SCENES.find((s) => s.id === id).claim, "dispute", id);
  const r08 = SCENES.find((s) => s.id === "r08").lines.map((l) => l.text).join(" ");
  assert.match(r08, /Возняк/);
  assert.match(r08, /Джобс говорил/);
  assert.match(r08, /не выносим приговор/);
});

test("заслуги команды названы, Джобс не единственный изобретатель", () => {
  for (const name of ["Возняк", "Аткинсон", "Каре", "Лассетер", "Кэтмалл", "Айв", "Фаделл", "Рубинштейн", "Шиллер", "Джонсон", "Кук", "Раскин", "Xerox"]) assert.ok(text.includes(name), name);
  const low = text.toLowerCase();
  for (const bad of ["изобрёл мышь", "изобрел мышь", "изобрёл интерфейс", "в одиночку создал", "изобрёл телефон"]) assert.ok(!low.includes(bad), bad);
});

test("финансы и реклама: нет советов и призывов", () => {
  const low = text.toLowerCase();
  for (const bad of ["инвестируйте", "купите акции", "разбогатеете", "подпиш", "лайк", "balago", "балаго"]) assert.ok(!low.includes(bad), bad);
});

test("объём речи и длительность фильма", () => {
  const words = text.split(/\s+/).length;
  assert.ok(words >= 3200 && words <= 4200, `слов ${words}`);
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
  const q = readFileSync("src/lesson-jobs/components/QuestionOverlay.tsx", "utf8");
  assert.ok(!/Math\.ceil|strokeDashoffset|sec\b/.test(q), "карточка вопроса не должна считать время");
  const mix = readFileSync("scripts/lesson-jobs/mixdown.mjs", "utf8");
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
