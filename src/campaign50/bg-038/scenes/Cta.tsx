// Сцена 7: финал. Зелёный круг рюкзака сжимается в логотип BalaGo
// (match-cut). Все контакты появляются за ≈ 0,8 с и дальше неподвижны
// до конца ролика: «Бишкек • Балдар үчүн такси», «Профилдеги шилтемеге
// өтүңүз», «же WhatsApp аркылуу жазыңыз», «WhatsApp: 0998 08 38 28»,
// «BalaGo менен жолго чыгалы!». Всё в безопасной зоне Reels
// (сверху 250, снизу 400, слева 90, справа 150 px).
import { Img, staticFile, useCurrentFrame } from "remotion";
import { ASSETS } from "../../../config";
import { fontFamily } from "../../../fonts";
import { clamp, easeInOut, easeOut, lerp } from "../../../two-schedules-2d/rig/motion";
import { box } from "../context";
import { BG38_TEXT } from "../script";
import { NAVY, NAVY_SOFT, PACK, YELLOW, YELLOW_SOFT } from "../sets";

export const CTA_CHIME = 8; // кадр мягкого звука логотипа
const LOGO = { x: 510, y: 380, d: 230 } as const;

export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = BG38_TEXT.cta;
  const a = (k: number) => easeOut((f - k) / 9);
  const item = (k: number): React.CSSProperties => ({ opacity: a(k), translate: `0 ${(1 - a(k)) * 18}px` });
  // круг рюкзака: весь кадр → круг логотипа
  const shrink = easeInOut(f / 12);
  // стартовый радиус закрывает весь кадр (до дальнего угла ≈ 1640 px)
  const r = lerp(1700, LOGO.d / 2, shrink);
  const logo = easeOut((f - 7) / 8);
  return (
    <div style={box({ inset: 0, backgroundColor: "#FFFFFF", fontFamily, color: NAVY })}>
      <div style={box({ left: -260, top: -280, width: 760, height: 760, borderRadius: 380, backgroundColor: YELLOW_SOFT })} />
      <div style={box({ right: -220, bottom: -200, width: 640, height: 640, borderRadius: 320, backgroundColor: "#EAF3FC" })} />
      <div style={box({ left: 90, right: 150, top: LOGO.y - LOGO.d / 2, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 18 })}>
        <div style={{ width: LOGO.d, height: LOGO.d, opacity: logo, scale: `${0.86 + 0.14 * logo}` }}>
          <Img src={staticFile(ASSETS.logo)} style={{ width: LOGO.d, height: LOGO.d, borderRadius: LOGO.d / 2, objectFit: "cover", boxShadow: "0 20px 44px rgba(20,40,90,0.18)" }} />
        </div>
        <div style={{ ...item(10), fontSize: 104, fontWeight: 900, lineHeight: 1 }}>{t.brand}</div>
        <div style={{ ...item(12), padding: "14px 34px", borderRadius: 999, backgroundColor: YELLOW, fontSize: 50, fontWeight: 900 }}>{t.city}</div>
        <div style={{ ...item(14), fontSize: 40, fontWeight: 900, color: NAVY_SOFT }}>{t.route}</div>
        <div style={{ ...item(16), width: "100%", marginTop: 8, padding: "24px 14px", borderRadius: 30, backgroundColor: "#F2F6FC", border: "4px solid #DCE5F2", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontSize: 42, fontWeight: 900, whiteSpace: "nowrap" }}>
            <svg width={48} height={48} viewBox="0 0 24 24">
              <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" fill="none" stroke={NAVY} strokeWidth={2.6} strokeLinecap="round" />
            </svg>
            {t.link}
          </div>
          <div style={{ fontSize: 40, fontWeight: 800, color: NAVY_SOFT }}>{t.or}</div>
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
      {/* зелёный круг рюкзака сжимается в логотип */}
      {shrink < 1 ? (
        <div
          style={box({
            left: LOGO.x - r,
            top: LOGO.y - r,
            width: r * 2,
            height: r * 2,
            borderRadius: r,
            backgroundColor: PACK,
            opacity: 1 - clamp((f - 8) / 5),
          })}
        />
      ) : null}
    </div>
  );
};
