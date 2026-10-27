// Сценарий и раскадровка BM-036 с таймкодами тайм-лайна (по озвучке, если она есть):
// books/richest-man-in-babylon-clason/scripts/SCRIPT.md и STORYBOARD.md.
// node scripts/books/bm036/export-docs.mjs
import { writeFileSync } from "node:fs";
import { FILM, VOICE } from "../../../src/books/richest-man-in-babylon-clason/film/script.ts";
import { CHAPTERS } from "../../../src/books/richest-man-in-babylon-clason/film/theme.ts";
import { loadManifest, SCENES, timeline } from "./lib.mjs";

const DIR = "books/richest-man-in-babylon-clason/scripts";
const tl = timeline();
const real = !!loadManifest();
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const chName = (id) => CHAPTERS.find((c) => c.id === id)?.label ?? id;
const words = SCENES.flatMap((s) => s.lines.map((l) => l.text)).join(" ").split(/\s+/).length;
const head = `Таймкоды: ${real ? "по фактической озвучке" : "ЧЕРНОВЫЕ (оценка по тексту, до озвучки)"}; длительность ${mmss(tl.duration)}; ${SCENES.length} сцен, ${tl.lines.length} реплик, ${words} слов. Голос: ${VOICE.name}.`;

const script = [`# BM-036 — SCRIPT: ${FILM.title}`, "", FILM.book, "", head, "", "Цитаты книги — в «кавычках» (≤ 16 слов, дословно; проверяет тест). Опоры `pNN:Lx` — part-NN.txt и её локальные строки (карта в исходные строки — SOURCE_MAP.md). «анализ» — комментарий BanaMind. Источник — `src/books/richest-man-in-babylon-clason/film/script.ts`.", ""];
let ch = "";
tl.scenes.forEach((ts, i) => {
  const sc = SCENES[i];
  if (sc.chapter !== ch) {
    ch = sc.chapter;
    script.push(`## ${chName(ch)}`, "");
  }
  script.push(`### ${mmss(ts.from)} · ${sc.id} · ${sc.title}`, `_Опоры: ${sc.src.join(", ")}${sc.srcNote ? ` — ${sc.srcNote}` : ""}_`, "");
  ts.lines.forEach((l, j) => script.push(`- \`${mmss(l.speechFrom)}\` ${l.text}${sc.lines[j].wait ? " _(пауза-вопрос)_" : ""}`));
  script.push("");
});
writeFileSync(`${DIR}/SCRIPT.md`, script.join("\n"));

const sb = [`# BM-036 — STORYBOARD`, "", head, "", "| Время | Сцена | Глава | Схема (visual) | Ведущий | Что в кадре |", "|---|---|---|---|---|---|"];
tl.scenes.forEach((ts, i) => {
  const sc = SCENES[i];
  const { kind, ...rest } = sc.visual;
  const params = Object.entries(rest).filter(([k]) => k !== "enter").map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join("; ").replace(/\|/g, "/");
  const host = `${sc.host}${sc.walk ? ` → ${sc.walk}` : ""}${sc.glasses ? " (очки)" : ""}`;
  sb.push(`| ${mmss(ts.from)}–${mmss(ts.to)} | ${sc.id} | ${chName(sc.chapter)} | \`${kind}\` | ${host} | ${sc.title}${params ? ` — ${params}` : ""} |`);
});
writeFileSync(`${DIR}/STORYBOARD.md`, sb.join("\n") + "\n");
console.log(`✓ SCRIPT.md, STORYBOARD.md (${mmss(tl.duration)}, ${real ? "озвучка" : "черновик"})`);
