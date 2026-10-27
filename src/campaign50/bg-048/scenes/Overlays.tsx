// Экранные плашки поверх мира (координаты кадра 1080×1920, безопасная
// зона Reels: x 90…930, y 250…1520): бейдж «Кыялдагы тамаша» (наклейка,
// которая при раскрытии отклеивается) и титры сцен в виде стикера.
import { interpolate } from "remotion";
import { fontFamily } from "../fonts";
import { NAVY, YELLOW } from "../palette";
import { B48_TEXT } from "../script";
import { backOut, clamp } from "./common";

// Бейдж фантазии: появляется в начале, при раскрытии (peel 0…1)
// отклеивается за уголок и улетает.
export const FantasyBadge: React.FC<{ readonly t: number; readonly peel?: number }> = ({ t, peel = 0 }) => {
  const inK = interpolate(t, [0.1, 0.5], [0, 1], { ...clamp, easing: backOut });
  if (peel >= 1 || inK <= 0) return null;
  const lift = interpolate(peel, [0, 0.35, 1], [0, 0.25, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 90,
        top: 250,
        transformOrigin: "100% 0%",
        transform: `scale(${inK}) rotate(${-4 - 38 * lift}deg) translate(${-120 * lift}px, ${-260 * lift * lift}px)`,
        opacity: 1 - interpolate(peel, [0.6, 1], [0, 1], clamp),
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 24px 10px 16px",
        borderRadius: 40,
        background: "#FFFFFF",
        border: `5px solid ${YELLOW}`,
        boxShadow: `0 ${8 + 20 * lift}px ${20 + 30 * lift}px rgba(10,20,50,0.35)`,
        fontFamily,
        fontWeight: 1000,
        fontSize: 38,
        color: NAVY,
      }}
    >
      {/* облачко-мысль */}
      <svg width={52} height={40} viewBox="0 0 52 40">
        <path d="M 12 30 Q 2 30 4 21 Q 2 11 13 11 Q 16 2 27 4 Q 37 0 41 10 Q 51 12 48 22 Q 50 31 39 30 Z" fill="#EAF2FF" stroke={NAVY} strokeWidth={3} />
        <circle cx={10} cy={36} r={3} fill={NAVY} />
      </svg>
      {B48_TEXT.fantasy}
    </div>
  );
};

// Титр сцены — жёлтый стикер с мягкой тенью; появляется и исчезает.
export const Caption: React.FC<{
  readonly t: number;
  readonly from: number;
  readonly to: number;
  readonly text: string;
  readonly top: number;
  readonly left?: number;
  readonly rotate?: number;
  readonly fontSize?: number;
}> = ({ t, from, to, text, top, left = 90, rotate = -2, fontSize = 46 }) => {
  const k = Math.min(interpolate(t, [from, from + 0.35], [0, 1], { ...clamp, easing: backOut }), interpolate(t, [to - 0.3, to], [1, 0], clamp));
  if (k <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        transform: `rotate(${rotate}deg) scale(${0.85 + 0.15 * k})`,
        transformOrigin: "0% 50%",
        opacity: Math.min(1, k * 1.4),
        background: YELLOW,
        color: NAVY,
        fontFamily,
        fontWeight: 1000,
        fontSize,
        padding: "14px 30px",
        borderRadius: 18,
        boxShadow: "0 12px 30px rgba(40,30,10,0.28)",
        whiteSpace: "nowrap",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      {text.split(" → ").map((part, i) => (
        <span key={part + i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {i > 0 ? (
            <svg width={fontSize * 0.9} height={fontSize * 0.6} viewBox="0 0 40 26">
              <path d="M 3 13 H 33 M 24 4 L 35 13 L 24 22" stroke={NAVY} strokeWidth={5.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : null}
          {part}
        </span>
      ))}
    </div>
  );
};
