// Сцена 1, хук. Крупный калькулятор: на табло «1 сапар», рядом пустая графа
// «Убакыт» со знаком вопроса; полоска времени начинает заполняться, стрелка
// часов бежит. В конце сцены калькулятор уменьшается в угол — открывается
// таблица (сцена 2).
import { fontFamily } from "../../../fonts";
import { ClockIcon, easeInOut, easeOut, NAVY, NAVY_SOFT, popScale, prog, TimeBar, YELLOW, YELLOW_SOFT } from "../art";
import type { Bg04Beats } from "../beats";
import { BG04_TEXT } from "../script";

const T = BG04_TEXT.calc;
const KEYS = ["7", "8", "9", "÷", "4", "5", "6", "×", "1", "2", "3", "−", "0", ",", "=", "+"];

export const Calculator: React.FC<{ readonly t: number; readonly b: Bg04Beats }> = ({ t, b }) => {
  const h = b.hook;
  const enter = easeOut(prog(t, h.from, 0.5));
  const exit = easeInOut(prog(t, h.to - 0.45, 0.5));
  const scale = (0.86 + 0.14 * enter) * (1 - 0.72 * exit);
  // уменьшается в правый верхний угол — к заголовку таблицы
  const x = 360 * exit;
  const y = -640 * exit;
  const press = (at: number) => {
    const u = prog(t, at, 0.22);
    return u > 0 && u < 1 ? Math.sin(u * Math.PI) : 0;
  };
  const pressedAt: Record<string, number> = { "1": h.keys[0], "=": h.equals };
  const typedOne = t >= h.keys[0];
  const typedTrips = prog(t, h.keys[1], 0.5);
  const tripsText = T.trips.slice(0, 2 + Math.round((T.trips.length - 2) * typedTrips));
  const fill = easeInOut(prog(t, h.count, Math.max(1.5, h.to - h.count - 0.3)));
  const ask = easeOut(prog(t, h.ask, 0.35));
  const blink = Math.floor(t * 2.2) % 2 === 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 170,
        top: 300,
        width: 740,
        height: 1080,
        transform: `translate(${x}px, ${y}px) scale(${scale})`,
        transformOrigin: "50% 50%",
        opacity: Math.min(enter * 1.5, Math.pow(1 - exit, 2)),
        fontFamily,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 64,
          backgroundColor: NAVY,
          boxShadow: "0 40px 80px rgba(20,40,75,0.35), inset 0 -14px 0 rgba(0,0,0,0.18)",
        }}
      />
      {/* табло */}
      <div
        style={{
          position: "absolute",
          left: 44,
          right: 44,
          top: 46,
          height: 360,
          borderRadius: 34,
          background: "linear-gradient(#EAF6E4, #D4EBCB)",
          boxShadow: "inset 0 6px 0 rgba(0,0,0,0.12)",
          padding: "22px 34px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "flex-end", gap: 18, height: 150 }}>
          <span style={{ fontSize: 150, fontWeight: 1000, color: NAVY, lineHeight: 1, transform: `scale(${typedOne ? popScale(prog(t, h.keys[0], 0.3)) : 0})`, display: "inline-block" }}>1</span>
          <span style={{ fontSize: 92, fontWeight: 1000, color: NAVY, lineHeight: 1, minWidth: 330 }}>
            {typedOne ? tripsText.slice(2) : ""}
            {typedOne && typedTrips < 1 && blink ? "|" : ""}
          </span>
        </div>
        {/* пустая графа «Убакыт» */}
        <div style={{ marginTop: 26, display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ fontSize: 50, fontWeight: 1000, color: NAVY_SOFT }}>{T.time}</div>
          <div
            style={{
              flex: 1,
              height: 92,
              borderRadius: 18,
              border: `4px dashed ${ask > 0 ? NAVY : "#9DB39A"}`,
              backgroundColor: "rgba(255,255,255,0.6)",
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "0 18px",
              boxSizing: "border-box",
            }}
          >
            <ClockIcon size={56} turn={fill * 1440} />
            <TimeBar width={250} u={fill} height={28} />
            <div style={{ fontSize: 64, fontWeight: 1000, color: "#E8463A", transform: `scale(${popScale(ask)})`, opacity: ask }}>{T.empty}</div>
          </div>
        </div>
      </div>
      {/* клавиши */}
      <div style={{ position: "absolute", left: 44, right: 44, top: 450, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 22 }}>
        {KEYS.map((k) => {
          const p = pressedAt[k] !== undefined ? press(pressedAt[k]) : 0;
          const op = k === "÷" || k === "×" || k === "−" || k === "+";
          const eq = k === "=";
          return (
            <div
              key={k}
              style={{
                height: 128,
                borderRadius: 30,
                backgroundColor: eq ? YELLOW : op ? "#2C4472" : "#F3F6FB",
                color: eq || !op ? NAVY : "#FFFFFF",
                fontSize: 64,
                fontWeight: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 ${10 - p * 8}px 0 ${eq ? "#C99A10" : op ? "#1A2D52" : "#B9C4D6"}`,
                transform: `translateY(${p * 8}px)`,
                outline: p > 0 ? `6px solid ${YELLOW_SOFT}` : undefined,
              }}
            >
              {k}
            </div>
          );
        })}
      </div>
    </div>
  );
};
