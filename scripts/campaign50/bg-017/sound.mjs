// Музыка и звуки быта BG-017, синтезированные кодом (детерминированно,
// без лицензионных ограничений) → public/audio/campaign50/bg-017/.
//   music-quiet.mp3 — тихое «войлочное» фортепиано (хук и проблема),
//   music-warm.mp3  — то же фортепиано + тёплый пэд (решение и финал);
//   слои одной гармонии и темпа (66 BPM, фа мажор), Remotion сводит их.
//   sfx/*.mp3 — мелок и карандаш по бумаге, шорох листа, телефон на стол,
//   касание экрана, складывание листа.
// Запуск: node scripts/campaign50/bg-017/sound.mjs
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { SAMPLE_RATE as SR, ffmpeg, mulberry32, normalizePeak, writeWav } from "./audio-lib.mjs";

const OUT = "public/audio/campaign50/bg-017";
const TMP = join(tmpdir(), "balago-bg017-sound");
mkdirSync(join(OUT, "sfx"), { recursive: true });
mkdirSync(TMP, { recursive: true });
const TAU = Math.PI * 2;
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

const save = (name, channels, peakDb, af = null) => {
  normalizePeak(channels, peakDb);
  const wav = join(TMP, `${name.replace("/", "-")}.wav`);
  writeWav(wav, channels);
  ffmpeg(["-i", wav, ...(af ? ["-af", af] : []), "-codec:a", "libmp3lame", "-b:a", "192k", join(OUT, `${name}.mp3`)]);
  console.log(`+ ${OUT}/${name}.mp3`);
};

// ---------- Музыка ----------
const DUR = 100; // покрывает ролик любой длины в пределах сценария
const BPM = 66;
const beat = 60 / BPM;
const bar = beat * 4;
// Fmaj7 – Am7 – Dm7 – B♭maj9 (бас, затем голоса)
const CHORDS = [
  [41, 57, 60, 64, 65],
  [45, 55, 60, 64, 67],
  [38, 53, 57, 60, 65],
  [46, 53, 57, 62, 65],
];

const piano = (L, R, start, midi, amp, pan) => {
  const f = hz(midi);
  const s0 = Math.floor(start * SR);
  const len = Math.floor(3.2 * SR);
  const gl = Math.cos(((pan + 1) * Math.PI) / 4);
  const gr = Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < len && s0 + i < L.length; i++) {
    const t = i / SR;
    const att = Math.min(1, t / 0.012);
    // «войлочный» тембр: основной тон + мягкие обертоны, верх гаснет быстрее
    const v =
      (Math.sin(TAU * f * t) * Math.exp(-t / 1.6) +
        0.32 * Math.sin(TAU * 2 * f * t + 0.3) * Math.exp(-t / 0.7) +
        0.1 * Math.sin(TAU * 3 * f * t + 0.6) * Math.exp(-t / 0.35)) *
      att *
      amp;
    L[s0 + i] += v * gl;
    R[s0 + i] += v * gr;
  }
};

const pad = (L, R, start, dur, midis, amp) => {
  const s0 = Math.floor(start * SR);
  const len = Math.floor(dur * SR);
  for (let i = 0; i < len && s0 + i < L.length; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 1.4) * Math.min(1, (dur - t) / 1.4);
    let v = 0;
    midis.forEach((m, k) => {
      const f = hz(m);
      v += Math.sin(TAU * f * t + k) * 0.6 + Math.sin(TAU * f * 1.003 * t + k * 2) * 0.4;
    });
    v *= (env * amp) / midis.length;
    L[s0 + i] += v * (1 + 0.15 * Math.sin(t * 0.7));
    R[s0 + i] += v * (1 - 0.15 * Math.sin(t * 0.7));
  }
};

const music = (warm) => {
  const n = Math.round(DUR * SR);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const rand = mulberry32(warm ? 77 : 13);
  for (let b = 0; b * bar < DUR; b++) {
    const ch = CHORDS[b % 4];
    const t0 = b * bar;
    piano(L, R, t0, ch[0] + 12, 0.32, -0.2);
    // медленное арпеджио — ноты на долях, лёгкая «человеческая» неровность
    const order = [1, 2, 3, 4, 3, 2];
    order.forEach((k, j) => {
      const at = t0 + j * (bar / 6) + (rand() - 0.5) * 0.02;
      piano(L, R, at, ch[k], (0.17 + rand() * 0.04) * (j === 0 ? 1.15 : 1), (k - 2.5) * 0.25);
    });
    if (warm) pad(L, R, t0, bar + 1.2, ch.slice(1).map((m) => m - 12), 0.22);
  }
  // общий фейд в начале и конце файла
  for (let i = 0; i < SR * 2; i++) {
    L[i] *= i / (SR * 2);
    R[i] *= i / (SR * 2);
  }
  // мягкая реверберация и срез верха — без «звонкости»
  save(warm ? "music-warm" : "music-quiet", [L, R], -3, "aecho=0.8:0.6:70|130:0.22|0.14,lowpass=f=5200");
};

// ---------- Эффекты ----------
const noise = (len, seed) => {
  const r = mulberry32(seed);
  return Float32Array.from({ length: len }, () => r() * 2 - 1);
};
const sfx = (name, dur, fn, peak, af) => {
  const n = Math.round(dur * SR);
  const ch = new Float32Array(n);
  fn(ch, n);
  save(`sfx/${name}`, [ch], peak, af);
};

const run = () => {
  music(false);
  music(true);
  // восковой мелок по бумаге: шорох с неровным нажимом (петля, 1,4 с)
  sfx("crayon", 1.4, (ch, n) => {
    const nz = noise(n, 31);
    let y = 0;
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      y = y * 0.55 + nz[i] * 0.45;
      const press = 0.55 + 0.45 * Math.abs(Math.sin(TAU * 2.6 * t)) * (0.7 + 0.3 * Math.sin(TAU * 7.1 * t));
      ch[i] = y * press * Math.min(1, t / 0.03, (1.4 - t) / 0.03);
    }
  }, -9, "highpass=f=700,lowpass=f=5200");
  // карандаш: тоньше и тише мелка (петля)
  sfx("pencil", 1.2, (ch, n) => {
    const nz = noise(n, 41);
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const press = 0.5 + 0.5 * Math.abs(Math.sin(TAU * 3.4 * t));
      ch[i] = nz[i] * press * Math.min(1, t / 0.03, (1.2 - t) / 0.03);
    }
  }, -14, "highpass=f=1800,lowpass=f=7000");
  // шорох листа альбома (ладони расправляют страницу)
  sfx("page", 0.7, (ch, n) => {
    const nz = noise(n, 9);
    let y = 0;
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      y = y * 0.8 + nz[i] * 0.2;
      ch[i] = y * Math.sin((Math.PI * t) / 0.7) * (0.7 + 0.3 * Math.sin(TAU * 9 * t));
    }
  }, -8, "highpass=f=300,lowpass=f=4500");
  // телефон ложится на стол: мягкий стук
  sfx("phone", 0.3, (ch, n) => {
    const nz = noise(n, 17);
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      ch[i] = (Math.sin(TAU * 180 * t) * 0.8 + nz[i] * 0.3) * Math.exp(-t / 0.035);
    }
  }, -8, "lowpass=f=3000");
  // касание экрана
  sfx("tap", 0.06, (ch, n) => {
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      ch[i] = Math.sin(TAU * 1500 * t) * Math.exp(-t / 0.008);
    }
  }, -8, "lowpass=f=5000");
  // лист складывается: шорох + мягкий хлопок
  sfx("fold", 0.8, (ch, n) => {
    const nz = noise(n, 23);
    let y = 0;
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      y = y * 0.7 + nz[i] * 0.3;
      const swish = y * Math.sin((Math.PI * Math.min(t, 0.6)) / 0.6);
      const thud = t > 0.6 ? Math.sin(TAU * 120 * (t - 0.6)) * Math.exp(-(t - 0.6) / 0.05) : 0;
      ch[i] = swish * 0.8 + thud * 0.6;
    }
  }, -7, "lowpass=f=4000");
};

run();
rmSync(TMP, { recursive: true, force: true });
