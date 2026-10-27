// Сцена 15. Контактная карточка — ровно последние 150 кадров (5 с).
// Фирменный жёлтый фон, тёмный читаемый текст, логотип BalaGo. Все строки
// видны с первого кадра; двигается только фоновый акцент. Номер не
// озвучивается.
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { clamp, easeOut } from "../rig/motion";
import { T3B_TEXT } from "../script";
import { C, F } from "../theme";
import { box } from "../kit";

export const ContactScene: React.FC = () => {
  const f = useCurrentFrame();
  const k = easeOut(clamp(f / 20));
  const t = T3B_TEXT.cta;
  return (
    <AbsoluteFill style={{ backgroundColor: C.yellow }}>
      {/* фоновый акцент: мягкий тёплый круг и янтарная линия (как карандаш) */}
      <div style={box({ left: 560 + (1 - k) * 120, top: -220, width: 760, height: 760, borderRadius: "50%", backgroundColor: "#FFE38A" })} />
      <div style={box({ left: -100, top: 1640, width: 1300 * (0.4 + 0.6 * k), height: 16, borderRadius: 8, backgroundColor: C.amber, transform: "rotate(-4deg)" })} />
      <Img src={staticFile("assets/logo.png")} style={box({ left: 320, top: 210, width: 440, height: 440 })} />
      <div style={box({ left: 70, top: 690, width: 940, textAlign: "center", fontFamily: F.display, fontWeight: 900, color: C.navy })}>
        <div style={{ fontSize: 150, lineHeight: 1 }}>{t.brand}</div>
        <div style={{ fontSize: 64, lineHeight: 1.1, marginTop: 14 }}>{t.tagline}</div>
        <div style={{ fontSize: 66, lineHeight: 1.1, marginTop: 70 }}>{t.call}</div>
        <div style={{ fontFamily: F.text, fontWeight: 800, fontSize: 50, marginTop: 24 }}>{t.link}</div>
        <div style={{ display: "inline-block", marginTop: 46, padding: "18px 30px 22px", backgroundColor: C.navy, color: C.yellow, fontSize: 62, lineHeight: 1, whiteSpace: "nowrap", borderRadius: 14 }}>{t.whatsapp}</div>
      </div>
    </AbsoluteFill>
  );
};
