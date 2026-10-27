// Звуковые эффекты BG-043 «Сүйлөгөн сааттар», синтезированные локально
// (JS-синтез + ffmpeg/libmp3lame, без сторонних библиотек, сэмплов и
// платных сервисов). Детерминированно: одинаковые файлы при каждом запуске.
// Все имена — SFX_NAMES из src/campaign50/bg-043/sfxCues.ts:
//   tick, tock   — тонкие щелчки часового механизма;
//   ring         — классический звонок будильника с двумя чашками (~0,9 с),
//                  мягкий (без резких верхов), пик ≤ −3 дБFS;
//   ringShort    — короткое «дзынь» (~0,3 с);
//   gear         — трещотка шестерёнки (~0,4 с);
//   pop          — мультяшный «чпок» появления;
//   step         — мягкий топоток ножек часов;
//   slide        — предмет скользит по деревянной полке (~0,35 с);
//   pen          — ручка пишет по бумаге (~0,7 с);
//   page         — перелистывание страницы (~0,4 с);
//   type         — 5 мягких нажатий клавиш (~0,45 с);
//   click        — щелчок мыши (нажатие и отпускание);
//   whoosh       — мягкий шелест воздуха (~0,5 с);
//   chime        — приятный двухнотный колокольчик;
//   stamp        — мягкий глухой штамп;
//   boing        — маленькая мультяшная пружинка (~0,35 с);
//   car          — далёкий мягкий проезд машины (~2,2 с, плавно);
//   ding         — уведомление.
// Моно 44,1 кГц MP3 → public/audio/campaign50/bg-043/sfx/<имя>.mp3
// Запуск: node scripts/campaign50/bg-043/sfx.mjs
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { BG43_VIDEO } from "../../../src/campaign50/bg-043/script.ts";
import {
  Biquad,
  SR,
  TAU,
  addClick,
  addMode,
  buf,
  dcBlock,
  encodeMp3,
  fade,
  mix,
  mulberry32,
  normalize,
  sweep,
  whiteNoise,
} from "./dsp.mjs";

const OUT = join("public", BG43_VIDEO.audioDir, "sfx");
mkdirSync(OUT, { recursive: true });

// ---------- часовой механизм ----------
// Щелчок анкера: короткий удар (шум) + два-три металлических резонанса.
const clockClick = (seed, base, body) => {
  const o = buf(0.09);
  addClick(o, 0, { freq: base * 1.6, q: 2.5, amp: 0.9, decay: 0.0015, seed, len: 0.02 });
  addMode(o, 0, base, 0.55, 0.009);
  addMode(o, 0, base * 1.47, 0.25, 0.006, 1.1);
  addMode(o, 0, body, 0.35, 0.018, 0.4);
  return fade(dcBlock(o), 0.0003, 0.02);
};
const tick = () => clockClick(11, 3100, 1250);
const tock = () => clockClick(12, 1850, 720);

// ---------- звонок будильника ----------
// Молоточек бьёт попеременно по двум чашкам (~18 ударов в секунду); каждая
// чашка — резонатор с негармоническими обертонами колокола. Верх срезан
// (lowpass 5,5 кГц), чтобы звонок был бодрым, но не режущим.
const bellPartials = [
  [1, 1, 0.42],
  [2.32, 0.42, 0.2],
  [4.25, 0.16, 0.09],
  [6.63, 0.06, 0.05],
];
const alarm = (dur, strikeEnd, seed) => {
  const o = buf(dur);
  const bells = [1180, 1405];
  const rate = 18;
  const r = mulberry32(seed);
  let k = 0;
  for (let t = 0.002; t < strikeEnd; t += 1 / rate, k++) {
    const bell = bells[k % 2];
    const vel = (0.8 + 0.2 * r()) * Math.min(1, 0.55 + t * 9);
    addClick(o, t, { freq: 2600, q: 0.9, amp: 0.18 * vel, decay: 0.0012, seed: seed + k, len: 0.01 });
    for (const [ratio, amp, decay] of bellPartials) addMode(o, t, bell * ratio, amp * vel * 0.32, decay, r() * TAU);
  }
  new Biquad("lowpass", 5500, 0.6).run(o);
  new Biquad("highpass", 260, 0.7).run(o);
  return fade(o, 0.001, 0.08);
};
const ring = () => alarm(0.95, 0.74, 101);
const ringShort = () => alarm(0.34, 0.2, 202);

// ---------- шестерёнка ----------
// Трещотка: зубцы щёлкают с чуть неровным шагом, пол-тона гуляет;
// снизу — тихое «жужжание» трения.
const gear = () => {
  const dur = 0.42;
  const o = buf(dur);
  const r = mulberry32(31);
  let t = 0.004;
  let k = 0;
  while (t < dur - 0.05) {
    const env = Math.sin(Math.PI * Math.min(1, t / (dur - 0.04))) ** 0.6;
    const f = 1900 + 500 * r();
    addClick(o, t, { freq: f * 1.5, q: 2, amp: 0.7 * env, decay: 0.0014, seed: 300 + k, len: 0.012 });
    addMode(o, t, f, 0.32 * env, 0.006, r() * TAU);
    addMode(o, t, 620 + 80 * r(), 0.18 * env, 0.01, r() * TAU);
    t += 0.029 + 0.008 * r();
    k++;
  }
  const grind = whiteNoise(o.length, 33);
  new Biquad("bandpass", 380, 1.4).run(grind);
  for (let i = 0; i < grind.length; i++) {
    const tt = i / SR;
    grind[i] *= 0.25 * Math.sin(Math.PI * Math.min(1, tt / dur)) * (0.6 + 0.4 * Math.sin(TAU * 34 * tt));
  }
  mix(o, grind);
  return fade(dcBlock(o), 0.002, 0.04);
};

// ---------- мультяшные ----------
const pop = () => {
  const o = buf(0.16);
  // «чпок»: быстрый подъём тона 330 → 1050 Гц и короткое затухание
  addMode(o, 0, 0, 1, 0.045, 0, (t) => 330 + 720 * (1 - Math.exp(-t / 0.018)));
  addMode(o, 0, 0, 0.18, 0.03, 0.5, (t) => 2 * (330 + 720 * (1 - Math.exp(-t / 0.018))));
  addClick(o, 0, { freq: 1500, q: 0.8, amp: 0.35, decay: 0.002, seed: 41, len: 0.01 });
  return fade(dcBlock(o), 0.0005, 0.05);
};

const boing = () => {
  const dur = 0.38;
  const o = buf(dur);
  // пружинка: тон плавно растёт 210 → 330 Гц с затухающим «дрожанием» 15 Гц
  const fq = (t) => (210 + 120 * (1 - Math.exp(-t / 0.09))) * (1 + 0.16 * Math.exp(-t / 0.13) * Math.sin(TAU * 15 * t));
  let ph = 0;
  for (let i = 0; i < o.length; i++) {
    const t = i / SR;
    ph += (TAU * fq(t)) / SR;
    const env = Math.min(1, t / 0.004) * Math.exp(-t / 0.13);
    o[i] = env * (Math.sin(ph) + 0.28 * Math.sin(2 * ph + 0.3) + 0.08 * Math.sin(3 * ph));
  }
  addClick(o, 0, { freq: 900, q: 0.8, amp: 0.25, decay: 0.003, seed: 42, len: 0.015 });
  return fade(o, 0.0005, 0.06);
};

// ---------- шаги и предметы ----------
const step = () => {
  const o = buf(0.13);
  // мягкий «топ»: глухой тон с падением высоты + деревянный призвук
  addMode(o, 0, 0, 1, 0.032, 0, (t) => 150 + 140 * Math.exp(-t / 0.012));
  addMode(o, 0, 820, 0.16, 0.012, 0.7);
  addClick(o, 0, { freq: 1300, q: 0.9, amp: 0.22, decay: 0.002, seed: 51, len: 0.012 });
  new Biquad("lowpass", 3500, 0.7).run(o);
  return fade(dcBlock(o), 0.0008, 0.04);
};

const slide = () => {
  const dur = 0.36;
  const o = whiteNoise(buf(dur).length, 61);
  const r = mulberry32(62);
  // трение: полоса шума чуть «съезжает» вниз + неровное прилипание-скольжение
  sweep(o, "bandpass", (t) => 1500 - 700 * (t / dur), 1.1);
  let jit = 1;
  for (let i = 0; i < o.length; i++) {
    const t = i / SR;
    if (i % 220 === 0) jit = 0.65 + 0.35 * r();
    const env = Math.min(1, t / 0.05) * Math.min(1, (dur - t) / 0.12);
    o[i] *= env * jit;
  }
  const body = buf(dur);
  addMode(body, 0.01, 210, 0.12, 0.08);
  mix(o, body);
  new Biquad("lowpass", 4200, 0.7).run(o);
  return fade(dcBlock(o), 0.003, 0.05);
};

const pen = () => {
  const dur = 0.72;
  const n = buf(dur).length;
  const o = whiteNoise(n, 71);
  const hi = new Biquad("bandpass", 3600, 0.9);
  const lo = new Biquad("bandpass", 1500, 1.2);
  const r = mulberry32(72);
  // штрихи ~7 в секунду: каждый — нарастание и спад нажима
  const strokes = [];
  for (let t = 0.0; t < dur - 0.06; ) {
    const len = 0.07 + 0.06 * r();
    strokes.push([t, len, 0.6 + 0.4 * r()]);
    t += len + 0.01 + 0.03 * r();
  }
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let a = 0;
    for (const [s, len, g] of strokes) if (t >= s && t < s + len) a = g * Math.sin((Math.PI * (t - s)) / len) ** 0.8;
    const x = o[i];
    o[i] = a * (hi.tick(x) * 0.8 + lo.tick(x) * 0.35) * (0.85 + 0.15 * Math.sin(TAU * 90 * t));
  }
  return fade(dcBlock(o), 0.003, 0.05);
};

const page = () => {
  const dur = 0.42;
  const n = buf(dur).length;
  const o = whiteNoise(n, 81);
  const r = mulberry32(82);
  // шелест бумаги: полоса уходит вверх, хруст — случайные всплески
  sweep(o, "bandpass", (t) => 900 + 2600 * Math.min(1, t / 0.22), 0.8);
  let crack = 1;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    if (i % 300 === 0) crack = r() < 0.18 ? 1.8 : 0.75 + 0.25 * r();
    const env = Math.min(1, t / 0.03) * Math.exp(-Math.max(0, t - 0.12) / 0.09);
    o[i] *= env * crack;
  }
  // мягкий «хлоп» листа в конце
  const flap = whiteNoise(Math.round(0.08 * SR), 83);
  new Biquad("lowpass", 320, 0.8).run(flap);
  for (let i = 0; i < flap.length; i++) flap[i] *= Math.exp(-i / SR / 0.02) * 2.2;
  mix(o, flap, 0.25);
  return fade(dcBlock(o), 0.003, 0.05);
};

// Одна клавиша: щелчок + пластиковый корпус + «дно».
const addKey = (o, at, seed, g) => {
  addClick(o, at, { freq: 2600, q: 1.2, amp: 0.5 * g, decay: 0.0018, seed, len: 0.012 });
  addMode(o, at, 520 + (seed % 5) * 40, 0.4 * g, 0.012, seed);
  addMode(o, at + 0.012, 300, 0.22 * g, 0.015, seed * 2);
};
const type = () => {
  const o = buf(0.46);
  const at = [0, 0.085, 0.16, 0.255, 0.33];
  const g = [0.9, 0.75, 1, 0.8, 0.85];
  at.forEach((t, k) => addKey(o, t, 91 + k, g[k]));
  new Biquad("lowpass", 6000, 0.7).run(o);
  return fade(dcBlock(o), 0.0005, 0.05);
};

const click = () => {
  const o = buf(0.14);
  // нажатие и тихое отпускание
  addClick(o, 0, { freq: 3200, q: 1.6, amp: 0.8, decay: 0.0012, seed: 101, len: 0.01 });
  addMode(o, 0, 2400, 0.3, 0.005);
  addMode(o, 0, 1100, 0.25, 0.008, 0.5);
  addClick(o, 0.075, { freq: 3600, q: 1.6, amp: 0.3, decay: 0.001, seed: 102, len: 0.01 });
  addMode(o, 0.075, 1300, 0.1, 0.006, 0.2);
  return fade(dcBlock(o), 0.0003, 0.03);
};

const whoosh = () => {
  const dur = 0.52;
  const n = buf(dur).length;
  const o = whiteNoise(n, 111);
  // мягкий воздух: полоса 450 → 1300 → 650 Гц, огибающая «колоколом»
  sweep(o, "bandpass", (t) => 450 + 850 * Math.sin(Math.PI * Math.min(1, t / dur)) ** 1.5 - 200 * (t / dur), 0.9);
  new Biquad("lowpass", 2600, 0.7).run(o);
  for (let i = 0; i < n; i++) o[i] *= Math.sin(Math.PI * (i / n)) ** 2;
  return fade(dcBlock(o), 0.002, 0.03);
};

// ---------- колокольчики ----------
// Мягкий колокольчик: основной тон + тихие обертоны (2,76 и 5,4).
const addBell = (o, at, f, amp, decay) => {
  addMode(o, at, f, amp, decay);
  addMode(o, at, f * 2.0, amp * 0.18, decay * 0.45, 0.6);
  addMode(o, at, f * 2.76, amp * 0.1, decay * 0.3, 1.2);
  addMode(o, at, f * 5.4, amp * 0.03, decay * 0.12, 2.1);
  addClick(o, at, { freq: f * 3, q: 1.5, amp: amp * 0.06, decay: 0.001, seed: Math.round(f), len: 0.006 });
};
const chime = () => {
  const o = buf(1.15);
  addBell(o, 0, 1046.5, 0.8, 0.32); // C6
  addBell(o, 0.13, 1568, 0.7, 0.36); // G6
  new Biquad("lowpass", 7000, 0.7).run(o);
  return fade(o, 0.0005, 0.15);
};
const ding = () => {
  const o = buf(0.75);
  addBell(o, 0, 1318.5, 1, 0.2); // E6
  new Biquad("lowpass", 7000, 0.7).run(o);
  return fade(o, 0.0005, 0.12);
};

const stamp = () => {
  const o = buf(0.3);
  // мягкий «бух»: низкий удар с падением тона + резиновый призвук
  addMode(o, 0, 0, 1, 0.06, 0, (t) => 95 + 120 * Math.exp(-t / 0.015));
  addMode(o, 0, 410, 0.22, 0.02, 0.4);
  const sq = whiteNoise(Math.round(0.06 * SR), 121);
  new Biquad("lowpass", 900, 0.8).run(sq);
  for (let i = 0; i < sq.length; i++) sq[i] *= Math.exp(-i / SR / 0.012) * 0.9;
  mix(o, sq);
  new Biquad("highpass", 45, 0.7).run(o);
  return fade(dcBlock(o), 0.0008, 0.06);
};

// ---------- машина ----------
// Далёкий проезд: гул мотора (гармоники «зажигания» ~48 Гц) с эффектом
// Доплера (+4 % → −4 %), шум шин; всё приглушено (lowpass 1,8 кГц).
const car = () => {
  const dur = 2.3;
  const n = buf(dur).length;
  const o = new Float32Array(n);
  const pass = 1.12; // момент проезда
  const tyres = whiteNoise(n, 131);
  sweep(tyres, "bandpass", (t) => 520 + 280 * Math.exp(-(((t - pass) / 0.45) ** 2)), 0.7);
  let ph = 0;
  const r = mulberry32(132);
  let wob = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const x = (t - pass) / 0.5;
    const doppler = 1 + 0.04 * -Math.tanh(x * 1.6);
    if (i % 441 === 0) wob = 0.97 + 0.06 * r();
    ph += (TAU * 47 * doppler * wob) / SR;
    let eng = 0;
    for (let h = 1; h <= 8; h++) eng += Math.sin(h * ph + h * 0.7) / (h ** 1.1);
    const env = 1 / (1 + x * x * 1.3);
    o[i] = env * (0.55 * eng + 1.6 * tyres[i]);
  }
  new Biquad("lowpass", 1800, 0.6).run(o);
  new Biquad("highpass", 38, 0.7).run(o);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    o[i] *= Math.min(1, t / 0.5) * Math.min(1, (dur - t) / 0.55);
  }
  return fade(dcBlock(o), 0.01, 0.05);
};

// Пики (дБFS) до кодирования: громкость в ролике задаёт sfxCues.ts.
const SFX = {
  tick: [tick, -3],
  tock: [tock, -3],
  ring: [ring, -4],
  ringShort: [ringShort, -4],
  gear: [gear, -3.5],
  pop: [pop, -3],
  step: [step, -3.5],
  slide: [slide, -4],
  pen: [pen, -4],
  page: [page, -4],
  type: [type, -3.5],
  click: [click, -3.5],
  whoosh: [whoosh, -5],
  chime: [chime, -4],
  stamp: [stamp, -3.5],
  boing: [boing, -3.5],
  car: [car, -6],
  ding: [ding, -4],
};

// Имена из sfxCues.ts: каждый эффект шкалы должен иметь файл.
const src = readFileSync("src/campaign50/bg-043/sfxCues.ts", "utf8");
const names = [...(/SFX_NAMES\s*=\s*\[([\s\S]*?)\]/.exec(src)?.[1] ?? "").matchAll(/"([A-Za-z]+)"/g)].map((m) => m[1]);
const missing = names.filter((x) => !SFX[x]);
if (missing.length) throw new Error(`Нет синтеза для эффектов: ${missing.join(", ")}`);

for (const name of names) {
  const [make, peak] = SFX[name];
  const ch = make();
  normalize([ch], peak);
  const path = join(OUT, `${name}.mp3`);
  encodeMp3([ch], path, "128k");
  const info = execFileSync("sh", ["-c", `ffmpeg -hide_banner -nostats -i "${path}" -af volumedetect -f null - 2>&1 | grep max_volume || true`])
    .toString()
    .trim()
    .replace(/.*max_volume:\s*/, "");
  const dur = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]).toString().trim();
  console.log(`✓ ${name}.mp3 — ${Number(dur).toFixed(3)} с, пик ${info}`);
}
