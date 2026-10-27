// Субтитры ролика 80-1-4 (SRT; русские, с --lang=ky — кыргызские) по фактической озвучке: каждая
// реплика — от начала до конца речи (+0,6 с, без наложения на следующую).
// Во время пауз для ответа зрителя следующий ответ заранее не показывается.
// Длинные реплики делятся на две строки по смыслу (≈ по середине, на границе
// фразы). Запуск: node scripts/lesson80-1-4-srt.mjs [путь.srt] [--lang=ky]
import { readFileSync, writeFileSync } from "node:fs";
import { buildTimeline } from "../src/lesson80-1-4/timeline.ts";
import { LANG, PACK, positional, VOICE_DIR } from "./lib/a4-lang.mjs";

const A4_LINES = PACK.lines;
const out = positional()[0] ?? PACK.srt;
const manifest = JSON.parse(readFileSync(`${VOICE_DIR}/manifest.json`, "utf8"));
if (!manifest.complete) throw new Error("Озвучка неполная — субтитры строятся только по фактической речи.");
const T = buildTimeline(manifest, PACK.video.fps, LANG);
const segs = Object.values(T.seg).sort((a, b) => a.start - b.start);
const ts = (sec) => {
  const ms = Math.max(0, Math.round(sec * 1000));
  const p = (n, k = 2) => String(n).padStart(k, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor((ms % 3600000) / 60000))}:${p(Math.floor((ms % 60000) / 1000))},${p(ms % 1000, 3)}`;
};
// перенос: ищем границу после знака препинания ближе к середине, иначе — пробел
export const wrap = (text, max = 46) => {
  if (text.length <= max) return text;
  const mid = text.length / 2;
  let best = -1;
  let bestScore = Infinity;
  for (let i = 1; i < text.length - 1; i++) {
    if (text[i] !== " ") continue;
    const punct = /[.,:;!?—]/.test(text[i - 1]) ? 0 : 1;
    const score = Math.abs(i - mid) + punct * 12;
    if (score < bestScore) {
      bestScore = score;
      best = i;
    }
  }
  return best > 0 ? `${text.slice(0, best)}\n${text.slice(best + 1)}` : text;
};
const cues = segs.map((s, i) => {
  const line = A4_LINES.find((l) => l.id === s.line);
  const next = segs[i + 1];
  const end = Math.min(s.end + 0.6, next ? next.start - 0.05 : s.end + 0.6);
  return `${i + 1}\n${ts(s.start - 0.05)} --> ${ts(end)}\n${wrap(line.text)}\n`;
});
writeFileSync(out, cues.join("\n"));
console.log(`SRT: ${out} (${cues.length} субтитров)`);
