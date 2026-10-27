// Тихие звуки действий Lesson80-1-10 (детерминированный синтез, без внешних
// файлов и без музыки):
//   room    — тон учебной комнаты (30 с, бесшовно зацикливается);
//   sheet   — мягкий шорох большого листа, когда его раскладывают ладонями;
//   card    — короткий шорох маленькой карточки при передаче;
//   pencil  — лёгкие штрихи карандаша по карточке (2 с, зацикливается);
//   marker  — фломастер по плотной бумаге (2 с, зацикливается, без скрипа);
//   fold    — бумага бережно сгибается и прижимается по прежней линии;
//   tape    — полоска крепления прижимается пальцем (едва слышно);
//   board   — лист касается доски (очень тихо).
// Запуск: npm run audio:sfx:lesson-80-1-10 → public/lesson-80-1-10/audio/sfx/
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mulberry32, normalizePeak, SAMPLE_RATE as SR, wavToMp3, writeWav } from "./lib/audio.mjs";
import { FILM } from "../src/lesson80/film-1-10/script.ts";

const OUT = join("public", FILM.voiceDir, "sfx");
mkdirSync(OUT, { recursive: true });
const TMP = join(tmpdir(), "lesson80-1-10-sfx");
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
// Шорох бумаги: полосовой шум с неровными «зёрнами» громкости.
const rustle = (sec, seed, hp, lp, grain) => {
  const y = lowpass(highpass(noise(sec, seed), hp), lp);
  const rnd = mulberry32(seed + 1);
  let g = 0.6;
  let next = 0;
  for (let i = 0; i < y.length; i++) {
    if (i >= next) {
      g = 0.35 + rnd() * 0.65;
      next = i + Math.round((grain[0] + rnd() * grain[1]) * SR);
    }
    y[i] *= g;
  }
  return y;
};

// Тон комнаты: очень тихий низкий шум (как в 80-1-8 и 80-1-9).
{
  const w = noise(30, 200);
  const l = lowpass(lowpass(w, 0.015), 0.015);
  const r = lowpass(lowpass(w.map((v, i) => (i > 911 ? w[i - 911] : v)), 0.015), 0.015);
  save("room", loopFade(l, r, 0.5), -34);
}
// Большой лист раскладывают и расправляют ладонями: длинный мягкий шорох ≈ 1,4 с
// с двумя волнами (развернули — провели ладонями).
{
  const y = rustle(1.4, 201, 0.03, 0.32, [0.04, 0.08]);
  const n = y.length;
  for (let i = 0; i < n; i++) {
    const u = i / n;
    y[i] *= 0.55 * Math.sin(Math.PI * Math.min(1, u * 2.2)) ** 2 + 0.45 * Math.sin(Math.PI * Math.max(0, Math.min(1, (u - 0.45) * 1.9)));
  }
  save("sheet", stereo(env(y, 0.05, 0.2), 17), -26);
}
// Карточку передают: короткий сухой шорох ≈ 0,3 с.
{
  const y = rustle(0.3, 203, 0.06, 0.4, [0.02, 0.04]);
  const n = y.length;
  for (let i = 0; i < n; i++) y[i] *= Math.sin(Math.PI * (i / n)) ** 0.7;
  save("card", stereo(env(y, 0.02, 0.08), 9), -30);
}
// Карандаш по карточке: лёгкие штрихи (2 с, зацикливается) — как в 80-1-8.
{
  const x = noise(2, 205);
  const y = lowpass(highpass(x, 0.05), 0.35);
  const n = y.length;
  const rnd = mulberry32(206);
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
  save("pencil", stereo(y.slice(0, n - f)), -27);
}
// Фломастер по плотной бумаге: мягкое шипение длинных штрихов, ниже по
// частоте, чем карандаш (2 с, зацикливается).
{
  const x = noise(2, 207);
  const y = lowpass(highpass(x, 0.03), 0.22);
  const n = y.length;
  const rnd = mulberry32(208);
  let g = 0;
  let next = 0;
  for (let i = 0; i < n; i++) {
    if (i >= next) {
      g = 0.5 + rnd() * 0.5;
      next = i + Math.round((0.12 + rnd() * 0.18) * SR);
    }
    y[i] *= g;
  }
  const f = Math.round(0.12 * SR);
  for (let i = 0; i < f; i++) {
    const k = i / f;
    y[i] = y[i] * k + y[n - f + i] * (1 - k);
  }
  save("marker", stereo(lowpass(y.slice(0, n - f), 0.6)), -29);
}
// Сгиб бумаги: уголок возвращают по прежней линии (короткий хруст сгиба) и
// мягко прижимают пальцами (едва слышный шорох) ≈ 0,9 с.
{
  const n = Math.round(0.9 * SR);
  const crease = rustle(0.9, 209, 0.1, 0.5, [0.01, 0.025]);
  const press = lowpass(highpass(noise(0.9, 211), 0.04), 0.2);
  const y = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const a = Math.exp(-((t - 0.18) ** 2) / 0.006);
    const b = Math.exp(-((t - 0.6) ** 2) / 0.02) * 0.45;
    y[i] = crease[i] * a + press[i] * b;
  }
  save("fold", stereo(env(y, 0.01, 0.1), 7), -28);
}
// Полоска крепления: короткое касание и прижим пальцем ≈ 0,25 с.
{
  const n = Math.round(0.25 * SR);
  const x = lowpass(highpass(noise(0.25, 213), 0.05), 0.3);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    x[i] *= Math.exp(-t / 0.05) * (1 - Math.exp(-t / 0.003));
  }
  save("tape", stereo(x, 5), -32);
}
// Лист касается доски: мягкий глухой шлепок бумаги ≈ 0,35 с.
{
  const n = Math.round(0.35 * SR);
  const x = new Float32Array(n);
  const n1 = lowpass(noise(0.35, 215), 0.25);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    x[i] = Math.sin(2 * Math.PI * 120 * t) * Math.exp(-t / 0.03) * 0.35 + n1[i] * Math.exp(-t / 0.05) * 0.6;
  }
  save("board", stereo(lowpass(x, 0.3), 9), -30);
}
