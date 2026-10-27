// Сценарий и раскадровка фильма BM-013 из src/lesson-sapiens/script.ts с таймкодами
// текущего тайм-лайна (после озвучки — реальные, до неё — черновые оценки).
//   node scripts/lesson-sapiens/export-docs.mjs → books/harari-sapiens/SCRIPT.md, STORYBOARD.md
import { writeFileSync } from "node:fs";
import { SCENES, loadManifest, timeline } from "./lib.mjs";

const DIR = "books/harari-sapiens";
const CLAIM = {
  book: "Харари пишет (описание по книге)",
  hypo: "Гипотеза / спорная версия в книге",
  opinion: "Позиция автора",
  forecast: "Прогноз автора на время книги",
  model: "Учебная модель фильма (не история)",
  film: "Вывод / вопрос BanaMind",
};
const PART = { intro: "Загадка", cognitive: "Язык (когнитивная революция)", agrarian: "Поле (аграрная революция)", order: "Порядок, письмо, иерархии", unity: "Деньги и объединение", science: "Научная революция", future: "Счастье и будущее", end: "Итоги" };
const ts = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const m = loadManifest();
const voiced = m?.lines?.length ?? 0;
const total = SCENES.reduce((a, s) => a + s.lines.length, 0);
const tl = timeline();
const status = voiced >= total ? `таймкоды по готовой озвучке (${ts(tl.duration)})` : `черновые таймкоды (озвучено ${voiced} из ${total} реплик), итог — ${ts(tl.duration)}`;
const words = SCENES.flatMap((s) => s.lines.map((l) => l.text)).join(" ").split(/\s+/).length;

const script = [
  "# BM-013 — СЦЕНАРИЙ: «Sapiens. Краткая история человечества» (Юваль Ной Харари)",
  "",
  `Канал BanaMind · ведущий — банан · русский · ${words} слов, ${total} реплик, ${SCENES.length} сцен · ${status}.`,
  "",
  "Оригинальный критико-объяснительный разбор своими словами — не аудиокнига и не пересказ страниц. Ссылки `Lnnn` — строки присланного владельцем TXT (сам текст книги в репозиторий не загружается). Метка у каждой сцены показывает тип утверждения; она же выводится в кадре.",
  "",
  "Сгенерировано `node scripts/lesson-sapiens/export-docs.mjs` из `src/lesson-sapiens/script.ts` — правьте сценарий там.",
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
  "# BM-013 — РАСКАДРОВКА",
  "",
  `${status}. Каждая сцена: место банана, анимированная схема (src/lesson-sapiens/visuals), метка утверждения. Смена визуального языка — каждые 20–60 с; вопросы для размышления — карточкой внизу, без таймера.`,
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
