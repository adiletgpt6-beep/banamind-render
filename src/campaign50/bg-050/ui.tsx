// Общая графика поверх сцен BG-050: пометка «Шарттуу мисал», номер и
// подпись ответа, жёлтый штрих-маркер, карточка вопроса. Всё кыргызча,
// в безопасной зоне Reels (сверху ≥ 220 px, снизу ≥ 400 px, справа ≥ 150 px).
import { fontFamily } from "../../fonts";
import { C } from "./palette";
import { clamp, easeOut } from "./rig/motion";
import { BG50_TEXT } from "./script";

export const appear = (f: number, at: number, d = 10) => easeOut((f - at) / d);

// Пометка «Шарттуу мисал» (условный пример) — всё время, пока видны
// художественные сцены с персонажами.
export const ExampleChip: React.FC<{ readonly a?: number; readonly dark?: boolean }> = ({ a = 1, dark }) =>
  a <= 0.01 ? null : (
    <div
      style={{
        position: "absolute",
        left: 56,
        top: 228,
        padding: "8px 20px 9px",
        borderRadius: 999,
        backgroundColor: dark ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.92)",
        border: dark ? "2px solid rgba(255,255,255,0.45)" : "2px solid #DCE3EE",
        color: dark ? "#FFFFFF" : C.muted,
        fontFamily,
        fontSize: 28,
        fontWeight: 800,
        letterSpacing: 0.5,
        opacity: a,
        boxShadow: dark ? undefined : "0 6px 16px rgba(20,40,90,0.08)",
      }}
    >
      {BG50_TEXT.example}
    </div>
  );

// Номер и подпись ответа: жёлтый круг с цифрой и белая плашка.
// out — кадр, с которого подпись плавно гаснет (перед стыком сцен).
export const AnswerLabel: React.FC<{ readonly n: number; readonly f: number; readonly at?: number; readonly y?: number; readonly out?: number }> = ({ n, f, at = 0, y = 296, out = Infinity }) => {
  const a = appear(f, at, 12) * (1 - clamp((f - out) / 8));
  if (a <= 0.01) return null;
  const label = BG50_TEXT.answers[n - 1].label;
  return (
    <div style={{ position: "absolute", left: 56, top: y, display: "flex", alignItems: "center", gap: 16, opacity: a, translate: `${(1 - a) * -40}px 0` }}>
      <div
        style={{
          width: 86,
          height: 86,
          borderRadius: 43,
          backgroundColor: C.yellow,
          color: C.navy,
          fontFamily,
          fontSize: 54,
          fontWeight: 900,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 8px 0 ${C.yellowDeep}, 0 16px 26px rgba(20,40,90,0.18)`,
        }}
      >
        {n}
      </div>
      <div
        style={{
          padding: "14px 28px 16px",
          borderRadius: 26,
          backgroundColor: "rgba(255,255,255,0.95)",
          color: C.navy,
          fontFamily,
          fontSize: 46,
          fontWeight: 900,
          boxShadow: "0 12px 30px rgba(20,40,90,0.16)",
          maxWidth: 760,
        }}
      >
        {label}
      </div>
    </div>
  );
};

// Жёлтый маркерный штрих с надписью: рисуется слева направо.
export const BrushStroke: React.FC<{ readonly text: string; readonly f: number; readonly at: number; readonly x: number; readonly y: number; readonly w: number; readonly rot?: number; readonly out?: number }> = ({
  text,
  f,
  at,
  x,
  y,
  w,
  rot = -3,
  out = Infinity,
}) => {
  const p = clamp((f - at) / 14);
  const fade = 1 - clamp((f - out) / 8);
  if (p <= 0 || fade <= 0) return null;
  const txt = appear(f, at + 8, 10);
  const h = 128;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, rotate: `${rot}deg`, opacity: fade }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <defs>
          <clipPath id={`brush-${at}`}>
            <rect x={0} y={-20} width={w * easeOut(p)} height={h + 40} />
          </clipPath>
        </defs>
        <g clipPath={`url(#brush-${at})`}>
          <path
            d={`M 8 ${h * 0.34} C ${w * 0.3} ${h * 0.18} ${w * 0.7} ${h * 0.22} ${w - 6} ${h * 0.3} L ${w - 14} ${h * 0.78} C ${w * 0.68} ${h * 0.86} ${w * 0.3} ${h * 0.8} 14 ${h * 0.86} Z`}
            fill={C.yellow}
          />
          <path d={`M 20 ${h * 0.82} C ${w * 0.4} ${h * 0.92} ${w * 0.7} ${h * 0.86} ${w - 30} ${h * 0.9}`} stroke={C.yellowDeep} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.6} />
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily,
          fontSize: 62,
          fontWeight: 900,
          letterSpacing: 1,
          color: C.navy,
          opacity: txt,
          transform: `scale(${0.9 + 0.1 * txt})`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

// Маленькая плашка-подпись внутри плитки мозаики.
// right — отступ справа (у правой колонки мозаики текст не заходит под
// кнопки Reels: правее x = 930 только изображение).
export const TileCaption: React.FC<{ readonly n: number; readonly a?: number; readonly scale?: number; readonly right?: number }> = ({ n, a = 1, scale = 1, right = 14 }) =>
  a <= 0.01 ? null : (
    <div
      style={{
        position: "absolute",
        left: 14 * scale,
        right: right * scale,
        bottom: 14 * scale,
        display: "flex",
        alignItems: "center",
        gap: 10 * scale,
        padding: `${10 * scale}px ${14 * scale}px`,
        borderRadius: 18 * scale,
        backgroundColor: "rgba(255,255,255,0.94)",
        boxShadow: "0 6px 16px rgba(20,40,90,0.16)",
        opacity: a,
        fontFamily,
      }}
    >
      <div
        style={{
          flex: "none",
          width: 44 * scale,
          height: 44 * scale,
          borderRadius: 22 * scale,
          backgroundColor: C.yellow,
          color: C.navy,
          fontSize: 28 * scale,
          fontWeight: 900,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {n}
      </div>
      <div style={{ fontSize: 27 * scale, fontWeight: 900, color: C.navy, lineHeight: 1.12 }}>{BG50_TEXT.answers[n - 1].label}</div>
    </div>
  );
