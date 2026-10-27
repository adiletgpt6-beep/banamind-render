import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { Paper } from "./frame";
import { LinkIcon, PinIcon, WaIcon } from "./parts";
import { BG23_CTA, BG23_CTA_FADE_IN } from "./script";
import { C, PIECE, clamp, ease, pop, sec } from "./theme";

// Финал: маршрут-пазл сворачивается в фирменную карточку. Город, ссылка
// в профиле и WhatsApp появляются вместе за BG23_CTA_FADE_IN с и стоят
// неподвижно до последнего кадра. goAt — начало реплики «...жолго чыгалы!».
export const CtaScene: React.FC<{ readonly goAt: number }> = ({ goAt }) => {
  const f = useCurrentFrame();
  const sweep = ease(f, 0, 0.6);
  const show = interpolate(f, [sec(0.1), sec(BG23_CTA_FADE_IN)], [0, 1], clamp);
  const logo = pop(f, 0.05, 15);
  const go = pop(f, goAt - 0.1, 16);
  return (
    <>
      <Paper />
      {/* три цветные полосы маршрута сходятся в карточку */}
      {PIECE.slice(0, 3).map((c, i) => (
        <div key={i} style={{ position: "absolute", left: 0, top: 300 + i * 26, height: 14, width: 1080 * sweep, background: c, borderRadius: 7, opacity: 0.85 }} />
      ))}
      <div style={{ position: "absolute", left: 90, width: 840, top: 370, display: "flex", flexDirection: "column", alignItems: "center", fontFamily, color: C.navy }}>
        <div style={{ width: 180, height: 180, borderRadius: 90, overflow: "hidden", background: "#fff", boxShadow: `0 24px 60px ${C.shadow}`, transform: `scale(${logo})` }}>
          <Img src={staticFile("assets/logo.png")} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
        <div style={{ opacity: show, display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
          <div style={{ marginTop: 30, display: "flex", alignItems: "center", gap: 14, padding: "16px 34px", borderRadius: 40, background: C.yellow, border: `4px solid ${C.navy}`, fontWeight: 900, fontSize: 46 }}>
            <PinIcon size={44} /> {BG23_CTA.city}
          </div>
          <div style={{ marginTop: 46, display: "flex", alignItems: "center", gap: 16, fontWeight: 900, fontSize: 46, whiteSpace: "nowrap" }}>
            <LinkIcon size={54} /> {BG23_CTA.link}
          </div>
          <div style={{ marginTop: 20, fontWeight: 800, fontSize: 42, color: C.navySoft }}>{BG23_CTA.or}</div>
          <div style={{ marginTop: 26, width: "100%", padding: "24px 0 30px", borderRadius: 40, background: C.navy, color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", boxShadow: `0 24px 50px ${C.shadow}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, fontWeight: 900, fontSize: 46 }}>
              <WaIcon size={58} /> WhatsApp:
            </div>
            <div style={{ fontWeight: 1000, fontSize: 96, letterSpacing: 2, color: C.yellow, lineHeight: 1.1, whiteSpace: "nowrap" }}>0998 08 38 28</div>
          </div>
        </div>
        <div style={{ marginTop: 36, fontWeight: 900, fontSize: 56, opacity: go, transform: `translateY(${(1 - go) * 24}px)` }}>{BG23_CTA.go}</div>
      </div>
    </>
  );
};
