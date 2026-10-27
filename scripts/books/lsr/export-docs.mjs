// Сценарий и раскадровка BM-024 с таймкодами тайм-лайна (по озвучке, если она есть):
// books/lean-startup-eric-ries/scripts/SCRIPT.md и STORYBOARD.md.
// node scripts/books/lsr/export-docs.mjs
import { writeFileSync } from "node:fs";
import { FILM, VOICE } from "../../../src/books/lean-startup-eric-ries/film/script.ts";
import { CHAPTERS } from "../../../src/books/lean-startup-eric-ries/film/theme.ts";
import { loadManifest, SCENES, timeline } from "./lib.mjs";

const DIR = "books/lean-startup-eric-ries/scripts";
const tl = timeline();
const real = !!loadManifest();
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const chName = (id) => CHAPTERS.find((c) => c.id === id)?.label ?? id;
const words = SCENES.flatMap((s) => s.lines.map((l) => l.text)).join(" ").split(/\s+/).length;
const head = `Таймкоды: ${real ? "по фактической озвучке" : "ЧЕРНОВЫЕ (оценка по тексту, до озвучки)"}; длительность ${mmss(tl.duration)}; ${SCENES.length} сцен, ${tl.lines.length} реплик, ${words} слов. Голос: ${VOICE.name}.`;

const script = [`# BM-024 — SCRIPT: ${FILM.title}`, "", FILM.book, "", head, "", "Цитаты книги — в «кавычках» (≤ 16 слов, дословно; проверяет тест). Опоры `Lnnn` — строки исходного TXT L68–L1262 (карта строк → part-NN в SOURCE_MAP.md). «анализ» — комментарий BanaMind. Источник — `src/books/lean-startup-eric-ries/film/script.ts`.", ""];
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

const sb = [`# BM-024 — STORYBOARD`, "", head, "", "| Время | Сцена | Глава | Схема (visual) | Ведущий | Что в кадре |", "|---|---|---|---|---|---|"];
tl.scenes.forEach((ts, i) => {
  const sc = SCENES[i];
  const { kind, ...rest } = sc.visual;
  const params = Object.entries(rest).filter(([k]) => k !== "enter").map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join("; ").replace(/\|/g, "/");
  const host = `${sc.host}${sc.walk ? ` → ${sc.walk}` : ""}${sc.glasses ? " (очки)" : ""}`;
  sb.push(`| ${mmss(ts.from)}–${mmss(ts.to)} | ${sc.id} | ${chName(sc.chapter)} | \`${kind}\` | ${host} | ${sc.title}${params ? ` — ${params}` : ""} |`);
});
writeFileSync(`${DIR}/STORYBOARD.md`, sb.join("\n") + "\n");
console.log(`✓ SCRIPT.md, STORYBOARD.md (${mmss(tl.duration)}, ${real ? "озвучка" : "черновик"})`);

// лист озвучки: голос, настройки, каждая реплика с произношением и фактическим временем
const cue = [
  "# BM-024 — VOICE_CUE_SHEET",
  "",
  head,
  "",
  `Голос: **${VOICE.name}** · voiceId \`${VOICE.voiceId}\` · модель \`${VOICE.modelId}\` · seed ${VOICE.seed}.`,
  `Настройки: ${JSON.stringify(VOICE.settings)}; живее (expr): ${JSON.stringify(VOICE.expressive)}. Темп речи не ускоряется; громкость реплик −18 LUFS, финальный микс −16 LUFS.`,
  "",
  "Колонка «Произношение» — текст для синтеза, если он отличается от титров (ударения, латиница). «Пауза» — вопрос для размышления (спокойная карточка без таймера).",
  "",
  "| Время | Реплика | Текст (титры) | Произношение | Особое |",
  "|---|---|---|---|---|",
];
tl.scenes.forEach((ts, i) => {
  ts.lines.forEach((l, j) => {
    const ln = SCENES[i].lines[j];
    const flags = [ln.expr ? "живее" : "", ln.wait ? `пауза ${ln.wait} с` : "", ln.pause ? `+${ln.pause} с` : ""].filter(Boolean).join(", ");
    cue.push(`| ${mmss(l.speechFrom)} | ${l.id} | ${l.text.replace(/\|/g, "/")} | ${(ln.say ?? "—").replace(/\|/g, "/")} | ${flags || "—"} |`);
  });
});
writeFileSync(`${DIR}/VOICE_CUE_SHEET.md`, cue.join("\n") + "\n");
console.log("✓ VOICE_CUE_SHEET.md");
