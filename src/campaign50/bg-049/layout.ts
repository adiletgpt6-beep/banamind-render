// Общая геометрия кадра (1080×1920): формы жёлтой линии и предметы сцен
// используют одни и те же координаты, поэтому линия точно ложится на край
// блокнота, рамку заявки, корпус телефона, горизонт пейзажа и логотип.
// Безопасная зона Reels: сверху ≥ 250 px, справа ≥ 150 px, снизу ≥ 400 px
// (там только субтитры над интерфейсом).
import { BG49_VIDEO } from "./script.ts";
import { cueOf, sceneOf, wordTime, type Bg49Timeline } from "./timing.ts";
import type { Pt, ShapeSrc } from "./line/morph.ts";

const FPS = BG49_VIDEO.fps;

// ---------- Сцена 1: знак вопроса ----------
// Локальные координаты «?» (центр 0, 0); точка знака — отдельный кружок.
export const Q_PATH: ShapeSrc = {
  kind: "path",
  key: "qmark",
  d: "M -170 -150 C -170 -300 -60 -360 20 -360 C 130 -360 200 -285 200 -190 C 200 -100 140 -60 80 -25 C 30 5 10 50 10 120 L 10 170",
};
export const Q_DOT: Pt = [10, 262];
export const Q_BIG = { x: 540, y: 800, s: 1 } as const;
export const Q_THOUGHT = { x: 818, y: 520, s: 0.36 } as const;

// Мама: центр головы и масштаб в разных планах.
export const MOM_HOOK = { x: 520, y: 965, s: 1.12 } as const;
export const MOM_DESK = { x: 540, y: 700, s: 0.92 } as const;

// ---------- Сцена 2: блокнот ----------
export const NOTE = {
  top: 1100,
  left: 170,
  right: 910,
  bottomLeft: 120,
  bottomRight: 960,
  bottom: 1440,
  rules: [1178, 1250, 1322, 1394],
  textX: 290,
  textY: 1160, // базовая линия рукописной строки
  textW: 580,
} as const;
export const EDGE_STUB: ShapeSrc = {
  kind: "poly",
  key: "edge-stub",
  pts: [
    [800, NOTE.top],
    [NOTE.right, NOTE.top],
  ],
};
export const EDGE: ShapeSrc = {
  kind: "poly",
  key: "edge",
  pts: [
    [NOTE.left, NOTE.top],
    [NOTE.right, NOTE.top],
  ],
};
// Петля вокруг записанной фразы (рисуется «от руки», с небольшим заходом).
export const LOOP: ShapeSrc = {
  kind: "fn",
  key: "loop",
  fn: (t) => {
    const th = Math.PI + t * Math.PI * 2 * 1.1;
    const wob = 1 + 0.025 * Math.sin(th * 3);
    const x = 580 + 322 * wob * Math.cos(th);
    const y = 1142 + 64 * wob * Math.sin(th) + t * 10;
    const a = (-2.5 * Math.PI) / 180;
    return [
      580 + (x - 580) * Math.cos(a) - (y - 1142) * Math.sin(a),
      1142 + (x - 580) * Math.sin(a) + (y - 1142) * Math.cos(a),
    ];
  },
};

// ---------- Сцена 3: курсор и страница поиска ----------
export const CURSOR: ShapeSrc = {
  kind: "poly",
  key: "cursor",
  pts: [
    [0, 0],
    [0, 96],
    [25, 73],
    [44, 113],
    [61, 105],
    [42, 66],
    [76, 64],
    [0, 0],
  ],
};
export const BROWSER = { x: 110, y: 340, w: 860, h: 720 } as const;
export const FIELD = { x: 150, y: 448, w: 780, h: 84 } as const;
export const RESULT = { x: 150, y: 668, w: 780, h: 150 } as const;
// курсор ждёт у свободного правого края поля, не закрывая запрос
export const CUR_FIELD: Pt = [790, 500];
export const CUR_RESULT: Pt = [452, 724];

export const searchTimes = (tl: Bg49Timeline) => {
  const sc = sceneOf(tl, "search");
  const f = (sec: number) => Math.round(sec * FPS) - sc.from; // кадр сцены
  const typeFrom = Math.max(f(wordTime(tl, "n02", 0)) - 6, 34);
  const click = Math.max(f(wordTime(tl, "n02", 3)) + 2, typeFrom + 52);
  return {
    typeFrom,
    typeTo: click - 22,
    click,
    open: click + 8,
    title: Math.max(f(wordTime(tl, "n02", 4)), click + 20),
    rows: Math.max(f(wordTime(tl, "n02", 9)), click + 40),
    // прочитав условия, мама прокручивает страницу и сама нажимает
    // «Арыз калтыруу» — отсюда складка заявки в следующей сцене
    scroll: Math.max(f(wordTime(tl, "n02", 9)), click + 40) + 40,
    press: Math.max(
      Math.max(f(wordTime(tl, "n02", 9)), click + 40) + 76,
      sc.frames - 30,
    ),
  };
};
// Кнопка «Арыз калтыруу» после прокрутки страницы (кончик курсора).
export const CUR_BUTTON: Pt = [604, 962];

// ---------- Сцена 4: складка заявки → телефон → лупа ----------
export const FOLD = { x: 150, w: 780, ys: [390, 568, 746, 924] } as const;
export const FOLD_SHAPE: ShapeSrc = {
  kind: "poly",
  key: "fold",
  pts: [
    [FOLD.x, FOLD.ys[1]],
    [FOLD.x + FOLD.w, FOLD.ys[1]],
    [FOLD.x + FOLD.w, FOLD.ys[0]],
    [FOLD.x, FOLD.ys[0]],
    [FOLD.x, FOLD.ys[3]],
    [FOLD.x + FOLD.w, FOLD.ys[3]],
    [FOLD.x + FOLD.w, FOLD.ys[1]],
    [FOLD.x + FOLD.w, FOLD.ys[2]],
    [FOLD.x, FOLD.ys[2]],
  ],
};
// Та же складка, сжатая «гармошкой»: точки соответствуют раскрытой складке,
// поэтому переход читается как раскрытие/складывание панелей.
const squash = (
  key: string,
  y0: number,
  gap: number,
  x0: number,
  w: number,
): ShapeSrc => ({
  kind: "poly",
  key,
  pts: (FOLD_SHAPE as { readonly pts: readonly Pt[] }).pts.map(
    ([x, y]) =>
      [
        x0 + ((x - FOLD.x) / FOLD.w) * w,
        y0 + (FOLD.ys as readonly number[]).indexOf(y) * gap,
      ] as Pt,
  ),
});
export const FOLD_FLAT = squash("fold-flat", FOLD.ys[0], 6, FOLD.x, FOLD.w);
export const FOLD_MID = squash("fold-mid", 720, 10, 330, 420);
export const PHONE = { x: 330, y: 330, w: 420, h: 820, r: 62 } as const;
const P = PHONE;
export const PHONE_SHAPE: ShapeSrc = {
  kind: "path",
  key: "phone",
  // от верхнего левого угла по часовой стрелке — как складка заявки
  d: `M ${P.x + P.r} ${P.y} L ${P.x + P.w - P.r} ${P.y} A ${P.r} ${P.r} 0 0 1 ${P.x + P.w} ${P.y + P.r} L ${P.x + P.w} ${P.y + P.h - P.r} A ${P.r} ${P.r} 0 0 1 ${P.x + P.w - P.r} ${P.y + P.h} L ${P.x + P.r} ${P.y + P.h} A ${P.r} ${P.r} 0 0 1 ${P.x} ${P.y + P.h - P.r} L ${P.x} ${P.y + P.r} A ${P.r} ${P.r} 0 0 1 ${P.x + P.r} ${P.y}`,
};
// Лупа: ручка, затем окружность радиуса 120 (локально, центр 0, 0).
export const MAG_R = 118;
export const MAGNIFIER: ShapeSrc = {
  kind: "path",
  key: "magnifier",
  d: `M 205 205 L 83.4 83.4 A ${MAG_R} ${MAG_R} 0 1 1 -83.4 -83.4 A ${MAG_R} ${MAG_R} 0 1 1 83.4 83.4`,
};
// Точки «района» для подбора группы (сцена 4): дома и школа.
export const HOMES: readonly {
  readonly x: number;
  readonly y: number;
  readonly fit: boolean;
}[] = [
  { x: 240, y: 470, fit: false },
  { x: 420, y: 430, fit: true },
  { x: 700, y: 455, fit: false },
  { x: 850, y: 560, fit: true },
  { x: 230, y: 690, fit: true },
  { x: 610, y: 640, fit: true },
  { x: 380, y: 860, fit: false },
  { x: 820, y: 820, fit: false },
];
export const SCHOOL_PIN: Pt = [540, 760];
export const MAG_PATH: readonly Pt[] = [
  [420, 470],
  [800, 560],
  [250, 700],
  [610, 650],
];

export const formTimes = (tl: Bg49Timeline) => {
  const sc = sceneOf(tl, "form");
  const f = (sec: number) => Math.round(sec * FPS) - sc.from;
  const c = cueOf(tl, "n03");
  const fill0 = Math.max(f(c.from), 22);
  const fillStep = Math.max(
    14,
    Math.round((f(wordTime(tl, "n03", 3)) - fill0) / 3),
  );
  const foldOut = Math.max(
    f(wordTime(tl, "n03", 3)) + 10,
    fill0 + fillStep * 3 + 10,
  );
  const phoneIn = foldOut + 18;
  const tap = phoneIn + 26;
  // шаг с телефоном держится ≥ 1,5 с после нажатия — успеваем прочитать,
  // что сообщение отправляет сама мама
  const searchIn = Math.max(tap + 45, f(wordTime(tl, "n03", 8)) - 10);
  const noGuarantee = Math.max(f(wordTime(tl, "n03", 12)), searchIn + 40);
  return { fill0, fillStep, foldOut, phoneIn, tap, searchIn, noGuarantee };
};

// ---------- Сцена 5: луч и школьный пейзаж ----------
// Пейзаж (горы, школа, дорога) смещён вниз на LAND_DY, чтобы над ним
// оставалось небо для плашек.
export const LAND_DY = 110;
export const BEAM: ShapeSrc = {
  kind: "poly",
  key: "beam",
  pts: [
    [540, 360],
    [540, 1260],
  ],
};
export const HORIZON = 820;
export const SCHOOL = {
  left: 586,
  right: 944,
  eave: 724,
  peak: 632,
  ground: 990,
  side: 52,
} as const;
export const SKYLINE: ShapeSrc = {
  kind: "poly",
  key: "skyline",
  pts: [
    [34, 772],
    [104, 700],
    [150, 718],
    [238, 606],
    [300, 652],
    [372, 566],
    [440, 640],
    [492, 660],
    [SCHOOL.left - SCHOOL.side, SCHOOL.eave + 26],
    [SCHOOL.left, SCHOOL.eave],
    [(SCHOOL.left + SCHOOL.right) / 2, SCHOOL.peak],
    [SCHOOL.right, SCHOOL.eave],
    [SCHOOL.right, SCHOOL.ground],
  ],
};
export const ROAD = { top: 1010, bottom: 1150 } as const;

export const trialTimes = (tl: Bg49Timeline) => {
  const sc = sceneOf(tl, "trial");
  const f = (sec: number) => Math.round(sec * FPS) - sc.from;
  return {
    beam: 15,
    reveal: 28,
    revealed: 50,
    skyline: 84,
    condition: Math.max(f(wordTime(tl, "n04", 0)), 56),
    badge: Math.max(f(wordTime(tl, "n04", 2)), 70),
    route: Math.max(f(wordTime(tl, "n04", 3)), 84),
    decision: Math.max(f(wordTime(tl, "n04", 8)), 130),
    choice: Math.max(f(wordTime(tl, "n04", 11)), 150),
  };
};

// ---------- Сцена 6: подчёркивание логотипа ----------
export const WORDMARK_Y = 600; // базовая линия «BalaGo»
export const UNDERLINE: ShapeSrc = {
  kind: "path",
  key: "underline",
  d: "M 352 652 C 470 664 610 664 734 636",
};
