// Документы фильма BM-012 из сценария и тайм-лайна озвучки:
//   books/marcus-aurelius-meditations/SCRIPT.md — полный текст ведущего по сценам с таймкодами,
//     опорой на строки книги (SOURCE_MAP), вопросами и паузами;
//   books/marcus-aurelius-meditations/metadata/chapters.json — главы YouTube по реальному тайм-лайну.
// Запуск: node scripts/lesson-meditations/export-docs.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { LESSON, VOICE } from "../../src/lesson-meditations/script.ts";
import { loadManifest, SCENES, timeline } from "./lib.mjs";

const DIR = "books/marcus-aurelius-meditations";
const tl = timeline();
const voiced = Boolean(loadManifest()?.lines?.length);
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const PART = { intro: "Начало", diary: "Дневник", control: "Что в моей власти", anger: "Гнев и обида", service: "Польза людям", fame: "Слава", obstacle: "Препятствия", time: "Настоящее", end: "Итоги" };

const out = [];
out.push(`# BM-012 — сценарий фильма «${LESSON.title}»`);
out.push("");
out.push(`Книга: ${LESSON.book}. Канал BanaMind, ведущий — банан. Голос: ${VOICE.name}.`);
out.push(
  voiced
    ? `Таймкоды — по реальной озвучке, длительность фильма **${mmss(tl.duration)}** (естественная речь с паузами ${mmss(tl.natural)}).`
    : "Таймкоды черновые (оценка по тексту, озвучки ещё нет).",
);
out.push("Самостоятельный образовательный фильм: не пересказ и не аудиокнига. Опора каждой сцены — строки TXT (`L###`, см. source/SOURCE_MAP.md); «BanaMind» — комментарий канала и вымышленный учебный день банана, без новых фактов. Короткие цитаты — дословно из русского перевода TXT.");
out.push("");
let part = "";
SCENES.forEach((sc, i) => {
  const ts = tl.scenes[i];
  if (sc.part !== part) {
    part = sc.part;
    out.push(`## ${PART[part]}`);
    out.push("");
  }
  out.push(`### ${mmss(ts.from)} — ${sc.title}`);
  out.push(`*Источник:* ${sc.src.join(", ")}${sc.srcNote ? ` — ${sc.srcNote.replace(/\.$/, "")}` : ""}. *Схема:* \`${sc.visual.kind}\`.`);
  out.push("");
  ts.lines.forEach((ln, j) => {
    const l = sc.lines[j];
    out.push(`- \`${mmss(ln.speechFrom)}\` ${l.text}${l.wait ? ` *(пауза ${l.wait} с — карточка вопроса, без таймера)*` : ""}`);
  });
  out.push("");
});
mkdirSync(`${DIR}/metadata`, { recursive: true });
writeFileSync(`${DIR}/SCRIPT.md`, out.join("\n"));

const chapters = SCENES.map((sc, i) => (sc.chapter ? { t: i === 0 ? 0 : Math.floor(tl.scenes[i].from), title: sc.chapter } : null)).filter(Boolean);
writeFileSync(`${DIR}/metadata/chapters.json`, JSON.stringify({ voiced, duration: +tl.duration.toFixed(2), chapters: chapters.map((c) => ({ ...c, at: mmss(c.t) })) }, null, 1));
const words = SCENES.flatMap((s) => s.lines.map((l) => l.text)).join(" ").split(/\s+/).length;
console.log(`✓ ${DIR}/SCRIPT.md (${words} слов, ${SCENES.length} сцен), глав ${chapters.length}, ${mmss(tl.duration)}`);
