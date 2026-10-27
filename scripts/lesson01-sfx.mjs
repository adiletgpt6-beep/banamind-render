// Тихие звуки урока 1 (детерминированный синтез, без внешних файлов):
//   roomtone.wav — очень тихий фон комнаты (петля 12 с);
//   wood-pick-*.wav, wood-place-*.wav — лёгкие касания деревянных кубиков;
//   birds.wav — редкие голоса птиц за окном (18 с).
// Запуск: node scripts/lesson01-sfx.mjs → public/audio/lesson01/sfx/
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { mulberry32, writeWav } from "./lib/audio.mjs";

const SR = 48000;
const OUT = "public/audio/lesson01/sfx";
mkdirSync(OUT, { recursive: true });
const db = (x) => Math.pow(10, x / 20);

// --- фон комнаты: мягкий «коричневый» шум, едва слышный ---
{
  const n = SR * 12;
  const rnd = mulberry32(7);
  const a = new Float32Array(n);
  let b = 0;
  let lp = 0;
  for (let i = 0; i < n; i++) {
    b = (b + (rnd() * 2 - 1) * 0.02) * 0.998;
    lp += (b - lp) * 0.05;
    a[i] = lp;
  }
  let rms = 0;
  for (const v of a) rms += v * v;
  rms = Math.sqrt(rms / n);
  const g = db(-52) / rms;
  const fade = SR * 0.5; // бесшовная петля
  for (let i = 0; i < n; i++) a[i] *= g;
  for (let i = 0; i < fade; i++) {
    const k = i / fade;
    a[i] = a[i] * k + a[n - fade + i] * (1 - k);
  }
  writeWav(join(OUT, "roomtone.wav"), [a.slice(0, n - fade)], SR);
}

// --- дерево: модальный «тук» ---
const knock = (seed, base, level, len = 0.35) => {
  const rnd = mulberry32(seed);
  const n = Math.round(SR * len);
  const a = new Float32Array(n);
  const modes = [1, 2.31, 3.9, 5.6].map((m, i) => ({ f: base * m * (0.97 + rnd() * 0.06), d: [0.07, 0.045, 0.03, 0.02][i], g: [1, 0.55, 0.3, 0.18][i] }));
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let v = 0;
    for (const m of modes) v += Math.sin(2 * Math.PI * m.f * t) * Math.exp(-t / m.d) * m.g;
    if (i < SR * 0.004) v += (rnd() * 2 - 1) * 0.6 * (1 - i / (SR * 0.004));
    a[i] = v;
  }
  let pk = 0;
  for (const v of a) pk = Math.max(pk, Math.abs(v));
  for (let i = 0; i < n; i++) a[i] *= db(level) / pk;
  return a;
};
writeWav(join(OUT, "wood-pick-1.wav"), [knock(11, 760, -24, 0.25)], SR);
writeWav(join(OUT, "wood-pick-2.wav"), [knock(12, 820, -25, 0.25)], SR);
writeWav(join(OUT, "wood-place-1.wav"), [knock(21, 610, -15)], SR);
writeWav(join(OUT, "wood-place-2.wav"), [knock(22, 660, -16)], SR);

// --- птицы: редкие короткие трели двух голосов вдалеке ---
{
  const len = 18;
  const n = SR * len;
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const rnd = mulberry32(31);
  const chirp = (t0, f0, f1, dur, amp, pan) => {
    const i0 = Math.round(t0 * SR);
    const m = Math.round(dur * SR);
    let ph = 0;
    for (let i = 0; i < m && i0 + i < n; i++) {
      const u = i / m;
      const fr = f0 + (f1 - f0) * Math.sin(u * Math.PI * 0.5);
      ph += (2 * Math.PI * fr) / SR;
      const env = Math.sin(Math.PI * u) ** 2;
      const v = (Math.sin(ph) + 0.18 * Math.sin(2 * ph)) * env * amp;
      L[i0 + i] += v * Math.sqrt((1 - pan) / 2);
      R[i0 + i] += v * Math.sqrt((1 + pan) / 2);
    }
  };
  let t = 0.6;
  while (t < len - 2) {
    const voice = rnd() < 0.55 ? 0 : 1;
    const base = voice ? 3100 : 4200;
    const notes = 3 + Math.floor(rnd() * 4);
    const pan = voice ? -0.4 : 0.35;
    for (let k = 0; k < notes; k++) {
      const f0 = base * (0.92 + rnd() * 0.16);
      chirp(t + k * (0.09 + rnd() * 0.05), f0, f0 * (1.15 + rnd() * 0.3), 0.055 + rnd() * 0.04, 0.5 + rnd() * 0.3, pan);
    }
    t += 1.6 + rnd() * 2.6;
  }
  let pk = 0;
  for (let i = 0; i < n; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i]));
  // отражения сада: лёгкая задержка
  for (let i = n - 1; i >= Math.round(SR * 0.07); i--) {
    L[i] += L[i - Math.round(SR * 0.07)] * 0.25;
    R[i] += R[i - Math.round(SR * 0.061)] * 0.25;
  }
  const g = db(-34) / pk;
  for (let i = 0; i < n; i++) {
    L[i] *= g;
    R[i] *= g;
  }
  writeWav(join(OUT, "birds.wav"), [L, R], SR);
}
console.log("Звуки урока 1 готовы:", OUT);
