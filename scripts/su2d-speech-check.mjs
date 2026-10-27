// Проверка готового MP4: каждая реплика из manifest действительно звучит в
// экспортированном звуке. Для интервала каждой реплики считается громкость
// (RMS) готовой дорожки; она должна быть заметно выше тишины и выше фона
// в соседних паузах без речи. Конец реплики не обрезан: последние 0,15 с
// речи тоже слышны. Запуск: node scripts/su2d-speech-check.mjs out/x.mp4
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { SU2_VIDEO } from "../src/two-sundays-2d/script.ts";
import { buildSu2Timeline } from "../src/two-sundays-2d/timing.ts";

const file = process.argv[2];
const SR = 16000;
const pcm = execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", file, "-vn", "-ac", "1", "-ar", String(SR), "-f", "f32le", "-"], { maxBuffer: 1 << 30 });
const x = new Float32Array(pcm.buffer, pcm.byteOffset, pcm.byteLength / 4);
const db = (a, b) => {
  const i0 = Math.max(0, Math.round(a * SR));
  const i1 = Math.min(x.length, Math.round(b * SR));
  let s = 0;
  for (let i = i0; i < i1; i++) s += x[i] * x[i];
  return 10 * Math.log10(s / Math.max(1, i1 - i0) + 1e-12);
};
const manifest = JSON.parse(readFileSync(`public/${SU2_VIDEO.voiceDir}/manifest.json`, "utf8"));
const cues = buildSu2Timeline(manifest).cues;
const problems = [];
console.log("реплика  начало–конец, с   речь, дБ  конец, дБ  фон рядом, дБ");
for (const c of cues) {
  const speech = db(c.from, c.to);
  const tail = db(c.to - 0.15, c.to);
  // фон: ближайшие 0,6 с без речи перед репликой (или после)
  const prev = cues.filter((o) => o.to <= c.from - 0.3).at(-1);
  const gapA = Math.max(prev ? prev.to + 0.15 : 0, c.from - 0.9);
  const bg = c.from - gapA >= 0.3 ? db(gapA, c.from - 0.1) : -60;
  console.log(`${c.id.padEnd(7)} ${c.from.toFixed(2).padStart(7)}–${c.to.toFixed(2).padEnd(7)} ${speech.toFixed(1).padStart(8)} ${tail.toFixed(1).padStart(9)} ${bg.toFixed(1).padStart(12)}`);
  if (speech < -34) problems.push(`${c.id}: речь не слышна (${speech.toFixed(1)} дБ)`);
  if (speech < bg + 4) problems.push(`${c.id}: речь не громче фона (${speech.toFixed(1)} / ${bg.toFixed(1)} дБ)`);
  if (tail < -45) problems.push(`${c.id}: конец реплики не слышен (${tail.toFixed(1)} дБ)`);
}
if (problems.length) {
  for (const p of problems) console.error(`::error::${file}: ${p}`);
  process.exit(1);
}
console.log(`${file}: все ${cues.length} реплик слышны в готовом звуке`);
