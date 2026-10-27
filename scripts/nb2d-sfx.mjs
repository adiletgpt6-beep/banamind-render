// Звуки окружения BalaGoNoBackup2D, которых нет среди общих эффектов
// проекта: шаги (взрослый, ребёнок), дверь, ключи, щелчок ремня
// безопасности, птицы во дворе, гул салона, тон комнаты, шорох сумки и
// мягкий стук сумки о стол. Синтез детерминированный (seed), результат —
// public/audio/no-backup-2d/sfx/*.mp3. Запуск: node scripts/nb2d-sfx.mjs
// [имя …] — только перечисленные звуки (остальные файлы не трогаются).
// Ролик эти синтетические версии больше не использует: естественные записи
// лежат в public/audio/no-backup-2d/foley/ (SOURCES.json), и скрипт туда
// никогда не пишет.
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { SAMPLE_RATE as SR, ffmpeg, mulberry32, writeWav } from "./lib/audio.mjs";

const OUT = "public/audio/no-backup-2d/sfx";
mkdirSync(OUT, { recursive: true });
const TMP = join(tmpdir(), "nb2d-sfx");
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
const ONLY = process.argv.slice(2);
const save = (name, x, peakDb = -6) => {
  if (ONLY.length && !ONLY.includes(name)) return;
  let p = 0;
  for (const v of x) p = Math.max(p, Math.abs(v));
  const g = Math.pow(10, peakDb / 20) / (p || 1);
  for (let i = 0; i < x.length; i++) x[i] *= g;
  const wav = join(TMP, `${name}.wav`);
  writeWav(wav, [x]);
  ffmpeg(["-i", wav, "-ar", String(SR), "-ac", "1", "-codec:a", "libmp3lame", "-b:a", "160k", join(OUT, `${name}.mp3`)]);
  console.log(`✓ ${name}.mp3`);
};

// Короткий гудок исходящего звонка. Не занимает паузу до ответа.
{
  const x = buf(0.45);
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    const a = Math.min(1, t / 0.025, (0.45 - t) / 0.06);
    x[i] = a * (Math.sin(2 * Math.PI * 425 * t) + 0.16 * Math.sin(2 * Math.PI * 850 * t));
  }
  save("call", x, -18);
}

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

// гул салона на ходу: низкий шум дороги и мотора (петля 8 с, края сведены)
{
  const len = 8;
  const x = buf(len);
  add(x, lowpass(lowpass(noise(len, 71), 160), 160), 0, 1);
  const road = highpass(lowpass(noise(len, 72), 900), 250);
  add(x, road, 0, 0.12);
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    x[i] += 0.05 * Math.sin(2 * Math.PI * 38 * t) * (0.8 + 0.2 * Math.sin(2 * Math.PI * 0.4 * t));
    const edge = Math.min(1, t / 0.4, (len - t) / 0.4);
    x[i] *= edge;
  }
  save("cabin", x, -14);
}

// тон комнаты (офис): тихий ровный шум вентиляции
{
  const len = 8;
  const x = lowpass(lowpass(noise(len, 81), 700), 700);
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    x[i] *= Math.min(1, t / 0.4, (len - t) / 0.4);
  }
  save("room", x, -24);
}

// шорох сумки: рука ищет телефон
{
  const x = buf(0.6);
  const n = highpass(lowpass(noise(0.6, 91), 4500), 900);
  for (let i = 0; i < n.length; i++) {
    const t = i / SR;
    n[i] *= Math.sin((Math.PI * t) / 0.6) * (0.6 + 0.4 * Math.sin(2 * Math.PI * 9 * t));
  }
  add(x, n, 0, 1);
  save("rustle", x, -14);
}

// сумка ставится на стол: мягкий глухой стук
{
  const x = buf(0.4);
  add(x, env(lowpass(noise(0.3, 95), 180), 0.003, 0.05), 0, 1);
  add(x, env(highpass(noise(0.06, 96), 1500), 0.001, 0.012), 0.004, 0.2);
  save("thump", x, -12);
}
