// Экранные надписи: жёлтые чипы, «штамп» заголовка на ленте, подпись
// «Шарттуу мисал». Крупно, контрастно, в безопасной зоне Reels.
import { box } from "../context";
import { fontFamily } from "../../../fonts";
import { C } from "./theme";

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const back = (u: number) => {
  const t = clamp01(u);
  const c1 = 1.7;
  return 1 + (c1 + 1) * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

// Чип: жёлтая (или тёмно-синяя) плашка с текстом; a — появление 0…1.
export const Chip: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly text: string;
  readonly a: number;
  readonly size?: number;
  readonly dark?: boolean;
  readonly center?: boolean;
  readonly rot?: number;
  readonly icon?: React.ReactNode;
}> = ({ x, y, text, a, size = 44, dark, center, rot = 0, icon }) => {
  if (a <= 0) return null;
  const s = back(a);
  return (
    <div
      style={box({
        left: x,
        top: y,
        translate: center ? "-50% 0" : undefined,
        display: "flex",
        alignItems: "center",
        gap: size * 0.3,
        padding: `${size * 0.26}px ${size * 0.55}px`,
        borderRadius: size,
        backgroundColor: dark ? C.navy : C.yellow,
        color: dark ? "#FFFFFF" : C.navy,
        fontFamily,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.1,
        whiteSpace: "nowrap",
        opacity: clamp01(a * 2),
        scale: `${0.6 + 0.4 * s}`,
        rotate: `${rot}deg`,
        boxShadow: "0 10px 24px rgba(20,40,90,0.22)",
      })}
    >
      {icon}
      {text}
    </div>
  );
};

// Заголовок-штамп на жёлтой ленте: строки появляются тактами (at[i]).
export const StampTitle: React.FC<{
  readonly lines: readonly string[];
  readonly f: number;
  readonly at: readonly number[];
  readonly y: number;
  readonly sizes?: readonly number[];
  readonly align?: "center" | "right";
}> = ({ lines, f, at, y, sizes = [56, 84], align = "center" }) => (
  <div style={box({ left: 0, right: align === "right" ? 64 : 0, top: y, display: "flex", flexDirection: "column", alignItems: align === "right" ? "flex-end" : "center", gap: 12 })}>
    {lines.map((l, i) => {
      const u = clamp01((f - at[i]) / 7);
      if (u <= 0) return <div key={i} style={{ height: (sizes[i] ?? 60) * 1.35 }} />;
      const s = back(u);
      return (
        <div
          key={i}
          style={{
            position: "relative",
            padding: `${(sizes[i] ?? 60) * 0.12}px ${(sizes[i] ?? 60) * 0.42}px`,
            fontFamily,
            fontWeight: 900,
            fontSize: sizes[i] ?? 60,
            lineHeight: 1.12,
            letterSpacing: 1.5,
            color: i === 0 ? C.navy : "#FFFFFF",
            backgroundColor: i === 0 ? C.yellow : C.navy,
            borderRadius: 14,
            rotate: `${i === 0 ? -2 : 1.2}deg`,
            scale: `${1.5 - 0.5 * s}`,
            opacity: clamp01(u * 3),
            boxShadow: "0 14px 30px rgba(20,40,90,0.28)",
            whiteSpace: "nowrap",
          }}
        >
          {l}
        </div>
      );
    })}
  </div>
);

// Метка «Шарттуу мисал» — видна всё время, пока виден условный пример.
export const ExampleTag: React.FC<{ readonly x: number; readonly y: number; readonly text: string; readonly a?: number; readonly size?: number }> = ({ x, y, text, a = 1, size = 34 }) => (
  <div
    style={box({
      left: x,
      top: y,
      padding: `${size * 0.22}px ${size * 0.5}px`,
      borderRadius: 10,
      backgroundColor: "#FFFFFF",
      border: `3px dashed ${C.navy}`,
      color: C.navy,
      fontFamily,
      fontWeight: 900,
      fontSize: size,
      opacity: a,
      whiteSpace: "nowrap",
      boxShadow: "0 6px 14px rgba(20,40,90,0.12)",
    })}
  >
    {text}
  </div>
);
