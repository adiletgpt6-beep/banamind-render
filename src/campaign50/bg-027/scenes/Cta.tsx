// Сцена 6: финал. Жёлтая рамка карточки встречи (с того же места, что в
// сцене 3) раскрывается в светлую финальную карточку. Все контакты
// появляются за ≈ 0,8 с и дальше неподвижны до конца ролика:
// «Бишкек • Балдар үчүн такси», «Профилдеги шилтемеге өтүңүз»,
// «же WhatsApp аркылуу жазыңыз», «WhatsApp: 0998 08 38 28», слоган.
// Всё в безопасной зоне Reels (сверху 250, снизу 400, справа 150 px).
import { Img, staticFile, useCurrentFrame } from "remotion";
import { ASSETS } from "../../../config";
import { fontFamily } from "../../../fonts";
import { easeInOut, easeOut, lerp } from "../../../two-schedules-2d/rig/motion";
import { box } from "../../../two-schedules-2d/shots";
import { BG27_TEXT } from "../script";
import { CARD_H, NAVY, SOFT_YELLOW, YELLOW } from "../sets";
import { CARD_POS } from "./Card";

export const CTA_CHIME = 12; // кадр мягкого звука логотипа
const FROM = { x: CARD_POS.x - 14, y: CARD_POS.y - 14, w: CARD_POS.w + 28, h: CARD_H + 28 };
const TO = { x: 60, y: 300, w: 860, h: 1110 };

export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = BG27_TEXT.cta;
  const m = easeInOut(f / 14);
  const fr = { x: lerp(FROM.x, TO.x, m), y: lerp(FROM.y, TO.y, m), w: lerp(FROM.w, TO.w, m), h: lerp(FROM.h, TO.h, m) };
  const a = (at: number) => easeOut((f - at) / 8);
  const item = (at: number): React.CSSProperties => ({ opacity: a(at), translate: `0 ${(1 - a(at)) * 16}px` });
  const logo = easeOut((f - 8) / 10);
  return (
    <div style={box({ inset: 0, backgroundColor: "#FFFFFF", fontFamily, color: NAVY })}>
      <div style={box({ left: -260, top: -280, width: 760, height: 760, borderRadius: 380, backgroundColor: SOFT_YELLOW })} />
      <div style={box({ right: -220, bottom: -200, width: 640, height: 640, borderRadius: 320, backgroundColor: "#EAF3FC" })} />
      {/* рамка карточки встречи → финальная карточка */}
      <div style={box({ left: fr.x, top: fr.y, width: fr.w, height: fr.h, borderRadius: 52, border: `12px solid ${YELLOW}`, boxSizing: "border-box", backgroundColor: "rgba(255,255,255,0.92)", boxShadow: "0 30px 70px rgba(20,40,90,0.12)" })} />
      <div style={box({ left: TO.x + 30, top: TO.y + 34, width: TO.w - 60, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 18 })}>
        <div style={{ opacity: logo, scale: `${0.7 + 0.3 * logo}` }}>
          <Img src={staticFile(ASSETS.logo)} style={{ width: 190, height: 190, borderRadius: 95, objectFit: "cover", boxShadow: "0 18px 40px rgba(20,40,90,0.18)" }} />
        </div>
        <div style={{ ...item(10), fontSize: 96, fontWeight: 900, lineHeight: 1 }}>{t.brand}</div>
        <div style={{ ...item(12), padding: "14px 30px", borderRadius: 999, backgroundColor: YELLOW, fontSize: 46, fontWeight: 900 }}>{t.city}</div>
        <div style={{ ...item(14), width: "100%", marginTop: 6, padding: "22px 16px", borderRadius: 30, backgroundColor: "#F2F6FC", border: "4px solid #DCE5F2", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontSize: 40, fontWeight: 900, whiteSpace: "nowrap" }}>
            <svg width={44} height={44} viewBox="0 0 24 24">
              <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" fill="none" stroke={NAVY} strokeWidth={2.6} strokeLinecap="round" />
            </svg>
            {t.link}
          </div>
          <div style={{ fontSize: 38, fontWeight: 800, color: "#3A4F80" }}>{t.or}</div>
        </div>
        <div style={{ ...item(16), width: "100%", padding: "18px 12px 22px", borderRadius: 30, backgroundColor: "#EAF7EE", border: "4px solid #B9E2C6", boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, fontSize: 42, fontWeight: 900, color: "#1F7A3E" }}>
            <svg width={48} height={48} viewBox="0 0 24 24">
              <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z" fill="#25A35A" />
              <path d="M9 8.2c.2-.5.5-.5.8-.5h.5c.2 0 .4 0 .6.5l.7 1.7c.1.2 0 .4-.1.6l-.5.6c-.1.2-.1.3 0 .5a6 6 0 0 0 2.8 2.5c.2.1.4.1.5-.1l.6-.7c.2-.2.4-.2.6-.1l1.7.8c.2.1.4.2.4.4 0 .6-.3 1.4-1 1.7-.8.4-1.8.4-3.4-.3a9.3 9.3 0 0 1-4.1-3.8c-.6-1-.8-1.9-.5-2.7z" fill="#FFFFFF" />
            </svg>
            {t.whatsappLabel}
          </div>
          <div style={{ fontSize: 92, fontWeight: 900, letterSpacing: 1, lineHeight: 1.05, marginTop: 6, whiteSpace: "nowrap" }}>{t.whatsappNumber}</div>
        </div>
        <div style={{ ...item(18), marginTop: 4, fontSize: 42, fontWeight: 900 }}>{t.slogan}</div>
      </div>
    </div>
  );
};
