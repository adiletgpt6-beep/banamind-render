// Проверки сценария BM-003: уникальные реплики, вопросы для размышления, у каждой сцены
// есть страницы книги, визуалы существуют, нет посторонних тем, обращение на «вы»,
// длительность с озвучкой — 29:30–30:30, в кадре нет таймеров.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { loadManifest, SCENES, timeline } from "./lib.mjs";
import { VISUALS_LIST } from "../../../src/books/islamskoe-verouchenie-akyda/visuals/list.ts";

const S = "src/books/islamskoe-verouchenie-akyda";

test("реплики уникальны и не пустые", () => {
  const ids = SCENES.flatMap((s) => s.lines.map((l) => l.id));
  assert.equal(new Set(ids).size, ids.length);
  for (const s of SCENES) for (const l of s.lines) assert.ok(l.text.trim().length > 2, l.id);
});

test("3–6 вопросов для размышления с паузой 4–6 с", () => {
  const qs = SCENES.flatMap((s) => s.lines.filter((l) => l.wait));
  assert.ok(qs.length >= 3 && qs.length <= 6, `вопросов ${qs.length}`);
  for (const q of qs) {
    assert.ok(q.wait >= 4 && q.wait <= 6, q.id);
    assert.match(q.text, /^Вопрос для размышления: .*\?$/, q.id);
  }
});

test("каждая сцена опирается на страницы книги", () => {
  for (const s of SCENES) {
    assert.ok(s.src.length > 0, s.id);
    for (const r of s.src) assert.match(r, /^PDF \d+(–\d+)?$/, `${s.id}: ${r}`);
    if (s.visual.kind !== "chapter") assert.ok((s.srcNote ?? "").length > 10, `${s.id}: нет пояснения к источнику`);
  }
});

test("визуалы существуют и среди них нет изображений людей", () => {
  for (const s of SCENES) assert.ok(VISUALS_LIST.includes(s.visual.kind), `${s.id}: ${s.visual.kind}`);
  for (const k of VISUALS_LIST) assert.ok(!/person|people|human|prophet|face|portrait|silhouette|angel|jinn|allah|god/i.test(k), k);
});

test("нет посторонних тем (BalaGo, призывы подписаться)", () => {
  const text = SCENES.flatMap((s) => s.lines.map((l) => l.text)).join(" ").toLowerCase();
  for (const bad of ["balago", "балаго", "бишкек", "вотсап", "whatsapp", "подпиш", "лайк", "колокольчик"]) assert.ok(!text.includes(bad), bad);
});

test("к зрителю — на «вы», без детских оборотов (цитаты не проверяются)", () => {
  const bad = /(^|[^а-яё])(ты|тебя|тебе|твой|твоё|твоя|твои|давай|посмотри|представь|запомни|молодец|пока-пока)([^а-яё]|$)/i;
  for (const s of SCENES)
    for (const l of s.lines) {
      const text = l.text.replace(/«[^»]*»/g, "").replace(/«[^«»]*«[^»]*»[^»]*»/g, "");
      assert.ok(!bad.test(text), `${l.id}: ${l.text}`);
    }
});

test("объём речи и длительность фильма", () => {
  const words = SCENES.flatMap((s) => s.lines.map((l) => l.text)).join(" ").split(/\s+/).length;
  assert.ok(words >= 2900 && words <= 3900, `слов ${words}`);
  const m = loadManifest();
  if (m?.lines?.length === SCENES.flatMap((s) => s.lines).length) {
    const tl = timeline();
    assert.ok(tl.duration >= 1770 && tl.duration <= 1830, `длительность ${tl.duration.toFixed(1)} с (естественная ${tl.natural.toFixed(1)})`);
  }
});

test("на экране нет таймеров и обратного отсчёта", () => {
  for (const f of ["components/QuestionOverlay.tsx", "components/ChapterBar.tsx", "Film.tsx"]) {
    const src = readFileSync(`${S}/${f}`, "utf8");
    assert.ok(!/countdown|timer|секунд|осталось/i.test(src), f);
  }
});

test("цитаты в кавычках дословно есть в книге", async () => {
  const { execFileSync } = await import("node:child_process");
  execFileSync("node", ["scripts/books/akyda/quotes.mjs"], { stdio: "pipe" });
});

test("нет арабской вязи в репликах и подписях", () => {
  for (const s of SCENES) for (const l of s.lines) assert.ok(!/[\u0600-\u06FF]/.test(l.text + (l.say ?? "")), l.id);
});
