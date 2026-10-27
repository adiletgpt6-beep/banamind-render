// Тихие бытовые звуки ролика 80-1-4 «Один Создатель» (детерминированный синтез,
// без внешних файлов; моно 48 кГц, 16 бит):
//   pour.wav            — детская лейка поливает землю в горшке (тонкая струйка
//                         отдельными каплями в мягкую землю, не «водопад»);
//                         длина = 0,22 с тишины + длительность струи + 0,35 с;
//   drip-1.wav, drip-2.wav — одна капля с носика на влажную землю (размер 1 и 0,7),
//                         касание ровно в 0,020 с;
//   drips.wav           — обе капли в одном файле (0,02 и 0,30 с), для совместимости;
//   can-lift.wav        — лейку поднимают со стола (шорох + лёгкий плеск воды);
//   can-place.wav       — лейку ставят на стол (мягкий глухой «тук» + плеск);
//   tray-slide.wav      — керамический поддон сдвигают по столу (движение 1,0 с);
//   tray-slide-back.wav — тот же поддон возвращают на место (движение 1,2 с);
//   card-pick-1…3.wav   — карточку берут из стопки (три разных дубля);
//   card-place-1…3.wav  — карточку ставят в деревянную подставку с пазом (три дубля);
//   card-out-1…3.wav    — карточку вынимают вверх из деревянного паза (три дубля);
//   card-on-stack-1…3.wav — карточку кладут на маленькую стопку, мягкое «тп» (три дубля);
//   card-out.wav, card-on-stack.wav — то же, что дубль 1 (короткие имена);
//   card-pick.wav, card-place.wav — прежние одиночные звуки (для совместимости);
//   cards-stack.wav     — стопку из четырёх карточек выравнивают одним стуком о стол;
//   cloth-1.wav         — шорох одежды: ребёнок встаёт с ковра;
//   cloth-2.wav         — шорох одежды: ребёнок садится / встаёт на колени;
//   soil-touch.wav      — палец касается сухой земли;
//   meta.json           — длительность каждого файла и время главного касания
//                         в нём (impact, с), чтобы ставить удар точно в кадр.
// Модели: удар — затухающие моды, смягчённые длительностью касания, плюс шум
// контакта (без белого шума выше 10 кГц: шероховатость касания сглажена,
// шум контакта под срезом); трение — поток микроударов (stick-slip), плотность
// которого следует за скоростью; вода — отдельные мягкие шлепки капель, тихий
// шум струи и редкие приглушённые пузырьки; ткань и земля — гранулярный
// шорох. Всё звучит в маленькой комнате (короткая разреженная реверберация).
// Пики −20…−27 дБFS.
// Комната и птицы — общие файлы первого фильма (public/audio/lesson01/sfx).
//
// Где в файле главное событие (для привязки к кадру; t — время в файле;
// точные значения — в meta.json, поле impact):
//   pour         вода касается земли с 0,22 с (STREAM.flight = 0,25 с после
//                начала струи), с 0,22 + FLOW − 0,35 струя истончается,
//                кончается в 0,22 + FLOW + 0,05 с. Ставить с D.sfx.pour.start,
//                длительность Sequence = длине файла.
//   drip-1/2     капля касается земли в 0,020 с → ставить в (приземление − 0,02).
//   drips        капли в 0,02 и 0,30 с.
//   can-place    донце ложится на стол в 0,030 с (край касается в 0,020).
//   can-lift     донце отрывается («тик») в 0,085 с.
//   tray-slide*  движение начинается в 0 с (ставить в potSlide.t0 / potBack.t0).
//   card-pick*   шорох с 0,012 с, кромка соскакивает со стопки в impact (≈0,07–0,09).
//   card-place*  кромка касается дна паза в 0,060 с (ставить в seat − 0,06).
//   card-out*    шорох в пазу с 0,012 с, кромка выходит из паза в impact (≈0,13–0,17).
//   card-on-stack* карточка ложится на стопку в 0,020 с.
//   cards-stack  стук стопки о стол в 0,14 с.
//
// Запуск: node scripts/lesson80-1-4-sfx.mjs → public/audio/lesson80-1-4/sfx/
//   POUR_FLOW=<с> — длительность струи на экране (D.sfx.pour.stop − D.sfx.pour.start),
//   по умолчанию 4,646 с; SFX_OUT=<папка> — писать в другую папку (для проверок).
/* global console, process */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { mulberry32, writeWav } from "./lib/audio.mjs";

const SR = 48000;
const OUT = process.env.SFX_OUT || "public/audio/lesson80-1-4/sfx";
const FLOW = Number(process.env.POUR_FLOW ?? 4.646);
if (!Number.isFinite(FLOW) || FLOW < 0.8 || FLOW > 20) throw new Error(`POUR_FLOW: ожидается 0,8…20 с, получено ${process.env.POUR_FLOW}`);
mkdirSync(OUT, { recursive: true });
const db = (x) => Math.pow(10, x / 20);
const S = (sec) => Math.round(sec * SR);
const smooth = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
const logRand = (rnd, lo, hi) => Math.exp(Math.log(lo) + rnd() * (Math.log(hi) - Math.log(lo)));
// нормальное распределение (Бокс — Мюллер)
const gauss = (rnd) => Math.sqrt(-2 * Math.log(1 - rnd())) * Math.cos(2 * Math.PI * rnd());

// ---------- фильтры и утилиты ----------
// биквад (RBJ): lp / hp / bp (пик 0 дБ)
const biquad = (x, type, f0, q) => {
  const w = (2 * Math.PI * f0) / SR;
  const c = Math.cos(w);
  const al = Math.sin(w) / (2 * q);
  let b0, b1, b2;
  if (type === "lp") [b0, b1, b2] = [(1 - c) / 2, 1 - c, (1 - c) / 2];
  else if (type === "hp") [b0, b1, b2] = [(1 + c) / 2, -(1 + c), (1 + c) / 2];
  else [b0, b1, b2] = [al, 0, -al];
  const a0 = 1 + al, a1 = -2 * c, a2 = 1 - al;
  const y = new Float32Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const v = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v;
  }
  return y;
};
const bandpass = (x, f0, q) => biquad(x, "bp", f0, q);
const lowpass = (x, f0, q = 0.707) => biquad(x, "lp", f0, q);
const highpass = (x, f0, q = 0.707) => biquad(x, "hp", f0, q);
const add = (dst, src, gain = 1, at = 0) => {
  for (let i = 0; i < src.length && at + i < dst.length; i++) if (at + i >= 0) dst[at + i] += src[i] * gain;
  return dst;
};
const scale = (a, g) => {
  for (let i = 0; i < a.length; i++) a[i] *= g;
  return a;
};
const peakOf = (a) => {
  let pk = 0;
  for (const v of a) pk = Math.max(pk, Math.abs(v));
  return pk || 1;
};
const rmsOf = (a) => {
  let s = 0;
  for (const v of a) s += v * v;
  return Math.sqrt(s / a.length) || 1;
};
const noise = (rnd, n) => {
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) a[i] = rnd() * 2 - 1;
  return a;
};
// медленный случайный сигнал около 0, примерно ±1
const wobble = (rnd, n, hz) => {
  const a = lowpass(lowpass(noise(rnd, n), hz), hz);
  return scale(a, 1 / peakOf(a));
};
// огибающая «колокол» на отрезке [t0, t0+d] (синус в степени p)
const bell = (n, t0, d, p = 2) => {
  const e = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const u = (i / SR - t0) / d;
    if (u > 0 && u < 1) e[i] = Math.pow(Math.sin(Math.PI * u), p);
  }
  return e;
};
// скорость предмета, который двигают с плавным разгоном и торможением
// (кубическая easeInOut из rig/geom за dur секунд, начало в t0), макс. 1
const easeVel = (n, t0, dur) => {
  const v = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i / SR - t0) / dur;
    if (x > 0 && x < 1) v[i] = x < 0.5 ? 4 * x * x : 4 * (1 - x) * (1 - x);
  }
  return v;
};

// ---------- источники ----------
// Удар. Шероховатый импульс силы (полусинус длительностью tc) возбуждает
// моды {f, tau, g}; каждая мода — пучок из трёх слегка расстроенных
// резонаторов (как у настоящего дерева/картона), поэтому звук не «звенит»
// чистым тоном. Длительность касания смягчает верх. Шероховатость касания —
// сглаженный шум (до ~2,5 кГц), а не белый: иначе удар «щёлкает» выше 10 кГц.
// contact — шум самого касания {g, f, q}; он тоже под срезом min(8 кГц, 2,5·f).
const knock = (rnd, len, tc, modes, contact = { g: 0.3, f: 2500, q: 0.8 }, hp = 110, spread = 0.08) => {
  const n = S(len);
  const m = Math.max(3, S(tc));
  const rough = lowpass(lowpass(noise(rnd, m + 48), 2500), 2500).subarray(48);
  const rpk = peakOf(rough);
  const ex = new Float32Array(n);
  let area = 0;
  for (let i = 0; i < m; i++) {
    ex[i] = Math.sin((Math.PI * (i + 0.5)) / m) * (0.65 + (0.35 * rough[i]) / rpk);
    area += ex[i];
  }
  const a = new Float32Array(n);
  for (const md of modes)
    for (let k = 0; k < 3; k++) {
      const f = md.f * (1 + (rnd() - 0.5) * spread * (k ? 1 : 0.3));
      const tau = md.tau * (0.7 + 0.6 * rnd());
      const g = md.g * (k ? 0.25 + 0.35 * rnd() : 1);
      const w = (2 * Math.PI * f) / SR;
      const r = Math.exp(-1 / (tau * SR));
      const k1 = 2 * r * Math.cos(w), k2 = -r * r;
      const gin = (Math.sin(w) / area) * g;
      let y1 = 0, y2 = 0;
      for (let i = 0; i < n; i++) {
        const v = ex[i] * gin + k1 * y1 + k2 * y2;
        y2 = y1; y1 = v; a[i] += v;
      }
    }
  if (contact && contact.g > 0) {
    const cn = Math.max(16, S(tc * 2.5));
    const c = lowpass(bandpass(noise(rnd, cn + 64), contact.f, contact.q), Math.min(8000, 2.5 * contact.f)).subarray(64);
    const cpk = peakOf(c);
    for (let i = 0; i < cn; i++) a[i] += (c[i] / cpk) * contact.g * Math.sin((Math.PI * i) / cn) ** 2;
  }
  return highpass(a, hp);
};
// пузырёк (Миннарт): частота растёт по мере всплытия; затухание по ван ден Доулу
// (damp > 1 — пузырёк у стенки/дна гаснет быстрее); 7 постоянных времени,
// последние 30 % — косинусный спад до нуля (без ступеньки в конце)
const bubble = (f0, amp, rise = 0.1, damp = 1) => {
  const d = (0.043 * f0 + 0.0014 * Math.pow(f0, 1.5)) * damp;
  const sigma = rise * d;
  const n = S(7 / d);
  const nt = Math.max(1, Math.floor(n * 0.3));
  const a = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    ph += (2 * Math.PI * f0 * (1 + sigma * t)) / SR;
    const end = i > n - nt ? 0.5 + 0.5 * Math.cos((Math.PI * (i - (n - nt))) / nt) : 1;
    a[i] = Math.sin(ph) * Math.exp(-d * t) * amp * (1 - Math.exp(-t / 0.0003)) * end;
  }
  return a;
};
// шумовое зерно: окно Ханна, полосовой фильтр, пик 1
const grain = (rnd, len, fc, q) => {
  const n = Math.max(12, S(len));
  const g = bandpass(noise(rnd, n + 96), fc, q).subarray(96);
  for (let i = 0; i < n; i++) g[i] *= Math.sin((Math.PI * i) / n) ** 2;
  return scale(g, 1 / peakOf(g));
};
// Трение (stick-slip): микроудары с частотой rate·v(t) и силой ~v,
// окрашенные резонансами поверхностей {f, q, g}, + шипение (hiss·v).
// chatter — неровность («зацепы»): скорость дрожит с частотой ~chatterHz.
const friction = (rnd, vel, o) => {
  const { rate, bodies, hiss = 0.3, hissF = 2500, hissQ = 0.7, chatter = 0, chatterHz = 50 } = o;
  const n = vel.length;
  const ch = chatter > 0 ? wobble(rnd, n, chatterHz) : null;
  const v = new Float32Array(n);
  for (let i = 0; i < n; i++) v[i] = vel[i] * (ch ? Math.max(0, 1 - chatter + chatter * 2.2 * Math.abs(ch[i])) : 1);
  const imp = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    if (v[i] > 0 && rnd() < (rate * v[i]) / SR) imp[i] += (0.3 + Math.pow(rnd(), 2) * 1.4) * (rnd() < 0.5 ? -1 : 1) * v[i];
  }
  const out = new Float32Array(n);
  for (const b of bodies) add(out, bandpass(imp, b.f, b.q), b.g);
  scale(out, 1 / peakOf(out));
  const h = bandpass(noise(rnd, n), hissF, hissQ);
  const hpk = peakOf(h);
  for (let i = 0; i < n; i++) out[i] += (h[i] / hpk) * v[i] * hiss;
  return out;
};
// Плеск воды в маленькой лейке: 1–2 неровных качания (период 0,12–0,2 с).
// Каждое качание — гроздь коротких шумовых «шлепков» о стенку (без тона);
// пузырьки внутри лейки почти не слышны (×0,2, срез 1,2 кГц).
const slosh = (rnd, len, swings = 2) => {
  const n = S(len);
  const a = new Float32Array(n);
  let t = 0.008;
  for (let k = 0; k < swings; k++) {
    const g = Math.pow(0.3, k);
    const span = 0.05 + rnd() * 0.03;
    const cnt = 6 + Math.floor(rnd() * 4);
    for (let j = 0; j < cnt; j++) {
      const u = rnd();
      const env = Math.sin(Math.PI * u) ** 0.7;
      add(a, grain(rnd, 0.012 + rnd() * 0.02, logRand(rnd, 350, 1500), 0.7 + rnd() * 0.5), 0.3 * g * env * (0.5 + rnd()), S(t + u * span));
    }
    if (rnd() < 0.6) add(a, lowpass(bubble(logRand(rnd, 500, 1100), 0.3 * g * 0.2, 0.05, 2), 1200), 1, S(t + rnd() * span));
    t += 0.16 * (0.75 + rnd() * 0.5);
  }
  return highpass(lowpass(a, 2200), 200);
};
// маленькая комната: разреженная («бархатная») реверберация, тёмный хвост;
// wetDb — уровень хвоста относительно сухого сигнала по энергии
const room = (seed, x, wetDb = -20, rt = 0.3) => {
  const rnd = mulberry32(seed);
  const tail = S(rt);
  const step = Math.round(SR / 1500);
  const tau = rt / 6.9;
  const taps = [];
  let e = 0;
  for (let k = 1; k * step < tail; k++) {
    const d = k * step + Math.floor(rnd() * step);
    const g = Math.exp(-d / SR / tau) * (rnd() < 0.5 ? -1 : 1);
    taps.push([d, g]);
    e += g * g;
  }
  // буфер с запасом: самый поздний отвод (< tail + step) помещается целиком
  const wet = new Float32Array(x.length + tail + step);
  for (const [d, g] of taps) for (let i = 0; i < x.length; i++) wet[i + d] += x[i] * g;
  const y = new Float32Array(wet.length);
  add(y, x);
  return add(y, lowpass(highpass(wet, 200), 3000), db(wetDb) / Math.sqrt(e));
};
// чистовая обработка: обрезка до длины, без постоянной составляющей,
// плавные края (первый и последний отсчёт — ровно 0); finish ещё и
// нормирует пик (дБFS)
const finishRaw = (a, len, fadeIn = 0.004, fadeOut = 0.03) => {
  const y = highpass(highpass(a, 35), 35).slice(0, S(len));
  const n = y.length;
  const fi = Math.max(1, S(fadeIn));
  const fo = Math.max(1, S(fadeOut));
  for (let i = 0; i < fi && i < n; i++) y[i] *= Math.sin((0.5 * Math.PI * i) / fi) ** 2;
  for (let i = 0; i < fo && i < n; i++) y[n - 1 - i] *= Math.sin((0.5 * Math.PI * i) / fo) ** 2;
  let mean = 0;
  for (const v of y) mean += v / n;
  for (let i = 0; i < n; i++) y[i] -= mean * Math.min(1, i / fi, (n - 1 - i) / fo);
  return y;
};
const finish = (a, len, level, fadeIn = 0.004, fadeOut = 0.03) => {
  const y = finishRaw(a, len, fadeIn, fadeOut);
  return scale(y, db(level) / peakOf(y));
};

// meta.json: длительность и время главного касания (impact) каждого файла
const meta = {};
const r4 = (x) => Math.round(x * 10000) / 10000;
const save = (name, a, info = {}) => {
  writeWav(join(OUT, name), [a], SR);
  const fix = Object.fromEntries(Object.entries(info).map(([k, v]) => [k, typeof v === "number" ? r4(v) : Array.isArray(v) ? v.map(r4) : v]));
  meta[name] = { duration: r4(a.length / SR), peakDb: Math.round(200 * Math.log10(peakOf(a))) / 10, rmsDb: Math.round(200 * Math.log10(rmsOf(a))) / 10, ...fix };
};

// Капля на влажную землю: глухой мягкий «тп» — касание 1,5–2,5 мс (земля
// подаётся), тихие моды мокрого грунта ~480/1000 Гц (и едва-едва 190 Гц —
// не «стук по столу») гаснут за 2–4 мс; капля расплющивается — мягкий мокрый
// шлепок ~1 кГц (главное в звуке) и 1–2 крошечных брызга ниже 2 кГц.
// Ни пузырька, ни тона — без «плипа». Срез 3,5 кГц. Капля поменьше (size < 1)
// чуть выше, короче и почти без низа. Касание — ровно в отсчёте 0 массива.
const splat = (rnd, len, fc, q) => {
  const n = S(len);
  const g = bandpass(noise(rnd, n + 96), fc, q).subarray(96);
  const na = S(0.001);
  for (let i = 0; i < n; i++) {
    const att = i < na ? Math.sin((0.5 * Math.PI * i) / na) ** 2 : 1;
    const end = i > n * 0.8 ? Math.cos((0.5 * Math.PI * (i - n * 0.8)) / (n * 0.2)) ** 2 : 1;
    g[i] *= att * end * Math.exp(-i / SR / (len / 4));
  }
  return scale(g, 1 / peakOf(g));
};
const drop = (rnd, size = 1) => {
  const kf = 1 + 0.3 * (1 - size); // капля поменьше — чуть выше и короче
  const a = new Float32Array(S(0.12));
  add(a, knock(rnd, 0.06, (0.0016 + rnd() * 0.0006) * (0.8 + 0.2 * size), [
    { f: 190 * kf * (0.9 + 0.2 * rnd()), tau: 0.004, g: 0.15 * size },
    { f: 480 * kf * (0.9 + 0.2 * rnd()), tau: 0.003, g: 0.4 },
    { f: 1000 * kf * (0.9 + 0.2 * rnd()), tau: 0.002, g: 0.3 },
  ], null, 150, 0.3), 1);
  add(a, lowpass(splat(rnd, (0.005 + 0.003 * rnd()) * (0.8 + 0.2 * size), logRand(rnd, 800, 1500) * kf, 0.8), 2500), 0.8, S(0.0003));
  const k = 1 + Math.floor(rnd() * 2);
  for (let j = 0; j < k; j++) add(a, lowpass(splat(rnd, 0.003 + 0.003 * rnd(), logRand(rnd, 600, 1800), 0.8), 2200), 0.12 * (1 - 0.3 * j), S(0.006 + rnd() * 0.012));
  return scale(highpass(lowpass(lowpass(a, 3500), 3500), 150), size);
};

// ===== pour.wav — тонкая струйка из детской лейки на землю в горшке =====
// 0…0,22 с — тишина (вода ещё летит от носика), затем мягкое начало 0,15 с,
// ровная струйка, последние 0,35 с струя истончается и рвётся, и всё —
// без последних капель (их дают drip-1/drip-2 ровно под капли на экране).
// Струйка тонкая и близкая: основа — поток отдельных мягких шлепков капель
// (≈500·I(t) в секунду, 2–8 мс, 450–3200 Гц) в мокрую землю; сплошной шум
// струи тихий (×0,25) и тёмный (срез 4,5 кГц); комната суше (−20 дБ).
// Пузырьки редкие и тихие, без «чирика»: почти не поднимаются по тону,
// гаснут вместе со струёй, верхние смолкают, как только струя начинает
// истончаться. Уровень — по RMS ровной части (−40 дБFS), пики ≤ −20 дБFS.
const POUR = { lead: 0.22, rmsDb: -40, capDb: -20 };
{
  const rnd = mulberry32(4101);
  const LEAD = POUR.lead;
  const len = LEAD + FLOW + 0.35;
  const n = S(len + 0.4);
  const t0 = LEAD; // вода коснулась земли
  const tThin = LEAD + FLOW - 0.35; // струя начинает истончаться
  const tStop = LEAD + FLOW + 0.05; // последняя вода долетела
  const hand = wobble(rnd, n, 1.1); // медленная «рука ребёнка»
  const shake = wobble(rnd, n, 5); // лёгкое дрожание руки
  const turb = wobble(rnd, n, 28); // турбулентность струи
  const gate = wobble(rnd, n, 16); // струя рвётся на капли при истончении
  const I = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let v = smooth((t - t0) / 0.15) * (1 + 0.18 * hand[i]) * (1 + 0.12 * shake[i]);
    if (t > tThin) {
      const u = (t - tThin) / (tStop - tThin);
      v *= Math.pow(1 - smooth(u), 0.9);
      const g = smooth(u * 1.3);
      v *= 1 - g + g * Math.max(0, gate[i] * 1.5 + 0.25);
    }
    I[i] = Math.max(0, v);
  }
  // 1) тихий сплошной шум струи о мокрую землю (×0,25 от прежнего): тёмный,
  //    мало шипения (4,2 кГц — вес 0,1), заметнее «булькает» турбулентность
  const s1 = bandpass(noise(rnd, n), 1500, 0.6);
  const s2 = bandpass(noise(rnd, n), 4200, 0.9);
  const s3 = bandpass(noise(rnd, n), 420, 0.8);
  const r1 = rmsOf(s1), r2 = rmsOf(s2), r3 = rmsOf(s3);
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const m = 0.6 + 0.4 * turb[i];
    a[i] = 0.25 * ((s1[i] / r1) * 0.32 * m + (s2[i] / r2) * 0.1 * m + (s3[i] / r3) * 0.12) * I[i];
  }
  // 2) поток отдельных капель струйки: мягкие шлепки в мокрую землю
  const STEP = 12;
  for (let i = 0; i < n; i += STEP) {
    if (I[i] <= 0) continue;
    if (rnd() < (500 * I[i] * STEP) / SR) {
      const d = 0.002 + 0.006 * rnd();
      const fc = logRand(rnd, 450, 3200);
      const q = 0.8 + 0.8 * rnd();
      // размер капель почти ровный (без редких «булек» втрое громче соседей);
      // струя истончается — капли мельче и тише
      const amp = 0.06 * Math.exp(0.8 * Math.max(-2.5, Math.min(2, gauss(rnd)))) * (0.4 + 0.6 * Math.min(1, I[i]));
      add(a, splat(rnd, d, fc, q), amp, i + Math.floor(rnd() * STEP));
    }
  }
  // 3) редкое тихое журчание лужицы (пузырьки 1–2,5 кГц: у тонкой струйки
  //    пузыри мелкие, крупные 0,6–0,9 кГц «булькали» тоном; гаснут быстро —
  //    у дна и земли) и шипение воздуха из земли (крошечные пузырьки
  //    2,5–6 кГц, гуще в начале — земля ещё сухая). Сила ~ I^1,5 (на тонкой
  //    струе пузырьков почти нет), тон почти не растёт, средние — не громче
  //    MID_CAP, верхние смолкают, как только струя начинает истончаться.
  const MID_CAP = 0.06;
  for (let i = 0; i < n; i += 48) {
    const t = i / SR;
    const dry = 1.4 - 0.6 * smooth((t - t0) / 2);
    const Ib = Math.pow(I[i], 1.5);
    const pg = (160 * I[i] * 48) / SR, pf = (480 * I[i] * dry * 48) / SR;
    if (rnd() < pg) {
      const f0 = logRand(rnd, 1000, 2500);
      const amp = Math.min(MID_CAP, 0.5 * (0.3 + 0.9 * rnd() * rnd()) * (0.6 + 0.4 * I[i]) * 0.15);
      add(a, bubble(f0, amp * Ib, 0.04, 1.8), 1, i + Math.floor(rnd() * 48));
    }
    if (rnd() < pf && t < tThin) add(a, bubble(logRand(rnd, 2500, 6000), (0.2 + 0.35 * rnd() * rnd()) * 0.2 * Ib, 0.05), 1, i + Math.floor(rnd() * 48));
  }
  const y = finishRaw(room(41, highpass(lowpass(lowpass(a, 4500), 4500), 150), -20, 0.3), len, 0.01, 0.06);
  // уровень: RMS ровной части струи → −40 дБFS, пик не выше −20 дБFS
  const steady = y.subarray(S(t0 + 0.2), S(tThin));
  scale(y, Math.min(db(POUR.rmsDb) / rmsOf(steady), db(POUR.capDb) / peakOf(y)));
  save("pour.wav", y, { flow: FLOW, impact: t0, thinFrom: tThin, flowEnd: tStop, steadyRmsDb: Math.round(200 * Math.log10(rmsOf(steady))) / 10 });
}

// ===== drip-1.wav, drip-2.wav — одна капля с носика на влажную землю =====
// касание земли — ровно в 0,020 с; drip-2 — капля поменьше (0,7) и тише.
// drips.wav — обе капли в одном файле (0,02 и 0,30 с), как раньше.
{
  const rnd = mulberry32(4202);
  const DROP_AT = 0.02;
  const d1 = drop(rnd, 1);
  const d2 = drop(rnd, 0.7);
  const one = (d, seed) => {
    const a = new Float32Array(S(0.4));
    add(a, d, 1, S(DROP_AT));
    return finishRaw(room(seed, a, -18, 0.3), 0.3, 0.002, 0.05);
  };
  const y1 = one(d1, 42);
  const y2 = one(d2, 52);
  // громкость капли — по энергии первых 15 мс после касания (пик у капель
  // разный): вторая, маленькая, на 2,5 дБ тише первой
  const hitRms = (y) => rmsOf(y.subarray(S(DROP_AT), S(DROP_AT + 0.015)));
  scale(y1, db(-20.5) / peakOf(y1));
  scale(y2, (hitRms(y1) * db(-2.5)) / hitRms(y2));
  save("drip-1.wav", y1, { impact: DROP_AT, size: 1 });
  save("drip-2.wav", y2, { impact: DROP_AT, size: 0.7 });
  const a = new Float32Array(S(0.9));
  add(a, d1, 1, S(0.02));
  add(a, d2, 1, S(0.3));
  save("drips.wav", finish(room(42, a, -18, 0.3), 0.7, -24, 0.002, 0.05), { impact: [0.02, 0.3] });
}

// ===== can-lift.wav — лейку поднимают со стола (~0,5 с) =====
{
  const rnd = mulberry32(4301);
  const n = S(0.6);
  const a = new Float32Array(n);
  // донце чуть ползёт по дереву, затем отрывается (тихо, без скрипа: срез 4 кГц)
  add(a, lowpass(friction(rnd, bell(n, 0.012, 0.075, 1.5), {
    rate: 900, chatter: 0.5, chatterHz: 45, hiss: 0.4, hissF: 2800, hissQ: 0.6,
    bodies: [{ f: 900, q: 0.9, g: 0.6 }, { f: 2200, q: 1.1, g: 1 }, { f: 4000, q: 1.2, g: 0.5 }],
  }), 4000), 0.2);
  // тихий «тик» отрыва края донца
  add(a, knock(rnd, 0.05, 0.0008, [{ f: 1400, tau: 0.003, g: 0.25 }, { f: 2600, tau: 0.002, g: 0.4 }, { f: 4000, tau: 0.002, g: 0.2 }], { g: 0.5, f: 3500, q: 0.7 }, 300, 0.2), 0.3, S(0.085));
  // вода внутри качнулась (два качания, укладываются до затухания)
  add(a, slosh(rnd, 0.33, 2), 0.25, S(0.09));
  // пик −27: шорох стал на ~5 дБ тише, и при прежнем пике −25 плеск и «тик»
  // стали бы громче прежнего
  save("can-lift.wav", finish(room(43, lowpass(a, 6000), -19, 0.25), 0.5, -27, 0.004, 0.06), { impact: 0.085 });
}

// ===== can-place.wav — лейку ставят на деревянный стол (~0,6 с) =====
{
  const rnd = mulberry32(4401);
  const n = S(0.7);
  const a = new Float32Array(n);
  // донце касается сначала краем, затем ложится (два близких касания);
  // касание мягкое (3 мс), моды гаснут быстро — глухой «тук», без звона
  // и без щелчка (срез 6 кГц, как у деревянных стуков первого фильма)
  const hit = (gain, at) =>
    add(a, lowpass(knock(rnd, 0.2, 0.003, [
      { f: 210, tau: 0.005, g: 0.6 }, // столешница
      { f: 380, tau: 0.005, g: 0.5 }, // полая лейка
      { f: 520, tau: 0.004, g: 0.6 },
      { f: 760, tau: 0.004, g: 0.6 },
      { f: 1050, tau: 0.004, g: 0.55 },
      { f: 1500, tau: 0.003, g: 0.45 }, // дерево
      { f: 2100, tau: 0.003, g: 0.35 },
      { f: 3000, tau: 0.003, g: 0.25 },
    ], { g: 0.8, f: 1800, q: 0.7 }, 120, 0.3), 6000), gain, S(at));
  hit(0.35, 0.02);
  hit(1, 0.03);
  add(a, slosh(rnd, 0.45, 2), 0.35, S(0.045));
  save("can-place.wav", finish(room(44, a, -18, 0.28), 0.6, -21, 0.004, 0.06), { impact: 0.03, edge: 0.02 });
}

// ===== tray-slide*.wav — керамический поддон сдвигают по столу =====
// Шершавое неглазурованное донце по лакированному дереву: зернистое
// «ш-ш-ш» — мягкий шум (×0,65) и под ним зерно микрозацепов (stick-slip,
// 380 в секунду, неровность 40 Гц), всё по скорости (плавный разгон и
// торможение, как easeInOut на экране); в момент срыва с места — едва
// слышный мягкий «тк». Движение начинается в 0 с.
const traySlide = (seed, dur) => {
  const rnd = mulberry32(seed);
  const len = dur + 0.25;
  const n = S(len + 0.1);
  const vel = easeVel(n, 0, dur);
  const wob = wobble(rnd, n, 30);
  // громкость ~ скорости; трение покоя: при самой малой скорости донце молчит,
  // поэтому срыв с места («тк») приходится на начало слышимого шороха
  const v = new Float32Array(n);
  let onset = -1;
  for (let i = 0; i < n; i++) {
    const s = smooth((vel[i] - 0.03) / 0.12) * Math.pow(vel[i], 0.8);
    v[i] = s * Math.max(0, 0.6 + 0.4 * Math.min(1.8, Math.abs(wob[i]) * 2));
    if (onset < 0 && s > 0.03) onset = i;
  }
  const h1 = bandpass(noise(rnd, n), 1400, 0.5);
  const h2 = bandpass(noise(rnd, n), 3600, 0.7);
  const h3 = bandpass(noise(rnd, n), 700, 0.7);
  const r1 = rmsOf(h1), r2 = rmsOf(h2), r3 = rmsOf(h3);
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) a[i] = ((h1[i] / r1) * 0.6 + (h2[i] / r2) * 0.15 + (h3[i] / r3) * 0.25) * v[i] * 0.65;
  // зерно микрозацепов: по RMS, тихо и под срезом 3,5 кГц — шершаво, но не «треск костра»
  const fr = lowpass(lowpass(friction(rnd, v, { rate: 380, chatter: 0.25, chatterHz: 40, hiss: 0, bodies: [{ f: 1100, q: 0.6, g: 0.8 }, { f: 2400, q: 0.7, g: 1 }, { f: 4200, q: 0.9, g: 0.3 }] }), 3500), 3500);
  add(a, fr, (0.4 * 0.25 * 0.8) / rmsOf(fr));
  scale(a, 1 / peakOf(a));
  add(a, knock(rnd, 0.04, 0.0012, [{ f: 700, tau: 0.003, g: 0.5 }, { f: 1600, tau: 0.002, g: 0.4 }, { f: 2900, tau: 0.002, g: 0.2 }], { g: 0.5, f: 2200, q: 0.7 }, 250, 0.25), 0.12, Math.max(0, onset));
  // ниже ~450 Гц донце поддона почти не звучит (иначе шорох «гудит» как взрыв)
  // уровень — по RMS движения (как у прежних файлов, −43 дБFS), пик ≤ −20:
  // зерно поднимает пики, и нормировка по пику сделала бы шорох тише
  const y = finishRaw(room(seed + 7, highpass(highpass(lowpass(a, 7000), 450), 450), -19, 0.25), len, 0.01, 0.08);
  scale(y, Math.min(db(-43) / rmsOf(y.subarray(0, S(dur))), db(-20) / peakOf(y)));
  return { y, onset: Math.max(0, onset) / SR };
};
for (const [name, seed, dur] of [["tray-slide.wav", 4501, 1.0], ["tray-slide-back.wav", 4511, 1.2]]) {
  const { y, onset } = traySlide(seed, dur);
  save(name, y, { motionStart: 0, motionDur: dur, breakaway: onset });
}

// ===== card-pick*.wav — карточку берут из небольшой стопки (~0,3 с) =====
// k — длина шороха (×0,85…1,15), kf — частота «флапа» (×0,85…1,15)
const cardPick = (seed, roomSeed, level, k = 1, kf = 1) => {
  const rnd = mulberry32(seed);
  const n = S(0.32);
  const a = new Float32Array(n);
  // картон скользит по картону, к концу быстрее
  const rub = 0.075 * k;
  const vel = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const u = (i / SR - 0.012) / rub;
    vel[i] = u > 0 && u < 1 ? Math.pow(Math.sin(Math.PI * u), 1.5) * (0.35 + 0.65 * u) : 0;
  }
  add(a, friction(rnd, vel, {
    rate: 3000, chatter: 0.3, chatterHz: 70, hiss: 0.3, hissF: 3200, hissQ: 0.6,
    bodies: [{ f: 2000, q: 0.7, g: 0.8 }, { f: 3800, q: 0.9, g: 0.7 }],
  }), 0.7);
  // край соскакивает со стопки: картонка чуть изгибается и распрямляется —
  // мягкий бумажный «флап» (шум 1–4 кГц, ~25 мс) и едва слышный щелчок кромки
  const tf = 0.012 + rub - 0.009;
  add(a, grain(rnd, 0.025, 2000 * kf, 0.45), 0.35, S(tf));
  add(a, grain(rnd, 0.018, 1300 * kf, 0.6), 0.2, S(tf + 0.012));
  add(a, knock(rnd, 0.04, 0.0008, [{ f: 1200, tau: 0.0015, g: 0.3 }, { f: 1700, tau: 0.0015, g: 0.35 }, { f: 2400, tau: 0.0015, g: 0.3 }], { g: 0.6, f: 3000, q: 0.6 }, 450, 0.25), 0.12, S(tf + 0.004));
  return [finish(room(roomSeed, lowpass(a, 6500), -20, 0.2), 0.3, level, 0.003, 0.04), { impact: tf, rubFrom: 0.012 }];
};
save("card-pick.wav", ...cardPick(4601, 46, -25));
save("card-pick-1.wav", ...cardPick(4611, 61, -25.5, 0.88, 1.12));
save("card-pick-2.wav", ...cardPick(4621, 62, -26.5, 1.13, 0.87));
save("card-pick-3.wav", ...cardPick(4631, 63, -25, 1.0, 0.96));

// ===== card-place*.wav — карточка опускается в деревянный паз (~0,35 с) =====
// кромка касается дна паза ровно в 0,06 с; шорох о стенки паза — перед этим
const SEAT = 0.06;
const cardPlace = (seed, roomSeed, level, k = 1, kf = 1) => {
  const rnd = mulberry32(seed);
  const n = S(0.4);
  const a = new Float32Array(n);
  // кромка карточки трётся о стенки паза
  const rub = 0.05 * k;
  add(a, friction(rnd, bell(n, SEAT - rub, rub, 1.5), {
    rate: 2500, chatter: 0.3, chatterHz: 70, hiss: 0.4, hissF: 3500, hissQ: 0.6,
    bodies: [{ f: 2200, q: 0.8, g: 0.8 }, { f: 4200, q: 1, g: 0.5 }],
  }), 0.3);
  // дно паза: мягкий картонный «тп» с едва заметным деревом
  const tap = (g, at, tc) =>
    add(a, knock(rnd, 0.06, tc, [
      { f: 480, tau: 0.003, g: 0.3 }, // картонка
      { f: 820, tau: 0.003, g: 0.4 },
      { f: 1250, tau: 0.004, g: 0.15 }, // деревянная подставка (×0,3)
      { f: 1700, tau: 0.004, g: 0.15 },
      { f: 2300, tau: 0.003, g: 0.135 },
      { f: 3100, tau: 0.0025, g: 0.105 },
      { f: 4200, tau: 0.002, g: 0.075 },
    ], { g: 0.6, f: 2500, q: 0.7 }, 250, 0.25), g, S(at));
  tap(1, SEAT, 0.0015);
  tap(0.05, SEAT + 0.008, 0.0012); // едва заметный отскок
  // картонка чуть пружинит в пазу: бумажный «флап» 1–3 кГц
  add(a, grain(rnd, 0.02, 1700 * kf, 0.5), 0.3, S(SEAT - 0.002));
  return [finish(room(roomSeed, lowpass(a, 6500), -19, 0.22), 0.35, level, 0.003, 0.04), { impact: SEAT, rubFrom: SEAT - rub }];
};
save("card-place.wav", ...cardPlace(4701, 47, -23));
save("card-place-1.wav", ...cardPlace(4711, 71, -25, 1.12, 0.9));
save("card-place-2.wav", ...cardPlace(4721, 72, -26.5, 0.87, 1.13));
save("card-place-3.wav", ...cardPlace(4731, 73, -25.5, 1.0, 1.04));

// ===== card-out*.wav — карточку вынимают вверх из деревянного паза (~0,35 с) =====
// Пальцы взяли карточку (0 с); кромка медленно (≈0,15 с) ползёт вверх по
// стенкам паза — сухое дерево по картону, резонансы паза ~1,2 и 2,6 кГц,
// скорость к концу растёт; кромка выходит из паза едва слышным «тк» и
// картонка чуть пружинит.
const cardOut = (seed, roomSeed, level, k = 1, kf = 1) => {
  const rnd = mulberry32(seed);
  const n = S(0.42);
  const a = new Float32Array(n);
  const t0 = 0.012;
  const pull = 0.15 * k;
  const vel = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const u = (i / SR - t0) / pull;
    vel[i] = u > 0 && u < 1 ? Math.pow(Math.sin(Math.PI * u), 1.2) * (0.4 + 0.6 * u) : 0;
  }
  add(a, friction(rnd, vel, {
    rate: 1800, chatter: 0.35, chatterHz: 55, hiss: 0.25, hissF: 2200, hissQ: 0.6,
    bodies: [{ f: 1200 * kf, q: 1.1, g: 0.9 }, { f: 2600 * kf, q: 1.2, g: 1 }],
  }), 0.7);
  const te = t0 + pull * 0.92; // кромка вышла из паза
  add(a, knock(rnd, 0.04, 0.0012, [{ f: 1200 * kf, tau: 0.002, g: 0.3 }, { f: 2600 * kf, tau: 0.0015, g: 0.25 }], { g: 0.4, f: 2200, q: 0.7 }, 400, 0.25), 0.1, S(te));
  add(a, grain(rnd, 0.022, 1500 * kf, 0.5), 0.2, S(te + 0.004));
  return [finish(room(roomSeed, lowpass(a, 5000), -20, 0.2), 0.35, level, 0.003, 0.04), { impact: te, rubFrom: t0 }];
};
const outTakes = [cardOut(4911, 81, -26, 1.0, 1.0), cardOut(4921, 82, -26.5, 0.88, 1.1), cardOut(4931, 83, -25.5, 1.12, 0.92)];
outTakes.forEach((tk, i) => save(`card-out-${i + 1}.wav`, ...tk));
save("card-out.wav", ...outTakes[0]);

// ===== card-on-stack*.wav — карточку кладут на маленькую стопку (~0,25 с) =====
// Без шороха: картонка ложится плашмя на картон — мягкое глухое «тп»
// (касание 2,5 мс, моды картона 300–2100 Гц гаснут за 1,5–3 мс) и тихий
// выдох воздуха из-под карточки. Касание — ровно в 0,02 с.
const STACK_AT = 0.02;
const cardOnStack = (seed, roomSeed, level, kf = 1) => {
  const rnd = mulberry32(seed);
  const a = new Float32Array(S(0.35));
  add(a, lowpass(grain(rnd, 0.012, 700, 0.6), 1500), 0.08, S(STACK_AT - 0.006));
  add(a, knock(rnd, 0.1, 0.0025 * (0.9 + 0.2 * rnd()), [
    { f: 300 * kf, tau: 0.003, g: 0.35 },
    { f: 560 * kf, tau: 0.003, g: 0.5 },
    { f: 900 * kf, tau: 0.0025, g: 0.4 },
    { f: 1400 * kf, tau: 0.002, g: 0.25 },
    { f: 2100 * kf, tau: 0.0015, g: 0.12 },
  ], { g: 0.35, f: 1500, q: 0.7 }, 150, 0.3), 1, S(STACK_AT));
  return [finish(room(roomSeed, lowpass(a, 4500), -20, 0.2), 0.25, level, 0.003, 0.04), { impact: STACK_AT }];
};
const stackTakes = [cardOnStack(4941, 84, -26), cardOnStack(4951, 85, -26.5, 1.1), cardOnStack(4961, 86, -25.5, 0.92)];
stackTakes.forEach((tk, i) => save(`card-on-stack-${i + 1}.wav`, ...tk));
save("card-on-stack.wav", ...stackTakes[0]);

// ===== cards-stack.wav — стопку из 4 карточек выравнивают о стол (~0,5 с) =====
// Сами карточки уже собраны (их звучат card-out / card-on-stack); здесь —
// короткий шорох краёв, когда стопку подравнивают в ладонях, и один мягкий
// глухой стук о стол (под срезом 5 кГц — без щелчка).
{
  const rnd = mulberry32(4801);
  const n = S(0.6);
  const a = new Float32Array(n);
  add(a, friction(rnd, bell(n, 0.01, 0.11, 1.4), {
    rate: 2600, chatter: 0.3, chatterHz: 60, hiss: 0.4, hissF: 3200, hissQ: 0.6,
    bodies: [{ f: 1800, q: 0.7, g: 0.8 }, { f: 3600, q: 0.9, g: 0.7 }],
  }), 0.28);
  add(a, lowpass(knock(rnd, 0.12, 0.002, [
    { f: 240, tau: 0.0025, g: 0.3 }, // стол
    { f: 450, tau: 0.0025, g: 0.5 }, // стопка картона
    { f: 700, tau: 0.0025, g: 0.5 },
    { f: 1000, tau: 0.002, g: 0.45 },
    { f: 1400, tau: 0.002, g: 0.35 },
    { f: 1900, tau: 0.002, g: 0.25 },
    { f: 2700, tau: 0.0015, g: 0.15 },
  ], { g: 0.8, f: 2000, q: 0.6 }, 140, 0.3), 5000), 1, S(0.14));
  save("cards-stack.wav", finish(room(48, a, -19, 0.25), 0.5, -25, 0.004, 0.05), { impact: 0.14 });
}

// ===== cloth-1/2.wav — шорох одежды (встать / сесть на ковёр), без шагов =====
// Каждое движение тела — отдельный мягкий «ш-ш» хлопковой ткани (полосовой
// шум 0,6–1,4 кГц с огибающей движения и медленной неровностью складок)
// плюс редкие тихие «шуршинки» внутри движения.
const cloth = (seed, len, events) => {
  const rnd = mulberry32(seed);
  const n = S(len + 0.3);
  const a = new Float32Array(n);
  for (const e of events) {
    const m = S(e.d);
    const fc = e.f * (0.9 + rnd() * 0.2);
    const b1 = bandpass(noise(rnd, m), fc, 0.6);
    const b2 = bandpass(noise(rnd, m), fc * 2.3, 0.8);
    const r1 = rmsOf(b1), r2 = rmsOf(b2);
    const crease = wobble(rnd, m, 30);
    const shape = (u) => (u < e.pk ? Math.sin((0.5 * Math.PI * u) / e.pk) ** 2 : Math.cos((0.5 * Math.PI * (u - e.pk)) / (1 - e.pk)) ** 2);
    const seg = new Float32Array(m);
    for (let i = 0; i < m; i++) seg[i] = ((b1[i] / r1) + e.hi * (b2[i] / r2)) * shape(i / m) * (0.55 + 0.45 * Math.min(2, Math.abs(crease[i]) * 2)) * e.g;
    for (let k = 0; k < 12 * e.d; k++) {
      const t = Math.floor(rnd() * m * 0.9);
      add(seg, grain(rnd, 0.008 + rnd() * 0.016, fc * 1.4 * Math.exp(rnd() - 0.5), 0.8), e.g * shape(t / m) * (0.6 + rnd()) * 0.5, t);
    }
    add(a, seg, 1, S(e.t));
  }
  return highpass(lowpass(lowpass(a, 4000), 4000), 150);
};
// встать: колени и брюки, корпус, рукава, оправить одежду
save("cloth-1.wav", finish(room(49, cloth(4901, 0.95, [
  { t: 0.02, d: 0.34, f: 780, g: 0.8, pk: 0.45, hi: 0.4 },
  { t: 0.2, d: 0.38, f: 1020, g: 1, pk: 0.35, hi: 0.5 },
  { t: 0.44, d: 0.22, f: 1380, g: 0.55, pk: 0.4, hi: 0.5 },
  { t: 0.66, d: 0.2, f: 1140, g: 0.3, pk: 0.5, hi: 0.4 },
]), -20, 0.22), 0.95, -26, 0.02, 0.08));
// сесть: корпус вниз, ноги скрещиваются, ладони ложатся на колени
save("cloth-2.wav", finish(room(50, cloth(5001, 0.9, [
  { t: 0.02, d: 0.3, f: 960, g: 0.6, pk: 0.5, hi: 0.45 },
  { t: 0.18, d: 0.4, f: 660, g: 1, pk: 0.55, hi: 0.35 },
  { t: 0.5, d: 0.24, f: 840, g: 0.55, pk: 0.4, hi: 0.4 },
  { t: 0.68, d: 0.14, f: 1260, g: 0.25, pk: 0.4, hi: 0.45 },
]), -20, 0.22), 0.9, -26, 0.02, 0.08));

// ===== soil-touch.wav — палец касается сухой земли (~0,3 с) =====
{
  const rnd = mulberry32(5101);
  const n = S(0.35);
  const a = new Float32Array(n);
  // крошки торфа мягко сдвигаются под пальцем (зёрна 3–8 мс, 0,5–2,5 кГц);
  // вторая горсть — сразу за первой (окно 0,05 с), без отдельных щелчков позже
  for (const [t0, d, k, g0] of [[0.02, 0.06, 12, 1], [0.08, 0.05, 8, 0.6]]) {
    for (let j = 0; j < k; j++) {
      const t = t0 + Math.pow(rnd(), 1.3) * d;
      const g = g0 * (0.3 + 0.7 * rnd());
      add(a, grain(rnd, 0.003 + rnd() * 0.005, logRand(rnd, 500, 2500), 0.7 + rnd() * 0.6), g, S(t));
    }
  }
  // мягкое надавливание подушечкой пальца и общий шорох крошек
  add(a, grain(rnd, 0.07, 600, 0.6), 0.2, S(0.02));
  add(a, grain(rnd, 0.11, 1500, 0.6), 0.25, S(0.018));
  save("soil-touch.wav", finish(room(51, highpass(lowpass(a, 5000), 200), -21, 0.18), 0.3, -26, 0.003, 0.04), { impact: 0.02 });
}

writeFileSync(join(OUT, "meta.json"), `${JSON.stringify({ sampleRate: SR, note: "duration, impact (main contact) in seconds inside the file; peakDb/rmsDb of the whole file", files: meta }, null, 2)}\n`);
console.log("Звуки ролика 80-1-4 готовы:", OUT, `(струя ${FLOW} с)`);
