// Тихие звуки ролика 80-1-2 (детерминированный синтез, без внешних файлов):
//   apple-place.wav — яблоко мягко касается фарфоровой тарелки;
//   knife-pick.wav, knife-place.wav — нож с салфетки и обратно (едва слышно);
//   cut-1.wav, cut-2.wav — нож проходит через яблоко (сочный короткий хруст);
//   halves.wav — половинки ложатся на тарелку;
//   seed-drop.wav — семечко на блюдце (крошечный «тик»);
//   saucer-slide.wav — блюдце сдвигают по столу;
//   rain.wav — спокойный дождь (петля), pour.wav — вода из лейки;
//   bee.wav — негромкое жужжание пчелы.
// Комната и птицы — те же файлы, что в первом фильме (public/audio/lesson01/sfx).
// Запуск: node scripts/lesson80-1-2-sfx.mjs → public/audio/lesson80-1-2/sfx/
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { mulberry32, writeWav } from "./lib/audio.mjs";

const SR = 48000;
const OUT = "public/audio/lesson80-1-2/sfx";
mkdirSync(OUT, { recursive: true });
const db = (x) => Math.pow(10, x / 20);
const norm = (a, level) => {
  let pk = 0;
  for (const v of a) pk = Math.max(pk, Math.abs(v));
  for (let i = 0; i < a.length; i++) a[i] *= db(level) / (pk || 1);
  return a;
};
// простой резонансный фильтр (полосовой)
const bandpass = (x, f0, q) => {
  const w = (2 * Math.PI * f0) / SR;
  const alpha = Math.sin(w) / (2 * q);
  const b0 = alpha, b2 = -alpha, a0 = 1 + alpha, a1 = -2 * Math.cos(w), a2 = 1 - alpha;
  const y = new Float32Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const v = (b0 * x[i] + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v;
  }
  return y;
};
const lowpass = (x, k) => {
  const y = new Float32Array(x.length);
  let s = 0;
  for (let i = 0; i < x.length; i++) { s += (x[i] - s) * k; y[i] = s; }
  return y;
};

// мягкий удар: моды + короткий шум
const tap = (seed, freqs, decays, gains, len, noise = 0.4, level = -18) => {
  const rnd = mulberry32(seed);
  const n = Math.round(SR * len);
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let v = 0;
    freqs.forEach((f, k) => (v += Math.sin(2 * Math.PI * f * t) * Math.exp(-t / decays[k]) * gains[k]));
    if (t < 0.006) v += (rnd() * 2 - 1) * noise * (1 - t / 0.006);
    a[i] = v;
  }
  return norm(a, level);
};

writeWav(join(OUT, "apple-place.wav"), [lowpass(tap(3, [180, 410, 1250, 2900], [0.05, 0.03, 0.02, 0.012], [1, 0.6, 0.25, 0.1], 0.4, 0.5, -16), 0.35)], SR);
writeWav(join(OUT, "knife-pick.wav"), [tap(5, [2400, 3700], [0.02, 0.012], [0.6, 0.3], 0.25, 0.3, -30)], SR);
writeWav(join(OUT, "knife-place.wav"), [tap(6, [2200, 3400, 5200], [0.03, 0.02, 0.01], [0.6, 0.35, 0.15], 0.3, 0.3, -27)], SR);
writeWav(join(OUT, "halves.wav"), [lowpass(tap(7, [220, 520, 1400], [0.04, 0.025, 0.015], [1, 0.5, 0.2], 0.35, 0.4, -20), 0.3)], SR);
writeWav(join(OUT, "seed-drop.wav"), [tap(8, [3100, 5200, 7600], [0.012, 0.008, 0.005], [0.7, 0.4, 0.2], 0.15, 0.2, -30)], SR);

// разрез: короткие «сочные» шумовые всплески с хрустом
for (const [k, seed] of [[1, 11], [2, 12]]) {
  const rnd = mulberry32(seed);
  const n = Math.round(SR * 0.42);
  const noise = new Float32Array(n);
  for (let i = 0; i < n; i++) noise[i] = rnd() * 2 - 1;
  const b = bandpass(noise, 2600 + k * 300, 1.4);
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.02) * Math.exp(-t / 0.12);
    const crackle = rnd() < 0.004 ? (rnd() * 2 - 1) * 3 : 0;
    a[i] = b[i] * env + crackle * Math.exp(-t / 0.1) * 0.3;
  }
  writeWav(join(OUT, `cut-${k}.wav`), [norm(a, -22)], SR);
}

// блюдце по дереву: мягкий шорох с лёгким «звоном» фарфора в начале
{
  const rnd = mulberry32(21);
  const n = Math.round(SR * 1.2);
  const noise = new Float32Array(n);
  for (let i = 0; i < n; i++) noise[i] = rnd() * 2 - 1;
  const b = bandpass(noise, 900, 0.9);
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.08) * (t < 0.8 ? 1 : Math.max(0, 1 - (t - 0.8) / 0.3)) * (0.8 + 0.2 * Math.sin(t * 23));
    a[i] = b[i] * env + Math.sin(2 * Math.PI * 2600 * t) * Math.exp(-t / 0.05) * 0.08;
  }
  writeWav(join(OUT, "saucer-slide.wav"), [norm(a, -28)], SR);
}

// дождь: мягкий шум + редкие капли; бесшовная петля 8 с, стерео
{
  const len = 8;
  const n = SR * len;
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  for (const [ch, seed] of [[L, 31], [R, 32]]) {
    const rnd = mulberry32(seed);
    const w = new Float32Array(n);
    for (let i = 0; i < n; i++) w[i] = rnd() * 2 - 1;
    const hiss = bandpass(w, 3200, 0.5);
    for (let i = 0; i < n; i++) ch[i] = hiss[i] * 0.5;
    for (let d = 0; d < 700; d++) {
      const i0 = Math.floor(rnd() * (n - SR * 0.03));
      const f = 1800 + rnd() * 3000;
      const g = 0.15 + rnd() * 0.35;
      for (let i = 0; i < SR * 0.02; i++) ch[i0 + i] += Math.sin((2 * Math.PI * f * i) / SR) * Math.exp(-i / (SR * 0.004)) * g;
    }
  }
  const fade = SR * 0.5;
  for (const ch of [L, R]) {
    for (let i = 0; i < fade; i++) {
      const k = i / fade;
      ch[i] = ch[i] * k + ch[n - fade + i] * (1 - k);
    }
  }
  let pk = 0;
  for (let i = 0; i < n - fade; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i]));
  const g = db(-24) / pk;
  writeWav(join(OUT, "rain.wav"), [L.slice(0, n - fade).map((v) => v * g), R.slice(0, n - fade).map((v) => v * g)], SR);
}

// вода из лейки: журчание (модулированный полосовой шум), петля 4 с
{
  const rnd = mulberry32(41);
  const n = SR * 4;
  const w = new Float32Array(n);
  for (let i = 0; i < n; i++) w[i] = rnd() * 2 - 1;
  const b1 = bandpass(w, 700, 1.2);
  const b2 = bandpass(w, 1500, 2);
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    a[i] = b1[i] * (0.7 + 0.3 * Math.sin(t * 17)) + b2[i] * 0.4 * (0.6 + 0.4 * Math.sin(t * 29 + 1));
  }
  const fade = SR * 0.3;
  for (let i = 0; i < fade; i++) {
    const k = i / fade;
    a[i] = a[i] * k + a[n - fade + i] * (1 - k);
  }
  writeWav(join(OUT, "pour.wav"), [norm(a.slice(0, n - fade), -26)], SR);
}

// пчела: мягкое жужжание ~220 Гц с плавающей высотой и обертонами, 4 с
{
  const n = SR * 4;
  const a = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = 215 + 12 * Math.sin(t * 2.3) + 5 * Math.sin(t * 7.1);
    ph += (2 * Math.PI * f) / SR;
    let v = 0;
    for (let h = 1; h <= 8; h++) v += Math.sin(h * ph) / (h * 1.2);
    a[i] = v * (0.75 + 0.25 * Math.sin(t * 11)) * Math.min(1, t / 0.2) * Math.min(1, (4 - t) / 0.2);
  }
  writeWav(join(OUT, "bee.wav"), [norm(lowpass(a, 0.25), -26)], SR);
}
console.log("Звуки ролика 80-1-2 готовы:", OUT);
