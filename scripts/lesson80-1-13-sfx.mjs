// Тихие бытовые звуки Lesson80-1-13 «А Аллах видел?» (детерминированный
// синтез, без внешних файлов и без музыки): тон комнаты; деревянная деталь
// ложится в картонную коробку (три разных варианта — не один и тот же щелчок
// на все шесть деталей); крышка коробки закрыта; коробка поднята и
// поставлена на полку; книжка поднята (лёгкое шуршание обложки) и поставлена
// на полку (мягкий стук); книжки сдвинуты на полке; карточка на полочке
// доски; шорох одежды; очень мягкие шаги в носках по ковру.
// Уровни задаются при сведении (FilmAudio.tsx): эффекты на 18–28 дБ тише речи.
// Запуск: npm run audio:sfx:lesson-80-1-13 → public/lesson-80-1-13/audio/sfx/
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mulberry32, normalizePeak, SAMPLE_RATE as SR, wavToMp3, writeWav } from "./lib/audio.mjs";
import { FILM } from "../src/lesson80/film-1-13/script.ts";

const OUT = join("public", FILM.voiceDir, "sfx");
mkdirSync(OUT, { recursive: true });
const TMP = join(tmpdir(), "lesson80-1-13-sfx");
mkdirSync(TMP, { recursive: true });

const save = (name, ch, peakDb) => {
  normalizePeak(ch, peakDb);
  const wav = join(TMP, `${name}.wav`);
  writeWav(wav, ch);
  wavToMp3(wav, join(OUT, `${name}.mp3`));
  console.log(`✓ ${name}.mp3 (${(ch[0].length / SR).toFixed(2)} с, пик ${peakDb} дБFS)`);
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
const mixInto = (dst, src, at, gain = 1) => {
  const o = Math.round(at * SR);
  for (let i = 0; i < src.length && o + i < dst.length; i++) if (o + i >= 0) dst[o + i] += src[i] * gain;
};
// Деревянный удар: несколько затухающих мод (сухое дерево — быстрое
// затухание, неровный ряд частот) и короткий шумовой щелчок контакта.
const wood = (sec, f0, decay, seed, click = 0.5, cut = 0.35) => {
  const x = new Float32Array(Math.round(sec * SR));
  const n1 = noise(sec, seed);
  const modes = [
    [1, 1, 1],
    [2.32, 0.45, 0.6],
    [3.95, 0.22, 0.4],
    [5.6, 0.1, 0.3],
  ];
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    let v = 0;
    for (const [k, a, d] of modes) v += Math.sin(2 * Math.PI * f0 * k * t) * a * Math.exp(-t / (decay * d));
    x[i] = v * 0.55 + n1[i] * Math.exp(-t / 0.0035) * click;
  }
  return lowpass(x, cut);
};
// Трение дерева о дерево / пальца о дерево: полосовой шум с неровной огибающей.
const rub = (sec, seed, { lo = 0.04, hi = 0.35, grain = 37, depth = 0.45 } = {}) => {
  const y = lowpass(highpass(noise(sec, seed), lo), hi);
  const rnd = mulberry32(seed + 1);
  const ph = rnd() * 6;
  for (let i = 0; i < y.length; i++) {
    const u = i / y.length;
    y[i] *= Math.sin(Math.PI * u) * (1 - depth + depth * Math.sin(u * grain + ph)) * (0.85 + 0.15 * Math.sin(u * 113));
  }
  return y;
};

// Тон комнаты (30 с, бесшовно зацикливается): очень тихий низкий шум и чуть
// «воздуха» от окна; без голосов, шагов и случайных событий.
{
  const n = 30 * SR;
  const w = noise(30, 1280);
  const l = lowpass(lowpass(w, 0.014), 0.014);
  const r = lowpass(lowpass(w.map((v, i) => (i > 911 ? w[i - 911] : v)), 0.014), 0.014);
  const air = lowpass(highpass(noise(30, 1281), 0.2), 0.4);
  for (let i = 0; i < n; i++) {
    l[i] += air[i] * 0.0035;
    r[i] += air[(i + 733) % n] * 0.0035;
  }
  const f = Math.round(0.5 * SR);
  for (let i = 0; i < f; i++) {
    const k = i / f;
    l[i] = l[i] * k + l[n - f + i] * (1 - k);
    r[i] = r[i] * k + r[n - f + i] * (1 - k);
  }
  save("room", [l.slice(0, n - f), r.slice(0, n - f)], -34);
}
// Деревянная деталь ложится в картонную коробку: глухой стук дерева о
// картон (низкие частоты, быстрое затухание). Три варианта с разной высотой.
for (const [i, f0, seed] of [[1, 520, 1310], [2, 470, 1311], [3, 560, 1312]]) {
  const x = new Float32Array(Math.round(0.35 * SR));
  mixInto(x, wood(0.3, f0, 0.022, seed, 0.3, 0.3), 0, 0.8);
  const thud = lowpass(lowpass(noise(0.2, seed + 50), 0.06), 0.1);
  for (let k = 0; k < thud.length; k++) thud[k] *= Math.min(1, k / (0.002 * SR)) * Math.exp(-(k / SR) / 0.03);
  mixInto(x, thud, 0.002, 1.2);
  save(`piece-box-${i}`, stereo(env(x, 0.0008, 0.08), 6 + i), -25);
}
// Крышка коробки закрыта: короткое трение картона и приглушённый хлопок.
{
  const x = new Float32Array(Math.round(0.5 * SR));
  mixInto(x, rub(0.18, 1320, { lo: 0.04, hi: 0.25, grain: 13, depth: 0.3 }), 0, 0.35);
  const thud = lowpass(lowpass(noise(0.3, 1321), 0.04), 0.07);
  for (let k = 0; k < thud.length; k++) thud[k] *= Math.min(1, k / (0.003 * SR)) * Math.exp(-(k / SR) / 0.045);
  mixInto(x, thud, 0.15, 1.5);
  save("box-close", stereo(env(x, 0.002, 0.1), 9), -24);
}
// Коробка с деталями поднята со стола: лёгкое касание и сдвиг деталей внутри.
{
  const x = new Float32Array(Math.round(0.45 * SR));
  mixInto(x, wood(0.2, 300, 0.02, 1322, 0.25, 0.25), 0, 0.5);
  mixInto(x, wood(0.15, 610, 0.012, 1323, 0.2, 0.35), 0.06, 0.18);
  mixInto(x, rub(0.25, 1324, { lo: 0.03, hi: 0.2, grain: 11, depth: 0.3 }), 0.03, 0.35);
  save("box-lift", stereo(env(x, 0.002, 0.1), 9), -28);
}
// Коробка поставлена на полку: мягкий полый стук.
{
  const x = new Float32Array(Math.round(0.55 * SR));
  mixInto(x, wood(0.5, 220, 0.045, 1325, 0.3, 0.22), 0, 1);
  mixInto(x, wood(0.3, 640, 0.016, 1326, 0.2, 0.4), 0.004, 0.25);
  save("box-set", stereo(env(x, 0.001, 0.12), 11), -24);
}
// Книжка поднята (с ковра или со столика): лёгкое шуршание обложки.
{
  const y = lowpass(highpass(noise(0.4, 1327), 0.06), 0.32);
  for (let k = 0; k < y.length; k++) {
    const u = k / y.length;
    y[k] *= Math.sin(Math.PI * u) * (0.65 + 0.35 * Math.sin(u * 27));
  }
  save("book-lift", stereo(env(y, 0.02, 0.1), 10), -30);
}
// Книжка поставлена на полку: короткое касание картона о дерево.
{
  const x = new Float32Array(Math.round(0.4 * SR));
  mixInto(x, rub(0.1, 1328, { lo: 0.05, hi: 0.3, grain: 9, depth: 0.2 }), 0, 0.25);
  mixInto(x, wood(0.3, 340, 0.028, 1329, 0.3, 0.26), 0.07, 1);
  save("book-set", stereo(env(x, 0.001, 0.1), 8), -25);
}
// Книжки сдвинуты по полке: короткое мягкое трение.
{
  const y = rub(0.35, 1330, { lo: 0.05, hi: 0.26, grain: 19, depth: 0.3 });
  save("book-slide", stereo(env(y, 0.03, 0.08), 9), -31);
}
// Карточка поставлена на полочку доски: лёгкий сухой «тык».
{
  const x = new Float32Array(Math.round(0.25 * SR));
  mixInto(x, wood(0.2, 900, 0.012, 1331, 0.35, 0.45), 0, 0.7);
  save("card-set", stereo(env(x, 0.0006, 0.05), 6), -29);
}
// Шорох одежды при посадке/движении ≈ 0,9 с.
{
  const x = noise(0.9, 1304);
  const y = lowpass(highpass(x, 0.03), 0.22);
  for (let i = 0; i < y.length; i++) {
    const u = i / y.length;
    y[i] *= Math.sin(Math.PI * u) * (0.55 + 0.45 * Math.sin(u * 23 + 1.3)) * (0.7 + 0.3 * Math.sin(u * 61));
  }
  save("cloth", stereo(env(y, 0.05, 0.2), 15), -28);
}
// Шаг в носках по ковру: очень мягкий глухой звук (без стука).
{
  const x = noise(0.22, 1305);
  const y = lowpass(lowpass(x, 0.05), 0.08);
  for (let i = 0; i < y.length; i++) {
    const t = i / SR;
    y[i] *= Math.min(1, t / 0.008) * Math.exp(-t / 0.045);
  }
  save("step", stereo(y, 5), -30);
}
