// Звуки BalaGoBG040 (детерминированный синтез, без API и чужих записей):
//   tick-0/1     — такт настенных часов (тик / так): короткий щелчок механизма;
//   stamp        — «штамп» заголовка: мягкий удар по бумаге;
//   pen-write    — перо по бумаге (6,5 с; обрезается по длине письма);
//   pen-zig      — быстрый зубчатый росчерк (отметка разрыва);
//   hand-hit     — стрелка задевает ручку: сухой щелчок и короткий скрежет;
//   printer-step — такт принтера: моторчик подачи и щелчок валика;
//   lid          — крышка ноутбука закрывается (мягкий хлопок и защёлка);
//   fold         — кадр «складывается» (глухой мягкий удар);
//   send         — отправка сообщения (лёгкий восходящий свист).
// Запуск: node scripts/campaign50/bg-040/sfx.mjs
import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SAMPLE_RATE as SR, ffmpeg, writeWav } from "../../lib/audio.mjs";
import { BG40_VIDEO } from "../../../src/campaign50/bg-040/script.ts";

const OUT = join("public", BG40_VIDEO.sfxDir);
const TMP = join(tmpdir(), "balago-bg040-sfx");
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

// детерминированный шум
let seed = 40404;
const rnd = () => {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648 - 0.5;
};
const buf = (len) => new Float32Array(Math.round(len * SR));

// Однополюсные фильтры для шума.
const lowpass = (x, fc) => {
  const a = Math.exp((-2 * Math.PI * fc) / SR);
  let y = 0;
  const out = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) out[i] = y = (1 - a) * x[i] + a * y;
  return out;
};
const highpass = (x, fc) => {
  const lp = lowpass(x, fc);
  return x.map((v, i) => v - lp[i]);
};
// Резонатор (полосовой) — «тело» щелчка.
const resonate = (x, f0, q) => {
  const w = (2 * Math.PI * f0) / SR;
  const r = Math.exp(-w / (2 * q));
  const c1 = 2 * r * Math.cos(w);
  const c2 = -r * r;
  let y1 = 0;
  let y2 = 0;
  const out = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) {
    const y = x[i] * (1 - r) + c1 * y1 + c2 * y2;
    out[i] = y;
    y2 = y1;
    y1 = y;
  }
  return out;
};

const add = (dst, src, at = 0, g = 1) => {
  const o = Math.round(at * SR);
  for (let i = 0; i < src.length && o + i < dst.length; i++) dst[o + i] += src[i] * g;
  return dst;
};

const normalize = (b, peakDb) => {
  let p = 0;
  for (const v of b) p = Math.max(p, Math.abs(v));
  const g = Math.pow(10, peakDb / 20) / (p || 1);
  for (let i = 0; i < b.length; i++) b[i] *= g;
  const fi = Math.min(b.length, Math.round(0.002 * SR));
  for (let i = 0; i < fi; i++) b[i] *= i / fi;
  const fo = Math.min(b.length, Math.round(0.03 * SR));
  for (let i = 0; i < fo; i++) b[b.length - 1 - i] *= i / fo;
  return b;
};

const save = (name, b, filter = "") => {
  const wav = join(TMP, `${name}.wav`);
  writeWav(wav, [b, b]);
  ffmpeg(["-y", "-i", wav, ...(filter ? ["-af", filter] : []), "-ar", String(SR), "-ac", "2", "-codec:a", "libmp3lame", "-b:a", "192k", join(OUT, `${name}.mp3`)]);
  console.log(`✓ ${name}.mp3`);
};

// Короткий щелчок: импульс шума через резонаторы body/click.
const click = (len, body, bright, decay, gBody = 1, gBright = 0.6) => {
  const n = buf(len);
  for (let i = 0; i < n.length; i++) n[i] = rnd() * Math.exp(-i / SR / decay);
  const a = resonate(n, body, 6);
  const b = resonate(n, bright, 9);
  return a.map((v, i) => v * gBody * 8 + b[i] * gBright * 8);
};

// 1. Тик и так — механизм часов (так ниже тоном).
save("tick-0", normalize(click(0.09, 1850, 4200, 0.006, 1, 0.8), -9), "highpass=f=400");
save("tick-1", normalize(click(0.09, 1550, 3600, 0.007, 1, 0.6), -10), "highpass=f=400");

// 2. Штамп заголовка: низкий мягкий удар + шлепок бумаги.
{
  const b = buf(0.32);
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    b[i] = Math.sin(2 * Math.PI * (95 - 40 * t) * t) * Math.exp(-t / 0.06) * 0.9;
  }
  const paper = lowpass(highpass(Float32Array.from({ length: Math.round(0.08 * SR) }, (_, i) => rnd() * Math.exp(-i / SR / 0.02)), 900), 5000);
  add(b, paper, 0.002, 0.8);
  save("stamp", normalize(b, -6));
}

// 3. Перо по бумаге: мягкий шорох с ритмом штрихов (≈ 7 штрихов/с).
{
  const len = 6.5;
  const n = Float32Array.from({ length: Math.round(len * SR) }, () => rnd());
  const f = lowpass(highpass(n, 2200), 7000);
  for (let i = 0; i < f.length; i++) {
    const t = i / SR;
    const stroke = 0.35 + 0.65 * Math.pow(Math.abs(Math.sin(Math.PI * 7 * t + 0.4 * Math.sin(Math.PI * 1.3 * t))), 1.6);
    f[i] *= stroke;
  }
  save("pen-write", normalize(f, -14));
}

// 4. Зубчатый росчерк: шесть быстрых штрихов.
{
  const b = buf(0.42);
  for (let k = 0; k < 6; k++) {
    const s = Float32Array.from({ length: Math.round(0.05 * SR) }, (_, i) => rnd() * Math.sin((Math.PI * i) / (0.05 * SR)));
    add(b, lowpass(highpass(s, 2000), 6500), k * 0.062, 0.9 - k * 0.05);
  }
  save("pen-zig", normalize(b, -12));
}

// 5. Стрелка задевает ручку: сухой щелчок + короткий скрежет.
{
  const b = buf(0.45);
  add(b, click(0.12, 1200, 3000, 0.01, 1.2, 0.8), 0, 1);
  const scr = Float32Array.from({ length: Math.round(0.25 * SR) }, (_, i) => rnd() * Math.exp(-i / SR / 0.08));
  add(b, lowpass(highpass(scr, 1500), 5000), 0.015, 0.7);
  save("hand-hit", normalize(b, -6));
}

// 6. Такт принтера: моторчик (жужжание 120 Гц с гармониками) и щелчок.
{
  const b = buf(0.26);
  for (let i = 0; i < Math.round(0.16 * SR); i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.01) * Math.exp(-Math.max(0, t - 0.1) / 0.03);
    b[i] = env * (0.5 * Math.sin(2 * Math.PI * 118 * t) + 0.3 * Math.sin(2 * Math.PI * 236 * t + 0.4) + 0.18 * Math.sin(2 * Math.PI * 472 * t) + 0.12 * rnd());
  }
  add(b, click(0.08, 2400, 5200, 0.005, 1, 0.7), 0.15, 0.7);
  save("printer-step", normalize(b, -10), "highpass=f=80");
}

// 7. Крышка ноутбука: мягкий хлопок и защёлка.
{
  const b = buf(0.38);
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    b[i] = Math.sin(2 * Math.PI * (140 - 60 * t) * t) * Math.exp(-t / 0.05) * 0.8;
  }
  add(b, lowpass(Float32Array.from({ length: Math.round(0.05 * SR) }, (_, i) => rnd() * Math.exp(-i / SR / 0.012)), 3000), 0, 0.6);
  add(b, click(0.06, 2800, 5500, 0.004, 0.6, 0.6), 0.03, 0.5);
  save("lid", normalize(b, -7));
}

// 8. Кадр «складывается»: глухой мягкий удар с коротким воздухом.
{
  const b = buf(0.6);
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    b[i] = Math.sin(2 * Math.PI * (70 - 25 * t) * t) * Math.exp(-t / 0.12);
  }
  const air = Float32Array.from({ length: Math.round(0.25 * SR) }, (_, i) => rnd() * Math.sin((Math.PI * i) / (0.25 * SR)));
  add(b, lowpass(air, 1200), 0, 0.5);
  save("fold", normalize(b, -8));
}

// 9. Отправка: короткий восходящий «фьють».
{
  const b = buf(0.3);
  let ph = 0;
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    ph += (2 * Math.PI * (600 + 1800 * Math.pow(t / 0.3, 1.5))) / SR;
    b[i] = Math.sin(ph) * Math.sin((Math.PI * t) / 0.3) * 0.6;
  }
  const air = Float32Array.from({ length: b.length }, (_, i) => rnd() * Math.sin((Math.PI * i) / b.length));
  add(b, highpass(air, 3000), 0, 0.25);
  save("send", normalize(b, -12));
}
