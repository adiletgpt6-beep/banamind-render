// Общее для домашних сцен 2, 3, 5, 6: места семьи за столом, руки на
// столешнице, анкета на столе в перспективе, точный расчёт кисти (палец
// или хват ровно в нужной точке мира), тёплое свечение за предметом.
import { Actor, type Place, type WorldArm } from "../rig/Actor";
import { twoBone } from "../rig/Figure";
import { LOOKS, type LookId } from "../rig/looks";
import { amountAt, dirAt } from "../rig/gait";
import { clamp, lerp, smoothstep, soften, type Vec } from "../rig/motion";
import { Form, FORM, type FormState } from "../props/Form";
import { HOME } from "../sets/Home";
import { H, seated, seatOf } from "./common";

// ---------- Семья за столом ----------
// Высота сидений — общая для всех домашних сцен (seatH в sets/Home.tsx:
// взрослым стул, сыну — подушка), чтобы семья сидела одинаково во всех
// планах. Ступни остаются на полу, рост не меняется.
export const FAM = {
  mom: seated("mom", HOME.seat.mom),
  son: seated("son", HOME.seat.son),
  dad: seated("dad", HOME.seat.dad),
} as const;
export const SEAT = { mom: seatOf(FAM.mom), son: seatOf(FAM.son), dad: seatOf(FAM.dad) } as const;

// Дальний край столешницы (за ним сидят) и середина её полосы.
export const TABLE_Y = 1196;

// Предплечья лежат на столе, кисти — ближе к середине (локти наружу).
export const tableArm = (p: Place, side: -1 | 1, dx = 0.065, dy = 0, shape: WorldArm["shape"] = "relax"): WorldArm => ({
  target: { x: p.x + side * dx * p.h, y: TABLE_Y + dy },
  shape,
  elbow: "out",
});

// ---------- Анкета на столе (в перспективе) ----------
// Лист лежит на столе перед сыном: CSS rotateX + perspective от нижнего
// края. formPt переводит точку листа (единицы FORM) в мир — для пальца
// мамы и взгляда.
export type FormPlace = { readonly x: number; readonly y: number; readonly w: number; readonly tilt: number; readonly persp: number; readonly rot: number };
export const TFORM: FormPlace = { x: 712, y: 1250, w: 150, tilt: 60, persp: 700, rot: -3 };

export const formPt = (u: number, v: number, f: FormPlace = TFORM): Vec => {
  const k = f.w / FORM.w;
  const x = (u - FORM.w / 2) * k;
  const y = (v - FORM.h) * k;
  const a = (f.tilt * Math.PI) / 180;
  const y1 = y * Math.cos(a);
  const z1 = y * Math.sin(a);
  const w = 1 - z1 / f.persp;
  const px = x / w;
  const py = y1 / w;
  const r = (f.rot * Math.PI) / 180;
  return { x: f.x + px * Math.cos(r) - py * Math.sin(r), y: f.y + px * Math.sin(r) + py * Math.cos(r) };
};

export const TableForm: React.FC<{ readonly s?: FormState; readonly f?: FormPlace; readonly lift?: number }> = ({ s = {}, f = TFORM, lift = 0 }) => {
  const k = f.w / FORM.w;
  const h = FORM.h * k;
  return (
    <div
      style={{
        position: "absolute",
        left: f.x - f.w / 2,
        top: f.y - h - lift,
        width: f.w,
        height: h,
        transformOrigin: "50% 100%",
        transform: `rotate(${f.rot}deg) perspective(${f.persp}px) rotateX(${f.tilt}deg)`,
      }}
    >
      <Form s={s} width={f.w} shadow />
    </div>
  );
};

// ---------- Кисть точно в точке ----------
type BodyIn = { readonly sit?: number; readonly seat?: number; readonly lean?: number; readonly bodyTurn?: number; readonly crouch?: number };

// Плечевой сустав в мире (как его ставит Figure, без дыхания).
export const shoulderW = (lookId: LookId, P: Place, side: -1 | 1, o: BodyIn): Vec => {
  const b = LOOKS[lookId].build;
  const k = P.h / 1000;
  const sitE = smoothstep(o.sit ?? 0);
  const seatU = (o.seat ?? 0) / k;
  const drop = (-seatU + 6 - b.hipJointY) * sitE + (14 + (o.crouch ?? 0) * b.thigh * 1.05) * (1 - sitE);
  const bt = o.bodyTurn ?? 0;
  const at = Math.abs(bt);
  const ws = 1 - 0.36 * at;
  const leanY = (1 - at) * (o.lean ?? 0) * 1.6;
  const sy = b.shoulderY + drop + leanY;
  return { x: P.x + (side * (b.shoulderHalf - b.limb * 0.45) * ws + bt * 6) * k, y: P.y + (sy + b.limb * 0.45) * k };
};

const PREF = { down: (s: number) => ({ x: s * 0.5, y: 1 }), in: (s: number) => ({ x: -s, y: 0.4 }), out: (s: number) => ({ x: s, y: 0.35 }) };

// Цель запястья, при которой точка кисти (along — доля длины кисти вдоль
// неё, across — поперёк, к большому пальцу) попадает в tip. Для "point"
// кончик указательного: along 1.12, across 0.124; для хвата "fist" —
// середина кулака: along 0.5.
export const wristFor = (
  lookId: LookId,
  P: Place,
  side: -1 | 1,
  tip: Vec,
  o: BodyIn,
  elbow: "down" | "in" | "out" = "down",
  along = 1.12,
  across = 0.124,
): Vec => {
  const b = LOOKS[lookId].build;
  const k = P.h / 1000;
  const S = shoulderW(lookId, P, side, o);
  const L = b.hand;
  let W = tip;
  for (let i = 0; i < 5; i++) {
    const r = twoBone({ x: 0, y: 0 }, { x: (W.x - S.x) / k, y: (W.y - S.y) / k }, b.upperArm, b.forearm, PREF[elbow](side));
    const ang = Math.atan2(r.end.y - r.mid.y, r.end.x - r.mid.x);
    const lx = side * across * L;
    const ly = along * L;
    const dx = lx * Math.sin(ang) + ly * Math.cos(ang);
    const dy = -lx * Math.cos(ang) + ly * Math.sin(ang);
    W = { x: tip.x - dx * k, y: tip.y - dy * k };
  }
  return W;
};

// Поворот корпуса так же, как его считает Actor (по желаемому взгляду и
// направлению шага, с запаздыванием) — чтобы плечо было там же, где у
// нарисованной фигуры.
export const bodyTurnAt = (place: (t: number) => Place, face: (t: number) => number, t: number, turnBody = 0.8) => {
  const faceEff = (u: number) => lerp(face(u), dirAt(place, u) * 0.85, amountAt(place, u));
  return clamp(soften(faceEff, t - 6, 4) * turnBody, -0.85, 0.85);
};

// Точка кисти свободно опущенной руки стоящего/сидящего (как у Figure при
// target = null, без раскачивания шага).
export const hangW = (lookId: LookId, P: Place, side: -1 | 1, o: BodyIn): Vec => {
  const b = LOOKS[lookId].build;
  const k = P.h / 1000;
  const S = shoulderW(lookId, P, side, o);
  const at = Math.abs(o.bodyTurn ?? 0);
  return { x: S.x + side * 16 * (1 - at) * k, y: S.y + (b.upperArm + b.forearm - 16) * k };
};

// ---------- Слои персонажа за столом ----------
// Тело — до столешницы, передние руки — после (кисти лежат НА столе).
export type ActorSpec = Omit<React.ComponentProps<typeof Actor>, "layer" | "uid"> & { readonly id: string };
export const Bodies: React.FC<{ readonly cast: readonly ActorSpec[]; readonly layer: "body" | "arms" | "all" }> = ({ cast, layer }) => (
  <>
    {cast.map(({ id, ...a }) => (
      <Actor key={`${id}-${layer}`} uid={`${id}-${layer}`} layer={layer} {...a} />
    ))}
  </>
);

// Мягкое тёплое свечение (локальный свет) — радиальный градиент.
export const WarmGlow: React.FC<{ readonly x: number; readonly y: number; readonly r: number; readonly o: number }> = ({ x, y, r, o }) =>
  o > 0.001 ? (
    <div
      style={{
        position: "absolute",
        left: x - r,
        top: y - r * 0.7,
        width: r * 2,
        height: r * 1.4,
        borderRadius: "50%",
        background: "radial-gradient(ellipse at 50% 55%, rgba(255,214,140,0.55), rgba(255,206,120,0.18) 45%, rgba(255,200,120,0) 70%)",
        opacity: clamp(o),
        pointerEvents: "none",
      }}
    />
  ) : null;

export { H };
