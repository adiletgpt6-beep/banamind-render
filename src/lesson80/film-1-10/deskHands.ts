// Руки на виде сверху (DeskView) фильма 80-1-10: геометрия кисти (вид на
// тыльную сторону, пальцы с суставами в проекции сверху) и хореография рук
// учителя, Юсуфа, Амира и Билала по плану реквизита (plan.ts) и плану
// лодочки (boatPlan.ts). Чистые функции кадра, без React/Remotion.
//
// Система координат вида: X = u (мм вдоль стола), Y = TABLE_DEPTH_MM − v —
// край у детей (v = 0) внизу кадра, заголовок плаката вверху. Углы — в
// градусах экрана: 0 — пальцы «вверх» (к камере комнаты), + — по часовой.
// Все дети и учитель сидят у края v = 0, поэтому руки входят снизу.
//
// Синхронизация: кончик карандаша — точка штриха рисунка (drawingTip,
// boatTip, captionTip) на карточке, кончик маркера — titleTip, щепоть —
// край карточки, которую несут (карточка движется вместе с кистью),
// указательный — на полоске крепления в момент её прижатия.
import { clamp, easeInOut, lerp, smoothstep, type Vec } from "../rig/motion.ts";
import type { BoatPlan } from "./boatPlan.ts";
import { MM_PER_UNIT, TOP_GEOM, topFlapPolygon } from "./boatModel.ts";
import { boatTip, captionTip, drawingTip } from "./drawingPaths.ts";
import { AMIR_NEAR_YUSUF, AT_TABLE, CARD_MM, CARD_UNITS, cellCenter, DESK, POSTER, POSTER_ON_DESK, posterToDesk, TABLE_DEPTH_MM, worldToDeskU } from "./layout.ts";
import type { Plan } from "./plan.ts";
import { textCardSize, titleTip } from "./posterText.ts";
import { classRoster, rosterById, type DrawingKind } from "./roster.ts";

export type DeskHandWho = "teacher" | "yusuf" | "amir" | "bilal";
export type DeskHandShape = "pencil" | "marker" | "pinch" | "press" | "flat" | "point" | "hold" | "relax";
export type DeskHandSide = "R" | "L";
export type DeskHolding = "card" | "cards" | "textCard" | "stack" | "tape" | "pencil" | "marker" | "cap" | "boat" | "none";

// Предмет в руке (мм стола, углы экрана). Положение точное: его рисует вид
// вместе с кистью, поэтому предмет не отстаёт и не «прыгает».
export type DeskItem =
  | { readonly kind: "card"; readonly id: string; readonly center: Vec; readonly rot: number; readonly lift: number }
  | { readonly kind: "cards"; readonly ids: readonly string[]; readonly center: Vec; readonly rot: number } // веер чистых карточек: center/rot — верхняя
  | { readonly kind: "textCard"; readonly which: "one" | "two"; readonly center: Vec; readonly rot: number; readonly flip: number }
  | { readonly kind: "stack"; readonly ids: readonly string[]; readonly center: Vec; readonly rot: number } // ids[0] — верхняя
  | { readonly kind: "cap"; readonly center: Vec; readonly rot: number }
  | { readonly kind: "tape"; readonly center: Vec; readonly rot: number }
  | { readonly kind: "pencil"; readonly color: string; readonly tip: Vec; readonly angle: number; readonly elev: number; readonly len: number }
  | { readonly kind: "marker"; readonly tip: Vec; readonly angle: number; readonly elev: number; readonly cap: "on" | "off"; readonly len: number };

export type DeskHand = {
  readonly key: string; // устойчивый ключ: teacher-R, teacher-L, yusuf-R, amir-R, amir-L, bilal-R
  readonly who: DeskHandWho;
  readonly side: DeskHandSide; // L — зеркальная кисть
  readonly wrist: Vec; // мм стола
  readonly tip: Vec; // мм стола: точка контакта (кончик карандаша/маркера, щепоть, кончик указательного, центр ладони)
  readonly shape: DeskHandShape;
  readonly from: DeskHandShape; // смешивание поз from → shape
  readonly mix: number;
  readonly angle: number; // градусы экрана: направление запястье → пальцы (0 — вверх, + по часовой)
  readonly holding: DeskHolding;
  readonly item: DeskItem | null;
  readonly lift: number; // мм: точка контакта над поверхностью (0 — касается)
  readonly shoulder: Vec; // мм стола (за кадром): туда уходит предплечье
  readonly visible: number; // 0…1
  readonly z: number; // порядок рисования (больше — выше)
};

// ---------- система координат вида ----------
const DEPTH = TABLE_DEPTH_MM;
export const deskToView = (d: Vec): Vec => ({ x: d.x, y: DEPTH - d.y });
export const viewToDesk = (p: Vec): Vec => ({ x: p.x, y: DEPTH - p.y });
const V = (u: number, v: number): Vec => ({ x: u, y: DEPTH - v });

const add = (a: Vec, b: Vec): Vec => ({ x: a.x + b.x, y: a.y + b.y });
const sub = (a: Vec, b: Vec): Vec => ({ x: a.x - b.x, y: a.y - b.y });
const mul = (a: Vec, k: number): Vec => ({ x: a.x * k, y: a.y * k });
const len = (a: Vec) => Math.hypot(a.x, a.y);
const lerpV = (a: Vec, b: Vec, t: number): Vec => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
const RAD = Math.PI / 180;
export const rotV = (p: Vec, deg: number): Vec => {
  const c = Math.cos(deg * RAD);
  const s = Math.sin(deg * RAD);
  return { x: p.x * c - p.y * s, y: p.x * s + p.y * c };
};
// Единичный вектор направления «угол экрана» (0 — вверх).
export const dirV = (deg: number): Vec => ({ x: Math.sin(deg * RAD), y: -Math.cos(deg * RAD) });
const angDiff = (a: number, b: number) => ((((b - a) % 360) + 540) % 360) - 180;
const lerpA = (a: number, b: number, t: number) => a + angDiff(a, b) * t;
const ramp = (t: number, a: number, b: number) => (b <= a ? (t >= b ? 1 : 0) : clamp((t - a) / (b - a)));

// Поза предмета: точка и поворот (вид).
type Pose = { readonly p: Vec; readonly a: number };
const compose = (A: Pose, B: Pose): Pose => ({ p: add(A.p, rotV(B.p, A.a)), a: A.a + B.a });
const invert = (B: Pose): Pose => ({ p: rotV(mul(B.p, -1), -B.a), a: -B.a });
const lerpPose = (A: Pose, B: Pose, t: number): Pose => ({ p: lerpV(A.p, B.p, t), a: lerpA(A.a, B.a, t) });

// ---------- сложение рук ----------
export type HandBuild = {
  readonly L: number; // длина кисти (запястье → кончик среднего), мм
  readonly fingerW: number; // множитель толщины пальцев (пухлые детские)
  readonly fingerL: number; // множитель длины пальцев
  readonly palmW: number; // множитель ширины ладони
  readonly fore: number; // предплечье, мм
  readonly upper: number; // плечо, мм
  readonly wristW: number; // ширина запястья, мм
  readonly elbowW: number; // ширина у локтя
  readonly upperW: number; // ширина плеча (рукава)
};
export const HAND_BUILD: Record<DeskHandWho, HandBuild> = {
  teacher: { L: 176, fingerW: 1.0, fingerL: 1.02, palmW: 1.0, fore: 262, upper: 300, wristW: 60, elbowW: 82, upperW: 96 },
  bilal: { L: 141, fingerW: 1.02, fingerL: 1.0, palmW: 1.0, fore: 214, upper: 236, wristW: 48, elbowW: 64, upperW: 74 },
  amir: { L: 127, fingerW: 1.07, fingerL: 0.97, palmW: 1.03, fore: 188, upper: 206, wristW: 45, elbowW: 60, upperW: 68 },
  yusuf: { L: 108, fingerW: 1.16, fingerL: 0.9, palmW: 1.08, fore: 150, upper: 160, wristW: 43, elbowW: 56, upperW: 62 },
};

// ---------- геометрия кисти (локально: мм, запястье в 0, пальцы к −y,
// правая кисть — большой палец слева, −x) ----------
type FP = readonly [number, number, number, number]; // наклон в плоскости, сгибы MCP, PIP, DIP (градусы)
type TP = readonly [number, number, number, number, number]; // наклон, сгиб основания, MCP, IP, поворот фаланг
type Contact = "palm" | "tips" | "index" | "pinch" | "thumb" | "pen";
type PenAttach = { readonly dir: number; readonly elev: number; readonly ahead: number; readonly t: number };
type PoseDef = { readonly f: readonly [FP, FP, FP, FP]; readonly th: TP; readonly contact: Contact; readonly pen?: PenAttach; readonly over: readonly number[] };

// over — пальцы, которые лежат поверх предмета (большой палец всегда сверху).
const POSES: Record<DeskHandShape, PoseDef> = {
  flat: { f: [[-7, 6, 10, 6], [-1, 5, 9, 6], [5, 6, 10, 6], [11, 8, 12, 8]], th: [-46, 0, 8, 10, 8], contact: "palm", over: [0, 1, 2, 3] },
  relax: { f: [[-7, 22, 40, 22], [-1, 24, 44, 24], [5, 27, 48, 26], [12, 30, 50, 28]], th: [-36, 6, 18, 18, 12], contact: "tips", over: [0, 1, 2, 3] },
  press: { f: [[-5, 10, 16, 42], [3, 68, 102, 40], [8, 74, 104, 40], [13, 78, 104, 40]], th: [-16, 14, 36, 34, 26], contact: "index", over: [0, 1, 2, 3] },
  point: { f: [[-5, 4, 8, 8], [3, 68, 102, 40], [8, 74, 104, 40], [13, 78, 104, 40]], th: [-16, 14, 36, 34, 26], contact: "index", over: [0, 1, 2, 3] },
  pinch: { f: [[-17, 30, 58, 44], [-6, 58, 88, 40], [3, 66, 94, 40], [11, 72, 96, 40]], th: [-22, 4, 12, 14, 14], contact: "pinch", over: [] },
  hold: { f: [[-9, 14, 22, 14], [-2, 15, 24, 14], [5, 17, 26, 14], [12, 20, 28, 14]], th: [-30, 4, 8, 10, 6], contact: "thumb", over: [] },
  pencil: { f: [[-21, 24, 34, 12], [-18, 54, 82, 40], [1, 76, 98, 50], [10, 82, 98, 50]], th: [-32, 4, 20, 22, 16], contact: "pen", pen: { dir: 158, elev: 50, ahead: 0.16, t: 0.6 }, over: [0] },
  marker: { f: [[-19, 22, 32, 10], [-16, 52, 80, 40], [1, 76, 98, 50], [10, 82, 98, 50]], th: [-30, 4, 18, 20, 14], contact: "pen", pen: { dir: 156, elev: 56, ahead: 0.19, t: 0.55 }, over: [0] },
};

// Опорные точки кисти в долях L.
const MCP: readonly Vec[] = [
  { x: -0.15, y: -0.455 },
  { x: -0.046, y: -0.482 },
  { x: 0.054, y: -0.468 },
  { x: 0.146, y: -0.428 },
];
const FW = [0.1, 0.106, 0.097, 0.084];
const SEG: readonly (readonly [number, number, number])[] = [
  [0.235, 0.135, 0.105],
  [0.262, 0.157, 0.11],
  [0.244, 0.15, 0.105],
  [0.186, 0.116, 0.095],
];
const THUMB_BASE: Vec = { x: -0.15, y: -0.1 };
const THUMB_SEG = [0.2, 0.152, 0.128] as const;
const THUMB_W = [0.15, 0.122, 0.11] as const;
const PALM: readonly Vec[] = [
  { x: -0.15, y: 0.03 },
  { x: -0.19, y: -0.1 },
  { x: -0.205, y: -0.27 },
  { x: -0.196, y: -0.41 },
  { x: -0.152, y: -0.5 },
  { x: -0.046, y: -0.525 },
  { x: 0.054, y: -0.51 },
  { x: 0.146, y: -0.47 },
  { x: 0.188, y: -0.405 },
  { x: 0.2, y: -0.22 },
  { x: 0.168, y: -0.05 },
  { x: 0.15, y: 0.03 },
];

export type Chain = { readonly pts: readonly Vec[]; readonly w: readonly number[]; readonly vis: readonly number[] };
export type HandGeom = {
  readonly L: number;
  readonly palm: readonly Vec[];
  readonly fingers: readonly Chain[]; // указательный … мизинец
  readonly thumb: Chain;
  readonly contact: Vec;
  readonly pen: { readonly tip: Vec; readonly dir: number; readonly elev: number } | null;
  readonly over: readonly number[];
};

const lerpArr = <T extends readonly number[]>(a: T, b: T, t: number): T => a.map((x, i) => lerp(x, b[i], t)) as unknown as T;

const chainOf = (base: Vec, a: number, flex: readonly number[], segs: readonly number[], w0: number, bend: number): { draw: Chain; tip: Vec } => {
  const pts: Vec[] = [base];
  const w: number[] = [];
  const vis: number[] = [];
  let p = base;
  let q = base; // настоящий кончик (с подогнутыми фалангами)
  let cum = 0;
  segs.forEach((s, i) => {
    cum += flex[i];
    const k = Math.cos(cum * RAD);
    const d = dirV(a + bend * i);
    p = add(p, mul(d, s * Math.max(0, k)));
    q = add(q, mul(d, s * k));
    pts.push(p);
    w.push(w0 * (1 - 0.08 * i));
    vis.push(k);
  });
  return { draw: { pts, w, vis }, tip: q };
};

const poseGeom = (b: HandBuild, def: PoseDef) => {
  const L = b.L;
  const S = (v: Vec): Vec => ({ x: v.x * L * b.palmW, y: v.y * L });
  const fingers = MCP.map((m, i) => {
    const [a, c1, c2, c3] = def.f[i];
    return chainOf(S(m), a, [c1, c2, c3], SEG[i].map((s) => s * L * b.fingerL), FW[i] * L * b.fingerW, 0);
  });
  const [ta, t0, t1, t2, tb] = def.th;
  const thumb = chainOf(S(THUMB_BASE), ta, [t0, t1, t2], THUMB_SEG.map((s) => s * L * Math.sqrt(b.fingerL)), THUMB_W[0] * L * b.fingerW, tb);
  const thumbTip = thumb.tip;
  const indexTip = fingers[0].tip;
  let contact: Vec;
  switch (def.contact) {
    case "palm":
      contact = { x: -0.01 * L, y: -0.27 * L };
      break;
    case "tips":
      contact = lerpV(fingers[0].draw.pts[3], fingers[1].draw.pts[3], 0.5);
      break;
    case "index":
      contact = fingers[0].draw.pts[3];
      break;
    case "pinch":
      contact = lerpV(thumbTip, indexTip, 0.5);
      break;
    case "thumb":
      contact = thumb.draw.pts[3];
      break;
    default:
      contact = { x: 0, y: 0 };
  }
  let pen: { tip: Vec; dir: number; elev: number } | null = null;
  if (def.pen) {
    const g = lerpV(thumbTip, indexTip, def.pen.t);
    const tip = sub(g, mul(dirV(def.pen.dir), def.pen.ahead * L));
    pen = { tip, dir: def.pen.dir, elev: def.pen.elev };
    if (def.contact === "pen") contact = tip;
  }
  return { fingers: fingers.map((f) => f.draw), thumb: thumb.draw, contact, pen, palm: PALM.map(S) };
};

// Карандаш/маркер, зажатый щепотью (лежит поперёк пальцев): проходит через
// точку щепоти, кончик — на расстоянии grab от неё.
const PINCH_PEN = { dir: 96, elev: 4 };

// Геометрия кисти для смешанной позы from → shape (mix 0…1).
export const handGeom = (who: DeskHandWho, shape: DeskHandShape, from: DeskHandShape = shape, mix = 1, grab = 60): HandGeom => {
  const b = HAND_BUILD[who];
  const A = POSES[from];
  const B = POSES[shape];
  const m = from === shape ? 1 : clamp(mix);
  const def: PoseDef = {
    f: [0, 1, 2, 3].map((i) => lerpArr(A.f[i], B.f[i], m)) as unknown as PoseDef["f"],
    th: lerpArr(A.th, B.th, m),
    contact: B.contact,
    over: m < 0.5 ? A.over : B.over,
  };
  const ga = poseGeom(b, { ...def, contact: A.contact, pen: A.pen });
  const gb = poseGeom(b, { ...def, contact: B.contact, pen: B.pen });
  const contact = lerpV(ga.contact, gb.contact, m);
  // крепление карандаша: «рабочий» хват или щепоть
  const penOf = (g: typeof ga, d: PoseDef) =>
    d.pen ? g.pen : d.contact === "pinch" ? { tip: sub(g.contact, mul(dirV(PINCH_PEN.dir), grab)), dir: PINCH_PEN.dir, elev: PINCH_PEN.elev } : null;
  const pa = penOf(ga, A);
  const pb = penOf(gb, B);
  const pen = pa && pb ? { tip: lerpV(pa.tip, pb.tip, m), dir: lerp(pa.dir, pb.dir, m), elev: lerp(pa.elev, pb.elev, m) } : (pb ?? pa);
  return { L: b.L, palm: gb.palm, fingers: gb.fingers, thumb: gb.thumb, contact, pen, over: def.over };
};

// Локальная точка кисти → вид (запястье, угол, зеркало).
export const handToView = (wrist: Vec, angle: number, side: DeskHandSide, p: Vec): Vec => add(wrist, rotV({ x: side === "L" ? -p.x : p.x, y: p.y }, angle));

// ---------- места и плечи ----------
const SEAT_U = {
  bilal: worldToDeskU(AT_TABLE.bilal.x),
  amir: worldToDeskU(AT_TABLE.amir.x),
  amirNear: worldToDeskU(AMIR_NEAR_YUSUF.x),
  yusuf: worldToDeskU(AT_TABLE.yusuf.x),
  teacher: worldToDeskU(AT_TABLE.teacher.x),
};
const SHOULDER = {
  teacher: { half: 150, v: -230 },
  bilal: { half: 100, v: -165 },
  amir: { half: 90, v: -152 },
  yusuf: { half: 76, v: -140 },
} as const;

// ---------- размеры реквизита (мм) ----------
export const PENCIL_LEN = 150;
export const MARKER_LEN = 132;
export const BOAT_PENCIL = "#3E6DB5";
// Пенал: карандаши лежат вдоль u, остриём влево; у каждого своя строка.
export const TRAY_PENCILS: readonly { readonly color: string; readonly dv: number; readonly du: number; readonly owner?: "yusuf" | "amir" | "bilal" | "boat" }[] = [
  { color: "#F2C53D", dv: 15, du: 4 },
  { color: "#D94A3A", dv: 10, du: -3, owner: "yusuf" },
  { color: "#8A5AA8", dv: 5, du: 6 },
  { color: "#4E9A4A", dv: 0, du: -5, owner: "amir" },
  { color: BOAT_PENCIL, dv: -5, du: 2, owner: "boat" },
  { color: "#4A86C8", dv: -10, du: -6, owner: "bilal" },
  { color: "#E8913A", dv: -15, du: 3 },
];
// Место пенала, где лежит карандаш (кончик, мм стола) и куда за ним тянутся.
export const trayPencilTip = (owner: "yusuf" | "amir" | "bilal" | "boat"): Vec => {
  const r = TRAY_PENCILS.find((p) => p.owner === owner)!;
  const t = DESK.pencilTray;
  return { x: t.x - PENCIL_LEN / 2 + r.du, y: t.y + r.dv };
};
// Место захвата (мм от кончика): u точки захвата — как в plan.pencil.
const trayGrab = (owner: "yusuf" | "amir" | "bilal" | "boat") => {
  const off = owner === "yusuf" ? 38 : owner === "amir" ? -8 : owner === "bilal" ? -50 : 14;
  return DESK.pencilTray.x + off - trayPencilTip(owner).x;
};
// Карандаш возвращают в пенал (на своё место), а не оставляют на листе:
// позже на этом месте сетка карточек. Кадр, с которого карандаш снова в
// пенале. Один источник для хореографии и вида.
export const PENCIL_RETURN = 24; // кадров на возврат в пенал после последнего штриха
export const pencilBackAt = (plan: Plan) => {
  const main = (id: "yusuf" | "amir" | "bilal") => {
    const prog = plan.mainProgress[id];
    let done = plan.drawStart[id];
    while (done < plan.drawStart[id] + 4000 && prog(done) < 1) done++;
    return Math.max(plan.pencilDown[id], done + PENCIL_RETURN);
  };
  return { yusuf: main("yusuf"), amir: main("amir"), bilal: main("bilal"), boat: Math.max(plan.boatPencil.down, plan.boatPencil.capEnd + PENCIL_RETURN) };
};
// Билал рисует за краем листа: его карандаш остаётся лежать у карточки
// (место из plan.pencil — вне сетки), остальные возвращают в пенал.
export const PENCIL_REST_ANGLE = 84;
export const pencilLiesAtRest = (owner: "yusuf" | "amir" | "bilal" | "boat") => owner === "bilal";
// Карандаш в пенале при кадре t (взят — в руке или лежит у карточки).
export const pencilInTray = (plan: Plan, owner: "yusuf" | "amir" | "bilal" | "boat", t: number, back = pencilBackAt(plan)) =>
  owner === "boat" ? t < plan.boatPencil.yGrab || t >= back.boat : t < plan.pencilTake[owner].grab || (!pencilLiesAtRest(owner) && t >= back[owner]);
// Маркер: лежит у учителя; DESK.marker — центр, rot — направление кончик → торец.
export const markerLying = (): { tip: Vec; angle: number } => {
  const c = V(DESK.marker.x, DESK.marker.y);
  const tip = sub(c, mul(dirV(DESK.marker.rot), MARKER_LEN / 2));
  return { tip: viewToDesk(tip), angle: DESK.marker.rot };
};
export const CAP_LEN = 40;

// Рулон листа в начале фильма: лист раскатывают слева направо (к учителю).
export const posterRoll = (s: number) => {
  const k = clamp(s);
  return { edgeU: POSTER_ON_DESK.u0 + POSTER.w * k, r: 19 * Math.sqrt(1 - k) };
};

// Веер чистых карточек при раздаче: каждая нижняя — со сдвигом STEP от верхней.
export const DEAL_STEP: Pose = { p: { x: -15, y: 5 }, a: -5 };

// ---------- состояние руки (вид) ----------
type ItemS =
  | { readonly kind: "card"; readonly id: string; readonly pose: Pose; readonly lift: number }
  | { readonly kind: "cards"; readonly ids: readonly string[]; readonly pose: Pose }
  | { readonly kind: "textCard"; readonly which: "one" | "two"; readonly pose: Pose; readonly flip: number }
  | { readonly kind: "stack"; readonly ids: readonly string[]; readonly pose: Pose }
  | { readonly kind: "cap"; readonly pose: Pose }
  | { readonly kind: "tape"; readonly pose: Pose }
  | { readonly kind: "pencil"; readonly color: string; readonly grab: number }
  | { readonly kind: "marker"; readonly cap: "on" | "off"; readonly grab: number }
  | { readonly kind: "boat" };

type HS = {
  readonly tip: Vec;
  readonly angle: number;
  readonly shape: DeskHandShape;
  readonly from?: DeskHandShape;
  readonly mix?: number;
  readonly lift: number;
  readonly item?: ItemS | null;
  readonly z?: number;
};
type Seg = {
  readonly from: number;
  readonly to: number;
  readonly at: (t: number) => HS;
  readonly enter?: number;
  readonly exit?: number;
  readonly carryIn?: boolean; // рука входит в кадр уже с предметом
  readonly carryOut?: boolean; // уходит с предметом (иначе предмет остаётся на месте)
  readonly fixed?: boolean; // enter/exit — точная длительность (иначе — не меньше, по расстоянию)
};

const dom = (s: HS): DeskHandShape => (s.from && (s.mix ?? 1) < 0.5 ? s.from : s.shape);
const itemKey = (i: ItemS | null | undefined) => {
  if (!i) return "";
  switch (i.kind) {
    case "card":
      return `card:${i.id}`;
    case "cards":
      return `cards:${i.ids.join(",")}`;
    case "textCard":
      return `text:${i.which}`;
    case "stack":
      return `stack:${i.ids.length}`;
    case "pencil":
      return `pencil:${i.color}`;
    default:
      return i.kind;
  }
};
const posed = (i: ItemS): Pose | null => ("pose" in i ? i.pose : null);
const withPose = (i: ItemS, p: Pose): ItemS => ("pose" in i ? ({ ...i, pose: p } as ItemS) : i);
const frameOf = (s: HS): Pose => ({ p: s.tip, a: s.angle });

// Перенос предмета вместе с рукой между двумя состояниями.
const carryItem = (A: HS, B: HS, e: number, frame: Pose): ItemS | null => {
  if (!A.item || !B.item || itemKey(A.item) !== itemKey(B.item)) return null;
  const pa = posed(A.item);
  const pb = posed(B.item);
  if (!pa || !pb) return B.item;
  const ra = compose(invert(frameOf(A)), pa);
  const rb = compose(invert(frameOf(B)), pb);
  const it = withPose(B.item, compose(frame, lerpPose(ra, rb, e)));
  if (it.kind === "card" && A.item.kind === "card") return { ...it, lift: lerp(A.item.lift, it.lift, e) };
  if (it.kind === "textCard" && A.item.kind === "textCard") return { ...it, flip: lerp(A.item.flip, it.flip, e) };
  return it;
};

// Перенос руки из A в B (u 0…1): по дуге (приподнята в середине пути).
const travel = (A: HS, B: HS, u: number, bumpK = 1): HS => {
  // плавный разгон и торможение руки (пиковая скорость — 1,5 средней)
  const e = smoothstep(u);
  const d = len(sub(A.tip, B.tip));
  const bump = Math.sin(Math.PI * clamp(u)) * Math.min(26, 3 + d * 0.1) * bumpK;
  const sa = dom(A);
  const sb = dom(B);
  const tip = lerpV(A.tip, B.tip, e);
  const angle = lerpA(A.angle, B.angle, e);
  const st: HS = {
    tip,
    angle,
    shape: sb,
    from: sa,
    mix: sa === sb ? 1 : easeInOut(clamp((u - 0.1) / 0.75)),
    lift: lerp(A.lift, B.lift, e) + bump,
    z: lerp(A.z ?? 0, B.z ?? 0, e),
  };
  return { ...st, item: carryItem(A, B, e, { p: tip, a: angle }) };
};

// Предмет в руке «уходит» вместе с ней за кадр (или входит из-за кадра).
const keepItem = (src: HS, dst: HS): HS => {
  if (!src.item) return dst;
  const p = posed(src.item);
  if (!p) return { ...dst, item: src.item };
  const rel = compose(invert(frameOf(src)), p);
  return { ...dst, item: withPose(src.item, compose(frameOf(dst), rel)) };
};

type Spec = { readonly key: string; readonly who: DeskHandWho; readonly side: DeskHandSide; readonly shoulder: (t: number) => Vec; readonly z: number };

const JOIN = 30;

const runner = (spec: Spec, segsIn: readonly Seg[]) => {
  const segs = [...segsIn].filter((s) => s.to >= s.from).sort((a, b) => a.from - b.from);
  const sx = spec.side === "R" ? 1 : -1;
  const rest = (t: number): HS => {
    const sh = spec.shoulder(t);
    const adult = spec.who === "teacher";
    return { tip: add(sh, { x: -sx * 34, y: adult ? -70 : -48 }), angle: -sx * 6, shape: "relax", lift: 40 };
  };
  return (t: number): HS => {
    let prev: Seg | null = null;
    let next: Seg | null = null;
    for (const s of segs) {
      if (t >= s.from && t <= s.to) return s.at(t);
      if (s.to < t) prev = s;
      else if (s.from > t && !next) next = s;
    }
    if (prev && next && next.from - prev.to <= JOIN) return travel(prev.at(prev.to), next.at(next.from), (t - prev.to) / (next.from - prev.to));
    const gap = prev && next ? next.from - prev.to : Infinity;
    if (prev) {
      const A = prev.at(prev.to);
      const R = rest(prev.to);
      // уход за кадр и вход — не быстрее ≈ 14 мм за кадр (в крупных планах без «рывков»)
      const ex = Math.min(prev.fixed && prev.exit ? prev.exit : Math.max(prev.exit ?? 0, clamp(len(sub(A.tip, R.tip)) / 14, 12, 48)), gap / 2);
      if (t < prev.to + ex) {
        const Rb = rest(prev.to + ex);
        return travel(A, prev.carryOut ? keepItem(A, Rb) : Rb, (t - prev.to) / ex, 0.4);
      }
    }
    if (next) {
      const B = next.at(next.from);
      const R = rest(next.from);
      const en = Math.min(next.fixed && next.enter ? next.enter : Math.max(next.enter ?? 0, clamp(len(sub(B.tip, R.tip)) / 14, 12, 48)), gap / 2);
      if (t > next.from - en) {
        const Ra = rest(next.from - en);
        return travel(next.carryIn ? keepItem(B, Ra) : Ra, B, (t - (next.from - en)) / en, 0.4);
      }
    }
    return rest(t);
  };
};

// ---------- помощники хореографии ----------
const KX = CARD_MM.w / CARD_UNITS.w;
const KY = CARD_MM.h / CARD_UNITS.h;
// Точка карточки (единицы 300 × 202) → вид.
const cardPt = (c: Pose, ux: number, uy: number): Vec => add(c.p, rotV({ x: (ux - CARD_UNITS.w / 2) * KX, y: (uy - CARD_UNITS.h / 2) * KY }, c.a));
// Хват карточки: точка (мм от центра карточки) и угол кисти относительно карточки.
type Grip = { readonly at: Vec; readonly ra: number };
const GRIP = {
  stackL: { at: { x: 26, y: 22 }, ra: 2 },
  right: { at: { x: 44, y: 5 }, ra: -86 },
  left: { at: { x: -45, y: 6 }, ra: 64 },
  bottom: { at: { x: -22, y: 29 }, ra: -6 },
  bottomR: { at: { x: 18, y: 29 }, ra: -18 },
} as const satisfies Record<string, Grip>;
const gripHS = (card: Pose, g: Grip, item: ItemS | null, lift = 0, shape: DeskHandShape = "pinch"): HS => ({
  tip: add(card.p, rotV(g.at, card.a)),
  angle: card.a + g.ra,
  shape,
  lift,
  item,
});
const ownerOfCard = (cardId: string) => classRoster.find((r) => r.cardId === cardId)!.id;
const cellView = (ownerId: string): Vec => {
  const r = rosterById(ownerId);
  return deskToView(posterToDesk(cellCenter(r.cell.row, r.cell.col)));
};
const firstFrame = (from: number, pred: (t: number) => boolean, max = 4000) => {
  for (let t = from; t < from + max; t++) if (pred(t)) return t;
  return from + max;
};

// Держит предмет неподвижно.
const still = (s: HS): ((t: number) => HS) => () => s;
const seg = (from: number, to: number, at: (t: number) => HS, enter?: number, exit?: number): Seg => ({ from, to, at, enter, exit });
// Перенос между двумя состояниями за [from, to].
const move = (from: number, to: number, A: HS, B: HS, bumpK = 1): Seg => seg(from, to, (t) => travel(A, B, ramp(t, from, to), bumpK));

// ---------- главная функция ----------
export const buildDeskHands = (plan: Plan, boat: BoatPlan) => {
  const P = plan;
  const backAt = pencilBackAt(plan);
  const mainKind: Record<"yusuf" | "amir" | "bilal", DrawingKind> = { yusuf: "apple", amir: "tree", bilal: "earth" };
  const SPOT = { yusuf: DESK.drawYusuf, amir: DESK.drawAmir, bilal: DESK.drawBilal } as const;
  const spotPose = (id: "yusuf" | "amir" | "bilal"): Pose => ({ p: V(SPOT[id].x, SPOT[id].y), a: SPOT[id].rot });
  const cellPose = (owner: string, t: number): Pose => ({ p: cellView(owner), a: P.cardState(owner, t).rot });

  const amirSeat = (t: number) => lerp(SEAT_U.amir, SEAT_U.amirNear, boat.amirNear(t));
  const seatU = (who: DeskHandWho, t: number) => (who === "amir" ? amirSeat(t) : who === "teacher" ? SEAT_U.teacher : SEAT_U[who]);
  const shoulderOf = (who: DeskHandWho, side: DeskHandSide) => (t: number): Vec => V(seatU(who, t) + (side === "R" ? 1 : -1) * SHOULDER[who].half, SHOULDER[who].v);

  // ---------- карандаш в руке: рисование по карточке ----------
  const SWAY = { yusuf: -26, amir: -24, bilal: -20 } as const;
  const drawHS = (who: "yusuf" | "amir" | "bilal", card: Pose, tipFn: (t: number) => { x: number; y: number; down: boolean }, item: ItemS, t: number, base: number = SWAY[who]): HS => {
    const d = tipFn(t);
    const tip = cardPt(card, d.x, d.y);
    // кисть чуть поворачивается, когда кончик уходит в сторону от центра карточки
    const dx = (tip.x - card.p.x) / CARD_MM.w;
    const dy = (tip.y - card.p.y) / CARD_MM.h;
    // приподнятый карандаш опускается/поднимается плавно (сглаживание по соседним кадрам)
    let up = 0;
    for (let k = -3; k <= 3; k++) up += (tipFn(t + k).down ? 0 : 1) * (4 - Math.abs(k));
    up /= 16;
    return { tip, angle: base + dx * 14 - dy * 6, shape: "pencil", lift: 5 * up, item, z: 1 };
  };
  const pencilItem = (color: string, grab = 60): ItemS => ({ kind: "pencil", color, grab });

  // ---------- сцена 1: лист ----------
  const rollTeacher = (side: DeskHandSide): Seg[] => {
    const vR = side === "R" ? 470 : 205;
    const ang = side === "R" ? -12 : -30;
    const roll = (t: number): HS => {
      const r = posterRoll(P.posterSpread(t));
      return { tip: V(r.edgeU + r.r * 1.15, vR), angle: ang, shape: "flat", lift: 2 * r.r, z: 2 };
    };
    const s = P.spread;
    const sm = P.smooth;
    const end = roll(s.to);
    const target = side === "R" ? V(820, 452) : V(690, 168);
    return [seg(0, s.to, roll), seg(s.to, sm.to, (t) => travel(end, { tip: target, angle: side === "R" ? -18 : -36, shape: "flat", lift: 0, z: 2 }, ramp(t, s.to, sm.to), 0.15), 16, 20)];
  };

  // ---------- сцена 1: раздача чистых карточек ----------
  const deal = P.dealTo;
  const midA = Math.round((deal.amir.give + deal.amir.land) / 2);
  const midB = Math.round((deal.bilal.give + deal.bilal.land) / 2);
  const cid = (o: string) => rosterById(o).cardId;
  const handA: Pose = { p: V(655, 214), a: -1 }; // карточка Амира в момент передачи
  const handB: Pose = { p: V(540, 252), a: -4 }; // карточка Билала
  const step2 = compose(DEAL_STEP, DEAL_STEP);
  const dealTop = (t: number): { pose: Pose; ids: string[] } => {
    const landY = compose(spotPose("yusuf"), invert(step2));
    const atA = compose(handA, invert(DEAL_STEP));
    const off: Pose = { p: V(1215, -80), a: -28 };
    if (t < deal.yusuf.land) return { pose: lerpPose(off, landY, smoothstep(ramp(t, deal.yusuf.give - 20, deal.yusuf.land))), ids: [cid("bilal"), cid("amir"), cid("yusuf")] };
    if (t < midA) return { pose: lerpPose(landY, atA, smoothstep(ramp(t, deal.yusuf.land, midA))), ids: [cid("bilal"), cid("amir")] };
    return { pose: lerpPose(atA, handB, smoothstep(ramp(t, midA, midB))), ids: [cid("bilal")] };
  };
  const dealHS = (t: number): HS => {
    const d = dealTop(t);
    const lift = t < deal.yusuf.land ? 14 * (1 - ramp(t, deal.yusuf.land - 8, deal.yusuf.land)) : 10 + 8 * Math.sin(Math.PI * ramp(t, deal.yusuf.land, midB));
    return gripHS(d.pose, GRIP.right, { kind: "cards", ids: d.ids, pose: d.pose }, lift);
  };
  const teacherDeal: Seg = { ...seg(deal.yusuf.give - 20, midB, dealHS, 14, 18), carryIn: true };
  // ребёнок берёт свою карточку из рук учителя и кладёт на своё место
  const kidTakeDeal = (id: "amir" | "bilal", mid: number, land: number, at: Pose, g: Grip): Seg =>
    seg(mid, land, (t) => {
      const u = smoothstep(ramp(t, mid, land));
      const pose = lerpPose(at, spotPose(id), u);
      const lift = 10 * (1 - u) + 6 * Math.sin(Math.PI * u);
      return gripHS(pose, g, { kind: "card", id: cid(id), pose, lift }, lift);
    }, 14, 16);

  // ---------- сцена 1: карандаши и рисование ----------
  const pencilScene1 = (id: "yusuf" | "amir" | "bilal"): Seg[] => {
    const pt = P.pencilTake[id];
    const color = pt.color;
    const grab = trayGrab(id);
    const trayTip = deskToView(trayPencilTip(id));
    // поза щепоти над карандашом в пенале: карандаш лежит вдоль u (90°)
    const pinchAngle = 90 - PINCH_PEN.dir;
    const grabPoint = add(trayTip, mul(dirV(90), grab));
    const atTray: HS = { tip: grabPoint, angle: pinchAngle, shape: "pinch", lift: 0, item: pencilItem(color, grab), z: 2 };
    const reachHS: HS = { ...atTray, item: null };
    const card = spotPose(id);
    const kind = mainKind[id];
    const prog = P.mainProgress[id];
    const done = firstFrame(P.drawStart[id], (t) => prog(t) >= 1);
    // после последнего штриха карандаш возвращают в пенал
    const down = backAt[id];
    const tipFn = (t: number) => drawingTip(kind, prog(t));
    const item = pencilItem(color, grab);
    const startHS = { ...drawHS(id, card, tipFn, item, P.drawStart[id]), lift: 5 };
    const restTip = deskToView(P.pencil(id, P.pencilDown[id] + 1).desk);
    const layHS: HS = pencilLiesAtRest(id)
      ? { tip: add(restTip, mul(dirV(PENCIL_REST_ANGLE), 70)), angle: PENCIL_REST_ANGLE - PINCH_PEN.dir, shape: "pinch", lift: 0, item: pencilItem(color, 70), z: 1 }
      : { ...atTray, z: 1 };
    return [
      seg(pt.grab - 1, pt.grab, still(reachHS), pt.grab - pt.reach),
      move(pt.grab, pt.back, atTray, startHS, 1.2),
      seg(pt.back, P.drawStart[id], still(startHS)),
      seg(P.drawStart[id], done, (t) => drawHS(id, card, tipFn, item, t)),
      move(done, down, drawHS(id, card, tipFn, item, done), layHS, 0.6),
    ];
  };

  // ---------- сцена 2: три рисунка на лист ----------
  const lay = P.layOf;
  const handA2: Pose = { p: V(744, 222), a: 1 };
  const handB2: Pose = { p: V(470, 258), a: -2 };
  const carryCard = (owner: string, from: number, to: number, A: Pose, B: Pose, g: Grip, liftK = 14, ease: (x: number) => number = smoothstep) => (t: number): HS => {
    const u = ease(ramp(t, from, to));
    const pose = lerpPose(A, B, u);
    const lift = liftK * Math.sin(Math.PI * u);
    return gripHS(pose, g, { kind: "card", id: cid(owner), pose, lift }, lift);
  };
  const putTime = (owner: string) => firstFrame(0, (t) => P.cardState(owner, t).where === "poster");

  // ---------- сцена 2: маркер и заголовок ----------
  const W = P.write;
  const mk = markerLying();
  const mkTip = deskToView(mk.tip);
  const MK_GRAB = 84;
  const markerPinch: HS = { tip: add(mkTip, mul(dirV(mk.angle), MK_GRAB)), angle: mk.angle - PINCH_PEN.dir, shape: "pinch", lift: 0, item: { kind: "marker", cap: "on", grab: MK_GRAB }, z: 2 };
  const titleView = (p: number) => {
    const tt = titleTip(p);
    return { p: deskToView(posterToDesk({ x: tt.x, y: tt.y })), down: tt.down };
  };
  const writeHS = (t: number, cap: "on" | "off" = "off"): HS => {
    const p = P.titleProgress(t);
    const tv = titleView(p);
    let up = 0;
    for (let k = -3; k <= 3; k++) up += (titleView(P.titleProgress(t + k)).down ? 0 : 1) * (4 - Math.abs(k));
    up /= 16;
    const lineK = (tv.p.x - 788) / 300;
    return { tip: tv.p, angle: -30 + lineK * 8, shape: "marker", lift: 6 * up, item: { kind: "marker", cap, grab: MK_GRAB }, z: 2 };
  };
  // колпачок снимают и надевают двумя руками: правая держит маркер щепотью
  // посередине (маркер поперёк кисти, кончиком влево), левая тянет колпачок
  const uncapAt: HS = { tip: V(760, 452), angle: -12, shape: "pinch", lift: 26, item: { kind: "marker", cap: "on", grab: MK_GRAB }, z: 2 };
  const recapAt: HS = { tip: V(1060, 436), angle: -12, shape: "pinch", lift: 24, item: { kind: "marker", cap: "off", grab: MK_GRAB }, z: 2 };
  const tGrab = W.cap - 30;
  // колпачок: где он на маркере (вид) для позы маркера в руке
  const markerTipOf = (s: HS) => {
    const g = handGeom("teacher", s.shape, s.from ?? s.shape, s.mix ?? 1, MK_GRAB);
    const tip = handToView(sub(s.tip, rotV(g.contact, s.angle)), s.angle, "R", g.pen!.tip);
    return { tip, dir: s.angle + g.pen!.dir };
  };
  const capPoseOn = (s: HS, off: number): Pose => {
    const m = markerTipOf(s);
    // колпачок надет на кончик: его центр — на оси маркера, у кончика; off — снятие вдоль оси (мм)
    return { p: add(m.tip, mul(dirV(m.dir), CAP_LEN / 2 - 8 - off)), a: m.dir };
  };

  // ---------- текстовые карточки ----------
  const textSeg = (which: "one" | "two", ev: typeof P.textOneEv): { R: Seg[]; L: Seg[] } => {
    const size = textCardSize(which);
    const grip: Grip = { at: { x: size.w / 2 - 11, y: 6 }, ra: -84 };
    // карточку сначала подносят почти к месту, переворачивают над ним и кладут
    const from = deskToView(P.textState(which, ev.take - 1).desk);
    const to = deskToView(P.textState(which, ev.put).desk);
    const k = (t: number) => 0.84 * easeInOut(ramp(t, ev.take, ev.flip + 3)) + 0.16 * easeInOut(ramp(t, ev.flipped - 2, ev.put));
    const pose = (t: number): Pose => ({ p: lerpV(from, to, k(t)), a: lerp(DESK.textStack.rot, 0, easeInOut(ramp(t, ev.take, ev.put))) });
    const carry = (t: number): HS => {
      const s = P.textState(which, t);
      const ps = pose(t);
      const lift = 18 * Math.sin(Math.PI * ramp(t, ev.take, ev.flip + 3)) + 12 * ramp(t, ev.flip, ev.flip + 4) * (1 - ramp(t, ev.flipped, ev.put));
      return { ...gripHS(ps, grip, { kind: "textCard", which, pose: ps, flip: s.flip }, lift), z: 2 };
    };
    const slot = pose(ev.put);
    const stripL = add(slot.p, { x: -size.w / 2 + 3, y: 0 });
    const stripR = add(slot.p, { x: size.w / 2 - 3, y: 0 });
    const holdR: HS = { tip: add(slot.p, { x: size.w / 2 - 12, y: 6 }), angle: -58, shape: "press", lift: 0, z: 2 };
    const pressR: HS = { tip: stripR, angle: -52, shape: "press", lift: 0, z: 2 };
    const pressL: HS = { tip: stripL, angle: -28, shape: "press", lift: 0, z: 2 };
    const t1 = ev.tape1;
    const t2 = ev.tape2;
    return {
      R: [
        seg(ev.take, ev.put, carry, 16),
        move(ev.put, ev.put + 6, carry(ev.put), holdR, 0.2),
        seg(ev.put + 6, t2 - 9, still(holdR)),
        move(t2 - 9, t2 - 4, holdR, { ...pressR, lift: 3 }, 0.5),
        seg(t2 - 4, t2 + 3, (t) => ({ ...pressR, lift: 3 * (1 - ramp(t, t2 - 4, t2 - 1)) }), undefined, 16),
      ],
      L: [seg(t1 - 5, t1 + 3, (t) => ({ ...pressL, lift: 3 * (1 - ramp(t, t1 - 5, t1 - 1)), item: t < t1 - 3 ? { kind: "tape", pose: { p: stripL, a: 90 } } : null }), 16, 16)],
    };
  };

  // ---------- сцена 7: закрепление карточек ----------
  const FIX = P.FIX_LEN;
  const fixList = [...P.fixTimes.entries()].sort((a, b) => a[1] - b[1]);
  const lapseIds = new Set(fixList.filter(([, at]) => at >= P.lapse.from - FIX && at < P.lapse.at).map(([id]) => id));
  const mainFix = new Set(["bilal", "amir", "yusuf", "pupil05"]);
  const stripPts = (owner: string) => {
    const c = cellView(owner);
    return [add(c, { x: -CARD_MM.w / 2 + 4, y: -CARD_MM.h / 2 + 3 }), add(c, { x: CARD_MM.w / 2 - 4, y: -CARD_MM.h / 2 + 3 })] as const;
  };
  // нажатие двух полосок: [at, at+half) — первая, [at+half, at+2·half) — вторая
  // Две полоски по краям карточки: [from →] полоска 1 → переход → полоска 2,
  // строго до end (дальше — переход к следующему действию). from — поза кисти в
  // момент at (карточку только что положили): к первой полоске кисть переходит
  // за 4 кадра, а не перескакивает.
  const pressSegs = (owner: string, at: number, end: number, from?: HS): Seg[] => {
    const [s1, s2] = stripPts(owner);
    // у правого нижнего угла (там ладонь Юсуфа) кисть ставится прямо снизу
    const nearCorner = viewToDesk(s1).x > 980 && viewToDesk(s1).y < 230;
    const hs = (p: Vec, lift: number): HS => ({ tip: p, angle: nearCorner ? -4 : -34, shape: "press", lift, z: 3 });
    const t0 = from ? at + 4 : at;
    const avail = Math.max(6, end - t0);
    const mv = clamp(Math.floor(avail * 0.4), 3, 6);
    const p1 = Math.max(2, Math.floor((avail - mv) / 2));
    const t2 = t0 + p1 + mv;
    const out: Seg[] = [];
    if (from) out.push(move(at, t0, from, hs(s1, 3), 0.3));
    out.push(seg(from ? t0 : at - 2, t0 + p1, (t) => hs(s1, 3 * (1 - ramp(t, t0 - 2, t0 + 1)))));
    out.push(move(t0 + p1, t2, hs(s1, 0), hs(s2, 2), 0.3));
    out.push(seg(t2, Math.max(t2 + 2, t0 + avail), (t) => hs(s2, 2 * (1 - ramp(t, t2, t2 + 2)))));
    return out;
  };

  // Стопка у учителя: левая рука держит её у места работы, правая берёт
  // верхнюю карточку, кладёт в ячейку и прижимает полоски.
  const stackT = P.stackToTeacher;
  const stackOrder = fixList.filter(([id]) => !mainFix.has(id)).map(([id]) => id);
  const stagingFor = (owner: string): Pose => {
    const c = cellView(owner);
    const d = viewToDesk(c);
    const v = Math.max(26, d.y - 165);
    const u = d.y - 165 < 26 ? d.x - 150 : d.x - 40;
    return { p: V(clamp(u, 460, 1100), v), a: -4 };
  };
  const stackHeld = (t: number): string[] => stackOrder.filter((id) => {
    const at = P.fixTimes.get(id)!;
    return t < at - (lapseIds.has(id) ? 0 : pickLead(id)) && P.cardState(id, t).where !== "poster";
  });
  // за сколько кадров до закрепления карточку берут из стопки
  const pickLead = (id: string) => {
    const k = stackOrder.indexOf(id);
    const at = P.fixTimes.get(id)!;
    const prevAt = k > 0 ? P.fixTimes.get(stackOrder[k - 1])! : stackT.take;
    const prevBusy = k > 0 && !lapseIds.has(stackOrder[k - 1]) ? Math.min(FIX, Math.max(8, Math.floor((at - prevAt) * 0.55))) : 6;
    return clamp(at - prevAt - prevBusy, 6, 16);
  };

  // ---------- учитель: правая рука ----------
  const teacherR: Seg[] = [];
  const teacherL: Seg[] = [];
  teacherR.push(...rollTeacher("R"));
  teacherL.push(...rollTeacher("L"));
  teacherR.push(teacherDeal);
  // сцена 2: яблоко Юсуфа (со стола) и дерево Амира (из рук), Земля Билала — левой рукой
  {
    const pY = putTime("yusuf");
    const pA = putTime("amir");
    const pB = putTime("bilal");
    teacherR.push(seg(lay.yusuf.take, pY, carryCard("yusuf", lay.yusuf.take, pY, spotPose("yusuf"), cellPose("yusuf", pY), GRIP.right), 15));
    teacherR.push(seg(lay.amir.take, pA, carryCard("amir", lay.amir.take, pA, handA2, cellPose("amir", pA), GRIP.right), 10, 18));
    teacherL.push(seg(lay.bilal.take, pB, carryCard("bilal", lay.bilal.take, pB, handB2, cellPose("bilal", pB), GRIP.right), 16, 18));
  }
  // заголовок: берёт маркер, левая рука снимает колпачок, пишет, закрывает, кладёт
  {
    const writeEnd = W.end;
    const recapT = writeEnd + 14;
    const layT = P.markerDown;
    teacherR.push(seg(tGrab - 1, tGrab, still(markerPinch), 18));
    teacherR.push(move(tGrab, W.cap - 2, markerPinch, uncapAt, 1));
    teacherR.push(seg(W.cap - 2, W.cap + 8, still(uncapAt)));
    teacherR.push(move(W.cap + 8, W.start, { ...uncapAt, item: { kind: "marker", cap: "off", grab: MK_GRAB } }, writeHS(W.start), 0.8));
    teacherR.push(seg(W.start, writeEnd, (t) => writeHS(t)));
    teacherR.push(move(writeEnd, recapT - 2, writeHS(writeEnd), recapAt, 0.6));
    teacherR.push(seg(recapT - 2, recapT + 6, (t) => ({ ...recapAt, item: { kind: "marker", cap: t >= recapT + 4 ? "on" : "off", grab: MK_GRAB } })));
    teacherR.push({ ...move(recapT + 6, layT, { ...recapAt, item: { kind: "marker", cap: "on", grab: MK_GRAB } }, markerPinch, 0.8), exit: 18 });
    // левая рука: колпачок
    const capHS = (pose: Pose, lift: number): HS => ({ tip: pose.p, angle: pose.a - 70, shape: "pinch", lift, item: { kind: "cap", pose }, z: 2.5 });
    teacherL.push({ ...seg(W.cap - 2, W.cap + 8, (t) => capHS(capPoseOn(uncapAt, 36 * easeInOut(ramp(t, W.cap, W.cap + 8))), 26), 14, 18), carryOut: true });
    teacherL.push({ ...seg(recapT - 2, recapT + 4, (t) => capHS(capPoseOn(recapAt, 36 * (1 - easeInOut(ramp(t, recapT - 2, recapT + 4)))), 24), 14, 16), carryIn: true });
  }
  // текстовые карточки
  for (const [which, ev] of [["one", P.textOneEv], ["two", P.textTwoEv]] as const) {
    const s = textSeg(which, ev);
    teacherR.push(...s.R);
    teacherL.push(...s.L);
  }
  // сцена 7: Земля из рук Билала, закрепление, стопка
  const eh = P.earthHand;
  const earthCell = cellPose("bilal", eh.take - 1);
  const earthHand: Pose = { p: add(earthCell.p, { x: 64, y: 24 }), a: -6 };
  {
    teacherR.push(seg(eh.give, eh.put, carryCard("bilal", eh.give, eh.put, earthHand, cellPose("bilal", eh.put), GRIP.right, 8), 12));
    // четыре карточки, уже лежащие на листе
    const mains = fixList.filter(([id]) => mainFix.has(id));
    mains.forEach(([id, a], i) => {
      const next = mains[i + 1]?.[1] ?? a + FIX + 6;
      const end = Math.min(a + FIX, next - 3);
      teacherR.push(...pressSegs(id, a, end));
    });
  }
  // Стопку от Амира принимает левая рука и держит у места работы. Поза
  // стопки — одна непрерывная функция времени: правая рука берёт верхнюю
  // карточку там, где стопка сейчас.
  {
    const offerPose: Pose = { p: V(800, 120), a: -3 };
    const work = stackOrder.filter((id) => !lapseIds.has(id));
    const legs: { from: number; to: number; A: Pose; B: Pose }[] = [];
    let prevPose = offerPose;
    let prevT = stackT.take;
    for (const id of work) {
      const at = P.fixTimes.get(id)!;
      const pick = at - pickLead(id);
      // если времени мало, стопка сдвигается не дальше ≈ 18 мм за кадр
      const to = Math.max(prevT + 1, pick - 1);
      const want = stagingFor(id);
      const d = sub(want.p, prevPose.p);
      const k = Math.min(1, ((to - prevT) * 18) / Math.max(1, len(d)));
      const target: Pose = { p: add(prevPose.p, mul(d, k)), a: want.a };
      legs.push({ from: prevT, to, A: prevPose, B: target });
      prevPose = target;
      prevT = at;
    }
    const stackPose = (t: number): Pose => {
      let pose = offerPose;
      for (const l of legs) {
        if (t < l.from) break;
        pose = lerpPose(l.A, l.B, smoothstep(ramp(t, l.from, l.to)));
      }
      return pose;
    };
    const lastId = work[work.length - 1];
    const lastPick = lastId ? P.fixTimes.get(lastId)! - pickLead(lastId) : stackT.take + 1;
    teacherL.push(
      seg(stackT.take, lastPick, (t) => {
        const pose = stackPose(t);
        const ids = stackHeld(t);
        return { ...gripHS(pose, GRIP.stackL, ids.length ? { kind: "stack", ids, pose } : null, 12, "hold"), z: 2.5 };
      }, 14, 18),
    );
    // правая рука: каждая карточка из стопки — в свою ячейку, затем полоски
    work.forEach((id, k) => {
      const at = P.fixTimes.get(id)!;
      const pick = at - pickLead(id);
      const src = stackPose(pick);
      const dst: Pose = { p: cellView(id), a: 0 };
      const carry = carryCard(id, pick, at, src, dst, GRIP.right, 10);
      teacherR.push(seg(pick, at, carry, 10));
      const nextId = work[k + 1];
      const nextPick = nextId ? P.fixTimes.get(nextId)! - pickLead(nextId) : at + FIX + 20;
      const end = Math.min(at + FIX + 4, nextPick - 5);
      teacherR.push(...pressSegs(id, at, Math.max(at + 10, end), carry(at)));
    });
  }

  // ---------- Юсуф ----------
  const yusufR: Seg[] = [...pencilScene1("yusuf")];
  // сцена 4: ладонь на закрытой папке (ниже надписи «Наши вопросы»)
  {
    const ft = P.folderTouch;
    const touch: HS = { tip: V(1256, 66), angle: 30, shape: "flat", lift: 0, z: 1 };
    yusufR.push(seg(ft.touch, ft.off, (t) => ({ ...touch, lift: 4 * (1 - ramp(t, ft.touch, ft.touch + 6)) + 4 * ramp(t, ft.off - 5, ft.off) }), ft.touch - ft.reach, ft.back - ft.off));
  }
  // сцена 7: синий карандаш для лодочки — нижняя линия корпуса, передаёт Амиру
  const bpn = P.boatPencil;
  const treeCard = (t: number): Pose => ({ p: cellView("amir"), a: P.cardState("amir", t).rot });
  const boatTipFn = (t: number) => boatTip(P.boatProgress(t));
  const capTipFn = (t: number) => captionTip(P.captionProgress(t));
  // Передача карандаша: Юсуф держит его щепотью у тупого конца, Амир
  // берёт щепотью ближе к острию (карандаш лежит поперёк, остриём к Амиру).
  const HAND_Y_GRAB = 124;
  const HAND_A_GRAB = 30;
  const handoffHS = (who: "yusuf" | "amir"): HS => {
    const tc = treeCard(bpn.handoff);
    const tip = add(tc.p, { x: -66, y: CARD_MM.h / 2 - 6 });
    const dir = 86;
    const grab = who === "yusuf" ? HAND_Y_GRAB : HAND_A_GRAB;
    return { tip: add(tip, mul(dirV(dir), grab)), angle: dir - PINCH_PEN.dir, shape: "pinch", lift: 14, item: pencilItem(BOAT_PENCIL, grab), z: who === "yusuf" ? 2 : 2.2 };
  };
  {
    const grab = trayGrab("boat");
    const trayTip = deskToView(trayPencilTip("boat"));
    const atTray: HS = { tip: add(trayTip, mul(dirV(90), grab)), angle: 90 - PINCH_PEN.dir, shape: "pinch", lift: 0, item: pencilItem(BOAT_PENCIL, grab), z: 2 };
    const card = treeCard(bpn.yStart);
    const item = pencilItem(BOAT_PENCIL, grab);
    const start: HS = { ...drawHS("yusuf", card, boatTipFn, item, bpn.yStart), lift: 5 };
    yusufR.push(seg(bpn.yGrab - 1, bpn.yGrab, still({ ...atTray, item: null }), Math.max(8, bpn.yGrab - bpn.yReach)));
    yusufR.push(move(bpn.yGrab, bpn.yStart - 3, atTray, start, 1));
    yusufR.push(seg(bpn.yStart - 3, bpn.yStart, still(start)));
    yusufR.push(seg(bpn.yStart, bpn.yEnd, (t) => drawHS("yusuf", treeCard(t), boatTipFn, item, t)));
    yusufR.push({ ...move(bpn.yEnd, bpn.handoff, drawHS("yusuf", treeCard(bpn.yEnd), boatTipFn, item, bpn.yEnd), handoffHS("yusuf"), 0.6), exit: 14 });
  }
  // сцена 7: правая ладонь на нижнем правом углу листа
  const pass = P.M("сборка: карточки передают");
  const gridDone = P.M("сетка готова");
  {
    const corner: HS = { tip: V(POSTER_ON_DESK.u0 + POSTER.w - 4, POSTER_ON_DESK.v0 + 16), angle: -42, shape: "flat", from: "relax", mix: 0.55, lift: 0, z: 0.5 };
    yusufR.push(seg(pass.from, gridDone.to, still(corner), 16, 18));
  }

  // ---------- Амир ----------
  const amirR: Seg[] = [];
  const amirL: Seg[] = [];
  amirR.push(kidTakeDeal("amir", midA, deal.amir.land, handA, GRIP.bottom));
  amirR.push(...pencilScene1("amir"));
  // сцена 2: протягивает карточку учителю
  amirR.push(seg(lay.amir.offer, lay.amir.take, carryCard("amir", lay.amir.offer, lay.amir.take, spotPose("amir"), handA2, GRIP.bottom, 12), 14, 16));
  // сцена 5: переносит лодочку за гребень паруса
  const boatHS = (t: number): HS => {
    const d = deskToView(boat.desk(t));
    return { tip: d, angle: -8, shape: "pinch", lift: 8 + boat.lift(t), item: { kind: "boat" }, z: 2 };
  };
  const ev = boat.events;
  amirR.push(seg(ev.amirTake5, ev.amirRelease5, boatHS, 16, 16));
  // реплика 28: показывает свободное место внизу карточки
  {
    const l28 = P.L(28);
    const from = l28.from + 18;
    const to = Math.max(l28.to + 8, P.M("свободное место на карточке").to - 6);
    const pt = (t: number): HS => {
      const tc = treeCard(t);
      const sway = Math.sin((t - from) / 9) * 3;
      return { tip: cardPt(tc, 150 + sway * 4, 176), angle: -14, shape: "point", lift: 12 + sway, z: 1 };
    };
    amirR.push(seg(from, to, pt, 12, 14));
  }
  // сцена 6: лодочка (вид сверху, упрощённо — подробно её показывает крупный
  // план лодочки): Юсуф берёт её за ближний борт и ставит обратно, потом
  // держит посередине; Амир показывает уголок, берёт его щепотью, возвращает
  // и прижимает сгиб от b к a.
  const boatTopPt = (t: number, l: Vec): Vec => add(deskToView(boat.desk(t)), mul(l, MM_PER_UNIT));
  {
    const mapShape = (x: string): DeskHandShape => (x === "hold" ? "flat" : (x as DeskHandShape));
    yusufR.push(seg(ev.take, ev.release, (t) => ({ tip: boatTopPt(t, { x: -46, y: 22 }), angle: -20, shape: "pinch", lift: 3 + boat.lift(t), item: { kind: "boat" }, z: 1.5 }), 16, 16));
    yusufR.push(seg(ev.holdSettled, ev.yusufRelax, () => ({ tip: boatTopPt(ev.holdSettled, { x: 34, y: 14 }), angle: -24, shape: "hold", lift: 2, z: 1.5 }), Math.max(12, ev.holdSettled - ev.holdStart), 16));
    const pointAt: Vec = { x: TOP_GEOM.cornerClosed.x - 4, y: TOP_GEOM.cornerClosed.y + 20 };
    amirR.push(
      seg(ev.point, ev.letGo + 6, (t) => {
        const h = boat.hands(t).amir;
        const toPinch = smoothstep(ramp(t, ev.pinch - 10, ev.pinch));
        const onCrease = smoothstep(ramp(t, ev.pressFrom, ev.pressFrom + 6));
        const corner = topFlapPolygon(boat.open(t))[1];
        const crease = lerpV(TOP_GEOM.hingeB, TOP_GEOM.hingeA, boat.pressed(t));
        const lp = lerpV(lerpV(pointAt, corner, toPinch), crease, onCrease);
        const shape = h ? mapShape(h.shape) : "relax";
        const from = h ? mapShape(h.from) : "relax";
        return { tip: boatTopPt(t, lp), angle: 22, shape, from, mix: h ? h.mix : 1, lift: h ? 10 * (1 - h.contact) : 10, z: 2 };
      }, 14, 16),
    );
  }
  // сцена 7: принимает карандаш, дорисовывает лодочку, пишет подпись, кладёт карандаш
  {
    const item = pencilItem(BOAT_PENCIL, HAND_A_GRAB);
    const pinchAtHandoff = handoffHS("amir");
    const startBoat: HS = { ...drawHS("amir", treeCard(bpn.aStart), boatTipFn, item, bpn.aStart), lift: 5 };
    const capStartHS: HS = { ...drawHS("amir", treeCard(bpn.capStart), capTipFn, item, bpn.capStart, -20), lift: 5 };
    const bGrab = trayGrab("boat");
    const layHS: HS = { tip: add(deskToView(trayPencilTip("boat")), mul(dirV(90), bGrab)), angle: 90 - PINCH_PEN.dir, shape: "pinch", lift: 0, item: pencilItem(BOAT_PENCIL, bGrab), z: 1 };
    amirR.push(seg(bpn.handoff, bpn.handoff, still(pinchAtHandoff), 12));
    amirR.push(move(bpn.handoff, bpn.aStart, pinchAtHandoff, startBoat, 0.6));
    amirR.push(seg(bpn.aStart, bpn.aEnd, (t) => drawHS("amir", treeCard(t), boatTipFn, item, t)));
    amirR.push(move(bpn.aEnd, bpn.capStart, drawHS("amir", treeCard(bpn.aEnd), boatTipFn, item, bpn.aEnd), capStartHS, 0.6));
    amirR.push(seg(bpn.capStart, bpn.capEnd, (t) => drawHS("amir", treeCard(t), capTipFn, item, t, -20)));
    amirR.push({ ...move(bpn.capEnd, backAt.boat, drawHS("amir", treeCard(bpn.capEnd), capTipFn, item, bpn.capEnd, -20), layHS, 0.8), exit: 16 });
  }
  // сцена 7: лодочку — на свободную часть стола
  amirR.push({ ...seg(ev.amirTake7, ev.amirRelease7, boatHS, 14, 14), fixed: true });
  // сцена 7: стопку — учителю
  {
    const offerPose: Pose = { p: V(800, 120), a: -3 };
    const startPose: Pose = { p: V(700, 40), a: -10 };
    amirR.push({
      ...seg(stackT.offer, stackT.take, (t) => {
        const pose = lerpPose(startPose, offerPose, easeInOut(ramp(t, stackT.offer, stackT.take)));
        return { ...gripHS(pose, GRIP.bottom, { kind: "stack", ids: stackHeld(t), pose }, 12, "hold"), z: 2 };
      }, 14, 16),
      carryIn: true,
    });
  }
  // сцена 7: левая ладонь на нижнем левом углу листа
  // левая ладонь Амира ложится на угол, когда рука Билала с Землёй уже ушла
  amirL.push(seg(Math.max(pass.from, P.earthHand.give + 42), gridDone.to, still({ tip: V(POSTER_ON_DESK.u0 + 26, POSTER_ON_DESK.v0 + 30), angle: 30, shape: "flat", from: "relax", mix: 0.55, lift: 0, z: 0.5 }), 16, 18));

  // ---------- Билал ----------
  const bilalR: Seg[] = [];
  bilalR.push(kidTakeDeal("bilal", midB, deal.bilal.land, handB, GRIP.left));
  bilalR.push(...pencilScene1("bilal"));
  bilalR.push(seg(lay.bilal.offer, lay.bilal.take, carryCard("bilal", lay.bilal.offer, lay.bilal.take, spotPose("bilal"), handB2, GRIP.left, 12), 14, 16));
  // сцена 3: птица — из рук ученика в ячейку рядом с Землёй
  {
    const bp = P.birdPass;
    const put = putTime("pupil05");
    const dst = cellPose("pupil05", put);
    const enter = Math.max(bp.take + 2, put - 30);
    const src: Pose = { p: add(dst.p, { x: -170, y: 330 }), a: -24 };
    bilalR.push({ ...seg(enter, put, carryCard("pupil05", enter, put, src, dst, GRIP.left, 6, (x) => 1 - Math.pow(1 - clamp(x), 2.4)), 1, Math.max(10, bp.back - put)), carryIn: true });
  }
  // сцена 7: Земля — с листа учителю
  bilalR.push({ ...seg(eh.take, eh.give, carryCard("bilal", eh.take, eh.give, earthCell, earthHand, GRIP.left, 10), Math.max(14, Math.min(24, eh.take - ev.amirRelease7 - 14)), 22), fixed: true });

  const specs: { spec: Spec; segs: Seg[] }[] = [
    { spec: { key: "teacher-R", who: "teacher", side: "R", shoulder: shoulderOf("teacher", "R"), z: 3 }, segs: teacherR },
    { spec: { key: "teacher-L", who: "teacher", side: "L", shoulder: shoulderOf("teacher", "L"), z: 3 }, segs: teacherL },
    { spec: { key: "yusuf-R", who: "yusuf", side: "R", shoulder: shoulderOf("yusuf", "R"), z: 1 }, segs: yusufR },
    { spec: { key: "amir-R", who: "amir", side: "R", shoulder: shoulderOf("amir", "R"), z: 1.2 }, segs: amirR },
    { spec: { key: "amir-L", who: "amir", side: "L", shoulder: shoulderOf("amir", "L"), z: 0.5 }, segs: amirL },
    { spec: { key: "bilal-R", who: "bilal", side: "R", shoulder: shoulderOf("bilal", "R"), z: 2 }, segs: bilalR },
  ];
  const runs = specs.map(({ spec, segs }) => ({ spec, run: runner(spec, segs) }));

  // Кадры зрительских пауз: руки неподвижны (состояние — на начало паузы).
  const hold = (t: number) => {
    for (const p of P.pauses) if (t >= p.from && t < p.to) return p.from;
    return t;
  };

  const out = (spec: Spec, s: HS, t: number): DeskHand => {
    const shape = s.shape;
    const from = s.from ?? shape;
    const mix = s.mix ?? 1;
    const grab = s.item && (s.item.kind === "pencil" || s.item.kind === "marker") ? s.item.grab : 60;
    const g = handGeom(spec.who, shape, from, mix, grab);
    const side = spec.side;
    const sx = side === "R" ? 1 : -1;
    const wristV = sub(s.tip, rotV({ x: sx * g.contact.x, y: g.contact.y }, s.angle));
    let item: DeskItem | null = null;
    const it = s.item;
    if (it) {
      const D = (p: Vec) => viewToDesk(p);
      switch (it.kind) {
        case "card":
          item = { kind: "card", id: ownerOfCard(it.id), center: D(it.pose.p), rot: it.pose.a, lift: it.lift };
          break;
        case "cards":
          item = { kind: "cards", ids: it.ids.map(ownerOfCard), center: D(it.pose.p), rot: it.pose.a };
          break;
        case "textCard":
          item = { kind: "textCard", which: it.which, center: D(it.pose.p), rot: it.pose.a, flip: it.flip };
          break;
        case "stack":
          item = { kind: "stack", ids: it.ids, center: D(it.pose.p), rot: it.pose.a };
          break;
        case "cap":
          item = { kind: "cap", center: D(it.pose.p), rot: it.pose.a };
          break;
        case "tape":
          item = { kind: "tape", center: D(it.pose.p), rot: it.pose.a };
          break;
        case "pencil":
        case "marker": {
          const pen = g.pen;
          if (pen) {
            const tipV = handToView(wristV, s.angle, side, pen.tip);
            const angle = s.angle + sx * pen.dir;
            item =
              it.kind === "pencil"
                ? { kind: "pencil", color: it.color, tip: D(tipV), angle, elev: pen.elev, len: PENCIL_LEN }
                : { kind: "marker", tip: D(tipV), angle, elev: pen.elev, cap: it.cap, len: MARKER_LEN };
          }
          break;
        }
        default:
          item = null;
      }
    }
    const holding: DeskHolding = it ? (it.kind === "boat" ? "boat" : it.kind) : "none";
    return {
      key: spec.key,
      who: spec.who,
      side,
      wrist: viewToDesk(wristV),
      tip: viewToDesk(s.tip),
      shape,
      from,
      mix,
      angle: s.angle,
      holding,
      item,
      lift: s.lift,
      shoulder: viewToDesk(spec.shoulder(t)),
      visible: 1,
      z: spec.z + (s.z ?? 0) * 0.5 + s.lift * 0.002,
    };
  };

  return (f: number): DeskHand[] => {
    const t = hold(f);
    return runs.map(({ spec, run }) => out(spec, run(t), t)).sort((a, b) => a.z - b.z);
  };
};

export type DeskHands = ReturnType<typeof buildDeskHands>;
