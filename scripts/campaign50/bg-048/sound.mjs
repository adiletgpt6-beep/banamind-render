// Музыка и звуки BG-048 «Үй-бүлөлүк диспетчердик», синтезированные кодом
// (детерминированно, без сэмплов и лицензионных ограничений)
// → public/audio/campaign50/bg-048/.
//
//   music-mission.mp3 — лёгкая комедийная тема «центра управления»:
//     маримба + пиццикато «ум-па», мягкий бас, тихий тикающий хай-хэт.
//   music-home.mp3    — та же гармония и темп, теплее и спокойнее:
//     «войлочное» фортепиано, мягкий пэд, круглый бас.
//   Обе: 104 BPM, фа мажор, F – Dm7 – Gm7 – C7 (такт на аккорд), 110 с,
//   одинаковая форма по 4-тактовым фразам → их можно сводить кроссфейдом
//   на любой тактовой доле. Стерео, пик −3 дБFS, 192 кбит/с.
//   sfx/*.mp3 — короткие мягкие эффекты (моно, пик ≈ −6 дБFS).
//
// Запуск: node scripts/campaign50/bg-048/sound.mjs
import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SAMPLE_RATE as SR, ffmpeg, mulberry32, normalizePeak, writeWav } from "./audio.mjs";

const OUT = "public/audio/campaign50/bg-048";
const TMP = join(tmpdir(), "balago-bg048-sound");
mkdirSync(join(OUT, "sfx"), { recursive: true });
mkdirSync(TMP, { recursive: true });

const TAU = Math.PI * 2;
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

// ---------- Обработка ----------
// Биквад (RBJ) с возможностью менять частоту на каждом отсчёте.
const biquad = (type) => {
  let x1 = 0;
  let x2 = 0;
  let y1 = 0;
  let y2 = 0;
  let lastF = -1;
  let lastQ = -1;
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  let a1 = 0;
  let a2 = 0;
  const coef = (f, q) => {
    const w = (TAU * Math.min(f, SR * 0.45)) / SR;
    const cw = Math.cos(w);
    const al = Math.sin(w) / (2 * q);
    const a0 = 1 + al;
    if (type === "lp") {
      b0 = (1 - cw) / 2 / a0;
      b1 = (1 - cw) / a0;
      b2 = b0;
    } else if (type === "hp") {
      b0 = (1 + cw) / 2 / a0;
      b1 = -(1 + cw) / a0;
      b2 = b0;
    } else {
      // полосовой с усилением 0 дБ в центре
      b0 = al / a0;
      b1 = 0;
      b2 = -al / a0;
    }
    a1 = (-2 * cw) / a0;
    a2 = (1 - al) / a0;
  };
  return (x, f, q = 0.707) => {
    if (f !== lastF || q !== lastQ) {
      coef(f, q);
      lastF = f;
      lastQ = q;
    }
    const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1;
    x1 = x;
    y2 = y1;
    y1 = y;
    return y;
  };
};

const filterInPlace = (ch, type, f, q = 0.707) => {
  const bq = biquad(type);
  for (let i = 0; i < ch.length; i++) ch[i] = bq(ch[i], f, q);
};

const rms = (a) => {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * a[i];
  return Math.sqrt(s / Math.max(1, a.length));
};

// Небольшая стерео-реверберация (схема Freeverb), уровень «мокрого» сигнала
// задаётся относительно сухого по RMS.
const reverb = (L, R, wetRatio, room = 0.8, damp = 0.3) => {
  const combT = [1116, 1188, 1277, 1356, 1422, 1491];
  const apT = [556, 441, 341];
  const proc = (inp, spread) => {
    const out = new Float32Array(inp.length);
    const combs = combT.map((d) => ({ buf: new Float32Array(d + spread), i: 0, store: 0 }));
    const aps = apT.map((d) => ({ buf: new Float32Array(d + spread), i: 0 }));
    for (let n = 0; n < inp.length; n++) {
      const x = inp[n];
      let s = 0;
      for (const c of combs) {
        const y = c.buf[c.i];
        c.store = y * (1 - damp) + c.store * damp;
        c.buf[c.i] = x + c.store * room;
        if (++c.i >= c.buf.length) c.i = 0;
        s += y;
      }
      for (const a of aps) {
        const b = a.buf[a.i];
        a.buf[a.i] = s + b * 0.5;
        s = b - s;
        if (++a.i >= a.buf.length) a.i = 0;
      }
      out[n] = s;
    }
    return out;
  };
  const mono = new Float32Array(L.length);
  for (let i = 0; i < L.length; i++) mono[i] = (L[i] + R[i]) * 0.5;
  const wl = proc(mono, 0);
  const wr = proc(mono, 23);
  const k = (wetRatio * rms(mono)) / Math.max(1e-9, (rms(wl) + rms(wr)) / 2);
  for (let i = 0; i < L.length; i++) {
    L[i] += wl[i] * k;
    R[i] += wr[i] * k;
  }
};

const save = (name, channels, peakDb) => {
  normalizePeak(channels, peakDb);
  const wav = join(TMP, `${name.replace("/", "-")}.wav`);
  writeWav(wav, channels);
  ffmpeg(["-i", wav, "-codec:a", "libmp3lame", "-b:a", "192k", join(OUT, `${name}.mp3`)]);
  console.log(`+ ${OUT}/${name}.mp3`);
};

// ---------- Музыка ----------
const DUR = 110;
const BPM = 104;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const E8 = BEAT / 2;
const NBARS = Math.ceil(DUR / BAR);

// F – Dm7 – Gm7 – C7: бас, квинта, аккорд «па», пэд, арпеджио фортепиано
const HARM = [
  { bass: 41, fifth: 48, stab: [60, 65, 69], pad: [53, 57, 60, 64], arp: [53, 60, 65, 69, 72] },
  { bass: 38, fifth: 45, stab: [62, 65, 69], pad: [53, 57, 60, 62], arp: [50, 57, 62, 65, 69] },
  { bass: 43, fifth: 50, stab: [62, 65, 70], pad: [53, 55, 58, 62], arp: [55, 58, 62, 65, 70] },
  { bass: 36, fifth: 43, stab: [60, 64, 70], pad: [52, 55, 58, 60], arp: [48, 55, 60, 64, 70] },
];

// Мелодии на восьмых (null — пауза), по такту на аккорд.
const _ = null;
const MEL = {
  A: [
    [81, _, 84, 81, 77, _, 79, 81],
    [77, _, 74, _, 81, _, _, _],
    [82, _, 86, 82, 79, _, 81, 82],
    [84, _, 79, _, 76, _, _, _],
  ],
  B: [
    [77, _, 81, _, 84, 86, 84, _],
    [81, _, 77, 81, 86, _, _, _],
    [86, _, 82, _, 79, _, 77, 79],
    [76, _, 79, _, 84, _, _, _],
  ],
  // «разреженная» фраза — простор для речи
  S: [
    [81, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _],
    [82, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, 72, 76],
  ],
  intro: [
    [_, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, 72, 76],
  ],
};
// Форма по 4-тактовым фразам (одна и та же для обеих дорожек).
const PLAN = ["intro", "A", "S", "B", "S", "A", "S", "B", "S", "A", "S", "B"];
const sectionOf = (bar) => PLAN[Math.floor(bar / 4)] ?? "S";

const panGains = (pan) => [Math.cos(((pan + 1) * Math.PI) / 4), Math.sin(((pan + 1) * Math.PI) / 4)];

const addVoice = (L, R, start, dur, pan, fn) => {
  const s0 = Math.max(0, Math.floor(start * SR));
  const len = Math.floor(dur * SR);
  const [gl, gr] = panGains(pan);
  for (let i = 0; i < len && s0 + i < L.length; i++) {
    const v = fn(i / SR);
    L[s0 + i] += v * gl;
    R[s0 + i] += v * gr;
  }
};

// маримба: мягкая колотушка, основной тон + характерный обертон ×3,93
const marimba = (L, R, start, midi, amp, pan) => {
  const f = hz(midi);
  addVoice(L, R, start, 1.0, pan, (t) => {
    const att = Math.min(1, t / 0.004);
    return (
      att *
      amp *
      (Math.sin(TAU * f * t) * Math.exp(-t / 0.34) + 0.28 * Math.sin(TAU * 3.93 * f * t) * Math.exp(-t / 0.045) + 0.1 * Math.sin(TAU * 2 * f * t) * Math.exp(-t / 0.12))
    );
  });
};

// пиццикато: Карплус–Стронг с мягким (отфильтрованным) возбуждением
const pluck = (L, R, start, midi, amp, pan, rand) => {
  const f = hz(midi);
  const N = Math.max(2, Math.round(SR / f));
  const len = Math.floor(0.7 * SR);
  const buf = new Float32Array(N);
  let lp = 0;
  for (let i = 0; i < N; i++) {
    lp = lp * 0.55 + (rand() * 2 - 1) * 0.45;
    buf[i] = lp;
  }
  const s0 = Math.floor(start * SR);
  const [gl, gr] = panGains(pan);
  let prev = 0;
  for (let i = 0; i < len && s0 + i < L.length; i++) {
    const k = i % N;
    const cur = buf[k];
    buf[k] = 0.993 * 0.5 * (cur + prev);
    prev = cur;
    const t = i / SR;
    const v = cur * amp * Math.exp(-t / 0.22) * Math.min(1, t / 0.002);
    L[s0 + i] += v * gl;
    R[s0 + i] += v * gr;
  }
};

// мягкий бас: синус + немного второй гармоники
const bassNote = (L, R, start, midi, amp, decay, dur) => {
  const f = hz(midi);
  addVoice(L, R, start, dur, 0, (t) => {
    const att = Math.min(1, t / 0.012);
    const rel = Math.min(1, (dur - t) / 0.08);
    return att * rel * amp * Math.exp(-t / decay) * (Math.sin(TAU * f * t) + 0.22 * Math.sin(TAU * 2 * f * t + 0.4));
  });
};

// тихий хай-хэт: шум через фильтр верхних частот
const hat = (L, R, start, amp, rand) => {
  const s0 = Math.floor(start * SR);
  const len = Math.floor(0.06 * SR);
  const hp = biquad("hp");
  const [gl, gr] = panGains(0.35);
  for (let i = 0; i < len && s0 + i < L.length; i++) {
    const t = i / SR;
    const v = hp(rand() * 2 - 1, 7000, 0.9) * amp * Math.exp(-t / 0.016);
    L[s0 + i] += v * gl;
    R[s0 + i] += v * gr;
  }
};

// «радарный» блип пульта — очень тихо, раз в 8 тактов
const blip = (L, R, start, amp) => {
  let ph = 0;
  addVoice(L, R, start, 0.16, -0.4, (t) => {
    const f = 1180 + 380 * Math.min(1, t / 0.05);
    ph += (TAU * f) / SR;
    return amp * Math.sin(ph) * Math.min(1, t / 0.006) * Math.min(1, (0.16 - t) / 0.06);
  });
};

// «войлочное» фортепиано: основной тон + мягкие обертоны, верх гаснет быстрее
const piano = (L, R, start, midi, amp, pan) => {
  const f = hz(midi);
  addVoice(L, R, start, 3.0, pan, (t) => {
    const att = Math.min(1, t / 0.01);
    return (
      att *
      amp *
      (Math.sin(TAU * f * t) * Math.exp(-t / 1.4) +
        0.3 * Math.sin(TAU * 2 * f * t + 0.3) * Math.exp(-t / 0.6) +
        0.09 * Math.sin(TAU * 3 * f * t + 0.6) * Math.exp(-t / 0.3))
    );
  });
};

const pad = (L, R, start, dur, midis, amp) => {
  const s0 = Math.floor(start * SR);
  const len = Math.floor(dur * SR);
  for (let i = 0; i < len && s0 + i < L.length; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.9) * Math.min(1, (dur - t) / 0.9);
    let v = 0;
    midis.forEach((m, k) => {
      const f = hz(m);
      v += Math.sin(TAU * f * t + k) * 0.6 + Math.sin(TAU * f * 1.0035 * t + k * 2) * 0.4;
    });
    v *= (env * amp) / midis.length;
    const wob = 0.12 * Math.sin((start + t) * 0.6);
    L[s0 + i] += v * (1 + wob);
    R[s0 + i] += v * (1 - wob);
  }
};

const fades = (L, R, inSec, outSec) => {
  const n = L.length;
  for (let i = 0; i < n; i++) {
    const g = Math.min(1, i / (inSec * SR), (n - 1 - i) / (outSec * SR));
    L[i] *= g;
    R[i] *= g;
  }
};

const musicMission = () => {
  const n = Math.round(DUR * SR);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const rand = mulberry32(4801);
  const jit = () => (rand() - 0.5) * 0.012;
  for (let b = 0; b < NBARS; b++) {
    const h = HARM[b % 4];
    const t0 = b * BAR;
    const inPhrase = b % 4;
    const sec = sectionOf(b);
    // бас «ум» на 1 и 3, на последнем такте фразы — подход к тонике
    bassNote(L, R, t0, h.bass, 0.36, 0.45, BEAT * 0.95);
    bassNote(L, R, t0 + 2 * BEAT, h.fifth, 0.28, 0.4, BEAT * 0.9);
    if (inPhrase === 3) bassNote(L, R, t0 + 3 * BEAT, h.bass + 4, 0.24, 0.35, BEAT * 0.85);
    // пиццикато «па» на 2 и 4
    for (const beat of [1, 3]) {
      h.stab.forEach((m, k) => pluck(L, R, t0 + beat * BEAT + jit() + k * 0.006, m, 0.13 * (0.92 + rand() * 0.16), -0.5 + k * 0.25, rand));
    }
    // хай-хэт на восьмых (со второго такта), слабые доли тише
    if (b >= 2) {
      for (let e = 0; e < 8; e++) hat(L, R, t0 + e * E8 + jit(), e % 2 ? 0.05 : 0.025, rand);
    }
    // мелодия маримбы
    MEL[sec][inPhrase].forEach((m, e) => {
      if (m !== null) marimba(L, R, t0 + e * E8 + jit(), m, (sec === "S" || sec === "intro" ? 0.13 : 0.17) * (0.9 + rand() * 0.2), 0.2);
    });
    if (b % 8 === 7) blip(L, R, t0 + 3.5 * BEAT, 0.035);
  }
  filterInPlace(L, "hp", 30);
  filterInPlace(R, "hp", 30);
  reverb(L, R, 0.28);
  filterInPlace(L, "lp", 7500);
  filterInPlace(R, "lp", 7500);
  fades(L, R, 1.2, 3);
  save("music-mission", [L, R], -3.2);
};

const musicHome = () => {
  const n = Math.round(DUR * SR);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const rand = mulberry32(4802);
  const jit = () => (rand() - 0.5) * 0.016;
  for (let b = 0; b < NBARS; b++) {
    const h = HARM[b % 4];
    const t0 = b * BAR;
    const inPhrase = b % 4;
    const sec = sectionOf(b);
    bassNote(L, R, t0, h.bass, 0.3, 1.1, BAR * 0.9);
    if (inPhrase === 3) bassNote(L, R, t0 + 3 * BEAT, h.bass + 4, 0.16, 0.5, BEAT * 0.9);
    pad(L, R, t0, BAR + 0.9, h.pad, 0.2);
    // спокойное арпеджио: доли 1, 2, 2½, 3, 4
    const slots = [0, 2, 3, 4, 6];
    const idx = [0, 2, 3, 4, 3];
    slots.forEach((e, j) => piano(L, R, t0 + e * E8 + jit(), h.arp[idx[j]], (j === 0 ? 0.13 : 0.1) * (0.9 + rand() * 0.2), (idx[j] - 2) * 0.22));
    // та же мелодия, мягко и на октаву ниже (в разреженных фразах — те же редкие ноты)
    MEL[sec][inPhrase].forEach((m, e) => {
      if (m !== null) piano(L, R, t0 + e * E8 + jit(), m - 12, 0.12 * (0.9 + rand() * 0.2), 0.15);
    });
  }
  filterInPlace(L, "hp", 30);
  filterInPlace(R, "hp", 30);
  reverb(L, R, 0.4, 0.84, 0.35);
  filterInPlace(L, "lp", 5200);
  filterInPlace(R, "lp", 5200);
  fades(L, R, 1.5, 3);
  save("music-home", [L, R], -3.2);
};

// ---------- Эффекты ----------
const noise = (len, seed) => {
  const r = mulberry32(seed);
  return Float32Array.from({ length: len }, () => r() * 2 - 1);
};
const sfx = (name, dur, fn, lp = 6000, hp = 40) => {
  const n = Math.round(dur * SR);
  const ch = new Float32Array(n);
  fn(ch, n);
  filterInPlace(ch, "hp", hp);
  filterInPlace(ch, "lp", lp);
  // короткие хвосты без щелчка в конце
  const tail = Math.min(n, Math.round(0.006 * SR));
  for (let i = 0; i < tail; i++) ch[n - 1 - i] *= i / tail;
  save(`sfx/${name}`, [ch], -6.2);
};
const dec = (t, tau) => (t < 0 ? 0 : Math.exp(-t / tau));

const effects = () => {
  // кнопка пульта: нажатие + отпускание
  sfx("click", 0.12, (ch, n) => {
    const nz = noise(n, 11);
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const c = (u, a) => a * (nz[i] * 0.5 * dec(u, 0.003) + 0.5 * Math.sin(TAU * 2100 * u) * dec(u, 0.006) + 0.6 * Math.sin(TAU * 190 * u) * dec(u, 0.02));
      ch[i] = c(t, 1) + (t > 0.045 ? c(t - 0.045, 0.45) : 0);
    }
  }, 6000);

  // мягкий блип лампы
  sfx("beep", 0.17, (ch, n) => {
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const env = Math.min(1, t / 0.01) * Math.min(1, (0.17 - t) / 0.07);
      ch[i] = env * (Math.sin(TAU * 988 * t) + 0.12 * Math.sin(TAU * 1976 * t));
    }
  }, 5000);

  // пружинка «бойнг»
  sfx("boing", 0.75, (ch, n) => {
    let ph = 0;
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const f = (170 + 70 * Math.min(1, t / 0.5)) * (1 + 0.32 * Math.sin(TAU * 13 * t) * dec(t, 0.25));
      ph += (TAU * f) / SR;
      ch[i] = Math.min(1, t / 0.004) * dec(t, 0.28) * (Math.sin(ph) + 0.3 * Math.sin(2 * ph) + 0.12 * Math.sin(3 * ph));
    }
  }, 3200);

  // мягкий поток воздуха
  sfx("whoosh", 0.6, (ch, n) => {
    const nz = noise(n, 23);
    const bp = biquad("bp");
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const u = t / 0.6;
      const f = 450 + 1700 * Math.sin(Math.PI * Math.min(1, u * 1.1));
      ch[i] = bp(nz[i], f, 0.9) * Math.pow(Math.sin(Math.PI * u), 2);
    }
  }, 5000, 120);

  // картон/бумага складывается: шорох, хрусткие зёрна, мягкий стук в конце
  sfx("fold", 0.62, (ch, n) => {
    const nz = noise(n, 31);
    const r = mulberry32(32);
    const lpRustle = biquad("lp");
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const env = Math.min(1, t / 0.04) * dec(t - 0.12, 0.16) * (t < 0.12 ? 1 : 1);
      ch[i] = lpRustle(nz[i], 1600, 0.7) * env * 0.7;
    }
    // хрусткие «зёрна» (сгибы)
    const grains = 26;
    for (let g = 0; g < grains; g++) {
      const at = 0.45 * Math.pow(r(), 1.3);
      const len = 0.004 + r() * 0.014;
      const amp = (0.35 + r() * 0.5) * (1 - at / 0.6);
      const f = 1200 + r() * 2600;
      const bp = biquad("bp");
      const s0 = Math.floor(at * SR);
      for (let i = 0; i < len * SR && s0 + i < n; i++) {
        const t = i / SR;
        ch[s0 + i] += bp(r() * 2 - 1, f, 1.2) * amp * Math.sin((Math.PI * t) / len) * 2.2;
      }
    }
    // картон ложится
    for (let i = 0; i < n; i++) {
      const u = i / SR - 0.47;
      if (u >= 0) ch[i] += (0.8 * Math.sin(TAU * 115 * u) + 0.3 * nz[i]) * dec(u, 0.035);
    }
  }, 4800, 60);

  // «пффф» — кнопка сдувается и ничего не делает
  sfx("pfft", 0.5, (ch, n) => {
    const nz = noise(n, 41);
    const lp = biquad("lp");
    let ph = 0;
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const u = t / 0.5;
      const env = Math.min(1, t / 0.012) * Math.pow(1 - u, 1.6);
      const cut = 2600 * Math.pow(1 - u, 1.5) + 250;
      const air = lp(nz[i], cut, 0.8);
      const f = 150 - 75 * u;
      ph += (TAU * f) / SR;
      const flutter = 0.6 + 0.4 * Math.sin(TAU * 28 * t);
      const tone = (Math.sin(ph) + 0.35 * Math.sin(2 * ph) + 0.18 * Math.sin(3 * ph)) * flutter;
      ch[i] = env * (air * 0.9 + tone * 0.35);
    }
  }, 3000, 60);

  // вибрация телефона: два импульса
  sfx("buzz", 0.6, (ch, n) => {
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const pulse = (a, b) => Math.min(1, Math.max(0, (t - a) / 0.012), Math.max(0, (b - t) / 0.012));
      const env = Math.max(pulse(0, 0.25), pulse(0.33, 0.58));
      const f = 160;
      const rattle = 0.85 + 0.15 * Math.sin(TAU * 31 * t);
      ch[i] = env * rattle * (Math.sin(TAU * f * t) + Math.sin(TAU * 3 * f * t) / 3 + Math.sin(TAU * 5 * f * t) / 6);
    }
  }, 1800, 70);

  // мягкий щелчок клавиши
  sfx("type", 0.06, (ch, n) => {
    const nz = noise(n, 51);
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      ch[i] = nz[i] * 0.45 * dec(t, 0.004) + 0.3 * Math.sin(TAU * 3100 * t) * dec(t, 0.005) + 0.5 * Math.sin(TAU * 380 * t) * dec(t, 0.012);
    }
  }, 6000, 120);

  // касание экрана
  sfx("tap", 0.07, (ch, n) => {
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      ch[i] = Math.sin(TAU * 1400 * t) * dec(t, 0.009) + 0.5 * Math.sin(TAU * 260 * t) * dec(t, 0.015);
    }
  }, 5000, 80);

  // отправка: мягкий «свуш» + «поп»
  sfx("send", 0.42, (ch, n) => {
    const nz = noise(n, 61);
    const bp = biquad("bp");
    let ph = 0;
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const u = Math.min(1, t / 0.25);
      const sw = bp(nz[i], 600 + 2400 * u * u, 1.1) * Math.sin(Math.PI * u) * (t < 0.25 ? 1 : 0);
      const pt = t - 0.23;
      let pop = 0;
      if (pt >= 0) {
        ph += (TAU * (650 + 450 * Math.min(1, pt / 0.03))) / SR;
        pop = Math.sin(ph) * Math.min(1, pt / 0.003) * dec(pt, 0.045);
      }
      ch[i] = sw * 1.4 + pop * 0.7;
    }
  }, 6000, 120);

  // спокойный двухнотный «инфо»-сигнал (не фанфара)
  sfx("chime", 1.05, (ch, n) => {
    const bell = (u, f) =>
      u < 0 ? 0 : Math.min(1, u / 0.004) * (Math.sin(TAU * f * u) * dec(u, 0.38) + 0.22 * Math.sin(TAU * 2.76 * f * u) * dec(u, 0.12) + 0.08 * Math.sin(TAU * 5.4 * f * u) * dec(u, 0.04));
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      ch[i] = bell(t, hz(79)) * 0.85 + bell(t - 0.17, hz(84));
    }
  }, 6000, 120);

  // матричный принтер: стрекот иголок, моторчик, протяжка строки
  sfx("printer", 0.82, (ch, n) => {
    const r = mulberry32(71);
    const nz = noise(n, 72);
    // иголки: «буквы» по 5–7 ударов
    let at = 0.02;
    while (at < 0.62) {
      const k = 5 + Math.floor(r() * 3);
      for (let j = 0; j < k; j++) {
        const s0 = Math.floor((at + j * 0.0105) * SR);
        const amp = 0.55 + r() * 0.45;
        for (let i = 0; i < 0.006 * SR && s0 + i < n; i++) {
          const t = i / SR;
          ch[s0 + i] += amp * (nz[s0 + i] * 0.6 * dec(t, 0.0012) + 0.5 * Math.sin(TAU * 2300 * t) * dec(t, 0.0018));
        }
      }
      at += k * 0.0105 + 0.018 + r() * 0.01;
    }
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const motor = Math.min(1, t / 0.05) * Math.min(1, (0.82 - t) / 0.06);
      ch[i] += 0.1 * motor * (Math.sin(TAU * 105 * t) + 0.4 * Math.sin(TAU * 210 * t));
      // протяжка бумаги в конце
      const u = t - 0.64;
      if (u >= 0 && u < 0.14) ch[i] += 0.25 * Math.sin(Math.PI * (u / 0.14)) * Math.sin(TAU * (320 + 900 * u) * u);
    }
  }, 5000, 120);

  // «поп» пробки
  sfx("pop", 0.16, (ch, n) => {
    const nz = noise(n, 81);
    const lp = biquad("lp");
    let ph = 0;
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const f = 300 + 650 * dec(t, 0.012);
      ph += (TAU * f) / SR;
      ch[i] = Math.sin(ph) * Math.min(1, t / 0.0015) * dec(t, 0.028) + 0.35 * nz[i] * dec(t, 0.002) + 0.18 * lp(nz[i], 1800) * dec(t, 0.05);
    }
  }, 5000, 80);

  // переворот бумажной карточки: «фшух» + лёгкий шлепок
  sfx("flip", 0.32, (ch, n) => {
    const nz = noise(n, 91);
    const bp = biquad("bp");
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const flap = Math.sin(Math.PI * Math.min(1, t / 0.15)) * (t < 0.15 ? 1 : 0) + 0.5 * (t > 0.13 && t < 0.24 ? Math.sin((Math.PI * (t - 0.13)) / 0.11) : 0);
      const air = bp(nz[i], 1800 + 1200 * Math.sin(Math.PI * Math.min(1, t / 0.24)), 0.9) * flap;
      const u = t - 0.24;
      const snap = u >= 0 ? (nz[i] * 0.5 * dec(u, 0.003) + 0.6 * Math.sin(TAU * 900 * u) * dec(u, 0.008)) : 0;
      ch[i] = air * 1.3 + snap;
    }
  }, 6000, 150);

  // лёгкие искорки (пентатоника, мягкий верх)
  sfx("sparkle", 0.62, (ch, n) => {
    const r = mulberry32(101);
    const notes = [84, 86, 88, 91, 93, 96, 98];
    const pings = 22;
    for (let k = 0; k < pings; k++) {
      const at = 0.5 * Math.pow(k / pings, 1.25) + r() * 0.02;
      const f = hz(notes[Math.floor(r() * notes.length)]);
      const amp = (0.5 + r() * 0.5) * (1 - 0.6 * (k / pings));
      const s0 = Math.floor(at * SR);
      for (let i = 0; s0 + i < n && i < 0.2 * SR; i++) {
        const t = i / SR;
        ch[s0 + i] += amp * Math.min(1, t / 0.002) * dec(t, 0.05) * (Math.sin(TAU * f * t) + 0.15 * Math.sin(TAU * 2.01 * f * t));
      }
    }
    const nz = noise(n, 102);
    const hp = biquad("hp");
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      ch[i] += 0.06 * hp(nz[i], 4000) * Math.sin(Math.PI * Math.min(1, t / 0.6));
    }
  }, 7000, 300);

  // очень мягкое «ой-ой» (две ноты с лёгкой вибрацией)
  sfx("alarm", 0.82, (ch, n) => {
    let ph = 0;
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const first = t < 0.36;
      const u = first ? t : t - 0.4;
      const len = first ? 0.36 : 0.42;
      const base = first ? hz(67) : hz(64);
      const env = u < 0 ? 0 : Math.min(1, u / 0.03) * Math.min(1, Math.max(0, (len - u) / 0.08));
      const f = base * (1 + 0.012 * Math.sin(TAU * 6 * t)) * (1 - 0.03 * Math.min(1, Math.max(0, u) / len));
      ph += (TAU * f) / SR;
      ch[i] = env * (Math.sin(ph) + 0.2 * Math.sin(2 * ph) + 0.07 * Math.sin(3 * ph));
    }
  }, 2600, 120);

  // кот: короткое мурчание и «мррп»
  sfx("purr", 0.62, (ch, n) => {
    const nz = noise(n, 111);
    const lp = biquad("lp");
    const form = biquad("bp");
    let ph = 0;
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      // мурчание 0…0,34
      const am = Math.pow(0.5 + 0.5 * Math.sin(TAU * 26 * t), 2);
      const purrEnv = Math.min(1, t / 0.04) * Math.min(1, Math.max(0, (0.34 - t) / 0.06));
      const purr = (lp(nz[i], 320, 0.8) * 1.6 + 0.35 * Math.sin(TAU * 52 * t)) * am * purrEnv;
      // «мррп» 0,30…0,62: тон 300 → 520 → 420 Гц, «р» в начале
      const u = t - 0.3;
      let mrr = 0;
      if (u >= 0) {
        const k = u / 0.32;
        const f0 = 300 + 220 * Math.sin(Math.PI * Math.min(1, k * 1.3)) + 120 * k;
        ph += (TAU * f0) / SR;
        let v = 0;
        for (let hN = 1; hN <= 6; hN++) v += Math.sin(hN * ph) / hN;
        const roll = 1 - 0.45 * Math.max(0, 1 - k * 2.5) * (0.5 + 0.5 * Math.sin(TAU * 30 * u));
        const env = Math.min(1, u / 0.03) * Math.min(1, Math.max(0, (0.32 - u) / 0.1));
        mrr = form(v, 900, 0.9) * 1.8 * roll * env;
      }
      ch[i] = purr + mrr;
    }
  }, 3000, 40);

  // машина проезжает: мягкий гул мотора с доплером + шуршание шин
  sfx("car", 1.25, (ch, n) => {
    const nz = noise(n, 121);
    const lp = biquad("lp");
    let ph = 0;
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const x = (t - 0.62) / 0.3;
      const dop = 1 + 0.045 * (-Math.tanh(x));
      const f0 = 46 * dop;
      ph += (TAU * f0) / SR;
      const amps = [1, 0.65, 0.5, 0.32, 0.2, 0.1];
      let eng = 0;
      amps.forEach((a, k) => {
        eng += a * Math.sin((k + 1) * ph + k);
      });
      eng *= 0.8 + 0.2 * Math.sin(ph * 0.5);
      const env = Math.exp(-x * x * 0.9) * Math.min(1, t / 0.05) * Math.min(1, (1.25 - t) / 0.08);
      ch[i] = env * (eng * 0.6 + lp(nz[i], 550, 0.7) * 1.2);
    }
  }, 1600, 30);
};

musicMission();
musicHome();
effects();
rmSync(TMP, { recursive: true, force: true });
