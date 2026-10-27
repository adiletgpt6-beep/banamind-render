// Тихая тёплая музыкальная подложка BG-049, синтезированная кодом
// (детерминированно, без сторонних сэмплов и лицензий): мягкий пэд,
// лёгкое арпеджио «щипком» и негромкий бас, ре мажор, 76 ударов в минуту.
// В ролике она звучит очень тихо и приглушается под речью (Bg49Audio.tsx).
// Запуск: node scripts/campaign50/bg-049/music.mjs → public/audio/campaign50/bg-049/music.mp3
import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  SAMPLE_RATE as SR,
  mulberry32,
  normalizePeak,
  wavToMp3,
  writeWav,
} from "./audio.mjs";

const OUT = "public/audio/campaign50/bg-049";
const TMP = join(tmpdir(), "balago-bg049-music");
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

const DURATION = 100;
const n = Math.round(DURATION * SR);
const L = new Float32Array(n);
const R = new Float32Array(n);
const TAU = Math.PI * 2;
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const beat = 60 / 76;
const bar = beat * 4;
const rand = mulberry32(49);

// Dmaj9 – Bm7 – Gmaj7 – A6sus (MIDI; первая нота — бас)
const CHORDS = [
  [38, 57, 61, 64, 66],
  [35, 54, 57, 61, 64],
  [31, 55, 59, 62, 66],
  [33, 54, 57, 62, 64],
];

const add = (i, l, r) => {
  if (i >= 0 && i < n) {
    L[i] += l;
    R[i] += r;
  }
};

// Пэд: несколько слегка расстроенных синусов с медленной атакой и спадом.
const pad = (t0, dur, midi, amp, pan) => {
  const a = Math.round(t0 * SR);
  const len = Math.round(dur * SR);
  const f = hz(midi);
  const det = [0.997, 1, 1.0035];
  for (let k = 0; k < len; k++) {
    const t = k / SR;
    const env = Math.min(1, t / 1.6) * Math.min(1, (dur - t) / 1.4);
    let v = 0;
    for (const d of det)
      v += Math.sin(TAU * f * d * t) + 0.18 * Math.sin(TAU * 2 * f * d * t);
    v *= (amp * env) / det.length;
    add(a + k, v * (1 - pan), v * (1 + pan));
  }
};

// «Щипок»: синус с затуханием и лёгкой второй гармоникой (как мягкая челеста).
const pluck = (t0, midi, amp, pan) => {
  const a = Math.round(t0 * SR);
  const len = Math.round(2.2 * SR);
  const f = hz(midi);
  for (let k = 0; k < len; k++) {
    const t = k / SR;
    const env = Math.min(1, t / 0.006) * Math.exp(-t * 2.6);
    const v =
      amp *
      env *
      (Math.sin(TAU * f * t) +
        0.25 * Math.sin(TAU * 2 * f * t) * Math.exp(-t * 6));
    add(a + k, v * (1 - pan), v * (1 + pan));
  }
};

const bass = (t0, dur, midi, amp) => {
  const a = Math.round(t0 * SR);
  const len = Math.round(dur * SR);
  const f = hz(midi);
  for (let k = 0; k < len; k++) {
    const t = k / SR;
    const env =
      Math.min(1, t / 0.08) * Math.exp(-t * 0.9) * Math.min(1, (dur - t) / 0.3);
    add(
      a + k,
      amp * env * Math.sin(TAU * f * t),
      amp * env * Math.sin(TAU * f * t),
    );
  }
};

const bars = Math.ceil(DURATION / bar);
for (let b = 0; b < bars; b++) {
  const t0 = b * bar;
  const ch = CHORDS[b % CHORDS.length];
  // пэд: тянется на такт с перекрытием
  ch.slice(1).forEach((m, i) => pad(t0, bar + 1.2, m, 0.055, (i - 2) * 0.25));
  if (b >= 1) bass(t0, bar, ch[0], 0.07);
  // арпеджио входит со второго такта, по восьмым, тихо и не на каждую долю
  if (b >= 2) {
    const notes = [
      ch[1] + 12,
      ch[3],
      ch[2] + 12,
      ch[4],
      ch[3] + 12,
      ch[2],
      ch[4] + 12,
      ch[3],
    ];
    notes.forEach((m, i) => {
      if (rand() < 0.18) return;
      const vel = 0.05 + 0.025 * rand();
      pluck(
        t0 + i * (beat / 2) + (rand() - 0.5) * 0.012,
        m,
        vel,
        (i % 2 ? 0.35 : -0.35) * rand(),
      );
    });
  }
}

// Простая «комната»: несколько отражений с затуханием (стерео).
const taps = [
  [0.113, 0.32, 0],
  [0.181, 0.26, 1],
  [0.257, 0.2, 0],
  [0.349, 0.15, 1],
  [0.461, 0.1, 0],
];
const dryL = Float32Array.from(L);
const dryR = Float32Array.from(R);
for (const [d, g, cross] of taps) {
  const off = Math.round(d * SR);
  for (let i = off; i < n; i++) {
    L[i] += g * (cross ? dryR[i - off] : dryL[i - off]);
    R[i] += g * (cross ? dryL[i - off] : dryR[i - off]);
  }
}
// мягкий вход и выход
for (let i = 0; i < n; i++) {
  const t = i / SR;
  const g = Math.min(1, t / 2) * Math.min(1, (DURATION - t) / 3);
  L[i] *= g;
  R[i] *= g;
}
normalizePeak([L, R], -3);
const wav = join(TMP, "music.wav");
writeWav(wav, [L, R]);
wavToMp3(wav, join(OUT, "music.mp3"));
console.log(`✓ ${OUT}/music.mp3 (${DURATION} с)`);
