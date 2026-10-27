// Сцена 6 (финал): телефон опускается на чистую белую столешницу, его
// экран загорается логотипом BalaGo и разворачивается в финальную карточку:
// «Бишкек • Балдар үчүн такси», «Профилдеги шилтемеге өтүңүз», «же WhatsApp
// аркылуу жазыңыз» и крупно «WhatsApp: 0998 08 38 28». Оба способа связи и
// номер видны одновременно с BG26_CONTACTS_IN до последнего кадра (≥ 5 с),
// после последнего слова экран держится ≥ 3 с. Безопасная зона Reels:
// сверху ≥ 250 px, снизу ≥ 400 px, справа ≥ 150 px. Без emoji — SVG-значки.
import { interpolate, useCurrentFrame } from "remotion";
import { appear, easeInOut, easeOut } from "../anim";
import { useLine, useScene } from "../context";
import { C } from "../palette";
import { abs, font, IconChat, IconLink, IconPin, Logo } from "../parts";
import { BG26_CONTACTS_IN, BG26_TEXT, BG26_VIDEO } from "../script";

const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const LOGO = { x: 500, y: 530, r: 150 } as const;

export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = BG26_TEXT.cta;
  const contactAt = Math.round(BG26_CONTACTS_IN * BG26_VIDEO.fps);
  const { frames } = useScene();
  const drift = Math.sin((f / Math.max(1, frames)) * Math.PI);
  const slogan = appear(f, useLine("c03").from - 4, 12);

  // телефон опускается на столешницу, экран загорается, телефон мягко
  // растворяется, а логотип и карточка остаются на месте
  const drop = easeOut(f / 12);
  const lit = interpolate(f, [6, 12], [0, 1], CL);
  const fade = easeInOut((f - 14) / 10);
  const logo = easeOut((f - 6) / 12);
  const item = (at: number): React.CSSProperties => ({ opacity: appear(f, at, 10), transform: `translateY(${(1 - appear(f, at, 10)) * 22}px)` });

  return (
    <div style={abs({ inset: 0, background: "#FFFFFF", overflow: "hidden" })}>
      {/* чистая белая столешница с мягкими кругами бренда */}
      <div style={abs({ left: -240 + drift * 24, top: -260 + drift * 16, width: 800, height: 800, borderRadius: 400, background: C.yellowSoft })} />
      <div style={abs({ right: -220 + drift * 20, bottom: -200 - drift * 14, width: 660, height: 660, borderRadius: 330, background: C.sky })} />
      {/* телефон на столешнице */}
      {fade < 0.999 ? (
        <div
          style={abs({
            left: 500 - 220,
            top: LOGO.y - 400 - (1 - drop) * 160,
            width: 440,
            height: 800,
            borderRadius: 60,
            background: "#1D2233",
            opacity: Math.min(1, f / 4 + 0.3) * (1 - fade),
            transform: `scale(${(1.12 - 0.12 * drop) * (1 + 0.25 * fade)})`,
            boxShadow: "0 30px 60px rgba(20,30,60,0.28)",
          })}
        >
          <div style={abs({ inset: 16, borderRadius: 46, background: lit > 0.5 ? "#FFFFFF" : "#2B3346", opacity: 0.4 + 0.6 * lit })} />
        </div>
      ) : null}
      <Logo x={LOGO.x} y={LOGO.y} r={LOGO.r} opacity={logo} scale={0.55 + 0.45 * logo} />
      <div style={abs({ left: 70, right: 150, top: 710, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, textAlign: "center" })}>
        <div style={{ ...item(14), ...font(104, 1000, C.navy), lineHeight: 1 }}>{t.brand}</div>
        <div style={{ ...item(18), padding: "12px 34px", borderRadius: 999, background: C.navy, display: "flex", alignItems: "center", gap: 12, ...font(46, 900, "#FFFFFF") }}>
          <IconPin s={42} color={C.yellow} />
          {t.city}
        </div>
        {/* оба способа связи и номер — вместе, неподвижно, до конца ролика */}
        <div
          style={{
            opacity: appear(f, contactAt, 8),
            marginTop: 8,
            width: "100%",
            padding: "26px 20px 24px",
            borderRadius: 34,
            border: "4px solid #DCE3EE",
            background: "#F8FAFD",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            boxSizing: "border-box",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, ...font(44, 900, C.navy), whiteSpace: "nowrap" }}>
            <IconLink s={46} />
            {t.link}
          </div>
          <div style={font(42, 800, "#3A4F80")}>{t.or}</div>
          <div style={{ marginTop: 8, width: "100%", padding: "14px 0 18px", borderRadius: 26, background: "#E8F6EC", border: "3px solid #BFE3CB" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, ...font(46, 900, "#1F7A45") }}>
              <IconChat s={48} />
              {t.whatsappLabel}
            </div>
            <div style={{ ...font(100, 1000, C.navy), letterSpacing: 1, lineHeight: 1.05 }}>{t.whatsappNumber}</div>
          </div>
        </div>
        {/* девиз с последней реплики (контакты остаются на месте) */}
        <div style={{ marginTop: 4, opacity: slogan, transform: `scale(${0.92 + 0.08 * slogan})`, ...font(44, 1000, C.navy) }}>
          <span style={{ background: C.yellow, padding: "4px 22px", borderRadius: 16 }}>{t.slogan}</span>
        </div>
      </div>
    </div>
  );
};
