// Календарь (сцена 12): карточка дня как в приложении календаря — крупно
// «Эртең», сетка часов без подписей и одно событие «сыноо күнү» с мягким
// жёлтым акцентом слева. Акцент «садится» на место, когда add идёт 0 → 1.
// Одна спокойная подсветка, больше акцентов нет.
//
// Макет 900 × 560 px, масштабируется до w. CalendarEvent и CalendarGlyph
// используются также экраном телефона (props/Phone.tsx → PhoneCalendar).
import { clamp, easeInOut, easeOut } from "../rig/motion";
import { EL_TEXT } from "../script";
import { C, F, RADIUS, SHADOW } from "../theme";

export const CAL_W = 900;
export const CAL_H = 560;
export const calendarHeight = (w: number) => (CAL_H * w) / CAL_W;

// Нейтральный значок календаря (контур, без цвета акцента).
export const CalendarGlyph: React.FC<{
  readonly size: number;
  readonly color?: string;
}> = ({ size, color = C.inkSoft }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" style={{ display: "block", flex: "none" }}>
    <rect x={5} y={9} width={38} height={34} rx={8} fill="none" stroke={color} strokeWidth={3.4} />
    <path d="M 5 19 L 43 19" stroke={color} strokeWidth={3.4} />
    <path d="M 15 5 L 15 13 M 33 5 L 33 13" stroke={color} strokeWidth={3.4} strokeLinecap="round" />
    {[0, 1, 2].map((i) => (
      <circle key={i} cx={15 + i * 9} cy={29} r={2.4} fill={color} />
    ))}
    {[0, 1].map((i) => (
      <circle key={i} cx={15 + i * 9} cy={36} r={2.4} fill={color} />
    ))}
  </svg>
);

// Событие «сыноо күнү»: блок с жёлтой полосой слева. add 0…1: блок мягко
// опускается на место и проявляется, затем полоса вырастает сверху вниз.
export const CalendarEvent: React.FC<{
  readonly add: number;
  readonly w: number;
  readonly h: number;
  readonly size: number; // кегль текста
  readonly radius?: number;
  readonly bar?: number;
}> = ({ add, w, h, size, radius = RADIUS.inner, bar = 12 }) => {
  const a = easeOut(clamp(add / 0.6));
  const b = easeInOut(clamp((add - 0.3) / 0.7));
  if (add <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: w,
        height: h,
        borderRadius: radius,
        overflow: "hidden",
        opacity: a,
        transform: `translateY(${(a - 1) * h * 0.22}px)`,
        backgroundColor: C.yellowSoft,
        boxShadow: `0 ${10 * b}px ${24 * b}px rgba(242,185,43,${0.18 * b})`,
        fontFamily: F.text,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: bar,
          backgroundColor: C.yellow,
          transform: `scaleY(${b})`,
          transformOrigin: "50% 0",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: bar + size * 0.7,
          top: 0,
          height: h,
          display: "flex",
          alignItems: "center",
          fontSize: size,
          fontWeight: 800,
          color: C.ink,
          whiteSpace: "nowrap",
        }}
      >
        {EL_TEXT.calendar.what}
      </div>
    </div>
  );
};

// Сетка часов: точки слева и тонкие линии (без подписей времени).
export const HourLines: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly step: number;
  readonly n: number;
  readonly dot?: number;
}> = ({ x, y, w, step, n, dot = 10 }) => (
  <>
    {Array.from({ length: n }, (_, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          left: x,
          top: y + i * step - dot / 2,
          width: w,
          height: dot,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: dot,
            height: dot,
            borderRadius: 999,
            backgroundColor: C.line,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: dot * 3,
            right: 0,
            top: dot / 2 - 1,
            height: 2,
            backgroundColor: C.line,
          }}
        />
      </div>
    ))}
  </>
);

export type CalendarCardProps = {
  readonly reveal?: number; // 0…1: вход карточки
  readonly add?: number; // 0…1: событие «сыноо күнү» появляется и садится на место
  readonly w?: number; // ширина, px (макет — 900)
  readonly x?: number;
  readonly y?: number;
  readonly style?: React.CSSProperties;
};

const PAD = 52;
const GRID_Y = 232;
const STEP = 96;

export const CalendarCard: React.FC<CalendarCardProps> = ({ reveal = 1, add = 0, w = CAL_W, x = 0, y = 0, style }) => {
  const s = w / CAL_W;
  const k = easeOut(clamp(reveal));
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: CAL_H * s,
        ...style,
        opacity: clamp(reveal / 0.6) * Number(style?.opacity ?? 1),
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: CAL_W,
          height: CAL_H,
          transform: `translateY(${(1 - k) * 60}px) scale(${s})`,
          transformOrigin: "0 0",
          backgroundColor: C.card,
          borderRadius: RADIUS.card,
          boxShadow: SHADOW.card,
          fontFamily: F.text,
          color: C.ink,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: PAD,
            top: PAD,
            height: 110,
            display: "flex",
            alignItems: "center",
            gap: 28,
          }}
        >
          <CalendarGlyph size={72} color={C.inkMute} />
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              letterSpacing: -1,
              lineHeight: "110px",
            }}
          >
            {EL_TEXT.calendar.when}
          </div>
        </div>
        <HourLines x={PAD} y={GRID_Y} w={CAL_W - 2 * PAD} step={STEP} n={4} />
        <div
          style={{
            position: "absolute",
            left: PAD + 30,
            top: GRID_Y + 16,
            width: CAL_W - 2 * PAD - 30,
            height: STEP * 2 - 32,
          }}
        >
          <CalendarEvent add={add} w={CAL_W - 2 * PAD - 30} h={STEP * 2 - 32} size={60} />
        </div>
      </div>
    </div>
  );
};
