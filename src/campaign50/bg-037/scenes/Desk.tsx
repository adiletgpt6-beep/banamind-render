// Общие элементы «конвертных» сцен (вид на стол сверху): светлая
// деревянная столешница, заголовок шага, лист из конверта, бейджи.
import { fontFamily } from "../../../fonts";
import { ArrowText, easeOut, NAVY, popScale, prog, YELLOW } from "../art";
import { PAPER } from "../props";

// Столешница сверху: тёплое светлое дерево, мягкий свет из окна.
export const DeskBg: React.FC<{ readonly t: number; readonly drift?: number }> = ({ t, drift = 0 }) => (
  <div style={{ position: "absolute", inset: -60, transform: `translateY(${-drift * 10}px) scale(${1.04 + drift * 0.01})` }}>
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(170deg, #F1DDBD, #E7CCA3 55%, #E2C397)" }} />
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "repeating-linear-gradient(92deg, rgba(160,110,60,0.07) 0 3px, transparent 3px 46px), repeating-linear-gradient(88deg, rgba(160,110,60,0.05) 0 2px, transparent 2px 140px)",
      }}
    />
    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at ${30 + Math.sin(t * 0.3) * 4}% 18%, rgba(255,250,235,0.65), transparent 55%)` }} />
  </div>
);

// Заголовок шага (жёлтая плашка вверху, в безопасной зоне Reels).
export const StepTitle: React.FC<{ readonly t: number; readonly at: number; readonly text: string; readonly top?: number }> = ({ t, at, text, top = 150 }) => {
  const u = easeOut(prog(t, at, 0.45));
  if (u <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 60, right: 120, top, display: "flex", justifyContent: "center", opacity: u, transform: `translateY(${(1 - u) * -30}px)` }}>
      <div
        style={{
          padding: "18px 34px",
          borderRadius: 30,
          backgroundColor: YELLOW,
          color: NAVY,
          fontFamily,
          fontWeight: 1000,
          fontSize: 56,
          lineHeight: 1.1,
          boxShadow: "0 10px 24px rgba(120,80,20,0.18)",
          display: "flex",
          alignItems: "center",
          whiteSpace: "nowrap",
        }}
      >
        <ArrowText text={text} size={56} />
      </div>
    </div>
  );
};

// Лист из конверта: растёт из конверта в большую карточку.
export const Sheet: React.FC<{ readonly u: number; readonly top: number; readonly height: number; readonly children: React.ReactNode }> = ({ u, top, height, children }) => {
  const k = easeOut(u);
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        width: 940,
        top,
        height,
        borderRadius: 34,
        backgroundColor: PAPER,
        boxShadow: "0 22px 50px rgba(110,70,20,0.22)",
        transform: `translateY(${(1 - k) * -260}px) scale(${0.55 + 0.45 * k})`,
        transformOrigin: "50% 0%",
        opacity: Math.min(1, u * 2.5),
        overflow: "hidden",
        fontFamily,
      }}
    >
      {children}
    </div>
  );
};

// Штамп (поворот + «удар»).
export const Stamp: React.FC<{ readonly t: number; readonly at: number; readonly text: string; readonly color?: string; readonly rot?: number; readonly size?: number; readonly style?: React.CSSProperties }> = ({
  t,
  at,
  text,
  color = "#1F8A4C",
  rot = -6,
  size = 54,
  style,
}) => {
  const u = prog(t, at, 0.35);
  if (u <= 0) return null;
  const s = popScale(u) * (1 + 0.6 * (1 - easeOut(u)));
  return (
    <div style={{ position: "absolute", ...style, transform: `rotate(${rot}deg) scale(${s})`, opacity: Math.min(1, u * 3) }}>
      <div
        style={{
          padding: "14px 30px",
          border: `7px solid ${color}`,
          borderRadius: 22,
          color,
          fontFamily,
          fontWeight: 1000,
          fontSize: size,
          lineHeight: 1.05,
          backgroundColor: "rgba(255,255,255,0.88)",
          whiteSpace: "nowrap",
          letterSpacing: 1,
        }}
      >
        {text}
      </div>
    </div>
  );
};

// Метка «Шарттуу мисал» (условный пример) — видна всё время сцены.
export const SampleTag: React.FC<{ readonly text: string; readonly opacity?: number }> = ({ text, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      right: 140,
      top: 286,
      padding: "8px 20px",
      borderRadius: 18,
      backgroundColor: "rgba(20,40,75,0.82)",
      color: "#FFFFFF",
      fontFamily,
      fontWeight: 900,
      fontSize: 32,
      opacity,
    }}
  >
    {text}
  </div>
);

// Ребёнок-значок (кружок с лицом) для схемы группы.
export const KidToken: React.FC<{ readonly color: string; readonly hair: string; readonly size?: number; readonly dim?: number }> = ({ color, hair, size = 96, dim = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: dim > 0 ? `grayscale(${dim})` : undefined, opacity: 1 - 0.45 * dim }}>
    <circle cx={50} cy={50} r={48} fill={color} />
    <circle cx={50} cy={46} r={26} fill="#E8B48D" />
    <path d="M 24 44 Q 26 18 50 18 Q 74 18 76 44 Q 64 30 50 32 Q 36 30 24 44 Z" fill={hair} />
    <circle cx={41} cy={48} r={3.4} fill="#2A201D" />
    <circle cx={59} cy={48} r={3.4} fill="#2A201D" />
    <path d="M 42 58 Q 50 64 58 58" stroke="#9C4E44" strokeWidth={3} fill="none" strokeLinecap="round" />
    <path d="M 28 88 Q 50 70 72 88" fill="#FFFFFF" opacity={0.85} />
  </svg>
);
