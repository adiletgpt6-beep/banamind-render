// Сцена 6 (≈56 с – конец): жёлтые линии-шнурки пролетают через кадр и
// складываются в стрелки маршрута, появляется логотип; рядом — маленькие
// красные кроссовки (мотив ролика). Затем неподвижный финальный экран:
// «Бишкек • Балдар үчүн такси», ҮЙ → МЕКТЕП → ҮЙ, «Профилдеги шилтемеге
// өтүңүз», «же WhatsApp аркылуу жазыңыз» и крупно «WhatsApp: 0998 08 38 28».
// Оба способа связи и номер видны одновременно с BG14_CONTACTS_IN до
// последнего кадра (≥ 5 с), после последнего слова экран держится ≥ 3 с.
// Всё в безопасной зоне Reels: сверху ≥ 250 px, снизу ≥ 400 px, справа ≥ 150 px.
import { Img, staticFile, useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { C } from "../palette";
import { clamp, easeInOut, easeOut } from "../rig/motion";
import { BG14_CONTACTS_IN, BG14_TEXT, BG14_VIDEO } from "../script";
import { Sneakers } from "../sneakers";

const LOGO = { x: 540, y: 400, r: 120 };

export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = BG14_TEXT.cta;
  const contactAt = Math.round(BG14_CONTACTS_IN * BG14_VIDEO.fps);
  const a = (at: number, d = 10) => easeOut((f - at) / d);
  const item = (at: number): React.CSSProperties => ({ opacity: a(at), translate: `0 ${(1 - a(at)) * 22}px` });
  // две жёлтые линии-шнурка пролетают и сворачиваются в круг логотипа
  const sweep = easeInOut(f / 18);
  const ring = clamp((f - 10) / 10);
  const logo = easeOut((f - 12) / 10);
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF", fontFamily, color: C.navy, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: -220, top: -240, width: 760, height: 760, borderRadius: 380, backgroundColor: C.yellowSoft }} />
      <div style={{ position: "absolute", right: -200, bottom: -180, width: 620, height: 620, borderRadius: 310, backgroundColor: "#EAF3FC" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {ring < 1 ? (
          <g fill="none" strokeLinecap="round" opacity={1 - ring}>
            <path d={`M -100 ${700 - 300 * sweep} Q 300 ${300} ${LOGO.x - LOGO.r} ${LOGO.y}`} stroke={C.yellow} strokeWidth={18} strokeDasharray={`${1000 * sweep} 1000`} />
            <path d={`M 1180 ${780 - 300 * sweep} Q 780 ${520} ${LOGO.x + LOGO.r} ${LOGO.y}`} stroke={C.yellow} strokeWidth={18} strokeDasharray={`${1000 * sweep} 1000`} />
          </g>
        ) : null}
        <circle cx={LOGO.x} cy={LOGO.y} r={LOGO.r + 12} fill="none" stroke={C.yellow} strokeWidth={14} strokeDasharray={`${2 * Math.PI * (LOGO.r + 12) * ring} 2000`} transform={`rotate(-90 ${LOGO.x} ${LOGO.y})`} />
      </svg>
      <div style={{ position: "absolute", left: LOGO.x - LOGO.r, top: LOGO.y - LOGO.r, width: LOGO.r * 2, height: LOGO.r * 2, opacity: logo, transform: `scale(${0.6 + 0.4 * logo})` }}>
        <Img src={staticFile(BG14_VIDEO.logo)} style={{ width: LOGO.r * 2, height: LOGO.r * 2, borderRadius: LOGO.r, objectFit: "cover", boxShadow: "0 24px 50px rgba(20,40,90,0.18)" }} />
      </div>
      {/* мотив ролика: маленькие красные кроссовки с жёлтыми шнурками */}
      <div style={{ opacity: a(14) }}>
        <Sneakers x={92} y={500} s={0.3} f={f} tie={1} laceColor={C.yellow} jitter={0} />
      </div>
      <div style={{ position: "absolute", left: 90, right: 150, top: 548, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, textAlign: "center" }}>
        <div style={{ ...item(14), fontSize: 108, fontWeight: 900, lineHeight: 1 }}>{t.brand}</div>
        <div style={{ ...item(18), padding: "12px 34px", borderRadius: 999, backgroundColor: C.navy, color: "#FFFFFF", fontSize: 48, fontWeight: 900 }}>{t.city}</div>
        <div style={{ ...item(20), padding: "8px 30px", borderRadius: 999, backgroundColor: C.yellow, fontSize: 42, fontWeight: 900 }}>{t.route}</div>
        {/* оба способа связи и номер — вместе, неподвижно, до конца ролика */}
        <div style={{ opacity: a(contactAt, 8), marginTop: 14, width: "100%", padding: "26px 20px", borderRadius: 32, border: "4px solid #DCE3EE", backgroundColor: "#F8FAFD", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, boxSizing: "border-box" }}>
          <div style={{ fontSize: 46, fontWeight: 900, lineHeight: 1.1 }}>🔗 {t.link}</div>
          <div style={{ fontSize: 42, fontWeight: 800, color: "#3A4F80", lineHeight: 1.1 }}>{t.or}</div>
          <div style={{ marginTop: 8, width: "100%", padding: "16px 0 18px", borderRadius: 24, backgroundColor: "#E8F6EC", border: "3px solid #BFE3CB" }}>
            <div style={{ fontSize: 44, fontWeight: 900, color: "#1F7A45" }}>{t.whatsappLabel}</div>
            <div style={{ fontSize: 96, fontWeight: 900, letterSpacing: 1, lineHeight: 1.05, color: C.navy }}>{t.whatsappNumber}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
