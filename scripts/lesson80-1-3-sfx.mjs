// Тихие звуки ролика 80-1-3 «А если я не вижу?» (детерминированный синтез,
// без внешних файлов; 48 кГц, моно, 16 бит):
//   window-air.wav — тихий воздух у открытого окна (бесшовная петля 12 с);
//   curtain.wav — редкие мягкие колыхания шторы (петля 8 с);
//   rotor.wav — бумажный шелест лепестков вертушки (петля 4 с, без тона);
//   inhale.wav — короткий мягкий вдох ребёнка;
//   exhale.wav — направленный выдох «фу-у» (не порыв ветра);
//   stand-pick.wav, stand-place.wav — деревянная подставка со стола / на стол;
//   stick-in.wav — палочка входит в отверстие подставки;
//   cloth-1.wav, cloth-2.wav — шорох одежды (опуститься на колени / встать);
//   step-1…4.wav — едва слышные шаги в носках по ковру.
// Фон комнаты — тот же roomtone.wav первого фильма (public/audio/lesson01/sfx).
// Пики нормированы заранее: звуки микшируются тихо, в центре — речь.
// Запуск: node scripts/lesson80-1-3-sfx.mjs → public/audio/lesson80-1-3/sfx/
/* global console */
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { mulberry32, writeWav } from "./lib/audio.mjs";

const SR = 48000;
const OUT = "public/audio/lesson80-1-3/sfx";
mkdirSync(OUT, { recursive: true });
const db = (x) => Math.pow(10, x / 20);
const TAU = 2 * Math.PI;

const peakOf = (a) => {
  let pk = 0;
  for (const v of a) pk = Math.max(pk, Math.abs(v));
  return pk;
};
const norm = (a, level) => {
  const g = db(level) / (peakOf(a) || 1);
  for (let i = 0; i < a.length; i++) a[i] *= g;
  return a;
};
const white = (seed, n) => {
  const rnd = mulberry32(seed);
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) a[i] = rnd() * 2 - 1;
  return a;
};
// розовый шум (фильтр П. Келлета)
const pink = (seed, n) => {
  const w = white(seed, n);
  const a = new Float32Array(n);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < n; i++) {
    const x = w[i];
    b0 = 0.99886 * b0 + x * 0.0555179;
    b1 = 0.99332 * b1 + x * 0.0750759;
    b2 = 0.969 * b2 + x * 0.153852;
    b3 = 0.8665 * b3 + x * 0.3104856;
    b4 = 0.55 * b4 + x * 0.5329522;
    b5 = -0.7616 * b5 - x * 0.016898;
    a[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + x * 0.5362) * 0.11;
    b6 = x * 0.115926;
  }
  return a;
};

// биквадратные фильтры (RBJ): lp / hp — Баттерворт (Q = 0,707, без резонанса), bp — 0 дБ в центре
const biquad = (x, type, f0, q = Math.SQRT1_2) => {
  const w = (TAU * f0) / SR;
  const c = Math.cos(w);
  const al = Math.sin(w) / (2 * q);
  const [b0, b1, b2] = type === "lp" ? [(1 - c) / 2, 1 - c, (1 - c) / 2] : type === "hp" ? [(1 + c) / 2, -(1 + c), (1 + c) / 2] : [al, 0, -al];
  const a0 = 1 + al, a1 = -2 * c, a2 = 1 - al;
  const y = new Float32Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const v = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v;
  }
  return y;
};
const lp = (x, f, k = 1) => { for (let i = 0; i < k; i++) x = biquad(x, "lp", f); return x; };
const hp = (x, f, k = 1) => { for (let i = 0; i < k; i++) x = biquad(x, "hp", f); return x; };
const bp = (x, f, q) => biquad(x, "bp", f, q);
// полосовой SVF с плавающей частотой (форманты дыхания); 0 дБ в центре
const sweepBP = (x, fAt, q) => {
  const y = new Float32Array(x.length);
  const k = 1 / q;
  let ic1 = 0, ic2 = 0;
  for (let i = 0; i < x.length; i++) {
    const g = Math.tan((Math.PI * fAt(i / SR)) / SR);
    const a1 = 1 / (1 + g * (g + k)), a2 = g * a1, a3 = g * a2;
    const v3 = x[i] - ic2;
    const v1 = a1 * ic1 + a2 * v3;
    const v2 = ic2 + a2 * ic1 + a3 * v3;
    ic1 = 2 * v1 - ic1;
    ic2 = 2 * v2 - ic2;
    y[i] = v1 * k;
  }
  return y;
};
// медленная случайная огибающая ~1: сглаженный шум (частоты ниже fc)
const wobble = (seed, n, fc) => {
  const s = lp(white(seed, n + SR), fc, 2).slice(SR);
  let r = 0;
  for (const v of s) r += v * v;
  r = Math.sqrt(r / n) || 1;
  for (let i = 0; i < n; i++) s[i] /= r;
  return s;
};
const mix = (n, parts) => {
  const a = new Float32Array(n);
  for (const [x, g] of parts) for (let i = 0; i < n; i++) a[i] += x[i] * g;
  return a;
};
// бесшовная петля: из len + fade отсчётов хвост равномощно перетекает в начало
const loop = (a, n, fade) => {
  const y = a.slice(0, n);
  for (let i = 0; i < fade; i++) {
    const k = ((i + 0.5) / fade) * (Math.PI / 2);
    y[i] = a[i] * Math.sin(k) + a[n + i] * Math.cos(k);
  }
  return y;
};
// короткие края у разовых звуков (без щелчков)
const edges = (a, fin = 0.002, fout = 0.02) => {
  const ni = Math.round(fin * SR), no = Math.round(fout * SR);
  for (let i = 0; i < ni; i++) a[i] *= i / ni;
  for (let i = 0; i < no; i++) a[a.length - 1 - i] *= i / no;
  return a;
};
// плавная огибающая: подъём до пика u0, спад до конца (доли длины)
const swell = (u, u0, p = 1.6) => (u < u0 ? Math.sin((Math.PI / 2) * (u / u0)) ** p : Math.cos((Math.PI / 2) * ((u - u0) / (1 - u0))) ** p);
const save = (name, a, level) => writeWav(join(OUT, name), [norm(a, level)], SR);

// --- воздух у открытого окна: широкий мягкий шум 120 Гц…2,7 кГц, дыхание 0,17 / 0,25 Гц ---
{
  const len = 12;
  const n = SR * len;
  const fade = SR;
  const warm = SR;
  const N = n + fade + warm;
  const body = lp(hp(pink(301, N), 120, 2), 1100).slice(warm);
  const air = lp(hp(pink(302, N), 650, 2), 2700, 2).slice(warm);
  const lo = loop(body, n, fade);
  const hi = loop(air, n, fade);
  // огибающие с периодом, кратным длине петли (2/12 и 3/12 Гц), — шов без скачка уровня
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const sw = 2.2 * Math.sin((TAU * 2 * t) / len + 0.7) + 0.8 * Math.sin((TAU * 3 * t) / len + 2.1);
    const tilt = 1.2 * Math.sin((TAU * 3 * t) / len + 4.0);
    a[i] = (lo[i] * db(-tilt * 0.5) + hi[i] * 0.85 * db(tilt)) * db(sw);
  }
  save("window-air.wav", a, -27);
}

// --- штора: два мягких колыхания ткани за 8 с (раскладка по кругу — шов бесшовный) ---
{
  const len = 8;
  const n = SR * len;
  const a = new Float32Array(n);
  const events = [
    { t: 0.6, d: 1.4, g: 1, f: 1100, seed: 401 },
    { t: 4.9, d: 1.1, g: 0.6, f: 1350, seed: 402 },
  ];
  for (const e of events) {
    const m = Math.round(e.d * SR);
    const w = white(e.seed, m);
    const tex = wobble(e.seed + 50, m, 45); // зернистость ткани
    const band = sweepBP(w, (t) => e.f * (0.8 + 0.45 * Math.sin((Math.PI * t) / e.d)), 0.7);
    const low = lp(w, 260, 2);
    for (let i = 0; i < m; i++) {
      const u = i / m;
      const env = swell(u, 0.42, 1.8) * e.g;
      const v = (band[i] * (0.6 + 0.4 * Math.abs(tex[i])) + low[i] * 0.9) * env;
      a[(Math.round(e.t * SR) + i) % n] += v;
    }
  }
  save("curtain.wav", lp(a, 4200), -30);
}

// --- вертушка: лёгкие нерегулярные бумажные «тики» 1–5 кГц + шелест, петля 4 с ---
{
  const len = 4;
  const n = SR * len;
  const rnd = mulberry32(501);
  const ticks = new Float32Array(n);
  // интервалы с сильным разбросом — нет периодичности и, значит, нет «моторного» тона
  let t = 0.013;
  while (t < len - 0.03) {
    const m = Math.round(SR * (0.004 + rnd() * 0.006));
    const f = 1200 + rnd() * 3600;
    const q = 1.1 + rnd() * 1.6;
    const tau = (0.0008 + rnd() * 0.0018) * SR;
    const amp = (0.15 + 0.85 * rnd() ** 2) * db(1.5 * Math.sin((TAU * 2 * t) / len + 0.4) + Math.sin((TAU * 3 * t) / len + 1.9));
    const burst = white(Math.floor(rnd() * 1e9), m);
    for (let i = 0; i < m; i++) burst[i] *= Math.min(1, i / (SR * 0.0003)) * Math.exp(-i / tau);
    const y = bp(burst, f, q);
    const i0 = Math.round(t * SR);
    for (let i = 0; i < m; i++) ticks[(i0 + i) % n] += y[i] * amp;
    t += (1 / 22) * (0.4 + rnd() * 1.2);
  }
  const fade = Math.round(SR * 0.5);
  const warm = SR;
  const N = n + fade + warm;
  const rustle = lp(hp(white(502, N), 1000, 2), 5000, 2);
  const flut = wobble(503, N, 28);
  for (let i = 0; i < N; i++) rustle[i] *= Math.min(2.5, Math.abs(flut[i]));
  const bed = loop(rustle.slice(warm), n, fade);
  const a = mix(n, [[lp(ticks, 5500), 1], [bed, 0.1]]);
  save("rotor.wav", a, -30);
}

// --- вдох: короткий мягкий вдох ребёнка (шумовые форманты, быстрый подъём, мягкий обрыв) ---
{
  const d = 0.55;
  const m = Math.round(SR * d);
  const w = white(601, m + SR).slice(SR);
  const f1 = sweepBP(w, (t) => 1350 + 350 * (t / d), 2.6);
  const f2 = sweepBP(w, (t) => 2900 + 300 * (t / d), 3.5);
  const f3 = bp(w, 4700, 2.5);
  const br = lp(hp(w, 600), 6500);
  const a = new Float32Array(m);
  for (let i = 0; i < m; i++) {
    const u = i / m;
    a[i] = (f1[i] + f2[i] * 0.6 + f3[i] * 0.3 + br[i] * 0.12) * swell(u, 0.68, 1.5);
  }
  save("inhale.wav", edges(lp(a, 5500), 0.004, 0.01), -26);
}

// --- выдох «фу-у»: мягкое «ф», затем направленный воздух с формантой ~1,1–1,8 кГц и естественным хвостом ---
{
  const d = 1.3;
  const m = Math.round(SR * d);
  const w = white(701, m + SR).slice(SR);
  const turb = wobble(702, m, 11); // неровность струи
  // форманта сползает вниз: губы округляются к «у»
  const fA = sweepBP(w, (t) => 1150 + 550 * Math.exp(-t / 0.12), 3);
  const fB = sweepBP(w, (t) => 1800 + 300 * Math.exp(-t / 0.15), 4);
  const fric = lp(hp(w, 1800, 2), 5500, 2); // «ф»
  const body = lp(hp(w, 250), 800);
  const a = new Float32Array(m);
  for (let i = 0; i < m; i++) {
    const t = i / SR;
    const att = t < 0.11 ? Math.sin((Math.PI / 2) * (t / 0.11)) ** 2 : 1;
    const puff = 1 + 0.25 * Math.exp(-(((t - 0.22) / 0.09) ** 2)); // главный толчок воздуха
    const hold = t < 0.8 ? 1 - 0.3 * (t / 0.8) : 0.7 * Math.exp(-(t - 0.8) / 0.17);
    const env = att * puff * hold * (1 + 0.1 * turb[i]);
    const f = Math.exp(-t / 0.09); // «ф» — только в начале
    a[i] = (fA[i] + fB[i] * 0.45 + body[i] * 0.3 + fric[i] * (0.06 + 0.5 * f)) * env;
  }
  save("exhale.wav", edges(a, 0.003, 0.08), -21);
}

// --- дерево: модальный «тук» маленькой подставки ---
const knock = (seed, base, len, { modes = [1, 2.31, 3.9, 5.6], decays = [0.05, 0.032, 0.022, 0.014], gains = [1, 0.5, 0.26, 0.14], noise = 0.5, body = 0 } = {}) => {
  const rnd = mulberry32(seed);
  const n = Math.round(SR * len);
  const a = new Float32Array(n);
  const ms = modes.map((k, i) => ({ f: base * k * (0.97 + rnd() * 0.06), d: decays[i], g: gains[i], p: rnd() * TAU }));
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let v = 0;
    for (const md of ms) v += Math.sin(TAU * md.f * t + md.p) * Math.exp(-t / md.d) * md.g * Math.min(1, t / 0.0006);
    if (body) v += Math.sin(TAU * 185 * t) * Math.exp(-t / 0.045) * body + Math.sin(TAU * 247 * t) * Math.exp(-t / 0.03) * body * 0.6; // стол
    if (t < 0.004) v += (rnd() * 2 - 1) * noise * (1 - t / 0.004);
    a[i] = v;
  }
  return a;
};
const at = (n, parts) => {
  const a = new Float32Array(n);
  for (const [x, t0, g] of parts) {
    const i0 = Math.round(t0 * SR);
    for (let i = 0; i < x.length && i0 + i < n; i++) a[i0 + i] += x[i] * g;
  }
  return a;
};
{
  // со стола: лёгкий отрыв — тихое трение и короткий высокий «тик»
  const n = Math.round(SR * 0.3);
  const scrape = white(801, Math.round(SR * 0.05));
  for (let i = 0; i < scrape.length; i++) scrape[i] *= Math.sin((Math.PI * i) / scrape.length) ** 2;
  const a = at(n, [[bp(scrape, 2200, 1.2), 0, 0.25], [knock(802, 980, 0.2, { noise: 0.25 }), 0.035, 1]]);
  save("stand-pick.wav", edges(lp(a, 5000), 0.002, 0.03), -29);
  // на стол: основной стук с отзвуком столешницы и крошечное «доседание» через 38 мс
  const m = Math.round(SR * 0.45);
  const b = at(m, [[knock(811, 640, 0.4, { body: 0.55 }), 0.004, 1], [knock(812, 700, 0.2, { noise: 0.2 }), 0.042, 0.18]]);
  save("stand-place.wav", edges(lp(b, 4000), 0.002, 0.04), -21);
}

// --- палочка входит в отверстие: короткое трение и крошечный деревянный щелчок ---
{
  const n = Math.round(SR * 0.28);
  const fr = white(901, Math.round(SR * 0.075));
  for (let i = 0; i < fr.length; i++) fr[i] *= (i / fr.length) ** 1.5;
  const click = knock(902, 2300, 0.12, { modes: [1, 1.57, 2.2], decays: [0.008, 0.005, 0.003], gains: [1, 0.6, 0.3], noise: 0.4 });
  const thock = knock(903, 720, 0.12, { modes: [1, 2.4], decays: [0.016, 0.008], gains: [1, 0.3], noise: 0 });
  const a = at(n, [[lp(bp(fr, 2600, 1.3), 6000), 0, 0.18], [click, 0.075, 0.8], [thock, 0.075, 0.55]]);
  save("stick-in.wav", edges(a, 0.002, 0.03), -25);
}

// --- одежда: зернистый шорох ткани; на коленях — мягкое касание ковра в конце ---
const rustle = (seed, d, envAt) => {
  const m = Math.round(SR * d);
  const rnd = mulberry32(seed);
  const w = white(seed + 1, m + SR);
  const band = lp(hp(w, 320, 2), 3600).slice(SR);
  const grain = wobble(seed + 2, m, 60);
  const a = new Float32Array(m);
  for (let i = 0; i < m; i++) a[i] = band[i] * (0.35 + 0.65 * Math.min(2.2, grain[i] * grain[i])) * envAt(i / SR);
  // редкие «хрусты» волокон
  for (let k = 0; k < 9; k++) {
    const t0 = rnd() * (d - 0.02);
    const c = bp(white(seed + 10 + k, Math.round(SR * 0.004)), 2200 + rnd() * 1800, 1.5);
    const i0 = Math.round(t0 * SR);
    for (let i = 0; i < c.length; i++) a[i0 + i] += c[i] * (0.4 + rnd() * 0.5) * envAt(t0) * Math.exp(-i / (SR * 0.0012));
  }
  return a;
};
// глухой мягкий удар о ковёр (стопа, колено): низкий шумовой «тук» без звона —
// шум 45 Гц…~3·f0 и лишь короткое (≈ 0,4·tau) низкое «тело» на f0
// (затухающий синус с глиссандо звучал как бочка ударной установки)
const thump = (seed, f0, d, tau) => {
  const n = Math.round(SR * d);
  const nz = lp(hp(white(seed, n), 45), f0 * 3.2, 2);
  const a = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    ph += (TAU * f0) / SR;
    a[i] = (nz[i] * 9 * Math.exp(-t / tau) + Math.sin(ph) * 0.45 * Math.exp(-t / (tau * 0.4))) * Math.min(1, t / 0.004);
  }
  return a;
};
{
  const n = Math.round(SR * 0.85);
  const r1 = rustle(1001, 0.85, (t) => swell(t / 0.85, 0.4, 1.4));
  const knee = thump(1011, 95, 0.25, 0.05);
  save("cloth-1.wav", edges(hp(at(n, [[r1, 0, 1], [knee, 0.52, 0.5]]), 45), 0.003, 0.05), -28);
  const r2 = rustle(1021, 0.8, (t) => 0.75 * swell(Math.min(1, t / 0.5), 0.45, 1.4) + 0.55 * swell(Math.max(0, (t - 0.3) / 0.5), 0.35, 1.4));
  save("cloth-2.wav", edges(hp(r2, 45), 0.003, 0.05), -28);
}

// --- шаги в носках по ковру: приглушённый «пятка — носок», каждый немного другой ---
[
  { seed: 1101, f: 82, tau: 0.045, toe: 0.11, tg: 0.45, brush: 0.05 },
  { seed: 1102, f: 96, tau: 0.038, toe: 0.095, tg: 0.35, brush: 0.035 },
  { seed: 1103, f: 74, tau: 0.052, toe: 0.125, tg: 0.5, brush: 0.045 },
  { seed: 1104, f: 104, tau: 0.035, toe: 0.1, tg: 0.3, brush: 0.03 },
].forEach((s, k) => {
  const n = Math.round(SR * 0.42);
  const heel = thump(s.seed, s.f, 0.3, s.tau);
  const toe = thump(s.seed + 7, s.f * 1.25, 0.2, s.tau * 0.7);
  const fib = white(s.seed + 9, Math.round(SR * 0.06));
  for (let i = 0; i < fib.length; i++) fib[i] *= Math.sin((Math.PI * i) / fib.length) ** 2;
  // ворс ковра — едва заметный верх, чтобы шаг читался и на маленьких динамиках
  const a = at(n, [[heel, 0.004, 1], [toe, s.toe, s.tg], [lp(bp(fib, 1800, 0.8), 3500), 0.01, s.brush]]);
  save(`step-${k + 1}.wav`, edges(lp(hp(a, 40), 1800), 0.002, 0.04), -30);
});

console.log("Звуки ролика 80-1-3 готовы:", OUT);
