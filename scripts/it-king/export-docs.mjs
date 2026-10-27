// SCRIPT.md и STORYBOARD.md из сценария (src/books/it-king-volume-one/film/script.ts)
// с таймкодами тайм-лайна: по реальной озвучке, если она есть, иначе — оценка.
// Запуск: node scripts/it-king/export-docs.mjs [dir=books/it-king-volume-one/scripts]
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { FILM } from "../../src/books/it-king-volume-one/film/script.ts";
import { STORY } from "./storyboard.mjs";
import { loadManifest, SCENES, timeline } from "./lib.mjs";

const DIR = process.argv[2] ?? "books/it-king-volume-one/scripts";
mkdirSync(DIR, { recursive: true });
const tl = timeline();
const voiced = Boolean(loadManifest()?.lines?.length);
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const note = voiced ? "Таймкоды — по фактической озвучке (manifest.json)." : "Таймкоды — ОЦЕНКА по тексту (озвучки ещё нет); финальные — после TTS.";
const words = SCENES.reduce((a, s) => a + s.lines.reduce((b, l) => b + l.text.split(/\s+/).length, 0), 0);

let script = `# BM-020 — Сценарий: ${FILM.title}\n\n${FILM.book}.\n\n${note} Длительность: **${mmss(tl.duration)}** (естественная ${mmss(tl.natural)}), сцен ${SCENES.length}, реплик ${tl.lines.length}, слов ${words}.\nОпоры \`S…\` — \`SOURCE_MAP.md\`. Источник сценария в коде: \`src/books/it-king-volume-one/film/script.ts\` (тот же текст идёт в озвучку, титры и SRT).\n`;
let block = "";
SCENES.forEach((sc, i) => {
  const ts = tl.scenes[i];
  if (sc.block !== block) {
    block = sc.block;
    script += `\n## ${block}\n`;
  }
  script += `\n### ${mmss(ts.from)} · ${sc.id} — ${sc.title}\n*Опоры: ${sc.src.join(", ")} · визуал: ${sc.visual.kind}${sc.visual.mode ? `/${sc.visual.mode}` : ""}${sc.tag ? ` · подпись: «${sc.tag}»` : ""}*\n\n`;
  for (const l of ts.lines) script += `- **${mmss(l.speechFrom)}** ${l.text}\n`;
});
writeFileSync(join(DIR, "SCRIPT.md"), script);

let sb = `# BM-020 — Раскадровка\n\n${note}\nВсе сцены — собственная точечная графика (детерминированные точки, чёткие контуры в конце сборки). Карта города и сети — **условные схемы для объяснения**, не карта Дерри и не кадры экранизаций. Ведущий — штатный банан \`src/banana-host/\`; титры — \`BanaMindAnimatedCaptions\`.\n\n| Время | Сцена | Банан | Визуал: сборка → действие → трансформация | Опоры |\n|---|---|---|---|---|\n`;
SCENES.forEach((sc, i) => {
  const key = sc.visual.kind + (sc.visual.mode ? `/${sc.visual.mode}` : sc.visual.n ? `/${sc.visual.n}` : "");
  sb += `| ${mmss(tl.scenes[i].from)} | ${sc.id} ${sc.title} | ${sc.host} | ${STORY[key] ?? key} | ${sc.src.join(", ")} |\n`;
});
writeFileSync(join(DIR, "STORYBOARD.md"), sb);
console.log(`✓ ${DIR}/SCRIPT.md, STORYBOARD.md (${mmss(tl.duration)}, ${voiced ? "озвучка" : "оценка"})`);
