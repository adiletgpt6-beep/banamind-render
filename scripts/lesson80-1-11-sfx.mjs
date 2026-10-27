// Тихие бытовые звуки Lesson80-1-11 (детерминированный синтез, без внешних
// файлов): тон комнаты, дверь (ручка и мягкое закрытие), сумка на ковёр,
// шорох одежды при посадке и подъёме, приглушённые шаги в носках по ковру,
// страница и закрытая книга, налив небольшой порции воды из кувшина в чашку,
// тонкая струя на землю, чашка на столе, карандаш по карточке. Шуршание
// бумаги — общий файл проекта (public/audio/sfx-paper.mp3). Музыки нет.
// Уровни задаются при сведении (FilmAudio.tsx): эффекты на 18–25 дБ тише речи.
// Запуск: npm run audio:sfx:lesson-80-1-11 → public/lesson-80-1-11/audio/sfx/
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mulberry32, normalizePeak, SAMPLE_RATE as SR, wavToMp3, writeWav } from "./lib/audio.mjs";
import { FILM } from "../src/lesson80/film-1-11/script.ts";

const OUT = join("public", FILM.voiceDir, "sfx");
mkdirSync(OUT, { recursive: true });
const TMP = join(tmpdir(), "lesson80-1-11-sfx");
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
// Мягкий удар (дерево/керамика): затухающий тон + короткий шумовой щелчок.
const knock = (sec, freq, decay, seed, clickGain = 0.5, cut = 0.3) => {
  const x = new Float32Array(Math.round(sec * SR));
  const n1 = noise(sec, seed);
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    x[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t / decay) * 0.7 + Math.sin(2 * Math.PI * freq * 2.71 * t) * Math.exp(-t / (decay * 0.4)) * 0.18 + n1[i] * Math.exp(-t / 0.006) * clickGain;
  }
  return lowpass(x, cut);
};
// Пузырёк воды (модель Миннарта): синус с растущей частотой и быстрым затуханием.
const bubble = (freq, dur, rise) => {
  const n = Math.round(dur * SR);
  const x = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = freq * (1 + rise * t / dur);
    ph += (2 * Math.PI * f) / SR;
    x[i] = Math.sin(ph) * Math.exp(-t / (dur * 0.28)) * Math.min(1, t / 0.0015);
  }
  return x;
};
// Струйка воды: ровное мягкое шипение + редкие маленькие пузырьки.
const trickle = (sec, seed, { rate = 38, fLo = 900, fHi = 2600, hiss = 0.32, body = 0.06 } = {}) => {
  const rnd = mulberry32(seed);
  const x = new Float32Array(Math.round(sec * SR));
  const h = lowpass(highpass(noise(sec, seed + 1), 0.12), 0.5);
  for (let i = 0; i < x.length; i++) x[i] = h[i] * hiss * (0.8 + 0.2 * Math.sin(i / SR * 9.3));
  let t = 0;
  while (t < sec) {
    t += -Math.log(1 - rnd()) / rate;
    const f = fLo + (fHi - fLo) * Math.pow(rnd(), 1.6);
    mixInto(x, bubble(f, 0.012 + 0.03 * rnd(), 0.3 + 0.4 * rnd()), t, 0.25 + 0.5 * rnd());
  }
  const lo = lowpass(noise(sec, seed + 2), 0.01);
  for (let i = 0; i < x.length; i++) x[i] += lo[i] * body;
  return x;
};

// Тон комнаты (30 с, бесшовно зацикливается): очень тихий низкий шум,
// чуть «воздуха» от окна.
{
  const n = 30 * SR;
  const w = noise(30, 1180);
  const l = lowpass(lowpass(w, 0.015), 0.015);
  const r = lowpass(lowpass(w.map((v, i) => (i > 911 ? w[i - 911] : v)), 0.015), 0.015);
  const air = lowpass(highpass(noise(30, 1181), 0.2), 0.4);
  for (let i = 0; i < n; i++) {
    l[i] += air[i] * 0.004;
    r[i] += air[(i + 733) % n] * 0.004;
  }
  const f = Math.round(0.5 * SR);
  for (let i = 0; i < f; i++) {
    const k = i / f;
    l[i] = l[i] * k + l[n - f + i] * (1 - k);
    r[i] = r[i] * k + r[n - f + i] * (1 - k);
  }
  save("room", [l.slice(0, n - f), r.slice(0, n - f)], -34);
}
// Дверь: ручка (два мягких щелчка) и короткий воздух открывания ≈ 1,2 с.
{
  const x = new Float32Array(Math.round(1.2 * SR));
  mixInto(x, knock(0.12, 1900, 0.008, 1190, 0.6, 0.6), 0.02, 0.7);
  mixInto(x, knock(0.12, 1500, 0.01, 1191, 0.5, 0.6), 0.16, 0.5);
  const sw = lowpass(highpass(noise(0.9, 1192), 0.02), 0.08);
  for (let i = 0; i < sw.length; i++) sw[i] *= Math.sin(Math.PI * i / sw.length) * 0.9;
  mixInto(x, sw, 0.25, 0.6);
  save("door-open", stereo(env(x, 0.003, 0.2), 9), -26);
}
// Дверь мягко закрывается: глухой деревянный удар и щелчок защёлки.
{
  const x = new Float32Array(Math.round(0.6 * SR));
  mixInto(x, knock(0.5, 92, 0.05, 1193, 0.25, 0.12), 0, 0.9);
  mixInto(x, knock(0.12, 2100, 0.006, 1194, 0.5, 0.7), 0.09, 0.35);
  save("door-close", stereo(env(x, 0.002, 0.2), 13), -24);
}
// Сумка ложится на ковёр: мягкий глухой шорох ткани.
{
  const x = noise(0.45, 1195);
  const y = lowpass(highpass(x, 0.01), 0.12);
  for (let i = 0; i < y.length; i++) {
    const t = i / SR;
    y[i] *= Math.exp(-t / 0.09) * (1 + 0.4 * Math.sin(t * 60));
  }
  mixInto(y, knock(0.3, 70, 0.04, 1196, 0.1, 0.06), 0.01, 0.5);
  save("bag-down", stereo(env(y, 0.004, 0.12), 7), -26);
}
// Шорох одежды при посадке/подъёме ≈ 0,9 с.
{
  const x = noise(0.9, 1197);
  const y = lowpass(highpass(x, 0.03), 0.22);
  for (let i = 0; i < y.length; i++) {
    const u = i / y.length;
    y[i] *= Math.sin(Math.PI * u) * (0.55 + 0.45 * Math.sin(u * 23 + 1.3)) * (0.7 + 0.3 * Math.sin(u * 61));
  }
  save("cloth", stereo(env(y, 0.05, 0.2), 15), -28);
}
// Шаг в носках по ковру: очень мягкий глухой звук (без стука).
{
  const x = noise(0.22, 1198);
  const y = lowpass(lowpass(x, 0.05), 0.08);
  for (let i = 0; i < y.length; i++) {
    const t = i / SR;
    y[i] *= Math.min(1, t / 0.008) * Math.exp(-t / 0.045);
  }
  save("step", stereo(y, 5), -30);
}
// Страница: короткий бумажный шелест ≈ 0,5 с.
{
  const x = noise(0.5, 1199);
  const y = lowpass(highpass(x, 0.05), 0.4);
  for (let i = 0; i < y.length; i++) {
    const u = i / y.length;
    y[i] *= Math.sin(Math.PI * Math.min(1, u * 1.5)) * (0.6 + 0.4 * Math.sin(u * 40)) * (u < 0.7 ? 1 : (1 - u) / 0.3);
  }
  save("page", stereo(env(y, 0.02, 0.1), 11), -24);
}
// Книга закрыта и положена на стол: мягкий хлопок страниц и деревянный стук.
{
  const x = new Float32Array(Math.round(0.9 * SR));
  const flap = lowpass(highpass(noise(0.18, 1200), 0.02), 0.3);
  for (let i = 0; i < flap.length; i++) flap[i] *= Math.exp(-(i / SR) / 0.03);
  mixInto(x, flap, 0, 0.8);
  mixInto(x, knock(0.4, 150, 0.04, 1201, 0.4, 0.25), 0.5, 0.8);
  save("book-down", stereo(env(x, 0.002, 0.15), 9), -22);
}
// Налив небольшой порции воды из кувшина в чашку ≈ 2,2 с: тон наполнения
// чуть поднимается (воздушный столб в чашке укорачивается).
{
  const sec = 2.2;
  const x = trickle(sec, 1202, { rate: 70, fLo: 700, fHi: 2200, hiss: 0.45, body: 0.12 });
  const ring = new Float32Array(x.length);
  let ph = 0;
  for (let i = 0; i < ring.length; i++) {
    const t = i / SR;
    ph += (2 * Math.PI * (520 + 260 * t / sec)) / SR;
    ring[i] = Math.sin(ph) * 0.05 * (0.6 + 0.4 * Math.sin(t * 31));
  }
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    const a = Math.min(1, t / 0.12) * Math.min(1, (sec - t) / 0.25);
    x[i] = (x[i] + ring[i]) * a;
  }
  save("pour-cup", stereo(lowpass(x, 0.6), 17), -27);
}
// Тонкая струя на землю (4 с, зацикливается): тихое мягкое журчание,
// почти без пузырей — вода впитывается в землю.
{
  const sec = 4;
  const x = trickle(sec, 1203, { rate: 26, fLo: 500, fHi: 1500, hiss: 0.3, body: 0.18 });
  const n = x.length;
  const f = Math.round(0.15 * SR);
  for (let i = 0; i < f; i++) {
    const k = i / f;
    x[i] = x[i] * k + x[n - f + i] * (1 - k);
  }
  save("trickle", stereo(lowpass(x.slice(0, n - f), 0.45), 21), -30);
}
// Чашка ставится на деревянный стол: короткий мягкий керамический стук.
{
  const x = new Float32Array(Math.round(0.35 * SR));
  mixInto(x, knock(0.3, 410, 0.025, 1204, 0.35, 0.45), 0, 0.8);
  mixInto(x, knock(0.2, 1300, 0.01, 1205, 0.2, 0.6), 0.004, 0.25);
  save("cup-set", stereo(env(x, 0.001, 0.08), 6), -24);
}
// Карандаш по карточке: лёгкие штрихи (2 с, зацикливается).
{
  const x = noise(2, 1206);
  const y = lowpass(highpass(x, 0.05), 0.35);
  const n = y.length;
  const rnd = mulberry32(1207);
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
