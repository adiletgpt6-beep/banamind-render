// Генерирует фоновую музыку и мягкие звуковые эффекты (без вокала) кодом.
// Это оригинальные звуки проекта: их можно использовать в рекламе без
// лицензионных ограничений. Результат детерминирован (одинаков при каждом
// запуске) и сохраняется в public/audio/*.mp3.
//
// Запуск: npm run audio:music            — все звуки
//         npm run audio:music -- morning — только музыка и сигнал
//                                         четвёртого ролика
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

// ---------- Музыка: тёплый светлый поп-эмбиент для рекламы, 96 BPM ----------
// До мажор, I–V–vi–IV; мягкие бочка и шейкер дают ритм, но не спорят с голосом.
// Длина 31,5 с покрывает ролик до 30 с; затухание в конце делает Remotion.
const music = () => {
  const duration = 31.5;
  const n = Math.round(duration * SR);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const beat = 60 / 96;
  const bar = beat * 4;

  // Cadd9 – G/B – Am7 – Fmaj7 (MIDI-ноты; первая — бас)
  const chords = [
    [48, 55, 62, 64],
    [47, 55, 59, 62],
    [45, 52, 55, 60],
    [41, 48, 52, 57],
  ];
  const rand = mulberry32(11);

  // Мягкая бочка: синус с падающей частотой.
  const addKick = (start, amp) => {
    const s0 = Math.floor(start * SR);
    let phase = 0;
    for (let i = 0; i < 0.35 * SR && s0 + i < n; i++) {
      const t = i / SR;
      const hz = 48 + 70 * Math.exp(-t / 0.04);
      phase += (TAU * hz) / SR;
      const v = Math.sin(phase) * Math.exp(-t / 0.12) * amp;
      L[s0 + i] += v;
      R[s0 + i] += v;
    }
  };
  // Шейкер: короткий шум, слегка «отфильтрованный».
  const addShaker = (start, amp, pan) => {
    const s0 = Math.floor(start * SR);
    let y = 0;
    let prev = 0;
    const gl = Math.cos(((pan + 1) * Math.PI) / 4);
    const gr = Math.sin(((pan + 1) * Math.PI) / 4);
    for (let i = 0; i < 0.09 * SR && s0 + i < n; i++) {
      const t = i / SR;
      const x = rand() * 2 - 1;
      const hp = x - prev; // грубый high-pass
      prev = x;
      y += 0.5 * (hp - y);
      const env = Math.min(1, t / 0.004) * Math.exp(-t / 0.025);
      L[s0 + i] += y * env * amp * gl;
      R[s0 + i] += y * env * amp * gr;
    }
  };
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
    // ритм: бочка на 1 и 3, шейкер на восьмых (с 2-го такта)
    if (b >= 1) {
      for (const d of [0, 2]) addKick(t0 + d * beat, 0.32);
      for (let k = 0; k < 8; k++) {
        addShaker(
          t0 + k * (beat / 2),
          k % 2 === 1 ? 0.09 : 0.05,
          k % 2 ? 0.3 : -0.3,
        );
      }
    }
    // «музыкальная шкатулка»: восьмые по нотам аккорда — с первого такта
    {
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

  // быстрое мягкое начало и затухание в самом конце файла
  const fadeIn = 0.15 * SR;
  const fadeOutStart = (duration - 2.0) * SR;
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

// ---------- Музыка «Утро родителей» (четвёртый ролик) ----------
// Два слоя одной длины, темпа и гармонии (фа мажор, 100 BPM):
//   music-morning.mp3        — спокойная основа (пэд, бас, мягкие аккорды);
//   music-morning-rhythm.mp3 — «утренняя суета»: бочка, шейкер, тиканье
//                              часов и быстрое арпеджио.
// В ролике ритмичный слой плавно уходит, когда появляется BalaGo, —
// музыка переходит от утренней активности к спокойствию.
const morningMusic = () => {
  const duration = 31.5;
  const n = Math.round(duration * SR);
  const base = [new Float32Array(n), new Float32Array(n)];
  const rhythm = [new Float32Array(n), new Float32Array(n)];
  const beat = 60 / 100;
  const bar = beat * 4;
  const bars = Math.ceil(duration / bar);
  const rand = mulberry32(23);
  const gains = (pan) => [
    Math.cos(((pan + 1) * Math.PI) / 4),
    Math.sin(((pan + 1) * Math.PI) / 4),
  ];

  // Fmaj7 – Dm7 – B♭maj7 – Csus4/C (первая нота — бас)
  const chords = [
    [41, 57, 60, 64],
    [38, 57, 60, 65],
    [46, 57, 62, 65],
    [48, 55, 60, 65],
  ];

  const tone = (out, start, len, hz, amp, attack, release, harm, pan) => {
    const s0 = Math.floor(start * SR);
    const total = Math.floor((len + release) * SR);
    const [gl, gr] = gains(pan);
    for (let i = 0; i < total && s0 + i < n; i++) {
      const t = i / SR;
      let env;
      if (t < attack) env = Math.sin(((t / attack) * Math.PI) / 2);
      else if (t < len) env = 1;
      else env = Math.cos((((t - len) / release) * Math.PI) / 2);
      let v = 0;
      for (const [mult, a] of harm) v += a * Math.sin(TAU * hz * mult * t);
      out[0][s0 + i] += v * env * amp * gl;
      out[1][s0 + i] += v * env * amp * gr;
    }
  };
  // Мягкий «электропиано»-звук с быстрым затуханием.
  const keys = (out, start, hz, amp, pan, decay = 0.6) => {
    const s0 = Math.floor(start * SR);
    const len = Math.floor(decay * 4 * SR);
    const [gl, gr] = gains(pan);
    for (let i = 0; i < len && s0 + i < n; i++) {
      const t = i / SR;
      const env = Math.min(1, t / 0.005) * Math.exp(-t / decay);
      const v =
        Math.sin(TAU * hz * t) +
        0.3 * Math.sin(TAU * hz * 2 * t) * Math.exp(-t / 0.2) +
        0.1 * Math.sin(TAU * hz * 4.01 * t) * Math.exp(-t / 0.06);
      out[0][s0 + i] += v * env * amp * gl;
      out[1][s0 + i] += v * env * amp * gr;
    }
  };
  const kick = (start, amp) => {
    const s0 = Math.floor(start * SR);
    let phase = 0;
    for (let i = 0; i < 0.3 * SR && s0 + i < n; i++) {
      const t = i / SR;
      const hz = 50 + 80 * Math.exp(-t / 0.035);
      phase += (TAU * hz) / SR;
      const v = Math.sin(phase) * Math.exp(-t / 0.1) * amp;
      rhythm[0][s0 + i] += v;
      rhythm[1][s0 + i] += v;
    }
  };
  const shaker = (start, amp, pan) => {
    const s0 = Math.floor(start * SR);
    const [gl, gr] = gains(pan);
    let y = 0;
    let prev = 0;
    for (let i = 0; i < 0.08 * SR && s0 + i < n; i++) {
      const t = i / SR;
      const x = rand() * 2 - 1;
      const hp = x - prev;
      prev = x;
      y += 0.5 * (hp - y);
      const env = Math.min(1, t / 0.004) * Math.exp(-t / 0.022);
      rhythm[0][s0 + i] += y * env * amp * gl;
      rhythm[1][s0 + i] += y * env * amp * gr;
    }
  };
  // «Тик-так» часов: короткий деревянный щелчок.
  const tick = (start, hz, amp, pan) => {
    const s0 = Math.floor(start * SR);
    const [gl, gr] = gains(pan);
    for (let i = 0; i < 0.05 * SR && s0 + i < n; i++) {
      const t = i / SR;
      const env = Math.min(1, t / 0.001) * Math.exp(-t / 0.012);
      const v = Math.sin(TAU * hz * t) + 0.4 * Math.sin(TAU * hz * 2.3 * t);
      rhythm[0][s0 + i] += v * env * amp * gl;
      rhythm[1][s0 + i] += v * env * amp * gr;
    }
  };

  for (let b = 0; b < bars; b++) {
    const chord = chords[b % chords.length];
    const t0 = b * bar;
    // основа: пэд
    chord.slice(1).forEach((m, k) => {
      tone(
        base,
        t0,
        bar,
        midiToHz(m),
        0.06,
        1.0,
        1.0,
        [
          [1, 1],
          [2, 0.12],
        ],
        -0.3 + k * 0.3,
      );
    });
    // основа: бас на 1-ю и 3-ю долю
    for (const d of [0, 2]) {
      tone(
        base,
        t0 + d * beat,
        beat * 1.5,
        midiToHz(chord[0]),
        0.15,
        0.03,
        0.45,
        [
          [1, 1],
          [2, 0.2],
        ],
        0,
      );
    }
    // основа: мягкие аккорды на каждую долю
    for (let d = 0; d < 4; d++) {
      chord.slice(1).forEach((m, k) => {
        keys(base, t0 + d * beat, midiToHz(m + 12), 0.03, -0.2 + k * 0.2);
      });
    }
    // ритм: бочка на каждую долю, шейкер на восьмых, тиканье часов
    for (let d = 0; d < 4; d++) kick(t0 + d * beat, 0.3);
    for (let k = 0; k < 8; k++) {
      shaker(t0 + k * (beat / 2), k % 2 ? 0.09 : 0.05, k % 2 ? 0.35 : -0.35);
      tick(t0 + k * (beat / 2), k % 2 ? 1900 : 2500, 0.05, k % 2 ? 0.5 : -0.5);
    }
    // ритм: быстрое арпеджио шестнадцатыми — «суета»
    const pattern = [1, 2, 3, 2, 1, 3, 2, 3];
    for (let k = 0; k < 16; k++) {
      const m = chord[pattern[k % pattern.length]] + 24;
      keys(
        rhythm,
        t0 + k * (beat / 4),
        midiToHz(m),
        k % 4 === 0 ? 0.045 : 0.03,
        k % 2 ? 0.4 : -0.4,
        0.18,
      );
    }
  }

  // общая громкость обоих слоёв (один коэффициент — баланс сохраняется)
  const fadeIn = 0.1 * SR;
  const fadeOutStart = (duration - 2.0) * SR;
  let peak = 0;
  for (let c = 0; c < 2; c++) {
    for (let i = 0; i < n; i++) {
      let g = 1;
      if (i < fadeIn) g = i / fadeIn;
      if (i > fadeOutStart)
        g *= Math.max(0, 1 - (i - fadeOutStart) / (2.0 * SR));
      base[c][i] *= g;
      rhythm[c][i] *= g;
      peak = Math.max(peak, Math.abs(base[c][i] + rhythm[c][i]));
    }
  }
  const gain = Math.pow(10, -3 / 20) / peak;
  for (const ch of [...base, ...rhythm])
    for (let i = 0; i < n; i++) ch[i] *= gain;
  for (const [name, channels] of [
    ["music-morning", base],
    ["music-morning-rhythm", rhythm],
  ]) {
    const wav = join(TMP, `${name}.wav`);
    writeWav(wav, channels);
    wavToMp3(wav, join(OUT, `${name}.mp3`));
    console.log(`+ ${OUT}/${name}.mp3`);
  }
};

// Мягкий сигнал будильника: «бип-бип … бип-бип», без резкого звона.
const alarm = () => {
  const dur = 0.8;
  const n = Math.round(dur * SR);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const beep = (start, hz, pan) => {
    const s0 = Math.floor(start * SR);
    const len = 0.085;
    const [gl, gr] = [
      Math.cos(((pan + 1) * Math.PI) / 4),
      Math.sin(((pan + 1) * Math.PI) / 4),
    ];
    for (let i = 0; i < (len + 0.03) * SR && s0 + i < n; i++) {
      const t = i / SR;
      const env =
        Math.min(1, t / 0.006) *
        (t < len ? 1 : Math.max(0, 1 - (t - len) / 0.03));
      const v = Math.sin(TAU * hz * t) + 0.18 * Math.sin(TAU * hz * 2 * t);
      L[s0 + i] += v * env * gl;
      R[s0 + i] += v * env * gr;
    }
  };
  beep(0, 1568, -0.15); // G6
  beep(0.13, 1568, 0.15);
  beep(0.42, 1760, -0.15); // A6
  beep(0.55, 1760, 0.15);
  save("sfx-alarm", [L, R], -8);
};

const only = process.argv[2];
if (only !== "morning") {
  music();
  whoosh();
  chime();
  pop();
}
morningMusic();
alarm();
rmSync(TMP, { recursive: true, force: true });
