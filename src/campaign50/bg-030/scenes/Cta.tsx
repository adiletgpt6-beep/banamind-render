// Сцена 6, финал. Камера ещё раз входит в окно дома, и в «окне»
// открывается неподвижная карточка: Бишкек • Балдар үчүн такси, ссылка в
// профиле, WhatsApp и полный номер 0998 08 38 28 — все строки одновременно,
// крупно, в безопасной зоне Reels, до последнего кадра (≥ 5 с, ≥ 3 с после
// последнего слова). Субтитры на финале скрыты.
import { AbsoluteFill, Img, staticFile } from "remotion";
import { fontFamily } from "../../../fonts";
import { clamp, easeInOut, zoomLerp } from "../anim";
import { World } from "../art/camera";
import { PanelHouse, Sky, Win, panelWindow } from "../art/city";
import { ArrowGlyph } from "../art/ui";
import { useSceneFrame } from "../context";
import { C } from "../palette";
import { BG30_CONTACTS_IN, BG30_TEXT, BG30_VIDEO } from "../script";
import { FUT_HOME } from "./Future";

const FPS = BG30_VIDEO.fps;
const WIN = panelWindow(FUT_HOME, 2, 5);
const WC = { x: WIN.x + WIN.w / 2, y: WIN.y + WIN.h / 2 };
export const CTA_IN = Math.round(BG30_CONTACTS_IN * FPS);

const WhatsAppIcon: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" style={{ flex: "none" }}>
    <path d="M32 4 C16.5 4 4 16.3 4 31.5 C4 37 5.6 42 8.4 46.3 L5 59 L18.2 55.6 C22.3 57.8 27 59 32 59 C47.5 59 60 46.7 60 31.5 C60 16.3 47.5 4 32 4 Z" fill={C.green} />
    <path
      d="M24.2 18.5 C23.5 17 22.8 17 22.2 17 L20.4 17 C19.8 17 18.8 17.2 18 18.1 C17.2 19 15 21.1 15 25.3 C15 29.5 18.1 33.6 18.5 34.2 C19 34.8 24.5 43.7 33.3 47.2 C40.6 50.1 42.1 49.5 43.7 49.4 C45.3 49.2 48.8 47.3 49.5 45.3 C50.2 43.3 50.2 41.6 50 41.2 C49.8 40.8 49.2 40.6 48.3 40.1 C47.4 39.7 43 37.5 42.2 37.2 C41.4 36.9 40.8 36.8 40.2 37.7 C39.6 38.6 37.9 40.6 37.4 41.2 C36.9 41.8 36.3 41.9 35.4 41.4 C34.5 41 31.6 40 28.2 37 C25.5 34.6 23.7 31.7 23.2 30.8 C22.7 29.9 23.1 29.4 23.6 29 C24 28.6 24.5 27.9 25 27.4 C25.4 26.9 25.6 26.5 25.9 25.9 C26.2 25.3 26 24.8 25.8 24.3 C25.6 23.9 24 19.9 24.2 18.5 Z"
      fill="#FFFFFF"
    />
  </svg>
);

const ProfileIcon: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" style={{ flex: "none" }}>
    <circle cx={32} cy={32} r={30} fill={C.navy} />
    <circle cx={32} cy={25} r={10} fill={C.yellow} />
    <path d="M14 50 Q32 30 50 50 Z" fill={C.yellow} />
  </svg>
);

const Card: React.FC<{ readonly a: number }> = ({ a }) => {
  const T = BG30_TEXT.cta;
  return (
    <AbsoluteFill style={{ backgroundColor: C.paper, opacity: a }}>
      {/* рамка «окна» */}
      <div style={{ position: "absolute", left: 34, top: 34, right: 34, bottom: 34, borderRadius: 48, border: `14px solid ${C.yellow}` }} />
      <div style={{ position: "absolute", left: 60, right: 150, top: 320, display: "flex", flexDirection: "column", alignItems: "center", fontFamily, color: C.navy }}>
        <Img src={staticFile(BG30_VIDEO.logo)} style={{ width: 370, height: 370 }} />
        <div style={{ marginTop: 40, fontSize: 62, fontWeight: 900, textAlign: "center", whiteSpace: "nowrap" }}>{T.city}</div>
        <div style={{ marginTop: 24, width: 520, height: 8, borderRadius: 4, backgroundColor: C.yellow }} />
        <div style={{ marginTop: 52, display: "flex", alignItems: "center", gap: 20, fontSize: 50, fontWeight: 900, whiteSpace: "nowrap" }}>
          <ProfileIcon size={70} />
          {T.link}
        </div>
        <div style={{ marginTop: 22, fontSize: 46, fontWeight: 800, color: C.ink, whiteSpace: "nowrap" }}>{T.or}</div>
        <div
          style={{
            marginTop: 48,
            display: "flex",
            alignItems: "center",
            gap: 20,
            padding: "24px 30px",
            borderRadius: 34,
            backgroundColor: C.yellow,
            boxShadow: "0 14px 34px rgba(20,40,90,0.18)",
            whiteSpace: "nowrap",
          }}
        >
          <WhatsAppIcon size={96} />
          <div style={{ display: "flex", flexDirection: "column", color: C.navy, lineHeight: 1.02 }}>
            <div style={{ fontSize: 44, fontWeight: 900 }}>{T.whatsappLabel}</div>
            <div style={{ fontSize: 84, fontWeight: 1000, letterSpacing: 1 }}>{T.whatsappNumber}</div>
          </div>
        </div>
        <div style={{ marginTop: 56, display: "flex", alignItems: "center", fontSize: 40, fontWeight: 900, color: C.muted, whiteSpace: "nowrap" }}>
          ҮЙ <ArrowGlyph /> МЕКТЕП <ArrowGlyph /> ҮЙ
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const CtaScene: React.FC = () => {
  const f = Math.max(0, useSceneFrame());
  const into = easeInOut(f / 14);
  const cam = { x: WC.x, y: WC.y + 120 * (1 - into), zoom: zoomLerp(1.6, 22, into) };
  // карточка проявляется за ≤ 10 кадров и полностью видна с CTA_IN
  const a = clamp((f - (CTA_IN - 10)) / 10);
  return (
    <AbsoluteFill style={{ backgroundColor: C.paper }}>
      {a < 1 ? (
        <World cam={cam} base={cam}>
          <Sky id="cta-sky" x={-2000} y={-2000} w={5000} h={5000} />
          <PanelHouse p={FUT_HOME} lit={[[2, 5]]} />
          <Win x={WIN.x} y={WIN.y} w={WIN.w} h={WIN.h} lit={1} curtains />
        </World>
      ) : null}
      <Card a={a} />
    </AbsoluteFill>
  );
};
