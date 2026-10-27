// Background music for IslamicFinanceShort01: light, rhythmic, modern and
// minimal — soft kick, shaker, warm pad, plucked arpeggio, round bass.
// Original, code-generated and deterministic (safe to publish, no licensing).
// 31.5 s covers the 30-second video; the composition fades it in and out.
//
// Run: npm run audio:music:if01  →  public/audio/music-finance-light.mp3
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { SAMPLE_RATE as SR, mulberry32, normalizePeak, wavToMp3, writeWav } from "./lib/audio.mjs";

const OUT = "public/audio";
const TMP = join(tmpdir(), "balago-if01-music");
mkdirSync(TMP, { recursive: true });
const TAU = Math.PI * 2;
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

const duration = 31.5;
const n = Math.round(duration * SR);
const L = new Float32Array(n);
const R = new Float32Array(n);
const BPM = 104;
const beat = 60 / BPM;
const bar = beat * 4;
const rand = mulberry32(2026);

// D major, I – V – vi – IV (D, A, Bm, G): [bass, chord tones]
const chords = [
  [50, 62, 66, 69, 73], // D
  [45, 61, 64, 69, 73], // A (C# E A C#)
  [47, 62, 66, 71, 74], // Bm (D F# B D)
  [43, 59, 62, 67, 71], // G (B D G B)
];
const chordAt = (t) => chords[Math.floor(t / bar) % chords.length];

const add = (t0, len, gen, gain = 1, pan = 0) => {
  const s = Math.round(t0 * SR);
  const m = Math.min(n - s, Math.round(len * SR));
  const gl = gain * Math.min(1, 1 - pan);
  const gr = gain * Math.min(1, 1 + pan);
  for (let i = 0; i < m; i++) {
    const v = gen(i / SR);
    L[s + i] += v * gl;
    R[s + i] += v * gr;
  }
};

// --- pad: two detuned saw-ish layers per chord tone, slow attack, low-passed by harmonics roll-off
for (let t = 0; t < duration; t += bar) {
  const ch = chordAt(t);
  for (const note of ch.slice(1)) {
    const f = hz(note);
    const det = 1 + (rand() - 0.5) * 0.004;
    add(
      t,
      bar + 0.4,
      (x) => {
        const env = Math.min(1, x / 0.9) * Math.min(1, Math.max(0, (bar + 0.4 - x) / 0.5));
        let v = 0;
        for (let h = 1; h <= 4; h++) v += Math.sin(TAU * f * det * h * x) / (h * h);
        v += Math.sin(TAU * f * h2(det) * x) * 0.6;
        return v * env;
      },
      0.045,
      (rand() - 0.5) * 0.4,
    );
  }
}
function h2(det) {
  return 2 - det;
}

// --- bass: round sine + a touch of 2nd harmonic, on beats 1 and 3 with a pickup
for (let t = 0; t < duration; t += bar) {
  const root = hz(chordAt(t)[0] - 12);
  for (const [off, len] of [
    [0, beat * 1.6],
    [beat * 2, beat * 1.2],
    [beat * 3.5, beat * 0.45],
  ]) {
    add(
      t + off,
      len,
      (x) => {
        const env = Math.min(1, x / 0.01) * Math.exp(-x / (len * 0.55));
        return (Math.sin(TAU * root * x) + 0.25 * Math.sin(TAU * root * 2 * x)) * env;
      },
      0.22,
    );
  }
}

// --- pluck arpeggio: 8th notes, bright decaying sine with harmonics
for (let t = 0; t < duration; t += beat / 2) {
  const ch = chordAt(t);
  const step = Math.round(t / (beat / 2));
  const pattern = [1, 3, 2, 4, 3, 1, 4, 2];
  const note = ch[pattern[step % pattern.length]] + 12;
  if (step % 8 === 7 && rand() < 0.35) continue; // small breathing gaps
  const f = hz(note);
  add(
    t,
    0.5,
    (x) => {
      const env = Math.min(1, x / 0.003) * Math.exp(-x / 0.14);
      return (Math.sin(TAU * f * x) + 0.35 * Math.sin(TAU * f * 2 * x) + 0.12 * Math.sin(TAU * f * 3 * x)) * env;
    },
    0.075,
    step % 2 ? 0.35 : -0.35,
  );
}

// --- drums: soft kick (beats 1, 3 and a ghost on 2.5), shaker 8ths, soft clap on 2 & 4
for (let t = 0; t < duration; t += bar) {
  for (const off of [0, beat * 2, beat * 2.5]) {
    const g = off === beat * 2.5 ? 0.35 : 1;
    add(
      t + off,
      0.3,
      (x) => {
        const f = 48 + 90 * Math.exp(-x / 0.035);
        return Math.sin(TAU * f * x) * Math.exp(-x / 0.09) * Math.min(1, x / 0.002);
      },
      0.4 * g,
    );
  }
  for (let k = 0; k < 8; k++) {
    const accent = k % 2 === 0 ? 0.55 : 1;
    const seed = Math.floor((t + k) * 1000);
    const r = mulberry32(seed);
    add(
      t + (k * beat) / 2,
      0.09,
      (x) => (r() * 2 - 1) * Math.exp(-x / 0.02) * Math.min(1, x / 0.001),
      0.06 * accent,
      0.3,
    );
  }
  for (const off of [beat, beat * 3]) {
    const r = mulberry32(Math.floor(t * 100) + off);
    let lp = 0;
    add(
      t + off,
      0.16,
      (x) => {
        lp = lp * 0.72 + (r() * 2 - 1) * 0.28;
        return lp * Math.exp(-x / 0.045) * Math.min(1, x / 0.004);
      },
      0.17,
      -0.2,
    );
  }
}

// gentle high-shelf via one-pole lowpass at ~9 kHz to keep it soft
const lowpass = (x, hz) => {
  const a = Math.exp((-TAU * hz) / SR);
  let y = 0;
  for (let i = 0; i < x.length; i++) {
    y = (1 - a) * x[i] + a * y;
    x[i] = y;
  }
};
lowpass(L, 9000);
lowpass(R, 9000);
// tail fade so the loop end is clean
for (let i = 0; i < SR * 0.8; i++) {
  const g = i / (SR * 0.8);
  L[n - 1 - i] *= g;
  R[n - 1 - i] *= g;
}
normalizePeak([L, R], -6);
const wav = join(TMP, "music-finance-light.wav");
writeWav(wav, [L, R]);
wavToMp3(wav, join(OUT, "music-finance-light.mp3"));
console.log(`+ ${OUT}/music-finance-light.mp3 (${duration} s, ${BPM} BPM)`);
