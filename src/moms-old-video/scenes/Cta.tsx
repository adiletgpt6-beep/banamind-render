// Сцена 14 «Финал BalaGo» (23,4 с).
// Новая семейная запись (телефон в центре — так закончилась сцена 13)
// мягко уменьшается в небольшую карточку-снимок. Несколько жёлтых деталей
// спокойно слетаются и собирают рядом чистую композицию: логотип, город,
// маршрут ҮЙ → МЕКТЕП → ҮЙ (по линии едет белый седан BalaGo), кнопка
// «Баланы каттоо», ссылка в шапке профиля и WhatsApp владельца с крупным
// номером (на слова диктора о шилтеме и WhatsApp). Адаптация сборки графики из
// референса — без взрыва, с тёплым характером. Элементы появляются под
// слова диктора; вся композиция — выше полосы субтитров и внутри полей
// Reels (90 px по бокам, 140 сверху, 260 снизу); после речи карточка
// неподвижно держится ≥ 3 с.
import { useContext } from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { ASSETS, COLORS } from "../../config";
import { WhatsAppIcon } from "../../founder-story/icons";
import { fontFamily } from "../../fonts";
import { Sedan } from "../../morning-story/props";
import { CuesContext } from "../context";
import { clamp, easeInOut, easeOut, hash01, keys, lerp } from "../rig/motion";
import { CameraUI, DancerActor, Phone, RouteIcon } from "../screens";
import { MOV_TEXT } from "../script";
import { LivingBack, Rug, Sofa } from "../sets/Living";
import { box, type Cam } from "../shots";
import { lineFrames, wordFrame, wordFrameOf } from "./common";
import { FAMILY_MOM, FAMILY_SEGS, FAMILY_SON, FAMILY_SON_SEGS, familyT14, REC_WIDE } from "./familyDance";

// Содержимое записи (540 × 960): мама и сын танцуют в гостиной днём —
// та же хореография и места, что в сцене 13 (familyDance.ts).
export const RecordingContent: React.FC<{ readonly f: number; readonly t: number; readonly cam?: Cam }> = ({ f, t, cam = REC_WIDE }) => (
  <div style={box({ left: 0, top: 0, width: 540, height: 960, overflow: "hidden", backgroundColor: "#F1E4D1" })}>
    <div style={box({ left: 0, top: 0, width: 1, height: 1, transformOrigin: "0 0", transform: `translate(${270 - cam.x * cam.zoom}px, ${480 - cam.y * cam.zoom}px) scale(${cam.zoom})` })}>
      <LivingBack light="day" f={f} />
      <Sofa light="day" />
      <Rug />
      <DancerActor uid="rec-mom" look="momDance" f={t} place={FAMILY_MOM} segs={FAMILY_SEGS} expr="smile" seed={1} />
      <DancerActor uid="rec-son" look="son" f={t} place={FAMILY_SON} segs={FAMILY_SON_SEGS} expr="proud" seed={4} />
    </div>
  </div>
);

// Жёлтые детали сборки: откуда летят и куда садятся (экранные px).
type Bit = { readonly x: number; readonly y: number; readonly w: number; readonly h: number; readonly r: number; readonly color: string; readonly at: number };

// запись в сцене 13 началась с кадра REC_FROM (таймер камеры продолжается)
export const REC_FROM = 70;

export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const n12 = lineFrames(cues, "n12");
  const n13 = lineFrames(cues, "n13");
  const t = MOV_TEXT.cta;
  // моменты по словам диктора
  const wBrand = n12.from;
  const wCity = wordFrame(cues, "n12", 1);
  const wTagline = wordFrame(cues, "n12", 2);
  const wRoute = wordFrame(cues, "n12", 5);
  const wBack = wordFrame(cues, "n12", 10);
  // призыв: кнопка — с началом фразы, ссылка и WhatsApp — на свои слова
  const wButton = n13.from;
  const wLink = wordFrameOf(cues, "n13", /шилтеме/i);
  const wWhats = wordFrameOf(cues, "n13", /ватсап|вотсап|whatsapp/i);
  const wSlogan = wordFrameOf(cues, "n13", /жолго/i);

  // ---------- запись → карточка ----------
  const shrink = easeInOut(f / 34);
  // телефон начинает там, где закончилась сцена 13 (x 540, y 960, ширина 520)
  const card = { x: lerp(540, 252, shrink), y: lerp(960, 398, shrink), w: lerp(520, 200, shrink), rot: lerp(0, -5, shrink) };
  const recT = familyT14(f); // запись продолжается с того места, где была

  // ---------- сборка ----------
  const bits: readonly Bit[] = [
    { x: 730, y: 360, w: 310, h: 310, r: 155, color: COLORS.yellowSoft, at: 8 }, // подложка логотипа
    { x: 540, y: 854, w: 300, h: 72, r: 36, color: COLORS.yellowSoft, at: wCity - 10 }, // «Бишкек»
    { x: 540, y: 1003, w: 880, h: 190, r: 40, color: COLORS.yellowSoft, at: wRoute - 16 }, // маршрут
    { x: 540, y: 1172, w: 640, h: 108, r: 54, color: COLORS.yellow, at: wButton - 18 }, // кнопка
    { x: 905, y: 210, w: 46, h: 46, r: 23, color: COLORS.yellow, at: 18 },
    { x: 140, y: 620, w: 30, h: 30, r: 15, color: COLORS.yellow, at: 26 },
    { x: 960, y: 670, w: 22, h: 22, r: 11, color: COLORS.yellow, at: 30 },
    { x: 150, y: 1190, w: 34, h: 34, r: 8, color: COLORS.yellow, at: wButton - 6 },
    { x: 935, y: 1200, w: 26, h: 26, r: 13, color: COLORS.yellow, at: wButton },
  ];
  const fly = (b: Bit, i: number) => {
    const u = easeOut((f - b.at) / 22);
    // начало — со стороны, по детерминированному «разбросу»
    const ang = hash01(i * 7.1 + 3) * Math.PI * 2;
    const dist = 700 + 300 * hash01(i * 3.7 + 1);
    const sx = b.x + Math.cos(ang) * dist;
    const sy = b.y + Math.sin(ang) * dist;
    const rot = (1 - u) * (hash01(i * 5.3) - 0.5) * 120;
    const s = 0.4 + 0.6 * u;
    return { left: lerp(sx, b.x, u) - (b.w * s) / 2, top: lerp(sy, b.y, u) - (b.h * s) / 2, width: b.w * s, height: b.h * s, rotate: `${rot}deg`, opacity: clamp((f - b.at) / 6) };
  };
  const a = (at: number, d = 12) => easeOut((f - at) / d);
  const item = (at: number): React.CSSProperties => ({ opacity: a(at), translate: `0 ${(1 - a(at)) * 24}px` });
  // машина по маршруту: дом → школа (на «Үйдөн мектепке…»), школа → дом (на «кайра үйгө…»)
  const route = { x0: 160, x1: 920, y: 998 };
  const go = keys(f, [[wRoute, 0], [wRoute + 50, 0.5], [wBack, 0.5], [wBack + 46, 1]], easeInOut);
  const carX = lerp(route.x0, route.x1, go < 0.5 ? go * 2 : 2 - go * 2);
  const flip = go >= 0.5 && f >= wBack;
  const routeA = a(wRoute - 6);
  const press = keys(f, [[wButton + 18, 1], [wButton + 22, 0.95], [wButton + 28, 1]]);
  const logoPulse = 1 + 0.035 * Math.sin(clamp((f - wSlogan) / 20) * Math.PI);

  return (
    <div style={box({ inset: 0, backgroundColor: "#FFFFFF", fontFamily, color: COLORS.navy, overflow: "hidden" })}>
      {/* в первом кадре — тот же тёплый фон, что за телефоном в сцене 13 */}
      <div style={box({ inset: 0, background: "radial-gradient(circle at 50% 45%, #F3E6D2, #D9C3A5 75%)", opacity: 1 - shrink })} />
      {/* мягкий фон: тёплые круги */}
      <div style={box({ left: -260, top: -280, width: 820, height: 820, borderRadius: 410, backgroundColor: "#FFF8E0", opacity: a(0, 20) })} />
      <div style={box({ right: -240, bottom: -200, width: 700, height: 700, borderRadius: 350, backgroundColor: COLORS.sky, opacity: a(10, 20) })} />
      {/* жёлтые детали */}
      {bits.map((b, i) => (f >= b.at ? <div key={i} style={box({ ...fly(b, i), borderRadius: b.r, backgroundColor: b.color })} /> : null))}

      {/* логотип */}
      <div style={box({ left: 730 - 130, top: 360 - 130, width: 260, height: 260, opacity: a(wBrand), scale: `${(0.85 + 0.15 * a(wBrand)) * logoPulse}` })}>
        <Img src={staticFile(ASSETS.logo)} style={{ width: 260, height: 260, borderRadius: 130, objectFit: "cover", boxShadow: "0 22px 46px rgba(20,40,90,0.18)" }} />
      </div>
      {/* название и подпись */}
      <div style={box({ left: 90, right: 90, top: 610, textAlign: "center", fontSize: 120, fontWeight: 900, lineHeight: 1, ...item(wBrand + 6) })}>{t.brand}</div>
      <div style={box({ left: 90, right: 90, top: 740, textAlign: "center", fontSize: 58, fontWeight: 800, color: "#2E4377", ...item(wTagline) })}>{t.tagline}</div>
      {/* город */}
      <div style={box({ left: 390, top: 822, width: 300, height: 64, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontSize: 46, fontWeight: 900, ...item(wCity) })}>
        <svg width={34} height={44} viewBox="0 0 34 44">
          <path d="M 17 2 C 7 2 2 10 2 17 C 2 28 17 42 17 42 C 17 42 32 28 32 17 C 32 10 27 2 17 2 Z" fill={COLORS.navy} />
          <circle cx={17} cy={17} r={6} fill="#FFFFFF" />
        </svg>
        {t.city}
      </div>
      {/* маршрут ҮЙ → МЕКТЕП → ҮЙ с машиной */}
      <div style={box({ left: 100, top: 910, width: 880, height: 190, opacity: routeA })}>
        <svg width={880} height={210} viewBox="0 0 880 210" style={box({ left: 0, top: 0 })}>
          <path d={`M 90 88 L 790 88`} stroke={COLORS.navy} strokeWidth={8} strokeDasharray="16 14" opacity={0.25} />
          <path d={`M 90 88 L ${90 + 700 * clamp((f - wRoute) / 40)} 88`} stroke={COLORS.navy} strokeWidth={8} />
        </svg>
        {(["home", "school", "home"] as const).map((k, i) => (
          <div key={i} style={box({ left: 30 + i * 350, top: 18, width: 120, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 })}>
            <RouteIcon kind={k} size={100} />
            <div style={{ fontSize: 34, fontWeight: 900, whiteSpace: "nowrap" }}>{["ҮЙ", "МЕКТЕП", "ҮЙ"][i]}</div>
          </div>
        ))}
      </div>
      <div style={box({ left: carX - 75, top: route.y - 52, opacity: clamp((f - wRoute) / 8) * routeA })}>
        <Sedan kind="polo" width={150} flip={flip} wheel={f * 9} />
      </div>
      {/* кнопка, ссылка в шапке профиля, WhatsApp — всё выше полосы субтитров */}
      <div style={box({ left: 220, top: 1118, width: 640, height: 108, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 58, fontWeight: 900, scale: `${press}`, ...item(wButton - 4) })}>{t.button}</div>
      <div style={box({ left: 90, right: 90, top: 1240, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, fontSize: 42, fontWeight: 800, color: "#3A4F80", ...item(wLink) })}>
        <svg width={40} height={40} viewBox="0 0 44 44">
          <circle cx={22} cy={22} r={21} fill={COLORS.navy} />
          <path d="M 18 14 L 27 22 L 18 30" stroke="#FFFFFF" strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {t.link}
      </div>
      <div style={box({ left: 150, top: 1312, width: 780, height: 118, borderRadius: 36, border: "6px solid #25D366", backgroundColor: "#FFFFFF", boxShadow: "0 16px 36px rgba(20,40,90,0.14)", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", gap: 18, ...item(wWhats - 2) })}>
        <WhatsAppIcon size={64} />
        <span style={{ fontWeight: 900, fontSize: 70, fontVariantNumeric: "tabular-nums", lineHeight: 1, whiteSpace: "nowrap" }}>{t.phone}</span>
      </div>

      {/* новая запись → карточка-снимок */}
      <div style={box({ left: card.x - card.w / 2 - 14 * shrink, top: card.y - (card.w * 2.25) / 2 - 14 * shrink, width: card.w + 28 * shrink, height: card.w * 2.25 + 28 * shrink, borderRadius: 28, backgroundColor: `rgba(255,255,255,${shrink})`, boxShadow: `0 20px 50px rgba(20,40,90,${0.18 * shrink})`, rotate: `${card.rot}deg` })} />
      <div style={box({ left: 0, top: 0, width: 1080, height: 1920, rotate: `${card.rot}deg`, transformOrigin: `${card.x}px ${card.y}px` })}>
        <Phone x={card.x} y={card.y} w={card.w} shadow={shrink < 0.5}>
          {/* интерфейс камеры растворяется — остаётся само видео */}
          <div style={box({ inset: 0, backgroundColor: "#000000" })}>
            <div style={box({ left: 0, top: (1170 - 960) / 2, width: 540, height: 960 })}>
              <RecordingContent f={f} t={recT} />
            </div>
          </div>
          <div style={box({ inset: 0, opacity: 1 - shrink })}>
            <CameraUI f={familyT14(f)} recFrom={REC_FROM}>
              <RecordingContent f={f} t={recT} />
            </CameraUI>
          </div>
        </Phone>
      </div>
    </div>
  );
};
