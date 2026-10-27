// Сценарий и раскадровка фильма BM-014 «Краткая история времени» из src/lesson-hawking/script.ts с таймкодами
// текущего тайм-лайна (после озвучки — реальные, до неё — черновые оценки).
//   node scripts/lesson-hawking/export-docs.mjs → books/hawking-brief-history-time/SCRIPT.md, STORYBOARD.md
import { writeFileSync } from "node:fs";
import { SCENES, loadManifest, timeline } from "./lib.mjs";

const DIR = "books/hawking-brief-history-time";
const CLAIM = {
  book: "Хокинг пишет (по книге, эпоха издания)",
  fact: "Подтверждено опытами и наблюдениями",
  model: "Модель при допущениях",
  hypo: "Гипотеза / открытый вопрос",
  opinion: "Философия / мнение названного автора",
  update: "После книги — дополнение (SCIENCE_UPDATE_REFERENCES.md)",
  lab: "Учебная лаборатория (образ, не опыт и не сцена книги)",
  film: "Вывод / вопрос BanaMind",
};
const PART = { intro: "Загадка", models: "Модели мира", light: "Свет и время", expand: "Расширяющаяся Вселенная", quantum: "Кванты", holes: "Чёрные дыры", arrows: "Стрелы времени", unity: "Объединение физики", end: "Итоги" };
const ts = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const m = loadManifest();
const voiced = m?.lines?.length ?? 0;
const total = SCENES.reduce((a, s) => a + s.lines.length, 0);
const tl = timeline();
const status = voiced >= total ? `таймкоды по готовой озвучке (${ts(tl.duration)})` : `черновые таймкоды (озвучено ${voiced} из ${total} реплик), итог — ${ts(tl.duration)}`;
const words = SCENES.flatMap((s) => s.lines.map((l) => l.text)).join(" ").split(/\s+/).length;

const script = [
  "# BM-014 — СЦЕНАРИЙ: «Краткая история времени» (Стивен Хокинг)",
  "",
  `Канал BanaMind · ведущий — банан · русский · ${words} слов, ${total} реплик, ${SCENES.length} сцен · ${status}.`,
  "",
  "Оригинальный научно-популярный разбор своими словами — не аудиокнига и не пересказ глав. Ссылки `Lnnn` — строки присланного владельцем TXT (сам текст книги в репозиторий не загружается). Метка у каждой сцены показывает тип утверждения; она же выводится в кадре.",
  "",
  "Сгенерировано `node scripts/lesson-hawking/export-docs.mjs` из `src/lesson-hawking/script.ts` — правьте сценарий там.",
  "",
];
let part = "";
tl.scenes.forEach((ts_, i) => {
  const s = SCENES[i];
  if (s.part !== part) {
    part = s.part;
    script.push(`## ${PART[part]}`, "");
  }
  script.push(`### ${ts(ts_.from)} · ${s.id} · ${s.title}`, "", `*${CLAIM[s.claim]}* · источник: ${s.src.join(", ")}`, "", `> ${s.srcNote}`, "");
  ts_.lines.forEach((ln, j) => {
    const L = s.lines[j];
    script.push(`- **${ts(ln.speechFrom)}** ${L.wait ? "❓ " : ""}${L.text}${L.wait ? ` *(пауза для размышления ${L.wait} с, карточка вопроса без таймера)*` : ""}`);
  });
  script.push("");
});
writeFileSync(`${DIR}/SCRIPT.md`, script.join("\n"));

const board = [
  "# BM-014 — РАСКАДРОВКА",
  "",
  `${status}. Каждая сцена: место банана, анимированная схема (src/lesson-hawking/visuals), метка утверждения. Смена визуального языка — каждые 20–60 с; вопросы для размышления — карточкой внизу, без таймера.`,
  "",
  "| Время | Сцена | Часть | Банан | Схема (kind) | Метка | Реплик | Длит. |",
  "|---|---|---|---|---|---|---:|---:|",
  ...tl.scenes.map((t_, i) => {
    const s = SCENES[i];
    return `| ${ts(t_.from)} | ${s.id} · ${s.title} | ${PART[s.part]} | ${s.host} | \`${s.visual.kind}\` | ${CLAIM[s.claim]} | ${s.lines.length} | ${Math.round(t_.to - t_.from)} с |`;
  }),
  "",
];
writeFileSync(`${DIR}/STORYBOARD.md`, board.join("\n"));
console.log(`✓ SCRIPT.md, STORYBOARD.md (${SCENES.length} сцен, ${ts(tl.duration)})`);
