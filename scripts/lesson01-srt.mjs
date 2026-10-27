// Русские субтитры урока 1 (SRT) по фактической озвучке: каждая реплика —
// от начала до конца речи (+0,4 с, без наложения на следующую). Паузы для
// ответа зрителя пустые: ответы заранее не показываются.
// Запуск: node scripts/lesson01-srt.mjs [путь.srt]
import { readFileSync, writeFileSync } from "node:fs";
import { L1_LINES, L1_ROLE_NAMES } from "../src/lesson01/script.ts";
import { buildTimeline } from "../src/lesson01/timeline.ts";

const out = process.argv[2] ?? "docs/lesson01/lesson-01-who-built-the-house.ru.srt";
const manifest = JSON.parse(readFileSync("public/audio/lesson01/manifest.json", "utf8"));
if (!manifest.complete) throw new Error("Озвучка неполная — субтитры строятся только по фактической речи.");
const T = buildTimeline(manifest, 30);
const segs = Object.entries(T.seg).sort((a, b) => a[1].start - b[1].start);
const ts = (sec) => {
  const ms = Math.max(0, Math.round(sec * 1000));
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const r = ms % 1000;
  const p = (n, k = 2) => String(n).padStart(k, "0");
  return `${p(h)}:${p(m)}:${p(s)},${p(r, 3)}`;
};
const cues = segs.map(([segId, s], i) => {
  const line = L1_LINES.find((l) => l.id === s.line);
  const text = line.parts ? line.parts["ab".indexOf(segId.slice(3))].text : line.text;
  const next = segs[i + 1]?.[1];
  const end = Math.min(s.end + 0.4, next ? next.start - 0.05 : s.end + 0.4);
  return `${i + 1}\n${ts(s.start - 0.05)} --> ${ts(end)}\n${L1_ROLE_NAMES[line.role]}: ${text}\n`;
});
writeFileSync(out, cues.join("\n"));
console.log(`SRT: ${out} (${cues.length} субтитров)`);
