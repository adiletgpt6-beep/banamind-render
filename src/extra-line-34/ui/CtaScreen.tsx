// Финальный экран BalaGo №34 (сц. 15) на тёплом светлом фоне (Backdrop):
// логотип, BalaGo, «Балдар үчүн такси · Бишкек», маршрут ҮЙ → МЕКТЕП → ҮЙ
// (маленькая схема), крупная жёлтая кнопка «Баланы каттоо», «Шилтеме —
// профилдин башында» и WhatsApp заказчика. Появление по очереди: brand
// (бренд и город) → route (маршрут) → cta (призыв) → contact (WhatsApp);
// мягкий подъём без отскоков, финал неподвижен. Всё критичное — в
// x 96…936, y 150…1560; блок призыва заканчивается выше y ≈ 1385
// (субтитры — над y 1548). Ни цен, ни адреса сайта.
import { Img, staticFile } from "remotion";
import { Backdrop, box } from "../kit";
import { clamp, easeOut } from "../rig/motion";
import { EL_TEXT } from "../script";
import { C, F, RADIUS, SAFE, SHADOW } from "../theme";
import { RouteScheme, routeSchemeHeight } from "./RouteScheme";

const CX = (SAFE.left + SAFE.right) / 2; // 516 — центр безопасной зоны
const SCHEME_W = 620;
const SCHEME_PAD = 26;

// Вертикальная раскладка финала (px кадра): бренд → маршрут → кнопка →
// «Шилтеме — …» → WhatsApp. Всё кончается выше y ≈ 1385 (субтитры — ниже).
const ROUTE_Y = 596;
const ROUTE_H = SCHEME_PAD * 2 + routeSchemeHeight("full", SCHEME_W);
const BUTTON_Y = ROUTE_Y + ROUTE_H + 24;
const BUTTON_H = 116;
const SITE_Y = BUTTON_Y + BUTTON_H + 20;
export const CTA_LAYOUT = {
  logo: { y: 150, s: 200 },
  brand: 368,
  tagline: 494,
  routeCard: { y: ROUTE_Y, w: 720, h: ROUTE_H },
  button: { y: BUTTON_Y, w: 760, h: BUTTON_H },
  site: SITE_Y,
  contact: { y: SITE_Y + 100, h: 122 },
} as const;

const rise = (t: number, a: number, d: number, dist = 40): React.CSSProperties => {
  const k = easeOut(clamp((t - a) / d));
  return { opacity: clamp((t - a) / (d * 0.75)), transform: `translateY(${(1 - k) * dist}px)` };
};

const Link: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 52 52" style={{ display: "block" }}>
    <path d="M22 30 L30 22 M20 16 L25 11 A9 9 0 0 1 41 27 L36 32 M32 36 L27 41 A9 9 0 0 1 11 25 L16 20" fill="none" stroke={C.yellow} strokeWidth={6} strokeLinecap="round" />
  </svg>
);

// Значок мессенджера: зелёный круг с белой трубкой в «облачке».
const ChatPhone: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" style={{ display: "block" }}>
    <path d="M30 5 A25 25 0 1 1 13 49 L5 55 L9 45 A25 25 0 0 1 30 5 Z" fill="#25A55F" />
    <path
      d="M22 18 Q19 18 18 21 Q17 27 23 34 Q30 42 37 42 Q40 41 41 38 L41 35 Q41 33 39 33 L35 32 Q33 32 32 34 Q27 32 25 26 Q27 25 27 23 L26 19 Q26 18 24 18 Z"
      fill="#FFFFFF"
    />
  </svg>
);

export const CtaScreen: React.FC<{ readonly brand: number; readonly route: number; readonly cta: number; readonly contact?: number; readonly backdrop?: boolean }> = ({ brand, route, cta, contact = 1, backdrop = true }) => {
  const t = EL_TEXT.cta;
  const Lc = CTA_LAYOUT;
  const center = (w: number) => CX - w / 2;
  const logoK = easeOut(clamp(brand / 0.5));
  return (
    <div style={box({ inset: 0, overflow: "hidden", fontFamily: F.text, color: C.ink })}>
      {backdrop ? <Backdrop glowX={CX} glowY={560} /> : null}

      {/* бренд и город */}
      <div
        style={box({
          left: center(Lc.logo.s),
          top: Lc.logo.y,
          width: Lc.logo.s,
          height: Lc.logo.s,
          borderRadius: 999,
          boxShadow: "0 24px 50px rgba(23,38,61,0.16), 0 6px 14px rgba(23,38,61,0.08)",
          opacity: clamp(brand / 0.35),
          transform: `translateY(${(1 - logoK) * 30}px) scale(${0.94 + 0.06 * logoK})`,
        })}
      >
        <Img src={staticFile("assets/logo.png")} style={{ width: Lc.logo.s, height: Lc.logo.s, borderRadius: 999, display: "block" }} />
      </div>
      <div
        style={box({ left: SAFE.left, width: SAFE.right - SAFE.left, top: Lc.brand, textAlign: "center", fontSize: 108, fontWeight: 900, lineHeight: 1, letterSpacing: -1, ...rise(brand, 0.2, 0.45) })}
      >
        {t.brand}
      </div>
      <div
        style={box({
          left: SAFE.left,
          width: SAFE.right - SAFE.left,
          top: Lc.tagline,
          textAlign: "center",
          fontSize: 52,
          fontWeight: 800,
          color: C.inkSoft,
          whiteSpace: "nowrap",
          ...rise(brand, 0.4, 0.5),
        })}
      >
        {t.tagline}
      </div>

      {/* маршрут */}
      <div
        style={box({
          left: center(Lc.routeCard.w),
          top: Lc.routeCard.y,
          width: Lc.routeCard.w,
          height: Lc.routeCard.h,
          borderRadius: RADIUS.card,
          backgroundColor: C.card,
          boxShadow: SHADOW.card,
          ...rise(route, 0, 0.4, 50),
        })}
      >
        <div style={box({ left: (Lc.routeCard.w - SCHEME_W) / 2, top: SCHEME_PAD })}>
          <RouteScheme mode="full" w={SCHEME_W} reveal={clamp((route - 0.25) / 0.7)} />
        </div>
      </div>

      {/* призыв */}
      <div
        style={box({
          left: center(Lc.button.w),
          top: Lc.button.y,
          width: Lc.button.w,
          height: Lc.button.h,
          borderRadius: RADIUS.chip,
          backgroundColor: C.yellow,
          boxShadow: "0 22px 46px rgba(242,185,43,0.45), inset 0 -6px 0 rgba(23,38,61,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 26,
          fontSize: 62,
          fontWeight: 900,
          ...rise(cta, 0, 0.45),
        })}
      >
        <span>{t.button}</span>
        <svg width={64} height={46} viewBox="0 0 60 44" style={{ display: "block" }}>
          <path d="M 4 22 H 52 M 36 6 L 54 22 L 36 38" fill="none" stroke={C.ink} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div style={box({ left: SAFE.left, width: SAFE.right - SAFE.left, top: Lc.site, display: "flex", justifyContent: "center", ...rise(cta, 0.35, 0.5, 26) })}>
        <div
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 24px 10px 16px", borderRadius: RADIUS.chip, backgroundColor: C.ink, color: C.white, fontSize: 44, fontWeight: 800, whiteSpace: "nowrap" }}
        >
          <Link size={38} />
          {t.site}
        </div>
      </div>

      {/* WhatsApp для заявки */}
      <div style={box({ left: SAFE.left, width: SAFE.right - SAFE.left, top: Lc.contact.y, display: "flex", justifyContent: "center", ...rise(contact, 0, 0.5, 26) })}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
            height: Lc.contact.h,
            padding: "0 40px 0 24px",
            borderRadius: RADIUS.card,
            backgroundColor: C.card,
            border: "3px solid #CFE8D6",
            boxShadow: SHADOW.soft,
            whiteSpace: "nowrap",
          }}
        >
          <ChatPhone size={70} />
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#1F7A45" }}>{t.whatsappLabel}</div>
            <div style={{ fontSize: 62, fontWeight: 900, letterSpacing: 1 }}>{t.whatsappNumber}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
