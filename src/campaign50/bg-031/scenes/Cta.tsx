// Сцена 6 (≈59 с – конец): памятка «отрывается» и становится чистым
// финальным чеком BalaGo. Неподвижный финальный экран: логотип, «BalaGo»,
// «Бишкек • Балдар үчүн такси», «Профилдеги шилтемеге өтүңүз», «же
// WhatsApp аркылуу жазыңыз» и крупно «WhatsApp: 0998 08 38 28». Оба
// способа связи, город и номер видны одновременно с BG31_CONTACTS_IN до
// последнего кадра (≥ 5 с), после последнего слова экран держится ≥ 3 с.
// Всё в безопасной зоне Reels: сверху ≥ 250 px, снизу ≥ 400 px, справа ≥ 150 px.
import { Img, staticFile, useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { easeOut } from "../../../two-schedules-2d/rig/motion";
import { C } from "../palette";
import { BG31_CONTACTS_IN, BG31_TEXT, BG31_VIDEO } from "../script";
import { Paper } from "../ui";

const LOGO = { x: 540, y: 400, r: 118 };
const CARD = { x: 100, y: 548, w: 830, h: 736 } as const;

export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = BG31_TEXT.cta;
  const contactAt = Math.round(BG31_CONTACTS_IN * BG31_VIDEO.fps) - 8;
  const a = (at: number, d = 10) => easeOut((f - at) / d);
  const item = (at: number): React.CSSProperties => ({ opacity: a(at), translate: `0 ${(1 - a(at)) * 22}px` });
  // карточка финала видна с первого кадра (без пустой вспышки на склейке)
  const card = 1;
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF", fontFamily, color: C.navy, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: -220, top: -240, width: 760, height: 760, borderRadius: 380, backgroundColor: C.yellowSoft }} />
      <div style={{ position: "absolute", right: -200, bottom: -180, width: 620, height: 620, borderRadius: 310, backgroundColor: C.sky }} />
      {/* логотип */}
      <div style={{ position: "absolute", left: LOGO.x - LOGO.r, top: LOGO.y - LOGO.r, width: LOGO.r * 2, height: LOGO.r * 2, opacity: a(0, 6), transform: `scale(${0.85 + 0.15 * a(0, 6)})` }}>
        <Img src={staticFile(BG31_VIDEO.logo)} style={{ width: LOGO.r * 2, height: LOGO.r * 2, borderRadius: LOGO.r, objectFit: "cover", boxShadow: `0 0 0 12px ${C.yellow}, 0 24px 50px rgba(20,40,90,0.18)` }} />
      </div>
      {/* финальный «чек» BalaGo */}
      <div style={{ position: "absolute", left: CARD.x, top: CARD.y, opacity: card, transform: `translateY(${(1 - card) * 60}px)` }}>
        <Paper w={CARD.w} h={CARD.h} tooth={16} color="#FFFFFF" shadow={0.8}>
          <div style={{ position: "absolute", left: 30, right: 30, top: 50, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}>
            <div style={{ ...item(4), fontSize: 100, fontWeight: 1000, lineHeight: 1 }}>{t.brand}</div>
            <div style={{ ...item(6), padding: "12px 34px", borderRadius: 999, backgroundColor: C.navy, color: "#FFFFFF", fontSize: 48, fontWeight: 900 }}>{t.city}</div>
            <div style={{ width: "100%", height: 0, borderTop: `4px dashed ${C.paperEdge}`, margin: "14px 0 6px" }} />
            {/* оба способа связи и номер — вместе, неподвижно, до конца ролика */}
            <div style={{ opacity: a(contactAt, 8), width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 46, fontWeight: 900, lineHeight: 1.1, whiteSpace: "nowrap" }}>
                <svg width={44} height={44} viewBox="0 0 24 24">
                  <path
                    d="M10 14 a4 4 0 0 0 5.6 0 l3-3 a4 4 0 0 0 -5.6 -5.6 l-1 1 M14 10 a4 4 0 0 0 -5.6 0 l-3 3 a4 4 0 0 0 5.6 5.6 l1 -1"
                    fill="none"
                    stroke={C.navy}
                    strokeWidth={2.4}
                    strokeLinecap="round"
                  />
                </svg>
                {t.link}
              </div>
              <div style={{ fontSize: 46, fontWeight: 800, color: "#3A4F80", lineHeight: 1.1 }}>{t.or}</div>
              <div style={{ marginTop: 14, width: "100%", padding: "18px 0 22px", borderRadius: 28, backgroundColor: C.greenSoft, border: "4px solid #BFE3CB" }}>
                <div style={{ fontSize: 46, fontWeight: 900, color: C.green }}>{t.whatsappLabel}</div>
                <div style={{ fontSize: 104, fontWeight: 1000, letterSpacing: 1, lineHeight: 1.05, color: C.navy }}>{t.whatsappNumber}</div>
              </div>
            </div>
          </div>
        </Paper>
      </div>
    </div>
  );
};
