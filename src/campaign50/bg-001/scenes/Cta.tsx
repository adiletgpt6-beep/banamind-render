// Сцена 6 (46–60 с), финальный экран. Логотип BalaGo, «Бишкек • Балдар
// үчүн такси», маршрут ҮЙ → МЕКТЕП → ҮЙ и ОБА способа связи одновременно:
// «Профилдеги шилтемеге өтүңүз», «же WhatsApp аркылуу жазыңыз» и крупно
// «WhatsApp: 0998 08 38 28». Всё появляется за ≈ 0,4 с и дальше стоит
// неподвижно до конца ролика (≥ 13 с, ≥ 3 с после последнего слова) —
// в безопасной зоне: выше нижнего интерфейса Reels/Shorts и левее кнопок.
import { Img, staticFile, useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { clamp, easeOut } from "../rig/motion";
import { NAVY, YELLOW } from "../screens";
import { BG1_TEXT } from "../script";
import { box } from "../shots";

const T = BG1_TEXT.cta;

export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const a = (k: number) => {
    const u = easeOut((f - k * 2) / 10);
    return { opacity: clamp(u * 1.5), transform: `translateY(${(1 - u) * 24}px)` };
  };
  // мягкое «дыхание» фона (контакты неподвижны)
  const drift = Math.sin(f / 40) * 10;
  return (
    <div style={box({ inset: 0, backgroundColor: "#FFFFFF", fontFamily, overflow: "hidden" })}>
      <div style={box({ left: -220 + drift, top: -260, width: 640, height: 640, borderRadius: 320, backgroundColor: "#FFF3C4" })} />
      <div style={box({ right: -260 - drift, bottom: -200, width: 620, height: 620, borderRadius: 310, backgroundColor: "#EAF1FB" })} />
      <div style={box({ left: 70, right: 130, top: 190, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" })}>
        <div style={a(0)}>
          <Img src={staticFile("assets/logo.png")} style={{ width: 280, height: 280, borderRadius: 140, boxShadow: "0 12px 30px rgba(20,40,90,0.18)" }} />
        </div>
        <div style={{ ...a(1), fontSize: 118, fontWeight: 900, color: NAVY, marginTop: 16, lineHeight: 1.05 }}>{T.brand}</div>
        <div style={{ ...a(2), marginTop: 18, padding: "16px 34px", borderRadius: 50, backgroundColor: YELLOW, fontSize: 50, fontWeight: 900, color: NAVY, whiteSpace: "nowrap" }}>{T.city}</div>
        <div style={{ ...a(3), marginTop: 22, fontSize: 44, fontWeight: 900, color: "#5A6B8C", letterSpacing: 2 }}>{T.route}</div>
        {/* 1: ссылка в профиле */}
        <div style={{ ...a(4), marginTop: 54, width: "100%", padding: "30px 26px", boxSizing: "border-box", borderRadius: 32, backgroundColor: "#F3F6FB", border: "4px solid #DCE3EE", display: "flex", alignItems: "center", gap: 22 }}>
          <div style={{ width: 84, height: 84, flexShrink: 0, borderRadius: 42, backgroundColor: NAVY, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={50} height={50} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.6} strokeLinecap="round">
              <path d="M 10 14 L 14 10" />
              <path d="M 8.5 11.5 L 6.5 13.5 Q 4 16 6.5 18.5 Q 9 21 11.5 18.5 L 13.5 16.5" />
              <path d="M 15.5 12.5 L 17.5 10.5 Q 20 8 17.5 5.5 Q 15 3 12.5 5.5 L 10.5 7.5" />
            </svg>
          </div>
          <div style={{ fontSize: 54, fontWeight: 900, color: NAVY, textAlign: "left", lineHeight: 1.12 }}>{T.link}</div>
        </div>
        <div style={{ ...a(5), marginTop: 30, fontSize: 50, fontWeight: 800, color: "#33415E" }}>{T.or}</div>
        {/* 2: WhatsApp — полный номер крупно */}
        <div style={{ ...a(6), marginTop: 26, width: "100%", padding: "30px 22px", boxSizing: "border-box", borderRadius: 36, backgroundColor: "#E7F7EC", border: "5px solid #25A55A", display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 96, height: 96, flexShrink: 0, borderRadius: 48, backgroundColor: "#25A55A", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={58} height={58} viewBox="0 0 24 24">
              <path d="M 12 3 Q 20.5 3 20.5 11.5 Q 20.5 20 12 20 Q 9.6 20 7.7 19 L 3.8 20.2 L 5 16.5 Q 3.5 14.3 3.5 11.5 Q 3.5 3 12 3 Z" fill="#FFFFFF" />
              <path d="M 9 8 L 10.6 8 L 11.2 10.4 L 10.2 11.2 Q 11 13 12.9 13.9 L 13.7 12.9 L 16 13.5 L 16 15 Q 16 16.2 14.7 16.2 Q 8.2 15.6 7.8 9.3 Q 7.8 8 9 8 Z" fill="#25A55A" />
            </svg>
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 50, fontWeight: 900, color: "#1E7A44", lineHeight: 1 }}>{T.whatsappLabel}</div>
            <div style={{ fontSize: 94, fontWeight: 1000, color: NAVY, lineHeight: 1.08, whiteSpace: "nowrap", letterSpacing: 1 }}>{T.whatsappNumber}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
