// Генерирует фоновую музыку и мягкие звуковые эффекты (без вокала) кодом.
// Это оригинальные звуки проекта: их можно использовать в рекламе без
// лицензионных ограничений. Результат детерминирован (одинаков при каждом
// запуске) и сохраняется в public/audio/*.mp3.
//
// Запуск: npm run audio:music
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  SAMPLE_RATE as SR,
  mulberry32,
  normalizePeak,
  wavToMp3,
  writeWav,
} from "./lib/audio.mjs";

const OUT = "public/audio";
const TMP = join(tmpdir(), "balago-audio");
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

const midiToHz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const TAU = Math.PI * 2;

const save = (name, channels, peakDb) => {
  normalizePeak(channels, peakDb);
  const wav = join(TMP, `${name}.wav`);
  writeWav(wav, channels);
  wavToMp3(wav, join(OUT, `${name}.mp3`));
  console.log(`+ ${OUT}/${name}.mp3`);
};

// ---------- Музыка: тёплый спокойный эмбиент, 84 BPM, до мажор ----------
const music = () => {
  const duration = 25.5;
  const n = Math.round(duration * SR);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const beat = 60 / 84;
  const bar = beat * 4;

  // Cmaj7 – Am7 – Fmaj7 – G6 (MIDI-ноты)
  const chords = [
    [48, 55, 59, 64],
    [45, 52, 55, 60],
    [41, 48, 52, 57],
    [43, 50, 55, 59],
  ];
  const bars = Math.ceil(duration / bar);

  const addTone = (
    start,
    len,
    hz,
    amp,
    attack,
    release,
    harmonics,
    pan,
    detune = 0,
  ) => {
    const s0 = Math.floor(start * SR);
    const total = Math.floor((len + release) * SR);
    const gl = Math.cos(((pan + 1) * Math.PI) / 4);
    const gr = Math.sin(((pan + 1) * Math.PI) / 4);
    for (let i = 0; i < total && s0 + i < n; i++) {
      const t = i / SR;
      let env;
      if (t < attack) env = Math.sin(((t / attack) * Math.PI) / 2);
      else if (t < len) env = 1;
      else env = Math.cos((((t - len) / release) * Math.PI) / 2);
      let v = 0;
      for (const [mult, a] of harmonics)
        v += a * Math.sin(TAU * hz * mult * (1 + detune) * t);
      L[s0 + i] += v * env * amp * gl;
      R[s0 + i] += v * env * amp * gr;
    }
  };

  const addPluck = (start, hz, amp, pan) => {
    const s0 = Math.floor(start * SR);
    const len = Math.floor(1.6 * SR);
    const gl = Math.cos(((pan + 1) * Math.PI) / 4);
    const gr = Math.sin(((pan + 1) * Math.PI) / 4);
    for (let i = 0; i < len && s0 + i < n; i++) {
      const t = i / SR;
      const env = Math.min(1, t / 0.006) * Math.exp(-t / 0.42);
      const v =
        Math.sin(TAU * hz * t) +
        0.25 * Math.sin(TAU * hz * 2 * t) * Math.exp(-t / 0.15) +
        0.08 * Math.sin(TAU * hz * 3.01 * t) * Math.exp(-t / 0.08);
      L[s0 + i] += v * env * amp * gl;
      R[s0 + i] += v * env * amp * gr;
    }
  };

  for (let b = 0; b < bars; b++) {
    const chord = chords[b % chords.length];
    const t0 = b * bar;
    // мягкий пэд
    chord.forEach((m, k) => {
      const pad = [
        [1, 1],
        [2, 0.18],
        [3, 0.05],
      ];
      addTone(
        t0,
        bar,
        midiToHz(m + 12),
        0.07,
        0.9,
        0.9,
        pad,
        -0.4 + k * 0.27,
        0.0015,
      );
      addTone(
        t0,
        bar,
        midiToHz(m + 12),
        0.05,
        0.9,
        0.9,
        pad,
        0.4 - k * 0.27,
        -0.0015,
      );
    });
    // бас на 1-ю и 3-ю долю
    for (const d of [0, 2]) {
      addTone(
        t0 + d * beat,
        beat * 1.6,
        midiToHz(chord[0] - 12),
        0.16,
        0.03,
        0.5,
        [
          [1, 1],
          [2, 0.15],
        ],
        0,
      );
    }
    // «музыкальная шкатулка»: восьмые по нотам аккорда (с 2-го такта)
    if (b >= 1) {
      const pattern = [0, 2, 1, 3, 2, 1, 3, 2];
      pattern.forEach((idx, k) => {
        const hz = midiToHz(chord[idx] + 24);
        const accent = k % 2 === 0 ? 1 : 0.7;
        addPluck(
          t0 + k * (beat / 2),
          hz,
          0.05 * accent,
          k % 2 === 0 ? -0.35 : 0.35,
        );
      });
    }
  }

  // плавное начало и конец
  const fadeIn = 0.8 * SR;
  const fadeOutStart = (duration - 2.2) * SR;
  for (let i = 0; i < n; i++) {
    let g = 1;
    if (i < fadeIn) g = i / fadeIn;
    if (i > fadeOutStart) g *= Math.max(0, 1 - (i - fadeOutStart) / (2.0 * SR));
    L[i] *= g;
    R[i] *= g;
  }
  save("music", [L, R], -3);
};

// ---------- Эффекты ----------
const whoosh = () => {
  const dur = 0.75;
  const n = Math.round(dur * SR);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const rand = mulberry32(7);
  let y1 = 0;
  let y2 = 0;
  for (let i = 0; i < n; i++) {
    const p = i / n;
    const cutoff = 250 + 3200 * Math.sin(p * Math.PI) ** 2;
    const a = 1 - Math.exp((-TAU * cutoff) / SR);
    const x = rand() * 2 - 1;
    y1 += a * (x - y1);
    y2 += a * (y1 - y2); // два полюса — мягче
    const env = Math.sin(p * Math.PI) ** 1.5;
    const pan = -0.7 + 1.4 * p;
    L[i] = y2 * env * Math.cos(((pan + 1) * Math.PI) / 4);
    R[i] = y2 * env * Math.sin(((pan + 1) * Math.PI) / 4);
  }
  save("sfx-whoosh", [L, R], -6);
};

const chime = () => {
  const dur = 1.8;
  const n = Math.round(dur * SR);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const bell = (start, hz, amp, pan) => {
    const s0 = Math.floor(start * SR);
    for (let i = 0; s0 + i < n; i++) {
      const t = i / SR;
      const env = Math.min(1, t / 0.004);
      const v =
        Math.sin(TAU * hz * t) * Math.exp(-t / 0.6) +
        0.35 * Math.sin(TAU * hz * 2.76 * t) * Math.exp(-t / 0.25) +
        0.12 * Math.sin(TAU * hz * 5.4 * t) * Math.exp(-t / 0.1);
      L[s0 + i] += v * env * amp * Math.cos(((pan + 1) * Math.PI) / 4);
      R[s0 + i] += v * env * amp * Math.sin(((pan + 1) * Math.PI) / 4);
    }
  };
  bell(0, midiToHz(84), 0.6, -0.2); // C6
  bell(0.09, midiToHz(88), 0.5, 0.2); // E6
  bell(0.18, midiToHz(91), 0.45, 0); // G6
  save("sfx-chime", [L, R], -6);
};

const pop = () => {
  const dur = 0.3;
  const n = Math.round(dur * SR);
  const M = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const hz = 320 + 420 * Math.exp(-t / 0.03);
    phase += (TAU * hz) / SR;
    const env = Math.min(1, t / 0.003) * Math.exp(-t / 0.07);
    M[i] = Math.sin(phase) * env;
  }
  save("sfx-pop", [M, Float32Array.from(M)], -6);
};

music();
whoosh();
chime();
pop();
rmSync(TMP, { recursive: true, force: true });
