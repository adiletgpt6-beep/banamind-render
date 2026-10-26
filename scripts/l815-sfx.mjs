// Звуки Lesson80_1_5, которых нет среди общих эффектов проекта: бумага
// (взяли лист, провели по сгибу, раскрыли корпус, положили на стол),
// вода (касание лодочки, тихое движение), тихий фон комнаты (петля 10 с),
// мел по доске. Синтез детерминированный (seed), результат —
// public/audio/lesson-80-1-5/sfx/*.mp3. Запуск: node scripts/l815-sfx.mjs
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { SAMPLE_RATE as SR, ffmpeg, mulberry32, writeWav } from "./lib/audio.mjs";

const OUT = "public/audio/lesson-80-1-5/sfx";
mkdirSync(OUT, { recursive: true });
const TMP = join(tmpdir(), "l815-sfx");
mkdirSync(TMP, { recursive: true });

const buf = (sec) => new Float32Array(Math.round(sec * SR));
const lowpass = (x, hz) => {
  const a = Math.exp((-2 * Math.PI * hz) / SR);
  let y = 0;
  for (let i = 0; i < x.length; i++) {
    y = (1 - a) * x[i] + a * y;
    x[i] = y;
  }
  return x;
};
const highpass = (x, hz) => {
  const lp = lowpass(Float32Array.from(x), hz);
  for (let i = 0; i < x.length; i++) x[i] -= lp[i];
  return x;
};
const add = (dst, src, at, gain = 1) => {
  const o = Math.round(at * SR);
  for (let i = 0; i < src.length && o + i < dst.length; i++) dst[o + i] += src[i] * gain;
};
const noise = (sec, seed) => {
  const r = mulberry32(seed);
  const x = buf(sec);
  for (let i = 0; i < x.length; i++) x[i] = r() * 2 - 1;
  return x;
};
const env = (x, attack, decay) => {
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    x[i] *= Math.min(1, t / attack) * Math.exp(-t / decay);
  }
  return x;
};
const shape = (x, fn) => {
  for (let i = 0; i < x.length; i++) x[i] *= fn(i / SR);
  return x;
};
const save = (name, x, peakDb = -6) => {
  let p = 0;
  for (const v of x) p = Math.max(p, Math.abs(v));
  const g = Math.pow(10, peakDb / 20) / (p || 1);
  for (let i = 0; i < x.length; i++) x[i] *= g;
  const wav = join(TMP, `${name}.wav`);
  writeWav(wav, [x]);
  ffmpeg(["-i", wav, "-ar", String(SR), "-ac", "1", "-codec:a", "libmp3lame", "-b:a", "160k", join(OUT, `${name}.mp3`)]);
  console.log(`✓ ${name}.mp3`);
};

// бумага: шорох — шум 1–6 кГц с неровной амплитудой
const rustle = (sec, seed, lo, hi) => {
  const x = highpass(lowpass(noise(sec, seed), hi), lo);
  const r = mulberry32(seed + 7);
  let ph = 0;
  for (let i = 0; i < x.length; i++) {
    ph += (2 * Math.PI * (14 + 10 * r())) / SR;
    x[i] *= 0.6 + 0.4 * Math.sin(ph);
  }
  return x;
};

// взяли лист со стопки: короткий подъём с шорохом
{
  const x = buf(0.7);
  add(x, shape(rustle(0.6, 11, 900, 5200), (t) => Math.sin((Math.PI * Math.min(t, 0.6)) / 0.6) ** 0.7), 0, 0.8);
  add(x, env(highpass(noise(0.04, 12), 2500), 0.001, 0.01), 0.02, 0.35);
  save("paper-take", x, -14);
}
// провели по сгибу: нарастающий шорох с лёгким "хрустом" в конце
for (let k = 0; k < 3; k++) {
  const x = buf(0.75);
  add(x, shape(rustle(0.6, 21 + k * 5, 1200, 6500), (t) => Math.min(1, t / 0.25) * Math.max(0, 1 - (t - 0.25) / 0.4)), 0.02, 0.8);
  add(x, env(highpass(noise(0.05, 23 + k), 3000), 0.002, 0.015), 0.42 + k * 0.03, 0.4);
  save(`paper-crease-${k}`, x, -15 - k * 0.5);
}
// раскрытие корпуса: два коротких шороха и хлопок бумаги
{
  const x = buf(0.9);
  add(x, shape(rustle(0.35, 31, 800, 5000), (t) => Math.sin((Math.PI * Math.min(t, 0.35)) / 0.35)), 0, 0.7);
  add(x, env(lowpass(highpass(noise(0.08, 32), 700), 3500), 0.003, 0.03), 0.38, 0.9);
  add(x, shape(rustle(0.3, 33, 1000, 5500), (t) => Math.sin((Math.PI * Math.min(t, 0.3)) / 0.3)), 0.5, 0.5);
  save("paper-open", x, -14);
}
// лист/лодочка на стол: мягкое касание
{
  const x = buf(0.4);
  add(x, env(lowpass(noise(0.2, 41), 900), 0.003, 0.03), 0, 1);
  add(x, env(highpass(lowpass(noise(0.15, 42), 4000), 1500), 0.004, 0.04), 0.01, 0.4);
  save("paper-put", x, -18);
}
// вода: касание лодочки — короткий мягкий всплеск
{
  const x = buf(0.9);
  add(x, env(lowpass(highpass(noise(0.5, 51), 300), 1800), 0.01, 0.09), 0, 1);
  const r = mulberry32(52);
  for (let k = 0; k < 6; k++) {
    const d = buf(0.08);
    const f0 = 900 + r() * 1500;
    for (let i = 0; i < d.length; i++) {
      const t = i / SR;
      d[i] = Math.sin(2 * Math.PI * (f0 + 2200 * t) * t) * Math.exp(-t / 0.02);
    }
    add(x, d, 0.03 + r() * 0.3, 0.12 + r() * 0.1);
  }
  save("water-touch", x, -16);
}
// вода: очень тихое движение (петля 6 с)
{
  const x = buf(6);
  const n = lowpass(highpass(noise(6, 61), 250), 1400);
  const r = mulberry32(62);
  let ph = 0;
  for (let i = 0; i < n.length; i++) {
    ph += (2 * Math.PI * (0.6 + 0.4 * r())) / SR;
    n[i] *= 0.5 + 0.5 * Math.sin(ph);
  }
  add(x, n, 0, 1);
  save("water-lap", x, -26);
}
// фон комнаты: очень тихий шум (петля 10 с, с лёгкой модуляцией)
{
  const x = buf(10);
  const n = lowpass(highpass(noise(10, 71), 120), 900);
  for (let i = 0; i < n.length; i++) {
    const t = i / SR;
    n[i] *= 0.85 + 0.15 * Math.sin(2 * Math.PI * 0.07 * t);
  }
  add(x, n, 0, 1);
  save("room-tone", x, -30);
}
// мел по доске: короткий штрих
for (let k = 0; k < 2; k++) {
  const x = buf(0.5);
  add(x, shape(highpass(lowpass(noise(0.45, 81 + k), 6000), 2500), (t) => Math.sin((Math.PI * Math.min(t, 0.45)) / 0.45) ** 1.5), 0, 1);
  save(`chalk-${k}`, x, -20);
}
