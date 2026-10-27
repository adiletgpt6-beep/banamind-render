// «Плёнка» BG-041: постоянные элементы кадра до финала.
//   • плашка «Шарттуу мисал» — всё время, пока виден условный пример;
//   • пульт плёнки: ◀◀ АРТКА / ❚❚ / ▶ / ▶▶ и часы эпизода;
//   • шкала «БАШЫ ←→ АЯГЫ»: головка идёт справа налево — история
//     рассказывается с конца; в финале цепочка пробегает вперёд;
//   • приметы перемотки поверх сцены (строки развёртки, бегущая полоса) —
//     мягкие, без вспышек и затемнения.
import { fontFamily } from "../../fonts";
import { box, clamp01, easeInOut, NAVY, NAVY_SOFT, PauseIcon, PlayIcon, RewIcon, YELLOW } from "./art";
import type { TapeMode } from "./kit";
import { BG41_TEXT } from "./script";

// Отметки глав на шкале (0 — начало истории, 1 — её конец).
export const CHAPTER_POS = { start: 0, group: 0.25, decision: 0.5, route: 0.75, evening: 1 } as const;

export type HudState = {
  readonly mode: TapeMode;
  readonly speed?: number;
  readonly clock?: string; // «19:30» и т. п.
  readonly pos: number; // головка на шкале 0…1
  readonly lit?: number; // 0…1: цепочка вперёд «загорелась» (финал истории)
  readonly opacity?: number;
};

const T = BG41_TEXT;

export const Badge: React.FC<{ readonly opacity?: number }> = ({ opacity = 1 }) => (
  <div
    style={box({
      left: 54,
      top: 236,
      padding: "10px 22px 11px",
      borderRadius: 30,
      backgroundColor: "rgba(255,255,255,0.94)",
      border: `3px dashed ${NAVY_SOFT}`,
      color: NAVY,
      fontFamily,
      fontSize: 32,
      fontWeight: 900,
      letterSpacing: 0.5,
      boxShadow: "0 6px 16px rgba(20,40,75,0.14)",
      opacity,
    })}
  >
    {T.badge}
  </div>
);

export const Hud: React.FC<{ readonly s: HudState; readonly f: number }> = ({ s, f }) => {
  const o = s.opacity ?? 1;
  if (o <= 0) return null;
  const icon =
    s.mode === "rew" ? <RewIcon size={34} /> : s.mode === "pause" ? <PauseIcon size={32} /> : <PlayIcon size={34} double={s.mode === "ff"} />;
  const label = s.mode === "rew" ? T.hud.rew : null;
  // мигающая точка «запись/перемотка»
  const dot = s.mode === "rew" ? 0.55 + 0.45 * Math.round((Math.sin(f / 4) + 1) / 2) : 0;
  const L = 96;
  const R = 984;
  const px = L + (R - L) * clamp01(s.pos);
  const lit = clamp01(s.lit ?? 0);
  return (
    <div style={box({ inset: 0, opacity: o, fontFamily, pointerEvents: "none" })}>
      <Badge />
      {/* пульт */}
      <div
        style={box({
          right: 56,
          top: 232,
          height: 64,
          padding: "0 22px",
          borderRadius: 32,
          backgroundColor: NAVY,
          display: "flex",
          alignItems: "center",
          gap: 14,
          color: "#FFFFFF",
          boxShadow: "0 6px 16px rgba(20,40,75,0.22)",
        })}
      >
        {s.mode === "rew" ? <div style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: "#FF6B5E", opacity: dot }} /> : null}
        {icon}
        {label ? <span style={{ fontSize: 30, fontWeight: 1000, letterSpacing: 2 }}>{label}</span> : null}
        {s.mode === "rew" && (s.speed ?? 1) > 1.5 ? <span style={{ fontSize: 26, fontWeight: 900, color: YELLOW }}>×{Math.round(s.speed ?? 1)}</span> : null}
        {s.clock ? (
          <span style={{ fontSize: 34, fontWeight: 1000, fontVariantNumeric: "tabular-nums", marginLeft: 6, paddingLeft: 14, borderLeft: "2px solid rgba(255,255,255,0.3)" }}>
            {s.clock}
          </span>
        ) : null}
      </div>
      {/* шкала БАШЫ ←→ АЯГЫ */}
      <div style={box({ left: L, width: R - L, top: 330, height: 6, borderRadius: 3, backgroundColor: "rgba(20,40,75,0.18)" })} />
      <div style={box({ left: px, width: Math.max(0, R - px), top: 330, height: 6, borderRadius: 3, backgroundColor: YELLOW, boxShadow: `0 0 0 2px rgba(20,40,75,0.25)` })} />
      {lit > 0 ? <div style={box({ left: L, width: (R - L) * lit, top: 330, height: 6, borderRadius: 3, backgroundColor: YELLOW, boxShadow: `0 0 0 2px ${NAVY}` })} /> : null}
      {Object.values(CHAPTER_POS).map((p) => (
        <div key={p} style={box({ left: L + (R - L) * p - 7, top: 326, width: 14, height: 14, borderRadius: 7, backgroundColor: "#FFFFFF", border: `3px solid ${NAVY_SOFT}`, boxSizing: "border-box" })} />
      ))}
      <div style={box({ left: px - 17, top: 316, width: 34, height: 34, borderRadius: 17, backgroundColor: YELLOW, border: `5px solid ${NAVY}`, boxSizing: "border-box", boxShadow: "0 3px 8px rgba(20,40,75,0.3)" })} />
      <div style={box({ left: L - 40, top: 350, width: 160, fontSize: 24, fontWeight: 1000, color: NAVY, letterSpacing: 2, textShadow: "0 0 6px #FFFFFF, 0 0 12px #FFFFFF" })}>{T.hud.start}</div>
      <div style={box({ left: R - 120, top: 350, width: 160, textAlign: "right", fontSize: 24, fontWeight: 1000, color: NAVY, letterSpacing: 2, textShadow: "0 0 6px #FFFFFF, 0 0 12px #FFFFFF" })}>{T.hud.end}</div>
    </div>
  );
};

// Приметы перемотки поверх сцены: строки развёртки, лёгкий холодный
// оттенок, одна бегущая полоса «трекинга». Интенсивность k 0…1.
export const RewFx: React.FC<{ readonly f: number; readonly k: number }> = ({ f, k }) => {
  if (k <= 0) return null;
  const bandY = ((f * 47) % 2300) - 180;
  const band2 = ((f * 29 + 900) % 2300) - 180;
  return (
    <div style={box({ inset: 0, opacity: k, pointerEvents: "none" })}>
      <div style={box({ inset: 0, backgroundColor: "rgba(60,90,170,0.06)" })} />
      <div style={box({ inset: 0, backgroundImage: "repeating-linear-gradient(0deg, rgba(20,40,75,0.07) 0px, rgba(20,40,75,0.07) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 7px)" })} />
      <div style={box({ left: 0, right: 0, top: bandY, height: 46, background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.32) 45%, rgba(255,255,255,0) 100%)" })} />
      <div style={box({ left: 0, right: 0, top: band2, height: 8, backgroundColor: "rgba(255,255,255,0.22)" })} />
    </div>
  );
};

// Подпись главы: жёлтая плашка с тёмно-синим текстом, въезжает справа
// налево (как и вся история — от конца к началу).
export const ChapterLabel: React.FC<{ readonly text: string; readonly u: number; readonly out?: number; readonly top?: number; readonly small?: string }> = ({
  text,
  u,
  out = 0,
  top = 404,
  small,
}) => {
  if (u <= 0 || out >= 1) return null;
  const e = easeInOut(u);
  const o = 1 - easeInOut(out);
  return (
    <div style={box({ left: 0, right: 0, top, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, fontFamily, opacity: Math.min(1, e * 1.5) * o })}>
      <div
        style={{
          transform: `translateX(${(1 - e) * 220}px)`,
          padding: "14px 30px 16px",
          borderRadius: 26,
          backgroundColor: YELLOW,
          color: NAVY,
          fontSize: 50,
          fontWeight: 1000,
          lineHeight: 1.1,
          textAlign: "center",
          maxWidth: 900,
          boxShadow: `0 10px 26px rgba(20,40,75,0.2), inset 0 0 0 4px ${NAVY}`,
        }}
      >
        {text}
      </div>
      {small ? (
        <div style={{ transform: `translateX(${(1 - e) * 160}px)`, padding: "8px 20px", borderRadius: 18, backgroundColor: "rgba(255,255,255,0.95)", color: NAVY, fontSize: 34, fontWeight: 900 }}>{small}</div>
      ) : null}
    </div>
  );
};
