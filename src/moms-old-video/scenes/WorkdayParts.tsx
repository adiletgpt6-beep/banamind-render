// Помощники сцены «2. Рабочий день мамы»:
//   • точка хвата кисти — тот же расчёт плеча и руки, что в Figure, чтобы
//     предмет (сумка, ключи, ремень) был ровно в кулаке;
//   • сын в салоне без рюкзака (рюкзак лежит рядом на сиденье);
//   • сумка и ключи в руке с качанием, ключи на столе;
//   • открытая задняя дверь машины (петли у передней кромки), салон в
//     проёме, ближний тротуар; ремень безопасности и замок.
import { CLOSED } from "../context";
import type { Place, PoseIn, WorldArm } from "../rig/Actor";
import { Figure, twoBone, type FigureLayer } from "../rig/Figure";
import { LOOKS, type Build, type Look } from "../rig/looks";
import { blinkAt, clamp, soften, type Vec } from "../rig/motion";
import { EXPR, REST, type ArmState, type Expression, type FootLocal, type Pose } from "../rig/pose";
import { WorkBagHanging } from "../sets/Places";
import { box } from "../shots";

// ---------- кисть: запястье, направление, точка хвата ----------
export type GripIn = {
  readonly p: Place;
  readonly build: Build;
  readonly side: -1 | 1;
  readonly target: Vec;
  readonly elbow?: "out" | "down" | "in";
  readonly bt: number; // поворот корпуса (как в Actor)
  readonly f: number;
  readonly seed: number;
  readonly seat?: number; // px от пола — сидит
  readonly lean?: number;
  readonly crouch?: number;
};

export const handGrip = (g: GripIn) => {
  const b = g.build;
  const k = g.p.h / 1000;
  const at = Math.abs(g.bt);
  const ws = 1 - 0.36 * at;
  const breath = Math.sin((g.f + g.seed * 17) / 26);
  const dy = g.seat !== undefined ? -g.seat / k + 6 - b.hipJointY : 6.5 + (g.crouch ?? 0) * b.thigh * 1.05;
  const leanY = (1 - at) * (g.lean ?? 0) * 1.6;
  const sy = b.shoulderY + dy + leanY - breath * 1.5;
  const S = { x: g.side * (b.shoulderHalf - b.limb * 0.45) * ws + g.bt * 6, y: sy + b.limb * 0.45 };
  const T = { x: (g.target.x - g.p.x) / k, y: (g.target.y - g.p.y) / k };
  const pref = g.elbow === "down" ? { x: g.side * 0.5, y: 1 } : g.elbow === "in" ? { x: -g.side, y: 0.4 } : { x: g.side, y: 0.35 };
  const r = twoBone(S, T, b.upperArm, b.forearm, pref);
  const a = Math.atan2(r.end.y - r.mid.y, r.end.x - r.mid.x) - Math.PI / 2;
  const toW = (v: Vec): Vec => ({ x: g.p.x + v.x * k, y: g.p.y + v.y * k });
  const grip = { x: r.end.x - Math.sin(a) * 0.5 * b.hand, y: r.end.y + Math.cos(a) * 0.5 * b.hand };
  return { wrist: toW(r.end), elbow: toW(r.mid), grip: toW(grip), angle: (a * 180) / Math.PI, hand: b.hand * k };
};

// Цель запястья, при которой точка хвата приходится в want (несколько
// уточнений: направление кисти зависит от положения локтя).
export const gripTo = (want: Vec, g: Omit<GripIn, "target">) => {
  const k = g.p.h / 1000;
  let target: Vec = { x: want.x, y: want.y + 0.5 * g.build.hand * k };
  for (let i = 0; i < 5; i++) {
    const r = handGrip({ ...g, target });
    target = { x: target.x + want.x - r.grip.x, y: target.y + want.y - r.grip.y };
  }
  return { ...handGrip({ ...g, target }), target };
};

// Поворот корпуса, который посчитает Actor для неподвижного персонажа.
export const bodyTurnOf = (face: (t: number) => number, f: number, turnBody = 0.8) => clamp(soften(face, f - 6, 4) * turnBody, -0.85, 0.85);

// Качание подвешенного предмета: отклонение против скорости точки хвата.
export const swingOf = (gripAt: (t: number) => Vec, f: number, gain = 0.9, max = 24) => {
  let acc = 0;
  // затухающая память о скорости — предмет догоняет руку и чуть качается
  for (let i = 1; i <= 14; i++) {
    const v = gripAt(f - i + 1).x - gripAt(f - i).x;
    acc += v * Math.exp(-i / 5) * Math.cos((i - 1) * 0.55);
  }
  return clamp(-acc * gain, -max, max);
};

// ---------- сумка в руке (тот же рисунок, что на крючке) ----------
// У WorkBagHanging верх ручки — в (x, y + 39·s).
export const BAG_TOP = 39;
export const BagInHand: React.FC<{ readonly grip: Vec; readonly s: number; readonly swing: number }> = ({ grip, s, swing }) => (
  <div style={box({ left: grip.x, top: grip.y, width: 1, height: 1, transform: `rotate(${swing}deg)`, transformOrigin: "0 0" })}>
    <WorkBagHanging x={0} y={-BAG_TOP * s} s={s} />
  </div>
);

// ---------- ключи: кольцо и два ключа (как предмет "keys" у кисти) ----------
// (0, 0) — точка хвата; rot — наклон связки (0 — висит, −90 — лежит).
export const KeyRing: React.FC<{ readonly at: Vec; readonly L: number; readonly rot: number }> = ({ at, L, rot }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
    <g transform={`translate(${at.x} ${at.y}) rotate(${rot})`}>
      <circle cx={0} cy={L * 0.12} r={L * 0.16} fill="none" stroke="#B9BEC8" strokeWidth={L * 0.07} />
      <g transform={`rotate(8 0 ${L * 0.2})`}>
        <rect x={-L * 0.07} y={L * 0.22} width={L * 0.16} height={L * 0.5} rx={L * 0.07} fill="#C9A646" />
        <rect x={-L * 0.2} y={L * 0.22} width={L * 0.22} height={L * 0.22} rx={L * 0.07} fill="#C9A646" />
      </g>
      <g transform={`rotate(-14 0 ${L * 0.2})`}>
        <rect x={-L * 0.07} y={L * 0.24} width={L * 0.13} height={L * 0.44} rx={L * 0.06} fill="#AFB5BF" />
        <rect x={-L * 0.22} y={L * 0.6} width={L * 0.3} height={L * 0.2} rx={L * 0.08} fill="#3A4A7A" />
      </g>
    </g>
  </svg>
);

// ---------- сын в салоне без рюкзака ----------
const SON_NOPACK: Look = { ...LOOKS.sonSchool, backpack: undefined };

// Неподвижный сидящий персонаж: те же расчёты взгляда, моргания и дыхания,
// что у Actor (без шага и без губ — говорит диктор).
export const SeatedSon: React.FC<{
  readonly uid: string;
  readonly f: number;
  readonly place: Place;
  readonly face: (t: number) => number;
  readonly pose: (t: number) => PoseIn;
  readonly seed: number;
  readonly layer?: FigureLayer;
}> = ({ uid, f, place: P, face, pose: poseFn, seed, layer }) => {
  const look = SON_NOPACK;
  const b = look.build;
  const k = P.h / 1000;
  const pin = poseFn(f);
  const headAt = (t: number) => soften(face, t - 2, 2);
  const headTurn = clamp(headAt(f), -0.9, 0.9);
  const bodyTurn = bodyTurnOf(face, f, pin.turnBody ?? 0.8);
  const lookX = clamp((face(f) - headTurn) * 2.4 + (pin.lookX ?? 0), -1, 1);
  const extra: number[] = [];
  for (let t = f - 6; t <= f; t++) {
    const s0 = Math.abs(headAt(t - 1) - headAt(t - 5));
    const s1 = Math.abs(headAt(t) - headAt(t - 4));
    if (s1 > 0.3 && s0 <= 0.3) extra.push(t);
  }
  const at = Math.abs(bodyTurn);
  const feet = ([-1, 1] as const).map((side) => ({ x: side * (b.hipJointX + 8) * 0.85 * (1 - 0.5 * at), y: -14, roll: 0 })) as unknown as readonly [FootLocal, FootLocal];
  const toLocal = (arm?: WorldArm): ArmState => (arm ? { ...arm, target: arm.target ? { x: (arm.target.x - P.x) / k, y: (arm.target.y - P.y) / k } : null } : REST);
  const expr: Expression = typeof pin.expr === "string" ? EXPR[pin.expr] : pin.expr ?? EXPR.neutral;
  const turnLag = headAt(f - 2) - headAt(f - 6);
  const pose: Pose = {
    bodyTurn,
    headTurn,
    lookX,
    lookY: pin.lookY ?? 0,
    headTilt: pin.headTilt ?? 0,
    nod: pin.nod ?? 0,
    lean: pin.lean ?? 0,
    sit: pin.sit ?? 0,
    seat: (pin.seat ?? 0) / k,
    crouch: pin.crouch ?? 0,
    walkPhase: 0,
    walkAmt: 0,
    walkDir: 0,
    armL: toLocal(pin.armL),
    armR: toLocal(pin.armR),
    expr,
    mouth: CLOSED,
    blink: blinkAt(f, seed, extra),
    shoulders: pin.shoulders ?? 0,
    breath: Math.sin((f + seed * 17) / 26),
    hairSway: clamp(-turnLag * 24, -16, 16) + (pin.hairSway ?? 0),
    bagOnShoulder: 0,
    exhale: pin.exhale ?? 0,
    hipShift: 0,
    hipTilt: 0,
    torsoTilt: pin.torsoTilt ?? 0,
    hemSway: 0,
    feet,
    belt: pin.belt,
  };
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <g transform={`translate(${P.x} ${P.y}) scale(${k})`}>
        <Figure uid={uid} look={look} pose={pose} layer={layer} />
      </g>
    </svg>
  );
};

// Рюкзак сына, снятый и поставленный на сиденье (цвета как у Figure).
export const BackpackOnSeat: React.FC<{ readonly x: number; readonly y: number; readonly w: number }> = ({ x, y, w }) => (
  <div style={box({ left: x - w / 2, top: y - w * 1.15, width: w, height: w * 1.15 })}>
    <div style={box({ left: w * 0.3, top: -w * 0.1, width: w * 0.4, height: w * 0.16, borderRadius: w * 0.08, border: `${w * 0.05}px solid #14285A`, borderBottom: "none", boxSizing: "border-box" })} />
    <div style={box({ inset: 0, borderRadius: w * 0.26, backgroundColor: LOOKS.sonSchool.backpack })} />
    <div style={box({ left: w * 0.16, top: w * 0.58, width: w * 0.68, height: w * 0.42, borderRadius: w * 0.12, backgroundColor: "#35865C" })} />
    <div style={box({ left: w * 0.14, top: w * 0.08, width: w * 0.1, height: w * 0.9, borderRadius: w * 0.05, backgroundColor: "#14285A", opacity: 0.85 })} />
  </div>
);

// ---------- машина: открытая задняя дверь ----------
// Координаты FamilyCar (840 × 340, машина смотрит вправо). Задняя дверь
// с окном: от стойки до порога; петли — у передней (правой) кромки.
const DOOR = { x0: 250, x1: 446, top: 80, sill: 244, win: 146 } as const;
const doorPoly = `${DOOR.x0} ${DOOR.win}, 320 ${DOOR.top}, ${DOOR.x1} ${DOOR.top}, ${DOOR.x1} ${DOOR.sill}, ${DOOR.x0} ${DOOR.sill}`;
export const carToWorld = (car: { x: number; y: number; s: number }, cx: number, cy: number): Vec => ({ x: car.x - 420 * car.s + cx * car.s, y: car.y - 330 * car.s + cy * car.s });
// Проём двери в мировых px (для обрезки того, кто уже в салоне).
export const doorClip = (car: { x: number; y: number; s: number }) => {
  const pts = doorPoly.split(", ").map((pr) => {
    const [a, c] = pr.split(" ").map(Number);
    const w = carToWorld(car, a, c);
    return `${w.x}px ${w.y}px`;
  });
  return `polygon(${pts.join(", ")})`;
};

// Салон в проёме: тёмная обивка, спинка и подушка заднего сиденья, окно
// дальней двери (за ним — светлая улица).
export const DoorOpening: React.FC<{ readonly car: { x: number; y: number; s: number } }> = ({ car }) => {
  const s = car.s;
  const o = carToWorld(car, 0, 0);
  return (
    <div style={box({ left: o.x, top: o.y, width: 840 * s, height: 340 * s, clipPath: `polygon(${doorPoly.split(", ").map((pr) => pr.split(" ").map((v) => `${Number(v) * s}px`).join(" ")).join(", ")})` })}>
      <div style={box({ left: 0, top: 0, width: 840 * s, height: 340 * s, backgroundColor: "#3B414D" })} />
      {/* окно дальней двери */}
      <div style={box({ left: 300 * s, top: 92 * s, width: 140 * s, height: 46 * s, borderRadius: 8 * s, background: "linear-gradient(180deg, #DCE9F2, #EFE6D6)" })} />
      {/* спинка и подушка сиденья */}
      <div style={box({ left: 236 * s, top: 132 * s, width: 230 * s, height: 66 * s, borderRadius: 18 * s, backgroundColor: "#565E6C" })} />
      <div style={box({ left: 236 * s, top: 190 * s, width: 230 * s, height: 26 * s, borderRadius: 8 * s, backgroundColor: "#5F6776" })} />
      <div style={box({ left: 236 * s, top: 216 * s, width: 230 * s, height: 40 * s, backgroundColor: "#2F343E" })} />
      {/* тень от крыши */}
      <div style={box({ left: 0, top: 80 * s, width: 840 * s, height: 24 * s, background: "linear-gradient(180deg, rgba(0,0,0,0.25), transparent)" })} />
    </div>
  );
};

// Сама дверь, распахнутая к зрителю на петлях у передней кромки.
export const OpenRearDoor: React.FC<{ readonly car: { x: number; y: number; s: number }; readonly open: number }> = ({ car, open }) => {
  const s = car.s;
  const o = carToWorld(car, DOOR.x0, DOOR.top - 6);
  const w = (DOOR.x1 - DOOR.x0) * s;
  const h = (DOOR.sill - DOOR.top + 10) * s;
  return (
    <div style={box({ left: o.x, top: o.y, width: w, height: h, transformOrigin: "100% 50%", transform: `perspective(${1100 * s}px) rotateY(${72 * open}deg)` })}>
      <div style={box({ inset: 0, borderRadius: 12 * s, backgroundColor: "#8497B4", clipPath: `polygon(0 ${(DOOR.win - DOOR.top + 6) * s}px, ${(320 - DOOR.x0) * s}px 0, 100% 0, 100% 100%, 0 100%)` })} />
      <div style={box({ left: 10 * s, top: (DOOR.win - DOOR.top + 4) * s, width: w - 20 * s, height: 4 * s, backgroundColor: "#6F829F" })} />
      <div style={box({ left: (330 - DOOR.x0) * s, top: 12 * s, width: (DOOR.x1 - 342) * s, height: (DOOR.win - DOOR.top - 12) * s, borderRadius: 6 * s, backgroundColor: "#B9CEDF" })} />
      <div style={box({ left: w - 40 * s, top: 92 * s, width: 26 * s, height: 8 * s, borderRadius: 4 * s, backgroundColor: "#5D6E88" })} />
    </div>
  );
};

// Окно водителя (дальняя сторона салона): обрезка по стеклу передней двери.
export const frontWindowClip = (car: { x: number; y: number; s: number }) => {
  const pts: [number, number][] = [
    [456, 80],
    [590, 80],
    [612, 84],
    [625, 96],
    [690, 146],
    [456, 146],
  ];
  return `polygon(${pts.map(([a, c]) => {
    const w = carToWorld(car, a, c);
    return `${w.x}px ${w.y}px`;
  }).join(", ")})`;
};

// ---------- улица: ближний тротуар (камера стоит на нём) ----------
export const NearSidewalk: React.FC<{ readonly y: number }> = ({ y }) => (
  <>
    <div style={box({ left: -400, top: y, width: 3400, height: 26, backgroundColor: "#E9E4DB" })} />
    <div style={box({ left: -400, top: y + 26, width: 3400, height: 8, backgroundColor: "#BDB6AA" })} />
    <div style={box({ left: -400, top: y + 34, width: 3400, height: 1400, backgroundColor: "#D6CFC3" })} />
    <div style={box({ left: -400, top: y + 34, width: 3400, height: 1400, backgroundImage: "repeating-linear-gradient(90deg, rgba(80,70,60,0.08) 0 4px, transparent 4px 230px)" })} />
  </>
);

// ---------- ремень безопасности ----------
export const BeltStrap: React.FC<{ readonly from: Vec; readonly to: Vec; readonly w: number; readonly opacity?: number }> = ({ from, to, w, opacity = 1 }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
    <path d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`} stroke="#2B2F38" strokeWidth={w} strokeLinecap="round" opacity={opacity} />
    <path d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`} stroke="#FFFFFF" strokeWidth={w * 0.12} strokeLinecap="round" opacity={0.12 * opacity} transform={`translate(${-w * 0.2} 0)`} />
  </svg>
);
// Язычок ремня (в кулаке) и замок у бедра.
export const BeltTongue: React.FC<{ readonly at: Vec; readonly w: number; readonly angle: number }> = ({ at, w, angle }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
    <g transform={`translate(${at.x} ${at.y}) rotate(${angle})`}>
      <rect x={-w * 0.55} y={-w * 0.2} width={w * 1.1} height={w * 1.3} rx={w * 0.2} fill="#9AA1AD" />
      <rect x={-w * 0.25} y={w * 0.35} width={w * 0.5} height={w * 0.5} rx={w * 0.1} fill="#5E6573" />
    </g>
  </svg>
);
export const Buckle: React.FC<{ readonly at: Vec; readonly w: number; readonly click: number }> = ({ at, w, click }) => (
  <div style={box({ left: at.x - w / 2, top: at.y - w * 0.3, width: w, height: w * 1.5, borderRadius: w * 0.22, backgroundColor: "#22252C" })}>
    <div style={box({ left: w * 0.2, top: w * 0.18, width: w * 0.6, height: w * 0.32, borderRadius: w * 0.1, backgroundColor: click > 0 ? "#F0473C" : "#C9362D", boxShadow: click > 0 ? `0 0 ${w * 0.5 * click}px rgba(255,201,14,${0.8 * click})` : undefined })} />
  </div>
);
