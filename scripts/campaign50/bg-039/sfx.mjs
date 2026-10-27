// Звуки BalaGoBG039 (детерминированный синтез, без API):
//   stamp — глухой удар чернильного штампа по бумаге на столе,
//   click — мягкий щелчок (ячейки блока, строки шкалы),
//   print — короткое жужжание печати билета компенсации,
//   slide — шорох бумаги, скользящей в папку.
// Запуск: node scripts/campaign50/bg-039/sfx.mjs (файлы коммитятся;
// workflow этот скрипт не запускает).
import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SAMPLE_RATE as SR, ffmpeg, writeWav } from "../../lib/audio.mjs";
import { BG39_VIDEO } from "../../../src/campaign50/bg-039/script.ts";

const OUT = join("public", BG39_VIDEO.sfxDir);
const TMP = join(tmpdir(), "balago-bg039-sfx");
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

// детерминированный шум
let seed = 39039;
const rnd = () => {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648 - 0.5;
};

const buf = (sec) => new Float32Array(Math.round(sec * SR));

// однополюсный фильтр нижних частот
const lowpass = (x, hz) => {
  const a = Math.exp((-2 * Math.PI * hz) / SR);
  let y = 0;
  return x.map((v) => (y = (1 - a) * v + a * y));
};
const highpass = (x, hz) => {
  const lp = lowpass(x, hz);
  return x.map((v, i) => v - lp[i]);
};

const normalize = (x, peakDb) => {
  let p = 0;
  for (const v of x) p = Math.max(p, Math.abs(v));
  const g = Math.pow(10, peakDb / 20) / (p || 1);
  const fo = Math.round(0.03 * SR);
  return x.map((v, i) => v * g * (i > x.length - fo ? (x.length - i) / fo : 1));
};

const write = (name, x, filter = "anull") => {
  const wav = join(TMP, `${name}.wav`);
  writeWav(wav, [x, x]);
  ffmpeg(["-i", wav, "-af", filter, "-ar", String(SR), "-ac", "2", "-codec:a", "libmp3lame", "-b:a", "192k", join(OUT, `${name}.mp3`)]);
  console.log(`✓ ${join(OUT, `${name}.mp3`)}`);
};

// штамп: низкий удар (затухающий синус с падением высоты) + короткий
// приглушённый шум бумаги
{
  const x = buf(0.42);
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    const f = 70 + 60 * Math.exp(-t / 0.03);
    x[i] = 0.9 * Math.sin(2 * Math.PI * f * t) * Math.exp(-t / 0.07) * Math.min(1, t / 0.002);
  }
  const n = lowpass(Float32Array.from({ length: Math.round(0.08 * SR) }, (_, i) => rnd() * Math.exp(-i / SR / 0.018)), 2200);
  n.forEach((v, i) => (x[i] += 0.8 * v));
  write("stamp", normalize(x, -3));
}

// щелчок: короткий шум через полосу + тон
{
  const x = buf(0.09);
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    x[i] = (rnd() * 0.6 + 0.5 * Math.sin(2 * Math.PI * 1900 * t)) * Math.exp(-t / 0.012);
  }
  write("click", normalize(highpass(lowpass(x, 5000), 500), -6));
}

// печать: жужжание (пила 110 Гц с амплитудной модуляцией) + шорох
{
  const x = buf(0.7);
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.05) * Math.min(1, (0.7 - t) / 0.12);
    const saw = 2 * ((110 * t) % 1) - 1;
    x[i] = env * (0.35 * saw * (0.6 + 0.4 * Math.sin(2 * Math.PI * 28 * t)) + 0.25 * rnd());
  }
  write("print", normalize(lowpass(highpass(x, 150), 3000), -9));
}

// шорох бумаги: шум с «шершавой» огибающей
{
  const x = buf(0.5);
  let e = 0;
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    if (i % 400 === 0) e = 0.4 + Math.abs(rnd()) * 1.2;
    x[i] = rnd() * e * Math.sin(Math.PI * (t / 0.5));
  }
  write("slide", normalize(lowpass(highpass(x, 900), 6500), -10));
}
