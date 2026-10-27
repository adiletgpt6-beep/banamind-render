// Проверки сценария BM-030 «Война и мир»: уникальные реплики, вопросы для размышления
// с паузой без таймеров, у каждой сцены есть опора на строки TXT пакета источника
// (строки существуют) или пометка «схема»/«фильм»/«история», визуалы существуют,
// дословные цитаты в «ёлочках» действительно есть в источнике, голоса разделены
// (мысль героя / Толстой / перевод примечаний), не путаем Андрея и Николая,
// без богословских выводов, обращение на «вы», числа словами, длительность 29:30–30:30.
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

const SRC = "books/500-series/sources/BM-030";
const partLines = (n) => readFileSync(`${SRC}/part-${n}.txt`, "utf8").split("\n").length;

test("каждая сцена опирается на строки TXT или помечена как схема/вывод/история", () => {
  for (const s of SCENES) {
    assert.ok(s.src.length > 0, s.id);
    for (const r of s.src) assert.match(r, /^(part-\d\d:L\d+(–L\d+)?|схема|фильм|история)$/, `${s.id}: ${r}`);
    if (s.claim === "map") assert.ok(s.src.includes("схема"), `${s.id}: схема без пометки`);
    if (s.claim === "film") assert.ok(s.src.includes("фильм"), `${s.id}: вывод без пометки`);
    if (s.claim === "history") assert.ok(s.src.includes("история"), `${s.id}: исторический факт без пометки`);
    if (s.src.includes("история")) assert.match(s.srcNote, /HISTORICAL_FRAME/, `${s.id}: факт без ссылки на HISTORICAL_FRAME`);
    for (const r of s.src) {
      const m = /^part-(\d\d):L(\d+)(?:–L(\d+))?$/.exec(r);
      if (!m) continue;
      const max = partLines(m[1]);
      assert.ok(Number(m[2]) >= 1 && Number(m[3] ?? m[2]) <= max && Number(m[3] ?? m[2]) >= Number(m[2]), `${s.id}: строки вне файла ${r}`);
    }
    assert.ok(s.srcNote && s.srcNote.length > 20, `${s.id}: нет пояснения к источнику`);
    assert.ok(["person", "war", "history"].includes(s.layer), `${s.id}: слой карты`);
  }
});

test("визуалы существуют", () => {
  // kind «fooBar» — компонент «export const FooBar» в src/lesson-tolstoy/visuals/*.tsx (см. visuals/index.ts)
  const dir = "src/lesson-tolstoy/visuals";
  const src = readdirSync(dir).filter((f) => f.endsWith(".tsx")).map((f) => readFileSync(`${dir}/${f}`, "utf8")).join("\n");
  for (const s of SCENES) {
    const name = s.visual.kind.charAt(0).toUpperCase() + s.visual.kind.slice(1);
    assert.ok(new RegExp(`export const ${name}\\b`).test(src), `${s.id}: ${s.visual.kind}`);
  }
});

// весь текст романа одной строкой: склейки слов и неразрывные пробелы нормализуются
const NORM = (x) => x.toLowerCase().replace(/ё/g, "е").replace(/[^\p{L}\p{N}]+/gu, "");
const BOOK = NORM(Array.from({ length: 63 }, (_, i) => readFileSync(`${SRC}/part-${String(i + 1).padStart(2, "0")}.txt`, "utf8")).join(" "));

test("дословные цитаты в «ёлочках» есть в тексте романа или его примечаниях", () => {
  // наши обозначения в кавычках (название карты, книги) не цитаты
  const OURS = new Set(["масштабвыбора", "войнаимир", "тулоне", "тулон", "семью", "семья", "нашбарин", "пустоцветом", "дифференциалисториистраница"]);
  let n = 0;
  for (const l of allLines) {
    for (const m of l.text.matchAll(/«([^»]+)»/g)) {
      const q = NORM(m[1]);
      if (OURS.has(q) || q.length < 6) continue;
      n++;
      assert.ok(BOOK.includes(q), `${l.id}: цитаты нет в источнике — «${m[1]}»`);
    }
  }
  assert.ok(n >= 30, `цитат ${n}`);
});

test("голоса разделены: мысль героя, Толстой, перевод, вывод фильма", () => {
  for (const s of SCENES.filter((x) => x.claim === "note")) {
    assert.match(s.lines.map((l) => l.text).join(" "), /перевод/i, `${s.id}: не сказано, что это перевод из примечаний`);
  }
  // эпилог II и рассуждения — голос автора, а не персонажей
  for (const id of ["b01", "b03", "m02", "m04", "g01", "g03", "h01", "h02", "h03", "h04", "h05"]) assert.equal(SCENES.find((s) => s.id === id).claim, "essay", id);
  // Наполеон/Кутузов: трактовка Толстого отделена от фактов
  assert.equal(SCENES.find((s) => s.id === "g05").claim, "history");
  assert.match(SCENES.find((s) => s.id === "g05").lines.map((l) => l.text).join(" "), /трактовка Толстого/);
  // выводы фильма названы своими
  assert.match(SCENES.find((s) => s.id === "z01").lines[0].text, /наши/);
});

test("фактология: не путать Андрея и Николая, ключевые события по роману", () => {
  const sc = (id) => SCENES.find((s) => s.id === id).lines.map((l) => l.text).join(" ");
  assert.match(sc("a04"), /Андрей/); // небо Аустерлица — Андрей
  assert.doesNotMatch(sc("a04"), /Николай/);
  assert.match(sc("b07"), /Николай/); // Островна — Николай
  assert.match(sc("f04"), /Николай/); // Богучарово — Николай и Марья
  assert.match(sc("b05"), /Анатол/); // в палатке — Анатоль, не Долохов
  assert.match(sc("c07"), /Денисова и Долохова/);
  assert.match(sc("e01"), /восемьсот тринадцатом/); // свадьба Наташи и Пьера — 1813
  assert.match(sc("e01"), /восемьсот четырнадцатого/); // Николай и Марья — осень 1814
  assert.match(sc("i02"), /спойлеры/);
  const all = text.toLowerCase();
  for (const bad of ["ясное небо", "ясного неба", "андрей проиграл", "николай под аустерлицем увидел небо", "пьер убил долохова", "наполеон приказал сжечь москву", "кутузов сжёг москву"]) assert.ok(!all.includes(bad), bad);
});

test("без богословских выводов и мистики; масонство — литературный факт", () => {
  const low = text.toLowerCase();
  for (const bad of ["бога нет", "бог существует", "доказал, что бог", "аллах", "пророк", "магия", "оккульт", "масоны правят", "масоны управляют"]) assert.ok(!low.includes(bad), bad);
  assert.ok(!/(^|[^а-яё])бог(а|у|ом|е)?([^а-яё]|$)/i.test(text), "темы веры фильм не трактует");
  assert.match(SCENES.find((s) => s.id === "p03").lines.map((l) => l.text).join(" "), /в романе это попытка найти нравственную опору, а не готовый ответ/i);
});

test("объём речи и длительность фильма", () => {
  const words = text.split(/\s+/).length;
  assert.ok(words >= 3100 && words <= 3700, `слов ${words}`);
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
  const q = readFileSync("src/lesson-tolstoy/components/QuestionOverlay.tsx", "utf8");
  const bg = readFileSync("src/lesson-tolstoy/components/Background.tsx", "utf8");
  assert.ok(!/Math\.sin\(t/.test(bg), "звёзды фона не мерцают");
  assert.ok(!/Math\.ceil|strokeDashoffset|sec\b/.test(q), "карточка вопроса не должна считать время");
  const mix = readFileSync("scripts/lesson-tolstoy/mixdown.mjs", "utf8");
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
