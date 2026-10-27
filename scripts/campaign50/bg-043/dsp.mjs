// Простейший детерминированный синтез звука для BG-043 (эффекты sfx.mjs и
// музыка music.mjs): фильтры, резонаторы, огибающие, кодирование в MP3.
// Без случайности времени запуска: шум — из mulberry32 с фиксированным seed.
import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SAMPLE_RATE, ffmpeg, mulberry32, writeWav } from "./audio.mjs";

export const SR = SAMPLE_RATE;
export const TAU = Math.PI * 2;
export { mulberry32 };

const TMP = join(tmpdir(), "balago-bg043-dsp");
mkdirSync(TMP, { recursive: true });

export const buf = (sec) => new Float32Array(Math.max(1, Math.ceil(sec * SR)));
export const clamp01 = (x) => Math.max(0, Math.min(1, x));
export const dbToGain = (db) => Math.pow(10, db / 20);
export const midiHz = (m) => 440 * Math.pow(2, (m - 69) / 12);

// Белый шум −1..1 (детерминированный).
export const whiteNoise = (n, seed) => {
  const r = mulberry32(seed);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = r() * 2 - 1;
  return out;
};

// Биквадратный фильтр (RBJ): lowpass, highpass, bandpass (пик 0 дБ), peak.
export class Biquad {
  constructor(type, freq, q = 0.707, gainDb = 0) {
    this.type = type;
    this.x1 = this.x2 = this.y1 = this.y2 = 0;
    this.set(freq, q, gainDb);
  }
  set(freq, q = this.q, gainDb = this.gainDb ?? 0) {
    this.q = q;
    this.gainDb = gainDb;
    const w = (TAU * Math.min(freq, SR * 0.45)) / SR;
    const cw = Math.cos(w);
    const alpha = Math.sin(w) / (2 * q);
    let b0, b1, b2, a0, a1, a2;
    if (this.type === "lowpass") {
      b0 = (1 - cw) / 2; b1 = 1 - cw; b2 = (1 - cw) / 2; a0 = 1 + alpha; a1 = -2 * cw; a2 = 1 - alpha;
    } else if (this.type === "highpass") {
      b0 = (1 + cw) / 2; b1 = -(1 + cw); b2 = (1 + cw) / 2; a0 = 1 + alpha; a1 = -2 * cw; a2 = 1 - alpha;
    } else if (this.type === "bandpass") {
      b0 = alpha; b1 = 0; b2 = -alpha; a0 = 1 + alpha; a1 = -2 * cw; a2 = 1 - alpha;
    } else {
      const A = Math.pow(10, gainDb / 40);
      b0 = 1 + alpha * A; b1 = -2 * cw; b2 = 1 - alpha * A; a0 = 1 + alpha / A; a1 = -2 * cw; a2 = 1 - alpha / A;
    }
    this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0; this.a1 = a1 / a0; this.a2 = a2 / a0;
    return this;
  }
  tick(x) {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y;
    return y;
  }
  run(arr) {
    for (let i = 0; i < arr.length; i++) arr[i] = this.tick(arr[i]);
    return arr;
  }
}

// Фильтр с меняющейся частотой: freqAt(t) пересчитывается каждые 32 сэмпла.
export const sweep = (arr, type, freqAt, q = 0.707) => {
  const f = new Biquad(type, freqAt(0), q);
  for (let i = 0; i < arr.length; i++) {
    if (i % 32 === 0) f.set(freqAt(i / SR), q);
    arr[i] = f.tick(arr[i]);
  }
  return arr;
};

// Затухающая синусоида (мода резонанса), добавляется в out с момента at.
export const addMode = (out, at, freq, amp, decaySec, phase = 0, glide = null) => {
  const i0 = Math.round(at * SR);
  const len = Math.min(out.length - i0, Math.ceil(decaySec * 7 * SR));
  let ph = phase;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const f = glide ? glide(t) : freq;
    ph += (TAU * f) / SR;
    out[i0 + i] += amp * Math.exp(-t / decaySec) * Math.sin(ph);
  }
};

// Короткий отфильтрованный шумовой щелчок (удар, касание).
export const addClick = (out, at, { freq = 3000, q = 1.2, amp = 1, decay = 0.004, seed = 1, len = 0.03, type = "bandpass" } = {}) => {
  const n = Math.ceil(len * SR);
  const nz = whiteNoise(n, seed);
  const f = new Biquad(type, freq, q);
  const i0 = Math.round(at * SR);
  for (let i = 0; i < n && i0 + i < out.length; i++) {
    const e = Math.exp(-i / SR / decay) * Math.min(1, i / (0.0004 * SR));
    out[i0 + i] += amp * f.tick(nz[i] * e);
  }
};

export const mix = (out, src, at = 0, gain = 1) => {
  const i0 = Math.round(at * SR);
  for (let i = 0; i < src.length && i0 + i < out.length; i++) if (i0 + i >= 0) out[i0 + i] += src[i] * gain;
  return out;
};

export const fade = (arr, inSec = 0.002, outSec = 0.02) => {
  const fi = Math.round(inSec * SR);
  const fo = Math.round(outSec * SR);
  for (let i = 0; i < Math.min(fi, arr.length); i++) arr[i] *= i / fi;
  for (let i = 0; i < Math.min(fo, arr.length); i++) arr[arr.length - 1 - i] *= Math.sin(((i / fo) * Math.PI) / 2);
  return arr;
};

export const peakDb = (channels) => {
  let p = 0;
  for (const ch of channels) for (const v of ch) p = Math.max(p, Math.abs(v));
  return 20 * Math.log10(p || 1e-9);
};

export const normalize = (channels, targetDb) => {
  const g = dbToGain(targetDb - peakDb(channels));
  for (const ch of channels) for (let i = 0; i < ch.length; i++) ch[i] *= g;
  return channels;
};

// Убирает постоянную составляющую (DC) — важно для шумовых эффектов.
export const dcBlock = (arr) => {
  let x1 = 0;
  let y1 = 0;
  for (let i = 0; i < arr.length; i++) {
    const y = arr[i] - x1 + 0.995 * y1;
    x1 = arr[i];
    y1 = y;
    arr[i] = y;
  }
  return arr;
};

// Float32 каналы → MP3 (44,1 кГц, libmp3lame).
export const encodeMp3 = (channels, outPath, bitrate = "128k") => {
  const wav = join(TMP, `${outPath.replace(/[^\w.-]+/g, "_")}.wav`);
  writeWav(wav, channels, SR);
  ffmpeg(["-i", wav, "-ar", String(SR), "-ac", String(channels.length), "-codec:a", "libmp3lame", "-b:a", bitrate, outPath]);
};
