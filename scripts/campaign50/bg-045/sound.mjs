// Музыка и мягкие эффекты BalaGoBG045 — синтез кодом (без API и лицензий),
// детерминированно. Результат: public/audio/campaign50/bg-045/.
//
//   music-mirror.mp3 — «зеркальный» слой (хук, два понедельника, решение,
//                      условия): воздушный пэд, тихое тиканье часов,
//                      редкие «стеклянные» ноты;
//   music-warm.mp3   — тёплый слой той же гармонии и темпа (условный
//                      пример, финал): пэд, арпеджио, мягкая бочка.
//   sfx/*.mp3        — зеркальный блик, вибрация телефона, касания,
//                      крышка ноутбука, печать, шаги, отправка сообщения,
//                      машина, штамп, всплывающие плашки, колокольчик логотипа.
// Громкость слоёв и приглушение под речью задаёт Remotion (Bg45Audio.tsx).
//
// Запуск: node scripts/campaign50/bg-045/sound.mjs
import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BG45_VIDEO } from "../../../src/campaign50/bg-045/script.ts";
import { SAMPLE_RATE as SR, mulberry32, normalizePeak, wavToMp3, writeWav } from "./audio.mjs";

const OUT = join("public", BG45_VIDEO.audioDir);
const SFX = join(OUT, "sfx");
const TMP = join(tmpdir(), "balago-bg045-sound");
mkdirSync(SFX, { recursive: true });
mkdirSync(TMP, { recursive: true });

const TAU = Math.PI * 2;
const midiToHz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const rand = mulberry32(4545);
const noise = () => rand() * 2 - 1;

const saveStereo = (path, L, R, peakDb) => {
  normalizePeak([L, R], peakDb);
  const wav = join(TMP, `${path.replace(/\W+/g, "_")}.wav`);
  writeWav(wav, [L, R]);
  wavToMp3(wav, path);
  console.log(`+ ${path}`);
};
const saveMono = (name, buf, peakDb) => saveStereo(join(SFX, `${name}.mp3`), buf, Float32Array.from(buf), peakDb);

// ---------- музыка ----------
const music = () => {
  const duration = 100;
  const n = Math.round(duration * SR);
  const stems = { mirror: [new Float32Array(n), new Float32Array(n)], warm: [new Float32Array(n), new Float32Array(n)] };
  const beat = 60 / 92;
  const bar = beat * 4;
  const bars = Math.ceil(duration / bar);
  const gains = (pan) => [Math.cos(((pan + 1) * Math.PI) / 4), Math.sin(((pan + 1) * Math.PI) / 4)];
  // Cmaj7 – Am7 – Fmaj7 – G6 (первая нота — бас)
  const chords = [
    [36, 55, 59, 64],
    [33, 55, 60, 64],
    [29, 57, 60, 64],
    [31, 55, 59, 64],
  ];
  const tone = (out, start, len, hz, amp, attack, release, harm, pan) => {
    const s0 = Math.floor(start * SR);
    const total = Math.floor((len + release) * SR);
    const [gl, gr] = gains(pan);
    for (let i = 0; i < total && s0 + i < n; i++) {
      const t = i / SR;
      const env = t < attack ? Math.sin(((t / attack) * Math.PI) / 2) : t < len ? 1 : Math.cos((((t - len) / release) * Math.PI) / 2);
      let v = 0;
      for (const [mult, a] of harm) v += a * Math.sin(TAU * hz * mult * t);
      out[0][s0 + i] += v * env * amp * gl;
      out[1][s0 + i] += v * env * amp * gr;
    }
  };
  const glass = (out, start, hz, amp, pan, decay) => {
    const s0 = Math.floor(start * SR);
    const len = Math.floor(decay * 5 * SR);
    const [gl, gr] = gains(pan);
    for (let i = 0; i < len && s0 + i < n; i++) {
      const t = i / SR;
      const env = Math.min(1, t / 0.006) * Math.exp(-t / decay);
      const v = Math.sin(TAU * hz * t) + 0.35 * Math.sin(TAU * hz * 2.76 * t) * Math.exp(-t / 0.3) + 0.12 * Math.sin(TAU * hz * 5.4 * t) * Math.exp(-t / 0.08);
      out[0][s0 + i] += v * env * amp * gl;
      out[1][s0 + i] += v * env * amp * gr;
    }
  };
  const tick = (out, start, amp, pan) => {
    const s0 = Math.floor(start * SR);
    const [gl, gr] = gains(pan);
    for (let i = 0; i < 0.025 * SR && s0 + i < n; i++) {
      const t = i / SR;
      const v = (Math.sin(TAU * 2600 * t) * 0.6 + 0.4 * noise()) * Math.exp(-t / 0.005);
      out[0][s0 + i] += v * amp * gl;
      out[1][s0 + i] += v * amp * gr;
    }
  };
  const kick = (out, start, amp) => {
    const s0 = Math.floor(start * SR);
    let ph = 0;
    for (let i = 0; i < 0.3 * SR && s0 + i < n; i++) {
      const t = i / SR;
      ph += (TAU * (46 + 60 * Math.exp(-t / 0.035))) / SR;
      const v = Math.sin(ph) * Math.exp(-t / 0.1) * amp;
      out[0][s0 + i] += v;
      out[1][s0 + i] += v;
    }
  };
  const soft = [
    [1, 1],
    [2, 0.1],
  ];
  for (let b = 0; b < bars; b++) {
    const ch = chords[b % 4];
    const t0 = b * bar;
    const M = stems.mirror;
    const W = stems.warm;
    // зеркальный слой: пэд, бас, тиканье (как часы в офисе), стеклянные ноты
    ch.slice(1).forEach((m, k) => tone(M, t0, bar, midiToHz(m), 0.034, 1.4, 1.5, soft, -0.5 + k * 0.5));
    tone(M, t0, bar, midiToHz(ch[0] + 12), 0.05, 0.6, 1.0, soft, 0);
    for (let k = 0; k < 4; k++) tick(M, t0 + k * beat, k % 2 ? 0.025 : 0.035, k % 2 ? 0.45 : -0.45);
    glass(M, t0 + 0.5 * beat, midiToHz(ch[3] + 12), 0.045, -0.4, 0.5);
    glass(M, t0 + 2.5 * beat, midiToHz(ch[2] + 12), 0.04, 0.4, 0.5);
    // тёплый слой: пэд в октаву, арпеджио, мягкая бочка
    ch.slice(1).forEach((m, k) => {
      tone(W, t0, bar, midiToHz(m), 0.036, 1.0, 1.2, soft, -0.45 + k * 0.45);
      tone(W, t0, bar, midiToHz(m + 12), 0.012, 1.2, 1.2, soft, 0.45 - k * 0.45);
    });
    for (const d of [0, 2]) tone(W, t0 + d * beat, beat * 1.6, midiToHz(ch[0] + 12), 0.1, 0.03, 0.5, soft, 0);
    [1, 2, 3, 2, 3, 2, 1, 2].forEach((idx, k) => glass(W, t0 + k * (beat / 2), midiToHz(ch[idx] + 12), 0.03, k % 2 ? 0.45 : -0.45, 0.22));
    for (const d of [0, 2]) kick(W, t0 + d * beat, 0.16);
  }
  for (const k of Object.keys(stems)) {
    const [L, R] = stems[k];
    const fade = 3 * SR;
    for (let i = 0; i < n; i++) {
      const g = Math.min(1, i / (0.3 * SR)) * Math.min(1, (n - i) / fade);
      L[i] *= g;
      R[i] *= g;
    }
    saveStereo(join(OUT, `music-${k}.mp3`), L, R, -4);
  }
};

// ---------- эффекты ----------
const buf = (sec) => new Float32Array(Math.round(sec * SR));
const lowpass = (b, a) => {
  let y = 0;
  for (let i = 0; i < b.length; i++) {
    y += a * (b[i] - y);
    b[i] = y;
  }
  return b;
};

// зеркальный блик: восходящий шум + стеклянные колокольчики
const shimmer = () => {
  const b = buf(1.6);
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    const env = Math.sin(Math.PI * Math.min(1, t / 0.9)) * Math.exp(-Math.max(0, t - 0.9) / 0.3);
    b[i] += noise() * env * 0.18;
  }
  lowpass(b, 0.25);
  [1568, 2093, 2637, 3136].forEach((hz, k) => {
    const s0 = Math.round((0.12 + k * 0.09) * SR);
    for (let i = 0; s0 + i < b.length; i++) {
      const t = i / SR;
      b[s0 + i] += 0.22 * Math.sin(TAU * hz * t) * Math.min(1, t / 0.004) * Math.exp(-t / 0.45);
    }
  });
  return b;
};

// вибрация телефона на столе: 2 жужжания по 0,35 с
const buzz = () => {
  const b = buf(1.1);
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    const on = (t < 0.35 || (t > 0.55 && t < 0.9)) ? 1 : 0;
    const env = on * Math.min(1, (t % 0.55) / 0.02);
    b[i] = env * (Math.sin(TAU * 165 * t) * 0.6 + Math.sin(TAU * 330 * t) * 0.25 + noise() * 0.12) * (0.75 + 0.25 * Math.sin(TAU * 28 * t));
  }
  return lowpass(b, 0.4);
};

// касание экрана / клавиши
const tap = () => {
  const b = buf(0.12);
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    b[i] = (Math.sin(TAU * 1300 * t) * 0.5 + noise() * 0.5) * Math.exp(-t / 0.012);
  }
  return lowpass(b, 0.5);
};

// крышка ноутбука: мягкий глухой стук
const lid = () => {
  const b = buf(0.35);
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    b[i] = (Math.sin(TAU * 120 * t) * 0.8 + noise() * 0.4) * Math.exp(-t / 0.05);
  }
  return lowpass(b, 0.2);
};

// печать на клавиатуре: серия тихих щелчков (детерминированный ритм)
const typing = () => {
  const b = buf(3.2);
  let t0 = 0.02;
  while (t0 < 3.0) {
    const s0 = Math.round(t0 * SR);
    const hz = 1800 + rand() * 900;
    for (let i = 0; i < 0.03 * SR && s0 + i < b.length; i++) {
      const t = i / SR;
      b[s0 + i] += (Math.sin(TAU * hz * t) * 0.3 + noise() * 0.7) * Math.exp(-t / 0.006) * (0.6 + 0.4 * rand());
    }
    t0 += 0.09 + rand() * 0.12;
  }
  return lowpass(b, 0.55);
};

// мягкий шаг
const step = (k) => {
  const b = buf(0.18);
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    b[i] = (noise() * 0.8 + Math.sin(TAU * (90 + k * 8) * t) * 0.6) * Math.exp(-t / 0.035);
  }
  return lowpass(b, 0.12 + k * 0.02);
};

// отправка сообщения: короткий восходящий «свист»
const send = () => {
  const b = buf(0.45);
  let ph = 0;
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    ph += (TAU * (600 + 1400 * (t / 0.45))) / SR;
    b[i] = Math.sin(ph) * Math.sin(Math.PI * Math.min(1, t / 0.45)) * 0.5 + noise() * 0.08 * Math.exp(-t / 0.1);
  }
  return b;
};

// всплывающая плашка: мягкий «поп»
const pop = () => {
  const b = buf(0.2);
  let ph = 0;
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    ph += (TAU * (320 + 500 * Math.exp(-t / 0.03))) / SR;
    b[i] = Math.sin(ph) * Math.exp(-t / 0.05);
  }
  return b;
};

// штамп: глухой удар с лёгким шорохом бумаги
const stamp = () => {
  const b = buf(0.4);
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    b[i] = Math.sin(TAU * 95 * t) * Math.exp(-t / 0.06) * 0.9 + noise() * 0.3 * Math.exp(-t / 0.03);
  }
  return lowpass(b, 0.25);
};

// машина: мягкое нарастание и уход (фильтрованный шум + гул мотора)
const car = () => {
  const b = buf(2.4);
  let ph = 0;
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    const env = Math.sin(Math.PI * Math.min(1, t / 2.4)) ** 1.5;
    ph += (TAU * (70 + 30 * (t / 2.4))) / SR;
    b[i] = (Math.sin(ph) * 0.5 + noise() * 0.35) * env;
  }
  return lowpass(b, 0.08);
};

// переход: мягкий взмах
const whoosh = () => {
  const b = buf(0.7);
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    b[i] = noise() * Math.sin(Math.PI * Math.min(1, t / 0.7)) ** 2;
  }
  return lowpass(b, 0.15);
};

// колокольчик логотипа: две ноты и тёплый аккорд
const chime = () => {
  const b = buf(3);
  const note = (at, hz, amp, dec) => {
    const s0 = Math.round(at * SR);
    for (let i = 0; s0 + i < b.length; i++) {
      const t = i / SR;
      b[s0 + i] += amp * Math.min(1, t / 0.008) * Math.exp(-t / dec) * (Math.sin(TAU * hz * t) + 0.3 * Math.sin(TAU * hz * 2.01 * t) * Math.exp(-t / 0.4));
    }
  };
  note(0, 784, 0.6, 1.2);
  note(0.18, 1046.5, 0.5, 1.4);
  [523.25, 659.25, 783.99].forEach((hz) => note(0.3, hz, 0.18, 1.6));
  return b;
};

music();
saveMono("shimmer", shimmer(), -6);
saveMono("buzz", buzz(), -8);
saveMono("tap", tap(), -8);
saveMono("lid", lid(), -7);
saveMono("typing", typing(), -10);
[0, 1, 2, 3].forEach((k) => saveMono(`step-${k}`, step(k), -9));
saveMono("send", send(), -9);
saveMono("pop", pop(), -9);
saveMono("stamp", stamp(), -7);
saveMono("car", car(), -8);
saveMono("whoosh", whoosh(), -9);
saveMono("chime", chime(), -6);
