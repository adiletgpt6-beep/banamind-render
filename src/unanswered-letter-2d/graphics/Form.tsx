// Нейтральная 2D-иллюстрация страницы предварительной заявки BalaGo:
// три поля («Үй дареги», «Мектеп», «Сабактын убактысы») заполняются по
// очереди, направление «Мектеп → Үй», кнопка «Алдын ала арыз» и статус
// «Арыз жөнөтүлдү». Без реальных адресов, цен, водителей и оплаты.
import { Logo } from "../../components/Logo";
import { fontFamily } from "../../fonts";
import { clamp, easeOut } from "../rig/motion";
import { UL2_TEXT } from "../script";
import { C } from "../theme";
import { Icon, type IconId } from "./Icons";

const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });
const FIELD_ICON: readonly IconId[] = ["home", "school", "clock"];

export type FormView = {
  readonly fills: readonly [number, number, number]; // 0…1 заполнение полей
  readonly route: number; // 0…1 направление
  readonly hover: number;
  readonly press: number;
  readonly sent: number;
};

// Координаты для указателя (px страницы w = 860).
export const FORM_GEOM = { fieldY: (i: number) => 214 + i * 118 + 70, buttonY: 690, buttonX: 430 } as const;

export const FormPage: React.FC<{ readonly w: number; readonly h: number; readonly v: FormView }> = ({ w, h, v }) => {
  const p = UL2_TEXT.page;
  const sent = easeOut(clamp(v.sent));
  return (
    <div style={box({ left: 0, top: 0, width: w, height: h, backgroundColor: "#F4F6FA", fontFamily, color: C.ink, overflow: "hidden" })}>
      <div style={box({ left: 0, top: 0, width: w, height: 118, backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", gap: 20, padding: "0 32px", boxSizing: "border-box", boxShadow: "0 4px 14px rgba(20,30,60,0.08)" })}>
        <Logo size={80} style={{ boxShadow: "none" }} />
        <div>
          <div style={{ fontSize: 44, fontWeight: 900, lineHeight: 1 }}>{p.brand}</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: C.inkSoft }}>{p.tagline}</div>
        </div>
      </div>
      <div style={box({ left: 36, top: 134, fontSize: 46, fontWeight: 900 })}>{p.title}</div>
      {p.fields.map(([label, value], i) => {
        const typed = clamp(v.fills[i]);
        const n = Math.round([...value].length * typed);
        return (
          <div key={label} style={box({ left: 36, right: 36, top: 210 + i * 118 })}>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.inkSoft, marginBottom: 6 }}>{label}</div>
            <div style={{ height: 74, borderRadius: 18, backgroundColor: "#FFFFFF", border: `3px solid ${typed > 0 && typed < 1 ? C.yellow : typed >= 1 ? "#9FD1B4" : "#DCE3EE"}`, display: "flex", alignItems: "center", gap: 14, padding: "0 20px", fontSize: 38, fontWeight: 900 }}>
              <Icon id={FIELD_ICON[i]} size={38} color={typed > 0 ? C.ink : "#B6C1D0"} stroke={4} />
              <span>{[...value].slice(0, n).join("")}</span>
              {typed >= 1 ? <Icon id="check" size={34} color={C.green} stroke={5} style={{ marginLeft: "auto" }} /> : null}
            </div>
          </div>
        );
      })}
      {/* направление: Мектеп → Үй */}
      <div style={box({ left: 36, right: 36, top: 574, height: 76, borderRadius: 18, backgroundColor: "#FFF6D6", border: `3px solid ${C.yellow}`, display: "flex", alignItems: "center", gap: 16, padding: "0 22px", fontSize: 36, fontWeight: 900, opacity: easeOut(v.route) })}>
        <span style={{ fontSize: 28, color: C.inkSoft, fontWeight: 800 }}>{p.routeLabel}:</span>
        <Icon id="school" size={36} color={C.ink} stroke={4} />
        {UL2_TEXT.school}
        <span style={{ color: "#C79A12" }}>→</span>
        <Icon id="home" size={36} color={C.ink} stroke={4} />
        {UL2_TEXT.home}
      </div>
      {/* кнопка → статус заявки */}
      <div style={box({ left: 36, right: 36, top: 670, height: 88, borderRadius: 999, backgroundColor: C.yellow, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 900, scale: `${1 - 0.05 * clamp(v.press)}`, opacity: 1 - sent, boxShadow: v.hover > 0.4 ? "0 10px 24px rgba(224,181,32,0.45)" : "none" })}>{p.send}</div>
      <div style={box({ left: 36, right: 36, top: 662, height: 104, borderRadius: 26, backgroundColor: "#FFFFFF", border: `4px solid ${C.green}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 18, opacity: sent, scale: `${0.96 + 0.04 * sent}` })}>
        <div style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon id="check" size={40} color="#FFFFFF" stroke={5} />
        </div>
        <div style={{ fontSize: 44, fontWeight: 900 }}>{p.sent}</div>
      </div>
    </div>
  );
};
