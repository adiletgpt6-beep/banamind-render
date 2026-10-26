// Общие элементы кадра BG-015: метка места/времени, линия дня, пометка
// условной картины. Всё в безопасной зоне Reels (сверху ≥ 250 px).
import { COLORS } from "../../config";
import { fontFamily } from "../../fonts";
import { easeOut } from "../../two-schedules-2d/rig/motion";

export const Chip: React.FC<{ f: number; at?: number; top?: number; left?: number; children: React.ReactNode; dark?: boolean }> = ({ f, at = 0, top = 270, left = 70, children, dark }) => {
  const a = easeOut((f - at) / 10);
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        padding: "12px 26px",
        borderRadius: 999,
        backgroundColor: dark ? "rgba(20,40,90,0.82)" : "rgba(255,255,255,0.94)",
        color: dark ? "#FFFFFF" : COLORS.navy,
        fontFamily,
        fontWeight: 800,
        fontSize: 38,
        boxShadow: "0 8px 24px rgba(20,40,90,0.18)",
        opacity: a,
        translate: `0 ${(1 - a) * -14}px`,
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      {children}
    </div>
  );
};

export const Dot: React.FC<{ color?: string }> = ({ color = COLORS.yellow }) => (
  <span style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: color, display: "inline-block" }} />
);

// Линия рабочего дня 09:00–19:00: школьный отрезок (12:30–14:00)
// подсвечен — «дорога в школу делит рабочий день».
export const DayLine: React.FC<{ f: number; progress: number; show: number }> = ({ f, progress, show }) => {
  const a = easeOut(show);
  const toX = (h: number) => ((h - 9) / 10) * 860;
  const school = [toX(12.5), toX(14)];
  const now = 9 + progress * 10;
  return (
    <div style={{ position: "absolute", left: 70, top: 380, width: 860, height: 110, opacity: a, fontFamily }}>
      <div style={{ position: "absolute", left: 0, top: 46, width: 860, height: 14, borderRadius: 7, backgroundColor: "rgba(255,255,255,0.85)", boxShadow: "0 4px 14px rgba(20,40,90,0.15)" }} />
      <div style={{ position: "absolute", left: 0, top: 46, width: Math.min(toX(now), 860), height: 14, borderRadius: 7, backgroundColor: "#7FA3D1" }} />
      <div
        style={{
          position: "absolute",
          left: school[0],
          top: 40,
          width: (school[1] - school[0]) * Math.min(1, Math.max(0, (now - 12.5) / 1.5)),
          height: 26,
          borderRadius: 8,
          backgroundColor: COLORS.yellow,
        }}
      />
      {[9, 12.5, 14, 19].map((h) => (
        <div key={h} style={{ position: "absolute", left: toX(h) - 50, top: 74, width: 100, textAlign: "center", fontSize: 26, fontWeight: 800, color: "#FFFFFF", textShadow: "0 2px 6px rgba(10,20,50,0.6)" }}>
          {h === 12.5 ? "12:30" : `${String(h).padStart(2, "0")}:00`}
        </div>
      ))}
      <div style={{ position: "absolute", left: toX(Math.min(19, now)) - 13, top: 40, width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.navy, border: "4px solid #FFFFFF", boxSizing: "border-box" }} />
      <div style={{ position: "absolute", left: school[0] - 40, top: 0, width: school[1] - school[0] + 80, textAlign: "center", fontSize: 26, fontWeight: 900, color: "#FFFFFF", textShadow: "0 2px 6px rgba(10,20,50,0.6)", opacity: now > 12.5 ? 1 : 0 }}>
        мектеп жолу
      </div>
      <span style={{ display: "none" }}>{f}</span>
    </div>
  );
};

// Пометка условной картины (обязательная по сценарию).
export const PossibleTag: React.FC<{ a: number; text: string; sub: string }> = ({ a, text, sub }) => (
  <div
    style={{
      position: "absolute",
      left: 70,
      right: 150,
      top: 262,
      padding: "18px 26px",
      borderRadius: 26,
      backgroundColor: "rgba(255,255,255,0.95)",
      border: `4px dashed ${COLORS.navySoft}`,
      fontFamily,
      color: COLORS.navy,
      opacity: a,
      textAlign: "center",
      boxShadow: "0 10px 30px rgba(20,40,90,0.2)",
    }}
  >
    <div style={{ fontSize: 40, fontWeight: 900, lineHeight: 1.15 }}>{text}</div>
    <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.navySoft, marginTop: 4 }}>{sub}</div>
  </div>
);
