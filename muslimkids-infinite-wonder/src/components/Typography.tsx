// Типографика поверх 3D: подписи с выносками, бейджи увеличения,
// цитата перевода смысла аята и финальная заставка.
import { continueRender, delayRender, staticFile } from "remotion";
import { PALETTE } from "../engines/LightingSystem";

export const FONT = "Nunito";

let fontRequested = false;
/** Nunito (OFL) из public/fonts — рендер не зависит от сети. */
export function loadFont() {
  if (fontRequested || typeof document === "undefined") return;
  fontRequested = true;
  const handle = delayRender("Шрифт Nunito");
  const face = new FontFace(FONT, `url(${staticFile("fonts/Nunito-Variable.ttf")})`, { weight: "200 1000" });
  face
    .load()
    .then((f) => {
      (document.fonts as unknown as { add: (f: FontFace) => void }).add(f);
      continueRender(handle);
    })
    .catch(() => continueRender(handle));
}

type Pt = { x: number; y: number };

/** Подпись-«пилюля» с выноской к точке на объекте. */
export const Callout: React.FC<{
  text: string;
  at: Pt;
  anchor?: Pt;
  opacity: number;
  align?: "left" | "right" | "center";
  size?: number;
}> = ({ text, at, anchor, opacity, align = "left", size = 38 }) => {
  if (opacity <= 0.001) return null;
  const tx = align === "center" ? "-50%" : align === "right" ? "-100%" : "0%";
  const lift = (1 - opacity) * 14;
  return (
    <>
      {anchor ? (
        <svg style={{ position: "absolute", inset: 0, overflow: "visible", opacity }} width="100%" height="100%">
          <line
            x1={at.x}
            y1={at.y}
            x2={anchor.x}
            y2={anchor.y}
            stroke={PALETTE.gold}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={`${Math.hypot(at.x - anchor.x, at.y - anchor.y) * opacity} 2000`}
          />
          <circle cx={anchor.x} cy={anchor.y} r={9 * opacity} fill={PALETTE.gold} stroke={PALETTE.milk} strokeWidth={3} />
        </svg>
      ) : null}
      <div
        style={{
          position: "absolute",
          left: at.x,
          top: at.y,
          transform: `translate(${tx}, calc(-50% + ${lift}px))`,
          opacity,
          padding: `${size * 0.32}px ${size * 0.62}px`,
          borderRadius: 999,
          background: "rgba(8, 21, 38, 0.74)",
          border: `2px solid rgba(239, 196, 117, 0.85)`,
          color: PALETTE.milk,
          fontFamily: FONT,
          fontWeight: 850,
          fontSize: size,
          letterSpacing: "0.06em",
          whiteSpace: "nowrap",
          boxShadow: "0 8px 30px rgba(8,21,38,0.35)",
        }}
      >
        {text}
      </div>
    </>
  );
};

/** Бейдж «УВЕЛИЧЕННАЯ СХЕМА / МОДЕЛЬ» — честная пометка масштаба. */
export const ScaleBadge: React.FC<{ text: string; opacity: number }> = ({ text, opacity }) => {
  if (opacity <= 0.001) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: 250,
        left: "50%",
        transform: `translate(-50%, ${(1 - opacity) * -16}px)`,
        opacity,
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "16px 34px",
        borderRadius: 999,
        background: "rgba(247, 243, 233, 0.94)",
        color: PALETTE.night,
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 36,
        letterSpacing: "0.08em",
        whiteSpace: "nowrap",
        boxShadow: "0 10px 40px rgba(8,21,38,0.35)",
      }}
    >
      <svg width="44" height="44" viewBox="0 0 44 44">
        <circle cx="18" cy="18" r="13" fill="none" stroke={PALETTE.sapphire} strokeWidth="5" />
        <line x1="28" y1="28" x2="40" y2="40" stroke={PALETTE.sapphire} strokeWidth="6" strokeLinecap="round" />
        <line x1="12" y1="18" x2="24" y2="18" stroke={PALETTE.emerald} strokeWidth="4" strokeLinecap="round" />
        <line x1="18" y1="12" x2="18" y2="24" stroke={PALETTE.emerald} strokeWidth="4" strokeLinecap="round" />
      </svg>
      {text}
    </div>
  );
};

/**
 * Цитата перевода смысла аята — отдельный неподвижный слой:
 * текст не деформируется, не вращается и не превращается в краску.
 */
export const QuranCard: React.FC<{ opacity: number }> = ({ opacity }) => {
  if (opacity <= 0.001) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: 236,
        left: 70,
        right: 70,
        opacity,
        textAlign: "center",
        fontFamily: FONT,
        color: PALETTE.night,
      }}
    >
      <div style={{ width: 120, height: 4, margin: "0 auto 26px", background: PALETTE.gold, borderRadius: 4 }} />
      <div
        style={{
          fontWeight: 900,
          fontSize: 74,
          lineHeight: 1.13,
          letterSpacing: "0.01em",
          textShadow: "0 0 26px rgba(247,243,233,0.95), 0 0 6px rgba(247,243,233,0.9)",
        }}
      >
        «Господь наш!
        <br />
        Ты не сотворил
        <br />
        это понапрасну»
      </div>
      <div
        style={{
          marginTop: 24,
          fontWeight: 700,
          fontSize: 31,
          lineHeight: 1.35,
          color: PALETTE.sapphire,
          textShadow: "0 0 18px rgba(247,243,233,0.95)",
        }}
      >
        Сура «Аль-Имран», 3:191
        <br />
        Часть аята. Перевод смысла
      </div>
    </div>
  );
};

/** Финал: типографическая заставка (без выдуманного логотипа). */
export const EndingCard: React.FC<{ opacity: number; t: number }> = ({ opacity, t }) => {
  if (opacity <= 0.001) return null;
  const q = Math.min(1, Math.max(0, (t - 58.6) / 0.6));
  return (
    <div style={{ position: "absolute", top: 250, left: 0, right: 0, textAlign: "center", fontFamily: FONT }}>
      <div
        style={{
          opacity,
          transform: `translateY(${(1 - opacity) * 18}px)`,
          fontWeight: 1000,
          fontSize: 104,
          letterSpacing: "0.1em",
          color: PALETTE.sapphire,
          textShadow: "0 0 30px rgba(247,243,233,0.95)",
        }}
      >
        MUSLIM <span style={{ color: PALETTE.emerald }}>KIDS</span>
      </div>
      <div style={{ width: 90 * opacity, height: 5, margin: "8px auto 30px", background: PALETTE.gold, borderRadius: 5 }} />
      <div
        style={{
          opacity: q,
          transform: `translateY(${(1 - q) * 14}px)`,
          fontWeight: 900,
          fontSize: 58,
          letterSpacing: "0.03em",
          color: PALETTE.night,
          textShadow: "0 0 24px rgba(247,243,233,0.95)",
        }}
      >
        А ЧТО УДИВЛЯЕТ ТЕБЯ?
      </div>
    </div>
  );
};
