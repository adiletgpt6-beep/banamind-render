// Монтаж BalaGoFirstLiveReel: куски исходника, punch-in, тайминги слов.
//
// Все тайминги речи — в секундах ИСХОДНИКА (public/live/source.mp4,
// 35.75 с). Они найдены по реальной звукозаписи: границы фраз — по паузам
// (ffmpeg silencedetect), слова внутри фраз — по слоговым пикам огибающей.
// Перевод в кадры готового ролика — функция outFrame().
import { FACE_TRACK } from "./faceTrack";

export const LIVE_VIDEO = {
  id: "BalaGoFirstLiveReel",
  width: 1080,
  height: 1920,
  fps: 30,
} as const;

// Подготовленные файлы (npm run live:prepare).
export const LIVE_FILES = {
  video: "live/first-live-graded.mp4",
  voice: "live/first-live-voice.wav",
} as const;

// Нижняя граница зоны графики/субтитров: ниже начинается интерфейс
// Instagram Reels (ник, подпись, музыка).
export const STAGE_BOTTOM = 1530;

// ---------- Куски исходника (jump-cuts) и виртуальная камера ----------
// [from, to) в кадрах исходника (30 fps). Срезаны только паузы: начальная
// тишина и паузы ≥ 0.45 с между смысловыми частями (остаётся ≈ 0.25–0.3 с).
//
// cam — ключи «оператора» внутри куска (время — секунды исходника):
//   s  — масштаб кадра (1.0 … 1.07), никогда не меньше 1 (без чёрных полей);
//   v  — вертикальная привязка: 0 — верх исходника в кадре (лоб не режется),
//        1 — низ исходника в кадре (лицо выше, под ним больше места);
//   dx — лёгкая панорама относительно центра лица (px исходника).
// Между ключами — плавная S-кривая; на склейке камера «переставляется»,
// как при смене плана. Ключ без поля повторяет предыдущее значение.
export type CamKey = {
  readonly t: number;
  readonly s?: number;
  readonly v?: number;
  readonly dx?: number;
};

export type Segment = {
  readonly from: number;
  readonly to: number;
  readonly cam: readonly CamKey[];
};

export const SEGMENTS: readonly Segment[] = [
  // «Бишкекте жаңы өзгөчө кызмат пайда болду. Кызыкпы? Бул видеону…»
  // Широко на хуке → быстрый мягкий punch-in на «Кызыкпы?» → чуть назад.
  {
    from: 26,
    to: 154,
    cam: [
      { t: 0.87, s: 1.0, v: 1, dx: 0 },
      { t: 3.06, s: 1.0 },
      { t: 3.4, s: 1.05, v: 0.9 },
      { t: 3.95, s: 1.05 },
      { t: 5.13, s: 1.03, dx: 6 },
    ],
  },
  // «Урматтуу ата-энелер!» — ближе, личное обращение; «Балаңызды күн
  // сайын…» — чуть шире под схему; «убакыт жетпей жатабы?» — медленный наезд.
  {
    from: 161,
    to: 333,
    cam: [
      { t: 5.37, s: 1.045, v: 0.8, dx: -8 },
      { t: 6.55, s: 1.045 },
      { t: 7.2, s: 1.025, v: 0.95, dx: 4 },
      { t: 8.6, s: 1.025 },
      { t: 11.1, s: 1.055, v: 1, dx: 8 },
    ],
  },
  // «Жумуш бар, жолугушуу бар, башка иштер бар.» — 102 → 104 → 103 %.
  {
    from: 344,
    to: 435,
    cam: [
      { t: 11.47, s: 1.02, v: 1, dx: -6 },
      { t: 12.45, s: 1.02 },
      { t: 12.9, s: 1.04, dx: 0 },
      { t: 13.3, s: 1.04 },
      { t: 13.8, s: 1.03, dx: 6 },
    ],
  },
  // «Ошон үчүн биз BalaGo кызматын ачтык.» — отъезд: проблема ушла,
  // появляется решение и место для логотипа.
  {
    from: 446,
    to: 518,
    cam: [
      { t: 14.87, s: 1.035, v: 1, dx: 6 },
      { t: 15.35, s: 1.035 },
      { t: 15.98, s: 1.0, dx: 0 },
    ],
  },
  // Маршрут ҮЙ → МЕКТЕП → ҮЙ — широкий план, едва заметная панорама.
  {
    from: 533,
    to: 616,
    cam: [
      { t: 17.77, s: 1.02, v: 1, dx: -10 },
      { t: 20.53, dx: 10 },
    ],
  },
  {
    from: 625,
    to: 706,
    cam: [
      { t: 20.83, s: 1.02, v: 1, dx: 10 },
      { t: 23.53, s: 1.015, dx: -6 },
    ],
  },
  // «А сиз болсо өз жумушуңуз менен алектене бересиз.» — ближе, спокойно.
  {
    from: 719,
    to: 808,
    cam: [
      { t: 23.97, s: 1.05, v: 0.85, dx: 0 },
      { t: 26.93, s: 1.062, v: 0.9, dx: 6 },
    ],
  },
  // «BalaGo — балаңыздын мектепке барып келишин жеңилдеткен кызмат.»
  {
    from: 820,
    to: 917,
    cam: [
      { t: 27.33, s: 1.03, v: 1, dx: -6 },
      { t: 30.57, s: 1.04, dx: 4 },
    ],
  },
  // «Толук маалымат…» — личный CTA крупнее, затем ДО жеста рукой —
  // плавно на полный кадр (100 %): видны голова, рука, верх и низ.
  // Кусок идёт до последнего кадра исходника — финал не обрывается.
  {
    from: 928,
    to: 1073,
    cam: [
      { t: 30.93, s: 1.045, v: 0.85, dx: 0 },
      { t: 32.12, s: 1.045 },
      { t: 32.55, s: 1.0 },
    ],
  },
];

const FPS = LIVE_VIDEO.fps;
const W = LIVE_VIDEO.width;
const H = LIVE_VIDEO.height;

// начало каждого куска в кадрах готового ролика
export const SEGMENT_STARTS: readonly number[] = SEGMENTS.reduce<number[]>(
  (acc, s, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + (SEGMENTS[i - 1].to - SEGMENTS[i - 1].from));
    return acc;
  },
  [],
);

export const LIVE_FRAMES =
  SEGMENT_STARTS[SEGMENTS.length - 1] +
  SEGMENTS[SEGMENTS.length - 1].to -
  SEGMENTS[SEGMENTS.length - 1].from;

// секунды исходника → кадр готового ролика (для вырезанных пауз —
// ближайшая граница куска)
export const outFrame = (srcSec: number): number => {
  const f = srcSec * FPS;
  for (let i = 0; i < SEGMENTS.length; i++) {
    const s = SEGMENTS[i];
    if (f < s.to) return SEGMENT_STARTS[i] + Math.max(0, Math.round(f - s.from));
  }
  return LIVE_FRAMES - 1;
};

// кадр готового ролика → индекс куска и секунда исходника
export const segmentAt = (frame: number): { index: number; srcSec: number } => {
  let i = SEGMENTS.length - 1;
  while (i > 0 && frame < SEGMENT_STARTS[i]) i--;
  return { index: i, srcSec: (SEGMENTS[i].from + frame - SEGMENT_STARTS[i]) / FPS };
};

// плавная S-кривая (как ease-in-out у «оператора»)
const smooth = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * t * (t * (t * 6 - 15) + 10);
};

// ---------- Лицо ----------
const faceSample = (srcSec: number) => {
  const i = Math.min(
    FACE_TRACK.length - 1,
    Math.max(0, Math.round((srcSec * FPS) / 5)),
  );
  const [, cx, left, right, chin] = FACE_TRACK[i];
  return { cx, left, right, chin };
};

// средний центр лица в куске — опорная точка панорамы
const SEGMENT_FACE_X = SEGMENTS.map((s) => {
  let sum = 0;
  let n = 0;
  for (let f = s.from; f < s.to; f += 5) {
    sum += faceSample(f / FPS).cx;
    n++;
  }
  return sum / n;
});

// ключи с заполненными значениями (пропущенное поле = предыдущее)
const FULL_KEYS = SEGMENTS.map((seg) => {
  let prev = { s: 1, v: 1, dx: 0 };
  return seg.cam.map((k) => {
    prev = { s: k.s ?? prev.s, v: k.v ?? prev.v, dx: k.dx ?? prev.dx };
    return { t: k.t, ...prev };
  });
});

export type Camera = {
  // масштаб и точка исходника, которая стоит в центре кадра
  readonly s: number;
  readonly cx: number;
  readonly cy: number;
};

export const cameraAt = (frame: number): Camera => {
  const { index, srcSec } = segmentAt(frame);
  const keys = FULL_KEYS[index];
  let k = keys[0];
  if (srcSec >= keys[keys.length - 1].t) k = keys[keys.length - 1];
  else {
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i];
      const b = keys[i + 1];
      if (srcSec >= a.t && srcSec < b.t) {
        const p = smooth((srcSec - a.t) / (b.t - a.t));
        k = {
          t: srcSec,
          s: a.s + (b.s - a.s) * p,
          v: a.v + (b.v - a.v) * p,
          dx: a.dx + (b.dx - a.dx) * p,
        };
        break;
      }
    }
  }
  const s = Math.max(1, k.s);
  const halfW = W / 2 / s;
  const halfH = H / 2 / s;
  // панорама и вертикаль всегда в пределах исходника — без пустых полей
  const cx = Math.min(W - halfW, Math.max(halfW, SEGMENT_FACE_X[index] + k.dx));
  const cy = halfH + (H - 2 * halfH) * k.v;
  return { s, cx, cy };
};

// точка исходника → координаты готового кадра
export const toOut = (frame: number, x: number, y: number) => {
  const c = cameraAt(frame);
  return { x: (x - c.cx) * c.s + W / 2, y: (y - c.cy) * c.s + H / 2 };
};

// подбородок в координатах готового кадра
const chinOut = (frame: number): number => {
  const { srcSec } = segmentAt(frame);
  return toOut(frame, 0, faceSample(srcSec).chin).y;
};

// правый край лица в координатах готового кадра
export const faceRightOut = (frame: number): number => {
  const { srcSec } = segmentAt(frame);
  return toOut(frame, faceSample(srcSec).right, 0).x;
};

// Верх свободной зоны под подбородком для элемента, видимого в кадрах
// [from, to]: берётся самое низкое положение подбородка за это время,
// чтобы элемент стоял на месте и ни в один момент не задел лицо.
export const stageTop = (from: number, to: number, margin = 26): number => {
  let m = 0;
  for (let f = Math.max(0, from); f <= Math.min(LIVE_FRAMES - 1, to); f += 2) {
    m = Math.max(m, chinOut(f));
  }
  return Math.round(m + margin);
};

// ---------- Речь (секунды исходника) ----------
// Текст — как реально сказано в видео (кыргызча), без пересказа.
export const SPEECH = {
  bishkek: 0.98,
  jany: 1.45,
  kyzmat: 2.15,
  paidaBoldu: 2.36,
  hookEnd: 2.86,
  kyzykpy: 3.13,
  kyzykpyEnd: 3.68,
  bulVideonu: 3.75,
  ayagyna: 4.3,
  koruunuz: 4.55,
  sentence1End: 5.0,
  urmattuu: 5.48,
  ataEneler: 5.85,
  parentsEnd: 6.49,
  balanyzdy: 6.79,
  kunSaiyn: 7.4,
  mektepten: 7.78,
  alypKelip: 8.64,
  kairaAlyp: 9.12,
  ubakyt: 9.95,
  jatabyEnd: 10.93,
  jumush: 11.62,
  jolugushuu: 12.61,
  bashkaIshter: 13.45,
  listEnd: 14.36,
  oshonUchun: 15.04,
  balaGo: 15.99,
  achtyk: 16.85,
  revealEnd: 17.13,
  bizBalanyzdy: 17.92,
  uidon: 19.03,
  mektepke: 19.51,
  jetkirebiz1: 19.85,
  routeAEnd: 20.4,
  sabakButkondo: 20.96,
  mekteptenAlyp: 22.04,
  uigo: 22.73,
  jetkirebiz2: 22.97,
  routeBEnd: 23.38,
  aSizBolso: 24.15,
  ozJumushunuz: 24.96,
  alektene: 25.87,
  sentence7End: 26.78,
  balaGo2: 27.49,
  balanyzdyn: 28.27,
  barypKelishin: 29.11,
  jenildetken: 29.7,
  sentence8End: 30.42,
  tolukMaalymat: 31.09,
  profildegi: 32.24,
  whatsapp: 33.8,
  speechEnd: 34.99,
} as const;

// ---------- Жесты рукой в финале (секунды исходника) ----------
// Найдены покадрово: на «…шилтемеге өтүңүз» указательный палец вверх,
// на «же төмөнкү WhatsApp'ка» — вниз.
export const GESTURE = {
  upStart: 32.68, // рука входит в кадр и поднимается
  upHold: 32.9, // палец замер вверху
  upEnd: 33.5, // кисть начинает поворачиваться
  downStart: 33.82, // палец уже смотрит вниз
  downEnd: 34.5,
  handGone: 34.62,
} as const;

// Кончик указательного пальца в координатах исходника (1080×1920):
// [секунда исходника, x, y]. Приблизительный ручной трекинг по кадрам.
export const FINGER_TRACK: readonly (readonly [number, number, number])[] = [
  [32.7, 874, 1050],
  [32.8, 832, 910],
  [32.9, 830, 888],
  [33.0, 812, 880],
  [33.2, 818, 880],
  [33.4, 826, 886],
  [33.5, 832, 908],
  [33.6, 896, 872],
  [33.7, 940, 862],
  [33.8, 842, 1050],
  [33.9, 756, 1196],
  [34.0, 752, 1186],
  [34.1, 740, 1160],
  [34.2, 748, 1112],
  [34.3, 742, 1118],
  [34.4, 704, 1100],
  [34.5, 692, 1200],
  [34.6, 842, 1390],
];

export const fingerAt = (srcSec: number) => {
  const t = FINGER_TRACK;
  if (srcSec <= t[0][0]) return { x: t[0][1], y: t[0][2] };
  for (let i = 0; i < t.length - 1; i++) {
    const [a, ax, ay] = t[i];
    const [b, bx, by] = t[i + 1];
    if (srcSec <= b) {
      const p = (srcSec - a) / (b - a);
      return { x: ax + (bx - ax) * p, y: ay + (by - ay) * p };
    }
  }
  const last = t[t.length - 1];
  return { x: last[1], y: last[2] };
};

// ---------- Субтитры ----------
// 2–5 слов за раз; [слово] в квадратных скобках — жёлтое ключевое слово.
// Там, где смысл показывает крупная графика (хук, список, логотип,
// маршрут, CTA), субтитров нет — графика сама несёт эти слова.
export type CaptionCue = {
  readonly from: number;
  readonly to: number;
  readonly text: string;
  // "top" — сразу под подбородком (по умолчанию), "bottom" — у нижней
  // границы зоны (когда сверху стоит другой элемент, например логотип)
  readonly slot?: "top" | "bottom";
};

export const CAPTIONS: readonly CaptionCue[] = [
  { from: SPEECH.kyzykpy, to: SPEECH.bulVideonu - 0.03, text: "[Кызыкпы?]" },
  { from: SPEECH.bulVideonu, to: SPEECH.ayagyna, text: "Бул видеону" },
  { from: SPEECH.ayagyna, to: SPEECH.sentence1End + 0.1, text: "аягына чейин [көрүңүз]" },
  { from: SPEECH.balanyzdy, to: SPEECH.mektepten + 0.38, text: "Балаңызды [күн сайын]" },
  { from: SPEECH.alypKelip, to: SPEECH.kairaAlyp, text: "алып келип," },
  { from: SPEECH.kairaAlyp, to: SPEECH.ubakyt, text: "кайра алып барууга" },
  { from: SPEECH.oshonUchun, to: SPEECH.balaGo - 0.04, text: "Ошон үчүн биз" },
  { from: SPEECH.aSizBolso, to: SPEECH.ozJumushunuz, text: "А сиз болсо" },
  { from: SPEECH.ozJumushunuz, to: SPEECH.alektene, text: "өз [жумушуңуз] менен" },
  { from: SPEECH.alektene, to: SPEECH.sentence7End + 0.12, text: "алектене бересиз" },
  { from: SPEECH.tolukMaalymat, to: 31.6, text: "[Толук маалымат]", slot: "bottom" },
  { from: 31.6, to: SPEECH.profildegi - 0.12, text: "алуу үчүн", slot: "bottom" },
  { from: SPEECH.balanyzdyn, to: SPEECH.barypKelishin, text: "балаңыздын мектепке", slot: "bottom" },
  { from: SPEECH.barypKelishin, to: SPEECH.jenildetken, text: "барып келишин", slot: "bottom" },
  { from: SPEECH.jenildetken, to: SPEECH.sentence8End + 0.12, text: "[жеңилдеткен] кызмат", slot: "bottom" },
];

export const sec = (s: number) => Math.round(s * FPS);
