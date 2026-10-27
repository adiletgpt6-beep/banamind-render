// Музыка и звуковые эффекты BalaGoBG010 — синтез кодом, детерминированно
// (оригинальные звуки проекта, без лицензионных ограничений).
//   music-focus.mp3 — сосредоточенная работа: мягкое электропиано,
//                     тихий пульс (хук, звонок);
//   music-low.mp3   — та же гармония, приглушённо, без ритма (возвращение,
//                     раздумье);
//   music-warm.mp3  — светлее, тёплый ритм (BalaGo и финал).
// Все слои: 92 BPM, си минор / ре мажор, одинаковая сетка — переходы
// между ними незаметны. Эффекты: клавиши, обрыв нити, сбой, вибрация
// телефона, ключи.
// Запуск: node scripts/campaign50/bg-010/music.mjs
import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SAMPLE_RATE as SR, mulberry32, normalizePeak, wavToMp3, writeWav } from "./audio.mjs";

const OUT = "public/audio/campaign50/bg-010";
const TMP = join(tmpdir(), "balago-bg010-music");
mkdirSync(join(OUT, "sfx"), { recursive: true });
mkdirSync(TMP, { recursive: true });

const TAU = Math.PI * 2;
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const BPM = 92;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const LEN = 100; // с

const save = (name, ch, peakDb, dir = OUT) => {
  normalizePeak(ch, peakDb);
  const wav = join(TMP, `${name}.wav`);
  writeWav(wav, ch);
  wavToMp3(wav, join(dir, `${name}.mp3`));
  console.log(`+ ${dir}/${name}.mp3`);
};

const stereo = (sec) => [new Float32Array(Math.ceil(sec * SR)), new Float32Array(Math.ceil(sec * SR))];

// Электропиано: несколько гармоник с разным затуханием.
const epiano = (L, R, t0, midi, vel, dur, pan = 0) => {
  const f = hz(midi);
  const n = Math.min(L.length, Math.floor((t0 + dur + 1.2) * SR));
  for (let i = Math.floor(t0 * SR); i < n; i++) {
    const t = i / SR - t0;
    const env = Math.min(1, t / 0.006) * Math.exp(-t * 2.2) * (t > dur ? Math.exp(-(t - dur) * 6) : 1);
    const v = vel * env * (Math.sin(TAU * f * t) + 0.35 * Math.exp(-t * 6) * Math.sin(TAU * 2 * f * t) + 0.12 * Math.exp(-t * 12) * Math.sin(TAU * 3.01 * f * t) + 0.08 * Math.sin(TAU * f * 1.003 * t));
    L[i] += v * (1 - pan) * 0.5;
    R[i] += v * (1 + pan) * 0.5;
  }
};

// Мягкий пэд: медленная атака, лёгкое биение.
const pad = (L, R, t0, midis, vel, dur) => {
  const n = Math.min(L.length, Math.floor((t0 + dur + 1.5) * SR));
  for (let i = Math.max(0, Math.floor(t0 * SR)); i < n; i++) {
    const t = i / SR - t0;
    const env = Math.min(1, t / 0.9) * (t > dur ? Math.exp(-(t - dur) * 2.5) : 1);
    let l = 0;
    let r = 0;
    for (const m of midis) {
      const f = hz(m);
      l += Math.sin(TAU * f * t) + 0.25 * Math.sin(TAU * 2 * f * 0.998 * t);
      r += Math.sin(TAU * f * 1.002 * t) + 0.25 * Math.sin(TAU * 2 * f * t);
    }
    L[i] += (vel * env * l) / midis.length;
    R[i] += (vel * env * r) / midis.length;
  }
};

const bass = (L, R, t0, midi, vel, dur) => {
  const f = hz(midi);
  const n = Math.min(L.length, Math.floor((t0 + dur + 0.3) * SR));
  for (let i = Math.floor(t0 * SR); i < n; i++) {
    const t = i / SR - t0;
    const env = Math.min(1, t / 0.02) * Math.exp(-t * 1.2) * (t > dur ? Math.exp(-(t - dur) * 12) : 1);
    const v = vel * env * (Math.sin(TAU * f * t) + 0.2 * Math.sin(TAU * 2 * f * t));
    L[i] += v;
    R[i] += v;
  }
};

const kick = (L, R, t0, vel) => {
  for (let i = Math.floor(t0 * SR), e = Math.min(L.length, i + Math.floor(0.3 * SR)); i < e; i++) {
    const t = i / SR - t0;
    const v = vel * Math.exp(-t * 14) * Math.sin(TAU * (48 * t + 60 * (1 - Math.exp(-t * 30)) / 30));
    L[i] += v;
    R[i] += v;
  }
};

const hat = (L, R, t0, vel, rnd, pan = 0.2) => {
  let prev = 0;
  for (let i = Math.floor(t0 * SR), e = Math.min(L.length, i + Math.floor(0.06 * SR)); i < e; i++) {
    const t = i / SR - t0;
    const w = rnd() * 2 - 1;
    const hp = w - prev;
    prev = w;
    const v = vel * Math.exp(-t * 70) * hp;
    L[i] += v * (1 - pan);
    R[i] += v * (1 + pan);
  }
};

// Аккорды (midi): Bm – G – D – A, по 2 такта.
const PROG = [
  { root: 47, notes: [59, 62, 66, 69] },
  { root: 43, notes: [55, 59, 62, 66] },
  { root: 50, notes: [57, 62, 66, 69] },
  { root: 45, notes: [57, 61, 64, 69] },
];
const WARM = [PROG[2], PROG[3], PROG[0], PROG[1]];

const track = (name, kind) => {
  const [L, R] = stereo(LEN);
  const rnd = mulberry32(kind.length * 977);
  const prog = kind === "warm" ? WARM : PROG;
  for (let bar = 0; bar * BAR < LEN; bar++) {
    const ch = prog[Math.floor(bar / 2) % prog.length];
    const t = bar * BAR;
    pad(L, R, t, ch.notes, kind === "low" ? 0.09 : 0.06, BAR * 0.98);
    bass(L, R, t, ch.root - 12, kind === "low" ? 0.12 : 0.18, BAR * 0.9);
    if (kind !== "low") {
      // арпеджио электропиано на восьмых
      const pat = kind === "warm" ? [0, 2, 1, 3, 2, 1, 3, 2] : [0, 1, 2, 1, 3, 1, 2, 1];
      for (let k = 0; k < 8; k++) {
        if (kind === "focus" && k % 2 === 1 && rnd() < 0.35) continue;
        const m = ch.notes[pat[k]] + 12;
        epiano(L, R, t + k * (BEAT / 2), m, (k % 2 ? 0.07 : 0.1) * (kind === "warm" ? 1.1 : 1), BEAT * 0.45, k % 2 ? 0.35 : -0.35);
      }
      for (let b = 0; b < 4; b++) {
        if (kind === "warm" || b % 2 === 0) kick(L, R, t + b * BEAT, kind === "warm" ? 0.2 : 0.12);
        hat(L, R, t + b * BEAT + BEAT / 2, kind === "warm" ? 0.05 : 0.035, rnd);
      }
    } else {
      // редкие ноты сверху
      epiano(L, R, t + BEAT, ch.notes[2] + 12, 0.05, BEAT * 1.5, 0.3);
      epiano(L, R, t + BEAT * 3, ch.notes[1] + 12, 0.04, BEAT * 1.5, -0.3);
    }
  }
  // мягкий хвост
  for (let i = 0; i < L.length; i++) {
    const tt = i / SR;
    const g = Math.min(1, tt / 0.5) * Math.min(1, (LEN - tt) / 2);
    L[i] *= g;
    R[i] *= g;
  }
  save(name, [L, R], -3);
};

track("music-focus", "focus");
track("music-low", "low");
track("music-warm", "warm");

// ---------- эффекты ----------
const SFX = join(OUT, "sfx");
const mono = (sec, fn) => {
  const a = new Float32Array(Math.ceil(sec * SR));
  for (let i = 0; i < a.length; i++) a[i] = fn(i / SR, i);
  return [a, a.slice()];
};
// клавиши ноутбука: короткие мягкие щелчки (4 варианта)
for (let k = 0; k < 4; k++) {
  const rnd = mulberry32(31 + k);
  const f0 = 1800 + k * 260;
  save(`key-${k}`, mono(0.07, (t) => Math.exp(-t * 90) * (0.6 * (rnd() * 2 - 1) + Math.sin(TAU * f0 * t)) * 0.8), -12, SFX);
}
// обрыв нити: резкий «щелчок ленты» и падающий тон
{
  const rnd = mulberry32(7);
  save("snap", mono(0.5, (t) => Math.exp(-t * 40) * (rnd() * 2 - 1) * 0.8 + Math.exp(-t * 7) * Math.sin(TAU * (900 * t - 700 * t * t)) * 0.5), -6, SFX);
}
// цифровой сбой: короткие отрывистые тоны
{
  save("glitch", mono(0.35, (t) => (Math.floor(t * 40) % 2 ? 1 : 0.3) * Math.exp(-t * 6) * Math.sign(Math.sin(TAU * (300 + 500 * (Math.floor(t * 25) % 3)) * t)) * 0.25), -10, SFX);
}
// вибрация телефона: 2 импульса по 0,35 с
save("buzz", mono(1.1, (t) => {
  const on = (t % 0.55) < 0.35 ? 1 : 0;
  return on * Math.sin(TAU * 150 * t) * (0.6 + 0.4 * Math.sin(TAU * 20 * t)) * 0.6;
}), -10, SFX);
// ключи: несколько металлических звонов
{
  const parts = [0, 0.05, 0.11, 0.16];
  save("keys", mono(0.6, (t) => parts.reduce((s, p, j) => (t >= p ? s + Math.exp(-(t - p) * 25) * Math.sin(TAU * (3200 + j * 410) * (t - p)) * 0.4 : s), 0)), -10, SFX);
}
