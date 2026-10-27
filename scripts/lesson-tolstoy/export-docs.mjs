// Сценарий, раскадровка и сценовая карта источников фильма BM-030 «Война и мир» из src/lesson-tolstoy/script.ts с таймкодами
// текущего тайм-лайна (после озвучки — реальные, до неё — черновые оценки).
//   node scripts/lesson-tolstoy/export-docs.mjs → books/war-and-peace-tolstoy/scripts/SCRIPT.md, STORYBOARD.md, SCENE_SOURCES.md
import { writeFileSync } from "node:fs";
import { SCENES, loadManifest, timeline } from "./lib.mjs";

const DIR = "books/war-and-peace-tolstoy/scripts";
const CLAIM = {
  story: "Событие романа (фабула, повествователь)",
  hero: "Мысль/слова героя — не обязательно позиция Толстого",
  essay: "Толстой рассуждает (авторское отступление / эпилог II)",
  history: "Исторический факт (HISTORICAL_FRAME.md)",
  note: "Перевод французской речи по примечаниям издания",
  map: "Схема BanaMind — художественная реконструкция, не карта боя",
  film: "Вывод / вопрос BanaMind",
};
const LAYER = { person: "личный выбор", war: "переживание войны", history: "историческая перспектива" };
const PART = { intro: "Масштаб выбора", society: "Свет 1805 года: слава и деньги", andrei: "Князь Андрей и небо Аустерлица", pierre: "Пьер: наследство без смысла", natasha: "Наташа: выбор и готовность", family: "Семьи, долги и долг", borodino: "Бородино: план и поле", moscow: "Москва: цена решения", captivity: "Пьер в плену", generals: "Кутузов и Наполеон", recovery: "Потери и возвращение к жизни", epilogue: "Эпилог: кто движет историей", end: "Три вывода" };
const ts = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const m = loadManifest();
const voiced = m?.lines?.length ?? 0;
const total = SCENES.reduce((a, s) => a + s.lines.length, 0);
const tl = timeline();
const status = voiced >= total ? `таймкоды по готовой озвучке (${ts(tl.duration)})` : `черновые таймкоды (озвучено ${voiced} из ${total} реплик), итог — ${ts(tl.duration)}`;
const words = SCENES.flatMap((s) => s.lines.map((l) => l.text)).join(" ").split(/\s+/).length;

const script = [
  "# BM-030 — СЦЕНАРИЙ: «Война и мир» (Л. Н. Толстой) — «Масштаб выбора»",
  "",
  `Канал BanaMind · ведущий — банан · русский · ${words} слов, ${total} реплик, ${SCENES.length} сцен · ${status}.`,
  "",
  "Оригинальный аналитический фильм своими словами — не аудиокнига и не пересказ 361 главы. Ссылки `part-NN:Lx–Ly` — строки TXT пакета `books/500-series/sources/BM-030/`. Метка у каждой сцены показывает голос и статус утверждения; она же выводится в кадре, слой карты — вверху слева.",
  "",
  "Сгенерировано `node scripts/lesson-tolstoy/export-docs.mjs` из `src/lesson-tolstoy/script.ts` — правьте сценарий там.",
  "",
];
let part = "";
tl.scenes.forEach((ts_, i) => {
  const s = SCENES[i];
  if (s.part !== part) {
    part = s.part;
    script.push(`## ${PART[part]}`, "");
  }
  script.push(`### ${ts(ts_.from)} · ${s.id} · ${s.title}`, "", `*${CLAIM[s.claim]}* · слой карты: ${LAYER[s.layer]} · источник: ${s.src.join(", ")}`, "", `> ${s.srcNote}`, "");
  ts_.lines.forEach((ln, j) => {
    const L = s.lines[j];
    script.push(`- **${ts(ln.speechFrom)}** ${L.wait ? "❓ " : ""}${L.text}${L.wait ? ` *(пауза для размышления ${L.wait} с, карточка вопроса без таймера)*` : ""}`);
  });
  script.push("");
});
writeFileSync(`${DIR}/SCRIPT.md`, script.join("\n"));

const board = [
  "# BM-030 — РАСКАДРОВКА",
  "",
  `${status}. Каждая сцена: место банана, анимированная схема (src/lesson-tolstoy/visuals), слой карты, метка утверждения. Смысловое движение каждые 10–30 с, смена вопроса — каждые 1,5–3 мин (часть); вопросы для размышления — карточкой внизу, без таймера.`,
  "",
  "| Время | Сцена | Часть | Слой карты | Банан | Схема (kind) | Метка | Реплик | Длит. |",
  "|---|---|---|---|---|---|---|---:|---:|",
  ...tl.scenes.map((t_, i) => {
    const s = SCENES[i];
    return `| ${ts(t_.from)} | ${s.id} · ${s.title} | ${PART[s.part]} | ${LAYER[s.layer]} | ${s.host} | \`${s.visual.kind}\` | ${CLAIM[s.claim]} | ${s.lines.length} | ${Math.round(t_.to - t_.from)} с |`;
  }),
  "",
];
writeFileSync(`${DIR}/STORYBOARD.md`, board.join("\n"));

const map = [
  "# BM-030 — СЦЕНОВАЯ КАРТА ИСТОЧНИКОВ",
  "",
  "Каждая сцена фильма → строки TXT источника (`part-NN:Lx–Ly`), голос и что именно взято. Полные карты по всем 63 частям — `source-map/part-NN.md`, дайджесты чтения — `reading/`. Сгенерировано `node scripts/lesson-tolstoy/export-docs.mjs`.",
  "",
  "| Сцена | Метка | Источник | Что взято / чей голос |",
  "|---|---|---|---|",
  ...SCENES.map((s) => `| ${s.id} · ${s.title} | ${CLAIM[s.claim]} | ${s.src.join(", ")} | ${s.srcNote.replace(/\|/g, "/")} |`),
  "",
];
writeFileSync(`${DIR}/SCENE_SOURCES.md`, map.join("\n"));
console.log(`✓ SCRIPT.md, STORYBOARD.md, SCENE_SOURCES.md (${SCENES.length} сцен, ${ts(tl.duration)})`);
