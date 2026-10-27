// Оригинальная фоновая музыка и звуки рекламы hidjaz-premium, синтез кодом:
// без сэмплов и чужих записей, поэтому коммерческое использование свободно.
// Лад «хиджаз» на ре (D Eb F# G A Bb C) — отсылка к названию бренда;
// 84 BPM, тёплый пэд, щипковый «канун» (Karplus–Strong), мягкий бубен.
// Драматургия по сценам: 0–5 вступление с ударом, 5–35 пульс,
// 35–50 витрина (без ударных, широкий пэд), 50–60 финал с разрешением.
//
// node hidjaz-premium/tools/music.mjs → hidjaz-premium/public/audio/*.mp3
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { SAMPLE_RATE as SR, mulberry32, normalizePeak, wavToMp3, writeWav } from "../../scripts/lib/audio.mjs";

const OUT = "hidjaz-premium/public/audio";
const TMP = join(tmpdir(), "hidjaz-audio");
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });
const TAU = Math.PI * 2;
const hz = (m) => 440 * 2 ** ((m - 69) / 12);
const save = (name, ch, peak) => {
  normalizePeak(ch, peak);
  const wav = join(TMP, `${name}.wav`);
  writeWav(wav, ch);
  wavToMp3(wav, join(OUT, `${name}.mp3`));
  console.log(`+ ${OUT}/${name}.mp3`);
};

const music = () => {
  const dur = 61.5;
  const n = Math.round(dur * SR);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const rand = mulberry32(2026);
  const beat = 60 / 84;
  const bar = beat * 4;
  const pan = (p) => [Math.cos(((p + 1) * Math.PI) / 4), Math.sin(((p + 1) * Math.PI) / 4)];
  const add = (s0, v, [gl, gr]) => {
    if (s0 >= 0 && s0 < n) {
      L[s0] += v * gl;
      R[s0] += v * gr;
    }
  };
  // общая громкость слоя по времени (сцены)
  const env = (t, pts) => {
    for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) {
      const [t0, a0] = pts[i - 1];
      const [t1, a1] = pts[i];
      return a0 + (a1 - a0) * ((t - t0) / (t1 - t0));
    }
    return pts[pts.length - 1][1];
  };

  // Пэд: аккорды по 2 такта, D – Gm – Cm – D (каденция хиджаза)
  const chords = [[50, 54, 57, 62], [43, 55, 58, 62], [48, 55, 60, 63], [50, 54, 57, 66]];
  const padLevel = [[0, 0.5], [5, 0.75], [34, 0.8], [36, 1.15], [49, 1.1], [51, 0.85], [61.5, 0.8]];
  for (let k = 0; k * bar * 2 < dur; k++) {
    const ch = chords[k % 4];
    const t0 = k * bar * 2;
    const len = bar * 2 + 1.2;
    for (const [j, m] of ch.entries()) {
      const f = hz(m);
      const g = pan(-0.5 + j * 0.33);
      const det = 1 + (j % 2 ? 0.0025 : -0.002);
      for (let i = 0; i < len * SR; i++) {
        const t = i / SR;
        const T = t0 + t;
        const a = Math.min(1, t / 1.1) * Math.min(1, (len - t) / 1.2);
        const v = (Math.sin(TAU * f * t) * 0.6 + Math.sin(TAU * f * 2 * det * t) * 0.18 + Math.sin(TAU * f * 3 * t) * 0.06) * a * 0.05 * env(T, padLevel);
        add(Math.floor(T * SR), v, g);
      }
    }
  }

  // Канун: Karplus–Strong, мелодия по ладу хиджаз (полутон Eb–F#–G)
  const pluck = (t0, m, amp, p) => {
    const N = Math.round(SR / hz(m));
    const buf = new Float32Array(N).map(() => rand() * 2 - 1);
    const g = pan(p);
    let idx = 0;
    for (let i = 0; i < 2.2 * SR; i++) {
      const a = buf[idx];
      const b = buf[(idx + 1) % N];
      buf[idx] = 0.4985 * (a + b);
      idx = (idx + 1) % N;
      add(Math.floor(t0 * SR) + i, a * amp * Math.exp(-i / SR / 1.4), g);
    }
  };
  const scale = [62, 63, 66, 67, 69, 70, 72, 74]; // D Eb F# G A Bb C D
  const motif = [0, 2, 3, 4, 3, 2, 1, 0, 4, 5, 4, 3, 2, 3, 1, 0];
  for (let k = 0; k < Math.floor(dur / (beat / 2)); k++) {
    const t = k * (beat / 2);
    if (t < 1.4 || t > 59.2) continue;
    const showcase = t > 35 && t < 50;
    // в витрине реже и выше, в остальном — каждые 2 восьмые
    if (showcase ? k % 4 !== 0 : k % 2 !== 0) continue;
    const deg = motif[Math.floor(k / 2) % motif.length];
    const m = scale[deg] + (showcase ? 12 : 0);
    pluck(t, m, 0.17 * (t < 5 ? 0.7 : 1), deg % 2 ? 0.35 : -0.35);
  }

  // Бубен (дэф): низкий «дум» на 1 и 2+, сухой «тек» на 3
  const dum = (t0, amp) => {
    let ph = 0;
    for (let i = 0; i < 0.45 * SR; i++) {
      const t = i / SR;
      ph += (TAU * (62 + 40 * Math.exp(-t / 0.05))) / SR;
      add(Math.floor(t0 * SR) + i, Math.sin(ph) * Math.exp(-t / 0.16) * amp, [0.7, 0.7]);
    }
  };
  const tek = (t0, amp, p) => {
    let y = 0;
    let prev = 0;
    const g = pan(p);
    for (let i = 0; i < 0.08 * SR; i++) {
      const t = i / SR;
      const x = rand() * 2 - 1;
      y += 0.35 * (x - prev - y);
      prev = x;
      add(Math.floor(t0 * SR) + i, y * Math.exp(-t / 0.02) * amp, g);
    }
  };
  for (let b = 0; b * bar < dur; b++) {
    const t = b * bar;
    const lv = t < 5 ? 0 : t < 34.5 ? 1 : t < 49.8 ? 0 : t < 58 ? 0.8 : 0;
    if (!lv) continue;
    dum(t, 0.42 * lv);
    dum(t + beat * 1.5, 0.28 * lv);
    tek(t + beat * 2, 0.16 * lv, 0.3);
    tek(t + beat * 3.5, 0.09 * lv, -0.3);
  }

  // Удар вступления (появление товара ≈ 0,7 с) и финальный аккорд
  dum(0.72, 0.9);
  for (const m of [38, 50, 57, 62, 66]) {
    const f = hz(m);
    for (let i = 0; i < 3 * SR; i++) {
      const t = i / SR;
      add(Math.floor(57.8 * SR) + i, Math.sin(TAU * f * t) * Math.min(1, t / 0.05) * Math.exp(-t / 1.3) * 0.06, [0.7, 0.7]);
    }
  }
  return [L, R];
};

// Свист перехода и мерцание (для появления товара / логотипа)
const whoosh = () => {
  const n = Math.round(0.9 * SR);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const rand = mulberry32(7);
  let y = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const a = Math.sin(Math.PI * Math.min(1, t / 0.9)) ** 2;
    const c = 0.02 + 0.25 * (t / 0.9);
    y += c * (rand() * 2 - 1 - y);
    const p = t / 0.9;
    L[i] = y * a * (1 - p * 0.6);
    R[i] = y * a * (0.4 + p * 0.6);
  }
  return [L, R];
};
const shimmer = () => {
  const n = Math.round(1.6 * SR);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  [86, 90, 93, 98, 102].forEach((m, k) => {
    const f = hz(m);
    const t0 = k * 0.07;
    for (let i = 0; i < n; i++) {
      const t = i / SR - t0;
      if (t < 0) continue;
      const v = Math.sin(TAU * f * t) * Math.exp(-t / 0.5) * 0.2;
      L[i] += v * (k % 2 ? 0.5 : 1);
      R[i] += v * (k % 2 ? 1 : 0.5);
    }
  });
  return [L, R];
};

save("music", music(), -3);
save("sfx-whoosh", whoosh(), -6);
save("sfx-shimmer", shimmer(), -8);
