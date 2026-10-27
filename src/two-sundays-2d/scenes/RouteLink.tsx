// Короткая графическая связка «Мектеп → Үй → Кеңсе» (белые карточки с
// мягкой тенью на светло-сером фоне, оранжевые стрелки — по языку
// референса). Появляется между действиями и не заменяет их.
import { AbsoluteFill } from "remotion";
import { clamp, easeInOut } from "../rig/motion";
import { settle } from "../kit";
import { SU2_TEXT } from "../script";
import { C, F } from "../theme";

export const RouteLink: React.FC<{ readonly t: number; readonly active?: number }> = ({ t, active = 2 }) => {
  const items = SU2_TEXT.route3;
  return (
    <AbsoluteFill style={{ backgroundColor: C.paper, alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
        {items.map((it, i) => {
          const k = settle(t - i * 10, 14);
          const arrow = easeInOut(clamp((t - i * 10 - 6) / 10));
          return (
            <div key={it} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  backgroundColor: i === active ? C.navy : C.white,
                  color: i === active ? C.white : C.navy,
                  fontFamily: F.display,
                  fontWeight: 900,
                  fontSize: 92,
                  padding: "26px 64px 32px",
                  borderRadius: 26,
                  boxShadow: `0 18px 36px ${C.shadow}`,
                  opacity: clamp((t - i * 10) / 5),
                  transform: `translateY(${(1 - k) * 60}px)`,
                }}
              >
                {it}
              </div>
              {i < items.length - 1 ? (
                <svg width={80} height={150} viewBox="0 0 80 150">
                  <path d={`M 40 16 L 40 ${16 + 100 * arrow}`} stroke={C.orange} strokeWidth={14} strokeLinecap="round" />
                  {arrow > 0.95 ? <path d="M 16 100 L 40 128 L 64 100" stroke={C.orange} strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
                </svg>
              ) : null}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
