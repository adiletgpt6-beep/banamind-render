// Проверки сценария BM-013 «Sapiens»: уникальные реплики, вопросы для размышления
// с паузой без таймеров, у каждой сцены есть опора на строки TXT или пометка
// «модель»/«фильм», визуалы существуют, религиозные и финансовые ограничения
// (TASK §3), обращение на «вы», объём речи и длительность 29:30–30:30.
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
  // kind «fooBar» — компонент «export const FooBar» в src/lesson-sapiens/visuals/*.tsx (см. visuals/index.ts)
  const dir = "src/lesson-sapiens/visuals";
  const src = readdirSync(dir).filter((f) => f.endsWith(".tsx")).map((f) => readFileSync(`${dir}/${f}`, "utf8")).join("\n");
  for (const s of SCENES) {
    const name = s.visual.kind.charAt(0).toUpperCase() + s.visual.kind.slice(1);
    assert.ok(new RegExp(`export const ${name}\\b`).test(src), `${s.id}: ${s.visual.kind}`);
  }
});

test("религия: позиция автора атрибутирована, фильм не утверждает отсутствие Бога", () => {
  const low = text.toLowerCase();
  for (const bad of ["бога нет", "бога не существует", "религии — ложь", "религия — ложь", "религии — выдумка", "ислам — выдумка", "аллах", "пророк", "адам", "ева ", "ноев", "библи", "коран"]) {
    assert.ok(!low.includes(bad), `запрещённая формулировка/изображение: ${bad}`);
  }
  // каждая реплика о религии — с атрибуцией автору или дистанцией фильма
  for (const l of allLines.filter((x) => /религи/i.test(x.text))) {
    assert.match(l.text, /Харари|автор|фильм|мы не|позици|мировоззрени/i, `${l.id}: нет атрибуции`);
  }
});

test("финансы: нет советов и рекламы процентов, кредита, инвестиций", () => {
  const low = text.toLowerCase();
  for (const bad of ["процент годовых", "инвестируйте", "берите кредит", "вложите", "купите акции", "ставк", "подпиш", "лайк", "balago", "балаго"]) assert.ok(!low.includes(bad), bad);
  for (const l of allLines.filter((x) => /кредит|банк/i.test(x.text))) assert.match(l.text, /не будем|не совет|описывает/i, `${l.id}: кредит без оговорки`);
});

test("прогнозы и данные эпохи книги помечены", () => {
  const f03 = SCENES.find((s) => s.id === "f03");
  assert.equal(f03.claim, "forecast");
  assert.match(SCENES.find((s) => s.id === "s09").lines.map((l) => l.text).join(" "), /две тысячи двенадцатом/);
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
  const q = readFileSync("src/lesson-sapiens/components/QuestionOverlay.tsx", "utf8");
  assert.ok(!/Math\.ceil|strokeDashoffset|sec\b/.test(q), "карточка вопроса не должна считать время");
  const mix = readFileSync("scripts/lesson-sapiens/mixdown.mjs", "utf8");
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
