// Сцена 5: полный круг ҮЙ → МЕКТЕП → ҮЙ (утром к школе, после уроков домой —
// белая машина BalaGo обходит кольцо), затем честные шаги «Арыз → Топ →
// Сыноо»: сервис стартует только после формирования подходящей группы,
// первая полная пробная поездка — бесплатно. Без «завтра всем».
import { fontFamily } from "../../../fonts";
import { ArrowText, BellIcon, CarTop, CheckIcon, easeInOut, easeOut, House, NAVY, NAVY_SOFT, popScale, prog, School, SunIcon, YELLOW, YELLOW_SOFT } from "../art";
import type { Bg04Beats } from "../beats";
import { BG04_TEXT } from "../script";

const T = BG04_TEXT.trial;
const CX = 540;
const CY = 640;
const R = 270;

export const Trial: React.FC<{ readonly t: number; readonly b: Bg04Beats }> = ({ t, b }) => {
  const s = b.trial;
  const enter = easeOut(prog(t, s.from - 0.1, 0.5));
  const exit = easeInOut(prog(t, s.to - 0.35, 0.5));
  // машина обходит кольцо: дом (слева) → школа (справа) по верхней дуге,
  // обратно по нижней; круг рисуется за ней жёлтым
  const loop = easeInOut(prog(t, s.ring, Math.min(4.2, s.steps[2] - s.ring)));
  const ang = Math.PI + loop * 2 * Math.PI; // от 180° по часовой стрелке (экранные координаты)
  const carX = CX + R * Math.cos(ang);
  const carY = CY + R * Math.sin(ang);
  const heading = (ang * 180) / Math.PI + 90;
  const arc = 2 * Math.PI * R;
  const atSchool = loop >= 0.5;
  const steps = T.steps.map((_, i) => easeOut(prog(t, s.steps[i], 0.45)));
  const free = easeOut(prog(t, s.free, 0.4));
  return (
    <div style={{ position: "absolute", inset: 0, opacity: enter * (1 - exit), transform: `translateY(${(1 - enter) * 60}px)`, fontFamily }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 150, display: "flex", justifyContent: "center" }}>
        <div style={{ padding: "16px 40px", borderRadius: 50, backgroundColor: NAVY, color: "#FFFFFF", fontSize: 58, fontWeight: 1000, display: "flex", alignItems: "center", letterSpacing: 2 }}>
          <ArrowText text={T.route} size={52} arrowColor={YELLOW} />
        </div>
      </div>
      <svg width={1080} height={1000} viewBox="0 0 1080 1000" style={{ position: "absolute", left: 0, top: 0 }}>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#E3E8F0" strokeWidth={46} />
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke={YELLOW}
          strokeWidth={46}
          strokeLinecap="round"
          strokeDasharray={`${arc * loop} ${arc}`}
          transform={`rotate(180 ${CX} ${CY})`}
        />
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#FFFFFF" strokeWidth={4} strokeDasharray="22 20" />
        <g transform={`translate(${CX - R} ${CY + 54}) scale(1.7)`}>
          <House glow={!atSchool ? 0.4 : loop >= 0.99 ? 1 : 0} />
        </g>
        <g transform={`translate(${CX + R} ${CY + 64}) scale(1.45)`}>
          <School glow={atSchool && loop < 0.99 ? 1 : 0} />
        </g>
        <CarTop x={carX} y={carY} angle={heading} scale={1.5} />
      </svg>
      {/* подписи дуг */}
      <div style={{ position: "absolute", left: 0, right: 0, top: CY - 125, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 22px", borderRadius: 26, backgroundColor: "#FFFFFF", boxShadow: "0 6px 16px rgba(20,40,75,0.14)", fontSize: 36, fontWeight: 1000, color: NAVY, opacity: easeOut(prog(t, s.ring + 0.2, 0.4)) }}>
          <SunIcon size={42} />
          {T.morning}
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: CY + 60, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 22px", borderRadius: 26, backgroundColor: "#FFFFFF", boxShadow: "0 6px 16px rgba(20,40,75,0.14)", fontSize: 36, fontWeight: 1000, color: NAVY, opacity: easeOut(prog(t, s.ring + 1.4, 0.4)) }}>
          <BellIcon size={42} />
          {T.afternoon}
        </div>
      </div>
      {/* шаги: Арыз → Топ → Сыноо */}
      <div style={{ position: "absolute", left: 56, right: 56, top: 1010, display: "flex", alignItems: "stretch", gap: 0 }}>
        {T.steps.map((st, i) => {
          const u = steps[i];
          const last = i === T.steps.length - 1;
          return (
            <div key={st.title} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div
                style={{
                  flex: 1,
                  height: 330,
                  borderRadius: 32,
                  backgroundColor: last && free > 0 ? YELLOW_SOFT : "#FFFFFF",
                  border: `5px solid ${u > 0.5 ? (last ? YELLOW : NAVY) : "#DCE3EE"}`,
                  boxShadow: "0 14px 34px rgba(20,40,75,0.14)",
                  opacity: Math.max(0.25, u),
                  transform: `scale(${0.9 + 0.1 * popScale(u)})`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "26px 12px",
                  boxSizing: "border-box",
                  textAlign: "center",
                }}
              >
                <div style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: u > 0.5 ? NAVY : "#C9D2E0", color: "#FFFFFF", fontSize: 44, fontWeight: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {u >= 1 && !last ? <CheckIcon size={44} color="#FFFFFF" /> : i + 1}
                </div>
                <div style={{ marginTop: 16, fontSize: 52, fontWeight: 1000, color: NAVY }}>{st.title}</div>
                <div style={{ marginTop: 8, fontSize: 31, fontWeight: 900, color: NAVY_SOFT, lineHeight: 1.15 }}>{st.note}</div>
                {last ? (
                  <div style={{ marginTop: 10, padding: "6px 18px", borderRadius: 18, backgroundColor: "#1E7A44", color: "#FFFFFF", fontSize: 32, fontWeight: 1000, transform: `scale(${popScale(free)})`, opacity: free }}>
                    акысыз
                  </div>
                ) : null}
              </div>
              {!last ? (
                <svg width={44} height={40} viewBox="0 0 22 20" style={{ flexShrink: 0, opacity: steps[i + 1] > 0 ? 1 : 0.3 }}>
                  <path d="M 3 10 L 18 10 M 12 4 L 18 10 L 12 16" fill="none" stroke={NAVY} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
