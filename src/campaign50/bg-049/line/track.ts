// Партитура жёлтой линии на весь ролик: ключевые кадры (абсолютные кадры
// ролика) с формой, видимой частью, толщиной и свечением. Между ключами
// линия перетекает (morph.ts). Ключи привязаны к сценам и к словам
// озвучки, поэтому при другой длине реплик линия остаётся синхронной.
import {
  BEAM,
  CURSOR,
  CUR_BUTTON,
  CUR_FIELD,
  CUR_RESULT,
  EDGE,
  EDGE_STUB,
  FOLD_FLAT,
  FOLD_MID,
  FOLD_SHAPE,
  LAND_DY,
  LOOP,
  MAGNIFIER,
  MAG_PATH,
  PHONE_SHAPE,
  Q_BIG,
  Q_DOT,
  Q_PATH,
  Q_THOUGHT,
  SKYLINE,
  UNDERLINE,
  formTimes,
  searchTimes,
  trialTimes,
} from "../layout.ts";
import { BG49_VIDEO } from "../script.ts";
import { sceneOf, type Bg49Timeline } from "../timing.ts";
import { clamp, easeBack, easeInOut, easeOut, lerp } from "../anim.ts";
import {
  morph,
  place,
  sample,
  type Place,
  type Pt,
  type Pts,
  type ShapeSrc,
} from "./morph.ts";

const FPS = BG49_VIDEO.fps;

export type Ease = "io" | "out" | "back" | "lin";

export type LineKey = {
  readonly f: number; // абсолютный кадр
  readonly pts: Pts; // форма в координатах кадра
  readonly a: number; // видимая часть линии: от доли a …
  readonly b: number; // … до доли b
  readonly w: number; // толщина
  readonly glow: number; // свечение (луч света), 0…1
  readonly fill: number; // белая заливка замкнутой формы (курсор), 0…1
  readonly dot: readonly [number, number, number]; // точка знака «?»: x, y, r
  readonly bob: number; // лёгкое покачивание (px)
  readonly stagger: number; // волна перетекания к этому ключу
  readonly ease: Ease; // кривая движения к этому ключу
};

type KeyIn = {
  readonly f: number;
  readonly shape: ShapeSrc;
  readonly at?: Place;
  readonly a?: number;
  readonly b?: number;
  readonly w?: number;
  readonly glow?: number;
  readonly fill?: number;
  readonly dot?: number; // радиус точки «?» в единицах формы (0 — нет)
  readonly bob?: number;
  readonly stagger?: number;
  readonly ease?: Ease;
};

const W = 15;

const make = (k: KeyIn): LineKey => {
  const at = k.at ?? {};
  const s = at.s ?? 1;
  const dotPos: Pt = k.shape.key === "qmark" ? place([Q_DOT], at)[0] : [0, 0];
  return {
    f: Math.round(k.f),
    pts: place(sample(k.shape), at),
    a: k.a ?? 0,
    b: k.b ?? 1,
    w: k.w ?? W,
    glow: k.glow ?? 0,
    fill: k.fill ?? 0,
    dot: [dotPos[0], dotPos[1], (k.dot ?? 0) * s],
    bob: k.bob ?? 0,
    stagger: k.stagger ?? 0.3,
    ease: k.ease ?? "io",
  };
};

export const buildLineTrack = (tl: Bg49Timeline): LineKey[] => {
  const keys: KeyIn[] = [];
  const sec = (s: number) => s * FPS;

  // 1. Вопрос: линия рисует большой «?», затем знак становится мыслью мамы.
  const h = sceneOf(tl, "hook");
  const hEnd = h.from + h.frames;
  // уже первый кадр показывает начало знака (обложка не пустая)
  keys.push({ f: h.from, shape: Q_PATH, at: Q_BIG, b: 0.1, w: 17 });
  keys.push({
    f: h.from + sec(1.15),
    shape: Q_PATH,
    at: Q_BIG,
    b: 1,
    w: 17,
    ease: "io",
  });
  keys.push({
    f: h.from + sec(1.6),
    shape: Q_PATH,
    at: Q_BIG,
    w: 17,
    dot: 26,
    ease: "back",
  });
  keys.push({
    f: h.from + sec(1.75),
    shape: Q_PATH,
    at: Q_BIG,
    w: 17,
    dot: 26,
  });
  keys.push({
    f: h.from + sec(2.55),
    shape: Q_PATH,
    at: Q_THOUGHT,
    w: 12,
    dot: 26,
    bob: 7,
    stagger: 0,
  });
  keys.push({
    f: hEnd - sec(0.55),
    shape: Q_PATH,
    at: Q_THOUGHT,
    w: 12,
    dot: 26,
    bob: 7,
  });
  // знак уходит вниз по правому краю кадра (мимо лица мамы) и ложится
  // коротким отрезком, который затем вырастает в край блокнота
  keys.push({
    f: hEnd - sec(0.1),
    shape: EDGE_STUB,
    w: 13,
    stagger: 0,
  });

  // 2. Край блокнота; после решения мамы линия обводит записанную фразу.
  const n = sceneOf(tl, "notebook");
  const nEnd = n.from + n.frames;
  const decide = Math.min(
    sec(tl.cues.find((c) => c.id === "m01")!.to) + sec(0.5),
    nEnd - sec(2.4),
  );
  keys.push({ f: n.from + sec(0.45), shape: EDGE, w: 13, stagger: 0.35 });
  keys.push({ f: decide, shape: EDGE, w: 13 });
  keys.push({ f: decide + sec(1.1), shape: LOOP, w: 12, stagger: 0.45 });
  keys.push({ f: nEnd - sec(0.5), shape: LOOP, w: 12 });

  // 3. Петля сжимается в курсор; курсор ведёт к странице BalaGo.
  const s = sceneOf(tl, "search");
  const st = searchTimes(tl);
  const sEnd = s.from + s.frames;
  const cur = (p: Pt, sc = 1.15): Place => ({ x: p[0], y: p[1], s: sc });
  keys.push({
    f: s.from + sec(0.45),
    shape: CURSOR,
    at: cur([520, 1110]),
    w: 9,
    fill: 1,
    stagger: 0.25,
  });
  keys.push({
    f: s.from + st.typeFrom - 4,
    shape: CURSOR,
    at: cur(CUR_FIELD),
    w: 9,
    fill: 1,
    stagger: 0,
  });
  keys.push({
    f: s.from + st.typeTo,
    shape: CURSOR,
    at: cur(CUR_FIELD),
    w: 9,
    fill: 1,
    stagger: 0,
  });
  keys.push({
    f: s.from + st.click - 3,
    shape: CURSOR,
    at: cur(CUR_RESULT),
    w: 9,
    fill: 1,
    stagger: 0,
  });
  keys.push({
    f: s.from + st.click + 2,
    shape: CURSOR,
    at: cur(CUR_RESULT, 0.98),
    w: 9,
    fill: 1,
    stagger: 0,
    ease: "out",
  });
  keys.push({
    f: s.from + st.click + 8,
    shape: CURSOR,
    at: cur(CUR_RESULT),
    w: 9,
    fill: 1,
    stagger: 0,
    ease: "out",
  });
  keys.push({
    f: s.from + st.title + 6,
    shape: CURSOR,
    at: cur([640, 640]),
    w: 9,
    fill: 1,
    stagger: 0,
  });
  keys.push({
    f: s.from + st.rows + 4,
    shape: CURSOR,
    at: cur([700, 820]),
    w: 9,
    fill: 1,
    stagger: 0,
  });
  keys.push({
    f: s.from + st.scroll + 16,
    shape: CURSOR,
    at: cur([690, 760]),
    w: 9,
    fill: 1,
    stagger: 0,
  });
  keys.push({
    f: s.from + st.press - 3,
    shape: CURSOR,
    at: cur(CUR_BUTTON),
    w: 9,
    fill: 1,
    stagger: 0,
  });
  keys.push({
    f: s.from + st.press + 2,
    shape: CURSOR,
    at: cur(CUR_BUTTON, 0.98),
    w: 9,
    fill: 1,
    stagger: 0,
    ease: "out",
  });
  keys.push({
    f: s.from + st.press + 8,
    shape: CURSOR,
    at: cur(CUR_BUTTON),
    w: 9,
    fill: 1,
    stagger: 0,
    ease: "out",
  });
  keys.push({
    f: Math.max(sEnd - sec(0.5), s.from + st.press + 9),
    shape: CURSOR,
    at: cur(CUR_BUTTON),
    w: 9,
    fill: 1,
    stagger: 0,
  });

  // 4. Курсор раскладывается в складку из трёх полей → корпус телефона →
  //    лупа подбора группы.
  const fo = sceneOf(tl, "form");
  const ft = formTimes(tl);
  const fEnd = fo.from + fo.frames;
  // курсор → сжатая «гармошка» → раскрытая складка (панели раскрываются)
  keys.push({ f: fo.from + sec(0.3), shape: FOLD_FLAT, w: 12, stagger: 0.3 });
  keys.push({ f: fo.from + sec(0.85), shape: FOLD_SHAPE, w: 12, stagger: 0 });
  keys.push({ f: fo.from + ft.foldOut, shape: FOLD_SHAPE, w: 12 });
  // складка снова сжимается и разворачивается в корпус телефона
  keys.push({
    f: fo.from + ft.foldOut + 9,
    shape: FOLD_MID,
    w: 12,
    stagger: 0,
  });
  keys.push({
    f: fo.from + ft.phoneIn,
    shape: PHONE_SHAPE,
    w: 12,
    stagger: 0.1,
  });
  keys.push({ f: fo.from + ft.searchIn, shape: PHONE_SHAPE, w: 12 });
  const mag = (p: Pt): Place => ({ x: p[0], y: p[1], s: 1 });
  keys.push({
    f: fo.from + ft.searchIn + 22,
    shape: MAGNIFIER,
    at: mag(MAG_PATH[0]),
    w: 13,
    stagger: 0.35,
  });
  const scanEnd = Math.max(
    fo.from + ft.noGuarantee,
    fo.from + ft.searchIn + 22 + 3 * 24,
  );
  const step = (scanEnd - (fo.from + ft.searchIn + 22)) / (MAG_PATH.length - 1);
  MAG_PATH.slice(1).forEach((p, i) =>
    keys.push({
      f: fo.from + ft.searchIn + 22 + step * (i + 1),
      shape: MAGNIFIER,
      at: mag(p),
      w: 13,
      stagger: 0,
    }),
  );
  keys.push({
    f: fEnd - sec(0.5),
    shape: MAGNIFIER,
    at: { x: 540, y: 690, s: 1.08 },
    w: 13,
    stagger: 0,
  });

  // 5. Лупа выпрямляется в вертикальный луч, луч открывает условный пример,
  //    затем линия рисует горизонт гор и объём школы.
  const t = sceneOf(tl, "trial");
  const tt = trialTimes(tl);
  const tEnd = t.from + t.frames;
  keys.push({
    f: t.from + tt.beam,
    shape: BEAM,
    w: 16,
    glow: 0.35,
    stagger: 0.25,
  });
  keys.push({
    f: t.from + tt.reveal,
    shape: BEAM,
    w: 34,
    glow: 1,
    ease: "out",
  });
  keys.push({ f: t.from + tt.revealed, shape: BEAM, w: 14, glow: 0.25 });
  keys.push({
    f: t.from + tt.skyline,
    shape: SKYLINE,
    at: { y: LAND_DY },
    w: 12,
    stagger: 0.5,
  });
  keys.push({ f: tEnd - sec(0.5), shape: SKYLINE, at: { y: LAND_DY }, w: 12 });

  // 6. Горизонт стягивается в линию под словом BalaGo и застывает.
  const c = sceneOf(tl, "cta");
  keys.push({ f: c.from + sec(0.75), shape: UNDERLINE, w: 18, stagger: 0.4 });
  keys.push({ f: tl.frames + 10, shape: UNDERLINE, w: 18 });
  return keys.sort((x, y) => x.f - y.f).map(make);
};

// Состояние линии на кадре f: между ключами — перетекание формы.
const EASE: Record<Ease, (x: number) => number> = {
  io: easeInOut,
  out: easeOut,
  back: easeBack,
  lin: (x) => clamp(x),
};

export type LineState = {
  readonly pts: LineKey["pts"];
  readonly a: number;
  readonly b: number;
  readonly w: number;
  readonly glow: number;
  readonly fill: number;
  readonly dot: readonly [number, number, number];
  readonly bob: number;
  readonly drawing: boolean;
};

export const lineState = (
  keys: readonly LineKey[],
  f: number,
): LineState | null => {
  if (!keys.length || f < keys[0].f) return null;
  let i = 0;
  while (i < keys.length - 1 && keys[i + 1].f <= f) i++;
  const k0 = keys[i];
  const k1 = keys[Math.min(i + 1, keys.length - 1)];
  if (k1 === k0 || f >= k1.f) return { ...k0, drawing: false };
  const raw = (f - k0.f) / Math.max(1, k1.f - k0.f);
  const ease = EASE[k1.ease];
  const t = ease(raw);
  const same = k0.pts === k1.pts;
  const pts = same ? k0.pts : morph(k0.pts, k1.pts, raw, k1.stagger, ease);
  const dotPos: [number, number] =
    k1.dot[2] > 0
      ? [lerp(k0.dot[0], k1.dot[0], t), lerp(k0.dot[1], k1.dot[1], t)]
      : [k0.dot[0], k0.dot[1]];
  return {
    pts,
    a: lerp(k0.a, k1.a, t),
    b: lerp(k0.b, k1.b, t),
    w: lerp(k0.w, k1.w, t),
    glow: lerp(k0.glow, k1.glow, t),
    // заливка курсора не «размазывается» по чужой форме: гаснет в начале
    // перетекания и появляется только в самом конце
    fill:
      k1.fill < k0.fill
        ? k0.fill * (1 - clamp(raw * 5))
        : k1.fill > k0.fill
          ? k1.fill * clamp((raw - 0.8) * 5)
          : k0.fill,
    dot: [dotPos[0], dotPos[1], Math.max(0, lerp(k0.dot[2], k1.dot[2], t))],
    bob: lerp(k0.bob, k1.bob, t),
    drawing: k1.b > k0.b + 0.01 && raw < 1,
  };
};
