// Сценарий, раскадровка и сценовая карта источников фильма BM-028 «Космос» из src/lesson-sagan/script.ts с таймкодами
// текущего тайм-лайна (после озвучки — реальные, до неё — черновые оценки).
//   node scripts/lesson-sagan/export-docs.mjs → books/cosmos-carl-sagan/scripts/SCRIPT.md, STORYBOARD.md, SCENE_SOURCES.md
import { writeFileSync } from "node:fs";
import { SCENES, loadManifest, timeline } from "./lib.mjs";

const DIR = "books/cosmos-carl-sagan/scripts";
const CLAIM = {
  book: "Саган пишет (книга 1980 г.)",
  note: "Примечание переводчика/редактора русского издания 2024 г. (не Саган)",
  fact: "Наблюдение/измерение по книге",
  model: "Модель при допущениях",
  hypo: "Гипотеза / оценка / открытый вопрос — не обнаружение",
  opinion: "Взгляд Сагана",
  update: "После книги — уточнение (SCIENCE_AND_ATTRIBUTION_AUDIT.md)",
  lab: "«Окно доказательств» — наш образ (не сцена книги и не эксперимент)",
  film: "Вывод / вопрос BanaMind",
};
const LAYER = { observe: "наблюдение", explain: "объяснение", test: "проверка", revise: "пересмотр" };
const PART = { intro: "Точка на небе", measure: "Измерить недоступное", models: "Красивая модель и упрямые данные", planets: "Венера и Марс", travel: "Путешественники", light: "Свет и время", stars: "Жизнь звёзд", galaxies: "Галактики", life: "Жизнь и память", search: "Поиск собеседников", earth: "Кто отвечает за Землю", end: "Три вывода" };
const ts = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const m = loadManifest();
const voiced = m?.lines?.length ?? 0;
const total = SCENES.reduce((a, s) => a + s.lines.length, 0);
const tl = timeline();
const status = voiced >= total ? `таймкоды по готовой озвучке (${ts(tl.duration)})` : `черновые таймкоды (озвучено ${voiced} из ${total} реплик), итог — ${ts(tl.duration)}`;
const words = SCENES.flatMap((s) => s.lines.map((l) => l.text)).join(" ").split(/\s+/).length;

const script = [
  "# BM-028 — СЦЕНАРИЙ: «Космос» (Карл Саган) — «Окно доказательств»",
  "",
  `Канал BanaMind · ведущий — банан · русский · ${words} слов, ${total} реплик, ${SCENES.length} сцен · ${status}.`,
  "",
  "Оригинальный объясняющий фильм своими словами — не аудиокнига и не пересказ 13 глав. Ссылки `part-NN:Lx–Ly` — строки TXT пакета `books/500-series/sources/BM-028/` (PDF-страницы — в пояснении). Метка у каждой сцены показывает голос и статус утверждения; она же выводится в кадре, слой окна — вверху слева.",
  "",
  "Сгенерировано `node scripts/lesson-sagan/export-docs.mjs` из `src/lesson-sagan/script.ts` — правьте сценарий там.",
  "",
];
let part = "";
tl.scenes.forEach((ts_, i) => {
  const s = SCENES[i];
  if (s.part !== part) {
    part = s.part;
    script.push(`## ${PART[part]}`, "");
  }
  script.push(`### ${ts(ts_.from)} · ${s.id} · ${s.title}`, "", `*${CLAIM[s.claim]}* · слой окна: ${LAYER[s.layer]} · источник: ${s.src.join(", ")}`, "", `> ${s.srcNote}`, "");
  ts_.lines.forEach((ln, j) => {
    const L = s.lines[j];
    script.push(`- **${ts(ln.speechFrom)}** ${L.wait ? "❓ " : ""}${L.text}${L.wait ? ` *(пауза для размышления ${L.wait} с, карточка вопроса без таймера)*` : ""}`);
  });
  script.push("");
});
writeFileSync(`${DIR}/SCRIPT.md`, script.join("\n"));

const board = [
  "# BM-028 — РАСКАДРОВКА",
  "",
  `${status}. Каждая сцена: место банана, анимированная схема (src/lesson-sagan/visuals), слой окна, метка утверждения. Смысловое движение каждые 10–30 с, смена вопроса — каждые 1,5–3 мин (часть); вопросы для размышления — карточкой внизу, без таймера.`,
  "",
  "| Время | Сцена | Часть | Слой | Банан | Схема (kind) | Метка | Реплик | Длит. |",
  "|---|---|---|---|---|---|---|---:|---:|",
  ...tl.scenes.map((t_, i) => {
    const s = SCENES[i];
    return `| ${ts(t_.from)} | ${s.id} · ${s.title} | ${PART[s.part]} | ${LAYER[s.layer]} | ${s.host} | \`${s.visual.kind}\` | ${CLAIM[s.claim]} | ${s.lines.length} | ${Math.round(t_.to - t_.from)} с |`;
  }),
  "",
];
writeFileSync(`${DIR}/STORYBOARD.md`, board.join("\n"));

const map = [
  "# BM-028 — СЦЕНОВАЯ КАРТА ИСТОЧНИКОВ",
  "",
  "Каждая сцена фильма → строки TXT источника (`part-NN:Lx–Ly`), голос и что именно взято. Полные карты фактов по всем 17 частям — `source-map/*.md`. Сгенерировано `node scripts/lesson-sagan/export-docs.mjs`.",
  "",
  "| Сцена | Метка | Источник | Что взято / чей голос |",
  "|---|---|---|---|",
  ...SCENES.map((s) => `| ${s.id} · ${s.title} | ${CLAIM[s.claim]} | ${s.src.join(", ")} | ${s.srcNote.replace(/\|/g, "/")} |`),
  "",
];
writeFileSync(`${DIR}/SCENE_SOURCES.md`, map.join("\n"));
console.log(`✓ SCRIPT.md, STORYBOARD.md, SCENE_SOURCES.md (${SCENES.length} сцен, ${ts(tl.duration)})`);
