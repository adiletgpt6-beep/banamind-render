// Музыка BalaGoTwoSundays2D — своя для этой композиции.
// Без бочки, щелчков и низких ударов: ничто не звучит как шаги. Дорожки по
// настроению (каждая 200 с без петель), монтаж — Su2Audio.tsx (перекрёстные
// затухания по сценам, приглушение под речью):
//   su2d-open.mp3      — интрига календаря: лёгкое любопытное остинато
//                        (мягкие щипки, атака ≥ 12 мс) над пэдом;
//   su2d-weekday.mp3   — обычные будни: чуть больше пульса, без тиканья;
//   su2d-wednesday.mp3 — среда и семейный стол: теплее, медленное арпеджио;
//   su2d-quiet.mp3     — объяснение дочки: только тихий пэд;
//   su2d-focus.mp3     — родители решают: собранно, ровные мягкие доли;
//   su2d-end.mp3       — общий календарь и финал: тёплое завершение.
// Запуск: node scripts/su2d-music.mjs
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { SAMPLE_RATE as SR, ffmpeg, mulberry32, writeWav } from "./lib/audio.mjs";

const OUT = "public/audio/two-sundays-2d/music";
mkdirSync(OUT, { recursive: true });
const TMP = join(tmpdir(), "su2d-music");
mkdirSync(TMP, { recursive: true });
const TAU = Math.PI * 2;
const DUR = 200;
const N = Math.round(DUR * SR);
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const gains = (pan) => [Math.cos(((pan + 1) * Math.PI) / 4), Math.sin(((pan + 1) * Math.PI) / 4)];

// мягкий тон: плавная атака, ровное звучание, плавное затухание
const tone = (out, start, len, f, amp, attack, release, harm, pan, vib = 0) => {
  const s0 = Math.floor(start * SR);
  const total = Math.floor((len + release) * SR);
  const [gl, gr] = gains(pan);
  for (let i = 0; i < total && s0 + i < N; i++) {
    const t = i / SR;
    const env = t < attack ? Math.sin(((t / attack) * Math.PI) / 2) ** 2 : t < len ? 1 : Math.cos((((t - len) / release) * Math.PI) / 2) ** 2;
    const fm = f * (1 + vib * Math.sin(TAU * 4.6 * t));
    let v = 0;
    for (const [m, a] of harm) v += a * Math.sin(TAU * fm * m * t);
    out[0][s0 + i] += v * env * amp * gl;
    out[1][s0 + i] += v * env * amp * gr;
  }
};
const PAD = [[1, 1], [2, 0.32], [3, 0.12], [4, 0.05]];
const BELL = [[1, 1], [2, 0.18], [3, 0.05]];

const piece = (name, { chords, barSec, padAmp, noteAmp, notesPerBar, arp, seed, pluck = 0, pulse = 0 }) => {
  const out = [new Float32Array(N), new Float32Array(N)];
  const r = mulberry32(seed);
  const bars = Math.ceil(DUR / barSec);
  for (let b = 0; b < bars; b++) {
    const t0 = b * barSec;
    const ch = chords[Math.floor(b / 2) % chords.length];
    // пэд: аккорд держится два такта, мягкая атака и спад, лёгкая расстройка
    if (b % 2 === 0) {
      tone(out, t0, barSec * 2, hz(ch[0]), padAmp * 0.9, 1.6, 2.2, PAD, 0);
      for (const [k, m] of ch.slice(1).entries()) {
        tone(out, t0, barSec * 2, hz(m) * (1 + (k - 1) * 0.0015), padAmp * 0.55, 1.8, 2.4, PAD, (k - 1) * 0.5);
      }
    }
    // редкие ноты сверху (без ударной атаки)
    for (let k = 0; k < notesPerBar; k++) {
      if (r() < 0.35) continue;
      const at = t0 + (k + 0.1 + 0.3 * r()) * (barSec / notesPerBar);
      const m = ch[1 + Math.floor(r() * (ch.length - 1))] + 12;
      tone(out, at, 0.5 + r() * 0.6, hz(m), noteAmp * (0.7 + 0.3 * r()), 0.09, 1.6, BELL, r() * 0.8 - 0.4, 0.002);
    }
    // остинато щипками (восьмые), средний регистр: атака 12 мс, короткий спад
    if (pluck) {
      const pat = [0, 2, 1, 2, 3, 2, 1, 2];
      for (let k = 0; k < 8; k++) {
        if (k % 4 === 3 && r() < 0.4) continue;
        const m = ch[1 + (pat[k] % (ch.length - 1))] + 12;
        tone(out, t0 + k * (barSec / 8), 0.06, hz(m), pluck * (k % 2 ? 0.7 : 1), 0.012, 0.32, BELL, k % 2 ? 0.3 : -0.3);
      }
    }
    // ровные мягкие доли (сосредоточенность): аккордовый тон, атака 60 мс
    if (pulse) {
      for (let k = 0; k < 4; k++) tone(out, t0 + k * (barSec / 4), barSec / 8, hz(ch[1] + 12), pulse, 0.06, 0.4, PAD, 0);
    }
    // медленное арпеджио: длинные ноты с атакой 120 мс (не «капли»)
    if (arp) {
      for (let k = 0; k < 4; k++) {
        const m = ch[(k % (ch.length - 1)) + 1] + 12;
        tone(out, t0 + k * (barSec / 4) + 0.02 * r(), barSec / 4, hz(m), arp, 0.12, 1.2, BELL, k % 2 ? 0.35 : -0.35);
      }
    }
  }
  // мягкий общий фильтр (однополюсный НЧ) и нормализация к −20 dBFS RMS
  for (const ch of out) {
    let y = 0;
    const a = Math.exp((-TAU * 5200) / SR);
    for (let i = 0; i < ch.length; i++) {
      y = (1 - a) * ch[i] + a * y;
      ch[i] = y;
    }
  }
  let acc = 0;
  for (const ch of out) for (const v of ch) acc += v * v;
  const rms = Math.sqrt(acc / (2 * N));
  const g = Math.pow(10, -20 / 20) / (rms || 1);
  for (const ch of out) for (let i = 0; i < ch.length; i++) ch[i] = Math.tanh(ch[i] * g * 1.1) / 1.1;
  // плавные края
  const fade = Math.round(3 * SR);
  for (const ch of out) for (let i = 0; i < fade; i++) {
    ch[i] *= i / fade;
    ch[N - 1 - i] *= i / fade;
  }
  const wav = join(TMP, `${name}.wav`);
  writeWav(wav, out);
  ffmpeg(["-i", wav, "-ar", String(SR), "-ac", "2", "-codec:a", "libmp3lame", "-b:a", "160k", join(OUT, `${name}.mp3`)]);
  console.log(`✓ ${name}.mp3`);
};


// C – Am – F – G: любопытно, светло
piece("su2d-open", { chords: [[48, 64, 67, 72], [45, 64, 69, 72], [41, 65, 69, 72], [43, 62, 67, 71]], barSec: 2.4, padAmp: 0.035, noteAmp: 0.02, notesPerBar: 1, arp: 0, pluck: 0.026, seed: 261 });
// F – C – Dm – Bb: будни, спокойное движение (лёгкие щипки; без ровных
// долей — их можно принять за шаги или тиканье)
piece("su2d-weekday", { chords: [[41, 65, 69, 72], [48, 64, 67, 72], [50, 65, 69, 74], [46, 65, 70, 74]], barSec: 2.9, padAmp: 0.042, noteAmp: 0.024, notesPerBar: 2, arp: 0, pluck: 0.018, seed: 263 });
// G – D – Em – C: среда и общий стол, тепло
piece("su2d-wednesday", { chords: [[43, 59, 62, 67], [50, 62, 66, 69], [40, 59, 64, 67], [48, 60, 64, 67]], barSec: 3.2, padAmp: 0.045, noteAmp: 0.026, notesPerBar: 2, arp: 0.018, seed: 269 });
// Am – F – C – G: тихо и просто
piece("su2d-quiet", { chords: [[45, 60, 64, 69], [41, 60, 65, 69], [48, 60, 64, 67], [43, 59, 62, 67]], barSec: 4.4, padAmp: 0.05, noteAmp: 0.012, notesPerBar: 1, arp: 0, seed: 271 });
// Dm – Bb – F – C: собранно (медленное арпеджио вместо ровных долей)
piece("su2d-focus", { chords: [[50, 62, 65, 69], [46, 62, 65, 70], [41, 60, 65, 69], [48, 60, 64, 67]], barSec: 2.8, padAmp: 0.04, noteAmp: 0.02, notesPerBar: 1, arp: 0.012, seed: 277 });
// F – G – Em – Am: мягкое тёплое завершение
piece("su2d-end", { chords: [[41, 60, 65, 69], [43, 62, 67, 71], [40, 59, 64, 67], [45, 60, 64, 69]], barSec: 3.6, padAmp: 0.05, noteAmp: 0.025, notesPerBar: 2, arp: 0.015, seed: 281 });
