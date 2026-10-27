// 6. Финал. Шутка окончена: страница BalaGo на мониторе мамы плавно
// разворачивается в фирменный экран (без бегущей строки и дрожания).
// Город, ссылка в профиле и WhatsApp 0998 08 38 28 видны вместе через
// CTA_REVEAL с после начала сцены и стоят неподвижно до последнего кадра.
import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { fontFamily } from "../../../fonts";
import { Camera, mixCam } from "../Camera";
import { useScene } from "../context";
import { BG42_CTA } from "../script";
import { BrowserScreen } from "../sets/Screens";
import { MONITOR_SCREEN } from "../sets/Office";
import { C, clamp, easeInOut, pop, ramp } from "../theme";
import { BrandLogo, BrandWord, CarIcon, LinkIcon, PinIcon, WaIcon } from "../ui";
import { FULL_RECT, OfficeWorld, ScreenWindow, lerpRect, rectOnScreen } from "./common";
import { TRIAL_END_CAM, officeMinutes } from "./shots";

/** Фирменная карточка контактов (мир 1080×1920). goAt — кадр сцены начала «BalaGo менен жолго чыгалы!». */
export const CtaCard: React.FC<{ readonly f: number; readonly goAt: number }> = ({ f, goAt }) => {
  const go = pop(f, goAt - 3, 16);
  // машина один раз плавно проезжает под карточкой (без скачков назад)
  const carT = easeInOut(Math.min(1, Math.max(0, (f - 24) / 400)));
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #F4F8FD 60%, #EEF4FB 100%)", fontFamily, color: C.navy }}>
      {/* мягкие фирменные лучи */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 10 }, (_, i) => (
          <path key={i} d={`M 540 390 L ${540 + 1400 * Math.cos((i / 10) * Math.PI * 2 + f / 400)} ${390 + 1400 * Math.sin((i / 10) * Math.PI * 2 + f / 400)} L ${540 + 1400 * Math.cos(((i + 0.45) / 10) * Math.PI * 2 + f / 400)} ${390 + 1400 * Math.sin(((i + 0.45) / 10) * Math.PI * 2 + f / 400)} Z`} fill="rgba(255,201,14,0.07)" />
        ))}
      </svg>
      <div style={{ position: "absolute", left: 90, width: 840, top: 318, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <BrandLogo size={150} />
          <BrandWord size={92} />
        </div>
        <div style={{ marginTop: 34, display: "flex", alignItems: "center", gap: 14, padding: "16px 34px", borderRadius: 44, background: C.yellow, border: `4px solid ${C.navy}`, fontWeight: 900, fontSize: 48, whiteSpace: "nowrap" }}>
          <PinIcon size={46} /> {BG42_CTA.city}
        </div>
        <div style={{ marginTop: 44, display: "flex", alignItems: "center", gap: 16, fontWeight: 900, fontSize: 48, whiteSpace: "nowrap" }}>
          <LinkIcon size={56} /> {BG42_CTA.link}
        </div>
        <div style={{ marginTop: 16, fontWeight: 800, fontSize: 42, color: C.navySoft }}>{BG42_CTA.or}</div>
        <div
          style={{
            marginTop: 26,
            width: "100%",
            padding: "22px 0 28px",
            borderRadius: 40,
            background: C.navy,
            color: C.white,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: `0 24px 50px ${C.shadow}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontWeight: 900, fontSize: 48 }}>
            <WaIcon size={60} /> WhatsApp:
          </div>
          <div style={{ fontWeight: 1000, fontSize: 104, letterSpacing: 2, color: C.yellow, lineHeight: 1.08, whiteSpace: "nowrap" }}>{BG42_CTA.phoneDigits}</div>
        </div>
        <div style={{ marginTop: 40, fontWeight: 1000, fontSize: 54, whiteSpace: "nowrap", textAlign: "center", opacity: interpolate(go, [0, 0.4], [0, 1], clamp), transform: `translateY(${(1 - go) * 22}px)` }}>{BG42_CTA.go}</div>
      </div>
      {/* белая машина на жёлтой линии маршрута (декор под карточкой) */}
      <div style={{ position: "absolute", left: 150, top: 1336, width: 700, height: 10, borderRadius: 5, background: C.yellowSoft }} />
      <div style={{ position: "absolute", left: 150, top: 1336, width: 700 * carT, height: 10, borderRadius: 5, background: C.yellow }} />
      <div style={{ position: "absolute", left: 150 + 700 * carT - 60, top: 1280 }}>
        <CarIcon width={120} wheel={carT * 2400} />
      </div>
    </AbsoluteFill>
  );
};

export const CtaScene: React.FC = () => {
  const { f, abs, word } = useScene("cta");
  const goAt = word("c3", 0);
  // 0…0,6 с: экран монитора разворачивается на весь кадр
  const t = easeInOut(ramp(f, 0, 18, (x) => x));
  const cam = mixCam(TRIAL_END_CAM, { ...TRIAL_END_CAM, x: MONITOR_SCREEN.x + MONITOR_SCREEN.w / 2, y: MONITOR_SCREEN.y + MONITOR_SCREEN.h / 2, zoom: TRIAL_END_CAM.zoom * 1.8 }, t);
  const r0 = rectOnScreen(TRIAL_END_CAM, MONITOR_SCREEN.x, MONITOR_SCREEN.y, MONITOR_SCREEN.w, MONITOR_SCREEN.h, MONITOR_SCREEN.r);
  const rect = lerpRect(r0, FULL_RECT, t);
  // в маленьком окне — страница BalaGo, по мере разворота — карточка
  const site = 1 - ramp(f, 4, 16);
  const s = rect.w / 1080;
  return (
    <AbsoluteFill style={{ background: C.white }}>
      {t < 1 ? (
        <Camera cam={cam}>
          <OfficeWorld f={f} abs={abs} uid="cta-office" minutes={officeMinutes((abs - f) / 30)} monitor={null} mugPower={0} face={() => 0.55} pose={() => ({ expr: "softSmile" })} />
        </Camera>
      ) : null}
      <ScreenWindow rect={rect} px={540} py={(rect.h / 2) / s} s={s}>
        <CtaCard f={f} goAt={goAt} />
      </ScreenWindow>
      {site > 0 ? (
        <div style={{ position: "absolute", left: rect.x, top: rect.y, width: rect.w, height: rect.h, borderRadius: rect.r, overflow: "hidden", opacity: site }}>
          <div style={{ width: MONITOR_SCREEN.w, height: MONITOR_SCREEN.h, transformOrigin: "0 0", transform: `scale(${rect.w / MONITOR_SCREEN.w})`, position: "relative" }}>
            <BrowserScreen typed={99} results={1} site={1} field={-1} />
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
