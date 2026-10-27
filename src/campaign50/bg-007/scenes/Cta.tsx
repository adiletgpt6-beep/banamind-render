// Сцена 6 (≈53 с – конец): календарь складывается в логотип BalaGo,
// затем неподвижный финальный экран: «Бишкек • Балдар үчүн такси»,
// маршрут, «Профилдеги шилтемеге өтүңүз», «же WhatsApp аркылуу
// жазыңыз» и крупно «WhatsApp: 0998 08 38 28». Оба способа связи и номер
// видны одновременно с BG7_CONTACTS_IN до последнего кадра (≥ 5 с), после
// последнего слова экран держится ≥ 3 с. Всё в безопасной зоне Reels:
// сверху ≥ 250 px, снизу ≥ 400 px, справа ≥ 150 px.
import { Img, staticFile, useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { C } from "../calendar";
import { clamp, easeInOut, easeOut, hash01, lerp } from "../rig/motion";
import { BG7_CONTACTS_IN, BG7_TEXT, BG7_VIDEO } from "../script";

const LOGO = { x: 510, y: 420, r: 130 };
const TILE_COLORS = ["#2E4377", "#4C7BD9", "#7A8BB0", C.yellow];

export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = BG7_TEXT.cta;
  const contactAt = Math.round(BG7_CONTACTS_IN * BG7_VIDEO.fps);
  const a = (at: number, d = 10) => easeOut((f - at) / d);
  const item = (at: number): React.CSSProperties => ({ opacity: a(at), translate: `0 ${(1 - a(at)) * 22}px` });
  // плитки календаря слетаются в круг логотипа
  const tiles = Array.from({ length: 30 }).map((_, i) => {
    const col = i % 5;
    const row = Math.floor(i / 5);
    const sx = 150 + col * 170;
    const sy = 360 + row * 150;
    const u = easeInOut((f - (i % 7)) / 22);
    const ang = hash01(i + 3) * Math.PI * 2;
    const tx = LOGO.x + Math.cos(ang) * LOGO.r * 0.5 - 40;
    const ty = LOGO.y + Math.sin(ang) * LOGO.r * 0.5 - 30;
    return { x: lerp(sx, tx, u), y: lerp(sy, ty, u), rot: u * (hash01(i) * 180 - 90), s: lerp(1, 0.3, u), o: 1 - clamp((f - 16 - (i % 7)) / 8), c: TILE_COLORS[(i * 7) % 4] };
  });
  const logo = easeOut((f - 14) / 12);
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF", fontFamily, color: C.navy, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: -220, top: -240, width: 760, height: 760, borderRadius: 380, backgroundColor: C.yellowSoft }} />
      <div style={{ position: "absolute", right: -200, bottom: -180, width: 620, height: 620, borderRadius: 310, backgroundColor: "#EAF3FC" }} />
      {tiles.map((p, i) =>
        p.o > 0 ? <div key={i} style={{ position: "absolute", left: p.x, top: p.y, width: 140, height: 110, borderRadius: 12, backgroundColor: p.c, opacity: p.o, transform: `rotate(${p.rot}deg) scale(${p.s})` }} /> : null,
      )}
      <div style={{ position: "absolute", left: LOGO.x - LOGO.r, top: LOGO.y - LOGO.r, width: LOGO.r * 2, height: LOGO.r * 2, opacity: logo, transform: `scale(${0.6 + 0.4 * logo})` }}>
        <Img src={staticFile(BG7_VIDEO.logo)} style={{ width: LOGO.r * 2, height: LOGO.r * 2, borderRadius: LOGO.r, objectFit: "cover", boxShadow: "0 24px 50px rgba(20,40,90,0.18)" }} />
      </div>
      <div style={{ position: "absolute", left: 90, right: 150, top: 572, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, textAlign: "center" }}>
        <div style={{ ...item(16), fontSize: 112, fontWeight: 900, lineHeight: 1 }}>{t.brand}</div>
        <div style={{ ...item(20), padding: "12px 34px", borderRadius: 999, backgroundColor: C.navy, color: "#FFFFFF", fontSize: 48, fontWeight: 900 }}>{t.city}</div>
        <div style={{ ...item(22), padding: "8px 30px", borderRadius: 999, backgroundColor: C.yellow, fontSize: 42, fontWeight: 900 }}>{t.route}</div>
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
