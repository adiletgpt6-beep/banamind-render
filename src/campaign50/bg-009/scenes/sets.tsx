// Декорации дней недели: стена в цвете дня, пол, окно с видом на горы
// Ала-Тоо (Бишкек), стол, ноутбук, доска, часы. Мир = кадр (px).
import { Mountains, NAVY, Poplar } from "../art";

export const FLOOR_Y = 1420;

export const Room: React.FC<{ readonly tint: string; readonly color: string; readonly children?: React.ReactNode }> = ({ tint, color, children }) => (
  <div style={{ position: "absolute", inset: 0, backgroundColor: tint, overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1180, height: 740, backgroundColor: "#FFFFFF", opacity: 0.55 }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 1176, height: 8, backgroundColor: color, opacity: 0.35 }} />
    {children}
  </div>
);

// Окно с видом на горы и тополя.
export const CityWindow: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly h: number; readonly drift?: number }> = ({ x, y, w, h, drift = 0 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 18, overflow: "hidden", backgroundColor: "#DCEBFA", boxShadow: "inset 0 0 0 10px #FFFFFF, 0 6px 18px rgba(20,40,75,0.10)" }}>
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", left: 0, top: 0 }}>
      <Mountains width={w} y={h * 0.38} shift={drift} />
      <rect x={0} y={h * 0.72} width={w} height={h * 0.3} fill="#CFE3C8" />
      {[0.12, 0.3, 0.55, 0.78, 0.92].map((k, i) => (
        <Poplar key={i} x={w * k + drift * 0.6} y={h * 0.78} s={1.4 + (i % 2) * 0.3} />
      ))}
    </svg>
    <div style={{ position: "absolute", left: w / 2 - 6, top: 0, width: 12, height: h, backgroundColor: "#FFFFFF" }} />
  </div>
);

// Стол спереди (закрывает ноги сидящих): столешница и передняя панель.
export const DeskFront: React.FC<{ readonly x: number; readonly w: number; readonly top: number; readonly color?: string; readonly edge?: string }> = ({ x, w, top, color = "#F3EEE6", edge = "#DCCFBE" }) => (
  <div style={{ position: "absolute", left: x, top, width: w, height: FLOOR_Y + 60 - top }}>
    <div style={{ position: "absolute", left: -8, top: -6, width: w + 16, height: 26, borderRadius: 10, backgroundColor: color, boxShadow: "0 3px 0 rgba(0,0,0,0.06)" }} />
    <div style={{ position: "absolute", left: 6, top: 20, width: w - 12, height: FLOOR_Y + 40 - top, backgroundColor: edge, borderRadius: "0 0 10px 10px" }} />
  </div>
);

// Ноутбук задней крышкой к зрителю (стоит на столе, x — центр, y — стол).
export const LaptopBack: React.FC<{ readonly x: number; readonly y: number; readonly w?: number; readonly color?: string }> = ({ x, y, w = 250, color = "#B7C0CE" }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y - w * 0.62, width: w, height: w * 0.62 }}>
    <div style={{ position: "absolute", inset: 0, borderRadius: 14, backgroundColor: color, boxShadow: "inset 0 -6px 0 rgba(0,0,0,0.08)" }} />
    <div style={{ position: "absolute", left: w / 2 - 16, top: w * 0.26, width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.55)" }} />
    <div style={{ position: "absolute", left: -12, top: w * 0.62 - 6, width: w + 24, height: 12, borderRadius: 6, backgroundColor: "#8F98A8" }} />
  </div>
);

// Настенные часы.
export const WallClock: React.FC<{ readonly x: number; readonly y: number; readonly r: number; readonly h: number; readonly m: number }> = ({ x, y, r, h, m }) => {
  const ma = (m / 60) * 360;
  const ha = ((h % 12) / 12) * 360 + (m / 60) * 30;
  return (
    <svg width={2 * r} height={2 * r} viewBox="-50 -50 100 100" style={{ position: "absolute", left: x - r, top: y - r, overflow: "visible" }}>
      <circle r={46} fill="#FFFFFF" stroke={NAVY} strokeWidth={6} />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={-1.5} y={-40} width={3} height={i % 3 === 0 ? 9 : 5} fill={NAVY} transform={`rotate(${i * 30})`} />
      ))}
      <rect x={-3} y={-26} width={6} height={28} rx={3} fill={NAVY} transform={`rotate(${ha})`} />
      <rect x={-1.6} y={-36} width={3.2} height={38} rx={1.6} fill="#E8463A" transform={`rotate(${ma})`} />
      <circle r={4} fill={NAVY} />
    </svg>
  );
};

// Стикер на доске.
export const Sticky: React.FC<{ readonly x: number; readonly y: number; readonly color: string; readonly s: number; readonly rot?: number }> = ({ x, y, color, s, rot = 0 }) =>
  s > 0 ? (
    <div style={{ position: "absolute", left: x, top: y, width: 92, height: 80, backgroundColor: color, borderRadius: 6, transform: `rotate(${rot}deg) scale(${s})`, boxShadow: "0 4px 8px rgba(0,0,0,0.12)" }}>
      <div style={{ position: "absolute", left: 12, top: 18, width: 60, height: 7, borderRadius: 4, backgroundColor: "rgba(20,40,75,0.35)" }} />
      <div style={{ position: "absolute", left: 12, top: 34, width: 44, height: 7, borderRadius: 4, backgroundColor: "rgba(20,40,75,0.25)" }} />
    </div>
  ) : null;
