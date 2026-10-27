// Финал BG-048: картонная кнопка «МЕКТЕП» (её смастерила дочь) переворачивается
// вокруг вертикальной оси, а её обратная сторона плавно вырастает в фирменную
// карточку: логотип, BalaGo, ҮЙ → МЕКТЕП → ҮЙ, «Бишкек • Балдар үчүн такси»,
// ссылка в профиле и крупный WhatsApp 0998 08 38 28.
//
// t — секунды от начала переворота. 0…0,30 — лицевая сторона встаёт ребром
// (лёгкий подъём и тень); 0,30…0,85 — обратная сторона разворачивается и
// растёт в карточку. С t ≥ 0,85 карточка полностью непрозрачна и неподвижна
// (без единого transform — кадры совпадают пиксель в пиксель) до конца ролика.
// До t = 0 ничего не рисуется: кнопку на коробке рисует сам набор (CardboardBox).
// Кадр 1080×1920; карточка в безопасной зоне Reels (x 80…940, y 750…1430).
import { Easing, Img, interpolate, staticFile } from "remotion";
import { fontFamily } from "../fonts";
import { CARD_DARK, GREEN_WA, INK_SOFT, MARKER, NAVY, YELLOW, YELLOW_DEEP } from "../palette";
import { clamp, easeOut, prog } from "../scenes/common";
import { B48_TEXT, B48_VIDEO } from "../script";

// Место карточки в кадре (для других слоёв: субтитры, персонажи, указатели).
export const CTA_CARD_BOX = { x: 80, y: 750, w: 860, h: 680 } as const;

const FLIP_HALF = 0.3; // лицевая сторона встала ребром
const SETTLE = 0.85; // карточка готова и неподвижна
const PAPER = "#F2D27A";
const CARD_CX = CTA_CARD_BOX.x + CTA_CARD_BOX.w / 2;
const CARD_CY = CTA_CARD_BOX.y + CTA_CARD_BOX.h / 2;
const SHADOW = "0 26px 60px rgba(60,30,10,0.26), 0 6px 16px rgba(60,30,10,0.12)";

const easeIn = Easing.bezier(0.5, 0, 0.85, 0.55);
const grow = Easing.bezier(0.33, 0, 0.18, 1);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const f1 = (n: number) => n.toFixed(1);

// ---------- Значки ----------
const RouteArrow: React.FC = () => (
  <svg width={40} height={24} viewBox="0 0 40 24" style={{ flexShrink: 0 }}>
    <path d="M 3 12 H 34 M 25 4 L 35 12 L 25 20" stroke={YELLOW_DEEP} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LinkIcon: React.FC = () => (
  <svg width={54} height={54} viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
    <circle cx={24} cy={24} r={23} fill={YELLOW} />
    <g transform="translate(24 24) scale(0.78) translate(-24 -24)">
      <path
        d="M 20 28 L 28 20 M 22 14 l 4 -4 a 8 8 0 0 1 12 12 l -4 4 M 26 34 l -4 4 a 8 8 0 0 1 -12 -12 l 4 -4"
        stroke={NAVY}
        strokeWidth={5.5}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  </svg>
);

// Зелёный кружок с белым «облачком» и трубкой — узнаваемо, но нарисовано заново.
const WhatsAppIcon: React.FC = () => (
  <svg width={66} height={66} viewBox="-38 -38 76 76" style={{ flexShrink: 0 }}>
    <circle cx={0} cy={0} r={36} fill={GREEN_WA} />
    <path d="M -15.5 13 A 20 20 0 1 1 -8.5 19.5 L -20 23 Z" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth={2} strokeLinejoin="round" />
    <g transform="rotate(-8)">
      <path d="M -8.5 -9.5 Q -9.5 1 -1.5 7.5 Q 5 12.5 10.5 9.5" stroke={GREEN_WA} strokeWidth={5.5} fill="none" strokeLinecap="round" />
      <rect x={-12.5} y={-14.5} width={8} height={10} rx={3.2} fill={GREEN_WA} transform="rotate(-18 -8.5 -9.5)" />
      <rect x={6.5} y={5} width={10} height={8} rx={3.2} fill={GREEN_WA} transform="rotate(-24 11.5 9)" />
    </g>
  </svg>
);

// ---------- Содержимое карточки (всегда в итоговом размере 860×680) ----------
const CardContent: React.FC = () => {
  const C = B48_TEXT.cta;
  const route = C.route.split(" → ");
  return (
    <div
      style={{
        width: CTA_CARD_BOX.w,
        height: CTA_CARD_BOX.h,
        boxSizing: "border-box",
        padding: "40px 28px 42px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily,
        color: NAVY,
      }}
    >
      {/* логотип + BalaGo + маршрут */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 28 }}>
        <Img
          src={staticFile(B48_VIDEO.logo)}
          style={{ width: 130, height: 130, borderRadius: 65, boxShadow: "0 8px 20px rgba(30,58,110,0.16)", flexShrink: 0 }}
        />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <div style={{ fontSize: 78, fontWeight: 1000, lineHeight: 1, letterSpacing: -0.5 }}>{C.brand}</div>
          <div
            aria-label={C.route}
            style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10, fontSize: 34, fontWeight: 900, color: INK_SOFT, lineHeight: 1, whiteSpace: "nowrap" }}
          >
            {route.map((p, i) => (
              <span key={`${p}-${i}`} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {i > 0 ? <RouteArrow /> : null}
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Бишкек • Балдар үчүн такси */}
      <div
        style={{
          background: YELLOW,
          borderRadius: 44,
          padding: "12px 30px 14px",
          fontSize: 45,
          fontWeight: 1000,
          lineHeight: 1.1,
          whiteSpace: "nowrap",
          boxShadow: "0 5px 0 rgba(224,169,26,0.55)",
        }}
      >
        {C.city}
      </div>

      {/* профиль … или WhatsApp */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 42, fontWeight: 900, lineHeight: 1.1, whiteSpace: "nowrap" }}>
          <LinkIcon />
          {C.link}
        </div>
        <div style={{ fontSize: 40, fontWeight: 800, color: INK_SOFT, lineHeight: 1.1, whiteSpace: "nowrap" }}>{C.or}</div>
      </div>

      {/* WhatsApp: 0998 08 38 28 — крупно, в одну строку */}
      <div
        style={{
          width: "100%",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          border: `5px solid ${GREEN_WA}`,
          borderRadius: 32,
          padding: "12px 14px",
          background: "#EFFBF3",
          whiteSpace: "nowrap",
        }}
      >
        <WhatsAppIcon />
        <span style={{ fontSize: 34, fontWeight: 900, lineHeight: 1 }}>{C.whatsappLabel}</span>
        <span style={{ fontSize: 66, fontWeight: 1000, lineHeight: 1.05 }}>{C.whatsappNumber}</span>
      </div>
    </div>
  );
};

// ---------- Лицевая сторона: бумажная кнопка «МЕКТЕП» ----------
// Слегка «рукодельный» контур маркером (детерминированная волна радиуса).
const wobblyCircle = (r: number, amp: number, phase: number) => {
  const pts: string[] = [];
  const n = 56;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (1 + amp * (0.6 * Math.sin(3 * a + phase) + 0.4 * Math.sin(5 * a + phase * 2)));
    pts.push(`${i === 0 ? "M" : "L"} ${f1(Math.cos(a) * rr)} ${f1(Math.sin(a) * rr)}`);
  }
  return `${pts.join(" ")} Z`;
};
const RIM = wobblyCircle(100, 0.012, 0.7);
const RING = wobblyCircle(80, 0.016, 2.1);

const PaperButton: React.FC = () => (
  <svg width="100%" height="100%" viewBox="-110 -110 220 220" style={{ overflow: "visible" }}>
    <defs>
      <radialGradient id="bg48-ctacard-paper" cx="40%" cy="35%" r="75%">
        <stop offset="0%" stopColor="#F8E3A2" />
        <stop offset="100%" stopColor={PAPER} />
      </radialGradient>
    </defs>
    {/* толщина картона */}
    <path d={RIM} transform="translate(0 7)" fill={CARD_DARK} stroke={MARKER} strokeWidth={6} strokeLinejoin="round" />
    <path d={RIM} fill="url(#bg48-ctacard-paper)" stroke={MARKER} strokeWidth={7} strokeLinejoin="round" />
    <path d={RING} fill="none" stroke={MARKER} strokeWidth={3} strokeDasharray="10 9" strokeLinecap="round" opacity={0.35} />
    {/* штрихи «ручной работы» */}
    <path d="M -58 -52 q 10 -10 22 -14 M 44 56 q 10 -6 16 -16" stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.45} />
    <text
      x={0}
      y={13}
      textAnchor="middle"
      fontFamily={fontFamily}
      fontWeight={1000}
      fontSize={40}
      fill={MARKER}
      transform="rotate(-4)"
    >
      {B48_TEXT.console.buttons[0]}
    </text>
  </svg>
);

// ---------- Искорки вокруг карточки (только до t = 0,85) ----------
const SPARKS: readonly { readonly x: number; readonly y: number; readonly s: number; readonly d: number }[] = [
  { x: 112, y: 742, s: 1, d: 0 },
  { x: 918, y: 760, s: 0.8, d: 0.04 },
  { x: 96, y: 1250, s: 0.7, d: 0.08 },
  { x: 952, y: 1180, s: 1, d: 0.02 },
  { x: 330, y: 724, s: 0.6, d: 0.06 },
  { x: 720, y: 1452, s: 0.75, d: 0.05 },
];

const Spark: React.FC<{ readonly x: number; readonly y: number; readonly k: number }> = ({ x, y, k }) => (
  <svg
    width={60}
    height={60}
    viewBox="-30 -30 60 60"
    style={{ position: "absolute", left: x - 30, top: y - 30, transform: `scale(${f1(k)}) rotate(${f1(20 * k)}deg)`, opacity: Math.min(1, k * 1.4) }}
  >
    <path d="M 0 -28 Q 4 -4 28 0 Q 4 4 0 28 Q -4 4 -28 0 Q -4 -4 0 -28 Z" fill={YELLOW} />
    <circle cx={0} cy={0} r={5} fill="#FFFFFF" />
  </svg>
);

// ---------- Карточка ----------
export const CtaCard: React.FC<{
  readonly t: number;
  readonly fromX: number;
  readonly fromY: number;
  // диаметр кнопки в момент t = 0 (px кадра), по умолчанию 200
  readonly fromSize?: number;
}> = ({ t, fromX, fromY, fromSize = 200 }) => {
  if (t < 0) return null;
  const D = fromSize;
  const B = CTA_CARD_BOX;

  // Итоговое состояние: никаких анимируемых свойств — кадр неподвижен.
  if (t >= SETTLE) {
    return (
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            left: B.x,
            top: B.y,
            width: B.w,
            height: B.h,
            borderRadius: 44,
            background: "rgba(255,255,255,0.97)",
            boxShadow: SHADOW,
            overflow: "hidden",
          }}
        >
          <CardContent />
          <div style={{ position: "absolute", inset: 0, borderRadius: 44, border: `6px solid ${YELLOW}`, boxSizing: "border-box" }} />
        </div>
      </div>
    );
  }

  // 1) лицевая сторона: встаёт ребром, чуть приподнимаясь
  if (t < FLIP_HALF) {
    const p = prog(t, 0, FLIP_HALF, easeIn);
    const lift = prog(t, 0, FLIP_HALF, easeOut);
    const shadowW = D * 0.86 * Math.max(0.08, Math.cos((p * Math.PI) / 2));
    return (
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            left: fromX - shadowW / 2,
            top: fromY + D * 0.42 + 10 * lift,
            width: shadowW,
            height: D * 0.2,
            borderRadius: "50%",
            background: "radial-gradient(closest-side, rgba(60,30,10,0.32), rgba(60,30,10,0))",
            opacity: 0.9 - 0.35 * lift,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: fromX - D / 2,
            top: fromY - D / 2,
            width: D,
            height: D,
            transform: `perspective(${f1(D * 5)}px) translateY(${f1(-18 * lift)}px) rotateY(${f1(90 * p)}deg) scale(${(1 + 0.07 * lift).toFixed(3)})`,
          }}
        >
          <PaperButton />
        </div>
      </div>
    );
  }

  // 2) обратная сторона разворачивается и растёт в карточку
  const r = prog(t, FLIP_HALF, 0.56, easeOut);
  const g = prog(t, FLIP_HALF, SETTLE, grow);
  const cx = lerp(fromX, CARD_CX, g);
  const cy = lerp(fromY, CARD_CY, g) - 36 * Math.sin(Math.PI * g);
  const w = lerp(D, B.w, g);
  const h = lerp(D, B.h, g);
  const round = interpolate(t, [0.36, 0.78], [Math.min(w, h) / 2, 44], { ...clamp, easing: easeOut });
  const radius = Math.min(round, Math.min(w, h) / 2);
  // содержимое — уменьшенная копия итоговой карточки, вписанная в форму
  const content = prog(t, 0.4, 0.72, easeOut);
  const fit = Math.min(w / B.w, h / B.h) * (0.94 + 0.06 * content);
  const pop = 0.022 * Math.sin(Math.PI * prog(t, 0.6, SETTLE, Easing.linear));
  const tint = 1 - prog(t, FLIP_HALF, 0.55);
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {SPARKS.map((s, i) => {
        const k = Math.sin(Math.PI * prog(t, 0.55 + s.d, SETTLE - 0.02, Easing.linear)) * s.s;
        return k > 0.001 ? <Spark key={i} x={s.x} y={s.y} k={k} /> : null;
      })}
      <div
        style={{
          position: "absolute",
          left: cx - w / 2,
          top: cy - h / 2,
          width: w,
          height: h,
          borderRadius: radius,
          background: `rgba(255,${Math.round(255 - 10 * tint)},${Math.round(255 - 40 * tint)},0.97)`,
          boxShadow: `0 ${f1(10 + 16 * g)}px ${f1(24 + 36 * g)}px rgba(60,30,10,${(0.18 + 0.08 * g).toFixed(3)})`,
          overflow: "hidden",
          transform: `perspective(${f1(Math.max(w, 600) * 3)}px) rotateY(${f1(-90 * (1 - r))}deg) scale(${(1 + pop).toFixed(4)})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: (w - B.w) / 2,
            top: (h - B.h) / 2,
            width: B.w,
            height: B.h,
            opacity: content,
            transform: `scale(${fit.toFixed(4)})`,
          }}
        >
          <CardContent />
        </div>
        <div style={{ position: "absolute", inset: 0, borderRadius: radius, border: `6px solid ${YELLOW}`, boxSizing: "border-box" }} />
      </div>
    </div>
  );
};
