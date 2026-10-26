// Сцена 13. Контактная карточка — ровно последние 150 кадров. Белый фон,
// жёлтый акцент, тёмно-синий текст; мягкое быстрое появление и спокойное
// удержание почти всего интервала. Номер WhatsApp — только здесь (N09 —
// голос рассказчика, номер не произносится).
import { AbsoluteFill, Img, staticFile } from "remotion";
import { clamp } from "../rig/motion";
import { settle, useScene } from "../kit";
import { KM2_TEXT } from "../script";
import { C, F } from "../theme";

export const ContactScene: React.FC = () => {
  const { f } = useScene("contact");
  const T = KM2_TEXT.cta;
  const inn = (d: number) => ({ opacity: clamp((f - d) / 8), transform: `translateY(${(1 - settle(f - d, 14)) * 36}px)` });
  return (
    <AbsoluteFill style={{ backgroundColor: C.white }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 26, backgroundColor: C.yellow, opacity: clamp(f / 8) }} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 230 }}>
        <div style={{ width: 400, height: 400, borderRadius: "50%", backgroundColor: C.white, border: `18px solid ${C.yellow}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", ...inn(0) }}>
          <Img src={staticFile("assets/logo.png")} style={{ width: 360, height: 360 }} />
        </div>
        <div style={{ marginTop: 30, fontFamily: F.display, fontWeight: 900, fontSize: 120, color: C.navy, ...inn(4) }}>{T.brand}</div>
        <div style={{ marginTop: 0, fontFamily: F.display, fontWeight: 900, fontSize: 64, color: C.navy, ...inn(7) }}>{T.tagline}</div>
        <div style={{ marginTop: 70, padding: "26px 50px 30px", borderRadius: 34, backgroundColor: C.yellow, display: "flex", flexDirection: "column", alignItems: "center", ...inn(11) }}>
          <div style={{ fontFamily: F.text, fontWeight: 800, fontSize: 50, color: C.navy }}>{T.whatsappLabel}</div>
          <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 96, letterSpacing: 2, color: C.navy }}>{T.phone}</div>
        </div>
        <div style={{ marginTop: 56, width: 900, textAlign: "center", fontFamily: F.text, fontWeight: 800, fontSize: 50, lineHeight: 1.22, color: C.navy, ...inn(15) }}>{T.link}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
