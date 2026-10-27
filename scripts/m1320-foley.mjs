// Звуки BalaGoMeeting1320 (№31) → public/meeting-1320/sfx/*.mp3.
// Только звуки с видимым действием: ключи берут со стола и они звякают,
// дверь машины открывается/закрывается, ремень вытягивают и защёлкивают,
// телефон вибрирует и по экрану касаются, бумаги отодвигают и рисунок
// кладут на стол, дверь квартиры, мягкое уведомление, стул. Плюс тихие
// атмосферы мест (офис, город, школьный двор, комната) — бесшовные петли.
// Шагов и «вжухов» нет совсем.
// Четыре звука — записи Gravity Sound (Wikimedia Commons, CC BY 4.0;
// исходники в scripts/assets/m1320-foley, авторство —
// public/meeting-1320/sfx/CREDITS.md); остальное — детерминированный синтез.
// Запуск: node scripts/m1320-foley.mjs (результат хранится в Git).
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { SAMPLE_RATE as SR, ffmpeg, mulberry32, writeWav } from "./lib/audio.mjs";

const OUT = "public/meeting-1320/sfx";
const SRC = "scripts/assets/m1320-foley";
mkdirSync(OUT, { recursive: true });
const TMP = join(tmpdir(), "m1320-foley");
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


// запись → моно Float32 44,1 кГц
const load = (file) => {
  const raw = ffmpeg(["-i", join(SRC, file), "-ac", "1", "-ar", String(SR), "-f", "f32le", "-"]);
  return new Float32Array(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength));
};
const cut = (x, a, b, fadeIn = 0.004, fadeOut = 0.06) => {
  const y = x.slice(Math.round(a * SR), Math.round(b * SR));
  const fi = Math.round(fadeIn * SR);
  const fo = Math.round(fadeOut * SR);
  for (let i = 0; i < fi && i < y.length; i++) y[i] *= i / fi;
  for (let i = 0; i < fo && i < y.length; i++) y[y.length - 1 - i] *= i / fo;
  return y;
};
// тихий шум записи ниже порога — в ноль (мягкий гейт по огибающей)
const gate = (x, thrDb = -48) => {
  const thr = Math.pow(10, thrDb / 20);
  let e = 0;
  const a = Math.exp(-1 / (0.01 * SR));
  const y = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) {
    e = Math.max(Math.abs(x[i]), a * e);
    const g = Math.min(1, Math.max(0, (e - thr) / thr));
    y[i] = x[i] * g;
  }
  return y;
};

// ---------------------------------------------------------- записи (CC BY 4.0)
// ключи берут со стола (Key item pick up 2)
save("keys-pickup", cut(load("keys-02.mp3"), 0, 0.28, 0.002, 0.05), -10);
// связка ключей звякает в руке (Keys shaking, фрагмент)
save("keys-jingle", gate(cut(load("keys-01.mp3"), 0.3, 1.15, 0.02, 0.2)), -14);
// защёлка ремня (Tight door lock, щелчок)
save("belt-click", gate(biquad(cut(load("click-01.mp3"), 0.26, 0.78, 0.002, 0.12), "hp", 180)), -10);
// дверь машины закрывается: глухой хлопок (Close door 2 через НЧ-фильтр)
save("car-door-close", gate(biquad(biquad(cut(load("door-01.mp3"), 0.04, 0.98, 0.002, 0.2), "lp", 2600), "lp", 3200)), -9);

// ---------------------------------------------------------- синтез
// дверь машины открывается: щелчок замка + короткий выдох уплотнителя
{
  const x = buf(0.5);
  add(x, env(body(noise(0.06, 9101), [[2100, 10, 1], [3900, 14, 0.4], [900, 6, 0.3]]), 0.0006, 0.012), 0, 1);
  const air = biquad(biquad(noise(0.3, 9102), "bp", 900, 0.7), "lp", 2400);
  for (let i = 0; i < air.length; i++) {
    const t = i / SR;
    air[i] *= Math.sin(Math.PI * Math.min(1, t / 0.28)) * 0.35;
  }
  add(x, air, 0.03, 1);
  save("car-door-open", x, -12);
}
// ремень вытягивают: шорох ленты с лёгкой «трещоткой» катушки
{
  const x = buf(0.75);
  const n = biquad(biquad(noise(0.7, 9111), "bp", 2200, 0.9), "hp", 700);
  for (let i = 0; i < n.length; i++) {
    const t = i / SR;
    const swell = Math.sin(Math.PI * Math.min(1, t / 0.66)) * (t < 0.66 ? 1 : 0);
    n[i] *= swell * (0.75 + 0.25 * Math.sign(Math.sin(t * 2 * Math.PI * 38)));
  }
  add(x, n, 0, 0.8);
  save("belt-pull", x, -20);
}
// телефон вибрирует на столе: два коротких жужжания
{
  const x = buf(1.0);
  for (const at of [0, 0.5]) {
    const b = buf(0.34);
    for (let i = 0; i < b.length; i++) {
      const t = i / SR;
      const e = Math.min(1, t / 0.02) * Math.min(1, (0.34 - t) / 0.04);
      b[i] = e * (Math.sin(2 * Math.PI * 172 * t) * 0.6 + Math.sin(2 * Math.PI * 344 * t) * 0.3 + Math.sin(2 * Math.PI * 516 * t) * 0.12);
    }
    add(x, body(b, [[172, 2, 1], [690, 4, 0.5], [1400, 6, 0.2]]), at, 1);
  }
  save("phone-vibrate", x, -16);
}
// касание экрана
{
  const x = buf(0.1);
  add(x, env(biquad(biquad(noise(0.05, 9121), "bp", 2400, 1.4), "lp", 4200), 0.0006, 0.005), 0, 1);
  save("phone-tap", x, -24);
}
// стопку бумаг отодвигают по столу
{
  const x = buf(1.25);
  const n = biquad(biquad(noise(1.2, 9131), "bp", 3200, 0.7), "hp", 1200);
  for (let i = 0; i < n.length; i++) {
    const t = i / SR;
    const e = Math.sin(Math.PI * Math.min(1, t / 1.1)) ** 0.8 * (t < 1.1 ? 1 : 0);
    n[i] *= e * (0.8 + 0.2 * Math.sin(t * 2 * Math.PI * 11));
  }
  add(x, n, 0, 0.8);
  add(x, env(biquad(noise(0.2, 9132), "lp", 600), 0.01, 0.08), 0.02, 0.25);
  save("paper-slide", x, -20);
}
// лист кладут на стол: мягкий шлепок бумаги
{
  const x = buf(0.4);
  add(x, env(biquad(biquad(noise(0.3, 9141), "lp", 1800), "hp", 120), 0.004, 0.05), 0, 1);
  add(x, env(biquad(noise(0.2, 9142), "bp", 4200, 0.8), 0.003, 0.03), 0.004, 0.3);
  save("paper-place", x, -20);
}
// дверь квартиры открывается: щелчок замка и мягкий выдох полотна
{
  const x = buf(0.9);
  add(x, env(body(noise(0.05, 9151), [[1700, 9, 1], [3100, 12, 0.4]]), 0.0006, 0.01), 0, 1);
  add(x, env(body(noise(0.05, 9152), [[1500, 9, 0.7]]), 0.0006, 0.008), 0.09, 0.6);
  const air = biquad(biquad(noise(0.7, 9153), "bp", 500, 0.6), "lp", 1500);
  for (let i = 0; i < air.length; i++) {
    const t = i / SR;
    air[i] *= Math.sin(Math.PI * Math.min(1, t / 0.66)) * 0.45;
  }
  add(x, air, 0.14, 1);
  save("flat-door", x, -14);
}
// мягкое уведомление: две тихие колокольные ноты
{
  const x = buf(1.0);
  for (const [at, f] of [[0, 1318.5], [0.14, 1975.5]]) {
    const b = buf(0.8);
    for (let i = 0; i < b.length; i++) {
      const t = i / SR;
      b[i] = Math.min(1, t / 0.006) * Math.exp(-t / 0.22) * (Math.sin(2 * Math.PI * f * t) + 0.2 * Math.sin(2 * Math.PI * 2 * f * t));
    }
    add(x, b, at, 0.5);
  }
  save("notify", x, -18);
}
// стул: короткий мягкий скрип ножек по полу
{
  const x = buf(0.6);
  const n = biquad(biquad(noise(0.5, 9161), "bp", 640, 2.2), "lp", 1400);
  for (let i = 0; i < n.length; i++) {
    const t = i / SR;
    n[i] *= Math.sin(Math.PI * Math.min(1, t / 0.42)) * (t < 0.42 ? 1 : 0) * (0.7 + 0.3 * Math.sin(t * 2 * Math.PI * 23));
  }
  add(x, n, 0, 1);
  save("chair", x, -22);
}

// ---------------------------------------------------------- атмосферы
// Бесшовная петля: длина L + перехлёст X, конец перетекает в начало.
const loopSave = (name, make, L = 24, X = 3, peakDb = -24) => {
  const x = make(L + X);
  const n = Math.round(L * SR);
  const xn = Math.round(X * SR);
  const y = x.slice(0, n);
  for (let i = 0; i < xn; i++) {
    const a = Math.sin(((i / xn) * Math.PI) / 2) ** 2;
    y[i] = y[i] * a + x[n + i] * (1 - a);
  }
  let p = 0;
  for (const v of y) p = Math.max(p, Math.abs(v));
  const g = Math.pow(10, peakDb / 20) / (p || 1);
  const wav = join(TMP, `${name}.wav`);
  writeWav(wav, [y.map((v) => v * g)]);
  ffmpeg(["-i", wav, "-ar", String(SR), "-ac", "1", "-codec:a", "libmp3lame", "-b:a", "96k", join(OUT, `${name}.mp3`)]);
  console.log(`✓ ${name}.mp3 (петля ${L} с)`);
};
const slowNoise = (sec, seed, f) => biquad(biquad(noise(sec, seed), "lp", f), "lp", f);
// офис: ровный тон комнаты и тихая вентиляция
loopSave("amb-office", (sec) => mix(scale(slowNoise(sec, 9201, 380), 1), scale(biquad(noise(sec, 9202), "bp", 1100, 0.5), 0.08)), 24, 3, -30);
// город: далёкий гул улицы и редкие проезжающие вдали машины
loopSave("amb-city", (sec) => {
  const base = scale(slowNoise(sec, 9211, 260), 1);
  const r = mulberry32(9212);
  const pass = buf(sec);
  for (let k = 0; k < Math.floor(sec / 6); k++) {
    const at = k * 6 + r() * 3;
    const len = 3 + r() * 2;
    const n = biquad(biquad(noise(len, 9213 + k), "bp", 500 + r() * 300, 0.6), "lp", 1400);
    for (let i = 0; i < n.length; i++) n[i] *= Math.sin(Math.PI * (i / n.length)) ** 2;
    add(pass, n, at, 0.5);
  }
  return mix(base, pass);
}, 24, 3, -24);
// школьный двор: лёгкий ветер в листве и редкие птицы
loopSave("amb-yard", (sec) => {
  const wind = biquad(biquad(noise(sec, 9221), "bp", 2200, 0.5), "lp", 5000);
  for (let i = 0; i < wind.length; i++) wind[i] *= 0.4 + 0.25 * Math.sin((i / SR) * 0.7) + 0.15 * Math.sin((i / SR) * 1.9);
  const birds = buf(sec);
  const r = mulberry32(9222);
  for (let k = 0; k < Math.floor(sec / 4); k++) {
    const at = k * 4 + r() * 2.5;
    const n = 2 + Math.floor(r() * 3);
    for (let j = 0; j < n; j++) {
      const b = buf(0.09);
      const f0 = 3000 + r() * 1400;
      for (let i = 0; i < b.length; i++) {
        const t = i / SR;
        b[i] = Math.sin(2 * Math.PI * (f0 + 1800 * t / 0.09) * t) * Math.sin(Math.PI * (t / 0.09));
      }
      add(birds, b, at + j * 0.13, 0.25);
    }
  }
  return mix(scale(wind, 0.6), birds, scale(slowNoise(sec, 9223, 240), 0.5));
}, 24, 3, -24);
// комната: очень тихий тёплый тон
loopSave("amb-room", (sec) => scale(slowNoise(sec, 9231, 300), 1), 24, 3, -34);

writeFileSync(
  join(OUT, "CREDITS.md"),
  `# Звуки №31 «13:20дагы жолугушуу»

Синтез (scripts/m1320-foley.mjs, свободно): car-door-open, belt-pull,
phone-vibrate, phone-tap, paper-slide, paper-place, flat-door, notify, chair,
amb-office, amb-city, amb-yard, amb-room.

Записи Gravity Sound, Wikimedia Commons, лицензия CC BY 4.0
(https://creativecommons.org/licenses/by/4.0). Изменения: обрезка,
фильтрация, нормализация.

| Файл | Исходник |
| --- | --- |
| keys-pickup.mp3 | «Key item pick up 2» by Gravity Sound — https://commons.wikimedia.org/wiki/File:Key_item_pick_up_2_(Gravity_Sound).wav |
| keys-jingle.mp3 | «Keys shaking» by Gravity Sound — https://commons.wikimedia.org/wiki/File:Keys_shaking_(Gravity_Sound).wav |
| belt-click.mp3 | «Tight door lock» by Gravity Sound — https://commons.wikimedia.org/wiki/File:Tight_door_lock_(Gravity_Sound).wav |
| car-door-close.mp3 | «Close door 2» by Gravity Sound — https://commons.wikimedia.org/wiki/File:Close_door_2_(Gravity_Sound).wav |
`,
);
console.log("✓ CREDITS.md");
