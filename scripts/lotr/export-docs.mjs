// Сценарий и раскадровка BM-018 с таймкодами тайм-лайна (по озвучке, если она есть):
// books/lord-of-the-rings-tolkien/scripts/SCRIPT.md и STORYBOARD.md.
// node scripts/lotr/export-docs.mjs
import { writeFileSync } from "node:fs";
import { FILM, VOICE } from "../../src/books/lord-of-the-rings-tolkien/film/script.ts";
import { HALLS } from "../../src/books/lord-of-the-rings-tolkien/film/theme.ts";
import { loadManifest, SCENES, timeline } from "./lib.mjs";

const DIR = "books/lord-of-the-rings-tolkien/scripts";
const tl = timeline();
const real = !!loadManifest();
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const hallName = (id) => {
  const i = HALLS.findIndex((h) => h.id === id);
  return i === 0 ? "Вход" : i === HALLS.length - 1 ? "Выход" : `Зал ${i} · ${HALLS[i].label}`;
};
const words = SCENES.flatMap((s) => s.lines.map((l) => l.text)).join(" ").split(/\s+/).length;
const head = `Таймкоды: ${real ? "по фактической озвучке" : "ЧЕРНОВЫЕ (оценка по тексту, до озвучки)"}; длительность ${mmss(tl.duration)}; ${SCENES.length} сцен, ${tl.lines.length} реплик, ${words} слов. Голос: ${VOICE.name}.`;

const script = [`# BM-018 — SCRIPT: ${FILM.title}`, "", FILM.book, "", head, "", "Цитаты книги — в «кавычках» (≤ 12 слов). «Анализ» — авторская интерпретация BanaMind. Источник — `src/books/lord-of-the-rings-tolkien/film/script.ts`.", ""];
let hall = "";
tl.scenes.forEach((ts, i) => {
  const sc = SCENES[i];
  if (sc.hall !== hall) {
    hall = sc.hall;
    script.push(`## ${hallName(hall)}`, "");
  }
  script.push(`### ${mmss(ts.from)} · ${sc.id} · ${sc.title}`, `_Опоры: ${sc.src.join(", ")}${sc.srcNote ? ` — ${sc.srcNote}` : ""}_`, "");
  ts.lines.forEach((l, j) => script.push(`- \`${mmss(l.speechFrom)}\` ${l.text}${sc.lines[j].wait ? " _(пауза-вопрос)_" : ""}`));
  script.push("");
});
writeFileSync(`${DIR}/SCRIPT.md`, script.join("\n"));

const sb = [`# BM-018 — STORYBOARD`, "", head, "", "| Время | Сцена | Зал | Экспонат (visual) | Ведущий | Что в кадре |", "|---|---|---|---|---|---|"];
tl.scenes.forEach((ts, i) => {
  const sc = SCENES[i];
  const { kind, ...rest } = sc.visual;
  const params = Object.entries(rest).filter(([k]) => k !== "enter").map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join("; ").replace(/\|/g, "/").replace(/\\n/g, " ");
  sb.push(`| ${mmss(ts.from)}–${mmss(ts.to)} | ${sc.id} | ${hallName(sc.hall)} | \`${kind}\` | ${sc.host} | ${sc.title}${params ? ` — ${params}` : ""} |`);
});
writeFileSync(`${DIR}/STORYBOARD.md`, sb.join("\n") + "\n");
console.log(`✓ SCRIPT.md, STORYBOARD.md (${mmss(tl.duration)}, ${real ? "озвучка" : "черновик"})`);
