// Звуковая дорожка урока: каждая реплика ставится на своё место тайм-лайна
// (то же время, что и в кадре). Без музыки и без сигналов-отсчётов.
// Выход — WAV 48 кГц моно.
// Запуск: node scripts/lesson-money/mixdown.mjs out/lesson-audio.wav
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { timeline, VOICE_DIR } from "./lib.mjs";

const OUT = process.argv[2] ?? "out/lesson-audio.wav";
const SR = 48000;
const tl = timeline();
const missing = tl.lines.filter((l) => !l.file);
if (missing.length && !process.argv.includes("--allow-missing")) throw new Error(`Нет озвучки для ${missing.length} реплик (${missing[0].id}…)`);
const total = Math.ceil(tl.duration * SR);
const mix = new Float32Array(total);

const decode = (f) => {
  const buf = execFileSync("ffmpeg", ["-v", "error", "-i", f, "-ac", "1", "-ar", String(SR), "-f", "f32le", "-"], { maxBuffer: 1 << 30 });
  return new Float32Array(buf.buffer, buf.byteOffset, buf.length / 4);
};
for (const ln of tl.lines) {
  if (!ln.file) continue;
  const s = decode(join(VOICE_DIR, ln.file));
  const at = Math.round(ln.from * SR);
  for (let i = 0; i < s.length && at + i < total; i++) mix[at + i] += s[i];
}
let peak = 0;
for (const v of mix) peak = Math.max(peak, Math.abs(v));
const pcm = Buffer.alloc(total * 2);
for (let i = 0; i < total; i++) pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, mix[i])) * 32767), i * 2);
const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + pcm.length, 4);
header.write("WAVEfmt ", 8);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(1, 22);
header.writeUInt32LE(SR, 24);
header.writeUInt32LE(SR * 2, 28);
header.writeUInt16LE(2, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(pcm.length, 40);
writeFileSync(OUT, Buffer.concat([header, pcm]));
console.log(`✓ ${OUT}: ${(tl.duration / 60).toFixed(2)} мин, реплик ${tl.lines.length}, пик ${peak.toFixed(2)}`);
