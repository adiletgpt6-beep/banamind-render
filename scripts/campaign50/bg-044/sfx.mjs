// Звуки BG-044, синтезированные локально (ffmpeg + собственный синтез,
// без сторонних библиотек и платных сервисов):
//   • мягкие 8-битные эффекты игры и тихие бытовые звуки 2D-сцен
//     (список — SFX_NAMES в src/campaign50/bg-044/sound.ts);
//   • тихая игровая мелодия-петля (8 тактов, 110 уд/мин, до мажор):
//     треугольный бас, «пульсовая» мелодия со смягчённым фильтром, лёгкий шорох.
// Детерминированно: одинаковый результат при каждом запуске.
// Запуск: node scripts/campaign50/bg-044/sfx.mjs → public/audio/campaign50/bg-044/{sfx,music}/
import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SFX_NAMES } from "../../../src/campaign50/bg-044/sound.ts";
import { SAMPLE_RATE as SR, mulberry32, normalizePeak, wavToMp3, writeWav } from "./audio.mjs";

const OUT = "public/audio/campaign50/bg-044";
mkdirSync(join(OUT, "sfx"), { recursive: true });
mkdirSync(join(OUT, "music"), { recursive: true });
const TMP = join(tmpdir(), "balago-bg044-sfx");
mkdirSync(TMP, { recursive: true });

// ---------- синтез по отсчётам ----------
const TAU = Math.PI * 2;
const buf = (sec) => new Float32Array(Math.round(sec * SR));
// мягкий «квадрат»: сумма первых нечётных гармоник (без резкого звона)
const softSquare = (ph) => Math.sin(ph) + Math.sin(3 * ph) / 3 + Math.sin(5 * ph) / 5 * 0.6;
const tri = (ph) => (2 / Math.PI) * Math.asin(Math.sin(ph));
const env = (t, a, d) => (t < a ? t / a : Math.exp(-(t - a) / d));

// Нота: частота f, начало at (с), длина len (с), форма wave, громкость v.
const note = (out, f, at, len, v, wave = softSquare, decay = len * 0.5) => {
  const a = Math.round(at * SR);
  const n = Math.round(len * SR);
  let ph = 0;
  for (let i = 0; i < n && a + i < out.length; i++) {
    const t = i / SR;
    ph += (TAU * f) / SR;
    const tail = Math.min(1, (n - i) / (0.012 * SR)); // без щелчка в конце
    out[a + i] += v * wave(ph) * env(t, 0.004, decay) * tail;
  }
};
const glide = (out, f0, f1, at, len, v, wave = Math.sin) => {
  const a = Math.round(at * SR);
  const n = Math.round(len * SR);
  let ph = 0;
  for (let i = 0; i < n && a + i < out.length; i++) {
    const k = i / n;
    ph += (TAU * (f0 + (f1 - f0) * k)) / SR;
    out[a + i] += v * wave(ph) * env(i / SR, 0.006, len * 0.45) * Math.min(1, (n - i) / (0.01 * SR));
  }
};
const noise = (out, at, len, v, seed, lp = 0.2) => {
  const rnd = mulberry32(seed);
  const a = Math.round(at * SR);
  const n = Math.round(len * SR);
  let y = 0;
  for (let i = 0; i < n && a + i < out.length; i++) {
    y += lp * (rnd() * 2 - 1 - y); // однополюсный ФНЧ
    out[a + i] += v * y * env(i / SR, 0.002, len * 0.35);
  }
};
// мягкий ФНЧ всего буфера
const lowpass = (x, cutoff) => {
  const k = 1 - Math.exp((-TAU * cutoff) / SR);
  let y = 0;
  for (let i = 0; i < x.length; i++) {
    y += k * (x[i] - y);
    x[i] = y;
  }
  return x;
};

const save = (name, x, peakDb, dir = "sfx") => {
  normalizePeak([x], peakDb);
  const wav = join(TMP, `${name}.wav`);
  writeWav(wav, [x]);
  wavToMp3(wav, join(OUT, dir, `${name}.mp3`), ["-ar", String(SR), "-ac", "1"]);
  console.log(`✓ ${dir}/${name}.mp3 (${(x.length / SR).toFixed(2)} с)`);
};

const N = { C4: 261.63, E4: 329.63, G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880, B5: 987.77, C6: 1046.5, D6: 1174.66, E6: 1318.5, G6: 1567.98 };

const make = {
  blip: () => { const x = buf(0.09); note(x, N.B5, 0, 0.07, 0.6, softSquare, 0.03); return lowpass(x, 3800); },
  select: () => { const x = buf(0.2); note(x, N.G5, 0, 0.06, 0.6); note(x, N.D6, 0.06, 0.12, 0.6, softSquare, 0.05); return lowpass(x, 4200); },
  coin: () => { const x = buf(0.45); note(x, N.B5, 0, 0.07, 0.55); note(x, N.E6, 0.07, 0.36, 0.55, softSquare, 0.12); return lowpass(x, 4500); },
  // мягкий «боинг»: тон плавно опускается, без резкого «ошибка!»
  bonk: () => { const x = buf(0.42); glide(x, 330, 150, 0, 0.36, 0.8, tri); note(x, 98, 0, 0.12, 0.35, Math.sin, 0.05); return lowpass(x, 2200); },
  levelup: () => { const x = buf(0.75); [N.C5, N.E5, N.G5, N.C6].forEach((f, i) => note(x, f, i * 0.08, i === 3 ? 0.45 : 0.1, 0.5, tri, i === 3 ? 0.18 : 0.05)); [N.E5, N.G5].forEach((f) => note(x, f, 0.24, 0.45, 0.18, tri, 0.18)); return lowpass(x, 5000); },
  start: () => { const x = buf(0.8); note(x, N.G4, 0, 0.12, 0.5, tri); note(x, N.C5, 0.13, 0.12, 0.5, tri); note(x, N.E5, 0.26, 0.5, 0.5, tri, 0.2); note(x, N.C5, 0.26, 0.5, 0.2, tri, 0.2); return lowpass(x, 5000); },
  type: () => { const x = buf(0.05); noise(x, 0, 0.02, 0.9, 7, 0.9); note(x, 2600, 0, 0.012, 0.15, Math.sin, 0.006); return x; },
  tap: () => { const x = buf(0.07); note(x, 1400, 0, 0.05, 0.6, Math.sin, 0.015); noise(x, 0, 0.01, 0.2, 3, 0.8); return x; },
  send: () => { const x = buf(0.5); noise(x, 0, 0.26, 0.45, 11, 0.12); glide(x, 500, 1100, 0.04, 0.22, 0.25); note(x, N.A5, 0.27, 0.12, 0.55, Math.sin, 0.04); return lowpass(x, 6000); },
  belt: () => { const x = buf(0.18); noise(x, 0, 0.012, 1, 21, 0.95); noise(x, 0.035, 0.014, 1, 22, 0.95); note(x, 3150, 0.035, 0.03, 0.25, Math.sin, 0.01); note(x, 2100, 0.0, 0.02, 0.2, Math.sin, 0.008); return x; },
  door: () => { const x = buf(0.35); note(x, 85, 0, 0.25, 0.9, Math.sin, 0.07); noise(x, 0, 0.08, 0.5, 31, 0.08); return lowpass(x, 900); },
  chime: () => { const x = buf(1.1); note(x, N.E6, 0, 1.0, 0.5, Math.sin, 0.35); note(x, N.G6 * 1.122, 0.09, 0.9, 0.3, Math.sin, 0.3); return x; },
  whoosh: () => { const x = buf(0.55); noise(x, 0, 0.5, 0.8, 41, 0.18); return lowpass(x, 1800); },
  // мерцание пикселей: быстрая тихая арпеджио-«рябь»
  pixels: () => { const x = buf(0.62); const r = mulberry32(5); const sc = [N.C6, N.E6, N.G6, N.D6, N.A5, N.C6]; for (let i = 0; i < 14; i++) note(x, sc[Math.floor(r() * sc.length)], i * 0.035, 0.05, 0.28 * (1 - i / 16), softSquare, 0.02); return lowpass(x, 5200); },
  stamp: () => { const x = buf(0.3); note(x, 140, 0, 0.16, 0.9, Math.sin, 0.05); noise(x, 0, 0.05, 0.4, 51, 0.3); return lowpass(x, 1500); },
  check: () => { const x = buf(0.3); note(x, N.C6, 0, 0.07, 0.5, tri, 0.03); note(x, N.G6, 0.07, 0.18, 0.5, tri, 0.07); return x; },
};

for (const name of SFX_NAMES) {
  if (!make[name]) throw new Error(`Нет синтеза для ${name}`);
  save(name, make[name](), name === "door" || name === "stamp" ? -4 : -6);
}

// ---------- мелодия-петля ----------
{
  const bpm = 110;
  const beat = 60 / bpm;
  const bars = 8;
  const len = bars * 4 * beat;
  const x = buf(len);
  // аккорды: C Am F G | C Am Dm G
  const roots = [N.C4 / 2, N.A4 / 4, 174.61 / 2, N.G4 / 4, N.C4 / 2, N.A4 / 4, 146.83 / 2, N.G4 / 4];
  // мелодия: [доля от начала такта (в долях), нота, длина в долях]
  const tune = [
    [[0, N.E5, 1], [1, N.G5, 1], [2, N.C6, 1.5], [3.5, N.G5, 0.5]],
    [[0, N.A5, 1], [1, N.E5, 1], [2, N.C5, 2]],
    [[0, N.F5, 1], [1, N.A5, 1], [2, N.C6, 1], [3, N.A5, 1]],
    [[0, N.G5, 1.5], [1.5, N.B5, 0.5], [2, N.D6, 2]],
    [[0, N.E5, 1], [1, N.G5, 1], [2, N.C6, 1.5], [3.5, N.E6, 0.5]],
    [[0, N.D6, 1], [1, N.C6, 1], [2, N.A5, 2]],
    [[0, N.F5, 1], [1, N.A5, 1], [2, N.D6, 1], [3, N.C6, 1]],
    [[0, N.B5, 1], [1, N.G5, 1], [2, N.D5, 1], [3, N.G5, 1]],
  ];
  for (let b = 0; b < bars; b++) {
    const t0 = b * 4 * beat;
    for (let k = 0; k < 8; k++) note(x, roots[b] * (k % 2 ? 2 : 1), t0 + k * beat * 0.5, beat * 0.45, 0.42, tri, 0.12);
    for (const [at, f, d] of tune[b]) note(x, f, t0 + at * beat, d * beat * 0.9, 0.2, softSquare, d * beat * 0.4);
    for (let k = 0; k < 4; k++) noise(x, t0 + (k + 0.5) * beat, 0.03, 0.05, 100 + b * 4 + k, 0.9);
  }
  lowpass(x, 3200);
  save("game-loop", x, -9, "music");
}

rmSync(TMP, { recursive: true, force: true });
