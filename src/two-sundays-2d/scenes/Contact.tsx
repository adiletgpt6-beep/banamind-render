// Сцена 15. Контактная карточка — ровно последние 150 кадров. Белый фон,
// жёлтый акцент, тёмно-синий текст; умеренное появление и спокойное
// удержание: шилтеме в шапке профиля и WhatsApp. Номер — только здесь (N13 — голос рассказчика, без
// цифр).
import { AbsoluteFill, Img, staticFile } from "remotion";
import { clamp } from "../rig/motion";
import { settle, useScene } from "../kit";
import { SU2_TEXT } from "../script";
import { C, F } from "../theme";

export const ContactScene: React.FC = () => {
  const { f } = useScene("contact");
  const T = SU2_TEXT.cta;
  const inn = (d: number) => ({ opacity: clamp((f - d) / 8), transform: `translateY(${(1 - settle(f - d, 16)) * 40}px)` });
  return (
    <AbsoluteFill style={{ backgroundColor: C.white }}>
      <div style={{ position: "absolute", left: 0, top: 1620, width: 1080, height: 300, backgroundColor: C.yellow, opacity: clamp(f / 10) }} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 170 }}>
        <div style={{ width: 460, height: 460, borderRadius: "50%", backgroundColor: C.white, border: `20px solid ${C.yellow}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", ...inn(2) }}>
          <Img src={staticFile("assets/logo.png")} style={{ width: 410, height: 410 }} />
        </div>
        <div style={{ marginTop: 26, fontFamily: F.display, fontWeight: 900, fontSize: 110, color: C.navy, ...inn(8) }}>{T.brand}</div>
        <div style={{ marginTop: 4, fontFamily: F.display, fontWeight: 900, fontSize: 60, color: C.navy, ...inn(12) }}>{T.tagline}</div>
        <div style={{ marginTop: 26, fontFamily: F.text, fontWeight: 800, fontSize: 44, color: C.inkSoft, ...inn(16) }}>{T.call}</div>
        <div style={{ marginTop: 44, width: 900, textAlign: "center", fontFamily: F.text, fontWeight: 800, fontSize: 52, lineHeight: 1.2, color: C.navy, ...inn(22) }}>
          {T.link}
          <br />
          {T.whatsapp}
        </div>
        <div style={{ marginTop: 26, padding: "20px 54px 24px", borderRadius: 60, backgroundColor: C.navy, color: C.white, fontFamily: F.display, fontWeight: 900, fontSize: 92, letterSpacing: 2, ...inn(28) }}>{T.phone}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
