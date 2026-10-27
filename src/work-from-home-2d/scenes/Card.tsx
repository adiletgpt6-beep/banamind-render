// Сцена 14 — последние пять секунд (ровно 150 кадров): светлый фон, жёлтый
// акцент, тёмно-синий текст. «BalaGo», «Балдар үчүн такси», WhatsApp
// 0998 08 38 28, «Маалымат жана алдын ала каттоо — профилдеги шилтемеде».
// Быстрое мягкое появление (≤ 12 кадров), затем всё неподвижно для чтения.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { easeOut } from "../rig/motion";
import { WFH_TEXT } from "../script";
import { BrandMark, INK, YELLOW } from "../screens";
import { box } from "../shots";

const WhatsAppIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 32 32">
    <circle cx={16} cy={16} r={16} fill="#25D366" />
    <path d="M16 7.5a8.5 8.5 0 0 0-7.3 12.8L7.5 24.5l4.3-1.1A8.5 8.5 0 1 0 16 7.5z" fill="#FFFFFF" />
    <path d="M12.6 11.8c.2-.4.4-.4.6-.4h.5c.2 0 .4 0 .5.4l.7 1.7c.1.2 0 .4-.1.5l-.5.6c-.1.1-.2.3 0 .5.6 1 1.4 1.8 2.5 2.3.2.1.4.1.5-.1l.6-.7c.1-.2.3-.2.5-.1l1.6.8c.2.1.3.2.3.4 0 .5-.2 1.2-.7 1.5-.6.4-1.4.5-2.3.2a9 9 0 0 1-4.7-4.2c-.6-1.1-.6-2 .0-3.2z" fill="#25D366" />
  </svg>
);

export const CardScene: React.FC = () => {
  const f = useCurrentFrame();
  const c = WFH_TEXT.card;
  const a = (d: number) => easeOut((f - d) / 10);
  return (
    <div style={box({ inset: 0, backgroundColor: "#F7F4EE", fontFamily, color: INK })}>
      <div style={box({ left: 0, right: 0, top: 0, height: 22, backgroundColor: YELLOW })} />
      <div style={box({ left: 0, right: 0, top: 330, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 })}>
        <div style={{ opacity: a(0), transform: `scale(${0.94 + 0.06 * a(0)})` }}>
          <BrandMark size={380} />
        </div>
        <div style={{ fontSize: 124, fontWeight: 900, lineHeight: 1, opacity: a(2) }}>
          Bala<span style={{ color: "#E0A800" }}>Go</span>
        </div>
        <div style={{ fontSize: 60, fontWeight: 800, opacity: a(4), padding: "6px 28px", borderRadius: 40, backgroundColor: YELLOW }}>{c.tagline}</div>
        <div style={{ marginTop: 40, display: "flex", alignItems: "center", gap: 22, opacity: a(6), padding: "22px 36px", borderRadius: 30, backgroundColor: "#FFFFFF", boxShadow: "0 10px 30px rgba(23,42,70,0.12)" }}>
          <WhatsAppIcon size={92} />
          <div>
            <div style={{ fontSize: 36, fontWeight: 800, color: "#5B6B82" }}>{c.whatsappLabel}</div>
            <div style={{ fontSize: 72, fontWeight: 900, letterSpacing: 1 }}>{c.whatsappNumber}</div>
          </div>
        </div>
        <div style={{ marginTop: 26, maxWidth: 860, textAlign: "center", fontSize: 44, fontWeight: 800, lineHeight: 1.25, opacity: a(8) }}>{c.note}</div>
      </div>
    </div>
  );
};
