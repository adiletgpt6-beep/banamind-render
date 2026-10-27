// Персонажи BG-044 (плоский 2D, тёплый дружелюбный стиль): мама, дети
// (boy — главный герой, girl, boy2), водитель и крупная рука мамы.
// Все — SVG-группы <g> для общего <svg viewBox="0 0 1080 1920">
// (см. Stage в city.tsx). Детерминированы по пропсам и кадру f.
//
// Точка опоры (x, y):
//  • стоя / при ходьбе — земля посередине между стопами;
//  • сидя (Mom "sit"/"sitPhone", Kid "sitBelted"/"homework", Driver) —
//    точка сиденья под тазом; пол — ниже на SIT.<кто>.seatH × scale.
// Смотрят вправо; flip — влево. Рост при scale 1: мама ≈ 595 px,
// ребёнок ≈ 390 px, водитель сидя ≈ 330 px от сиденья до макушки.
import { C } from "../palette";
import { blinkAt, clamp01, hash, mix, mixPt, pt, rot, smooth, sub, add, type Pt } from "./vec/core";
import { Figure, skeleton, type Build, type Layer, type Outfit, type Pose } from "./vec/figure";
import type { Expr } from "./vec/head";
import { SteeringWheel } from "./vec/wheel";

export { Hand } from "./vec/bighand";
export type { HandProps } from "./vec/bighand";
export type { Expr } from "./vec/head";
export type { Layer } from "./vec/figure";

// ---------- взгляд ----------
export type Gaze = "forward" | "camera" | "down" | "up" | "back" | "downFront" | readonly [number, number];
const gazePt = (g: Gaze | undefined, def: Pt): Pt => {
  if (!g) return def;
  if (typeof g !== "string") return pt(g[0], g[1]);
  switch (g) {
    case "forward":
      return pt(0.7, 0);
    case "camera":
      return pt(-0.15, 0.05);
    case "down":
      return pt(0.2, 1);
    case "downFront":
      return pt(0.75, 0.85);
    case "up":
      return pt(0.5, -0.8);
    case "back":
      return pt(-0.8, 0);
    default:
      return def;
  }
};

// ---------- телосложение и одежда ----------
const MOM_BUILD: Build = {
  head: {
    rx: 46,
    ry: 50,
    skin: C.skin,
    skinShade: C.skinShade,
    hair: C.hair,
    hairShade: "#4C3B32",
    style: "momBun",
    child: false,
    lips: "#A9524B",
    lashes: true,
    blush: 0.2,
  },
  neck: 26,
  neckW: 22,
  torso: 172,
  sh: 44,
  depth: 32,
  upper: 108,
  fore: 100,
  armW: [27, 23],
  thigh: 146,
  shin: 138,
  legW: [40, 33],
  ankle: 16,
  foot: 50,
  hand: 1,
};
const MOM_OUTFIT: Outfit = {
  top: C.momTop,
  topShade: C.momTopShade,
  sleeve: C.momTop,
  sleeveShade: C.momTopShade,
  cuff: "#86A3DD",
  pants: "#24365F",
  pantsShade: "#1A2A4C",
  shoe: "#F4F6FA",
  shoeShade: "#CBD3DF",
  hem: 46,
  neckline: "round",
};

export type KidLook = "boy" | "girl" | "boy2";
const KID_BUILD_BASE: Omit<Build, "head"> = {
  neck: 10,
  neckW: 18,
  torso: 108,
  sh: 36,
  depth: 25,
  upper: 66,
  fore: 60,
  armW: [21, 18],
  thigh: 86,
  shin: 80,
  legW: [27, 23],
  ankle: 11,
  foot: 36,
  hand: 0.72,
};
const kidBuild = (look: KidLook): Build => ({
  ...KID_BUILD_BASE,
  head: {
    rx: 44,
    ry: 47,
    skin: look === "boy2" ? "#E2A983" : C.skin,
    skinShade: look === "boy2" ? "#CC9068" : C.skinShade,
    hair: look === "boy2" ? "#3A2A22" : C.hair,
    hairShade: "#55443A",
    style: look === "girl" ? "girlPigtails" : look === "boy2" ? "boyNeat" : "boyShort",
    child: true,
    lips: "#B0544C",
    glasses: look === "boy2",
    tie: C.coral,
    blush: 0.32,
  },
});
const kidOutfit = (look: KidLook): Outfit => ({
  top: C.kidShirt,
  topShade: "#DCE3EE",
  sleeve: C.kidShirt,
  sleeveShade: "#D2DAE7",
  pants: "#2B3550",
  pantsShade: "#202840",
  shoe: "#33384A",
  shoeShade: "#242838",
  hem: 10,
  vest:
    look === "girl"
      ? { color: C.coral, shade: "#C95D46" }
      : look === "boy2"
        ? { color: "#3F8F6A", shade: "#2F7253" }
        : { color: C.kidVest, shade: "#22386A" },
  collar: C.kidShirt,
  pack: look === "girl" ? { color: "#9DB8EE", shade: "#7E9BD6" } : look === "boy2" ? { color: "#5B7FC7", shade: "#4A6AAE" } : { color: C.kidPack, shade: C.yellowDeep },
});

const DRIVER_BUILD: Build = {
  head: {
    rx: 47,
    ry: 53,
    skin: "#E0A982",
    skinShade: "#C98F68",
    hair: "#2A221E",
    hairShade: "#4A3D36",
    style: "manShort",
    child: false,
    lips: "#9E5048",
    greyTemples: true,
    stubble: true,
    blush: 0,
  },
  neck: 24,
  neckW: 26,
  torso: 180,
  sh: 50,
  depth: 36,
  upper: 112,
  fore: 104,
  armW: [30, 26],
  thigh: 150,
  shin: 142,
  legW: [42, 35],
  ankle: 16,
  foot: 54,
  hand: 1.08,
};
const DRIVER_OUTFIT: Outfit = {
  top: "#DDE2E9",
  topShade: "#C3CAD5",
  sleeve: "#DDE2E9",
  sleeveShade: "#C3CAD5",
  pants: "#3B4252",
  pantsShade: "#2E3442",
  shoe: "#2B2F3A",
  shoeShade: "#20232C",
  hem: 14,
  collar: "#EEF1F5",
};

// ---------- размеры для сцен ----------
// Сидячие позы: высота сиденья над полом и высота столешницы (над точкой
// сиденья, отрицательная = выше), всё при scale 1.
export const SIT = {
  mom: { seatH: 144, tableTop: -156, tableFromX: 96 },
  kid: { seatH: 84, tableTop: -52, tableFromX: 58 },
} as const;
// Длина цикла ходьбы (2 шага) при scale 1: phase += dx / (STRIDE × scale).
export const STRIDE = { mom: 312, kid: 200 } as const;
export const walkPhase = (distancePx: number, scale: number, who: "mom" | "kid") => distancePx / (STRIDE[who] * scale);
// Объятие: ребёнок стоит на HUG_DX × scale правее мамы (мама смотрит вправо,
// ребёнок flip — смотрит на маму). См. MomKidHug.
export const HUG_DX = 96;
// Высота фигур (от опоры до макушки) при scale 1.
export const HEIGHT = { mom: 595, kid: 390, driverSeated: 330 } as const;

// ---------- ходьба ----------
type WalkLegs = { legN: Pose["legN"]; legF: Pose["legF"]; hipY: number; qN: number };
const walkLegs = (b: Build, phase: number, S: number): WalkLegs => {
  const L = b.thigh + b.shin;
  const F = b.foot * 0.8;
  const legAt = (q: number) => {
    if (q < 0.5) {
      const fx = S * (1 - 4 * q);
      // отрыв пятки в конце опоры: стопа поворачивается вокруг носка
      const th = 20 * smooth((q - 0.36) / 0.14);
      const toe = pt(fx + 0.6 * F, 0);
      const ankle = sub(toe, rot(pt(0.6 * F, b.ankle), th));
      return { to: add(ankle, pt(0, b.ankle)), footRot: th, fx, stance: true };
    }
    const u = (q - 0.5) * 2;
    const fx = -S + 2 * S * smooth(u);
    const lift = L * 0.1 * Math.sin(Math.PI * u) + L * 0.02 * Math.sin(Math.PI * Math.min(1, u * 1.6));
    const th = 22 * Math.pow(1 - u, 2) - 12 * smooth((u - 0.65) / 0.35);
    return { to: pt(fx, -lift), footRot: th, fx, stance: false };
  };
  const qN = ((phase % 1) + 1) % 1;
  const qF = (qN + 0.5) % 1;
  const n = legAt(qN);
  const fF = legAt(qF);
  const st = n.stance ? n : fF;
  const hipY = -(Math.min(L * 0.985, Math.sqrt(Math.max(0, (L * 0.997) ** 2 - st.fx ** 2))) + b.ankle) + 2;
  return { legN: { to: n.to, footRot: n.footRot }, legF: { to: fF.to, footRot: fF.footRot }, hipY, qN };
};
const swingArm = (b: Build, q: number, sign: 1 | -1, amp: number) => {
  const a = -amp * Math.cos(2 * Math.PI * q) * sign;
  const R = (b.upper + b.fore) * 0.94;
  const fwd = Math.max(0, Math.sin(a * (Math.PI / 180)));
  return { to: pt(Math.sin((a * Math.PI) / 180) * R, Math.cos((a * Math.PI) / 180) * R - fwd * 20), rel: true as const, bend: 1 as const, hand: "relaxed" as const };
};

// Подъём кисти с указательным пальцем: где поставить запястье, чтобы кончик пальца оказался в tip.
const wristForTip = (tip: Pt, dir: number, k: number, thumb: 1 | -1) => sub(tip, rot(pt(40 * k, -7 * k * thumb), dir));

// ---------- мама ----------
export type MomPose = "stand" | "walk" | "sit" | "sitPhone" | "holdPhone" | "tapPhone" | "wave" | "hug" | "think";

const momPose = (pose: MomPose, f: number, o: { phase: number; press: number; hug: number; gaze?: Gaze }): Pose => {
  const b = MOM_BUILD;
  const br = Math.sin((f / 96) * Math.PI * 2);
  const relaxed = { rel: true as const, bend: 1 as const, hand: "relaxed" as const };
  switch (pose) {
    case "walk": {
      const w = walkLegs(b, o.phase, 78);
      return {
        hip: pt(0, w.hipY),
        lean: 4,
        yaw: 18,
        headTilt: -2,
        gaze: gazePt(o.gaze, pt(0.6, 0.05)),
        legN: w.legN,
        legF: w.legF,
        armN: swingArm(b, w.qN, 1, 20),
        armF: swingArm(b, w.qN, -1, 20),
      };
    }
    case "sit":
    case "sitPhone": {
      const hip = pt(0, -12);
      const base: Pose = {
        hip,
        lean: pose === "sitPhone" ? 6 : 2,
        yaw: 22,
        headTilt: pose === "sitPhone" ? 12 : 0,
        gaze: gazePt(o.gaze, pose === "sitPhone" ? pt(0.4, 1) : pt(0.5, 0)),
        seated: true,
        breathe: br,
        legN: { to: pt(158, SIT.mom.seatH), footRot: 0 },
        legF: { to: pt(176, SIT.mom.seatH - 4), footRot: 0 },
        armN: { to: pt(158, SIT.mom.tableTop - 8), bend: 1, hand: "flat", absDir: 4 },
        armF: { to: pt(186, SIT.mom.tableTop - 12), bend: 1, hand: "flat", absDir: 2, front: true },
      };
      if (pose === "sit") return base;
      const ph = pt(118, -262);
      const tip = add(ph, pt(-3 + (1 - o.press) * -7, -4 + (1 - o.press) * 9));
      const dir = -58;
      return {
        ...base,
        phone: { at: ph, angle: -14, size: 1 },
        armF: { to: add(ph, pt(6, 28)), bend: 1, hand: "hold", front: true, absDir: -60 },
        armN: { to: wristForTip(tip, dir, b.hand, 1), bend: 1, hand: "point", absDir: dir },
      };
    }
    case "holdPhone":
    case "tapPhone": {
      const ph = pt(64, -392);
      const tap = pose === "tapPhone";
      const tip = add(ph, pt(-2 + (1 - o.press) * -8, -2 + (1 - o.press) * 10));
      const dir = -62;
      return {
        hip: pt(0, -295),
        lean: 3,
        yaw: 38,
        headTilt: 13,
        headTurn: 0.05,
        gaze: gazePt(o.gaze, pt(0.45, 1)),
        breathe: br,
        legN: { to: pt(-14, 0) },
        legF: { to: pt(18, -2) },
        phone: { at: ph, angle: -10, size: 1 },
        armF: { to: add(ph, pt(5, 28)), bend: 1, hand: "hold", front: true, absDir: -62 },
        armN: tap ? { to: wristForTip(tip, dir, b.hand, 1), bend: 1, hand: "point", absDir: dir } : { to: add(ph, pt(-10, 30)), bend: 1, hand: "grip", absDir: -40 },
      };
    }
    case "wave": {
      const wv = Math.sin(f * 0.33);
      return {
        hip: pt(0, -295),
        lean: 0,
        yaw: 40,
        headTilt: -3,
        headTurn: -0.08,
        gaze: gazePt(o.gaze, pt(0.1, 0)),
        breathe: br,
        legN: { to: pt(-14, 0) },
        legF: { to: pt(18, -2) },
        armN: { to: pt(-62 + wv * 6, -150), rel: true, bend: -1, hand: "open", absDir: -96 + wv * 16, thumb: -1 },
        armF: { to: pt(8, 192), ...relaxed },
      };
    }
    case "think": {
      return {
        hip: pt(0, -295),
        lean: 1,
        yaw: 36,
        headTilt: -5,
        headTurn: 0.04,
        gaze: gazePt(o.gaze, pt(0.55, -0.75)),
        breathe: br,
        legN: { to: pt(-14, 0) },
        legF: { to: pt(18, -2) },
        armN: { to: pt(22, -452), bend: 1, hand: "point", absDir: -78 },
        armF: { to: pt(8, 192), ...relaxed },
      };
    }
    case "hug": {
      const h = smooth(o.hug);
      const hipY = mix(-295, -278, h);
      return {
        hip: pt(mix(0, 6, h), hipY),
        lean: mix(6, 16, h),
        yaw: 30,
        headTilt: mix(4, 12, h),
        gaze: gazePt(o.gaze, pt(0.6, 0.7)),
        breathe: br,
        legN: { to: pt(-18, 0) },
        legF: { to: pt(22, -2) },
        // ладони ложатся на спину ребёнка (ниже лопаток), не на лицо
        armN: { to: mixPt(pt(112, -400), pt(HUG_DX + 40, -228), h), bend: 1, hand: h > 0.5 ? "flat" : "open", absDir: mix(-20, 80, h), thumb: h > 0.5 ? 1 : -1 },
        armF: { to: mixPt(pt(136, -428), pt(HUG_DX + 30, -246), h), bend: 1, hand: h > 0.5 ? "flat" : "open", absDir: mix(-30, 70, h), thumb: -1 },
      };
    }
    case "stand":
    default:
      return {
        hip: pt(0, -295 + br * 0.5),
        lean: 1,
        yaw: 38,
        headTilt: 0,
        gaze: gazePt(o.gaze, pt(0.2, 0)),
        breathe: br,
        legN: { to: pt(-14, 0) },
        legF: { to: pt(18, -2) },
        armN: { to: pt(-6, 196), ...relaxed },
        armF: { to: pt(8, 192), ...relaxed },
      };
  }
};

type CommonProps = {
  readonly x: number;
  readonly y: number;
  readonly scale?: number;
  readonly flip?: boolean;
  readonly f: number; // кадр (моргание, дыхание, волна руки)
  readonly mouth?: number; // 0…1 открытие рта (липсинк), напр. useMouth("mother")
  readonly expression?: Expr;
  readonly gaze?: Gaze;
  readonly seed?: number; // сдвиг моргания
  readonly opacity?: number;
};

export type MomProps = CommonProps & {
  readonly pose?: MomPose;
  readonly phase?: number; // walk: фаза шага (циклы), см. walkPhase
  readonly press?: number; // tapPhone/sitPhone: 0 — палец над экраном, 1 — касание
  readonly hug?: number; // hug: 0 — руки раскрыты, 1 — обнимает ребёнка
  readonly layer?: Layer; // "back" | "front" — для объятий (передняя рука поверх ребёнка)
};

export const Mom: React.FC<MomProps> = ({ x, y, scale = 1, flip, f, pose = "stand", phase = 0, press, hug = 1, mouth = 0, expression, gaze, seed = 11, layer, opacity }) => {
  const pr = press ?? (pose === "tapPhone" || pose === "sitPhone" ? autoTap(f) : 0);
  const p = momPose(pose, f, { phase, press: pr, hug, gaze });
  const expr: Expr = expression ?? (pose === "think" ? "thoughtful" : pose === "wave" ? "happy" : pose === "hug" && hug > 0.6 ? "joy" : "smile");
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`} opacity={opacity}>
      <Figure build={MOM_BUILD} outfit={MOM_OUTFIT} pose={p} expr={expr} mouth={mouth} blink={blinkAt(f, seed)} layer={layer} />
    </g>
  );
};

// Автонажатие для «печатает на телефоне»: короткое касание каждые ~10 кадров.
export const autoTap = (f: number) => {
  const k = (((f % 10) + 10) % 10) / 10;
  return k < 0.35 ? smooth(k / 0.35) : 1 - smooth((k - 0.35) / 0.65);
};

// ---------- ребёнок ----------
export type KidPose = "stand" | "walk" | "wave" | "sitBelted" | "hug" | "homework";

const kidPose = (b: Build, pose: KidPose, f: number, o: { phase: number; gaze?: Gaze; seat: boolean; hug: number }): Pose => {
  const br = Math.sin((f / 80) * Math.PI * 2);
  const relaxed = { rel: true as const, bend: 1 as const, hand: "relaxed" as const };
  switch (pose) {
    case "walk": {
      const w = walkLegs(b, o.phase, 50);
      return {
        hip: pt(0, w.hipY),
        lean: 3,
        yaw: 20,
        headTilt: -2,
        gaze: gazePt(o.gaze, pt(0.6, 0)),
        legN: w.legN,
        legF: w.legF,
        armN: swingArm(b, w.qN, 1, 24),
        armF: swingArm(b, w.qN, -1, 24),
        sway: Math.sin(w.qN * Math.PI * 4) * 6,
      };
    }
    case "wave": {
      const wv = Math.sin(f * 0.36);
      return {
        hip: pt(0, -174),
        lean: -1,
        yaw: 40,
        headTilt: -3,
        headTurn: -0.1,
        gaze: gazePt(o.gaze, pt(0.1, -0.1)),
        breathe: br,
        legN: { to: pt(-9, 0) },
        legF: { to: pt(11, -1) },
        armN: { to: pt(-40 + wv * 4, -92), rel: true, bend: -1, hand: "open", absDir: -96 + wv * 18, thumb: -1 },
        armF: { to: pt(5, 118), ...relaxed },
        sway: wv * 4,
      };
    }
    case "hug": {
      const h = smooth(o.hug);
      return {
        hip: pt(0, -174),
        lean: mix(2, 8, h),
        yaw: 30,
        headTilt: mix(0, -6, h),
        headTurn: -0.42,
        gaze: gazePt(o.gaze, pt(-0.2, 0)),
        breathe: br,
        legN: { to: pt(-9, 0) },
        legF: { to: pt(13, -1) },
        armN: { to: mixPt(pt(60, -200), pt(HUG_DX - 18, -226), h), bend: 1, hand: "flat", absDir: mix(-10, -70, h) },
        armF: { to: mixPt(pt(70, -214), pt(HUG_DX - 10, -238), h), bend: 1, hand: "flat", absDir: mix(-10, -60, h), front: true },
      };
    }
    case "sitBelted":
      return {
        hip: pt(0, -9),
        lean: -6,
        yaw: 26,
        headTilt: 4,
        gaze: gazePt(o.gaze, pt(0.6, 0)),
        breathe: br,
        seated: true,
        belt: true,
        carSeat: o.seat,
        legN: { to: pt(98, 80), footRot: -6 },
        legF: { to: pt(108, 76), footRot: -6 },
        armN: { to: pt(56, -16), bend: 1, hand: "flat", absDir: 8 },
        armF: { to: pt(44, -24), bend: 1, hand: "flat", absDir: 12, front: true },
      };
    case "homework": {
      const wr = Math.sin(f * 0.9) * 2.2;
      return {
        hip: pt(0, -9),
        lean: 14,
        yaw: 24,
        headTilt: 14,
        gaze: gazePt(o.gaze, pt(0.4, 1)),
        breathe: br,
        seated: true,
        book: { at: pt(118, SIT.kid.tableTop), w: 86 },
        legN: { to: pt(96, SIT.kid.seatH), footRot: 0 },
        legF: { to: pt(108, SIT.kid.seatH - 3), footRot: 0 },
        armN: { to: pt(98 + wr, SIT.kid.tableTop - 18), bend: 1, hand: "pencil", absDir: 6 },
        armF: { to: pt(128, SIT.kid.tableTop - 9), bend: 1, hand: "flat", absDir: -4, front: true },
      };
    }
    case "stand":
    default:
      return {
        hip: pt(0, -174 + br * 0.4),
        lean: 0,
        yaw: 38,
        headTilt: 0,
        gaze: gazePt(o.gaze, pt(0.2, 0)),
        breathe: br,
        legN: { to: pt(-9, 0) },
        legF: { to: pt(11, -1) },
        armN: { to: pt(-4, 118), ...relaxed },
        armF: { to: pt(5, 118), ...relaxed },
      };
  }
};

export type KidProps = CommonProps & {
  readonly look?: KidLook; // "boy" (главный, по умолчанию), "girl", "boy2"
  readonly pose?: KidPose;
  readonly phase?: number; // walk
  readonly hug?: number; // hug: 0…1
  readonly seat?: boolean; // sitBelted: рисовать автокресло-спинку с подголовником (по умолчанию да)
  readonly backpack?: boolean; // рюкзак на спине (стоя/идёт), по умолчанию да
};

export const Kid: React.FC<KidProps> = ({ x, y, scale = 1, flip, f, look = "boy", pose = "stand", phase = 0, hug = 1, seat = true, backpack = true, mouth = 0, expression, gaze, seed, opacity }) => {
  const b = kidBuild(look);
  const p0 = kidPose(b, pose, f, { phase, gaze, seat, hug });
  const p = backpack ? p0 : { ...p0, noPack: true };
  const expr: Expr = expression ?? (pose === "hug" && hug > 0.6 ? "joy" : pose === "wave" ? "happy" : pose === "homework" ? "neutral" : "smile");
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`} opacity={opacity}>
      <Figure build={b} outfit={kidOutfit(look)} pose={p} expr={expr} mouth={mouth} blink={blinkAt(f, seed ?? (look === "girl" ? 23 : look === "boy2" ? 37 : 5))} />
    </g>
  );
};

// ---------- мама + ребёнок: объятие ----------
// (x, y) — опора мамы; ребёнок на HUG_DX × scale правее, лицом к маме.
export const MomKidHug: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly scale?: number;
  readonly f: number;
  readonly progress?: number; // 0 — руки раскрыты, 1 — обнялись
  readonly look?: KidLook;
  readonly momMouth?: number;
  readonly kidMouth?: number;
  readonly flip?: boolean;
}> = ({ x, y, scale = 1, f, progress = 1, look = "boy", momMouth = 0, kidMouth = 0, flip }) => {
  const h = clamp01(progress);
  const kx = HUG_DX + (1 - smooth(h)) * 60;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
      <Mom x={0} y={0} f={f} pose="hug" hug={h} layer="back" mouth={momMouth} />
      <Kid x={kx} y={0} f={f} pose="hug" hug={h} flip look={look} mouth={kidMouth} backpack={false} />
      <Mom x={0} y={0} f={f} pose="hug" hug={h} layer="front" />
    </g>
  );
};

// ---------- водитель ----------
// Сидит, смотрит вперёд, ОБЕ руки на руле (руль рисуется всегда).
// Опора — точка сиденья. DRIVER_WHEEL — центр руля от опоры (scale 1).
export const DRIVER_WHEEL = pt(176, -168);
export type DriverProps = CommonProps & {
  readonly seat?: boolean; // спинка кресла с подголовником (вне машины)
  readonly steer?: number; // −1…1 лёгкий поворот руля (руки остаются на руле)
};
export const Driver: React.FC<DriverProps> = ({ x, y, scale = 1, flip, f, mouth = 0, expression = "smile", gaze, seed = 41, seat = false, steer = 0, opacity }) => {
  const b = DRIVER_BUILD;
  const W = DRIVER_WHEEL;
  const tilt = -24;
  const st = steer * 10;
  const hN = add(W, rot(pt(-6, -40), tilt + st));
  const hF = add(W, rot(pt(5, -34), tilt - st));
  const sk = skeleton(b, { hip: pt(0, -12), lean: -12, yaw: 12 });
  const p: Pose = {
    hip: pt(0, -12),
    lean: -12,
    yaw: 12,
    headTilt: 10,
    gaze: gazePt(gaze, pt(0.8, 0)),
    breathe: Math.sin((f / 100) * Math.PI * 2) * 0.6,
    seated: true,
    carSeat: seat,
    legN: { to: pt(262, 112), footRot: -10 },
    legF: { to: pt(276, 108), footRot: -10 },
    armN: { to: hN, bend: 1, hand: "grip", absDir: -40 + hash(1) },
    armF: { to: hF, bend: 1, hand: "grip", absDir: -50 },
  };
  void sk;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`} opacity={opacity}>
      <Figure build={b} outfit={DRIVER_OUTFIT} pose={p} expr={expression} mouth={mouth} blink={blinkAt(f, seed)} layer="back" />
      <SteeringWheel c={W} tilt={tilt} r={52} steer={st} />
      <Figure build={b} outfit={DRIVER_OUTFIT} pose={p} expr={expression} mouth={mouth} blink={blinkAt(f, seed)} layer="front" />
    </g>
  );
};
