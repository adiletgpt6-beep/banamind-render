// Тихие бытовые звуки фильма №36 → public/audio/suitcase-by-the-door-2d/sfx/.
// Детерминированный синтез (mulberry32, seed) — у каждого звука есть видимое
// действие в кадре. Часть звуков — копии уже проверенных синтезированных
// эффектов проекта (общие sfx-*.mp3 и набор ролика №12), чтобы фильм не
// зависел от чужих папок.
//   folder-down — папка мягко ложится (глухой шлепок картона + шорох);
//   lid — крышка чемодана закрывается (мягкий глухой удар);
//   suitcase-set — чемодан ставят на пол (короткий перекат колёс + стук);
//   call — тихий двойной сигнал видеозвонка;
//   room / hall / car — длинные очень тихие атмосферы комнаты, зала, салона;
//   yard — школьный двор: птицы и далёкий воздух (копия набора №12 + мягкий шум).
// Запуск: node scripts/sd2d-foley.mjs
import { copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { SAMPLE_RATE as SR, ffmpeg, mulberry32, writeWav } from "./lib/audio.mjs";

const OUT = "public/audio/suitcase-by-the-door-2d/sfx";
mkdirSync(OUT, { recursive: true });
const TMP = join(tmpdir(), "sd2d-foley");
mkdirSync(TMP, { recursive: true });
const TAU = Math.PI * 2;
const buf = (sec) => new Float32Array(Math.round(sec * SR));
const lowpass = (x, f) => {
  const a = Math.exp((-TAU * f) / SR);
  let y = 0;
  for (let i = 0; i < x.length; i++) x[i] = y = (1 - a) * x[i] + a * y;
  return x;
};
const highpass = (x, f) => {
  const lp = lowpass(Float32Array.from(x), f);
  for (let i = 0; i < x.length; i++) x[i] -= lp[i];
  return x;
};
const save = (name, ch, gainDb = -14) => {
  const chans = Array.isArray(ch) ? ch : [ch];
  let peak = 0;
  for (const c of chans) for (const v of c) peak = Math.max(peak, Math.abs(v));
  const g = Math.pow(10, gainDb / 20) / (peak || 1);
  for (const c of chans) for (let i = 0; i < c.length; i++) c[i] *= g;
  const wav = join(TMP, `${name}.wav`);
  writeWav(wav, chans);
  ffmpeg(["-i", wav, "-ar", String(SR), "-codec:a", "libmp3lame", "-b:a", "160k", join(OUT, `${name}.mp3`)]);
  console.log(`✓ ${name}.mp3`);
};

// папка ложится: короткий глухой импульс (70–200 Гц) + шорох бумаги
{
  const r = mulberry32(3601);
  const x = buf(0.5);
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    const thud = Math.sin(TAU * (140 - 60 * t) * t) * Math.exp(-t / 0.03) * 0.9;
    const rustle = (r() * 2 - 1) * Math.exp(-t / 0.09) * 0.35;
    x[i] = thud + rustle;
  }
  lowpass(x, 2600);
  save("folder-down", x, -16);
}
// крышка чемодана: мягкий глухой удар с коротким «воздухом»
{
  const r = mulberry32(3602);
  const x = buf(0.7);
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    const air = t < 0.08 ? (r() * 2 - 1) * (t / 0.08) * 0.15 : 0;
    const hit = t >= 0.08 ? Math.sin(TAU * 95 * (t - 0.08)) * Math.exp(-(t - 0.08) / 0.05) + (r() * 2 - 1) * Math.exp(-(t - 0.08) / 0.02) * 0.3 : 0;
    x[i] = air + hit;
  }
  lowpass(x, 1800);
  save("lid", x, -15);
}
// чемодан на пол: перекат колёс (зернистый низкий шум) и мягкий стук
{
  const r = mulberry32(3603);
  const x = buf(0.8);
  let y = 0;
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    const roll = t < 0.45 ? (r() * 2 - 1) * (0.25 + 0.25 * Math.sin(TAU * 18 * t) ** 2) * Math.min(1, t / 0.05) : 0;
    y = 0.96 * y + 0.04 * roll;
    const knock = t > 0.45 ? Math.sin(TAU * 110 * (t - 0.45)) * Math.exp(-(t - 0.45) / 0.04) : 0;
    x[i] = y * 6 + knock;
  }
  lowpass(x, 1500);
  save("suitcase-set", x, -17);
}
// сигнал видеозвонка: два мягких тона
{
  const x = buf(1.3);
  for (const [t0, f] of [[0, 660], [0.42, 880]]) {
    for (let i = Math.round(t0 * SR); i < x.length; i++) {
      const t = i / SR - t0;
      x[i] += Math.sin(TAU * f * t) * Math.min(1, t / 0.02) * Math.exp(-t / 0.22) * 0.6;
    }
  }
  save("call", x, -20);
}
// атмосферы: розовый шум через мягкие фильтры, очень тихо
const ambience = (name, seed, sec, lp, hp, gainDb, hum = 0) => {
  const r = mulberry32(seed);
  const L = buf(sec);
  const R = buf(sec);
  let b0 = 0;
  let b1 = 0;
  for (let i = 0; i < L.length; i++) {
    const w = r() * 2 - 1;
    b0 = 0.997 * b0 + 0.029 * w;
    b1 = 0.985 * b1 + 0.03 * (r() * 2 - 1);
    const t = i / SR;
    const h = hum ? Math.sin(TAU * hum * t) * 0.02 : 0;
    L[i] = b0 + h;
    R[i] = b1 + h;
  }
  for (const c of [L, R]) {
    lowpass(c, lp);
    highpass(c, hp);
    const fade = Math.round(0.8 * SR);
    for (let i = 0; i < fade; i++) {
      c[i] *= i / fade;
      c[c.length - 1 - i] *= i / fade;
    }
  }
  save(name, [L, R], gainDb);
};
ambience("room", 3611, 30, 900, 60, -30);
ambience("hall", 3612, 20, 1200, 80, -28);
ambience("car", 3613, 20, 400, 40, -24, 48);

// проверенные звуки проекта (копии)
const copy = (src, name) => {
  copyFileSync(src, join(OUT, `${name}.mp3`));
  console.log(`= ${name}.mp3 ← ${src}`);
};
copy("public/audio/two-schedules-2d/sfx/zip.mp3", "zip");
copy("public/audio/two-schedules-2d/sfx/belt.mp3", "belt");
copy("public/audio/two-schedules-2d/sfx/car-door.mp3", "car-door");
copy("public/audio/two-schedules-2d/sfx/door-close.mp3", "door");
copy("public/audio/two-schedules-2d/sfx/chair.mp3", "chair");
copy("public/audio/two-schedules-2d/sfx/spoon.mp3", "spoon");
copy("public/audio/two-schedules-2d/sfx/birds.mp3", "yard");
copy("public/audio/sfx-paper.mp3", "paper");
copy("public/audio/sfx-tap.mp3", "tap");
copy("public/audio/sfx-notify.mp3", "notify");
copy("public/audio/sfx-chime.mp3", "chime");
