// Информационная страница BalaGo (сц. 11): её родители читают на ноутбуке.
// Фиксированный макет SITE.w × SITE.h (940×1500 px): сцена показывает его
// во весь кадр (с полосой «браузера» БЕЗ адреса) или вписывает в экран
// ноутбука (transform: scale). Только предварительное обращение: без цен,
// телефонов, адреса сайта, оплаты, водителя и подтверждения заказа.
//   stage   0..1 — проявление страницы (логотип, бренд, город, маршрут,
//                  кнопка «Баланы каттоо»);
//   request 0..1 — панель запроса семьи въезжает снизу (МЕКТЕП → ҮЙ, схема,
//                  «Маршрутту талкуулоо», кнопка «Алдын ала өтүнмө»);
//   press   0..1 — нажатие кнопки «Алдын ала өтүнмө» (вдавливание и возврат);
//   sent    0..1 — спокойная строка с галочкой «Өтүнмө калтырылды»;
//   cursor       — стрелка-курсор в координатах макета (click — кольцо);
//   scroll       — прокрутка страницы, px (полоса браузера не двигается).
// Координаты кнопок (для курсора/пальца) — SITE_BUTTONS (px макета).
import { Img, staticFile } from "remotion";
import { box, RouteLine } from "../kit";
import { clamp, easeInOut, easeOut, lerp } from "../rig/motion";
import { EL_TEXT } from "../script";
import { C, F, RADIUS, SHADOW } from "../theme";
import { RouteScheme, routeSchemeHeight } from "./RouteScheme";

export const SITE = { w: 940, h: 1500, chrome: 84 } as const;

type Rect = { readonly x: number; readonly y: number; readonly w: number; readonly h: number; readonly cx: number; readonly cy: number };
const rect = (x: number, y: number, w: number, h: number): Rect => ({ x, y, w, h, cx: x + w / 2, cy: y + h / 2 });

// Раскладка (px макета, от верхнего левого угла, полоса браузера включена).
const L = {
  logo: { x: 60, y: 112, s: 164 },
  brand: { x: 250, y: 118 },
  city: { x: 60, y: 304, h: 76 },
  routeCard: { x: 60, y: 420, w: 820 },
  panelTop: 404,
  panel: { x: 30, w: 880, pad: 50 },
} as const;
const ROUTE_CARD_SCHEME_W = 744;
const ROUTE_CARD_H = 120 + routeSchemeHeight("full", ROUTE_CARD_SCHEME_W) + 38;
const REGISTER = rect(60, L.routeCard.y + ROUTE_CARD_H + 40, 820, 124);
const PANEL_IN = L.panel.x + L.panel.pad; // левый край содержимого панели
const PANEL_W = L.panel.w - L.panel.pad * 2;
const P = {
  heading: L.panelTop + 40,
  chip: L.panelTop + 128,
  scheme: L.panelTop + 222,
};
const FAMILY_SCHEME_W = 720;
const FAMILY_SCHEME_H = routeSchemeHeight("family", FAMILY_SCHEME_W);
const REQUEST = rect(PANEL_IN, P.scheme + FAMILY_SCHEME_H + 22, PANEL_W, 112);
const SENT_Y = REQUEST.y + REQUEST.h + 16;

// Кнопки при stage = 1 / request = 1 и scroll = 0 (с полосой браузера).
export const SITE_BUTTONS = { register: REGISTER, request: REQUEST } as const;

export type SiteCursor = { readonly x: number; readonly y: number; readonly visible: number; readonly click: number };

// Элемент проявляется на отрезке [a, a + d] шкалы t (0..1): подъём и
// прозрачность, без перелёта.
const rise = (t: number, a: number, d = 0.34, dist = 36): React.CSSProperties => {
  const k = easeOut(clamp((t - a) / d));
  return { opacity: clamp((t - a) / (d * 0.7)), transform: `translateY(${(1 - k) * dist}px)` };
};

// Значок «метка на карте» (город).
const Pin: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{ display: "block" }}>
    <path d="M 20 37 C 12 27 7 21 7 15 A 13 13 0 0 1 33 15 C 33 21 28 27 20 37 Z" fill={C.yellow} stroke={C.ink} strokeWidth={3} strokeLinejoin="round" />
    <circle cx={20} cy={15} r={5} fill={C.ink} />
  </svg>
);

// Значок «разговор» (обсуждение маршрута).
const Chat: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{ display: "block" }}>
    <path d="M 6 9 Q 6 5 10 5 L 30 5 Q 34 5 34 9 L 34 23 Q 34 27 30 27 L 17 27 L 9 34 L 10 27 Q 6 27 6 23 Z" fill="#FFFFFF" stroke={C.ink} strokeWidth={3} strokeLinejoin="round" />
    <circle cx={13.5} cy={16} r={2.4} fill={C.ink} />
    <circle cx={20} cy={16} r={2.4} fill={C.ink} />
    <circle cx={26.5} cy={16} r={2.4} fill={C.ink} />
  </svg>
);

// Спокойная галочка в круге.
const Check: React.FC<{ readonly size: number; readonly draw: number }> = ({ size, draw }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{ display: "block" }}>
    <circle cx={20} cy={20} r={18} fill={C.checkSoft} />
    <path
      d="M 11.5 20.5 L 17.5 26.5 L 29 14"
      stroke={C.check}
      strokeWidth={4.4}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={30}
      strokeDashoffset={30 * (1 - clamp(draw))}
    />
  </svg>
);

// Стрелка-курсор: кончик в (0, 0).
const Cursor: React.FC<{ readonly c: SiteCursor }> = ({ c }) => {
  if (c.visible <= 0) return null;
  const ring = clamp(c.click);
  return (
    <div style={box({ left: c.x, top: c.y, width: 1, height: 1, opacity: clamp(c.visible), pointerEvents: "none" })}>
      {ring > 0 && ring < 1 ? (
        <div
          style={box({
            left: -(14 + 30 * ring),
            top: -(14 + 30 * ring),
            width: (14 + 30 * ring) * 2,
            height: (14 + 30 * ring) * 2,
            borderRadius: 999,
            border: `4px solid rgba(23,38,61,${0.55 * (1 - ring)})`,
            boxSizing: "border-box",
          })}
        />
      ) : null}
      <svg width={52} height={70} viewBox="0 0 26 35" style={box({ left: -3, top: -2, overflow: "visible", filter: "drop-shadow(0 4px 6px rgba(23,38,61,0.25))" })}>
        <path d="M 1.5 1.5 L 1.5 27 L 8 21 L 12.2 31 L 16.6 29.2 L 12.5 19.6 L 21.5 19.6 Z" fill="#FFFFFF" stroke={C.ink} strokeWidth={2.2} strokeLinejoin="round" />
      </svg>
    </div>
  );
};

// Главная жёлтая кнопка (pill) с SVG-стрелкой.
const MainButton: React.FC<{ readonly r: Rect; readonly label: string; readonly size: number; readonly press?: number; readonly style?: React.CSSProperties }> = ({
  r,
  label,
  size,
  press = 0,
  style,
}) => {
  const d = Math.sin(Math.PI * clamp(press));
  return (
    <div
      style={box({
        left: r.x,
        top: r.y,
        width: r.w,
        height: r.h,
        borderRadius: RADIUS.chip,
        backgroundColor: d > 0 ? mix(C.yellow, C.yellowDeep, d * 0.7) : C.yellow,
        boxShadow: `0 ${lerp(18, 6, d)}px ${lerp(40, 14, d)}px rgba(242,185,43,${lerp(0.42, 0.3, d)}), inset 0 -${lerp(6, 2, d)}px 0 rgba(23,38,61,0.08)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: size * 0.4,
        fontFamily: F.text,
        fontWeight: 900,
        fontSize: size,
        color: C.ink,
        transform: `translateY(${3 * d}px) scale(${1 - 0.03 * d})`,
        ...style,
      })}
    >
      <span>{label}</span>
      <svg width={size * 0.95} height={size * 0.7} viewBox="0 0 60 44" style={{ display: "block" }}>
        <path d="M 4 22 H 52 M 36 6 L 54 22 L 36 38" fill="none" stroke={C.ink} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const A = hex(a);
  const B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp(t)))).join(",")})`;
};

// Полоса «браузера»: три точки, пустая адресная строка (без адреса), меню.
const Chrome: React.FC = () => (
  <div style={box({ left: 0, top: 0, width: SITE.w, height: SITE.chrome, backgroundColor: "#FFFFFF", borderBottom: `2px solid ${C.line}`, boxSizing: "border-box" })}>
    {["#EFB8A6", "#F4D68B", "#B9D7A4"].map((c, i) => (
      <div key={c} style={box({ left: 34 + i * 30, top: 33, width: 18, height: 18, borderRadius: 9, backgroundColor: c })} />
    ))}
    <div style={box({ left: 150, top: 18, width: 640, height: 46, borderRadius: 23, backgroundColor: "#F3F0E9", display: "flex", alignItems: "center", paddingLeft: 10 })}>
      <Img src={staticFile("assets/logo.png")} style={{ width: 30, height: 30, borderRadius: 15 }} />
    </div>
    {[0, 1, 2].map((i) => (
      <div key={i} style={box({ left: 846, top: 29 + i * 11, width: 34, height: 5, borderRadius: 3, backgroundColor: C.inkMute })} />
    ))}
  </div>
);

export const SiteScreen: React.FC<{
  readonly stage: number;
  readonly request: number;
  readonly press: number;
  readonly sent: number;
  readonly cursor?: SiteCursor;
  readonly scroll?: number;
  readonly chrome?: boolean;
  readonly style?: React.CSSProperties;
}> = ({ stage, request, press, sent, cursor, scroll = 0, chrome = true, style }) => {
  const s = EL_TEXT.site;
  const st = clamp(stage);
  const rq = easeInOut(clamp(request));
  const sn = clamp(sent);
  const panelY = lerp(SITE.h + 40, L.panelTop, rq);
  return (
    <div style={{ position: "relative", width: SITE.w, height: SITE.h, overflow: "hidden", backgroundColor: C.bg, fontFamily: F.text, color: C.ink, ...style }}>
      {/* страница */}
      <div style={box({ left: 0, top: 0, width: SITE.w, height: SITE.h, transform: `translateY(${-scroll}px)` })}>
        <div style={box({ left: 560, top: -120, width: 560, height: 560, borderRadius: 999, backgroundColor: C.yellowSoft, opacity: 0.75 })} />
        <div style={box({ left: -260, top: 1080, width: 560, height: 560, borderRadius: 999, backgroundColor: C.sky, opacity: 0.6 })} />

        {/* шапка: логотип, BalaGo, «Балдар үчүн такси», город */}
        <div style={box({ left: L.logo.x, top: L.logo.y, width: L.logo.s, height: L.logo.s, borderRadius: 999, boxShadow: SHADOW.soft, ...rise(st, 0, 0.3) })}>
          <Img src={staticFile("assets/logo.png")} style={{ width: L.logo.s, height: L.logo.s, borderRadius: 999, display: "block" }} />
        </div>
        <div style={box({ left: L.brand.x, top: L.brand.y, fontSize: 86, fontWeight: 900, lineHeight: 1.05, letterSpacing: -0.5, ...rise(st, 0.08, 0.3) })}>{s.brand}</div>
        <div style={box({ left: L.brand.x + 2, top: L.brand.y + 100, fontSize: 48, fontWeight: 800, color: C.inkSoft, ...rise(st, 0.16, 0.3) })}>{s.tagline}</div>
        <div
          style={box({
            left: L.city.x,
            top: L.city.y,
            height: L.city.h,
            padding: "0 32px 0 22px",
            borderRadius: RADIUS.chip,
            backgroundColor: C.card,
            boxShadow: SHADOW.soft,
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 44,
            fontWeight: 800,
            ...rise(st, 0.26, 0.3),
          })}
        >
          <Pin size={44} />
          {s.city}
        </div>

        {/* общий маршрут сервиса */}
        <div
          style={box({
            left: L.routeCard.x,
            top: L.routeCard.y,
            width: L.routeCard.w,
            height: ROUTE_CARD_H,
            borderRadius: RADIUS.card,
            backgroundColor: C.card,
            boxShadow: SHADOW.card,
            ...rise(st, 0.38, 0.32, 50),
          })}
        >
          <div style={box({ left: 0, top: 30, width: L.routeCard.w, display: "flex", justifyContent: "center" })}>
            <RouteLine parts={s.route} size={60} reveal={clamp((st - 0.44) / 0.3)} />
          </div>
          <div style={box({ left: (L.routeCard.w - ROUTE_CARD_SCHEME_W) / 2, top: 120 })}>
            <RouteScheme mode="full" w={ROUTE_CARD_SCHEME_W} reveal={clamp((st - 0.5) / 0.45)} labels={false} />
          </div>
        </div>

        <MainButton r={REGISTER} label={s.register} size={58} style={rise(st, 0.62, 0.3)} />

        {/* продолжение страницы — абстрактные строки (нечитаемые) */}
        <div style={box({ left: 60, top: REGISTER.y + REGISTER.h + 50, width: 820, height: 260, borderRadius: RADIUS.card, backgroundColor: C.card, boxShadow: SHADOW.soft, ...rise(st, 0.72, 0.28) })}>
          {[0.62, 0.86, 0.74].map((k, i) => (
            <div key={i} style={box({ left: 48, top: 54 + i * 52, width: 724 * k, height: 20, borderRadius: 10, backgroundColor: i === 0 ? "#E3DED3" : "#ECE8DF" })} />
          ))}
        </div>
      </div>

      {/* панель запроса семьи */}
      {rq > 0 ? (
        <>
          <div style={box({ inset: 0, backgroundColor: `rgba(23,38,61,${0.06 * rq})` })} />
          <div
            style={box({
              left: L.panel.x,
              top: panelY,
              width: L.panel.w,
              height: SITE.h - L.panelTop + 60,
              borderRadius: 40,
              backgroundColor: C.card,
              boxShadow: SHADOW.lift,
            })}
          >
            <div style={box({ left: L.panel.w / 2 - 40, top: 16, width: 80, height: 8, borderRadius: 4, backgroundColor: C.line })} />
          </div>
          <div style={box({ left: 0, top: panelY - L.panelTop, width: SITE.w, height: SITE.h })}>
            <div style={box({ left: PANEL_IN, top: P.heading, width: PANEL_W, display: "flex", justifyContent: "center" })}>
              <RouteLine parts={s.familyRoute} size={66} reveal={clamp((request - 0.45) / 0.4)} />
            </div>
            <div
              style={box({
                left: PANEL_IN,
                top: P.chip,
                width: PANEL_W,
                display: "flex",
                justifyContent: "center",
                ...rise(request, 0.6, 0.35, 24),
              })}
            >
              <div
                style={{
                  height: 76,
                  padding: "0 32px 0 22px",
                  borderRadius: RADIUS.chip,
                  backgroundColor: C.yellowSoft,
                  boxShadow: `inset 0 0 0 3px ${C.yellow}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  fontSize: 44,
                  fontWeight: 800,
                }}
              >
                <Chat size={46} />
                {s.discuss}
              </div>
            </div>
            <div style={box({ left: PANEL_IN + (PANEL_W - FAMILY_SCHEME_W) / 2, top: P.scheme })}>
              <RouteScheme mode="family" w={FAMILY_SCHEME_W} reveal={clamp((request - 0.55) / 0.45)} />
            </div>
            <MainButton r={REQUEST} label={s.request} size={56} press={press} style={rise(request, 0.7, 0.3, 24)} />
            <div
              style={box({
                left: PANEL_IN,
                top: SENT_Y,
                width: PANEL_W,
                height: 62,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
                fontSize: 44,
                fontWeight: 800,
                color: C.ink,
                opacity: clamp(sn / 0.5),
                transform: `translateY(${(1 - easeOut(sn)) * 14}px)`,
              })}
            >
              <Check size={54} draw={clamp((sn - 0.15) / 0.6)} />
              {s.sent}
            </div>
          </div>
        </>
      ) : null}

      {chrome ? <Chrome /> : null}
      {cursor ? <Cursor c={cursor} /> : null}
    </div>
  );
};
