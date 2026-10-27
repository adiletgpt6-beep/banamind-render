// Звуки фильма №35, которых нет среди общих эффектов проекта и эффектов
// ролика №12: тихая клавиатура, полоска скотча (рисунок у монитора),
// крышка коробки и игровое поле, деревянные фишки настольной игры.
// Синтез детерминированный (seed), результат —
// public/audio/programmers-hardest-task/sfx/*.mp3.
// Запуск: node scripts/pht-sfx.mjs
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { SAMPLE_RATE as SR, ffmpeg, mulberry32, writeWav } from "./lib/audio.mjs";

const OUT = "public/audio/programmers-hardest-task/sfx";
mkdirSync(OUT, { recursive: true });
const TMP = join(tmpdir(), "pht-sfx");
mkdirSync(TMP, { recursive: true });

const buf = (sec) => new Float32Array(Math.round(sec * SR));
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
const tone = (sec, hz, decay) => {
  const x = buf(sec);
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    x[i] = Math.sin(2 * Math.PI * hz * t) * Math.exp(-t / decay);
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

// тихая клавиатура: короткая серия мягких щелчков (≈ 1,2 с)
{
  const x = buf(1.3);
  const r = mulberry32(301);
  let t = 0.02;
  while (t < 1.15) {
    const k = buf(0.05);
    add(k, env(highpass(lowpass(noise(0.05, 302 + Math.round(t * 1000)), 3200), 700), 0.0008, 0.008), 0);
    add(k, env(lowpass(noise(0.04, 303 + Math.round(t * 1000)), 500), 0.001, 0.01), 0.002, 0.5);
    add(x, k, t, 0.5 + r() * 0.5);
    t += 0.07 + r() * 0.12;
  }
  save("keyboard", x, -18);
}

// одно касание экрана/клавиши
{
  const x = buf(0.08);
  add(x, env(highpass(lowpass(noise(0.06, 311), 2800), 600), 0.0008, 0.009), 0);
  save("key", x, -20);
}

// скотч: короткий отрыв ленты и прижатие листа
{
  const x = buf(0.7);
  const rip = highpass(lowpass(noise(0.35, 321), 5200), 1200);
  const r = mulberry32(322);
  for (let i = 0; i < rip.length; i++) {
    const t = i / SR;
    rip[i] *= (0.5 + 0.5 * Math.sign(Math.sin(2 * Math.PI * (90 + 30 * r()) * t))) * Math.sin((Math.PI * t) / 0.35);
  }
  add(x, rip, 0, 0.35);
  add(x, env(lowpass(noise(0.15, 323), 700), 0.004, 0.03), 0.45, 0.6);
  save("tape", x, -16);
}

// крышка картонной коробки: мягкое трение и глухой «пух»
{
  const x = buf(0.8);
  add(x, env(highpass(lowpass(noise(0.4, 331), 1800), 300), 0.06, 0.12), 0, 0.5);
  add(x, env(lowpass(noise(0.3, 332), 240), 0.003, 0.06), 0.36, 1);
  save("box", x, -14);
}

// игровое поле раскладывается на столе: мягкий хлопок картона
{
  const x = buf(0.5);
  add(x, env(lowpass(noise(0.3, 341), 320), 0.004, 0.05), 0, 1);
  add(x, env(highpass(noise(0.05, 342), 1500), 0.001, 0.01), 0.005, 0.2);
  save("board", x, -15);
}

// деревянная фишка ставится на поле: короткий тёплый стук
const piece = (seed, f0) => {
  const x = buf(0.25);
  add(x, env(lowpass(noise(0.08, seed), 1200), 0.0008, 0.012), 0, 0.6);
  add(x, tone(0.2, f0, 0.025), 0.001, 0.5);
  add(x, tone(0.2, f0 * 2.7, 0.012), 0.001, 0.15);
  return x;
};
save("piece-0", piece(351, 820), -15);
save("piece-1", piece(352, 940), -15);
save("piece-2", piece(353, 760), -16);
