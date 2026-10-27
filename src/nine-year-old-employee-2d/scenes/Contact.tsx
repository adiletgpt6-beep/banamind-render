// Сцена 13. Контактная карточка — ровно последние 150 кадров (5 с).
// Тёплый жёлтый фон, крупный чёрный текст, логотип BalaGo. Все строки,
// включая номер, видны с первого кадра и до конца; двигается только
// фоновый акцент в первые 8 кадров. Номер не озвучивается.
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { clamp, easeOut } from "../rig/motion";
import { NY2_TEXT } from "../script";
import { C, F } from "../theme";
import { box } from "../kit";

export const ContactScene: React.FC = () => {
  const f = useCurrentFrame();
  const k = easeOut(clamp(f / 8));
  const t = NY2_TEXT.cta;
  return (
    <AbsoluteFill style={{ backgroundColor: C.yellow }}>
      {/* фоновый акцент: оранжевый круг и синяя лента приходят за 8 кадров */}
      <div style={box({ left: 640 + (1 - k) * 400, top: -160, width: 640, height: 640, borderRadius: "50%", backgroundColor: C.orange, opacity: 0.9 })} />
      <div style={box({ left: -200, top: 1540 + (1 - k) * 300, width: 1500, height: 120, backgroundColor: C.blue, transform: "rotate(-6deg)" })} />
      <Img src={staticFile("assets/logo.png")} style={box({ left: 300, top: 190, width: 480, height: 480 })} />
      <div style={box({ left: 70, top: 700, width: 940, textAlign: "center", fontFamily: F.display, fontWeight: 900, color: C.ink })}>
        <div style={{ fontSize: 150, lineHeight: 1 }}>{t.brand}</div>
        <div style={{ fontSize: 64, lineHeight: 1.1, marginTop: 14 }}>{t.tagline}</div>
        <div style={{ fontSize: 70, lineHeight: 1.08, marginTop: 70 }}>{t.call}</div>
        <div style={{ fontFamily: F.text, fontWeight: 800, fontSize: 52, marginTop: 26 }}>{t.link}</div>
        <div style={{ display: "inline-block", marginTop: 46, padding: "18px 30px 22px", backgroundColor: C.ink, color: C.yellow, fontSize: 62, lineHeight: 1, whiteSpace: "nowrap" }}>{t.whatsapp}</div>
      </div>
    </AbsoluteFill>
  );
};
