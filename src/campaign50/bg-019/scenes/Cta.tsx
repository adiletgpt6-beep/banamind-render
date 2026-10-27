// Сцена 6: финал. Колокольчик звучит мягко и превращается в логотип
// (расходящиеся кольца). Все контакты появляются за ≈ 0,8 с и дальше
// неподвижны до конца ролика: «Бишкек • Балдар үчүн такси»,
// «Профилдеги шилтемеге өтүңүз», «же WhatsApp аркылуу жазыңыз»,
// «WhatsApp: 0998 08 38 28», «BalaGo менен жолго чыгалы!».
// Всё в безопасной зоне Reels (сверху 250, снизу 400, справа 150 px).
import { Img, staticFile, useCurrentFrame } from "remotion";
import { ASSETS } from "../../../config";
import { fontFamily } from "../../../fonts";
import { easeOut } from "../../../two-schedules-2d/rig/motion";
import { box } from "../context";
import { BG19_TEXT } from "../script";
import { BellRings, HandBell, NAVY, YELLOW } from "../sets";

export const CTA_CHIME = 2; // кадр мягкого звонка-логотипа

export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = BG19_TEXT.cta;
  const a = (at: number) => easeOut((f - at) / 9);
  const item = (at: number): React.CSSProperties => ({ opacity: a(at), translate: `0 ${(1 - a(at)) * 18}px` });
  const bell = 1 - easeOut((f - 6) / 10);
  const logo = easeOut((f - 8) / 12);
  return (
    <div style={box({ inset: 0, backgroundColor: "#FFFFFF", fontFamily, color: NAVY })}>
      <div style={box({ left: -260, top: -280, width: 760, height: 760, borderRadius: 380, backgroundColor: "#FFF4C2" })} />
      <div style={box({ right: -220, bottom: -200, width: 640, height: 640, borderRadius: 320, backgroundColor: "#EAF3FC" })} />
      {/* колокольчик → логотип */}
      <BellRings x={495} y={385} hits={[CTA_CHIME]} f={f} max={300} />
      {bell > 0.01 ? (
        <div style={box({ left: 0, top: 0, opacity: bell })}>
          <HandBell x={495} y={250} swing={14 * Math.sin(f / 3) * bell} s={0.9} />
        </div>
      ) : null}
      <div style={box({ left: 90, right: 150, top: 262, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 18 })}>
        <div style={{ opacity: logo, scale: `${0.7 + 0.3 * logo}` }}>
          <Img src={staticFile(ASSETS.logo)} style={{ width: 230, height: 230, borderRadius: 115, objectFit: "cover", boxShadow: "0 20px 44px rgba(20,40,90,0.18)" }} />
        </div>
        <div style={{ ...item(10), fontSize: 104, fontWeight: 900, lineHeight: 1 }}>{t.brand}</div>
        <div style={{ ...item(12), padding: "14px 34px", borderRadius: 999, backgroundColor: YELLOW, fontSize: 50, fontWeight: 900 }}>{t.city}</div>
        <div style={{ ...item(14), fontSize: 40, fontWeight: 900, color: "#3A4F80" }}>{t.route}</div>
        <div style={{ ...item(16), width: "100%", marginTop: 8, padding: "24px 20px", borderRadius: 30, backgroundColor: "#F2F6FC", border: "4px solid #DCE5F2", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, fontSize: 46, fontWeight: 900 }}>
            <svg width={52} height={52} viewBox="0 0 24 24">
              <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" fill="none" stroke={NAVY} strokeWidth={2.6} strokeLinecap="round" />
            </svg>
            {t.link}
          </div>
          <div style={{ fontSize: 40, fontWeight: 800, color: "#3A4F80" }}>{t.or}</div>
        </div>
        <div style={{ ...item(18), width: "100%", padding: "20px 20px 24px", borderRadius: 30, backgroundColor: "#EAF7EE", border: "4px solid #B9E2C6" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, fontSize: 44, fontWeight: 900, color: "#1F7A3E" }}>
            <svg width={50} height={50} viewBox="0 0 24 24">
              <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z" fill="#25A35A" />
              <path d="M9 8.2c.2-.5.5-.5.8-.5h.5c.2 0 .4 0 .6.5l.7 1.7c.1.2 0 .4-.1.6l-.5.6c-.1.2-.1.3 0 .5a6 6 0 0 0 2.8 2.5c.2.1.4.1.5-.1l.6-.7c.2-.2.4-.2.6-.1l1.7.8c.2.1.4.2.4.4 0 .6-.3 1.4-1 1.7-.8.4-1.8.4-3.4-.3a9.3 9.3 0 0 1-4.1-3.8c-.6-1-.8-1.9-.5-2.7z" fill="#FFFFFF" />
            </svg>
            {t.whatsappLabel}
          </div>
          <div style={{ fontSize: 100, fontWeight: 900, letterSpacing: 1, lineHeight: 1.05, marginTop: 6, whiteSpace: "nowrap" }}>{t.whatsappNumber}</div>
        </div>
        <div style={{ ...item(20), marginTop: 6, fontSize: 44, fontWeight: 900 }}>{t.slogan}</div>
      </div>
    </div>
  );
};
