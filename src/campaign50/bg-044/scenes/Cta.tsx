// Сцена 6 «cta» — фирменный финал. Пиксели игры слетаются и складываются в
// спокойный чистый экран (без счёта, очков и бонусов): логотип BalaGo,
// «Бишкек • Балдар үчүн такси», «Балаңызды алдын ала каттаңыз» и
// карточка контактов: «Профилдеги шилтемеге өтүңүз», «же WhatsApp аркылуу
// жазыңыз», крупно «WhatsApp: 0998 08 38 28». Контакты появляются через
// BG44_CONTACTS_IN и НЕПОДВИЖНЫ до последнего кадра (≥ 5 с; после
// последнего слова экран держится ≥ 3 с — это обеспечивает timing.ts).
// Безопасная зона Reels: всё важное в x 90–930, y 260–1500.
import { Img, staticFile, useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { appear, clamp, easeInOut, easeOut } from "../anim";
import { C } from "../palette";
import { BG44_CONTACTS_IN, BG44_TEXT, BG44_VIDEO } from "../script";
import type { SceneSfxFn } from "../sound";

const CX = 510; // центр безопасной зоны по x
const CONTACT_AT = Math.round(BG44_CONTACTS_IN * BG44_VIDEO.fps);

export const ctaSfx: SceneSfxFn = ({ lineAt }) => [
  { at: 0, name: "pixels", volume: 0.3 },
  { at: CONTACT_AT, name: "chime", volume: 0.22 },
  { at: lineAt("c3").from, name: "select", volume: 0.2 },
];

const hash = (n: number) => {
  const s = Math.sin(n * 78.233 + 12.9898) * 43758.5453;
  return s - Math.floor(s);
};

// Пиксели слетаются в рамку-узор по углам экрана.
const Pixels: React.FC<{ readonly f: number }> = ({ f }) => {
  const k = easeOut(f / 26);
  const cells: React.ReactNode[] = [];
  for (let i = 0; i < 46; i++) {
    const corner = i % 4;
    const n = Math.floor(i / 4);
    const ex = corner % 2 === 0 ? 20 + (n % 4) * 34 : 1060 - 34 - (n % 4) * 34;
    const ey = corner < 2 ? 40 + Math.floor(n / 4) * 34 + (n % 4) * 8 : 1880 - 34 - Math.floor(n / 4) * 34 - (n % 4) * 8;
    const sx = 540 + (hash(i) - 0.5) * 900;
    const sy = 960 + (hash(i + 50) - 0.5) * 1400;
    const x = sx + (ex - sx) * k;
    const y = sy + (ey - sy) * k;
    const fill = i % 3 === 0 ? C.navy : i % 3 === 1 ? C.yellow : "#BFD6EE";
    const tw = f > 30 ? 0.75 + 0.25 * Math.sin((f + i * 11) / 18) : 1;
    cells.push(<rect key={i} x={x} y={y} width={26} height={26} fill={fill} opacity={tw} />);
  }
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }} shapeRendering="crispEdges">
      {cells}
    </svg>
  );
};

const LinkIcon: React.FC = () => (
  <svg width={56} height={56} viewBox="0 0 56 56">
    <circle cx={28} cy={28} r={27} fill={C.yellow} />
    <path d="M24 33 L32 25" stroke={C.navy} strokeWidth={4.5} strokeLinecap="round" />
    <path d="M26 20 L29 17 C32 14 37 14 40 17 C43 20 43 25 40 28 L37 31" fill="none" stroke={C.navy} strokeWidth={4.5} strokeLinecap="round" />
    <path d="M30 36 L27 39 C24 42 19 42 16 39 C13 36 13 31 16 28 L19 25" fill="none" stroke={C.navy} strokeWidth={4.5} strokeLinecap="round" />
  </svg>
);

const ChatIcon: React.FC = () => (
  <svg width={54} height={54} viewBox="0 0 40 40">
    <path d="M20 4 C10.6 4 4 10.4 4 18.6 C4 22.4 5.4 25.6 7.8 28.2 L6 35.5 L13.4 33 C15.4 33.8 17.6 34.2 20 34.2 C29.4 34.2 36 27.8 36 19.4 C36 10.6 29.4 4 20 4 Z" fill={C.whatsapp} />
    <path d="M14 13.5 C14 21 19 26.5 26.5 26.5" fill="none" stroke="#FFFFFF" strokeWidth={3.6} strokeLinecap="round" />
  </svg>
);

export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = BG44_TEXT.cta;
  const logo = easeOut((f - 8) / 14);
  const breathe = f > 40 ? 1 + 0.012 * Math.sin((f - 40) / 26) : 1;
  const item = (at: number): React.CSSProperties => ({ opacity: appear(f, at, 10), transform: `translateY(${(1 - appear(f, at, 10)) * 22}px)` });
  const contacts = clamp((f - CONTACT_AT) / 8);
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF", fontFamily, color: C.navy, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: -240, top: -260, width: 780, height: 780, borderRadius: 390, backgroundColor: C.yellowSoft }} />
      <div style={{ position: "absolute", right: -220, bottom: -200, width: 660, height: 660, borderRadius: 330, backgroundColor: C.sky }} />
      <Pixels f={f} />
      {/* логотип */}
      <div style={{ position: "absolute", left: CX - 135, top: 268, width: 270, height: 270, opacity: logo, transform: `scale(${(0.6 + 0.4 * easeInOut(logo)) * breathe})` }}>
        <Img src={staticFile(BG44_VIDEO.logo)} style={{ width: 270, height: 270, borderRadius: 135, objectFit: "cover", boxShadow: "0 18px 40px rgba(20,40,90,0.16)" }} />
      </div>
      <div style={{ position: "absolute", left: 90, width: 840, top: 556, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
        <div style={{ ...item(10), fontSize: 92, fontWeight: 900, lineHeight: 1 }}>{t.brand}</div>
        <div style={{ ...item(14), padding: "12px 34px", borderRadius: 999, backgroundColor: C.navy, color: C.white, fontSize: 46, fontWeight: 900, whiteSpace: "nowrap" }}>{t.city}</div>
        <div style={{ ...item(18), fontSize: 40, fontWeight: 800, color: C.ink, marginTop: 4 }}>{t.early}</div>
      </div>
      {/* контакты: вместе, неподвижно, до конца ролика */}
      <div
        style={{
          position: "absolute",
          left: 90,
          width: 840,
          top: 900,
          opacity: contacts,
          transform: `scale(${0.94 + 0.06 * easeOut(contacts)})`,
          transformOrigin: "50% 0",
          padding: "30px 24px 28px",
          borderRadius: 34,
          border: "4px solid #DCE3EE",
          backgroundColor: "#F8FAFD",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 44, fontWeight: 900, lineHeight: 1.1, whiteSpace: "nowrap" }}>
          <LinkIcon />
          {t.link}
        </div>
        <div style={{ fontSize: 42, fontWeight: 800, color: "#3A4F80", lineHeight: 1.15 }}>{t.or}</div>
        <div style={{ marginTop: 12, width: "100%", padding: "18px 0 20px", borderRadius: 26, backgroundColor: "#E8F6EC", border: "3px solid #BFE3CB", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 46, fontWeight: 900, color: C.whatsappDeep }}>
            <ChatIcon />
            {t.whatsappLabel}
          </div>
          <div style={{ fontSize: 100, fontWeight: 900, letterSpacing: 1, lineHeight: 1.05, color: C.navy, whiteSpace: "nowrap" }}>{t.whatsappNumber}</div>
        </div>
      </div>
    </div>
  );
};
