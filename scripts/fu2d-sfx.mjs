// Звуки окружения BalaGoFiveUnsentMessages2D, которых нет среди общих эффектов
// проекта: шаги (взрослый, ребёнок), дверь, ключи, щелчок ремня
// безопасности, птицы во дворе, посуда (тарелка, ложка), ноутбук, стул,
// молния сумки, чай в пиалу, дверь машины. Синтез детерминированный (seed), результат
// — public/audio/five-unsent-messages-2d/sfx/*.mp3. Запуск: node scripts/fu2d-sfx.mjs
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { SAMPLE_RATE as SR, ffmpeg, mulberry32, writeWav } from "./lib/audio.mjs";

const OUT = "public/audio/five-unsent-messages-2d/sfx";
mkdirSync(OUT, { recursive: true });
const TMP = join(tmpdir(), "fu2d-sfx");
mkdirSync(TMP, { recursive: true });

const buf = (sec) => new Float32Array(Math.round(sec * SR));
// однополюсный фильтр низких частот
const lowpass = (x, hz) => {
  const a = Math.exp((-2 * Math.PI * hz) / SR);
  let y = 0;
  for (let i = 0; i < x.length; i++) {
    y = (1 - a) * x[i] + a * y;
    x[i] = y;
  }
  return x;
};
const highpass = (x, hz) => {
  const lp = lowpass(Float32Array.from(x), hz);
  for (let i = 0; i < x.length; i++) x[i] -= lp[i];
  return x;
};
const add = (dst, src, at, gain = 1) => {
  const o = Math.round(at * SR);
  for (let i = 0; i < src.length && o + i < dst.length; i++) dst[o + i] += src[i] * gain;
};
const noise = (sec, seed) => {
  const r = mulberry32(seed);
  const x = buf(sec);
  for (let i = 0; i < x.length; i++) x[i] = r() * 2 - 1;
  return x;
};
const env = (x, attack, decay) => {
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    x[i] *= Math.min(1, t / attack) * Math.exp(-t / decay);
  }
  return x;
};
const save = (name, x, peakDb = -6) => {
  let p = 0;
  for (const v of x) p = Math.max(p, Math.abs(v));
  const g = Math.pow(10, peakDb / 20) / (p || 1);
  for (let i = 0; i < x.length; i++) x[i] *= g;
  const wav = join(TMP, `${name}.wav`);
  writeWav(wav, [x]);
  ffmpeg(["-i", wav, "-ar", String(SR), "-ac", "1", "-codec:a", "libmp3lame", "-b:a", "160k", join(OUT, `${name}.mp3`)]);
  console.log(`✓ ${name}.mp3`);
};

// шаг: мягкий удар каблука + шорох подошвы
const step = (seed, low, bright) => {
  const x = buf(0.22);
  add(x, env(lowpass(noise(0.2, seed), low), 0.002, 0.025), 0);
  add(x, env(highpass(noise(0.2, seed + 1), bright), 0.004, 0.04), 0.012, 0.25);
  return x;
};
save("step", step(11, 520, 2400), -9);
save("step-child", step(23, 900, 3200), -11);

// дверь: щелчок ручки, скрип, хлопок
{
  const open = buf(0.9);
  add(open, env(highpass(noise(0.03, 5), 2500), 0.001, 0.008), 0.0, 0.8);
  add(open, env(highpass(noise(0.03, 6), 2000), 0.001, 0.01), 0.07, 0.6);
  const creak = buf(0.6);
  for (let i = 0; i < creak.length; i++) {
    const t = i / SR;
    const f0 = 260 + 220 * t;
    creak[i] = Math.sin(2 * Math.PI * f0 * t + 3 * Math.sin(2 * Math.PI * 23 * t)) * (0.5 + 0.5 * Math.sin(2 * Math.PI * 31 * t)) * Math.sin((Math.PI * t) / 0.6);
  }
  add(open, creak, 0.2, 0.18);
  save("door-open", open, -10);
  const close = buf(0.6);
  add(close, env(lowpass(noise(0.4, 9), 220), 0.002, 0.07), 0.0, 1);
  add(close, env(highpass(noise(0.05, 10), 2200), 0.001, 0.012), 0.03, 0.5);
  save("door-close", close, -8);
}

// ключи: короткие металлические звоны
{
  const x = buf(0.7);
  const r = mulberry32(31);
  for (let k = 0; k < 9; k++) {
    const at = 0.02 + r() * 0.45;
    const f0 = 2800 + r() * 3400;
    const ping = buf(0.25);
    for (let i = 0; i < ping.length; i++) {
      const t = i / SR;
      ping[i] = (Math.sin(2 * Math.PI * f0 * t) + 0.5 * Math.sin(2 * Math.PI * f0 * 2.76 * t)) * Math.exp(-t / 0.05);
    }
    add(x, ping, at, 0.3 + r() * 0.4);
  }
  save("keys", x, -12);
}

// ремень безопасности: протяжка ленты и щелчок замка
{
  const x = buf(0.9);
  const pull = env(highpass(lowpass(noise(0.5, 41), 3000), 600), 0.08, 0.25);
  add(x, pull, 0, 0.35);
  add(x, env(highpass(noise(0.03, 42), 3000), 0.0005, 0.006), 0.62, 1);
  add(x, env(lowpass(noise(0.05, 43), 900), 0.001, 0.015), 0.62, 0.5);
  save("belt", x, -8);
}

// птицы во дворе: редкое щебетание (петля 8 с)
{
  const x = buf(8);
  const r = mulberry32(57);
  for (let k = 0; k < 14; k++) {
    const at = r() * 7.4;
    const n = 2 + Math.floor(r() * 4);
    const base = 2600 + r() * 2200;
    for (let j = 0; j < n; j++) {
      const ch = buf(0.09);
      for (let i = 0; i < ch.length; i++) {
        const t = i / SR;
        const fq = base + 1400 * Math.sin((Math.PI * t) / 0.09) * (j % 2 ? 1 : -0.6);
        ch[i] = Math.sin(2 * Math.PI * fq * t) * Math.sin((Math.PI * t) / 0.09);
      }
      add(x, ch, at + j * 0.11, 0.25 + r() * 0.2);
    }
  }
  save("birds", x, -14);
}

// керамика: короткий звон и мягкий стук о стол
const ceramic = (seed, f0, ring, thud) => {
  const x = buf(0.5);
  add(x, env(lowpass(noise(0.12, seed), 400), 0.001, 0.02), 0, thud);
  const r = mulberry32(seed + 1);
  for (const [mul, g] of [[1, 1], [2.32, 0.5], [4.1, 0.25]]) {
    const fq = f0 * mul * (1 + (r() - 0.5) * 0.02);
    const p = buf(0.45);
    for (let i = 0; i < p.length; i++) {
      const t = i / SR;
      p[i] = Math.sin(2 * Math.PI * fq * t) * Math.exp(-t / ring);
    }
    add(x, p, 0.002, g * 0.3);
  }
  return x;
};
save("plate", ceramic(61, 1850, 0.07, 1), -12);
save("cup", ceramic(67, 2400, 0.05, 0.6), -14);
save("spoon", ceramic(71, 4200, 0.03, 0.15), -18);

// ноутбук: крышка закрывается — мягкий хлопок; открывается — шорох петли
{
  const close = buf(0.4);
  add(close, env(lowpass(noise(0.2, 81), 260), 0.002, 0.04), 0.0, 1);
  add(close, env(highpass(noise(0.03, 82), 1800), 0.001, 0.006), 0.004, 0.25);
  save("laptop-close", close, -12);
  const open = env(highpass(lowpass(noise(0.5, 83), 1400), 300), 0.1, 0.18);
  save("laptop-open", open, -20);
}

// стул: короткий скрип ножек по полу
{
  const x = buf(0.6);
  const n = highpass(lowpass(noise(0.5, 91), 1600), 250);
  for (let i = 0; i < n.length; i++) {
    const t = i / SR;
    n[i] *= (0.6 + 0.4 * Math.sin(2 * Math.PI * 38 * t)) * Math.sin((Math.PI * Math.min(t, 0.5)) / 0.5);
  }
  add(x, n, 0, 0.7);
  save("chair", x, -15);
}

// молния сумки: частые щелчки зубцов
{
  const x = buf(0.55);
  const r = mulberry32(101);
  for (let k = 0; k < 46; k++) {
    const at = 0.02 + k * 0.0105 + r() * 0.002;
    add(x, env(highpass(noise(0.01, 102 + k), 2600), 0.0003, 0.003), at, 0.4 + r() * 0.3);
  }
  save("zip", x, -16);
}

// чай наливается в пиалу: журчание (фильтрованный шум с модуляцией)
{
  const x = buf(1.6);
  const n = lowpass(highpass(noise(1.6, 111), 500), 2600);
  const r = mulberry32(112);
  let ph = 0;
  for (let i = 0; i < n.length; i++) {
    const t = i / SR;
    ph += (2 * Math.PI * (9 + 5 * r())) / SR;
    n[i] *= (0.55 + 0.45 * Math.sin(ph)) * Math.min(1, t / 0.08) * Math.min(1, (1.6 - t) / 0.25);
  }
  add(x, n, 0, 0.6);
  save("pour", x, -18);
}

// дверь машины: глухой хлопок
{
  const x = buf(0.6);
  add(x, env(lowpass(noise(0.4, 121), 160), 0.002, 0.08), 0.0, 1);
  add(x, env(lowpass(noise(0.1, 122), 900), 0.001, 0.02), 0.0, 0.4);
  save("car-door", x, -9);
}

// мягкий щелчок календаря и короткая отметка новой задержки
{
  const tick = buf(0.12);
  add(tick, env(highpass(noise(0.03, 131), 1800), 0.0005, 0.006), 0, 0.6);
  add(tick, env(lowpass(noise(0.05, 132), 700), 0.001, 0.012), 0.002, 0.5);
  save("tick", tick, -16);
  const mark = buf(0.5);
  for (const [f0, at, g] of [[660, 0, 0.6], [880, 0.09, 0.5]]) {
    const p = buf(0.35);
    for (let i = 0; i < p.length; i++) {
      const t = i / SR;
      p[i] = (Math.sin(2 * Math.PI * f0 * t) + 0.25 * Math.sin(4 * Math.PI * f0 * t)) * Math.min(1, t / 0.005) * Math.exp(-t / 0.09);
    }
    add(mark, p, at, g);
  }
  save("mark", mark, -18);
}
