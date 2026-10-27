// Музыка и UI-звуки LIVE-005, синтезированные кодом (без сэмплов и чужих
// треков — можно использовать в рекламе без лицензий). Детерминированно,
// результат в public/audio/live/live005/.
//
// Характер — ночной город, тёплый lo-fi без вокала (иной тембр и ритм, чем
// поп-эмбиент LIVE-004): электропиано (FM, «родес»), мягкий саб, ленивые
// барабаны со свингом. 82,6 BPM: такт 2,9055 с — ровно 6 тактов до склейки
// 17,433 с, где начинается решение BalaGo.
//   0–17,43 с  — вопрос и сомнения: ре минор (Dm9 – B♭maj7 – Gm9 – A7sus4);
//   17,43 с–   — решение: фа мажор (Fmaj9 – C/E – Dm9 – B♭maj9), светлый колокольчик;
//   с 30,7 с   — «Биз дайыма кызматтабыз»: разрежение, последний аккорд звенит.
// Под речью Remotion приглушает музыку (см. композицию), поэтому партия
// держится в середине и не спорит с голосом (ФНЧ, мало высоких).
//
//   node scripts/live-videos/live005-sound.mjs [music|sfx]
import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SAMPLE_RATE as SR, mulberry32, normalizePeak, wavToMp3, writeWav } from "../lib/audio.mjs";

const OUT = "public/audio/live/live005";
const TMP = join(tmpdir(), "balago-live005-sound");
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

const TAU = Math.PI * 2;
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const SOLUTION = 17.433;
const BAR = SOLUTION / 6;
const BEAT = BAR / 4;
const OUTRO = 30.7;
const LENGTH = 36;

const save = (name, channels, peakDb) => {
  normalizePeak(channels, peakDb);
  const wav = join(TMP, `${name}.wav`);
  writeWav(wav, channels);
  wavToMp3(wav, join(OUT, `${name}.mp3`));
  rmSync(wav);
  console.log(`+ ${OUT}/${name}.mp3`);
};

const stereo = (sec) => {
  const n = Math.round(sec * SR);
  return [new Float32Array(n), new Float32Array(n)];
};
const panGains = (pan) => [Math.cos(((pan + 1) * Math.PI) / 4), Math.sin(((pan + 1) * Math.PI) / 4)];
const lowpass = (cut) => {
  const a = 1 - Math.exp((-TAU * cut) / SR);
  let y = 0;
  return (x) => (y += a * (x - y));
};

// ---------------------------------------------------------------- музыка
const music = () => {
  const [L, R] = stereo(LENGTH);
  const n = L.length;
  const rand = mulberry32(505);
  const add = (i, v, pan = 0) => {
    if (i < 0 || i >= n) return;
    const [gl, gr] = panGains(pan);
    L[i] += v * gl;
    R[i] += v * gr;
  };

  // Электропиано: FM (носитель + модулятор 1:1 с быстро гаснущим индексом),
  // лёгкое тремоло — тёплый «родес».
  const ep = (start, m, len, amp, pan) => {
    const s0 = Math.floor(start * SR);
    const f = hz(m);
    const total = Math.floor((len + 1.2) * SR);
    for (let i = 0; i < total; i++) {
      const t = i / SR;
      const env = Math.min(1, t / 0.006) * Math.exp(-t / 1.6) * (t > len ? Math.max(0, 1 - (t - len) / 1.2) : 1);
      const idx = 1.6 * Math.exp(-t / 0.25) + 0.25;
      const v = Math.sin(TAU * f * t + idx * Math.sin(TAU * f * t)) * (1 + 0.12 * Math.sin(TAU * 4.6 * t));
      add(s0 + i, v * env * amp, pan);
    }
  };
  const chord = (start, notes, len, amp, strum = 0.018) =>
    notes.forEach((m, k) => ep(start + k * strum, m, len, amp, (k / (notes.length - 1)) * 0.8 - 0.4));

  // Саб-бас: синус с мягкой сатурацией.
  const bass = (start, len, m, amp) => {
    const s0 = Math.floor(start * SR);
    const f = hz(m);
    for (let i = 0; i < (len + 0.1) * SR; i++) {
      const t = i / SR;
      const env = Math.min(1, t / 0.015) * (t > len ? Math.max(0, 1 - (t - len) / 0.1) : 1);
      add(s0 + i, Math.tanh(1.4 * Math.sin(TAU * f * t)) * env * amp);
    }
  };

  // Мягкие барабаны: глухая бочка, «римшот» с телом, шуршащие хэты со свингом.
  const kick = (start, amp) => {
    const s0 = Math.floor(start * SR);
    let ph = 0;
    for (let i = 0; i < 0.35 * SR; i++) {
      const t = i / SR;
      ph += (TAU * (44 + 60 * Math.exp(-t / 0.03))) / SR;
      add(s0 + i, Math.sin(ph) * Math.exp(-t / 0.13) * amp);
    }
  };
  const noise = (start, len, amp, cut, pan, attack, decay) => {
    const s0 = Math.floor(start * SR);
    const lp = lowpass(cut);
    let prev = 0;
    for (let i = 0; i < len * SR; i++) {
      const t = i / SR;
      const x = rand() * 2 - 1;
      const hp = x - prev;
      prev = x;
      add(s0 + i, lp(hp) * Math.min(1, t / attack) * Math.exp(-t / decay) * amp, pan);
    }
  };
  const rim = (start, amp) => {
    noise(start, 0.12, amp, 2600, 0.1, 0.001, 0.035);
    const s0 = Math.floor(start * SR);
    for (let i = 0; i < 0.1 * SR; i++) {
      const t = i / SR;
      add(s0 + i, Math.sin(TAU * 330 * t) * Math.exp(-t / 0.025) * amp * 0.5, 0.1);
    }
  };
  // Колокольчик (решение): чистый синус + негармонический обертон.
  const bell = (start, m, amp, pan) => {
    const s0 = Math.floor(start * SR);
    const f = hz(m);
    for (let i = 0; i < 1.8 * SR; i++) {
      const t = i / SR;
      const env = Math.min(1, t / 0.003) * Math.exp(-t / 0.7);
      add(s0 + i, (Math.sin(TAU * f * t) + 0.25 * Math.sin(TAU * f * 2.76 * t) * Math.exp(-t / 0.2)) * env * amp, pan);
    }
  };

  const minor = [
    { bass: 38, ch: [53, 57, 60, 64] }, // Dm9 (F A C E)
    { bass: 34, ch: [50, 53, 57, 62] }, // B♭maj7 (D F A D)
    { bass: 43, ch: [50, 53, 57, 58] }, // Gm9 (D F A B♭)
    { bass: 45, ch: [52, 55, 57, 62] }, // A7sus4 (E G A D)
  ];
  const major = [
    { bass: 41, ch: [55, 57, 60, 64] }, // Fmaj9 (G A C E)
    { bass: 40, ch: [55, 60, 64, 67] }, // C/E
    { bass: 38, ch: [53, 57, 60, 64] }, // Dm9
    { bass: 46, ch: [57, 60, 62, 65] }, // B♭maj9 (A C D F)
  ];

  const swing = BEAT * 0.17;
  const bars = Math.ceil(LENGTH / BAR);
  for (let b = 0; b < bars; b++) {
    const t0 = b * BAR;
    const sol = t0 >= SOLUTION - 0.01;
    const outro = t0 >= OUTRO - 0.01;
    const c = (sol ? major : minor)[b % 4];
    // аккорды: на «раз» и синкопа на «и-три»
    chord(t0, c.ch, BAR * 0.45, sol ? 0.05 : 0.044);
    if (!outro) chord(t0 + BEAT * 2.5, c.ch.slice(1), BAR * 0.4, sol ? 0.034 : 0.03, 0.012);
    // бас
    if (b >= 1 && !outro) {
      bass(t0, BEAT * 1.4, c.bass - 12, 0.15);
      bass(t0 + BEAT * 2.5, BEAT * 0.9, c.bass - 12 + (sol ? 7 : 0), 0.12);
    }
    // барабаны с 2-го такта; в финале — только бочка на «раз»
    if (b >= 1) {
      kick(t0, 0.42);
      if (!outro) {
        kick(t0 + BEAT * 2.5, 0.3);
        rim(t0 + BEAT, 0.16);
        rim(t0 + BEAT * 3, 0.16);
        for (let s = 0; s < 8; s++) noise(t0 + (s * BEAT) / 2 + (s % 2 ? swing : 0), 0.06, s % 2 ? 0.026 : 0.04, 7500, s % 2 ? 0.35 : -0.35, 0.002, 0.014);
      }
    }
    // решение: мелодия колокольчика (фа мажорная пентатоника)
    if (sol && !outro) {
      const mel = [[0, 77], [1.5, 81], [2.5, 79], [3.25, 76]];
      for (const [q, m] of mel) bell(t0 + q * BEAT, m - (b % 2 ? 2 : 0), 0.035, q > 2 ? 0.3 : -0.3);
    }
  }
  // переход к решению: мягкий обратный «вдох» шума за полтакта
  {
    const s0 = Math.floor((SOLUTION - 1.1) * SR);
    const lp = lowpass(1500);
    for (let i = 0; i < 1.1 * SR; i++) {
      const k = i / SR / 1.1;
      add(s0 + i, lp(rand() * 2 - 1) * k * k * 0.12);
    }
  }
  const fade = Math.floor(2.5 * SR);
  for (let i = 0; i < fade; i++) {
    L[n - 1 - i] *= i / fade;
    R[n - 1 - i] *= i / fade;
  }
  save("music", [L, R], -3);
};

// ---------------------------------------------------------------- UI-звуки
const sfx = (name, sec, fill, peakDb) => {
  const [L, R] = stereo(sec);
  fill(L, R);
  save(`sfx-${name}`, [L, R], peakDb);
};
const tone = (L, R, start, len, f0, f1, amp, attack, decay, pan = 0) => {
  const [gl, gr] = panGains(pan);
  let ph = 0;
  const s0 = Math.floor(start * SR);
  for (let i = 0; i < len * SR && s0 + i < L.length; i++) {
    const t = i / SR;
    ph += (TAU * f0 * Math.pow(f1 / f0, Math.min(1, t / len))) / SR;
    const v = Math.sin(ph) * Math.min(1, t / attack) * Math.exp(-t / decay) * amp;
    L[s0 + i] += v * gl;
    R[s0 + i] += v * gr;
  }
};

const sounds = () => {
  // мягкое «касание» — появление карточки/варианта (дерево, без щелчка)
  sfx("tap", 0.3, (L, R) => {
    tone(L, R, 0, 0.2, 760, 700, 0.7, 0.002, 0.045);
    tone(L, R, 0, 0.2, 1520, 1500, 0.15, 0.002, 0.02);
  }, -12);
  // часы «три» — два мягких удара колокола (хук «Саат үчтө»)
  sfx("clock", 1.4, (L, R) => {
    tone(L, R, 0, 1.2, hz(74), hz(74), 0.6, 0.003, 0.5, -0.15);
    tone(L, R, 0, 1.2, hz(74) * 2.76, hz(74) * 2.76, 0.12, 0.003, 0.15, -0.15);
  }, -11);
  // светлое «сияние» под BalaGo (мажорный аккорд-арпеджио, мягкая атака)
  sfx("shine", 1.2, (L, R) => {
    [77, 81, 84, 88].forEach((m, k) => tone(L, R, k * 0.06, 0.9, hz(m), hz(m), 0.4, 0.01, 0.35, (k - 1.5) * 0.3));
  }, -11);
  // «плюх» номера — тёплый двойной тон без резкости (WhatsApp)
  sfx("chime", 0.8, (L, R) => {
    tone(L, R, 0, 0.5, hz(81), hz(81), 0.55, 0.004, 0.2, -0.2);
    tone(L, R, 0.08, 0.55, hz(88), hz(88), 0.5, 0.004, 0.24, 0.2);
  }, -11);
};

const only = process.argv[2];
if (!only || only === "music") music();
if (!only || only === "sfx") sounds();
