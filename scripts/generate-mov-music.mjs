// Музыка и звуки быта фильма №33 «Мама на старом видео» — синтез кодом
// (оригинальные звуки проекта, детерминированы: одинаковы при каждом
// запуске). Результат — public/audio/moms-old-video/music/*.mp3 и sfx/*.mp3.
//
// Слои музыки одной гармонии и темпа (88 BPM, фа мажор,
// Fmaj7 – Am7 – Dm7 – B♭maj7), поэтому сводятся и сменяются плавно:
//   warm     — основной тёплый слой: мягкий пэд, электропиано-арпеджио, бас;
//              без ударных, не спорит с речью;
//   pulse    — тот же материал + мягкая бочка, шейкер и пульс баса:
//              немного более ясный ритм для танцевальных моментов;
//   memory   — «музыкальная шкатулка» (колокольчики) — старая запись и
//              воспоминания;
//   oldphone — танцевальная музыка старой записи «из динамика телефона»:
//              узкая полоса частот, лёгкое «плавание» высоты.
// Эффекты: касание экрана, сдвиг стула, молния сумки, тихие аплодисменты
// зала на старой записи, мягкий щелчок ремня, «вжух» графики.
//
// Запуск: npm run audio:music:moms-old-video
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { SAMPLE_RATE as SR, ffmpeg, mulberry32, normalizePeak, writeWav } from "./lib/audio.mjs";

const OUT = "public/audio/moms-old-video";
const TMP = join(tmpdir(), "balago-mov33-music");
mkdirSync(join(OUT, "music"), { recursive: true });
mkdirSync(join(OUT, "sfx"), { recursive: true });
mkdirSync(TMP, { recursive: true });
const TAU = Math.PI * 2;
const midiToHz = (m) => 440 * Math.pow(2, (m - 69) / 12);

const save = (path, channels, peakDb, af) => {
  normalizePeak(channels, peakDb);
  const wav = join(TMP, `${path.replace(/\W+/g, "-")}.wav`);
  writeWav(wav, channels);
  ffmpeg(["-i", wav, ...(af ? ["-af", af] : []), "-codec:a", "libmp3lame", "-b:a", "192k", join(OUT, path)]);
  rmSync(wav);
  console.log(`+ ${OUT}/${path}`);
};

// ---------- музыка ----------
const DUR = 165;
const BPM = 88;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const N = Math.round(DUR * SR);
// аккорды (первая нота — бас)
const CHORDS = [
  [41, 53, 57, 60, 64], // Fmaj7
  [45, 52, 55, 60, 64], // Am7
  [38, 50, 53, 57, 60], // Dm7
  [46, 50, 53, 57, 62], // B♭maj7
];
const chordAt = (bar) => CHORDS[bar % 4];

const track = () => [new Float32Array(N), new Float32Array(N)];
const pan2 = (pan) => [Math.cos(((pan + 1) * Math.PI) / 4), Math.sin(((pan + 1) * Math.PI) / 4)];

const tone = (T, start, len, hz, amp, { attack = 0.02, release = 0.4, harm = [[1, 1]], pan = 0, detune = 0, decay = 0, vib = 0 } = {}) => {
  const [L, R] = T;
  const s0 = Math.floor(start * SR);
  const total = Math.floor((len + release) * SR);
  const [gl, gr] = pan2(pan);
  let ph = 0;
  for (let i = 0; i < total && s0 + i < N; i++) {
    if (s0 + i < 0) continue;
    const t = i / SR;
    let env = t < attack ? Math.sin(((t / attack) * Math.PI) / 2) : t < len ? 1 : Math.cos((((t - len) / release) * Math.PI) / 2);
    if (decay) env *= Math.exp(-t / decay);
    ph += (TAU * hz * (1 + detune + vib * Math.sin(TAU * 5.2 * t))) / SR;
    let v = 0;
    for (const [m, a] of harm) v += a * Math.sin(ph * m);
    L[s0 + i] += v * env * amp * gl;
    R[s0 + i] += v * env * amp * gr;
  }
};

const addPad = (T, amp) => {
  const bars = Math.ceil(DUR / BAR);
  for (let b = 0; b < bars; b++) {
    const ch = chordAt(b);
    ch.slice(1).forEach((m, k) => {
      for (const d of [-0.0025, 0.0025]) tone(T, b * BAR, BAR, midiToHz(m), amp * 0.12, { attack: 0.9, release: 1.2, harm: [[1, 1], [2, 0.18], [3, 0.05]], pan: (k - 1.5) * 0.35 + d * 60, detune: d });
    });
  }
};
const addBass = (T, amp, pulse) => {
  const bars = Math.ceil(DUR / BAR);
  for (let b = 0; b < bars; b++) {
    const root = midiToHz(chordAt(b)[0] - 12);
    if (pulse) for (let q = 0; q < 8; q++) tone(T, b * BAR + q * (BEAT / 2), BEAT * 0.38, root, amp * (q % 2 ? 0.55 : 0.85), { attack: 0.008, release: 0.08, harm: [[1, 1], [2, 0.3]] });
    else tone(T, b * BAR, BAR * 0.92, root, amp, { attack: 0.08, release: 0.5, harm: [[1, 1], [2, 0.25]] });
  }
};
const addKeys = (T, amp, rand) => {
  // электропиано: мягкое арпеджио восьмыми, кое-где пропуски — «дыхание»
  const bars = Math.ceil(DUR / BAR);
  const pattern = [1, 2, 3, 4, 3, 2, 3, 1];
  for (let b = 0; b < bars; b++) {
    const ch = chordAt(b);
    for (let q = 0; q < 8; q++) {
      if ((b % 8 === 7 && q > 3) || (q === 5 && rand() < 0.35)) continue;
      const m = ch[pattern[q]] + 12;
      tone(T, b * BAR + q * (BEAT / 2) + rand() * 0.008, BEAT * 0.4, midiToHz(m), amp * (q % 2 ? 0.7 : 1) * (0.85 + 0.3 * rand()), {
        attack: 0.006,
        release: 0.9,
        decay: 0.55,
        harm: [[1, 1], [2, 0.32], [3, 0.1], [4, 0.05]],
        pan: (q % 2 ? 0.25 : -0.25),
      });
    }
  }
};
const addBells = (T, amp, rand) => {
  // колокольчики: мелодия по тонам аккорда, четверти с паузами
  const bars = Math.ceil(DUR / BAR);
  const melody = [4, 3, 2, 3, 4, 2, 1, 2];
  for (let b = 0; b < bars; b++) {
    const ch = chordAt(b);
    for (let q = 0; q < 4; q++) {
      if ((q === 3 && b % 2) || rand() < 0.12) continue;
      const m = ch[melody[(b * 4 + q) % 8]] + 24;
      tone(T, b * BAR + q * BEAT + rand() * 0.01, 0.05, midiToHz(m), amp, { attack: 0.002, release: 1.6, decay: 0.8, harm: [[1, 1], [2.76, 0.28], [5.4, 0.08]], pan: (rand() - 0.5) * 0.8 });
    }
  }
};
const addDrums = (T, amp, rand) => {
  const [L, R] = T;
  const kick = (start, a) => {
    const s0 = Math.floor(start * SR);
    let ph = 0;
    for (let i = 0; i < 0.32 * SR && s0 + i < N; i++) {
      const t = i / SR;
      ph += (TAU * (46 + 60 * Math.exp(-t / 0.035))) / SR;
      const v = Math.sin(ph) * Math.exp(-t / 0.11) * a;
      L[s0 + i] += v;
      R[s0 + i] += v;
    }
  };
  const shaker = (start, a, pan) => {
    const s0 = Math.floor(start * SR);
    const [gl, gr] = pan2(pan);
    let prev = 0;
    let y = 0;
    for (let i = 0; i < 0.08 * SR && s0 + i < N; i++) {
      const t = i / SR;
      const x = rand() * 2 - 1;
      const hp = x - prev;
      prev = x;
      y += 0.5 * (hp - y);
      const env = Math.min(1, t / 0.004) * Math.exp(-t / 0.022);
      L[s0 + i] += y * env * a * gl;
      R[s0 + i] += y * env * a * gr;
    }
  };
  const bars = Math.ceil(DUR / BAR);
  for (let b = 0; b < bars; b++) {
    kick(b * BAR, amp);
    kick(b * BAR + 2 * BEAT, amp * 0.8);
    if (b % 2) kick(b * BAR + 3.5 * BEAT, amp * 0.45);
    for (let q = 0; q < 8; q++) shaker(b * BAR + q * (BEAT / 2), amp * (q % 2 ? 0.16 : 0.1), q % 2 ? 0.3 : -0.2);
  }
};
const fadeEdges = (T) => {
  for (const ch of T) {
    for (let i = 0; i < SR * 0.05; i++) ch[i] *= i / (SR * 0.05);
    for (let i = 0; i < SR * 2; i++) ch[N - 1 - i] *= i / (SR * 2);
  }
};

const music = () => {
  {
    const T = track();
    const rand = mulberry32(331);
    addPad(T, 1);
    addBass(T, 0.22, false);
    addKeys(T, 0.12, rand);
    fadeEdges(T);
    save("music/warm.mp3", T, -3);
  }
  {
    const T = track();
    const rand = mulberry32(332);
    addPad(T, 0.8);
    addBass(T, 0.2, true);
    addKeys(T, 0.12, rand);
    addDrums(T, 0.42, mulberry32(333));
    fadeEdges(T);
    save("music/pulse.mp3", T, -3);
  }
  {
    const T = track();
    addPad(T, 0.55);
    addBells(T, 0.16, mulberry32(334));
    fadeEdges(T);
    save("music/memory.mp3", T, -3);
  }
  {
    // старая запись: та же танцевальная музыка из динамика телефона
    const T = track();
    const rand = mulberry32(335);
    addBass(T, 0.25, true);
    addKeys(T, 0.16, rand);
    addBells(T, 0.08, mulberry32(336));
    addDrums(T, 0.5, mulberry32(337));
    fadeEdges(T);
    save("music/oldphone.mp3", T, -4, "highpass=f=320,lowpass=f=3400,vibrato=f=0.6:d=0.0025,acompressor=threshold=-18dB:ratio=3");
  }
};

// ---------- эффекты ----------
const sfx = (name, dur, fn, peak = -6) => {
  const n = Math.round(dur * SR);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  fn(L, R, n);
  for (const ch of [L, R]) for (let i = 0; i < Math.min(n, SR * 0.004); i++) ch[n - 1 - i] *= i / (SR * 0.004);
  save(`sfx/${name}.mp3`, [L, R], peak);
};

const effects = () => {
  // мягкое касание экрана
  sfx("tap", 0.12, (L, R, n) => {
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const v = Math.sin(TAU * 1700 * t) * Math.exp(-t / 0.012) * 0.6 + Math.sin(TAU * 600 * t) * Math.exp(-t / 0.02) * 0.4;
      L[i] = R[i] = v;
    }
  });
  // стул сдвигается по полу: низкий фильтрованный шум с «дрожью»
  sfx("chair", 0.62, (L, R, n) => {
    const rand = mulberry32(41);
    let y = 0;
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const x = rand() * 2 - 1;
      y += 0.04 * (x - y);
      const env = Math.min(1, t / 0.05) * Math.max(0, 1 - t / 0.62) * (0.7 + 0.3 * Math.sin(TAU * 38 * t));
      L[i] = R[i] = y * env * 3;
    }
  }, -10);
  // молния сумки: быстрые щелчки с нарастанием частоты
  sfx("zip", 0.7, (L, R, n) => {
    const rand = mulberry32(42);
    for (let k = 0; k < 46; k++) {
      const t0 = 0.05 + 0.58 * Math.pow(k / 46, 0.85);
      const s0 = Math.floor(t0 * SR);
      for (let i = 0; i < 0.006 * SR && s0 + i < n; i++) {
        const v = (rand() * 2 - 1) * Math.exp(-i / (0.0012 * SR)) * (0.6 + 0.4 * rand());
        L[s0 + i] += v;
        R[s0 + i] += v * 0.9;
      }
    }
  }, -12);
  // тихие аплодисменты зала (старая запись)
  sfx("applause", 3.2, (L, R, n) => {
    const rand = mulberry32(43);
    for (let k = 0; k < 900; k++) {
      const t0 = rand() * 3.0;
      const s0 = Math.floor(t0 * SR);
      const a = (0.3 + 0.7 * rand()) * Math.min(1, t0 / 0.3) * Math.max(0, 1 - Math.max(0, t0 - 2.2) / 0.8);
      const pan = rand() * 2 - 1;
      const [gl, gr] = pan2(pan);
      let prev = 0;
      for (let i = 0; i < 0.012 * SR && s0 + i < n; i++) {
        const x = rand() * 2 - 1;
        const hp = x - prev;
        prev = x;
        const v = hp * Math.exp(-i / (0.0025 * SR)) * a;
        L[s0 + i] += v * gl;
        R[s0 + i] += v * gr;
      }
    }
  }, -14);
  // мягкий «вжух» для графического перехода
  sfx("swoosh", 0.55, (L, R, n) => {
    const rand = mulberry32(44);
    let y = 0;
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const k = 0.02 + 0.25 * Math.sin((Math.PI * t) / 0.55);
      y += k * ((rand() * 2 - 1) - y);
      const env = Math.sin((Math.PI * t) / 0.55) ** 2;
      L[i] = y * env * (1 - t / 0.55 * 0.6);
      R[i] = y * env * (0.4 + t / 0.55 * 0.6);
    }
  }, -16);
  // тёплый колокольчик финала
  sfx("chime", 1.6, (L, R, n) => {
    for (const [m, d, a] of [[77, 0, 1], [81, 0.09, 0.8], [84, 0.18, 0.7]]) {
      const hz = midiToHz(m);
      const s0 = Math.floor(d * SR);
      for (let i = 0; s0 + i < n; i++) {
        const t = i / SR;
        const v = (Math.sin(TAU * hz * t) + 0.25 * Math.sin(TAU * hz * 2.76 * t)) * Math.exp(-t / 0.45) * a;
        L[s0 + i] += v;
        R[s0 + i] += v;
      }
    }
  }, -10);
};

const only = process.argv[2];
if (!only || only === "music") music();
if (!only || only === "sfx") effects();
