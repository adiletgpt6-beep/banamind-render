// Огибающая речи для 3D-урока: из аудио (или MP4) считает уровень голоса
// на каждый кадр и записывает src/lesson-01/envelope.ts.
//   node scripts/lesson-01-envelope.mjs [public/audio/lesson-01/soundtrack.m4a]
// Полоса 180–3800 Гц (речь), фон музыки вычитается по 35-му перцентилю.
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { LESSON_VIDEO } from "../src/lesson-01/script.ts";

const input = process.argv[2] ?? `public/${LESSON_VIDEO.soundtrack}`;
const fps = LESSON_VIDEO.fps;
const sr = 30000; // кратно 30 fps → ровно 1000 отсчётов на кадр
const raw = execFileSync(
  "ffmpeg",
  ["-loglevel", "error", "-i", input, "-vn", "-ac", "1", "-ar", String(sr), "-af", "highpass=f=180,lowpass=f=3800", "-f", "f32le", "-"],
  { maxBuffer: 1 << 28 },
);
const samples = new Float32Array(raw.buffer, raw.byteOffset, Math.floor(raw.byteLength / 4));
const per = sr / fps;
const frames = Math.ceil(samples.length / per);
const rms = [];
for (let i = 0; i < frames; i++) {
  const seg = samples.subarray(i * per, (i + 1) * per);
  let sum = 0;
  for (const x of seg) sum += x * x;
  rms.push(Math.sqrt(sum / Math.max(1, seg.length)));
}
const max = Math.max(...rms);
const floor = [...rms].sort((a, b) => a - b)[Math.floor(frames * 0.35)];
const env = rms.map((v) => {
  const x = max > floor ? (v - floor) / (max - floor) : 0;
  return Math.round(Math.max(0, Math.min(1, x * 1.3)) * 1000) / 1000;
});
const rows = [];
for (let i = 0; i < env.length; i += 20) rows.push("  " + env.slice(i, i + 20).join(", "));
writeFileSync(
  "src/lesson-01/envelope.ts",
  `// Огибающая речи оригинальной дорожки (public/audio/lesson-01/soundtrack.m4a):
// уровень голоса 0..1 на каждый кадр (30 fps), полоса 180–3800 Гц, фон музыки
// вычтен. Считается скриптом scripts/lesson-01-envelope.mjs. Используется для
// движения губ и лёгких кивков говорящего.
export const LESSON_ENVELOPE: readonly number[] = [
${rows.join(",\n")},
];
`,
);
console.log(`${input}: ${frames} кадров, записано src/lesson-01/envelope.ts`);
