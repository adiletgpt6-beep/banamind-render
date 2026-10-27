// Фоновая музыка ролика BG-046 «Мектеп сумкасынын монологу»: говорящий жёлтый
// школьный рюкзак рассказывает добрую сказку о школьных утрах в Бишкеке.
// Всё звучание синтезируется кодом (аддитивный синтез, Карплус–Стронг, фильтры,
// задержка и реверберация на JS) — без сэмплов, загрузок и платных сервисов,
// поэтому музыку можно использовать в рекламе без лицензионных ограничений.
// Результат детерминирован: случайности задаёт mulberry32 с фиксированным
// зерном, файлы одинаковы при каждом запуске.
//
// Фа мажор, 96 BPM, без ударных; оба трека — одна гармоническая семья:
//   music-tale.mp3 (47 с) — сказочный мотив «музыкальной шкатулки», редкие
//                           высокие ноты челесты, мягкое пиццикато и тёплый
//                           низкий пэд (первая половина ролика);
//   music-warm.mp3 (67 с) — теплее и светлее: щипковый бас, очень тихая
//                           «щёточная» фактура, мелодия шкатулки продолжается
//                           и вспоминает мотив сказки (решение и финальный
//                           экран с контактами); с 65 с звенит последний аккорд.
// Длина взята с запасом: ролик может растянуться под реальную озвучку.
// Полоса речи (300 Гц–3 кГц) разгружена: тихая динамика, яркие ноты редкие,
// пэд низкий и тёмный, «блеск» шкатулки вынесен в обертоны выше 3 кГц,
// на мастере мягкий широкий вырез около 1,1 кГц.
// Затуханий в начале и в конце нет — громкостью управляет Remotion
// (в самом конце файла только 30 мс против щелчка).
// Стерео, 44,1 кГц, пик −3 дБFS, MP3 192 кбит/с → public/audio/campaign50/bg-046/.
//
// Запуск: node scripts/campaign50/bg-046/music.mjs        — оба трека
//         node scripts/campaign50/bg-046/music.mjs tale   — только music-tale.mp3
//         node scripts/campaign50/bg-046/music.mjs warm   — только music-warm.mp3
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  SAMPLE_RATE as SR,
  mulberry32,
  normalizePeak,
  wavToMp3,
  writeWav,
} from "./audio.mjs";

const OUT = "public/audio/campaign50/bg-046";
const TMP = join(tmpdir(), "balago-bg046-music");
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

const TAU = Math.PI * 2;
const BPM = 96;
const BEAT = 60 / BPM; // 0,625 с
const BAR = BEAT * 4; // 2,5 с
const EIGHTH = BEAT / 2;

const samples = (sec) => Math.round(sec * SR);
const midiToHz = (m) => 440 * 2 ** ((m - 69) / 12);
const dbToGain = (db) => 10 ** (db / 20);
const panGains = (pan) => [
  Math.cos(((pan + 1) * Math.PI) / 4),
  Math.sin(((pan + 1) * Math.PI) / 4),
];
const stereo = (n) => [new Float32Array(n), new Float32Array(n)];

// ---------- Нотная запись ----------
// Такт — строка «C6:2 A5:2 r:4»: нота:длительность в восьмых, «r» — пауза,
// «*» перед нотой — тихая нота, «A5+C6:8» — несколько нот одновременно.
const PITCH = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const noteToMidi = (name) => {
  const m = /^([A-G])([b#]?)(\d)$/.exec(name);
  if (!m) throw new Error(`Неизвестная нота: ${name}`);
  const acc = m[2] === "b" ? -1 : m[2] === "#" ? 1 : 0;
  return 12 * (Number(m[3]) + 1) + PITCH[m[1]] + acc;
};
// Ноты партии: { bar, pos (в восьмых от начала такта), midi, vel }.
const parseLine = (bars) =>
  bars.flatMap((str, bar) => {
    const notes = [];
    let pos = 0;
    for (const tok of str.trim().split(/\s+/).filter(Boolean)) {
      const [name, dur] = tok.split(":");
      if (name !== "r") {
        const soft = name.startsWith("*");
        for (const n of name.replace("*", "").split("+"))
          notes.push({ bar, pos, midi: noteToMidi(n), vel: soft ? 0.45 : 1 });
      }
      pos += Number(dur);
    }
    if (pos > 8) throw new Error(`Такт ${bar + 1} длиннее 4/4: «${str}»`);
    return notes;
  });

// ---------- Гармония ----------
// bass — нижняя нота (2-я октава), b5 — вторая нота баса на 3-ю долю,
// pad — голоса пэда (3-я октава, тёмные и тёплые), pz — ноты пиццикато.
const CHORDS = {
  F: { bass: 41, b5: 48, pad: [53, 57, 60], pz: [53, 57, 60, 65] },
  Dm: { bass: 38, b5: 45, pad: [53, 57, 62], pz: [50, 53, 57, 62] },
  Gm7: { bass: 43, b5: 50, pad: [53, 58, 62], pz: [55, 58, 62, 65] },
  C: { bass: 36, b5: 43, pad: [52, 55, 60], pz: [48, 52, 55, 60] },
  C7: { bass: 36, b5: 46, pad: [52, 58, 60], pz: [48, 52, 55, 58] },
  Am: { bass: 45, b5: 40, pad: [52, 57, 60], pz: [45, 52, 57, 60] },
  Bb: { bass: 46, b5: 41, pad: [53, 58, 62], pz: [46, 53, 58, 62] },
  "C/E": { bass: 40, b5: 43, pad: [52, 55, 60], pz: [52, 55, 60, 64] },
};

// ---------- «Сказка» (music-tale): F–Dm–Gm7–C | F–Am–Bb–C7, дважды и ещё ----------
const TALE = {
  name: "music-tale",
  duration: 47,
  seed: 4601,
  warm: false,
  chords: [
    ...["F", "Dm", "Gm7", "C", "F", "Am", "Bb", "C7"],
    ...["F", "Dm", "Gm7", "C", "F", "Am", "Bb", "C7"],
    ...["F", "Dm", "Gm7"], // запас длины: тихое продолжение
  ],
  // мотив шкатулки: «соль–ми–до–ми» трезвучия вниз и обратно, колыбельный
  melody: [
    "C6:2 A5:2 F5:2 A5:2",
    "C6:6 D6:2",
    "Bb5:2 G5:2 F5:2 G5:2",
    "G5:6 r:2",
    "C6:2 A5:2 F5:2 A5:2",
    "C6:4 E6:2 C6:2",
    "D6:2 C6:2 Bb5:2 G5:2",
    "E5:2 G5:2 Bb5:4",
    // второй раз — реже, с «искоркой» в 14-м такте
    "A5:4 C6:4",
    "D6:2 C6:2 A5:4",
    "Bb5:2 G5:2 F5:2 G5:2",
    "G5:4 E5:2 G5:2",
    "C6:2 A5:2 F5:2 A5:2",
    "C6:6 *A6:1 *C7:1",
    "D6:2 C6:2 Bb5:2 G5:2",
    "E5:2 G5:2 Bb5:4",
    "A5:8",
    "r:4 D6:2 C6:2",
    "Bb5:4 G5:4",
  ],
  // челеста отвечает редкими высокими нотами там, где мелодия держит звук
  celesta: [
    "",
    "r:3 *F6:5",
    "",
    "r:4 E6:2 G6:2",
    "",
    "",
    "",
    "r:6 E6:1 G6:1",
    "",
    "r:5 F6:1 A6:2",
    "",
    "r:3 *G6:5",
    "",
    "",
    "",
    "r:6 E6:1 Bb6:1",
    "",
    "r:1 *F6:3",
    "r:6 *D6:2",
  ],
  // баланс дорожек: среднеквадратичный уровень, дБ (до общей нормализации)
  levels: { pad: -21, box: -25.5, cel: -32, pizz: -28 },
  padCutoff: 720,
  reverbDb: -8,
};

// ---------- «Тепло» (music-warm): та же тональность, светлее и полнее ----------
const WARM = {
  name: "music-warm",
  duration: 67,
  seed: 4602,
  warm: true,
  chords: [
    ...["F", "C/E", "Dm", "Bb", "Gm7", "C", "F", "C7"],
    ...["Bb", "C", "Am", "Dm", "Bb", "C", "F", "Dm"],
    ...["F", "C/E", "Dm", "Bb", "Gm7", "C"],
    ...["Bb", "Gm7", "C7", "F"],
    "F", // финальный аккорд (65 с) звенит и гаснет сам
  ],
  melody: [
    "A5:2 C6:2 F6:4",
    "E6:3 D6:1 C6:4",
    "D6:4 A5:2 D6:2",
    "C6:6 Bb5:2",
    "Bb5:2 D6:2 F6:2 D6:2",
    "E6:4 C6:4",
    "A5:2 C6:2 F6:2 E6:2",
    "D6:2 C6:2 Bb5:2 G5:2",
    // светлая середина: мелодия поднимается
    "D6:2 Bb5:2 F5:2 Bb5:2",
    "E6:6 G6:2",
    "E6:2 C6:2 A5:2 C6:2",
    "D6:4 F6:4",
    "F6:2 D6:2 Bb5:2 D6:2",
    "E6:2 G6:2 E6:2 C6:2",
    "F6:6 *C7:1 *F7:1",
    "C6:2 A5:2 F5:2 A5:2", // мотив сказки возвращается
    // лёгкий повтор начала
    "A5:2 C6:2 F6:2 C6:2",
    "G5:2 C6:2 E6:4",
    "F6:4 D6:2 A5:2",
    "Bb5:6 *D6:1 *F6:1",
    "D6:2 Bb5:2 G5:2 Bb5:2",
    "C6:4 E6:4",
    // спокойное окончание под финальный экран
    "D6:4 Bb5:4",
    "Bb5:2 G5:2 F5:4",
    "E5:2 G5:2 Bb5:4",
    "A5:4 C6:4",
    "F6:8",
  ],
  // челеста: ответы в начале, в середине — долгие терции аккордов (тёплая
  // подголосочная линия D–E–C–F–D–E–A), в конце — мягкий аккорд
  celesta: [
    "",
    "r:5 *G6:3",
    "",
    "r:3 *F6:5",
    "",
    "r:5 *G6:3",
    "",
    "r:7 *E6:1",
    "D5:8",
    "E5:8",
    "C5:8",
    "F5:8",
    "D5:8",
    "E5:8",
    "A5:8",
    "r:4 *F6:4",
    "*A5:8",
    "",
    "*F5:8",
    "",
    "*D5:8",
    "r:6 E6:1 G6:1",
    "r:4 *F6:4",
    "",
    "r:6 E6:1 G6:1",
    "",
    "*A5+C6:8",
  ],
  levels: { pad: -20, box: -25.5, cel: -30, pizz: -29, bass: -24, brush: -40 },
  padCutoff: 1000,
  reverbDb: -10,
};

// ---------- Фильтры и эффекты ----------
// Биквад-фильтр по формулам RBJ Audio EQ Cookbook; обрабатывает буфер на месте.
const biquad = (buf, type, f, q = 0.707, gainDb = 0) => {
  const w = (TAU * f) / SR;
  const cos = Math.cos(w);
  const alpha = Math.sin(w) / (2 * q);
  const A = 10 ** (gainDb / 40);
  let b0, b1, b2, a0, a1, a2;
  if (type === "lowpass") {
    [b0, b1, b2] = [(1 - cos) / 2, 1 - cos, (1 - cos) / 2];
    [a0, a1, a2] = [1 + alpha, -2 * cos, 1 - alpha];
  } else if (type === "highpass") {
    [b0, b1, b2] = [(1 + cos) / 2, -(1 + cos), (1 + cos) / 2];
    [a0, a1, a2] = [1 + alpha, -2 * cos, 1 - alpha];
  } else if (type === "peak") {
    [b0, b1, b2] = [1 + alpha * A, -2 * cos, 1 - alpha * A];
    [a0, a1, a2] = [1 + alpha / A, -2 * cos, 1 - alpha / A];
  } else throw new Error(`Неизвестный фильтр: ${type}`);
  let x1 = 0;
  let x2 = 0;
  let y1 = 0;
  let y2 = 0;
  for (let i = 0; i < buf.length; i++) {
    const x = buf[i];
    const y = (b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1;
    x1 = x;
    y2 = y1;
    y1 = y;
    buf[i] = y;
  }
  return buf;
};

const rms = (chs) => {
  let sum = 0;
  let count = 0;
  for (const ch of chs) {
    for (const v of ch) sum += v * v;
    count += ch.length;
  }
  return Math.sqrt(sum / count);
};
const scale = (chs, g) => {
  for (const ch of chs) for (let i = 0; i < ch.length; i++) ch[i] *= g;
};

// Пинг-понг задержка: эхо поочерёдно слева и справа, каждое повторение
// темнее предыдущего (НЧ-фильтр в петле) — «волшебное» пространство шкатулки.
const pingPong = ([L, R], time, feedback, mix, lowpassHz) => {
  const d = samples(time);
  const bufL = new Float32Array(d);
  const bufR = new Float32Array(d);
  const a = 1 - Math.exp((-TAU * lowpassHz) / SR);
  let zl = 0;
  let zr = 0;
  for (let s = 0, i = 0; s < L.length; s++, i = (i + 1) % d) {
    const outL = bufL[i];
    const outR = bufR[i];
    zl += a * ((L[s] + R[s]) * 0.5 + outR * feedback - zl);
    zr += a * (outL * feedback - zr);
    bufL[i] = zl;
    bufR[i] = zr;
    L[s] += outL * mix;
    R[s] += outR * mix;
  }
};

// Реверберация по схеме Freeverb: 8 гребенчатых фильтров с затуханием ВЧ
// и 4 всепропускающих; у правого канала задержки длиннее на 23 отсчёта —
// это даёт естественную стереоширину хвоста.
const freeverb = (input, { room = 0.86, damp = 0.35 } = {}) => {
  const COMBS = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617];
  const ALLPASS = [556, 441, 341, 225];
  return [0, 23].map((spread) => {
    const out = new Float32Array(input.length);
    const combs = COMBS.map((d) => ({
      buf: new Float32Array(d + spread),
      i: 0,
      z: 0,
    }));
    const aps = ALLPASS.map((d) => ({ buf: new Float32Array(d + spread), i: 0 }));
    for (let s = 0; s < input.length; s++) {
      const x = input[s];
      let acc = 0;
      for (const c of combs) {
        const o = c.buf[c.i];
        c.z = o * (1 - damp) + c.z * damp;
        c.buf[c.i] = x + c.z * room;
        if (++c.i === c.buf.length) c.i = 0;
        acc += o;
      }
      for (const ap of aps) {
        const b = ap.buf[ap.i];
        ap.buf[ap.i] = acc + b * 0.5;
        acc = b - acc;
        if (++ap.i === ap.buf.length) ap.i = 0;
      }
      out[s] = acc;
    }
    return out;
  });
};

// ---------- Инструменты ----------
// Добавляет моно-звук в стерео-дорожку с панорамой.
const place = (stem, start, mono, amp, pan) => {
  const s0 = samples(start);
  const [gl, gr] = panGains(pan);
  const n = stem[0].length;
  for (let i = Math.max(0, -s0); i < mono.length && s0 + i < n; i++) {
    stem[0][s0 + i] += mono[i] * amp * gl;
    stem[1][s0 + i] += mono[i] * amp * gr;
  }
};

// Мягкий вход и короткий выход, чтобы обрезанный хвост не щёлкал.
const edges = (y, attack, fadeOut = 0.03) => {
  const na = samples(attack);
  for (let i = 0; i < na && i < y.length; i++) y[i] *= i / na;
  const nf = Math.min(samples(fadeOut), y.length);
  for (let i = 0; i < nf; i++) y[y.length - 1 - i] *= i / nf;
  return y;
};

// Аддитивный «ударный» металлический тембр: синусоиды с экспоненциальным
// затуханием. partials: [множитель частоты, громкость, τ затухания в секундах].
const struckTone = (hz, partials, attack) => {
  const longest = Math.max(...partials.map((p) => p[2]));
  const n = samples(Math.min(4.5, longest * 5));
  const y = new Float32Array(n);
  for (const [ratio, amp, tau] of partials) {
    const f = hz * ratio;
    if (f > 16000) continue;
    const w = (TAU * f) / SR;
    const k = Math.exp(-1 / (tau * SR));
    let env = amp;
    for (let i = 0; i < n && env > 1e-5; i++) {
      y[i] += Math.sin(w * i) * env;
      env *= k;
    }
  }
  return edges(y, attack);
};

// «Музыкальная шкатулка»: стальной язычок гребёнки. Основной тон звенит долго,
// пара почти совпадающих частот даёт живые биения, а негармонические обертоны
// 6,27 и 17,55 (как у консольной пластинки) быстро гаснут — это «дзинь» атаки.
const musicBox = (midi) => {
  const hz = midiToHz(midi);
  const tau = 1.4 * (523 / hz) ** 0.35;
  return struckTone(
    hz,
    [
      [1, 1, tau],
      [1.0017, 0.22, tau * 0.8],
      [2, 0.06, tau * 0.3],
      [6.27, 0.4, 0.08],
      [17.55, 0.08, 0.025],
    ],
    0.0015,
  );
};

// Челеста: молоточек с войлоком по пластине с резонатором — атака мягче,
// обертоны гармоничные и короткие.
const celesta = (midi) => {
  const hz = midiToHz(midi);
  const tau = 1.1 * (523 / hz) ** 0.4;
  return struckTone(
    hz,
    [
      [1, 1, tau],
      [2, 0.14, tau * 0.35],
      [3, 0.04, tau * 0.2],
      [4.16, 0.06, 0.06],
      [6.1, 0.03, 0.03],
    ],
    0.004,
  );
};

// Щипок струны по алгоритму Карплуса–Стронга: шумовой импульс циркулирует
// в линии задержки длиной в период; усреднение соседних отсчётов гасит верхние
// гармоники — так получается естественное затухание струны. Дробную часть
// периода добирает всепропускающий фильтр, чтобы нота не фальшивила.
// soft — насколько сглажен импульс (больше — мягче и темнее щипок).
const ksPluck = (hz, { dur, rho, soft, rand }) => {
  const period = SR / hz - 0.5; // 0,5 отсчёта — задержка усреднителя
  const N = Math.max(2, Math.floor(period - 0.1));
  const frac = period - N; // 0,1…1,1 — устойчивая настройка всепропускающего
  const C = (1 - frac) / (1 + frac);
  const line = new Float32Array(N);
  let z = 0;
  let mean = 0;
  for (let i = 0; i < N; i++) {
    z += (1 - soft) * (rand() * 2 - 1 - z);
    line[i] = z;
    mean += z / N;
  }
  let peak = 0;
  for (let i = 0; i < N; i++) {
    line[i] -= mean;
    peak = Math.max(peak, Math.abs(line[i]));
  }
  for (let i = 0; i < N; i++) line[i] /= peak || 1;
  const y = new Float32Array(samples(dur));
  let ptr = 0;
  let prev = 0;
  let apX = 0;
  let apY = 0;
  for (let i = 0; i < y.length; i++) {
    const x = line[ptr];
    y[i] = x;
    const avg = 0.5 * (x + prev);
    prev = x;
    const ap = C * avg + apX - C * apY;
    apX = avg;
    apY = ap;
    line[ptr] = rho * ap;
    ptr = (ptr + 1) % N;
  }
  return y;
};

// Пиццикато струнных: короткий мягкий щипок, палец быстро глушит струну.
const pizzicato = (midi, rand) => {
  const y = ksPluck(midiToHz(midi), { dur: 1.3, rho: 0.995, soft: 0.55, rand });
  for (let i = 0; i < y.length; i++) y[i] *= Math.exp(-i / (0.32 * SR));
  return edges(y, 0.002);
};

// Мягкий щипковый бас (как контрабас пальцами): тёмный импульс, долгий звук.
const pluckBass = (midi, rand, dur = 2.2) => {
  const y = ksPluck(midiToHz(midi), { dur, rho: 0.998, soft: 0.8, rand });
  for (let i = 0; i < y.length; i++) y[i] *= Math.exp(-i / (0.75 * SR));
  return edges(y, 0.004);
};

// Пила без алиасинга (polyBLEP сглаживает скачок формы волны).
const polyBlep = (t, dt) => {
  if (t < dt) {
    const x = t / dt;
    return x + x - x * x - 1;
  }
  if (t > 1 - dt) {
    const x = (t - 1) / dt;
    return x * x + x + x + 1;
  }
  return 0;
};

// Голос пэда: смесь пилы и синуса (или чистый синус для суб-баса) с медленной
// атакой и долгим отпуском; соседние аккорды плавно перетекают друг в друга.
const padVoice = (stem, opts) => {
  const { start, hold, midi, amp, pan, cents = 0, attack, release, phase } = opts;
  const hz = midiToHz(midi) * 2 ** (cents / 1200);
  const dt = hz / SR;
  const s0 = samples(start);
  const total = samples(hold + release);
  const [gl, gr] = panGains(pan);
  const n = stem[0].length;
  let ph = phase;
  for (let i = 0; i < total && s0 + i < n; i++) {
    const t = i / SR;
    let env;
    if (t < attack) env = Math.sin(((t / attack) * Math.PI) / 2) ** 2;
    else if (t < hold) env = 1;
    else env = Math.cos((((t - hold) / release) * Math.PI) / 2) ** 2;
    const sine = Math.sin(TAU * ph);
    const v = opts.sine ? sine : 0.6 * (2 * ph - 1 - polyBlep(ph, dt)) + 0.4 * sine;
    ph += dt;
    if (ph >= 1) ph -= 1;
    stem[0][s0 + i] += v * env * amp * gl;
    stem[1][s0 + i] += v * env * amp * gr;
  }
};

// Шумовой всплеск для «щёточной» фактуры (вся дорожка потом проходит через
// полосовой фильтр — остаётся лёгкое шуршание выше полосы речи).
const noiseBurst = (stem, start, attack, tau, amp, pan, rand) => {
  const s0 = samples(start);
  const [gl, gr] = panGains(pan);
  const total = samples(attack + tau * 5);
  const n = stem[0].length;
  for (let i = 0; i < total && s0 + i < n; i++) {
    const t = i / SR;
    const env =
      t < attack ? Math.sin(((t / attack) * Math.PI) / 2) : Math.exp(-(t - attack) / tau);
    const v = (rand() * 2 - 1) * env * amp;
    stem[0][s0 + i] += v * gl;
    stem[1][s0 + i] += v * gr;
  }
};

// ---------- Сборка трека ----------
const PIZZ_PATTERN = [
  // [позиция в восьмых, номер ноты в pz, сила] — «раз … и-два три … четыре»
  [0, 0, 1],
  [3, 1, 0.45],
  [4, 2, 0.75],
  [6, 3, 0.5],
];
// Сколько каждой дорожки уходит в реверберацию.
const SENDS = { pad: 0.3, box: 1, cel: 1, pizz: 0.6, bass: 0.1, brush: 0.4 };

const buildTrack = (song) => {
  const { name, duration, chords, warm } = song;
  for (const part of ["melody", "celesta"])
    if (song[part].length !== chords.length)
      throw new Error(`${name}: в партии ${part} ${song[part].length} тактов, аккордов ${chords.length}`);
  if (chords.length * BAR < duration) throw new Error(`${name}: аккордов меньше длины трека`);
  const n = samples(duration);
  const rand = mulberry32(song.seed);
  const jitter = (sec) => (rand() * 2 - 1) * sec;
  const human = () => 0.92 + 0.16 * rand();
  const stems = Object.fromEntries(
    ["pad", "box", "cel", "pizz", "bass", "brush"].map((k) => [k, stereo(n)]),
  );
  const at = (bar, pos) => bar * BAR + pos * EIGHTH;

  chords.forEach((key, bar) => {
    const ch = CHORDS[key];
    const t0 = at(bar, 0);
    const final = warm && bar === chords.length - 1;
    const hold = final ? BAR * 0.5 : BAR;
    const release = final ? 1.6 : 1.3;
    // пэд: каждая нота — две слегка расстроенные пилы, разведённые по сторонам
    ch.pad.forEach((m, k) => {
      const side = k % 2 ? 1 : -1;
      for (const [cents, pan] of [
        [6, -0.5 * side],
        [-6, 0.5 * side],
      ])
        padVoice(stems.pad, {
          start: t0,
          hold,
          midi: m,
          amp: 1,
          pan,
          cents,
          attack: 1.0,
          release,
          phase: rand(),
        });
    });
    // тёплый суб-бас пэда (чистый синус) и, в «тепле», мягкий верхний голос
    padVoice(stems.pad, {
      start: t0,
      hold,
      midi: ch.bass,
      amp: 0.9,
      pan: 0,
      attack: 0.8,
      release,
      phase: rand(),
      sine: true,
    });
    if (warm)
      padVoice(stems.pad, {
        start: t0,
        hold,
        midi: ch.pad[2] + 12,
        amp: 0.35,
        pan: 0,
        cents: 3,
        attack: 1.2,
        release,
        phase: rand(),
      });

    // пиццикато
    for (const [pos, idx, vel] of final ? [[0, 0, 1]] : PIZZ_PATTERN)
      place(
        stems.pizz,
        at(bar, pos) + jitter(0.006),
        pizzicato(ch.pz[idx], rand),
        vel * human(),
        -0.3 + jitter(0.15),
      );

    if (!warm) return;
    // щипковый бас: основной тон на «раз», вторая нота на «три»
    place(stems.bass, t0 + jitter(0.004), pluckBass(ch.bass, rand, final ? 3 : 2.2), human(), 0);
    if (final || bar === 0) return;
    place(stems.bass, at(bar, 4) + jitter(0.004), pluckBass(ch.b5, rand), 0.6 * human(), 0);
    // щётка: мягкий «шорох» на 2-ю и 4-ю доли и едва слышный шейкер восьмыми
    for (const pos of [2, 6])
      noiseBurst(stems.brush, at(bar, pos) + jitter(0.005), 0.04, 0.07, human(), 0.25, rand);
    for (let pos = 0; pos < 8; pos++)
      noiseBurst(
        stems.brush,
        at(bar, pos) + jitter(0.004),
        0.003,
        0.018,
        (pos % 2 ? 0.5 : 0.3) * human(),
        pos % 2 ? -0.35 : 0.35,
        rand,
      );
  });

  // мелодия шкатулки (почти механически точная, как настоящий валик) и челеста
  for (const nt of parseLine(song.melody))
    place(
      stems.box,
      at(nt.bar, nt.pos) + jitter(0.003),
      musicBox(nt.midi),
      nt.vel * human(),
      jitter(0.25),
    );
  for (const nt of parseLine(song.celesta))
    place(
      stems.cel,
      at(nt.bar, nt.pos) + jitter(0.004),
      celesta(nt.midi),
      nt.vel * human(),
      0.35 + jitter(0.15),
    );

  // тембр дорожек
  for (const ch of stems.pad) {
    biquad(ch, "lowpass", song.padCutoff, 0.6);
    biquad(ch, "lowpass", song.padCutoff, 0.6);
    // медленное «дыхание» пэда
    for (let i = 0; i < ch.length; i++) ch[i] *= 1 + 0.07 * Math.sin((TAU * 0.1 * i) / SR);
  }
  for (const ch of stems.pizz) biquad(ch, "lowpass", 2000, 0.7);
  for (const ch of stems.bass) biquad(ch, "lowpass", 800, 0.7);
  for (const ch of stems.brush) {
    biquad(ch, "highpass", 2500, 0.7);
    biquad(ch, "lowpass", 8000, 0.7);
  }

  // баланс: каждую дорожку — к своему среднеквадратичному уровню
  const used = Object.keys(song.levels);
  for (const k of used) scale(stems[k], dbToGain(song.levels[k]) / rms(stems[k]));

  // эхо шкатулки и челесты (пунктирная восьмая)
  pingPong(stems.box, EIGHTH * 1.5, 0.32, 0.22, 3500);
  pingPong(stems.cel, EIGHTH * 1.5, 0.3, 0.18, 3500);

  // сухой микс и посыл в реверберацию
  const mix = stereo(n);
  const send = new Float32Array(n);
  for (const k of used) {
    const [L, R] = stems[k];
    for (let i = 0; i < n; i++) {
      mix[0][i] += L[i];
      mix[1][i] += R[i];
      send[i] += (L[i] + R[i]) * 0.5 * SENDS[k];
    }
  }
  biquad(send, "highpass", 250, 0.7); // без гулкого низа
  biquad(send, "lowpass", 5500, 0.7);
  const wet = freeverb(send);
  const wetGain = (dbToGain(song.reverbDb) * rms(mix)) / rms(wet);
  const preDelay = samples(0.018);
  for (let c = 0; c < 2; c++)
    for (let i = 0; i + preDelay < n; i++) mix[c][i + preDelay] += wet[c][i] * wetGain;

  // мастер: срез инфранизов и мягкий вырез в середине полосы речи
  for (const ch of mix) {
    biquad(ch, "highpass", 30, 0.7);
    biquad(ch, "peak", 1100, 0.6, -3);
  }
  normalizePeak(mix, -3);
  for (const ch of mix) edges(ch, 0, 0.03);

  const wav = join(TMP, `${name}.wav`);
  writeWav(wav, mix);
  wavToMp3(wav, join(OUT, `${name}.mp3`));
  console.log(`+ ${OUT}/${name}.mp3 (${duration} с)`);
};

const only = process.argv[2];
for (const [key, song] of [
  ["tale", TALE],
  ["warm", WARM],
])
  if (!only || only === key) buildTrack(song);
