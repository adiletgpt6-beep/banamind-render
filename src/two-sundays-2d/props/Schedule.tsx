// Рабочий календарь папы на среду (экран домашнего ноутбука, вид через
// плечо): заголовок «Шаршемби», ряд блоков времени. Школьные поездки —
// заранее выделенные окна среди обычных задач (оранжевые), а не свободный
// день. hi — 0…1 подсветка блока «Мектептен алып келүү»; saved — 0…1 метка
// «Сакталды».
import { SU2_TEXT } from "../script";
import { C, F } from "../theme";

export const ScheduleScreen: React.FC<{ readonly w: number; readonly h: number; readonly hi?: number; readonly saved?: number; readonly typed?: number }> = ({ w, h, hi = 0, saved = 0, typed = 1 }) => {
  const d = SU2_TEXT.dadDay;
  const rowH = (h - 150) / d.blocks.length;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, backgroundColor: "#F7F8FB", overflow: "hidden", borderRadius: 10 }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: w, height: 110, backgroundColor: C.navy }} />
      <div style={{ position: "absolute", left: 40, top: 22, fontFamily: F.display, fontWeight: 900, fontSize: 60, color: C.white }}>{d.title}</div>
      {saved > 0 ? (
        <div style={{ position: "absolute", right: 30, top: 32, fontFamily: F.text, fontWeight: 800, fontSize: 34, color: "#7FE0A6", opacity: saved }}>✓ Сакталды</div>
      ) : null}
      {d.blocks.map((b, i) => {
        const y = 130 + i * rowH;
        const isPick = b.text === "Мектептен алып келүү";
        const bg = b.school ? (isPick ? `rgba(242,106,33,${0.75 + 0.25 * hi})` : "rgba(242,106,33,0.55)") : "#E3E8F2";
        const textW = !b.school && i === 1 ? Math.max(0, Math.min(1, typed)) : 1;
        return (
          <div key={b.time} style={{ position: "absolute", left: 20, top: y, width: w - 40, height: rowH - 14 }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: 140, fontFamily: F.text, fontWeight: 800, fontSize: 36, color: C.inkSoft, lineHeight: `${rowH - 14}px` }}>{b.time}</div>
            <div
              style={{
                position: "absolute",
                left: 150,
                top: 0,
                width: w - 210,
                height: rowH - 14,
                backgroundColor: bg,
                borderRadius: 16,
                border: isPick ? `${4 + 4 * hi}px solid ${C.orange}` : "none",
                boxSizing: "border-box",
                padding: "0 24px",
                fontFamily: F.text,
                fontWeight: 800,
                fontSize: 40,
                lineHeight: `${rowH - 14 - (isPick ? 8 : 0)}px`,
                color: b.school ? C.white : C.navy,
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ display: "inline-block", clipPath: `inset(0 ${(1 - textW) * 100}% 0 0)` }}>{b.text}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
