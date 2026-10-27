// Сцена 6 (финал): три «майда нерсе» разлетаются из центра и уходят из
// кадра, остаётся неподвижный бело-жёлтый финальный экран: логотип
// BalaGo, «Бишкек • Балдар үчүн такси», ҮЙ → МЕКТЕП → ҮЙ,
// «Профилдеги шилтемеге өтүңүз», «же WhatsApp аркылуу жазыңыз» и крупно
// «WhatsApp: 0998 08 38 28». Оба способа связи, город и номер видны
// одновременно с BG29_CONTACTS_IN до последнего кадра (≥ 5 с), после
// последнего слова экран держится ≥ 3 с. Безопасная зона Reels: сверху
// ≥ 250 px, снизу ≥ 400 px, справа ≥ 150 px.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { appear, easeIn, easeOut } from "../anim";
import { C } from "../palette";
import { Belt, Bottle, Logo, PickupCard } from "../parts";
import { BG29_CONTACTS_IN, BG29_TEXT, BG29_VIDEO } from "../script";

const LOGO = { x: 540, y: 420, r: 120 } as const;

export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = BG29_TEXT.cta;
  const contactAt = Math.round(BG29_CONTACTS_IN * BG29_VIDEO.fps);
  const item = (at: number): React.CSSProperties => ({ opacity: appear(f, at, 10), translate: `0 ${(1 - appear(f, at, 10)) * 22}px` });
  const logo = easeOut((f - 6) / 12);
  // предметы уходят из кадра в первые ≈ 0,7 с
  const away = easeIn(f / 22);
  const gone = away >= 1;
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF", fontFamily, color: C.navy, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: -220, top: -240, width: 760, height: 760, borderRadius: 380, backgroundColor: C.yellowSoft }} />
      <div style={{ position: "absolute", right: -200, bottom: -180, width: 620, height: 620, borderRadius: 310, backgroundColor: C.sky }} />
      {gone ? null : (
        <>
          <Belt x={540 - away * 900} y={960 - away * 500} s={0.7} rotate={-away * 60} />
          <Bottle x={540} y={960 + away * 1200} s={0.75} rotate={away * 40} label="0,5 л" />
          <PickupCard x={540 + away * 900} y={960 - away * 400} s={0.7} rotate={away * 50} text={BG29_TEXT.hook.card} />
        </>
      )}
      <Logo x={LOGO.x} y={LOGO.y} r={LOGO.r} opacity={logo} scale={0.6 + 0.4 * logo} />
      <div style={{ position: "absolute", left: 90, right: 150, top: 570, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, textAlign: "center" }}>
        <div style={{ ...item(10), fontSize: 104, fontWeight: 900, lineHeight: 1 }}>{t.brand}</div>
        {/* город, оба способа связи и номер — вместе, неподвижно, до конца ролика */}
        <div style={{ opacity: appear(f, contactAt, 8), display: "flex", flexDirection: "column", alignItems: "center", gap: 18, width: "100%" }}>
          <div style={{ padding: "10px 32px", borderRadius: 999, backgroundColor: C.navy, color: "#FFFFFF", fontSize: 48, fontWeight: 900, whiteSpace: "nowrap" }}>{t.city}</div>
          <div style={{ padding: "8px 26px", borderRadius: 999, backgroundColor: C.yellow, fontSize: 38, fontWeight: 900 }}>{t.route}</div>
          <div
            style={{
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
            <div style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.1, whiteSpace: "nowrap" }}>🔗 {t.link}</div>
            <div style={{ fontSize: 42, fontWeight: 800, color: "#3A4F80", lineHeight: 1.1 }}>{t.or}</div>
            <div style={{ marginTop: 8, width: "100%", padding: "14px 0 16px", borderRadius: 24, backgroundColor: "#E8F6EC", border: "3px solid #BFE3CB" }}>
              <div style={{ fontSize: 44, fontWeight: 900, color: "#1F7A45" }}>{t.whatsappLabel}</div>
              <div style={{ fontSize: 100, fontWeight: 900, letterSpacing: 1, lineHeight: 1.05, color: C.navy, whiteSpace: "nowrap" }}>{t.whatsappNumber}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
