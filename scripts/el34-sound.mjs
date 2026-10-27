// Звуки №34 «Жарыядагы ашыкча сап»: тихая подложка (эмбиент на органном
// пункте ре), тёплое разрешение под финальным экраном, комнатная атмосфера
// и мягкие звуки действий (набор на ноутбуке, клавиши, книга и страницы,
// закладка, ткань, диван, касание телефона, щелчок тачпада, тихий «тик»
// карточки).
// Синтез детерминированный (seed), без загрузок и внешних API. Результат —
// public/audio/extra-line-34/sfx/*.mp3 и sound.json; где и как громко
// звучит каждый файл, решает src/extra-line-34/sound.ts.
//
// Повторный запуск ничего не перезаписывает: в sound.json для каждого файла
// хранится хэш его параметров и кода синтеза и sha256 готового MP3. Совпали
// оба — звук пропускается (CI с другой сборкой ffmpeg не меняет
// закоммиченные файлы). Новый или изменённый звук пересоздаётся только он;
// изменились общие функции синтеза — пересоздаются все.
//
// Громкость файлов: моно приведено к REF (≈ громкость реплик: моно-файлы
// озвучки ≈ −17,8 LUFS) — подложка и атмосфера по средней K-взвешенной
// громкости, эффекты по самому громкому окну 100 мс; стерео — к REF + 3 дБ
// (как моно, звучащее в обоих каналах). Пик не выше −1,5 dBFS. Поэтому
// уровни в sound.ts — в дБ относительно речи.
//
// Запуск: node scripts/el34-sound.mjs          — недостающие и изменённые
//         node scripts/el34-sound.mjs --force  — пересоздать все
//         node scripts/el34-sound.mjs --check  — только проверка (код 1, если
//                                                файлы не совпадают со spec)
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { ffmpeg, mulberry32, writeWav } from "./lib/audio.mjs";

// VERSION — увеличить, если меняется нормализация или кодирование (render, ENC)
const VERSION = 1;
const SR = 48000;
const REF = -18;
const PEAK = -1.5;
const OUT = "public/audio/extra-line-34/sfx";
const MANIFEST = join(OUT, "sound.json");
const TAU = 2 * Math.PI;
const force = process.argv.includes("--force");
const check = process.argv.includes("--check");

// ---------- Общие функции синтеза ----------
const buf = (sec) => new Float32Array(Math.round(sec * SR));
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const smooth = (x) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};
const midiHz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const noise = (sec, r) => {
  const x = buf(sec);
  for (let i = 0; i < x.length; i++) x[i] = r() * 2 - 1;
  return x;
};
// розовый шум (фильтр Келлета)
const pink = (sec, r) => {
  const x = buf(sec);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < x.length; i++) {
    const w = r() * 2 - 1;
    b0 = 0.99886 * b0 + w * 0.0555179;
    b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.969 * b2 + w * 0.153852;
    b3 = 0.8665 * b3 + w * 0.3104856;
    b4 = 0.55 * b4 + w * 0.5329522;
    b5 = -0.7616 * b5 - w * 0.016898;
    x[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
    b6 = w * 0.115926;
  }
  return x;
};
// биквад (RBJ): lp, hp, bp (пик 0 дБ), peak; hz может быть функцией
// времени (с) — коэффициенты пересчитываются каждые 32 отсчёта
const biquad = (x, type, hz, q = 0.707, gainDb = 0) => {
  let b0, b1, b2, a1, a2;
  const coef = (f) => {
    const w = (TAU * Math.min(f, SR * 0.45)) / SR;
    const cs = Math.cos(w);
    const al = Math.sin(w) / (2 * q);
    const A = Math.pow(10, gainDb / 40);
    let c;
    if (type === "lp") c = [(1 - cs) / 2, 1 - cs, (1 - cs) / 2, 1 + al, -2 * cs, 1 - al];
    else if (type === "hp") c = [(1 + cs) / 2, -(1 + cs), (1 + cs) / 2, 1 + al, -2 * cs, 1 - al];
    else if (type === "bp") c = [al, 0, -al, 1 + al, -2 * cs, 1 - al];
    else c = [1 + al * A, -2 * cs, 1 - al * A, 1 + al / A, -2 * cs, 1 - al / A];
    b0 = c[0] / c[3];
    b1 = c[1] / c[3];
    b2 = c[2] / c[3];
    a1 = c[4] / c[3];
    a2 = c[5] / c[3];
  };
  const dyn = typeof hz === "function";
  coef(dyn ? hz(0) : hz);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    if (dyn && i % 32 === 0) coef(hz(i / SR));
    const y = b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1;
    x1 = x[i];
    y2 = y1;
    y1 = y;
    x[i] = y;
  }
  return x;
};
// огибающая: атака (с), экспоненциальный спад (с)
const env = (x, attack, decay) => {
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    x[i] *= (attack > 0 ? Math.min(1, t / attack) : 1) * Math.exp(-t / decay);
  }
  return x;
};
// «колокол» длиной dur: плавный подъём до peakAt (доля), затем спад
const bell = (x, dur, peakAt = 0.4, pow = 1.5) => {
  for (let i = 0; i < x.length; i++) {
    const u = i / SR / dur;
    const e = u < peakAt ? Math.sin((Math.PI / 2) * (u / peakAt)) : u < 1 ? Math.cos((Math.PI / 2) * ((u - peakAt) / (1 - peakAt))) : 0;
    x[i] *= Math.pow(Math.max(0, e), pow);
  }
  return x;
};
const add = (dst, src, at, gain = 1) => {
  const o = Math.round(at * SR);
  for (let i = 0; i < src.length && o + i < dst.length; i++) if (o + i >= 0) dst[o + i] += src[i] * gain;
};
// затухающий тон (корпус клавиши, стекло, дерево)
const ping = (hz, decay, sec = decay * 6) => {
  const x = buf(sec);
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    x[i] = Math.sin(TAU * hz * t) * Math.min(1, t / 0.0004) * Math.exp(-t / decay);
  }
  return x;
};
// ранние отражения от стола/комнаты (короткие задержки, приглушённые)
const room = (x, taps = [[0.0031, 0.22], [0.0073, 0.12], [0.0114, 0.07], [0.0172, 0.04]]) => {
  const y = Float32Array.from(x);
  for (const [d, g] of taps) {
    const o = Math.round(d * SR);
    for (let i = o; i < y.length; i++) y[i] += x[i - o] * g;
  }
  return biquad(y, "lp", 7000);
};
// реверберация Freeverb (8 гребёнок + 4 фазовых фильтра), моно → wet
const COMB = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617];
const ALLPASS = [556, 441, 341, 225];
const freeverb = (x, spread = 0, size = 0.84, damp = 0.3) => {
  const k = SR / 44100;
  const combs = COMB.map((d) => ({ b: new Float32Array(Math.round((d + spread) * k)), i: 0, f: 0 }));
  const aps = ALLPASS.map((d) => ({ b: new Float32Array(Math.round((d + spread) * k)), i: 0 }));
  const y = new Float32Array(x.length);
  for (let n = 0; n < x.length; n++) {
    const inp = x[n] * 0.015;
    let s = 0;
    for (const c of combs) {
      const o = c.b[c.i];
      c.f = o * (1 - damp) + c.f * damp;
      c.b[c.i] = inp + c.f * size;
      if (++c.i >= c.b.length) c.i = 0;
      s += o;
    }
    for (const a of aps) {
      const o = a.b[a.i];
      a.b[a.i] = s + o * 0.5;
      if (++a.i >= a.b.length) a.i = 0;
      s = o - s;
    }
    y[n] = s * 3;
  }
  return y;
};
// реверберация закольцованного фрагмента: два прохода, берётся второй —
// хвост конца переходит в начало (петля без шва)
const loopVerb = (x, spread, size, damp) => {
  const two = new Float32Array(x.length * 2);
  two.set(x, 0);
  two.set(x, x.length);
  return freeverb(two, spread, size, damp).subarray(x.length);
};
// фильтр закольцованного фрагмента (как loopVerb): состояние фильтра на шве —
// из конца петли, а не с нуля
const loopFilter = (x, fx) => {
  const two = new Float32Array(x.length * 2);
  two.set(x, 0);
  two.set(x, x.length);
  x.set(fx(two).subarray(x.length));
  return x;
};

// K-фильтр BS.1770 (для любой частоты дискретизации)
const kWeight = (x) => {
  const y = Float32Array.from(x);
  const run = (b0, b1, b2, a1, a2) => {
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < y.length; i++) {
      const v = b0 * y[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
      x2 = x1;
      x1 = y[i];
      y2 = y1;
      y1 = v;
      y[i] = v;
    }
  };
  {
    const f0 = 1681.974450955533, G = 3.999843853973347, Q = 0.7071752369554196;
    const K = Math.tan((Math.PI * f0) / SR), Vh = Math.pow(10, G / 20), Vb = Math.pow(Vh, 0.4996667741545416);
    const a0 = 1 + K / Q + K * K;
    run((Vh + (Vb * K) / Q + K * K) / a0, (2 * (K * K - Vh)) / a0, (Vh - (Vb * K) / Q + K * K) / a0, (2 * (K * K - 1)) / a0, (1 - K / Q + K * K) / a0);
  }
  {
    const f0 = 38.13547087602444, Q = 0.5003270373238773;
    const K = Math.tan((Math.PI * f0) / SR);
    const a0 = 1 + K / Q + K * K;
    run(1, -2, 1, (2 * (K * K - 1)) / a0, (1 - K / Q + K * K) / a0);
  }
  return y;
};
// громкость (LUFS): win — самое громкое окно (с); без win — средняя
const loudness = (channels, win) => {
  const ys = channels.map(kWeight);
  const n = ys[0].length;
  const cs = new Float64Array(n + 1);
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (const y of ys) s += y[i] * y[i];
    cs[i + 1] = cs[i] + s;
  }
  let ms = cs[n] / n;
  if (win) {
    const w = Math.min(n, Math.round(win * SR));
    const hop = Math.max(1, Math.round(w / 8));
    ms = 0;
    for (let i = 0; i + w <= n; i += hop) ms = Math.max(ms, (cs[i + w] - cs[i]) / w);
  }
  return -0.691 + 10 * Math.log10(ms + 1e-20);
};

// ---------- Подложка: эмбиент на органном пункте ре ----------
// Аккорды над басом D (каждые 8 с, перекрёстная смена 3 с):
// Dadd9 – Gmaj7/D – Bm7/D – A/D. Над органным пунктом любой из них
// сочетается с финальным Dadd9 (bed-end), где бы ни закончился ролик.
// Сверху — редкие ноты «войлочного» пианино из звуков аккорда, всё
// в мягкой реверберации. Без ударных и резких атак.
// Петля без шва (кольцевой буфер, loopFilter, loopVerb), но MP3 на стыке
// петли даёт короткую паузу (задержка кодера) — поэтому подложка длиннее
// ролика (тест в extra-line-34.test.mjs); вырос ролик — увеличить sec.
const CHORDS = [
  [50, 57, 62, 64, 66],
  [50, 55, 59, 62, 66],
  [50, 54, 59, 62, 69],
  [50, 57, 61, 64, 69],
];
const MELODY = [
  [66, 69, 74, 76],
  [67, 71, 74, 78],
  [66, 69, 71, 74],
  [69, 73, 76, 81],
];
const TABLE_N = 4096;
const wavetable = (harm) => {
  const t = new Float32Array(TABLE_N + 1);
  for (let i = 0; i < TABLE_N; i++) for (const [k, a] of harm) t[i] += a * Math.sin((TAU * k * i) / TABLE_N);
  let p = 0;
  for (const v of t) p = Math.max(p, Math.abs(v));
  for (let i = 0; i < TABLE_N; i++) t[i] /= p;
  t[TABLE_N] = t[0];
  return t;
};
// нота пэда в кольцевом буфере: три слегка расстроенных голоса, плавный
// вход/выход равной мощности (fade с каждой стороны границ t0 и t1),
// медленное «дыхание» громкости
const padNote = (L, R, tab, midi, amp, t0, t1, fade, r, ring = true) => {
  const N = L.length;
  const hz = midiHz(midi);
  const voices = [-5, 0, 5].map((cents, k) => {
    const pan = [-0.55, 0.1, 0.55][k] * (r() < 0.5 ? 1 : -1);
    return { inc: ((hz * Math.pow(2, cents / 1200)) / SR) * TABLE_N, ph: r() * TABLE_N, gl: Math.cos(((pan + 1) * Math.PI) / 4), gr: Math.sin(((pan + 1) * Math.PI) / 4) };
  });
  const lfoHz = 0.04 + r() * 0.06;
  const lfoPh = r() * TAU;
  const s0 = Math.floor((t0 - fade) * SR);
  const s1 = Math.ceil((t1 + fade) * SR);
  for (let i = s0; i < s1; i++) {
    const t = i / SR;
    let e = 1;
    if (t < t0 + fade) e = Math.sin((Math.PI / 2) * clamp01((t - t0 + fade) / (2 * fade)));
    else if (t > t1 - fade) e = Math.cos((Math.PI / 2) * clamp01((t - t1 + fade) / (2 * fade)));
    e *= amp * (1 + 0.14 * Math.sin(TAU * lfoHz * t + lfoPh)) / 3;
    const j = ring ? ((i % N) + N) % N : i;
    if (j < 0 || j >= N) continue;
    for (const v of voices) {
      const p = v.ph | 0;
      const s = tab[p] + (tab[p + 1] - tab[p]) * (v.ph - p);
      v.ph += v.inc;
      if (v.ph >= TABLE_N) v.ph -= TABLE_N;
      L[j] += s * e * v.gl;
      R[j] += s * e * v.gr;
    }
  }
};
// «войлочное» пианино: мягкая атака, верхние гармоники гаснут быстрее,
// лёгкая негармоничность, глухой призвук молоточка
const feltNote = (L, R, midi, at, vel, pan, r, ring = true) => {
  const N = L.length;
  const hz = midiHz(midi);
  const len = Math.round(4.5 * SR);
  const gl = Math.cos(((pan + 1) * Math.PI) / 4);
  const gr = Math.sin(((pan + 1) * Math.PI) / 4);
  const parts = [
    [1, 1, 1.6],
    [2, 0.32, 0.7],
    [3, 0.1, 0.35],
    [4, 0.04, 0.2],
  ].map(([k, a, d]) => ({ f: hz * k * (1 + 0.0004 * k * k), a, d, ph: r() * TAU }));
  const thump = biquad(noise(0.05, r), "lp", 700);
  const s0 = Math.round(at * SR);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const att = Math.sin((Math.PI / 2) * Math.min(1, t / 0.006));
    let v = 0;
    for (const p of parts) v += p.a * Math.sin(TAU * p.f * t + p.ph) * (0.75 * Math.exp(-t / p.d) + 0.25 * Math.exp(-t / (p.d * 2.6)));
    v *= att;
    if (i < thump.length) v += thump[i] * 0.25 * Math.exp(-t / 0.008);
    const j = ring ? (((s0 + i) % N) + N) % N : s0 + i;
    if (j < 0 || j >= N) continue;
    L[j] += v * vel * gl;
    R[j] += v * vel * gr;
  }
};
const PAD_TAB = [[1, 1], [2, 0.34], [3, 0.12], [4, 0.05], [5, 0.02]];
const DRONE_TAB = [[1, 1], [2, 0.22], [3, 0.05]];

const makeBed = ({ sec, chordSec, fade, seed, padAmp, droneAmp, feltAmp, wet }) => {
  const r = mulberry32(seed);
  const n = Math.round(sec * SR);
  const pad = [new Float32Array(n), new Float32Array(n)];
  const felt = [new Float32Array(n), new Float32Array(n)];
  const padTab = wavetable(PAD_TAB);
  const droneTab = wavetable(DRONE_TAB);
  const count = Math.round(sec / chordSec);
  // органный пункт ре (D2 + D3) на всю длину; шов петли — та же плавная
  // смена, что между аккордами
  padNote(pad[0], pad[1], droneTab, 38, droneAmp, 0, sec, fade, r);
  padNote(pad[0], pad[1], droneTab, 50, droneAmp * 0.5, 0, sec, fade, r);
  let mel = 1;
  for (let k = 0; k < count; k++) {
    const ch = CHORDS[k % CHORDS.length];
    const t0 = k * chordSec;
    ch.forEach((m, i) => padNote(pad[0], pad[1], padTab, m, padAmp * [1, 0.85, 0.75, 0.62, 0.5][i], t0, t0 + chordSec, fade, r));
    // 2–3 ноты пианино на аккорд, спокойное движение по звукам аккорда
    const notes = MELODY[k % MELODY.length];
    const times = [0.5, 3.1, 5.6].filter((_, i) => i !== 2 || r() < 0.6);
    for (const tt of times) {
      mel = Math.max(0, Math.min(notes.length - 1, mel + (r() < 0.5 ? -1 : 1) * (r() < 0.7 ? 1 : 0)));
      const at = t0 + tt + (r() - 0.5) * 0.5;
      const vel = feltAmp * (0.55 + r() * 0.35);
      feltNote(felt[0], felt[1], notes[mel], at, vel, (r() - 0.5) * 0.7, r);
      if (r() < 0.3) feltNote(felt[0], felt[1], notes[Math.max(0, mel - 2)], at + 0.14, vel * 0.7, (r() - 0.5) * 0.7, r);
    }
  }
  for (const c of pad) loopFilter(c, (y) => biquad(biquad(y, "lp", 2200), "hp", 55));
  for (const c of felt) loopFilter(c, (y) => biquad(y, "lp", 3600));
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    L[i] = pad[0][i] + felt[0][i];
    R[i] = pad[1][i] + felt[1][i];
  }
  const sendL = new Float32Array(n);
  const sendR = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    sendL[i] = pad[0][i] * 0.5 + felt[0][i];
    sendR[i] = pad[1][i] * 0.5 + felt[1][i];
  }
  const wl = loopVerb(sendL, 0, 0.86, 0.35);
  const wr = loopVerb(sendR, 23, 0.86, 0.35);
  for (let i = 0; i < n; i++) {
    L[i] = L[i] * (1 - wet) + wl[i] * wet;
    R[i] = R[i] * (1 - wet) + wr[i] * wet;
  }
  return [L, R];
};

// Разрешение под финальным экраном: Dadd9 медленно вступает, пианино —
// спокойный спуск F#5 – E5 – D5 (с D4 и A4), длинное затухание.
const makeBedEnd = ({ sec, seed, padAmp, feltAmp, wet, notes }) => {
  const r = mulberry32(seed);
  const n = Math.round(sec * SR);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const padTab = wavetable(PAD_TAB);
  const droneTab = wavetable(DRONE_TAB);
  const p = [new Float32Array(n), new Float32Array(n)];
  const f = [new Float32Array(n), new Float32Array(n)];
  padNote(p[0], p[1], droneTab, 38, padAmp * 0.9, 0.9, sec - 1.2, 0.9, r, false);
  [50, 57, 62, 64, 66, 69].forEach((m, i) => padNote(p[0], p[1], padTab, m, padAmp * [1, 0.85, 0.8, 0.6, 0.6, 0.45][i], 0.9, sec - 1.2, 0.9, r, false));
  // долгий спад пэда после вступления
  for (const c of p)
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      if (t > 2.6) c[i] *= Math.exp(-(t - 2.6) / 2.6);
    }
  for (const [at, m, v, pan] of notes) feltNote(f[0], f[1], m, at, feltAmp * v, pan, r, false);
  for (const c of p) biquad(biquad(c, "lp", 2200), "hp", 55);
  for (const c of f) biquad(c, "lp", 3600);
  const sl = new Float32Array(n);
  const sr = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    L[i] = p[0][i] + f[0][i];
    R[i] = p[1][i] + f[1][i];
    sl[i] = p[0][i] * 0.5 + f[0][i];
    sr[i] = p[1][i] * 0.5 + f[1][i];
  }
  const wl = freeverb(sl, 0, 0.86, 0.35);
  const wr = freeverb(sr, 23, 0.86, 0.35);
  for (let i = 0; i < n; i++) {
    const tail = Math.min(1, (n - i) / (0.3 * SR));
    L[i] = (L[i] * (1 - wet) + wl[i] * wet) * tail;
    R[i] = (R[i] * (1 - wet) + wr[i] * wet) * tail;
  }
  return [L, R];
};

// ---------- Комнатная атмосфера ----------
// Тихая комната днём: мягкий розовый шум (низ и середина), едва заметный
// «воздух» сверху, медленные колебания уровня. Петля без шва.
const makeRoom = ({ sec, seed, lowHz, highHz, air, xfade }) => {
  const r = mulberry32(seed);
  const n = Math.round(sec * SR);
  const m = n + Math.round(xfade * SR);
  const len = m / SR;
  const x = biquad(biquad(biquad(pink(len, r), "hp", lowHz), "lp", highHz), "lp", highHz * 1.4);
  const a = biquad(biquad(noise(len, r), "hp", 3000), "lp", 8000);
  const ph = [r() * TAU, r() * TAU];
  for (let i = 0; i < m; i++) {
    const t = i / SR;
    const wob = 1 + 0.09 * Math.sin((TAU * t) / 23 + ph[0]) + 0.06 * Math.sin((TAU * t) / 9.7 + ph[1]);
    x[i] = (x[i] + a[i] * air) * wob;
  }
  // хвост поверх начала (равная мощность) — петля без шва
  const y = x.slice(0, n);
  const xf = m - n;
  for (let i = 0; i < xf; i++) {
    const u = i / xf;
    y[i] = x[i] * Math.sin((Math.PI / 2) * u) + x[n + i] * Math.cos((Math.PI / 2) * u);
  }
  return [y];
};

// ---------- Эффекты ----------
// Клавиша ноутбука (низкий ход): щелчок колпачка, корпус, отпускание.
const keystroke = (r, { body, level = 1, bright = 1, decay = 0.006, up = 0.055, upLevel = 0.3 }) => {
  const x = buf(0.14);
  add(x, env(biquad(noise(0.012, r), "bp", 3000 * bright, 0.8), 0.0003, 0.0014), 0, 0.5 * level);
  add(x, ping(body * (0.97 + r() * 0.06), decay), 0.0004, 0.45 * level);
  add(x, env(biquad(noise(0.05, r), "lp", 1100), 0.0006, decay * 1.2), 0, 0.5 * level);
  const u = up * (0.85 + r() * 0.3);
  add(x, env(biquad(noise(0.01, r), "bp", 2400 * bright, 1.1), 0.0003, 0.0011), u, upLevel * level);
  add(x, ping(body * 1.3, decay * 0.6), u, 0.12 * level);
  return x;
};
// Набор на ноутбуке: длинная запись (слова по 2–8 букв, пробелы, редкие
// паузы); в ролике берутся отрезки нужной длины с разных мест.
const makeTyping = ({ sec, seed }) => {
  const r = mulberry32(seed);
  const x = buf(sec);
  let t = 0.03;
  let word = 0;
  while (t < sec - 0.2) {
    const letters = 2 + Math.floor(r() * 7);
    for (let k = 0; k < letters && t < sec - 0.2; k++) {
      add(x, keystroke(r, { body: 430 + r() * 220, level: 0.6 + r() * 0.4, bright: 0.85 + r() * 0.3 }), t);
      t += 0.06 + r() * 0.06;
    }
    // пробел — ниже и мягче
    add(x, keystroke(r, { body: 250 + r() * 40, level: 0.9, bright: 0.7, decay: 0.009, up: 0.07 }), t);
    t += 0.1 + r() * 0.08 + (++word % 5 === 0 ? 0.12 + r() * 0.08 : 0);
  }
  return [biquad(room(x), "hp", 140)];
};
const makeKey = ({ seed, body, level, decay, up }) => {
  const r = mulberry32(seed);
  const x = buf(0.2);
  add(x, keystroke(r, { body, level, decay, up, upLevel: 0.35 }), 0);
  return [biquad(room(x), "hp", 120)];
};
// Страница книги: отрыв уголка, взмах (полоса шума скользит вверх), хруст
// бумаги, страница ложится мягким хлопком.
const flip = (r, dur, land, level = 1) => {
  const x = buf(dur + 0.2);
  const sw = biquad(noise(dur, r), "bp", (t) => 800 + 2200 * smooth(t / dur), 0.9);
  add(x, bell(sw, land + 0.06, 0.55, 1.3), 0, 0.7 * level);
  const body = biquad(noise(dur, r), "lp", 900);
  add(x, bell(body, land, 0.6, 1.6), 0, 0.35 * level);
  const crk = Math.round(10 + r() * 6);
  for (let k = 0; k < crk; k++) {
    const at = land * (0.15 + 0.8 * r());
    add(x, env(biquad(noise(0.004, r), "hp", 2500), 0.0002, 0.0007 + r() * 0.0008), at, (0.15 + r() * 0.25) * level);
  }
  add(x, env(biquad(noise(0.06, r), "lp", 1300), 0.0015, 0.016), land, 0.55 * level);
  add(x, env(biquad(noise(0.01, r), "hp", 3200), 0.0004, 0.003), land + 0.002, 0.2 * level);
  return x;
};
const makePageTurn = ({ seed, dur, land }) => {
  const r = mulberry32(seed);
  const x = buf(dur + 0.25);
  // уголок страницы под пальцами
  add(x, bell(biquad(noise(0.1, r), "bp", 2600, 1.2), 0.1, 0.5), 0, 0.18);
  add(x, flip(r, dur - 0.06, land - 0.06), 0.06);
  return [biquad(biquad(x, "hp", 180), "lp", 9000)];
};
const makeRiffle = ({ seed, at }) => {
  const r = mulberry32(seed);
  const x = buf(at[at.length - 1] + 0.45);
  at.forEach((t, k) => add(x, flip(r, 0.2, 0.15, 1 - k * 0.12), t));
  return [biquad(biquad(x, "hp", 200), "lp", 9000)];
};
// Книга ложится и раскрывается на коленях: глухой мягкий стук обложки,
// затем шелест расходящихся страниц.
const makeBookOpen = ({ seed }) => {
  const r = mulberry32(seed);
  const x = buf(0.7);
  add(x, env(biquad(noise(0.12, r), "lp", 380), 0.002, 0.03), 0, 0.9);
  add(x, ping(150, 0.02), 0.001, 0.25);
  add(x, bell(biquad(noise(0.24, r), "bp", 2200, 0.8), 0.24, 0.35), 0.07, 0.35);
  add(x, flip(r, 0.3, 0.24, 0.45), 0.16);
  return [biquad(biquad(x, "hp", 70), "lp", 8000)];
};
// Книгу передают из рук в руки: ладони скользят по обложке, лёгкое касание.
const makeBookTake = ({ seed }) => {
  const r = mulberry32(seed);
  const x = buf(0.55);
  add(x, bell(biquad(noise(0.28, r), "bp", 1700, 0.9), 0.28, 0.45), 0, 0.5);
  add(x, env(biquad(noise(0.08, r), "lp", 600), 0.002, 0.018), 0.24, 0.55);
  add(x, bell(biquad(noise(0.18, r), "bp", 2400, 1.0), 0.18, 0.4), 0.3, 0.25);
  return [biquad(biquad(x, "hp", 90), "lp", 8000)];
};
// Закладка входит между страницами: мягкое скольжение бумаги и едва
// слышное касание в конце.
const makeSlide = ({ seed, dur }) => {
  const r = mulberry32(seed);
  const x = buf(dur + 0.15);
  add(x, bell(biquad(noise(dur, r), "bp", (t) => 2600 + (900 * t) / dur, 1.4), dur, 0.35, 1.2), 0, 0.5);
  add(x, bell(biquad(noise(dur, r), "lp", 1200), dur, 0.4), 0, 0.2);
  add(x, env(biquad(noise(0.03, r), "lp", 1800), 0.001, 0.008), dur * 0.92, 0.35);
  return [biquad(biquad(x, "hp", 250), "lp", 9000)];
};
// Ткань: множество мелких «зёрен» шороха под мягкой огибающей + низкий
// шелест (мягкая игрушка, подушка).
const makeCloth = ({ seed, dur, density, tone }) => {
  const r = mulberry32(seed);
  const x = buf(dur + 0.1);
  const grains = Math.round(density * dur);
  for (let k = 0; k < grains; k++) {
    const u = r();
    const at = dur * (0.08 + 0.84 * u);
    const w = Math.pow(Math.sin(Math.PI * (0.08 + 0.84 * u)), 1.2);
    add(x, env(biquad(noise(0.006, r), "bp", tone * (0.7 + r() * 0.6), 1.2), 0.0005, 0.0012 + r() * 0.0018), at, w * (0.2 + r() * 0.3));
  }
  add(x, bell(biquad(noise(dur, r), "lp", 700), dur, 0.4), 0, 0.45);
  add(x, bell(biquad(noise(dur, r), "bp", tone, 0.6), dur, 0.45), 0, 0.25);
  return [biquad(biquad(x, "hp", 120), "lp", 7000)];
};
// Мальчик садится на диван: мягкое «пф» подушки и шорох ткани.
const makeSit = ({ seed }) => {
  const r = mulberry32(seed);
  const x = buf(0.6);
  add(x, env(biquad(noise(0.4, r), "lp", 240), 0.035, 0.11), 0, 1);
  add(x, env(biquad(noise(0.3, r), "lp", 600), 0.02, 0.06), 0.01, 0.3);
  add(x, makeCloth({ seed: seed + 1, dur: 0.3, density: 90, tone: 2000 })[0], 0.02, 0.25);
  return [biquad(biquad(x, "hp", 60), "lp", 6000)];
};
// Касание экрана телефона: подушечка пальца по стеклу — короткий глухой
// «тык», без писка и вибрации.
const makePhoneTap = ({ seed }) => {
  const r = mulberry32(seed);
  const x = buf(0.1);
  add(x, ping(1150, 0.0022), 0, 0.5);
  add(x, ping(2600, 0.001), 0, 0.15);
  add(x, ping(320, 0.004), 0, 0.35);
  add(x, env(biquad(noise(0.01, r), "lp", 2600), 0.0002, 0.0015), 0, 0.4);
  return [biquad(room(x, [[0.0026, 0.15], [0.006, 0.07]]), "hp", 150)];
};
// Щелчок тачпада: короткий низкий «тук» и тихий щелчок.
const makeClick = ({ seed }) => {
  const r = mulberry32(seed);
  const x = buf(0.1);
  add(x, ping(170, 0.004), 0, 0.6);
  add(x, env(biquad(noise(0.006, r), "bp", 3800, 1), 0.0002, 0.0008), 0, 0.35);
  add(x, ping(190, 0.003), 0.045, 0.2);
  return [biquad(room(x, [[0.0026, 0.15], [0.006, 0.07]]), "hp", 90)];
};
// Тихий «тик» карточки: короткий мягкий тон (ми — девятая ступень ре
// мажора, без «звонка»).
const makeTick = ({ hz }) => {
  const x = buf(0.16);
  add(x, ping(hz, 0.016), 0, 0.6);
  add(x, ping(hz * 2, 0.005), 0, 0.12);
  for (let i = 0; i < x.length; i++) x[i] *= Math.min(1, i / SR / 0.0015);
  return [biquad(x, "lp", 6000)];
};

// ---------- Реестр звуков ----------
// level: "mean" — средняя громкость (подложка, атмосфера), "max" — самое
// громкое окно 100 мс (эффекты). kbps — битрейт MP3.
const SOUNDS = [
  { file: "bed.mp3", kbps: 128, level: "mean", make: makeBed, params: { sec: 160, chordSec: 8, fade: 1.5, seed: 3401, padAmp: 0.5, droneAmp: 0.32, feltAmp: 0.22, wet: 0.32 } },
  {
    file: "bed-end.mp3",
    kbps: 128,
    level: "mean",
    make: makeBedEnd,
    params: { sec: 7.5, seed: 3402, padAmp: 0.5, feltAmp: 0.26, wet: 0.36, notes: [[0.9, 78, 0.5, 0.2], [1.55, 76, 0.46, -0.15], [2.3, 74, 0.6, 0.05], [2.3, 69, 0.36, 0.25], [2.31, 62, 0.4, -0.25]] },
  },
  { file: "room.mp3", kbps: 96, level: "mean", make: makeRoom, params: { sec: 160, seed: 3403, lowHz: 70, highHz: 900, air: 0.05, xfade: 2 } },
  { file: "typing.mp3", kbps: 128, level: "max", make: makeTyping, params: { sec: 12, seed: 3410 } },
  { file: "key.mp3", kbps: 128, level: "max", make: makeKey, params: { seed: 3411, body: 560, level: 0.8, decay: 0.006, up: 0.06 } },
  { file: "key-delete.mp3", kbps: 128, level: "max", make: makeKey, params: { seed: 3412, body: 330, level: 1, decay: 0.009, up: 0.09 } },
  { file: "page-turn.mp3", kbps: 128, level: "max", make: makePageTurn, params: { seed: 3420, dur: 0.74, land: 0.6 } },
  { file: "page-riffle.mp3", kbps: 128, level: "max", make: makeRiffle, params: { seed: 3421, at: [0, 0.17, 0.31, 0.47] } },
  { file: "book-open.mp3", kbps: 128, level: "max", make: makeBookOpen, params: { seed: 3422 } },
  { file: "book-take.mp3", kbps: 128, level: "max", make: makeBookTake, params: { seed: 3423 } },
  { file: "bookmark.mp3", kbps: 128, level: "max", make: makeSlide, params: { seed: 3424, dur: 0.65 } },
  { file: "cloth.mp3", kbps: 128, level: "max", make: makeCloth, params: { seed: 3430, dur: 0.5, density: 260, tone: 2300 } },
  { file: "cloth-long.mp3", kbps: 128, level: "max", make: makeCloth, params: { seed: 3431, dur: 0.85, density: 220, tone: 1900 } },
  { file: "sit.mp3", kbps: 128, level: "max", make: makeSit, params: { seed: 3432 } },
  { file: "phone-tap.mp3", kbps: 128, level: "max", make: makePhoneTap, params: { seed: 3440 } },
  { file: "click.mp3", kbps: 128, level: "max", make: makeClick, params: { seed: 3441 } },
  { file: "tick.mp3", kbps: 128, level: "max", make: makeTick, params: { hz: 1318.5 } },
];
// Общий код синтеза входит в хэш каждого звука (вместе с генератором звука).
// Сюда — каждая функция и константа, которую вызывают генераторы и общие
// функции, в том числе из lib/audio.mjs; пропуск проверяется ниже.
const SHARED_FNS = [buf, clamp01, smooth, midiHz, noise, pink, biquad, env, bell, add, ping, room, freeverb, loopVerb, loopFilter, kWeight, loudness, wavetable, padNote, feltNote, keystroke, flip, makeCloth, mulberry32, writeWav];
const SHARED_DATA = { TAU, TABLE_N, CHORDS, MELODY, PAD_TAB, DRONE_TAB, COMB, ALLPASS };
const SHARED = SHARED_FNS.map((f) => f.toString()).join("\n") + JSON.stringify(SHARED_DATA);
// Без проверки правка пропущенной функции оставила бы старые MP3, а --check
// принял бы их. Имена верхнего уровня этого файла и импорта из lib/audio.mjs,
// упомянутые в генераторах и общих функциях, должны быть в хэше.
{
  const src = readFileSync(fileURLToPath(import.meta.url), "utf8");
  const top = new Set([...src.matchAll(/^const (\w+) =/gm)].map((m) => m[1]));
  for (const m of src.matchAll(/^import \{([^}]+)\} from "\.\/lib\/audio\.mjs"/gm)) for (const n of m[1].split(",")) top.add(n.trim());
  const hashed = new Set([...SHARED_FNS.map((f) => f.name), ...Object.keys(SHARED_DATA), "SR", "REF", "PEAK", "VERSION"]);
  const miss = new Set();
  for (const f of [...SHARED_FNS, ...SOUNDS.map((s) => s.make)])
    for (const [, n] of f.toString().matchAll(/(?<![\w.$])([A-Za-z_$][\w$]*)/g)) if (top.has(n) && n !== f.name && !hashed.has(n)) miss.add(n);
  if (miss.size) throw new Error(`el34-sound: добавьте в SHARED_FNS/SHARED_DATA: ${[...miss].join(", ")}`);
}
const ENC = (kbps, ch) => ["-ar", String(SR), "-ac", String(ch), "-codec:a", "libmp3lame", "-b:a", `${kbps}k`, "-fflags", "+bitexact", "-flags:a", "+bitexact", "-map_metadata", "-1"];

const sha = (s) => createHash("sha256").update(s).digest("hex");
const specHash = (s) => sha(JSON.stringify({ VERSION, SR, REF, PEAK, file: s.file, kbps: s.kbps, level: s.level, params: s.params, enc: ENC(s.kbps, 0) }) + s.make.toString() + SHARED).slice(0, 16);

const render = (s, tmp) => {
  const ch = s.make(s.params);
  const target = REF + (ch.length === 2 ? 3.01 : 0);
  const lu = loudness(ch, s.level === "max" ? 0.1 : undefined);
  let peak = 0;
  for (const c of ch) for (const v of c) peak = Math.max(peak, Math.abs(v));
  const g = Math.min(Math.pow(10, (target - lu) / 20), Math.pow(10, PEAK / 20) / (peak || 1));
  for (const c of ch) for (let i = 0; i < c.length; i++) c[i] *= g;
  const wav = join(tmp, s.file.replace(/\.mp3$/, ".wav"));
  writeWav(wav, ch, SR);
  ffmpeg(["-i", wav, ...ENC(s.kbps, ch.length), join(OUT, s.file)]);
  return {
    sec: Math.round((ch[0].length / SR) * 1000) / 1000,
    channels: ch.length,
    lufs: Math.round((lu + 20 * Math.log10(g)) * 10) / 10,
    peakDb: Math.round(20 * Math.log10(peak * g) * 10) / 10,
  };
};

const old = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { files: {} };
const files = {};
const stale = [];
let tmp = null;
mkdirSync(OUT, { recursive: true });
for (const s of SOUNDS) {
  const hash = specHash(s);
  const path = join(OUT, s.file);
  const prev = old.files?.[s.file];
  const same = prev && prev.hash === hash && existsSync(path) && sha(readFileSync(path)) === prev.sha256;
  if (same && !force) {
    files[s.file] = prev;
    continue;
  }
  if (check) {
    stale.push(s.file);
    continue;
  }
  tmp ??= join(tmpdir(), `el34-sound-${process.pid}`);
  mkdirSync(tmp, { recursive: true });
  const info = render(s, tmp);
  files[s.file] = { hash, sha256: sha(readFileSync(path)), ...info };
  console.log(`+ ${path}  ${info.sec} с, ${info.channels === 2 ? "стерео" : "моно"}, ${info.lufs} LUFS, пик ${info.peakDb} dBFS`);
}
// звуки, которых больше нет в реестре
for (const f of Object.keys(old.files ?? {})) {
  if (files[f] || SOUNDS.some((s) => s.file === f)) continue;
  if (check) stale.push(`${f} (лишний)`);
  else rmSync(join(OUT, f), { force: true });
}
if (tmp) rmSync(tmp, { recursive: true, force: true });
if (check) {
  if (stale.length) {
    console.error(`el34-sound: файлы не совпадают со spec — запустите node scripts/el34-sound.mjs: ${stale.join(", ")}`);
    process.exit(1);
  }
  console.log(`el34-sound: все ${SOUNDS.length} звуков совпадают со spec.`);
} else {
  const next = `${JSON.stringify({ version: VERSION, sampleRate: SR, refLufs: REF, files }, null, 2)}\n`;
  if (!existsSync(MANIFEST) || readFileSync(MANIFEST, "utf8") !== next) writeFileSync(MANIFEST, next);
  const made = SOUNDS.filter((s) => files[s.file] !== old.files?.[s.file]).length;
  console.log(made ? `el34-sound: создано ${made} из ${SOUNDS.length}.` : `el34-sound: все ${SOUNDS.length} звуков уже готовы — пропуск.`);
}
