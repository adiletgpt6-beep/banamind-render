// Сценарий и раскадровка BM-030 с таймкодами тайм-лайна (по озвучке, если она есть):
// books/war-and-peace-tolstoy/scripts/SCRIPT.md и STORYBOARD.md.
// node scripts/war-and-peace/export-docs.mjs
import { writeFileSync } from "node:fs";
import { FILM, VOICE } from "../../src/books/war-and-peace-tolstoy/film/script.ts";
import { ACTS, LAYERS } from "../../src/books/war-and-peace-tolstoy/film/theme.ts";
import { loadManifest, SCENES, timeline } from "./lib.mjs";

const DIR = "books/war-and-peace-tolstoy/scripts";
const tl = timeline();
const real = !!loadManifest();
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const actName = (id) => {
  const i = ACTS.findIndex((a) => a.id === id);
  const L = LAYERS.find((l) => l.id === ACTS[i].layer);
  return `${i === 0 ? "Вступление" : `Акт ${i}`} · ${ACTS[i].label} (слой ${L.n} — ${L.label})`;
};
const words = SCENES.flatMap((s) => s.lines.map((l) => l.text)).join(" ").split(/\s+/).length;
const head = `Таймкоды: ${real ? "по фактической озвучке" : "ЧЕРНОВЫЕ (оценка по тексту, до озвучки)"}; длительность ${mmss(tl.duration)}; ${SCENES.length} сцен, ${tl.lines.length} реплик, ${words} слов. Голос: ${VOICE.name}.`;

const script = [`# BM-030 — SCRIPT: ${FILM.title}`, "", FILM.book, "", head, "", "Цитаты книги — в «кавычках» (≤ 12 слов). «Анализ» — авторская интерпретация BanaMind. Источник — `src/books/war-and-peace-tolstoy/film/script.ts`.", ""];
let act = "";
tl.scenes.forEach((ts, i) => {
  const sc = SCENES[i];
  if (sc.act !== act) {
    act = sc.act;
    script.push(`## ${actName(act)}`, "");
  }
  script.push(`### ${mmss(ts.from)} · ${sc.id} · ${sc.title}`, `_Опоры: ${sc.src.join(", ")}${sc.srcNote ? ` — ${sc.srcNote}` : ""}_`, "");
  ts.lines.forEach((l, j) => script.push(`- \`${mmss(l.speechFrom)}\` ${l.text}${sc.lines[j].wait ? " _(пауза-вопрос)_" : ""}`));
  script.push("");
});
writeFileSync(`${DIR}/SCRIPT.md`, script.join("\n"));

const sb = [`# BM-030 — STORYBOARD`, "", head, "", "| Время | Сцена | Акт и слой | Схема (visual) | Ведущий | Что в кадре |", "|---|---|---|---|---|---|"];
tl.scenes.forEach((ts, i) => {
  const sc = SCENES[i];
  const { kind, ...rest } = sc.visual;
  const params = Object.entries(rest).filter(([k]) => k !== "enter").map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join("; ").replace(/\|/g, "/").replace(/\\n/g, " ");
  sb.push(`| ${mmss(ts.from)}–${mmss(ts.to)} | ${sc.id} | ${actName(sc.act)} | \`${kind}\` | ${sc.host} | ${sc.title}${params ? ` — ${params}` : ""} |`);
});
writeFileSync(`${DIR}/STORYBOARD.md`, sb.join("\n") + "\n");
console.log(`✓ SCRIPT.md, STORYBOARD.md (${mmss(tl.duration)}, ${real ? "озвучка" : "черновик"})`);
