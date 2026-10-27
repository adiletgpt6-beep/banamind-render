// Сцена 6 (52,5–72 с): слайд превращается в финальный экран BalaGo.
// Белый фон, ярко-жёлтые акценты, тёмно-синий текст. Через ≈ 0,5 с все
// элементы на месте и дальше неподвижны до конца: «Бишкек • Балдар үчүн
// такси», оба способа связи и полный номер WhatsApp 0998 08 38 28 —
// одновременно ≈ 19 с, после последнего слова диктора ≥ 3 с. Всё —
// в безопасной зоне Reels/Shorts (сверху 250, снизу 400, справа 150 px).
import { Img, staticFile, useCurrentFrame } from "remotion";
import { ASSETS, COLORS } from "../../../config";
import { fontFamily } from "../../../fonts";
import { easeInOut, easeOut } from "../rig/motion";
import { B6_TEXT } from "../script";
import { Slide } from "../screens";
import { box } from "../shots";

const SL = { x: 40, y: 380, w: 1000 };

export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = B6_TEXT.cta;
  // переход: слайд «Кантип башталат» приближается и растворяется в белом
  const push = easeInOut(f / 14);
  const a = (at: number) => easeOut((f - at) / 8);
  const item = (at: number): React.CSSProperties => ({ opacity: a(at), translate: `0 ${(1 - a(at)) * 18}px` });
  return (
    <div style={box({ inset: 0, backgroundColor: "#FFFFFF", fontFamily, color: COLORS.navy, overflow: "hidden" })}>
      {f < 16 ? (
        <div style={box({ inset: 0, backgroundColor: "#EEF0F2", opacity: 1 - push })}>
          <div style={box({ left: SL.x, top: SL.y, width: SL.w, height: (SL.w * 9) / 16, overflow: "hidden", scale: `${1 + 0.9 * push}` })}>
            <Slide w={SL.w} s={{ reveal: 1, route: 1, terms: 1, lit: 3.6 }} />
          </div>
        </div>
      ) : null}
      <div style={box({ left: -220, top: -240, width: 760, height: 760, borderRadius: 380, backgroundColor: COLORS.yellowSoft, opacity: a(4) })} />
      <div style={box({ right: -200, bottom: -180, width: 620, height: 620, borderRadius: 310, backgroundColor: COLORS.sky, opacity: a(4) })} />
      <div style={box({ left: 90, right: 150, top: 250, display: "flex", flexDirection: "column", alignItems: "center", gap: 22, textAlign: "center" })}>
        <div style={item(2)}>
          <Img src={staticFile(ASSETS.logo)} style={{ width: 210, height: 210, borderRadius: 105, objectFit: "cover", boxShadow: "0 20px 44px rgba(20,40,90,0.18)" }} />
        </div>
        <div style={{ ...item(4), fontSize: 112, fontWeight: 900, lineHeight: 1 }}>{t.brand}</div>
        <div style={{ ...item(6), padding: "16px 34px", borderRadius: 999, backgroundColor: COLORS.yellow, fontSize: 52, fontWeight: 900 }}>{t.city}</div>
        <div style={{ ...item(8), fontSize: 44, fontWeight: 900, color: "#3A4F80", letterSpacing: 1 }}>{t.route}</div>
        <div style={{ ...item(10), width: "100%", marginTop: 6, padding: "24px 20px", borderRadius: 28, backgroundColor: COLORS.navy, color: "#FFFFFF", fontSize: 48, fontWeight: 900, lineHeight: 1.15 }}>🔗 {t.link}</div>
        <div style={{ ...item(10), fontSize: 42, fontWeight: 800, color: "#3A4F80" }}>{t.or}</div>
        <div style={{ ...item(12), width: "100%", padding: "22px 10px", borderRadius: 28, border: "5px solid #3E8E5E", backgroundColor: "#F2FAF3", lineHeight: 1.1 }}>
          <div style={{ fontSize: 50, fontWeight: 900, color: "#287241" }}>{t.whatsapp.split(" ")[0]}</div>
          <div style={{ fontSize: 96, fontWeight: 900, color: COLORS.navy, whiteSpace: "nowrap", marginTop: 4 }}>{t.whatsapp.split(" ").slice(1).join(" ")}</div>
        </div>
      </div>
    </div>
  );
};
