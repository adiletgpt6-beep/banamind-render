// Проверки сценария BM-020: уникальные реплики, опоры SOURCE_MAP у каждой сцены,
// визуалы существуют, обращение на «вы», нет запрещённых тем (развязка, кино-факты,
// «ровно 27 лет», способ смерти, оскорбления), граница тома названа в начале и конце,
// длительность по озвучке — 29:30–30:30.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { VISUAL_KINDS } from "../../src/books/it-king-volume-one/film/visuals/list.ts";
import { ALL, IS_PILOT, loadManifest, PILOT, timeline } from "./lib.mjs";

const text = (s) => s.lines.map((l) => l.text).join(" ");
const all = ALL.map(text).join(" ");
const low = all.toLowerCase();

test("реплики и сцены уникальны и не пустые", () => {
  const ids = ALL.flatMap((s) => s.lines.map((l) => l.id));
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(new Set(ALL.map((s) => s.id)).size, ALL.length);
  for (const s of ALL) for (const l of s.lines) assert.ok(l.text.trim().length > 2, l.id);
});

test("у каждой сцены есть опоры из SOURCE_MAP", () => {
  const map = readFileSync("books/it-king-volume-one/scripts/SOURCE_MAP.md", "utf8");
  for (const s of ALL) {
    assert.ok(s.src.length > 0, s.id);
    for (const id of s.src) assert.ok(map.includes(`| ${id} |`), `${s.id}: опоры ${id} нет в SOURCE_MAP`);
  }
});

test("визуалы существуют", () => {
  for (const s of ALL) assert.ok(VISUAL_KINDS.includes(s.visual.kind), `${s.id}: ${s.visual.kind}`);
});

test("пилот — существующие сцены начала фильма", () => {
  for (const id of PILOT) assert.ok(ALL.some((s) => s.id === id), id);
});

test("граница первого тома названа в начале и в финале", () => {
  assert.match(text(ALL[2]), /первый том/);
  assert.match(text(ALL[2]), /Финала романа здесь нет/);
  assert.match(text(ALL.at(-1)), /не заканчивается/);
});

test("нет развязки, кино-фактов и запрещённых формулировок", () => {
  for (const bad of ["пеннивайз", "ритуал", "чудь", "красный шарик", "экранизаци" + "и показывают", "ровно каждые двадцать семь лет —", "вены", "бритв", "трус", "диагноз", "balago", "балаго", "подпишитесь", "лайк"]) assert.ok(!low.includes(bad), bad);
  // «ровно каждые 27 лет» допускается только как отрицание
  assert.ok(/не скажу «ровно каждые двадцать семь лет»/.test(all));
  // смерть Стэнли — одной сдержанной фразой
  assert.ok(all.includes("В тот же вечер он ушёл из жизни."));
});

test("к зрителю — на «вы»", () => {
  const bad = /(^|[^а-яё])(ты|тебя|тебе|твой|твоё|твоя|твои|давай|посмотри|представь|подумай|запомни)([^а-яё]|$)/i;
  for (const s of ALL)
    for (const l of s.lines) {
      // цитаты персонажей книги в «…» не проверяются
      const t = l.text.replace(/«[^»]*»/g, "");
      assert.ok(!bad.test(t), `${l.id}: ${l.text}`);
    }
});

test("объём речи и длительность", () => {
  const words = all.split(/\s+/).length;
  assert.ok(words >= 3300 && words <= 3900, `слов ${words}`);
  const m = loadManifest();
  const voiced = ALL.flatMap((s) => s.lines).every((l) => m?.lines?.some((v) => v.id === l.id));
  if (voiced && !IS_PILOT) {
    const tl = timeline();
    assert.ok(tl.duration >= 1770 && tl.duration <= 1830, `длительность ${tl.duration.toFixed(1)} с (естественная ${tl.natural.toFixed(1)})`);
  }
});

test("на экране нет таймеров и прогресс-баров", () => {
  const film = readFileSync("src/books/it-king-volume-one/film/Film.tsx", "utf8");
  for (const bad of ["Progress", "Countdown", "PartBar", "QuestionOverlay"]) assert.ok(!film.includes(bad), bad);
});
