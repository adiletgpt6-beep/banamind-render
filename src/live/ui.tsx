// Базовые элементы графики живых роликов: стеклянная панель, карточка-чип,
// мягкое свечение, проход света, виньетка. Всё зависит только от времени.
import { fontFamily } from "../fonts";
import { easeOut, ramp, springy } from "./sync";
import { LIVE_COLORS as C } from "./theme";

// Стеклянная панель с 2.5D-появлением (наклон по X и подъём).
export const GlassPanel: React.FC<{
  readonly t: number;
  readonly at: number;
  readonly out?: number;
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
  readonly tone?: "dark" | "light";
  readonly tilt?: number; // градусы rotateX в покое
  readonly children?: React.ReactNode;
  readonly style?: React.CSSProperties;
}> = ({ t, at, out = Infinity, left, top, width, height, tone = "dark", tilt = 0, children, style }) => {
  const k = springy(t, at, 0.6);
  const a = ramp(t, at, 0.25);
  const e = ramp(t, out, 0.3);
  if (a <= 0 || e >= 1) return null;
  return (
    <div style={{ position: "absolute", left, top, width, height, perspective: 1600 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 40,
          background:
            tone === "dark"
              ? "linear-gradient(160deg, rgba(20,40,90,0.86) 0%, rgba(8,18,46,0.9) 100%)"
              : "linear-gradient(160deg, rgba(255,255,255,0.95) 0%, rgba(240,245,255,0.92) 100%)",
          border: tone === "dark" ? "2px solid rgba(255,255,255,0.16)" : "2px solid rgba(255,255,255,0.9)",
          boxShadow: "0 40px 90px rgba(4,10,30,0.45), inset 0 1px 0 rgba(255,255,255,0.18)",
          opacity: a * (1 - e),
          transform: `translateY(${(1 - k) * 90 + e * 40}px) rotateX(${tilt + (1 - k) * 28}deg) scale(${0.92 + 0.08 * k - e * 0.05})`,
          transformOrigin: "50% 100%",
          overflow: "hidden",
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Карточка-«пилюля» с иконкой и подписью.
export const Chip: React.FC<{
  readonly t: number;
  readonly at: number;
  readonly out?: number;
  readonly icon?: React.ReactNode;
  readonly text: string;
  readonly sub?: string;
  readonly tone?: "light" | "dark" | "yellow" | "red";
  readonly size?: number;
  readonly style?: React.CSSProperties;
  readonly from?: "up" | "down" | "left" | "right";
}> = ({ t, at, out = Infinity, icon, text, sub, tone = "light", size = 40, style, from = "up" }) => {
  const k = springy(t, at, 0.5);
  const a = ramp(t, at, 0.2);
  const e = ramp(t, out, 0.25);
  if (a <= 0 || e >= 1) return null;
  const bg = { light: "rgba(255,255,255,0.96)", dark: "rgba(10,22,54,0.88)", yellow: C.yellow, red: C.red }[tone];
  const fg = { light: C.navy, dark: C.white, yellow: C.navyInk, red: C.white }[tone];
  const d = (1 - k) * 60;
  const tr = { up: `translateY(${d}px)`, down: `translateY(${-d}px)`, left: `translateX(${d}px)`, right: `translateX(${-d}px)` }[from];
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size * 0.4,
        padding: `${size * 0.32}px ${size * 0.6}px ${size * 0.32}px ${icon ? size * 0.36 : size * 0.6}px`,
        borderRadius: size * 0.7,
        background: bg,
        color: fg,
        fontFamily,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.05,
        boxShadow: "0 18px 44px rgba(4,10,30,0.32)",
        opacity: a * (1 - e),
        transform: `${tr} scale(${0.9 + 0.1 * k - 0.08 * e})`,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {icon}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span>{text}</span>
        {sub ? <span style={{ fontSize: size * 0.58, fontWeight: 700, opacity: 0.72, marginTop: 4 }}>{sub}</span> : null}
      </div>
    </div>
  );
};

// Мягкий световой «проход» по кадру (акцент на смене блока).
export const LightSweep: React.FC<{ readonly t: number; readonly at: number; readonly dur?: number; readonly strength?: number }> = ({
  t,
  at,
  dur = 0.7,
  strength = 0.22,
}) => {
  const p = (t - at) / dur;
  if (p < 0 || p > 1) return null;
  const x = -40 + easeOut(p) * 180;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(105deg, rgba(255,255,255,0) ${x - 18}%, rgba(255,236,170,${strength}) ${x}%, rgba(255,255,255,0) ${x + 18}%)`,
        mixBlendMode: "screen",
        pointerEvents: "none",
      }}
    />
  );
};

// Лёгкая виньетка + тонировка в фирменный синий снизу (читаемость текста).
export const Grade: React.FC<{ readonly bottom?: number; readonly top?: number }> = ({ bottom = 0.5, top = 0.25 }) => (
  <>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(180deg, rgba(6,14,38,${top}) 0%, rgba(6,14,38,0) 18%, rgba(6,14,38,0) 52%, rgba(6,14,38,${bottom}) 100%)`,
      }}
    />
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.28) 100%)" }} />
  </>
);

// Свечение-«ореол» за иконкой.
export const Glow: React.FC<{ readonly size: number; readonly color?: string; readonly opacity?: number; readonly style?: React.CSSProperties }> = ({
  size,
  color = C.yellow,
  opacity = 0.5,
  style,
}) => (
  <div
    style={{
      position: "absolute",
      width: size,
      height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 68%)`,
      opacity,
      ...style,
    }}
  />
);
