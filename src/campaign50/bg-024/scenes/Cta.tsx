// Сцена 6 (финал): четыре детали пазла сходятся вокруг логотипа BalaGo,
// вместо обещания срока — «Алдын ала катталыңыз». Затем неподвижный
// финальный экран: «Бишкек • Балдар үчүн такси», ҮЙ → МЕКТЕП → ҮЙ,
// «Профилдеги шилтемеге өтүңүз», «же WhatsApp аркылуу жазыңыз» и крупно
// «WhatsApp: 0998 08 38 28». Оба способа связи и номер видны одновременно
// с BG24_CONTACTS_IN до последнего кадра (≥ 5 с), после последнего слова
// экран держится ≥ 3 с. Безопасная зона Reels: сверху ≥ 250 px, снизу
// ≥ 400 px, справа ≥ 150 px.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { appear, easeOut, snap } from "../anim";
import { C } from "../palette";
import { Logo, piecePath } from "../parts";
import { BG24_CONTACTS_IN, BG24_TEXT, BG24_VIDEO } from "../script";

const LOGO = { x: 540, y: 400, r: 112 } as const;

export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = BG24_TEXT.cta;
  const contactAt = Math.round(BG24_CONTACTS_IN * BG24_VIDEO.fps);
  const item = (at: number): React.CSSProperties => ({ opacity: appear(f, at, 10), translate: `0 ${(1 - appear(f, at, 10)) * 22}px` });
  const join = snap(f / 20);
  const logo = easeOut((f - 10) / 12);
  const corners = [
    { dx: -1, dy: -1, rot: 0 },
    { dx: 1, dy: -1, rot: 90 },
    { dx: 1, dy: 1, rot: 180 },
    { dx: -1, dy: 1, rot: 270 },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF", fontFamily, color: C.navy, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: -220, top: -240, width: 760, height: 760, borderRadius: 380, backgroundColor: C.yellowSoft }} />
      <div style={{ position: "absolute", right: -200, bottom: -180, width: 620, height: 620, borderRadius: 310, backgroundColor: C.sky }} />
      {/* детали пазла сходятся вокруг логотипа */}
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {corners.map((c, i) => {
          const dist = 1 + (1 - join) * 2.4;
          return (
            <g key={i} transform={`translate(${LOGO.x + c.dx * dist * 196} ${LOGO.y + c.dy * dist * 92}) rotate(${c.rot + (1 - join) * 40})`} opacity={Math.min(1, f / 6)}>
              <path d={piecePath(84, 64)} transform="translate(-42 -32)" fill={i % 2 ? C.yellow : C.navy} />
            </g>
          );
        })}
      </svg>
      <Logo x={LOGO.x} y={LOGO.y} r={LOGO.r} opacity={logo} scale={0.6 + 0.4 * logo} />
      <div style={{ position: "absolute", left: 90, right: 150, top: 540, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}>
        <div style={{ ...item(12), fontSize: 100, fontWeight: 900, lineHeight: 1 }}>{t.brand}</div>
        <div style={{ ...item(16), padding: "10px 32px", borderRadius: 999, backgroundColor: C.navy, color: "#FFFFFF", fontSize: 46, fontWeight: 900 }}>{t.city}</div>
        <div style={{ ...item(19), display: "flex", gap: 14 }}>
          <div style={{ padding: "8px 26px", borderRadius: 999, backgroundColor: C.yellow, fontSize: 38, fontWeight: 900 }}>{t.route}</div>
        </div>
        <div style={{ ...item(22), fontSize: 46, fontWeight: 900 }}>✍️ {t.early}</div>
        {/* оба способа связи и номер — вместе, неподвижно, до конца ролика */}
        <div
          style={{
            opacity: appear(f, contactAt, 8),
            marginTop: 6,
            width: "100%",
            padding: "24px 20px",
            borderRadius: 32,
            border: "4px solid #DCE3EE",
            backgroundColor: "#F8FAFD",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            boxSizing: "border-box",
          }}
        >
          <div style={{ fontSize: 42, fontWeight: 900, lineHeight: 1.1, whiteSpace: "nowrap" }}>🔗 {t.link}</div>
          <div style={{ fontSize: 42, fontWeight: 800, color: "#3A4F80", lineHeight: 1.1 }}>{t.or}</div>
          <div style={{ marginTop: 8, width: "100%", padding: "14px 0 16px", borderRadius: 24, backgroundColor: "#E8F6EC", border: "3px solid #BFE3CB" }}>
            <div style={{ fontSize: 44, fontWeight: 900, color: "#1F7A45" }}>{t.whatsappLabel}</div>
            <div style={{ fontSize: 96, fontWeight: 900, letterSpacing: 1, lineHeight: 1.05, color: C.navy }}>{t.whatsappNumber}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
