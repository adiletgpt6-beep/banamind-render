// Парковка у бизнес-центра (сцены 4d, 7a, 7b): стеклянный фасад с
// вывеской «Бизнес-борбор», вход, знак «P», размеченные места, деревья.
// Машина семьи стоит носом ВЛЕВО (dir = 1) — к зрителю водительский бок:
// видно, как отец садится, разговаривает по телефону и выходит.
// Перспектива с одной точкой схода: s — масштаб глубины (1 — у камеры),
// фасад — s = 0,42. pkY(s), pkX(X, s), рост — H × s.
import { box } from "../kit";
import { clamp, hash01 } from "../rig/motion";
import { M13_TEXT } from "../script";
import { C, F } from "../theme";
import { CityView, ink, mix } from "./Office31";
import { YardTree } from "./SchoolYard";

export const PK = { horizon: 640, floorF: 1900, vpx: 540, facadeS: 0.42 } as const;
export const pkY = (s: number) => PK.horizon + (PK.floorF - PK.horizon) * s;
export const pkS = (y: number) => (y - PK.horizon) / (PK.floorF - PK.horizon);
export const pkX = (X: number, s: number) => PK.vpx + (X - PK.vpx) * s;
export const pkPt = (X: number, s: number) => ({ x: pkX(X, s), y: pkY(s) });

const FS = PK.facadeS;
const base = pkY(FS);
const ENT = { X: 1260, w: 560, h: 900 };

export const PK_POS = {
  // машина на месте: центр по земле, s
  car: { x: pkX(420, 0.78), y: pkY(0.78), s: 0.78 },
  // вход в здание (дверь, линия пола)
  door: { x: pkX(ENT.X, FS), y: base, s: FS },
  // путь отца от водительской двери ко входу
  walk: [pkPt(260, 0.86), pkPt(760, 0.74), pkPt(1120, 0.56), pkPt(ENT.X, FS + 0.02)],
} as const;

export const PK_CAM = {
  wide: { x: 560, y: 1260, zoom: 0.86 },
} as const;

const Svg: React.FC<{ readonly children: React.ReactNode; readonly blur?: number }> = ({ children, blur = 0 }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible", filter: blur ? `blur(${blur}px)` : undefined })}>
    {children}
  </svg>
);

export const ParkingLot: React.FC<{ readonly evening?: number; readonly mid?: React.ReactNode }> = ({ evening = 0, mid }) => {
  const e = clamp(evening);
  const k = FS;
  const glass = mix("#9DBFD8", "#E9B78E", 0.4 * e);
  const ex = pkX(ENT.X, FS);
  const ew = ENT.w * FS;
  const eh = ENT.h * FS;
  const fx0 = pkX(-1800, FS);
  const fx1 = pkX(2600, FS);
  const top = base - 2600 * k;
  return (
    <>
      <div style={box({ left: 0, top: 0 })}>
        <CityView id="pk-far" x0={-600} x1={1700} y0={-600} y1={base} base={base - 2200 * k} k={1.4} evening={e} />
      </div>
      <Svg>
        {/* стеклянный фасад бизнес-центра */}
        <rect x={fx0} y={top} width={fx1 - fx0} height={base - top} fill={glass} stroke="#4E6A82" strokeWidth={4 * k} />
        {Array.from({ length: 24 }).map((_, r) => (
          <rect key={`r${r}`} x={fx0} y={top + r * 120 * k} width={fx1 - fx0} height={10 * k} fill="#E3EEF6" opacity={0.85} />
        ))}
        {Array.from({ length: 30 }).map((_, q) => (
          <rect key={`q${q}`} x={fx0 + q * 160 * k} y={top} width={8 * k} height={base - top} fill="#6F91AD" opacity={0.6} />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <path key={`h${i}`} d={`M ${fx0 + i * 700 * k} ${top + 200 * k} L ${fx0 + i * 700 * k + 240 * k} ${top + 200 * k} L ${fx0 + i * 700 * k + 40 * k} ${base - 300 * k} L ${fx0 + i * 700 * k} ${base - 300 * k} Z`} fill="#FFFFFF" opacity={0.16} />
        ))}
        {/* цоколь и вход с козырьком */}
        <rect x={fx0} y={base - 90 * k} width={fx1 - fx0} height={90 * k} fill="#7E8C9C" />
        <rect x={ex - ew / 2} y={base - eh} width={ew} height={eh} fill="#3E5266" stroke="#2C3B4B" strokeWidth={3 * k} />
        <rect x={ex - ew / 2 + 20 * k} y={base - eh + 20 * k} width={ew / 2 - 30 * k} height={eh - 20 * k} fill="#86A9C4" opacity={0.7} />
        <rect x={ex + 10 * k} y={base - eh + 20 * k} width={ew / 2 - 30 * k} height={eh - 20 * k} fill="#86A9C4" opacity={0.7} />
        <rect x={ex - ew / 2 - 120 * k} y={base - eh - 70 * k} width={ew + 240 * k} height={60 * k} fill="#2F3D4E" />
        {/* вывеска над входом */}
        <rect x={ex - ew / 2 - 100 * k} y={base - eh - 300 * k} width={ew + 200 * k} height={150 * k} rx={20 * k} fill={C.navy} stroke="#0E1B2E" strokeWidth={3 * k} />
        {/* асфальт парковки и разметка мест */}
        <rect x={-3000} y={base} width={7000} height={2600} fill={mix(C.asphalt, "#FFFFFF", 0.12)} />
        <rect x={-3000} y={base} width={7000} height={pkY(FS + 0.06) - base} fill={C.sidewalk} />
        {Array.from({ length: 14 }).map((_, i) => {
          const X = -1500 + i * 520;
          return <line key={`b${i}`} x1={pkX(X, 0.62)} y1={pkY(0.62)} x2={pkX(X, 0.98)} y2={pkY(0.98)} stroke="#F4F2EC" strokeWidth={8} opacity={0.85} />;
        })}
        <line x1={-3000} y1={pkY(0.62)} x2={4000} y2={pkY(0.62)} stroke="#F4F2EC" strokeWidth={6} opacity={0.7} />
        {/* деревья у фасада */}
        {[-700, 2150].map((X, i) => (
          <YardTree key={X} x={pkX(X, 0.5)} y={pkY(0.5)} k={0.55} seed={13 + i * 4} tall={i === 0} />
        ))}
        {/* знак «P» */}
        <g>
          <rect x={pkX(-260, 0.56) - 6} y={pkY(0.56) - 520 * 0.56} width={12} height={520 * 0.56} fill="#5C6470" />
          <rect x={pkX(-260, 0.56) - 56} y={pkY(0.56) - 640 * 0.56} width={112} height={112} rx={18} fill="#2F6FD6" stroke="#1E4A92" strokeWidth={4} />
        </g>
      </Svg>
      <div style={box({ left: ex - ew / 2 - 100 * k, top: base - eh - 300 * k, width: ew + 200 * k, height: 150 * k, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.display, fontWeight: 900, fontSize: 62 * k * 1.6, color: "#FFFFFF", whiteSpace: "nowrap" })}>
        {M13_TEXT.office.building}
      </div>
      <div style={box({ left: pkX(-260, 0.56) - 56, top: pkY(0.56) - 640 * 0.56, width: 112, height: 112, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.display, fontWeight: 900, fontSize: 84, color: "#FFFFFF" })}>
        {M13_TEXT.parking}
      </div>
      {/* ещё одна припаркованная машина вдалеке (силуэт) */}
      <Svg>
        <rect x={pkX(1900, 0.66) - 160} y={pkY(0.66) - 150} width={320} height={110} rx={40} fill={mix("#C9CED6", ink("#C9CED6", 0.8), hash01(3) * 0.2)} opacity={0.9} />
      </Svg>
      {mid}
    </>
  );
};
