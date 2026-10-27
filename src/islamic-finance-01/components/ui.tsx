// Typography, labels, cards, arrows, backdrop and camera — shared UI atoms.
import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill } from "remotion";
import { fontFamily } from "../fonts";
import { easeInOut, prog, springFirm, springPop } from "../motion";
import { PALETTE, ZONE } from "../theme";

// ---------------------------------------------------------------- Backdrop
export const Backdrop: React.FC<{ readonly color: string; readonly grid?: number }> = ({ color, grid = 0 }) => (
  <AbsoluteFill style={{ backgroundColor: color }}>
    {grid > 0 ? (
      <svg width={ZONE.width} height={ZONE.height} style={{ position: "absolute", inset: 0, opacity: grid }}>
        <defs>
          <pattern id="if01-grid" width="90" height="90" patternUnits="userSpaceOnUse">
            <path d="M 90 0 L 0 0 0 90" fill="none" stroke={PALETTE.grid} strokeWidth="2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#if01-grid)" />
      </svg>
    ) : null}
  </AbsoluteFill>
);

// ---------------------------------------------------------------- Camera
export const Camera: React.FC<{ readonly scale?: number; readonly x?: number; readonly y?: number; readonly children: ReactNode }> = ({ scale = 1, x = 0, y = 0, children }) => (
  <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) scale(${scale})`, transformOrigin: "50% 50%" }}>{children}</AbsoluteFill>
);

// ---------------------------------------------------------------- Kinetic text
export const KineticText: React.FC<{
  readonly text: string;
  readonly frame: number;
  readonly start: number;
  readonly size: number;
  readonly color?: string;
  readonly weight?: number;
  readonly align?: "left" | "center";
  readonly stagger?: number;
  readonly mode?: "words" | "letters";
  readonly letterSpacing?: number;
  readonly lineHeight?: number;
  readonly style?: CSSProperties;
  readonly accent?: Record<string, string>; // word -> color
}> = ({ text, frame, start, size, color = PALETTE.ink, weight = 900, align = "center", stagger = 3, mode = "words", letterSpacing = -0.04, lineHeight = 0.98, style, accent }) => {
  const lines = text.split("\n");
  let k = 0;
  return (
    <div style={{ fontFamily, fontSize: size, fontWeight: weight, color, lineHeight, letterSpacing: `${letterSpacing}em`, textAlign: align, ...style }}>
      {lines.map((line, li) => (
        <div key={li} style={{ display: "flex", justifyContent: align === "center" ? "center" : "flex-start", flexWrap: "wrap", gap: mode === "words" ? "0 0.24em" : 0 }}>
          {(mode === "words" ? line.split(" ") : [...line]).map((unit, ui) => {
            const s = springPop(frame, start + k * stagger);
            const op = prog(frame, start + k * stagger, start + k * stagger + 6);
            k++;
            const col = accent?.[unit.replace(/[^A-Za-z0-9$,]/g, "")] ?? color;
            return (
              <span
                key={ui}
                style={{
                  display: "inline-block",
                  color: col,
                  opacity: op,
                  transform: `translateY(${(1 - s) * 0.35 * size}px) scale(${0.85 + 0.15 * s})`,
                  transformOrigin: "50% 80%",
                  whiteSpace: "pre",
                }}
              >
                {unit}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------- Pill label
export type Tone = "green" | "coral" | "ink" | "navy" | "yellow" | "white" | "blue";
const toneStyle = (tone: Tone): { bg: string; fg: string; border?: string } => {
  switch (tone) {
    case "green":
      return { bg: PALETTE.green, fg: "#FFFFFF" };
    case "coral":
      return { bg: PALETTE.coral, fg: "#FFFFFF" };
    case "ink":
      return { bg: PALETTE.ink, fg: "#FFFFFF" };
    case "navy":
      return { bg: PALETTE.navy, fg: "#FFFFFF" };
    case "yellow":
      return { bg: PALETTE.yellow, fg: PALETTE.ink };
    case "blue":
      return { bg: PALETTE.blue, fg: PALETTE.ink };
    default:
      return { bg: "#FFFFFF", fg: PALETTE.ink, border: PALETTE.line };
  }
};

export const Pill: React.FC<{
  readonly children: ReactNode;
  readonly frame: number;
  readonly start: number;
  readonly end?: number; // frame at which it leaves
  readonly tone?: Tone;
  readonly size?: number;
  readonly style?: CSSProperties;
  readonly firm?: boolean;
}> = ({ children, frame, start, end, tone = "green", size = 36, style, firm }) => {
  const t = toneStyle(tone);
  const s = firm ? springFirm(frame, start, 18) : springPop(frame, start);
  const out = end === undefined ? 0 : prog(frame, end, end + 8, easeInOut);
  if (frame < start || out >= 1) return null;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 14,
        padding: `${size * 0.45}px ${size * 0.9}px`,
        borderRadius: size * 1.2,
        backgroundColor: t.bg,
        color: t.fg,
        border: t.border ? `3px solid ${t.border}` : undefined,
        fontFamily,
        fontSize: size,
        fontWeight: 800,
        letterSpacing: "0.06em",
        whiteSpace: "nowrap",
        opacity: Math.min(1, s * 1.4) * (1 - out),
        transform: `scale(${0.7 + 0.3 * s - out * 0.1}) translateY(${-out * 20}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ---------------------------------------------------------------- Card
export const Card: React.FC<{
  readonly children: ReactNode;
  readonly style?: CSSProperties;
  readonly accent?: string;
  readonly radius?: number;
  readonly bg?: string;
}> = ({ children, style, accent, radius = 44, bg = PALETTE.card }) => (
  <div
    style={{
      position: "absolute",
      backgroundColor: bg,
      borderRadius: radius,
      border: `5px solid ${accent ?? PALETTE.line}`,
      boxShadow: "0 24px 60px rgba(21,24,32,0.10)",
      ...style,
    }}
  >
    {children}
  </div>
);

// ---------------------------------------------------------------- Transaction arrow (full-canvas SVG)
export const TransactionArrow: React.FC<{
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly progress: number; // 0..1 draw
  readonly color?: string;
  readonly width?: number;
  readonly dashed?: boolean;
  readonly curve?: number; // vertical bulge in px (negative = arc upward)
  readonly opacity?: number;
}> = ({ x1, y1, x2, y2, progress, color = PALETTE.ink, width = 6, dashed, curve = 0, opacity = 1 }) => {
  const p = Math.max(0, Math.min(1, progress));
  if (p <= 0) return null;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 + curve;
  const d = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
  // approximate length
  const len = Math.hypot(x2 - x1, y2 - y1) + Math.abs(curve) * 0.9;
  // arrow head at the current point of the quadratic curve
  const t = p;
  const px = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * mx + t * t * x2;
  const py = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * my + t * t * y2;
  const dx = 2 * (1 - t) * (mx - x1) + 2 * t * (x2 - mx);
  const dy = 2 * (1 - t) * (my - y1) + 2 * t * (y2 - my);
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  return (
    <svg width={ZONE.width} height={ZONE.height} style={{ position: "absolute", inset: 0, opacity, pointerEvents: "none" }} fill="none">
      <path d={d} stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={dashed ? `${width * 2.2} ${width * 2.6}` : len} strokeDashoffset={dashed ? 0 : len * (1 - p)} style={dashed ? { clipPath: `inset(0 ${(1 - p) * 100}% 0 0)` } : undefined} />
      <g style={{ transform: `translate(${px}px, ${py}px) rotate(${ang}deg)`, opacity: p > 0.05 ? 1 : 0 }}>
        <path d={`M ${-width * 3.2} ${-width * 2.4} L 0 0 L ${-width * 3.2} ${width * 2.4}`} stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------- Comparison card
export const ComparisonCard: React.FC<{
  readonly title: string;
  readonly tone: "coral" | "green";
  readonly frame: number;
  readonly start: number;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly children: ReactNode;
  readonly exit?: number;
}> = ({ title, tone, frame, start, x, y, w, h, children, exit }) => {
  const s = springFirm(frame, start, 26);
  const out = exit === undefined ? 0 : prog(frame, exit, exit + 10, easeInOut);
  const accent = tone === "coral" ? PALETTE.coral : PALETTE.green;
  const soft = tone === "coral" ? PALETTE.coralSoft : PALETTE.greenSoft;
  return (
    <Card accent={accent} style={{ left: x, top: y, width: w, height: h, opacity: s * (1 - out), transform: `translateY(${(1 - s) * 80 - out * 40}px)`, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 118, backgroundColor: soft, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px" }}>
        <div style={{ fontFamily, fontWeight: 800, fontSize: 34, letterSpacing: "0.04em", color: tone === "coral" ? "#B23A3A" : PALETTE.greenDark, textAlign: "center", lineHeight: 1.1 }}>{title}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 118, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>{children}</div>
    </Card>
  );
};
