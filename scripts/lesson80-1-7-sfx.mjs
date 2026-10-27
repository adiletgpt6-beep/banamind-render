// Тихие звуки Lesson80-1-7 (детерминированный синтез, без внешних файлов):
// тон комнаты, щелчок выключателя лампы, ткань занавески, тихий ход глобуса,
// постановка подставки на стол, карандаш по бумаге. Шуршание бумаги —
// общий файл проекта (public/audio/sfx-paper.mp3).
// Запуск: npm run audio:sfx:lesson-80-1-7 → public/lesson-80-1-7/audio/sfx/
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mulberry32, normalizePeak, SAMPLE_RATE as SR, wavToMp3, writeWav } from "./lib/audio.mjs";
import { FILM } from "../src/lesson80/film-1-7/script.ts";

const OUT = join("public", FILM.voiceDir, "sfx");
mkdirSync(OUT, { recursive: true });
const TMP = join(tmpdir(), "lesson80-1-7-sfx");
mkdirSync(TMP, { recursive: true });

const save = (name, ch, peakDb) => {
  normalizePeak(ch, peakDb);
  const wav = join(TMP, `${name}.wav`);
  writeWav(wav, ch);
  wavToMp3(wav, join(OUT, `${name}.mp3`));
  console.log(`✓ ${name}.mp3 (${(ch[0].length / SR).toFixed(2)} с)`);
};
const lowpass = (x, alpha) => {
  let y = 0;
  const out = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) {
    y += alpha * (x[i] - y);
    out[i] = y;
  }
  return out;
};
const highpass = (x, alpha) => {
  const lp = lowpass(x, alpha);
  return x.map((v, i) => v - lp[i]);
};
const env = (x, a, r) => {
  const n = x.length;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    x[i] *= Math.min(1, t / a) * Math.min(1, (n / SR - t) / r);
  }
  return x;
};
const noise = (sec, seed) => {
  const rnd = mulberry32(seed);
  const x = new Float32Array(Math.round(sec * SR));
  for (let i = 0; i < x.length; i++) x[i] = rnd() * 2 - 1;
  return x;
};
const stereo = (x, d = 0) => [x, d ? x.map((v, i) => (i > d ? x[i - d] : v)) : Float32Array.from(x)];

// Тон комнаты (30 с, бесшовно зацикливается): очень тихий низкий шум.
{
  const n = 30 * SR;
  const w = noise(30, 170);
  const l = lowpass(lowpass(w, 0.015), 0.015);
  const r = lowpass(lowpass(w.map((v, i) => (i > 911 ? w[i - 911] : v)), 0.015), 0.015);
  // плавный стык для цикла
  const f = Math.round(0.5 * SR);
  for (let i = 0; i < f; i++) {
    const k = i / f;
    l[i] = l[i] * k + l[n - f + i] * (1 - k);
    r[i] = r[i] * k + r[n - f + i] * (1 - k);
  }
  save("room", [l.slice(0, n - f), r.slice(0, n - f)], -34);
}
// Щелчок выключателя лампы: один короткий механический щелчок.
{
  const x = new Float32Array(Math.round(0.16 * SR));
  const n1 = noise(0.16, 171);
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    x[i] = n1[i] * Math.exp(-t / 0.006) + 0.5 * n1[(i + 300) % n1.length] * Math.exp(-(t - 0.02) / 0.004) * (t > 0.02 ? 1 : 0);
  }
  save("lamp-click", stereo(highpass(x, 0.2)), -14);
}
// Занавеска: мягкий шорох ткани по карнизу ≈ 1,2 с.
{
  const x = noise(1.2, 172);
  const y = lowpass(highpass(x, 0.02), 0.25);
  for (let i = 0; i < y.length; i++) {
    const u = i / y.length;
    y[i] *= Math.sin(Math.PI * u) * (0.7 + 0.3 * Math.sin(u * 40));
  }
  save("curtain", stereo(env(y, 0.08, 0.2), 17), -22);
}
// Ход глобуса: едва слышное шуршание оси (1,5 с, зацикливается).
{
  const x = noise(1.5, 173);
  const y = lowpass(x, 0.06);
  const n = y.length;
  for (let i = 0; i < n; i++) y[i] *= 0.8 + 0.2 * Math.sin((i / SR) * 2 * Math.PI * 3.1);
  const f = Math.round(0.2 * SR);
  for (let i = 0; i < f; i++) {
    const k = i / f;
    y[i] = y[i] * k + y[n - f + i] * (1 - k);
  }
  save("globe-turn", stereo(y.slice(0, n - f)), -30);
}
// Подставка глобуса ставится на стол: мягкий деревянный стук.
{
  const x = new Float32Array(Math.round(0.3 * SR));
  const n1 = noise(0.3, 174);
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    x[i] = Math.sin(2 * Math.PI * 140 * t) * Math.exp(-t / 0.05) * 0.8 + n1[i] * Math.exp(-t / 0.012) * 0.6;
  }
  save("globe-set", stereo(lowpass(x, 0.3)), -16);
}
// Карандаш по бумаге: лёгкие штрихи (2 с, зацикливается).
{
  const x = noise(2, 175);
  const y = lowpass(highpass(x, 0.05), 0.35);
  const n = y.length;
  const rnd = mulberry32(176);
  let g = 0;
  let next = 0;
  for (let i = 0; i < n; i++) {
    if (i >= next) {
      g = 0.4 + rnd() * 0.6;
      next = i + Math.round((0.08 + rnd() * 0.2) * SR);
    }
    const ph = (i - (next - Math.round(0.14 * SR))) / (0.14 * SR);
    y[i] *= g * (0.5 + 0.5 * Math.sin(Math.PI * Math.max(0, Math.min(1, ph + 0.5))));
  }
  const f = Math.round(0.1 * SR);
  for (let i = 0; i < f; i++) {
    const k = i / f;
    y[i] = y[i] * k + y[n - f + i] * (1 - k);
  }
  save("pencil", stereo(y.slice(0, n - f)), -26);
}
