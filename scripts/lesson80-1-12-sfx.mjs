// Тихие бытовые звуки Lesson80-1-12 «Аллах слышит меня?» (детерминированный
// синтез, без внешних файлов и без музыки): тон комнаты; дерево — касание
// детали о стол, лёгкий стук детали о край картинки (не подошла), скольжение
// детали по столешнице, мягкий «ток» детали, вставшей на место; палец вдоль
// края дерева; коробка (поднята / поставлена); книга закрыта и положена;
// страница; шорох одежды при посадке и движении; мягкие шаги в носках по ковру.
// Уровни задаются при сведении (FilmAudio.tsx): эффекты на 18–28 дБ тише речи.
// Запуск: npm run audio:sfx:lesson-80-1-12 → public/lesson-80-1-12/audio/sfx/
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mulberry32, normalizePeak, SAMPLE_RATE as SR, wavToMp3, writeWav } from "./lib/audio.mjs";
import { FILM } from "../src/lesson80/film-1-12/script.ts";

const OUT = join("public", FILM.voiceDir, "sfx");
mkdirSync(OUT, { recursive: true });
const TMP = join(tmpdir(), "lesson80-1-12-sfx");
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
// Деталь коснулась столешницы (положена / поднята с лёгким касанием).
{
  const x = new Float32Array(Math.round(0.3 * SR));
  mixInto(x, wood(0.28, 620, 0.03, 1290, 0.45, 0.42), 0, 0.9);
  save("piece-tap", stereo(env(x, 0.0008, 0.06), 6), -24);
}
// Деталь упёрлась в край картинки и не входит: два лёгких стука дерева о дерево.
{
  const x = new Float32Array(Math.round(0.6 * SR));
  mixInto(x, wood(0.25, 880, 0.022, 1291, 0.5, 0.5), 0, 0.8);
  mixInto(x, wood(0.25, 820, 0.02, 1292, 0.45, 0.5), 0.21, 0.55);
  save("piece-bump", stereo(env(x, 0.0008, 0.08), 8), -25);
}
// Деталь скользит по столешнице (подводят к месту) ≈ 0,5 с.
{
  const y = rub(0.5, 1293, { lo: 0.05, hi: 0.3, grain: 29, depth: 0.35 });
  save("piece-slide", stereo(env(y, 0.03, 0.1), 9), -30);
}
// Деталь встала на место: короткое трение и мягкий плотный «ток».
{
  const x = new Float32Array(Math.round(0.45 * SR));
  mixInto(x, rub(0.16, 1294, { lo: 0.06, hi: 0.35, grain: 17, depth: 0.3 }), 0, 0.35);
  mixInto(x, wood(0.32, 430, 0.035, 1295, 0.55, 0.38), 0.13, 1);
  save("piece-fit", stereo(env(x, 0.002, 0.08), 7), -23);
}
// Палец медленно ведёт вдоль края готовой картинки ≈ 1,6 с (очень тихо).
{
  const y = rub(1.6, 1296, { lo: 0.08, hi: 0.22, grain: 51, depth: 0.25 });
  save("finger-edge", stereo(env(y, 0.15, 0.25), 12), -34);
}
// Пустая коробка поднята со стола: лёгкое касание и воздух.
{
  const x = new Float32Array(Math.round(0.4 * SR));
  mixInto(x, wood(0.2, 300, 0.02, 1297, 0.25, 0.25), 0, 0.5);
  mixInto(x, rub(0.25, 1298, { lo: 0.03, hi: 0.2, grain: 11, depth: 0.3 }), 0.03, 0.4);
  save("box-lift", stereo(env(x, 0.002, 0.1), 9), -28);
}
// Пустая коробка поставлена на стол: мягкий полый стук (тонкие стенки).
{
  const x = new Float32Array(Math.round(0.55 * SR));
  mixInto(x, wood(0.5, 210, 0.05, 1299, 0.35, 0.22), 0, 1);
  mixInto(x, wood(0.3, 640, 0.018, 1300, 0.2, 0.4), 0.004, 0.3);
  save("box-set", stereo(env(x, 0.001, 0.12), 11), -23);
}
// Книга закрыта и положена на ковёр: мягкий хлопок страниц и глухой звук ткани.
{
  const x = new Float32Array(Math.round(0.9 * SR));
  const flap = lowpass(highpass(noise(0.18, 1301), 0.02), 0.3);
  for (let i = 0; i < flap.length; i++) flap[i] *= Math.exp(-(i / SR) / 0.03);
  mixInto(x, flap, 0, 0.8);
  const thud = lowpass(lowpass(noise(0.3, 1302), 0.05), 0.08);
  for (let i = 0; i < thud.length; i++) thud[i] *= Math.min(1, i / (0.004 * SR)) * Math.exp(-(i / SR) / 0.05);
  mixInto(x, thud, 0.48, 1.6);
  save("book-down", stereo(env(x, 0.002, 0.15), 9), -24);
}
// Страница: короткий бумажный шелест ≈ 0,5 с.
{
  const x = noise(0.5, 1303);
  const y = lowpass(highpass(x, 0.05), 0.4);
  for (let i = 0; i < y.length; i++) {
    const u = i / y.length;
    y[i] *= Math.sin(Math.PI * Math.min(1, u * 1.5)) * (0.6 + 0.4 * Math.sin(u * 40)) * (u < 0.7 ? 1 : (1 - u) / 0.3);
  }
  save("page", stereo(env(y, 0.02, 0.1), 11), -26);
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
