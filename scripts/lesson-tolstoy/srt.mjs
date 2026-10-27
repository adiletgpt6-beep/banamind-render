// Субтитры урока в SRT (тот же расчёт, что и в кадре).
// Запуск: node scripts/lesson-tolstoy/srt.mjs [out/tolstoy.srt]
import { writeFileSync } from "node:fs";
import { cueText } from "../../src/lesson-tolstoy/captions.ts";
import { cues, timeline } from "./lib.mjs";

const OUT = process.argv[2] ?? "out/tolstoy.srt";
const ts = (s) => {
  const ms = Math.round(s * 1000);
  const p = (n, w = 2) => String(n).padStart(w, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};
const tl = timeline();
const list = cues(tl);
writeFileSync(OUT, list.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${cueText(c).join("\n")}\n`).join("\n"));
console.log(`✓ ${OUT}: ${list.length} титров, урок ${(tl.duration / 60).toFixed(2)} мин`);
