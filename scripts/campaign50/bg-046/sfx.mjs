// Звуковые эффекты ролика BG-046 «Мектеп сумкасынын монологу» (говорящий
// жёлтый школьный рюкзак). Все звуки синтезируются кодом — без сэмплов,
// загрузок и платных сервисов; результат детерминирован (шум задаёт
// mulberry32 с фиксированным зерном). Звуки мягкие, «мультяшные», но
// аккуратные: в ролике они идут на громкости 0,1–0,4 под голосом.
// Вокальных звуков (зевок и т. п.) нет.
//
//   zip     — молния-«рот» рюкзака застёгивается;
//   wake    — волшебная искорка: рюкзак открывает глаза;
//   boing   — мягкий пружинный прыжок;
//   pop     — открывается клапан кармана;
//   paper   — записка шуршит и разворачивается;
//   flip    — листок отрывного календаря;
//   tap     — касание экрана телефона;
//   type    — набор текста на экранной клавиатуре;
//   send    — сообщение отправлено («вжух» вверх);
//   click   — пряжка ремня безопасности;
//   car     — машина мягко подъезжает и останавливается;
//   chime   — двухнотный колокольчик финальной карточки;
//   whoosh  — мягкий переход;
//   step-0…3 — тихие шаги по деревянному полу (четыре варианта);
//   tick    — тиканье часов.
// Моно, 44,1 кГц, MP3 128 кбит/с → public/audio/campaign50/bg-046/sfx/.
// Самый громкий эффект — пик −6 дБFS, остальные тише.
//
// Запуск: node scripts/campaign50/bg-046/sfx.mjs              — все эффекты
//         node scripts/campaign50/bg-046/sfx.mjs zip car      — только указанные
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { SAMPLE_RATE as SR, ffmpeg, mulberry32, normalizePeak, writeWav } from "./audio.mjs";

const OUT = "public/audio/campaign50/bg-046/sfx";
const TMP = join(tmpdir(), "balago-bg046-sfx");
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

const TAU = Math.PI * 2;
const samples = (sec) => Math.round(sec * SR);
const noiseSource = (seed) => {
  const rand = mulberry32(seed);
  return () => rand() * 2 - 1;
};

// Биквад-фильтр по формулам RBJ Audio EQ Cookbook (неизменная частота),
// обрабатывает буфер на месте.
const biquad = (buf, type, f, q = 0.707) => {
  const w = (TAU * f) / SR;
  const cos = Math.cos(w);
  const alpha = Math.sin(w) / (2 * q);
  const b =
    type === "lowpass"
      ? [(1 - cos) / 2, 1 - cos, (1 - cos) / 2]
      : [(1 + cos) / 2, -(1 + cos), (1 + cos) / 2];
  const a = [1 + alpha, -2 * cos, 1 - alpha];
  let x1 = 0;
  let x2 = 0;
  let y1 = 0;
  let y2 = 0;
  for (let i = 0; i < buf.length; i++) {
    const x = buf[i];
    const y = (b[0] * x + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2) / a[0];
    x2 = x1;
    x1 = x;
    y2 = y1;
    y1 = y;
    buf[i] = y;
  }
  return buf;
};

// Фильтр с переменными состояниями (SVF, топология TPT): частоту можно менять
// на каждом отсчёте — нужен для «свистов» и шорохов со скольжением.
// mode: "lp" — НЧ, "bp" — полосовой (0 дБ на центральной частоте), "hp" — ВЧ.
const svf = (mode) => {
  let ic1 = 0;
  let ic2 = 0;
  return (x, f, q) => {
    const g = Math.tan((Math.PI * Math.min(f, SR * 0.45)) / SR);
    const k = 1 / q;
    const a1 = 1 / (1 + g * (g + k));
    const a2 = g * a1;
    const a3 = g * a2;
    const v3 = x - ic2;
    const v1 = a1 * ic1 + a2 * v3;
    const v2 = ic2 + a2 * ic1 + a3 * v3;
    ic1 = 2 * v1 - ic1;
    ic2 = 2 * v2 - ic2;
    return mode === "lp" ? v2 : mode === "bp" ? k * v1 : x - k * v1 - v2;
  };
};

// Короткая синусоида с затуханием, добавляется в буфер с момента start.
const ping = (y, start, hz, amp, tau, attack = 0.001) => {
  const s0 = samples(start);
  const total = Math.min(samples(tau * 7), y.length - s0);
  for (let i = 0; i < total; i++) {
    const t = i / SR;
    y[s0 + i] += amp * Math.min(1, t / attack) * Math.exp(-t / tau) * Math.sin(TAU * hz * t);
  }
};

// Сохраняет моно-буфер: мягкие края, нормализация пика, MP3 128 кбит/с.
const save = (name, y, peakDb) => {
  const fadeIn = samples(0.0005);
  const fadeOut = Math.min(samples(0.006), y.length);
  for (let i = 0; i < fadeIn; i++) y[i] *= i / fadeIn;
  for (let i = 0; i < fadeOut; i++) y[y.length - 1 - i] *= i / fadeOut;
  normalizePeak([y], peakDb);
  const wav = join(TMP, `${name}.wav`);
  writeWav(wav, [y]);
  ffmpeg(["-i", wav, "-ac", "1", "-ar", String(SR), "-codec:a", "libmp3lame", "-b:a", "128k", join(OUT, `${name}.mp3`)]);
  console.log(`+ ${OUT}/${name}.mp3 (${(y.length / SR).toFixed(2)} с, пик ${peakDb} дБFS)`);
};

// ---------- Эффекты ----------

// Молния: быстрый «поезд» крошечных щелчков зубчиков; интервал сокращается
// с 16 до 5 мс — молнию застёгивают с ускорением. Под щелчками — тихий
// полосовой шорох ткани, в конце — щелчок упора бегунка.
const zip = () => {
  const y = new Float32Array(samples(0.45));
  const rand = mulberry32(4611);
  const noise = noiseSource(4612);
  const tooth = (start, amp, hz) => {
    const s0 = samples(start);
    for (let i = 0; i < samples(0.004); i++) {
      const t = i / SR;
      y[s0 + i] +=
        amp * (noise() * Math.exp(-t / 0.0005) + 0.7 * Math.sin(TAU * hz * t) * Math.exp(-t / 0.0012));
    }
  };
  const end = 0.39;
  for (let t = 0.01; t < end; ) {
    const p = t / end;
    const fadeIn = Math.min(1, t / 0.04);
    tooth(t, (0.55 + 0.45 * rand()) * (0.6 + 0.4 * p) * fadeIn, 2300 + 1700 * p);
    t += (0.016 - 0.011 * p ** 0.8) * (0.85 + 0.3 * rand());
  }
  tooth(0.405, 1.1, 1800);
  const fabric = svf("bp");
  const nEnd = samples(end);
  for (let i = 0; i < nEnd; i++) {
    const p = i / nEnd;
    y[i] += 0.12 * Math.min(1, p / 0.08) * (0.5 + 0.5 * p) * fabric(noise(), 2600 + 1500 * p, 1.1);
  }
  biquad(y, "highpass", 700);
  biquad(y, "lowpass", 9000);
  save("zip", y, -9);
};

// Пробуждение: волшебная «искорка» — четыре колокольчика вверх по фа-мажорному
// трезвучию (A6–C7–F7–A7), под ними тихое скольжение вверх, сверху — немного
// «звёздной пыли» из очень высоких коротких «динь».
const wake = () => {
  const dur = 0.5;
  const y = new Float32Array(samples(dur));
  const rand = mulberry32(4613);
  const bell = (start, hz, amp, tau) => {
    ping(y, start, hz, amp, tau, 0.002);
    ping(y, start, hz * 2.76, amp * 0.2, 0.05, 0.002);
  };
  bell(0.0, 1760, 0.8, 0.16);
  bell(0.055, 2093, 0.75, 0.16);
  bell(0.11, 2794, 0.65, 0.15);
  bell(0.17, 3520, 0.6, 0.18);
  let ph = 0;
  for (let i = 0; i < samples(0.3); i++) {
    const p = i / samples(0.3);
    ph += (TAU * 600 * 2 ** p) / SR;
    y[i] += 0.15 * Math.sin(Math.PI * p) * Math.sin(ph);
  }
  for (let k = 0; k < 7; k++)
    ping(y, 0.05 + 0.33 * rand(), 5000 + 3000 * rand(), 0.08 + 0.07 * rand(), 0.02);
  const nf = samples(0.08);
  for (let i = 0; i < nf; i++) y[y.length - 1 - i] *= i / nf;
  save("wake", y, -9);
};

// Прыжок: мультяшная «пружинка» — тон быстро поднимается и покачивается
// с затухающим вибрато; мягкий тембр без резких обертонов.
const boing = () => {
  const y = new Float32Array(samples(0.35));
  let ph = 0;
  for (let i = 0; i < y.length; i++) {
    const t = i / SR;
    const rise = 1 + 0.55 * (1 - Math.exp(-t / 0.03));
    const wobble = 1 + 0.07 * Math.exp(-t / 0.1) * Math.sin(TAU * 15 * t);
    ph += (TAU * 190 * rise * wobble) / SR;
    const env = Math.min(1, t / 0.005) * Math.exp(-t / 0.1);
    y[i] = env * (Math.sin(ph) + 0.22 * Math.sin(2 * ph) + 0.06 * Math.sin(3 * ph));
  }
  biquad(y, "lowpass", 2500);
  save("boing", y, -8);
};

// Клапан кармана: мягкий «поп» — тон быстро падает, едва слышный шумовой край.
const pop = () => {
  const y = new Float32Array(samples(0.2));
  const noise = noiseSource(4614);
  let ph = 0;
  for (let i = 0; i < y.length; i++) {
    const t = i / SR;
    ph += (TAU * (170 + 480 * Math.exp(-t / 0.01))) / SR;
    const env = Math.min(1, t / 0.0015) * Math.exp(-t / 0.03);
    y[i] = Math.sin(ph) * env + 0.25 * noise() * Math.exp(-t / 0.002);
  }
  biquad(y, "lowpass", 3500);
  save("pop", y, -9);
};

// Записка: шуршание и разворачивание бумаги — несколько всплесков шума через
// полосовой фильтр (у каждого своя «высота» и лёгкое дрожание), редкий хруст
// и общий мягкий шорох.
const paper = () => {
  const dur = 0.5;
  const y = new Float32Array(samples(dur));
  const rand = mulberry32(4615);
  const noise = noiseSource(4616);
  const bursts = [
    // [начало, длина, центральная частота, громкость]
    [0.0, 0.07, 2400, 0.8],
    [0.06, 0.06, 3600, 0.6],
    [0.14, 0.09, 1900, 1],
    [0.25, 0.07, 3000, 0.7],
    [0.33, 0.1, 2200, 0.85],
  ];
  for (const [start, len, fc, amp] of bursts) {
    const bp = svf("bp");
    const s0 = samples(start);
    const total = Math.min(samples(len + 0.06), y.length - s0);
    for (let i = 0; i < total; i++) {
      const t = i / SR;
      const env = Math.min(1, t / 0.006) * (t < len ? 1 : Math.exp(-(t - len) / 0.012));
      const crackle = rand() < 0.015 ? 2.5 : 1;
      y[s0 + i] += amp * env * crackle * bp(noise(), fc * (1 + 0.15 * Math.sin(TAU * 28 * t)), 1.3);
    }
  }
  const bed = svf("lp");
  for (let i = 0; i < y.length; i++) y[i] += 0.15 * Math.sin((Math.PI * i) / y.length) * bed(noise(), 1500, 0.7);
  biquad(y, "highpass", 600);
  save("paper", y, -10);
};

// Листок отрывного календаря: короткий «тик» отрыва и быстрый шорох — шум
// через полосовой фильтр, центральная частота которого скользит вверх.
const flip = () => {
  const y = new Float32Array(samples(0.25));
  const noise = noiseSource(4617);
  for (let i = 0; i < samples(0.003); i++) y[i] += 0.7 * noise() * Math.exp(-i / SR / 0.0008);
  const bp = svf("bp");
  const [a, b] = [samples(0.01), samples(0.23)];
  for (let i = a; i < b; i++) {
    const p = (i - a) / (b - a);
    const flutter = 0.8 + 0.2 * Math.sin((TAU * 45 * i) / SR);
    y[i] += 0.6 * Math.sin(Math.PI * p) ** 1.4 * flutter * bp(noise(), 1200 * 3.2 ** p, 1);
  }
  biquad(y, "highpass", 500);
  save("flip", y, -10);
};

// Касание экрана: мягкий глухой «тук» пальца и чуть стеклянный призвук.
const tap = () => {
  const y = new Float32Array(samples(0.08));
  const noise = noiseSource(4618);
  let ph = 0;
  for (let i = 0; i < y.length; i++) {
    const t = i / SR;
    ph += (TAU * (140 + 70 * Math.exp(-t / 0.006))) / SR;
    y[i] =
      0.8 * Math.sin(ph) * Math.min(1, t / 0.001) * Math.exp(-t / 0.009) +
      0.3 * Math.sin(TAU * 1900 * t) * Math.exp(-t / 0.0025) +
      0.2 * noise() * Math.exp(-t / 0.0006);
  }
  biquad(y, "lowpass", 7000);
  save("tap", y, -10);
};

// Набор текста: десять лёгких «тиков» экранной клавиатуры с живыми неровными
// интервалами и разной силой нажатия; посередине короткая «задумчивая» пауза.
const typing = () => {
  const y = new Float32Array(samples(1.2));
  const rand = mulberry32(4619);
  const noise = noiseSource(4620);
  let start = 0.03;
  for (let k = 0; k < 10; k++) {
    const amp = 0.7 + 0.3 * rand();
    const fc = 2800 + 900 * rand();
    const bp = svf("bp");
    const s0 = samples(start);
    for (let i = 0; i < samples(0.015); i++) {
      const t = i / SR;
      y[s0 + i] +=
        amp *
        (0.8 * bp(noise(), fc, 2) * Math.exp(-t / 0.003) +
          0.35 * Math.sin(TAU * 320 * t) * Math.exp(-t / 0.005));
    }
    start += 0.075 + 0.04 * rand() + (k === 4 ? 0.06 : 0);
  }
  save("type", y, -11);
};

// Сообщение отправлено: мягкий «вжух» вверх — шум через полосовой фильтр
// со скольжением частоты и тихий синусовый «свуп» в ту же сторону.
const send = () => {
  const dur = 0.35;
  const y = new Float32Array(samples(dur));
  const noise = noiseSource(4621);
  const bp = svf("bp");
  let ph = 0;
  for (let i = 0; i < y.length; i++) {
    const p = i / y.length;
    const env = p < 0.6 ? (p / 0.6) ** 1.5 : Math.exp(-(p - 0.6) / 0.12);
    ph += (TAU * 550 * 2.6 ** p) / SR;
    y[i] = env * (0.8 * bp(noise(), 700 * 6 ** Math.min(1, p / 0.8), 1.5) + 0.12 * Math.sin(ph));
  }
  save("send", y, -9);
};

// Пряжка ремня безопасности: два коротких металлических щелчка «клик-клак» —
// негармонические резонансы металла, короткий шумовой удар и глухое «тело».
const click = () => {
  const y = new Float32Array(samples(0.2));
  const noise = noiseSource(4622);
  const clack = (start, amp, pitch) => {
    const metal = [
      [2600, 1, 0.012],
      [3950, 0.6, 0.009],
      [5800, 0.4, 0.006],
      [8300, 0.2, 0.004],
    ];
    for (const [hz, a, tau] of metal) ping(y, start, hz * pitch, amp * 0.6 * a, tau, 0.0003);
    ping(y, start, 160, amp * 0.4, 0.01, 0.0005);
    const s0 = samples(start);
    for (let i = 0; i < samples(0.005); i++) y[s0 + i] += amp * 0.5 * noise() * Math.exp(-i / SR / 0.0008);
  };
  clack(0.0, 0.7, 1);
  clack(0.075, 1, 1.08);
  save("click", y, -9);
};

// Машина подъезжает и мягко останавливается: низкий гул мотора (частота
// «зажиганий» плавно падает — как эффект Доплера и сброс газа), шорох шин,
// который стихает вместе со скоростью, и лёгкое покачивание кузова на стопе.
const car = () => {
  const dur = 2.5;
  const y = new Float32Array(samples(dur));
  const noise = noiseSource(4623);
  const stopT = 1.9;
  const smooth = (a, b, t) => {
    const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
    return x * x * (3 - 2 * x);
  };
  const speedAt = (t) =>
    t < 0.9 ? 1 : t < stopT ? 0.5 * (1 + Math.cos((Math.PI * (t - 0.9)) / (stopT - 0.9))) : 0;
  const tire = svf("lp");
  const tireHi = svf("bp");
  const rough = svf("lp");
  let ph = 0;
  for (let i = 0; i < y.length; i++) {
    const t = i / SR;
    const s = speedAt(t);
    const near = smooth(0, 1.1, t);
    const hz = 40 + 28 * s - 6 * smooth(0, 0.9, t) * s;
    ph += (TAU * hz) / SR;
    const engine =
      0.6 * Math.sin(ph) +
      0.45 * Math.sin(2 * ph) +
      0.22 * Math.sin(3 * ph) +
      0.12 * Math.sin(4 * ph) +
      0.05 * Math.sin(6 * ph);
    const unevenness = 1 + 0.6 * rough(noise(), 30, 0.7);
    const fade = t < 2.05 ? 1 : Math.cos(((Math.min(t, dur) - 2.05) / 0.45) * (Math.PI / 2)) ** 2;
    const level = near * (0.45 + 0.55 * s) * fade;
    const n = noise();
    y[i] = 0.5 * level * engine * unevenness + s * near * (0.5 * tire(n, 450, 0.7) + 0.08 * tireHi(n, 1100, 1));
  }
  ping(y, stopT, 70, 0.25, 0.06, 0.01);
  biquad(y, "lowpass", 900);
  biquad(y, "highpass", 30);
  save("car", y, -7);
};

// Финальная карточка: мягкий двухнотный колокольчик до–фа (C6 → F6).
const chime = () => {
  const y = new Float32Array(samples(1.0));
  const bell = (start, hz, amp) => {
    ping(y, start, hz, amp, 0.32, 0.003);
    ping(y, start, hz * 2, amp * 0.12, 0.2, 0.003);
    ping(y, start, hz * 2.76, amp * 0.18, 0.1, 0.003);
    ping(y, start, hz * 5.4, amp * 0.05, 0.04, 0.003);
  };
  bell(0, 1046.5, 0.8);
  bell(0.15, 1396.9, 0.7);
  const nf = samples(0.15);
  for (let i = 0; i < nf; i++) y[y.length - 1 - i] *= i / nf;
  save("chime", y, -6);
};

// Мягкий переход: шум через двухполюсный НЧ-фильтр, частота среза
// поднимается и опускается вместе с громкостью.
const whoosh = () => {
  const y = new Float32Array(samples(0.5));
  const noise = noiseSource(4624);
  let y1 = 0;
  let y2 = 0;
  for (let i = 0; i < y.length; i++) {
    const p = i / y.length;
    const a = 1 - Math.exp((-TAU * (300 + 2600 * Math.sin(p * Math.PI) ** 2)) / SR);
    y1 += a * (noise() - y1);
    y2 += a * (y1 - y2);
    y[i] = y2 * Math.sin(p * Math.PI) ** 1.5;
  }
  save("whoosh", y, -9);
};

// Шаги по деревянному полу в доме: глухой удар пятки (низкий синус с быстрым
// спадом высоты) + короткий резонанс доски + лёгкое шарканье; через ~40 мс —
// более тихий перекат на носок. Варианты отличаются высотой, резонансом доски
// и силой, чтобы шаги не звучали одинаково.
const STEPS = [
  { f0: 95, board: 520, toe: 0.042, scuff: 0.1, amp: 1 },
  { f0: 104, board: 600, toe: 0.036, scuff: 0.07, amp: 0.92 },
  { f0: 88, board: 470, toe: 0.047, scuff: 0.13, amp: 0.96 },
  { f0: 112, board: 660, toe: 0.039, scuff: 0.09, amp: 0.88 },
];
const step = (k) => {
  const v = STEPS[k];
  const y = new Float32Array(samples(0.15));
  const noise = noiseSource(4630 + k);
  const impact = (start, amp, f0, board) => {
    const s0 = samples(start);
    const bp = svf("bp");
    let ph = 0;
    for (let i = 0; i < y.length - s0; i++) {
      const t = i / SR;
      ph += (TAU * f0 * (1 + 0.6 * Math.exp(-t / 0.006))) / SR;
      const thump = Math.sin(ph) * Math.min(1, t / 0.0015) * Math.exp(-t / 0.022);
      const knock = bp(noise(), board, 4) * Math.exp(-t / 0.016);
      y[s0 + i] += amp * (thump + 0.7 * knock);
    }
  };
  impact(0, 1, v.f0, v.board);
  impact(v.toe, 0.4, v.f0 * 1.15, v.board * 1.2);
  const hp = svf("hp");
  for (let i = 0; i < samples(0.05); i++) y[i] += v.scuff * hp(noise(), 2500, 0.7) * Math.exp(-i / SR / 0.012);
  biquad(y, "lowpass", 3500);
  save(`step-${k}`, y, Number((-11 + 20 * Math.log10(v.amp)).toFixed(1)));
};

// Тиканье часов: короткий сухой «тик» — два высоких резонанса механизма
// и глуховатый призвук корпуса.
const tick = () => {
  const y = new Float32Array(samples(0.1));
  const noise = noiseSource(4625);
  ping(y, 0, 2400, 0.8, 0.004, 0.0002);
  ping(y, 0, 3800, 0.4, 0.0025, 0.0002);
  ping(y, 0, 900, 0.3, 0.006, 0.0002);
  for (let i = 0; i < samples(0.003); i++) y[i] += 0.3 * noise() * Math.exp(-i / SR / 0.0005);
  save("tick", y, -11);
};

const ALL = {
  zip,
  wake,
  boing,
  pop,
  paper,
  flip,
  tap,
  type: typing,
  send,
  click,
  car,
  chime,
  whoosh,
  step: () => STEPS.forEach((_, k) => step(k)),
  tick,
};
const only = process.argv.slice(2);
for (const name of only.length ? only : Object.keys(ALL)) {
  if (!ALL[name]) throw new Error(`Неизвестный эффект: ${name}`);
  ALL[name]();
}
