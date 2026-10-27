// Звуковая дорожка BM-020: каждая реплика на своём месте тайм-лайна (то же
// время, что и в кадре) + тихий собственный эмбиент, сгенерированный кодом
// (никакой чужой музыки). Под речью эмбиент приглушается ещё сильнее.
// Без сигналов-отсчётов и скримеров. Выход — WAV 48 кГц моно.
// Запуск: [PILOT=1] node scripts/it-king/mixdown.mjs out/audio.wav [--no-music]
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { timeline, VOICE_DIR } from "./lib.mjs";

const OUT = process.argv[2] ?? "out/it-audio.wav";
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

// ── эмбиент: медленный аккорд (ре минор с добавленной ноной), мягкие обертоны,
// дыхание громкости 0.03–0.07 Гц. Детерминирован, без случайных чисел.
if (!process.argv.includes("--no-music")) {
  const chords = [
    [38, 45, 50, 53, 57], // Dm(add9) низко
    [36, 43, 48, 52, 55], // C
    [34, 41, 46, 50, 53], // Bb
    [33, 40, 45, 48, 52], // Am
  ];
  const hz = (m) => 440 * 2 ** ((m - 69) / 12);
  const CH = 24; // секунд на аккорд, плавный кроссфейд
  const speech = new Float32Array(Math.ceil(tl.duration * 10)); // 10 Гц: идёт ли речь
  for (const ln of tl.lines) for (let k = Math.floor(ln.speechFrom * 10); k <= Math.ceil(ln.speechTo * 10) && k < speech.length; k++) if (k >= 0) speech[k] = 1;
  // сглаживание огибающей приглушения (атака/спад ≈ 0.6 с)
  const duck = new Float32Array(speech.length);
  let d = 0;
  for (let k = 0; k < speech.length; k++) {
    d += ((speech[k] ? 1 : 0) - d) * 0.16;
    duck[k] = d;
  }
  for (let i = 0; i < total; i++) {
    const t = i / SR;
    const ci = Math.floor(t / CH);
    const frac = (t % CH) / CH;
    const xf = frac > 0.8 ? (frac - 0.8) / 0.2 : 0;
    let v = 0;
    for (let w = 0; w < 2; w++) {
      const notes = chords[(ci + w) % chords.length];
      const g = w === 0 ? 1 - xf : xf;
      if (g <= 0) continue;
      notes.forEach((m, n) => {
        const f = hz(m);
        const lfo = 0.6 + 0.4 * Math.sin(2 * Math.PI * (0.03 + n * 0.008) * t + n);
        v += g * lfo * (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(2 * Math.PI * f * 2.001 * t)) / notes.length;
      });
    }
    const fadeIn = Math.min(1, t / 4);
    const fadeOut = Math.min(1, (tl.duration - t) / 5);
    const k = Math.min(duck.length - 1, Math.floor(t * 10));
    const level = 0.05 * (1 - 0.55 * duck[k]); // тихо; под голосом ещё тише
    mix[i] += v * level * Math.max(0, fadeIn) * Math.max(0, fadeOut);
  }
}

let peak = 0;
for (const v of mix) peak = Math.max(peak, Math.abs(v));
const norm = peak > 0.97 ? 0.97 / peak : 1;
const pcm = Buffer.alloc(total * 2);
for (let i = 0; i < total; i++) pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, mix[i] * norm)) * 32767), i * 2);
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
