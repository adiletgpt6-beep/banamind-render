// Тихие предметные звуки 80-1-14 (детерминированный синтез, без музыки):
// ровный фон комнаты, бумага (взять/положить), карандаш по бумаге, стук
// карандаша о пенал, стакан ставится на стол, вода наливается в стакан,
// маркер, кнопка на доске. Результат — public/audio/lesson80-1-14/sfx/*.mp3.
// Запуск: node scripts/lesson80/sfx.mjs
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { SAMPLE_RATE as SR, ffmpeg, mulberry32, writeWav } from "../lib/audio.mjs";

const OUT = "public/audio/lesson80-1-14/sfx";
mkdirSync(OUT, { recursive: true });
const TMP = join(tmpdir(), "l80-sfx");
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
const bandpass = (x, lo, hi) => lowpass(highpass(x, lo), hi);
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
const fade = (x, fi, fo) => {
  const a = Math.round(fi * SR);
  const b = Math.round(fo * SR);
  for (let i = 0; i < Math.min(a, x.length); i++) x[i] *= i / a;
  for (let i = 0; i < Math.min(b, x.length); i++) x[x.length - 1 - i] *= i / b;
  return x;
};
const save = (name, x, peakDb) => {
  let p = 0;
  for (const v of x) p = Math.max(p, Math.abs(v));
  const g = Math.pow(10, peakDb / 20) / (p || 1);
  for (let i = 0; i < x.length; i++) x[i] *= g;
  const wav = join(TMP, `${name}.wav`);
  writeWav(wav, [x]);
  ffmpeg(["-i", wav, "-ar", "48000", "-ac", "1", "-codec:a", "libmp3lame", "-b:a", "160k", join(OUT, `${name}.mp3`)]);
  console.log(`✓ ${name}.mp3`);
};

// ровный фон комнаты: мягкий коричневый шум без событий (петля 20 с)
{
  const n = noise(20, 801);
  let y = 0;
  for (let i = 0; i < n.length; i++) {
    y = 0.985 * y + 0.015 * n[i];
    n[i] = y;
  }
  const x = lowpass(highpass(n, 60), 900);
  // бесшовная петля: перекрёстное затухание краёв
  const k = Math.round(0.5 * SR);
  for (let i = 0; i < k; i++) {
    const t = i / k;
    x[i] = x[i] * t + x[x.length - k + i] * (1 - t);
  }
  save("room", x.slice(0, x.length - k), -42);
}

// бумага: шорох при подъёме и мягкое касание стола
{
  const x = buf(0.7);
  add(x, env(bandpass(noise(0.6, 811), 1200, 7000), 0.05, 0.18), 0.0, 1);
  add(x, env(bandpass(noise(0.3, 812), 2500, 9000), 0.02, 0.07), 0.12, 0.6);
  save("paper-lift", fade(x, 0.01, 0.1), -20);
  const y = buf(0.5);
  add(y, env(bandpass(noise(0.25, 813), 800, 5000), 0.01, 0.06), 0.02, 1);
  add(y, env(lowpass(noise(0.1, 814), 300), 0.002, 0.03), 0.05, 0.5);
  save("paper-place", fade(y, 0.005, 0.1), -22);
}

// карандаш по бумаге: короткие штрихи (4 с; в фильме обрезается по рисованию)
{
  const x = buf(4);
  const r = mulberry32(821);
  let t = 0;
  while (t < 3.9) {
    const len = 0.12 + r() * 0.28;
    const s = bandpass(noise(len, 822 + Math.floor(t * 100)), 2500, 9000);
    for (let i = 0; i < s.length; i++) {
      const u = i / s.length;
      s[i] *= Math.sin(Math.PI * u) * (0.7 + 0.3 * Math.sin(i / 90));
    }
    add(x, s, t, 0.6 + r() * 0.4);
    t += len + 0.03 + r() * 0.08;
  }
  save("pencil", fade(x, 0.02, 0.15), -24);
}

// карандаш берут из пенала / кладут
{
  const x = buf(0.25);
  add(x, env(bandpass(noise(0.05, 831), 1500, 6000), 0.001, 0.012), 0, 1);
  add(x, env(bandpass(noise(0.05, 832), 1500, 6000), 0.001, 0.01), 0.07, 0.6);
  save("pencil-tap", x, -24);
}

// стакан мягко ставится на деревянный стол
{
  const x = buf(0.5);
  add(x, env(lowpass(noise(0.1, 841), 500), 0.001, 0.015), 0, 1);
  const r = mulberry32(842);
  for (const [mul, g] of [[1, 0.35], [2.7, 0.18], [5.2, 0.08]]) {
    const fq = 1650 * mul * (1 + (r() - 0.5) * 0.02);
    const p = buf(0.4);
    for (let i = 0; i < p.length; i++) {
      const t = i / SR;
      p[i] = Math.sin(2 * Math.PI * fq * t) * Math.exp(-t / 0.05);
    }
    add(x, p, 0.002, g);
  }
  save("cup-set", x, -20);
}

// вода льётся в стакан: шум струи, тон «наполнения» поднимается
{
  const dur = 2.6;
  const x = buf(dur);
  const base = bandpass(noise(dur, 851), 300, 5000);
  const r = mulberry32(852);
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    const amp = Math.min(1, t / 0.15) * Math.min(1, (dur - t) / 0.25);
    x[i] = base[i] * amp * (0.55 + 0.45 * Math.sin(2 * Math.PI * 9 * t + Math.sin(t * 31)));
  }
  // пузырьки с повышающимся тоном
  for (let k = 0; k < 70; k++) {
    const at = 0.1 + r() * (dur - 0.4);
    const f0 = 500 + (at / dur) * 900 + r() * 200;
    const p = buf(0.03);
    for (let i = 0; i < p.length; i++) {
      const t = i / SR;
      p[i] = Math.sin(2 * Math.PI * (f0 + 4000 * t) * t) * Math.exp(-t / 0.008);
    }
    add(x, p, at, 0.25);
  }
  save("pour", lowpass(x, 6000), -20);
}

// маркер по бумаге
{
  const x = buf(4);
  const r = mulberry32(861);
  let t = 0;
  while (t < 3.9) {
    const len = 0.18 + r() * 0.3;
    const s = bandpass(noise(len, 862 + Math.floor(t * 100)), 1200, 6000);
    for (let i = 0; i < s.length; i++) s[i] *= Math.sin(Math.PI * (i / s.length));
    add(x, s, t, 0.7 + r() * 0.3);
    t += len + 0.05 + r() * 0.1;
  }
  save("marker", fade(x, 0.02, 0.15), -26);
}

// кнопка прижимает лист к доске
{
  const x = buf(0.3);
  add(x, env(lowpass(noise(0.06, 871), 1800), 0.001, 0.01), 0, 1);
  add(x, env(bandpass(noise(0.08, 872), 600, 3000), 0.002, 0.03), 0.01, 0.5);
  save("pin", x, -20);
}
