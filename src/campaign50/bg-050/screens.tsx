// Телефон крупным планом: рамка, рука, держащая телефон, палец, нажимающий
// на экран, значки маршрута «үй» и «мектеп».
import { interpolate } from "remotion";
import { fontFamily } from "../../fonts";
import { C } from "./palette";
import { box } from "./shots";

const INK = "#1E2235";
const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const StatusBar: React.FC<{ time: string }> = ({ time }) => (
  <div style={box({ left: 44, right: 44, top: 26, display: "flex", justifyContent: "space-between", fontSize: 28, fontWeight: 800, color: INK })}>
    <span>{time}</span>
    <span style={{ letterSpacing: 2 }}>▮▮▮</span>
  </div>
);

export const PhoneFrame: React.FC<{ x: number; y: number; w: number; tilt?: number; children: React.ReactNode }> = ({ x, y, w, tilt = 0, children }) => {
  const h = w * 2.05;
  return (
    <div style={box({ left: x, top: y, width: w, height: h, borderRadius: w * 0.11, backgroundColor: INK, rotate: `${tilt}deg`, boxShadow: "0 40px 80px rgba(20,30,60,0.35)" })}>
      <div style={box({ left: w * 0.035, top: w * 0.035, right: w * 0.035, bottom: w * 0.035, borderRadius: w * 0.085, overflow: "hidden", backgroundColor: "#F4F6FA", fontFamily })}>{children}</div>
      <div style={box({ left: w * 0.38, top: w * 0.05, width: w * 0.24, height: w * 0.05, borderRadius: w * 0.03, backgroundColor: INK })} />
    </div>
  );
};

// Рука, держащая телефон снизу: рукав, ладонь за корпусом, пальцы на краях.
export const HoldingHand: React.FC<{ x: number; y: number; w: number; sleeve: string; skin: string }> = ({ x, y, w, sleeve, skin }) => {
  const h = w * 2.05;
  return (
    <>
      <div style={box({ left: x + w * 0.66, top: y + h * 0.95, width: w * 0.62, height: h * 0.6, borderRadius: w * 0.2, backgroundColor: sleeve, rotate: "-18deg", transformOrigin: "50% 0%" })} />
      <div style={box({ left: x + w * 0.7, top: y + h * 0.84, width: w * 0.46, height: w * 0.5, borderRadius: w * 0.2, backgroundColor: skin, rotate: "-14deg" })} />
      <div style={box({ left: x + w * 0.9, top: y + h * 0.8, width: w * 0.12, height: w * 0.26, borderRadius: w * 0.06, backgroundColor: skin, rotate: "-32deg", boxShadow: "-3px 4px 8px rgba(20,30,60,0.18)" })} />
      {[0, 1, 2].map((i) => (
        <div key={i} style={box({ left: x - w * 0.05, top: y + h * (0.72 + i * 0.07), width: w * 0.1, height: w * 0.11, borderRadius: w * 0.05, backgroundColor: skin })} />
      ))}
    </>
  );
};

// Палец, нажимающий на экран (тень и лёгкое касание в момент tapAt).
export const TapFinger: React.FC<{ x: number; y: number; f: number; tapAt: number; skin: string }> = ({ x, y, f, tapAt, skin }) => {
  const a = interpolate(f, [tapAt - 22, tapAt - 8, tapAt + 10, tapAt + 22], [0, 1, 1, 0], CL);
  const press = interpolate(f, [tapAt - 4, tapAt, tapAt + 6], [0, 1, 0], CL);
  if (a <= 0) return null;
  return (
    <div style={box({ left: x - 50 + 60 * (1 - a), top: y - 30 + 80 * (1 - a) + 10 * press, width: 100, height: 300, opacity: a })}>
      <div style={box({ left: 0, top: 0, width: 92, height: 300, borderRadius: 46, backgroundColor: skin, boxShadow: "0 18px 30px rgba(20,30,60,0.25)" })} />
      <div style={box({ left: 18, top: 14, width: 56, height: 46, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.35)" })} />
    </div>
  );
};

export const RouteIcon: React.FC<{ kind: "home" | "school"; size: number }> = ({ kind, size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx={50} cy={50} r={48} fill={kind === "home" ? C.yellow : C.navy} />
    {kind === "home" ? (
      <path d="M 26 52 L 50 30 L 74 52 L 68 52 L 68 74 L 32 74 L 32 52 Z" fill={C.navy} />
    ) : (
      <g fill="#FFFFFF">
        {/* школа: широкое здание, башенка с флажком, ряд окон */}
        <rect x={20} y={50} width={60} height={26} rx={2} />
        <rect x={40} y={36} width={20} height={16} />
        <path d="M 37 37 L 50 27 L 63 37 Z" />
        <rect x={49} y={14} width={3} height={15} />
        <path d="M 52 14 L 64 18 L 52 22 Z" fill={C.yellow} />
        {[26, 37, 59, 70].map((x) => (
          <rect key={x} x={x} y={56} width={6} height={7} fill={C.navy} />
        ))}
        <rect x={46} y={60} width={8} height={16} fill={C.navy} />
      </g>
    )}
  </svg>
);
