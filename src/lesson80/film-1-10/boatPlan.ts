// Лодочка Амира по шкале фильма 80-1-10: где она стоит на столе, кто её
// держит, насколько раскрыт уголок, прижат ли сгиб и что делают руки на
// крупном плане. Всё — чистые функции абсолютного кадра фильма f, времена
// берутся из шкалы (отрезки и реплики), поэтому при новой озвучке всё
// пересчитывается само. Без React/Remotion (читается тестами).
import { FPS } from "../core/video.ts";
import { clamp, easeIn, easeInOut, easeOut, lerp, smoothstep, type Vec } from "../rig/motion.ts";
import { BOAT_GRIPS, HINGE, creasePoint, pinchIndexTip, tiltDipMm } from "./boatModel.ts";
import { DESK } from "./layout.ts";
import { cueById, markOf, type L80Timeline } from "./timeline.ts";
import type { Cue } from "../core/timing.ts";

export type HandShape = "pinch" | "point" | "press" | "hold" | "relax";
// Чего касаются пальцы (для порядка слоёв на крупном плане):
//   sail  — щепоть у вершины паруса: указательный за парусом, большой спереди;
//   rim   — край ближнего борта: указательный внутри лодочки, большой спереди;
//   flap  — уголок: указательный за уголком, большой перед ним;
//   on    — пальцы лежат на бумаге спереди (поддержка, нажим);
//   none  — без касания.
export type HandGrip = "sail" | "rim" | "flap" | "on" | "none";

export type CloseHandState = {
  readonly tip: Vec; // кончик указательного (точка щепоти/касания), локальные ед. лодочки
  readonly shape: HandShape;
  readonly from: HandShape; // смешивание поз: from → shape
  readonly mix: number; // 0…1
  readonly angle: number; // градусы: направление кисти (0 — пальцы вниз; − — вниз-вправо, рука слева сверху; + — вниз-влево, рука справа сверху)
  readonly visible: number; // 0 — рука убрана за кадр вдоль предплечья, 1 — на месте
  readonly contact: number; // 0…1 плотность касания (кончики слегка сплющены)
  readonly grip: HandGrip;
};

export type BoatCarrier = "amir" | "yusuf" | null;
export type FrameSpan = { readonly from: number; readonly to: number };

export type BoatEvents = {
  // сцена 6: Юсуф берёт лодочку, уголок разгибается
  readonly take: number;
  readonly lift: number;
  readonly openStart: number;
  readonly openEnd: number;
  readonly setDown: number;
  readonly release: number;
  // ремонт
  readonly point: number;
  readonly holdStart: number;
  readonly holdSettled: number;
  readonly pinch: number;
  readonly foldBack: number;
  readonly foldEnd: number;
  readonly pressFrom: number;
  readonly pressTo: number;
  readonly letGo: number;
  readonly yusufRelax: number;
  readonly yusufGone: number;
  // переносы (движение самой лодочки)
  readonly moveToTree: FrameSpan;
  readonly moveAside: FrameSpan;
  // сцена 5 и 7: Амир берёт и отпускает
  readonly amirTake5: number;
  readonly amirRelease5: number;
  readonly amirTake7: number;
  readonly amirRelease7: number;
};

export type BoatPlan = {
  readonly open: (f: number) => number; // 0…1 (с лёгким перелётом ≈ 1.07 при раскрытии)
  readonly pressed: (f: number) => number; // 0…1 — доля сгиба, прижатая пальцем (от b к a)
  readonly desk: (f: number) => Vec; // мм стола (центр контакта)
  readonly lift: (f: number) => number; // мм над столом
  readonly tilt: (f: number) => number; // градусы (SVG, + по часовой) вокруг pivot
  readonly pivot: (f: number) => Vec; // локальные ед.: точка, вокруг которой наклоняется лодочка (захват)
  readonly carrier: (f: number) => BoatCarrier; // чья рука держит лодочку целиком
  readonly hands: (f: number) => { readonly yusuf: CloseHandState | null; readonly amir: CloseHandState | null };
  readonly amirNear: (f: number) => number; // 0 — Амир на своём месте, 1 — пересел к Юсуфу (фон крупного плана)
  readonly events: BoatEvents;
};

const sec = (s: number) => Math.round(s * FPS);
const ramp = (f: number, a: number, b: number) => clamp((f - a) / Math.max(1, b - a));
const bell = (f: number, a: number, b: number) => (f <= a || f >= b ? 0 : Math.sin(Math.PI * ((f - a) / (b - a))));
const mixV = (p: Vec, q: Vec, t: number): Vec => ({ x: lerp(p.x, q.x, t), y: lerp(p.y, q.y, t) });
const addV = (p: Vec, q: Vec): Vec => ({ x: p.x + q.x, y: p.y + q.y });

// Начало слова в реплике (по первым буквам) или доля реплики, если слова нет.
const wordStart = (c: Cue, prefix: string, frac: number) => {
  const w = c.words.find((x) => x.text.replace(/[^\p{L}]/gu, "").toLowerCase().startsWith(prefix));
  return w ? w.start : c.from + (c.to - c.from) * frac;
};

// Перелёт и успокоение раскрытия: 0 → 1.07 → 1.
const springOpen = (u: number) => {
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  if (u < 0.62) return 1.07 * easeOut(u / 0.62);
  return lerp(1.07, 1, easeInOut((u - 0.62) / 0.38));
};

const hand = (s: Partial<CloseHandState> & Pick<CloseHandState, "tip" | "shape">): CloseHandState => ({
  from: s.shape,
  mix: 1,
  angle: 0,
  visible: 1,
  contact: 0,
  grip: "none",
  ...s,
});

export const buildBoatPlan = (tl: L80Timeline): BoatPlan => {
  // ---------- отрезки шкалы ----------
  const m5 = markOf(tl, "лодочка к карточке");
  const mY = markOf(tl, "Юсуф берёт лодочку");
  const mSit = markOf(tl, "Амир садится рядом");
  const mA = markOf(tl, "Амир возвращает уголок");
  const mH = markOf(tl, "лодочка держит форму");
  const c32 = cueById(tl, 32);
  const c33 = cueById(tl, 33);
  const c34 = cueById(tl, 34);
  const c37 = cueById(tl, 37);
  const c32Krai = sec(wordStart(c32, "край", 0.2));

  const t5 = (s: number) => sec(m5.from + s);
  const tY = (s: number) => sec(mY.from + s);
  const tA = (s: number) => sec(mA.from + s);
  const t37 = (s: number) => sec(c37.from + s);

  // Амир тянется к уголку сразу после «Вот так?» (щепоть — к 0,35 с отрезка)
  const approach = Math.min(sec(mA.from), Math.max(sec(c33.to) + 2, sec(mA.from + 0.35) - sec(0.75)));
  const ev: BoatEvents = (() => {
    const holdStart = sec(wordStart(c32, "держи", 0.55));
    return {
      take: tY(1.1),
      lift: tY(1.2),
      openStart: tY(1.45),
      openEnd: tY(2.0),
      setDown: tY(2.8),
      release: tY(2.9),
      point: sec(c32.from + 0.15),
      holdStart,
      holdSettled: Math.min(holdStart + sec(1.1), sec(c32.to) - 2),
      pinch: tA(0.35),
      foldBack: tA(0.35),
      foldEnd: tA(1.55),
      pressFrom: tA(1.55),
      pressTo: tA(2.4),
      letGo: sec(wordStart(c34, "теперь", 0.35)),
      yusufRelax: sec(mH.from + 0.4),
      yusufGone: sec(mH.from + 1.4),
      moveToTree: { from: t5(1.0), to: t5(2.4) },
      moveAside: { from: t37(0.2), to: t37(1.6) },
      amirTake5: t5(0.9),
      amirRelease5: t5(2.8),
      amirTake7: t37(0.2),
      amirRelease7: t37(2.0),
    };
  })();

  // ---------- уголок ----------
  const open = (f: number) => {
    if (f < ev.openStart) return 0;
    if (f < ev.foldBack) return springOpen(ramp(f, ev.openStart, ev.openEnd));
    if (f < ev.foldEnd) return 1 - easeInOut(ramp(f, ev.foldBack, ev.foldEnd));
    return 0;
  };

  // Путь пальца при прижатии: от кончика сложенного уголка к b, затем по сгибу к a.
  const PRESS_HOP = sec(0.2);
  const creaseB = creasePoint(0.04);
  const creaseA = creasePoint(0.97);
  const pressU = (f: number) => easeInOut(ramp(f, ev.pressFrom + PRESS_HOP, ev.pressTo));
  const pressed = (f: number) => (f < ev.pressFrom + PRESS_HOP ? 0 : pressU(f));

  // ---------- положение на столе ----------
  const S = DESK.boatStart;
  const T = DESK.boatByTree;
  const A = DESK.boatAside;
  const travel = (f: number, sp: FrameSpan, p: Vec, q: Vec) => {
    const u = easeInOut(ramp(f, sp.from, sp.to));
    // лёгкая дуга: в середине пути чуть ближе к детям
    const arc = Math.sin(Math.PI * u) * 18;
    return { x: lerp(p.x, q.x, u), y: lerp(p.y, q.y, u) - arc };
  };
  const desk = (f: number): Vec => {
    if (f < ev.moveToTree.from) return { x: S.x, y: S.y };
    if (f < ev.moveToTree.to) return travel(f, ev.moveToTree, S, T);
    if (f < ev.moveAside.from) return { x: T.x, y: T.y };
    if (f < ev.moveAside.to) return travel(f, ev.moveAside, T, A);
    return { x: A.x, y: A.y };
  };

  const CARRY_LIFT = 8;
  const LOOK_LIFT = 8;
  const LOOK_TILT = 4;
  // сцена 6: Юсуф приподнимает, чтобы посмотреть (0 → 1 → 0)
  const look = (f: number) => (f >= ev.lift && f < ev.setDown ? easeInOut(ramp(f, ev.lift, tY(1.8))) * (1 - easeInOut(ramp(f, tY(2.3), ev.setDown))) : 0);
  // Наклон: при переносе за парус лодочка чуть отстаёт (разгон) и догоняет
  // (торможение); у Юсуфа, держащего за левый край, свободный правый нос
  // чуть опускается (+4°).
  const tilt = (f: number) => {
    if (f >= ev.moveToTree.from && f < ev.moveToTree.to) return 3 * Math.sin(2 * Math.PI * ramp(f, ev.moveToTree.from, ev.moveToTree.to));
    if (f >= ev.lift && f < ev.setDown) return LOOK_TILT * look(f);
    if (f >= ev.moveAside.from && f < ev.moveAside.to) return 3 * Math.sin(2 * Math.PI * ramp(f, ev.moveAside.from, ev.moveAside.to));
    return 0;
  };
  const pivot = (f: number): Vec => (f >= ev.take - 2 && f < ev.release + 2 ? BOAT_GRIPS.rimLeft : BOAT_GRIPS.sail);
  const baseLift = (f: number) => {
    // сцена 5
    if (f >= ev.amirTake5 && f < ev.moveToTree.to) {
      return CARRY_LIFT * easeInOut(ramp(f, ev.amirTake5 + 1, t5(1.25))) * (1 - easeInOut(ramp(f, t5(2.02), ev.moveToTree.to)));
    }
    if (f >= ev.lift && f < ev.setDown) return LOOK_LIFT * look(f);
    // сцена 7
    if (f >= ev.moveAside.from && f < ev.moveAside.to) {
      return CARRY_LIFT * easeInOut(ramp(f, ev.moveAside.from, t37(0.5))) * (1 - easeInOut(ramp(f, t37(1.25), ev.moveAside.to)));
    }
    return 0;
  };
  // Подъём (мм): наклонённая лодочка никогда не уходит ниже стола — к подъёму
  // добавляется провал самой низкой точки днища при наклоне (+ зазор 1.5 мм).
  const lift = (f: number) => {
    const b = baseLift(f);
    const tl0 = tilt(f);
    if (tl0 === 0) return b;
    return Math.max(b, tiltDipMm(tl0, pivot(f)) + 1.5 * clamp(b / 3));
  };

  const carrier = (f: number): BoatCarrier => {
    if (f >= ev.amirTake5 && f < ev.amirRelease5) return "amir";
    if (f >= ev.take && f < ev.release) return "yusuf";
    if (f >= ev.holdSettled && f < ev.yusufRelax) return "yusuf"; // придерживает посередине
    if (f >= ev.amirTake7 && f < ev.amirRelease7) return "amir";
    return null;
  };

  // ---------- руки на крупном плане ----------
  const SAIL = BOAT_GRIPS.sail;
  // Амир переносит лодочку за парус (сцены 5 и 7).
  const amirCarry = (f: number, reachFrom: number, take: number, setDown: number, release: number): CloseHandState | null => {
    const gone = release + sec(0.6);
    if (f < reachFrom || f >= gone) return null;
    const vis = easeOut(ramp(f, reachFrom, take));
    const close = smoothstep(ramp(f, take - sec(0.4), take));
    const letGo = smoothstep(ramp(f, setDown + sec(0.05), release));
    const up = easeIn(ramp(f, release - sec(0.05), gone));
    const tip = addV(SAIL, { x: -10 * up, y: -6 * letGo - 50 * up });
    return hand({
      tip,
      shape: letGo > 0 ? "relax" : "pinch",
      from: letGo > 0 ? "pinch" : "relax",
      mix: letGo > 0 ? letGo : close,
      angle: -24 - 6 * (1 - vis) + 4 * up,
      visible: vis * (1 - up),
      contact: close * (1 - letGo),
      grip: tip.y < SAIL.y - 22 ? "none" : "sail",
    });
  };

  const amir = (f: number): CloseHandState | null => {
    // сцена 5
    const s5 = amirCarry(f, t5(0.3), ev.amirTake5, ev.moveToTree.to, ev.amirRelease5);
    if (s5) return s5;
    // сцена 7
    const s7 = amirCarry(f, t37(-0.35), ev.amirTake7, ev.moveAside.to, ev.amirRelease7);
    if (s7) return s7;
    // ремонт: показывает → берёт уголок → возвращает → прижимает → отпускает
    const enter = ev.point;
    const gone = ev.letGo + sec(1.0);
    if (f < enter || f >= gone) return null;
    const P = BOAT_GRIPS.pointAt;
    // кончик указательного, пока Амир показывает и ждёт
    const pointTip = (g: number) => {
      const tap = bell(g, c32Krai - 3, c32Krai + sec(0.4)); // лёгкий «тычок» к уголку на слове «край» (без касания)
      const wait = easeInOut(ramp(g, ev.holdStart, ev.holdStart + sec(0.6))); // Юсуф кладёт руку — палец чуть отводится
      const breathe = Math.sin((g - enter) / 23) * 0.8;
      return { tip: addV(P, { x: 4 * tap - 3 * wait, y: 4 * tap - 4 * wait + breathe }), angle: -30 + 4 * wait };
    };
    if (f < approach) {
      const vis = easeOut(ramp(f, enter, enter + sec(0.75)));
      const toPoint = easeInOut(ramp(f, enter + sec(0.15), enter + sec(0.7)));
      const pt = pointTip(f);
      return hand({ tip: pt.tip, shape: "point", from: "relax", mix: toPoint, angle: pt.angle, visible: vis, contact: 0, grip: "none" });
    }
    if (f < ev.pinch) {
      // к вершине раскрытого уголка
      const u = smoothstep(ramp(f, approach, ev.pinch));
      const start = pointTip(approach);
      const tip = mixV(start.tip, pinchIndexTip(1), u);
      return hand({ tip, shape: "pinch", from: "point", mix: u, angle: lerp(start.angle, -22, u), contact: easeIn(u), grip: u > 0.9 ? "flap" : "none" });
    }
    if (f < ev.foldEnd) {
      // уголок возвращается по тому же сгибу; щепоть следует за вершиной
      // (большой палец — на flapTip, указательный — за уголком, у его кромки)
      const tip = pinchIndexTip(open(f));
      const u = ramp(f, ev.foldBack, ev.foldEnd);
      return hand({ tip, shape: "pinch", angle: lerp(-22, -34, easeInOut(u)), contact: 1, grip: "flap" });
    }
    if (f < ev.letGo) {
      // перескок на сгиб у b, затем указательный скользит от b к a и прижимает
      const hop = smoothstep(ramp(f, ev.pressFrom, ev.pressFrom + PRESS_HOP));
      const lifted = Math.sin(Math.PI * hop) * 5;
      const along = f < ev.pressFrom + PRESS_HOP ? mixV(pinchIndexTip(0), creaseB, hop) : mixV(creaseB, creaseA, pressU(f));
      // во время «Да.» палец остаётся на сгибе и чуть доглаживает его
      const stroke = f > ev.pressTo ? Math.sin(((f - ev.pressTo) / sec(0.5)) * Math.PI) * 1.2 : 0;
      const tip = addV(along, { x: -lifted * 0.7 - stroke, y: -lifted + stroke });
      return hand({ tip, shape: "press", from: "pinch", mix: hop, angle: lerp(-34, -30, hop), contact: 1 - Math.sin(Math.PI * hop) * 0.8, grip: hop < 0.5 ? "flap" : "on" });
    }
    // палец поднимается и уходит; уголок держится сам
    const up = smoothstep(ramp(f, ev.letGo, ev.letGo + sec(0.7)));
    const tip = addV(creaseA, { x: -28 * up, y: -40 * up });
    return hand({
      tip,
      shape: "relax",
      from: "press",
      mix: smoothstep(ramp(f, ev.letGo + 2, ev.letGo + sec(0.6))),
      angle: -30 - 6 * up,
      visible: 1 - easeIn(ramp(f, ev.letGo + sec(0.3), gone)),
      contact: 1 - ramp(f, ev.letGo, ev.letGo + 4),
      grip: "none",
    });
  };

  const RIM = BOAT_GRIPS.rimLeft;
  const HOLD = BOAT_GRIPS.holdMid;
  const yusuf = (f: number): CloseHandState | null => {
    // сцена 6: берёт за край у уголка, приподнимает, ставит обратно
    const reachFrom = tY(0.5);
    const goneA = tY(3.5);
    if (f >= reachFrom && f < goneA) {
      const vis = easeOut(ramp(f, reachFrom, ev.take));
      const close = smoothstep(ramp(f, ev.take - sec(0.4), ev.take));
      const letGo = smoothstep(ramp(f, ev.release, ev.release + sec(0.35)));
      const up = easeIn(ramp(f, ev.release + sec(0.15), goneA));
      // при раскрытии уголка пальцы чуть вздрагивают
      const flinch = bell(f, ev.openStart, ev.openStart + sec(0.35)) * 2.5;
      const tip = addV(RIM, { x: 4 * up + flinch * 0.4, y: -9 * letGo - 50 * up - flinch });
      return hand({
        tip,
        shape: letGo > 0 ? "relax" : "pinch",
        from: letGo > 0 ? "pinch" : "relax",
        mix: letGo > 0 ? letGo : close,
        angle: 30 + 6 * (1 - vis) - 3 * up,
        visible: vis * (1 - up),
        contact: close * (1 - letGo),
        grip: tip.y < RIM.y - 16 ? "none" : "rim",
      });
    }
    // ремонт: держит лодочку посередине
    if (f >= ev.holdStart && f < ev.yusufGone) {
      const vis = easeOut(ramp(f, ev.holdStart, ev.holdSettled - sec(0.15)));
      const settle = smoothstep(ramp(f, ev.holdSettled - sec(0.45), ev.holdSettled));
      const rel = smoothstep(ramp(f, ev.yusufRelax, ev.yusufRelax + sec(0.45)));
      const up = easeIn(ramp(f, ev.yusufRelax + sec(0.2), ev.yusufGone));
      // «Вот так?» — чуть крепче прижимает
      const firm = bell(f, sec(c33.from) - 3, sec(c33.to) + sec(0.3)) * 1.2;
      const hover = (1 - settle) * 10;
      const tip = addV(HOLD, { x: 6 * up, y: -hover + firm - 14 * rel - 40 * up });
      return hand({
        tip,
        shape: rel > 0 ? "relax" : "hold",
        from: rel > 0 ? "hold" : "relax",
        mix: rel > 0 ? rel : settle,
        angle: 22 + 8 * (1 - vis),
        visible: vis * (1 - up),
        contact: settle * (1 - rel),
        grip: "on",
      });
    }
    return null;
  };

  const hands = (f: number) => ({ yusuf: yusuf(f), amir: amir(f) });

  const amirNear = (f: number) => easeInOut(ramp(f, sec(mSit.from), sec(mSit.to)));

  return { open, pressed, desk, lift, tilt, pivot, carrier, hands, amirNear, events: ev };
};

// Поза лодочки в комнате для PaperBoat: x, y — точка контакта НА СТОЛЕ (без
// подъёма), остальное — отсюда:  <PaperBoat x={tableX} y={tableY} w={72} {...boatPose(bp, f)} />
// (подъём вычитать из y не нужно: PaperBoat поднимает лодочку сам, а тень
// оставляет на столе; pivot — та же ось наклона, что и на крупном плане).
export const boatPose = (plan: BoatPlan, f: number) => ({ open: plan.open(f), pressed: plan.pressed(f), lift: plan.lift(f), tilt: plan.tilt(f), pivot: plan.pivot(f) });

// Удобство: прижатый сгиб от b до a (для отладки и тестов).
export const PRESS_LINE = { from: HINGE.b, to: HINGE.a } as const;
