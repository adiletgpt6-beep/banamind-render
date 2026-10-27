// Сцена 19. Контактная карточка — ровно последние 150 кадров (5 с).
// Светлый фон, жёлтый акцент, крупный тёмный текст. Карточка появляется за
// 8 кадров и дальше неподвижна, чтобы контакты читались. N10 звучит в
// начале карточки и заканчивается до конца файла. Номер не озвучивается.
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { clamp, easeOut } from "../rig/motion";
import { IW2_TEXT } from "../script";
import { C, F } from "../theme";
import { box, Paper } from "../kit";

export const ContactScene: React.FC = () => {
  const f = useCurrentFrame();
  const k = easeOut(clamp(f / 8));
  const t = IW2_TEXT.cta;
  return (
    <AbsoluteFill style={{ backgroundColor: C.paper }}>
      <Paper />
      <div style={box({ left: -80, top: 230 - (1 - k) * 200, width: 1240, height: 560, backgroundColor: C.yellow, transform: "rotate(-4deg)" })} />
      <Img src={staticFile("assets/logo.png")} style={box({ left: 330, top: 250, width: 420, height: 420, transform: `scale(${0.9 + 0.1 * k})` })} />
      <div style={box({ left: 80, top: 860, width: 920, textAlign: "center", fontFamily: F.display, fontWeight: 900, color: C.ink })}>
        <div style={{ fontSize: 150, lineHeight: 1 }}>{t.brand}</div>
        <div style={{ fontSize: 64, lineHeight: 1.1, marginTop: 18 }}>{t.tagline}</div>
        <div style={{ display: "inline-block", marginTop: 70, padding: "20px 34px 24px", backgroundColor: C.ink, color: C.yellow, fontSize: 64, lineHeight: 1, whiteSpace: "nowrap" }}>{t.whatsapp}</div>
        <div style={{ fontFamily: F.text, fontWeight: 800, fontSize: 44, lineHeight: 1.25, marginTop: 50, color: C.inkSoft }}>{t.link}</div>
      </div>
    </AbsoluteFill>
  );
};
