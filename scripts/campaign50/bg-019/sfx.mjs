// Звуки колокольчика BalaGoBG019 (детерминированный синтез, без API):
//   bell-hand-0/1 — живой ручной школьный колокольчик (удар язычка),
//   bell-soft-0…4 — мягкий звон на возрастающих нотах (ритм дней недели,
//                   переходы между мирами) — без резкой атаки,
//   chime-logo    — колокольчик превращается в тёплый звук логотипа.
// Модель колокола: затухающие негармонические парциалы (hum, prime,
// tierce, quint, nominal …), у высоких — короче затухание.
//
// Запуск: node scripts/campaign50/bg-019/sfx.mjs
import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SAMPLE_RATE as SR, ffmpeg, writeWav } from "../../lib/audio.mjs";
import { BG19_VIDEO } from "../../../src/campaign50/bg-019/script.ts";

const OUT = join("public", BG19_VIDEO.sfxDir);
const TMP = join(tmpdir(), "balago-bg019-sfx");
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

// детерминированный шум
let seed = 12345;
const rnd = () => {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648 - 0.5;
};

const PARTIALS = [
  [0.5, 0.35, 1.0],
  [1.0, 1.0, 0.75],
  [1.19, 0.45, 0.55],
  [1.5, 0.3, 0.45],
  [2.0, 0.55, 0.38],
  [2.52, 0.22, 0.26],
  [2.66, 0.16, 0.22],
  [3.01, 0.12, 0.18],
  [4.16, 0.06, 0.12],
];

// Один удар колокола: f0 — основной тон, decay — с, bright — доля высоких,
// attack — с (мягкость), strike — громкость щелчка язычка.
const strike = (len, f0, { decay = 1.4, bright = 1, attack = 0.002, strike: click = 0.25, detune = 0.0025 } = {}) => {
  const n = Math.round(len * SR);
  const out = new Float32Array(n);
  PARTIALS.forEach(([ratio, amp, dk], k) => {
    const a = amp * (k > 3 ? bright : 1);
    const f = f0 * ratio;
    const d = decay * dk;
    const ph = k * 1.3;
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const env = Math.min(1, t / attack) * Math.exp(-t / d);
      // лёгкие биения (колокол чуть несимметричен)
      out[i] += a * env * Math.sin(2 * Math.PI * f * t + ph) * (1 + 0.15 * Math.sin(2 * Math.PI * f * detune * t));
    }
  });
  // щелчок язычка: короткий шум с высоким тоном
  for (let i = 0; i < Math.min(n, Math.round(0.012 * SR)); i++) {
    const t = i / SR;
    out[i] += click * rnd() * Math.exp(-t / 0.003);
  }
  return out;
};

const mix = (len, parts) => {
  const out = new Float32Array(Math.round(len * SR));
  for (const [at, buf, g] of parts) {
    const o = Math.round(at * SR);
    for (let i = 0; i < buf.length && o + i < out.length; i++) out[o + i] += buf[i] * g;
  }
  return out;
};

const normalize = (buf, peakDb) => {
  let p = 0;
  for (const v of buf) p = Math.max(p, Math.abs(v));
  const g = Math.pow(10, peakDb / 20) / (p || 1);
  for (let i = 0; i < buf.length; i++) buf[i] *= g;
  // мягкое затухание в конце
  const fo = Math.round(0.05 * SR);
  for (let i = 0; i < fo; i++) buf[buf.length - 1 - i] *= i / fo;
  return buf;
};

const save = (name, buf, filter = "") => {
  const wav = join(TMP, `${name}.wav`);
  writeWav(wav, [buf, buf]);
  ffmpeg(["-i", wav, ...(filter ? ["-af", filter] : []), "-ar", String(SR), "-ac", "2", "-codec:a", "libmp3lame", "-b:a", "192k", join(OUT, `${name}.mp3`)]);
  console.log(`✓ ${name}.mp3`);
};

// Живой ручной колокольчик: два варианта удара (чуть разный тон).
save("bell-hand-0", normalize(strike(1.6, 1318, { decay: 1.1, bright: 0.9, strike: 0.3 }), -4), "highpass=f=180");
save("bell-hand-1", normalize(strike(1.6, 1302, { decay: 1.0, bright: 0.85, strike: 0.26 }), -4.5), "highpass=f=180");

// Мягкий звон: пентатоника вверх (до, ре, ми, соль, ля), мягкая атака.
const SOFT = [784, 880, 988, 1175, 1319];
SOFT.forEach((f0, i) => {
  save(`bell-soft-${i}`, normalize(strike(1.8, f0, { decay: 1.2, bright: 0.45, attack: 0.012, strike: 0 }), -6), "lowpass=f=6500");
});

// Логотип: мягкий колокольчик (соль) → тёплый аккорд (до-ми-соль) с пэдом.
{
  const len = 3.2;
  const pad = new Float32Array(Math.round(len * SR));
  for (const [f, g] of [[523.25, 0.3], [659.25, 0.22], [783.99, 0.2], [261.63, 0.25]]) {
    for (let i = 0; i < pad.length; i++) {
      const t = i / SR;
      const env = Math.min(1, Math.max(0, (t - 0.18) / 0.35)) * Math.exp(-Math.max(0, t - 0.5) / 1.2);
      pad[i] += g * env * (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(4 * Math.PI * f * t));
    }
  }
  const buf = mix(len, [
    [0, strike(2.6, 784, { decay: 1.4, bright: 0.5, attack: 0.008, strike: 0.05 }), 0.9],
    [0.2, strike(2.8, 1046.5, { decay: 1.6, bright: 0.4, attack: 0.01, strike: 0 }), 0.7],
    [0, pad, 0.5],
  ]);
  save("chime-logo", normalize(buf, -5), "lowpass=f=7000");
}
