// Монтаж BalaGoLive03: куски исходника, виртуальная камера, тайминги
// речи и жестов, субтитры.
//
// ВСЕ тайминги речи и жестов — в секундах ИСХОДНИКА
// (public/live-03/1000209127.mp4 → рабочая копия live03-graded.mp4,
// 30 fps CFR, 1371 кадр, 45.68 с). Они найдены по реальной записи:
// границы фраз — по паузам (ffmpeg silencedetect, −32 dB), слова — по
// пословной расшифровке, перепроверенной на слух; жесты — покадрово.
// Перевод в кадры готового ролика — одна функция outFrame(): все
// анимации, звуки и субтитры считаются через неё, поэтому после любой
// правки склеек они остаются привязаны к словам.
export const LIVE3 = {
  id: "BalaGoLive03",
  width: 1080,
  height: 1920,
  fps: 30,
} as const;

// Рабочие копии (npm run live03:prepare; описание исходников и SHA-256 —
// src/live-03/assets.json, поле prepared).
export const LIVE3_FILES = {
  video: "live-03/live03-graded.mp4",
  voice: "live-03/live03-voice.wav",
} as const;

const FPS = LIVE3.fps;
const W = LIVE3.width;
const H = LIVE3.height;

// Безопасная зона Reels (1080×1920): поля по бокам ~110 px, сверху ~200,
// снизу ~320; справа внизу — колонка кнопок интерфейса.
export const SAFE = { left: 110, right: W - 110, top: 200, bottom: H - 320 } as const;

// ---------- Куски исходника ----------
// from/to — кадры исходника [from, to). lead — J-cut: звук куска
// начинается на lead кадров раньше картинки (под хвостом прошлого плана),
// чтобы не срезать первый звук слова на склейке ракурсов.
// cam — ключи виртуальной камеры (t — секунда исходника): s — масштаб
// (≥ 1, без пустых полей), ox/oy — неподвижная точка исходника (обычно
// лицо). Между ключами — плавная S-кривая. Пропущенное поле = предыдущее.
// look — выравнивание экспозиции ракурса (CSS-фильтр).
export type CamKey = {
  readonly t: number;
  readonly s?: number;
  readonly ox?: number;
  readonly oy?: number;
};

export type Look = { readonly b: number; readonly c: number; readonly sat: number };

export type Segment = {
  readonly name: string;
  readonly from: number;
  readonly to: number;
  readonly lead?: number;
  readonly cam: readonly CamKey[];
  readonly look: Look;
};

const LOOK_BUILDING: Look = { b: 1.0, c: 1.0, sat: 1.0 };

export const SEGMENTS: readonly Segment[] = [
  // 0.00–4.70 · «Саат үчтө балаңыздын сабагы бүтсө…» + взгляд на телефон.
  // Спокойный первый кадр, медленный наезд к «байланып калат», затем
  // кадр смещается к телефону.
  {
    name: "15:00",
    from: 0,
    to: 141,
    cam: [
      { t: 0, s: 1.0, ox: 610, oy: 620 },
      { t: 1.0, s: 1.0 },
      { t: 3.4, s: 1.05 },
      { t: 4.7, s: 1.04, ox: 470, oy: 860 },
    ],
    look: LOOK_BUILDING,
  },
  // 6.10–9.00 · «Жолугушууңуз барбы? Жумушуңуз бүтө элекпи?» — новый
  // ракурс, монтажный punch-in.
  {
    name: "Жолугушуу",
    from: 183,
    to: 270,
    cam: [
      { t: 6.1, s: 1.07, ox: 380, oy: 640 },
      { t: 9.0, s: 1.05 },
    ],
    look: LOOK_BUILDING,
  },
  // 9.17–13.27 · «Же башка ишиңиз… Баары бир мектепке барчу убакыт
  // жакындап калат» — jump-cut на паузе: план шире, наезд к «убакыт».
  {
    name: "Мектеп убактысы",
    from: 275,
    to: 398,
    cam: [
      { t: 9.17, s: 1.0, ox: 550, oy: 560 },
      { t: 11.6, s: 1.0 },
      { t: 12.5, s: 1.06 },
      { t: 13.27, s: 1.065 },
    ],
    look: LOOK_BUILDING,
  },
  // 14.13–18.90 · «Ошондо ишиңизди токтотосуз.» → разворот → уход от
  // камеры под «Жолго чыгасыз, балаңызды алып келесиз».
  {
    name: "Разворот",
    from: 424,
    to: 567,
    cam: [
      { t: 14.13, s: 1.03, ox: 260, oy: 700 },
      { t: 15.05, s: 1.03 },
      { t: 15.35, s: 1.08 },
      { t: 15.85, s: 1.08 },
      { t: 16.6, s: 1.0, ox: 540, oy: 960 },
    ],
    look: { b: 1.02, c: 1.0, sat: 1.0 },
  },
  // 20.20–22.70 · «Анан кайра өз ишиңизге кайтып келүүгө туура келет.»
  {
    name: "Кайра жумушка",
    from: 606,
    to: 681,
    cam: [
      { t: 20.2, s: 1.04, ox: 400, oy: 760 },
      { t: 22.7, s: 1.07 },
    ],
    look: { b: 1.07, c: 1.02, sat: 0.97 },
  },
  // 23.20–28.30 · «Бир күн болсо мейли… көп убакыт жолго кетет.» — крупный
  // план; на «көп убакыт» — единственный сильный акцент (наезд).
  {
    name: "Күн сайын",
    from: 696,
    to: 849,
    lead: 3,
    cam: [
      { t: 23.2, s: 1.0, ox: 270, oy: 580 },
      { t: 26.85, s: 1.02 },
      { t: 27.2, s: 1.09 },
      { t: 28.3, s: 1.1 },
    ],
    look: { b: 1.0, c: 1.0, sat: 0.97 },
  },
  // 29.10–31.93 · «BalaGo'ну биз дал ушундай ата-энелер үчүн баштап
  // жатабыз.» — отъезд: место для логотипа сверху.
  {
    name: "BalaGo",
    from: 873,
    to: 958,
    cam: [
      { t: 29.1, s: 1.06, ox: 400, oy: 760 },
      { t: 29.4, s: 1.06 },
      { t: 30.7, s: 1.0 },
    ],
    look: { b: 1.08, c: 1.02, sat: 1.0 },
  },
  // 32.57–37.23 · «Балаңызды мектепке жеткирүү жана сабактан кийин үйүнө
  // алып келүү жагын биз уюштурабыз.»
  {
    name: "Үй → Мектеп → Үй",
    from: 977,
    to: 1117,
    lead: 4,
    cam: [
      { t: 32.57, s: 1.02, ox: 480, oy: 650 },
      { t: 37.23, s: 1.05 },
    ],
    look: { b: 0.99, c: 1.0, sat: 0.95 },
  },
  // 37.60–45.70 · «Эгер сиздин күнүңүз…» → жесты CTA → «Биз дайыма
  // кызматтабыз.» Наезд на «байланып калса», затем ДО жеста — плавно на
  // полный кадр, чтобы поднятая рука не обрезалась. Кусок идёт до конца
  // исходника: последняя фраза и жест не обрываются.
  {
    name: "CTA",
    from: 1128,
    to: 1371,
    cam: [
      { t: 37.6, s: 1.0, ox: 580, oy: 740 },
      { t: 38.2, s: 1.0 },
      { t: 40.2, s: 1.055 },
      { t: 40.5, s: 1.055 },
      { t: 41.15, s: 1.0 },
    ],
    look: { b: 0.96, c: 1.01, sat: 0.97 },
  },
];

// Брендовая концовка после последнего кадра исходника.
export const END_CARD_FRAMES = 60;

export const SEGMENT_STARTS: readonly number[] = SEGMENTS.reduce<number[]>((acc, s, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + (SEGMENTS[i - 1].to - SEGMENTS[i - 1].from));
  return acc;
}, []);

export const LIVE_END = SEGMENT_STARTS[SEGMENTS.length - 1] + SEGMENTS[SEGMENTS.length - 1].to - SEGMENTS[SEGMENTS.length - 1].from;
export const LIVE3_FRAMES = LIVE_END + END_CARD_FRAMES;

// секунда исходника → кадр готового ролика. Время внутри вырезанной
// паузы прижимается к ближайшей границе куска.
export const outFrame = (srcSec: number): number => {
  const f = srcSec * FPS;
  for (let i = 0; i < SEGMENTS.length; i++) {
    const s = SEGMENTS[i];
    if (f < s.to) return SEGMENT_STARTS[i] + Math.max(0, Math.round(f - s.from));
  }
  return LIVE_END - 1;
};

// кадр готового ролика → индекс куска и секунда исходника
export const segmentAt = (frame: number): { index: number; srcSec: number } => {
  const fr = Math.min(frame, LIVE_END - 1);
  let i = SEGMENTS.length - 1;
  while (i > 0 && fr < SEGMENT_STARTS[i]) i--;
  return { index: i, srcSec: (SEGMENTS[i].from + fr - SEGMENT_STARTS[i]) / FPS };
};

const smooth = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * t * (t * (t * 6 - 15) + 10);
};

const FULL_KEYS = SEGMENTS.map((seg) => {
  let prev = { s: 1, ox: W / 2, oy: H / 2 };
  return seg.cam.map((k) => {
    prev = { s: k.s ?? prev.s, ox: k.ox ?? prev.ox, oy: k.oy ?? prev.oy };
    return { t: k.t, ...prev };
  });
});

export type Camera = { readonly s: number; readonly ox: number; readonly oy: number };

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
        k = { t: srcSec, s: a.s + (b.s - a.s) * p, ox: a.ox + (b.ox - a.ox) * p, oy: a.oy + (b.oy - a.oy) * p };
        break;
      }
    }
  }
  return {
    s: Math.max(1, k.s),
    ox: Math.min(W, Math.max(0, k.ox)),
    oy: Math.min(H, Math.max(0, k.oy)),
  };
};

// точка исходника → координаты готового кадра (с учётом камеры)
export const toOut = (frame: number, x: number, y: number) => {
  const c = cameraAt(frame);
  return { x: c.ox + (x - c.ox) * c.s, y: c.oy + (y - c.oy) * c.s };
};

// ---------- Речь (секунды исходника) ----------
// Расшифровка (кыргызча, как реально сказано):
//  1  0.30–4.03  Саат үчтө балаңыздын сабагы бүтсө, сиздин күнүңүз да саат үчкө байланып калат.
//  2  6.29–8.81  Жолугушууңуз барбы? Жумушуңуз бүтө элекпи?
//  3  9.30–10.63 Же башка ишиңиз чыгып калдыбы?
//  4 11.02–13.03 Баары бир мектепке барчу убакыт жакындап калат.
//  5 14.41–15.69 Ошондо ишиңизди токтотосуз.
//  6 16.95–18.61 Жолго чыгасыз, балаңызды алып келесиз.
//  7 20.29–22.48 Анан кайра өз ишиңизге кайтып келүүгө туура келет.
//  8 23.17–28.04 Бир күн болсо мейли, бирок ушундай график күн сайын кайталанса, көп убакыт жолго кетет.
//  9 29.35–31.67 BalaGo'ну биз дал ушундай ата-энелер үчүн баштап жатабыз.
// 10 32.63–37.00 Балаңызды мектепке жеткирүү жана сабактан кийин үйүнө алып келүү жагын биз уюштурабыз.
// 11 37.83–40.40 Эгер сиздин күнүңүз балаңыздын убактысына байланып калса,
// 12 41.05–42.36 профилдеги шилтемеге өтүңүз,
// 13 42.61–43.91 же төмөнкү WhatsApp'ка жазыңыз.
// 14 44.27–45.38 Биз дайыма кызматтабыз.
export const SPEECH = {
  saat: 0.3,
  balanyzdyn: 0.64,
  sabagy: 1.24,
  butso: 1.68,
  sizdin: 2.12,
  saat2: 2.78,
  baylanyp: 3.4,
  line1End: 4.03,
  jolugushuu: 6.29,
  line2aEnd: 7.33,
  jumushunuz: 7.59,
  line2End: 8.81,
  bashka: 9.3,
  line3End: 10.63,
  baary: 11.02,
  mektepke: 11.46,
  ubakyt: 12.24,
  line4End: 13.03,
  oshondo: 14.41,
  toktotosuz: 15.16,
  line5End: 15.69,
  jolgo: 16.95,
  alypKelesiz: 18.12,
  line6End: 18.61,
  anan: 20.29,
  kaytyp: 21.42,
  line7End: 22.48,
  birKun: 23.17,
  birok: 24.42,
  kunSayin: 25.54,
  kaytalansa: 25.98,
  kop: 27.01,
  line8End: 28.04,
  balaGo: 29.35,
  ataEneler: 30.48,
  bashtap: 31.12,
  line9End: 31.67,
  balanyzdy: 32.63,
  mektepke2: 33.04,
  jetkiruu: 33.36,
  jana: 34.18,
  sabaktan: 34.44,
  uyuno: 35.02,
  alypKeluu: 35.32,
  jagyn: 35.8,
  uyushturabyz: 36.38,
  line10End: 37.0,
  eger: 37.83,
  ubaktysyna: 39.24,
  line11End: 40.4,
  profildegi: 41.05,
  line12End: 42.36,
  je: 42.61,
  whatsapp: 43.3,
  line13End: 43.91,
  biz: 44.27,
  speechEnd: 45.38,
} as const;

// ---------- Жесты (секунды исходника, найдены покадрово) ----------
export const GESTURE = {
  phoneUp: 3.0, // телефон в руке, взгляд на экран
  phoneDown: 5.6,
  turn: 16.05, // начинает разворачиваться
  backToCamera: 17.0, // полностью спиной, идёт от камеры
  upRaise: 41.25, // рука поднимается
  upHold: 41.4, // указательный палец вверху
  upEnd: 42.15, // кисть поворачивается
  downStart: 42.45, // палец смотрит вниз
  downEnd: 43.35,
  handGone: 43.55,
} as const;

// Кончик указательного пальца (координаты исходника 1080×1920).
export const FINGER_TRACK: readonly (readonly [number, number, number])[] = [
  [41.3, 220, 900],
  [41.4, 240, 800],
  [41.5, 330, 770],
  [41.6, 330, 768],
  [41.7, 296, 778],
  [41.8, 262, 800],
  [41.9, 282, 802],
  [42.0, 258, 778],
  [42.1, 262, 753],
  [42.25, 330, 980],
  [42.45, 400, 1150],
  [42.5, 418, 1190],
  [42.6, 515, 1264],
  [42.7, 544, 1288],
  [42.8, 583, 1288],
  [42.9, 588, 1280],
  [43.0, 588, 1264],
  [43.1, 578, 1264],
  [43.2, 569, 1264],
  [43.3, 559, 1264],
  [43.45, 560, 1330],
];

// Телефон в руке (центр экрана телефона, координаты исходника).
export const PHONE_TRACK: readonly (readonly [number, number, number])[] = [
  [3.0, 120, 1330],
  [3.3, 230, 1150],
  [3.6, 280, 1130],
  [4.0, 260, 1170],
  [4.4, 230, 1200],
  [4.7, 210, 1220],
];

export const track = (t: readonly (readonly [number, number, number])[], srcSec: number) => {
  if (srcSec <= t[0][0]) return { x: t[0][1], y: t[0][2] };
  for (let i = 0; i < t.length - 1; i++) {
    const [a, ax, ay] = t[i];
    const [b, bx, by] = t[i + 1];
    if (srcSec <= b) {
      const p = smooth((srcSec - a) / (b - a));
      return { x: ax + (bx - ax) * p, y: ay + (by - ay) * p };
    }
  }
  const last = t[t.length - 1];
  return { x: last[1], y: last[2] };
};

// ---------- Субтитры ----------
// 2–5 слов, максимум две строки; [слово] — жёлтое ключевое слово.
// Фразы 12–13 («профилдеги шилтемеге өтүңүз», «WhatsApp'ка жазыңыз») не
// дублируются субтитрами: их несут надпись «Шилтеме профилде» и карточка
// WhatsApp. slot: "bottom" (по умолчанию) или "mid" — над карточкой CTA.
export type CaptionCue = {
  readonly from: number;
  readonly to: number;
  readonly text: string;
  readonly slot?: "bottom" | "mid";
  readonly accent?: boolean;
};

export const CAPTIONS: readonly CaptionCue[] = [
  { from: 0.3, to: 1.22, text: "Саат [үчтө]" },
  { from: 1.22, to: 2.1, text: "балаңыздын сабагы бүтсө," },
  { from: 2.1, to: 3.08, text: "сиздин күнүңүз да" },
  { from: 3.08, to: 4.12, text: "саат үчкө [байланып калат]" },
  { from: 6.29, to: 7.45, text: "[Жолугушууңуз] барбы?" },
  { from: 7.55, to: 8.9, text: "[Жумушуңуз] бүтө элекпи?" },
  { from: 9.3, to: 10.72, text: "Же [башка ишиңиз] чыгып калдыбы?" },
  { from: 11.02, to: 11.94, text: "Баары бир мектепке" },
  { from: 11.94, to: 13.12, text: "барчу [убакыт] жакындап калат" },
  { from: 14.41, to: 15.8, text: "Ошондо ишиңизди [токтотосуз]" },
  { from: 16.95, to: 17.7, text: "[Жолго] чыгасыз," },
  { from: 17.7, to: 18.72, text: "балаңызды алып келесиз" },
  { from: 20.29, to: 21.4, text: "Анан кайра өз ишиңизге" },
  { from: 21.4, to: 22.58, text: "кайтып келүүгө туура келет" },
  { from: 23.17, to: 24.12, text: "Бир күн болсо мейли," },
  { from: 24.42, to: 25.4, text: "бирок ушундай график" },
  { from: 25.54, to: 26.7, text: "[күн сайын] кайталанса," },
  { from: 27.01, to: 28.2, text: "[көп убакыт] жолго кетет", accent: true },
  { from: 29.35, to: 30.3, text: "BalaGo'ну биз дал" },
  { from: 30.3, to: 31.1, text: "ушундай [ата-энелер] үчүн" },
  { from: 31.1, to: 31.8, text: "баштап жатабыз" },
  { from: 32.63, to: 33.98, text: "Балаңызды [мектепке] жеткирүү" },
  { from: 34.18, to: 35.0, text: "жана сабактан кийин" },
  { from: 35.0, to: 35.85, text: "[үйүнө] алып келүү" },
  { from: 35.85, to: 37.08, text: "жагын биз [уюштурабыз]" },
  { from: 37.83, to: 38.66, text: "Эгер сиздин күнүңүз" },
  { from: 38.66, to: 40.5, text: "балаңыздын [убактысына] байланып калса" },
  { from: 44.27, to: 45.42, text: "Биз [дайыма] кызматтабыз", slot: "mid" },
];

export const F = outFrame;
