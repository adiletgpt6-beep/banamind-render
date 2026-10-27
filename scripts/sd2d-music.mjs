// Музыка фильма №36 «Чемодан у двери» — своя, процедурный синтез (без чужих
// дорожек и без вокала). Мягкое «фетровое» фортепиано (аддитивный синтез:
// обертоны с разным затуханием, лёгкая негармоничность струны, мягкая атака,
// две слегка расстроенные струны) и в сцене поездки — сдержанные
// акустические щипки (алгоритм Карплуса — Стронга). Небольшая комната
// (ревербератор Шрёдера). Без ударных и низких щелчков: ничто не звучит как
// шаги или тревога. Все дорожки — фа мажор, 72 уд/мин, поэтому сцены
// переходят друг в друга мягкими перекрёстными затуханиями (Sd2Audio.tsx):
//   sd2d-home.mp3    — S01–S04: тепло и любопытно, редкие ломаные аккорды;
//   sd2d-evening.mp3 — S05–S06: тише, больше пауз, спокойное сомнение;
//   sd2d-warm.mp3    — S07–S09: после решения — чуть теплее и полнее;
//   sd2d-trip.mp3    — S10–S11: лёгкое движение, щипки струн;
//   sd2d-tender.mp3  — S12–S15: самое тихое, много воздуха;
//   sd2d-end.mp3     — S16: светлое завершение (в конце плавно затихает).
// Каждая дорожка 200 с, детерминированно (mulberry32).
// Запуск: node scripts/sd2d-music.mjs
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { SAMPLE_RATE as SR, ffmpeg, mulberry32, writeWav } from "./lib/audio.mjs";

const OUT = "public/audio/suitcase-by-the-door-2d/music";
mkdirSync(OUT, { recursive: true });
const TMP = join(tmpdir(), "sd2d-music");
mkdirSync(TMP, { recursive: true });
const TAU = Math.PI * 2;
const DUR = 200;
const N = Math.round(DUR * SR);
const BEAT = 60 / 72;
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

// Фетровое фортепиано: нота длиной len (с), velocity 0…1.
const piano = (out, t0, m, len, vel, pan = 0) => {
  const f = hz(m);
  const s0 = Math.floor(t0 * SR);
  const ring = Math.min(6, 1.6 + 220 / f); // низкие звучат дольше
  const total = Math.floor((len + ring) * SR);
  const gl = Math.cos(((pan + 1) * Math.PI) / 4);
  const gr = Math.sin(((pan + 1) * Math.PI) / 4);
  const B = 0.00035;
  const parts = [];
  for (let n = 1; n <= 8; n++) {
    const fn = n * f * Math.sqrt(1 + B * n * n);
    if (fn > 6000) break;
    const amp = vel * Math.pow(n, -1.5) * (n === 1 ? 1 : 0.55 + 0.45 * vel);
    const tau = (ring / (1 + 0.7 * (n - 1))) * 0.45;
    parts.push([fn, amp, tau]);
  }
  for (let i = 0; i < total && s0 + i < N; i++) {
    const t = i / SR;
    const att = Math.min(1, t / 0.012);
    const rel = t < len ? 1 : Math.exp(-(t - len) / 0.35);
    let v = 0;
    for (const [fn, amp, tau] of parts) {
      const e = Math.exp(-t / tau);
      v += amp * e * (Math.sin(TAU * fn * t) + 0.6 * Math.sin(TAU * fn * 1.0005 * t + 0.7));
    }
    v *= att * rel * 0.5;
    out[0][s0 + i] += v * gl;
    out[1][s0 + i] += v * gr;
  }
};

// Акустический щипок (Карплус — Стронг), мягкий: короткая шумовая вспышка
// через фильтр в петле задержки.
const pluck = (out, t0, m, vel, pan, rnd) => {
  const f = hz(m);
  const P = Math.round(SR / f);
  const buf = new Float32Array(P);
  for (let i = 0; i < P; i++) buf[i] = (rnd() * 2 - 1) * vel;
  // сглаженный «палец» вместо медиатора
  for (let k = 0; k < 3; k++) for (let i = 1; i < P; i++) buf[i] = 0.5 * (buf[i] + buf[i - 1]);
  const s0 = Math.floor(t0 * SR);
  const total = Math.floor(2.4 * SR);
  const gl = Math.cos(((pan + 1) * Math.PI) / 4);
  const gr = Math.sin(((pan + 1) * Math.PI) / 4);
  let idx = 0;
  for (let i = 0; i < total && s0 + i < N; i++) {
    const a = buf[idx];
    const b = buf[(idx + 1) % P];
    const y = 0.4985 * (a + b);
    buf[idx] = y;
    idx = (idx + 1) % P;
    out[0][s0 + i] += a * gl * 0.5;
    out[1][s0 + i] += a * gr * 0.5;
  }
};

// Мягкий пэд (струнные вдалеке): медленная атака, почти без обертонов.
const pad = (out, t0, m, len, amp, pan = 0) => {
  const f = hz(m);
  const s0 = Math.floor(t0 * SR);
  const total = Math.floor((len + 2) * SR);
  const gl = Math.cos(((pan + 1) * Math.PI) / 4);
  const gr = Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < total && s0 + i < N; i++) {
    const t = i / SR;
    const env = t < 2 ? Math.sin((t / 2) * (Math.PI / 2)) ** 2 : t < len ? 1 : Math.cos(Math.min(1, (t - len) / 2) * (Math.PI / 2)) ** 2;
    const v = Math.sin(TAU * f * t) + 0.25 * Math.sin(TAU * 2 * f * t + 0.3) + 0.5 * Math.sin(TAU * f * 1.003 * t);
    out[0][s0 + i] += v * env * amp * gl;
    out[1][s0 + i] += v * env * amp * gr;
  }
};

// Небольшая комната: 4 гребенчатых + 2 всепропускающих фильтра.
const reverb = (x, mix) => {
  const combs = [1557, 1617, 1491, 1422].map((d) => ({ d, b: new Float32Array(d), i: 0 }));
  const aps = [225, 556].map((d) => ({ d, b: new Float32Array(d), i: 0 }));
  const y = new Float32Array(x.length);
  for (let n = 0; n < x.length; n++) {
    let s = 0;
    for (const c of combs) {
      const o = c.b[c.i];
      c.b[c.i] = x[n] + o * 0.78;
      c.i = (c.i + 1) % c.d;
      s += o;
    }
    s *= 0.25;
    for (const a of aps) {
      const o = a.b[a.i];
      const v = s + o * 0.5;
      a.b[a.i] = v;
      a.i = (a.i + 1) % a.d;
      s = o - v * 0.5;
    }
    y[n] = x[n] * (1 - mix) + s * mix;
  }
  return y;
};

// Аккорды фа мажора: [бас, тоны]
const F = [41, 57, 60, 65, 69];
const Dm = [38, 57, 62, 65, 69];
const Bb = [34, 58, 62, 65, 70];
const C = [36, 55, 60, 64, 67];
const Am = [45, 57, 60, 64, 69];
const Gm = [43, 55, 58, 62, 67];

const render = (name, { prog, barsPerChord = 1, style, seed, padAmp = 0, density = 1, vel = 0.5, plucks = 0 }) => {
  const out = [new Float32Array(N), new Float32Array(N)];
  const r = mulberry32(seed);
  const bar = BEAT * 4;
  const bars = Math.ceil(DUR / bar);
  for (let b = 0; b < bars; b++) {
    const t0 = b * bar;
    const ch = prog[Math.floor(b / barsPerChord) % prog.length];
    const isFirst = b % barsPerChord === 0;
    // бас (тихо, на первую долю аккорда)
    if (isFirst) piano(out, t0, ch[0] + 12, bar * barsPerChord * 0.9, vel * 0.55, -0.2);
    if (padAmp && isFirst) for (const [k, m] of ch.slice(1, 4).entries()) pad(out, t0, m, bar * barsPerChord, padAmp, (k - 1) * 0.4);
    // ломаный аккорд восьмыми/четвертями с паузами
    const steps = style === "sparse" ? 4 : 8;
    const pat = style === "sparse" ? [1, 3, 2, 4] : [1, 2, 3, 4, 3, 2, 4, 3];
    for (let k = 0; k < steps; k++) {
      if (r() > density * (k === 0 ? 1 : 0.62)) continue;
      const m = ch[pat[k] % ch.length] + (k > steps / 2 && r() < 0.3 ? 12 : 0);
      const at = t0 + k * (bar / steps) + (r() - 0.5) * 0.02;
      piano(out, at, m, bar / steps * 1.6, vel * (0.55 + 0.35 * r()) * (k === 0 ? 1 : 0.8), (r() - 0.5) * 0.6);
    }
    // редкая мелодическая нота сверху
    if (r() < 0.32 * density) piano(out, t0 + bar * (0.5 + 0.25 * Math.floor(r() * 2)), ch[2 + Math.floor(r() * 3)] + 12, bar * 0.5, vel * 0.5, 0.25);
    // щипки (поездка)
    if (plucks) {
      for (let k = 0; k < 8; k++) {
        if (k % 2 === 1 && r() < 0.45) continue;
        const m = ch[1 + ((k * 3) % 4)];
        pluck(out, t0 + k * (bar / 8), m, plucks * (k % 4 === 0 ? 1 : 0.7), k % 2 ? 0.35 : -0.35, r);
      }
    }
  }
  // комната, мягкий НЧ-фильтр, нормализация к −20 dBFS RMS, мягкое ограничение
  for (let c = 0; c < 2; c++) out[c] = reverb(out[c], 0.22);
  for (const ch of out) {
    let y = 0;
    const a = Math.exp((-TAU * 4800) / SR);
    for (let i = 0; i < ch.length; i++) {
      y = (1 - a) * ch[i] + a * y;
      ch[i] = y;
    }
  }
  let acc = 0;
  for (const ch of out) for (const v of ch) acc += v * v;
  const rms = Math.sqrt(acc / (2 * N));
  const g = Math.pow(10, -20 / 20) / (rms || 1);
  for (const ch of out) for (let i = 0; i < ch.length; i++) ch[i] = Math.tanh(ch[i] * g * 1.05) / 1.05;
  const fade = Math.round(2 * SR);
  for (const ch of out)
    for (let i = 0; i < fade; i++) {
      ch[i] *= i / fade;
      ch[N - 1 - i] *= i / fade;
    }
  const wav = join(TMP, `${name}.wav`);
  writeWav(wav, out);
  ffmpeg(["-i", wav, "-ar", String(SR), "-ac", "2", "-codec:a", "libmp3lame", "-b:a", "160k", join(OUT, `${name}.mp3`)]);
  console.log(`✓ ${name}.mp3`);
};

render("sd2d-home", { prog: [F, Dm, Bb, C], style: "broken", seed: 361, density: 0.8, vel: 0.5 });
render("sd2d-evening", { prog: [Dm, Bb, F, C], barsPerChord: 2, style: "sparse", seed: 362, density: 0.7, vel: 0.42 });
render("sd2d-warm", { prog: [Bb, F, Gm, C], style: "broken", seed: 363, density: 0.9, vel: 0.5, padAmp: 0.01 });
render("sd2d-trip", { prog: [F, C, Dm, Bb], style: "sparse", seed: 364, density: 0.75, vel: 0.42, plucks: 0.18 });
render("sd2d-tender", { prog: [F, Am, Bb, F], barsPerChord: 2, style: "sparse", seed: 365, density: 0.6, vel: 0.38 });
render("sd2d-end", { prog: [Bb, C, F, F], style: "broken", seed: 366, density: 0.85, vel: 0.48, padAmp: 0.012 });
