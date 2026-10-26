// Тихие бытовые звуки BalaGoKnowsMyName2D (детерминированный синтез,
// без внешних сервисов) → public/audio/knows-my-name-2d/sfx/*.mp3.
// Только звуки с видимым действием (№30): штрих ручки по бумаге, телефон
// ложится на стол экраном вниз, машинка касается стола, шорох лямки
// рюкзака, одно мягкое касание кнопки на экране.
// Шагов нет совсем (ни синтетических ударов, ни скрипов) — по просьбе.
// Запуск: node scripts/km2d-foley.mjs (результат хранится в Git).
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { SAMPLE_RATE as SR, ffmpeg, mulberry32, writeWav } from "./lib/audio.mjs";

const OUT = "public/audio/knows-my-name-2d/sfx";
mkdirSync(OUT, { recursive: true });
const TMP = join(tmpdir(), "km2d-foley");
mkdirSync(TMP, { recursive: true });

const buf = (sec) => new Float32Array(Math.round(sec * SR));
const noise = (sec, seed) => {
  const r = mulberry32(seed);
  const x = buf(sec);
  for (let i = 0; i < x.length; i++) x[i] = r() * 2 - 1;
  return x;
};
// биквадратный фильтр (RBJ): type = "bp" | "lp" | "hp"
const biquad = (x, type, f0, q = 0.707) => {
  const w = (2 * Math.PI * f0) / SR;
  const al = Math.sin(w) / (2 * q);
  const c = Math.cos(w);
  let b0, b1, b2;
  if (type === "lp") [b0, b1, b2] = [(1 - c) / 2, 1 - c, (1 - c) / 2];
  else if (type === "hp") [b0, b1, b2] = [(1 + c) / 2, -(1 + c), (1 + c) / 2];
  else [b0, b1, b2] = [al, 0, -al];
  const a0 = 1 + al;
  const a1 = -2 * c;
  const a2 = 1 - al;
  const y = new Float32Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const v = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v;
  }
  return y;
};
const env = (x, attack, decay) => {
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    x[i] *= Math.min(1, t / attack) * Math.exp(-t / decay);
  }
  return x;
};
const add = (dst, src, at, gain = 1) => {
  const o = Math.round(at * SR);
  for (let i = 0; i < src.length && o + i < dst.length; i++) dst[o + i] += src[i] * gain;
};
const mix = (...parts) => {
  const n = Math.max(...parts.map((p) => p.length));
  const y = new Float32Array(n);
  for (const p of parts) for (let i = 0; i < p.length; i++) y[i] += p[i];
  return y;
};
const scale = (x, g) => x.map((v) => v * g);
// резонансы поверхности/предмета: сумма полосовых фильтров
const body = (x, modes) => mix(...modes.map(([f, q, g]) => scale(biquad(x, "bp", f, q), g)));
const save = (name, x, peakDb = -6) => {
  let p = 0;
  for (const v of x) p = Math.max(p, Math.abs(v));
  const g = Math.pow(10, peakDb / 20) / (p || 1);
  const y = x.map((v) => v * g);
  // мягкие края — без щелчков
  const fi = Math.min(y.length, Math.round(0.002 * SR));
  const fo = Math.min(y.length, Math.round(0.02 * SR));
  for (let i = 0; i < fi; i++) y[i] *= i / fi;
  for (let i = 0; i < fo; i++) y[y.length - 1 - i] *= i / fo;
  const wav = join(TMP, `${name}.wav`);
  writeWav(wav, [y]);
  ffmpeg(["-i", wav, "-ar", String(SR), "-ac", "1", "-codec:a", "libmp3lame", "-b:a", "160k", join(OUT, `${name}.mp3`)]);
  console.log(`✓ ${name}.mp3`);
};

// ручка: короткий мягкий штрих по бумаге
{
  const x = buf(0.36);
  const n = biquad(biquad(noise(0.32, 761), "bp", 3800, 1.3), "hp", 1900);
  for (let i = 0; i < n.length; i++) {
    const t = i / SR;
    n[i] *= Math.sin(Math.PI * Math.min(1, t / 0.3)) * (t < 0.3 ? 1 : 0) * (0.6 + 0.4 * Math.sin(t * 80));
  }
  add(x, n, 0, 0.6);
  save("pen", x, -26);
}
// телефон в чехле ложится на деревянный стол: глухое мягкое касание
{
  const x = buf(0.3);
  add(x, env(body(noise(0.1, 791), [[340, 6, 1], [1100, 8, 0.3]]), 0.0012, 0.012), 0, 1);
  save("phone-down", x, -20);
}
// пластиковая машинка касается стола: лёгкий высокий стук колёс
{
  const x = buf(0.3);
  add(x, env(body(noise(0.08, 801), [[1800, 9, 1], [3600, 12, 0.35]]), 0.0008, 0.008), 0, 1);
  add(x, env(body(noise(0.08, 802), [[1600, 9, 0.5]]), 0.0008, 0.006), 0.05, 0.5);
  save("toy", x, -24);
}
// лямка рюкзака: короткий тканевый шорох
{
  const x = buf(0.45);
  const n = biquad(biquad(noise(0.4, 811), "bp", 1400, 0.8), "hp", 500);
  for (let i = 0; i < n.length; i++) {
    const t = i / SR;
    n[i] *= Math.sin(Math.PI * Math.min(1, t / 0.36)) * (t < 0.36 ? 1 : 0);
  }
  add(x, n, 0, 0.7);
  save("bag", x, -26);
}
// касание кнопки на экране
{
  const x = buf(0.12);
  add(x, env(biquad(biquad(noise(0.08, 741), "bp", 1200, 1.2), "lp", 2500), 0.0008, 0.008), 0, 1);
  save("tap", x, -20);
}
