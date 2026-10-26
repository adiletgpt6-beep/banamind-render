// Тихие звуки ролика №32 «Атам — айдоочу», которых нет среди общих
// эффектов проекта: карандаш по бумаге (запись слова и строки), макет
// снимают с полки и ставят на стол, спокойная атмосфера комнаты и офиса.
// Синтез детерминированный (seed): один и тот же результат при каждом
// запуске. Результат — public/audio/dad-driver/sfx/*.mp3.
// Запуск: npm run audio:sfx:dad-driver
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { SAMPLE_RATE as SR, ffmpeg, mulberry32, writeWav } from "./lib/audio.mjs";

const OUT = "public/audio/dad-driver/sfx";
mkdirSync(OUT, { recursive: true });
const TMP = join(tmpdir(), "dd-sfx");
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
const fade = (x, fin, fout) => {
  const a = Math.round(fin * SR);
  const b = Math.round(fout * SR);
  for (let i = 0; i < a && i < x.length; i++) x[i] *= i / a;
  for (let i = 0; i < b && i < x.length; i++) x[x.length - 1 - i] *= i / b;
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
  console.log(`✓ ${OUT}/${name}.mp3`);
};

// Карандаш: сухой шорох графита (полоса 2–6 кГц), короткие штрихи с
// паузами, едва слышный «корпус» бумаги ниже. sec — длина записи.
const pencil = (sec, seed) => {
  const r = mulberry32(seed);
  const x = buf(sec);
  let t = 0.02;
  while (t < sec - 0.08) {
    const len = 0.05 + r() * 0.11;
    const amp = 0.5 + r() * 0.5;
    const grain = highpass(lowpass(noise(len, Math.floor(r() * 1e6)), 6200), 1900);
    const body = lowpass(noise(len, Math.floor(r() * 1e6)), 700);
    for (let i = 0; i < grain.length; i++) {
      const u = i / grain.length;
      const e = Math.sin(Math.PI * u) ** 0.7;
      grain[i] = (grain[i] + body[i] * 0.25) * e * amp;
    }
    add(x, grain, t);
    t += len + 0.015 + r() * 0.07;
  }
  return fade(x, 0.01, 0.04);
};
save("pencil-word", pencil(1.5, 3201), -20);
save("pencil-line", pencil(2.6, 3202), -21);
save("pencil-short", pencil(0.7, 3203), -21);

// Макет снимают с полки: мягкий деревянный стук основания + лёгкий
// перестук роликов. Ставят на стол: глухой мягкий стук.
{
  const x = buf(0.5);
  add(x, env(lowpass(noise(0.25, 41), 650), 0.002, 0.03), 0.0, 1);
  for (let k = 0; k < 4; k++) add(x, env(highpass(lowpass(noise(0.05, 50 + k), 4200), 1500), 0.001, 0.008), 0.05 + k * 0.035, 0.18);
  save("model-lift", x, -18);
}
{
  const x = buf(0.45);
  add(x, env(lowpass(noise(0.3, 61), 420), 0.003, 0.05), 0.0, 1);
  add(x, env(highpass(lowpass(noise(0.05, 62), 3000), 900), 0.001, 0.01), 0.012, 0.2);
  save("model-place", x, -17);
}

// Атмосфера: тёплый «воздух» комнаты (коричневый шум, 60–400 Гц) и офиса
// (то же + еле заметная вентиляция). 12 с, мягкие края — для петли.
const air = (sec, seed, top) => {
  const w = noise(sec, seed);
  let y = 0;
  for (let i = 0; i < w.length; i++) {
    y = 0.995 * y + w[i] * 0.02;
    w[i] = y;
  }
  return fade(highpass(lowpass(w, top), 60), 1.2, 1.2);
};
save("room", air(12, 71, 380), -30);
{
  const x = air(12, 81, 520);
  const hum = buf(12);
  for (let i = 0; i < hum.length; i++) hum[i] = Math.sin((2 * Math.PI * 118 * i) / SR) * 0.012 + Math.sin((2 * Math.PI * 236 * i) / SR) * 0.004;
  add(x, fade(hum, 1.2, 1.2), 0);
  save("office", x, -29);
}
