// Сцена 15. Контактная карточка — ровно последние 150 кадров (5 с).
// Светлый фон, жёлтый акцент, крупный тёмно-синий текст, логотип BalaGo.
// Быстрое мягкое появление (≈ 10 кадров), затем всё неподвижно — текст
// успевают прочитать. Номер появляется только здесь и не озвучивается
// (N09 — «BalaGo — балдар үчүн такси»).
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { clamp, easeOut } from "../rig/motion";
import { TE2_TEXT } from "../script";
import { C, F } from "../theme";
import { box } from "../kit";

export const ContactScene: React.FC = () => {
  const f = useCurrentFrame();
  const k = easeOut(clamp(f / 10));
  const t = TE2_TEXT.cta;
  return (
    <AbsoluteFill style={{ backgroundColor: C.paper }}>
      {/* жёлтый акцент: круг за логотипом и полоса внизу */}
      <div style={box({ left: 540 - 330, top: 210 + (1 - k) * 30, width: 660, height: 660, borderRadius: "50%", backgroundColor: C.yellow, opacity: k })} />
      <div style={box({ left: 0, top: 1560, width: 1080, height: 22, backgroundColor: C.yellow, transform: `scaleX(${k})`, transformOrigin: "50% 50%" })} />
      <Img src={staticFile("assets/logo.png")} style={box({ left: 290, top: 260 + (1 - k) * 20, width: 500, height: 497, opacity: k, borderRadius: "50%" })} />
      <div style={box({ left: 80, top: 860, width: 920, textAlign: "center", color: C.navy, opacity: clamp(f / 6) })}>
        <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 150, lineHeight: 1 }}>{t.brand}</div>
        <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 66, lineHeight: 1.1, marginTop: 16 }}>{t.tagline}</div>
        <div style={{ display: "inline-block", marginTop: 64, padding: "20px 34px 24px", backgroundColor: C.navy, color: C.yellow, fontFamily: F.display, fontWeight: 900, fontSize: 64, lineHeight: 1, whiteSpace: "nowrap", borderRadius: 18 }}>{t.whatsapp}</div>
        <div style={{ fontFamily: F.text, fontWeight: 800, fontSize: 46, lineHeight: 1.25, marginTop: 44 }}>{t.link}</div>
      </div>
    </AbsoluteFill>
  );
};
