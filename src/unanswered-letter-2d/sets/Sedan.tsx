// Белый седан мамы сбоку в реальном масштабе относительно людей: длина
// кузова 1000 единиц ≈ 4,6 м (при s = 2 — 2000 px мира, ребёнок ≈ 560 px).
// Локальные координаты: машина смотрит вправо, земля y = 0, x −500…500.
// Задняя пассажирская дверь (видимая сторона) открывается вокруг шарнира на
// её переднем крае: панель двери поворачивается к зрителю и в проекции
// сужается к шарниру, открывая проём с задним сиденьем; порог и стойки
// рисуются отдельным слоем (Sedan part="front"), чтобы ребёнок, садясь,
// оказывался внутри — за порогом и дверью. part="back" — салон за проёмом.
import { box } from "../shots";

export const SEDAN = {
  // задняя дверь (локально): от шарнира (x = 20) назад до x = −200
  door: { hinge: 20, rear: -200, top: -292, sill: -64, belt: -186 },
  rearSeat: { x: -95, y: -120 }, // точка сиденья (таз ребёнка) в проёме
  wheel: { r: 64, x: [-300, 300] },
  height: 312,
} as const;

type SedanProps = {
  readonly x: number; // центр машины (мир)
  readonly y: number; // земля под колёсами (мир)
  readonly s: number;
  readonly dir?: 1 | -1;
  readonly color?: string;
  readonly wheel?: number; // поворот колёс, градусы
  readonly door?: number; // 0…1 задняя дверь открыта
  readonly driver?: boolean; // мама за рулём (силуэт в окне)
  readonly kid?: boolean; // дочка на заднем сиденье (силуэт)
  readonly part?: "back" | "body" | "front";
  // салон рисуется отдельным слоем part="back" (за ним — пассажиры): тогда
  // кузов «пустой», а стёкла полупрозрачные — сидящего видно через окно
  readonly hollow?: boolean;
};

const BODY = "M -486 -64 Q -500 -128 -452 -150 L -322 -170 L -236 -184 Q -196 -282 -72 -300 L 118 -302 Q 206 -296 276 -196 L 408 -176 Q 492 -164 498 -104 L 494 -62 Q 494 -40 470 -40 L 382 -40 A 82 82 0 0 0 218 -40 L -218 -40 A 82 82 0 0 0 -382 -40 L -470 -40 Q -488 -40 -486 -64 Z";

// Салон за окнами (тёмный), общий для слоя back и обычного кузова.
const CABIN = "M -236 -186 Q -196 -282 -72 -300 L 118 -302 Q 206 -296 270 -186 Z";

export const Sedan: React.FC<SedanProps> = ({ x, y, s, dir = 1, color = "#F4F6F9", wheel = 0, door = 0, driver = false, kid = false, part = "body", hollow = false }) => {
  const D = SEDAN.door;
  const open = Math.max(0, Math.min(1, door));
  const W = D.hinge - D.rear; // 220
  // видимая ширина открытой панели (поворот к зрителю) и её «приближение»
  const panelW = W * (1 - 0.72 * Math.sin((open * Math.PI) / 2));
  const grow = 1 + 0.03 * Math.sin((open * Math.PI) / 2);
  const shade = "#D9DEE6";
  const glass = "#9FC1DD";
  const inner = (
    <g>
      {/* проём: салон, заднее сиденье, противоположная дверь */}
      <path d={`M ${D.rear} ${D.sill} L ${D.rear} ${D.belt} L ${D.rear + 86} ${D.top + 4} L ${D.hinge} ${D.top} L ${D.hinge} ${D.sill} Z`} fill="#3B414D" />
      <rect x={D.rear + 6} y={-196} width={W - 30} height={96} rx={18} fill="#5F6776" />
      <rect x={D.rear + 12} y={-150} width={W - 40} height={54} rx={14} fill="#6B7383" />
    </g>
  );
  if (part === "back") {
    return (
      <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
        <g transform={`translate(${x} ${y}) scale(${dir * s} ${s})`}>
          <path d={CABIN} fill="#3B414D" />
          {/* спинки сидений в окнах */}
          <rect x={-190} y={-232} width={170} height={60} rx={22} fill="#565E6C" />
          <rect x={40} y={-236} width={110} height={64} rx={22} fill="#565E6C" />
          {open > 0.02 ? inner : null}
        </g>
      </svg>
    );
  }
  if (part === "front") {
    // порог под проёмом, задняя стойка и открытая панель двери (ближе всего к зрителю)
    if (open <= 0.02) return null;
    return (
      <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
        <g transform={`translate(${x} ${y}) scale(${dir * s} ${s})`}>
          <path d={`M ${D.rear - 6} ${D.sill - 2} L ${D.hinge + 6} ${D.sill - 2} L ${D.hinge + 6} -40 L ${D.rear - 6} -40 Z`} fill={color} />
          <rect x={D.rear - 6} y={D.sill - 6} width={W + 12} height={8} rx={3} fill={shade} />
          {/* панель двери: от шарнира назад, сужается при открытии, чуть крупнее (ближе) */}
          <g transform={`translate(${D.hinge} 0) scale(1 ${grow})`}>
            <path d={`M 0 ${D.sill + 22} L ${-panelW} ${D.sill + 14} L ${-panelW} ${D.belt} L 0 ${D.belt - 4} Z`} fill={open > 0.4 ? "#E3E7ED" : color} stroke={shade} strokeWidth={3} />
            <path d={`M 0 ${D.belt - 4} L ${-panelW} ${D.belt} L ${-panelW * 0.6} ${D.top + 14} L 0 ${D.top + 10} Z`} fill={glass} opacity={0.7} stroke={color} strokeWidth={10} />
            {/* обивка с внутренней стороны и ручка */}
            {open > 0.4 ? <rect x={-panelW * 0.72} y={D.sill - 70} width={panelW * 0.5} height={14} rx={7} fill="#9AA3B2" /> : null}
          </g>
        </g>
      </svg>
    );
  }
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
      <g transform={`translate(${x} ${y}) scale(${dir * s} ${s})`}>
        <ellipse cx={0} cy={4} rx={470} ry={18} fill="rgba(20,25,40,0.22)" />
        {/* кузов с вырезом под проём задней двери, когда она открыта */}
        <defs>
          <mask id={`sedan-door-${Math.round(x)}-${Math.round(y)}`}>
            <rect x={-600} y={-400} width={1200} height={500} fill="white" />
            {open > 0.02 ? <path d={`M ${D.rear} ${D.sill} L ${D.rear} ${D.belt} L ${D.rear + 86} ${D.top + 4} L ${D.hinge} ${D.top} L ${D.hinge} ${D.sill} Z`} fill="black" /> : null}
          </mask>
        </defs>
        <g mask={`url(#sedan-door-${Math.round(x)}-${Math.round(y)})`}>
          <path d={BODY} fill={color} />
          {hollow ? null : <path d={CABIN} fill="#3B414D" />}
          <path d="M -486 -96 L 496 -96" stroke="rgba(0,0,0,0.08)" strokeWidth={6} />
          {/* окна: заднее, задней двери, передней двери */}
          {/* стёкла полупрозрачные: за ними салон и пассажиры */}
          <g opacity={0.5}>
              <path d={`M ${D.rear + 12} -186 L ${D.rear + 92} -282 L ${D.hinge - 8} -286 L ${D.hinge - 8} -186 Z`} fill={glass} />
            <path d={`M ${D.hinge + 10} -186 L ${D.hinge + 10} -294 L 112 -294 Q 196 -288 258 -196 Z`} fill={glass} />
          </g>
          {/* блик на стёклах */}
          <path d={`M ${D.rear + 60} -200 L ${D.rear + 120} -280 L ${D.rear + 140} -280 L ${D.rear + 80} -200 Z M ${D.hinge + 40} -200 L ${D.hinge + 100} -290 L ${D.hinge + 118} -290 L ${D.hinge + 58} -200 Z`} fill="rgba(255,255,255,0.28)" />
          {/* силуэты: мама за рулём (передняя дверь), дочка сзади */}
          {driver ? (
            <g>
              <circle cx={140} cy={-238} r={30} fill="#2A201D" />
              <path d="M 108 -186 Q 112 -214 140 -216 Q 168 -214 172 -186 Z" fill="#2F9C93" />
            </g>
          ) : null}
          {kid ? (
            <g opacity={0.85}>
              <circle cx={-96} cy={-236} r={26} fill="#2A1F1C" />
              <path d="M -126 -186 Q -122 -206 -96 -208 Q -70 -206 -66 -186 Z" fill="#26407A" />
            </g>
          ) : null}
          {/* стойки */}
          <rect x={D.hinge - 8} y={-298} width={18} height={112} fill={color} />
          <path d={`M ${D.rear + 2} ${D.belt} L ${D.rear + 86} ${D.top + 4}`} stroke={color} strokeWidth={14} />
          {/* швы дверей и ручки */}
          <path d={`M ${D.hinge} -186 L ${D.hinge} -62 M ${D.rear} -186 L ${D.rear} -66 M 262 -186 L 266 -66`} stroke={shade} strokeWidth={4} />
          <rect x={D.rear + 20} y={-162} width={46} height={12} rx={6} fill="#C3CAD4" />
          <rect x={D.hinge + 150} y={-162} width={46} height={12} rx={6} fill="#C3CAD4" />
          {/* фары */}
          <rect x={470} y={-150} width={24} height={26} rx={6} fill="#FFE7A8" />
          <rect x={-494} y={-150} width={16} height={26} rx={5} fill="#E25B4E" />
        </g>
        {/* колёса */}
        {SEDAN.wheel.x.map((wx) => (
          <g key={wx} transform={`translate(${wx} -${SEDAN.wheel.r}) rotate(${wheel})`}>
            <circle r={SEDAN.wheel.r} fill="#23262E" />
            <circle r={SEDAN.wheel.r * 0.55} fill="#B8BEC8" />
            <rect x={-4} y={-SEDAN.wheel.r * 0.55} width={8} height={SEDAN.wheel.r * 1.1} fill="#8C929C" />
            <rect x={-SEDAN.wheel.r * 0.55} y={-4} width={SEDAN.wheel.r * 1.1} height={8} fill="#8C929C" />
          </g>
        ))}
      </g>
    </svg>
  );
};

// Точка сиденья в проёме задней двери (мир).
export const sedanSeat = (x: number, y: number, s: number, dir: 1 | -1 = 1) => ({ x: x + dir * s * SEDAN.rearSeat.x, y: y + s * SEDAN.rearSeat.y });
// Ручка задней двери (мир).
export const sedanHandle = (x: number, y: number, s: number, dir: 1 | -1 = 1) => ({ x: x + dir * s * (SEDAN.door.rear + 43), y: y + s * -156 });
// Передний край проёма (шарнир) и задний край (мир, по x).
export const sedanDoorX = (x: number, s: number, dir: 1 | -1 = 1) => ({ hinge: x + dir * s * SEDAN.door.hinge, rear: x + dir * s * SEDAN.door.rear });
