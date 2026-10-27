// Музыка BG-043 «Сүйлөгөн сааттар»: лёгкая игривая «часовая» подложка,
// синтезированная кодом (без сэмплов и сторонних треков — оригинальный
// звук проекта, без лицензионных ограничений). Детерминированно.
//
// До мажор, 100 BPM, 4/4, 40 тактов (≈ 99 с — длиннее ролика; ролик сам
// плавно уводит музыку в конце, Bg43Audio.tsx):
//   • мелодия — мягкая маримба (аддитивный синтез, мягкий молоточек);
//   • бас и арпеджио — пиццикато (Karplus–Strong);
//   • тёплый пэд — расстроенные волны с мягким верхом, медленная атака;
//   • очень тихие «тик-так» деревянной коробочки на каждую долю и
//     мягкий удар на сильные доли; колокольчики на начале частей.
// Форма: вступление (2) → A (8) → A′ (8, + арпеджио) → B (8) →
// A″ (8, + колокольчики) → кода (6). Гармония: C–Am–F–G, C–Am–Dm7–G7,
// F–G–Em–Am, F–G–C–C.
// Стерео 44,1 кГц, пик ≤ −6 дБFS, MP3 128 кбит/с →
// public/audio/campaign50/bg-043/music.mp3
// Запуск: node scripts/campaign50/bg-043/music.mjs
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { BG43_VIDEO } from "../../../src/campaign50/bg-043/script.ts";
import { Biquad, SR, TAU, addClick, addMode, encodeMp3, midiHz, mulberry32, normalize, peakDb } from "./dsp.mjs";

const OUT = join("public", BG43_VIDEO.audioDir, "music.mp3");
const BPM = 100;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;
const TAIL = 3.0;

// ---------- гармония и форма ----------
// Аккорды: бас (MIDI) и голоса пэда/арпеджио.
const CH = {
  C: { bass: 36, fifth: 43, tones: [60, 64, 67] },
  Am: { bass: 45, fifth: 40, tones: [57, 60, 64] },
  F: { bass: 41, fifth: 48, tones: [57, 60, 65] },
  G: { bass: 43, fifth: 38, tones: [55, 59, 62] },
  G7: { bass: 43, fifth: 38, tones: [53, 59, 62] },
  Dm7: { bass: 38, fifth: 45, tones: [53, 57, 60] },
  Em: { bass: 40, fifth: 47, tones: [55, 59, 64] },
};

// Мелодии: [доля в такте, MIDI, длительность в долях].
const MEL_A = [
  [[0, 79, 1], [1, 76, 0.5], [1.5, 79, 0.5], [2, 84, 1], [3, 79, 1]],
  [[0, 81, 1], [1, 76, 0.5], [1.5, 81, 0.5], [2, 84, 2]],
  [[0, 81, 1], [1, 77, 0.5], [1.5, 81, 0.5], [2, 84, 1], [3, 81, 1]],
  [[0, 83, 1], [1, 79, 0.5], [1.5, 83, 0.5], [2, 86, 2]],
  [[0, 88, 1], [1, 86, 0.5], [1.5, 84, 0.5], [2, 79, 1], [3, 76, 1]],
  [[0, 81, 1], [1, 79, 0.5], [1.5, 76, 0.5], [2, 72, 2]],
  [[0, 77, 1], [1, 81, 0.5], [1.5, 84, 0.5], [2, 86, 1], [3, 84, 1]],
  [[0, 83, 1], [1, 81, 0.5], [1.5, 79, 0.5], [2, 77, 1], [3, 74, 1]],
];
const MEL_A2 = [
  ...MEL_A.slice(0, 4),
  [[0, 84, 0.5], [0.5, 86, 0.5], [1, 88, 1], [2, 91, 1], [3, 88, 1]],
  [[0, 84, 1], [1, 81, 1], [2, 76, 2]],
  [[0, 77, 0.5], [0.5, 81, 0.5], [1, 84, 0.5], [1.5, 86, 0.5], [2, 89, 1], [3, 86, 1]],
  [[0, 83, 1.5], [1.5, 79, 0.5], [2, 74, 1], [3, 79, 0.5], [3.5, 77, 0.5]],
];
const MEL_B = [
  [[0, 84, 2], [2, 81, 1], [3, 77, 1]],
  [[0, 83, 2], [2, 86, 1], [3, 83, 1]],
  [[0, 79, 1.5], [1.5, 83, 0.5], [2, 88, 2]],
  [[0, 84, 1.5], [1.5, 83, 0.5], [2, 81, 2]],
  [[0, 81, 1], [1, 84, 1], [2, 89, 1], [3, 88, 1]],
  [[0, 86, 1], [1, 83, 1], [2, 79, 2]],
  [[0, 76, 1], [1, 79, 1], [2, 84, 2]],
  [[2, 79, 0.5], [2.5, 77, 0.5], [3, 76, 0.5], [3.5, 74, 0.5]],
];
const MEL_END = [
  [[0, 81, 2], [2, 84, 2]],
  [[0, 83, 2], [2, 86, 2]],
  [[0, 88, 1], [1, 86, 1], [2, 83, 2]],
  [[0, 84, 2], [2, 81, 2]],
  [[0, 77, 1], [1, 81, 1], [2, 79, 1], [3, 83, 1]],
  [[0, 84, 4]],
];
const INTRO_MEL = [[], [[2, 79, 0.5], [2.5, 77, 0.5], [3, 76, 0.5], [3.5, 74, 0.5]]];

const PROG_A = ["C", "Am", "F", "G", "C", "Am", "Dm7", "G7"];
const PROG_B = ["F", "G", "Em", "Am", "F", "G", "C", "C"];
// кода: F | G | Em | Am | Dm7→G7 (полтакта) | C
const PROG_END = ["F", "G", "Em", "Am", ["Dm7", "G7"], "C"];

const sections = [
  { prog: ["C", "G7"], mel: INTRO_MEL, arp: false, glock: false, perc: 0.6 },
  { prog: PROG_A, mel: MEL_A, arp: false, glock: false, perc: 1 },
  { prog: PROG_A, mel: MEL_A2, arp: true, glock: false, perc: 1 },
  { prog: PROG_B, mel: MEL_B, arp: true, glock: false, perc: 0.8 },
  { prog: PROG_A, mel: MEL_A2, arp: true, glock: true, perc: 1 },
  { prog: PROG_END, mel: MEL_END, arp: true, glock: false, perc: 0.8, end: true },
];
const bars = [];
for (const s of sections) s.prog.forEach((c, i) => bars.push({ chords: Array.isArray(c) ? c : [c], mel: s.mel[i] ?? [], s, first: i === 0, last: i === s.prog.length - 1 }));
const DUR = bars.length * BAR + TAIL;
const N = Math.ceil(DUR * SR);

// ---------- шины ----------
const dry = [new Float32Array(N), new Float32Array(N)];
const send = [new Float32Array(N), new Float32Array(N)]; // в реверберацию
const rnd = mulberry32(4343);
const human = (ms) => ((rnd() * 2 - 1) * ms) / 1000;

const put = (mono, at, gain, pan, rev) => {
  const i0 = Math.round(at * SR);
  const gl = gain * Math.cos(((pan + 1) * Math.PI) / 4);
  const gr = gain * Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < mono.length; i++) {
    const k = i0 + i;
    if (k < 0 || k >= N) continue;
    dry[0][k] += mono[i] * gl;
    dry[1][k] += mono[i] * gr;
    send[0][k] += mono[i] * gl * rev;
    send[1][k] += mono[i] * gr * rev;
  }
};

// ---------- инструменты ----------
// Маримба: основной тон + 4-й обертон (настройка пластины ≈ 3,93) + призвук
// молоточка; высокие ноты затухают быстрее.
const marimba = (midi, durSec, vel) => {
  const f = midiHz(midi);
  const tau = 0.62 * Math.pow(440 / f, 0.35) + Math.min(0.25, durSec * 0.12);
  const len = Math.min(tau * 6, 3.5);
  const o = new Float32Array(Math.ceil(len * SR));
  addMode(o, 0, f, vel, tau);
  addMode(o, 0, f * 3.93, vel * 0.16, tau * 0.22, 0.4);
  addMode(o, 0, f * 9.2, vel * 0.025, 0.03, 1.1);
  addClick(o, 0, { freq: Math.min(2400, f * 2), q: 0.8, amp: vel * 0.12, decay: 0.002, seed: midi * 7, len: 0.01, type: "lowpass" });
  for (let i = 0; i < Math.min(o.length, 88); i++) o[i] *= i / 88; // мягкая атака 2 мс
  return o;
};

// Колокольчик (глокеншпиль), очень тихо.
const glock = (midi, vel) => {
  const f = midiHz(midi);
  const o = new Float32Array(Math.ceil(1.4 * SR));
  addMode(o, 0, f, vel, 0.45);
  addMode(o, 0, f * 2.76, vel * 0.12, 0.12, 0.5);
  addMode(o, 0, f * 5.4, vel * 0.03, 0.05, 1.3);
  for (let i = 0; i < 66; i++) o[i] *= i / 66;
  return o;
};

// Пиццикато: Karplus–Strong с дробной задержкой (allpass), мягкий шумовой импульс.
const pluck = (midi, durSec, vel, { tau = 0.4, bright = 0.45, seed = 1 } = {}) => {
  const f = midiHz(midi);
  const L = SR / f;
  const n = Math.floor(L - 0.5 - 0.1);
  const d = L - n - 0.5;
  const C = (1 - d) / (1 + d);
  const line = new Float32Array(n);
  const r = mulberry32(seed);
  let lp = 0;
  let mean = 0;
  for (let i = 0; i < n; i++) {
    lp += bright * (r() * 2 - 1 - lp);
    line[i] = lp;
    mean += lp / n;
  }
  for (let i = 0; i < n; i++) line[i] -= mean;
  const g = Math.exp(-1 / (tau * f));
  const len = Math.min(durSec + 0.25, tau * 5);
  const o = new Float32Array(Math.ceil(len * SR));
  let ptr = 0;
  let prev = 0;
  let ax = 0;
  let ay = 0;
  const rel = Math.round(0.08 * SR);
  for (let i = 0; i < o.length; i++) {
    const x = line[ptr];
    const avg = 0.5 * (x + prev);
    prev = x;
    const ap = C * avg + ax - C * ay;
    ax = avg;
    ay = ap;
    line[ptr] = g * ap;
    ptr = (ptr + 1) % n;
    const tEnd = o.length - i;
    o[i] = x * vel * (tEnd < rel ? tEnd / rel : 1);
  }
  return o;
};

// Пэд: однопериодная волна с мягким верхом (гармоники 1/n^1.7), два
// расстроенных голоса на канал, медленная атака и спад.
const PAD_TABLE = (() => {
  const T = 4096;
  const t = new Float32Array(T + 1);
  for (let i = 0; i <= T; i++) {
    let v = 0;
    for (let h = 1; h <= 7; h++) v += Math.sin((TAU * h * i) / T + h * 0.9) / Math.pow(h, 1.7);
    t[i] = v;
  }
  return t;
})();
const padNote = (midi, at, durSec, gain) => {
  const f = midiHz(midi);
  const att = 0.45;
  const relS = 0.7;
  const len = durSec + relS;
  const i0 = Math.round(at * SR);
  const n = Math.ceil(len * SR);
  const det = [-0.0035, 0.0028, -0.0012, 0.004];
  const ph = det.map((_, k) => (k * 0.37) % 1);
  for (let i = 0; i < n; i++) {
    const k = i0 + i;
    if (k >= N) break;
    const t = i / SR;
    const env = Math.min(1, t / att) ** 1.5 * (t > durSec ? Math.max(0, 1 - (t - durSec) / relS) ** 1.6 : 1);
    if (env <= 0) continue;
    let l = 0;
    let r = 0;
    for (let v = 0; v < 4; v++) {
      ph[v] += (f * (1 + det[v])) / SR;
      ph[v] -= Math.floor(ph[v]);
      const s = PAD_TABLE[Math.floor(ph[v] * 4096)];
      if (v % 2 === 0) l += s;
      else r += s;
    }
    const a = gain * env * (0.92 + 0.08 * Math.sin(TAU * 0.21 * (at + t)));
    dry[0][k] += l * a;
    dry[1][k] += r * a;
    send[0][k] += l * a * 0.5;
    send[1][k] += r * a * 0.5;
  }
};

// Деревянная коробочка «тик»/«ток» и мягкий удар.
const wood = (high, vel) => {
  const o = new Float32Array(Math.ceil(0.08 * SR));
  const f = high ? 2350 : 1480;
  addMode(o, 0, f, vel, 0.012);
  addMode(o, 0, f * 0.62, vel * 0.5, 0.018, 0.6);
  addClick(o, 0, { freq: f * 1.5, q: 1.4, amp: vel * 0.5, decay: 0.0012, seed: high ? 5 : 6, len: 0.01 });
  return o;
};
const thump = (vel) => {
  const o = new Float32Array(Math.ceil(0.25 * SR));
  addMode(o, 0, 0, vel, 0.07, 0, (t) => 58 + 50 * Math.exp(-t / 0.02));
  for (let i = 0; i < 44; i++) o[i] *= i / 44;
  return o;
};
const shaker = (seed, vel) => {
  const o = new Float32Array(Math.ceil(0.06 * SR));
  addClick(o, 0, { freq: 6500, q: 0.7, amp: vel, decay: 0.012, seed, len: 0.06, type: "highpass" });
  return o;
};

// ---------- партитура ----------
bars.forEach((bar, b) => {
  const t0 = b * BAR;
  const { s } = bar;
  const halves = bar.chords.length;
  bar.chords.forEach((name, hIdx) => {
    const ch = CH[name];
    const at = t0 + (hIdx * BAR) / halves;
    const len = BAR / halves;
    const final = s.end && bar.last;
    // пэд
    for (const m of ch.tones) padNote(m, at, final ? len + 1.6 : len, 0.04);
    // бас: «бум» на 1-ю долю, квинта на 3-ю (пиццикато)
    put(pluck(ch.bass, BEAT, 0.9, { tau: 0.5, bright: 0.32, seed: 100 + b * 4 + hIdx }), at + human(3), 0.55, 0, 0.12);
    if (halves === 1 && !final) put(pluck(ch.fifth, BEAT, 0.75, { tau: 0.45, bright: 0.3, seed: 200 + b }), at + 2 * BEAT + human(3), 0.5, 0, 0.12);
    // арпеджио восьмыми: 1-3-5-3 вверх-вниз, тихо справа
    if (s.arp && !final) {
      const seq = [ch.tones[0], ch.tones[1], ch.tones[2], ch.tones[1] + 12 > 80 ? ch.tones[1] : ch.tones[0] + 12];
      const steps = Math.round((len / BEAT) * 2);
      for (let k = 0; k < steps; k++) {
        const m = seq[k % 4] + 12 * (k % 8 >= 4 ? 0 : 0);
        put(pluck(m, BEAT / 2, 0.55 + 0.1 * (k % 2 === 0 ? 1 : 0), { tau: 0.28, bright: 0.5, seed: 300 + b * 16 + k }), at + (k * BEAT) / 2 + human(4), 0.2, 0.35, 0.35);
      }
    }
    if (final) {
      // финальный аккорд: мягкое арпеджио маримбой и колокольчиком
      [60, 64, 67, 72, 76].forEach((m, k) => put(marimba(m, 1, 0.5), at + k * 0.09, 0.32, -0.1 + k * 0.05, 0.4));
      put(glock(96, 0.4), at + 0.5, 0.12, 0.25, 0.6);
    }
  });
  // мелодия
  for (const [beat, midi, dur] of bar.mel) {
    const vel = 0.85 + 0.15 * (beat % 2 === 0 ? 1 : 0) - 0.08 * rnd();
    put(marimba(midi, dur * BEAT, vel), t0 + beat * BEAT + human(5), 0.42, -0.15, 0.3);
    if (s.glock && beat % 1 === 0 && dur >= 1) put(glock(midi + 12, 0.5), t0 + beat * BEAT + 0.004, 0.07, 0.25, 0.6);
  }
  // колокольчики в начале части
  if (bar.first && b > 0 && !s.end) [79, 84, 88, 91].forEach((m, k) => put(glock(m, 0.5), t0 - BEAT + k * (BEAT / 4), 0.08, 0.3, 0.6));
  // «тик-так» на каждую долю, мягкий удар на 1 и 3, шейкер на слабые восьмые
  const finalBar = s.end && bar.last;
  for (let k = 0; k < 4; k++) {
    if (finalBar && k > 0) break;
    const at = t0 + k * BEAT;
    put(wood(k % 2 === 0, 1), at + human(2), 0.05 * s.perc, k % 2 === 0 ? -0.3 : 0.3, 0.15);
    if (k % 2 === 0) put(thump(1), at, 0.12 * s.perc, 0, 0);
    if (s.arp && !finalBar) put(shaker(500 + b * 4 + k, 1), at + BEAT / 2 + human(3), 0.035 * s.perc, 0.15, 0.1);
  }
});

// ---------- реверберация (Schroeder/Freeverb, стерео) ----------
const reverb = (input, offset) => {
  const combs = [1116, 1188, 1277, 1356].map((d) => ({ d: d + offset, buf: new Float32Array(d + offset), p: 0, lp: 0 }));
  const aps = [556, 441].map((d) => ({ d: d + offset, buf: new Float32Array(d + offset), p: 0 }));
  const out = new Float32Array(input.length);
  const fb = 0.8;
  const damp = 0.35;
  for (let i = 0; i < input.length; i++) {
    const x = input[i] * 0.25;
    let y = 0;
    for (const c of combs) {
      const v = c.buf[c.p];
      c.lp = v * (1 - damp) + c.lp * damp;
      c.buf[c.p] = x + c.lp * fb;
      c.p = (c.p + 1) % c.d;
      y += v;
    }
    for (const a of aps) {
      const v = a.buf[a.p];
      a.buf[a.p] = y + v * 0.5;
      a.p = (a.p + 1) % a.d;
      y = v - y * 0.5;
    }
    out[i] = y;
  }
  return out;
};
const wetL = reverb(send[0], 0);
const wetR = reverb(send[1], 23);
const WET = 0.55;
const L = new Float32Array(N);
const R = new Float32Array(N);
for (let i = 0; i < N; i++) {
  L[i] = dry[0][i] + WET * wetL[i];
  R[i] = dry[1][i] + WET * wetR[i];
}

// ---------- мастер ----------
// Мягкий верх (без резких высоких), чистый низ, плавный хвост в конце.
for (const ch of [L, R]) {
  new Biquad("highpass", 32, 0.7).run(ch);
  new Biquad("lowpass", 9000, 0.6).run(ch);
  new Biquad("peak", 3200, 0.8, -2.5).run(ch);
}
// мягкое ограничение редких пиков (tanh), чтобы подложка была ровной
normalize([L, R], -3);
for (const ch of [L, R]) for (let i = 0; i < N; i++) ch[i] = Math.tanh(ch[i] * 1.4) / 1.4;
const fadeIn = Math.round(0.05 * SR);
const fadeOut = Math.round(TAIL * SR);
for (let i = 0; i < N; i++) {
  const g = Math.min(1, i / fadeIn) * Math.min(1, (N - i) / fadeOut) ** 1.3;
  L[i] *= g;
  R[i] *= g;
}
normalize([L, R], -7);
console.log(`Тактов: ${bars.length}, длительность ${DUR.toFixed(1)} с, пик до кодирования ${peakDb([L, R]).toFixed(2)} дБFS`);
encodeMp3([L, R], OUT, "128k");

const log = execFileSync("sh", ["-c", `ffmpeg -hide_banner -nostats -i "${OUT}" -af ebur128=peak=true -f null - 2>&1 | tail -14`]).toString();
const I = /I:\s+(-?[\d.]+) LUFS/.exec(log)?.[1];
const P = /Peak:\s+(-?[\d.]+) dBFS/.exec(log)?.[1];
const dur = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration:stream=channels,sample_rate,bit_rate", "-of", "default=nw=1", OUT]).toString().trim().replace(/\n/g, ", ");
console.log(`✓ ${OUT}: ${dur}; ${I} LUFS, пик ${P} дБTP (цель ≤ −6 дБFS: ${Number(P) <= -6 ? "да" : "НЕТ"})`);
if (!(Number(P) <= -6)) process.exit(1);
