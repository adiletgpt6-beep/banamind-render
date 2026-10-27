// Бумажная карточка с тремя полями ҮЙ / МЕКТЕП / УБАКЫТ. Пустое поле —
// пунктир и серая иконка; заполненное — цветная иконка и галочка. Время
// «08:00 – 13:00» проявляется слева направо, как написанное карандашом.
// Личных адресов нет: дом и школа отмечены значками.
import { fontFamily } from "../../../fonts";
import { BG47_TEXT } from "../script";
import { clamp } from "./motion";
import { C } from "./palette";
import { Check, FieldIcon } from "./popups";

export const CARD_W = 820;
export const CARD_H = 236;

export const FieldsCard: React.FC<{
  readonly home: number; // 0…1 заполнение
  readonly school: number;
  readonly time: number; // 0…1 — доля написанного времени
  readonly back?: boolean; // обратная (пустая) сторона листа
  readonly highlight?: number; // −1 нет, 0/1/2 — подсветка поля
}> = ({ home, school, time, back = false, highlight = -1 }) => {
  const fields = [
    { kind: "home" as const, label: BG47_TEXT.fields.home, p: home },
    { kind: "school" as const, label: BG47_TEXT.fields.school, p: school },
    { kind: "time" as const, label: BG47_TEXT.fields.time, p: time > 0 ? Math.min(1, time * 1.4) : 0 },
  ];
  return (
    <div
      style={{
        position: "relative",
        width: CARD_W,
        height: CARD_H,
        borderRadius: 26,
        backgroundColor: back ? "#FBF6EA" : C.paper,
        border: `5px solid ${back ? "#E6DCC4" : C.navy}`,
        boxShadow: "0 10px 0 rgba(20,40,90,0.10), 0 22px 40px rgba(20,40,90,0.18)",
        display: "flex",
        gap: 18,
        padding: 18,
        boxSizing: "border-box",
        fontFamily,
      }}
    >
      {back ? (
        <svg width="100%" height="100%" viewBox="0 0 780 196" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
          <path d="M60 60 Q 200 30 360 70 T 720 60 M60 120 Q 220 100 400 130 T 720 120" fill="none" stroke="#E6DCC4" strokeWidth={6} strokeLinecap="round" />
        </svg>
      ) : (
        fields.map((fl, i) => {
          const done = fl.p >= 0.5;
          const isTime = fl.kind === "time";
          return (
            <div
              key={fl.kind}
              style={{
                flex: isTime ? 1.35 : 1,
                position: "relative",
                borderRadius: 18,
                border: done ? `4px solid ${C.navy}` : `4px dashed #A9B4CC`,
                backgroundColor: done ? (i === 2 ? "#FFF6D1" : "#FFFFFF") : "rgba(255,255,255,0.6)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                boxShadow: highlight === i ? `0 0 0 8px rgba(255,201,14,0.55)` : "none",
                transform: `scale(${1 + 0.06 * Math.sin(Math.PI * clamp(fl.p * 2))})`,
              }}
            >
              <FieldIcon kind={fl.kind} filled={fl.p} size={isTime && time > 0 ? 50 : 70} />
              <div style={{ fontSize: 32, fontWeight: 900, color: done ? C.navy : "#8F9BB6", letterSpacing: 1 }}>{fl.label}</div>
              {isTime && time > 0 ? (
                <div
                  style={{
                    fontSize: 38,
                    fontWeight: 800,
                    color: C.ink,
                    fontStyle: "italic",
                    whiteSpace: "nowrap",
                    clipPath: `inset(0 ${100 - clamp(time) * 100}% 0 0)`,
                  }}
                >
                  {BG47_TEXT.fields.timeValue}
                </div>
              ) : null}
              {done ? (
                <div style={{ position: "absolute", right: -14, top: -16 }}>
                  <Check size={44} p={clamp((fl.p - 0.5) * 2)} />
                </div>
              ) : null}
            </div>
          );
        })
      )}
    </div>
  );
};
