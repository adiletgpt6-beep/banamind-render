// Функции звука BG-017 (копия scripts/lib/audio.mjs — эпизод изолирован): ffmpeg, PCM.
import { execFileSync, spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

export const SAMPLE_RATE = 44100;

// Системный ffmpeg, если есть; иначе ffmpeg, который поставляется с Remotion.
const hasSystemFfmpeg =
  spawnSync("ffmpeg", ["-version"], { stdio: "ignore" }).status === 0;

export const ffmpeg = (args, options = {}) => {
  const [cmd, base] = hasSystemFfmpeg
    ? ["ffmpeg", []]
    : ["npx", ["remotion", "ffmpeg"]];
  return execFileSync(
    cmd,
    [...base, "-hide_banner", "-loglevel", "error", "-y", ...args],
    {
      maxBuffer: 1024 * 1024 * 512,
      ...options,
    },
  );
};

// Записывает стерео/моно Float32 (-1..1) в 16-битный WAV.
export const writeWav = (path, channels, sampleRate = SAMPLE_RATE) => {
  const numCh = channels.length;
  const len = channels[0].length;
  const buf = Buffer.alloc(44 + len * numCh * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + len * numCh * 2, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(numCh, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * numCh * 2, 28);
  buf.writeUInt16LE(numCh * 2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(len * numCh * 2, 40);
  let o = 44;
  for (let i = 0; i < len; i++) {
    for (let c = 0; c < numCh; c++) {
      const v = Math.max(-1, Math.min(1, channels[c][i]));
      buf.writeInt16LE(Math.round(v * 32767), o);
      o += 2;
    }
  }
  writeFileSync(path, buf);
};

// Декодирует любой аудиофайл в моно Float32 через ffmpeg.
export const decodeMono = (path, sampleRate = SAMPLE_RATE) => {
  const raw = ffmpeg([
    "-i",
    path,
    "-f",
    "s16le",
    "-acodec",
    "pcm_s16le",
    "-ac",
    "1",
    "-ar",
    String(sampleRate),
    "pipe:1",
  ]);
  const out = new Float32Array(raw.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = raw.readInt16LE(i * 2) / 32768;
  return out;
};

// Нормализует пиковый уровень к targetDb (дБFS).
export const normalizePeak = (channels, targetDb) => {
  let peak = 0;
  for (const ch of channels)
    for (const v of ch) peak = Math.max(peak, Math.abs(v));
  const gain = peak > 0 ? Math.pow(10, targetDb / 20) / peak : 1;
  for (const ch of channels) for (let i = 0; i < ch.length; i++) ch[i] *= gain;
};

export const wavToMp3 = (wavPath, mp3Path, extra = []) =>
  ffmpeg([
    "-i",
    wavPath,
    ...extra,
    "-codec:a",
    "libmp3lame",
    "-b:a",
    "192k",
    mp3Path,
  ]);

// Детерминированный генератор случайных чисел (одинаковый результат при каждом запуске).
export const mulberry32 = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
