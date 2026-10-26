// Экран ноутбука папы со стороны папы (через плечо): календарь одного дня.
// Две записи совпадают по времени — «Жолугушуу» и «Мектептен алуу» (15:00).
// Курсор берёт «Жолугушуу» и переносит на 16:00. Без реальных данных и
// без десятков мелких блоков. Снизу — клавиатура и тачпад; палец папы на
// тачпаде двигается вместе с курсором.
import { C, F } from "../theme";
import { KM2_TEXT } from "../script";

const T = KM2_TEXT.calendar;

// x, y — центр верхнего края экрана; w — ширина экрана. drag: 0…1 — запись
// перенесена; grab — запись взята (подсветка).
export const CAL_SCREEN = { x: 540, y: 380, w: 960 } as const;
const SH = CAL_SCREEN.w * 0.62;
const ROW = 150; // высота часа
const COL_X = 220; // начало колонки дня внутри экрана
const TOP0 = 120; // 14:00 внутри экрана

export const calSlot = (hour: number) => TOP0 + (hour - 14) * ROW;
// Точка записи «Жолугушуу» (центр) в мире при доле переноса drag.
export const meetingPoint = (drag: number) => ({
  x: CAL_SCREEN.x - CAL_SCREEN.w / 2 + COL_X + 130,
  y: CAL_SCREEN.y + calSlot(15) + ROW * 0.42 + drag * ROW,
});

export const CalendarScreen: React.FC<{ readonly drag: number; readonly grab: boolean; readonly cursor: { x: number; y: number }; readonly touch: { x: number; y: number } }> = ({ drag, grab, cursor, touch }) => {
  const x0 = CAL_SCREEN.x - CAL_SCREEN.w / 2;
  const y0 = CAL_SCREEN.y;
  const W = CAL_SCREEN.w;
  const full = W - COL_X - 60;
  const blk = (y: number, label: string, time: string, color: string, glow = false, dx = 0, w = full) => (
    <g transform={`translate(${x0 + COL_X + dx} ${y0 + y})`}>
      <rect x={0} y={0} width={w} height={ROW * 0.84} rx={16} fill={color} stroke={glow ? C.navy : "none"} strokeWidth={6} />
      <text x={28} y={56} fontFamily={F.text} fontWeight={800} fontSize={40} fill={C.white}>{label}</text>
      <text x={28} y={104} fontFamily={F.text} fontWeight={500} fontSize={30} fill="rgba(255,255,255,0.85)">{time}</text>
    </g>
  );
  const meetY = calSlot(15) + drag * ROW;
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      {/* рамка и экран */}
      <rect x={x0 - 30} y={y0 - 30} width={W + 60} height={SH + 60} rx={30} fill="#2B2F38" />
      <rect x={x0} y={y0} width={W} height={SH} rx={10} fill="#F7F8FA" />
      <rect x={x0} y={y0} width={W} height={84} fill="#E9EDF3" />
      <text x={x0 + 34} y={y0 + 56} fontFamily={F.text} fontWeight={800} fontSize={38} fill={C.navy}>Календарь</text>
      {[14, 15, 16].map((h) => (
        <g key={h}>
          <line x1={x0 + COL_X - 20} x2={x0 + W - 30} y1={y0 + calSlot(h)} y2={y0 + calSlot(h)} stroke="#DCE1E8" strokeWidth={3} />
          <text x={x0 + 40} y={y0 + calSlot(h) + 42} fontFamily={F.text} fontWeight={800} fontSize={36} fill="#7A8494">{`${h}:00`}</text>
        </g>
      ))}
      {/* мектептен алуу — на месте, 15:00 */}
      {/* до переноса обе записи делят строку 15:00 (совпадают по времени) */}
      {blk(calSlot(15) + 4, T.pickup, T.time1, C.kidGreen, false, full * 0.5 * (1 - drag) + 0, full - full * 0.5 * (1 - drag))}
      {/* жолугушуу — переносится на 16:00 и занимает всю строку */}
      {blk(meetY + 4 + (grab ? -6 : 0), T.meeting, drag > 0.95 ? T.time2 : T.time1, C.blue, grab, 0, full * 0.5 + full * 0.5 * drag - 8)}
      {/* курсор */}
      <path d={`M ${cursor.x} ${cursor.y} l 0 46 l 12 -11 l 10 22 l 9 -4 l -10 -21 l 17 -1 Z`} fill="#FFFFFF" stroke="#1E2235" strokeWidth={3} strokeLinejoin="round" />
      {/* клавиатура и тачпад */}
      <path d={`M ${x0 - 30} ${y0 + SH + 40} L ${x0 + W + 30} ${y0 + SH + 40} L ${x0 + W + 120} ${y0 + SH + 560} L ${x0 - 120} ${y0 + SH + 560} Z`} fill="#C9CED6" />
      {Array.from({ length: 4 }).map((_, r) =>
        Array.from({ length: 11 }).map((__, c) => {
          const k = (r + 1) / 5;
          const lx = x0 - 30 - 90 * k + c * ((W + 60 + 180 * k) / 11);
          return <rect key={`${r}-${c}`} x={lx + 6} y={y0 + SH + 60 + r * 64} width={(W + 60 + 180 * k) / 11 - 12} height={50} rx={8} fill="#E8EBEF" />;
        }),
      )}
      <rect x={CAL_SCREEN.x - 170} y={y0 + SH + 330} width={340} height={190} rx={18} fill="#B8BEC8" />
      <circle cx={touch.x} cy={touch.y} r={6} fill="rgba(0,0,0,0.12)" />
    </svg>
  );
};
export const TOUCHPAD = { x: CAL_SCREEN.x, y: CAL_SCREEN.y + SH + 425 } as const;
