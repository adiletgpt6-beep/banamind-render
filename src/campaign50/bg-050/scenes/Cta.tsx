// Сцена 8 (≈ 67 с – конец): вопрос из хука возвращается жёлтой карточкой
// и переворачивается в позитивную «Биринчи кадам өзүңүздөн». Затем
// логотип, «BalaGo», «Бишкек • Балдар үчүн такси», маршрут ҮЙ → МЕКТЕП →
// ҮЙ с белой машиной (жёлтая полоса бренда, без пассажиров; едет в школу
// и обратно — одна полная поездка) и блок
// контактов: «Профилдеги шилтемеге өтүңүз», «же WhatsApp аркылуу жазыңыз»,
// крупно «WhatsApp: 0998 08 38 28». Оба способа связи и номер видны
// одновременно и неподвижно с BG50_CONTACTS_IN до последнего кадра
// (≥ 5 с), после последнего слова экран держится ≥ 3 с.
// Безопасная зона Reels: сверху ≥ 220 px, снизу ≥ 400 px, справа ≥ 150 px.
import { Img, staticFile, useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { C } from "../palette";
import { clamp, easeInOut, easeOut, lerp } from "../rig/motion";
import { BG50_CONTACTS_IN, BG50_TEXT, BG50_VIDEO } from "../script";
import { RouteIcon } from "../screens";

const LOGO = { x: 465, y: 572, r: 96 } as const;

// Белая легковая машина (вид сбоку) с жёлтой полосой бренда.
const WhiteCar: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly wheel: number; readonly dir?: 1 | -1 }> = ({ x, y, s = 1, wheel, dir = 1 }) => (
  <svg width={260 * s} height={110 * s} viewBox="-130 -100 260 110" style={{ position: "absolute", left: x - 130 * s, top: y - 100 * s, overflow: "visible", transform: `scaleX(${dir})` }}>
    <ellipse cx={0} cy={4} rx={118} ry={8} fill="rgba(20,25,40,0.18)" />
    <path d="M -120 -20 Q -122 -46 -100 -50 L -66 -54 Q -46 -86 -6 -87 L 34 -86 Q 66 -84 86 -56 L 110 -50 Q 126 -46 124 -24 L 123 -11 L -119 -11 Z" fill="#FFFFFF" stroke="#C9D2E0" strokeWidth={3} />
    <path d="M -56 -55 Q -40 -79 -6 -80 L 30 -79 Q 56 -77 72 -56 Z" fill="#A9C9E6" />
    <rect x={6} y={-80} width={6} height={25} fill="#FFFFFF" />
    <rect x={-120} y={-36} width={244} height={9} fill={C.yellow} />
    <rect x={116} y={-42} width={8} height={10} rx={3} fill="#FFE7A8" />
    {[-74, 74].map((wx) => (
      <g key={wx} transform={`translate(${wx} -11) rotate(${wheel})`}>
        <circle r={19} fill="#23262E" />
        <circle r={10} fill="#B8BEC8" />
        <rect x={-2} y={-10} width={4} height={20} fill="#8C929C" />
      </g>
    ))}
  </svg>
);

export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = BG50_TEXT.cta;
  const contactAt = Math.round(BG50_CONTACTS_IN * BG50_VIDEO.fps);
  const a = (at: number, d = 10) => easeOut((f - at) / d);
  const item = (at: number): React.CSSProperties => ({ opacity: a(at), translate: `0 ${(1 - a(at)) * 22}px` });
  // карточка вопроса: въезд сверху и переворот
  const cardIn = easeOut(f / 12);
  const flip = clamp((f - 12) / 16);
  const back = flip > 0.5;
  // маршрут: машина едет үй → мектеп, потом обратно мектеп → үй
  // (одна полная поездка), затем стоит у дома до конца ролика
  const go = easeInOut(clamp((f - 30) / 34));
  const ret = easeInOut(clamp((f - 150) / 40));
  const carX = f < 150 ? lerp(250, 690, go) : lerp(690, 250, ret);
  const carDir: 1 | -1 = f < 140 ? 1 : -1;
  const wheel = (go > 0 && go < 1 ? (f - 30) * 14 : 0) + (ret > 0 && ret < 1 ? (f - 150) * 14 : 0);
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF", fontFamily, color: C.navy, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: -240, top: -260, width: 780, height: 780, borderRadius: 390, backgroundColor: C.yellowSoft }} />
      <div style={{ position: "absolute", right: -220, bottom: -200, width: 640, height: 640, borderRadius: 320, backgroundColor: C.sky }} />
      {/* вопрос → «Биринчи кадам өзүңүздөн» */}
      <div style={{ position: "absolute", left: 60, width: 810, top: 240 - (1 - cardIn) * 260, height: 156, perspective: 1200 }}>
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 32,
            backgroundColor: back ? C.yellow : "#FFFFFF",
            border: back ? "none" : `4px solid ${C.yellow}`,
            boxShadow: back ? `0 10px 0 ${C.yellowDeep}, 0 22px 40px rgba(20,40,90,0.16)` : "0 16px 36px rgba(20,40,90,0.12)",
            transform: `rotateX(${back ? -90 + (flip - 0.5) * 180 : flip * 180}deg)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "0 26px",
            boxSizing: "border-box",
          }}
        >
          {back ? (
            <div style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.1 }}>{t.first}</div>
          ) : (
            <div style={{ fontSize: 40, fontWeight: 900, lineHeight: 1.15 }}>{BG50_TEXT.hook.big.join(" ")}</div>
          )}
        </div>
      </div>
      {/* логотип и бренд */}
      <div style={{ position: "absolute", left: LOGO.x - LOGO.r, top: LOGO.y - LOGO.r, width: LOGO.r * 2, height: LOGO.r * 2, opacity: a(18), transform: `scale(${0.6 + 0.4 * a(18)})` }}>
        <Img src={staticFile(BG50_VIDEO.logo)} style={{ width: LOGO.r * 2, height: LOGO.r * 2, borderRadius: LOGO.r, objectFit: "cover", boxShadow: "0 20px 44px rgba(20,40,90,0.18)" }} />
      </div>
      <div style={{ position: "absolute", left: 60, right: 150, top: 684, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}>
        <div style={{ ...item(20), fontSize: 100, fontWeight: 900, lineHeight: 1 }}>{t.brand}</div>
        <div style={{ ...item(24), padding: "12px 34px", borderRadius: 999, backgroundColor: C.navy, color: "#FFFFFF", fontSize: 48, fontWeight: 900 }}>{t.city}</div>
      </div>
      {/* маршрут ҮЙ → МЕКТЕП → ҮЙ с белой машиной */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, opacity: a(26) }}>
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
          <path d="M 190 976 L 750 976" stroke={C.yellow} strokeWidth={12} strokeDasharray="22 14" strokeLinecap="round" />
        </svg>
        <div style={{ position: "absolute", left: 120, top: 934 }}>
          <RouteIcon kind="home" size={84} />
        </div>
        <div style={{ position: "absolute", left: 760, top: 934 }}>
          <RouteIcon kind="school" size={84} />
        </div>
        <WhiteCar x={carX} y={970} s={0.62} wheel={wheel} dir={carDir} />
        <div style={{ position: "absolute", left: 60, right: 150, top: 1012, display: "flex", justifyContent: "center" }}>
          <div style={{ padding: "6px 26px", borderRadius: 999, backgroundColor: C.yellow, fontSize: 38, fontWeight: 900 }}>{t.route}</div>
        </div>
      </div>
      {/* оба способа связи и номер — вместе, неподвижно, до конца ролика */}
      <div
        style={{
          position: "absolute",
          left: 60,
          width: 870,
          top: 1100,
          opacity: a(contactAt, 8),
          padding: "24px 20px 22px",
          borderRadius: 32,
          border: "4px solid #DCE3EE",
          backgroundColor: "#F8FAFD",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          boxSizing: "border-box",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 46, fontWeight: 900, lineHeight: 1.1 }}>🔗 {t.link}</div>
        <div style={{ fontSize: 42, fontWeight: 800, color: "#3A4F80", lineHeight: 1.1 }}>{t.or}</div>
        <div style={{ marginTop: 8, width: "100%", padding: "12px 0 14px", borderRadius: 24, backgroundColor: C.greenSoft, border: "3px solid #BFE3CB" }}>
          <div style={{ fontSize: 42, fontWeight: 900, color: C.green }}>{t.whatsappLabel}</div>
          <div style={{ fontSize: 96, fontWeight: 900, letterSpacing: 1, lineHeight: 1.05, color: C.navy }}>{t.whatsappNumber}</div>
        </div>
      </div>
    </div>
  );
};
