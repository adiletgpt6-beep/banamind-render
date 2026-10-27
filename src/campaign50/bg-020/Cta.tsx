// Финальная карточка. Начинается как обложка книги сына (белая с жёлтой
// полосой); за 0,4 с название книги растворяется, полоса становится
// плашкой «Бишкек • Балдар үчүн такси», появляются оба способа связи.
// С кадра 12 карточки (≈ 1,1 с от начала финала) всё неподвижно до конца:
// ссылка в профиле и WhatsApp 0998 08 38 28 одновременно, крупно, в
// безопасной зоне Reels (сверху ≥ 250, снизу ≥ 400, справа ≥ 150 px).
import { Img, staticFile } from "remotion";
import { ASSETS, COLORS } from "../../config";
import { fontFamily } from "../../fonts";
import { easeInOut, easeOut } from "../../two-schedules-2d/rig/motion";
import { BG020_TEXT } from "./script";

const T = BG020_TEXT;

export const CtaCard: React.FC<{ readonly f: number; readonly sloganAt: number }> = ({ f, sloganAt }) => {
  const m = easeInOut(f / 12); // обложка → карточка
  const a = (at: number) => easeOut((f - at) / 6);
  const item = (at: number): React.CSSProperties => ({ opacity: a(at), translate: `0 ${(1 - a(at)) * 16}px` });
  const underline = easeOut((f - sloganAt) / 14);
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF", fontFamily, color: COLORS.navy, overflow: "hidden" }}>
      {/* мягкие фирменные круги */}
      <div style={{ position: "absolute", left: -240, top: -260, width: 760, height: 760, borderRadius: 380, backgroundColor: COLORS.yellowSoft, opacity: m }} />
      <div style={{ position: "absolute", right: -220, bottom: -200, width: 640, height: 640, borderRadius: 320, backgroundColor: COLORS.sky, opacity: m }} />
      {/* обложка книги: название растворяется */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1240, textAlign: "center", opacity: 1 - m, fontSize: 96, fontWeight: 900, color: "#3A4F80" }}>
        {T.book.title}
        <div style={{ fontSize: 44, fontWeight: 800, marginTop: 10 }}>{T.book.sub}</div>
      </div>
      {/* жёлтая полоса обложки → плашка города */}
      <div
        style={{
          position: "absolute",
          left: 90 + (1 - m) * -90,
          width: 840 + (1 - m) * 240,
          top: 930 * (1 - m) + 640 * m,
          height: 210 * (1 - m) + 104 * m,
          borderRadius: 60 * m,
          backgroundColor: COLORS.yellow,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 52,
          fontWeight: 900,
          boxShadow: `0 16px 34px rgba(255,201,14,${0.4 * m})`,
        }}
      >
        <span style={{ opacity: a(6) }}>{T.cta.city}</span>
      </div>
      <div style={{ position: "absolute", left: 90, width: 840, top: 268, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={item(2)}>
          <Img src={staticFile(ASSETS.logo)} style={{ width: 210, height: 210, borderRadius: 105, objectFit: "cover", boxShadow: "0 20px 44px rgba(20,40,90,0.18)" }} />
        </div>
        <div style={{ ...item(4), fontSize: 120, fontWeight: 900, lineHeight: 1, marginTop: 22 }}>{T.cta.brand}</div>
      </div>
      <div style={{ position: "absolute", left: 90, width: 840, top: 780, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 26 }}>
        <div style={{ ...item(6), fontSize: 44, fontWeight: 900, letterSpacing: 1, color: "#2E4377" }}>{T.cta.route}</div>
        <div style={{ ...item(8), marginTop: 10, display: "flex", alignItems: "center", gap: 18, padding: "22px 38px", borderRadius: 30, backgroundColor: "#F4F7FB", border: "4px solid #DCE5F2" }}>
          <svg width={44} height={44} viewBox="0 0 44 44">
            <path d="M 22 38 L 22 8 M 10 20 L 22 8 L 34 20" fill="none" stroke={COLORS.navy} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: 44, fontWeight: 900, whiteSpace: "nowrap" }}>{T.cta.link}</span>
        </div>
        <div style={{ ...item(9), fontSize: 42, fontWeight: 800, color: "#3A4F80" }}>{T.cta.or}</div>
        <div style={{ ...item(10), padding: "20px 44px 26px", borderRadius: 30, backgroundColor: "#EFF8F1", border: "4px solid #BFE3C8", lineHeight: 1.1 }}>
          <div style={{ fontSize: 44, fontWeight: 900, color: "#1F7A3E" }}>{T.cta.whatsappLabel}</div>
          <div style={{ fontSize: 100, fontWeight: 900, letterSpacing: 1, marginTop: 6 }}>{T.cta.whatsappNumber}</div>
        </div>
        <div style={{ ...item(12), marginTop: 12, fontSize: 46, fontWeight: 900, position: "relative" }}>
          {T.cta.slogan}
          <div style={{ position: "absolute", left: 0, bottom: -8, height: 8, borderRadius: 4, width: `${underline * 100}%`, backgroundColor: COLORS.yellow }} />
        </div>
      </div>
    </div>
  );
};
