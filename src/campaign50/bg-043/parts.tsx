// Общие элементы кадра BG-043: верхняя смысловая надпись сцены (безопасная
// зона Reels: сверху ≥ 250 px, справа ≥ 150 px), плашки «Шарттуу мисал» /
// «Ойдон чыгарылган тамаша», логотип BalaGo, шестерёнка.
import { Img, staticFile } from "remotion";
import { fontFamily } from "../../fonts";
import { appear, clamp, pop } from "./anim";
import { gearPath } from "./chars/Clock";
import { C } from "./palette";
import { BG43_VIDEO } from "./script";

// Смысловая надпись сцены: белая плашка с тёмно-синим текстом и жёлтым
// акцентом, мягко «впрыгивает» в кадр и остаётся до out.
export const Caption: React.FC<{
  readonly f: number;
  readonly at: number;
  readonly out?: number;
  readonly text: string;
  readonly top?: number;
  readonly size?: number;
  readonly accent?: string;
}> = ({ f, at, out = Infinity, text, top = 262, size = 50, accent = C.yellow }) => {
  const a = pop(f, at, 16);
  const o = clamp((f - at) / 6) * (1 - clamp((f - out) / 10));
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 60, right: 150, top, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          opacity: o,
          transform: `translateY(${(1 - a) * -26}px) scale(${0.86 + 0.14 * a})`,
          padding: "16px 34px 18px",
          borderRadius: 28,
          backgroundColor: "rgba(255,255,255,0.96)",
          boxShadow: "0 12px 30px rgba(20,40,90,0.16)",
          fontFamily,
          fontSize: size,
          fontWeight: 900,
          color: C.navy,
          lineHeight: 1.12,
          textAlign: "center",
          borderBottom: `8px solid ${accent}`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

// Небольшая плашка (например, «Шарттуу мисал» — всё время, пока условная
// сцена в кадре).
export const Chip: React.FC<{
  readonly text: string;
  readonly left?: number;
  readonly top?: number;
  readonly right?: number;
  readonly opacity?: number;
  readonly dark?: boolean;
  readonly size?: number;
}> = ({ text, left, top = 262, right, opacity = 1, dark, size = 34 }) => (
  <div
    style={{
      position: "absolute",
      left,
      right,
      top,
      opacity,
      padding: "9px 22px 10px",
      borderRadius: 999,
      backgroundColor: dark ? C.navy : C.yellowSoft,
      color: dark ? "#FFFFFF" : C.navy,
      border: dark ? "none" : `3px solid ${C.yellow}`,
      fontFamily,
      fontSize: size,
      fontWeight: 800,
      whiteSpace: "nowrap",
      boxShadow: "0 6px 16px rgba(20,40,90,0.12)",
    }}
  >
    {text}
  </div>
);

export const Logo: React.FC<{ readonly x: number; readonly y: number; readonly r: number; readonly opacity?: number; readonly scale?: number }> = ({ x, y, r, opacity = 1, scale = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: x - r,
      top: y - r,
      width: r * 2,
      height: r * 2,
      opacity,
      transform: `scale(${scale})`,
      borderRadius: r,
      backgroundColor: "#FFFFFF",
      boxShadow: "0 12px 30px rgba(20,40,90,0.18)",
    }}
  >
    <Img src={staticFile(BG43_VIDEO.logo)} style={{ width: r * 2, height: r * 2, borderRadius: r }} />
  </div>
);

export const Gear: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly rot: number;
  readonly fill: string;
  readonly teeth?: number;
  readonly hole?: string;
  readonly stroke?: string;
}> = ({ x, y, r, rot, fill, teeth = 10, hole = C.cream, stroke = C.navy }) => (
  <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${r / 41})`}>
      <path d={gearPath(teeth, 30, 41)} fill={fill} stroke={stroke} strokeWidth={4} strokeLinejoin="round" />
      <circle r={12} fill={hole} stroke={stroke} strokeWidth={4} />
    </g>
  </svg>
);

// Звёздочки-искры (спор шестерёнок, радость).
export const Sparks: React.FC<{ readonly x: number; readonly y: number; readonly f: number; readonly at: number; readonly n?: number; readonly color?: string; readonly spread?: number }> = ({
  x,
  y,
  f,
  at,
  n = 6,
  color = C.yellow,
  spread = 90,
}) => {
  const t = (f - at) / 16;
  if (t < 0 || t > 1) return null;
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + at * 0.37;
        const d = spread * (0.35 + 0.65 * t);
        const s = 10 * (1 - t) + 2;
        const cx = x + Math.cos(a) * d;
        const cy = y + Math.sin(a) * d;
        return <path key={i} d={`M ${cx} ${cy - s} L ${cx + s * 0.3} ${cy - s * 0.3} L ${cx + s} ${cy} L ${cx + s * 0.3} ${cy + s * 0.3} L ${cx} ${cy + s} L ${cx - s * 0.3} ${cy + s * 0.3} L ${cx - s} ${cy} L ${cx - s * 0.3} ${cy - s * 0.3} Z`} fill={color} stroke={C.navy} strokeWidth={2} opacity={1 - t * 0.6} />;
      })}
    </svg>
  );
};

// Мягкая «бумажная» карточка.
export const card = (s: React.CSSProperties = {}): React.CSSProperties => ({
  position: "absolute",
  backgroundColor: "#FFFFFF",
  borderRadius: 28,
  boxShadow: "0 18px 40px rgba(20,40,90,0.14)",
  fontFamily,
  color: C.navy,
  boxSizing: "border-box",
  ...s,
});

export const fade = (f: number, at: number, d = 10) => appear(f, at, d);
