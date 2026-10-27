// Сценарий с таймкодами финальной озвучки и таблица «сцена → строки источника».
//   node scripts/bm039/export-docs.mjs → books/plato-republic-egunov/scripts/{SCRIPT.md,SCENES_TO_SOURCE.md}
import { writeFileSync } from "node:fs";
import { CHAPTERS } from "./chapters-data.mjs";
import { SCENES, loadManifest, timeline } from "./lib.mjs";

const tl = timeline();
const m = loadManifest();
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const DIR = "books/plato-republic-egunov/scripts";
const head = [
  "# BM-039 — сценарий фильма «Государство» (Платон, пер. А. Н. Егунова)",
  "",
  `Хронометраж по фактической озвучке: **${mmss(tl.duration)}** (речь и паузы; движок озвучки: \`${m?.engine ?? "оценка"} / ${m?.voice ?? "—"}\`).`,
  "Таймкоды — только в рабочих документах и главах YouTube; в кадре таймеров нет.",
  "Колонка «Источник» — исходные строки TXT (см. SOURCE_MAP.md). Реплики с «Вопрос для размышления» сопровождаются спокойной карточкой-паузой.",
  "",
];
const out = [...head];
let part = null;
tl.scenes.forEach((ts, i) => {
  const sc = SCENES[i];
  if (sc.part !== part) {
    out.push(`## ${CHAPTERS[sc.part]}`, "");
    part = sc.part;
  }
  out.push(`### ${mmss(ts.from)} · ${sc.id} — ${sc.title}`, "", `*Источник:* ${sc.src.join(", ")} — ${sc.srcNote}`, "", `*Кадр:* банан — ${sc.host}; точки: ${sc.visual.dots.map((d) => d.shape.kind).join(" → ")}`, "");
  ts.lines.forEach((ln) => out.push(`- **${mmss(ln.speechFrom)}** ${ln.text}`));
  out.push("");
});
writeFileSync(`${DIR}/SCRIPT.md`, out.join("\n"));
const map = [
  "# BM-039 — сцены фильма → строки источника",
  "",
  "| Время | Сцена | Название | Строки TXT | Что взято / что толкование |",
  "|---|---|---|---|---|",
  ...tl.scenes.map((ts, i) => `| ${mmss(ts.from)} | ${SCENES[i].id} | ${SCENES[i].title} | ${SCENES[i].src.join(", ")} | ${SCENES[i].srcNote} |`),
  "",
];
writeFileSync(`${DIR}/SCENES_TO_SOURCE.md`, map.join("\n"));
console.log(`✓ ${DIR}/SCRIPT.md, SCENES_TO_SOURCE.md (${tl.scenes.length} сцен, ${tl.lines.length} реплик, ${mmss(tl.duration)})`);
