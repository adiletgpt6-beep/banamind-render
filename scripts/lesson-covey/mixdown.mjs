// Звуковая дорожка фильма BM-022: каждая реплика ставится на своё место
// тайм-лайна (то же время, что и в кадре) + тихий оригинальный фон, созданный
// для фильма: мягкий светлый «дневной» аккорд каждой части (синусы, плавные
// переходы) и редкие тихие «колокольчики»-арпеджио. Без чужой музыки, без
// сигналов-отсчётов; речь всегда громче фона.
// Выход — WAV 48 кГц моно. --pilot=SEC — только первые SEC секунд.
// Запуск: node scripts/lesson-covey/mixdown.mjs out/lesson-audio.wav
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { SCENES, timeline, VOICE_DIR } from "./lib.mjs";

const OUT = process.argv[2] ?? "out/lesson-audio.wav";
const SR = 48000;
const tl = timeline();
const pilot = Number(process.argv.find((a) => a.startsWith("--pilot="))?.split("=")[1] ?? 0);
const missing = tl.lines.filter((l) => !l.file && (!pilot || l.from < pilot));
if (missing.length && !process.argv.includes("--allow-missing")) throw new Error(`Нет озвучки для ${missing.length} реплик (${missing[0].id}…)`);
const total = Math.ceil((pilot || tl.duration) * SR);
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
// фон: аккорд части (Гц), очень тихо (≈ −34 dBFS), медленное «дыхание»
const CHORDS = {
  cold: [110, 138.59, 164.81], frame: [98, 123.47, 146.83], h1: [110, 138.59, 164.81], h2: [98, 123.47, 146.83],
  h3: [116.54, 146.83, 174.61], bridge: [87.31, 110, 130.81], h4: [98, 123.47, 146.83], h5: [103.83, 130.81, 155.56],
  h6: [110, 138.59, 164.81], h7: [87.31, 110, 130.81], system: [130.81, 164.81, 196],
};
const partAt = (t) => {
  let i = 0;
  while (i + 1 < tl.scenes.length && tl.scenes[i + 1].from <= t) i++;
  return SCENES[i].part;
};
const AMP = 0.012;
let phase = [0, 0, 0, 0, 0, 0];
let cur = CHORDS[partAt(0)].slice();
const step = 1 / SR;
for (let i = 0; i < total; i++) {
  const t = i * step;
  if (i % 480 === 0) {
    const target = CHORDS[partAt(t)];
    cur = cur.map((f, k) => f + (target[k] - f) * 0.02); // плавный переход гармонии
  }
  const breath = 0.6 + 0.4 * Math.sin(2 * Math.PI * t / 11);
  const fade = Math.min(1, t / 3, (total / SR - t) / 4);
  let v = 0;
  for (let k = 0; k < 3; k++) {
    phase[k] += (2 * Math.PI * cur[k]) * step;
    phase[k + 3] += (2 * Math.PI * cur[k] * 1.003) * step;
    v += Math.sin(phase[k]) + 0.6 * Math.sin(phase[k + 3]);
  }
  mix[i] += (v / 4.8) * AMP * breath * Math.max(0, fade);
}
// редкие тихие «колокольчики»: тоны аккорда части на октаву-две выше, мягкое затухание
const BELL = 0.0045;
for (let n = 0; ; n++) {
  const t0 = 2.5 + n * 2.4;
  if (t0 * SR >= total - SR) break;
  const chord = CHORDS[partAt(t0)];
  const f = chord[n % 3] * (n % 2 ? 4 : 2);
  const len = Math.floor(1.8 * SR);
  const at = Math.floor(t0 * SR);
  for (let i = 0; i < len && at + i < total; i++) {
    const tt = i / SR;
    mix[at + i] += Math.sin(2 * Math.PI * f * tt) * Math.exp(-tt * 2.6) * Math.min(1, tt * 60) * BELL;
  }
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
