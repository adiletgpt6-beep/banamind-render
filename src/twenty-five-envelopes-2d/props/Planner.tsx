// Рабочий недельный планер (бумажный лист или экран): пять дней по
// столбцам, часы по строкам, карточки встреч. Один согласованный пример:
// уроки Аяна заканчиваются в 13:00, а встреча тоже в 13:00. Карточку можно
// переносить (dx, dy — смещение в px от её клетки).
import { TE2_TEXT } from "../script";
import { C, F } from "../theme";

export const PLAN_HOURS = ["09:00", "11:00", "13:00", "15:00", "17:00"] as const;
export const PLAN = { x0: 130, y0: 120, colW: 150, rowH: 120, w: 900, h: 760 } as const;

export type PlanCard = { readonly day: number; readonly hour: number; readonly text: string; readonly color: string; readonly dx?: number; readonly dy?: number; readonly hi?: number };

export const cellAt = (day: number, hour: number) => ({ x: PLAN.x0 + day * PLAN.colW, y: PLAN.y0 + hour * PLAN.rowH });

export const Planner: React.FC<{ readonly title: string; readonly cards: readonly PlanCard[]; readonly dayHi?: number; readonly tint?: string }> = ({ title, cards, dayHi = -1, tint = C.blue }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: PLAN.w, height: PLAN.h, backgroundColor: "#FFFDF7", borderRadius: 14, boxShadow: "0 14px 30px rgba(40,28,14,0.25)", overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: PLAN.w, height: 64, backgroundColor: tint }} />
    <div style={{ position: "absolute", left: 24, top: 12, fontFamily: F.text, fontWeight: 800, fontSize: 32, color: "#FFFFFF" }}>{title}</div>
    {TE2_TEXT.days.week.map((d, i) => (
      <div key={d} style={{ position: "absolute", left: PLAN.x0 + i * PLAN.colW, top: 72, width: PLAN.colW, textAlign: "center", fontFamily: F.text, fontWeight: 800, fontSize: 21, color: i === dayHi ? C.navy : C.inkSoft, backgroundColor: i === dayHi ? C.yellow : "transparent", borderRadius: 8, padding: "4px 0" }}>
        {d}
      </div>
    ))}
    {PLAN_HOURS.map((h, r) => (
      <div key={h}>
        <div style={{ position: "absolute", left: 18, top: PLAN.y0 + r * PLAN.rowH + 20, fontFamily: F.text, fontWeight: 800, fontSize: 26, color: C.inkSoft }}>{h}</div>
        <div style={{ position: "absolute", left: PLAN.x0, top: PLAN.y0 + r * PLAN.rowH, width: PLAN.colW * 5, height: 2, backgroundColor: "#E6E0D2" }} />
      </div>
    ))}
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <div key={i} style={{ position: "absolute", left: PLAN.x0 + i * PLAN.colW, top: PLAN.y0, width: 2, height: PLAN.rowH * 5, backgroundColor: "#EEE8DC" }} />
    ))}
    {cards.map((c, i) => {
      const p = cellAt(c.day, c.hour);
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.x + 8 + (c.dx ?? 0),
            top: p.y + 10 + (c.dy ?? 0),
            width: PLAN.colW - 16,
            height: PLAN.rowH - 20,
            borderRadius: 12,
            backgroundColor: c.color,
            boxShadow: c.dx || c.dy ? "0 10px 18px rgba(40,28,14,0.25)" : "none",
            outline: c.hi ? `${5 * c.hi}px solid ${C.yellow}` : "none",
            padding: "8px 10px",
            boxSizing: "border-box",
            fontFamily: F.text,
            fontWeight: 800,
            fontSize: 21,
            lineHeight: 1.15,
            color: "#FFFFFF",
          }}
        >
          {c.text}
        </div>
      );
    })}
  </div>
);
