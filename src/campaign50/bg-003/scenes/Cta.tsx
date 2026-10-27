// Сцена 6, финальный экран. Жёлтые песочные часы (символ обеда)
// разворачиваются в кольцо вокруг логотипа BalaGo; затем «Бишкек • Балдар
// үчүн такси», маршрут ҮЙ → МЕКТЕП → ҮЙ и ОБА способа связи одновременно:
// «Профилдеги шилтемеге өтүңүз», «же WhatsApp аркылуу жазыңыз» и крупно
// «WhatsApp: 0998 08 38 28». Всё появляется за ≈ 0,6 с после начала сцены
// и дальше стоит неподвижно до конца ролика — в безопасной зоне (выше
// нижнего интерфейса Reels/Shorts, левее колонки кнопок).
import { Img, staticFile } from "remotion";
import { fontFamily } from "../../../fonts";
import { ArrowText, easeInOut, easeOut, Hourglass, lerp, LinkIcon, NAVY, prog, WA_GREEN, WaIcon, YELLOW, YELLOW_SOFT } from "../art";
import type { Bg3Beats } from "../beats";
import { BG3_TEXT } from "../script";

const T = BG3_TEXT.cta;
const LOGO = { x: 300, y: 330, r: 95 }; // центр логотипа в кадре

export const Cta: React.FC<{ readonly t: number; readonly b: Bg3Beats }> = ({ t, b }) => {
  const from = b.cta.from;
  const bgIn = easeOut(prog(t, from - 0.45, 0.4));
  // песочные часы из центра → поворот → кольцо логотипа
  const fly = easeInOut(prog(t, from - 0.4, 0.75));
  const ring = easeOut(prog(t, from + 0.2, 0.35));
  const a = (k: number) => {
    const u = easeOut(prog(t, from + 0.1 + k * 0.05, 0.35));
    return { opacity: Math.min(1, u * 1.4), transform: `translateY(${(1 - u) * 22}px)` };
  };
  const drift = Math.sin(t * 0.8) * 10;
  const gx = lerp(540, LOGO.x, fly);
  const gy = lerp(900, LOGO.y, fly);
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF", fontFamily, overflow: "hidden", opacity: bgIn }}>
      <div style={{ position: "absolute", left: -220 + drift, top: -260, width: 640, height: 640, borderRadius: 320, backgroundColor: YELLOW_SOFT }} />
      <div style={{ position: "absolute", right: -260 - drift, bottom: -200, width: 620, height: 620, borderRadius: 310, backgroundColor: "#EAF1FB" }} />
      {ring < 1 ? (
        <div style={{ position: "absolute", left: gx - 90, top: gy - 117, width: 180, transform: `rotate(${fly * 90}deg) scale(${1 - ring})`, opacity: 1 - ring }}>
          <Hourglass size={180} sand={1} t={t} />
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 66, right: 126, top: 235, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <div style={{ position: "relative", width: 190, height: 190, opacity: ring }}>
            <div style={{ position: "absolute", inset: -14, borderRadius: 110, border: `12px solid ${YELLOW}`, transform: `scale(${lerp(0.4, 1, ring)})` }} />
            <Img src={staticFile("assets/logo.png")} style={{ width: 190, height: 190, borderRadius: 95, boxShadow: "0 12px 30px rgba(20,40,90,0.18)", transform: `scale(${lerp(0.6, 1, ring)})` }} />
          </div>
          <div style={{ ...a(0), fontSize: 116, fontWeight: 1000, color: NAVY, lineHeight: 1 }}>{T.brand}</div>
        </div>
        <div style={{ ...a(1), marginTop: 40, padding: "16px 34px", borderRadius: 50, backgroundColor: YELLOW, fontSize: 52, fontWeight: 1000, color: NAVY, whiteSpace: "nowrap" }}>{T.city}</div>
        <div style={{ ...a(2), marginTop: 26, fontSize: 44, fontWeight: 1000, color: NAVY, letterSpacing: 2, display: "flex", alignItems: "center" }}>
          <ArrowText text={T.route} size={44} />
        </div>
        {/* 1: ссылка в профиле */}
        <div style={{ ...a(3), marginTop: 50, width: "100%", padding: "28px 26px", boxSizing: "border-box", borderRadius: 32, backgroundColor: "#F3F6FB", border: "4px solid #DCE3EE", display: "flex", alignItems: "center", gap: 22 }}>
          <div style={{ width: 88, height: 88, flexShrink: 0, borderRadius: 44, backgroundColor: NAVY, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LinkIcon size={52} />
          </div>
          <div style={{ fontSize: 56, fontWeight: 1000, color: NAVY, textAlign: "left", lineHeight: 1.12 }}>{T.link}</div>
        </div>
        <div style={{ ...a(4), marginTop: 26, fontSize: 50, fontWeight: 900, color: "#33415E" }}>{T.or}</div>
        {/* 2: WhatsApp — полный номер крупно */}
        <div style={{ ...a(5), marginTop: 24, width: "100%", padding: "28px 22px", boxSizing: "border-box", borderRadius: 36, backgroundColor: "#E7F7EC", border: `5px solid ${WA_GREEN}`, display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 100, height: 100, flexShrink: 0, borderRadius: 50, backgroundColor: WA_GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <WaIcon size={60} />
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 52, fontWeight: 1000, color: "#1E7A44", lineHeight: 1 }}>{T.whatsappLabel}</div>
            <div style={{ fontSize: 94, fontWeight: 1000, color: NAVY, lineHeight: 1.08, whiteSpace: "nowrap", letterSpacing: 1 }}>{T.whatsappNumber}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
