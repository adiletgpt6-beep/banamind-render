// Сцена 9 (111–120 с): финальная карточка BalaGo. Белый фон, ярко-жёлтый
// акцент, тёмно-синий текст. Все элементы на месте за ≈ 0,8 с и дальше
// неподвижны. WhatsApp основателя появляется в последние пять секунд.
// Только предварительная регистрация, без цен и обещаний.
import { Img, staticFile, useCurrentFrame } from "remotion";
import { ASSETS, COLORS } from "../../config";
import { fontFamily } from "../../fonts";
import { easeOut } from "../rig/motion";
import { TS2_SCENES, TS2_TEXT, TS2_VIDEO, TS2_WHATSAPP_FROM } from "../script";

export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = TS2_TEXT.cta;
  const contactAt = Math.round((TS2_WHATSAPP_FROM - TS2_SCENES[TS2_SCENES.length - 1].from) * TS2_VIDEO.fps);
  const a = (at: number) => easeOut((f - at) / 10);
  const item = (at: number): React.CSSProperties => ({ opacity: a(at), translate: `0 ${(1 - a(at)) * 22}px` });
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF", fontFamily, color: COLORS.navy }}>
      <div style={{ position: "absolute", left: -220, top: -240, width: 760, height: 760, borderRadius: 380, backgroundColor: COLORS.yellowSoft }} />
      <div style={{ position: "absolute", right: -200, bottom: -180, width: 620, height: 620, borderRadius: 310, backgroundColor: COLORS.sky }} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 220, display: "flex", flexDirection: "column", alignItems: "center", gap: 24, textAlign: "center" }}>
        <div style={item(0)}>
          <Img src={staticFile(ASSETS.logo)} style={{ width: 280, height: 280, borderRadius: 140, objectFit: "cover", boxShadow: "0 24px 50px rgba(20,40,90,0.18)" }} />
        </div>
        <div style={{ ...item(2), fontSize: 124, fontWeight: 900, lineHeight: 1 }}>{t.brand}</div>
        <div style={{ ...item(4), fontSize: 64, fontWeight: 800, color: "#2E4377" }}>{t.tagline}</div>
        <div style={{ ...item(6), padding: "16px 40px", borderRadius: 999, backgroundColor: COLORS.yellow, fontSize: 54, fontWeight: 900 }}>{t.route}</div>
        <div style={{ ...item(8), fontSize: 50, fontWeight: 800, marginTop: 4 }}>{t.status}</div>
        <div style={{ ...item(10), marginTop: 18, padding: "32px 84px", borderRadius: 999, backgroundColor: COLORS.yellow, fontSize: 66, fontWeight: 900, boxShadow: "0 18px 40px rgba(255,201,14,0.45)" }}>{t.button}</div>
        <div style={{ ...item(12), fontSize: 46, fontWeight: 800, color: "#3A4F80" }}>{t.link}</div>
        <div style={{ opacity: easeOut((f - contactAt) / 7), marginTop: 8, padding: "18px 44px", borderRadius: 28, border: "3px solid #DDE8D2", backgroundColor: "#F5F9F0", lineHeight: 1.18 }}>
          <div style={{ fontSize: 42, fontWeight: 800, color: "#287241" }}>{t.whatsappLabel}</div>
          <div style={{ fontSize: 86, fontWeight: 900, letterSpacing: 1, marginTop: 8 }}>{t.whatsappNumber}</div>
        </div>
      </div>
    </div>
  );
};
