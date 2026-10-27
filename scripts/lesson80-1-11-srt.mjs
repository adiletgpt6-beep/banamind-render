// Субтитры SRT и WebVTT фильма 80-1-11 — из тех же событий, что и встроенные
// субтитры (subtitleEvents.ts): тексты, разбивка на части и тайминги
// совпадают кадр в кадр. Субтитр начинается с первым звуком реплики,
// вопрос зрителю держится до конца паузы; без имён, номеров и пометок.
// Запуск: npm run srt:lesson-80-1-11 [-- путь.srt] → out/<FILM.output>.srt и
// рядом .vtt (тот же текст и тайминги).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { FILM } from "../src/lesson80/film-1-11/script.ts";
import { buildTimeline } from "../src/lesson80/film-1-11/timeline.ts";
import { subtitleEvents } from "../src/lesson80/film-1-11/subtitleEvents.ts";

const out = process.argv[2] ?? `out/${FILM.output}.srt`;
const manifest = JSON.parse(readFileSync(`public/${FILM.voiceDir}/manifest.json`, "utf8"));
const tl = buildTimeline(manifest);
const events = subtitleEvents(tl);
const ts = (s) => {
  const ms = Math.max(0, Math.round(s * 1000));
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")},${String(ms % 1000).padStart(3, "0")}`;
};
const entries = events.map((e, i) => `${i + 1}\n${ts(e.from)} --> ${ts(e.to)}\n${e.text}\n`);
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, entries.join("\n") + "\n");
const vtt = out.replace(/\.srt$/i, "") + ".vtt";
const cues = events.map((e) => `${ts(e.from).replace(",", ".")} --> ${ts(e.to).replace(",", ".")}\n${e.text}\n`);
writeFileSync(vtt, `WEBVTT\n\n${cues.join("\n")}\n`);
console.log(`${out} и ${vtt}: ${entries.length} субтитров по ${new Set(events.map((e) => e.id)).size} репликам`);
