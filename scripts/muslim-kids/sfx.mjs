// Звуковые эффекты Muslim Kids — процедурно, без музыки и без внешних файлов.
// Все звуки детерминированы (фиксированное зерно), 48 кГц моно, 16 бит.
//   whoosh / whoosh-soft — мягкий воздушный переход (шум с плавающим полосовым фильтром)
//   spark  — едва слышное «шуршание» частиц (короткие шумовые зёрна)
//   thump  — мягкий глухой акцент (низкий шумовой удар)
//   drop   — капля (пузырёк с восходящим тоном) ; ripple — движение воды
//   nature — лёгкий ветер и листва ; night — тихий ночной ветер
//   air    — атмосферный «воздух» космоса ; rise — подъём камеры
//
// Запуск: node scripts/muslim-kids/sfx.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SR = 48000;
const OUT = "public/muslim-kids/ali-imran/sfx";
mkdirSync(OUT, { recursive: true });

const rng = (seed) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const writeWav = (name, s, peak = 0.7) => {
  let max = 0;
  for (const v of s) max = Math.max(max, Math.abs(v));
  const g = max > 0 ? peak / max : 1;
  const buf = Buffer.alloc(44 + s.length * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + s.length * 2, 4);
  buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(s.length * 2, 40);
  for (let i = 0; i < s.length; i++)
    buf.writeInt16LE(
      Math.round(Math.max(-1, Math.min(1, s[i] * g)) * 32767),
      44 + i * 2,
    );
  writeFileSync(join(OUT, name), buf);
  console.log(`${name}: ${(s.length / SR).toFixed(2)} с`);
};

// фильтр состояния (SVF): low/band/high с меняющейся частотой среза
const svf = (input, cutoff, q = 0.7, mode = "band") => {
  const out = new Float32Array(input.length);
  let low = 0;
  let band = 0;
  for (let i = 0; i < input.length; i++) {
    const fc = Math.min(0.45 * SR, Math.max(20, cutoff(i / SR)));
    const f = 2 * Math.sin((Math.PI * fc) / SR);
    const high = input[i] - low - q * band;
    band += f * high;
    low += f * band;
    out[i] = mode === "low" ? low : mode === "high" ? high : band;
  }
  return out;
};

const noise = (n, seed) => {
  const r = rng(seed);
  return Float32Array.from({ length: n }, () => r() * 2 - 1);
};
// «розоватый» шум: сглаженный белый
const pinkish = (n, seed) => {
  const w = noise(n, seed);
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  return w.map((x) => {
    b0 = 0.99765 * b0 + x * 0.099046;
    b1 = 0.963 * b1 + x * 0.2965164;
    b2 = 0.57 * b2 + x * 1.0526913;
    return (b0 + b1 + b2 + x * 0.1848) * 0.2;
  });
};
const env = (n, fn) =>
  Float32Array.from({ length: n }, (_, i) => fn(i / SR, i / n));
const mul = (a, b) => a.map((v, i) => v * b[i]);
const add = (a, b, gb = 1) => a.map((v, i) => v + (b[i] ?? 0) * gb);
const fadeEdges = (s, fin = 0.01, fout = 0.05) => {
  const ni = Math.round(fin * SR);
  const no = Math.round(fout * SR);
  return s.map(
    (v, i) => v * Math.min(1, i / ni) * Math.min(1, (s.length - 1 - i) / no),
  );
};
const smooth = (t) => t * t * (3 - 2 * t);

const whoosh = (dur, seed, f0, f1, f2) => {
  const n = Math.round(dur * SR);
  const src = pinkish(n, seed);
  const peak = 0.42;
  const sweep = (t) => {
    const k = t / dur;
    return k < peak
      ? f0 + (f1 - f0) * smooth(k / peak)
      : f1 + (f2 - f1) * smooth((k - peak) / (1 - peak));
  };
  const b = svf(src, sweep, 0.9, "band");
  const e = env(n, (t, k) =>
    k < peak
      ? Math.pow(k / peak, 2)
      : Math.pow(1 - (k - peak) / (1 - peak), 1.6),
  );
  return fadeEdges(mul(b, e));
};

writeWav("whoosh.wav", whoosh(1.3, 11, 300, 1800, 500), 0.55);
writeWav("whoosh-soft.wav", whoosh(1.1, 12, 250, 1100, 380), 0.45);
writeWav("rise.wav", whoosh(3.2, 13, 180, 1400, 900), 0.45);

// частицы: сотни коротких шумовых зёрен высокой полосы, плотность растёт и спадает
{
  const dur = 1.8;
  const n = Math.round(dur * SR);
  const out = new Float32Array(n);
  const r = rng(21);
  const grains = 260;
  for (let g = 0; g < grains; g++) {
    const k = r();
    const t0 = Math.floor((Math.pow(k, 0.8) * 0.85 + 0.02) * n);
    const len = Math.round((0.004 + r() * 0.01) * SR);
    const amp = (0.25 + r() * 0.75) * Math.sin(Math.PI * Math.min(1, k * 1.15));
    for (let j = 0; j < len && t0 + j < n; j++) {
      const w = Math.sin((Math.PI * j) / len);
      out[t0 + j] += (r() * 2 - 1) * w * amp;
    }
  }
  const hp = svf(out, () => 5200, 0.8, "high");
  writeWav("spark.wav", fadeEdges(svf(hp, () => 9000, 0.9, "low")), 0.32);
}

// мягкий глухой акцент
{
  const dur = 0.9;
  const n = Math.round(dur * SR);
  const src = pinkish(n, 31);
  const lp = svf(src, (t) => 900 * Math.exp(-t * 7) + 90, 0.8, "low");
  writeWav(
    "thump.wav",
    fadeEdges(
      mul(
        lp,
        env(n, (t) => Math.exp(-t * 6) * Math.min(1, t / 0.006)),
      ),
    ),
    0.6,
  );
}

// капля: пузырёк — синус с быстро растущей частотой и экспоненциальным затуханием
const bubble = (n, t0, f0, rise, decay, amp, out) => {
  let ph = 0;
  for (let i = 0; i < n - t0; i++) {
    const t = i / SR;
    const f = f0 * (1 + rise * t);
    ph += (2 * Math.PI * f) / SR;
    out[t0 + i] +=
      Math.sin(ph) * Math.exp(-t / decay) * amp * Math.min(1, i / 24);
  }
};
{
  const n = Math.round(0.7 * SR);
  const out = new Float32Array(n);
  bubble(n, 0, 700, 9, 0.045, 1, out);
  bubble(n, Math.round(0.07 * SR), 1150, 6, 0.03, 0.35, out);
  const click = svf(noise(n, 41), () => 3000, 0.9, "band").map(
    (v, i) => v * Math.exp(-i / SR / 0.004) * 0.6,
  );
  writeWav("drop.wav", fadeEdges(add(out, click)), 0.75);
}
// движение воды: несколько тихих пузырьков + мягкий шум воды
{
  const dur = 2.6;
  const n = Math.round(dur * SR);
  const out = new Float32Array(n);
  const r = rng(51);
  for (let b = 0; b < 9; b++) {
    const t0 = Math.round((0.05 + r() * 1.6) * SR);
    bubble(
      n,
      t0,
      420 + r() * 900,
      4 + r() * 6,
      0.02 + r() * 0.03,
      0.15 + r() * 0.25,
      out,
    );
  }
  const water = svf(
    pinkish(n, 52),
    (t) => 700 + 400 * Math.sin(t * 5),
    1.2,
    "band",
  );
  const e = env(n, (t, k) => Math.min(1, t / 0.05) * Math.pow(1 - k, 1.4));
  writeWav("ripple.wav", fadeEdges(add(mul(out, e), mul(water, e), 0.5)), 0.5);
}

// ветер с медленной модуляцией + шелест листвы (отфильтрованные всплески)
const wind = (dur, seed, base, depth, leaves) => {
  const n = Math.round(dur * SR);
  const gust = (t) =>
    0.55 + 0.25 * Math.sin(t * 0.7 + seed) + 0.2 * Math.sin(t * 1.9 + seed * 2);
  const w = svf(
    pinkish(n, seed),
    (t) => base + depth * gust(t),
    0.6,
    "low",
  ).map((v, i) => v * gust(i / SR));
  if (!leaves) return w;
  const r = rng(seed + 7);
  const rustle = new Float32Array(n);
  const src = noise(n, seed + 8);
  for (let b = 0; b < dur * 6; b++) {
    const t0 = Math.floor(r() * n);
    const len = Math.round((0.08 + r() * 0.25) * SR);
    const amp = 0.2 + r() * 0.5;
    for (let j = 0; j < len && t0 + j < n; j++)
      rustle[t0 + j] += src[t0 + j] * Math.sin((Math.PI * j) / len) ** 2 * amp;
  }
  return add(
    w,
    svf(rustle, () => 4200, 0.7, "band"),
    leaves,
  );
};
writeWav("nature.wav", fadeEdges(wind(12, 61, 350, 500, 0.6), 0.3, 0.8), 0.45);
writeWav("night.wav", fadeEdges(wind(12, 71, 250, 300, 0.12), 0.5, 1), 0.4);
// космический «воздух»: очень мягкий широкий шум без тона
{
  const dur = 14;
  const n = Math.round(dur * SR);
  const a = svf(
    pinkish(n, 81),
    (t) => 500 + 250 * Math.sin(t * 0.35),
    0.5,
    "low",
  );
  const b = svf(
    pinkish(n, 82),
    (t) => 2400 + 800 * Math.sin(t * 0.22 + 1),
    1.4,
    "band",
  );
  writeWav("air.wav", fadeEdges(add(a, b, 0.25), 0.8, 1.2), 0.4);
}
