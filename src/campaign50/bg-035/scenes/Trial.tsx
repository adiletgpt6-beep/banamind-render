// Сцена 5 «trial» BG-035: фишка «Сыноо» — вне 22; честный порядок шагов;
// цена по расстоянию (без цифр и валюты).
//
// Сюжет движения (все моменты — от фактической озвучки, useLine/useWordAt):
//  a) 0 → n05: камера отъезжает — лоток (FullTray, счётчик 22) с лёгким
//     замахом уходит из TRAY_HOME в TRAY_MID (вправо-вверх, кольцо ещё
//     крупное), слева освобождается место; вертикальный
//     пунктир-разделитель рисуется сверху вниз (x 390).
//  b) n05 «сыноо»: слева, ВНЕ лотка, выпрыгивает белая фишка «СЫНОО»
//     (с поворотом и перелётом), под ней «22 сапардын ичинде эмес»;
//     сверху — кинетическая плашка «Сыноо сапары өзүнчө».
//     На «эки бонус» мятная пара «+2» подсвечивается, фишка замахивается,
//     разгоняется к лотку, упирается в разделитель (пунктир прогибается и
//     дрожит, как струна; фишка сплющивается, «качает головой») и
//     возвращается на место. На «өзүнчө» слово «өзүнчө» на плашке
//     подчёркивается жёлтым и вздрагивает, фишка вспыхивает.
//  c) n06: камера отъезжает к общему плану, лоток уходит в TRAY_SIDE; по
//     y 1130 рисуется дорожка из 4 шагов (номера 1–4, заголовки,
//     пояснения 30 px):
//     «топ» — шаг 1 загорается, 4 детские головы сбегаются к нему и
//     собираются в «группу» (жёлтая плашка на «түзүлөт»);
//     «сыноо» — фишка взлетает, разделитель втягивается, фишка по дуге
//     опускается на дорожку и подъезжает к шагу 2; «өтөт» — вокруг неё
//     замыкается жёлтая петля (1 полный сапар);
//     «андан» — фишка прыжком переходит к шагу 3 «Чечим • өзүңүздө»
//     (мягкие волны «решения», без галочек и нажатий); на шаге 2 остаётся
//     маленькая отметка «пройдено» (галочка только у шага 2);
//     «тандайсыз» — шаг 4 загорается, пунктирная стрелка тянется от него
//     к лотку; по кольцу бежит волна света, лоток «вздыхает» — пакет
//     выбирается только после сыноо. Фишка в лоток не входит никогда.
//  d) n07: плашка меняется на «Баасы аралыкка жараша»; слева — карточка
//     «үй — км — мектеп»: пунктир рисуется, «км» выпрыгивает, школа мягко
//     отъезжает и возвращается (расстояние у всех разное). Без цифр.
//     После n07 — время на чтение дорожки: по шагам 1 → 4 проходит мягкая
//     волна подсветки (порядок «топ → сыноо → чечим → топтом»).
//  e) последние ≈ 26 кадров: плашка, карточка, стрелка, дети и подсветки
//     (и отметка шага 2) гаснут; последние 12 кадров неподвижны: лоток в TRAY_SIDE (как
//     FullTray), дорожка шагов (StepRail по умолчанию), фишка у шага 3 —
//     ровно TRIAL_END (с этого кадра начинается сцена 6).
import type React from "react";
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import {
  anticipate,
  clamp,
  easeIn,
  easeInOut,
  easeOut,
  lerp,
} from "../../../two-schedules-2d/rig/motion";
import type { Cam } from "../../../two-schedules-2d/shots";
import { useLine, useScene, useWordAt } from "../context";
import { C } from "../palette";
import { BG35_TEXT, BG35_TOKENS, BG35_WORDS } from "../script";
import {
  bonusPos,
  mixView,
  Odometer,
  ringPos,
  Token,
  TRAY,
  TRAY_HOME,
  TRAY_SIDE,
  TrayBase,
  TrayFrame,
  trayToScreen,
  TrialChip,
  type TrayView,
} from "../tokens";
import { box, HomeIcon, pop, SchoolIcon, Txt } from "../ui";

const TAU = Math.PI * 2;
const N = BG35_TOKENS.paid;

// ---------- Раскладка (мир 1080 × 1920) ----------
// Вне зон Reels: сверху 250, снизу 400, справа 150; полоса субтитров
// y ≈ 1380–1520 — подписи шагов (заголовок 33 px + пояснение 30 px до
// 3 строк в ширину labelW) заканчиваются выше y ≈ 1330, правая — до x 918.
export const TRIAL_RAIL = {
  y: 1130,
  x0: 96,
  x1: 864,
  stops: [150, 370, 590, 810],
  markerR: 26,
  labelTop: 1172,
  labelW: 216,
} as const;

// Фишка «СЫНОО»: дома (слева, вне лотка) и на дорожке (над шагом).
export const TRIAL_CHIP = {
  homeX: 200,
  homeY: 640,
  homeSize: 120,
  railSize: 100,
  railY: 1050, // центр фишки, стоящей над шагом дорожки
} as const;

export const TRIAL_DIVIDER = { x: 390, y0: 450, y1: 900 } as const;

// Промежуточный вид лотка на n05 (до появления дорожки шагов): кольцо
// крупнее, чем в TRAY_SIDE (≈ 525 px на экране при камере n05), левый
// край — сразу за разделителем. На n06 лоток уходит в TRAY_SIDE.
const TRAY_MID: TrayView = { s: 0.68, cx: 658, cy: 660 };

// Последний кадр сцены 5 = первый кадр сцены 6: лоток TRAY_SIDE с
// FullTray, <StepRail /> (все 4 шага подсвечены), фишка у шага 3 «Чечим».
export const TRIAL_END = {
  view: TRAY_SIDE,
  chip: {
    x: TRIAL_RAIL.stops[2],
    y: TRIAL_CHIP.railY,
    size: TRIAL_CHIP.railSize,
  },
} as const;

// Длительности движений (кадры).
export const TRIAL_KEYS = {
  pullMin: 16, // отъезд камеры TRAY_HOME → TRAY_SIDE (до начала n05)
  pullMax: 26,
  divider: 16, // рисование разделителя
  chipPop: 14,
  approach: 16, // замах + разгон фишки до разделителя
  lift: 5, // подъём фишки перед полётом на дорожку
  flight: 16, // полёт по дуге до касания дорожки
  ride: 9, // подъезд по дорожке к шагу 2
  loop: 16, // петля «1 полный сапар» вокруг фишки
  hop: 17, // прыжок к шагу 3
  arrow: 16, // стрелка от шага 4 к лотку
  endFade: 26, // за столько кадров до конца гаснут подсказки
  endHold: 12, // последние кадры неподвижны (= TRIAL_END)
} as const;

// ---------- Мелкие функции движения ----------

// Колокол 0 → 1 → 0 за d кадров.
const bump = (x: number, d: number) =>
  x <= 0 || x >= d ? 0 : Math.sin((Math.PI * x) / d);
// Затухающая пружина после удара (ровно 0 к n-му кадру).
const settle = (k: number, n = 12) =>
  k < 0 || k >= n ? 0 : Math.cos(k * 0.9) * Math.exp(-k / 2.8) * (1 - k / n);

const rgb = (h: string) =>
  [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const A = rgb(a);
  const B = rgb(b);
  const k = clamp(t);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(",")})`;
};

// Точка мира → точка кадра при камере cam.
const proj = (p: { x: number; y: number }, cam: Cam) => ({
  x: 540 + (p.x - cam.x) * cam.zoom,
  y: 960 + (p.y - cam.y) * cam.zoom,
});
const camStyle = (cam: Cam): React.CSSProperties =>
  box({
    left: 0,
    top: 0,
    width: 1080,
    height: 1920,
    transformOrigin: "0 0",
    transform: `translate(${540 - cam.x * cam.zoom}px, ${960 - cam.y * cam.zoom}px) scale(${cam.zoom})`,
  });

const BASE: Cam = { x: 540, y: 960, zoom: 1 };
// Камера по ключам [кадр, x, y, zoom] (плавно между ключами).
const camAt = (
  f: number,
  pts: readonly (readonly [number, number, number, number])[],
): Cam => {
  if (f <= pts[0][0]) return { x: pts[0][1], y: pts[0][2], zoom: pts[0][3] };
  for (let i = 1; i < pts.length; i++) {
    const [t1, ...b] = pts[i];
    const [t0, ...a] = pts[i - 1];
    if (f <= t1) {
      const e = t1 <= t0 ? 1 : easeInOut((f - t0) / (t1 - t0));
      return { x: lerp(a[0], b[0], e), y: lerp(a[1], b[1], e), zoom: lerp(a[2], b[2], e) };
    }
  }
  const l = pts[pts.length - 1];
  return { x: l[1], y: l[2], zoom: l[3] };
};
// Дальний слой (лоток) движется меньше — параллакс.
const depthCam = (cam: Cam, depth: number): Cam => ({
  x: BASE.x + (cam.x - BASE.x) * depth,
  y: BASE.y + (cam.y - BASE.y) * depth,
  zoom: 1 + (cam.zoom - 1) * depth,
});

// Кубическая кривая Безье.
type P = { readonly x: number; readonly y: number };
const bez = (a: P, b: P, c: P, d: P, t: number): P => {
  const q = 1 - t;
  return {
    x: q * q * q * a.x + 3 * q * q * t * b.x + 3 * q * t * t * c.x + t * t * t * d.x,
    y: q * q * q * a.y + 3 * q * q * t * b.y + 3 * q * t * t * c.y + t * t * t * d.y,
  };
};

// ---------- Дорожка шагов ----------

const STEPS = BG35_TEXT.trial.steps;
const ALL = [1, 1, 1, 1] as const;
const NONE = [0, 0, 0, 0] as const;
// Пояснения шагов (единственный носитель условий): крупно и тёмно-синим.
const NOTE_COLOR = `rgba(${rgb(C.navy).join(",")},0.8)`;

// Дорожка из 4 шагов (топ → сыноо → чечим → топтом). По умолчанию — как в
// последнем кадре сцены: линия нарисована, все шаги подсвечены, отметок
// «пройдено» нет. Сцена 6 рисует её так же и уводит (обёрткой) вместе с
// фишкой.
export const StepRail: React.FC<{
  readonly line?: number; // 0…1 — линия рисуется слева направо
  readonly marker?: readonly number[]; // масштаб кружков шагов
  readonly title?: readonly number[]; // появление заголовков
  readonly note?: readonly number[]; // появление пояснений
  readonly lit?: readonly number[]; // подсветка шагов 0…1
  readonly boost?: readonly number[]; // «подскок» шага при загорании
  readonly done?: readonly number[]; // отметка «пройдено» (галочка) 0…1
  readonly progress?: number; // 0…3 — жёлтая часть линии до шага
  readonly opacity?: number;
}> = ({
  line = 1,
  marker = ALL,
  title = ALL,
  note = ALL,
  lit = ALL,
  boost = NONE,
  done = NONE,
  progress = 3,
  opacity = 1,
}) => {
  const R = TRIAL_RAIL;
  const xs = R.stops;
  const seg = clamp(progress, 0, 3);
  const k = Math.min(2, Math.floor(seg));
  const px = lerp(xs[k], xs[k + 1], seg - k);
  return (
    <div style={box({ left: 0, top: 0, width: 1080, height: 1920, opacity })}>
      <svg
        width={1080}
        height={1920}
        style={box({ left: 0, top: 0, overflow: "visible" })}
      >
        {line > 0.01 ? (
          <line
            x1={R.x0}
            y1={R.y}
            x2={lerp(R.x0, R.x1, line)}
            y2={R.y}
            stroke={C.line}
            strokeWidth={12}
            strokeLinecap="round"
          />
        ) : null}
        {progress > 0.001 ? (
          <line
            x1={xs[0]}
            y1={R.y}
            x2={px}
            y2={R.y}
            stroke={C.yellow}
            strokeWidth={12}
            strokeLinecap="round"
          />
        ) : null}
        {xs.map((x, i) => {
          const s = marker[i] * (1 + 0.22 * boost[i]);
          if (s <= 0.001) return null;
          const l = lit[i];
          return (
            <g key={i} transform={`translate(${x} ${R.y}) scale(${s})`}>
              {boost[i] > 0 ? (
                <circle
                  r={R.markerR + 10}
                  fill={C.yellow}
                  opacity={0.35 * boost[i]}
                />
              ) : null}
              <circle
                r={R.markerR}
                fill={mix("#FFFFFF", C.yellow, l)}
                stroke={mix(C.socketEdge, C.navy, l)}
                strokeWidth={5}
              />
              <text
                y={10}
                textAnchor="middle"
                fontFamily={fontFamily}
                fontWeight={1000}
                fontSize={28}
                fill={mix(C.muted, C.navy, l)}
              >
                {i + 1}
              </text>
              {done[i] > 0.001 ? (
                // «пройдено»: маленький значок у кружка шага (вверху справа)
                <g
                  transform={`translate(${R.markerR - 2} ${-R.markerR + 2}) scale(${done[i]})`}
                  opacity={0.9 * clamp(done[i] * 2)}
                >
                  <circle r={15} fill={C.navy} stroke="#FFFFFF" strokeWidth={3} />
                  <path
                    d="M -6.5 0.5 L -2 5 L 6.5 -5"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth={3.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              ) : null}
            </g>
          );
        })}
      </svg>
      {xs.map((x, i) => {
        const t = title[i];
        if (t <= 0.001) return null;
        const l = lit[i];
        const n = note[i];
        return (
          <div
            key={i}
            style={box({
              left: x - R.labelW / 2,
              top: R.labelTop,
              width: R.labelW,
              textAlign: "center",
              fontFamily,
              opacity: clamp(t * 1.4),
              translate: `0 ${(1 - easeOut(t)) * 18}px`,
            })}
          >
            <div
              style={{
                fontSize: 33,
                fontWeight: 900,
                lineHeight: 1.12,
                letterSpacing: -0.6,
                whiteSpace: "nowrap",
                color: mix("#9AA6BE", C.navy, l),
                transform: `scale(${1 + 0.08 * boost[i]})`,
              }}
            >
              {STEPS[i].title}
            </div>
            {n > 0.001 ? (
              // пояснение: 30 px, до 3 строк в ширину labelW (фраза
              // «… • …» — каждая часть со своей строки, длинная переносится)
              <div
                style={{
                  marginTop: 5,
                  fontSize: 30,
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: -0.3,
                  color: NOTE_COLOR,
                  overflowWrap: "break-word",
                  opacity: clamp(n * 1.3),
                  translate: `0 ${(1 - easeOut(n)) * 10}px`,
                }}
              >
                {STEPS[i].note.split(" • ").map((p, j) => (
                  <div key={j}>
                    <Txt>{p}</Txt>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

// ---------- Лоток (как FullTray, но с волной света по жетонам) ----------
// При h ≡ 0 и нулевых подсветках совпадает с <FullTray /> пиксель в пиксель.
const LiveTray: React.FC<{
  readonly h: (i: number) => number;
  readonly glowPaid: number;
  readonly glowBonus: number;
  readonly odoPulse: number;
}> = ({ h, glowPaid, glowBonus, odoPulse }) => (
  <>
    <TrayBase fill={1} />
    {Array.from({ length: N }, (_, i) => {
      const p = ringPos(i);
      const w = h(i);
      return (
        <Token
          key={`p${i}`}
          kind="paid"
          x={p.x}
          y={p.y}
          r={TRAY.r * (1 + 0.13 * w)}
          lift={0.8 * w}
          glow={Math.min(1, glowPaid + 0.5 * w)}
        />
      );
    })}
    {[0, 1].map((j) => {
      const p = bonusPos(j);
      const w = h(N + j * 1.5);
      return (
        <Token
          key={`b${j}`}
          kind="bonus"
          x={p.x}
          y={p.y}
          r={TRAY.bonusR * (1 + 0.13 * w)}
          lift={0.8 * w}
          glow={Math.min(1, glowBonus + 0.5 * w)}
        />
      );
    })}
    <div
      style={box({
        left: 0,
        top: 0,
        width: 1080,
        height: 1920,
        transformOrigin: `${TRAY.cx}px ${TRAY.cy - 26}px`,
        transform: odoPulse ? `scale(${1 + odoPulse})` : undefined,
      })}
    >
      <Odometer v={22} x={TRAY.cx} y={TRAY.cy - 26} color={C.mintDeep} />
    </div>
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
  </>
);

// ---------- Дети (маленькие головы для шага «Топ издөө») ----------
const KIDS = [
  { dx: -58, dy: 6, skin: "#E8B48C", hair: "#2F2420", shirt: "#7FB3E6", style: "short", from: { x: -80, y: 990 } },
  { dx: -20, dy: -5, skin: "#D9A07A", hair: "#3B2B24", shirt: "#F2A07B", style: "tails", from: { x: 50, y: 860 } },
  { dx: 20, dy: -5, skin: "#F0C29E", hair: "#5A3B28", shirt: "#B89AE6", style: "bob", from: { x: 260, y: 880 } },
  { dx: 58, dy: 6, skin: "#C98F68", hair: "#22201E", shirt: "#E98AA8", style: "short", from: { x: 350, y: 1000 } },
] as const;
const KID_S = 1.5;
const KID_Y = 1036; // центр голов группы (над шагом 1)

const KidHead: React.FC<{
  readonly k: (typeof KIDS)[number];
  readonly x: number;
  readonly y: number;
  readonly s: number;
  readonly sq: number;
  readonly look: number;
}> = ({ k, x, y, s, sq, look }) => (
  <g transform={`translate(${x} ${y}) scale(${KID_S * s * (1 + 0.08 * sq)} ${KID_S * s * (1 - 0.1 * sq)})`}>
    <path d="M -22 30 Q -22 11 0 11 Q 22 11 22 30 Z" fill={k.shirt} />
    {k.style === "tails" ? (
      <g fill={k.hair}>
        <circle cx={-19} cy={-2} r={6.5} />
        <circle cx={19} cy={-2} r={6.5} />
      </g>
    ) : null}
    {k.style === "bob" ? (
      <path
        d="M -19 6 Q -21 -25 0 -25 Q 21 -25 19 6 L 13 6 Q 13 -10 0 -11 Q -13 -10 -13 6 Z"
        fill={k.hair}
      />
    ) : null}
    <circle cx={0} cy={-4} r={17} fill={k.skin} />
    <path
      d="M -17 -6 Q -16 -24 0 -24 Q 16 -24 17 -6 Q 9 -15 -3 -14 Q -12 -13 -17 -6 Z"
      fill={k.hair}
    />
    <g fill="#2A2E36">
      <circle cx={-6 + look} cy={-3} r={2.2} />
      <circle cx={6 + look} cy={-3} r={2.2} />
    </g>
    <path
      d="M -5 5 Q 0 9.5 5 5"
      fill="none"
      stroke="#8A4B3A"
      strokeWidth={2}
      strokeLinecap="round"
    />
    <circle cx={-10} cy={3} r={2.6} fill="#F29C8F" opacity={0.5} />
    <circle cx={10} cy={3} r={2.6} fill="#F29C8F" opacity={0.5} />
  </g>
);

// ---------- Кинетическая плашка (как в сцене 3) ----------

const Word: React.FC<{
  readonly w: string;
  readonly f: number;
  readonly at: number;
  readonly out: number;
  readonly size: number;
  readonly mark?: number; // 0…1 — жёлтое подчёркивание рисуется слева направо
  readonly pulse?: number; // 0…1 — короткое «вздрагивание» слова
}> = ({ w, f, at, out, size, mark = 0, pulse = 0 }) => {
  const e = clamp((f - at) / 9);
  const s = pop(f, at, 11);
  const x = easeIn(clamp((f - out) / 7));
  return (
    <span
      style={{
        display: "inline-block",
        margin: `0 ${size * 0.12}px`,
        padding: `0 ${size * 0.06}px`,
        opacity: easeOut(e * 1.5) * (1 - x),
        transform: `translateY(${-34 * (1 - easeOut(e)) - 28 * x - 6 * pulse}px) scale(${(0.55 + 0.45 * s) * (1 + 0.1 * pulse)})`,
        backgroundImage:
          mark > 0 ? `linear-gradient(${C.yellow}, ${C.yellow})` : undefined,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "0 88%",
        backgroundSize: `${100 * clamp(mark)}% 34%`,
      }}
    >
      <Txt>{w}</Txt>
    </span>
  );
};

const Plate: React.FC<{
  readonly f: number;
  readonly at: number;
  readonly out: number;
  readonly text: string;
  readonly size?: number;
  // выделение одного слова (индекс) в момент accent.at
  readonly accent?: { readonly word: number; readonly at: number };
}> = ({ f, at, out, text, size = 54, accent }) => {
  const p = pop(f, at - 2, 12);
  const gone = easeIn(clamp((f - out - 4) / 8));
  if (p <= 0 || gone >= 1) return null;
  const words = text.split(" ");
  return (
    <div
      style={box({
        left: 60,
        right: 150,
        top: 262,
        display: "flex",
        justifyContent: "center",
        fontFamily,
      })}
    >
      <div
        style={{
          padding: "10px 28px 14px",
          borderRadius: 30,
          backgroundColor: "rgba(255,255,255,0.96)",
          boxShadow: "0 12px 30px rgba(20,40,90,0.14)",
          border: `3px solid ${C.line}`,
          transform: `translateY(${-24 * gone}px) scale(${0.85 + 0.15 * p}, ${p})`,
          opacity: clamp(p * 2) * (1 - gone),
          fontWeight: 900,
          color: C.navy,
          letterSpacing: -0.5,
          display: "flex",
          justifyContent: "center",
          whiteSpace: "nowrap",
          fontSize: size,
          lineHeight: 1.22,
        }}
      >
        {words.map((w, k) => {
          const hit = accent && accent.word === k ? accent.at : null;
          return (
            <Word
              key={k}
              w={w}
              f={f}
              at={at + k * 3}
              out={out + k * 1.5}
              size={size}
              mark={hit === null ? 0 : easeInOut((f - hit) / 10)}
              pulse={hit === null ? 0 : bump(f - hit, 14)}
            />
          );
        })}
      </div>
    </div>
  );
};

// «22 сапардын ичинде эмес»: «22» — на мятной «жетонной» плашке.
const OUT_WORDS = BG35_TEXT.trial.outside.split(" ");
const OUT_L1 = OUT_WORDS.slice(0, 2);
const OUT_L2 = OUT_WORDS.slice(2).join(" ");

// индекс слова «өзүнчө» на плашке «Сыноо сапары өзүнчө» (последнее слово)
const APART_WORD = BG35_TEXT.trial.apart.split(" ").length - 1;

// ---------- Сцена ----------

export const TrialScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  const end = frames - 1;
  const K = TRIAL_KEYS;
  const R = TRIAL_RAIL;
  const CH = TRIAL_CHIP;
  const DV = TRIAL_DIVIDER;

  const n05 = useLine("n05");
  const n06 = useLine("n06");
  const n07 = useLine("n07");
  const trialAt = useWordAt("n05", BG35_WORDS.n05.trial);
  const twoAt = useWordAt("n05", BG35_WORDS.n05.two);
  const bonusAt = useWordAt("n05", BG35_WORDS.n05.bonus);
  const apartAt = useWordAt("n05", BG35_WORDS.n05.apart);
  const groupAt = useWordAt("n06", BG35_WORDS.n06.group);
  const formedAt = useWordAt("n06", BG35_WORDS.n06.formed);
  const trial2At = useWordAt("n06", BG35_WORDS.n06.trial);
  const passesAt = useWordAt("n06", BG35_WORDS.n06.passes);
  const afterAt = useWordAt("n06", BG35_WORDS.n06.after);
  const chooseAt = useWordAt("n06", BG35_WORDS.n06.choose);
  const priceAt = useWordAt("n07", BG35_WORDS.n07.price);
  const distAt = useWordAt("n07", BG35_WORDS.n07.distance);

  // ---------- план (кадры сцены; порядок сохраняется при ±20 % речи) ----
  const pullTo = clamp(n05.from, K.pullMin, K.pullMax);
  const fadeFrom = end - K.endFade;
  const holdFrom = end - K.endHold;
  const fadeA = 1 - easeInOut((f - fadeFrom) / (holdFrom - fadeFrom));

  const divAt = Math.max(pullTo - 2, trialAt - 22);
  const popAt = Math.max(trialAt, divAt + 8);
  const impact = Math.max(bonusAt, popAt + 34);
  const approachAt = impact - K.approach;
  const apartCap = Math.max(apartAt, impact + 14);

  const railAt = Math.max(n06.from - 14, apartCap + 10);
  const lit0 = Math.max(groupAt, railAt + 22);
  const kidsAt = lit0 - 6;
  const groupPill = Math.max(formedAt + 2, kidsAt + 16);
  // фишка взлетает чуть раньше «сыноо», чтобы шаг 2 загорелся на этом слове
  const travelAt = Math.max(trial2At - 10, groupPill + 4);
  const flyAt = travelAt + K.lift;
  const touch = flyAt + K.flight;
  const rideEnd = touch + K.ride;
  const lit1 = touch + 4;
  const loopAt = Math.max(passesAt, rideEnd - 4);
  const hopAt = Math.max(afterAt, loopAt + K.loop + 4);
  const hopLand = hopAt + K.hop;
  const lit2 = hopLand;
  const lit3 = Math.max(chooseAt, hopLand + 10);
  const arrowAt = lit3 + 4;
  const arrowHit = arrowAt + K.arrow;
  const capOut = priceAt - 10;
  const cardAt = priceAt + 4;
  const lineAt = Math.max(distAt, cardAt + 6);
  const lineDone = lineAt + 14;
  // время на чтение дорожки после n07: мягкая волна по шагам 1 → 4
  const readAt = Math.max(n07.to + 6, lineDone + 12);
  const readOn = readAt + 3 * 10 + 16 <= fadeFrom;
  // отметка «пройдено» у шага 2 — когда фишка уходит к «Чечим»
  const doneAt = hopAt + 8;

  // ---------- камера (передний план) и параллакс лотка ----------
  // n05: средний план «фишка | лоток» по центру кадра (низ кадра ещё пуст);
  // на ударе — лёгкий толчок; на n06 камера отъезжает и открывает дорожку
  // шагов; на n07 — медленный наезд и возврат в BASE (как в сцене 6).
  const N05: readonly [number, number, number] = [532, 772, 1.08];
  const c1 = pullTo + 14;
  const cI0 = Math.max(c1 + 1, impact - 10);
  const cI1 = cI0 + 12;
  const cI2 = cI1 + 26;
  const c2 = Math.max(cI2 + 1, railAt - 10);
  const c3 = c2 + 30;
  const c4 = Math.max(c3 + 1, n07.from - 4);
  const c5 = Math.min(Math.max(c4 + 1, n07.from + 26), holdFrom - 2);
  const cam = camAt(f, [
    [2, 540, 960, 1],
    [c1, ...N05],
    [cI0, 531, 771, 1.084],
    [cI1, 527, 770, 1.095],
    [cI2, ...N05],
    [c2, 533, 776, 1.083],
    [c3, 540, 960, 1],
    [c4, 540, 972, 1.012],
    [c5, 540, 960, 1],
  ]);
  const camT = depthCam(cam, 0.92);

  // ---------- лоток: TRAY_HOME → TRAY_MID (n05) → TRAY_SIDE (n06) ----------
  // на n05 кольцо остаётся крупным (фишка бьётся о разделитель рядом с
  // ним); вместе с отъездом камеры к дорожке — точно в TRAY_SIDE
  const pull = anticipate(f / Math.max(1, pullTo));
  const side = easeInOut((f - c2) / (c3 - c2));
  const view =
    side >= 1
      ? TRAY_SIDE
      : side > 0
        ? mixView(TRAY_MID, TRAY_SIDE, side)
        : mixView(TRAY_HOME, TRAY_MID, pull);

  // подсветка пары «+2» на «эки бонус»
  const glowBonus =
    0.9 *
    easeOut((f - (twoAt - 3)) / 8) *
    (1 - easeInOut((f - (impact + 16)) / 18));
  // «пакет выбран»: волна света по кольцу и ореол
  const sheenAt = arrowHit - 2;
  const sheens: number[] = [];
  for (let s = sheenAt; s + 36 <= fadeFrom; s += 70) sheens.push(s);
  const sheen = (k: number) =>
    Math.max(
      0,
      ...sheens.map((s, m) => (m === 0 ? 1 : 0.5) * bump(f - (s + k * 0.9), 12)),
    );
  const accept = easeOut((f - arrowHit) / 8) * (1 - easeInOut((f - (arrowHit + 30)) / 40));
  const trayPulse = 0.035 * bump(f - arrowHit, 14);
  const odoPulse = 0.08 * bump(f - (arrowHit + 4), 12);
  const haloY = (0.32 * accept + 0.1 * clamp((f - arrowHit) / 10)) * fadeA;
  const haloM = 0.42 * glowBonus;

  // ---------- разделитель ----------
  const divDraw = easeInOut((f - divAt) / K.divider);
  const divGone = easeInOut((f - (travelAt + 4)) / 14);
  const kImp = f - impact;
  const bend =
    kImp < 0
      ? 0
      : kImp < 3
        ? 11 * easeOut(kImp / 3)
        : 11 * Math.cos((kImp - 3) * 0.8) * Math.exp(-(kImp - 3) / 5);

  // ---------- фишка «СЫНОО» ----------
  const contact = DV.x - CH.homeSize / 2 - 7;
  const chipP = pop(f, popAt, K.chipPop);
  let cx: number = CH.homeX;
  let cy: number = CH.homeY;
  let size: number = CH.homeSize * chipP;
  let rot = -24 * (1 - easeOut((f - popAt) / 16));
  let sx = 1;
  let sy = 1;
  let lift = 0;
  let chipGlow = 0.9 * bump(f - apartCap, 22);

  const idleA = easeOut((f - popAt - 12) / 16);
  if (f < travelAt) {
    // дома: покачивание, замах, удар о разделитель, «нет-нет», возврат
    cy += 5 * Math.sin((f - popAt) / 13) * idleA;
    rot += 2 * Math.sin((f - popAt) / 17) * idleA;
    const k = f - approachAt;
    if (k >= 0 && f < impact) {
      if (k < 6) {
        cx = CH.homeX - 18 * easeInOut(k / 6);
        sx = 1 - 0.06 * easeInOut(k / 6);
        sy = 1 + 0.05 * easeInOut(k / 6);
      } else {
        const t = (k - 6) / (K.approach - 6);
        cx = lerp(CH.homeX - 18, contact, easeIn(t));
        sx = 1 + 0.1 * easeIn(t);
        sy = 1 - 0.06 * easeIn(t);
        rot += 6 * easeIn(t);
      }
    } else if (kImp >= 0) {
      // упор (пунктир прогибается) → отскок с перелётом влево → на место
      const push = kImp < 3 ? 8 * easeOut(kImp / 3) : 8 * (1 - easeOut((kImp - 3) / 4));
      const back = kImp < 3 ? 0 : easeOut((kImp - 3) / 14);
      const home = 12 * easeInOut((kImp - 17) / 12);
      cx = lerp(contact, CH.homeX - 12, back) + push + home;
      const sq = bump(kImp, 9);
      sx = 1 - 0.16 * sq;
      sy = 1 + 0.1 * sq;
      if (kImp > 12) rot += 8 * Math.sin((kImp - 12) * 0.85) * Math.exp(-(kImp - 12) / 7);
    }
  } else {
    // полёт на дорожку, подъезд к шагу 2, прыжок к шагу 3, покачивание
    const k = f - travelAt;
    const lifted = { x: CH.homeX, y: CH.homeY - 18 };
    if (k < K.lift) {
      const e = easeOut(k / K.lift);
      cx = CH.homeX;
      cy = CH.homeY - 18 * e;
      lift = e;
      size = CH.homeSize * (1 + 0.05 * e);
      sx = 1 - 0.04 * e;
      sy = 1 + 0.05 * e;
    } else if (f < touch) {
      const t = (f - flyAt) / K.flight;
      const u = t * t * (1.6 - 0.6 * t);
      const p = bez(
        lifted,
        { x: 340, y: 640 },
        { x: 296, y: CH.railY - 40 },
        { x: 334, y: CH.railY },
        u,
      );
      cx = p.x;
      cy = p.y;
      lift = 1 - 0.4 * t;
      size = lerp(CH.homeSize * 1.05, CH.railSize, easeInOut(t));
      rot = -14 * Math.sin(Math.PI * t);
      sx = 1 - 0.05 * Math.sin(Math.PI * t);
      sy = 1 + 0.07 * Math.sin(Math.PI * t);
    } else if (f < hopAt) {
      const kr = f - touch;
      const x0 = 334;
      const x1 = R.stops[1];
      const e = kr < K.ride ? easeOut(kr / K.ride) : 1;
      cx = lerp(x0, x1 + 6, e) - 6 * easeInOut((kr - K.ride) / 6);
      cy = CH.railY;
      size = CH.railSize;
      const sq = settle(kr, 12);
      sx = 1 + 0.1 * sq;
      sy = 1 - 0.12 * sq;
      rot = 5 * (1 - e) * Math.sin(kr * 0.9);
      cy += 2 * Math.sin((f - touch) / 9) * easeOut((kr - 10) / 10);
    } else {
      const kh = f - hopAt;
      const t = clamp((kh - 3) / (K.hop - 3));
      size = CH.railSize;
      if (kh < 3) {
        const c = easeInOut(kh / 3);
        cx = R.stops[1];
        cy = CH.railY + 6 * c;
        sx = 1 + 0.08 * c;
        sy = 1 - 0.12 * c;
      } else if (kh < K.hop) {
        cx = lerp(R.stops[1], R.stops[2], easeInOut(t));
        cy = CH.railY - 64 * Math.sin(Math.PI * t) + 6 * (1 - easeOut(t / 0.25));
        rot = 10 * Math.sin(Math.PI * t);
        lift = Math.sin(Math.PI * t);
        sx = 1 - 0.06 * Math.sin(Math.PI * t);
        sy = 1 + 0.08 * Math.sin(Math.PI * t);
      } else {
        const kl = f - hopLand;
        cx = R.stops[2];
        const sq = settle(kl, 12);
        sx = 1 + 0.1 * sq;
        sy = 1 - 0.12 * sq;
        cy = CH.railY + 3 * Math.max(0, sq);
        // «решение»: лёгкий наклон туда-сюда и дыхание, затихают к концу
        const idle = easeOut((kl - 10) / 14) * (1 - easeInOut((f - fadeFrom) / (holdFrom - fadeFrom)));
        rot = 3 * Math.sin((f - hopLand) / 14) * idle;
        cy += 2.5 * Math.sin((f - hopLand) / 10) * idle;
        chipGlow = Math.max(
          chipGlow,
          (0.55 + 0.35 * Math.sin((f - hopLand) / 6)) *
            easeOut(kl / 6) *
            (1 - easeInOut((kl - 34) / 18)),
        );
      }
    }
  }

  const chipX = Math.round(cx);
  const chipY = Math.round(cy);

  // ---------- дети: сбегаются к шагу 1 ----------
  const kidState = KIDS.map((kd, i) => {
    const at = kidsAt + i * 3;
    const t = clamp((f - at) / 12);
    const e = easeOut(t);
    const tx = R.stops[0] + kd.dx;
    const ty = KID_Y + kd.dy;
    const x = lerp(kd.from.x, tx, e);
    const y = lerp(kd.from.y, ty, e) - 34 * Math.sin(Math.PI * t);
    const land = f - (at + 12);
    const bob = 2 * Math.sin((f + i * 7) / 7) * easeOut((land - 6) / 10);
    return {
      x,
      y: y + bob,
      s: f < at ? 0 : 0.6 + 0.4 * easeOut(clamp((f - at) / 6)),
      sq: settle(land, 12),
      a: clamp((f - at) / 4),
    };
  });
  const kidsA = fadeA;
  const kidLook = 2.2 * easeInOut((f - (touch - 6)) / 10);
  const pillP = pop(f, groupPill, 14);

  // ---------- дорожка шагов ----------
  const railLine = easeInOut((f - railAt) / 20);
  const litAt = [lit0, lit1, lit2, lit3];
  const markerP = R.stops.map((_, i) => pop(f, railAt + 4 + i * 5, 12));
  const titleP = R.stops.map((_, i) => easeOut((f - (railAt + 8 + i * 5)) / 12));
  const litP = litAt.map((a) => easeOut((f - a) / 6));
  const noteP = litAt.map((a) => easeOut((f - (a + 3)) / 10));
  const boost = litAt.map(
    (a, i) =>
      bump(f - a, 14) + (readOn ? 0.45 * bump(f - (readAt + i * 10), 16) : 0),
  );
  const doneP = [0, pop(f, doneAt, 12) * fadeA, 0, 0];
  const progress =
    easeInOut((f - flyAt) / (lit1 - flyAt)) +
    easeInOut((f - hopAt) / (lit2 - hopAt)) +
    easeInOut((f - (lit3 - 8)) / 8);

  // ---------- стрелка «шаг 4 → лоток» (в координатах кадра) ----------
  const camF = cam;
  const aStart = proj({ x: R.stops[3], y: R.y - R.markerR - 14 }, camF);
  const ang = (52 * Math.PI) / 180;
  const edge = trayToScreen(
    {
      x: TRAY.cx + (TRAY.R + 86) * Math.cos(ang),
      y: TRAY.cy + (TRAY.R + 86) * Math.sin(ang),
    },
    TRAY_SIDE,
  );
  const aEnd = proj(edge, camT);
  const aCtrl = {
    x: Math.min(902, Math.max(aStart.x, aEnd.x) + 78),
    y: (aStart.y + aEnd.y) / 2 + 20,
  };
  const arrowD = `M ${aStart.x} ${aStart.y} Q ${aCtrl.x} ${aCtrl.y} ${aEnd.x} ${aEnd.y}`;
  let arrowLen = 0;
  {
    let prev = aStart;
    for (let s = 1; s <= 24; s++) {
      const t = s / 24;
      const q = 1 - t;
      const p = {
        x: q * q * aStart.x + 2 * q * t * aCtrl.x + t * t * aEnd.x,
        y: q * q * aStart.y + 2 * q * t * aCtrl.y + t * t * aEnd.y,
      };
      arrowLen += Math.hypot(p.x - prev.x, p.y - prev.y);
      prev = p;
    }
  }
  const arrowDraw = easeInOut((f - arrowAt) / K.arrow);
  const headP = pop(f, arrowHit - 2, 10);
  const headAng = (Math.atan2(aEnd.y - aCtrl.y, aEnd.x - aCtrl.x) * 180) / Math.PI;
  const arrowA = clamp((f - arrowAt) / 3) * fadeA;

  // ---------- петля «1 полный сапар» вокруг фишки у шага 2 ----------
  const loopT = clamp((f - loopAt) / K.loop);
  const loopOut = easeIn(clamp((f - (loopAt + K.loop)) / 6));
  const loopA = f >= loopAt ? 1 - loopOut : 0;

  // ---------- карточка «үй — км — мектеп» ----------
  const cardP = pop(f, cardAt, 14);
  const cardA = clamp(cardP * 2) * fadeA;
  const lineP = easeInOut((f - lineAt) / 14);
  const kmP = pop(f, lineAt + 8, 12);
  const stretch =
    26 *
    (0.5 - 0.5 * Math.cos((TAU * (f - lineDone)) / 52)) *
    easeOut((f - lineDone) / 6) *
    (1 - easeInOut((f - (fadeFrom - 14)) / 14));
  const homeX = 116;
  const schoolX = 372 + stretch;
  const cardY = 640;

  // ---------- кадр ----------
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: C.paper,
        overflow: "hidden",
        fontFamily,
      }}
    >
      {/* ---------- дальний слой: лоток ---------- */}
      <div style={camStyle(camT)}>
        <TrayFrame v={view}>
          {haloY + haloM > 0.005 ? (
            <div
              style={box({
                left: -400,
                top: -400,
                width: 1880,
                height: 2720,
                background: `radial-gradient(circle at ${TRAY.cx + 400}px ${TRAY.cy + 400}px, rgba(255,201,14,${haloY}) 0px, rgba(255,201,14,0) 600px), radial-gradient(ellipse 300px 170px at ${TRAY.cx + 400}px ${TRAY.bonusY + 400}px, rgba(159,221,184,${haloM}) 0px, rgba(159,221,184,0) 100%)`,
              })}
            />
          ) : null}
          <div
            style={box({
              left: 0,
              top: 0,
              width: 1080,
              height: 1920,
              transformOrigin: `${TRAY.cx}px ${TRAY.cy}px`,
              transform: trayPulse ? `scale(${1 + trayPulse})` : undefined,
            })}
          >
            <LiveTray
              h={sheen}
              glowPaid={0.45 * accept * fadeA}
              glowBonus={glowBonus + 0.45 * accept * fadeA}
              odoPulse={odoPulse}
            />
          </div>
        </TrayFrame>
      </div>

      {/* ---------- передний план ---------- */}
      <div style={camStyle(camF)}>
        {/* разделитель «вне 22» */}
        {divDraw > 0.02 && divGone < 0.98 ? (
          <svg
            width={1080}
            height={1920}
            style={box({ left: 0, top: 0, overflow: "visible" })}
          >
            {(() => {
              const len = DV.y1 - DV.y0;
              const a = DV.y0 + len * divGone;
              const b = DV.y0 + len * divDraw;
              const mid = CH.homeY;
              const d =
                Math.abs(bend) > 0.05
                  ? `M ${DV.x} ${DV.y0} Q ${DV.x + 2 * bend} ${mid} ${DV.x} ${DV.y1}`
                  : `M ${DV.x} ${a} L ${DV.x} ${b}`;
              return (
                <>
                  <path
                    d={d}
                    fill="none"
                    stroke={C.navy}
                    strokeOpacity={0.55}
                    strokeWidth={6}
                    strokeDasharray="16 14"
                    strokeLinecap="round"
                  />
                  {/* удар фишки: искры и волна у точки касания */}
                  {kImp >= 0 && kImp < 14
                    ? [-1, 0, 1].map((s) => {
                        const e = easeOut(kImp / 12);
                        const ang2 = Math.PI + s * 0.75;
                        const r0 = 20 + 26 * e;
                        const r1 = r0 + 22 * (1 - e);
                        return (
                          <line
                            key={s}
                            x1={DV.x - 8 + r0 * Math.cos(ang2)}
                            y1={mid + r0 * Math.sin(ang2) * 1.6}
                            x2={DV.x - 8 + r1 * Math.cos(ang2)}
                            y2={mid + r1 * Math.sin(ang2) * 1.6}
                            stroke={C.yellowDeep}
                            strokeWidth={7 * (1 - e)}
                            strokeLinecap="round"
                          />
                        );
                      })
                    : null}
                  {kImp >= 0 && kImp < 16 ? (
                    <circle
                      cx={DV.x}
                      cy={mid}
                      r={20 + 56 * easeOut(kImp / 16)}
                      fill="none"
                      stroke={C.navy}
                      strokeWidth={5 * (1 - easeOut(kImp / 16))}
                      opacity={0.35 * (1 - easeOut(kImp / 16))}
                    />
                  ) : null}
                </>
              );
            })()}
          </svg>
        ) : null}

        {/* «22 сапардын ичинде эмес» */}
        {(() => {
          const a =
            easeOut((f - (popAt + 10)) / 10) *
            (1 - easeInOut((f - (travelAt - 2)) / 10));
          if (a <= 0) return null;
          const s = 1 + 0.07 * bump(f - apartCap, 16) + 0.05 * bump(f - impact - 4, 14);
          return (
            <div
              style={box({
                left: CH.homeX - 150,
                top: CH.homeY + 76,
                width: 300,
                textAlign: "center",
                fontFamily,
                fontWeight: 900,
                fontSize: 34,
                lineHeight: 1.2,
                color: C.navy,
                opacity: a,
                translate: `0 ${(1 - easeOut((f - (popAt + 10)) / 10)) * 16}px`,
                transform: `scale(${s})`,
              })}
            >
              <div>
                {OUT_L1.map((w, k) =>
                  /^\d+$/.test(w) ? (
                    <span
                      key={k}
                      style={{
                        padding: "0 8px",
                        marginRight: 8,
                        borderRadius: 10,
                        backgroundColor: C.mint,
                        boxShadow: `0 3px 0 ${C.mintDeep}`,
                      }}
                    >
                      {w}
                    </span>
                  ) : (
                    <span key={k}>{w}</span>
                  ),
                )}
              </div>
              <div>{OUT_L2}</div>
            </div>
          );
        })()}

        {/* дорожка шагов */}
        {railLine > 0 ? (
          <StepRail
            line={railLine}
            marker={markerP}
            title={titleP}
            note={noteP}
            lit={litP}
            boost={boost}
            done={doneP}
            progress={progress}
          />
        ) : null}

        {/* волны на шагах при загорании */}
        <svg
          width={1080}
          height={1920}
          style={box({ left: 0, top: 0, overflow: "visible" })}
        >
          {litAt.map((a, i) => {
            const k = f - a;
            if (k < 0 || k >= 16) return null;
            const e = easeOut(k / 16);
            return (
              <circle
                key={i}
                cx={R.stops[i]}
                cy={R.y}
                r={R.markerR + 6 + 34 * e}
                fill="none"
                stroke={C.yellowDeep}
                strokeWidth={7 * (1 - e)}
                opacity={0.8 * (1 - e)}
              />
            );
          })}
          {/* «решение»: мягкие волны от фишки у шага 3 */}
          {[2, 18, 34].map((d) => {
            const k = f - (hopLand + d);
            if (k < 0 || k >= 24) return null;
            const e = easeOut(k / 24);
            return (
              <rect
                key={d}
                x={R.stops[2] - 54 - 44 * e}
                y={CH.railY - 54 - 44 * e}
                width={108 + 88 * e}
                height={108 + 88 * e}
                rx={30 + 22 * e}
                fill="none"
                stroke={C.navy}
                strokeWidth={6 * (1 - e)}
                opacity={0.42 * (1 - e)}
              />
            );
          })}
        </svg>

        {/* группа детей у шага 1 */}
        {f >= kidsAt && kidsA > 0 ? (
          <svg
            width={1080}
            height={1920}
            style={box({ left: 0, top: 0, overflow: "visible", opacity: kidsA })}
          >
            {pillP > 0 ? (
              <rect
                x={R.stops[0] - 100}
                y={KID_Y - 60}
                width={200}
                height={114}
                rx={57}
                fill={C.yellowSoft}
                stroke={C.yellowDeep}
                strokeWidth={4}
                strokeDasharray="12 9"
                transform={`translate(${R.stops[0]} ${KID_Y}) scale(${pillP}) translate(${-R.stops[0]} ${-KID_Y})`}
                opacity={clamp(pillP * 1.5)}
              />
            ) : null}
            {[1, 2, 0, 3].map((i) => {
              const s = kidState[i];
              if (s.s <= 0) return null;
              return (
                <g key={i} opacity={s.a}>
                  <KidHead k={KIDS[i]} x={s.x} y={s.y} s={s.s} sq={s.sq} look={kidLook} />
                </g>
              );
            })}
          </svg>
        ) : null}

        {/* петля «1 толук сапар» вокруг фишки */}
        {loopA > 0 ? (
          <svg
            width={1080}
            height={1920}
            style={box({ left: 0, top: 0, overflow: "visible", opacity: loopA })}
          >
            {(() => {
              const r = 68 + 10 * loopOut;
              const c = { x: R.stops[1], y: CH.railY };
              const a0 = -Math.PI / 2;
              const a1 = a0 + TAU * 0.94 * easeInOut(loopT);
              const large = a1 - a0 > Math.PI ? 1 : 0;
              const p0 = { x: c.x + r * Math.cos(a0), y: c.y + r * Math.sin(a0) };
              const p1 = { x: c.x + r * Math.cos(a1), y: c.y + r * Math.sin(a1) };
              const hd = (a1 * 180) / Math.PI + 90;
              return (
                <>
                  {loopT > 0.01 ? (
                    <path
                      d={`M ${p0.x} ${p0.y} A ${r} ${r} 0 ${large} 1 ${p1.x} ${p1.y}`}
                      fill="none"
                      stroke={C.yellowDeep}
                      strokeWidth={8}
                      strokeLinecap="round"
                    />
                  ) : null}
                  <path
                    d="M -9 -10 L 4 0 L -9 10"
                    transform={`translate(${p1.x} ${p1.y}) rotate(${hd})`}
                    fill="none"
                    stroke={C.yellowDeep}
                    strokeWidth={8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx={p0.x} cy={p0.y} r={7} fill={C.yellowDeep} />
                </>
              );
            })()}
          </svg>
        ) : null}

        {/* фишка «СЫНОО»: целые пиксели — в left/top, дробная часть
            (медленное покачивание) — в transform, без «ступенек» */}
        {f >= popAt ? (
          <div
            style={box({
              left: 0,
              top: 0,
              width: 1080,
              height: 1920,
              transformOrigin: `${chipX}px ${chipY + size / 2}px`,
              transform: `translate(${cx - chipX}px, ${cy - chipY}px) scale(${sx}, ${sy})`,
            })}
          >
            <TrialChip
              x={chipX}
              y={chipY}
              size={Math.max(1, size)}
              rot={rot}
              lift={lift}
              glow={Math.min(1, chipGlow)}
              opacity={clamp(chipP * 3)}
            />
          </div>
        ) : null}
        {f >= popAt - 6 && f < popAt + 10 ? (
          <svg
            width={1080}
            height={1920}
            style={box({ left: 0, top: 0, overflow: "visible" })}
          >
            {(() => {
              const k = f - (popAt - 6);
              const e = easeOut(k / 16);
              return (
                <circle
                  cx={CH.homeX}
                  cy={CH.homeY}
                  r={20 + 70 * e}
                  fill="none"
                  stroke={C.navy}
                  strokeWidth={6 * (1 - e)}
                  opacity={0.35 * (1 - e)}
                />
              );
            })()}
          </svg>
        ) : null}

        {/* карточка «үй — км — мектеп» (n07) */}
        {cardA > 0 ? (
          <div
            style={box({
              left: 0,
              top: 0,
              width: 1080,
              height: 1920,
              opacity: cardA,
              transformOrigin: `${(homeX + schoolX) / 2}px ${cardY}px`,
              transform: `translateY(${(1 - easeOut((f - cardAt) / 14)) * 30}px) scale(${0.8 + 0.2 * cardP})`,
            })}
          >
            <div
              style={box({
                left: homeX - 66,
                top: cardY - 80,
                width: schoolX - homeX + 132,
                height: 160,
                borderRadius: 34,
                backgroundColor: "#FFFFFF",
                border: `3px solid ${C.line}`,
                boxSizing: "border-box",
                boxShadow: "0 14px 32px rgba(20,40,90,0.14)",
              })}
            />
            <div style={box({ left: homeX - 44, top: cardY - 36 })}>
              <HomeIcon size={88} />
            </div>
            <div
              style={box({
                left: schoolX - 44,
                top: cardY - 36,
                transform: `rotate(${-4 * Math.sin((f - lineDone) / 8) * clamp(stretch / 26)}deg)`,
              })}
            >
              <SchoolIcon size={88} />
            </div>
            <svg
              width={1080}
              height={1920}
              style={box({ left: 0, top: 0, overflow: "visible" })}
            >
              {lineP > 0 ? (
                <>
                  <line
                    x1={homeX + 48}
                    y1={cardY + 34}
                    x2={lerp(homeX + 48, schoolX - 48, lineP)}
                    y2={cardY + 34}
                    stroke={C.navy}
                    strokeWidth={6}
                    strokeDasharray="12 10"
                    strokeLinecap="round"
                  />
                  {[homeX + 48, schoolX - 48].map((x, i) =>
                    i === 0 || lineP > 0.98 ? (
                      <line
                        key={i}
                        x1={x}
                        y1={cardY + 20}
                        x2={x}
                        y2={cardY + 48}
                        stroke={C.navy}
                        strokeWidth={6}
                        strokeLinecap="round"
                      />
                    ) : null,
                  )}
                </>
              ) : null}
            </svg>
            {kmP > 0 ? (
              <div
                style={box({
                  left: (homeX + schoolX) / 2 - 44,
                  top: cardY - 42,
                  width: 88,
                  height: 54,
                  borderRadius: 27,
                  backgroundColor: C.yellow,
                  boxShadow: `0 4px 0 ${C.yellowDeep}`,
                  color: C.navy,
                  fontFamily,
                  fontWeight: 1000,
                  fontSize: 36,
                  lineHeight: "52px",
                  textAlign: "center",
                  transform: `scale(${kmP}) rotate(${-8 * (1 - Math.min(1, kmP))}deg)`,
                })}
              >
                {BG35_TEXT.trial.km}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* ---------- стрелка «топтом — после сыноо» → лоток (кадр) ---------- */}
      {arrowDraw > 0 && arrowA > 0 ? (
        <svg
          width={1080}
          height={1920}
          style={box({ left: 0, top: 0, overflow: "visible", opacity: arrowA })}
        >
          <defs>
            <mask id="trial-arrow-mask" maskUnits="userSpaceOnUse" x={0} y={0} width={1080} height={1920}>
              <path
                d={arrowD}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={20}
                strokeDasharray={`${arrowLen * arrowDraw} ${arrowLen + 10}`}
              />
            </mask>
          </defs>
          <path
            d={arrowD}
            fill="none"
            stroke={C.yellow}
            strokeWidth={16}
            strokeOpacity={0.35}
            strokeLinecap="round"
            mask="url(#trial-arrow-mask)"
          />
          <path
            d={arrowD}
            fill="none"
            stroke={C.yellowDeep}
            strokeWidth={7}
            strokeDasharray="14 11"
            strokeLinecap="round"
            mask="url(#trial-arrow-mask)"
          />
          {headP > 0 ? (
            <path
              d="M -16 -15 L 2 0 L -16 15"
              transform={`translate(${aEnd.x} ${aEnd.y}) rotate(${headAng}) scale(${headP})`}
              fill="none"
              stroke={C.yellowDeep}
              strokeWidth={8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
        </svg>
      ) : null}

      {/* ---------- плашки (кадр) ---------- */}
      {/* «Сыноо сапары өзүнчө» — уже со слова «сыноо»; на «өзүнчө» слово
          подчёркивается */}
      <Plate
        f={f}
        at={trialAt}
        out={capOut}
        text={BG35_TEXT.trial.apart}
        accent={{ word: APART_WORD, at: apartCap }}
      />
      <Plate f={f} at={priceAt} out={fadeFrom} text={BG35_TEXT.trial.price} />
    </div>
  );
};
