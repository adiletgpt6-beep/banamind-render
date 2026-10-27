// Сцена 6 «cta» BG-035: 22 жетона → жёлтая дуга под логотипом → статичный
// финальный экран (Бишкек, ссылка в профиле, WhatsApp 0998 08 38 28).
//
// Сюжет движения (кадры сцены; всё движение — в кадрах 0 … CTA_STILL):
//  a) кадр 0 = последний кадр сцены 5 (TRIAL_END): лоток в TRAY_SIDE
//     (FullTray), дорожка шагов, фишка «СЫНОО» у шага 3. Жетоны «заряжаются»
//     (подсветка ободка), основа лотка сжимается и гаснет, дорожка шагов и
//     фишка уходят вниз; счётчик «22» сжимается — из него вырастает логотип
//     BalaGo и с перелётом переезжает в (CTA_LAYOUT.x, 500). 22 жетона по
//     очереди (через полкадра, слева направо по будущей дуге) взлетают
//     дугами со шлейфом (как в сцене 3), растут «к камере» и уменьшаются в
//     точки эмблемы: 20 жёлтых + 2 мятных в конце дуги («20 + 2»), под
//     нижней половиной логотипа. Мягкая дорожка дуги тянется за посадками;
//     посадка — «подскок» и волна. Фон: кремовый → белый, два мягких
//     фирменных круга. Камера слегка наезжает и возвращается (к кадру 26).
//     Последний жетон садится в кадре 23, к кадру 27 логотип и эмблема
//     неподвижны.
//  b) кадры 17 … 30: надписи быстро поднимаются (город, ссылка, «же …»,
//     плашка с номером).
//  c) кадр 30 (BG35_CONTACTS_IN) … конец: экран полностью неподвижен —
//     все расчёты берут min(кадр, CTA_STILL). Речь n08–n10 идёт поверх
//     неподвижного экрана; субтитры в этой сцене не рисуются.
//
// Зоны Reels: всё важное — ниже y 250, выше y 1500, левее x 930.
import type React from "react";
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import {
  anticipate,
  clamp,
  easeIn,
  easeInOut,
  easeOut,
  hash01,
  keys,
  lerp,
} from "../../../two-schedules-2d/rig/motion";
import { C } from "../palette";
import {
  BG35_CONTACTS_IN,
  BG35_TEXT,
  BG35_TOKENS,
  BG35_VIDEO,
} from "../script";
import {
  bonusPos,
  Odometer,
  ringPos,
  Token,
  TRAY,
  TrayBase,
  TrayFrame,
  trayToScreen,
  TrialChip,
} from "../tokens";
import { box, Logo, pop, rise } from "../ui";
import { StepRail, TRIAL_END } from "./Trial";

const N = BG35_TOKENS.paid; // 20 оплаченных
const M = BG35_TOKENS.paid + BG35_TOKENS.bonus; // 22 точки эмблемы
const V = TRIAL_END.view; // лоток в конце сцены 5

// С этого кадра сцены экран неподвижен до конца ролика (контакты видны).
export const CTA_STILL = Math.round(BG35_CONTACTS_IN * BG35_VIDEO.fps);

// Моменты (кадры сцены) и длительности движений.
export const CTA_KEYS = {
  launch: 0.5, // первый жетон взлетает (кадр 0 — ещё FullTray)
  stagger: 0.5, // следующий — через полкадра (порядок дуги)
  flight: 12, // полёт жетона до точки дуги (последний садится к кадру 23)
  bounce: 3, // «подскок» точки после посадки
  wave: 4, // кольцо-волна посадки (последняя гаснет к кадру 27)
  out: 14, // основа лотка, дорожка шагов, фишка уходят
  logoAt: 3, // логотип вырастает из счётчика «22»
  logoDur: 17,
  bg: 22, // кремовый фон → белый, фирменные круги
  city: 17, // надписи: подъём за rise кадров
  link: 19,
  or: 20,
  plate: 21,
  rise: 9,
} as const;

// Раскладка финального экрана (мир 1080 × 1920).
export const CTA_LAYOUT = {
  x: 510, // общая ось: логотип, дуга, надписи (строки ≤ 820 px: 100 … 920)
  logoY: 500,
  logoSize: 340,
  arc: { R: 214, r: 14.5, from: 195, to: -15 }, // градусы, y вниз
  cityTop: 800,
  citySize: 56,
  linkTop: 922,
  linkSize: 46,
  orTop: 1032,
  orSize: 44,
  plateTop: 1104,
  labelSize: 46,
  numberSize: 104,
} as const;

const L = CTA_LAYOUT;
const K = CTA_KEYS;

// ---------- Эмблема: 22 точки по дуге под логотипом ----------

type P = { readonly x: number; readonly y: number };

// Точка k (0 … 21) дуги: слева направо через низ; 20, 21 — мятные «+2».
const slot = (k: number): P => {
  const a = ((L.arc.from + ((L.arc.to - L.arc.from) * k) / (M - 1)) * Math.PI) / 180;
  return { x: L.x + L.arc.R * Math.cos(a), y: L.logoY + L.arc.R * Math.sin(a) };
};

// Откуда летит жетон (экран) и его радиус в конце сцены 5.
const paidSrc = (i: number) => trayToScreen(ringPos(i), V);
const bonusSrc = (j: number) => trayToScreen(bonusPos(j), V);

// Жетоны кольца идут по часовой стрелке, дуга — против (слева через низ
// направо): точке k достаётся жетон (s − k) mod 20; сдвиг s — с самым
// коротким суммарным путём (без лишних пересечений траекторий).
const SHIFT = (() => {
  let best = 0;
  let bestD = Infinity;
  for (let s = 0; s < N; s++) {
    let d = 0;
    for (let k = 0; k < N; k++) {
      const p = paidSrc((((s - k) % N) + N) % N);
      const q = slot(k);
      d += Math.hypot(p.x - q.x, p.y - q.y);
    }
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  return best;
})();

type Flyer = {
  readonly k: number;
  readonly kind: "paid" | "bonus";
  readonly src: P;
  readonly r0: number; // радиус на экране в начале
  readonly dst: P;
  readonly c: P; // контрольная точка дуги полёта
  readonly launch: number;
  readonly land: number;
  readonly spin: number;
};

const FLYERS: readonly Flyer[] = Array.from({ length: M }, (_, k) => {
  const paid = k < N;
  const src = paid ? paidSrc((((SHIFT - k) % N) + N) % N) : bonusSrc(k - N);
  const dst = slot(k);
  // дуга выгибается наружу — от центра логотипа
  const mx = (src.x + dst.x) / 2;
  const my = (src.y + dst.y) / 2;
  const len = Math.max(1, Math.hypot(dst.x - src.x, dst.y - src.y));
  let nx = -(dst.y - src.y) / len;
  let ny = (dst.x - src.x) / len;
  if ((mx - L.x) * nx + (my - L.logoY) * ny < 0) {
    nx = -nx;
    ny = -ny;
  }
  const bulge = 36 + 0.3 * len;
  const launch = K.launch + k * K.stagger;
  return {
    k,
    kind: paid ? "paid" : "bonus",
    src,
    r0: (paid ? TRAY.r : TRAY.bonusR) * V.s,
    dst,
    c: { x: mx + nx * bulge, y: my + ny * bulge },
    launch,
    land: launch + K.flight,
    spin: (k % 2 ? 1 : -1) * (170 + 150 * hash01(k * 5.3 + 2)),
  };
});

// Положение жетона в кадре g: позиция, радиус (экран), поворот, подъём.
const flyAt = (fl: Flyer, g: number) => {
  const t = clamp((g - fl.launch) / K.flight);
  const u = anticipate(t);
  const q = 1 - u;
  const x = q * q * fl.src.x + 2 * q * u * fl.c.x + u * u * fl.dst.x;
  const y = q * q * fl.src.y + 2 * q * u * fl.c.y + u * u * fl.dst.y;
  // растёт «к камере» в середине полёта, к посадке — точка эмблемы
  const r = lerp(fl.r0, L.arc.r, easeInOut(t)) * (1 + 0.3 * Math.sin(Math.PI * t));
  return {
    t,
    x,
    y,
    r,
    rot: fl.spin * (1 - easeOut(t)) * (t > 0 ? 1 : 0),
    lift: Math.sin(Math.PI * t),
  };
};

// Экран → координаты лотка (жетоны рисуются в TrayFrame, как в FullTray,
// поэтому кадр 0 совпадает с концом сцены 5 до пикселя).
const toTray = (p: P): P => ({
  x: TRAY.cx + (p.x - V.cx) / V.s,
  y: TRAY.cy + (p.y - V.cy) / V.s,
});

// Колокол 0 → 1 → 0 за d кадров.
const bump = (x: number, d: number) =>
  x <= 0 || x >= d ? 0 : Math.sin((Math.PI * x) / d);

// Точка эмблемы: те же цвета и ободок, что у жетона, без знака.
const Dot: React.FC<{
  readonly kind: "paid" | "bonus";
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly opacity?: number;
}> = ({ kind, x, y, r, opacity = 1 }) => {
  const paid = kind === "paid";
  return (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      <circle r={r} fill={paid ? C.yellowDeep : C.mintDeep} />
      <circle r={r * 0.86} fill={paid ? C.yellow : C.mint} />
      <circle
        r={r * 0.62}
        fill="none"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth={Math.max(1.2, r * 0.1)}
      />
    </g>
  );
};

// ---------- Значки ----------

// Профиль со стрелкой вверх: «ссылка в шапке профиля».
const ProfileGlyph: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" style={{ overflow: "visible", flexShrink: 0 }}>
    <defs>
      <clipPath id="bg35-cta-avatar">
        <circle cx={28} cy={36} r={24} />
      </clipPath>
    </defs>
    <circle cx={28} cy={36} r={24} fill={C.sky} />
    <g clipPath="url(#bg35-cta-avatar)" fill={C.navy}>
      <circle cx={28} cy={30} r={9} />
      <path d="M 8 62 Q 9 44 28 43 Q 47 44 48 62 Z" />
    </g>
    <circle cx={28} cy={36} r={24} fill="none" stroke={C.navy} strokeWidth={4.5} />
    <circle cx={51} cy={13} r={13} fill={C.yellow} stroke={C.navy} strokeWidth={3.5} />
    <path
      d="M 51 20 L 51 7 M 45.5 12 L 51 6.5 L 56.5 12"
      fill="none"
      stroke={C.navy}
      strokeWidth={3.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Зелёный круг с белой телефонной трубкой (свой рисунок, не логотип).
const WA_GREEN = "#25D366";
const PhoneGlyph: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible", flexShrink: 0 }}>
    <circle cx={50} cy={50} r={48} fill={WA_GREEN} stroke="#FFFFFF" strokeWidth={5} />
    <g transform="translate(50 50) scale(0.78) translate(-50 -51)">
      <path
        d="M 28 45 Q 36 63 55 72 L 63 64 Q 66 61 70 62 L 80 65 Q 84 66 84 70 L 84 80 Q 84 85 78 85 A 62 62 0 0 1 16 23 Q 16 17 22 17 L 31 17 Q 35 17 36 21 L 38 32 Q 39 36 36 38 Z"
        fill="#FFFFFF"
      />
    </g>
  </svg>
);

// Строка по общей оси L.x (не шире полей 60 … 930).
const Row: React.FC<{
  readonly top: number;
  readonly style?: React.CSSProperties;
  readonly children: React.ReactNode;
}> = ({ top, style, children }) => (
  <div
    style={box({
      left: L.x - 500,
      width: 1000,
      top,
      display: "flex",
      justifyContent: "center",
      ...style,
    })}
  >
    {children}
  </div>
);

// ---------- Сцена ----------

export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  // всё движение — до CTA_STILL; дальше экран неподвижен до конца
  const g = Math.min(f, CTA_STILL);

  // --- уход сцены 5: основа лотка, счётчик, дорожка шагов, фишка
  const out = easeInOut(clamp(g / K.out));
  const baseOut = easeIn(clamp((g - 1) / (K.out - 2)));
  const odoOut = easeInOut(clamp(g / 5));

  // --- фон
  const bgT = easeInOut(clamp(g / K.bg));
  const circ = easeOut(clamp((g - 3) / (K.bg - 3)));

  // --- камера: лёгкий наезд и возврат (к кадру 26 — ровно 1)
  const zoom = keys(g, [
    [0, 1],
    [11, 1.035],
    [26, 1],
  ]);

  // --- логотип вырастает из счётчика «22» и переезжает на ось
  const logoT = clamp((g - K.logoAt) / K.logoDur);
  const logoU = easeInOut(logoT);
  const odoC = { x: V.cx, y: V.cy - 26 * V.s };
  const logoX = lerp(odoC.x, L.x, logoU);
  const logoY = lerp(odoC.y, L.logoY, logoU) - 46 * Math.sin(Math.PI * logoU);
  const logoS = 0.26 + 0.74 * pop(g, K.logoAt, K.logoDur);
  const logoRot = -26 * (1 - easeOut(logoT));
  const logoA = clamp((g - K.logoAt) / 4);
  const logoEnd = K.logoAt + K.logoDur;
  const halo = easeOut(clamp((g - logoEnd) / 6)); // волна гаснет к кадру 26

  // --- мягкая дорожка дуги тянется за посадками (до точки k — когда садится k)
  const land0 = FLYERS[0].land;
  const landN = FLYERS[M - 1].land;
  const trackP = clamp((g - land0 + 1) / (landN - land0 + 1));
  const arcLen = (L.arc.R * Math.abs(L.arc.to - L.arc.from) * Math.PI) / 180;
  const a0 = slot(0);
  const a1 = slot(M - 1);

  // --- состояние каждого жетона
  const states = FLYERS.map((fl) => {
    const s = flyAt(fl, g);
    const fade = clamp((s.t - 0.5) / 0.4); // жетон → точка
    // «заряд» перед взлётом: подсветка ободка (в кадре 0 — ровно 0)
    const charge =
      clamp(g / 3) * easeIn(clamp((g - (fl.launch - 6)) / 6)) * (1 - s.t);
    return { fl, s, fade, charge, k: g - fl.land };
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: C.paper,
        overflow: "hidden",
        fontFamily,
        color: C.navy,
      }}
    >
      {/* ---------- фон: белый и два мягких фирменных круга ---------- */}
      <div style={box({ inset: 0, backgroundColor: "#FFFFFF", opacity: bgT })} />
      {circ > 0 ? (
        <>
          <div
            style={box({
              left: -230,
              top: -250,
              width: 780,
              height: 780,
              borderRadius: "50%",
              backgroundColor: C.yellowSoft,
              opacity: 0.72 * circ,
              transform: `scale(${0.6 + 0.4 * circ})`,
              transformOrigin: "30% 30%",
            })}
          />
          <div
            style={box({
              right: -210,
              bottom: -190,
              width: 640,
              height: 640,
              borderRadius: "50%",
              backgroundColor: C.sky,
              opacity: circ,
              transform: `scale(${0.6 + 0.4 * circ})`,
              transformOrigin: "70% 70%",
            })}
          />
        </>
      ) : null}

      {/* ---------- мир: камера ---------- */}
      <div
        style={box({
          left: 0,
          top: 0,
          width: 1080,
          height: 1920,
          transformOrigin: `${L.x}px 640px`,
          transform: `scale(${zoom})`,
        })}
      >
        {/* дорожка шагов и фишка «СЫНОО» уходят вниз */}
        {out < 1 ? (
          <div
            style={box({
              left: 0,
              top: 0,
              width: 1080,
              height: 1920,
              opacity: 1 - out,
              transform: `translateY(${70 * out}px)`,
            })}
          >
            <StepRail />
            <div
              style={box({
                left: 0,
                top: 0,
                width: 1080,
                height: 1920,
                transformOrigin: `${TRIAL_END.chip.x}px ${TRIAL_END.chip.y}px`,
                transform: `translate(${-40 * out}px, ${50 * easeIn(clamp(g / K.out))}px) rotate(${-14 * out}deg)`,
              })}
            >
              <TrialChip
                x={TRIAL_END.chip.x}
                y={TRIAL_END.chip.y}
                size={TRIAL_END.chip.size}
              />
            </div>
          </div>
        ) : null}

        {/* основа лотка и счётчик «22» (в координатах лотка) */}
        <TrayFrame v={V}>
          {baseOut < 1 ? (
            <div
              style={box({
                left: 0,
                top: 0,
                width: 1080,
                height: 1920,
                opacity: 1 - baseOut,
                transformOrigin: `${TRAY.cx}px ${TRAY.cy}px`,
                transform: `scale(${1 - 0.18 * baseOut})`,
              })}
            >
              <TrayBase fill={1} />
            </div>
          ) : null}
          {odoOut < 1 ? (
            <div
              style={box({
                left: 0,
                top: 0,
                width: 1080,
                height: 1920,
                opacity: 1 - odoOut,
                transformOrigin: `${TRAY.cx}px ${TRAY.cy - 26}px`,
                transform: `scale(${1 - 0.5 * odoOut})`,
              })}
            >
              <Odometer v={22} x={TRAY.cx} y={TRAY.cy - 26} color={C.mintDeep} />
              <div
                style={box({
                  left: TRAY.cx - 200,
                  top: TRAY.cy + 72,
                  width: 400,
                  textAlign: "center",
                  fontFamily,
                  fontWeight: 900,
                  fontSize: 36,
                  color: C.muted,
                })}
              >
                {BG35_TEXT.fill.counterOf}
              </div>
            </div>
          ) : null}
        </TrayFrame>

        {/* логотип BalaGo и волна при его посадке */}
        {logoA > 0 ? (
          <div
            style={box({
              left: 0,
              top: 0,
              width: 1080,
              height: 1920,
              transformOrigin: `${logoX}px ${logoY}px`,
              transform: `rotate(${logoRot}deg)`,
            })}
          >
            <Logo x={logoX} y={logoY} size={L.logoSize} scale={logoS} opacity={logoA} />
          </div>
        ) : null}

        {/* эмблема: дорожка дуги, волны посадок (без тени) */}
        <svg
          width={1080}
          height={1920}
          style={box({ left: 0, top: 0, overflow: "visible" })}
        >
          {halo > 0 && halo < 1 ? (
            <circle
              cx={L.x}
              cy={L.logoY}
              r={L.logoSize / 2 + 8 + 70 * halo}
              fill="none"
              stroke={C.yellow}
              strokeWidth={12 * (1 - halo)}
              opacity={0.55 * (1 - halo)}
            />
          ) : null}
          {trackP > 0 ? (
            <path
              d={`M ${a0.x} ${a0.y} A ${L.arc.R} ${L.arc.R} 0 1 0 ${a1.x} ${a1.y}`}
              fill="none"
              stroke={C.yellowSoft}
              strokeWidth={2 * L.arc.r + 14}
              strokeLinecap="round"
              strokeDasharray={`${arcLen * trackP} ${arcLen + 100}`}
            />
          ) : null}
          {states.map(({ fl, k }) =>
            k >= 0 && k < K.wave ? (
              <circle
                key={`w${fl.k}`}
                cx={fl.dst.x}
                cy={fl.dst.y}
                r={L.arc.r + 3 + 16 * easeOut(k / K.wave)}
                fill="none"
                stroke={fl.kind === "paid" ? C.yellow : C.mintDeep}
                strokeWidth={5 * (1 - k / K.wave)}
                opacity={0.7 * (1 - k / K.wave)}
              />
            ) : null,
          )}
        </svg>
        {/* точки эмблемы: 20 жёлтых + 2 мятных */}
        <svg
          width={1080}
          height={1920}
          style={box({
            left: 0,
            top: 0,
            overflow: "visible",
            filter: "drop-shadow(0 3px 4px rgba(20,40,90,0.18))",
          })}
        >
          {states.map(({ fl, s, fade, k }) =>
            fade > 0 ? (
              <Dot
                key={`d${fl.k}`}
                kind={fl.kind}
                x={s.x}
                y={s.y}
                r={s.r * (1 + 0.22 * bump(k, K.bounce))}
              />
            ) : null,
          )}
        </svg>

        {/* шлейф скорости (как у жетонов сцены 3) */}
        <svg
          width={1080}
          height={1920}
          style={box({ left: 0, top: 0, overflow: "visible" })}
        >
          {states.map(({ fl, s }) => {
            if (s.t <= 0 || s.t >= 1 || g - fl.launch < 2.2) return null;
            const p0 = flyAt(fl, g - 2.2);
            const p1 = flyAt(fl, g - 1.1);
            const speed = Math.hypot(s.x - p0.x, s.y - p0.y) / 2.2;
            const a = 0.3 * clamp((speed - 8) / 18) * s.lift;
            if (a <= 0.01) return null;
            return (
              <path
                key={`s${fl.k}`}
                d={`M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${s.x} ${s.y}`}
                fill="none"
                stroke={fl.kind === "paid" ? C.yellow : C.mint}
                strokeOpacity={a}
                strokeWidth={s.r * 1.2}
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        {/* летящие жетоны (в координатах лотка — кадр 0 = FullTray) */}
        <TrayFrame v={V}>
          {states.map(({ fl, s, fade, charge }) => {
            if (fade >= 1) return null;
            const p = toTray(s);
            return (
              <Token
                key={`t${fl.k}`}
                kind={fl.kind}
                x={p.x}
                y={p.y}
                r={s.r / V.s}
                rot={s.rot}
                lift={s.lift}
                glow={Math.min(1, 0.8 * charge + 0.5 * s.lift)}
                opacity={1 - fade}
              />
            );
          })}
        </TrayFrame>
      </div>

      {/* ---------- надписи и контакты (неподвижны с кадра CTA_STILL) ---------- */}
      <Row top={L.cityTop} style={rise(g, K.city, K.rise)}>
        <CityLine />
      </Row>

      <Row top={L.linkTop} style={rise(g, K.link, K.rise)}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, whiteSpace: "nowrap" }}>
          <ProfileGlyph size={70} />
          <div style={{ fontSize: L.linkSize, fontWeight: 900, lineHeight: 1.1, letterSpacing: -0.4 }}>
            {BG35_TEXT.cta.link}
          </div>
        </div>
      </Row>

      <Row top={L.orTop} style={rise(g, K.or, K.rise)}>
        <div
          style={{
            fontSize: L.orSize,
            fontWeight: 800,
            lineHeight: 1.1,
            color: C.ink,
            whiteSpace: "nowrap",
            letterSpacing: -0.3,
          }}
        >
          {BG35_TEXT.cta.or}
        </div>
      </Row>

      <Row top={L.plateTop} style={rise(g, K.plate, K.rise, 30)}>
        <div
          style={{
            transform: `scale(${0.9 + 0.1 * pop(g, K.plate, K.rise)})`,
            padding: "18px 40px 22px",
            borderRadius: 46,
            backgroundColor: C.yellow,
            boxShadow: `0 10px 0 ${C.yellowDeep}, 0 26px 44px rgba(242,178,0,0.32)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            whiteSpace: "nowrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <PhoneGlyph size={64} />
            <div style={{ fontSize: L.labelSize, fontWeight: 900, lineHeight: 1.1 }}>
              {BG35_TEXT.cta.whatsappLabel}
            </div>
          </div>
          <div
            style={{
              fontSize: L.numberSize,
              fontWeight: 1000,
              lineHeight: 1.05,
              letterSpacing: 1,
              fontVariantNumeric: "tabular-nums",
              marginTop: 4,
            }}
          >
            {BG35_TEXT.cta.whatsappNumber}
          </div>
        </div>
      </Row>
    </div>
  );
};

// «Бишкек • Балдар үчүн такси»: точка-разделитель — фирменным жёлтым.
const CityLine: React.FC = () => {
  const parts = BG35_TEXT.cta.city.split("•");
  return (
    <div
      style={{
        fontSize: L.citySize,
        fontWeight: 900,
        lineHeight: 1.15,
        letterSpacing: -0.6,
        whiteSpace: "nowrap",
        color: C.navy,
      }}
    >
      {parts.map((p, i) => (
        <span key={i}>
          {i > 0 ? <span style={{ color: C.yellowDeep }}>•</span> : null}
          {p}
        </span>
      ))}
    </div>
  );
};
