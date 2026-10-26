// Деликатный звуковой дизайн без музыки (правило Muslim Kids).
// Все звуки синтезируются детерминированно (фиксированный seed) и
// пишутся в public/audio/sfx/*.wav + cues.json (время и громкость).
// Звуков немного: соединение узора, воздух переходов, тихий ветер в горах.
// Запуск: node scripts/generate-sfx.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const OUT = join(ROOT, "public/audio/sfx");
const SR = 48000;
mkdirSync(OUT, { recursive: true });

let seed = 4004;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};

function writeWav(file, l, r = l) {
  const n = l.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 4, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, l[i])) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, r[i])) * 32767), 46 + i * 4);
  }
  writeFileSync(join(OUT, file), buf);
}

const normalize = (x, peak) => {
  let m = 0;
  for (const v of x) m = Math.max(m, Math.abs(v));
  return x.map((v) => (v / (m || 1)) * peak);
};

// Простой двухполюсный фильтр (биквад, полоса/НЧ) с меняющейся частотой.
function biquad(x, type, freqAt, q = 0.8) {
  const y = new Float32Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const w = (2 * Math.PI * freqAt(i / SR)) / SR;
    const a = Math.sin(w) / (2 * q);
    const c = Math.cos(w);
    let b0, b1, b2;
    if (type === "lp") {
      b0 = (1 - c) / 2;
      b1 = 1 - c;
      b2 = (1 - c) / 2;
    } else {
      b0 = a;
      b1 = 0;
      b2 = -a;
    }
    const a0 = 1 + a;
    const a1 = -2 * c;
    const a2 = 1 - a;
    const v = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1;
    x1 = x[i];
    y2 = y1;
    y1 = v;
    y[i] = v;
  }
  return y;
}

const noise = (dur) => Float32Array.from({ length: Math.round(dur * SR) }, () => rnd() * 2 - 1);

// Мягкий «звон соединения»: несколько чистых частот с плавным затуханием.
function chime(freqs, dur = 2.2, decay = 1.6) {
  const n = Math.round(dur * SR);
  const l = new Float32Array(n);
  const r = new Float32Array(n);
  freqs.forEach((f, k) => {
    const pan = 0.5 + (k % 2 ? 0.18 : -0.18);
    const amp = 1 / (k + 1.4);
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const env = Math.min(1, t / 0.012) * Math.exp(-t * (decay + k * 0.6));
      const v = Math.sin(2 * Math.PI * f * t + k) * env * amp;
      l[i] += v * (1 - pan);
      r[i] += v * pan;
    }
  });
  return [normalize(l, 0.8), normalize(r, 0.8)];
}

// Воздушный переход: шум через полосовой фильтр с плавным движением частоты.
function whoosh(dur, f0, f1) {
  const x = noise(dur);
  const y = biquad(x, "bp", (t) => f0 * (f1 / f0) ** (t / dur), 1.1);
  const env = (i) => Math.sin(Math.PI * Math.min(1, i / SR / dur)) ** 2;
  const l = y.map((v, i) => v * env(i));
  const r = biquad(noise(dur), "bp", (t) => f0 * (f1 / f0) ** (t / dur), 1.1).map((v, i) => v * env(i));
  return [normalize(l, 0.7), normalize(r, 0.7)];
}

// Тихий ветер: НЧ-шум с медленной «волной» громкости.
function wind(dur) {
  const mk = (ph) =>
    biquad(noise(dur), "lp", (t) => 380 + 220 * Math.sin(t * 0.7 + ph), 0.7).map((v, i) => {
      const t = i / SR;
      const fade = Math.min(1, t / 1.5, (dur - t) / 1.8);
      return v * fade * (0.6 + 0.4 * Math.sin(t * 0.9 + ph));
    });
  return [normalize(mk(0), 0.6), normalize(mk(1.7), 0.6)];
}

// Мягкий низкий подъём (горы растут) — без резкой атаки.
function swell(dur) {
  const mk = () =>
    biquad(noise(dur), "lp", (t) => 90 + 160 * (t / dur), 0.9).map((v, i) => v * Math.sin((Math.PI * i) / SR / dur) ** 1.5);
  return [normalize(mk(), 0.75), normalize(mk(), 0.75)];
}

const SOUNDS = {
  "connect-soft.wav": () => chime([660, 990, 1320]),
  "connect-bloom.wav": () => chime([523.25, 784, 1046.5, 1568], 2.8, 1.2),
  "sphere-close.wav": () => chime([392, 587.3, 784], 2.6, 1.1),
  "air-fold.wav": () => whoosh(3.0, 300, 1500),
  "air-dive.wav": () => whoosh(2.4, 1800, 380),
  "air-short.wav": () => whoosh(1.4, 600, 2000),
  "wind.wav": () => wind(10),
  "rise.wav": () => swell(3.6),
  "sparkle.wav": () => chime([1318.5, 1760, 2093], 1.6, 2.2),
  "logo.wav": () => chime([440, 659.25, 880, 1318.5], 3.2, 0.9),
};

for (const [file, make] of Object.entries(SOUNDS)) {
  const [l, r] = make();
  writeWav(file, l, r);
}

// Привязка к таймингу ролика (секунды), громкость ниже голоса.
const cues = [
  { file: "connect-soft.wav", at: 2.6, volume: 0.16 },
  { file: "connect-bloom.wav", at: 5.2, volume: 0.2 },
  { file: "air-fold.wav", at: 6.3, volume: 0.22 },
  { file: "sphere-close.wav", at: 9.25, volume: 0.2 },
  { file: "air-dive.wav", at: 21.7, volume: 0.24 },
  { file: "wind.wav", at: 23.8, volume: 0.13 },
  { file: "rise.wav", at: 24.3, volume: 0.22 },
  { file: "sparkle.wav", at: 28.0, volume: 0.1 },
  { file: "sparkle.wav", at: 31.4, volume: 0.1 },
  { file: "air-short.wav", at: 32.6, volume: 0.18 },
  { file: "connect-soft.wav", at: 35.0, volume: 0.12 },
  { file: "air-short.wav", at: 40.6, volume: 0.15 },
  { file: "connect-bloom.wav", at: 43.4, volume: 0.17 },
  { file: "sphere-close.wav", at: 46.3, volume: 0.12 },
  { file: "air-short.wav", at: 57.0, volume: 0.12 },
  { file: "logo.wav", at: 58.0, volume: 0.2 },
];
writeFileSync(join(OUT, "cues.json"), JSON.stringify(cues, null, 2) + "\n");
console.log(`SFX: ${Object.keys(SOUNDS).length} файлов, ${cues.length} меток.`);
