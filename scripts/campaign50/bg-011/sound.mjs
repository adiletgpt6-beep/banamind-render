// Музыка и звуковые эффекты BalaGoBG011 — синтез кодом (оригинальные
// звуки проекта, без лицензионных ограничений, детерминированно).
//
// Музыка: лёгкая «комедия положений», 104 BPM, фа мажор (I–vi–IV–V),
// три слоя одной гармонии и темпа (сводятся в Remotion с перекрёстными
// затуханиями):
//   music-play.mp3  — маримба, пиццикато-бас, мягкий шейкер (утро, поиски);
//   music-think.mp3 — тихий пэд и редкие ноты (записки, вечерний план);
//   music-warm.mp3  — тёплый пэд, арпеджио, мягкая бочка (BalaGo, финал).
// Эффекты: звон ключей, щелчок магнита, «фото»-щелчок стоп-кадра, мягкий
// свист перехода, хлопок, бумага, касание экрана, замок портфеля,
// колокольчик, мягкие шаги взрослого и ребёнка.
//
// Запуск: node scripts/campaign50/bg-011/sound.mjs
import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SAMPLE_RATE as SR, mulberry32, normalizePeak, wavToMp3, writeWav } from "./audio.mjs";

const OUT = "public/audio/campaign50/bg-011";
const TMP = join(tmpdir(), "balago-bg011-sound");
mkdirSync(join(OUT, "sfx"), { recursive: true });
mkdirSync(TMP, { recursive: true });
const TAU = Math.PI * 2;
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

const save = (name, channels, peakDb) => {
  normalizePeak(channels, peakDb);
  const wav = join(TMP, `${name.replace("/", "-")}.wav`);
  writeWav(wav, channels);
  wavToMp3(wav, join(OUT, `${name}.mp3`));
  console.log(`+ ${OUT}/${name}.mp3`);
};

// ---------- Музыка ----------
const DUR = 96;
const BPM = 104;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
// F – Dm – B♭ – C: бас и три голоса аккорда (MIDI)
const CHORDS = [
  [41, 57, 60, 65],
  [38, 57, 62, 65],
  [46, 58, 62, 65],
  [48, 55, 60, 64],
];
const chordAt = (t) => CHORDS[Math.floor(t / BAR) % 4];

const track = () => {
  const n = Math.round(DUR * SR);
  return [new Float32Array(n), new Float32Array(n)];
};
const pan = (p) => [Math.cos(((p + 1) * Math.PI) / 4), Math.sin(((p + 1) * Math.PI) / 4)];

const addNote = (ch, start, f0, len, amp, kind, p = 0) => {
  const [gl, gr] = pan(p);
  const s0 = Math.floor(start * SR);
  const N = Math.floor(len * SR);
  const [L, R] = ch;
  for (let i = 0; i < N && s0 + i < L.length; i++) {
    const t = i / SR;
    let v;
    if (kind === "marimba") {
      const env = Math.min(1, t / 0.003) * Math.exp(-t / 0.22);
      v = (Math.sin(TAU * f0 * t) + 0.25 * Math.sin(TAU * f0 * 4 * t) * Math.exp(-t / 0.05)) * env;
    } else if (kind === "pizz") {
      const env = Math.min(1, t / 0.004) * Math.exp(-t / 0.18);
      v = (Math.sin(TAU * f0 * t) + 0.35 * Math.sin(TAU * f0 * 2 * t)) * env;
    } else if (kind === "pad") {
      const env = Math.min(1, t / 0.6) * Math.min(1, (len - t) / 0.8);
      v = (Math.sin(TAU * f0 * t) + 0.6 * Math.sin(TAU * f0 * 1.003 * t + 1) + 0.25 * Math.sin(TAU * f0 * 2 * t)) * env * 0.5;
    } else if (kind === "bell") {
      const env = Math.min(1, t / 0.004) * Math.exp(-t / 0.5);
      v = (Math.sin(TAU * f0 * t) + 0.3 * Math.sin(TAU * f0 * 2.76 * t) * Math.exp(-t / 0.2)) * env;
    } else {
      v = 0;
    }
    L[s0 + i] += v * amp * gl;
    R[s0 + i] += v * amp * gr;
  }
};
const addKick = (ch, start, amp) => {
  const s0 = Math.floor(start * SR);
  let ph = 0;
  for (let i = 0; i < 0.3 * SR && s0 + i < ch[0].length; i++) {
    const t = i / SR;
    ph += (TAU * (46 + 60 * Math.exp(-t / 0.04))) / SR;
    const v = Math.sin(ph) * Math.exp(-t / 0.11) * amp;
    ch[0][s0 + i] += v;
    ch[1][s0 + i] += v;
  }
};
const addShaker = (ch, start, amp, p, rand) => {
  const [gl, gr] = pan(p);
  const s0 = Math.floor(start * SR);
  let prev = 0;
  for (let i = 0; i < 0.07 * SR && s0 + i < ch[0].length; i++) {
    const t = i / SR;
    const x = rand() * 2 - 1;
    const hp = x - prev;
    prev = x;
    const v = hp * Math.exp(-t / 0.02) * Math.min(1, t / 0.004) * amp;
    ch[0][s0 + i] += v * gl;
    ch[1][s0 + i] += v * gr;
  }
};

const musicPlay = () => {
  const ch = track();
  const rand = mulberry32(1101);
  // игривый мотив маримбы на восьмых: ступени аккорда с паузами
  const motif = [0, null, 2, 1, null, 2, 3, null];
  for (let t = 0, k = 0; t < DUR; t += BEAT / 2, k++) {
    const c = chordAt(t);
    const beat = k % 8;
    // пиццикато-бас: 1 и 3 доля, на 4-й — проходящая нота
    if (beat === 0) addNote(ch, t, hz(c[0]), 0.5, 0.5, "pizz", -0.2);
    if (beat === 4) addNote(ch, t, hz(c[0] + 7), 0.4, 0.38, "pizz", -0.2);
    if (beat === 7 && rand() < 0.6) addNote(ch, t, hz(c[0] + 5), 0.25, 0.3, "pizz", -0.2);
    const m = motif[(k + Math.floor(k / 16) * 3) % 8];
    if (m !== null) {
      const note = c[1 + (m % 3)] + (m === 3 ? 12 : 12);
      addNote(ch, t, hz(note), 0.5, beat % 2 ? 0.16 : 0.22, "marimba", 0.25);
    }
    // шейкер на слабые восьмые
    if (beat % 2 === 1) addShaker(ch, t, 0.08, 0.4, rand);
    if (beat === 6 && rand() < 0.5) addNote(ch, t, hz(c[3] + 12), 0.3, 0.08, "bell", 0.5);
  }
  save("music-play", ch, -3);
};

const musicThink = () => {
  const ch = track();
  for (let t = 0; t < DUR; t += BAR) {
    const c = chordAt(t);
    addNote(ch, t, hz(c[0] + 12), BAR + 0.4, 0.18, "pad", -0.3);
    for (const m of c.slice(1)) addNote(ch, t, hz(m), BAR + 0.4, 0.1, "pad", 0.2);
    // редкие мягкие ноты маримбы
    addNote(ch, t + BEAT * 1.5, hz(c[2] + 12), 0.8, 0.08, "marimba", 0.4);
    addNote(ch, t + BEAT * 3, hz(c[3] + 12), 0.8, 0.06, "marimba", -0.4);
  }
  save("music-think", ch, -4);
};

const musicWarm = () => {
  const ch = track();
  const rand = mulberry32(1103);
  for (let t = 0; t < DUR; t += BAR) {
    const c = chordAt(t);
    addNote(ch, t, hz(c[0]), BAR + 0.3, 0.2, "pad", -0.2);
    for (const m of c.slice(1)) addNote(ch, t, hz(m), BAR + 0.3, 0.09, "pad", 0.2);
    for (let b = 0; b < 8; b++) {
      const tt = t + (b * BEAT) / 2;
      addNote(ch, tt, hz(c[1 + (b % 3)] + 12), 0.45, 0.11, "marimba", b % 2 ? 0.35 : -0.15);
      if (b % 2 === 1) addShaker(ch, tt, 0.05, 0.3, rand);
    }
    for (let b = 0; b < 4; b++) addKick(ch, t + b * BEAT, b % 2 ? 0.18 : 0.26);
    addNote(ch, t, hz(c[0]), 0.6, 0.35, "pizz", -0.1);
  }
  save("music-warm", ch, -3);
};

// ---------- Эффекты ----------
const mono = (sec) => new Float32Array(Math.round(sec * SR));
const saveSfx = (name, s, peak = -3) => save(`sfx/${name}`, [s, s.slice()], peak);

// звон ключей: несколько металлических «пингов» с неровными интервалами
const keys = (seed, n = 7, dur = 0.7) => {
  const s = mono(dur);
  const rand = mulberry32(seed);
  for (let k = 0; k < n; k++) {
    const t0 = rand() * (dur - 0.3);
    const f = 2600 + rand() * 3200;
    const s0 = Math.floor(t0 * SR);
    for (let i = 0; i < 0.25 * SR && s0 + i < s.length; i++) {
      const t = i / SR;
      const env = Math.min(1, t / 0.001) * Math.exp(-t / (0.05 + rand() * 0.0001));
      s[s0 + i] += (Math.sin(TAU * f * t) + 0.5 * Math.sin(TAU * f * 1.51 * t) + 0.3 * Math.sin(TAU * f * 2.37 * t)) * env * (0.5 + 0.5 * rand());
    }
  }
  return s;
};
const click = (f0, decay, noise = 0.3, seed = 3) => {
  const s = mono(0.25);
  const rand = mulberry32(seed);
  for (let i = 0; i < s.length; i++) {
    const t = i / SR;
    s[i] = (Math.sin(TAU * f0 * t) * (1 - noise) + (rand() * 2 - 1) * noise) * Math.exp(-t / decay);
  }
  return s;
};
const shutter = () => {
  const s = mono(0.3);
  const a = click(1800, 0.012, 0.7, 5);
  const b = click(1200, 0.018, 0.6, 6);
  for (let i = 0; i < a.length; i++) s[i] += a[i];
  const off = Math.floor(0.075 * SR);
  for (let i = 0; i < b.length && off + i < s.length; i++) s[off + i] += 0.8 * b[i];
  return s;
};
const whoosh = () => {
  const s = mono(0.6);
  const rand = mulberry32(9);
  let y = 0;
  for (let i = 0; i < s.length; i++) {
    const t = i / SR;
    const env = Math.sin(Math.PI * Math.min(1, t / 0.6)) ** 2;
    const k = 0.02 + 0.2 * env;
    y += k * ((rand() * 2 - 1) - y);
    s[i] = y * env;
  }
  return s;
};
const pop = () => {
  const s = mono(0.15);
  for (let i = 0; i < s.length; i++) {
    const t = i / SR;
    s[i] = Math.sin(TAU * (900 - 2400 * t) * t) * Math.exp(-t / 0.03);
  }
  return s;
};
const paper = () => {
  const s = mono(0.4);
  const rand = mulberry32(21);
  let prev = 0;
  for (let i = 0; i < s.length; i++) {
    const t = i / SR;
    const x = rand() * 2 - 1;
    const env = (0.6 + 0.4 * Math.sin(t * 90)) * Math.exp(-t / 0.15) * Math.min(1, t / 0.01);
    s[i] = (x - prev) * env;
    prev = x;
  }
  return s;
};
const tap = () => click(420, 0.01, 0.35, 11);
const latch = () => {
  const s = mono(0.25);
  const a = click(2200, 0.008, 0.5, 13);
  for (let i = 0; i < a.length; i++) s[i] += a[i];
  const off = Math.floor(0.05 * SR);
  for (let i = 0; i < a.length && off + i < s.length; i++) s[off + i] += 0.7 * a[i];
  return s;
};
const chime = () => {
  const s = mono(1.6);
  [72, 76, 79].forEach((m, k) => {
    const s0 = Math.floor(k * 0.09 * SR);
    for (let i = 0; s0 + i < s.length; i++) {
      const t = i / SR;
      s[s0 + i] += (Math.sin(TAU * hz(m) * t) + 0.25 * Math.sin(TAU * hz(m) * 2.76 * t) * Math.exp(-t / 0.2)) * Math.exp(-t / 0.6) * Math.min(1, t / 0.004);
    }
  });
  return s;
};
const step = (seed, child) => {
  const s = mono(0.12);
  const rand = mulberry32(seed);
  let y = 0;
  for (let i = 0; i < s.length; i++) {
    const t = i / SR;
    y += 0.25 * ((rand() * 2 - 1) - y);
    s[i] = (y * 0.6 + Math.sin(TAU * (child ? 150 : 110) * t) * 0.5) * Math.exp(-t / (child ? 0.022 : 0.03));
  }
  return s;
};

musicPlay();
musicThink();
musicWarm();
saveSfx("keys", keys(31), -6);
saveSfx("keys-take", keys(37, 10, 0.9), -5);
saveSfx("magnet", click(260, 0.02, 0.4, 41), -6);
saveSfx("shutter", shutter(), -6);
saveSfx("whoosh", whoosh(), -6);
saveSfx("pop", pop(), -8);
saveSfx("paper", paper(), -8);
saveSfx("tap", tap(), -8);
saveSfx("latch", latch(), -8);
saveSfx("chime", chime(), -6);
for (let i = 0; i < 4; i++) {
  saveSfx(`step-${i}`, step(50 + i, false), -14);
  saveSfx(`step-child-${i}`, step(60 + i, true), -15);
}
