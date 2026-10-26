// TypographySystem — надписи отдельным читаемым слоем поверх 3D.
// Текст никогда не деформируется геометрией: только мягкое появление
// (прозрачность + небольшой подъём + раскрытие геометрической линии).
import { loadFont } from "@remotion/fonts";
import { continueRender, delayRender, staticFile } from "remotion";
import { FONT_FAMILY, PALETTE } from "../styles/palette";
import { ramp, window01 } from "../engines/GeometryWondersEngine";

const handle = delayRender("font");
loadFont({ family: FONT_FAMILY, url: staticFile("fonts/Nunito-Variable.ttf"), weight: "200 1000" })
  .then(() => continueRender(handle))
  .catch(() => continueRender(handle));

export const textShadow = "0 2px 18px rgba(8,21,37,0.75), 0 0 2px rgba(8,21,37,0.6)";

type Pos = { x: number; y: number };

/** Короткая подпись (ДЕНЬ / НОЧЬ): появляется на слово, держится, уходит. */
export const Label: React.FC<{
  t: number;
  at: number;
  until: number;
  text: string;
  pos: Pos;
  color?: string;
  pill?: string;
  size?: number;
}> = ({ t, at, until, text, pos, color = PALETTE.milk, pill, size = 64 }) => {
  const k = window01(t, at, until, 0.45, 0.5);
  if (k <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        transform: `translate(-50%, -50%) translateY(${(1 - k) * 24}px) scale(${0.92 + 0.08 * k})`,
        opacity: k,
        fontFamily: FONT_FAMILY,
        fontWeight: 900,
        fontSize: size,
        letterSpacing: "0.12em",
        color,
        padding: pill ? "10px 34px 12px" : 0,
        borderRadius: 999,
        background: pill,
        textShadow: pill ? "none" : textShadow,
        boxShadow: pill ? "0 8px 30px rgba(8,21,37,0.35)" : "none",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};

/** Заголовок с раскрывающейся золотой линией из ромбов. */
export const Title: React.FC<{
  t: number;
  at: number;
  until: number;
  lines: string[];
  sub?: string[];
  y: number;
  size?: number;
}> = ({ t, at, until, lines, sub, y, size = 74 }) => {
  const k = window01(t, at, until, 0.7, 0.6);
  if (k <= 0) return null;
  const line = ramp(t, at + 0.2, at + 1.1, "inOut");
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", opacity: k, fontFamily: FONT_FAMILY }}>
      {lines.map((l, i) => (
        <div
          key={i}
          style={{
            fontWeight: 900,
            fontSize: size,
            lineHeight: 1.12,
            letterSpacing: "0.04em",
            color: PALETTE.milk,
            textShadow,
            transform: `translateY(${(1 - ramp(t, at + i * 0.12, at + 0.8 + i * 0.12)) * 26}px)`,
          }}
        >
          {l}
        </div>
      ))}
      <Divider k={line} />
      {sub?.map((s, i) => (
        <div
          key={s}
          style={{
            marginTop: i ? 4 : 0,
            fontWeight: i ? 600 : 800,
            fontSize: i ? 32 : 40,
            color: i ? PALETTE.sky : PALETTE.gold,
            textShadow,
            opacity: ramp(t, at + 0.5 + i * 0.15, at + 1.2 + i * 0.15),
          }}
        >
          {s}
        </div>
      ))}
    </div>
  );
};

/** Геометрическая линия-разделитель: ромб в центре и два луча. */
export const Divider: React.FC<{ k: number; width?: number }> = ({ k, width = 420 }) => (
  <svg width={width} height={44} viewBox={`0 0 ${width} 44`} style={{ display: "block", margin: "14px auto 12px" }}>
    <line x1={width / 2 - 26} y1={22} x2={width / 2 - 26 - (width / 2 - 40) * k} y2={22} stroke={PALETTE.gold} strokeWidth={3} strokeLinecap="round" />
    <line x1={width / 2 + 26} y1={22} x2={width / 2 + 26 + (width / 2 - 40) * k} y2={22} stroke={PALETTE.gold} strokeWidth={3} strokeLinecap="round" />
    <polygon
      points={`${width / 2},${22 - 14 * k} ${width / 2 + 14 * k},22 ${width / 2},${22 + 14 * k} ${width / 2 - 14 * k},22`}
      fill={PALETTE.gold}
    />
  </svg>
);
