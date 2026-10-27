// Финальная карточка: Бишкек • Балдар үчүн такси, ссылка в профиле и
// WhatsApp 0998 08 38 28 — одновременно и неподвижно до конца ролика,
// в безопасной зоне (низ 400 px и правый край под кнопки Reels свободны).
import { Img, interpolate, staticFile } from "remotion";
import { fontFamily } from "../fonts";
import { NAVY, YELLOW } from "../props";
import { B12_TEXT } from "../script";
import { clamp } from "./common";

const Arrow: React.FC = () => (
  <svg width={34} height={20} viewBox="0 0 34 20">
    <path d="M 2 10 H 30 M 22 3 L 31 10 L 22 17" stroke="#55607A" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CtaCard: React.FC<{ readonly t: number }> = ({ t }) => {
  const o = interpolate(t, [0, 0.45], [0, 1], clamp);
  const C = B12_TEXT.cta;
  return (
    <div
      style={{
        position: "absolute",
        left: 96,
        width: 868,
        top: 850,
        height: 640,
        borderRadius: 44,
        background: "rgba(255,255,255,0.97)",
        boxShadow: "0 24px 60px rgba(60,30,10,0.28)",
        border: `6px solid ${YELLOW}`,
        boxSizing: "border-box",
        opacity: o,
        transform: `translateY(${(1 - o) * 60}px)`,
        fontFamily,
        color: NAVY,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "34px 36px 30px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 26, width: "100%" }}>
        <Img src={staticFile("assets/logo.png")} style={{ width: 132, height: 132, borderRadius: 66, boxShadow: "0 8px 20px rgba(0,0,0,0.12)" }} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 1000, lineHeight: 1 }}>{C.brand}</div>
          {/* «ҮЙ → МЕКТЕП → ҮЙ» — стрелки рисуются (в шрифте они мелкие) */}
          <div style={{ fontSize: 32, fontWeight: 900, color: "#55607A", marginTop: 8, display: "flex", alignItems: "center", gap: 10 }} aria-label={C.route}>
            {C.route.split(" → ").map((p, i) => (
              <span key={p + i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {i > 0 ? <Arrow /> : null}
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 26, background: YELLOW, borderRadius: 40, padding: "12px 34px", fontSize: 46, fontWeight: 1000 }}>{C.city}</div>
      <div style={{ marginTop: 26, display: "flex", alignItems: "center", gap: 16, fontSize: 42, fontWeight: 900 }}>
        <svg width={48} height={48} viewBox="0 0 48 48">
          <path d="M 20 28 L 28 20 M 22 14 l 4 -4 a 8 8 0 0 1 12 12 l -4 4 M 26 34 l -4 4 a 8 8 0 0 1 -12 -12 l 4 -4" stroke={NAVY} strokeWidth={5} fill="none" strokeLinecap="round" />
        </svg>
        {C.link}
      </div>
      <div style={{ marginTop: 10, fontSize: 40, fontWeight: 800, color: "#3D4A66" }}>{C.or}</div>
      <div
        style={{
          marginTop: 22,
          display: "flex",
          alignItems: "center",
          gap: 16,
          border: "5px solid #25D366",
          borderRadius: 30,
          padding: "14px 24px",
          whiteSpace: "nowrap",
          background: "#F1FCF5",
        }}
      >
        <svg width={64} height={64} viewBox="0 0 64 64">
          <circle cx={32} cy={32} r={30} fill="#25D366" />
          <path d="M 16 50 L 19 40 A 16 16 0 1 1 25 46 Z" fill="#FFFFFF" />
          <path d="M 26 24 q 1 -3 3 -2 l 2 4 q 0 2 -2 3 q 2 5 7 7 q 1 -2 3 -2 l 4 2 q 1 2 -2 3 q -6 2 -12 -4 q -6 -6 -3 -11 Z" fill="#25D366" />
        </svg>
        <span style={{ fontSize: 38, fontWeight: 900 }}>WhatsApp:</span>
        <span style={{ fontSize: 62, fontWeight: 1000 }}>{C.whatsapp.replace("WhatsApp: ", "")}</span>
      </div>
    </div>
  );
};
