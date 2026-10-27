// Семейная машина: нейтральный серый хэтчбек сбоку, без логотипов и
// номеров (color/shade — тот же кузов белым для финального экрана).
// Рисуется в двух слоях вокруг пассажиров:
//   CarCabin — тёмный салон (спинки, подголовники), под персонажами;
//   CarBody  — кузов с проёмами окон (стекло полупрозрачное поверх
//              пассажиров), задняя дверь (может быть приоткрыта), колёса.
// Локальные координаты: машина смотрит вправо, начало — на земле по центру,
// длина 860 единиц; dir = −1 разворачивает её влево.
import { C } from "../theme";
import { roughPath } from "../kit";
import type { Vec } from "../rig/motion";

export const CAR_LEN = 860;
const WHEEL_R = 64;
const WHEEL_X = 272;

type Pt = readonly [number, number];
// силуэт кузова (без колёсных арок — их перекрывают колёса)
const BODY: readonly Pt[] = [
  [432, -52],
  [438, -122],
  [420, -156],
  [330, -176],
  [226, -190],
  [108, -280],
  [-206, -288],
  [-376, -238],
  [-424, -200],
  [-432, -52],
  [-372, -40],
  [372, -40],
];
// окна: переднее (передняя дверь), заднее (задняя дверь), форточка багажника
const WIN_FRONT: readonly Pt[] = [
  [-6, -202],
  [204, -198],
  [104, -270],
  [-6, -274],
];
const WIN_REAR: readonly Pt[] = [
  [-222, -204],
  [-30, -204],
  [-30, -274],
  [-204, -278],
];
const WIN_QUARTER: readonly Pt[] = [
  [-246, -206],
  [-230, -272],
  [-352, -236],
  [-370, -206],
];
// задняя дверь: петли спереди (x = −16), свободный край сзади (x = −262)
const DOOR_HINGE = -16;
const DOOR_FREE = -262;
const DOOR_TOP = -284;
const DOOR_BOTTOM = -46;

const poly = (pts: readonly Pt[]) => `M ${pts.map((p) => `${p[0]} ${p[1]}`).join(" L ")} Z`;

export type CarPlace = { readonly x: number; readonly y: number; readonly len: number; readonly dir?: 1 | -1 };

// Точка локальных координат машины → мир.
export const carPt = (c: CarPlace, lx: number, ly: number): Vec => {
  const s = c.len / CAR_LEN;
  return { x: c.x + (c.dir ?? 1) * lx * s, y: c.y + ly * s };
};

const Frame: React.FC<CarPlace & { readonly children: React.ReactNode }> = ({ x, y, len, dir = 1, children }) => {
  const s = len / CAR_LEN;
  return <g transform={`translate(${x} ${y}) scale(${dir * s} ${s})`}>{children}</g>;
};

// Салон: видимая через стёкла тёмная часть, спинки сидений.
export const CarCabin: React.FC<CarPlace & { readonly ink: number }> = (p) => {
  const w = p.ink / (p.len / CAR_LEN);
  return (
    <Frame {...p}>
      <path d={poly([[214, -196], [104, -276], [-206, -284], [-372, -232], [-398, -60], [214, -60]])} fill="#59626E" />
      {/* потолок и стойки изнутри чуть светлее */}
      <path d={poly([[104, -276], [-206, -284], [-222, -268], [108, -262]])} fill="#6B7480" />
      {/* спинки: водитель и задний ряд */}
      <path d={roughPath([[60, -60], [74, -214], [30, -232], [10, -60]], 71, 1.2, true)} fill="#4A525D" stroke={C.ink} strokeWidth={w * 0.6} />
      <rect x={36} y={-262} width={44} height={34} rx={12} fill="#4A525D" stroke={C.ink} strokeWidth={w * 0.6} />
      <path d={roughPath([[-196, -60], [-182, -214], [-232, -230], [-252, -60]], 72, 1.2, true)} fill="#4A525D" stroke={C.ink} strokeWidth={w * 0.6} />
      <rect x={-232} y={-258} width={46} height={32} rx={12} fill="#4A525D" stroke={C.ink} strokeWidth={w * 0.6} />
      {/* руль (водитель — дальняя сторона) */}
      <ellipse cx={150} cy={-196} rx={12} ry={40} fill="none" stroke="#2F3540" strokeWidth={w * 2.4} transform="rotate(-24 150 -196)" />
    </Frame>
  );
};

// Кузов. door: 0 — задняя дверь закрыта, 1 — открыта (~70°). wheel — угол
// колёс (градусы), bob — лёгкое покачивание кузова на ходу (единицы).
export const CarBody: React.FC<CarPlace & { readonly ink: number; readonly door?: number; readonly wheel?: number; readonly bob?: number; readonly color?: string; readonly shade?: string }> = ({ door = 0, wheel = 0, bob = 0, color = C.carGrey, shade = C.carGreyShade, ...p }) => {
  const w = p.ink / (p.len / CAR_LEN);
  const st = { stroke: C.ink, strokeWidth: w, strokeLinejoin: "round" as const };
  const k = Math.cos(door * 1.22); // ширина полотна при открытии
  // кузов: силуэт минус окна; при открытой двери — минус её проём
  const holes = [WIN_FRONT, WIN_QUARTER, door > 0.02 ? ([[DOOR_HINGE, DOOR_BOTTOM + 6], [DOOR_HINGE, DOOR_TOP + 6], [DOOR_FREE, DOOR_TOP + 10], [DOOR_FREE, DOOR_BOTTOM + 6]] as const) : WIN_REAR];
  const bodyD = `${poly(BODY)} ${holes.map(poly).join(" ")}`;
  // открытая дверь повёрнута к зрителю: свободный край ближе к камере —
  // ниже и крупнее (лёгкий вид сверху), петли на месте
  const sa = Math.sin(door * 1.22);
  const dp = (lx: number, ly: number): Pt => {
    const u = (lx - DOOR_HINGE) / (DOOR_FREE - DOOR_HINGE);
    return [DOOR_HINGE + (lx - DOOR_HINGE) * k, ly * (1 + 0.16 * sa * u) + 46 * sa * u];
  };
  const doorPts: readonly Pt[] = [dp(DOOR_HINGE, DOOR_BOTTOM), dp(DOOR_HINGE, DOOR_TOP), dp(-206, DOOR_TOP - 2), dp(DOOR_FREE, -212), dp(DOOR_FREE, DOOR_BOTTOM)];
  const doorWin = WIN_REAR.map(([x, y]) => dp(x, y));
  const handle = [dp(-90, -178), dp(-50, -178)];
  const wheelG = (cx: number) => (
    <g key={cx} transform={`translate(${cx} ${-WHEEL_R})`}>
      <circle r={WHEEL_R} fill="#2E333C" {...st} />
      <circle r={WHEEL_R * 0.56} fill="#C9CED4" {...st} strokeWidth={w * 0.7} />
      <g transform={`rotate(${wheel})`}>
        {[0, 72, 144, 216, 288].map((a) => (
          <path key={a} d={`M 0 0 L ${WHEEL_R * 0.5} 0`} stroke="#8E959E" strokeWidth={w * 2.2} strokeLinecap="round" transform={`rotate(${a})`} />
        ))}
      </g>
      <circle r={WHEEL_R * 0.14} fill="#8E959E" {...st} strokeWidth={w * 0.6} />
    </g>
  );
  return (
    <Frame {...p}>
      {/* тень под машиной */}
      <ellipse cx={0} cy={-2} rx={440} ry={18} fill={C.shadow} />
      <g transform={`translate(0 ${bob})`}>
        {/* стёкла поверх салона */}
        {[WIN_FRONT, WIN_QUARTER, ...(door > 0.02 ? [] : [WIN_REAR])].map((pts, i) => (
          <g key={i}>
            <path d={poly(pts)} fill="rgba(206,226,238,0.34)" />
          </g>
        ))}
        <path d={bodyD} fill={color} fillRule="evenodd" {...st} />
        {/* нижняя тёмная полоса, порог, бамперы */}
        <path d={poly([[-432, -52], [432, -52], [430, -86], [-430, -86]])} fill={shade} opacity={0.55} />
        <path d={`M -430 -86 L 432 -86`} stroke={C.ink} strokeWidth={w * 0.5} opacity={0.6} />
        {/* линия плеча кузова */}
        <path d={`M -420 -196 L 214 -196 L 330 -180`} fill="none" stroke={C.ink} strokeWidth={w * 0.5} opacity={0.7} />
        {/* передняя дверь: шов и ручка */}
        <path d={`M 224 -190 L 224 -46 M -16 -296 L -16 -46`} stroke={C.ink} strokeWidth={w * 0.6} />
        <rect x={160} y={-178} width={40} height={10} rx={5} fill={shade} stroke={C.ink} strokeWidth={w * 0.5} />
        {/* зеркало */}
        <path d={poly([[196, -206], [232, -230], [252, -214], [226, -196]])} fill={shade} {...st} strokeWidth={w * 0.8} />
        {/* фары */}
        <path d={poly([[384, -152], [432, -140], [430, -122], [392, -128]])} fill="#F7F1DC" {...st} strokeWidth={w * 0.7} />
        <path d={poly([[-430, -190], [-404, -196], [-404, -150], [-432, -150]])} fill="#D9776A" {...st} strokeWidth={w * 0.7} />
        {/* передняя стойка блика на стекле */}
        <path d={`M 120 -268 L 70 -214 M 150 -262 L 112 -222`} stroke="#FFFFFF" strokeWidth={w * 1.2} opacity={0.55} strokeLinecap="round" />
        {/* задняя дверь */}
        {door > 0.02 ? (
          <path d={`M ${DOOR_FREE} ${DOOR_BOTTOM + 6} L ${DOOR_FREE} -150 M ${DOOR_HINGE} ${DOOR_BOTTOM + 4} L ${DOOR_FREE} ${DOOR_BOTTOM + 4}`} stroke={C.ink} strokeWidth={w * 0.6} />
        ) : null}
        <g>
          <path d={`${poly(doorPts)} ${poly(doorWin)}`} fill={door > 0.02 ? shade : color} fillRule="evenodd" {...st} />
          <path d={poly(doorWin)} fill="rgba(206,226,238,0.34)" />
          <path d={`M ${dp(-84, -262).join(" ")} L ${dp(-128, -216).join(" ")}`} stroke="#FFFFFF" strokeWidth={w * 1.2} opacity={0.5} strokeLinecap="round" />
          <path d={`M ${handle[0].join(" ")} L ${handle[1].join(" ")}`} stroke={C.ink} strokeWidth={w * 0.5 + 10} strokeLinecap="round" />
          <path d={`M ${handle[0].join(" ")} L ${handle[1].join(" ")}`} stroke={shade} strokeWidth={10 - w * 0.5} strokeLinecap="round" />
          <path d={`M ${dp(DOOR_HINGE, -86).join(" ")} L ${dp(DOOR_FREE, -86).join(" ")}`} stroke={C.ink} strokeWidth={w * 0.5} opacity={0.6} />
        </g>
      </g>
      {/* колёсные арки */}
      {[-WHEEL_X, WHEEL_X].map((cx) => (
        <path key={cx} d={`M ${cx - WHEEL_R - 14} ${-46} A ${WHEEL_R + 14} ${WHEEL_R + 14} 0 0 1 ${cx + WHEEL_R + 14} ${-46} Z`} transform={`translate(0 ${-WHEEL_R + 46 + bob * 0.6})`} fill="#3A404A" stroke={C.ink} strokeWidth={w} strokeLinejoin="round" />
      ))}
      {[-WHEEL_X, WHEEL_X].map(wheelG)}
    </Frame>
  );
};

// Свободный край задней двери на высоте ручки (мир) — туда кладёт ладонь папа.
export const carDoorEdge = (c: CarPlace, door: number): Vec => {
  const k = Math.cos(door * 1.22);
  const sa = Math.sin(door * 1.22);
  return carPt(c, DOOR_HINGE + (DOOR_FREE - DOOR_HINGE) * k, -170 * (1 + 0.16 * sa) + 46 * sa);
};

// Пол салона (локальная y) и места посадки по x: заднее (ближе к багажнику)
// и водительское (дальняя сторона, перед ним — руль).
export const CAR_FLOOR = -64;
export const CAR_SEAT_X = { rear: -206, front: 54 } as const;
