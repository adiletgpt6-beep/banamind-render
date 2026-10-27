// Финальная карточка (последние 5 с): BalaGo, WhatsApp 0998 08 38 28 и
// второй путь — ссылка в шапке профиля. Всё на месте за 0,4 с и дальше
// неподвижно; номер — самый крупный элемент после бренда, в безопасной зоне
// кадра (без субтитров поверх). Без цен, дат и гарантий.
import { Img, staticFile, useCurrentFrame } from "remotion";
import { ASSETS, COLORS } from "../../config";
import { fontFamily } from "../../fonts";
import { easeOut } from "../rig/motion";
import { NB2_TEXT } from "../script";

const WA_GREEN = "#1FA855";

// Знак WhatsApp: зелёный круг-облачко с трубкой (рисунок, не фото).
export const WhatsAppIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path d="M50 6 C25 6 6 25 6 49 C6 58 8.5 66 13 73 L7 94 L29 88 C35.5 91.5 42.5 93 50 93 C74 93 94 74 94 49.5 C94 25 74 6 50 6 Z" fill={WA_GREEN} />
    <path d="M50 14 C29.5 14 14 29.5 14 49.5 C14 57.5 16.5 64.5 21 70.5 L17.5 83 L30.5 79.5 C36 83 42.5 85 50 85 C70 85 86 69.5 86 49.5 C86 29.5 70 14 50 14 Z" fill="#FFFFFF" />
    <path d="M37 30 L42 41 L38 46 Q43 57 55 62 L60 58 L71 63 Q71 72 63 73 C46 72 30 57 29 40 Q30 31 37 30 Z" fill={WA_GREEN} />
  </svg>
);

// Значок ссылки: два звена цепочки.
const LinkIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke={COLORS.navy} strokeWidth={11} strokeLinecap="round">
    <path d="M44 56 a14 14 0 0 0 20 0 l14 -14 a14 14 0 0 0 -20 -20 l-6 6" />
    <path d="M56 44 a14 14 0 0 0 -20 0 l-14 14 a14 14 0 0 0 20 20 l6 -6" />
  </svg>
);

export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = NB2_TEXT.cta;
  const a = (at: number) => easeOut((f - at) / 8);
  const item = (at: number): React.CSSProperties => ({ opacity: a(at), translate: `0 ${(1 - a(at)) * 16}px` });
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF", fontFamily, color: COLORS.navy }}>
      <div style={{ position: "absolute", left: -220, top: -240, width: 760, height: 760, borderRadius: 380, backgroundColor: COLORS.yellowSoft }} />
      <div style={{ position: "absolute", right: -200, bottom: -180, width: 620, height: 620, borderRadius: 310, backgroundColor: COLORS.sky }} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 250, display: "flex", flexDirection: "column", alignItems: "center", gap: 24, textAlign: "center" }}>
        <div style={item(0)}>
          <Img src={staticFile(ASSETS.logo)} style={{ width: 200, height: 200, borderRadius: 100, objectFit: "cover", boxShadow: "0 20px 44px rgba(20,40,90,0.16)" }} />
        </div>
        <div style={{ ...item(1), fontSize: 112, fontWeight: 900, lineHeight: 1 }}>{t.brand}</div>
        <div style={{ ...item(2), fontSize: 52, fontWeight: 800, color: "#3A4F80" }}>{t.tagline}</div>
        <div style={{ ...item(4), marginTop: 20, width: "100%", padding: "34px 24px 38px", borderRadius: 44, backgroundColor: "#ECF9F1", border: `6px solid ${WA_GREEN}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <WhatsAppIcon size={84} />
            <span style={{ fontSize: 62, fontWeight: 900, color: "#14532D" }}>{t.channel}</span>
          </div>
          <div style={{ fontSize: 104, fontWeight: 900, letterSpacing: 2, color: COLORS.navy, lineHeight: 1.05, fontVariantNumeric: "tabular-nums" }}>{t.phone}</div>
          <div style={{ fontSize: 46, fontWeight: 800, color: "#24354E", lineHeight: 1.2 }}>{t.invite}</div>
        </div>
        <div style={{ ...item(6), fontSize: 44, fontWeight: 800, color: "#5B6B8A" }}>{t.or}</div>
        <div style={{ ...item(7), width: "100%", padding: "28px 24px 32px", borderRadius: 44, backgroundColor: "#FFFFFF", border: `6px solid ${COLORS.navy}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <LinkIcon size={50} />
            <span style={{ fontSize: 45, fontWeight: 900, color: COLORS.navy, lineHeight: 1.15, whiteSpace: "nowrap" }}>{t.link}</span>
          </div>
          <div style={{ fontSize: 46, fontWeight: 800, color: "#24354E", lineHeight: 1.2 }}>{t.linkNote}</div>
        </div>
      </div>
    </div>
  );
};
