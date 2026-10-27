// Звуки BalaGoBG042 (детерминированный синтез, без API и чужих сэмплов):
//   news-sting — короткая заставка шуточных новостей: три восходящих
//                «медных» удара и финальный аккорд до мажор (в тональности
//                музыки проекта music-story-*, 92 BPM) с мягким литавровым
//                ударом и лёгким блеском сверху;
//   stinger    — шторка телевыпуска: мягкий «вжух» (фильтрованный шум)
//                и короткий аккорд в середине;
//   tv-off     — выключение старого телевизора: щелчок и нисходящий тихий
//                тон, без резкого шума.
// Результат сохраняется в public/audio/campaign50/bg-042/sfx/*.mp3.
//   node scripts/campaign50/bg-042/sfx.mjs
import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SAMPLE_RATE as SR, mulberry32, normalizePeak, wavToMp3, writeWav } from "../../lib/audio.mjs";
import { SFX_DIR } from "./common.mjs";

const TMP = join(tmpdir(), "balago-bg042-sfx");
mkdirSync(SFX_DIR, { recursive: true });
mkdirSync(TMP, { recursive: true });
const TAU = Math.PI * 2;
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const rnd = mulberry32(4242);

const buf = (sec) => [new Float32Array(Math.round(sec * SR)), new Float32Array(Math.round(sec * SR))];

// «Медный» синтезированный тон: гармоники с яркостью, падающей во времени,
// лёгкое вибрато, атака attack с, спад decay с, панорама pan (−1…1).
const brass = (out, t0, len, f, amp, { attack = 0.012, decay = 0.35, pan = 0, bright = 1 } = {}) => {
  const s0 = Math.round(t0 * SR);
  const n = Math.round(len * SR);
  const gl = Math.cos(((pan + 1) * Math.PI) / 4);
  const gr = Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < n && s0 + i < out[0].length; i++) {
    const t = i / SR;
    const env = Math.min(1, t / attack) * Math.exp(-t / decay) * (i > n - 400 ? (n - i) / 400 : 1);
    const vib = 1 + 0.003 * Math.sin(TAU * 5.5 * t) * Math.min(1, t / 0.15);
    let v = 0;
    for (let h = 1; h <= 9; h++) {
      const a = Math.pow(h, -1.1) * Math.exp(-((h - 1) * t) / (0.25 * bright));
      v += a * Math.sin(TAU * f * h * vib * t + h * 0.7);
    }
    out[0][s0 + i] += v * env * amp * gl;
    out[1][s0 + i] += v * env * amp * gr;
  }
};

// Литавра: синус с падением высоты и шумовой атакой.
const timpani = (out, t0, f, amp) => {
  const s0 = Math.round(t0 * SR);
  const n = Math.round(1.4 * SR);
  let ph = 0;
  for (let i = 0; i < n && s0 + i < out[0].length; i++) {
    const t = i / SR;
    const fr = f * (1 + 0.25 * Math.exp(-t / 0.03));
    ph += (TAU * fr) / SR;
    const v = Math.sin(ph) * Math.exp(-t / 0.45) + (rnd() - 0.5) * 0.25 * Math.exp(-t / 0.012);
    out[0][s0 + i] += v * amp;
    out[1][s0 + i] += v * amp;
  }
};

// Блеск: высокие короткие «колокольчики».
const sparkle = (out, t0, f, amp, pan) => {
  const s0 = Math.round(t0 * SR);
  const n = Math.round(0.9 * SR);
  const gl = Math.cos(((pan + 1) * Math.PI) / 4);
  const gr = Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < n && s0 + i < out[0].length; i++) {
    const t = i / SR;
    const v = (Math.sin(TAU * f * t) + 0.3 * Math.sin(TAU * f * 2.76 * t)) * Math.exp(-t / 0.25) * Math.min(1, t / 0.003);
    out[0][s0 + i] += v * amp * gl;
    out[1][s0 + i] += v * amp * gr;
  }
};

// Фильтрованный шум со сменой яркости (вжух), однополюсный ФНЧ.
const whoosh = (out, t0, len, amp, from, to) => {
  const s0 = Math.round(t0 * SR);
  const n = Math.round(len * SR);
  let lp = 0;
  let lp2 = 0;
  for (let i = 0; i < n && s0 + i < out[0].length; i++) {
    const u = i / n;
    const cut = from + (to - from) * Math.sin((Math.PI * u) / 2);
    const k = 1 - Math.exp((-TAU * cut) / SR);
    lp += k * (rnd() - 0.5 - lp);
    lp2 += k * (lp - lp2);
    const env = Math.sin(Math.PI * u) ** 1.6;
    const pan = -0.8 + 1.6 * u;
    out[0][s0 + i] += lp2 * env * amp * Math.cos(((pan + 1) * Math.PI) / 4) * 4;
    out[1][s0 + i] += lp2 * env * amp * Math.sin(((pan + 1) * Math.PI) / 4) * 4;
  }
};

const save = (name, ch, peakDb) => {
  normalizePeak(ch, peakDb);
  const wav = join(TMP, `${name}.wav`);
  writeWav(wav, ch);
  wavToMp3(wav, join(SFX_DIR, `${name}.mp3`));
  console.log(`+ ${SFX_DIR}/${name}.mp3`);
};

// ---------- заставка новостей (≈2,6 с) ----------
{
  const o = buf(2.6);
  const beat = 60 / 92 / 2; // восьмая при 92 BPM
  // G4 – C5 – E5 удары и финальный аккорд C5 E5 G5 C6
  [67, 72, 76].forEach((m, i) => {
    brass(o, 0.02 + i * beat, 0.3, hz(m), 0.32, { decay: 0.12, pan: -0.3 + i * 0.3 });
    brass(o, 0.02 + i * beat, 0.3, hz(m - 12), 0.16, { decay: 0.12 });
  });
  const tf = 0.02 + 3 * beat;
  [72, 76, 79, 84].forEach((m, i) => brass(o, tf, 2.1, hz(m), 0.22, { decay: 0.8, pan: -0.45 + i * 0.3, attack: 0.02 }));
  brass(o, tf, 2.1, hz(48), 0.28, { decay: 0.9, attack: 0.02, bright: 0.6 });
  timpani(o, tf, hz(36), 0.55);
  [96, 100, 103].forEach((m, i) => sparkle(o, tf + 0.08 + i * 0.07, hz(m), 0.05, -0.5 + i * 0.5));
  save("news-sting", o, -3);
}

// ---------- шторка (≈0,9 с) ----------
{
  const o = buf(0.95);
  whoosh(o, 0, 0.9, 0.5, 300, 5200);
  [72, 76, 79].forEach((m, i) => brass(o, 0.42, 0.5, hz(m), 0.1, { decay: 0.16, pan: -0.3 + i * 0.3 }));
  save("stinger", o, -6);
}

// ---------- выключение телевизора (≈0,6 с) ----------
{
  const o = buf(0.6);
  const n = o[0].length;
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = 900 * Math.exp(-t / 0.09) + 140;
    ph += (TAU * f) / SR;
    const v = Math.sin(ph) * Math.exp(-t / 0.16) * Math.min(1, t / 0.004) * 0.5 + (i < 220 ? (rnd() - 0.5) * (1 - i / 220) * 0.6 : 0);
    o[0][i] += v;
    o[1][i] += v;
  }
  save("tv-off", o, -8);
}
