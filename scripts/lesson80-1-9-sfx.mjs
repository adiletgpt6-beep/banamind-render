// Тихие бытовые звуки Lesson80-1-9 (детерминированный синтез, без внешних
// файлов и без музыки):
//   room     — тон комнаты (30 с, бесшовно зацикливается);
//   plate    — тарелку бережно ставят на деревянный столик (мягкий стук без звона);
//   napkin   — мягкое шуршание тонкой салфетки (не картон);
//   tray     — поднос коротко касается ковра/столика;
//   slice    — кусочек яблока снимают с тарелки (едва слышно);
//   garden   — едва заметный ветер в листве для вставки сада (6 с).
// Запуск: npm run audio:sfx:lesson-80-1-9 → public/lesson-80-1-9/audio/sfx/
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mulberry32, normalizePeak, SAMPLE_RATE as SR, wavToMp3, writeWav } from "./lib/audio.mjs";
import { FILM } from "../src/lesson80/film-1-9/script.ts";

const OUT = join("public", FILM.voiceDir, "sfx");
mkdirSync(OUT, { recursive: true });
const TMP = join(tmpdir(), "lesson80-1-9-sfx");
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
const loopFade = (l, r, sec) => {
  const n = l.length;
  const f = Math.round(sec * SR);
  for (let i = 0; i < f; i++) {
    const k = i / f;
    l[i] = l[i] * k + l[n - f + i] * (1 - k);
    r[i] = r[i] * k + r[n - f + i] * (1 - k);
  }
  return [l.slice(0, n - f), r.slice(0, n - f)];
};

// Тон комнаты: очень тихий низкий шум (как в 80-1-8).
{
  const w = noise(30, 190);
  const l = lowpass(lowpass(w, 0.015), 0.015);
  const r = lowpass(lowpass(w.map((v, i) => (i > 911 ? w[i - 911] : v)), 0.015), 0.015);
  save("room", loopFade(l, r, 0.5), -34);
}
// Тарелку ставят на столик: глухой деревянный стук и короткий мягкий
// керамический призвук (быстро гаснет — без звона).
{
  const n = Math.round(0.36 * SR);
  const x = new Float32Array(n);
  const n1 = noise(0.36, 191);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const wood = Math.sin(2 * Math.PI * 190 * t) * Math.exp(-t / 0.035) * 0.8;
    const ceramic = (Math.sin(2 * Math.PI * 1320 * t) * 0.18 + Math.sin(2 * Math.PI * 2210 * t) * 0.08) * Math.exp(-t / 0.03);
    const tap = n1[i] * Math.exp(-t / 0.006) * 0.4;
    x[i] = wood + ceramic + tap;
  }
  save("plate", stereo(lowpass(x, 0.35), 7), -20);
}
// Салфетка: мягкое шуршание тонкой бумаги ≈ 0,45 с (верх без резких щелчков).
{
  const x = noise(0.45, 192);
  const y = lowpass(highpass(x, 0.08), 0.45);
  const rnd = mulberry32(193);
  const n = y.length;
  let g = 0.6;
  let next = 0;
  for (let i = 0; i < n; i++) {
    if (i >= next) {
      g = 0.45 + rnd() * 0.55;
      next = i + Math.round((0.03 + rnd() * 0.05) * SR);
    }
    const u = i / n;
    y[i] *= g * Math.sin(Math.PI * Math.min(1, u * 1.3)) * Math.min(1, (1 - u) * 4);
  }
  save("napkin", stereo(env(y, 0.03, 0.12), 13), -28);
}
// Поднос мягко опускается: низкий короткий стук дерева с лёгким шорохом.
{
  const n = Math.round(0.4 * SR);
  const x = new Float32Array(n);
  const n1 = lowpass(noise(0.4, 194), 0.2);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    x[i] = Math.sin(2 * Math.PI * 140 * t) * Math.exp(-t / 0.05) * 0.7 + n1[i] * Math.exp(-t / 0.06) * 0.35;
  }
  save("tray", stereo(lowpass(x, 0.3), 9), -22);
}
// Кусочек яблока снимают с тарелки: едва слышное касание.
{
  const n = Math.round(0.18 * SR);
  const x = noise(0.18, 195);
  const y = lowpass(highpass(x, 0.1), 0.5);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    y[i] *= Math.exp(-t / 0.04) * (1 - Math.exp(-t / 0.004));
  }
  save("slice", stereo(y, 5), -32);
}
// Сад: тихий ветер в листве (6 с, медленные порывы, без птиц и музыки).
{
  const sec = 6.5;
  const w = noise(sec, 196);
  const leaves = lowpass(highpass(w, 0.04), 0.25);
  const wind = lowpass(lowpass(noise(sec, 197), 0.01), 0.02);
  const n = leaves.length;
  const l = new Float32Array(n);
  const r = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const gust = 0.55 + 0.25 * Math.sin(2 * Math.PI * t / 3.1) + 0.2 * Math.sin(2 * Math.PI * t / 1.7 + 1.3);
    const v = leaves[i] * gust * 0.6 + wind[i] * 3;
    l[i] = v;
    r[i] = i > 1300 ? leaves[i - 1300] * gust * 0.6 + wind[i] * 3 : v;
  }
  save("garden", [env(l, 0.6, 0.8), env(r, 0.6, 0.8)], -30);
}
