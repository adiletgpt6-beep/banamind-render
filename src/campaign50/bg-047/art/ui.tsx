// Экранные элементы BalaGoBG047: кинетический заголовок по буквам,
// бумажные чипы и наклейки. Всё — в безопасной зоне Reels (сверху 250,
// снизу 400, слева 90, справа 150 px).
import { fontFamily } from "../../../fonts";
import { easeOut, prog, springy } from "./motion";
import { C } from "./palette";

export const SAFE = { top: 250, bottom: 1520, left: 90, right: 930 } as const;

export const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });

// Заголовок: буквы падают по одной с пружинкой; out — исчезновение.
export const KineticTitle: React.FC<{
  readonly text: string;
  readonly f: number;
  readonly at: number;
  readonly y: number;
  readonly size?: number;
  readonly out?: number; // кадр начала исчезновения
  readonly color?: string;
  readonly stroke?: string;
  readonly per?: number; // кадров между буквами
}> = ({ text, f, at, y, size = 76, out = Infinity, color = C.navy, stroke = "#FFFFFF", per = 1.2 }) => {
  const gone = easeOut(prog(f, out, 10));
  if (f < at || gone >= 1) return null;
  // слова не разрываются: перенос только между словами
  const words = text.split(" ");
  let k = 0;
  return (
    <div style={box({ left: SAFE.left, right: 1080 - SAFE.right, top: y, display: "flex", justifyContent: "center", flexWrap: "wrap", columnGap: size * 0.3 })}>
      {words.map((w, wi) => (
        <span key={wi} style={{ display: "inline-flex", whiteSpace: "nowrap" }}>
          {[...w].map((ch) => {
            const i = k++;
            const p = springy(prog(f, at + i * per, 14));
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  fontFamily,
                  fontWeight: 900,
                  fontSize: size,
                  lineHeight: 1.08,
                  color,
                  WebkitTextStroke: `${Math.round(size * 0.16)}px ${stroke}`,
                  paintOrder: "stroke fill",
                  textShadow: "0 8px 16px rgba(20,40,90,0.16)",
                  opacity: Math.min(1, p * 1.6) * (1 - gone),
                  transform: `translateY(${(1 - p) * -60 - gone * 30}px) rotate(${(1 - p) * (i % 2 ? 12 : -12)}deg)`,
                }}
              >
                {ch}
              </span>
            );
          })}
        </span>
      ))}
    </div>
  );
};

// Бумажный чип: появляется с пружинкой (скейл + лёгкий поворот).
export const Chip: React.FC<{
  readonly f: number;
  readonly at: number;
  readonly out?: number;
  readonly x?: number;
  readonly y: number;
  readonly center?: boolean;
  readonly bg?: string;
  readonly color?: string;
  readonly size?: number;
  readonly tilt?: number;
  readonly border?: string;
  readonly children: React.ReactNode;
}> = ({ f, at, out = Infinity, x = SAFE.left, y, center = false, bg = C.white, color = C.navy, size = 34, tilt = 0, border, children }) => {
  const p = springy(prog(f, at, 16));
  const gone = easeOut(prog(f, out, 9));
  if (p <= 0 || gone >= 1) return null;
  const inner = (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: `${size * 0.32}px ${size * 0.7}px`,
        borderRadius: 999,
        backgroundColor: bg,
        color,
        fontFamily,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.1,
        border: border ?? `4px solid ${C.navy}`,
        boxShadow: "0 8px 0 rgba(20,40,90,0.14), 0 14px 24px rgba(20,40,90,0.14)",
        opacity: Math.min(1, p * 1.5) * (1 - gone),
        transform: `scale(${0.6 + 0.4 * p - gone * 0.2}) rotate(${tilt * p}deg)`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
  return center ? (
    <div style={box({ left: SAFE.left, right: 1080 - SAFE.right, top: y, display: "flex", justifyContent: "center" })}>{inner}</div>
  ) : (
    <div style={box({ left: x, top: y })}>{inner}</div>
  );
};

// Метка «Шарттуу мисал» / «Графикалык мисал» в верхнем левом углу.
export const ExampleTag: React.FC<{ readonly text: string; readonly opacity?: number }> = ({ text, opacity = 1 }) => (
  <div
    style={box({
      left: SAFE.left,
      top: 262,
      padding: "8px 20px",
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.92)",
      border: `3px dashed ${C.navySoft}`,
      fontFamily,
      fontWeight: 800,
      fontSize: 28,
      color: C.navySoft,
      opacity,
    })}
  >
    {text}
  </div>
);

// Знак вопроса над героем (качается).
export const Question: React.FC<{ readonly f: number; readonly at: number; readonly x: number; readonly y: number; readonly size?: number; readonly out?: number }> = ({
  f,
  at,
  x,
  y,
  size = 90,
  out = Infinity,
}) => {
  const p = springy(prog(f, at, 14));
  const gone = easeOut(prog(f, out, 8));
  if (p <= 0 || gone >= 1) return null;
  return (
    <div
      style={box({
        left: x - size / 2,
        top: y - size,
        width: size,
        height: size,
        fontFamily,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1,
        textAlign: "center",
        color: C.yellow,
        WebkitTextStroke: `${size * 0.14}px ${C.navy}`,
        paintOrder: "stroke fill",
        opacity: Math.min(1, p * 1.5) * (1 - gone),
        transform: `translateY(${(1 - p) * 30}px) scale(${0.5 + 0.5 * p}) rotate(${Math.sin((f - at) / 7) * 10}deg)`,
      })}
    >
      ?
    </div>
  );
};
