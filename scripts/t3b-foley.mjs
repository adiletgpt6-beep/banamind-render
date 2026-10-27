// Тихие бытовые звуки BalaGoThirdBMeeting2D (детерминированный синтез,
// без внешних сервисов) → public/audio/third-b-meeting-2d/sfx/*.mp3.
// Только звуки с видимым действием: альбом открывается (шорох листа),
// лист вынимают (короткое скольжение), один щелчок ремня, мягкая дверь
// машины, крышка ноутбука, мягкий сигнал завершения звонка, одно касание
// «отправить», карандаш по бумаге; тихий салон машины.
// Шагов нет совсем (ни синтетических ударов, ни скрипов) — по просьбе.
// Запуск: node scripts/t3b-foley.mjs (результат хранится в Git).
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { SAMPLE_RATE as SR, ffmpeg, mulberry32, writeWav } from "./lib/audio.mjs";

const OUT = "public/audio/third-b-meeting-2d/sfx";
mkdirSync(OUT, { recursive: true });
const TMP = join(tmpdir(), "t3b-foley");
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

// лист бумаги ложится на стол: короткий шорох + мягкое касание
{
  const x = buf(0.6);
  const n = biquad(biquad(noise(0.45, 701), "bp", 2600, 0.7), "hp", 900);
  for (let i = 0; i < n.length; i++) {
    const t = i / SR;
    n[i] *= Math.sin(Math.PI * Math.min(1, t / 0.4)) * (t < 0.4 ? 1 : 0) * (0.7 + 0.3 * Math.sin(t * 60));
  }
  add(x, n, 0, 0.7);
  add(x, env(body(noise(0.1, 702), [[380, 4, 1], [1200, 5, 0.4]]), 0.002, 0.015), 0.36, 0.25);
  save("paper", x, -16);
}
// фотография переходит из рук в руки: очень короткое скольжение
{
  const x = buf(0.35);
  const n = biquad(biquad(noise(0.3, 711), "bp", 3200, 0.9), "hp", 1500);
  for (let i = 0; i < n.length; i++) {
    const t = i / SR;
    n[i] *= Math.sin(Math.PI * Math.min(1, t / 0.25)) * (t < 0.25 ? 1 : 0);
  }
  add(x, n, 0, 0.6);
  save("photo", x, -20);
}
// крышка ноутбука: мягкое касание и тихий магнитный щелчок
{
  const x = buf(0.4);
  add(x, env(body(noise(0.15, 721), [[260, 5, 1], [820, 6, 0.5], [2400, 8, 0.15]]), 0.002, 0.025), 0, 1);
  add(x, env(biquad(noise(0.03, 722), "bp", 3500, 2), 0.0005, 0.004), 0.012, 0.12);
  save("laptop-close", x, -14);
}
// дверь машины закрывается: глухой удар кузова и короткий металлический призвук
{
  const x = buf(0.7);
  add(x, env(body(noise(0.4, 731), [[90, 3, 1], [180, 4, 0.7], [520, 6, 0.3]]), 0.002, 0.06), 0, 1);
  add(x, env(body(noise(0.1, 732), [[1400, 10, 0.4], [2900, 12, 0.2]]), 0.001, 0.02), 0.004, 0.25);
  save("car-door", biquad(x, "lp", 3000), -12);
}
// касание кнопки на экране
{
  const x = buf(0.12);
  add(x, env(biquad(biquad(noise(0.08, 741), "bp", 1200, 1.2), "lp", 2500), 0.0008, 0.008), 0, 1);
  save("tap", x, -18);
}
// салон машины: ровный тихий гул
{
  const x = buf(6);
  const hum = biquad(biquad(noise(6, 751), "lp", 160), "hp", 30);
  for (let i = 0; i < hum.length; i++) {
    const t = i / SR;
    hum[i] = hum[i] * 0.8 + 0.08 * Math.sin(2 * Math.PI * 46 * t);
  }
  add(x, hum, 0, 1);
  save("car-cabin", x, -14);
}
// щелчок замка ремня: короткий металлический двойной щелчок
{
  const x = buf(0.25);
  add(x, env(body(noise(0.05, 761), [[2400, 9, 1], [4100, 12, 0.5]]), 0.0005, 0.006), 0, 1);
  add(x, env(body(noise(0.05, 762), [[1800, 8, 1], [3600, 10, 0.4]]), 0.0005, 0.008), 0.045, 0.8);
  save("belt", biquad(x, "lp", 6000), -16);
}
// карандаш по бумаге: тихий шорох с ритмом штрихов (4 с, обрезается по месту)
{
  const x = buf(4);
  const n = biquad(biquad(noise(4, 771), "bp", 3400, 0.8), "hp", 1800);
  for (let i = 0; i < n.length; i++) {
    const t = i / SR;
    const stroke = 0.5 + 0.5 * Math.sin(2 * Math.PI * 5.2 * t + Math.sin(2 * Math.PI * 0.7 * t) * 2);
    n[i] *= 0.25 + 0.75 * stroke * stroke;
  }
  add(x, n, 0, 1);
  save("pencil", x, -24);
}
// завершение звонка: мягкий двухнотный сигнал вниз (без резкой атаки)
{
  const x = buf(0.9);
  for (const [f0, at] of [[784, 0], [587, 0.22]]) {
    for (let i = 0; i < Math.round(0.5 * SR); i++) {
      const t = i / SR;
      const e = Math.min(1, t / 0.02) * Math.exp(-t / 0.16);
      x[Math.round(at * SR) + i] += e * (Math.sin(2 * Math.PI * f0 * t) + 0.2 * Math.sin(4 * Math.PI * f0 * t));
    }
  }
  save("call-end", x, -20);
}
