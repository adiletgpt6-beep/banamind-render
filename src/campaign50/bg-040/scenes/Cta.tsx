// Сцена 6: финал. Минутная стрелка возвращается в циферблат (обходит его
// обратно к 12) — внутри циферблата логотип BalaGo. Дальше — неизменная
// бело-жёлтая CTA-карточка: все контакты видны с начала сцены (≤ 0,5 с)
// и до последнего кадра, неподвижно, в безопасной зоне Reels.
// Диктор: «BalaGo — Бишкектеги балдар үчүн такси. Балаңызды алдын ала
// каттоо үчүн профилдеги шилтемеге өтүңүз же экрандагы номерге WhatsApp
// аркылуу жазыңыз. BalaGo менен жолго чыгалы!»
import { Img, staticFile, useCurrentFrame } from "remotion";
import { clamp, easeInOut, easeOut } from "../../../two-schedules-2d/rig/motion";
import { fontFamily } from "../../../fonts";
import { box } from "../context";
import { BG40_TEXT } from "../script";
import { LongHand } from "../kit/Clock";
import { C } from "../kit/theme";

export const CTA_LOGO = { x: 540, y: 500, r: 150 } as const;
export const CTA_HAND_BACK = 22; // кадр, когда стрелка вернулась на 12
// Все элементы карточки видны не позже этого кадра сцены.
export const CTA_ALL_VISIBLE = 20;

const pop = (f: number, at: number) => {
  const u = clamp((f - at) / 8);
  return { opacity: clamp(u * 1.6), scale: `${0.94 + 0.06 * easeOut(u)}` };
};

const LinkIcon: React.FC = () => (
  <svg width={46} height={46} viewBox="0 0 24 24">
    <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2" stroke="#FFFFFF" strokeWidth={2.6} fill="none" strokeLinecap="round" />
    <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2" stroke="#FFFFFF" strokeWidth={2.6} fill="none" strokeLinecap="round" />
  </svg>
);

const WaIcon: React.FC<{ readonly size?: number }> = ({ size = 50 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M12 2.2A9.7 9.7 0 0 0 3.6 16.8L2.3 21.7l5-1.3A9.7 9.7 0 1 0 12 2.2z" fill="#25D366" />
    <path d="M8.6 7.2c-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.2 1.4 3.5c.2.2 2.4 3.8 5.9 5.2 2.9 1.1 3.5.9 4.1.8.6-.1 2-.8 2.3-1.6.3-.8.3-1.5.2-1.6-.1-.1-.3-.2-.7-.4l-2.3-1.1c-.3-.1-.5-.2-.8.2l-1 1.3c-.2.2-.4.3-.7.1-.4-.2-1.5-.6-2.8-1.8-1-.9-1.7-2-1.9-2.4-.2-.4 0-.5.2-.7l.5-.6.4-.6c.1-.2.1-.4 0-.6z" fill="#FFFFFF" />
  </svg>
);

export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = BG40_TEXT.cta;
  // стрелка обходит циферблат обратно к 12 тактами
  const back = easeInOut(f / CTA_HAND_BACK);
  const handAngle = 300 * (1 - back);
  const settle = f >= CTA_HAND_BACK ? Math.sin((f - CTA_HAND_BACK) * 0.9) * 3 * Math.exp(-(f - CTA_HAND_BACK) / 6) : 0;
  // стрелка вернулась на 12 и растворяется в циферблате (логотип чистый)
  const handFade = 1 - clamp((f - CTA_HAND_BACK - 6) / 10);
  const L = CTA_LOGO;
  // медленно дрейфующие мягкие пятна фона (сама карточка неподвижна)
  const drift = Math.sin(f / 60) * 18;
  return (
    <div style={box({ inset: 0, backgroundColor: "#FFFFFF", overflow: "hidden", fontFamily })}>
      <div style={box({ left: -220 + drift, top: -160, width: 640, height: 640, borderRadius: 320, backgroundColor: C.yellowSoft, opacity: 0.85 })} />
      <div style={box({ left: 700 - drift, top: 1480, width: 600, height: 600, borderRadius: 300, backgroundColor: "#E4EEF8" })} />
      <div style={box({ left: 820, top: 160 + drift, width: 220, height: 220, borderRadius: 110, backgroundColor: "#E4EEF8", opacity: 0.8 })} />

      {/* циферблат с логотипом */}
      <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible", ...pop(f, 0) })}>
        <circle cx={L.x} cy={L.y + 8} r={L.r + 44} fill="rgba(20,40,90,0.10)" />
        <circle cx={L.x} cy={L.y} r={L.r + 42} fill={C.yellow} />
        <circle cx={L.x} cy={L.y} r={L.r + 24} fill="#FFFFFF" />
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1={L.x} y1={L.y - L.r - 38} x2={L.x} y2={L.y - L.r - 26} stroke={C.navy} strokeWidth={i % 3 === 0 ? 7 : 4} strokeLinecap="round" transform={`rotate(${i * 30} ${L.x} ${L.y})`} />
        ))}
      </svg>
      <Img src={staticFile("assets/logo.png")} style={box({ left: L.x - L.r, top: L.y - L.r, width: L.r * 2, height: L.r * 2, borderRadius: L.r, objectFit: "cover", ...pop(f, 2) })} />
      <div style={box({ left: 0, top: 0, opacity: handFade, display: handFade > 0 ? "block" : "none" })}>
        <LongHand px={L.x} py={L.y} angle={handAngle + settle} len={L.r + 30} w={26} shadow={false} />
      </div>

      {/* карточка: всё видно до CTA_ALL_VISIBLE и не двигается */}
      <div style={box({ left: 80, right: 80, top: 712, display: "flex", flexDirection: "column", alignItems: "center" })}>
        <div style={{ fontSize: 104, fontWeight: 900, color: C.navy, lineHeight: 1.0, letterSpacing: 1, ...pop(f, 3) }}>{t.brand}</div>
        <div style={{ marginTop: 18, padding: "12px 34px", borderRadius: 50, backgroundColor: C.yellow, color: C.navy, fontSize: 50, fontWeight: 900, whiteSpace: "nowrap", boxShadow: "0 10px 24px rgba(20,40,90,0.16)", ...pop(f, 5) }}>
          {t.city}
        </div>
        <div style={{ marginTop: 16, fontSize: 36, fontWeight: 900, color: C.inkSoft, letterSpacing: 2, ...pop(f, 6) }}>{t.route}</div>
        <div style={{ marginTop: 28, width: 880, padding: "22px 26px", borderRadius: 28, backgroundColor: "#F2F6FB", border: "3px solid #D7E2F0", display: "flex", alignItems: "center", gap: 22, boxSizing: "border-box", ...pop(f, 8) }}>
          <div style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: C.navy, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            <LinkIcon />
          </div>
          <div style={{ fontSize: 50, fontWeight: 900, color: C.navy, lineHeight: 1.1 }}>{t.link}</div>
        </div>
        <div style={{ marginTop: 16, fontSize: 46, fontWeight: 800, color: C.navy, ...pop(f, 10) }}>{t.or}</div>
        <div style={{ marginTop: 16, width: 880, padding: "20px 26px 22px", borderRadius: 30, backgroundColor: "#ECFBF1", border: "4px solid #25A55A", display: "flex", flexDirection: "column", alignItems: "center", boxSizing: "border-box", boxShadow: "0 14px 30px rgba(37,165,90,0.18)", ...pop(f, 11) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 46, fontWeight: 900, color: "#167A42" }}>
            <WaIcon />
            {t.whatsappLabel}
          </div>
          <div style={{ marginTop: 4, fontSize: 98, fontWeight: 900, color: C.navy, letterSpacing: 2, whiteSpace: "nowrap", lineHeight: 1.05 }}>{t.whatsappNumber}</div>
        </div>
        <div style={{ marginTop: 22, fontSize: 42, fontWeight: 900, color: C.navy, ...pop(f, 12) }}>{t.slogan}</div>
      </div>
    </div>
  );
};
