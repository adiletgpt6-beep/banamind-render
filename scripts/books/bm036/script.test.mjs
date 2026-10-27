// Проверки сценария BM-036 «Десятая монета»: уникальные реплики, 5–7 вопросов с паузой 4–6 с,
// у каждой сцены опора на строки source pack (pNN:Lx) или «анализ», все 13 частей и все
// 10 повествовательных глав покрыты, цитаты в «кавычках» дословно есть в источнике и короткие,
// обращение к зрителю на «вы», имя автора/название книги не звучат, нет запрещённых тем
// (одобрение ростовщичества, азартных игр, языческих божеств), доли 10/70/20 точны,
// длительность 29:30–30:30, титры по озвучке. BM036_SCOPE=pilot — только сцены пилота.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { SCENES as ALL } from "../../../src/books/richest-man-in-babylon-clason/film/script.ts";
import { loadManifest, PILOT, SCENES, timeline } from "./lib.mjs";

const DIR = "books/500-series/sources/BM-036";
const PARTS = Array.from({ length: 13 }, (_, i) => readFileSync(`${DIR}/part-${String(i + 1).padStart(2, "0")}.txt`, "utf8"));
const lineCount = (s) => s.split("\n").length - (s.endsWith("\n") ? 1 : 0);
const letters = (s) => s.toLowerCase().replace(/ё/g, "е").replace(/[^\p{L}\p{N}]/gu, "");
const BOOK_L = letters(PARTS.join(""));
const lines = ALL.flatMap((s) => s.lines);
const text = lines.map((l) => l.text).join(" ");
const refs = ALL.flatMap((s) => s.src.filter((r) => r !== "анализ").map((r) => ({ s: s.id, r })));
const parse = (r) => {
  const m = /^p(\d\d):L(\d+)(?:–L(\d+))?$/.exec(r);
  return m && { part: Number(m[1]), a: Number(m[2]), b: Number(m[3] ?? m[2]) };
};

test("источник: 13 частей, 1005 строк, таблички I–V на месте", () => {
  assert.equal(PARTS.reduce((a, p) => a + lineCount(p), 0), 1005);
  for (const n of ["ТАБЛИЧКА I", "ТАБЛИЧКА II", "ТАБЛИЧКА III", "ТАБЛИЧКА IV", "ТАБЛИЧКА V"]) assert.ok(PARTS[10].includes(n), n);
});

test("реплики и сцены уникальны и не пустые", () => {
  const ids = lines.map((l) => l.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(new Set(ALL.map((s) => s.id)).size, ALL.length);
  for (const l of lines) assert.ok(l.text.trim().length > 2, l.id);
});

test("5–7 вопросов для размышления с паузой 4–6 с", () => {
  const qs = lines.filter((l) => l.wait);
  assert.ok(qs.length >= 5 && qs.length <= 7, `вопросов ${qs.length}`);
  for (const q of qs) {
    assert.ok(q.wait >= 4 && q.wait <= 6, q.id);
    assert.match(q.text, /^Вопрос для размышления: .+\?$/, q.id);
  }
});

test("каждая сцена опирается на строки source pack или «анализ»", () => {
  for (const s of ALL) assert.ok(s.src.length > 0, s.id);
  for (const { s, r } of refs) {
    const p = parse(r);
    assert.ok(p, `${s}: ${r}`);
    assert.ok(p.part >= 1 && p.part <= 13 && p.a >= 1 && p.a <= p.b && p.b <= lineCount(PARTS[p.part - 1]), `${s}: ${r} вне файла`);
  }
});

test("покрытие: все 13 частей и 10 повествовательных глав", () => {
  const parts = new Set(refs.map(({ r }) => parse(r).part));
  // part-01 (предисловие), part-02 (экскурс) и part-13 (примечания) учтены как опоры сцен
  for (let i = 1; i <= 13; i++) assert.ok(parts.has(i), `нет опоры на part-${String(i).padStart(2, "0")}`);
});

test("цитаты книги в «кавычках»: дословно из источника и короткие (≤ 16 слов)", () => {
  for (const l of lines)
    for (const q of l.text.match(/«[^»]+»/g) ?? []) {
      const words = q.split(/\s+/).length;
      assert.ok(words <= 16, `${l.id}: ${q}`);
      // 1–2 слова — термины и примеры («хочу пять золотых»); от трёх слов — цитаты книги
      if (words >= 3 && !/^«хочу /.test(q)) assert.ok(BOOK_L.includes(letters(q)), `${l.id}: цитаты нет в источнике: ${q}`);
    }
});

test("визуалы существуют", () => {
  const reg = readFileSync("src/books/richest-man-in-babylon-clason/film/visuals/index.ts", "utf8");
  const kinds = new Set([...reg.matchAll(/^\s+(\w+): \w+,$/gm)].map((m) => m[1]));
  for (const s of SCENES) assert.ok(kinds.has(s.visual.kind), `${s.id}: ${s.visual.kind}`);
});

test("в голосе и титрах нет автора и названия книги", () => {
  const low = text.toLowerCase();
  for (const bad of ["клейсон", "clason", "самый богатый человек в вавилоне", "миф", "кастальск"]) assert.ok(!low.includes(bad), bad);
});

test("нет запрещённых тем и обещаний (TASK §3)", () => {
  const low = text.toLowerCase().replace(/ё/g, "е");
  for (const bad of ["ростовщик", "под процент", "проценты по", "ссуд", "кубик", "игорн", "ставк", "богин", "аштар", "ваал", "гарантирован", "без риска", "быстро разбогате", "balago", "бишкек", "whatsapp", "подпиш", "лайк"])
    assert.ok(!low.includes(bad), bad);
  // «проценты» — только как доли дохода в письме из книги (20/10/70), не проценты по займу
  const pct = lines.filter((l) => /процент/i.test(l.text)).map((l) => l.id);
  assert.deepEqual(pct, ["d11a"]);
});

test("обязательные оговорки и точность долей 10/70/20", () => {
  for (const must of ["а не обязательная норма для каждой семьи", "а не закон природы", "а не обязательная пропорция для всех", "труд не даёт гарантий", "не личная финансовая консультация", "Монеты не появляются из воздуха", "человек с долгами не хуже других"])
    assert.ok(text.includes(must), must);
  const d08 = ALL.find((s) => s.id === "d08");
  const n = Object.fromEntries(d08.visual.moves.map((m) => [m.to, m.n]));
  assert.deepEqual(n, { keep: 1, spend: 7, debt: 2 });
  assert.equal(n.keep + n.spend + n.debt, 10);
  const months = ALL.find((s) => s.id === "d09").visual.months;
  assert.deepEqual(months, [19, 11, 42]); // p11:L50, L54, L56
  // «почти четыре» (3,8), «тринадцать с небольшим» (13,3), «больше восьми» (8,4)
  assert.equal((19 * 0.2).toFixed(1), "3.8");
  assert.equal((19 * 0.7).toFixed(1), "13.3");
  assert.equal((42 * 0.2).toFixed(1), "8.4");
  // каждая монета стола учтена: ходы не берут из пустой зоны
  for (const s of ALL.filter((x) => x.visual.kind === "table")) {
    const z = { ...s.visual.start };
    for (const m of s.visual.moves) {
      if (m.from) {
        z[m.from] = (z[m.from] ?? 0) - m.n;
        assert.ok(z[m.from] >= 0, `${s.id}: из ${m.from}`);
      }
      z[m.to] = (z[m.to] ?? 0) + m.n;
    }
    const total = Object.values(z).reduce((a, b) => a + b, 0);
    assert.equal(total, 10, `${s.id}: монет ${total}`);
  }
});

test("объём речи и длительность фильма", () => {
  const words = text.split(/\s+/).length;
  assert.ok(words >= 3000 && words <= 3700, `слов ${words}`);
  const m = loadManifest();
  const ids = new Set(m?.lines.map((l) => l.id) ?? []);
  if (SCENES.every((s) => s.lines.every((l) => ids.has(l.id)))) {
    const tl = timeline();
    const [lo, hi] = PILOT ? [30, 75] : [1770, 1830];
    assert.ok(tl.duration >= lo && tl.duration <= hi, `длительность ${tl.duration.toFixed(1)} с (естественная ${tl.natural.toFixed(1)})`);
  }
});

test("к зрителю — на «вы»; «ты» — только в пересказе реплик героев", () => {
  const bad = /(^|[^а-яё])(ты|тебя|тебе|твой|твоё|твоя|твои|давай|посмотри|представь|подумай|запомни|молодец)([^а-яё]|$)/i;
  const HEROES = new Set(["k09a", "b07a", "t02b", "t03b", "t07a", "d05a", "w07a", "w07b", "d10b", "n06a"]);
  for (const l of lines) {
    if (HEROES.has(l.id)) continue;
    const own = l.text.replace(/«[^»]*»/g, "");
    assert.ok(!bad.test(own), `${l.id}: ${l.text}`);
  }
});

test("на экране нет таймеров и обратного отсчёта", () => {
  const q = readFileSync("src/books/richest-man-in-babylon-clason/film/components/QuestionOverlay.tsx", "utf8");
  assert.ok(!/Math\.ceil|strokeDashoffset|sec\b/.test(q), "карточка вопроса не должна считать время");
  const bar = readFileSync("src/books/richest-man-in-babylon-clason/film/components/ChapterBar.tsx", "utf8");
  assert.ok(!/toFixed|duration|frame/.test(bar), "табличка главы без времени");
});

test("титры BanaMind: ≤ 2 строк, без перекрытий, текст = сценарий, время слов по озвучке", async () => {
  const { cues } = await import("./lib.mjs");
  const { timeWords } = await import("../../../src/banamind/captions/build.ts");
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
    if (ln.file) {
      const ws = timeWords(ln);
      assert.ok(ws[0].start >= ln.speechFrom - 0.05 && ws[ws.length - 1].end <= ln.speechTo + 0.05, ln.id);
      assert.ok(ln.chars.length > 0, `нет таймкодов букв: ${ln.id}`);
    }
  }
  const words = list.flatMap((c) => c.rows.flat());
  const hl = words.filter((w) => w.emph).length / words.length;
  assert.ok(hl > 0.03 && hl < 0.22, `выделено ${(hl * 100).toFixed(1)}% слов`);
});
