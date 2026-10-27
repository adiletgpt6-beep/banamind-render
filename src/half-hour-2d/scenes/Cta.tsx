import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { easeOut } from "../../components/anim";
import { ASSETS, COLORS } from "../../config";
import { fontFamily } from "../../fonts";
import { WhatsAppIcon } from "../../founder-story/icons";
import { HH2_TEXT } from "../script";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ---------- Сцена 9: финальный экран (114–120 с) ----------
// Всё на месте уже через 0,6 с и держится до конца — без движения и речи.
// Номер WhatsApp крупный и неподвижный (как в других роликах проекта).
export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const a = (at: number) => interpolate(f, [at, at + 10], [0, 1], { ...clamp, easing: easeOut });
  const t = HH2_TEXT.cta;
  const item = (at: number): React.CSSProperties => ({ opacity: a(at), translate: `0 ${(1 - a(at)) * 24}px` });
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF", fontFamily, color: COLORS.navy }}>
      <div style={{ position: "absolute", left: -200, top: -260, width: 760, height: 760, borderRadius: 380, backgroundColor: COLORS.yellowSoft }} />
      <div style={{ position: "absolute", right: -220, bottom: -200, width: 640, height: 640, borderRadius: 320, backgroundColor: COLORS.sky }} />
      <div style={{ position: "absolute", left: 90, right: 150, top: 260, display: "flex", flexDirection: "column", alignItems: "center", gap: 22, textAlign: "center" }}>
        <div style={item(0)}>
          <Img src={staticFile(ASSETS.logo)} style={{ width: 250, height: 250, borderRadius: 125, objectFit: "cover", boxShadow: "0 24px 50px rgba(20,40,90,0.18)" }} />
        </div>
        <div style={{ ...item(2), fontSize: 112, fontWeight: 900, lineHeight: 1 }}>{t.brand}</div>
        <div style={{ ...item(4), fontSize: 56, fontWeight: 800, color: "#3A4F80" }}>{t.tagline}</div>
        <div style={{ ...item(6), padding: "12px 34px", borderRadius: 999, backgroundColor: COLORS.yellowSoft, fontSize: 46, fontWeight: 900 }}>{t.route}</div>
        <div style={{ ...item(8), fontSize: 44, fontWeight: 800, marginTop: 6 }}>{t.status}</div>
        <div style={{ ...item(10), marginTop: 12, padding: "28px 70px", borderRadius: 999, backgroundColor: COLORS.yellow, fontSize: 58, fontWeight: 900, boxShadow: "0 18px 40px rgba(255,201,14,0.45)" }}>{t.button}</div>
        <div style={{ ...item(12), fontSize: 40, fontWeight: 700, color: "#5A6B8C" }}>{t.link}</div>
        <div style={{ ...item(14), fontSize: 36, fontWeight: 700, color: "#5A6B8C", marginTop: -6 }}>{t.or}</div>
        <div style={{ ...item(16), marginTop: -4, width: 800, padding: "20px 0 24px", borderRadius: 36, border: "6px solid #25D366", backgroundColor: "#FFFFFF", boxShadow: "0 18px 40px rgba(20,40,90,0.14)", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <WhatsAppIcon size={64} />
            <span style={{ fontSize: 40, fontWeight: 900 }}>{t.whatsapp}</span>
          </div>
          <span style={{ fontSize: 92, fontWeight: 900, letterSpacing: 2, lineHeight: 1.05, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{t.phone}</span>
        </div>
      </div>
    </div>
  );
};
