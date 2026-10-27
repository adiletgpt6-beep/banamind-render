// TypographySystem: спокойная премиальная типографика MIRRORVERSE.
// Текст — отдельный неподвижный слой поверх 3D: никогда не отражается,
// не переворачивается и не искажается. Появление — мягкое (прозрачность,
// небольшой подъём, расфокус → резкость), без вспышек.
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FPS } from "../engines/MirrorDimensionsEngine";
import { PALETTE } from "../engines/MirrorLightingSystem";
import { clamp, seg } from "../utils/math";

export const SANS = "Manrope, sans-serif";
export const SERIF = "'PT Serif', serif";

const shadow = "0 2px 18px rgba(4, 10, 22, 0.55), 0 1px 3px rgba(4, 10, 22, 0.6)";

/** Окно появления: вход [a, a+fi], выход [b-fo, b]. */
const reveal = (t: number, a: number, b: number, fi = 0.6, fo = 0.6) => seg(t, a, a + fi) * (1 - seg(t, b - fo, b));

export const useT = () => useCurrentFrame() / FPS;

export const Caption: React.FC<{
  t: number;
  from: number;
  to: number;
  top: number; // % высоты
  children: React.ReactNode;
  size?: number;
  align?: "center" | "left";
  left?: number;
  accent?: boolean;
}> = ({ t, from, to, top, children, size = 46, align = "center", left, accent }) => {
  const k = reveal(t, from, to);
  if (k <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: `${top}%`,
        left: left !== undefined ? `${left}%` : 70,
        right: left !== undefined ? undefined : 70,
        textAlign: align,
        fontFamily: SANS,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.2,
        letterSpacing: 0.5,
        color: accent ? PALETTE.gold : PALETTE.milk,
        textShadow: shadow,
        opacity: k,
        transform: `translateY(${(1 - k) * 18}px)`,
        filter: `blur(${(1 - k) * 6}px)`,
      }}
    >
      <span style={{ display: "inline-block", padding: "14px 30px 16px", borderRadius: 28, background: "rgba(7, 19, 34, 0.42)", boxShadow: "0 10px 40px rgba(7, 19, 34, 0.25)" }}>
        {children}
      </span>
    </div>
  );
};

/** Подпись-метка на объекте (ДЕНЬ / НОЧЬ): короткая линия + слово. */
export const Label: React.FC<{ t: number; from: number; to: number; x: number; y: number; text: string; color: string; side: "left" | "right" }> = ({
  t,
  from,
  to,
  x,
  y,
  text,
  color,
  side,
}) => {
  const k = reveal(t, from, to, 0.5, 0.5);
  if (k <= 0) return null;
  const line = 70 * seg(t, from, from + 0.6);
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(${side === "left" ? "-100%" : "0"}, -50%)`,
        display: "flex",
        flexDirection: side === "left" ? "row" : "row-reverse",
        alignItems: "center",
        gap: 16,
        opacity: k,
      }}
    >
      <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 58, letterSpacing: 6, color, textShadow: shadow }}>{text}</span>
      <span style={{ width: line, height: 3, borderRadius: 2, background: color, boxShadow: shadow }} />
    </div>
  );
};

/** Цитата перевода смысла аята: крупно, неподвижно, на мягкой подложке. */
export const QuranQuote: React.FC<{ t: number; from: number; to: number }> = ({ t, from, to }) => {
  const k = reveal(t, from, to, 1.0, 0.9);
  if (k <= 0) return null;
  const k2 = reveal(t, from + 0.9, to, 0.9, 0.9);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: "29%" }}>
      <div
        style={{
          width: 900,
          padding: "56px 54px 48px",
          borderRadius: 36,
          background: "linear-gradient(180deg, rgba(7,19,34,0.62), rgba(7,19,34,0.48))",
          border: "1px solid rgba(231,188,113,0.35)",
          boxShadow: "0 30px 80px rgba(2,6,14,0.45)",
          opacity: k,
          textAlign: "center",
        }}
      >
        <div style={{ width: 70, height: 3, background: PALETTE.gold, borderRadius: 2, margin: "0 auto 34px", opacity: 0.9 }} />
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 78, lineHeight: 1.18, color: PALETTE.milk, letterSpacing: 0.3 }}>
          «Господь наш!
          <br />
          Ты не сотворил
          <br />
          это понапрасну»
        </div>
        <div style={{ marginTop: 38, opacity: k2, fontFamily: SANS, fontWeight: 500, fontSize: 34, lineHeight: 1.35, color: PALETTE.silver }}>
          Сура «Аль-Имран», 3:191
          <br />
          <span style={{ fontSize: 28, color: "rgba(200,220,232,0.8)" }}>Часть аята. Перевод смысла (Э. Кулиев)</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Финальная типографическая заставка (официального логотипа в проекте нет). */
export const MuslimKidsTitle: React.FC<{ t: number; from: number }> = ({ t, from }) => {
  const k = seg(t, from, from + 1.0);
  if (k <= 0) return null;
  const spacing = 18 - 8 * k;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: "62%", textAlign: "center", opacity: k, filter: `blur(${(1 - k) * 8}px)` }}>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 92, letterSpacing: spacing, color: PALETTE.milk, textShadow: shadow }}>
        MUSLIM <span style={{ color: PALETTE.gold }}>KIDS</span>
      </div>
      <div
        style={{
          margin: "22px auto 0",
          width: `${clamp(k) * 360}px`,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${PALETTE.turquoise}, transparent)`,
        }}
      />
    </div>
  );
};
