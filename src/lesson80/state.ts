// Состояние кадра 80-1-14 — чистая функция номера кадра и таймлайна:
// позы, взгляды, губы, стаканы, кувшин, лист. Никаких таймеров, накопления
// состояния или Math.random(): повторный рендер кадра даёт ту же картинку.
import { AMIR, BILAL, hash01, KIDS, kidDims, TEACHER, YUSUF, depthScale, type Kid } from "./cast";
import { FACE_REST, kidGeometry, TEACHER_DIMS, type BodyPose, type FacePose, type HandTarget } from "./art/Body";
import { MOUTH_REST, type MouthState } from "./art/Head";
import { CUP, JUG, type PencilId } from "./art/Props";
import { LAYOUT } from "./art/Room";
import { ICONS, pencilTip, EMPTY_SPOT, titleTip, SHEET } from "./art/Sheet";
import { SHEET_TABLE_W, sheetToWorld, type CupState, type SheetPlacement, type WorldState } from "./art/World";
import type { L80Timeline } from "./timeline";
import type { L80Role } from "./script";

// ---------- математика ----------
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const ease = (t: number) => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};
export const sm = (f: number, a: number, b: number) => (b <= a ? (f >= b ? 1 : 0) : ease((f - a) / (b - a)));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
type P = { x: number; y: number };
const lp = (a: P, b: P, t: number): P => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
// дуга: при переносе предмет слегка поднимается
const arc = (a: P, b: P, t: number, h: number): P => {
  const p = lp(a, b, t);
  return { x: p.x, y: p.y - Math.sin(Math.PI * clamp(t, 0, 1)) * h };
};
const rot = (p: P, deg: number): P => {
  const r = (deg * Math.PI) / 180;
  return { x: p.x * Math.cos(r) - p.y * Math.sin(r), y: p.x * Math.sin(r) + p.y * Math.cos(r) };
};
const add = (a: P, b: P): P => ({ x: a.x + b.x, y: a.y + b.y });

// ---------- постоянные места реквизита (мир) ----------
export const SPOTS = {
  yusufCup: { x: 1415, y: 1188 },
  amirCupHome: { x: 1092, y: 1182 },
  amirCupNear: { x: 1240, y: 1184 }, // Амир ставит стакан в пределах досягаемости
  lifted: { x: 1372, y: 1112 }, // Юсуф поднял стакан двумя руками
  handover: { x: 1478, y: 1098 }, // стакан переходит от Юсуфа к учителю
  pourCup: { x: 1545, y: 1206 }, // учитель ставит стакан, чтобы налить
  jugHome: { x: 1652, y: 1166 },
  sheetStart: { x: 1545, y: 1242 }, // чистый лист перед учителем (сцена 1)
  sheetBilal: { x: 1835, y: 1200 }, // лист перед Билалом
  sheetYusuf: { x: 1335, y: 1234 }, // сцена 7: лист повёрнут к друзьям
  sheetWrite: { x: 1545, y: 1238 }, // сцена 8: учитель подписывает лист
  pencilCase: { x: 1680, y: 1192 },
} as const;

// ---------- озвучка: кто говорит в кадре f ----------
type Speaking = { id: string; role: L80Role; mouth: MouthState } | null;

const ADDRESSEE: Record<string, L80Role | "camera" | "sheet" | "cup" | "window" | "board" | "kids"> = {
  "01": "cup", "02": "yusuf", "03": "cup", "04": "yusuf", "05": "teacher", "06": "bilal", "07": "amir", "08": "camera",
  "09": "teacher", "10": "teacher", "11": "teacher", "12": "window", "13": "yusuf", "14": "yusuf", "15": "amir", "16": "sheet",
  "17": "bilal", "18": "kids", "19": "teacher", "20": "camera", "21": "teacher", "22": "kids", "23": "teacher", "24": "bilal",
  "25": "teacher", "26": "yusuf", "27": "yusuf", "28": "teacher", "29": "teacher", "30": "amir", "31": "camera", "32": "amir",
  "33": "yusuf", "34": "amir", "35": "yusuf", "36": "amir", "37": "kids", "38": "board", "39": "yusuf", "40": "amir", "41": "teacher",
};

type Ctx = {
  tl: L80Timeline;
  M: (name: string) => number;
  lineIds: string[];
  draws: { i: number; swapFrom: number; drawFrom: number; drawTo: number }[];
};

const ctxCache = new WeakMap<L80Timeline, Ctx>();
const DRAW_LEN = [46, 56, 62, 56, 46, 52, 64];
const SWAP = 26;

const getCtx = (tl: L80Timeline): Ctx => {
  const c = ctxCache.get(tl);
  if (c) return c;
  const M = (name: string) => {
    const v = tl.marks[name];
    if (v === undefined) throw new Error(`нет метки ${name}`);
    return v;
  };
  // расписание рисования: после предложения; смена карандаша — видимое действие
  const draws: Ctx["draws"] = [];
  let prevEnd = 0;
  for (let i = 0; i < 7; i++) {
    const start = Math.max(M(`d${i + 1}`), prevEnd + 4);
    const swapFrom = start;
    const drawFrom = start + (i === 0 ? 8 : SWAP);
    const drawTo = drawFrom + DRAW_LEN[i];
    draws.push({ i, swapFrom, drawFrom, drawTo });
    prevEnd = drawTo;
  }
  const ctx = { tl, M, lineIds: Object.keys(tl.lines).sort(), draws };
  ctxCache.set(tl, ctx);
  return ctx;
};

const speakingAt = (c: Ctx, f: number): Speaking => {
  for (const id of c.lineIds) {
    const l = c.tl.lines[id];
    if (f >= l.from && f < l.to) {
      const mf = l.line.mouth[f - l.from];
      const sp = f >= l.speechFrom - 1 && f <= l.speechTo + 1;
      const mouth: MouthState = mf
        ? { open: mf[0], round: mf[1], wide: mf[2], smile: 0.25 }
        : sp
          ? { open: 0.25 + 0.35 * Math.abs(Math.sin(f * 0.9)), round: 0, wide: 0.3, smile: 0.25 }
          : MOUTH_REST;
      return { id, role: l.line.role as L80Role, mouth };
    }
  }
  return null;
};

const lastSpeaker = (c: Ctx, f: number): { id: string; role: L80Role; ago: number } | null => {
  let best: { id: string; role: L80Role; ago: number } | null = null;
  for (const id of c.lineIds) {
    const l = c.tl.lines[id];
    if (l.from <= f) {
      const ago = f - l.to;
      if (!best || l.from > c.tl.lines[best.id].from) best = { id, role: l.line.role as L80Role, ago };
    }
  }
  return best;
};

// ---------- головы (для линий взгляда) ----------
const kidHead = (k: Kid): P => {
  const g = kidGeometry(k);
  const s = k.behindTable ? 1 : depthScale(k.y);
  return { x: k.x, y: k.y + g.headCY * s };
};
export const TEACHER_STAND_Y = 965;
const teacherHead = (standing: boolean): P =>
  standing ? { x: 2050, y: TEACHER_STAND_Y - (TEACHER_DIMS.standing - TEACHER_DIMS.headH / 2) * depthScale(TEACHER_STAND_Y) } : { x: TEACHER.x, y: TEACHER.y - TEACHER_DIMS.seated + TEACHER_DIMS.headH / 2 };

const ROLE_KID: Record<Exclude<L80Role, "teacher">, Kid> = { yusuf: YUSUF, amir: AMIR, bilal: BILAL };

type Look = P | "camera";

const lookToFace = (from: P, to: Look, baseTurn: number): Pick<FacePose, "turn" | "gazeX" | "gazeY"> => {
  if (to === "camera") return { turn: baseTurn * 0.3, gazeX: 0, gazeY: 0.05 };
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return {
    turn: clamp(baseTurn * 0.4 + dx / 900, -0.6, 0.6),
    gazeX: clamp(dx / 260, -1, 1),
    gazeY: clamp(dy / 320, -0.7, 0.9),
  };
};

// ---------- моргание и дыхание ----------
const blinkOf = (id: string, f: number) => {
  const period = 95 + Math.floor(hash01(id) * 80);
  const ph = Math.floor(hash01(id + "b") * period);
  const t = (f + ph) % period;
  // иногда двойное моргание
  const dbl = hash01(`${id}-${Math.floor((f + ph) / period)}`) > 0.82;
  const tri = (x: number) => (x < 0 || x > 5 ? 0 : x < 2.5 ? x / 2.5 : (5 - x) / 2.5);
  return Math.max(tri(t), dbl ? tri(t - 8) : 0);
};
const breathOf = (id: string, f: number) => Math.sin((f / (48 + hash01(id + "r") * 26)) * Math.PI * 2 + hash01(id) * 6);

// ---------- состояние реквизита ----------
type Props = {
  yusufCup: CupState & { holder: "table" | "yusuf" };
  amirCup: CupState & { holder: "table" | "amir" | "yusuf" | "teacher" | "both" };
  jug: { x: number; y: number; tilt: number; level: number; held: boolean };
  stream: number;
  sheet: SheetPlacement;
  icons: number[];
  title: number;
  pencil: PencilId | null;
  tip: P | null; // кончик карандаша (мир)
  tipDown: boolean;
};

const cupMouth = (k: Kid, lean: number): P => {
  const g = kidGeometry(k);
  return { x: k.x + lean * 1.1, y: k.y + g.headCY + g.headH * 0.31 };
};

// стакан у губ: край стакана у нижней губы, стакан перед ртом
const cupAtMouth = (k: Kid, lean: number, tilt: number, side: number): P => {
  const m = cupMouth(k, lean);
  const rim = rot({ x: 0, y: -CUP.h }, tilt);
  return { x: m.x - rim.x + side * 2, y: m.y - rim.y + 5 };
};

const drinkCycle = (f: number, a: number, b: number, sips: number) => {
  // −14° … −22°: несколько небольших глотков
  if (f < a || f > b) return -14;
  const t = (f - a) / (b - a);
  return -14 - 8 * Math.pow(Math.sin(t * Math.PI * sips), 2);
};

const sheetPlacement = (c: Ctx, f: number): SheetPlacement => {
  const M = c.M;
  const S = SPOTS;
  // сцена 2: учитель берёт чистый лист и кладёт перед Билалом
  const p0 = M("s2.paper");
  const p1 = M("s2.paperDown");
  if (f < p0 + 10) return { mode: "table", cx: S.sheetStart.x, cy: S.sheetStart.y, rot: 0, lift: 0 };
  if (f < p1) {
    const t = sm(f, p0 + 10, p1 - 4);
    const pos = lp(S.sheetStart, S.sheetBilal, t);
    return { mode: "table", cx: pos.x, cy: pos.y, rot: 180 * t, lift: Math.sin(Math.PI * t) * 48 + (1 - sm(f, p1 - 10, p1)) * 4 };
  }
  // сцена 7: Билал приподнимает лист и показывает друзьям, учитель кладёт его перед Юсуфом
  const t0 = M("s7.turn");
  const t1 = M("s7.touch");
  if (f < t0) return { mode: "table", cx: S.sheetBilal.x, cy: S.sheetBilal.y, rot: 180, lift: 0 };
  if (f < t1) {
    const k = (f - t0) / (t1 - t0);
    if (k < 0.45) {
      // Билал поднимает лист за край и поворачивает к друзьям
      const u = sm(k, 0, 0.45);
      return { mode: "table", cx: lerp(S.sheetBilal.x, 1760, u), cy: S.sheetBilal.y, rot: lerp(180, 360, u), lift: u * 55 };
    }
    // учитель принимает лист и кладёт перед Юсуфом
    const u = sm(k, 0.5, 1);
    const pos = lp({ x: 1760, y: S.sheetBilal.y }, S.sheetYusuf, u);
    return { mode: "table", cx: pos.x, cy: pos.y, rot: 360, lift: 55 * (1 - u) + Math.sin(Math.PI * u) * 20 };
  }
  // сцена 8: учитель придвигает лист к себе и подписывает, затем — на доске
  const w0 = M("s8.take");
  const w1 = M("s8.write");
  const b0 = M("s8.board");
  if (f < w0) return { mode: "table", cx: S.sheetYusuf.x, cy: S.sheetYusuf.y, rot: 0, lift: 0 };
  if (f < w1) {
    const u = sm(f, w0 + 4, w1 - 4);
    const pos = lp(S.sheetYusuf, S.sheetWrite, u);
    return { mode: "table", cx: pos.x, cy: pos.y, rot: 0, lift: Math.sin(Math.PI * u) * 8 };
  }
  if (f < b0) return { mode: "table", cx: S.sheetWrite.x, cy: S.sheetWrite.y, rot: 0, lift: 0 };
  // у доски: учитель прикладывает лист рядом с плакатом
  const pin = LAYOUT.pinned;
  const u = sm(f, b0, b0 + 26);
  return { mode: "upright", x: lerp(pin.x + 40, pin.x, u), y: lerp(pin.y + 30, pin.y, u), w: pin.w, tilt: lerp(-4, 0, u) };
};

const iconsAt = (c: Ctx, f: number) =>
  c.draws.map((d) => {
    const p = clamp((f - d.drawFrom) / (d.drawTo - d.drawFrom), 0, 1);
    return p;
  });

const pencilAt = (c: Ctx, f: number): PencilId | null => {
  const M = c.M;
  if (f < M("s2.pencil") + 8) return null;
  if (f >= M("s3.stop") + 10) return null;
  // карандаш в руке — от взятия до следующей смены
  let held: PencilId = ICONS[0].pencil;
  for (const d of c.draws) {
    if (f >= d.swapFrom + SWAP / 2 && d.i > 0) held = ICONS[d.i].pencil;
  }
  // во время смены карандаш в пенале не лежит только в руке
  for (const d of c.draws) {
    if (d.i > 0 && f >= d.swapFrom + SWAP * 0.4 && f < d.swapFrom + SWAP * 0.6) return null;
  }
  return held;
};

const propsAt = (c: Ctx, f: number): Props => {
  const M = c.M;
  const S = SPOTS;
  // ----- стакан Юсуфа -----
  let yc: Props["yusufCup"] = { ...S.yusufCup, level: 0.75, tilt: 0, holder: "table" };
  const r0 = M("s1.reach");
  const l0 = M("s1.lift");
  const s0 = M("s1.sip");
  const w0 = M("s1.lower");
  const set0 = M("s1.set");
  if (f >= l0 && f < set0) {
    const lean = 6;
    const mouthPos = cupAtMouth(YUSUF, lean, -14, 0);
    let pos: P;
    let tilt: number;
    if (f < s0) {
      const t = sm(f, l0, s0);
      pos = arc(S.yusufCup, mouthPos, t, 10);
      tilt = -14 * t;
    } else if (f < w0) {
      tilt = drinkCycle(f, s0, w0, 3);
      pos = cupAtMouth(YUSUF, lean, tilt, 0);
    } else {
      const t = sm(f, w0, set0);
      pos = arc(mouthPos, S.yusufCup, t, 8);
      tilt = -14 * (1 - t);
    }
    yc = { x: pos.x, y: pos.y, tilt, level: lerp(0.75, 0.55, sm(f, s0, w0)), holder: "yusuf" };
  } else if (f >= set0) yc = { ...yc, level: 0.55 };
  if (f >= r0 && f < l0) yc = { ...yc, holder: "yusuf" };

  // ----- стакан Амира -----
  let ac: Props["amirCup"] = { ...S.amirCupHome, level: 0, tilt: 0, holder: "table" };
  const a0 = M("s6.amirCup");
  const a1 = M("s6.amirSet");
  const gG = M("s6.grasp");
  const gC = M("s6.carry");
  const tG = M("s6.tgrasp");
  const rel = M("s6.release");
  const tS = M("s6.tset");
  const jL = M("s6.jugLift");
  const pr = M("s6.pour");
  const jB = M("s6.jugBack");
  const pl = M("s6.place");
  const aR = M("s6.amirReach");
  const aL = M("s6.amirLift");
  const aS = M("s6.amirSip");
  const aW = M("s6.amirLower");
  const aE = M("s6.end");
  const pourLen = jB - pr;
  const levelAfterPour = 0.72;
  if (f >= a0 + 14 && f < a1) {
    const t = sm(f, a0 + 14, a1 - 4);
    const pos = arc(S.amirCupHome, S.amirCupNear, t, 14);
    ac = { ...pos, level: 0, tilt: 0, holder: "amir" };
  } else if (f >= a1 && f < gC) {
    ac = { ...S.amirCupNear, level: 0, tilt: 0, holder: f >= gG ? "yusuf" : f < a1 + 6 ? "amir" : "table" };
  } else if (f >= gC && f < rel) {
    const mid = gC + Math.round((tG - gC) * 0.4);
    const pos = f < mid ? arc(S.amirCupNear, S.lifted, sm(f, gC, mid), 6) : arc(S.lifted, S.handover, sm(f, mid, tG), 8);
    ac = { ...pos, level: 0, tilt: 0, holder: f >= tG ? "both" : "yusuf" };
  } else if (f >= rel && f < tS + 4) {
    const t = sm(f, rel, tS);
    const pos = arc(S.handover, S.pourCup, t, 0);
    ac = { ...pos, level: 0, tilt: 0, holder: "teacher" };
  } else if (f >= tS + 4 && f < pl) {
    // налито: уровень растёт только пока течёт струя
    const lv = levelAfterPour * sm(f, pr + 14, jB - 10);
    ac = { ...S.pourCup, level: lv, tilt: 0, holder: "table" };
  } else if (f >= pl && f < aR) {
    const t = sm(f, pl + 8, aR - 4);
    const pos = arc(S.pourCup, S.amirCupNear, t, 12);
    ac = { ...pos, level: levelAfterPour, tilt: 0, holder: f < aR - 4 ? "teacher" : "table" };
  } else if (f >= aR && f < aE) {
    const lean = 18;
    const mouthPos = cupAtMouth(AMIR, lean, -14, 0);
    let pos: P = S.amirCupNear;
    let tilt = 0;
    if (f >= aL && f < aS) {
      const t = sm(f, aL, aS);
      pos = arc(S.amirCupNear, mouthPos, t, 8);
      tilt = -14 * t;
    } else if (f >= aS && f < aW) {
      tilt = drinkCycle(f, aS, aW, 2);
      pos = cupAtMouth(AMIR, lean, tilt, 0);
    } else if (f >= aW) {
      const t = sm(f, aW, aE - 6);
      pos = arc(mouthPos, S.amirCupNear, t, 6);
      tilt = -14 * (1 - t);
    }
    ac = { ...pos, level: lerp(levelAfterPour, 0.58, sm(f, aS, aW)), tilt, holder: f < aE - 4 ? "amir" : "table" };
  } else if (f >= aE) {
    ac = { ...S.amirCupNear, level: 0.58, tilt: 0, holder: "table" };
  }

  // ----- кувшин -----
  let jug: Props["jug"] = { ...S.jugHome, tilt: 0, level: 0.85, held: false };
  // носик над стаканом: при наклоне −52° носик смещён на (−96, −27) от дна
  const pourPos = { x: S.pourCup.x + 100, y: S.pourCup.y - 57 };
  if (f >= jL && f < pl) {
    const lift = sm(f, jL + 8, pr);
    const back = sm(f, jB, pl - 6);
    const tiltIn = sm(f, pr, pr + 16) * (1 - sm(f, jB - 14, jB));
    const pos = lp(lp(S.jugHome, pourPos, lift), S.jugHome, back);
    jug = {
      x: pos.x,
      y: pos.y - Math.sin(Math.PI * lift) * 10 * (1 - back),
      tilt: -52 * tiltIn,
      level: lerp(0.85, 0.66, sm(f, pr + 14, jB - 10)),
      held: f >= jL + 6 && f < pl - 2,
    };
  } else if (f >= pl) jug = { ...jug, level: 0.66 };
  const stream = f >= pr + 12 && f < jB - 10 ? Math.min(sm(f, pr + 12, pr + 18), 1 - sm(f, jB - 16, jB - 10)) : 0;
  void pourLen;

  // ----- лист -----
  const sheet = sheetPlacement(c, f);
  const icons = iconsAt(c, f);
  let title = 0;
  const wr0 = M("s8.write");
  if (f >= wr0 + 14) title = sm(f, wr0 + 14, M("s8.board") - 10);
  // ----- карандаш -----
  const pencil = pencilAt(c, f);
  let tip: P | null = null;
  let tipDown = false;
  const active = c.draws.find((d) => f >= d.drawFrom - 6 && f < d.drawTo + 4);
  if (active && sheet.mode === "table") {
    const p = clamp((f - active.drawFrom) / (active.drawTo - active.drawFrom), 0, 1);
    const t = pencilTip(active.i, p);
    const hover = f < active.drawFrom || f >= active.drawTo ? 6 : 0;
    const w = sheetToWorld(sheet, t.x, t.y);
    tip = { x: w.x, y: w.y - hover };
    tipDown = t.down && hover === 0;
  }
  return { yusufCup: yc, amirCup: ac, jug, stream, sheet, icons, title, pencil, tip, tipDown };
};

// ---------- позы ----------
// руки лежат на столе перед собой (предплечья вперёд, к зрителю)
const tableRest = (k: Kid, side: -1 | 1): HandTarget => {
  const g = kidGeometry(k);
  return { x: side * g.shoulderW * 0.36, y: 1212 - k.y, type: "rest" };
};
const toLocal = (k: Kid, p: P, type: HandTarget["type"], angle?: number, extra?: Partial<HandTarget>): HandTarget => ({
  x: p.x - k.x,
  y: p.y - k.y,
  type,
  angle,
  ...extra,
});
const tLocal = (p: P, type: HandTarget["type"], angle?: number): HandTarget => ({ x: p.x - TEACHER.x, y: p.y - TEACHER.y, type, angle });

const mixHand = (a: HandTarget, b: HandTarget, t: number): HandTarget => (t <= 0 ? a : t >= 1 ? b : { ...(t < 0.5 ? a : b), x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });

// захват стакана сбоку (side −1 — левая сторона стакана)
const cupGrip = (c: CupState, side: -1 | 1, h = 0.55): P => add({ x: c.x, y: c.y }, rot({ x: side * (CUP.top / 2 - 1), y: -CUP.h * h }, c.tilt));

type Who = "yusuf" | "amir" | "bilal" | "teacher";

// во время какого действия кто смотрит куда (мир)
const focusOverride = (c: Ctx, f: number, who: Who, pr: Props): Look | null => {
  const M = c.M;
  const sheetC = pr.sheet.mode === "table" ? { x: pr.sheet.cx, y: pr.sheet.cy } : { x: LAYOUT.pinned.x + 150, y: LAYOUT.pinned.y + 100 };
  // питьё Юсуфа: класс смотрит на него, он — на стакан
  if (f >= M("s1.reach") && f < M("s1.exhale")) {
    if (who === "yusuf") return { x: pr.yusufCup.x, y: pr.yusufCup.y - 30 };
    return kidHead(YUSUF);
  }
  if (f >= M("s2.paper") && f < M("s2.paperDown") + 6) return sheetC;
  // рисование: Билал смотрит на лист (если не говорит)
  const drawing = c.draws.find((d) => f >= d.swapFrom && f < d.drawTo + 6);
  if (drawing && who === "bilal") {
    if (f < drawing.drawFrom && drawing.i > 0) return { x: SPOTS.pencilCase.x, y: SPOTS.pencilCase.y };
    return sheetC;
  }
  if (f >= M("s3.look3") && f < M("s3.window")) return who === "teacher" ? kidHead(YUSUF) : sheetC;
  if (f >= M("s3.window") && f < M("12.end") && who === "yusuf") return { x: 470, y: 330 };
  if (f >= M("s3.count") && f < M("16.start")) return sheetC;
  if (f >= M("s4.empty") && f < M("s4.up") && who === "yusuf") {
    return sheetToWorld(pr.sheet, EMPTY_SPOT.x, EMPTY_SPOT.y);
  }
  // интерактивные паузы: учитель доброжелательно ждёт (смотрит на класс и зрителей), дети думают
  for (const p of c.tl.pauses) {
    if (f >= p.from && f < p.to) {
      if (who === "teacher") return f < p.from + 60 ? "camera" : kidHead(YUSUF);
      if (p.name === "p1") return f < p.from + 70 ? sheetC : { x: 1540, y: 820 };
      if (p.name === "p2") return f < p.from + 80 ? { x: 1460, y: 760 } : sheetC;
      if (p.name === "p3") return who === "amir" ? { x: pr.amirCup.x, y: pr.amirCup.y - 30 } : who === "yusuf" ? { x: pr.amirCup.x, y: pr.amirCup.y - 30 } : kidHead(YUSUF);
    }
  }
  if (f >= M("s5.jug") && f < M("26.start")) return { x: SPOTS.jugHome.x, y: SPOTS.jugHome.y - 60 };
  if (f >= M("s6.amirCup") && f < M("s6.amirSet") + 4) return { x: pr.amirCup.x, y: pr.amirCup.y - 30 };
  if (f >= M("s6.reach") && f < M("s6.end")) {
    if (f < M("s6.tset")) return { x: pr.amirCup.x, y: pr.amirCup.y - 26 };
    if (f < M("s6.amirReach")) return { x: SPOTS.pourCup.x, y: SPOTS.pourCup.y - 40 };
    if (who === "amir") return f < M("s6.amirLift") ? { x: pr.amirCup.x, y: pr.amirCup.y - 26 } : "camera";
    return kidHead(AMIR);
  }
  if (f >= M("s7.turn") && f < M("34.start")) return sheetC;
  if (f >= M("s7.view") && f < M("s8.board")) return sheetC;
  if (f >= M("s8.board") && f < M("38.start")) return { x: LAYOUT.pinned.x + 150, y: LAYOUT.pinned.y + 100 };
  return null;
};

const rolePos = (role: L80Role, standing: boolean): P => (role === "teacher" ? teacherHead(standing) : kidHead(ROLE_KID[role]));

const lookTargetRaw = (c: Ctx, f: number, who: Who, pr: Props, standing: boolean): Look => {
  const ov = focusOverride(c, f, who, pr);
  const sp = speakingAt(c, f);
  if (sp && sp.role === who) {
    const a = ADDRESSEE[sp.id];
    // свои особые взгляды говорящего
    if (sp.id === "03") {
      const l = c.tl.lines["03"];
      return f < (l.speechFrom + l.speechTo) / 2 ? { x: pr.yusufCup.x, y: pr.yusufCup.y - 30 } : teacherHead(false);
    }
    if (sp.id === "16") return f < c.tl.lines["16"].speechFrom + 12 ? { x: SPOTS.sheetBilal.x, y: SPOTS.sheetBilal.y } : kidHead(YUSUF);
    if (sp.id === "34") return sheetToWorld(pr.sheet, ICONS[6].cx, ICONS[6].cy);
    if (a === "camera") return "camera";
    if (a === "cup") return { x: pr.yusufCup.x, y: pr.yusufCup.y - 30 };
    if (a === "window") return f < c.tl.lines["12"].speechFrom + 20 ? { x: 470, y: 330 } : kidHead(BILAL);
    if (a === "sheet") return { x: SPOTS.sheetBilal.x, y: SPOTS.sheetBilal.y };
    if (a === "board") return { x: LAYOUT.pinned.x + 150, y: LAYOUT.pinned.y + 100 };
    if (a === "kids") return f % 200 < 100 ? kidHead(YUSUF) : kidHead(AMIR);
    return rolePos(a as L80Role, standing);
  }
  if (ov) return ov;
  if (sp) return rolePos(sp.role, standing);
  const ls = lastSpeaker(c, f);
  if (ls && ls.role !== who) return rolePos(ls.role, standing);
  if (ls && ls.role === who) {
    // после своей реплики — на собеседника
    const a = ADDRESSEE[ls.id];
    if (a === "yusuf" || a === "amir" || a === "bilal" || a === "teacher") return rolePos(a, standing);
  }
  return who === "teacher" ? kidHead(YUSUF) : teacherHead(standing);
};

// сглаженный взгляд: среднее по недавним кадрам (детерминированный фильтр)
const smoothLook = (c: Ctx, f: number, who: Who, from: P, base: number, pr: (ff: number) => Props, standing: boolean, lag: number) => {
  let turn = 0;
  let gx = 0;
  let gy = 0;
  const N = 6;
  for (let k = 0; k < N; k++) {
    const ff = Math.max(0, f - lag - k * 2);
    const t = lookToFace(from, lookTargetRaw(c, ff, who, pr(ff), standing), base);
    turn += t.turn;
    gx += t.gazeX;
    gy += t.gazeY;
  }
  return { turn: turn / N, gazeX: gx / N, gazeY: gy / N };
};

const smileOf = (c: Ctx, f: number, base: number) => {
  // тёплые моменты: благодарность и хвала
  let s = base;
  for (const id of ["02", "28", "33", "35", "37", "41"]) {
    const l = c.tl.lines[id];
    if (l) s = Math.max(s, base + 0.35 * sm(f, l.from - 6, l.from + 10) * (1 - sm(f, l.to + 30, l.to + 60)));
  }
  return s;
};

const faceFor = (c: Ctx, f: number, who: Who, id: string, from: P, base: number, propsFn: (ff: number) => Props, standing: boolean, smileBase: number): FacePose => {
  const lk = smoothLook(c, f, who, from, base, propsFn, standing, 0);
  const sp = speakingAt(c, f);
  const speaking = sp && sp.role === who;
  const mouth: MouthState = speaking ? { ...sp.mouth, smile: smileOf(c, f, smileBase) * 0.6 } : { ...MOUTH_REST, smile: smileOf(c, f, smileBase) };
  let brow = 0;
  for (const p of c.tl.pauses) if (f >= p.from + 10 && f < p.to) brow = who === "teacher" ? 0.15 : -0.35 * sm(f, p.from + 10, p.from + 30);
  if (speaking && (sp.id === "03" || sp.id === "17" || sp.id === "19" || sp.id === "05")) brow = 0.45;
  if (speaking && sp.id === "21") brow = -0.3;
  return { turn: lk.turn, gazeX: lk.gazeX, gazeY: lk.gazeY, blink: blinkOf(id, f), brow, mouth, tilt: 0 };
};

// Указатель на листе для предметных вставок (координаты листа).
export type Pointer = { x: number; y: number; type: "pencil" | "finger" | "marker"; color?: string; down?: boolean } | null;

const pointersAt = (c: Ctx, f: number, pr: Props): { pov: Pointer; camside: Pointer } => {
  const M = c.M;
  let pov: Pointer = null;
  let camside: Pointer = null;
  const col = pr.pencil ? pencilColorOf(pr.pencil) : undefined;
  const active = c.draws.find((d) => f >= d.drawFrom - 6 && f < d.drawTo + 4);
  if (active) {
    const p = clamp((f - active.drawFrom) / (active.drawTo - active.drawFrom), 0, 1);
    const t = pencilTip(active.i, p);
    const hover = f < active.drawFrom || f >= active.drawTo ? 7 : 0;
    pov = { x: t.x, y: t.y - hover, type: "pencil", color: col, down: t.down && !hover };
  } else if (pr.pencil && f < M("s3.count")) {
    // карандаш ждёт над листом
    const last = [...c.draws].reverse().find((d) => f >= d.drawTo + 4);
    const base = last ? { x: ICONS[last.i].cx + 24, y: ICONS[last.i].cy + 30 } : { x: 160, y: 130 };
    pov = { x: base.x + Math.sin(f / 23) * 1.5, y: base.y - 10, type: "pencil", color: col };
  }
  const cn = M("s3.count");
  if (f >= cn && f < M("16.start")) {
    const t = clamp((f - cn) / (M("16.start") - cn - 8), 0, 1);
    const idx = Math.min(6, Math.floor(t * 7));
    const fr = t * 7 - idx;
    const a = ICONS[idx];
    const b = ICONS[Math.min(6, idx + 1)];
    const p = lp({ x: a.cx, y: a.cy + 22 }, { x: b.cx, y: b.cy + 22 }, sm(fr, 0.55, 1));
    pov = { ...p, type: "finger" };
  }
  const care = M("s5.care");
  if (f >= care && f < M("28.start")) pov = { x: ICONS[2].cx + 6, y: ICONS[2].cy + 28, type: "finger" };
  const tc = M("s7.touch");
  if (f >= tc + 8 && f < M("s7.untouch") + 4) camside = { x: ICONS[6].cx + 2, y: ICONS[6].cy + 2, type: "finger" };
  const wr = M("s8.write");
  if (f >= wr + 6 && f < M("s8.board")) {
    const tt = titleTip(pr.title);
    camside = { x: tt.x, y: tt.y + (pr.title <= 0 ? -8 : 0), type: "marker", down: pr.title > 0 && pr.title < 1 };
  }
  return { pov, camside };
};

export type FrameState = WorldState & { readonly props: Props; readonly pov: Pointer; readonly camside: Pointer };

export const drawsOf = (tl: L80Timeline) => getCtx(tl).draws;

export const computeState = (tl: L80Timeline, f: number): FrameState => {
  const c = getCtx(tl);
  const M = c.M;
  const pr = propsAt(c, f);
  const propsFn = (ff: number) => (ff === f ? pr : propsAt(c, ff));
  const standing = f >= M("s8.board");
  const kids: Record<string, BodyPose> = {};

  // ---------- Юсуф ----------
  {
    const k = YUSUF;
    let lean = 0;
    let dip = 0;
    let L: HandTarget = tableRest(k, -1);
    let R: HandTarget = tableRest(k, 1);
    const face = faceFor(c, f, "yusuf", k.id, kidHead(k), k.turn, propsFn, standing, 0.45);
    // сцена 1: пьёт из своего стакана двумя руками
    const r0 = M("s1.reach");
    const set0 = M("s1.set");
    if (f >= r0 - 4 && f < M("s1.exhale") + 6) {
      const cup = pr.yusufCup;
      const gL = toLocal(k, cupGrip(cup, -1), "grip");
      const gR = toLocal(k, cupGrip(cup, 1), "grip");
      const inT = sm(f, r0 - 4, r0 + 14);
      const outT = sm(f, set0 + 2, M("s1.exhale") + 6);
      L = mixHand(mixHand(tableRest(k, -1), gL, inT), tableRest(k, -1), outT);
      R = mixHand(mixHand(tableRest(k, 1), gR, inT), tableRest(k, 1), outT);
      lean = 6 * sm(f, r0, M("s1.lift")) * (1 - outT);
      if (f >= M("s1.sip") - 4 && f < M("s1.lower") + 4) {
        face.tilt = -5;
        face.blink = Math.max(face.blink, 0.62);
        face.gazeY = -0.2;
      }
      // выдох после последнего глотка: рот чуть приоткрыт, без артикуляции
      const ex = M("s1.exhale");
      if (f >= ex && f < ex + 16) face.mouth = { open: 0.12 * Math.sin(((f - ex) / 16) * Math.PI), round: 0.4, wide: 0, smile: 0.4 };
    }
    // сцена 3: смотрит на окно
    if (f >= M("s3.window") && f < M("12.end")) lean = -6;
    // сцена 5: показывает на кувшин, не касаясь посуды
    const p5 = M("s5.point");
    if (f >= p5 && f < M("s5.jug") + 20) {
      const t = sm(f, p5, p5 + 14) * (1 - sm(f, M("s5.jug") + 4, M("s5.jug") + 20));
      const tgt = { x: k.x + 110, y: 1112 };
      R = mixHand(R, toLocal(k, tgt, "point", -8), t);
    }
    // сцена 6: подаёт чистый стакан Амира учителю: берёт сбоку, поддерживает
    // второй рукой снизу, протягивает и отпускает после захвата взрослого
    const gR0 = M("s6.reach");
    const gC = M("s6.carry");
    const tG0 = M("s6.tgrasp");
    const rel = M("s6.release");
    if (f >= gR0 && f < rel + 22) {
      const cup = f < rel ? pr.amirCup : { ...SPOTS.handover, level: 0, tilt: 0 };
      const mid = gC + Math.round((tG0 - gC) * 0.4);
      const side = toLocal(k, cupGrip(cup, -1, 0.5), "grip");
      const under = toLocal(k, { x: cup.x + 2, y: cup.y + 4 }, "rest");
      const inT = sm(f, gR0, M("s6.grasp"));
      const outT = sm(f, rel, rel + 22);
      L = mixHand(mixHand(tableRest(k, -1), side, inT), tableRest(k, -1), outT);
      R = mixHand(mixHand(tableRest(k, 1), under, sm(f, gC, mid)), tableRest(k, 1), outT);
      lean = (f < gC ? -20 * inT : f < mid ? lerp(-20, 0, sm(f, gC, mid)) : 16 * sm(f, mid, tG0)) * (1 - outT);
      dip = 6 * inT * (1 - outT);
    }
    // сцена 7: касается пальцем седьмого рисунка (дружеская помощь)
    const tc = M("s7.touch");
    if (f >= tc && f < M("s7.untouch") + 14) {
      const t = sm(f, tc, tc + 18) * (1 - sm(f, M("s7.untouch"), M("s7.untouch") + 14));
      const icon = sheetToWorld(pr.sheet, ICONS[6].cx, ICONS[6].cy + 4);
      R = mixHand(R, toLocal(k, icon, "point", 70), t);
      lean = 10 * t;
      dip = 14 * t;
    }
    kids[k.id] = { face, lean, dip, breath: breathOf(k.id, f), handL: L, handR: R };
  }

  // ---------- Амир ----------
  {
    const k = AMIR;
    let lean = 0;
    const dip = 0;
    const L: HandTarget = tableRest(k, -1);
    let R: HandTarget = tableRest(k, 1);
    const face = faceFor(c, f, "amir", k.id, kidHead(k), k.turn, propsFn, standing, 0.35);
    // берёт свой чистый пустой стакан и ставит ближе
    const a0 = M("s6.amirCup");
    const a1 = M("s6.amirSet");
    if (f >= a0 && f < a1 + 30) {
      const cup = pr.amirCup;
      const inT = sm(f, a0, a0 + 14);
      const outT = sm(f, a1 + 6, a1 + 30);
      const grip = f < a1 + 6 ? toLocal(k, cupGrip(cup, 1), "grip") : toLocal(k, cupGrip({ ...SPOTS.amirCupNear, level: 0, tilt: 0 }, 1), "grip");
      R = mixHand(mixHand(tableRest(k, 1), grip, inT), { x: 70, y: 1170 - k.y, type: "rest" }, outT);
      lean = 12 * inT * (1 - outT * 0.6);
    } else if (f >= a1 + 30 && f < M("s6.reach")) {
      // спокойно держит руку у своего стакана
      R = { x: 70, y: 1170 - k.y, type: "rest" };
      lean = 5;
    }
    // пьёт, когда учитель поставил наполненный стакан
    const aR = M("s6.amirReach");
    const aE = M("s6.end");
    if (f >= aR - 2 && f < aE + 18) {
      const cup = pr.amirCup;
      const inT = sm(f, aR - 2, M("s6.amirLift"));
      const outT = sm(f, aE - 4, aE + 18);
      R = mixHand(mixHand(tableRest(k, 1), toLocal(k, cupGrip(cup, 1), "grip"), inT), tableRest(k, 1), outT);
      lean = 18 * inT * (1 - outT);
      if (f >= M("s6.amirSip") - 4 && f < M("s6.amirLower") + 4) {
        face.tilt = -4;
        face.blink = Math.max(face.blink, 0.6);
        face.mouth = { ...MOUTH_REST, smile: 0.2 };
      }
    }
    kids[k.id] = { face, lean, dip, breath: breathOf(k.id, f), handL: L, handR: R };
  }

  // ---------- Билал ----------
  {
    const k = BILAL;
    let lean = 0;
    let dip = 0;
    let L: HandTarget = tableRest(k, -1);
    const R: HandTarget = tableRest(k, 1);
    const face = faceFor(c, f, "bilal", k.id, kidHead(k), k.turn, propsFn, standing, 0.35);
    const g = kidGeometry(k);
    const shoulderL = { x: k.x - g.shoulderW * 0.4, y: k.y + g.shoulderY };
    const pencil = pr.pencil;
    const caseP = { x: SPOTS.pencilCase.x + 10, y: SPOTS.pencilCase.y - 6 };
    // берёт карандаш
    const pc = M("s2.pencil");
    if (f >= pc - 10 && f < M("s3.stop") + 24) {
      const restP = { x: SPOTS.sheetBilal.x - 60, y: 1150 };
      let tip: P = restP;
      let type: HandTarget["type"] = pencil ? "pencil" : "pinch";
      if (f < pc + 8) {
        tip = arc({ x: k.x - 40, y: 1166 }, caseP, sm(f, pc - 10, pc + 4), 20);
        type = f < pc + 4 ? "rest" : "pinch";
      } else if (pr.tip) tip = pr.tip;
      else {
        // ожидание над листом / смена карандаша
        const sw = c.draws.find((d) => d.i > 0 && f >= d.swapFrom && f < d.drawFrom - 6);
        const last = [...c.draws].reverse().find((d) => f >= d.drawTo + 4);
        const waitP = last ? sheetToWorld(pr.sheet, ICONS[last.i].cx + 26, ICONS[last.i].cy + 26) : { x: SPOTS.sheetBilal.x, y: SPOTS.sheetBilal.y - 22 };
        if (sw) {
          const t = (f - sw.swapFrom) / (sw.drawFrom - 6 - sw.swapFrom);
          tip = t < 0.5 ? arc(waitP, caseP, sm(t, 0, 0.45), 16) : arc(caseP, sheetToWorld(pr.sheet, ICONS[sw.i].cx, ICONS[sw.i].cy - 20), sm(t, 0.55, 1), 16);
        } else tip = { x: waitP.x, y: waitP.y - 8 };
      }
      // ведёт пальцем по семи рисункам перед репликой 16
      const cn = M("s3.count");
      if (f >= cn && f < M("16.start")) {
        const t = clamp((f - cn) / (M("16.start") - cn - 8), 0, 1);
        const idx = Math.min(6, Math.floor(t * 7));
        const fr = t * 7 - idx;
        const a = ICONS[idx];
        const b = ICONS[Math.min(6, idx + 1)];
        const p = lp({ x: a.cx, y: a.cy + 20 }, { x: b.cx, y: b.cy + 20 }, sm(fr, 0.55, 1));
        tip = sheetToWorld(pr.sheet, p.x, p.y);
        tip = { x: tip.x, y: tip.y - 5 };
      }
      // откладывает карандаш после «А я ещё придумал!»
      const st = M("s3.stop");
      if (f >= st) tip = arc(tip, caseP, sm(f, st, st + 12), 14);
      const dx = shoulderL.x - tip.x;
      const dy = shoulderL.y - tip.y;
      const ang = (Math.atan2(dy, dx) * 180) / Math.PI + 12;
      const tgt: HandTarget = { ...toLocal(k, tip, type, ang), pencilColor: pencil ? ICONS.find((ic) => ic.pencil === pencil)!.pencil && pencilColorOf(pencil) : undefined };
      const back = sm(f, st + 12, st + 24);
      L = back > 0 ? mixHand(tgt, tableRest(k, -1), back) : tgt;
      if (f >= st + 12) L = mixHand({ ...toLocal(k, caseP, "rest") }, tableRest(k, -1), back);
      dip = 34 * sm(f, pc - 6, pc + 20) * (1 - sm(f, st, st + 24));
      lean = -10 * sm(f, pc - 6, pc + 20) * (1 - sm(f, st, st + 24));
    }
    // сцена 5: на «за заботу» показывает на рисунок заботы людей
    const care = M("s5.care");
    if (f >= care && f < M("28.start")) {
      const t = sm(f, care, care + 16) * (1 - sm(f, M("28.start") - 14, M("28.start")));
      const p = sheetToWorld(pr.sheet, ICONS[2].cx, ICONS[2].cy + 26);
      L = mixHand(L, toLocal(k, p, "point", 100), t);
      dip = 24 * t;
      lean = -8 * t;
    }
    // сцена 7: приподнимает лист за края и поворачивает к друзьям
    const t0 = M("s7.turn");
    const t1 = M("s7.touch");
    if (f >= t0 && f < t1 + 10) {
      const k2 = (f - t0) / (t1 - t0);
      const sh = pr.sheet;
      const hold = k2 < 0.62;
      const inT = sm(f, t0, t0 + 10);
      const outT = sm(k2, 0.6, 0.85);
      if (sh.mode === "table" && hold) {
        const eL = sheetToWorld(sh, 6, SHEET.h / 2);
        L = mixHand(tableRest(k, -1), toLocal(k, eL, "pinch"), inT);
      } else L = mixHand(L, tableRest(k, -1), outT);
      dip = 20 * inT * (1 - outT);
    }
    kids[k.id] = { face, lean, dip, breath: breathOf(k.id, f), handL: L, handR: R };
  }

  // ---------- фоновые мальчики ----------
  for (const k of KIDS) {
    if (k.behindTable) continue;
    const s = depthScale(k.y);
    const from = kidHead(k);
    const lag = 3 + Math.floor(hash01(k.id + "lag") * 9);
    let turn = 0;
    let gx = 0;
    let gy = 0;
    const N = 4;
    for (let q = 0; q < N; q++) {
      const ff = Math.max(0, f - lag - q * 3);
      const sp = speakingAt(c, ff);
      const ov = focusOverride(c, ff, "amir", propsFn(ff));
      let tg: Look = sp ? rolePos(sp.role, standing) : ov && ov !== "camera" ? ov : (lastSpeaker(c, ff) ? rolePos(lastSpeaker(c, ff)!.role, standing) : teacherHead(standing));
      if (ov && !sp) tg = ov === "camera" ? teacherHead(standing) : ov;
      const t = lookToFace(from, tg, k.turn);
      turn += t.turn;
      gx += t.gazeX;
      gy += t.gazeY;
    }
    let brow = 0;
    let tilt = 0;
    for (const p of tl.pauses) {
      if (f >= p.from + 12 && f < p.to) {
        // думают: взгляд чуть вверх у некоторых, лёгкий наклон головы
        const thinker = hash01(k.id + p.name) > 0.45;
        if (thinker) {
          gy = lerp(gy / N, -0.5, sm(f, p.from + 12, p.from + 40)) * N;
          tilt = (hash01(k.id + "tilt") - 0.5) * 8 * sm(f, p.from + 12, p.from + 40);
          brow = -0.3;
        }
      }
    }
    const smile = smileOf(c, f, 0.3 + hash01(k.id + "s") * 0.15);
    // редкий небольшой наклон к говорящему
    const leanSlow = Math.sin(f / (70 + hash01(k.id + "lean") * 50) + hash01(k.id) * 6) * 2;
    kids[k.id] = {
      face: { turn: turn / N, gazeX: gx / N, gazeY: gy / N, blink: blinkOf(k.id, f), brow, mouth: { ...MOUTH_REST, smile }, tilt },
      lean: leanSlow,
      dip: 0,
      breath: breathOf(k.id, f),
    };
    void s;
  }

  // ---------- учитель ----------
  const tFace = faceFor(c, f, "teacher", TEACHER.id, teacherHead(standing), 0, propsFn, standing, 0.3);
  let tLean = 0;
  let tDip = 0;
  const tRestL: HandTarget = { x: -62, y: 1215 - TEACHER.y, type: "rest" };
  const tRestR: HandTarget = { x: 62, y: 1215 - TEACHER.y, type: "rest" };
  let TL: HandTarget = tRestL;
  let TR: HandTarget = tRestR;
  if (!standing) {
    // сцена 1: открытый жест на «Мы часто привыкаем…»
    const l4 = tl.lines["04"];
    if (f >= l4.from && f < l4.to + 20) {
      const t = sm(f, l4.from, l4.from + 14) * (1 - sm(f, l4.to, l4.to + 20));
      TL = mixHand(tRestL, { x: -120, y: 1080 - TEACHER.y + Math.sin(f / 9) * 4, type: "flat", angle: -150 }, t);
    }
    // сцена 2: берёт чистый лист и кладёт перед Билалом
    const p0 = M("s2.paper");
    const p1 = M("s2.paperDown");
    if (f >= p0 && f < p1 + 22) {
      const sh = pr.sheet;
      // край листа, ближний к учителю
      const near = (pl: SheetPlacement) => {
        const e1 = sheetToWorld(pl, 8, SHEET.h / 2);
        const e2 = sheetToWorld(pl, SHEET.w - 8, SHEET.h / 2);
        return e1.x < e2.x ? e1 : e2;
      };
      const edge = near(sh);
      const inT = sm(f, p0, p0 + 10);
      const outT = sm(f, p1 + 2, p1 + 22);
      const held: HandTarget = tLocal(edge, "pinch");
      TR = mixHand(mixHand(tRestR, held, inT), tRestR, outT);
      tDip = 46 * inT * (1 - outT);
      tLean = 22 * sm(f, p0 + 10, p1) * (1 - outT);
    }
    // сцена 5: обозначает приготовленный кувшин открытой ладонью
    const j0 = M("s5.jug");
    if (f >= j0 && f < M("26.end")) {
      const t = sm(f, j0, j0 + 16) * (1 - sm(f, M("26.end") - 20, M("26.end")));
      TR = mixHand(tRestR, tLocal({ x: SPOTS.jugHome.x - 34, y: SPOTS.jugHome.y - 62 }, "flat", -20), t);
      tDip = 14 * t;
    }
    // кивок на «Спасибо, Мухаммад!»
    const nd = M("s5.nod");
    if (f >= nd && f < nd + 34) tFace.tilt = 6 * Math.sin(((f - nd) / 34) * Math.PI);
    // сцена 6: принимает стакан, ставит, наливает, ставит перед Амиром
    const tG = M("s6.tgrasp");
    if (f >= M("s6.carry") + 10 && f < M("s6.amirReach") + 18) {
      const cup = pr.amirCup;
      const jug = pr.jug;
      const tS = M("s6.tset");
      const jL = M("s6.jugLift");
      const pl = M("s6.place");
      const aR = M("s6.amirReach");
      // левая рука: стакан
      const gripCup = tLocal(cupGrip(cup, 1, 0.6), "grip");
      if (f < tG) TL = mixHand(tRestL, tLocal(cupGrip({ ...SPOTS.handover, level: 0, tilt: 0 }, 1, 0.6), "grip"), sm(f, M("s6.carry") + 10, tG));
      else if (f < tS + 6) TL = gripCup;
      else if (f < jL) TL = mixHand(gripCup, tRestL, sm(f, tS + 6, jL));
      // правая рука: кувшин за ручку (справа)
      const handle = (j: typeof jug): P => add({ x: j.x, y: j.y }, rot({ x: JUG.w / 2 + 12, y: -JUG.h * 0.55 }, j.tilt));
      if (f >= jL && f < pl) {
        const inT = sm(f, jL, jL + 8);
        const outT = sm(f, pl - 8, pl);
        TR = mixHand(mixHand(tRestR, tLocal(handle(jug), "grip"), inT), tRestR, outT);
        tDip = 22 * inT * (1 - outT);
      }
      // стакан к Амиру
      if (f >= pl && f < aR + 18) {
        const inT = sm(f, pl, pl + 8);
        const outT = sm(f, aR - 4, aR + 18);
        TL = mixHand(mixHand(tRestL, gripCup, inT), tRestL, outT);
        tLean = -55 * sm(f, pl + 4, aR - 4) * (1 - outT);
        tDip = 50 * inT * (1 - outT);
      }
      if (f >= tG - 12 && f < jL) tDip = Math.max(tDip, 26 * sm(f, tG - 12, tG) * (1 - sm(f, tS + 6, jL)));
    }
    // сцена 7: принимает лист у Билала и кладёт перед Юсуфом
    const s7a = M("s7.turn");
    const s7b = M("s7.touch");
    if (f >= s7a + (s7b - s7a) * 0.4 && f < s7b + 20) {
      const sh = pr.sheet;
      const k2 = (f - s7a) / (s7b - s7a);
      const inT = sm(k2, 0.4, 0.52);
      const outT = sm(f, s7b, s7b + 20);
      const e = sh.mode === "table" ? sheetToWorld(sh, SHEET.w - 6, SHEET.h / 2) : { x: 1500, y: 1150 };
      TL = mixHand(mixHand(tRestL, tLocal(e, "pinch"), inT), tRestL, outT);
      tDip = 40 * inT * (1 - outT);
      tLean = -30 * sm(k2, 0.5, 1) * (1 - outT);
    }
    // сцена 8: придвигает лист и подписывает маркером
    const w0 = M("s8.take");
    const w1 = M("s8.write");
    const b0 = M("s8.board");
    if (f >= w0 && f < b0) {
      const sh = pr.sheet;
      if (f < w1) {
        const e = sheetToWorld(sh, 8, SHEET.h / 2);
        TL = mixHand(tRestL, tLocal(e, "pinch"), sm(f, w0, w0 + 8));
        tDip = 40 * sm(f, w0, w0 + 8);
      } else {
        const tt = titleTip(pr.title);
        const m = sheetToWorld(sh, tt.x, tt.y);
        TR = { ...tLocal(m, "marker", -70) };
        TL = tLocal(sheetToWorld(sh, 10, SHEET.h - 20), "flat", -90);
        tDip = 50;
      }
    }
  }
  // ---------- учитель у доски (стоя) ----------
  // встаёт перед листом, держит его за верхние углы, ставит две кнопки,
  // затем делает небольшой шаг вправо, чтобы лист был виден классу
  let teacherPos: P = { x: TEACHER.x, y: TEACHER.y };
  let step = 0;
  const b0 = M("s8.board");
  if (standing) {
    const PIN_X = 1905;
    const END_X = 2115;
    const k1 = b0 + 30;
    const k2 = b0 + 54;
    const sA = b0 + 74;
    const sB = b0 + 104;
    const sx = lerp(PIN_X, END_X, sm(f, sA, sB));
    step = clamp((f - sA) / (sB - sA), 0, 1);
    teacherPos = { x: sx, y: TEACHER_STAND_Y };
    const s = depthScale(TEACHER_STAND_Y);
    const toL = (p: P, type: HandTarget["type"], angle?: number): HandTarget => ({ x: (p.x - teacherPos.x) / s, y: (p.y - teacherPos.y) / s, type, angle });
    const sh = pr.sheet;
    const box = sh.mode === "upright" ? sh : { x: LAYOUT.pinned.x, y: LAYOUT.pinned.y, w: LAYOUT.pinned.w };
    const cl = { x: box.x + 8, y: box.y + 10 };
    const cr = { x: box.x + box.w - 8, y: box.y + 10 };
    // руки свободно опущены вдоль тела
    const restL: HandTarget = { x: -84, y: -262, type: "rest" };
    const restR: HandTarget = { x: 84, y: -262, type: "rest" };
    // левая (экранная) рука — левый угол, правая — правый
    TL = f < k1 + 4 ? toL(cl, "pinch") : mixHand(toL(cl, "pinch"), restL, sm(f, k1 + 4, k1 + 20));
    TR = f < k2 + 4 ? toL(cr, "pinch") : mixHand(toL(cr, "pinch"), restR, sm(f, k2 + 4, k2 + 20));
    // небольшое нажатие при установке кнопки
    if (f >= k1 - 6 && f < k1 + 4) TL = { ...TL, y: TL.y + 3 * Math.sin(((f - k1 + 6) / 10) * Math.PI) };
    if (f >= k2 - 6 && f < k2 + 4) TR = { ...TR, y: TR.y + 3 * Math.sin(((f - k2 + 6) / 10) * Math.PI) };
    if (f >= sB) {
      // спокойно стоит рядом с листом, повернувшись к детям
      tFace.turn = -0.25;
    }
  }
  const magnets = standing ? (f >= b0 + 30 ? 1 : 0) + (f >= b0 + 54 ? 1 : 0) : 0;
  void kidDims;

  return {
    frame: f,
    kids,
    teacher: { pose: { face: tFace, lean: tLean, dip: tDip, breath: breathOf(TEACHER.id, f), handL: TL, handR: TR }, standing, x: teacherPos.x, y: teacherPos.y, step },
    cups: { yusuf: pr.yusufCup, amir: pr.amirCup },
    jug: { x: pr.jug.x, y: pr.jug.y, tilt: pr.jug.tilt, level: pr.jug.level },
    stream: pr.stream,
    sheet: pr.sheet,
    sheetState: { icons: pr.icons, title: pr.title },
    pencilHeld: pr.pencil,
    magnets,
    props: pr,
    ...pointersAt(c, f, pr),
  };
};

const pencilColorOf = (id: PencilId) => ({ blue: "#3A78C2", red: "#D2463F", orange: "#E58A2E", green: "#3E9A55", brown: "#8A5A3B" })[id];

export const FACE_DEFAULT = FACE_REST;
export const SHEET_W_WORLD = SHEET_TABLE_W;
