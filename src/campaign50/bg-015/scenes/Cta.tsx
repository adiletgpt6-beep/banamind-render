// Сцена 6: скамейка из «возможного после» растворяется в логотипе BalaGo.
// Финальный экран неподвижен с ≈ 0,8 с и до конца ролика: «Бишкек •
// Балдар үчүн такси», ссылка в профиле (стрелка вверх к шапке профиля) и
// WhatsApp 0998 08 38 28 — одновременно, крупно, в безопасной зоне Reels.
import { Img, staticFile } from "remotion";
import { ASSETS, COLORS } from "../../../config";
import { fontFamily } from "../../../fonts";
import { easeOut } from "../../../two-schedules-2d/rig/motion";
import { useSceneInfo } from "../context";
import { BG15_TEXT } from "../script";
import { PARK_CAM_B } from "../sets/Park";
import { PossibleWorld } from "./Possible";

export const CTA_SETTLE = 26; // кадр, с которого финальный экран полностью собран

export const CtaScene: React.FC = () => {
  const { f } = useSceneInfo("cta");
  const t = BG15_TEXT.cta;
  const fade = easeOut(f / 16);
  const a = (at: number) => easeOut((f - at) / 10);
  const item = (at: number): React.CSSProperties => ({ opacity: a(at), translate: `0 ${(1 - a(at)) * 18}px` });
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF", fontFamily, color: COLORS.navy }}>
      {fade < 1 ? (
        <div style={{ position: "absolute", left: 540 - 470, top: 410, width: 1080, height: 1920, transformOrigin: "0 0", scale: `${(940 / 1080) * (1 - 0.25 * fade)}`, borderRadius: 50, overflow: "hidden", opacity: 1 - fade }}>
          <PossibleWorld f={f + 200} cam={PARK_CAM_B} />
        </div>
      ) : null}
      <div style={{ position: "absolute", left: -220, top: -240, width: 760, height: 760, borderRadius: 380, backgroundColor: COLORS.yellowSoft, opacity: fade }} />
      <div style={{ position: "absolute", right: -200, bottom: -180, width: 620, height: 620, borderRadius: 310, backgroundColor: COLORS.sky, opacity: fade }} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 250, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, textAlign: "center" }}>
        <div style={{ ...item(0), display: "flex", alignItems: "center", gap: 28 }}>
          <Img src={staticFile(ASSETS.logo)} style={{ width: 190, height: 190, borderRadius: 95, objectFit: "cover", boxShadow: "0 20px 44px rgba(20,40,90,0.18)" }} />
          <div style={{ fontSize: 120, fontWeight: 900, lineHeight: 1 }}>{t.brand}</div>
        </div>
        <div style={{ ...item(3), marginTop: 10, padding: "14px 40px", borderRadius: 999, backgroundColor: COLORS.navy, color: "#FFFFFF", fontSize: 54, fontWeight: 900 }}>{t.cityLine}</div>
        <div style={{ ...item(5), padding: "12px 36px", borderRadius: 999, backgroundColor: COLORS.yellow, fontSize: 48, fontWeight: 900 }}>{t.route}</div>
        {/* ссылка в шапке профиля: стрелка вверх */}
        <div style={{ ...item(8), marginTop: 22, display: "flex", alignItems: "center", gap: 22, padding: "24px 40px", borderRadius: 30, backgroundColor: "#FFFFFF", border: `5px solid ${COLORS.yellow}`, boxShadow: "0 14px 34px rgba(255,201,14,0.35)" }}>
          <svg width={64} height={64} viewBox="0 0 24 24">
            <path d="M 12 3 L 12 21 M 5 10 L 12 3 L 19 10" stroke={COLORS.navy} strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ fontSize: 54, fontWeight: 900 }}>{t.link}</div>
        </div>
        <div style={{ ...item(10), fontSize: 46, fontWeight: 800, color: COLORS.navySoft }}>{t.or}</div>
        <div style={{ ...item(12), padding: "20px 50px 26px", borderRadius: 32, border: "4px solid #BFE0C8", backgroundColor: "#F2FAF4", lineHeight: 1.1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, fontSize: 48, fontWeight: 900, color: "#1F8A4C" }}>
            <svg width={52} height={52} viewBox="0 0 24 24">
              <circle cx={12} cy={12} r={11} fill="#25D366" />
              <path d="M 8.2 7 C 7.4 7.6 7.2 8.8 7.9 10.2 C 8.8 12 10.3 13.7 12.6 14.9 C 14 15.6 15.3 15.6 16 14.8 L 16.4 14.2 L 14.6 13 L 13.6 13.8 C 12.4 13.2 11.2 12 10.6 10.8 L 11.3 9.8 L 10.1 7.9 Z" fill="#FFFFFF" />
            </svg>
            {t.whatsappLabel}
          </div>
          <div style={{ fontSize: 104, fontWeight: 900, letterSpacing: 2, marginTop: 6, color: COLORS.navy }}>{t.whatsappNumber}</div>
        </div>
        <div style={{ ...item(16), marginTop: 18, fontSize: 50, fontWeight: 900 }}>{t.slogan}</div>
      </div>
    </div>
  );
};
